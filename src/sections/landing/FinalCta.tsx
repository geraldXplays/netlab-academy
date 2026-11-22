import { useRef } from 'react'
import { ArrowRight } from 'lucide-react'
import { gsap, useGSAP } from '@/lib/gsap'
import { Button } from '@/components/ui/Button'
import { ParticleField } from '@/components/fx/ParticleField'
import { LogoMark } from '@/components/ui/Logo'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

export function FinalCta() {
  const { d } = useI18n()
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotionPref()

  useGSAP(
    () => {
      if (reduced) return
      gsap.fromTo('[data-cta-panel]', { clipPath: 'inset(18% 12% 18% 12% round 48px)' }, {
        clipPath: 'inset(0% 0% 0% 0% round 32px)',
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top 90%', end: 'top 30%', scrub: 0.6 },
      })
      gsap.from('[data-cta-item]', { y: 40, opacity: 0, stagger: 0.1, duration: 1, scrollTrigger: { trigger: '[data-cta-panel]', start: 'top 60%', once: true } })
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <section ref={root} className="px-3 pb-24 sm:px-5">
      <div data-cta-panel className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] border border-line bg-bg-2">
        <ParticleField />
        <div aria-hidden className="absolute top-1/2 left-1/2 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan/10" />
        <div aria-hidden className="absolute top-1/2 left-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 animate-spin-slow rounded-full border border-dashed border-purple/20" />
        <div aria-hidden className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--cyan-rgb)/0.2),transparent)] blur-xl" />
        <div className="relative flex flex-col items-center px-6 py-28 text-center md:py-36">
          <div data-cta-item>
            <LogoMark className="h-14 w-14 drop-shadow-[0_0_20px_rgb(var(--cyan-rgb)/0.5)]" />
          </div>
          <h2 data-cta-item className="mt-8 max-w-3xl font-display text-[clamp(2.4rem,6vw,5rem)] leading-[0.98] font-semibold tracking-[-0.045em]">
            <span className="text-gradient">{d.cta.title}</span>
          </h2>
          <p data-cta-item className="mt-6 max-w-xl text-lg text-muted">{d.cta.sub}</p>
          <div data-cta-item className="mt-10">
            <Button to="/dashboard" size="lg" magnetic iconRight={<ArrowRight size={18} />}>
              {d.cta.button}
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
