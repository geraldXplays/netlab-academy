import type { OpsEvent, OpsWorld } from '@/ops/types'
import { ipOf, reachable, resolve, tcp } from '@/ops/world'

/** Event matchers */
export const onCmd = (re: RegExp, dev?: string | string[]) => (e: OpsEvent) =>
  e.kind === 'cmd' && re.test(e.line.trim()) && (!dev || (Array.isArray(dev) ? dev.includes(e.dev ?? '') : e.dev === dev))
export const onTag = (prefix: string, dev?: string | string[]) => (e: OpsEvent) =>
  !!e.tags?.some((t) => t.startsWith(prefix)) && (!dev || (Array.isArray(dev) ? dev.includes(e.dev ?? '') : e.dev === dev))
export const onAct = (id: string) => (e: OpsEvent) => e.kind === 'act' && e.line === id
export const any = (...fns: ((e: OpsEvent) => boolean)[]) => (e: OpsEvent) => fns.some((f) => f(e))

/** World probes */
export const pingOk = (w: OpsWorld, from: string, ip: string) => reachable(w, from, ip)
export const nameOk = (w: OpsWorld, from: string, name: string) => 'ip' in resolve(w, from, name)
export function webOk(w: OpsWorld, from: string, host: string, port: number) {
  const r = resolve(w, from, host)
  return 'ip' in r && tcp(w, from, r.ip, port) === 'ok'
}
export const smbOk = (w: OpsWorld, from: string) => webOk(w, from, 'fs01', 445)
export const internetOk = (w: OpsWorld, from: string) => webOk(w, from, 'google.com', 443)
export const ip = ipOf

import type { Iface } from '@/sim/types'
import { dev } from '@/sim/topology'

/** Change an interface in the running config (and the saved startup-config unless `runningOnly`). */
export function setIf(w: OpsWorld, id: string, name: string, patch: Partial<Iface>, runningOnly = false): OpsWorld {
  const fix = (d: OpsWorld['topo']['devices'][number]) => ({ ...d, ifaces: d.ifaces.map((i) => (i.name === name ? { ...i, ...patch } : i)) })
  return {
    ...w,
    topo: { ...w.topo, devices: w.topo.devices.map((d) => (d.id === id ? fix(d) : d)) },
    startup: !runningOnly && w.startup[id] ? { ...w.startup, [id]: fix(w.startup[id]) } : w.startup,
  }
}

export function setRoutes(w: OpsWorld, id: string, fn: (r: NonNullable<OpsWorld['topo']['devices'][number]['routes']>) => NonNullable<OpsWorld['topo']['devices'][number]['routes']>): OpsWorld {
  const fix = (d: OpsWorld['topo']['devices'][number]) => ({ ...d, routes: fn(d.routes ?? []) })
  return {
    ...w,
    topo: { ...w.topo, devices: w.topo.devices.map((d) => (d.id === id ? fix(d) : d)) },
    startup: w.startup[id] ? { ...w.startup, [id]: fix(w.startup[id]) } : w.startup,
  }
}

export const iface = (w: OpsWorld, id: string, name: string) => dev(w.topo, id)?.ifaces.find((i) => i.name === name)
