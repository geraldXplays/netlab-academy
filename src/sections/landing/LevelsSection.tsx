import { useRef } from 'react'
import { ArrowRight, Layers, BookOpen } from 'lucide-react'
import { gsap, useGSAP } from '@/lib/gsap'
import { SectionLabel } from '@/components/ui/Chip'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { LEVELS, type Level } from '@/content/curriculum'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

const accentText = { cyan: 'text-cyan', blue: 'text-blue', purple: 'text-purple' }
const accentGlow = { cyan: 'cyan', blue: 'blue', purple: 'purple' } as const

/**
 * Horizontal scroll story on desktop: the section pins while the six level
 * cards travel sideways; each card's numeral counter-parallaxes.
 * Mobile / reduced motion: a regular vertical list.
 */
export function LevelsSection() {
  const { d } = useI18n()
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotionPref()

  useGSAP(
    () => {
      if (reduced) return
      const mm = gsap.matchMedia()
      mm.add('(min-width: 1024px)', () => {
        const el = track.current!
        const distance = () => el.scrollWidth - window.innerWidth
        const tween = gsap.to(el, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
          },
        })
        gsap.to('[data-levels-bar]', {
          scaleX: 1,
          ease: 'none',
          scrollTrigger: { trigger: root.current, start: 'top top', end: () => `+=${distance()}`, scrub: true },
        })
        gsap.utils.toArray<HTMLElement>('[data-level-num]').forEach((num) => {
          gsap.fromTo(num, { xPercent: 40 }, {
            xPercent: -40,
            ease: 'none',
            scrollTrigger: { trigger: num.closest('[data-level-card]'), containerAnimation: tween, start: 'left right', end: 'right left', scrub: true },
          })
        })
        gsap.utils.toArray<HTMLElement>('[data-level-card]').forEach((card) => {
          gsap.fromTo(card, { opacity: 0.35, scale: 0.92 }, {
            opacity: 1,
            scale: 1,
            ease: 'power1.out',
            scrollTrigger: { trigger: card, containerAnimation: tween, start: 'left 95%', end: 'left 55%', scrub: true },
          })
        })
      })
      mm.add('(max-width: 1023px)', () => {
        gsap.utils.toArray<HTMLElement>('[data-level-card]').forEach((card) => {
          gsap.from(card, { opacity: 0, y: 50, duration: 1, scrollTrigger: { trigger: card, start: 'top 88%', once: true } })
        })
      })
      return () => mm.revert()
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <section ref={root} id="path" className={cn('relative overflow-hidden py-24', !reduced && 'lg:flex lg:h-[100svh] lg:items-center lg:py-0')}>
      <div ref={track} className={cn(
          'flex flex-col gap-6 px-5 sm:px-8',
          reduced
            ? 'mx-auto max-w-7xl md:grid md:grid-cols-2 lg:grid-cols-3'
            : 'lg:w-max lg:flex-row lg:items-stretch lg:gap-8 lg:pr-[12vw] lg:pl-[max(2rem,calc((100vw-80rem)/2+2rem))]',
        )}>
        <div className={cn('flex shrink-0 flex-col justify-center', reduced ? 'md:col-span-2 lg:col-span-3 mb-4' : 'lg:w-[30rem]')}>
          <SectionLabel>{d.levels.label}</SectionLabel>
          <h2 className="mt-6 font-display text-[clamp(2.2rem,5vw,4.2rem)] leading-[0.98] font-semibold tracking-[-0.04em]">
            {d.levels.title}
          </h2>
          <p className="mt-5 max-w-md text-lg text-muted">{d.levels.sub}</p>
          <div className="mt-10 hidden items-center gap-4 lg:flex">
            <div className="h-px w-48 overflow-hidden bg-line-strong">
              <div data-levels-bar className="h-full origin-left scale-x-0 bg-gradient-to-r from-cyan to-purple" />
            </div>
            <ArrowRight size={16} className="text-cyan" />
          </div>
        </div>
        {LEVELS.map((lvl) => (
          <LevelCard key={lvl.id} level={lvl} wide={!reduced} />
        ))}
      </div>
    </section>
  )
}

function LevelCard({ level, wide }: { level: Level; wide: boolean }) {
  const { d, l } = useI18n()
  const lessons = level.modules.reduce((n, m) => n + m.lessonCount, 0)
  return (
    <div data-level-card className={cn('shrink-0', wide && 'lg:w-[26rem]')}>
      <SpotlightCard tilt glow={accentGlow[level.accent]} className="h-full min-h-[30rem] rounded-3xl">
        <div className="flex h-full flex-col p-7">
          <div className="relative h-28 overflow-hidden">
            <span
              data-level-num
              className={cn('absolute -top-4 left-0 font-display text-[9rem] leading-none font-bold tracking-tighter opacity-90', accentText[level.accent])}
              style={{ WebkitTextStroke: `1.5px var(--${level.accent})`, color: 'transparent' }}
            >
              0{level.number}
            </span>
          </div>
          <p className="hud-label">
            {d.levels.level} {level.number} · {l(level.role)}
          </p>
          <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight">{l(level.title)}</h3>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-muted">{l(level.summary)}</p>
          <ul className="mt-5 space-y-1.5 text-sm text-muted">
            {level.modules.slice(0, 4).map((m) => (
              <li key={m.id} className="flex items-center gap-2">
                <span className={cn('h-1 w-1 rounded-full bg-current', accentText[level.accent])} />
                {l(m.title)}
              </li>
            ))}
            {level.modules.length > 4 && <li className="pl-3 text-dim">+{level.modules.length - 4}</li>}
          </ul>
          <div className="mt-auto flex items-center gap-5 border-t border-line pt-5 font-mono text-xs text-dim">
            <span className="flex items-center gap-1.5"><Layers size={14} /> {level.modules.length} {d.levels.modules}</span>
            <span className="flex items-center gap-1.5"><BookOpen size={14} /> {lessons} {d.levels.lessons}</span>
          </div>
        </div>
      </SpotlightCard>
    </div>
  )
}
