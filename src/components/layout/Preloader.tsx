import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { LogoMark } from '@/components/ui/Logo'
import { useUI } from '@/store/ui'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

const BOOT = [
  'POST ........................ OK',
  'eth0: link up 10Gb/s full-duplex',
  'DHCPACK 10.0.0.42 from 10.0.0.1',
  'loading curriculum ......... 6 levels',
  'NetLab Academy ready',
]

const SESSION_KEY = 'netlab:booted'

/** Session-once cinematic boot: logo draw, boot log, counter, curtain lift. */
export function Preloader() {
  const reduced = useReducedMotionPref()
  const setIntroDone = useUI((s) => s.setIntroDone)
  const [show] = useState(() => {
    try {
      return !sessionStorage.getItem(SESSION_KEY)
    } catch {
      return true
    }
  })
  const [gone, setGone] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const counter = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!show || reduced) {
      setIntroDone()
      setGone(true)
    }
  }, [show, reduced, setIntroDone])

  useGSAP(
    () => {
      if (!show || reduced) return
      document.documentElement.style.overflow = 'hidden'
      const n = { v: 0 }
      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem(SESSION_KEY, '1')
          } catch {
            /* ignore */
          }
          document.documentElement.style.overflow = ''
          setGone(true)
        },
      })
      tl.to('[data-logo-hex]', { strokeDashoffset: 0, duration: 1.1, ease: 'power2.inOut' })
        .from('[data-logo-links] path', { attr: { 'stroke-dasharray': '0 1' }, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, '-=0.35')
        .from('[data-logo-nodes] circle', { scale: 0, transformOrigin: 'center', duration: 0.5, stagger: 0.06, ease: 'back.out(3)' }, '-=0.3')
        .from('[data-boot-line]', { opacity: 0, x: -8, duration: 0.25, stagger: 0.14, ease: 'power2.out' }, 0.3)
        .to(n, { v: 100, duration: 1.5, ease: 'power2.inOut', onUpdate: () => counter.current && (counter.current.textContent = String(Math.round(n.v)).padStart(3, '0')) }, 0.2)
        .to('[data-boot-bar]', { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }, 0.2)
        .to('[data-boot-content]', { opacity: 0, y: -20, duration: 0.45, ease: 'power2.in' }, '+=0.15')
        .add(() => setIntroDone(), '-=0.1')
        .to('[data-curtain]', { yPercent: -100, duration: 0.9, ease: 'expo.inOut', stagger: 0.06 }, '-=0.1')
    },
    { scope: root, dependencies: [show, reduced] },
  )

  if (gone || !show || reduced) return null

  return (
    <div ref={root} className="fixed inset-0 z-[100]" role="status" aria-label="Loading NetLab Academy">
      <div data-curtain className="absolute inset-0 bg-bg-2" />
      <div data-curtain className="absolute inset-0 bg-bg">
        <div className="bg-grid mask-radial absolute inset-0" />
      </div>
      <div data-boot-content className="absolute inset-0 grid place-items-center">
        <div className="flex w-[min(360px,82vw)] flex-col items-center">
          <LogoMark animated className="h-20 w-20 drop-shadow-[0_0_24px_rgb(34_211_238/0.5)]" />
          <p className="mt-5 font-display text-xl font-semibold tracking-tight">
            NetLab<span className="text-cyan">.</span> <span className="font-normal text-muted">Academy</span>
          </p>
          <div className="mt-8 w-full space-y-1 font-mono text-[0.7rem] text-dim">
            {BOOT.map((l, i) => (
              <p key={l} data-boot-line className={i === BOOT.length - 1 ? 'text-cyan' : undefined}>
                <span className="text-dim/60">[{(0.12 * (i + 1)).toFixed(3)}]</span> {l}
              </p>
            ))}
          </div>
          <div className="mt-6 flex w-full items-center gap-3">
            <div className="h-px flex-1 overflow-hidden bg-line-strong">
              <div data-boot-bar className="h-full origin-left scale-x-0 bg-gradient-to-r from-cyan to-purple" />
            </div>
            <span ref={counter} className="font-mono text-xs text-cyan tabular-nums">000</span>
          </div>
        </div>
      </div>
    </div>
  )
}
