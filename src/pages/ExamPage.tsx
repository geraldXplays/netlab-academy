import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, ArrowRight, Award, BookOpen, Check, ChevronDown, Clock, FileBadge, Lock, RotateCcw, Sparkles, Target, X } from 'lucide-react'
import { assessmentById, type Assessment } from '@/content/assessments'
import { AdaptivePicker } from '@/content/assess/adaptive'
import { correctAnswer, type Response } from '@/content/assess/grade'
import { LESSONS, locateLesson, type ExamQuestion } from '@/content/lessons'
import { LEVELS } from '@/content/curriculum'
import { useProgress, type FinishResult } from '@/store/progress'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { QuestionCard, txt } from '@/components/learn/QuestionCard'
import { RichText } from '@/components/learn/RichText'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { cn } from '@/lib/cn'

interface Answer {
  q: ExamQuestion
  response: Response | null
  correct: boolean
}

/** Pretty-print a learner response for the review list. */
export function formatResponse(q: ExamQuestion, r: Response | null, lang: 'en' | 'fr') {
  if (r === null || r === undefined) return null
  switch (q.kind) {
    case 'mcq':
      return txt(q.options[r as number], lang)
    case 'tf':
      return r ? (lang === 'fr' ? 'Vrai' : 'True') : lang === 'fr' ? 'Faux' : 'False'
    case 'command':
    case 'input':
      return String(r)
    case 'order':
      return (r as number[]).map((i, k) => `${k + 1}. ${txt(q.items[i], lang)}`).join('  ')
    case 'fields':
      return q.fields.map((f, i) => `${txt(f.label, lang)}: ${(r as string[])[i] ?? ''}`).join(' · ')
  }
}

export default function ExamPage() {
  const { id = '' } = useParams()
  const a = assessmentById(id)
  const { d } = useI18n()
  if (!a) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-36 pb-24 text-center">
        <Button to="/assessments" variant="secondary">{d.exam.back}</Button>
      </div>
    )
  }
  return <ExamRunner key={a.id} a={a} />
}

function ExamRunner({ a }: { a: Assessment }) {
  const { d, f, l } = useI18n()
  const completed = useProgress((s) => s.completedLessons)
  const result = useProgress((s) => s.assessments[a.id])
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const finishAssessment = useProgress((s) => s.finishAssessment)
  const [phase, setPhase] = useState<'intro' | 'run' | 'done'>('intro')
  const [current, setCurrent] = useState<ExamQuestion | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [answered, setAnswered] = useState(false)
  const [timeLeft, setTimeLeft] = useState(a.minutes * 60)
  const [outcome, setOutcome] = useState<FinishResult | null>(null)
  const [timedOut, setTimedOut] = useState(false)
  const picker = useRef<AdaptivePicker | null>(null)
  const answersRef = useRef<Answer[]>([])
  answersRef.current = answers

  useEffect(() => {
    document.title = `${l(a.title)} · NetLab Academy`
  }, [a, l])

  const missing = a.requires.filter((id) => !completed[id])
  const unlocked = missing.length === 0

  const start = () => {
    picker.current = new AdaptivePicker(a.pool(), useProgress.getState().topicStats)
    setAnswers([])
    setAnswered(false)
    setTimedOut(false)
    setTimeLeft(a.minutes * 60)
    setCurrent(picker.current.next())
    setPhase('run')
    window.scrollTo({ top: 0 })
  }

  const finish = (timeout = false) => {
    const list = answersRef.current
    const correct = list.filter((x) => x.correct).length
    const res = finishAssessment(
      { id: a.id, levelId: a.levelId, passRatio: a.passRatio, xp: a.xp, badge: a.badge, certificate: a.certificate },
      correct,
      a.questions,
    )
    setOutcome(res)
    setTimedOut(timeout)
    setPhase('done')
    window.scrollTo({ top: 0 })
  }

  // Countdown
  useEffect(() => {
    if (phase !== 'run') return
    const t = window.setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          window.clearInterval(t)
          finish(true)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => window.clearInterval(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  const onAnswer = (correct: boolean, response: Response) => {
    if (!current) return
    recordAnswer(current, correct)
    picker.current?.record(correct)
    setAnswers((xs) => [...xs, { q: current, response, correct }])
    setAnswered(true)
  }

  const next = () => {
    if (answersRef.current.length >= a.questions) return finish()
    const q = picker.current?.next() ?? null
    if (!q) return finish()
    setCurrent(q)
    setAnswered(false)
  }

  /* ------------------------------ Intro ------------------------------ */
  if (phase === 'intro') {
    const level = LEVELS.find((x) => x.id === a.levelId)
    return (
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
        <Link to="/assessments" className="mb-6 inline-flex items-center gap-1.5 font-mono text-xs text-dim hover:text-cyan"><ArrowLeft size={12} /> {d.exam.back}</Link>
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="glass-strong glow-border hud-corners rounded-3xl p-7 sm:p-10">
          <div className="flex flex-wrap items-center gap-2">
            <Chip tone={a.kind === 'exam' ? 'purple' : a.kind === 'practical' ? 'warning' : 'cyan'}>{d.dash.kinds[a.kind]}</Chip>
            {level && <Chip>{d.learn.level} {level.number}</Chip>}
            {result?.passed && <Chip tone="success" dot>{d.exam.passed}</Chip>}
          </div>
          <h1 className="mt-4 font-display text-[clamp(2rem,4.5vw,3rem)] leading-tight font-semibold tracking-tight">{l(a.title)}</h1>
          <p className="mt-3 text-lg text-muted">{l(a.description)}</p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {[
              { icon: Target, v: a.questions, k: d.dash.questions.replace('{n}', '').trim() },
              { icon: Clock, v: `${a.minutes}′`, k: d.exam.timeLeft },
              { icon: Award, v: `${Math.round(a.passRatio * 100)}%`, k: d.exam.pass.replace(/\s*\{p\}\s*%/, '') },
            ].map(({ icon: Icon, v, k }) => (
              <div key={k} className="rounded-2xl border border-line bg-bg-2/50 p-4 text-center">
                <Icon size={18} className="mx-auto text-cyan" />
                <p className="mt-2 font-display text-2xl font-semibold">{v}</p>
                <p className="font-mono text-[0.65rem] tracking-wider text-dim uppercase">{k}</p>
              </div>
            ))}
          </div>
          <ul className="mt-6 space-y-1.5 text-sm text-muted">
            <li className="flex gap-2"><Sparkles size={15} className="mt-0.5 shrink-0 text-cyan" /> {a.feedback === 'end' ? d.exam.examMode : d.exam.instantMode}</li>
            <li className="flex gap-2"><Sparkles size={15} className="mt-0.5 shrink-0 text-cyan" /> {d.exam.adaptive}</li>
            {result && <li className="flex gap-2"><Sparkles size={15} className="mt-0.5 shrink-0 text-cyan" /> {f(d.exam.best, { s: Math.round(result.best * 100) })} · {f(d.exam.attempts, { n: result.attempts })}</li>}
          </ul>

          {unlocked ? (
            <div className="mt-8 flex flex-wrap gap-3">
              <Button onClick={start} size="lg" magnetic iconRight={<ArrowRight size={18} />}>{result ? d.exam.retake : d.exam.start}</Button>
              {result?.passed && a.certificate && <Button to={`/certificate/${a.levelId}`} variant="secondary" size="lg" icon={<FileBadge size={17} />}>{d.exam.viewCertificate}</Button>}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-line bg-bg-2/50 p-5">
              <p className="flex items-center gap-2 font-medium"><Lock size={16} className="text-dim" /> {f(d.exam.requires, { d: a.requires.length - missing.length, t: a.requires.length })}</p>
              <ProgressBar value={(a.requires.length - missing.length) / a.requires.length} className="mt-3" />
              <ul className="mt-4 space-y-1.5">
                {missing.slice(0, 6).map((id) => (
                  <li key={id}>
                    {LESSONS[id] ? (
                      <Link to={`/learn/${id}`} className="flex items-center gap-2 text-sm text-muted hover:text-cyan"><BookOpen size={14} /> {l(LESSONS[id].title)}</Link>
                    ) : (
                      <span className="flex items-center gap-2 text-sm text-dim"><BookOpen size={14} /> {id}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </motion.section>
      </div>
    )
  }

  /* ------------------------------ Running ------------------------------ */
  if (phase === 'run' && current) {
    const i = answers.length + (answered ? 0 : 1)
    const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0')
    const ss = String(timeLeft % 60).padStart(2, '0')
    const low = timeLeft < 60
    return (
      <div className="mx-auto max-w-3xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
        <div className="glass sticky top-24 z-20 mb-6 flex items-center gap-4 rounded-2xl px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{l(a.title)}</p>
            <p className="font-mono text-[0.68rem] text-dim">{f(d.exam.question, { i: Math.min(i, a.questions), n: a.questions })}</p>
            <ProgressBar value={answers.length / a.questions} className="mt-2" />
          </div>
          <div className={cn('flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-sm tabular-nums', low ? 'animate-pulse border-danger/50 text-danger' : 'border-line text-text')} aria-label={d.exam.timeLeft}>
            <Clock size={14} /> {mm}:{ss}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.section
            key={current.id}
            initial={{ opacity: 0, x: 40, filter: 'blur(4px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -40, filter: 'blur(4px)' }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass rounded-3xl p-6 sm:p-8"
          >
            <div className="mb-4 flex items-center gap-2">
              <Chip>{l(locateLesson(`${current.topic}.1`)?.module.title ?? { en: current.topic, fr: current.topic })}</Chip>
              <span className="flex gap-0.5" aria-label={`${d.exam.difficulty} ${current.difficulty}`}>
                {[1, 2, 3].map((k) => <span key={k} className={cn('h-1.5 w-4 rounded-full', k <= current.difficulty ? 'bg-cyan' : 'bg-line-strong')} />)}
              </span>
            </div>
            <QuestionCard q={current} feedback={a.feedback === 'end' ? 'deferred' : 'instant'} onAnswer={onAnswer} />
            {answered && (
              <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex justify-end">
                <Button onClick={next} iconRight={<ArrowRight size={16} />}>{answers.length >= a.questions ? d.exam.finish : d.exam.next}</Button>
              </motion.div>
            )}
          </motion.section>
        </AnimatePresence>
      </div>
    )
  }

  /* ------------------------------ Results ------------------------------ */
  return <Results a={a} answers={answers} outcome={outcome} timedOut={timedOut} onRetry={start} />
}

function Results({ a, answers, outcome, timedOut, onRetry }: { a: Assessment; answers: Answer[]; outcome: FinishResult | null; timedOut: boolean; onRetry: () => void }) {
  const { d, f, l, lang } = useI18n()
  const reduced = useReducedMotionPref()
  const [open, setOpen] = useState<number | null>(null)
  const ratio = outcome?.ratio ?? 0
  const passed = !!outcome?.passed
  const level = LEVELS.find((x) => x.id === a.levelId)

  // Topic breakdown
  const byTopic = new Map<string, { n: number; c: number }>()
  for (const x of answers) {
    const cur = byTopic.get(x.q.topic) ?? { n: 0, c: 0 }
    byTopic.set(x.q.topic, { n: cur.n + 1, c: cur.c + (x.correct ? 1 : 0) })
  }
  const topics = [...byTopic.entries()].map(([topic, v]) => ({ topic, ...v, ratio: v.c / v.n, module: locateLesson(`${topic}.1`)?.module }))
  const weak = topics.filter((t) => t.ratio < 0.7 && t.module && LESSONS[`${t.topic}.1`])

  return (
    <div className="mx-auto max-w-4xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <motion.section initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 24 }} className="glass-strong glow-border relative overflow-hidden rounded-3xl p-7 text-center sm:p-10">
        {passed && !reduced && <Burst />}
        {timedOut && <p className="mb-4 rounded-xl border border-warning/30 bg-warning/10 px-3 py-2 text-sm text-warning">{d.exam.timeUp}</p>}
        <div className="flex justify-center">
          <ProgressRing value={ratio} size={170} stroke={11}>
            <div>
              <p className="font-display text-5xl font-semibold">{Math.round(ratio * 100)}<span className="text-2xl text-muted">%</span></p>
              <p className="font-mono text-[0.65rem] text-dim">{answers.filter((x) => x.correct).length}/{a.questions}</p>
            </div>
          </ProgressRing>
        </div>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className={cn('mt-6 font-display text-3xl font-semibold', passed ? 'text-success' : 'text-warning')}>
          {passed ? d.exam.resultPassed : d.exam.resultFailed}
        </motion.p>
        <p className="mt-1 text-muted">{l(a.title)} · {f(d.exam.pass, { p: Math.round(a.passRatio * 100) })}</p>
        {!!outcome?.xp && (
          <motion.p initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 14 }} className="mt-4 inline-block rounded-full bg-cyan-soft px-4 py-1.5 font-mono text-sm font-semibold text-cyan">
            {f(d.exam.xp, { n: outcome.xp })}
          </motion.p>
        )}
        {passed && outcome?.firstPass && a.certificate && level && (
          <p className="mt-3 font-medium text-success">{f(d.exam.levelUnlocked, { n: level.number + 1 })}</p>
        )}
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Button onClick={onRetry} variant="secondary" icon={<RotateCcw size={15} />}>{d.exam.retake}</Button>
          {passed && a.certificate && <Button to={`/certificate/${a.levelId}`} icon={<FileBadge size={16} />}>{d.exam.viewCertificate}</Button>}
          <Button to="/assessments" variant="ghost">{d.exam.back}</Button>
        </div>
      </motion.section>

      {/* Topics */}
      <section className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="glass rounded-3xl p-6">
          <p className="hud-label mb-4">{d.exam.topics}</p>
          <ul className="space-y-3">
            {topics.map((t, i) => (
              <li key={t.topic}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-muted">{t.module ? l(t.module.title) : t.topic}</span>
                  <span className="font-mono text-xs text-dim">{t.c}/{t.n}</span>
                </div>
                <ProgressBar value={t.ratio} tone={t.ratio >= 0.7 ? 'success' : 'purple'} delay={0.1 + i * 0.06} />
              </li>
            ))}
          </ul>
        </div>
        <div className="glass rounded-3xl p-6">
          <p className="hud-label mb-4">{d.exam.recommend}</p>
          {weak.length === 0 ? (
            <p className="flex items-center gap-2 text-sm text-success"><Check size={16} /> {d.learn.correct}</p>
          ) : (
            <ul className="space-y-2">
              {weak.map((t) => (
                <li key={t.topic}>
                  <Link to={`/learn/${t.topic}.1`} className="flex items-center justify-between rounded-xl border border-line px-3 py-2.5 text-sm hover:border-cyan/40 hover:text-cyan">
                    <span className="flex items-center gap-2"><BookOpen size={14} /> {t.module && l(t.module.title)}</span>
                    <ArrowRight size={14} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Review */}
      <section className="mt-8">
        <p className="hud-label mb-4">{d.exam.review}</p>
        <ul className="space-y-2">
          {answers.map((x, i) => {
            const isOpen = open === i
            const mine = formatResponse(x.q, x.response, lang)
            return (
              <li key={x.q.id} className="glass overflow-hidden rounded-2xl">
                <button onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen} className="flex w-full items-center gap-3 px-4 py-3 text-left">
                  <span className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full', x.correct ? 'bg-success/15 text-success' : 'bg-danger/15 text-danger')}>{x.correct ? <Check size={14} /> : <X size={14} />}</span>
                  <span className="min-w-0 flex-1 truncate text-sm">{txt(x.q.prompt, lang).replace(/\*\*|`/g, '')}</span>
                  <motion.span animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown size={16} className="text-dim" /></motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="space-y-2 border-t border-line px-4 py-4 text-sm">
                        <RichText text={txt(x.q.prompt, lang)} className="text-text [&_p]:my-0" />
                        {'code' in x.q && x.q.code && <pre className="overflow-x-auto rounded-lg bg-bg-2 p-3 font-mono text-xs">{x.q.code}</pre>}
                        <p><span className="text-dim">{d.exam.yourAnswer}: </span><span className={x.correct ? 'text-success' : 'text-danger'}>{mine ?? d.exam.noAnswer}</span></p>
                        {!x.correct && <p><span className="text-dim">{d.exam.correctAnswer}: </span><span className="text-success">{correctAnswer(x.q, lang)}</span></p>}
                        <RichText text={txt(x.q.explain, lang)} className="text-muted [&_p]:my-1" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}

function Burst() {
  const cols = ['var(--cyan)', 'var(--blue)', 'var(--purple)', 'var(--success)', 'var(--warning)']
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      {Array.from({ length: 36 }, (_, i) => {
        const a = (i / 36) * Math.PI * 2
        const dist = 180 + Math.random() * 220
        return (
          <motion.span
            key={i}
            className="absolute top-[28%] left-1/2 h-2.5 w-1.5 rounded-sm"
            style={{ background: cols[i % cols.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x: Math.cos(a) * dist, y: Math.sin(a) * dist + 120, opacity: 0, rotate: 540 }}
            transition={{ duration: 1.6 + Math.random() * 0.5, ease: [0.2, 0.7, 0.4, 1], delay: 0.3 }}
          />
        )
      })}
    </div>
  )
}
