import { AnimatePresence, motion } from 'motion/react'
import { Award, ClipboardCheck, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import type { Question } from '@/content/lessons'
import { useI18n } from '@/i18n'
import { useProgress } from '@/store/progress'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { QuestionCard } from './QuestionCard'

type Phase = 'intro' | 'running' | 'result'

/** End-of-lesson assessment: one question at a time, then a scored result. */
export function QuizRunner({ lessonId, questions, passRatio }: { lessonId: string; questions: Question[]; passRatio: number }) {
  const { d, f } = useI18n()
  const submitQuiz = useProgress((s) => s.submitQuiz)
  const recordAnswer = useProgress((s) => s.recordAnswer)
  const done = useProgress((s) => !!s.completedLessons[lessonId])
  const best = useProgress((s) => s.lessonState[lessonId]?.best ?? 0)
  const reduced = useReducedMotionPref()
  const [phase, setPhase] = useState<Phase>('intro')
  const [i, setI] = useState(0)
  const [answered, setAnswered] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [result, setResult] = useState<{ ratio: number; passed: boolean } | null>(null)

  const start = () => {
    setPhase('running')
    setI(0)
    setScore(0)
    setAnswered(null)
  }
  const next = () => {
    if (i + 1 < questions.length) {
      setI(i + 1)
      setAnswered(null)
      return
    }
    const finalScore = score
    const ratio = finalScore / questions.length
    submitQuiz(lessonId, finalScore, questions.length, passRatio)
    setResult({ ratio, passed: ratio >= passRatio })
    setPhase('result')
  }

  const pct = (r: number) => Math.round(r * 100)

  return (
    <section id="quiz" className="glass glow-border hud-corners relative overflow-hidden rounded-3xl p-6 sm:p-8">
      <div className="mb-5 flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-cyan-soft text-cyan"><ClipboardCheck size={19} /></span>
        <div>
          <p className="hud-label">{d.learn.quiz}</p>
          <p className="text-sm text-muted">{f(d.learn.quizIntro, { n: questions.length, p: pct(passRatio) })}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {phase === 'intro' && (
          <motion.div key="intro" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            {done && <p className="mb-4 text-sm text-success">{f(d.learn.alreadyDone, { s: pct(best) })}</p>}
            <Button onClick={start} magnetic>{d.learn.startQuiz}</Button>
          </motion.div>
        )}

        {phase === 'running' && (
          <motion.div key={`q${i}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}>
            <div className="mb-4 flex items-center justify-between gap-4">
              <span className="font-mono text-xs text-dim">{f(d.learn.question, { i: i + 1, n: questions.length })}</span>
              <div className="w-40"><ProgressBar value={(i + (answered !== null ? 1 : 0)) / questions.length} /></div>
            </div>
            <QuestionCard
              q={questions[i]}
              onAnswer={(ok) => {
                recordAnswer({ ...questions[i], topic: lessonId.split('.')[0] }, ok)
                setAnswered(ok)
                if (ok) setScore((s) => s + 1)
              }}
            />
            {answered !== null && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-5">
                <Button onClick={next} variant="secondary">{i + 1 < questions.length ? d.learn.next : d.learn.finish}</Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 220, damping: 22 }} className="text-center">
            <motion.div
              className={cn('mx-auto grid h-20 w-20 place-items-center rounded-3xl', result.passed ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning')}
              initial={reduced ? false : { rotate: -120, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 12 }}
            >
              {result.passed ? <Award size={38} /> : <RotateCcw size={34} />}
            </motion.div>
            <p className="mt-4 font-display text-3xl font-semibold">{result.passed ? d.learn.passed : d.learn.failed}</p>
            <p className="mt-2 text-muted">
              {result.passed ? f(d.learn.passedBody, { s: pct(result.ratio) }) : f(d.learn.failedBody, { s: pct(result.ratio), p: pct(passRatio) })}
            </p>
            <p className="mt-4 font-mono text-5xl font-bold text-gradient">{pct(result.ratio)}%</p>
            {result.passed && !reduced && <Confetti />}
            <div className="mt-6 flex justify-center gap-3">
              <Button variant="secondary" onClick={start} icon={<RotateCcw size={15} />}>{d.learn.retry}</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

/** Small celebratory burst, themed by the identity accents. */
function Confetti() {
  const pieces = Array.from({ length: 28 }, (_, i) => i)
  const cols = ['var(--cyan)', 'var(--blue)', 'var(--purple)', 'var(--success)', 'var(--warning)']
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {pieces.map((i) => {
        const x = (Math.random() - 0.5) * 600
        const y = -Math.random() * 320 - 60
        return (
          <motion.span
            key={i}
            className="absolute top-1/2 left-1/2 h-2.5 w-1.5 rounded-sm"
            style={{ background: cols[i % cols.length] }}
            initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
            animate={{ x, y: [0, y, y + 420], opacity: [1, 1, 0], rotate: Math.random() * 720 }}
            transition={{ duration: 1.8 + Math.random() * 0.6, ease: [0.2, 0.7, 0.4, 1] }}
          />
        )
      })}
    </div>
  )
}
