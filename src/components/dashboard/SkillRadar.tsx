import { motion } from 'motion/react'
import { SKILLS } from '@/content/skills'
import { useI18n } from '@/i18n'

/** Hexagonal radar of skill mastery (0–100). */
export function SkillRadar({ values }: { values: Record<string, number> }) {
  const { l } = useI18n()
  const size = 260
  const c = size / 2
  const R = 92
  const n = SKILLS.length
  const pt = (i: number, r: number) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2
    return [c + Math.cos(a) * r, c + Math.sin(a) * r] as const
  }
  const ring = (f: number) => SKILLS.map((_, i) => pt(i, R * f).join(',')).join(' ')
  const shape = SKILLS.map((s, i) => pt(i, R * Math.max(0.04, (values[s.id] ?? 0) / 100)).join(',')).join(' ')

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto w-full max-w-[300px] overflow-visible" role="img" aria-label={SKILLS.map((s) => `${l(s.label)} ${values[s.id] ?? 0}%`).join(', ')}>
      <defs>
        <linearGradient id="radar-fill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--cyan)" stopOpacity="0.45" />
          <stop offset="1" stopColor="var(--purple)" stopOpacity="0.3" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <polygon key={f} points={ring(f)} fill="none" stroke="var(--line-strong)" strokeDasharray={f === 1 ? undefined : '2 4'} />
      ))}
      {SKILLS.map((_, i) => {
        const [x, y] = pt(i, R)
        return <line key={i} x1={c} y1={c} x2={x} y2={y} stroke="var(--line)" />
      })}
      <motion.polygon
        points={shape}
        fill="url(#radar-fill)"
        stroke="var(--cyan)"
        strokeWidth="1.5"
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        style={{ transformOrigin: `${c}px ${c}px`, filter: 'drop-shadow(0 0 8px rgb(34 211 238 / 0.35))' }}
      />
      {SKILLS.map((s, i) => {
        const [x, y] = pt(i, R * Math.max(0.04, (values[s.id] ?? 0) / 100))
        const [lx, ly] = pt(i, R + 22)
        return (
          <g key={s.id}>
            <motion.circle cx={x} cy={y} r="3" fill="var(--cyan)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1 + i * 0.05 }} />
            <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" className="fill-muted text-[9.5px]">
              {l(s.label).split(' ')[0]}
            </text>
            <text x={lx} y={ly + 11} textAnchor="middle" dominantBaseline="middle" className="fill-cyan font-mono text-[9px]">
              {values[s.id] ?? 0}%
            </text>
          </g>
        )
      })}
    </svg>
  )
}
