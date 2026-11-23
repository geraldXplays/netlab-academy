import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Award, CheckCircle2, Circle, ClipboardList, HelpCircle, Lightbulb, ListChecks, RotateCcw, Send, Wrench } from 'lucide-react'
import { LABS, gradeLab, labById, type LabDef } from '@/content/labs'
import { LESSONS } from '@/content/lessons'
import type { DeviceType, Topology } from '@/sim/types'
import { useProgress, emptyLab } from '@/store/progress'
import { useI18n } from '@/i18n'
import { Workspace } from '@/components/sim/Workspace'
import { RichText } from '@/components/learn/RichText'
import { CodeBlock } from '@/components/learn/BlockView'
import { QuestionCard } from '@/components/learn/QuestionCard'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Button } from '@/components/ui/Button'
import { Chip } from '@/components/ui/Chip'
import { cn } from '@/lib/cn'
import { Terminal, type TerminalApi } from '@/components/sim/Terminal'
import { Editor } from '@/components/ops/Panels'
import { initialWin, runWin, winBanner, winPrompt, type WinState } from '@/servers/windows'
import { initialLinux, runLinux, runLaptop, linuxBanner, linuxPrompt, laptopBanner, laptopPrompt, type LinuxState } from '@/servers/linux'

const ALL: DeviceType[] = ['pc', 'laptop', 'server', 'printer', 'switch', 'router', 'firewall']

const SANDBOX: LabDef = {
  id: 'sandbox', number: 0, levelId: 'foundations', difficulty: 1, minutes: 0, kind: 'sim', xp: 0, skills: [],
  title: { en: 'Free sandbox', fr: 'Bac à sable' },
  scenario: { en: 'An empty workspace with every device. Build anything you like.', fr: 'Un espace vide avec tous les équipements. Construisez ce que vous voulez.' },
  objectives: [], equipment: [], steps: [], tasks: [], troubleshooting: [], expected: { en: '', fr: '' }, evaluation: [],
  palette: ALL, initial: () => ({ devices: [], links: [] }),
}

export default function LabPage() {
  const { id = '' } = useParams()
  const lab = id === 'sandbox' ? SANDBOX : labById(id)
  const { d } = useI18n()
  if (!lab) {
    return (
      <div className="mx-auto max-w-3xl px-5 pt-36 pb-24 text-center">
        <Button to="/labs" variant="secondary">{d.labs.title}</Button>
      </div>
    )
  }
  return lab.kind === 'sim' ? <SimLab key={lab.id} lab={lab} /> : lab.kind === 'server' ? <ServerLab key={lab.id} lab={lab} /> : <GuidedLab key={lab.id} lab={lab} />
}

function Header({ lab, ratio, children }: { lab: LabDef; ratio: number; children?: React.ReactNode }) {
  const { d, l } = useI18n()
  return (
    <div className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3 sm:px-6">
      <Link to="/labs" className="grid h-9 w-9 place-items-center rounded-full text-muted hover:bg-cyan-soft hover:text-text" aria-label={d.labs.title}><ArrowLeft size={17} /></Link>
      <div className="min-w-0">
        <p className="hud-label">{lab.number ? `Lab ${lab.number}` : d.labs.sandbox}</p>
        <h1 className="truncate font-display text-lg font-semibold sm:text-xl">{l(lab.title)}</h1>
      </div>
      {lab.id !== 'sandbox' && (
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ProgressRing value={ratio} size={44} stroke={4} delay={0}>
              <span className="font-mono text-[0.62rem]">{Math.round(ratio * 100)}%</span>
            </ProgressRing>
            <span className="hidden text-xs text-dim sm:inline">{d.labs.completion}</span>
          </div>
          {children}
        </div>
      )}
    </div>
  )
}

/* ================================ Simulator lab ================================ */

function SimLab({ lab }: { lab: LabDef }) {
  const { d, f, l } = useI18n()
  const saved = useProgress((s) => s.labs[lab.id])
  const saveLab = useProgress((s) => s.saveLab)
  const completeLab = useProgress((s) => s.completeLab)
  const [topo, setTopoState] = useState<Topology>(() => saved?.topology ?? lab.initial!())
  const [panel, setPanel] = useState<'steps' | 'tasks' | 'help'>('steps')
  const [hints, setHints] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<null | { ok: boolean; failing: number; xp: number }>(null)
  const timer = useRef(0)

  useEffect(() => {
    document.title = `${l(lab.title)} · NetLab Academy`
  }, [lab, l])

  // Save the topology shortly after the last change (cloud sync follows automatically).
  const setTopo = (t: Topology) => {
    setTopoState(t)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => saveLab(lab.id, { topology: t }), 500)
  }
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const grade = useMemo(() => gradeLab(lab, topo), [lab, topo])

  const showHint = (i: number) => {
    if (hints.has(i)) return
    setHints(new Set(hints).add(i))
    saveLab(lab.id, { hints: (useProgress.getState().labs[lab.id]?.hints ?? 0) + 1 })
  }

  const submit = () => {
    const failing = grade.results.filter((r) => !r.ok).length
    if (failing) {
      setResult({ ok: false, failing, xp: 0 })
      setPanel('tasks')
      return
    }
    const r = completeLab(lab, 1)
    setResult({ ok: true, failing: 0, xp: r.xp })
  }

  const reset = () => {
    if (!window.confirm(d.labs.resetConfirm)) return
    const t = lab.initial!()
    setTopoState(t)
    saveLab(lab.id, { topology: t })
    setResult(null)
  }

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden pt-20 max-lg:h-auto max-lg:overflow-visible">
      <Header lab={lab} ratio={grade.ratio}>
        <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw size={14} />}><span className="hidden sm:inline">{d.labs.reset}</span></Button>
        <Button size="sm" onClick={submit} icon={<Send size={14} />}>{d.labs.submit}</Button>
      </Header>

      <div className="grid min-h-0 flex-1 gap-0 lg:grid-cols-[360px_1fr] lg:overflow-hidden">
        {/* Instructions panel */}
        {lab.id !== 'sandbox' ? (
          <aside className="flex min-h-0 flex-col border-b border-line lg:border-r lg:border-b-0">
            <div role="tablist" className="flex border-b border-line">
              {([
                ['steps', d.labs.steps, ClipboardList],
                ['tasks', `${d.labs.tasks} ${grade.results.filter((r) => r.ok).length}/${grade.results.length}`, ListChecks],
                ['help', d.labs.help, HelpCircle],
              ] as const).map(([k, label, Icon]) => (
                <button key={k} role="tab" aria-selected={panel === k} onClick={() => setPanel(k)} className={cn('relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium', panel === k ? 'text-text' : 'text-muted hover:text-text')}>
                  <Icon size={13} /> {label}
                  {panel === k && <motion.span layoutId="lab-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan" />}
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4" data-lenis-prevent>
              <AnimatePresence>
                {result && (
                  <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn('rounded-2xl border p-4', result.ok ? 'border-success/40 bg-success/10' : 'border-warning/40 bg-warning/10')}>
                    <p className={cn('flex items-center gap-2 font-semibold', result.ok ? 'text-success' : 'text-warning')}>
                      {result.ok ? <Award size={18} /> : <Wrench size={18} />} {result.ok ? d.labs.done : f(d.labs.notYet, { n: result.failing })}
                    </p>
                    {result.ok && result.xp > 0 && <p className="mt-1 text-sm text-muted">{f(d.labs.doneBody, { xp: result.xp })}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              {panel === 'steps' && (
                <>
                  <section>
                    <p className="hud-label mb-1">{d.labs.scenario}</p>
                    <RichText text={l(lab.scenario)} className="text-sm text-muted [&_p]:my-1" />
                  </section>
                  <section>
                    <p className="hud-label mb-1">{d.labs.objectives}</p>
                    <ul className="space-y-1 text-sm">{lab.objectives.map((o, i) => <li key={i} className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-cyan" /> {l(o)}</li>)}</ul>
                  </section>
                  <ol className="space-y-4">
                    {lab.steps.map((s, i) => (
                      <li key={i} className="rounded-xl border border-line bg-bg-2/50 p-3">
                        <p className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-soft font-mono text-[0.65rem] text-cyan">{i + 1}</span>{l(s.title)}</p>
                        <RichText text={l(s.body)} className="text-[0.85rem] text-muted [&_p]:my-1.5" />
                        {s.code && <CodeBlock code={s.code} />}
                        {s.hint && (hints.has(i) ? (
                          <p className="mt-2 flex gap-2 rounded-lg bg-warning/10 p-2 text-xs text-warning"><Lightbulb size={14} className="shrink-0" /> {l(s.hint)}</p>
                        ) : (
                          <button onClick={() => showHint(i)} className="mt-2 flex items-center gap-1.5 text-xs text-warning hover:underline"><Lightbulb size={13} /> {d.labs.hint}</button>
                        ))}
                      </li>
                    ))}
                  </ol>
                </>
              )}

              {panel === 'tasks' && (
                <ul className="space-y-2">
                  {grade.results.map(({ task, ok }) => (
                    <motion.li key={task.id} layout className={cn('flex items-start gap-2.5 rounded-xl border p-3 text-sm transition-colors', ok ? 'border-success/30 bg-success/5' : 'border-line')}>
                      <motion.span key={String(ok)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                        {ok ? <CheckCircle2 size={17} className="text-success" /> : <Circle size={17} className="text-dim" />}
                      </motion.span>
                      <span className={cn('flex-1', ok ? 'text-text' : 'text-muted')}>{l(task.label)}</span>
                      <span className="font-mono text-[0.65rem] text-dim">{task.points} pt</span>
                    </motion.li>
                  ))}
                  <li className="pt-2 text-xs text-dim">{f(d.labs.hintUsed, { n: saved?.hints ?? 0 })}</li>
                </ul>
              )}

              {panel === 'help' && (
                <>
                  <section>
                    <p className="hud-label mb-2">{d.labs.troubleshooting}</p>
                    <ul className="space-y-2">{lab.troubleshooting.map((x, i) => <li key={i} className="rounded-xl border border-line p-3 text-sm"><p className="font-medium">{l(x.symptom)}</p><RichText text={l(x.fix)} className="text-muted [&_p]:my-1" /></li>)}</ul>
                  </section>
                  <section><p className="hud-label mb-1">{d.labs.expected}</p><RichText text={l(lab.expected)} className="text-sm text-muted [&_p]:my-1" /></section>
                  <section><p className="hud-label mb-1">{d.labs.evaluation}</p><ul className="list-inside list-disc text-sm text-muted">{lab.evaluation.map((e, i) => <li key={i}>{l(e)}</li>)}</ul></section>
                  {lab.packetTracer && <section><p className="hud-label mb-1">{d.labs.packetTracer}</p><p className="text-sm text-muted">{l(lab.packetTracer)}</p></section>}
                </>
              )}
            </div>
          </aside>
        ) : <div className="hidden" />}

        <div className={cn('flex min-h-[560px] flex-col p-2 sm:p-3 lg:min-h-0', lab.id === 'sandbox' && 'lg:col-span-2')}>
          <p className="mb-2 px-1 text-xs text-dim md:hidden">{d.labs.smallScreen}</p>
          <Workspace topo={topo} setTopo={setTopo} palette={lab.palette ?? ALL} className="min-h-[540px] flex-1 lg:min-h-0" />
        </div>
      </div>
    </div>
  )
}

/* ================================ Guided lab ================================ */

function GuidedLab({ lab }: { lab: LabDef }) {
  const { d, f, l } = useI18n()
  const st = useProgress((s) => s.labs[lab.id]) ?? emptyLab()
  const saveLab = useProgress((s) => s.saveLab)
  const completeLab = useProgress((s) => s.completeLab)
  const [result, setResult] = useState<null | { ok: boolean; xp: number }>(null)

  useEffect(() => {
    document.title = `${l(lab.title)} · NetLab Academy`
  }, [lab, l])

  const cps = lab.checkpoints ?? []
  const correct = cps.filter((q) => st.answers[q.id]).length
  const ratio = (st.steps.length / lab.steps.length) * 0.5 + (cps.length ? correct / cps.length : 1) * 0.5
  const ready = st.steps.length === lab.steps.length && (!cps.length || correct / cps.length >= 0.8)

  const toggle = (i: number) => saveLab(lab.id, { steps: st.steps.includes(i) ? st.steps.filter((x) => x !== i) : [...st.steps, i] })

  return (
    <div className="pt-20">
      <Header lab={lab} ratio={ratio}>
        <Button size="sm" disabled={!ready} onClick={() => { const r = completeLab(lab, 1); setResult({ ok: true, xp: r.xp }) }} icon={<Send size={14} />}>{d.labs.submit}</Button>
      </Header>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-8">
        {(result || st.completedAt) && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl border border-success/40 bg-success/10 p-4">
            <p className="flex items-center gap-2 font-semibold text-success"><Award size={18} /> {d.labs.done}</p>
            {!!result?.xp && <p className="mt-1 text-sm text-muted">{f(d.labs.doneBody, { xp: result.xp })}</p>}
          </motion.div>
        )}
        <Chip tone="warning">{d.labs.guided}</Chip>
        <p className="mt-4 text-sm text-dim">{d.labs.guidedNote}</p>
        <section className="mt-6"><p className="hud-label mb-1">{d.labs.scenario}</p><RichText text={l(lab.scenario)} className="text-muted" /></section>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <section className="glass rounded-2xl p-4"><p className="hud-label mb-2">{d.labs.objectives}</p><ul className="space-y-1 text-sm">{lab.objectives.map((o, i) => <li key={i} className="flex gap-2"><CheckCircle2 size={14} className="mt-0.5 shrink-0 text-cyan" />{l(o)}</li>)}</ul></section>
          <section className="glass rounded-2xl p-4"><p className="hud-label mb-2">{d.labs.equipment}</p><ul className="space-y-1 text-sm text-muted">{lab.equipment.map((o, i) => <li key={i}>• {l(o)}</li>)}</ul></section>
        </div>

        <h2 className="mt-10 font-display text-2xl font-semibold">{d.labs.steps}</h2>
        <ol className="mt-4 space-y-4">
          {lab.steps.map((s, i) => {
            const done = st.steps.includes(i)
            return (
              <li key={i} className={cn('rounded-2xl border p-5 transition-colors', done ? 'border-success/30 bg-success/5' : 'border-line bg-bg-2/40')}>
                <div className="flex items-start gap-3">
                  <button onClick={() => toggle(i)} aria-pressed={done} aria-label={d.labs.stepDone} className={cn('mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors', done ? 'border-success bg-success text-bg' : 'border-line-strong hover:border-cyan')}>
                    {done && <CheckCircle2 size={15} />}
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{i + 1}. {l(s.title)}</p>
                    <RichText text={l(s.body)} className="text-sm text-muted [&_p]:my-1.5" />
                    {s.code && <CodeBlock code={s.code} />}
                    {s.hint && <p className="mt-2 flex gap-2 text-xs text-warning"><Lightbulb size={13} className="shrink-0" /> {l(s.hint)}</p>}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>

        {cps.length > 0 && (
          <>
            <h2 className="mt-12 font-display text-2xl font-semibold">{d.labs.checkpoints} <span className="font-mono text-base text-dim">{correct}/{cps.length}</span></h2>
            <div className="mt-4 space-y-4">
              {cps.map((q) => (
                <section key={q.id} className="glass rounded-2xl p-5">
                  <QuestionCard
                    q={q}
                    compact
                    initial={q.id in st.answers ? { correct: st.answers[q.id] } : undefined}
                    onAnswer={(ok) => saveLab(lab.id, { answers: { ...useProgress.getState().labs[lab.id]?.answers, [q.id]: ok } })}
                  />
                  {q.id in st.answers && !st.answers[q.id] && (
                    <button onClick={() => { const a = { ...st.answers }; delete a[q.id]; saveLab(lab.id, { answers: a }) }} className="mt-3 flex items-center gap-1.5 text-xs text-cyan hover:underline"><RotateCcw size={12} /> Retry</button>
                  )}
                </section>
              ))}
            </div>
          </>
        )}

        <section className="mt-12 grid gap-4 sm:grid-cols-2">
          <div className="glass rounded-2xl p-4"><p className="hud-label mb-2">{d.labs.troubleshooting}</p>{lab.troubleshooting.map((x, i) => <div key={i} className="mb-2 text-sm"><p className="font-medium">{l(x.symptom)}</p><RichText text={l(x.fix)} className="text-muted [&_p]:my-0.5" /></div>)}</div>
          <div className="glass rounded-2xl p-4"><p className="hud-label mb-2">{d.labs.expected}</p><RichText text={l(lab.expected)} className="text-sm text-muted [&_p]:my-1" /><p className="hud-label mt-4 mb-1">{d.labs.evaluation}</p><ul className="text-sm text-muted">{lab.evaluation.map((e, i) => <li key={i}>• {l(e)}</li>)}</ul></div>
        </section>
      </div>
    </div>
  )
}

/* ================================ Index ================================ */

export function LabsIndex() {
  const { d, f, l } = useI18n()
  const labs = useProgress((s) => s.labs)
  useEffect(() => {
    document.title = `${d.labs.title} · NetLab Academy`
  }, [d])
  const card = (lab: LabDef | null) => {
    const st = lab ? labs[lab.id] : labs.sandbox
    const done = !!st?.completedAt
    return (
      <Link key={lab?.id ?? 'sandbox'} to={`/labs/${lab?.id ?? 'sandbox'}`} className="group glass flex h-full flex-col rounded-3xl p-6 transition-colors hover:border-line-strong">
        <div className="flex items-center justify-between gap-2">
          <span className="font-mono text-xs text-cyan">{lab ? `LAB ${String(lab.number).padStart(2, '0')}` : 'SANDBOX'}</span>
          {lab && (done ? <Chip tone="success">{d.labs.completed}</Chip> : st ? <Chip tone="cyan" dot>{d.labs.inProgress}</Chip> : <Chip tone={lab.kind === 'guided' ? 'warning' : 'purple'}>{lab.kind === 'sim' ? d.labs.simulator : lab.kind === 'server' ? (l({ en: 'Virtual machine', fr: 'Machine virtuelle' })) : d.labs.guided}</Chip>)}
        </div>
        <h2 className="mt-3 font-display text-xl font-semibold tracking-tight group-hover:text-cyan">{lab ? l(lab.title) : d.labs.sandbox}</h2>
        <RichText text={lab ? l(lab.scenario) : d.labs.sandboxSub} className="mt-1 line-clamp-3 text-sm text-muted [&_p]:my-0" />
        {lab && (
          <div className="mt-auto flex items-center gap-3 pt-5 font-mono text-[0.68rem] text-dim">
            <span>{d.labs.difficulty} {'●'.repeat(lab.difficulty)}{'○'.repeat(3 - lab.difficulty)}</span>
            <span>{f(d.labs.minutes, { n: lab.minutes })}</span>
            {lab.recommendedAfter && LESSONS[lab.recommendedAfter] && <span className="hidden truncate xl:inline">· {l(LESSONS[lab.recommendedAfter].title)}</span>}
          </div>
        )}
        <span className="mt-4 text-xs font-semibold tracking-wider text-cyan uppercase">{st ? (done ? d.labs.review : d.labs.resume) : d.labs.open} →</span>
      </Link>
    )
  }
  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-24 sm:px-8 sm:pt-32">
      <p className="hud-label">{d.nav.labs}</p>
      <h1 className="mt-4 font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1] font-semibold tracking-[-0.04em]">{d.labs.title}</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">{d.labs.sub}</p>
      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {LABS.map((lab) => card(lab))}
        {card(null)}
      </div>
    </div>
  )
}

/* ================================ Server (virtual machine) lab ================================ */

type VmAny = WinState | LinuxState

function ServerLab({ lab }: { lab: LabDef }) {
  const { d, f, l, lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const saved = useProgress((s) => s.labs[lab.id])
  const saveLab = useProgress((s) => s.saveLab)
  const completeLab = useProgress((s) => s.completeLab)
  const fresh = () => (lab.vm === 'windows' ? initialWin() : initialLinux()) as VmAny
  const [vm, setVmState] = useState<VmAny>(() => (saved?.vm as VmAny | undefined) ?? fresh())
  const vmRef = useRef(vm)
  vmRef.current = vm
  const [panel, setPanel] = useState<'steps' | 'tasks' | 'help'>('steps')
  const [tab, setTab] = useState<'server' | 'laptop'>('server')
  const [editing, setEditing] = useState<string | null>(null)
  const [hints, setHints] = useState<Set<number>>(new Set())
  const [result, setResult] = useState<null | { ok: boolean; failing: number; xp: number }>(null)
  const [boot, setBoot] = useState(0)
  const timer = useRef(0)

  useEffect(() => {
    document.title = `${l(lab.title)} · NetLab Academy`
  }, [lab, l])
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const setVm = (v: VmAny) => {
    vmRef.current = v
    setVmState(v)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => saveLab(lab.id, { vm: v }), 400)
  }

  const tasks = lab.vmTasks ?? []
  const results = tasks.map((task) => ({ task, ok: (task.check as (s: VmAny) => boolean)(vm) }))
  const total = tasks.reduce((n, x) => n + x.points, 0)
  const ratio = total ? results.filter((r) => r.ok).reduce((n, r) => n + r.task.points, 0) / total : 0

  const api = (which: 'server' | 'laptop'): TerminalApi => ({
    get prompt() {
      const s = vmRef.current
      return lab.vm === 'windows' ? winPrompt(s as WinState) : which === 'laptop' ? laptopPrompt() : linuxPrompt(s as LinuxState)
    },
    run: (line: string) => {
      const s = vmRef.current
      const r = lab.vm === 'windows' ? runWin(s as WinState, line) : which === 'laptop' ? runLaptop(s as LinuxState, line) : runLinux(s as LinuxState, line)
      setVm(r.state as VmAny)
      if (r.edit) setEditing(r.edit)
      return { out: r.out, clear: r.clear }
    },
  })
  // stable APIs per boot
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const serverApi = useMemo(() => api('server'), [boot])
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const laptopApi = useMemo(() => api('laptop'), [boot])

  const submit = () => {
    const failing = results.filter((r) => !r.ok).length
    if (failing) {
      setResult({ ok: false, failing, xp: 0 })
      setPanel('tasks')
      return
    }
    const r = completeLab(lab, 1)
    setResult({ ok: true, failing: 0, xp: r.xp })
  }
  const reset = () => {
    if (!window.confirm(d.labs.resetConfirm)) return
    const v = fresh()
    setVm(v)
    saveLab(lab.id, { vm: v })
    setBoot((b) => b + 1)
    setEditing(null)
    setResult(null)
  }
  const showHint = (i: number) => {
    if (hints.has(i)) return
    setHints(new Set(hints).add(i))
    saveLab(lab.id, { hints: (useProgress.getState().labs[lab.id]?.hints ?? 0) + 1 })
  }
  const linux = lab.vm === 'linux' ? (vm as LinuxState) : null
  const win = lab.vm === 'windows' ? (vm as WinState) : null
  const vmName = win ? win.hostname : linux!.hostname
  const vmIp = win ? win.ip : linux!.ip
  const cps = lab.checkpoints ?? []

  return (
    <div className="flex h-[100svh] flex-col overflow-hidden pt-20 max-lg:h-auto max-lg:overflow-visible">
      <Header lab={lab} ratio={ratio}>
        <Button variant="ghost" size="sm" onClick={reset} icon={<RotateCcw size={14} />}><span className="hidden sm:inline">{d.labs.reset}</span></Button>
        <Button size="sm" onClick={submit} icon={<Send size={14} />}>{d.labs.submit}</Button>
      </Header>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[380px_1fr] lg:overflow-hidden">
        <aside className="flex min-h-0 flex-col border-b border-line lg:border-r lg:border-b-0">
          <div role="tablist" className="flex border-b border-line">
            {([
              ['steps', d.labs.steps, ClipboardList],
              ['tasks', `${d.labs.tasks} ${results.filter((r) => r.ok).length}/${results.length}`, ListChecks],
              ['help', d.labs.help, HelpCircle],
            ] as const).map(([k, label, Icon]) => (
              <button key={k} role="tab" aria-selected={panel === k} onClick={() => setPanel(k)} className={cn('relative flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs font-medium', panel === k ? 'text-text' : 'text-muted hover:text-text')}>
                <Icon size={13} /> {label}
                {panel === k && <motion.span layoutId="srv-tab" className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-cyan" />}
              </button>
            ))}
          </div>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4" data-lenis-prevent>
            <AnimatePresence>
              {result && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className={cn('rounded-2xl border p-4', result.ok ? 'border-success/40 bg-success/10' : 'border-warning/40 bg-warning/10')}>
                  <p className={cn('flex items-center gap-2 font-semibold', result.ok ? 'text-success' : 'text-warning')}>
                    {result.ok ? <Award size={18} /> : <Wrench size={18} />} {result.ok ? d.labs.done : f(d.labs.notYet, { n: result.failing })}
                  </p>
                  {result.ok && result.xp > 0 && <p className="mt-1 text-sm text-muted">{f(d.labs.doneBody, { xp: result.xp })}</p>}
                </motion.div>
              )}
            </AnimatePresence>
            {panel === 'steps' && (
              <>
                <section><p className="hud-label mb-1">{d.labs.scenario}</p><RichText text={l(lab.scenario)} className="text-sm text-muted [&_p]:my-1" /></section>
                <ol className="space-y-4">
                  {lab.steps.map((s, i) => (
                    <li key={i} className="rounded-xl border border-line bg-bg-2/50 p-3">
                      <p className="flex items-center gap-2 text-sm font-semibold"><span className="grid h-5 w-5 place-items-center rounded-full bg-cyan-soft font-mono text-[0.65rem] text-cyan">{i + 1}</span>{l(s.title)}</p>
                      <RichText text={l(s.body)} className="text-[0.85rem] text-muted [&_p]:my-1.5" />
                      {s.code && <CodeBlock code={s.code} />}
                      {s.hint && (hints.has(i) ? (
                        <p className="mt-2 flex gap-2 rounded-lg bg-warning/10 p-2 text-xs text-warning"><Lightbulb size={14} className="shrink-0" /> {l(s.hint)}</p>
                      ) : (
                        <button onClick={() => showHint(i)} className="mt-2 flex items-center gap-1.5 text-xs text-warning hover:underline"><Lightbulb size={13} /> {d.labs.hint}</button>
                      ))}
                    </li>
                  ))}
                </ol>
              </>
            )}
            {panel === 'tasks' && (
              <ul className="space-y-2">
                {results.map(({ task, ok }) => (
                  <motion.li key={task.id} layout className={cn('flex items-start gap-2.5 rounded-xl border p-3 text-sm transition-colors', ok ? 'border-success/30 bg-success/5' : 'border-line')}>
                    <motion.span key={String(ok)} initial={{ scale: 0.4 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
                      {ok ? <CheckCircle2 size={17} className="text-success" /> : <Circle size={17} className="text-dim" />}
                    </motion.span>
                    <span className={cn('flex-1', ok ? 'text-text' : 'text-muted')}>{l(task.label)}</span>
                    <span className="font-mono text-[0.65rem] text-dim">{task.points} pt</span>
                  </motion.li>
                ))}
              </ul>
            )}
            {panel === 'help' && (
              <>
                <section>
                  <p className="hud-label mb-2">{d.labs.troubleshooting}</p>
                  <ul className="space-y-2">{lab.troubleshooting.map((x, i) => <li key={i} className="rounded-xl border border-line p-3 text-sm"><p className="font-medium">{l(x.symptom)}</p><RichText text={l(x.fix)} className="text-muted [&_p]:my-1" /></li>)}</ul>
                </section>
                {cps.length > 0 && (
                  <section>
                    <p className="hud-label mb-2">{d.labs.checkpoints}</p>
                    <div className="space-y-3">
                      {cps.map((q) => (
                        <div key={q.id} className="rounded-xl border border-line p-3">
                          <QuestionCard q={q} compact initial={q.id in (saved?.answers ?? {}) ? { correct: saved!.answers[q.id] } : undefined} onAnswer={(ok) => saveLab(lab.id, { answers: { ...useProgress.getState().labs[lab.id]?.answers, [q.id]: ok } })} />
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                <section><p className="hud-label mb-1">{d.labs.expected}</p><RichText text={l(lab.expected)} className="text-sm text-muted [&_p]:my-1" /></section>
              </>
            )}
          </div>
        </aside>

        {/* The virtual machine */}
        <div className="flex min-h-[560px] flex-col p-2 sm:p-3 lg:min-h-0">
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-line-strong bg-[#0b0e14] shadow-2xl">
            <div className="flex items-center gap-2 border-b border-white/10 bg-[#141a24] px-3 py-2">
              <span className="h-3 w-3 rounded-full bg-[#ff5f57]" /><span className="h-3 w-3 rounded-full bg-[#febc2e]" /><span className="h-3 w-3 rounded-full bg-[#28c840]" />
              <span className="ml-2 font-mono text-xs text-[#c0caf5]">{vmName} — {win ? 'Windows Server 2022' : 'Ubuntu Server 24.04 LTS'}</span>
              <span className="ml-2 flex items-center gap-1.5 rounded-full bg-success/15 px-2 py-0.5 font-mono text-[0.62rem] text-success"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-success" />{tr('Running', 'En marche')}</span>
              <span className="ml-auto hidden font-mono text-[0.65rem] text-[#7a86a8] sm:inline">IP {vmIp} · {tr('NAT network "netlab"', 'réseau NAT « netlab »')}</span>
            </div>
            {linux && (
              <div className="flex gap-1 border-b border-white/10 bg-[#10151e] px-2 pt-1.5" role="tablist">
                {([['server', `${linux.hostname} (${tr('server console', 'console serveur')})`], ['laptop', tr('YOUR LAPTOP', 'VOTRE PORTABLE')]] as const).map(([k, label]) => (
                  <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-t-lg px-3 py-1.5 font-mono text-[0.72rem]', tab === k ? 'bg-[#0b0e14] text-[#c0caf5]' : 'text-[#7a86a8] hover:text-[#c0caf5]')}>{label}</button>
                ))}
              </div>
            )}
            <div className="relative min-h-0 flex-1">
              <div className={cn('absolute inset-0', (tab !== 'server' || editing) && 'hidden')}>
                <Terminal key={`s${boot}`} api={serverApi} banner={win ? winBanner(win) : linuxBanner(linux!)} autoFocus />
              </div>
              {linux && (
                <div className={cn('absolute inset-0', (tab !== 'laptop' || editing) && 'hidden')}>
                  <Terminal key={`l${boot}`} api={laptopApi} banner={laptopBanner()} autoFocus={false} />
                </div>
              )}
              {editing && linux && (
                <div className="absolute inset-0">
                  <Editor key={editing} path={editing} host={linux.hostname} initial={linux.files[editing] ?? ''} onSave={(c) => setVm({ ...linux, files: { ...linux.files, [editing]: c } })} onClose={() => setEditing(null)} />
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 px-1 text-[0.7rem] text-dim">{tr('Type help in the console to list the available commands. Your VM is saved automatically.', 'Tapez help dans la console pour lister les commandes. Votre VM est sauvegardée automatiquement.')}</p>
        </div>
      </div>
    </div>
  )
}
