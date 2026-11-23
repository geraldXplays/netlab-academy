import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight, Eraser, Pause, Play, RotateCcw, Send, TriangleAlert } from 'lucide-react'
import { Device, DeviceDefs, type DeviceKind } from '@/components/devices/Device'
import { campus, applyFaults, FAULTS, PRESETS, type FaultId } from '@/explorer/campus'
import { BCAST, emptyTables, routeTable, tracePing, type Frame, type Mark, type Step, type Tables, type Trace } from '@/explorer/trace'
import { dev as getDev } from '@/sim/topology'
import type { SimDevice, Topology } from '@/sim/types'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

const KIND: Record<SimDevice['type'], DeviceKind> = { pc: 'pc', laptop: 'laptop', server: 'server', printer: 'printer', switch: 'switch', router: 'router', firewall: 'firewall' }
const FRAME_COL: Record<Frame['kind'], string> = { 'ARP-REQ': '#f59e0b', 'ARP-REP': '#fbbf24', 'ICMP-REQ': '#22d3ee', 'ICMP-REP': '#4ade80' }
const TONE: Record<Step['tone'], string> = {
  info: 'border-line',
  arp: 'border-warning/40',
  req: 'border-cyan/40',
  rep: 'border-success/40',
  ok: 'border-success/60',
  fail: 'border-danger/60',
}
const mono = { fontFamily: "'JetBrains Mono Variable', monospace" }

export default function ExplorerPage() {
  const { l, lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const reduced = useReducedMotionPref()
  const [faults, setFaults] = useState<Set<FaultId>>(new Set())
  const topo = useMemo(() => applyFaults(campus(), faults), [faults])
  const [src, setSrc] = useState('pca')
  const [dst, setDst] = useState('192.168.50.10')
  const [tables, setTables] = useState<Tables>(emptyTables)
  const [trace, setTrace] = useState<Trace | null>(null)
  const [idx, setIdx] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [picked, setPicked] = useState<string | null>(null)

  useEffect(() => {
    document.title = `${tr('Topology Explorer', 'Explorateur de topologie')} · NetLab Academy`
  })

  const step = trace?.steps[idx]
  const last = trace ? idx === trace.steps.length - 1 : true

  useEffect(() => {
    if (!playing || !trace) return
    if (last) {
      setPlaying(false)
      return
    }
    const ms = (step && step.tx.length ? 1700 : 1400) / speed
    const id = window.setTimeout(() => setIdx((i) => i + 1), ms)
    return () => window.clearTimeout(id)
  }, [playing, idx, trace, last, speed, step])

  const run = (s = src, d = dst) => {
    const r = tracePing(topo, s, d, tables)
    setTrace(r)
    setTables(r.tables)
    setIdx(0)
    setPicked(null)
    setPlaying(true)
  }
  const clearCaches = () => {
    setTables(emptyTables())
    setTrace(null)
    setIdx(0)
  }
  const toggleFault = (f: FaultId) => {
    const n = new Set(faults)
    if (n.has(f)) n.delete(f)
    else n.add(f)
    setFaults(n)
    setTrace(null)
    setTables(emptyTables())
  }

  const hosts = topo.devices.filter((d) => ['pc', 'laptop', 'server'].includes(d.type))
  const targets = topo.devices.flatMap((d) => d.ifaces.filter((i) => i.ip).map((i) => ({ ip: i.ip!, label: `${d.name} · ${i.ip}${d.type === 'router' ? ` (${i.name})` : ''}`, dev: d.id })))
  const shownTables = step?.tables ?? tables
  const inspectId = picked ?? step?.focus[0] ?? src
  const prevFrame = useMemo(() => {
    if (!trace || !step?.frame) return undefined
    for (let i = idx - 1; i >= 0; i--) {
      const f = trace.steps[i].frame
      if (f && f.kind === step.frame.kind && f.dstMac !== '?') return f
    }
    return undefined
  }, [trace, idx, step])

  return (
    <div className="mx-auto max-w-[96rem] px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <p className="hud-label">{tr('Interactive visualisation', 'Visualisation interactive')}</p>
      <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,3.8rem)] leading-[1] font-semibold tracking-[-0.04em]">{tr('Topology Explorer', 'Explorateur de topologie')}</h1>
      <p className="mt-4 max-w-3xl text-lg text-muted">
        {tr('Send a ping and follow it frame by frame: ARP, MAC learning, 802.1Q tags, routing decisions, TTL and header rewrites — with every table updating live. Then break the network and watch exactly where it fails.', 'Envoyez un ping et suivez-le trame par trame : ARP, apprentissage MAC, étiquettes 802.1Q, décisions de routage, TTL et réécriture des en-têtes — avec toutes les tables mises à jour en direct. Puis cassez le réseau et voyez exactement où ça échoue.')}
      </p>

      {/* controls */}
      <div className="glass mt-8 flex flex-wrap items-end gap-3 rounded-3xl p-4">
        <label className="grid gap-1 text-xs text-dim">
          {tr('Source', 'Source')}
          <select value={src} onChange={(e) => setSrc(e.target.value)} className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-text">
            {hosts.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} · {h.ifaces[0].ip}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-xs text-dim">
          {tr('Destination', 'Destination')}
          <select value={dst} onChange={(e) => setDst(e.target.value)} className="rounded-xl border border-line bg-surface px-3 py-2 text-sm text-text">
            {targets.map((t) => (
              <option key={t.ip} value={t.ip} disabled={t.dev === src}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <button onClick={() => run()} className="inline-flex items-center gap-2 rounded-xl bg-cyan px-4 py-2 text-sm font-semibold text-on-accent hover:brightness-110">
          <Send className="size-4" /> ping
        </button>
        <button onClick={clearCaches} className="inline-flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm text-muted hover:text-text" title={tr('Empty every ARP cache and MAC table', 'Vider tous les caches ARP et tables MAC')}>
          <Eraser className="size-4" /> {tr('Clear caches', 'Vider les caches')}
        </button>
        <div className="flex flex-wrap gap-2 lg:ml-auto">
          {PRESETS.map((p) => (
            <button
              key={p.label.en}
              onClick={() => {
                setSrc(p.src)
                setDst(p.dst)
                run(p.src, p.dst)
              }}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-muted hover:border-cyan/50 hover:text-cyan"
            >
              {l(p.label)}
            </button>
          ))}
        </div>
        <div className="flex w-full flex-wrap items-center gap-2 border-t border-line pt-3">
          <span className="flex items-center gap-1.5 text-xs text-warning">
            <TriangleAlert className="size-3.5" /> {tr('Break it:', 'Cassez-le :')}
          </span>
          {FAULTS.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFault(f.id)}
              aria-pressed={faults.has(f.id)}
              title={l(f.hint)}
              className={cn('rounded-full border px-3 py-1 text-xs transition-colors', faults.has(f.id) ? 'border-danger/60 bg-danger/15 text-danger' : 'border-line text-muted hover:text-text')}
            >
              {l(f.label)}
            </button>
          ))}
          {faults.size > 0 && <span className="text-xs text-dim">{[...faults].map((f) => l(FAULTS.find((x) => x.id === f)!.hint)).join(' · ')}</span>}
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-4">
          {/* map */}
          <div className="glass overflow-hidden rounded-3xl">
            <TopoMap topo={topo} step={step} speed={speed} reduced={reduced} selected={inspectId} onPick={setPicked} stepKey={idx} />
            {/* playback */}
            <div className="flex flex-wrap items-center gap-3 border-t border-line px-4 py-3">
              <button disabled={!trace || idx === 0} onClick={() => { setPlaying(false); setIdx((i) => Math.max(0, i - 1)) }} className="rounded-lg border border-line p-1.5 text-muted hover:text-text disabled:opacity-30" aria-label={tr('Previous step', 'Étape précédente')}>
                <ChevronLeft className="size-4" />
              </button>
              <button disabled={!trace} onClick={() => (last ? (setIdx(0), setPlaying(true)) : setPlaying((p) => !p))} className="rounded-lg bg-cyan-soft p-1.5 text-cyan disabled:opacity-30" aria-label={playing ? 'Pause' : 'Play'}>
                {last && trace ? <RotateCcw className="size-4" /> : playing ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>
              <button disabled={!trace || last} onClick={() => { setPlaying(false); setIdx((i) => i + 1) }} className="rounded-lg border border-line p-1.5 text-muted hover:text-text disabled:opacity-30" aria-label={tr('Next step', 'Étape suivante')}>
                <ChevronRight className="size-4" />
              </button>
              <input type="range" min={0} max={Math.max(0, (trace?.steps.length ?? 1) - 1)} value={idx} disabled={!trace} onChange={(e) => { setPlaying(false); setIdx(Number(e.target.value)) }} className="min-w-24 flex-1 accent-[var(--cyan)]" aria-label={tr('Step', 'Étape')} />
              <span className="font-mono text-xs text-dim">{trace ? `${idx + 1} / ${trace.steps.length}` : '— / —'}</span>
              <div className="flex overflow-hidden rounded-lg border border-line font-mono text-xs">
                {[0.5, 1, 2].map((s) => (
                  <button key={s} onClick={() => setSpeed(s)} className={cn('px-2 py-1', speed === s ? 'bg-cyan text-on-accent' : 'text-muted hover:text-text')}>
                    {s}×
                  </button>
                ))}
              </div>
              <Legend />
            </div>
          </div>

          {/* narration + frame */}
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <AnimatePresence mode="wait">
              <motion.div key={trace ? idx : 'none'} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className={cn('glass rounded-3xl border-l-4 p-5', step ? TONE[step.tone] : 'border-line')}>
                {step ? (
                  <>
                    <p className="hud-label">{tr('Step', 'Étape')} {idx + 1}</p>
                    <h2 className={cn('mt-1 font-display text-xl font-semibold', step.tone === 'fail' && 'text-danger', step.tone === 'ok' && 'text-success')}>{l(step.title)}</h2>
                    <ul className="mt-3 grid gap-2 text-sm leading-relaxed">
                      {step.body.map((b, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-cyan" />
                          <span>{l(b)}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <>
                    <h2 className="font-display text-xl font-semibold">{tr('Ready when you are', 'Prêt quand vous l’êtes')}</h2>
                    <p className="mt-2 text-sm text-muted">{tr('Pick a source and a destination, then press ping — or start with a preset. Run the same ping twice: the second time, caches are warm and ARP disappears.', 'Choisissez une source et une destination puis appuyez sur ping — ou partez d’un préréglage. Lancez deux fois le même ping : la seconde fois, les caches sont chauds et l’ARP disparaît.')}</p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
            <FrameView frame={step?.frame} prev={prevFrame} />
          </div>
        </div>

        {/* inspector */}
        <Inspector topo={topo} devId={inspectId} tables={shownTables} marks={step?.marks ?? []} onPick={setPicked} />
      </div>
    </div>
  )
}

function Legend() {
  const { lang } = useI18n()
  const items: [string, string][] = [
    [FRAME_COL['ARP-REQ'], 'ARP'],
    [FRAME_COL['ICMP-REQ'], lang === 'fr' ? 'Requête' : 'Request'],
    [FRAME_COL['ICMP-REP'], lang === 'fr' ? 'Réponse' : 'Reply'],
  ]
  return (
    <div className="hidden items-center gap-3 text-xs text-dim md:flex">
      {items.map(([c, n]) => (
        <span key={n} className="flex items-center gap-1.5">
          <span className="size-2.5 rounded-sm" style={{ background: c }} />
          {n}
        </span>
      ))}
    </div>
  )
}

/* ─────────────────────────── map ─────────────────────────── */

function TopoMap({ topo, step, speed, reduced, selected, onPick, stepKey }: { topo: Topology; step?: Step; speed: number; reduced: boolean; selected: string; onPick: (id: string) => void; stepKey: number }) {
  const pos = (id: string) => {
    const d = getDev(topo, id)!
    return [d.x, d.y] as const
  }
  const active = new Set(step?.tx.map((x) => x.link))
  const failed = step?.tone === 'fail'
  return (
    <svg viewBox="0 70 960 480" className="h-auto w-full bg-[radial-gradient(circle_at_50%_40%,rgba(34,211,238,0.06),transparent_70%)]" role="img" aria-label="Network topology">
      <DeviceDefs />
      <defs>
        <pattern id="ex-grid" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M24 0 H0 V24" fill="none" stroke="var(--line)" strokeWidth="0.5" opacity="0.5" />
        </pattern>
      </defs>
      <rect x="0" y="70" width="960" height="480" fill="url(#ex-grid)" />
      {/* zones */}
      <rect x="40" y="250" width="380" height="292" rx="18" fill="var(--cyan)" opacity="0.035" stroke="var(--cyan)" strokeOpacity="0.15" strokeDasharray="5 5" />
      <text x="408" y="534" textAnchor="end" fontSize="9" fill="var(--text-dim)" style={mono} letterSpacing="1">CAMPUS · V10 10.10.0.0/24 · V20 10.20.0.0/24</text>
      <rect x="600" y="250" width="330" height="292" rx="18" fill="#a855f7" opacity="0.04" stroke="#a855f7" strokeOpacity="0.18" strokeDasharray="5 5" />
      <text x="918" y="534" textAnchor="end" fontSize="9" fill="var(--text-dim)" style={mono} letterSpacing="1">SERVERS · 192.168.50.0/24</text>
      <text x="500" y="128" textAnchor="middle" fontSize="10" fill="var(--text-dim)" style={mono}>10.0.12.0/30</text>

      {/* links */}
      {topo.links.map((lk) => {
        const [x1, y1] = pos(lk.a.dev)
        const [x2, y2] = pos(lk.b.dev)
        const da = getDev(topo, lk.a.dev)!
        const db = getDev(topo, lk.b.dev)!
        const up = da.ifaces.find((i) => i.name === lk.a.iface)?.up && db.ifaces.find((i) => i.name === lk.b.iface)?.up
        const isTrunk = [lk.a, lk.b].some((e) => getDev(topo, e.dev)!.ifaces.find((i) => i.name === e.iface)?.mode === 'trunk')
        const lab = (fx: number, fy: number, tx: number, ty: number, name: string) => {
          const len = Math.hypot(tx - fx, ty - fy)
          const ux = (tx - fx) / len
          const uy = (ty - fy) / len
          const k = Math.min(58, len * 0.4)
          // offset to the side of the cable so the label never sits on it
          const nx = -uy * 10
          const ny = ux * 10
          return (
            <text x={fx + ux * k + nx} y={fy + uy * k + ny + 3} textAnchor="middle" fontSize="9" fill="var(--text-dim)" style={mono}>
              {name}
            </text>
          )
        }
        return (
          <g key={lk.id}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={up ? (active.has(lk.id) ? 'var(--cyan)' : 'var(--text-muted)') : '#ef4444'} strokeOpacity={active.has(lk.id) ? 0.9 : 0.5} strokeWidth={isTrunk ? 3.2 : 1.8} strokeDasharray={up ? undefined : '6 5'} />
            {isTrunk && <text x={(x1 + x2) / 2 + 10} y={(y1 + y2) / 2} fontSize="9" fill="var(--purple)" style={mono}>802.1Q trunk</text>}
            {lab(x1, y1, x2, y2, lk.a.iface)}
            {lab(x2, y2, x1, y1, lk.b.iface)}
            {!up && <text x={(x1 + x2) / 2} y={(y1 + y2) / 2 + 14} textAnchor="middle" fontSize="11" fill="#ef4444" fontWeight="700">✕ down</text>}
          </g>
        )
      })}

      {/* devices */}
      {topo.devices.map((d) => {
        const focus = step?.focus.includes(d.id)
        const ip = d.type === 'switch' ? undefined : d.type === 'router' ? undefined : d.ifaces[0]?.ip
        return (
          <g key={d.id} onClick={() => onPick(d.id)} style={{ cursor: 'pointer' }} aria-label={d.name}>
            <circle cx={d.x} cy={d.y} r="40" fill="transparent" />
            {focus && (
              <motion.circle key={`f${stepKey}`} cx={d.x} cy={d.y} r="38" fill="none" stroke={failed ? '#ef4444' : 'var(--cyan)'} strokeWidth="2" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: [0, 1, 0.6], scale: 1 }} transition={{ duration: 0.5 }} style={{ transformOrigin: `${d.x}px ${d.y}px` }} />
            )}
            {selected === d.id && <circle cx={d.x} cy={d.y} r="44" fill="none" stroke="var(--purple)" strokeWidth="1.2" strokeDasharray="3 4" />}
            <Device kind={KIND[d.type]} x={d.x} y={d.y} name={d.name} sub={ip} animate={false} />
          </g>
        )
      })}

      {/* frames in flight */}
      {step?.tx.map((x, i) => {
        const [x1, y1] = pos(x.from)
        const [x2, y2] = pos(x.to)
        const col = FRAME_COL[x.frame.kind]
        const dur = reduced ? 0 : 1.1 / speed
        return (
          <motion.g key={`${stepKey}-${i}`} initial={{ x: x1, y: y1, opacity: 0 }} animate={{ x: x2, y: y2, opacity: x.ignored ? [0, 1, 1, 0.35] : 1 }} transition={{ duration: dur, ease: 'easeInOut' }}>
            <rect x="-13" y="-9" width="26" height="18" rx="3" fill={col} stroke="#0b0f14" strokeWidth="1.2" />
            <path d="M-13 -9 L0 1 L13 -9" fill="none" stroke="#0b0f14" strokeWidth="1.2" strokeOpacity="0.6" />
            {x.frame.vlan !== null && (
              <g transform="translate(13 -13)">
                <rect x="-2" y="-7" width="30" height="13" rx="3" fill="var(--purple)" />
                <text x="13" y="2.5" textAnchor="middle" fontSize="8.5" fontWeight="700" fill="#fff" style={mono}>V{x.frame.vlan}</text>
              </g>
            )}
            {x.ignored && (
              <motion.text initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: dur }} x="0" y="26" textAnchor="middle" fontSize="12" fontWeight="700" fill="#ef4444">
                ✕
              </motion.text>
            )}
          </motion.g>
        )
      })}
    </svg>
  )
}

/* ─────────────────────────── frame anatomy ─────────────────────────── */

function FrameView({ frame, prev }: { frame?: Frame; prev?: Frame }) {
  const { lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  if (!frame) {
    return (
      <div className="glass grid place-items-center rounded-3xl p-5 text-center text-sm text-dim">
        {tr('The frame’s headers appear here, field by field.', 'Les en-têtes de la trame apparaissent ici, champ par champ.')}
      </div>
    )
  }
  const isArp = frame.kind.startsWith('ARP')
  const ch = (k: keyof Frame) => !!prev && prev[k] !== frame[k] && frame[k] !== '?'
  const F = ({ label, value, k, wide, tone = 'cyan' }: { label: string; value: string; k?: keyof Frame; wide?: boolean; tone?: 'cyan' | 'purple' | 'amber' | 'green' }) => {
    const changed = k ? ch(k) : false
    const tones = { cyan: 'border-cyan/30 bg-cyan-soft', purple: 'border-purple/40 bg-purple-soft', amber: 'border-warning/40 bg-warning/10', green: 'border-success/40 bg-success/10' }
    return (
      <motion.div key={`${label}${value}`} initial={changed ? { scale: 0.92, opacity: 0.4 } : false} animate={{ scale: 1, opacity: 1 }} className={cn('relative rounded-xl border px-2.5 py-1.5', tones[tone], wide && 'col-span-2', changed && 'ring-2 ring-warning')}>
        <p className="text-[0.62rem] tracking-wider text-dim uppercase">{label}</p>
        <p className="truncate font-mono text-[0.8rem]" title={value}>{value}</p>
        {changed && <span className="absolute -top-2 right-2 rounded bg-warning px-1 font-mono text-[0.55rem] font-bold text-black">{tr('CHANGED', 'MODIFIÉ')}</span>}
      </motion.div>
    )
  }
  return (
    <div className="glass rounded-3xl p-5">
      <p className="hud-label">{tr('Frame anatomy', 'Anatomie de la trame')}</p>
      <div className="mt-3 grid gap-3">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-cyan">Ethernet · {tr('layer 2', 'couche 2')}</p>
          <div className="grid grid-cols-2 gap-2">
            <F label={tr('Destination MAC', 'MAC destination')} value={frame.dstMac === BCAST ? `${BCAST} (broadcast)` : frame.dstMac === '?' ? tr('? (to resolve)', '? (à résoudre)') : frame.dstMac} k="dstMac" />
            <F label={tr('Source MAC', 'MAC source')} value={frame.srcMac} k="srcMac" />
            {frame.vlan !== null && <F label="802.1Q" value={`VLAN ${frame.vlan}`} k="vlan" tone="purple" wide />}
          </div>
        </div>
        <div>
          <p className="mb-1.5 text-xs font-semibold text-warning">{isArp ? 'ARP' : 'IPv4'} · {tr('layer 3', 'couche 3')}</p>
          <div className="grid grid-cols-2 gap-2">
            {isArp ? (
              <>
                <F label={tr('Operation', 'Opération')} value={frame.kind === 'ARP-REQ' ? tr('request (who has?)', 'requête (qui a ?)') : tr('reply (is at)', 'réponse (est à)')} tone="amber" wide />
                <F label={tr('Sender IP', 'IP émetteur')} value={frame.srcIp} tone="amber" />
                <F label={tr('Target IP', 'IP cible')} value={frame.arpIp ?? frame.dstIp} tone="amber" />
              </>
            ) : (
              <>
                <F label={tr('Source IP', 'IP source')} value={frame.srcIp} k="srcIp" tone="amber" />
                <F label={tr('Destination IP', 'IP destination')} value={frame.dstIp} k="dstIp" tone="amber" />
                <F label="TTL" value={String(frame.ttl ?? '')} k="ttl" tone="amber" />
                <F label={tr('Protocol', 'Protocole')} value="ICMP (1)" tone="amber" />
              </>
            )}
          </div>
        </div>
        {!isArp && (
          <div>
            <p className="mb-1.5 text-xs font-semibold text-success">ICMP</p>
            <F label="Type" value={frame.kind === 'ICMP-REQ' ? 'Echo request (8)' : 'Echo reply (0)'} tone="green" wide />
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────── inspector ─────────────────────────── */

function Inspector({ topo, devId, tables, marks, onPick }: { topo: Topology; devId: string; tables: Tables; marks: Mark[]; onPick: (id: string) => void }) {
  const { lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const d = getDev(topo, devId)!
  const hot = (table: Mark['table'], key: string) => marks.some((m) => m.dev === d.id && m.table === table && m.key === key)
  const row = (h: boolean) => cn('border-t border-line/60 transition-colors', h && 'bg-warning/15 text-text')
  const arp = Object.entries(tables.arp[d.id] ?? {})
  const mac = Object.entries(tables.mac[d.id] ?? {})
  const routed = d.type === 'router'
  const isSw = d.type === 'switch'
  const Section = ({ title, children, empty }: { title: string; children: React.ReactNode; empty?: string }) => (
    <div className="mt-5">
      <p className="hud-label mb-2">{title}</p>
      {children ?? <p className="text-xs text-dim">{empty}</p>}
    </div>
  )
  return (
    <aside className="glass h-fit rounded-3xl p-5 xl:sticky xl:top-24">
      <div className="flex flex-wrap gap-1.5">
        {topo.devices.map((x) => (
          <button key={x.id} onClick={() => onPick(x.id)} className={cn('rounded-full border px-2.5 py-0.5 font-mono text-[0.7rem]', x.id === d.id ? 'border-purple bg-purple-soft text-purple' : 'border-line text-dim hover:text-text')}>
            {x.name}
          </button>
        ))}
      </div>
      <h2 className="mt-4 font-display text-2xl font-semibold">{d.name}</h2>
      <p className="text-xs text-dim">{tr('Click any device on the map to inspect it. Rows lit in amber were used or changed at this step.', 'Cliquez sur un équipement de la carte pour l’inspecter. Les lignes en ambre ont été utilisées ou modifiées à cette étape.')}</p>

      <Section title={tr('Interfaces', 'Interfaces')}>
        <table className="w-full text-left font-mono text-[0.7rem]">
          <tbody>
            {d.ifaces.map((i) => (
              <tr key={i.name} className="border-t border-line/60">
                <td className="py-1 pr-2 text-cyan">{i.name}</td>
                <td className="py-1 pr-2">{i.ip ? `${i.ip}` : isSw ? (i.mode === 'trunk' ? 'trunk' : `vlan ${i.vlan ?? 1}`) : '—'}</td>
                <td className={cn('py-1 text-right', i.up ? 'text-success' : 'text-danger')}>{i.up ? 'up' : 'down'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {d.gateway && <p className="mt-2 font-mono text-[0.7rem] text-dim">{tr('Default gateway', 'Passerelle')}: <span className="text-text">{d.gateway}</span></p>}
      </Section>

      {!isSw && (
        <Section title={tr('ARP cache', 'Cache ARP')} empty={tr('Empty — nothing resolved yet.', 'Vide — rien de résolu pour l’instant.')}>
          {arp.length ? (
            <table className="w-full text-left font-mono text-[0.7rem]">
              <tbody>
                {arp.map(([ip, m]) => (
                  <tr key={ip} className={row(hot('arp', ip))}>
                    <td className="py-1 pr-2">{ip}</td>
                    <td className="py-1 text-right">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : undefined}
        </Section>
      )}

      {isSw && (
        <Section title={tr('MAC address table', 'Table d’adresses MAC')} empty={tr('Empty — the switch has not seen any frame yet.', 'Vide — le switch n’a encore vu aucune trame.')}>
          {mac.length ? (
            <table className="w-full text-left font-mono text-[0.7rem]">
              <thead className="text-dim">
                <tr>
                  <th className="pb-1 font-normal">VLAN</th>
                  <th className="pb-1 font-normal">MAC</th>
                  <th className="pb-1 text-right font-normal">Port</th>
                </tr>
              </thead>
              <tbody>
                {mac.map(([k, p]) => {
                  const [vlan, m] = k.split('|')
                  return (
                    <tr key={k} className={row(hot('mac', k))}>
                      <td className="py-1 pr-2">{vlan}</td>
                      <td className="py-1 pr-2">{m}</td>
                      <td className="py-1 text-right text-cyan">{p}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          ) : undefined}
        </Section>
      )}

      {routed && (
        <Section title={tr('Routing table', 'Table de routage')}>
          <table className="w-full text-left font-mono text-[0.7rem]">
            <tbody>
              {routeTable(d).map((r) => (
                <tr key={r.key + r.code} className={row(hot('route', r.key))}>
                  <td className="py-1 pr-2 font-bold text-purple">{r.code}</td>
                  <td className="py-1 pr-2">{r.key}</td>
                  <td className="py-1 text-right text-dim">{r.via ? `via ${r.via}` : r.out}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>
      )}
    </aside>
  )
}
