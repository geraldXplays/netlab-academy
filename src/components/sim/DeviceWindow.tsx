import { useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Monitor, Plus, Settings2, TerminalSquare, Trash2, X, Cpu } from 'lucide-react'
import type { SimDevice, Topology } from '@/sim/types'
import { MODELS, isHost, isRouter } from '@/sim/types'
import { dev, linkAt, linkUp, longIface, peerOf, updateDevice, validIp, validMask } from '@/sim/topology'
import type { ArpCache, PingResult } from '@/sim/engine'
import { runIos, prompt as iosPrompt, initialIos, type IosState } from '@/sim/ios'
import { runHost } from '@/sim/host'
import { Device, DeviceDefs } from '@/components/devices/Device'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'
import { Terminal } from './Terminal'

export interface Runtime {
  arp: ArpCache
  ios: Map<string, IosState>
}

type Tab = 'physical' | 'config' | 'desktop' | 'cli'

const field = (bad?: boolean) =>
  cn('h-8 w-full rounded-md border bg-bg-2 px-2 font-mono text-xs text-text outline-none focus:border-cyan', bad ? 'border-danger' : 'border-line-strong')

/** Floating, draggable Packet-Tracer-style device window. */
export function DeviceWindow({ deviceId, topo, setTopo, rt, onPing, onClose }: {
  deviceId: string
  topo: Topology
  setTopo: (t: Topology) => void
  rt: Runtime
  onPing: (res: PingResult, from: string) => void
  onClose: () => void
}) {
  const { lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const d = dev(topo, deviceId)
  const host = d ? isHost(d.type) : false
  const [tab, setTab] = useState<Tab>(host ? 'desktop' : 'cli')
  const [app, setApp] = useState<'ip' | 'cmd' | null>(null)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number } | null>(null)
  const [eqv, setEqv] = useState<string[]>([])
  // Keep the latest topology for terminal callbacks (they outlive renders).
  const topoRef = useRef(topo)
  topoRef.current = topo

  const termApi = useMemo(() => {
    if (!d) return null
    if (host) {
      return {
        get prompt() {
          return 'C:\\>'
        },
        run: (line: string) => {
          const r = runHost(topoRef.current, deviceId, line, rt.arp)
          if (r.ping) onPing(r.ping, deviceId)
          return { out: r.out, clear: r.clear }
        },
      }
    }
    return {
      get prompt() {
        const cur = dev(topoRef.current, deviceId)!
        return iosPrompt(cur, rt.ios.get(deviceId) ?? initialIos())
      },
      run: (line: string) => {
        const r = runIos(topoRef.current, deviceId, rt.ios.get(deviceId) ?? initialIos(), line, rt.arp)
        rt.ios.set(deviceId, r.state)
        if (r.topo !== topoRef.current) {
          topoRef.current = r.topo
          setTopo(r.topo)
        }
        if (r.ping) onPing(r.ping, deviceId)
        return { out: r.out }
      },
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deviceId, host])

  if (!d) return null

  const patch = (fn: (x: SimDevice) => SimDevice, ...cmds: string[]) => {
    setTopo(updateDevice(topo, deviceId, fn))
    if (cmds.length) setEqv((e) => [...e.slice(-12), ...cmds])
  }

  const tabs: { id: Tab; label: string; icon: typeof Cpu }[] = [
    { id: 'physical', label: tr('Physical', 'Physique'), icon: Cpu },
    { id: 'config', label: 'Config', icon: Settings2 },
    host ? { id: 'desktop', label: tr('Desktop', 'Bureau'), icon: Monitor } : { id: 'cli', label: 'CLI', icon: TerminalSquare },
  ]

  return (
    <motion.div
      role="dialog"
      aria-label={d.name}
      initial={{ opacity: 0, scale: 0.94, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      style={{ transform: `translate(${pos.x}px, ${pos.y}px)` }}
      className="absolute top-4 right-4 z-30 flex h-[min(560px,calc(100%-2rem))] w-[min(640px,calc(100%-2rem))] flex-col overflow-hidden rounded-xl border border-line-strong bg-bg shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)]"
    >
      {/* Title bar (drag handle) */}
      <div
        className="flex cursor-move items-center gap-2 border-b border-line bg-bg-3 px-3 py-2 select-none"
        onPointerDown={(e) => {
          drag.current = { x: e.clientX - pos.x, y: e.clientY - pos.y }
          ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
        }}
        onPointerMove={(e) => drag.current && setPos({ x: e.clientX - drag.current.x, y: e.clientY - drag.current.y })}
        onPointerUp={() => (drag.current = null)}
      >
        <span className="h-3 w-3 rounded-full bg-danger/70" />
        <span className="h-3 w-3 rounded-full bg-warning/70" />
        <span className="h-3 w-3 rounded-full bg-success/70" />
        <span className="ml-2 text-sm font-semibold">{d.name}</span>
        <span className="font-mono text-[0.68rem] text-dim">{MODELS[d.type]}</span>
        <button onClick={onClose} onPointerDown={(e) => e.stopPropagation()} className="ml-auto rounded p-1 text-muted hover:bg-danger/20 hover:text-danger" aria-label="Close">
          <X size={15} />
        </button>
      </div>
      <div role="tablist" className="flex gap-1 border-b border-line bg-bg-2 px-2 pt-2">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => {
              setTab(id)
              setApp(null)
            }}
            className={cn('flex items-center gap-1.5 rounded-t-md border border-b-0 px-3 py-1.5 text-xs', tab === id ? 'border-line-strong bg-bg text-text' : 'border-transparent text-muted hover:text-text')}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto" data-lenis-prevent>
        {/* PHYSICAL */}
        {tab === 'physical' && (
          <div className="grid gap-4 p-4 sm:grid-cols-[160px_1fr]">
            <svg viewBox="-60 -50 120 110" className="h-36 w-full">
              <DeviceDefs />
              <Device kind={d.type === 'firewall' ? 'firewall' : d.type} x={0} y={0} scale={1.4} animate={false} />
            </svg>
            <div>
              <p className="hud-label mb-2">{tr('Ports', 'Ports')}</p>
              <div className="max-h-72 overflow-y-auto rounded-lg border border-line">
                <table className="w-full text-xs">
                  <thead className="bg-bg-2 text-dim">
                    <tr><th className="px-2 py-1.5 text-left">Port</th><th className="px-2 text-left">{tr('Link', 'Lien')}</th><th className="px-2 text-left">{tr('Connected to', 'Connecté à')}</th><th className="px-2 text-left">MAC</th></tr>
                  </thead>
                  <tbody>
                    {d.ifaces.filter((i) => !i.parent).map((i) => {
                      const l = linkAt(topo, { dev: d.id, iface: i.name })
                      const peer = l && peerOf(l, { dev: d.id, iface: i.name })
                      const up = l && linkUp(topo, l)
                      return (
                        <tr key={i.name} className="border-t border-line">
                          <td className="px-2 py-1 font-mono">{i.name}</td>
                          <td className="px-2"><span className={cn('inline-block h-2 w-2 rounded-full', !l ? 'bg-line-strong' : up ? 'bg-success' : 'bg-danger')} /></td>
                          <td className="px-2 text-muted">{peer ? `${dev(topo, peer.dev)?.name} ${peer.iface}` : '—'}</td>
                          <td className="px-2 font-mono text-dim">{i.mac}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CONFIG */}
        {tab === 'config' && (
          <div className="space-y-5 p-4 text-sm">
            <label className="block">
              <span className="mb-1 block text-xs text-dim">{host ? tr('Display name', 'Nom affiché') : 'Hostname'}</span>
              <input defaultValue={d.name} onBlur={(e) => e.target.value.trim() && e.target.value !== d.name && patch((x) => ({ ...x, name: e.target.value.trim().slice(0, 20) }), ...(host ? [] : ['configure terminal', `hostname ${e.target.value.trim()}`]))} className={field()} />
            </label>

            {host && <HostIpForm d={d} patch={patch} tr={tr} />}

            {isRouter(d.type) && (
              <section>
                <p className="hud-label mb-2">{tr('Interfaces', 'Interfaces')}</p>
                <div className="space-y-2">
                  {d.ifaces.map((i) => (
                    <div key={i.name} className="grid grid-cols-[90px_1fr_1fr_70px] items-center gap-2">
                      <span className="font-mono text-xs">{i.name}</span>
                      <input defaultValue={i.ip ?? ''} placeholder="IP" onBlur={(e) => { const ip = e.target.value.trim(); if (ip === (i.ip ?? '')) return; if (ip && !validIp(ip)) return; patch((x) => ({ ...x, ifaces: x.ifaces.map((k) => (k.name === i.name ? { ...k, ip: ip || undefined, mask: k.mask ?? (ip ? '255.255.255.0' : undefined) } : k)) }), `interface ${longIface(i.name)}`, ip ? `ip address ${ip} ${i.mask ?? '255.255.255.0'}` : 'no ip address') }} className={field()} />
                      <input defaultValue={i.mask ?? ''} placeholder={tr('Mask', 'Masque')} onBlur={(e) => { const m = e.target.value.trim(); if (m === (i.mask ?? '') || !validMask(m)) return; patch((x) => ({ ...x, ifaces: x.ifaces.map((k) => (k.name === i.name ? { ...k, mask: m } : k)) }), `interface ${longIface(i.name)}`, `ip address ${i.ip ?? '?'} ${m}`) }} className={field()} />
                      <button onClick={() => patch((x) => ({ ...x, ifaces: x.ifaces.map((k) => (k.name === i.name ? { ...k, up: !k.up } : k)) }), `interface ${longIface(i.name)}`, i.up ? 'shutdown' : 'no shutdown')} className={cn('h-8 rounded-md text-xs font-semibold', i.up ? 'bg-success/20 text-success' : 'bg-bg-2 text-dim')}>
                        {i.up ? 'On' : 'Off'}
                      </button>
                    </div>
                  ))}
                </div>
                <RoutesEditor d={d} patch={patch} tr={tr} />
              </section>
            )}

            {d.type === 'switch' && <SwitchConfig d={d} patch={patch} tr={tr} />}

            {eqv.length > 0 && (
              <section>
                <p className="hud-label mb-1">{tr('Equivalent IOS commands', 'Commandes IOS équivalentes')}</p>
                <pre className="rounded-md bg-[#0b0e14] p-2 font-mono text-[0.72rem] text-[#9ece6a]">{eqv.join('\n')}</pre>
              </section>
            )}
          </div>
        )}

        {/* DESKTOP (hosts) */}
        {tab === 'desktop' && host && (
          <div className="h-full">
            {app === null && (
              <div className="grid grid-cols-3 gap-4 p-6 sm:grid-cols-4">
                {[
                  { id: 'ip' as const, label: tr('IP Configuration', 'Configuration IP'), icon: Settings2 },
                  { id: 'cmd' as const, label: tr('Command Prompt', 'Invite de commandes'), icon: TerminalSquare },
                ].map(({ id, label, icon: Icon }) => (
                  <button key={id} onClick={() => setApp(id)} className="flex flex-col items-center gap-2 rounded-xl p-3 text-center text-xs text-muted hover:bg-cyan-soft hover:text-text">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue to-cyan text-white shadow-lg"><Icon size={26} /></span>
                    {label}
                  </button>
                ))}
              </div>
            )}
            {app === 'ip' && (
              <div className="p-4">
                <button onClick={() => setApp(null)} className="mb-3 text-xs text-cyan hover:underline">← {tr('Desktop', 'Bureau')}</button>
                <HostIpForm d={d} patch={patch} tr={tr} />
              </div>
            )}
            {app === 'cmd' && termApi && (
              <div className="flex h-full flex-col">
                <button onClick={() => setApp(null)} className="px-3 py-1.5 text-left text-xs text-cyan hover:underline">← {tr('Desktop', 'Bureau')}</button>
                <Terminal api={termApi} banner={['Cisco Packet Tracer PC Command Line 1.0', '']} className="min-h-0 flex-1" />
              </div>
            )}
          </div>
        )}

        {/* CLI (network devices) */}
        {tab === 'cli' && termApi && (
          <Terminal
            api={termApi}
            className="h-full"
            banner={[
              'IOS Command Line Interface',
              '',
              tr('Press RETURN to get started! Type ? for help.', 'Appuyez sur ENTRÉE pour commencer ! Tapez ? pour l’aide.'),
              '',
            ]}
          />
        )}
      </div>
    </motion.div>
  )
}

function HostIpForm({ d, patch, tr }: { d: SimDevice; patch: (fn: (x: SimDevice) => SimDevice, ...cmds: string[]) => void; tr: (en: string, fr: string) => string }) {
  const nic = d.ifaces[0]
  const [vals, setVals] = useState({ ip: nic.ip ?? '', mask: nic.mask ?? '', gw: d.gateway ?? '', dns: d.dns ?? '' })
  // Latest values, readable synchronously from blur handlers (state may lag behind fast input).
  const latest = useRef(vals)
  type K = keyof typeof vals
  const set = (k: K, v: string) => {
    latest.current = { ...latest.current, [k]: v }
    setVals(latest.current)
  }
  const commit = () => {
    const v = latest.current
    patch((x) => ({
      ...x,
      gateway: v.gw && validIp(v.gw) ? v.gw.trim() : undefined,
      dns: v.dns && validIp(v.dns) ? v.dns.trim() : undefined,
      ifaces: [{ ...x.ifaces[0], ip: v.ip && validIp(v.ip) ? v.ip.trim() : undefined, mask: v.mask && validMask(v.mask) ? v.mask.trim() : undefined }, ...x.ifaces.slice(1)],
    }))
  }
  const row = (label: string, key: K, valid: (s: string) => boolean, ph: string) => (
    <label className="grid grid-cols-[140px_1fr] items-center gap-3">
      <span className="text-xs text-muted">{label}</span>
      <input
        value={vals[key]}
        placeholder={ph}
        onChange={(e) => set(key, e.target.value)}
        onFocus={(e) => {
          const el = e.target
          // Like Packet Tracer: entering the mask field pre-fills /24 for a valid IP.
          if (key === 'mask' && !latest.current.mask && validIp(latest.current.ip)) {
            set('mask', '255.255.255.0')
            el.value = '255.255.255.0'
          }
          // Select so typing replaces the current value instead of appending to it.
          el.select()
        }}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        className={field(!!vals[key] && !valid(vals[key]))}
      />
    </label>
  )
  return (
    <section className="space-y-2.5">
      <div className="flex items-center gap-3 text-xs">
        <span className="rounded-full border border-cyan/40 bg-cyan-soft px-2.5 py-0.5 text-cyan">Static</span>
        <span className="text-dim">DHCP — {tr('coming with the DHCP lab', 'arrive avec le lab DHCP')}</span>
      </div>
      {row(tr('IPv4 Address', 'Adresse IPv4'), 'ip', validIp, '192.168.1.10')}
      {row(tr('Subnet Mask', 'Masque'), 'mask', validMask, '255.255.255.0')}
      {row(tr('Default Gateway', 'Passerelle par défaut'), 'gw', validIp, '192.168.1.1')}
      {row(tr('DNS Server', 'Serveur DNS'), 'dns', validIp, '0.0.0.0')}
      <p className="pt-1 font-mono text-[0.68rem] text-dim">MAC {nic.mac}</p>
    </section>
  )
}

function SwitchConfig({ d, patch, tr }: { d: SimDevice; patch: (fn: (x: SimDevice) => SimDevice, ...cmds: string[]) => void; tr: (en: string, fr: string) => string }) {
  const [vid, setVid] = useState('')
  const [vname, setVname] = useState('')
  const vlans = Object.entries(d.vlans ?? { 1: 'default' })
  return (
    <>
      <section>
        <p className="hud-label mb-2">{tr('VLAN database', 'Base VLAN')}</p>
        <div className="flex flex-wrap gap-1.5">
          {vlans.map(([id, name]) => (
            <span key={id} className="rounded-md border border-line bg-bg-2 px-2 py-1 font-mono text-xs">{id} · {name}</span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input value={vid} onChange={(e) => setVid(e.target.value)} placeholder="VLAN #" className={cn(field(), 'w-24')} />
          <input value={vname} onChange={(e) => setVname(e.target.value)} placeholder={tr('Name', 'Nom')} className={field()} />
          <button
            onClick={() => {
              const n = Number(vid)
              if (!Number.isInteger(n) || n < 2 || n > 4094) return
              const name = vname.trim() || `VLAN${String(n).padStart(4, '0')}`
              patch((x) => ({ ...x, vlans: { ...x.vlans, [n]: name } }), 'configure terminal', `vlan ${n}`, ` name ${name}`)
              setVid('')
              setVname('')
            }}
            className="flex items-center gap-1 rounded-md bg-cyan px-3 text-xs font-semibold text-on-accent"
          >
            <Plus size={13} /> {tr('Add', 'Ajouter')}
          </button>
        </div>
      </section>
      <section>
        <p className="hud-label mb-2">{tr('Ports', 'Ports')}</p>
        <div className="max-h-64 space-y-1 overflow-y-auto">
          {d.ifaces.map((i) => (
            <div key={i.name} className="grid grid-cols-[70px_1fr_1fr_56px] items-center gap-2">
              <span className="font-mono text-xs">{i.name}</span>
              <select
                value={i.mode ?? 'access'}
                onChange={(e) => patch((x) => ({ ...x, ifaces: x.ifaces.map((k) => (k.name === i.name ? { ...k, mode: e.target.value as 'access' | 'trunk' } : k)) }), `interface ${longIface(i.name)}`, `switchport mode ${e.target.value}`)}
                className={field()}
              >
                <option value="access">access</option>
                <option value="trunk">trunk</option>
              </select>
              <select
                value={i.vlan ?? 1}
                disabled={i.mode === 'trunk'}
                onChange={(e) => patch((x) => ({ ...x, ifaces: x.ifaces.map((k) => (k.name === i.name ? { ...k, vlan: Number(e.target.value) } : k)) }), `interface ${longIface(i.name)}`, `switchport access vlan ${e.target.value}`)}
                className={field()}
              >
                {vlans.map(([id, name]) => <option key={id} value={id}>{id} {name}</option>)}
              </select>
              <button onClick={() => patch((x) => ({ ...x, ifaces: x.ifaces.map((k) => (k.name === i.name ? { ...k, up: !k.up } : k)) }), `interface ${longIface(i.name)}`, i.up ? 'shutdown' : 'no shutdown')} className={cn('h-8 rounded-md text-xs font-semibold', i.up ? 'bg-success/20 text-success' : 'bg-bg-2 text-dim')}>
                {i.up ? 'On' : 'Off'}
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}

function RoutesEditor({ d, patch, tr }: { d: SimDevice; patch: (fn: (x: SimDevice) => SimDevice, ...cmds: string[]) => void; tr: (en: string, fr: string) => string }) {
  const [net, setNet] = useState('')
  const [mask, setMask] = useState('')
  const [via, setVia] = useState('')
  return (
    <div className="mt-5">
      <p className="hud-label mb-2">{tr('Static routes', 'Routes statiques')}</p>
      {(d.routes ?? []).map((r) => (
        <div key={`${r.net}${r.mask}`} className="mb-1 flex items-center gap-2 font-mono text-xs">
          <span className="flex-1">{r.net} {r.mask} → {r.via}</span>
          <button onClick={() => patch((x) => ({ ...x, routes: (x.routes ?? []).filter((k) => k !== r && !(k.net === r.net && k.mask === r.mask)) }), `no ip route ${r.net} ${r.mask} ${r.via}`)} className="text-dim hover:text-danger" aria-label="Delete route"><Trash2 size={13} /></button>
        </div>
      ))}
      <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-2">
        <input value={net} onChange={(e) => setNet(e.target.value)} placeholder={tr('Network', 'Réseau')} className={field()} />
        <input value={mask} onChange={(e) => setMask(e.target.value)} placeholder={tr('Mask', 'Masque')} className={field()} />
        <input value={via} onChange={(e) => setVia(e.target.value)} placeholder={tr('Next hop', 'Saut suivant')} className={field()} />
        <button
          onClick={() => {
            if (!validIp(net) || !validMask(mask) || !validIp(via)) return
            patch((x) => ({ ...x, routes: [...(x.routes ?? []).filter((k) => !(k.net === net && k.mask === mask)), { net, mask, via }] }), 'configure terminal', `ip route ${net} ${mask} ${via}`)
            setNet('')
            setMask('')
            setVia('')
          }}
          className="flex items-center gap-1 rounded-md bg-cyan px-3 text-xs font-semibold text-on-accent"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}
