import type { L } from './types'

export interface Assessment {
  id: string
  levelId: string
  kind: 'quiz' | 'exam' | 'practical'
  title: L
  questions: number
  minutes: number
  /** Lesson that must be completed before this unlocks. */
  unlockAfter: string
}

export const ASSESSMENTS: Assessment[] = [
  { id: 'a-hw', levelId: 'foundations', kind: 'quiz', questions: 12, minutes: 10, unlockAfter: 'l1-components.2',
    title: { en: 'Hardware checkpoint', fr: 'Point de contrôle matériel' } },
  { id: 'a-cli', levelId: 'foundations', kind: 'practical', questions: 8, minutes: 15, unlockAfter: 'l1-cli.3',
    title: { en: 'Command-line practical', fr: 'Pratique ligne de commande' } },
  { id: 'a-ip', levelId: 'foundations', kind: 'quiz', questions: 15, minutes: 12, unlockAfter: 'l1-mac.1',
    title: { en: 'Addressing fundamentals', fr: "Fondamentaux de l'adressage" } },
  { id: 'a-l1-exam', levelId: 'foundations', kind: 'exam', questions: 40, minutes: 45, unlockAfter: 'l1-arch.2',
    title: { en: 'Level 1 certification exam', fr: 'Examen de certification niveau 1' } },
  { id: 'a-subnet', levelId: 'technician', kind: 'quiz', questions: 20, minutes: 20, unlockAfter: 'l2-subnet.5',
    title: { en: 'Subnetting challenge', fr: 'Défi sous-réseaux' } },
]
