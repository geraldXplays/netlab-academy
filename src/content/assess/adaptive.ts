import type { ExamQuestion } from '../lessons/types'

export interface TopicStat {
  seen: number
  correct: number
}

/**
 * Adaptive selector. Difficulty climbs after correct answers and drops after
 * mistakes; among candidates it prefers topics where the learner is weakest.
 * A generator function can be used instead of a fixed pool (infinite drills).
 */
export class AdaptivePicker {
  level = 1.5
  private used = new Set<string>()
  private pool: ExamQuestion[] | ((difficulty: 1 | 2 | 3) => ExamQuestion)
  private stats: Record<string, TopicStat>

  constructor(pool: ExamQuestion[] | ((difficulty: 1 | 2 | 3) => ExamQuestion), stats: Record<string, TopicStat> = {}, start = 1.5) {
    this.pool = pool
    this.stats = stats
    this.level = start
  }

  private weakness(topic: string) {
    const s = this.stats[topic]
    if (!s || s.seen < 2) return 0.5
    return 1 - s.correct / s.seen
  }

  next(): ExamQuestion | null {
    const target = Math.round(this.level) as 1 | 2 | 3
    if (typeof this.pool === 'function') return this.pool(target)
    const free = this.pool.filter((q) => !this.used.has(q.id))
    if (!free.length) return null
    const scored = free.map((q) => ({
      q,
      score: -Math.abs(q.difficulty - target) * 2 + this.weakness(q.topic) * 1.5 + Math.random() * 0.8,
    }))
    scored.sort((a, b) => b.score - a.score)
    const pick = scored[0].q
    this.used.add(pick.id)
    return pick
  }

  record(correct: boolean) {
    this.level = Math.max(1, Math.min(3, this.level + (correct ? 0.5 : -0.75)))
  }
}

export function shuffle<T>(a: T[]): T[] {
  const r = [...a]
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[r[i], r[j]] = [r[j], r[i]]
  }
  return r
}
