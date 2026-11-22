import type { ComponentType } from 'react'
import type { DiagramKey } from '@/content/lessons'
import { useI18n } from '@/i18n'
import { Box, Label, Line, Packet, Svg } from './kit'

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

function Motherboard() {
  const tr = useTr()
  return (
    <Svg viewBox="0 0 640 330" label={tr('Simplified motherboard layout', 'Schéma simplifié de carte mère')}>
      <Box x={20} y={20} w={600} h={290} label="" tone="muted" rx={16} />
      <Label x={40} y={45} anchor="start" size={11} mono>MOTHERBOARD</Label>
      <Box x={60} y={70} w={120} h={100} label="CPU" sub="socket" tone="cyan" fill />
      <Box x={210} y={70} w={36} h={150} label="" tone="blue" fill rx={4} />
      <Box x={256} y={70} w={36} h={150} label="" tone="blue" fill rx={4} />
      <Label x={251} y={240} tone="blue">RAM</Label>
      <Box x={330} y={70} w={260} h={34} label={tr('PCIe x16 — graphics card', 'PCIe x16 — carte graphique')} tone="purple" fill rx={6} size={12} />
      <Box x={330} y={118} w={260} h={28} label={tr('PCIe x1 — network card', 'PCIe x1 — carte réseau')} tone="purple" rx={6} size={11} />
      <Box x={330} y={160} w={140} h={30} label="M.2 NVMe" tone="success" fill rx={6} size={12} />
      <Box x={490} y={160} w={100} h={30} label="SATA" tone="success" rx={6} size={12} />
      <Box x={60} y={200} w={120} h={60} label="Chipset" tone="warning" fill />
      <Box x={330} y={220} w={150} h={50} label={tr('Power (24-pin)', 'Alimentation (24 br.)')} sub="← PSU" tone="danger" />
      <Box x={500} y={220} w={90} h={50} label="I/O" sub="USB · RJ45" tone="muted" />
      <Line d="M180 120 H205" tone="blue" />
      <Line d="M120 170 V195" tone="warning" />
      <Line d="M180 230 H325" tone="warning" dashed />
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

function LanWan() {
  const tr = useTr()
  return (
    <Svg viewBox="0 0 660 260" label={tr('Two LANs joined by a WAN', 'Deux LAN reliés par un WAN')}>
      <Box x={10} y={20} w={220} h={220} label="" tone="cyan" rx={18} />
      <Label x={120} y={42} tone="cyan" weight={700}>LAN · Paris</Label>
      <Box x={70} y={60} w={100} h={36} label="Router" tone="cyan" fill size={12} />
      <Box x={70} y={120} w={100} h={34} label="Switch" tone="blue" size={12} />
      <Box x={20} y={185} w={60} h={34} label="PC" tone="muted" size={11} />
      <Box x={90} y={185} w={60} h={34} label="PC" tone="muted" size={11} />
      <Box x={160} y={185} w={60} h={34} label="Srv" tone="muted" size={11} />
      <Line d="M120 96 V120 M120 154 V170 H50 V185 M120 170 V185 M120 170 H190 V185" />

      <Box x={430} y={20} w={220} h={220} label="" tone="purple" rx={18} />
      <Label x={540} y={42} tone="purple" weight={700}>LAN · Lyon</Label>
      <Box x={490} y={60} w={100} h={36} label="Router" tone="purple" fill size={12} />
      <Box x={490} y={120} w={100} h={34} label="Switch" tone="blue" size={12} />
      <Box x={445} y={185} w={60} h={34} label="PC" tone="muted" size={11} />
      <Box x={515} y={185} w={60} h={34} label="PC" tone="muted" size={11} />
      <Box x={585} y={185} w={55} h={34} label="AP" tone="muted" size={11} />
      <Line d="M540 96 V120 M540 154 V170 H475 V185 M540 170 V185 M540 170 H612 V185" tone="purple" />

      <Box x={270} y={60} w={120} h={46} label="Internet" sub="WAN" tone="warning" fill />
      <Line d="M170 78 H270" dashed tone="warning" />
      <Line d="M390 78 H490" dashed tone="warning" />
      <Packet path="M170 78 H490" dur={3} tone="warning" />
    </Svg>
  )
}

function Topologies() {
  const tr = useTr()
  const node = (x: number, y: number, k: string) => <Box key={k} x={x - 10} y={y - 10} w={20} h={20} label="" tone="cyan" fill rx={10} />
  return (
    <Svg viewBox="0 0 680 220" label={tr('Star, bus, ring and mesh topologies', 'Topologies étoile, bus, anneau et maillée')}>
      {/* star */}
      <Line d="M85 100 L35 55 M85 100 L135 55 M85 100 L35 145 M85 100 L135 145" />
      <Box x={70} y={86} w={30} h={28} label="SW" tone="blue" fill rx={6} size={10} />
      {[[35, 55], [135, 55], [35, 145], [135, 145]].map(([x, y], i) => node(x, y, `s${i}`))}
      <Label x={85} y={200} tone="text" weight={600}>{tr('Star', 'Étoile')}</Label>
      {/* bus */}
      <Line d="M190 100 H330" width={3} />
      {[205, 245, 285, 320].map((x, i) => (
        <g key={i}>
          <Line d={`M${x} 100 V${i % 2 ? 140 : 60}`} />
          {node(x, i % 2 ? 150 : 50, `b${i}`)}
        </g>
      ))}
      <Label x={260} y={200} tone="text" weight={600}>Bus</Label>
      {/* ring */}
      <Line d="M435 45 L485 75 L485 125 L435 155 L385 125 L385 75 Z" />
      {[[435, 45], [485, 75], [485, 125], [435, 155], [385, 125], [385, 75]].map(([x, y], i) => node(x, y, `r${i}`))}
      <Label x={435} y={200} tone="text" weight={600}>{tr('Ring', 'Anneau')}</Label>
      {/* mesh */}
      <Line d="M560 50 L650 50 L650 150 L560 150 Z M560 50 L650 150 M650 50 L560 150" />
      {[[560, 50], [650, 50], [650, 150], [560, 150]].map(([x, y], i) => node(x, y, `m${i}`))}
      <Label x={605} y={200} tone="text" weight={600}>{tr('Mesh', 'Maillée')}</Label>
    </Svg>
  )
}

function Rj45Pinout() {
  const tr = useTr()
  const b = [
    ['#ffffff', '#f97316'], ['#f97316', '#f97316'], ['#ffffff', '#22c55e'], ['#3b82f6', '#3b82f6'],
    ['#ffffff', '#3b82f6'], ['#22c55e', '#22c55e'], ['#ffffff', '#92400e'], ['#92400e', '#92400e'],
  ]
  const names = [tr('white-orange', 'blanc-orange'), 'orange', tr('white-green', 'blanc-vert'), tr('blue', 'bleu'), tr('white-blue', 'blanc-bleu'), tr('green', 'vert'), tr('white-brown', 'blanc-marron'), tr('brown', 'marron')]
  return (
    <Svg viewBox="0 0 640 300" label={tr('RJ45 T568B pinout', 'Brochage RJ45 T568B')}>
      <Box x={170} y={20} w={300} h={150} label="" tone="muted" rx={14} />
      <Label x={320} y={190} tone="text" weight={700}>T568B</Label>
      {b.map(([base, stripe], i) => {
        const x = 195 + i * 32
        return (
          <g key={i}>
            <rect x={x} y={40} width={18} height={110} rx={3} fill={base} stroke="var(--line-strong)" />
            {base !== stripe && <rect x={x + 6} y={40} width={6} height={110} fill={stripe} />}
            <Label x={x + 9} y={165} size={11} mono tone="text">{i + 1}</Label>
          </g>
        )
      })}
      {names.map((n, i) => (
        <Label key={n} x={i < 4 ? 20 : 620} y={220 + (i % 4) * 19} anchor={i < 4 ? 'start' : 'end'} size={11}>
          {`${i + 1} · ${n}`}
        </Label>
      ))}
      <Label x={320} y={290} size={10}>{tr('T568A swaps the orange and green pairs', 'T568A inverse les paires orange et verte')}</Label>
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

function HomeNetwork() {
  const tr = useTr()
  return (
    <Svg viewBox="0 0 680 280" label={tr('Small office network devices', 'Équipements d’un petit réseau')}>
      <Box x={10} y={110} w={90} h={50} label={tr('ISP', 'FAI')} sub={tr('Internet', 'Internet')} tone="warning" fill />
      <Box x={130} y={110} w={90} h={50} label="Modem" sub="ONT" tone="muted" />
      <Box x={250} y={110} w={100} h={50} label={tr('Router', 'Routeur')} sub="NAT · DHCP" tone="cyan" fill />
      <Box x={380} y={110} w={100} h={50} label={tr('Firewall', 'Pare-feu')} sub={tr('rules', 'règles')} tone="danger" />
      <Box x={510} y={110} w={100} h={50} label={tr('Switch', 'Commutateur')} sub="MAC" tone="blue" fill />
      <Box x={470} y={220} w={60} h={40} label="PC" tone="muted" size={12} />
      <Box x={540} y={220} w={60} h={40} label="PC" tone="muted" size={12} />
      <Box x={610} y={220} w={60} h={40} label={tr('Printer', 'Impr.')} tone="muted" size={11} />
      <Box x={530} y={20} w={110} h={44} label={tr('Access point', 'Borne Wi-Fi')} sub="802.11" tone="purple" />
      <Line d="M100 135 H130 M220 135 H250 M350 135 H380 M480 135 H510" />
      <Line d="M560 160 V190 H500 V220 M560 190 H570 V220 M560 190 H640 V220" tone="blue" />
      <Line d="M585 110 V64" tone="purple" />
      <Packet path="M100 135 H560 V220" dur={3.2} />
      <Label x={300} y={95} size={10} tone="cyan">{tr('default gateway', 'passerelle par défaut')}</Label>
      <Box x={120} y={190} w={330} h={70} label="" tone="muted" rx={12} />
      <Label x={285} y={215} size={11} tone="text" weight={600}>{tr('Home "box" = modem + router + firewall', 'Box = modem + routeur + pare-feu')}</Label>
      <Label x={285} y={240} size={11} tone="text" weight={600}>{tr('+ switch + Wi-Fi in one case', '+ commutateur + Wi-Fi en un boîtier')}</Label>
    </Svg>
  )
}

function PacketJourney() {
  const tr = useTr()
  const steps = [
    { l: 'DHCP', s: tr('get IP', 'obtenir IP'), tone: 'success' as const },
    { l: 'DNS', s: tr('name → IP', 'nom → IP'), tone: 'warning' as const },
    { l: 'ARP', s: tr('gateway MAC', 'MAC passerelle'), tone: 'blue' as const },
    { l: 'Switch', s: tr('forward frame', 'relaie la trame'), tone: 'blue' as const },
    { l: 'Router', s: 'NAT', tone: 'cyan' as const },
    { l: 'Internet', s: tr('hops', 'sauts'), tone: 'purple' as const },
    { l: tr('Web server', 'Serveur web'), s: tr('reply', 'réponse'), tone: 'success' as const },
  ]
  return (
    <Svg viewBox="0 0 700 190" label={tr('Journey of a web request', 'Parcours d’une requête web')}>
      <Box x={6} y={66} w={62} h={50} label="PC" sub="192.168.1.10" tone="muted" size={13} />
      {steps.map((s, i) => (
        <g key={s.l}>
          <Box x={84 + i * 88} y={66} w={78} h={50} label={s.l} sub={s.s} tone={s.tone} fill size={12} />
          <Label x={123 + i * 88} y={50} size={11} mono tone={s.tone}>{i + 1}</Label>
        </g>
      ))}
      <Line d="M68 91 H84" arrow />
      {steps.slice(1).map((_, i) => (
        <Line key={i} d={`M${162 + i * 88} 91 H${172 + i * 88}`} arrow />
      ))}
      <Line d="M650 128 C 560 175, 150 175, 37 120" tone="success" dashed arrow />
      <Label x={350} y={182} size={10} tone="success">{tr('response returns the same way', 'la réponse revient par le même chemin')}</Label>
      <Packet path="M37 91 H690" dur={4.5} />
    </Svg>
  )
}

export const DIAGRAMS: Record<DiagramKey, ComponentType> = {
  ipo: Ipo,
  motherboard: Motherboard,
  'memory-hierarchy': MemoryHierarchy,
  'os-layers': OsLayers,
  'boot-sequence': BootSequence,
  'fs-tree': FsTree,
  'command-anatomy': CommandAnatomy,
  'lan-wan': LanWan,
  topologies: Topologies,
  'rj45-pinout': Rj45Pinout,
  'ipv4-anatomy': Ipv4Anatomy,
  'mac-anatomy': MacAnatomy,
  'home-network': HomeNetwork,
  'packet-journey': PacketJourney,
}
