import { motion } from 'motion/react'
import { useState } from 'react'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

const C = { o: '#f97316', g: '#16a34a', b: '#2563eb', br: '#8b5a2b', w: '#f8fafc' }
type Wire = { base: string; stripe?: string; en: string; fr: string }
const B: Wire[] = [
  { base: C.w, stripe: C.o, en: 'white-orange', fr: 'blanc-orange' },
  { base: C.o, en: 'orange', fr: 'orange' },
  { base: C.w, stripe: C.g, en: 'white-green', fr: 'blanc-vert' },
  { base: C.b, en: 'blue', fr: 'bleu' },
  { base: C.w, stripe: C.b, en: 'white-blue', fr: 'blanc-bleu' },
  { base: C.g, en: 'green', fr: 'vert' },
  { base: C.w, stripe: C.br, en: 'white-brown', fr: 'blanc-marron' },
  { base: C.br, en: 'brown', fr: 'marron' },
]
// T568A swaps the orange pair (1,2) with the green pair (3,6).
const A: Wire[] = [B[2], B[5], B[0], B[3], B[4], B[1], B[6], B[7]]

/** Realistic RJ45 plug, viewed from the contacts side, with a T568A/B switch. */
export function Rj45Diagram() {
  const { lang } = useI18n()
  const reduced = useReducedMotionPref()
  const [std, setStd] = useState<'B' | 'A'>('B')
  const wires = std === 'B' ? B : A
  return (
    <div>
      <div className="mb-3 flex justify-center gap-2">
        {(['B', 'A'] as const).map((s) => (
          <button key={s} onClick={() => setStd(s)} aria-pressed={std === s} className={cn('rounded-full border px-4 py-1.5 font-mono text-xs transition-colors', std === s ? 'border-cyan bg-cyan text-on-accent' : 'border-line text-muted hover:text-text')}>
            T568{s}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 640 330" className="h-auto w-full" role="img" aria-label={`RJ45 T568${std}`} style={{ fontFamily: 'var(--id-font-body)' }}>
        <defs>
          <linearGradient id="rj-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#e0f2fe" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#e0f2fe" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="rj-gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="1" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="rj-jacket" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1e40af" />
            <stop offset="0.5" stopColor="#3b82f6" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
        {/* cable jacket */}
        <rect x="250" y="250" width="140" height="80" rx="10" fill="url(#rj-jacket)" />
        <rect x="236" y="230" width="168" height="30" rx="6" fill="#1d4ed8" opacity="0.9" />
        {/* wires */}
        {wires.map((w, i) => {
          const x = 264 + i * 16
          return (
            <motion.g key={`${std}-${i}`} initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}>
              <path d={`M${290 + i * 9} 250 C ${290 + i * 9} 200, ${x + 6} 200, ${x + 6} 150 V70`} fill="none" stroke={w.base} strokeWidth="11" strokeLinecap="round" />
              {w.stripe && (
                <path d={`M${290 + i * 9} 250 C ${290 + i * 9} 200, ${x + 6} 200, ${x + 6} 150 V70`} fill="none" stroke={w.stripe} strokeWidth="11" strokeDasharray="7 7" strokeLinecap="butt" />
              )}
            </motion.g>
          )
        })}
        {/* transparent plug housing */}
        <path d="M250 40 H390 V200 L380 222 H260 L250 200 Z" fill="url(#rj-body)" stroke="#94a3b8" strokeWidth="2" />
        <path d="M262 40 V24 H378 V40" fill="none" stroke="#94a3b8" strokeWidth="2" />
        {/* gold contacts */}
        {wires.map((_, i) => (
          <g key={i}>
            <rect x={264 + i * 16} y="44" width="12" height="26" rx="1.5" fill="url(#rj-gold)" stroke="#92400e" strokeWidth="0.8" />
            <text x={270 + i * 16} y="36" textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text)">{i + 1}</text>
          </g>
        ))}
        {/* legends */}
        {wires.map((w, i) => {
          const left = i < 4
          const y = 80 + (i % 4) * 34
          return (
            <g key={`l${std}${i}`}>
              <rect x={left ? 30 : 470} y={y - 10} width="22" height="14" rx="3" fill={w.base} stroke="#64748b" />
              {w.stripe && <rect x={left ? 30 : 470} y={y - 5} width="22" height="4" fill={w.stripe} />}
              <text x={left ? 60 : 500} y={y + 1} fontSize="12" fill="var(--text)">
                <tspan fontWeight="700" fill="var(--cyan)">{i + 1}</tspan> {lang === 'fr' ? w.fr : w.en}
              </text>
              {[1, 2, 3, 6].includes(i + 1) && (
                <text x={left ? 60 : 500} y={y + 15} fontSize="9.5" fill="var(--text-dim)" style={{ fontFamily: "'JetBrains Mono Variable', monospace" }}>
                  {i + 1 <= 2 ? 'TX ±' : 'RX ±'}
                </text>
              )}
            </g>
          )
        })}
        <text x="320" y="320" textAnchor="middle" fontSize="11" fill="#e0e7ff">{lang === 'fr' ? 'Câble Cat6 · clip au dos' : 'Cat6 cable · clip on the back'}</text>
      </svg>
    </div>
  )
}
