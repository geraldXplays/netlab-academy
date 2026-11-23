/**
 * Simulated Ubuntu Server 24.04 VM + the admin's laptop for Lab 5 — no VirtualBox needed.
 */
import type { VmResult } from './windows'

export const NETPLAN = '/etc/netplan/50-cloud-init.yaml'
export const SSHD = '/etc/ssh/sshd_config'

const NETPLAN_DEFAULT = `# This file is generated from information provided by the datasource.
network:
  version: 2
  ethernets:
    enp0s3:
      dhcp4: true
`
const SSHD_DEFAULT = `# OpenSSH server configuration
Include /etc/ssh/sshd_config.d/*.conf
Port 22
#PermitRootLogin prohibit-password
PermitRootLogin yes
#PubkeyAuthentication yes
PasswordAuthentication yes
KbdInteractiveAuthentication no
UsePAM yes
X11Forwarding yes
PrintMotd no
Subsystem sftp /usr/lib/openssh/sftp-server
`

export interface LinuxState {
  hostname: string
  files: Record<string, string>
  /** applied network config */
  ip: string
  prefix: number
  gateway: string
  dns: string[]
  users: Record<string, string[]>
  packages: string[]
  services: Record<string, { running: boolean; enabled: boolean }>
  /** sshd settings currently loaded by the running daemon */
  sshdLoaded: { password: boolean; root: boolean }
  ufw: { enabled: boolean; rules: string[] }
  aptUpdated: boolean
  laptop: { hasKey: boolean }
  authorizedKeys: string[]
}

export const initialLinux = (): LinuxState => ({
  hostname: 'ubuntu-srv',
  files: { [NETPLAN]: NETPLAN_DEFAULT, [SSHD]: SSHD_DEFAULT, '/etc/hostname': 'ubuntu-srv\n' },
  ip: '192.168.56.102',
  prefix: 24,
  gateway: '192.168.56.1',
  dns: ['192.168.56.1'],
  users: { sysadmin: ['sysadmin', 'adm', 'sudo'] },
  packages: ['openssh-server'],
  services: { ssh: { running: true, enabled: true } },
  sshdLoaded: { password: true, root: true },
  ufw: { enabled: false, rules: [] },
  aptUpdated: false,
  laptop: { hasKey: false },
  authorizedKeys: [],
})

/* ------------------------------ helpers ------------------------------ */

/** Tiny netplan parser: enough YAML to read addresses, gateway and nameservers (and reject tabs). */
export function parseNetplan(txt: string): { ok: true; ip?: string; prefix?: number; gw?: string; dns: string[]; dhcp: boolean } | { ok: false; error: string } {
  if (/\t/.test(txt)) {
    const line = txt.split('\n').findIndex((l) => l.includes('\t')) + 1
    return { ok: false, error: `${NETPLAN}:${line}:1: Invalid YAML: tabs are not allowed for indent` }
  }
  if (!/^network:/m.test(txt)) return { ok: false, error: `${NETPLAN}: missing "network:" key` }
  const addr = txt.match(/addresses:\s*\[\s*([\d.]+)\/(\d+)\s*\]/) ?? txt.match(/addresses:\s*\n\s*-\s*([\d.]+)\/(\d+)/)
  const via = txt.match(/via:\s*([\d.]+)/) ?? txt.match(/gateway4:\s*([\d.]+)/)
  const ns = txt.match(/nameservers:\s*\n\s*addresses:\s*\[([^\]]*)\]/)
  const dhcp = /dhcp4:\s*(true|yes)/.test(txt)
  if (!addr && !dhcp) return { ok: false, error: `${NETPLAN}: enp0s3 has neither dhcp4 nor addresses` }
  return { ok: true, ip: addr?.[1], prefix: addr ? Number(addr[2]) : undefined, gw: via?.[1], dns: ns ? ns[1].split(',').map((x) => x.trim()).filter(Boolean) : [], dhcp: !addr && dhcp }
}

const sshdValue = (txt: string, key: string) => {
  const m = txt.split('\n').map((l) => l.trim()).filter((l) => !l.startsWith('#')).map((l) => l.split(/\s+/)).find((p) => p[0]?.toLowerCase() === key.toLowerCase())
  return m?.[1]?.toLowerCase()
}

export const linuxPrompt = (s: LinuxState, user = 'sysadmin') => `${user}@${s.hostname}:~$ `
export const laptopPrompt = () => 'you@laptop:~$ '

export function linuxBanner(s: LinuxState): string[] {
  return ['Welcome to Ubuntu 24.04.1 LTS (GNU/Linux 6.8.0-45-generic x86_64)', '', ` * IPv4 address for enp0s3: ${s.ip}`, ' * Type help for the commands available in this lab.', '', `Last login: Mon Nov 23 09:02:11 2026 on tty1`, '']
}

export function laptopBanner(): string[] {
  return ['Your laptop (macOS/Linux terminal). Use it to reach the server over the network.', 'Commands: ssh-keygen, ssh-copy-id, ssh, curl, ping, help', '']
}

function deny(cmd: string) {
  return [`${cmd}: Permission denied — try again with sudo`, '']
}

/* ------------------------------ server shell ------------------------------ */

export function runLinux(s0: LinuxState, raw: string): VmResult<LinuxState> {
  const s: LinuxState = structuredClone(s0)
  let line = raw.trim()
  if (!line) return { state: s, out: [] }
  // chain with &&
  if (line.includes('&&')) {
    let st = s0
    const out: string[] = []
    for (const part of line.split('&&')) {
      const r = runLinux(st, part)
      st = r.state
      out.push(...r.out)
      if (r.out.some((l) => /error|denied|not found|failed|unable/i.test(l))) break
    }
    return { state: st, out }
  }
  const sudo = line.startsWith('sudo ')
  if (sudo) line = line.slice(5).trim()
  const tok = line.split(/\s+/)
  const c = tok[0]

  switch (c) {
    case 'help':
      return {
        state: s,
        out: [
          'Commands available on this server:',
          '  ip a · ip r · hostname · whoami · id <user> · groups <user> · cat <file> · ls -la <dir> · clear',
          '  sudo cp <src> <dst> · sudo nano <file>        (opens the editor)',
          '  sudo netplan apply · sudo hostnamectl set-hostname <name>',
          '  sudo adduser <user> · sudo usermod -aG <group> <user> · sudo deluser <user>',
          '  sudo systemctl status|start|stop|restart|enable|disable <service>',
          '  sudo apt update · sudo apt install -y <package>',
          '  sudo ufw allow <OpenSSH|80/tcp|443/tcp|22/tcp> · sudo ufw enable · sudo ufw status',
          '  curl -I http://localhost · ping <ip>',
          '',
        ],
      }
    case 'clear':
      return { state: s, out: [], clear: true }
    case 'whoami':
      return { state: s, out: [sudo ? 'root' : 'sysadmin', ''] }
    case 'hostname':
      return { state: s, out: [s.hostname, ''] }
    case 'hostnamectl': {
      if (tok[1] !== 'set-hostname' || !tok[2]) return { state: s, out: ['Usage: hostnamectl set-hostname <name>', ''] }
      if (!sudo) return { state: s, out: ['Could not set hostname: Interactive authentication required.', ''] }
      s.hostname = tok[2]
      s.files['/etc/hostname'] = `${tok[2]}\n`
      return { state: s, out: [] }
    }
    case 'ip': {
      if (tok[1] === 'r' || tok[1] === 'route') return { state: s, out: [`default via ${s.gateway} dev enp0s3 proto static`, `${s.ip.replace(/\.\d+$/, '.0')}/${s.prefix} dev enp0s3 proto kernel scope link src ${s.ip}`, ''] }
      return { state: s, out: ['1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN', '    inet 127.0.0.1/8 scope host lo', '2: enp0s3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP', '    link/ether 08:00:27:4e:66:a1 brd ff:ff:ff:ff:ff:ff', `    inet ${s.ip}/${s.prefix} brd ${s.ip.replace(/\.\d+$/, '.255')} scope global enp0s3`, ''] }
    }
    case 'cat': {
      const f = tok[1]
      if (!f || s.files[f] === undefined) return { state: s, out: [`cat: ${f ?? ''}: No such file or directory`, ''] }
      return { state: s, out: [...s.files[f].replace(/\n$/, '').split('\n'), ''] }
    }
    case 'cp': {
      const [src, dst] = [tok[1], tok[2]]
      if (!src || !dst) return { state: s, out: ['cp: missing file operand', ''] }
      if (s.files[src] === undefined) return { state: s, out: [`cp: cannot stat '${src}': No such file or directory`, ''] }
      if (dst.startsWith('/etc') && !sudo) return { state: s, out: deny('cp') }
      s.files[dst] = s.files[src]
      return { state: s, out: [] }
    }
    case 'nano':
    case 'vi':
    case 'vim': {
      const f = tok[1]
      if (!f) return { state: s, out: [] }
      if (f.startsWith('/etc') && !sudo) return { state: s, out: [`[ ${f} is read-only — open it with sudo ]`, ''] }
      if (s.files[f] === undefined) s.files[f] = ''
      return { state: s, out: [], edit: f }
    }
    case 'ls': {
      const dir = tok.filter((x) => !x.startsWith('-'))[1] ?? '.'
      if (dir.includes('.ssh')) return { state: s, out: ['total 12', 'drwx------ 2 sysadmin sysadmin 4096 Nov 23 09:10 .', ...(s.authorizedKeys.length ? ['-rw------- 1 sysadmin sysadmin  98 Nov 23 09:10 authorized_keys'] : []), ''] }
      const prefix = dir === '.' ? '/home/sysadmin/' : dir.replace(/\/?$/, '/')
      const kids = Object.keys(s.files).filter((k) => k.startsWith(prefix)).map((k) => k.slice(prefix.length).split('/')[0])
      return { state: s, out: [...new Set(kids)].length ? [[...new Set(kids)].join('  '), ''] : [''] }
    }
    case 'netplan': {
      if (tok[1] !== 'apply' && tok[1] !== 'try') return { state: s, out: ['Usage: netplan apply', ''] }
      if (!sudo) return { state: s, out: ['Permission denied (you need to be root)', ''] }
      const r = parseNetplan(s.files[NETPLAN] ?? '')
      if (!r.ok) return { state: s, out: [r.error, ''] }
      if (!r.dhcp && r.ip) {
        s.ip = r.ip
        s.prefix = r.prefix ?? 24
        if (r.gw) s.gateway = r.gw
        if (r.dns.length) s.dns = r.dns
      }
      return { state: s, out: [] }
    }
    case 'adduser':
    case 'useradd': {
      const u = tok.filter((x) => !x.startsWith('-'))[1]
      if (!u) return { state: s, out: ['adduser: Only one or two names allowed.', ''] }
      if (!sudo) return { state: s, out: ['fatal: Only root may add a user or group to the system.', ''] }
      if (tok.length === 3 && s.users[tok[1]] && tok[2]) {
        // adduser <user> <group>
        s.users[tok[1]] = [...new Set([...s.users[tok[1]], tok[2]])]
        return { state: s, out: [`Adding user \`${tok[1]}' to group \`${tok[2]}' ...`, 'Done.', ''] }
      }
      if (s.users[u]) return { state: s, out: [`fatal: The user \`${u}' already exists.`, ''] }
      s.users[u] = [u]
      return { state: s, out: [`info: Adding user \`${u}' ...`, `info: Adding new group \`${u}' (1001) ...`, `info: Creating home directory \`/home/${u}' ...`, 'New password: ********', 'Retype new password: ********', 'passwd: password updated successfully', `Changing the user information for ${u}`, 'Full Name []: ', 'Is the information correct? [Y/n] Y', ''] }
    }
    case 'usermod': {
      if (!sudo) return { state: s, out: ['usermod: Permission denied.', ''] }
      const user = tok[tok.length - 1]
      if (!s.users[user]) return { state: s, out: [`usermod: user '${user}' does not exist`, ''] }
      const gi = tok.findIndex((x) => x === '-aG' || x === '-G' || x === '-a')
      const append = tok.includes('-aG') || (tok.includes('-a') && tok.includes('-G'))
      const gIdx = tok.findIndex((x) => x === '-aG' || x === '-G')
      if (gi < 0 || gIdx < 0) return { state: s, out: ['Usage: usermod -aG <group> <user>', ''] }
      const groups = (tok[gIdx + 1] ?? '').split(',').filter(Boolean)
      s.users[user] = append ? [...new Set([...s.users[user], ...groups])] : [user, ...groups]
      return { state: s, out: append ? [] : [`(note) -G without -a REPLACED all of ${user}'s supplementary groups.`, ''] }
    }
    case 'gpasswd': {
      if (!sudo) return { state: s, out: deny('gpasswd') }
      if (tok[1] === '-a' && s.users[tok[2]]) {
        s.users[tok[2]] = [...new Set([...s.users[tok[2]], tok[3]])]
        return { state: s, out: [`Adding user ${tok[2]} to group ${tok[3]}`, ''] }
      }
      return { state: s, out: ['Usage: gpasswd -a <user> <group>', ''] }
    }
    case 'deluser':
    case 'userdel': {
      if (!sudo) return { state: s, out: deny(c) }
      const u = tok[1]
      if (u === 'sysadmin') return { state: s, out: ['(refused in this lab: you would delete your own admin account!)', ''] }
      delete s.users[u]
      return { state: s, out: [`info: Removing user \`${u}' ...`, ''] }
    }
    case 'id':
    case 'groups': {
      const u = tok[1] ?? 'sysadmin'
      if (!s.users[u]) return { state: s, out: [`${c}: '${u}': no such user`, ''] }
      return c === 'id'
        ? { state: s, out: [`uid=${u === 'sysadmin' ? 1000 : 1001}(${u}) gid=${u === 'sysadmin' ? 1000 : 1001}(${u}) groups=${s.users[u].map((g, k) => `${1000 + k}(${g})`).join(',')}`, ''] }
        : { state: s, out: [`${u} : ${s.users[u].join(' ')}`, ''] }
    }
    case 'apt':
    case 'apt-get': {
      if (!sudo) return { state: s, out: ['E: Could not open lock file /var/lib/dpkg/lock-frontend - open (13: Permission denied)', 'E: Are you root?', ''] }
      if (tok[1] === 'update') {
        s.aptUpdated = true
        return { state: s, out: ['Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease', 'Get:2 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]', 'Fetched 2,341 kB in 2s (1,170 kB/s)', 'Reading package lists... Done', ''] }
      }
      if (tok[1] === 'install') {
        const pkgs = tok.slice(2).filter((x) => !x.startsWith('-'))
        if (!s.aptUpdated) return { state: s, out: ['E: Unable to locate package ' + pkgs[0] + '  (hint: run sudo apt update first)', ''] }
        const known = ['nginx', 'curl', 'htop', 'net-tools', 'apache2']
        const bad = pkgs.find((x) => !known.includes(x))
        if (bad) return { state: s, out: [`E: Unable to locate package ${bad}`, ''] }
        for (const pk of pkgs) {
          if (!s.packages.includes(pk)) s.packages.push(pk)
          if (pk === 'nginx' || pk === 'apache2') s.services[pk] = { running: true, enabled: true }
        }
        return { state: s, out: ['Reading package lists... Done', 'Building dependency tree... Done', `The following NEW packages will be installed:\n  ${pkgs.join(' ')}`, `Setting up ${pkgs.join(', ')} ...`, ...(pkgs.includes('nginx') ? ['Created symlink /etc/systemd/system/multi-user.target.wants/nginx.service → /usr/lib/systemd/system/nginx.service.'] : []), ''].flatMap((l) => l.split('\n')) }
      }
      return { state: s, out: ['Usage: apt update | apt install -y <package>', ''] }
    }
    case 'systemctl': {
      const verb = tok[1]
      const name = (tok[2] ?? '').replace(/\.service$/, '').replace(/^sshd$/, 'ssh')
      const svc = s.services[name]
      if (verb === 'status') {
        if (!svc) return { state: s, out: [`Unit ${name}.service could not be found.`, ''] }
        return { state: s, out: [`● ${name}.service`, `     Loaded: loaded (/usr/lib/systemd/system/${name}.service; ${svc.enabled ? 'enabled' : 'disabled'}; preset: enabled)`, `     Active: ${svc.running ? 'active (running) since Mon 2026-11-23 09:00:12 UTC' : 'inactive (dead)'}`, ''] }
      }
      if (!svc) return { state: s, out: [`Failed to ${verb} ${name}.service: Unit ${name}.service not found.`, ''] }
      if (!sudo) return { state: s, out: ['==== AUTHENTICATING FOR org.freedesktop.systemd1.manage-units ====', `Failed to ${verb} ${name}.service: Access denied`, ''] }
      if (verb === 'stop') svc.running = false
      else if (verb === 'start' || verb === 'restart' || verb === 'reload') {
        if (name === 'ssh') {
          const pa = sshdValue(s.files[SSHD], 'PasswordAuthentication')
          const pr = sshdValue(s.files[SSHD], 'PermitRootLogin')
          if ((pa && !['yes', 'no'].includes(pa)) || (pr && !['yes', 'no', 'prohibit-password', 'without-password'].includes(pr))) {
            svc.running = false
            return { state: s, out: [`Job for ssh.service failed because the control process exited with error code.`, `See "journalctl -xeu ssh.service": ${SSHD}: Bad configuration option value.`, ''] }
          }
          s.sshdLoaded = { password: pa !== 'no', root: pr === 'yes' }
        }
        svc.running = true
      } else if (verb === 'enable') svc.enabled = true
      else if (verb === 'disable') svc.enabled = false
      else return { state: s, out: [`Unknown command verb ${verb}.`, ''] }
      if (tok.includes('--now') && verb === 'enable') svc.running = true
      return { state: s, out: verb === 'enable' ? [`Synchronizing state of ${name}.service with SysV service script.`, ''] : [] }
    }
    case 'ufw': {
      if (!sudo) return { state: s, out: ['ERROR: You need to be root to run this script', ''] }
      if (tok[1] === 'allow' && tok[2]) {
        const r = tok[2].toLowerCase() === 'openssh' || tok[2] === '22' || tok[2] === '22/tcp' || tok[2] === 'ssh' ? 'OpenSSH' : tok[2].replace(/^(\d+)$/, '$1/tcp')
        if (!s.ufw.rules.includes(r)) s.ufw.rules.push(r)
        return { state: s, out: ['Rule added', 'Rule added (v6)', ''] }
      }
      if (tok[1] === 'enable') {
        s.ufw.enabled = true
        const warn = s.ufw.rules.includes('OpenSSH') ? [] : ['WARNING: SSH (22/tcp) is not allowed — remote administrators are now locked out!']
        return { state: s, out: ['Command may disrupt existing ssh connections. Proceed with operation (y|n)? y', 'Firewall is active and enabled on system startup', ...warn, ''] }
      }
      if (tok[1] === 'disable') {
        s.ufw.enabled = false
        return { state: s, out: ['Firewall stopped and disabled on system startup', ''] }
      }
      if (tok[1] === 'status') {
        if (!s.ufw.enabled) return { state: s, out: ['Status: inactive', ''] }
        return { state: s, out: ['Status: active', '', 'To                         Action      From', '--                         ------      ----', ...s.ufw.rules.map((r) => `${r.padEnd(27)}ALLOW       Anywhere`), ''] }
      }
      return { state: s, out: ['Usage: ufw allow <rule> | enable | disable | status', ''] }
    }
    case 'curl': {
      const url = tok.find((x) => /^https?:\/\//.test(x)) ?? ''
      if (/localhost|127\.0\.0\.1/.test(url) || url.includes(s.ip)) {
        if (!s.services.nginx?.running) return { state: s, out: ['curl: (7) Failed to connect to localhost port 80 after 0 ms: Couldn\'t connect to server', ''] }
        return { state: s, out: ['HTTP/1.1 200 OK', 'Server: nginx/1.24.0 (Ubuntu)', 'Content-Type: text/html', ''] }
      }
      return { state: s, out: ['curl: (6) Could not resolve host', ''] }
    }
    case 'ping':
      return { state: s, out: [`PING ${tok[tok.length - 1]} 56(84) bytes of data.`, `64 bytes from ${tok[tok.length - 1]}: icmp_seq=1 ttl=64 time=0.41 ms`, ''] }
    case 'chmod':
      if (!sudo && tok.some((x) => x.startsWith('/etc'))) return { state: s, out: deny('chmod') }
      return { state: s, out: [] }
    case 'reboot':
      if (!sudo) return { state: s, out: ['Failed to set wall message, ignoring: Interactive authentication required.', ''] }
      for (const [k, v] of Object.entries(s.services)) v.running = v.enabled || k === 'ssh'
      if (s.services.ssh) {
        s.sshdLoaded = { password: sshdValue(s.files[SSHD], 'PasswordAuthentication') !== 'no', root: sshdValue(s.files[SSHD], 'PermitRootLogin') === 'yes' }
      }
      return { state: s, out: ['', '*** System restart ***', '', ...linuxBanner(s)] }
  }
  return { state: s, out: [`${c}: command not found`, ''] }
}

/* ------------------------------ the laptop ------------------------------ */

export function runLaptop(s0: LinuxState, raw: string): VmResult<LinuxState> {
  const s: LinuxState = structuredClone(s0)
  const line = raw.trim()
  if (!line) return { state: s, out: [] }
  const tok = line.split(/\s+/)
  const c = tok[0]
  const target = tok.find((x) => x.includes('@'))
  const host = target?.split('@')[1] ?? tok[tok.length - 1]
  const reach = host === s.ip
  const sshOpen = s.services.ssh?.running && (!s.ufw.enabled || s.ufw.rules.includes('OpenSSH'))
  switch (c) {
    case 'help':
      return { state: s, out: ['ssh-keygen -t ed25519 · ssh-copy-id <user>@<ip> · ssh <user>@<ip> · curl -I http://<ip> · ping <ip> · clear', ''] }
    case 'clear':
      return { state: s, out: [], clear: true }
    case 'ssh-keygen':
      s.laptop.hasKey = true
      return { state: s, out: ['Generating public/private ed25519 key pair.', 'Enter file in which to save the key (/home/you/.ssh/id_ed25519): ', 'Enter passphrase (empty for no passphrase): ', 'Your identification has been saved in /home/you/.ssh/id_ed25519', 'Your public key has been saved in /home/you/.ssh/id_ed25519.pub', 'The key fingerprint is: SHA256:Qm4n2Tz9… you@laptop', ''] }
    case 'ping':
      return reach ? { state: s, out: [`PING ${host}: 56 data bytes`, `64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.6 ms`, ''] } : { state: s, out: [`PING ${host}: 56 data bytes`, 'Request timeout for icmp_seq 0', ''] }
    case 'ssh-copy-id': {
      if (!target) return { state: s, out: ['Usage: ssh-copy-id user@host', ''] }
      if (!s.laptop.hasKey) return { state: s, out: ['/usr/bin/ssh-copy-id: ERROR: No identities found — run ssh-keygen first', ''] }
      if (!reach) return { state: s, out: [`ssh: connect to host ${host} port 22: Operation timed out`, '(Is the server at that address? Check its static IP.)', ''] }
      if (!sshOpen) return { state: s, out: [`ssh: connect to host ${host} port 22: Connection refused`, ''] }
      if (!s.sshdLoaded.password) return { state: s, out: [`${target}: Permission denied (publickey).`, '(Password login is already disabled, so the key cannot be copied this way.)', ''] }
      const user = target.split('@')[0]
      if (!s.users[user]) return { state: s, out: [`${target}: Permission denied (publickey,password).`, ''] }
      if (!s.authorizedKeys.includes(user)) s.authorizedKeys.push(user)
      return { state: s, out: ['/usr/bin/ssh-copy-id: INFO: 1 key(s) remain to be installed', `${target}'s password: ********`, '', 'Number of key(s) added: 1', '', `Now try logging into the machine, with: "ssh '${target}'"`, ''] }
    }
    case 'ssh': {
      if (!target) return { state: s, out: ['usage: ssh user@host', ''] }
      const user = target.split('@')[0]
      if (!reach) return { state: s, out: [`ssh: connect to host ${host} port 22: Operation timed out`, ''] }
      if (!sshOpen) return { state: s, out: [`ssh: connect to host ${host} port 22: Connection refused`, ''] }
      if (user === 'root' && !s.sshdLoaded.root) return { state: s, out: [`root@${host}: Permission denied (publickey).`, ''] }
      if (s.authorizedKeys.includes(user) && s.laptop.hasKey) return { state: s, out: [`Welcome to Ubuntu 24.04.1 LTS`, `(logged in to ${s.hostname} with your SSH key — no password asked)`, `${user}@${s.hostname}:~$ exit`, 'Connection closed.', ''] }
      if (s.sshdLoaded.password && (s.users[user] || user === 'root')) return { state: s, out: [`${target}'s password: ********`, `Welcome to Ubuntu 24.04.1 LTS (password login)`, `${user}@${s.hostname}:~$ exit`, 'Connection closed.', ''] }
      return { state: s, out: [`${target}: Permission denied (publickey).`, ''] }
    }
    case 'curl': {
      const url = tok.find((x) => /^https?:\/\//.test(x)) ?? ''
      const h = url.replace(/^https?:\/\//, '').split(/[/:]/)[0]
      if (h !== s.ip) return { state: s, out: [`curl: (28) Failed to connect to ${h} port 80 after 75000 ms: Timeout`, ''] }
      if (s.ufw.enabled && !s.ufw.rules.includes('80/tcp') && !s.ufw.rules.includes('Nginx Full') && !s.ufw.rules.includes('Nginx HTTP')) return { state: s, out: [`curl: (28) Failed to connect to ${h} port 80 after 75000 ms: Timeout`, ''] }
      if (!s.services.nginx?.running) return { state: s, out: [`curl: (7) Failed to connect to ${h} port 80: Connection refused`, ''] }
      return { state: s, out: ['HTTP/1.1 200 OK', 'Server: nginx/1.24.0 (Ubuntu)', 'Content-Type: text/html', 'Content-Length: 615', ''] }
    }
  }
  return { state: s, out: [`zsh: command not found: ${c}`, ''] }
}

/** Live checks used by Lab 5 tasks. */
export const linuxChecks = {
  staticIp: (s: LinuxState) => s.ip === '10.0.0.20' && s.prefix === 24 && s.gateway === '10.0.0.1',
  dns: (s: LinuxState) => s.dns.includes('10.0.0.10'),
  amina: (s: LinuxState) => !!s.users.amina?.includes('sudo') && !!s.users.amina?.includes('amina'),
  key: (s: LinuxState) => s.authorizedKeys.includes('sysadmin'),
  hardened: (s: LinuxState) => !s.sshdLoaded.password && !s.sshdLoaded.root && sshdValue(s.files[SSHD], 'PasswordAuthentication') === 'no' && sshdValue(s.files[SSHD], 'PermitRootLogin') === 'no',
  ufw: (s: LinuxState) => s.ufw.enabled && s.ufw.rules.includes('OpenSSH') && s.ufw.rules.includes('80/tcp'),
  nginx: (s: LinuxState) => !!s.services.nginx?.running && !!s.services.nginx?.enabled,
  web: (s: LinuxState) => runLaptop(s, `curl -I http://${s.ip}`).out[0]?.includes('200') && s.ip === '10.0.0.20',
  backup: (s: LinuxState) => s.files[`${SSHD}.bak`] !== undefined,
}
