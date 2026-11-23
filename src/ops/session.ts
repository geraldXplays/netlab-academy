import type { Msg, OpsEvent, OpsWorld, Scenario } from './types'
import { stamp } from './world'

export interface Session {
  world: OpsWorld
  events: OpsEvent[]
  /** hazard id → seconds when first triggered */
  hazards: Record<string, number>
  /** count of unnecessary actions (restarting healthy services, etc.) */
  waste: number
  msgs: Msg[]
  hints: number
  resolvedAt?: number
  /** index of the next pressure message */
  pressure: number
  /** evidence id → seconds when gathered */
  evidence: Record<string, number>
}

let msgSeq = 0
const mkMsg = (w: OpsWorld, m: Omit<Msg, 'id' | 't'>): Msg => ({ ...m, id: `m${++msgSeq}`, t: stamp(w, false) })

export function startSession(sc: Scenario): Session {
  const world = sc.build()
  return {
    world,
    events: [],
    hazards: {},
    waste: 0,
    hints: 0,
    pressure: 0,
    evidence: {},
    msgs: [mkMsg(world, { from: sc.ticket.from, role: sc.ticket.dept, text: sc.ticket.body, tone: 'normal' })],
  }
}

export const isResolved = (sc: Scenario, w: OpsWorld) => sc.checks.every((c) => c.test(w))

/** Generic hazards every incident shares. */
const GENERIC = [
  {
    id: 'reload',
    label: { en: 'Reloaded a production network device during business hours (everyone lost the network for several minutes)', fr: 'Redémarrage d’un équipement réseau en production pendant les heures de bureau (tout le monde a perdu le réseau plusieurs minutes)' },
    penalty: 10,
    test: (e: OpsEvent) => !!e.tags?.includes('reload'),
  },
  {
    id: 'reboot',
    label: { en: 'Rebooted a production server without need (users were disconnected)', fr: 'Redémarrage inutile d’un serveur de production (utilisateurs déconnectés)' },
    penalty: 8,
    test: (e: OpsEvent) => !!e.tags?.includes('reboot'),
  },
  {
    id: 'data-loss',
    label: { en: 'Deleted business data — this would need a restore from backup', fr: 'Suppression de données métier — il faudrait une restauration depuis la sauvegarde' },
    penalty: 30,
    test: (e: OpsEvent) => !!e.tags?.includes('rm-critical'),
  },
]

export const genericHazard = (id: string) => GENERIC.find((g) => g.id === id)

/** Apply one learner event whose effect on the world has already been computed. */
export function applyEvent(sc: Scenario, s: Session, e: OpsEvent, after: OpsWorld): Session {
  const before = s.world
  let world = after
  const msgs = [...s.msgs]
  const r = sc.react?.(world, e, before)
  if (r?.world) world = r.world
  for (const m of r?.msgs ?? []) msgs.push(mkMsg(world, m))

  const hazards = { ...s.hazards }
  for (const h of [...GENERIC, ...(sc.hazards ?? [])]) {
    if (hazards[h.id] === undefined && h.test(e, before, world)) {
      hazards[h.id] = e.at
      if (h.id === 'reload') msgs.push(mkMsg(world, { from: 'Helpdesk', role: { en: 'Service desk', fr: 'Centre de services' }, text: { en: 'The phones are ringing — the whole office just lost the network for a few minutes! What happened?', fr: 'Les téléphones sonnent — tout le bureau vient de perdre le réseau quelques minutes ! Que s’est-il passé ?' }, tone: 'angry' }))
      if (h.id === 'reboot') msgs.push(mkMsg(world, { from: 'Helpdesk', role: { en: 'Service desk', fr: 'Centre de services' }, text: { en: 'Users say they were kicked out of their applications just now. Did someone restart a server?', fr: 'Des utilisateurs viennent d’être éjectés de leurs applications. Quelqu’un a redémarré un serveur ?' }, tone: 'angry' }))
    }
  }
  let waste = s.waste
  for (const t of e.tags ?? []) if (/^svc-restart:[^:]+:true$/.test(t) && !(sc.hazards ?? []).some((h) => h.test(e, before, world))) waste++

  const evidence = { ...s.evidence }
  for (const ev of sc.evidence) if (evidence[ev.id] === undefined && ev.test(e)) evidence[ev.id] = e.at

  let resolvedAt = s.resolvedAt
  const ok = isResolved(sc, world)
  if (ok && resolvedAt === undefined) {
    resolvedAt = e.at
    msgs.push(mkMsg(world, { from: sc.thanks.from, role: sc.thanks.role, text: sc.thanks.text, tone: 'happy' }))
  } else if (!ok && resolvedAt !== undefined) {
    resolvedAt = undefined
    msgs.push(mkMsg(world, { from: sc.ticket.from, role: sc.ticket.dept, text: { en: 'Hmm… it just stopped working again.', fr: 'Hmm… ça vient de recommencer à ne plus marcher.' }, tone: 'angry' }))
  }
  return { ...s, world, msgs, hazards, waste, evidence, resolvedAt, events: [...s.events, e] }
}

/** Time passes: deliver pressure messages. */
export function tick(sc: Scenario, s: Session, elapsed: number): Session {
  if (s.resolvedAt !== undefined) return s
  const next = sc.pressure[s.pressure]
  if (!next || elapsed < next.after) return s
  const world = { ...s.world, elapsed }
  return { ...s, pressure: s.pressure + 1, msgs: [...s.msgs, mkMsg(world, { from: next.from, role: next.role, text: next.text, tone: next.tone ?? 'angry' })] }
}

/* ------------------------------ scoring ------------------------------ */

export interface Score {
  total: number
  grade: 'S' | 'A' | 'B' | 'C' | 'D' | 'F'
  resolved: boolean
  causeOk: boolean
  /** each 0..max */
  parts: { troubleshooting: number; accuracy: number; time: number; efficiency: number }
  max: { troubleshooting: number; accuracy: number; time: number; efficiency: number }
  seconds: number
  hazardPenalty: number
}

export function score(sc: Scenario, s: Session, cause: string, seconds: number): Score {
  const resolved = isResolved(sc, s.world)
  const causeOk = cause === sc.cause
  const max = { troubleshooting: 30, accuracy: 40, time: 15, efficiency: 15 }
  // Evidence gathered before the fix counts fully, after the fix half.
  let ev = 0
  for (const e of sc.evidence) {
    const at = s.evidence[e.id]
    if (at === undefined) continue
    ev += s.resolvedAt !== undefined && at > s.resolvedAt ? 0.5 : 1
  }
  const troubleshooting = Math.round((ev / Math.max(1, sc.evidence.length)) * max.troubleshooting)
  const accuracy = (resolved ? 25 : 0) + (causeOk ? 15 : 0)
  const target = sc.minutes * 60
  const time = !resolved ? 0 : seconds <= target ? max.time : Math.max(0, Math.round(max.time * (1 - (seconds - target) / (target * 2))))
  const efficiency = Math.max(0, max.efficiency - s.hints * 4 - Math.min(6, s.waste * 2))
  const hazardPenalty = Object.keys(s.hazards).reduce((n, id) => n + ([...GENERIC, ...(sc.hazards ?? [])].find((h) => h.id === id)?.penalty ?? 0), 0)
  const total = Math.max(0, Math.min(100, troubleshooting + accuracy + time + efficiency - hazardPenalty))
  const grade = !resolved ? 'F' : total >= 95 ? 'S' : total >= 85 ? 'A' : total >= 70 ? 'B' : total >= 55 ? 'C' : 'D'
  return { total, grade, resolved, causeOk, parts: { troubleshooting, accuracy, time, efficiency }, max, seconds, hazardPenalty }
}

export const allHazards = (sc: Scenario) => [...GENERIC, ...(sc.hazards ?? [])]
