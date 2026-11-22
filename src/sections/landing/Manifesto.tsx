import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { SectionLabel } from '@/components/ui/Chip'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

/** Parse "plain *highlight* plain" into words flagged for emphasis. */
function toWords(text: string) {
  const out: { w: string; hl: boolean }[] = []
  text.split('*').forEach((chunk, i) => {
    chunk.split(/\s+/).filter(Boolean).forEach((w) => out.push({ w, hl: i % 2 === 1 }))
  })
  return out
}

/** Apple-style statement: words illuminate one by one as you scroll through. */
export function Manifesto() {
  const { d } = useI18n()
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotionPref()
  const words = toWords(d.manifesto.text)

  useGSAP(
    () => {
      if (reduced) return
      gsap.fromTo(
        '[data-mw]',
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: 'none',
          stagger: 0.1,
          scrollTrigger: { trigger: '[data-mtext]', start: 'top 78%', end: 'bottom 42%', scrub: 0.6 },
        },
      )
      gsap.fromTo('[data-mhl]', { backgroundSize: '0% 2px' }, {
        backgroundSize: '100% 2px',
        ease: 'none',
        scrollTrigger: { trigger: '[data-mtext]', start: 'top 55%', end: 'bottom 45%', scrub: 0.6 },
      })
    },
    { scope: root, dependencies: [reduced, d.manifesto.text] },
  )

  return (
    <section ref={root} id="manifesto" className="relative mx-auto max-w-6xl px-5 py-32 sm:px-8 md:py-48">
      <SectionLabel>{d.manifesto.label}</SectionLabel>
      <p data-mtext className="mt-10 font-display text-[clamp(1.75rem,4.2vw,3.6rem)] leading-[1.12] font-medium tracking-[-0.03em]">
        {words.map(({ w, hl }, i) => (
          <span
            key={`${i}-${w}`}
            data-mw
            data-mhl={hl ? '' : undefined}
            className={hl ? 'text-cyan bg-gradient-to-r from-cyan to-purple bg-[length:100%_2px] bg-bottom bg-no-repeat' : undefined}
          >
            {w}{' '}
          </span>
        ))}
      </p>
    </section>
  )
}
