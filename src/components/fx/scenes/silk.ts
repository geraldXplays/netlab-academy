import { alpha, type SceneFactory } from './engine'

/** Apple minimalism: a soft orb and a calm field of hairline silk waves the cursor ripples. */
const silk: SceneFactory = (env) => {
  const { ctx } = env
  const c = env.colors
  return {
    frame(t) {
      const { w, h } = env
      const p = env.pointer
      ctx.clearRect(0, 0, w, h)

      // Orb
      const ox = w * 0.7 + p.sx * 24
      const oy = h * 0.42 + p.sy * 16
      const R = Math.min(w, h) * 0.34
      const orb = ctx.createRadialGradient(ox - R * 0.3, oy - R * 0.35, R * 0.05, ox, oy, R)
      if (c.dark) {
        orb.addColorStop(0, alpha(c.a2, 0.28))
        orb.addColorStop(0.55, alpha(c.a1, 0.1))
        orb.addColorStop(1, alpha(c.a1, 0))
      } else {
        orb.addColorStop(0, 'rgba(255,255,255,1)')
        orb.addColorStop(0.5, alpha(c.bg3, 0.9))
        orb.addColorStop(0.85, alpha(c.a2, 0.12))
        orb.addColorStop(1, alpha(c.bg, 0))
      }
      ctx.fillStyle = orb
      ctx.beginPath()
      ctx.arc(ox, oy, R, 0, Math.PI * 2)
      ctx.fill()

      // Silk lines
      const n = env.mobile ? 26 : 44
      const top = h * 0.5
      const band = h * 0.42
      const grad = ctx.createLinearGradient(0, 0, w, 0)
      grad.addColorStop(0, alpha(c.text, 0))
      grad.addColorStop(0.45, alpha(c.a1, c.dark ? 0.45 : 0.35))
      grad.addColorStop(0.8, alpha(c.text, c.dark ? 0.25 : 0.2))
      grad.addColorStop(1, alpha(c.text, 0))
      ctx.strokeStyle = grad
      ctx.lineWidth = 0.8
      const px = p.inside ? p.px : w * (0.6 + p.sx * 0.2)
      for (let i = 0; i < n; i++) {
        const y0 = top + (i / n) * band
        ctx.beginPath()
        for (let x = 0; x <= w; x += 8) {
          const env1 = Math.sin((x / w) * Math.PI)
          const near = Math.exp(-((x - px) ** 2) / (2 * 140 ** 2))
          const y =
            y0 +
            Math.sin(x * 0.006 + t * 0.5 + i * 0.13) * 34 * env1 +
            Math.sin(x * 0.013 - t * 0.35 + i * 0.05) * 12 * env1 +
            near * Math.sin(t * 2.2 + i * 0.25) * 26
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }
    },
  }
}

export default silk
