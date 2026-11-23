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

/** Step-by-step animated examples (components/anim). */
export type AnimKey = 'osi-encap' | 'tcp-handshake' | 'ipv6-compress' | 'binary-and' | 'subnet-split' | 'vlsm'
  | 'mac-learning' | 'arp' | 'route-lookup' | 'vlan-tag' | 'router-on-stick' | 'stp' | 'dynamic-routing'
  | 'dhcp-dora' | 'dns-resolve' | 'nat-pat' | 'ts-method'
/** Interactive widgets learners can play with. */
export type WidgetKey = 'subnet-calc'

export type Block =
  | { type: 'text'; title?: L; body: L }
  | { type: 'callout'; tone: 'tip' | 'warn' | 'info' | 'pro'; title?: L | string; body: L }
  | { type: 'diagram'; diagram: DiagramKey; caption: L }
  | { type: 'example'; title: L; body: L; code?: string }
  | { type: 'code'; code: string; caption?: L }
  | { type: 'table'; head: (L | string)[]; rows: (L | string)[][] }
  | { type: 'check'; question: Question }
  | { type: 'animation'; anim: AnimKey; title: L }
  | { type: 'widget'; widget: WidgetKey }

export type Question =
  | { kind: 'mcq'; prompt: L; options: (L | string)[]; answer: number; explain: L | string; code?: string }
  | { kind: 'tf'; prompt: L; answer: boolean; explain: L | string; code?: string }
  /** Type a command. Accepted answers are compared after normalising case and spacing. */
  | { kind: 'command'; prompt: L; accept: string[]; explain: L | string; code?: string; shell?: string }
  /** Type a short value (number, address…). */
  | { kind: 'input'; prompt: L; accept: string[]; explain: L | string; code?: string; placeholder?: string }
  /** Put the items in the right order (items are listed in the correct order). */
  | { kind: 'order'; prompt: L; items: (L | string)[]; explain: L | string }
  /** Fill several fields, e.g. an IP configuration. */
  | { kind: 'fields'; prompt: L; fields: { label: L | string; accept: string[]; placeholder?: string }[]; explain: L | string; code?: string }

/** Assessment metadata layered on a question. */
export type ExamQuestion = Question & {
  id: string
  /** curriculum module id, used for topic analytics and adaptive review */
  topic: string
  /** 1 = recall, 2 = apply, 3 = analyse/troubleshoot */
  difficulty: 1 | 2 | 3
  tags?: string[]
}

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
