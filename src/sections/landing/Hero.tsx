import { lazy, Suspense, useEffect, useRef, useState } from 'react'
import { ArrowDown, ArrowRight, Play } from 'lucide-react'
import { gsap, useGSAP } from '@/lib/gsap'
import { Button } from '@/components/ui/Button'
import { DecryptText } from '@/components/ui/DecryptText'
import { useI18n } from '@/i18n'
import { useUI } from '@/store/ui'
import { useSettings } from '@/store/settings'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { useScrollTo } from '@/providers/SmoothScroll'
import { cn } from '@/lib/cn'

const NetworkGlobe = lazy(() => import('@/components/fx/NetworkGlobe'))

export function Hero() {
  const { d } = useI18n()
  const root = useRef<HTMLElement>(null)
  const introDone = useUI((s) => s.introDone)
  const theme = useSettings((s) => s.theme)
  const reduced = useReducedMotionPref()
  const scrollTo = useScrollTo()
  const [ready, setReady] = useState(false)

  // Entrance — waits for the boot preloader.
  useGSAP(
    () => {
      if (!introDone) return
      setReady(true)
      if (reduced) return
      const tl = gsap.timeline({ defaults: { ease: 'expo.out' } })
      tl.fromTo('[data-hero-word]', { y: 0, yPercent: 115, rotate: 4 }, { y: 0, yPercent: 0, rotate: 0, duration: 1.4, stagger: 0.09 })
        .fromTo('[data-hero-fade]', { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.08, clearProps: 'transform' }, '-=1.05')
        .fromTo('[data-hero-hud]', { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.9, stagger: 0.07 }, '-=0.9')
        .fromTo('[data-hero-line]', { scaleX: 0 }, { scaleX: 1, duration: 1.4, ease: 'expo.inOut' }, 0.1)
    },
    { scope: root, dependencies: [introDone, reduced] },
  )

  // Scroll-out: content lifts and fades, globe pushes toward the camera.
  useGSAP(
    () => {
      if (reduced) return
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root.current, start: 'top top', end: 'bottom top', scrub: true },
      })
      tl.to('[data-hero-content]', { yPercent: -18, opacity: 0, ease: 'none' }, 0)
        .to('[data-hero-globe]', { scale: 1.35, yPercent: 12, opacity: 0.2, ease: 'none' }, 0)
        .to('[data-hero-hudwrap]', { opacity: 0, ease: 'none' }, 0)
    },
    { scope: root, dependencies: [reduced] },
  )

  const words = d.hero.words

  return (
    <section ref={root} data-ready={ready || reduced ? '' : undefined} className="hero relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-16">
      {/* CSS glow fallback (also visible while the 3D scene loads) */}
      <div aria-hidden className="absolute top-1/2 right-[-10%] h-[70vmin] w-[70vmin] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(34_211_238/0.16),rgb(168_85_247/0.06)_60%,transparent)] blur-xl max-md:right-1/2 max-md:translate-x-1/2" />

      <div data-hero-globe className="absolute inset-y-0 right-[-14%] w-[78%] max-md:inset-x-[-30%] max-md:right-auto max-md:w-auto max-md:opacity-45">
        <Suspense fallback={null}>
          <NetworkGlobe theme={theme} reduced={reduced} className="h-full w-full" />
        </Suspense>
      </div>

      <div data-hero-content className="relative z-10 mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div data-hero-fade className="hero-fade mb-6 inline-flex items-center gap-2 rounded-full border border-cyan/25 bg-cyan-soft px-3 py-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-dot" />
          <DecryptText text={d.hero.eyebrow} trigger={introDone} delay={0.4} className="font-mono text-[0.7rem] tracking-[0.14em] text-cyan uppercase" />
        </div>

        <h1 className="font-display text-[clamp(2.9rem,8.4vw,7.6rem)] leading-[0.92] font-semibold tracking-[-0.045em]">
          <span className="sr-only">{words.join(' ')}</span>
          <span aria-hidden className="block">
            {[words.slice(0, 2), words.slice(2)].map((line, li) => (
              <span key={li} className="block">
                {line.map((w, i) => {
                  const isLast = li === 1 && i === line.length - 1
                  return (
                    <span key={w} className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom last:mr-0">
                      <span data-hero-word className={cn('hero-word inline-block origin-bottom-left', isLast && 'text-gradient')}>
                        {w}
                      </span>
                    </span>
                  )
                })}
              </span>
            ))}
          </span>
        </h1>

        <div data-hero-line className="hero-fade mt-8 h-px w-full max-w-xl origin-left bg-gradient-to-r from-cyan/60 via-line-strong to-transparent" />

        <p data-hero-fade className="hero-fade mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
          {d.hero.sub}
        </p>

        <div data-hero-fade className="hero-fade mt-9 flex flex-wrap items-center gap-3">
          <Button to="/dashboard" size="lg" magnetic iconRight={<ArrowRight size={18} />}>
            {d.hero.ctaPrimary}
          </Button>
          <Button variant="secondary" size="lg" magnetic icon={<Play size={16} />} onClick={() => scrollTo('#path', { offset: -40 })}>
            {d.hero.ctaSecondary}
          </Button>
        </div>
      </div>

      <HeroHud />

      <button
        data-hero-fade
        onClick={() => scrollTo('#manifesto')}
        className="hero-fade absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-dim transition-colors hover:text-cyan sm:flex [@media(max-height:760px)]:!hidden"
      >
        <span className="hud-label">{d.hero.scroll}</span>
        <span className="relative flex h-9 w-5 justify-center rounded-full border border-line-strong">
          <span className="mt-1.5 h-1.5 w-0.5 rounded-full bg-cyan [animation:scroll-dot_1.8s_ease-in-out_infinite]" />
        </span>
        <ArrowDown size={12} className="sr-only" />
      </button>

      <style>{`
        @keyframes scroll-dot { 0% { transform: translateY(0); opacity: 1 } 70% { transform: translateY(14px); opacity: 0 } 100% { opacity: 0 } }
        .hero:not([data-ready]) .hero-word { transform: translateY(115%); }
        .hero:not([data-ready]) .hero-fade, .hero:not([data-ready]) [data-hero-hud] { opacity: 0; }
      `}</style>
    </section>
  )
}

/** Corner HUD read-outs with lightly jittering live values. */
function HeroHud() {
  const { d } = useI18n()
  const reduced = useReducedMotionPref()
  const [latency, setLatency] = useState(12)
  const [pps, setPps] = useState(48.2)

  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => {
      setLatency(9 + Math.round(Math.random() * 7))
      setPps(+(44 + Math.random() * 9).toFixed(1))
    }, 1400)
    return () => clearInterval(id)
  }, [reduced])

  const cell = 'glass hud-corners rounded-lg px-3 py-2'
  return (
    <div data-hero-hudwrap aria-hidden className="pointer-events-none absolute inset-x-0 bottom-20 z-10 hidden lg:block">
      <div className="mx-auto flex max-w-7xl justify-end gap-3 px-8">
        <div data-hero-hud className={cell}>
          <p className="hud-label">{d.hero.hud.status}</p>
          <p className="mt-0.5 flex items-center gap-1.5 font-mono text-sm text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" /> {d.hero.hud.online}
          </p>
        </div>
        <div data-hero-hud className={cell}>
          <p className="hud-label">{d.hero.hud.nodes}</p>
          <p className="mt-0.5 font-mono text-sm text-text">240</p>
        </div>
        <div data-hero-hud className={cell}>
          <p className="hud-label">{d.hero.hud.latency}</p>
          <p className="mt-0.5 font-mono text-sm text-cyan tabular-nums">{latency} ms</p>
        </div>
        <div data-hero-hud className={cell}>
          <p className="hud-label">{d.hero.hud.uplink}</p>
          <p className="mt-0.5 font-mono text-sm text-text tabular-nums">{pps} kpps</p>
        </div>
      </div>
    </div>
  )
}
