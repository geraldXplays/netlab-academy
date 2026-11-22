import { t, type Lesson } from '../types'

export const ipLessons: Lesson[] = [
  {
    id: 'l1-ip.1',
    title: t('IPv4 addresses and subnet masks', 'Adresses IPv4 et masques de sous-réseau'),
    minutes: 16,
    objectives: [
      t('Describe the structure of an IPv4 address (32 bits, 4 octets)', 'Décrire la structure d’une adresse IPv4 (32 bits, 4 octets)'),
      t('Convert an octet between decimal and binary', 'Convertir un octet entre décimal et binaire'),
      t('Use a subnet mask to find the network and host parts', 'Utiliser un masque pour trouver la partie réseau et la partie hôte'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('A postal address for every device', 'Une adresse postale pour chaque appareil'),
        body: t(
          'An **IP address** identifies a device on a network so that packets can be delivered to it. An **IPv4** address is **32 bits**, written as **4 octets** in decimal separated by dots: `192.168.1.25`. Each octet ranges from **0 to 255** (8 bits).',
          'Une **adresse IP** identifie un appareil sur un réseau pour que les paquets puissent lui être livrés. Une adresse **IPv4** fait **32 bits**, écrits en **4 octets** décimaux séparés par des points : `192.168.1.25`. Chaque octet va de **0 à 255** (8 bits).',
        ),
      },
      { type: 'diagram', diagram: 'ipv4-anatomy', caption: t('With mask 255.255.255.0 (/24), the first three octets identify the network and the last one the host.', 'Avec le masque 255.255.255.0 (/24), les trois premiers octets identifient le réseau et le dernier l’hôte.') },
      {
        type: 'text',
        title: t('Binary in 60 seconds', 'Le binaire en 60 secondes'),
        body: t(
          'Each bit in an octet has a value: **128 64 32 16 8 4 2 1**. Add the values of the bits set to 1.\n\n`11000000` = 128 + 64 = **192**\n`10101000` = 128 + 32 + 8 = **168**\n`11111111` = 255 — all bits on.',
          'Chaque bit d’un octet a une valeur : **128 64 32 16 8 4 2 1**. Additionnez les valeurs des bits à 1.\n\n`11000000` = 128 + 64 = **192**\n`10101000` = 128 + 32 + 8 = **168**\n`11111111` = 255 — tous les bits à 1.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('What is 00001010 in decimal?', 'Combien vaut 00001010 en décimal ?'),
          options: ['8', '10', '12', '20'],
          answer: 1,
          explain: t('8 + 2 = 10.', '8 + 2 = 10.'),
        },
      },
      {
        type: 'text',
        title: t('The subnet mask', 'Le masque de sous-réseau'),
        body: t(
          'An address alone does not say where the network ends. The **subnet mask** does: its 1-bits cover the **network part**, its 0-bits the **host part**.\n\n- `255.255.255.0` = 24 ones = written **/24** (CIDR notation).\n- Devices with the same network part are on the **same subnet** and can talk directly.\n- Different network part → traffic must go through a **router** (the default gateway).\n\nIn `192.168.1.0/24`: network = `192.168.1.0`, usable hosts `.1` to `.254`, and `.255` is the **broadcast** address (reaches everyone on the subnet).',
          'Une adresse seule ne dit pas où finit le réseau. Le **masque de sous-réseau** le dit : ses bits à 1 couvrent la **partie réseau**, ses bits à 0 la **partie hôte**.\n\n- `255.255.255.0` = 24 uns = noté **/24** (notation CIDR).\n- Les appareils ayant la même partie réseau sont dans le **même sous-réseau** et communiquent directement.\n- Partie réseau différente → le trafic doit passer par un **routeur** (la passerelle par défaut).\n\nDans `192.168.1.0/24` : réseau = `192.168.1.0`, hôtes utilisables `.1` à `.254`, et `.255` est l’adresse de **diffusion** (broadcast, atteint tout le sous-réseau).',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'tf',
          prompt: t('192.168.1.40/24 and 192.168.2.40/24 are on the same subnet.', '192.168.1.40/24 et 192.168.2.40/24 sont dans le même sous-réseau.'),
          answer: false,
          explain: t('The third octet differs (1 vs 2), so the network parts differ — a router is needed.', 'Le troisième octet diffère (1 vs 2), donc les parties réseau diffèrent — il faut un routeur.'),
        },
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Coming next: subnetting', 'Pour la suite : le subnetting'),
        body: t('Masks are not always /24. Splitting networks with masks like /26 or /28 is called **subnetting** — a core skill you will master in Level 2 with dedicated challenges.', 'Les masques ne sont pas toujours /24. Découper des réseaux avec des masques comme /26 ou /28 s’appelle le **subnetting** — une compétence clé que vous maîtriserez au niveau 2 avec des défis dédiés.'),
      },
    ],
    vocabulary: [
      { term: t('IPv4 address', 'Adresse IPv4'), def: t('32-bit logical address, e.g. 10.0.0.5.', 'Adresse logique de 32 bits, ex. 10.0.0.5.') },
      { term: t('Octet', 'Octet'), def: t('8 bits; one of the four numbers in an IPv4 address.', '8 bits ; l’un des quatre nombres d’une adresse IPv4.') },
      { term: t('Subnet mask', 'Masque de sous-réseau'), def: t('Defines which bits are network vs host.', 'Définit quels bits sont réseau et lesquels sont hôte.') },
      { term: 'CIDR (/24)', def: t('Notation giving the number of network bits.', 'Notation indiquant le nombre de bits réseau.') },
      { term: t('Broadcast address', 'Adresse de diffusion'), def: t('Last address of a subnet; reaches all hosts.', 'Dernière adresse d’un sous-réseau ; atteint tous les hôtes.') },
    ],
    practice: t(
      'Lab 1 will ask you to give two PCs addresses on the same subnet: e.g. 192.168.10.10/24 and 192.168.10.11/24. If you typed 192.168.11.11 by mistake, ping would fail — and now you know why.',
      'Le Lab 1 vous demandera de donner à deux PC des adresses du même sous-réseau : ex. 192.168.10.10/24 et 192.168.10.11/24. Si vous tapiez 192.168.11.11 par erreur, le ping échouerait — et maintenant vous savez pourquoi.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('How many bits in an IPv4 address?', 'Combien de bits dans une adresse IPv4 ?'), options: ['8', '16', '32', '128'], answer: 2, explain: t('32 bits = 4 octets.', '32 bits = 4 octets.') },
      { kind: 'mcq', prompt: t('Which is NOT a valid IPv4 address?', 'Laquelle n’est PAS une adresse IPv4 valide ?'), options: ['10.0.0.1', '172.16.5.4', '192.168.1.256', '8.8.8.8'], answer: 2, explain: t('256 exceeds the 0–255 range.', '256 dépasse la plage 0–255.') },
      { kind: 'mcq', prompt: t('255.255.255.0 in CIDR is…', '255.255.255.0 en CIDR s’écrit…'), options: ['/8', '/16', '/24', '/32'], answer: 2, explain: t('24 bits set to 1.', '24 bits à 1.') },
      { kind: 'mcq', prompt: t('Broadcast address of 192.168.5.0/24?', 'Adresse de diffusion de 192.168.5.0/24 ?'), options: ['192.168.5.0', '192.168.5.1', '192.168.5.254', '192.168.5.255'], answer: 3, explain: t('Last address of the range.', 'Dernière adresse de la plage.') },
    ],
  },
  {
    id: 'l1-ip.2',
    title: t('Private, public and special addresses', 'Adresses privées, publiques et spéciales'),
    minutes: 14,
    objectives: [
      t('Recognise private IPv4 ranges', 'Reconnaître les plages IPv4 privées'),
      t('Explain the default gateway, DHCP and static addressing', 'Expliquer passerelle par défaut, DHCP et adressage statique'),
      t('Diagnose an APIPA (169.254.x.x) address', 'Diagnostiquer une adresse APIPA (169.254.x.x)'),
    ],
    blocks: [
      {
        type: 'table',
        head: [t('Range', 'Plage'), t('Meaning', 'Signification')],
        rows: [
          ['10.0.0.0/8', t('Private — large companies', 'Privée — grandes entreprises')],
          ['172.16.0.0/12 (172.16 – 172.31)', t('Private — medium networks', 'Privée — réseaux moyens')],
          ['192.168.0.0/16', t('Private — homes and small offices', 'Privée — maisons et petits bureaux')],
          ['127.0.0.0/8', t('Loopback — the machine itself', 'Bouclage — la machine elle-même')],
          ['169.254.0.0/16', t('APIPA — self-assigned when DHCP fails', 'APIPA — auto-attribuée quand le DHCP échoue')],
          [t('Everything else (mostly)', 'Tout le reste (en général)'), t('Public — routable on the Internet', 'Publique — routable sur Internet')],
        ],
      },
      {
        type: 'text',
        title: t('Private inside, public outside', 'Privé dedans, public dehors'),
        body: t(
          '**Private** addresses are free to reuse in every company but are **not routed on the Internet**. Your router uses **NAT** (Network Address Translation) to share one **public** address for all internal devices. You will configure NAT in Level 2.',
          'Les adresses **privées** sont réutilisables librement dans chaque entreprise mais **ne sont pas routées sur Internet**. Votre routeur utilise le **NAT** (traduction d’adresses) pour partager une adresse **publique** entre tous les appareils internes. Vous configurerez le NAT au niveau 2.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which address is private?', 'Quelle adresse est privée ?'),
          options: ['8.8.8.8', '172.20.3.4', '172.40.3.4', '1.1.1.1'],
          answer: 1,
          explain: t('172.16.0.0 – 172.31.255.255 is private; 172.40 is outside that range.', '172.16.0.0 – 172.31.255.255 est privée ; 172.40 est hors plage.'),
        },
      },
      {
        type: 'text',
        title: t('Four settings every device needs', 'Quatre réglages pour chaque appareil'),
        body: t(
          '1. **IP address** — who am I?\n2. **Subnet mask** — who is local?\n3. **Default gateway** — the router to reach other networks.\n4. **DNS server** — who translates names into addresses?\n\nThey are either typed by hand (**static** — for servers, printers, network devices) or received automatically from a **DHCP server** (for PCs, phones, laptops).',
          '1. **Adresse IP** — qui suis-je ?\n2. **Masque** — qui est local ?\n3. **Passerelle par défaut** — le routeur pour joindre les autres réseaux.\n4. **Serveur DNS** — qui traduit les noms en adresses ?\n\nIls sont soit saisis à la main (**statique** — serveurs, imprimantes, équipements réseau), soit reçus automatiquement d’un **serveur DHCP** (PC, téléphones, portables).',
        ),
      },
      {
        type: 'example',
        title: t('Reading ipconfig like a technician', 'Lire ipconfig comme un technicien'),
        body: t('This PC asked DHCP for an address and got no answer, so Windows self-assigned an **APIPA** address. It can only talk to other APIPA devices — no gateway, no internet. Check the cable, switch port, VLAN and DHCP server.', 'Ce PC a demandé une adresse au DHCP sans réponse, donc Windows s’est auto-attribué une adresse **APIPA**. Il ne peut parler qu’à d’autres appareils APIPA — pas de passerelle, pas d’internet. Vérifiez câble, port de commutateur, VLAN et serveur DHCP.'),
        code: 'C:\\> ipconfig\n\nEthernet adapter Ethernet:\n   Autoconfiguration IPv4 Address . : 169.254.31.7\n   Subnet Mask . . . . . . . . . . . : 255.255.0.0\n   Default Gateway . . . . . . . . . :',
      },
      {
        type: 'callout',
        tone: 'info',
        title: 'IPv6',
        body: t('IPv4 offers about 4.3 billion addresses — not enough. **IPv6** uses 128-bit addresses written in hexadecimal (`2001:db8::1`). It runs alongside IPv4 in most networks today; you will study it in Level 2.', 'L’IPv4 offre environ 4,3 milliards d’adresses — insuffisant. L’**IPv6** utilise des adresses de 128 bits en hexadécimal (`2001:db8::1`). Il coexiste avec l’IPv4 dans la plupart des réseaux ; vous l’étudierez au niveau 2.'),
      },
    ],
    vocabulary: [
      { term: t('Private address', 'Adresse privée'), def: t('Reusable internal address not routed on the Internet.', 'Adresse interne réutilisable, non routée sur Internet.') },
      { term: 'NAT', def: t('Translates private addresses to a public one.', 'Traduit des adresses privées en une adresse publique.') },
      { term: 'DHCP', def: t('Automatically hands out IP settings.', 'Distribue automatiquement les réglages IP.') },
      { term: 'APIPA', def: t('169.254.x.x self-assigned address when DHCP fails.', 'Adresse 169.254.x.x auto-attribuée quand le DHCP échoue.') },
      { term: t('Static IP', 'IP statique'), def: t('Manually configured address that never changes.', 'Adresse configurée à la main qui ne change pas.') },
    ],
    practice: t(
      'Remember the Monday-morning outage on the landing page? 14 PCs had 169.254 addresses. That single clue told the technician the problem was between the PCs and the DHCP server — not the PCs themselves.',
      'Vous vous souvenez de la panne du lundi matin sur la page d’accueil ? 14 PC avaient des adresses 169.254. Cet unique indice a dit au technicien que le problème était entre les PC et le serveur DHCP — pas dans les PC.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('A PC shows 169.254.10.20. What does that tell you?', 'Un PC affiche 169.254.10.20. Qu’est-ce que cela indique ?'), options: [t('It has internet', 'Il a internet'), t('It did not get a DHCP lease', 'Il n’a pas obtenu de bail DHCP'), t('It is a server', 'C’est un serveur'), t('DNS works', 'Le DNS fonctionne')], answer: 1, explain: t('APIPA = DHCP failure.', 'APIPA = échec DHCP.') },
      { kind: 'tf', prompt: t('192.168.x.x addresses are routed on the public Internet.', 'Les adresses 192.168.x.x sont routées sur Internet.'), answer: false, explain: t('They are private.', 'Elles sont privées.') },
      { kind: 'mcq', prompt: t('Which device should get a static IP?', 'Quel appareil doit avoir une IP statique ?'), options: [t('A visitor’s phone', 'Le téléphone d’un visiteur'), t('A network printer', 'Une imprimante réseau'), t('A laptop', 'Un portable'), t('A tablet', 'Une tablette')], answer: 1, explain: t('Shared devices need a predictable address.', 'Les appareils partagés ont besoin d’une adresse prévisible.') },
      { kind: 'mcq', prompt: t('Which setting tells a PC where to send traffic for other networks?', 'Quel réglage indique au PC où envoyer le trafic vers d’autres réseaux ?'), options: [t('DNS server', 'Serveur DNS'), t('Default gateway', 'Passerelle par défaut'), t('Subnet mask', 'Masque'), t('MAC address', 'Adresse MAC')], answer: 1, explain: t('The default gateway (router).', 'La passerelle par défaut (routeur).') },
    ],
  },
]

export const macLessons: Lesson[] = [
  {
    id: 'l1-mac.1',
    title: t('MAC addresses and how they differ from IP', 'Adresses MAC et différence avec l’IP'),
    minutes: 13,
    objectives: [
      t('Describe the format of a MAC address (48 bits, hexadecimal)', 'Décrire le format d’une adresse MAC (48 bits, hexadécimal)'),
      t('Explain the roles of MAC (local delivery) and IP (end-to-end)', 'Expliquer les rôles de la MAC (livraison locale) et de l’IP (de bout en bout)'),
      t('Describe what ARP does', 'Décrire ce que fait ARP'),
    ],
    blocks: [
      { type: 'diagram', diagram: 'mac-anatomy', caption: t('48 bits in hexadecimal: the first half identifies the manufacturer (OUI), the second the specific card.', '48 bits en hexadécimal : la première moitié identifie le fabricant (OUI), la seconde la carte.') },
      {
        type: 'text',
        title: t('A hardware address', 'Une adresse matérielle'),
        body: t(
          'Every network interface has a **MAC address** (Media Access Control), set at the factory: 48 bits written as 12 **hexadecimal** digits, e.g. `3C:52:82:1A:9F:04` (Windows shows dashes: `3C-52-82-1A-9F-04`).\n\n- The first 3 bytes are the **OUI** — the manufacturer’s ID.\n- The last 3 bytes identify that particular card.\n\n**Switches** use MAC addresses to deliver frames **within a local network**.',
          'Chaque interface réseau possède une **adresse MAC** (Media Access Control), définie en usine : 48 bits écrits en 12 chiffres **hexadécimaux**, ex. `3C:52:82:1A:9F:04` (Windows affiche des tirets : `3C-52-82-1A-9F-04`).\n\n- Les 3 premiers octets forment l’**OUI** — l’identifiant du fabricant.\n- Les 3 derniers identifient cette carte précise.\n\nLes **commutateurs** utilisent les adresses MAC pour livrer les trames **au sein d’un réseau local**.',
        ),
      },
      {
        type: 'table',
        head: ['', t('MAC address', 'Adresse MAC'), t('IP address', 'Adresse IP')],
        rows: [
          [t('Analogy', 'Analogie'), t('A person’s name', 'Le nom d’une personne'), t('Their postal address', 'Son adresse postale')],
          [t('Set by', 'Définie par'), t('Manufacturer (hardware)', 'Fabricant (matériel)'), t('Administrator or DHCP', 'Administrateur ou DHCP')],
          [t('Length', 'Longueur'), t('48 bits, hex', '48 bits, hexa'), t('32 bits (IPv4), decimal', '32 bits (IPv4), décimal')],
          [t('Scope', 'Portée'), t('Local network only', 'Réseau local uniquement'), t('End to end, across routers', 'De bout en bout, à travers les routeurs')],
          [t('Used by', 'Utilisée par'), t('Switches (Layer 2)', 'Commutateurs (couche 2)'), t('Routers (Layer 3)', 'Routeurs (couche 3)')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which device mainly uses MAC addresses to forward traffic?', 'Quel équipement utilise surtout les adresses MAC pour acheminer le trafic ?'),
          options: [t('Router', 'Routeur'), t('Switch', 'Commutateur'), t('DNS server', 'Serveur DNS'), t('Modem', 'Modem')],
          answer: 1,
          explain: t('Switches build a MAC address table and forward frames using it.', 'Les commutateurs construisent une table MAC et s’en servent pour acheminer les trames.'),
        },
      },
      {
        type: 'text',
        title: t('ARP: from IP to MAC', 'ARP : de l’IP à la MAC'),
        body: t(
          'To send a packet to `192.168.1.20` on the local network, a PC needs that host’s MAC address. It broadcasts an **ARP request**: "Who has 192.168.1.20? Tell 192.168.1.10." The owner replies with its MAC. The answer is cached in the **ARP table** (`arp -a`).\n\nFor a destination on **another network**, the PC instead asks for the MAC of its **default gateway** — the router takes it from there.',
          'Pour envoyer un paquet à `192.168.1.20` sur le réseau local, un PC a besoin de l’adresse MAC de cet hôte. Il diffuse une **requête ARP** : « Qui a 192.168.1.20 ? Répondez à 192.168.1.10. » Le propriétaire répond avec sa MAC. La réponse est gardée dans la **table ARP** (`arp -a`).\n\nPour une destination sur **un autre réseau**, le PC demande plutôt la MAC de sa **passerelle par défaut** — le routeur prend le relais.',
        ),
      },
      {
        type: 'code',
        code: 'C:\\> arp -a\n\nInterface: 192.168.1.10 --- 0x7\n  Internet Address      Physical Address      Type\n  192.168.1.1           00-1a-2b-3c-4d-5e     dynamic\n  192.168.1.20          3c-52-82-1a-9f-04     dynamic\n  192.168.1.255         ff-ff-ff-ff-ff-ff     static',
        caption: t('FF-FF-FF-FF-FF-FF is the broadcast MAC address.', 'FF-FF-FF-FF-FF-FF est l’adresse MAC de diffusion.'),
      },
    ],
    vocabulary: [
      { term: t('MAC address', 'Adresse MAC'), def: t('48-bit hardware address of a network interface.', 'Adresse matérielle de 48 bits d’une interface réseau.') },
      { term: 'OUI', def: t('First 24 bits of a MAC; identifies the vendor.', '24 premiers bits d’une MAC ; identifie le fabricant.') },
      { term: t('Hexadecimal', 'Hexadécimal'), def: t('Base 16: digits 0–9 and A–F.', 'Base 16 : chiffres 0–9 et A–F.') },
      { term: 'ARP', def: t('Resolves an IP address to a MAC address on a LAN.', 'Résout une adresse IP en adresse MAC sur un LAN.') },
      { term: t('Frame', 'Trame'), def: t('Layer-2 unit of data carrying MAC addresses.', 'Unité de données de couche 2 portant les adresses MAC.') },
    ],
    practice: t(
      'DHCP reservations, Wi-Fi access lists and switch port security are all configured with MAC addresses. Finding one: `ipconfig /all` (Physical Address) on Windows, `ip link` on Linux, or the sticker on printers and phones.',
      'Réservations DHCP, filtrage Wi-Fi et sécurité des ports de commutateur se configurent avec des adresses MAC. Pour la trouver : `ipconfig /all` (Adresse physique) sous Windows, `ip link` sous Linux, ou l’étiquette des imprimantes et téléphones.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('How many bits in a MAC address?', 'Combien de bits dans une adresse MAC ?'), options: ['32', '48', '64', '128'], answer: 1, explain: t('48 bits.', '48 bits.') },
      { kind: 'tf', prompt: t('A MAC address travels unchanged across routers to the final destination.', 'Une adresse MAC traverse les routeurs sans changer jusqu’à la destination.'), answer: false, explain: t('MAC addresses are rewritten at each router hop; IP stays end to end.', 'Les MAC sont réécrites à chaque routeur ; l’IP reste de bout en bout.') },
      { kind: 'mcq', prompt: t('Which protocol finds the MAC address for a known IP?', 'Quel protocole trouve l’adresse MAC d’une IP connue ?'), options: ['DNS', 'DHCP', 'ARP', 'NAT'], answer: 2, explain: 'ARP.' },
      { kind: 'mcq', prompt: t('FF:FF:FF:FF:FF:FF is…', 'FF:FF:FF:FF:FF:FF est…'), options: [t('An invalid address', 'Une adresse invalide'), t('The broadcast MAC', 'La MAC de diffusion'), t('A router’s MAC', 'La MAC d’un routeur'), t('A Cisco OUI', 'Un OUI Cisco')], answer: 1, explain: t('All ones = broadcast.', 'Tous les bits à 1 = diffusion.') },
    ],
  },
]

export const archLessons: Lesson[] = [
  {
    id: 'l1-arch.1',
    title: t('The small office network', 'Le réseau d’un petit bureau'),
    minutes: 13,
    objectives: [
      t('Identify the role of modem, router, switch, access point and firewall', 'Identifier le rôle du modem, routeur, commutateur, borne Wi-Fi et pare-feu'),
      t('Draw a basic small-office network', 'Dessiner un réseau de petit bureau'),
      t('Explain why home "boxes" combine several devices', 'Expliquer pourquoi les « box » combinent plusieurs équipements'),
    ],
    blocks: [
      { type: 'diagram', diagram: 'home-network', caption: t('Each box has one job. In a home "box" they are all inside one case.', 'Chaque boîte a un rôle. Dans une « box » domestique, ils sont tous dans un même boîtier.') },
      {
        type: 'table',
        head: [t('Device', 'Équipement'), t('Job', 'Rôle'), t('Works with', 'Travaille avec')],
        rows: [
          [t('Modem / ONT', 'Modem / ONT'), t('Converts the ISP signal (fibre, DSL, cable) to Ethernet', 'Convertit le signal opérateur (fibre, DSL, câble) en Ethernet'), t('The physical line', 'La ligne physique')],
          [t('Router', 'Routeur'), t('Connects different networks; LAN ↔ Internet; NAT', 'Relie des réseaux différents ; LAN ↔ Internet ; NAT'), t('IP addresses', 'Adresses IP')],
          [t('Firewall', 'Pare-feu'), t('Allows or blocks traffic according to rules', 'Autorise ou bloque le trafic selon des règles'), t('IPs, ports, applications', 'IP, ports, applications')],
          [t('Switch', 'Commutateur'), t('Connects devices inside the LAN', 'Relie les appareils au sein du LAN'), t('MAC addresses', 'Adresses MAC')],
          [t('Access point', 'Borne Wi-Fi'), t('Connects wireless devices to the wired LAN', 'Relie les appareils sans fil au LAN filaire'), t('Wi-Fi (802.11)', 'Wi-Fi (802.11)')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('You need 12 more wired ports for new desks. What do you add?', 'Il faut 12 prises filaires de plus pour de nouveaux bureaux. Que rajoutez-vous ?'),
          options: [t('A router', 'Un routeur'), t('A switch', 'Un commutateur'), t('A modem', 'Un modem'), t('A DNS server', 'Un serveur DNS')],
          answer: 1,
          explain: t('Switches add ports within the same LAN.', 'Les commutateurs ajoutent des ports dans le même LAN.'),
        },
      },
      {
        type: 'text',
        title: t('Switch vs router — the key distinction', 'Commutateur vs routeur — la distinction clé'),
        body: t(
          'A **switch** connects devices **in the same network**: it learns which MAC address is on which port and forwards frames only where needed.\n\nA **router** connects **different networks**: it reads the destination IP address and decides the next hop. Your LAN `192.168.1.0/24` and the Internet are different networks — the router sits between them and is the **default gateway** of every PC.',
          'Un **commutateur** relie des appareils **d’un même réseau** : il apprend quelle adresse MAC est sur quel port et n’envoie les trames que là où il faut.\n\nUn **routeur** relie **des réseaux différents** : il lit l’adresse IP de destination et choisit le saut suivant. Votre LAN `192.168.1.0/24` et Internet sont des réseaux différents — le routeur est entre les deux et sert de **passerelle par défaut** à chaque PC.',
        ),
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Home box vs business network', 'Box domestique vs réseau d’entreprise'),
        body: t('A home "box" is modem + router + firewall + switch + Wi-Fi + DHCP + DNS relay in one case. Businesses separate these functions into dedicated devices for **performance, security, redundancy** and so each can be managed and replaced independently.', 'Une « box » domestique, c’est modem + routeur + pare-feu + commutateur + Wi-Fi + DHCP + relais DNS dans un boîtier. Les entreprises séparent ces fonctions en équipements dédiés pour la **performance, la sécurité, la redondance**, et pour gérer ou remplacer chacun indépendamment.'),
      },
    ],
    vocabulary: [
      { term: t('Router', 'Routeur'), def: t('Forwards packets between networks using IP addresses.', 'Achemine les paquets entre réseaux via les adresses IP.') },
      { term: t('Switch', 'Commutateur'), def: t('Forwards frames within a LAN using MAC addresses.', 'Achemine les trames dans un LAN via les adresses MAC.') },
      { term: t('Access point', 'Point d’accès'), def: t('Bridges Wi-Fi clients onto the wired network.', 'Raccorde les clients Wi-Fi au réseau filaire.') },
      { term: t('Firewall', 'Pare-feu'), def: t('Filters traffic according to a security policy.', 'Filtre le trafic selon une politique de sécurité.') },
      { term: 'ONT', def: t('Optical Network Terminal — the fibre "modem".', 'Terminal optique — le « modem » fibre.') },
    ],
    practice: t(
      'Sketch your own home network now: ISP → box → devices. Label which functions the box performs. Then sketch how you would split it for a 20-person office. This is exactly what Lab 6 will ask you to build.',
      'Dessinez maintenant votre réseau domestique : FAI → box → appareils. Indiquez les fonctions de la box. Puis dessinez comment vous la sépareriez pour un bureau de 20 personnes. C’est exactement ce que le Lab 6 vous demandera de construire.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Which device connects different IP networks?', 'Quel équipement relie des réseaux IP différents ?'), options: [t('Switch', 'Commutateur'), t('Router', 'Routeur'), t('Access point', 'Borne Wi-Fi'), t('Patch panel', 'Panneau de brassage')], answer: 1, explain: t('Routers work with IP between networks.', 'Les routeurs travaillent en IP entre réseaux.') },
      { kind: 'mcq', prompt: t('Which device lets laptops join the LAN without cables?', 'Quel équipement permet aux portables de rejoindre le LAN sans câble ?'), options: [t('Access point', 'Borne Wi-Fi'), t('Modem', 'Modem'), t('Firewall', 'Pare-feu'), t('Switch', 'Commutateur')], answer: 0, explain: t('Access points provide Wi-Fi.', 'Les bornes fournissent le Wi-Fi.') },
      { kind: 'tf', prompt: t('A home internet box often combines router, switch, Wi-Fi and DHCP.', 'Une box internet combine souvent routeur, commutateur, Wi-Fi et DHCP.'), answer: true, explain: t('Correct.', 'Exact.') },
      { kind: 'mcq', prompt: t('The default gateway of office PCs is usually the…', 'La passerelle par défaut des PC du bureau est généralement…'), options: [t('Switch', 'Le commutateur'), t('Router (LAN interface)', 'Le routeur (interface LAN)'), t('Printer', 'L’imprimante'), t('DNS server', 'Le serveur DNS')], answer: 1, explain: t('The router’s LAN-side address.', 'L’adresse côté LAN du routeur.') },
    ],
  },
  {
    id: 'l1-arch.2',
    title: t('Following a packet — and preparing Lab 1', 'Suivre un paquet — et préparer le Lab 1'),
    minutes: 16,
    objectives: [
      t('Trace what happens when a PC opens a website', 'Retracer ce qui se passe quand un PC ouvre un site web'),
      t('Connect DHCP, DNS, ARP, gateway and NAT into one story', 'Relier DHCP, DNS, ARP, passerelle et NAT en une histoire'),
      t('Plan the addressing for two PCs connected through a switch', 'Planifier l’adressage de deux PC reliés par un commutateur'),
    ],
    blocks: [
      { type: 'diagram', diagram: 'packet-journey', caption: t('Step by step: from typing a URL to seeing the page.', 'Étape par étape : de la saisie d’une URL à l’affichage de la page.') },
      {
        type: 'text',
        title: t('The full story', 'L’histoire complète'),
        body: t(
          '1. **DHCP** — at boot, the PC receives its IP, mask, gateway and DNS server.\n2. **DNS** — the user types `netlab.example`; the PC asks the DNS server for its IP address.\n3. **Decision** — the destination is not on the local subnet, so the packet must go to the **default gateway**.\n4. **ARP** — the PC finds the gateway’s MAC address.\n5. **Switch** — the frame crosses the switch to the router port.\n6. **Router + NAT** — the router replaces the private source address with its public one and forwards the packet to the ISP.\n7. **Internet** — routers hop the packet to the web server, which replies along the reverse path. NAT translates the reply back to the PC.',
          '1. **DHCP** — au démarrage, le PC reçoit IP, masque, passerelle et serveur DNS.\n2. **DNS** — l’utilisateur tape `netlab.example` ; le PC demande son adresse IP au serveur DNS.\n3. **Décision** — la destination n’est pas dans le sous-réseau local, le paquet doit donc aller à la **passerelle par défaut**.\n4. **ARP** — le PC trouve l’adresse MAC de la passerelle.\n5. **Commutateur** — la trame traverse le commutateur vers le port du routeur.\n6. **Routeur + NAT** — le routeur remplace l’adresse source privée par son adresse publique et transmet le paquet au FAI.\n7. **Internet** — les routeurs font sauter le paquet jusqu’au serveur web, qui répond par le chemin inverse. Le NAT retraduit la réponse vers le PC.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which happens FIRST when a user opens a website by name?', 'Que se passe-t-il EN PREMIER quand un utilisateur ouvre un site par son nom ?'),
          options: [t('NAT translation', 'Traduction NAT'), t('DNS lookup', 'Requête DNS'), t('The web server replies', 'Le serveur web répond'), t('The router forwards the packet', 'Le routeur transmet le paquet')],
          answer: 1,
          explain: t('Without the IP address from DNS, nothing can be sent.', 'Sans l’adresse IP fournie par le DNS, rien ne peut partir.'),
        },
      },
      {
        type: 'text',
        title: t('Lab 1 preview: your first network', 'Aperçu du Lab 1 : votre premier réseau'),
        body: t(
          'In Phase 4 you will build this in a lab:\n- **PC-A** and **PC-B**, each cabled to a **switch** with straight-through cables.\n- Same subnet, static addresses: PC-A `192.168.10.10/24`, PC-B `192.168.10.11/24`.\n- No router needed — they are on the same network.\n- Test: from PC-A, `ping 192.168.10.11`. Replies = success.\n\nYou already know every concept involved.',
          'En phase 4, vous construirez ceci en lab :\n- **PC-A** et **PC-B**, chacun câblé à un **commutateur** avec des câbles droits.\n- Même sous-réseau, adresses statiques : PC-A `192.168.10.10/24`, PC-B `192.168.10.11/24`.\n- Pas besoin de routeur — ils sont dans le même réseau.\n- Test : depuis PC-A, `ping 192.168.10.11`. Des réponses = réussite.\n\nVous connaissez déjà chaque notion impliquée.',
        ),
      },
      {
        type: 'code',
        code: '# PC-A (Windows, admin PowerShell)\nNew-NetIPAddress -InterfaceAlias "Ethernet" -IPAddress 192.168.10.10 -PrefixLength 24\n\n# PC-B (Linux)\nsudo ip addr add 192.168.10.11/24 dev eth0\n\n# Test from PC-A\nping 192.168.10.11',
        caption: t('Static addressing from the command line — no gateway needed on a single subnet.', 'Adressage statique en ligne de commande — pas de passerelle nécessaire sur un seul sous-réseau.'),
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('If the ping fails', 'Si le ping échoue'),
        body: t('Work up from the bottom: link lights on both switch ports? Correct IPs and same mask? Windows Firewall blocks ICMP by default on some profiles — allow "File and Printer Sharing (Echo Request)" or test from PC-B to PC-A too.', 'Remontez depuis la base : voyants de lien allumés sur les deux ports ? IP correctes et même masque ? Le pare-feu Windows bloque l’ICMP par défaut sur certains profils — autorisez « Partage de fichiers et d’imprimantes (demande d’écho) » ou testez aussi de PC-B vers PC-A.'),
      },
    ],
    vocabulary: [
      { term: t('Packet', 'Paquet'), def: t('Layer-3 unit of data carrying IP addresses.', 'Unité de données de couche 3 portant les adresses IP.') },
      { term: t('Hop', 'Saut'), def: t('One router along a path.', 'Un routeur sur le chemin.') },
      { term: 'DNS', def: t('Translates domain names into IP addresses.', 'Traduit les noms de domaine en adresses IP.') },
      { term: 'ICMP', def: t('Control protocol used by ping and traceroute.', 'Protocole de contrôle utilisé par ping et traceroute.') },
    ],
    practice: t(
      'You now have the full mental model a Level 1 technician needs. Every incident in the simulator will break one link in this chain — DHCP, DNS, gateway, switch port, cable, NAT — and your job will be to find which.',
      'Vous avez maintenant le modèle mental complet d’un technicien niveau 1. Chaque incident du simulateur cassera un maillon de cette chaîne — DHCP, DNS, passerelle, port de commutateur, câble, NAT — et votre travail sera de trouver lequel.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Two PCs on 192.168.10.0/24 via one switch. Do they need a router to ping each other?', 'Deux PC en 192.168.10.0/24 sur un commutateur. Faut-il un routeur pour se pinguer ?'), options: [t('Yes', 'Oui'), t('No — same subnet', 'Non — même sous-réseau'), t('Only with DNS', 'Seulement avec DNS'), t('Only with NAT', 'Seulement avec NAT')], answer: 1, explain: t('Same subnet = direct communication through the switch.', 'Même sous-réseau = communication directe via le commutateur.') },
      { kind: 'mcq', prompt: t('Which component replaces the private source IP with a public one?', 'Quel élément remplace l’IP source privée par une IP publique ?'), options: ['DNS', 'ARP', t('NAT on the router', 'Le NAT du routeur'), 'DHCP'], answer: 2, explain: 'NAT.' },
      { kind: 'tf', prompt: t('To reach a remote web server, a PC uses ARP to find the web server’s MAC address.', 'Pour joindre un serveur web distant, un PC utilise ARP pour trouver la MAC du serveur web.'), answer: false, explain: t('It ARPs for its default gateway’s MAC, not the remote server’s.', 'Il fait un ARP pour la MAC de sa passerelle, pas celle du serveur distant.') },
      { kind: 'mcq', prompt: t('Which protocol gives the PC its IP settings at boot?', 'Quel protocole donne ses réglages IP au PC au démarrage ?'), options: ['DNS', 'DHCP', 'ICMP', 'ARP'], answer: 1, explain: 'DHCP.' },
    ],
  },
]
