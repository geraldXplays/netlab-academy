import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { useI18n } from '@/i18n'
import { cn } from '@/lib/cn'

const toInt = (ip: string) => ip.split('.').reduce((n, o) => ((n << 8) + Number(o)) >>> 0, 0) >>> 0
const toIp = (n: number) => [24, 16, 8, 0].map((s) => (n >>> s) & 255).join('.')
const valid = (s: string) => /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.test(s) && s.split('.').every((o) => Number(o) <= 255)

/** Interactive subnet calculator: type an IP, drag the prefix, watch every value update. */
export function SubnetCalc() {
  const { lang } = useI18n()
  const tr = (en: string, fr: string) => (lang === 'fr' ? fr : en)
  const [ip, setIp] = useState('192.168.10.77')
  const [prefix, setPrefix] = useState(26)
  const ok = valid(ip)
  const r = useMemo(() => {
    if (!ok) return null
    const n = toInt(ip)
    const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0
    const net = (n & mask) >>> 0
    const bc = (net | (~mask >>> 0)) >>> 0
    const hosts = prefix >= 31 ? (prefix === 31 ? 2 : 1) : 2 ** (32 - prefix) - 2
    return {
      mask: toIp(mask), wildcard: toIp(~mask >>> 0), net: toIp(net), bc: toIp(bc),
      first: prefix >= 31 ? toIp(net) : toIp(net + 1), last: prefix >= 31 ? toIp(bc) : toIp(bc - 1), hosts,
      bin: n.toString(2).padStart(32, '0'),
      block: 2 ** ((32 - prefix) % 8 || 8),
    }
  }, [ip, prefix, ok])
  const rows: [string, string | number | undefined][] = r
    ? [
        [tr('Subnet mask', 'Masque'), r.mask],
        [tr('Wildcard', 'Masque générique'), r.wildcard],
        [tr('Network address', 'Adresse réseau'), r.net],
        [tr('Broadcast', 'Diffusion'), r.bc],
        [tr('First host', 'Premier hôte'), r.first],
        [tr('Last host', 'Dernier hôte'), r.last],
        [tr('Usable hosts', 'Hôtes utilisables'), r.hosts.toLocaleString()],
      ]
    : []
  return (
    <div className="glass rounded-3xl p-5 sm:p-6">
      <p className="hud-label">{tr('Interactive — subnet calculator', 'Interactif — calculateur de sous-réseau')}</p>
      <div className="mt-4 flex flex-wrap items-end gap-4">
        <label className="text-sm">
          <span className="text-dim">{tr('IP address', 'Adresse IP')}</span>
          <input value={ip} onChange={(e) => setIp(e.target.value.trim())} spellCheck={false} className={cn('mt-1 block h-11 w-48 rounded-xl border bg-bg-2 px-3 font-mono text-base outline-none focus:border-cyan', ok ? 'border-line-strong' : 'border-danger')} />
        </label>
        <label className="min-w-56 flex-1 text-sm">
          <span className="flex justify-between text-dim"><span>{tr('Prefix length', 'Longueur de préfixe')}</span><span className="font-mono text-lg font-semibold text-cyan">/{prefix}</span></span>
          <input type="range" min={8} max={30} value={prefix} onChange={(e) => setPrefix(Number(e.target.value))} className="mt-2 w-full accent-[var(--cyan)]" aria-label={tr('Prefix length', 'Longueur de préfixe')} />
        </label>
      </div>
      {r && (
        <>
          <div className="mt-5 flex flex-wrap gap-[3px] font-mono text-[0.78rem]" aria-hidden>
            {r.bin.split('').map((b, i) => (
              <motion.span key={i} layout className={cn('grid h-7 w-[1.15rem] place-items-center rounded', i < prefix ? 'bg-cyan-soft text-cyan' : 'bg-warning/10 text-warning', i % 8 === 7 && i < 31 && 'mr-2')}>{b}</motion.span>
            ))}
          </div>
          <p className="mt-2 text-xs text-dim">
            <span className="text-cyan">■</span> {tr(`${prefix} network bits`, `${prefix} bits réseau`)} · <span className="text-warning">■</span> {tr(`${32 - prefix} host bits`, `${32 - prefix} bits hôte`)} · {tr('block size', 'taille de bloc')} {r.block}
          </p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            {rows.map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded-xl border border-line bg-bg-2/50 px-3 py-2">
                <dt className="text-sm text-muted">{k}</dt>
                <dd className="font-mono text-sm font-semibold">{v}</dd>
              </div>
            ))}
          </dl>
        </>
      )}
    </div>
  )
}
