import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import {
  Activity, AlertTriangle, ArrowLeft, BellRing, Briefcase, CheckCircle2, ClipboardCheck, Clock3, Cpu, FileText, Flame, Lightbulb, ListTree, MessageSquare,
  Power, RotateCcw, ScrollText, Shield, Siren, TerminalSquare, Timer, Trophy, X, XCircle, Zap,
} from 'lucide-react'
import { INCIDENTS, incidentById } from '@/content/incidents'
import type { FwRule, Msg, OpsEvent, OpsWorld, Scenario, ToolId } from '@/ops/types'
import { applyEvent, allHazards, isResolved, score, startSession, tick, type Score, type Session } from '@/ops/session'
import { banner, runShell, shellPrompt } from '@/ops/shells'
import { ipOf, powerCycle, stamp } from '@/ops/world'
import { initialIos, type IosState } from '@/sim/ios'
import type { ArpCache } from '@/sim/engine'
import { MODELS, isHost } from '@/sim/types'
import { OpsMap, useHealth } from '@/components/ops/OpsMap'
import { Editor, Firewall, Inbox, Logs, Monitor } from '@/components/ops/Panels'
import { Terminal, type TerminalApi } from '@/components/sim/Terminal'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { useProgress } from '@/store/progress'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

const useTr = () => {
  const { lang, l } = useI18n()
  return { tr: useCallback((en: string, fr: string) => (lang === 'fr' ? fr : en), [lang]), l, lang }
}

const CAT_ICON = { network: ListTree, server: Cpu, identity: Briefcase, security: Shield }
const PRIORITY_TONE = { P1: 'danger', P2: 'warning', P3: 'cyan' } as const
const GRADE_COLOR: Record<string, string> = { S: 'text-cyan', A: 'text-success', B: 'text-success', C: 'text-warning', D: 'text-warning', F: 'text-danger' }

const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function OpsPage() {
  const { id } = useParams()
  if (!id) return <OpsIndex />
  const sc = incidentById(id)
  if (!sc) return <OpsIndex />
  return <IncidentRun key={sc.id} sc={sc} />
}

/* ================================ Index ================================ */

function OpsIndex() {
  const { tr, l } = useTr()
  const results = useProgress((s) => s.incidents)
  const [cat, setCat] = useState<'all' | Scenario['category']>('all')
  useEffect(() => {
    document.title = `${tr('IT Operations Simulator', 'Simulateur d’exploitation IT')} · NetLab Academy`
  }, [tr])
  const resolved = INCIDENTS.filter((s) => results[s.id]?.resolvedAt).length
  const list = INCIDENTS.filter((s) => cat === 'all' || s.category === cat)
  const cats: [typeof cat, string][] = [['all', tr('All', 'Tous')], ['network', tr('Network', 'Réseau')], ['server', tr('Servers', 'Serveurs')], ['identity', tr('Identity', 'Identité')], ['security', tr('Security', 'Sécurité')]]
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <p className="hud-label flex items-center gap-2"><Siren size={13} className="text-danger" /> {tr('On call · Meridian Logistics', 'D’astreinte · Meridian Logistics')}</p>
      <h1 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1] font-semibold tracking-[-0.04em]">{tr('IT Operations Simulator', 'Simulateur d’exploitation IT')}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">
        {tr(
          'Real incidents in a living company network. Investigate with real commands, talk to users, fix the root cause — and live with the consequences of every action. Each incident ends with a scored incident report.',
          'De vrais incidents dans le réseau vivant d’une entreprise. Enquêtez avec de vraies commandes, parlez aux utilisateurs, corrigez la cause racine — et assumez les conséquences de chaque action. Chaque incident se termine par un rapport noté.',
        )}
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <div className="flex items-center gap-3">
          <ProgressRing value={resolved / INCIDENTS.length} size={52} stroke={4} delay={0}><span className="font-mono text-[0.7rem]">{resolved}/{INCIDENTS.length}</span></ProgressRing>
          <span className="text-sm text-muted">{tr('incidents resolved', 'incidents résolus')}</span>
        </div>
        <div className="flex flex-wrap gap-1.5" role="tablist">
          {cats.map(([k, label]) => (
            <button key={k} role="tab" aria-selected={cat === k} onClick={() => setCat(k)} className={cn('rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors', cat === k ? 'border-cyan bg-cyan-soft text-text' : 'border-line text-muted hover:text-text')}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <motion.div layout className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {list.map((s) => {
            const r = results[s.id]
            const Icon = CAT_ICON[s.category]
            return (
              <motion.div key={s.id} layout initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
                <Link to={`/simulator/${s.id}`} className="group glass relative flex h-full flex-col overflow-hidden rounded-3xl p-6 transition-colors hover:border-line-strong">
                  <span className={cn('absolute top-0 left-0 h-full w-1', s.ticket.priority === 'P1' ? 'bg-danger' : s.ticket.priority === 'P2' ? 'bg-warning' : 'bg-cyan')} />
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2 font-mono text-xs text-cyan"><Icon size={13} /> INC {String(s.number).padStart(2, '0')}</span>
                    {r?.resolvedAt ? (
                      <span className={cn('font-display text-2xl leading-none font-bold', GRADE_COLOR[r.grade])}>{r.grade}</span>
                    ) : r ? <Chip tone="warning">{tr('Unresolved', 'Non résolu')}</Chip> : <Chip tone={PRIORITY_TONE[s.ticket.priority]}>{s.ticket.priority}</Chip>}
                  </div>
                  <h2 className="mt-3 font-display text-xl font-semibold tracking-tight group-hover:text-cyan">{l(s.title)}</h2>
                  <p className="mt-1.5 line-clamp-3 text-sm text-muted">{l(s.ticket.body)}</p>
                  <div className="mt-auto flex items-center gap-3 pt-5 font-mono text-[0.68rem] text-dim">
                    <span>{'●'.repeat(s.difficulty)}{'○'.repeat(3 - s.difficulty)}</span>
                    <span>~{s.minutes} min</span>
                    <span>{s.xp} XP</span>
                    {r?.resolvedAt && <span className="ml-auto">{r.best}/100</span>}
                  </div>
                  <span className="mt-4 text-xs font-semibold tracking-wider text-cyan uppercase">{r?.resolvedAt ? tr('Replay', 'Rejouer') : tr('Take the ticket', 'Prendre le ticket')} →</span>
                </Link>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

/* ================================ Incident run ================================ */

type Phase = 'brief' | 'live' | 'report'

function IncidentRun({ sc }: { sc: Scenario }) {
  const [phase, setPhase] = useState<Phase>('brief')
  const [result, setResult] = useState<{ score: Score; session: Session; cause: string; xp: number; notes: string } | null>(null)
  const [run, setRun] = useState(0)
  const { l } = useTr()
  useEffect(() => {
    document.title = `${l(sc.title)} · NetLab Academy`
  }, [sc, l])
  if (phase === 'brief') return <Briefing sc={sc} onStart={() => setPhase('live')} />
  if (phase === 'report' && result) return <Report sc={sc} {...result} onRetry={() => { setResult(null); setRun((n) => n + 1); setPhase('brief') }} />
  return <Console key={run} sc={sc} onClose={(r) => { setResult(r); setPhase('report') }} />
}

/* ------------------------------ Briefing ------------------------------ */

function Briefing({ sc, onStart }: { sc: Scenario; onStart: () => void }) {
  const { tr, l } = useTr()
  const reduced = useReducedMotionPref()
  const toolLabel: Record<ToolId, string> = { map: tr('Live network map', 'Carte réseau en direct'), terminal: tr('Remote consoles', 'Consoles distantes'), logs: tr('Central log viewer', 'Journaux centralisés'), monitor: tr('Monitoring', 'Supervision'), firewall: tr('Firewall manager', 'Gestion du pare-feu'), editor: tr('Config editor', 'Éditeur de configuration') }
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <Link to="/simulator" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text"><ArrowLeft size={15} /> {tr('All incidents', 'Tous les incidents')}</Link>
      <motion.div initial={reduced ? false : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <p className="hud-label mt-8 flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5"><span className="absolute inset-0 animate-ping rounded-full bg-danger opacity-70" /><span className="relative h-2.5 w-2.5 rounded-full bg-danger" /></span>
          {tr('Incoming incident', 'Incident entrant')} · {sc.ticket.id}
        </p>
        <h1 className="mt-3 font-display text-[clamp(2rem,4.6vw,3.4rem)] leading-[1.05] font-semibold tracking-[-0.03em]">{l(sc.title)}</h1>
        <div className="mt-4 flex flex-wrap gap-2">
          <Chip tone={PRIORITY_TONE[sc.ticket.priority]}>{sc.ticket.priority}</Chip>
          <Chip>{tr('Difficulty', 'Difficulté')} {'●'.repeat(sc.difficulty)}{'○'.repeat(3 - sc.difficulty)}</Chip>
          <Chip>{tr('Target', 'Objectif')} ~{sc.minutes} min</Chip>
          <Chip tone="purple">{sc.xp} XP</Chip>
        </div>
        <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted">{l(sc.intro)}</p>
      </motion.div>

      <div className="mt-8 grid gap-4 md:grid-cols-[1.3fr_1fr]">
        <motion.section initial={reduced ? false : { opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-3xl p-5">
          <div className="flex items-center justify-between">
            <p className="hud-label flex items-center gap-2"><BellRing size={13} /> {tr('Ticket', 'Ticket')} {sc.ticket.id}</p>
            <Chip tone={PRIORITY_TONE[sc.ticket.priority]}>{sc.ticket.priority}</Chip>
          </div>
          <p className="mt-3 font-semibold">{l(sc.ticket.subject)}</p>
          <p className="mt-1 text-xs text-dim">{sc.ticket.from} · {l(sc.ticket.dept)}</p>
          <p className="mt-3 rounded-2xl border border-line bg-bg-2/60 p-4 text-sm leading-relaxed text-muted">“{l(sc.ticket.body)}”</p>
        </motion.section>
        <motion.section initial={reduced ? false : { opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="glass rounded-3xl p-5">
          <p className="hud-label">{tr('Your role', 'Votre rôle')}</p>
          <p className="mt-2 font-semibold">{l(sc.role)}</p>
          <p className="mt-1 text-sm text-muted">{l(sc.company)}</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {sc.duties.map((x, i) => <li key={i} className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-cyan" />{l(x)}</li>)}
          </ul>
        </motion.section>
      </div>

      <section className="mt-4 glass rounded-3xl p-5">
        <p className="hud-label">{tr('How it works', 'Comment ça marche')}</p>
        <div className="mt-3 grid gap-3 text-sm text-muted sm:grid-cols-3">
          <p><span className="font-semibold text-text">{tr('Investigate.', 'Enquêtez.')}</span> {tr('Click any device on the map to open its console (Windows, PowerShell, Linux or Cisco IOS). Type help in any console.', 'Cliquez sur un équipement pour ouvrir sa console (Windows, PowerShell, Linux ou Cisco IOS). Tapez help dans n’importe quelle console.')}</p>
          <p><span className="font-semibold text-text">{tr('Act carefully.', 'Agissez prudemment.')}</span> {tr('The environment reacts. Wrong or risky actions have consequences and cost points. Hints are available but cost points too.', 'L’environnement réagit. Les actions fausses ou risquées ont des conséquences et coûtent des points. Les indices aussi.')}</p>
          <p><span className="font-semibold text-text">{tr('Close the ticket.', 'Clôturez le ticket.')}</span> {tr('When monitoring is green, state the root cause. You are scored on troubleshooting, accuracy, time and efficiency.', 'Quand la supervision est verte, indiquez la cause racine. Vous êtes noté sur la démarche, la justesse, le temps et l’efficacité.')}</p>
        </div>
        <div className="mt-4 flex flex-wrap gap-1.5">{sc.tools.map((t) => <Chip key={t} tone="cyan">{toolLabel[t]}</Chip>)}</div>
      </section>

      <div className="mt-8 flex justify-end">
        <Button size="lg" onClick={onStart} icon={<Zap size={16} />}>{tr('Start investigating', 'Commencer l’enquête')}</Button>
      </div>
    </div>
  )
}

/* ------------------------------ Console ------------------------------ */

type Tab = { kind: 'term'; dev: string } | { kind: 'logs' } | { kind: 'monitor' } | { kind: 'firewall' } | { kind: 'editor'; dev: string; path: string }
const tabKey = (t: Tab) => (t.kind === 'term' ? `term:${t.dev}` : t.kind === 'editor' ? `edit:${t.dev}:${t.path}` : t.kind)

function Console({ sc, onClose }: { sc: Scenario; onClose: (r: { score: Score; session: Session; cause: string; xp: number; notes: string }) => void }) {
  const { tr, l } = useTr()
  const [session, setSession] = useState<Session>(() => startSession(sc))
  const ref = useRef(session)
  ref.current = session
  const t0 = useRef(0)
  useEffect(() => {
    t0.current = performance.now()
  }, [])
  const [now, setNow] = useState(0)
  const elapsed = () => (performance.now() - t0.current) / 1000
  const rt = useRef<{ arp: ArpCache; ios: Map<string, IosState> }>({ arp: new Map(), ios: new Map() }).current
  const [selected, setSelected] = useState<string | null>(null)
  const [tabs, setTabs] = useState<Tab[]>([{ kind: 'monitor' }])
  const [active, setActive] = useState('monitor')
  const [left, setLeft] = useState<'inbox' | 'hints'>('inbox')
  const [mine, setMine] = useState<(Msg & { mine?: boolean })[]>([])
  const [asked, setAsked] = useState<string[]>([])
  const [shownHints, setShownHints] = useState(0)
  const [closing, setClosing] = useState(false)
  const [actionOut, setActionOut] = useState<string | null>(null)
  const [unread, setUnread] = useState(0)
  const lastMsgs = useRef(session.msgs.length)
  const reduced = useReducedMotionPref()

  // Clock & pressure messages
  useEffect(() => {
    const iv = window.setInterval(() => {
      const e = elapsed()
      setNow(e)
      const next = tick(sc, ref.current, e)
      if (next !== ref.current) {
        ref.current = next
        setSession(next)
      }
    }, 1000)
    return () => window.clearInterval(iv)
  }, [sc])

  useEffect(() => {
    if (session.msgs.length > lastMsgs.current && left !== 'inbox') setUnread((n) => n + session.msgs.length - lastMsgs.current)
    lastMsgs.current = session.msgs.length
  }, [session.msgs.length, left])

  const commit = useCallback((e: Omit<OpsEvent, 'at'>, after: OpsWorld) => {
    const at = elapsed()
    const next = applyEvent(sc, ref.current, { ...e, at }, { ...after, elapsed: at })
    ref.current = next
    setSession(next)
  }, [sc])

  const openTab = useCallback((t: Tab) => {
    const k = tabKey(t)
    setTabs((ts) => (ts.some((x) => tabKey(x) === k) ? ts : [...ts, t]))
    setActive(k)
  }, [])
  const closeTab = (k: string) => {
    setTabs((ts) => {
      const next = ts.filter((x) => tabKey(x) !== k)
      if (active === k) setActive(next.length ? tabKey(next[next.length - 1]) : '')
      return next
    })
  }

  const world = session.world
  const noConsole = (world.flags.noConsole as string[] | undefined) ?? []
  const dev = (id: string) => world.topo.devices.find((d) => d.id === id)

  // One terminal API per device; reads the latest session through the ref.
  const apis = useRef(new Map<string, TerminalApi>())
  const apiFor = (id: string): TerminalApi => {
    let api = apis.current.get(id)
    if (!api) {
      api = {
        get prompt() {
          return shellPrompt(ref.current.world, id, rt.ios.get(id) ?? initialIos())
        },
        run: (line: string) => {
          const at = elapsed()
          const w = { ...ref.current.world, elapsed: at }
          const r = runShell(w, id, line, { scenario: sc, arp: rt.arp, ios: rt.ios.get(id) ?? initialIos() })
          if (r.ios) rt.ios.set(id, r.ios)
          if (line.trim()) commit({ kind: 'cmd', dev: dev(id)?.name ?? id, line, tags: r.tags }, r.world)
          if (r.edit) {
            const devId = id
            const path = r.edit
            window.setTimeout(() => openTab({ kind: 'editor', dev: devId, path }), 0)
          }
          return { out: r.out, clear: r.clear }
        },
      }
      apis.current.set(id, api)
    }
    return api
  }

  const openConsole = (id: string) => {
    if (noConsole.includes(id)) return
    openTab({ kind: 'term', dev: id })
  }

  const powerCycleDev = (id: string) => {
    const d = dev(id)
    if (!d) return
    if (!window.confirm(tr(`Power-cycle ${d.name}? Anyone using it will be disconnected.`, `Redémarrer électriquement ${d.name} ? Ses utilisateurs seront déconnectés.`))) return
    const isServer = d.type === 'server'
    commit({ kind: 'act', line: 'power', dev: d.name, tags: [isServer ? 'reboot' : 'pc-reboot'] }, powerCycle(ref.current.world, id, sc.startCheck))
    setActionOut(tr(`${d.name} restarted.`, `${d.name} a redémarré.`))
  }

  const runAction = (aid: string) => {
    const a = sc.actions?.find((x) => x.id === aid)
    if (!a) return
    const r = a.apply(ref.current.world)
    commit({ kind: 'act', line: aid, dev: dev(a.dev)?.name }, r.world ?? ref.current.world)
    setActionOut(r.out ? l(r.out) : null)
  }

  const reply = (rid: string) => {
    const r = sc.replies?.find((x) => x.id === rid)
    if (!r) return
    const t = stamp({ ...ref.current.world, elapsed: elapsed() }, false)
    setMine((m) => [...m, { id: `me-${rid}`, t, from: 'you', role: { en: '', fr: '' }, text: r.label, mine: true }])
    setAsked((a) => [...a, rid])
    commit({ kind: 'act', line: `reply:${rid}` }, ref.current.world)
    window.setTimeout(() => {
      setMine((m) => [...m, { id: `ans-${rid}`, t: stamp({ ...ref.current.world, elapsed: elapsed() }, false), from: sc.ticket.from, role: sc.ticket.dept, text: r.answer, tone: 'normal' }])
    }, reduced ? 0 : 900)
  }

  const hint = () => {
    if (shownHints >= sc.hints.length) return
    setShownHints((n) => n + 1)
    const next = { ...ref.current, hints: ref.current.hints + 1 }
    ref.current = next
    setSession(next)
    setLeft('hints')
  }

  const fwChange = (rules: FwRule[], what: string) => {
    const w = ref.current.world
    if (!w.fw) return
    commit({ kind: 'act', line: what }, { ...w, fw: { ...w.fw, rules } })
  }
  const onLogs = useCallback(() => commit({ kind: 'act', line: 'view-logs' }, ref.current.world), [commit])
  const onFw = useCallback(() => commit({ kind: 'act', line: 'fw-view' }, ref.current.world), [commit])

  const saveFile = (devId: string, path: string, content: string) => {
    const w = ref.current.world
    const files = w.files[devId] ?? {}
    const f = files[path] ?? { size: 0 }
    commit({ kind: 'act', line: 'file-save', dev: dev(devId)?.name, tags: [`edit:${path}`, `save:${path}`] }, { ...w, files: { ...w.files, [devId]: { ...files, [path]: { ...f, content, size: content.length } } } })
  }

  // Merge conversation: scenario messages + my replies, by time of arrival.
  const thread = useMemo(() => {
    // My replies go after the latest scenario message that existed when they were sent.
    const out: (Msg & { mine?: boolean })[] = []
    const sys = session.msgs
    let mi = 0
    for (let i = 0; i < sys.length; i++) {
      out.push(sys[i])
      while (mi < mine.length && (mine[mi].t <= (sys[i + 1]?.t ?? '99:99'))) out.push(mine[mi++])
    }
    while (mi < mine.length) out.push(mine[mi++])
    return out
  }, [session.msgs, mine])

  const resolved = isResolved(sc, world)
  const sel = selected ? dev(selected) : undefined
  const health = useHealth(world, sc.nms)
  const clock = stamp({ ...world, elapsed: now }, false)
  const target = sc.minutes * 60

  const TOOL_TABS: { k: Tab; icon: typeof Activity; label: string; show: boolean }[] = [
    { k: { kind: 'monitor' }, icon: Activity, label: tr('Monitoring', 'Supervision'), show: sc.tools.includes('monitor') },
    { k: { kind: 'logs' }, icon: ScrollText, label: tr('Logs', 'Journaux'), show: sc.tools.includes('logs') },
    { k: { kind: 'firewall' }, icon: Shield, label: tr('Firewall', 'Pare-feu'), show: sc.tools.includes('firewall') },
  ]

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden pt-20 max-lg:h-auto max-lg:overflow-visible">
      {/* top bar */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line px-4 py-2.5 sm:px-6">
        <Link to="/simulator" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-cyan-soft hover:text-text" aria-label={tr('All incidents', 'Tous les incidents')}><ArrowLeft size={17} /></Link>
        <div className="min-w-0">
          <p className="hud-label flex items-center gap-2">{sc.ticket.id} <Chip tone={PRIORITY_TONE[sc.ticket.priority]} className="!py-0">{sc.ticket.priority}</Chip></p>
          <h1 className="truncate font-display text-base font-semibold sm:text-lg">{l(sc.title)}</h1>
        </div>
        <div className="ml-auto flex items-center gap-3 sm:gap-5">
          <div className="hidden text-right sm:block">
            <p className="hud-label">{tr('Office time', 'Heure')}</p>
            <p className="font-mono text-sm">{clock}</p>
          </div>
          <div className="text-right">
            <p className="hud-label flex items-center justify-end gap-1"><Timer size={11} /> {tr('Elapsed', 'Écoulé')}</p>
            <p className={cn('font-mono text-sm tabular-nums', now > target ? 'text-warning' : 'text-text')}>{mmss(now)}<span className="text-dim"> / {mmss(target)}</span></p>
          </div>
          <div className={cn('hidden items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[0.7rem] md:flex', resolved ? 'border-success/40 text-success' : 'border-danger/40 text-danger')}>
            <span className={cn('h-2 w-2 rounded-full', resolved ? 'bg-success' : 'animate-pulse bg-danger')} />
            {resolved ? tr('SERVICE RESTORED', 'SERVICE RÉTABLI') : tr('INCIDENT OPEN', 'INCIDENT OUVERT')}
          </div>
          <Button variant="ghost" size="sm" onClick={hint} disabled={shownHints >= sc.hints.length} icon={<Lightbulb size={14} />}>
            <span className="hidden sm:inline">{tr('Hint', 'Indice')}</span> <span className="font-mono text-[0.7rem] text-dim">{sc.hints.length - shownHints}</span>
          </Button>
          <Button size="sm" onClick={() => setClosing(true)} icon={<ClipboardCheck size={14} />}>{tr('Close ticket', 'Clôturer')}</Button>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 lg:grid-cols-[330px_1fr] lg:overflow-hidden">
        {/* left: ticket conversation & hints */}
        <aside className="flex min-h-0 flex-col border-b border-line max-lg:h-[420px] lg:border-r lg:border-b-0">
          <div role="tablist" className="flex border-b border-line">
            {([['inbox', tr('Messages', 'Messages'), MessageSquare], ['hints', tr('Hints', 'Indices'), Lightbulb]] as const).map(([k, label, Icon]) => (
              <button key={k} role="tab" aria-selected={left === k} onClick={() => { setLeft(k); if (k === 'inbox') setUnread(0) }} className={cn('relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium', left === k ? 'text-text' : 'text-muted hover:text-text')}>
                <Icon size={13} /> {label}
                {k === 'inbox' && unread > 0 && <span className="grid h-4 min-w-4 place-items-center rounded-full bg-danger px-1 font-mono text-[0.6rem] text-white">{unread}</span>}
                {left === k && <motion.span layoutId="ops-left" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan" />}
              </button>
            ))}
          </div>
          {left === 'inbox' ? (
            <>
              <div className="border-b border-line px-3 py-2.5">
                <p className="text-sm font-semibold">{l(sc.ticket.subject)}</p>
                <p className="text-[0.7rem] text-dim">{sc.ticket.from} · {l(sc.ticket.dept)}</p>
              </div>
              <div className="min-h-0 flex-1"><Inbox sc={sc} msgs={thread} asked={asked} onReply={reply} /></div>
            </>
          ) : (
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3" data-lenis-prevent>
              <p className="text-xs text-dim">{tr('Each hint costs 4 efficiency points. Try investigating first!', 'Chaque indice coûte 4 points d’efficacité. Enquêtez d’abord !')}</p>
              {sc.hints.slice(0, shownHints).map((h, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-warning/30 bg-warning/5 p-3 text-sm">
                  <p className="hud-label mb-1 text-warning">{tr('Hint', 'Indice')} {i + 1}</p>
                  <p className="text-muted">{l(h)}</p>
                </motion.div>
              ))}
              {shownHints < sc.hints.length && (
                <button onClick={hint} className="w-full rounded-2xl border border-dashed border-line-strong p-3 text-sm text-muted hover:border-warning hover:text-warning">
                  <Lightbulb size={14} className="mr-1.5 inline" />{tr('Reveal next hint', 'Afficher l’indice suivant')}
                </button>
              )}
            </div>
          )}
        </aside>

        {/* right: map + tools */}
        <div className="flex min-h-0 flex-col">
          <div className="relative min-h-0 border-b border-line bg-bg-2/30 max-lg:h-[340px] lg:h-[50%]">
            <OpsMap world={world} nms={sc.nms} selected={selected} onSelect={(id) => { setSelected(id); setActionOut(null) }} />
            <div className="pointer-events-none absolute bottom-2 left-3 flex gap-3 font-mono text-[0.6rem] text-dim">
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-success" />{tr('reachable', 'joignable')}</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-warning" />{tr('service issue', 'service en défaut')}</span>
              <span><span className="mr-1 inline-block h-2 w-2 rounded-full bg-danger" />{tr('unreachable', 'injoignable')}</span>
            </div>
            <p className="pointer-events-none absolute top-2 left-3 font-mono text-[0.62rem] text-dim">{tr('Click a device to inspect it or open its console', 'Cliquez sur un équipement pour l’inspecter ou ouvrir sa console')}</p>
            <AnimatePresence>
              {sel && (
                <motion.div key={sel.id} initial={{ opacity: 0, x: sel.x > 550 ? -16 : 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} className={cn('glass absolute top-2 bottom-2 z-10 flex w-[240px] flex-col overflow-y-auto rounded-2xl p-3 text-sm', sel.x > 550 ? 'left-2' : 'right-2')} data-lenis-prevent>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-mono text-xs text-cyan">{sel.id === 'isp' ? 'ISP' : MODELS[sel.type]}</p>
                      <p className="font-semibold">{sel.name}</p>
                    </div>
                    <button onClick={() => setSelected(null)} className="grid h-6 w-6 place-items-center rounded-full text-muted hover:text-text" aria-label={tr('Close', 'Fermer')}><X size={14} /></button>
                  </div>
                  <dl className="mt-2 space-y-0.5 font-mono text-[0.7rem] text-muted">
                    {ipOf(world, sel.id) && <div className="flex justify-between gap-2"><dt>IP</dt><dd className="text-text">{ipOf(world, sel.id)}</dd></div>}
                    <div className="flex justify-between gap-2"><dt>{tr('System', 'Système')}</dt><dd className="text-text">{noConsole.includes(sel.id) ? tr('unmanaged', 'non administrable') : { win: 'Windows 11', winsrv: 'Windows Server 2022', linux: 'Ubuntu 24.04', ios: 'Cisco IOS' }[world.os[sel.id]]}</dd></div>
                    <div className="flex justify-between gap-2"><dt>{tr('Monitoring', 'Supervision')}</dt><dd className={cn(health[sel.id] === 'ok' ? 'text-success' : health[sel.id] === 'warn' ? 'text-warning' : health[sel.id] === 'down' ? 'text-danger' : 'text-dim')}>{{ ok: 'UP', warn: 'DEGRADED', down: 'DOWN', none: 'n/a' }[health[sel.id]]}</dd></div>
                  </dl>
                  {(world.svcs[sel.id]?.length ?? 0) > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {world.svcs[sel.id].map((s) => <span key={s.name} className={cn('rounded px-1.5 py-0.5 font-mono text-[0.6rem]', s.state === 'running' ? 'bg-success/10 text-success' : 'bg-danger/15 text-danger')}>{s.name}</span>)}
                    </div>
                  )}
                  <div className="mt-3 flex flex-col gap-1.5">
                    {!noConsole.includes(sel.id) && sel.id !== 'isp' && (
                      <button onClick={() => openConsole(sel.id)} className="flex items-center gap-2 rounded-xl bg-cyan px-3 py-2 text-xs font-semibold text-on-accent"><TerminalSquare size={14} /> {tr('Open console', 'Ouvrir la console')}</button>
                    )}
                    {sc.actions?.filter((a) => a.dev === sel.id || (a.dev === 'hub' && sel.id === 'hub')).map((a) => (
                      <button key={a.id} onClick={() => runAction(a.id)} className="rounded-xl border border-line-strong px-3 py-2 text-left text-xs hover:border-cyan">{l(a.label)}</button>
                    ))}
                    {isHost(sel.type) && !noConsole.includes(sel.id) && sel.id !== 'probe' && (
                      <button onClick={() => powerCycleDev(sel.id)} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-xs text-muted hover:border-danger hover:text-danger"><Power size={13} /> {tr('Power-cycle', 'Redémarrer (alimentation)')}</button>
                    )}
                  </div>
                  {actionOut && <p className="mt-3 rounded-xl border border-cyan/25 bg-cyan-soft p-2.5 text-xs leading-relaxed">{actionOut}</p>}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* tool tabs */}
          <div className="flex min-h-0 flex-1 flex-col max-lg:h-[560px]">
            <div className="flex items-center gap-0.5 overflow-x-auto border-b border-line px-2" role="tablist">
              {TOOL_TABS.filter((x) => x.show).map(({ k, icon: Icon, label }) => {
                const key = tabKey(k)
                const on = active === key
                return (
                  <button key={key} role="tab" aria-selected={on} onClick={() => openTab(k)} className={cn('relative flex shrink-0 items-center gap-1.5 px-3 py-2 text-xs font-medium', on ? 'text-text' : 'text-muted hover:text-text')}>
                    <Icon size={13} /> {label}
                    {on && <motion.span layoutId="ops-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan" />}
                  </button>
                )
              })}
              <span className="mx-1 h-4 w-px bg-line" />
              {tabs.filter((t) => t.kind === 'term' || t.kind === 'editor').map((t) => {
                const key = tabKey(t)
                const on = active === key
                const name = dev(t.dev)?.name ?? t.dev
                return (
                  <div key={key} className={cn('relative flex shrink-0 items-center gap-1 rounded-t-lg pr-1 pl-3', on ? 'bg-[#0b0e14] text-[#c0caf5]' : 'text-muted hover:text-text')}>
                    <button role="tab" aria-selected={on} onClick={() => setActive(key)} className="flex items-center gap-1.5 py-2 font-mono text-[0.72rem]">
                      {t.kind === 'term' ? <TerminalSquare size={12} /> : <FileText size={12} />}
                      {t.kind === 'term' ? name : `${name}:${t.path.split('/').pop()}`}
                    </button>
                    <button onClick={() => closeTab(key)} className="grid h-5 w-5 place-items-center rounded opacity-60 hover:opacity-100" aria-label={tr('Close tab', 'Fermer l’onglet')}><X size={11} /></button>
                  </div>
                )
              })}
            </div>
            <div className="relative min-h-0 flex-1">
              {tabs.map((t) => {
                const key = tabKey(t)
                const on = active === key
                return (
                  <div key={key} className={cn('absolute inset-0', !on && 'hidden')}>
                    {t.kind === 'monitor' && <Monitor sc={sc} world={world} />}
                    {t.kind === 'logs' && <Logs world={world} onOpen={onLogs} />}
                    {t.kind === 'firewall' && <Firewall world={world} onChange={fwChange} onOpen={onFw} />}
                    {t.kind === 'term' && <Terminal api={apiFor(t.dev)} banner={banner(world, t.dev)} autoFocus={on} />}
                    {t.kind === 'editor' && (
                      <Editor path={t.path} host={(dev(t.dev)?.name ?? '').toLowerCase()} initial={world.files[t.dev]?.[t.path]?.content ?? ''} onSave={(c) => saveFile(t.dev, t.path, c)} onClose={() => closeTab(key)} />
                    )}
                  </div>
                )
              })}
              {!tabs.length && <p className="p-6 text-center text-sm text-dim">{tr('Open a tool above, or click a device on the map.', 'Ouvrez un outil ci-dessus, ou cliquez un équipement sur la carte.')}</p>}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>{closing && <CloseTicket sc={sc} session={session} onCancel={() => setClosing(false)} onSubmit={(cause, notes) => {
        const s = ref.current
        const sco = score(sc, s, cause, elapsed())
        const res = useProgress.getState().finishIncident(sc, { total: sco.total, grade: sco.grade, resolved: sco.resolved, seconds: Math.round(sco.seconds) })
        onClose({ score: sco, session: s, cause, xp: res.xp, notes })
      }} />}</AnimatePresence>
    </div>
  )
}

/* ------------------------------ Close ticket ------------------------------ */

function CloseTicket({ sc, session, onCancel, onSubmit }: { sc: Scenario; session: Session; onCancel: () => void; onSubmit: (cause: string, notes: string) => void }) {
  const { tr, l } = useTr()
  const [cause, setCause] = useState('')
  const [notes, setNotes] = useState('')
  const resolved = isResolved(sc, session.world)
  const failing = sc.checks.filter((c) => !c.test(session.world))
  // Stable shuffle so the correct answer isn't always in the same spot.
  const options = useMemo(() => [...sc.rootCauses].sort((a, b) => (a.id + sc.id).localeCompare(b.id + sc.id) * ((sc.number % 2) * 2 - 1)), [sc])
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onCancel}>
      <motion.div role="dialog" aria-modal="true" aria-labelledby="close-title" onClick={(e) => e.stopPropagation()} initial={{ y: 24, scale: 0.97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 24, scale: 0.97 }} className="glass max-h-[90svh] w-full max-w-xl overflow-y-auto rounded-3xl p-6" data-lenis-prevent>
        <p className="hud-label">{sc.ticket.id}</p>
        <h2 id="close-title" className="mt-1 font-display text-2xl font-semibold">{tr('Close the incident', 'Clôturer l’incident')}</h2>
        {resolved ? (
          <p className="mt-3 flex items-center gap-2 rounded-2xl border border-success/30 bg-success/5 p-3 text-sm text-success"><CheckCircle2 size={16} /> {tr('All monitoring checks are green.', 'Tous les contrôles de supervision sont verts.')}</p>
        ) : (
          <div className="mt-3 rounded-2xl border border-danger/30 bg-danger/5 p-3 text-sm">
            <p className="flex items-center gap-2 font-medium text-danger"><AlertTriangle size={16} /> {tr('Monitoring still shows problems:', 'La supervision montre encore des problèmes :')}</p>
            <ul className="mt-1.5 space-y-0.5 text-muted">{failing.map((c) => <li key={c.id}>• {l(c.label)}</li>)}</ul>
            <p className="mt-2 text-xs text-dim">{tr('Closing now records the incident as unresolved.', 'Clôturer maintenant enregistre l’incident comme non résolu.')}</p>
          </div>
        )}
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">{tr('What was the root cause?', 'Quelle était la cause racine ?')}</legend>
          <div className="mt-2 space-y-1.5">
            {options.map((o) => (
              <label key={o.id} className={cn('flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 text-sm transition-colors', cause === o.id ? 'border-cyan bg-cyan-soft' : 'border-line hover:border-line-strong')}>
                <input type="radio" name="cause" value={o.id} checked={cause === o.id} onChange={() => setCause(o.id)} className="mt-0.5 accent-[var(--cyan)]" />
                {l(o.label)}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="mt-4 block text-sm font-semibold">
          {tr('Resolution notes (optional)', 'Notes de résolution (facultatif)')}
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder={tr('What did you change? What should happen next?', 'Qu’avez-vous changé ? Que faut-il faire ensuite ?')} className="mt-1.5 w-full rounded-xl border border-line-strong bg-bg-2 p-3 text-sm font-normal outline-none focus:border-cyan" />
        </label>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>{tr('Keep working', 'Continuer')}</Button>
          <Button onClick={() => onSubmit(cause, notes)} disabled={!cause} icon={<ClipboardCheck size={15} />}>{resolved ? tr('Close & get report', 'Clôturer & rapport') : tr('Close unresolved', 'Clôturer non résolu')}</Button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------ Report ------------------------------ */

function Report({ sc, score: s, session, cause, xp, notes, onRetry }: { sc: Scenario; score: Score; session: Session; cause: string; xp: number; notes: string; onRetry: () => void }) {
  const { tr, l } = useTr()
  const navigate = useNavigate()
  const reduced = useReducedMotionPref()
  const gathered = sc.evidence.filter((e) => session.evidence[e.id] !== undefined)
  const missed = sc.evidence.filter((e) => session.evidence[e.id] === undefined)
  const hazards = allHazards(sc).filter((h) => session.hazards[h.id] !== undefined)
  const chosen = sc.rootCauses.find((c) => c.id === cause)
  const actual = sc.rootCauses.find((c) => c.id === sc.cause)
  const bars: [keyof Score['parts'], string][] = [['troubleshooting', tr('Troubleshooting method', 'Démarche de diagnostic')], ['accuracy', tr('Accuracy (fixed + root cause)', 'Justesse (corrigé + cause)')], ['time', tr('Time', 'Temps')], ['efficiency', tr('Efficiency (hints, waste)', 'Efficacité (indices, actions inutiles)')]]
  const cmds = session.events.filter((e) => e.kind === 'cmd' || !e.line.startsWith('view-'))
  const block = 'glass rounded-3xl p-5 sm:p-6'
  return (
    <div className="mx-auto max-w-5xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <p className="hud-label">{tr('Incident report', 'Rapport d’incident')} · {sc.ticket.id}</p>
      <h1 className="mt-3 font-display text-[clamp(2rem,4.6vw,3.2rem)] leading-[1.05] font-semibold tracking-[-0.03em]">{l(sc.title)}</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-[auto_1fr]">
        <motion.div initial={reduced ? false : { scale: 0.6, opacity: 0, rotate: -8 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 14 }} className={cn(block, 'flex flex-col items-center justify-center text-center md:w-60')}>
          <p className="hud-label">{tr('Grade', 'Note')}</p>
          <p className={cn('font-display text-8xl leading-none font-bold', GRADE_COLOR[s.grade])}>{s.grade}</p>
          <p className="mt-2 font-mono text-2xl">{s.total}<span className="text-base text-dim">/100</span></p>
          <p className={cn('mt-2 flex items-center gap-1.5 text-sm', s.resolved ? 'text-success' : 'text-danger')}>{s.resolved ? <CheckCircle2 size={15} /> : <XCircle size={15} />}{s.resolved ? tr('Service restored', 'Service rétabli') : tr('Not resolved', 'Non résolu')}</p>
          {xp > 0 && <p className="mt-3 flex items-center gap-1.5 rounded-full bg-purple-soft px-3 py-1 font-mono text-xs text-purple"><Trophy size={13} /> +{xp} XP</p>}
        </motion.div>
        <div className={block}>
          <div className="grid gap-3">
            {bars.map(([k, label], i) => (
              <div key={k}>
                <div className="flex justify-between text-sm"><span>{label}</span><span className="font-mono text-muted">{s.parts[k]}/{s.max[k]}</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-line">
                  <motion.div className="h-full rounded-full bg-cyan" initial={{ width: 0 }} animate={{ width: `${(s.parts[k] / s.max[k]) * 100}%` }} transition={{ delay: reduced ? 0 : 0.3 + i * 0.12, duration: 0.8 }} />
                </div>
              </div>
            ))}
            {s.hazardPenalty > 0 && <p className="flex items-center gap-2 text-sm text-danger"><Flame size={14} /> {tr('Risky actions', 'Actions risquées')}: −{s.hazardPenalty}</p>}
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center font-mono text-xs">
            <div className="rounded-xl border border-line p-2"><Clock3 size={14} className="mx-auto mb-1 text-cyan" />{mmss(s.seconds)} <span className="text-dim">/ {mmss(sc.minutes * 60)}</span></div>
            <div className="rounded-xl border border-line p-2"><TerminalSquare size={14} className="mx-auto mb-1 text-cyan" />{session.events.filter((e) => e.kind === 'cmd').length} {tr('commands', 'commandes')}</div>
            <div className="rounded-xl border border-line p-2"><Lightbulb size={14} className="mx-auto mb-1 text-warning" />{session.hints} {tr('hints', 'indices')}</div>
          </div>
        </div>
      </div>

      <section className={cn(block, 'mt-4')}>
        <h2 className="font-display text-xl font-semibold">{tr('What happened', 'Ce qui s’est passé')}</h2>
        <p className="mt-2 leading-relaxed text-muted">{l(sc.report.what)}</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className={cn('rounded-2xl border p-3 text-sm', s.causeOk ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5')}>
            <p className="hud-label mb-1">{tr('Your root cause', 'Votre cause racine')}</p>
            <p className="flex gap-2">{s.causeOk ? <CheckCircle2 size={15} className="mt-0.5 shrink-0 text-success" /> : <XCircle size={15} className="mt-0.5 shrink-0 text-danger" />}{chosen ? l(chosen.label) : '—'}</p>
          </div>
          <div className="rounded-2xl border border-line bg-bg-2/50 p-3 text-sm">
            <p className="hud-label mb-1">{tr('Actual root cause', 'Cause racine réelle')}</p>
            <p>{actual ? l(actual.label) : ''}</p>
            <p className="mt-1 text-xs text-dim">{l(sc.report.cause)}</p>
          </div>
        </div>
        {notes.trim() && <p className="mt-3 rounded-2xl border border-line p-3 text-sm text-muted"><span className="hud-label mr-2">{tr('Your notes', 'Vos notes')}</span>{notes}</p>}
      </section>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className={block}>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><CheckCircle2 size={18} className="text-success" /> {tr('What you did well', 'Ce que vous avez bien fait')}</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {s.resolved && <li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />{tr('Restored the service for users', 'Rétabli le service pour les utilisateurs')}</li>}
            {s.causeOk && <li className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />{tr('Identified the real root cause', 'Identifié la vraie cause racine')}</li>}
            {gathered.map((e) => <li key={e.id} className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-success" />{l(e.label)}</li>)}
            {!s.resolved && !s.causeOk && !gathered.length && <li className="text-dim">—</li>}
          </ul>
        </section>
        <section className={block}>
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold"><AlertTriangle size={18} className="text-warning" /> {tr('What to improve', 'Ce qu’il faut améliorer')}</h2>
          <ul className="mt-3 space-y-1.5 text-sm">
            {hazards.map((h) => <li key={h.id} className="flex gap-2 text-danger"><Flame size={14} className="mt-0.5 shrink-0" />{l(h.label)} <span className="ml-auto shrink-0 font-mono text-xs">−{h.penalty}</span></li>)}
            {!s.causeOk && <li className="flex gap-2"><XCircle size={14} className="mt-0.5 shrink-0 text-danger" />{tr('Root cause misidentified', 'Cause racine mal identifiée')}</li>}
            {missed.map((e) => <li key={e.id} className="flex gap-2 text-muted"><XCircle size={14} className="mt-0.5 shrink-0 text-warning" />{tr('Missed:', 'Manqué :')} {l(e.label)}</li>)}
            {session.hints > 0 && <li className="flex gap-2 text-muted"><Lightbulb size={14} className="mt-0.5 shrink-0 text-warning" />{tr(`Used ${session.hints} hint(s)`, `${session.hints} indice(s) utilisé(s)`)}</li>}
            {session.waste > 0 && <li className="flex gap-2 text-muted"><RotateCcw size={14} className="mt-0.5 shrink-0 text-warning" />{tr(`${session.waste} unnecessary service restart(s)`, `${session.waste} redémarrage(s) de service inutile(s)`)}</li>}
            {s.resolved && s.seconds > sc.minutes * 60 && <li className="flex gap-2 text-muted"><Clock3 size={14} className="mt-0.5 shrink-0 text-warning" />{tr('Took longer than the target time', 'Plus long que le temps cible')}</li>}
            {!hazards.length && s.causeOk && !missed.length && !session.hints && <li className="text-success">{tr('Nothing — textbook response!', 'Rien — réponse exemplaire !')}</li>}
          </ul>
        </section>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <section className={block}>
          <h2 className="font-display text-lg font-semibold">{tr('Optimal solution', 'Solution optimale')}</h2>
          <ol className="mt-3 space-y-2 text-sm">
            {sc.report.optimal.map((x, i) => <li key={i} className="flex gap-3"><span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-cyan-soft font-mono text-[0.65rem] text-cyan">{i + 1}</span><span className="text-muted">{l(x)}</span></li>)}
          </ol>
        </section>
        <section className={block}>
          <h2 className="font-display text-lg font-semibold">{tr('Lessons to remember', 'Leçons à retenir')}</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {sc.report.lessons.map((x, i) => <li key={i} className="flex gap-2"><Lightbulb size={14} className="mt-0.5 shrink-0 text-cyan" /><span className="text-muted">{l(x)}</span></li>)}
          </ul>
        </section>
      </div>

      <details className={cn(block, 'mt-4')}>
        <summary className="cursor-pointer font-display text-lg font-semibold">{tr('Your timeline', 'Votre chronologie')} <span className="font-mono text-sm text-dim">({cmds.length})</span></summary>
        <ol className="mt-3 max-h-80 space-y-0.5 overflow-y-auto font-mono text-xs" data-lenis-prevent>
          {cmds.map((e, i) => {
            const bad = allHazards(sc).some((h) => session.hazards[h.id] === e.at)
            return (
              <li key={i} className={cn('grid grid-cols-[3.2rem_7rem_1fr] gap-2 border-b border-line/50 py-1', bad && 'text-danger')}>
                <span className="text-dim">{mmss(e.at)}</span>
                <span className="truncate text-cyan">{e.dev ?? (e.kind === 'act' ? tr('action', 'action') : '')}</span>
                <span className="break-all">{e.line}</span>
              </li>
            )
          })}
        </ol>
      </details>

      <div className="mt-8 flex flex-wrap justify-end gap-2">
        <Button variant="ghost" onClick={() => navigate('/simulator')} icon={<ArrowLeft size={15} />}>{tr('All incidents', 'Tous les incidents')}</Button>
        <Button variant="secondary" onClick={onRetry} icon={<RotateCcw size={15} />}>{tr('Try again', 'Réessayer')}</Button>
        {(() => {
          const next = INCIDENTS[INCIDENTS.indexOf(sc) + 1]
          return next ? <Button to={`/simulator/${next.id}`} icon={<Zap size={15} />}>{tr('Next incident', 'Incident suivant')}</Button> : null
        })()}
      </div>
    </div>
  )
}
