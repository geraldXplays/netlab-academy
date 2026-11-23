import type { ExamQuestion } from '../lessons/types'
import { t } from '../lessons/types'

/**
 * Procedural IPv4 / subnetting exercises. Every question is generated with
 * its own worked explanation, so practice never runs out and never repeats.
 */

const r = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1))
const pick = <T,>(xs: readonly T[]) => xs[Math.floor(Math.random() * xs.length)]
let seq = 0
const gid = (k: string) => `gen-${k}-${Date.now().toString(36)}-${seq++}`

export const ipToInt = (ip: string) => ip.split('.').reduce((n, o) => (n << 8) + Number(o), 0) >>> 0
export const intToIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.')
export const maskInt = (p: number) => (p === 0 ? 0 : (0xffffffff << (32 - p)) >>> 0)
export const maskStr = (p: number) => intToIp(maskInt(p))
export const bin8 = (n: number) => n.toString(2).padStart(8, '0')

function privateIp(): string {
  const k = r(0, 2)
  if (k === 0) return `10.${r(0, 255)}.${r(0, 255)}.${r(1, 254)}`
  if (k === 1) return `172.${r(16, 31)}.${r(0, 255)}.${r(1, 254)}`
  return `192.168.${r(0, 255)}.${r(1, 254)}`
}

const prefixFor = (d: 1 | 2 | 3) => (d === 1 ? pick([24, 24, 16]) : d === 2 ? pick([25, 26, 27, 28]) : pick([20, 21, 22, 23, 29, 30]))

const topicFor = (p: number) => (p === 24 || p === 16 || p === 8 ? 'l1-ip' : 'l2-subnet')

function blockExplain(ip: string, p: number) {
  const net = (ipToInt(ip) & maskInt(p)) >>> 0
  const size = 2 ** (32 - p)
  const bc = (net + size - 1) >>> 0
  const octet = p >= 24 ? 4 : p >= 16 ? 3 : p >= 8 ? 2 : 1
  const blockInOctet = p % 8 === 0 ? 256 : 2 ** (8 - (p % 8))
  return {
    net: intToIp(net),
    bc: intToIp(bc),
    hosts: Math.max(0, size - 2),
    en: `/${p} = mask ${maskStr(p)}. The interesting octet is #${octet}, where the block size is ${blockInOctet}. Network = ${intToIp(net)}, broadcast = ${intToIp(bc)}, usable hosts = 2^${32 - p} − 2 = ${Math.max(0, size - 2)}.`,
    fr: `/${p} = masque ${maskStr(p)}. L’octet intéressant est le n°${octet}, avec une taille de bloc de ${blockInOctet}. Réseau = ${intToIp(net)}, diffusion = ${intToIp(bc)}, hôtes utilisables = 2^${32 - p} − 2 = ${Math.max(0, size - 2)}.`,
  }
}

export function binToDec(d: 1 | 2 | 3): ExamQuestion {
  const n = d === 1 ? pick([128, 192, 224, 240, 255, 10, 1, 64, 168]) : r(1, 254)
  const b = bin8(n)
  const parts = [128, 64, 32, 16, 8, 4, 2, 1].filter((_, i) => b[i] === '1')
  return {
    id: gid('b2d'), topic: 'l1-ip', difficulty: d, tags: ['binary'],
    kind: 'input',
    prompt: t(`Convert **${b}** to decimal.`, `Convertissez **${b}** en décimal.`),
    accept: [String(n)],
    placeholder: '0–255',
    explain: t(`${parts.join(' + ') || '0'} = **${n}**`, `${parts.join(' + ') || '0'} = **${n}**`),
  }
}

export function decToBin(d: 1 | 2 | 3): ExamQuestion {
  const n = d === 1 ? pick([128, 192, 255, 0, 240, 1]) : r(1, 254)
  return {
    id: gid('d2b'), topic: 'l1-ip', difficulty: d, tags: ['binary'],
    kind: 'input',
    prompt: t(`Write **${n}** as an 8-bit binary octet.`, `Écrivez **${n}** sous forme d’octet binaire (8 bits).`),
    accept: [bin8(n)],
    placeholder: '00000000',
    explain: t(`Subtract 128, 64, 32… from left to right: ${n} = **${bin8(n)}**`, `Soustrayez 128, 64, 32… de gauche à droite : ${n} = **${bin8(n)}**`),
  }
}

export function networkAddress(d: 1 | 2 | 3): ExamQuestion {
  const p = prefixFor(d)
  const ip = privateIp()
  const x = blockExplain(ip, p)
  return {
    id: gid('net'), topic: topicFor(p), difficulty: d, tags: ['subnetting'],
    kind: 'input',
    prompt: t(`What is the **network address** of \`${ip}/${p}\`?`, `Quelle est l’**adresse réseau** de \`${ip}/${p}\` ?`),
    accept: [x.net],
    placeholder: 'a.b.c.d',
    explain: t(x.en, x.fr),
  }
}

export function broadcastAddress(d: 1 | 2 | 3): ExamQuestion {
  const p = prefixFor(d)
  const ip = privateIp()
  const x = blockExplain(ip, p)
  return {
    id: gid('bc'), topic: topicFor(p), difficulty: d, tags: ['subnetting'],
    kind: 'input',
    prompt: t(`What is the **broadcast address** of \`${ip}/${p}\`?`, `Quelle est l’**adresse de diffusion** de \`${ip}/${p}\` ?`),
    accept: [x.bc],
    placeholder: 'a.b.c.d',
    explain: t(x.en, x.fr),
  }
}

export function hostCount(d: 1 | 2 | 3): ExamQuestion {
  const p = d === 1 ? pick([24, 25, 30]) : d === 2 ? pick([26, 27, 28, 29]) : pick([20, 21, 22, 23, 19])
  const hosts = 2 ** (32 - p) - 2
  return {
    id: gid('hosts'), topic: topicFor(p), difficulty: d, tags: ['subnetting'],
    kind: 'input',
    prompt: t(`How many **usable host addresses** does a **/${p}** network have?`, `Combien d’**adresses d’hôtes utilisables** compte un réseau **/${p}** ?`),
    accept: [String(hosts)],
    explain: t(`32 − ${p} = ${32 - p} host bits → 2^${32 - p} = ${hosts + 2} addresses, minus network and broadcast = **${hosts}**.`, `32 − ${p} = ${32 - p} bits d’hôte → 2^${32 - p} = ${hosts + 2} adresses, moins réseau et diffusion = **${hosts}**.`),
  }
}

export function prefixToMask(d: 1 | 2 | 3): ExamQuestion {
  const p = d === 1 ? pick([8, 16, 24]) : d === 2 ? pick([25, 26, 27, 28, 29, 30]) : pick([17, 18, 19, 20, 21, 22, 23])
  return {
    id: gid('mask'), topic: topicFor(p), difficulty: d, tags: ['subnetting'],
    kind: 'input',
    prompt: t(`Write the subnet mask for **/${p}** in dotted decimal.`, `Écrivez le masque de **/${p}** en notation décimale pointée.`),
    accept: [maskStr(p)],
    placeholder: '255.x.x.x',
    explain: t(`${p} ones followed by ${32 - p} zeros = **${maskStr(p)}**.`, `${p} uns suivis de ${32 - p} zéros = **${maskStr(p)}**.`),
  }
}

export function sameSubnet(d: 1 | 2 | 3): ExamQuestion {
  const p = prefixFor(d)
  const a = privateIp()
  const net = (ipToInt(a) & maskInt(p)) >>> 0
  const size = 2 ** (32 - p)
  const same = Math.random() < 0.5
  const b = same ? intToIp((net + r(1, Math.max(1, size - 2))) >>> 0) : intToIp((net + size + r(1, Math.max(1, size - 2))) >>> 0)
  const x = blockExplain(a, p)
  return {
    id: gid('same'), topic: topicFor(p), difficulty: d, tags: ['subnetting'],
    kind: 'tf',
    prompt: t(`\`${a}/${p}\` and \`${b}/${p}\` are on the **same subnet**.`, `\`${a}/${p}\` et \`${b}/${p}\` sont dans le **même sous-réseau**.`),
    answer: same,
    explain: t(`${x.en} ${b} ${same ? 'falls inside' : 'falls outside'} that range.`, `${x.fr} ${b} ${same ? 'est dans' : 'est hors de'} cette plage.`),
  }
}

export function classifyAddress(d: 1 | 2 | 3): ExamQuestion {
  const opts = [
    { ip: privateIp(), k: 0 },
    { ip: `${pick([8, 23, 51, 81, 142, 185, 203])}.${r(0, 255)}.${r(0, 255)}.${r(1, 254)}`, k: 1 },
    { ip: `169.254.${r(1, 254)}.${r(1, 254)}`, k: 2 },
    { ip: `127.0.0.${r(1, 9)}`, k: 3 },
  ]
  const chosen = d === 1 ? pick(opts.slice(0, 2)) : pick(opts)
  return {
    id: gid('class'), topic: 'l1-ip', difficulty: d, tags: ['addressing'],
    kind: 'mcq',
    prompt: t(`What kind of address is \`${chosen.ip}\`?`, `Quel type d’adresse est \`${chosen.ip}\` ?`),
    options: [t('Private', 'Privée'), t('Public', 'Publique'), t('APIPA (DHCP failed)', 'APIPA (échec DHCP)'), t('Loopback', 'Bouclage')],
    answer: chosen.k,
    explain: t('Private: 10/8, 172.16/12, 192.168/16 · APIPA: 169.254/16 · Loopback: 127/8 · everything else is generally public.', 'Privées : 10/8, 172.16/12, 192.168/16 · APIPA : 169.254/16 · Bouclage : 127/8 · le reste est généralement public.'),
  }
}

/** Full subnet worksheet: network, broadcast, first & last usable host. */
export function subnetWorksheet(d: 1 | 2 | 3): ExamQuestion {
  const p = d === 1 ? 24 : prefixFor(d)
  const ip = privateIp()
  const x = blockExplain(ip, p)
  const first = intToIp((ipToInt(x.net) + 1) >>> 0)
  const last = intToIp((ipToInt(x.bc) - 1) >>> 0)
  return {
    id: gid('sheet'), topic: topicFor(p), difficulty: Math.min(3, d + 1) as 1 | 2 | 3, tags: ['subnetting', 'config'],
    kind: 'fields',
    prompt: t(`A host is configured as \`${ip}/${p}\`. Complete the subnet worksheet.`, `Un hôte est configuré en \`${ip}/${p}\`. Complétez la fiche du sous-réseau.`),
    fields: [
      { label: t('Network address', 'Adresse réseau'), accept: [x.net], placeholder: 'a.b.c.d' },
      { label: t('Broadcast address', 'Adresse de diffusion'), accept: [x.bc], placeholder: 'a.b.c.d' },
      { label: t('First usable host', 'Premier hôte utilisable'), accept: [first], placeholder: 'a.b.c.d' },
      { label: t('Last usable host', 'Dernier hôte utilisable'), accept: [last], placeholder: 'a.b.c.d' },
    ],
    explain: t(`${x.en} First host = network + 1 (${first}); last host = broadcast − 1 (${last}).`, `${x.fr} Premier hôte = réseau + 1 (${first}) ; dernier hôte = diffusion − 1 (${last}).`),
  }
}

export const ADDRESSING_GENERATORS = [binToDec, decToBin, networkAddress, broadcastAddress, hostCount, prefixToMask, sameSubnet, classifyAddress]
export const SUBNET_GENERATORS = [networkAddress, broadcastAddress, hostCount, prefixToMask, sameSubnet, subnetWorksheet]

/** Pick a generator at random and build a question at difficulty d. */
export const generateFrom = (gens: ((d: 1 | 2 | 3) => ExamQuestion)[]) => (d: 1 | 2 | 3) => pick(gens)(d)
