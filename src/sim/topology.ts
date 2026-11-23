import type { DeviceType, Endpoint, Iface, SimDevice, SimLink, Topology } from './types'
import { isRouter } from './types'

/* ------------------------------ IPv4 helpers ------------------------------ */

export const validIp = (s?: string) =>
  !!s && /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(s.trim()) && s.trim().split('.').every((o) => Number(o) <= 255)

export const ipInt = (ip: string) => ip.split('.').reduce((n, o) => ((n << 8) + Number(o)) >>> 0, 0) >>> 0

export const validMask = (m?: string) => {
  if (!validIp(m)) return false
  const n = ipInt(m!)
  const inv = ~n >>> 0
  return ((inv + 1) & inv) === 0 // contiguous ones
}

export const prefixOf = (mask: string) => ipInt(mask).toString(2).split('').filter((b) => b === '1').length

export const sameSubnet = (a: string, b: string, mask: string) => ((ipInt(a) & ipInt(mask)) >>> 0) === ((ipInt(b) & ipInt(mask)) >>> 0)

export const networkOf = (ip: string, mask: string) => {
  const n = (ipInt(ip) & ipInt(mask)) >>> 0
  return [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.')
}

/* ---------------------------- Interface naming ---------------------------- */

const LONG: Record<string, string> = { Fa: 'FastEthernet', Gi: 'GigabitEthernet' }

/** Accepts "g0/0/0", "gi0/0/0", "GigabitEthernet0/0/0", "fa0/1", "f0/1"… → canonical short form "Gi0/0/0". */
export function normalizeIface(input: string): string | null {
  const m = input.trim().match(/^(g|gi|gig|giga|gigabit|gigabitethernet|f|fa|fas|fast|fastethernet)\s*(\d+(?:\/\d+){0,2})$/i)
  if (!m) return null
  return `${m[1].toLowerCase().startsWith('g') ? 'Gi' : 'Fa'}${m[2]}`
}

export const longIface = (short: string) => {
  const k = short.slice(0, 2)
  return LONG[k] ? `${LONG[k]}${short.slice(2)}` : short
}

/* ------------------------------ Device factory ------------------------------ */

let macSeq = Math.floor(Math.random() * 0xffff)
const mac = () => {
  macSeq = (macSeq + 0x1b3) & 0xffffff
  const hex = (0x0060_5c00_0000 + macSeq * 97).toString(16).padStart(12, '0').slice(-12)
  return `${hex.slice(0, 4)}.${hex.slice(4, 8)}.${hex.slice(8, 12)}`.toUpperCase()
}

function ifacesFor(type: DeviceType): Iface[] {
  switch (type) {
    case 'switch':
      return [
        ...Array.from({ length: 24 }, (_, i) => ({ name: `Fa0/${i + 1}`, mac: mac(), up: true, vlan: 1, mode: 'access' as const })),
        { name: 'Gi0/1', mac: mac(), up: true, vlan: 1, mode: 'access' },
        { name: 'Gi0/2', mac: mac(), up: true, vlan: 1, mode: 'access' },
      ]
    case 'router':
      return ['Gi0/0/0', 'Gi0/0/1', 'Gi0/0/2'].map((name) => ({ name, mac: mac(), up: false }))
    case 'firewall':
      return ['Gi1/1', 'Gi1/2', 'Gi1/3', 'Gi1/4'].map((name) => ({ name, mac: mac(), up: false }))
    default:
      return [{ name: 'Fa0', mac: mac(), up: true }]
  }
}

const PREFIX: Record<DeviceType, string> = {
  pc: 'PC', laptop: 'Laptop', server: 'Server', printer: 'Printer', switch: 'Switch', router: 'Router', firewall: 'Firewall',
}

export function createDevice(type: DeviceType, x: number, y: number, topo: Topology, name?: string): SimDevice {
  let n = 0
  const taken = new Set(topo.devices.map((d) => d.name))
  while (taken.has(`${PREFIX[type]}${n}`)) n++
  return {
    id: `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`,
    type,
    name: name ?? `${PREFIX[type]}${n}`,
    x,
    y,
    ifaces: ifacesFor(type),
    ...(type === 'switch' ? { vlans: { 1: 'default' } } : {}),
    ...(isRouter(type) ? { routes: [] } : {}),
  }
}

/* ------------------------------ Lookups ------------------------------ */

export const dev = (t: Topology, id: string) => t.devices.find((d) => d.id === id)
export const devByName = (t: Topology, name: string) => t.devices.find((d) => d.name.toLowerCase() === name.toLowerCase())
export const iface = (d: SimDevice, name: string) => d.ifaces.find((i) => i.name === name)

export const linkAt = (t: Topology, ep: Endpoint) =>
  t.links.find((l) => (l.a.dev === ep.dev && l.a.iface === ep.iface) || (l.b.dev === ep.dev && l.b.iface === ep.iface))

export const peerOf = (l: SimLink, ep: Endpoint): Endpoint => (l.a.dev === ep.dev && l.a.iface === ep.iface ? l.b : l.a)

export const freeIfaces = (t: Topology, d: SimDevice) => d.ifaces.filter((i) => !linkAt(t, { dev: d.id, iface: i.name }))

/** A link carries traffic when both interfaces are administratively up. */
export function linkUp(t: Topology, l: SimLink) {
  const da = dev(t, l.a.dev)
  const db = dev(t, l.b.dev)
  const ia = da && iface(da, l.a.iface)
  const ib = db && iface(db, l.b.iface)
  return !!(ia?.up && ib?.up)
}

export function connect(t: Topology, a: Endpoint, b: Endpoint, cable: SimLink['cable'] = 'straight'): Topology {
  if (linkAt(t, a) || linkAt(t, b) || a.dev === b.dev) return t
  return { ...t, links: [...t.links, { id: `l${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`, a, b, cable }] }
}

export function removeDevice(t: Topology, id: string): Topology {
  return { devices: t.devices.filter((d) => d.id !== id), links: t.links.filter((l) => l.a.dev !== id && l.b.dev !== id) }
}

export const removeLink = (t: Topology, id: string): Topology => ({ ...t, links: t.links.filter((l) => l.id !== id) })

export function updateDevice(t: Topology, id: string, fn: (d: SimDevice) => SimDevice): Topology {
  return { ...t, devices: t.devices.map((d) => (d.id === id ? fn(structuredClone(d)) : d)) }
}

/** The device's primary IP (hosts: its NIC; routers: first configured interface). */
export const primaryIp = (d: SimDevice) => d.ifaces.find((i) => i.ip)?.ip
