import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { localAdapter, STORAGE_KEYS } from '@/lib/storage'
import { addDays, dayKey, lastDays } from '@/lib/dates'
import { levelFromXp } from '@/lib/xp'
import { achievementById } from '@/content/achievements'
import { missionsForDay, type ActivityKind } from '@/content/missions'
import { LEVELS, levelLessonIds } from '@/content/curriculum'
import type { L } from '@/content/types'
import { MODULE_SKILL } from '@/content/skills'
import { useNotifications } from './notifications'
import type { Question } from '@/content/lessons/types'
import type { Topology } from '@/sim/types'

type DayActivity = Partial<Record<ActivityKind, number>>

export interface ProgressData {
  callsign: string
  createdAt: string
  xp: number
  /** lessonId -> ISO date completed */
  completedLessons: Record<string, string>
  /** achievementId -> ISO date unlocked */
  achievements: Record<string, string>
  /** skillId -> mastery 0..100 (fed by assessments & labs only) */
  skills: Record<string, number>
  /** dayKey -> counts */
  activity: Record<string, DayActivity>
  /** dayKey -> claimed mission ids */
  claimedMissions: Record<string, string[]>
  streak: { current: number; best: number; last: string | null }
  isDemo: boolean
  /** Per-lesson reading state, so learners resume exactly where they left off. */
  lessonState: Record<string, LessonState>
  lastLesson: string | null
  bookmarks: string[]
  /** assessmentId -> results */
  assessments: Record<string, AssessmentResult>
  /** curriculum module -> answers seen / correct (drives adaptive review) */
  topicStats: Record<string, { seen: number; correct: number }>
  /** question tag -> correct answers (e.g. 'ping' for the Ping Master badge) */
  tagCounts: Record<string, number>
  /** levelId -> certificate */
  certificates: Record<string, { date: string; score: number; code: string }>
  /** labId -> saved work, so a lab resumes exactly where it was left */
  labs: Record<string, LabState>
  /** incidentId -> best result in the IT Operations Simulator */
  incidents: Record<string, IncidentResult>
}

export interface IncidentResult {
  best: number
  grade: string
  attempts: number
  /** first time it was resolved */
  resolvedAt?: string
  bestSeconds?: number
  lastAt: string
}

export interface LabState {
  topology?: Topology
  /** server labs: saved virtual machine state */
  vm?: unknown
  best: number
  completedAt?: string
  hints: number
  /** guided labs: ticked step indexes */
  steps: number[]
  /** guided labs: checkpoint id -> correct? */
  answers: Record<string, boolean>
  updated: string
}

export const emptyLab = (): LabState => ({ best: 0, hints: 0, steps: [], answers: {}, updated: new Date().toISOString() })

export interface AssessmentResult {
  best: number
  last: number
  attempts: number
  passed: boolean
  lastAt: string
  history: { at: string; score: number }[]
}

export interface FinishResult {
  ratio: number
  passed: boolean
  firstPass: boolean
  xp: number
}

export interface LessonState {
  /** 0..1 reading position */
  scroll: number
  /** best quiz score 0..1 */
  best: number
  attempts: number
  /** in-lesson knowledge checks answered: blockIndex -> correct? */
  checks: Record<number, boolean>
  updated: string
}

const emptyLesson = (): LessonState => ({ scroll: 0, best: 0, attempts: 0, checks: {}, updated: new Date().toISOString() })

interface ProgressActions {
  setCallsign: (name: string) => void
  addXp: (amount: number, reason: L) => void
  recordActivity: (kind: ActivityKind, count?: number) => void
  completeLesson: (lessonId: string) => void
  unlockAchievement: (id: string) => void
  claimMission: (missionId: string) => void
  loadDemo: () => void
  reset: () => void
  openLesson: (id: string) => void
  saveLessonScroll: (id: string, ratio: number) => void
  answerCheck: (id: string, blockIndex: number, correct: boolean) => void
  /** Returns true when this submission completed the lesson for the first time. */
  submitQuiz: (id: string, correct: number, total: number, passRatio: number) => boolean
  toggleBookmark: (id: string) => void
  /** Analytics for any answered question (lessons, exams, practice). */
  recordAnswer: (q: Question & { topic?: string; tags?: string[] }, correct: boolean) => void
  finishAssessment: (a: { id: string; levelId: string; passRatio: number; xp: number; badge?: string; certificate?: boolean; skills?: string[] }, correct: number, total: number) => FinishResult
  finishPractice: (mode: string, correct: number, total: number) => number
  saveLab: (id: string, patch: Partial<LabState>) => void
  completeLab: (lab: { id: string; xp: number; badge?: string; noHintBadge?: string; skills: string[] }, ratio: number) => { first: boolean; xp: number }
  /** Record a closed incident. Returns XP earned (first resolution full XP, later improvements the difference). */
  finishIncident: (inc: { id: string; xp: number; skills: string[] }, r: { total: number; grade: string; resolved: boolean; seconds: number }) => { xp: number; first: boolean; improved: boolean }
}

export const fresh = (): ProgressData => ({
  callsign: '',
  createdAt: new Date().toISOString(),
  xp: 0,
  completedLessons: {},
  achievements: {},
  skills: {},
  activity: {},
  claimedMissions: {},
  streak: { current: 0, best: 0, last: null },
  isDemo: false,
  lessonState: {},
  lastLesson: null,
  bookmarks: [],
  assessments: {},
  topicStats: {},
  tagCounts: {},
  certificates: {},
  labs: {},
  incidents: {},
})

export const useProgress = create<ProgressData & ProgressActions>()(
  persist(
    (set, get) => ({
      ...fresh(),

      setCallsign: (callsign) => set({ callsign: callsign.slice(0, 24) }),

      addXp: (amount, reason) => {
        const before = levelFromXp(get().xp).level
        set((s) => ({ xp: s.xp + amount }))
        const notify = useNotifications.getState().push
        notify({ type: 'xp', amount, reason })
        const after = levelFromXp(get().xp).level
        if (after > before) notify({ type: 'levelup', level: after })
      },

      recordActivity: (kind, count = 1) => {
        const today = dayKey()
        set((s) => {
          const day = { ...s.activity[today] }
          day[kind] = (day[kind] ?? 0) + count
          const { last, current, best } = s.streak
          let next = current
          if (last !== today) next = last === addDays(today, -1) ? current + 1 : 1
          return {
            activity: { ...s.activity, [today]: day },
            streak: { current: next, best: Math.max(best, next), last: today },
          }
        })
        if (get().streak.current >= 7) get().unlockAchievement('streak-7')
      },

      completeLesson: (lessonId) => {
        if (get().completedLessons[lessonId]) return
        set((s) => ({ completedLessons: { ...s.completedLessons, [lessonId]: new Date().toISOString() } }))
        get().recordActivity('lesson')
        get().unlockAchievement('first-steps')
      },

      unlockAchievement: (id) => {
        const a = achievementById(id)
        if (!a || get().achievements[id]) return
        set((s) => ({ achievements: { ...s.achievements, [id]: new Date().toISOString() } }))
        useNotifications.getState().push({ type: 'achievement', achievementId: id })
        get().addXp(a.xp, a.name)
      },

      claimMission: (missionId) => {
        const today = dayKey()
        const mission = missionsForDay(today).find((m) => m.id === missionId)
        if (!mission) return
        const claimed = get().claimedMissions[today] ?? []
        if (claimed.includes(missionId)) return
        if ((get().activity[today]?.[mission.kind] ?? 0) < mission.target) return
        set((s) => ({ claimedMissions: { ...s.claimedMissions, [today]: [...claimed, missionId] } }))
        get().addXp(mission.xp, mission.title)
      },

      loadDemo: () => set(demoProfile()),
      reset: () => set(fresh()),

      openLesson: (id) =>
        set((s) => ({ lastLesson: id, lessonState: { ...s.lessonState, [id]: { ...emptyLesson(), ...s.lessonState[id], updated: new Date().toISOString() } } })),

      saveLessonScroll: (id, ratio) =>
        set((s) => {
          const cur = s.lessonState[id] ?? emptyLesson()
          if (Math.abs(cur.scroll - ratio) < 0.02) return s
          return { lessonState: { ...s.lessonState, [id]: { ...cur, scroll: ratio, updated: new Date().toISOString() } } }
        }),

      answerCheck: (id, blockIndex, correct) => {
        const cur = get().lessonState[id] ?? emptyLesson()
        if (blockIndex in cur.checks) return
        set((s) => ({ lessonState: { ...s.lessonState, [id]: { ...cur, checks: { ...cur.checks, [blockIndex]: correct } } } }))
        if (correct) get().recordActivity('quiz')
      },

      submitQuiz: (id, correct, total, passRatio) => {
        const ratio = total ? correct / total : 0
        const cur = get().lessonState[id] ?? emptyLesson()
        set((s) => ({ lessonState: { ...s.lessonState, [id]: { ...cur, best: Math.max(cur.best, ratio), attempts: cur.attempts + 1, updated: new Date().toISOString() } } }))
        if (ratio < passRatio || get().completedLessons[id]) return false
        get().completeLesson(id)
        get().addXp(40 + Math.round(ratio * 20), { en: 'Lesson completed', fr: 'Leçon terminée' })
        const skill = MODULE_SKILL[id.split('.')[0]]
        if (skill) set((s) => ({ skills: { ...s.skills, [skill]: Math.min(100, (s.skills[skill] ?? 0) + Math.round(3 + ratio * 3)) } }))
        return true
      },

      recordAnswer: (q, correct) => {
        const topic = q.topic
        set((s) => {
          const out: Partial<ProgressData> = {}
          if (topic) {
            const cur = s.topicStats[topic] ?? { seen: 0, correct: 0 }
            out.topicStats = { ...s.topicStats, [topic]: { seen: cur.seen + 1, correct: cur.correct + (correct ? 1 : 0) } }
          }
          if (correct && q.tags?.length) {
            const tc = { ...s.tagCounts }
            for (const t of q.tags) tc[t] = (tc[t] ?? 0) + 1
            out.tagCounts = tc
          }
          return out
        })
        if (correct) {
          get().recordActivity('quiz')
          if ((get().tagCounts.ping ?? 0) >= 5) get().unlockAchievement('ping-master')
        }
      },

      finishAssessment: (a, correct, total) => {
        const ratio = total ? correct / total : 0
        const passed = ratio >= a.passRatio
        const now = new Date().toISOString()
        const prev = get().assessments[a.id]
        const firstPass = passed && !prev?.passed
        set((s) => ({
          assessments: {
            ...s.assessments,
            [a.id]: {
              best: Math.max(prev?.best ?? 0, ratio),
              last: ratio,
              attempts: (prev?.attempts ?? 0) + 1,
              passed: passed || !!prev?.passed,
              lastAt: now,
              history: [...(prev?.history ?? []).slice(-19), { at: now, score: ratio }],
            },
          },
        }))
        let xp = 0
        if (firstPass) {
          xp = a.xp + Math.round(ratio * 50)
          get().addXp(xp, { en: 'Assessment passed', fr: 'Évaluation réussie' })
          if (a.badge) get().unlockAchievement(a.badge)
          const level = LEVELS.find((l) => l.id === a.levelId)
          if (level) {
            set((s) => {
              const skills = { ...s.skills }
              for (const k of level.skills) skills[k] = Math.min(100, (skills[k] ?? 0) + Math.round(ratio * (a.certificate ? 20 : 8)))
              return { skills }
            })
          }
          if (a.certificate) {
            const code = `NLA-${a.levelId.slice(0, 3).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`
            set((s) => ({ certificates: { ...s.certificates, [a.levelId]: { date: now, score: ratio, code } } }))
          }
        } else if (passed && ratio > (prev?.best ?? 0)) {
          xp = 25
          get().addXp(xp, { en: 'New personal best', fr: 'Nouveau record personnel' })
        }
        if (ratio === 1) get().unlockAchievement('perfectionist')
        return { ratio, passed, firstPass, xp }
      },

      finishPractice: (mode, correct, total) => {
        const xp = Math.min(60, correct * 4)
        if (xp) get().addXp(xp, { en: 'Practice session', fr: 'Session d’entraînement' })
        if (mode === 'subnetting' && total >= 10 && correct / total >= 0.9) get().unlockAchievement('subnet-apprentice')
        return xp
      },

      saveLab: (id, patch) =>
        set((s) => ({ labs: { ...s.labs, [id]: { ...emptyLab(), ...s.labs[id], ...patch, updated: new Date().toISOString() } } })),

      completeLab: (lab, ratio) => {
        const cur = get().labs[lab.id] ?? emptyLab()
        const first = !cur.completedAt && ratio >= 1
        get().saveLab(lab.id, { best: Math.max(cur.best, ratio), ...(first ? { completedAt: new Date().toISOString() } : {}) })
        if (!first) return { first: false, xp: 0 }
        get().recordActivity('lab')
        get().addXp(lab.xp, { en: 'Lab completed', fr: 'Lab terminé' })
        if (lab.badge) get().unlockAchievement(lab.badge)
        if (lab.noHintBadge && cur.hints === 0) get().unlockAchievement(lab.noHintBadge)
        if (get().labs['lab-4']?.completedAt && get().labs['lab-5']?.completedAt) get().unlockAchievement('server-admin')
        set((s) => {
          const skills = { ...s.skills }
          for (const k of lab.skills) skills[k] = Math.min(100, (skills[k] ?? 0) + 10)
          return { skills }
        })
        return { first: true, xp: lab.xp }
      },

      finishIncident: (inc, r) => {
        const now = new Date().toISOString()
        const cur = get().incidents[inc.id]
        const prevBest = cur?.resolvedAt ? cur.best : 0
        const first = r.resolved && !cur?.resolvedAt
        const improved = r.resolved && r.total > prevBest
        const next: IncidentResult = {
          best: r.resolved ? Math.max(prevBest, r.total) : cur?.best ?? 0,
          grade: improved || !cur ? r.grade : cur.grade,
          attempts: (cur?.attempts ?? 0) + 1,
          resolvedAt: cur?.resolvedAt ?? (r.resolved ? now : undefined),
          bestSeconds: r.resolved ? Math.min(cur?.bestSeconds ?? Infinity, r.seconds) : cur?.bestSeconds,
          lastAt: now,
        }
        set((s) => ({ incidents: { ...s.incidents, [inc.id]: next } }))
        if (!r.resolved) return { xp: 0, first: false, improved: false }
        const xp = Math.round((inc.xp * (r.total - prevBest)) / 100)
        if (first) get().recordActivity('incident')
        if (xp > 0) get().addXp(xp, { en: 'Incident resolved', fr: 'Incident résolu' })
        if (first) {
          set((s) => {
            const skills = { ...s.skills }
            for (const k of inc.skills) skills[k] = Math.min(100, (skills[k] ?? 0) + Math.round(r.total / 10))
            return { skills }
          })
        }
        const strong = Object.values(get().incidents).filter((x) => x.resolvedAt && (x.grade === 'A' || x.grade === 'S')).length
        if (strong >= 5) get().unlockAchievement('troubleshooter')
        return { xp: Math.max(0, xp), first, improved }
      },

      toggleBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [...s.bookmarks, id] })),
    }),
    {
      name: STORAGE_KEYS.progress,
      version: 4,
      storage: createJSONStorage(() => localAdapter),
      // v1 → v2 adds lesson state, resume pointer and bookmarks.
      migrate: (persisted) => ({ lessonState: {}, lastLesson: null, bookmarks: [], assessments: {}, topicStats: {}, tagCounts: {}, certificates: {}, labs: {}, incidents: {}, ...(persisted as object) }) as unknown as ProgressData & ProgressActions,
    },
  ),
)

/* ----------------------------- Selectors ----------------------------- */

/** A streak only counts if the last activity was today or yesterday. */
export const liveStreak = (s: ProgressData) => {
  const today = dayKey()
  if (!s.streak.last) return 0
  return s.streak.last === today || s.streak.last === addDays(today, -1) ? s.streak.current : 0
}

export const levelProgress = (s: ProgressData, levelId: string) => {
  const level = LEVELS.find((l) => l.id === levelId)
  if (!level) return { done: 0, total: 0, ratio: 0 }
  const ids = levelLessonIds(level)
  const done = ids.filter((id) => s.completedLessons[id]).length
  return { done, total: ids.length, ratio: ids.length ? done / ids.length : 0 }
}

/** Level N+1 unlocks once level N is fully completed (assessment gating arrives in Phase 3). */
/** Level N+1 unlocks only by passing Level N's certification exam. */
export const isLevelUnlocked = (s: ProgressData, index: number) => index === 0 || !!s.assessments?.[`a-l${index}-exam`]?.passed

/** First incomplete lesson along the path. */
export function nextLesson(s: ProgressData) {
  for (const level of LEVELS) {
    for (const mod of level.modules) {
      for (let i = 1; i <= mod.lessonCount; i++) {
        const id = `${mod.id}.${i}`
        if (!s.completedLessons[id]) return { level, module: mod, index: i, id }
      }
    }
  }
  return null
}

/* ----------------------------- Demo data ----------------------------- */

function demoProfile(): ProgressData {
  const today = dayKey()
  const completed: Record<string, string> = {}
  const l1 = levelLessonIds(LEVELS[0])
  l1.slice(0, 9).forEach((id, i) => {
    completed[id] = new Date(Date.now() - (9 - i) * 86_400_000 * 0.9).toISOString()
  })
  const activity: Record<string, DayActivity> = {}
  lastDays(14).forEach((d, i) => {
    if (i === 3 || i === 7) return // a couple of gaps so the heatmap looks real
    activity[d] = { lesson: (i % 3) + 1, quiz: (i * 7) % 11, lab: i % 5 === 0 ? 1 : 0 }
  })
  activity[today] = { lesson: 1, quiz: 6, lab: 0, incident: 0 }
  const ago = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString()
  return {
    callsign: '',
    createdAt: ago(21),
    xp: 1240,
    completedLessons: completed,
    achievements: { 'first-connection': ago(12), 'linux-explorer': ago(6), 'ping-master': ago(1) },
    skills: { hardware: 72, networking: 54, routing: 18, systems: 41, security: 9, infrastructure: 12 },
    activity,
    claimedMissions: {},
    streak: { current: 6, best: 9, last: today },
    isDemo: true,
    lessonState: {},
    lastLesson: null,
    bookmarks: [],
    assessments: {},
    topicStats: {},
    tagCounts: {},
    certificates: {},
    labs: {},
    incidents: {},
  }
}

/* ------------------------- Per-account storage ------------------------- */

export const ANON_PROGRESS_KEY = STORAGE_KEYS.progress
export const progressKeyFor = (userId: string | null) => (userId ? `${STORAGE_KEYS.progress}:${userId}` : STORAGE_KEYS.progress)

/**
 * Point the progress store at a user's own saved data. If that user has no
 * saved data yet, start them fresh (optionally adopting anonymous progress).
 */
export async function bindProgressToUser(userId: string | null, adoptAnonymous = false) {
  const key = progressKeyFor(userId)
  let existing: string | null = null
  try {
    existing = localStorage.getItem(key)
    if (!existing && adoptAnonymous && userId) {
      const anon = localStorage.getItem(ANON_PROGRESS_KEY)
      if (anon) {
        localStorage.setItem(key, anon)
        localStorage.removeItem(ANON_PROGRESS_KEY)
        existing = anon
      }
    }
  } catch {
    /* storage unavailable */
  }
  useProgress.persist.setOptions({ name: key })
  if (existing) await useProgress.persist.rehydrate()
  else useProgress.setState({ ...fresh() })
}
