import { alpha, mix, rand, type SceneFactory } from './engine'

/** Glossy soap-bubble renderer (shared with the Solarpunk × Aero fusion). */
export function drawBubble(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, tint: string, iri: string) {
  const body = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, r * 0.1, x, y, r)
  body.addColorStop(0, 'rgba(255,255,255,0.04)')
  body.addColorStop(0.72, alpha(tint, 0.07))
  body.addColorStop(0.94, alpha(tint, 0.32))
  body.addColorStop(1, 'rgba(255,255,255,0.6)')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  // iridescent lower-right rim
  ctx.strokeStyle = alpha(iri, 0.45)
  ctx.lineWidth = Math.max(1, r * 0.06)
  ctx.beginPath()
  ctx.arc(x, y, r * 0.9, 0.1, 1.5)
  ctx.stroke()
  // main highlight
  ctx.save()
  ctx.translate(x - r * 0.38, y - r * 0.42)
  ctx.rotate(-0.65)
  const hl = ctx.createLinearGradient(0, -r * 0.2, 0, r * 0.2)
  hl.addColorStop(0, 'rgba(255,255,255,0.95)')
  hl.addColorStop(1, 'rgba(255,255,255,0.15)')
  ctx.fillStyle = hl
  ctx.beginPath()
  ctx.ellipse(0, 0, r * 0.34, r * 0.17, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.restore()
  ctx.fillStyle = 'rgba(255,255,255,0.55)'
  ctx.beginPath()
  ctx.arc(x + r * 0.45, y + r * 0.42, Math.max(1, r * 0.07), 0, Math.PI * 2)
  ctx.fill()
}

interface Bubble { x: number; y: number; r: number; depth: number; speed: number; phase: number; vx: number; vy: number }

/** Frutiger Aero: bright sky, sun bloom, aurora ribbons, glossy hills and rising bubbles. */
const bubbles: SceneFactory = (env) => {
  const { ctx } = env
  const c = env.colors
  const clean = env.variant === 'clean'
  let list: Bubble[] = []

  const make = (initial: boolean): Bubble => {
    const depth = rand(0.35, 1)
    return {
      x: rand(0, env.w),
      y: initial ? rand(0, env.h) : env.h + rand(30, 160),
      r: rand(10, clean ? 46 : 62) * depth,
      depth,
      speed: rand(18, 42),
      phase: rand(0, Math.PI * 2),
      vx: 0,
      vy: 0,
    }
  }

  const resize = () => {
    const n = Math.round((env.w * env.h) / (clean ? 52000 : 34000))
    list = Array.from({ length: Math.min(env.mobile ? 16 : 40, Math.max(8, n)) }, () => make(true))
  }

  const ribbon = (t: number, k: number) => {
    const { w, h } = env
    const base = h * (0.3 + k * 0.09)
    const y = (x: number) => base + Math.sin(x * 0.0035 + t * 0.25 + k * 1.7) * 46 + Math.sin(x * 0.011 - t * 0.4 + k) * 14
    const thick = 70 - k * 14
    const g = ctx.createLinearGradient(0, 0, w, 0)
    g.addColorStop(0, alpha(c.a1, 0))
    g.addColorStop(0.35, alpha(k === 1 ? c.a2 : c.a1, c.dark ? 0.16 : 0.2))
    g.addColorStop(0.75, alpha(c.a3, c.dark ? 0.14 : 0.18))
    g.addColorStop(1, alpha(c.a3, 0))
    ctx.fillStyle = g
    ctx.beginPath()
    for (let x = 0; x <= w; x += 16) ctx.lineTo(x, y(x))
    for (let x = w; x >= 0; x -= 16) ctx.lineTo(x, y(x) + thick + Math.sin(x * 0.006 + t * 0.3) * 18)
    ctx.closePath()
    ctx.fill()
  }

  const hill = (t: number, yBase: number, amp: number, freq: number, col: string, shift: number, gloss: boolean) => {
    const { w, h } = env
    const y = (x: number) => yBase + Math.sin(x * freq + shift + t * 0.03) * amp + Math.sin(x * freq * 2.3 + shift) * amp * 0.3
    const g = ctx.createLinearGradient(0, yBase - amp, 0, h)
    g.addColorStop(0, mix(col, '#ffffff', c.dark ? 0.1 : 0.35))
    g.addColorStop(1, mix(col, '#000000', c.dark ? 0.55 : 0.25))
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 12) ctx.lineTo(x, y(x))
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fill()
    if (gloss) {
      ctx.strokeStyle = `rgba(255,255,255,${c.dark ? 0.18 : 0.6})`
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let x = 0; x <= w; x += 12) ctx.lineTo(x, y(x) + 3)
      ctx.stroke()
    }
  }

  return {
    resize,
    frame(t, dt) {
      const { w, h } = env
      const p = env.pointer
      ctx.clearRect(0, 0, w, h)

      // Sky wash + sun bloom
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, alpha(c.a1, c.dark ? 0.18 : 0.22))
      sky.addColorStop(0.6, alpha(c.a3, c.dark ? 0.06 : 0.08))
      sky.addColorStop(1, alpha(c.bg, 0))
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)
      const sx = w * 0.78 + p.sx * -20
      const sy = h * 0.16 + p.sy * -10
      const sun = ctx.createRadialGradient(sx, sy, 0, sx, sy, Math.max(w, h) * 0.45)
      sun.addColorStop(0, c.dark ? alpha(c.a3, 0.35) : 'rgba(255,255,255,0.95)')
      sun.addColorStop(0.25, c.dark ? alpha(c.a1, 0.12) : 'rgba(255,255,255,0.35)')
      sun.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.fillStyle = sun
      ctx.fillRect(0, 0, w, h)
      // lens flare dots
      for (let i = 1; i <= 3; i++) {
        ctx.fillStyle = `rgba(255,255,255,${c.dark ? 0.04 : 0.18})`
        ctx.beginPath()
        ctx.arc(sx - (sx - w * 0.4) * i * 0.28, sy + (h * 0.6 - sy) * i * 0.28, 12 + i * 10, 0, Math.PI * 2)
        ctx.fill()
      }

      for (let k = 0; k < (clean ? 2 : 3); k++) ribbon(t, k)

      if (!clean) {
        hill(t, h * 0.84, 26, 0.004, c.a2, 0, false)
        hill(t, h * 0.9, 22, 0.0055, mix(c.a2, c.a1, 0.15), 2, true)
      }

      // Bubbles
      for (const b of list) {
        b.y -= (b.speed * b.depth + 6) * dt
        b.x += Math.sin(t * 0.8 + b.phase) * 12 * dt
        if (p.inside) {
          const dx = b.x - p.px
          const dy = b.y - p.py
          const d = Math.hypot(dx, dy)
          const reach = b.r + 120
          if (d < reach && d > 0.01) {
            const f = (1 - d / reach) * 420 * dt
            b.vx += (dx / d) * f
            b.vy += (dy / d) * f
          }
        }
        b.x += b.vx * dt * 10
        b.y += b.vy * dt * 10
        b.vx *= 0.92
        b.vy *= 0.92
        if (b.y < -b.r * 2 || b.x < -200 || b.x > w + 200) Object.assign(b, make(false))
        drawBubble(ctx, b.x + p.sx * -14 * b.depth, b.y, b.r, c.a1, c.a3)
      }
    },
  }
}

export default bubbles
