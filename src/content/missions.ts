import type { L } from './types'

/** Activity kinds the platform records. Missions count these per local day. */
export type ActivityKind = 'lesson' | 'quiz' | 'lab' | 'incident'

export interface MissionTemplate {
  id: string
  kind: ActivityKind
  target: number
  xp: number
  title: L
}

export const MISSION_POOL: MissionTemplate[] = [
  { id: 'm-lesson-1', kind: 'lesson', target: 1, xp: 30, title: { en: 'Complete a lesson', fr: 'Terminer une leçon' } },
  { id: 'm-lesson-2', kind: 'lesson', target: 2, xp: 50, title: { en: 'Complete 2 lessons', fr: 'Terminer 2 leçons' } },
  { id: 'm-quiz-5', kind: 'quiz', target: 5, xp: 40, title: { en: 'Answer 5 questions correctly', fr: 'Répondre juste à 5 questions' } },
  { id: 'm-quiz-10', kind: 'quiz', target: 10, xp: 60, title: { en: 'Answer 10 questions correctly', fr: 'Répondre juste à 10 questions' } },
  { id: 'm-lab-1', kind: 'lab', target: 1, xp: 80, title: { en: 'Validate a practical lab', fr: 'Valider un lab pratique' } },
  { id: 'm-incident-1', kind: 'incident', target: 1, xp: 90, title: { en: 'Resolve a simulator incident', fr: 'Résoudre un incident simulé' } },
]

/** Deterministic daily pick of 3 missions (one per kind family) from a day key. */
export function missionsForDay(day: string): MissionTemplate[] {
  let h = 0
  for (const c of day) h = (h * 31 + c.charCodeAt(0)) >>> 0
  const lessons = MISSION_POOL.filter((m) => m.kind === 'lesson')
  const quizzes = MISSION_POOL.filter((m) => m.kind === 'quiz')
  const practice = MISSION_POOL.filter((m) => m.kind === 'lab' || m.kind === 'incident')
  return [lessons[h % lessons.length], quizzes[(h >> 3) % quizzes.length], practice[(h >> 6) % practice.length]]
}
