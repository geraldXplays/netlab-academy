import type { Scenario } from '@/ops/types'
import { mondayOutage, internetDown, portDown, wrongVlan } from './network'
import { sharesDown, lockedOut, dhcpFull, dnsDown } from './services'
import { diskFullScenario, firewallBlock, linuxService } from './servers'

export const INCIDENTS: Scenario[] = [mondayOutage, internetDown, sharesDown, lockedOut, dhcpFull, dnsDown, portDown, wrongVlan, diskFullScenario, firewallBlock, linuxService].sort((a, b) => a.number - b.number)

export const incidentById = (id: string) => INCIDENTS.find((s) => s.id === id)
