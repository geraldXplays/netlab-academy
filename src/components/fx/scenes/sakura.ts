import { alpha, mix, rand, type SceneFactory } from './engine'

interface Petal { x: number; y: number; s: number; rot: number; vr: number; flip: number; vf: number; vy: number; drift: number }

/** Neo-Tokyo anime: dusk gradient, huge moon, city + lattice tower, speed streaks, sakura petals blown by the cursor. */
const sakura: SceneFactory = (env) => {
  const { ctx } = env
  const c = env.colors
  let petals: Petal[] = []
  let skyline: { x: number; w: number; h: number; lights: [number, number][] }[] = []
  let streaks: { y: number; x: number; len: number; life: number }[] = []
  let wind = 0
  let nextStreak = 1

  const resize = () => {
    const { w, h } = env
    petals = Array.from({ length: env.mobile ? 34 : 70 }, () => ({
      x: rand(-50, w), y: rand(-h, h), s: rand(5, 11), rot: rand(0, 6), vr: rand(-1.5, 1.5), flip: rand(0, 6), vf: rand(1.5, 4), vy: rand(28, 60), drift: rand(10, 40),
    }))
    skyline = []
    let x = -20
    while (x < w + 40) {
      const bw = rand(26, 70)
      const bh = h * rand(0.12, 0.3)
      const lights: [number, number][] = []
      for (let i = 0; i < bh / 14; i++) if (Math.random() < 0.45) lights.push([rand(4, bw - 6), rand(8, bh - 6)])
      skyline.push({ x, w: bw, h: bh, lights })
      x += bw + rand(0, 6)
    }
  }

  const petal = (pt: Petal) => {
    ctx.save()
    ctx.translate(pt.x, pt.y)
    ctx.rotate(pt.rot)
    ctx.scale(1, Math.cos(pt.flip))
    const s = pt.s
    const g = ctx.createLinearGradient(0, -s, 0, s)
    g.addColorStop(0, mix(c.a3, '#ffffff', 0.55))
    g.addColorStop(1, c.a3)
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.moveTo(0, s)
    ctx.bezierCurveTo(s * 0.95, s * 0.4, s * 0.8, -s * 0.7, s * 0.18, -s)
    ctx.lineTo(0, -s * 0.72)
    ctx.lineTo(-s * 0.18, -s)
    ctx.bezierCurveTo(-s * 0.8, -s * 0.7, -s * 0.95, s * 0.4, 0, s)
    ctx.fill()
    ctx.restore()
  }

  return {
    resize,
    frame(t, dt) {
      const { w, h } = env
      const p = env.pointer
      ctx.clearRect(0, 0, w, h)

      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, alpha(c.a1, c.dark ? 0.1 : 0.08))
      sky.addColorStop(0.5, alpha(c.a2, c.dark ? 0.2 : 0.14))
      sky.addColorStop(0.85, alpha(c.a3, c.dark ? 0.32 : 0.25))
      sky.addColorStop(1, alpha(c.a3, 0.1))
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      // Moon
      const mx = w * (env.mobile ? 0.7 : 0.8) + p.sx * -12
      const my = h * 0.24 + p.sy * -8
      const mr = Math.min(w, h) * 0.11
      const halo = ctx.createRadialGradient(mx, my, mr * 0.9, mx, my, mr * 2.6)
      halo.addColorStop(0, alpha(c.a3, 0.35))
      halo.addColorStop(1, alpha(c.a3, 0))
      ctx.fillStyle = halo
      ctx.fillRect(0, 0, w, h)
      const moon = ctx.createLinearGradient(mx, my - mr, mx, my + mr)
      moon.addColorStop(0, '#ffffff')
      moon.addColorStop(1, mix(c.a3, '#ffffff', 0.55))
      ctx.fillStyle = moon
      ctx.beginPath()
      ctx.arc(mx, my, mr, 0, Math.PI * 2)
      ctx.fill()
      ctx.strokeStyle = alpha('#ffffff', 0.25)
      ctx.lineWidth = 1
      for (let i = 1; i <= 2; i++) {
        ctx.beginPath()
        ctx.arc(mx, my, mr * (1 + i * 0.18) + Math.sin(t + i) * 3, 0, Math.PI * 2)
        ctx.stroke()
      }

      // Speed streaks (dramatic light lines)
      if (t > nextStreak) {
        streaks.push({ y: rand(h * 0.1, h * 0.7), x: w + 50, len: rand(150, 420), life: 1 })
        nextStreak = t + rand(0.4, 1.4)
      }
      streaks = streaks.filter((s) => s.life > 0)
      for (const s of streaks) {
        s.x -= 1800 * dt
        s.life -= dt * 0.9
        const g = ctx.createLinearGradient(s.x, 0, s.x + s.len, 0)
        g.addColorStop(0, alpha('#ffffff', 0.8 * s.life))
        g.addColorStop(1, alpha(c.a1, 0))
        ctx.strokeStyle = g
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x + s.len, s.y)
        ctx.stroke()
      }

      // Skyline
      const off = -p.sx * 20
      const base = mix(c.bg, c.a2, c.dark ? 0.12 : 0.25)
      ctx.fillStyle = base
      for (const b of skyline) ctx.fillRect(b.x + off, h - b.h, b.w, b.h)
      ctx.fillStyle = alpha(c.a1, 0.75)
      for (const b of skyline) for (const [lx, ly] of b.lights) ctx.fillRect(b.x + off + lx, h - b.h + ly, 2, 2)

      // Lattice tower
      const tx = w * 0.86 + off
      const th = h * 0.55
      ctx.strokeStyle = alpha(c.a3, 0.9)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(tx - th * 0.12, h)
      ctx.lineTo(tx, h - th)
      ctx.lineTo(tx + th * 0.12, h)
      for (let k = 1; k < 8; k++) {
        const y = h - (th * k) / 8
        const half = th * 0.12 * (1 - k / 8)
        ctx.moveTo(tx - half, y)
        ctx.lineTo(tx + half, y)
        ctx.lineTo(tx - half * 0.85, y - th / 8)
      }
      ctx.stroke()
      ctx.fillStyle = Math.sin(t * 3) > 0 ? c.a3 : alpha(c.a3, 0.3)
      ctx.beginPath()
      ctx.arc(tx, h - th - 4, 3, 0, Math.PI * 2)
      ctx.fill()

      // Petals with cursor wind
      wind += (p.vx * 6 - wind) * 0.05
      for (const pt of petals) {
        pt.y += pt.vy * dt
        pt.x += (pt.drift + wind) * dt + Math.sin(t + pt.flip) * 0.3
        pt.rot += pt.vr * dt
        pt.flip += pt.vf * dt
        if (p.inside) {
          const dx = pt.x - p.px
          const dy = pt.y - p.py
          const d = Math.hypot(dx, dy)
          if (d < 90 && d > 0.01) {
            pt.x += (dx / d) * 180 * dt
            pt.y += (dy / d) * 180 * dt
            pt.vr += 0.2
          }
        }
        pt.vr *= 0.99
        if (pt.y > h + 20 || pt.x > w + 40 || pt.x < -60) {
          pt.y = -20
          pt.x = rand(-60, w)
        }
        petal(pt)
      }
    },
  }
}

export default sakura
