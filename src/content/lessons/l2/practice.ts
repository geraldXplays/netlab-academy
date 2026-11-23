import { t, type Lesson } from '../types'

export const ptLessons: Lesson[] = [
  {
    id: 'l2-pt.1',
    title: t('Working in a network simulator', 'Travailler dans un simulateur réseau'),
    minutes: 11,
    objectives: [
      t('Build a topology: place devices, choose cables and ports', 'Construire une topologie : placer les équipements, choisir câbles et ports'),
      t('Read link lights and use the CLI and Desktop tabs', 'Lire les voyants de lien et utiliser les onglets CLI et Bureau'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Why simulate?', 'Pourquoi simuler ?'),
        body: t('Real switches and routers are expensive, and mistakes on a production network hurt people. Simulators such as **Cisco Packet Tracer** — and the browser simulator in NetLab’s **Labs** section, which works on Mac without installing anything — let you build, break and fix networks safely.', 'Les vrais switches et routeurs coûtent cher, et une erreur en production pénalise des gens. Les simulateurs comme **Cisco Packet Tracer** — et le simulateur intégré de la section **Labs** de NetLab, qui marche sur Mac sans rien installer — permettent de construire, casser et réparer sans risque.'),
      },
      { type: 'diagram', diagram: 'home-network', caption: t('A Packet Tracer-style topology: every device and cable has a meaning.', 'Une topologie façon Packet Tracer : chaque équipement et câble a un sens.') },
      {
        type: 'table',
        head: [t('Light', 'Voyant'), t('Meaning', 'Signification')],
        rows: [
          [t('Green triangle', 'Triangle vert'), t('Link up, forwarding', 'Lien actif, transmission')],
          [t('Orange', 'Orange'), t('Switch port learning (Spanning Tree, ~30 s) — wait', 'Port de switch en apprentissage (Spanning Tree, ~30 s) — patientez')],
          [t('Red', 'Rouge'), t('Down: cable missing, port shut down, wrong cable type', 'Inactif : câble absent, port coupé, mauvais type de câble')],
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('Cable rules', 'Règles de câblage'),
        body: t('**Straight-through** between different device types (PC ↔ switch, switch ↔ router). **Crossover** between same types (switch ↔ switch, PC ↔ PC, router ↔ PC). Modern hardware auto-detects (Auto-MDIX), but exams still ask.', '**Droit** entre types différents (PC ↔ switch, switch ↔ routeur). **Croisé** entre types identiques (switch ↔ switch, PC ↔ PC, routeur ↔ PC). Le matériel moderne détecte automatiquement (Auto-MDIX), mais les examens le demandent encore.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A router interface link shows red right after cabling. Most likely?', 'Le lien d’une interface de routeur est rouge juste après le câblage. Cause probable ?'),
          options: [t('Wrong IP', 'Mauvaise IP'), t('Router interfaces start shut down — needs no shutdown', 'Les interfaces de routeur démarrent coupées — il faut no shutdown'), t('DNS', 'DNS'), t('STP', 'STP')],
          answer: 1,
          explain: t('Unlike switch ports.', 'Contrairement aux ports de switch.'),
        },
      },
      {
        type: 'text',
        title: t('Device tabs', 'Les onglets des équipements'),
        body: t('**Physical**: the hardware, power, modules. **Config**: graphical settings (and it shows the equivalent IOS command — learn from it!). **CLI**: the real command line for switches and routers. **Desktop** (PCs): IP Configuration, Command Prompt, Web Browser.', '**Physique** : le matériel, l’alimentation, les modules. **Config** : réglages graphiques (avec la commande IOS équivalente — apprenez-la !). **CLI** : la vraie ligne de commande des switches et routeurs. **Bureau** (PC) : Configuration IP, Invite de commandes, Navigateur.'),
      },
    ],
    vocabulary: [
      { term: 'Packet Tracer', def: t('Cisco’s free network simulator (Windows/Linux/macOS, Cisco account needed).', 'Simulateur réseau gratuit de Cisco (Windows/Linux/macOS, compte Cisco requis).') },
      { term: 'Auto-MDIX', def: t('Port feature that adapts to straight or crossover cables.', 'Fonction de port qui s’adapte aux câbles droits ou croisés.') },
    ],
    practice: t('Open Labs → Free sandbox and rebuild the topology from the picture above: 1 router, 1 switch, 3 PCs. Configure it end to end.', 'Ouvrez Labs → Bac à sable et reconstruisez la topologie de l’image : 1 routeur, 1 switch, 3 PC. Configurez-la de bout en bout.'),
    quiz: [
      { kind: 'mcq', prompt: t('PC to switch uses…', 'PC vers switch utilise…'), options: [t('Straight-through', 'Câble droit'), t('Crossover', 'Câble croisé'), t('Console', 'Câble console'), t('Serial', 'Câble série')], answer: 0, explain: t('Different device types.', 'Types différents.') },
      { kind: 'mcq', prompt: t('An orange light on a new switch port means…', 'Un voyant orange sur un nouveau port de switch signifie…'), options: [t('Broken', 'Cassé'), t('Spanning Tree is still learning', 'Spanning Tree est encore en apprentissage'), t('Wrong VLAN', 'Mauvais VLAN'), t('Overheating', 'Surchauffe')], answer: 1, explain: t('Wait ~30 s or use PortFast.', 'Attendez ~30 s ou utilisez PortFast.') },
      { kind: 'tf', prompt: t('Switch-to-switch links traditionally use crossover cables.', 'Les liens switch-switch utilisent traditionnellement des câbles croisés.'), answer: true, explain: t('Same device type.', 'Même type d’équipement.') },
    ],
  },
  {
    id: 'l2-pt.2',
    title: t('Simulation mode: watching packets', 'Le mode simulation : observer les paquets'),
    minutes: 10,
    objectives: [
      t('Use simulation mode and simple PDUs to follow ARP and ICMP', 'Utiliser le mode simulation et les PDU simples pour suivre ARP et ICMP'),
      t('Read the event list to locate a failure', 'Lire la liste d’événements pour localiser une panne'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Real-time vs simulation', 'Temps réel vs simulation'),
        body: t('In **real-time** mode the network behaves instantly, like real life. In **simulation** mode, time stops: each packet becomes an envelope you can watch hop by hop, with the **event list** showing every frame (time, last device, at device, type). Click an envelope to see its OSI layers in and out.', 'En mode **temps réel**, le réseau réagit instantanément, comme dans la réalité. En mode **simulation**, le temps s’arrête : chaque paquet devient une enveloppe que l’on suit saut par saut, avec la **liste d’événements** qui montre chaque trame (temps, équipement précédent, équipement actuel, type). Cliquez une enveloppe pour voir ses couches OSI en entrée et en sortie.'),
      },
      {
        type: 'example',
        title: t('A first ping in simulation mode', 'Un premier ping en mode simulation'),
        body: t('1. Switch to **Simulation**.\n2. Use the **Add Simple PDU** tool: click PC-A, then PC-C.\n3. Press **Play** or **Capture / Forward**.\n4. You will first see **ARP** envelopes (broadcast to every port), then the **ICMP** echo request, then the echo reply.\n\nIn NetLab’s Labs simulator: tool "PDU", click the source then the destination, and switch the mode to Simulation.', '1. Passez en **Simulation**.\n2. Prenez l’outil **Ajouter une PDU simple** : cliquez PC-A, puis PC-C.\n3. Appuyez sur **Lecture** ou **Capturer / Avancer**.\n4. Vous verrez d’abord des enveloppes **ARP** (diffusées sur tous les ports), puis la requête **ICMP**, puis la réponse.\n\nDans le simulateur des Labs NetLab : outil « PDU », cliquez la source puis la destination, et passez en mode Simulation.'),
      },
      { type: 'animation', anim: 'arp', title: t('What you will see: ARP first, then ICMP', 'Ce que vous verrez : ARP d’abord, puis ICMP') },
      {
        type: 'callout',
        tone: 'tip',
        title: t('Finding the failing hop', 'Trouver le saut défaillant'),
        body: t('Where the envelope gets a **red ✕**, that device dropped it. Click it: the "OSI model" tab explains why (no route, ARP failure, ACL…). This is the fastest way to learn routing.', 'Là où l’enveloppe reçoit une **✕ rouge**, l’équipement l’a jetée. Cliquez-la : l’onglet « Modèle OSI » explique pourquoi (pas de route, échec ARP, ACL…). C’est la façon la plus rapide d’apprendre le routage.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('In simulation mode, the first packets of a ping to a new neighbour are…', 'En mode simulation, les premiers paquets d’un ping vers un nouveau voisin sont…'),
          options: ['DNS', 'ARP', 'DHCP', 'TCP'],
          answer: 1,
          explain: t('The PC must learn the MAC first.', 'Le PC doit d’abord apprendre la MAC.'),
        },
      },
    ],
    vocabulary: [
      { term: 'PDU', def: t('Protocol Data Unit — in Packet Tracer, a test packet (envelope).', 'Protocol Data Unit — dans Packet Tracer, un paquet de test (enveloppe).') },
      { term: t('Event list', 'Liste d’événements'), def: t('Chronological list of every frame in simulation mode.', 'Liste chronologique de chaque trame en mode simulation.') },
    ],
    practice: t('Run a simulation ping in Lab 2 (router between two LANs): count how many ARP exchanges happen before the first reply comes back (hint: two — one per LAN).', 'Faites un ping en simulation dans le Lab 2 (routeur entre deux LAN) : comptez combien d’échanges ARP ont lieu avant la première réponse (indice : deux — un par LAN).'),
    quiz: [
      { kind: 'tf', prompt: t('Simulation mode lets you follow a packet hop by hop.', 'Le mode simulation permet de suivre un paquet saut par saut.'), answer: true, explain: t('Yes.', 'Oui.') },
      { kind: 'mcq', prompt: t('A red ✕ on an envelope means…', 'Une ✕ rouge sur une enveloppe signifie…'), options: [t('Delivered', 'Livré'), t('Dropped at that device', 'Jeté par cet équipement'), t('Encrypted', 'Chiffré'), t('Duplicated', 'Dupliqué')], answer: 1, explain: t('Dropped.', 'Jeté.') },
    ],
  },
  {
    id: 'l2-pt.3',
    title: t('Project: a small office network from scratch', 'Projet : un petit réseau de bureau de A à Z'),
    minutes: 20,
    objectives: [
      t('Plan addressing, VLANs and services for a small office', 'Planifier adressage, VLAN et services d’un petit bureau'),
      t('Build and verify it in the simulator', 'Le construire et le vérifier dans le simulateur'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('The brief', 'Le cahier des charges'),
        body: t('A 20-person accounting firm: 12 staff PCs, 2 printers, 1 file server, guest Wi-Fi, Internet through one ISP link. You are the network technician.', 'Un cabinet comptable de 20 personnes : 12 PC, 2 imprimantes, 1 serveur de fichiers, Wi-Fi invités, Internet via un lien FAI. Vous êtes le technicien réseau.'),
      },
      {
        type: 'table',
        head: ['VLAN', t('Use', 'Usage'), t('Subnet', 'Sous-réseau'), t('Gateway', 'Passerelle'), 'DHCP'],
        rows: [
          ['10', t('Staff', 'Personnel'), '192.168.10.0/24', '.1', '.100–.200'],
          ['20', t('Servers & printers', 'Serveurs & imprimantes'), '192.168.20.0/24', '.1', t('reservations', 'réservations')],
          ['30', t('Guests', 'Invités'), '192.168.30.0/24', '.1', t('.10–.250, 4 h lease', '.10–.250, bail 4 h')],
          ['99', t('Management', 'Gestion'), '192.168.99.0/24', '.1', t('static', 'statique')],
        ],
      },
      {
        type: 'text',
        title: t('Build order', 'Ordre de construction'),
        body: t('1. Cable: router ↔ switch (trunk), PCs/printers/server ↔ switch (access).\n2. Switch: create VLANs 10/20/30/99, assign access ports, trunk to the router, management IP on VLAN 99, unused ports shut in a parking VLAN.\n3. Router: sub-interfaces .10 .20 .30 .99 with gateways, DHCP pools for VLAN 10 and 30, default route to the ISP, PAT.\n4. Server and printers: static IPs (or reservations) in VLAN 20.\n5. Test: ping gateways, ping across VLANs, ping the Internet, guest VLAN cannot reach VLAN 20 (an ACL, Level 5).', '1. Câblage : routeur ↔ switch (trunk), PC/imprimantes/serveur ↔ switch (accès).\n2. Switch : créer les VLAN 10/20/30/99, affecter les ports, trunk vers le routeur, IP de gestion sur le VLAN 99, ports inutilisés coupés dans un VLAN parking.\n3. Routeur : sous-interfaces .10 .20 .30 .99 avec passerelles, pools DHCP pour les VLAN 10 et 30, route par défaut vers le FAI, PAT.\n4. Serveur et imprimantes : IP fixes (ou réservations) dans le VLAN 20.\n5. Tests : ping des passerelles, ping entre VLAN, ping Internet, le VLAN invités n’atteint pas le VLAN 20 (une ACL, niveau 5).'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Why does the guest VLAN get a 4-hour lease?', 'Pourquoi le VLAN invités a-t-il un bail de 4 heures ?'),
          options: [t('Visitors come and go — long leases would exhaust the scope', 'Les visiteurs vont et viennent — des baux longs épuiseraient l’étendue'), t('Security encryption', 'Chiffrement de sécurité'), t('Faster Wi-Fi', 'Wi-Fi plus rapide'), t('Required by law', 'Obligation légale')],
          answer: 0,
          explain: t('Remember the DHCP exhaustion incident.', 'Souvenez-vous de l’incident d’épuisement DHCP.'),
        },
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Deliverables a client expects', 'Ce que le client attend'),
        body: t('A network diagram, the addressing/VLAN table above, the saved configurations, admin credentials stored in a password manager, and a short test report. That is what makes you look professional.', 'Un schéma réseau, le tableau d’adressage/VLAN ci-dessus, les configurations sauvegardées, les identifiants d’admin dans un gestionnaire de mots de passe, et un court rapport de tests. C’est ce qui fait de vous un pro.'),
      },
    ],
    vocabulary: [
      { term: t('As-built documentation', 'Documentation de réalisation'), def: t('Documents describing the network exactly as delivered.', 'Documents décrivant le réseau tel que livré.') },
    ],
    practice: t('Lab 6 "Small business infrastructure" in the Labs section is the graded version of this project — try it now.', 'Le Lab 6 « Infrastructure PME » de la section Labs est la version notée de ce projet — essayez-le maintenant.'),
    quiz: [
      { kind: 'mcq', prompt: t('Which link should be a trunk in this design?', 'Quel lien doit être un trunk dans ce schéma ?'), options: [t('Switch ↔ router', 'Switch ↔ routeur'), t('Switch ↔ PC', 'Switch ↔ PC'), t('Switch ↔ printer', 'Switch ↔ imprimante'), t('Router ↔ ISP', 'Routeur ↔ FAI')], answer: 0, explain: t('Router-on-a-stick carries all VLANs.', 'Le routeur sur un bâton transporte tous les VLAN.') },
      { kind: 'mcq', prompt: t('Where does the file server go?', 'Où va le serveur de fichiers ?'), options: ['VLAN 10', 'VLAN 20', 'VLAN 30', 'VLAN 99'], answer: 1, explain: t('Servers & printers VLAN.', 'VLAN serveurs & imprimantes.') },
      { kind: 'tf', prompt: t('Guests should be able to reach the file server.', 'Les invités doivent pouvoir atteindre le serveur de fichiers.'), answer: false, explain: t('Guests get Internet only.', 'Les invités n’ont qu’Internet.') },
    ],
  },
]

export const troubleshootLessons: Lesson[] = [
  {
    id: 'l2-troubleshoot.1',
    title: t('A troubleshooting method', 'Une méthode de dépannage'),
    minutes: 12,
    objectives: [
      t('Apply a structured, repeatable troubleshooting process', 'Appliquer un processus de dépannage structuré et reproductible'),
      t('Choose between bottom-up, top-down and divide-and-conquer', 'Choisir entre bas-haut, haut-bas et diviser pour régner'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Seven steps', 'Sept étapes'),
        body: t('1. **Identify** the problem — ask questions, reproduce it.\n2. **Establish** a theory of probable cause.\n3. **Test** the theory (if wrong, back to 2).\n4. **Plan** the fix and its impact.\n5. **Implement** — or escalate.\n6. **Verify** full functionality (and prevention).\n7. **Document** findings, actions and outcome.\n\nThis is the CompTIA method used by help desks worldwide.', '1. **Identifier** le problème — poser des questions, le reproduire.\n2. **Établir** une théorie de cause probable.\n3. **Tester** la théorie (si fausse, retour à 2).\n4. **Planifier** la correction et son impact.\n5. **Mettre en œuvre** — ou escalader.\n6. **Vérifier** le fonctionnement complet (et la prévention).\n7. **Documenter** constats, actions et résultat.\n\nC’est la méthode CompTIA utilisée par les services d’assistance du monde entier.'),
      },
      { type: 'animation', anim: 'ts-method', title: t('Bottom-up: each test cuts the problem in half', 'De bas en haut : chaque test coupe le problème en deux') },
      {
        type: 'table',
        head: [t('Approach', 'Approche'), t('Start at', 'Commencer par'), t('Best when', 'Idéal quand')],
        rows: [
          [t('Bottom-up', 'Bas-haut'), t('Layer 1 (cables, lights)', 'Couche 1 (câbles, voyants)'), t('Physical problems suspected, new installs', 'Problème physique suspecté, nouvelle installation')],
          [t('Top-down', 'Haut-bas'), t('The application', 'L’application'), t('One app fails, others work', 'Une appli échoue, les autres marchent')],
          [t('Divide and conquer', 'Diviser pour régner'), t('Layer 3 (ping)', 'Couche 3 (ping)'), t('Most cases — ping tells you which half to look at', 'La plupart des cas — le ping indique quelle moitié regarder')],
          [t('Follow the path', 'Suivre le chemin'), t('Source → destination', 'Source → destination'), t('Multi-hop problems (tracert)', 'Problèmes multi-sauts (tracert)')],
          [t('Compare', 'Comparer'), t('A working device', 'Un appareil qui marche'), t('"It works for my colleague"', '« Ça marche chez mon collègue »')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'order',
          prompt: t('Put the troubleshooting steps in order.', 'Remettez les étapes de dépannage dans l’ordre.'),
          items: [t('Identify the problem', 'Identifier le problème'), t('Establish a theory', 'Établir une théorie'), t('Test the theory', 'Tester la théorie'), t('Plan and implement the fix', 'Planifier et appliquer la correction'), t('Verify', 'Vérifier'), t('Document', 'Documenter')],
          explain: t('Identify → theory → test → fix → verify → document.', 'Identifier → théorie → test → correction → vérification → documentation.'),
        },
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('The questions to ask a user', 'Les questions à poser à l’utilisateur'),
        body: t('What exactly happens (error message, screenshot)? Since when? Did anything change (new device, update, password change, desk move)? Does it affect only you? Can you show me? — Half of all tickets are solved by these questions.', 'Que se passe-t-il exactement (message d’erreur, capture) ? Depuis quand ? Quelque chose a-t-il changé (nouvel appareil, mise à jour, changement de mot de passe, déménagement de bureau) ? Seul vous êtes touché ? Pouvez-vous me montrer ? — La moitié des tickets se règlent avec ces questions.'),
      },
    ],
    vocabulary: [
      { term: t('Escalation', 'Escalade'), def: t('Passing a ticket to a higher support level.', 'Transmission d’un ticket à un niveau de support supérieur.') },
      { term: t('Root cause', 'Cause racine'), def: t('The underlying reason, not just the symptom.', 'La raison profonde, pas seulement le symptôme.') },
    ],
    practice: t('Every incident in the IT Operations Simulator scores you on exactly this: evidence gathered, root cause, risky actions avoided, time.', 'Chaque incident du Simulateur d’exploitation IT vous note exactement là-dessus : preuves réunies, cause racine, actions risquées évitées, temps.'),
    quiz: [
      { kind: 'mcq', prompt: t('Only Outlook fails; web and files work. Best approach?', 'Seul Outlook échoue ; web et fichiers marchent. Meilleure approche ?'), options: [t('Bottom-up', 'Bas-haut'), t('Top-down', 'Haut-bas'), t('Replace the cable', 'Changer le câble'), t('Reboot the switch', 'Redémarrer le switch')], answer: 1, explain: t('Lower layers are proven working.', 'Les couches basses sont prouvées.') },
      { kind: 'tf', prompt: t('Documenting is optional when the fix worked.', 'Documenter est facultatif si la correction a marché.'), answer: false, explain: t('Documentation prevents the next outage.', 'La documentation évite la prochaine panne.') },
      { kind: 'mcq', prompt: t('First step of the method?', 'Première étape de la méthode ?'), options: [t('Reboot', 'Redémarrer'), t('Identify the problem', 'Identifier le problème'), t('Call the vendor', 'Appeler le fournisseur'), t('Replace hardware', 'Remplacer le matériel')], answer: 1, explain: t('Identify.', 'Identifier.') },
    ],
  },
  {
    id: 'l2-troubleshoot.2',
    title: t('The technician’s toolbox', 'La boîte à outils du technicien'),
    minutes: 13,
    objectives: [
      t('Choose the right command for each layer', 'Choisir la bonne commande pour chaque couche'),
      t('Interpret ping, tracert, nslookup and netstat output', 'Interpréter les sorties de ping, tracert, nslookup et netstat'),
    ],
    blocks: [
      {
        type: 'table',
        head: [t('Layer', 'Couche'), 'Windows', 'Linux', 'Cisco IOS'],
        rows: [
          ['1–2', 'Get-NetAdapter', 'ip link, ethtool eth0', 'show interfaces status'],
          [t('2 (MAC)', '2 (MAC)'), 'arp -a', 'ip neigh', 'show mac address-table'],
          [t('3 config', '3 config'), 'ipconfig /all', 'ip a, ip r', 'show ip interface brief'],
          [t('3 reachability', '3 joignabilité'), 'ping, tracert, pathping', 'ping, traceroute, mtr', 'ping, traceroute'],
          [t('3 routing', '3 routage'), 'route print', 'ip route', 'show ip route'],
          ['4', 'netstat -an, Test-NetConnection', 'ss -tulpn, nc -zv', 'show ip sockets'],
          ['7 (DNS)', 'nslookup, Resolve-DnsName', 'dig, host', 'nslookup'],
        ],
      },
      {
        type: 'example',
        title: t('Reading ping like a detective', 'Lire un ping comme un détective'),
        body: t('Each output tells a different story.', 'Chaque sortie raconte une histoire différente.'),
        code: 'Reply from 10.0.0.5: bytes=32 time=1ms TTL=128   → OK (TTL 128 = Windows, 64 = Linux)\nRequest timed out.                               → no reply: down, firewall, or no return route\nReply from 10.0.0.1: Destination host unreachable → the ROUTER 10.0.0.1 has no route / ARP failed\nPING: transmit failed. General failure.          → this PC has no valid IP / no link\nTTL expired in transit.                          → routing loop',
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('"Reply from 192.168.1.1: Destination host unreachable" — who is the problem?', '« Reply from 192.168.1.1: Destination host unreachable » — où est le problème ?'),
          options: [t('My PC has no IP', 'Mon PC n’a pas d’IP'), t('The router 192.168.1.1 cannot reach the destination', 'Le routeur 192.168.1.1 ne joint pas la destination'), t('DNS', 'DNS'), t('All fine', 'Tout va bien')],
          answer: 1,
          explain: t('The gateway answered — so the local part works; it has no way further.', 'La passerelle a répondu — la partie locale marche ; elle n’a pas de chemin plus loin.'),
        },
      },
      {
        type: 'text',
        title: t('Capture when commands are not enough', 'Capturer quand les commandes ne suffisent pas'),
        body: t('**Wireshark** (or `tcpdump` on Linux) shows the actual packets. Filters you will use daily: `arp`, `dhcp` (or `bootp`), `dns`, `icmp`, `tcp.port == 443`, `ip.addr == 10.0.0.5`. A capture ends arguments: "the server never answered the SYN" is a fact.', '**Wireshark** (ou `tcpdump` sous Linux) montre les vrais paquets. Filtres du quotidien : `arp`, `dhcp` (ou `bootp`), `dns`, `icmp`, `tcp.port == 443`, `ip.addr == 10.0.0.5`. Une capture clôt les débats : « le serveur n’a jamais répondu au SYN » est un fait.'),
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('PowerShell: test TCP port 443 on crm.corp.local.', 'PowerShell : testez le port TCP 443 de crm.corp.local.'),
          accept: ['Test-NetConnection crm.corp.local -Port 443', 'tnc crm.corp.local -Port 443', 'test-netconnection crm.corp.local -port 443'],
          explain: 'Test-NetConnection crm.corp.local -Port 443',
          shell: 'PS C:\\>',
        },
      },
    ],
    vocabulary: [
      { term: 'pathping', def: t('Windows: tracert + packet loss per hop.', 'Windows : tracert + pertes par saut.') },
      { term: 'tcpdump', def: t('Command-line packet capture on Linux.', 'Capture de paquets en ligne de commande sous Linux.') },
    ],
    practice: t('Keep a personal "cheat sheet" text file with these commands and the outputs you meet. After a few months, you will rarely need it — but you will love it in your first weeks.', 'Gardez un fichier « antisèche » avec ces commandes et les sorties rencontrées. Au bout de quelques mois, vous en aurez rarement besoin — mais il vous sauvera les premières semaines.'),
    quiz: [
      { kind: 'mcq', prompt: t('"TTL expired in transit" indicates…', '« TTL expired in transit » indique…'), options: [t('A routing loop', 'Une boucle de routage'), t('A DNS failure', 'Une panne DNS'), t('A bad cable', 'Un mauvais câble'), t('Success', 'Un succès')], answer: 0, explain: t('Loop.', 'Boucle.') },
      { kind: 'mcq', prompt: t('Linux equivalent of ipconfig?', 'Équivalent Linux d’ipconfig ?'), options: ['ifconfig only', 'ip a', 'netstat', 'route'], answer: 1, explain: t('ip a (ip addr).', 'ip a (ip addr).') },
      { kind: 'mcq', prompt: t('A reply with TTL=64 most likely came from…', 'Une réponse avec TTL=64 vient probablement de…'), options: ['Windows', 'Linux / macOS', 'Cisco router', 'Printer'], answer: 1, explain: t('Linux and macOS start at 64.', 'Linux et macOS partent de 64.') },
    ],
  },
  {
    id: 'l2-troubleshoot.3',
    title: t('Case studies: classic network faults', 'Études de cas : pannes réseau classiques'),
    minutes: 15,
    objectives: [
      t('Recognise the signature of the ten most common faults', 'Reconnaître la signature des dix pannes les plus courantes'),
    ],
    blocks: [
      {
        type: 'table',
        head: [t('Symptom', 'Symptôme'), t('Signature', 'Signature'), t('Fix', 'Correction')],
        rows: [
          [t('One PC, no network', 'Un PC, pas de réseau'), t('Media disconnected / port err-disabled', 'Média déconnecté / port err-disabled'), t('Cable, port, port security', 'Câble, port, port security')],
          [t('New PC, no network', 'Nouveau PC, pas de réseau'), t('169.254.x.x, neighbours OK', '169.254.x.x, voisins OK'), t('Port in wrong VLAN', 'Port dans le mauvais VLAN')],
          [t('Whole department down', 'Tout un service en panne'), t('All 169.254, uplink down', 'Tous en 169.254, lien montant coupé'), t('Uplink / trunk / helper', 'Lien montant / trunk / helper')],
          [t('Only new arrivals fail', 'Seuls les nouveaux échouent'), t('169.254 on recent devices', '169.254 sur les appareils récents'), t('DHCP scope exhausted', 'Étendue DHCP épuisée')],
          [t('Local OK, nothing remote', 'Local OK, rien à distance'), t('Can ping gateway only', 'Ping passerelle seulement'), t('Wrong gateway / missing route', 'Mauvaise passerelle / route manquante')],
          [t('IP works, names fail', 'L’IP marche, pas les noms'), t('nslookup timeout', 'nslookup expire'), t('DNS server / option 006', 'Serveur DNS / option 006')],
          [t('Internet down for all', 'Internet coupé pour tous'), t('tracert stops at edge', 'tracert s’arrête en bordure'), t('Default route / ISP / NAT', 'Route par défaut / FAI / NAT')],
          [t('One app fails', 'Une appli échoue'), t('Ping OK, port test fails', 'Ping OK, test de port en échec'), t('Service / firewall rule', 'Service / règle de pare-feu')],
          [t('Slow, intermittent', 'Lent, intermittent'), t('Errors/duplex mismatch on port', 'Erreurs/duplex incohérent sur le port'), t('Check interface counters', 'Vérifier les compteurs d’interface')],
          [t('Network melts down', 'Le réseau s’effondre'), t('All switch LEDs flashing, CPU 100%', 'Tous les voyants clignotent, CPU 100 %'), t('Loop — STP / BPDU guard', 'Boucle — STP / BPDU guard')],
        ],
      },
      {
        type: 'example',
        title: t('Case: "The printer stopped working after the weekend"', 'Cas : « L’imprimante ne marche plus après le week-end »'),
        body: t('Clue 1: other users print fine. Clue 2: the printer’s screen shows 192.168.10.137. Clue 3: in the print server, the port is set to 192.168.10.120. **Diagnosis**: the printer took a new DHCP lease after a power cut. **Fix**: DHCP reservation for the printer’s MAC (or use its hostname). **Prevention**: reserve addresses for every printer.', 'Indice 1 : les autres impriment. Indice 2 : l’écran de l’imprimante affiche 192.168.10.137. Indice 3 : sur le serveur d’impression, le port pointe vers 192.168.10.120. **Diagnostic** : l’imprimante a pris un nouveau bail DHCP après une coupure de courant. **Correction** : réservation DHCP pour sa MAC (ou utiliser son nom). **Prévention** : réserver une adresse à chaque imprimante.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A switch’s port LEDs all blink frantically and the network is unusable. First suspect?', 'Tous les voyants d’un switch clignotent frénétiquement et le réseau est inutilisable. Premier suspect ?'),
          options: [t('A layer 2 loop', 'Une boucle de couche 2'), t('DNS', 'DNS'), t('DHCP lease too long', 'Bail DHCP trop long'), t('Expired password', 'Mot de passe expiré')],
          answer: 0,
          explain: t('Broadcast storm — someone cabled two wall sockets together, or STP is off.', 'Tempête de diffusion — quelqu’un a relié deux prises murales, ou STP est désactivé.'),
        },
      },
      {
        type: 'example',
        title: t('Case: "Wi-Fi works in the meeting room but not the Teams calls"', 'Cas : « Le Wi-Fi marche en salle de réunion mais pas les appels Teams »'),
        body: t('Web pages load (TCP), but calls drop (UDP, real-time). `ping -t` to the gateway shows times jumping from 2 ms to 300 ms → **latency/jitter** on a congested access point. Fix: move users to 5 GHz, add an AP, or apply QoS for voice.', 'Les pages se chargent (TCP), mais les appels coupent (UDP, temps réel). `ping -t` vers la passerelle montre des temps qui sautent de 2 ms à 300 ms → **latence/gigue** sur une borne saturée. Correction : basculer en 5 GHz, ajouter une borne, ou appliquer une QoS pour la voix.'),
      },
    ],
    vocabulary: [
      { term: t('Jitter', 'Gigue'), def: t('Variation in latency; kills real-time voice/video.', 'Variation de latence ; fatale pour la voix/vidéo.') },
      { term: t('Duplex mismatch', 'Duplex incohérent'), def: t('One end full-duplex, the other half — slow with errors.', 'Un bout en full-duplex, l’autre en half — lent avec erreurs.') },
    ],
    practice: t('Print this table. In your first job, you will meet every line of it within a year.', 'Imprimez ce tableau. Dans votre premier poste, vous rencontrerez chaque ligne en moins d’un an.'),
    quiz: [
      { kind: 'mcq', prompt: t('Only devices that joined today get 169.254. Likely cause?', 'Seuls les appareils arrivés aujourd’hui ont 169.254. Cause probable ?'), options: [t('Scope exhausted', 'Étendue épuisée'), t('DNS', 'DNS'), t('Router down', 'Routeur en panne'), t('STP', 'STP')], answer: 0, explain: t('Old devices still hold leases.', 'Les anciens appareils gardent leurs baux.') },
      { kind: 'mcq', prompt: t('Ping OK, application fails. Next test?', 'Ping OK, l’appli échoue. Test suivant ?'), options: [t('Port test (Test-NetConnection)', 'Test de port (Test-NetConnection)'), t('Replace cable', 'Changer le câble'), 'ipconfig /release', t('Reboot switch', 'Redémarrer le switch')], answer: 0, explain: t('Layer 4.', 'Couche 4.') },
    ],
  },
  {
    id: 'l2-troubleshoot.4',
    title: t('Documenting, escalating and preventing', 'Documenter, escalader et prévenir'),
    minutes: 10,
    objectives: [
      t('Write a clear ticket update and incident report', 'Rédiger une mise à jour de ticket et un rapport d’incident clairs'),
      t('Know when and how to escalate', 'Savoir quand et comment escalader'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('A good ticket update', 'Une bonne mise à jour de ticket'),
        body: t('Write so that someone who was not there understands in 30 seconds: **symptom**, **scope** (who is affected), **what you tested and the result**, **current hypothesis**, **next step**. Avoid "doesn’t work" — say what fails and how you know.', 'Écrivez pour qu’un absent comprenne en 30 secondes : **symptôme**, **périmètre** (qui est touché), **ce que vous avez testé et le résultat**, **hypothèse actuelle**, **prochaine étape**. Évitez « ça ne marche pas » — dites ce qui échoue et comment vous le savez.'),
      },
      {
        type: 'code',
        code: 'INC-4528  P2  Sales: new devices get no IP\n09:02  Scope: SAL-PC3 + SAL-LAPTOP (others OK). Both show 169.254.x.x.\n09:05  DC01: scope 10.10.20.0 100 % in use (Get-DhcpServerv4ScopeStatistics),\n       49 leases belong to guest devices from Friday’s trade show (8-day lease).\n09:08  Fix: EndRange → .220, lease → 1 day. Both PCs renewed OK, S: drive OK.\n09:10  Follow-up REQ-1203: separate guest VLAN + scope (4 h lease). Closing.',
        caption: t('Short, factual, timestamped — anyone can continue from here.', 'Court, factuel, horodaté — n’importe qui peut reprendre à partir d’ici.'),
      },
      {
        type: 'table',
        head: [t('Escalate when…', 'Escaladez quand…'), t('Include', 'Incluez')],
        rows: [
          [t('You lack the access or the skill', 'Vous n’avez pas les droits ou la compétence'), t('Everything you tested', 'Tout ce que vous avez testé')],
          [t('The fix carries risk (core device, production hours)', 'La correction comporte un risque (équipement cœur, heures de production)'), t('Impact and urgency', 'Impact et urgence')],
          [t('The SLA time is running out', 'Le délai du SLA s’épuise'), t('Logs / screenshots', 'Journaux / captures')],
          [t('Security is involved (suspicious device, malware)', 'La sécurité est en jeu (appareil suspect, malware)'), t('Do not touch evidence', 'Ne touchez pas aux preuves')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which ticket note is the most useful?', 'Quelle note de ticket est la plus utile ?'),
          options: [
            t('"Network broken, rebooted stuff"', '« Réseau cassé, j’ai redémarré des trucs »'),
            t('"Admin VLAN: all PCs 169.254; SW-ADMIN Gi0/1 admin down since 07:58 (show logging); re-enabled + saved; verified"', '« VLAN Admin : tous les PC en 169.254 ; SW-ADMIN Gi0/1 coupé depuis 07:58 (show logging) ; réactivé + sauvegardé ; vérifié »'),
            t('"Fixed"', '« Réparé »'),
            t('"User error"', '« Erreur utilisateur »'),
          ],
          answer: 1,
          explain: t('Facts, evidence, action, verification.', 'Faits, preuves, action, vérification.'),
        },
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Prevention is the real win', 'La prévention, c’est la vraie victoire'),
        body: t('After the fire is out, ask "how do we stop this happening again?": monitoring alerts, a change process, port descriptions, saved configs, reservations, a second DNS server. Senior engineers are measured by the incidents that never happen.', 'Une fois l’incendie éteint, demandez « comment éviter que ça recommence ? » : alertes de supervision, processus de changement, descriptions de ports, configs sauvegardées, réservations, second serveur DNS. Les ingénieurs seniors se mesurent aux incidents qui n’arrivent jamais.'),
      },
    ],
    vocabulary: [
      { term: 'SLA', def: t('Service Level Agreement — agreed response/resolution times.', 'Accord de niveau de service — délais de réponse/résolution convenus.') },
      { term: t('Post-mortem', 'Post-mortem'), def: t('Blameless review after a major incident.', 'Revue sans recherche de coupable après un incident majeur.') },
    ],
    practice: t('Each simulator incident ends with a report built from exactly these sections. Write your own resolution notes there before you read the official report.', 'Chaque incident du simulateur se termine par un rapport construit sur ces sections. Rédigez vos notes de résolution avant de lire le rapport officiel.'),
    quiz: [
      { kind: 'tf', prompt: t('A good ticket update lists what you tested, even if it did not help.', 'Une bonne mise à jour liste ce que vous avez testé, même sans résultat.'), answer: true, explain: t('It saves the next person from repeating it.', 'Cela évite au suivant de le refaire.') },
      { kind: 'mcq', prompt: t('You find a suspicious device on the network. You should…', 'Vous trouvez un appareil suspect sur le réseau. Vous devez…'), options: [t('Wipe it immediately', 'L’effacer immédiatement'), t('Escalate to security and preserve evidence', 'Escalader à la sécurité et préserver les preuves'), t('Ignore it', 'L’ignorer'), t('Post on social media', 'Publier sur les réseaux sociaux')], answer: 1, explain: t('Security incidents follow their own process.', 'Les incidents de sécurité suivent leur propre processus.') },
    ],
  },
]
