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
}

const fresh = (): ProgressData => ({
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
        if (correct) get().recordActivity('quiz', correct)
        if (ratio < passRatio || get().completedLessons[id]) return false
        get().completeLesson(id)
        get().addXp(40 + Math.round(ratio * 20), { en: 'Lesson completed', fr: 'Leçon terminée' })
        const skill = MODULE_SKILL[id.split('.')[0]]
        if (skill) set((s) => ({ skills: { ...s.skills, [skill]: Math.min(100, (s.skills[skill] ?? 0) + Math.round(3 + ratio * 3)) } }))
        return true
      },

      toggleBookmark: (id) =>
        set((s) => ({ bookmarks: s.bookmarks.includes(id) ? s.bookmarks.filter((b) => b !== id) : [...s.bookmarks, id] })),
    }),
    {
      name: STORAGE_KEYS.progress,
      version: 2,
      storage: createJSONStorage(() => localAdapter),
      // v1 → v2 adds lesson state, resume pointer and bookmarks.
      migrate: (persisted) => ({ lessonState: {}, lastLesson: null, bookmarks: [], ...(persisted as object) }) as unknown as ProgressData & ProgressActions,
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
export const isLevelUnlocked = (s: ProgressData, index: number) =>
  index === 0 || levelProgress(s, LEVELS[index - 1].id).ratio >= 1

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
  }
}
