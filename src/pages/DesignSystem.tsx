import { useEffect } from 'react'
import { ArrowRight, Zap } from 'lucide-react'
import { useI18n } from '@/i18n'
import { Button } from '@/components/ui/Button'
import { Chip, SectionLabel } from '@/components/ui/Chip'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Segmented } from '@/components/ui/Segmented'
import { AchievementBadge } from '@/components/ui/AchievementBadge'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { ACHIEVEMENTS } from '@/content/achievements'
import { useNotifications } from '@/store/notifications'
import { useState } from 'react'

const TOKENS = ['bg', 'bg-2', 'bg-3', 'surface', 'line-strong', 'text', 'text-muted', 'text-dim', 'cyan', 'blue', 'purple', 'success', 'warning', 'danger']

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <RevealItem>
      <section className="border-t border-line py-10">
        <SectionLabel className="mb-6">{title}</SectionLabel>
        {children}
      </section>
    </RevealItem>
  )
}

/** Living style guide: every token and core component in one place. */
export default function DesignSystem() {
  const { d } = useI18n()
  const push = useNotifications((s) => s.push)
  const [seg, setSeg] = useState<'a' | 'b' | 'c'>('a')
  useEffect(() => {
    document.title = `${d.ds.title} · NetLab Academy`
  }, [d])

  return (
    <div className="mx-auto max-w-6xl px-5 pt-32 pb-24 sm:px-8">
      <h1 className="font-display text-5xl font-semibold tracking-[-0.04em]">{d.ds.title}</h1>
      <p className="mt-3 max-w-xl text-lg text-muted">{d.ds.sub}</p>
      <Reveal className="mt-10">
        <Block title={d.ds.colors}>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
            {TOKENS.map((t) => (
              <div key={t} className="overflow-hidden rounded-xl border border-line">
                <div className="h-16" style={{ background: `var(--${t})` }} />
                <p className="px-2 py-1.5 font-mono text-[0.65rem] text-muted">--{t}</p>
              </div>
            ))}
          </div>
        </Block>
        <Block title={d.ds.type}>
          <div className="space-y-4">
            <p className="font-display text-6xl font-semibold tracking-[-0.045em]">Display · Space Grotesk</p>
            <p className="font-display text-3xl font-medium tracking-tight">Heading — Configure the trunk</p>
            <p className="max-w-2xl text-lg text-muted">Body · Inter. A VLAN separates broadcast domains on the same physical switch, so departments share hardware without sharing traffic.</p>
            <p className="font-mono text-sm text-cyan">Mono · JetBrains Mono — switchport mode trunk</p>
            <p className="hud-label">HUD label · 0.69rem · tracking 0.16em</p>
            <p className="font-display text-4xl font-semibold"><span className="text-gradient">Gradient emphasis</span></p>
          </div>
        </Block>
        <Block title={d.ds.buttons}>
          <div className="flex flex-wrap items-center gap-3">
            <Button magnetic iconRight={<ArrowRight size={16} />}>Primary</Button>
            <Button variant="secondary" magnetic>Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button size="sm">Small</Button>
            <Button size="lg">Large</Button>
            <Button disabled>Disabled</Button>
            <Segmented label="demo" value={seg} onChange={setSeg} size="md" options={[{ value: 'a', label: 'L2' }, { value: 'b', label: 'L3' }, { value: 'c', label: 'L4' }]} />
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Chip tone="cyan" dot>Online</Chip>
            <Chip tone="purple">Exam</Chip>
            <Chip tone="success">Passed</Chip>
            <Chip tone="warning">Pending</Chip>
            <Chip tone="danger">P1</Chip>
            <Chip>Neutral</Chip>
          </div>
        </Block>
        <Block title={d.ds.cards}>
          <div className="grid gap-4 md:grid-cols-3">
            <SpotlightCard className="p-6"><p className="font-medium">Spotlight card</p><p className="text-sm text-muted">Pointer-following glow and border.</p></SpotlightCard>
            <SpotlightCard tilt glow="purple" className="p-6"><p className="font-medium">Tilt card</p><p className="text-sm text-muted">Adds subtle 3D perspective.</p></SpotlightCard>
            <div className="glass-strong hud-corners rounded-2xl p-6"><p className="font-medium">HUD panel</p><p className="text-sm text-muted">Strong glass with corner brackets.</p></div>
          </div>
        </Block>
        <Block title={d.ds.feedback}>
          <div className="flex flex-wrap items-center gap-8">
            <ProgressRing value={0.68} size={120}><span className="font-display text-2xl font-semibold">68%</span></ProgressRing>
            <div className="w-64 space-y-3">
              <ProgressBar value={0.3} />
              <ProgressBar value={0.6} tone="purple" />
              <ProgressBar value={0.9} tone="success" />
            </div>
            <div className="flex gap-2">
              {ACHIEVEMENTS.slice(0, 4).map((a, i) => <AchievementBadge key={a.id} a={a} unlocked={i < 3} size={56} />)}
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" size="sm" icon={<Zap size={14} />} onClick={() => push({ type: 'xp', amount: 40, reason: { en: 'Design system demo', fr: 'Démo design system' } })}>{d.ds.tryToast}</Button>
              <Button variant="secondary" size="sm" onClick={() => push({ type: 'achievement', achievementId: 'vlan-specialist' })}>{d.ds.tryAchievement}</Button>
            </div>
          </div>
        </Block>
      </Reveal>
    </div>
  )
}
