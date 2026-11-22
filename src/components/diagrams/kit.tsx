import { motion, type Variants } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

/** Shared building blocks for lesson diagrams. Everything assembles when scrolled into view. */

export const item: Variants = {
  hidden: { opacity: 0, y: 8, scale: 0.94 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } },
}
export const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  show: { pathLength: 1, opacity: 1, transition: { duration: 0.8, ease: 'easeInOut' } },
}

export function Svg({ viewBox, label, children }: { viewBox: string; label: string; children: ReactNode }) {
  const reduced = useReducedMotionPref()
  return (
    <motion.svg
      viewBox={viewBox}
      role="img"
      aria-label={label}
      className="h-auto w-full overflow-visible"
      initial={reduced ? 'show' : 'hidden'}
      whileInView="show"
      viewport={{ once: true, margin: '-60px' }}
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      style={{ fontFamily: 'var(--id-font-body)' }}
    >
      <defs>
        <marker id="dg-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 10 5 0 10z" fill="var(--cyan)" />
        </marker>
      </defs>
      {children}
    </motion.svg>
  )
}

type Tone = 'cyan' | 'blue' | 'purple' | 'success' | 'warning' | 'danger' | 'muted'
const toneVar: Record<Tone, string> = {
  cyan: 'var(--cyan)', blue: 'var(--blue)', purple: 'var(--purple)', success: 'var(--success)',
  warning: 'var(--warning)', danger: 'var(--danger)', muted: 'var(--text-dim)',
}

export function Box({ x, y, w, h, label, sub, tone = 'cyan', fill = false, rx = 10, size = 13 }: {
  x: number; y: number; w: number; h: number; label: string; sub?: string; tone?: Tone; fill?: boolean; rx?: number; size?: number
}) {
  const c = toneVar[tone]
  return (
    <motion.g variants={item} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
      <rect x={x} y={y} width={w} height={h} rx={rx} fill={fill ? c : 'var(--bg-2)'} fillOpacity={fill ? 0.16 : 1} stroke={c} strokeWidth="1.4" />
      <text x={x + w / 2} y={y + h / 2 + (sub ? -3 : 4)} textAnchor="middle" fontSize={size} fontWeight={600} fill="var(--text)">
        {label}
      </text>
      {sub && (
        <text x={x + w / 2} y={y + h / 2 + 13} textAnchor="middle" fontSize={size - 3} fill="var(--text-dim)" style={{ fontFamily: 'var(--font-mono, monospace)' }}>
          {sub}
        </text>
      )}
    </motion.g>
  )
}

export function Line({ d, tone = 'cyan', arrow = false, dashed = false, width = 1.6 }: { d: string; tone?: Tone; arrow?: boolean; dashed?: boolean; width?: number }) {
  return (
    <motion.path
      variants={draw}
      d={d}
      fill="none"
      stroke={toneVar[tone]}
      strokeWidth={width}
      strokeDasharray={dashed ? '5 5' : undefined}
      markerEnd={arrow ? 'url(#dg-arrow)' : undefined}
    />
  )
}

export function Label({ x, y, children, tone = 'muted', size = 11, anchor = 'middle', weight = 500, mono = false }: {
  x: number; y: number; children: ReactNode; tone?: Tone | 'text'; size?: number; anchor?: 'start' | 'middle' | 'end'; weight?: number; mono?: boolean
}) {
  return (
    <motion.text
      variants={item}
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={size}
      fontWeight={weight}
      fill={tone === 'text' ? 'var(--text)' : toneVar[tone]}
      style={mono ? { fontFamily: "'JetBrains Mono Variable', monospace" } : undefined}
    >
      {children}
    </motion.text>
  )
}

/** A dot that travels along a path forever (decorative traffic). */
export function Packet({ path, dur = 2.4, delay = 0, tone = 'cyan' }: { path: string; dur?: number; delay?: number; tone?: Tone }) {
  const reduced = useReducedMotionPref()
  if (reduced) return null
  return (
    <circle r="4" fill={toneVar[tone]} opacity="0.9">
      <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
    </circle>
  )
}
