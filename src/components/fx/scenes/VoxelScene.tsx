import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { readColors } from './engine'

/**
 * Voxel World: a floating block island with miniature server racks (blinking
 * LEDs), a router, trees, a pond, data packets running along cables and
 * drifting voxel clouds. Instanced meshes keep it to a handful of draw calls.
 */
export default function VoxelScene({ reduced, className }: { reduced: boolean; className?: string }) {
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      return
    }
    const c = readColors()
    const mobile = window.matchMedia('(max-width: 768px)').matches
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1.5 : 2))
    renderer.setClearColor(0x000000, 0)
    el.appendChild(renderer.domElement)
    Object.assign(renderer.domElement.style, { width: '100%', height: '100%' })

    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100)
    camera.position.set(14, 12, 14)
    camera.lookAt(0, 0, 0)

    scene.add(new THREE.HemisphereLight(0xffffff, new THREE.Color(c.bg3), c.dark ? 1.1 : 1.4))
    const sun = new THREE.DirectionalLight(0xffffff, c.dark ? 1.2 : 1.6)
    sun.position.set(6, 12, 4)
    scene.add(sun)

    const island = new THREE.Group()
    scene.add(island)

    type Block = { x: number; y: number; z: number; color: THREE.Color }
    const blocks: Block[] = []
    const jitter = (hex: string, amt = 0.06) => {
      const col = new THREE.Color(hex)
      const hsl = { h: 0, s: 0, l: 0 }
      col.getHSL(hsl)
      return col.setHSL(hsl.h, hsl.s, Math.min(1, Math.max(0, hsl.l + (Math.random() - 0.5) * amt)))
    }
    const GRASS = c.a1
    const DIRT = '#8b5a2b'
    const STONE = '#8d99ae'
    const RACK = '#2b2d42'
    const TRUNK = '#7a4b25'
    const LEAVES = new THREE.Color(c.a1).lerp(new THREE.Color('#0b6623'), 0.35).getStyle()

    const S = 5 // half-size of island
    const pond = (x: number, z: number) => x >= 1 && x <= 3 && z >= -4 && z <= -2
    for (let x = -S; x <= S; x++) {
      for (let z = -S; z <= S; z++) {
        const d = Math.hypot(x, z)
        if (d > S + 0.4) continue
        if (!pond(x, z)) blocks.push({ x, y: 0, z, color: jitter(GRASS) })
        const depth = Math.max(1, Math.round((S + 0.6 - d) * 0.9 + Math.random() * 1.2))
        for (let y = 1; y <= depth; y++) blocks.push({ x, y: -y, z, color: jitter(y > 2 ? STONE : DIRT, 0.08) })
      }
    }
    // Server racks
    const racks = [[-3, -1], [-3, 1], [-1, -3]]
    for (const [x, z] of racks) for (let y = 1; y <= 3; y++) blocks.push({ x, y, z, color: jitter(RACK, 0.04) })
    // Router
    blocks.push({ x: 0, y: 1, z: 2, color: new THREE.Color(STONE) })
    // Trees
    for (const [tx, tz] of [[3, 2], [-1, 4], [4, -1]]) {
      blocks.push({ x: tx, y: 1, z: tz, color: new THREE.Color(TRUNK) }, { x: tx, y: 2, z: tz, color: new THREE.Color(TRUNK) })
      for (let lx = -1; lx <= 1; lx++)
        for (let lz = -1; lz <= 1; lz++)
          for (let ly = 3; ly <= 4; ly++) if (!(ly === 4 && Math.abs(lx) + Math.abs(lz) === 2)) blocks.push({ x: tx + lx, y: ly, z: tz + lz, color: jitter(LEAVES, 0.1) })
    }

    const box = new THREE.BoxGeometry(1, 1, 1)
    const mat = new THREE.MeshLambertMaterial()
    const mesh = new THREE.InstancedMesh(box, mat, blocks.length)
    const m4 = new THREE.Matrix4()
    blocks.forEach((b, i) => {
      m4.makeTranslation(b.x, b.y, b.z)
      mesh.setMatrixAt(i, m4)
      mesh.setColorAt(i, b.color)
    })
    island.add(mesh)

    // Water
    const water = new THREE.Mesh(
      new THREE.BoxGeometry(3, 0.8, 3),
      new THREE.MeshLambertMaterial({ color: c.a2, transparent: true, opacity: 0.75 }),
    )
    water.position.set(2, -0.15, -3)
    island.add(water)

    // LEDs on rack fronts
    const leds: { pos: THREE.Vector3; phase: number; col: THREE.Color }[] = []
    const ledPalette = [c.a1, c.a2, c.a3, '#ff4d4d'].map((x) => new THREE.Color(x))
    for (const [x, z] of racks)
      for (let y = 1; y <= 3; y++)
        for (let k = 0; k < 3; k++) leds.push({ pos: new THREE.Vector3(x + 0.51, y - 0.25 + k * 0.22, z - 0.25 + (k % 2) * 0.3), phase: Math.random() * 10, col: ledPalette[(Math.random() * 4) | 0] })
    const ledMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.08, 0.14), new THREE.MeshBasicMaterial(), leds.length)
    leds.forEach((l, i) => {
      m4.makeTranslation(l.pos.x, l.pos.y, l.pos.z)
      ledMesh.setMatrixAt(i, m4)
      ledMesh.setColorAt(i, l.col)
    })
    island.add(ledMesh)

    // Cables (rack → router) and packets
    const cablePts = racks.map(([x, z]) => [new THREE.Vector3(x, 0.55, z), new THREE.Vector3(0, 0.55, 2)] as const)
    const cableMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(c.a2).lerp(new THREE.Color('#000000'), 0.3) })
    for (const [a, b] of cablePts) {
      const len = a.distanceTo(b)
      const cable = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, len), cableMat)
      cable.position.copy(a).lerp(b, 0.5)
      cable.lookAt(b)
      island.add(cable)
    }
    const packets = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), new THREE.MeshBasicMaterial({ color: c.a3 }), cablePts.length * 2)
    island.add(packets)
    // Antenna
    const ant = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.9, 0.1), new THREE.MeshLambertMaterial({ color: STONE }))
    ant.position.set(0, 1.9, 2)
    island.add(ant)

    // Clouds
    const cloudCubes: THREE.Vector3[] = []
    const clouds = [[-7, 4, -3], [6, 4.5, 5], [-2, 5, -8]]
    clouds.forEach(([cx, cy, cz]) => {
      for (let i = 0; i < 9; i++) cloudCubes.push(new THREE.Vector3(cx + (i % 3) - 1 + Math.random() * 0.4, cy + (i > 6 ? 1 : 0), cz + Math.floor(i / 3) - 1))
    })
    const cloudMesh = new THREE.InstancedMesh(box, new THREE.MeshLambertMaterial({ color: '#ffffff', transparent: true, opacity: c.dark ? 0.55 : 0.9 }), cloudCubes.length)
    scene.add(cloudMesh)

    const resize = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h, false)
      const aspect = w / h
      const view = aspect < 1 ? 26 : 21
      camera.left = (-view * aspect) / 2
      camera.right = (view * aspect) / 2
      camera.top = view / 2
      camera.bottom = -view / 2
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(el)

    const pointer = { x: 0, y: 0, sx: 0, sy: 0 }
    const onMove = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    let visible = true
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting))
    io.observe(el)

    const tmp = new THREE.Vector3()
    const off = new THREE.Color(0x111111)
    const render = (t: number) => {
      pointer.sx += (pointer.x - pointer.sx) * 0.05
      pointer.sy += (pointer.y - pointer.sy) * 0.05
      island.rotation.y = t * 0.12 + pointer.sx * 0.6
      island.rotation.x = pointer.sy * 0.08
      island.position.y = Math.sin(t * 0.8) * 0.18
      leds.forEach((l, i) => ledMesh.setColorAt(i, Math.sin(t * 6 + l.phase) > -0.3 ? l.col : off))
      ledMesh.instanceColor!.needsUpdate = true
      cablePts.forEach(([a, b], k) => {
        for (let j = 0; j < 2; j++) {
          const q = (t * 0.45 + k * 0.3 + j * 0.5) % 1
          tmp.copy(b).lerp(a, j ? q : 1 - q)
          m4.makeTranslation(tmp.x, tmp.y + 0.12, tmp.z)
          packets.setMatrixAt(k * 2 + j, m4)
        }
      })
      packets.instanceMatrix.needsUpdate = true
      cloudCubes.forEach((v, i) => {
        m4.makeTranslation(v.x + Math.sin(t * 0.15 + Math.floor(i / 9)) * 1.5, v.y, v.z)
        cloudMesh.setMatrixAt(i, m4)
      })
      cloudMesh.instanceMatrix.needsUpdate = true
      water.position.y = -0.15 + Math.sin(t * 2) * 0.03
      renderer.render(scene, camera)
    }

    let raf = 0
    const start = performance.now()
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (visible && !document.hidden) render((now - start) / 1000)
    }
    if (reduced) render(2)
    else {
      window.addEventListener('pointermove', onMove, { passive: true })
      raf = requestAnimationFrame(loop)
    }

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      ro.disconnect()
      io.disconnect()
      scene.traverse((o) => {
        const m = o as THREE.Mesh
        m.geometry?.dispose()
        const mt = m.material as THREE.Material | undefined
        mt?.dispose?.()
      })
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [reduced])

  return <div ref={host} className={className} aria-hidden />
}
