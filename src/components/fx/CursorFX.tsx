import { useEffect, useRef } from 'react'
import { useSettings } from '@/store/settings'
import { identityById, type CursorStyle } from '@/themes/identities'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { readColors, alpha } from './scenes/engine'

interface P { x: number; y: number; vx: number; vy: number; life: number; max: number; size: number; rot: number; vr: number; col: string; kind: 'trail' | 'burst' }

/**
 * Global cursor layer (fine pointers only, off under reduced motion):
 *  - a lagging ring that grows over interactive elements,
 *  - an identity-themed particle trail,
 *  - a burst of themed sparks on click.
 * The particle loop sleeps whenever nothing is alive.
 */
export function CursorFX() {
  const identityId = useSettings((s) => s.identity)
  const theme = useSettings((s) => s.theme)
  const reduced = useReducedMotionPref()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ring = ringRef.current
    const dot = dotRef.current
    if (!canvas || !ring || !dot || reduced || !window.matchMedia('(pointer: fine)').matches) return
    const ctx = canvas.getContext('2d')!
    const style: CursorStyle = identityById(identityId).cursor
    const c = readColors()
    const cols = [c.a1, c.a2, c.a3]
    const dpr = Math.min(window.devicePixelRatio, 2)
    const size = () => {
      canvas.width = innerWidth * dpr
      canvas.height = innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    size()
    window.addEventListener('resize', size)

    const parts: P[] = []
    const mouse = { x: -100, y: -100, rx: -100, ry: -100, lx: -100, ly: -100, hover: false, down: false }
    let raf = 0
    let running = false
    let acc = 0

    const spawn = (x: number, y: number, kind: P['kind'], speed: number) => {
      const a = Math.random() * Math.PI * 2
      const v = kind === 'burst' ? speed * (0.5 + Math.random()) : speed * Math.random()
      const life = kind === 'burst' ? 0.6 + Math.random() * 0.4 : 0.5 + Math.random() * 0.5
      parts.push({
        x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - (style === 'bubble' ? 30 : 0), life, max: life,
        size: style === 'pixel' ? 4 + ((Math.random() * 3) | 0) * 2 : 2 + Math.random() * (style === 'bubble' ? 7 : 4),
        rot: Math.random() * 6, vr: (Math.random() - 0.5) * 6, col: cols[(Math.random() * 3) | 0], kind,
      })
      if (parts.length > 220) parts.shift()
    }

    const drawP = (p: P) => {
      const k = p.life / p.max
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      switch (style) {
        case 'bubble':
          ctx.strokeStyle = alpha('#ffffff', 0.8 * k)
          ctx.fillStyle = alpha(p.col, 0.15 * k)
          ctx.beginPath()
          ctx.arc(0, 0, p.size, 0, Math.PI * 2)
          ctx.fill()
          ctx.stroke()
          ctx.fillStyle = alpha('#ffffff', 0.9 * k)
          ctx.beginPath()
          ctx.arc(-p.size * 0.35, -p.size * 0.35, p.size * 0.25, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'candy':
          ctx.strokeStyle = alpha(p.col, k)
          ctx.lineWidth = 3.5
          ctx.lineCap = 'round'
          ctx.beginPath()
          ctx.moveTo(-p.size, 0)
          ctx.lineTo(p.size, 0)
          ctx.stroke()
          break
        case 'pixel':
          ctx.rotate(-p.rot)
          ctx.fillStyle = alpha(p.col, k)
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size)
          break
        case 'petal':
          ctx.fillStyle = alpha(c.a3, k)
          ctx.beginPath()
          ctx.ellipse(0, 0, p.size * 1.4, p.size * 0.8, 0, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'leaf':
          ctx.fillStyle = alpha(c.a1, k)
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.quadraticCurveTo(p.size * 1.2, -p.size, p.size * 2.4, 0)
          ctx.quadraticCurveTo(p.size * 1.2, p.size, 0, 0)
          ctx.fill()
          break
        case 'star': {
          const s = p.size * 1.3
          ctx.fillStyle = alpha(p.kind === 'burst' ? p.col : '#ffffff', k)
          ctx.beginPath()
          ctx.moveTo(0, -s)
          ctx.quadraticCurveTo(0, 0, s, 0)
          ctx.quadraticCurveTo(0, 0, 0, s)
          ctx.quadraticCurveTo(0, 0, -s, 0)
          ctx.quadraticCurveTo(0, 0, 0, -s)
          ctx.fill()
          break
        }
        case 'ink':
          ctx.fillStyle = alpha(c.a1, 0.8 * k)
          ctx.beginPath()
          ctx.arc(0, 0, p.size * 0.6, 0, Math.PI * 2)
          ctx.fill()
          break
        case 'neon':
        case 'retro':
        case 'spark':
        case 'minimal':
        default:
          ctx.strokeStyle = alpha(p.col, k)
          ctx.lineWidth = style === 'minimal' ? 1 : 1.6
          ctx.shadowColor = p.col
          ctx.shadowBlur = style === 'neon' || style === 'retro' ? 8 : 0
          ctx.beginPath()
          ctx.moveTo(0, 0)
          ctx.lineTo(-p.vx * 0.04, -p.vy * 0.04)
          ctx.stroke()
          ctx.fillStyle = alpha(p.col, k)
          ctx.fillRect(-1, -1, 2, 2)
      }
      ctx.restore()
    }

    const tick = () => {
      const dt = 1 / 60
      mouse.rx += (mouse.x - mouse.rx) * 0.18
      mouse.ry += (mouse.y - mouse.ry) * 0.18
      const scale = mouse.down ? 0.7 : mouse.hover ? 1.8 : 1
      ring.style.transform = `translate3d(${mouse.rx}px, ${mouse.ry}px, 0) translate(-50%, -50%) scale(${scale})`
      dot.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -50%)`

      ctx.clearRect(0, 0, innerWidth, innerHeight)
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i]
        p.life -= dt
        if (p.life <= 0) {
          parts.splice(i, 1)
          continue
        }
        const grav = style === 'bubble' ? -40 : style === 'petal' || style === 'leaf' ? 30 : style === 'candy' || style === 'pixel' ? 260 : 0
        p.vy += grav * dt
        p.vx *= 0.96
        p.vy *= 0.96
        p.x += p.vx * dt
        p.y += p.vy * dt
        p.rot += p.vr * dt
        drawP(p)
      }
      const settled = Math.abs(mouse.x - mouse.rx) < 0.3 && Math.abs(mouse.y - mouse.ry) < 0.3
      if (parts.length === 0 && settled) {
        running = false
        return
      }
      raf = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!running) {
        running = true
        raf = requestAnimationFrame(tick)
      }
    }

    const interactive = 'a, button, [role="button"], [role="radio"], input, select, textarea, label'
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mouse.x = e.clientX
      mouse.y = e.clientY
      ring.style.opacity = '1'
      dot.style.opacity = '1'
      mouse.hover = !!(e.target as Element | null)?.closest?.(interactive)
      const dist = Math.hypot(mouse.x - mouse.lx, mouse.y - mouse.ly)
      acc += dist
      const every = style === 'minimal' ? 9999 : style === 'bubble' ? 38 : style === 'pixel' ? 16 : 22
      while (acc > every) {
        acc -= every
        spawn(mouse.x, mouse.y, 'trail', 40)
      }
      mouse.lx = mouse.x
      mouse.ly = mouse.y
      wake()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      mouse.down = true
      const n = style === 'minimal' ? 8 : 16
      for (let i = 0; i < n; i++) spawn(e.clientX, e.clientY, 'burst', style === 'minimal' ? 140 : 260)
      wake()
    }
    const onUp = () => {
      mouse.down = false
      wake()
    }
    const onLeave = () => {
      ring.style.opacity = '0'
      dot.style.opacity = '0'
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerdown', onDown, { passive: true })
    window.addEventListener('pointerup', onUp, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', size)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      ctx.clearRect(0, 0, innerWidth, innerHeight)
    }
  }, [identityId, theme, reduced])

  if (reduced) return null
  return (
    <>
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none fixed inset-0 z-[90] h-full w-full" />
      <div ref={ringRef} aria-hidden className="cursor-ring pointer-events-none fixed top-0 left-0 z-[91] h-8 w-8 rounded-full border border-cyan/70 opacity-0 transition-[opacity,width,height,border-color] duration-200 [@media(pointer:coarse)]:hidden" />
      <div ref={dotRef} aria-hidden className="cursor-dot pointer-events-none fixed top-0 left-0 z-[91] h-1.5 w-1.5 rounded-full bg-cyan opacity-0 [@media(pointer:coarse)]:hidden" />
    </>
  )
}
