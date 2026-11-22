import { motion } from 'motion/react'
import { Check, Lock } from 'lucide-react'
import { LEVELS } from '@/content/curriculum'
import { useProgress, levelProgress, isLevelUnlocked } from '@/store/progress'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

/** Six-level career track with connecting progress rail. */
export function PathTrack() {
  const { d, l } = useI18n()
  const state = useProgress()
  const items = LEVELS.map((lvl, i) => {
    const p = levelProgress(state, lvl.id)
    const unlocked = isLevelUnlocked(state, i)
    const status = p.ratio >= 1 ? 'complete' : !unlocked ? 'locked' : p.done > 0 ? 'inProgress' : 'available'
    return { lvl, p, status } as const
  })
  // Rail fill: completed levels + fraction of the current one.
  const firstOpen = items.findIndex((x) => x.status !== 'complete')
  const fill = firstOpen === -1 ? 1 : (firstOpen + items[firstOpen].p.ratio) / (items.length - 1)

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-2" data-lenis-prevent-horizontal>
      <ol className="relative grid min-w-[760px] grid-cols-6 gap-3 pt-2">
        <div aria-hidden className="absolute top-[1.65rem] right-[8.33%] left-[8.33%] h-px bg-line-strong">
          <motion.div
            className="h-full origin-left bg-gradient-to-r from-cyan to-purple shadow-[0_0_10px_var(--cyan)]"
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: Math.min(1, fill) }}
            viewport={{ once: true }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          />
        </div>
        {items.map(({ lvl, p, status }, i) => (
          <motion.li
            key={lvl.id}
            className="relative flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + i * 0.08, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span
              className={cn(
                'relative z-10 grid h-12 w-12 place-items-center rounded-2xl border font-mono text-sm font-semibold transition-colors',
                status === 'complete' && 'border-success/50 bg-success/15 text-success',
                status === 'inProgress' && 'border-cyan bg-bg-2 text-cyan shadow-[0_0_20px_rgb(var(--cyan-rgb)/0.35)]',
                status === 'available' && 'border-line-strong bg-bg-2 text-text',
                status === 'locked' && 'border-line bg-bg-2 text-dim',
              )}
            >
              {status === 'inProgress' && <span className="absolute inset-0 animate-ping rounded-2xl border border-cyan/40" />}
              {status === 'complete' ? <Check size={18} /> : status === 'locked' ? <Lock size={15} /> : `0${lvl.number}`}
            </span>
            <p className={cn('mt-3 text-sm leading-tight font-medium', status === 'locked' ? 'text-dim' : 'text-text')}>{l(lvl.title)}</p>
            <p className="mt-1 font-mono text-[0.65rem] tracking-wider text-dim uppercase">
              {d.dash[status]} · {Math.round(p.ratio * 100)}%
            </p>
          </motion.li>
        ))}
      </ol>
    </div>
  )
}
