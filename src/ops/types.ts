/**
 * IT Operations Simulator — world model.
 *
 * An incident runs inside an `OpsWorld`: the real network simulator topology
 * (so ping, tracert, VLANs and IOS behave for real) plus the parts of a
 * company IT estate the network engine doesn't model — services, disks and
 * files, Active Directory accounts, DHCP scopes, DNS zones, firewall policy
 * and logs. Every command or action produces a new world, and the scenario
 * decides when the incident is resolved.
 */
import type { L } from '@/content/types'
import type { SimDevice, SimLink, Topology } from '@/sim/types'

export type Os = 'win' | 'winsrv' | 'linux' | 'ios'

export interface Svc {
  /** Short name used in commands (systemctl / Get-Service). */
  name: string
  display: string
  state: 'running' | 'stopped' | 'failed'
  /** Starts automatically at boot. */
  enabled: boolean
  port?: number
  /** Service writes to disk: it fails when the disk is full. */
  writes?: boolean
}

export interface FileNode {
  /** bytes */
  size: number
  content?: string
  /** Deleting this file is destructive (data loss). */
  critical?: boolean
}

export interface Account {
  sam: string
  name: string
  dept: string
  enabled: boolean
  locked: boolean
  badCount: number
  lastBad?: string
  pwdExpired: boolean
  groups: string[]
}

export interface Lease {
  mac: string
  ip: string
  host: string
}

export interface DhcpScope {
  /** network id, e.g. 10.10.20.0 */
  id: string
  name: string
  start: string
  end: string
  mask: string
  router: string
  dns: string
  leaseHours: number
  active: boolean
  leases: Lease[]
}

export interface FwRule {
  id: string
  name: string
  /** 'any' or CIDR, e.g. 10.10.0.0/16 */
  src: string
  /** 'any', a host IP or CIDR */
  dst: string
  port: number | 'any'
  action: 'allow' | 'deny'
  enabled: boolean
}

export interface LogEntry {
  /** HH:MM:SS */
  t: string
  /** device name */
  src: string
  level: 'info' | 'warn' | 'error' | 'crit'
  msg: string
  /** Windows event id */
  id?: number
  /** service / facility */
  svc?: string
}

export interface Msg {
  id: string
  /** HH:MM */
  t: string
  from: string
  role: L
  text: L
  tone?: 'normal' | 'angry' | 'happy' | 'system'
}

export interface OpsWorld {
  topo: Topology
  /** Saved configuration of network devices ("startup-config"). A reload reverts to it. */
  startup: Record<string, SimDevice>
  os: Record<string, Os>
  svcs: Record<string, Svc[]>
  files: Record<string, Record<string, FileNode>>
  /** Disk size (bytes) of each server's root volume; used = sum of files. */
  disk: Record<string, number>
  accounts: Account[]
  dhcp?: { server: string; scopes: DhcpScope[] }
  /** Hosts that take their address from DHCP. */
  dhcpClients: string[]
  dns?: { server: string; zone: string; records: Record<string, string>; forwarder: string }
  /** Public DNS names → address. */
  external: Record<string, string>
  fw?: { dev: string; rules: FwRule[] }
  /** Cables that have been pulled out (shown dangling on the map). */
  unplugged: SimLink[]
  logs: LogEntry[]
  /** Office clock when the incident started (minutes after midnight). */
  clock0: number
  /** Seconds since start (set by the console before each action). */
  elapsed: number
  /** Scenario-specific state. */
  flags: Record<string, unknown>
}

/** Something the learner did. Scored against the scenario's evidence & hazards. */
export interface OpsEvent {
  at: number
  kind: 'cmd' | 'act'
  /** device name (cmd) */
  dev?: string
  /** command line, or action id: view-logs, view-monitor, reseat, power, fw-add, fw-del, fw-edit, file-save, hint… */
  line: string
  /** Semantic tag emitted by the shell: svc-restart:nginx, reboot, reload, rm:/path, pwd-reset:user… */
  tags?: string[]
}

export interface Check {
  id: string
  label: L
  test: (w: OpsWorld) => boolean
}

export interface Hazard {
  id: string
  label: L
  /** points lost (out of 100) */
  penalty: number
  test: (e: OpsEvent, before: OpsWorld, after: OpsWorld) => boolean
}

export interface Reaction {
  world?: OpsWorld
  msgs?: Omit<Msg, 'id' | 't'>[]
}

export type ToolId = 'map' | 'terminal' | 'logs' | 'monitor' | 'firewall' | 'editor'

export interface Scenario {
  id: string
  number: number
  title: L
  category: 'network' | 'server' | 'identity' | 'security'
  difficulty: 1 | 2 | 3
  /** Target time to resolve (minutes) */
  minutes: number
  xp: number
  skills: string[]
  role: L
  company: L
  /** Office time the incident starts, e.g. "08:47" */
  start: string
  intro: L
  ticket: { id: string; from: string; dept: L; priority: 'P1' | 'P2' | 'P3'; subject: L; body: L }
  /** Responsibilities shown in the briefing */
  duties: L[]
  tools: ToolId[]
  build: () => OpsWorld
  /** Monitoring board items; all green = resolved. */
  checks: Check[]
  rootCauses: { id: string; label: L }[]
  cause: string
  /** Key diagnostic steps a good technician takes. */
  evidence: { id: string; label: L; test: (e: OpsEvent) => boolean }[]
  hazards?: Hazard[]
  /** Environment reacts to an action (consequences, err-disable, new problems…). */
  react?: (w: OpsWorld, e: OpsEvent, before: OpsWorld) => Reaction | void
  /** Can this service start? Return a log line explaining why not. */
  startCheck?: (w: OpsWorld, devId: string, svc: string) => string | null
  /** Messages that arrive over time while unresolved (seconds after start). */
  pressure: { after: number; from: string; role: L; text: L; tone?: Msg['tone'] }[]
  thanks: { from: string; role: L; text: L }
  hints: L[]
  /** Questions you can send to the person who opened the ticket (investigation by interview). */
  replies?: { id: string; label: L; answer: L }[]
  /** Hands-on actions available on specific devices (physical checks, removing a rogue device…). */
  actions?: { id: string; dev: string; label: L; detail?: L; apply: (w: OpsWorld) => Reaction & { out?: L } }[]
  /** Device the monitoring probes run from (green/red on the map). */
  nms: string
  report: { what: L; cause: L; optimal: L[]; lessons: L[] }
}
