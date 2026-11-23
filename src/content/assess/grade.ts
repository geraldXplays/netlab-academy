import type { Question } from '../lessons/types'

/** Learner response shapes, one per question kind. */
export type Response = number | boolean | string | string[] | number[]

export const norm = (s: string) =>
  s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/^[$#>]\s*/, '') // tolerate a pasted prompt character
    .replace(/[‘’“”]/g, '"')

const matches = (value: string, accept: string[]) => accept.some((a) => norm(a) === norm(value))

/** True when the response is correct. Pure and deterministic. */
export function grade(q: Question, r: Response | null | undefined): boolean {
  if (r === null || r === undefined) return false
  switch (q.kind) {
    case 'mcq':
      return r === q.answer
    case 'tf':
      return r === q.answer
    case 'command':
    case 'input':
      return typeof r === 'string' && matches(r, q.accept)
    case 'order':
      return Array.isArray(r) && r.length === q.items.length && (r as number[]).every((v, i) => v === i)
    case 'fields':
      return Array.isArray(r) && q.fields.every((f, i) => typeof r[i] === 'string' && matches(r[i] as string, f.accept))
  }
}

/** Human-readable correct answer (for review screens). */
export function correctAnswer(q: Question, lang: 'en' | 'fr'): string {
  const t = (v: string | { en: string; fr: string }) => (typeof v === 'string' ? v : v[lang])
  switch (q.kind) {
    case 'mcq':
      return t(q.options[q.answer])
    case 'tf':
      return q.answer ? (lang === 'fr' ? 'Vrai' : 'True') : lang === 'fr' ? 'Faux' : 'False'
    case 'command':
    case 'input':
      return q.accept[0]
    case 'order':
      return q.items.map((x, i) => `${i + 1}. ${t(x)}`).join('  ')
    case 'fields':
      return q.fields.map((f) => `${t(f.label)}: ${f.accept[0]}`).join(' · ')
  }
}
