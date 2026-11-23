import { t, type Lesson } from '../types'

export const netIntroLessons: Lesson[] = [
  {
    id: 'l1-net-intro.1',
    title: t('What is a network?', 'Qu’est-ce qu’un réseau ?'),
    minutes: 11,
    objectives: [
      t('Define nodes, links and the purpose of a network', 'Définir nœuds, liens et l’intérêt d’un réseau'),
      t('Distinguish PAN, LAN, MAN and WAN', 'Distinguer PAN, LAN, MAN et WAN'),
      t('Explain why the Internet is a "network of networks"', 'Expliquer pourquoi Internet est un « réseau de réseaux »'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Devices that share', 'Des appareils qui partagent'),
        body: t(
          'A **network** is two or more devices (**nodes**) connected by **links** (cables or radio) so they can exchange data. Companies build networks to **share resources**: files, printers, internet access, applications and communication.\n\nEvery node has a **network interface** (NIC) and follows common rules called **protocols** — like a shared language.',
          'Un **réseau**, ce sont deux appareils ou plus (**nœuds**) reliés par des **liens** (câbles ou ondes) pour échanger des données. Les entreprises construisent des réseaux pour **partager des ressources** : fichiers, imprimantes, accès internet, applications et communication.\n\nChaque nœud possède une **interface réseau** (carte réseau) et suit des règles communes appelées **protocoles** — comme une langue partagée.',
        ),
      },
      { type: 'diagram', diagram: 'lan-wan', caption: t('Two LANs (offices) joined by a WAN link through the Internet.', 'Deux LAN (bureaux) reliés par une liaison WAN via Internet.') },
      {
        type: 'table',
        head: [t('Type', 'Type'), t('Scale', 'Échelle'), t('Example', 'Exemple')],
        rows: [
          ['PAN', t('A few metres', 'Quelques mètres'), t('Bluetooth headset and phone', 'Casque Bluetooth et téléphone')],
          ['LAN', t('A building or floor', 'Un bâtiment ou un étage'), t('The office network', 'Le réseau du bureau')],
          ['WLAN', t('Same, wireless', 'Idem, sans fil'), t('Office Wi-Fi', 'Le Wi-Fi du bureau')],
          ['MAN', t('A city', 'Une ville'), t('A university campus across town', 'Un campus universitaire en ville')],
          ['WAN', t('Countries, continents', 'Pays, continents'), t('Head office linked to branch offices', 'Siège relié aux agences')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A company connects its Paris and Lyon offices. That link is a…', 'Une entreprise relie ses bureaux de Paris et Lyon. Cette liaison est un…'),
          options: ['PAN', 'LAN', 'WAN', 'WLAN'],
          answer: 2,
          explain: t('Long-distance links between sites form a WAN.', 'Les liaisons longue distance entre sites forment un WAN.'),
        },
      },
      {
        type: 'text',
        title: t('The Internet', 'Internet'),
        body: t(
          'The **Internet** is not one network: it is thousands of independent networks (ISPs, companies, universities, cloud providers) that agreed to **interconnect** using the same protocols — **TCP/IP**. Your company LAN joins it through an **ISP** (Internet Service Provider).',
          '**Internet** n’est pas un réseau unique : ce sont des milliers de réseaux indépendants (FAI, entreprises, universités, fournisseurs cloud) qui ont accepté de **s’interconnecter** avec les mêmes protocoles — **TCP/IP**. Le LAN de votre entreprise s’y raccorde via un **FAI** (fournisseur d’accès).',
        ),
      },
      {
        type: 'callout',
        tone: 'info',
        title: t('Bandwidth vs latency', 'Bande passante vs latence'),
        body: t('**Bandwidth** is how much data per second a link can carry (the width of the motorway). **Latency** is how long one packet takes to travel (the travel time). A video call needs low latency; a backup needs bandwidth.', 'La **bande passante** est la quantité de données par seconde qu’un lien transporte (la largeur de l’autoroute). La **latence** est le temps de trajet d’un paquet. Une visio a besoin d’une faible latence ; une sauvegarde a besoin de bande passante.'),
      },
    ],
    vocabulary: [
      { term: t('Node', 'Nœud'), def: t('Any device on a network.', 'Tout appareil d’un réseau.') },
      { term: 'NIC', def: t('Network Interface Card — connects a device to a network.', 'Carte d’interface réseau — connecte un appareil au réseau.') },
      { term: t('Protocol', 'Protocole'), def: t('Agreed rules for communication.', 'Règles convenues de communication.') },
      { term: 'LAN / WAN', def: t('Local / Wide Area Network.', 'Réseau local / étendu.') },
      { term: t('ISP', 'FAI'), def: t('Internet Service Provider.', 'Fournisseur d’accès à Internet.') },
    ],
    practice: t(
      'On your first day in a company, ask for the network diagram. Identify: how many sites (WAN), how many LANs per site, where the internet connection enters. This map is the foundation of every troubleshooting session.',
      'Dès votre premier jour en entreprise, demandez le schéma réseau. Identifiez : combien de sites (WAN), combien de LAN par site, où entre la connexion internet. Cette carte est la base de tout dépannage.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('An office Wi-Fi network is a…', 'Le Wi-Fi d’un bureau est un…'), options: ['WAN', 'WLAN', 'MAN', 'PAN'], answer: 1, explain: t('Wireless LAN.', 'LAN sans fil.') },
      { kind: 'tf', prompt: t('The Internet is owned and run by a single company.', 'Internet appartient à une seule entreprise qui le gère.'), answer: false, explain: t('It is a network of independent networks.', 'C’est un réseau de réseaux indépendants.') },
      { kind: 'mcq', prompt: t('Rules that devices follow to communicate are called…', 'Les règles que suivent les appareils pour communiquer s’appellent…'), options: [t('Drivers', 'Pilotes'), t('Protocols', 'Protocoles'), t('Partitions', 'Partitions'), t('Cmdlets', 'Cmdlets')], answer: 1, explain: t('Protocols.', 'Protocoles.') },
      { kind: 'mcq', prompt: t('Video calls stutter but large downloads are fast. Most likely issue?', 'Les visios saccadent mais les gros téléchargements sont rapides. Problème probable ?'), options: [t('High latency/jitter', 'Latence/gigue élevée'), t('Too much bandwidth', 'Trop de bande passante'), t('Wrong filesystem', 'Mauvais système de fichiers'), t('FAT32', 'FAT32')], answer: 0, explain: t('Real-time traffic is latency-sensitive.', 'Le temps réel est sensible à la latence.') },
    ],
  },
  {
    id: 'l1-net-intro.2',
    title: t('Clients, servers and topologies', 'Clients, serveurs et topologies'),
    minutes: 11,
    objectives: [
      t('Compare client-server and peer-to-peer models', 'Comparer les modèles client-serveur et pair-à-pair'),
      t('Recognise star, bus, ring and mesh topologies', 'Reconnaître les topologies étoile, bus, anneau et maillée'),
      t('Explain why modern LANs use a star topology', 'Expliquer pourquoi les LAN modernes sont en étoile'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Who serves whom?', 'Qui sert qui ?'),
        body: t(
          'In the **client-server** model, **servers** provide services (files, email, websites, authentication) and **clients** request them. It centralises management, security and backups — the standard in companies.\n\nIn **peer-to-peer**, every machine is both client and server (a small home network sharing a folder). Easy, but hard to manage and secure beyond a few devices.',
          'Dans le modèle **client-serveur**, les **serveurs** fournissent des services (fichiers, e-mail, sites web, authentification) et les **clients** les demandent. Cela centralise gestion, sécurité et sauvegardes — le standard en entreprise.\n\nEn **pair-à-pair**, chaque machine est à la fois client et serveur (un petit réseau domestique qui partage un dossier). Simple, mais difficile à gérer et sécuriser au-delà de quelques appareils.',
        ),
      },
      { type: 'diagram', diagram: 'topologies', caption: t('Physical topologies: how devices are wired together.', 'Topologies physiques : comment les appareils sont câblés entre eux.') },
      {
        type: 'table',
        head: [t('Topology', 'Topologie'), t('How it works', 'Fonctionnement'), t('Weakness', 'Faiblesse')],
        rows: [
          [t('Star', 'Étoile'), t('Every device cables to a central switch', 'Chaque appareil est câblé à un commutateur central'), t('The central switch is a single point of failure', 'Le commutateur central est un point unique de panne')],
          ['Bus', t('All devices share one cable (old coax)', 'Tous partagent un câble (ancien coaxial)'), t('One break takes everyone down', 'Une coupure arrête tout le monde')],
          [t('Ring', 'Anneau'), t('Data travels around a loop', 'Les données font le tour d’une boucle'), t('A break interrupts the loop (unless dual ring)', 'Une coupure interrompt la boucle (sauf double anneau)')],
          [t('Mesh', 'Maillée'), t('Many redundant links between nodes', 'Nombreux liens redondants'), t('Expensive, lots of cabling', 'Coûteuse, beaucoup de câblage')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('In a star topology, one PC’s cable is cut. What happens?', 'En topologie étoile, le câble d’un PC est coupé. Que se passe-t-il ?'),
          options: [t('The whole network stops', 'Tout le réseau s’arrête'), t('Only that PC loses connectivity', 'Seul ce PC perd la connexion'), t('The switch reboots', 'Le commutateur redémarre'), t('Nothing changes', 'Rien ne change')],
          answer: 1,
          explain: t('Each device has its own link to the switch — failures are isolated.', 'Chaque appareil a son propre lien vers le commutateur — les pannes sont isolées.'),
        },
      },
      { type: 'diagram', diagram: 'rack', caption: t('Inside the network room: a typical office rack, from the patch panel at the top to the UPS at the bottom.', 'Dans le local réseau : une baie de bureau typique, du panneau de brassage en haut à l’onduleur en bas.') },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Real networks mix them', 'Les vrais réseaux les combinent'),
        body: t('Offices use a **star** at the edge (PCs → access switch) and a partial **mesh** in the core (redundant links between core switches and routers) so one failure does not stop the business. This is called **hierarchical design** — you will build it in Level 6.', 'Les bureaux utilisent une **étoile** en périphérie (PC → commutateur d’accès) et un **maillage** partiel au cœur (liens redondants entre commutateurs de cœur et routeurs) pour qu’une panne n’arrête pas l’activité. C’est la **conception hiérarchique** — vous la construirez au niveau 6.'),
      },
    ],
    vocabulary: [
      { term: t('Client', 'Client'), def: t('A device requesting a service.', 'Appareil qui demande un service.') },
      { term: t('Server', 'Serveur'), def: t('A device providing a service.', 'Appareil qui fournit un service.') },
      { term: t('Topology', 'Topologie'), def: t('The layout of connections in a network.', 'Disposition des connexions d’un réseau.') },
      { term: t('Single point of failure', 'Point unique de panne'), def: t('A component whose failure stops the whole system.', 'Composant dont la panne arrête tout le système.') },
      { term: t('Redundancy', 'Redondance'), def: t('Duplicate paths or devices to survive failures.', 'Chemins ou équipements doublés pour survivre aux pannes.') },
    ],
    practice: t(
      'When half an office loses network at once, think topology: what do all affected users have in common? Usually the same access switch, patch panel or uplink. Shared symptom → shared component.',
      'Quand la moitié d’un bureau perd le réseau d’un coup, pensez topologie : qu’ont en commun tous les utilisateurs touchés ? Souvent le même commutateur d’accès, panneau de brassage ou lien montant. Symptôme partagé → composant partagé.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Which topology do modern office LANs use at the edge?', 'Quelle topologie utilisent les LAN de bureau en périphérie ?'), options: ['Bus', t('Star', 'Étoile'), t('Ring', 'Anneau'), t('Full mesh', 'Maillage complet')], answer: 1, explain: t('Star, around switches.', 'Étoile, autour de commutateurs.') },
      { kind: 'tf', prompt: t('Client-server makes central backups and security easier.', 'Le client-serveur facilite sauvegardes et sécurité centralisées.'), answer: true, explain: t('That is its main advantage.', 'C’est son principal avantage.') },
      { kind: 'mcq', prompt: t('Most expensive but most resilient topology?', 'Topologie la plus chère mais la plus résiliente ?'), options: ['Bus', t('Star', 'Étoile'), t('Mesh', 'Maillée'), t('Ring', 'Anneau')], answer: 2, explain: t('Mesh has many redundant paths.', 'La maillée a de nombreux chemins redondants.') },
      { kind: 'mcq', prompt: t('15 users on floor 2 are offline; floor 1 is fine. First suspect?', '15 utilisateurs de l’étage 2 sont hors ligne ; l’étage 1 va bien. Premier suspect ?'), options: [t('Each PC’s RAM', 'La RAM de chaque PC'), t('The floor-2 access switch or its uplink', 'Le commutateur d’accès de l’étage 2 ou son lien montant'), t('The website', 'Le site web'), t('Users’ passwords', 'Les mots de passe')], answer: 1, explain: t('Shared symptom → shared component.', 'Symptôme partagé → composant partagé.') },
    ],
  },
]

export const ethernetLessons: Lesson[] = [
  {
    id: 'l1-ethernet.1',
    title: t('Ethernet and network cables', 'Ethernet et câbles réseau'),
    minutes: 12,
    objectives: [
      t('Explain what Ethernet is', 'Expliquer ce qu’est Ethernet'),
      t('Compare Cat5e, Cat6, Cat6a and fibre', 'Comparer Cat5e, Cat6, Cat6a et fibre'),
      t('Remember the 100-metre copper limit', 'Retenir la limite de 100 mètres du cuivre'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('The language of wired LANs', 'Le langage des LAN filaires'),
        body: t(
          '**Ethernet** (IEEE 802.3) is the standard for wired local networks. It defines the cables, connectors, speeds and how data is framed on the wire. Almost every wired office network is Ethernet.\n\nCopper Ethernet uses **twisted pair** cable: 8 wires twisted in 4 pairs. The twisting cancels electrical interference (**crosstalk**). Most are **UTP** (unshielded); **STP/FTP** adds shielding for electrically noisy environments like factories.',
          '**Ethernet** (IEEE 802.3) est la norme des réseaux locaux filaires. Elle définit câbles, connecteurs, débits et la façon de mettre les données en trames sur le fil. Presque tous les réseaux filaires de bureau sont en Ethernet.\n\nL’Ethernet cuivre utilise du câble à **paires torsadées** : 8 fils torsadés en 4 paires. La torsade annule les interférences (**diaphonie**). La plupart sont **UTP** (non blindés) ; le **STP/FTP** ajoute un blindage pour les environnements perturbés comme les usines.',
        ),
      },
      {
        type: 'table',
        head: [t('Cable', 'Câble'), t('Max speed', 'Débit max'), t('Max length', 'Longueur max'), t('Typical use', 'Usage typique')],
        rows: [
          ['Cat5e', '1 Gb/s', '100 m', t('Older installations', 'Installations anciennes')],
          ['Cat6', t('1 Gb/s (10 Gb/s up to ~55 m)', '1 Gb/s (10 Gb/s jusqu’à ~55 m)'), '100 m', t('Standard office cabling', 'Câblage de bureau standard')],
          ['Cat6a', '10 Gb/s', '100 m', t('New buildings, Wi-Fi 6 access points', 'Bâtiments neufs, bornes Wi-Fi 6')],
          [t('Multimode fibre', 'Fibre multimode'), '10–100 Gb/s', t('~300–550 m', '~300–550 m'), t('Inside buildings, between racks', 'Dans les bâtiments, entre baies')],
          [t('Single-mode fibre', 'Fibre monomode'), t('100 Gb/s+', '100 Gb/s+'), t('Kilometres', 'Kilomètres'), t('Between buildings, ISP links', 'Entre bâtiments, liens opérateurs')],
        ],
      },
      { type: 'diagram', diagram: 'cables', caption: t('Copper twisted pair, RJ45 plug, fibre optic and coax — the cables you will handle every week.', 'Paire torsadée cuivre, prise RJ45, fibre optique et coaxial — les câbles que vous manipulerez chaque semaine.') },
      {
        type: 'callout',
        tone: 'warn',
        title: t('The 100-metre rule', 'La règle des 100 mètres'),
        body: t('Copper twisted pair is limited to **100 m** per link (90 m permanent cable + 10 m patch cords). Beyond that, the signal degrades: errors, slow links, random disconnections. Longer runs need a switch in between or fibre.', 'Le cuivre à paires torsadées est limité à **100 m** par lien (90 m de câble fixe + 10 m de cordons). Au-delà, le signal se dégrade : erreurs, liens lents, déconnexions aléatoires. Pour plus long, il faut un commutateur intermédiaire ou de la fibre.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('You must link two buildings 400 m apart. Best choice?', 'Vous devez relier deux bâtiments distants de 400 m. Meilleur choix ?'),
          options: ['Cat5e', 'Cat6a', t('Fibre optic', 'Fibre optique'), t('A longer patch cord', 'Un cordon plus long')],
          answer: 2,
          explain: t('Copper stops at 100 m; fibre also avoids electrical issues between buildings.', 'Le cuivre s’arrête à 100 m ; la fibre évite aussi les problèmes électriques entre bâtiments.'),
        },
      },
      {
        type: 'text',
        title: t('Link speed and duplex', 'Débit du lien et duplex'),
        body: t('When you plug in a cable, both ends **auto-negotiate** speed (10/100/1000 Mb/s) and **duplex** (full = send and receive at once). A damaged cable often negotiates down to 100 Mb/s — a classic cause of "slow network" for one user.', 'Quand vous branchez un câble, les deux extrémités **négocient automatiquement** le débit (10/100/1000 Mb/s) et le **duplex** (full = envoyer et recevoir simultanément). Un câble abîmé négocie souvent à 100 Mb/s — cause classique d’un « réseau lent » pour un seul utilisateur.'),
      },
    ],
    vocabulary: [
      { term: 'Ethernet', def: t('IEEE 802.3 standard for wired LANs.', 'Norme IEEE 802.3 des LAN filaires.') },
      { term: t('Twisted pair', 'Paire torsadée'), def: t('Copper cable with 4 twisted pairs to reduce interference.', 'Câble cuivre à 4 paires torsadées réduisant les interférences.') },
      { term: 'UTP / STP', def: t('Unshielded / shielded twisted pair.', 'Paire torsadée non blindée / blindée.') },
      { term: t('Fibre optic', 'Fibre optique'), def: t('Cable carrying light; long distances, immune to interference.', 'Câble transportant la lumière ; longues distances, insensible aux interférences.') },
      { term: t('Auto-negotiation', 'Auto-négociation'), def: t('Ports agree speed and duplex automatically.', 'Les ports s’accordent automatiquement sur débit et duplex.') },
    ],
    practice: t(
      'A user complains their network is slow while colleagues are fine. Check the link speed (Windows: Settings → Network → adapter properties; switch: `show interfaces status`). 100 Mb/s on a gigabit port? Replace the patch cable first — it fixes most cases.',
      'Un utilisateur se plaint d’un réseau lent alors que ses collègues vont bien. Vérifiez le débit du lien (Windows : Paramètres → Réseau → propriétés de la carte ; commutateur : `show interfaces status`). 100 Mb/s sur un port gigabit ? Changez d’abord le cordon — cela règle la plupart des cas.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Maximum length of a copper Ethernet link?', 'Longueur maximale d’un lien Ethernet cuivre ?'), options: ['10 m', '55 m', '100 m', '500 m'], answer: 2, explain: t('100 m total.', '100 m au total.') },
      { kind: 'tf', prompt: t('Fibre optic cables are affected by electrical interference.', 'La fibre optique est sensible aux interférences électriques.'), answer: false, explain: t('Fibre carries light, not electricity.', 'La fibre transporte de la lumière, pas de l’électricité.') },
      { kind: 'mcq', prompt: t('Why are wire pairs twisted?', 'Pourquoi les paires sont-elles torsadées ?'), options: [t('To look nicer', 'Pour l’esthétique'), t('To cancel interference/crosstalk', 'Pour annuler interférences/diaphonie'), t('To carry power', 'Pour transporter du courant'), t('To be longer', 'Pour être plus longues')], answer: 1, explain: t('Twisting cancels noise.', 'La torsade annule le bruit.') },
      { kind: 'mcq', prompt: t('A PC link shows 100 Mb/s on a gigabit switch. Likely cause?', 'Un lien PC affiche 100 Mb/s sur un commutateur gigabit. Cause probable ?'), options: [t('Damaged cable', 'Câble endommagé'), t('Wrong DNS', 'Mauvais DNS'), t('Too much RAM', 'Trop de RAM'), t('FAT32 disk', 'Disque FAT32')], answer: 0, explain: t('Gigabit needs all 4 pairs in good condition.', 'Le gigabit a besoin des 4 paires en bon état.') },
    ],
  },
  {
    id: 'l1-ethernet.2',
    title: t('Connectors and wiring standards', 'Connecteurs et normes de câblage'),
    minutes: 12,
    objectives: [
      t('Recognise the RJ45 connector and its 8 pins', 'Reconnaître le connecteur RJ45 et ses 8 broches'),
      t('Compare T568A and T568B', 'Comparer T568A et T568B'),
      t('Distinguish straight-through and crossover cables, and Auto-MDIX', 'Distinguer câbles droits et croisés, et l’Auto-MDIX'),
    ],
    blocks: [
      { type: 'diagram', diagram: 'rj45-pinout', caption: t('RJ45 seen from the front, clip down. T568B is the most common order in companies.', 'RJ45 vu de face, clip en bas. T568B est l’ordre le plus courant en entreprise.') },
      {
        type: 'text',
        title: t('Two colour orders', 'Deux ordres de couleurs'),
        body: t(
          'Each of the 8 wires must land on the right pin. Two standards exist:\n- **T568B**: orange-white, orange, green-white, blue, blue-white, green, brown-white, brown.\n- **T568A**: swaps the orange and green pairs.\n\nPick one and use it **everywhere** in a building. Both perform identically — consistency is what matters.',
          'Chacun des 8 fils doit arriver sur la bonne broche. Deux normes existent :\n- **T568B** : blanc-orange, orange, blanc-vert, bleu, blanc-bleu, vert, blanc-marron, marron.\n- **T568A** : inverse les paires orange et verte.\n\nChoisissez-en une et utilisez-la **partout** dans un bâtiment. Les deux sont équivalentes — c’est la cohérence qui compte.',
        ),
      },
      {
        type: 'table',
        head: [t('Cable type', 'Type de câble'), t('Ends', 'Extrémités'), t('Historically used for', 'Historiquement utilisé pour')],
        rows: [
          [t('Straight-through', 'Droit'), t('Same standard both ends (B–B)', 'Même norme aux deux bouts (B–B)'), t('PC → switch, router → switch', 'PC → commutateur, routeur → commutateur')],
          [t('Crossover', 'Croisé'), t('A on one end, B on the other', 'A d’un côté, B de l’autre'), t('PC → PC, switch → switch', 'PC → PC, commutateur → commutateur')],
          [t('Rollover / console', 'Rollover / console'), t('Pins fully reversed', 'Broches totalement inversées'), t('Configuring a Cisco device via console port', 'Configurer un équipement Cisco via le port console')],
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'Auto-MDIX',
        body: t('Modern ports detect the cable type and swap send/receive pairs automatically (**Auto-MDIX**), so a straight cable works almost everywhere today. You still need to know crossover for older equipment and for exams.', 'Les ports modernes détectent le type de câble et inversent automatiquement les paires émission/réception (**Auto-MDIX**) ; un câble droit fonctionne donc presque partout aujourd’hui. Il faut quand même connaître le croisé pour le matériel ancien et les examens.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('In T568B, which colour is on pin 1?', 'En T568B, quelle couleur est sur la broche 1 ?'),
          options: [t('Green-white', 'Blanc-vert'), t('Orange-white', 'Blanc-orange'), t('Blue', 'Bleu'), t('Brown', 'Marron')],
          answer: 1,
          explain: t('T568B starts orange-white, orange.', 'T568B commence par blanc-orange, orange.'),
        },
      },
      {
        type: 'text',
        title: t('Testing a cable', 'Tester un câble'),
        body: t('A **cable tester** lights up each of the 8 wires in order on both ends. Look for: a missing light (**open**), two lights at once (**short**), or lights out of order (**miswire / split pair**). Certification testers (Fluke) also measure length and quality for Cat6/6a compliance.', 'Un **testeur de câble** allume chacun des 8 fils dans l’ordre aux deux extrémités. Repérez : un voyant manquant (**coupure**), deux voyants à la fois (**court-circuit**) ou un ordre incorrect (**mauvais câblage / paire séparée**). Les certificateurs (Fluke) mesurent aussi longueur et qualité pour la conformité Cat6/6a.'),
      },
    ],
    vocabulary: [
      { term: 'RJ45', def: t('8-pin modular connector used for Ethernet.', 'Connecteur modulaire 8 broches utilisé pour Ethernet.') },
      { term: 'T568A / T568B', def: t('The two standard wire colour orders.', 'Les deux ordres de couleurs normalisés.') },
      { term: t('Crossover cable', 'Câble croisé'), def: t('Swaps transmit and receive pairs.', 'Inverse les paires d’émission et de réception.') },
      { term: 'Auto-MDIX', def: t('Port feature that adapts to any cable type.', 'Fonction de port qui s’adapte à tout type de câble.') },
      { term: t('Patch cord', 'Cordon de brassage'), def: t('Short cable between a device and a wall jack or patch panel.', 'Câble court entre un appareil et une prise murale ou un panneau.') },
    ],
    practice: t(
      'In Level 4 you will crimp your own cables and terminate patch panels. For now: when a wall port does not work, swap the patch cord, then test the wall port with a known-good device, then use a cable tester — in that order.',
      'Au niveau 4, vous sertirez vos propres câbles et raccorderez des panneaux de brassage. Pour l’instant : quand une prise murale ne fonctionne pas, changez le cordon, puis testez la prise avec un appareil qui fonctionne, puis utilisez un testeur — dans cet ordre.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('How many pins does an RJ45 connector have?', 'Combien de broches a un connecteur RJ45 ?'), options: ['4', '6', '8', '12'], answer: 2, explain: t('8 pins for 4 pairs.', '8 broches pour 4 paires.') },
      { kind: 'tf', prompt: t('T568B performs better than T568A.', 'T568B est plus performant que T568A.'), answer: false, explain: t('Identical performance; consistency matters.', 'Performances identiques ; c’est la cohérence qui compte.') },
      { kind: 'mcq', prompt: t('Which cable configures a Cisco switch from its console port?', 'Quel câble configure un commutateur Cisco via son port console ?'), options: [t('Crossover', 'Croisé'), t('Rollover / console', 'Rollover / console'), t('Fibre', 'Fibre'), 'HDMI'], answer: 1, explain: t('A rollover (console) cable, often USB-to-RJ45 today.', 'Un câble rollover (console), souvent USB-RJ45 aujourd’hui.') },
      { kind: 'mcq', prompt: t('A tester shows wire 3 never lights on the far end. This is…', 'Un testeur montre que le fil 3 ne s’allume jamais côté distant. C’est…'), options: [t('An open (break)', 'Une coupure'), t('A short', 'Un court-circuit'), t('Auto-MDIX', 'Auto-MDIX'), t('Normal', 'Normal')], answer: 0, explain: t('No continuity = open.', 'Pas de continuité = coupure.') },
    ],
  },
]
