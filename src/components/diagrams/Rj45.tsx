import { motion } from 'motion/react'
import { useState } from 'react'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

type Pair = 'orange' | 'green' | 'blue' | 'brown'
const COL: Record<Pair, string> = { orange: '#f97316', green: '#16a34a', blue: '#2563eb', brown: '#7c4a1e' }
type Wire = { pair: Pair; striped: boolean; en: string; fr: string }
const B: Wire[] = [
  { pair: 'orange', striped: true, en: 'white-orange', fr: 'blanc-orange' },
  { pair: 'orange', striped: false, en: 'orange', fr: 'orange' },
  { pair: 'green', striped: true, en: 'white-green', fr: 'blanc-vert' },
  { pair: 'blue', striped: false, en: 'blue', fr: 'bleu' },
  { pair: 'blue', striped: true, en: 'white-blue', fr: 'blanc-bleu' },
  { pair: 'green', striped: false, en: 'green', fr: 'vert' },
  { pair: 'brown', striped: true, en: 'white-brown', fr: 'blanc-marron' },
  { pair: 'brown', striped: false, en: 'brown', fr: 'marron' },
]
// T568A swaps the orange pair (1,2) with the green pair (3,6).
const A: Wire[] = [B[2], B[5], B[0], B[3], B[4], B[1], B[6], B[7]]

const ROLE: Record<number, string> = { 1: 'TX+', 2: 'TX−', 3: 'RX+', 6: 'RX−' }
const PITCH = 20
const X0 = 290 // left edge of channel 1
const cx = (i: number) => X0 + i * PITCH + 7
const fill = (w: Wire) => (w.striped ? `url(#rj-stripe-${w.pair})` : COL[w.pair])

/** Realistic RJ45 plug seen from the contacts side (clip underneath), with a T568A/B switch. */
export function Rj45Diagram() {
  const { lang } = useI18n()
  const reduced = useReducedMotionPref()
  const [std, setStd] = useState<'B' | 'A'>('B')
  const [hot, setHot] = useState<Pair | null>(null)
  const wires = std === 'B' ? B : A
  const dim = (w: Wire) => (hot && hot !== w.pair ? 0.25 : 1)
  const mono = { fontFamily: "'JetBrains Mono Variable', monospace" }

  return (
    <div>
      <div className="mb-3 flex justify-center gap-2">
        {(['B', 'A'] as const).map((s) => (
          <button key={s} onClick={() => setStd(s)} aria-pressed={std === s} className={cn('rounded-full border px-4 py-1.5 font-mono text-xs transition-colors', std === s ? 'border-cyan bg-cyan text-on-accent' : 'border-line text-muted hover:text-text')}>
            T568{s}
          </button>
        ))}
      </div>
      <svg viewBox="0 0 720 400" className="h-auto w-full" role="img" aria-label={`RJ45 T568${std}`} style={{ fontFamily: 'var(--id-font-body)' }}>
        <defs>
          {(Object.keys(COL) as Pair[]).map((p) => (
            <pattern key={p} id={`rj-stripe-${p}`} width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
              <rect width="14" height="14" fill="#f8fafc" />
              <rect width="5" height="14" fill={COL[p]} />
            </pattern>
          ))}
          <linearGradient id="rj-cyl" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#000" stopOpacity="0.35" />
            <stop offset="0.35" stopColor="#fff" stopOpacity="0.35" />
            <stop offset="0.6" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="rj-shell" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#dbeafe" stopOpacity="0.32" />
            <stop offset="0.18" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="0.5" stopColor="#ffffff" stopOpacity="0.06" />
            <stop offset="0.85" stopColor="#ffffff" stopOpacity="0.14" />
            <stop offset="1" stopColor="#dbeafe" stopOpacity="0.36" />
          </linearGradient>
          <linearGradient id="rj-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#a16207" />
            <stop offset="0.4" stopColor="#fde68a" />
            <stop offset="0.7" stopColor="#facc15" />
            <stop offset="1" stopColor="#854d0e" />
          </linearGradient>
          <linearGradient id="rj-jacket" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#1e3a8a" />
            <stop offset="0.4" stopColor="#3b82f6" />
            <stop offset="0.6" stopColor="#2563eb" />
            <stop offset="1" stopColor="#172554" />
          </linearGradient>
          <linearGradient id="rj-boot" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#0f172a" />
            <stop offset="0.45" stopColor="#475569" />
            <stop offset="1" stopColor="#020617" />
          </linearGradient>
          <filter id="rj-sh" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.45" />
          </filter>
        </defs>

        <g filter="url(#rj-sh)">
          {/* boot + cable */}
          <rect x="334" y="318" width="72" height="52" fill="url(#rj-jacket)" />
          <path d="M296 232 H444 L430 322 H310 Z" fill="url(#rj-boot)" />
          {Array.from({ length: 7 }, (_, i) => (
            <path key={i} d={`M${300 + i * 1.8} ${246 + i * 11} H${440 - i * 1.8}`} stroke="#000" strokeOpacity="0.45" strokeWidth="2" />
          ))}
          {/* jacket entering the plug, up past the strain relief */}
          <rect x="318" y="196" width="104" height="38" rx="6" fill="url(#rj-jacket)" />
          <path d="M318 198 H422" stroke="#93c5fd" strokeOpacity="0.5" strokeWidth="1.5" />

          {/* wires: fan out of the jacket, then straight in their channels up to the contacts */}
          {wires.map((w, i) => {
            const startX = 334 + i * 10
            const x = cx(i)
            const d = `M${startX} 200 C ${startX} 172, ${x} 176, ${x} 148 V 66`
            return (
              <motion.g key={`${std}-${i}`} initial={reduced ? false : { opacity: 0, y: 14 }} animate={{ opacity: dim(w), y: 0 }} transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.35 }} onMouseEnter={() => setHot(w.pair)} onMouseLeave={() => setHot(null)} style={{ cursor: 'pointer' }}>
                <path d={d} fill="none" stroke="#0b0f14" strokeWidth="14" strokeLinecap="round" />
                <path d={d} fill="none" stroke={fill(w)} strokeWidth="12" strokeLinecap="round" />
                <rect x={x - 6} y="66" width="12" height="82" fill="url(#rj-cyl)" />
              </motion.g>
            )
          })}

          {/* clear plastic housing */}
          <path d="M276 34 Q276 26 284 26 H456 Q464 26 464 34 V214 L452 236 H288 L276 214 Z" fill="url(#rj-shell)" stroke="#cbd5e1" strokeOpacity="0.8" strokeWidth="2" />
          <path d="M282 32 H458" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" />
          <path d="M282 40 V210" stroke="#fff" strokeOpacity="0.25" strokeWidth="3" />
          {/* strain-relief wedge pressing the jacket */}
          <path d="M300 214 H440 L432 226 H308 Z" fill="#e2e8f0" fillOpacity="0.35" stroke="#cbd5e1" strokeOpacity="0.6" />
          {/* plastic fins between contacts */}
          {Array.from({ length: 9 }, (_, k) => (
            <rect key={k} x={X0 - 4 + k * PITCH} y="34" width="4" height="40" rx="1" fill="#f1f5f9" fillOpacity="0.4" />
          ))}
          {/* gold contact blades with insulation-displacement teeth biting into the wires */}
          {wires.map((w, i) => (
            <g key={`c${i}`} opacity={dim(w)}>
              <rect x={cx(i) - 5} y="36" width="10" height="34" rx="1.2" fill="url(#rj-gold)" stroke="#713f12" strokeWidth="0.6" />
              <path d={`M${cx(i) - 5} 70 l2.5 8 l2.5 -8 l2.5 8 l2.5 -8`} fill="url(#rj-gold)" stroke="#713f12" strokeWidth="0.6" strokeLinejoin="round" />
              <rect x={cx(i) - 3.5} y="38" width="2" height="24" fill="#fff" opacity="0.55" />
            </g>
          ))}
          {/* pin numbers */}
          {wires.map((_, i) => (
            <text key={`n${i}`} x={cx(i)} y="18" textAnchor="middle" fontSize="12" fontWeight="700" fill="var(--text)" style={mono}>
              {i + 1}
            </text>
          ))}
        </g>

        {/* legends */}
        {wires.map((w, i) => {
          const left = i < 4
          const y = 70 + (i % 4) * 46
          const lx = left ? 30 : 500
          const role = ROLE[i + 1]
          return (
            <g key={`l${std}${i}`} opacity={dim(w)} onMouseEnter={() => setHot(w.pair)} onMouseLeave={() => setHot(null)} style={{ cursor: 'pointer' }}>
              <rect x={lx} y={y - 9} width="40" height="14" rx="7" fill={fill(w)} stroke="#0b0f14" strokeWidth="1" />
              <text x={lx + 50} y={y + 2} fontSize="13" fill="var(--text)">
                <tspan fontWeight="700" fill="var(--cyan)" style={mono}>{i + 1}</tspan> {lang === 'fr' ? w.fr : w.en}
              </text>
              <text x={lx + 50} y={y + 18} fontSize="10" fill="var(--text-dim)" style={mono}>
                {role ? `${role} · ${lang === 'fr' ? 'données' : 'data'}` : 'PoE / Gigabit'}
              </text>
            </g>
          )
        })}
        <text x="370" y="390" textAnchor="middle" fontSize="11" fill="var(--text-dim)">
          {lang === 'fr' ? 'Vue côté contacts, clip dessous · survolez une paire' : 'Contacts side, clip underneath · hover a pair to highlight it'}
        </text>
      </svg>
    </div>
  )
}
