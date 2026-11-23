import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { item } from '@/components/diagrams/kit'

/**
 * Network device icons in the visual language of Cisco Packet Tracer:
 * shaded blue routers/switches with direction arrows, beige-blue PCs, dark
 * servers, and links with green/orange/red status lights at each end.
 * Each icon is drawn centred on (0,0) and roughly 64px wide at scale 1.
 */

export type DeviceKind = 'router' | 'switch' | 'pc' | 'laptop' | 'server' | 'cloud' | 'printer' | 'ap' | 'firewall' | 'modem'

/** Shared gradients — include once inside each <svg> that uses devices. */
export function DeviceDefs() {
  return (
    <defs>
      <linearGradient id="pt-top" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#bfe0f2" />
        <stop offset="1" stopColor="#6fa8cc" />
      </linearGradient>
      <linearGradient id="pt-side" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2f78a3" />
        <stop offset="1" stopColor="#174a6a" />
      </linearGradient>
      <linearGradient id="pt-screen" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#7cc4ff" />
        <stop offset="1" stopColor="#1d5fa8" />
      </linearGradient>
      <linearGradient id="pt-case" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#e7ebf0" />
        <stop offset="1" stopColor="#aab4c0" />
      </linearGradient>
      <linearGradient id="pt-server" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#4b5563" />
        <stop offset="1" stopColor="#1f2937" />
      </linearGradient>
      <linearGradient id="pt-cloud" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="1" stopColor="#b9d6ea" />
      </linearGradient>
      <linearGradient id="pt-brick" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#f0855a" />
        <stop offset="1" stopColor="#b9452a" />
      </linearGradient>
      <filter id="pt-shadow" x="-30%" y="-30%" width="160%" height="160%">
        <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#000" floodOpacity="0.35" />
      </filter>
    </defs>
  )
}

const arrow = (x: number, y: number, rot: number, key: string) => (
  <path key={key} d="M-5 -1.6 H2 V-4 L6 0 L2 4 V1.6 H-5 Z" fill="#fff" transform={`translate(${x} ${y}) rotate(${rot})`} />
)

function Router() {
  return (
    <g filter="url(#pt-shadow)">
      <path d="M-30 -6 V8 A30 10 0 0 0 30 8 V-6 Z" fill="url(#pt-side)" />
      <ellipse cx="0" cy="-6" rx="30" ry="10" fill="url(#pt-top)" stroke="#1d5b80" strokeWidth="0.8" />
      {/* four arrows: two in, two out */}
      {arrow(-11, -9, 25, 'a')}
      {arrow(11, -3, 205, 'b')}
      {arrow(11, -9, -25, 'c')}
      {arrow(-11, -3, 155, 'd')}
      <path d="M-30 8 A30 10 0 0 0 30 8" fill="none" stroke="#0e3550" strokeWidth="0.8" />
    </g>
  )
}

function Switch() {
  return (
    <g filter="url(#pt-shadow)">
      <path d="M-34 -4 L-22 -14 H34 L22 -4 Z" fill="url(#pt-top)" stroke="#1d5b80" strokeWidth="0.8" />
      <path d="M-34 -4 H22 V8 H-34 Z" fill="url(#pt-side)" />
      <path d="M22 -4 L34 -14 V-2 L22 8 Z" fill="#164462" />
      {arrow(-8, -11, 180, 'a')}
      {arrow(6, -11, 0, 'b')}
      {arrow(-12, -7, 180, 'c')}
      {arrow(2, -7, 0, 'd')}
      {Array.from({ length: 8 }, (_, i) => (
        <rect key={i} x={-30 + i * 6.5} y="0" width="4" height="3" rx="0.6" fill="#0b2a3e" />
      ))}
    </g>
  )
}

function Pc() {
  return (
    <g filter="url(#pt-shadow)">
      <rect x="-22" y="-26" width="44" height="32" rx="3" fill="url(#pt-case)" stroke="#7b8794" strokeWidth="0.8" />
      <rect x="-18" y="-22" width="36" height="24" rx="1.5" fill="url(#pt-screen)" />
      <path d="M-14 -20 L4 -20 L-14 -6 Z" fill="#fff" opacity="0.18" />
      <rect x="-5" y="6" width="10" height="5" fill="#9aa5b1" />
      <path d="M-26 14 H26 L22 20 H-22 Z" fill="url(#pt-case)" stroke="#7b8794" strokeWidth="0.8" />
      {Array.from({ length: 6 }, (_, i) => (
        <rect key={i} x={-19 + i * 6.5} y="15.6" width="5" height="1.6" rx="0.4" fill="#8592a0" />
      ))}
    </g>
  )
}

function Laptop() {
  return (
    <g filter="url(#pt-shadow)">
      <rect x="-22" y="-22" width="44" height="28" rx="3" fill="#cfd6de" stroke="#7b8794" strokeWidth="0.8" />
      <rect x="-19" y="-19" width="38" height="22" rx="1.5" fill="url(#pt-screen)" />
      <path d="M-28 8 H28 L24 14 H-24 Z" fill="url(#pt-case)" stroke="#7b8794" strokeWidth="0.8" />
      <rect x="-6" y="9.5" width="12" height="2" rx="1" fill="#8592a0" />
    </g>
  )
}

function Server() {
  return (
    <g filter="url(#pt-shadow)">
      <rect x="-16" y="-30" width="32" height="56" rx="3" fill="url(#pt-server)" stroke="#111827" strokeWidth="0.8" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i}>
          <rect x="-12" y={-26 + i * 12} width="24" height="9" rx="1.2" fill="#374151" stroke="#4b5563" strokeWidth="0.6" />
          <circle cx="8" cy={-21.5 + i * 12} r="1.4" fill={i === 1 ? '#f59e0b' : '#22c55e'} />
          <rect x="-9" y={-22.5 + i * 12} width="12" height="1.6" rx="0.6" fill="#6b7280" />
        </g>
      ))}
    </g>
  )
}

function Cloud() {
  return (
    <g filter="url(#pt-shadow)">
      <path
        d="M-30 10 A12 12 0 0 1 -26 -10 A15 15 0 0 1 -2 -20 A16 16 0 0 1 24 -12 A12 12 0 0 1 32 10 Z"
        fill="url(#pt-cloud)"
        stroke="#7aa7c7"
        strokeWidth="1"
      />
    </g>
  )
}

function Printer() {
  return (
    <g filter="url(#pt-shadow)">
      <rect x="-14" y="-24" width="28" height="12" fill="#fff" stroke="#9aa5b1" strokeWidth="0.8" />
      <rect x="-24" y="-14" width="48" height="22" rx="3" fill="url(#pt-case)" stroke="#7b8794" strokeWidth="0.8" />
      <rect x="-14" y="4" width="28" height="12" fill="#fff" stroke="#9aa5b1" strokeWidth="0.8" />
      <circle cx="16" cy="-6" r="1.8" fill="#22c55e" />
      <rect x="-18" y="-8" width="20" height="3" rx="1" fill="#8592a0" />
    </g>
  )
}

function Ap() {
  return (
    <g filter="url(#pt-shadow)">
      <ellipse cx="0" cy="8" rx="22" ry="7" fill="url(#pt-side)" />
      <ellipse cx="0" cy="4" rx="22" ry="7" fill="url(#pt-top)" stroke="#1d5b80" strokeWidth="0.8" />
      {[8, 14, 20].map((r) => (
        <path key={r} d={`M${-r * 0.7} ${-r * 0.4 - 2} A${r} ${r} 0 0 1 ${r * 0.7} ${-r * 0.4 - 2}`} fill="none" stroke="#2f78a3" strokeWidth="2" strokeLinecap="round" />
      ))}
    </g>
  )
}

function Firewall() {
  return (
    <g filter="url(#pt-shadow)">
      <rect x="-26" y="-18" width="52" height="34" rx="2" fill="url(#pt-brick)" stroke="#7c2d12" strokeWidth="0.8" />
      {[-9, 0, 9].map((y) => (
        <path key={y} d={`M-26 ${y} H26`} stroke="#fde2d4" strokeWidth="1" opacity="0.8" />
      ))}
      {[-18, -9, 0, 9].map((y, r) =>
        [-13, 0, 13].map((x) => (
          <path key={`${x}${y}`} d={`M${x + (r % 2 ? 6 : 0)} ${y} V${y + 9}`} stroke="#fde2d4" strokeWidth="1" opacity="0.8" />
        )),
      )}
    </g>
  )
}

function Modem() {
  return (
    <g filter="url(#pt-shadow)">
      <rect x="-24" y="-10" width="48" height="18" rx="4" fill="url(#pt-case)" stroke="#7b8794" strokeWidth="0.8" />
      {[0, 1, 2, 3].map((i) => (
        <circle key={i} cx={-14 + i * 8} cy="-1" r="1.8" fill={i < 3 ? '#22c55e' : '#f59e0b'} />
      ))}
      <path d="M14 -10 V-24" stroke="#7b8794" strokeWidth="2" strokeLinecap="round" />
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
