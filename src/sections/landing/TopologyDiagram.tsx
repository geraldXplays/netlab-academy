import { Device, DeviceDefs, type DeviceKind } from '@/components/devices/Device'

type Kind = 'cloud' | 'router' | 'firewall' | 'switch' | 'pc' | 'server' | 'printer'

interface Dev {
  id: string
  x: number
  y: number
  kind: Kind
  label: string
  ip: string
  step: number
}

const PT_KIND: Record<Kind, DeviceKind> = {
  cloud: 'cloud', router: 'router', firewall: 'firewall', switch: 'switch', pc: 'pc', server: 'server', printer: 'printer',
}

export const DEVICES: Dev[] = [
  { id: 'inet', x: 300, y: 46, kind: 'cloud', label: 'INTERNET', ip: '203.0.113.0/24', step: 0 },
  { id: 'r1', x: 300, y: 136, kind: 'router', label: 'R1-EDGE', ip: '10.0.0.1', step: 0 },
  { id: 'fw', x: 300, y: 226, kind: 'firewall', label: 'FW-01', ip: '10.0.0.2', step: 1 },
  { id: 'core', x: 300, y: 316, kind: 'switch', label: 'SW-CORE', ip: '10.0.0.10', step: 2 },
  { id: 'swa', x: 152, y: 408, kind: 'switch', label: 'SW-ADMIN', ip: 'VLAN 10', step: 2 },
  { id: 'swb', x: 448, y: 408, kind: 'switch', label: 'SW-IT', ip: 'VLAN 20', step: 2 },
  { id: 'pc1', x: 72, y: 500, kind: 'pc', label: 'ADM-PC01', ip: '10.10.0.11', step: 3 },
  { id: 'pc2', x: 152, y: 500, kind: 'pc', label: 'ADM-PC02', ip: '10.10.0.12', step: 3 },
  { id: 'prn', x: 232, y: 500, kind: 'printer', label: 'PRN-01', ip: '10.10.0.50', step: 3 },
  { id: 'pc3', x: 368, y: 500, kind: 'pc', label: 'IT-PC01', ip: '10.20.0.11', step: 3 },
  { id: 'srv1', x: 448, y: 500, kind: 'server', label: 'SRV-AD01', ip: '10.20.0.5', step: 3 },
  { id: 'srv2', x: 528, y: 500, kind: 'server', label: 'SRV-FILE', ip: '10.20.0.6', step: 3 },
]

const byId = Object.fromEntries(DEVICES.map((d) => [d.id, d]))
const H = 21 // half node size

/** Orthogonal cable path from the bottom of `a` to the top of `b`. */
function cable(a: Dev, b: Dev) {
  const y1 = a.y + H
  const y2 = b.y - H
  if (a.x === b.x) return `M${a.x} ${y1} V${y2}`
  const mid = (y1 + y2) / 2
  return `M${a.x} ${y1} V${mid} H${b.x} V${y2}`
}

const LINKS: [string, string][] = [
  ['inet', 'r1'], ['r1', 'fw'], ['fw', 'core'], ['core', 'swa'], ['core', 'swb'],
  ['swa', 'pc1'], ['swa', 'pc2'], ['swa', 'prn'], ['swb', 'pc3'], ['swb', 'srv1'], ['swb', 'srv2'],
]

const IT_SIDE = new Set(['swb', 'pc3', 'srv1', 'srv2'])

const PACKET_ROUTES: { from: string; to: string; delay: number; color: string }[] = [
  { from: 'inet', to: 'r1', delay: 0, color: 'var(--cyan)' },
  { from: 'r1', to: 'fw', delay: 0.4, color: 'var(--cyan)' },
  { from: 'fw', to: 'core', delay: 0.8, color: 'var(--cyan)' },
  { from: 'core', to: 'swa', delay: 1.2, color: 'var(--cyan)' },
  { from: 'core', to: 'swb', delay: 0.6, color: 'var(--purple)' },
  { from: 'swa', to: 'pc2', delay: 1.6, color: 'var(--cyan)' },
  { from: 'swb', to: 'srv1', delay: 1.0, color: 'var(--purple)' },
  { from: 'swb', to: 'pc3', delay: 2.0, color: 'var(--purple)' },
]

/**
 * Small-office topology. Every element carries data-step so the parent's
 * GSAP timeline can assemble it in four scroll-driven stages.
 */
export function TopologyDiagram({ animated }: { animated: boolean }) {
  return (
    <svg viewBox="0 0 600 560" className="h-full w-full overflow-visible" role="img" aria-label="Small office network: internet, edge router, firewall, core switch, two VLAN access switches with workstations, a printer and servers.">
      <DeviceDefs />
      <defs>
        <filter id="topo-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* VLAN zones */}
      <g data-zone data-step="2">
        <rect x="28" y="378" width="248" height="168" rx="18" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeOpacity="0.45" strokeDasharray="5 6" />
        <text x="44" y="398" className="fill-cyan font-mono text-[9px] tracking-[0.18em]">VLAN 10 · ADMIN</text>
        <rect x="324" y="378" width="248" height="168" rx="18" fill="var(--purple-soft)" stroke="var(--purple)" strokeOpacity="0.45" strokeDasharray="5 6" />
        <text x="340" y="398" className="fill-purple font-mono text-[9px] tracking-[0.18em]">VLAN 20 · IT</text>
      </g>

      {/* Cables */}
      {LINKS.map(([a, b]) => {
        const step = Math.max(byId[a].step, byId[b].step)
        const d = cable(byId[a], byId[b])
        return (
          <g key={`${a}-${b}`}>
            <path
              data-link
              data-step={step}
              d={d}
              pathLength={1}
              fill="none"
              stroke="var(--line-strong)"
              strokeWidth="1.6"
              strokeDasharray={animated ? 1 : undefined}
              strokeDashoffset={animated ? 1 : undefined}
            />
            <path data-traffic d={d} fill="none" stroke={IT_SIDE.has(b) ? 'var(--purple)' : 'var(--cyan)'} strokeOpacity="0.55" strokeWidth="1.6" strokeDasharray="3 9" className="animate-dash" opacity={animated ? 0 : 0.8} />
          </g>
        )
      })}

      {/* Packets — SMIL motion along cables, only once the network is live */}
      {animated && (
        <g data-packets opacity="0">
          {PACKET_ROUTES.map((r, i) => (
            <circle key={i} r="3.2" fill={r.color} filter="url(#topo-glow)">
              <animateMotion dur="1.6s" begin={`${r.delay}s`} repeatCount="indefinite" path={cable(byId[r.from], byId[r.to])} />
            </circle>
          ))}
        </g>
      )}

      {/* Devices */}
      {DEVICES.map((d) => {
        const isCore = d.kind === 'router' || d.kind === 'firewall' || d.id === 'core'
        return (
          <g key={d.id} data-dev data-step={d.step} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
            {isCore && <circle cx={d.x} cy={d.y} r={H + 10} fill="var(--cyan-soft)" stroke="var(--cyan)" strokeOpacity="0.25" />}
            <Device kind={PT_KIND[d.kind]} x={d.x} y={d.y - 2} scale={d.kind === 'cloud' ? 0.85 : 0.72} animate={false} />
            <text x={d.x} y={d.y + H + 16} textAnchor="middle" className="fill-text font-mono text-[9px] font-medium tracking-wider">
              {d.label}
            </text>
            <text x={d.x} y={d.y + H + 27} textAnchor="middle" className="fill-dim font-mono text-[8px]">
              {d.ip}
            </text>
            {d.step === 3 && (
              <circle cx={d.x + H - 3} cy={d.y - H + 3} r="3.5" className="fill-success" data-led />
            )}
          </g>
        )
      })}
    </svg>
  )
}
