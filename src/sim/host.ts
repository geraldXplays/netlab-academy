import type { Topology } from './types'
import { dev, longIface, validIp } from './topology'
import { ping, type ArpCache, type PingResult } from './engine'

export interface HostResult {
  out: string[]
  clear?: boolean
  ping?: PingResult
}

/** Windows-style command prompt for PCs, laptops and servers. */
export function runHost(t: Topology, devId: string, raw: string, arp: ArpCache): HostResult {
  const d = dev(t, devId)!
  const nic = d.ifaces[0]
  const line = raw.trim()
  if (!line) return { out: [] }
  const [cmd, ...args] = line.split(/\s+/)
  const c = cmd.toLowerCase()

  if (c === 'cls' || c === 'clear') return { out: [], clear: true }
  if (c === 'help' || c === '?') {
    return {
      out: [
        'Available commands:',
        '  ipconfig [/all]     Show IP configuration',
        '  ping <ip> [-n N]    Test reachability',
        '  tracert <ip>        Show the route to a host',
        '  arp -a | arp -d     Show / clear the ARP cache',
        '  hostname            Show this computer\'s name',
        '  cls                 Clear the screen',
        '',
      ],
    }
  }
  if (c === 'hostname') return { out: [d.name, ''] }

  if (c === 'ipconfig') {
    const all = args[0]?.toLowerCase() === '/all'
    const out = ['', `FastEthernet0 Connection:(default port)`, '']
    if (all) {
      out.push(`   Connection-specific DNS Suffix..: `, `   Physical Address................: ${nic.mac.replace(/\./g, '').match(/.{2}/g)!.join('-')}`)
    }
    out.push(
      `   Link-local IPv6 Address.........: FE80::${nic.mac.slice(-4).toLowerCase()}`,
      `   IPv4 Address....................: ${nic.ip ?? '0.0.0.0'}`,
      `   Subnet Mask.....................: ${nic.mask ?? '0.0.0.0'}`,
      `   Default Gateway.................: ${d.gateway ?? '0.0.0.0'}`,
    )
    if (all) out.push(`   DNS Servers.....................: ${d.dns ?? '0.0.0.0'}`, `   DHCP Servers....................: 0.0.0.0`)
    return { out: [...out, ''] }
  }

  if (c === 'arp') {
    if (args[0]?.toLowerCase() === '-d') {
      arp.delete(devId)
      return { out: [''] }
    }
    const cache = arp.get(devId)
    if (!cache?.size) return { out: ['No ARP Entries Found', ''] }
    const out = [`  Internet Address      Physical Address      Type`]
    for (const [ip, mac] of cache) out.push(`  ${ip.padEnd(22)}${mac.toLowerCase().padEnd(22)}dynamic`)
    return { out: [...out, ''] }
  }

  if (c === 'ping') {
    const ip = args.find((a) => !a.startsWith('-') && !/^\d+$/.test(a) || validIp(a))
    const nIdx = args.findIndex((a) => a.toLowerCase() === '-n')
    const n = nIdx >= 0 ? Math.max(1, Math.min(10, Number(args[nIdx + 1]) || 4)) : 4
    if (!ip) return { out: ['Usage: ping <ip address>', ''] }
    if (!validIp(ip)) return { out: [`Ping request could not find host ${ip}. Please check the name and try again.`, ''] }
    if (!nic.ip) return { out: ['', `Pinging ${ip} with 32 bytes of data:`, '', 'PING: transmit failed. General failure. ', ''] }
    const firstArp = !(arp.get(devId)?.size)
    const res = ping(t, devId, ip, arp)
    const lines = ['', `Pinging ${ip} with 32 bytes of data:`, '']
    let received = 0
    const crossesRouter = res.path.length > 1
    for (let k = 0; k < n; k++) {
      if (res.ok) {
        if (k === 0 && firstArp && crossesRouter) {
          lines.push('Request timed out.')
        } else {
          received++
          lines.push(`Reply from ${ip}: bytes=32 time${k === 0 && firstArp ? '=1ms' : '<1ms'} TTL=${res.ttl}`)
        }
      } else if (res.reason === 'no-route' && res.unreachableFrom) {
        lines.push(`Reply from ${res.unreachableFrom}: Destination host unreachable.`)
      } else lines.push('Request timed out.')
    }
    const lost = n - received
    lines.push('', `Ping statistics for ${ip}:`, `    Packets: Sent = ${n}, Received = ${received}, Lost = ${lost} (${Math.round((lost / n) * 100)}% loss),`)
    if (received) lines.push('Approximate round trip times in milli-seconds:', '    Minimum = 0ms, Maximum = 1ms, Average = 0ms')
    return { out: [...lines, ''], ping: res }
  }

  if (c === 'tracert' || c === 'traceroute') {
    const ip = args[0]
    if (!ip || !validIp(ip)) return { out: ['Usage: tracert <ip address>', ''] }
    const res = ping(t, devId, ip, arp)
    const out = ['', `Tracing route to ${ip} over a maximum of 30 hops: `, '']
    const hops = res.path.filter((p) => p.ip)
    hops.forEach((h, i) => out.push(`  ${String(i + 1).padStart(2)}   0 ms      0 ms      0 ms      ${h.ip}`))
    if (!res.ok) for (let k = hops.length; k < hops.length + 3; k++) out.push(`  ${String(k + 1).padStart(2)}   *         *         *         Request timed out.`)
    out.push('', 'Trace complete.', '')
    return { out, ping: res }
  }

  if (c === 'ipconfig' || c === 'netsh') return { out: [] }
  return { out: [`Invalid Command.`, ''] }
}

export const hostPrompt = () => 'C:\\>'
export const nicLabel = (name: string) => longIface(name)
