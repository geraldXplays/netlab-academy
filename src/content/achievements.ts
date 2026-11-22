import type { L } from './types'

export type AchievementIcon = 'link' | 'radar' | 'grid' | 'layers' | 'terminal' | 'server' | 'wrench' | 'blueprint' | 'flame' | 'spark'

export interface Achievement {
  id: string
  name: L
  description: L
  icon: AchievementIcon
  xp: number
  tier: 'bronze' | 'silver' | 'gold'
}

/** Badges are earned through assessments, labs and incidents — never by opening a page. */
export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first-connection', icon: 'link', tier: 'bronze', xp: 50,
    name: { en: 'First Connection', fr: 'Première connexion' },
    description: { en: 'Complete Lab 1 and get two hosts talking.', fr: 'Terminez le Lab 1 : deux hôtes qui communiquent.' } },
  { id: 'ping-master', icon: 'radar', tier: 'bronze', xp: 75,
    name: { en: 'Ping Master', fr: 'Maître du ping' },
    description: { en: 'Diagnose 5 connectivity faults with ping.', fr: 'Diagnostiquez 5 pannes de connectivité avec ping.' } },
  { id: 'subnet-apprentice', icon: 'grid', tier: 'silver', xp: 120,
    name: { en: 'Subnetting Apprentice', fr: 'Apprenti sous-réseaux' },
    description: { en: 'Score 90%+ on the subnetting assessment.', fr: "Obtenez 90 %+ à l'évaluation sous-réseaux." } },
  { id: 'vlan-specialist', icon: 'layers', tier: 'silver', xp: 150,
    name: { en: 'VLAN Specialist', fr: 'Spécialiste VLAN' },
    description: { en: 'Complete the VLAN lab with no hints.', fr: 'Terminez le lab VLAN sans indice.' } },
  { id: 'linux-explorer', icon: 'terminal', tier: 'bronze', xp: 75,
    name: { en: 'Linux Explorer', fr: 'Explorateur Linux' },
    description: { en: 'Pass the command-line basics assessment.', fr: "Réussissez l'évaluation ligne de commande." } },
  { id: 'server-admin', icon: 'server', tier: 'gold', xp: 250,
    name: { en: 'Server Administrator', fr: 'Administrateur serveur' },
    description: { en: 'Deploy both the Windows and Linux server labs.', fr: 'Déployez les labs serveur Windows et Linux.' } },
  { id: 'troubleshooter', icon: 'wrench', tier: 'gold', xp: 250,
    name: { en: 'Network Troubleshooter', fr: 'Dépanneur réseau' },
    description: { en: 'Resolve 5 simulator incidents with an A rating.', fr: 'Résolvez 5 incidents du simulateur avec la note A.' } },
  { id: 'architect', icon: 'blueprint', tier: 'gold', xp: 500,
    name: { en: 'Infrastructure Architect', fr: "Architecte d'infrastructure" },
    description: { en: 'Deliver the small business infrastructure project.', fr: "Livrez le projet d'infrastructure PME." } },
  { id: 'streak-7', icon: 'flame', tier: 'silver', xp: 100,
    name: { en: 'On Call', fr: "D'astreinte" },
    description: { en: 'Keep a 7-day learning streak.', fr: "Maintenez une série d'apprentissage de 7 jours." } },
]

export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id)
