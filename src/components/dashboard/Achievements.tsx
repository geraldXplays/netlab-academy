import { AnimatePresence, motion } from 'motion/react'
import { Award, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ACHIEVEMENTS } from '@/content/achievements'
import { useProgress } from '@/store/progress'
import { useI18n } from '@/i18n'
import { AchievementBadge } from '@/components/ui/AchievementBadge'
import { DashCard } from './DashCard'
import { cn } from '@/lib/cn'

export function Achievements({ className }: { className?: string }) {
  const { d, l, lang } = useI18n()
  const unlocked = useProgress((s) => s.achievements)
  const [open, setOpen] = useState(false)
  const recent = Object.entries(unlocked)
    .sort((a, b) => b[1].localeCompare(a[1]))
    .slice(0, 4)
    .map(([id, date]) => ({ a: ACHIEVEMENTS.find((x) => x.id === id)!, date }))
    .filter((x) => x.a)

  return (
    <DashCard
      title={d.dash.achievements}
      icon={<Award size={14} />}
      className={className}
      action={
        <button onClick={() => setOpen(true)} className="font-mono text-[0.68rem] tracking-wider text-cyan uppercase hover:underline">
          {d.dash.viewAll} · {Object.keys(unlocked).length}/{ACHIEVEMENTS.length}
        </button>
      }
    >
      {recent.length === 0 ? (
        <div className="flex flex-1 items-center gap-4">
          <div className="flex -space-x-3">
            {ACHIEVEMENTS.slice(0, 3).map((a) => (
              <AchievementBadge key={a.id} a={a} unlocked={false} size={48} />
            ))}
          </div>
          <p className="text-sm text-muted">{d.dash.noAchievements}</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {recent.map(({ a, date }, i) => (
            <motion.li
              key={a.id}
              className="flex flex-col items-center rounded-2xl border border-line bg-bg-2/40 p-3 text-center"
              initial={{ opacity: 0, scale: 0.8, rotate: -8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.2 + i * 0.08 }}
              whileHover={{ y: -4 }}
            >
              <AchievementBadge a={a} unlocked size={56} />
              <p className="mt-2 text-xs leading-tight font-medium">{l(a.name)}</p>
              <p className="mt-0.5 font-mono text-[0.6rem] text-dim">{new Date(date).toLocaleDateString(lang, { day: 'numeric', month: 'short' })}</p>
            </motion.li>
          ))}
        </ul>
      )}
      <BadgeModal open={open} onClose={() => setOpen(false)} />
    </DashCard>
  )
}

function BadgeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { d, l } = useI18n()
  const unlocked = useProgress((s) => s.achievements)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[70] grid place-items-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-bg/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={d.dash.allBadges}
            data-lenis-prevent
            className="glass-strong hud-corners relative max-h-[85vh] w-full max-w-3xl overflow-y-auto rounded-3xl p-6 shadow-[var(--shadow)] sm:p-8"
            initial={{ y: 40, scale: 0.94, opacity: 0, filter: 'blur(8px)' }}
            animate={{ y: 0, scale: 1, opacity: 1, filter: 'blur(0px)' }}
            exit={{ y: 20, scale: 0.97, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
          >
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-display text-2xl font-semibold">{d.dash.allBadges}</h2>
              <button onClick={onClose} className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-cyan-soft hover:text-text" aria-label={d.nav.close} autoFocus>
                <X size={18} />
              </button>
            </div>
            <motion.ul className="grid grid-cols-1 gap-3 sm:grid-cols-2" initial="h" animate="s" variants={{ s: { transition: { staggerChildren: 0.04, delayChildren: 0.1 } } }}>
              {ACHIEVEMENTS.map((a) => {
                const got = !!unlocked[a.id]
                return (
                  <motion.li
                    key={a.id}
                    variants={{ h: { opacity: 0, y: 12 }, s: { opacity: 1, y: 0 } }}
                    className={cn('flex items-center gap-4 rounded-2xl border p-3', got ? 'border-cyan/25 bg-cyan-soft' : 'border-line')}
                  >
                    <AchievementBadge a={a} unlocked={got} size={52} />
                    <div className="min-w-0">
                      <p className={cn('font-medium', !got && 'text-muted')}>{l(a.name)}</p>
                      <p className="text-xs text-dim">{l(a.description)}</p>
                      <p className="mt-1 font-mono text-[0.62rem] tracking-wider text-cyan uppercase">
                        +{a.xp} XP · {a.tier}{got ? ` · ${d.dash.unlocked}` : ''}
                      </p>
                    </div>
                  </motion.li>
                )
              })}
            </motion.ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
