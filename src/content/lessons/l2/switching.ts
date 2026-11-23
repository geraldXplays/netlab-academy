import { t, type Lesson } from '../types'

export const switchLessons: Lesson[] = [
  {
    id: 'l2-switch.1',
    title: t('How a switch thinks', 'Comment pense un switch'),
    minutes: 13,
    objectives: [
      t('Explain learning, flooding, forwarding and filtering', 'Expliquer apprentissage, inondation, transmission et filtrage'),
      t('Read a MAC address table', 'Lire une table d’adresses MAC'),
      t('Distinguish collision domains and broadcast domains', 'Distinguer domaines de collision et domaines de diffusion'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Hubs shouted, switches whisper', 'Les hubs criaient, les switches chuchotent'),
        body: t(
          'An old **hub** repeated every bit out of every port: all devices shared the bandwidth and collided. A **switch** is smarter: it reads the **destination MAC** of each frame and sends it **only** to the port where that device lives. Each port is its own **collision domain**, and full-duplex links mean no collisions at all.',
          'Un vieux **hub** répétait chaque bit sur tous ses ports : tous partageaient la bande passante et entraient en collision. Un **switch** est plus malin : il lit la **MAC de destination** de chaque trame et ne l’envoie **que** vers le port où se trouve l’appareil. Chaque port est son propre **domaine de collision**, et en full-duplex il n’y a plus de collision du tout.',
        ),
      },
      { type: 'animation', anim: 'mac-learning', title: t('Learning, flooding, forwarding', 'Apprendre, inonder, transmettre') },
      {
        type: 'table',
        head: [t('Action', 'Action'), t('When', 'Quand'), t('Result', 'Résultat')],
        rows: [
          [t('Learn', 'Apprendre'), t('Every frame', 'Chaque trame'), t('Source MAC + incoming port saved in the table', 'MAC source + port d’entrée enregistrés')],
          [t('Forward', 'Transmettre'), t('Destination MAC known', 'MAC de destination connue'), t('Sent out that one port', 'Envoyée sur ce seul port')],
          [t('Flood', 'Inonder'), t('Unknown unicast or broadcast', 'Unicast inconnu ou broadcast'), t('Sent out all ports except the incoming one', 'Envoyée sur tous les ports sauf celui d’entrée')],
          [t('Filter', 'Filtrer'), t('Destination is on the incoming port', 'Destination sur le port d’entrée'), t('Dropped', 'Jetée')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A switch receives a frame for a MAC that is not in its table. It…', 'Un switch reçoit une trame pour une MAC absente de sa table. Il…'),
          options: [t('Drops it', 'La jette'), t('Floods it out all other ports', 'L’inonde sur tous les autres ports'), t('Sends it to the router', 'L’envoie au routeur'), t('Asks DNS', 'Interroge le DNS')],
          answer: 1,
          explain: t('Unknown unicast is flooded; the reply will teach the switch where that MAC lives.', 'L’unicast inconnu est inondé ; la réponse apprendra au switch où se trouve cette MAC.'),
        },
      },
      {
        type: 'example',
        title: t('show mac address-table', 'show mac address-table'),
        body: t('On a Cisco switch this command shows what the switch has learnt. Several MACs on one port usually means another switch (or an unmanaged mini-switch!) is connected there.', 'Sur un switch Cisco, cette commande montre ce que le switch a appris. Plusieurs MAC sur un seul port signifie généralement qu’un autre switch (ou un mini-switch non administrable !) y est branché.'),
        code: 'SW1# show mac address-table\n          Mac Address Table\n-------------------------------------------\nVlan    Mac Address       Type        Ports\n----    -----------       --------    -----\n  10    0050.56a1.1111    DYNAMIC     Fa0/1\n  10    0050.56a1.2222    DYNAMIC     Fa0/2\n  20    0050.56a1.3333    DYNAMIC     Fa0/5\n   1    00d0.ba3c.4d5e    DYNAMIC     Gi0/1   <- uplink: many MACs live behind it',
      },
      {
        type: 'callout',
        tone: 'info',
        title: t('Broadcast domains', 'Domaines de diffusion'),
        body: t('A switch floods **broadcasts** to every port: all devices connected through switches (in the same VLAN) form **one broadcast domain**. Only a **router** (or VLANs) splits broadcast domains.', 'Un switch inonde les **broadcasts** sur tous ses ports : tous les appareils reliés par des switches (dans le même VLAN) forment **un domaine de diffusion**. Seul un **routeur** (ou les VLAN) sépare les domaines de diffusion.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Two switches connected together with 10 PCs each, one VLAN. How many broadcast domains?', 'Deux switches reliés, 10 PC chacun, un seul VLAN. Combien de domaines de diffusion ?'),
          options: ['1', '2', '20', '22'],
          answer: 0,
          explain: t('Switches do not split broadcast domains.', 'Les switches ne séparent pas les domaines de diffusion.'),
        },
      },
    ],
    vocabulary: [
      { term: t('MAC address table (CAM)', 'Table MAC (CAM)'), def: t('Switch memory mapping MAC addresses to ports.', 'Mémoire du switch associant MAC et ports.') },
      { term: t('Flooding', 'Inondation'), def: t('Sending a frame out all ports except the incoming one.', 'Envoi d’une trame sur tous les ports sauf celui d’entrée.') },
      { term: t('Collision domain', 'Domaine de collision'), def: t('Segment where frames can collide; one per switch port.', 'Segment où les trames peuvent entrer en collision ; un par port de switch.') },
      { term: t('Broadcast domain', 'Domaine de diffusion'), def: t('All devices reached by a broadcast.', 'Tous les appareils atteints par un broadcast.') },
    ],
    practice: t('Tracing a device: you know a PC’s MAC (from ipconfig /all) but not where it is plugged in. Run `show mac address-table address <mac>` on the core switch, follow the port to the next switch, and repeat until you reach an access port. That is the wall socket.', 'Retrouver un appareil : vous connaissez la MAC d’un PC (ipconfig /all) mais pas sa prise. Lancez `show mac address-table address <mac>` sur le switch de cœur, suivez le port jusqu’au switch suivant, et recommencez jusqu’à un port d’accès. C’est la prise murale.'),
    quiz: [
      { kind: 'mcq', prompt: t('What does a switch learn from each frame?', 'Qu’apprend un switch de chaque trame ?'), options: [t('Destination IP', 'IP destination'), t('Source MAC and incoming port', 'MAC source et port d’entrée'), t('Source IP', 'IP source'), t('TCP port', 'Port TCP')], answer: 1, explain: t('Source MAC + port.', 'MAC source + port.') },
      { kind: 'tf', prompt: t('A hub sends traffic only to the destination port.', 'Un hub n’envoie le trafic qu’au port de destination.'), answer: false, explain: t('A hub repeats to all ports.', 'Un hub répète sur tous les ports.') },
      { kind: 'mcq', prompt: t('Which device splits broadcast domains?', 'Quel équipement sépare les domaines de diffusion ?'), options: ['Hub', 'Switch', t('Router', 'Routeur'), t('Repeater', 'Répéteur')], answer: 2, explain: t('Router (or VLANs).', 'Routeur (ou VLAN).') },
      { kind: 'command', prompt: t('Show the MAC address table on a Cisco switch.', 'Afficher la table MAC d’un switch Cisco.'), accept: ['show mac address-table', 'sh mac address-table', 'show mac-address-table'], explain: 'show mac address-table', shell: 'SW1#' },
      { kind: 'mcq', prompt: t('What happens to a broadcast frame?', 'Que devient une trame de broadcast ?'), options: [t('Dropped', 'Jetée'), t('Flooded out all ports except incoming', 'Inondée sur tous les ports sauf l’entrée'), t('Sent to the router only', 'Envoyée au routeur seulement'), t('Stored', 'Stockée')], answer: 1, explain: t('Flooded within the VLAN.', 'Inondée dans le VLAN.') },
    ],
  },
  {
    id: 'l2-switch.2',
    title: t('ARP: from IP address to MAC address', 'ARP : de l’adresse IP à l’adresse MAC'),
    minutes: 11,
    objectives: [
      t('Explain why ARP is needed', 'Expliquer pourquoi ARP est nécessaire'),
      t('Follow an ARP request and reply', 'Suivre une requête et une réponse ARP'),
      t('Use arp -a and know what happens with a remote destination', 'Utiliser arp -a et savoir ce qui se passe pour une destination distante'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Two addresses, one bridge', 'Deux adresses, un pont'),
        body: t('Applications use **IP addresses**, but Ethernet frames are delivered with **MAC addresses**. The **Address Resolution Protocol** (ARP) fills the gap: "I know the IP, give me the MAC".', 'Les applications utilisent des **adresses IP**, mais les trames Ethernet sont livrées avec des **adresses MAC**. L’**Address Resolution Protocol** (ARP) fait le lien : « je connais l’IP, donne-moi la MAC ».'),
      },
      { type: 'animation', anim: 'arp', title: t('ARP request and reply', 'Requête et réponse ARP') },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Remote destination? ARP for the gateway', 'Destination distante ? ARP pour la passerelle'),
        body: t('If the destination is in **another subnet**, the PC does NOT ARP for it (the destination would never hear a broadcast). It ARPs for its **default gateway** and sends the frame to the router’s MAC, with the final IP still inside. This is why a wrong gateway breaks everything off-subnet.', 'Si la destination est dans **un autre sous-réseau**, le PC ne fait PAS d’ARP pour elle (elle n’entendrait jamais le broadcast). Il fait un ARP pour sa **passerelle par défaut** et envoie la trame à la MAC du routeur, avec l’IP finale toujours à l’intérieur. Voilà pourquoi une mauvaise passerelle casse tout ce qui est hors sous-réseau.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('PC 10.0.0.5/24 pings 8.8.8.8. Whose MAC does it ARP for?', 'Le PC 10.0.0.5/24 pingue 8.8.8.8. De qui demande-t-il la MAC par ARP ?'),
          options: ['8.8.8.8', t('Its default gateway', 'Sa passerelle par défaut'), t('The DNS server', 'Le serveur DNS'), t('Nobody', 'Personne')],
          answer: 1,
          explain: t('Off-subnet → frame goes to the gateway’s MAC.', 'Hors sous-réseau → la trame va à la MAC de la passerelle.'),
        },
      },
      {
        type: 'example',
        title: t('The ARP cache', 'Le cache ARP'),
        body: t('`arp -a` shows what a PC has learnt. Entries expire after a few minutes. `arp -d *` (admin) clears it — useful after replacing a device that kept the same IP.', '`arp -a` affiche ce que le PC a appris. Les entrées expirent après quelques minutes. `arp -d *` (admin) le vide — utile après le remplacement d’un appareil qui garde la même IP.'),
        code: 'C:\\> arp -a\n\nInterface: 192.168.1.10 --- 0x7\n  Internet Address      Physical Address      Type\n  192.168.1.1           00-1a-2b-3c-4d-5e     dynamic\n  192.168.1.30          cc-cc-cc-00-00-30     dynamic\n  192.168.1.255         ff-ff-ff-ff-ff-ff     static',
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Why the first ping sometimes times out', 'Pourquoi le premier ping échoue parfois'),
        body: t('In Packet Tracer and on real routers, the first ping to a new destination often shows one "Request timed out" (or `.!!!!` on Cisco): the packet waited while ARP did its job. Not a fault!', 'Dans Packet Tracer et sur de vrais routeurs, le premier ping vers une nouvelle destination affiche souvent un « Délai d’attente dépassé » (ou `.!!!!` sur Cisco) : le paquet a attendu pendant l’ARP. Ce n’est pas une panne !'),
      },
      {
        type: 'check',
        question: {
          kind: 'tf',
          prompt: t('An ARP request is sent as a broadcast.', 'Une requête ARP est envoyée en broadcast.'),
          answer: true,
          explain: t('Request = broadcast, reply = unicast.', 'Requête = broadcast, réponse = unicast.'),
        },
      },
    ],
    vocabulary: [
      { term: 'ARP', def: t('Resolves an IPv4 address to a MAC address on the local network.', 'Résout une IPv4 en adresse MAC sur le réseau local.') },
      { term: t('ARP cache', 'Cache ARP'), def: t('Temporary table of IP → MAC mappings.', 'Table temporaire d’associations IP → MAC.') },
      { term: t('Gratuitous ARP', 'ARP gratuit'), def: t('A host announcing its own IP/MAC (also detects IP conflicts).', 'Un hôte annonçant sa propre IP/MAC (détecte aussi les conflits).') },
    ],
    practice: t('"Windows detected an IP address conflict" is ARP at work: two machines answered for the same IP. Find the second one with `arp -a` from a neighbour, then the MAC table on the switch.', '« Windows a détecté un conflit d’adresse IP » : c’est ARP. Deux machines ont répondu pour la même IP. Trouvez la seconde avec `arp -a` depuis un voisin, puis la table MAC du switch.'),
    quiz: [
      { kind: 'mcq', prompt: t('ARP maps…', 'ARP associe…'), options: [t('Name → IP', 'Nom → IP'), t('IP → MAC', 'IP → MAC'), t('MAC → port', 'MAC → port'), t('Port → service', 'Port → service')], answer: 1, explain: 'IP → MAC.' },
      { kind: 'command', prompt: t('Display the ARP cache on Windows.', 'Afficher le cache ARP sous Windows.'), accept: ['arp -a'], explain: 'arp -a', shell: 'C:\\>' },
      { kind: 'tf', prompt: t('The ARP reply is a broadcast.', 'La réponse ARP est un broadcast.'), answer: false, explain: t('It is unicast to the requester.', 'Elle est en unicast vers le demandeur.') },
      { kind: 'mcq', prompt: t('In IPv6, ARP is replaced by…', 'En IPv6, ARP est remplacé par…'), options: ['RARP', 'NDP', 'DHCPv6', 'DNS'], answer: 1, explain: 'NDP.' },
      { kind: 'mcq', prompt: t('The first Cisco ping shows ".!!!!". Why the dot?', 'Le premier ping Cisco affiche « .!!!! ». Pourquoi le point ?'), options: [t('Cable fault', 'Câble défectueux'), t('ARP resolution delayed the first packet', 'La résolution ARP a retardé le premier paquet'), t('Firewall', 'Pare-feu'), t('DNS', 'DNS')], answer: 1, explain: 'ARP.' },
    ],
  },
  {
    id: 'l2-switch.3',
    title: t('Configuring a Cisco switch (and Spanning Tree)', 'Configurer un switch Cisco (et le Spanning Tree)'),
    minutes: 16,
    objectives: [
      t('Apply a secure base configuration to a switch', 'Appliquer une configuration de base sécurisée à un switch'),
      t('Give the switch a management IP (SVI) and enable SSH', 'Donner une IP de gestion (SVI) au switch et activer SSH'),
      t('Explain why Spanning Tree exists', 'Expliquer pourquoi le Spanning Tree existe'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('IOS modes', 'Les modes IOS'),
        body: t('`Switch>` user EXEC (look only) → `enable` → `Switch#` privileged EXEC (show, copy, reload) → `configure terminal` → `Switch(config)#` global config → `interface fa0/1` → `Switch(config-if)#`. `exit` goes up one level, `end` back to privileged mode. Tab completes commands, `?` lists options.', '`Switch>` EXEC utilisateur (consultation) → `enable` → `Switch#` EXEC privilégié (show, copy, reload) → `configure terminal` → `Switch(config)#` configuration globale → `interface fa0/1` → `Switch(config-if)#`. `exit` remonte d’un niveau, `end` revient au mode privilégié. Tab complète les commandes, `?` liste les options.'),
      },
      {
        type: 'example',
        title: t('Base configuration you will type a hundred times', 'La configuration de base que vous taperez cent fois'),
        body: t('Name, secure passwords, a banner, a management IP on VLAN 1 (or a dedicated management VLAN), a default gateway so you can reach it from other subnets, SSH instead of Telnet — then save.', 'Nom, mots de passe sécurisés, bannière, IP de gestion sur le VLAN 1 (ou un VLAN de gestion dédié), passerelle par défaut pour l’atteindre depuis d’autres sous-réseaux, SSH au lieu de Telnet — puis sauvegarde.'),
        code: 'Switch> enable\nSwitch# configure terminal\nSwitch(config)# hostname SW-FLOOR1\nSW-FLOOR1(config)# enable secret Cl4ss!Secret\nSW-FLOOR1(config)# service password-encryption\nSW-FLOOR1(config)# banner motd # Authorised access only #\nSW-FLOOR1(config)# interface vlan 1\nSW-FLOOR1(config-if)# ip address 192.168.1.2 255.255.255.0\nSW-FLOOR1(config-if)# no shutdown\nSW-FLOOR1(config-if)# exit\nSW-FLOOR1(config)# ip default-gateway 192.168.1.1\nSW-FLOOR1(config)# ip domain-name corp.local\nSW-FLOOR1(config)# crypto key generate rsa modulus 2048\nSW-FLOOR1(config)# username admin secret Adm1n!pass\nSW-FLOOR1(config)# line vty 0 15\nSW-FLOOR1(config-line)# login local\nSW-FLOOR1(config-line)# transport input ssh\nSW-FLOOR1(config-line)# end\nSW-FLOOR1# copy running-config startup-config',
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Save the running configuration so it survives a reboot.', 'Sauvegardez la configuration courante pour qu’elle survive à un redémarrage.'),
          accept: ['copy running-config startup-config', 'copy run start', 'write memory', 'wr', 'write'],
          explain: t('copy running-config startup-config (or write memory).', 'copy running-config startup-config (ou write memory).'),
          shell: 'SW-FLOOR1#',
        },
      },
      {
        type: 'table',
        head: [t('Command', 'Commande'), t('Shows', 'Affiche')],
        rows: [
          ['show running-config', t('Current configuration (RAM)', 'Configuration actuelle (RAM)')],
          ['show ip interface brief', t('Every interface, its IP and up/down state', 'Chaque interface, son IP et son état')],
          ['show interfaces status', t('Ports: connected / notconnect / err-disabled, VLAN, speed', 'Ports : connecté / non connecté / err-disabled, VLAN, vitesse')],
          ['show vlan brief', t('VLANs and their access ports', 'Les VLAN et leurs ports d’accès')],
          ['show mac address-table', t('Learnt MAC addresses', 'Adresses MAC apprises')],
          ['show spanning-tree', t('Root bridge, port roles and states', 'Pont racine, rôles et états des ports')],
        ],
      },
      { type: 'animation', anim: 'stp', title: t('Loops, broadcast storms and Spanning Tree', 'Boucles, tempêtes de diffusion et Spanning Tree') },
      {
        type: 'callout',
        tone: 'tip',
        title: t('PortFast & BPDU Guard', 'PortFast et BPDU Guard'),
        body: t('On ports that connect PCs (never switches), use `spanning-tree portfast` so they come up instantly instead of waiting ~30 s, and `spanning-tree bpduguard enable` so the port shuts down if someone plugs a switch into it.', 'Sur les ports qui connectent des PC (jamais des switches), utilisez `spanning-tree portfast` pour qu’ils s’activent tout de suite au lieu d’attendre ~30 s, et `spanning-tree bpduguard enable` pour que le port se coupe si quelqu’un y branche un switch.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('What does STP do with a redundant link?', 'Que fait STP d’un lien redondant ?'),
          options: [t('Deletes it', 'Le supprime'), t('Puts one port in blocking state', 'Met un port en état bloquant'), t('Doubles its speed', 'Double sa vitesse'), t('Routes over it', 'Route dessus')],
          answer: 1,
          explain: t('Blocked until it is needed as a backup.', 'Bloqué jusqu’à ce qu’il serve de secours.'),
        },
      },
    ],
    vocabulary: [
      { term: 'SVI', def: t('Switch Virtual Interface (interface vlan X) — gives the switch an IP.', 'Switch Virtual Interface (interface vlan X) — donne une IP au switch.') },
      { term: 'running-config / startup-config', def: t('Live config in RAM / saved config in NVRAM.', 'Config active en RAM / config sauvegardée en NVRAM.') },
      { term: 'STP', def: t('Spanning Tree Protocol (802.1D) — prevents layer 2 loops.', 'Spanning Tree Protocol (802.1D) — empêche les boucles de couche 2.') },
      { term: t('Root bridge', 'Pont racine'), def: t('The switch at the centre of the spanning tree.', 'Le switch au centre de l’arbre recouvrant.') },
    ],
    practice: t('Build this exact base configuration in the Labs simulator (sandbox) — type it on a switch, then `show running-config` to see your work.', 'Construisez exactement cette configuration dans le simulateur des Labs (bac à sable) — tapez-la sur un switch, puis `show running-config` pour voir le résultat.'),
    quiz: [
      { kind: 'command', prompt: t('Enter global configuration mode from privileged mode.', 'Entrer en configuration globale depuis le mode privilégié.'), accept: ['configure terminal', 'conf t', 'config t'], explain: 'configure terminal', shell: 'Switch#' },
      { kind: 'mcq', prompt: t('Which interface gives a switch its management IP?', 'Quelle interface donne l’IP de gestion au switch ?'), options: ['Fa0/1', 'interface vlan 1 (SVI)', 'Gi0/1', 'console 0'], answer: 1, explain: 'SVI.' },
      { kind: 'mcq', prompt: t('Why prefer SSH to Telnet?', 'Pourquoi préférer SSH à Telnet ?'), options: [t('Faster', 'Plus rapide'), t('Encrypted', 'Chiffré'), t('No password', 'Sans mot de passe'), t('Uses UDP', 'Utilise UDP')], answer: 1, explain: t('Telnet sends passwords in clear text.', 'Telnet envoie les mots de passe en clair.') },
      { kind: 'tf', prompt: t('Without STP, a loop between switches can cause a broadcast storm.', 'Sans STP, une boucle entre switches peut provoquer une tempête de diffusion.'), answer: true, explain: t('Frames have no TTL at layer 2.', 'Les trames n’ont pas de TTL en couche 2.') },
      { kind: 'mcq', prompt: t('Changes lost after a reboot. What was forgotten?', 'Modifications perdues après redémarrage. Qu’a-t-on oublié ?'), options: ['enable secret', 'copy running-config startup-config', 'no shutdown', 'hostname'], answer: 1, explain: t('Save the config!', 'Sauvegarder la config !') },
    ],
  },
]

export const routerLessons: Lesson[] = [
  {
    id: 'l2-router.1',
    title: t('What a router does', 'Ce que fait un routeur'),
    minutes: 13,
    objectives: [
      t('Explain routing between networks', 'Expliquer le routage entre réseaux'),
      t('Read a routing table and apply longest prefix match', 'Lire une table de routage et appliquer la correspondance la plus longue'),
      t('Explain the default gateway and the default route', 'Expliquer la passerelle par défaut et la route par défaut'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Connecting networks', 'Relier des réseaux'),
        body: t('A switch connects devices **inside** one network. A **router** connects **different networks** and decides, packet by packet, where to send each one next, using its **routing table**. Every router interface belongs to a different subnet — and is the **default gateway** for the hosts in that subnet.', 'Un switch relie des appareils **dans** un réseau. Un **routeur** relie des **réseaux différents** et décide, paquet par paquet, où envoyer chacun ensuite, grâce à sa **table de routage**. Chaque interface de routeur appartient à un sous-réseau différent — et sert de **passerelle par défaut** aux hôtes de ce sous-réseau.'),
      },
      { type: 'animation', anim: 'route-lookup', title: t('How R1 chooses where to send a packet', 'Comment R1 choisit où envoyer un paquet') },
      {
        type: 'table',
        head: [t('Code', 'Code'), t('Source of the route', 'Origine de la route'), t('Example', 'Exemple')],
        rows: [
          ['C', t('Connected — network on one of my interfaces', 'Connecté — réseau sur une de mes interfaces'), 'C 192.168.1.0/24 is directly connected, Gi0/0/0'],
          ['L', t('Local — my own interface address', 'Local — l’adresse de mon interface'), 'L 192.168.1.1/32'],
          ['S', t('Static — typed by an admin', 'Statique — saisie par un admin'), 'S 10.2.0.0/16 [1/0] via 172.16.1.2'],
          ['S*', t('Static default route', 'Route par défaut statique'), 'S* 0.0.0.0/0 [1/0] via 203.0.113.1'],
          ['O', t('Learnt by OSPF', 'Apprise par OSPF'), 'O 10.3.0.0/16 [110/2] via 172.16.2.2'],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Routes: 172.16.0.0/16, 172.16.4.0/22, 0.0.0.0/0. Packet for 172.16.5.10 uses…', 'Routes : 172.16.0.0/16, 172.16.4.0/22, 0.0.0.0/0. Un paquet pour 172.16.5.10 utilise…'),
          options: ['172.16.0.0/16', '172.16.4.0/22', '0.0.0.0/0'],
          answer: 1,
          explain: t('172.16.4.0/22 covers .4–.7 and is the longest match.', '172.16.4.0/22 couvre .4–.7 et est la plus longue correspondance.'),
        },
      },
      {
        type: 'text',
        title: t('No route = dropped', 'Pas de route = paquet jeté'),
        body: t('If no route matches and there is no default route, the router **drops** the packet and sends back an ICMP "Destination host unreachable" (on Cisco ping you see `U`). Remember: routing must work **in both directions** — the reply needs a route back too.', 'Si aucune route ne correspond et qu’il n’y a pas de route par défaut, le routeur **jette** le paquet et renvoie un ICMP « Destination host unreachable » (en ping Cisco vous voyez `U`). Retenez : le routage doit marcher **dans les deux sens** — la réponse a besoin d’une route de retour.'),
      },
      {
        type: 'check',
        question: {
          kind: 'tf',
          prompt: t('A router forwards packets based on the destination MAC address.', 'Un routeur transmet les paquets selon l’adresse MAC de destination.'),
          answer: false,
          explain: t('Routers decide on the destination IP; they rewrite MACs at each hop.', 'Les routeurs décident sur l’IP de destination ; ils réécrivent les MAC à chaque saut.'),
        },
      },
    ],
    vocabulary: [
      { term: t('Routing table', 'Table de routage'), def: t('List of known networks and where to send packets for them.', 'Liste des réseaux connus et où envoyer leurs paquets.') },
      { term: t('Next hop', 'Saut suivant'), def: t('IP of the next router on the path.', 'IP du routeur suivant sur le chemin.') },
      { term: t('Longest prefix match', 'Correspondance la plus longue'), def: t('The most specific matching route wins.', 'La route correspondante la plus précise gagne.') },
      { term: t('Gateway of last resort', 'Passerelle de dernier recours'), def: t('The default route 0.0.0.0/0.', 'La route par défaut 0.0.0.0/0.') },
    ],
    practice: t('`show ip route` is the first command to run when "site A can’t reach site B": check there is a route to B on every router along the way — and back to A.', '`show ip route` est la première commande à lancer quand « le site A n’atteint pas le site B » : vérifiez qu’il existe une route vers B sur chaque routeur du chemin — et une route de retour vers A.'),
    quiz: [
      { kind: 'mcq', prompt: t('Which code marks a directly connected network?', 'Quel code indique un réseau directement connecté ?'), options: ['S', 'C', 'O', 'D'], answer: 1, explain: 'C.' },
      { kind: 'input', prompt: t('Write the IPv4 default route network/prefix.', 'Écrivez la route par défaut IPv4 (réseau/préfixe).'), accept: ['0.0.0.0/0'], explain: '0.0.0.0/0.' },
      { kind: 'mcq', prompt: t('Packet for 10.1.1.1 with routes 10.0.0.0/8 and 10.1.0.0/16. Chosen?', 'Paquet pour 10.1.1.1 avec routes 10.0.0.0/8 et 10.1.0.0/16. Choisie ?'), options: ['10.0.0.0/8', '10.1.0.0/16'], answer: 1, explain: t('Longest prefix.', 'Préfixe le plus long.') },
      { kind: 'tf', prompt: t('Each router interface is in a different subnet.', 'Chaque interface de routeur est dans un sous-réseau différent.'), answer: true, explain: t('Overlapping subnets are refused.', 'Les sous-réseaux qui se chevauchent sont refusés.') },
      { kind: 'mcq', prompt: t('Ping shows "UUUUU" on a Cisco router. Meaning?', 'Le ping affiche « UUUUU » sur un routeur Cisco. Signification ?'), options: [t('Success', 'Succès'), t('Destination unreachable (no route somewhere)', 'Destination injoignable (pas de route quelque part)'), t('Timeout', 'Délai dépassé'), t('Unknown', 'Inconnu')], answer: 1, explain: 'U = unreachable.' },
    ],
  },
  {
    id: 'l2-router.2',
    title: t('Configuring a Cisco router', 'Configurer un routeur Cisco'),
    minutes: 14,
    objectives: [
      t('Configure and enable router interfaces', 'Configurer et activer les interfaces d’un routeur'),
      t('Verify with show ip interface brief and show ip route', 'Vérifier avec show ip interface brief et show ip route'),
      t('Understand why router interfaces start shut down', 'Comprendre pourquoi les interfaces de routeur démarrent désactivées'),
    ],
    blocks: [
      {
        type: 'example',
        title: t('Two LANs, one router', 'Deux LAN, un routeur'),
        body: t('Router interfaces are **administratively down** by default (unlike switch ports). Each needs an IP and `no shutdown`.', 'Les interfaces de routeur sont **désactivées administrativement** par défaut (contrairement aux ports de switch). Chacune a besoin d’une IP et d’un `no shutdown`.'),
        code: 'Router(config)# hostname R1\nR1(config)# interface g0/0/0\nR1(config-if)# description LAN-ADMIN\nR1(config-if)# ip address 192.168.10.1 255.255.255.0\nR1(config-if)# no shutdown\nR1(config-if)# interface g0/0/1\nR1(config-if)# description LAN-SALES\nR1(config-if)# ip address 192.168.20.1 255.255.255.0\nR1(config-if)# no shutdown\nR1(config-if)# end\nR1# show ip interface brief\nInterface              IP-Address      OK? Method Status                Protocol\nGigabitEthernet0/0/0   192.168.10.1    YES manual up                    up\nGigabitEthernet0/0/1   192.168.20.1    YES manual up                    up\nGigabitEthernet0/0/2   unassigned      YES unset  administratively down down',
      },
      {
        type: 'table',
        head: ['Status / Protocol', t('Meaning', 'Signification'), t('Fix', 'Solution')],
        rows: [
          ['up / up', t('Working', 'Fonctionne'), '—'],
          ['administratively down / down', t('Shut down by config', 'Coupée par configuration'), '`no shutdown`'],
          ['down / down', t('No cable / other end down (layer 1)', 'Pas de câble / l’autre côté est coupé (couche 1)'), t('Check cable and peer', 'Vérifier câble et voisin')],
          ['up / down', t('Layer 1 OK, layer 2 problem (encapsulation, clocking)', 'C1 OK, problème de couche 2 (encapsulation, horloge)'), t('Check both ends match', 'Vérifier que les deux bouts concordent')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('In interface mode, enable the interface.', 'En mode interface, activez l’interface.'),
          accept: ['no shutdown', 'no shut'],
          explain: 'no shutdown',
          shell: 'R1(config-if)#',
        },
      },
      {
        type: 'text',
        title: t('Hosts need the gateway', 'Les hôtes ont besoin de la passerelle'),
        body: t('PCs in 192.168.10.0/24 must use **192.168.10.1** as default gateway, PCs in 192.168.20.0/24 use **192.168.20.1**. The router has both networks as **connected routes**, so it can route between them immediately — no extra configuration.', 'Les PC de 192.168.10.0/24 doivent utiliser **192.168.10.1** comme passerelle, ceux de 192.168.20.0/24 **192.168.20.1**. Le routeur a les deux réseaux en **routes connectées** : il route entre eux immédiatement — sans configuration supplémentaire.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('An interface shows "down / down". First thing to check?', 'Une interface affiche « down / down ». Première chose à vérifier ?'),
          options: [t('The IP address', 'L’adresse IP'), t('The cable / the device at the other end', 'Le câble / l’équipement en face'), t('The routing table', 'La table de routage'), t('DNS', 'DNS')],
          answer: 1,
          explain: t('Layer 1 first.', 'D’abord la couche 1.'),
        },
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Use descriptions', 'Utilisez les descriptions'),
        body: t('`description UPLINK-TO-SW-CORE-Gi0/1` costs nothing and saves hours: the next technician (maybe you, in a year) instantly knows what each interface connects to.', '`description UPLINK-VERS-SW-CORE-Gi0/1` ne coûte rien et fait gagner des heures : le prochain technicien (peut-être vous, dans un an) sait tout de suite à quoi sert chaque interface.'),
      },
    ],
    vocabulary: [
      { term: 'no shutdown', def: t('Enables an interface.', 'Active une interface.') },
      { term: 'show ip interface brief', def: t('Summary of interfaces, IPs and states.', 'Résumé des interfaces, IP et états.') },
      { term: t('Connected route', 'Route connectée'), def: t('Added automatically for each up interface with an IP.', 'Ajoutée automatiquement pour chaque interface active avec une IP.') },
    ],
    practice: t('Labs 2 in the Labs section is exactly this: one router, two LANs. Do it without hints now.', 'Le Lab 2 de la section Labs est exactement ceci : un routeur, deux LAN. Faites-le sans indice maintenant.'),
    quiz: [
      { kind: 'tf', prompt: t('Cisco router interfaces are enabled by default.', 'Les interfaces de routeur Cisco sont actives par défaut.'), answer: false, explain: t('They start administratively down.', 'Elles démarrent désactivées.') },
      { kind: 'command', prompt: t('Assign 10.0.0.1/24 to the current interface.', 'Attribuez 10.0.0.1/24 à l’interface courante.'), accept: ['ip address 10.0.0.1 255.255.255.0', 'ip add 10.0.0.1 255.255.255.0'], explain: 'ip address 10.0.0.1 255.255.255.0', shell: 'R1(config-if)#' },
      { kind: 'command', prompt: t('Show a summary of all interfaces and their state.', 'Affichez un résumé des interfaces et de leur état.'), accept: ['show ip interface brief', 'sh ip int br', 'show ip int brief', 'sh ip int brief'], explain: 'show ip interface brief', shell: 'R1#' },
      { kind: 'mcq', prompt: t('"administratively down" means…', '« administratively down » signifie…'), options: [t('Cable unplugged', 'Câble débranché'), t('Shut down in the configuration', 'Coupée dans la configuration'), t('Hardware failure', 'Panne matérielle'), t('Wrong IP', 'Mauvaise IP')], answer: 1, explain: t('Use no shutdown.', 'Utilisez no shutdown.') },
      { kind: 'mcq', prompt: t('PCs in 192.168.20.0/24 should use which gateway (router .1)?', 'Les PC de 192.168.20.0/24 doivent utiliser quelle passerelle (routeur en .1) ?'), options: ['192.168.10.1', '192.168.20.1', '192.168.20.255', '0.0.0.0'], answer: 1, explain: '192.168.20.1.' },
    ],
  },
  {
    id: 'l2-router.3',
    title: t('A packet’s journey across routers', 'Le voyage d’un paquet à travers les routeurs'),
    minutes: 12,
    objectives: [
      t('Follow what changes and what stays the same at each hop', 'Suivre ce qui change et ce qui reste identique à chaque saut'),
      t('Use tracert / traceroute to see the path', 'Utiliser tracert / traceroute pour voir le chemin'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Hop by hop', 'Saut par saut'),
        body: t(
          'PC-A (192.168.10.5) sends to a server 10.50.0.20 two routers away:\n\n1. PC-A sees the destination is off-subnet → ARP for its gateway R1 → frame to **R1’s MAC**.\n2. R1 removes the frame, looks up 10.50.0.20, finds next hop R2, decrements **TTL**, builds a new frame to **R2’s MAC**.\n3. R2 finds 10.50.0.0/24 directly connected, ARPs for the server, frame to the **server’s MAC**.\n\nThroughout: **source and destination IP never change** (without NAT). MACs change on every link.',
          'PC-A (192.168.10.5) envoie à un serveur 10.50.0.20 situé deux routeurs plus loin :\n\n1. PC-A voit que la destination est hors sous-réseau → ARP pour sa passerelle R1 → trame vers la **MAC de R1**.\n2. R1 retire la trame, cherche 10.50.0.20, trouve le saut suivant R2, décrémente le **TTL**, construit une nouvelle trame vers la **MAC de R2**.\n3. R2 voit 10.50.0.0/24 directement connecté, fait un ARP pour le serveur, trame vers la **MAC du serveur**.\n\nTout du long : **les IP source et destination ne changent jamais** (sans NAT). Les MAC changent à chaque lien.',
        ),
      },
      { type: 'diagram', diagram: 'packet-journey', caption: t('The same packet, three different Ethernet frames.', 'Le même paquet, trois trames Ethernet différentes.') },
      {
        type: 'example',
        title: t('tracert shows each router', 'tracert montre chaque routeur'),
        body: t('tracert sends packets with TTL 1, 2, 3… Each router that drops one (TTL = 0) answers "time exceeded", revealing itself. `* * *` means a hop did not answer — that is where to look.', 'tracert envoie des paquets avec TTL 1, 2, 3… Chaque routeur qui en jette un (TTL = 0) répond « délai dépassé » et se révèle. `* * *` signifie qu’un saut n’a pas répondu — c’est là qu’il faut regarder.'),
        code: 'C:\\> tracert 10.50.0.20\n\nTracing route to 10.50.0.20 over a maximum of 30 hops\n  1    <1 ms    <1 ms    <1 ms  192.168.10.1\n  2     1 ms     1 ms     1 ms  172.16.0.2\n  3     2 ms     1 ms     1 ms  10.50.0.20\n\nTrace complete.',
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which field changes at every router hop?', 'Quel champ change à chaque saut de routeur ?'),
          options: [t('Destination IP', 'IP de destination'), t('Source IP', 'IP source'), t('TTL and the MAC addresses', 'Le TTL et les adresses MAC'), t('TCP port', 'Port TCP')],
          answer: 2,
          explain: t('TTL −1 and a new layer 2 header each hop.', 'TTL −1 et un nouvel en-tête de couche 2 à chaque saut.'),
        },
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Asymmetric failures', 'Pannes asymétriques'),
        body: t('If the request reaches the server but the reply has no route back, ping still fails — and tracert from the server side tells the other half of the story. Always think "there and back".', 'Si la requête atteint le serveur mais que la réponse n’a pas de route de retour, le ping échoue quand même — et un tracert depuis le serveur raconte l’autre moitié de l’histoire. Pensez toujours « aller et retour ».'),
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Trace the route to 8.8.8.8 on Windows.', 'Tracez la route vers 8.8.8.8 sous Windows.'),
          accept: ['tracert 8.8.8.8'],
          explain: 'tracert 8.8.8.8',
          shell: 'C:\\>',
        },
      },
    ],
    vocabulary: [
      { term: 'Hop', def: t('One router crossed on the path.', 'Un routeur traversé sur le chemin.') },
      { term: 'tracert / traceroute', def: t('Lists the routers on the path using TTL expiry.', 'Liste les routeurs du chemin grâce à l’expiration du TTL.') },
    ],
    practice: t('In the IT Operations Simulator incident "The company loses Internet access", tracert from IT-PC is the fastest way to find the broken hop.', 'Dans l’incident « L’entreprise perd l’accès Internet » du simulateur, tracert depuis IT-PC est le moyen le plus rapide de trouver le saut en panne.'),
    quiz: [
      { kind: 'tf', prompt: t('Without NAT, the destination IP stays the same from end to end.', 'Sans NAT, l’IP de destination reste la même de bout en bout.'), answer: true, explain: t('Only L2 addresses change.', 'Seules les adresses de couche 2 changent.') },
      { kind: 'mcq', prompt: t('tracert discovers routers by…', 'tracert découvre les routeurs en…'), options: [t('Asking DNS', 'Interrogeant le DNS'), t('Sending increasing TTLs', 'Envoyant des TTL croissants'), t('Reading ARP', 'Lisant ARP'), t('Scanning ports', 'Scannant les ports')], answer: 1, explain: 'TTL.' },
      { kind: 'mcq', prompt: t('The first frame from PC-A to a remote server is addressed to…', 'La première trame de PC-A vers un serveur distant est adressée à…'), options: [t('The server’s MAC', 'La MAC du serveur'), t('The gateway’s MAC', 'La MAC de la passerelle'), t('Broadcast', 'Broadcast'), t('The DNS MAC', 'La MAC du DNS')], answer: 1, explain: t('The gateway.', 'La passerelle.') },
      { kind: 'mcq', prompt: t('Ping fails but the server received the request. Likely cause?', 'Le ping échoue mais le serveur a reçu la requête. Cause probable ?'), options: [t('Missing return route', 'Route de retour manquante'), t('Wrong MAC', 'Mauvaise MAC'), t('Bad cable at PC-A', 'Mauvais câble chez PC-A'), 'DNS'], answer: 0, explain: t('Think there and back.', 'Pensez aller et retour.') },
    ],
  },
]
