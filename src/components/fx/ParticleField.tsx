import { useEffect, useRef } from 'react'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

/**
 * Lightweight 2D canvas: drifting nodes that link when close and lean
 * toward the pointer. Paused off-screen; static under reduced motion.
 */
export function ParticleField({ className, density = 0.00007, color = '34, 211, 238' }: {
  className?: string
  density?: number
  color?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotionPref()

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const dpr = Math.min(window.devicePixelRatio, 1.5)
    let w = 0
    let h = 0
    let pts: { x: number; y: number; vx: number; vy: number }[] = []
    const mouse = { x: -9999, y: -9999 }

    const seed = () => {
      w = canvas.clientWidth
      h = canvas.clientHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.min(110, Math.round(w * h * density))
      pts = Array.from({ length: n }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      const max = 120
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i]
        if (!reduced) {
          const dx = mouse.x - p.x
          const dy = mouse.y - p.y
          const dm = Math.hypot(dx, dy)
          if (dm < 160) {
            p.vx += (dx / dm) * 0.012
            p.vy += (dy / dm) * 0.012
          }
          p.vx *= 0.99
          p.vy *= 0.99
          p.x += p.vx
          p.y += p.vy
          if (p.x < 0 || p.x > w) p.vx *= -1
          if (p.y < 0 || p.y > h) p.vy *= -1
        }
        for (let j = i + 1; j < pts.length; j++) {
          const q = pts[j]
          const d = Math.hypot(p.x - q.x, p.y - q.y)
          if (d < max) {
            ctx.strokeStyle = `rgba(${color}, ${(1 - d / max) * 0.22})`
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.stroke()
          }
        }
        ctx.fillStyle = `rgba(${color}, 0.75)`
        ctx.beginPath()
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    seed()
    let raf = 0
    let visible = false
    const loop = () => {
      if (visible && !document.hidden) draw()
      raf = requestAnimationFrame(loop)
    }
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)
    const ro = new ResizeObserver(() => {
      seed()
      if (reduced) draw()
    })
    ro.observe(canvas)
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    if (reduced) draw()
    else {
      raf = requestAnimationFrame(loop)
      window.addEventListener('pointermove', onMove, { passive: true })
    }
    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      ro.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [density, color, reduced])

  return <canvas ref={ref} aria-hidden className={cn('pointer-events-none absolute inset-0 h-full w-full', className)} />
}
