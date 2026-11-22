import { alpha, mix, rand, type SceneFactory } from './engine'

const HUES = ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#f472b6']

/**
 * Space exploration: a star with six orbiting planets — one per level (L1–L6).
 * 'neon' variant (Cyberpunk × Space) renders holographic wireframe worlds.
 */
const space: SceneFactory = (env) => {
  const { ctx } = env
  const c = env.colors
  const neon = env.variant === 'neon'
  let stars: { x: number; y: number; r: number; d: number; p: number }[] = []
  let shooting: { x: number; y: number; vx: number; vy: number; life: number } | null = null
  let nextShoot = 2
  const font = "'JetBrains Mono Variable', monospace"
  const planets = HUES.map((hue, i) => ({
    hue: mix(hue, [c.a1, c.a2, c.a3][i % 3], 0.35),
    size: [9, 13, 16, 12, 20, 14][i],
    speed: 0.5 / (1 + i * 0.55),
    off: rand(0, Math.PI * 2),
    ring: i === 4,
  }))

  const resize = () => {
    const { w, h } = env
    stars = Array.from({ length: env.mobile ? 120 : 260 }, () => ({ x: rand(0, w), y: rand(0, h), r: rand(0.3, 1.6), d: rand(0.2, 1), p: rand(0, 6) }))
  }

  const drawPlanet = (x: number, y: number, r: number, hue: string, sunX: number, sunY: number, ring: boolean) => {
    if (neon) {
      ctx.strokeStyle = alpha(hue, 0.95)
      ctx.lineWidth = 1.2
      ctx.shadowColor = hue
      ctx.shadowBlur = 10
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.stroke()
      ctx.shadowBlur = 0
      ctx.lineWidth = 0.6
      for (let k = -2; k <= 2; k++) {
        ctx.beginPath()
        ctx.ellipse(x, y + (k * r) / 3, r * Math.sqrt(1 - (k / 3) ** 2), r * 0.15, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    } else {
      const ang = Math.atan2(sunY - y, sunX - x)
      const g = ctx.createRadialGradient(x + Math.cos(ang) * r * 0.5, y + Math.sin(ang) * r * 0.5, r * 0.1, x, y, r)
      g.addColorStop(0, mix(hue, '#ffffff', 0.45))
      g.addColorStop(0.6, hue)
      g.addColorStop(1, mix(hue, '#000000', 0.7))
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
    }
    if (ring) {
      ctx.strokeStyle = alpha(neon ? c.a3 : mix(hue, '#ffffff', 0.4), 0.75)
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.ellipse(x, y, r * 2, r * 0.55, -0.35, 0, Math.PI * 2)
      ctx.stroke()
    }
  }

  return {
    resize,
    frame(t, dt) {
      const { w, h } = env
      const p = env.pointer
      ctx.clearRect(0, 0, w, h)

      // Nebulae
      const neb = [[0.75, 0.3, c.a3], [0.55, 0.75, c.a2], [0.9, 0.7, c.a1]] as const
      for (const [fx, fy, col] of neb) {
        const nx = w * fx + p.sx * -10
        const ny = h * fy + p.sy * -10
        const g = ctx.createRadialGradient(nx, ny, 0, nx, ny, Math.max(w, h) * 0.35)
        g.addColorStop(0, alpha(col, c.dark ? 0.14 : 0.1))
        g.addColorStop(1, alpha(col, 0))
        ctx.fillStyle = g
        ctx.fillRect(0, 0, w, h)
      }

      // Stars with parallax
      for (const s of stars) {
        const a = (0.3 + Math.sin(t * 1.6 + s.p) * 0.25 + 0.3) * s.d
        ctx.fillStyle = c.dark ? `rgba(255,255,255,${a})` : alpha(c.text, a * 0.4)
        ctx.fillRect(s.x - p.sx * 26 * s.d, s.y - p.sy * 16 * s.d, s.r, s.r)
      }

      // Shooting star
      if (!shooting && t > nextShoot) {
        shooting = { x: rand(w * 0.3, w), y: rand(0, h * 0.3), vx: -rand(500, 800), vy: rand(200, 350), life: 1 }
        nextShoot = t + rand(3, 7)
      }
      if (shooting) {
        const s = shooting
        s.x += s.vx * dt
        s.y += s.vy * dt
        s.life -= dt * 1.2
        const g = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 0.15, s.y - s.vy * 0.15)
        g.addColorStop(0, alpha('#ffffff', s.life))
        g.addColorStop(1, alpha('#ffffff', 0))
        ctx.strokeStyle = g
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(s.x - s.vx * 0.15, s.y - s.vy * 0.15)
        ctx.stroke()
        if (s.life <= 0) shooting = null
      }

      // System
      const cx = (env.mobile ? w * 0.5 : w * 0.66) + p.sx * 18
      const cy = h * 0.5 + p.sy * 12
      const R = Math.min(env.mobile ? w * 0.5 : w * 0.44, h * 0.95)
      const tilt = -0.22
      const cosT = Math.cos(tilt)
      const sinT = Math.sin(tilt)

      const bodies = planets.map((pl, i) => {
        const rx = R * (0.24 + i * 0.13)
        const ry = rx * 0.36
        const a = t * pl.speed + pl.off
        const ex = Math.cos(a) * rx
        const ey = Math.sin(a) * ry
        return { i, pl, rx, ry, x: cx + ex * cosT - ey * sinT, y: cy + ex * sinT + ey * cosT, z: Math.sin(a) }
      })

      // Orbits
      bodies.forEach(({ rx, ry, i }) => {
        ctx.strokeStyle = neon ? alpha(i % 2 ? c.a3 : c.a1, 0.35) : alpha(c.text, c.dark ? 0.12 : 0.16)
        ctx.lineWidth = 1
        ctx.setLineDash(neon ? [] : [2, 5])
        ctx.beginPath()
        ctx.ellipse(cx, cy, rx, ry, tilt, 0, Math.PI * 2)
        ctx.stroke()
      })
      ctx.setLineDash([])

      const draw = (b: (typeof bodies)[number]) => {
        const r = b.pl.size * (1 + b.z * 0.18) * (env.mobile ? 0.8 : 1)
        drawPlanet(b.x, b.y, r, b.pl.hue, cx, cy, b.pl.ring)
        ctx.font = `600 10px ${font}`
        ctx.fillStyle = alpha(c.text, 0.7)
        ctx.textAlign = 'left'
        ctx.fillText(`L${b.i + 1}`, b.x + r + 6, b.y - r - 2)
      }
      bodies.filter((b) => b.z < 0).forEach(draw)

      // Star
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.32)
      glow.addColorStop(0, alpha(c.a1, 0.8))
      glow.addColorStop(0.25, alpha(c.a1, 0.25))
      glow.addColorStop(1, alpha(c.a1, 0))
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(cx, cy, R * 0.32, 0, Math.PI * 2)
      ctx.fill()
      if (neon) {
        ctx.strokeStyle = c.a1
        ctx.lineWidth = 2
        ctx.shadowColor = c.a1
        ctx.shadowBlur = 18
        ctx.beginPath()
        ctx.arc(cx, cy, 22 + Math.sin(t * 3) * 2, 0, Math.PI * 2)
        ctx.stroke()
        ctx.shadowBlur = 0
      } else {
        const core = ctx.createRadialGradient(cx - 6, cy - 6, 2, cx, cy, 26)
        core.addColorStop(0, '#fffdf0')
        core.addColorStop(0.5, mix(c.a1, '#ffffff', 0.4))
        core.addColorStop(1, c.a1)
        ctx.fillStyle = core
        ctx.beginPath()
        ctx.arc(cx, cy, 24, 0, Math.PI * 2)
        ctx.fill()
      }
      bodies.filter((b) => b.z >= 0).forEach(draw)

      if (neon) {
        ctx.fillStyle = alpha('#000000', 0.12)
        for (let y = (t * 24) % 3; y < h; y += 3) ctx.fillRect(0, y, w, 1)
      }
    },
  }
}

export default space
