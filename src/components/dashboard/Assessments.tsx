import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ClipboardCheck, Clock, Lock } from 'lucide-react'
import { ASSESSMENTS } from '@/content/assessments'
import { useProgress } from '@/store/progress'
import { useI18n } from '@/i18n'
import { Chip } from '@/components/ui/Chip'
import { DashCard } from './DashCard'

export function Assessments({ className }: { className?: string }) {
  const { d, f, l } = useI18n()
  const completed = useProgress((s) => s.completedLessons)
  const results = useProgress((s) => s.assessments)
  const list = ASSESSMENTS.filter((a) => a.levelId === 'foundations')
  return (
    <DashCard
      title={d.dash.assessments}
      icon={<ClipboardCheck size={14} />}
      className={className}
      action={<Link to="/assessments" className="font-mono text-[0.68rem] tracking-wider text-cyan uppercase hover:underline">{d.dash.viewAll}</Link>}
    >
      <ul className="divide-y divide-line">
        {list.slice(0, 5).map((a, i) => {
          const done = a.requires.filter((id) => completed[id]).length
          const ready = done === a.requires.length
          const res = results[a.id]
          return (
            <motion.li key={a.id} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 + i * 0.07 }}>
              <Link to={`/assessments/${a.id}`} className="flex items-center gap-3 py-3 transition-colors first:pt-0 hover:text-cyan">
                <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl ${res?.passed ? 'bg-success/15 text-success' : ready ? 'bg-cyan-soft text-cyan' : 'bg-bg-2 text-dim'}`}>
                  {res?.passed ? <CheckCircle2 size={16} /> : ready ? <ClipboardCheck size={16} /> : <Lock size={14} />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{l(a.title)}</p>
                  <p className="flex items-center gap-2 font-mono text-[0.66rem] text-dim">
                    {f(d.dash.questions, { n: a.questions })}
                    <span className="flex items-center gap-1"><Clock size={10} />{f(d.dash.minutes, { n: a.minutes })}</span>
                    {res && <span>· {Math.round(res.best * 100)}%</span>}
                  </p>
                  {!ready && <p className="text-[0.7rem] text-dim">{f(d.exam.requires, { d: done, t: a.requires.length })}</p>}
                </div>
                <Chip tone={a.kind === 'exam' ? 'purple' : a.kind === 'practical' ? 'warning' : 'cyan'}>{d.dash.kinds[a.kind]}</Chip>
              </Link>
            </motion.li>
          )
        })}
      </ul>
    </DashCard>
  )
}
