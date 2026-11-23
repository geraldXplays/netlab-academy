/**
 * Command shells for the IT Operations Simulator:
 *  - win     Windows client command prompt
 *  - winsrv  Windows Server PowerShell (cmd commands + AD / DHCP / DNS cmdlets)
 *  - linux   bash with systemd
 *  - ios     Cisco IOS (the network simulator's parser + ops extras)
 * Every shell is a pure function: (world, line) → new world + output + tags.
 */
import { dev, linkAt, longIface, peerOf, validIp } from '@/sim/topology'
import { isHost } from '@/sim/types'
import { ping, type ArpCache, type PingResult } from '@/sim/engine'
import { runHost } from '@/sim/host'
import { runIos, prompt as iosPrompt, type IosState } from '@/sim/ios'
import type { OpsWorld, Scenario, Svc } from './types'
import {
  byIp, diskFull, diskUsed, GB, human, ipOf, log, nicUp, powerCycle, renew, resolve, running, setHostIp, setSvc, stamp, svcOf, tcp, type PortResult,
} from './world'

export interface ShellCtx {
  scenario: Pick<Scenario, 'startCheck'>
  arp: ArpCache
  ios: IosState
}

export interface ShellResult {
  world: OpsWorld
  out: string[]
  clear?: boolean
  tags?: string[]
  /** Open this file in the editor. */
  edit?: string
  ios?: IosState
  ping?: PingResult
}

export function shellPrompt(w: OpsWorld, id: string, ios: IosState) {
  const d = dev(w.topo, id)!
  switch (w.os[id]) {
    case 'ios':
      return iosPrompt(d, ios)
    case 'linux':
      return `admin@${d.name.toLowerCase()}:~$ `
    case 'winsrv':
      return 'PS C:\\Users\\Administrator> '
    default:
      return 'C:\\>'
  }
}

export function banner(w: OpsWorld, id: string): string[] {
  const d = dev(w.topo, id)!
  switch (w.os[id]) {
    case 'ios':
      return [`${d.name} con0 is now available`, '', 'Press RETURN to get started.', '']
    case 'linux':
      return [`Ubuntu 24.04 LTS (${d.name.toLowerCase()})`, '', ` * Documentation:  https://help.ubuntu.com`, `Last login: ${stamp(w)} from 10.10.99.10`, '']
    case 'winsrv':
      return ['Windows PowerShell', 'Copyright (C) Microsoft Corporation. All rights reserved.', '', `Connected to ${d.name} (Windows Server 2022)`, '']
    default:
      return ['Microsoft Windows [Version 10.0.22631]', '(c) Microsoft Corporation. All rights reserved.', '']
  }
}

export function runShell(w0: OpsWorld, id: string, raw: string, ctx: ShellCtx): ShellResult {
  const w = w0
  switch (w.os[id]) {
    case 'ios':
      return iosShell(w, id, raw, ctx)
    case 'linux':
      return linux(w, id, raw, ctx)
    case 'winsrv':
      return powershell(w, id, raw, ctx)
    default:
      return cmd(w, id, raw, ctx)
  }
}

/* ============================== helpers ============================== */

const pad = (s: string | number, n: number) => String(s).padEnd(n)
const lower = (s: string) => s.toLowerCase()

function startSvc(w: OpsWorld, id: string, s: Svc, ctx: ShellCtx): { world: OpsWorld; err?: string } {
  const why = ctx.scenario.startCheck?.(w, id, s.name) ?? (s.writes && diskFull(w, id) ? 'No space left on device' : null)
  const name = dev(w.topo, id)!.name
  if (why) {
    let out = setSvc(w, id, s.name, { state: 'failed' })
    out = log(out, { src: name, level: 'error', svc: s.name, msg: `${s.name}: ${why}`, id: 7024 })
    return { world: out, err: why }
  }
  let out = setSvc(w, id, s.name, { state: 'running' })
  out = log(out, { src: name, level: 'info', svc: s.name, msg: `Started ${s.display}.`, id: 7036 })
  if (s.name === 'dhcp') out = renewAll(out)
  return { world: out }
}

/** When a DHCP service comes back, clients retry by themselves after a while — we let them retry immediately. */
function renewAll(w: OpsWorld) {
  let out = w
  for (const c of w.dhcpClients) {
    const ip = ipOf(out, c)
    if (!ip || ip.startsWith('169.254')) out = renew(out, c).world
  }
  return out
}

function pingLines(w: OpsWorld, id: string, target: string, ctx: ShellCtx, style: 'win' | 'linux', count = 4): { out: string[]; res?: PingResult } {
  const r = resolve(w, id, target)
  if ('err' in r) {
    return style === 'win'
      ? { out: [`Ping request could not find host ${target}. Please check the name and try again.`, ''] }
      : { out: [`ping: ${target}: ${r.err === 'nxdomain' ? 'Name or service not known' : 'Temporary failure in name resolution'}`, ''] }
  }
  if (style === 'win') {
    const h = runHost(w.topo, id, `ping ${r.ip} -n ${count}`, ctx.arp)
    const out = validIp(target) ? h.out : h.out.map((l) => l.replace(`Pinging ${r.ip} with`, `Pinging ${target} [${r.ip}] with`))
    return { out, res: h.ping }
  }
  const res = ping(w.topo, id, r.ip, ctx.arp)
  const out = [`PING ${target} (${r.ip}) 56(84) bytes of data.`]
  for (let k = 0; k < count; k++) if (res.ok) out.push(`64 bytes from ${r.ip}: icmp_seq=${k + 1} ttl=${res.ttl - 64 > 0 ? res.ttl - 64 : res.ttl} time=0.${4 + k} ms`)
  if (!res.ok && res.reason === 'no-route') out.push(`From ${res.unreachableFrom ?? r.ip} icmp_seq=1 Destination Host Unreachable`)
  out.push('', `--- ${target} ping statistics ---`, `${count} packets transmitted, ${res.ok ? count : 0} received, ${res.ok ? 0 : 100}% packet loss, time ${count * 1000 - 1}ms`, '')
  return { out, res }
}

const PORTS: Record<string, number> = { http: 80, https: 443, smb: 445, ldap: 389, rdp: 3389, ssh: 22, dns: 53, sql: 1433, mysql: 3306 }

function tcpFromUrl(w: OpsWorld, id: string, url: string): { host: string; port: number; r: PortResult | 'dns' } {
  const m = url.match(/^(?:(https?):\/\/)?([^/:]+)(?::(\d+))?/i)
  const host = m?.[2] ?? url
  const port = m?.[3] ? Number(m[3]) : lower(m?.[1] ?? 'http') === 'https' ? 443 : 80
  const res = resolve(w, id, host)
  if ('err' in res) return { host, port, r: 'dns' }
  return { host, port, r: tcp(w, id, res.ip, port) }
}

function curl(w: OpsWorld, id: string, url: string, style: 'win' | 'linux'): string[] {
  const { host, port, r } = tcpFromUrl(w, id, url)
  if (r === 'dns') return [`curl: (6) Could not resolve host: ${host}`, '']
  const srv = (() => { const res = resolve(w, id, host); const d = 'ip' in res ? byIp(w, res.ip) : undefined; return d && w.os[d.id] === 'linux' ? 'nginx/1.24.0 (Ubuntu)' : d && w.os[d.id] === 'winsrv' ? 'Microsoft-IIS/10.0' : 'gws' })()
  if (r === 'ok') return [`HTTP/1.1 200 OK`, `Server: ${srv}`, `Content-Type: text/html`, '', `<!doctype html><title>${host}</title> …`, '']
  if (r === 'refused') return [`curl: (7) Failed to connect to ${host} port ${port}${style === 'linux' ? ' after 0 ms' : ''}: Connection refused`, '']
  return [`curl: (28) Failed to connect to ${host} port ${port} after 21000 ms: ${r === 'blocked' ? 'Timed out' : 'Could not connect to server'}`, '']
}

function nslookup(w: OpsWorld, id: string, name: string): string[] {
  const d = dev(w.topo, id)!
  const server = d.dns
  const srvName = server ? (byIp(w, server)?.name.toLowerCase() ?? 'UnKnown') : 'UnKnown'
  if (!name) return ['Usage: nslookup <name>', '']
  const r = resolve(w, id, name)
  if ('err' in r) {
    if (r.err === 'no-dns') return ['*** Default servers are not available', `Server:  UnKnown`, 'Address:  127.0.0.1', '', `*** UnKnown can't find ${name}: No response from server`, '']
    if (r.err === 'timeout') return [`DNS request timed out.`, `    timeout was 2 seconds.`, `Server:  UnKnown`, `Address:  ${server}`, '', `DNS request timed out.`, `    timeout was 2 seconds.`, `*** Request to UnKnown timed-out`, '']
    return [`Server:  ${srvName}`, `Address:  ${server}`, '', `*** ${srvName} can't find ${name}: Non-existent domain`, '']
  }
  return [`Server:  ${srvName}`, `Address:  ${server}`, '', `${w.dns && byIp(w, server!)?.id === w.dns.server && !w.dns.records[name.split('.')[0].toLowerCase()] ? 'Non-authoritative answer:\n' : ''}Name:    ${name}`, `Address:  ${r.ip}`, ''].flatMap((l) => l.split('\n'))
}

function ipconfig(w: OpsWorld, id: string, all: boolean): string[] {
  const d = dev(w.topo, id)!
  const nic = d.ifaces[0]
  const dhcp = w.dhcpClients.includes(id)
  if (!nicUp(w, id)) return ['', 'Ethernet adapter Ethernet0:', '', '   Media State . . . . . . . . . . . : Media disconnected', '   Connection-specific DNS Suffix  . : ', '']
  const apipa = nic.ip?.startsWith('169.254')
  const out = ['', 'Windows IP Configuration', '', ...(all ? [`   Host Name . . . . . . . . . . . . : ${d.name}`, `   Primary Dns Suffix  . . . . . . . : ${w.dns?.zone ?? ''}`, ''] : []), 'Ethernet adapter Ethernet0:', '']
  out.push(`   Connection-specific DNS Suffix  . : ${dhcp && !apipa ? (w.dns?.zone ?? '') : ''}`)
  if (all) {
    out.push(`   Physical Address. . . . . . . . . : ${nic.mac.replace(/\./g, '').match(/.{2}/g)!.join('-')}`)
    out.push(`   DHCP Enabled. . . . . . . . . . . : ${dhcp ? 'Yes' : 'No'}`)
  }
  out.push(`   ${apipa ? 'Autoconfiguration IPv4 Address. .' : 'IPv4 Address. . . . . . . . . . .'} : ${nic.ip ?? '0.0.0.0'}${all ? '(Preferred)' : ''}`)
  out.push(`   Subnet Mask . . . . . . . . . . . : ${nic.mask ?? '0.0.0.0'}`)
  out.push(`   Default Gateway . . . . . . . . . : ${d.gateway ?? ''}`)
  if (all) {
    if (dhcp && !apipa && w.dhcp) out.push(`   DHCP Server . . . . . . . . . . . : ${ipOf(w, w.dhcp.server)}`)
    out.push(`   DNS Servers . . . . . . . . . . . : ${d.dns ?? ''}`)
  }
  return [...out, '']
}

/* ============================== Windows client ============================== */

function cmd(w: OpsWorld, id: string, raw: string, ctx: ShellCtx): ShellResult {
  const line = raw.trim()
  const [c0, ...args] = line.split(/\s+/)
  const c = lower(c0 ?? '')
  const d = dev(w.topo, id)!
  if (!line) return { world: w, out: [] }

  if (c === 'help' || c === '?') {
    return {
      world: w,
      out: [
        'Common commands:',
        '  ipconfig [/all | /release | /renew | /flushdns]',
        '  ping <host> [-n N]        tracert <host>',
        '  nslookup <name>           arp -a',
        '  curl <url>                net use <drive>: \\\\server\\share',
        '  gpupdate /force           whoami   hostname   cls',
        '',
      ],
    }
  }
  if (c === 'ipconfig') {
    const a = lower(args[0] ?? '')
    if (a === '/release') {
      if (!w.dhcpClients.includes(id)) return { world: w, out: ['', 'The operation failed as no adapter is in the state permissible for this operation.', ''] }
      const world = setHostIp(w, id, undefined, undefined, undefined, undefined)
      return { world, out: ['', 'Windows IP Configuration', '', 'Ethernet adapter Ethernet0:', '', '   IPv4 Address. . . . . . . . . . . : 0.0.0.0', ''], tags: ['dhcp-release'] }
    }
    if (a === '/renew') {
      if (!w.dhcpClients.includes(id)) return { world: w, out: ['', 'The operation failed as no adapter is in the state permissible for this operation.', ''] }
      const r = renew(w, id)
      const out = r.ok ? ipconfig(r.world, id, false) : r.reason === 'link' ? ['', 'An error occurred while renewing interface Ethernet0 : The media is disconnected.', ''] : ['', 'An error occurred while renewing interface Ethernet0 : unable to contact your DHCP server. Request has timed out.', '']
      return { world: r.world, out, tags: ['dhcp-renew', r.ok ? 'renew-ok' : 'renew-fail'] }
    }
    if (a === '/flushdns') return { world: w, out: ['', 'Windows IP Configuration', '', 'Successfully flushed the DNS Resolver Cache.', ''] }
    return { world: w, out: ipconfig(w, id, a === '/all') }
  }
  if (c === 'ping') {
    const target = args.find((a) => !a.startsWith('-') && !/^\d+$/.test(a))
    const nIdx = args.findIndex((a) => lower(a) === '-n')
    const n = nIdx >= 0 ? Math.max(1, Math.min(10, Number(args[nIdx + 1]) || 4)) : 4
    if (!target) return { world: w, out: ['Usage: ping <host>', ''] }
    if (!d.ifaces[0].ip) return { world: w, out: ['', 'PING: transmit failed. General failure. ', ''] }
    const r = pingLines(w, id, target, ctx, 'win', n)
    return { world: w, out: r.out, ping: r.res, tags: [`ping:${target}`] }
  }
  if (c === 'tracert') {
    const target = args[0]
    if (!target) return { world: w, out: ['Usage: tracert <host>', ''] }
    const r = resolve(w, id, target)
    if ('err' in r) return { world: w, out: [`Unable to resolve target system name ${target}.`, ''] }
    const h = runHost(w.topo, id, `tracert ${r.ip}`, ctx.arp)
    return { world: w, out: h.out, ping: h.ping, tags: [`tracert:${target}`] }
  }
  if (c === 'nslookup') return { world: w, out: nslookup(w, id, args[0] ?? ''), tags: [`nslookup:${args[0] ?? ''}`] }
  if (c === 'curl') return { world: w, out: curl(w, id, args.find((a) => !a.startsWith('-')) ?? '', 'win'), tags: ['curl'] }
  if (c === 'whoami') return { world: w, out: [`${(w.dns?.zone ?? 'corp').split('.')[0]}\\${(w.flags.users as Record<string, string> | undefined)?.[id] ?? 'user'}`, ''] }
  if (c === 'hostname') return { world: w, out: [d.name, ''] }
  if (c === 'cls' || c === 'clear') return { world: w, out: [], clear: true }
  if (c === 'arp') return { world: w, out: runHost(w.topo, id, line, ctx.arp).out }
  if (c === 'gpupdate') {
    const dc = w.flags.dc as string | undefined
    const ok = dc && running(w, dc, 'adds') && 'ip' in resolve(w, id, w.dns?.zone ?? 'corp.local') && tcp(w, id, ipOf(w, dc)!, 389) === 'ok'
    return {
      world: w,
      out: ok
        ? ['Updating policy...', '', 'Computer Policy update has completed successfully.', 'User Policy update has completed successfully.', '']
        : ['Updating policy...', '', 'The processing of Group Policy failed because of lack of network connectivity to a domain controller.', '']
    }
  }
  if (c === 'net' && lower(args[0] ?? '') === 'use') {
    const path = args.find((a) => a.startsWith('\\\\'))
    if (!path) return { world: w, out: ['New connections will be remembered.', '', 'There are no entries in the list.', ''] }
    return smb(w, id, path, args.find((a) => /^[a-z]:$/i.test(a)))
  }
  if (c === 'dir' && args[0]?.startsWith('\\\\')) return smb(w, id, args[0])
  if (c === 'explorer' && args[0]?.startsWith('\\\\')) return smb(w, id, args[0])
  return { world: w, out: [`'${c0}' is not recognized as an internal or external command,`, 'operable program or batch file.', ''] }
}

function smb(w: OpsWorld, id: string, path: string, drive?: string): ShellResult {
  const host = path.replace(/^\\\\/, '').split('\\')[0]
  const share = path.replace(/^\\\\/, '').split('\\')[1] ?? ''
  const r = resolve(w, id, host)
  const tags = [`smb:${host}`]
  if ('err' in r) return { world: w, out: ['System error 53 has occurred.', '', 'The network path was not found.', ''], tags }
  const res = tcp(w, id, r.ip, 445)
  if (res !== 'ok') return { world: w, out: ['System error 53 has occurred.', '', 'The network path was not found.', ''], tags }
  const shares = (w.flags.shares as Record<string, string[]> | undefined)?.[lower(host)] ?? []
  if (share && !shares.map(lower).includes(lower(share))) return { world: w, out: ['System error 67 has occurred.', '', 'The network name cannot be found.', ''], tags }
  return { world: w, out: drive ? ['The command completed successfully.', ''] : [` Directory of ${path}`, '', `${stamp(w, false)}    <DIR>          .`, `${stamp(w, false)}    <DIR>          Invoices`, `${stamp(w, false)}    <DIR>          Payroll`, '', '               0 File(s)              0 bytes', ''], tags: [...tags, 'smb-ok'] }
}

/* ============================== Windows Server PowerShell ============================== */

function arg(args: string[], name: string) {
  const k = args.findIndex((a) => lower(a) === `-${lower(name)}`)
  return k >= 0 ? args[k + 1]?.replace(/^["']|["']$/g, '') : undefined
}
const positional = (args: string[]) => {
  const out: string[] = []
  for (let k = 0; k < args.length; k++) {
    if (args[k].startsWith('-')) {
      if (args[k + 1] && !args[k + 1].startsWith('-') && !/^-(properties|force|reset|confirm)/i.test(args[k])) k++
      continue
    }
    out.push(args[k].replace(/^["']|["']$/g, ''))
  }
  return out
}

function powershell(w: OpsWorld, id: string, raw: string, ctx: ShellCtx): ShellResult {
  const line = raw.trim().replace(/\s*\|\s*(format-list|fl|ft|format-table)\s*$/i, '')
  if (!line) return { world: w, out: [] }
  const [c0, ...args] = line.split(/\s+/)
  const c = lower(c0)
  const d = dev(w.topo, id)!
  const me = d.name
  const ident = () => arg(args, 'Identity') ?? arg(args, 'Name') ?? positional(args)[0]

  if (c === 'help' || c === 'get-help' || c === '?') {
    return {
      world: w,
      out: [
        'Server commands (PowerShell):',
        '  Get-Service [name]  Start-Service / Stop-Service / Restart-Service <name>',
        '  Get-EventLog -LogName System|Application|Security [-Newest N] [-InstanceId ID]',
        '  Get-ADUser <user> -Properties *   Search-ADAccount -LockedOut',
        '  Unlock-ADAccount <user>   Enable-ADAccount <user>   Set-ADAccountPassword <user> -Reset',
        '  Get-ADGroupMember <group>   Add-ADGroupMember <group> <user>',
        '  Get-DhcpServerv4Scope   Get-DhcpServerv4ScopeStatistics   Get-DhcpServerv4Lease -ScopeId <id>',
        '  Set-DhcpServerv4Scope -ScopeId <id> [-EndRange <ip>] [-LeaseDuration <d.hh:mm:ss>]',
        '  Get-DhcpServerv4OptionValue -ScopeId <id>   Set-DhcpServerv4OptionValue -ScopeId <id> -DnsServer <ip>',
        '  Remove-DhcpServerv4Lease -ScopeId <id> -ClientId <mac> | -IPAddress <ip>',
        '  Get-DnsServerResourceRecord -ZoneName <zone>   Get-DnsServerForwarder   Set-DnsServerForwarder -IPAddress <ip>',
        '  Resolve-DnsName <name>   Test-NetConnection <host> -Port <n>   Get-Volume   Restart-Computer',
        '  Plus: ipconfig, ping, nslookup, tracert…',
        '',
      ],
    }
  }

  /* ---- services ---- */
  if (c === 'get-service') {
    const n = ident()
    const list = (w.svcs[id] ?? []).filter((s) => !n || lower(s.name) === lower(n) || lower(s.display).includes(lower(n)))
    if (n && !list.length) return { world: w, out: [`Get-Service : Cannot find any service with service name '${n}'.`, ''] }
    return { world: w, out: ['', `${pad('Status', 9)}${pad('Name', 18)}DisplayName`, `${pad('------', 9)}${pad('----', 18)}-----------`, ...list.map((s) => `${pad(s.state === 'running' ? 'Running' : 'Stopped', 9)}${pad(s.name, 18)}${s.display}`), ''], tags: ['svc-list'] }
  }
  if (c === 'start-service' || c === 'restart-service' || c === 'stop-service') {
    const n = ident()
    const s = n ? svcOf(w, id, n) : undefined
    if (!s) return { world: w, out: [`${c0} : Cannot find any service with service name '${n ?? ''}'.`, ''] }
    const was = s.state === 'running'
    if (c === 'stop-service') {
      const world = log(setSvc(w, id, s.name, { state: 'stopped' }), { src: me, level: 'warn', svc: s.name, id: 7036, msg: `The ${s.display} service entered the stopped state.` })
      return { world, out: [''], tags: [`svc-stop:${s.name}:${was}`] }
    }
    const r = startSvc(w, id, s, ctx)
    if (r.err) return { world: r.world, out: [`${c0} : Service '${s.display} (${s.name})' cannot be started due to the following error: ${r.err}`, ''], tags: [`svc-restart:${s.name}:${was}`, 'svc-fail'] }
    return { world: r.world, out: [`WARNING: Waiting for service '${s.display} (${s.name})' to start...`, ''], tags: [`svc-restart:${s.name}:${was}`] }
  }

  /* ---- event logs ---- */
  if (c === 'get-eventlog' || c === 'get-winevent') {
    const logName = lower(arg(args, 'LogName') ?? positional(args)[0] ?? 'system')
    const nRaw = arg(args, 'Newest') ?? arg(args, 'MaxEvents')
    const n = Number(nRaw) || 20
    const idf = Number(arg(args, 'InstanceId') ?? arg(args, 'Id')) || undefined
    const entries = w.logs
      .filter((l) => l.src === me)
      .filter((l) => (logName === 'security' ? l.id !== undefined && l.id >= 4600 && l.id < 4800 : logName === 'application' ? l.svc && !(l.id && l.id >= 4600 && l.id < 4800) && l.id !== 7036 && l.id !== 7024 : !(l.id && l.id >= 4600 && l.id < 4800)))
      .filter((l) => !idf || l.id === idf)
      .slice(-n)
      .reverse()
    if (!entries.length) return { world: w, out: ['No matches found', ''], tags: [`eventlog:${logName}`] }
    return {
      world: w,
      out: ['', `${pad('Time', 10)}${pad('EntryType', 13)}${pad('InstanceID', 11)}Message`, `${pad('----', 10)}${pad('---------', 13)}${pad('----------', 11)}-------`, ...entries.map((l) => `${pad(l.t, 10)}${pad(l.level === 'info' ? 'Information' : l.level === 'warn' ? 'Warning' : 'Error', 13)}${pad(l.id ?? 0, 11)}${l.msg}`), ''],
      tags: [`eventlog:${logName}`, ...(idf ? [`eventid:${idf}`] : [])],
    }
  }

  /* ---- Active Directory ---- */
  const findUser = (n?: string) => (n ? w.accounts.find((a) => lower(a.sam) === lower(n.replace(/^.*\\/, '')) || lower(a.name) === lower(n)) : undefined)
  const notFound = (n?: string) => [`${c0} : Cannot find an object with identity: '${n ?? ''}' under: 'DC=${(w.dns?.zone ?? 'corp.local').split('.').join(',DC=')}'.`, '']
  const needsAd = c.includes('-ad') || c === 'search-adaccount'
  if (needsAd && !running(w, w.flags.dc as string, 'adds')) return { world: w, out: [`${c0} : Unable to contact the server. This may be because this server does not exist, it is currently down, or it does not have the Active Directory Web Services running.`, ''] }
  if (c === 'get-aduser') {
    const n = ident()
    if (n === '*' || arg(args, 'Filter')) return { world: w, out: ['', ...w.accounts.map((a) => `${pad(a.sam, 12)}${pad(a.name, 22)}${a.dept}  Enabled=${a.enabled}`), ''], tags: ['ad-list'] }
    const a = findUser(n)
    if (!a) return { world: w, out: notFound(n) }
    const zone = w.dns?.zone ?? 'corp.local'
    const props = /-properties/i.test(line)
    const out = ['', `DistinguishedName : CN=${a.name},OU=${a.dept},DC=${zone.split('.').join(',DC=')}`, `Enabled           : ${a.enabled ? 'True' : 'False'}`, `Name              : ${a.name}`, `SamAccountName    : ${a.sam}`, `UserPrincipalName : ${a.sam}@${zone}`]
    if (props) out.push(`LockedOut         : ${a.locked ? 'True' : 'False'}`, `BadLogonCount     : ${a.badCount}`, `LastBadPasswordAttempt : ${a.lastBad ?? ''}`, `PasswordExpired   : ${a.pwdExpired ? 'True' : 'False'}`, `PasswordLastSet   : ${(w.flags.pwdSet as Record<string, string> | undefined)?.[a.sam] ?? '01/09/2026 09:12'}`, `MemberOf          : {${a.groups.map((g) => `CN=${g}`).join(', ')}}`)
    return { world: w, out: [...out, ''], tags: [`ad-user:${lower(a.sam)}`, ...(props ? [`ad-props:${lower(a.sam)}`] : [])] }
  }
  if (c === 'search-adaccount') {
    const locked = w.accounts.filter((a) => (/-lockedout/i.test(line) ? a.locked : /-accountdisabled/i.test(line) ? !a.enabled : /-passwordexpired/i.test(line) ? a.pwdExpired : false))
    return { world: w, out: locked.length ? ['', `${pad('Name', 22)}${pad('SamAccountName', 16)}LockedOut  Enabled`, ...locked.map((a) => `${pad(a.name, 22)}${pad(a.sam, 16)}${pad(String(a.locked), 11)}${a.enabled}`), ''] : [''], tags: ['ad-search'] }
  }
  const editUser = (fn: (a: (typeof w.accounts)[number]) => (typeof w.accounts)[number], tag: string, msg: string): ShellResult => {
    const n = ident()
    const a = findUser(n)
    if (!a) return { world: w, out: notFound(n) }
    const world = log({ ...w, accounts: w.accounts.map((x) => (x === a ? fn(x) : x)) }, { src: me, level: 'info', id: 4767, msg: msg.replace('{u}', a.sam) })
    return { world, out: [''], tags: [`${tag}:${lower(a.sam)}`] }
  }
  if (c === 'unlock-adaccount') return editUser((a) => ({ ...a, locked: false, badCount: 0 }), 'ad-unlock', 'A user account was unlocked. Target Account Name: {u}')
  if (c === 'enable-adaccount') return editUser((a) => ({ ...a, enabled: true }), 'ad-enable', 'A user account was enabled. Target Account Name: {u}')
  if (c === 'disable-adaccount') return editUser((a) => ({ ...a, enabled: false }), 'ad-disable', 'A user account was disabled. Target Account Name: {u}')
  if (c === 'set-adaccountpassword') {
    const r = editUser((a) => ({ ...a, pwdExpired: false, locked: false, badCount: 0 }), 'pwd-reset', "An attempt was made to reset an account's password. Target Account Name: {u}")
    if (r.out[0] === '') r.out = ['', 'Please enter the desired password for the account', 'Password: ************', '']
    return r
  }
  if (c === 'get-adgroupmember') {
    const g = ident()
    const m = w.accounts.filter((a) => a.groups.some((x) => lower(x) === lower(g ?? '')))
    return { world: w, out: ['', ...m.map((a) => `${pad(a.sam, 14)}${a.name}`), ''], tags: [`ad-group:${lower(g ?? '')}`] }
  }
  if (c === 'add-adgroupmember') {
    const [g, u] = positional(args)
    const gname = arg(args, 'Identity') ?? g
    const uname = arg(args, 'Members') ?? u ?? positional(args)[1]
    const a = findUser(uname)
    if (!a || !gname) return { world: w, out: notFound(uname) }
    const world = { ...w, accounts: w.accounts.map((x) => (x === a ? { ...x, groups: [...new Set([...x.groups, gname])] } : x)) }
    return { world, out: [''], tags: [`ad-addgroup:${lower(gname)}:${lower(a.sam)}`] }
  }

  /* ---- DHCP ---- */
  if (c.includes('dhcpserver')) {
    if (!w.dhcp || w.dhcp.server !== id) return { world: w, out: [`${c0} : Failed to get the DHCP server information. The DHCP service is not installed on this computer.`, ''] }
    const scopeArg = arg(args, 'ScopeId')
    const sc = w.dhcp.scopes.find((s) => s.id === scopeArg) ?? (w.dhcp.scopes.length === 1 && !scopeArg ? w.dhcp.scopes[0] : undefined)
    const size = (s: (typeof w.dhcp.scopes)[number]) => {
      const a = s.start.split('.').map(Number)
      const b = s.end.split('.').map(Number)
      return (b[2] - a[2]) * 256 + b[3] - a[3] + 1
    }
    if (c === 'get-dhcpserverv4scope') {
      return { world: w, out: ['', `${pad('ScopeId', 14)}${pad('SubnetMask', 16)}${pad('Name', 14)}${pad('State', 9)}${pad('StartRange', 15)}${pad('EndRange', 15)}LeaseDuration`, ...w.dhcp.scopes.map((s) => `${pad(s.id, 14)}${pad(s.mask, 16)}${pad(s.name, 14)}${pad(s.active ? 'Active' : 'Inactive', 9)}${pad(s.start, 15)}${pad(s.end, 15)}${Math.floor(s.leaseHours / 24)}.${String(s.leaseHours % 24).padStart(2, '0')}:00:00`), ''], tags: ['dhcp-scope'] }
    }
    if (c === 'get-dhcpserverv4scopestatistics') {
      return { world: w, out: ['', `${pad('ScopeId', 14)}${pad('Free', 7)}${pad('InUse', 7)}PercentageInUse`, ...w.dhcp.scopes.map((s) => `${pad(s.id, 14)}${pad(size(s) - s.leases.length, 7)}${pad(s.leases.length, 7)}${Math.round((s.leases.length / size(s)) * 100)}`), ''], tags: ['dhcp-stats'] }
    }
    if (c === 'get-dhcpserverv4lease') {
      if (!sc) return { world: w, out: [`${c0} : Missing an argument for parameter 'ScopeId'.`, ''] }
      return { world: w, out: ['', `${pad('IPAddress', 16)}${pad('ClientId', 17)}${pad('HostName', 24)}AddressState`, ...sc.leases.map((l) => `${pad(l.ip, 16)}${pad(l.mac.toLowerCase(), 17)}${pad(l.host, 24)}Active`), ''], tags: ['dhcp-leases'] }
    }
    if (c === 'set-dhcpserverv4scope') {
      if (!sc) return { world: w, out: [`${c0} : Missing an argument for parameter 'ScopeId'.`, ''] }
      const end = arg(args, 'EndRange')
      const lease = arg(args, 'LeaseDuration')
      let next = { ...sc }
      if (end) {
        if (!validIp(end)) return { world: w, out: [`${c0} : Invalid end range ${end}.`, ''] }
        next = { ...next, end }
      }
      if (lease) {
        const m = lease.match(/^(?:(\d+)\.)?(\d{1,2}):(\d{2})(?::\d{2})?$/)
        if (!m) return { world: w, out: [`${c0} : Cannot convert value "${lease}" to type "System.TimeSpan".`, ''] }
        next = { ...next, leaseHours: Number(m[1] ?? 0) * 24 + Number(m[2]) }
      }
      if (arg(args, 'State')) next = { ...next, active: lower(arg(args, 'State')!) === 'active' }
      const world = { ...w, dhcp: { ...w.dhcp, scopes: w.dhcp.scopes.map((s) => (s === sc ? next : s)) } }
      return { world, out: [''], tags: [`dhcp-set${end ? ':end' : ''}${lease ? ':lease' : ''}`] }
    }
    if (c === 'get-dhcpserverv4optionvalue') {
      const list = sc ? [sc] : w.dhcp.scopes
      return { world: w, out: ['', `${pad('ScopeId', 14)}${pad('OptionId', 10)}${pad('Name', 14)}Value`, ...list.flatMap((x) => [`${pad(x.id, 14)}${pad(3, 10)}${pad('Router', 14)}{${x.router}}`, `${pad(x.id, 14)}${pad(6, 10)}${pad('DNS Servers', 14)}{${x.dns}}`, `${pad(x.id, 14)}${pad(15, 10)}${pad('DNS Domain', 14)}{${w.dns?.zone ?? ''}}`]), ''], tags: ['dhcp-options'] }
    }
    if (c === 'set-dhcpserverv4optionvalue') {
      if (!sc) return { world: w, out: [`${c0} : Missing an argument for parameter 'ScopeId'.`, ''] }
      const dns = arg(args, 'DnsServer')
      const router = arg(args, 'Router')
      if ((dns && !validIp(dns.split(',')[0])) || (router && !validIp(router))) return { world: w, out: [`${c0} : The parameter value is not a valid IP address.`, ''] }
      const next = { ...sc, ...(dns ? { dns: dns.split(',')[0] } : {}), ...(router ? { router } : {}) }
      const world = { ...w, dhcp: { ...w.dhcp, scopes: w.dhcp.scopes.map((x) => (x === sc ? next : x)) } }
      return { world, out: [''], tags: [`dhcp-option${dns ? ':dns' : ''}${router ? ':router' : ''}`] }
    }
    if (c === 'remove-dhcpserverv4lease') {
      if (!sc) return { world: w, out: [`${c0} : Missing an argument for parameter 'ScopeId'.`, ''] }
      const client = arg(args, 'ClientId')
      const stale = (w.flags.staleMacs as string[] | undefined) ?? []
      const ip = arg(args, 'IPAddress')
      const all = !client && !ip && !/-badleases/i.test(line)
      const leases = client ? sc.leases.filter((l) => lower(l.mac).replace(/[-:.]/g, '') !== lower(client).replace(/[-:.]/g, '')) : ip ? sc.leases.filter((l) => l.ip !== ip) : all ? [] : sc.leases.filter((l) => !stale.includes(l.mac))
      const world = { ...w, dhcp: { ...w.dhcp, scopes: w.dhcp.scopes.map((s) => (s === sc ? { ...s, leases } : s)) } }
      return { world, out: [''], tags: [all ? 'dhcp-remove-all' : 'dhcp-remove'] }
    }
  }

  /* ---- DNS ---- */
  if (c === 'get-dnsserverresourcerecord') {
    if (!w.dns || w.dns.server !== id) return { world: w, out: [`${c0} : The DNS server role is not installed on ${me}.`, ''] }
    return { world: w, out: ['', `${pad('HostName', 16)}${pad('RecordType', 12)}RecordData`, ...Object.entries(w.dns.records).map(([k, v]) => `${pad(k, 16)}${pad('A', 12)}${v}`), ''], tags: ['dns-records'] }
  }
  if (c === 'get-dnsserverforwarder') {
    if (!w.dns || w.dns.server !== id) return { world: w, out: [`${c0} : The DNS server role is not installed on ${me}.`, ''] }
    return { world: w, out: ['', `UseRootHint        : True`, `Timeout(s)         : 3`, `IPAddress          : ${w.dns.forwarder}`, ''], tags: ['dns-forwarder'] }
  }
  if (c === 'set-dnsserverforwarder' || c === 'add-dnsserverforwarder') {
    const ip = arg(args, 'IPAddress') ?? positional(args)[0]
    if (!w.dns || !ip || !validIp(ip)) return { world: w, out: [`${c0} : Invalid IP address.`, ''] }
    return { world: { ...w, dns: { ...w.dns, forwarder: ip } }, out: [''], tags: ['dns-set-forwarder'] }
  }
  if (c === 'clear-dnsservercache') return { world: w, out: [''], tags: ['dns-clear'] }
  if (c === 'resolve-dnsname') {
    const n = positional(args)[0] ?? ''
    const r = resolve(w, id, n)
    if ('err' in r) return { world: w, out: [`Resolve-DnsName : ${n} : ${r.err === 'nxdomain' ? 'DNS name does not exist' : 'This operation returned because the timeout period expired'}`, ''], tags: [`nslookup:${n}`] }
    return { world: w, out: ['', `${pad('Name', 28)}${pad('Type', 6)}${pad('TTL', 6)}IPAddress`, `${pad(n, 28)}${pad('A', 6)}${pad(3600, 6)}${r.ip}`, ''], tags: [`nslookup:${n}`] }
  }
  if (c === 'test-netconnection' || c === 'tnc') {
    const host = positional(args)[0] ?? arg(args, 'ComputerName') ?? ''
    const portArg = arg(args, 'Port') ?? (arg(args, 'CommonTCPPort') ? String(PORTS[lower(arg(args, 'CommonTCPPort')!)] ?? '') : undefined)
    const r = resolve(w, id, host)
    if ('err' in r) return { world: w, out: [`WARNING: Name resolution of ${host} failed`, ''] }
    if (!portArg) {
      const ok = ping(w.topo, id, r.ip, ctx.arp).ok
      return { world: w, out: ['', `ComputerName           : ${host}`, `RemoteAddress          : ${r.ip}`, `PingSucceeded          : ${ok ? 'True' : 'False'}`, ''], tags: [`ping:${host}`] }
    }
    const res = tcp(w, id, r.ip, Number(portArg))
    return { world: w, out: [...(res === 'ok' ? [] : [`WARNING: TCP connect to (${r.ip} : ${portArg}) failed`]), '', `ComputerName     : ${host}`, `RemoteAddress    : ${r.ip}`, `RemotePort       : ${portArg}`, `TcpTestSucceeded : ${res === 'ok' ? 'True' : 'False'}`, ''], tags: [`tnc:${portArg}`] }
  }
  if (c === 'get-volume' || c === 'get-psdrive') {
    const size = w.disk[id] ?? 200 * GB
    const used = diskUsed(w, id) || size * 0.41
    return { world: w, out: ['', `DriveLetter FileSystem  Size      SizeRemaining  HealthStatus`, `C           NTFS        ${pad(human(size), 10)}${pad(human(size - used), 15)}Healthy`, ''], tags: ['disk'] }
  }
  if (c === 'restart-computer') {
    const world = log(powerCycle(w, id, ctx.scenario.startCheck), { src: me, level: 'warn', id: 1074, msg: 'The process powershell.exe has initiated the restart of computer ' + me })
    return { world, out: ['', `Broadcast message: ${me} is restarting…`, '…', `${me} is back online.`, ''], tags: ['reboot'] }
  }
  if (c === 'cls' || c === 'clear' || c === 'clear-host') return { world: w, out: [], clear: true }
  if (c === 'hostname' || c === '$env:computername') return { world: w, out: [me, ''] }
  if (c === 'whoami') return { world: w, out: [`${(w.dns?.zone ?? 'corp').split('.')[0]}\\administrator`, ''] }

  // Fallback to classic cmd commands
  const r = cmd(w, id, raw, ctx)
  if (r.out[0]?.includes('is not recognized')) return { world: w, out: [`${c0} : The term '${c0}' is not recognized as the name of a cmdlet, function, script file, or operable program.`, ''] }
  return r
}

/* ============================== Linux ============================== */

function linux(w: OpsWorld, id: string, raw: string, ctx: ShellCtx): ShellResult {
  let line = raw.trim()
  if (!line) return { world: w, out: [] }
  const sudo = /^sudo\s+/.test(line)
  line = line.replace(/^sudo\s+/, '')
  const d = dev(w.topo, id)!
  const me = d.name
  const files = w.files[id] ?? {}
  const redirect = line.match(/^(?::|true|echo(?:\s+-n)?\s*(?:""|'')?)?\s*>\s*(\S+)$/)
  const [c0, ...args] = line.split(/\s+/)
  const c = lower(c0)
  const denied = (what: string) => ({ world: w, out: [`${c0}: ${what}: Permission denied`, ''] })
  const setFiles = (f: Record<string, (typeof files)[string]>) => ({ ...w, files: { ...w.files, [id]: f } })
  const unit = (s?: string) => (s ?? '').replace(/\.service$/, '')

  if (redirect || c === 'truncate') {
    const path = redirect ? redirect[1] : args[args.length - 1]
    if (!files[path]) return { world: w, out: [`${c0}: ${path}: No such file or directory`, ''] }
    if (!sudo && path.startsWith('/var')) return denied(path)
    const world = setFiles({ ...files, [path]: { ...files[path], size: 0, content: '' } })
    return { world, out: [], tags: [`truncate:${path}`] }
  }

  if (c === 'help') {
    return {
      world: w,
      out: [
        'Useful commands (prefix admin commands with sudo):',
        '  systemctl status|start|stop|restart|enable <service>    journalctl -u <service> [-n N] | -xe',
        '  df -h    du -sh <dir>/*    ls -lh <dir>    find <dir> -size +1G',
        '  cat|tail|head <file>    nano <file>    rm <file>    truncate -s 0 <file>    logrotate -f /etc/logrotate.conf',
        '  <service> -t (test config, e.g. nginx -t)    ss -tlnp    ip a    ping -c 4 <host>    curl <url>',
        '  free -h    uptime    reboot',
        '',
      ],
    }
  }
  if (c === 'clear') return { world: w, out: [], clear: true }
  if (c === 'whoami') return { world: w, out: [sudo ? 'root' : 'admin', ''] }
  if (c === 'hostname') return { world: w, out: [args[0] === '-I' ? `${ipOf(w, id)} ` : me.toLowerCase(), ''] }
  if (c === 'uptime') return { world: w, out: [` ${stamp(w)} up 41 days,  3:12,  1 user,  load average: 0.08, 0.11, 0.09`, ''] }
  if (c === 'free') return { world: w, out: ['               total        used        free      shared  buff/cache   available', 'Mem:           7.7Gi       2.1Gi       3.9Gi        12Mi       1.7Gi       5.4Gi', 'Swap:          2.0Gi          0B       2.0Gi', ''] }
  if (c === 'ip' && /^a(ddr)?$/.test(args[0] ?? '')) {
    const nic = d.ifaces[0]
    return { world: w, out: ['1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN', '    inet 127.0.0.1/8 scope host lo', `2: ens18: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state ${nicUp(w, id) ? 'UP' : 'DOWN'}`, `    link/ether ${nic.mac.toLowerCase().replace(/\./g, '').match(/.{2}/g)!.join(':')}`, ...(nic.ip ? [`    inet ${nic.ip}/24 brd ${nic.ip.replace(/\d+$/, '255')} scope global ens18`] : []), ''] }
  }
  if (c === 'ping') {
    const target = args.filter((a) => !a.startsWith('-') && !/^\d+$/.test(a))[0]
    if (!target) return { world: w, out: ['ping: usage error: Destination address required', ''] }
    const r = pingLines(w, id, target, ctx, 'linux', 4)
    return { world: w, out: r.out, ping: r.res, tags: [`ping:${target}`] }
  }
  if (c === 'curl' || c === 'wget') return { world: w, out: curl(w, id, args.filter((a) => !a.startsWith('-'))[0] ?? '', 'linux'), tags: ['curl'] }
  if (c === 'ss' || c === 'netstat') {
    const list = (w.svcs[id] ?? []).filter((s) => s.state === 'running' && s.port)
    return { world: w, out: ['State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process', ...list.map((s) => `LISTEN  0       511            0.0.0.0:${pad(s.port!, 14)}0.0.0.0:*       users:(("${s.name}"))`), ''], tags: ['ss'] }
  }
  if (c === 'df') {
    const size = w.disk[id] ?? 50 * GB
    const used = Math.min(size, diskUsed(w, id))
    const pct = Math.round((used / size) * 100)
    return { world: w, out: ['Filesystem                 Size  Used Avail Use% Mounted on', 'tmpfs                      790M  1.2M  789M   1% /run', `/dev/mapper/ubuntu--vg-lv  ${pad(human(size), 6)}${pad(human(used), 6)}${pad(human(size - used), 6)}${pad(pct + '%', 5)}/`, 'tmpfs                      3.9G     0  3.9G   0% /dev/shm', '/dev/sda2                  2.0G  253M  1.6G  14% /boot', ''], tags: ['df'] }
  }
  const under = (dir: string) => Object.entries(files).filter(([p]) => p.startsWith(dir.endsWith('/') ? dir : dir + '/'))
  const children = (dir: string) => {
    const base = dir.replace(/\/+$/, '') || ''
    const map = new Map<string, number>()
    for (const [p, f] of under(base || '/')) {
      const rest = p.slice(base.length + 1)
      const head = rest.split('/')[0]
      const key = `${base}/${head}`
      map.set(key, (map.get(key) ?? 0) + f.size)
    }
    return map
  }
  if (c === 'du') {
    const target = args.filter((a) => !a.startsWith('-'))[0] ?? '.'
    const glob = target.endsWith('/*')
    const dir = glob ? target.slice(0, -2) : target
    if (!glob) {
      const total = files[dir]?.size ?? under(dir).reduce((n, [, f]) => n + f.size, 0)
      return { world: w, out: [`${pad(human(total), 8)}${dir}`, ''], tags: [`du:${dir}`] }
    }
    const rows = [...children(dir)].sort((a, b) => b[1] - a[1])
    return { world: w, out: [...rows.map(([p, n]) => `${pad(human(n), 8)}${p}`), ''], tags: [`du:${dir}`] }
  }
  if (c === 'ls') {
    const dir = (args.filter((a) => !a.startsWith('-'))[0] ?? '/home/admin').replace(/\/+$/, '')
    if (files[dir]) return { world: w, out: [`-rw-r--r-- 1 root root ${pad(human(files[dir].size), 6)} ${stamp(w, false)} ${dir}`, ''] }
    const rows = [...children(dir)]
    if (!rows.length) return { world: w, out: [`ls: cannot access '${dir}': No such file or directory`, ''] }
    return { world: w, out: [`total ${human(rows.reduce((n, [, s]) => n + s, 0))}`, ...rows.map(([p, n]) => `${files[p] ? '-rw-r-----' : 'drwxr-xr-x'} 1 root adm ${pad(human(n), 6)} ${stamp(w, false)} ${p.split('/').pop()}`), ''], tags: [`ls:${dir}`] }
  }
  if (c === 'find') {
    const dir = args[0] && !args[0].startsWith('-') ? args[0] : '/'
    const k = args.findIndex((a) => a === '-size')
    const spec = k >= 0 ? args[k + 1] : '+0'
    const m = spec?.match(/^\+?(\d+)([kMG]?)$/)
    const min = m ? Number(m[1]) * (m[2] === 'G' ? GB : m[2] === 'M' ? 1024 ** 2 : m[2] === 'k' ? 1024 : 1) : 0
    const hits = Object.entries(files).filter(([p, f]) => (dir === '/' || p.startsWith(dir)) && f.size >= min)
    return { world: w, out: [...hits.map(([p]) => p), ''], tags: ['find'] }
  }
  if (c === 'cat' || c === 'tail' || c === 'head' || c === 'less' || c === 'more') {
    const path = args.filter((a) => !a.startsWith('-') && !/^\d+$/.test(a))[0]
    if (!path) return { world: w, out: [] }
    if (path === '/var/log/syslog' || path === '/var/log/messages') {
      const lines = w.logs.filter((l) => l.src === me).map((l) => `${'Nov 23'} ${l.t} ${me.toLowerCase()} ${l.svc ?? 'kernel'}: ${l.msg}`)
      return { world: w, out: [...(c === 'head' ? lines.slice(0, 10) : lines.slice(-15)), ''], tags: [`read:${path}`, 'logs'] }
    }
    const f = files[path]
    if (!f) return { world: w, out: [`${c0}: ${path}: No such file or directory`, ''] }
    const lines = (f.content ?? '').split('\n')
    const shown = c === 'tail' ? lines.slice(-12) : c === 'head' ? lines.slice(0, 12) : lines
    return { world: w, out: [...shown, ''], tags: [`read:${path}`] }
  }
  if (c === 'nano' || c === 'vi' || c === 'vim') {
    const path = args[0]
    if (!path) return { world: w, out: [] }
    if (!sudo && path.startsWith('/etc')) return { world: w, out: [`[ Error: ${path} is read-only — use sudo ]`, ''] }
    return { world: w, out: [], edit: path, tags: [`edit:${path}`] }
  }
  if (c === 'rm') {
    const targets = args.filter((a) => !a.startsWith('-'))
    if (!sudo && targets.some((p) => p.startsWith('/var') || p.startsWith('/etc'))) return denied(targets[0])
    const next = { ...files }
    const tags: string[] = []
    for (const t of targets) {
      const clean = t.replace(/\/\*$/, '')
      const keys = files[t] ? [t] : t.endsWith('*') ? Object.keys(files).filter((p) => p.startsWith(t.slice(0, -1))) : /-r/.test(line) ? under(clean).map(([p]) => p) : []
      if (!keys.length) return { world: w, out: [`rm: cannot remove '${t}': ${files[clean] || under(clean).length ? 'Is a directory' : 'No such file or directory'}`, ''] }
      for (const k of keys) {
        if (files[k].critical) tags.push('rm-critical')
        delete next[k]
        tags.push(`rm:${k}`)
      }
    }
    return { world: setFiles(next), out: [], tags }
  }
  if (c === 'logrotate') {
    if (!sudo) return denied('/var/lib/logrotate/status')
    const next = { ...files }
    for (const [p, f] of Object.entries(files)) {
      if (p.startsWith('/var/log/') && p.endsWith('.log') && f.size > 100 * 1024 ** 2) {
        next[`${p}.1.gz`] = { size: Math.round(f.size / 14) }
        next[p] = { ...f, size: 0, content: '' }
      }
    }
    return { world: setFiles(next), out: [], tags: ['logrotate'] }
  }
  if (c === 'systemctl') {
    const verb = lower(args[0] ?? '')
    const n = unit(args[1])
    if (verb === 'list-units' || verb === '--failed' || (verb === '' && !n)) {
      const list = (w.svcs[id] ?? []).filter((s) => verb !== '--failed' || s.state === 'failed')
      return { world: w, out: ['  UNIT                      LOAD   ACTIVE   SUB     DESCRIPTION', ...list.map((s) => `${s.state === 'failed' ? '●' : ' '} ${pad(s.name + '.service', 26)}loaded ${pad(s.state === 'running' ? 'active' : s.state === 'failed' ? 'failed' : 'inactive', 9)}${pad(s.state === 'running' ? 'running' : s.state === 'failed' ? 'failed' : 'dead', 8)}${s.display}`), ''], tags: ['svc-list'] }
    }
    const s = svcOf(w, id, n)
    if (!s) return { world: w, out: [`Unit ${n}.service could not be found.`, ''] }
    if (verb === 'status') {
      const recent = w.logs.filter((l) => l.src === me && l.svc === s.name).slice(-5)
      const act = s.state === 'running' ? `active (running) since Mon 2026-11-23 06:02:11 UTC` : s.state === 'failed' ? `failed (Result: exit-code) since ${stamp(w)}` : 'inactive (dead)'
      return {
        world: w,
        out: [`${s.state === 'running' ? '●' : '×'} ${s.name}.service - ${s.display}`, `     Loaded: loaded (/lib/systemd/system/${s.name}.service; ${s.enabled ? 'enabled' : 'disabled'}; preset: enabled)`, `     Active: ${act}`, ...(s.state === 'running' ? [`   Main PID: ${1000 + s.name.length * 37} (${s.name})`] : []), '', ...recent.map((l) => `${l.t} ${me.toLowerCase()} ${s.name}[${1000 + s.name.length * 37}]: ${l.msg}`), ''],
        tags: [`svc-status:${s.name}`],
      }
    }
    if (!sudo) return { world: w, out: ['==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ====', 'Authentication is required to manage system services or units.', 'Failed to ' + verb + ' ' + n + '.service: Access denied', '(hint: use sudo)', ''] }
    const was = s.state === 'running'
    if (verb === 'stop') return { world: log(setSvc(w, id, s.name, { state: 'stopped' }), { src: me, level: 'info', svc: s.name, msg: `Stopped ${s.display}.` }), out: [], tags: [`svc-stop:${s.name}:${was}`] }
    if (verb === 'enable' || verb === 'disable') return { world: setSvc(w, id, s.name, { enabled: verb === 'enable' }), out: verb === 'enable' ? [`Created symlink /etc/systemd/system/multi-user.target.wants/${s.name}.service → /lib/systemd/system/${s.name}.service.`, ''] : [''], tags: [`svc-${verb}:${s.name}`] }
    if (verb === 'start' || verb === 'restart' || verb === 'reload') {
      const r = startSvc(w, id, s, ctx)
      if (r.err) return { world: r.world, out: [`Job for ${s.name}.service failed because the control process exited with error code.`, `See "systemctl status ${s.name}.service" and "journalctl -xeu ${s.name}.service" for details.`, ''], tags: [`svc-restart:${s.name}:${was}`, 'svc-fail'] }
      return { world: r.world, out: [], tags: [`svc-restart:${s.name}:${was}`] }
    }
    return { world: w, out: [`Unknown command verb ${verb}.`, ''] }
  }
  if (c === 'journalctl') {
    const k = args.findIndex((a) => a === '-u' || a === '--unit')
    const n = k >= 0 ? unit(args[k + 1]) : undefined
    const entries = w.logs.filter((l) => l.src === me && (!n || l.svc === n)).slice(-15)
    return { world: w, out: entries.length ? [...entries.map((l) => `Nov 23 ${l.t} ${me.toLowerCase()} ${l.svc ?? 'systemd'}[1]: ${l.msg}`), ''] : ['-- No entries --', ''], tags: [n ? `journal:${n}` : 'journal', 'logs'] }
  }
  if (c === 'reboot' || c === 'shutdown') {
    if (!sudo) return { world: w, out: ['Failed to set wall message, ignoring: Interactive authentication required.', 'Call to Reboot failed: Access denied', ''] }
    const world = log(powerCycle(w, id, ctx.scenario.startCheck), { src: me, level: 'warn', svc: 'systemd', msg: 'System rebooted by admin.' })
    return { world, out: ['', `Broadcast message from root@${me.toLowerCase()}: The system will reboot now!`, '…', `Connection to ${me.toLowerCase()} closed. Reconnected.`, ''], tags: ['reboot'] }
  }
  // "<svc> -t" config tests (nginx -t, apache2ctl -t, named-checkconf…)
  if (args[0] === '-t' || c === 'apache2ctl' || c === 'apachectl') {
    const name = c.replace(/ctl$/, '').replace('apache2', 'apache2')
    const s = svcOf(w, id, name)
    if (!s) return { world: w, out: [`${c0}: command not found`, ''] }
    const why = ctx.scenario.startCheck?.(w, id, s.name)
    return { world: w, out: why ? [`${s.name}: [emerg] ${why}`, `${s.name}: configuration file /etc/${s.name}/${s.name}.conf test failed`, ''] : [`${s.name}: the configuration file /etc/${s.name}/${s.name}.conf syntax is ok`, `${s.name}: configuration file /etc/${s.name}/${s.name}.conf test is successful`, ''], tags: [`config-test:${s.name}`] }
  }
  return { world: w, out: [`${c0}: command not found`, ''] }
}

/* ============================== Cisco IOS ============================== */

function iosShell(w: OpsWorld, id: string, raw: string, ctx: ShellCtx): ShellResult {
  const d = dev(w.topo, id)!
  let line = raw.trim()
  const cfg = ctx.ios.mode !== 'user' && ctx.ios.mode !== 'priv'
  if (cfg && /^do\s+/i.test(line)) line = line.replace(/^do\s+/i, '')
  const tok = line.split(/\s+/).map(lower)
  const is = (t: string | undefined, word: string) => !!t && word.startsWith(t)
  const priv = ctx.ios.mode !== 'user'
  const execOk = !cfg || /^do\s+/i.test(raw.trim())

  if (execOk && is(tok[0], 'reload')) {
    if (!priv) return { world: w, out: ['% Invalid input detected.', ''] }
    const saved = w.startup[id]
    const topo = { ...w.topo, devices: w.topo.devices.map((x) => (x.id === id && saved ? { ...structuredClone(saved), x: x.x, y: x.y } : x)) }
    let world = log({ ...w, topo }, { src: d.name, level: 'crit', svc: 'SYS-5-RELOAD', msg: 'Reload requested by console. Reload Reason: Reload Command.' })
    for (const c of world.dhcpClients) world = renew(world, c).world
    return { world, out: ['Proceed with reload? [confirm]', '', '%SYS-5-RELOAD: Reload requested by console.', 'System Bootstrap, Version 16.9 …', '', `${d.name} con0 is now available`, '', 'Press RETURN to get started.', ''], tags: ['reload'], ios: { mode: 'user', targets: [] } }
  }
  if (execOk && priv && ((is(tok[0], 'write') && (!tok[1] || is(tok[1], 'memory'))) || (is(tok[0], 'copy') && is(tok[1], 'running-config') && is(tok[2], 'startup-config')))) {
    const world = { ...w, startup: { ...w.startup, [id]: structuredClone(d) } }
    return { world, out: is(tok[0], 'copy') ? ['Destination filename [startup-config]? ', 'Building configuration...', '[OK]', ''] : ['Building configuration...', '[OK]', ''], tags: ['save-config'] }
  }
  if (execOk && is(tok[0], 'show')) {
    if (is(tok[1], 'logging')) {
      const entries = w.logs.filter((l) => l.src === d.name).slice(-20)
      return { world: w, out: ['Syslog logging: enabled (0 messages dropped)', '', 'Log Buffer (8192 bytes):', ...entries.map((l) => `*Nov 23 ${l.t}: %${l.svc ?? 'SYS-5'}: ${l.msg}`), ''], tags: ['show-logging', 'logs'] }
    }
    if (is(tok[1], 'interfaces') && is(tok[2], 'status')) {
      const out = ['', `${pad('Port', 10)}${pad('Name', 19)}${pad('Status', 13)}${pad('Vlan', 11)}${pad('Duplex', 7)}${pad('Speed', 7)}Type`]
      for (const i of d.ifaces) {
        if (i.name.startsWith('Lo')) continue
        const l = linkAt(w.topo, { dev: id, iface: i.name })
        const peer = l && dev(w.topo, peerOf(l, { dev: id, iface: i.name }).dev)
        const peerIf = l && peer && peer.ifaces.find((x) => x.name === peerOf(l, { dev: id, iface: i.name }).iface)
        const st = !i.up ? 'disabled' : i.err ? 'err-disabled' : l && peerIf?.up && !peerIf.err ? 'connected' : 'notconnect'
        out.push(`${pad(i.name, 10)}${pad((i.description ?? '').slice(0, 18), 19)}${pad(st, 13)}${pad(i.mode === 'trunk' ? 'trunk' : d.type === 'switch' ? (i.vlan ?? 1) : 'routed', 11)}${pad(st === 'connected' ? 'a-full' : 'auto', 7)}${pad(st === 'connected' ? (i.name.startsWith('Gi') ? 'a-1000' : 'a-100') : 'auto', 7)}10/100BaseTX`)
      }
      return { world: w, out: [...out, ''], tags: ['show-int-status'] }
    }
    if (is(tok[1], 'mac') || is(tok[1], 'mac-address-table')) {
      if (d.type !== 'switch') return { world: w, out: ['% Invalid input detected.', ''] }
      const out = ['          Mac Address Table', '-------------------------------------------', '', 'Vlan    Mac Address       Type        Ports', '----    -----------       --------    -----']
      for (const i of d.ifaces) {
        const l = linkAt(w.topo, { dev: id, iface: i.name })
        if (!l || !i.up || i.err) continue
        const p = peerOf(l, { dev: id, iface: i.name })
        const pd = dev(w.topo, p.dev)
        if (!pd || !isHost(pd.type)) continue
        const pi = pd.ifaces.find((x) => x.name === p.iface)!
        out.push(`${pad(i.mode === 'trunk' ? 1 : (i.vlan ?? 1), 8)}${pad(pi.mac.toLowerCase(), 18)}${pad('DYNAMIC', 12)}${i.name}`)
      }
      for (const extra of (w.flags.macExtra as { vlan: number; mac: string; port: string; sw: string }[] | undefined) ?? []) if (extra.sw === id) out.push(`${pad(extra.vlan, 8)}${pad(extra.mac, 18)}${pad('DYNAMIC', 12)}${extra.port}`)
      return { world: w, out: [...out, ''], tags: ['show-mac'] }
    }
    if (is(tok[1], 'cdp') && is(tok[2], 'neighbors')) {
      const out = ['Device ID        Local Intrfce     Holdtme    Capability  Platform    Port ID']
      for (const i of d.ifaces) {
        const l = linkAt(w.topo, { dev: id, iface: i.name })
        if (!l) continue
        const p = peerOf(l, { dev: id, iface: i.name })
        const pd = dev(w.topo, p.dev)
        if (!pd || isHost(pd.type) || w.os[pd.id] !== 'ios') continue
        out.push(`${pad(pd.name, 17)}${pad(longIface(i.name).replace('GigabitEthernet', 'Gig ').replace('FastEthernet', 'Fas '), 18)}${pad(163, 11)}${pad(pd.type === 'switch' ? 'S I' : 'R', 12)}${pad(pd.type === 'switch' ? '2960' : 'ISR4331', 12)}${longIface(p.iface).replace('GigabitEthernet', 'Gig ').replace('FastEthernet', 'Fas ')}`)
      }
      return { world: w, out: [...out, ''], tags: ['show-cdp'] }
    }
    if (is(tok[1], 'port-security')) {
      const ps = (w.flags.portSecurity as { sw: string; port: string; max: number; count: number; violations: number }[] | undefined) ?? []
      const rows = ps.filter((p) => p.sw === id)
      return { world: w, out: ['Secure Port  MaxSecureAddr  CurrentAddr  SecurityViolation  Security Action', '                (Count)       (Count)          (Count)', '---------------------------------------------------------------------------', ...rows.map((p) => `${pad(p.port, 13)}${pad(p.max, 15)}${pad(p.count, 13)}${pad(p.violations, 19)}Shutdown`), '---------------------------------------------------------------------------', ''], tags: ['show-port-security'] }
    }
    if (is(tok[1], 'access-lists') || (is(tok[1], 'running-config') && d.type === 'firewall')) {
      // fall through to normal running-config for routers; firewalls show policy
      if (d.type === 'firewall' && w.fw) {
        return { world: w, out: ['', ...w.fw.rules.map((r, k) => `access-list OUTSIDE_IN line ${k + 1} extended ${r.action === 'allow' ? 'permit' : 'deny'} tcp ${r.src === 'any' ? 'any' : r.src} ${r.dst === 'any' ? 'any' : 'host ' + r.dst} ${r.port === 'any' ? '' : 'eq ' + r.port}${r.enabled ? '' : ' inactive'} (${r.name})`), 'access-list OUTSIDE_IN implicit deny ip any any', ''], tags: ['fw-view'] }
      }
    }
  }
  const r = runIos(w.topo, id, ctx.ios, raw, ctx.arp)
  return { world: { ...w, topo: r.topo }, out: r.out, ios: r.state, ping: r.ping, tags: tagsForIos(raw, ctx.ios) }
}

function tagsForIos(raw: string, s: IosState): string[] {
  const l = raw.trim().toLowerCase()
  const tags: string[] = []
  if (/^(do )?sh(ow)? ip int/.test(l)) tags.push('show-ip-int')
  if (/^(do )?sh(ow)? run/.test(l)) tags.push('show-run')
  if (/^(do )?sh(ow)? ip ro/.test(l)) tags.push('show-route')
  if (/^(do )?sh(ow)? vlan/.test(l)) tags.push('show-vlan')
  if (/^(do )?ping/.test(l)) tags.push('ping')
  if (/^no sh/.test(l) && s.mode === 'config-if') tags.push(`no-shut:${s.targets.join(',')}`)
  if (/^sh/.test(l) && s.mode === 'config-if') tags.push(`shut:${s.targets.join(',')}`)
  return tags
}
