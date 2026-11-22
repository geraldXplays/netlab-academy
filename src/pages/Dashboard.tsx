import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import { ArrowRight, Compass, Flame, Gauge, Pencil, RotateCcw, Sparkles, Radar as RadarIcon, Route } from 'lucide-react'
import { useProgress, liveStreak, nextLesson, levelProgress } from '@/store/progress'
import { LEVELS, ALL_LESSON_IDS } from '@/content/curriculum'
import { LESSONS, locateLesson } from '@/content/lessons'
import { levelFromXp, rankForLevel } from '@/lib/xp'
import { lastDays } from '@/lib/dates'
import { useI18n } from '@/i18n'
import { Reveal } from '@/components/ui/Reveal'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { DecryptText } from '@/components/ui/DecryptText'
import { DashCard } from '@/components/dashboard/DashCard'
import { PathTrack } from '@/components/dashboard/PathTrack'
import { Missions } from '@/components/dashboard/Missions'
import { Achievements } from '@/components/dashboard/Achievements'
import { Assessments } from '@/components/dashboard/Assessments'
import { SkillRadar } from '@/components/dashboard/SkillRadar'
import { ActivityBars } from '@/components/dashboard/ActivityBars'
import { cn } from '@/lib/cn'

export default function Dashboard() {
  const { d } = useI18n()
  const state = useProgress()
  const isEmpty = state.xp === 0 && Object.keys(state.completedLessons).length === 0

  useEffect(() => {
    document.title = `${d.nav.dashboard} · NetLab Academy`
  }, [d])

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-20 sm:px-8 sm:pt-32">
      <Header />
      {isEmpty && <EmptyBanner />}
      {state.isDemo && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-warning/25 bg-warning/5 px-4 py-2.5 text-sm text-warning">
          <span className="flex items-center gap-2"><Sparkles size={15} /> {d.dash.demoBanner}</span>
          <ResetButton />
        </div>
      )}

      <Reveal className="grid grid-cols-1 gap-4 md:grid-cols-6 lg:grid-cols-12" stagger={0.06}>
        <LevelTile className="md:col-span-3 lg:col-span-4" />
        <NextLessonTile className="md:col-span-3 lg:col-span-5" />
        <StreakTile className="md:col-span-6 lg:col-span-3" />

        <DashCard title={d.dash.path} icon={<Route size={14} />} className="md:col-span-6 lg:col-span-12">
          <PathTrack />
        </DashCard>

        <Missions className="md:col-span-3 lg:col-span-4" />
        <DashCard title={d.dash.skills} icon={<RadarIcon size={14} />} className="md:col-span-3 lg:col-span-4" glow="purple">
          <SkillRadar values={state.skills} />
          <p className="mt-2 text-center text-xs text-dim">{d.dash.skillsHint}</p>
        </DashCard>
        <ProgressTile className="md:col-span-6 lg:col-span-4" />

        <Achievements className="md:col-span-6 lg:col-span-7" />
        <Assessments className="md:col-span-6 lg:col-span-5" />
      </Reveal>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Header() {
  const { d, lang } = useI18n()
  const callsign = useProgress((s) => s.callsign)
  const setCallsign = useProgress((s) => s.setCallsign)
  const xp = useProgress((s) => s.xp)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(callsign)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const name = callsign || d.dash.operator
  const save = () => {
    setCallsign(draft.trim())
    setEditing(false)
  }

  return (
    <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="hud-label flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
          {d.dash.subtitle}
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,5vw,3.4rem)] leading-[1.02] font-semibold tracking-[-0.04em]">
          {xp > 0 ? d.dash.hello : d.dash.helloNew},{' '}
          {editing ? (
            <form
              className="inline-flex items-center gap-2 align-middle"
              onSubmit={(e) => {
                e.preventDefault()
                save()
              }}
            >
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={save}
                maxLength={24}
                placeholder={d.dash.callsignPlaceholder}
                aria-label={d.dash.callsignPrompt}
                className="w-[9ch] min-w-0 border-b-2 border-cyan bg-transparent text-cyan outline-none sm:w-[12ch]"
              />
            </form>
          ) : (
            <button
              onClick={() => {
                setDraft(callsign)
                setEditing(true)
              }}
              className="group inline-flex items-center gap-2 text-gradient-cyan"
              title={d.dash.callsignPrompt}
            >
              <DecryptText key={name} text={name} speed={45} />
              <Pencil size={18} className="text-dim opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
            </button>
          )}
        </h1>
      </div>
      <div className="glass hud-corners flex items-center gap-5 self-start rounded-2xl px-5 py-3 md:self-auto">
        <div>
          <p className="hud-label">{d.dash.clock}</p>
          <p className="font-mono text-xl tabular-nums">{now.toLocaleTimeString(lang, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
        </div>
        <div className="h-10 w-px bg-line-strong" />
        <p className="max-w-[9rem] font-mono text-xs leading-snug text-muted capitalize">
          {now.toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' })}
        </p>
      </div>
    </header>
  )
}

function EmptyBanner() {
  const { d } = useI18n()
  const loadDemo = useProgress((s) => s.loadDemo)
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="glass glow-border mb-5 flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-cyan-soft text-cyan"><Compass size={20} /></span>
        <div>
          <p className="font-display text-lg font-semibold">{d.dash.emptyTitle}</p>
          <p className="max-w-xl text-sm text-muted">{d.dash.emptyBody}</p>
        </div>
      </div>
      <Button variant="secondary" size="sm" onClick={loadDemo} icon={<Sparkles size={15} />}>
        {d.dash.loadDemo}
      </Button>
    </motion.div>
  )
}

function ResetButton() {
  const { d } = useI18n()
  const reset = useProgress((s) => s.reset)
  return (
    <button
      onClick={() => window.confirm(d.dash.resetConfirm) && reset()}
      className="flex items-center gap-1.5 rounded-full px-2 py-1 font-mono text-xs uppercase hover:bg-warning/10"
    >
      <RotateCcw size={13} /> {d.dash.reset}
    </button>
  )
}

function LevelTile({ className }: { className?: string }) {
  const { d, f } = useI18n()
  const xp = useProgress((s) => s.xp)
  const lv = levelFromXp(xp)
  return (
    <DashCard title={d.dash.level} icon={<Gauge size={14} />} className={className} action={<Chip tone="cyan" dot>{d.ranks[rankForLevel(lv.level)]}</Chip>}>
      <div className="flex flex-1 items-center gap-6">
        <ProgressRing value={lv.progress} size={138} stroke={9}>
          <div>
            <p className="hud-label !text-[0.6rem]">LVL</p>
            <p className="font-display text-5xl leading-none font-semibold tracking-tight">
              <AnimatedCounter value={lv.level} duration={1} />
            </p>
          </div>
        </ProgressRing>
        <div className="min-w-0">
          <p className="hud-label">{d.dash.totalXp}</p>
          <p className="font-display text-3xl font-semibold text-gradient-cyan">
            <AnimatedCounter value={xp} />
          </p>
          <p className="mt-2 text-sm text-muted">{f(d.dash.toNext, { n: lv.toNext, l: lv.level + 1 })}</p>
          <ProgressBar value={lv.progress} className="mt-3" />
          <p className="mt-1.5 font-mono text-[0.65rem] text-dim">{lv.intoLevel} / {lv.needed} XP</p>
        </div>
      </div>
    </DashCard>
  )
}

function NextLessonTile({ className }: { className?: string }) {
  const { d, f, l } = useI18n()
  const state = useProgress()
  const resumeId = state.lastLesson && LESSONS[state.lastLesson] && !state.completedLessons[state.lastLesson] ? state.lastLesson : null
  const next = (resumeId && locateLesson(resumeId)) ? { ...locateLesson(resumeId)!, id: resumeId } : nextLesson(state)
  if (!next) {
    return (
      <DashCard title={d.dash.next} className={className}>
        <p className="text-muted">{d.dash.allDone}</p>
      </DashCard>
    )
  }
  const lp = levelProgress(state, next.level.id)
  return (
    <DashCard title={d.dash.next} icon={<Compass size={14} />} className={className} glow="blue" bodyClass="relative overflow-hidden">
      <div aria-hidden className="absolute -right-16 -bottom-16 h-56 w-56 rounded-full border border-cyan/10" />
      <div aria-hidden className="absolute -right-6 -bottom-6 h-32 w-32 rounded-full border border-dashed border-cyan/20 animate-spin-slow" />
      <p className="font-mono text-xs text-cyan">
        L{next.level.number} · {l(next.level.title)}
      </p>
      <h3 className="mt-2 font-display text-2xl font-semibold tracking-tight sm:text-[1.7rem]">{LESSONS[next.id] ? l(LESSONS[next.id].title) : l(next.module.title)}</h3>
      <p className="mt-1 text-muted">
        {l(next.module.title)} · {f(d.dash.nextLesson, { n: next.index })} / {next.module.lessonCount}
      </p>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-6">
        <div className="w-full max-w-[14rem]">
          <p className="mb-1.5 font-mono text-[0.65rem] text-dim">{f(d.dash.lessonsDone, { d: lp.done, t: lp.total })}</p>
          <ProgressBar value={lp.ratio} tone="purple" />
        </div>
        <Button to={LESSONS[next.id] ? `/learn/${next.id}` : '/academy'} size="sm" iconRight={<ArrowRight size={15} />}>
          {d.dash.continue}
        </Button>
      </div>
    </DashCard>
  )
}

function StreakTile({ className }: { className?: string }) {
  const { d, lang } = useI18n()
  const state = useProgress()
  const streak = liveStreak(state)
  const week = lastDays(7)
  return (
    <DashCard title={d.dash.streak} icon={<Flame size={14} />} className={className} glow="purple">
      <div className="flex items-end gap-3">
        <motion.span
          className={cn('grid h-14 w-14 place-items-center rounded-2xl', streak ? 'bg-gradient-to-br from-warning/30 to-danger/20 text-warning' : 'bg-bg-2 text-dim')}
          animate={streak ? { scale: [1, 1.06, 1] } : undefined}
          transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
        >
          <Flame size={26} />
        </motion.span>
        <div>
          <p className="font-display text-4xl leading-none font-semibold">
            <AnimatedCounter value={streak} duration={1} />
            <span className="ml-1.5 text-base font-normal text-muted">{d.dash.days}</span>
          </p>
          <p className="mt-1 font-mono text-[0.68rem] text-dim">{d.dash.best}: {state.streak.best}</p>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1.5">
        {week.map((k, i) => {
          const active = Object.values(state.activity[k] ?? {}).some((v) => (v ?? 0) > 0)
          const [y, m, dd] = k.split('-').map(Number)
          return (
            <div key={k} className="flex flex-col items-center gap-1">
              <motion.span
                className={cn('h-7 w-full rounded-md border', active ? 'border-warning/40 bg-warning/25' : 'border-line bg-bg-2/50')}
                initial={{ scaleY: 0 }}
                whileInView={{ scaleY: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.05, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className="font-mono text-[0.55rem] text-dim">{new Date(y, m - 1, dd).toLocaleDateString(lang, { weekday: 'narrow' })}</span>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-xs text-dim">{d.dash.streakHint}</p>
    </DashCard>
  )
}

function ProgressTile({ className }: { className?: string }) {
  const { d, f, l } = useI18n()
  const state = useProgress()
  const done = Object.keys(state.completedLessons).length
  const total = ALL_LESSON_IDS.length
  return (
    <DashCard title={d.dash.progress} icon={<Gauge size={14} />} className={className}>
      <div className="flex items-baseline justify-between">
        <p className="font-display text-4xl font-semibold">
          <AnimatedCounter value={Math.round((done / total) * 100)} />
          <span className="text-xl text-muted">%</span>
        </p>
        <p className="font-mono text-xs text-dim">{f(d.dash.lessonsDone, { d: done, t: total })}</p>
      </div>
      <ul className="mt-4 space-y-2.5">
        {LEVELS.map((lvl, i) => {
          const p = levelProgress(state, lvl.id)
          return (
            <li key={lvl.id} className="grid grid-cols-[1.5rem_1fr_2.5rem] items-center gap-2 text-xs">
              <span className="font-mono text-dim">0{lvl.number}</span>
              <div className="min-w-0">
                <p className="mb-1 truncate text-muted">{l(lvl.title)}</p>
                <ProgressBar value={p.ratio} delay={0.1 + i * 0.06} tone={i % 2 ? 'purple' : 'cyan'} />
              </div>
              <span className="text-right font-mono text-dim">{Math.round(p.ratio * 100)}%</span>
            </li>
          )
        })}
      </ul>
      <div className="mt-6 border-t border-line pt-5">
        <ActivityBars />
      </div>
    </DashCard>
  )
}
