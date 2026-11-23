/**
 * Network simulator data model. Plain JSON so a topology can be saved,
 * synced to the cloud and restored exactly.
 */

export type DeviceType = 'pc' | 'laptop' | 'server' | 'printer' | 'switch' | 'router' | 'firewall'

export interface Iface {
  name: string
  mac: string
  /** IPv4 address (hosts, routers). */
  ip?: string
  mask?: string
  /** Administrative state. Router interfaces start shut down, like real IOS. */
  up: boolean
  /** Switch ports: access VLAN and mode. */
  vlan?: number
  mode?: 'access' | 'trunk'
  description?: string
}

export interface Route {
  net: string
  mask: string
  via: string
}

export interface SimDevice {
  id: string
  type: DeviceType
  /** Display name, e.g. "PC0", "Switch0" (also the IOS hostname). */
  name: string
  x: number
  y: number
  ifaces: Iface[]
  /** Hosts */
  gateway?: string
  dns?: string
  /** Routers */
  routes?: Route[]
  /** Switches: VLAN id → name */
  vlans?: Record<number, string>
  /** Locked devices are part of a lab's starting topology and cannot be deleted. */
  locked?: boolean
}

export interface Endpoint {
  dev: string
  iface: string
}

export interface SimLink {
  id: string
  a: Endpoint
  b: Endpoint
  cable: 'straight' | 'cross'
}

export interface Topology {
  devices: SimDevice[]
  links: SimLink[]
}

export const MODELS: Record<DeviceType, string> = {
  pc: 'PC-PT',
  laptop: 'Laptop-PT',
  server: 'Server-PT',
  printer: 'Printer-PT',
  switch: '2960-24TT',
  router: 'ISR4331',
  firewall: 'ASA 5506-X',
}

export const isHost = (t: DeviceType) => t === 'pc' || t === 'laptop' || t === 'server' || t === 'printer'
export const isRouter = (t: DeviceType) => t === 'router' || t === 'firewall'
