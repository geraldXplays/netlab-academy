import { useRef } from 'react'
import { ArrowRight, Check, Siren } from 'lucide-react'
import { gsap, useGSAP } from '@/lib/gsap'
import { SectionLabel } from '@/components/ui/Chip'
import { Button } from '@/components/ui/Button'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

type Line = { kind: 'cmd' | 'out' | 'warn' | 'ok'; text: string }

const SESSION: Line[] = [
  { kind: 'cmd', text: 'ping 10.20.0.1' },
  { kind: 'warn', text: 'Request timed out. (4/4 lost)' },
  { kind: 'cmd', text: 'ipconfig' },
  { kind: 'warn', text: 'IPv4 Address . . : 169.254.31.7  ← APIPA, no DHCP lease' },
  { kind: 'cmd', text: 'show interfaces trunk' },
  { kind: 'out', text: 'Gi0/24  on  802.1q  trunking  allowed: 1,10,30' },
  { kind: 'warn', text: 'VLAN 20 missing from allowed list' },
  { kind: 'cmd', text: 'switchport trunk allowed vlan add 20' },
  { kind: 'ok', text: 'DHCPACK 10.20.0.34 — 14/14 hosts reachable' },
]

const color: Record<Line['kind'], string> = {
  cmd: 'text-text',
  out: 'text-muted',
  warn: 'text-warning',
  ok: 'text-success',
}

/** Teaser for the IT Operations Simulator: terminal tilts upright on scroll and types an incident. */
export function SimulatorTeaser() {
  const { d } = useI18n()
  const root = useRef<HTMLElement>(null)
  const reduced = useReducedMotionPref()

  useGSAP(
    () => {
      if (reduced) return
      gsap.fromTo(
        '[data-term]',
        { rotateX: 24, y: 80, scale: 0.9, opacity: 0.4 },
        { rotateX: 0, y: 0, scale: 1, opacity: 1, ease: 'none', scrollTrigger: { trigger: '[data-term-wrap]', start: 'top 95%', end: 'top 35%', scrub: 0.8 } },
      )
      const tl = gsap.timeline({ scrollTrigger: { trigger: '[data-term-wrap]', start: 'top 55%', once: true } })
      tl.from('[data-alert]', { scale: 0.6, opacity: 0, duration: 0.7, ease: 'back.out(2)' })
      gsap.utils.toArray<HTMLElement>('[data-tline]').forEach((line) => {
        const typed = line.querySelector<HTMLElement>('[data-typed]')
        if (line.dataset.kind === 'cmd' && typed) {
          const n = typed.textContent?.length ?? 10
          tl.set(line, { opacity: 1 })
          tl.fromTo(typed, { width: 0 }, { width: `${n}ch`, duration: n * 0.035, ease: `steps(${n})` })
        } else {
          tl.fromTo(line, { opacity: 0, x: -6 }, { opacity: 1, x: 0, duration: 0.25, ease: 'power2.out' }, '+=0.25')
        }
      })
      tl.from('[data-resolved]', { opacity: 0, y: 10, duration: 0.5 }, '+=0.2')
      gsap.from('[data-sim-point]', { opacity: 0, x: -20, stagger: 0.12, duration: 0.8, scrollTrigger: { trigger: '[data-sim-points]', start: 'top 85%', once: true } })
    },
    { scope: root, dependencies: [reduced] },
  )

  return (
    <section ref={root} className="relative py-28 md:py-40">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2">
        <div>
          <SectionLabel>{d.sim.label}</SectionLabel>
          <h2 className="mt-6 font-display text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1] font-semibold tracking-[-0.04em]">{d.sim.title}</h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">{d.sim.body}</p>
          <ul data-sim-points className="mt-8 space-y-3">
            {d.sim.points.map((p) => (
              <li key={p} data-sim-point className="flex items-center gap-3">
                <span className="grid h-6 w-6 place-items-center rounded-full border border-cyan/30 bg-cyan-soft text-cyan">
                  <Check size={13} />
                </span>
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button to="/simulator" variant="secondary" magnetic iconRight={<ArrowRight size={16} />}>
              {d.sim.cta}
            </Button>
          </div>
        </div>

        <div data-term-wrap className="relative [perspective:1400px]">
          <div data-term className="glass-strong relative overflow-hidden rounded-2xl shadow-[var(--shadow)] [transform-origin:50%_100%]">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-danger/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-warning/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
              <span className="ml-3 font-mono text-xs text-dim">tech@netlab-ops: ~/incident-0147</span>
            </div>
            <div className="min-h-[22rem] space-y-1.5 p-5 font-mono text-[0.8rem] leading-relaxed">
              {SESSION.map((line, i) => (
                <div key={i} data-tline data-kind={line.kind} className={color[line.kind]} style={line.kind === 'cmd' && !reduced ? { opacity: 0 } : undefined}>
                  {line.kind === 'cmd' ? (
                    <>
                      <span className="text-cyan">❯ </span>
                      <span data-typed className="inline-block overflow-hidden align-bottom whitespace-nowrap">{line.text}</span>
                    </>
                  ) : (
                    <span className="block pl-4 break-words">{line.text}</span>
                  )}
                </div>
              ))}
              <div data-resolved className="flex items-center gap-2 pt-3 text-cyan">
                <span>❯</span>
                <span className="inline-block h-4 w-2 bg-cyan animate-blink" />
              </div>
            </div>
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_50%,rgb(0_0_0/0.06)_50%)] bg-[length:100%_4px] opacity-40" />
          </div>

          <div data-alert className="glass-strong absolute -top-6 -right-2 flex items-center gap-3 rounded-xl border-danger/40 px-4 py-3 shadow-[0_10px_40px_-10px_rgb(244_63_94/0.5)] sm:-right-6">
            <span className="relative grid h-9 w-9 place-items-center rounded-lg bg-danger/15 text-danger">
              <span className="absolute inset-0 animate-ping rounded-lg bg-danger/20" />
              <Siren size={18} />
            </span>
            <div>
              <p className="font-mono text-[0.65rem] tracking-widest text-danger uppercase">P1 · Incident</p>
              <p className="text-sm font-medium">VLAN 20 — 14 hosts down</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
