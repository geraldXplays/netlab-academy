import { alpha, mix, rand, type SceneFactory } from './engine'

interface Gummy { x: number; y: number; vx: number; vy: number; r: number; col: string; sq: number; sqv: number; face: boolean; blink: number; rot: number; bean: boolean }
interface Sprinkle { x: number; y: number; vy: number; rot: number; vr: number; col: string; len: number }

/** Candy Land: bouncing jelly gummies with squash & stretch, faces, sprinkles. */
const gummies: SceneFactory = (env) => {
  const { ctx } = env
  const c = env.colors
  const is3d = env.variant === '3d'
  const palette = [c.a1, c.a2, c.a3, '#ffc94d', '#ff8a5c']
  let list: Gummy[] = []
  let sprinkles: Sprinkle[] = []
  let nextHop = 1

  const resize = () => {
    const { w, h } = env
    const n = env.mobile ? 6 : is3d ? 8 : 11
    list = Array.from({ length: n }, (_, i) => {
      const r = (is3d ? rand(42, 78) : rand(28, 60)) * (env.mobile ? 0.75 : 1)
      return {
        x: rand(r, w - r), y: rand(-h, h * 0.5), vx: rand(-60, 60), vy: 0, r,
        col: palette[i % palette.length], sq: 0, sqv: 0, face: i % 3 !== 1, blink: rand(0, 5), rot: rand(-0.4, 0.4), bean: i % 4 === 3,
      }
    })
    sprinkles = Array.from({ length: env.mobile ? 24 : 48 }, () => ({
      x: rand(0, w), y: rand(-h, h), vy: rand(30, 70), rot: rand(0, 6), vr: rand(-2, 2), col: palette[(Math.random() * palette.length) | 0], len: rand(8, 14),
    }))
  }

  const drawGummy = (g: Gummy, t: number, floor: number) => {
    const sx = 1 + g.sq * 0.35
    const sy = 1 - g.sq * 0.3
    // floor shadow
    const lift = Math.max(0, floor - (g.y + g.r))
    const sh = Math.max(0.15, 1 - lift / 300)
    ctx.fillStyle = alpha(c.dark ? '#000000' : mix(g.col, '#000000', 0.5), (is3d ? 0.22 : 0.12) * sh)
    ctx.beginPath()
    ctx.ellipse(g.x, floor - 2, g.r * 0.9 * sh * sx, g.r * 0.18 * sh, 0, 0, Math.PI * 2)
    ctx.fill()

    ctx.save()
    ctx.translate(g.x, g.y + g.r * (1 - sy))
    ctx.rotate(g.rot * (g.bean ? 1 : 0.2))
    ctx.scale(sx * (g.bean ? 1.25 : 1), sy * (g.bean ? 0.8 : 1))
    const r = g.r
    const body = ctx.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.05, 0, 0, r)
    body.addColorStop(0, mix(g.col, '#ffffff', is3d ? 0.7 : 0.55))
    body.addColorStop(0.5, g.col)
    body.addColorStop(1, mix(g.col, '#000000', is3d ? 0.38 : 0.22))
    ctx.globalAlpha = is3d ? 1 : 0.94
    ctx.fillStyle = body
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.globalAlpha = 1
    // inner translucency glow
    const inner = ctx.createRadialGradient(r * 0.2, r * 0.35, 0, r * 0.2, r * 0.35, r * 0.7)
    inner.addColorStop(0, alpha(mix(g.col, '#ffffff', 0.4), 0.5))
    inner.addColorStop(1, alpha(g.col, 0))
    ctx.fillStyle = inner
    ctx.fill()
    // highlights
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.beginPath()
    ctx.ellipse(-r * 0.38, -r * 0.45, r * 0.26, r * 0.13, -0.6, 0, Math.PI * 2)
    ctx.fill()
    ctx.beginPath()
    ctx.arc(-r * 0.05, -r * 0.62, r * 0.06, 0, Math.PI * 2)
    ctx.fill()
    if (is3d) {
      ctx.strokeStyle = alpha('#ffffff', 0.35)
      ctx.lineWidth = r * 0.06
      ctx.beginPath()
      ctx.arc(0, 0, r * 0.9, 2.2, 3.6)
      ctx.stroke()
    }
    // face
    if (g.face) {
      const blinking = (t + g.blink) % 4 < 0.12
      ctx.fillStyle = mix(g.col, '#000000', 0.65)
      const ey = -r * 0.02
      if (blinking) {
        ctx.fillRect(-r * 0.3, ey, r * 0.16, r * 0.04)
        ctx.fillRect(r * 0.14, ey, r * 0.16, r * 0.04)
      } else {
        ctx.beginPath()
        ctx.arc(-r * 0.22, ey, r * 0.08, 0, Math.PI * 2)
        ctx.arc(r * 0.22, ey, r * 0.08, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.strokeStyle = mix(g.col, '#000000', 0.65)
      ctx.lineWidth = Math.max(1.5, r * 0.05)
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.arc(0, r * 0.14, r * 0.14, 0.2, Math.PI - 0.2)
      ctx.stroke()
      ctx.fillStyle = alpha('#ff6b9a', 0.45)
      ctx.beginPath()
      ctx.ellipse(-r * 0.42, r * 0.16, r * 0.1, r * 0.06, 0, 0, Math.PI * 2)
      ctx.ellipse(r * 0.42, r * 0.16, r * 0.1, r * 0.06, 0, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  return {
    resize,
    frame(t, dt) {
      const { w, h } = env
      const p = env.pointer
      const floor = h - 18
      ctx.clearRect(0, 0, w, h)

      // Candy-floss clouds
      for (let i = 0; i < 3; i++) {
        const cx = w * (0.3 + i * 0.3) + Math.sin(t * 0.2 + i * 2) * 40
        const cy = h * (0.3 + (i % 2) * 0.3) + Math.cos(t * 0.17 + i) * 30
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.35)
        g.addColorStop(0, alpha(palette[i], c.dark ? 0.16 : 0.22))
        g.addColorStop(1, alpha(palette[i], 0))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }

      // Sprinkles
      for (const s of sprinkles) {
        s.y += s.vy * dt
        s.rot += s.vr * dt
        if (s.y > h + 20) {
          s.y = -20
          s.x = rand(0, w)
        }
        ctx.save()
        ctx.translate(s.x, s.y)
        ctx.rotate(s.rot)
        ctx.strokeStyle = s.col
        ctx.lineWidth = 4
        ctx.lineCap = 'round'
        ctx.beginPath()
        ctx.moveTo(-s.len / 2, 0)
        ctx.lineTo(s.len / 2, 0)
        ctx.stroke()
        ctx.restore()
      }

      // Occasional happy hop
      if (t > nextHop && list.length) {
        const g = list[(Math.random() * list.length) | 0]
        g.vy = -rand(420, 640)
        g.vx += rand(-120, 120)
        nextHop = t + rand(0.6, 1.6)
      }

      // Physics
      for (const g of list) {
        g.vy += 1100 * dt
        g.x += g.vx * dt
        g.y += g.vy * dt
        g.vx *= 0.995
        if (g.y + g.r > floor) {
          g.y = floor - g.r
          if (g.vy > 120) g.sqv += g.vy * 0.004
          g.vy *= -0.55
          g.vx *= 0.9
        }
        if (g.x - g.r < 0) { g.x = g.r; g.vx = Math.abs(g.vx) * 0.8 }
        if (g.x + g.r > w) { g.x = w - g.r; g.vx = -Math.abs(g.vx) * 0.8 }
        if (p.inside) {
          const dx = g.x - p.px
          const dy = g.y - p.py
          const d = Math.hypot(dx, dy)
          if (d < g.r + 70 && d > 0.01) {
            g.vx += (dx / d) * 1600 * dt + p.vx * 4
            g.vy += (dy / d) * 1600 * dt + p.vy * 4
            g.sqv += 0.02
          }
        }
        // jelly spring
        g.sqv += -g.sq * 60 * dt
        g.sqv *= 0.86
        g.sq += g.sqv
        g.sq = Math.max(-0.5, Math.min(0.6, g.sq))
      }
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i]
          const b = list[j]
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d = Math.hypot(dx, dy)
          const min = a.r + b.r
          if (d < min && d > 0.01) {
            const push = (min - d) / 2
            const nx = dx / d
            const ny = dy / d
            a.x -= nx * push
            a.y -= ny * push
            b.x += nx * push
            b.y += ny * push
            const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny
            if (rel < 0) {
              a.vx += rel * nx * 0.8
              a.vy += rel * ny * 0.8
              b.vx -= rel * nx * 0.8
              b.vy -= rel * ny * 0.8
              a.sqv += 0.03
              b.sqv += 0.03
            }
          }
        }
      }
      for (const g of [...list].sort((a, b) => a.y - b.y)) drawGummy(g, t, floor)
    },
  }
}

export default gummies
