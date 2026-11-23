import type { Scenario } from '@/ops/types'
import { t } from '@/content/lessons/types'
import { log } from '@/ops/world'
import { ID, hq, hasLease, autoRenew, IT_ROLE, COMPANY, DUTIES } from './hq'
import { onCmd, onTag, onAct, any, smbOk, internetOk, pingOk, setIf, setRoutes, iface } from './helpers'

const ADMIN_PCS = ['ADM-PC1', 'ADM-PC2', 'ADM-PC3']
const SALES_PCS = ['SAL-PC1', 'SAL-PC2', 'SAL-PC3', 'SAL-LAPTOP']
const HELPDESK = { en: 'Service desk', fr: 'Centre de services' }

/* ============================ 1. Monday morning outage ============================ */

export const mondayOutage: Scenario = {
  id: 'inc-monday-outage',
  number: 1,
  category: 'network',
  difficulty: 1,
  minutes: 8,
  xp: 150,
  skills: ['networking', 'routing'],
  title: t('Monday morning network outage', 'Panne réseau du lundi matin'),
  role: IT_ROLE,
  company: COMPANY,
  start: '08:47',
  intro: t(
    'Monday, 08:47. You have just hung up your coat at Meridian Logistics when the service desk escalates an urgent ticket to you. The whole Administration department says it has "no network at all". Payroll has to be sent to the bank before 11:00.',
    'Lundi, 08h47. Vous venez d’accrocher votre manteau chez Meridian Logistics quand le centre de services vous escalade un ticket urgent. Tout le service Administration dit n’avoir « plus du tout de réseau ». La paie doit partir à la banque avant 11h00.',
  ),
  ticket: {
    id: 'INC-4501', from: 'Sarah Koné', dept: t('Administration', 'Administration'), priority: 'P1',
    subject: t('URGENT — Administration has no network', 'URGENT — Plus de réseau à l’Administration'),
    body: t(
      'Nobody in Administration can open the shared drive, email or the internet since we arrived this morning. The printer doesn’t work either. Sales next door seem fine?! We have payroll to send before 11:00.',
      'Personne à l’Administration ne peut ouvrir le lecteur partagé, la messagerie ou internet depuis notre arrivée ce matin. L’imprimante ne marche pas non plus. Le Commercial à côté a l’air de fonctionner ?! On doit envoyer la paie avant 11h00.',
    ),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '08:47',
      before: (w) => setIf(w, ID.SWADM, 'Gi0/1', { up: false }),
      logs: [
        { t: '07:58:12', src: 'DC01', level: 'info', id: 4624, msg: 'An account was successfully logged on. Account: contractor.netops  Source: 10.10.99.77 (vty)' },
        { t: '07:58:29', src: 'SW-ADMIN', level: 'warn', svc: 'LINK-5-CHANGED', msg: 'Interface GigabitEthernet0/1, changed state to administratively down' },
        { t: '07:58:29', src: 'SW-ADMIN', level: 'warn', svc: 'LINEPROTO-5-UPDOWN', msg: 'Line protocol on Interface GigabitEthernet0/1, changed state to down' },
        { t: '07:58:29', src: 'R-CORE', level: 'error', svc: 'LINK-3-UPDOWN', msg: 'Interface GigabitEthernet0/0/1, changed state to down' },
        { t: '07:58:31', src: 'SW-ADMIN', level: 'info', svc: 'SYS-5-CONFIG_I', msg: 'Configured from console by vty0 (10.10.99.77)' },
        { t: '07:58:40', src: 'SW-ADMIN', level: 'info', svc: 'SYS-5-CONFIG_I', msg: 'Configuration saved to startup-config by vty0 (10.10.99.77)' },
        { t: '08:31:02', src: 'DC01', level: 'warn', id: 1046, svc: 'dhcp', msg: 'No DHCP requests received on scope 10.10.10.0 (Admin) in the last 30 minutes.' },
      ],
    }),
  checks: [
    { id: 'lease', label: t('Admin PCs have valid IP addresses', 'Les PC Admin ont une adresse IP valide'), test: (w) => [ID.ADM1, ID.ADM2, ID.ADM3].every((d) => hasLease(w, d)) },
    { id: 'smb', label: t('Admin → file server (\\\\fs01)', 'Admin → serveur de fichiers (\\\\fs01)'), test: (w) => smbOk(w, ID.ADM1) && smbOk(w, ID.ADM2) },
    { id: 'web', label: t('Admin → Internet', 'Admin → Internet'), test: (w) => internetOk(w, ID.ADM2) },
    { id: 'prn', label: t('Admin printer online', 'Imprimante Admin en ligne'), test: (w) => pingOk(w, ID.IT, '10.10.10.200') },
  ],
  rootCauses: [
    { id: 'dhcp', label: t('The DHCP server stopped handing out addresses', 'Le serveur DHCP ne distribue plus d’adresses') },
    { id: 'uplink', label: t('The Admin switch uplink port was administratively shut down', 'Le port montant du switch Admin a été désactivé (shutdown)') },
    { id: 'dns', label: t('DNS resolution failure', 'Panne de résolution DNS') },
    { id: 'cable', label: t('A faulty patch cable on one PC', 'Un câble défectueux sur un PC') },
    { id: 'router', label: t('The core router lost its configuration', 'Le routeur principal a perdu sa configuration') },
  ],
  cause: 'uplink',
  evidence: [
    { id: 'ipconfig', label: t('Checked a client’s IP configuration (APIPA 169.254.x.x)', 'Vérifié la configuration IP d’un poste (APIPA 169.254.x.x)'), test: onCmd(/^ipconfig/i, ADMIN_PCS) },
    { id: 'scope', label: t('Compared with a working department / tested the path', 'Comparé avec un service qui marche / testé le chemin'), test: any(onTag('ping', ['IT-PC', 'R-CORE', ...ADMIN_PCS, ...SALES_PCS]), onTag('tracert')) },
    { id: 'ports', label: t('Inspected switch / router interface status', 'Inspecté l’état des interfaces du switch / routeur'), test: any(onTag('show-int-status', ['SW-ADMIN', 'R-CORE']), onTag('show-ip-int', ['SW-ADMIN', 'R-CORE'])) },
    { id: 'logs', label: t('Read the logs to find what changed (and who)', 'Lu les journaux pour trouver ce qui a changé (et qui)'), test: any(onTag('show-logging'), onAct('view-logs')) },
    { id: 'save', label: t('Saved the fixed configuration (copy run start)', 'Sauvegardé la configuration corrigée (copy run start)'), test: onTag('save-config', 'SW-ADMIN') },
  ],
  hazards: [
    { id: 'dhcp-restart', label: t('Restarted the healthy DHCP service — every renewal on the site hiccuped', 'Redémarré le service DHCP sain — toutes les attributions du site ont été perturbées'), penalty: 3, test: (e) => !!e.tags?.some((x) => x.startsWith('svc-restart:dhcp')) },
  ],
  react: (w) => ({ world: autoRenew(w, [ID.ADM1, ID.ADM2, ID.ADM3]) }),
  pressure: [
    { after: 150, from: 'Sarah Koné', role: t('Administration', 'Administration'), text: t('Any news? The bank cut-off is at 11:00…', 'Des nouvelles ? La banque clôture à 11h00…') },
    { after: 360, from: 'Paul Girard', role: t('Finance director', 'Directeur financier'), text: t('I’m told Administration is still down. I need an ETA now, please.', 'On me dit que l’Administration est toujours en panne. J’ai besoin d’une estimation tout de suite.') },
  ],
  thanks: { from: 'Sarah Koné', role: t('Administration', 'Administration'), text: t('Everything is back — shared drive, email, the printer. Thank you!! What was it?', 'Tout est revenu — lecteur partagé, mails, l’imprimante. Merci !! C’était quoi ?') },
  hints: [
    t('Start on an Admin PC: run ipconfig. An address starting with 169.254 means the PC never heard back from the DHCP server.', 'Commencez sur un PC Admin : ipconfig. Une adresse en 169.254 signifie que le PC n’a jamais reçu de réponse du serveur DHCP.'),
    t('Sales works and uses the same DHCP server — so DHCP is probably fine. What sits between the Admin PCs and the rest of the network?', 'Le Commercial fonctionne et utilise le même serveur DHCP — le DHCP va donc sans doute bien. Qu’y a-t-il entre les PC Admin et le reste du réseau ?'),
    t('Open SW-ADMIN: enable → show interfaces status (or show ip interface brief). Look at the uplink Gi0/1, then check show logging.', 'Ouvrez SW-ADMIN : enable → show interfaces status (ou show ip interface brief). Regardez le port montant Gi0/1, puis show logging.'),
    t('configure terminal → interface gi0/1 → no shutdown → end → copy running-config startup-config.', 'configure terminal → interface gi0/1 → no shutdown → end → copy running-config startup-config.'),
  ],
  report: {
    what: t(
      'At 07:58 a contractor connected to SW-ADMIN remotely and shut down the uplink GigabitEthernet0/1 — probably mistaking it for an unused port — then saved the configuration. The Admin switch was cut off from the router, so PCs booting at 08:30 never reached the DHCP server and fell back to 169.254.x.x addresses.',
      'À 07h58, un prestataire s’est connecté à distance sur SW-ADMIN et a désactivé le port montant GigabitEthernet0/1 — le prenant sans doute pour un port inutilisé — puis a sauvegardé la configuration. Le switch Admin a été coupé du routeur : les PC démarrés vers 08h30 n’ont jamais joint le serveur DHCP et ont pris une adresse 169.254.x.x.',
    ),
    cause: t('The Admin switch uplink (Gi0/1) was administratively shut down by an unplanned change.', 'Le port montant du switch Admin (Gi0/1) a été désactivé par un changement non planifié.'),
    optimal: [
      t('ipconfig on an Admin PC → 169.254.x.x (no DHCP answer).', 'ipconfig sur un PC Admin → 169.254.x.x (pas de réponse DHCP).'),
      t('Sales works with the same DHCP server → the problem is between Admin and the core.', 'Le Commercial marche avec le même DHCP → le problème est entre l’Admin et le cœur de réseau.'),
      t('SW-ADMIN: show interfaces status → Gi0/1 "disabled"; show logging → changed at 07:58 by 10.10.99.77.', 'SW-ADMIN : show interfaces status → Gi0/1 « disabled » ; show logging → modifié à 07h58 par 10.10.99.77.'),
      t('interface gi0/1 → no shutdown, then copy running-config startup-config.', 'interface gi0/1 → no shutdown, puis copy running-config startup-config.'),
      t('Confirm users can work, then follow up with the contractor and the change process.', 'Confirmer que les utilisateurs travaillent, puis voir avec le prestataire et le processus de changement.'),
    ],
    lessons: [
      t('A 169.254.x.x address is a symptom, not a cause: the PC simply could not reach DHCP.', 'Une adresse 169.254.x.x est un symptôme, pas une cause : le PC n’a juste pas pu joindre le DHCP.'),
      t('Compare with what still works — it shrinks the search area instantly.', 'Comparez avec ce qui marche encore — cela réduit immédiatement la zone de recherche.'),
      t('Logs tell you what changed and when. Most outages follow a change.', 'Les journaux disent ce qui a changé et quand. La plupart des pannes suivent un changement.'),
      t('If you don’t save the fix, the next reboot brings the outage back.', 'Si vous ne sauvegardez pas le correctif, le prochain redémarrage ramène la panne.'),
      t('Label uplink ports (description UPLINK-R-CORE) so nobody shuts them by mistake.', 'Nommez les ports montants (description UPLINK-R-CORE) pour que personne ne les coupe par erreur.'),
    ],
  },
}

/* ============================ 2. Internet outage ============================ */

export const internetDown: Scenario = {
  id: 'inc-internet-down',
  number: 2,
  category: 'network',
  difficulty: 2,
  minutes: 10,
  xp: 200,
  skills: ['routing', 'networking'],
  title: t('The company loses Internet access', 'L’entreprise perd l’accès Internet'),
  role: IT_ROLE,
  company: COMPANY,
  start: '09:12',
  intro: t(
    'Tuesday, 09:12. Tickets are piling up: nobody can reach websites, cloud apps or partner portals. Internal tools still work. A network engineer did "some cleanup" on the edge firewall early this morning.',
    'Mardi, 09h12. Les tickets s’accumulent : personne n’accède aux sites web, applis cloud ni portails partenaires. Les outils internes marchent toujours. Un ingénieur réseau a fait « un peu de ménage » sur le pare-feu de bordure tôt ce matin.',
  ),
  ticket: {
    id: 'INC-4517', from: 'Lucas Petit', dept: t('Sales', 'Commercial'), priority: 'P1',
    subject: t('No internet for anyone', 'Plus d’internet pour personne'),
    body: t('Websites don’t load, Teams is disconnected, the customer portal times out. The shared drive works fine though. Is it a DNS problem?', 'Les sites ne chargent pas, Teams est déconnecté, le portail client expire. Le lecteur partagé marche par contre. C’est un problème de DNS ?'),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '09:12',
      before: (w) => setRoutes(w, ID.FW, (r) => r.filter((x) => x.net !== '0.0.0.0')),
      logs: [
        { t: '06:14:51', src: 'FW-EDGE', level: 'info', svc: 'SYS-5-CONFIG_I', msg: 'Configured from console by netops.jdoe on vty0 (CHG-2291 "remove unused static routes")' },
        { t: '06:14:58', src: 'FW-EDGE', level: 'warn', svc: 'IP-4-ROUTE', msg: 'Static route 0.0.0.0/0 via 203.0.113.1 removed' },
        { t: '06:15:02', src: 'FW-EDGE', level: 'info', svc: 'SYS-5-CONFIG_I', msg: 'Configuration saved to startup-config' },
        { t: '07:40:13', src: 'DC01', level: 'warn', id: 4013, svc: 'dns', msg: 'The DNS server timed out forwarding queries to 8.8.8.8.' },
        { t: '08:55:30', src: 'FW-EDGE', level: 'warn', svc: 'IP-4-NOROUTE', msg: 'No route to host 142.250.74.46 from 10.10.20.101 (dropped 1,284 packets)' },
      ],
    }),
  checks: [
    { id: 'admin', label: t('Admin → Internet', 'Admin → Internet'), test: (w) => internetOk(w, ID.ADM1) },
    { id: 'sales', label: t('Sales → Internet', 'Commercial → Internet'), test: (w) => internetOk(w, ID.SAL1) },
    { id: 'dns', label: t('External names resolve (DNS forwarding)', 'Les noms externes se résolvent (redirection DNS)'), test: (w) => pingOk(w, ID.DC, '8.8.8.8') },
    { id: 'internal', label: t('Internal file server still available', 'Serveur de fichiers interne toujours disponible'), test: (w) => smbOk(w, ID.ADM1) },
  ],
  rootCauses: [
    { id: 'dns', label: t('The internal DNS server is broken', 'Le serveur DNS interne est en panne') },
    { id: 'isp', label: t('The Internet provider has an outage', 'Le fournisseur d’accès a une panne') },
    { id: 'route', label: t('The firewall’s default route to the ISP was removed', 'La route par défaut du pare-feu vers le FAI a été supprimée') },
    { id: 'core', label: t('The core router lost its default route', 'Le routeur principal a perdu sa route par défaut') },
    { id: 'nat', label: t('The firewall’s WAN interface is down', 'L’interface WAN du pare-feu est tombée') },
  ],
  cause: 'route',
  evidence: [
    { id: 'ip-vs-name', label: t('Pinged a public IP (8.8.8.8) to separate routing from DNS', 'Pingé une IP publique (8.8.8.8) pour séparer routage et DNS'), test: onCmd(/^(ping|test-netconnection|tnc)\s+(8\.8\.8\.8|142\.250\.74\.46|20\.70\.246\.20|140\.82\.112\.3)/i) },
    { id: 'trace', label: t('Traced the path to find where packets stop', 'Tracé le chemin pour voir où les paquets s’arrêtent'), test: onTag('tracert') },
    { id: 'routes', label: t('Read the routing table on the firewall', 'Lu la table de routage du pare-feu'), test: onTag('show-route', 'FW-EDGE') },
    { id: 'logs', label: t('Found the change in the firewall logs', 'Trouvé le changement dans les journaux du pare-feu'), test: any(onTag('show-logging', 'FW-EDGE'), onAct('view-logs')) },
    { id: 'save', label: t('Saved the fixed configuration', 'Sauvegardé la configuration corrigée'), test: onTag('save-config', 'FW-EDGE') },
  ],
  hazards: [
    { id: 'dns-forwarder', label: t('Changed the DNS forwarder — DNS was a symptom, not the cause', 'Modifié le redirecteur DNS — le DNS était un symptôme, pas la cause'), penalty: 4, test: (e) => !!e.tags?.includes('dns-set-forwarder') },
    { id: 'dns-restart', label: t('Restarted the DNS service needlessly', 'Redémarré inutilement le service DNS'), penalty: 2, test: (e) => !!e.tags?.some((x) => x.startsWith('svc-restart:dns')) },
  ],
  pressure: [
    { after: 120, from: 'Lucas Petit', role: t('Sales', 'Commercial'), text: t('A customer is waiting on a call for a quote from the portal… any news?', 'Un client attend au téléphone un devis du portail… des nouvelles ?') },
    { after: 300, from: 'Helpdesk', role: HELPDESK, text: t('We have 23 tickets open for "no internet". Should I send an all-staff message?', 'On a 23 tickets ouverts « pas d’internet ». J’envoie un message à tout le personnel ?') },
  ],
  thanks: { from: 'Lucas Petit', role: t('Sales', 'Commercial'), text: t('Internet is back, the portal loads instantly. Thanks!', 'Internet est revenu, le portail charge tout de suite. Merci !') },
  hints: [
    t('Try ping 8.8.8.8 and ping google.com. If the IP fails too, it is not (only) DNS.', 'Essayez ping 8.8.8.8 et ping google.com. Si l’IP échoue aussi, ce n’est pas (seulement) le DNS.'),
    t('tracert 8.8.8.8 from IT-PC shows the last device that answered.', 'tracert 8.8.8.8 depuis IT-PC montre le dernier équipement qui a répondu.'),
    t('On FW-EDGE: enable → show ip route. Is there a "Gateway of last resort"? Then show logging.', 'Sur FW-EDGE : enable → show ip route. Y a-t-il une « Gateway of last resort » ? Puis show logging.'),
    t('configure terminal → ip route 0.0.0.0 0.0.0.0 203.0.113.1 → end → write memory.', 'configure terminal → ip route 0.0.0.0 0.0.0.0 203.0.113.1 → end → write memory.'),
  ],
  report: {
    what: t(
      'At 06:14 change CHG-2291 removed "unused" static routes on FW-EDGE — including the default route 0.0.0.0/0 towards the ISP. Internal traffic kept working, but every packet for the Internet was dropped at the firewall. The DNS server could no longer reach its forwarder, which made it look like a DNS problem.',
      'À 06h14, le changement CHG-2291 a supprimé des routes statiques « inutilisées » sur FW-EDGE — dont la route par défaut 0.0.0.0/0 vers le FAI. Le trafic interne a continué, mais tout paquet vers Internet était jeté au pare-feu. Le serveur DNS ne joignait plus son redirecteur, ce qui faisait croire à un problème DNS.',
    ),
    cause: t('The firewall’s default route (0.0.0.0/0 via 203.0.113.1) was deleted during a change.', 'La route par défaut du pare-feu (0.0.0.0/0 via 203.0.113.1) a été supprimée lors d’un changement.'),
    optimal: [
      t('ping 8.8.8.8 fails as well as names → routing problem, DNS is a side effect.', 'ping 8.8.8.8 échoue comme les noms → problème de routage, le DNS n’est qu’un effet.'),
      t('tracert 8.8.8.8 stops after the firewall.', 'tracert 8.8.8.8 s’arrête après le pare-feu.'),
      t('FW-EDGE: show ip route → no gateway of last resort; show logging → CHG-2291.', 'FW-EDGE : show ip route → pas de passerelle par défaut ; show logging → CHG-2291.'),
      t('ip route 0.0.0.0 0.0.0.0 203.0.113.1, write memory, test from several departments.', 'ip route 0.0.0.0 0.0.0.0 203.0.113.1, write memory, tester depuis plusieurs services.'),
    ],
    lessons: [
      t('Test with an IP address before blaming DNS: it splits the problem in two.', 'Testez avec une adresse IP avant d’accuser le DNS : cela coupe le problème en deux.'),
      t('tracert shows where the path breaks; the device after the last answer is your suspect.', 'tracert montre où le chemin casse ; l’équipement après la dernière réponse est le suspect.'),
      t('The default route is easy to miss in a "cleanup" — changes need a rollback plan and a test.', 'La route par défaut s’oublie facilement dans un « ménage » — un changement exige un plan de retour arrière et un test.'),
    ],
  },
}

/* ============================ 7. Switch port stops working ============================ */

const ROGUE_MAC = '3c22.fb11.0a7e'

export const portDown: Scenario = {
  id: 'inc-port-errdisable',
  number: 7,
  category: 'network',
  difficulty: 2,
  minutes: 8,
  xp: 175,
  skills: ['routing', 'security'],
  title: t('A switch port suddenly stops working', 'Un port de switch cesse de fonctionner'),
  role: IT_ROLE,
  company: COMPANY,
  start: '08:52',
  intro: t(
    'Monday, 08:52. Tom from Sales was working fine a few minutes ago — now his PC has no network at all. Everybody else in Sales is OK. Ports on SW-SALES are protected by port security (one device per port).',
    'Lundi, 08h52. Tom, du Commercial, travaillait normalement il y a quelques minutes — maintenant son PC n’a plus de réseau. Tout le reste du Commercial va bien. Les ports de SW-SALES sont protégés par port security (un appareil par port).',
  ),
  ticket: {
    id: 'INC-4522', from: 'Tom Nguyen', dept: t('Sales', 'Commercial'), priority: 'P3',
    subject: t('My PC lost the network', 'Mon PC a perdu le réseau'),
    body: t('It worked when I arrived and then just died around 08:36. I already restarted the PC twice. The cable is plugged in.', 'Ça marchait en arrivant puis ça a lâché vers 08h36. J’ai déjà redémarré le PC deux fois. Le câble est branché.'),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '08:52',
      spec: (s) => [...s, { id: 'hub', type: 'switch', name: 'MINI-SW', x: 935, y: 336 }, { id: 'tomlt', type: 'laptop', name: 'TOM-PERSONAL', x: 1010, y: 336 }],
      links: (l) => [...l.filter((x) => !(x[0] === ID.SWSAL && x[1] === 'Fa0/2')), [ID.SWSAL, 'Fa0/2', 'hub', 'Fa0/1'], ['hub', 'Fa0/2', ID.SAL2, 'Fa0'], ['hub', 'Fa0/3', 'tomlt', 'Fa0']],
      after: (w) => ({
        ...setIf(w, ID.SWSAL, 'Fa0/2', { err: true }, true),
        flags: {
          ...w.flags,
          hub: true,
          noConsole: ['hub', 'tomlt'],
          portSecurity: ['Fa0/1', 'Fa0/2', 'Fa0/3', 'Fa0/4'].map((p) => ({ sw: ID.SWSAL, port: p, max: 1, count: 1, violations: p === 'Fa0/2' ? 1 : 0 })),
        },
      }),
      logs: [
        { t: '08:36:40', src: 'SW-SALES', level: 'crit', svc: 'PORT_SECURITY-2-PSECURE_VIOLATION', msg: `Security violation occurred, caused by MAC address ${ROGUE_MAC} on port FastEthernet0/2.` },
        { t: '08:36:40', src: 'SW-SALES', level: 'error', svc: 'PM-4-ERR_DISABLE', msg: 'psecure-violation error detected on Fa0/2, putting Fa0/2 in err-disable state' },
        { t: '08:36:41', src: 'SW-SALES', level: 'warn', svc: 'LINEPROTO-5-UPDOWN', msg: 'Line protocol on Interface FastEthernet0/2, changed state to down' },
      ],
    }),
  checks: [
    { id: 'reach', label: t('SAL-PC2 → file server', 'SAL-PC2 → serveur de fichiers'), test: (w) => smbOk(w, ID.SAL2) },
    { id: 'web', label: t('SAL-PC2 → Internet', 'SAL-PC2 → Internet'), test: (w) => internetOk(w, ID.SAL2) },
    { id: 'rogue', label: t('No unauthorized devices on SW-SALES', 'Aucun appareil non autorisé sur SW-SALES'), test: (w) => !w.flags.hub },
  ],
  rootCauses: [
    { id: 'cable', label: t('Tom’s network cable is broken', 'Le câble réseau de Tom est cassé') },
    { id: 'psec', label: t('Port security shut the port after an unauthorized device was connected', 'Port security a coupé le port après le branchement d’un appareil non autorisé') },
    { id: 'nic', label: t('The PC’s network card failed', 'La carte réseau du PC est en panne') },
    { id: 'dhcp', label: t('DHCP gave Tom a duplicate IP address', 'Le DHCP a donné à Tom une adresse IP en double') },
    { id: 'vlan', label: t('The port was moved to the wrong VLAN', 'Le port a été déplacé dans le mauvais VLAN') },
  ],
  cause: 'psec',
  evidence: [
    { id: 'client', label: t('Checked the PC side (ipconfig / ping gateway)', 'Vérifié côté PC (ipconfig / ping passerelle)'), test: any(onCmd(/^ipconfig/i, 'SAL-PC2'), onTag('ping', 'SAL-PC2')) },
    { id: 'status', label: t('Found the port err-disabled (show interfaces status)', 'Trouvé le port en err-disabled (show interfaces status)'), test: any(onTag('show-int-status', 'SW-SALES'), onTag('show-ip-int', 'SW-SALES')) },
    { id: 'why', label: t('Found why: port-security violation in the logs', 'Trouvé pourquoi : violation port security dans les journaux'), test: any(onTag('show-logging', 'SW-SALES'), onTag('show-port-security', 'SW-SALES'), onAct('view-logs')) },
    { id: 'desk', label: t('Inspected the desk / asked the user', 'Inspecté le bureau / interrogé l’utilisateur'), test: any(onAct('inspect-desk'), onAct('reply:ask-change')) },
  ],
  hazards: [
    { id: 'blind-bounce', label: t('Re-enabled the port before removing the cause — it shut down again immediately', 'Réactivé le port avant de supprimer la cause — il s’est recoupé aussitôt'), penalty: 4, test: (_e, _b, a) => !!a.flags.bouncedWithHub },
  ],
  replies: [
    { id: 'ask-change', label: t('Has anything changed at your desk this morning?', 'Quelque chose a changé à votre bureau ce matin ?'), answer: t('Well… I brought a little switch from home so I can plug my own laptop in too — there’s only one wall socket. Is that a problem?', 'Euh… j’ai ramené un petit switch de chez moi pour brancher aussi mon portable perso — il n’y a qu’une prise murale. C’est un problème ?') },
    { id: 'ask-restart', label: t('Did you try another wall socket?', 'Avez-vous essayé une autre prise murale ?'), answer: t('There is only one at my desk.', 'Il n’y en a qu’une à mon bureau.') },
  ],
  actions: [
    { id: 'inspect-desk', dev: ID.SAL2, label: t('Walk to the desk and inspect the cabling', 'Aller au bureau et inspecter le câblage'),
      apply: (w) => ({ out: w.flags.hub ? t(`Behind the monitor: the wall cable goes into an unmanaged 5-port mini switch. Plugged into it: SAL-PC2 and a personal laptop (MAC ${ROGUE_MAC}).`, `Derrière l’écran : le câble mural arrive dans un mini switch 5 ports non administrable. Branchés dessus : SAL-PC2 et un portable personnel (MAC ${ROGUE_MAC}).`) : t('SAL-PC2 is cabled directly to the wall socket. All tidy.', 'SAL-PC2 est câblé directement à la prise murale. Tout est propre.') }) },
    { id: 'remove-hub', dev: 'hub', label: t('Remove the personal switch and laptop, cable the PC directly', 'Retirer le switch et le portable personnels, câbler le PC en direct'),
      apply: (w) => {
        if (!w.flags.hub) return { out: t('Already done.', 'Déjà fait.') }
        const devices = w.topo.devices.filter((d) => d.id !== 'hub' && d.id !== 'tomlt')
        const links = [...w.topo.links.filter((l) => l.a.dev !== 'hub' && l.b.dev !== 'hub'), { id: 'Lfix', a: { dev: ID.SWSAL, iface: 'Fa0/2' }, b: { dev: ID.SAL2, iface: 'Fa0' }, cable: 'straight' as const }]
        return { world: { ...w, topo: { devices, links }, flags: { ...w.flags, hub: false } }, out: t('Mini switch and personal laptop removed. SAL-PC2 is now patched straight to the wall socket (Fa0/2). Port lights are still off: the port is err-disabled.', 'Mini switch et portable perso retirés. SAL-PC2 est branché directement à la prise (Fa0/2). Les voyants restent éteints : le port est en err-disabled.') }
      } },
  ],
  react: (w) => {
    const p = iface(w, ID.SWSAL, 'Fa0/2')
    if (w.flags.hub && p?.up && !p.err) {
      let out = setIf(w, ID.SWSAL, 'Fa0/2', { err: true }, true)
      out = log(out, { src: 'SW-SALES', level: 'crit', svc: 'PORT_SECURITY-2-PSECURE_VIOLATION', msg: `Security violation occurred, caused by MAC address ${ROGUE_MAC} on port FastEthernet0/2.` })
      out = log(out, { src: 'SW-SALES', level: 'error', svc: 'PM-4-ERR_DISABLE', msg: 'psecure-violation error detected on Fa0/2, putting Fa0/2 in err-disable state' })
      return { world: { ...out, flags: { ...out.flags, bouncedWithHub: true } }, msgs: [{ from: 'Tom Nguyen', role: t('Sales', 'Commercial'), text: t('It came back for two seconds and died again!', 'C’est revenu deux secondes et ça a recoupé !'), tone: 'angry' }] }
    }
  },
  pressure: [
    { after: 200, from: 'Tom Nguyen', role: t('Sales', 'Commercial'), text: t('I have a client call at 09:30 and need my files…', 'J’ai un appel client à 09h30 et j’ai besoin de mes fichiers…'), tone: 'normal' },
  ],
  thanks: { from: 'Tom Nguyen', role: t('Sales', 'Commercial'), text: t('Back online! Sorry about the switch, I didn’t know.', 'Je suis reconnecté ! Désolé pour le switch, je ne savais pas.') },
  hints: [
    t('Other Sales PCs work, so look at Tom’s own switch port. On SW-SALES: show interfaces status.', 'Les autres PC du Commercial marchent : regardez le port de Tom. Sur SW-SALES : show interfaces status.'),
    t('"err-disabled" means a protection feature shut the port. show logging tells you which one and why.', '« err-disabled » signifie qu’une protection a coupé le port. show logging dit laquelle et pourquoi.'),
    t('Port security saw a second MAC address. Find the extra device first — use the device actions on SAL-PC2 or ask Tom.', 'Port security a vu une deuxième adresse MAC. Trouvez d’abord l’appareil en trop — actions sur SAL-PC2 ou demandez à Tom.'),
    t('After removing it: interface fa0/2 → shutdown → no shutdown.', 'Après l’avoir retiré : interface fa0/2 → shutdown → no shutdown.'),
  ],
  report: {
    what: t(
      `Tom plugged a personal mini switch into his wall socket to connect his own laptop. Port security on Fa0/2 allows one MAC address; when the laptop (${ROGUE_MAC}) sent its first frame at 08:36 the switch treated it as a violation and put the port in err-disabled state, cutting Tom’s PC off too.`,
      `Tom a branché un mini switch personnel sur sa prise murale pour connecter son portable. Port security sur Fa0/2 n’autorise qu’une adresse MAC ; quand le portable (${ROGUE_MAC}) a émis sa première trame à 08h36, le switch y a vu une violation et a mis le port en err-disabled, coupant aussi le PC de Tom.`,
    ),
    cause: t('Port-security violation caused by an unauthorized personal switch + laptop → port err-disabled.', 'Violation port security causée par un switch + portable personnels non autorisés → port en err-disabled.'),
    optimal: [
      t('Other users fine → focus on Tom’s port. show interfaces status → Fa0/2 err-disabled.', 'Les autres vont bien → se concentrer sur le port de Tom. show interfaces status → Fa0/2 err-disabled.'),
      t('show logging / show port-security → violation by MAC 3c22.fb11.0a7e.', 'show logging / show port-security → violation par la MAC 3c22.fb11.0a7e.'),
      t('Find and remove the unauthorized device, explain the policy to the user.', 'Trouver et retirer l’appareil non autorisé, expliquer la règle à l’utilisateur.'),
      t('Recover the port: shutdown then no shutdown on Fa0/2. Verify.', 'Rétablir le port : shutdown puis no shutdown sur Fa0/2. Vérifier.'),
    ],
    lessons: [
      t('err-disabled is the switch protecting the network — fix the cause before re-enabling the port.', 'err-disabled, c’est le switch qui protège le réseau — corrigez la cause avant de réactiver le port.'),
      t('Rebooting the PC cannot fix a port the switch has shut.', 'Redémarrer le PC ne peut pas réparer un port coupé par le switch.'),
      t('Talking to the user is a legitimate diagnostic tool.', 'Parler à l’utilisateur est un vrai outil de diagnostic.'),
    ],
  },
}

/* ============================ 8. VLAN configured incorrectly ============================ */

export const wrongVlan: Scenario = {
  id: 'inc-wrong-vlan',
  number: 8,
  category: 'network',
  difficulty: 1,
  minutes: 7,
  xp: 150,
  skills: ['routing', 'networking'],
  title: t('A VLAN has been configured incorrectly', 'Un VLAN a été mal configuré'),
  role: IT_ROLE,
  company: COMPANY,
  start: '09:05',
  intro: t(
    'Léa started in Administration this morning. Her PC (ADM-PC3) was patched to SW-ADMIN yesterday by a colleague. She can’t reach anything — "No internet" everywhere. The other Admin PCs work.',
    'Léa a commencé à l’Administration ce matin. Son PC (ADM-PC3) a été brassé sur SW-ADMIN hier par un collègue. Elle n’accède à rien — « Pas d’internet » partout. Les autres PC Admin fonctionnent.',
  ),
  ticket: {
    id: 'REQ-1182', from: 'Léa Fontaine', dept: t('Administration', 'Administration'), priority: 'P3',
    subject: t('New PC — no network', 'Nouveau PC — pas de réseau'),
    body: t('Hi, I’m new! My PC says "No Internet access" and I can’t open the shared drive. My neighbour’s PC works.', 'Bonjour, je suis nouvelle ! Mon PC affiche « Pas d’accès Internet » et je n’ouvre pas le lecteur partagé. Le PC de ma voisine marche.'),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '09:05',
      before: (w) => setIf(w, ID.SWADM, 'Fa0/3', { vlan: 1 }),
      logs: [{ t: '17:12:40', src: 'SW-ADMIN', level: 'info', svc: 'SYS-5-CONFIG_I', msg: 'Configured from console by vty0 (10.10.99.50) — REQ-1182 patch new hire desk' }],
    }),
  checks: [
    { id: 'lease', label: t('ADM-PC3 has a valid address', 'ADM-PC3 a une adresse valide'), test: (w) => hasLease(w, ID.ADM3) },
    { id: 'smb', label: t('ADM-PC3 → file server', 'ADM-PC3 → serveur de fichiers'), test: (w) => smbOk(w, ID.ADM3) },
    { id: 'others', label: t('Other Admin PCs unaffected', 'Autres PC Admin non affectés'), test: (w) => smbOk(w, ID.ADM1) && smbOk(w, ID.ADM2) },
  ],
  rootCauses: [
    { id: 'vlan', label: t('Her switch port is in the wrong VLAN (VLAN 1 instead of 10)', 'Son port de switch est dans le mauvais VLAN (VLAN 1 au lieu de 10)') },
    { id: 'dhcp', label: t('The DHCP scope is full', 'L’étendue DHCP est pleine') },
    { id: 'account', label: t('Her user account isn’t enabled yet', 'Son compte utilisateur n’est pas encore activé') },
    { id: 'cable', label: t('The cable is plugged into the wrong port', 'Le câble est branché sur le mauvais port') },
  ],
  cause: 'vlan',
  evidence: [
    { id: 'ipconfig', label: t('Checked ADM-PC3’s IP configuration', 'Vérifié la configuration IP d’ADM-PC3'), test: onCmd(/^ipconfig/i, 'ADM-PC3') },
    { id: 'port', label: t('Checked the port’s VLAN on SW-ADMIN', 'Vérifié le VLAN du port sur SW-ADMIN'), test: any(onTag('show-vlan', 'SW-ADMIN'), onTag('show-int-status', 'SW-ADMIN'), onTag('show-run', 'SW-ADMIN')) },
    { id: 'compare', label: t('Compared with a working neighbour port / PC', 'Comparé avec un port / PC voisin qui marche'), test: any(onCmd(/^ipconfig/i, ['ADM-PC1', 'ADM-PC2']), onTag('show-vlan', 'SW-ADMIN')) },
    { id: 'save', label: t('Saved the configuration', 'Sauvegardé la configuration'), test: onTag('save-config', 'SW-ADMIN') },
  ],
  react: (w) => ({ world: autoRenew(w, [ID.ADM3]) }),
  pressure: [{ after: 240, from: 'Sarah Koné', role: t('Administration', 'Administration'), text: t('Léa has her onboarding training at 10:00 and needs her PC…', 'Léa a sa formation d’accueil à 10h00 et a besoin de son PC…'), tone: 'normal' }],
  thanks: { from: 'Léa Fontaine', role: t('Administration', 'Administration'), text: t('It works! Thank you, great first day 😊', 'Ça marche ! Merci, super premier jour 😊') },
  hints: [
    t('ipconfig on ADM-PC3 shows a 169.254.x.x address: the PC never got a DHCP answer.', 'ipconfig sur ADM-PC3 donne 169.254.x.x : le PC n’a jamais reçu de réponse DHCP.'),
    t('On SW-ADMIN, run show vlan brief. Which VLAN is Fa0/3 in compared with Fa0/1 and Fa0/2?', 'Sur SW-ADMIN, show vlan brief. Dans quel VLAN est Fa0/3 par rapport à Fa0/1 et Fa0/2 ?'),
    t('interface fa0/3 → switchport access vlan 10 → end → copy running-config startup-config.', 'interface fa0/3 → switchport access vlan 10 → end → copy running-config startup-config.'),
  ],
  report: {
    what: t('When Léa’s desk was patched yesterday, port Fa0/3 was left in the default VLAN 1. The Admin router interface and DHCP relay live in VLAN 10, so her PC was alone in an empty broadcast domain.', 'Lors du brassage d’hier, le port Fa0/3 est resté dans le VLAN 1 par défaut. L’interface du routeur Admin et le relais DHCP sont dans le VLAN 10 : son PC était seul dans un domaine de diffusion vide.'),
    cause: t('Access port Fa0/3 assigned to VLAN 1 instead of VLAN 10 (ADMIN).', 'Port d’accès Fa0/3 dans le VLAN 1 au lieu du VLAN 10 (ADMIN).'),
    optimal: [
      t('ipconfig → APIPA address.', 'ipconfig → adresse APIPA.'),
      t('show vlan brief on SW-ADMIN → Fa0/3 in VLAN 1, neighbours in VLAN 10.', 'show vlan brief sur SW-ADMIN → Fa0/3 dans le VLAN 1, les voisins dans le VLAN 10.'),
      t('switchport access vlan 10 on Fa0/3, save, verify the PC gets an address.', 'switchport access vlan 10 sur Fa0/3, sauvegarder, vérifier que le PC obtient une adresse.'),
    ],
    lessons: [
      t('A port in the wrong VLAN looks exactly like a dead cable to the user.', 'Un port dans le mauvais VLAN ressemble exactement à un câble mort pour l’utilisateur.'),
      t('Unused ports should be shut down or put in a "parking" VLAN, and new patches verified.', 'Les ports inutilisés doivent être coupés ou mis dans un VLAN « parking », et chaque brassage vérifié.'),
    ],
  },
}

