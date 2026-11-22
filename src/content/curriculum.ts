import type { L } from './types'

/**
 * Curriculum outline. Lesson bodies arrive in Phase 2 — each module here
 * declares how many lessons it will hold so progress maths works today.
 * Lesson ids are `${moduleId}.${index}` (1-based).
 */
export interface Module {
  id: string
  title: L
  lessonCount: number
}

export interface Level {
  id: string
  number: number
  title: L
  role: L
  summary: L
  accent: 'cyan' | 'blue' | 'purple'
  /** Skill axis this level mostly trains (see skills.ts). */
  skills: string[]
  modules: Module[]
}

const m = (id: string, en: string, fr: string, lessonCount = 3): Module => ({
  id,
  title: { en, fr },
  lessonCount,
})

export const LEVELS: Level[] = [
  {
    id: 'foundations',
    number: 1,
    title: { en: 'IT Foundations', fr: 'Fondamentaux IT' },
    role: { en: 'Trainee', fr: 'Stagiaire' },
    summary: {
      en: 'How a computer works, how it talks to others, and the vocabulary every technician uses daily.',
      fr: 'Comment fonctionne un ordinateur, comment il communique, et le vocabulaire quotidien du technicien.',
    },
    accent: 'cyan',
    skills: ['hardware', 'systems', 'networking'],
    modules: [
      m('l1-hardware', 'Computer hardware', 'Matériel informatique', 2),
      m('l1-components', 'Components & peripherals', 'Composants et périphériques', 2),
      m('l1-os', 'Operating systems', "Systèmes d'exploitation", 2),
      m('l1-fs', 'Filesystems', 'Systèmes de fichiers', 2),
      m('l1-cli', 'Command-line basics', 'Bases de la ligne de commande', 3),
      m('l1-net-intro', 'Introduction to networking', 'Introduction aux réseaux', 2),
      m('l1-ethernet', 'Ethernet & network cables', 'Ethernet et câbles réseau', 2),
      m('l1-ip', 'IP addresses', 'Adresses IP', 2),
      m('l1-mac', 'MAC addresses', 'Adresses MAC', 1),
      m('l1-arch', 'Basic network architecture', 'Architecture réseau de base', 2),
    ],
  },
  {
    id: 'technician',
    number: 2,
    title: { en: 'Network Technician', fr: 'Technicien réseau' },
    role: { en: 'Technician', fr: 'Technicien' },
    summary: {
      en: 'Models, addressing, switching and routing — the core of every network you will ever touch.',
      fr: "Modèles, adressage, commutation et routage — le cœur de tout réseau que vous toucherez.",
    },
    accent: 'blue',
    skills: ['networking', 'routing'],
    modules: [
      m('l2-osi', 'OSI & TCP/IP models', 'Modèles OSI et TCP/IP'),
      m('l2-ipv4-6', 'IPv4 & IPv6', 'IPv4 et IPv6'),
      m('l2-subnet', 'Subnetting', 'Sous-réseaux', 5),
      m('l2-switch', 'Switches', 'Commutateurs'),
      m('l2-router', 'Routers', 'Routeurs'),
      m('l2-vlan', 'VLANs', 'VLAN'),
      m('l2-trunk', 'Trunking', 'Trunking', 2),
      m('l2-routing', 'Routing', 'Routage', 4),
      m('l2-dhcp', 'DHCP', 'DHCP', 2),
      m('l2-dns', 'DNS', 'DNS'),
      m('l2-nat', 'NAT', 'NAT', 2),
      m('l2-pt', 'Cisco Packet Tracer', 'Cisco Packet Tracer'),
      m('l2-troubleshoot', 'Network troubleshooting', 'Dépannage réseau', 4),
    ],
  },
  {
    id: 'sysadmin',
    number: 3,
    title: { en: 'Systems Administrator', fr: 'Administrateur systèmes' },
    role: { en: 'Administrator', fr: 'Administrateur' },
    summary: {
      en: 'Run Windows and Linux servers, manage identities, policies, shares and core services.',
      fr: 'Gérer serveurs Windows et Linux, identités, stratégies, partages et services essentiels.',
    },
    accent: 'purple',
    skills: ['systems', 'security'],
    modules: [
      m('l3-winsrv', 'Windows Server', 'Windows Server', 4),
      m('l3-linux', 'Linux Server', 'Serveur Linux', 4),
      m('l3-ad', 'Active Directory', 'Active Directory', 4),
      m('l3-users', 'Users & groups', 'Utilisateurs et groupes'),
      m('l3-gpo', 'Group Policy', 'Stratégies de groupe'),
      m('l3-perms', 'File permissions', 'Permissions de fichiers'),
      m('l3-shares', 'Shared folders', 'Dossiers partagés', 2),
      m('l3-dnsdhcp', 'DNS & DHCP server configuration', 'Configuration serveurs DNS et DHCP'),
      m('l3-remote', 'Remote administration', 'Administration à distance', 2),
      m('l3-scripting', 'PowerShell & Linux administration', 'PowerShell et administration Linux', 4),
    ],
  },
  {
    id: 'infrastructure',
    number: 4,
    title: { en: 'Infrastructure Specialist', fr: "Spécialiste infrastructure" },
    role: { en: 'Specialist', fr: 'Spécialiste' },
    summary: {
      en: 'The physical and virtual backbone: cabling, racks, servers, virtualisation, storage and backups.',
      fr: 'La colonne vertébrale physique et virtuelle : câblage, baies, serveurs, virtualisation, stockage, sauvegardes.',
    },
    accent: 'cyan',
    skills: ['hardware', 'infrastructure'],
    modules: [
      m('l4-physical', 'Physical network infrastructure', 'Infrastructure réseau physique'),
      m('l4-cabling', 'Ethernet cabling', 'Câblage Ethernet'),
      m('l4-patch', 'Patch panels', 'Panneaux de brassage', 2),
      m('l4-racks', 'Network racks', 'Baies réseau', 2),
      m('l4-servers', 'Servers', 'Serveurs'),
      m('l4-virt', 'Virtualisation', 'Virtualisation', 4),
      m('l4-vms', 'Virtual machines', 'Machines virtuelles'),
      m('l4-storage', 'Storage', 'Stockage'),
      m('l4-raid', 'RAID', 'RAID', 2),
      m('l4-backup', 'Backups', 'Sauvegardes'),
      m('l4-deploy', 'Infrastructure deployment', "Déploiement d'infrastructure"),
    ],
  },
  {
    id: 'security',
    number: 5,
    title: { en: 'Network & Security Specialist', fr: 'Spécialiste réseau et sécurité' },
    role: { en: 'Security Specialist', fr: 'Spécialiste sécurité' },
    summary: {
      en: 'Defend, segment and observe: firewalls, VPNs, monitoring, packet analysis and incident response.',
      fr: 'Défendre, segmenter, observer : pare-feu, VPN, supervision, analyse de paquets, réponse aux incidents.',
    },
    accent: 'blue',
    skills: ['security', 'networking'],
    modules: [
      m('l5-firewall', 'Firewalls', 'Pare-feu', 4),
      m('l5-vpn', 'VPNs', 'VPN'),
      m('l5-segment', 'Network segmentation', 'Segmentation réseau'),
      m('l5-netsec', 'Network security', 'Sécurité réseau'),
      m('l5-access', 'Access control', "Contrôle d'accès"),
      m('l5-monitor', 'Monitoring', 'Supervision'),
      m('l5-wireshark', 'Wireshark', 'Wireshark', 4),
      m('l5-cyber', 'Cybersecurity fundamentals', 'Fondamentaux de la cybersécurité'),
      m('l5-ir', 'Incident response', 'Réponse aux incidents'),
      m('l5-adv-ts', 'Advanced network troubleshooting', 'Dépannage réseau avancé', 4),
    ],
  },
  {
    id: 'engineer',
    number: 6,
    title: { en: 'Professional Infrastructure Engineer', fr: "Ingénieur infrastructure" },
    role: { en: 'Engineer', fr: 'Ingénieur' },
    summary: {
      en: 'Design and run enterprise infrastructure end to end — and document it so others can too.',
      fr: "Concevoir et exploiter une infrastructure d'entreprise de bout en bout — et la documenter.",
    },
    accent: 'purple',
    skills: ['infrastructure', 'routing', 'security'],
    modules: [
      m('l6-enterprise', 'Enterprise network architecture', "Architecture réseau d'entreprise", 4),
      m('l6-multisite', 'Multi-site infrastructure', 'Infrastructure multi-sites'),
      m('l6-deploy', 'Server deployment', 'Déploiement de serveurs'),
      m('l6-docs', 'Network documentation', 'Documentation réseau', 2),
      m('l6-planning', 'Infrastructure planning', "Planification d'infrastructure"),
      m('l6-ha', 'High availability', 'Haute disponibilité'),
      m('l6-dr', 'Disaster recovery', 'Reprise après sinistre'),
      m('l6-projects', 'Enterprise projects', "Projets d'entreprise", 4),
    ],
  },
]

export const lessonIds = (mod: Module) =>
  Array.from({ length: mod.lessonCount }, (_, i) => `${mod.id}.${i + 1}`)

export const levelLessonIds = (level: Level) => level.modules.flatMap(lessonIds)

export const ALL_LESSON_IDS = LEVELS.flatMap(levelLessonIds)
