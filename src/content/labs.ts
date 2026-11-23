import type { L } from './types'
import { t, type ExamQuestion } from './lessons/types'
import type { DeviceType, SimDevice, SimLink, Topology } from '@/sim/types'
import { createDevice } from '@/sim/topology'
import { canPing } from '@/sim/engine'

export interface LabTask {
  id: string
  label: L
  points: number
  check: (topo: Topology) => boolean
}

export interface LabStep {
  title: L
  body: L
  code?: string
  hint?: L
}

export interface LabDef {
  id: string
  number: number
  title: L
  levelId: string
  difficulty: 1 | 2 | 3
  minutes: number
  kind: 'sim' | 'guided'
  scenario: L
  objectives: L[]
  equipment: L[]
  steps: LabStep[]
  /** Simulator labs: auto-graded tasks + starting topology + allowed devices. */
  tasks?: LabTask[]
  initial?: () => Topology
  palette?: DeviceType[]
  /** Guided labs: graded checkpoint questions. */
  checkpoints?: ExamQuestion[]
  troubleshooting: { symptom: L; fix: L }[]
  expected: L
  evaluation: L[]
  packetTracer?: L
  xp: number
  badge?: string
  /** Badge awarded only if no hints were used. */
  noHintBadge?: string
  skills: string[]
  recommendedAfter?: string
}

/* ------------------------------ helpers ------------------------------ */

const byId = (topo: Topology, id: string) => topo.devices.find((d) => d.id === id)
const ifc = (topo: Topology, id: string, name: string) => byId(topo, id)?.ifaces.find((i) => i.name === name)
const hostIs = (topo: Topology, id: string, ip: string, mask: string, gw?: string) => {
  const d = byId(topo, id)
  const n = d?.ifaces[0]
  return !!d && n?.ip === ip && n?.mask === mask && (gw === undefined || d.gateway === gw)
}
const ifIs = (topo: Topology, id: string, name: string, ip: string, mask: string) => {
  const i = ifc(topo, id, name)
  return !!i && i.ip === ip && i.mask === mask && i.up
}
const pingById = (topo: Topology, fromId: string, ip: string) => {
  const d = byId(topo, fromId)
  return !!d && canPing(topo, d.name, ip)
}

/** Build a fixed starting topology with stable ids (tasks reference ids, so renames don't break grading). */
function build(spec: { id: string; type: DeviceType; name: string; x: number; y: number; cfg?: (d: SimDevice) => SimDevice }[], links: [string, string, string, string][]): Topology {
  const topo: Topology = { devices: [], links: [] }
  for (const s of spec) {
    const d = { ...createDevice(s.type, s.x, s.y, topo, s.name), id: s.id, locked: true }
    topo.devices.push(s.cfg ? s.cfg(d) : d)
  }
  topo.links = links.map(([a, ai, b, bi], k): SimLink => ({ id: `L${k}`, a: { dev: a, iface: ai }, b: { dev: b, iface: bi }, cable: 'straight' }))
  return topo
}
const host = (ip?: string, mask?: string, gw?: string) => (d: SimDevice): SimDevice => ({ ...d, gateway: gw, ifaces: [{ ...d.ifaces[0], ip, mask }] })

/* ================================ LABS ================================ */

export const LABS: LabDef[] = [
  /* ------------------------------ Lab 1 ------------------------------ */
  {
    id: 'lab-1', number: 1, levelId: 'foundations', difficulty: 1, minutes: 20, kind: 'sim', xp: 150, badge: 'first-connection', skills: ['networking'],
    recommendedAfter: 'l1-arch.2',
    title: t('Create your first network', 'Créez votre premier réseau'),
    scenario: t(
      'A small design studio has two new computers and a switch still in its box. The owner wants the two machines to share files. Build the network from scratch and prove the computers can talk to each other.',
      'Un petit studio de design a deux nouveaux ordinateurs et un commutateur encore dans son carton. Le gérant veut que les deux machines partagent des fichiers. Construisez le réseau de zéro et prouvez que les ordinateurs communiquent.',
    ),
    objectives: [
      t('Place and cable end devices to a switch', 'Placer et câbler des terminaux sur un commutateur'),
      t('Configure static IPv4 addresses on the same subnet', 'Configurer des adresses IPv4 statiques dans le même sous-réseau'),
      t('Verify connectivity with ping', 'Vérifier la connectivité avec ping'),
    ],
    equipment: [t('1 × Cisco 2960 switch', '1 × commutateur Cisco 2960'), t('2 × PCs', '2 × PC'), t('2 × copper straight-through cables', '2 × câbles cuivre droits')],
    palette: ['pc', 'switch', 'laptop'],
    initial: () => ({ devices: [], links: [] }),
    steps: [
      { title: t('Place the devices', 'Placez les équipements'), body: t('From the device bar at the bottom, add **one switch** and **two PCs** to the workspace. They will be named Switch0, PC0 and PC1.', 'Depuis la barre d’équipements en bas, ajoutez **un commutateur** et **deux PC**. Ils s’appelleront Switch0, PC0 et PC1.') },
      { title: t('Cable them', 'Câblez-les'), body: t('Choose the **cable** tool, click PC0 → pick **FastEthernet0**, then click Switch0 → pick **Fa0/1**. Repeat for PC1 on **Fa0/2**. Wait for both link lights to turn green.', 'Choisissez l’outil **câble**, cliquez sur PC0 → **FastEthernet0**, puis sur Switch0 → **Fa0/1**. Recommencez pour PC1 sur **Fa0/2**. Attendez que les voyants passent au vert.'), hint: t('Orange triangles mean the switch port is still starting (spanning tree). They turn green after a moment.', 'Des triangles orange signifient que le port démarre (spanning tree). Ils passent au vert après un instant.') },
      { title: t('Address PC0', 'Adressez PC0'), body: t('Open PC0 → **Desktop** → **IP Configuration** and set:\n- IPv4 address: `192.168.10.10`\n- Subnet mask: `255.255.255.0`', 'Ouvrez PC0 → **Bureau** → **Configuration IP** et saisissez :\n- Adresse IPv4 : `192.168.10.10`\n- Masque : `255.255.255.0`') },
      { title: t('Address PC1', 'Adressez PC1'), body: t('Same on PC1 with `192.168.10.11` / `255.255.255.0`. No gateway is needed: both PCs are on the same network.', 'Pareil sur PC1 avec `192.168.10.11` / `255.255.255.0`. Pas de passerelle : les deux PC sont dans le même réseau.'), hint: t('Check the third octet: 192.168.**10**.x on both.', 'Vérifiez le 3e octet : 192.168.**10**.x sur les deux.') },
      { title: t('Test with ping', 'Testez avec ping'), body: t('Open PC0 → **Desktop** → **Command Prompt** and run:', 'Ouvrez PC0 → **Bureau** → **Invite de commandes** et lancez :'), code: 'ping 192.168.10.11' },
    ],
    tasks: [
      { id: 'devices', points: 1, label: t('Two PCs and a switch are placed', 'Deux PC et un commutateur sont placés'), check: (x) => x.devices.filter((d) => d.type === 'pc' || d.type === 'laptop').length >= 2 && x.devices.some((d) => d.type === 'switch') },
      { id: 'cabled', points: 2, label: t('Both PCs are cabled to the switch', 'Les deux PC sont câblés au commutateur'), check: (x) => {
        const sw = new Set(x.devices.filter((d) => d.type === 'switch').map((d) => d.id))
        const pcs = x.devices.filter((d) => d.type === 'pc' || d.type === 'laptop')
        return pcs.filter((p) => x.links.some((l) => (l.a.dev === p.id && sw.has(l.b.dev)) || (l.b.dev === p.id && sw.has(l.a.dev)))).length >= 2
      } },
      { id: 'pc0', points: 2, label: t('PC0 = 192.168.10.10 / 255.255.255.0', 'PC0 = 192.168.10.10 / 255.255.255.0'), check: (x) => x.devices.some((d) => d.ifaces[0]?.ip === '192.168.10.10' && d.ifaces[0]?.mask === '255.255.255.0') },
      { id: 'pc1', points: 2, label: t('PC1 = 192.168.10.11 / 255.255.255.0', 'PC1 = 192.168.10.11 / 255.255.255.0'), check: (x) => x.devices.some((d) => d.ifaces[0]?.ip === '192.168.10.11' && d.ifaces[0]?.mask === '255.255.255.0') },
      { id: 'ping', points: 3, label: t('192.168.10.10 can ping 192.168.10.11', '192.168.10.10 pingue 192.168.10.11'), check: (x) => {
        const a = x.devices.find((d) => d.ifaces[0]?.ip === '192.168.10.10')
        return !!a && canPing(x, a.name, '192.168.10.11')
      } },
    ],
    troubleshooting: [
      { symptom: t('"Request timed out"', '« Request timed out »'), fix: t('Check both PCs use the same mask and the same first three octets. Check the link lights are green.', 'Vérifiez que les deux PC ont le même masque et les mêmes trois premiers octets. Vérifiez que les voyants sont verts.') },
      { symptom: t('"PING: transmit failed. General failure."', '« PING: transmit failed. General failure. »'), fix: t('The PC has no IP address yet — set it in IP Configuration.', 'Le PC n’a pas encore d’adresse IP — configurez-la.') },
      { symptom: t('Red link triangles', 'Triangles rouges sur le lien'), fix: t('Delete the cable and reconnect it to a free port.', 'Supprimez le câble et reconnectez-le sur un port libre.') },
    ],
    expected: t('Four replies: "Reply from 192.168.10.11: bytes=32 time<1ms TTL=128".', 'Quatre réponses : « Reply from 192.168.10.11: bytes=32 time<1ms TTL=128 ».'),
    evaluation: [t('Correct physical topology (3 pts)', 'Topologie physique correcte (3 pts)'), t('Correct addressing (4 pts)', 'Adressage correct (4 pts)'), t('Successful end-to-end ping (3 pts)', 'Ping de bout en bout réussi (3 pts)')],
    packetTracer: t('In Cisco Packet Tracer: End Devices → PC (×2), Network Devices → Switches → 2960, Connections → Copper Straight-Through. Same IP steps.', 'Dans Cisco Packet Tracer : End Devices → PC (×2), Network Devices → Switches → 2960, Connections → Copper Straight-Through. Mêmes étapes IP.'),
  },

  /* ------------------------------ Lab 2 ------------------------------ */
  {
    id: 'lab-2', number: 2, levelId: 'technician', difficulty: 2, minutes: 30, kind: 'sim', xp: 200, skills: ['routing', 'networking'],
    title: t('Configure a router', 'Configurez un routeur'),
    scenario: t(
      'The company has two departments on different networks: Sales (192.168.1.0/24) and Accounting (192.168.2.0/24). Everything is cabled, but nobody can reach the other department. Configure the router so both networks can communicate.',
      'L’entreprise a deux services sur des réseaux différents : Ventes (192.168.1.0/24) et Comptabilité (192.168.2.0/24). Tout est câblé, mais personne ne joint l’autre service. Configurez le routeur pour que les deux réseaux communiquent.',
    ),
    objectives: [
      t('Configure router interfaces with the IOS command line', 'Configurer les interfaces d’un routeur en ligne de commande IOS'),
      t('Bring interfaces up with no shutdown', 'Activer les interfaces avec no shutdown'),
      t('Set default gateways on hosts and verify routing', 'Définir les passerelles des hôtes et vérifier le routage'),
    ],
    equipment: [t('1 × ISR4331 router', '1 × routeur ISR4331'), t('2 × 2960 switches', '2 × commutateurs 2960'), t('2 × PCs (pre-cabled)', '2 × PC (pré-câblés)')],
    palette: ['pc', 'laptop'],
    initial: () =>
      build(
        [
          { id: 'r1', type: 'router', name: 'Router0', x: 520, y: 140 },
          { id: 'sw0', type: 'switch', name: 'Switch0', x: 300, y: 300 },
          { id: 'sw1', type: 'switch', name: 'Switch1', x: 740, y: 300 },
          { id: 'pc0', type: 'pc', name: 'SALES-PC', x: 300, y: 470, cfg: host() },
          { id: 'pc1', type: 'pc', name: 'ACCT-PC', x: 740, y: 470, cfg: host() },
        ],
        [
          ['pc0', 'Fa0', 'sw0', 'Fa0/1'],
          ['sw0', 'Gi0/1', 'r1', 'Gi0/0/0'],
          ['pc1', 'Fa0', 'sw1', 'Fa0/1'],
          ['sw1', 'Gi0/1', 'r1', 'Gi0/0/1'],
        ],
      ),
    steps: [
      { title: t('Enter configuration mode', 'Entrez en mode configuration'), body: t('Open Router0 → **CLI** and type:', 'Ouvrez Router0 → **CLI** et tapez :'), code: 'enable\nconfigure terminal' },
      { title: t('Sales interface', 'Interface Ventes'), body: t('Gi0/0/0 faces Sales. Give it the first usable address and **turn it on** — router interfaces are shut down by default.', 'Gi0/0/0 est côté Ventes. Donnez-lui la première adresse utilisable et **activez-la** — les interfaces d’un routeur sont éteintes par défaut.'), code: 'interface g0/0/0\nip address 192.168.1.1 255.255.255.0\nno shutdown', hint: t('Forgot "no shutdown"? `show ip interface brief` will say "administratively down".', 'Oublié « no shutdown » ? `show ip interface brief` affichera « administratively down ».') },
      { title: t('Accounting interface', 'Interface Comptabilité'), body: t('Same on Gi0/0/1 with 192.168.2.1/24, then return to privileged mode and check.', 'Pareil sur Gi0/0/1 avec 192.168.2.1/24, puis revenez en mode privilégié et vérifiez.'), code: 'interface g0/0/1\nip address 192.168.2.1 255.255.255.0\nno shutdown\nend\nshow ip interface brief' },
      { title: t('Configure the PCs', 'Configurez les PC'), body: t('SALES-PC: `192.168.1.10` / `255.255.255.0`, gateway `192.168.1.1`.\nACCT-PC: `192.168.2.10` / `255.255.255.0`, gateway `192.168.2.1`.', 'SALES-PC : `192.168.1.10` / `255.255.255.0`, passerelle `192.168.1.1`.\nACCT-PC : `192.168.2.10` / `255.255.255.0`, passerelle `192.168.2.1`.'), hint: t('Without a gateway, a PC cannot send traffic to another network.', 'Sans passerelle, un PC ne peut pas envoyer de trafic vers un autre réseau.') },
      { title: t('Verify', 'Vérifiez'), body: t('From SALES-PC: ping the router, then ACCT-PC. The first reply may time out while ARP resolves — that is normal. Note TTL=127: one router was crossed.', 'Depuis SALES-PC : pinguez le routeur, puis ACCT-PC. La première réponse peut expirer pendant la résolution ARP — c’est normal. Notez TTL=127 : un routeur a été traversé.'), code: 'ping 192.168.1.1\nping 192.168.2.10\ntracert 192.168.2.10' },
    ],
    tasks: [
      { id: 'g0', points: 2, label: t('Gi0/0/0 = 192.168.1.1/24 and up', 'Gi0/0/0 = 192.168.1.1/24 et active'), check: (x) => ifIs(x, 'r1', 'Gi0/0/0', '192.168.1.1', '255.255.255.0') },
      { id: 'g1', points: 2, label: t('Gi0/0/1 = 192.168.2.1/24 and up', 'Gi0/0/1 = 192.168.2.1/24 et active'), check: (x) => ifIs(x, 'r1', 'Gi0/0/1', '192.168.2.1', '255.255.255.0') },
      { id: 'pc0', points: 1, label: t('SALES-PC addressed with gateway', 'SALES-PC adressé avec passerelle'), check: (x) => hostIs(x, 'pc0', '192.168.1.10', '255.255.255.0', '192.168.1.1') },
      { id: 'pc1', points: 1, label: t('ACCT-PC addressed with gateway', 'ACCT-PC adressé avec passerelle'), check: (x) => hostIs(x, 'pc1', '192.168.2.10', '255.255.255.0', '192.168.2.1') },
      { id: 'gw', points: 1, label: t('SALES-PC can ping its gateway', 'SALES-PC pingue sa passerelle'), check: (x) => pingById(x, 'pc0', '192.168.1.1') },
      { id: 'routed', points: 3, label: t('SALES-PC can ping ACCT-PC across the router', 'SALES-PC pingue ACCT-PC à travers le routeur'), check: (x) => pingById(x, 'pc0', '192.168.2.10') },
    ],
    troubleshooting: [
      { symptom: t('Ping to the gateway fails', 'Le ping de la passerelle échoue'), fix: t('`show ip interface brief` — is the interface "up/up"? If "administratively down", enter the interface and type `no shutdown`.', '`show ip interface brief` — l’interface est-elle « up/up » ? Si « administratively down », entrez dans l’interface et tapez `no shutdown`.') },
      { symptom: t('Gateway works but the other PC does not answer', 'La passerelle répond mais pas l’autre PC'), fix: t('Check the other PC’s default gateway — the reply needs it to come back.', 'Vérifiez la passerelle de l’autre PC — la réponse en a besoin pour revenir.') },
      { symptom: t('"% Invalid input detected"', '« % Invalid input detected »'), fix: t('You are probably in the wrong mode. Look at the prompt: Router(config-if)# is needed for ip address.', 'Vous êtes sûrement dans le mauvais mode. Regardez l’invite : Router(config-if)# est nécessaire pour ip address.') },
    ],
    expected: t('`show ip interface brief` shows both Gi interfaces up/up, and SALES-PC gets replies from 192.168.2.10 with TTL=127.', '`show ip interface brief` affiche les deux interfaces Gi up/up, et SALES-PC reçoit des réponses de 192.168.2.10 avec TTL=127.'),
    evaluation: [t('Router interfaces (4 pts)', 'Interfaces du routeur (4 pts)'), t('Host addressing and gateways (2 pts)', 'Adressage et passerelles (2 pts)'), t('Verified connectivity (4 pts)', 'Connectivité vérifiée (4 pts)')],
    packetTracer: t('Use an ISR4331 in Packet Tracer; interface names and commands are identical.', 'Utilisez un ISR4331 dans Packet Tracer ; noms d’interfaces et commandes identiques.'),
  },

  /* ------------------------------ Lab 3 ------------------------------ */
  {
    id: 'lab-3', number: 3, levelId: 'technician', difficulty: 2, minutes: 35, kind: 'sim', xp: 220, noHintBadge: 'vlan-specialist', skills: ['networking', 'routing', 'security'],
    title: t('Configure VLANs and a trunk', 'Configurez des VLAN et un trunk'),
    scenario: t(
      'Administration and IT share the same switches, and IT complains that broadcast traffic from Administration reaches their machines. Separate the departments into VLAN 10 (ADMIN) and VLAN 20 (IT), then carry both VLANs between the two switches with a trunk.',
      'L’Administration et l’IT partagent les mêmes commutateurs, et l’IT se plaint de recevoir le trafic de diffusion de l’Administration. Séparez les services en VLAN 10 (ADMIN) et VLAN 20 (IT), puis transportez les deux VLAN entre les commutateurs avec un trunk.',
    ),
    objectives: [
      t('Create and name VLANs', 'Créer et nommer des VLAN'),
      t('Assign access ports with interface range', 'Affecter des ports d’accès avec interface range'),
      t('Configure an 802.1Q trunk and verify isolation', 'Configurer un trunk 802.1Q et vérifier l’isolation'),
    ],
    equipment: [t('2 × 2960 switches linked on Gi0/1', '2 × commutateurs 2960 reliés sur Gi0/1'), t('6 × PCs, all in 192.168.50.0/24', '6 × PC, tous en 192.168.50.0/24')],
    palette: [],
    initial: () =>
      build(
        [
          { id: 'sw0', type: 'switch', name: 'Switch0', x: 360, y: 220 },
          { id: 'sw1', type: 'switch', name: 'Switch1', x: 760, y: 220 },
          { id: 'a1', type: 'pc', name: 'ADMIN-PC1', x: 180, y: 420, cfg: host('192.168.50.10', '255.255.255.0') },
          { id: 'a2', type: 'pc', name: 'ADMIN-PC2', x: 300, y: 420, cfg: host('192.168.50.11', '255.255.255.0') },
          { id: 'i1', type: 'pc', name: 'IT-PC1', x: 420, y: 420, cfg: host('192.168.50.12', '255.255.255.0') },
          { id: 'i2', type: 'pc', name: 'IT-PC2', x: 540, y: 420, cfg: host('192.168.50.13', '255.255.255.0') },
          { id: 'a3', type: 'laptop', name: 'ADMIN-PC3', x: 700, y: 420, cfg: host('192.168.50.14', '255.255.255.0') },
          { id: 'i3', type: 'laptop', name: 'IT-PC3', x: 840, y: 420, cfg: host('192.168.50.15', '255.255.255.0') },
        ],
        [
          ['a1', 'Fa0', 'sw0', 'Fa0/1'], ['a2', 'Fa0', 'sw0', 'Fa0/2'], ['i1', 'Fa0', 'sw0', 'Fa0/3'], ['i2', 'Fa0', 'sw0', 'Fa0/4'],
          ['a3', 'Fa0', 'sw1', 'Fa0/1'], ['i3', 'Fa0', 'sw1', 'Fa0/2'], ['sw0', 'Gi0/1', 'sw1', 'Gi0/1'],
        ],
      ),
    steps: [
      { title: t('Create the VLANs on Switch0', 'Créez les VLAN sur Switch0'), body: t('Open Switch0 → CLI:', 'Ouvrez Switch0 → CLI :'), code: 'enable\nconfigure terminal\nvlan 10\nname ADMIN\nvlan 20\nname IT\nexit' },
      { title: t('Assign access ports', 'Affectez les ports d’accès'), body: t('Fa0/1–2 belong to Administration, Fa0/3–4 to IT.', 'Fa0/1–2 appartiennent à l’Administration, Fa0/3–4 à l’IT.'), code: 'interface range fa0/1 - 2\nswitchport mode access\nswitchport access vlan 10\ninterface range fa0/3 - 4\nswitchport mode access\nswitchport access vlan 20\nend\nshow vlan brief' },
      { title: t('Verify isolation', 'Vérifiez l’isolation'), body: t('From ADMIN-PC1, ping ADMIN-PC2 (works) and IT-PC1 (must fail: different VLAN = different broadcast domain).', 'Depuis ADMIN-PC1, pinguez ADMIN-PC2 (fonctionne) et IT-PC1 (doit échouer : VLAN différent = domaine de diffusion différent).'), code: 'ping 192.168.50.11\nping 192.168.50.12' },
      { title: t('Repeat on Switch1', 'Répétez sur Switch1'), body: t('Create the same VLANs. Fa0/1 → VLAN 10 (ADMIN-PC3), Fa0/2 → VLAN 20 (IT-PC3).', 'Créez les mêmes VLAN. Fa0/1 → VLAN 10 (ADMIN-PC3), Fa0/2 → VLAN 20 (IT-PC3).'), hint: t('VLANs are local to each switch — Switch1 does not know VLAN 10 until you create it.', 'Les VLAN sont locaux à chaque commutateur — Switch1 ne connaît pas le VLAN 10 tant que vous ne l’avez pas créé.') },
      { title: t('Configure the trunk', 'Configurez le trunk'), body: t('The link between the switches must carry **both** VLANs. On **each** switch:', 'Le lien entre les commutateurs doit transporter les **deux** VLAN. Sur **chaque** commutateur :'), code: 'configure terminal\ninterface g0/1\nswitchport mode trunk\nend', hint: t('Without a trunk, Gi0/1 is an access port in VLAN 1 — VLAN 10 traffic cannot cross it.', 'Sans trunk, Gi0/1 est un port d’accès en VLAN 1 — le trafic du VLAN 10 ne peut pas le traverser.') },
      { title: t('Final test', 'Test final'), body: t('ADMIN-PC1 → ADMIN-PC3 must work across the trunk; ADMIN-PC1 → IT-PC3 must still fail.', 'ADMIN-PC1 → ADMIN-PC3 doit fonctionner via le trunk ; ADMIN-PC1 → IT-PC3 doit toujours échouer.'), code: 'ping 192.168.50.14\nping 192.168.50.15' },
    ],
    tasks: [
      { id: 'vlans0', points: 1, label: t('Switch0 has VLAN 10 "ADMIN" and VLAN 20 "IT"', 'Switch0 a le VLAN 10 « ADMIN » et le VLAN 20 « IT »'), check: (x) => byId(x, 'sw0')?.vlans?.[10] === 'ADMIN' && byId(x, 'sw0')?.vlans?.[20] === 'IT' },
      { id: 'ports0', points: 2, label: t('Switch0: Fa0/1–2 in VLAN 10, Fa0/3–4 in VLAN 20', 'Switch0 : Fa0/1–2 en VLAN 10, Fa0/3–4 en VLAN 20'), check: (x) => ['Fa0/1', 'Fa0/2'].every((p) => ifc(x, 'sw0', p)?.vlan === 10) && ['Fa0/3', 'Fa0/4'].every((p) => ifc(x, 'sw0', p)?.vlan === 20) },
      { id: 'iso', points: 2, label: t('ADMIN-PC1 reaches ADMIN-PC2 but NOT IT-PC1', 'ADMIN-PC1 joint ADMIN-PC2 mais PAS IT-PC1'), check: (x) => pingById(x, 'a1', '192.168.50.11') && !pingById(x, 'a1', '192.168.50.12') && ifc(x, 'sw0', 'Fa0/3')?.vlan === 20 },
      { id: 'sw1', points: 2, label: t('Switch1: VLANs created, Fa0/1 → 10, Fa0/2 → 20', 'Switch1 : VLAN créés, Fa0/1 → 10, Fa0/2 → 20'), check: (x) => ifc(x, 'sw1', 'Fa0/1')?.vlan === 10 && ifc(x, 'sw1', 'Fa0/2')?.vlan === 20 && !!byId(x, 'sw1')?.vlans?.[10] && !!byId(x, 'sw1')?.vlans?.[20] },
      { id: 'trunk', points: 2, label: t('Gi0/1 is a trunk on both switches', 'Gi0/1 est un trunk sur les deux commutateurs'), check: (x) => ifc(x, 'sw0', 'Gi0/1')?.mode === 'trunk' && ifc(x, 'sw1', 'Gi0/1')?.mode === 'trunk' },
      { id: 'across', points: 1, label: t('ADMIN-PC1 reaches ADMIN-PC3 across the trunk, not IT-PC3', 'ADMIN-PC1 joint ADMIN-PC3 via le trunk, pas IT-PC3'), check: (x) => pingById(x, 'a1', '192.168.50.14') && !pingById(x, 'a1', '192.168.50.15') },
    ],
    troubleshooting: [
      { symptom: t('Same-VLAN PCs on different switches cannot ping', 'Des PC du même VLAN sur deux commutateurs ne se pinguent pas'), fix: t('Is Gi0/1 a trunk on BOTH ends? Does Switch1 have the VLAN created?', 'Gi0/1 est-il en trunk des DEUX côtés ? Switch1 a-t-il le VLAN créé ?') },
      { symptom: t('Everyone still pings everyone', 'Tout le monde pingue toujours tout le monde'), fix: t('`show vlan brief` — are the ports really listed under VLAN 10/20, or still under VLAN 1?', '`show vlan brief` — les ports sont-ils vraiment listés sous les VLAN 10/20, ou encore sous le VLAN 1 ?') },
    ],
    expected: t('`show vlan brief` lists Fa0/1–2 under ADMIN and Fa0/3–4 under IT; same-VLAN pings succeed across the trunk, cross-VLAN pings fail.', '`show vlan brief` liste Fa0/1–2 sous ADMIN et Fa0/3–4 sous IT ; les pings intra-VLAN réussissent via le trunk, les pings inter-VLAN échouent.'),
    evaluation: [t('VLAN creation and naming (1 pt)', 'Création et nommage des VLAN (1 pt)'), t('Port assignment on both switches (4 pts)', 'Affectation des ports sur les deux commutateurs (4 pts)'), t('Trunk configuration (2 pts)', 'Configuration du trunk (2 pts)'), t('Verified isolation and reachability (3 pts)', 'Isolation et accessibilité vérifiées (3 pts)')],
    packetTracer: t('Identical commands on 2960 switches in Packet Tracer. Use "show interfaces trunk" there to see allowed VLANs.', 'Commandes identiques sur des 2960 dans Packet Tracer. Utilisez « show interfaces trunk » pour voir les VLAN autorisés.'),
  },

  /* ------------------------------ Lab 4 (guided) ------------------------------ */
  {
    id: 'lab-4', number: 4, levelId: 'sysadmin', difficulty: 2, minutes: 90, kind: 'guided', xp: 250, skills: ['systems', 'security'],
    title: t('Deploy Windows Server and Active Directory', 'Déployez Windows Server et Active Directory'),
    scenario: t(
      'The company is growing to 25 employees and wants central logins. You will install Windows Server in a virtual machine, promote it to a domain controller for **netlab.local**, and create users, groups and a shared folder with correct permissions.',
      'L’entreprise passe à 25 employés et veut des connexions centralisées. Vous allez installer Windows Server dans une machine virtuelle, le promouvoir contrôleur de domaine pour **netlab.local**, et créer utilisateurs, groupes et un dossier partagé avec les bonnes permissions.',
    ),
    objectives: [
      t('Install Windows Server in VirtualBox with a static IP', 'Installer Windows Server dans VirtualBox avec une IP statique'),
      t('Install AD DS and promote a domain controller', 'Installer AD DS et promouvoir un contrôleur de domaine'),
      t('Create users, groups and NTFS/share permissions', 'Créer utilisateurs, groupes et permissions NTFS/partage'),
    ],
    equipment: [t('VirtualBox (free) on a PC with 8 GB RAM', 'VirtualBox (gratuit) sur un PC avec 8 Go de RAM'), t('Windows Server 2022 evaluation ISO (free, 180 days)', 'ISO d’évaluation Windows Server 2022 (gratuit, 180 jours)'), t('Optional: a Windows 10/11 VM to join the domain', 'Optionnel : une VM Windows 10/11 à joindre au domaine')],
    steps: [
      { title: t('Create the VM', 'Créez la VM'), body: t('VirtualBox → New: 2 vCPU, 4 GB RAM, 60 GB disk, attach the ISO. Network: **Internal Network** named `netlab` (an isolated lab LAN). Install "Windows Server 2022 Standard (Desktop Experience)".', 'VirtualBox → Nouvelle : 2 vCPU, 4 Go RAM, disque 60 Go, ISO attaché. Réseau : **Réseau interne** nommé `netlab` (un LAN de lab isolé). Installez « Windows Server 2022 Standard (Expérience de bureau) ».') },
      { title: t('Rename and set a static IP', 'Renommez et fixez l’IP'), body: t('A domain controller must never change address. In PowerShell (admin):', 'Un contrôleur de domaine ne doit jamais changer d’adresse. En PowerShell (admin) :'), code: 'Rename-Computer -NewName DC01 -Restart\n# after reboot:\nNew-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 10.0.0.10 -PrefixLength 24 -DefaultGateway 10.0.0.1\nSet-DnsClientServerAddress -InterfaceAlias "Ethernet" -ServerAddresses 127.0.0.1' },
      { title: t('Install AD DS', 'Installez AD DS'), body: t('Add the Active Directory Domain Services role:', 'Ajoutez le rôle Services de domaine Active Directory :'), code: 'Install-WindowsFeature AD-Domain-Services -IncludeManagementTools' },
      { title: t('Promote to domain controller', 'Promouvez en contrôleur de domaine'), body: t('Create a new forest. The server reboots and DNS is installed automatically.', 'Créez une nouvelle forêt. Le serveur redémarre et le DNS s’installe automatiquement.'), code: 'Install-ADDSForest -DomainName "netlab.local" -DomainNetbiosName "NETLAB" -InstallDns', hint: t('You will be asked for a DSRM (recovery) password — write it down.', 'Un mot de passe DSRM (restauration) est demandé — notez-le.') },
      { title: t('Create OUs, groups and users', 'Créez OU, groupes et utilisateurs'), body: t('Organise by department:', 'Organisez par service :'), code: 'New-ADOrganizationalUnit -Name "Staff"\nNew-ADGroup -Name "GG-Accounting" -GroupScope Global -Path "OU=Staff,DC=netlab,DC=local"\nNew-ADUser -Name "Amina Diallo" -SamAccountName adiallo -Path "OU=Staff,DC=netlab,DC=local" `\n  -AccountPassword (Read-Host -AsSecureString) -Enabled $true\nAdd-ADGroupMember -Identity "GG-Accounting" -Members adiallo' },
      { title: t('Share a folder with permissions', 'Partagez un dossier avec permissions'), body: t('Give the group — never individual users — access:', 'Donnez l’accès au groupe — jamais aux utilisateurs individuels :'), code: 'New-Item -Path C:\\Shares\\Accounting -ItemType Directory\nNew-SmbShare -Name Accounting -Path C:\\Shares\\Accounting -ChangeAccess "NETLAB\\GG-Accounting"\nicacls C:\\Shares\\Accounting /grant "NETLAB\\GG-Accounting:(OI)(CI)M"' },
      { title: t('Verify', 'Vérifiez'), body: t('Check the domain and the user:', 'Vérifiez le domaine et l’utilisateur :'), code: 'Get-ADDomain | Select-Object DNSRoot\nGet-ADUser adiallo\nGet-SmbShare Accounting' },
    ],
    checkpoints: [
      { id: 'l4-c1', topic: 'l3-ad', difficulty: 2, kind: 'command', shell: 'PS C:\\>', prompt: t('Which PowerShell command installs the AD DS role (with tools)?', 'Quelle commande PowerShell installe le rôle AD DS (avec les outils) ?'), accept: ['Install-WindowsFeature AD-Domain-Services -IncludeManagementTools', 'Install-WindowsFeature -Name AD-Domain-Services -IncludeManagementTools'], explain: t('`Install-WindowsFeature AD-Domain-Services -IncludeManagementTools`', '`Install-WindowsFeature AD-Domain-Services -IncludeManagementTools`') },
      { id: 'l4-c2', topic: 'l3-ad', difficulty: 2, kind: 'mcq', prompt: t('Why must the DC use 127.0.0.1 (itself) as its DNS server?', 'Pourquoi le DC doit-il utiliser 127.0.0.1 (lui-même) comme DNS ?'), options: [t('It is faster', 'C’est plus rapide'), t('Active Directory relies on DNS records the DC hosts itself', 'Active Directory repose sur des enregistrements DNS hébergés par le DC'), t('Windows requires it for updates', 'Windows l’exige pour les mises à jour'), t('It is not necessary', 'Ce n’est pas nécessaire')], answer: 1, explain: t('Clients and DCs find each other through SRV records in the AD-integrated DNS.', 'Clients et DC se trouvent via les enregistrements SRV du DNS intégré à AD.') },
      { id: 'l4-c3', topic: 'l3-users', difficulty: 2, kind: 'tf', prompt: t('Best practice: grant share permissions directly to individual user accounts.', 'Bonne pratique : accorder les permissions de partage directement aux comptes utilisateurs.'), answer: false, explain: t('Grant to groups; manage membership. It scales and is auditable.', 'Accordez aux groupes ; gérez l’appartenance. C’est évolutif et auditable.') },
      { id: 'l4-c4', topic: 'l3-ad', difficulty: 2, kind: 'input', prompt: t('The domain is `netlab.local`. Write its distinguished name (DC=…).', 'Le domaine est `netlab.local`. Écrivez son nom distinctif (DC=…).'), accept: ['DC=netlab,DC=local', 'dc=netlab,dc=local'], explain: t('`DC=netlab,DC=local` — one DC= component per label.', '`DC=netlab,DC=local` — un composant DC= par label.') },
      { id: 'l4-c5', topic: 'l3-ad', difficulty: 3, kind: 'mcq', prompt: t('After promotion, a Windows 11 PC cannot join netlab.local ("domain could not be contacted"). Most likely cause?', 'Après promotion, un PC Windows 11 ne peut pas joindre netlab.local (« domaine introuvable »). Cause probable ?'), options: [t('The PC uses the ISP router as DNS instead of the DC', 'Le PC utilise le routeur du FAI comme DNS au lieu du DC'), t('The PC has too little RAM', 'Le PC a trop peu de RAM'), t('The share permissions', 'Les permissions de partage'), t('The user password is too long', 'Le mot de passe est trop long')], answer: 0, explain: t('Clients must use the DC (10.0.0.10) as DNS to locate the domain.', 'Les clients doivent utiliser le DC (10.0.0.10) comme DNS pour localiser le domaine.') },
    ],
    troubleshooting: [
      { symptom: t('Install-ADDSForest fails on the DNS check', 'Install-ADDSForest échoue sur le contrôle DNS'), fix: t('Set a static IP and point DNS to 127.0.0.1 before promoting.', 'Fixez une IP statique et le DNS sur 127.0.0.1 avant la promotion.') },
      { symptom: t('User cannot write to the share', 'L’utilisateur ne peut pas écrire dans le partage'), fix: t('Effective access = the most restrictive of share and NTFS permissions. Check both.', 'Accès effectif = le plus restrictif entre partage et NTFS. Vérifiez les deux.') },
    ],
    expected: t('`Get-ADDomain` returns netlab.local; the user exists in OU=Staff; the Accounting share is reachable as \\\\DC01\\Accounting by group members only.', '`Get-ADDomain` renvoie netlab.local ; l’utilisateur existe dans OU=Staff ; le partage Accounting est accessible en \\\\DC01\\Accounting par les membres du groupe uniquement.'),
    evaluation: [t('All steps completed (5 pts)', 'Toutes les étapes réalisées (5 pts)'), t('Checkpoint questions ≥ 80 % (5 pts)', 'Questions de contrôle ≥ 80 % (5 pts)')],
  },

  /* ------------------------------ Lab 5 (guided) ------------------------------ */
  {
    id: 'lab-5', number: 5, levelId: 'sysadmin', difficulty: 2, minutes: 75, kind: 'guided', xp: 250, skills: ['systems', 'security'],
    title: t('Deploy an Ubuntu Linux server', 'Déployez un serveur Linux Ubuntu'),
    scenario: t(
      'The development team needs a Linux server for internal tools. Install Ubuntu Server, give it a static address, create admin accounts, secure SSH and run a web service.',
      'L’équipe de développement a besoin d’un serveur Linux pour des outils internes. Installez Ubuntu Server, donnez-lui une adresse statique, créez des comptes admin, sécurisez SSH et faites tourner un service web.',
    ),
    objectives: [
      t('Install Ubuntu Server and configure netplan', 'Installer Ubuntu Server et configurer netplan'),
      t('Manage users, sudo and SSH keys', 'Gérer utilisateurs, sudo et clés SSH'),
      t('Install, enable and verify a systemd service', 'Installer, activer et vérifier un service systemd'),
    ],
    equipment: [t('VirtualBox, 2 GB RAM, 20 GB disk', 'VirtualBox, 2 Go de RAM, disque 20 Go'), t('Ubuntu Server 24.04 LTS ISO (free)', 'ISO Ubuntu Server 24.04 LTS (gratuit)')],
    steps: [
      { title: t('Install Ubuntu Server', 'Installez Ubuntu Server'), body: t('Create the VM (Bridged or Internal network). In the installer tick **Install OpenSSH server**. Create your first user `sysadmin`.', 'Créez la VM (réseau Pont ou Interne). Dans l’installeur, cochez **Install OpenSSH server**. Créez le premier utilisateur `sysadmin`.') },
      { title: t('Static IP with netplan', 'IP statique avec netplan'), body: t('Edit `/etc/netplan/50-cloud-init.yaml` (back it up first!):', 'Modifiez `/etc/netplan/50-cloud-init.yaml` (sauvegardez-le d’abord !) :'), code: 'network:\n  version: 2\n  ethernets:\n    enp0s3:\n      addresses: [10.0.0.20/24]\n      routes:\n        - to: default\n          via: 10.0.0.1\n      nameservers:\n        addresses: [10.0.0.10]\n\n# then\nsudo netplan apply\nip a' },
      { title: t('Users and sudo', 'Utilisateurs et sudo'), body: t('Create a second admin and give sudo rights:', 'Créez un second admin et donnez-lui sudo :'), code: 'sudo adduser amina\nsudo usermod -aG sudo amina\nid amina' },
      { title: t('Secure SSH with keys', 'Sécurisez SSH avec des clés'), body: t('From your own PC, create a key and copy it, then disable password and root login:', 'Depuis votre PC, créez une clé et copiez-la, puis désactivez la connexion par mot de passe et root :'), code: 'ssh-keygen -t ed25519\nssh-copy-id sysadmin@10.0.0.20\n\n# on the server:\nsudo cp /etc/ssh/sshd_config /etc/ssh/sshd_config.bak\nsudo nano /etc/ssh/sshd_config   # PasswordAuthentication no, PermitRootLogin no\nsudo systemctl restart ssh', hint: t('Test the key login in a SECOND terminal before closing the first one — or you can lock yourself out.', 'Testez la connexion par clé dans un SECOND terminal avant de fermer le premier — sinon vous pouvez vous bloquer.') },
      { title: t('Firewall', 'Pare-feu'), body: t('Allow only SSH and HTTP:', 'N’autorisez que SSH et HTTP :'), code: 'sudo ufw allow OpenSSH\nsudo ufw allow 80/tcp\nsudo ufw enable\nsudo ufw status' },
      { title: t('Web service', 'Service web'), body: t('Install nginx and check the service:', 'Installez nginx et vérifiez le service :'), code: 'sudo apt update && sudo apt install -y nginx\nsystemctl status nginx\ncurl -I http://localhost' },
    ],
    checkpoints: [
      { id: 'l5-c1', topic: 'l3-linux', difficulty: 1, kind: 'command', shell: '$', prompt: t('Apply a modified netplan configuration.', 'Appliquer une configuration netplan modifiée.'), accept: ['sudo netplan apply'], explain: t('`sudo netplan apply`', '`sudo netplan apply`') },
      { id: 'l5-c2', topic: 'l3-users', difficulty: 2, kind: 'command', shell: '$', prompt: t('Add user `amina` to the `sudo` group without removing other groups.', 'Ajouter l’utilisateur `amina` au groupe `sudo` sans retirer ses autres groupes.'), accept: ['sudo usermod -aG sudo amina', 'sudo usermod -a -G sudo amina', 'sudo adduser amina sudo', 'sudo gpasswd -a amina sudo'], explain: t('`-a` appends; without it `-G` would replace all groups.', '`-a` ajoute ; sans lui `-G` remplacerait tous les groupes.') },
      { id: 'l5-c3', topic: 'l3-linux', difficulty: 2, kind: 'command', shell: '$', prompt: t('Make nginx start automatically at boot.', 'Faire démarrer nginx automatiquement au boot.'), accept: ['sudo systemctl enable nginx', 'sudo systemctl enable --now nginx'], explain: t('`systemctl enable` creates the boot link; `--now` also starts it.', '`systemctl enable` crée le lien de démarrage ; `--now` le démarre aussi.') },
      { id: 'l5-c4', topic: 'l3-remote', difficulty: 2, kind: 'tf', prompt: t('After setting `PasswordAuthentication no`, you should close your only SSH session immediately to test it.', 'Après `PasswordAuthentication no`, il faut fermer immédiatement votre unique session SSH pour tester.'), answer: false, explain: t('Keep a session open and test from a second one — otherwise a mistake locks you out.', 'Gardez une session ouverte et testez depuis une seconde — sinon une erreur vous bloque.') },
      { id: 'l5-c5', topic: 'l3-linux', difficulty: 3, kind: 'mcq', prompt: t('`curl -I http://10.0.0.20` from another PC times out, but `curl -I http://localhost` works on the server. Most likely cause?', '`curl -I http://10.0.0.20` depuis un autre PC expire, mais `curl -I http://localhost` fonctionne sur le serveur. Cause probable ?'), options: [t('nginx is stopped', 'nginx est arrêté'), t('ufw does not allow port 80', 'ufw n’autorise pas le port 80'), t('DNS is broken', 'Le DNS est cassé'), t('The disk is full', 'Le disque est plein')], answer: 1, explain: t('Local works so the service runs; remote traffic is filtered → firewall rule.', 'En local ça marche donc le service tourne ; le trafic distant est filtré → règle de pare-feu.') },
    ],
    troubleshooting: [
      { symptom: t('netplan apply: "Invalid YAML"', 'netplan apply : « Invalid YAML »'), fix: t('YAML needs spaces (never tabs) and consistent indentation.', 'Le YAML exige des espaces (jamais de tabulations) et une indentation cohérente.') },
      { symptom: t('"Permission denied (publickey)"', '« Permission denied (publickey) »'), fix: t('The key was not copied for that user, or ~/.ssh permissions are too open (700 for the folder, 600 for authorized_keys).', 'La clé n’a pas été copiée pour cet utilisateur, ou les permissions de ~/.ssh sont trop ouvertes (700 pour le dossier, 600 pour authorized_keys).') },
    ],
    expected: t('`ip a` shows 10.0.0.20/24; SSH works with keys only; `curl -I` returns "HTTP/1.1 200 OK" from another machine.', '`ip a` affiche 10.0.0.20/24 ; SSH fonctionne uniquement par clé ; `curl -I` renvoie « HTTP/1.1 200 OK » depuis une autre machine.'),
    evaluation: [t('All steps completed (5 pts)', 'Toutes les étapes réalisées (5 pts)'), t('Checkpoint questions ≥ 80 % (5 pts)', 'Questions de contrôle ≥ 80 % (5 pts)')],
  },

  /* ------------------------------ Lab 6 ------------------------------ */
  {
    id: 'lab-6', number: 6, levelId: 'infrastructure', difficulty: 3, minutes: 60, kind: 'sim', xp: 400, badge: 'architect', skills: ['infrastructure', 'routing', 'security'],
    title: t('Build a small business infrastructure', 'Construisez l’infrastructure d’une PME'),
    scenario: t(
      'You are the new IT technician at "Lumen Design" (12 staff). The previous contractor left the network half-finished: departments are on separate subnets behind a firewall, an edge router connects to the Internet, and the printer "doesn’t work". Finish the configuration and verify every requirement.',
      'Vous êtes le nouveau technicien IT de « Lumen Design » (12 salariés). Le prestataire précédent a laissé le réseau à moitié fini : les services sont sur des sous-réseaux séparés derrière un pare-feu, un routeur de bordure relie Internet, et l’imprimante « ne marche pas ». Terminez la configuration et vérifiez chaque exigence.',
    ),
    objectives: [
      t('Configure a multi-interface firewall/router', 'Configurer un pare-feu/routeur multi-interfaces'),
      t('Find and fix a misconfigured device', 'Trouver et corriger un équipement mal configuré'),
      t('Use a default route and a return route to reach the Internet', 'Utiliser une route par défaut et une route de retour pour joindre Internet'),
    ],
    equipment: [t('Firewall FW0 (4 interfaces), edge router R-EDGE', 'Pare-feu FW0 (4 interfaces), routeur de bordure R-EDGE'), t('3 department switches', '3 commutateurs de service'), t('PCs, laptops, file server, printer, Internet server', 'PC, portables, serveur de fichiers, imprimante, serveur Internet')],
    palette: ['pc', 'laptop', 'server', 'printer'],
    initial: () =>
      build(
        [
          { id: 'fw', type: 'firewall', name: 'FW0', x: 560, y: 220 },
          { id: 'edge', type: 'router', name: 'R-EDGE', x: 560, y: 70, cfg: (d) => ({ ...d, ifaces: d.ifaces.map((i) => (i.name === 'Gi0/0/0' ? { ...i, ip: '10.255.0.2', mask: '255.255.255.252', up: true } : i.name === 'Gi0/0/1' ? { ...i, ip: '203.0.113.1', mask: '255.255.255.0', up: true } : i)) }) },
          { id: 'inet', type: 'server', name: 'INTERNET', x: 860, y: 70, cfg: host('203.0.113.10', '255.255.255.0', '203.0.113.1') },
          { id: 'swa', type: 'switch', name: 'SW-ADMIN', x: 220, y: 380 },
          { id: 'swi', type: 'switch', name: 'SW-IT', x: 560, y: 380 },
          { id: 'sws', type: 'switch', name: 'SW-STAFF', x: 900, y: 380 },
          { id: 'pa', type: 'pc', name: 'ADMIN-PC', x: 120, y: 540, cfg: host('10.0.10.10', '255.255.255.0', '10.0.10.1') },
          { id: 'prn', type: 'printer', name: 'PRINTER', x: 320, y: 540, cfg: host('10.0.10.50', '255.255.0.0', '10.0.10.254') },
          { id: 'srv', type: 'server', name: 'FILE-SRV', x: 480, y: 540, cfg: host('10.0.20.5', '255.255.255.0', '10.0.20.1') },
          { id: 'pi', type: 'pc', name: 'IT-PC', x: 640, y: 540, cfg: host() },
          { id: 'l1', type: 'laptop', name: 'STAFF-LAP1', x: 820, y: 540, cfg: host('10.0.30.21', '255.255.255.0', '10.0.30.1') },
          { id: 'l2', type: 'laptop', name: 'STAFF-LAP2', x: 980, y: 540, cfg: host('10.0.30.22', '255.255.255.0') },
        ],
        [
          ['edge', 'Gi0/0/0', 'fw', 'Gi1/4'], ['edge', 'Gi0/0/1', 'inet', 'Fa0'],
          ['fw', 'Gi1/1', 'swa', 'Gi0/1'], ['fw', 'Gi1/2', 'swi', 'Gi0/1'], ['fw', 'Gi1/3', 'sws', 'Gi0/1'],
          ['pa', 'Fa0', 'swa', 'Fa0/1'], ['prn', 'Fa0', 'swa', 'Fa0/2'],
          ['srv', 'Fa0', 'swi', 'Fa0/1'], ['pi', 'Fa0', 'swi', 'Fa0/2'],
          ['l1', 'Fa0', 'sws', 'Fa0/1'], ['l2', 'Fa0', 'sws', 'Fa0/2'],
        ],
      ),
    steps: [
      { title: t('Read the addressing plan', 'Lisez le plan d’adressage'), body: t('- ADMIN 10.0.10.0/24 → FW0 Gi1/1 = 10.0.10.1\n- IT 10.0.20.0/24 → FW0 Gi1/2 = 10.0.20.1\n- STAFF 10.0.30.0/24 → FW0 Gi1/3 = 10.0.30.1\n- Transit 10.255.0.0/30 → FW0 Gi1/4 = 10.255.0.1, R-EDGE = 10.255.0.2\n- Internet server 203.0.113.10', '- ADMIN 10.0.10.0/24 → FW0 Gi1/1 = 10.0.10.1\n- IT 10.0.20.0/24 → FW0 Gi1/2 = 10.0.20.1\n- STAFF 10.0.30.0/24 → FW0 Gi1/3 = 10.0.30.1\n- Transit 10.255.0.0/30 → FW0 Gi1/4 = 10.255.0.1, R-EDGE = 10.255.0.2\n- Serveur Internet 203.0.113.10') },
      { title: t('Configure FW0', 'Configurez FW0'), body: t('Four interfaces, each with its gateway address, and no shutdown:', 'Quatre interfaces, chacune avec son adresse de passerelle, et no shutdown :'), code: 'enable\nconfigure terminal\ninterface g1/1\nip address 10.0.10.1 255.255.255.0\nno shutdown\ninterface g1/2\nip address 10.0.20.1 255.255.255.0\nno shutdown\ninterface g1/3\nip address 10.0.30.1 255.255.255.0\nno shutdown\ninterface g1/4\nip address 10.255.0.1 255.255.255.252\nno shutdown' },
      { title: t('Fix the hosts', 'Corrigez les hôtes'), body: t('Inspect every host’s IP Configuration. One has no address at all, one is missing its gateway, and the printer is wrong in two ways.', 'Inspectez la configuration IP de chaque hôte. L’un n’a aucune adresse, un autre n’a pas de passerelle, et l’imprimante a deux erreurs.'), hint: t('IT-PC: use 10.0.20.10. Printer: mask /24 and the department gateway.', 'IT-PC : utilisez 10.0.20.10. Imprimante : masque /24 et la passerelle du service.') },
      { title: t('Route to the Internet', 'Route vers Internet'), body: t('FW0 needs a **default route** to R-EDGE, and R-EDGE needs a **return route** for the company networks:', 'FW0 a besoin d’une **route par défaut** vers R-EDGE, et R-EDGE d’une **route de retour** vers les réseaux de l’entreprise :'), code: '! on FW0\nip route 0.0.0.0 0.0.0.0 10.255.0.2\n\n! on R-EDGE\nenable\nconfigure terminal\nip route 10.0.0.0 255.0.0.0 10.255.0.1', hint: t('A reply needs a route back. If pings to 203.0.113.10 time out, check R-EDGE’s routes with `show ip route`.', 'Une réponse a besoin d’une route retour. Si les pings vers 203.0.113.10 expirent, vérifiez les routes de R-EDGE avec `show ip route`.') },
      { title: t('Verify every requirement', 'Vérifiez chaque exigence'), body: t('From ADMIN-PC: ping FILE-SRV, the printer, and the Internet server. From STAFF-LAP2: ping the printer.', 'Depuis ADMIN-PC : pinguez FILE-SRV, l’imprimante et le serveur Internet. Depuis STAFF-LAP2 : pinguez l’imprimante.'), code: 'ping 10.0.20.5\nping 10.0.10.50\ntracert 203.0.113.10' },
    ],
    tasks: [
      { id: 'fw-lan', points: 3, label: t('FW0 Gi1/1–1/3 configured with .1 addresses and up', 'FW0 Gi1/1–1/3 configurées en .1 et actives'), check: (x) => ifIs(x, 'fw', 'Gi1/1', '10.0.10.1', '255.255.255.0') && ifIs(x, 'fw', 'Gi1/2', '10.0.20.1', '255.255.255.0') && ifIs(x, 'fw', 'Gi1/3', '10.0.30.1', '255.255.255.0') },
      { id: 'fw-wan', points: 1, label: t('FW0 Gi1/4 = 10.255.0.1/30 and up', 'FW0 Gi1/4 = 10.255.0.1/30 et active'), check: (x) => ifIs(x, 'fw', 'Gi1/4', '10.255.0.1', '255.255.255.252') },
      { id: 'itpc', points: 1, label: t('IT-PC addressed in 10.0.20.0/24 with gateway', 'IT-PC adressé en 10.0.20.0/24 avec passerelle'), check: (x) => { const d = byId(x, 'pi'); return !!d?.ifaces[0].ip?.startsWith('10.0.20.') && d.ifaces[0].mask === '255.255.255.0' && d.gateway === '10.0.20.1' } },
      { id: 'lap2', points: 1, label: t('STAFF-LAP2 has its default gateway', 'STAFF-LAP2 a sa passerelle par défaut'), check: (x) => byId(x, 'l2')?.gateway === '10.0.30.1' },
      { id: 'printer', points: 2, label: t('Printer fixed: /24 mask and gateway 10.0.10.1', 'Imprimante corrigée : masque /24 et passerelle 10.0.10.1'), check: (x) => hostIs(x, 'prn', '10.0.10.50', '255.255.255.0', '10.0.10.1') },
      { id: 'admin-srv', points: 2, label: t('ADMIN-PC reaches FILE-SRV', 'ADMIN-PC joint FILE-SRV'), check: (x) => pingById(x, 'pa', '10.0.20.5') },
      { id: 'staff-prn', points: 2, label: t('STAFF-LAP2 reaches the printer', 'STAFF-LAP2 joint l’imprimante'), check: (x) => pingById(x, 'l2', '10.0.10.50') },
      { id: 'internet', points: 3, label: t('ADMIN-PC reaches the Internet server (default + return route)', 'ADMIN-PC joint le serveur Internet (route par défaut + retour)'), check: (x) => pingById(x, 'pa', '203.0.113.10') },
    ],
    troubleshooting: [
      { symptom: t('Department PCs cannot reach each other', 'Les PC de services différents ne se joignent pas'), fix: t('`show ip interface brief` on FW0: all LAN interfaces up/up? Every host has the right gateway?', '`show ip interface brief` sur FW0 : toutes les interfaces LAN up/up ? Chaque hôte a la bonne passerelle ?') },
      { symptom: t('Internet pings time out', 'Les pings Internet expirent'), fix: t('Two routes are needed: FW0 → default route; R-EDGE → route back to 10.0.0.0/8.', 'Deux routes sont nécessaires : FW0 → route par défaut ; R-EDGE → route retour vers 10.0.0.0/8.') },
      { symptom: t('Only the printer is unreachable', 'Seule l’imprimante est injoignable'), fix: t('A /16 mask makes it think other departments are local, and its gateway does not exist.', 'Un masque /16 lui fait croire que les autres services sont locaux, et sa passerelle n’existe pas.') },
    ],
    expected: t('All departments reach each other through FW0; the printer replies; tracert from ADMIN-PC to 203.0.113.10 shows 10.0.10.1 then 10.255.0.2.', 'Tous les services se joignent via FW0 ; l’imprimante répond ; tracert depuis ADMIN-PC vers 203.0.113.10 affiche 10.0.10.1 puis 10.255.0.2.'),
    evaluation: [t('Firewall interfaces (4 pts)', 'Interfaces du pare-feu (4 pts)'), t('Host corrections (4 pts)', 'Corrections des hôtes (4 pts)'), t('Inter-department reachability (4 pts)', 'Accessibilité inter-services (4 pts)'), t('Internet routing (3 pts)', 'Routage Internet (3 pts)')],
    packetTracer: t('In Packet Tracer use an ISR4331 in place of FW0 (interfaces g0/0/0–0/0/2 plus a NIM module), or an ASA with "nameif"/"security-level" commands.', 'Dans Packet Tracer, utilisez un ISR4331 à la place de FW0 (interfaces g0/0/0–0/0/2 plus un module NIM), ou un ASA avec les commandes « nameif »/« security-level ».'),
  },
  /* ------------------------------ Lab 7 ------------------------------ */
  {
    id: 'lab-7', number: 7, levelId: 'technician', difficulty: 3, minutes: 40, kind: 'sim', xp: 260, skills: ['routing', 'networking'], recommendedAfter: 'l2-trunk.2',
    title: t('Inter-VLAN routing: router on a stick', 'Routage inter-VLAN : routeur sur un bâton'),
    scenario: t(
      'Staff (VLAN 10, 192.168.10.0/24) and Accounting (VLAN 20, 192.168.20.0/24) share one switch. They are isolated — but accountants must reach the staff printer. You have one router with a single cable to the switch. Configure a trunk and router sub-interfaces.',
      'Personnel (VLAN 10, 192.168.10.0/24) et Comptabilité (VLAN 20, 192.168.20.0/24) partagent un switch. Ils sont isolés — mais la comptabilité doit atteindre l’imprimante du personnel. Vous avez un routeur relié au switch par un seul câble. Configurez un trunk et des sous-interfaces.',
    ),
    objectives: [
      t('Create VLANs and assign access ports', 'Créer des VLAN et affecter les ports d’accès'),
      t('Configure an 802.1Q trunk towards the router', 'Configurer un trunk 802.1Q vers le routeur'),
      t('Configure router sub-interfaces with encapsulation dot1q', 'Configurer des sous-interfaces avec encapsulation dot1q'),
    ],
    equipment: [t('1 × ISR4331 router', '1 × routeur ISR4331'), t('1 × 2960 switch', '1 × switch 2960'), t('2 PCs + 1 printer (pre-cabled)', '2 PC + 1 imprimante (pré-câblés)')],
    palette: ['pc', 'laptop', 'printer'],
    initial: () =>
      build(
        [
          { id: 'r1', type: 'router', name: 'R1', x: 520, y: 110 },
          { id: 'sw', type: 'switch', name: 'SW1', x: 520, y: 290 },
          { id: 'staff', type: 'pc', name: 'STAFF-PC', x: 280, y: 460, cfg: host('192.168.10.10', '255.255.255.0', '192.168.10.1') },
          { id: 'prn', type: 'printer', name: 'STAFF-PRN', x: 480, y: 470, cfg: host('192.168.10.50', '255.255.255.0', '192.168.10.1') },
          { id: 'acct', type: 'pc', name: 'ACCT-PC', x: 760, y: 460, cfg: host('192.168.20.10', '255.255.255.0', '192.168.20.1') },
        ],
        [
          ['r1', 'Gi0/0/0', 'sw', 'Gi0/1'],
          ['staff', 'Fa0', 'sw', 'Fa0/1'],
          ['prn', 'Fa0', 'sw', 'Fa0/2'],
          ['acct', 'Fa0', 'sw', 'Fa0/11'],
        ],
      ),
    steps: [
      { title: t('VLANs on the switch', 'Les VLAN sur le switch'), body: t('Create the VLANs and put Fa0/1–2 in VLAN 10, Fa0/11 in VLAN 20.', 'Créez les VLAN et mettez Fa0/1–2 dans le VLAN 10, Fa0/11 dans le VLAN 20.'), code: 'enable\nconfigure terminal\nvlan 10\nname STAFF\nvlan 20\nname ACCOUNTING\ninterface range fa0/1 - 2\nswitchport mode access\nswitchport access vlan 10\ninterface fa0/11\nswitchport mode access\nswitchport access vlan 20' },
      { title: t('Trunk to the router', 'Trunk vers le routeur'), body: t('The switch port facing the router must carry both VLANs.', 'Le port du switch face au routeur doit transporter les deux VLAN.'), code: 'interface gi0/1\nswitchport mode trunk\nend' },
      { title: t('Router sub-interfaces', 'Sous-interfaces du routeur'), body: t('Turn on the physical interface (no IP on it!), then one sub-interface per VLAN with its gateway address.', 'Activez l’interface physique (sans IP !), puis une sous-interface par VLAN avec son adresse de passerelle.'), code: 'enable\nconfigure terminal\ninterface g0/0/0\nno shutdown\ninterface g0/0/0.10\nencapsulation dot1q 10\nip address 192.168.10.1 255.255.255.0\ninterface g0/0/0.20\nencapsulation dot1q 20\nip address 192.168.20.1 255.255.255.0\nend\nshow ip interface brief', hint: t('The number after the dot is just a name; the VLAN is set by `encapsulation dot1q`. Matching them keeps things readable.', 'Le numéro après le point n’est qu’un nom ; le VLAN est fixé par `encapsulation dot1q`. Les faire correspondre reste lisible.') },
      { title: t('Verify', 'Vérifiez'), body: t('From ACCT-PC, ping its gateway, then the staff printer. In Simulation mode, watch the frame go up the trunk tagged 20 and come back down tagged 10.', 'Depuis ACCT-PC, pinguez sa passerelle, puis l’imprimante. En mode Simulation, regardez la trame monter le trunk étiquetée 20 et redescendre étiquetée 10.'), code: 'ping 192.168.20.1\nping 192.168.10.50' },
    ],
    tasks: [
      { id: 'vlans', points: 1, label: t('VLAN 10 and 20 exist on SW1', 'VLAN 10 et 20 existent sur SW1'), check: (x) => !!byId(x, 'sw')?.vlans?.[10] && !!byId(x, 'sw')?.vlans?.[20] },
      { id: 'ports', points: 2, label: t('Access ports in the right VLANs', 'Ports d’accès dans les bons VLAN'), check: (x) => ifc(x, 'sw', 'Fa0/1')?.vlan === 10 && ifc(x, 'sw', 'Fa0/2')?.vlan === 10 && ifc(x, 'sw', 'Fa0/11')?.vlan === 20 },
      { id: 'trunk', points: 2, label: t('Gi0/1 is a trunk', 'Gi0/1 est un trunk'), check: (x) => ifc(x, 'sw', 'Gi0/1')?.mode === 'trunk' },
      { id: 'sub10', points: 2, label: t('Sub-interface for VLAN 10 = 192.168.10.1/24', 'Sous-interface VLAN 10 = 192.168.10.1/24'), check: (x) => !!byId(x, 'r1')?.ifaces.some((i) => i.parent === 'Gi0/0/0' && i.dot1q === 10 && i.ip === '192.168.10.1' && i.mask === '255.255.255.0') },
      { id: 'sub20', points: 2, label: t('Sub-interface for VLAN 20 = 192.168.20.1/24', 'Sous-interface VLAN 20 = 192.168.20.1/24'), check: (x) => !!byId(x, 'r1')?.ifaces.some((i) => i.parent === 'Gi0/0/0' && i.dot1q === 20 && i.ip === '192.168.20.1' && i.mask === '255.255.255.0') },
      { id: 'gw', points: 1, label: t('ACCT-PC reaches its gateway', 'ACCT-PC joint sa passerelle'), check: (x) => pingById(x, 'acct', '192.168.20.1') },
      { id: 'inter', points: 3, label: t('ACCT-PC reaches the staff printer (routed between VLANs)', 'ACCT-PC joint l’imprimante du personnel (routage inter-VLAN)'), check: (x) => pingById(x, 'acct', '192.168.10.50') },
      { id: 'staff', points: 1, label: t('STAFF-PC reaches ACCT-PC', 'STAFF-PC joint ACCT-PC'), check: (x) => pingById(x, 'staff', '192.168.20.10') },
    ],
    troubleshooting: [
      { symptom: t('Sub-interfaces are "down"', 'Les sous-interfaces sont « down »'), fix: t('The physical Gi0/0/0 must be `no shutdown`.', 'L’interface physique Gi0/0/0 doit être en `no shutdown`.') },
      { symptom: t('One VLAN works, the other does not', 'Un VLAN marche, l’autre non'), fix: t('Check `encapsulation dot1q` numbers and the access VLAN of each port.', 'Vérifiez les numéros `encapsulation dot1q` et le VLAN d’accès de chaque port.') },
      { symptom: t('Nothing reaches the router', 'Rien n’atteint le routeur'), fix: t('Is Gi0/1 on the switch a trunk? `show interfaces trunk`.', 'Gi0/1 du switch est-il en trunk ? `show interfaces trunk`.') },
    ],
    expected: t('Both sub-interfaces up/up in `show ip interface brief`; ACCT-PC pings 192.168.10.50 with TTL=127.', 'Les deux sous-interfaces up/up dans `show ip interface brief` ; ACCT-PC pingue 192.168.10.50 avec TTL=127.'),
    evaluation: [t('Switching: VLANs, access ports, trunk (5 pts)', 'Commutation : VLAN, ports, trunk (5 pts)'), t('Router sub-interfaces (4 pts)', 'Sous-interfaces (4 pts)'), t('Verified inter-VLAN connectivity (5 pts)', 'Connectivité inter-VLAN vérifiée (5 pts)')],
    packetTracer: t('Identical commands in Packet Tracer with an ISR4331 and a 2960.', 'Commandes identiques dans Packet Tracer avec un ISR4331 et un 2960.'),
  },

  /* ------------------------------ Lab 8 ------------------------------ */
  {
    id: 'lab-8', number: 8, levelId: 'technician', difficulty: 3, minutes: 45, kind: 'sim', xp: 280, skills: ['routing'], recommendedAfter: 'l2-routing.1',
    title: t('Static routing across three sites', 'Routage statique entre trois sites'),
    scenario: t(
      'Head office (HQ), a warehouse and a branch are linked in a chain: HQ — WAREHOUSE — BRANCH. Each site has its own LAN and the WAN links are already addressed. Nobody can reach the other sites yet. Add static routes — in both directions — so every LAN reaches every other LAN.',
      'Le siège (HQ), un entrepôt et une agence sont reliés en chaîne : HQ — ENTREPÔT — AGENCE. Chaque site a son LAN et les liens WAN sont déjà adressés. Personne n’atteint encore les autres sites. Ajoutez des routes statiques — dans les deux sens — pour que chaque LAN joigne tous les autres.',
    ),
    objectives: [
      t('Read routing tables and find missing networks', 'Lire les tables de routage et trouver les réseaux manquants'),
      t('Write static routes with the correct next hop', 'Écrire des routes statiques avec le bon saut suivant'),
      t('Use a default route on a stub site', 'Utiliser une route par défaut sur un site terminal'),
    ],
    equipment: [t('3 × ISR4331 routers (pre-addressed)', '3 × routeurs ISR4331 (pré-adressés)'), t('3 × PCs (pre-addressed)', '3 × PC (pré-adressés)')],
    palette: ['pc', 'laptop'],
    initial: () => {
      const r = (ifs: Record<string, [string, string]>) => (d: SimDevice): SimDevice => ({ ...d, ifaces: d.ifaces.map((i) => (ifs[i.name] ? { ...i, ip: ifs[i.name][0], mask: ifs[i.name][1], up: true } : i)) })
      return build(
        [
          { id: 'hq', type: 'router', name: 'R-HQ', x: 220, y: 200, cfg: r({ 'Gi0/0/0': ['10.1.0.1', '255.255.255.0'], 'Gi0/0/1': ['172.16.12.1', '255.255.255.252'] }) },
          { id: 'wh', type: 'router', name: 'R-WAREHOUSE', x: 520, y: 200, cfg: r({ 'Gi0/0/0': ['10.2.0.1', '255.255.255.0'], 'Gi0/0/1': ['172.16.12.2', '255.255.255.252'], 'Gi0/0/2': ['172.16.23.1', '255.255.255.252'] }) },
          { id: 'br', type: 'router', name: 'R-BRANCH', x: 820, y: 200, cfg: r({ 'Gi0/0/0': ['10.3.0.1', '255.255.255.0'], 'Gi0/0/2': ['172.16.23.2', '255.255.255.252'] }) },
          { id: 'pchq', type: 'pc', name: 'HQ-PC', x: 220, y: 420, cfg: host('10.1.0.10', '255.255.255.0', '10.1.0.1') },
          { id: 'pcwh', type: 'pc', name: 'WH-PC', x: 520, y: 420, cfg: host('10.2.0.10', '255.255.255.0', '10.2.0.1') },
          { id: 'pcbr', type: 'pc', name: 'BR-PC', x: 820, y: 420, cfg: host('10.3.0.10', '255.255.255.0', '10.3.0.1') },
        ],
        [
          ['hq', 'Gi0/0/1', 'wh', 'Gi0/0/1'],
          ['wh', 'Gi0/0/2', 'br', 'Gi0/0/2'],
          ['pchq', 'Fa0', 'hq', 'Gi0/0/0'],
          ['pcwh', 'Fa0', 'wh', 'Gi0/0/0'],
          ['pcbr', 'Fa0', 'br', 'Gi0/0/0'],
        ],
      )
    },
    steps: [
      { title: t('Look before you type', 'Regardez avant de taper'), body: t('On each router run `show ip route`. Which networks does each one know (C)? Which are missing?', 'Sur chaque routeur lancez `show ip route`. Quels réseaux chacun connaît-il (C) ? Lesquels manquent ?'), code: 'enable\nshow ip route' },
      { title: t('R-HQ', 'R-HQ'), body: t('HQ only has one way out (towards the warehouse). Each remote LAN goes via 172.16.12.2.', 'Le siège n’a qu’une sortie (vers l’entrepôt). Chaque LAN distant passe par 172.16.12.2.'), code: 'configure terminal\nip route 10.2.0.0 255.255.255.0 172.16.12.2\nip route 10.3.0.0 255.255.255.0 172.16.12.2' },
      { title: t('R-WAREHOUSE', 'R-ENTREPÔT'), body: t('The warehouse sits in the middle: it knows both WAN links but not the two outer LANs.', 'L’entrepôt est au milieu : il connaît les deux liens WAN mais pas les deux LAN extérieurs.'), code: 'configure terminal\nip route 10.1.0.0 255.255.255.0 172.16.12.1\nip route 10.3.0.0 255.255.255.0 172.16.23.2' },
      { title: t('R-BRANCH: a stub site', 'R-AGENCE : un site terminal'), body: t('The branch has a single exit — one default route is enough.', 'L’agence n’a qu’une sortie — une route par défaut suffit.'), code: 'configure terminal\nip route 0.0.0.0 0.0.0.0 172.16.23.1', hint: t('Routing must work in BOTH directions: a ping needs a route there and a route back.', 'Le routage doit marcher dans les DEUX sens : un ping a besoin d’une route aller et d’une route retour.') },
      { title: t('Verify', 'Vérifiez'), body: t('From HQ-PC: ping and tracert BR-PC. You should see 3 hops and TTL=125 (3 routers crossed).', 'Depuis HQ-PC : ping et tracert de BR-PC. Vous devriez voir 3 sauts et TTL=125 (3 routeurs traversés).'), code: 'ping 10.3.0.10\ntracert 10.3.0.10' },
    ],
    tasks: [
      { id: 'hq-wh', points: 2, label: t('HQ-PC reaches WH-PC', 'HQ-PC joint WH-PC'), check: (x) => pingById(x, 'pchq', '10.2.0.10') },
      { id: 'hq-br', points: 3, label: t('HQ-PC reaches BR-PC (two hops away)', 'HQ-PC joint BR-PC (à deux sauts)'), check: (x) => pingById(x, 'pchq', '10.3.0.10') },
      { id: 'wh-br', points: 2, label: t('WH-PC reaches BR-PC', 'WH-PC joint BR-PC'), check: (x) => pingById(x, 'pcwh', '10.3.0.10') },
      { id: 'br-hq', points: 2, label: t('BR-PC reaches HQ-PC', 'BR-PC joint HQ-PC'), check: (x) => pingById(x, 'pcbr', '10.1.0.10') },
      { id: 'stub', points: 2, label: t('R-BRANCH uses a single default route', 'R-AGENCE utilise une seule route par défaut'), check: (x) => { const rt = byId(x, 'br')?.routes ?? []; return rt.length === 1 && rt[0].net === '0.0.0.0' && rt[0].mask === '0.0.0.0' } },
    ],
    troubleshooting: [
      { symptom: t('Ping to a remote PC times out', 'Le ping d’un PC distant expire'), fix: t('Check the return path: does the far router have a route back to your LAN?', 'Vérifiez le retour : le routeur distant a-t-il une route vers votre LAN ?') },
      { symptom: t('"% Inconsistent address and mask"', '« % Inconsistent address and mask »'), fix: t('Use the network address (10.2.0.0), not a host address (10.2.0.1), in ip route.', 'Utilisez l’adresse réseau (10.2.0.0), pas une adresse d’hôte (10.2.0.1), dans ip route.') },
      { symptom: t('Ping shows "Destination host unreachable" from a router', 'Le ping affiche « Destination host unreachable » depuis un routeur'), fix: t('That router has no route for the destination — `show ip route` on it.', 'Ce routeur n’a pas de route pour la destination — `show ip route` dessus.') },
    ],
    expected: t('Every PC pings every other PC; tracert from HQ-PC to BR-PC lists 10.1.0.1, 172.16.12.2, 172.16.23.2.', 'Chaque PC pingue tous les autres ; tracert de HQ-PC vers BR-PC liste 10.1.0.1, 172.16.12.2, 172.16.23.2.'),
    evaluation: [t('Connectivity between all sites (9 pts)', 'Connectivité entre tous les sites (9 pts)'), t('Clean design: default route on the stub (2 pts)', 'Conception propre : route par défaut sur le site terminal (2 pts)')],
    packetTracer: t('Same in Packet Tracer — try OSPF afterwards and compare the routing tables.', 'Pareil dans Packet Tracer — essayez OSPF ensuite et comparez les tables de routage.'),
  },

  /* ------------------------------ Lab 9 ------------------------------ */
  {
    id: 'lab-9', number: 9, levelId: 'technician', difficulty: 3, minutes: 40, kind: 'sim', xp: 300, skills: ['networking', 'routing'], recommendedAfter: 'l2-troubleshoot.3',
    title: t('Troubleshooting lab: the broken branch office', 'Lab de dépannage : l’agence en panne'),
    scenario: t(
      'A contractor built the branch network last night and went home. Nothing works. There are FOUR different faults hidden in the configuration (layers 1 to 3). Find them with show commands, ipconfig and ping — then fix them. No step-by-step instructions this time: use the method.',
      'Un prestataire a monté le réseau de l’agence cette nuit puis est rentré chez lui. Rien ne marche. QUATRE pannes différentes sont cachées dans la configuration (couches 1 à 3). Trouvez-les avec les commandes show, ipconfig et ping — puis corrigez-les. Pas de pas-à-pas cette fois : appliquez la méthode.',
    ),
    objectives: [
      t('Apply bottom-up troubleshooting on a real topology', 'Appliquer le dépannage de bas en haut sur une vraie topologie'),
      t('Find faults at layers 1, 2 and 3', 'Trouver des pannes en couches 1, 2 et 3'),
    ],
    equipment: [t('Router, switch, 3 PCs, 1 server — all pre-configured (badly)', 'Routeur, switch, 3 PC, 1 serveur — tous préconfigurés (mal)')],
    palette: [],
    initial: () =>
      build(
        [
          { id: 'r1', type: 'router', name: 'R-BRANCH', x: 520, y: 100, cfg: (d) => ({ ...d, ifaces: d.ifaces.map((i) => (i.name === 'Gi0/0/0' ? { ...i, ip: '192.168.50.1', mask: '255.255.255.0', up: true } : i.name === 'Gi0/0/1' ? { ...i, ip: '192.168.60.1', mask: '255.255.255.0', up: false } : i)) }) },
          { id: 'sw', type: 'switch', name: 'SW-BRANCH', x: 380, y: 280, cfg: (d) => ({ ...d, vlans: { 1: 'default', 50: 'USERS' }, ifaces: d.ifaces.map((i) => (['Fa0/1', 'Fa0/2', 'Gi0/1'].includes(i.name) ? { ...i, vlan: 50, mode: 'access' as const } : i.name === 'Fa0/3' ? { ...i, vlan: 1, mode: 'access' as const } : i)) }) },
          { id: 'pc1', type: 'pc', name: 'PC-1', x: 180, y: 460, cfg: host('192.168.50.11', '255.255.255.0', '192.168.50.1') },
          { id: 'pc2', type: 'pc', name: 'PC-2', x: 380, y: 460, cfg: host('192.168.50.12', '255.255.255.0', '192.168.5.1') },
          { id: 'pc3', type: 'pc', name: 'PC-3', x: 580, y: 460, cfg: host('192.168.50.13', '255.255.255.0', '192.168.50.1') },
          { id: 'srv', type: 'server', name: 'SRV-FILES', x: 820, y: 280, cfg: host('192.168.60.10', '255.255.255.0', '192.168.60.254') },
        ],
        [
          ['r1', 'Gi0/0/0', 'sw', 'Gi0/1'],
          ['pc1', 'Fa0', 'sw', 'Fa0/1'],
          ['pc2', 'Fa0', 'sw', 'Fa0/2'],
          ['pc3', 'Fa0', 'sw', 'Fa0/3'],
          ['srv', 'Fa0', 'r1', 'Gi0/0/1'],
        ],
      ),
    steps: [
      { title: t('Map the network', 'Cartographiez le réseau'), body: t('Users: 192.168.50.0/24 (VLAN 50), gateway .1. Server LAN: 192.168.60.0/24, gateway .1. Every PC must reach SRV-FILES (192.168.60.10).', 'Utilisateurs : 192.168.50.0/24 (VLAN 50), passerelle .1. LAN serveur : 192.168.60.0/24, passerelle .1. Chaque PC doit joindre SRV-FILES (192.168.60.10).') },
      { title: t('Use the method', 'Appliquez la méthode'), body: t('From each PC: `ipconfig`, `ping` the gateway, `ping` the server. On the switch: `show vlan brief`. On the router: `show ip interface brief`. Note every anomaly before fixing anything.', 'Depuis chaque PC : `ipconfig`, `ping` de la passerelle, `ping` du serveur. Sur le switch : `show vlan brief`. Sur le routeur : `show ip interface brief`. Notez chaque anomalie avant de corriger.'), hint: t('Faults: one router interface, one switch port, one PC gateway… and the fourth one only appears once the first three are fixed. Look at the server.', 'Pannes : une interface de routeur, un port de switch, une passerelle de PC… et la quatrième n’apparaît qu’une fois les trois premières corrigées. Regardez le serveur.') },
    ],
    tasks: [
      { id: 'pc1', points: 2, label: t('PC-1 reaches SRV-FILES', 'PC-1 joint SRV-FILES'), check: (x) => pingById(x, 'pc1', '192.168.60.10') },
      { id: 'pc2', points: 3, label: t('PC-2 reaches SRV-FILES', 'PC-2 joint SRV-FILES'), check: (x) => pingById(x, 'pc2', '192.168.60.10') },
      { id: 'pc3', points: 3, label: t('PC-3 reaches SRV-FILES', 'PC-3 joint SRV-FILES'), check: (x) => pingById(x, 'pc3', '192.168.60.10') },
      { id: 'clean', points: 2, label: t('No PC left in VLAN 1', 'Aucun PC laissé dans le VLAN 1'), check: (x) => ['Fa0/1', 'Fa0/2', 'Fa0/3'].every((p) => ifc(x, 'sw', p)?.vlan === 50) },
    ],
    troubleshooting: [
      { symptom: t('Nobody reaches the server', 'Personne n’atteint le serveur'), fix: t('Router: one interface is administratively down.', 'Routeur : une interface est administrativement coupée.') },
      { symptom: t('PC-3 cannot even ping its gateway', 'PC-3 ne pingue même pas sa passerelle'), fix: t('Its switch port is in the wrong VLAN.', 'Son port de switch est dans le mauvais VLAN.') },
      { symptom: t('PC-2 reaches local PCs only', 'PC-2 n’atteint que les PC locaux'), fix: t('Look carefully at its default gateway.', 'Regardez attentivement sa passerelle par défaut.') },
    ],
    expected: t('All three PCs ping 192.168.60.10 with TTL=127.', 'Les trois PC pinguent 192.168.60.10 avec TTL=127.'),
    evaluation: [t('Each repaired path (8 pts)', 'Chaque chemin réparé (8 pts)'), t('Clean VLAN configuration (2 pts)', 'Configuration VLAN propre (2 pts)')],
    packetTracer: t('Recreate the broken topology in Packet Tracer and challenge a friend to fix it.', 'Recréez la topologie cassée dans Packet Tracer et mettez un ami au défi de la réparer.'),
  },

]

export const labById = (id: string) => LABS.find((l) => l.id === id)

/** Score a simulator topology against its lab tasks. */
export function gradeLab(lab: LabDef, topo: Topology) {
  const results = (lab.tasks ?? []).map((task) => ({ task, ok: (() => { try { return task.check(topo) } catch { return false } })() }))
  const total = results.reduce((s, r) => s + r.task.points, 0)
  const got = results.reduce((s, r) => s + (r.ok ? r.task.points : 0), 0)
  return { results, ratio: total ? got / total : 0, got, total }
}
