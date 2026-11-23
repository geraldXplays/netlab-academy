import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { item } from '@/components/diagrams/kit'

/**
 * Realistic network device icons (isometric hardware with ports and LEDs),
 * each carrying a small Packet Tracer-style badge so it stays recognisable.
 * Links keep the green/orange/red status lights at each end.
 * Each icon is drawn centred on (0,0) and roughly 64px wide at scale 1.
 */

export type DeviceKind = 'router' | 'switch' | 'pc' | 'laptop' | 'server' | 'cloud' | 'printer' | 'ap' | 'firewall' | 'modem'

/** Shared gradients — include once inside each <svg> that uses devices. */
export function DeviceDefs() {
  return (
    <defs>
      <linearGradient id="dv-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#5b6676" /><stop offset="1" stopColor="#323a46" /></linearGradient>
      <linearGradient id="dv-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a313b" /><stop offset="1" stopColor="#151a21" /></linearGradient>
      <linearGradient id="dv-side" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#1c222b" /><stop offset="1" stopColor="#0e1217" /></linearGradient>
      <linearGradient id="dv-blue-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4f8fd6" /><stop offset="1" stopColor="#1f5a9e" /></linearGradient>
      <linearGradient id="dv-blue-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1e4f8a" /><stop offset="1" stopColor="#0f2d55" /></linearGradient>
      <linearGradient id="dv-red-top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#d9534f" /><stop offset="1" stopColor="#8f2522" /></linearGradient>
      <linearGradient id="dv-red-front" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#7a1f1c" /><stop offset="1" stopColor="#4a1210" /></linearGradient>
      <linearGradient id="dv-alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#f1f4f7" /><stop offset="0.5" stopColor="#c4cbd3" /><stop offset="1" stopColor="#8f99a4" /></linearGradient>
      <linearGradient id="dv-bezel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2b3038" /><stop offset="1" stopColor="#0d1014" /></linearGradient>
      <linearGradient id="dv-screen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#38bdf8" /><stop offset="0.55" stopColor="#6366f1" /><stop offset="1" stopColor="#a855f7" /></linearGradient>
      <linearGradient id="dv-white" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#d5dbe1" /></linearGradient>
      <linearGradient id="dv-cloud" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#bcd3e6" /></linearGradient>
      <filter id="pt-shadow" x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="3.5" stdDeviation="2.5" floodColor="#000" floodOpacity="0.4" />
      </filter>
    </defs>
  )
}

/** Isometric box: top face, front face, right side. (x,y) = front-top-left corner. */
function Box({ x, y, w, h, d, top, front, side }: { x: number; y: number; w: number; h: number; d: number; top: string; front: string; side: string }) {
  const dx = d * 0.55
  const dy = d * 0.45
  return (
    <g>
      <path d={`M${x} ${y} L${x + dx} ${y - dy} H${x + w + dx} L${x + w} ${y} Z`} fill={top} stroke="#0b0e12" strokeWidth="0.5" />
      <rect x={x} y={y} width={w} height={h} fill={front} stroke="#0b0e12" strokeWidth="0.5" />
      <path d={`M${x + w} ${y} L${x + w + dx} ${y - dy} V${y - dy + h} L${x + w} ${y + h} Z`} fill={side} stroke="#0b0e12" strokeWidth="0.5" />
    </g>
  )
}

const led = (x: number, y: number, c: string, k: string | number) => <rect key={k} x={x} y={y} width="1.8" height="1.2" rx="0.3" fill={c} />
const port = (x: number, y: number, k: string | number, on = true) => (
  <g key={k}>
    <rect x={x} y={y} width="3.6" height="3" rx="0.4" fill="#05070a" stroke="#5c6672" strokeWidth="0.3" />
    {on && led(x + 0.9, y - 1.6, '#22c55e', `l${k}`)}
  </g>
)

/** Small round badge with the classic symbol so devices stay recognisable at a glance. */
function Badge({ x, y, kind }: { x: number; y: number; kind: 'router' | 'switch' | 'firewall' }) {
  const c = kind === 'firewall' ? '#ef4444' : '#38bdf8'
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse rx="7.5" ry="4" fill="#0b1220" stroke={c} strokeWidth="0.8" />
      {kind === 'router' && <path d="M-4 -1 H2 M0 -2.6 L2 -1 L0 0.6 M4 1 H-2 M0 -0.6 L-2 1 L0 2.6" stroke={c} strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {kind === 'switch' && <path d="M-4.5 -1.2 H4 M2 -2.6 L4 -1.2 L2 0.2 M4.5 1.4 H-4 M-2 0 L-4 1.4 L-2 2.8" stroke={c} strokeWidth="0.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
      {kind === 'firewall' && <path d="M-4 -2 H4 V2 H-4 Z M-4 0 H4 M-1.5 -2 V0 M1.5 0 V2" stroke={c} strokeWidth="0.8" fill="none" />}
    </g>
  )
}

function Router() {
  return (
    <g filter="url(#pt-shadow)">
      {/* antennas */}
      <path d="M-20 -6 L-24 -26" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M22 -10 L27 -28" stroke="#1f2937" strokeWidth="2.4" strokeLinecap="round" />
      <Box x={-28} y={-4} w={50} h={12} d={16} top="url(#dv-blue-top)" front="url(#dv-blue-front)" side="#0b2342" />
      {[0, 1, 2, 3].map((i) => port(-24 + i * 6, 2, i, i < 3))}
      {led(4, 3, '#22c55e', 'p')}
      {led(8, 3, '#f59e0b', 'a')}
      <rect x="12" y="1.5" width="7" height="4.5" rx="0.5" fill="#0a1a2e" stroke="#3b82f6" strokeWidth="0.3" />
      <Badge x={-2} y={-8} kind="router" />
    </g>
  )
}

function Switch() {
  return (
    <g filter="url(#pt-shadow)">
      <Box x={-32} y={-4} w={58} h={10} d={14} top="url(#dv-top)" front="url(#dv-front)" side="url(#dv-side)" />
      {Array.from({ length: 12 }, (_, i) => port(-29 + i * 4.3 + (i > 5 ? 1.5 : 0), 1.5, i, i % 5 !== 3))}
      <rect x="22" y="1" width="3" height="3.5" fill="#0ea5e9" opacity="0.8" />
      <Badge x={-3} y={-7.5} kind="switch" />
    </g>
  )
}

function Pc() {
  return (
    <g filter="url(#pt-shadow)">
      {/* monitor */}
      <rect x="-24" y="-28" width="48" height="31" rx="2.5" fill="url(#dv-bezel)" />
      <rect x="-22" y="-26" width="44" height="26" rx="1" fill="url(#dv-screen)" />
      <path d="M-22 -26 L2 -26 L-22 -6 Z" fill="#fff" opacity="0.12" />
      {/* taskbar + windows on screen */}
      <rect x="-22" y="-3" width="44" height="3" fill="#0b1220" opacity="0.7" />
      <rect x="-17" y="-21" width="18" height="12" rx="0.8" fill="#f8fafc" opacity="0.85" />
      <rect x="-17" y="-21" width="18" height="2.2" rx="0.8" fill="#334155" />
      {/* stand */}
      <path d="M-3 3 H3 L4.5 10 H-4.5 Z" fill="url(#dv-alu)" />
      <ellipse cx="0" cy="11" rx="11" ry="2.4" fill="url(#dv-alu)" />
      {/* keyboard */}
      <path d="M-22 15 H20 L25 20 H-17 Z" fill="url(#dv-alu)" stroke="#6b7480" strokeWidth="0.4" />
      {Array.from({ length: 10 }, (_, i) => <rect key={i} x={-17 + i * 3.8 + 1} y="16.2" width="2.8" height="1.2" rx="0.3" fill="#7b848f" />)}
      {Array.from({ length: 9 }, (_, i) => <rect key={`b${i}`} x={-15 + i * 3.8 + 2} y="18" width="2.8" height="1.2" rx="0.3" fill="#7b848f" />)}
    </g>
  )
}

function Laptop() {
  return (
    <g filter="url(#pt-shadow)">
      <path d="M-22 -24 H22 L22 6 H-22 Z" fill="url(#dv-bezel)" />
      <rect x="-20" y="-22" width="40" height="25" rx="1" fill="url(#dv-screen)" />
      <path d="M-20 -22 L4 -22 L-20 -2 Z" fill="#fff" opacity="0.12" />
      <rect x="-15" y="-17" width="16" height="11" rx="0.8" fill="#f8fafc" opacity="0.85" />
      <path d="M-26 6 H26 L30 14 H-30 Z" fill="url(#dv-alu)" stroke="#6b7480" strokeWidth="0.4" />
      {Array.from({ length: 11 }, (_, i) => <rect key={i} x={-22 + i * 4 + 0.5} y="7.6" width="3" height="1.1" rx="0.3" fill="#8f99a4" />)}
      <rect x="-6" y="10.5" width="12" height="2.4" rx="0.8" fill="#aab3bd" />
    </g>
  )
}

function Server() {
  return (
    <g filter="url(#pt-shadow)">
      <Box x={-16} y={-24} w={28} h={50} d={16} top="url(#dv-top)" front="url(#dv-front)" side="url(#dv-side)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <rect x="-13" y={-21 + i * 8.6} width="22" height="7" rx="0.8" fill="#0b0e12" stroke="#3a4350" strokeWidth="0.4" />
          {[0, 1, 2].map((k) => <path key={k} d={`M-11 ${-19 + i * 8.6 + k * 1.8} H3`} stroke="#2a313b" strokeWidth="0.7" />)}
          <circle cx="6" cy={-17.5 + i * 8.6} r="0.9" fill={i === 2 ? '#f59e0b' : '#22c55e'} />
        </g>
      ))}
      <circle cx="-1" cy="22" r="1.6" fill="#38bdf8" />
    </g>
  )
}

function Cloud() {
  return (
    <g filter="url(#pt-shadow)">
      <path d="M-30 10 A12 12 0 0 1 -26 -10 A15 15 0 0 1 -2 -20 A16 16 0 0 1 24 -12 A12 12 0 0 1 32 10 Z" fill="url(#dv-cloud)" stroke="#8fb3cf" strokeWidth="1" />
      <path d="M-14 2 H14 M-10 -4 H10 M0 -10 V8" stroke="#7aa7c7" strokeWidth="1" opacity="0.7" />
      <circle cx="0" cy="-1" r="7" fill="none" stroke="#5f8fb4" strokeWidth="1" />
    </g>
  )
}

function Printer() {
  return (
    <g filter="url(#pt-shadow)">
      <path d="M-12 -14 L-8 -26 H10 L14 -14 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="0.5" />
      {[0, 1, 2].map((i) => <path key={i} d={`M${-7 + i} ${-23 + i * 3} H${8 - i}`} stroke="#94a3b8" strokeWidth="0.6" />)}
      <Box x={-24} y={-12} w={44} h={20} d={12} top="url(#dv-white)" front="#e5e9ee" side="#b7c0ca" />
      <rect x="-21" y="-8" width="16" height="6" rx="1" fill="#0b1220" />
      <rect x="-20" y="-7" width="10" height="4" rx="0.5" fill="#22d3ee" opacity="0.7" />
      <circle cx="16" cy="-5" r="1.4" fill="#22c55e" />
      <rect x="-14" y="4" width="28" height="3" rx="1" fill="#475569" />
      <path d="M-12 7 H12 L10 13 H-10 Z" fill="#fff" stroke="#cbd5e1" strokeWidth="0.5" />
    </g>
  )
}

function Ap() {
  return (
    <g filter="url(#pt-shadow)">
      {[10, 16, 22].map((r) => (
        <path key={r} d={`M${-r * 0.75} ${-r * 0.35 - 4} A${r} ${r} 0 0 1 ${r * 0.75} ${-r * 0.35 - 4}`} fill="none" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity={1 - r / 40} />
      ))}
      <ellipse cx="0" cy="8" rx="22" ry="7.5" fill="#b7c0ca" />
      <ellipse cx="0" cy="5" rx="22" ry="7.5" fill="url(#dv-white)" stroke="#cbd5e1" strokeWidth="0.6" />
      <circle cx="0" cy="5" r="1.8" fill="#22c55e" />
    </g>
  )
}

function Firewall() {
  return (
    <g filter="url(#pt-shadow)">
      <Box x={-28} y={-4} w={52} h={13} d={15} top="url(#dv-red-top)" front="url(#dv-red-front)" side="#3a0e0c" />
      {[0, 1, 2, 3].map((i) => port(-24 + i * 6, 2.5, i))}
      <rect x="4" y="1.5" width="16" height="5" rx="0.6" fill="#1a0606" />
      <text x="12" y="5.4" textAnchor="middle" fontSize="3.2" fill="#fca5a5" fontWeight="700" style={{ fontFamily: "'JetBrains Mono Variable', monospace" }}>FW</text>
      <Badge x={-2} y={-8} kind="firewall" />
    </g>
  )
}

function Modem() {
  return (
    <g filter="url(#pt-shadow)">
      <path d="M12 -8 V-22" stroke="#334155" strokeWidth="2.2" strokeLinecap="round" />
      <Box x={-24} y={-6} w={44} h={12} d={14} top="url(#dv-white)" front="#e5e9ee" side="#b7c0ca" />
      {[0, 1, 2, 3].map((i) => <circle key={i} cx={-18 + i * 6} cy="0" r="1.3" fill={i < 3 ? '#22c55e' : '#f59e0b'} />)}
    </g>
  )
}

const ICONS: Record<DeviceKind, () => ReactNode> = {
  router: Router, switch: Switch, pc: Pc, laptop: Laptop, server: Server, cloud: Cloud, printer: Printer, ap: Ap, firewall: Firewall, modem: Modem,
}

/** A positioned device with Packet-Tracer-style two-line label (model / name). */
export function Device({ kind, x, y, scale = 1, model, name, sub, animate = true }: {
  kind: DeviceKind
  x: number
  y: number
  scale?: number
  model?: string
  name?: string
  sub?: string
  animate?: boolean
}) {
  const Icon = ICONS[kind]
  const labelY = (kind === 'server' ? 34 : kind === 'pc' ? 30 : 24) * scale
  const body = (
    <>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <Icon />
      </g>
      {(model || name) && (
        <text x={x} y={y + labelY + 10} textAnchor="middle" fontSize="10.5" fill="var(--text)" stroke="var(--bg-2)" strokeWidth={3.5} strokeLinejoin="round" paintOrder="stroke" style={{ fontFamily: 'var(--id-font-body)' }}>
          {model && <tspan x={x} dy="0" fill="var(--text-muted)">{model}</tspan>}
          {name && <tspan x={x} dy={model ? 12 : 0} fontWeight="600">{name}</tspan>}
        </text>
      )}
      {sub && (
        <text x={x} y={y + labelY + (model && name ? 34 : 22)} textAnchor="middle" fontSize="9.5" fill="var(--cyan)" stroke="var(--bg-2)" strokeWidth={3} strokeLinejoin="round" paintOrder="stroke" style={{ fontFamily: "'JetBrains Mono Variable', monospace" }}>
          {sub}
        </text>
      )}
    </>
  )
  return animate ? (
    <motion.g variants={item} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
      {body}
    </motion.g>
  ) : (
    <g>{body}</g>
  )
}

export type LinkStatus = 'up' | 'down' | 'blocking'
const STATUS_COL: Record<LinkStatus, string> = { up: '#22c55e', down: '#ef4444', blocking: '#f59e0b' }

/**
 * Packet Tracer style cable: a plain line with a status triangle near each end
 * (green = up, orange = blocking/negotiating, red = down). `dashed` = crossover.
 */
export function PtLink({ from, to, status = 'up', statusB, dashed, pad = 30, animate = true }: {
  from: [number, number]
  to: [number, number]
  status?: LinkStatus
  statusB?: LinkStatus
  dashed?: boolean
  pad?: number
  animate?: boolean
}) {
  const [x1, y1] = from
  const [x2, y2] = to
  const len = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const ang = (Math.atan2(uy, ux) * 180) / Math.PI
  const tri = (px: number, py: number, rot: number, col: string) => (
    <path d="M-5 -4.5 L5 0 L-5 4.5 Z" fill={col} transform={`translate(${px} ${py}) rotate(${rot})`} />
  )
  const a = tri(x1 + ux * pad, y1 + uy * pad, ang, STATUS_COL[status])
  const b = tri(x2 - ux * pad, y2 - uy * pad, ang + 180, STATUS_COL[statusB ?? status])
  const line = (
    <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--text-muted)" strokeWidth="1.6" strokeDasharray={dashed ? '6 4' : undefined} />
  )
  if (!animate) {
    return (
      <g>
        {line}
        {a}
        {b}
      </g>
    )
  }
  return (
    <motion.g variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5 } } }}>
      <motion.line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke="var(--text-muted)"
        strokeWidth="1.6"
        strokeDasharray={dashed ? '6 4' : undefined}
        variants={{ hidden: { pathLength: 0 }, show: { pathLength: 1, transition: { duration: 0.7 } } }}
      />
      {a}
      {b}
    </motion.g>
  )
}
