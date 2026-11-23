import type { L } from './types'
import { LEVELS } from './curriculum'
import { LESSONS, type ExamQuestion } from './lessons'
import { COMMAND_BANK, CONFIG_BANK, ORDER_BANK, TROUBLESHOOT_BANK } from './assess/banks'
import { ADDRESSING_GENERATORS, SUBNET_GENERATORS } from './assess/generators'

export interface Assessment {
  id: string
  levelId: string
  kind: 'quiz' | 'exam' | 'practical'
  title: L
  description: L
  /** Number of questions drawn (adaptively) from the pool. */
  questions: number
  minutes: number
  passRatio: number
  xp: number
  /** Lessons that must be completed before the assessment unlocks. */
  requires: string[]
  /** Builds the candidate pool (generated items are fresh every attempt). */
  pool: () => ExamQuestion[]
  /** 'instant' = feedback after each answer; 'end' = exam conditions, review at the end. */
  feedback: 'instant' | 'end'
  badge?: string
  /** Passing awards a printable certificate for this level and unlocks the next level. */
  certificate?: boolean
}

const lessonsOf = (...moduleIds: string[]) =>
  LEVELS.flatMap((l) => l.modules)
    .filter((m) => moduleIds.includes(m.id))
    .flatMap((m) => Array.from({ length: m.lessonCount }, (_, i) => `${m.id}.${i + 1}`))

/** Every quiz + knowledge-check question of the given modules, as exam items. */
export function lessonQuestions(...moduleIds: string[]): ExamQuestion[] {
  return lessonsOf(...moduleIds).flatMap((id) => {
    const lesson = LESSONS[id]
    if (!lesson) return []
    const topic = id.split('.')[0]
    const fromQuiz = lesson.quiz.map((q, i) => ({ ...q, id: `${id}-q${i}`, topic, difficulty: ('code' in q && q.code ? 2 : 1) as 1 | 2 }))
    const fromChecks = lesson.blocks.flatMap((b, i) => (b.type === 'check' ? [{ ...b.question, id: `${id}-c${i}`, topic, difficulty: 1 as const }] : []))
    return [...fromQuiz, ...fromChecks]
  })
}

const gen = (gens: ((d: 1 | 2 | 3) => ExamQuestion)[], perLevel: number) =>
  ([1, 2, 3] as const).flatMap((d) => Array.from({ length: perLevel }, (_, i) => gens[(i + d) % gens.length](d)))

const byIds = (bank: ExamQuestion[], ...ids: string[]) => bank.filter((q) => ids.includes(q.id))
const byTopic = (bank: ExamQuestion[], ...topics: string[]) => bank.filter((q) => topics.includes(q.topic))

const L1_MODULES = LEVELS[0].modules.map((m) => m.id)

export const ASSESSMENTS: Assessment[] = [
  {
    id: 'a-hw', levelId: 'foundations', kind: 'quiz', questions: 10, minutes: 12, passRatio: 0.75, xp: 100, feedback: 'instant',
    title: { en: 'Hardware checkpoint', fr: 'Point de contrôle matériel' },
    description: { en: 'Components, memory, storage, ports and safe handling.', fr: 'Composants, mémoire, stockage, ports et manipulation sûre.' },
    requires: lessonsOf('l1-hardware', 'l1-components'),
    pool: () => [...lessonQuestions('l1-hardware', 'l1-components'), ...byIds(ORDER_BANK, 'ord-units')],
  },
  {
    id: 'a-os', levelId: 'foundations', kind: 'quiz', questions: 10, minutes: 12, passRatio: 0.75, xp: 100, feedback: 'instant',
    title: { en: 'Systems checkpoint', fr: 'Point de contrôle systèmes' },
    description: { en: 'Operating systems, boot process, accounts, filesystems and paths.', fr: 'Systèmes d’exploitation, démarrage, comptes, systèmes de fichiers et chemins.' },
    requires: lessonsOf('l1-os', 'l1-fs'),
    pool: () => [...lessonQuestions('l1-os', 'l1-fs'), ...byIds(ORDER_BANK, 'ord-boot'), ...byIds(TROUBLESHOOT_BANK, 'ts-fat32', 'ts-post')],
  },
  {
    id: 'a-cli', levelId: 'foundations', kind: 'practical', questions: 10, minutes: 15, passRatio: 0.7, xp: 120, feedback: 'instant', badge: 'linux-explorer',
    title: { en: 'Command-line practical', fr: 'Pratique ligne de commande' },
    description: { en: 'Type real Windows and Linux commands, then read their output.', fr: 'Tapez de vraies commandes Windows et Linux, puis lisez leur sortie.' },
    requires: lessonsOf('l1-cli'),
    pool: () => [...byTopic(COMMAND_BANK, 'l1-cli'), ...byIds(ORDER_BANK, 'ord-ladder'), ...byIds(TROUBLESHOOT_BANK, 'ts-dns', 'ts-ladder', 'ts-timeout')],
  },
  {
    id: 'a-net', levelId: 'foundations', kind: 'quiz', questions: 10, minutes: 12, passRatio: 0.75, xp: 100, feedback: 'instant',
    title: { en: 'Networking fundamentals', fr: 'Fondamentaux des réseaux' },
    description: { en: 'Network types, topologies, Ethernet, cabling and connectors.', fr: 'Types de réseaux, topologies, Ethernet, câblage et connecteurs.' },
    requires: lessonsOf('l1-net-intro', 'l1-ethernet'),
    pool: () => [...lessonQuestions('l1-net-intro', 'l1-ethernet'), ...byIds(TROUBLESHOOT_BANK, 'ts-speed', 'ts-floor')],
  },
  {
    id: 'a-ip', levelId: 'foundations', kind: 'practical', questions: 12, minutes: 18, passRatio: 0.75, xp: 140, feedback: 'instant',
    title: { en: 'Addressing fundamentals', fr: 'Fondamentaux de l’adressage' },
    description: { en: 'Binary, masks, private ranges, MAC/ARP — with generated calculations.', fr: 'Binaire, masques, plages privées, MAC/ARP — avec calculs générés.' },
    requires: lessonsOf('l1-ip', 'l1-mac'),
    pool: () => [
      ...lessonQuestions('l1-ip', 'l1-mac'),
      ...gen(ADDRESSING_GENERATORS, 3),
      ...byIds(CONFIG_BANK, 'cfg-lab1'),
      ...byIds(COMMAND_BANK, 'cmd-arp'),
      ...byIds(TROUBLESHOOT_BANK, 'ts-apipa', 'ts-mask'),
    ],
  },
  {
    id: 'a-l1-exam', levelId: 'foundations', kind: 'exam', questions: 30, minutes: 45, passRatio: 0.8, xp: 300, feedback: 'end', badge: 'foundations-certified', certificate: true,
    title: { en: 'Level 1 certification exam', fr: 'Examen de certification niveau 1' },
    description: { en: 'Everything from IT Foundations under exam conditions. Pass with 80% to earn your certificate and unlock Level 2.', fr: 'Tout le niveau Fondamentaux IT en conditions d’examen. 80 % pour obtenir le certificat et débloquer le niveau 2.' },
    requires: lessonsOf(...L1_MODULES),
    pool: () => [
      ...lessonQuestions(...L1_MODULES),
      ...gen(ADDRESSING_GENERATORS, 3),
      ...COMMAND_BANK,
      ...TROUBLESHOOT_BANK,
      ...ORDER_BANK,
      ...CONFIG_BANK,
    ],
  },
  {
    id: 'a-subnet', levelId: 'technician', kind: 'practical', questions: 15, minutes: 20, passRatio: 0.9, xp: 200, feedback: 'instant', badge: 'subnet-apprentice',
    title: { en: 'Subnetting challenge', fr: 'Défi sous-réseaux' },
    description: { en: 'Generated subnetting problems up to /30 — 90% required.', fr: 'Problèmes de sous-réseaux générés jusqu’à /30 — 90 % requis.' },
    requires: lessonsOf('l2-subnet'),
    pool: () => gen(SUBNET_GENERATORS, 6),
  },
]

export const assessmentById = (id: string) => ASSESSMENTS.find((a) => a.id === id)

/** The exam that unlocks the level after `levelNumber`. */
export const levelExamId = (levelNumber: number) => `a-l${levelNumber}-exam`
