import { alpha, mix, rand, type SceneFactory } from './engine'

/** Synthwave: striped sunset, wireframe mountains, endless neon grid, twinkling stars. */
const synthwave: SceneFactory = (env) => {
  const { ctx } = env
  const c = env.colors
  let stars: { x: number; y: number; r: number; p: number }[] = []
  let peaks: number[][] = []

  const resize = () => {
    const { w, h } = env
    stars = Array.from({ length: env.mobile ? 50 : 110 }, () => ({ x: rand(0, w), y: rand(0, h * 0.5), r: rand(0.4, 1.6), p: rand(0, 6) }))
    peaks = [0, 1].map((k) => {
      const pts: number[] = []
      const n = 14
      for (let i = 0; i <= n; i++) pts.push(rand(0.04, k ? 0.11 : 0.17) * h * (i % 3 === 0 ? 1.4 : 1))
      return pts
    })
  }

  return {
    resize,
    frame(t) {
      const { w, h } = env
      const p = env.pointer
      const hz = h * 0.62
      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      // Sun with scrolling stripes (cut out), then glow + sky painted behind it.
      const R = Math.min(w * 0.22, h * 0.3)
      const cx = w * 0.66 - p.sx * 16
      const cy = hz - R * 0.32
      const sun = ctx.createLinearGradient(0, cy - R, 0, cy + R)
      sun.addColorStop(0, mix(c.a1, '#ffffff', 0.2))
      sun.addColorStop(0.55, c.a1)
      sun.addColorStop(1, c.a2)
      ctx.fillStyle = sun
      ctx.beginPath()
      ctx.arc(cx, cy, R, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalCompositeOperation = 'destination-out'
      const step = R / 7
      const off = (t * 10) % step
      for (let y = cy + R * 0.02 + off; y < cy + R; y += step) {
        const k = (y - cy) / R
        ctx.fillRect(cx - R, y, R * 2, 1 + k * step * 0.55)
      }
      ctx.globalCompositeOperation = 'destination-over'
      const glow = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 2.2)
      glow.addColorStop(0, alpha(c.a2, 0.4))
      glow.addColorStop(1, alpha(c.a2, 0))
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, hz)
      const sky = ctx.createLinearGradient(0, 0, 0, hz)
      sky.addColorStop(0, alpha(c.bg, 0))
      sky.addColorStop(0.55, alpha(c.a3, c.dark ? 0.35 : 0.25))
      sky.addColorStop(1, alpha(c.a2, c.dark ? 0.55 : 0.4))
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, hz)
      ctx.globalCompositeOperation = 'source-over'

      // Stars
      if (c.dark) {
        for (const s of stars) {
          ctx.fillStyle = `rgba(255,255,255,${0.35 + Math.sin(t * 2 + s.p) * 0.3})`
          ctx.fillRect(s.x - p.sx * 6, s.y, s.r, s.r)
        }
      }

      // Mountains (two wireframe ranges)
      peaks.forEach((pts, k) => {
        const shift = -p.sx * (k ? 10 : 22)
        const seg = (w + 80) / (pts.length - 1)
        ctx.beginPath()
        ctx.moveTo(-40 + shift, hz)
        pts.forEach((ph, i) => ctx.lineTo(-40 + shift + i * seg, hz - ph))
        ctx.lineTo(w + 40 + shift, hz)
        ctx.closePath()
        ctx.fillStyle = k ? mix(c.bg, c.a3, 0.18) : mix(c.bg2, '#000000', c.dark ? 0.2 : 0)
        ctx.fill()
        ctx.strokeStyle = alpha(k ? c.a3 : c.a2, 0.75)
        ctx.lineWidth = 1.2
        ctx.stroke()
        ctx.strokeStyle = alpha(c.a2, 0.25)
        ctx.lineWidth = 0.8
        pts.forEach((ph, i) => {
          const x = -40 + shift + i * seg
          ctx.beginPath()
          ctx.moveTo(x, hz - ph)
          ctx.lineTo(x + seg * 0.4, hz)
          ctx.stroke()
        })
      })

      // Ground + grid
      const ground = ctx.createLinearGradient(0, hz, 0, h)
      ground.addColorStop(0, mix(c.bg2, c.a3, 0.2))
      ground.addColorStop(1, c.bg)
      ctx.fillStyle = ground
      ctx.fillRect(0, hz, w, h - hz)

      const vx = w * 0.62 + p.sx * 60
      const gh = h - hz
      ctx.lineWidth = 1.2
      for (let i = -24; i <= 24; i++) {
        ctx.strokeStyle = alpha(c.a2, 0.55)
        ctx.beginPath()
        ctx.moveTo(vx + i * 6, hz)
        ctx.lineTo(vx + i * w * 0.09, h)
        ctx.stroke()
      }
      const K = 14
      const scroll = (t * 0.6) % 1
      for (let k = 0; k < K; k++) {
        const q = (k + scroll) / K
        const y = hz + gh * q ** 2.3
        ctx.strokeStyle = alpha(c.a2, 0.15 + q * 0.75)
        ctx.lineWidth = 0.6 + q * 1.6
        ctx.beginPath()
        ctx.moveTo(0, y)
        ctx.lineTo(w, y)
        ctx.stroke()
      }
      // horizon line
      const hl = ctx.createLinearGradient(0, 0, w, 0)
      hl.addColorStop(0, alpha(c.a2, 0))
      hl.addColorStop(0.5, alpha(mix(c.a1, '#ffffff', 0.3), 0.95))
      hl.addColorStop(1, alpha(c.a2, 0))
      ctx.fillStyle = hl
      ctx.fillRect(0, hz - 1, w, 2)
    },
  }
}

export default synthwave
