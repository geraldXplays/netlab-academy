import type { ComponentType } from 'react'
import type { DiagramKey } from '@/content/lessons'
import { useI18n } from '@/i18n'
import { Box, Label, Line, Packet, Svg } from './kit'
import { MotherboardDiagram } from './Motherboard'
import { Rj45Diagram } from './Rj45'
import { HomeNetworkPT, LanWanPT, PacketJourneyPT, TopologiesPT } from './network'

const useTr = () => {
  const { lang } = useI18n()
  return (en: string, fr: string) => (lang === 'fr' ? fr : en)
}

function Ipo() {
  const tr = useTr()
  return (
    <Svg viewBox="0 0 640 220" label={tr('Input, processing, storage and output', 'Entrée, traitement, stockage et sortie')}>
      <Box x={10} y={70} w={130} h={60} label={tr('Input', 'Entrée')} sub={tr('keyboard, network', 'clavier, réseau')} tone="blue" fill />
      <Box x={250} y={70} w={140} h={60} label={tr('Processing', 'Traitement')} sub="CPU" tone="cyan" fill />
      <Box x={500} y={70} w={130} h={60} label={tr('Output', 'Sortie')} sub={tr('screen, printer', 'écran, imprimante')} tone="purple" fill />
      <Box x={250} y={165} w={140} h={46} label={tr('Storage', 'Stockage')} sub="RAM · SSD" tone="success" fill />
      <Line d="M140 100 H245" arrow />
      <Line d="M390 100 H495" arrow />
      <Line d="M305 130 V160" arrow tone="success" />
      <Line d="M335 160 V135" arrow tone="success" />
      <Packet path="M140 100 H250 M390 100 H500" dur={2.2} />
      <Label x={320} y={40} tone="text" size={13} weight={600}>{tr('Every computer, from laptop to router', 'Tout ordinateur, du portable au routeur')}</Label>
    </Svg>
  )
}

function MemoryHierarchy() {
  const tr = useTr()
  const rows = [
    { l: tr('Registers', 'Registres'), s: '< 1 ns', w: 140, tone: 'danger' as const },
    { l: tr('CPU cache L1/L2/L3', 'Cache CPU L1/L2/L3'), s: '~1–10 ns', w: 240, tone: 'warning' as const },
    { l: 'RAM', s: '~80 ns', w: 340, tone: 'cyan' as const },
    { l: 'SSD NVMe', s: '~0.1 ms', w: 440, tone: 'blue' as const },
    { l: 'HDD', s: '~10 ms', w: 540, tone: 'purple' as const },
  ]
  return (
    <Svg viewBox="0 0 640 300" label={tr('Memory hierarchy from fastest to slowest', 'Hiérarchie mémoire du plus rapide au plus lent')}>
      {rows.map((r, i) => (
        <Box key={r.l} x={320 - r.w / 2} y={20 + i * 52} w={r.w} h={42} label={r.l} sub={r.s} tone={r.tone} fill rx={8} />
      ))}
      <Line d="M30 270 V30" arrow tone="danger" />
      <Label x={40} y={25} anchor="start" tone="danger">{tr('faster', 'plus rapide')}</Label>
      <Line d="M610 30 V270" arrow tone="purple" />
      <Label x={600} y={290} anchor="end" tone="purple">{tr('bigger & cheaper', 'plus grand & moins cher')}</Label>
    </Svg>
  )
}

function OsLayers() {
  const tr = useTr()
  const layers = [
    { l: tr('Applications', 'Applications'), s: 'Word · Chrome · Teams', tone: 'purple' as const },
    { l: tr('User interface', 'Interface'), s: 'GUI / shell', tone: 'blue' as const },
    { l: tr('Kernel', 'Noyau'), s: tr('processes · memory · files · network', 'processus · mémoire · fichiers · réseau'), tone: 'cyan' as const },
    { l: tr('Drivers', 'Pilotes'), s: tr('talk to each device', 'parlent à chaque périphérique'), tone: 'success' as const },
    { l: tr('Hardware', 'Matériel'), s: 'CPU · RAM · SSD · NIC', tone: 'muted' as const },
  ]
  return (
    <Svg viewBox="0 0 640 310" label={tr('Operating system layers', 'Couches d’un système d’exploitation')}>
      {layers.map((x, i) => (
        <Box key={x.l} x={80} y={10 + i * 58} w={480} h={48} label={x.l} sub={x.s} tone={x.tone} fill={i !== 4} rx={8} />
      ))}
      <Line d="M600 30 V280" arrow />
      <Line d="M40 280 V30" arrow tone="purple" />
      <Label x={612} y={160} anchor="start" size={10}>{tr('requests', 'requêtes')}</Label>
    </Svg>
  )
}

function BootSequence() {
  const tr = useTr()
  const steps = [
    { l: tr('Power', 'Courant'), s: 'PSU' },
    { l: 'UEFI', s: 'firmware' },
    { l: 'POST', s: tr('self-test', 'auto-test') },
    { l: tr('Boot device', 'Démarrage'), s: 'SSD / USB' },
    { l: tr('Bootloader', 'Chargeur'), s: 'GRUB / WBM' },
    { l: tr('Kernel', 'Noyau'), s: tr('drivers', 'pilotes') },
    { l: 'Login', s: tr('user', 'utilisateur') },
  ]
  return (
    <Svg viewBox="0 0 700 170" label={tr('Boot sequence', 'Séquence de démarrage')}>
      {steps.map((s, i) => (
        <Box key={s.l} x={8 + i * 98} y={50} w={84} h={58} label={s.l} sub={s.s} tone={i === 2 ? 'warning' : i === 6 ? 'success' : 'cyan'} fill size={12} />
      ))}
      {steps.slice(1).map((_, i) => (
        <Line key={i} d={`M${92 + i * 98} 79 H${104 + i * 98}`} arrow />
      ))}
      <Label x={302} y={135} tone="warning" size={10}>{tr('beeps here = hardware', 'bips ici = matériel')}</Label>
      <Label x={400} y={135} size={10}>{tr('"no boot device"', '« no boot device »')}</Label>
      <Packet path="M20 79 H680" dur={4} />
    </Svg>
  )
}

function FsTree() {
  const tr = useTr()
  return (
    <Svg viewBox="0 0 660 270" label={tr('Windows and Linux directory trees', 'Arborescences Windows et Linux')}>
      <Label x={150} y={20} tone="text" weight={700}>Windows</Label>
      <Box x={95} y={30} w={110} h={34} label="C:\" tone="cyan" fill />
      <Box x={10} y={110} w={90} h={30} label="Users" tone="blue" size={12} />
      <Box x={110} y={110} w={90} h={30} label="Windows" tone="blue" size={12} />
      <Box x={210} y={110} w={100} h={30} label="Program Files" tone="blue" size={11} />
      <Box x={10} y={180} w={90} h={30} label="sam" tone="purple" size={12} />
      <Box x={10} y={230} w={110} h={30} label="Documents" tone="success" size={12} />
      <Line d="M150 64 V90 H55 V110 M150 90 V110 M150 90 H260 V110" />
      <Line d="M55 140 V180 M55 210 V230" />
      <Label x={330} y={252} anchor="end" size={10} mono>C:\Users\sam\Documents</Label>

      <Label x={500} y={20} tone="text" weight={700}>Linux</Label>
      <Box x={455} y={30} w={90} h={34} label="/" tone="cyan" fill />
      <Box x={370} y={110} w={70} h={30} label="home" tone="blue" size={12} />
      <Box x={450} y={110} w={60} h={30} label="etc" tone="blue" size={12} />
      <Box x={520} y={110} w={60} h={30} label="var" tone="blue" size={12} />
      <Box x={590} y={110} w={60} h={30} label="usr" tone="blue" size={12} />
      <Box x={370} y={180} w={70} h={30} label="sam" tone="purple" size={12} />
      <Box x={520} y={180} w={60} h={30} label="log" tone="purple" size={12} />
      <Box x={360} y={230} w={110} h={30} label="documents" tone="success" size={12} />
      <Line d="M500 64 V90 H405 V110 M480 90 V110 M500 90 H550 V110 M550 90 H620 V110" />
      <Line d="M405 140 V180 M405 210 V230 M550 140 V180" />
      <Label x={650} y={252} anchor="end" size={10} mono>/home/sam/documents</Label>
    </Svg>
  )
}

function CommandAnatomy() {
  const tr = useTr()
  return (
    <Svg viewBox="0 0 640 190" label={tr('Anatomy of a command', 'Anatomie d’une commande')}>
      <Box x={20} y={50} w={600} h={56} label="" tone="muted" rx={10} />
      <Label x={45} y={86} anchor="start" size={22} tone="success" mono>$</Label>
      <Label x={75} y={86} anchor="start" size={22} tone="cyan" mono weight={700}>ping</Label>
      <Label x={160} y={86} anchor="start" size={22} tone="purple" mono weight={700}>-c 4</Label>
      <Label x={250} y={86} anchor="start" size={22} tone="warning" mono weight={700}>8.8.8.8</Label>
      <Line d="M105 106 V140" tone="cyan" />
      <Line d="M190 106 V140" tone="purple" />
      <Line d="M300 106 V140" tone="warning" />
      <Label x={105} y={160} tone="cyan" weight={600}>{tr('command', 'commande')}</Label>
      <Label x={190} y={160} tone="purple" weight={600}>{tr('option + value', 'option + valeur')}</Label>
      <Label x={300} y={160} tone="warning" weight={600}>{tr('argument (target)', 'argument (cible)')}</Label>
      <Label x={58} y={35} tone="success" size={11}>prompt</Label>
    </Svg>
  )
}

function Ipv4Anatomy() {
  const tr = useTr()
  const octets = ['192', '168', '1', '25']
  const bin = ['11000000', '10101000', '00000001', '00011001']
  return (
    <Svg viewBox="0 0 640 260" label={tr('Anatomy of an IPv4 address', 'Anatomie d’une adresse IPv4')}>
      {octets.map((o, i) => (
        <g key={i}>
          <Box x={20 + i * 155} y={30} w={135} h={56} label={o} sub={bin[i]} tone={i < 3 ? 'cyan' : 'purple'} fill size={22} />
          {i < 3 && <Label x={163 + i * 155} y={66} size={24} tone="text" weight={700}>.</Label>}
        </g>
      ))}
      <Line d="M20 106 H450" tone="cyan" width={3} />
      <Line d="M485 106 H620" tone="purple" width={3} />
      <Label x={250} y={130} tone="cyan" weight={700}>{tr('Network part — 24 bits', 'Partie réseau — 24 bits')}</Label>
      <Label x={555} y={130} tone="purple" weight={700}>{tr('Host', 'Hôte')}</Label>
      {['255', '255', '255', '0'].map((m, i) => (
        <Box key={i} x={20 + i * 155} y={160} w={135} h={40} label={m} tone={i < 3 ? 'cyan' : 'purple'} size={16} />
      ))}
      <Label x={320} y={230} size={12} mono>{tr('mask 255.255.255.0 = /24 → 254 usable hosts', 'masque 255.255.255.0 = /24 → 254 hôtes utilisables')}</Label>
    </Svg>
  )
}

function MacAnatomy() {
  const tr = useTr()
  const parts = ['3C', '52', '82', '1A', '9F', '04']
  return (
    <Svg viewBox="0 0 640 200" label={tr('Anatomy of a MAC address', 'Anatomie d’une adresse MAC')}>
      {parts.map((p, i) => (
        <g key={i}>
          <Box x={20 + i * 102} y={40} w={84} h={56} label={p} tone={i < 3 ? 'warning' : 'success'} fill size={22} />
          {i < 5 && <Label x={112 + i * 102} y={74} tone="text" size={20} weight={700}>:</Label>}
        </g>
      ))}
      <Line d="M20 116 H308" tone="warning" width={3} />
      <Line d="M326 116 H614" tone="success" width={3} />
      <Label x={164} y={142} tone="warning" weight={700}>OUI — {tr('manufacturer (24 bits)', 'fabricant (24 bits)')}</Label>
      <Label x={470} y={142} tone="success" weight={700}>{tr('Card identifier (24 bits)', 'Identifiant de la carte (24 bits)')}</Label>
      <Label x={320} y={180} size={11} mono>{tr('48 bits · 12 hex digits · burned in at the factory', '48 bits · 12 chiffres hexa · gravée en usine')}</Label>
    </Svg>
  )
}

export const DIAGRAMS: Record<DiagramKey, ComponentType> = {
  ipo: Ipo,
  motherboard: MotherboardDiagram,
  'memory-hierarchy': MemoryHierarchy,
  'os-layers': OsLayers,
  'boot-sequence': BootSequence,
  'fs-tree': FsTree,
  'command-anatomy': CommandAnatomy,
  'lan-wan': LanWanPT,
  topologies: TopologiesPT,
  'rj45-pinout': Rj45Diagram,
  'ipv4-anatomy': Ipv4Anatomy,
  'mac-anatomy': MacAnatomy,
  'home-network': HomeNetworkPT,
  'packet-journey': PacketJourneyPT,
}
