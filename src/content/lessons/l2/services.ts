import { t, type Lesson } from '../types'

export const dhcpLessons: Lesson[] = [
  {
    id: 'l2-dhcp.1',
    title: t('How DHCP works', 'Comment fonctionne le DHCP'),
    minutes: 12,
    objectives: [
      t('Describe the DORA exchange', 'Décrire l’échange DORA'),
      t('Explain scopes, leases, exclusions and reservations', 'Expliquer étendues, baux, exclusions et réservations'),
      t('Recognise DHCP failures from the client side', 'Reconnaître une panne DHCP côté client'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Nobody types IP addresses by hand', 'Personne ne tape les IP à la main'),
        body: t('With 500 laptops, phones and printers, static addressing is impossible. **DHCP** (Dynamic Host Configuration Protocol) hands out IP address, mask, **gateway** and **DNS servers** automatically, for a limited time — the **lease**.', 'Avec 500 portables, téléphones et imprimantes, l’adressage statique est impossible. Le **DHCP** distribue automatiquement adresse IP, masque, **passerelle** et **serveurs DNS**, pour une durée limitée — le **bail**.'),
      },
      { type: 'animation', anim: 'dhcp-dora', title: t('DORA: Discover, Offer, Request, Acknowledge', 'DORA : Discover, Offer, Request, Acknowledge') },
      {
        type: 'table',
        head: [t('Term', 'Terme'), t('Meaning', 'Signification'), t('Example', 'Exemple')],
        rows: [
          [t('Scope', 'Étendue'), t('Range of addresses to hand out for one subnet', 'Plage d’adresses à distribuer pour un sous-réseau'), '10.10.20.100 – 10.10.20.200'],
          [t('Exclusion', 'Exclusion'), t('Addresses inside the range never handed out', 'Adresses de la plage jamais distribuées'), t('.150–.160 for printers', '.150–.160 pour les imprimantes')],
          [t('Reservation', 'Réservation'), t('Always the same IP for one MAC', 'Toujours la même IP pour une MAC'), t('Printer MAC → .150', 'MAC imprimante → .150')],
          [t('Lease', 'Bail'), t('How long the client may keep the address', 'Durée pendant laquelle le client garde l’adresse'), t('8 days (office), 4 h (guests)', '8 jours (bureau), 4 h (invités)')],
          [t('Options', 'Options'), t('Extra settings', 'Réglages supplémentaires'), t('003 Router, 006 DNS, 015 Domain', '003 Routeur, 006 DNS, 015 Domaine')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'order',
          prompt: t('Put the DHCP messages in order.', 'Remettez les messages DHCP dans l’ordre.'),
          items: ['Discover', 'Offer', 'Request', 'Acknowledge'],
          explain: 'D-O-R-A.',
        },
      },
      {
        type: 'text',
        title: t('Renewing', 'Renouvellement'),
        body: t('At **50 %** of the lease the client asks the same server to renew (unicast). At **87.5 %** it asks any server. If the lease expires, it must stop using the address. `ipconfig /release` and `ipconfig /renew` force the process on Windows; `sudo dhclient -r && sudo dhclient` on Linux.', 'À **50 %** du bail, le client demande au même serveur de renouveler (unicast). À **87,5 %**, il demande à n’importe quel serveur. Si le bail expire, il doit cesser d’utiliser l’adresse. `ipconfig /release` et `ipconfig /renew` forcent le processus sous Windows ; `sudo dhclient -r && sudo dhclient` sous Linux.'),
      },
      {
        type: 'example',
        title: t('Client-side diagnosis', 'Diagnostic côté client'),
        body: t('`ipconfig /all` tells you: DHCP Enabled, which **DHCP Server** answered, **Lease Obtained / Expires**, and which DNS servers were given. An **Autoconfiguration IPv4 Address 169.254.x.x** means no server answered.', '`ipconfig /all` indique : DHCP activé, quel **serveur DHCP** a répondu, **Bail obtenu / expirant**, et les DNS fournis. Une **adresse IPv4 d’autoconfiguration 169.254.x.x** signifie qu’aucun serveur n’a répondu.'),
        code: 'C:\\> ipconfig /all\n   DHCP Enabled. . . . . . . . . . . : Yes\n   IPv4 Address. . . . . . . . . . . : 10.10.20.104(Preferred)\n   Lease Obtained. . . . . . . . . . : Monday 08:31:12\n   Lease Expires . . . . . . . . . . : Tuesday 08:31:12\n   Default Gateway . . . . . . . . . : 10.10.20.1\n   DHCP Server . . . . . . . . . . . : 10.10.99.10\n   DNS Servers . . . . . . . . . . . : 10.10.99.10',
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Ask the DHCP server for a new lease on Windows.', 'Demandez un nouveau bail au serveur DHCP sous Windows.'),
          accept: ['ipconfig /renew'],
          explain: 'ipconfig /renew',
          shell: 'C:\\>',
        },
      },
    ],
    vocabulary: [
      { term: 'DHCP', def: t('Automatically assigns IP configuration to clients (UDP 67/68).', 'Attribue automatiquement la configuration IP (UDP 67/68).') },
      { term: t('Lease', 'Bail'), def: t('Time a client may use an assigned address.', 'Durée d’utilisation d’une adresse attribuée.') },
      { term: t('Reservation', 'Réservation'), def: t('Fixed IP tied to a MAC address in the DHCP server.', 'IP fixe liée à une MAC dans le serveur DHCP.') },
    ],
    practice: t('Use reservations (not static IPs on the device) for printers and access points: everything stays documented in one place, and you can change DNS settings for all of them centrally.', 'Utilisez des réservations (pas d’IP fixe sur l’appareil) pour imprimantes et bornes : tout reste documenté au même endroit, et vous changez les DNS de tous centralement.'),
    quiz: [
      { kind: 'mcq', prompt: t('Which DHCP message does the client send first?', 'Quel message DHCP le client envoie-t-il en premier ?'), options: ['Offer', 'Request', 'Discover', 'Ack'], answer: 2, explain: 'Discover.' },
      { kind: 'mcq', prompt: t('DHCP option 006 provides…', 'L’option DHCP 006 fournit…'), options: [t('Gateway', 'La passerelle'), t('DNS servers', 'Les serveurs DNS'), t('Domain name', 'Le nom de domaine'), t('Lease time', 'La durée du bail')], answer: 1, explain: t('006 = DNS servers; 003 = router.', '006 = serveurs DNS ; 003 = routeur.') },
      { kind: 'tf', prompt: t('A client first tries to renew at 50 % of its lease.', 'Un client tente de renouveler dès 50 % de son bail.'), answer: true, explain: 'T1 = 50 %.' },
      { kind: 'mcq', prompt: t('A printer must always keep 10.10.10.200 but use DHCP. Use…', 'Une imprimante doit toujours avoir 10.10.10.200 en DHCP. Utilisez…'), options: [t('An exclusion', 'Une exclusion'), t('A reservation', 'Une réservation'), t('A shorter lease', 'Un bail plus court'), t('A new scope', 'Une nouvelle étendue')], answer: 1, explain: t('Reservation.', 'Réservation.') },
    ],
  },
  {
    id: 'l2-dhcp.2',
    title: t('DHCP servers, relays and troubleshooting', 'Serveurs DHCP, relais et dépannage'),
    minutes: 13,
    objectives: [
      t('Configure a DHCP pool on a Cisco router', 'Configurer un pool DHCP sur un routeur Cisco'),
      t('Explain why a DHCP relay (ip helper-address) is needed', 'Expliquer pourquoi un relais DHCP (ip helper-address) est nécessaire'),
      t('Diagnose exhausted scopes and rogue DHCP servers', 'Diagnostiquer étendues épuisées et serveurs DHCP pirates'),
    ],
    blocks: [
      {
        type: 'example',
        title: t('DHCP on a Cisco router', 'DHCP sur un routeur Cisco'),
        body: t('Small sites often let the router be the DHCP server.', 'Les petits sites laissent souvent le routeur servir de serveur DHCP.'),
        code: 'R1(config)# ip dhcp excluded-address 192.168.10.1 192.168.10.20\nR1(config)# ip dhcp pool ADMIN\nR1(dhcp-config)# network 192.168.10.0 255.255.255.0\nR1(dhcp-config)# default-router 192.168.10.1\nR1(dhcp-config)# dns-server 192.168.10.10\nR1(dhcp-config)# domain-name corp.local\nR1(dhcp-config)# lease 8\nR1# show ip dhcp binding',
      },
      {
        type: 'text',
        title: t('Relaying across routers', 'Relayer à travers les routeurs'),
        body: t('DHCP Discover is a **broadcast**, and routers stop broadcasts. In companies the DHCP server lives in the server VLAN, so on every user VLAN’s gateway you add an **IP helper**: the router catches the broadcast and forwards it as unicast to the server, adding which subnet it came from (so the server picks the right scope).', 'Le DHCP Discover est un **broadcast**, et les routeurs arrêtent les broadcasts. En entreprise, le serveur DHCP est dans le VLAN serveurs : sur la passerelle de chaque VLAN utilisateurs, on ajoute un **IP helper** : le routeur capte le broadcast et le transmet en unicast au serveur, en indiquant de quel sous-réseau il vient (pour choisir la bonne étendue).'),
      },
      {
        type: 'code',
        code: 'R1(config)# interface g0/0/1.20\nR1(config-subif)# ip helper-address 10.10.99.10',
        caption: t('Without this line, clients in VLAN 20 get 169.254.x.x addresses.', 'Sans cette ligne, les clients du VLAN 20 obtiennent des adresses 169.254.x.x.'),
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('On the VLAN 30 gateway interface, relay DHCP to 10.10.99.10.', 'Sur l’interface passerelle du VLAN 30, relayez le DHCP vers 10.10.99.10.'),
          accept: ['ip helper-address 10.10.99.10'],
          explain: 'ip helper-address 10.10.99.10',
          shell: 'R1(config-if)#',
        },
      },
      {
        type: 'table',
        head: [t('Symptom', 'Symptôme'), t('Probable cause', 'Cause probable'), t('Check', 'Vérification')],
        rows: [
          [t('Everyone in one VLAN gets 169.254', 'Tout un VLAN obtient 169.254'), t('Missing helper / VLAN not reaching the router', 'Helper manquant / VLAN n’atteignant pas le routeur'), 'show run interface, show vlan'],
          [t('New devices only get 169.254', 'Seuls les nouveaux appareils ont 169.254'), t('Scope exhausted', 'Étendue épuisée'), 'Get-DhcpServerv4ScopeStatistics'],
          [t('Clients get a strange 192.168.0.x', 'Les clients reçoivent un étrange 192.168.0.x'), t('Rogue DHCP (someone’s home router!)', 'DHCP pirate (la box de quelqu’un !)'), t('ipconfig /all → DHCP Server', 'ipconfig /all → serveur DHCP')],
          [t('Wrong DNS on one department', 'Mauvais DNS dans un service'), t('Scope option 006 wrong', 'Option 006 de l’étendue erronée'), 'Get-DhcpServerv4OptionValue'],
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Rogue DHCP servers', 'Serveurs DHCP pirates'),
        body: t('A home router plugged into the office network starts answering Discovers faster than the real server and hands out wrong gateways. **DHCP snooping** on switches only allows DHCP offers from trusted ports (the uplink to the real server).', 'Une box personnelle branchée sur le réseau répond aux Discover plus vite que le vrai serveur et distribue de mauvaises passerelles. Le **DHCP snooping** sur les switches n’autorise les offres DHCP que depuis les ports de confiance (le lien vers le vrai serveur).'),
      },
    ],
    vocabulary: [
      { term: t('DHCP relay', 'Relais DHCP'), def: t('Router function forwarding DHCP broadcasts to a server (ip helper-address).', 'Fonction du routeur qui transmet les broadcasts DHCP à un serveur (ip helper-address).') },
      { term: t('DHCP snooping', 'DHCP snooping'), def: t('Switch feature blocking DHCP offers from untrusted ports.', 'Fonction de switch bloquant les offres DHCP des ports non fiables.') },
      { term: t('Binding', 'Association'), def: t('A lease recorded by the server (IP ↔ MAC).', 'Un bail enregistré par le serveur (IP ↔ MAC).') },
    ],
    practice: t('The simulator has two DHCP incidents: "DHCP stops assigning addresses" (exhausted scope) and "Shared folders" (wrong option 006). Both are 10-minute fixes once you know where to look.', 'Le simulateur propose deux incidents DHCP : « Le serveur DHCP ne distribue plus d’adresses » (étendue épuisée) et « Dossiers partagés » (option 006 erronée). Les deux se règlent en 10 minutes quand on sait où regarder.'),
    quiz: [
      { kind: 'mcq', prompt: t('Why is ip helper-address needed?', 'Pourquoi ip helper-address est-il nécessaire ?'), options: [t('Routers do not forward broadcasts', 'Les routeurs ne transmettent pas les broadcasts'), t('To encrypt DHCP', 'Pour chiffrer le DHCP'), t('To speed up DNS', 'Pour accélérer le DNS'), t('For IPv6 only', 'Pour IPv6 uniquement')], answer: 0, explain: t('It relays broadcasts as unicast.', 'Il relaie les broadcasts en unicast.') },
      { kind: 'command', prompt: t('Show current DHCP leases on a Cisco router.', 'Afficher les baux DHCP actuels sur un routeur Cisco.'), accept: ['show ip dhcp binding', 'sh ip dhcp binding'], explain: 'show ip dhcp binding', shell: 'R1#' },
      { kind: 'mcq', prompt: t('Users get 192.168.0.x instead of 10.10.x.x. Most likely?', 'Les utilisateurs reçoivent 192.168.0.x au lieu de 10.10.x.x. Cause probable ?'), options: [t('Rogue DHCP server', 'Serveur DHCP pirate'), t('DNS failure', 'Panne DNS'), t('STP', 'STP'), t('NAT', 'NAT')], answer: 0, explain: t('Check the DHCP Server field in ipconfig /all.', 'Vérifiez le champ Serveur DHCP dans ipconfig /all.') },
      { kind: 'tf', prompt: t('ip dhcp excluded-address prevents the router from handing out those addresses.', 'ip dhcp excluded-address empêche le routeur de distribuer ces adresses.'), answer: true, explain: t('Used for statically configured devices.', 'Utilisé pour les équipements en IP fixe.') },
    ],
  },
]

export const dnsLessons: Lesson[] = [
  {
    id: 'l2-dns.1',
    title: t('How DNS resolution works', 'Comment fonctionne la résolution DNS'),
    minutes: 13,
    objectives: [
      t('Follow a recursive resolution from root to authoritative server', 'Suivre une résolution récursive de la racine au serveur faisant autorité'),
      t('Explain caching and TTL', 'Expliquer le cache et le TTL'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('The Internet’s phone book', 'L’annuaire d’Internet'),
        body: t('DNS (Domain Name System) translates names (**www.netlab.io**) into IP addresses. It is a **hierarchy**: the root (.), top-level domains (.com, .fr, .io), domains (netlab.io) and hosts (www). No single server knows everything — each knows who to ask next.', 'Le DNS (Domain Name System) traduit les noms (**www.netlab.io**) en adresses IP. C’est une **hiérarchie** : la racine (.), les domaines de premier niveau (.com, .fr, .io), les domaines (netlab.io) et les hôtes (www). Aucun serveur ne sait tout — chacun sait à qui demander ensuite.'),
      },
      { type: 'animation', anim: 'dns-resolve', title: t('Resolving www.netlab.io', 'Résoudre www.netlab.io') },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which server holds the actual A record for www.netlab.io?', 'Quel serveur détient vraiment l’enregistrement A de www.netlab.io ?'),
          options: [t('Root server', 'Serveur racine'), t('.io TLD server', 'Serveur TLD .io'), t('The authoritative server for netlab.io', 'Le serveur faisant autorité pour netlab.io'), t('Your PC', 'Votre PC')],
          answer: 2,
          explain: t('Root and TLD servers only point the way.', 'La racine et le TLD indiquent seulement le chemin.'),
        },
      },
      {
        type: 'text',
        title: t('Caches everywhere', 'Des caches partout'),
        body: t('Answers are cached by the browser, by Windows (`ipconfig /displaydns`) and by the resolver, for the record’s **TTL** (e.g. 3600 s). That is why DNS changes take time to "propagate" and why `ipconfig /flushdns` sometimes fixes a stale answer.', 'Les réponses sont mises en cache par le navigateur, par Windows (`ipconfig /displaydns`) et par le résolveur, pendant le **TTL** de l’enregistrement (ex. 3600 s). D’où le temps de « propagation » des changements DNS, et pourquoi `ipconfig /flushdns` corrige parfois une réponse périmée.'),
      },
      {
        type: 'example',
        title: t('nslookup', 'nslookup'),
        body: t('`nslookup` asks your DNS server directly and shows WHICH server answered — essential to know whether the problem is the name or the server.', '`nslookup` interroge directement votre serveur DNS et montre QUEL serveur a répondu — indispensable pour savoir si le problème vient du nom ou du serveur.'),
        code: 'C:\\> nslookup www.netlab.io\nServer:  dc01.corp.local\nAddress:  10.10.99.10\n\nNon-authoritative answer:\nName:    www.netlab.io\nAddress:  75.2.60.5\n\nC:\\> nslookup www.netlab.io 8.8.8.8     ← ask a specific server',
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Clear the Windows DNS cache.', 'Videz le cache DNS de Windows.'),
          accept: ['ipconfig /flushdns'],
          explain: 'ipconfig /flushdns',
          shell: 'C:\\>',
        },
      },
    ],
    vocabulary: [
      { term: t('Resolver', 'Résolveur'), def: t('DNS server that does the lookups for clients (recursive).', 'Serveur DNS qui fait les recherches pour les clients (récursif).') },
      { term: t('Authoritative server', 'Serveur faisant autorité'), def: t('Server that holds the zone and gives definitive answers.', 'Serveur qui détient la zone et donne les réponses définitives.') },
      { term: 'TTL', def: t('How long an answer may be cached.', 'Durée de mise en cache d’une réponse.') },
      { term: 'FQDN', def: t('Fully Qualified Domain Name, e.g. www.netlab.io.', 'Nom de domaine complet, ex. www.netlab.io.') },
    ],
    practice: t('Before a planned DNS change (moving a website to a new server), lower the record’s TTL to 300 s a day in advance so the switch-over is fast.', 'Avant un changement DNS planifié (déplacement d’un site), baissez le TTL de l’enregistrement à 300 s la veille pour une bascule rapide.'),
    quiz: [
      { kind: 'mcq', prompt: t('Top of the DNS hierarchy?', 'Sommet de la hiérarchie DNS ?'), options: ['.com', t('The root (.)', 'La racine (.)'), 'www', 'localhost'], answer: 1, explain: t('Root.', 'Racine.') },
      { kind: 'tf', prompt: t('DNS answers can be cached for the record’s TTL.', 'Les réponses DNS peuvent être mises en cache pendant le TTL.'), answer: true, explain: t('Yes.', 'Oui.') },
      { kind: 'command', prompt: t('Look up google.com using server 1.1.1.1.', 'Résolvez google.com en interrogeant 1.1.1.1.'), accept: ['nslookup google.com 1.1.1.1'], explain: 'nslookup google.com 1.1.1.1', shell: 'C:\\>' },
      { kind: 'mcq', prompt: t('DNS normally uses…', 'Le DNS utilise normalement…'), options: ['TCP 80', 'UDP 53', 'UDP 67', 'TCP 22'], answer: 1, explain: 'UDP 53.' },
    ],
  },
  {
    id: 'l2-dns.2',
    title: t('DNS records and zones', 'Enregistrements et zones DNS'),
    minutes: 12,
    objectives: [
      t('Recognise A, AAAA, CNAME, MX, PTR, NS, TXT and SRV records', 'Reconnaître les enregistrements A, AAAA, CNAME, MX, PTR, NS, TXT et SRV'),
      t('Explain forward and reverse zones and internal DNS', 'Expliquer zones directes, inverses et DNS interne'),
    ],
    blocks: [
      {
        type: 'table',
        head: [t('Record', 'Enregistrement'), t('Purpose', 'Rôle'), t('Example', 'Exemple')],
        rows: [
          ['A', t('Name → IPv4', 'Nom → IPv4'), 'www → 75.2.60.5'],
          ['AAAA', t('Name → IPv6', 'Nom → IPv6'), 'www → 2001:db8::5'],
          ['CNAME', t('Alias → another name', 'Alias → autre nom'), 'intranet → web01.corp.local'],
          ['MX', t('Mail server for the domain', 'Serveur mail du domaine'), 'netlab.io → 10 mail.netlab.io'],
          ['PTR', t('IP → name (reverse)', 'IP → nom (inverse)'), '5.60.2.75.in-addr.arpa → www'],
          ['NS', t('Name servers of the zone', 'Serveurs de noms de la zone'), 'netlab.io → ns1.netlab.io'],
          ['TXT', t('Free text: SPF, domain verification', 'Texte libre : SPF, vérification'), '"v=spf1 include:_spf.google.com ~all"'],
          ['SRV', t('Locate a service', 'Localiser un service'), '_ldap._tcp.corp.local → dc01'],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Emails to @netlab.io are not delivered. Which record do you check first?', 'Les e-mails vers @netlab.io ne sont pas livrés. Quel enregistrement vérifier d’abord ?'),
          options: ['A', 'MX', 'PTR', 'CNAME'],
          answer: 1,
          explain: t('MX tells senders where to deliver mail.', 'MX indique où livrer le courrier.'),
        },
      },
      {
        type: 'text',
        title: t('Internal DNS and Active Directory', 'DNS interne et Active Directory'),
        body: t('Companies run their own DNS (usually on the domain controllers) for an internal zone such as **corp.local**: fs01.corp.local, printers, intranet. Active Directory **cannot work without DNS** — PCs find domain controllers through SRV records. Requests for public names are **forwarded** to the ISP or a public resolver.', 'Les entreprises font tourner leur propre DNS (souvent sur les contrôleurs de domaine) pour une zone interne comme **corp.local** : fs01.corp.local, imprimantes, intranet. Active Directory **ne peut pas fonctionner sans DNS** — les PC trouvent les contrôleurs via des enregistrements SRV. Les noms publics sont **redirigés** vers le FAI ou un résolveur public.'),
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Never give domain PCs a public DNS', 'Ne donnez jamais un DNS public aux PC du domaine'),
        body: t('Setting 8.8.8.8 on a domain PC "to fix the internet" breaks logon, group policies and every internal name — Google does not know corp.local. Fix the internal DNS server instead.', 'Mettre 8.8.8.8 sur un PC du domaine « pour réparer internet » casse l’ouverture de session, les GPO et tous les noms internes — Google ne connaît pas corp.local. Réparez plutôt le DNS interne.'),
      },
      {
        type: 'example',
        title: t('Querying specific records', 'Interroger des enregistrements précis'),
        body: t('Windows: `nslookup -type=mx netlab.io`, PowerShell: `Resolve-DnsName netlab.io -Type MX`. Linux/macOS: `dig netlab.io MX`.', 'Windows : `nslookup -type=mx netlab.io`, PowerShell : `Resolve-DnsName netlab.io -Type MX`. Linux/macOS : `dig netlab.io MX`.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which record turns an IP address back into a name?', 'Quel enregistrement retransforme une IP en nom ?'),
          options: ['A', 'PTR', 'MX', 'TXT'],
          answer: 1,
          explain: t('PTR, in the reverse zone.', 'PTR, dans la zone inverse.'),
        },
      },
    ],
    vocabulary: [
      { term: t('Zone', 'Zone'), def: t('Portion of the namespace managed by a server.', 'Portion de l’espace de noms gérée par un serveur.') },
      { term: t('Forwarder', 'Redirecteur'), def: t('Upstream server that receives queries the local DNS cannot answer.', 'Serveur amont qui reçoit les requêtes que le DNS local ne sait pas résoudre.') },
      { term: t('Reverse zone', 'Zone inverse'), def: t('Zone holding PTR records (IP → name).', 'Zone contenant les enregistrements PTR (IP → nom).') },
    ],
    practice: t('When a website "doesn’t work for some users", compare `nslookup site` from a working and a broken PC: different answers usually mean different DNS servers (check DHCP option 006).', 'Quand un site « ne marche pas pour certains », comparez `nslookup site` depuis un PC qui marche et un qui ne marche pas : des réponses différentes = des DNS différents (vérifiez l’option DHCP 006).'),
    quiz: [
      { kind: 'mcq', prompt: t('An alias pointing to another name is a…', 'Un alias pointant vers un autre nom est un…'), options: ['A', 'CNAME', 'NS', 'SRV'], answer: 1, explain: 'CNAME.' },
      { kind: 'mcq', prompt: t('Active Directory clients find domain controllers with…', 'Les clients AD trouvent les contrôleurs de domaine grâce aux…'), options: [t('MX records', 'MX'), t('SRV records', 'SRV'), t('TXT records', 'TXT'), t('DHCP', 'DHCP')], answer: 1, explain: 'SRV.' },
      { kind: 'tf', prompt: t('Setting 8.8.8.8 as DNS on a domain-joined PC is a good fix.', 'Mettre 8.8.8.8 comme DNS sur un PC du domaine est une bonne solution.'), answer: false, explain: t('Internal names and AD stop working.', 'Les noms internes et AD cessent de fonctionner.') },
      { kind: 'mcq', prompt: t('IPv6 address record?', 'Enregistrement d’adresse IPv6 ?'), options: ['A', 'AAAA', 'A6', 'IPV6'], answer: 1, explain: 'AAAA.' },
    ],
  },
  {
    id: 'l2-dns.3',
    title: t('Troubleshooting DNS', 'Dépanner le DNS'),
    minutes: 11,
    objectives: [
      t('Prove whether a problem is DNS in under a minute', 'Prouver en moins d’une minute si un problème vient du DNS'),
      t('Fix common DNS faults', 'Corriger les pannes DNS courantes'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('The one-minute DNS test', 'Le test DNS en une minute'),
        body: t('1. `ping 8.8.8.8` → works? The network is fine.\n2. `ping google.com` → fails? **Name resolution** is the problem.\n3. `nslookup google.com` → timeout = the DNS server is unreachable or its service stopped; "Non-existent domain" = the record does not exist (or wrong server).\n4. `ipconfig /all` → is the DNS server the right one?', '1. `ping 8.8.8.8` → ça marche ? Le réseau va bien.\n2. `ping google.com` → échec ? Le problème est la **résolution de noms**.\n3. `nslookup google.com` → délai dépassé = serveur DNS injoignable ou service arrêté ; « Non-existent domain » = l’enregistrement n’existe pas (ou mauvais serveur).\n4. `ipconfig /all` → le serveur DNS est-il le bon ?'),
      },
      { type: 'animation', anim: 'ts-method', title: t('Bottom-up troubleshooting ladder', 'L’échelle de dépannage de bas en haut') },
      {
        type: 'table',
        head: [t('Message', 'Message'), t('Meaning', 'Signification')],
        rows: [
          ['DNS request timed out', t('Server not answering (down, service stopped, firewall, wrong IP)', 'Le serveur ne répond pas (arrêté, service stoppé, pare-feu, mauvaise IP)')],
          ["Non-existent domain / NXDOMAIN", t('Server answered: this name does not exist', 'Le serveur a répondu : ce nom n’existe pas')],
          ['DNS_PROBE_FINISHED_NXDOMAIN', t('Browser version of the above', 'Version navigateur du précédent')],
          [t('Works by IP, not by name', 'Marche par IP, pas par nom'), t('Classic DNS issue', 'Problème DNS classique')],
          [t('Old IP returned after a change', 'Ancienne IP renvoyée après un changement'), t('Cached answer — wait for TTL or flush caches', 'Réponse en cache — attendre le TTL ou vider les caches')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('ping 8.8.8.8 works, ping google.com fails, nslookup times out. Most likely?', 'ping 8.8.8.8 marche, ping google.com échoue, nslookup expire. Cause probable ?'),
          options: [t('Broken cable', 'Câble cassé'), t('DNS server down or unreachable', 'Serveur DNS en panne ou injoignable'), t('Wrong subnet mask', 'Mauvais masque'), t('Google is down', 'Google est en panne')],
          answer: 1,
          explain: t('Network fine, resolver not answering.', 'Réseau OK, résolveur muet.'),
        },
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('"It’s always DNS"', '« C’est toujours le DNS »'),
        body: t('A famous sysadmin joke — because DNS failures look like everything else: "the internet is down", "I can’t log in", "Outlook won’t connect". Test names vs IPs early in every investigation.', 'Une blague célèbre d’administrateurs — parce que les pannes DNS ressemblent à tout le reste : « internet est cassé », « je ne peux pas me connecter », « Outlook ne se connecte pas ». Testez noms vs IP tôt dans chaque enquête.'),
      },
    ],
    vocabulary: [
      { term: 'NXDOMAIN', def: t('DNS answer: the name does not exist.', 'Réponse DNS : le nom n’existe pas.') },
      { term: 'ipconfig /displaydns', def: t('Shows the Windows DNS cache.', 'Affiche le cache DNS de Windows.') },
    ],
    practice: t('Play the simulator incident "DNS resolution fails" — it is exactly this lesson under time pressure.', 'Jouez l’incident « La résolution DNS échoue » du simulateur — c’est exactement cette leçon sous la pression du temps.'),
    quiz: [
      { kind: 'mcq', prompt: t('"Non-existent domain" means…', '« Non-existent domain » signifie…'), options: [t('The server did not answer', 'Le serveur n’a pas répondu'), t('The server answered: no such name', 'Le serveur a répondu : nom inexistant'), t('The cable is cut', 'Le câble est coupé'), t('Wrong gateway', 'Mauvaise passerelle')], answer: 1, explain: 'NXDOMAIN.' },
      { kind: 'tf', prompt: t('If a site works by IP but not by name, DNS is the suspect.', 'Si un site marche par IP mais pas par nom, le DNS est suspect.'), answer: true, explain: t('Yes.', 'Oui.') },
      { kind: 'command', prompt: t('Show the DNS cache on Windows.', 'Affichez le cache DNS sous Windows.'), accept: ['ipconfig /displaydns'], explain: 'ipconfig /displaydns', shell: 'C:\\>' },
    ],
  },
]

export const natLessons: Lesson[] = [
  {
    id: 'l2-nat.1',
    title: t('NAT and PAT', 'NAT et PAT'),
    minutes: 12,
    objectives: [
      t('Explain why NAT exists and how PAT shares one public IP', 'Expliquer pourquoi le NAT existe et comment le PAT partage une IP publique'),
      t('Read a NAT translation table', 'Lire une table de traduction NAT'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Many private addresses, one public address', 'Beaucoup d’adresses privées, une adresse publique'),
        body: t('Private addresses (10.x, 172.16–31.x, 192.168.x) are not routed on the Internet. **NAT** (Network Address Translation) on the edge router or firewall replaces the private source address with a public one on the way out, and translates replies back on the way in. **PAT** (Port Address Translation, "NAT overload") also changes the **source port**, so thousands of devices share **one** public IP.', 'Les adresses privées (10.x, 172.16–31.x, 192.168.x) ne sont pas routées sur Internet. Le **NAT** (traduction d’adresses) sur le routeur ou pare-feu de bordure remplace l’adresse source privée par une publique en sortie, et retraduit les réponses en entrée. Le **PAT** (traduction de ports, « NAT overload ») change aussi le **port source** : des milliers d’appareils partagent **une seule** IP publique.'),
      },
      { type: 'animation', anim: 'nat-pat', title: t('PAT: two PCs share one public address', 'PAT : deux PC partagent une adresse publique') },
      {
        type: 'table',
        head: [t('Term', 'Terme'), t('Meaning', 'Signification'), t('Example', 'Exemple')],
        rows: [
          ['Inside local', t('Private address of the internal host', 'Adresse privée de l’hôte interne'), '192.168.1.10'],
          ['Inside global', t('Public address representing it', 'Adresse publique qui le représente'), '203.0.113.5'],
          ['Outside global', t('Address of the remote server', 'Adresse du serveur distant'), '142.250.74.46'],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('How can 300 PCs share one public IP at the same time?', 'Comment 300 PC partagent-ils une IP publique en même temps ?'),
          options: [t('Each gets a different source port (PAT)', 'Chacun reçoit un port source différent (PAT)'), t('They take turns', 'Ils se relaient'), t('With IPv6 only', 'Avec IPv6 seulement'), t('Using VLANs', 'Grâce aux VLAN')],
          answer: 0,
          explain: t('PAT tracks connections by port.', 'Le PAT suit les connexions par port.'),
        },
      },
      {
        type: 'callout',
        tone: 'info',
        title: t('NAT is not a firewall — but helps', 'Le NAT n’est pas un pare-feu — mais il aide'),
        body: t('Because there is no translation entry for unsolicited incoming traffic, the Internet cannot start connections to inside hosts. That is a side effect, not real security: always keep a proper firewall policy.', 'Comme aucune entrée de traduction n’existe pour le trafic entrant non sollicité, Internet ne peut pas initier de connexion vers les hôtes internes. C’est un effet de bord, pas une vraie sécurité : gardez toujours une politique de pare-feu.'),
      },
      {
        type: 'check',
        question: {
          kind: 'tf',
          prompt: t('In PAT, replies are matched to the right PC using the translated port.', 'En PAT, les réponses sont associées au bon PC grâce au port traduit.'),
          answer: true,
          explain: t('That is the role of the translation table.', 'C’est le rôle de la table de traduction.'),
        },
      },
    ],
    vocabulary: [
      { term: 'NAT', def: t('Rewrites IP addresses at the network edge.', 'Réécrit les adresses IP en bordure de réseau.') },
      { term: 'PAT', def: t('NAT that also rewrites ports so many hosts share one IP.', 'NAT qui réécrit aussi les ports pour partager une IP.') },
      { term: 'Inside / outside', def: t('Interfaces facing the LAN / the Internet.', 'Interfaces côté LAN / côté Internet.') },
    ],
    practice: t('Your home box does PAT: every device at home appears on the Internet with the same public IP (check on whatismyip.com from two devices).', 'Votre box fait du PAT : tous vos appareils apparaissent sur Internet avec la même IP publique (vérifiez sur whatismyip.com depuis deux appareils).'),
    quiz: [
      { kind: 'mcq', prompt: t('The private address of an internal PC is called…', 'L’adresse privée d’un PC interne s’appelle…'), options: ['Inside local', 'Inside global', 'Outside local', 'Outside global'], answer: 0, explain: 'Inside local.' },
      { kind: 'tf', prompt: t('PAT is also called NAT overload.', 'Le PAT s’appelle aussi NAT overload.'), answer: true, explain: t('Yes.', 'Oui.') },
      { kind: 'mcq', prompt: t('Why do companies use NAT?', 'Pourquoi les entreprises utilisent-elles le NAT ?'), options: [t('Shortage of public IPv4 addresses', 'Pénurie d’adresses IPv4 publiques'), t('To speed up Wi-Fi', 'Pour accélérer le Wi-Fi'), t('To replace DNS', 'Pour remplacer le DNS'), t('To create VLANs', 'Pour créer des VLAN')], answer: 0, explain: t('IPv4 exhaustion.', 'Épuisement IPv4.') },
    ],
  },
  {
    id: 'l2-nat.2',
    title: t('Configuring NAT and port forwarding', 'Configurer le NAT et la redirection de ports'),
    minutes: 13,
    objectives: [
      t('Configure PAT on a Cisco router', 'Configurer le PAT sur un routeur Cisco'),
      t('Publish an internal server with static NAT / port forwarding', 'Publier un serveur interne avec NAT statique / redirection de port'),
    ],
    blocks: [
      {
        type: 'example',
        title: t('PAT on the edge router', 'PAT sur le routeur de bordure'),
        body: t('Mark interfaces inside/outside, define which internal addresses may be translated with an ACL, then overload the outside interface.', 'Marquez les interfaces inside/outside, définissez avec une ACL quelles adresses internes peuvent être traduites, puis surchargez l’interface extérieure.'),
        code: 'R1(config)# interface g0/0/1\nR1(config-if)# ip nat inside\nR1(config-if)# interface g0/0/0\nR1(config-if)# ip nat outside\nR1(config-if)# exit\nR1(config)# access-list 1 permit 192.168.0.0 0.0.255.255\nR1(config)# ip nat inside source list 1 interface g0/0/0 overload\nR1# show ip nat translations',
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Mark the current interface as the NAT inside interface.', 'Marquez l’interface courante comme interface NAT intérieure.'),
          accept: ['ip nat inside'],
          explain: 'ip nat inside',
          shell: 'R1(config-if)#',
        },
      },
      {
        type: 'text',
        title: t('Letting the Internet in: port forwarding', 'Laisser entrer Internet : la redirection de port'),
        body: t('To publish an internal web server, create a **static** translation: "traffic arriving on public IP 203.0.113.5 port 443 goes to 192.168.1.50 port 443". On a firewall this is usually called a **DNAT** or **port forward** rule — and it must be paired with an **allow** rule. Better practice: put published servers in a **DMZ**.', 'Pour publier un serveur web interne, créez une traduction **statique** : « le trafic arrivant sur l’IP publique 203.0.113.5 port 443 va vers 192.168.1.50 port 443 ». Sur un pare-feu, on parle de **DNAT** ou **redirection de port** — à associer à une règle **d’autorisation**. Meilleure pratique : placez les serveurs publiés en **DMZ**.'),
      },
      {
        type: 'code',
        code: 'R1(config)# ip nat inside source static tcp 192.168.1.50 443 203.0.113.5 443',
        caption: t('Static PAT entry: public 443 → internal server 443.', 'Entrée PAT statique : 443 public → 443 du serveur interne.'),
      },
      {
        type: 'table',
        head: [t('Problem', 'Problème'), t('Check', 'Vérification')],
        rows: [
          [t('No internet, translations table empty', 'Pas d’internet, table de traduction vide'), t('ip nat inside/outside on the right interfaces? ACL matches the LAN?', 'ip nat inside/outside sur les bonnes interfaces ? L’ACL couvre le LAN ?')],
          [t('Published server unreachable from outside', 'Serveur publié injoignable de l’extérieur'), t('Static NAT entry + firewall allow rule + server listening', 'Entrée NAT statique + règle d’autorisation + serveur à l’écoute')],
          [t('Works from outside, not from inside by public name', 'Marche de l’extérieur, pas de l’intérieur avec le nom public'), t('Hairpin NAT or split DNS needed', 'NAT en épingle ou DNS séparé nécessaire')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Show active NAT translations.', 'Afficher les traductions NAT actives.'),
          accept: ['show ip nat translations', 'sh ip nat translations', 'sh ip nat tr'],
          explain: 'show ip nat translations',
          shell: 'R1#',
        },
      },
    ],
    vocabulary: [
      { term: t('Static NAT', 'NAT statique'), def: t('Permanent one-to-one mapping (used to publish servers).', 'Correspondance permanente un-pour-un (pour publier des serveurs).') },
      { term: t('Port forwarding', 'Redirection de port'), def: t('Public port mapped to an internal host and port.', 'Port public associé à un hôte et un port internes.') },
      { term: 'DMZ', def: t('Separate zone for servers reachable from the Internet.', 'Zone séparée pour les serveurs accessibles depuis Internet.') },
    ],
    practice: t('In the simulator, Meridian’s shop lives in a DMZ behind FW-EDGE. The incident "A firewall blocks an important service" shows how translation + firewall rules must work together.', 'Dans le simulateur, la boutique de Meridian est en DMZ derrière FW-EDGE. L’incident « Un pare-feu bloque un service important » montre comment traduction et règles de pare-feu doivent fonctionner ensemble.'),
    quiz: [
      { kind: 'mcq', prompt: t('Keyword that enables PAT on Cisco?', 'Mot-clé qui active le PAT sur Cisco ?'), options: ['static', 'overload', 'pool', 'dynamic'], answer: 1, explain: 'overload.' },
      { kind: 'tf', prompt: t('A port forward alone is enough; no firewall rule is needed.', 'Une redirection de port suffit ; aucune règle de pare-feu n’est nécessaire.'), answer: false, explain: t('Traffic must also be allowed.', 'Le trafic doit aussi être autorisé.') },
      { kind: 'mcq', prompt: t('Best place for a public web server?', 'Meilleur emplacement pour un serveur web public ?'), options: [t('Users’ VLAN', 'VLAN utilisateurs'), 'DMZ', t('Management VLAN', 'VLAN de gestion'), t('Behind a PC', 'Derrière un PC')], answer: 1, explain: 'DMZ.' },
    ],
  },
]
