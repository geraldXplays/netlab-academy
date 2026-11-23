import type { L } from './types'
import { LEVELS } from './curriculum'
import { LESSONS, type ExamQuestion } from './lessons'
import { COMMAND_BANK, CONFIG_BANK, ORDER_BANK, TROUBLESHOOT_BANK } from './assess/banks'
import { ADDRESSING_GENERATORS, SUBNET_GENERATORS } from './assess/generators'
import { IOS_BANK, L2_CONFIG_BANK, L2_ORDER_BANK, L2_TROUBLE_BANK } from './assess/l2bank'

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
const L2_MODULES = LEVELS[1].modules.map((m) => m.id)

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
  {
    id: 'a-l2-models', levelId: 'technician', kind: 'quiz', questions: 12, minutes: 15, passRatio: 0.75, xp: 120, feedback: 'instant',
    title: { en: 'Models & addressing checkpoint', fr: 'Point de contrôle modèles & adressage' },
    description: { en: 'OSI and TCP/IP, ports, TCP vs UDP, IPv4 special ranges and IPv6.', fr: 'OSI et TCP/IP, ports, TCP vs UDP, plages IPv4 spéciales et IPv6.' },
    requires: lessonsOf('l2-osi', 'l2-ipv4-6'),
    pool: () => [...lessonQuestions('l2-osi', 'l2-ipv4-6'), ...byIds(L2_ORDER_BANK, 'l2ord-tcp'), ...byIds(L2_TROUBLE_BANK, 'l2ts-ports')],
  },
  {
    id: 'a-l2-switching', levelId: 'technician', kind: 'quiz', questions: 14, minutes: 18, passRatio: 0.75, xp: 150, feedback: 'instant',
    title: { en: 'Switching & VLANs checkpoint', fr: 'Point de contrôle commutation & VLAN' },
    description: { en: 'MAC learning, ARP, STP, VLANs, trunks and inter-VLAN routing.', fr: 'Apprentissage MAC, ARP, STP, VLAN, trunks et routage inter-VLAN.' },
    requires: lessonsOf('l2-switch', 'l2-vlan', 'l2-trunk'),
    pool: () => [...lessonQuestions('l2-switch', 'l2-vlan', 'l2-trunk'), ...byTopic(L2_TROUBLE_BANK, 'l2-switch', 'l2-vlan', 'l2-trunk'), ...byIds(L2_CONFIG_BANK, 'l2cfg-roas')],
  },
  {
    id: 'a-l2-routing', levelId: 'technician', kind: 'quiz', questions: 12, minutes: 16, passRatio: 0.75, xp: 150, feedback: 'instant',
    title: { en: 'Routing checkpoint', fr: 'Point de contrôle routage' },
    description: { en: 'Routing tables, longest prefix match, static and default routes, OSPF.', fr: 'Tables de routage, correspondance la plus longue, routes statiques et par défaut, OSPF.' },
    requires: lessonsOf('l2-router', 'l2-routing'),
    pool: () => [...lessonQuestions('l2-router', 'l2-routing'), ...byTopic(L2_TROUBLE_BANK, 'l2-router', 'l2-routing')],
  },
  {
    id: 'a-l2-services', levelId: 'technician', kind: 'quiz', questions: 12, minutes: 16, passRatio: 0.75, xp: 150, feedback: 'instant',
    title: { en: 'Network services checkpoint', fr: 'Point de contrôle services réseau' },
    description: { en: 'DHCP, DNS and NAT — how they work and how they fail.', fr: 'DHCP, DNS et NAT — leur fonctionnement et leurs pannes.' },
    requires: lessonsOf('l2-dhcp', 'l2-dns', 'l2-nat'),
    pool: () => [...lessonQuestions('l2-dhcp', 'l2-dns', 'l2-nat'), ...byTopic(L2_TROUBLE_BANK, 'l2-dhcp', 'l2-dns', 'l2-nat'), ...byIds(L2_ORDER_BANK, 'l2ord-dora', 'l2ord-dns'), ...byIds(L2_CONFIG_BANK, 'l2cfg-dhcp')],
  },
  {
    id: 'a-l2-ios', levelId: 'technician', kind: 'practical', questions: 15, minutes: 18, passRatio: 0.8, xp: 200, feedback: 'instant',
    title: { en: 'Cisco IOS practical', fr: 'Pratique Cisco IOS' },
    description: { en: 'Type real switch and router commands from memory — VLANs, trunks, routes, DHCP, NAT.', fr: 'Tapez de mémoire de vraies commandes de switch et routeur — VLAN, trunks, routes, DHCP, NAT.' },
    requires: lessonsOf('l2-switch', 'l2-router', 'l2-vlan'),
    pool: () => [...IOS_BANK, ...byIds(L2_ORDER_BANK, 'l2ord-switch')],
  },
  {
    id: 'a-l2-troubleshoot', levelId: 'technician', kind: 'practical', questions: 10, minutes: 20, passRatio: 0.8, xp: 220, feedback: 'instant', badge: 'ping-master',
    title: { en: 'Troubleshooting practical', fr: 'Pratique de dépannage' },
    description: { en: 'Real outputs from switches, routers and PCs. Find the fault and the fix.', fr: 'De vraies sorties de switches, routeurs et PC. Trouvez la panne et la correction.' },
    requires: lessonsOf('l2-troubleshoot'),
    pool: () => [...L2_TROUBLE_BANK, ...lessonQuestions('l2-troubleshoot'), ...byIds(L2_ORDER_BANK, 'l2ord-ts')],
  },
  {
    id: 'a-l2-exam', levelId: 'technician', kind: 'exam', questions: 40, minutes: 60, passRatio: 0.8, xp: 500, feedback: 'end', badge: 'technician-certified', certificate: true,
    title: { en: 'Level 2 certification exam', fr: 'Examen de certification niveau 2' },
    description: { en: 'The whole Network Technician level under exam conditions: models, subnetting, switching, routing, services and troubleshooting. 80% to earn your certificate and unlock Level 3.', fr: 'Tout le niveau Technicien réseau en conditions d’examen : modèles, sous-réseaux, commutation, routage, services et dépannage. 80 % pour le certificat et débloquer le niveau 3.' },
    requires: lessonsOf(...L2_MODULES),
    pool: () => [
      ...lessonQuestions(...L2_MODULES),
      ...gen(SUBNET_GENERATORS, 3),
      ...IOS_BANK,
      ...L2_TROUBLE_BANK,
      ...L2_CONFIG_BANK,
      ...L2_ORDER_BANK,
    ],
  },
]

export const assessmentById = (id: string) => ASSESSMENTS.find((a) => a.id === id)

/** The exam that unlocks the level after `levelNumber`. */
export const levelExamId = (levelNumber: number) => `a-l${levelNumber}-exam`
