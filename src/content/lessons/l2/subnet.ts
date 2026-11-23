import { t, type Lesson } from '../types'

export const subnetLessons: Lesson[] = [
  {
    id: 'l2-subnet.1',
    title: t('Masks, prefixes and the binary AND', 'Masques, préfixes et ET binaire'),
    minutes: 15,
    objectives: [
      t('Convert between decimal and binary octets', 'Convertir les octets entre décimal et binaire'),
      t('Translate a prefix (/26) into a mask (255.255.255.192)', 'Traduire un préfixe (/26) en masque (255.255.255.192)'),
      t('Find the network address with a binary AND', 'Trouver l’adresse réseau avec un ET binaire'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Why subnet?', 'Pourquoi des sous-réseaux ?'),
        body: t(
          'One flat network of 500 PCs means every broadcast reaches 500 machines, one virus spreads everywhere, and you cannot separate Sales from Finance. **Subnetting** splits a big network into smaller ones: smaller broadcast domains, better security (a firewall between subnets), and an addressing plan that mirrors the company.',
          'Un réseau plat de 500 PC signifie que chaque broadcast touche 500 machines, qu’un virus se propage partout et qu’on ne peut pas séparer le Commercial de la Finance. Le **découpage en sous-réseaux** divise un grand réseau en plus petits : domaines de diffusion réduits, meilleure sécurité (pare-feu entre sous-réseaux) et un plan d’adressage qui reflète l’entreprise.',
        ),
      },
      {
        type: 'table',
        head: [t('Bit position', 'Position du bit'), '128', '64', '32', '16', '8', '4', '2', '1'],
        rows: [
          ['192', '1', '1', '0', '0', '0', '0', '0', '0'],
          ['168', '1', '0', '1', '0', '1', '0', '0', '0'],
          ['77', '0', '1', '0', '0', '1', '1', '0', '1'],
          ['255', '1', '1', '1', '1', '1', '1', '1', '1'],
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('The 8 mask values to know by heart', 'Les 8 valeurs de masque à connaître par cœur'),
        body: t('A mask octet is always ones followed by zeros, so only these values exist: **0, 128, 192, 224, 240, 248, 252, 254, 255**. Each one adds the next bit: 128, +64 = 192, +32 = 224, +16 = 240, +8 = 248, +4 = 252, +2 = 254, +1 = 255.', 'Un octet de masque est toujours des 1 puis des 0, donc seules ces valeurs existent : **0, 128, 192, 224, 240, 248, 252, 254, 255**. Chacune ajoute le bit suivant : 128, +64 = 192, +32 = 224, +16 = 240, +8 = 248, +4 = 252, +2 = 254, +1 = 255.'),
      },
      {
        type: 'table',
        head: [t('Prefix', 'Préfixe'), t('Mask', 'Masque'), t('Addresses', 'Adresses'), t('Hosts', 'Hôtes')],
        rows: [
          ['/24', '255.255.255.0', '256', '254'],
          ['/25', '255.255.255.128', '128', '126'],
          ['/26', '255.255.255.192', '64', '62'],
          ['/27', '255.255.255.224', '32', '30'],
          ['/28', '255.255.255.240', '16', '14'],
          ['/29', '255.255.255.248', '8', '6'],
          ['/30', '255.255.255.252', '4', '2'],
          ['/16', '255.255.0.0', '65 536', '65 534'],
        ],
      },
      { type: 'animation', anim: 'binary-and', title: t('Network, broadcast and hosts of 192.168.10.77/26', 'Réseau, diffusion et hôtes de 192.168.10.77/26') },
      {
        type: 'check',
        question: {
          kind: 'input',
          prompt: t('What is the mask for /27?', 'Quel est le masque d’un /27 ?'),
          accept: ['255.255.255.224'],
          explain: t('27 = 24 + 3 bits → 128+64+32 = 224.', '27 = 24 + 3 bits → 128+64+32 = 224.'),
          placeholder: '255.255.255.x',
        },
      },
      {
        type: 'text',
        title: t('The host formula', 'La formule des hôtes'),
        body: t('With **h** host bits: total addresses = **2ʰ**, usable hosts = **2ʰ − 2** (the first is the network address, the last is the broadcast). Host bits = 32 − prefix. Example /26: h = 6 → 64 addresses, 62 hosts.', 'Avec **h** bits hôte : adresses totales = **2ʰ**, hôtes utilisables = **2ʰ − 2** (la première est l’adresse réseau, la dernière la diffusion). Bits hôte = 32 − préfixe. Exemple /26 : h = 6 → 64 adresses, 62 hôtes.'),
      },
      {
        type: 'check',
        question: {
          kind: 'input',
          prompt: t('How many usable hosts in a /28?', 'Combien d’hôtes utilisables dans un /28 ?'),
          accept: ['14'],
          explain: t('h = 4 → 2⁴ − 2 = 14.', 'h = 4 → 2⁴ − 2 = 14.'),
        },
      },
    ],
    vocabulary: [
      { term: t('Subnet mask', 'Masque de sous-réseau'), def: t('32 bits: ones for the network part, zeros for the host part.', '32 bits : 1 pour la partie réseau, 0 pour la partie hôte.') },
      { term: t('Prefix length', 'Longueur de préfixe'), def: t('Number of ones in the mask (/24).', 'Nombre de 1 du masque (/24).') },
      { term: t('Network address', 'Adresse réseau'), def: t('All host bits 0 — identifies the subnet.', 'Tous les bits hôte à 0 — identifie le sous-réseau.') },
      { term: t('Broadcast address', 'Adresse de diffusion'), def: t('All host bits 1 — reaches every host of the subnet.', 'Tous les bits hôte à 1 — touche tous les hôtes du sous-réseau.') },
    ],
    practice: t('Subnetting questions appear in every networking job interview and certification (CCNA, Network+). Aim to solve a /26–/30 question in under 30 seconds — practise with the Subnetting Sprint in the Assessment Center.', 'Les questions de sous-réseaux tombent dans tous les entretiens et certifications réseau (CCNA, Network+). Visez moins de 30 secondes pour une question /26–/30 — entraînez-vous avec le Sprint sous-réseaux du Centre d’évaluation.'),
    quiz: [
      { kind: 'mcq', prompt: t('/25 corresponds to the mask…', '/25 correspond au masque…'), options: ['255.255.255.0', '255.255.255.128', '255.255.255.192', '255.255.128.0'], answer: 1, explain: '255.255.255.128.' },
      { kind: 'input', prompt: t('Binary of 224?', 'Binaire de 224 ?'), accept: ['11100000'], explain: '128+64+32 = 11100000.' },
      { kind: 'input', prompt: t('Network address of 10.0.5.200/24?', 'Adresse réseau de 10.0.5.200/24 ?'), accept: ['10.0.5.0'], explain: '10.0.5.0.' },
      { kind: 'mcq', prompt: t('Which is NOT a valid mask octet?', 'Lequel n’est PAS un octet de masque valide ?'), options: ['248', '252', '250', '192'], answer: 2, explain: t('250 = 11111010 — not contiguous ones.', '250 = 11111010 — les 1 ne sont pas contigus.') },
      { kind: 'input', prompt: t('Usable hosts in a /30?', 'Hôtes utilisables dans un /30 ?'), accept: ['2'], explain: '2² − 2 = 2.' },
      { kind: 'input', prompt: t('Prefix length of 255.255.255.240?', 'Longueur de préfixe de 255.255.255.240 ?'), accept: ['28', '/28'], explain: '/28.' },
    ],
  },
  {
    id: 'l2-subnet.2',
    title: t('The block-size method: answers in seconds', 'La méthode de la taille de bloc : la réponse en quelques secondes'),
    minutes: 14,
    objectives: [
      t('Find network, broadcast and host range without writing binary', 'Trouver réseau, diffusion et plage d’hôtes sans écrire le binaire'),
      t('Use the interactive calculator to verify your answers', 'Utiliser le calculateur interactif pour vérifier vos réponses'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('The magic number', 'Le nombre magique'),
        body: t(
          'Find the **interesting octet** (the one where the mask is neither 255 nor 0). Then:\n\n1. **Block size** = 256 − mask value in that octet.\n2. Subnets start at multiples of the block size: 0, block, 2×block…\n3. The **network** is the multiple just below (or equal to) the IP’s octet.\n4. The **broadcast** is the next multiple − 1.\n5. Hosts = everything in between.',
          'Repérez l’**octet intéressant** (celui où le masque n’est ni 255 ni 0). Puis :\n\n1. **Taille de bloc** = 256 − valeur du masque dans cet octet.\n2. Les sous-réseaux commencent aux multiples de la taille de bloc : 0, bloc, 2×bloc…\n3. Le **réseau** est le multiple juste en dessous (ou égal) de l’octet de l’IP.\n4. La **diffusion** est le multiple suivant − 1.\n5. Les hôtes = tout ce qui est entre les deux.',
        ),
      },
      {
        type: 'example',
        title: t('172.16.45.130/27', '172.16.45.130/27'),
        body: t(
          '1. /27 → mask 255.255.255.**224**, interesting octet = 4th.\n2. Block = 256 − 224 = **32** → subnets at .0, .32, .64, .96, **.128**, .160…\n3. 130 sits between 128 and 160 → network **172.16.45.128**.\n4. Broadcast = 160 − 1 → **172.16.45.159**.\n5. Hosts **.129 to .158** (30 hosts).',
          '1. /27 → masque 255.255.255.**224**, octet intéressant = 4e.\n2. Bloc = 256 − 224 = **32** → sous-réseaux en .0, .32, .64, .96, **.128**, .160…\n3. 130 est entre 128 et 160 → réseau **172.16.45.128**.\n4. Diffusion = 160 − 1 → **172.16.45.159**.\n5. Hôtes **.129 à .158** (30 hôtes).',
        ),
      },
      { type: 'widget', widget: 'subnet-calc' },
      {
        type: 'check',
        question: {
          kind: 'fields',
          prompt: t('For 10.1.1.70/28 find:', 'Pour 10.1.1.70/28 trouvez :'),
          fields: [
            { label: t('Network', 'Réseau'), accept: ['10.1.1.64'] },
            { label: t('Broadcast', 'Diffusion'), accept: ['10.1.1.79'] },
            { label: t('First host', 'Premier hôte'), accept: ['10.1.1.65'] },
          ],
          explain: t('Block 16: …64, 80 → network .64, broadcast .79, hosts .65–.78.', 'Bloc 16 : …64, 80 → réseau .64, diffusion .79, hôtes .65–.78.'),
        },
      },
      {
        type: 'example',
        title: t('When the interesting octet is the 3rd', 'Quand l’octet intéressant est le 3e'),
        body: t(
          '10.20.77.5/21 → mask 255.255.**248**.0. Block = 256 − 248 = **8** in the 3rd octet → 0, 8, … 72, **80**… 77 is in the 72 block.\n\nNetwork **10.20.72.0**, broadcast **10.20.79.255**, hosts 10.20.72.1 – 10.20.79.254 (2¹¹ − 2 = 2046 hosts).',
          '10.20.77.5/21 → masque 255.255.**248**.0. Bloc = 256 − 248 = **8** dans le 3e octet → 0, 8, … 72, **80**… 77 est dans le bloc 72.\n\nRéseau **10.20.72.0**, diffusion **10.20.79.255**, hôtes 10.20.72.1 – 10.20.79.254 (2¹¹ − 2 = 2046 hôtes).',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'input',
          prompt: t('Broadcast address of 192.168.4.200/26?', 'Adresse de diffusion de 192.168.4.200/26 ?'),
          accept: ['192.168.4.255'],
          explain: t('Block 64: 192 → 256. Broadcast .255.', 'Bloc 64 : 192 → 256. Diffusion .255.'),
        },
      },
    ],
    vocabulary: [
      { term: t('Block size', 'Taille de bloc'), def: t('256 − mask value in the interesting octet.', '256 − valeur du masque dans l’octet intéressant.') },
      { term: t('Interesting octet', 'Octet intéressant'), def: t('The octet where the mask is between 0 and 255.', 'L’octet où le masque est entre 0 et 255.') },
    ],
    practice: t('Before assigning a static IP to a printer or server, always compute the host range of its subnet — giving a device the network or broadcast address is a classic beginner mistake that breaks it silently.', 'Avant de donner une IP fixe à une imprimante ou un serveur, calculez toujours la plage d’hôtes — attribuer l’adresse réseau ou de diffusion est une erreur classique qui casse l’appareil sans bruit.'),
    quiz: [
      { kind: 'input', prompt: t('Block size for mask 255.255.255.240?', 'Taille de bloc pour le masque 255.255.255.240 ?'), accept: ['16'], explain: '256 − 240 = 16.' },
      { kind: 'input', prompt: t('Network address of 192.168.1.100/26?', 'Adresse réseau de 192.168.1.100/26 ?'), accept: ['192.168.1.64'], explain: t('Block 64 → .64.', 'Bloc 64 → .64.') },
      { kind: 'input', prompt: t('Broadcast of 172.16.10.33/29?', 'Diffusion de 172.16.10.33/29 ?'), accept: ['172.16.10.39'], explain: t('Block 8: 32 → 40, broadcast .39.', 'Bloc 8 : 32 → 40, diffusion .39.') },
      { kind: 'mcq', prompt: t('Is 10.0.0.63 a usable host in 10.0.0.0/26?', '10.0.0.63 est-il un hôte utilisable dans 10.0.0.0/26 ?'), options: [t('Yes', 'Oui'), t('No — it is the broadcast', 'Non — c’est la diffusion')], answer: 1, explain: t('Block 64: .0–.63; .63 is the broadcast.', 'Bloc 64 : .0–.63 ; .63 est la diffusion.') },
      { kind: 'input', prompt: t('Last usable host of 10.10.8.0/22?', 'Dernier hôte utilisable de 10.10.8.0/22 ?'), accept: ['10.10.11.254'], explain: t('Block 4 in 3rd octet: 8–11 → last host 10.10.11.254.', 'Bloc 4 dans le 3e octet : 8–11 → dernier hôte 10.10.11.254.') },
    ],
  },
  {
    id: 'l2-subnet.3',
    title: t('Splitting a network into equal subnets', 'Découper un réseau en sous-réseaux égaux'),
    minutes: 13,
    objectives: [
      t('Calculate how many bits to borrow for N subnets', 'Calculer combien de bits emprunter pour N sous-réseaux'),
      t('List every subnet with its range', 'Lister chaque sous-réseau avec sa plage'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Borrowing bits', 'Emprunter des bits'),
        body: t('To create subnets, you **borrow** bits from the host part. Borrowing **n** bits gives **2ⁿ subnets**. Find the smallest n where 2ⁿ ≥ the number of subnets you need.', 'Pour créer des sous-réseaux, on **emprunte** des bits à la partie hôte. Emprunter **n** bits donne **2ⁿ sous-réseaux**. Trouvez le plus petit n tel que 2ⁿ ≥ le nombre de sous-réseaux voulus.'),
      },
      { type: 'animation', anim: 'subnet-split', title: t('One /24 becomes 2, 4, 8, 16 subnets', 'Un /24 devient 2, 4, 8, 16 sous-réseaux') },
      {
        type: 'example',
        title: t('5 departments, one 192.168.50.0/24', '5 services, un seul 192.168.50.0/24'),
        body: t(
          '- Need 5 subnets → 2² = 4 is too few, 2³ = **8** works → borrow **3 bits** → /24 + 3 = **/27**.\n- Block size 32, each subnet has 30 hosts.\n- Subnets: .0, .32, .64, .96, .128 (+ .160, .192, .224 spare for growth).',
          '- Besoin de 5 sous-réseaux → 2² = 4 trop peu, 2³ = **8** convient → emprunter **3 bits** → /24 + 3 = **/27**.\n- Taille de bloc 32, chaque sous-réseau a 30 hôtes.\n- Sous-réseaux : .0, .32, .64, .96, .128 (+ .160, .192, .224 en réserve).',
        ),
      },
      {
        type: 'table',
        head: [t('Department', 'Service'), t('Subnet', 'Sous-réseau'), t('Gateway (first host)', 'Passerelle (1er hôte)'), t('Hosts', 'Hôtes'), t('Broadcast', 'Diffusion')],
        rows: [
          ['Admin', '192.168.50.0/27', '.1', '.1 – .30', '.31'],
          [t('Sales', 'Commercial'), '192.168.50.32/27', '.33', '.33 – .62', '.63'],
          ['IT', '192.168.50.64/27', '.65', '.65 – .94', '.95'],
          [t('Servers', 'Serveurs'), '192.168.50.96/27', '.97', '.97 – .126', '.127'],
          [t('Printers', 'Imprimantes'), '192.168.50.128/27', '.129', '.129 – .158', '.159'],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('You need 10 subnets from a /24. Which prefix?', 'Il faut 10 sous-réseaux à partir d’un /24. Quel préfixe ?'),
          options: ['/26', '/27', '/28', '/29'],
          answer: 2,
          explain: t('2³ = 8 < 10, 2⁴ = 16 ≥ 10 → borrow 4 → /28.', '2³ = 8 < 10, 2⁴ = 16 ≥ 10 → emprunter 4 → /28.'),
        },
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Convention: gateway = first host', 'Convention : passerelle = premier hôte'),
        body: t('Most companies give the router the **first usable address** of each subnet (.1, .33, .65…). Some use the last one. Pick one rule and apply it everywhere — technicians will thank you at 3 a.m.', 'La plupart des entreprises donnent au routeur la **première adresse utilisable** de chaque sous-réseau (.1, .33, .65…). Certaines prennent la dernière. Choisissez une règle et appliquez-la partout — les techniciens vous remercieront à 3 h du matin.'),
      },
      {
        type: 'check',
        question: {
          kind: 'input',
          prompt: t('In 192.168.50.0/27 subnets, what is the network address of the 4th subnet?', 'Dans le découpage 192.168.50.0/27, quelle est l’adresse du 4e sous-réseau ?'),
          accept: ['192.168.50.96'],
          explain: t('.0, .32, .64, .96 → the 4th is .96.', '.0, .32, .64, .96 → le 4e est .96.'),
        },
      },
    ],
    vocabulary: [
      { term: t('Borrowed bits', 'Bits empruntés'), def: t('Host bits turned into network bits to create subnets.', 'Bits hôte transformés en bits réseau pour créer des sous-réseaux.') },
      { term: t('Addressing plan', 'Plan d’adressage'), def: t('Document listing every subnet, its use and gateway.', 'Document listant chaque sous-réseau, son usage et sa passerelle.') },
    ],
    practice: t('Keep an addressing plan (a simple spreadsheet or IPAM tool) for every network you manage: subnet, VLAN, purpose, gateway, DHCP range. It is the first document an auditor or a new colleague asks for.', 'Tenez un plan d’adressage (tableur ou outil IPAM) pour chaque réseau géré : sous-réseau, VLAN, usage, passerelle, plage DHCP. C’est le premier document que demande un auditeur ou un nouveau collègue.'),
    quiz: [
      { kind: 'input', prompt: t('Borrowing 2 bits gives how many subnets?', 'Emprunter 2 bits donne combien de sous-réseaux ?'), accept: ['4'], explain: '2² = 4.' },
      { kind: 'mcq', prompt: t('6 subnets from 10.0.0.0/24. Prefix?', '6 sous-réseaux depuis 10.0.0.0/24. Préfixe ?'), options: ['/25', '/26', '/27', '/28'], answer: 2, explain: '2³ = 8 → /27.' },
      { kind: 'input', prompt: t('Second /26 subnet of 172.16.1.0/24?', 'Deuxième sous-réseau /26 de 172.16.1.0/24 ?'), accept: ['172.16.1.64', '172.16.1.64/26'], explain: '.0, .64 → 172.16.1.64.' },
      { kind: 'input', prompt: t('Hosts per subnet when a /24 is split into 16 subnets?', 'Hôtes par sous-réseau quand un /24 est coupé en 16 ?'), accept: ['14'], explain: '/28 → 14.' },
      { kind: 'tf', prompt: t('Splitting into more subnets gives each subnet more hosts.', 'Découper en plus de sous-réseaux donne plus d’hôtes à chacun.'), answer: false, explain: t('More subnets = fewer hosts each.', 'Plus de sous-réseaux = moins d’hôtes chacun.') },
    ],
  },
  {
    id: 'l2-subnet.4',
    title: t('VLSM: subnets sized by need', 'VLSM : des sous-réseaux à la bonne taille'),
    minutes: 14,
    objectives: [
      t('Choose a prefix from a number of hosts', 'Choisir un préfixe à partir d’un nombre d’hôtes'),
      t('Build a VLSM plan without overlaps', 'Construire un plan VLSM sans chevauchement'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('From hosts to prefix', 'Des hôtes au préfixe'),
        body: t('Find the smallest **h** where **2ʰ − 2 ≥ hosts needed**. Prefix = 32 − h. Quick table: 2 hosts → /30, 6 → /29, 14 → /28, 30 → /27, 62 → /26, 126 → /25, 254 → /24, 510 → /23.', 'Trouvez le plus petit **h** tel que **2ʰ − 2 ≥ hôtes nécessaires**. Préfixe = 32 − h. Table rapide : 2 hôtes → /30, 6 → /29, 14 → /28, 30 → /27, 62 → /26, 126 → /25, 254 → /24, 510 → /23.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A department needs 40 hosts. Smallest prefix?', 'Un service a besoin de 40 hôtes. Plus petit préfixe ?'),
          options: ['/27', '/26', '/25', '/28'],
          answer: 1,
          explain: t('/27 gives 30 (too few); /26 gives 62.', '/27 donne 30 (trop peu) ; /26 donne 62.'),
        },
      },
      { type: 'animation', anim: 'vlsm', title: t('Building a VLSM plan, largest first', 'Construire un plan VLSM, le plus grand d’abord') },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Always allocate largest first', 'Toujours allouer le plus grand d’abord'),
        body: t('If you place a small /30 at the start, a /25 can no longer begin on a valid boundary (a /25 must start at .0 or .128). Sorting from largest to smallest guarantees every block is aligned and nothing overlaps.', 'Si vous placez un petit /30 au début, un /25 ne peut plus commencer sur une frontière valide (un /25 doit commencer en .0 ou .128). Trier du plus grand au plus petit garantit des blocs alignés et sans chevauchement.'),
      },
      {
        type: 'example',
        title: t('Plan for 10.5.0.0/24', 'Plan pour 10.5.0.0/24'),
        body: t('Needs: Warehouse 60, Office 25, Wi-Fi guests 12, 2 router links.', 'Besoins : Entrepôt 60, Bureaux 25, Wi-Fi invités 12, 2 liens routeurs.'),
        code: 'Warehouse  60 hosts → /26 → 10.5.0.0/26     (.1 – .62)\nOffice     25 hosts → /27 → 10.5.0.64/27    (.65 – .94)\nGuests     12 hosts → /28 → 10.5.0.96/28    (.97 – .110)\nLink R1-R2  2 hosts → /30 → 10.5.0.112/30   (.113 – .114)\nLink R2-R3  2 hosts → /30 → 10.5.0.116/30   (.117 – .118)\nFree for growth:            10.5.0.120 – 10.5.0.255',
      },
      {
        type: 'check',
        question: {
          kind: 'input',
          prompt: t('Continuing the plan: the next /30 after 10.5.0.116/30 starts at…', 'Suite du plan : le /30 suivant après 10.5.0.116/30 commence à…'),
          accept: ['10.5.0.120', '10.5.0.120/30'],
          explain: t('/30 blocks are 4 wide: 116 + 4 = 120.', 'Les blocs /30 font 4 : 116 + 4 = 120.'),
        },
      },
    ],
    vocabulary: [
      { term: 'VLSM', def: t('Variable Length Subnet Masking — different prefix sizes inside one network.', 'Masques de longueur variable — des préfixes différents dans un même réseau.') },
      { term: t('Point-to-point link', 'Lien point-à-point'), def: t('A link between exactly two routers, usually a /30 (or /31).', 'Un lien entre exactement deux routeurs, souvent un /30 (ou /31).') },
    ],
    practice: t('Leave room to grow: if a department has 25 people today, they will be 40 next year. Network engineers usually plan for at least 50 % growth and keep free blocks between subnets.', 'Prévoyez la croissance : un service de 25 personnes en aura 40 l’an prochain. Les ingénieurs réseau prévoient au moins 50 % de croissance et gardent des blocs libres entre les sous-réseaux.'),
    quiz: [
      { kind: 'input', prompt: t('Prefix for 100 hosts?', 'Préfixe pour 100 hôtes ?'), accept: ['/25', '25'], explain: t('2⁷ − 2 = 126 → /25.', '2⁷ − 2 = 126 → /25.') },
      { kind: 'input', prompt: t('Prefix for a link between two routers?', 'Préfixe d’un lien entre deux routeurs ?'), accept: ['/30', '30'], explain: '/30 (2 hosts).' },
      { kind: 'mcq', prompt: t('In VLSM you allocate…', 'En VLSM on alloue…'), options: [t('Smallest first', 'Le plus petit d’abord'), t('Largest first', 'Le plus grand d’abord'), t('Alphabetically', 'Par ordre alphabétique'), t('Randomly', 'Au hasard')], answer: 1, explain: t('Largest first avoids misalignment.', 'Le plus grand d’abord évite les désalignements.') },
      { kind: 'tf', prompt: t('A /26 can start at 192.168.1.32.', 'Un /26 peut commencer en 192.168.1.32.'), answer: false, explain: t('/26 must start at multiples of 64.', 'Un /26 doit commencer à un multiple de 64.') },
      { kind: 'input', prompt: t('Prefix for 500 hosts?', 'Préfixe pour 500 hôtes ?'), accept: ['/23', '23'], explain: t('2⁹ − 2 = 510 → /23.', '2⁹ − 2 = 510 → /23.') },
    ],
  },
  {
    id: 'l2-subnet.5',
    title: t('Subnetting on the job: troubleshooting and summarising', 'Les sous-réseaux au travail : dépannage et agrégation'),
    minutes: 13,
    objectives: [
      t('Spot wrong masks and wrong gateways in an IP configuration', 'Repérer masques et passerelles erronés dans une configuration IP'),
      t('Decide whether two hosts are on the same subnet', 'Déterminer si deux hôtes sont dans le même sous-réseau'),
      t('Summarise contiguous subnets into one route', 'Agréger des sous-réseaux contigus en une seule route'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Same subnet or not?', 'Même sous-réseau ou non ?'),
        body: t('A host sends directly (ARP) to destinations **in its own subnet**, and to its **gateway** for everything else. It decides by ANDing the destination with **its own mask**. If the mask is wrong, it makes the wrong decision — the classic source of "I can reach some PCs but not others".', 'Un hôte envoie directement (ARP) aux destinations **de son propre sous-réseau**, et à sa **passerelle** pour tout le reste. Il décide en appliquant un ET entre la destination et **son propre masque**. Si le masque est faux, il décide mal — source classique de « j’atteins certains PC mais pas d’autres ».'),
      },
      {
        type: 'example',
        title: t('Find the mistake', 'Trouvez l’erreur'),
        body: t(
          'Network 192.168.10.0/26, gateway .1. Three PCs are misconfigured:\n\n- **PC-A** 192.168.10.20 mask 255.255.255.0 gw .1 → mask too large: it thinks .100 is local and ARPs for it instead of using the router.\n- **PC-B** 192.168.10.70 mask 255.255.255.192 gw .1 → .70 is in the **.64 subnet**; gateway .1 is not in its subnet → no internet.\n- **PC-C** 192.168.10.63 → that is the **broadcast** address of .0/26 — unusable.',
          'Réseau 192.168.10.0/26, passerelle .1. Trois PC sont mal configurés :\n\n- **PC-A** 192.168.10.20 masque 255.255.255.0 pass. .1 → masque trop large : il croit que .100 est local et fait un ARP au lieu de passer par le routeur.\n- **PC-B** 192.168.10.70 masque 255.255.255.192 pass. .1 → .70 est dans le **sous-réseau .64** ; la passerelle .1 n’est pas dans son sous-réseau → pas d’internet.\n- **PC-C** 192.168.10.63 → c’est l’adresse de **diffusion** de .0/26 — inutilisable.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Are 10.1.1.10/27 and 10.1.1.40/27 in the same subnet?', '10.1.1.10/27 et 10.1.1.40/27 sont-ils dans le même sous-réseau ?'),
          options: [t('Yes', 'Oui'), t('No', 'Non')],
          answer: 1,
          explain: t('Block 32: .10 is in .0–.31, .40 is in .32–.63. Different subnets — they need a router.', 'Bloc 32 : .10 est dans .0–.31, .40 dans .32–.63. Sous-réseaux différents — il faut un routeur.'),
        },
      },
      {
        type: 'text',
        title: t('Route summarisation', 'Agrégation de routes'),
        body: t(
          'A branch office uses 10.20.0.0/24, 10.20.1.0/24, 10.20.2.0/24 and 10.20.3.0/24. Instead of four routes, head office can use one **summary**: find the common leading bits.\n\nThird octets 0, 1, 2, 3 = 000000**00**, …**01**, …**10**, …**11** → the first 22 bits are identical → **10.20.0.0/22**. Smaller routing tables, faster routers, and one line to change instead of four.',
          'Une agence utilise 10.20.0.0/24, 10.20.1.0/24, 10.20.2.0/24 et 10.20.3.0/24. Au lieu de quatre routes, le siège peut en utiliser une **agrégée** : on cherche les bits de tête communs.\n\nTroisièmes octets 0, 1, 2, 3 = 000000**00**, …**01**, …**10**, …**11** → les 22 premiers bits sont identiques → **10.20.0.0/22**. Des tables plus petites, des routeurs plus rapides, et une ligne à modifier au lieu de quatre.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'input',
          prompt: t('Summarise 172.16.8.0/24 … 172.16.15.0/24 (8 networks).', 'Agrégez 172.16.8.0/24 … 172.16.15.0/24 (8 réseaux).'),
          accept: ['172.16.8.0/21'],
          explain: t('8 networks = 3 bits → /24 − 3 = /21, starting at 8 (a multiple of 8).', '8 réseaux = 3 bits → /24 − 3 = /21, en partant de 8 (multiple de 8).'),
        },
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('Your troubleshooting reflex', 'Votre réflexe de dépannage'),
        body: t('Each time a host "can’t reach" something, write down: its IP, mask, gateway, and the destination IP. Compute the subnet of each. Half of all L3 tickets are solved right there.', 'Chaque fois qu’un hôte « n’arrive pas à joindre » quelque chose, notez : son IP, son masque, sa passerelle, et l’IP de destination. Calculez le sous-réseau de chacun. La moitié des tickets L3 se règlent là.'),
      },
    ],
    vocabulary: [
      { term: t('Summary route', 'Route agrégée'), def: t('One route covering several contiguous networks.', 'Une route couvrant plusieurs réseaux contigus.') },
      { term: t('Supernet', 'Sur-réseau'), def: t('A prefix shorter than the networks it covers.', 'Un préfixe plus court que les réseaux qu’il couvre.') },
    ],
    practice: t('In the IT Operations Simulator, the "Monday morning outage" and "Wrong VLAN" incidents both start with reading an IP configuration. Try them now with your new subnetting eyes.', 'Dans le Simulateur d’exploitation IT, les incidents « Panne du lundi matin » et « VLAN mal configuré » commencent par la lecture d’une configuration IP. Essayez-les avec vos nouveaux yeux de « subnetteur ».'),
    quiz: [
      { kind: 'mcq', prompt: t('PC 192.168.1.70/26, gateway 192.168.1.1. Problem?', 'PC 192.168.1.70/26, passerelle 192.168.1.1. Problème ?'), options: [t('None', 'Aucun'), t('Gateway is outside the PC’s subnet', 'La passerelle est hors du sous-réseau du PC'), t('Address is a broadcast', 'L’adresse est une diffusion'), t('Mask invalid', 'Masque invalide')], answer: 1, explain: t('.70/26 is in .64–.127; .1 is not.', '.70/26 est dans .64–.127 ; .1 non.') },
      { kind: 'mcq', prompt: t('Same subnet: 172.16.5.130/25 and 172.16.5.200/25?', 'Même sous-réseau : 172.16.5.130/25 et 172.16.5.200/25 ?'), options: [t('Yes', 'Oui'), t('No', 'Non')], answer: 0, explain: t('Both in .128–.255.', 'Tous deux dans .128–.255.') },
      { kind: 'input', prompt: t('Summarise 192.168.0.0/24 and 192.168.1.0/24.', 'Agrégez 192.168.0.0/24 et 192.168.1.0/24.'), accept: ['192.168.0.0/23'], explain: '192.168.0.0/23.' },
      { kind: 'tf', prompt: t('A mask that is too large (e.g. /16 instead of /24) can make a host ARP for remote addresses.', 'Un masque trop large (/16 au lieu de /24) peut pousser un hôte à faire un ARP pour des adresses distantes.'), answer: true, explain: t('It wrongly believes they are local.', 'Il croit à tort qu’elles sont locales.') },
      { kind: 'mcq', prompt: t('10.0.0.127/25 is…', '10.0.0.127/25 est…'), options: [t('A usable host', 'Un hôte utilisable'), t('The network address', 'L’adresse réseau'), t('The broadcast address', 'L’adresse de diffusion')], answer: 2, explain: t('Block 128: .0–.127 → broadcast .127.', 'Bloc 128 : .0–.127 → diffusion .127.') },
    ],
  },
]
