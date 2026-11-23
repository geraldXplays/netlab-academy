/**
 * Meridian Logistics — the virtual company most incidents take place in.
 *
 *   INTERNET (ISP) ── FW-EDGE ── R-CORE ─┬─ SW-ADMIN  (Admin, 10.10.10.0/24, DHCP)
 *        │               │               ├─ SW-SRV    (Servers, 10.10.99.0/24)
 *     PROBE           SHOP01 (DMZ)       └─ SW-SALES  (Sales, 10.10.20.0/24, DHCP)
 */
import type { Account, OpsWorld } from '@/ops/types'
import { buildWorld, GB, MB, parseClock, renew, svc, type DevSpec } from '@/ops/world'
import { dev } from '@/sim/topology'

export const ID = {
  ISP: 'isp', PROBE: 'probe', FW: 'fw', SHOP: 'shop01', CORE: 'rcore',
  SWADM: 'swadm', SWSRV: 'swsrv', SWSAL: 'swsal',
  DC: 'dc01', FS: 'fs01', WEB: 'web01', APP: 'app01', IT: 'itpc',
  ADM1: 'adm1', ADM2: 'adm2', ADM3: 'adm3', PRN: 'prn1',
  SAL1: 'sal1', SAL2: 'sal2', SAL3: 'sal3', SALLT: 'sallt',
} as const

const M24 = '255.255.255.0'
const M30 = '255.255.255.252'
const H = '255.255.255.255'

export const ACCOUNTS: Account[] = [
  { sam: 'mmartin', name: 'Marie Martin', dept: 'Sales', enabled: true, locked: false, badCount: 0, pwdExpired: false, groups: ['GG-Sales', 'VPN-Users'] },
  { sam: 'jdubois', name: 'Julien Dubois', dept: 'Admin', enabled: true, locked: false, badCount: 0, pwdExpired: false, groups: ['GG-Admin'] },
  { sam: 'skone', name: 'Sarah Koné', dept: 'Admin', enabled: true, locked: false, badCount: 0, pwdExpired: false, groups: ['GG-Admin', 'GG-Finance'] },
  { sam: 'tnguyen', name: 'Tom Nguyen', dept: 'Sales', enabled: true, locked: false, badCount: 0, pwdExpired: false, groups: ['GG-Sales'] },
  { sam: 'lpetit', name: 'Lucas Petit', dept: 'Sales', enabled: true, locked: false, badCount: 0, pwdExpired: false, groups: ['GG-Sales'] },
  { sam: 'abenali', name: 'Amina Benali', dept: 'IT', enabled: true, locked: false, badCount: 0, pwdExpired: false, groups: ['Domain Admins', 'GG-IT'] },
  { sam: 'old.intern', name: 'Former Intern', dept: 'IT', enabled: false, locked: false, badCount: 0, pwdExpired: true, groups: ['GG-IT'] },
]

export const USERS: Record<string, string> = {
  [ID.ADM1]: 'jdubois', [ID.ADM2]: 'skone', [ID.ADM3]: 'new.hire', [ID.SAL1]: 'mmartin', [ID.SAL2]: 'tnguyen', [ID.SAL3]: 'lpetit', [ID.SALLT]: 'mmartin', [ID.IT]: 'abenali',
}

const SPEC: DevSpec[] = [
  { id: ID.ISP, type: 'router', name: 'INTERNET', x: 550, y: 40, ifs: { 'Gi0/0/0': ['203.0.113.1', M30], 'Gi0/0/1': ['198.51.100.1', M24] },
    extra: [['8.8.8.8', H], ['142.250.74.46', H], ['20.70.246.20', H], ['140.82.112.3', H]],
    routes: [['10.10.0.0', '255.255.0.0', '203.0.113.2'], ['172.16.50.0', M24, '203.0.113.2']] },
  { id: ID.PROBE, type: 'server', name: 'UPTIME-PROBE', x: 820, y: 40, os: 'linux', ip: '198.51.100.10', gw: '198.51.100.1', dns: '8.8.8.8' },
  { id: ID.FW, type: 'firewall', name: 'FW-EDGE', x: 550, y: 118, ifs: { 'Gi1/1': ['203.0.113.2', M30], 'Gi1/2': ['10.10.0.1', M30], 'Gi1/3': ['172.16.50.1', M24] },
    routes: [['10.10.0.0', '255.255.0.0', '10.10.0.2'], ['0.0.0.0', '0.0.0.0', '203.0.113.1']] },
  { id: ID.SHOP, type: 'server', name: 'SHOP01', x: 820, y: 118, os: 'linux', ip: '172.16.50.10', gw: '172.16.50.1', dns: '8.8.8.8',
    svcs: [svc('nginx', 'nginx - high performance web server', 443), svc('ssh', 'OpenBSD Secure Shell server', 22), svc('mysql', 'MySQL Community Server', 3306, { writes: true })] },
  { id: ID.CORE, type: 'router', name: 'R-CORE', x: 550, y: 195,
    ifs: { 'Gi0/0/0': ['10.10.0.2', M30], 'Gi0/0/1': ['10.10.10.1', M24], 'Gi0/0/2': ['10.10.99.1', M24], 'Gi0/1/0': ['10.10.20.1', M24] },
    routes: [['0.0.0.0', '0.0.0.0', '10.10.0.1']] },
  { id: ID.SWADM, type: 'switch', name: 'SW-ADMIN', x: 220, y: 282, vlans: { 10: 'ADMIN' }, ports: { 'Gi0/1': 10, 'Fa0/1': 10, 'Fa0/2': 10, 'Fa0/3': 10, 'Fa0/4': 10, 'Fa0/5': 10 } },
  { id: ID.SWSRV, type: 'switch', name: 'SW-SRV', x: 550, y: 282, vlans: { 99: 'SERVERS' }, ports: Object.fromEntries(['Gi0/1', 'Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4', 'Fa0/5'].map((p) => [p, 99])) },
  { id: ID.SWSAL, type: 'switch', name: 'SW-SALES', x: 880, y: 282, vlans: { 20: 'SALES' }, ports: Object.fromEntries(['Gi0/1', 'Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4'].map((p) => [p, 20])) },
  { id: ID.DC, type: 'server', name: 'DC01', x: 410, y: 392, ip: '10.10.99.10', gw: '10.10.99.1', dns: '127.0.0.1',
    svcs: [svc('adds', 'Active Directory Domain Services', 389), svc('dns', 'DNS Server', 53), svc('dhcp', 'DHCP Server', 67), svc('netlogon', 'Netlogon'), svc('w32time', 'Windows Time')] },
  { id: ID.FS, type: 'server', name: 'FS01', x: 485, y: 392, ip: '10.10.99.20', gw: '10.10.99.1', dns: '10.10.99.10',
    svcs: [svc('lanmanserver', 'Server (SMB file sharing)', 445), svc('veeamagent', 'Veeam Agent for Windows')] },
  { id: ID.WEB, type: 'server', name: 'WEB01', x: 560, y: 392, os: 'linux', ip: '10.10.99.30', gw: '10.10.99.1', dns: '10.10.99.10',
    svcs: [svc('nginx', 'nginx - high performance web server', 80), svc('ssh', 'OpenBSD Secure Shell server', 22)] },
  { id: ID.APP, type: 'server', name: 'APP01', x: 635, y: 392, os: 'linux', ip: '10.10.99.40', gw: '10.10.99.1', dns: '10.10.99.10',
    svcs: [svc('mysql', 'MySQL Community Server', 3306, { writes: true }), svc('crm', 'Meridian CRM application', 443, { writes: true }), svc('ssh', 'OpenBSD Secure Shell server', 22)] },
  { id: ID.IT, type: 'pc', name: 'IT-PC', x: 710, y: 392, ip: '10.10.99.50', gw: '10.10.99.1', dns: '10.10.99.10' },
  { id: ID.ADM1, type: 'pc', name: 'ADM-PC1', x: 70, y: 392, dhcp: true },
  { id: ID.ADM2, type: 'pc', name: 'ADM-PC2', x: 150, y: 392, dhcp: true },
  { id: ID.ADM3, type: 'pc', name: 'ADM-PC3', x: 230, y: 392, dhcp: true },
  { id: ID.PRN, type: 'printer', name: 'ADM-PRN', x: 310, y: 392, ip: '10.10.10.200', gw: '10.10.10.1' },
  { id: ID.SAL1, type: 'pc', name: 'SAL-PC1', x: 800, y: 392, dhcp: true },
  { id: ID.SAL2, type: 'pc', name: 'SAL-PC2', x: 880, y: 392, dhcp: true },
  { id: ID.SAL3, type: 'pc', name: 'SAL-PC3', x: 960, y: 392, dhcp: true },
  { id: ID.SALLT, type: 'laptop', name: 'SAL-LAPTOP', x: 1040, y: 392, dhcp: true },
]

const LINKS: [string, string, string, string][] = [
  [ID.ISP, 'Gi0/0/0', ID.FW, 'Gi1/1'],
  [ID.ISP, 'Gi0/0/1', ID.PROBE, 'Fa0'],
  [ID.FW, 'Gi1/3', ID.SHOP, 'Fa0'],
  [ID.FW, 'Gi1/2', ID.CORE, 'Gi0/0/0'],
  [ID.CORE, 'Gi0/0/1', ID.SWADM, 'Gi0/1'],
  [ID.CORE, 'Gi0/0/2', ID.SWSRV, 'Gi0/1'],
  [ID.CORE, 'Gi0/1/0', ID.SWSAL, 'Gi0/1'],
  [ID.SWSRV, 'Fa0/1', ID.DC, 'Fa0'],
  [ID.SWSRV, 'Fa0/2', ID.FS, 'Fa0'],
  [ID.SWSRV, 'Fa0/3', ID.WEB, 'Fa0'],
  [ID.SWSRV, 'Fa0/4', ID.APP, 'Fa0'],
  [ID.SWSRV, 'Fa0/5', ID.IT, 'Fa0'],
  [ID.SWADM, 'Fa0/1', ID.ADM1, 'Fa0'],
  [ID.SWADM, 'Fa0/2', ID.ADM2, 'Fa0'],
  [ID.SWADM, 'Fa0/3', ID.ADM3, 'Fa0'],
  [ID.SWADM, 'Fa0/4', ID.PRN, 'Fa0'],
  [ID.SWSAL, 'Fa0/1', ID.SAL1, 'Fa0'],
  [ID.SWSAL, 'Fa0/2', ID.SAL2, 'Fa0'],
  [ID.SWSAL, 'Fa0/3', ID.SAL3, 'Fa0'],
  [ID.SWSAL, 'Fa0/4', ID.SALLT, 'Fa0'],
]

const BASE_LOGS: OpsWorld['logs'] = [
  { t: '06:00:02', src: 'DC01', level: 'info', id: 7036, svc: 'w32time', msg: 'The Windows Time service is synchronizing with time.windows.com.' },
  { t: '06:02:11', src: 'APP01', level: 'info', svc: 'systemd', msg: 'Started Daily apt download activities.' },
  { t: '06:30:00', src: 'FS01', level: 'info', id: 190, svc: 'veeamagent', msg: 'Backup job "FS01-Daily" finished with Success. Processed 182 GB.' },
  { t: '07:05:44', src: 'R-CORE', level: 'info', svc: 'SYS-6-LOGGINGHOST_STARTSTOP', msg: 'Logging to host 10.10.99.50 port 514 started - CLI initiated' },
  { t: '07:30:12', src: 'WEB01', level: 'info', svc: 'nginx', msg: '10.10.10.104 - - "GET /index.html HTTP/1.1" 200 5120' },
]

export interface HqOptions {
  start: string
  /** tweak the device specs before building */
  spec?: (s: DevSpec[]) => DevSpec[]
  links?: (l: [string, string, string, string][]) => [string, string, string, string][]
  /** final mutation after DHCP clients obtained their addresses */
  after?: (w: OpsWorld) => OpsWorld
  /** mutation before DHCP clients ask for addresses (e.g. break the network first) */
  before?: (w: OpsWorld) => OpsWorld
  logs?: OpsWorld['logs']
  admin?: { size: number; range: [string, string]; lease?: number }
  sales?: { range: [string, string]; lease?: number; dns?: string; leases?: { mac: string; ip: string; host: string }[] }
}

export function hq(o: HqOptions): OpsWorld {
  const spec = o.spec ? o.spec(structuredClone(SPEC)) : SPEC
  let w = buildWorld(spec, o.links ? o.links(LINKS.map((l) => [...l] as [string, string, string, string])) : LINKS, {
    clock0: parseClock(o.start),
    accounts: structuredClone(ACCOUNTS),
    external: {
      'google.com': '142.250.74.46', 'www.google.com': '142.250.74.46', 'microsoft.com': '20.70.246.20', 'www.microsoft.com': '20.70.246.20',
      'github.com': '140.82.112.3', 'meridian-shop.com': '172.16.50.10', 'www.meridian-shop.com': '172.16.50.10', 'dns.google': '8.8.8.8',
    },
    dns: {
      server: ID.DC, zone: 'corp.local', forwarder: '8.8.8.8',
      records: { '@': '10.10.99.10', dc01: '10.10.99.10', fs01: '10.10.99.20', web01: '10.10.99.30', intranet: '10.10.99.30', app01: '10.10.99.40', crm: '10.10.99.40', 'it-pc': '10.10.99.50', 'adm-prn': '10.10.10.200' },
    },
    dhcp: {
      server: ID.DC,
      scopes: [
        { id: '10.10.10.0', name: 'Admin', start: o.admin?.range[0] ?? '10.10.10.100', end: o.admin?.range[1] ?? '10.10.10.150', mask: M24, router: '10.10.10.1', dns: '10.10.99.10', leaseHours: o.admin?.lease ?? 192, active: true, leases: [] },
        { id: '10.10.20.0', name: 'Sales', start: o.sales?.range[0] ?? '10.10.20.100', end: o.sales?.range[1] ?? '10.10.20.150', mask: M24, router: '10.10.20.1', dns: o.sales?.dns ?? '10.10.99.10', leaseHours: o.sales?.lease ?? 192, active: true, leases: o.sales?.leases ?? [] },
      ],
    },
    logs: [...BASE_LOGS, ...(o.logs ?? [])].sort((a, b) => a.t.localeCompare(b.t)),
    flags: { dc: ID.DC, users: USERS, shares: { fs01: ['Admin', 'Sales', 'Public', 'IT'], 'fs01.corp.local': ['Admin', 'Sales', 'Public', 'IT'] } },
  })
  w.files[ID.APP] = baseLinuxFiles({ '/var/lib/mysql/crm/customers.ibd': { size: 6.2 * GB, critical: true }, '/var/lib/mysql/crm/orders.ibd': { size: 3.9 * GB, critical: true }, '/opt/crm/app.jar': { size: 180 * MB } })
  w.disk[ID.APP] = 40 * GB
  w.files[ID.WEB] = baseLinuxFiles({ '/var/www/intranet/index.html': { size: 5120 } })
  w.disk[ID.WEB] = 30 * GB
  w.files[ID.SHOP] = baseLinuxFiles({ '/var/www/shop/index.php': { size: 8 * 1024 }, '/var/lib/mysql/shop/orders.ibd': { size: 2.1 * GB, critical: true } })
  w.disk[ID.SHOP] = 30 * GB
  if (o.before) w = o.before(w)
  for (const c of w.dhcpClients) w = renew(w, c).world
  if (o.after) w = o.after(w)
  return w
}

function baseLinuxFiles(extra: OpsWorld['files'][string]): OpsWorld['files'][string] {
  return {
    '/usr/lib/x86_64-linux-gnu/libc.so.6': { size: 2.2 * MB },
    '/usr/share/base': { size: 4.1 * GB },
    '/var/cache/apt/archives/pkgs.deb': { size: 410 * MB },
    '/var/log/syslog': { size: 38 * MB },
    '/var/log/auth.log': { size: 6 * MB, critical: true },
    '/var/log/kern.log': { size: 3 * MB },
    '/home/admin/.bash_history': { size: 4 * 1024 },
    '/etc/hostname': { size: 16 },
    ...extra,
  }
}

/** Is `id` on a valid (non-APIPA) address? */
export const hasLease = (w: OpsWorld, id: string) => {
  const ip = dev(w.topo, id)?.ifaces[0].ip
  return !!ip && !ip.startsWith('169.254')
}

/** Clients retry DHCP on their own every few minutes: model that by renewing APIPA hosts after each action. */
export function autoRenew(w: OpsWorld, ids?: string[]) {
  let out = w
  for (const c of ids ?? w.dhcpClients) if (!hasLease(out, c)) out = renew(out, c).world
  return out
}

export const IT_ROLE = { en: 'IT support technician (level 2)', fr: 'Technicien support informatique (niveau 2)' }
export const COMPANY = {
  en: 'Meridian Logistics — 60 employees, one head office. Admin, Sales and IT departments, a server room and an online shop in a DMZ.',
  fr: 'Meridian Logistics — 60 salariés, un siège. Services Administration, Commercial et Informatique, une salle serveurs et une boutique en ligne en DMZ.',
}
export const DUTIES = [
  { en: 'Restore service for users as quickly and safely as possible', fr: 'Rétablir le service pour les utilisateurs, vite et sans risque' },
  { en: 'Find the root cause — not just the symptom', fr: 'Trouver la cause racine — pas seulement le symptôme' },
  { en: 'Avoid changes that put other services at risk', fr: 'Éviter les changements qui mettent d’autres services en danger' },
  { en: 'Document what happened in the incident report', fr: 'Documenter ce qui s’est passé dans le rapport d’incident' },
]
