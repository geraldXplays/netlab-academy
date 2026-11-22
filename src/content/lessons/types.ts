import type { L } from '../types'

/**
 * Lesson content model. Lessons are pure data; the lesson player renders them.
 *
 * Rich text (`L` bodies) supports a tiny markdown subset:
 *   paragraphs separated by a blank line, "- " bullet lines, "1. " numbered lines,
 *   **bold**, `inline code`.
 */

export type DiagramKey =
  | 'ipo'
  | 'motherboard'
  | 'memory-hierarchy'
  | 'os-layers'
  | 'boot-sequence'
  | 'fs-tree'
  | 'command-anatomy'
  | 'lan-wan'
  | 'topologies'
  | 'rj45-pinout'
  | 'ipv4-anatomy'
  | 'mac-anatomy'
  | 'home-network'
  | 'packet-journey'

export type Block =
  | { type: 'text'; title?: L; body: L }
  | { type: 'callout'; tone: 'tip' | 'warn' | 'info' | 'pro'; title?: L | string; body: L }
  | { type: 'diagram'; diagram: DiagramKey; caption: L }
  | { type: 'example'; title: L; body: L; code?: string }
  | { type: 'code'; code: string; caption?: L }
  | { type: 'table'; head: (L | string)[]; rows: (L | string)[][] }
  | { type: 'check'; question: Question }

export type Question =
  | { kind: 'mcq'; prompt: L; options: (L | string)[]; answer: number; explain: L | string }
  | { kind: 'tf'; prompt: L; answer: boolean; explain: L | string }

export interface Term {
  term: L | string
  def: L
}

export interface Lesson {
  /** `${moduleId}.${n}` — must match the curriculum module. */
  id: string
  title: L
  minutes: number
  objectives: L[]
  blocks: Block[]
  vocabulary: Term[]
  /** Where the learner will use this on the job. */
  practice: L
  /** Final lesson assessment. Passing (≥ PASS_RATIO) completes the lesson. */
  quiz: Question[]
}

export const PASS_RATIO = 0.75

/** Helper for writing bilingual strings concisely in content files. */
export const t = (en: string, fr: string): L => ({ en, fr })
