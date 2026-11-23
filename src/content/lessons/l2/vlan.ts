import { t, type Lesson } from '../types'

export const vlanLessons: Lesson[] = [
  {
    id: 'l2-vlan.1',
    title: t('Why VLANs?', 'Pourquoi des VLAN ?'),
    minutes: 11,
    objectives: [
      t('Explain what a VLAN is and the problems it solves', 'Expliquer ce qu’est un VLAN et les problèmes qu’il résout'),
      t('Link VLANs, subnets and broadcast domains', 'Relier VLAN, sous-réseaux et domaines de diffusion'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Virtual networks on the same switches', 'Des réseaux virtuels sur les mêmes switches'),
        body: t(
          'A **VLAN** (Virtual LAN) splits one physical switch into several **logical** switches. Sales, HR and the phones can share the same hardware, yet they are completely separated at layer 2:\n\n- **Security**: HR traffic never reaches Sales PCs; a firewall/router controls what crosses.\n- **Performance**: broadcasts stay inside their VLAN.\n- **Flexibility**: moving someone to another department = changing one port’s VLAN, not re-cabling.\n\nGolden rule: **one VLAN = one subnet = one broadcast domain**.',
          'Un **VLAN** (LAN virtuel) découpe un switch physique en plusieurs switches **logiques**. Commercial, RH et téléphones partagent le même matériel, tout en étant totalement séparés en couche 2 :\n\n- **Sécurité** : le trafic RH n’atteint jamais les PC du Commercial ; un pare-feu/routeur contrôle ce qui passe.\n- **Performance** : les broadcasts restent dans leur VLAN.\n- **Souplesse** : changer quelqu’un de service = changer le VLAN d’un port, pas recâbler.\n\nRègle d’or : **un VLAN = un sous-réseau = un domaine de diffusion**.',
        ),
      },
      {
        type: 'table',
        head: ['VLAN', t('Name', 'Nom'), t('Subnet', 'Sous-réseau'), t('Gateway', 'Passerelle')],
        rows: [
          ['10', 'ADMIN', '10.10.10.0/24', '10.10.10.1'],
          ['20', 'SALES', '10.10.20.0/24', '10.10.20.1'],
          ['30', 'VOICE', '10.10.30.0/24', '10.10.30.1'],
          ['99', 'MGMT', '10.10.99.0/24', '10.10.99.1'],
          ['999', 'PARKING', t('none — unused ports', 'aucun — ports inutilisés'), '—'],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('PCs in VLAN 10 and VLAN 20 on the same switch want to talk. They need…', 'Des PC des VLAN 10 et 20 sur le même switch veulent communiquer. Il leur faut…'),
          options: [t('Nothing, same switch', 'Rien, même switch'), t('A router or layer 3 switch', 'Un routeur ou switch de niveau 3'), t('A hub', 'Un hub'), t('A longer cable', 'Un câble plus long')],
          answer: 1,
          explain: t('Different VLANs are different networks → routing.', 'VLAN différents = réseaux différents → routage.'),
        },
      },
      {
        type: 'example',
        title: t('The VLAN mistake from the simulator', 'L’erreur de VLAN du simulateur'),
        body: t('A new PC is patched to a port left in default **VLAN 1** while its colleagues are in VLAN 10. It gets no DHCP answer (169.254.x.x) and reaches nothing. To the user it looks like a broken cable. `show vlan brief` reveals it in 2 seconds.', 'Un nouveau PC est brassé sur un port resté dans le **VLAN 1** par défaut alors que ses collègues sont dans le VLAN 10. Il n’obtient pas de DHCP (169.254.x.x) et n’atteint rien. Pour l’utilisateur, cela ressemble à un câble cassé. `show vlan brief` le révèle en 2 secondes.'),
      },
      {
        type: 'check',
        question: {
          kind: 'tf',
          prompt: t('A broadcast in VLAN 20 is received by PCs in VLAN 10.', 'Un broadcast dans le VLAN 20 est reçu par les PC du VLAN 10.'),
          answer: false,
          explain: t('Each VLAN is its own broadcast domain.', 'Chaque VLAN est son propre domaine de diffusion.'),
        },
      },
    ],
    vocabulary: [
      { term: 'VLAN', def: t('Virtual LAN — a separate layer 2 network on shared switches.', 'LAN virtuel — un réseau de couche 2 séparé sur des switches partagés.') },
      { term: t('Access port', 'Port d’accès'), def: t('Switch port belonging to exactly one VLAN (for PCs, printers).', 'Port de switch appartenant à un seul VLAN (PC, imprimantes).') },
      { term: 'VLAN 1', def: t('Default VLAN — every port starts in it.', 'VLAN par défaut — tous les ports y démarrent.') },
    ],
    practice: t('Ask for the VLAN plan on your first day, together with the IP plan: they always go together.', 'Demandez le plan des VLAN dès le premier jour, avec le plan IP : ils vont toujours ensemble.'),
    quiz: [
      { kind: 'mcq', prompt: t('One VLAN usually equals…', 'Un VLAN correspond généralement à…'), options: [t('One switch', 'Un switch'), t('One subnet', 'Un sous-réseau'), t('One router', 'Un routeur'), t('One building', 'Un bâtiment')], answer: 1, explain: t('One subnet / broadcast domain.', 'Un sous-réseau / domaine de diffusion.') },
      { kind: 'tf', prompt: t('VLANs improve security by isolating traffic at layer 2.', 'Les VLAN améliorent la sécurité en isolant le trafic en couche 2.'), answer: true, explain: t('Yes.', 'Oui.') },
      { kind: 'mcq', prompt: t('Default VLAN on Cisco switches?', 'VLAN par défaut sur les switches Cisco ?'), options: ['0', '1', '10', '99'], answer: 1, explain: 'VLAN 1.' },
      { kind: 'mcq', prompt: t('A PC in the wrong VLAN typically shows…', 'Un PC dans le mauvais VLAN affiche typiquement…'), options: [t('A 169.254.x.x address', 'Une adresse 169.254.x.x'), t('A perfect connection', 'Une connexion parfaite'), t('A DNS error only', 'Une erreur DNS seulement'), t('A blue screen', 'Un écran bleu')], answer: 0, explain: t('No DHCP in that VLAN.', 'Pas de DHCP dans ce VLAN.') },
    ],
  },
  {
    id: 'l2-vlan.2',
    title: t('Configuring VLANs on Cisco switches', 'Configurer les VLAN sur un switch Cisco'),
    minutes: 13,
    objectives: [
      t('Create and name VLANs', 'Créer et nommer des VLAN'),
      t('Assign access ports and verify with show vlan brief', 'Affecter des ports d’accès et vérifier avec show vlan brief'),
    ],
    blocks: [
      {
        type: 'example',
        title: t('Create, name, assign', 'Créer, nommer, affecter'),
        body: t('`interface range` configures many ports at once. `switchport mode access` forces the port to be an access port (never negotiates a trunk — safer).', '`interface range` configure plusieurs ports d’un coup. `switchport mode access` force le port en port d’accès (il ne négocie jamais de trunk — plus sûr).'),
        code: 'SW1(config)# vlan 10\nSW1(config-vlan)# name ADMIN\nSW1(config-vlan)# vlan 20\nSW1(config-vlan)# name SALES\nSW1(config-vlan)# exit\nSW1(config)# interface range fa0/1 - 12\nSW1(config-if-range)# switchport mode access\nSW1(config-if-range)# switchport access vlan 10\nSW1(config-if-range)# interface range fa0/13 - 24\nSW1(config-if-range)# switchport mode access\nSW1(config-if-range)# switchport access vlan 20\nSW1(config-if-range)# end\nSW1# show vlan brief',
      },
      {
        type: 'code',
        code: 'VLAN Name                             Status    Ports\n---- -------------------------------- --------- -------------------------------\n1    default                          active    Gi0/1, Gi0/2\n10   ADMIN                            active    Fa0/1, Fa0/2, Fa0/3, Fa0/4\n                                                Fa0/5, Fa0/6 … Fa0/12\n20   SALES                            active    Fa0/13, Fa0/14 … Fa0/24',
        caption: t('Trunk ports do not appear in show vlan brief — use show interfaces trunk.', 'Les ports trunk n’apparaissent pas dans show vlan brief — utilisez show interfaces trunk.'),
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Put the current port in VLAN 20.', 'Placez le port courant dans le VLAN 20.'),
          accept: ['switchport access vlan 20'],
          explain: 'switchport access vlan 20',
          shell: 'SW1(config-if)#',
        },
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('VLAN must exist', 'Le VLAN doit exister'),
        body: t('If you assign a port to a VLAN that does not exist, Cisco creates it automatically — but without a name, and on a VTP client switch it may be refused. Create and name VLANs first.', 'Si vous affectez un port à un VLAN inexistant, Cisco le crée automatiquement — mais sans nom, et sur un switch client VTP cela peut être refusé. Créez et nommez d’abord les VLAN.'),
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Verify which ports are in which VLAN.', 'Vérifiez quels ports sont dans quel VLAN.'),
          accept: ['show vlan brief', 'sh vlan brief', 'sh vlan br', 'show vlan br'],
          explain: 'show vlan brief',
          shell: 'SW1#',
        },
      },
    ],
    vocabulary: [
      { term: 'interface range', def: t('Configure several ports with one set of commands.', 'Configurer plusieurs ports d’un coup.') },
      { term: 'switchport mode access', def: t('Port carries one untagged VLAN.', 'Le port transporte un seul VLAN non étiqueté.') },
    ],
    practice: t('Lab 3 (VLAN segmentation) asks for exactly these commands — try to finish it without hints to earn the VLAN Specialist badge.', 'Le Lab 3 (segmentation VLAN) demande exactement ces commandes — terminez-le sans indice pour gagner le badge Spécialiste VLAN.'),
    quiz: [
      { kind: 'command', prompt: t('Create VLAN 30.', 'Créez le VLAN 30.'), accept: ['vlan 30'], explain: 'vlan 30', shell: 'SW1(config)#' },
      { kind: 'command', prompt: t('Name the VLAN "VOICE".', 'Nommez le VLAN « VOICE ».'), accept: ['name VOICE', 'name voice'], explain: 'name VOICE', shell: 'SW1(config-vlan)#' },
      { kind: 'command', prompt: t('Select ports Fa0/1 to Fa0/8 together.', 'Sélectionnez ensemble les ports Fa0/1 à Fa0/8.'), accept: ['interface range fa0/1 - 8', 'interface range fa0/1-8', 'int range fa0/1 - 8', 'int range fa0/1-8', 'interface range fastethernet0/1 - 8'], explain: 'interface range fa0/1 - 8', shell: 'SW1(config)#' },
      { kind: 'tf', prompt: t('Trunk ports are listed in show vlan brief.', 'Les ports trunk sont listés dans show vlan brief.'), answer: false, explain: t('Use show interfaces trunk.', 'Utilisez show interfaces trunk.') },
    ],
  },
  {
    id: 'l2-vlan.3',
    title: t('VLAN design best practices', 'Bonnes pratiques de conception VLAN'),
    minutes: 10,
    objectives: [
      t('Use management, voice, native and parking VLANs correctly', 'Utiliser correctement les VLAN de gestion, voix, natif et parking'),
      t('Harden unused switch ports', 'Sécuriser les ports de switch inutilisés'),
    ],
    blocks: [
      {
        type: 'table',
        head: ['VLAN', t('Purpose', 'Rôle'), t('Best practice', 'Bonne pratique')],
        rows: [
          [t('Management', 'Gestion'), t('Switch/router admin IPs', 'IP d’administration des équipements'), t('Dedicated VLAN (e.g. 99), never VLAN 1, reachable only from IT', 'VLAN dédié (ex. 99), jamais le VLAN 1, accessible seulement depuis l’IT')],
          [t('Voice', 'Voix'), t('IP phones', 'Téléphones IP'), t('`switchport voice vlan 30` — phone and PC share one port, phone tagged, PC untagged', '`switchport voice vlan 30` — téléphone et PC partagent un port, téléphone étiqueté, PC non')],
          [t('Native', 'Natif'), t('Untagged traffic on a trunk', 'Trafic non étiqueté sur un trunk'), t('Change from VLAN 1 to an unused VLAN on both ends', 'Passer du VLAN 1 à un VLAN inutilisé des deux côtés')],
          [t('Parking / black hole', 'Parking / trou noir'), t('Unused ports', 'Ports inutilisés'), t('Assign to e.g. VLAN 999 and shut down', 'Affecter au VLAN 999 par ex. et couper')],
          [t('Guest', 'Invités'), t('Visitors’ Wi-Fi', 'Wi-Fi des visiteurs'), t('Internet only, own DHCP scope with short leases', 'Internet seulement, étendue DHCP dédiée à bail court')],
        ],
      },
      {
        type: 'example',
        title: t('Locking down unused ports', 'Verrouiller les ports inutilisés'),
        body: t('An attacker (or a curious visitor) plugging a laptop into a free wall socket should get nothing.', 'Un attaquant (ou un visiteur curieux) qui branche un portable sur une prise libre ne doit rien obtenir.'),
        code: 'SW1(config)# vlan 999\nSW1(config-vlan)# name PARKING\nSW1(config-vlan)# interface range fa0/20 - 24\nSW1(config-if-range)# switchport mode access\nSW1(config-if-range)# switchport access vlan 999\nSW1(config-if-range)# shutdown',
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Why avoid VLAN 1 for management?', 'Pourquoi éviter le VLAN 1 pour la gestion ?'),
          options: [t('It is slower', 'Il est plus lent'), t('Every port is in it by default — anyone plugged in could reach the switches', 'Tous les ports y sont par défaut — n’importe qui pourrait atteindre les switches'), t('It cannot have an IP', 'Il ne peut pas avoir d’IP'), t('It is reserved for phones', 'Il est réservé aux téléphones')],
          answer: 1,
          explain: t('Separating management limits who can even reach the admin interfaces.', 'Séparer la gestion limite qui peut même atteindre les interfaces d’administration.'),
        },
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Document it', 'Documentez'),
        body: t('Label switch ports and patch panels with their VLAN or use colour-coded patch cables (e.g. blue = data, yellow = voice, red = management). It looks like a detail — until an emergency.', 'Étiquetez ports de switch et panneaux de brassage avec leur VLAN ou utilisez des cordons de couleur (ex. bleu = données, jaune = voix, rouge = gestion). Ça semble un détail — jusqu’à l’urgence.'),
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Assign voice VLAN 30 to the current access port.', 'Affectez le VLAN voix 30 au port d’accès courant.'),
          accept: ['switchport voice vlan 30'],
          explain: 'switchport voice vlan 30',
          shell: 'SW1(config-if)#',
        },
      },
    ],
    vocabulary: [
      { term: t('Native VLAN', 'VLAN natif'), def: t('VLAN carried untagged on an 802.1Q trunk.', 'VLAN transporté sans étiquette sur un trunk 802.1Q.') },
      { term: t('Voice VLAN', 'VLAN voix'), def: t('Separate VLAN for IP phones on the same port as a PC.', 'VLAN séparé pour les téléphones IP sur le même port qu’un PC.') },
      { term: t('Black-hole VLAN', 'VLAN trou noir'), def: t('Unused VLAN for parking unused ports.', 'VLAN inutilisé pour garer les ports libres.') },
    ],
    practice: t('Security audits (ISO 27001, PCI-DSS) check exactly these points: management isolation, unused ports disabled, guest network separated.', 'Les audits de sécurité (ISO 27001, PCI-DSS) vérifient exactement ces points : gestion isolée, ports inutilisés désactivés, réseau invité séparé.'),
    quiz: [
      { kind: 'mcq', prompt: t('Unused ports should be…', 'Les ports inutilisés doivent être…'), options: [t('Left in VLAN 1', 'Laissés dans le VLAN 1'), t('Put in a parking VLAN and shut down', 'Mis dans un VLAN parking et coupés'), t('Set to trunk', 'Mis en trunk'), t('Given a static IP', 'Dotés d’une IP fixe')], answer: 1, explain: t('Parking + shutdown.', 'Parking + shutdown.') },
      { kind: 'tf', prompt: t('A phone and a PC can share one switch port using a voice VLAN.', 'Un téléphone et un PC peuvent partager un port grâce au VLAN voix.'), answer: true, explain: t('The PC plugs into the phone.', 'Le PC se branche sur le téléphone.') },
      { kind: 'mcq', prompt: t('Guest Wi-Fi should…', 'Le Wi-Fi invités doit…'), options: [t('Share the Sales VLAN', 'Partager le VLAN Commercial'), t('Have its own VLAN with Internet-only access', 'Avoir son VLAN avec accès Internet uniquement'), t('Be in the management VLAN', 'Être dans le VLAN de gestion'), t('Use VLAN 1', 'Utiliser le VLAN 1')], answer: 1, explain: t('Remember the DHCP exhaustion incident!', 'Souvenez-vous de l’incident d’épuisement DHCP !') },
    ],
  },
]

export const trunkLessons: Lesson[] = [
  {
    id: 'l2-trunk.1',
    title: t('802.1Q trunks', 'Les trunks 802.1Q'),
    minutes: 12,
    objectives: [
      t('Explain how VLAN tags cross a link between switches', 'Expliquer comment les étiquettes VLAN traversent un lien entre switches'),
      t('Configure and verify a trunk', 'Configurer et vérifier un trunk'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('One cable, many VLANs', 'Un câble, plusieurs VLAN'),
        body: t('Between two switches you could run one cable per VLAN — impossible with 30 VLANs. A **trunk** carries all of them on one link. Each frame gets a 4-byte **802.1Q tag** with its VLAN ID while it crosses the trunk; the receiving switch removes it.', 'Entre deux switches, on pourrait tirer un câble par VLAN — impossible avec 30 VLAN. Un **trunk** les transporte tous sur un lien. Chaque trame reçoit une **étiquette 802.1Q** de 4 octets avec son numéro de VLAN pendant qu’elle traverse le trunk ; le switch d’arrivée la retire.'),
      },
      { type: 'animation', anim: 'vlan-tag', title: t('Tagging across a trunk', 'Étiquetage à travers un trunk') },
      {
        type: 'example',
        title: t('Configure the trunk on both ends', 'Configurer le trunk aux deux bouts'),
        body: t('Limit the allowed VLANs to the ones really needed and change the native VLAN (same on both ends!).', 'Limitez les VLAN autorisés à ceux vraiment utiles et changez le VLAN natif (identique aux deux bouts !).'),
        code: 'SW1(config)# interface gi0/1\nSW1(config-if)# switchport mode trunk\nSW1(config-if)# switchport trunk allowed vlan 10,20,30,99\nSW1(config-if)# switchport trunk native vlan 998\nSW1(config-if)# end\nSW1# show interfaces trunk\nPort        Mode         Encapsulation  Status        Native vlan\nGi0/1       on           802.1q         trunking      998\n\nPort        Vlans allowed on trunk\nGi0/1       10,20,30,99',
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Make the current interface a trunk.', 'Faites de l’interface courante un trunk.'),
          accept: ['switchport mode trunk'],
          explain: 'switchport mode trunk',
          shell: 'SW1(config-if)#',
        },
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Classic trunk faults', 'Pannes de trunk classiques'),
        body: t('- A VLAN missing from `allowed vlan` → that VLAN works on each switch but not across.\n- **Native VLAN mismatch** → CDP warnings and traffic leaking between VLANs.\n- One side trunk, other side access → only one VLAN gets through.', '- Un VLAN absent de `allowed vlan` → ce VLAN marche sur chaque switch mais pas entre eux.\n- **VLAN natif différent** → alertes CDP et fuite de trafic entre VLAN.\n- Un côté trunk, l’autre en accès → un seul VLAN passe.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('VLAN 30 works on SW1 and on SW2 separately, but not between them. Most likely?', 'Le VLAN 30 marche sur SW1 et sur SW2 séparément, mais pas entre eux. Cause probable ?'),
          options: [t('DNS', 'DNS'), t('VLAN 30 not allowed on the trunk', 'VLAN 30 non autorisé sur le trunk'), t('Bad PC cable', 'Mauvais câble PC'), t('Router down', 'Routeur en panne')],
          answer: 1,
          explain: t('Check show interfaces trunk.', 'Vérifiez show interfaces trunk.'),
        },
      },
    ],
    vocabulary: [
      { term: t('Trunk', 'Trunk'), def: t('Link carrying several VLANs using tags.', 'Lien transportant plusieurs VLAN grâce aux étiquettes.') },
      { term: '802.1Q', def: t('IEEE standard for VLAN tagging (4-byte tag).', 'Norme IEEE d’étiquetage VLAN (étiquette de 4 octets).') },
      { term: t('Allowed VLANs', 'VLAN autorisés'), def: t('List of VLANs permitted on a trunk.', 'Liste des VLAN permis sur un trunk.') },
    ],
    practice: t('Trunks connect access switches to distribution/core switches, switches to wireless access points (each SSID = one VLAN) and to virtualisation hosts (each VM network = one VLAN).', 'Les trunks relient switches d’accès et de distribution/cœur, switches et bornes Wi-Fi (chaque SSID = un VLAN), et hyperviseurs (chaque réseau de VM = un VLAN).'),
    quiz: [
      { kind: 'mcq', prompt: t('How big is an 802.1Q tag?', 'Quelle taille fait une étiquette 802.1Q ?'), options: [t('1 byte', '1 octet'), t('4 bytes', '4 octets'), t('16 bytes', '16 octets'), t('64 bytes', '64 octets')], answer: 1, explain: t('4 bytes, including a 12-bit VLAN ID (1–4094).', '4 octets, dont un VLAN ID de 12 bits (1–4094).') },
      { kind: 'command', prompt: t('Show trunk status and allowed VLANs.', 'Afficher l’état des trunks et les VLAN autorisés.'), accept: ['show interfaces trunk', 'sh int trunk', 'show interface trunk', 'sh interfaces trunk'], explain: 'show interfaces trunk', shell: 'SW1#' },
      { kind: 'tf', prompt: t('The native VLAN travels untagged on a trunk.', 'Le VLAN natif circule sans étiquette sur un trunk.'), answer: true, explain: t('That is why it must match on both ends.', 'D’où la nécessité qu’il soit identique aux deux bouts.') },
      { kind: 'mcq', prompt: t('PCs connect to which kind of port?', 'Les PC se branchent sur quel type de port ?'), options: [t('Trunk', 'Trunk'), t('Access', 'Accès')], answer: 1, explain: t('Access.', 'Accès.') },
    ],
  },
  {
    id: 'l2-trunk.2',
    title: t('Inter-VLAN routing', 'Routage inter-VLAN'),
    minutes: 13,
    objectives: [
      t('Configure router-on-a-stick with sub-interfaces', 'Configurer un routeur sur un bâton avec sous-interfaces'),
      t('Configure SVIs on a layer 3 switch', 'Configurer des SVI sur un switch de niveau 3'),
    ],
    blocks: [
      { type: 'animation', anim: 'router-on-stick', title: t('Router on a stick', 'Routeur sur un bâton') },
      {
        type: 'example',
        title: t('Router-on-a-stick configuration', 'Configuration du routeur sur un bâton'),
        body: t('The physical interface has no IP; each sub-interface gets the gateway IP of one VLAN and the `encapsulation dot1q` VLAN ID. The switch port towards the router is a trunk.', 'L’interface physique n’a pas d’IP ; chaque sous-interface reçoit l’IP de passerelle d’un VLAN et le numéro `encapsulation dot1q`. Le port du switch vers le routeur est un trunk.'),
        code: 'R1(config)# interface g0/0/0\nR1(config-if)# no shutdown\nR1(config-if)# interface g0/0/0.10\nR1(config-subif)# encapsulation dot1q 10\nR1(config-subif)# ip address 192.168.10.1 255.255.255.0\nR1(config-subif)# interface g0/0/0.20\nR1(config-subif)# encapsulation dot1q 20\nR1(config-subif)# ip address 192.168.20.1 255.255.255.0',
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('On sub-interface g0/0/0.30, tag it for VLAN 30.', 'Sur la sous-interface g0/0/0.30, étiquetez-la pour le VLAN 30.'),
          accept: ['encapsulation dot1q 30', 'encapsulation dot1Q 30', 'encap dot1q 30'],
          explain: 'encapsulation dot1q 30',
          shell: 'R1(config-subif)#',
        },
      },
      {
        type: 'text',
        title: t('Layer 3 switches: the modern way', 'Switches de niveau 3 : la méthode moderne'),
        body: t('A router-on-a-stick pushes all inter-VLAN traffic through one cable twice — a bottleneck. A **layer 3 switch** routes in hardware at full speed: you create an **SVI** per VLAN and enable `ip routing`.', 'Un routeur sur un bâton fait passer tout le trafic inter-VLAN deux fois par un seul câble — un goulot d’étranglement. Un **switch de niveau 3** route au niveau matériel à pleine vitesse : on crée une **SVI** par VLAN et on active `ip routing`.'),
      },
      {
        type: 'code',
        code: 'CORE(config)# ip routing\nCORE(config)# interface vlan 10\nCORE(config-if)# ip address 192.168.10.1 255.255.255.0\nCORE(config-if)# no shutdown\nCORE(config-if)# interface vlan 20\nCORE(config-if)# ip address 192.168.20.1 255.255.255.0\nCORE(config-if)# no shutdown',
        caption: t('An SVI is up only if its VLAN exists and at least one port in that VLAN is up.', 'Une SVI n’est active que si son VLAN existe et qu’au moins un port de ce VLAN est actif.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which command turns a layer 3 switch into a router?', 'Quelle commande transforme un switch de niveau 3 en routeur ?'),
          options: ['ip routing', 'router on', 'switchport mode trunk', 'ip default-gateway'],
          answer: 0,
          explain: 'ip routing',
        },
      },
    ],
    vocabulary: [
      { term: t('Sub-interface', 'Sous-interface'), def: t('Logical interface on a router port (g0/0/0.10), one per VLAN.', 'Interface logique sur un port de routeur (g0/0/0.10), une par VLAN.') },
      { term: t('Layer 3 switch', 'Switch de niveau 3'), def: t('Switch that can also route between VLANs.', 'Switch capable aussi de router entre VLAN.') },
    ],
    practice: t('In real companies, inter-VLAN routing usually happens on the core layer 3 switch, and traffic to the Internet or between security zones goes through a firewall.', 'En entreprise, le routage inter-VLAN se fait généralement sur le switch de cœur de niveau 3, et le trafic vers Internet ou entre zones de sécurité passe par un pare-feu.'),
    quiz: [
      { kind: 'mcq', prompt: t('The switch port facing a router-on-a-stick must be…', 'Le port de switch face au routeur sur un bâton doit être…'), options: [t('Access VLAN 1', 'Accès VLAN 1'), t('A trunk', 'Un trunk'), t('Shut down', 'Coupé'), t('Routed', 'Routé')], answer: 1, explain: t('Trunk.', 'Trunk.') },
      { kind: 'tf', prompt: t('In router-on-a-stick, the physical interface gets the gateway IP.', 'Dans le routeur sur un bâton, l’interface physique reçoit l’IP de passerelle.'), answer: false, explain: t('Sub-interfaces do.', 'Ce sont les sous-interfaces.') },
      { kind: 'command', prompt: t('Create the SVI for VLAN 10.', 'Créez la SVI du VLAN 10.'), accept: ['interface vlan 10', 'int vlan 10', 'interface vlan10'], explain: 'interface vlan 10', shell: 'CORE(config)#' },
      { kind: 'mcq', prompt: t('Main drawback of router-on-a-stick?', 'Principal inconvénient du routeur sur un bâton ?'), options: [t('No VLAN support', 'Pas de VLAN'), t('Single link bottleneck', 'Goulot d’un lien unique'), t('Needs IPv6', 'Exige IPv6'), t('Cannot use DHCP', 'Pas de DHCP')], answer: 1, explain: t('All inter-VLAN traffic crosses one link twice.', 'Tout le trafic inter-VLAN traverse un lien deux fois.') },
    ],
  },
]

export const routingLessons: Lesson[] = [
  {
    id: 'l2-routing.1',
    title: t('Static routes and the default route', 'Routes statiques et route par défaut'),
    minutes: 14,
    objectives: [
      t('Write static routes with a next hop', 'Écrire des routes statiques avec un saut suivant'),
      t('Configure a default route towards the Internet', 'Configurer une route par défaut vers Internet'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Teaching routers about remote networks', 'Faire connaître les réseaux distants'),
        body: t('A router knows only its connected networks. For anything else you can add a **static route**: `ip route <network> <mask> <next-hop>`. The next hop must be reachable on a connected network.', 'Un routeur ne connaît que ses réseaux connectés. Pour le reste, on ajoute une **route statique** : `ip route <réseau> <masque> <saut-suivant>`. Le saut suivant doit être joignable sur un réseau connecté.'),
      },
      {
        type: 'example',
        title: t('Head office and branch', 'Siège et agence'),
        body: t('HQ LAN 10.1.0.0/24 — R-HQ — link 172.16.0.0/30 — R-BR — Branch LAN 10.2.0.0/24. Each router needs a route to the other LAN. R-HQ also has the Internet: a default route.', 'LAN siège 10.1.0.0/24 — R-HQ — lien 172.16.0.0/30 — R-BR — LAN agence 10.2.0.0/24. Chaque routeur a besoin d’une route vers l’autre LAN. R-HQ a aussi Internet : une route par défaut.'),
        code: 'R-HQ(config)# ip route 10.2.0.0 255.255.255.0 172.16.0.2\nR-HQ(config)# ip route 0.0.0.0 0.0.0.0 203.0.113.1\n\nR-BR(config)# ip route 0.0.0.0 0.0.0.0 172.16.0.1\n! the branch sends EVERYTHING it does not know to HQ',
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Add a default route via 203.0.113.1.', 'Ajoutez une route par défaut via 203.0.113.1.'),
          accept: ['ip route 0.0.0.0 0.0.0.0 203.0.113.1'],
          explain: 'ip route 0.0.0.0 0.0.0.0 203.0.113.1',
          shell: 'R1(config)#',
        },
      },
      {
        type: 'table',
        head: [t('Pros of static routes', 'Avantages'), t('Cons', 'Inconvénients')],
        rows: [
          [t('Simple, predictable, no CPU or bandwidth used', 'Simples, prévisibles, sans CPU ni bande passante'), t('Do not adapt when a link fails', 'Ne s’adaptent pas en cas de panne')],
          [t('Secure — nothing advertised', 'Sûres — rien n’est annoncé'), t('Painful with many networks', 'Pénibles avec beaucoup de réseaux')],
          [t('Perfect for stub sites (one exit) and default routes', 'Parfaites pour les sites terminaux (une sortie) et routes par défaut'), t('Typos break routing silently', 'Une faute de frappe casse le routage sans bruit')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('R-BR has only one link (to HQ). The best routing setup is…', 'R-BR n’a qu’un lien (vers le siège). La meilleure configuration est…'),
          options: [t('One default route to HQ', 'Une route par défaut vers le siège'), t('OSPF', 'OSPF'), t('No routing', 'Pas de routage'), t('A route per Internet site', 'Une route par site Internet')],
          answer: 0,
          explain: t('A stub site needs just a default route.', 'Un site terminal a juste besoin d’une route par défaut.'),
        },
      },
    ],
    vocabulary: [
      { term: t('Static route', 'Route statique'), def: t('Route typed by an administrator.', 'Route saisie par un administrateur.') },
      { term: t('Stub network', 'Réseau terminal'), def: t('Network with only one way out.', 'Réseau avec une seule sortie.') },
      { term: t('Floating static route', 'Route statique flottante'), def: t('Backup static route with a higher administrative distance.', 'Route statique de secours avec une distance administrative plus élevée.') },
    ],
    practice: t('The incident "The company loses Internet access" is a missing default route on the firewall. You now know how to fix it in one line.', 'L’incident « L’entreprise perd l’accès Internet » est une route par défaut manquante sur le pare-feu. Vous savez maintenant la corriger en une ligne.'),
    quiz: [
      { kind: 'command', prompt: t('Route 10.5.0.0/16 via 192.168.1.2.', 'Route vers 10.5.0.0/16 via 192.168.1.2.'), accept: ['ip route 10.5.0.0 255.255.0.0 192.168.1.2'], explain: 'ip route 10.5.0.0 255.255.0.0 192.168.1.2', shell: 'R1(config)#' },
      { kind: 'tf', prompt: t('Static routes automatically avoid failed links.', 'Les routes statiques évitent automatiquement les liens en panne.'), answer: false, explain: t('They do not adapt.', 'Elles ne s’adaptent pas.') },
      { kind: 'mcq', prompt: t('The next hop of a static route must be…', 'Le saut suivant d’une route statique doit être…'), options: [t('Anywhere on the Internet', 'N’importe où sur Internet'), t('Reachable on a connected network', 'Joignable sur un réseau connecté'), t('A DNS server', 'Un serveur DNS'), t('A switch', 'Un switch')], answer: 1, explain: t('Directly reachable.', 'Directement joignable.') },
    ],
  },
  {
    id: 'l2-routing.2',
    title: t('Dynamic routing and OSPF basics', 'Routage dynamique et bases d’OSPF'),
    minutes: 15,
    objectives: [
      t('Explain what a routing protocol does', 'Expliquer ce que fait un protocole de routage'),
      t('Configure single-area OSPF', 'Configurer OSPF en zone unique'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Routers that talk to each other', 'Des routeurs qui se parlent'),
        body: t('With **dynamic routing**, routers exchange information about the networks they know, build their tables automatically and **reroute around failures**. Inside a company, the most common protocol is **OSPF** (link-state, open standard). Between ISPs, the Internet uses **BGP**.', 'Avec le **routage dynamique**, les routeurs échangent des informations sur les réseaux qu’ils connaissent, construisent leurs tables automatiquement et **contournent les pannes**. En entreprise, le protocole le plus courant est **OSPF** (état de liens, standard ouvert). Entre FAI, Internet utilise **BGP**.'),
      },
      { type: 'animation', anim: 'dynamic-routing', title: t('OSPF finds a new path after a failure', 'OSPF trouve un nouveau chemin après une panne') },
      {
        type: 'example',
        title: t('OSPF in three lines per router', 'OSPF en trois lignes par routeur'),
        body: t('`network` statements tell OSPF which interfaces to use (with a **wildcard mask** — the inverse of the subnet mask). All routers in the example are in **area 0**.', 'Les commandes `network` indiquent à OSPF quelles interfaces utiliser (avec un **masque générique** — l’inverse du masque). Tous les routeurs de l’exemple sont dans l’**area 0**.'),
        code: 'R1(config)# router ospf 1\nR1(config-router)# router-id 1.1.1.1\nR1(config-router)# network 10.1.0.0 0.0.0.255 area 0\nR1(config-router)# network 172.16.0.0 0.0.0.3 area 0\nR1(config-router)# passive-interface g0/0/0   ! no OSPF hellos towards the user LAN\n\nR1# show ip ospf neighbor\nNeighbor ID   Pri  State      Dead Time  Address      Interface\n2.2.2.2         1  FULL/DR    00:00:34   172.16.0.2   Gi0/0/1',
      },
      {
        type: 'check',
        question: {
          kind: 'input',
          prompt: t('Wildcard mask for 255.255.255.0?', 'Masque générique pour 255.255.255.0 ?'),
          accept: ['0.0.0.255'],
          explain: t('255 − each octet: 0.0.0.255.', '255 − chaque octet : 0.0.0.255.'),
        },
      },
      {
        type: 'table',
        head: [t('Protocol', 'Protocole'), t('Type', 'Type'), t('Metric', 'Métrique'), t('Where', 'Où')],
        rows: [
          ['RIP', t('Distance vector', 'Vecteur de distance'), t('Hop count (max 15)', 'Nombre de sauts (max 15)'), t('Legacy, labs', 'Ancien, labs')],
          ['OSPF', t('Link state', 'État de liens'), t('Cost (bandwidth)', 'Coût (bande passante)'), t('Enterprise networks', 'Réseaux d’entreprise')],
          ['EIGRP', t('Advanced distance vector', 'Vecteur de distance avancé'), t('Bandwidth + delay', 'Bande passante + délai'), t('Cisco networks', 'Réseaux Cisco')],
          ['BGP', t('Path vector', 'Vecteur de chemin'), t('Policies / AS path', 'Politiques / chemin d’AS'), t('Internet, ISPs, cloud', 'Internet, FAI, cloud')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which protocol routes between Internet providers?', 'Quel protocole route entre fournisseurs d’accès ?'),
          options: ['RIP', 'OSPF', 'BGP', 'ARP'],
          answer: 2,
          explain: 'BGP.',
        },
      },
    ],
    vocabulary: [
      { term: 'OSPF', def: t('Open Shortest Path First — link-state routing protocol.', 'Open Shortest Path First — protocole à état de liens.') },
      { term: t('Wildcard mask', 'Masque générique'), def: t('Inverse mask used by OSPF and ACLs.', 'Masque inversé utilisé par OSPF et les ACL.') },
      { term: t('Neighbour adjacency', 'Adjacence'), def: t('Relationship between two OSPF routers (state FULL).', 'Relation entre deux routeurs OSPF (état FULL).') },
      { term: t('Convergence', 'Convergence'), def: t('Time for all routers to agree after a change.', 'Temps pour que tous les routeurs s’accordent après un changement.') },
    ],
    practice: t('`show ip ospf neighbor` is your first check when OSPF routes disappear: no FULL neighbour means no routes. Common causes: mismatched area, subnet, hello timers or a passive interface on the wrong side.', '`show ip ospf neighbor` est la première vérification quand des routes OSPF disparaissent : pas de voisin FULL = pas de routes. Causes fréquentes : area, sous-réseau ou timers différents, ou interface passive du mauvais côté.'),
    quiz: [
      { kind: 'mcq', prompt: t('OSPF chooses paths by…', 'OSPF choisit les chemins selon…'), options: [t('Hop count', 'Nombre de sauts'), t('Cost based on bandwidth', 'Coût basé sur la bande passante'), t('Alphabetical order', 'Ordre alphabétique'), t('Random', 'Hasard')], answer: 1, explain: t('Cost.', 'Coût.') },
      { kind: 'tf', prompt: t('Dynamic routing can reroute traffic automatically when a link fails.', 'Le routage dynamique peut réacheminer le trafic automatiquement en cas de panne.'), answer: true, explain: t('Convergence.', 'Convergence.') },
      { kind: 'command', prompt: t('Start OSPF process 1.', 'Démarrez le processus OSPF 1.'), accept: ['router ospf 1'], explain: 'router ospf 1', shell: 'R1(config)#' },
      { kind: 'command', prompt: t('List OSPF neighbours.', 'Lister les voisins OSPF.'), accept: ['show ip ospf neighbor', 'sh ip ospf nei', 'show ip ospf neighbour', 'sh ip ospf neighbor'], explain: 'show ip ospf neighbor', shell: 'R1#' },
    ],
  },
  {
    id: 'l2-routing.3',
    title: t('Choosing between routes: distance and metric', 'Choisir entre les routes : distance et métrique'),
    minutes: 11,
    objectives: [
      t('Use administrative distance to compare route sources', 'Utiliser la distance administrative pour comparer les sources'),
      t('Build a backup path with a floating static route', 'Construire un chemin de secours avec une route statique flottante'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Three tie-breakers, in order', 'Trois critères, dans l’ordre'),
        body: t('1. **Longest prefix** always wins.\n2. Same prefix from different sources → lowest **administrative distance** (trust).\n3. Same source → lowest **metric** (cost).\n\nIn `[110/2]` from `show ip route`, 110 is the AD and 2 the metric.', '1. Le **préfixe le plus long** gagne toujours.\n2. Même préfixe de sources différentes → plus petite **distance administrative** (confiance).\n3. Même source → plus petite **métrique** (coût).\n\nDans `[110/2]` de `show ip route`, 110 est la DA et 2 la métrique.'),
      },
      {
        type: 'table',
        head: [t('Source', 'Source'), t('Administrative distance', 'Distance administrative')],
        rows: [
          [t('Connected', 'Connectée'), '0'],
          [t('Static', 'Statique'), '1'],
          ['EIGRP', '90'],
          ['OSPF', '110'],
          ['RIP', '120'],
          [t('Unusable', 'Inutilisable'), '255'],
        ],
      },
      {
        type: 'example',
        title: t('Floating static backup over 4G', 'Secours statique flottant via 4G'),
        body: t('The branch normally learns HQ via OSPF (AD 110). A static route with AD **200** stays hidden ("floats") while OSPF works, and appears only if OSPF loses the route.', 'L’agence apprend normalement le siège via OSPF (DA 110). Une route statique de DA **200** reste cachée (« flotte ») tant qu’OSPF fonctionne, et n’apparaît que si OSPF perd la route.'),
        code: 'R-BR(config)# ip route 10.1.0.0 255.255.0.0 100.64.0.1 200',
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Same prefix learnt by OSPF and by a static route (default AD). Which is used?', 'Même préfixe appris par OSPF et par une route statique (DA par défaut). Laquelle est utilisée ?'),
          options: ['OSPF', t('Static', 'Statique'), t('Both equally', 'Les deux'), t('Neither', 'Aucune')],
          answer: 1,
          explain: t('Static AD 1 < OSPF 110.', 'DA statique 1 < OSPF 110.'),
        },
      },
    ],
    vocabulary: [
      { term: t('Administrative distance', 'Distance administrative'), def: t('Trust level of a route source (lower = preferred).', 'Niveau de confiance d’une source (plus bas = préféré).') },
      { term: t('Metric', 'Métrique'), def: t('Cost of a path within one routing protocol.', 'Coût d’un chemin dans un protocole de routage.') },
    ],
    practice: t('Many small companies use exactly this design: fibre as primary, 4G/5G router as backup with a floating static route.', 'Beaucoup de PME utilisent exactement ce schéma : fibre en principal, routeur 4G/5G en secours avec une route statique flottante.'),
    quiz: [
      { kind: 'input', prompt: t('Administrative distance of OSPF?', 'Distance administrative d’OSPF ?'), accept: ['110'], explain: '110.' },
      { kind: 'mcq', prompt: t('What wins first: AD or prefix length?', 'Qu’est-ce qui l’emporte d’abord : la DA ou la longueur de préfixe ?'), options: ['AD', t('Prefix length', 'Longueur de préfixe')], answer: 1, explain: t('Longest prefix first.', 'Le préfixe le plus long d’abord.') },
      { kind: 'mcq', prompt: t('In [110/20], 20 is…', 'Dans [110/20], 20 est…'), options: [t('The AD', 'La DA'), t('The metric', 'La métrique'), t('The VLAN', 'Le VLAN'), t('Hop count', 'Le nombre de sauts')], answer: 1, explain: t('Metric.', 'Métrique.') },
    ],
  },
  {
    id: 'l2-routing.4',
    title: t('Troubleshooting routing', 'Dépanner le routage'),
    minutes: 13,
    objectives: [
      t('Apply a step-by-step method to "network A cannot reach network B"', 'Appliquer une méthode pas à pas pour « le réseau A n’atteint pas le réseau B »'),
      t('Recognise the classic routing mistakes', 'Reconnaître les erreurs de routage classiques'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('The method', 'La méthode'),
        body: t('1. From the host: `ipconfig` — correct IP, mask, **gateway**?\n2. `ping` the gateway → layer 1–3 local OK?\n3. `tracert` the destination → where does it stop?\n4. On that router: `show ip route <destination>` → is there a route? Is the exit interface up (`show ip interface brief`)?\n5. Check the **return path** on the routers on the way back.\n6. Still nothing? A firewall/ACL may be filtering.', '1. Depuis l’hôte : `ipconfig` — IP, masque, **passerelle** corrects ?\n2. `ping` la passerelle → couches 1–3 locales OK ?\n3. `tracert` la destination → où cela s’arrête-t-il ?\n4. Sur ce routeur : `show ip route <destination>` → y a-t-il une route ? L’interface de sortie est-elle active (`show ip interface brief`) ?\n5. Vérifiez le **chemin de retour** sur les routeurs.\n6. Toujours rien ? Un pare-feu/ACL filtre peut-être.'),
      },
      {
        type: 'table',
        head: [t('Symptom', 'Symptôme'), t('Typical cause', 'Cause typique')],
        rows: [
          [t('Can ping gateway, nothing beyond', 'Ping passerelle OK, rien au-delà'), t('No default route / missing route on the router', 'Pas de route par défaut / route manquante sur le routeur')],
          [t('tracert reaches the far router, then * * *', 'tracert atteint le routeur distant puis * * *'), t('No return route, or destination host firewall', 'Pas de route de retour, ou pare-feu de l’hôte')],
          [t('Ping shows U U U', 'Ping affiche U U U'), t('A router has no route and says so', 'Un routeur n’a pas de route et le signale')],
          [t('Works one way only after a change', 'Marche dans un sens seulement après un changement'), t('Typo in a next-hop or mask', 'Faute de frappe dans un saut suivant ou un masque')],
          [t('Routing loop: TTL expired in transit', 'Boucle : TTL expiré en transit'), t('Two routers pointing default routes at each other', 'Deux routeurs dont les routes par défaut pointent l’un vers l’autre')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('tracert shows 10.0.0.1, 172.16.0.2, 172.16.0.2, 172.16.0.1, 172.16.0.2… What is it?', 'tracert affiche 10.0.0.1, 172.16.0.2, 172.16.0.2, 172.16.0.1, 172.16.0.2… Qu’est-ce que c’est ?'),
          options: [t('A routing loop', 'Une boucle de routage'), t('A DNS problem', 'Un problème DNS'), t('A broken cable', 'Un câble cassé'), t('Normal', 'Normal')],
          answer: 0,
          explain: t('The packet bounces between two routers until TTL expires.', 'Le paquet rebondit entre deux routeurs jusqu’à expiration du TTL.'),
        },
      },
      {
        type: 'example',
        title: t('show ip route for one destination', 'show ip route pour une destination'),
        body: t('Instead of reading the whole table, ask the router directly which route it would use.', 'Au lieu de lire toute la table, demandez directement au routeur quelle route il utiliserait.'),
        code: 'R1# show ip route 10.2.5.9\nRouting entry for 10.2.5.0/24\n  Known via "static", distance 1, metric 0\n  Routing Descriptor Blocks:\n  * 172.16.1.2\n      Route metric is 0, traffic share count is 1',
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('Change one thing at a time', 'Changez une seule chose à la fois'),
        body: t('Under pressure it is tempting to change five settings at once. Then you do not know which one fixed it — or which one broke something else. Change, test, note, repeat.', 'Sous pression, on a envie de changer cinq réglages d’un coup. Ensuite on ne sait plus lequel a réparé — ou lequel a cassé autre chose. Changez, testez, notez, recommencez.'),
      },
    ],
    vocabulary: [
      { term: t('Return path', 'Chemin de retour'), def: t('Route the reply takes back to the source.', 'Route empruntée par la réponse vers la source.') },
      { term: t('Routing loop', 'Boucle de routage'), def: t('Packets circulating between routers until TTL expires.', 'Paquets qui tournent entre routeurs jusqu’à expiration du TTL.') },
    ],
    practice: t('Write your findings in the ticket as you go (what you tested, result). If you hand over to a colleague, they continue where you stopped instead of starting again.', 'Notez vos constats dans le ticket au fur et à mesure (ce que vous avez testé, le résultat). Si vous passez la main, votre collègue continue là où vous vous êtes arrêté.'),
    quiz: [
      { kind: 'mcq', prompt: t('First step when a host cannot reach a remote network?', 'Première étape quand un hôte n’atteint pas un réseau distant ?'), options: [t('Reboot the router', 'Redémarrer le routeur'), t('Check its IP, mask and gateway', 'Vérifier son IP, masque et passerelle'), t('Change OSPF', 'Modifier OSPF'), t('Replace the switch', 'Remplacer le switch')], answer: 1, explain: t('Start at the host.', 'Commencez par l’hôte.') },
      { kind: 'tf', prompt: t('A missing return route can make ping fail even if the request arrives.', 'Une route de retour manquante peut faire échouer un ping même si la requête arrive.'), answer: true, explain: t('There and back.', 'Aller et retour.') },
      { kind: 'command', prompt: t('Ask R1 which route it uses for 10.9.9.9.', 'Demandez à R1 quelle route il utilise pour 10.9.9.9.'), accept: ['show ip route 10.9.9.9', 'sh ip route 10.9.9.9', 'sh ip ro 10.9.9.9'], explain: 'show ip route 10.9.9.9', shell: 'R1#' },
    ],
  },
]
