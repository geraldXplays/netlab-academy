import { AnimatePresence, motion } from 'motion/react'
import { useState, type ReactNode } from 'react'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { cn } from '@/lib/cn'

type PartId = 'cpu' | 'ram' | 'pcie16' | 'pcie1' | 'm2' | 'sata' | 'atx' | 'eps' | 'chipset' | 'cmos' | 'io' | 'vrm'

const PARTS: Record<PartId, { n: number; en: [string, string, string]; fr: [string, string, string] }> = {
  cpu: { n: 1, en: ['CPU socket', 'Holds the processor. Hundreds of pins carry power and data; the lever locks the CPU in place.', 'Bent pins → no boot or missing RAM channels.'], fr: ['Socket CPU', 'Accueille le processeur. Des centaines de broches transportent courant et données ; le levier verrouille le CPU.', 'Broches tordues → pas de démarrage ou canaux RAM manquants.'] },
  vrm: { n: 2, en: ['VRM + heatsinks', 'Voltage regulators convert 12 V into the ~1 V the CPU needs. The finned heatsinks keep them cool.', 'Overheating VRMs → throttling and crashes under load.'], fr: ['VRM + dissipateurs', 'Les régulateurs convertissent le 12 V en ~1 V pour le CPU. Les dissipateurs à ailettes les refroidissent.', 'VRM en surchauffe → ralentissements et plantages en charge.'] },
  ram: { n: 3, en: ['DIMM slots (RAM)', 'Four memory slots; two filled here in the coloured "dual-channel" pair. Latches at each end lock the modules.', 'Badly seated RAM → beeps at POST, no display.'], fr: ['Slots DIMM (RAM)', 'Quatre emplacements mémoire ; deux occupés ici dans la paire « dual-channel ». Des loquets verrouillent les barrettes.', 'RAM mal insérée → bips au POST, pas d’affichage.'] },
  eps: { n: 4, en: ['CPU power (8-pin EPS)', 'Dedicated 12 V feed from the PSU to the CPU regulators.', 'Unplugged → fans spin but the PC never POSTs.'], fr: ['Alim. CPU (8 broches EPS)', 'Alimentation 12 V dédiée du bloc vers les régulateurs CPU.', 'Débranchée → les ventilateurs tournent mais pas de POST.'] },
  atx: { n: 5, en: ['24-pin ATX power', 'Main power connector from the PSU for the whole board.', 'Loose connector → random shutdowns or no power.'], fr: ['Alimentation ATX 24 broches', 'Connecteur d’alimentation principal de la carte.', 'Connecteur mal enfoncé → arrêts aléatoires ou pas de courant.'] },
  pcie16: { n: 6, en: ['PCIe x16 slot', 'Full-length high-speed slot for the graphics card. The metal shield reinforces it against heavy cards.', 'Card not detected → reseat, check PCIe power cables.'], fr: ['Slot PCIe x16', 'Slot pleine longueur à haut débit pour la carte graphique. Le renfort métallique supporte les cartes lourdes.', 'Carte non détectée → réinsérer, vérifier l’alim. PCIe.'] },
  pcie1: { n: 7, en: ['PCIe x1 slot', 'Short slot for add-in cards: extra network card, Wi-Fi, capture card.', 'A second NIC here can connect a server to two networks.'], fr: ['Slot PCIe x1', 'Slot court pour cartes d’extension : carte réseau, Wi-Fi, carte d’acquisition.', 'Une 2e carte réseau ici relie un serveur à deux réseaux.'] },
  m2: { n: 8, en: ['M.2 slot with NVMe SSD', 'Flat SSD screwed directly to the board, talking over PCIe — the fastest storage on a PC.', 'Not detected → check the screw, the slot mode in UEFI.'], fr: ['Slot M.2 avec SSD NVMe', 'SSD plat vissé sur la carte, en PCIe — le stockage le plus rapide d’un PC.', 'Non détecté → vérifier la vis, le mode du slot dans l’UEFI.'] },
  chipset: { n: 9, en: ['Chipset (under heatsink)', 'Controls USB, SATA, extra PCIe lanes and links them to the CPU.', 'Chipset failure → many devices disappear at once.'], fr: ['Chipset (sous dissipateur)', 'Gère USB, SATA, lignes PCIe supplémentaires et les relie au CPU.', 'Panne chipset → plusieurs périphériques disparaissent d’un coup.'] },
  sata: { n: 10, en: ['SATA ports', 'Connect 2.5"/3.5" drives and optical drives with L-shaped data cables.', 'Disk missing → swap SATA cable/port.'], fr: ['Ports SATA', 'Relient disques 2,5"/3,5" et lecteurs optiques par des câbles en L.', 'Disque absent → changer de câble/port SATA.'] },
  cmos: { n: 11, en: ['CMOS battery (CR2032)', 'Keeps the clock and UEFI settings when the PC is unplugged.', 'Clock resets to 2000 at every boot → replace the coin cell.'], fr: ['Pile CMOS (CR2032)', 'Conserve l’horloge et les réglages UEFI quand le PC est débranché.', 'Horloge revenue en 2000 à chaque démarrage → changer la pile.'] },
  io: { n: 12, en: ['Rear I/O panel', 'USB, RJ45 network, video outputs and audio jacks reachable from the back of the case.', 'No link light on RJ45 → cable or switch port, not Windows.'], fr: ['Panneau E/S arrière', 'USB, réseau RJ45, sorties vidéo et jacks audio accessibles à l’arrière.', 'Pas de voyant sur le RJ45 → câble ou port du commutateur, pas Windows.'] },
}

/** A hotspot: highlights on hover/focus and opens its description on click. */
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

export function MotherboardDiagram() {
  const { lang } = useI18n()
  const reduced = useReducedMotionPref()
  const [active, setActive] = useState<PartId | null>('cpu')
  const info = active ? PARTS[active][lang] : null
  const pcb = '#0c2219'
  const trace = '#1d4b37'

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_250px]">
      <motion.svg
        viewBox="0 0 640 460"
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
            <feFlood style={{ floodColor: "var(--cyan)" }} />
            <feComposite in2="d" operator="in" />
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <pattern id="mb-pins" width="5" height="5" patternUnits="userSpaceOnUse">
            <circle cx="2.5" cy="2.5" r="1" fill="#c8a24a" />
          </pattern>
          <linearGradient id="mb-metal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#d7dde4" />
            <stop offset="1" stopColor="#7d8794" />
          </linearGradient>
          <linearGradient id="mb-sink" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#4b5563" />
            <stop offset="1" stopColor="#1f2937" />
          </linearGradient>
        </defs>

        {/* PCB with traces and mounting holes */}
        <rect x="10" y="10" width="620" height="440" rx="14" fill={pcb} stroke="#081610" strokeWidth="3" />
        {Array.from({ length: 22 }, (_, i) => (
          <path key={i} d={`M${60 + i * 26} 440 V${330 - (i % 5) * 18} H${80 + i * 24}`} fill="none" stroke={trace} strokeWidth="1.2" opacity="0.55" />
        ))}
        {Array.from({ length: 10 }, (_, i) => (
          <path key={`h${i}`} d={`M110 ${60 + i * 9} H${170 + (i % 3) * 20}`} stroke={trace} strokeWidth="1" opacity="0.5" />
        ))}
        {[[28, 28], [612, 28], [28, 432], [612, 432], [320, 28], [320, 432]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="7" fill="#081610" stroke="url(#mb-metal)" strokeWidth="2.5" />
        ))}

        {/* Rear I/O */}
        <Part id="io" active={active} setActive={setActive} bx={44} by={40}>
          <rect x="22" y="50" width="48" height="190" rx="4" fill="url(#mb-metal)" />
          {[60, 84].map((y) => <rect key={y} x="30" y={y} width="32" height="16" rx="2" fill="#1e3a8a" stroke="#0f172a" />)}
          <rect x="30" y="110" width="32" height="26" rx="2" fill="#374151" stroke="#0f172a" />
          <rect x="35" y="116" width="22" height="14" fill="#111827" />
          <rect x="30" y="146" width="32" height="14" rx="2" fill="#111827" />
          {[176, 194, 212].map((y, i) => <circle key={y} cx="46" cy={y} r="6" fill={['#22c55e', '#3b82f6', '#ec4899'][i]} stroke="#0f172a" strokeWidth="2" />)}
        </Part>

        {/* VRM heatsinks */}
        <Part id="vrm" active={active} setActive={setActive} bx={110} by={46}>
          <rect x="96" y="56" width="40" height="150" rx="4" fill="url(#mb-sink)" />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x="100" y={62 + i * 16} width="32" height="7" rx="1" fill="#6b7280" />)}
          <rect x="150" y="40" width="150" height="28" rx="4" fill="url(#mb-sink)" />
          {Array.from({ length: 9 }, (_, i) => <rect key={i} x={155 + i * 16} y="44" width="7" height="20" rx="1" fill="#6b7280" />)}
        </Part>

        {/* EPS 8-pin */}
        <Part id="eps" active={active} setActive={setActive} bx={350} by={36}>
          <rect x="316" y="36" width="44" height="24" rx="2" fill="#f3f4f6" stroke="#9ca3af" />
          {Array.from({ length: 8 }, (_, i) => <rect key={i} x={320 + (i % 4) * 10} y={40 + Math.floor(i / 4) * 10} width="7" height="7" fill="#d1d5db" />)}
        </Part>

        {/* CPU socket */}
        <Part id="cpu" active={active} setActive={setActive} bx={170} by={92}>
          <rect x="160" y="84" width="140" height="140" rx="6" fill="url(#mb-metal)" />
          <rect x="174" y="98" width="112" height="112" rx="3" fill="#1c1917" />
          <rect x="178" y="102" width="104" height="104" fill="url(#mb-pins)" />
          <path d="M296 100 V215" stroke="#e5e7eb" strokeWidth="3" strokeLinecap="round" />
          <text x="230" y="160" textAnchor="middle" fontSize="13" fontWeight="700" fill="#e5e7eb" opacity="0.85">CPU</text>
        </Part>

        {/* DIMM slots */}
        <Part id="ram" active={active} setActive={setActive} bx={330} by={92}>
          {[0, 1, 2, 3].map((i) => {
            const x = 322 + i * 18
            const filled = i === 1 || i === 3
            return (
              <g key={i}>
                <rect x={x} y="84" width="12" height="190" rx="2" fill={i % 2 ? '#1f2937' : '#374151'} />
                <rect x={x - 1} y="80" width="14" height="8" rx="1" fill="#e5e7eb" />
                <rect x={x - 1} y="270" width="14" height="8" rx="1" fill="#e5e7eb" />
                {filled && (
                  <g>
                    <rect x={x + 1} y="90" width="10" height="178" fill="#065f46" />
                    {Array.from({ length: 8 }, (_, k) => <rect key={k} x={x + 2.5} y={96 + k * 21} width="7" height="15" fill="#111827" />)}
                  </g>
                )}
              </g>
            )
          })}
        </Part>

        {/* 24-pin ATX */}
        <Part id="atx" active={active} setActive={setActive} bx={420} by={96}>
          <rect x="410" y="104" width="26" height="130" rx="2" fill="#f3f4f6" stroke="#9ca3af" />
          {Array.from({ length: 24 }, (_, i) => <rect key={i} x={414 + (i % 2) * 10} y={108 + Math.floor(i / 2) * 10.3} width="7" height="7" fill="#d1d5db" />)}
        </Part>

        {/* PCIe x16 */}
        <Part id="pcie16" active={active} setActive={setActive} bx={98} by={262}>
          <rect x="110" y="256" width="250" height="16" rx="3" fill="url(#mb-metal)" />
          <rect x="114" y="259" width="242" height="10" rx="2" fill="#111827" />
          <rect x="318" y="254" width="6" height="20" fill="#6b7280" />
        </Part>

        {/* PCIe x1 */}
        <Part id="pcie1" active={active} setActive={setActive} bx={98} by={306}>
          <rect x="110" y="300" width="60" height="12" rx="2" fill="#111827" stroke="#374151" />
        </Part>

        {/* M.2 NVMe */}
        <Part id="m2" active={active} setActive={setActive} bx={98} by={352}>
          <rect x="110" y="340" width="180" height="26" rx="3" fill="#111827" stroke="#374151" />
          <rect x="114" y="344" width="160" height="18" rx="2" fill="#1e293b" />
          {[0, 1, 2].map((k) => <rect key={k} x={124 + k * 46} y="347" width="36" height="12" rx="1" fill="#0b1220" />)}
          <circle cx="282" cy="353" r="5" fill="url(#mb-metal)" />
        </Part>

        {/* Chipset */}
        <Part id="chipset" active={active} setActive={setActive} bx={400} by={300}>
          <rect x="410" y="300" width="80" height="80" rx="6" fill="url(#mb-sink)" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M418 ${310 + i * 11} H482`} stroke="#9ca3af" strokeWidth="2" />)}
        </Part>

        {/* SATA */}
        <Part id="sata" active={active} setActive={setActive} bx={566} by={292}>
          {[0, 1, 2, 3].map((i) => (
            <g key={i} transform={`translate(${540 + (i % 2) * 34} ${306 + Math.floor(i / 2) * 30})`}>
              <path d="M0 0 H26 V14 H8 V8 H0 Z" fill="#111827" stroke="#f59e0b" strokeWidth="1.2" />
            </g>
          ))}
        </Part>

        {/* CMOS */}
        <Part id="cmos" active={active} setActive={setActive} bx={536} by={398}>
          <circle cx="570" cy="404" r="20" fill="url(#mb-metal)" stroke="#6b7280" strokeWidth="2" />
          <text x="570" y="408" textAnchor="middle" fontSize="8" fontWeight="700" fill="#374151">CR2032</text>
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
