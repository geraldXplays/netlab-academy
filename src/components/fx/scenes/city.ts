import { alpha, mix, rand, type SceneFactory } from './engine'

interface Win { x: number; y: number; w: number; h: number; col: string; phase: number; flicker: boolean }
interface Bld { x: number; w: number; h: number; wins: Win[]; antenna: boolean }
interface Layer { depth: number; blds: Bld[]; col: string }
interface Sign { bi: number; text: string; col: string; phase: number; vertical: boolean }

const SIGN_TEXT = ['NET', 'LAB', '24/7', 'ネット', 'SYS', 'VLAN', 'ラボ', 'PING']

/** Cyberpunk: layered neon skyline, signs, rain, flying traffic, hologram, glitch slices. */
const city: SceneFactory = (env) => {
  const { ctx } = env
  const c = env.colors
  let layers: Layer[] = []
  let signs: Sign[] = []
  let rain: { x: number; y: number; l: number; s: number }[] = []
  let cars: { x: number; y: number; s: number; col: string }[] = []
  let nextGlitch = 3
  const signFont = `600 13px ${getComputedStyle(document.documentElement).getPropertyValue('--id-font-display')}`

  const build = () => {
    const { w, h } = env
    const span = w + 120
    const winCols = [c.a1, c.a3, '#fcee0a', mix(c.a1, '#ffffff', 0.5)]
    layers = [0.25, 0.55, 1].map((depth, li) => {
      const blds: Bld[] = []
      let x = -60
      while (x < span) {
        const bw = rand(30, 80) * (0.6 + depth * 0.6)
        const bh = h * rand(0.18, 0.5) * (1.2 - li * 0.18)
        const wins: Win[] = []
        if (li > 0) {
          for (let wy = h - bh + 10; wy < h - 12; wy += 9 + li * 2) {
            for (let wx = 5; wx < bw - 6; wx += 7 + li * 2) {
              if (Math.random() < 0.28) {
                wins.push({ x: x + wx, y: wy, w: 3 + li, h: 2 + li, col: winCols[(Math.random() * winCols.length) | 0], phase: rand(0, 9), flicker: Math.random() < 0.06 })
              }
            }
          }
        }
        blds.push({ x, w: bw, h: bh, wins, antenna: Math.random() < 0.25 })
        x += bw + rand(2, 14)
      }
      const col = li === 0 ? mix(c.bg, c.a2, c.dark ? 0.3 : 0.25) : li === 1 ? mix(c.bg, c.a2, c.dark ? 0.14 : 0.18) : mix(c.bg2, '#000000', c.dark ? 0.35 : 0)
      return { depth, blds, col }
    })
    const front = layers[2].blds
    signs = Array.from({ length: Math.min(5, front.length) }, (_, i) => ({
      bi: Math.min(front.length - 1, 2 + i * Math.floor(front.length / 5)),
      text: SIGN_TEXT[i % SIGN_TEXT.length],
      col: i % 2 ? c.a3 : c.a1,
      phase: rand(0, 10),
      vertical: i % 2 === 0,
    }))
    rain = Array.from({ length: env.mobile ? 70 : 160 }, () => ({ x: rand(0, w), y: rand(0, h), l: rand(8, 22), s: rand(500, 900) }))
    cars = Array.from({ length: 6 }, (_, i) => ({ x: rand(0, w), y: h * rand(0.15, 0.45), s: rand(60, 160) * (i % 2 ? 1 : -1), col: i % 3 ? c.a1 : c.a3 }))
  }

  const glitch = () => {
    const cv = ctx.canvas
    const scale = cv.width / env.w
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    for (let i = 0; i < 5; i++) {
      const sy = Math.random() * cv.height
      const sh = rand(4, 28) * scale
      ctx.drawImage(cv, 0, sy, cv.width, sh, rand(-30, 30) * scale, sy, cv.width, sh)
    }
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = alpha(c.a3, 0.08)
    ctx.fillRect(0, Math.random() * cv.height, cv.width, 3 * scale)
    ctx.restore()
  }

  return {
    resize: build,
    frame(t, dt) {
      const { w, h } = env
      const p = env.pointer
      ctx.clearRect(0, 0, w, h)

      // Sky
      const sky = ctx.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, alpha(c.bg, 0))
      sky.addColorStop(0.55, alpha(c.a2, c.dark ? 0.16 : 0.12))
      sky.addColorStop(1, alpha(c.a3, c.dark ? 0.3 : 0.2))
      ctx.fillStyle = sky
      ctx.fillRect(0, 0, w, h)

      // Hologram globe
      const hx = w * 0.74 + p.sx * -18
      const hy = h * 0.28 + p.sy * -10
      const hr = Math.min(w, h) * 0.12
      ctx.strokeStyle = alpha(c.a1, 0.4 + Math.sin(t * 7) * 0.05)
      ctx.lineWidth = 1
      for (let i = 0; i < 6; i++) {
        ctx.beginPath()
        ctx.ellipse(hx, hy, Math.abs(Math.cos(t * 0.6 + (i * Math.PI) / 6)) * hr, hr, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath()
        ctx.ellipse(hx, hy + (i * hr) / 3, hr * Math.sqrt(1 - (i / 3) ** 2), hr * 0.12, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
      const beam = ctx.createLinearGradient(hx, hy + hr, hx, h * 0.7)
      beam.addColorStop(0, alpha(c.a1, 0.18))
      beam.addColorStop(1, alpha(c.a1, 0))
      ctx.fillStyle = beam
      ctx.beginPath()
      ctx.moveTo(hx - hr * 0.7, hy + hr * 0.7)
      ctx.lineTo(hx + hr * 0.7, hy + hr * 0.7)
      ctx.lineTo(hx + hr * 0.15, h * 0.7)
      ctx.lineTo(hx - hr * 0.15, h * 0.7)
      ctx.fill()

      // Flying traffic
      for (const car of cars) {
        car.x += car.s * dt
        if (car.x > w + 40) car.x = -40
        if (car.x < -40) car.x = w + 40
        const trail = ctx.createLinearGradient(car.x - car.s * 0.4, 0, car.x, 0)
        trail.addColorStop(0, alpha(car.col, 0))
        trail.addColorStop(1, alpha(car.col, 0.8))
        ctx.strokeStyle = trail
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(car.x - car.s * 0.4, car.y)
        ctx.lineTo(car.x, car.y)
        ctx.stroke()
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(car.x - 1.5, car.y - 1.5, 3, 3)
      }

      // Skyline layers
      layers.forEach((L, li) => {
        const off = -p.sx * 40 * L.depth - 30
        ctx.fillStyle = L.col
        for (const b of L.blds) {
          ctx.fillRect(b.x + off, h - b.h, b.w, b.h)
          if (b.antenna && li > 0) {
            ctx.fillRect(b.x + off + b.w / 2 - 1, h - b.h - 18, 2, 18)
            ctx.fillStyle = Math.sin(t * 4 + b.x) > 0 ? alpha(c.a3, 0.9) : alpha(c.a3, 0.2)
            ctx.fillRect(b.x + off + b.w / 2 - 2, h - b.h - 20, 4, 3)
            ctx.fillStyle = L.col
          }
        }
        for (const b of L.blds) {
          for (const wn of b.wins) {
            const on = wn.flicker ? Math.sin(t * 13 + wn.phase) > 0.2 : true
            if (!on) continue
            ctx.fillStyle = alpha(wn.col, li === 2 ? 0.85 : 0.5)
            ctx.fillRect(wn.x + off, wn.y, wn.w, wn.h)
          }
        }
        // Neon signs on the front layer
        if (li === 2) {
          ctx.font = signFont
          ctx.textAlign = 'center'
          for (const s of signs) {
            const b = L.blds[s.bi]
            if (!b) continue
            const on = Math.sin(t * 9 + s.phase) > -0.85 || Math.sin(t * 1.3 + s.phase) > 0
            const sx = b.x + off + b.w / 2
            const sy = h - b.h + 16
            const bw = s.vertical ? 22 : Math.max(40, s.text.length * 12)
            const bh = s.vertical ? s.text.length * 15 + 10 : 22
            ctx.strokeStyle = alpha(s.col, on ? 0.95 : 0.2)
            ctx.lineWidth = 2
            ctx.shadowColor = s.col
            ctx.shadowBlur = on ? 14 : 0
            ctx.strokeRect(sx - bw / 2, sy, bw, bh)
            ctx.fillStyle = alpha(s.col, on ? 1 : 0.25)
            if (s.vertical) [...s.text].forEach((ch, i) => ctx.fillText(ch, sx, sy + 18 + i * 15))
            else ctx.fillText(s.text, sx, sy + 16)
            ctx.shadowBlur = 0
          }
        }
      })

      // Street glow
      const street = ctx.createLinearGradient(0, h * 0.85, 0, h)
      street.addColorStop(0, alpha(c.a3, 0))
      street.addColorStop(1, alpha(c.a3, c.dark ? 0.25 : 0.15))
      ctx.fillStyle = street
      ctx.fillRect(0, h * 0.85, w, h * 0.15)

      // Rain
      ctx.strokeStyle = alpha(c.a1, c.dark ? 0.22 : 0.3)
      ctx.lineWidth = 1
      ctx.beginPath()
      for (const r of rain) {
        r.y += r.s * dt
        r.x -= r.s * dt * 0.18
        if (r.y > h) {
          r.y = -r.l
          r.x = rand(0, w + 100)
        }
        ctx.moveTo(r.x, r.y)
        ctx.lineTo(r.x - r.l * 0.18, r.y + r.l)
      }
      ctx.stroke()

      // Scanlines
      ctx.fillStyle = alpha(c.dark ? '#000000' : '#ffffff', 0.08)
      for (let y = (t * 30) % 4; y < h; y += 4) ctx.fillRect(0, y, w, 1)

      if (t > nextGlitch) {
        glitch()
        if (t > nextGlitch + 0.14) nextGlitch = t + rand(2.5, 6)
      }
    },
  }
}

export default city
