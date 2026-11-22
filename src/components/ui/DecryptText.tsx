import { useEffect, useRef, useState } from 'react'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

const GLYPHS = '01<>/\\|=+*#%$&@ABCDEF'

/**
 * Text that "decodes" from random glyphs into its final value, left to right.
 * Screen readers always get the final text via aria-label.
 */
export function DecryptText({ text, className, delay = 0, speed = 28, trigger = true }: {
  text: string
  className?: string
  delay?: number
  speed?: number
  trigger?: boolean
}) {
  const reduced = useReducedMotionPref()
  const [out, setOut] = useState(reduced ? text : '')
  const raf = useRef(0)

  useEffect(() => {
    if (reduced || !trigger) {
      setOut(reduced ? text : '')
      return
    }
    let start = 0
    const total = text.length
    const step = (t: number) => {
      if (!start) start = t
      const elapsed = t - start - delay * 1000
      if (elapsed < 0) {
        raf.current = requestAnimationFrame(step)
        return
      }
      const revealed = Math.min(total, Math.floor(elapsed / speed))
      let s = text.slice(0, revealed)
      for (let i = revealed; i < Math.min(total, revealed + 6); i++) {
        s += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      }
      setOut(s)
      if (revealed < total) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [text, delay, speed, reduced, trigger])

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out || ' '}</span>
    </span>
  )
}
