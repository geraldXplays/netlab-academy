/**
 * Animated examples — Level 2, batch 2: switching, ARP, routing, VLANs, trunks, STP.
 */
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { t } from '@/content/lessons/types'
import { C, T, type AnimSpec } from './Player'

/* ------------------------------ tiny device icons ------------------------------ */

function Pc({ x, y, label, sub, hi }: { x: number; y: number; label: string; sub?: string; hi?: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-22} y={-20} width={44} height={30} rx={4} fill="#1e293b" stroke={hi ?? '#64748b'} strokeWidth={hi ? 2.2 : 1.2} />
      <rect x={-18} y={-16} width={36} height={22} rx={2} fill={hi ? 'rgb(var(--cyan-rgb) / 0.35)' : '#0f3b57'} />
      <rect x={-6} y={10} width={12} height={5} fill="#475569" />
      <rect x={-14} y={15} width={28} height={3} rx={1.5} fill="#64748b" />
      <T x={0} y={34} size={12} weight={700}>{label}</T>
      {sub && <T x={0} y={48} size={9.5} fill={C.dim} mono>{sub}</T>}
    </g>
  )
}

function Switch({ x, y, label, ports = 4, lit = [] as number[], w = 150 }: { x: number; y: number; label: string; ports?: number; lit?: number[]; w?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={-w / 2} y={-16} width={w} height={32} rx={5} fill="url(#sw-grad)" stroke="#334155" />
      <defs>
        <linearGradient id="sw-grad" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3b4a63" /><stop offset="1" stopColor="#1e293b" /></linearGradient>
      </defs>
      {Array.from({ length: ports }, (_, i) => {
        const px = -w / 2 + 14 + i * ((w - 28) / Math.max(1, ports - 1))
        return (
          <g key={i}>
            <rect x={px - 7} y={-7} width={14} height={12} rx={1.5} fill="#0b1220" stroke="#64748b" strokeWidth={0.8} />
            <circle cx={px} cy={-11} r={2.2} fill={lit.includes(i) ? '#22c55e' : '#334155'} />
          </g>
        )
      })}
      <T x={0} y={34} size={12} weight={700}>{label}</T>
    </g>
  )
}

function Router({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx={0} cy={6} rx={34} ry={11} fill="#1e3a5f" />
      <rect x={-34} y={-8} width={68} height={14} fill="#2563eb" />
      <ellipse cx={0} cy={-8} rx={34} ry={11} fill="#3b82f6" stroke="#93c5fd" strokeWidth={0.8} />
      <path d="M-14 -8 h28 M8 -12 l6 4 -6 4 M-14 -8 m0 0 M-8 -12 l-6 4 6 4" stroke="#fff" strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <T x={0} y={30} size={12} weight={700}>{label}</T>
    </g>
  )
}

/** A frame/packet token travelling along a path. */
function Token({ path, color, label, dur = 1.1, delay = 0 }: { path: [number, number][]; color: string; label?: string; dur?: number; delay?: number }) {
  return (
    <motion.g initial={{ x: path[0][0], y: path[0][1], opacity: 0 }} animate={{ x: path.map((p) => p[0]), y: path.map((p) => p[1]), opacity: [0, 1, ...Array(Math.max(0, path.length - 2)).fill(1), 1] }} transition={{ duration: dur, delay, ease: 'easeInOut' }}>
      <rect x={-17} y={-9} width={34} height={18} rx={5} fill={color} fillOpacity={0.9} filter="url(#an-glow)" />
      {label && <T x={0} y={4} size={9} weight={700} fill="#0b1220" mono>{label}</T>}
    </motion.g>
  )
}

function Wire({ d, on = false, color = C.dim, dashed }: { d: string; on?: boolean; color?: string; dashed?: boolean }) {
  return <motion.path d={d} fill="none" initial={false} animate={{ stroke: on ? color : '#475569', strokeWidth: on ? 3 : 1.8 }} strokeDasharray={dashed ? '6 5' : undefined} />
}

function Table({ x, y, title, head, rows, hi }: { x: number; y: number; title: string; head: string[]; rows: string[][]; hi?: number }) {
  const cw = 92
  return (
    <g transform={`translate(${x} ${y})`}>
      <T x={0} y={0} size={11.5} anchor="start" weight={700} fill={C.cyan}>{title}</T>
      <rect x={-4} y={8} width={head.length * cw + 8} height={22 + Math.max(1, rows.length) * 20} rx={8} fill="rgb(var(--cyan-rgb) / 0.05)" stroke={C.line} />
      {head.map((h, i) => <T key={h} x={6 + i * cw} y={24} size={10} anchor="start" fill={C.dim} weight={700}>{h}</T>)}
      <AnimatePresence>
        {rows.map((r, k) => (
          <motion.g key={r.join('|')} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }}>
            {hi === k && <rect x={0} y={30 + k * 20} width={head.length * cw} height={18} rx={4} fill="rgb(34 197 94 / 0.18)" />}
            {r.map((c, i) => <T key={i} x={6 + i * cw} y={43 + k * 20} size={10.5} anchor="start" mono fill={hi === k ? C.success : C.text}>{c}</T>)}
          </motion.g>
        ))}
      </AnimatePresence>
      {!rows.length && <T x={6} y={43} size={10.5} anchor="start" fill={C.dim}>(empty)</T>}
    </g>
  )
}

const Frame = ({ children }: { children: ReactNode }) => <g>{children}</g>

/* ============================ MAC learning ============================ */

export const macLearning = (fr: boolean): AnimSpec => {
  const pcs = [
    { n: 'PC-A', mac: 'AAAA', x: 110 },
    { n: 'PC-B', mac: 'BBBB', x: 290 },
    { n: 'PC-C', mac: 'CCCC', x: 470 },
    { n: 'PC-D', mac: 'DDDD', x: 650 },
  ]
  const SW = { x: 380, y: 110 }
  const port = (i: number) => SW.x - 75 + 14 + i * ((150 - 28) / 3)
  const toPc = (i: number): [number, number][] => [[port(i), SW.y + 8], [port(i), 190], [pcs[i].x, 190], [pcs[i].x, 250]]
  const fromPc = (i: number): [number, number][] => [[pcs[i].x, 250], [pcs[i].x, 190], [port(i), 190], [port(i), SW.y + 8]]
  return {
    viewBox: '0 0 760 420',
    pace: 3300,
    steps: [
      t('A switch starts with an EMPTY MAC address table. PC-A sends a frame to PC-C (destination MAC CCCC).', 'Un switch démarre avec une table MAC VIDE. PC-A envoie une trame à PC-C (MAC destination CCCC).'),
      t('LEARN: the frame came in on port 1 from source AAAA → the switch writes "AAAA is on port 1".', 'APPRENDRE : la trame arrive sur le port 1 avec la source AAAA → le switch note « AAAA est sur le port 1 ».'),
      t('FLOOD: CCCC is unknown, so the switch copies the frame out of every other port. B and D ignore it (not their MAC).', 'INONDER : CCCC est inconnue, le switch copie la trame sur tous les autres ports. B et D l’ignorent (pas leur MAC).'),
      t('PC-C replies. The switch learns "CCCC is on port 3" and already knows AAAA → it FORWARDS only to port 1.', 'PC-C répond. Le switch apprend « CCCC est sur le port 3 » et connaît déjà AAAA → il TRANSMET uniquement vers le port 1.'),
      t('From now on A ↔ C traffic goes only between ports 1 and 3. Entries age out after 300 s of silence.', 'Désormais le trafic A ↔ C ne passe qu’entre les ports 1 et 3. Les entrées expirent après 300 s de silence.'),
    ],
    render: (step) => {
      const table: string[][] = []
      if (step >= 1) table.push(['AAAA', 'Fa0/1', '300'])
      if (step >= 3) table.push(['CCCC', 'Fa0/3', '300'])
      return (
        <Frame>
          <Switch x={SW.x} y={SW.y} label="SW1" lit={[0, 1, 2, 3]} />
          {pcs.map((p, i) => (
            <g key={p.n}>
              <Wire d={`M${port(i)} ${SW.y + 8} V190 H${p.x} V230`} on={(step === 0 && i === 0) || (step === 2 && i !== 0) || (step >= 3 && (i === 0 || i === 2))} color={step === 2 ? C.warning : C.cyan} />
              <Pc x={p.x} y={250} label={p.n} sub={p.mac} hi={(step >= 3 && (i === 0 || i === 2)) ? C.success : step === 2 && i === 2 ? C.cyan : undefined} />
              <T x={port(i)} y={SW.y - 22} size={9.5} fill={C.dim} mono>{i + 1}</T>
            </g>
          ))}
          <AnimatePresence>
            {step === 0 && <Token key="s0" path={fromPc(0)} color={C.cyan} label="→C" />}
            {step === 2 && [1, 2, 3].map((i) => <Token key={`f${i}`} path={toPc(i)} color={C.warning} label="→C" />)}
            {step === 3 && <Token key="s3a" path={[...fromPc(2), ...toPc(0)]} color={C.success} label="→A" dur={1.8} />}
            {step === 4 && <Token key="s4" path={[...fromPc(0), ...toPc(2)]} color={C.cyan} label="→C" dur={1.8} />}
          </AnimatePresence>
          {step === 2 && [1, 3].map((i) => <motion.text key={`x${i}`} x={pcs[i].x + 28} y={238} fontSize={18} fill={C.danger} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>✕</motion.text>)}
          <Table x={470} y={340} title={fr ? 'Table d’adresses MAC — SW1' : 'MAC address table — SW1'} head={['MAC', 'Port', fr ? 'Âge (s)' : 'Age (s)']} rows={table} hi={step === 1 ? 0 : step === 3 ? 1 : undefined} />
          <T x={30} y={360} size={13} anchor="start" weight={700} fill={step === 2 ? C.warning : step === 1 || step === 3 ? C.success : C.cyan}>
            {[fr ? 'Trame A → C' : 'Frame A → C', fr ? '1. Apprendre' : '1. Learn', fr ? '2. Inonder (inconnue)' : '2. Flood (unknown)', fr ? '3. Apprendre + transmettre' : '3. Learn + forward', fr ? '4. Transmission directe' : '4. Direct forwarding'][step]}
          </T>
        </Frame>
      )
    },
  }
}

/* ============================ ARP ============================ */

export const arpAnim = (fr: boolean): AnimSpec => {
  const pcs = [
    { n: 'PC1', ip: '192.168.1.10', mac: 'aa:aa', x: 120 },
    { n: 'PC2', ip: '192.168.1.20', mac: 'bb:bb', x: 380 },
    { n: 'PC3', ip: '192.168.1.30', mac: 'cc:cc', x: 640 },
  ]
  const sw = { x: 380, y: 90 }
  const p = (i: number) => sw.x - 75 + 14 + i * 61
  const up = (i: number): [number, number][] => [[pcs[i].x, 240], [pcs[i].x, 170], [p(i), 170], [p(i), sw.y + 8]]
  const down = (i: number): [number, number][] => [[p(i), sw.y + 8], [p(i), 170], [pcs[i].x, 170], [pcs[i].x, 240]]
  return {
    viewBox: '0 0 760 400',
    pace: 3300,
    steps: [
      t('PC1 wants to ping 192.168.1.30. Same subnet — but Ethernet needs a MAC address, and PC1 only knows the IP.', 'PC1 veut pinguer 192.168.1.30. Même sous-réseau — mais Ethernet a besoin d’une MAC, et PC1 ne connaît que l’IP.'),
      t('ARP REQUEST — broadcast to ff:ff:ff:ff:ff:ff: "Who has 192.168.1.30? Tell 192.168.1.10."', 'REQUÊTE ARP — diffusion vers ff:ff:ff:ff:ff:ff : « Qui a 192.168.1.30 ? Répondez à 192.168.1.10. »'),
      t('Every host receives it. PC2 ignores it; PC3 recognises its own IP.', 'Tous les hôtes la reçoivent. PC2 l’ignore ; PC3 reconnaît sa propre IP.'),
      t('ARP REPLY — unicast back to PC1: "192.168.1.30 is at cc:cc". PC3 also caches PC1’s MAC.', 'RÉPONSE ARP — en unicast vers PC1 : « 192.168.1.30 est à cc:cc ». PC3 mémorise aussi la MAC de PC1.'),
      t('PC1 stores it in its ARP cache (arp -a) and can now send the ping frame directly to cc:cc.', 'PC1 l’enregistre dans son cache ARP (arp -a) et peut maintenant envoyer la trame du ping directement à cc:cc.'),
    ],
    render: (step) => (
      <Frame>
        <Switch x={sw.x} y={sw.y} label="SW1" ports={3} lit={[0, 1, 2]} />
        {pcs.map((pc, i) => (
          <g key={pc.n}>
            <Wire d={`M${p(i)} ${sw.y + 8} V170 H${pc.x} V222`} on={step === 1 || step === 2 ? true : step >= 3 ? i !== 1 : i === 0} color={step <= 2 ? C.warning : C.success} />
            <Pc x={pc.x} y={240} label={pc.n} sub={`${pc.ip} · ${pc.mac}`} hi={step === 2 && i === 2 ? C.success : undefined} />
          </g>
        ))}
        <AnimatePresence>
          {step === 1 && <Token key="b0" path={up(0)} color={C.warning} label="ARP?" />}
          {step === 2 && [1, 2].map((i) => <Token key={`b${i}`} path={down(i)} color={C.warning} label="ARP?" />)}
          {step === 3 && <Token key="r" path={[...up(2), ...down(0)]} color={C.success} label="ARP!" dur={1.8} />}
          {step === 4 && <Token key="ping" path={[...up(0), ...down(2)]} color={C.cyan} label="ICMP" dur={1.8} />}
        </AnimatePresence>
        {step === 2 && <motion.text x={pcs[1].x + 30} y={228} fontSize={18} fill={C.danger} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>✕</motion.text>}
        <AnimatePresence mode="wait">
          {(step === 1 || step === 2) && (
            <motion.g key="q" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x={170} y={296} width={420} height={40} rx={10} fill="rgb(245 158 11 / 0.1)" stroke={C.warning} />
              <T x={380} y={321} size={12.5} fill={C.warning} mono>{fr ? 'Qui a 192.168.1.30 ? → ff:ff:ff:ff:ff:ff' : 'Who has 192.168.1.30? → ff:ff:ff:ff:ff:ff'}</T>
            </motion.g>
          )}
          {step === 3 && (
            <motion.g key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <rect x={170} y={296} width={420} height={40} rx={10} fill="rgb(34 197 94 / 0.1)" stroke={C.success} />
              <T x={380} y={321} size={12.5} fill={C.success} mono>{fr ? '192.168.1.30 est à cc:cc → aa:aa' : '192.168.1.30 is at cc:cc → aa:aa'}</T>
            </motion.g>
          )}
        </AnimatePresence>
        {step >= 4 && <Table x={40} y={300} title={fr ? 'Cache ARP de PC1' : 'PC1 ARP cache'} head={[fr ? 'Adresse IP' : 'IP address', 'MAC', 'Type']} rows={[['192.168.1.30', 'cc:cc', fr ? 'dynamique' : 'dynamic']]} hi={0} />}
      </Frame>
    ),
  }
}

/* ============================ Routing table lookup ============================ */

export const routeLookup = (fr: boolean): AnimSpec => {
  const routes = [
    ['10.0.0.0/8', 'Gi0/0/2', '172.16.0.2'],
    ['10.2.0.0/16', 'Gi0/0/1', '172.16.1.2'],
    ['10.2.5.0/24', 'Gi0/0/1', '172.16.1.2'],
    ['0.0.0.0/0', 'Gi0/0/0', '203.0.113.1'],
  ]
  return {
    viewBox: '0 0 760 380',
    pace: 3400,
    steps: [
      t('A packet for 10.2.5.9 arrives at R1. The router strips the Ethernet frame and reads the destination IP.', 'Un paquet pour 10.2.5.9 arrive sur R1. Le routeur retire la trame Ethernet et lit l’IP de destination.'),
      t('It checks every route. 10.0.0.0/8 matches, 10.2.0.0/16 matches, 10.2.5.0/24 matches, the default route matches everything.', 'Il compare chaque route. 10.0.0.0/8 correspond, 10.2.0.0/16 aussi, 10.2.5.0/24 aussi, la route par défaut correspond à tout.'),
      t('LONGEST PREFIX MATCH: the most specific route wins → 10.2.5.0/24 (24 bits match).', 'CORRESPONDANCE LA PLUS LONGUE : la route la plus précise gagne → 10.2.5.0/24 (24 bits correspondent).'),
      t('R1 decrements the TTL, builds a NEW Ethernet frame for the next hop 172.16.1.2 and sends it out Gi0/0/1.', 'R1 décrémente le TTL, construit une NOUVELLE trame Ethernet vers le saut suivant 172.16.1.2 et l’envoie par Gi0/0/1.'),
      t('A packet for 8.8.8.8 matches nothing specific → it follows the default route (gateway of last resort) to the ISP.', 'Un paquet pour 8.8.8.8 ne correspond à rien de précis → il suit la route par défaut (passerelle de dernier recours) vers le FAI.'),
    ],
    render: (step) => {
      const matches = step === 1 ? [0, 1, 2, 3] : step === 2 || step === 3 ? [2] : step === 4 ? [3] : []
      const outY = step === 4 ? 70 : 170
      return (
        <Frame>
          <Router x={150} y={170} label="R1" />
          <Wire d="M184 166 L 300 70" on={step === 4} color={C.purple} />
          <Wire d="M184 170 L 300 170" on={step === 3} color={C.success} />
          <Wire d="M184 174 L 300 270" />
          <T x={312} y={74} size={11} anchor="start" fill={C.dim} mono>Gi0/0/0 → ISP</T>
          <T x={312} y={174} size={11} anchor="start" fill={C.dim} mono>Gi0/0/1 → R2 (10.2.x)</T>
          <T x={312} y={274} size={11} anchor="start" fill={C.dim} mono>Gi0/0/2 → R3 (10.x)</T>
          <AnimatePresence>
            {step === 0 && <Token key="in" path={[[20, 170], [110, 170]]} color={C.cyan} label="10.2.5.9" dur={0.9} />}
            {step === 3 && <Token key="out" path={[[190, 170], [300, outY]]} color={C.success} label="10.2.5.9" />}
            {step === 4 && <Token key="def" path={[[20, 170], [120, 170], [190, 166], [300, 70]]} color={C.purple} label="8.8.8.8" dur={1.6} />}
          </AnimatePresence>
          <g transform="translate(470 40)">
            <T x={0} y={0} size={12} anchor="start" weight={700} fill={C.cyan}>{fr ? 'Table de routage R1' : 'R1 routing table'}</T>
            <rect x={-6} y={10} width={286} height={128} rx={10} fill="rgb(var(--cyan-rgb) / 0.05)" stroke={C.line} />
            {routes.map((r, i) => {
              const m = matches.includes(i)
              const win = (step >= 2 && step <= 3 && i === 2) || (step === 4 && i === 3)
              return (
                <g key={i}>
                  <motion.rect x={0} y={20 + i * 28} width={274} height={24} rx={6} initial={false} animate={{ fill: win ? 'rgb(34 197 94 / 0.22)' : m ? 'rgb(245 158 11 / 0.14)' : 'rgba(0,0,0,0)' }} />
                  <T x={8} y={37 + i * 28} size={11} anchor="start" mono fill={win ? C.success : C.text}>{r[0]}</T>
                  <T x={120} y={37 + i * 28} size={11} anchor="start" mono fill={C.muted}>{r[1]}</T>
                  <T x={190} y={37 + i * 28} size={10.5} anchor="start" mono fill={C.dim}>{r[2]}</T>
                </g>
              )
            })}
          </g>
          <AnimatePresence mode="wait">
            {step >= 1 && step <= 3 && (
              <motion.g key="calc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <T x={470} y={212} size={11.5} anchor="start" fill={C.muted}>{fr ? 'Destination' : 'Destination'} 10.2.5.9</T>
                <T x={470} y={234} size={11} anchor="start" mono fill={C.dim}>/8  → {fr ? '8 bits identiques' : '8 bits match'}</T>
                <T x={470} y={252} size={11} anchor="start" mono fill={C.dim}>/16 → {fr ? '16 bits identiques' : '16 bits match'}</T>
                <T x={470} y={270} size={11} anchor="start" mono fill={step >= 2 ? C.success : C.dim} weight={step >= 2 ? 700 : 500}>/24 → {fr ? '24 bits identiques  ✔ gagnante' : '24 bits match  ✔ winner'}</T>
              </motion.g>
            )}
          </AnimatePresence>
          {step === 3 && <T x={150} y={240} size={11} fill={C.warning} mono>TTL 64 → 63</T>}
        </Frame>
      )
    },
  }
}

/* ============================ VLAN tagging over a trunk ============================ */

export const vlanTag = (fr: boolean): AnimSpec => {
  const S1 = { x: 220, y: 150 }
  const S2 = { x: 540, y: 150 }
  const left = [{ n: 'Sales-1', v: 10, x: 110 }, { n: 'HR-1', v: 20, x: 300 }]
  const right = [{ n: 'Sales-2', v: 10, x: 450 }, { n: 'HR-2', v: 20, x: 650 }]
  const vc = (v: number) => (v === 10 ? C.cyan : C.purple)
  return {
    viewBox: '0 0 760 400',
    pace: 3300,
    steps: [
      t('Two switches, two VLANs: 10 (Sales, blue) and 20 (HR, purple). One cable between the switches carries BOTH: a trunk.', 'Deux switches, deux VLAN : 10 (Commercial, bleu) et 20 (RH, violet). Un seul câble entre les switches transporte LES DEUX : un trunk.'),
      t('Sales-1 sends a frame. Its access port is in VLAN 10 — the PC itself knows nothing about VLANs.', 'Sales-1 envoie une trame. Son port d’accès est dans le VLAN 10 — le PC lui-même ne sait rien des VLAN.'),
      t('Leaving on the trunk, SW1 inserts an 802.1Q TAG (4 bytes) saying "VLAN 10".', 'En sortant sur le trunk, SW1 insère une ÉTIQUETTE 802.1Q (4 octets) indiquant « VLAN 10 ».'),
      t('SW2 reads the tag, removes it, and delivers the frame only to VLAN 10 ports → Sales-2. HR-2 never sees it.', 'SW2 lit l’étiquette, la retire et ne livre la trame qu’aux ports du VLAN 10 → Sales-2. HR-2 ne la voit jamais.'),
      t('A broadcast from HR-1 (VLAN 20) is tagged 20 and stays inside VLAN 20. Each VLAN is its own broadcast domain.', 'Un broadcast de HR-1 (VLAN 20) est étiqueté 20 et reste dans le VLAN 20. Chaque VLAN est son propre domaine de diffusion.'),
    ],
    render: (step) => {
      const blue = step >= 1 && step <= 3
      const purple = step === 4
      return (
        <Frame>
          <Switch x={S1.x} y={S1.y} label="SW1" ports={3} lit={[0, 1, 2]} />
          <Switch x={S2.x} y={S2.y} label="SW2" ports={3} lit={[0, 1, 2]} />
          <Wire d={`M${S1.x + 75} ${S1.y} H${S2.x - 75}`} on={step >= 2 && step !== 1} color={purple ? C.purple : C.cyan} />
          <motion.path d={`M${S1.x + 75} ${S1.y - 4} H${S2.x - 75}`} stroke={C.purple} strokeWidth={step === 0 ? 3 : 0} strokeDasharray="10 10" fill="none" />
          <motion.path d={`M${S1.x + 75} ${S1.y + 4} H${S2.x - 75}`} stroke={C.cyan} strokeWidth={step === 0 ? 3 : 0} strokeDasharray="10 10" strokeDashoffset={10} fill="none" />
          <T x={380} y={S1.y - 18} size={11.5} weight={700} fill={C.warning}>{fr ? 'TRUNK 802.1Q' : '802.1Q TRUNK'}</T>
          {[...left.map((h) => ({ ...h, sw: S1, side: 0 })), ...right.map((h) => ({ ...h, sw: S2, side: 1 }))].map((h, i) => {
            const px = h.sw.x - 75 + 14 + (h.v === 10 ? 0 : 1) * 61
            const on = (blue && h.v === 10 && (h.side === 0 ? step >= 1 : step >= 3)) || (purple && h.v === 20)
            return (
              <g key={i}>
                <Wire d={`M${px} ${h.sw.y + 8} V230 H${h.x} V262`} on={on} color={vc(h.v)} />
                <rect x={h.x - 30} y={322} width={60} height={16} rx={8} fill={vc(h.v)} fillOpacity={0.18} stroke={vc(h.v)} />
                <T x={h.x} y={334} size={9.5} weight={700} fill={vc(h.v)} mono>VLAN {h.v}</T>
                <Pc x={h.x} y={282} label={h.n} hi={on ? vc(h.v) : undefined} />
              </g>
            )
          })}
          <AnimatePresence>
            {step === 1 && <Token key="a" path={[[110, 262], [110, 230], [159, 230], [159, 158]]} color={C.cyan} label="frame" />}
            {step === 2 && (
              <motion.g key="tag" initial={{ x: 300, y: 150 }} animate={{ x: [300, 460] }} transition={{ duration: 1.6, ease: 'easeInOut' }}>
                <rect x={-34} y={-12} width={30} height={24} rx={4} fill={C.warning} />
                <T x={-19} y={4} size={9} weight={700} fill="#0b1220" mono>10</T>
                <rect x={-2} y={-12} width={40} height={24} rx={4} fill={C.cyan} />
                <T x={18} y={4} size={9} weight={700} fill="#0b1220" mono>frame</T>
              </motion.g>
            )}
            {step === 3 && <Token key="b" path={[[479, 158], [479, 230], [450, 230], [450, 262]]} color={C.cyan} label="frame" />}
            {step === 4 && (
              <g key="bc">
                <Token path={[[300, 262], [300, 230], [220, 230], [220, 158]]} color={C.purple} label="bcast" />
                <motion.g initial={{ x: 300, y: 150, opacity: 0 }} animate={{ x: [300, 460], opacity: [0, 1, 1] }} transition={{ duration: 1.4, delay: 1.1 }}>
                  <rect x={-34} y={-12} width={30} height={24} rx={4} fill={C.warning} />
                  <T x={-19} y={4} size={9} weight={700} fill="#0b1220" mono>20</T>
                  <rect x={-2} y={-12} width={40} height={24} rx={4} fill={C.purple} />
                </motion.g>
                <Token path={[[540, 158], [540, 230], [650, 230], [650, 262]]} color={C.purple} label="bcast" delay={2.5} />
              </g>
            )}
          </AnimatePresence>
          {step === 2 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <T x={380} y={100} size={11} fill={C.muted} mono>[ dst MAC | src MAC | 802.1Q tag: VLAN 10 | type | data | FCS ]</T>
            </motion.g>
          )}
        </Frame>
      )
    },
  }
}

/* ============================ Router on a stick ============================ */

export const routerOnStick = (_fr: boolean): AnimSpec => ({
  viewBox: '0 0 760 400',
  pace: 3300,
  steps: [
    t('PCs in VLAN 10 and VLAN 20 cannot talk directly — different VLANs = different subnets. They need a router.', 'Les PC des VLAN 10 et 20 ne peuvent pas se parler directement — VLAN différents = sous-réseaux différents. Il faut un routeur.'),
    t('One router interface, split into SUB-INTERFACES: Gi0/0.10 (192.168.10.1, VLAN 10) and Gi0/0.20 (192.168.20.1, VLAN 20). The switch link is a trunk.', 'Une seule interface de routeur, découpée en SOUS-INTERFACES : Gi0/0.10 (192.168.10.1, VLAN 10) et Gi0/0.20 (192.168.20.1, VLAN 20). Le lien vers le switch est un trunk.'),
    t('PC-10 sends to 192.168.20.5 → off-subnet → to its gateway 192.168.10.1. The frame goes UP the trunk tagged 10.', 'PC-10 envoie à 192.168.20.5 → hors sous-réseau → vers sa passerelle 192.168.10.1. La trame MONTE le trunk étiquetée 10.'),
    t('The router routes it to sub-interface .20 and sends it back DOWN the same cable, tagged 20.', 'Le routeur l’achemine vers la sous-interface .20 et la renvoie en DESCENDANT le même câble, étiquetée 20.'),
    t('The switch delivers it to PC-20. Modern networks often do the same with a Layer 3 switch and SVIs (interface vlan 10).', 'Le switch la livre à PC-20. Les réseaux modernes font souvent la même chose avec un switch de niveau 3 et des SVI (interface vlan 10).'),
  ],
  render: (step) => (
    <Frame>
      <Router x={380} y={60} label="R1" />
      <Switch x={380} y={190} label="SW1" ports={3} lit={[0, 1, 2]} />
      <Wire d="M372 82 V174" on={step >= 2} color={step === 3 || step === 4 ? C.purple : C.cyan} />
      <Wire d="M388 82 V174" on={step >= 3} color={C.purple} />
      <T x={410} y={130} size={10.5} anchor="start" fill={C.warning} weight={700}>trunk</T>
      {step >= 1 && (
        <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <rect x={440} y={30} width={240} height={52} rx={10} fill="rgb(var(--cyan-rgb) / 0.06)" stroke={C.line} />
          <T x={452} y={51} size={11} anchor="start" mono fill={C.cyan}>Gi0/0.10 → 192.168.10.1 (VLAN 10)</T>
          <T x={452} y={70} size={11} anchor="start" mono fill={C.purple}>Gi0/0.20 → 192.168.20.1 (VLAN 20)</T>
        </motion.g>
      )}
      <Wire d="M319 198 V250 H170 V282" on={step === 2} color={C.cyan} />
      <Wire d="M441 198 V250 H590 V282" on={step === 4} color={C.purple} />
      <Pc x={170} y={302} label="PC-10" sub="192.168.10.5 · VLAN 10" hi={step === 2 ? C.cyan : undefined} />
      <Pc x={590} y={302} label="PC-20" sub="192.168.20.5 · VLAN 20" hi={step === 4 ? C.purple : undefined} />
      <AnimatePresence>
        {step === 2 && <Token key="u" path={[[170, 282], [170, 250], [319, 250], [319, 210], [372, 174], [372, 84]]} color={C.cyan} label="tag 10" dur={1.8} />}
        {step === 3 && <Token key="d" path={[[388, 84], [388, 174]]} color={C.purple} label="tag 20" dur={1.1} />}
        {step === 4 && <Token key="l" path={[[441, 206], [441, 250], [590, 250], [590, 282]]} color={C.purple} label="frame" />}
      </AnimatePresence>
    </Frame>
  ),
})

/* ============================ STP ============================ */

export const stpAnim = (fr: boolean): AnimSpec => {
  const A = { x: 380, y: 70 }
  const B = { x: 200, y: 260 }
  const Cc = { x: 560, y: 260 }
  return {
    viewBox: '0 0 760 380',
    pace: 3300,
    steps: [
      t('Three switches cabled in a triangle — redundancy! If one link breaks, another path exists.', 'Trois switches câblés en triangle — de la redondance ! Si un lien casse, un autre chemin existe.'),
      t('But a broadcast is flooded out every port… and comes back around the loop, again and again: a BROADCAST STORM. Ethernet has no TTL — the network collapses in seconds.', 'Mais un broadcast est inondé sur tous les ports… et revient par la boucle, encore et encore : une TEMPÊTE DE DIFFUSION. Ethernet n’a pas de TTL — le réseau s’effondre en quelques secondes.'),
      t('Spanning Tree Protocol (STP) elects a ROOT BRIDGE (lowest bridge ID) — here SW-A.', 'Le Spanning Tree Protocol (STP) élit un PONT RACINE (plus petit identifiant) — ici SW-A.'),
      t('Every other switch keeps its best path to the root, and one port is put in BLOCKING state → the loop is logically broken.', 'Chaque autre switch garde son meilleur chemin vers la racine, et un port passe en état BLOCKING → la boucle est cassée logiquement.'),
      t('If the A–B link fails, STP unblocks the backup port within seconds (RSTP: ~1 s). Redundancy without loops.', 'Si le lien A–B tombe, STP débloque le port de secours en quelques secondes (RSTP : ~1 s). De la redondance sans boucle.'),
    ],
    render: (step) => {
      const ab = step === 4 ? 'down' : 'up'
      const bcBlocked = step === 3
      return (
        <Frame>
          <motion.path d={`M${A.x} ${A.y} L${B.x} ${B.y}`} initial={false} animate={{ stroke: ab === 'down' ? C.danger : step === 1 ? C.danger : C.success, strokeWidth: 3 }} strokeDasharray={ab === 'down' ? '4 6' : undefined} />
          <motion.path d={`M${A.x} ${A.y} L${Cc.x} ${Cc.y}`} initial={false} animate={{ stroke: step === 1 ? C.danger : C.success, strokeWidth: 3 }} />
          <motion.path d={`M${B.x} ${B.y} L${Cc.x} ${Cc.y}`} initial={false} animate={{ stroke: step === 1 ? C.danger : bcBlocked ? C.warning : step === 4 ? C.success : C.success, strokeWidth: 3 }} strokeDasharray={bcBlocked ? '8 6' : undefined} />
          <Switch x={A.x} y={A.y} label={step >= 2 ? (fr ? 'SW-A  (racine)' : 'SW-A  (root)') : 'SW-A'} ports={2} lit={[0, 1]} w={110} />
          <Switch x={B.x} y={B.y} label="SW-B" ports={2} lit={[0, 1]} w={110} />
          <Switch x={Cc.x} y={Cc.y} label="SW-C" ports={2} lit={bcBlocked ? [0] : [0, 1]} w={110} />
          {step >= 2 && <motion.text x={A.x} y={A.y - 30} textAnchor="middle" fontSize={22} initial={{ scale: 0 }} animate={{ scale: 1 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>👑</motion.text>}
          {bcBlocked && (
            <motion.g initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              <circle cx={505} cy={260} r={13} fill={C.warning} />
              <T x={505} y={265} size={13} weight={800} fill="#0b1220">✕</T>
              <T x={505} y={300} size={11} weight={700} fill={C.warning}>BLOCKING</T>
            </motion.g>
          )}
          {step === 4 && <T x={290} y={150} size={18} weight={800} fill={C.danger}>✕</T>}
          {step === 1 && Array.from({ length: 6 }, (_, k) => (
            <motion.circle key={k} r={7} fill={C.danger} filter="url(#an-glow)" initial={{ cx: A.x, cy: A.y }} animate={{ cx: [A.x, B.x, Cc.x, A.x], cy: [A.y, B.y, Cc.y, A.y] }} transition={{ duration: 1.4, delay: k * 0.22, repeat: Infinity, ease: 'linear' }} />
          ))}
          {step === 1 && <T x={380} y={340} size={14} weight={800} fill={C.danger}>{fr ? 'TEMPÊTE DE DIFFUSION — CPU 100 %' : 'BROADCAST STORM — CPU 100%'}</T>}
          {step === 4 && <T x={380} y={340} size={13} weight={700} fill={C.success}>{fr ? 'Port de secours débloqué : B → C → A' : 'Backup port unblocked: B → C → A'}</T>}
        </Frame>
      )
    },
  }
}

/* ============================ Dynamic routing reconvergence ============================ */

export const dynamicRouting = (fr: boolean): AnimSpec => {
  const R = [
    { n: 'R1', x: 120, y: 190 },
    { n: 'R2', x: 380, y: 70 },
    { n: 'R3', x: 380, y: 310 },
    { n: 'R4', x: 640, y: 190 },
  ]
  return {
    viewBox: '0 0 760 380',
    pace: 3300,
    steps: [
      t('Four routers running OSPF. Each one floods its links to the others and builds a complete map of the network.', 'Quatre routeurs sous OSPF. Chacun diffuse ses liens aux autres et construit une carte complète du réseau.'),
      t('Each router computes the shortest path (Dijkstra). R1 → R4 goes via R2 (cost 2 = 1 + 1; via R3 costs 1 + 10 = 11).', 'Chaque routeur calcule le plus court chemin (Dijkstra). R1 → R4 passe par R2 (coût 2 = 1 + 1 ; via R3 le coût est 1 + 10 = 11).'),
      t('The R2–R4 link fails! Hello messages stop, R2 and R4 notice within seconds.', 'Le lien R2–R4 tombe ! Les messages Hello s’arrêtent, R2 et R4 s’en aperçoivent en quelques secondes.'),
      t('They flood the change; every router recalculates. New best path: R1 → R3 → R4. Traffic flows again — no human needed.', 'Ils diffusent le changement ; chaque routeur recalcule. Nouveau meilleur chemin : R1 → R3 → R4. Le trafic repasse — sans intervention humaine.'),
    ],
    render: (step) => {
      const links: [number, number, number][] = [[0, 1, 1], [1, 3, 1], [0, 2, 1], [2, 3, 10]]
      const pathTop = step < 2
      return (
        <Frame>
          {links.map(([a, b, c]) => {
            const down = a === 1 && b === 3 && step >= 2
            const active = step >= 1 && ((pathTop && ((a === 0 && b === 1) || (a === 1 && b === 3))) || (step === 3 && ((a === 0 && b === 2) || (a === 2 && b === 3))))
            return (
              <g key={`${a}${b}`}>
                <motion.line x1={R[a].x} y1={R[a].y} x2={R[b].x} y2={R[b].y} initial={false} animate={{ stroke: down ? C.danger : active ? C.success : '#475569', strokeWidth: active ? 4 : 2 }} strokeDasharray={down ? '5 6' : undefined} />
                <T x={(R[a].x + R[b].x) / 2 + (a === 0 ? -14 : 14)} y={(R[a].y + R[b].y) / 2 + 4} size={11} fill={C.dim} mono>{fr ? 'coût' : 'cost'} {c}</T>
              </g>
            )
          })}
          {R.map((r) => <Router key={r.n} x={r.x} y={r.y} label={r.n} />)}
          {step === 0 && R.map((r, i) => R.filter((_, j) => j !== i && links.some(([a, b]) => (a === i && b === j) || (b === i && a === j))).map((o) => (
            <motion.circle key={`${r.n}${o.n}`} r={4} fill={C.cyan} initial={{ cx: r.x, cy: r.y, opacity: 0 }} animate={{ cx: o.x, cy: o.y, opacity: [0, 1, 0] }} transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }} />
          )))}
          {step === 2 && <T x={510} y={120} size={22} weight={800} fill={C.danger}>✕</T>}
          <AnimatePresence>
            {step === 1 && <Token key="p1" path={[[120, 190], [380, 70], [640, 190]]} color={C.success} label="pkt" dur={1.8} />}
            {step === 3 && <Token key="p2" path={[[120, 190], [380, 310], [640, 190]]} color={C.success} label="pkt" dur={1.8} />}
          </AnimatePresence>
        </Frame>
      )
    },
  }
}
