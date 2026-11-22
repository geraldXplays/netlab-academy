import { useRef, type ReactNode, type HTMLAttributes } from 'react'
import { cn } from '@/lib/cn'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  tilt?: boolean
  glow?: 'cyan' | 'purple' | 'blue'
}

const glowColor = { cyan: 'var(--cyan-rgb)', purple: 'var(--purple-rgb)', blue: 'var(--blue-rgb)' }

/**
 * Glass card with a pointer-following spotlight and optional 3D tilt.
 * Pointer position is written to CSS variables — no React re-renders.
 */
export function SpotlightCard({ children, className, tilt, glow = 'cyan', style, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotionPref()

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current
    if (!el || e.pointerType !== 'mouse') return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top
    el.style.setProperty('--mx', `${x}px`)
    el.style.setProperty('--my', `${y}px`)
    if (tilt && !reduced) {
      const rx = ((y / r.height) - 0.5) * -6
      const ry = ((x / r.width) - 0.5) * 8
      el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg)`
    }
  }
  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--mx', `-400px`)
    el.style.setProperty('--my', `-400px`)
    if (tilt) el.style.transform = ''
  }

  return (
    <div
      ref={ref}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      style={{ '--mx': '-400px', '--my': '-400px', '--glow': glowColor[glow], ...style } as React.CSSProperties}
      className={cn(
        'group/card glass relative overflow-hidden rounded-2xl transition-[transform,border-color] duration-300 ease-out hover:border-line-strong',
        tilt && 'will-change-transform [transform-style:preserve-3d]',
        className,
      )}
      {...rest}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{ background: 'radial-gradient(420px circle at var(--mx) var(--my), rgb(var(--glow) / 0.13), transparent 60%)' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/card:opacity-100"
        style={{
          padding: 1,
          background: 'radial-gradient(260px circle at var(--mx) var(--my), rgb(var(--glow) / 0.65), transparent 70%)',
          mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
          maskComposite: 'exclude',
          WebkitMaskComposite: 'xor',
        }}
      />
      <div className="relative h-full">{children}</div>
    </div>
  )
}
