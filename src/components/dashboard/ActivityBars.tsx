import { motion } from 'motion/react'
import { useProgress } from '@/store/progress'
import { lastDays, dayKey } from '@/lib/dates'
import { useI18n } from '@/i18n'

/** 14-day activity column chart (sum of all learning events per day). */
export function ActivityBars() {
  const { d, lang } = useI18n()
  const activity = useProgress((s) => s.activity)
  const days = lastDays(14)
  const totals = days.map((k) => Object.values(activity[k] ?? {}).reduce((a, b) => a + (b ?? 0), 0))
  const max = Math.max(4, ...totals)
  const today = dayKey()
  return (
    <div>
      <p className="hud-label mb-3">{d.dash.activity}</p>
      <div className="flex h-20 items-end gap-1.5" role="img" aria-label={d.dash.activity}>
        {days.map((k, i) => {
          const v = totals[i]
          const [y, m, dd] = k.split('-').map(Number)
          const label = new Date(y, m - 1, dd).toLocaleDateString(lang, { weekday: 'narrow' })
          return (
            <div key={k} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <motion.div
                title={`${k}: ${v}`}
                className={`w-full rounded-sm ${v ? (k === today ? 'bg-cyan shadow-[0_0_10px_var(--cyan)]' : 'bg-gradient-to-t from-blue/50 to-cyan/80') : 'bg-line-strong'}`}
                initial={{ height: 0 }}
                whileInView={{ height: `${Math.max(6, (v / max) * 100)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: 0.3 + i * 0.035, ease: [0.16, 1, 0.3, 1] }}
              />
              <span className={`font-mono text-[0.55rem] ${k === today ? 'text-cyan' : 'text-dim'}`}>{label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
