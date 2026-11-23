import { motion } from 'motion/react'
import { useI18n } from '@/i18n'
import { useReducedMotionPref } from '@/hooks/useReducedMotion'
import { Device, DeviceDefs, PtLink } from '@/components/devices/Device'
import { Label, Svg } from './kit'

const useTr = () => {
  const { lang } = useI18n()
  return (en: string, fr: string) => (lang === 'fr' ? fr : en)
}

/** Travelling packet dot (SMIL), skipped under reduced motion. */
function Pkt({ path, dur = 3, delay = 0, color = 'var(--cyan)' }: { path: string; dur?: number; delay?: number; color?: string }) {
  const reduced = useReducedMotionPref()
  if (reduced) return null
  return (
    <g>
      <rect x="-7" y="-5" width="14" height="10" rx="2" fill={color} stroke="#fff" strokeWidth="1">
        <animateMotion dur={`${dur}s`} begin={`${delay}s`} repeatCount="indefinite" path={path} />
      </rect>
    </g>
  )
}

export function LanWanPT() {
  const tr = useTr()
  return (
    <Svg viewBox="0 0 700 330" label={tr('Two LANs joined by a WAN', 'Deux LAN reliés par un WAN')}>
      <DeviceDefs />
      <motion.rect x="8" y="16" width="250" height="300" rx="18" fill="var(--cyan-soft)" stroke="var(--cyan)" strokeDasharray="6 6" />
      <motion.rect x="442" y="16" width="250" height="300" rx="18" fill="var(--purple-soft)" stroke="var(--purple)" strokeDasharray="6 6" />
      <Label x={133} y={38} tone="cyan" weight={700}>LAN · Paris · 192.168.1.0/24</Label>
      <Label x={567} y={38} tone="purple" weight={700}>LAN · Lyon · 192.168.2.0/24</Label>
      <PtLink from={[133, 92]} to={[350, 92]} />
      <PtLink from={[350, 92]} to={[567, 92]} />
      <PtLink from={[133, 92]} to={[133, 180]} />
      <PtLink from={[133, 180]} to={[60, 265]} />
      <PtLink from={[133, 180]} to={[133, 265]} />
      <PtLink from={[133, 180]} to={[206, 265]} />
      <PtLink from={[567, 92]} to={[567, 180]} />
      <PtLink from={[567, 180]} to={[494, 265]} />
      <PtLink from={[567, 180]} to={[567, 265]} />
      <PtLink from={[567, 180]} to={[640, 265]} />
      <Device kind="cloud" x={350} y={92} scale={1.2} name="Internet" sub="WAN" />
      <Device kind="router" x={133} y={92} model="ISR4331" name="R-PARIS" />
      <Device kind="router" x={567} y={92} model="ISR4331" name="R-LYON" />
      <Device kind="switch" x={133} y={180} model="2960-24TT" name="SW-PARIS" />
      <Device kind="switch" x={567} y={180} model="2960-24TT" name="SW-LYON" />
      <Device kind="pc" x={60} y={262} scale={0.8} name="PC1" />
      <Device kind="pc" x={133} y={262} scale={0.8} name="PC2" />
      <Device kind="server" x={206} y={258} scale={0.75} name="SRV" />
      <Device kind="pc" x={494} y={262} scale={0.8} name="PC3" />
      <Device kind="laptop" x={567} y={262} scale={0.8} name="LAP1" />
      <Device kind="printer" x={640} y={262} scale={0.8} name="PRN" />
      <Pkt path="M60 262 L133 180 L133 92 L350 92 L567 92 L567 180 L640 262" dur={4} />
    </Svg>
  )
}

export function HomeNetworkPT() {
  const tr = useTr()
  return (
    <Svg viewBox="0 0 720 320" label={tr('Small office network', 'Réseau de petit bureau')}>
      <DeviceDefs />
      <PtLink from={[60, 120]} to={[170, 120]} />
      <PtLink from={[170, 120]} to={[290, 120]} />
      <PtLink from={[290, 120]} to={[420, 120]} />
      <PtLink from={[420, 120]} to={[560, 120]} />
      <PtLink from={[560, 120]} to={[470, 245]} />
      <PtLink from={[560, 120]} to={[560, 245]} />
      <PtLink from={[560, 120]} to={[650, 245]} status="blocking" statusB="up" />
      <PtLink from={[560, 120]} to={[660, 40]} />
      <Device kind="cloud" x={60} y={120} scale={0.9} name={tr('ISP', 'FAI')} />
      <Device kind="modem" x={170} y={120} name="ONT" sub={tr('fibre → Ethernet', 'fibre → Ethernet')} />
      <Device kind="router" x={290} y={120} name={tr('Router', 'Routeur')} sub="192.168.1.1" />
      <Device kind="firewall" x={420} y={120} scale={0.85} name={tr('Firewall', 'Pare-feu')} />
      <Device kind="switch" x={560} y={120} model="2960-24TT" name="Switch0" />
      <Device kind="ap" x={660} y={40} scale={0.85} name="AP-01" />
      <Device kind="pc" x={470} y={242} scale={0.85} name="PC0" sub=".10" />
      <Device kind="laptop" x={560} y={242} scale={0.85} name="LAP0" sub=".11" />
      <Device kind="printer" x={650} y={242} scale={0.85} name="PRN0" sub=".50" />
      <Label x={290} y={70} tone="cyan" size={10}>{tr('default gateway', 'passerelle par défaut')}</Label>
      <Pkt path="M470 242 L560 120 L420 120 L290 120 L170 120 L60 120" dur={3.6} />
    </Svg>
  )
}

export function PacketJourneyPT() {
  const tr = useTr()
  const steps = [
    { x: 150, t: '1 DHCP', d: tr('IP settings', 'réglages IP') },
    { x: 150, t: '2 DNS', d: tr('name → IP', 'nom → IP') },
    { x: 260, t: '3 ARP', d: tr('gateway MAC', 'MAC passerelle') },
    { x: 380, t: '4 NAT', d: tr('private → public', 'privé → public') },
    { x: 520, t: '5 Internet', d: tr('router hops', 'sauts de routeurs') },
    { x: 640, t: '6 HTTP', d: tr('page returned', 'page renvoyée') },
  ]
  return (
    <Svg viewBox="0 0 720 300" label={tr('Journey of a web request', 'Parcours d’une requête web')}>
      <DeviceDefs />
      <PtLink from={[40, 140]} to={[150, 140]} />
      <PtLink from={[150, 140]} to={[260, 140]} />
      <PtLink from={[260, 140]} to={[380, 140]} />
      <PtLink from={[380, 140]} to={[520, 140]} />
      <PtLink from={[520, 140]} to={[650, 140]} />
      <PtLink from={[150, 140]} to={[150, 240]} />
      <Device kind="pc" x={40} y={136} scale={0.9} name="PC" sub="192.168.1.10" />
      <Device kind="switch" x={150} y={140} scale={0.85} name="SW" />
      <Device kind="server" x={150} y={238} scale={0.7} name="DHCP/DNS" />
      <Device kind="router" x={260} y={140} scale={0.9} name="R1" />
      <Device kind="firewall" x={380} y={140} scale={0.75} name="NAT/FW" />
      <Device kind="cloud" x={520} y={140} scale={1} name="Internet" />
      <Device kind="server" x={650} y={134} scale={0.85} name="web" sub="203.0.113.80" />
      {steps.map((s, i) => (
        <g key={s.t}>
          <rect x={s.x - 48} y={i === 1 ? 52 : 18} width="96" height="28" rx="8" fill="var(--bg-2)" stroke="var(--cyan)" strokeOpacity="0.5" />
          <text x={s.x} y={(i === 1 ? 52 : 18) + 12} textAnchor="middle" fontSize="10" fontWeight="700" fill="var(--cyan)">{s.t}</text>
          <text x={s.x} y={(i === 1 ? 52 : 18) + 23} textAnchor="middle" fontSize="9" fill="var(--text-dim)">{s.d}</text>
        </g>
      ))}
      <Pkt path="M40 136 L150 140 L150 238 L150 140 L260 140 L380 140 L520 140 L650 134" dur={5} />
      <Pkt path="M650 134 L520 140 L380 140 L260 140 L150 140 L40 136" dur={5} color="var(--success)" />
    </Svg>
  )
}

export function TopologiesPT() {
  const tr = useTr()
  const pc = (x: number, y: number, k: string) => <Device key={k} kind="pc" x={x} y={y} scale={0.45} animate={false} />
  return (
    <Svg viewBox="0 0 720 240" label={tr('Star, bus, ring and mesh topologies', 'Topologies étoile, bus, anneau et maillée')}>
      <DeviceDefs />
      {/* star */}
      {[[35, 55], [135, 55], [35, 160], [135, 160]].map(([x, y], i) => <PtLink key={i} from={[85, 108]} to={[x, y]} pad={18} animate={false} />)}
      <Device kind="switch" x={85} y={108} scale={0.55} animate={false} />
      {[[35, 55], [135, 55], [35, 160], [135, 160]].map(([x, y], i) => pc(x, y, `s${i}`))}
      <Label x={85} y={222} tone="text" weight={700}>{tr('Star', 'Étoile')}</Label>
      {/* bus */}
      <line x1="190" y1="108" x2="340" y2="108" stroke="var(--text-muted)" strokeWidth="4" />
      {[205, 245, 285, 325].map((x, i) => (
        <g key={i}>
          <line x1={x} y1="108" x2={x} y2={i % 2 ? 150 : 66} stroke="var(--text-muted)" strokeWidth="1.6" />
          {pc(x, i % 2 ? 164 : 54, `b${i}`)}
        </g>
      ))}
      <Label x={265} y={222} tone="text" weight={700}>Bus</Label>
      {/* ring */}
      {(() => {
        const pts = [[450, 50], [505, 82], [505, 140], [450, 172], [395, 140], [395, 82]]
        return (
          <g>
            {pts.map((p, i) => <PtLink key={i} from={p as [number, number]} to={pts[(i + 1) % 6] as [number, number]} pad={16} animate={false} />)}
            {pts.map(([x, y], i) => pc(x, y, `r${i}`))}
          </g>
        )
      })()}
      <Label x={450} y={222} tone="text" weight={700}>{tr('Ring', 'Anneau')}</Label>
      {/* mesh */}
      {(() => {
        const pts: [number, number][] = [[585, 55], [675, 55], [675, 160], [585, 160]]
        const links: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3]]
        return (
          <g>
            {links.map(([a, b], i) => <PtLink key={i} from={pts[a]} to={pts[b]} pad={18} animate={false} />)}
            {pts.map(([x, y], i) => <Device key={i} kind="router" x={x} y={y} scale={0.5} animate={false} />)}
          </g>
        )
      })()}
      <Label x={630} y={222} tone="text" weight={700}>{tr('Mesh', 'Maillée')}</Label>
    </Svg>
  )
}
