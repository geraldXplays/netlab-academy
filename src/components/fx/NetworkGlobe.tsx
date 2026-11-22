import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { gsap } from '@/lib/gsap'
import type { Theme } from '@/store/settings'

interface Props {
  theme: Theme
  reduced: boolean
  className?: string
}

const POINT_VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  uniform float uProgress;
  uniform float uPixelRatio;
  uniform float uTime;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec3 p = position * (0.55 + 0.45 * uProgress);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    float twinkle = 0.85 + 0.15 * sin(uTime * 2.0 + position.x * 7.0 + position.y * 3.0);
    gl_PointSize = aSize * uPixelRatio * (260.0 / -mv.z) * uProgress * twinkle;
    // Back-facing nodes fade so the sphere reads as 3D.
    vAlpha = smoothstep(-9.5, -5.0, mv.z) * uProgress;
    vColor = aColor;
  }
`

const POINT_FRAG = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float halo = smoothstep(0.5, 0.0, d);
    float core = smoothstep(0.16, 0.0, d);
    vec3 col = vColor * halo + vec3(1.0) * core * 0.8;
    gl_FragColor = vec4(col, (halo * 0.55 + core) * vAlpha * uOpacity);
  }
`

function fibonacciSphere(n: number, r: number) {
  const pts: THREE.Vector3[] = []
  const phi = Math.PI * (3 - Math.sqrt(5))
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const rad = Math.sqrt(1 - y * y)
    const th = phi * i
    // small jitter so it doesn't look machine-perfect
    const j = 1 + (Math.sin(i * 12.9898) * 43758.5453 % 1) * 0.04
    pts.push(new THREE.Vector3(Math.cos(th) * rad * r * j, y * r * j, Math.sin(th) * rad * r * j))
  }
  return pts
}

/**
 * Hero visual: a rotating sphere of network nodes, nearest-neighbour links
 * and packets travelling along them, with an orbit ring and dust field.
 */
export default function NetworkGlobe({ theme, reduced, className }: Props) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return

    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
    } catch {
      return // No WebGL: the CSS glow behind the hero remains.
    }

    const light = theme === 'light'
    const mobile = window.matchMedia('(max-width: 768px)').matches
    const dpr = Math.min(window.devicePixelRatio, mobile ? 1.5 : 1.75)
    renderer.setPixelRatio(dpr)
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)
    renderer.domElement.style.width = '100%'
    renderer.domElement.style.height = '100%'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100)
    camera.position.set(0, 0, 8.2)

    const root = new THREE.Group()
    root.rotation.set(0.35, -0.6, 0.12)
    scene.add(root)

    const blending = light ? THREE.NormalBlending : THREE.AdditiveBlending
    const css = getComputedStyle(document.documentElement)
    const cA = new THREE.Color(css.getPropertyValue('--cyan').trim() || '#22d3ee')
    const cB = new THREE.Color(css.getPropertyValue('--blue').trim() || '#3b82f6')
    const cC = new THREE.Color(css.getPropertyValue('--purple').trim() || '#a855f7')

    const uniforms = {
      uProgress: { value: reduced ? 1 : 0 },
      uPixelRatio: { value: dpr },
      uTime: { value: 0 },
      uOpacity: { value: light ? 0.95 : 1 },
    }

    /* ---------- Nodes ---------- */
    const R = 2.45
    const N = mobile ? 150 : 240
    const nodes = fibonacciSphere(N, R)
    const nodeGeo = new THREE.BufferGeometry().setFromPoints(nodes)
    const nodeColors = new Float32Array(N * 3)
    const nodeSizes = new Float32Array(N)
    nodes.forEach((p, i) => {
      const t = (p.y / R + 1) / 2
      const c = t > 0.5 ? cA.clone().lerp(cB, (t - 0.5) * 2) : cC.clone().lerp(cA, t * 2)
      c.toArray(nodeColors, i * 3)
      nodeSizes[i] = i % 17 === 0 ? 0.34 : 0.1 + ((i * 7) % 10) / 100
    })
    nodeGeo.setAttribute('aColor', new THREE.BufferAttribute(nodeColors, 3))
    nodeGeo.setAttribute('aSize', new THREE.BufferAttribute(nodeSizes, 1))
    const pointMat = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: POINT_VERT,
      fragmentShader: POINT_FRAG,
      transparent: true,
      depthWrite: false,
      blending,
    })
    root.add(new THREE.Points(nodeGeo, pointMat))

    /* ---------- Links (k nearest neighbours) ---------- */
    const edges: [number, number][] = []
    const seen = new Set<string>()
    nodes.forEach((p, i) => {
      const near = nodes
        .map((q, j) => ({ j, d: p.distanceToSquared(q) }))
        .filter((x) => x.j !== i)
        .sort((a, b) => a.d - b.d)
        .slice(0, 3)
      near.forEach(({ j }) => {
        const key = i < j ? `${i}-${j}` : `${j}-${i}`
        if (!seen.has(key)) {
          seen.add(key)
          edges.push([i, j])
        }
      })
    })
    const linePos = new Float32Array(edges.length * 6)
    const lineCol = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], k) => {
      nodes[a].toArray(linePos, k * 6)
      nodes[b].toArray(linePos, k * 6 + 3)
      nodeColors.slice(a * 3, a * 3 + 3).forEach((v, n) => (lineCol[k * 6 + n] = v))
      nodeColors.slice(b * 3, b * 3 + 3).forEach((v, n) => (lineCol[k * 6 + 3 + n] = v))
    })
    const lineGeo = new THREE.BufferGeometry()
    lineGeo.setAttribute('position', new THREE.BufferAttribute(linePos, 3))
    lineGeo.setAttribute('color', new THREE.BufferAttribute(lineCol, 3))
    const lineMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending,
    })
    root.add(new THREE.LineSegments(lineGeo, lineMat))

    /* ---------- Long-haul arcs (backbone links across the sphere) ---------- */
    const arcGroup = new THREE.Group()
    const arcMats: THREE.LineBasicMaterial[] = []
    for (let k = 0; k < (mobile ? 5 : 9); k++) {
      const a = nodes[(k * 37) % N]
      const b = nodes[(k * 91 + 50) % N]
      const mid = a.clone().add(b).multiplyScalar(0.5)
      mid.setLength(R * (1.35 + (k % 3) * 0.12))
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b)
      const g = new THREE.BufferGeometry().setFromPoints(curve.getPoints(48))
      const mat = new THREE.LineBasicMaterial({ color: k % 2 ? cC : cA, transparent: true, opacity: 0, depthWrite: false, blending })
      arcMats.push(mat)
      arcGroup.add(new THREE.Line(g, mat))
    }
    root.add(arcGroup)

    /* ---------- Packets ---------- */
    const P = mobile ? 40 : 80
    const packetGeo = new THREE.BufferGeometry()
    const packetPos = new Float32Array(P * 3)
    const packetCol = new Float32Array(P * 3)
    const packetSize = new Float32Array(P).fill(0.26)
    const packets = Array.from({ length: P }, (_, i) => ({
      edge: (i * 53) % edges.length,
      t: Math.random(),
      speed: 0.25 + Math.random() * 0.6,
      dir: Math.random() > 0.5 ? 1 : -1,
    }))
    for (let i = 0; i < P; i++) (i % 5 === 0 ? cC : light ? cB : cA.clone().lerp(new THREE.Color('#ffffff'), 0.7)).toArray(packetCol, i * 3)
    packetGeo.setAttribute('position', new THREE.BufferAttribute(packetPos, 3))
    packetGeo.setAttribute('aColor', new THREE.BufferAttribute(packetCol, 3))
    packetGeo.setAttribute('aSize', new THREE.BufferAttribute(packetSize, 1))
    root.add(new THREE.Points(packetGeo, pointMat))

    const tmpA = new THREE.Vector3()
    const updatePackets = (dt: number) => {
      packets.forEach((p, i) => {
        p.t += dt * p.speed
        if (p.t >= 1) {
          // hop to an adjacent edge from the arrival node → packets "route" through the mesh
          const [a, b] = edges[p.edge]
          const at = p.dir === 1 ? b : a
          const next = edges.findIndex((e, idx) => idx !== p.edge && (e[0] === at || e[1] === at) && Math.random() > 0.35)
          p.edge = next >= 0 ? next : (p.edge * 7 + 13) % edges.length
          p.dir = edges[p.edge][0] === at ? 1 : -1
          p.t = 0
        }
        const [a, b] = edges[p.edge]
        const from = p.dir === 1 ? nodes[a] : nodes[b]
        const to = p.dir === 1 ? nodes[b] : nodes[a]
        tmpA.copy(from).lerp(to, p.t)
        tmpA.toArray(packetPos, i * 3)
      })
      packetGeo.attributes.position.needsUpdate = true
    }
    updatePackets(0)

    /* ---------- Core + orbit rings ---------- */
    const core = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.IcosahedronGeometry(1.05, 1)),
      new THREE.LineBasicMaterial({ color: cA, transparent: true, opacity: 0, blending, depthWrite: false }),
    )
    root.add(core)

    const ringMat = new THREE.MeshBasicMaterial({ color: cA, transparent: true, opacity: 0, blending, depthWrite: false, side: THREE.DoubleSide })
    const ring = new THREE.Mesh(new THREE.RingGeometry(3.25, 3.27, 160), ringMat)
    ring.rotation.x = Math.PI / 2.25
    scene.add(ring)
    const ring2Mat = ringMat.clone()
    ring2Mat.color = cC
    const ring2 = new THREE.Mesh(new THREE.RingGeometry(3.7, 3.71, 160), ring2Mat)
    ring2.rotation.set(Math.PI / 1.8, 0.4, 0)
    scene.add(ring2)

    // Satellite riding the ring
    const satGeo = new THREE.BufferGeometry()
    satGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(3), 3))
    satGeo.setAttribute('aColor', new THREE.BufferAttribute(new Float32Array(cA.toArray()), 3))
    satGeo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array([0.5]), 1))
    const sat = new THREE.Points(satGeo, pointMat)
    ring.add(sat)

    /* ---------- Dust ---------- */
    const D = mobile ? 220 : 500
    const dustPos = new Float32Array(D * 3)
    for (let i = 0; i < D; i++) {
      const v = new THREE.Vector3().randomDirection().multiplyScalar(4 + Math.random() * 6)
      v.toArray(dustPos, i * 3)
    }
    const dustGeo = new THREE.BufferGeometry()
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPos, 3))
    const dustMat = new THREE.PointsMaterial({
      size: 0.025,
      color: light ? css.getPropertyValue('--text-dim').trim() : cA.clone().lerp(new THREE.Color('#ffffff'), 0.5),
      transparent: true,
      opacity: 0,
      depthWrite: false,
      blending,
    })
    const dust = new THREE.Points(dustGeo, dustMat)
    scene.add(dust)

    /* ---------- Sizing ---------- */
    const resize = () => {
      const { clientWidth: w, clientHeight: h } = el
      if (!w || !h) return
      renderer.setSize(w, h, false)
      camera.aspect = w / h
      camera.position.z = w / h < 0.9 ? 11 : 9.2
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    /* ---------- Entrance ---------- */
    const fade = { lines: reduced ? 1 : 0 }
    const applyFade = () => {
      lineMat.opacity = (light ? 0.35 : 0.28) * fade.lines
      arcMats.forEach((m) => (m.opacity = (light ? 0.4 : 0.5) * fade.lines))
      core.material.opacity = 0.18 * fade.lines
      ringMat.opacity = 0.3 * fade.lines
      ring2Mat.opacity = 0.16 * fade.lines
      dustMat.opacity = (light ? 0.45 : 0.6) * fade.lines
    }
    applyFade()
    const intro = reduced
      ? null
      : gsap
          .timeline({ delay: 0.25 })
          .to(uniforms.uProgress, { value: 1, duration: 2.6, ease: 'expo.out' })
          .to(fade, { lines: 1, duration: 2.2, ease: 'power2.out', onUpdate: applyFade }, 0.5)

    /* ---------- Interaction ---------- */
    const pointer = { x: 0, y: 0 }
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    if (!reduced) window.addEventListener('pointermove', onPointer, { passive: true })

    /* ---------- Loop (paused when off-screen or tab hidden) ---------- */
    let visible = true
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), { threshold: 0 })
    io.observe(el)

    const start = performance.now()
    let last = start
    let spin = 0
    const render = () => {
      const nowMs = performance.now()
      const dt = Math.min((nowMs - last) / 1000, 0.05)
      last = nowMs
      if (!visible || document.hidden) return
      const t = (nowMs - start) / 1000
      uniforms.uTime.value = t
      spin += dt * 0.08
      root.rotation.y = -0.6 + spin + pointer.x * 0.25
      root.rotation.x += (0.35 + pointer.y * 0.18 - root.rotation.x) * 0.04
      core.rotation.y -= dt * 0.3
      core.rotation.z += dt * 0.12
      ring.rotation.z += dt * 0.05
      ring2.rotation.z -= dt * 0.035
      dust.rotation.y += dt * 0.01
      const a = t * 0.5
      sat.position.set(Math.cos(a) * 3.26, Math.sin(a) * 3.26, 0)
      updatePackets(dt)
      renderer.render(scene, camera)
    }

    if (reduced) {
      renderer.render(scene, camera)
    } else {
      gsap.ticker.add(render)
    }

    return () => {
      gsap.ticker.remove(render)
      intro?.kill()
      window.removeEventListener('pointermove', onPointer)
      ro.disconnect()
      io.disconnect()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mat = m.material as THREE.Material | THREE.Material[] | undefined
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose())
        else mat?.dispose()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [theme, reduced])

  return <div ref={host} className={className} aria-hidden />
}
