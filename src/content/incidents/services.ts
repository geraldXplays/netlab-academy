import type { Scenario } from '@/ops/types'
import { t } from '@/content/lessons/types'
import { log, setSvc, running } from '@/ops/world'
import { ID, hq, hasLease, autoRenew, IT_ROLE, COMPANY, DUTIES } from './hq'
import { onCmd, onTag, onAct, any, smbOk, internetOk, webOk } from './helpers'

const SALES_PCS = ['SAL-PC1', 'SAL-PC2', 'SAL-PC3', 'SAL-LAPTOP']
const ALL_PCS = ['ADM-PC1', 'ADM-PC2', 'ADM-PC3', ...SALES_PCS, 'IT-PC']
const SALES = t('Sales', 'Commercial')

/* ============================ 3. Shared folders unavailable ============================ */

export const sharesDown: Scenario = {
  id: 'inc-sales-shares',
  number: 3,
  category: 'network',
  difficulty: 2,
  minutes: 12,
  xp: 200,
  skills: ['networking', 'systems'],
  title: t('One department cannot access shared folders', 'Un service n’accède plus aux dossiers partagés'),
  role: IT_ROLE,
  company: COMPANY,
  start: '08:58',
  intro: t(
    'Monday, 08:58. Sales cannot open their S: drive on \\\\fs01. Administration uses the same file server without any problem. Last Friday the IT team decommissioned an old domain controller, DC02.',
    'Lundi, 08h58. Le Commercial n’ouvre plus son lecteur S: sur \\\\fs01. L’Administration utilise le même serveur de fichiers sans souci. Vendredi dernier, l’équipe IT a décommissionné un ancien contrôleur de domaine, DC02.',
  ),
  ticket: {
    id: 'INC-4530', from: 'Marie Martin', dept: SALES, priority: 'P2',
    subject: t('S: drive unavailable for all of Sales', 'Lecteur S: indisponible pour tout le Commercial'),
    body: t('"\\\\fs01\\Sales is not accessible. The network path was not found." Same for all of us in Sales. Some websites are also really slow or don’t open.', '« \\\\fs01\\Sales n’est pas accessible. Le chemin réseau n’a pas été trouvé. » Pareil pour tout le Commercial. Certains sites sont aussi très lents ou ne s’ouvrent pas.'),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '08:58',
      sales: { range: ['10.10.20.100', '10.10.20.150'], dns: '10.10.99.11' },
      logs: [
        { t: '17:41:03', src: 'DC01', level: 'warn', id: 4743, msg: 'A computer account was deleted. Account: DC02$ (CHG-2287 decommission DC02 — 10.10.99.11)' },
        { t: '17:44:12', src: 'DC01', level: 'info', id: 1001, svc: 'dhcp', msg: 'Scope 10.10.10.0 (Admin): option 6 DNS Servers changed to 10.10.99.10 by abenali' },
      ],
    }),
  checks: [
    { id: 'sal1', label: t('SAL-PC1 → \\\\fs01\\Sales', 'SAL-PC1 → \\\\fs01\\Sales'), test: (w) => smbOk(w, ID.SAL1) },
    { id: 'sal2', label: t('SAL-PC2 → \\\\fs01\\Sales', 'SAL-PC2 → \\\\fs01\\Sales'), test: (w) => smbOk(w, ID.SAL2) },
    { id: 'sal3', label: t('SAL-PC3 → \\\\fs01\\Sales', 'SAL-PC3 → \\\\fs01\\Sales'), test: (w) => smbOk(w, ID.SAL3) },
    { id: 'scope', label: t('Sales DHCP scope hands out a working DNS server', 'L’étendue DHCP Commercial fournit un DNS fonctionnel'), test: (w) => w.dhcp?.scopes.find((s) => s.id === '10.10.20.0')?.dns === '10.10.99.10' },
  ],
  rootCauses: [
    { id: 'fs', label: t('The file server’s sharing service crashed', 'Le service de partage du serveur de fichiers a planté') },
    { id: 'perm', label: t('Sales lost their permissions on the share', 'Le Commercial a perdu ses droits sur le partage') },
    { id: 'dhcp-dns', label: t('The Sales DHCP scope still gives out the old DNS server (DC02)', 'L’étendue DHCP Commercial distribue encore l’ancien DNS (DC02)') },
    { id: 'route', label: t('The router lost the route to the server VLAN', 'Le routeur a perdu la route vers le VLAN serveurs') },
    { id: 'smb1', label: t('An update disabled SMB on the Sales PCs', 'Une mise à jour a désactivé SMB sur les PC Commercial') },
  ],
  cause: 'dhcp-dns',
  evidence: [
    { id: 'by-ip', label: t('Tested the server by IP address (works) vs by name (fails)', 'Testé le serveur par IP (ça marche) vs par nom (échec)'), test: onCmd(/^(ping|net use|dir|tnc|test-netconnection|curl).*10\.10\.99\.20/i, ALL_PCS) },
    { id: 'nslookup', label: t('Ran nslookup on a Sales PC (DNS timeout)', 'Lancé nslookup sur un PC Commercial (timeout DNS)'), test: onCmd(/^nslookup/i, SALES_PCS) },
    { id: 'ipconfig', label: t('Spotted the wrong DNS server with ipconfig /all', 'Repéré le mauvais DNS avec ipconfig /all'), test: onCmd(/^ipconfig\s+\/all/i, SALES_PCS) },
    { id: 'scope', label: t('Checked the DHCP scope options on DC01', 'Vérifié les options de l’étendue DHCP sur DC01'), test: any(onTag('dhcp-options'), onTag('dhcp-scope')) },
  ],
  hazards: [
    { id: 'smb-restart', label: t('Restarted the file-sharing service — kicked Administration out of their open files', 'Redémarré le service de partage — l’Administration a perdu ses fichiers ouverts'), penalty: 5, test: (e) => !!e.tags?.some((x) => x.startsWith('svc-restart:lanmanserver') || x.startsWith('svc-stop:lanmanserver')) },
  ],
  replies: [
    { id: 'ask-ip', label: t('Does \\\\10.10.99.20\\Sales work if you type it in Explorer?', '\\\\10.10.99.20\\Sales marche-t-il si vous le tapez dans l’Explorateur ?'), answer: t('Oh — yes, with the numbers it opens! Weird.', 'Ah — oui, avec les chiffres ça s’ouvre ! Bizarre.') },
    { id: 'ask-when', label: t('When did it last work?', 'Quand cela a-t-il marché pour la dernière fois ?'), answer: t('Friday afternoon it was fine. This morning, after starting my PC, nothing.', 'Vendredi après-midi tout allait bien. Ce matin, après avoir allumé mon PC, plus rien.') },
  ],
  pressure: [
    { after: 240, from: 'Marie Martin', role: SALES, text: t('We can’t prepare the weekly quotes without the S: drive…', 'On ne peut pas préparer les devis de la semaine sans le lecteur S:…') },
    { after: 480, from: 'Head of Sales', role: SALES, text: t('Team meeting in 15 minutes, all our figures are on S:. Please hurry.', 'Réunion d’équipe dans 15 minutes, tous nos chiffres sont sur S:. Faites vite svp.') },
  ],
  thanks: { from: 'Marie Martin', role: SALES, text: t('S: is back for everyone here, and websites are fast again. Thanks!', 'S: est revenu pour tout le monde ici, et les sites sont de nouveau rapides. Merci !') },
  hints: [
    t('From a Sales PC, compare ping fs01 with ping 10.10.99.20.', 'Depuis un PC Commercial, comparez ping fs01 avec ping 10.10.99.20.'),
    t('Name fails, IP works → DNS. ipconfig /all shows which DNS server the PC uses. Compare with an Admin PC.', 'Le nom échoue, l’IP marche → DNS. ipconfig /all montre le DNS utilisé. Comparez avec un PC Admin.'),
    t('The DNS server comes from DHCP. On DC01: Get-DhcpServerv4OptionValue -ScopeId 10.10.20.0', 'Le DNS vient du DHCP. Sur DC01 : Get-DhcpServerv4OptionValue -ScopeId 10.10.20.0'),
    t('Set-DhcpServerv4OptionValue -ScopeId 10.10.20.0 -DnsServer 10.10.99.10, then ipconfig /renew on each Sales PC.', 'Set-DhcpServerv4OptionValue -ScopeId 10.10.20.0 -DnsServer 10.10.99.10, puis ipconfig /renew sur chaque PC Commercial.'),
  ],
  report: {
    what: t(
      'On Friday DC02 (10.10.99.11) was decommissioned. The Admin DHCP scope was updated to use DC01 as DNS server, but the Sales scope was forgotten. When Sales PCs started on Monday they renewed their lease and received 10.10.99.11 — a server that no longer exists — so every name lookup (fs01, websites) timed out, while access by IP still worked.',
      'Vendredi, DC02 (10.10.99.11) a été décommissionné. L’étendue DHCP Admin a été mise à jour vers DC01, mais l’étendue Commercial a été oubliée. Au démarrage lundi, les PC Commercial ont renouvelé leur bail et reçu 10.10.99.11 — un serveur qui n’existe plus — donc toute résolution de nom (fs01, sites web) expirait, alors que l’accès par IP marchait.',
    ),
    cause: t('DHCP option 6 (DNS servers) of the Sales scope still pointed to the decommissioned DC02.', 'L’option DHCP 6 (serveurs DNS) de l’étendue Commercial pointait encore vers DC02 décommissionné.'),
    optimal: [
      t('By IP works, by name fails → DNS problem on Sales PCs only.', 'Par IP ça marche, par nom ça échoue → problème DNS sur les PC Commercial uniquement.'),
      t('ipconfig /all → DNS 10.10.99.11 (Admin PCs use 10.10.99.10).', 'ipconfig /all → DNS 10.10.99.11 (les PC Admin utilisent 10.10.99.10).'),
      t('On DC01, correct option 6 for scope 10.10.20.0 to 10.10.99.10.', 'Sur DC01, corriger l’option 6 de l’étendue 10.10.20.0 en 10.10.99.10.'),
      t('ipconfig /renew on Sales PCs (or wait for lease renewal) and verify.', 'ipconfig /renew sur les PC Commercial (ou attendre le renouvellement) et vérifier.'),
    ],
    lessons: [
      t('"The network path was not found" is often a name-resolution problem.', '« Le chemin réseau n’a pas été trouvé » est souvent un problème de résolution de nom.'),
      t('Decommissioning a server means hunting down every reference to it: DHCP options, static configs, scripts.', 'Décommissionner un serveur, c’est traquer toutes ses références : options DHCP, configs statiques, scripts.'),
      t('Fixing the server side isn’t enough — clients keep their old lease until they renew.', 'Corriger côté serveur ne suffit pas — les clients gardent leur ancien bail jusqu’au renouvellement.'),
    ],
  },
}

/* ============================ 4. Domain login failure ============================ */

export const lockedOut: Scenario = {
  id: 'inc-account-lockout',
  number: 4,
  category: 'identity',
  difficulty: 2,
  minutes: 10,
  xp: 200,
  skills: ['systems', 'security'],
  title: t('An employee cannot log in to their domain account', 'Une employée ne peut plus ouvrir sa session de domaine'),
  role: IT_ROLE,
  company: COMPANY,
  start: '08:49',
  intro: t(
    'Monday, 08:49. Marie Martin (Sales) cannot sign in to SAL-PC1. The level-1 helpdesk already unlocked her account at 08:30 — it was locked again a few minutes later. They escalate to you.',
    'Lundi, 08h49. Marie Martin (Commercial) ne peut pas ouvrir de session sur SAL-PC1. Le support niveau 1 a déjà déverrouillé son compte à 08h30 — il était de nouveau verrouillé quelques minutes après. Ils vous escaladent le ticket.',
  ),
  ticket: {
    id: 'INC-4512', from: 'Marie Martin', dept: SALES, priority: 'P2',
    subject: t('Account locked again and again', 'Compte verrouillé encore et encore'),
    body: t('Windows says "The referenced account is currently locked out and may not be logged on to." I’m 100% sure of my password. It was unlocked earlier but it’s locked again!', 'Windows dit « Le compte référencé est actuellement verrouillé et vous ne pourrez peut-être pas vous y connecter. » Je suis sûre à 100 % de mon mot de passe. Il a été déverrouillé mais il est de nouveau bloqué !'),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '08:49',
      after: (w) => ({
        ...w,
        accounts: w.accounts.map((a) => (a.sam === 'mmartin' ? { ...a, locked: true, badCount: 5, lastBad: '11/23/2026 08:41:12' } : a)),
        flags: { ...w.flags, pwdSet: { mmartin: '11/20/2026 16:02' }, phoneFixed: false, sinceUnlock: -1 },
      }),
      logs: [
        { t: '16:02:44', src: 'DC01', level: 'info', id: 4723, msg: "An attempt was made to change an account's password. Target Account: mmartin (password expired)" },
        { t: '08:09:58', src: 'DC01', level: 'warn', id: 4625, msg: 'An account failed to log on. Account: mmartin  Workstation: MOB-MMARTIN (Exchange ActiveSync)  Failure: bad password' },
        { t: '08:10:31', src: 'DC01', level: 'warn', id: 4625, msg: 'An account failed to log on. Account: mmartin  Workstation: MOB-MMARTIN (Exchange ActiveSync)  Failure: bad password' },
        { t: '08:12:03', src: 'DC01', level: 'error', id: 4740, msg: 'A user account was locked out. Account: mmartin  Caller Computer Name: MOB-MMARTIN' },
        { t: '08:30:15', src: 'DC01', level: 'info', id: 4767, msg: 'A user account was unlocked. Target Account: mmartin  By: helpdesk.l1' },
        { t: '08:39:47', src: 'DC01', level: 'warn', id: 4625, msg: 'An account failed to log on. Account: mmartin  Workstation: MOB-MMARTIN (Exchange ActiveSync)  Failure: bad password' },
        { t: '08:41:12', src: 'DC01', level: 'error', id: 4740, msg: 'A user account was locked out. Account: mmartin  Caller Computer Name: MOB-MMARTIN' },
      ],
    }),
  checks: [
    { id: 'unlocked', label: t('mmartin is unlocked and enabled', 'mmartin est déverrouillé et activé'), test: (w) => !!w.accounts.find((a) => a.sam === 'mmartin' && !a.locked && a.enabled) },
    { id: 'source', label: t('No more failed logons from a stale device', 'Plus d’échecs de connexion depuis un appareil obsolète'), test: (w) => !!w.flags.phoneFixed },
    { id: 'dc', label: t('SAL-PC1 can reach the domain controller', 'SAL-PC1 joint le contrôleur de domaine'), test: (w) => webOk(w, ID.SAL1, 'dc01', 389) },
  ],
  rootCauses: [
    { id: 'forgot', label: t('Marie forgot her password', 'Marie a oublié son mot de passe') },
    { id: 'phone', label: t('Her phone keeps trying the old password after Friday’s change', 'Son téléphone réessaie l’ancien mot de passe depuis le changement de vendredi') },
    { id: 'attack', label: t('A brute-force attack on her account', 'Une attaque par force brute sur son compte') },
    { id: 'dc', label: t('The domain controller is unreachable', 'Le contrôleur de domaine est injoignable') },
    { id: 'expired', label: t('Her password expired', 'Son mot de passe a expiré') },
  ],
  cause: 'phone',
  evidence: [
    { id: 'user', label: t('Checked the account state (LockedOut, BadLogonCount, PasswordLastSet)', 'Vérifié l’état du compte (LockedOut, BadLogonCount, PasswordLastSet)'), test: onTag('ad-props:mmartin') },
    { id: 'events', label: t('Read lockout events (4740 / 4625) to find the source', 'Lu les événements de verrouillage (4740 / 4625) pour trouver la source'), test: any(onTag('eventlog:security', 'DC01'), onTag('eventid:4740'), onAct('view-logs')) },
    { id: 'talk', label: t('Asked Marie about recent changes / other devices', 'Interrogé Marie sur les changements récents / autres appareils'), test: any(onAct('reply:ask-devices'), onAct('reply:ask-pwd')) },
  ],
  hazards: [
    { id: 'reset', label: t('Reset a password that wasn’t the problem — Marie must learn yet another one, and the phone still fails', 'Réinitialisé un mot de passe qui n’était pas le problème — Marie doit en apprendre un autre, et le téléphone échoue toujours'), penalty: 5, test: (e) => !!e.tags?.includes('pwd-reset:mmartin') },
    { id: 'disable', label: t('Disabled the user’s account', 'Désactivé le compte de l’utilisatrice'), penalty: 8, test: (e) => !!e.tags?.includes('ad-disable:mmartin') },
  ],
  replies: [
    { id: 'ask-pwd', label: t('Did you change your password recently?', 'Avez-vous changé votre mot de passe récemment ?'), answer: t('Yes, on Friday afternoon — Windows said it had expired. I changed it on my PC.', 'Oui, vendredi après-midi — Windows disait qu’il avait expiré. Je l’ai changé sur mon PC.') },
    { id: 'ask-devices', label: t('Do you use your work account on other devices (phone, tablet)?', 'Utilisez-vous votre compte pro sur d’autres appareils (téléphone, tablette) ?'), answer: t('My phone, for email. It keeps asking me for a password since the weekend, I just tap "Cancel".', 'Mon téléphone, pour les mails. Il me redemande un mot de passe depuis le week-end, je tape « Annuler ».') },
    { id: 'advise-phone', label: t('Please update the password in your phone’s mail app now.', 'Mettez à jour le mot de passe dans l’appli mail de votre téléphone maintenant.'), answer: t('Done — I typed the new one on my phone and the emails are syncing again.', 'C’est fait — j’ai tapé le nouveau sur mon téléphone et les mails se synchronisent.') },
    { id: 'ask-caps', label: t('Is Caps Lock on?', 'La touche Verr. Maj est-elle activée ?'), answer: t('No, I checked. I typed it slowly three times.', 'Non, j’ai vérifié. Je l’ai tapé lentement trois fois.') },
  ],
  react: (w, e) => {
    let out = w
    const msgs: NonNullable<import('@/ops/types').Reaction['msgs']> = []
    if (e.line === 'reply:advise-phone') out = { ...out, flags: { ...out.flags, phoneFixed: true } }
    const acct = out.accounts.find((a) => a.sam === 'mmartin')!
    let since = out.flags.sinceUnlock as number
    if (!acct.locked && since < 0) since = 0
    else if (!acct.locked && !out.flags.phoneFixed) since++
    if (acct.locked) since = -1
    if (since >= 4 && !out.flags.phoneFixed) {
      out = { ...out, accounts: out.accounts.map((a) => (a.sam === 'mmartin' ? { ...a, locked: true, badCount: 5 } : a)) }
      out = log(out, { src: 'DC01', level: 'warn', id: 4625, msg: 'An account failed to log on. Account: mmartin  Workstation: MOB-MMARTIN (Exchange ActiveSync)  Failure: bad password' })
      out = log(out, { src: 'DC01', level: 'error', id: 4740, msg: 'A user account was locked out. Account: mmartin  Caller Computer Name: MOB-MMARTIN' })
      msgs.push({ from: 'Marie Martin', role: SALES, text: t('It worked for a minute and now it’s LOCKED AGAIN!', 'Ça a marché une minute et c’est DE NOUVEAU VERROUILLÉ !'), tone: 'angry' })
      since = -1
    }
    return { world: { ...out, flags: { ...out.flags, sinceUnlock: since } }, msgs }
  },
  pressure: [{ after: 300, from: 'Marie Martin', role: SALES, text: t('I have a customer visit at 10:00 and all my files are on this PC…', 'J’ai une visite client à 10h00 et tous mes fichiers sont sur ce PC…'), tone: 'normal' }],
  thanks: { from: 'Marie Martin', role: SALES, text: t('I’m in, and it stays unlocked this time. Thank you!', 'Je suis connectée, et ça reste déverrouillé cette fois. Merci !') },
  hints: [
    t('On DC01: Get-ADUser mmartin -Properties * — look at LockedOut, BadLogonCount and PasswordLastSet.', 'Sur DC01 : Get-ADUser mmartin -Properties * — regardez LockedOut, BadLogonCount et PasswordLastSet.'),
    t('Lockout events are 4740 in the Security log: Get-EventLog -LogName Security -InstanceId 4740. Which "Caller Computer" locks it?', 'Les verrouillages sont les événements 4740 du journal Sécurité : Get-EventLog -LogName Security -InstanceId 4740. Quel « Caller Computer » le verrouille ?'),
    t('Unlocking alone won’t last while a device keeps trying the old password. Talk to Marie (Messages → reply).', 'Déverrouiller ne tiendra pas tant qu’un appareil essaie l’ancien mot de passe. Parlez à Marie (Messages → répondre).'),
    t('Unlock-ADAccount mmartin, and have her update the password on her phone.', 'Unlock-ADAccount mmartin, et faites-lui mettre à jour le mot de passe sur son téléphone.'),
  ],
  report: {
    what: t(
      'Marie changed her expired password on Friday. Her phone’s mail app kept trying the old one in the background; after 5 bad attempts the domain locks the account (lockout policy). The helpdesk unlocked it at 08:30 but the phone locked it again 11 minutes later — the events 4740 all name MOB-MMARTIN as the caller.',
      'Marie a changé son mot de passe expiré vendredi. L’appli mail de son téléphone a continué d’essayer l’ancien en arrière-plan ; après 5 essais erronés, le domaine verrouille le compte (stratégie de verrouillage). Le support l’a déverrouillé à 08h30 mais le téléphone l’a reverrouillé 11 minutes plus tard — les événements 4740 désignent tous MOB-MMARTIN.',
    ),
    cause: t('A stale password saved on her phone repeatedly failed authentication and triggered the lockout policy.', 'Un ancien mot de passe enregistré sur son téléphone échouait sans cesse et déclenchait la stratégie de verrouillage.'),
    optimal: [
      t('Get-ADUser -Properties * → locked, PasswordLastSet Friday.', 'Get-ADUser -Properties * → verrouillé, PasswordLastSet vendredi.'),
      t('Security log 4740 → caller MOB-MMARTIN (ActiveSync).', 'Journal Sécurité 4740 → appelant MOB-MMARTIN (ActiveSync).'),
      t('Ask Marie: phone still has the old password.', 'Demander à Marie : le téléphone a toujours l’ancien mot de passe.'),
      t('Unlock-ADAccount mmartin + update the phone. No password reset needed.', 'Unlock-ADAccount mmartin + mise à jour du téléphone. Pas besoin de réinitialiser le mot de passe.'),
    ],
    lessons: [
      t('A lockout that comes back is almost always a device or service with a cached old password.', 'Un verrouillage qui revient est presque toujours un appareil ou service avec un ancien mot de passe en cache.'),
      t('Event 4740 tells you which machine caused the lockout.', 'L’événement 4740 indique quelle machine a provoqué le verrouillage.'),
      t('Don’t reset a password the user knows — it doesn’t fix the source and costs them time.', 'Ne réinitialisez pas un mot de passe que l’utilisateur connaît — ça ne corrige pas la source et lui fait perdre du temps.'),
    ],
  },
}

/* ============================ 5. DHCP stops assigning addresses ============================ */

const GUESTS = Array.from({ length: 49 }, (_, k) => {
  const names = ['Galaxy-S24', 'iPhone', 'Pixel-8', 'DESKTOP-EXPO', 'iPad', 'Xiaomi-13', 'MacBook-Air']
  const mac = `a4c3.${(0x1000 + k * 37).toString(16).slice(-4)}.${(0x2000 + k * 91).toString(16).slice(-4)}`.toUpperCase()
  return { mac, ip: `10.10.20.${100 + k + (k >= 1 ? 1 : 0) + (k >= 2 ? 1 : 0)}`, host: `${names[k % names.length]}-${(k * 7919).toString(16).slice(-3)}` }
})

export const dhcpFull: Scenario = {
  id: 'inc-dhcp-exhausted',
  number: 5,
  category: 'network',
  difficulty: 2,
  minutes: 12,
  xp: 225,
  skills: ['networking', 'systems'],
  title: t('The DHCP server stops assigning addresses', 'Le serveur DHCP ne distribue plus d’adresses'),
  role: IT_ROLE,
  company: COMPANY,
  start: '08:55',
  intro: t(
    'Monday, 08:55. Last week Sales hosted a trade-show stand in the lobby, with a temporary guest Wi-Fi access point plugged into the Sales network. This morning, the people who just arrived in Sales get "No network", while early birds are fine.',
    'Lundi, 08h55. La semaine dernière, le Commercial tenait un stand de salon dans le hall, avec un point d’accès Wi-Fi invités temporaire branché sur le réseau Commercial. Ce matin, ceux qui viennent d’arriver au Commercial n’ont « pas de réseau », alors que les lève-tôt vont bien.',
  ),
  ticket: {
    id: 'INC-4528', from: 'Lucas Petit', dept: SALES, priority: 'P2',
    subject: t('No network for some of Sales', 'Pas de réseau pour une partie du Commercial'),
    body: t('Me (SAL-PC3) and Marie on her laptop have no network — "unidentified network". Marie’s desktop and Tom’s PC work. We all plugged in the same way!', 'Moi (SAL-PC3) et Marie sur son portable n’avons pas de réseau — « réseau non identifié ». Le fixe de Marie et le PC de Tom marchent. On est tous branchés pareil !'),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '08:55',
      sales: { range: ['10.10.20.100', '10.10.20.150'], lease: 192, leases: GUESTS },
      after: (w) => ({ ...w, flags: { ...w.flags, staleMacs: GUESTS.map((g) => g.mac) } }),
      logs: [
        { t: '14:02:10', src: 'SW-SALES', level: 'info', svc: 'LINK-3-UPDOWN', msg: 'Interface FastEthernet0/12, changed state to up (desc: TEMP GUEST AP — EXPO)' },
        { t: '18:30:44', src: 'SW-SALES', level: 'info', svc: 'LINK-3-UPDOWN', msg: 'Interface FastEthernet0/12, changed state to down' },
        { t: '08:33:05', src: 'DC01', level: 'warn', id: 1020, svc: 'dhcp', msg: 'Scope, 10.10.20.0, is 100 percent full with only 0 IP addresses remaining.' },
        { t: '08:44:51', src: 'DC01', level: 'error', id: 1063, svc: 'dhcp', msg: 'There are no IP addresses available for lease in the scope or superscope "10.10.20.0".' },
      ],
    }),
  checks: [
    { id: 'pc3', label: t('SAL-PC3 has a valid lease', 'SAL-PC3 a un bail valide'), test: (w) => hasLease(w, ID.SAL3) },
    { id: 'lt', label: t('SAL-LAPTOP has a valid lease', 'SAL-LAPTOP a un bail valide'), test: (w) => hasLease(w, ID.SALLT) },
    { id: 'files', label: t('SAL-PC3 → file server', 'SAL-PC3 → serveur de fichiers'), test: (w) => smbOk(w, ID.SAL3) },
    { id: 'room', label: t('Sales scope has spare capacity (≥ 10 free addresses)', 'L’étendue Commercial a de la marge (≥ 10 adresses libres)'), test: (w) => {
      const s = w.dhcp?.scopes.find((x) => x.id === '10.10.20.0')
      if (!s) return false
      const size = Number(s.end.split('.')[3]) - Number(s.start.split('.')[3]) + 1 + (Number(s.end.split('.')[2]) - Number(s.start.split('.')[2])) * 256
      return size - s.leases.length >= 10
    } },
  ],
  rootCauses: [
    { id: 'service', label: t('The DHCP service crashed', 'Le service DHCP a planté') },
    { id: 'exhausted', label: t('The Sales scope is exhausted by guest devices with long leases', 'L’étendue Commercial est épuisée par des appareils invités aux baux longs') },
    { id: 'relay', label: t('The router stopped relaying DHCP requests', 'Le routeur ne relaie plus les requêtes DHCP') },
    { id: 'rogue', label: t('A rogue DHCP server is answering', 'Un serveur DHCP pirate répond') },
    { id: 'cable', label: t('Bad cables in the Sales office', 'Câbles défectueux au Commercial') },
  ],
  cause: 'exhausted',
  evidence: [
    { id: 'client', label: t('Saw the APIPA address on an affected PC', 'Vu l’adresse APIPA sur un poste touché'), test: onCmd(/^ipconfig/i, ['SAL-PC3', 'SAL-LAPTOP']) },
    { id: 'stats', label: t('Checked scope usage (100 % in use)', 'Vérifié l’utilisation de l’étendue (100 % utilisée)'), test: any(onTag('dhcp-stats'), onTag('dhcp-scope')) },
    { id: 'leases', label: t('Listed the leases and spotted the guest devices', 'Listé les baux et repéré les appareils invités'), test: onTag('dhcp-leases') },
    { id: 'events', label: t('Read the DHCP events on DC01', 'Lu les événements DHCP sur DC01'), test: any(onTag('eventlog:system', 'DC01'), onAct('view-logs')) },
  ],
  hazards: [
    { id: 'remove-all', label: t('Deleted every lease — risk of duplicate IP addresses on the Sales floor', 'Supprimé tous les baux — risque d’adresses IP en double au Commercial'), penalty: 10, test: (e) => !!e.tags?.includes('dhcp-remove-all') },
    { id: 'dhcp-restart', label: t('Restarted the DHCP service — it was healthy, just full', 'Redémarré le service DHCP — il allait bien, il était juste plein'), penalty: 2, test: (e) => !!e.tags?.some((x) => x.startsWith('svc-restart:dhcp')) },
  ],
  react: (w) => ({ world: autoRenew(w, [ID.SAL3, ID.SALLT]) }),
  pressure: [
    { after: 240, from: 'Lucas Petit', role: SALES, text: t('Two more colleagues just arrived and have the same problem…', 'Deux collègues viennent d’arriver avec le même problème…') },
  ],
  thanks: { from: 'Lucas Petit', role: SALES, text: t('We’re all connected now. What was it?', 'On est tous connectés maintenant. C’était quoi ?') },
  hints: [
    t('ipconfig /all on SAL-PC3: 169.254.x.x means no DHCP answer. Early PCs kept their lease — so the server answers some clients…', 'ipconfig /all sur SAL-PC3 : 169.254.x.x = pas de réponse DHCP. Les premiers PC ont gardé leur bail — le serveur répond donc à certains…'),
    t('On DC01: Get-DhcpServerv4ScopeStatistics and Get-DhcpServerv4Lease -ScopeId 10.10.20.0', 'Sur DC01 : Get-DhcpServerv4ScopeStatistics et Get-DhcpServerv4Lease -ScopeId 10.10.20.0'),
    t('The scope is full of phones from the trade show with 8-day leases. Make room: extend the range and shorten the lease.', 'L’étendue est pleine de téléphones du salon avec des baux de 8 jours. Faites de la place : élargissez la plage et raccourcissez le bail.'),
    t('Set-DhcpServerv4Scope -ScopeId 10.10.20.0 -EndRange 10.10.20.220 -LeaseDuration 1.00:00:00', 'Set-DhcpServerv4Scope -ScopeId 10.10.20.0 -EndRange 10.10.20.220 -LeaseDuration 1.00:00:00'),
  ],
  report: {
    what: t(
      'The temporary guest access point bridged visitors’ phones and laptops into the Sales network. Each device took a Sales DHCP lease for 8 days. With only 51 addresses in the scope, it was full by Monday: PCs that still had a lease worked, new requests got no answer and fell back to APIPA (169.254.x.x).',
      'Le point d’accès invités temporaire a fait entrer les téléphones et portables des visiteurs dans le réseau Commercial. Chaque appareil a pris un bail DHCP Commercial de 8 jours. Avec seulement 51 adresses, l’étendue était pleine lundi : les PC ayant un bail marchaient, les nouvelles demandes n’obtenaient aucune réponse et passaient en APIPA (169.254.x.x).',
    ),
    cause: t('DHCP scope exhaustion: guest devices consumed every address with long (8-day) leases.', 'Épuisement de l’étendue DHCP : des appareils invités ont consommé toutes les adresses avec des baux longs (8 jours).'),
    optimal: [
      t('ipconfig on an affected PC → APIPA.', 'ipconfig sur un poste touché → APIPA.'),
      t('Get-DhcpServerv4ScopeStatistics → 100 % in use; event 1020 on DC01.', 'Get-DhcpServerv4ScopeStatistics → 100 % utilisée ; événement 1020 sur DC01.'),
      t('Get-DhcpServerv4Lease → dozens of guest devices.', 'Get-DhcpServerv4Lease → des dizaines d’appareils invités.'),
      t('Extend the range and shorten the lease (and/or remove the stale guest leases). Clients renew.', 'Élargir la plage et raccourcir le bail (et/ou supprimer les baux invités). Les clients renouvellent.'),
      t('Follow-up: guests belong on a separate guest VLAN/scope with short leases.', 'Suivi : les invités doivent avoir leur VLAN/étendue dédiés avec des baux courts.'),
    ],
    lessons: [
      t('"Some users work, new ones don’t" is the classic signature of an exhausted DHCP pool.', '« Certains marchent, les nouveaux non » est la signature classique d’un pool DHCP épuisé.'),
      t('Lease duration should match how long devices stay: hours for guests, days for desks.', 'La durée du bail doit correspondre à la présence des appareils : des heures pour les invités, des jours pour les postes.'),
      t('Never mix guest devices into an internal network.', 'Ne mélangez jamais les appareils invités au réseau interne.'),
    ],
  },
}

/* ============================ 6. DNS resolution fails ============================ */

export const dnsDown: Scenario = {
  id: 'inc-dns-down',
  number: 6,
  category: 'server',
  difficulty: 1,
  minutes: 8,
  xp: 150,
  skills: ['systems', 'networking'],
  title: t('DNS resolution fails', 'La résolution DNS échoue'),
  role: IT_ROLE,
  company: COMPANY,
  start: '07:52',
  intro: t(
    'Wednesday, 07:52. Last night’s patch window installed Windows updates on the servers. The first employees arriving report that "nothing opens": no websites, no intranet, no shared drive.',
    'Mercredi, 07h52. La fenêtre de maintenance de cette nuit a installé les mises à jour Windows sur les serveurs. Les premiers arrivés signalent que « rien ne s’ouvre » : ni sites web, ni intranet, ni lecteur partagé.',
  ),
  ticket: {
    id: 'INC-4540', from: 'Julien Dubois', dept: t('Administration', 'Administration'), priority: 'P1',
    subject: t('Nothing opens', 'Plus rien ne s’ouvre'),
    body: t('Chrome says "DNS_PROBE_FINISHED_NXDOMAIN" or "This site can’t be reached", the intranet doesn’t load and the shared drive is missing. My network icon looks normal.', 'Chrome affiche « DNS_PROBE_FINISHED_NXDOMAIN » ou « Ce site est inaccessible », l’intranet ne charge pas et le lecteur partagé a disparu. L’icône réseau a l’air normale.'),
  },
  duties: DUTIES,
  tools: ['map', 'terminal', 'logs', 'monitor'],
  nms: ID.IT,
  build: () =>
    hq({
      start: '07:52',
      after: (w) => setSvc(w, ID.DC, 'dns', { state: 'stopped' }),
      logs: [
        { t: '03:05:12', src: 'DC01', level: 'info', id: 19, svc: 'wuauserv', msg: 'Installation Successful: Windows successfully installed the following update: 2026-11 Cumulative Update (KB5048661)' },
        { t: '03:11:40', src: 'DC01', level: 'info', id: 1074, msg: 'The process TrustedInstaller.exe has initiated the restart of computer DC01 (Operating System: Service pack / update).' },
        { t: '03:14:02', src: 'DC01', level: 'error', id: 7034, svc: 'dns', msg: 'The DNS Server service terminated unexpectedly. It has done this 1 time(s).' },
        { t: '03:14:02', src: 'DC01', level: 'warn', id: 7036, svc: 'dns', msg: 'The DNS Server service entered the stopped state.' },
        { t: '03:14:05', src: 'DC01', level: 'warn', id: 1014, msg: 'Name resolution for the name corp.local timed out after none of the configured DNS servers responded.' },
      ],
    }),
  checks: [
    { id: 'svc', label: t('DNS Server service running on DC01', 'Service DNS Server actif sur DC01'), test: (w) => running(w, ID.DC, 'dns') },
    { id: 'internal', label: t('Internal names resolve (intranet)', 'Les noms internes se résolvent (intranet)'), test: (w) => webOk(w, ID.ADM1, 'intranet', 80) },
    { id: 'external', label: t('Internet names resolve', 'Les noms Internet se résolvent'), test: (w) => internetOk(w, ID.SAL1) },
    { id: 'files', label: t('\\\\fs01 reachable by name', '\\\\fs01 joignable par son nom'), test: (w) => smbOk(w, ID.ADM1) },
  ],
  rootCauses: [
    { id: 'isp', label: t('The Internet connection is down', 'La connexion Internet est coupée') },
    { id: 'dns-svc', label: t('The DNS Server service on DC01 stopped after the update reboot', 'Le service DNS Server de DC01 s’est arrêté après le redémarrage de mise à jour') },
    { id: 'dhcp', label: t('DHCP gave clients the wrong DNS server', 'Le DHCP a donné un mauvais DNS aux clients') },
    { id: 'fw', label: t('The firewall blocks port 53', 'Le pare-feu bloque le port 53') },
  ],
  cause: 'dns-svc',
  evidence: [
    { id: 'ip-vs-name', label: t('Pinged by IP (works) vs by name (fails)', 'Pingé par IP (marche) vs par nom (échec)'), test: onCmd(/^(ping|tnc|test-netconnection)\s+\d+\.\d+\.\d+\.\d+/i) },
    { id: 'nslookup', label: t('Ran nslookup — the DNS server doesn’t answer', 'Lancé nslookup — le serveur DNS ne répond pas'), test: onTag('nslookup:') },
    { id: 'svc', label: t('Checked the service state on DC01', 'Vérifié l’état du service sur DC01'), test: any(onTag('svc-list', 'DC01')) },
    { id: 'events', label: t('Found the crash in DC01’s event log', 'Trouvé le plantage dans le journal de DC01'), test: any(onTag('eventlog:system', 'DC01'), onAct('view-logs')) },
  ],
  hazards: [
    { id: 'forwarder', label: t('Changed the DNS forwarder — the service wasn’t even running', 'Modifié le redirecteur DNS — le service ne tournait même pas'), penalty: 3, test: (e) => !!e.tags?.includes('dns-set-forwarder') },
  ],
  pressure: [
    { after: 150, from: 'Helpdesk', role: t('Service desk', 'Centre de services'), text: t('More people arriving — 9 calls already. Everybody says "the internet is broken".', 'D’autres arrivent — déjà 9 appels. Tout le monde dit « internet est cassé ».') },
  ],
  thanks: { from: 'Julien Dubois', role: t('Administration', 'Administration'), text: t('Everything opens again, thank you!', 'Tout s’ouvre à nouveau, merci !') },
  hints: [
    t('From any PC: ping 8.8.8.8, then ping google.com. If the IP works, the network is fine — names are the problem.', 'Depuis un PC : ping 8.8.8.8, puis ping google.com. Si l’IP marche, le réseau va bien — ce sont les noms.'),
    t('nslookup google.com → which server times out? It is DC01 (10.10.99.10).', 'nslookup google.com → quel serveur ne répond pas ? C’est DC01 (10.10.99.10).'),
    t('On DC01: Get-Service, then Get-EventLog -LogName System -Newest 10.', 'Sur DC01 : Get-Service, puis Get-EventLog -LogName System -Newest 10.'),
    t('Start-Service DNS', 'Start-Service DNS'),
  ],
  report: {
    what: t('The overnight cumulative update rebooted DC01. While starting, the DNS Server service crashed (event 7034) and stayed stopped. The network itself was healthy, but no client could translate names to addresses, so everything "looked" down.', 'La mise à jour cumulative de la nuit a redémarré DC01. Au démarrage, le service DNS Server a planté (événement 7034) et est resté arrêté. Le réseau était sain, mais aucun client ne pouvait traduire les noms en adresses : tout « semblait » en panne.'),
    cause: t('DNS Server service stopped on DC01 after the patch reboot.', 'Service DNS Server arrêté sur DC01 après le redémarrage de mise à jour.'),
    optimal: [
      t('ping by IP works, by name fails → DNS.', 'ping par IP marche, par nom échoue → DNS.'),
      t('nslookup → DC01 doesn’t answer. Get-Service on DC01 → DNS stopped; event 7034.', 'nslookup → DC01 ne répond pas. Get-Service sur DC01 → DNS arrêté ; événement 7034.'),
      t('Start-Service DNS, verify internal and external names.', 'Start-Service DNS, vérifier noms internes et externes.'),
      t('Follow-up: set service recovery to "Restart the service", add a second DNS server, monitor port 53.', 'Suivi : configurer la récupération du service sur « Redémarrer », ajouter un second DNS, superviser le port 53.'),
    ],
    lessons: [
      t('"The internet is broken" is often DNS. Always test an IP and a name.', '« Internet est cassé », c’est souvent le DNS. Testez toujours une IP et un nom.'),
      t('One DNS server is a single point of failure for the whole company.', 'Un seul serveur DNS est un point de défaillance unique pour toute l’entreprise.'),
      t('After a patch window, check that critical services came back.', 'Après une fenêtre de mise à jour, vérifiez que les services critiques sont revenus.'),
    ],
  },
}
