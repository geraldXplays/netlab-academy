import type { FwRule, OpsWorld, Scenario } from '@/ops/types'
import { t } from '@/content/lessons/types'
import { log, setSvc, running, diskUsed, diskFull, tcp, svc, GB, MB } from '@/ops/world'
import { ID, hq, IT_ROLE, COMPANY, DUTIES } from './hq'
import { onTag, onAct, any, webOk } from './helpers'

const SALES = t('Sales', 'Commercial')

/* ============================ 9. Server runs out of storage ============================ */

const APP_CONF = `# Meridian CRM — application settings
server.port = 443
db.url = jdbc:mysql://localhost:3306/crm
db.pool = 20

# TEMP: verbose logging for INC-4410 (12 Nov) — remember to revert!
log_level = DEBUG
log_file = /var/log/crm/debug.log
`
const DEBUG_TAIL = [
  '2026-11-23 03:12:44.120 DEBUG [pool-3] SqlTrace - SELECT * FROM customers WHERE id=88213',
  '2026-11-23 03:12:44.121 DEBUG [pool-3] SqlTrace - row mapped in 0.02ms',
  '2026-11-23 03:12:44.121 DEBUG [pool-1] HttpTrace - GET /api/health 200',
  '2026-11-23 03:12:44.122 DEBUG [pool-3] SqlTrace - SELECT * FROM orders WHERE customer_id=88213',
  '2026-11-23 03:12:44.129 ERROR [main] FileAppender - java.io.IOException: No space left on device',
].join('\n')

const debugOn = (w: OpsWorld) => /^\s*log_level\s*=\s*debug/im.test(w.files[ID.APP]?.['/etc/crm/app.conf']?.content ?? '')

export const diskFullScenario: Scenario = {
  id: 'inc-disk-full',
  number: 9,
  category: 'server',
  difficulty: 2,
  minutes: 12,
  xp: 225,
  skills: ['systems', 'infrastructure'],
  title: t('A server runs out of storage', 'Un serveur n’a plus d’espace disque'),
  role: IT_ROLE,
  company: COMPANY,
  start: '08:41',
  intro: t(
    'Monday, 08:41. The CRM used by Sales runs on APP01, an Ubuntu server with its MySQL database. Monitoring sent alerts overnight that nobody saw. Sales can’t open any customer file.',
    'Lundi, 08h41. Le CRM du Commercial tourne sur APP01, un serveur Ubuntu avec sa base MySQL. La supervision a envoyé des alertes cette nuit que personne n’a vues. Le Commercial n’ouvre plus aucune fiche client.',
  ),
  ticket: {
    id: 'INC-4509', from: 'Tom Nguyen', dept: SALES, priority: 'P1',
    subject: t('CRM is down', 'Le CRM est en panne'),
    body: t('https://crm.corp.local says "This site can’t be reached". We can’t log calls or see customer history.', 'https://crm.corp.local affiche « Ce site est inaccessible ». On ne peut plus saisir les appels ni voir l’historique client.'),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor', 'editor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '08:41',
      after: (w) => {
        const files: OpsWorld['files'][string] = {
          ...w.files[ID.APP],
          '/etc/crm/app.conf': { size: APP_CONF.length, content: APP_CONF },
          '/var/log/crm/app.log': { size: 120 * MB, content: '2026-11-23 03:12:44 ERROR Could not write to log: No space left on device' },
        }
        const used = Object.values(files).reduce((n, f) => n + f.size, 0)
        files['/var/log/crm/debug.log'] = { size: 40 * GB - used, content: DEBUG_TAIL }
        let out: OpsWorld = { ...w, files: { ...w.files, [ID.APP]: files } }
        out = setSvc(out, ID.APP, 'mysql', { state: 'failed' })
        out = setSvc(out, ID.APP, 'crm', { state: 'failed' })
        return out
      },
      logs: [
        { t: '02:58:10', src: 'APP01', level: 'warn', svc: 'monitoring', msg: 'Disk usage on / is 95% (threshold 90%)' },
        { t: '03:12:44', src: 'APP01', level: 'error', svc: 'mysql', msg: '[ERROR] [MY-012639] [InnoDB] Write to file ./ib_logfile0 failed at offset 1048576. Operating system error number 28: No space left on device' },
        { t: '03:12:45', src: 'APP01', level: 'error', svc: 'mysql', msg: 'mysql.service: Main process exited, code=killed, status=6/ABRT' },
        { t: '03:12:46', src: 'APP01', level: 'error', svc: 'crm', msg: 'java.io.IOException: No space left on device at FileAppender.write' },
        { t: '03:12:47', src: 'APP01', level: 'error', svc: 'crm', msg: 'crm.service: Failed with result \'exit-code\'.' },
        { t: '03:13:00', src: 'APP01', level: 'crit', svc: 'monitoring', msg: 'Disk usage on / is 100% — CRITICAL' },
      ],
    }),
  startCheck: (w, id, s) => {
    if (id !== ID.APP) return null
    if ((s === 'crm' || s === 'mysql') && diskFull(w, id)) return 'No space left on device'
    if (s === 'crm' && !running(w, id, 'mysql')) return "Communications link failure: Connection refused to localhost:3306 (is MySQL running?)"
    return null
  },
  checks: [
    { id: 'disk', label: t('APP01 disk usage below 85 %', 'Disque d’APP01 sous 85 %'), test: (w) => diskUsed(w, ID.APP) < w.disk[ID.APP] * 0.85 },
    { id: 'db', label: t('MySQL running', 'MySQL actif'), test: (w) => running(w, ID.APP, 'mysql') },
    { id: 'crm', label: t('CRM reachable from Sales (https)', 'CRM joignable depuis le Commercial (https)'), test: (w) => webOk(w, ID.SAL1, 'crm', 443) },
    { id: 'debug', label: t('Log volume back to normal (no DEBUG logging)', 'Volume de logs normal (plus de logs DEBUG)'), test: (w) => !debugOn(w) },
  ],
  rootCauses: [
    { id: 'db-growth', label: t('The customer database grew too large', 'La base clients est devenue trop grosse') },
    { id: 'debug-log', label: t('Temporary DEBUG logging was never turned off and filled the disk', 'Des logs DEBUG temporaires jamais désactivés ont rempli le disque') },
    { id: 'attack', label: t('An attacker uploaded files to the server', 'Un attaquant a déposé des fichiers sur le serveur') },
    { id: 'crash', label: t('The CRM application has a bug and crashed', 'Le CRM a un bug et a planté') },
    { id: 'backup', label: t('Backups are stored on the same disk', 'Les sauvegardes sont stockées sur le même disque') },
  ],
  cause: 'debug-log',
  evidence: [
    { id: 'status', label: t('Checked why the services failed (status / journal)', 'Vérifié pourquoi les services ont échoué (status / journal)'), test: any(onTag('svc-status:'), onTag('journal'), onAct('view-logs')) },
    { id: 'df', label: t('Checked free space (df -h)', 'Vérifié l’espace libre (df -h)'), test: onTag('df') },
    { id: 'du', label: t('Found what fills the disk (du / find)', 'Trouvé ce qui remplit le disque (du / find)'), test: any(onTag('du:'), onTag('find'), onTag('ls:')) },
    { id: 'conf', label: t('Found the DEBUG setting in the app config', 'Trouvé le réglage DEBUG dans la config de l’appli'), test: any(onTag('read:/etc/crm/app.conf'), onTag('edit:/etc/crm/app.conf')) },
  ],
  hazards: [
    { id: 'audit', label: t('Deleted the security audit log (auth.log)', 'Supprimé le journal d’audit de sécurité (auth.log)'), penalty: 6, test: (e) => !!e.tags?.some((x) => x === 'rm:/var/log/auth.log') },
  ],
  react: (w) => {
    // While DEBUG stays on, the CRM writes ~2.5 GB of log per action: the disk fills up again.
    if (!debugOn(w) || !running(w, ID.APP, 'crm')) return
    const f = w.files[ID.APP]['/var/log/crm/debug.log'] ?? { size: 0, content: '' }
    let out: OpsWorld = { ...w, files: { ...w.files, [ID.APP]: { ...w.files[ID.APP], '/var/log/crm/debug.log': { ...f, size: f.size + 2.5 * GB } } } }
    if (diskFull(out, ID.APP) || diskUsed(out, ID.APP) > out.disk[ID.APP]) {
      const files = { ...out.files[ID.APP] }
      const used = diskUsed(out, ID.APP) - files['/var/log/crm/debug.log'].size
      files['/var/log/crm/debug.log'] = { ...files['/var/log/crm/debug.log'], size: out.disk[ID.APP] - used }
      out = { ...out, files: { ...out.files, [ID.APP]: files } }
      out = setSvc(setSvc(out, ID.APP, 'mysql', { state: 'failed' }), ID.APP, 'crm', { state: 'failed' })
      out = log(out, { src: 'APP01', level: 'error', svc: 'mysql', msg: 'Operating system error number 28: No space left on device' })
      out = log(out, { src: 'APP01', level: 'crit', svc: 'monitoring', msg: 'Disk usage on / is 100% — CRITICAL' })
      return { world: out, msgs: [{ from: 'Tom Nguyen', role: SALES, text: t('The CRM worked for a bit and now it’s down AGAIN.', 'Le CRM a marché un moment et maintenant il est DE NOUVEAU en panne.'), tone: 'angry' }] }
    }
    return { world: out }
  },
  pressure: [
    { after: 200, from: 'Tom Nguyen', role: SALES, text: t('Customers are calling and we can’t see their orders…', 'Des clients appellent et on ne voit pas leurs commandes…') },
    { after: 480, from: 'Head of Sales', role: SALES, text: t('This is costing us sales. Status update please.', 'Ça nous coûte des ventes. Un point de situation svp.') },
  ],
  thanks: { from: 'Tom Nguyen', role: SALES, text: t('CRM is back and fast. Thanks a lot!', 'Le CRM est revenu et il est rapide. Merci beaucoup !') },
  hints: [
    t('SSH to APP01: systemctl status crm and systemctl status mysql. What do the last log lines say?', 'Connectez-vous à APP01 : systemctl status crm et systemctl status mysql. Que disent les dernières lignes ?'),
    t('df -h, then sudo du -sh /var/* and /var/log/* to find what is so big.', 'df -h, puis sudo du -sh /var/* et /var/log/* pour trouver ce qui est si gros.'),
    t('Free the space safely: sudo truncate -s 0 /var/log/crm/debug.log (never delete database files). Then check /etc/crm/app.conf.', 'Libérez l’espace sans risque : sudo truncate -s 0 /var/log/crm/debug.log (ne supprimez jamais les fichiers de base). Puis regardez /etc/crm/app.conf.'),
    t('sudo nano /etc/crm/app.conf → log_level = INFO, save. Then sudo systemctl start mysql, then sudo systemctl start crm.', 'sudo nano /etc/crm/app.conf → log_level = INFO, enregistrez. Puis sudo systemctl start mysql, puis sudo systemctl start crm.'),
  ],
  report: {
    what: t(
      'On 12 Nov, DEBUG logging was enabled on the CRM to investigate INC-4410 and never reverted. For 11 days the application wrote every SQL query to /var/log/crm/debug.log, which grew to ~25 GB. At 03:12 the root filesystem reached 100 %: MySQL could not write its redo log and aborted, and the CRM crashed behind it.',
      'Le 12 nov., les logs DEBUG ont été activés sur le CRM pour l’incident INC-4410 et jamais désactivés. Pendant 11 jours, l’appli a écrit chaque requête SQL dans /var/log/crm/debug.log, qui a atteint ~25 Go. À 03h12, le système de fichiers racine a atteint 100 % : MySQL n’a plus pu écrire son journal et s’est arrêté, entraînant le CRM.',
    ),
    cause: t('A forgotten DEBUG log level filled the disk; MySQL and the CRM failed with "No space left on device".', 'Un niveau de log DEBUG oublié a rempli le disque ; MySQL et le CRM ont échoué avec « No space left on device ».'),
    optimal: [
      t('systemctl status / journalctl → "No space left on device".', 'systemctl status / journalctl → « No space left on device ».'),
      t('df -h → 100 %; du -sh /var/log/* → crm/debug.log is huge.', 'df -h → 100 % ; du -sh /var/log/* → crm/debug.log est énorme.'),
      t('Truncate (not delete) the log, set log_level back to INFO.', 'Vider (pas supprimer) le log, remettre log_level à INFO.'),
      t('Start MySQL first, then the CRM (it depends on the database). Verify from a Sales PC.', 'Démarrer MySQL d’abord, puis le CRM (il dépend de la base). Vérifier depuis un PC Commercial.'),
      t('Follow-up: logrotate for /var/log/crm, alerting that pages someone, revert temporary changes.', 'Suivi : logrotate pour /var/log/crm, alertes qui préviennent quelqu’un, annuler les changements temporaires.'),
    ],
    lessons: [
      t('Freeing space is the fix for the symptom; the log level is the root cause — otherwise the disk fills again.', 'Libérer de l’espace corrige le symptôme ; le niveau de log est la cause — sinon le disque se remplit à nouveau.'),
      t('Truncating a log in use is safer than deleting it (a deleted open file keeps using space).', 'Vider un log ouvert est plus sûr que le supprimer (un fichier ouvert supprimé occupe toujours l’espace).'),
      t('Never delete database files to make space.', 'Ne supprimez jamais de fichiers de base de données pour faire de la place.'),
      t('Start services in dependency order.', 'Démarrez les services dans l’ordre de leurs dépendances.'),
    ],
  },
}

/* ============================ 10. Firewall blocks an important service ============================ */

const RULES: FwRule[] = [
  { id: 'r1', name: 'CHG-2304-Block-Legacy-HTTP', src: 'any', dst: '172.16.50.0/24', port: 'any', action: 'deny', enabled: true },
  { id: 'r2', name: 'Allow-Shop-HTTPS', src: 'any', dst: '172.16.50.10', port: 443, action: 'allow', enabled: true },
  { id: 'r3', name: 'Allow-IT-SSH-to-DMZ', src: '10.10.99.0/24', dst: '172.16.50.10', port: 22, action: 'allow', enabled: true },
  { id: 'r4', name: 'Allow-LAN-to-Internet', src: '10.10.0.0/16', dst: 'any', port: 'any', action: 'allow', enabled: true },
]

const SHOP = '172.16.50.10'

export const firewallBlock: Scenario = {
  id: 'inc-firewall-block',
  number: 10,
  category: 'security',
  difficulty: 3,
  minutes: 12,
  xp: 275,
  skills: ['security', 'infrastructure'],
  title: t('A firewall blocks an important service', 'Un pare-feu bloque un service important'),
  role: t('Network & security technician', 'Technicien réseau & sécurité'),
  company: COMPANY,
  start: '07:35',
  intro: t(
    'Tuesday, 07:35. The online shop (SHOP01, in the DMZ behind FW-EDGE) has been unreachable since about 23:10 last night. A firewall change, CHG-2304, was applied at 23:08 to "block legacy HTTP (port 80) to the DMZ". The external uptime probe is red.',
    'Mardi, 07h35. La boutique en ligne (SHOP01, en DMZ derrière FW-EDGE) est injoignable depuis environ 23h10 hier soir. Un changement pare-feu, CHG-2304, a été appliqué à 23h08 pour « bloquer le HTTP historique (port 80) vers la DMZ ». La sonde de disponibilité externe est rouge.',
  ),
  ticket: {
    id: 'INC-4544', from: 'Nadia Roche', dept: t('E-commerce', 'E-commerce'), priority: 'P1',
    subject: t('Online shop is DOWN', 'La boutique en ligne est EN PANNE'),
    body: t('Customers get "connection timed out" on meridian-shop.com since last night. Zero orders since 23:10. Our biggest promotion starts at 09:00!', 'Les clients ont « délai de connexion dépassé » sur meridian-shop.com depuis hier soir. Zéro commande depuis 23h10. Notre plus grosse promo commence à 09h00 !'),
  },
  duties: [...DUTIES.slice(0, 2), t('Keep the attack surface minimal — never open more than needed', 'Garder la surface d’attaque minimale — ne jamais ouvrir plus que nécessaire'), DUTIES[3]],
  tools: ['map', 'terminal', 'logs', 'monitor', 'firewall'],
  nms: ID.PROBE,
  build: () =>
    hq({
      start: '07:35',
      spec: (s) => s.map((d) => (d.id === ID.SHOP ? { ...d, svcs: [...(d.svcs ?? []), svc('http-legacy', 'Legacy HTTP listener (redirects to https)', 80)] } : d)),
      after: (w) => ({ ...w, fw: { dev: ID.FW, rules: structuredClone(RULES) } }),
      logs: [
        { t: '23:08:02', src: 'FW-EDGE', level: 'info', svc: 'SYS-5-CONFIG_I', msg: 'Configured from console by netops.jdoe — CHG-2304 "block legacy HTTP (80) to DMZ"' },
        { t: '23:10:15', src: 'FW-EDGE', level: 'warn', svc: 'ASA-4-106023', msg: `Deny tcp src outside:198.51.100.10/51544 dst dmz:${SHOP}/443 by access-group OUTSIDE_IN [CHG-2304-Block-Legacy-HTTP]` },
        { t: '23:10:22', src: 'UPTIME-PROBE', level: 'crit', svc: 'probe', msg: 'https://meridian-shop.com DOWN — connection timed out after 30 s' },
        { t: '02:41:09', src: 'FW-EDGE', level: 'warn', svc: 'ASA-4-106023', msg: `Deny tcp src outside:81.12.4.200/40112 dst dmz:${SHOP}/443 by access-group OUTSIDE_IN [CHG-2304-Block-Legacy-HTTP]` },
        { t: '07:31:44', src: 'FW-EDGE', level: 'warn', svc: 'ASA-4-106023', msg: `Deny tcp src outside:92.184.7.13/61201 dst dmz:${SHOP}/443 by access-group OUTSIDE_IN [CHG-2304-Block-Legacy-HTTP]` },
        { t: '07:30:01', src: 'SHOP01', level: 'info', svc: 'nginx', msg: 'no requests received since 23:09:58' },
      ],
    }),
  checks: [
    { id: 'https', label: t('Shop reachable from the Internet (HTTPS 443)', 'Boutique joignable depuis Internet (HTTPS 443)'), test: (w) => tcp(w, ID.PROBE, SHOP, 443) === 'ok' },
    { id: 'http', label: t('Legacy HTTP (80) still blocked, as CHG-2304 intended', 'HTTP historique (80) toujours bloqué, comme voulu par CHG-2304'), test: (w) => tcp(w, ID.PROBE, SHOP, 80) !== 'ok' },
    { id: 'ssh', label: t('SSH (22) not exposed to the Internet', 'SSH (22) non exposé à Internet'), test: (w) => tcp(w, ID.PROBE, SHOP, 22) !== 'ok' },
    { id: 'db', label: t('Database (3306) not exposed to the Internet', 'Base de données (3306) non exposée à Internet'), test: (w) => tcp(w, ID.PROBE, SHOP, 3306) !== 'ok' },
  ],
  rootCauses: [
    { id: 'nginx', label: t('The web server on SHOP01 crashed', 'Le serveur web de SHOP01 a planté') },
    { id: 'rule', label: t('The new deny rule matches every port, not just 80, and sits above the HTTPS allow rule', 'La nouvelle règle de refus vise tous les ports, pas seulement le 80, et se trouve au-dessus de la règle d’autorisation HTTPS') },
    { id: 'cert', label: t('The TLS certificate expired', 'Le certificat TLS a expiré') },
    { id: 'ddos', label: t('A DDoS attack is saturating the link', 'Une attaque DDoS sature le lien') },
    { id: 'dns', label: t('The shop’s public DNS record is wrong', 'L’enregistrement DNS public de la boutique est faux') },
  ],
  cause: 'rule',
  evidence: [
    { id: 'reproduce', label: t('Reproduced from outside (probe: curl / port test)', 'Reproduit depuis l’extérieur (sonde : curl / test de port)'), test: any(onTag('curl', 'UPTIME-PROBE'), onTag('tnc:', 'UPTIME-PROBE'), onTag('ping', 'UPTIME-PROBE')) },
    { id: 'server', label: t('Checked the server itself is healthy (service listening)', 'Vérifié que le serveur lui-même va bien (service à l’écoute)'), test: any(onTag('svc-status:nginx', 'SHOP01'), onTag('ss', 'SHOP01'), onTag('svc-list', 'SHOP01')) },
    { id: 'logs', label: t('Found the deny hits in the firewall logs', 'Trouvé les refus dans les journaux du pare-feu'), test: any(onTag('show-logging', 'FW-EDGE'), onAct('view-logs')) },
    { id: 'policy', label: t('Reviewed the firewall rule order', 'Revu l’ordre des règles du pare-feu'), test: any(onAct('fw-view'), onTag('fw-view')) },
  ],
  hazards: [
    { id: 'any-any', label: t('Created an "allow any → any" rule — the whole DMZ was exposed', 'Créé une règle « tout autoriser » — toute la DMZ était exposée'), penalty: 20, test: (_e, _b, a) => !!a.fw?.rules.some((r) => r.enabled && r.action === 'allow' && r.src === 'any' && r.port === 'any' && (r.dst === 'any' || r.dst === '172.16.50.0/24' || r.dst === SHOP)) },
    { id: 'nginx-restart', label: t('Restarted the healthy web server', 'Redémarré le serveur web qui allait bien'), penalty: 2, test: (e) => !!e.tags?.some((x) => x.startsWith('svc-restart:nginx')) },
  ],
  pressure: [
    { after: 180, from: 'Nadia Roche', role: t('E-commerce', 'E-commerce'), text: t('Promotion emails go out at 08:45 to 40,000 customers. Please tell me it will work!', 'Les mails promo partent à 08h45 vers 40 000 clients. Dites-moi que ça va marcher !') },
    { after: 420, from: 'CEO', role: t('Management', 'Direction'), text: t('Why is the shop still down? I want a status every 10 minutes.', 'Pourquoi la boutique est-elle toujours en panne ? Je veux un point toutes les 10 minutes.') },
  ],
  thanks: { from: 'Nadia Roche', role: t('E-commerce', 'E-commerce'), text: t('Orders are coming in again!! 🎉', 'Les commandes rentrent de nouveau !! 🎉') },
  hints: [
    t('First prove the server is fine: on SHOP01, systemctl status nginx / ss -tlnp. Then test from UPTIME-PROBE: curl https://meridian-shop.com', 'Prouvez d’abord que le serveur va bien : sur SHOP01, systemctl status nginx / ss -tlnp. Puis testez depuis UPTIME-PROBE : curl https://meridian-shop.com'),
    t('Server healthy + timeout from outside → something in between drops it. Read FW-EDGE’s logs (show logging).', 'Serveur sain + timeout depuis l’extérieur → quelque chose entre les deux bloque. Lisez les journaux de FW-EDGE (show logging).'),
    t('Firewalls stop at the first matching rule. Open the Firewall tool and look at rule 1’s port.', 'Un pare-feu s’arrête à la première règle qui correspond. Ouvrez l’outil Pare-feu et regardez le port de la règle 1.'),
    t('Edit rule 1 to port 80 only (or move the HTTPS allow above it). Do NOT open "any".', 'Modifiez la règle 1 pour le port 80 seulement (ou placez l’autorisation HTTPS au-dessus). N’ouvrez PAS « any ».'),
  ],
  report: {
    what: t(
      'CHG-2304 was meant to block legacy HTTP (port 80) to the DMZ. The rule was created with port "any" and inserted at the top of the policy. Because a firewall applies the first matching rule, every connection to the DMZ — including HTTPS 443 to the shop — was denied before reaching "Allow-Shop-HTTPS". The server itself never failed.',
      'CHG-2304 devait bloquer le HTTP historique (port 80) vers la DMZ. La règle a été créée avec le port « any » et insérée en tête de politique. Comme un pare-feu applique la première règle qui correspond, toute connexion vers la DMZ — y compris HTTPS 443 vers la boutique — était refusée avant d’atteindre « Allow-Shop-HTTPS ». Le serveur, lui, n’a jamais été en panne.',
    ),
    cause: t('An over-broad deny rule (port any instead of 80) placed above the HTTPS allow rule.', 'Une règle de refus trop large (port any au lieu de 80) placée au-dessus de l’autorisation HTTPS.'),
    optimal: [
      t('Server side: nginx running and listening on 443.', 'Côté serveur : nginx actif et à l’écoute sur 443.'),
      t('From the Internet probe: HTTPS times out → filtered on the path.', 'Depuis la sonde Internet : HTTPS expire → filtré sur le chemin.'),
      t('FW logs: Deny …/443 by CHG-2304-Block-Legacy-HTTP.', 'Journaux FW : Deny …/443 par CHG-2304-Block-Legacy-HTTP.'),
      t('Narrow the rule to port 80 (least privilege). Verify 443 open, 80/22/3306 still closed.', 'Restreindre la règle au port 80 (moindre privilège). Vérifier 443 ouvert, 80/22/3306 toujours fermés.'),
    ],
    lessons: [
      t('Rule order matters: first match wins.', 'L’ordre des règles compte : la première correspondance l’emporte.'),
      t('"Connection timed out" usually means filtered; "connection refused" means the server answered with no service.', '« Délai dépassé » signifie souvent filtré ; « connexion refusée » signifie que le serveur a répondu sans service.'),
      t('Fix the precise mistake. Never "allow any any" to make a problem disappear.', 'Corrigez l’erreur précise. Jamais de « allow any any » pour faire disparaître un problème.'),
      t('Every change needs a post-change test (here: is the shop still up?).', 'Chaque changement exige un test après coup (ici : la boutique répond-elle encore ?).'),
    ],
  },
}

/* ============================ 13. A Linux service suddenly stops ============================ */

const NGINX_CONF = `server {
    listen 80;
    server_name intranet.corp.local intranet;

    # moved to new web root (A.B. 23/11)
    root /var/www/intranet
    index index.html;

    access_log /var/log/nginx/intranet.access.log;

    location / {
        try_files $uri $uri/ =404;
    }

    location /api/ {
        proxy_pass http://10.10.99.40:8080;
    }
}
`
const CONF_PATH = '/etc/nginx/sites-enabled/intranet.conf'

/** A tiny nginx config checker: every directive must end with ";" and braces must balance. */
export function nginxCheck(content: string | undefined): string | null {
  if (content === undefined) return null
  const lines = content.split('\n')
  let depth = 0
  for (let k = 0; k < lines.length; k++) {
    const l = lines[k].replace(/#.*$/, '').trim()
    if (!l) continue
    if (l.endsWith('{')) {
      depth++
      continue
    }
    if (l === '}') {
      depth--
      if (depth < 0) return `unexpected "}" in ${CONF_PATH}:${k + 1}`
      continue
    }
    if (!l.endsWith(';')) {
      // nginx glues the next line onto this directive
      let n = k + 1
      while (n < lines.length && !lines[n].trim()) n++
      return `invalid number of arguments in "${l.split(/\s+/)[0]}" directive in ${CONF_PATH}:${n + 1}`
    }
  }
  return depth !== 0 ? `unexpected end of file, expecting "}" in ${CONF_PATH}:${lines.length}` : null
}

export const linuxService: Scenario = {
  id: 'inc-linux-service',
  number: 13,
  category: 'server',
  difficulty: 2,
  minutes: 10,
  xp: 200,
  skills: ['systems', 'infrastructure'],
  title: t('A Linux service suddenly stops', 'Un service Linux s’arrête soudainement'),
  role: t('Systems administrator', 'Administrateur systèmes'),
  company: COMPANY,
  start: '08:20',
  intro: t(
    'Monday, 08:20. The company intranet (http://intranet, served by nginx on WEB01) is down. A colleague, Alex, changed something on the web server this morning before leaving for a training day — unreachable by phone.',
    'Lundi, 08h20. L’intranet (http://intranet, servi par nginx sur WEB01) est en panne. Un collègue, Alex, a modifié quelque chose sur le serveur web ce matin avant de partir en formation — injoignable.',
  ),
  ticket: {
    id: 'INC-4505', from: 'Julien Dubois', dept: t('Administration', 'Administration'), priority: 'P2',
    subject: t('Intranet not loading', 'L’intranet ne charge plus'),
    body: t('http://intranet says "This site can’t be reached — intranet refused to connect." I need the leave-request forms.', 'http://intranet affiche « Ce site est inaccessible — intranet n’autorise pas la connexion. » J’ai besoin des formulaires de congés.'),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor', 'editor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '08:20',
      after: (w) => {
        let out: OpsWorld = { ...w, files: { ...w.files, [ID.WEB]: { ...w.files[ID.WEB], [CONF_PATH]: { size: NGINX_CONF.length, content: NGINX_CONF }, '/home/admin/.bash_history': { size: 200, content: 'cd /var/www\nsudo mkdir -p /var/www/intranet\nsudo nano /etc/nginx/sites-enabled/intranet.conf\nsudo systemctl restart nginx\nexit' } } } }
        out = setSvc(out, ID.WEB, 'nginx', { state: 'failed' })
        return out
      },
      logs: [
        { t: '07:54:31', src: 'WEB01', level: 'info', svc: 'sshd', msg: 'Accepted publickey for alex.b from 10.10.99.50 port 50122' },
        { t: '07:56:10', src: 'WEB01', level: 'info', svc: 'systemd', msg: 'Stopping nginx.service - A high performance web server…' },
        { t: '07:56:10', src: 'WEB01', level: 'error', svc: 'nginx', msg: `nginx: [emerg] invalid number of arguments in "root" directive in ${CONF_PATH}:7` },
        { t: '07:56:10', src: 'WEB01', level: 'error', svc: 'nginx', msg: "nginx.service: Control process exited, code=exited, status=1/FAILURE" },
        { t: '07:56:10', src: 'WEB01', level: 'error', svc: 'nginx', msg: "nginx.service: Failed with result 'exit-code'." },
        { t: '07:56:44', src: 'WEB01', level: 'info', svc: 'sshd', msg: 'Disconnected from user alex.b 10.10.99.50' },
      ],
    }),
  startCheck: (w, id, s) => (id === ID.WEB && s === 'nginx' ? nginxCheck(w.files[ID.WEB]?.[CONF_PATH]?.content) : null),
  checks: [
    { id: 'svc', label: t('nginx running on WEB01', 'nginx actif sur WEB01'), test: (w) => running(w, ID.WEB, 'nginx') },
    { id: 'conf', label: t('Configuration test passes (nginx -t)', 'Le test de configuration passe (nginx -t)'), test: (w) => !!w.files[ID.WEB]?.[CONF_PATH] && !nginxCheck(w.files[ID.WEB][CONF_PATH].content) },
    { id: 'site', label: t('http://intranet loads for users', 'http://intranet s’affiche pour les utilisateurs'), test: (w) => webOk(w, ID.ADM1, 'intranet', 80) && !!w.files[ID.WEB]?.[CONF_PATH] },
  ],
  rootCauses: [
    { id: 'syntax', label: t('A syntax error (missing ";") in the nginx site configuration', 'Une erreur de syntaxe (« ; » manquant) dans la configuration du site nginx') },
    { id: 'port', label: t('Another program took port 80', 'Un autre programme a pris le port 80') },
    { id: 'disk', label: t('The server’s disk is full', 'Le disque du serveur est plein') },
    { id: 'dns', label: t('The intranet DNS record was deleted', 'L’enregistrement DNS de l’intranet a été supprimé') },
    { id: 'perm', label: t('Wrong permissions on /var/www', 'Mauvaises permissions sur /var/www') },
  ],
  cause: 'syntax',
  evidence: [
    { id: 'status', label: t('systemctl status nginx', 'systemctl status nginx'), test: onTag('svc-status:nginx', 'WEB01') },
    { id: 'journal', label: t('Read the service logs (journalctl / syslog)', 'Lu les journaux du service (journalctl / syslog)'), test: any(onTag('journal', 'WEB01'), onTag('read:/var/log/syslog', 'WEB01'), onAct('view-logs')) },
    { id: 'test', label: t('Tested the configuration with nginx -t', 'Testé la configuration avec nginx -t'), test: onTag('config-test:nginx', 'WEB01') },
    { id: 'what', label: t('Found what Alex changed (history / config file)', 'Trouvé ce qu’Alex a changé (historique / fichier de config)'), test: any(onTag(`read:${CONF_PATH}`), onTag(`edit:${CONF_PATH}`), onTag('read:/home/admin/.bash_history')) },
  ],
  hazards: [
    { id: 'rm-conf', label: t('Deleted the site configuration instead of fixing it', 'Supprimé la configuration du site au lieu de la corriger'), penalty: 8, test: (e) => !!e.tags?.includes(`rm:${CONF_PATH}`) },
  ],
  pressure: [{ after: 240, from: 'Julien Dubois', role: t('Administration', 'Administration'), text: t('Still no intranet. HR forms are due today…', 'Toujours pas d’intranet. Les formulaires RH sont à rendre aujourd’hui…'), tone: 'normal' }],
  thanks: { from: 'Julien Dubois', role: t('Administration', 'Administration'), text: t('The intranet is back. Thanks!', 'L’intranet est revenu. Merci !') },
  hints: [
    t('On WEB01: systemctl status nginx — then journalctl -u nginx.', 'Sur WEB01 : systemctl status nginx — puis journalctl -u nginx.'),
    t('Run sudo nginx -t: it tells you the exact file and line.', 'Lancez sudo nginx -t : il donne le fichier et la ligne exacts.'),
    t(`sudo nano ${CONF_PATH} — look at the line just before the one reported. Every directive must end with ";".`, `sudo nano ${CONF_PATH} — regardez la ligne juste avant celle signalée. Chaque directive doit finir par « ; ».`),
    t('After saving: sudo nginx -t, then sudo systemctl restart nginx.', 'Après enregistrement : sudo nginx -t, puis sudo systemctl restart nginx.'),
  ],
  report: {
    what: t('Alex moved the intranet to a new web root and edited the site configuration, but forgot the ";" at the end of the root directive. nginx joins it with the next line, so "root" received too many arguments. The restart at 07:56 failed and nginx stayed down.', 'Alex a déplacé l’intranet vers une nouvelle racine web et modifié la configuration du site, mais a oublié le « ; » à la fin de la directive root. nginx la colle à la ligne suivante : « root » a reçu trop d’arguments. Le redémarrage de 07h56 a échoué et nginx est resté arrêté.'),
    cause: t('Missing semicolon after the "root" directive in intranet.conf → nginx refused to start.', 'Point-virgule manquant après la directive « root » dans intranet.conf → nginx a refusé de démarrer.'),
    optimal: [
      t('systemctl status nginx → failed; journalctl → [emerg] … line 7.', 'systemctl status nginx → failed ; journalctl → [emerg] … ligne 7.'),
      t('nginx -t confirms; open the file, add ";" after root /var/www/intranet.', 'nginx -t confirme ; ouvrir le fichier, ajouter « ; » après root /var/www/intranet.'),
      t('nginx -t again → ok, then systemctl restart nginx, verify from a PC.', 'nginx -t de nouveau → ok, puis systemctl restart nginx, vérifier depuis un PC.'),
    ],
    lessons: [
      t('Always run nginx -t (or the service’s config test) before restarting.', 'Lancez toujours nginx -t (ou le test de config du service) avant un redémarrage.'),
      t('The reported line is where the parser gave up — the mistake is often just above.', 'La ligne signalée est là où l’analyseur abandonne — l’erreur est souvent juste au-dessus.'),
      t('Use "reload" rather than "restart": a reload with a bad config keeps the old one running.', 'Préférez « reload » à « restart » : un reload avec une mauvaise config garde l’ancienne en service.'),
    ],
  },
}

