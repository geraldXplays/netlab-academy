import { t, type Lesson } from '../types'

export const osiLessons: Lesson[] = [
  {
    id: 'l2-osi.1',
    title: t('The OSI model: 7 layers', 'Le modèle OSI : 7 couches'),
    minutes: 14,
    objectives: [
      t('Explain why networking is split into layers', 'Expliquer pourquoi le réseau est découpé en couches'),
      t('Name the 7 OSI layers in order and what each one does', 'Nommer les 7 couches OSI dans l’ordre et leur rôle'),
      t('Use the model to locate a problem ("it’s a layer 1 issue")', 'Utiliser le modèle pour situer une panne (« c’est un problème de couche 1 »)'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Why layers?', 'Pourquoi des couches ?'),
        body: t(
          'Sending a web page from a server in Virginia to your laptop involves cables, Wi-Fi, addresses, routes, error checking and a browser. Nobody could design all of that as one block. So engineers split the job into **layers**: each layer solves one problem and only talks to the layer just above and just below it.\n\nThe benefit is huge: a Wi-Fi card maker does not care about HTTP, and a web developer does not care whether you use fibre or copper. You can **change one layer without breaking the others**.',
          'Envoyer une page web d’un serveur en Virginie jusqu’à votre portable implique câbles, Wi-Fi, adresses, routes, contrôle d’erreurs et navigateur. Personne ne pourrait concevoir tout cela d’un bloc. Les ingénieurs ont donc découpé le travail en **couches** : chaque couche résout un problème et ne dialogue qu’avec la couche juste au-dessus et juste en dessous.\n\nL’avantage est énorme : un fabricant de carte Wi-Fi ne se soucie pas de HTTP, et un développeur web se moque de savoir si vous êtes en fibre ou en cuivre. On peut **changer une couche sans casser les autres**.',
        ),
      },
      {
        type: 'table',
        head: [t('Layer', 'Couche'), t('Job', 'Rôle'), t('Examples', 'Exemples'), 'PDU'],
        rows: [
          [t('7 Application', '7 Application'), t('Network services for programs', 'Services réseau pour les programmes'), 'HTTP, DNS, SMTP, SSH', t('Data', 'Données')],
          [t('6 Presentation', '6 Présentation'), t('Format, encryption, compression', 'Format, chiffrement, compression'), 'TLS, JPEG, UTF-8', t('Data', 'Données')],
          [t('5 Session', '5 Session'), t('Open, manage and close dialogues', 'Ouvrir, gérer, fermer les dialogues'), 'RPC, NetBIOS', t('Data', 'Données')],
          [t('4 Transport', '4 Transport'), t('End-to-end delivery between programs (ports)', 'Livraison de bout en bout entre programmes (ports)'), 'TCP, UDP', 'Segment'],
          [t('3 Network', '3 Réseau'), t('Logical addressing and routing between networks', 'Adressage logique et routage entre réseaux'), 'IP, ICMP, routers', t('Packet', 'Paquet')],
          [t('2 Data link', '2 Liaison'), t('Delivery on the local network (MAC), error detection', 'Livraison sur le réseau local (MAC), détection d’erreurs'), 'Ethernet, Wi-Fi, switches', t('Frame', 'Trame')],
          [t('1 Physical', '1 Physique'), t('Bits as signals: voltage, light, radio', 'Bits sous forme de signaux : tension, lumière, ondes'), t('Cables, connectors, hubs', 'Câbles, connecteurs, hubs'), 'Bits'],
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('Memorise them', 'Les mémoriser'),
        body: t('From layer 1 up: **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way (Physical, Data link, Network, Transport, Session, Presentation, Application).', 'De la couche 1 vers le haut : **P**our **L**e **R**éseau **T**out **S**e **P**asse **A**utomatiquement (Physique, Liaison, Réseau, Transport, Session, Présentation, Application).'),
      },
      { type: 'animation', anim: 'osi-encap', title: t('A web request travels down and up the layers', 'Une requête web descend puis remonte les couches') },
      {
        type: 'text',
        title: t('Encapsulation: envelopes inside envelopes', 'Encapsulation : des enveloppes dans des enveloppes'),
        body: t(
          'On the way **down**, each layer wraps what it received with its own **header** — like putting a letter in an envelope, then in a parcel, then on a truck. This is **encapsulation**. On the way **up**, the receiver removes each header in reverse: **decapsulation**.\n\nEach layer on the sender talks "virtually" to the **same layer** on the receiver: TCP talks to TCP, IP to IP. The headers are their messages to each other.',
          'En **descendant**, chaque couche enveloppe ce qu’elle reçoit avec son propre **en-tête** — comme une lettre dans une enveloppe, puis dans un colis, puis dans un camion. C’est l’**encapsulation**. En **remontant**, le récepteur retire chaque en-tête dans l’ordre inverse : la **désencapsulation**.\n\nChaque couche de l’émetteur dialogue « virtuellement » avec la **même couche** du récepteur : TCP avec TCP, IP avec IP. Les en-têtes sont leurs messages.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'order',
          prompt: t('Put the PDUs in the order they are built when sending (top to bottom).', 'Remettez les PDU dans l’ordre de construction à l’envoi (de haut en bas).'),
          items: [t('Data', 'Données'), 'Segment', t('Packet', 'Paquet'), t('Frame', 'Trame'), 'Bits'],
          explain: t('Data → segment (L4) → packet (L3) → frame (L2) → bits (L1).', 'Données → segment (C4) → paquet (C3) → trame (C2) → bits (C1).'),
        },
      },
      {
        type: 'example',
        title: t('Troubleshooting bottom-up', 'Dépanner de bas en haut'),
        body: t(
          'A user says "the internet is down". A technician who knows OSI checks in order:\n\n1. **L1** — Is the cable plugged in? Link light on? Wi-Fi connected?\n2. **L2** — Is the switch port up and in the right VLAN?\n3. **L3** — Does the PC have a valid IP? Can it ping the gateway?\n4. **L4–7** — Is DNS answering? Is the web service running?\n\nSaying "it’s a layer 2 problem" instantly tells your colleagues where to look.',
          'Un utilisateur dit « internet ne marche pas ». Un technicien qui connaît OSI vérifie dans l’ordre :\n\n1. **C1** — Le câble est-il branché ? Voyant allumé ? Wi-Fi connecté ?\n2. **C2** — Le port du switch est-il actif et dans le bon VLAN ?\n3. **C3** — Le PC a-t-il une IP valide ? Peut-il pinguer la passerelle ?\n4. **C4–7** — Le DNS répond-il ? Le service web tourne-t-il ?\n\nDire « c’est un problème de couche 2 » indique tout de suite à vos collègues où chercher.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A switch forwards traffic using MAC addresses. At which layer does it mainly work?', 'Un switch transmet le trafic grâce aux adresses MAC. À quelle couche travaille-t-il principalement ?'),
          options: [t('Layer 1', 'Couche 1'), t('Layer 2', 'Couche 2'), t('Layer 3', 'Couche 3'), t('Layer 7', 'Couche 7')],
          answer: 1,
          explain: t('MAC addresses and frames are layer 2 (data link).', 'Les adresses MAC et les trames sont de couche 2 (liaison).'),
        },
      },
    ],
    vocabulary: [
      { term: 'OSI', def: t('Open Systems Interconnection — a 7-layer reference model.', 'Open Systems Interconnection — modèle de référence en 7 couches.') },
      { term: 'PDU', def: t('Protocol Data Unit — the name of the data at each layer.', 'Protocol Data Unit — nom de la donnée à chaque couche.') },
      { term: t('Encapsulation', 'Encapsulation'), def: t('Adding a header (and sometimes a trailer) at each layer.', 'Ajout d’un en-tête (et parfois d’une fin) à chaque couche.') },
      { term: t('Header', 'En-tête'), def: t('Control information placed in front of the data.', 'Informations de contrôle placées devant la donnée.') },
    ],
    practice: t(
      'When you escalate a ticket, write which layer you have already verified: "L1/L2 OK (link up, correct VLAN), L3 fails: no DHCP lease." Senior engineers will love you.',
      'Quand vous escaladez un ticket, écrivez les couches déjà vérifiées : « C1/C2 OK (lien actif, bon VLAN), C3 en échec : pas de bail DHCP. » Les ingénieurs seniors vous adoreront.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Which layer adds source and destination IP addresses?', 'Quelle couche ajoute les adresses IP source et destination ?'), options: [t('Transport', 'Transport'), t('Network', 'Réseau'), t('Data link', 'Liaison'), t('Session', 'Session')], answer: 1, explain: t('IP is a layer 3 (network) protocol.', 'IP est un protocole de couche 3 (réseau).') },
      { kind: 'mcq', prompt: t('A frame is the PDU of layer…', 'La trame est la PDU de la couche…'), options: ['1', '2', '3', '4'], answer: 1, explain: t('Layer 2, data link.', 'Couche 2, liaison.') },
      { kind: 'tf', prompt: t('TLS encryption is usually placed at the presentation layer in the OSI model.', 'Le chiffrement TLS est généralement placé à la couche présentation du modèle OSI.'), answer: true, explain: t('Encryption and formatting are presentation-layer jobs.', 'Chiffrement et mise en forme relèvent de la présentation.') },
      { kind: 'mcq', prompt: t('A broken network cable is a problem at layer…', 'Un câble réseau cassé est un problème de couche…'), options: ['1', '3', '4', '7'], answer: 0, explain: t('Physical.', 'Physique.') },
      { kind: 'order', prompt: t('Order the OSI layers from 1 to 7.', 'Classez les couches OSI de 1 à 7.'), items: [t('Physical', 'Physique'), t('Data link', 'Liaison'), t('Network', 'Réseau'), 'Transport', 'Session', t('Presentation', 'Présentation'), 'Application'], explain: t('Please Do Not Throw Sausage Pizza Away.', 'Pour Le Réseau Tout Se Passe Automatiquement.') },
      { kind: 'mcq', prompt: t('What does the receiver do with headers?', 'Que fait le récepteur des en-têtes ?'), options: [t('Adds more', 'Il en ajoute'), t('Removes them layer by layer (decapsulation)', 'Il les retire couche par couche (désencapsulation)'), t('Sends them back', 'Il les renvoie'), t('Ignores them', 'Il les ignore')], answer: 1, explain: t('Decapsulation.', 'Désencapsulation.') },
    ],
  },
  {
    id: 'l2-osi.2',
    title: t('The TCP/IP model in real life', 'Le modèle TCP/IP en pratique'),
    minutes: 12,
    objectives: [
      t('Map the 4 TCP/IP layers to the 7 OSI layers', 'Faire correspondre les 4 couches TCP/IP aux 7 couches OSI'),
      t('Place common protocols on the right layer', 'Placer les protocoles courants sur la bonne couche'),
      t('Read the structure of an Ethernet frame and IP packet', 'Lire la structure d’une trame Ethernet et d’un paquet IP'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('OSI is the map, TCP/IP is the territory', 'OSI est la carte, TCP/IP le territoire'),
        body: t(
          'OSI is a **reference** model used to teach and to talk about problems. The Internet actually runs on the **TCP/IP** model, which merges some layers:\n\n- **Application** (OSI 5-6-7): HTTP, DNS, DHCP, SMTP, SSH…\n- **Transport** (OSI 4): TCP and UDP\n- **Internet** (OSI 3): IP, ICMP, ARP sits between 2 and 3\n- **Network access / Link** (OSI 1-2): Ethernet, Wi-Fi\n\nIn day-to-day work people still say "layer 2" and "layer 3" using OSI numbers — even when they work with TCP/IP.',
          'OSI est un modèle de **référence** pour enseigner et parler des pannes. Internet fonctionne réellement avec le modèle **TCP/IP**, qui fusionne certaines couches :\n\n- **Application** (OSI 5-6-7) : HTTP, DNS, DHCP, SMTP, SSH…\n- **Transport** (OSI 4) : TCP et UDP\n- **Internet** (OSI 3) : IP, ICMP ; ARP se situe entre 2 et 3\n- **Accès réseau / Liaison** (OSI 1-2) : Ethernet, Wi-Fi\n\nAu quotidien, on dit toujours « couche 2 » ou « couche 3 » avec les numéros OSI — même en travaillant avec TCP/IP.',
        ),
      },
      {
        type: 'table',
        head: [t('Protocol', 'Protocole'), t('Layer (OSI)', 'Couche (OSI)'), t('Port', 'Port'), t('What it does', 'Rôle')],
        rows: [
          ['HTTP / HTTPS', '7', '80 / 443', t('Web pages', 'Pages web')],
          ['DNS', '7', '53', t('Names → IP addresses', 'Noms → adresses IP')],
          ['DHCP', '7', '67 / 68', t('Automatic IP configuration', 'Configuration IP automatique')],
          ['SSH', '7', '22', t('Secure remote shell', 'Terminal distant sécurisé')],
          ['SMB', '7', '445', t('Windows file shares', 'Partages de fichiers Windows')],
          ['RDP', '7', '3389', t('Remote desktop', 'Bureau à distance')],
          ['TCP / UDP', '4', '—', t('Transport between programs', 'Transport entre programmes')],
          ['IP / ICMP', '3', '—', t('Addressing, routing, ping', 'Adressage, routage, ping')],
          ['ARP', '2–3', '—', t('IP → MAC on the local network', 'IP → MAC sur le réseau local')],
          ['Ethernet / Wi-Fi', '1–2', '—', t('Local delivery', 'Livraison locale')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which TCP/IP layer corresponds to OSI layers 5, 6 and 7?', 'Quelle couche TCP/IP correspond aux couches OSI 5, 6 et 7 ?'),
          options: ['Application', 'Transport', 'Internet', t('Network access', 'Accès réseau')],
          answer: 0,
          explain: t('TCP/IP folds session and presentation into the application layer.', 'TCP/IP regroupe session et présentation dans la couche application.'),
        },
      },
      {
        type: 'example',
        title: t('Inside a real frame', 'L’intérieur d’une vraie trame'),
        body: t(
          'This is what a capture tool like **Wireshark** shows for one HTTP request. Read it from the outside in: Ethernet (L2) carries IP (L3), which carries TCP (L4), which carries HTTP (L7).',
          'Voici ce qu’un outil de capture comme **Wireshark** affiche pour une requête HTTP. Lisez de l’extérieur vers l’intérieur : Ethernet (C2) transporte IP (C3), qui transporte TCP (C4), qui transporte HTTP (C7).',
        ),
        code: 'Frame 42: 534 bytes on wire\nEthernet II, Src: a4:5e:60:11:22:33, Dst: 00:1a:2b:3c:4d:5e\nInternet Protocol Version 4, Src: 192.168.1.10, Dst: 93.184.216.34, TTL: 128\nTransmission Control Protocol, Src Port: 49152, Dst Port: 80, Seq: 1, Ack: 1\nHypertext Transfer Protocol\n    GET / HTTP/1.1\n    Host: example.com',
      },
      {
        type: 'text',
        title: t('Key header fields', 'Champs d’en-tête essentiels'),
        body: t(
          '- **Ethernet**: destination MAC, source MAC, type (0x0800 = IPv4), and at the end the **FCS** checksum.\n- **IPv4**: version, **TTL** (decreases by 1 at each router — stops packets looping forever), protocol (6 = TCP, 17 = UDP, 1 = ICMP), source IP, destination IP.\n- **TCP**: source port, destination port, sequence and acknowledgement numbers, flags (SYN, ACK, FIN, RST).',
          '- **Ethernet** : MAC destination, MAC source, type (0x0800 = IPv4), et à la fin le contrôle **FCS**.\n- **IPv4** : version, **TTL** (diminue de 1 à chaque routeur — empêche les paquets de tourner en boucle), protocole (6 = TCP, 17 = UDP, 1 = ICMP), IP source, IP destination.\n- **TCP** : port source, port destination, numéros de séquence et d’acquittement, drapeaux (SYN, ACK, FIN, RST).',
        ),
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Where the MAC addresses change', 'Où les adresses MAC changent'),
        body: t('When a packet crosses a router, the **IP addresses stay the same** end to end, but the **Ethernet header is rebuilt** on each link: new source and destination MAC for each hop. IP = the final address on the parcel; MAC = the next delivery van.', 'Quand un paquet traverse un routeur, les **adresses IP restent identiques** de bout en bout, mais l’**en-tête Ethernet est reconstruit** sur chaque lien : nouvelles MAC source et destination à chaque saut. IP = l’adresse finale sur le colis ; MAC = la prochaine camionnette de livraison.'),
      },
      {
        type: 'check',
        question: {
          kind: 'tf',
          prompt: t('When a packet crosses three routers, its destination IP address changes three times.', 'Quand un paquet traverse trois routeurs, son IP de destination change trois fois.'),
          answer: false,
          explain: t('IPs stay the same end to end (without NAT); only the layer 2 header is rewritten per hop.', 'Les IP restent identiques de bout en bout (sans NAT) ; seul l’en-tête de couche 2 est réécrit à chaque saut.'),
        },
      },
    ],
    vocabulary: [
      { term: 'TCP/IP', def: t('The 4-layer protocol suite the Internet runs on.', 'La suite de protocoles en 4 couches d’Internet.') },
      { term: 'TTL', def: t('Time To Live — hop counter in the IP header.', 'Time To Live — compteur de sauts dans l’en-tête IP.') },
      { term: 'FCS', def: t('Frame Check Sequence — error-detection checksum at the end of a frame.', 'Frame Check Sequence — somme de contrôle en fin de trame.') },
      { term: 'Wireshark', def: t('Free tool that captures and decodes network traffic.', 'Outil gratuit qui capture et décode le trafic réseau.') },
    ],
    practice: t('Install Wireshark on your own computer, start a capture, open a website and filter with "http or dns". Click a packet and expand each layer — you will see exactly the encapsulation from this lesson.', 'Installez Wireshark sur votre ordinateur, lancez une capture, ouvrez un site et filtrez avec « http or dns ». Cliquez un paquet et dépliez chaque couche — vous verrez exactement l’encapsulation de cette leçon.'),
    quiz: [
      { kind: 'mcq', prompt: t('How many layers does the TCP/IP model have?', 'Combien de couches compte le modèle TCP/IP ?'), options: ['3', '4', '5', '7'], answer: 1, explain: t('Application, Transport, Internet, Network access.', 'Application, Transport, Internet, Accès réseau.') },
      { kind: 'mcq', prompt: t('HTTPS uses TCP port…', 'HTTPS utilise le port TCP…'), options: ['80', '22', '443', '53'], answer: 2, explain: '443.' },
      { kind: 'input', prompt: t('Which port does SSH use?', 'Quel port utilise SSH ?'), accept: ['22'], explain: t('SSH listens on TCP 22.', 'SSH écoute sur TCP 22.') },
      { kind: 'mcq', prompt: t('What is the purpose of the TTL field?', 'À quoi sert le champ TTL ?'), options: [t('Encrypt the packet', 'Chiffrer le paquet'), t('Prevent endless routing loops', 'Empêcher les boucles de routage infinies'), t('Store the MAC address', 'Stocker la MAC'), t('Choose the port', 'Choisir le port')], answer: 1, explain: t('Each router decrements it; at 0 the packet is dropped.', 'Chaque routeur le décrémente ; à 0 le paquet est détruit.') },
      { kind: 'tf', prompt: t('The FCS lets the receiver detect a corrupted frame.', 'Le FCS permet au récepteur de détecter une trame corrompue.'), answer: true, explain: t('Corrupted frames are discarded.', 'Les trames corrompues sont jetées.') },
    ],
  },
  {
    id: 'l2-osi.3',
    title: t('Transport layer: TCP, UDP and ports', 'Couche transport : TCP, UDP et ports'),
    minutes: 13,
    objectives: [
      t('Compare TCP and UDP and pick the right one', 'Comparer TCP et UDP et choisir le bon'),
      t('Explain the TCP three-way handshake', 'Expliquer la poignée de main TCP en trois temps'),
      t('Understand ports and sockets; list connections with netstat', 'Comprendre ports et sockets ; lister les connexions avec netstat'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Many programs, one address', 'Plusieurs programmes, une adresse'),
        body: t(
          'Your PC has one IP address but runs a browser, Teams, Spotify and Outlook at the same time. How does an incoming packet find the right program? With **ports**: 16-bit numbers (0–65535) at layer 4.\n\n- **Well-known ports** 0–1023: servers (80 HTTP, 443 HTTPS, 22 SSH, 53 DNS).\n- **Registered** 1024–49151: applications (3389 RDP, 3306 MySQL).\n- **Dynamic / ephemeral** 49152–65535: picked randomly by clients for each connection.\n\nIP address + port = a **socket**, e.g. `192.168.1.10:49152 → 93.184.216.34:443`.',
          'Votre PC a une seule adresse IP mais fait tourner en même temps un navigateur, Teams, Spotify et Outlook. Comment un paquet entrant trouve-t-il le bon programme ? Grâce aux **ports** : des nombres de 16 bits (0–65535) en couche 4.\n\n- **Ports bien connus** 0–1023 : serveurs (80 HTTP, 443 HTTPS, 22 SSH, 53 DNS).\n- **Enregistrés** 1024–49151 : applications (3389 RDP, 3306 MySQL).\n- **Dynamiques / éphémères** 49152–65535 : choisis au hasard par les clients pour chaque connexion.\n\nAdresse IP + port = un **socket**, ex. `192.168.1.10:49152 → 93.184.216.34:443`.',
        ),
      },
      { type: 'animation', anim: 'tcp-handshake', title: t('TCP: handshake, data, close', 'TCP : poignée de main, données, fermeture') },
      {
        type: 'table',
        head: ['', 'TCP', 'UDP'],
        rows: [
          [t('Connection', 'Connexion'), t('Yes (handshake)', 'Oui (poignée de main)'), t('No', 'Non')],
          [t('Reliability', 'Fiabilité'), t('Acknowledgements, re-sends lost data', 'Acquittements, renvoi des pertes'), t('Best effort — no guarantee', 'Au mieux — aucune garantie')],
          [t('Order', 'Ordre'), t('Delivered in order', 'Livré dans l’ordre'), t('May arrive out of order', 'Peut arriver dans le désordre')],
          [t('Speed / overhead', 'Vitesse / surcoût'), t('Slower, bigger header (20 B)', 'Plus lent, en-tête plus gros (20 o)'), t('Fast, tiny header (8 B)', 'Rapide, petit en-tête (8 o)')],
          [t('Used by', 'Utilisé par'), 'HTTP(S), SSH, SMB, email', 'DNS, DHCP, VoIP, video, games'],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A live video call should use…', 'Un appel vidéo en direct devrait utiliser…'),
          options: ['TCP', 'UDP'],
          answer: 1,
          explain: t('A late video frame is useless — better to skip it than wait for a re-send. UDP.', 'Une image vidéo en retard est inutile — mieux vaut la sauter qu’attendre un renvoi. UDP.'),
        },
      },
      {
        type: 'example',
        title: t('See your connections', 'Voir vos connexions'),
        body: t('On Windows, `netstat -an` lists every socket. `LISTENING` = a server waiting; `ESTABLISHED` = an open TCP connection. Add `-b` (as admin) to see which program owns it. On Linux use `ss -tulpn`.', 'Sous Windows, `netstat -an` liste tous les sockets. `LISTENING` = un serveur qui attend ; `ESTABLISHED` = une connexion TCP ouverte. Ajoutez `-b` (en admin) pour voir le programme. Sous Linux, utilisez `ss -tulpn`.'),
        code: 'C:\\> netstat -an\n  Proto  Local Address          Foreign Address        State\n  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING\n  TCP    192.168.1.10:49152     93.184.216.34:443      ESTABLISHED\n  TCP    192.168.1.10:49160     10.10.99.20:445        ESTABLISHED\n  UDP    0.0.0.0:5353           *:*',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Troubleshooting tip', 'Astuce de dépannage'),
        body: t('"Ping works but the application does not" usually means layer 3 is fine and the problem is layer 4+: the service is not listening, or a firewall blocks the **port**. Test the port directly: `Test-NetConnection server -Port 443` (PowerShell) or `nc -zv server 443` (Linux).', '« Le ping marche mais pas l’application » signifie souvent que la couche 3 va bien et que le problème est en couche 4+ : le service n’écoute pas, ou un pare-feu bloque le **port**. Testez le port directement : `Test-NetConnection serveur -Port 443` (PowerShell) ou `nc -zv serveur 443` (Linux).'),
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Which Windows command lists active connections and listening ports (numeric form)?', 'Quelle commande Windows liste les connexions et ports en écoute (forme numérique) ?'),
          accept: ['netstat -an', 'netstat -na', 'netstat -ano'],
          explain: t('netstat -an', 'netstat -an'),
          shell: 'C:\\>',
        },
      },
    ],
    vocabulary: [
      { term: 'Port', def: t('Number identifying a program/service at layer 4.', 'Nombre identifiant un programme/service en couche 4.') },
      { term: 'Socket', def: t('IP address + port + protocol.', 'Adresse IP + port + protocole.') },
      { term: 'SYN / ACK / FIN', def: t('TCP flags to open, acknowledge and close.', 'Drapeaux TCP pour ouvrir, acquitter et fermer.') },
      { term: t('Ephemeral port', 'Port éphémère'), def: t('Temporary client-side port (49152+).', 'Port client temporaire (49152+).') },
    ],
    practice: t('When a firewall request lands on your desk ("open access to the CRM"), you need three things: source, destination IP, and destination port/protocol (e.g. TCP 443). That is layer 3 + layer 4.', 'Quand une demande d’ouverture pare-feu arrive (« ouvrir l’accès au CRM »), il vous faut trois choses : source, IP de destination, et port/protocole de destination (ex. TCP 443). C’est la couche 3 + la couche 4.'),
    quiz: [
      { kind: 'mcq', prompt: t('The TCP handshake is…', 'La poignée de main TCP est…'), options: ['SYN, ACK, FIN', 'SYN, SYN-ACK, ACK', 'ACK, SYN, ACK', 'HELLO, OK, GO'], answer: 1, explain: 'SYN → SYN-ACK → ACK.' },
      { kind: 'mcq', prompt: t('DNS queries normally use…', 'Les requêtes DNS utilisent normalement…'), options: ['TCP 53', 'UDP 53', 'UDP 67', 'TCP 80'], answer: 1, explain: t('UDP 53 (TCP 53 for large answers and zone transfers).', 'UDP 53 (TCP 53 pour les grosses réponses et transferts de zone).') },
      { kind: 'tf', prompt: t('UDP re-sends lost datagrams automatically.', 'UDP renvoie automatiquement les datagrammes perdus.'), answer: false, explain: t('Only TCP does.', 'Seul TCP le fait.') },
      { kind: 'input', prompt: t('Which port does RDP use?', 'Quel port utilise RDP ?'), accept: ['3389'], explain: '3389.' },
      { kind: 'mcq', prompt: t('In netstat, a server waiting for connections is shown as…', 'Dans netstat, un serveur qui attend des connexions apparaît comme…'), options: ['ESTABLISHED', 'LISTENING', 'TIME_WAIT', 'CLOSED'], answer: 1, explain: 'LISTENING.' },
      { kind: 'mcq', prompt: t('Ping works but the website does not load. Most likely layer?', 'Le ping marche mais le site ne charge pas. Couche la plus probable ?'), options: ['1', '2', '3', t('4 or above', '4 ou plus')], answer: 3, explain: t('L3 is proven by ping; check the port/service.', 'La C3 est prouvée par le ping ; vérifiez le port/service.') },
    ],
  },
]
