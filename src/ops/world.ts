import type { DeviceType, SimDevice, SimLink, Topology } from '@/sim/types'
import { isRouter } from '@/sim/types'
import { createDevice, dev, ipInt, linkAt, linkUp, sameSubnet, validIp } from '@/sim/topology'
import { l2Reach, ping } from '@/sim/engine'
import type { LogEntry, OpsWorld, Os, Svc } from './types'

/* ------------------------------ building ------------------------------ */

export interface DevSpec {
  id: string
  type: DeviceType
  name: string
  x: number
  y: number
  os?: Os
  ip?: string
  mask?: string
  gw?: string
  dns?: string
  /** router / firewall interfaces: name → [ip, mask] */
  ifs?: Record<string, [string, string]>
  /** extra up interfaces without cables (public addresses on the "Internet" router) */
  extra?: [string, string][]
  routes?: [string, string, string][]
  vlans?: Record<number, string>
  /** switch ports: name → vlan | 'trunk' */
  ports?: Record<string, number | 'trunk'>
  dhcp?: boolean
  svcs?: Svc[]
}

const mac = (n: number) => {
  const h = (0x00d0_ba00_0000 + n * 0x1f3).toString(16).padStart(12, '0').slice(-12).toUpperCase()
  return `${h.slice(0, 4)}.${h.slice(4, 8)}.${h.slice(8, 12)}`
}

/** Build a world with stable ids/MACs (scenarios reference ids). */
export function buildWorld(spec: DevSpec[], links: [string, string, string, string][], rest: Partial<OpsWorld> & { clock0: number }): OpsWorld {
  const topo: Topology = { devices: [], links: [] }
  const os: Record<string, Os> = {}
  const svcs: Record<string, Svc[]> = {}
  const dhcpClients: string[] = []
  let m = 1
  for (const s of spec) {
    let d: SimDevice = { ...createDevice(s.type, s.x, s.y, topo, s.name), id: s.id, locked: true }
    d.ifaces = d.ifaces.map((i) => ({ ...i, mac: mac(m++) }))
    if (s.ip) d = { ...d, ifaces: [{ ...d.ifaces[0], ip: s.ip, mask: s.mask ?? '255.255.255.0' }], gateway: s.gw, dns: s.dns }
    else if (s.dns || s.gw) d = { ...d, gateway: s.gw, dns: s.dns }
    if (s.ifs) {
      for (const name of Object.keys(s.ifs)) if (!d.ifaces.some((i) => i.name === name)) d.ifaces.push({ name, mac: mac(m++), up: false })
      d.ifaces = d.ifaces.map((i) => (s.ifs![i.name] ? { ...i, ip: s.ifs![i.name][0], mask: s.ifs![i.name][1], up: true } : i))
    }
    if (s.extra) d.ifaces = [...d.ifaces, ...s.extra.map(([ip, mask], k) => ({ name: `Lo${k}`, mac: mac(m++), ip, mask, up: true }))]
    if (s.routes) d.routes = s.routes.map(([net, mask, via]) => ({ net, mask, via }))
    if (s.vlans) d.vlans = { 1: 'default', ...s.vlans }
    if (s.ports) d.ifaces = d.ifaces.map((i) => (s.ports![i.name] === undefined ? i : s.ports![i.name] === 'trunk' ? { ...i, mode: 'trunk' as const } : { ...i, vlan: s.ports![i.name] as number, mode: 'access' as const }))
    topo.devices.push(d)
    os[s.id] = s.os ?? (s.type === 'switch' || isRouter(s.type) ? 'ios' : s.type === 'server' ? 'winsrv' : 'win')
    if (s.svcs) svcs[s.id] = s.svcs
    if (s.dhcp) dhcpClients.push(s.id)
  }
  topo.links = links.map(([a, ai, b, bi], k): SimLink => ({ id: `L${k}`, a: { dev: a, iface: ai }, b: { dev: b, iface: bi }, cable: 'straight' }))
  const startup: Record<string, SimDevice> = {}
  for (const d of topo.devices) if (os[d.id] === 'ios') startup[d.id] = structuredClone(d)
  return {
    topo, startup, os, svcs, dhcpClients,
    files: {}, disk: {}, accounts: [], external: {}, unplugged: [], logs: [], elapsed: 0, flags: {},
    ...rest,
  }
}

export const svc = (name: string, display: string, port?: number, extra: Partial<Svc> = {}): Svc => ({ name, display, state: 'running', enabled: true, port, ...extra })

export const GB = 1024 ** 3
export const MB = 1024 ** 2

/* ------------------------------ clock & logs ------------------------------ */

export const parseClock = (s: string) => {
  const [h, m] = s.split(':').map(Number)
  return h * 60 + m
}
const two = (n: number) => String(n).padStart(2, '0')
export function stamp(w: OpsWorld, secs = true) {
  const total = w.clock0 * 60 + Math.floor(w.elapsed)
  const h = Math.floor(total / 3600) % 24
  const mi = Math.floor(total / 60) % 60
  return secs ? `${two(h)}:${two(mi)}:${two(total % 60)}` : `${two(h)}:${two(mi)}`
}

export const log = (w: OpsWorld, e: Omit<LogEntry, 't'>): OpsWorld => ({ ...w, logs: [...w.logs, { t: stamp(w), ...e }] })

/* ------------------------------ lookups ------------------------------ */

export const byName = (w: OpsWorld, name: string) => w.topo.devices.find((d) => d.name.toLowerCase() === name.toLowerCase())
export const byIp = (w: OpsWorld, ip: string) => w.topo.devices.find((d) => d.ifaces.some((i) => i.ip === ip))
export const ipOf = (w: OpsWorld, id: string) => dev(w.topo, id)?.ifaces.find((i) => i.ip)?.ip
export const svcOf = (w: OpsWorld, id: string, name: string) => w.svcs[id]?.find((s) => s.name.toLowerCase() === name.toLowerCase() || s.display.toLowerCase() === name.toLowerCase())
export const running = (w: OpsWorld, id: string, name: string) => svcOf(w, id, name)?.state === 'running'

export function setSvc(w: OpsWorld, id: string, name: string, patch: Partial<Svc>): OpsWorld {
  return { ...w, svcs: { ...w.svcs, [id]: (w.svcs[id] ?? []).map((s) => (s.name === name ? { ...s, ...patch } : s)) } }
}

export function diskUsed(w: OpsWorld, id: string) {
  return Object.values(w.files[id] ?? {}).reduce((n, f) => n + f.size, 0)
}
export const diskFull = (w: OpsWorld, id: string) => !!w.disk[id] && diskUsed(w, id) >= w.disk[id] * 0.995

export function human(bytes: number) {
  if (bytes >= GB) return `${(bytes / GB).toFixed(bytes >= 10 * GB ? 0 : 1)}G`
  if (bytes >= MB) return `${Math.round(bytes / MB)}M`
  if (bytes >= 1024) return `${Math.round(bytes / 1024)}K`
  return `${bytes}`
}

/* ------------------------------ network helpers ------------------------------ */

/** Is this host's NIC cabled to something that is up? */
export function nicUp(w: OpsWorld, id: string) {
  const d = dev(w.topo, id)
  if (!d) return false
  const l = linkAt(w.topo, { dev: id, iface: d.ifaces[0].name })
  return !!l && linkUp(w.topo, l)
}

export const reachable = (w: OpsWorld, fromId: string, ip: string) => !!ip && ping(w.topo, fromId, ip, new Map()).ok

const inCidr = (ip: string, cidr: string) => {
  if (cidr === 'any') return true
  const [net, bits] = cidr.split('/')
  if (!bits) return ip === net
  const mask = Number(bits) === 0 ? 0 : (~0 << (32 - Number(bits))) >>> 0
  return ((ipInt(ip) & mask) >>> 0) === ((ipInt(net) & mask) >>> 0)
}

export function fwVerdict(w: OpsWorld, src: string, dst: string, port: number) {
  const rule = w.fw?.rules.find((r) => r.enabled && inCidr(src, r.src) && inCidr(dst, r.dst) && (r.port === 'any' || r.port === port))
  return { allow: rule?.action === 'allow', rule }
}

export type PortResult = 'ok' | 'unreachable' | 'blocked' | 'refused'

/** TCP connection test: routing, then firewall policy (if the path crosses it), then the listening service. */
export function tcp(w: OpsWorld, fromId: string, dstIp: string, port: number): PortResult {
  const res = ping(w.topo, fromId, dstIp, new Map())
  if (!res.ok) return 'unreachable'
  if (w.fw && res.path.some((p) => p.dev === w.fw!.dev)) {
    const src = ipOf(w, fromId) ?? '0.0.0.0'
    if (!fwVerdict(w, src, dstIp, port).allow) return 'blocked'
  }
  const target = byIp(w, dstIp)
  if (!target) return 'refused'
  // Public Internet: anything on 80/443 answers.
  if (target.ifaces.some((i) => i.name.startsWith('Lo') && i.ip === dstIp) && (port === 80 || port === 443)) return 'ok'
  const s = w.svcs[target.id]?.find((x) => x.port === port)
  return s?.state === 'running' ? 'ok' : 'refused'
}

export type Resolve = { ip: string; server?: string } | { err: 'no-dns' | 'timeout' | 'nxdomain'; server?: string }

/** DNS lookup from a client, using the DNS server configured on it. */
export function resolve(w: OpsWorld, fromId: string, name: string): Resolve {
  const n = name.toLowerCase().replace(/\.$/, '')
  if (validIp(n)) return { ip: n }
  const d = dev(w.topo, fromId)
  if (!d) return { err: 'no-dns' }
  // Hosts file of every machine knows itself.
  if (n === d.name.toLowerCase()) return { ip: ipOf(w, fromId) ?? '127.0.0.1' }
  const server = d.dns
  if (!server || !validIp(server)) return { err: 'no-dns' }
  const srv = byIp(w, server)
  if (!srv || !reachable(w, fromId, server)) return { err: 'timeout', server }
  const pub = w.external[n]
  // A public resolver (on the "Internet" router) only knows public names.
  if (!w.dns || srv.id !== w.dns.server) return pub ? { ip: pub, server } : { err: 'nxdomain', server }
  if (!running(w, srv.id, 'dns')) return { err: 'timeout', server }
  const zone = w.dns.zone.toLowerCase()
  const short = n.endsWith(`.${zone}`) ? n.slice(0, -zone.length - 1) : n
  const rec = w.dns.records[short] ?? (n === zone ? w.dns.records['@'] : undefined)
  if (rec) return { ip: rec, server }
  if (n.endsWith(zone)) return { err: 'nxdomain', server }
  if (pub && reachable(w, srv.id, w.dns.forwarder)) return { ip: pub, server }
  return pub ? { err: 'timeout', server } : { err: 'nxdomain', server }
}

/* ------------------------------ DHCP ------------------------------ */

const intIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.')

export function renew(w: OpsWorld, id: string): { world: OpsWorld; ok: boolean; reason?: 'link' | 'no-server' | 'exhausted' } {
  const d = dev(w.topo, id)!
  const nic = d.ifaces[0]
  const apipa = (reason: 'link' | 'no-server' | 'exhausted') => {
    const ip = `169.254.${(parseInt(nic.mac.slice(-4, -2), 16) % 254) + 1}.${(parseInt(nic.mac.slice(-2), 16) % 254) + 1}`
    return { world: setHostIp(w, id, reason === 'link' ? undefined : ip, reason === 'link' ? undefined : '255.255.0.0', undefined, d.dns), ok: false, reason }
  }
  if (!nicUp(w, id)) return apipa('link')
  if (!w.dhcp || !running(w, w.dhcp.server, 'dhcp')) return apipa('no-server')
  const reach = l2Reach(w.topo, { dev: id, iface: nic.name })
  let scope = undefined as undefined | (typeof w.dhcp.scopes)[number]
  for (const r of reach) {
    const rd = dev(w.topo, r.ep.dev)
    const ri = rd?.ifaces.find((i) => i.name === r.ep.iface)
    if (!rd || !ri?.ip || !ri.mask) continue
    const sc = w.dhcp.scopes.find((s) => s.active && sameSubnet(s.router, ri.ip!, ri.mask!))
    if (!sc) continue
    // Direct (server on the segment) or relayed by the router.
    if (rd.id === w.dhcp.server || (isRouter(rd.type) && reachable(w, rd.id, ipOf(w, w.dhcp.server)!))) {
      scope = sc
      break
    }
  }
  if (!scope) return apipa('no-server')
  let lease = scope.leases.find((l) => l.mac === nic.mac)
  let scopes = w.dhcp.scopes
  if (!lease) {
    const taken = new Set(scope.leases.map((l) => l.ip))
    for (let n = ipInt(scope.start); n <= ipInt(scope.end); n++) {
      const ip = intIp(n)
      if (!taken.has(ip) && !byIp(w, ip)) {
        lease = { mac: nic.mac, ip, host: d.name }
        break
      }
    }
    if (!lease) return apipa('exhausted')
    const l = lease
    scopes = scopes.map((s) => (s === scope ? { ...s, leases: [...s.leases, l] } : s))
  }
  const w2 = setHostIp({ ...w, dhcp: { ...w.dhcp, scopes } }, id, lease.ip, scope.mask, scope.router, scope.dns)
  return { world: w2, ok: true }
}

export function setHostIp(w: OpsWorld, id: string, ip?: string, mask?: string, gw?: string, dns?: string): OpsWorld {
  return {
    ...w,
    topo: {
      ...w.topo,
      devices: w.topo.devices.map((d) => (d.id === id ? { ...d, gateway: gw, dns, ifaces: d.ifaces.map((i, k) => (k === 0 ? { ...i, ip, mask } : i)) } : d)),
    },
  }
}

/* ------------------------------ power ------------------------------ */

/** Power-cycle a server/host: enabled services come back, manual ones stay stopped, DHCP clients renew. */
export function powerCycle(w: OpsWorld, id: string, startCheck?: (w: OpsWorld, id: string, s: string) => string | null): OpsWorld {
  let out: OpsWorld = { ...w, svcs: { ...w.svcs, [id]: (w.svcs[id] ?? []).map((s) => ({ ...s, state: s.enabled ? 'running' : 'stopped' })) } }
  for (const s of out.svcs[id] ?? []) {
    if (s.state !== 'running') continue
    const why = startCheck?.(out, id, s.name) ?? (s.writes && diskFull(out, id) ? 'No space left on device' : null)
    if (why) out = setSvc(out, id, s.name, { state: 'failed' })
  }
  if (out.dhcpClients.includes(id)) out = renew(out, id).world
  return out
}

/** Every host lists itself; used by the map's monitoring colours. */
export function hostHealthy(w: OpsWorld, id: string, nms: string) {
  const ip = ipOf(w, id)
  if (!ip || ip.startsWith('169.254')) return false
  return reachable(w, nms, ip)
}
