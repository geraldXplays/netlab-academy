import type { L } from '@/content/types'
import type { Iface, SimDevice, Topology } from '@/sim/types'

const nic = (name: string, mac: string, ip?: string, mask = '255.255.255.0', extra: Partial<Iface> = {}): Iface => ({ name, mac, ip, mask: ip ? mask : undefined, up: true, ...extra })
const port = (name: string, mac: string, vlan = 1, mode: 'access' | 'trunk' = 'access'): Iface => ({ name, mac, up: true, vlan, mode })

/** Explorer campus: two VLANs routed on a stick, a /30 WAN link and a server LAN. */
export function campus(): Topology {
  const devices: SimDevice[] = [
    { id: 'pca', type: 'pc', name: 'PC-A', x: 90, y: 430, ifaces: [nic('Fa0', '00:50:79:AA:00:0A', '10.10.0.10')], gateway: '10.10.0.1' },
    { id: 'pcb', type: 'pc', name: 'PC-B', x: 230, y: 470, ifaces: [nic('Fa0', '00:50:79:BB:00:0B', '10.10.0.11')], gateway: '10.10.0.1' },
    { id: 'pcc', type: 'laptop', name: 'PC-C', x: 370, y: 430, ifaces: [nic('Fa0', '00:50:79:CC:00:0C', '10.20.0.10')], gateway: '10.20.0.1' },
    {
      id: 'sw1', type: 'switch', name: 'SW1', x: 230, y: 300,
      ifaces: [port('Fa0/1', '00:1E:14:01:00:01', 10), port('Fa0/2', '00:1E:14:01:00:02', 10), port('Fa0/3', '00:1E:14:01:00:03', 20), port('Gi0/1', '00:1E:14:01:00:19', 1, 'trunk')],
      vlans: { 1: 'default', 10: 'USERS', 20: 'GUESTS' },
    },
    {
      id: 'r1', type: 'router', name: 'R1', x: 360, y: 150,
      ifaces: [
        nic('Gi0/0/0', '00:A1:00:00:00:01'),
        nic('Gi0/0/0.10', '00:A1:00:00:00:01', '10.10.0.1', '255.255.255.0', { parent: 'Gi0/0/0', dot1q: 10 }),
        nic('Gi0/0/0.20', '00:A1:00:00:00:01', '10.20.0.1', '255.255.255.0', { parent: 'Gi0/0/0', dot1q: 20 }),
        nic('Gi0/0/1', '00:A1:00:00:00:02', '10.0.12.1', '255.255.255.252'),
      ],
      routes: [{ net: '192.168.50.0', mask: '255.255.255.0', via: '10.0.12.2' }],
    },
    {
      id: 'r2', type: 'router', name: 'R2', x: 640, y: 150,
      ifaces: [nic('Gi0/0/1', '00:B2:00:00:00:02', '10.0.12.2', '255.255.255.252'), nic('Gi0/0/0', '00:B2:00:00:00:01', '192.168.50.1')],
      routes: [{ net: '0.0.0.0', mask: '0.0.0.0', via: '10.0.12.1' }],
    },
    {
      id: 'sw2', type: 'switch', name: 'SW2', x: 770, y: 300,
      ifaces: [port('Fa0/1', '00:1E:14:02:00:01'), port('Fa0/2', '00:1E:14:02:00:02'), port('Gi0/1', '00:1E:14:02:00:19')],
      vlans: { 1: 'default' },
    },
    { id: 'web', type: 'server', name: 'SRV-WEB', x: 680, y: 440, ifaces: [nic('Fa0', '00:0C:29:5E:B0:10', '192.168.50.10')], gateway: '192.168.50.1' },
    { id: 'dns', type: 'server', name: 'SRV-DNS', x: 870, y: 440, ifaces: [nic('Fa0', '00:0C:29:D0:53:53', '192.168.50.53')], gateway: '192.168.50.1' },
  ]
  const L = (id: string, a: string, ai: string, b: string, bi: string) => ({ id, a: { dev: a, iface: ai }, b: { dev: b, iface: bi }, cable: 'straight' as const })
  return {
    devices,
    links: [
      L('l1', 'pca', 'Fa0', 'sw1', 'Fa0/1'),
      L('l2', 'pcb', 'Fa0', 'sw1', 'Fa0/2'),
      L('l3', 'pcc', 'Fa0', 'sw1', 'Fa0/3'),
      L('l4', 'sw1', 'Gi0/1', 'r1', 'Gi0/0/0'),
      L('l5', 'r1', 'Gi0/0/1', 'r2', 'Gi0/0/1'),
      L('l6', 'r2', 'Gi0/0/0', 'sw2', 'Gi0/1'),
      L('l7', 'sw2', 'Fa0/1', 'web', 'Fa0'),
      L('l8', 'sw2', 'Fa0/2', 'dns', 'Fa0'),
    ],
  }
}

export type FaultId = 'gw' | 'vlan' | 'route' | 'shut'
export const FAULTS: { id: FaultId; label: L; hint: L }[] = [
  { id: 'gw', label: { en: 'PC-C wrong gateway', fr: 'Mauvaise passerelle PC-C' }, hint: { en: 'PC-C’s gateway is set to 10.20.0.254. Try PC-C → SRV-WEB.', fr: 'La passerelle de PC-C vaut 10.20.0.254. Essayez PC-C → SRV-WEB.' } },
  { id: 'vlan', label: { en: 'PC-B in wrong VLAN', fr: 'PC-B dans le mauvais VLAN' }, hint: { en: 'SW1 Fa0/2 is in VLAN 20. Try PC-A → PC-B.', fr: 'SW1 Fa0/2 est dans le VLAN 20. Essayez PC-A → PC-B.' } },
  { id: 'route', label: { en: 'R2 lost its default route', fr: 'R2 a perdu sa route par défaut' }, hint: { en: 'The request arrives… but can the reply come back? Try PC-A → SRV-WEB.', fr: 'La requête arrive… mais la réponse peut-elle revenir ? Essayez PC-A → SRV-WEB.' } },
  { id: 'shut', label: { en: 'R1 Gi0/0/1 shut down', fr: 'R1 Gi0/0/1 éteinte' }, hint: { en: 'The WAN link is administratively down. Try PC-A → SRV-DNS.', fr: 'Le lien WAN est administrativement down. Essayez PC-A → SRV-DNS.' } },
]

export function applyFaults(t: Topology, faults: Set<FaultId>): Topology {
  const x: Topology = JSON.parse(JSON.stringify(t))
  const d = (id: string) => x.devices.find((v) => v.id === id)!
  if (faults.has('gw')) d('pcc').gateway = '10.20.0.254'
  if (faults.has('vlan')) d('sw1').ifaces.find((i) => i.name === 'Fa0/2')!.vlan = 20
  if (faults.has('route')) d('r2').routes = []
  if (faults.has('shut')) d('r1').ifaces.find((i) => i.name === 'Gi0/0/1')!.up = false
  return x
}

export const PRESETS: { src: string; dst: string; label: L }[] = [
  { src: 'pca', dst: '10.10.0.11', label: { en: 'Same VLAN', fr: 'Même VLAN' } },
  { src: 'pca', dst: '10.20.0.10', label: { en: 'Inter-VLAN', fr: 'Inter-VLAN' } },
  { src: 'pca', dst: '192.168.50.10', label: { en: 'Across 2 routers', fr: 'À travers 2 routeurs' } },
  { src: 'pcc', dst: '192.168.50.53', label: { en: 'Guest → DNS', fr: 'Invité → DNS' } },
]
