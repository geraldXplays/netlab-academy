/**
 * Animated examples — Level 2, batch 3: DHCP, DNS, NAT, troubleshooting method.
 */
import { AnimatePresence, motion } from 'motion/react'
import { t } from '@/content/lessons/types'
import { C, T, type AnimSpec } from './Player'

function Node({ x, y, w = 130, h = 46, title, sub, color = C.cyan, hi = false }: { x: number; y: number; w?: number; h?: number; title: string; sub?: string; color?: string; hi?: boolean }) {
  return (
    <g>
      <motion.rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={12} initial={false} animate={{ fill: hi ? `color-mix(in srgb, ${color} 22%, transparent)` : 'rgb(var(--cyan-rgb) / 0.05)', stroke: hi ? color : 'var(--line)' }} strokeWidth={1.6} />
      <T x={x} y={y + (sub ? -3 : 5)} size={12.5} weight={700}>{title}</T>
      {sub && <T x={x} y={y + 13} size={9.5} fill={C.dim} mono>{sub}</T>}
    </g>
  )
}

function Msg({ from, to, color, label, k }: { from: [number, number]; to: [number, number]; color: string; label: string; k: string }) {
  return (
    <motion.g key={k} initial={{ x: from[0], y: from[1], opacity: 0 }} animate={{ x: to[0], y: to[1], opacity: [0, 1, 1] }} transition={{ duration: 1.1, ease: 'easeInOut' }}>
      <rect x={-38} y={-11} width={76} height={22} rx={11} fill={color} filter="url(#an-glow)" />
      <T x={0} y={4} size={9.5} weight={800} fill="#0b1220" mono>{label}</T>
    </motion.g>
  )
}

/* ============================ DHCP DORA ============================ */

export const dhcpDora = (fr: boolean): AnimSpec => {
  const PC: [number, number] = [130, 200]
  const SRV: [number, number] = [630, 200]
  const msgs = [
    { l: 'DISCOVER', c: C.warning, dir: 1, d: fr ? 'broadcast · src 0.0.0.0 → 255.255.255.255' : 'broadcast · src 0.0.0.0 → 255.255.255.255' },
    { l: 'OFFER', c: C.cyan, dir: -1, d: fr ? '« Je te propose 192.168.1.105 »' : '"I offer you 192.168.1.105"' },
    { l: 'REQUEST', c: C.warning, dir: 1, d: fr ? 'broadcast · « J’accepte .105 »' : 'broadcast · "I accept .105"' },
    { l: 'ACK', c: C.success, dir: -1, d: fr ? '« Confirmé, bail de 8 jours »' : '"Confirmed, 8-day lease"' },
  ]
  return {
    viewBox: '0 0 760 380',
    pace: 3100,
    steps: [
      t('A new laptop joins the network with no IP address at all. It needs four messages: D-O-R-A.', 'Un nouveau portable rejoint le réseau sans aucune adresse IP. Il lui faut quatre messages : D-O-R-A.'),
      t('DISCOVER — broadcast (UDP 67/68): "Is there a DHCP server out there?" The client uses source 0.0.0.0.', 'DISCOVER — broadcast (UDP 67/68) : « Y a-t-il un serveur DHCP ? » Le client utilise la source 0.0.0.0.'),
      t('OFFER — the server picks a free address from its scope and offers it with mask, gateway and DNS.', 'OFFER — le serveur choisit une adresse libre de son étendue et la propose avec masque, passerelle et DNS.'),
      t('REQUEST — the client accepts (still broadcast, so other DHCP servers know their offers were declined).', 'REQUEST — le client accepte (toujours en broadcast, pour que les autres serveurs DHCP sachent leur offre refusée).'),
      t('ACK — the server confirms and records the lease. The laptop configures itself: 192.168.1.105/24, gw .1, DNS .10.', 'ACK — le serveur confirme et enregistre le bail. Le portable se configure : 192.168.1.105/24, pass. .1, DNS .10.'),
    ],
    render: (step) => (
      <g>
        <Node x={PC[0]} y={PC[1]} title={fr ? 'Portable' : 'Laptop'} sub={step >= 4 ? '192.168.1.105/24' : '0.0.0.0'} hi={step >= 4} color={C.success} />
        <Node x={SRV[0]} y={SRV[1]} w={150} title={fr ? 'Serveur DHCP' : 'DHCP server'} sub={fr ? 'étendue .100 – .200' : 'scope .100 – .200'} hi={step >= 1} />
        <line x1={PC[0] + 70} y1={PC[1]} x2={SRV[0] - 80} y2={SRV[1]} stroke="var(--line)" strokeWidth={2} strokeDasharray="4 6" />
        <AnimatePresence>
          {step >= 1 && (
            <Msg k={`m${step}`} from={msgs[step - 1].dir > 0 ? [PC[0] + 100, PC[1] - 50] : [SRV[0] - 110, SRV[1] - 50]} to={msgs[step - 1].dir > 0 ? [SRV[0] - 110, SRV[1] - 50] : [PC[0] + 100, PC[1] - 50]} color={msgs[step - 1].c} label={msgs[step - 1].l} />
          )}
        </AnimatePresence>
        {step >= 1 && (
          <motion.g key={`d${step}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
            <T x={380} y={250} size={12} fill={msgs[step - 1].c} weight={700}>{msgs[step - 1].d}</T>
          </motion.g>
        )}
        {['D', 'O', 'R', 'A'].map((L, i) => (
          <g key={L}>
            <motion.circle cx={290 + i * 60} cy={318} r={20} initial={false} animate={{ fill: i < step ? msgs[i].c : 'rgba(0,0,0,0)', stroke: i < step ? msgs[i].c : 'var(--line)' }} strokeWidth={2} />
            <T x={290 + i * 60} y={324} size={15} weight={800} fill={i < step ? '#0b1220' : C.dim}>{L}</T>
          </g>
        ))}
        {step >= 4 && (
          <motion.g initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <rect x={40} y={60} width={190} height={84} rx={10} fill="rgb(34 197 94 / 0.08)" stroke={C.success} />
            {['IP    192.168.1.105', 'Mask  255.255.255.0', 'Gw    192.168.1.1', 'DNS   192.168.1.10'].map((s, i) => <T key={s} x={52} y={82 + i * 17} size={10.5} anchor="start" mono fill={C.success}>{s}</T>)}
          </motion.g>
        )}
      </g>
    ),
  }
}

/* ============================ DNS resolution ============================ */

export const dnsResolve = (fr: boolean): AnimSpec => {
  const PC: [number, number] = [100, 300]
  const RES: [number, number] = [330, 300]
  const ROOT: [number, number] = [600, 70]
  const TLD: [number, number] = [600, 190]
  const AUTH: [number, number] = [600, 310]
  const flows: { a: [number, number]; b: [number, number]; l: string; c: string }[] = [
    { a: PC, b: RES, l: 'www.netlab.io?', c: C.cyan },
    { a: RES, b: ROOT, l: '. (root)', c: C.warning },
    { a: ROOT, b: RES, l: '→ .io', c: C.purple },
    { a: RES, b: TLD, l: '.io ?', c: C.warning },
    { a: TLD, b: RES, l: '→ ns1', c: C.purple },
    { a: RES, b: AUTH, l: 'www?', c: C.warning },
    { a: AUTH, b: RES, l: '75.2.60.5', c: C.success },
    { a: RES, b: PC, l: '75.2.60.5', c: C.success },
  ]
  const stepFlows = [[], [0], [1, 2], [3, 4], [5, 6], [7], [0, 7]]
  return {
    viewBox: '0 0 760 380',
    pace: 3300,
    steps: [
      t('You type www.netlab.io. Computers only speak IP addresses — DNS translates names into IPs.', 'Vous tapez www.netlab.io. Les ordinateurs ne parlent qu’en IP — le DNS traduit les noms en adresses.'),
      t('The PC asks its configured DNS server (the resolver, e.g. the company DC or 8.8.8.8): "What is the IP of www.netlab.io?"', 'Le PC demande à son serveur DNS (le résolveur, ex. le DC de l’entreprise ou 8.8.8.8) : « Quelle est l’IP de www.netlab.io ? »'),
      t('If the resolver doesn’t know, it asks a ROOT server, which answers: "ask the .io servers".', 'Si le résolveur ne sait pas, il demande à un serveur RACINE, qui répond : « demande aux serveurs .io ».'),
      t('The .io TLD server answers: "netlab.io is managed by ns1.netlab.io".', 'Le serveur de TLD .io répond : « netlab.io est géré par ns1.netlab.io ».'),
      t('The AUTHORITATIVE server for netlab.io gives the real answer: an A record 75.2.60.5.', 'Le serveur FAISANT AUTORITÉ pour netlab.io donne la vraie réponse : un enregistrement A 75.2.60.5.'),
      t('The resolver returns the IP to the PC and caches it for the record’s TTL.', 'Le résolveur renvoie l’IP au PC et la met en cache pendant le TTL de l’enregistrement.'),
      t('Next time (any user), the answer comes straight from the cache — milliseconds instead of four round trips.', 'La fois suivante (pour tout utilisateur), la réponse vient directement du cache — quelques millisecondes au lieu de quatre allers-retours.'),
    ],
    render: (step) => {
      const active = stepFlows[step]
      return (
        <g>
          <Node x={PC[0]} y={PC[1]} w={130} title="PC" sub={step >= 5 ? '→ 75.2.60.5' : 'www.netlab.io'} hi={step >= 5} color={C.success} />
          <Node x={RES[0]} y={RES[1]} w={160} title={fr ? 'Résolveur DNS' : 'DNS resolver'} sub={step >= 5 ? (fr ? 'cache : www → 75.2.60.5' : 'cache: www → 75.2.60.5') : fr ? 'cache vide' : 'empty cache'} hi={step >= 1} color={step >= 5 ? C.success : C.cyan} />
          <Node x={ROOT[0]} y={ROOT[1]} w={170} title={fr ? 'Serveur racine' : 'Root server'} sub="a.root-servers.net" hi={step === 2} color={C.warning} />
          <Node x={TLD[0]} y={TLD[1]} w={170} title={fr ? 'Serveur TLD .io' : '.io TLD server'} sub="a.nic.io" hi={step === 3} color={C.warning} />
          <Node x={AUTH[0]} y={AUTH[1]} w={170} title={fr ? 'Faisant autorité' : 'Authoritative'} sub="ns1.netlab.io" hi={step === 4} color={C.success} />
          {[ROOT, TLD, AUTH].map((n, i) => <line key={i} x1={RES[0] + 80} y1={RES[1] - 10} x2={n[0] - 85} y2={n[1]} stroke="var(--line)" strokeDasharray="4 6" />)}
          <line x1={PC[0] + 65} y1={PC[1]} x2={RES[0] - 80} y2={RES[1]} stroke="var(--line)" strokeDasharray="4 6" />
          <AnimatePresence>
            {active.map((fi, k) => {
              const f = flows[fi]
              return (
                <motion.g key={`${step}-${fi}`} initial={{ x: f.a[0], y: f.a[1] - 32, opacity: 0 }} animate={{ x: f.b[0], y: f.b[1] - 32, opacity: [0, 1, 1] }} transition={{ duration: step === 6 ? 0.5 : 1.1, delay: k * (step === 6 ? 0.5 : 1.2), ease: 'easeInOut' }}>
                  <rect x={-44} y={-11} width={88} height={22} rx={11} fill={f.c} filter="url(#an-glow)" />
                  <T x={0} y={4} size={9.5} weight={800} fill="#0b1220" mono>{f.l}</T>
                </motion.g>
              )
            })}
          </AnimatePresence>
          {step === 6 && <T x={RES[0]} y={RES[1] + 52} size={12} weight={700} fill={C.success}>{fr ? '⚡ réponse depuis le cache' : '⚡ answered from cache'}</T>}
        </g>
      )
    },
  }
}

/* ============================ NAT / PAT ============================ */

export const natPat = (fr: boolean): AnimSpec => {
  const rows = [
    ['192.168.1.10:51000', '203.0.113.5:1024', '142.250.74.46:443'],
    ['192.168.1.11:49800', '203.0.113.5:1025', '142.250.74.46:443'],
  ]
  return {
    viewBox: '0 0 760 400',
    pace: 3300,
    steps: [
      t('Inside: private addresses (192.168.1.x). They cannot travel on the Internet. The router has ONE public address: 203.0.113.5.', 'À l’intérieur : des adresses privées (192.168.1.x). Elles ne peuvent pas circuler sur Internet. Le routeur a UNE adresse publique : 203.0.113.5.'),
      t('PC1 opens google.com: source 192.168.1.10:51000 → destination 142.250.74.46:443.', 'PC1 ouvre google.com : source 192.168.1.10:51000 → destination 142.250.74.46:443.'),
      t('The NAT router rewrites the SOURCE to 203.0.113.5:1024 and writes the mapping in its translation table.', 'Le routeur NAT réécrit la SOURCE en 203.0.113.5:1024 et note la correspondance dans sa table de traduction.'),
      t('PC2 also goes to Google: it becomes 203.0.113.5:1025. Same public IP, different port — this is PAT ("NAT overload").', 'PC2 va aussi sur Google : il devient 203.0.113.5:1025. Même IP publique, port différent — c’est le PAT (« NAT overload »).'),
      t('Google replies to 203.0.113.5:1024. The router looks up its table and sends it back to 192.168.1.10:51000.', 'Google répond à 203.0.113.5:1024. Le routeur consulte sa table et renvoie à 192.168.1.10:51000.'),
    ],
    render: (step) => (
      <g>
        <rect x={20} y={40} width={290} height={230} rx={18} fill="rgb(var(--cyan-rgb) / 0.04)" stroke="var(--line)" strokeDasharray="5 6" />
        <T x={34} y={60} size={11} anchor="start" fill={C.dim} weight={700}>{fr ? 'RÉSEAU PRIVÉ (inside)' : 'PRIVATE NETWORK (inside)'}</T>
        <rect x={450} y={40} width={290} height={230} rx={18} fill="rgb(168 85 247 / 0.04)" stroke="var(--line)" strokeDasharray="5 6" />
        <T x={726} y={60} size={11} anchor="end" fill={C.dim} weight={700}>INTERNET (outside)</T>
        <Node x={110} y={120} w={150} title="PC1" sub="192.168.1.10" hi={step === 1 || step === 4} />
        <Node x={110} y={210} w={150} title="PC2" sub="192.168.1.11" hi={step === 3} />
        <Node x={380} y={165} w={120} h={60} title={fr ? 'Routeur NAT' : 'NAT router'} sub="203.0.113.5" hi={step >= 2} color={C.warning} />
        <Node x={640} y={165} w={150} title="google.com" sub="142.250.74.46" hi={step === 4} color={C.purple} />
        <line x1={185} y1={120} x2={320} y2={160} stroke="var(--line)" />
        <line x1={185} y1={210} x2={320} y2={170} stroke="var(--line)" />
        <line x1={440} y1={165} x2={565} y2={165} stroke="var(--line)" />
        <AnimatePresence>
          {step === 1 && <Msg k="a" from={[185, 120]} to={[320, 150]} color={C.cyan} label=".10:51000" />}
          {step === 2 && <Msg k="b" from={[440, 150]} to={[565, 150]} color={C.warning} label=".5:1024" />}
          {step === 3 && <Msg k="c" from={[185, 210]} to={[505, 180]} color={C.warning} label=".5:1025" />}
          {step === 4 && <Msg k="d" from={[565, 150]} to={[185, 120]} color={C.success} label="→ .10:51000" />}
        </AnimatePresence>
        <g transform="translate(40 300)">
          <T x={0} y={0} size={12} anchor="start" weight={700} fill={C.warning}>{fr ? 'Table de traduction NAT' : 'NAT translation table'}</T>
          <rect x={-6} y={10} width={690} height={70} rx={10} fill="rgb(245 158 11 / 0.05)" stroke="var(--line)" />
          {[fr ? 'Inside local' : 'Inside local', fr ? 'Inside global' : 'Inside global', fr ? 'Outside' : 'Outside'].map((h, i) => <T key={h} x={6 + i * 230} y={28} size={10} anchor="start" fill={C.dim} weight={700}>{h}</T>)}
          <AnimatePresence>
            {rows.slice(0, step >= 3 ? 2 : step >= 2 ? 1 : 0).map((r, k) => (
              <motion.g key={k} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                <rect x={0} y={34 + k * 20} width={678} height={18} rx={4} fill={step === 4 && k === 0 ? 'rgb(34 197 94 / 0.18)' : 'transparent'} />
                {r.map((c, i) => <T key={i} x={6 + i * 230} y={47 + k * 20} size={11} anchor="start" mono>{c}</T>)}
              </motion.g>
            ))}
          </AnimatePresence>
        </g>
      </g>
    ),
  }
}

/* ============================ Troubleshooting method ============================ */

export const tsMethod = (fr: boolean): AnimSpec => {
  const rungs = [
    { l: fr ? '1. Physique' : '1. Physical', c: fr ? 'Câble branché ? Voyant de lien ? Wi-Fi connecté ?' : 'Cable in? Link light? Wi-Fi connected?', cmd: 'ipconfig → "Media disconnected"?' },
    { l: fr ? '2. Liaison' : '2. Data link', c: fr ? 'Port actif, bon VLAN, pas err-disabled ?' : 'Port up, right VLAN, not err-disabled?', cmd: 'show interfaces status' },
    { l: fr ? '3. Réseau (local)' : '3. Network (local)', c: fr ? 'IP valide (pas 169.254) ? Ping passerelle ?' : 'Valid IP (not 169.254)? Ping gateway?', cmd: 'ipconfig /all · ping <gw>' },
    { l: fr ? '3. Réseau (distant)' : '3. Network (remote)', c: fr ? 'Ping une IP distante ? Où s’arrête tracert ?' : 'Ping a remote IP? Where does tracert stop?', cmd: 'ping 8.8.8.8 · tracert' },
    { l: fr ? '7. Noms (DNS)' : '7. Names (DNS)', c: fr ? 'Le nom se résout-il ?' : 'Does the name resolve?', cmd: 'nslookup site.com' },
    { l: fr ? '4–7. Service' : '4–7. Service', c: fr ? 'Le port répond-il ? Service démarré ? Pare-feu ?' : 'Port answers? Service running? Firewall?', cmd: 'Test-NetConnection -Port 443' },
  ]
  return {
    viewBox: '0 0 760 400',
    pace: 2900,
    steps: [
      t('A structured method beats guessing. Start at the bottom: is it plugged in?', 'Une méthode structurée vaut mieux que deviner. Commencez par le bas : est-ce branché ?'),
      t('Layer 2: the switch port. Up? Right VLAN? Not shut down by port security?', 'Couche 2 : le port du switch. Actif ? Bon VLAN ? Pas coupé par port security ?'),
      t('Layer 3 local: a real IP address and a working gateway. 169.254.x.x = DHCP problem.', 'Couche 3 locale : une vraie IP et une passerelle qui répond. 169.254.x.x = problème DHCP.'),
      t('Layer 3 remote: can you reach an IP beyond the router? tracert shows where it breaks.', 'Couche 3 distante : atteignez-vous une IP au-delà du routeur ? tracert montre où ça casse.'),
      t('Names: IP works but names don’t → DNS.', 'Les noms : l’IP marche mais pas les noms → DNS.'),
      t('Everything works except the app → its port, its service or a firewall rule. Each answer cuts the problem in half.', 'Tout marche sauf l’appli → son port, son service ou une règle de pare-feu. Chaque réponse coupe le problème en deux.'),
    ],
    render: (step) => (
      <g>
        {rungs.map((r, i) => {
          const y = 340 - i * 58
          const on = i === step
          const done = i < step
          return (
            <g key={i}>
              <motion.rect x={40} y={y - 22} width={680} height={46} rx={12} initial={false} animate={{ fill: on ? 'rgb(var(--cyan-rgb) / 0.18)' : done ? 'rgb(34 197 94 / 0.07)' : 'rgb(var(--cyan-rgb) / 0.03)', stroke: on ? C.cyan : done ? C.success : 'var(--line)' }} strokeWidth={1.5} />
              <T x={60} y={y + 5} size={13} anchor="start" weight={700} fill={on ? C.cyan : done ? C.success : C.text}>{done ? '✔ ' : ''}{r.l}</T>
              <T x={230} y={y - 2} size={11.5} anchor="start" fill={on ? C.text : C.muted}>{r.c}</T>
              <T x={230} y={y + 14} size={10} anchor="start" fill={C.dim} mono>{r.cmd}</T>
            </g>
          )
        })}
      </g>
    ),
  }
}
