import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

const tones = {
  cyan: 'text-cyan bg-cyan-soft border-cyan/25',
  purple: 'text-purple bg-purple-soft border-purple/25',
  success: 'text-success bg-success/10 border-success/25',
  warning: 'text-warning bg-warning/10 border-warning/25',
  danger: 'text-danger bg-danger/10 border-danger/25',
  neutral: 'text-muted bg-surface border-line',
}

export function Chip({ children, tone = 'neutral', className, dot }: {
  children: ReactNode
  tone?: keyof typeof tones
  className?: string
  dot?: boolean
}) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-mono text-[0.68rem] tracking-wider uppercase', tones[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse-dot" />}
      {children}
    </span>
  )
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn('hud-label flex items-center gap-3', className)}>
      <span className="h-px w-8 bg-gradient-to-r from-cyan to-transparent" />
      {children}
    </p>
  )
}
