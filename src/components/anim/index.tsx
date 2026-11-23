import type { ComponentType } from 'react'
import type { AnimKey, WidgetKey } from '@/content/lessons/types'
import { useI18n } from '@/i18n'
import { Player, type AnimSpec } from './Player'
import { binaryAnd, ipv6Compress, osiEncap, subnetSplit, tcpHandshake, vlsm } from './net1'
import { SubnetCalc } from './SubnetCalc'
import { dhcpDora, dnsResolve, natPat, tsMethod } from './net3'
import { arpAnim, dynamicRouting, macLearning, routeLookup, routerOnStick, stpAnim, vlanTag } from './net2'

export const ANIMS: Record<AnimKey, (fr: boolean) => AnimSpec> = {
  'osi-encap': osiEncap,
  'tcp-handshake': tcpHandshake,
  'ipv6-compress': ipv6Compress,
  'binary-and': binaryAnd,
  'subnet-split': subnetSplit,
  vlsm,
  'mac-learning': macLearning,
  arp: arpAnim,
  'route-lookup': routeLookup,
  'vlan-tag': vlanTag,
  'router-on-stick': routerOnStick,
  stp: stpAnim,
  'dynamic-routing': dynamicRouting,
  'dhcp-dora': dhcpDora,
  'dns-resolve': dnsResolve,
  'nat-pat': natPat,
  'ts-method': tsMethod,
}

export const WIDGETS: Record<WidgetKey, ComponentType> = {
  'subnet-calc': SubnetCalc,
}

export function Animation({ anim, title }: { anim: AnimKey; title?: string }) {
  const { lang } = useI18n()
  return <Player key={`${anim}-${lang}`} spec={ANIMS[anim](lang === 'fr')} title={title} />
}
