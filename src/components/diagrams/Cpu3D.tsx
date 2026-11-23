import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'motion/react'
import { Layers, RotateCcw, FlipHorizontal } from 'lucide-react'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/* ---------- faces (SVG, 300 × 340 — the proportions of an LGA1700 package) ---------- */

const W = 300
const H = 340

function IhsFace() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      <defs>
        <linearGradient id="c3-sub" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#226b45" /><stop offset="1" stopColor="#123d27" /></linearGradient>
        <linearGradient id="c3-ihs" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6f8fa" /><stop offset="0.3" stopColor="#c7cdd4" /><stop offset="0.55" stopColor="#eef1f4" /><stop offset="0.8" stopColor="#aab2bb" /><stop offset="1" stopColor="#d8dde2" />
        </linearGradient>
        <filter id="c3-brush" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.9 0.012" numOctaves="2" seed="7" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 0.22 0" result="g" />
          <feComposite in="g" in2="SourceGraphic" operator="in" result="gm" />
          <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="gm" /></feMerge>
        </filter>
        <radialGradient id="c3-sheen" cx="0.25" cy="0.2" r="0.9"><stop offset="0" stopColor="#fff" stopOpacity="0.6" /><stop offset="0.45" stopColor="#fff" stopOpacity="0" /></radialGradient>
      </defs>
      {/* IHS with ears */}
      <path d="M26 44 H58 V30 H242 V44 H274 V296 H242 V310 H58 V296 H26 Z" fill="url(#c3-ihs)" filter="url(#c3-brush)" stroke="#7f8892" strokeWidth="1.4" />
      <path d="M26 44 H58 V30 H242 V44 H274 V296 H242 V310 H58 V296 H26 Z" fill="url(#c3-sheen)" />
      <path d="M36 286 V266 L56 286 Z" fill="#c9a227" />
      <g fill="#4a525c" fontFamily="'JetBrains Mono Variable', monospace" textAnchor="middle" opacity="0.9">
        <text x="150" y="120" fontSize="26" fontWeight="800" letterSpacing="3">NETLAB</text>
        <text x="150" y="150" fontSize="17" fontWeight="700" letterSpacing="1">CORE X7</text>
        <text x="150" y="176" fontSize="13">14700K</text>
        <text x="150" y="204" fontSize="11">3.40 GHz · 20 C / 28 T</text>
        <text x="150" y="224" fontSize="10">SRN3X  L3 33 MB</text>
        <text x="150" y="258" fontSize="9">X315G417 ◆ e4</text>
      </g>
    </svg>
  )
}

function PadsFace() {
  const cols = 34
  const rows = 40
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      <defs>
        <linearGradient id="c3-sub2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1d5c3b" /><stop offset="1" stopColor="#0f3221" /></linearGradient>
        <radialGradient id="c3-pad" cx="0.35" cy="0.35" r="0.8"><stop offset="0" stopColor="#ffe7a0" /><stop offset="1" stopColor="#b8862b" /></radialGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} rx="6" fill="url(#c3-sub2)" />
      {Array.from({ length: cols * rows }, (_, k) => {
        const c = k % cols
        const r = Math.floor(k / cols)
        const x = 14 + c * 8.3
        const y = 12 + r * 7.9
        // central keep-out with capacitors
        if (c > 11 && c < 22 && r > 13 && r < 26) return null
        return <circle key={k} cx={x} cy={y} r="2.3" fill="url(#c3-pad)" />
      })}
      {Array.from({ length: 18 }, (_, i) => <rect key={i} x={112 + (i % 6) * 13} y={124 + Math.floor(i / 6) * 28} width="9" height="5" rx="1" fill="#c38d3f" stroke="#5a3d12" strokeWidth="0.5" />)}
      <path d="M10 324 V306 L28 324 Z" fill="#e5c158" />
      <text x="150" y="203" textAnchor="middle" fontSize="8" fill="#a7f3d0" opacity="0.75" fontFamily="'JetBrains Mono Variable', monospace">1700 LGA PADS</text>
    </svg>
  )
}

function DieFace() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full">
      <defs>
        <linearGradient id="c3-die" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3b2a5e" /><stop offset="0.5" stopColor="#1e3a5f" /><stop offset="1" stopColor="#3f2d63" /></linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="none" />
      <rect x="62" y="96" width="176" height="148" rx="3" fill="url(#c3-die)" stroke="#94a3b8" strokeWidth="1" />
      {/* cores */}
      {Array.from({ length: 8 }, (_, i) => <rect key={i} x={70 + (i % 4) * 41} y={i < 4 ? 104 : 200} width="36" height="36" rx="2" fill="#6d28d9" fillOpacity="0.35" stroke="#c4b5fd" strokeWidth="0.6" />)}
      {Array.from({ length: 4 }, (_, i) => <rect key={`e${i}`} x={70 + i * 41} y="146" width="36" height="48" rx="2" fill="#0ea5e9" fillOpacity="0.2" stroke="#7dd3fc" strokeWidth="0.6" />)}
      <text x="150" y="174" textAnchor="middle" fontSize="9" fill="#e0f2fe" fontFamily="'JetBrains Mono Variable', monospace">L3 CACHE · RING BUS</text>
      <text x="150" y="268" textAnchor="middle" fontSize="10" fill="#e2e8f0" fontFamily="'JetBrains Mono Variable', monospace">SILICON DIE (~257 mm²)</text>
    </svg>
  )
}

/**
 * A real-looking CPU in 3D: drag to rotate, flip to see the pads, or explode it into
 * its layers (IHS, thermal compound, silicon die, substrate).
 */
export function Cpu3DDiagram() {
  const { lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const reduced = useReducedMotionPref()
  const rx = useMotionValue(-28)
  const ry = useMotionValue(-32)
  const sx = useSpring(rx, { stiffness: 80, damping: 18 })
  const sy = useSpring(ry, { stiffness: 80, damping: 18 })
  const [exploded, setExploded] = useState(false)
  const drag = useRef<{ x: number; y: number; rx: number; ry: number } | null>(null)
  const idle = useRef(true)

  useEffect(() => {
    if (reduced) return
    let raf = 0
    const tick = () => {
      if (idle.current && !drag.current) ry.set(ry.get() + 0.12)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced, ry])

  const layer = (z: number, ez: number) => ({ transform: `translateZ(${exploded ? ez : z}px)`, transition: 'transform 0.9s cubic-bezier(.16,1,.3,1)' })
  const S = 'min(68vw, 300px)'
  const labels: [string, number, string][] = [
    [tr('Integrated heat spreader (IHS) — nickel-plated copper', 'Dissipateur intégré (IHS) — cuivre nickelé'), 150, '#e5e7eb'],
    [tr('Thermal compound / solder (TIM)', 'Pâte / brasure thermique (TIM)'), 90, '#94a3b8'],
    [tr('Silicon die — billions of transistors', 'Puce de silicium — des milliards de transistors'), 40, '#c4b5fd'],
    [tr('Substrate — routes signals to 1,700 gold pads', 'Substrat — achemine les signaux vers 1 700 pastilles dorées'), -10, '#6ee7b7'],
  ]

  return (
    <div className="flex flex-col items-center gap-4">
      <div
        className="relative grid w-full cursor-grab touch-none place-items-center select-none active:cursor-grabbing"
        style={{ height: 'min(80vw, 420px)', perspective: 1100 }}
        onPointerDown={(e) => {
          idle.current = false
          drag.current = { x: e.clientX, y: e.clientY, rx: rx.get(), ry: ry.get() }
          ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)
        }}
        onPointerMove={(e) => {
          if (!drag.current) return
          ry.set(drag.current.ry + (e.clientX - drag.current.x) * 0.5)
          rx.set(Math.max(-80, Math.min(80, drag.current.rx - (e.clientY - drag.current.y) * 0.5)))
        }}
        onPointerUp={() => { drag.current = null }}
        role="img"
        aria-label={tr('3D model of a CPU — drag to rotate', 'Modèle 3D d’un processeur — glissez pour tourner')}
      >
        <motion.div animate={{ scale: exploded ? 0.78 : 1, x: exploded ? '12%' : '0%' }} transition={{ duration: 0.8 }} style={{ width: S, aspectRatio: `${W} / ${H}`, rotateX: sx, rotateY: sy, transformStyle: 'preserve-3d', position: 'relative' }}>
          {/* substrate: top (with IHS outline hidden when exploded) and bottom (pads) */}
          <div className="absolute inset-0" style={{ ...layer(0, -60), transformStyle: 'preserve-3d' }}>
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'translateZ(1px)' }}>
              <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full"><defs><linearGradient id="c3-subt" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#226b45" /><stop offset="1" stopColor="#123d27" /></linearGradient></defs><rect width={W} height={H} rx="6" fill="url(#c3-subt)" />{Array.from({ length: 14 }, (_, i) => <rect key={i} x={20 + (i % 7) * 38} y={i < 7 ? 10 : 320} width="12" height="6" rx="1" fill="#c38d3f" stroke="#5a3d12" strokeWidth="0.6" />)}<rect x="-1" y="60" width="9" height="16" fill="#0b0c0e" /><rect x={W - 8} y="60" width="9" height="16" fill="#0b0c0e" /></svg>
            </div>
            <div className="absolute inset-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg) translateZ(1px)' }}><PadsFace /></div>
            {/* edge thickness */}
            {[0, 1, 2, 3].map((k) => (
              <div key={k} className="absolute bg-[#0e2e1e]" style={k < 2 ? { left: 0, right: 0, height: 4, top: k ? 'auto' : 0, bottom: k ? 0 : 'auto', transform: `rotateX(90deg) translateZ(${k ? -2 : 2}px)`, transformOrigin: k ? 'bottom' : 'top' } : { top: 0, bottom: 0, width: 4, left: k === 2 ? 0 : 'auto', right: k === 3 ? 0 : 'auto', transform: `rotateY(90deg)`, transformOrigin: k === 2 ? 'left' : 'right' }} />
            ))}
          </div>
          {/* die */}
          <div className="absolute inset-0" style={{ ...layer(3, 10), opacity: exploded ? 1 : 0, transition: 'transform 0.9s cubic-bezier(.16,1,.3,1), opacity .5s', backfaceVisibility: 'hidden' }}><DieFace /></div>
          {/* thermal compound */}
          <div className="absolute" style={{ left: '20%', right: '20%', top: '27%', bottom: '27%', ...layer(4, 70), opacity: exploded ? 0.85 : 0, transition: 'transform 0.9s cubic-bezier(.16,1,.3,1), opacity .5s', background: 'radial-gradient(circle at 40% 40%, #e2e8f0, #64748b)', borderRadius: 6, backfaceVisibility: 'hidden' }} />
          {/* IHS */}
          <div className="absolute inset-0" style={{ ...layer(6, 130), backfaceVisibility: 'hidden', filter: 'drop-shadow(0 6px 10px rgba(0,0,0,.45))' }}><IhsFace /></div>
        </motion.div>
        {exploded && (
          <div className="pointer-events-none absolute top-3 left-3 space-y-1.5 text-[0.72rem]">
            {labels.map(([l, , c]) => (
              <motion.p key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 rounded-lg bg-bg/70 px-2 py-1 backdrop-blur"><span className="h-2 w-2 rounded-full" style={{ background: c }} />{l}</motion.p>
            ))}
          </div>
        )}
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {[
          [tr('Top', 'Dessus'), () => { idle.current = false; rx.set(-28); ry.set(-32) }, RotateCcw, false],
          [tr('Flip: gold pads', 'Retourner : pastilles'), () => { idle.current = false; rx.set(-20); ry.set(ry.get() + 180) }, FlipHorizontal, false],
          [exploded ? tr('Assemble', 'Assembler') : tr('Explode layers', 'Éclater les couches'), () => { setExploded((v) => !v); idle.current = false; rx.set(-55); ry.set(-35) }, Layers, exploded],
        ].map(([l, fn, Icon, on]) => {
          const I = Icon as typeof Layers
          return (
            <button key={l as string} onClick={fn as () => void} className={cn('flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors', on ? 'border-cyan bg-cyan-soft text-text' : 'border-line text-muted hover:border-cyan hover:text-text')}>
              <I size={13} /> {l as string}
            </button>
          )
        })}
      </div>
      <p className="text-center text-xs text-dim">{tr('Drag to rotate · the model turns slowly by itself', 'Glissez pour tourner · le modèle tourne lentement tout seul')}</p>
    </div>
  )
}
