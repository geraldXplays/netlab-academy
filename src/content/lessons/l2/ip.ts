import { t, type Lesson } from '../types'

export const ipv46Lessons: Lesson[] = [
  {
    id: 'l2-ipv4-6.1',
    title: t('IPv4 in depth: public, private and special addresses', 'IPv4 en profondeur : adresses publiques, privées et spéciales'),
    minutes: 14,
    objectives: [
      t('Recognise private (RFC 1918) and public addresses', 'Reconnaître les adresses privées (RFC 1918) et publiques'),
      t('Identify loopback, APIPA, multicast and broadcast addresses', 'Identifier les adresses de bouclage, APIPA, multidiffusion et diffusion'),
      t('Read CIDR notation and know the old classes', 'Lire la notation CIDR et connaître les anciennes classes'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('4.3 billion is not enough', '4,3 milliards, ce n’est pas assez'),
        body: t(
          'IPv4 addresses are 32 bits, so there are 2³² ≈ **4.3 billion** of them — far fewer than the devices on Earth. Two tricks keep IPv4 alive:\n\n1. **Private addresses** that anyone can reuse inside their own network.\n2. **NAT** on the router, which lets a whole office share one **public** address to reach the Internet.\n\nThe long-term fix is **IPv6** (next lessons).',
          'Les adresses IPv4 font 32 bits : il en existe 2³² ≈ **4,3 milliards** — bien moins que les appareils sur Terre. Deux astuces maintiennent IPv4 en vie :\n\n1. Des **adresses privées** que chacun peut réutiliser dans son propre réseau.\n2. Le **NAT** sur le routeur, qui permet à tout un bureau de partager une seule adresse **publique** pour aller sur Internet.\n\nLa solution à long terme est **IPv6** (leçons suivantes).',
        ),
      },
      {
        type: 'table',
        head: [t('Range', 'Plage'), 'CIDR', t('Use', 'Usage')],
        rows: [
          ['10.0.0.0 – 10.255.255.255', '10.0.0.0/8', t('Private — large companies', 'Privée — grandes entreprises')],
          ['172.16.0.0 – 172.31.255.255', '172.16.0.0/12', t('Private — medium networks', 'Privée — réseaux moyens')],
          ['192.168.0.0 – 192.168.255.255', '192.168.0.0/16', t('Private — homes, small offices', 'Privée — maisons, petits bureaux')],
          ['127.0.0.0 – 127.255.255.255', '127.0.0.0/8', t('Loopback — "myself" (127.0.0.1)', 'Bouclage — « moi-même » (127.0.0.1)')],
          ['169.254.0.0 – 169.254.255.255', '169.254.0.0/16', t('APIPA — no DHCP answer', 'APIPA — pas de réponse DHCP')],
          ['224.0.0.0 – 239.255.255.255', '224.0.0.0/4', t('Multicast (one → many)', 'Multidiffusion (un → plusieurs)')],
          ['255.255.255.255', '/32', t('Limited broadcast (everyone on my LAN)', 'Diffusion limitée (tout mon LAN)')],
          ['0.0.0.0', '/0', t('"Any" / no address yet / default route', '« Tout » / pas encore d’adresse / route par défaut')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which address is PUBLIC?', 'Quelle adresse est PUBLIQUE ?'),
          options: ['172.20.5.4', '10.200.1.1', '172.32.1.10', '192.168.50.2'],
          answer: 2,
          explain: t('The private 172 block is 172.16–172.31. 172.32.x.x is public.', 'Le bloc privé 172 va de 172.16 à 172.31. 172.32.x.x est public.'),
        },
      },
      {
        type: 'text',
        title: t('Classes (history) and CIDR (today)', 'Classes (historique) et CIDR (aujourd’hui)'),
        body: t(
          'Originally the first octet decided the network size: **class A** (1–126, /8), **class B** (128–191, /16), **class C** (192–223, /24). This wasted enormous amounts of addresses, so in 1993 it was replaced by **CIDR** (Classless Inter-Domain Routing): the network size is written explicitly after a slash.\n\n`192.168.10.0/24` means "the first 24 bits are the network". You will still hear "a class C" to mean a /24 — it is just slang now.',
          'À l’origine, le premier octet fixait la taille du réseau : **classe A** (1–126, /8), **classe B** (128–191, /16), **classe C** (192–223, /24). Cela gaspillait énormément d’adresses ; en 1993, on l’a remplacé par **CIDR** (routage inter-domaines sans classe) : la taille du réseau est écrite après une barre oblique.\n\n`192.168.10.0/24` signifie « les 24 premiers bits sont le réseau ». On entend encore « une classe C » pour dire un /24 — c’est juste du jargon.',
        ),
      },
      {
        type: 'example',
        title: t('Reading ipconfig like a pro', 'Lire ipconfig comme un pro'),
        body: t('Three PCs, three diagnoses — just from the address.', 'Trois PC, trois diagnostics — rien qu’avec l’adresse.'),
        code: 'PC-A  IPv4 Address: 10.10.20.104   → normal private address from DHCP\nPC-B  IPv4 Address: 169.254.31.7   → APIPA: the PC never heard from a DHCP server\nPC-C  IPv4 Address: 127.0.0.1      → you are looking at the loopback adapter, not the NIC',
      },
      {
        type: 'callout',
        tone: 'info',
        title: t('Unicast, broadcast, multicast', 'Unicast, broadcast, multicast'),
        body: t('**Unicast**: one sender → one receiver (most traffic). **Broadcast**: one → all hosts on the local network (ARP, DHCP Discover) — routers do NOT forward broadcasts. **Multicast**: one → a group that subscribed (video streaming, routing protocols like OSPF on 224.0.0.5).', '**Unicast** : un émetteur → un récepteur (la majorité du trafic). **Broadcast** : un → tous les hôtes du réseau local (ARP, DHCP Discover) — les routeurs ne transmettent PAS les broadcasts. **Multicast** : un → un groupe abonné (streaming vidéo, protocoles de routage comme OSPF sur 224.0.0.5).'),
      },
      {
        type: 'check',
        question: {
          kind: 'tf',
          prompt: t('A router forwards broadcasts from one network to another.', 'Un routeur transmet les broadcasts d’un réseau à un autre.'),
          answer: false,
          explain: t('Routers stop broadcasts — that is why each router interface is a separate broadcast domain.', 'Les routeurs arrêtent les broadcasts — chaque interface de routeur est un domaine de diffusion distinct.'),
        },
      },
    ],
    vocabulary: [
      { term: 'RFC 1918', def: t('The standard defining the three private IPv4 ranges.', 'La norme définissant les trois plages IPv4 privées.') },
      { term: 'CIDR', def: t('Classless notation: address/prefix length.', 'Notation sans classe : adresse/longueur de préfixe.') },
      { term: 'APIPA', def: t('169.254.x.x self-assigned address when DHCP fails.', 'Adresse 169.254.x.x auto-attribuée quand le DHCP échoue.') },
      { term: 'Loopback', def: t('127.0.0.1 — the machine talking to itself.', '127.0.0.1 — la machine qui se parle à elle-même.') },
    ],
    practice: t('When you plan a new office network, pick a private range that does not collide with VPN users’ home networks (avoid 192.168.0.0/24 and 192.168.1.0/24 — most home routers use them). Companies prefer 10.x.x.x.', 'Quand vous planifiez un nouveau réseau, choisissez une plage privée qui ne chevauche pas les réseaux domestiques des utilisateurs VPN (évitez 192.168.0.0/24 et 192.168.1.0/24 — la plupart des box les utilisent). Les entreprises préfèrent 10.x.x.x.'),
    quiz: [
      { kind: 'mcq', prompt: t('Which is a private range?', 'Laquelle est une plage privée ?'), options: ['11.0.0.0/8', '172.16.0.0/12', '192.169.0.0/16', '100.0.0.0/8'], answer: 1, explain: '172.16.0.0/12.' },
      { kind: 'mcq', prompt: t('A PC shows 169.254.10.5. What failed?', 'Un PC affiche 169.254.10.5. Qu’est-ce qui a échoué ?'), options: ['DNS', 'DHCP', t('The gateway', 'La passerelle'), t('The browser', 'Le navigateur')], answer: 1, explain: 'APIPA = no DHCP.' },
      { kind: 'input', prompt: t('Type the IPv4 loopback address.', 'Tapez l’adresse de bouclage IPv4.'), accept: ['127.0.0.1'], explain: '127.0.0.1.' },
      { kind: 'mcq', prompt: t('Which sends one packet to every host on the local network?', 'Lequel envoie un paquet à tous les hôtes du réseau local ?'), options: ['Unicast', 'Broadcast', 'Multicast', 'Anycast'], answer: 1, explain: 'Broadcast.' },
      { kind: 'tf', prompt: t('"Class C" today usually just means a /24 network.', '« Classe C » désigne aujourd’hui en général un réseau /24.'), answer: true, explain: t('Classes are obsolete; the word survives as slang.', 'Les classes sont obsolètes ; le mot survit en jargon.') },
    ],
  },
  {
    id: 'l2-ipv4-6.2',
    title: t('IPv6 fundamentals', 'Les bases d’IPv6'),
    minutes: 15,
    objectives: [
      t('Write and shorten IPv6 addresses correctly', 'Écrire et abréger correctement les adresses IPv6'),
      t('Recognise global, link-local, unique-local and multicast addresses', 'Reconnaître les adresses globales, lien-local, uniques locales et multicast'),
      t('Explain the /64 prefix and interface ID', 'Expliquer le préfixe /64 et l’identifiant d’interface'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('128 bits', '128 bits'),
        body: t(
          'IPv6 uses **128-bit** addresses: 2¹²⁸ ≈ 340 undecillion (3.4 × 10³⁸). That is enough to give every grain of sand on Earth billions of addresses — no NAT needed. Addresses are written in **hexadecimal**: 8 groups of 4 hex digits separated by colons.\n\nHexadecimal uses 0–9 and a–f (a = 10 … f = 15). One hex digit = 4 bits, so one group = 16 bits.',
          'IPv6 utilise des adresses de **128 bits** : 2¹²⁸ ≈ 340 sextillions de milliards (3,4 × 10³⁸). De quoi donner des milliards d’adresses à chaque grain de sable — plus besoin de NAT. Les adresses s’écrivent en **hexadécimal** : 8 groupes de 4 chiffres hexa séparés par « : ».\n\nL’hexadécimal utilise 0–9 et a–f (a = 10 … f = 15). Un chiffre hexa = 4 bits, donc un groupe = 16 bits.',
        ),
      },
      { type: 'animation', anim: 'ipv6-compress', title: t('Shortening an IPv6 address', 'Abréger une adresse IPv6') },
      {
        type: 'check',
        question: {
          kind: 'input',
          prompt: t('Shorten fully: 2001:0db8:0000:0000:0000:0000:0000:0001', 'Abrégez au maximum : 2001:0db8:0000:0000:0000:0000:0000:0001'),
          accept: ['2001:db8::1'],
          explain: t('Leading zeros go, then the long run of zero groups becomes "::" → 2001:db8::1.', 'On retire les zéros de tête, puis la longue suite de groupes nuls devient « :: » → 2001:db8::1.'),
          placeholder: '2001:…',
        },
      },
      {
        type: 'table',
        head: [t('Type', 'Type'), t('Prefix', 'Préfixe'), t('Example', 'Exemple'), t('Meaning', 'Signification')],
        rows: [
          [t('Global unicast', 'Unicast global'), '2000::/3', '2001:db8:acad:1::10', t('Public, routable on the Internet', 'Publique, routable sur Internet')],
          [t('Link-local', 'Lien-local'), 'fe80::/10', 'fe80::1a2b:3cff:fe4d:5e6f', t('Only on the local link; every interface has one automatically', 'Seulement sur le lien local ; chaque interface en a une automatiquement')],
          [t('Unique local', 'Unique locale'), 'fc00::/7 (fd…)', 'fd12:3456:789a::1', t('Private, like 10.x in IPv4', 'Privée, comme 10.x en IPv4')],
          [t('Multicast', 'Multicast'), 'ff00::/8', 'ff02::1', t('Group delivery (ff02::1 = all nodes)', 'Remise à un groupe (ff02::1 = tous les nœuds)')],
          [t('Loopback', 'Bouclage'), '::1/128', '::1', t('Myself', 'Moi-même')],
          [t('Unspecified', 'Non spécifiée'), '::/128', '::', t('No address yet', 'Pas encore d’adresse')],
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: t('No more broadcast', 'Plus de broadcast'),
        body: t('IPv6 has **no broadcast**. Jobs done by broadcast in IPv4 (finding MAC addresses, finding routers) use **multicast** and the **Neighbor Discovery Protocol** (NDP), which replaces ARP.', 'IPv6 n’a **pas de broadcast**. Les tâches faites par broadcast en IPv4 (trouver les MAC, trouver les routeurs) utilisent le **multicast** et le **Neighbor Discovery Protocol** (NDP), qui remplace ARP.'),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('An interface shows fe80::9c1:4ff:fe21:8a3. This address is…', 'Une interface affiche fe80::9c1:4ff:fe21:8a3. Cette adresse est…'),
          options: [t('Global unicast', 'Unicast globale'), t('Link-local', 'Lien-local'), t('Multicast', 'Multicast'), t('Loopback', 'Bouclage')],
          answer: 1,
          explain: t('fe80::/10 is link-local — valid only on that network segment.', 'fe80::/10 est lien-local — valable uniquement sur ce segment.'),
        },
      },
      {
        type: 'text',
        title: t('Prefix and interface ID', 'Préfixe et identifiant d’interface'),
        body: t(
          'A typical IPv6 LAN is a **/64**: the first 64 bits are the **prefix** (given by your ISP or your company plan), the last 64 bits are the **interface ID** (the host). A company might receive a **/48** from its ISP, which it splits into 65,536 /64 subnets — one per VLAN. No more painful subnetting arithmetic!',
          'Un LAN IPv6 typique est un **/64** : les 64 premiers bits sont le **préfixe** (fourni par le FAI ou le plan d’adressage), les 64 derniers l’**identifiant d’interface** (l’hôte). Une entreprise peut recevoir un **/48** de son FAI, qu’elle découpe en 65 536 sous-réseaux /64 — un par VLAN. Fini le calcul de sous-réseaux douloureux !',
        ),
      },
    ],
    vocabulary: [
      { term: t('Hexadecimal', 'Hexadécimal'), def: t('Base 16: 0–9 and a–f.', 'Base 16 : 0–9 et a–f.') },
      { term: t('Hextet', 'Hextet'), def: t('One 16-bit group of an IPv6 address.', 'Un groupe de 16 bits d’une adresse IPv6.') },
      { term: 'Link-local', def: t('fe80:: address valid only on the local link.', 'Adresse fe80:: valable seulement sur le lien local.') },
      { term: 'NDP', def: t('Neighbor Discovery Protocol — IPv6 replacement for ARP.', 'Neighbor Discovery Protocol — remplace ARP en IPv6.') },
    ],
    practice: t('Run `ipconfig` on Windows: you will almost certainly see an IPv6 "Link-local Address" starting with fe80:: on every adapter — now you know why it is there even when your network is IPv4-only.', 'Lancez `ipconfig` sous Windows : vous verrez presque sûrement une « Adresse IPv6 de liaison locale » en fe80:: sur chaque carte — vous savez maintenant pourquoi elle est là même sur un réseau IPv4.'),
    quiz: [
      { kind: 'mcq', prompt: t('How many bits in an IPv6 address?', 'Combien de bits dans une adresse IPv6 ?'), options: ['32', '64', '128', '256'], answer: 2, explain: '128.' },
      { kind: 'tf', prompt: t('"::" can be used twice in the same address.', '« :: » peut être utilisé deux fois dans la même adresse.'), answer: false, explain: t('Only once, otherwise the address is ambiguous.', 'Une seule fois, sinon l’adresse est ambiguë.') },
      { kind: 'input', prompt: t('Type the IPv6 loopback address.', 'Tapez l’adresse de bouclage IPv6.'), accept: ['::1'], explain: '::1.' },
      { kind: 'mcq', prompt: t('Which protocol replaces ARP in IPv6?', 'Quel protocole remplace ARP en IPv6 ?'), options: ['DHCPv6', 'NDP', 'ICMPv4', 'RIP'], answer: 1, explain: 'NDP (ICMPv6).' },
      { kind: 'mcq', prompt: t('Which prefix is global unicast?', 'Quel préfixe est unicast global ?'), options: ['fe80::/10', 'ff00::/8', '2000::/3', 'fc00::/7'], answer: 2, explain: '2000::/3.' },
      { kind: 'input', prompt: t('Shorten 2001:0db8:0a0b:0000:0000:0000:0000:00ff', 'Abrégez 2001:0db8:0a0b:0000:0000:0000:0000:00ff'), accept: ['2001:db8:a0b::ff'], explain: '2001:db8:a0b::ff.' },
    ],
  },
  {
    id: 'l2-ipv4-6.3',
    title: t('IPv6 in practice: SLAAC, DHCPv6 and dual stack', 'IPv6 en pratique : SLAAC, DHCPv6 et double pile'),
    minutes: 12,
    objectives: [
      t('Explain how hosts get IPv6 addresses (SLAAC, DHCPv6)', 'Expliquer comment les hôtes obtiennent une IPv6 (SLAAC, DHCPv6)'),
      t('Configure IPv6 on a Cisco router interface', 'Configurer IPv6 sur une interface de routeur Cisco'),
      t('Understand dual stack and test IPv6 connectivity', 'Comprendre la double pile et tester la connectivité IPv6'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Addresses without a server: SLAAC', 'Des adresses sans serveur : SLAAC'),
        body: t(
          'With **SLAAC** (Stateless Address Autoconfiguration), a host builds its own address:\n\n1. It creates a link-local address (fe80::…).\n2. It sends a **Router Solicitation** to ff02::2 (all routers).\n3. The router answers with a **Router Advertisement** containing the /64 prefix and the gateway.\n4. The host adds its own 64-bit interface ID (random, for privacy, or **EUI-64** from its MAC).\n\nNo DHCP server needed. **DHCPv6** still exists for companies that want central control or to hand out DNS servers.',
          'Avec **SLAAC** (autoconfiguration sans état), un hôte construit sa propre adresse :\n\n1. Il crée une adresse lien-local (fe80::…).\n2. Il envoie une **Router Solicitation** à ff02::2 (tous les routeurs).\n3. Le routeur répond par une **Router Advertisement** contenant le préfixe /64 et la passerelle.\n4. L’hôte ajoute son identifiant d’interface de 64 bits (aléatoire, pour la vie privée, ou **EUI-64** dérivé de sa MAC).\n\nPas besoin de serveur DHCP. **DHCPv6** existe toujours pour les entreprises qui veulent un contrôle central ou distribuer les serveurs DNS.',
        ),
      },
      {
        type: 'example',
        title: t('IPv6 on a Cisco router', 'IPv6 sur un routeur Cisco'),
        body: t('Routing IPv6 must be switched on globally. Then give each interface an address; the router automatically starts sending Router Advertisements so PCs configure themselves with SLAAC.', 'Le routage IPv6 doit être activé globalement. On donne ensuite une adresse à chaque interface ; le routeur envoie automatiquement des Router Advertisements et les PC se configurent avec SLAAC.'),
        code: 'R1(config)# ipv6 unicast-routing\nR1(config)# interface g0/0/0\nR1(config-if)# ipv6 address 2001:db8:acad:10::1/64\nR1(config-if)# ipv6 address fe80::1 link-local\nR1(config-if)# no shutdown\nR1# show ipv6 interface brief',
      },
      {
        type: 'check',
        question: {
          kind: 'command',
          prompt: t('Which global command enables IPv6 routing on a Cisco router?', 'Quelle commande globale active le routage IPv6 sur un routeur Cisco ?'),
          accept: ['ipv6 unicast-routing'],
          explain: 'ipv6 unicast-routing',
          shell: 'R1(config)#',
        },
      },
      {
        type: 'text',
        title: t('Dual stack: IPv4 and IPv6 together', 'Double pile : IPv4 et IPv6 ensemble'),
        body: t(
          'The world is migrating slowly, so most networks run **dual stack**: every device has both an IPv4 and an IPv6 address. When a name resolves to both (an A record and an AAAA record), modern systems try IPv6 first and fall back to IPv4 ("Happy Eyeballs").\n\nTest with `ping -6 google.com` (Windows) or `ping6` / `ping -6` (Linux), and `tracert -6`.',
          'Le monde migre lentement, donc la plupart des réseaux sont en **double pile** : chaque appareil a une IPv4 et une IPv6. Quand un nom se résout vers les deux (enregistrement A et AAAA), les systèmes modernes essaient IPv6 d’abord et se replient sur IPv4 (« Happy Eyeballs »).\n\nTestez avec `ping -6 google.com` (Windows) ou `ping6` / `ping -6` (Linux), et `tracert -6`.',
        ),
      },
      {
        type: 'table',
        head: [t('Task', 'Tâche'), 'IPv4', 'IPv6'],
        rows: [
          [t('Find MAC of a neighbour', 'Trouver la MAC d’un voisin'), 'ARP', 'NDP (Neighbor Solicitation)'],
          [t('Automatic address', 'Adresse automatique'), 'DHCP', 'SLAAC / DHCPv6'],
          [t('DNS record', 'Enregistrement DNS'), 'A', 'AAAA'],
          [t('Private addresses', 'Adresses privées'), '10/8, 172.16/12, 192.168/16', 'fc00::/7'],
          [t('Default route', 'Route par défaut'), '0.0.0.0/0', '::/0'],
        ],
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Security note', 'Note de sécurité'),
        body: t('IPv6 is often **enabled by default** on Windows and Linux even if the company "doesn’t use IPv6". If the firewall only filters IPv4, IPv6 traffic may slip through. Always include IPv6 in firewall rules.', 'IPv6 est souvent **activé par défaut** sous Windows et Linux même si l’entreprise « n’utilise pas IPv6 ». Si le pare-feu ne filtre que l’IPv4, le trafic IPv6 peut passer. Incluez toujours IPv6 dans les règles du pare-feu.'),
      },
    ],
    vocabulary: [
      { term: 'SLAAC', def: t('Stateless Address Autoconfiguration — hosts build their own IPv6 address.', 'Autoconfiguration sans état — l’hôte construit son IPv6.') },
      { term: 'RA', def: t('Router Advertisement — router announces prefix and gateway.', 'Router Advertisement — le routeur annonce préfixe et passerelle.') },
      { term: 'EUI-64', def: t('Interface ID derived from the MAC address.', 'Identifiant d’interface dérivé de l’adresse MAC.') },
      { term: t('Dual stack', 'Double pile'), def: t('Running IPv4 and IPv6 at the same time.', 'Faire tourner IPv4 et IPv6 en même temps.') },
      { term: 'AAAA', def: t('DNS record holding an IPv6 address.', 'Enregistrement DNS contenant une IPv6.') },
    ],
    practice: t('Many ISPs now give homes and offices native IPv6. Check on test-ipv6.com from your browser: if you see a 10/10 score, your connection is dual stack.', 'Beaucoup de FAI fournissent maintenant l’IPv6 natif. Testez sur test-ipv6.com : un score de 10/10 signifie que votre connexion est en double pile.'),
    quiz: [
      { kind: 'mcq', prompt: t('With SLAAC, where does a host learn its prefix?', 'Avec SLAAC, où l’hôte apprend-il son préfixe ?'), options: [t('From a DHCPv4 server', 'D’un serveur DHCPv4'), t('From a Router Advertisement', 'D’une Router Advertisement'), t('From DNS', 'Du DNS'), t('From ARP', 'D’ARP')], answer: 1, explain: 'RA.' },
      { kind: 'mcq', prompt: t('The DNS record type for IPv6 is…', 'Le type d’enregistrement DNS pour IPv6 est…'), options: ['A', 'AAAA', 'MX', 'PTR'], answer: 1, explain: 'AAAA.' },
      { kind: 'input', prompt: t('Write the IPv6 default route.', 'Écrivez la route par défaut IPv6.'), accept: ['::/0'], explain: '::/0.' },
      { kind: 'tf', prompt: t('Dual stack means a device has both IPv4 and IPv6 addresses.', 'La double pile signifie qu’un appareil a une IPv4 et une IPv6.'), answer: true, explain: t('Correct.', 'Exact.') },
      { kind: 'command', prompt: t('Ping google.com forcing IPv6 on Windows.', 'Pinguez google.com en forçant IPv6 sous Windows.'), accept: ['ping -6 google.com'], explain: 'ping -6 google.com', shell: 'C:\\>' },
    ],
  },
]
