import { Bot, FlaskConical, LibraryBig, MonitorCog, Trophy, Waypoints, type LucideIcon } from 'lucide-react'
import { SectionLabel } from '@/components/ui/Chip'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

const META: { icon: LucideIcon; glow: 'cyan' | 'purple' | 'blue'; span: string; tag: string }[] = [
  { icon: FlaskConical, glow: 'cyan', span: 'md:col-span-2', tag: 'LAB-01 → LAB-06' },
  { icon: MonitorCog, glow: 'purple', span: '', tag: '15+ incidents' },
  { icon: Bot, glow: 'blue', span: '', tag: 'mentor mode' },
  { icon: Waypoints, glow: 'cyan', span: 'md:col-span-2', tag: 'L2 · L3 · VLAN' },
  { icon: LibraryBig, glow: 'purple', span: 'md:col-span-2', tag: 'EN ⇄ FR' },
  { icon: Trophy, glow: 'blue', span: '', tag: 'XP · badges' },
]

export function FeaturesSection() {
  const { d } = useI18n()
  return (
    <section className="relative mx-auto max-w-7xl px-5 py-24 sm:px-8 md:py-32">
      <SectionLabel>{d.features.label}</SectionLabel>
      <h2 className="mt-6 max-w-3xl font-display text-[clamp(2.2rem,4.6vw,3.8rem)] leading-[1] font-semibold tracking-[-0.04em]">{d.features.title}</h2>
      <Reveal className="mt-14 grid gap-4 md:grid-cols-3" stagger={0.07}>
        {d.features.items.map((item, i) => {
          const { icon: Icon, glow, span, tag } = META[i]
          return (
            <RevealItem key={item.t} className={cn(span)}>
              <SpotlightCard glow={glow} className="h-full rounded-3xl">
                <div className="flex h-full min-h-[13rem] flex-col p-7">
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border border-line-strong bg-bg-2 text-cyan transition-transform duration-500 group-hover/card:-translate-y-1 group-hover/card:rotate-[-6deg]">
                      <Icon size={22} strokeWidth={1.6} />
                    </span>
                    <span className="font-mono text-[0.65rem] tracking-widest text-dim uppercase">{tag}</span>
                  </div>
                  <h3 className="mt-auto pt-8 font-display text-xl font-semibold tracking-tight">{item.t}</h3>
                  <p className="mt-2 max-w-md text-muted">{item.d}</p>
                </div>
              </SpotlightCard>
            </RevealItem>
          )
        })}
      </Reveal>
    </section>
  )
}
