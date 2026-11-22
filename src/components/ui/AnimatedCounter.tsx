import { useEffect, useRef } from 'react'
import { animate, useInView } from 'motion/react'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

/** Counts from the previous value to `value` when visible. Uses tabular numerals to avoid jitter. */
export function AnimatedCounter({ value, duration = 1.6, className, format = (n: number) => Math.round(n).toLocaleString(document.documentElement.lang || undefined) }: {
  value: number
  duration?: number
  className?: string
  format?: (n: number) => string
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-40px' })
  const from = useRef(0)
  const reduced = useReducedMotionPref()

  useEffect(() => {
    const el = ref.current
    if (!el || !inView) return
    if (reduced) {
      el.textContent = format(value)
      from.current = value
      return
    }
    const controls = animate(from.current, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => (el.textContent = format(v)),
    })
    from.current = value
    return () => controls.stop()
  }, [value, inView, duration, format, reduced])

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {format(reduced ? value : 0)}
    </span>
  )
}
