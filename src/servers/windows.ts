/**
 * Simulated Windows Server 2022 VM for Lab 4 (AD DS deployment) — no VirtualBox needed.
 * Pure state machine: (state, PowerShell line) → new state + console output.
 */

export interface WinUser { name: string; sam: string; ou: string; enabled: boolean; hasPassword: boolean }
export interface WinShare { name: string; path: string; access: { who: string; right: 'Full' | 'Change' | 'Read' }[] }

export interface WinState {
  hostname: string
  pendingName?: string
  dhcp: boolean
  ip: string
  prefix: number
  gateway: string
  dns: string[]
  features: string[]
  domain: string | null
  netbios: string | null
  ous: string[]
  groups: Record<string, { ou: string; scope: string; members: string[] }>
  users: Record<string, WinUser>
  folders: string[]
  shares: Record<string, WinShare>
  ntfs: Record<string, { who: string; right: string }[]>
  boots: number
}

export const initialWin = (): WinState => ({
  hostname: 'WIN-7Q3K2LA9F1M',
  dhcp: true,
  ip: '192.168.56.101',
  prefix: 24,
  gateway: '192.168.56.1',
  dns: ['192.168.56.1'],
  features: ['FileAndStorage-Services', 'Storage-Services'],
  domain: null,
  netbios: null,
  ous: [],
  groups: {},
  users: {},
  folders: ['C:\\Users', 'C:\\Windows', 'C:\\Program Files'],
  shares: {},
  ntfs: {},
  boots: 1,
})

export interface VmResult<S> { state: S; out: string[]; clear?: boolean; edit?: string }

/* ------------------------------ argument parsing ------------------------------ */

/** Split a PowerShell line into tokens, keeping quoted strings and (sub-expressions) together. */
function tokens(line: string): string[] {
  const out: string[] = []
  let cur = ''
  let q: string | null = null
  let depth = 0
  for (const ch of line) {
    if (q) {
      if (ch === q) q = null
      else cur += ch
      continue
    }
    if (ch === '"' || ch === "'") { q = ch; continue }
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (/\s/.test(ch) && depth === 0) {
      if (cur) out.push(cur)
      cur = ''
      continue
    }
    cur += ch
  }
  if (cur) out.push(cur)
  return out
}

function params(tok: string[]) {
  const named: Record<string, string> = {}
  const pos: string[] = []
  for (let k = 1; k < tok.length; k++) {
    const x = tok[k]
    if (/^-[A-Za-z]/.test(x)) {
      const key = x.slice(1).toLowerCase()
      const next = tok[k + 1]
      if (next !== undefined && !/^-[A-Za-z]/.test(next)) {
        named[key] = next
        k++
      } else named[key] = 'true'
    } else pos.push(x)
  }
  return { named, pos }
}

const get = (p: { named: Record<string, string> }, ...keys: string[]) => {
  for (const k of keys) if (p.named[k.toLowerCase()] !== undefined) return p.named[k.toLowerCase()]
  return undefined
}

const dn = (domain: string) => domain.split('.').map((x) => `DC=${x}`).join(',')
const err = (cmd: string, msg: string) => [`${cmd} : ${msg}`, '    + CategoryInfo          : InvalidOperation', '']
const validIp = (s?: string) => !!s && /^(\d{1,3}\.){3}\d{1,3}$/.test(s) && s.split('.').every((o) => Number(o) <= 255)
const normPath = (p: string) => p.replace(/\//g, '\\').replace(/\\+$/, '')

/* ------------------------------ the shell ------------------------------ */

export function winPrompt(_s: WinState) {
  return `PS C:\\Users\\Administrator> `
}

export function winBanner(s: WinState): string[] {
  return [
    'Windows PowerShell',
    'Copyright (C) Microsoft Corporation. All rights reserved.',
    '',
    `Logged on to ${s.hostname}${s.domain ? ` (${s.netbios}\\Administrator)` : ' as Administrator'} — Windows Server 2022 Standard Evaluation`,
    'Type help to list the commands available in this lab.',
    '',
  ]
}

export function runWin(s0: WinState, raw: string): VmResult<WinState> {
  const s: WinState = structuredClone(s0)
  const line = raw.trim().replace(/\s*\|\s*(Select-Object|select|Format-List|fl|Format-Table|ft)\b.*$/i, '')
  if (!line) return { state: s, out: [] }
  const tok = tokens(line)
  const cmd = tok[0]
  const c = cmd.toLowerCase()
  const p = params(tok)

  switch (c) {
    case 'help':
    case 'get-help':
      return {
        state: s,
        out: [
          'Commands available in this virtual machine:',
          '  hostname · ipconfig [/all] · Get-NetIPAddress · Restart-Computer · cls',
          '  Rename-Computer -NewName <name> [-Restart]',
          '  New-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress <ip> -PrefixLength <n> -DefaultGateway <gw>',
          '  Set-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses <ip>',
          '  Get-WindowsFeature [name]   Install-WindowsFeature <name> [-IncludeManagementTools]',
          '  Install-ADDSForest -DomainName <fqdn> -DomainNetbiosName <NAME> -InstallDns',
          '  Get-ADDomain · New-ADOrganizationalUnit -Name <ou> · Get-ADOrganizationalUnit -Filter *',
          '  New-ADGroup -Name <g> -GroupScope Global -Path "OU=…,DC=…"',
          '  New-ADUser -Name "<full name>" -SamAccountName <sam> -Path "OU=…" -AccountPassword (Read-Host -AsSecureString) -Enabled $true',
          '  Get-ADUser <sam> · Add-ADGroupMember -Identity <g> -Members <sam> · Get-ADGroupMember <g>',
          '  New-Item -Path <dir> -ItemType Directory · New-SmbShare -Name <n> -Path <dir> -ChangeAccess "<DOMAIN\\group>"',
          '  Get-SmbShare [name] · icacls <dir> [/grant "<DOMAIN\\group>:(OI)(CI)M"]',
          '',
        ],
      }
    case 'cls':
    case 'clear':
    case 'clear-host':
      return { state: s, out: [], clear: true }
    case 'hostname':
    case '$env:computername':
      return { state: s, out: [s.hostname, ''] }
    case 'whoami':
      return { state: s, out: [`${(s.netbios ?? s.hostname).toLowerCase()}\\administrator`, ''] }
    case 'ipconfig':
    case 'get-netipaddress':
    case 'get-netipconfiguration':
      return {
        state: s,
        out: [
          '',
          'Ethernet adapter Ethernet:',
          '',
          `   DHCP Enabled. . . . . . . . . . . : ${s.dhcp ? 'Yes' : 'No'}`,
          `   IPv4 Address. . . . . . . . . . . : ${s.ip}`,
          `   Subnet Mask . . . . . . . . . . . : ${['255.255.255.0', '255.255.0.0'][s.prefix === 16 ? 1 : 0]}`,
          `   Default Gateway . . . . . . . . . : ${s.gateway}`,
          `   DNS Servers . . . . . . . . . . . : ${s.dns.join(', ')}`,
          '',
        ],
      }
    case 'rename-computer': {
      const name = get(p, 'NewName') ?? p.pos[0]
      if (!name) return { state: s, out: err(cmd, 'Missing an argument for parameter \'NewName\'.') }
      if (!/^[A-Za-z0-9-]{1,15}$/.test(name)) return { state: s, out: err(cmd, `Skip computer '${s.hostname}' with new name '${name}' because the new name is not valid.`) }
      if (s.domain) return { state: s, out: ['WARNING: Renaming a domain controller is not supported in this lab.', ''] }
      s.pendingName = name
      if (get(p, 'Restart')) return reboot(s, [`WARNING: The changes will take effect after you restart the computer ${s.hostname}.`])
      return { state: s, out: [`WARNING: The changes will take effect after you restart the computer ${s.hostname}.`, ''] }
    }
    case 'restart-computer':
      return reboot(s, [])
    case 'new-netipaddress': {
      const ip = get(p, 'IPAddress')
      const prefix = Number(get(p, 'PrefixLength'))
      const gw = get(p, 'DefaultGateway')
      if (!validIp(ip) || !prefix) return { state: s, out: err(cmd, 'Cannot validate argument on parameter \'IPAddress\' or \'PrefixLength\'.') }
      if (gw && !validIp(gw)) return { state: s, out: err(cmd, 'Invalid DefaultGateway.') }
      s.dhcp = false
      s.ip = ip!
      s.prefix = prefix
      if (gw) s.gateway = gw
      return { state: s, out: ['', `IPAddress         : ${ip}`, 'InterfaceAlias    : Ethernet', 'AddressFamily     : IPv4', `PrefixLength      : ${prefix}`, 'PrefixOrigin      : Manual', ''] }
    }
    case 'set-dnsclientserveraddress': {
      const v = get(p, 'ServerAddresses')
      if (!v) return { state: s, out: err(cmd, 'Missing an argument for parameter \'ServerAddresses\'.') }
      const list = v.split(',').map((x) => x.trim()).filter(Boolean)
      if (!list.every(validIp)) return { state: s, out: err(cmd, 'Invalid server address.') }
      s.dns = list
      return { state: s, out: [''] }
    }
    case 'get-windowsfeature': {
      const filter = (p.pos[0] ?? get(p, 'Name') ?? '').replace(/\*/g, '').toLowerCase()
      const all = ['AD-Domain-Services', 'DHCP', 'DNS', 'FileAndStorage-Services', 'Storage-Services', 'Web-Server']
      const rows = all.filter((f) => !filter || f.toLowerCase().includes(filter))
      return { state: s, out: ['', 'Display Name                                      Name                       Install State', '------------                                      ----                       -------------', ...rows.map((f) => `[${s.features.includes(f) ? 'X' : ' '}] ${f.padEnd(46)} ${f.padEnd(26)} ${s.features.includes(f) ? 'Installed' : 'Available'}`), ''] }
    }
    case 'install-windowsfeature':
    case 'add-windowsfeature': {
      const name = get(p, 'Name') ?? p.pos[0]
      const known = ['AD-Domain-Services', 'DHCP', 'DNS', 'Web-Server']
      const f = known.find((k) => k.toLowerCase() === (name ?? '').toLowerCase())
      if (!f) return { state: s, out: err(cmd, `ArgumentNotValid: The role, role service, or feature name is not valid: '${name ?? ''}'.`) }
      if (!s.features.includes(f)) s.features.push(f)
      if (f === 'AD-Domain-Services' && get(p, 'IncludeManagementTools') && !s.features.includes('RSAT-AD-Tools')) s.features.push('RSAT-AD-Tools')
      return { state: s, out: ['', 'Success Restart Needed Exit Code      Feature Result', '------- -------------- ---------      --------------', `True    No             Success        {${f === 'AD-Domain-Services' ? 'Active Directory Domain Services' : f}${get(p, 'IncludeManagementTools') ? ', Remote Server Administration Tools' : ''}}`, ''] }
    }
    case 'install-addsforest': {
      const domain = get(p, 'DomainName')
      if (!s.features.includes('AD-Domain-Services')) return { state: s, out: err(cmd, 'The term \'Install-ADDSForest\' is not recognized. Install the AD-Domain-Services role first.') }
      if (s.domain) return { state: s, out: err(cmd, 'This server is already a domain controller.') }
      if (!domain || !/^[a-z0-9-]+(\.[a-z0-9-]+)+$/i.test(domain)) return { state: s, out: err(cmd, 'A valid DomainName (FQDN, e.g. netlab.local) is required.') }
      if (s.dhcp) return { state: s, out: ['Validating environment and user input', 'Test.VerifyDcPromoCore.DCPromo.General.73', '', `${cmd} : Verification of prerequisites for Domain Controller promotion failed.`, '  This computer has at least one physical network adapter that does not have static IP address(es) assigned.', '  A domain controller must have a static IP address. Configure one and try again.', ''] }
      if (s.hostname.startsWith('WIN-')) return { state: s, out: ['WARNING: This computer still has its random default name. Rename it (e.g. DC01) before promotion — renaming a DC later is painful.', ''] }
      s.domain = domain.toLowerCase()
      s.netbios = (get(p, 'DomainNetbiosName') ?? domain.split('.')[0]).toUpperCase()
      if (!s.features.includes('DNS')) s.features.push('DNS')
      s.dns = ['127.0.0.1']
      const out = ['SafeModeAdministratorPassword: ************', 'Confirm SafeModeAdministratorPassword: ************', '', 'The target server will be configured as a domain controller and restarted when this operation is complete.', '', 'Validating environment and user input', 'Installing new forest', `Creating the DNS zone ${s.domain}`, 'Configuring the local computer to host Active Directory Domain Services', '', 'Message                                  Context           RebootRequired  Status', '-------                                  -------           --------------  ------', 'Operation completed successfully         DCPromo.General.3 False           Success', '']
      return reboot(s, out)
    }
    case 'get-addomain': {
      if (!s.domain) return { state: s, out: err(cmd, 'Unable to find a default server with Active Directory Web Services running.') }
      return { state: s, out: ['', `DistinguishedName : ${dn(s.domain)}`, `DNSRoot           : ${s.domain}`, `NetBIOSName       : ${s.netbios}`, `Forest            : ${s.domain}`, `PDCEmulator       : ${s.hostname}.${s.domain}`, ''] }
    }
  }

  /* ------------------------------ Active Directory objects ------------------------------ */
  if (c.includes('-ad') && !s.domain) return { state: s, out: err(cmd, 'Unable to contact the server. This server is not a domain controller yet (Install-ADDSForest).') }
  const ouPath = (path?: string) => {
    if (!path) return 'Users'
    const m = path.match(/^OU=([^,]+),(.+)$/i)
    if (!m) return null
    if (m[2].toLowerCase() !== dn(s.domain!).toLowerCase()) return null
    return s.ous.find((o) => o.toLowerCase() === m[1].toLowerCase()) ?? null
  }

  switch (c) {
    case 'new-adorganizationalunit': {
      const name = get(p, 'Name') ?? p.pos[0]
      if (!name) return { state: s, out: err(cmd, 'Missing an argument for parameter \'Name\'.') }
      if (s.ous.some((o) => o.toLowerCase() === name.toLowerCase())) return { state: s, out: err(cmd, 'An attempt was made to add an object to the directory with a name that is already in use.') }
      s.ous.push(name)
      return { state: s, out: [''] }
    }
    case 'get-adorganizationalunit':
      return { state: s, out: ['', ...s.ous.map((o) => `Name              : ${o}\nDistinguishedName : OU=${o},${dn(s.domain!)}\n`).flatMap((x) => x.split('\n'))] }
    case 'new-adgroup': {
      const name = get(p, 'Name') ?? p.pos[0]
      const scope = get(p, 'GroupScope')
      if (!name || !scope) return { state: s, out: err(cmd, 'Name and GroupScope are required (e.g. -GroupScope Global).') }
      const ou = ouPath(get(p, 'Path'))
      if (ou === null) return { state: s, out: err(cmd, `Directory object not found: '${get(p, 'Path')}'. Does the OU exist?`) }
      s.groups[name] = { ou, scope, members: [] }
      return { state: s, out: [''] }
    }
    case 'new-aduser': {
      const name = get(p, 'Name') ?? p.pos[0]
      const sam = get(p, 'SamAccountName') ?? name?.toLowerCase().replace(/\s+/g, '')
      if (!name || !sam) return { state: s, out: err(cmd, 'Missing an argument for parameter \'Name\'.') }
      const ou = ouPath(get(p, 'Path'))
      if (ou === null) return { state: s, out: err(cmd, `Directory object not found: '${get(p, 'Path')}'. Does the OU exist?`) }
      if (s.users[sam.toLowerCase()]) return { state: s, out: err(cmd, 'The specified account already exists.') }
      const pwd = /read-host/i.test(line) || !!get(p, 'AccountPassword')
      const enabled = /-enabled\s+\$?true/i.test(line)
      if (enabled && !pwd) return { state: s, out: err(cmd, 'The password does not meet the length, complexity, or history requirement of the domain. An enabled account needs a password (-AccountPassword).') }
      s.users[sam.toLowerCase()] = { name, sam: sam.toLowerCase(), ou, enabled, hasPassword: pwd }
      return { state: s, out: [...(pwd ? ['************'] : []), ...(enabled ? [] : ['WARNING: The account was created disabled. Use Enable-ADAccount or -Enabled $true.']), ''] }
    }
    case 'enable-adaccount': {
      const u = s.users[(get(p, 'Identity') ?? p.pos[0] ?? '').toLowerCase()]
      if (!u) return { state: s, out: err(cmd, 'Cannot find an object with identity.') }
      if (!u.hasPassword) return { state: s, out: err(cmd, 'The password does not meet the requirements — set one with Set-ADAccountPassword first.') }
      u.enabled = true
      return { state: s, out: [''] }
    }
    case 'set-adaccountpassword': {
      const u = s.users[(get(p, 'Identity') ?? p.pos[0] ?? '').toLowerCase()]
      if (!u) return { state: s, out: err(cmd, 'Cannot find an object with identity.') }
      u.hasPassword = true
      return { state: s, out: ['Please enter the desired password: ************', ''] }
    }
    case 'get-aduser': {
      const id = (get(p, 'Identity') ?? p.pos[0] ?? '').toLowerCase()
      if (id === '*' || get(p, 'Filter')) return { state: s, out: ['', ...Object.values(s.users).map((u) => `${u.sam.padEnd(14)}${u.name.padEnd(24)}OU=${u.ou}  Enabled=${u.enabled ? 'True' : 'False'}`), ''] }
      const u = s.users[id]
      if (!u) return { state: s, out: err(cmd, `Cannot find an object with identity: '${id}' under: '${dn(s.domain!)}'.`) }
      return { state: s, out: ['', `DistinguishedName : CN=${u.name},${u.ou === 'Users' ? 'CN=Users' : `OU=${u.ou}`},${dn(s.domain!)}`, `Enabled           : ${u.enabled ? 'True' : 'False'}`, `Name              : ${u.name}`, `SamAccountName    : ${u.sam}`, `UserPrincipalName : ${u.sam}@${s.domain}`, ''] }
    }
    case 'add-adgroupmember': {
      const g = get(p, 'Identity') ?? p.pos[0]
      const m = get(p, 'Members') ?? p.pos[1]
      const group = g ? Object.keys(s.groups).find((x) => x.toLowerCase() === g.toLowerCase()) : undefined
      if (!group) return { state: s, out: err(cmd, `Cannot find an object with identity: '${g ?? ''}'.`) }
      const users = (m ?? '').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean)
      if (!users.length || users.some((u) => !s.users[u])) return { state: s, out: err(cmd, `Cannot find an object with identity: '${m ?? ''}'.`) }
      for (const u of users) if (!s.groups[group].members.includes(u)) s.groups[group].members.push(u)
      return { state: s, out: [''] }
    }
    case 'get-adgroupmember': {
      const g = get(p, 'Identity') ?? p.pos[0]
      const group = g ? Object.keys(s.groups).find((x) => x.toLowerCase() === g.toLowerCase()) : undefined
      if (!group) return { state: s, out: err(cmd, `Cannot find an object with identity: '${g ?? ''}'.`) }
      return { state: s, out: ['', ...s.groups[group].members.map((u) => `name           : ${s.users[u]?.name}\nSamAccountName : ${u}\n`).flatMap((x) => x.split('\n'))] }
    }
    case 'get-adgroup':
      return { state: s, out: ['', ...Object.entries(s.groups).map(([n, g]) => `${n.padEnd(20)}${g.scope.padEnd(10)}OU=${g.ou}`), ''] }
  }

  /* ------------------------------ files and shares ------------------------------ */
  const resolveWho = (who: string) => {
    const [dom, name] = who.includes('\\') ? who.split('\\') : [s.netbios ?? '', who]
    if (!s.domain || dom.toUpperCase() !== s.netbios) return null
    const g = Object.keys(s.groups).find((x) => x.toLowerCase() === name.toLowerCase())
    if (g) return `${s.netbios}\\${g}`
    const u = s.users[name.toLowerCase()]
    if (u) return `${s.netbios}\\${u.sam}`
    return null
  }

  switch (c) {
    case 'new-item':
    case 'mkdir':
    case 'md': {
      const path = normPath(get(p, 'Path') ?? p.pos[0] ?? '')
      if (!/^C:\\/i.test(path)) return { state: s, out: err(cmd, 'Specify a full path such as C:\\Shares\\Accounting.') }
      const parts = path.split('\\')
      for (let k = 2; k <= parts.length; k++) {
        const sub = parts.slice(0, k).join('\\')
        if (!s.folders.some((f) => f.toLowerCase() === sub.toLowerCase())) s.folders.push(sub)
      }
      return { state: s, out: ['', `    Directory: ${parts.slice(0, -1).join('\\')}`, '', 'Mode                 LastWriteTime         Length Name', '----                 -------------         ------ ----', `d-----        23/11/2026     09:14                ${parts[parts.length - 1]}`, ''] }
    }
    case 'new-smbshare': {
      const name = get(p, 'Name')
      const path = normPath(get(p, 'Path') ?? '')
      if (!name || !path) return { state: s, out: err(cmd, 'Name and Path are required.') }
      if (!s.folders.some((f) => f.toLowerCase() === path.toLowerCase())) return { state: s, out: err(cmd, 'The system cannot find the file specified. Create the folder first (New-Item).') }
      const access: WinShare['access'] = []
      for (const [k, right] of [['fullaccess', 'Full'], ['changeaccess', 'Change'], ['readaccess', 'Read']] as const) {
        const v = p.named[k]
        if (!v) continue
        for (const who of v.split(',')) {
          const r = resolveWho(who.trim())
          if (!r) return { state: s, out: err(cmd, `No mapping between account names and security IDs was done: '${who.trim()}'.`) }
          access.push({ who: r, right })
        }
      }
      s.shares[name] = { name, path, access }
      return { state: s, out: ['', 'Name        ScopeName Path                    Description', '----        --------- ----                    -----------', `${name.padEnd(12)}*         ${path.padEnd(24)}`, ''] }
    }
    case 'get-smbshare': {
      const n = get(p, 'Name') ?? p.pos[0]
      const list = Object.values(s.shares).filter((x) => !n || x.name.toLowerCase() === n.toLowerCase())
      const base = [['ADMIN$', 'C:\\Windows'], ['C$', 'C:\\'], ['IPC$', ''], ...(s.domain ? [['NETLOGON', 'C:\\Windows\\SYSVOL\\sysvol\\netlogon'], ['SYSVOL', 'C:\\Windows\\SYSVOL\\sysvol']] : [])]
      return { state: s, out: ['', 'Name        Path                      Access', '----        ----                      ------', ...(n ? [] : base.map(([a, b]) => `${a.padEnd(12)}${b.padEnd(26)}`)), ...list.map((x) => `${x.name.padEnd(12)}${x.path.padEnd(26)}${x.access.map((a) => `${a.who}:${a.right}`).join(', ')}`), ''] }
    }
    case 'icacls': {
      const path = normPath(p.pos[0] ?? '')
      if (!s.folders.some((f) => f.toLowerCase() === path.toLowerCase())) return { state: s, out: [`${path}: The system cannot find the file specified.`, 'Successfully processed 0 files; Failed processing 1 files', ''] }
      const gi = tok.findIndex((x) => x.toLowerCase() === '/grant')
      const key = path.toLowerCase()
      if (gi > 0) {
        const spec = tok[gi + 1] ?? ''
        const m = spec.match(/^(.+?):(\(OI\))?(\(CI\))?\(?([FMRW]|RX)\)?$/i)
        if (!m) return { state: s, out: ['Invalid parameter "' + spec + '"', ''] }
        const who = resolveWho(m[1])
        if (!who) return { state: s, out: [`${m[1]}: No mapping between account names and security IDs was done.`, 'Successfully processed 0 files; Failed processing 1 files', ''] }
        const inherit = !!m[2] && !!m[3]
        s.ntfs[key] = [...(s.ntfs[key] ?? []).filter((x) => x.who !== who), { who, right: `${inherit ? '(OI)(CI)' : ''}${m[4].toUpperCase()}` }]
        return { state: s, out: [`processed file: ${path}`, 'Successfully processed 1 files; Failed processing 0 files', ''] }
      }
      return { state: s, out: [`${path} BUILTIN\\Administrators:(OI)(CI)(F)`, '            NT AUTHORITY\\SYSTEM:(OI)(CI)(F)', ...(s.ntfs[key] ?? []).map((x) => `            ${x.who}:${x.right}`), '', 'Successfully processed 1 files; Failed processing 0 files', ''] }
    }
    case 'dir':
    case 'ls':
    case 'get-childitem': {
      const path = normPath(get(p, 'Path') ?? p.pos[0] ?? 'C:\\')
      const kids = s.folders.filter((f) => f.toLowerCase().startsWith(path.toLowerCase() + '\\') && f.split('\\').length === path.split('\\').length + 1)
      return { state: s, out: ['', `    Directory: ${path}`, '', ...kids.map((k) => `d-----        23/11/2026     09:14                ${k.split('\\').pop()}`), ''] }
    }
  }
  return { state: s, out: [`${cmd} : The term '${cmd}' is not recognized as the name of a cmdlet, function, script file, or operable program.`, 'Type help to see the commands available in this lab.', ''] }
}

function reboot(s: WinState, before: string[]): VmResult<WinState> {
  if (s.pendingName) {
    s.hostname = s.pendingName
    s.pendingName = undefined
  }
  s.boots++
  return { state: s, out: [...before, '', '*** Restarting… ***', '', ...winBanner(s)], clear: false }
}
