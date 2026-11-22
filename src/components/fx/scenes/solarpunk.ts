import { alpha, mix, rand, type SceneFactory } from './engine'
import { drawBubble } from './bubbles'

interface Seg { x1: number; y1: number; x2: number; y2: number; t0: number; depth: number; leaf: boolean; flower: boolean; phase: number }

/** Solarpunk: rotating sun rays, plant-covered towers, turbines, growing vines and drifting seeds. */
const solarpunk: SceneFactory = (env) => {
  const { ctx } = env
  const c = env.colors
  const withBubbles = env.variant === 'bubbles'
  const sunCol = withBubbles ? c.a3 : c.a2
  let segs: Seg[] = []
  let seeds: { x: number; y: number; vx: number; vy: number; p: number }[] = []
  let bubbles: { x: number; y: number; r: number; s: number; p: number }[] = []

  const grow = (x: number, y: number, ang: number, len: number, depth: number, t0: number) => {
    if (depth > 6 || len < 8) return
    const x2 = x + Math.cos(ang) * len
    const y2 = y + Math.sin(ang) * len
    segs.push({ x1: x, y1: y, x2, y2, t0, depth, leaf: depth > 1 && Math.random() < 0.7, flower: depth > 4 && Math.random() < 0.3, phase: rand(0, 6) })
    const dur = 0.35
    grow(x2, y2, ang + rand(-0.35, 0.35), len * rand(0.82, 0.95), depth + 1, t0 + dur)
    if (Math.random() < 0.45) grow(x2, y2, ang + rand(0.5, 0.9) * (Math.random() < 0.5 ? -1 : 1), len * 0.65, depth + 2, t0 + dur)
  }

  const resize = () => {
    const { w, h } = env
    segs = []
    const startX = env.mobile ? 0.2 : 0.5
    const roots = env.mobile ? 4 : 7
    for (let i = 0; i < roots; i++) grow(w * (startX + (i / roots) * (1 - startX)) + rand(-20, 20), h + 4, -Math.PI / 2 + rand(-0.4, 0.4), rand(38, 60), 0, i * 0.25)
    for (let i = 0; i < 3; i++) grow(w + 4, h * (0.3 + i * 0.2), Math.PI + rand(-0.3, 0.3), rand(30, 45), 1, 0.6 + i * 0.3)
    seeds = Array.from({ length: env.mobile ? 12 : 24 }, () => ({ x: rand(0, w), y: rand(0, h), vx: rand(8, 22), vy: rand(-14, -4), p: rand(0, 6) }))
    bubbles = withBubbles ? Array.from({ length: env.mobile ? 6 : 12 }, () => ({ x: rand(w * 0.3, w), y: rand(0, h), r: rand(10, 34), s: rand(14, 30), p: rand(0, 6) })) : []
  }

  const leaf = (x: number, y: number, ang: number, size: number) => {
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(ang)
    const g = ctx.createLinearGradient(0, -size, 0, size)
    g.addColorStop(0, mix(c.a1, '#ffffff', 0.25))
    g.addColorStop(1, mix(c.a1, '#000000', 0.25))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.quadraticCurveTo(size * 0.6, -size * 0.5, size * 1.4, 0)
    ctx.quadraticCurveTo(size * 0.6, size * 0.5, 0, 0)
    ctx.fill()
    ctx.strokeStyle = alpha('#ffffff', 0.35)
    ctx.lineWidth = 0.6
    ctx.beginPath()
    ctx.moveTo(0, 0)
    ctx.lineTo(size * 1.2, 0)
    ctx.stroke()
    ctx.restore()
  }

  const tower = (x: number, wd: number, ht: number, h: number, t: number) => {
    ctx.fillStyle = alpha(c.dark ? c.bg2 : '#ffffff', c.dark ? 0.8 : 0.65)
    ctx.strokeStyle = alpha(c.a3, 0.7)
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.roundRect(x - wd / 2, h - ht, wd, ht + 10, [wd / 2, wd / 2, 0, 0])
    ctx.fill()
    ctx.stroke()
    for (let y = h - ht + wd * 0.6; y < h - 10; y += 26) {
      ctx.strokeStyle = alpha(c.a3, 0.35)
      ctx.beginPath()
      ctx.moveTo(x - wd / 2, y)
      ctx.lineTo(x + wd / 2, y)
      ctx.stroke()
      // planter shrubs on each terrace
      for (let k = -1; k <= 1; k++) {
        const bx = x + k * wd * 0.28
        const sway = Math.sin(t * 1.2 + y + k) * 1.2
        ctx.fillStyle = mix(c.a1, k ? '#000000' : '#ffffff', 0.15)
        ctx.beginPath()
        ctx.arc(bx + sway, y - 5, 5.5, 0, Math.PI * 2)
        ctx.arc(bx - 4 + sway, y - 3, 4, 0, Math.PI * 2)
        ctx.arc(bx + 4 + sway, y - 3, 4, 0, Math.PI * 2)
        ctx.fill()
      }
      leaf(x + wd / 2 - 2, y + 4, 0.5 + Math.sin(t + y) * 0.15, 6)
    }
    ctx.fillStyle = alpha(c.a2, 0.7)
    for (let y = h - ht + wd * 0.6 + 12; y < h - 14; y += 26) ctx.fillRect(x - wd * 0.15, y, wd * 0.3, 4)
  }

  const turbine = (x: number, y: number, s: number, t: number) => {
    ctx.strokeStyle = alpha(c.text, 0.45)
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x, y + s * 2.2)
    ctx.stroke()
    ctx.fillStyle = alpha(c.text, 0.55)
    for (let i = 0; i < 3; i++) {
      const a = t * 1.4 + (i * Math.PI * 2) / 3
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(a)
      ctx.beginPath()
      ctx.ellipse(s * 0.55, 0, s * 0.55, s * 0.08, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }
  }

  return {
    resize,
    frame(t, dt) {
      const { w, h } = env
      const p = env.pointer
      ctx.clearRect(0, 0, w, h)

      // Sun + rays
      const sx = w * 0.84 + p.sx * -14
      const sy = h * 0.17 + p.sy * -8
      ctx.save()
      ctx.translate(sx, sy)
      ctx.rotate(t * 0.05)
      for (let i = 0; i < 14; i++) {
        ctx.rotate((Math.PI * 2) / 14)
        const g = ctx.createLinearGradient(0, 0, Math.max(w, h) * 0.6, 0)
        g.addColorStop(0, alpha(sunCol, c.dark ? 0.16 : 0.22))
        g.addColorStop(1, alpha(sunCol, 0))
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(Math.max(w, h) * 0.6, -40)
        ctx.lineTo(Math.max(w, h) * 0.6, 40)
        ctx.fill()
      }
      ctx.restore()
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, 70)
      sun.addColorStop(0, '#fffbe6')
      sun.addColorStop(0.45, sunCol)
      sun.addColorStop(1, alpha(sunCol, 0))
      ctx.fillStyle = sun
      ctx.beginPath()
      ctx.arc(sx, sy, 70, 0, Math.PI * 2)
      ctx.fill()

      // Hills
      const hill = (yb: number, amp: number, col: string, sh: number) => {
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.moveTo(0, h)
        for (let x = 0; x <= w; x += 14) ctx.lineTo(x, yb + Math.sin(x * 0.005 + sh) * amp + Math.sin(x * 0.013) * amp * 0.3)
        ctx.lineTo(w, h)
        ctx.fill()
      }
      hill(h * 0.8, 22, alpha(mix(c.a1, c.a3, 0.4), c.dark ? 0.35 : 0.28), 1)

      // Towers & turbines (right side)
      const base = h * 0.92
      if (!env.mobile) {
        turbine(w * 0.58, h * 0.52, 30, t)
        turbine(w * 0.66, h * 0.58, 22, t * 1.2 + 1)
      }
      tower(w * 0.72 + p.sx * -8, 54, h * 0.42, base, t)
      tower(w * 0.86 + p.sx * -8, 70, h * 0.56, base, t)
      tower(w * 0.97 + p.sx * -8, 46, h * 0.34, base, t)
      hill(h * 0.9, 16, alpha(c.a1, c.dark ? 0.55 : 0.45), 3)

      // Vines
      ctx.lineCap = 'round'
      const speed = 1.1
      for (const s of segs) {
        const prog = Math.max(0, Math.min(1, (t * speed - s.t0) / 0.35))
        if (!prog) continue
        const sway = Math.sin(t * 0.9 + s.phase) * s.depth * 0.6
        const x2 = s.x1 + (s.x2 - s.x1) * prog + sway
        const y2 = s.y1 + (s.y2 - s.y1) * prog
        ctx.strokeStyle = mix(c.a1, '#000000', 0.25)
        ctx.lineWidth = Math.max(1, 5 - s.depth * 0.7)
        ctx.beginPath()
        ctx.moveTo(s.x1, s.y1)
        ctx.lineTo(x2, y2)
        ctx.stroke()
        if (prog === 1) {
          const ang = Math.atan2(s.y2 - s.y1, s.x2 - s.x1)
          if (s.leaf) leaf(x2, y2, ang + 0.9 + Math.sin(t * 1.3 + s.phase) * 0.2, 9 - s.depth * 0.5)
          if (s.flower) {
            ctx.fillStyle = c.a2
            for (let k = 0; k < 5; k++) {
              const a = (k * Math.PI * 2) / 5 + t * 0.2
              ctx.beginPath()
              ctx.arc(x2 + Math.cos(a) * 4, y2 + Math.sin(a) * 4, 3, 0, Math.PI * 2)
              ctx.fill()
            }
            ctx.fillStyle = '#fff7d6'
            ctx.beginPath()
            ctx.arc(x2, y2, 2.4, 0, Math.PI * 2)
            ctx.fill()
          }
        }
      }

      // Bubbles (Solarpunk × Aero)
      for (const b of bubbles) {
        b.y -= b.s * dt
        b.x += Math.sin(t + b.p) * 10 * dt
        if (b.y < -40) {
          b.y = h + 40
          b.x = rand(w * 0.3, w)
        }
        drawBubble(ctx, b.x, b.y, b.r, c.a2, c.a1)
      }

      // Dandelion seeds
      ctx.strokeStyle = alpha(c.dark ? '#ffffff' : c.text, 0.45)
      ctx.lineWidth = 0.7
      for (const s of seeds) {
        s.x += (s.vx + p.vx * 2) * dt
        s.y += (s.vy + Math.sin(t + s.p) * 6) * dt
        if (p.inside) {
          const dx = s.x - p.px
          const dy = s.y - p.py
          const d = Math.hypot(dx, dy)
          if (d < 100 && d > 0.01) {
            s.x += (dx / d) * 120 * dt
            s.y += (dy / d) * 120 * dt
          }
        }
        if (s.x > w + 20 || s.y < -20) {
          s.x = rand(-20, w * 0.6)
          s.y = h + 10
        }
        ctx.beginPath()
        for (let k = 0; k < 8; k++) {
          const a = (k * Math.PI) / 4 + s.p
          ctx.moveTo(s.x, s.y)
          ctx.lineTo(s.x + Math.cos(a) * 6, s.y + Math.sin(a) * 6)
        }
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - 2, s.y + 10)
        ctx.stroke()
      }
    },
  }
}

export default solarpunk
