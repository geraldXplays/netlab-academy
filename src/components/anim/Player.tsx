import { useEffect, useRef, useState, type ReactNode } from 'react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw } from 'lucide-react'
import type { L } from '@/content/types'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

export interface AnimSpec {
  /** One caption per step (the step count). */
  steps: L[]
  viewBox: string
  /** Milliseconds per step while playing (default 3200). */
  pace?: number
  render: (step: number) => ReactNode
}

/**
 * Step-by-step animated example. Plays automatically once scrolled into view
 * (unless reduced motion is on), loops, and can be driven manually.
 */
export function Player({ spec, title }: { spec: AnimSpec; title?: string }) {
  const { lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const reduced = useReducedMotionPref()
  const box = useRef<HTMLDivElement>(null)
  const inView = useInView(box, { margin: '-80px' })
  const [step, setStep] = useState(0)
  const [playing, setPlaying] = useState(!reduced)
  const n = spec.steps.length

  useEffect(() => {
    if (!playing || !inView) return
    const tm = window.setTimeout(() => setStep((s) => (s + 1) % n), step === n - 1 ? (spec.pace ?? 3200) * 1.6 : spec.pace ?? 3200)
    return () => window.clearTimeout(tm)
  }, [playing, inView, step, n, spec.pace])

  const go = (s: number) => {
    setPlaying(false)
    setStep((s + n) % n)
  }
  const btn = 'grid h-9 w-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-cyan hover:text-text'

  return (
    <div ref={box} className="glass overflow-hidden rounded-3xl">
      {title && (
        <div className="flex items-center gap-2 border-b border-line px-5 py-3">
          <span className="relative flex h-2 w-2"><span className={cn('absolute inset-0 rounded-full bg-cyan', playing && 'animate-ping opacity-60')} /><span className="relative h-2 w-2 rounded-full bg-cyan" /></span>
          <p className="hud-label">{tr('Animated example', 'Exemple animé')}</p>
          <p className="ml-1 truncate text-sm font-semibold">{title}</p>
        </div>
      )}
      <div className="px-3 pt-4 sm:px-6">
        <svg viewBox={spec.viewBox} className="h-auto w-full overflow-visible" role="img" aria-label={spec.steps[step][lang]} style={{ fontFamily: 'var(--id-font-body)' }}>
          <defs>
            <marker id="an-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 10 5 0 10z" fill="var(--cyan)" />
            </marker>
            <filter id="an-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          {spec.render(step)}
        </svg>
      </div>
      <div className="flex flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center sm:px-5">
        <div className="flex items-center gap-1.5">
          <button className={btn} onClick={() => go(step - 1)} aria-label={tr('Previous step', 'Étape précédente')}><ChevronLeft size={16} /></button>
          <button className={cn(btn, 'border-cyan/50 text-cyan')} onClick={() => setPlaying((p) => !p)} aria-label={playing ? tr('Pause', 'Pause') : tr('Play', 'Lecture')}>{playing ? <Pause size={15} /> : <Play size={15} />}</button>
          <button className={btn} onClick={() => go(step + 1)} aria-label={tr('Next step', 'Étape suivante')}><ChevronRight size={16} /></button>
          <button className={btn} onClick={() => { setStep(0); setPlaying(true) }} aria-label={tr('Restart', 'Recommencer')}><RotateCcw size={14} /></button>
          <span className="ml-1 font-mono text-xs text-dim">{step + 1}/{n}</span>
        </div>
        <div className="min-h-[2.6rem] flex-1">
          <AnimatePresence mode="wait">
            <motion.p key={`${step}-${lang}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }} className="text-sm leading-relaxed text-muted" aria-live="polite">
              {spec.steps[step][lang]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
      <div className="flex gap-1 px-5 pb-3">
        {spec.steps.map((_, i) => (
          <button key={i} onClick={() => go(i)} aria-label={`${tr('Step', 'Étape')} ${i + 1}`} className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <motion.span className="block h-full bg-cyan" initial={false} animate={{ width: i < step ? '100%' : i === step ? '100%' : '0%', opacity: i <= step ? 1 : 0 }} transition={{ duration: 0.4 }} />
          </button>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------ drawing helpers ------------------------------ */

export const C = {
  cyan: 'var(--cyan)', blue: 'var(--blue)', purple: 'var(--purple)', success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)',
  text: 'var(--text)', muted: 'var(--text-muted)', dim: 'var(--text-dim)', line: 'var(--line)', bg: 'var(--bg-2)',
}
export const ease = [0.16, 1, 0.3, 1] as const
export const spring = { type: 'spring', stiffness: 140, damping: 20 } as const

/** Text helper */
export function T({ x, y, children, size = 12, fill = C.text, anchor = 'middle', weight = 500, mono = false, opacity = 1 }: {
  x: number; y: number; children: ReactNode; size?: number; fill?: string; anchor?: 'start' | 'middle' | 'end'; weight?: number; mono?: boolean; opacity?: number
}) {
  return (
    <text x={x} y={y} fontSize={size} fill={fill} textAnchor={anchor} fontWeight={weight} opacity={opacity} style={mono ? { fontFamily: "'JetBrains Mono Variable', monospace" } : undefined}>
      {children}
    </text>
  )
}
