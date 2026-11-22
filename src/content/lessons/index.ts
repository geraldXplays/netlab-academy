import type { L } from '../types'
import { LEVELS, type Module } from '../curriculum'
import type { Lesson } from './types'
import { hardwareLessons, componentLessons } from './l1/hardware'
import { osLessons, fsLessons } from './l1/os'
import { cliLessons } from './l1/cli'
import { netIntroLessons, ethernetLessons } from './l1/network'
import { ipLessons, macLessons, archLessons } from './l1/addressing'

export * from './types'

const ALL: Lesson[] = [
  ...hardwareLessons, ...componentLessons, ...osLessons, ...fsLessons, ...cliLessons,
  ...netIntroLessons, ...ethernetLessons, ...ipLessons, ...macLessons, ...archLessons,
]

export const LESSONS: Record<string, Lesson> = Object.fromEntries(ALL.map((l) => [l.id, l]))

export const getLesson = (id: string): Lesson | undefined => LESSONS[id]

/** A module is "published" when every lesson it declares has authored content. */
export const isModulePublished = (m: Module) =>
  Array.from({ length: m.lessonCount }, (_, i) => `${m.id}.${i + 1}`).every((id) => LESSONS[id])

export function locateLesson(id: string) {
  for (const level of LEVELS) {
    for (const mod of level.modules) {
      if (id.startsWith(`${mod.id}.`)) {
        const index = Number(id.slice(mod.id.length + 1))
        return { level, module: mod, index }
      }
    }
  }
  return null
}

/** Neighbouring lesson ids in curriculum order (published content only). */
export function adjacentLessons(id: string) {
  const order = LEVELS.flatMap((l) => l.modules.flatMap((m) => Array.from({ length: m.lessonCount }, (_, i) => `${m.id}.${i + 1}`))).filter((x) => LESSONS[x])
  const i = order.indexOf(id)
  return { prev: i > 0 ? order[i - 1] : null, next: i >= 0 && i < order.length - 1 ? order[i + 1] : null }
}

/** Search lesson titles, objectives and vocabulary in the active language. */
export function searchLessons(query: string, lang: keyof L) {
  const q = query.trim().toLowerCase()
  if (q.length < 2) return []
  const text = (v: L | string) => (typeof v === 'string' ? v : v[lang]).toLowerCase()
  return ALL.filter(
    (l) => text(l.title).includes(q) || l.objectives.some((o) => text(o).includes(q)) || l.vocabulary.some((v) => text(v.term).includes(q)),
  )
}

if (import.meta.env.DEV) {
  for (const l of ALL) if (!locateLesson(l.id)) console.warn(`[content] lesson ${l.id} has no curriculum module`)
}
