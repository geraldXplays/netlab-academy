/**
 * Realistic hardware illustrations (SVG): RAM modules, storage drives, cables/connectors and a network rack.
 * Every part has a hover/click label so they double as interactive "identify the part" diagrams.
 */
import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'


const useTr = () => {
  const { lang } = useI18n()
  return (en: string, fr: string) => (lang === 'fr' ? fr : en)
}

/* ------------------------------ shared defs ------------------------------ */

function Defs() {
  return (
    <defs>
      <linearGradient id="hw-gold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7dc8a" /><stop offset="0.5" stopColor="#d4a23c" /><stop offset="1" stopColor="#9c6f1e" /></linearGradient>
      <linearGradient id="hw-pcb" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1f6a43" /><stop offset="1" stopColor="#0f3b25" /></linearGradient>
      <linearGradient id="hw-pcb-dark" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#1b1e23" /><stop offset="1" stopColor="#0c0e11" /></linearGradient>
      <linearGradient id="hw-chip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2d33" /><stop offset="1" stopColor="#111317" /></linearGradient>
      <linearGradient id="hw-alu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#eef1f4" /><stop offset="0.4" stopColor="#b8c0c9" /><stop offset="0.7" stopColor="#dde2e7" /><stop offset="1" stopColor="#8e98a3" /></linearGradient>
      <linearGradient id="hw-steel-dark" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4048" /><stop offset="1" stopColor="#1c1f24" /></linearGradient>
      <radialGradient id="hw-platter" cx="0.45" cy="0.4" r="0.7"><stop offset="0" stopColor="#ffffff" /><stop offset="0.35" stopColor="#c9d1da" /><stop offset="0.7" stopColor="#8b96a3" /><stop offset="1" stopColor="#d7dde3" /></radialGradient>
      <filter id="hw-shadow" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="2" dy="4" stdDeviation="3" floodColor="#000" floodOpacity="0.45" /></filter>
      <filter id="hw-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
      <filter id="hw-hl" x="-10%" y="-10%" width="120%" height="120%">
        <feMorphology operator="dilate" radius="2" in="SourceAlpha" result="d" />
        <feFlood style={{ floodColor: 'var(--cyan)' }} />
        <feComposite in2="d" operator="in" />
        <feGaussianBlur stdDeviation="2.5" />
      </filter>
    </defs>
  )
}

/** A labelled, hoverable part. */
function Hot({ id, active, set, children, label }: { id: string; active: string | null; set: (s: string) => void; children: ReactNode; label: string }) {
  return (
    <g role="button" tabIndex={0} aria-label={label} onMouseEnter={() => set(id)} onFocus={() => set(id)} onClick={() => set(id)} className="cursor-pointer outline-none">
      <g opacity={active === id ? 1 : 0} style={{ transition: 'opacity .2s' }} filter="url(#hw-hl)">{children}</g>
      {children}
    </g>
  )
}

function Caption({ items, active }: { items: Record<string, [string, string]>; active: string | null }) {
  const cur = active ? items[active] : null
  return (
    <div className="min-h-[4.5rem] rounded-2xl border border-line bg-bg-2/50 p-3 text-sm">
      <AnimatePresence mode="wait">
        {cur ? (
          <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="font-semibold text-cyan">{cur[0]}</p>
            <p className="text-muted">{cur[1]}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

const mono = { fontFamily: "'JetBrains Mono Variable', monospace" }

/* ================================ RAM ================================ */

export function RamDiagram() {
  const tr = useTr()
  const [active, setActive] = useState<string | null>('chips')
  const items: Record<string, [string, string]> = {
    chips: [tr('DRAM chips', 'Puces DRAM'), tr('Each black chip stores billions of bits as tiny electric charges. 8 chips × 2 GB = a 16 GB module. They lose everything when power is cut — RAM is volatile.', 'Chaque puce noire stocke des milliards de bits sous forme de minuscules charges. 8 puces × 2 Go = une barrette de 16 Go. Tout est perdu à la coupure — la RAM est volatile.')],
    pmic: [tr('PMIC (power chip)', 'PMIC (puce d’alimentation)'), tr('New with DDR5: the module regulates its own voltage instead of relying on the motherboard.', 'Nouveau en DDR5 : la barrette régule sa propre tension au lieu de dépendre de la carte mère.')],
    spd: [tr('SPD chip', 'Puce SPD'), tr('Tiny EEPROM that tells the BIOS the module’s size, speed and timings (and the XMP/EXPO overclock profile).', 'Petite EEPROM qui indique au BIOS la taille, la vitesse et les timings de la barrette (et le profil XMP/EXPO).')],
    gold: [tr('Gold contacts (288 pins)', 'Contacts dorés (288 broches)'), tr('Gold-plated fingers that slide into the DIMM slot. Never touch them — finger grease and static can cause faults.', 'Contacts plaqués or qui s’insèrent dans le slot. Ne les touchez pas — gras et électricité statique causent des pannes.')],
    notch: [tr('Keying notch', 'Encoche détrompeur'), tr('Off-centre on purpose and in a different place for DDR4 and DDR5: a module only fits one way and only in its own generation.', 'Volontairement décentrée et différente entre DDR4 et DDR5 : une barrette ne rentre que dans un sens et dans sa génération.')],
    label: [tr('Label', 'Étiquette'), tr('Capacity, generation and speed: 16GB 1Rx8 DDR5-5600 CL46. Read it before buying a matching module.', 'Capacité, génération et vitesse : 16GB 1Rx8 DDR5-5600 CL46. Lisez-la avant d’acheter une barrette identique.')],
    sodimm: [tr('SO-DIMM (laptops)', 'SO-DIMM (portables)'), tr('The small-outline version for laptops and mini-PCs: same technology, about half the length. Many thin laptops have RAM soldered instead.', 'La version compacte pour portables et mini-PC : même technologie, environ deux fois plus courte. Beaucoup de portables fins ont la RAM soudée.')],
  }
  const chip = (x: number, y: number, w = 46, h = 34) => (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="2" fill="url(#hw-chip)" stroke="#000" />
      <circle cx={x + 5} cy={y + 5} r="1.6" fill="#3a3f46" />
      <text x={x + w / 2} y={y + h / 2 + 2} textAnchor="middle" fontSize="5" fill="#8b929b" style={mono}>D8CPF</text>
      <text x={x + w / 2} y={y + h / 2 + 9} textAnchor="middle" fontSize="4" fill="#6b727b" style={mono}>2GB DDR5</text>
    </g>
  )
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 720 360" className="h-auto w-full" role="img" aria-label={tr('DDR5 RAM module and SO-DIMM', 'Barrette RAM DDR5 et SO-DIMM')}>
        <Defs />
        {/* DIMM */}
        <g filter="url(#hw-shadow)">
          <path d="M20 40 H700 V170 H418 V178 H410 V170 H20 Z" fill="url(#hw-pcb)" stroke="#0a2a1a" />
          {/* trace texture */}
          {Array.from({ length: 30 }, (_, i) => <path key={i} d={`M${40 + i * 22} 150 V${125 - (i % 4) * 6}`} stroke="#2a7a52" strokeWidth="0.6" opacity="0.6" />)}
          {/* side notches */}
          <path d="M20 96 H28 V112 H20 Z M700 96 H692 V112 H700 Z" fill="#0b0d10" />
        </g>
        <Hot id="gold" active={active} set={setActive} label={items.gold[0]}>
          <g>
            {Array.from({ length: 100 }, (_, i) => {
              const x = 26 + i * 6.75
              if (x > 404 && x < 424) return null
              return <rect key={i} x={x} y="150" width="4.2" height="20" rx="0.6" fill="url(#hw-gold)" />
            })}
          </g>
        </Hot>
        <Hot id="notch" active={active} set={setActive} label={items.notch[0]}>
          <path d="M406 148 H422 V178 H406 Z" fill="none" stroke="var(--warning)" strokeWidth="1.5" strokeDasharray="3 2" />
        </Hot>
        <Hot id="chips" active={active} set={setActive} label={items.chips[0]}>
          <g>{[60, 128, 196, 264, 448, 516, 584, 640].map((x, i) => <g key={x}>{chip(i === 7 ? 640 : x, 62)}</g>)}</g>
        </Hot>
        <Hot id="pmic" active={active} set={setActive} label={items.pmic[0]}>
          <g>
            <rect x="350" y="64" width="26" height="26" rx="2" fill="url(#hw-chip)" stroke="#000" />
            <text x="363" y="79" textAnchor="middle" fontSize="4.5" fill="#8b929b" style={mono}>PMIC</text>
            {[[340, 98], [348, 98], [356, 98], [384, 70], [384, 78]].map(([x, y], i) => <rect key={i} x={x} y={y} width="5" height="3" fill="#c38d3f" />)}
          </g>
        </Hot>
        <Hot id="spd" active={active} set={setActive} label={items.spd[0]}>
          <rect x="350" y="112" width="16" height="10" rx="1" fill="url(#hw-chip)" stroke="#000" />
        </Hot>
        <Hot id="label" active={active} set={setActive} label={items.label[0]}>
          <g>
            <rect x="60" y="104" width="250" height="32" rx="2" fill="#f4f5f7" />
            <text x="70" y="117" fontSize="8.5" fontWeight="700" fill="#111827" style={mono}>16GB 1Rx8 PC5-5600B</text>
            <text x="70" y="129" fontSize="6.5" fill="#374151" style={mono}>DDR5 UDIMM · CL46 · 1.1V · S/N 2648XJ</text>
            {Array.from({ length: 22 }, (_, i) => <rect key={i} x={252 + i * 2.4} y="108" width={i % 3 ? 1 : 1.8} height="22" fill="#111827" />)}
          </g>
        </Hot>
        <text x="20" y="28" fontSize="11" fill="var(--text-muted)" fontWeight="600">{tr('DDR5 DIMM — desktop (133 mm)', 'DIMM DDR5 — PC fixe (133 mm)')}</text>

        {/* SO-DIMM */}
        <Hot id="sodimm" active={active} set={setActive} label={items.sodimm[0]}>
          <g filter="url(#hw-shadow)">
            <path d="M20 230 H380 V330 H196 V338 H188 V330 H20 Z" fill="url(#hw-pcb)" stroke="#0a2a1a" />
            <path d="M20 262 A6 6 0 0 0 20 274 M380 262 A6 6 0 0 1 380 274" fill="#0b0d10" />
            {[44, 108, 234, 298].map((x) => <g key={x}>{chip(x, 244, 50, 36)}</g>)}
            {Array.from({ length: 52 }, (_, i) => {
              const x = 26 + i * 6.7
              if (x > 184 && x < 200) return null
              return <rect key={i} x={x} y="310" width="4" height="20" rx="0.6" fill="url(#hw-gold)" />
            })}
            <rect x="170" y="286" width="56" height="14" rx="1.5" fill="#f4f5f7" />
            <text x="198" y="296" textAnchor="middle" fontSize="6" fontWeight="700" fill="#111827" style={mono}>8GB DDR5 SO</text>
          </g>
        </Hot>
        <text x="20" y="220" fontSize="11" fill="var(--text-muted)" fontWeight="600">{tr('SO-DIMM — laptop (69.6 mm)', 'SO-DIMM — portable (69,6 mm)')}</text>
        {/* scale bar */}
        <g transform="translate(430 290)">
          <path d="M0 0 H260" stroke="var(--text-dim)" />
          {[0, 65, 130, 195, 260].map((x) => <path key={x} d={`M${x} -4 V4`} stroke="var(--text-dim)" />)}
          <text x="130" y="18" textAnchor="middle" fontSize="9" fill="var(--text-dim)" style={mono}>{tr('≈ 50 mm', '≈ 50 mm')}</text>
          <text x="0" y="-12" fontSize="10" fill="var(--text-muted)">{tr('Hover or tap a part to identify it', 'Survolez ou touchez un élément pour l’identifier')}</text>
        </g>
      </svg>
      <Caption items={items} active={active} />
    </div>
  )
}

/* ================================ Storage ================================ */

export function StorageDiagram() {
  const tr = useTr()
  const reduced = useReducedMotionPref()
  const [active, setActive] = useState<string | null>('hdd')
  const items: Record<string, [string, string]> = {
    hdd: [tr('Hard disk drive (HDD), cover removed', 'Disque dur (HDD), capot retiré'), tr('Magnetic platters spin at 7,200 rpm; a head floating nanometres above them reads and writes. Huge and cheap per TB, but slow to seek (~10 ms) and fragile — never move a running HDD.', 'Des plateaux magnétiques tournent à 7 200 tr/min ; une tête qui flotte à quelques nanomètres lit et écrit. Énorme et peu cher au To, mais lent à chercher (~10 ms) et fragile — ne déplacez jamais un disque en marche.')],
    arm: [tr('Actuator arm & read/write head', 'Bras actionneur et tête de lecture'), tr('The arm swings across the platter to find data. That mechanical movement is why HDDs are slow at random access.', 'Le bras balaye le plateau pour trouver les données. Ce mouvement mécanique explique la lenteur des HDD en accès aléatoire.')],
    sata: [tr('2.5" SATA SSD', 'SSD SATA 2,5"'), tr('Flash memory in a laptop-drive shape. No moving parts, ~550 MB/s — the bottleneck is the SATA bus. The classic upgrade for an old PC.', 'Mémoire flash au format disque de portable. Aucune pièce mobile, ~550 Mo/s — la limite est le bus SATA. La mise à niveau classique d’un vieux PC.')],
    ports: [tr('SATA data + power connectors', 'Connecteurs SATA données + alimentation'), tr('The short 7-pin port carries data to the motherboard; the long 15-pin port takes power from the PSU.', 'Le petit port 7 broches transporte les données vers la carte mère ; le long port 15 broches reçoit le courant de l’alimentation.')],
    nvme: [tr('M.2 NVMe SSD', 'SSD M.2 NVMe'), tr('A bare circuit board plugged straight into the motherboard over PCIe: 3,500–7,000+ MB/s, 10× faster than SATA.', 'Une carte nue branchée directement sur la carte mère en PCIe : 3 500 à 7 000+ Mo/s, 10× plus rapide que le SATA.')],
  }
  const speeds: [string, number, string][] = [['HDD 7200 rpm', 180, '#94a3b8'], ['SATA SSD', 550, '#38bdf8'], ['NVMe PCIe 4.0', 7000, '#a855f7']]
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 720 400" className="h-auto w-full" role="img" aria-label={tr('Hard drive, SATA SSD and NVMe SSD', 'Disque dur, SSD SATA et SSD NVMe')}>
        <Defs />
        {/* HDD */}
        <Hot id="hdd" active={active} set={setActive} label={items.hdd[0]}>
          <g filter="url(#hw-shadow)">
            <rect x="20" y="30" width="230" height="300" rx="10" fill="url(#hw-alu)" stroke="#6b7480" />
            <rect x="30" y="40" width="210" height="280" rx="8" fill="#c5ccd4" stroke="#8b949e" strokeWidth="0.8" />
            {[[32, 42], [238, 42], [32, 318], [238, 318]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r="4" fill="#7b848f" /><path d={`M${x - 2} ${y - 2} L${x + 2} ${y + 2} M${x + 2} ${y - 2} L${x - 2} ${y + 2}`} stroke="#3f4650" strokeWidth="0.8" /></g>)}
          </g>
        </Hot>
        <g>
          <circle cx="130" cy="140" r="92" fill="url(#hw-platter)" stroke="#6b7480" />
          {[20, 40, 60, 80].map((r) => <circle key={r} cx="130" cy="140" r={r} fill="none" stroke="#fff" strokeOpacity="0.25" />)}
          <g>
            {!reduced && <animateTransform attributeName="transform" type="rotate" from="0 130 140" to="360 130 140" dur="0.9s" repeatCount="indefinite" />}
            <path d="M130 50 A90 90 0 0 1 190 72" stroke="#fff" strokeOpacity="0.55" strokeWidth="5" fill="none" />
          </g>
          <circle cx="130" cy="140" r="16" fill="url(#hw-alu)" stroke="#6b7480" />
          {Array.from({ length: 6 }, (_, i) => <circle key={i} cx={130 + 9 * Math.cos((i * Math.PI) / 3)} cy={140 + 9 * Math.sin((i * Math.PI) / 3)} r="1.6" fill="#4b5563" />)}
        </g>
        <path d="M196 262 A26 26 0 0 1 238 290 L226 300 A12 12 0 0 0 204 282 Z" fill="#9a3412" opacity="0.85" />
        <Hot id="arm" active={active} set={setActive} label={items.arm[0]}>
          <g>
            {!reduced && <animateTransform attributeName="transform" type="rotate" values="0 210 270; -16 210 270; -4 210 270; -22 210 270; 0 210 270" dur="3.2s" repeatCount="indefinite" />}
            <path d="M204 268 L168 166 L176 163 L218 262 Z" fill="url(#hw-alu)" stroke="#59616b" />
            <path d="M168 166 L164 150 L172 148 L176 163 Z" fill="#cfd5db" stroke="#59616b" strokeWidth="0.6" />
            <rect x="162" y="144" width="12" height="7" rx="1" fill="#2f353c" transform="rotate(-18 168 148)" />
            <circle cx="210" cy="270" r="16" fill="#3b4048" stroke="#1f2328" />
            <circle cx="210" cy="270" r="5" fill="url(#hw-alu)" />
          </g>
        </Hot>
                <text x="135" y="350" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)">{tr('3.5" HDD (cover off)', 'HDD 3,5" (capot ouvert)')}</text>

        {/* SATA SSD */}
        <Hot id="sata" active={active} set={setActive} label={items.sata[0]}>
          <g filter="url(#hw-shadow)">
            <rect x="290" y="60" width="170" height="236" rx="8" fill="url(#hw-steel-dark)" stroke="#0b0c0e" />
            <rect x="304" y="80" width="142" height="150" rx="4" fill="#111318" />
            <text x="375" y="125" textAnchor="middle" fontSize="15" fontWeight="800" fill="#e5e7eb" letterSpacing="2">NETLAB</text>
            <text x="375" y="146" textAnchor="middle" fontSize="9" fill="#9ca3af" style={mono}>SSD 870 · 1TB</text>
            <rect x="320" y="160" width="110" height="3" rx="1.5" fill="#22d3ee" />
            <text x="375" y="190" textAnchor="middle" fontSize="7" fill="#6b7280" style={mono}>SATA 6Gb/s · 2.5" · 7mm</text>
          </g>
        </Hot>
        <Hot id="ports" active={active} set={setActive} label={items.ports[0]}>
          <g>
            <rect x="306" y="280" width="34" height="14" rx="1.5" fill="#0b0c0e" stroke="#4b5563" />
            <path d="M310 284 H336 V290 H316 V287 H310 Z" fill="url(#hw-gold)" opacity="0.8" />
            <rect x="350" y="280" width="94" height="14" rx="1.5" fill="#0b0c0e" stroke="#4b5563" />
            <path d="M354 284 H440 V290 H362 V287 H354 Z" fill="url(#hw-gold)" opacity="0.8" />
            <text x="323" y="306" textAnchor="middle" fontSize="7" fill="var(--text-dim)" style={mono}>DATA</text>
            <text x="397" y="306" textAnchor="middle" fontSize="7" fill="var(--text-dim)" style={mono}>POWER</text>
          </g>
        </Hot>
        <text x="375" y="350" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)">{tr('2.5" SATA SSD', 'SSD SATA 2,5"')}</text>

        {/* NVMe */}
        <Hot id="nvme" active={active} set={setActive} label={items.nvme[0]}>
          <g filter="url(#hw-shadow)" transform="rotate(-90 600 180)">
            <path d="M490 154 H710 V206 H490 V186 H486 V182 H490 Z" fill="url(#hw-pcb-dark)" stroke="#000" />
            <path d="M704 172 A8 8 0 0 1 704 188" fill="#000" />
            {Array.from({ length: 34 }, (_, i) => {
              const y = 156 + i * 1.5
              return <rect key={i} x="490" y={y} width="14" height="0.9" fill="url(#hw-gold)" />
            })}
            <rect x="512" y="160" width="34" height="40" rx="2" fill="url(#hw-chip)" stroke="#000" />
            <text x="529" y="182" textAnchor="middle" fontSize="5" fill="#9ca3af" style={mono}>CTRL</text>
            <rect x="554" y="160" width="24" height="18" rx="1.5" fill="url(#hw-chip)" stroke="#000" />
            <text x="566" y="171" textAnchor="middle" fontSize="4" fill="#9ca3af" style={mono}>DRAM</text>
            {[588, 640].map((x) => <g key={x}><rect x={x} y="158" width="46" height="44" rx="2" fill="url(#hw-chip)" stroke="#000" /><text x={x + 23} y="182" textAnchor="middle" fontSize="5" fill="#9ca3af" style={mono}>NAND</text></g>)}
            <rect x="554" y="182" width="28" height="18" rx="1" fill="#f4f5f7" />
            <text x="568" y="193" textAnchor="middle" fontSize="4.5" fontWeight="700" fill="#111827">2TB</text>
          </g>
        </Hot>
        <text x="600" y="350" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-muted)">{tr('M.2 2280 NVMe SSD', 'SSD NVMe M.2 2280')}</text>

        {/* speed comparison */}
        <g transform="translate(20 368)">
          {speeds.map(([l, v, c], i) => {
            const w = Math.max(6, (Math.log10(v) / Math.log10(7000)) * 220)
            return (
              <g key={l} transform={`translate(${i * 236} 0)`}>
                <text x="0" y="0" fontSize="9" fill="var(--text-muted)" style={mono}>{l}</text>
                <rect x="0" y="6" width="220" height="7" rx="3.5" fill="var(--line)" />
                <motion.rect x="0" y="6" height="7" rx="3.5" fill={c} initial={{ width: 0 }} whileInView={{ width: w }} viewport={{ once: true }} transition={{ duration: 1.2, delay: i * 0.2 }} />
                <text x="220" y="0" textAnchor="end" fontSize="9" fill={c} style={mono} fontWeight="700">{v.toLocaleString()} MB/s</text>
              </g>
            )
          })}
        </g>
      </svg>
      <Caption items={items} active={active} />
    </div>
  )
}

/* ================================ Cables ================================ */

export function CablesDiagram() {
  const tr = useTr()
  const [active, setActive] = useState<string | null>('utp')
  const items: Record<string, [string, string]> = {
    utp: [tr('Cat6 UTP cable', 'Câble UTP Cat6'), tr('4 twisted pairs of copper inside a PVC jacket. The twisting cancels interference; the plastic spline keeps pairs apart. Max 100 m, up to 10 Gb/s (55 m).', '4 paires torsadées de cuivre dans une gaine PVC. La torsade annule les interférences ; la croix plastique sépare les paires. 100 m max, jusqu’à 10 Gb/s (55 m).')],
    rj45: [tr('RJ45 (8P8C) plug', 'Prise RJ45 (8P8C)'), tr('Transparent plug with 8 gold contacts crimped onto the 8 wires, in T568B order. The clip locks it into the port.', 'Prise transparente avec 8 contacts dorés sertis sur les 8 fils, dans l’ordre T568B. Le clip la verrouille dans le port.')],
    boot: [tr('Strain-relief boot', 'Manchon de protection'), tr('Protects the clip from snapping and the wires from bending at the plug.', 'Protège le clip de la casse et les fils des pliures au niveau de la prise.')],
    fibre: [tr('Fibre optic — LC duplex', 'Fibre optique — LC duplex'), tr('Light in glass: one fibre to send, one to receive. Immune to electrical interference, kilometres of reach. Aqua = multimode (inside buildings), yellow = single-mode (long distance).', 'De la lumière dans du verre : une fibre pour émettre, une pour recevoir. Insensible aux interférences, des kilomètres de portée. Turquoise = multimode (bâtiments), jaune = monomode (longue distance).')],
    coax: [tr('Coaxial cable (F connector)', 'Câble coaxial (connecteur F)'), tr('One copper core inside a shield: used for cable TV/Internet (DOCSIS) modems.', 'Une âme en cuivre dans un blindage : utilisé pour les modems TV/Internet câble (DOCSIS).')],
  }
  const pairs: [string, string][] = [['#f97316', '#fff7ed'], ['#22c55e', '#f0fdf4'], ['#3b82f6', '#eff6ff'], ['#92400e', '#fffbeb']]
  const t568b = ['#fff7ed', '#f97316', '#f0fdf4', '#3b82f6', '#eff6ff', '#22c55e', '#fffbeb', '#92400e']
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 720 380" className="h-auto w-full" role="img" aria-label={tr('Network cables and connectors', 'Câbles et connecteurs réseau')}>
        <Defs />
        {/* UTP with stripped end showing twisted pairs */}
        <Hot id="utp" active={active} set={setActive} label={items.utp[0]}>
          <g filter="url(#hw-shadow)">
            <path d="M20 90 H190" stroke="#2563eb" strokeWidth="26" strokeLinecap="round" />
            <path d="M20 84 H190" stroke="#60a5fa" strokeWidth="4" strokeOpacity="0.5" />
            <text x="60" y="94" fontSize="7" fill="#dbeafe" style={mono}>CAT6 U/UTP 23AWG</text>
            {pairs.map(([a, b], k) => {
              const y0 = 78 + k * 8
              const d1 = Array.from({ length: 12 }, (_, i) => `${i === 0 ? 'M' : 'L'}${190 + i * 10} ${y0 + (i % 2 ? 3 : -3)}`).join(' ')
              const d2 = Array.from({ length: 12 }, (_, i) => `${i === 0 ? 'M' : 'L'}${190 + i * 10} ${y0 + (i % 2 ? -3 : 3)}`).join(' ')
              return (
                <g key={k}>
                  <path d={d1} stroke={a} strokeWidth="4" fill="none" strokeLinejoin="round" />
                  <path d={d2} stroke={b} strokeWidth="4" fill="none" strokeLinejoin="round" />
                  <path d={d2} stroke={a} strokeWidth="4" fill="none" strokeDasharray="3 5" strokeOpacity="0.8" />
                </g>
              )
            })}
            {/* cross-section */}
            <g transform="translate(330 90)">
              <circle r="30" fill="#2563eb" />
              <circle r="25" fill="#0b1220" />
              <path d="M0 -23 V23 M-23 0 H23" stroke="#e5e7eb" strokeWidth="3.5" />
              {[[-11, -11], [11, -11], [-11, 11], [11, 11]].map(([x, y], i) => (
                <g key={i}><circle cx={x - 3} cy={y} r="4" fill={pairs[i][0]} /><circle cx={x + 3} cy={y} r="4" fill={pairs[i][1]} stroke={pairs[i][0]} strokeWidth="1" /></g>
              ))}
            </g>
          </g>
        </Hot>
        <text x="330" y="138" textAnchor="middle" fontSize="8" fill="var(--text-dim)" style={mono}>{tr('cross-section', 'coupe')}</text>
        <text x="20" y="54" fontSize="11" fontWeight="600" fill="var(--text-muted)">{tr('Twisted pair (Ethernet)', 'Paire torsadée (Ethernet)')}</text>

        {/* RJ45 plug */}
        <g transform="translate(420 40)" filter="url(#hw-shadow)">
          <Hot id="boot" active={active} set={setActive} label={items.boot[0]}>
            <path d="M200 34 L250 40 V64 L200 70 Z" fill="#1d4ed8" />
          </Hot>
          <path d="M250 50 H290" stroke="#2563eb" strokeWidth="16" strokeLinecap="round" />
          <Hot id="rj45" active={active} set={setActive} label={items.rj45[0]}>
            <g>
              <path d="M60 24 H200 V80 H60 Z" fill="#dbeafe" fillOpacity="0.35" stroke="#93c5fd" strokeWidth="1.2" />
              <path d="M60 24 H200 V36 H60 Z" fill="#fff" fillOpacity="0.25" />
              {t568b.map((c, i) => (
                <g key={i}>
                  <path d={`M200 ${32 + i * 6} H112`} stroke={c} strokeWidth="4" />
                  <path d={`M200 ${32 + i * 6} H112`} stroke={['#f97316', '#f97316', '#22c55e', '#3b82f6', '#3b82f6', '#22c55e', '#92400e', '#92400e'][i]} strokeWidth="4" strokeDasharray={i % 2 === 0 ? '3 4' : undefined} opacity={i % 2 === 0 ? 0.85 : 0} />
                  <rect x="64" y={30 + i * 6} width="12" height="4" fill="url(#hw-gold)" />
                </g>
              ))}
              <path d="M120 80 L170 80 L182 98 L132 98 Z" fill="#bfdbfe" fillOpacity="0.5" stroke="#93c5fd" />
              <text x="130" y="16" textAnchor="middle" fontSize="8" fill="var(--text-dim)" style={mono}>T568B · pin 1 → 8</text>
            </g>
          </Hot>
        </g>
        <text x="480" y="160" fontSize="11" fontWeight="600" fill="var(--text-muted)">{tr('RJ45 plug (transparent)', 'Prise RJ45 (transparente)')}</text>

        {/* Fibre LC duplex */}
        <Hot id="fibre" active={active} set={setActive} label={items.fibre[0]}>
          <g filter="url(#hw-shadow)">
            {[0, 1].map((k) => (
              <g key={k} transform={`translate(40 ${220 + k * 34})`}>
                <path d="M120 10 H300" stroke="#22d3ee" strokeWidth="8" strokeLinecap="round" />
                <rect x="70" y="0" width="54" height="20" rx="3" fill="#e2e8f0" stroke="#94a3b8" />
                <rect x="40" y="3" width="32" height="14" rx="2" fill="#0ea5e9" />
                <rect x="20" y="6" width="22" height="8" rx="1" fill="#f8fafc" stroke="#cbd5e1" />
                <circle cx="20" cy="10" r="2.5" fill="#22d3ee" filter="url(#hw-glow)">
                  <animate attributeName="opacity" values="1;0.3;1" dur={`${1.2 + k * 0.4}s`} repeatCount="indefinite" />
                </circle>
                <text x="315" y="14" fontSize="8" fill="var(--text-dim)" style={mono}>{k ? 'RX' : 'TX'}</text>
              </g>
            ))}
            <rect x="105" y="222" width="20" height="48" rx="3" fill="#94a3b8" opacity="0.6" />
            {/* single-mode yellow sample */}
            <path d="M40 310 H240" stroke="#facc15" strokeWidth="8" strokeLinecap="round" />
            <text x="250" y="314" fontSize="8" fill="var(--text-dim)" style={mono}>{tr('single-mode (yellow, km)', 'monomode (jaune, km)')}</text>
          </g>
        </Hot>
        <text x="40" y="206" fontSize="11" fontWeight="600" fill="var(--text-muted)">{tr('Fibre optic, LC duplex (aqua = multimode)', 'Fibre optique, LC duplex (turquoise = multimode)')}</text>

        {/* Coax */}
        <Hot id="coax" active={active} set={setActive} label={items.coax[0]}>
          <g transform="translate(470 220)" filter="url(#hw-shadow)">
            <path d="M120 40 H220" stroke="#111827" strokeWidth="16" strokeLinecap="round" />
            <path d="M60 22 H120 V58 H60 Z" fill="url(#hw-alu)" stroke="#6b7480" />
            {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${66 + i * 8} 22 V58`} stroke="#6b7480" strokeWidth="1.2" />)}
            <path d="M40 30 H60 V50 H40 Z" fill="url(#hw-alu)" stroke="#6b7480" />
            <path d="M22 39 H40 V41 H22 Z" fill="#d4a23c" />
            <g transform="translate(110 100)">
              <circle r="18" fill="#111827" /><circle r="14" fill="#9ca3af" /><circle r="10" fill="#f8fafc" /><circle r="2.5" fill="#d4a23c" />
            </g>
            <text x="138" y="98" fontSize="7.5" fill="var(--text-dim)" style={mono}>{tr('core · insulator', 'âme · isolant')}</text>
            <text x="138" y="110" fontSize="7.5" fill="var(--text-dim)" style={mono}>{tr('shield · jacket', 'blindage · gaine')}</text>
          </g>
        </Hot>
        <text x="500" y="206" fontSize="11" fontWeight="600" fill="var(--text-muted)">{tr('Coaxial (cable modem)', 'Coaxial (modem câble)')}</text>
      </svg>
      <Caption items={items} active={active} />
    </div>
  )
}

/* ================================ Network rack ================================ */

export function RackDiagram() {
  const tr = useTr()
  const reduced = useReducedMotionPref()
  const [active, setActive] = useState<string | null>('switch')
  const items: Record<string, [string, string]> = {
    patch: [tr('Patch panel', 'Panneau de brassage'), tr('Every wall socket in the building ends here (cables are punched down at the back). Short patch cords connect each one to a switch port — moving a desk = moving one cord.', 'Chaque prise murale du bâtiment aboutit ici (câbles sertis à l’arrière). Des cordons courts relient chacune à un port de switch — déménager un bureau = déplacer un cordon.')],
    switch: [tr('24-port PoE switch', 'Switch 24 ports PoE'), tr('Connects every device of the floor. Green LEDs = link, blinking = traffic, amber = PoE powering a phone or access point. The SFP slots on the right take fibre modules for the uplink.', 'Relie tous les appareils de l’étage. LED vertes = lien, clignotantes = trafic, orange = PoE qui alimente un téléphone ou une borne. Les slots SFP à droite accueillent des modules fibre pour le lien montant.')],
    router: [tr('Router', 'Routeur'), tr('Connects the office LAN to the Internet / other sites and routes between subnets.', 'Relie le LAN du bureau à Internet / aux autres sites et route entre sous-réseaux.')],
    fw: [tr('Firewall appliance', 'Pare-feu'), tr('Filters traffic between the Internet, the LAN and the DMZ according to its rules.', 'Filtre le trafic entre Internet, le LAN et la DMZ selon ses règles.')],
    server: [tr('1U rack server', 'Serveur rack 1U'), tr('Hot-swap drive bays on the front, redundant power supplies at the back. 1U = 44.45 mm high.', 'Baies de disques échangeables à chaud en façade, alimentations redondantes à l’arrière. 1U = 44,45 mm de haut.')],
    ups: [tr('UPS (battery)', 'Onduleur (batterie)'), tr('Keeps everything running for a few minutes during a power cut and tells servers to shut down cleanly.', 'Maintient tout en marche quelques minutes lors d’une coupure et demande aux serveurs de s’éteindre proprement.')],
  }
  const rackX = 80
  const W = 560
  const U = 34
  const blink = (i: number) => (reduced ? undefined : <animate attributeName="opacity" values="1;0.15;1;1;0.3;1" dur={`${0.6 + ((i * 37) % 10) / 9}s`} repeatCount="indefinite" />)
  const unit = (n: number) => 30 + n * U
  return (
    <div className="space-y-3">
      <svg viewBox="0 0 720 420" className="h-auto w-full" role="img" aria-label={tr('Network rack', 'Baie réseau')}>
        <Defs />
        {/* rack frame */}
        <rect x={rackX - 30} y="14" width={W + 60} height="392" rx="6" fill="#0b0d10" stroke="#2c3036" />
        {[rackX - 22, rackX + W + 8].map((x) => (
          <g key={x}>
            <rect x={x} y="20" width="14" height="380" fill="url(#hw-steel-dark)" />
            {Array.from({ length: 33 }, (_, i) => <rect key={i} x={x + 4} y={24 + i * 11.4} width="6" height="5" rx="1" fill="#05060a" />)}
          </g>
        ))}
        {/* patch panel */}
        <Hot id="patch" active={active} set={setActive} label={items.patch[0]}>
          <g>
            <rect x={rackX} y={unit(0)} width={W} height={U - 4} rx="2" fill="#1b1e23" stroke="#30343a" />
            {Array.from({ length: 24 }, (_, i) => (
              <g key={i}>
                <rect x={rackX + 14 + i * 22} y={unit(0) + 8} width="16" height="13" rx="1.5" fill="#050608" stroke="#3b4048" strokeWidth="0.6" />
                <text x={rackX + 22 + i * 22} y={unit(0) + 6} textAnchor="middle" fontSize="4.5" fill="#9ca3af" style={mono}>{i + 1}</text>
              </g>
            ))}
          </g>
        </Hot>
        {/* patch cords */}
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M${rackX + 22 + i * 22} ${unit(0) + 21} C ${rackX + 22 + i * 22} ${unit(1) - 2}, ${rackX + 30 + i * 22} ${unit(1) - 2}, ${rackX + 30 + i * 22} ${unit(1) + 10}`} fill="none" stroke={['#3b82f6', '#3b82f6', '#facc15', '#3b82f6', '#ef4444', '#3b82f6'][i % 6]} strokeWidth="3" strokeLinecap="round" />
        ))}
        {/* switch */}
        <Hot id="switch" active={active} set={setActive} label={items.switch[0]}>
          <g>
            <rect x={rackX} y={unit(1)} width={W} height={U - 4} rx="2" fill="url(#hw-steel-dark)" stroke="#4b5059" />
            <text x={rackX + 6} y={unit(1) + 9} fontSize="5.5" fontWeight="700" fill="#cbd5e1" style={mono}>NETLAB SW-24P</text>
            {Array.from({ length: 24 }, (_, i) => {
              const x = rackX + 60 + (i % 12) * 30 + (i % 12 > 5 ? 10 : 0)
              const y = unit(1) + (i < 12 ? 4 : 16)
              const on = [0, 1, 2, 3, 5, 6, 7, 8, 9, 12, 13, 14, 16, 18].includes(i)
              return (
                <g key={i}>
                  <rect x={x} y={y} width="16" height="11" rx="1" fill="#050608" stroke="#5b616a" strokeWidth="0.5" />
                  <rect x={x + 1} y={y - 2.5} width="4" height="2" fill={on ? '#22c55e' : '#1f2937'}>{on && blink(i)}</rect>
                  <rect x={x + 11} y={y - 2.5} width="4" height="2" fill={i % 4 === 0 && on ? '#f59e0b' : '#1f2937'} />
                </g>
              )
            })}
            {[0, 1, 2, 3].map((k) => <rect key={k} x={rackX + 470 + k * 21} y={unit(1) + 8} width="17" height="12" rx="1" fill="#0b0c0e" stroke="#9ca3af" strokeWidth="0.7" />)}
            <rect x={rackX + 470} y={unit(1) + 8} width="17" height="12" rx="1" fill="#0ea5e9" opacity="0.5" />
            <text x={rackX + 510} y={unit(1) + 27} textAnchor="middle" fontSize="4.5" fill="#9ca3af" style={mono}>SFP+ 10G</text>
          </g>
        </Hot>
        {/* router */}
        <Hot id="router" active={active} set={setActive} label={items.router[0]}>
          <g>
            <rect x={rackX} y={unit(3)} width={W} height={U - 4} rx="2" fill="#1d2838" stroke="#334155" />
            <text x={rackX + 10} y={unit(3) + 18} fontSize="8" fontWeight="800" fill="#93c5fd" style={mono} letterSpacing="1">ISR 4331</text>
            {[0, 1, 2].map((k) => (
              <g key={k}>
                <rect x={rackX + 240 + k * 26} y={unit(3) + 8} width="18" height="13" rx="1" fill="#050608" stroke="#64748b" strokeWidth="0.6" />
                <rect x={rackX + 241 + k * 26} y={unit(3) + 5} width="4" height="2" fill="#22c55e">{blink(k + 40)}</rect>
              </g>
            ))}
            <rect x={rackX + 330} y={unit(3) + 8} width="60" height="14" rx="2" fill="#0f172a" stroke="#475569" />
            <text x={rackX + 360} y={unit(3) + 18} textAnchor="middle" fontSize="5" fill="#64748b" style={mono}>NIM-ES2</text>
            <circle cx={rackX + W - 20} cy={unit(3) + 15} r="3" fill="#22c55e" />
          </g>
        </Hot>
        {/* firewall */}
        <Hot id="fw" active={active} set={setActive} label={items.fw[0]}>
          <g>
            <rect x={rackX} y={unit(4)} width={W} height={U - 4} rx="2" fill="#3b1414" stroke="#7f1d1d" />
            <text x={rackX + 10} y={unit(4) + 18} fontSize="8" fontWeight="800" fill="#fca5a5" style={mono} letterSpacing="1">FW-EDGE</text>
            {['WAN', 'LAN', 'DMZ', 'MGMT'].map((l, k) => (
              <g key={l}>
                <rect x={rackX + 200 + k * 30} y={unit(4) + 6} width="20" height="13" rx="1" fill="#050608" stroke="#9f1239" strokeWidth="0.6" />
                <text x={rackX + 210 + k * 30} y={unit(4) + 26} textAnchor="middle" fontSize="4.5" fill="#fca5a5" style={mono}>{l}</text>
              </g>
            ))}
            <rect x={rackX + W - 30} y={unit(4) + 10} width="14" height="10" rx="1" fill="#22c55e" opacity="0.8" />
          </g>
        </Hot>
        {/* server 1U x2 */}
        <Hot id="server" active={active} set={setActive} label={items.server[0]}>
          <g>
            {[6, 7].map((n, s) => (
              <g key={n}>
                <rect x={rackX} y={unit(n)} width={W} height={U - 4} rx="2" fill="url(#hw-alu)" stroke="#6b7480" />
                {Array.from({ length: 8 }, (_, i) => (
                  <g key={i}>
                    <rect x={rackX + 12 + i * 46} y={unit(n) + 4} width="40" height="22" rx="1.5" fill="#1f2328" stroke="#0b0c0e" />
                    {Array.from({ length: 5 }, (_, k) => <path key={k} d={`M${rackX + 16 + i * 46} ${unit(n) + 8 + k * 3.5} H${rackX + 46 + i * 46}`} stroke="#3b4048" strokeWidth="1" />)}
                    <circle cx={rackX + 47 + i * 46} cy={unit(n) + 8} r="1.5" fill="#22c55e">{blink(i + s * 9)}</circle>
                  </g>
                ))}
                <circle cx={rackX + W - 24} cy={unit(n) + 15} r="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
              </g>
            ))}
          </g>
        </Hot>
        {/* UPS 2U */}
        <Hot id="ups" active={active} set={setActive} label={items.ups[0]}>
          <g>
            <rect x={rackX} y={unit(9)} width={W} height={U * 2 - 4} rx="2" fill="#16181c" stroke="#30343a" />
            {Array.from({ length: 30 }, (_, i) => <rect key={i} x={rackX + 20 + i * 12} y={unit(9) + 12} width="6" height="40" rx="2" fill="#0b0c0e" />)}
            <rect x={rackX + 400} y={unit(9) + 16} width="120" height="30" rx="3" fill="#0b1220" stroke="#334155" />
            <text x={rackX + 460} y={unit(9) + 30} textAnchor="middle" fontSize="7" fill="#22d3ee" style={mono}>ON LINE · 100%</text>
            <text x={rackX + 460} y={unit(9) + 40} textAnchor="middle" fontSize="6" fill="#94a3b8" style={mono}>{tr('runtime 18 min', 'autonomie 18 min')}</text>
          </g>
        </Hot>
        {/* U numbering */}
        {Array.from({ length: 11 }, (_, i) => <text key={i} x={rackX - 34} y={unit(i) + 18} fontSize="6" fill="#4b5563" style={mono} textAnchor="end">{11 - i}U</text>)}
      </svg>
      <Caption items={items} active={active} />
    </div>
  )
}
