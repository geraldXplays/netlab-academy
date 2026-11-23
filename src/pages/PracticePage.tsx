import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Flame, Gauge, RotateCcw, Square, Target } from 'lucide-react'
import { AdaptivePicker } from '@/content/assess/adaptive'
import { ADDRESSING_GENERATORS, SUBNET_GENERATORS, generateFrom } from '@/content/assess/generators'
import { COMMAND_BANK } from '@/content/assess/banks'
import { lessonQuestions } from '@/content/assessments'
import { LEVELS } from '@/content/curriculum'
import type { ExamQuestion } from '@/content/lessons'
import { useProgress } from '@/store/progress'
import { useI18n } from '@/i18n'
import { QuestionCard } from '@/components/learn/QuestionCard'
import { Button } from '@/components/ui/Button'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/lib/cn'

type Mode = 'addressing' | 'subnetting' | 'commands' | 'review'
const LIMIT: Record<Mode, number | null> = { addressing: null, subnetting: 10, commands: 10, review: 10 }

export default function PracticePage() {
  const { mode = 'addressing' } = useParams()
  const m = (['addressing', 'subnetting', 'commands', 'review'].includes(mode) ? mode : 'addressing') as Mode
  return <Session key={m} mode={m} />
}

function Session({ mode }: { mode: Mode }) {
  const { d, f } = useI18n()
  const completed = useProgress((s) => s.completedLessons)
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const finishPractice = useProgress((s) => s.finishPractice)
  const copy = d.exam.modes[mode]
  const limit = LIMIT[mode]

  const reviewPool = useMemo(() => {
    const modules = LEVELS.flatMap((l) => l.modules).filter((m) => Object.keys(completed).some((id) => id.startsWith(`${m.id}.`)))
    return lessonQuestions(...modules.map((m) => m.id))
  }, [completed])

  const makePicker = () => {
    const stats = useProgress.getState().topicStats
    if (mode === 'addressing') return new AdaptivePicker(generateFrom(ADDRESSING_GENERATORS), stats, 1)
    if (mode === 'subnetting') return new AdaptivePicker(generateFrom(SUBNET_GENERATORS), stats, 2)
    if (mode === 'commands') return new AdaptivePicker(COMMAND_BANK, stats, 1)
    return new AdaptivePicker(reviewPool, stats, 1.5)
  }

  const picker = useRef<AdaptivePicker | null>(null)
  const [q, setQ] = useState<ExamQuestion | null>(null)
  const [answered, setAnswered] = useState(false)
  const [n, setN] = useState(0)
  const [correct, setCorrect] = useState(0)
  const [streak, setStreak] = useState(0)
  const [level, setLevel] = useState(1)
  const [done, setDone] = useState<{ xp: number } | null>(null)

  const start = () => {
    picker.current = makePicker()
    setN(0)
    setCorrect(0)
    setStreak(0)
    setDone(null)
    setAnswered(false)
    setLevel(Math.round(picker.current.level))
    setQ(picker.current.next())
  }

  useEffect(() => {
    document.title = `${copy.t} · NetLab Academy`
    if (mode !== 'review' || reviewPool.length) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const onAnswer = (ok: boolean) => {
    if (!q) return
    recordAnswer(q, ok)
    picker.current?.record(ok)
    setLevel(Math.round(picker.current?.level ?? 1))
    setN((x) => x + 1)
    if (ok) {
      setCorrect((x) => x + 1)
      setStreak((x) => x + 1)
    } else setStreak(0)
    setAnswered(true)
  }

  const end = () => {
    const xp = finishPractice(mode, correct, n)
    setDone({ xp })
  }

  const next = () => {
    if (limit && n >= limit) return end()
    const nq = picker.current?.next() ?? null
    if (!nq) return end()
    setQ(nq)
    setAnswered(false)
  }

  if (mode === 'review' && reviewPool.length === 0) {
    return (
      <Shell title={copy.t} desc={copy.d}>
        <p className="text-muted">{d.exam.needLessons}</p>
        <div className="mt-6"><Button to="/academy">{d.exam.goLearn}</Button></div>
      </Shell>
    )
  }

  if (done) {
    const ratio = n ? correct / n : 0
    return (
      <Shell title={copy.t} desc={copy.d}>
        <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
          <div className="flex justify-center">
            <ProgressRing value={ratio} size={150} stroke={10}>
              <p className="font-display text-4xl font-semibold">{Math.round(ratio * 100)}%</p>
            </ProgressRing>
          </div>
          <p className="mt-5 font-display text-2xl font-semibold">{d.exam.sessionDone}</p>
          <p className="text-muted">{f(d.exam.sessionScore, { c: correct, n })}</p>
          {done.xp > 0 && <p className="mt-3 inline-block rounded-full bg-cyan-soft px-4 py-1.5 font-mono text-sm text-cyan">{f(d.exam.xp, { n: done.xp })}</p>}
          <div className="mt-6 flex justify-center gap-3">
            <Button onClick={start} icon={<RotateCcw size={15} />}>{d.exam.retake}</Button>
            <Button to="/assessments" variant="secondary">{d.exam.back}</Button>
          </div>
        </motion.div>
      </Shell>
    )
  }

  return (
    <Shell title={copy.t} desc={copy.d}>
      <div className="mb-5 grid grid-cols-3 gap-2">
        {[
          { icon: Target, label: d.exam.correct, v: limit ? `${correct}/${limit}` : `${correct}/${n}` },
          { icon: Flame, label: d.exam.streak, v: streak, hot: streak >= 3 },
          { icon: Gauge, label: d.exam.difficulty, v: '●'.repeat(level) + '○'.repeat(3 - level) },
        ].map(({ icon: Icon, label, v, hot }) => (
          <div key={label} className="rounded-2xl border border-line bg-bg-2/50 px-3 py-2.5">
            <p className="flex items-center gap-1.5 font-mono text-[0.62rem] tracking-wider text-dim uppercase"><Icon size={12} className={hot ? 'text-warning' : 'text-cyan'} /> {label}</p>
            <motion.p key={String(v)} initial={{ y: 6, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className={cn('mt-0.5 font-mono text-lg', hot && 'text-warning')}>{v}</motion.p>
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        {q && (
          <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <QuestionCard q={q} onAnswer={onAnswer} />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="mt-6 flex items-center justify-between gap-3">
        <button onClick={end} disabled={n === 0} className="flex items-center gap-1.5 text-sm text-dim hover:text-text disabled:opacity-40"><Square size={13} /> {d.exam.endSession}</button>
        {answered && <Button onClick={next} iconRight={<ArrowRight size={16} />}>{limit && n >= limit ? d.exam.finish : d.exam.next}</Button>}
      </div>
    </Shell>
  )
}

function Shell({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  const { d } = useI18n()
  return (
    <div className="mx-auto max-w-3xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <Link to="/assessments" className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-dim hover:text-cyan"><ArrowLeft size={12} /> {d.exam.back}</Link>
      <p className="hud-label">{d.exam.practice}</p>
      <h1 className="mt-2 font-display text-[clamp(2rem,4.5vw,3rem)] leading-tight font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-muted">{desc}</p>
      <section className="glass mt-8 rounded-3xl p-6 sm:p-8">{children}</section>
    </div>
  )
}
