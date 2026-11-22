import { alpha, rand, type SceneFactory } from './engine'

const NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI']

/**
 * Dark Academia: an engraved gold astrolabe whose rings carry the six levels
 * (I–VI); a network of nodes is inked between the rings, then pulses travel it.
 */
const academia: SceneFactory = (env) => {
  const { ctx } = env
  const c = env.colors
  const minimal = env.variant === 'minimal'
  const gold = c.dark ? c.a1 : c.a2
  const ink = c.dark ? c.a2 : c.a1
  const displayFont = getComputedStyle(document.documentElement).getPropertyValue('--id-font-display')
  let dust: { x: number; y: number; s: number; r: number; p: number }[] = []
  let stars: { x: number; y: number; s: number; p: number }[] = []

  // Network nodes in polar coordinates (ring index, angle)
  const nodes = Array.from({ length: minimal ? 7 : 10 }, (_, i) => ({ ring: 1 + (i % 3), a: (i / (minimal ? 7 : 10)) * Math.PI * 2 + rand(-0.2, 0.2) }))
  const edges: [number, number, number][] = []
  nodes.forEach((_, i) => {
    edges.push([i, (i + 1) % nodes.length, 0.4 + i * 0.25])
    if (i % 2 === 0) edges.push([i, (i + 3) % nodes.length, 1.6 + i * 0.2])
  })

  const resize = () => {
    const { w, h } = env
    dust = Array.from({ length: minimal ? 0 : env.mobile ? 18 : 40 }, () => ({ x: rand(0, w), y: rand(0, h), s: rand(4, 14), r: rand(0.5, 1.8), p: rand(0, 6) }))
    stars = Array.from({ length: minimal ? 6 : 16 }, () => ({ x: rand(0, w), y: rand(0, h), s: rand(2, 5), p: rand(0, 6) }))
  }

  const star4 = (x: number, y: number, s: number, a: number) => {
    ctx.fillStyle = alpha(gold, a)
    ctx.beginPath()
    ctx.moveTo(x, y - s)
    ctx.quadraticCurveTo(x, y, x + s, y)
    ctx.quadraticCurveTo(x, y, x, y + s)
    ctx.quadraticCurveTo(x, y, x - s, y)
    ctx.quadraticCurveTo(x, y, x, y - s)
    ctx.fill()
  }

  return {
    resize,
    frame(t, dt) {
      const { w, h } = env
      const p = env.pointer
      ctx.clearRect(0, 0, w, h)
      const cx = (env.mobile ? w * 0.5 : w * 0.62) + p.sx * 14
      const cy = h * 0.5 + p.sy * 10
      const R = Math.min(env.mobile ? w * 0.46 : w * 0.34, h * 0.42)
      const radii = minimal ? [1, 0.72, 0.44] : [1, 0.84, 0.64, 0.44, 0.24]
      const lw = minimal ? 0.8 : 1

      // vignette glow
      const v = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.4)
      v.addColorStop(0, alpha(gold, c.dark ? 0.1 : 0.12))
      v.addColorStop(1, alpha(gold, 0))
      ctx.fillStyle = v
      ctx.fillRect(0, 0, w, h)

      for (const s of stars) star4(s.x, s.y, s.s, 0.25 + Math.sin(t * 1.5 + s.p) * 0.2)

      // Rings
      radii.forEach((f, k) => {
        const r = R * f
        const rot = t * (k % 2 ? -0.05 : 0.07) * (1 + k * 0.3) + p.sx * 0.15 * (k + 1)
        ctx.strokeStyle = alpha(gold, k === 0 ? 0.75 : 0.45)
        ctx.lineWidth = lw
        ctx.beginPath()
        ctx.arc(cx, cy, r, 0, Math.PI * 2)
        ctx.stroke()
        if (k === 0) {
          ctx.beginPath()
          ctx.arc(cx, cy, r - 6, 0, Math.PI * 2)
          ctx.stroke()
        }
        if (k === 0 || k === 2) {
          const ticks = minimal ? 36 : 72
          for (let i = 0; i < ticks; i++) {
            const a = rot + (i / ticks) * Math.PI * 2
            const len = i % 6 === 0 ? 10 : 4
            ctx.beginPath()
            ctx.moveTo(cx + Math.cos(a) * (r - 6), cy + Math.sin(a) * (r - 6))
            ctx.lineTo(cx + Math.cos(a) * (r - 6 - len), cy + Math.sin(a) * (r - 6 - len))
            ctx.stroke()
          }
        }
        if (k === 1) {
          ctx.font = `600 ${Math.max(12, R * 0.07)}px ${displayFont}`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          NUMERALS.forEach((n, i) => {
            const a = rot + (i / 6) * Math.PI * 2
            ctx.fillStyle = alpha(gold, 0.9)
            ctx.fillText(n, cx + Math.cos(a) * r, cy + Math.sin(a) * r)
          })
        }
        if (k === 3 && !minimal) {
          ctx.strokeStyle = alpha(ink, 0.8)
          ctx.lineWidth = 3
          ctx.beginPath()
          ctx.arc(cx, cy, r, rot, rot + 1.1)
          ctx.stroke()
          ctx.beginPath()
          ctx.arc(cx, cy, r, rot + Math.PI, rot + Math.PI + 0.6)
          ctx.stroke()
        }
      })

      // Crosshair meridians
      ctx.strokeStyle = alpha(gold, 0.18)
      ctx.lineWidth = lw
      for (let i = 0; i < 4; i++) {
        const a = t * 0.02 + (i * Math.PI) / 4
        ctx.beginPath()
        ctx.moveTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R)
        ctx.lineTo(cx - Math.cos(a) * R, cy - Math.sin(a) * R)
        ctx.stroke()
      }

      // Network: node positions rotate with their ring
      const pos = nodes.map((n) => {
        const r = R * radii[Math.min(n.ring, radii.length - 1)]
        const a = n.a + t * (n.ring % 2 ? -0.05 : 0.07) * (1 + n.ring * 0.3) + p.sx * 0.15 * (n.ring + 1)
        return [cx + Math.cos(a) * r, cy + Math.sin(a) * r] as const
      })
      for (const [i, j, start] of edges) {
        const prog = Math.max(0, Math.min(1, (t - start) / 1.4))
        if (!prog) continue
        const [x1, y1] = pos[i]
        const [x2, y2] = pos[j]
        ctx.strokeStyle = alpha(ink, c.dark ? 0.75 : 0.65)
        ctx.lineWidth = minimal ? 0.9 : 1.2
        ctx.beginPath()
        ctx.moveTo(x1, y1)
        ctx.lineTo(x1 + (x2 - x1) * prog, y1 + (y2 - y1) * prog)
        ctx.stroke()
        if (prog === 1) {
          const q = (t * 0.35 + start) % 1
          ctx.fillStyle = alpha(gold, 0.95)
          ctx.beginPath()
          ctx.arc(x1 + (x2 - x1) * q, y1 + (y2 - y1) * q, 2.2, 0, Math.PI * 2)
          ctx.fill()
        }
      }
      for (const [x, y] of pos) {
        ctx.fillStyle = c.bg
        ctx.strokeStyle = alpha(gold, 0.95)
        ctx.lineWidth = 1.4
        ctx.beginPath()
        ctx.arc(x, y, 4.5, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }

      // Centre emblem
      ctx.strokeStyle = alpha(gold, 0.95)
      ctx.lineWidth = 1.4
      ctx.beginPath()
      for (let i = 0; i <= 6; i++) {
        const a = -Math.PI / 2 + (i * Math.PI) / 3 + t * 0.1
        const x = cx + Math.cos(a) * R * 0.1
        const y = cy + Math.sin(a) * R * 0.1
        if (i) ctx.lineTo(x, y)
        else ctx.moveTo(x, y)
      }
      ctx.stroke()
      ctx.fillStyle = alpha(ink, 0.95)
      ctx.beginPath()
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2)
      ctx.fill()

      // Dust motes in lamplight
      for (const d of dust) {
        d.y -= d.s * dt
        d.x += Math.sin(t * 0.5 + d.p) * 6 * dt
        if (d.y < -4) {
          d.y = h + 4
          d.x = rand(0, w)
        }
        ctx.fillStyle = alpha(gold, 0.25 + Math.sin(t + d.p) * 0.15)
        ctx.beginPath()
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2)
        ctx.fill()
      }
    },
  }
}

export default academia
