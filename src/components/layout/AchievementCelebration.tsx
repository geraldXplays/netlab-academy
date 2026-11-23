import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNotifications } from '@/store/notifications'
import { achievementById } from '@/content/achievements'
import { AchievementBadge } from '@/components/ui/AchievementBadge'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

/**
 * Full-screen moment when a badge is earned: the badge spins in on light rays
 * with a particle ring. Queues multiple unlocks; click or wait to dismiss.
 */
export function AchievementCelebration() {
  const { d, l } = useI18n()
  const reduced = useReducedMotionPref()
  const toasts = useNotifications((s) => s.toasts)
  const [queue, setQueue] = useState<string[]>([])
  const [seen] = useState(() => new Set<number>())

  useEffect(() => {
    const fresh = toasts.filter((t) => t.type === 'achievement' && !seen.has(t.id))
    if (!fresh.length) return
    fresh.forEach((t) => seen.add(t.id))
    setQueue((q) => [...q, ...fresh.map((t) => (t.type === 'achievement' ? t.achievementId : ''))])
  }, [toasts, seen])

  const current = queue[0]
  const a = current ? achievementById(current) : undefined

  useEffect(() => {
    if (!current) return
    const id = window.setTimeout(() => setQueue((q) => q.slice(1)), 4200)
    return () => window.clearTimeout(id)
  }, [current])

  return createPortal(
    <AnimatePresence>
      {a && (
        <motion.div
          key={a.id}
          className="fixed inset-0 z-[96] grid cursor-pointer place-items-center bg-bg/75 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setQueue((q) => q.slice(1))}
          role="alertdialog"
          aria-label={`${d.toast.achievement}: ${l(a.name)}`}
        >
          <div className="relative grid place-items-center">
            {!reduced && (
              <motion.div
                aria-hidden
                className="absolute h-[520px] w-[520px] rounded-full"
                style={{ background: 'repeating-conic-gradient(from 0deg, rgb(var(--cyan-rgb)/0.18) 0deg 6deg, transparent 6deg 20deg)', maskImage: 'radial-gradient(circle, #000 20%, transparent 65%)' }}
                initial={{ scale: 0.3, rotate: 0, opacity: 0 }}
                animate={{ scale: 1, rotate: 90, opacity: 1 }}
                transition={{ duration: 4, ease: 'linear' }}
              />
            )}
            {!reduced &&
              Array.from({ length: 24 }, (_, i) => {
                const ang = (i / 24) * Math.PI * 2
                return (
                  <motion.span
                    key={i}
                    aria-hidden
                    className="absolute h-2 w-2 rounded-full"
                    style={{ background: ['var(--cyan)', 'var(--purple)', 'var(--warning)'][i % 3] }}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                    animate={{ x: Math.cos(ang) * 220, y: Math.sin(ang) * 220, opacity: 0, scale: 0.3 }}
                    transition={{ duration: 1.4, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  />
                )
              })}
            <motion.div
              initial={reduced ? false : { scale: 0, rotateY: 540 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 120, damping: 12 }}
              style={{ transformPerspective: 800 }}
            >
              <AchievementBadge a={a} unlocked size={150} />
            </motion.div>
            <motion.div className="relative mt-6 text-center" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
              <p className="hud-label !text-cyan">{d.toast.achievement}</p>
              <p className="mt-2 font-display text-4xl font-semibold tracking-tight">{l(a.name)}</p>
              <p className="mt-2 max-w-sm text-muted">{l(a.description)}</p>
              <p className="mt-3 font-mono text-sm text-cyan">+{a.xp} XP</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
