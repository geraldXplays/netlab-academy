import type { Endpoint, SimDevice, Topology } from './types'
import { isHost, isRouter } from './types'
import { dev, iface, linkAt, linkUp, peerOf, sameSubnet, validIp, ipInt } from './topology'

/** One frame/packet crossing one cable. */
export interface Hop {
  from: string
  to: string
  link: string
  kind: 'ARP' | 'ICMP'
  /** Reply leg (used for colouring) */
  reply?: boolean
}

export type FailReason = 'no-ip' | 'no-gateway' | 'gateway-unreachable' | 'arp' | 'no-route' | 'ttl' | 'iface-down'

export interface PingResult {
  ok: boolean
  reason?: FailReason
  /** Device where the packet was dropped / that answered "unreachable". */
  failAt?: string
  /** Router IP that reported "Destination host unreachable". */
  unreachableFrom?: string
  hops: Hop[]
  /** L3 devices crossed on the way (for tracert): device id + ingress IP. */
  path: { dev: string; ip?: string }[]
  ttl: number
}

/** ARP caches: deviceId → (ip → mac). Ephemeral, like the real thing. */
export type ArpCache = Map<string, Map<string, string>>

interface Terminal {
  ep: Endpoint
  hops: Hop[]
}

/** A sub-interface sends/receives on its parent's cable with an 802.1Q tag. */
function physical(t: Topology, ep: Endpoint): { ep: Endpoint; vlan: number | null } {
  const d = dev(t, ep.dev)
  const i = d && iface(d, ep.iface)
  if (i?.parent) return { ep: { dev: ep.dev, iface: i.parent }, vlan: i.dot1q ?? null }
  return { ep, vlan: null }
}

/**
 * Layer 2 flood from an interface: walk through switches respecting access
 * VLANs and trunks, stopping at hosts and router interfaces. Returns every
 * L3 endpoint reachable in the same broadcast domain with the cable path.
 */
export function l2Reach(t: Topology, start0: Endpoint): Terminal[] {
  const out: Terminal[] = []
  const sd = dev(t, start0.dev)
  const si = sd && iface(sd, start0.iface)
  if (si?.parent && (!si.up || si.dot1q === undefined)) return out
  const { ep: start, vlan: startVlan } = physical(t, start0)
  const first = linkAt(t, start)
  if (!first || !linkUp(t, first)) return out
  type State = { ep: Endpoint; vlan: number | null; tagged: boolean; hops: Hop[] }
  const queue: State[] = [{ ep: peerOf(first, start), vlan: startVlan, tagged: startVlan !== null, hops: [{ from: start.dev, to: peerOf(first, start).dev, link: first.id, kind: 'ICMP' }] }]
  const seen = new Set<string>()
  while (queue.length) {
    const s = queue.shift()!
    const d = dev(t, s.ep.dev)
    if (!d) continue
    if (d.type !== 'switch') {
      if (s.tagged && s.vlan !== null) {
        // Tagged frame: only a matching router sub-interface accepts it.
        const subif = d.ifaces.find((i) => i.parent === s.ep.iface && i.dot1q === s.vlan && i.up)
        if (subif) out.push({ ep: { dev: d.id, iface: subif.name }, hops: s.hops })
        continue
      }
      out.push({ ep: s.ep, hops: s.hops })
      continue
    }
    const port = iface(d, s.ep.iface)
    if (!port?.up) continue
    // Which VLAN does this frame belong to inside the switch?
    let vlan: number
    if (port.mode === 'trunk') vlan = s.tagged && s.vlan !== null ? s.vlan : 1
    else {
      if (s.tagged && s.vlan !== null && s.vlan !== (port.vlan ?? 1)) continue // tagged frame arriving on a mismatched access port
      vlan = port.vlan ?? 1
    }
    const key = `${d.id}|${vlan}`
    if (seen.has(key)) continue
    seen.add(key)
    for (const p of d.ifaces) {
      if (p.name === port.name || !p.up) continue
      const carries = p.mode === 'trunk' || (p.vlan ?? 1) === vlan
      if (!carries) continue
      const l = linkAt(t, { dev: d.id, iface: p.name })
      if (!l || !linkUp(t, l)) continue
      const peer = peerOf(l, { dev: d.id, iface: p.name })
      queue.push({ ep: peer, vlan, tagged: p.mode === 'trunk', hops: [...s.hops, { from: d.id, to: peer.dev, link: l.id, kind: 'ICMP' }] })
    }
  }
  return out
}

const withKind = (hops: Hop[], kind: Hop['kind'], reply = false) => hops.map((h) => ({ ...h, kind, reply }))
const reverse = (hops: Hop[]) => [...hops].reverse().map((h) => ({ ...h, from: h.to, to: h.from }))

interface Leg {
  ok: boolean
  reason?: FailReason
  at: string
  hops: Hop[]
  arrived?: { dev: SimDevice; iface: string }
}

/** Send from a device interface to a next-hop IP on the same segment (ARP if needed). */
function step(t: Topology, from: SimDevice, out: string, nextHop: string, arp: ArpCache, reply: boolean): Leg {
  const reach = l2Reach(t, { dev: from.id, iface: out })
  const target = reach.find((r) => {
    const d = dev(t, r.ep.dev)
    const i = d && iface(d, r.ep.iface)
    return i?.up && i.ip === nextHop
  })
  const cache = arp.get(from.id) ?? new Map<string, string>()
  arp.set(from.id, cache)
  const hops: Hop[] = []
  if (!cache.has(nextHop)) {
    // ARP request is broadcast across the whole domain; show the path to the owner.
    if (!target) {
      const any = reach[0]?.hops ?? []
      return { ok: false, reason: 'arp', at: from.id, hops: withKind(any, 'ARP', reply) }
    }
    hops.push(...withKind(target.hops, 'ARP', reply), ...withKind(reverse(target.hops), 'ARP', reply))
    const td = dev(t, target.ep.dev)!
    cache.set(nextHop, iface(td, target.ep.iface)!.mac)
    // The owner learns the sender too.
    const fromIface = iface(from, out)
    if (fromIface?.ip) {
      const c2 = arp.get(td.id) ?? new Map<string, string>()
      c2.set(fromIface.ip, fromIface.mac)
      arp.set(td.id, c2)
    }
  }
  if (!target) return { ok: false, reason: 'arp', at: from.id, hops }
  hops.push(...withKind(target.hops, 'ICMP', reply))
  return { ok: true, at: target.ep.dev, hops, arrived: { dev: dev(t, target.ep.dev)!, iface: target.ep.iface } }
}

/** Route a packet from `d` toward `dst` (d may be a host or a router), hop by hop. */
function deliver(t: Topology, d: SimDevice, dst: string, arp: ArpCache, reply: boolean) {
  const hops: Hop[] = []
  const path: { dev: string; ip?: string }[] = []
  let cur = d
  for (let ttl = 16; ttl > 0; ttl--) {
    // Already there? (a device's own address)
    if (cur.ifaces.some((i) => i.ip === dst && i.up)) return { ok: true as const, hops, path, dest: cur }

    let out: string | undefined
    let nextHop: string | undefined
    if (isHost(cur.type)) {
      const nic = cur.ifaces[0]
      if (!nic?.ip || !nic.mask) return { ok: false as const, reason: 'no-ip' as FailReason, at: cur.id, hops, path }
      out = nic.name
      if (sameSubnet(nic.ip, dst, nic.mask)) nextHop = dst
      else {
        if (!cur.gateway || !validIp(cur.gateway)) return { ok: false as const, reason: 'no-gateway' as FailReason, at: cur.id, hops, path }
        if (!sameSubnet(nic.ip, cur.gateway, nic.mask)) return { ok: false as const, reason: 'gateway-unreachable' as FailReason, at: cur.id, hops, path }
        nextHop = cur.gateway
      }
    } else if (isRouter(cur.type)) {
      const connected = cur.ifaces.find((i) => i.up && i.ip && i.mask && sameSubnet(i.ip, dst, i.mask))
      if (connected) {
        out = connected.name
        nextHop = dst
      } else {
        const route = (cur.routes ?? [])
          .filter((r) => ((ipInt(dst) & ipInt(r.mask)) >>> 0) === ipInt(r.net))
          .sort((a, b) => ipInt(b.mask) - ipInt(a.mask))[0]
        const via = route && cur.ifaces.find((i) => i.up && i.ip && i.mask && sameSubnet(i.ip, route.via, i.mask))
        if (!route || !via) {
          const src = cur.ifaces.find((i) => i.up && i.ip)?.ip
          return { ok: false as const, reason: 'no-route' as FailReason, at: cur.id, hops, path, unreachableFrom: src }
        }
        out = via.name
        nextHop = route.via
      }
    } else return { ok: false as const, reason: 'arp' as FailReason, at: cur.id, hops, path }

    const leg = step(t, cur, out!, nextHop!, arp, reply)
    hops.push(...leg.hops)
    if (!leg.ok || !leg.arrived) return { ok: false as const, reason: leg.reason ?? 'arp', at: leg.at, hops, path }
    const next = leg.arrived.dev
    path.push({ dev: next.id, ip: iface(next, leg.arrived.iface)?.ip })
    if (next.ifaces.some((i) => i.ip === dst && i.up)) return { ok: true as const, hops, path, dest: next }
    if (!isRouter(next.type)) return { ok: false as const, reason: 'arp' as FailReason, at: next.id, hops, path }
    cur = next
  }
  return { ok: false as const, reason: 'ttl' as FailReason, at: cur.id, hops, path }
}

/** Full ICMP echo: request to `dst`, then the reply back to the sender. */
export function ping(t: Topology, srcId: string, dst: string, arp: ArpCache): PingResult {
  const src = dev(t, srcId)
  if (!src) return { ok: false, reason: 'no-ip', hops: [], path: [], ttl: 0 }
  const srcIp = src.ifaces.find((i) => i.ip)?.ip
  const req = deliver(t, src, dst, arp, false)
  if (!req.ok) {
    return { ok: false, reason: req.reason, failAt: req.at, hops: req.hops, path: req.path, ttl: 0, unreachableFrom: 'unreachableFrom' in req ? req.unreachableFrom : undefined }
  }
  if (!srcIp) return { ok: false, reason: 'no-ip', hops: req.hops, path: req.path, ttl: 0 }
  const rep = deliver(t, req.dest, srcIp, arp, true)
  const hops = [...req.hops, ...rep.hops.map((h) => ({ ...h, reply: true }))]
  if (!rep.ok) return { ok: false, reason: rep.reason, failAt: rep.at, hops, path: req.path, ttl: 0 }
  const routers = req.path.filter((p) => isRouter(dev(t, p.dev)!.type)).length
  const baseTtl = isRouter(req.dest.type) ? 255 : 128
  return { ok: true, hops, path: req.path, ttl: baseTtl - routers }
}

/** Is there any working ping from a to b's first IP? (used by lab checks) */
export function canPing(t: Topology, aName: string, bIp: string) {
  const a = t.devices.find((d) => d.name === aName)
  if (!a) return false
  return ping(t, a.id, bIp, new Map()).ok
}
