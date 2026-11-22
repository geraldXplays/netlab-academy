import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { gsap, useGSAP } from '@/lib/gsap'
import { SectionLabel } from '@/components/ui/Chip'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'
import { TopologyDiagram } from './TopologyDiagram'

/**
 * Pinned scroll story (desktop): the network assembles in four stages
 * while the matching explanation highlights. On small screens and under
 * reduced motion the diagram simply builds once when it enters view.
 */
export function TopologySection() {
  const { d } = useI18n()
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotionPref()
  const [active, setActive] = useState(0)
  const [pinned, setPinned] = useState(false)

  useGSAP(
    () => {
      if (reduced) return
      const mm = gsap.matchMedia()

      const build = (tl: gsap.core.Timeline) => {
        for (let s = 0; s < 4; s++) {
          tl.addLabel(`s${s}`)
          tl.fromTo(`[data-dev][data-step="${s}"]`, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.06, ease: 'back.out(2)' }, `s${s}`)
          tl.to(`[data-link][data-step="${s}"]`, { strokeDashoffset: 0, duration: 0.6, stagger: 0.05, ease: 'power2.inOut' }, `s${s}+=0.1`)
          if (s === 2) tl.fromTo('[data-zone]', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 's2+=0.3')
          tl.to({}, { duration: 0.35 }) // breathing room between stages
        }
        tl.to('[data-traffic]', { opacity: 0.8, duration: 0.5 }, '-=0.2')
        tl.to('[data-packets]', { opacity: 1, duration: 0.4 }, '<')
        return tl
      }

      mm.add('(min-width: 1024px)', () => {
        setPinned(true)
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=280%',
            pin: true,
            scrub: 0.8,
            onUpdate: (self) => setActive(Math.min(3, Math.floor(self.progress * 4.2))),
          },
        })
        build(tl)
        return () => setPinned(false)
      })

      mm.add('(max-width: 1023px)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-topo]', start: 'top 70%', once: true } })
        build(tl)
        tl.timeScale(1.6)
      })

      return () => mm.revert()
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <section ref={root} className="relative flex min-h-[100svh] items-center overflow-hidden py-24">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 px-5 sm:px-8 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <SectionLabel>{d.topology.label}</SectionLabel>
          <h2 className="mt-6 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1] font-semibold tracking-[-0.04em]">
            {d.topology.title}
          </h2>
          <ol className="mt-10 space-y-2">
            {d.topology.steps.map((s, i) => {
              const on = !pinned || reduced || i === active
              return (
                <li key={s.k} className={cn('relative border-l pl-5 transition-colors duration-500', on ? 'border-cyan' : 'border-line')}>
                  {pinned && i === active && (
                    <motion.span layoutId="topo-marker" className="absolute top-0 -left-[1.5px] h-full w-[3px] rounded-full bg-cyan shadow-[0_0_12px_var(--cyan)]" />
                  )}
                  <p className={cn('flex items-center gap-3 py-2 font-display text-lg transition-colors duration-500', on ? 'text-text' : 'text-dim')}>
                    <span className="font-mono text-xs text-cyan">0{i + 1}</span>
                    {s.k}
                  </p>
                  <AnimatePresence initial={false}>
                    {on && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden pb-3 text-muted"
                      >
                        {s.t}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </li>
              )
            })}
          </ol>
        </div>

        <div data-topo className="glass hud-corners relative aspect-[600/560] w-full rounded-3xl p-4 sm:p-8">
          <div className="absolute top-4 left-5 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            <span className="hud-label">topology://hq-office</span>
          </div>
          <TopologyDiagram animated={!reduced} />
        </div>
      </div>
    </section>
  )
}
