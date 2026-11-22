import { useEffect, type RefObject } from 'react'

export interface Colors {
  bg: string
  bg2: string
  bg3: string
  text: string
  muted: string
  dim: string
  a1: string
  a2: string
  a3: string
  dark: boolean
}

export interface Pointer {
  /** -1..1 across the viewport, raw */
  x: number
  y: number
  /** smoothed */
  sx: number
  sy: number
  /** canvas-space px */
  px: number
  py: number
  /** px/frame velocity */
  vx: number
  vy: number
  inside: boolean
}

export interface SceneEnv {
  ctx: CanvasRenderingContext2D
  w: number
  h: number
  colors: Colors
  pointer: Pointer
  mobile: boolean
  variant?: string
}

export interface SceneInstance {
  frame: (t: number, dt: number) => void
  resize?: (w: number, h: number) => void
  dispose?: () => void
}

export type SceneFactory = (env: SceneEnv) => SceneInstance

export function readColors(): Colors {
  const css = getComputedStyle(document.documentElement)
  const g = (k: string) => css.getPropertyValue(k).trim()
  return {
    bg: g('--bg'), bg2: g('--bg-2'), bg3: g('--bg-3'), text: g('--text'), muted: g('--text-muted'), dim: g('--text-dim'),
    a1: g('--cyan'), a2: g('--blue'), a3: g('--purple'),
    dark: document.documentElement.dataset.theme !== 'light',
  }
}

/** '#rrggbb' + alpha → rgba() string. */
export function alpha(hex: string, a: number) {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16)
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`
}

/** Linear blend of two hex colours. */
export function mix(a: string, b: string, t: number) {
  const pa = parseInt(a.replace('#', ''), 16)
  const pb = parseInt(b.replace('#', ''), 16)
  const r = Math.round(((pa >> 16) & 255) * (1 - t) + ((pb >> 16) & 255) * t)
  const g = Math.round(((pa >> 8) & 255) * (1 - t) + ((pb >> 8) & 255) * t)
  const bl = Math.round((pa & 255) * (1 - t) + (pb & 255) * t)
  return `#${((1 << 24) | (r << 16) | (g << 8) | bl).toString(16).slice(1)}`
}

export const rand = (a: number, b: number) => a + Math.random() * (b - a)

/**
 * Mounts a 2D canvas scene: DPR-aware sizing, pointer tracking, paused when
 * off-screen / tab hidden, a single static frame under reduced motion.
 */
export function useCanvasScene(ref: RefObject<HTMLCanvasElement | null>, factory: SceneFactory, opts: { reduced: boolean; variant?: string }) {
  const { reduced, variant } = opts
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    const mobile = window.matchMedia('(max-width: 768px)').matches
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2)
    const pointer: Pointer = { x: 0, y: 0, sx: 0, sy: 0, px: -9999, py: -9999, vx: 0, vy: 0, inside: false }
    const env: SceneEnv = { ctx, w: 1, h: 1, colors: readColors(), pointer, mobile, variant }

    const size = () => {
      const w = Math.max(1, canvas.clientWidth)
      const h = Math.max(1, canvas.clientHeight)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      env.w = w
      env.h = h
    }
    size()
    const scene = factory(env)
    scene.resize?.(env.w, env.h)

    let visible = true
    let raf = 0
    let last = performance.now()
    const start = last
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      if (!visible || document.hidden) return
      pointer.sx += (pointer.x - pointer.sx) * 0.06
      pointer.sy += (pointer.y - pointer.sy) * 0.06
      scene.frame((now - start) / 1000, dt)
      pointer.vx *= 0.85
      pointer.vy *= 0.85
    }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      const px = e.clientX - r.left
      const py = e.clientY - r.top
      if (pointer.inside) {
        pointer.vx = px - pointer.px
        pointer.vy = py - pointer.py
      }
      pointer.px = px
      pointer.py = py
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
      pointer.inside = px >= 0 && py >= 0 && px <= r.width && py <= r.height
    }

    const ro = new ResizeObserver(() => {
      size()
      scene.resize?.(env.w, env.h)
      if (reduced) scene.frame(6, 0)
    })
    ro.observe(canvas)
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(canvas)

    if (reduced) {
      // Settle into a representative still frame.
      for (let i = 0; i < 90; i++) scene.frame(i / 15, 1 / 15)
    } else {
      window.addEventListener('pointermove', onMove, { passive: true })
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      ro.disconnect()
      io.disconnect()
      scene.dispose?.()
    }
  }, [ref, factory, reduced, variant])
}
