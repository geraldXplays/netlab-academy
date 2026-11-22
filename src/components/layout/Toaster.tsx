import { AnimatePresence, motion } from 'motion/react'
import { ChevronsUp, Info, X, Zap } from 'lucide-react'
import { useNotifications, type Toast } from '@/store/notifications'
import { achievementById } from '@/content/achievements'
import { AchievementBadge } from '@/components/ui/AchievementBadge'
import { useI18n } from '@/i18n'

/** Bottom-right live region for XP gains, level-ups and achievement unlocks. */
export function Toaster() {
  const toasts = useNotifications((s) => s.toasts)
  return (
    <div aria-live="polite" className="pointer-events-none fixed right-3 bottom-3 z-[60] flex w-[min(380px,calc(100vw-24px))] flex-col items-end gap-2 sm:right-5 sm:bottom-5">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.9, filter: 'blur(6px)' }}
            animate={{ opacity: 1, x: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: 40, scale: 0.95, transition: { duration: 0.25 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className="pointer-events-auto w-full"
          >
            <ToastCard t={t} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastCard({ t }: { t: Toast }) {
  const { d, f, l } = useI18n()
  const dismiss = useNotifications((s) => s.dismiss)
  const close = (
    <button onClick={() => dismiss(t.id)} className="ml-auto self-start rounded-full p-1 text-dim hover:text-text" aria-label="Dismiss">
      <X size={14} />
    </button>
  )

  if (t.type === 'achievement') {
    const a = achievementById(t.achievementId)
    if (!a) return null
    return (
      <div className="glass-strong glow-border relative flex items-center gap-4 overflow-hidden rounded-2xl p-4 shadow-[var(--shadow)]">
        <motion.span
          aria-hidden
          className="absolute inset-y-0 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          initial={{ left: '-40%' }}
          animate={{ left: '140%' }}
          transition={{ duration: 1.4, delay: 0.3, ease: 'easeInOut' }}
        />
        <motion.div initial={{ scale: 0, rotate: -120 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}>
          <AchievementBadge a={a} unlocked size={56} />
        </motion.div>
        <div className="min-w-0">
          <p className="hud-label !text-cyan">{d.toast.achievement}</p>
          <p className="font-display text-lg font-semibold">{l(a.name)}</p>
          <p className="text-xs text-muted">+{a.xp} XP</p>
        </div>
        {close}
      </div>
    )
  }

  if (t.type === 'levelup') {
    return (
      <div className="glass-strong glow-border flex items-center gap-4 rounded-2xl p-4 shadow-[var(--shadow)]">
        <motion.div
          className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-cyan to-purple text-on-accent"
          animate={{ y: [0, -4, 0] }}
          transition={{ repeat: 2, duration: 0.6 }}
        >
          <ChevronsUp size={24} />
        </motion.div>
        <div>
          <p className="hud-label !text-cyan">{d.toast.levelup}</p>
          <p className="font-display text-lg font-semibold">{f(d.toast.levelupBody, { n: t.level })}</p>
        </div>
        {close}
      </div>
    )
  }

  if (t.type === 'xp') {
    return (
      <div className="glass-strong flex items-center gap-3 rounded-full py-2 pr-3 pl-2 shadow-[var(--shadow)]">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-soft text-cyan">
          <Zap size={16} />
        </span>
        <motion.span
          className="font-mono text-sm font-semibold text-cyan"
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          +{t.amount} XP
        </motion.span>
        <span className="truncate text-sm text-muted">{l(t.reason)}</span>
        {close}
      </div>
    )
  }

  return (
    <div className="glass-strong flex items-start gap-3 rounded-2xl p-4 shadow-[var(--shadow)]">
      <Info size={18} className="mt-0.5 text-cyan" />
      <div>
        <p className="font-medium">{t.title}</p>
        {t.body && <p className="text-sm text-muted">{t.body}</p>}
      </div>
      {close}
    </div>
  )
}
