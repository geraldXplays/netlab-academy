import { motion } from 'motion/react'
import { ClipboardCheck, Clock, Lock } from 'lucide-react'
import { ASSESSMENTS } from '@/content/assessments'
import { useProgress } from '@/store/progress'
import { useI18n } from '@/i18n'
import { Chip } from '@/components/ui/Chip'
import { DashCard } from './DashCard'

export function Assessments({ className }: { className?: string }) {
  const { d, f, l } = useI18n()
  const completed = useProgress((s) => s.completedLessons)
  return (
    <DashCard title={d.dash.assessments} icon={<ClipboardCheck size={14} />} className={className}>
      <ul className="divide-y divide-line">
        {ASSESSMENTS.slice(0, 4).map((a, i) => {
          const ready = !!completed[a.unlockAfter]
          return (
            <motion.li
              key={a.id}
              className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 + i * 0.07 }}
            >
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${ready ? 'bg-cyan-soft text-cyan' : 'bg-bg-2 text-dim'}`}>
                {ready ? <ClipboardCheck size={16} /> : <Lock size={14} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{l(a.title)}</p>
                <p className="flex items-center gap-2 font-mono text-[0.66rem] text-dim">
                  {f(d.dash.questions, { n: a.questions })}
                  <span className="flex items-center gap-1"><Clock size={10} />{f(d.dash.minutes, { n: a.minutes })}</span>
                </p>
                {!ready && <p className="text-[0.7rem] text-dim">{f(d.dash.lockedUntil, { id: a.unlockAfter })}</p>}
              </div>
              <Chip tone={a.kind === 'exam' ? 'purple' : a.kind === 'practical' ? 'warning' : 'cyan'}>{d.dash.kinds[a.kind]}</Chip>
            </motion.li>
          )
        })}
      </ul>
    </DashCard>
  )
}
