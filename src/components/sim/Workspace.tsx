import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Cable, Clock3, Eraser, Mail, MousePointer2, Pause, Play, RotateCcw, SkipForward, Tag, Trash2, Zap } from 'lucide-react'
import type { DeviceType, Endpoint, SimDevice, Topology } from '@/sim/types'
import { MODELS } from '@/sim/types'
import { connect, createDevice, dev, freeIfaces, linkUp, primaryIp, removeDevice, removeLink, updateDevice } from '@/sim/topology'
import { ping, type Hop, type PingResult } from '@/sim/engine'
import { Device, DeviceDefs } from '@/components/devices/Device'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'
import { DeviceWindow, type Runtime } from './DeviceWindow'

const W = 1100
const H = 640
type Tool = 'select' | 'cable' | 'delete' | 'pdu'
type Mode = 'realtime' | 'simulation'

interface PduRow {
  id: number
  ok: boolean
  src: string
  dst: string
  dstIp: string
  color: string
  time: number
}
interface EventRow {
  t: number
  last: string
  at: string
  type: 'ARP' | 'ICMP'
  reply?: boolean
}

const PDU_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#14b8a6']

/**
 * Packet-Tracer-style workspace. Controlled: the parent owns the topology
 * (so labs can grade and persist it).
 */
export function Workspace({ topo, setTopo, palette, className }: {
  topo: Topology
  setTopo: (t: Topology) => void
  palette: DeviceType[]
  className?: string
}) {
  const { lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const reduced = useReducedMotionPref()
  const svg = useRef<SVGSVGElement>(null)
  const rt = useRef<Runtime>({ arp: new Map(), ios: new Map() }).current
  const [tool, setTool] = useState<Tool>('select')
  const [mode, setMode] = useState<Mode>('realtime')
  const [open, setOpen] = useState<string | null>(null)
  const [ports, setPorts] = useState(false)
  const [pending, setPending] = useState<Endpoint | null>(null)
  const [menu, setMenu] = useState<{ dev: string; x: number; y: number } | null>(null)
  const [pduSrc, setPduSrc] = useState<string | null>(null)
  const [pdus, setPdus] = useState<PduRow[]>([])
  const [events, setEvents] = useState<EventRow[]>([])
  const [fresh, setFresh] = useState<Record<string, number>>({})
  const [, force] = useState(0)
  const dragging = useRef<{ id: string; dx: number; dy: number; moved: boolean } | null>(null)
  const clock = useRef(0)

  // Orange "spanning-tree" lights for a moment after a switch port is cabled.
  useEffect(() => {
    if (!Object.keys(fresh).length) return
    const t = window.setTimeout(() => setFresh({}), 2400)
    return () => window.clearTimeout(t)
  }, [fresh])

  const toSvg = (e: { clientX: number; clientY: number }) => {
    const el = svg.current!
    const p = el.createSVGPoint()
    p.x = e.clientX
    p.y = e.clientY
    const m = el.getScreenCTM()
    if (!m) return { x: 0, y: 0 }
    const r = p.matrixTransform(m.inverse())
    return { x: Math.max(40, Math.min(W - 40, r.x)), y: Math.max(40, Math.min(H - 50, r.y)) }
  }

  /* ------------------------------ packet animation ------------------------------ */
  const [anim, setAnim] = useState<{ hops: Hop[]; i: number; color: string } | null>(null)
  const [playing, setPlaying] = useState(true)
  const animRef = useRef(anim)
  animRef.current = anim

  const play = useCallback(
    (res: PingResult, color: string) => {
      if (!res.hops.length || reduced) return
      setAnim({ hops: res.hops, i: 0, color })
      if (mode === 'simulation') {
        setEvents([])
        setPlaying(true)
      }
    },
    [mode, reduced],
  )

  useEffect(() => {
    if (!anim || (mode === 'simulation' && !playing)) return
    const dur = mode === 'simulation' ? 650 : 140
    const t = window.setTimeout(() => advance(), dur)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim, playing, mode])

  const advance = () => {
    const a = animRef.current
    if (!a) return
    const hop = a.hops[a.i]
    if (mode === 'simulation' && hop) {
      clock.current += 0.001
      setEvents((ev) => [...ev, { t: +clock.current.toFixed(3), last: dev(topo, hop.from)?.name ?? '?', at: dev(topo, hop.to)?.name ?? '?', type: hop.kind, reply: hop.reply }])
    }
    if (a.i + 1 >= a.hops.length) setAnim(null)
    else setAnim({ ...a, i: a.i + 1 })
  }

  const onPing = useCallback((res: PingResult) => play(res, res.ok ? '#22c55e' : '#ef4444'), [play])

  /* ------------------------------ actions ------------------------------ */
  const addDevice = (type: DeviceType) => {
    const n = topo.devices.length
    const d = createDevice(type, 160 + ((n * 130) % 820), 120 + Math.floor(n / 7) * 120, topo)
    setTopo({ ...topo, devices: [...topo.devices, d] })
    setTool('select')
  }

  const clickDevice = (d: SimDevice, e: React.MouseEvent) => {
    if (tool === 'select') {
      if (!dragging.current?.moved) setOpen(d.id)
    } else if (tool === 'delete') {
      if (d.locked) return
      setTopo(removeDevice(topo, d.id))
      if (open === d.id) setOpen(null)
    } else if (tool === 'cable') {
      const rect = (e.currentTarget as Element).closest('[data-ws]')!.getBoundingClientRect()
      setMenu({ dev: d.id, x: e.clientX - rect.left, y: e.clientY - rect.top })
    } else if (tool === 'pdu') {
      if (!pduSrc) setPduSrc(d.id)
      else if (pduSrc !== d.id) {
        const ip = primaryIp(d)
        const src = dev(topo, pduSrc)!
        const color = PDU_COLORS[pdus.length % PDU_COLORS.length]
        const res = ip ? ping(topo, pduSrc, ip, rt.arp) : ({ ok: false, hops: [], path: [], ttl: 0 } as PingResult)
        clock.current += 1
        setPdus((p) => [...p, { id: Date.now(), ok: res.ok, src: src.name, dst: d.name, dstIp: ip ?? '—', color, time: +clock.current.toFixed(3) }])
        play(res, color)
        setPduSrc(null)
        force((x) => x + 1)
      }
    }
  }

  const pickPort = (iface: string) => {
    if (!menu) return
    const ep = { dev: menu.dev, iface }
    if (!pending) setPending(ep)
    else {
      const next = connect(topo, pending, ep)
      if (next !== topo) {
        const l = next.links[next.links.length - 1]
        const sw = [l.a, l.b].some((x) => dev(next, x.dev)?.type === 'switch')
        if (sw) setFresh((f) => ({ ...f, [l.id]: Date.now() }))
        setTopo(next)
      }
      setPending(null)
    }
    setMenu(null)
  }

  const resetSim = () => {
    rt.arp.clear()
    setEvents([])
    setAnim(null)
    clock.current = 0
  }

  /* ------------------------------ rendering helpers ------------------------------ */
  const center = (id: string) => {
    const d = dev(topo, id)
    return d ? { x: d.x, y: d.y } : { x: 0, y: 0 }
  }

  const envelope = useMemo(() => {
    if (!anim) return null
    const hop = anim.hops[anim.i]
    if (!hop) return null
    return { from: center(hop.from), to: center(hop.to), kind: hop.kind, reply: hop.reply, key: `${anim.i}-${hop.link}` }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anim, topo])

  const tools: { id: Tool; icon: typeof Cable; label: string }[] = [
    { id: 'select', icon: MousePointer2, label: tr('Select / move / configure', 'Sélection / déplacer / configurer') },
    { id: 'cable', icon: Cable, label: tr('Copper straight-through cable', 'Câble cuivre droit') },
    { id: 'pdu', icon: Mail, label: tr('Add Simple PDU (ping)', 'Ajouter une PDU simple (ping)') },
    { id: 'delete', icon: Eraser, label: tr('Delete', 'Supprimer') },
  ]

  const status = pending
    ? tr(`Cable from ${dev(topo, pending.dev)?.name} ${pending.iface} — click the other device`, `Câble depuis ${dev(topo, pending.dev)?.name} ${pending.iface} — cliquez sur l’autre équipement`)
    : tool === 'pdu'
      ? pduSrc
        ? tr(`Source ${dev(topo, pduSrc)?.name} — now click the destination`, `Source ${dev(topo, pduSrc)?.name} — cliquez maintenant sur la destination`)
        : tr('Click the source device', 'Cliquez sur l’équipement source')
      : tool === 'cable'
        ? tr('Click a device to choose a port', 'Cliquez sur un équipement pour choisir un port')
        : tool === 'delete'
          ? tr('Click a device or cable to delete it', 'Cliquez sur un équipement ou un câble pour le supprimer')
          : tr('Drag to move · click to configure', 'Glissez pour déplacer · cliquez pour configurer')

  return (
    <div className={cn('flex flex-col overflow-hidden rounded-2xl border border-line-strong bg-bg-2', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-line bg-bg-3 px-2 py-1.5">
        {tools.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => {
              setTool(id)
              setPending(null)
              setPduSrc(null)
              setMenu(null)
            }}
            title={label}
            aria-label={label}
            aria-pressed={tool === id}
            className={cn('grid h-8 w-8 place-items-center rounded-md transition-colors', tool === id ? 'bg-cyan text-on-accent' : 'text-muted hover:bg-cyan-soft hover:text-text')}
          >
            <Icon size={16} />
          </button>
        ))}
        <span className="mx-1 h-5 w-px bg-line-strong" />
        <button onClick={() => setPorts(!ports)} aria-pressed={ports} title={tr('Show port labels', 'Afficher les ports')} className={cn('grid h-8 w-8 place-items-center rounded-md', ports ? 'bg-cyan-soft text-cyan' : 'text-muted hover:text-text')}><Tag size={15} /></button>
        <span className="ml-2 truncate text-xs text-dim">{status}</span>
        <div className="ml-auto flex items-center gap-1 rounded-lg border border-line p-0.5">
          {(['realtime', 'simulation'] as Mode[]).map((m) => (
            <button key={m} onClick={() => { setMode(m); resetSim() }} className={cn('flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium', mode === m ? 'bg-cyan text-on-accent' : 'text-muted hover:text-text')}>
              {m === 'realtime' ? <Clock3 size={12} /> : <Zap size={12} />}
              {m === 'realtime' ? 'Realtime' : 'Simulation'}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <div data-ws className="relative min-h-0 flex-1">
        <svg
          ref={svg}
          viewBox={`0 0 ${W} ${H}`}
          className={cn('h-full w-full touch-none select-none', tool === 'cable' || tool === 'pdu' ? 'cursor-crosshair' : tool === 'delete' ? 'cursor-not-allowed' : '')}
          onPointerMove={(e) => {
            const g = dragging.current
            if (!g) return
            const p = toSvg(e)
            g.moved = true
            setTopo(updateDevice(topo, g.id, (d) => ({ ...d, x: p.x - g.dx, y: p.y - g.dy })))
          }}
          onPointerUp={() => setTimeout(() => (dragging.current = null))}
          onClick={(e) => {
            if (e.target === svg.current) {
              setMenu(null)
            }
          }}
          role="application"
          aria-label={tr('Network workspace', 'Espace de travail réseau')}
        >
          <DeviceDefs />
          <defs>
            <pattern id="ws-grid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path d="M22 0H0V22" fill="none" stroke="var(--line)" strokeWidth="0.8" />
            </pattern>
          </defs>
          <rect width={W} height={H} fill="url(#ws-grid)" />

          {/* Links */}
          {topo.links.map((l) => {
            const a = center(l.a.dev)
            const b = center(l.b.dev)
            const len = Math.hypot(b.x - a.x, b.y - a.y) || 1
            const ux = (b.x - a.x) / len
            const uy = (b.y - a.y) / len
            const up = linkUp(topo, l)
            const orange = !!fresh[l.id]
            const sideCol = (ep: Endpoint) => {
              const d = dev(topo, ep.dev)
              const i = d?.ifaces.find((k) => k.name === ep.iface)
              if (!i?.up) return '#ef4444'
              if (orange && d?.type === 'switch') return '#f59e0b'
              return up ? '#22c55e' : '#ef4444'
            }
            const ang = (Math.atan2(uy, ux) * 180) / Math.PI
            const pad = 38
            return (
              <g key={l.id} onClick={() => tool === 'delete' && setTopo(removeLink(topo, l.id))} className={tool === 'delete' ? 'cursor-pointer' : ''}>
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="transparent" strokeWidth="14" />
                <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--text-muted)" strokeWidth="1.8" strokeDasharray={l.cable === 'cross' ? '6 4' : undefined} />
                <path d="M-6 -5 L6 0 L-6 5 Z" fill={sideCol(l.a)} transform={`translate(${a.x + ux * pad} ${a.y + uy * pad}) rotate(${ang})`} />
                <path d="M-6 -5 L6 0 L-6 5 Z" fill={sideCol(l.b)} transform={`translate(${b.x - ux * pad} ${b.y - uy * pad}) rotate(${ang + 180})`} />
                {ports && (
                  <>
                    <text x={a.x + ux * 62} y={a.y + uy * 62 - 6} textAnchor="middle" fontSize="9.5" fill="var(--cyan)" stroke="var(--bg-2)" strokeWidth="3" paintOrder="stroke" style={{ fontFamily: "'JetBrains Mono Variable', monospace" }}>{l.a.iface}</text>
                    <text x={b.x - ux * 62} y={b.y - uy * 62 - 6} textAnchor="middle" fontSize="9.5" fill="var(--cyan)" stroke="var(--bg-2)" strokeWidth="3" paintOrder="stroke" style={{ fontFamily: "'JetBrains Mono Variable', monospace" }}>{l.b.iface}</text>
                  </>
                )}
                <title>{`${dev(topo, l.a.dev)?.name} ${l.a.iface} ↔ ${dev(topo, l.b.dev)?.name} ${l.b.iface}`}</title>
              </g>
            )
          })}

          {/* Devices */}
          {topo.devices.map((d) => {
            const selected = pending?.dev === d.id || pduSrc === d.id || open === d.id
            return (
              <g
                key={d.id}
                data-device={d.name}
                className={tool === 'select' ? 'cursor-grab active:cursor-grabbing' : 'cursor-pointer'}
                onPointerDown={(e) => {
                  if (tool !== 'select') return
                  const p = toSvg(e)
                  dragging.current = { id: d.id, dx: p.x - d.x, dy: p.y - d.y, moved: false }
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  clickDevice(d, e)
                }}
              >
                {selected && <circle cx={d.x} cy={d.y} r="40" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeDasharray="4 4" />}
                <rect x={d.x - 40} y={d.y - 36} width="80" height="96" fill="transparent" />
                <Device kind={d.type} x={d.x} y={d.y} scale={0.95} model={MODELS[d.type]} name={d.name} animate={false} />
              </g>
            )
          })}

          {/* Envelope */}
          {envelope && (
            <motion.g
              key={envelope.key}
              initial={{ x: envelope.from.x, y: envelope.from.y - 10 }}
              animate={{ x: envelope.to.x, y: envelope.to.y - 10 }}
              transition={{ duration: mode === 'simulation' ? 0.6 : 0.13, ease: 'easeInOut' }}
            >
              <rect x="-11" y="-8" width="22" height="16" rx="2" fill={envelope.kind === 'ARP' ? '#f5d142' : anim?.color ?? '#22c55e'} stroke="#111" strokeWidth="1" />
              <path d="M-11 -8 L0 1 L11 -8" fill="none" stroke="#111" strokeWidth="1" />
              {envelope.reply && <circle cx="9" cy="-7" r="3" fill="#fff" stroke="#111" strokeWidth="0.8" />}
            </motion.g>
          )}
        </svg>

        {/* Port picker */}
        <AnimatePresence>
          {menu && (() => {
            const d = dev(topo, menu.dev)!
            const free = new Set(freeIfaces(topo, d).map((i) => i.name))
            return (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute z-20 max-h-64 w-44 overflow-y-auto rounded-lg border border-line-strong bg-bg shadow-xl"
                style={{ left: `min(${menu.x}px, calc(100% - 11.5rem))`, top: `min(${menu.y}px, calc(100% - 16.5rem))` }}
                data-lenis-prevent
              >
                <p className="border-b border-line px-3 py-1.5 text-[0.68rem] font-semibold text-dim">{d.name}</p>
                {d.ifaces.map((i) => (
                  <button
                    key={i.name}
                    disabled={!free.has(i.name)}
                    onClick={() => pickPort(i.name)}
                    className="block w-full px-3 py-1 text-left font-mono text-xs text-text hover:bg-cyan-soft disabled:text-dim disabled:line-through disabled:hover:bg-transparent"
                  >
                    {i.name.replace('Fa', 'FastEthernet').replace('Gi', 'GigabitEthernet')}
                  </button>
                ))}
              </motion.div>
            )
          })()}
        </AnimatePresence>

        <AnimatePresence>
          {open && dev(topo, open) && <DeviceWindow key={open} deviceId={open} topo={topo} setTopo={setTopo} rt={rt} onPing={onPing} onClose={() => setOpen(null)} />}
        </AnimatePresence>

        {topo.devices.length === 0 && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-sm text-dim">{tr('Add devices from the bar below to start building.', 'Ajoutez des équipements depuis la barre ci-dessous pour commencer.')}</div>
        )}
      </div>

      {/* Bottom bar: device palette + PDU / event list */}
      <div className="grid border-t border-line bg-bg-3 md:grid-cols-[auto_1fr]">
        <div className="flex items-center gap-1 overflow-x-auto px-2 py-2" data-lenis-prevent-horizontal>
          {palette.map((type) => (
            <button key={type} onClick={() => addDevice(type)} title={`${MODELS[type]}`} className="group flex w-16 shrink-0 flex-col items-center rounded-lg p-1 hover:bg-cyan-soft">
              <svg viewBox="-40 -34 80 64" className="h-10 w-14">
                <DeviceDefs />
                <Device kind={type} x={0} y={0} scale={0.75} animate={false} />
              </svg>
              <span className="text-[0.6rem] text-muted group-hover:text-text">{MODELS[type]}</span>
            </button>
          ))}
          {palette.length === 0 && <span className="px-2 text-xs text-dim">{tr('Fixed topology for this lab', 'Topologie fixe pour ce lab')}</span>}
        </div>
        <div className="min-h-[96px] border-t border-line md:border-t-0 md:border-l">
          {mode === 'simulation' ? (
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 border-b border-line px-3 py-1">
                <span className="hud-label">Event List</span>
                <button onClick={() => setPlaying(!playing)} className="ml-auto grid h-6 w-6 place-items-center rounded text-muted hover:text-text" aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause size={13} /> : <Play size={13} />}</button>
                <button onClick={advance} className="grid h-6 w-6 place-items-center rounded text-muted hover:text-text" aria-label="Capture / Forward"><SkipForward size={13} /></button>
                <button onClick={resetSim} className="grid h-6 w-6 place-items-center rounded text-muted hover:text-text" aria-label="Reset"><RotateCcw size={13} /></button>
              </div>
              <div className="max-h-28 overflow-y-auto font-mono text-[0.68rem]" data-lenis-prevent>
                <table className="w-full">
                  <thead className="text-dim"><tr><th className="px-2 text-left">Time(sec)</th><th className="text-left">Last Device</th><th className="text-left">At Device</th><th className="text-left">Type</th></tr></thead>
                  <tbody>
                    {events.map((e, i) => (
                      <tr key={i} className="border-t border-line/60">
                        <td className="px-2">{e.t.toFixed(3)}</td><td>{e.last}</td><td>{e.at}</td>
                        <td><span className="inline-block h-2 w-3 rounded-sm align-middle" style={{ background: e.type === 'ARP' ? '#f5d142' : '#22c55e' }} /> {e.type}{e.reply ? ' (reply)' : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="max-h-28 overflow-y-auto font-mono text-[0.68rem]" data-lenis-prevent>
              <table className="w-full">
                <thead className="text-dim"><tr><th className="px-2 text-left">Last Status</th><th className="text-left">Source</th><th className="text-left">Destination</th><th className="text-left">Type</th><th className="text-left">Color</th><th /></tr></thead>
                <tbody>
                  {pdus.map((p) => (
                    <tr key={p.id} className="border-t border-line/60">
                      <td className={cn('px-2 font-semibold', p.ok ? 'text-success' : 'text-danger')}>{p.ok ? 'Successful' : 'Failed'}</td>
                      <td>{p.src}</td><td>{p.dst} <span className="text-dim">{p.dstIp}</span></td><td>ICMP</td>
                      <td><span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: p.color }} /></td>
                      <td><button onClick={() => setPdus((x) => x.filter((k) => k.id !== p.id))} className="px-2 text-dim hover:text-danger" aria-label="Delete PDU"><Trash2 size={11} /></button></td>
                    </tr>
                  ))}
                  {pdus.length === 0 && <tr><td colSpan={6} className="px-2 py-2 text-dim">{tr('Use the envelope tool to send a test ping between two devices.', 'Utilisez l’enveloppe pour envoyer un ping de test entre deux équipements.')}</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

