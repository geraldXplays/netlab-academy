import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

type PartId = 'cpu' | 'ram' | 'pcie16' | 'pcie1' | 'm2' | 'sata' | 'atx' | 'eps' | 'chipset' | 'cmos' | 'io' | 'vrm'

const PARTS: Record<PartId, { n: number; en: [string, string, string]; fr: [string, string, string] }> = {
  cpu: { n: 1, en: ['CPU in its LGA socket', 'The processor sits in an LGA socket: hundreds of spring pins touch the gold pads under the CPU. The metal loading plate and lever clamp it down. What you see on top is the heat spreader (IHS) — the silicon die is underneath.', 'Bent socket pins → no boot or missing RAM channels.'], fr: ['CPU dans son socket LGA', 'Le processeur repose dans un socket LGA : des centaines de broches à ressort touchent les pastilles dorées sous le CPU. La plaque métallique et le levier le maintiennent. Ce que l’on voit dessus est le dissipateur intégré (IHS) — la puce de silicium est dessous.', 'Broches du socket tordues → pas de démarrage ou canaux RAM manquants.'] },
  vrm: { n: 2, en: ['VRM + heatsinks', 'Voltage regulators (chokes + MOSFETs) convert 12 V into the ~1.2 V the CPU needs, hundreds of amps. The finned heatsinks keep them cool.', 'Overheating VRMs → throttling and crashes under load.'], fr: ['VRM + dissipateurs', 'Les régulateurs (selfs + MOSFET) convertissent le 12 V en ~1,2 V pour le CPU, sous des centaines d’ampères. Les dissipateurs à ailettes les refroidissent.', 'VRM en surchauffe → ralentissements et plantages en charge.'] },
  ram: { n: 3, en: ['DIMM slots (RAM)', 'Four DDR5 slots; two modules installed in A2 and B2 — the recommended dual-channel pair. Latches at the ends lock each module.', 'Badly seated RAM → beeps or a debug LED at POST, no display.'], fr: ['Slots DIMM (RAM)', 'Quatre slots DDR5 ; deux barrettes installées en A2 et B2 — la paire dual-channel recommandée. Des loquets verrouillent chaque barrette.', 'RAM mal insérée → bips ou voyant de diagnostic au POST, pas d’affichage.'] },
  eps: { n: 4, en: ['CPU power (8-pin EPS)', 'Dedicated 12 V feed from the PSU to the CPU regulators.', 'Unplugged → fans spin but the PC never POSTs.'], fr: ['Alim. CPU (8 broches EPS)', 'Alimentation 12 V dédiée du bloc vers les régulateurs CPU.', 'Débranchée → les ventilateurs tournent mais pas de POST.'] },
  atx: { n: 5, en: ['24-pin ATX power', 'Main power connector from the PSU for the whole board. Square and rounded pin holes make it impossible to plug in the wrong way.', 'Loose connector → random shutdowns or no power.'], fr: ['Alimentation ATX 24 broches', 'Connecteur principal de la carte. Les trous carrés et arrondis empêchent de le brancher à l’envers.', 'Connecteur mal enfoncé → arrêts aléatoires ou pas de courant.'] },
  pcie16: { n: 6, en: ['PCIe x16 slot', 'Full-length high-speed slot for the graphics card, wired directly to the CPU. The steel shield stops heavy cards from tearing it.', 'Card not detected → reseat, check PCIe power cables.'], fr: ['Slot PCIe x16', 'Slot pleine longueur relié directement au CPU, pour la carte graphique. Le renfort en acier évite qu’une carte lourde l’arrache.', 'Carte non détectée → réinsérer, vérifier l’alim. PCIe.'] },
  pcie1: { n: 7, en: ['PCIe x1 slot', 'Short slot for add-in cards: an extra network card, Wi-Fi, a capture card.', 'A second NIC here can connect a server to two networks.'], fr: ['Slot PCIe x1', 'Slot court pour cartes d’extension : carte réseau, Wi-Fi, carte d’acquisition.', 'Une 2e carte réseau ici relie un serveur à deux réseaux.'] },
  m2: { n: 8, en: ['M.2 slot with NVMe SSD', 'A gum-stick SSD screwed to the board: controller chip + NAND flash, talking PCIe — the fastest storage in a PC.', 'Not detected → check the screw/standoff and the slot mode in UEFI.'], fr: ['Slot M.2 avec SSD NVMe', 'Un SSD en barrette vissé à la carte : contrôleur + mémoire flash NAND, en PCIe — le stockage le plus rapide d’un PC.', 'Non détecté → vérifier la vis/entretoise et le mode du slot dans l’UEFI.'] },
  chipset: { n: 9, en: ['Chipset (under heatsink)', 'Controls USB, SATA, extra PCIe lanes and links them to the CPU.', 'Chipset failure → many devices disappear at once.'], fr: ['Chipset (sous dissipateur)', 'Gère USB, SATA, lignes PCIe supplémentaires et les relie au CPU.', 'Panne chipset → plusieurs périphériques disparaissent d’un coup.'] },
  sata: { n: 10, en: ['SATA ports', 'Right-angle connectors for 2.5"/3.5" drives and optical drives.', 'Disk missing → swap SATA cable/port.'], fr: ['Ports SATA', 'Connecteurs coudés pour disques 2,5"/3,5" et lecteurs optiques.', 'Disque absent → changer de câble/port SATA.'] },
  cmos: { n: 11, en: ['CMOS battery (CR2032)', 'A coin cell that keeps the clock and UEFI settings when the PC is unplugged.', 'Clock resets at every boot → replace the coin cell.'], fr: ['Pile CMOS (CR2032)', 'Une pile bouton qui conserve l’horloge et les réglages UEFI quand le PC est débranché.', 'Horloge réinitialisée à chaque démarrage → changer la pile.'] },
  io: { n: 12, en: ['Rear I/O panel', 'USB-A/USB-C, RJ45 network (with link/activity LEDs), HDMI/DisplayPort and audio jacks, reachable from the back of the case.', 'No link light on RJ45 → cable or switch port, not Windows.'], fr: ['Panneau E/S arrière', 'USB-A/USB-C, réseau RJ45 (voyants lien/activité), HDMI/DisplayPort et jacks audio, accessibles à l’arrière.', 'Pas de voyant sur le RJ45 → câble ou port du commutateur, pas Windows.'] },
}

function Part({ id, active, setActive, children, bx, by }: { id: PartId; active: PartId | null; setActive: (p: PartId) => void; children: ReactNode; bx: number; by: number }) {
  const on = active === id
  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={PARTS[id].en[0]}
      onClick={() => setActive(id)}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setActive(id)}
      className="cursor-pointer outline-none [&:focus-visible_.hl]:opacity-100 [&:hover_.hl]:opacity-100"
    >
      <g className="hl" opacity={on ? 1 : 0} style={{ transition: 'opacity .25s' }} filter="url(#mb-glow)">
        {children}
      </g>
      {children}
      <g transform={`translate(${bx} ${by})`}>
        <circle r="10" fill={on ? 'var(--cyan)' : '#0b1220'} stroke="var(--cyan)" strokeWidth="1.5" />
        <text y="3.6" textAnchor="middle" fontSize="10" fontWeight="700" fill={on ? '#03060d' : 'var(--cyan)'}>{PARTS[id].n}</text>
      </g>
    </g>
  )
}

const silk = { fill: '#d6dde6', fontSize: 6.5, fontFamily: "'JetBrains Mono Variable', monospace", letterSpacing: 0.4, opacity: 0.75 } as const

/** Small electrolytic capacitor seen from above. */
const Cap = ({ x, y, r = 4.2, gold = false }: { x: number; y: number; r?: number; gold?: boolean }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={gold ? 'url(#mb-gold-cap)' : 'url(#mb-cap)'} stroke="#0a0a0a" strokeWidth="0.6" />
    <path d={`M${x - r * 0.55} ${y} H${x + r * 0.55} M${x} ${y - r * 0.55} V${y + r * 0.55}`} stroke="#0f172a" strokeWidth="0.7" opacity="0.6" />
  </g>
)
/** SMD resistor/cap pair */
const Smd = ({ x, y, v = false }: { x: number; y: number; v?: boolean }) => <rect x={x} y={y} width={v ? 2 : 4} height={v ? 4 : 2} fill="#b98d4a" stroke="#3a2a10" strokeWidth="0.3" />

export function MotherboardDiagram() {
  const { lang } = useI18n()
  const reduced = useReducedMotionPref()
  const [active, setActive] = useState<PartId | null>('cpu')
  const info = active ? PARTS[active][lang] : null

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
      <motion.svg
        viewBox="0 0 680 520"
        className="h-auto w-full"
        role="img"
        aria-label={lang === 'fr' ? 'Carte mère interactive' : 'Interactive motherboard'}
        initial={reduced ? false : { opacity: 0, rotateX: 25, y: 30 }}
        whileInView={{ opacity: 1, rotateX: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        style={{ transformPerspective: 1000, fontFamily: 'var(--id-font-body)' }}
      >
        <defs>
          <filter id="mb-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="d" />
            <feFlood style={{ floodColor: 'var(--cyan)' }} />
            <feComposite in2="d" operator="in" />
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="mb-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="2.5" dy="3.5" stdDeviation="2.2" floodColor="#000" floodOpacity="0.55" />
          </filter>
          <filter id="mb-brush" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9 0.015" numOctaves="2" seed="4" result="n" />
            <feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.18 0" result="g" />
            <feComposite in="g" in2="SourceGraphic" operator="in" result="gm" />
            <feMerge><feMergeNode in="SourceGraphic" /><feMergeNode in="gm" /></feMerge>
          </filter>
          <linearGradient id="mb-pcb" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#1b1f24" />
            <stop offset="0.55" stopColor="#14171b" />
            <stop offset="1" stopColor="#0e1013" />
          </linearGradient>
          <pattern id="mb-traces" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M0 6 H14 L20 12 H36 M0 22 H8 L14 28 H36 M24 0 V5 M30 36 V30" fill="none" stroke="#262b31" strokeWidth="0.8" />
            <circle cx="20" cy="12" r="0.9" fill="#3a3f46" />
            <circle cx="14" cy="28" r="0.9" fill="#3a3f46" />
          </pattern>
          <linearGradient id="mb-ihs" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#f4f6f8" />
            <stop offset="0.35" stopColor="#c9cfd6" />
            <stop offset="0.6" stopColor="#e9edf1" />
            <stop offset="1" stopColor="#9aa3ad" />
          </linearGradient>
          <radialGradient id="mb-ihs-sheen" cx="0.3" cy="0.25" r="0.9">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="mb-steel" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#e4e8ec" />
            <stop offset="0.5" stopColor="#a8b0b9" />
            <stop offset="1" stopColor="#d3d8de" />
          </linearGradient>
          <linearGradient id="mb-sink" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#5a6069" />
            <stop offset="0.5" stopColor="#2a2e34" />
            <stop offset="1" stopColor="#40454d" />
          </linearGradient>
          <linearGradient id="mb-fin" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#7b828c" />
            <stop offset="0.5" stopColor="#c3c9d0" />
            <stop offset="1" stopColor="#5d636c" />
          </linearGradient>
          <linearGradient id="mb-ram" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#202329" />
            <stop offset="0.45" stopColor="#3a3f47" />
            <stop offset="1" stopColor="#15171b" />
          </linearGradient>
          <linearGradient id="mb-rgb" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#22d3ee" />
            <stop offset="0.5" stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
          <radialGradient id="mb-cap" cx="0.35" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#c5cbd3" />
            <stop offset="1" stopColor="#5b626c" />
          </radialGradient>
          <radialGradient id="mb-gold-cap" cx="0.35" cy="0.35" r="0.8">
            <stop offset="0" stopColor="#fde68a" />
            <stop offset="1" stopColor="#a16207" />
          </radialGradient>
          <radialGradient id="mb-coin" cx="0.38" cy="0.32" r="0.85">
            <stop offset="0" stopColor="#f8fafc" />
            <stop offset="0.55" stopColor="#b8c0c9" />
            <stop offset="1" stopColor="#6b7480" />
          </radialGradient>
          <linearGradient id="mb-gold" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#b8862b" />
            <stop offset="0.5" stopColor="#f5d27a" />
            <stop offset="1" stopColor="#a4741f" />
          </linearGradient>
          <linearGradient id="mb-shroud" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#30343a" />
            <stop offset="0.6" stopColor="#1d2025" />
            <stop offset="1" stopColor="#2b2f35" />
          </linearGradient>
        </defs>

        {/* ---------- PCB ---------- */}
        <rect x="8" y="8" width="664" height="504" rx="10" fill="url(#mb-pcb)" />
        <rect x="8" y="8" width="664" height="504" rx="10" fill="url(#mb-traces)" opacity="0.9" />
        <rect x="8" y="8" width="664" height="504" rx="10" fill="none" stroke="#050608" strokeWidth="3" />
        {[[26, 26], [654, 26], [26, 494], [654, 494], [360, 26], [360, 494], [654, 280]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="8.5" fill="url(#mb-gold)" />
            <circle cx={x} cy={y} r="4.8" fill="#050608" />
          </g>
        ))}
        <text x="600" y="500" {...silk} fontSize="9" opacity="0.5">NETLAB Z890-PRO</text>
        {/* scattered SMD parts and caps for realism */}
        {Array.from({ length: 26 }, (_, i) => <Smd key={i} x={190 + ((i * 37) % 160)} y={268 + ((i * 53) % 40)} v={i % 3 === 0} />)}
        {Array.from({ length: 14 }, (_, i) => <Smd key={`b${i}`} x={420 + ((i * 29) % 90)} y={380 + ((i * 41) % 60)} v={i % 2 === 0} />)}
        {[[150, 300], [160, 300], [150, 312]].map(([x, y], i) => <Cap key={i} x={x} y={y} />)}
        {/* audio section with gold caps */}
        <path d="M70 330 L70 500" stroke="#c9a227" strokeWidth="0.8" strokeDasharray="3 3" opacity="0.5" />
        {[[40, 350], [52, 350], [40, 364], [52, 364], [46, 380]].map(([x, y], i) => <Cap key={`g${i}`} x={x} y={y} r={4.6} gold />)}
        <rect x="34" y="396" width="26" height="26" rx="2" fill="#0b0d10" stroke="#3a3f46" />
        <text x="47" y="412" textAnchor="middle" {...silk} fontSize="4.5">ALC4080</text>
        {/* front panel + fan headers */}
        <g>
          <rect x="560" y="470" width="44" height="16" rx="1" fill="#101215" stroke="#2c3036" />
          {Array.from({ length: 10 }, (_, i) => <rect key={i} x={563 + (i % 5) * 8} y={473 + Math.floor(i / 5) * 6} width="3" height="3" fill="url(#mb-gold)" />)}
          <text x="562" y="465" {...silk}>F_PANEL</text>
          <rect x="300" y="30" width="22" height="9" rx="1" fill="#f1f1ee" stroke="#9ca3af" strokeWidth="0.6" />
          <text x="300" y="50" {...silk}>CPU_FAN</text>
          <rect x="630" y="200" width="9" height="22" rx="1" fill="#f1f1ee" stroke="#9ca3af" strokeWidth="0.6" />
          <rect x="560" y="80" width="14" height="10" rx="1" fill="#0b0d10" stroke="#3a3f46" />
          <text x="550" y="100" {...silk} fontSize="4.5">BIOS</text>
        </g>

        {/* ---------- Rear I/O ---------- */}
        <Part id="io" active={active} setActive={setActive} bx={30} by={44}>
          <g filter="url(#mb-shadow)">
            <path d="M14 52 H86 L96 64 V276 L86 288 H14 Z" fill="url(#mb-shroud)" stroke="#0b0c0e" />
            <path d="M24 70 L80 70" stroke="#4b5059" strokeWidth="0.6" />
            <text x="22" y="282" {...silk} fontSize="5">ROG-STYLE I/O ARMOR</text>
          </g>
          {/* stacked USB-A */}
          {[78, 108].map((y) => (
            <g key={y}>
              <rect x="20" y={y} width="34" height="24" rx="1.5" fill="url(#mb-steel)" stroke="#2d3238" strokeWidth="0.6" />
              <rect x="23" y={y + 3} width="28" height="8" fill="#0e1116" />
              <rect x="25" y={y + 5} width="24" height="3" fill="#2563eb" />
              <rect x="23" y={y + 13} width="28" height="8" fill="#0e1116" />
              <rect x="25" y={y + 15} width="24" height="3" fill="#2563eb" />
            </g>
          ))}
          {/* USB-C */}
          <rect x="58" y="82" width="12" height="18" rx="5" fill="url(#mb-steel)" stroke="#2d3238" strokeWidth="0.6" />
          <rect x="62" y="86" width="4" height="10" rx="2" fill="#0e1116" />
          {/* RJ45 with LEDs */}
          <rect x="18" y="142" width="40" height="32" rx="2" fill="url(#mb-steel)" stroke="#2d3238" strokeWidth="0.6" />
          <path d="M23 147 H53 V165 H44 V170 H32 V165 H23 Z" fill="#0b0d10" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={26 + i * 3.2} y="148" width="1.4" height="5" fill="url(#mb-gold)" />)}
          <rect x="20" y="143" width="6" height="3" fill="#22c55e">{!reduced && <animate attributeName="opacity" values="1;0.2;1" dur="0.9s" repeatCount="indefinite" />}</rect>
          <rect x="50" y="143" width="6" height="3" fill="#f59e0b" />
          <text x="62" y="160" {...silk} fontSize="4.5">2.5G</text>
          {/* HDMI + DP */}
          <path d="M20 186 H56 V196 L51 201 H25 L20 196 Z" fill="url(#mb-steel)" stroke="#2d3238" strokeWidth="0.6" />
          <path d="M24 189 H52 V194 L49 197 H27 L24 194 Z" fill="#0b0d10" />
          <path d="M20 208 H56 V220 H25 L20 215 Z" fill="url(#mb-steel)" stroke="#2d3238" strokeWidth="0.6" />
          <path d="M24 211 H52 V217 H27 L24 214 Z" fill="#0b0d10" />
          {/* audio jacks */}
          {[['#22c55e', 236], ['#3b82f6', 250], ['#ec4899', 264]].map(([c, y]) => (
            <g key={y}>
              <circle cx="32" cy={y as number} r="6" fill="#0b0d10" stroke={c as string} strokeWidth="2.2" />
              <circle cx="32" cy={y as number} r="2" fill="#000" />
            </g>
          ))}
          <rect x="50" y="232" width="20" height="38" rx="2" fill="#0e1116" stroke="#2d3238" />
          <text x="60" y="254" textAnchor="middle" {...silk} fontSize="4" transform="rotate(-90 60 252)">OPTICAL</text>
        </Part>

        {/* ---------- VRM ---------- */}
        <Part id="vrm" active={active} setActive={setActive} bx={112} by={60}>
          {/* chokes */}
          {Array.from({ length: 6 }, (_, i) => (
            <g key={`ck${i}`}>
              <rect x="152" y={92 + i * 22} width="14" height="14" rx="1.5" fill="#4b5058" stroke="#22252a" />
              <text x="159" y={101 + i * 22} textAnchor="middle" fontSize="4" fill="#c9cdd2">R22</text>
            </g>
          ))}
          {Array.from({ length: 8 }, (_, i) => (
            <g key={`ct${i}`}>
              <rect x={200 + i * 18} y="70" width="14" height="14" rx="1.5" fill="#4b5058" stroke="#22252a" />
              <text x={207 + i * 18} y="79" textAnchor="middle" fontSize="4" fill="#c9cdd2">R22</text>
            </g>
          ))}
          {/* left heatsink */}
          <g filter="url(#mb-shadow)">
            <rect x="104" y="72" width="42" height="170" rx="4" fill="url(#mb-sink)" />
            {Array.from({ length: 13 }, (_, i) => <rect key={i} x="108" y={78 + i * 12.5} width="34" height="7" rx="1" fill="url(#mb-fin)" />)}
          </g>
          {/* top heatsink */}
          <g filter="url(#mb-shadow)">
            <rect x="190" y="34" width="160" height="32" rx="4" fill="url(#mb-sink)" />
            {Array.from({ length: 13 }, (_, i) => <rect key={i} x={194 + i * 12} y="38" width="7" height="24" rx="1" fill="url(#mb-fin)" />)}
          </g>
        </Part>

        {/* ---------- EPS 8-pin ---------- */}
        <Part id="eps" active={active} setActive={setActive} bx={366} by={30}>
          <g filter="url(#mb-shadow)">
            <rect x="374" y="22" width="46" height="26" rx="2" fill="#1b1d20" stroke="#000" />
            {Array.from({ length: 8 }, (_, i) => <rect key={i} x={378 + (i % 4) * 10.5} y={26 + Math.floor(i / 4) * 10.5} width="8" height="8" rx={i % 2 ? 3 : 0.5} fill="#000" stroke="#3b3f45" strokeWidth="0.5" />)}
          </g>
          <text x="374" y="58" {...silk}>EATX12V</text>
        </Part>

        {/* ---------- CPU socket + CPU ---------- */}
        <Part id="cpu" active={active} setActive={setActive} bx={184} by={90}>
          <g filter="url(#mb-shadow)">
            {/* socket body */}
            <rect x="182" y="96" width="152" height="164" rx="4" fill="#0f1012" />
            {/* loading plate (steel frame) */}
            <path d="M188 102 H328 V254 H188 Z M206 118 V238 H310 V118 Z" fill="url(#mb-steel)" fillRule="evenodd" stroke="#6b7480" strokeWidth="0.8" />
            {/* screws */}
            {[[194, 108], [322, 108], [194, 248], [322, 248]].map(([x, y], i) => (
              <g key={i}><circle cx={x} cy={y} r="3.2" fill="#9aa3ad" stroke="#4b5563" strokeWidth="0.5" /><path d={`M${x - 2} ${y} H${x + 2}`} stroke="#374151" strokeWidth="0.8" /></g>
            ))}
            {/* CPU substrate (green) visible around the IHS */}
            <rect x="210" y="122" width="96" height="112" rx="2" fill="#1f5137" />
            {Array.from({ length: 10 }, (_, i) => <rect key={i} x={213 + (i % 5) * 18} y={i < 5 ? 125 : 227} width="5" height="2.2" fill="#c08a3a" />)}
            {/* IHS */}
            <path d="M216 132 H226 V128 H290 V132 H300 V224 H290 V228 H226 V224 H216 Z" fill="url(#mb-ihs)" filter="url(#mb-brush)" stroke="#8b939c" strokeWidth="0.7" />
            <path d="M216 132 H226 V128 H290 V132 H300 V224 H290 V228 H226 V224 H216 Z" fill="url(#mb-ihs-sheen)" />
            <path d="M219 221 L219 213 L227 221 Z" fill="#c9a227" />
            <g fill="#4b5563" fontFamily="'JetBrains Mono Variable', monospace" textAnchor="middle" opacity="0.85">
              <text x="258" y="160" fontSize="9" fontWeight="700" letterSpacing="1">NETLAB</text>
              <text x="258" y="172" fontSize="7" letterSpacing="0.5">CORE X7-14700K</text>
              <text x="258" y="184" fontSize="5.5">3.40 GHz · 20 CORES</text>
              <text x="258" y="194" fontSize="5">SRN3X  L3 33MB</text>
              <text x="258" y="208" fontSize="4.5">X315G417  ◆ VIETNAM</text>
            </g>
            {/* retention lever */}
            <path d="M332 106 V256" stroke="url(#mb-steel)" strokeWidth="4" strokeLinecap="round" />
            <path d="M332 256 H318" stroke="url(#mb-steel)" strokeWidth="4" strokeLinecap="round" />
            <rect x="328" y="100" width="8" height="10" rx="2" fill="#9aa3ad" />
          </g>
          <text x="184" y="272" {...silk}>LGA1700</text>
        </Part>

        {/* ---------- DIMM slots + RAM ---------- */}
        <Part id="ram" active={active} setActive={setActive} bx={362} by={84}>
          {[0, 1, 2, 3].map((i) => {
            const x = 368 + i * 22
            const filled = i === 1 || i === 3
            return (
              <g key={i}>
                <rect x={x} y="90" width="13" height="226" rx="1.5" fill={i % 2 ? '#2a2d33' : '#3a3e45'} stroke="#0b0c0e" strokeWidth="0.6" />
                <rect x={x + 5} y="94" width="3" height="218" fill="#0b0c0e" />
                <rect x={x - 1.5} y="84" width="16" height="10" rx="1.5" fill="#d9dde2" stroke="#7b828c" strokeWidth="0.5" />
                <rect x={x - 1.5} y="312" width="16" height="10" rx="1.5" fill="#d9dde2" stroke="#7b828c" strokeWidth="0.5" />
                <text x={x + 6.5} y="332" textAnchor="middle" {...silk} fontSize="4.6">{['A1', 'A2', 'B1', 'B2'][i]}</text>
                {filled && (
                  <g filter="url(#mb-shadow)">
                    <rect x={x - 1} y="96" width="15" height="214" rx="2" fill="url(#mb-ram)" stroke="#0b0c0e" strokeWidth="0.6" />
                    <rect x={x + 4} y="98" width="5" height="210" rx="2" fill="url(#mb-rgb)" opacity="0.9">
                      {!reduced && <animate attributeName="opacity" values="0.55;1;0.55" dur="3s" repeatCount="indefinite" />}
                    </rect>
                    <text x={x + 6.5} y="205" textAnchor="middle" fontSize="5" fill="#e5e7eb" transform={`rotate(-90 ${x + 6.5} 203)`} fontWeight="700" letterSpacing="1">DDR5-6000 16GB</text>
                  </g>
                )}
              </g>
            )
          })}
        </Part>

        {/* ---------- 24-pin ATX ---------- */}
        <Part id="atx" active={active} setActive={setActive} bx={470} by={110}>
          <g filter="url(#mb-shadow)">
            <rect x="472" y="118" width="28" height="146" rx="2" fill="#1b1d20" stroke="#000" />
            {Array.from({ length: 24 }, (_, i) => <rect key={i} x={476 + (i % 2) * 11} y={122 + Math.floor(i / 2) * 11.6} width="8.5" height="8.5" rx={(i + Math.floor(i / 2)) % 3 === 0 ? 3.5 : 0.6} fill="#000" stroke="#3b3f45" strokeWidth="0.5" />)}
          </g>
          <text x="470" y="276" {...silk}>ATX_PWR</text>
        </Part>

        {/* ---------- PCIe x16 (reinforced) ---------- */}
        <Part id="pcie16" active={active} setActive={setActive} bx={112} by={346}>
          <g filter="url(#mb-shadow)">
            <rect x="124" y="338" width="276" height="18" rx="2.5" fill="url(#mb-steel)" stroke="#6b7480" strokeWidth="0.6" />
            <rect x="128" y="342" width="268" height="10" rx="1.5" fill="#0b0c0e" />
            <rect x="196" y="341" width="3" height="12" fill="url(#mb-steel)" />
            <path d="M400 334 L414 334 L414 360 L400 360 Z" fill="#d1d5db" stroke="#6b7480" />
          </g>
          <text x="124" y="368" {...silk}>PCIEX16_1 · PCIe 5.0</text>
        </Part>

        {/* ---------- PCIe x1 ---------- */}
        <Part id="pcie1" active={active} setActive={setActive} bx={112} by={392}>
          <rect x="124" y="386" width="56" height="12" rx="1.5" fill="#1b1d20" stroke="#000" filter="url(#mb-shadow)" />
          <rect x="127" y="389" width="50" height="6" fill="#050608" />
          <text x="186" y="395" {...silk}>PCIEX1_1</text>
        </Part>

        {/* ---------- M.2 with NVMe SSD ---------- */}
        <Part id="m2" active={active} setActive={setActive} bx={112} by={430}>
          <g filter="url(#mb-shadow)">
            <rect x="124" y="420" width="12" height="26" rx="1" fill="#1b1d20" />
            <rect x="134" y="422" width="188" height="22" rx="2" fill="#0f3a26" stroke="#0a2618" />
            {Array.from({ length: 16 }, (_, i) => <rect key={i} x={126} y={422 + i * 1.4} width="10" height="0.8" fill="url(#mb-gold)" />)}
            <rect x="142" y="425" width="30" height="16" rx="1" fill="#16181c" />
            <text x="157" y="435" textAnchor="middle" fontSize="3.8" fill="#9ca3af">CTRL</text>
            {[180, 214, 248].map((x) => <rect key={x} x={x} y="424" width="30" height="18" rx="1" fill="#0b0c0e" />)}
            <rect x="182" y="426" width="96" height="14" rx="1" fill="#f1f5f9" opacity="0.92" />
            <text x="230" y="435" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#111827">NVMe M.2 2280 · 1 TB</text>
            <circle cx="326" cy="433" r="5" fill="url(#mb-coin)" stroke="#4b5563" strokeWidth="0.6" />
            <path d="M323 433 H329" stroke="#374151" strokeWidth="0.8" />
          </g>
          <text x="124" y="458" {...silk}>M.2_1 (SOCKET 3)</text>
        </Part>

        {/* ---------- Chipset ---------- */}
        <Part id="chipset" active={active} setActive={setActive} bx={452} by={366}>
          <g filter="url(#mb-shadow)">
            <rect x="460" y="372" width="96" height="84" rx="6" fill="url(#mb-sink)" />
            <rect x="466" y="378" width="84" height="72" rx="4" fill="none" stroke="#7b828c" strokeWidth="0.6" />
            {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M472 ${388 + i * 10} H544`} stroke="url(#mb-fin)" strokeWidth="2.2" />)}
            <text x="508" y="420" textAnchor="middle" fontSize="8" fontWeight="800" fill="#e5e7eb" opacity="0.9" letterSpacing="1.5">Z890</text>
          </g>
        </Part>

        {/* ---------- SATA ---------- */}
        <Part id="sata" active={active} setActive={setActive} bx={620} by={318}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${608} ${332 + i * 22})`} filter="url(#mb-shadow)">
              <rect x="0" y="0" width="40" height="16" rx="1.5" fill="#1b1d20" stroke="#000" />
              <path d="M6 5 H34 V11 H12 V8 H6 Z" fill="#050608" />
              <text x="-4" y="11" textAnchor="end" {...silk} fontSize="4.5">SATA6G_{i + 1}</text>
            </g>
          ))}
        </Part>

        {/* ---------- CMOS battery ---------- */}
        <Part id="cmos" active={active} setActive={setActive} bx={584} by={430}>
          <g filter="url(#mb-shadow)">
            <path d="M576 436 a22 22 0 1 1 0.1 0" fill="none" />
            <circle cx="600" cy="440" r="24" fill="#1b1d20" />
            <circle cx="600" cy="440" r="20" fill="url(#mb-coin)" stroke="#6b7480" strokeWidth="0.8" />
            <circle cx="600" cy="440" r="15.5" fill="none" stroke="#fff" strokeOpacity="0.35" />
            <text x="600" y="437" textAnchor="middle" fontSize="9" fontWeight="800" fill="#4b5563">+</text>
            <text x="600" y="447" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#4b5563">CR2032 3V</text>
            <path d="M578 428 L572 422 M622 428 L628 422" stroke="url(#mb-steel)" strokeWidth="3" strokeLinecap="round" />
          </g>
          <text x="572" y="476" {...silk}>BAT1</text>
        </Part>
      </motion.svg>

      <div className="flex flex-col gap-2">
        <AnimatePresence mode="wait">
          {info && (
            <motion.div key={active} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={{ duration: 0.3 }} className="rounded-2xl border border-cyan/30 bg-cyan-soft p-4">
              <p className="font-mono text-xs text-cyan">#{active && PARTS[active].n}</p>
              <p className="mt-1 font-display text-lg font-semibold">{info[0]}</p>
              <p className="mt-1 text-sm text-muted">{info[1]}</p>
              <p className="mt-3 rounded-lg border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">{info[2]}</p>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(PARTS) as PartId[]).map((id) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={cn('grid h-7 w-7 place-items-center rounded-full border font-mono text-[0.7rem] transition-colors', active === id ? 'border-cyan bg-cyan text-on-accent' : 'border-line text-muted hover:text-text')}
              aria-label={PARTS[id][lang][0]}
              title={PARTS[id][lang][0]}
            >
              {PARTS[id].n}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
