import { motion } from 'motion/react'
import { cn } from '@/lib/cn'

export function ProgressBar({ value, className, tone = 'cyan', delay = 0 }: {
  value: number
  className?: string
  tone?: 'cyan' | 'purple' | 'success'
  delay?: number
}) {
  const v = Math.max(0, Math.min(1, value))
  const grad = {
    cyan: 'from-cyan to-blue',
    purple: 'from-purple to-blue',
    success: 'from-success to-cyan',
  }[tone]
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      className={cn('relative h-1.5 w-full overflow-hidden rounded-full bg-line-strong/60', className)}
    >
      <motion.div
        className={cn('absolute inset-y-0 left-0 rounded-full bg-gradient-to-r', grad)}
        initial={{ width: 0 }}
        whileInView={{ width: `${v * 100}%` }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="absolute inset-y-0 right-0 w-6 bg-white/60 blur-[6px]" />
      </motion.div>
    </div>
  )
}
