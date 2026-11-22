import { motion } from 'motion/react'
import { useId } from 'react'
import { cn } from '@/lib/cn'

/** Pill segmented control with a sliding active indicator. */
export function Segmented<T extends string>({ value, options, onChange, label, size = 'sm', className }: {
  value: T
  options: { value: T; label: string; title?: string }[]
  onChange: (v: T) => void
  label: string
  size?: 'sm' | 'md'
  className?: string
}) {
  const id = useId()
  return (
    <div role="radiogroup" aria-label={label} className={cn('glass relative inline-flex rounded-full p-1', className)}>
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            role="radio"
            aria-checked={active}
            title={o.title}
            onClick={() => onChange(o.value)}
            className={cn(
              'relative rounded-full font-mono font-medium tracking-wider transition-colors duration-300',
              size === 'sm' ? 'h-7 px-2.5 text-[0.7rem]' : 'h-9 px-4 text-xs',
              active ? 'text-on-accent' : 'text-muted hover:text-text',
            )}
          >
            {active && (
              <motion.span
                layoutId={`seg-${id}`}
                className="absolute inset-0 rounded-full bg-cyan shadow-[0_0_16px_rgb(var(--cyan-rgb)/0.5)]"
                transition={{ type: 'spring', stiffness: 420, damping: 34 }}
              />
            )}
            <span className="relative">{o.label}</span>
          </button>
        )
      })}
    </div>
  )
}
