import { AnimatePresence, motion } from 'motion/react'
import { BookOpen, CheckCircle2, FlaskConical, HelpCircle, MonitorCog, Target } from 'lucide-react'
import { missionsForDay, type ActivityKind } from '@/content/missions'
import { useProgress } from '@/store/progress'
import { dayKey } from '@/lib/dates'
import { useI18n } from '@/i18n'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { DashCard } from './DashCard'
import { cn } from '@/lib/cn'

const KIND_ICON: Record<ActivityKind, typeof BookOpen> = { lesson: BookOpen, quiz: HelpCircle, lab: FlaskConical, incident: MonitorCog }

export function Missions({ className }: { className?: string }) {
  const { d, l } = useI18n()
  const today = dayKey()
  const activity = useProgress((s) => s.activity[today])
  const claimed = useProgress((s) => s.claimedMissions[today])
  const claim = useProgress((s) => s.claimMission)
  const missions = missionsForDay(today)

  return (
    <DashCard title={d.dash.missions} icon={<Target size={14} />} className={className} action={<span className="font-mono text-[0.65rem] text-dim">{d.dash.resets}</span>}>
      <ul className="space-y-3">
        {missions.map((m, i) => {
          const Icon = KIND_ICON[m.kind]
          const count = Math.min(m.target, activity?.[m.kind] ?? 0)
          const done = count >= m.target
          const isClaimed = claimed?.includes(m.id) ?? false
          return (
            <li key={m.id} className={cn('rounded-2xl border p-3.5 transition-colors duration-500', isClaimed ? 'border-success/30 bg-success/5' : done ? 'border-cyan/40 bg-cyan-soft' : 'border-line bg-bg-2/40')}>
              <div className="flex items-center gap-3">
                <span className={cn('grid h-9 w-9 shrink-0 place-items-center rounded-xl', isClaimed ? 'bg-success/15 text-success' : 'bg-cyan-soft text-cyan')}>
                  {isClaimed ? <CheckCircle2 size={17} /> : <Icon size={17} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('truncate text-sm font-medium', isClaimed && 'text-muted line-through decoration-success/50')}>{l(m.title)}</p>
                  <p className="font-mono text-[0.68rem] text-dim">{count}/{m.target} · +{m.xp} XP</p>
                </div>
                <AnimatePresence mode="wait">
                  {done && !isClaimed ? (
                    <motion.button
                      key="claim"
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      onClick={() => claim(m.id)}
                      className="rounded-full bg-cyan px-3 py-1.5 text-xs font-semibold text-bg shadow-[0_0_18px_rgb(34_211_238/0.5)]"
                    >
                      {d.dash.claim}
                    </motion.button>
                  ) : isClaimed ? (
                    <motion.span key="ok" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }} className="font-mono text-[0.65rem] tracking-wider text-success uppercase">
                      {d.dash.claimed}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </div>
              {!isClaimed && <ProgressBar value={count / m.target} className="mt-3" delay={0.2 + i * 0.1} />}
            </li>
          )
        })}
      </ul>
    </DashCard>
  )
}
