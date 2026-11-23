/**
 * Packet-journey tracer for the Topology Explorer.
 *
 * Replays a ping link by link and records, at every step, what each device
 * decides (subnet check, ARP, MAC learning, flooding, 802.1Q tagging, route
 * lookup, TTL, header rewrite) together with a snapshot of every table.
 */
import type { L } from '@/content/types'
import type { Endpoint, Iface, SimDevice, Topology } from '@/sim/types'
import { isHost, isRouter } from '@/sim/types'
import { dev, iface, ipInt, linkAt, linkUp, peerOf, prefixOf, sameSubnet, validIp } from '@/sim/topology'

export const BCAST = 'FF:FF:FF:FF:FF:FF'
export type FrameKind = 'ARP-REQ' | 'ARP-REP' | 'ICMP-REQ' | 'ICMP-REP'

export interface Frame {
  kind: FrameKind
  srcMac: string
  dstMac: string
  /** 802.1Q tag on the wire (null = untagged). */
  vlan: number | null
  srcIp: string
  dstIp: string
  ttl?: number
  /** ARP: the IP being asked about / answered. */
  arpIp?: string
}

export interface Tx {
  link: string
  from: string
  to: string
  frame: Frame
  /** The receiver ignores this copy (flooded frame not meant for it). */
  ignored?: boolean
}

export interface Tables {
  arp: Record<string, Record<string, string>>
  /** switchId → "vlan|mac" → port */
  mac: Record<string, Record<string, string>>
}

export type TableKind = 'arp' | 'mac' | 'route'
export interface Mark {
  dev: string
  table: TableKind
  key: string
}

export interface Step {
  focus: string[]
  tx: Tx[]
  title: L
  body: L[]
  frame?: Frame
  tables: Tables
  marks: Mark[]
  tone: 'info' | 'arp' | 'req' | 'rep' | 'ok' | 'fail'
}

export interface Trace {
  steps: Step[]
  ok: boolean
  tables: Tables
}

const t = (en: string, fr: string): L => ({ en, fr })
const clone = (x: Tables): Tables => JSON.parse(JSON.stringify(x))
export const emptyTables = (): Tables => ({ arp: {}, mac: {} })

/** Routing table as IOS would print it: connected networks then static routes. */
export function routeTable(d: SimDevice) {
  const rows: { code: 'C' | 'S' | 'S*'; net: string; prefix: number; via?: string; out?: string; key: string }[] = []
  for (const i of d.ifaces) {
    if (!i.ip || !i.mask || !i.up) continue
    const net = intIp((ipInt(i.ip) & ipInt(i.mask)) >>> 0)
    rows.push({ code: 'C', net, prefix: prefixOf(i.mask), out: i.name, key: `${net}/${prefixOf(i.mask)}` })
  }
  for (const r of d.routes ?? []) {
    const p = prefixOf(r.mask)
    rows.push({ code: p === 0 ? 'S*' : 'S', net: r.net, prefix: p, via: r.via, key: `${r.net}/${p}` })
  }
  return rows
}

export const intIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.')

class Tracer {
  steps: Step[] = []
  tables: Tables
  marks: Mark[] = []
  private topo: Topology
  constructor(topo: Topology, tables: Tables) {
    this.topo = topo
    this.tables = clone(tables)
  }

  name = (id: string) => dev(this.topo, id)?.name ?? id

  emit(s: Omit<Step, 'tables' | 'marks'>) {
    this.steps.push({ ...s, tables: clone(this.tables), marks: this.marks })
    this.marks = []
  }

  learnArp(devId: string, ip: string, mac: string) {
    const c = (this.tables.arp[devId] ??= {})
    if (c[ip] !== mac) {
      c[ip] = mac
      this.marks.push({ dev: devId, table: 'arp', key: ip })
    }
  }

  /** Physical port + tag for an interface (sub-interfaces transmit on their parent with a tag). */
  physical(d: SimDevice, ifName: string): { ep: Endpoint; tag: number | null } {
    const i = iface(d, ifName)
    if (i?.parent) return { ep: { dev: d.id, iface: i.parent }, tag: i.dot1q ?? null }
    return { ep: { dev: d.id, iface: ifName }, tag: null }
  }

  /**
   * Send one frame out of an interface and follow it through the switches,
   * one wavefront per step. Returns the interface that accepted it.
   */
  l2Send(from: SimDevice, outName: string, f0: Frame, title: L, intro: L[], tone: Step['tone']): { dev: SimDevice; iface: Iface } | null {
    const { ep: start, tag } = this.physical(from, outName)
    const first = linkAt(this.topo, start)
    type W = { link: string; from: string; at: Endpoint; frame: Frame }
    let wave: W[] = []
    if (first && linkUp(this.topo, first)) wave.push({ link: first.id, from: from.id, at: peerOf(first, start), frame: { ...f0, vlan: tag } })
    else {
      this.emit({ focus: [from.id], tx: [], title, body: [...intro, t(`${outName} is down or not cabled: the frame never leaves ${from.name}.`, `${outName} est down ou non câblée : la trame ne quitte jamais ${from.name}.`)], frame: f0, tone: 'fail' })
      return null
    }
    let receiver: { dev: SimDevice; iface: Iface } | null = null
    const seen = new Set<string>()
    let firstStep = true
    for (let guard = 0; guard < 12 && wave.length; guard++) {
      const body: L[] = firstStep ? [...intro] : []
      const focus = new Set<string>()
      const tx: Tx[] = []
      const next: W[] = []
      for (const w of wave) {
        const d = dev(this.topo, w.at.dev)!
        focus.add(d.id)
        const txi: Tx = { link: w.link, from: w.from, to: d.id, frame: w.frame }
        tx.push(txi)
        if (d.type === 'switch') {
          const port = iface(d, w.at.iface)!
          let vlan: number
          if (port.mode === 'trunk') vlan = w.frame.vlan ?? 1
          else {
            if (w.frame.vlan !== null && w.frame.vlan !== (port.vlan ?? 1)) {
              body.push(t(`${d.name} drops it: tagged VLAN ${w.frame.vlan} on access port ${port.name}.`, `${d.name} la jette : étiquette VLAN ${w.frame.vlan} sur le port d’accès ${port.name}.`))
              continue
            }
            vlan = port.vlan ?? 1
          }
          const key = `${d.id}|${vlan}|${w.frame.dstMac}`
          if (seen.has(key)) continue
          seen.add(key)
          // learn
          const tbl = (this.tables.mac[d.id] ??= {})
          const lk = `${vlan}|${w.frame.srcMac}`
          if (tbl[lk] !== port.name) {
            tbl[lk] = port.name
            this.marks.push({ dev: d.id, table: 'mac', key: lk })
            body.push(t(`${d.name} learns ${w.frame.srcMac} is behind ${port.name} (VLAN ${vlan}).`, `${d.name} apprend que ${w.frame.srcMac} est derrière ${port.name} (VLAN ${vlan}).`))
          }
          // forward
          const known = w.frame.dstMac !== BCAST ? tbl[`${vlan}|${w.frame.dstMac}`] : undefined
          const outs = d.ifaces.filter((p) => p.name !== port.name && p.up && (p.mode === 'trunk' || (p.vlan ?? 1) === vlan) && (!known || p.name === known))
          const usable = outs.filter((p) => {
            const l = linkAt(this.topo, { dev: d.id, iface: p.name })
            return l && linkUp(this.topo, l)
          })
          if (known) this.marks.push({ dev: d.id, table: 'mac', key: `${vlan}|${w.frame.dstMac}` })
          const names = usable.map((p) => p.name).join(', ')
          if (w.frame.dstMac === BCAST) body.push(t(`Broadcast → ${d.name} floods it out every other VLAN ${vlan} port: ${names || 'none'}.`, `Diffusion → ${d.name} l’inonde sur tous les autres ports du VLAN ${vlan} : ${names || 'aucun'}.`))
          else if (known) body.push(t(`${d.name} finds ${w.frame.dstMac} in its MAC table → forwards out ${known} only.`, `${d.name} trouve ${w.frame.dstMac} dans sa table MAC → transmet uniquement par ${known}.`))
          else body.push(t(`${w.frame.dstMac} is unknown to ${d.name} → floods it (unknown unicast): ${names || 'none'}.`, `${w.frame.dstMac} est inconnue de ${d.name} → inondation (unicast inconnu) : ${names || 'aucun'}.`))
          for (const p of usable) {
            const l = linkAt(this.topo, { dev: d.id, iface: p.name })!
            const tagOut = p.mode === 'trunk' && vlan !== 1 ? vlan : null
            if (tagOut !== null && w.frame.vlan === null) body.push(t(`${p.name} is a trunk: ${d.name} inserts an 802.1Q tag (VLAN ${vlan}).`, `${p.name} est un trunk : ${d.name} insère une étiquette 802.1Q (VLAN ${vlan}).`))
            if (tagOut === null && w.frame.vlan !== null) body.push(t(`${p.name} is an access port: the 802.1Q tag is removed.`, `${p.name} est un port d’accès : l’étiquette 802.1Q est retirée.`))
            next.push({ link: l.id, from: d.id, at: peerOf(l, { dev: d.id, iface: p.name }), frame: { ...w.frame, vlan: tagOut } })
          }
          continue
        }
        // end device or router
        let rx: Iface | undefined
        if (w.frame.vlan !== null) rx = d.ifaces.find((i) => i.parent === w.at.iface && i.dot1q === w.frame.vlan && i.up)
        else rx = iface(d, w.at.iface)
        if (!rx || !rx.up) {
          txi.ignored = true
          body.push(t(`${d.name} has no active interface for this frame — dropped.`, `${d.name} n’a pas d’interface active pour cette trame — jetée.`))
          continue
        }
        if (w.frame.kind === 'ARP-REQ') {
          if (rx.ip === w.frame.arpIp) {
            receiver = { dev: d, iface: rx }
            body.push(t(`${d.name} (${rx.name}) owns ${w.frame.arpIp}: “that’s me!”`, `${d.name} (${rx.name}) possède ${w.frame.arpIp} : « c’est moi ! »`))
          } else {
            txi.ignored = true
            body.push(t(`${d.name} is not ${w.frame.arpIp} — ignores the request.`, `${d.name} n’est pas ${w.frame.arpIp} — ignore la requête.`))
          }
        } else if (w.frame.dstMac === rx.mac) {
          receiver = { dev: d, iface: rx }
          body.push(t(`Destination MAC matches ${d.name} ${rx.name}: frame accepted.`, `La MAC de destination correspond à ${d.name} ${rx.name} : trame acceptée.`))
        } else {
          txi.ignored = true
          body.push(t(`${d.name}: destination MAC is not mine — discarded.`, `${d.name} : la MAC de destination n’est pas la mienne — jetée.`))
        }
      }
      const shown = tx[tx.length - 1]?.frame ?? f0
      this.emit({ focus: [...focus], tx, title: firstStep ? title : arrivedTitle([...focus].map((id) => dev(this.topo, id)!)), body, frame: { ...shown, vlan: tx.find((x) => x.frame.vlan !== null)?.frame.vlan ?? null }, tone })
      firstStep = false
      wave = next
    }
    return receiver
  }

  /** Make sure `cur` knows the MAC of `nextHop` (ARP), then send the IP packet. */
  sendIp(cur: SimDevice, outName: string, nextHop: string, pkt: Frame, tone: Step['tone'], intro: L[]): { dev: SimDevice; iface: Iface } | null {
    const out = iface(cur, outName)!
    const cache = (this.tables.arp[cur.id] ??= {})
    if (!cache[nextHop]) {
      const req: Frame = { kind: 'ARP-REQ', srcMac: out.mac, dstMac: BCAST, vlan: null, srcIp: out.ip!, dstIp: nextHop, arpIp: nextHop }
      const owner = this.l2Send(
        cur,
        outName,
        req,
        t(`ARP request: who has ${nextHop}?`, `Requête ARP : qui a ${nextHop} ?`),
        [...intro, t(`${cur.name} has no MAC for ${nextHop} in its ARP cache. It broadcasts an ARP request (destination FF:FF:FF:FF:FF:FF).`, `${cur.name} n’a pas de MAC pour ${nextHop} dans son cache ARP. Il diffuse une requête ARP (destination FF:FF:FF:FF:FF:FF).`)],
        'arp',
      )
      if (!owner) {
        this.emit({ focus: [cur.id], tx: [], title: t('No ARP reply', 'Pas de réponse ARP'), body: [t(`Nobody on this segment owns ${nextHop}. ${cur.name} cannot build the frame: the ping fails (“Request timed out”). Check the IP / gateway / VLAN.`, `Personne sur ce segment ne possède ${nextHop}. ${cur.name} ne peut pas construire la trame : le ping échoue (« Délai d’attente dépassé »). Vérifiez IP / passerelle / VLAN.`)], tone: 'fail' })
        return null
      }
      this.learnArp(owner.dev.id, out.ip!, out.mac)
      const rep: Frame = { kind: 'ARP-REP', srcMac: owner.iface.mac, dstMac: out.mac, vlan: null, srcIp: owner.iface.ip!, dstIp: out.ip!, arpIp: owner.iface.ip }
      const back = this.l2Send(
        owner.dev,
        owner.iface.name,
        rep,
        t(`ARP reply: ${nextHop} is at ${owner.iface.mac}`, `Réponse ARP : ${nextHop} est à ${owner.iface.mac}`),
        [t(`${owner.dev.name} notes ${cur.name}’s MAC in its own ARP cache, then answers in unicast.`, `${owner.dev.name} note la MAC de ${cur.name} dans son propre cache ARP, puis répond en unicast.`)],
        'arp',
      )
      if (!back) return null
      this.learnArp(cur.id, nextHop, owner.iface.mac)
      this.emit({ focus: [cur.id], tx: [], title: t('ARP resolved', 'ARP résolu'), body: [t(`${cur.name} stores ${nextHop} → ${owner.iface.mac}. Next time, no ARP needed.`, `${cur.name} enregistre ${nextHop} → ${owner.iface.mac}. La prochaine fois, pas besoin d’ARP.`)], tone: 'arp' })
      intro = []
    } else {
      this.marks.push({ dev: cur.id, table: 'arp', key: nextHop })
      intro = [...intro, t(`${nextHop} is already in ${cur.name}’s ARP cache → no ARP needed.`, `${nextHop} est déjà dans le cache ARP de ${cur.name} → pas besoin d’ARP.`)]
    }
    const frame: Frame = { ...pkt, srcMac: out.mac, dstMac: this.tables.arp[cur.id][nextHop], vlan: null }
    const label = pkt.kind === 'ICMP-REQ' ? t('ICMP echo request', 'Requête d’écho ICMP') : t('ICMP echo reply', 'Réponse d’écho ICMP')
    return this.l2Send(cur, outName, frame, { en: `${label.en}: ${cur.name} → ${frame.dstMac}`, fr: `${label.fr} : ${cur.name} → ${frame.dstMac}` }, [...intro, t(`Ethernet header: src ${frame.srcMac}, dst ${frame.dstMac}. IP header: ${pkt.srcIp} → ${pkt.dstIp}, TTL ${pkt.ttl}.`, `En-tête Ethernet : src ${frame.srcMac}, dst ${frame.dstMac}. En-tête IP : ${pkt.srcIp} → ${pkt.dstIp}, TTL ${pkt.ttl}.`)], tone)
  }

  /** Route an IP packet from `start` to its destination. Returns the device that owns dstIp. */
  deliver(start: SimDevice, pkt: Frame): SimDevice | null {
    let cur = start
    let p = { ...pkt }
    let intro: L[] = []
    const tone: Step['tone'] = pkt.kind === 'ICMP-REQ' ? 'req' : 'rep'
    for (let hop = 0; hop < 10; hop++) {
      let out: Iface | undefined
      let nextHop: string | undefined
      if (isHost(cur.type)) {
        const nic = cur.ifaces[0]
        if (!nic?.ip || !nic.mask) {
          this.emit({ focus: [cur.id], tx: [], title: t('No IP address', 'Pas d’adresse IP'), body: [t(`${cur.name} has no IP configured.`, `${cur.name} n’a pas d’IP configurée.`)], tone: 'fail' })
          return null
        }
        const myNet = intIp((ipInt(nic.ip) & ipInt(nic.mask)) >>> 0)
        const dNet = intIp((ipInt(p.dstIp) & ipInt(nic.mask)) >>> 0)
        out = nic
        if (myNet === dNet) {
          nextHop = p.dstIp
          intro = [t(`${cur.name} ANDs the destination with its mask: ${p.dstIp} AND ${nic.mask} = ${dNet} = my network ${myNet} → same subnet, deliver directly.`, `${cur.name} fait un ET entre la destination et son masque : ${p.dstIp} ET ${nic.mask} = ${dNet} = mon réseau ${myNet} → même sous-réseau, livraison directe.`)]
        } else {
          if (!cur.gateway || !validIp(cur.gateway)) {
            this.emit({ focus: [cur.id], tx: [], title: t('No default gateway', 'Pas de passerelle par défaut'), body: [t(`${p.dstIp} is on another network (${dNet}) and ${cur.name} has no gateway.`, `${p.dstIp} est sur un autre réseau (${dNet}) et ${cur.name} n’a pas de passerelle.`)], tone: 'fail' })
            return null
          }
          nextHop = cur.gateway
          intro = [t(`${cur.name} ANDs the destination with its mask: ${p.dstIp} AND ${nic.mask} = ${dNet} ≠ my network ${myNet} → remote, send to the default gateway ${cur.gateway}.`, `${cur.name} fait un ET entre la destination et son masque : ${p.dstIp} ET ${nic.mask} = ${dNet} ≠ mon réseau ${myNet} → distant, envoi à la passerelle ${cur.gateway}.`)]
        }
        this.emit({ focus: [cur.id], tx: [], title: t(`${cur.name}: local or remote?`, `${cur.name} : local ou distant ?`), body: intro, frame: { ...p, srcMac: nic.mac, dstMac: '?', vlan: null }, tone: 'info' })
        intro = []
      } else if (isRouter(cur.type)) {
        const rows = routeTable(cur)
        const match = rows
          .filter((r) => ((ipInt(p.dstIp) & ipInt(maskOf(r.prefix))) >>> 0) === ipInt(r.net))
          .sort((a, b) => b.prefix - a.prefix)[0]
        if (match) this.marks.push({ dev: cur.id, table: 'route', key: match.key })
        if (!match) {
          this.emit({ focus: [cur.id], tx: [], title: t(`${cur.name}: no route`, `${cur.name} : pas de route`), body: [t(`${cur.name} has no route to ${p.dstIp} and no default route. It drops the packet and sends back “ICMP Destination host unreachable”.`, `${cur.name} n’a aucune route vers ${p.dstIp} ni de route par défaut. Il jette le paquet et renvoie « ICMP Destination host unreachable ».`)], tone: 'fail' })
          return null
        }
        if (match.code === 'C') {
          out = iface(cur, match.out!)
          nextHop = p.dstIp
        } else {
          nextHop = match.via
          out = cur.ifaces.find((i) => i.up && i.ip && i.mask && sameSubnet(i.ip, match.via!, i.mask))
          if (!out) {
            this.emit({ focus: [cur.id], tx: [], title: t(`${cur.name}: exit interface down`, `${cur.name} : interface de sortie down`), body: [t(`Route ${match.code} ${match.key} via ${match.via} matches, but no active interface reaches ${match.via}. Packet dropped.`, `La route ${match.code} ${match.key} via ${match.via} correspond, mais aucune interface active n’atteint ${match.via}. Paquet jeté.`)], tone: 'fail' })
            return null
          }
        }
        p = { ...p, ttl: (p.ttl ?? 128) - 1 }
        intro = [
          t(`${cur.name} strips the Ethernet header and reads the IP destination: ${p.dstIp}.`, `${cur.name} retire l’en-tête Ethernet et lit la destination IP : ${p.dstIp}.`),
          match.code === 'C'
            ? t(`Routing table: ${p.dstIp} is on directly connected network ${match.key} (C) → out ${out!.name}.`, `Table de routage : ${p.dstIp} est sur le réseau directement connecté ${match.key} (C) → sortie ${out!.name}.`)
            : t(`Routing table: longest match is ${match.code} ${match.key} via ${match.via} → out ${out!.name}.`, `Table de routage : la correspondance la plus longue est ${match.code} ${match.key} via ${match.via} → sortie ${out!.name}.`),
          t(`TTL ${(p.ttl ?? 0) + 1} → ${p.ttl}. A brand-new Ethernet header is built for the next link — the IP addresses stay the same.`, `TTL ${(p.ttl ?? 0) + 1} → ${p.ttl}. Un tout nouvel en-tête Ethernet est construit pour le lien suivant — les adresses IP ne changent pas.`),
        ]
        this.emit({ focus: [cur.id], tx: [], title: t(`${cur.name} routes the packet`, `${cur.name} route le paquet`), body: intro, frame: { ...p, srcMac: out!.mac, dstMac: '?', vlan: null }, tone: 'info' })
        intro = []
        if (p.ttl! <= 0) {
          this.emit({ focus: [cur.id], tx: [], title: t('TTL expired', 'TTL expiré'), body: [t('TTL reached 0: packet dropped.', 'Le TTL a atteint 0 : paquet jeté.')], tone: 'fail' })
          return null
        }
      } else return null

      const rx = this.sendIp(cur, out!.name, nextHop!, p, tone, intro)
      if (!rx) return null
      if (rx.dev.ifaces.some((i) => i.ip === p.dstIp && i.up)) return rx.dev
      if (!isRouter(rx.dev.type)) {
        this.emit({ focus: [rx.dev.id], tx: [], title: t('Not a router', 'Pas un routeur'), body: [t(`${rx.dev.name} received a packet for ${p.dstIp} but does not route. Dropped.`, `${rx.dev.name} a reçu un paquet pour ${p.dstIp} mais ne route pas. Jeté.`)], tone: 'fail' })
        return null
      }
      cur = rx.dev
    }
    return null
  }
}

function arrivedTitle(ds: SimDevice[]): L {
  const sw = ds.filter((d) => d.type === 'switch').map((d) => d.name)
  const names = ds.filter((d) => d.type !== 'switch').map((d) => d.name).join(', ')
  if (sw.length) return t(`Frame crosses ${sw.join(', ')}`, `La trame traverse ${sw.join(', ')}`)
  return t(`Frame reaches ${names}`, `La trame atteint ${names}`)
}

const maskOf = (prefix: number) => intIp(prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0)

/** Full ping trace: request, then reply. Tables carry over between runs (warm caches). */
export function tracePing(topo: Topology, srcId: string, dstIp: string, tables: Tables): Trace {
  const tr = new Tracer(topo, tables)
  const src = dev(topo, srcId)!
  const srcIp = src.ifaces[0]?.ip ?? '0.0.0.0'
  const target = topo.devices.find((d) => d.ifaces.some((i) => i.ip === dstIp))
  tr.emit({
    focus: [src.id],
    tx: [],
    title: t(`ping ${dstIp}`, `ping ${dstIp}`),
    body: [t(`${src.name} (${srcIp}) wants to send an ICMP echo request to ${target ? `${target.name} (${dstIp})` : dstIp}. Watch every device make its decision.`, `${src.name} (${srcIp}) veut envoyer une requête d’écho ICMP à ${target ? `${target.name} (${dstIp})` : dstIp}. Observez chaque équipement prendre sa décision.`)],
    tone: 'info',
  })
  const req: Frame = { kind: 'ICMP-REQ', srcMac: '', dstMac: '', vlan: null, srcIp, dstIp, ttl: 128 }
  const dst = tr.deliver(src, req)
  if (!dst) return { steps: tr.steps, ok: false, tables: tr.tables }
  tr.emit({ focus: [dst.id], tx: [], title: t(`${dst.name} received the echo request`, `${dst.name} a reçu la requête d’écho`), body: [t(`The IP destination matches ${dst.name}. It now answers with an ICMP echo reply to ${srcIp} — the same journey in reverse.`, `La destination IP correspond à ${dst.name}. Il répond par une réponse d’écho ICMP à ${srcIp} — le même voyage en sens inverse.`)], tone: 'ok' })
  const back = tr.deliver(dst, { kind: 'ICMP-REP', srcMac: '', dstMac: '', vlan: null, srcIp: dstIp, dstIp: srcIp, ttl: isRouter(dst.type) ? 255 : 128 })
  if (!back) return { steps: tr.steps, ok: false, tables: tr.tables }
  const routers = tr.steps.filter((s) => s.tone === 'info' && s.focus.some((f) => isRouter(dev(topo, f)!.type))).length / 2
  tr.emit({
    focus: [src.id],
    tx: [],
    title: t('Reply from ' + dstIp, 'Réponse de ' + dstIp),
    body: [
      t(`Round trip complete. Routers crossed each way: ${routers}.`, `Aller-retour terminé. Routeurs traversés dans chaque sens : ${routers}.`),
      t('Key idea: the MAC addresses were rewritten at every router; the IP addresses never changed end to end.', 'À retenir : les adresses MAC ont été réécrites à chaque routeur ; les adresses IP n’ont jamais changé de bout en bout.'),
    ],
    tone: 'ok',
  })
  return { steps: tr.steps, ok: true, tables: tr.tables }
}
