import { AnimatePresence, motion } from 'motion/react'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import type { Question } from '@/content/lessons'
import type { L } from '@/content/types'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { RichText } from './RichText'

export const txt = (v: L | string, lang: 'en' | 'fr') => (typeof v === 'string' ? v : v[lang])

/**
 * One question with animated feedback. Controlled by `onAnswer`; once
 * answered it locks and shows the explanation. `initial` restores a past answer.
 */
export function QuestionCard({ q, onAnswer, initial, compact }: {
  q: Question
  onAnswer?: (correct: boolean, choice: number) => void
  initial?: { choice: number; correct: boolean }
  compact?: boolean
}) {
  const { d, lang } = useI18n()
  const [choice, setChoice] = useState<number | null>(initial?.choice ?? null)
  const [locked, setLocked] = useState(!!initial)
  const options = q.kind === 'mcq' ? q.options.map((o) => txt(o, lang)) : [d.learn.true, d.learn.false]
  const correctIndex = q.kind === 'mcq' ? q.answer : q.answer ? 0 : 1
  const isCorrect = choice === correctIndex

  const submit = () => {
    if (choice === null || locked) return
    setLocked(true)
    onAnswer?.(choice === correctIndex, choice)
  }

  return (
    <div>
      <p className={cn('font-medium text-text', compact ? 'text-base' : 'text-lg')}>{txt(q.prompt, lang)}</p>
      <div role="radiogroup" className={cn('mt-4 grid gap-2', q.kind === 'tf' && 'sm:grid-cols-2')}>
        {options.map((o, i) => {
          const picked = choice === i
          const showRight = locked && i === correctIndex
          const showWrong = locked && picked && !isCorrect
          return (
            <motion.button
              key={i}
              role="radio"
              aria-checked={picked}
              disabled={locked}
              onClick={() => setChoice(i)}
              whileTap={locked ? undefined : { scale: 0.98 }}
              animate={showWrong ? { x: [0, -8, 8, -5, 5, 0] } : showRight ? { scale: [1, 1.02, 1] } : {}}
              transition={{ duration: 0.45 }}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-[0.95rem] transition-colors duration-300',
                !locked && (picked ? 'border-cyan bg-cyan-soft text-text' : 'border-line bg-bg-2/40 text-muted hover:border-line-strong hover:text-text'),
                showRight && 'border-success bg-success/10 text-text',
                showWrong && 'border-danger bg-danger/10 text-text',
                locked && !showRight && !showWrong && 'border-line text-dim opacity-70',
              )}
            >
              <span
                className={cn(
                  'grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[0.7rem]',
                  showRight ? 'border-success bg-success text-bg' : showWrong ? 'border-danger bg-danger text-bg' : picked ? 'border-cyan text-cyan' : 'border-line-strong text-dim',
                )}
              >
                {showRight ? <Check size={13} /> : showWrong ? <X size={13} /> : String.fromCharCode(65 + i)}
              </span>
              <span>{o}</span>
            </motion.button>
          )
        })}
      </div>
      {!locked && (
        <button
          onClick={submit}
          disabled={choice === null}
          className="btn btn-primary mt-4 rounded-full bg-cyan px-5 py-2 text-sm font-semibold text-on-accent transition-opacity disabled:opacity-40"
        >
          {d.learn.submit}
        </button>
      )}
      <AnimatePresence>
        {locked && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -6 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className={cn('mt-4 flex gap-3 rounded-xl border p-4 text-sm', isCorrect ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5')}>
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.1 }}
                className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full', isCorrect ? 'bg-success text-bg' : 'bg-warning text-bg')}
              >
                {isCorrect ? <Check size={15} /> : <X size={15} />}
              </motion.span>
              <div>
                <p className={cn('font-semibold', isCorrect ? 'text-success' : 'text-warning')}>{isCorrect ? d.learn.correct : d.learn.incorrect}</p>
                <RichText text={txt(q.explain, lang)} className="text-muted [&_p]:my-1" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
