import { AnimatePresence, motion } from 'motion/react'
import { Check, CornerDownLeft, RotateCcw, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { Question } from '@/content/lessons'
import type { L } from '@/content/types'
import { grade, correctAnswer, type Response } from '@/content/assess/grade'
import { shuffle } from '@/content/assess/adaptive'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { RichText } from './RichText'

export const txt = (v: L | string, lang: 'en' | 'fr') => (typeof v === 'string' ? v : v[lang])

function Output({ code }: { code: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-xl border border-line bg-bg-2 p-3 font-mono text-[0.78rem] leading-relaxed text-text" data-lenis-prevent-horizontal>
      {code}
    </pre>
  )
}

/**
 * Renders any question kind and reports a graded response.
 * feedback="instant": reveal correctness + explanation after submitting.
 * feedback="deferred": just lock the answer (exams reveal everything at the end).
 */
export function QuestionCard({ q, onAnswer, initial, compact, feedback = 'instant' }: {
  q: Question
  onAnswer?: (correct: boolean, response: Response) => void
  /** Restore a previously answered state (shows the feedback only). */
  initial?: { correct: boolean }
  compact?: boolean
  feedback?: 'instant' | 'deferred'
}) {
  const { d, lang } = useI18n()
  const [choice, setChoice] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [fields, setFields] = useState<string[]>(() => (q.kind === 'fields' ? q.fields.map(() => '') : []))
  const [order, setOrder] = useState<number[]>([])
  const shuffled = useMemo(() => (q.kind === 'order' ? shuffle(q.items.map((_, i) => i)) : []), [q])
  const [locked, setLocked] = useState(!!initial)
  const [correct, setCorrect] = useState<boolean | null>(initial ? initial.correct : null)

  const response = (): Response | null => {
    switch (q.kind) {
      case 'mcq':
        return choice
      case 'tf':
        return choice === null ? null : choice === 0
      case 'command':
      case 'input':
        return text.trim() ? text : null
      case 'fields':
        return fields.every((v) => v.trim()) ? fields : null
      case 'order':
        return order.length === q.items.length ? order : null
    }
  }
  const ready = response() !== null

  const submit = () => {
    const r = response()
    if (r === null || locked) return
    const ok = grade(q, r)
    setLocked(true)
    setCorrect(ok)
    onAnswer?.(ok, r)
  }

  const showResult = locked && feedback === 'instant' && correct !== null
  const tfAnswer = q.kind === 'tf' ? (q.answer ? 0 : 1) : -1
  const rightIndex = q.kind === 'mcq' ? q.answer : tfAnswer

  return (
    <div>
      <RichText text={txt(q.prompt, lang)} className={cn('font-medium text-text [&_p]:my-0', compact ? 'text-base' : 'text-lg')} />
      {'code' in q && q.code && <Output code={q.code} />}

      {/* Choice questions */}
      {(q.kind === 'mcq' || q.kind === 'tf') && (
        <div role="radiogroup" className={cn('mt-4 grid gap-2', q.kind === 'tf' && 'sm:grid-cols-2')}>
          {(q.kind === 'mcq' ? q.options.map((o) => txt(o, lang)) : [d.learn.true, d.learn.false]).map((o, i) => {
            const picked = choice === i
            const showRight = showResult && i === rightIndex
            const showWrong = showResult && picked && !correct
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
                  !showResult && (picked ? 'border-cyan bg-cyan-soft text-text' : 'border-line bg-bg-2/40 text-muted hover:border-line-strong hover:text-text'),
                  showRight && 'border-success bg-success/10 text-text',
                  showWrong && 'border-danger bg-danger/10 text-text',
                  showResult && !showRight && !showWrong && 'border-line text-dim opacity-70',
                  locked && !showResult && !picked && 'opacity-60',
                )}
              >
                <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[0.7rem]', showRight ? 'border-success bg-success text-bg' : showWrong ? 'border-danger bg-danger text-bg' : picked ? 'border-cyan text-cyan' : 'border-line-strong text-dim')}>
                  {showRight ? <Check size={13} /> : showWrong ? <X size={13} /> : String.fromCharCode(65 + i)}
                </span>
                <span>{o}</span>
              </motion.button>
            )
          })}
        </div>
      )}

      {/* Typed command — terminal style */}
      {q.kind === 'command' && (
        <div className={cn('mt-4 flex items-center gap-2 rounded-xl border bg-bg-2 px-4 py-3 font-mono text-sm transition-colors', locked ? (showResult ? (correct ? 'border-success' : 'border-danger') : 'border-line') : 'border-line-strong focus-within:border-cyan')}>
          <span className="shrink-0 text-success">{q.shell ?? '$'}</span>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submit()}
            disabled={locked}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            aria-label={txt(q.prompt, lang)}
            className="min-w-0 flex-1 bg-transparent text-text caret-cyan outline-none"
          />
          {!locked && <CornerDownLeft size={14} className="text-dim" />}
        </div>
      )}

      {q.kind === 'input' && (
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          disabled={locked}
          placeholder={q.placeholder}
          aria-label={txt(q.prompt, lang)}
          className={cn('mt-4 h-12 w-full max-w-sm rounded-xl border bg-bg-2 px-4 font-mono text-text outline-none transition-colors', locked ? (showResult ? (correct ? 'border-success' : 'border-danger') : 'border-line') : 'border-line-strong focus:border-cyan')}
        />
      )}

      {q.kind === 'fields' && (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {q.fields.map((fd, i) => (
            <label key={i} className="block">
              <span className="mb-1 block font-mono text-[0.7rem] tracking-wider text-dim uppercase">{txt(fd.label, lang)}</span>
              <input
                value={fields[i]}
                onChange={(e) => setFields((cur) => cur.map((v, j) => (j === i ? e.target.value : v)))}
                disabled={locked}
                placeholder={fd.placeholder}
                className="h-11 w-full rounded-xl border border-line-strong bg-bg-2 px-3 font-mono text-sm text-text outline-none focus:border-cyan disabled:opacity-70"
              />
            </label>
          ))}
        </div>
      )}

      {q.kind === 'order' && (
        <div className="mt-4">
          <ol className="space-y-2">
            {shuffled.map((orig) => {
              const pos = order.indexOf(orig)
              return (
                <li key={orig}>
                  <button
                    disabled={locked || pos >= 0}
                    onClick={() => setOrder((o) => [...o, orig])}
                    className={cn('flex w-full items-center gap-3 rounded-xl border px-4 py-2.5 text-left text-sm transition-colors', pos >= 0 ? 'border-cyan/50 bg-cyan-soft text-text' : 'border-line bg-bg-2/40 text-muted hover:border-line-strong hover:text-text')}
                  >
                    <span className={cn('grid h-6 w-6 shrink-0 place-items-center rounded-full border font-mono text-[0.72rem]', pos >= 0 ? 'border-cyan bg-cyan text-on-accent' : 'border-line-strong text-dim')}>{pos >= 0 ? pos + 1 : '·'}</span>
                    {txt(q.items[orig], lang)}
                  </button>
                </li>
              )
            })}
          </ol>
          {!locked && order.length > 0 && (
            <button onClick={() => setOrder([])} className="mt-2 flex items-center gap-1.5 text-xs text-dim hover:text-text"><RotateCcw size={12} /> Reset</button>
          )}
        </div>
      )}

      {!locked && (
        <button onClick={submit} disabled={!ready} className="btn btn-primary mt-4 rounded-full bg-cyan px-5 py-2 text-sm font-semibold text-on-accent transition-opacity disabled:opacity-40">
          {d.learn.submit}
        </button>
      )}

      <AnimatePresence>
        {showResult && (
          <motion.div initial={{ opacity: 0, height: 0, y: -6 }} animate={{ opacity: 1, height: 'auto', y: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }} className="overflow-hidden">
            <div className={cn('mt-4 flex gap-3 rounded-xl border p-4 text-sm', correct ? 'border-success/30 bg-success/5' : 'border-warning/30 bg-warning/5')}>
              <motion.span
                initial={{ scale: 0, rotate: -90 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 400, damping: 14, delay: 0.1 }}
                className={cn('grid h-7 w-7 shrink-0 place-items-center rounded-full', correct ? 'bg-success text-bg' : 'bg-warning text-bg')}
              >
                {correct ? <Check size={15} /> : <X size={15} />}
              </motion.span>
              <div className="min-w-0">
                <p className={cn('font-semibold', correct ? 'text-success' : 'text-warning')}>{correct ? d.learn.correct : d.learn.incorrect}</p>
                {!correct && q.kind !== 'mcq' && q.kind !== 'tf' && (
                  <p className="mt-1 font-mono text-xs break-words text-text">→ {correctAnswer(q, lang)}</p>
                )}
                <RichText text={txt(q.explain, lang)} className="text-muted [&_p]:my-1" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
