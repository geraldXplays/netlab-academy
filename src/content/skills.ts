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
