import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowDown, ArrowUp, CheckCircle2, Plus, Save, Search, Trash2, X, XCircle } from 'lucide-react'
import type { FwRule, Msg, OpsWorld, Scenario } from '@/ops/types'
import { diskUsed } from '@/ops/world'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

const useTr = () => {
  const { lang, l } = useI18n()
  return { tr: (en: string, fr: string) => (lang === 'fr' ? fr : en), l, lang }
}

/* ================================ Monitoring ================================ */

export function Monitor({ sc, world }: { sc: Scenario; world: OpsWorld }) {
  const { tr, l } = useTr()
  const servers = world.topo.devices.filter((d) => (world.svcs[d.id]?.length ?? 0) > 0)
  return (
    <div className="h-full space-y-5 overflow-y-auto p-4" data-lenis-prevent>
      <section>
        <p className="hud-label mb-2">{tr('Service checks', 'Contrôles de service')}</p>
        <ul className="space-y-1.5">
          {sc.checks.map((c) => {
            const ok = c.test(world)
            return (
              <li key={c.id} className={cn('flex items-center gap-2.5 rounded-xl border px-3 py-2 text-sm transition-colors', ok ? 'border-success/25 bg-success/5' : 'border-danger/25 bg-danger/5')}>
                {ok ? <CheckCircle2 size={16} className="shrink-0 text-success" /> : <XCircle size={16} className="shrink-0 text-danger" />}
                <span className="min-w-0 flex-1">{l(c.label)}</span>
                <span className={cn('font-mono text-[0.65rem] tracking-wider uppercase', ok ? 'text-success' : 'text-danger')}>{ok ? 'OK' : tr('FAIL', 'ÉCHEC')}</span>
              </li>
            )
          })}
        </ul>
      </section>
      <section>
        <p className="hud-label mb-2">{tr('Servers', 'Serveurs')}</p>
        <div className="grid gap-2 sm:grid-cols-2">
          {servers.map((d) => {
            const size = world.disk[d.id]
            const pct = size ? Math.min(100, Math.round((diskUsed(world, d.id) / size) * 100)) : null
            return (
              <div key={d.id} className="rounded-xl border border-line bg-bg-2/50 p-3">
                <p className="font-mono text-xs font-semibold">{d.name}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {world.svcs[d.id].map((s) => (
                    <span key={s.name} title={s.display} className={cn('rounded-md px-1.5 py-0.5 font-mono text-[0.62rem]', s.state === 'running' ? 'bg-success/10 text-success' : s.state === 'failed' ? 'bg-danger/15 text-danger' : 'bg-warning/10 text-warning')}>
                      {s.name}
                    </span>
                  ))}
                </div>
                {pct !== null && (
                  <div className="mt-2.5">
                    <div className="flex justify-between font-mono text-[0.62rem] text-dim"><span>disk /</span><span className={cn(pct >= 90 && 'text-danger')}>{pct}%</span></div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-line">
                      <motion.div className={cn('h-full rounded-full', pct >= 90 ? 'bg-danger' : pct >= 75 ? 'bg-warning' : 'bg-success')} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

/* ================================ Logs ================================ */

const LEVEL: Record<string, string> = { info: 'text-muted', warn: 'text-warning', error: 'text-danger', crit: 'text-danger font-semibold' }

export function Logs({ world, onOpen }: { world: OpsWorld; onOpen: () => void }) {
  const { tr } = useTr()
  const [src, setSrc] = useState('all')
  const [level, setLevel] = useState('all')
  const [q, setQ] = useState('')
  const opened = useRef(false)
  useEffect(() => {
    if (!opened.current) {
      opened.current = true
      onOpen()
    }
  }, [onOpen])
  const sources = useMemo(() => [...new Set(world.logs.map((x) => x.src))].sort(), [world.logs])
  const rows = world.logs
    .map((x, i) => ({ ...x, i }))
    .filter((x) => (src === 'all' || x.src === src) && (level === 'all' || (level === 'problems' ? x.level !== 'info' : x.level === level)) && (!q || `${x.msg} ${x.svc ?? ''} ${x.id ?? ''}`.toLowerCase().includes(q.toLowerCase())))
    .reverse()
  const sel = 'h-8 rounded-lg border border-line-strong bg-bg-2 px-2 text-xs text-text outline-none focus:border-cyan'
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line p-2">
        <select value={src} onChange={(e) => setSrc(e.target.value)} className={sel} aria-label={tr('Source', 'Source')}>
          <option value="all">{tr('All devices', 'Tous les équipements')}</option>
          {sources.map((s) => <option key={s}>{s}</option>)}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)} className={sel} aria-label={tr('Severity', 'Gravité')}>
          <option value="all">{tr('All levels', 'Tous niveaux')}</option>
          <option value="problems">{tr('Warnings & errors', 'Alertes & erreurs')}</option>
          <option value="error">error</option>
          <option value="crit">critical</option>
        </select>
        <label className="relative min-w-40 flex-1">
          <Search size={13} className="absolute top-1/2 left-2 -translate-y-1/2 text-dim" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={tr('Search…', 'Rechercher…')} className={cn(sel, 'w-full pl-7')} />
        </label>
        <span className="font-mono text-[0.65rem] text-dim">{rows.length}</span>
      </div>
      <div className="min-h-0 flex-1 overflow-auto bg-[#0b0e14] p-2 font-mono text-[0.72rem] leading-relaxed" data-lenis-prevent>
        {rows.map((x) => (
          <div key={x.i} className="grid grid-cols-[4.6rem_6.5rem_1fr] gap-2 border-b border-white/5 py-0.5">
            <span className="text-[#7dcfff]">{x.t}</span>
            <span className="truncate text-[#bb9af7]">{x.src}</span>
            <span className={LEVEL[x.level]}>
              {x.svc && <span className="text-[#9ece6a]">{x.svc}{x.id ? ` (${x.id})` : ''}: </span>}
              {!x.svc && x.id ? <span className="text-[#9ece6a]">Event {x.id}: </span> : null}
              {x.msg}
            </span>
          </div>
        ))}
        {!rows.length && <p className="p-4 text-center text-dim">{tr('No log entries match.', 'Aucune entrée ne correspond.')}</p>}
      </div>
    </div>
  )
}

/* ================================ Firewall ================================ */

export function Firewall({ world, onChange, onOpen }: { world: OpsWorld; onChange: (rules: FwRule[], what: string) => void; onOpen: () => void }) {
  const { tr } = useTr()
  const rules = world.fw?.rules ?? []
  const opened = useRef(false)
  useEffect(() => {
    if (!opened.current) {
      opened.current = true
      onOpen()
    }
  }, [onOpen])
  const set = (i: number, patch: Partial<FwRule>) => onChange(rules.map((r, k) => (k === i ? { ...r, ...patch } : r)), 'fw-edit')
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= rules.length) return
    const next = [...rules]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next, 'fw-move')
  }
  const cell = 'h-7 w-full rounded-md border border-line-strong bg-bg-2 px-1.5 font-mono text-[0.7rem] text-text outline-none focus:border-cyan'
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-line px-3 py-2">
        <div>
          <p className="text-sm font-semibold">FW-EDGE · {tr('Security policy', 'Politique de sécurité')}</p>
          <p className="text-[0.7rem] text-dim">{tr('Rules are evaluated top to bottom — the first match wins. Anything not allowed is denied.', 'Les règles sont évaluées de haut en bas — la première qui correspond l’emporte. Tout ce qui n’est pas autorisé est refusé.')}</p>
        </div>
        <button
          onClick={() => onChange([...rules, { id: `r${Date.now().toString(36)}`, name: 'New-Rule', src: 'any', dst: '172.16.50.10', port: 443, action: 'allow', enabled: false }], 'fw-add')}
          className="flex shrink-0 items-center gap-1 rounded-full border border-line-strong px-3 py-1.5 text-xs hover:border-cyan hover:text-cyan"
        >
          <Plus size={13} /> {tr('Add rule', 'Ajouter')}
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-2" data-lenis-prevent>
        <table className="w-full min-w-[720px] border-separate border-spacing-y-1 text-left text-xs">
          <thead className="font-mono text-[0.62rem] tracking-wider text-dim uppercase">
            <tr>
              <th className="w-8 px-1">#</th>
              <th className="w-10 px-1">{tr('On', 'Actif')}</th>
              <th className="px-1">{tr('Name', 'Nom')}</th>
              <th className="w-36 px-1">{tr('Source', 'Source')}</th>
              <th className="w-36 px-1">{tr('Destination', 'Destination')}</th>
              <th className="w-16 px-1">Port</th>
              <th className="w-24 px-1">Action</th>
              <th className="w-20 px-1" />
            </tr>
          </thead>
          <tbody>
            {rules.map((r, i) => (
              <tr key={r.id} className={cn('align-middle', !r.enabled && 'opacity-55')}>
                <td className="px-1 font-mono text-dim">{i + 1}</td>
                <td className="px-1">
                  <input type="checkbox" checked={r.enabled} onChange={(e) => set(i, { enabled: e.target.checked })} aria-label={tr('Enabled', 'Actif')} className="h-4 w-4 accent-[var(--cyan)]" />
                </td>
                <td className="px-1"><Field value={r.name} onCommit={(v) => set(i, { name: v || r.name })} className={cell} /></td>
                <td className="px-1"><Field value={r.src} onCommit={(v) => set(i, { src: v.trim() || 'any' })} className={cell} /></td>
                <td className="px-1"><Field value={r.dst} onCommit={(v) => set(i, { dst: v.trim() || 'any' })} className={cell} /></td>
                <td className="px-1"><Field value={String(r.port)} onCommit={(v) => { const n = Number(v); set(i, { port: v.trim().toLowerCase() === 'any' || !v.trim() ? 'any' : Number.isInteger(n) && n > 0 && n < 65536 ? n : r.port }) }} className={cell} /></td>
                <td className="px-1">
                  <select value={r.action} onChange={(e) => set(i, { action: e.target.value as FwRule['action'] })} className={cn(cell, r.action === 'allow' ? 'text-success' : 'text-danger')}>
                    <option value="allow">allow</option>
                    <option value="deny">deny</option>
                  </select>
                </td>
                <td className="px-1">
                  <div className="flex gap-0.5">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="grid h-7 w-6 place-items-center rounded text-muted hover:text-text disabled:opacity-30" aria-label={tr('Move up', 'Monter')}><ArrowUp size={13} /></button>
                    <button onClick={() => move(i, 1)} disabled={i === rules.length - 1} className="grid h-7 w-6 place-items-center rounded text-muted hover:text-text disabled:opacity-30" aria-label={tr('Move down', 'Descendre')}><ArrowDown size={13} /></button>
                    <button onClick={() => onChange(rules.filter((_, k) => k !== i), 'fw-del')} className="grid h-7 w-6 place-items-center rounded text-muted hover:text-danger" aria-label={tr('Delete', 'Supprimer')}><Trash2 size={13} /></button>
                  </div>
                </td>
              </tr>
            ))}
            <tr className="opacity-70">
              <td className="px-1 font-mono text-dim">∞</td>
              <td className="px-1" />
              <td className="px-1 font-mono text-[0.7rem] text-dim" colSpan={5}>implicit-deny · any → any · any · deny</td>
              <td />
            </tr>
          </tbody>
        </table>
        <p className="mt-3 px-1 text-[0.7rem] text-dim">{tr('Source/destination: "any", a host (172.16.50.10) or a network (10.10.0.0/16). Port: a number or "any". Press Enter to apply a field.', 'Source/destination : « any », un hôte (172.16.50.10) ou un réseau (10.10.0.0/16). Port : un nombre ou « any ». Entrée pour appliquer un champ.')}</p>
      </div>
    </div>
  )
}

function Field({ value, onCommit, className }: { value: string; onCommit: (v: string) => void; className?: string }) {
  const [v, setV] = useState(value)
  useEffect(() => {
    setV(value)
  }, [value])
  return (
    <input
      value={v}
      onChange={(e) => setV(e.target.value)}
      onBlur={() => v !== value && onCommit(v)}
      onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
      spellCheck={false}
      className={className}
    />
  )
}

/* ================================ Editor ================================ */

export function Editor({ path, host, initial, onSave, onClose }: { path: string; host: string; initial: string; onSave: (content: string) => void; onClose: () => void }) {
  const { tr } = useTr()
  const [text, setText] = useState(initial)
  const [saved, setSaved] = useState(true)
  const gutter = useRef<HTMLDivElement>(null)
  const lines = text.split('\n').length
  return (
    <div className="flex h-full flex-col bg-[#0b0e14]">
      <div className="flex items-center gap-2 border-b border-white/10 px-3 py-1.5 font-mono text-[0.72rem] text-[#c0caf5]">
        <span className="rounded bg-white/10 px-1.5">GNU nano 7.2</span>
        <span className="min-w-0 flex-1 truncate">{host}:{path}{saved ? '' : ' *'}</span>
        <button onClick={() => { onSave(text); setSaved(true) }} className="flex items-center gap-1 rounded-md bg-cyan px-2.5 py-1 font-sans text-xs font-semibold text-on-accent"><Save size={12} /> {tr('Save', 'Enregistrer')} (^O)</button>
        <button onClick={onClose} className="grid h-6 w-6 place-items-center rounded text-[#c0caf5] hover:bg-white/10" aria-label={tr('Close', 'Fermer')}><X size={14} /></button>
      </div>
      <div className="relative flex min-h-0 flex-1">
        <div ref={gutter} className="overflow-hidden py-2 pr-2 pl-3 text-right font-mono text-[0.75rem] leading-[1.5] text-[#565f89] select-none" aria-hidden>
          {Array.from({ length: lines }, (_, i) => <div key={i}>{i + 1}</div>)}
        </div>
        <textarea
          value={text}
          spellCheck={false}
          autoFocus
          data-lenis-prevent
          onScroll={(e) => { if (gutter.current) gutter.current.scrollTop = e.currentTarget.scrollTop }}
          onChange={(e) => { setText(e.target.value); setSaved(false) }}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'o')) {
              e.preventDefault()
              onSave(text)
              setSaved(true)
            }
          }}
          aria-label={path}
          className="min-h-0 flex-1 resize-none bg-transparent py-2 pr-3 font-mono text-[0.75rem] leading-[1.5] whitespace-pre text-[#c0caf5] caret-[#7dcfff] outline-none"
        />
      </div>
    </div>
  )
}

/* ================================ Inbox ================================ */

const TONE: Record<NonNullable<Msg['tone']>, string> = {
  normal: 'border-line bg-bg-2/60',
  angry: 'border-danger/30 bg-danger/5',
  happy: 'border-success/30 bg-success/5',
  system: 'border-cyan/25 bg-cyan-soft',
}

export function Inbox({ sc, msgs, asked, onReply }: { sc: Scenario; msgs: (Msg & { mine?: boolean })[]; asked: string[]; onReply: (id: string) => void }) {
  const { tr, l } = useTr()
  const box = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = box.current
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [msgs.length])
  const open = (sc.replies ?? []).filter((r) => !asked.includes(r.id))
  return (
    <div className="flex h-full flex-col">
      <div ref={box} className="min-h-0 flex-1 space-y-2.5 overflow-y-auto p-3" data-lenis-prevent>
        <AnimatePresence initial={false}>
          {msgs.map((m) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={cn('rounded-2xl border p-3 text-sm', m.mine ? 'ml-8 border-cyan/30 bg-cyan-soft' : TONE[m.tone ?? 'normal'])}>
              <div className="mb-1 flex items-baseline gap-2">
                <span className="font-semibold">{m.mine ? tr('You', 'Vous') : m.from}</span>
                {!m.mine && <span className="truncate text-[0.7rem] text-dim">{l(m.role)}</span>}
                <span className="ml-auto font-mono text-[0.65rem] text-dim">{m.t}</span>
              </div>
              <p className="leading-relaxed text-muted">{l(m.text)}</p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      {open.length > 0 && (
        <div className="border-t border-line p-2">
          <p className="hud-label mb-1.5 px-1">{tr(`Reply to ${sc.ticket.from}`, `Répondre à ${sc.ticket.from}`)}</p>
          <div className="flex flex-col gap-1">
            {open.map((r) => (
              <button key={r.id} onClick={() => onReply(r.id)} className="rounded-xl border border-line px-3 py-1.5 text-left text-xs text-muted transition-colors hover:border-cyan hover:text-text">
                {l(r.label)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
