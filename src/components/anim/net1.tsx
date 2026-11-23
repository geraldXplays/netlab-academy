/**
 * Animated examples — Level 2, batch 1: OSI/TCP-IP, IPv4/IPv6, subnetting.
 */
import { AnimatePresence, motion } from 'motion/react'
import { t } from '@/content/lessons/types'
import { C, T, ease, spring, type AnimSpec } from './Player'

/* ============================ OSI encapsulation ============================ */

const LAYERS = [
  ['7', 'Application'], ['6', 'Presentation'], ['5', 'Session'], ['4', 'Transport'], ['3', 'Network'], ['2', 'Data link'], ['1', 'Physical'],
]
const LAYERS_FR = ['Application', 'Présentation', 'Session', 'Transport', 'Réseau', 'Liaison', 'Physique']
const SEG = {
  ETH: { w: 64, c: C.purple, l: 'ETH' },
  IP: { w: 56, c: C.blue, l: 'IP' },
  TCP: { w: 56, c: C.warning, l: 'TCP' },
  DATA: { w: 120, c: C.success, l: 'GET /' },
  FCS: { w: 40, c: C.purple, l: 'FCS' },
}
type Seg = keyof typeof SEG
const ENC: Seg[][] = [['DATA'], ['TCP', 'DATA'], ['IP', 'TCP', 'DATA'], ['ETH', 'IP', 'TCP', 'DATA', 'FCS']]
const PDU = ['Data', 'Segment', 'Packet', 'Frame', 'Bits']

export const osiEncap = (fr: boolean): AnimSpec => ({
  viewBox: '0 0 760 420',
  pace: 3400,
  steps: [
    t('The browser (layer 7) creates the data: an HTTP request "GET /".', 'Le navigateur (couche 7) crée la donnée : une requête HTTP « GET / ».'),
    t('Transport (layer 4) adds a TCP header with ports — 49152 → 80 (web). The unit is now a SEGMENT.', 'Le transport (couche 4) ajoute un en-tête TCP avec les ports — 49152 → 80 (web). L’unité devient un SEGMENT.'),
    t('Network (layer 3) adds an IP header: source and destination IP addresses. Now it is a PACKET.', 'Le réseau (couche 3) ajoute un en-tête IP : adresses IP source et destination. C’est maintenant un PAQUET.'),
    t('Data link (layer 2) adds an Ethernet header (MAC addresses) and a trailer (FCS checksum). Now it is a FRAME.', 'La liaison (couche 2) ajoute un en-tête Ethernet (adresses MAC) et une fin de trame (FCS). C’est une TRAME.'),
    t('Physical (layer 1) turns the frame into BITS — electrical pulses, light or radio — on the cable.', 'Le physique (couche 1) transforme la trame en BITS — impulsions électriques, lumière ou ondes — sur le câble.'),
    t('The receiver reads the frame: is the destination MAC mine? Is the FCS correct? Then it removes the Ethernet header.', 'Le récepteur lit la trame : la MAC de destination est-elle la mienne ? Le FCS est-il correct ? Puis il retire l’en-tête Ethernet.'),
    t('Layer 3 checks the destination IP, then removes the IP header.', 'La couche 3 vérifie l’IP de destination, puis retire l’en-tête IP.'),
    t('Layer 4 reads port 80 and hands the data to the web server process. Decapsulation complete!', 'La couche 4 lit le port 80 et remet la donnée au processus serveur web. Désencapsulation terminée !'),
  ],
  render: (step) => {
    const encIdx = step <= 4 ? Math.min(step, 3) : step === 5 ? 2 : step === 6 ? 1 : 0
    const segs = ENC[encIdx]
    const rowOf = [0, 3, 4, 5, 6, 5, 4, 0][step]
    const y = 52 + rowOf * 44
    const total = segs.reduce((n, s) => n + SEG[s].w + 3, -3)
    let x = 380 - total / 2
    const pos = segs.map((s) => {
      const p = x
      x += SEG[s].w + 3
      return p
    })
    const sender = step <= 4
    const stack = (sx: number, title: string, active: number | null) => (
      <g>
        <T x={sx + 90} y={24} size={13} weight={700}>{title}</T>
        {LAYERS.map(([n, name], i) => {
          const on = active === i
          return (
            <g key={n}>
              <motion.rect x={sx} y={34 + i * 44} width={180} height={36} rx={9} initial={false} animate={{ fill: on ? 'rgb(var(--cyan-rgb) / 0.22)' : 'rgb(var(--cyan-rgb) / 0.04)', stroke: on ? C.cyan : C.line }} strokeWidth={1.4} transition={{ duration: 0.35 }} />
              <T x={sx + 18} y={57 + i * 44} size={12} fill={C.cyan} mono anchor="start">L{n}</T>
              <T x={sx + 48} y={57 + i * 44} size={12.5} anchor="start" weight={on ? 700 : 500}>{fr ? LAYERS_FR[i] : name}</T>
            </g>
          )
        })}
      </g>
    )
    return (
      <g>
        {stack(10, fr ? 'Émetteur — PC' : 'Sender — PC', sender && step < 4 ? rowOf : step === 4 ? 6 : null)}
        {stack(570, fr ? 'Récepteur — serveur web' : 'Receiver — web server', !sender ? rowOf : step === 4 ? 6 : null)}
        {/* cable */}
        <path d="M190 336 C 290 400, 470 400, 570 336" fill="none" stroke={C.dim} strokeWidth={4} strokeLinecap="round" />
        {step === 4 && Array.from({ length: 12 }, (_, i) => (
          <motion.text key={i} fontSize={13} fill={C.cyan} style={{ fontFamily: "'JetBrains Mono Variable', monospace" }} initial={{ x: 200, y: 370, opacity: 0 }} animate={{ x: [200, 560], y: [356, 382, 356], opacity: [0, 1, 1, 0] }} transition={{ duration: 2.2, delay: i * 0.16, repeat: Infinity, ease: 'linear' }}>
            {(i * 7) % 3 ? '1' : '0'}
          </motion.text>
        ))}
        {/* the PDU */}
        {step !== 4 && (
          <motion.g initial={false} animate={{ y }} transition={{ duration: 0.7, ease }}>
            <AnimatePresence>
              {segs.map((s, i) => (
                <motion.g key={s} initial={{ opacity: 0, scale: 0.4, x: pos[i] }} animate={{ opacity: 1, scale: 1, x: pos[i] }} exit={{ opacity: 0, scale: 0.4, y: -30 }} transition={{ duration: 0.55, ease }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
                  <rect y={-16} width={SEG[s].w} height={32} rx={6} fill={SEG[s].c} fillOpacity={0.22} stroke={SEG[s].c} strokeWidth={1.5} />
                  <T x={SEG[s].w / 2} y={4} size={11.5} weight={700} mono>{SEG[s].l}</T>
                </motion.g>
              ))}
            </AnimatePresence>
            <T x={380} y={34} size={11} fill={C.dim} mono>{PDU[encIdx]}</T>
          </motion.g>
        )}
        {/* arrows from stack to PDU */}
        <motion.path initial={false} animate={{ d: sender ? `M196 ${y} H${380 - total / 2 - 8}` : `M${380 + total / 2 + 8} ${y} H564`, opacity: step === 4 ? 0 : 1 }} stroke={C.cyan} strokeWidth={1.4} strokeDasharray="4 4" fill="none" transition={{ duration: 0.7, ease }} />
        {/* address detail */}
        <AnimatePresence mode="wait">
          <motion.g key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {step === 1 && <T x={380} y={y + 52} size={11.5} fill={C.warning} mono>port 49152 → 80</T>}
            {step === 2 && <T x={380} y={y + 52} size={11.5} fill={C.blue} mono>192.168.1.10 → 93.184.216.34</T>}
            {step === 3 && <T x={380} y={y + 52} size={11.5} fill={C.purple} mono>a4:5e:60:11:22:33 → 00:1a:2b:3c:4d:5e</T>}
          </motion.g>
        </AnimatePresence>
      </g>
    )
  },
})

/* ============================ TCP 3-way handshake ============================ */

export const tcpHandshake = (fr: boolean): AnimSpec => {
  const msgs = [
    { from: 0, l: 'SYN', d: 'seq=100', c: C.cyan },
    { from: 1, l: 'SYN-ACK', d: 'seq=300 ack=101', c: C.purple },
    { from: 0, l: 'ACK', d: 'ack=301', c: C.cyan },
    { from: 0, l: 'DATA', d: 'GET /index.html', c: C.success },
    { from: 1, l: 'DATA', d: '200 OK + page', c: C.success },
    { from: 0, l: 'FIN', d: fr ? 'fin' : 'close', c: C.danger },
  ]
  return {
    viewBox: '0 0 640 420',
    pace: 2800,
    steps: [
      t('Before sending any data, TCP opens a connection. The client sends SYN ("let’s synchronise") with its starting sequence number 100.', 'Avant toute donnée, TCP ouvre une connexion. Le client envoie SYN (« synchronisons-nous ») avec son numéro de séquence initial 100.'),
      t('The server answers SYN-ACK: "I acknowledge 101 (your next byte), and here is my own sequence number 300."', 'Le serveur répond SYN-ACK : « j’accuse réception, j’attends 101 (ton prochain octet), et voici mon numéro de séquence 300. »'),
      t('The client sends ACK 301. Three messages: the connection is ESTABLISHED.', 'Le client envoie ACK 301. Trois messages : la connexion est ÉTABLIE.'),
      t('Now data flows: the browser sends its HTTP request…', 'Les données circulent : le navigateur envoie sa requête HTTP…'),
      t('…and the server replies. Every segment is acknowledged; lost segments are re-sent. That is why TCP is "reliable".', '…et le serveur répond. Chaque segment est acquitté ; les segments perdus sont renvoyés. C’est pourquoi TCP est « fiable ».'),
      t('Finally FIN closes the connection politely. UDP skips all of this — faster, but no guarantee (used for DNS, voice, video).', 'Enfin FIN ferme poliment la connexion. UDP saute tout cela — plus rapide, sans garantie (DNS, voix, vidéo).'),
    ],
    render: (step) => {
      const X = [130, 510]
      return (
        <g>
          {[0, 1].map((i) => (
            <g key={i}>
              <rect x={X[i] - 70} y={12} width={140} height={40} rx={10} fill="rgb(var(--cyan-rgb) / 0.08)" stroke={C.cyan} />
              <T x={X[i]} y={37} size={13} weight={700}>{i ? (fr ? 'Serveur :80' : 'Server :80') : (fr ? 'Client :49152' : 'Client :49152')}</T>
              <line x1={X[i]} y1={52} x2={X[i]} y2={410} stroke={C.line} strokeWidth={2} strokeDasharray="3 5" />
            </g>
          ))}
          {msgs.map((m, i) => {
            if (i > step) return null
            const y1 = 80 + i * 56
            const y2 = y1 + 36
            const a = X[m.from]
            const b = X[1 - m.from]
            return (
              <g key={i}>
                <motion.line x1={a} y1={y1} x2={b} y2={y2} stroke={m.c} strokeWidth={2} markerEnd="url(#an-arrow)" initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: i === step ? 1 : 0.55 }} transition={{ duration: 0.9, ease }} />
                {i === step && (
                  <motion.circle r={7} fill={m.c} filter="url(#an-glow)" initial={{ cx: a, cy: y1 }} animate={{ cx: b, cy: y2 }} transition={{ duration: 0.9, ease }} />
                )}
                <motion.g initial={{ opacity: 0 }} animate={{ opacity: i === step ? 1 : 0.6 }} transition={{ delay: 0.3 }}>
                  <T x={320} y={(y1 + y2) / 2 - 8} size={13} weight={700} fill={m.c} mono>{m.l}</T>
                  <T x={320} y={(y1 + y2) / 2 + 26} size={10.5} fill={C.dim} mono>{m.d}</T>
                </motion.g>
              </g>
            )
          })}
          {step >= 2 && (
            <motion.g initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
              <rect x={30} y={186} width={86} height={22} rx={11} fill="rgb(34 197 94 / 0.15)" stroke={C.success} />
              <T x={73} y={201} size={10} fill={C.success} weight={700} mono>ESTABLISHED</T>
            </motion.g>
          )}
        </g>
      )
    },
  }
}

/* ============================ IPv6 compression ============================ */

const FULL = ['2001', '0db8', '0000', '0000', '0000', 'ff00', '0042', '8329']

export const ipv6Compress = (fr: boolean): AnimSpec => ({
  viewBox: '0 0 760 300',
  pace: 3600,
  steps: [
    t('An IPv6 address is 128 bits, written as 8 groups of 4 hexadecimal digits (16 bits each).', 'Une adresse IPv6 fait 128 bits, écrits en 8 groupes de 4 chiffres hexadécimaux (16 bits chacun).'),
    t('Rule 1: remove leading zeros in each group. 0db8 → db8, 0000 → 0, 0042 → 42.', 'Règle 1 : supprimer les zéros de tête dans chaque groupe. 0db8 → db8, 0000 → 0, 0042 → 42.'),
    t('Rule 2: replace ONE run of consecutive all-zero groups with "::".', 'Règle 2 : remplacer UNE suite de groupes entièrement nuls par « :: ».'),
    t('Result: 2001:db8::ff00:42:8329. "::" may appear only once — otherwise you could not know how many zeros it hides.', 'Résultat : 2001:db8::ff00:42:8329. « :: » n’apparaît qu’une fois — sinon on ne saurait pas combien de zéros il cache.'),
    t('The first 64 bits are usually the network prefix (/64), the last 64 bits the interface ID.', 'Les 64 premiers bits sont en général le préfixe réseau (/64), les 64 derniers l’identifiant d’interface.'),
  ],
  render: (step) => {
    const shown = FULL.map((g) => (step >= 1 ? g.replace(/^0+(?=.)/, '') : g))
    const hidden = step >= 2 ? [2, 3, 4] : []
    const W = step >= 1 ? 72 : 82
    const visible = shown.map((g, i) => ({ g, i })).filter((x) => !hidden.includes(x.i))
    const total = visible.length * W + (visible.length - 1) * 12 + (step >= 2 ? 22 : 0)
    let x = 380 - total / 2
    const layout: Record<number, number> = {}
    for (const v of visible) {
      layout[v.i] = x
      x += W + 12
      if (step >= 2 && v.i === 1) x += 22
    }
    return (
      <g>
        <T x={380} y={34} size={13} fill={C.dim}>{fr ? '128 bits = 8 × 16 bits' : '128 bits = 8 × 16 bits'}</T>
        {FULL.map((_, i) => {
          const gone = hidden.includes(i)
          const px = layout[i] ?? layout[1] + W + 20
          const prefix = step >= 4 && i < 4
          return (
            <motion.g key={i} initial={false} animate={{ x: px, opacity: gone ? 0 : 1, scale: gone ? 0.3 : 1 }} transition={{ duration: 0.7, ease }}>
              <motion.rect y={110} width={W} height={56} rx={10} initial={false} animate={{ fill: prefix ? 'rgb(var(--purple-rgb) / 0.18)' : step >= 4 ? 'rgb(var(--cyan-rgb) / 0.12)' : shown[i] === '0' ? 'rgb(245 158 11 / 0.14)' : 'rgb(var(--cyan-rgb) / 0.08)', stroke: prefix ? C.purple : shown[i] === '0' && step < 4 ? C.warning : C.cyan }} strokeWidth={1.5} />
              <T x={W / 2} y={145} size={20} weight={700} mono>{shown[i]}</T>
              <T x={W / 2} y={190} size={10} fill={C.dim} mono>{i * 16}–{i * 16 + 15}</T>
            </motion.g>
          )
        })}
        {visible.slice(0, -1).map((v) => (
          <motion.g key={`c${v.i}`} initial={false} animate={{ x: layout[v.i] + W + 1 }} transition={{ duration: 0.7, ease }}>
            <T x={step >= 2 && v.i === 1 ? 16 : 5} y={145} size={20} weight={700} fill={step >= 2 && v.i === 1 ? C.warning : C.muted} mono>{step >= 2 && v.i === 1 ? '::' : ':'}</T>
          </motion.g>
        ))}
        <AnimatePresence>
          {step >= 3 && (
            <motion.g initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <rect x={190} y={226} width={380} height={44} rx={12} fill="rgb(34 197 94 / 0.1)" stroke={C.success} />
              <T x={380} y={254} size={18} weight={700} fill={C.success} mono>{step >= 4 ? '2001:db8:0:0 | :ff00:42:8329' : '2001:db8::ff00:42:8329'}</T>
            </motion.g>
          )}
        </AnimatePresence>
        {step >= 4 && (
          <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <T x={layout[0] + 2 * W} y={92} size={12} fill={C.purple} weight={700}>{fr ? 'préfixe /64 (réseau)' : '/64 prefix (network)'}</T>
            <T x={layout[5] + 1.5 * W} y={92} size={12} fill={C.cyan} weight={700}>{fr ? 'ID d’interface' : 'interface ID'}</T>
          </motion.g>
        )}
      </g>
    )
  },
})

/* ============================ Binary AND (network address) ============================ */

const bits = (n: number) => n.toString(2).padStart(8, '0')

export const binaryAnd = (fr: boolean): AnimSpec => {
  const ip = [192, 168, 10, 77]
  const mask = [255, 255, 255, 192]
  const net = ip.map((o, i) => o & mask[i])
  const bc = ip.map((o, i) => (o & mask[i]) | (~mask[i] & 255))
  return {
    viewBox: '0 0 760 360',
    pace: 3800,
    steps: [
      t('Host 192.168.10.77/26. Write the IP address in binary — 4 octets of 8 bits.', 'Hôte 192.168.10.77/26. Écrivons l’adresse IP en binaire — 4 octets de 8 bits.'),
      t('/26 means 26 ones in the mask: 255.255.255.192. The ones mark the NETWORK part, the zeros the HOST part.', '/26 signifie 26 « 1 » dans le masque : 255.255.255.192. Les 1 marquent la partie RÉSEAU, les 0 la partie HÔTE.'),
      t('AND bit by bit: 1 AND 1 = 1, anything AND 0 = 0. The result is the network address: 192.168.10.64.', 'ET bit à bit : 1 ET 1 = 1, n’importe quoi ET 0 = 0. Le résultat est l’adresse réseau : 192.168.10.64.'),
      t('Set all host bits to 1 → broadcast address 192.168.10.127.', 'Mettre tous les bits hôte à 1 → adresse de diffusion 192.168.10.127.'),
      t('Usable hosts: .65 to .126 → 2^6 − 2 = 62 hosts (network and broadcast are reserved).', 'Hôtes utilisables : .65 à .126 → 2^6 − 2 = 62 hôtes (réseau et diffusion sont réservés).'),
    ],
    render: (step) => {
      const row = (label: string, octs: number[], y: number, tone: string, show: boolean, k: string, hostHi = false) => (
        <motion.g key={k} initial={false} animate={{ opacity: show ? 1 : 0, x: show ? 0 : -20 }} transition={{ duration: 0.5, ease }}>
          <T x={10} y={y + 20} size={13} anchor="start" weight={700} fill={tone}>{label}</T>
          <T x={10} y={y + 38} size={11} anchor="start" fill={C.dim} mono>{octs.join('.')}</T>
          {octs.map((o, i) =>
            bits(o).split('').map((b, j) => {
              const idx = i * 8 + j
              const host = idx >= 26
              return (
                <motion.g key={`${i}-${j}`} initial={false} animate={{ opacity: 1 }}>
                  <rect x={190 + idx * 17 + i * 10} y={y} width={15} height={30} rx={4} fill={host && step >= 1 ? 'rgb(245 158 11 / 0.14)' : 'rgb(var(--cyan-rgb) / 0.07)'} stroke={host && step >= 1 ? C.warning : C.line} strokeWidth={hostHi && host ? 1.5 : 1} />
                  <T x={190 + idx * 17 + i * 10 + 7.5} y={y + 20} size={13} weight={700} fill={b === '1' ? tone : C.dim} mono>{b}</T>
                </motion.g>
              )
            }),
          )}
        </motion.g>
      )
      return (
        <g>
          {step >= 1 && (
            <motion.g initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <rect x={186} y={20} width={26 * 17 + 3 * 10 + 1} height={14} rx={4} fill="rgb(var(--cyan-rgb) / 0.15)" />
              <T x={186 + (26 * 17 + 30) / 2} y={31} size={10} fill={C.cyan} weight={700}>{fr ? 'RÉSEAU (26 bits)' : 'NETWORK (26 bits)'}</T>
              <rect x={190 + 26 * 17 + 30 - 2} y={20} width={6 * 17} height={14} rx={4} fill="rgb(245 158 11 / 0.18)" />
              <T x={190 + 26 * 17 + 30 + 49} y={31} size={10} fill={C.warning} weight={700}>{fr ? 'HÔTE' : 'HOST'}</T>
            </motion.g>
          )}
          {row(fr ? 'Adresse IP' : 'IP address', ip, 48, C.text, true, 'ip')}
          {row(fr ? 'Masque /26' : 'Mask /26', mask, 104, C.cyan, step >= 1, 'm')}
          {step >= 2 && <motion.line x1={186} y1={146} x2={740} y2={146} stroke={C.muted} strokeWidth={1.5} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} />}
          {row(fr ? 'Réseau (ET)' : 'Network (AND)', net, 158, C.success, step >= 2, 'n')}
          {row(fr ? 'Diffusion' : 'Broadcast', bc, 214, C.purple, step >= 3, 'b', true)}
          <AnimatePresence>
            {step >= 4 && (
              <motion.g initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <rect x={190} y={282} width={470} height={52} rx={12} fill="rgb(34 197 94 / 0.08)" stroke={C.success} />
                <T x={425} y={305} size={14} weight={700} fill={C.success} mono>192.168.10.65 → 192.168.10.126</T>
                <T x={425} y={324} size={11.5} fill={C.muted}>{fr ? '2⁶ − 2 = 62 hôtes utilisables' : '2⁶ − 2 = 62 usable hosts'}</T>
              </motion.g>
            )}
          </AnimatePresence>
        </g>
      )
    },
  }
}

/* ============================ Subnet split ============================ */

export const subnetSplit = (fr: boolean): AnimSpec => {
  const levels = [
    { p: 24, n: 1 }, { p: 25, n: 2 }, { p: 26, n: 4 }, { p: 27, n: 8 }, { p: 28, n: 16 },
  ]
  return {
    viewBox: '0 0 760 280',
    pace: 3000,
    steps: [
      t('192.168.1.0/24: one network of 256 addresses (254 hosts).', '192.168.1.0/24 : un réseau de 256 adresses (254 hôtes).'),
      t('Borrow 1 host bit → /25: 2 subnets of 128 addresses (.0 and .128).', 'Emprunter 1 bit hôte → /25 : 2 sous-réseaux de 128 adresses (.0 et .128).'),
      t('Borrow 2 bits → /26: 4 subnets of 64 (.0, .64, .128, .192). Each bit borrowed DOUBLES the subnets and HALVES their size.', 'Emprunter 2 bits → /26 : 4 sous-réseaux de 64 (.0, .64, .128, .192). Chaque bit emprunté DOUBLE le nombre de sous-réseaux et DIVISE leur taille par deux.'),
      t('/27: 8 subnets of 32 addresses — the "block size" is 32, so subnets start at multiples of 32.', '/27 : 8 sous-réseaux de 32 adresses — la « taille de bloc » est 32, les sous-réseaux commencent aux multiples de 32.'),
      t('/28: 16 subnets of 16 (14 hosts each). Block size = 256 − last mask octet (240) = 16.', '/28 : 16 sous-réseaux de 16 (14 hôtes chacun). Taille de bloc = 256 − dernier octet du masque (240) = 16.'),
    ],
    render: (step) => {
      const { p, n } = levels[step]
      const size = 256 / n
      const W = 700
      const colors = [C.cyan, C.purple, C.blue, C.success]
      return (
        <g>
          <T x={380} y={30} size={22} weight={700} mono>192.168.1.0/{p}</T>
          <T x={380} y={54} size={12} fill={C.dim}>{n} × {size} {fr ? 'adresses' : 'addresses'} · {size - 2} {fr ? 'hôtes chacun' : 'hosts each'} · {fr ? 'masque' : 'mask'} 255.255.255.{256 - size === 256 ? 0 : 256 - size}</T>
          {Array.from({ length: n }, (_, i) => {
            const x = 30 + (i * W) / n
            const w = W / n - 4
            return (
              <motion.g key={`${p}-${i}`} initial={{ opacity: 0, scaleY: 0.3 }} animate={{ opacity: 1, scaleY: 1 }} transition={{ duration: 0.5, delay: i * 0.03, ease }} style={{ transformBox: 'fill-box', transformOrigin: 'bottom' }}>
                <rect x={x} y={90} width={w} height={110} rx={Math.min(10, w / 4)} fill={colors[i % 4]} fillOpacity={0.18} stroke={colors[i % 4]} strokeWidth={1.4} />
                {n <= 8 && <T x={x + w / 2} y={150} size={n <= 4 ? 14 : 11} weight={700} mono>.{i * size}</T>}
                {n > 8 && <T x={x + w / 2} y={150} size={9} weight={700} mono>{i * size}</T>}
                {n <= 4 && <T x={x + w / 2} y={172} size={11} fill={C.dim} mono>/{p}</T>}
              </motion.g>
            )
          })}
          <line x1={30} y1={222} x2={730} y2={222} stroke={C.line} />
          {[0, 64, 128, 192, 256].map((v) => (
            <g key={v}>
              <line x1={30 + (v / 256) * W} y1={218} x2={30 + (v / 256) * W} y2={226} stroke={C.dim} />
              <T x={30 + (v / 256) * W} y={244} size={10.5} fill={C.dim} mono>.{v === 256 ? '255' : v}</T>
            </g>
          ))}
          <T x={380} y={270} size={11.5} fill={C.muted}>{fr ? `bits empruntés : ${p - 24} → 2^${p - 24} = ${n} sous-réseaux` : `bits borrowed: ${p - 24} → 2^${p - 24} = ${n} subnets`}</T>
        </g>
      )
    },
  }
}

/* ============================ VLSM ============================ */

export const vlsm = (fr: boolean): AnimSpec => {
  const needs = [
    { name: fr ? 'Commercial' : 'Sales', hosts: 100, p: 25, start: 0, c: C.cyan },
    { name: fr ? 'Administration' : 'Admin', hosts: 50, p: 26, start: 128, c: C.purple },
    { name: fr ? 'Serveurs' : 'Servers', hosts: 20, p: 27, start: 192, c: C.blue },
    { name: 'WAN', hosts: 2, p: 30, start: 224, c: C.warning },
  ]
  return {
    viewBox: '0 0 760 300',
    pace: 3400,
    steps: [
      t('We have 192.168.1.0/24 and four needs: 100, 50, 20 and 2 hosts. Equal /26 subnets would waste addresses — and 100 hosts would not fit!', 'Nous avons 192.168.1.0/24 et quatre besoins : 100, 50, 20 et 2 hôtes. Des /26 égaux gaspilleraient — et 100 hôtes ne tiendraient pas !'),
      t('VLSM: largest first. 100 hosts → need 128 addresses → /25 → 192.168.1.0/25.', 'VLSM : le plus grand d’abord. 100 hôtes → 128 adresses → /25 → 192.168.1.0/25.'),
      t('50 hosts → 64 addresses → /26 → next free block: 192.168.1.128/26.', '50 hôtes → 64 adresses → /26 → bloc libre suivant : 192.168.1.128/26.'),
      t('20 hosts → 32 addresses → /27 → 192.168.1.192/27.', '20 hôtes → 32 adresses → /27 → 192.168.1.192/27.'),
      t('Point-to-point WAN link: 2 hosts → /30 → 192.168.1.224/30. Space left over for growth: .228 to .255.', 'Lien WAN point-à-point : 2 hôtes → /30 → 192.168.1.224/30. Il reste de la place : .228 à .255.'),
    ],
    render: (step) => {
      const W = 700
      return (
        <g>
          <T x={380} y={28} size={14} weight={700}>192.168.1.0/24 — VLSM</T>
          <rect x={30} y={60} width={W} height={90} rx={12} fill="rgb(var(--cyan-rgb) / 0.03)" stroke={C.line} strokeDasharray="5 5" />
          {needs.map((nd, i) => {
            if (i >= step) return null
            const size = 2 ** (32 - nd.p)
            const x = 30 + (nd.start / 256) * W
            const w = (size / 256) * W
            return (
              <motion.g key={i} initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={spring}>
                <rect x={x + 1} y={61} width={Math.max(w - 2, 6)} height={88} rx={10} fill={nd.c} fillOpacity={0.22} stroke={nd.c} strokeWidth={1.5} />
                {w > 40 && <T x={x + w / 2} y={98} size={12.5} weight={700}>{nd.name}</T>}
                {w > 40 && <T x={x + w / 2} y={118} size={11} fill={C.dim} mono>.{nd.start}/{nd.p}</T>}
              </motion.g>
            )
          })}
          {needs.map((nd, i) => (
            <motion.g key={`l${i}`} initial={false} animate={{ opacity: i < step ? 1 : 0.35 }}>
              <rect x={30 + i * 178} y={186} width={168} height={74} rx={12} fill={i === step - 1 ? 'rgb(var(--cyan-rgb) / 0.1)' : 'transparent'} stroke={i < step ? nd.c : C.line} />
              <T x={44 + i * 178} y={210} size={13} anchor="start" weight={700} fill={nd.c}>{nd.name}</T>
              <T x={44 + i * 178} y={230} size={11} anchor="start" fill={C.muted}>{nd.hosts} {fr ? 'hôtes' : 'hosts'} → /{nd.p}</T>
              <T x={44 + i * 178} y={248} size={10.5} anchor="start" fill={C.dim} mono>{i < step ? `192.168.1.${nd.start}` : '…'}</T>
            </motion.g>
          ))}
        </g>
      )
    },
  }
}
