import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'motion/react'
import { ArrowRight, Binary, CheckCircle2, Clock, FileBadge, Lock, Network, RefreshCcw, Target, Terminal, type LucideIcon } from 'lucide-react'
import { ASSESSMENTS, type Assessment } from '@/content/assessments'
import { ACHIEVEMENTS } from '@/content/achievements'
import { LEVELS } from '@/content/curriculum'
import { useProgress } from '@/store/progress'
import { useI18n } from '@/i18n'
import { Reveal, RevealItem } from '@/components/ui/Reveal'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Chip, SectionLabel } from '@/components/ui/Chip'
import { AchievementBadge } from '@/components/ui/AchievementBadge'
import { cn } from '@/lib/cn'

const PRACTICE: { mode: 'addressing' | 'subnetting' | 'commands' | 'review'; icon: LucideIcon; glow: 'cyan' | 'purple' | 'blue' }[] = [
  { mode: 'addressing', icon: Binary, glow: 'cyan' },
  { mode: 'subnetting', icon: Network, glow: 'purple' },
  { mode: 'commands', icon: Terminal, glow: 'blue' },
  { mode: 'review', icon: RefreshCcw, glow: 'cyan' },
]

export default function AssessmentsPage() {
  const { d, f, l, lang } = useI18n()
  const state = useProgress()

  useEffect(() => {
    document.title = `${d.exam.center} · NetLab Academy`
  }, [d])

  const levels = LEVELS.filter((lv) => ASSESSMENTS.some((a) => a.levelId === lv.id))

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <SectionLabel>{d.nav.assessments}</SectionLabel>
      <h1 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1] font-semibold tracking-[-0.04em]">{d.exam.center}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{d.exam.centerSub}</p>

      {levels.map((lv) => (
        <section key={lv.id} className="mt-14">
          <p className="hud-label mb-4">{f(d.exam.levelAssessments, { n: lv.number, title: l(lv.title) })}</p>
          <Reveal className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" stagger={0.05}>
            {ASSESSMENTS.filter((a) => a.levelId === lv.id).map((a) => (
              <RevealItem key={a.id}><AssessmentCard a={a} /></RevealItem>
            ))}
          </Reveal>
        </section>
      ))}

      <section className="mt-16">
        <p className="hud-label mb-2">{d.exam.practice}</p>
        <p className="mb-5 max-w-2xl text-muted">{d.exam.practiceSub}</p>
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.05}>
          {PRACTICE.map(({ mode, icon: Icon, glow }) => (
            <RevealItem key={mode}>
              <Link to={`/practice/${mode}`} className="block h-full rounded-3xl">
                <SpotlightCard glow={glow} tilt className="h-full rounded-3xl">
                  <div className="flex h-full flex-col p-6">
                    <span className="grid h-11 w-11 place-items-center rounded-2xl border border-line-strong bg-bg-2 text-cyan transition-transform duration-500 group-hover/card:-rotate-6"><Icon size={20} /></span>
                    <h3 className="mt-5 font-display text-lg font-semibold">{d.exam.modes[mode].t}</h3>
                    <p className="mt-1 text-sm text-muted">{d.exam.modes[mode].d}</p>
                    <span className="mt-auto flex items-center gap-1.5 pt-5 font-mono text-xs tracking-wider text-cyan uppercase">{d.exam.start} <ArrowRight size={13} /></span>
                  </div>
                </SpotlightCard>
              </Link>
            </RevealItem>
          ))}
        </Reveal>
      </section>

      <section className="mt-16 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="glass rounded-3xl p-6">
          <p className="hud-label mb-5">{d.exam.achievements} · {Object.keys(state.achievements).length}/{ACHIEVEMENTS.length}</p>
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {ACHIEVEMENTS.map((a, i) => {
              const got = !!state.achievements[a.id]
              return (
                <motion.li
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 20 }}
                  whileHover={{ y: -3 }}
                  className={cn('flex flex-col items-center rounded-2xl border p-3 text-center', got ? 'border-cyan/25 bg-cyan-soft' : 'border-line')}
                  title={l(a.description)}
                >
                  <AchievementBadge a={a} unlocked={got} size={52} />
                  <p className={cn('mt-2 text-xs font-medium', !got && 'text-muted')}>{l(a.name)}</p>
                  <p className="mt-0.5 line-clamp-2 text-[0.65rem] text-dim">{l(a.description)}</p>
                </motion.li>
              )
            })}
          </ul>
        </div>
        <div className="glass rounded-3xl p-6">
          <p className="hud-label mb-5">{d.exam.certificates}</p>
          {Object.keys(state.certificates).length === 0 ? (
            <p className="text-sm text-muted">{d.exam.noCert}</p>
          ) : (
            <ul className="space-y-2">
              {Object.entries(state.certificates).map(([levelId, c]) => {
                const lv = LEVELS.find((x) => x.id === levelId)
                return (
                  <li key={levelId}>
                    <Link to={`/certificate/${levelId}`} className="flex items-center gap-3 rounded-2xl border border-success/30 bg-success/5 p-4 hover:border-success/60">
                      <FileBadge size={22} className="text-success" />
                      <div className="min-w-0 flex-1">
                        <p className="font-medium">{lv && `${d.learn.level} ${lv.number} — ${l(lv.title)}`}</p>
                        <p className="font-mono text-[0.68rem] text-dim">{Math.round(c.score * 100)}% · {new Date(c.date).toLocaleDateString(lang)}</p>
                      </div>
                      <ArrowRight size={15} className="text-dim" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
    </div>
  )
}

function AssessmentCard({ a }: { a: Assessment }) {
  const { d, f, l } = useI18n()
  const completed = useProgress((s) => s.completedLessons)
  const res = useProgress((s) => s.assessments[a.id])
  const done = a.requires.filter((id) => completed[id]).length
  const ready = done === a.requires.length
  return (
    <Link to={`/assessments/${a.id}`} className="block h-full rounded-3xl">
      <SpotlightCard glow={a.kind === 'exam' ? 'purple' : 'cyan'} className={cn('h-full rounded-3xl', a.kind === 'exam' && 'glow-border')}>
        <div className="flex h-full flex-col p-6">
          <div className="flex items-start justify-between gap-2">
            <Chip tone={a.kind === 'exam' ? 'purple' : a.kind === 'practical' ? 'warning' : 'cyan'}>{d.dash.kinds[a.kind]}</Chip>
            {res?.passed ? (
              <Chip tone="success"><CheckCircle2 size={11} /> {d.exam.passed}</Chip>
            ) : ready ? (
              <Chip tone="cyan" dot>{d.exam.ready}</Chip>
            ) : (
              <Chip><Lock size={11} /> {d.exam.locked}</Chip>
            )}
          </div>
          <h3 className="mt-4 font-display text-xl font-semibold tracking-tight">{l(a.title)}</h3>
          <p className="mt-1.5 text-sm text-muted">{l(a.description)}</p>
          <p className="mt-4 flex flex-wrap items-center gap-3 font-mono text-[0.68rem] text-dim">
            <span className="flex items-center gap-1"><Target size={11} /> {f(d.dash.questions, { n: a.questions })}</span>
            <span className="flex items-center gap-1"><Clock size={11} /> {f(d.dash.minutes, { n: a.minutes })}</span>
            <span>{f(d.exam.pass, { p: Math.round(a.passRatio * 100) })}</span>
          </p>
          <div className="mt-auto pt-5">
            {res ? (
              <>
                <div className="mb-1.5 flex justify-between font-mono text-[0.68rem] text-dim">
                  <span>{f(d.exam.best, { s: Math.round(res.best * 100) })}</span>
                  <span>{f(d.exam.attempts, { n: res.attempts })}</span>
                </div>
                <ProgressBar value={res.best} tone={res.passed ? 'success' : 'purple'} />
              </>
            ) : (
              <>
                <p className="mb-1.5 font-mono text-[0.68rem] text-dim">{f(d.exam.requires, { d: done, t: a.requires.length })}</p>
                <ProgressBar value={a.requires.length ? done / a.requires.length : 0} />
              </>
            )}
          </div>
        </div>
      </SpotlightCard>
    </Link>
  )
}
