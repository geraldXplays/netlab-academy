import { useMemo } from 'react'
import type { DeviceType } from '@/sim/types'
import { isHost } from '@/sim/types'
import { linkUp } from '@/sim/topology'
import { Device, DeviceDefs, PtLink, type DeviceKind } from '@/components/devices/Device'
import type { OpsWorld } from '@/ops/types'
import { hostHealthy, ipOf } from '@/ops/world'
import { cn } from '@/lib/cn'

const KIND: Record<DeviceType, DeviceKind> = { pc: 'pc', laptop: 'laptop', server: 'server', printer: 'printer', switch: 'switch', router: 'router', firewall: 'firewall' }
const W = 1100
const H = 450

export type Health = 'ok' | 'warn' | 'down' | 'none'

/** Live health of each device as seen from the monitoring station. */
export function useHealth(w: OpsWorld, nms: string): Record<string, Health> {
  return useMemo(() => {
    const out: Record<string, Health> = {}
    for (const d of w.topo.devices) {
      if (d.id === nms) {
        out[d.id] = 'ok'
        continue
      }
      if (!isHost(d.type)) {
        const anyUp = w.topo.links.some((l) => (l.a.dev === d.id || l.b.dev === d.id) && linkUp(w.topo, l))
        out[d.id] = anyUp ? 'ok' : 'down'
        continue
      }
      if (!ipOf(w, d.id)) {
        out[d.id] = 'none'
        continue
      }
      const up = hostHealthy(w, d.id, nms)
      const bad = (w.svcs[d.id] ?? []).some((s) => s.enabled && s.state !== 'running')
      out[d.id] = !up ? 'down' : bad ? 'warn' : 'ok'
    }
    return out
  }, [w, nms])
}

const DOT: Record<Health, string> = { ok: '#22c55e', warn: '#f59e0b', down: '#ef4444', none: '#64748b' }

export function OpsMap({ world, nms, selected, onSelect, className }: {
  world: OpsWorld
  nms: string
  selected: string | null
  onSelect: (id: string | null) => void
  className?: string
}) {
  const health = useHealth(world, nms)
  const pos = (id: string) => {
    const d = world.topo.devices.find((x) => x.id === id)!
    return [d.x, d.y] as [number, number]
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className={cn('h-full w-full select-none', className)} role="img" aria-label="Network map" onClick={() => onSelect(null)}>
      <DeviceDefs />
      <defs>
        <pattern id="ops-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--line)" strokeWidth="0.6" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#ops-grid)" opacity="0.5" />
      {/* zones */}
      <g fontSize="10" fontFamily="'JetBrains Mono Variable', monospace" fill="var(--text-dim)" letterSpacing="0.12em">
        <rect x="20" y="236" width="340" height="206" rx="18" fill="rgb(var(--cyan-rgb)/0.03)" stroke="var(--line)" strokeDasharray="4 6" />
        <text x="34" y="254">ADMIN · VLAN 10 · 10.10.10.0/24</text>
        <rect x="372" y="236" width="378" height="206" rx="18" fill="rgb(var(--purple-rgb)/0.03)" stroke="var(--line)" strokeDasharray="4 6" />
        <text x="386" y="254">SERVERS · VLAN 99 · 10.10.99.0/24</text>
        <rect x="762" y="236" width="322" height="206" rx="18" fill="rgb(var(--cyan-rgb)/0.03)" stroke="var(--line)" strokeDasharray="4 6" />
        <text x="776" y="254">SALES · VLAN 20 · 10.10.20.0/24</text>
        <rect x="740" y="86" width="200" height="70" rx="16" fill="rgb(239 68 68 / 0.03)" stroke="var(--line)" strokeDasharray="4 6" />
        <text x="752" y="101">DMZ</text>
      </g>
      {world.topo.links.map((l) => {
        const up = linkUp(world.topo, l)
        return <PtLink key={l.id} from={pos(l.a.dev)} to={pos(l.b.dev)} status={up ? 'up' : 'down'} animate={false} pad={28} />
      })}
      {world.topo.devices.map((d) => {
        const h = health[d.id]
        const sel = selected === d.id
        const kind: DeviceKind = d.id === 'isp' ? 'cloud' : KIND[d.type]
        return (
          <g
            key={d.id}
            role="button"
            tabIndex={0}
            aria-label={d.name}
            className="cursor-pointer outline-none"
            onClick={(e) => {
              e.stopPropagation()
              onSelect(d.id)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onSelect(d.id)
              }
            }}
          >
            <circle cx={d.x} cy={d.y} r={34} fill={sel ? 'rgb(var(--cyan-rgb)/0.16)' : 'transparent'} stroke={sel ? 'var(--cyan)' : 'transparent'} strokeWidth="1.5" />
            <Device kind={kind} x={d.x} y={d.y} scale={d.id === 'hub' || d.id === 'tomlt' ? 0.75 : 0.95} name={d.name} sub={sel && d.id !== 'isp' ? ipOf(world, d.id) : undefined} animate={false} />
            <circle cx={d.x + 22} cy={d.y - 22} r={6} fill={DOT[h]} stroke="var(--bg-2)" strokeWidth="2">
              {h === 'down' && <animate attributeName="opacity" values="1;0.35;1" dur="1.4s" repeatCount="indefinite" />}
            </circle>
          </g>
        )
      })}
    </svg>
  )
}
