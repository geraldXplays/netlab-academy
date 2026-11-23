import type { SimDevice, Topology } from './types'
import { isRouter } from './types'
import { dev, iface, linkAt, linkUp, longIface, networkOf, normalizeIface, prefixOf, sameSubnet, updateDevice, validIp, validMask, peerOf } from './topology'
import { ping, type ArpCache, type PingResult } from './engine'

export type IosMode = 'user' | 'priv' | 'config' | 'config-if' | 'config-vlan'

export interface IosState {
  mode: IosMode
  /** Interfaces being configured (supports "interface range"). */
  targets: string[]
  vlan?: number
}

export const initialIos = (): IosState => ({ mode: 'user', targets: [] })

export function prompt(d: SimDevice, s: IosState) {
  const h = d.name
  switch (s.mode) {
    case 'user':
      return `${h}>`
    case 'priv':
      return `${h}#`
    case 'config':
      return `${h}(config)#`
    case 'config-if':
      return `${h}(config-if${s.targets.length > 1 ? '-range' : ''})#`
    case 'config-vlan':
      return `${h}(config-vlan)#`
  }
}

/** Does `tok` abbreviate `word` (IOS-style prefix match)? */
const is = (tok: string | undefined, word: string) => !!tok && word.startsWith(tok.toLowerCase())

const INVALID = (line: string) => [`${' '.repeat(Math.max(0, line.search(/\S/)))}^`, "% Invalid input detected at '^' marker.", '']
const INCOMPLETE = ['% Incomplete command.', '']

export interface IosResult {
  topo: Topology
  state: IosState
  out: string[]
  ping?: PingResult
}

/** Status words for "show ip interface brief". */
function ifStatus(t: Topology, d: SimDevice, name: string) {
  const i = iface(d, name)!
  if (!i.up) return ['administratively down', 'down']
  const l = linkAt(t, { dev: d.id, iface: name })
  if (!l || !linkUp(t, l)) return ['down', 'down']
  return ['up', 'up']
}

function linkMessages(t: Topology, d: SimDevice, name: string, nowUp: boolean): string[] {
  const long = longIface(name)
  if (!nowUp) return [``, `%LINK-5-CHANGED: Interface ${long}, changed state to administratively down`, `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${long}, changed state to down`]
  const l = linkAt(t, { dev: d.id, iface: name })
  if (!l) return [``, `%LINK-5-CHANGED: Interface ${long}, changed state to down`]
  const peer = peerOf(l, { dev: d.id, iface: name })
  const pd = dev(t, peer.dev)
  const peerUp = !!(pd && iface(pd, peer.iface)?.up)
  if (!peerUp) return [``, `%LINK-5-CHANGED: Interface ${long}, changed state to down`]
  return [``, `%LINK-5-CHANGED: Interface ${long}, changed state to up`, ``, `%LINEPROTO-5-UPDOWN: Line protocol on Interface ${long}, changed state to up`]
}

function expandRange(d: SimDevice, args: string[]): string[] | null {
  // "fa0/1 - 4", "fa0/1-4", "fa0/1 - fa0/4", "fa0/1 , fa0/3"
  const joined = args.join(' ').replace(/\s*-\s*/g, '-').replace(/\s*,\s*/g, ',')
  const out: string[] = []
  for (const part of joined.split(',')) {
    const [a, b] = part.split('-')
    const start = normalizeIface(a)
    if (!start) return null
    if (!b) {
      out.push(start)
      continue
    }
    const prefix = start.slice(0, start.lastIndexOf('/') + 1)
    const from = Number(start.slice(start.lastIndexOf('/') + 1))
    const endNorm = normalizeIface(b)
    const to = endNorm ? Number(endNorm.slice(endNorm.lastIndexOf('/') + 1)) : Number(b)
    if (!Number.isFinite(to) || to < from) return null
    for (let k = from; k <= to; k++) out.push(`${prefix}${k}`)
  }
  return out.every((n) => iface(d, n)) ? out : null
}

function runningConfig(d: SimDevice): string[] {
  const out = ['Building configuration...', '', 'Current configuration :', '!', 'version 16.9', '!', `hostname ${d.name}`, '!']
  if (d.type === 'switch') {
    for (const [id, name] of Object.entries(d.vlans ?? {})) if (id !== '1') out.push(`vlan ${id}`, ` name ${name}`, '!')
  }
  for (const i of d.ifaces) {
    out.push(`interface ${longIface(i.name)}`)
    if (i.description) out.push(` description ${i.description}`)
    if (d.type === 'switch') {
      if (i.mode === 'trunk') out.push(' switchport mode trunk')
      else if ((i.vlan ?? 1) !== 1) out.push(` switchport access vlan ${i.vlan}`, ' switchport mode access')
    } else {
      out.push(i.ip ? ` ip address ${i.ip} ${i.mask}` : ' no ip address')
    }
    if (!i.up) out.push(' shutdown')
    out.push('!')
  }
  for (const r of d.routes ?? []) out.push(`ip route ${r.net} ${r.mask} ${r.via}`)
  out.push('!', 'end', '')
  return out
}

function showIpIntBrief(t: Topology, d: SimDevice) {
  const pad = (s: string, n: number) => s.padEnd(n)
  const out = [`${pad('Interface', 23)}${pad('IP-Address', 16)}${pad('OK?', 4)}${pad('Method', 7)}${pad('Status', 22)}Protocol`]
  for (const i of d.ifaces) {
    const [st, pr] = ifStatus(t, d, i.name)
    out.push(`${pad(longIface(i.name), 23)}${pad(i.ip ?? 'unassigned', 16)}${pad('YES', 4)}${pad(i.ip ? 'manual' : 'unset', 7)}${pad(st, 22)}${pr}`)
  }
  if (d.type === 'switch') out.push(`${pad('Vlan1', 23)}${pad('unassigned', 16)}${pad('YES', 4)}${pad('unset', 7)}${pad('administratively down', 22)}down`)
  return [...out, '']
}

function showVlanBrief(d: SimDevice) {
  const out = ['', 'VLAN Name                             Status    Ports', '---- -------------------------------- --------- -------------------------------']
  for (const [id, name] of Object.entries(d.vlans ?? { 1: 'default' })) {
    const ports = d.ifaces.filter((i) => i.mode !== 'trunk' && (i.vlan ?? 1) === Number(id)).map((i) => i.name)
    const rows: string[] = []
    for (let k = 0; k < Math.max(1, ports.length); k += 4) rows.push(ports.slice(k, k + 4).join(', '))
    out.push(`${id.padEnd(5)}${name.padEnd(33)}${'active'.padEnd(10)}${rows[0] ?? ''}`)
    for (const r of rows.slice(1)) out.push(`${''.padEnd(48)}${r}`)
  }
  for (const id of ['1002', '1003', '1004', '1005']) out.push(`${id.padEnd(5)}${({ 1002: 'fddi-default', 1003: 'token-ring-default', 1004: 'fddinet-default', 1005: 'trnet-default' } as Record<string, string>)[id].padEnd(33)}active`)
  return [...out, '']
}

function showIpRoute(d: SimDevice) {
  const out = ['Codes: L - local, C - connected, S - static, R - RIP, O - OSPF', '', 'Gateway of last resort is not set', '']
  for (const i of d.ifaces) {
    if (!i.ip || !i.mask || !i.up) continue
    out.push(`C    ${networkOf(i.ip, i.mask)}/${prefixOf(i.mask)} is directly connected, ${longIface(i.name)}`)
    out.push(`L    ${i.ip}/32 is directly connected, ${longIface(i.name)}`)
  }
  for (const r of d.routes ?? []) out.push(`S    ${r.net}/${prefixOf(r.mask)} [1/0] via ${r.via}`)
  return [...out, '']
}

function routerPing(t: Topology, d: SimDevice, ip: string, arp: ArpCache): { out: string[]; res: PingResult } {
  const needsArp = !(arp.get(d.id)?.size)
  const res = ping(t, d.id, ip, arp)
  const marks = res.ok ? (needsArp ? '.!!!!' : '!!!!!') : res.reason === 'no-route' ? 'UUUUU' : '.....'
  const ok = marks.split('').filter((c) => c === '!').length
  return {
    res,
    out: [
      'Type escape sequence to abort.',
      `Sending 5, 100-byte ICMP Echos to ${ip}, timeout is 2 seconds:`,
      marks,
      `Success rate is ${ok * 20} percent (${ok}/5)${ok ? ', round-trip min/avg/max = 0/0/1 ms' : ''}`,
      '',
    ],
  }
}

/** Execute one IOS command line. */
export function runIos(topo: Topology, devId: string, state: IosState, raw: string, arp: ArpCache): IosResult {
  let t = topo
  const d0 = dev(t, devId)!
  const line = raw.trim()
  const s: IosState = { ...state, targets: [...state.targets] }
  if (!line) return { topo: t, state: s, out: [] }
  let tok = line.split(/\s+/)
  const out: string[] = []
  const router = isRouter(d0.type)

  // "do <cmd>" from config modes
  if ((s.mode === 'config' || s.mode === 'config-if' || s.mode === 'config-vlan') && is(tok[0], 'do') && tok.length > 1) {
    const r = runIos(t, devId, { mode: 'priv', targets: [] }, tok.slice(1).join(' '), arp)
    return { topo: r.topo, state: s, out: r.out, ping: r.ping }
  }

  if (tok[0] === '?' ) {
    const help: Record<IosMode, string[]> = {
      user: ['Exec commands:', '  enable     Turn on privileged commands', '  ping       Send echo messages', '  show       Show running system information', '  exit       Exit from the EXEC'],
      priv: ['Exec commands:', '  configure  Enter configuration mode', '  copy       Copy from one file to another', '  ping       Send echo messages', '  show       Show running system information', '  disable    Turn off privileged commands'],
      config: ['Configure commands:', '  hostname   Set system\'s network name', '  interface  Select an interface to configure', ...(router ? ['  ip         Global IP configuration subcommands (ip route)'] : ['  vlan       VLAN commands']), '  end        Exit from configure mode'],
      'config-if': ['Interface configuration commands:', ...(router ? ['  ip address   Set the IP address of an interface'] : ['  switchport   Set switching mode characteristics']), '  shutdown     Shutdown the selected interface', '  no shutdown  Enable the interface', '  description  Interface specific description', '  exit         Exit from interface configuration mode'],
      'config-vlan': ['VLAN configuration commands:', '  name   Ascii name of the VLAN', '  exit   Apply changes, bump revision number, and exit mode'],
    }
    return { topo: t, state: s, out: [...help[s.mode], ''] }
  }

  // Global exits
  if (is(tok[0], 'end') && tok.length === 1 && s.mode !== 'user' && s.mode !== 'priv') return { topo: t, state: { mode: 'priv', targets: [] }, out: [''] }
  if (is(tok[0], 'exit') && tok.length === 1) {
    const back: Record<IosMode, IosMode> = { user: 'user', priv: 'user', config: 'priv', 'config-if': 'config', 'config-vlan': 'config' }
    return { topo: t, state: { mode: back[s.mode], targets: [] }, out: s.mode === 'user' || s.mode === 'priv' ? [''] : [] }
  }

  const exec = s.mode === 'user' || s.mode === 'priv'

  if (exec) {
    if (s.mode === 'user' && is(tok[0], 'enable')) return { topo: t, state: { mode: 'priv', targets: [] }, out: [] }
    if (s.mode === 'priv' && is(tok[0], 'disable')) return { topo: t, state: { mode: 'user', targets: [] }, out: [] }
    if (s.mode === 'priv' && is(tok[0], 'configure')) {
      if (tok[1] && !is(tok[1], 'terminal')) return { topo: t, state: s, out: INVALID(line) }
      return { topo: t, state: { mode: 'config', targets: [] }, out: ['Enter configuration commands, one per line.  End with CNTL/Z.'] }
    }
    if (is(tok[0], 'ping')) {
      if (!tok[1]) return { topo: t, state: s, out: INCOMPLETE }
      if (!validIp(tok[1])) return { topo: t, state: s, out: ['% Unrecognized host or address, or protocol not running.', ''] }
      const { out: o, res } = routerPing(t, d0, tok[1], arp)
      return { topo: t, state: s, out: o, ping: res }
    }
    if (s.mode === 'priv' && (is(tok[0], 'copy') || is(tok[0], 'write'))) {
      return { topo: t, state: s, out: is(tok[0], 'copy') ? ['Destination filename [startup-config]? ', 'Building configuration...', '[OK]', ''] : ['Building configuration...', '[OK]', ''] }
    }
    if (is(tok[0], 'show')) {
      const a = tok[1]
      if (!a) return { topo: t, state: s, out: INCOMPLETE }
      if (is(a, 'running-config') || a.toLowerCase() === 'run') {
        if (s.mode === 'user') return { topo: t, state: s, out: INVALID(line) }
        return { topo: t, state: s, out: runningConfig(d0) }
      }
      if (is(a, 'ip') && is(tok[2], 'interface') && (!tok[3] || is(tok[3], 'brief'))) return { topo: t, state: s, out: showIpIntBrief(t, d0) }
      if (is(a, 'ip') && is(tok[2], 'route') && router) return { topo: t, state: s, out: showIpRoute(d0) }
      if (is(a, 'vlan') && d0.type === 'switch') return { topo: t, state: s, out: showVlanBrief(d0) }
      if (is(a, 'version')) return { topo: t, state: s, out: [`Cisco IOS Software, ${router ? 'ISR4300' : 'C2960'} Software, Version 16.9 (NetLab simulator)`, ''] }
      return { topo: t, state: s, out: INVALID(line) }
    }
    return { topo: t, state: s, out: INVALID(line) }
  }

  /* ------------------------------ config ------------------------------ */
  if (s.mode === 'config') {
    if (is(tok[0], 'hostname')) {
      if (!tok[1]) return { topo: t, state: s, out: INCOMPLETE }
      const name = tok[1].slice(0, 20)
      t = updateDevice(t, devId, (d) => ({ ...d, name }))
      return { topo: t, state: s, out: [] }
    }
    if (is(tok[0], 'interface')) {
      if (!tok[1]) return { topo: t, state: s, out: INCOMPLETE }
      if (is(tok[1], 'range')) {
        const list = expandRange(d0, tok.slice(2))
        if (!list) return { topo: t, state: s, out: INVALID(line) }
        return { topo: t, state: { mode: 'config-if', targets: list }, out: [] }
      }
      const name = normalizeIface(tok.slice(1).join(''))
      if (!name || !iface(d0, name)) return { topo: t, state: s, out: INVALID(line) }
      return { topo: t, state: { mode: 'config-if', targets: [name] }, out: [] }
    }
    if (is(tok[0], 'vlan') && d0.type === 'switch') {
      const id = Number(tok[1])
      if (!Number.isInteger(id) || id < 1 || id > 4094) return { topo: t, state: s, out: INVALID(line) }
      t = updateDevice(t, devId, (d) => ({ ...d, vlans: { ...d.vlans, [id]: d.vlans?.[id] ?? `VLAN${String(id).padStart(4, '0')}` } }))
      return { topo: t, state: { mode: 'config-vlan', targets: [], vlan: id }, out: [] }
    }
    if (router && ((is(tok[0], 'ip') && is(tok[1], 'route')) || (is(tok[0], 'no') && is(tok[1], 'ip') && is(tok[2], 'route')))) {
      const neg = is(tok[0], 'no')
      const [net, mask, via] = tok.slice(neg ? 3 : 2)
      if (!net || !mask || !via) return { topo: t, state: s, out: INCOMPLETE }
      if (!validIp(net) || !validMask(mask) || !validIp(via)) return { topo: t, state: s, out: INVALID(line) }
      if (networkOf(net, mask) !== net) return { topo: t, state: s, out: ['%Inconsistent address and mask', ''] }
      t = updateDevice(t, devId, (d) => ({
        ...d,
        routes: neg ? (d.routes ?? []).filter((r) => !(r.net === net && r.mask === mask && r.via === via)) : [...(d.routes ?? []).filter((r) => !(r.net === net && r.mask === mask)), { net, mask, via }],
      }))
      return { topo: t, state: s, out: [] }
    }
    if (is(tok[0], 'enable') || is(tok[0], 'line') || is(tok[0], 'banner') || is(tok[0], 'service') || is(tok[0], 'no')) {
      return { topo: t, state: s, out: [] } // accepted, not modelled
    }
    return { topo: t, state: s, out: INVALID(line) }
  }

  /* ------------------------------ config-vlan ------------------------------ */
  if (s.mode === 'config-vlan') {
    if (is(tok[0], 'name') && tok[1] && s.vlan) {
      const name = tok.slice(1).join('_').slice(0, 32)
      t = updateDevice(t, devId, (d) => ({ ...d, vlans: { ...d.vlans, [s.vlan!]: name } }))
      return { topo: t, state: s, out: [] }
    }
    if (is(tok[0], 'vlan') || is(tok[0], 'interface')) return runIos(t, devId, { mode: 'config', targets: [] }, line, arp)
    return { topo: t, state: s, out: INVALID(line) }
  }

  /* ------------------------------ config-if ------------------------------ */
  if (is(tok[0], 'interface') || (is(tok[0], 'vlan') && d0.type === 'switch')) return runIos(t, devId, { mode: 'config', targets: [] }, line, arp)
  const neg = is(tok[0], 'no')
  if (neg) tok = tok.slice(1)

  if (is(tok[0], 'shutdown')) {
    for (const name of s.targets) {
      t = updateDevice(t, devId, (d) => ({ ...d, ifaces: d.ifaces.map((i) => (i.name === name ? { ...i, up: neg } : i)) }))
      out.push(...linkMessages(t, dev(t, devId)!, name, neg))
    }
    return { topo: t, state: s, out }
  }
  if (is(tok[0], 'description')) {
    const text = neg ? undefined : tok.slice(1).join(' ')
    for (const name of s.targets) t = updateDevice(t, devId, (d) => ({ ...d, ifaces: d.ifaces.map((i) => (i.name === name ? { ...i, description: text } : i)) }))
    return { topo: t, state: s, out }
  }
  if (is(tok[0], 'ip') && is(tok[1], 'address')) {
    if (!router) return { topo: t, state: s, out: INVALID(line) }
    if (neg) {
      for (const name of s.targets) t = updateDevice(t, devId, (d) => ({ ...d, ifaces: d.ifaces.map((i) => (i.name === name ? { ...i, ip: undefined, mask: undefined } : i)) }))
      return { topo: t, state: s, out }
    }
    const [ip, mask] = [tok[2], tok[3]]
    if (!ip || !mask) return { topo: t, state: s, out: INCOMPLETE }
    if (!validIp(ip) || !validMask(mask)) return { topo: t, state: s, out: INVALID(line) }
    if (networkOf(ip, mask) === ip) return { topo: t, state: s, out: ['Bad mask /' + prefixOf(mask) + ' for address ' + ip, ''] }
    const target = s.targets[0]
    const clash = d0.ifaces.find((i) => i.name !== target && i.ip && i.mask && sameSubnet(i.ip, ip, i.mask))
    if (clash) return { topo: t, state: s, out: [`% ${networkOf(ip, mask)} overlaps with ${longIface(clash.name)}`, ''] }
    t = updateDevice(t, devId, (d) => ({ ...d, ifaces: d.ifaces.map((i) => (i.name === target ? { ...i, ip, mask } : i)) }))
    return { topo: t, state: s, out }
  }
  if (is(tok[0], 'switchport')) {
    if (router) return { topo: t, state: s, out: INVALID(line) }
    if (is(tok[1], 'mode')) {
      const m = is(tok[2], 'trunk') ? 'trunk' : is(tok[2], 'access') ? 'access' : null
      if (!m) return { topo: t, state: s, out: INVALID(line) }
      for (const name of s.targets) t = updateDevice(t, devId, (d) => ({ ...d, ifaces: d.ifaces.map((i) => (i.name === name ? { ...i, mode: m } : i)) }))
      return { topo: t, state: s, out }
    }
    if (is(tok[1], 'access') && is(tok[2], 'vlan')) {
      const id = Number(tok[3])
      if (!Number.isInteger(id) || id < 1 || id > 4094) return { topo: t, state: s, out: INVALID(line) }
      if (!dev(t, devId)!.vlans?.[id]) {
        out.push(`% Access VLAN does not exist. Creating vlan ${id}`)
        t = updateDevice(t, devId, (d) => ({ ...d, vlans: { ...d.vlans, [id]: `VLAN${String(id).padStart(4, '0')}` } }))
      }
      for (const name of s.targets) t = updateDevice(t, devId, (d) => ({ ...d, ifaces: d.ifaces.map((i) => (i.name === name ? { ...i, vlan: neg ? 1 : id } : i)) }))
      return { topo: t, state: s, out }
    }
    return { topo: t, state: s, out: INVALID(line) }
  }
  return { topo: t, state: s, out: INVALID(line) }
}
