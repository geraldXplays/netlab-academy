import type { L } from './types'

export interface Skill {
  id: string
  label: L
}

/** Skill axes shown on the dashboard radar. Mastery comes only from assessments & labs. */
export const SKILLS: Skill[] = [
  { id: 'hardware', label: { en: 'Hardware', fr: 'Matériel' } },
  { id: 'networking', label: { en: 'Networking', fr: 'Réseaux' } },
  { id: 'routing', label: { en: 'Routing & Switching', fr: 'Routage & commutation' } },
  { id: 'systems', label: { en: 'Systems', fr: 'Systèmes' } },
  { id: 'security', label: { en: 'Security', fr: 'Sécurité' } },
  { id: 'infrastructure', label: { en: 'Infrastructure', fr: 'Infrastructure' } },
]

/** Which skill axis each module trains (mastery grows only when its lesson quizzes are passed). */
export const MODULE_SKILL: Record<string, string> = {
  'l1-hardware': 'hardware', 'l1-components': 'hardware',
  'l1-os': 'systems', 'l1-fs': 'systems', 'l1-cli': 'systems',
  'l1-net-intro': 'networking', 'l1-ethernet': 'networking', 'l1-ip': 'networking', 'l1-mac': 'networking', 'l1-arch': 'networking',
}
