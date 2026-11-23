import { t, type Lesson } from '../types'

export const hardwareLessons: Lesson[] = [
  {
    id: 'l1-hardware.1',
    title: t('What is a computer?', 'Qu’est-ce qu’un ordinateur ?'),
    minutes: 10,
    objectives: [
      t('Describe the input → processing → storage → output model', 'Décrire le modèle entrée → traitement → stockage → sortie'),
      t('Distinguish hardware from software', 'Distinguer le matériel du logiciel'),
      t('Recognise the main types of computers an IT technician supports', 'Reconnaître les principaux types d’ordinateurs qu’un technicien IT gère'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('A machine that processes data', 'Une machine qui traite des données'),
        body: t(
          'A computer is a machine that **receives data, processes it according to instructions, stores it and produces a result**. Everything you will touch in IT — a laptop, a switch, a server, a printer — follows this same pattern.\n\nThose instructions are **software**. The physical parts that run them are **hardware**. As a technician you will constantly ask: is this problem in the hardware, or in the software?',
          'Un ordinateur est une machine qui **reçoit des données, les traite selon des instructions, les stocke et produit un résultat**. Tout ce que vous toucherez en IT — un portable, un commutateur, un serveur, une imprimante — suit ce même schéma.\n\nCes instructions sont le **logiciel**. Les éléments physiques qui les exécutent sont le **matériel**. En tant que technicien, vous vous demanderez sans cesse : ce problème vient-il du matériel ou du logiciel ?',
        ),
      },
      { type: 'diagram', diagram: 'ipo', caption: t('The IPO model: every computer takes input, processes it, stores what it needs and produces output.', 'Le modèle IPO : tout ordinateur prend une entrée, la traite, stocke ce qu’il faut et produit une sortie.') },
      {
        type: 'text',
        title: t('The four stages', 'Les quatre étapes'),
        body: t(
          '- **Input** — data enters: a keyboard press, a mouse click, a network packet, a scanned document.\n- **Processing** — the **CPU** executes instructions on that data.\n- **Storage** — data is kept, briefly in **RAM** or permanently on a **disk**.\n- **Output** — a result leaves: pixels on a screen, a printed page, a packet sent to another computer.',
          '- **Entrée** — les données arrivent : une touche, un clic, un paquet réseau, un document scanné.\n- **Traitement** — le **processeur (CPU)** exécute des instructions sur ces données.\n- **Stockage** — les données sont conservées, brièvement en **RAM** ou durablement sur un **disque**.\n- **Sortie** — un résultat sort : des pixels à l’écran, une page imprimée, un paquet envoyé à un autre ordinateur.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A user prints a document. Which stage is the printer?', 'Un utilisateur imprime un document. À quelle étape correspond l’imprimante ?'),
          options: [t('Input', 'Entrée'), t('Processing', 'Traitement'), t('Storage', 'Stockage'), t('Output', 'Sortie')],
          answer: 3,
          explain: t('The printer turns processed data into a physical result — that is output.', 'L’imprimante transforme les données traitées en résultat physique — c’est une sortie.'),
        },
      },
      {
        type: 'table',
        head: [t('Type', 'Type'), t('Typical use', 'Usage typique'), t('What you will do with it', 'Ce que vous en ferez')],
        rows: [
          [t('Desktop / workstation', 'Poste fixe'), t('Office work, design, development', 'Bureautique, design, développement'), t('Install, repair, upgrade', 'Installer, réparer, mettre à niveau')],
          [t('Laptop', 'Portable'), t('Mobile workers', 'Employés mobiles'), t('Configure Wi-Fi, VPN, encryption', 'Configurer Wi-Fi, VPN, chiffrement')],
          [t('Server', 'Serveur'), t('Shared services: files, email, accounts', 'Services partagés : fichiers, e-mail, comptes'), t('Administer, monitor, back up', 'Administrer, superviser, sauvegarder')],
          [t('Network device', 'Équipement réseau'), t('Switches, routers, firewalls', 'Commutateurs, routeurs, pare-feu'), t('Configure and troubleshoot', 'Configurer et dépanner')],
          [t('Embedded / IoT', 'Embarqué / IoT'), t('Cameras, badge readers, sensors', 'Caméras, badgeuses, capteurs'), t('Connect and secure', 'Connecter et sécuriser')],
        ],
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('On the job', 'Sur le terrain'),
        body: t(
          'A router is a computer too: it has a CPU, RAM, storage and an operating system. That is why "turn it off and on again" works on network devices for the same reasons it works on PCs.',
          'Un routeur est aussi un ordinateur : il a un processeur, de la RAM, du stockage et un système d’exploitation. C’est pourquoi « éteindre et rallumer » fonctionne sur les équipements réseau pour les mêmes raisons que sur les PC.',
        ),
      },
    ],
    vocabulary: [
      { term: t('Hardware', 'Matériel'), def: t('The physical components of a computer.', 'Les composants physiques d’un ordinateur.') },
      { term: t('Software', 'Logiciel'), def: t('Instructions (programs) that tell the hardware what to do.', 'Instructions (programmes) qui disent au matériel quoi faire.') },
      { term: t('CPU', 'Processeur (CPU)'), def: t('Central Processing Unit — executes instructions.', 'Unité centrale de traitement — exécute les instructions.') },
      { term: t('Peripheral', 'Périphérique'), def: t('A device connected to a computer for input or output.', 'Appareil connecté à un ordinateur pour l’entrée ou la sortie.') },
      { term: t('Server', 'Serveur'), def: t('A computer that provides services to other computers.', 'Ordinateur qui fournit des services à d’autres ordinateurs.') },
    ],
    practice: t(
      'When a ticket says "my computer is broken", start by locating the stage that fails: no picture (output)? keyboard ignored (input)? very slow (processing/RAM)? files missing (storage)? This single question halves your troubleshooting time.',
      'Quand un ticket dit « mon ordinateur est cassé », commencez par identifier l’étape qui échoue : pas d’image (sortie) ? clavier ignoré (entrée) ? très lent (traitement/RAM) ? fichiers manquants (stockage) ? Cette seule question divise par deux votre temps de dépannage.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Which component executes program instructions?', 'Quel composant exécute les instructions des programmes ?'), options: [t('RAM', 'RAM'), t('CPU', 'CPU'), t('Hard drive', 'Disque dur'), t('Monitor', 'Écran')], answer: 1, explain: t('The CPU (processor) executes instructions.', 'Le CPU (processeur) exécute les instructions.') },
      { kind: 'tf', prompt: t('An operating system is hardware.', 'Un système d’exploitation est du matériel.'), answer: false, explain: t('An OS is software — a set of programs.', 'Un OS est un logiciel — un ensemble de programmes.') },
      { kind: 'mcq', prompt: t('A barcode scanner at a checkout is mainly…', 'Un lecteur de code-barres en caisse est surtout…'), options: [t('An input device', 'Un périphérique d’entrée'), t('An output device', 'Un périphérique de sortie'), t('Storage', 'Du stockage'), t('A CPU', 'Un CPU')], answer: 0, explain: t('It sends data into the computer.', 'Il envoie des données dans l’ordinateur.') },
      { kind: 'tf', prompt: t('A network switch contains a CPU and memory.', 'Un commutateur réseau contient un processeur et de la mémoire.'), answer: true, explain: t('Network devices are specialised computers.', 'Les équipements réseau sont des ordinateurs spécialisés.') },
    ],
  },
  {
    id: 'l1-hardware.2',
    title: t('Inside the case', 'À l’intérieur du boîtier'),
    minutes: 14,
    objectives: [
      t('Identify the motherboard, CPU, RAM, storage, PSU, GPU and cooling', 'Identifier carte mère, CPU, RAM, stockage, alimentation, GPU et refroidissement'),
      t('Explain how components communicate through the motherboard', 'Expliquer comment les composants communiquent via la carte mère'),
      t('Apply basic safety rules before opening a computer', 'Appliquer les règles de sécurité avant d’ouvrir un ordinateur'),
    ],
    blocks: [
      { type: 'diagram', diagram: 'motherboard', caption: t('A modern ATX motherboard. Click any numbered part to see what it does and how it fails.', 'Une carte mère ATX moderne. Cliquez sur un élément numéroté pour voir son rôle et ses pannes.') },
      { type: 'diagram', diagram: 'cpu-3d', caption: t('The processor up close: drag it, flip it to see the pads that touch the socket pins, or explode it into its layers.', 'Le processeur de près : faites-le tourner, retournez-le pour voir les pastilles qui touchent les broches du socket, ou éclatez-le en couches.') },
      {
        type: 'text',
        title: t('The motherboard is the backbone', 'La carte mère est la colonne vertébrale'),
        body: t(
          'The **motherboard** is the main circuit board. It holds the **CPU socket**, **RAM slots**, **expansion slots** (PCIe) and connectors for storage and power. Copper tracks called **buses** carry data between parts.\n\nThe **chipset** on the motherboard decides which CPUs, how much RAM and which features (USB, SATA, M.2) are supported. That is why you always check compatibility before buying an upgrade.',
          'La **carte mère** est le circuit principal. Elle accueille le **socket du processeur**, les **emplacements RAM**, les **slots d’extension** (PCIe) et les connecteurs de stockage et d’alimentation. Des pistes de cuivre appelées **bus** transportent les données entre les éléments.\n\nLe **chipset** de la carte mère détermine quels processeurs, quelle quantité de RAM et quelles fonctions (USB, SATA, M.2) sont pris en charge. C’est pourquoi on vérifie toujours la compatibilité avant d’acheter une mise à niveau.',
        ),
      },
      {
        type: 'table',
        head: [t('Component', 'Composant'), t('Role', 'Rôle'), t('Symptom when it fails', 'Symptôme en cas de panne')],
        rows: [
          [t('CPU', 'CPU'), t('Executes instructions', 'Exécute les instructions'), t('No boot, freezes, overheating shutdowns', 'Pas de démarrage, gels, arrêts par surchauffe')],
          [t('RAM', 'RAM'), t('Short-term working memory', 'Mémoire de travail à court terme'), t('Beeps at boot, blue screens, random crashes', 'Bips au démarrage, écrans bleus, plantages aléatoires')],
          [t('Storage (SSD/HDD)', 'Stockage (SSD/HDD)'), t('Keeps OS and files permanently', 'Conserve OS et fichiers durablement'), t('"No boot device", clicking noises, slowness', '« No boot device », cliquetis, lenteur')],
          [t('PSU', 'Alimentation (PSU)'), t('Converts mains AC to DC for components', 'Convertit le courant secteur en continu'), t('Nothing powers on, random restarts', 'Rien ne s’allume, redémarrages aléatoires')],
          [t('GPU', 'Carte graphique (GPU)'), t('Produces the image', 'Produit l’image'), t('No display, artefacts on screen', 'Pas d’affichage, artefacts à l’écran')],
          [t('Cooling', 'Refroidissement'), t('Removes heat (fans, heatsinks)', 'Évacue la chaleur (ventilateurs, dissipateurs)'), t('Loud fans, throttling, shutdowns', 'Ventilateurs bruyants, ralentissements, arrêts')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A PC shows no lights and no fans when you press power. First suspect?', 'Un PC n’affiche aucun voyant ni ventilateur à l’allumage. Premier suspect ?'),
          options: [t('RAM', 'RAM'), t('Power supply / power cable', 'Alimentation / câble secteur'), t('Graphics card', 'Carte graphique'), t('Operating system', 'Système d’exploitation')],
          answer: 1,
          explain: t('Total silence means no power reaches the components: check the cable, outlet and PSU first.', 'Le silence total signifie qu’aucun courant n’arrive : vérifiez câble, prise et alimentation d’abord.'),
        },
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Safety first', 'Sécurité d’abord'),
        body: t(
          '- Shut down and **unplug** the power cable before opening a case.\n- Wear an **anti-static (ESD) wrist strap** or touch bare metal of the case to discharge static.\n- Never open a **power supply** — its capacitors can hold a dangerous charge even when unplugged.',
          '- Éteignez et **débranchez** le câble secteur avant d’ouvrir un boîtier.\n- Portez un **bracelet antistatique (ESD)** ou touchez le métal nu du boîtier pour vous décharger.\n- N’ouvrez jamais une **alimentation** — ses condensateurs peuvent garder une charge dangereuse même débranchée.',
        ),
      },
      {
        type: 'example',
        title: t('Upgrade scenario', 'Scénario de mise à niveau'),
        body: t(
          'An accountant’s PC is slow with many spreadsheets open. Task Manager shows memory at 95%. You check the motherboard manual: 2 RAM slots, max 32 GB, DDR4. It has 1 × 8 GB. Adding a matching 8 GB DDR4 module doubles RAM and enables **dual-channel** — a cheap, effective fix.',
          'Le PC d’un comptable est lent avec beaucoup de tableurs ouverts. Le Gestionnaire des tâches indique 95 % de mémoire utilisée. Vous consultez le manuel : 2 slots RAM, 32 Go max, DDR4. Il a 1 × 8 Go. Ajouter une barrette DDR4 de 8 Go identique double la RAM et active le **dual-channel** — une solution peu coûteuse et efficace.',
        ),
      },
    ],
    vocabulary: [
      { term: t('Motherboard', 'Carte mère'), def: t('Main circuit board connecting all components.', 'Circuit principal reliant tous les composants.') },
      { term: t('PSU', 'Bloc d’alimentation'), def: t('Power Supply Unit — converts AC mains to DC voltages.', 'Convertit le courant alternatif en tensions continues.') },
      { term: t('PCIe', 'PCIe'), def: t('High-speed expansion slot for GPUs, NICs, NVMe.', 'Slot d’extension rapide pour GPU, cartes réseau, NVMe.') },
      { term: t('ESD', 'ESD'), def: t('Electrostatic discharge — can silently damage components.', 'Décharge électrostatique — peut endommager les composants sans bruit.') },
      { term: t('Chipset', 'Chipset'), def: t('Motherboard controller defining supported features.', 'Contrôleur de la carte mère définissant les fonctions prises en charge.') },
    ],
    practice: t(
      'Before any hardware intervention: note the model and serial number, check the warranty, photograph cable positions, then unplug and use ESD protection. These habits prevent most avoidable damage and disputes.',
      'Avant toute intervention matérielle : notez le modèle et le numéro de série, vérifiez la garantie, photographiez la position des câbles, puis débranchez et protégez-vous de l’ESD. Ces habitudes évitent la plupart des dégâts et litiges.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Which part converts mains electricity for the components?', 'Quel élément convertit le courant secteur pour les composants ?'), options: [t('Chipset', 'Chipset'), t('PSU', 'Alimentation'), t('GPU', 'GPU'), t('CMOS battery', 'Pile CMOS')], answer: 1, explain: t('The power supply unit converts AC to DC.', 'Le bloc d’alimentation convertit le courant alternatif en continu.') },
      { kind: 'tf', prompt: t('It is safe to open a power supply once it is unplugged.', 'On peut ouvrir une alimentation sans danger une fois débranchée.'), answer: false, explain: t('Capacitors can stay charged. Replace PSUs, never open them.', 'Les condensateurs restent chargés. On remplace une alimentation, on ne l’ouvre pas.') },
      { kind: 'mcq', prompt: t('Random blue screens and boot beeps most often point to…', 'Écrans bleus aléatoires et bips au démarrage indiquent souvent…'), options: [t('Faulty RAM', 'Une RAM défectueuse'), t('A bad monitor', 'Un écran défectueux'), t('A dirty keyboard', 'Un clavier sale'), t('Low disk space', 'Un disque plein')], answer: 0, explain: t('Memory faults are classic causes of beeps and crashes.', 'Les défauts mémoire sont des causes classiques de bips et plantages.') },
      { kind: 'mcq', prompt: t('What determines which CPUs a motherboard supports?', 'Qu’est-ce qui détermine les CPU pris en charge par une carte mère ?'), options: [t('The monitor', 'L’écran'), t('The socket and chipset', 'Le socket et le chipset'), t('The keyboard', 'Le clavier'), t('The OS', 'L’OS')], answer: 1, explain: t('Socket type and chipset define CPU compatibility.', 'Le type de socket et le chipset définissent la compatibilité CPU.') },
    ],
  },
]

export const componentLessons: Lesson[] = [
  {
    id: 'l1-components.1',
    title: t('CPU, memory and units', 'Processeur, mémoire et unités'),
    minutes: 14,
    objectives: [
      t('Explain cores, threads, clock speed and cache', 'Expliquer cœurs, threads, fréquence et cache'),
      t('Compare RAM and storage (volatile vs non-volatile)', 'Comparer RAM et stockage (volatile vs non volatile)'),
      t('Convert between bits, bytes, KB, MB, GB and TB', 'Convertir entre bits, octets, Ko, Mo, Go et To'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('How a CPU is described', 'Comment on décrit un processeur'),
        body: t(
          '- **Cores** — independent processing units. 8 cores can work on 8 tasks at once.\n- **Threads** — with Hyper-Threading/SMT, each core can juggle 2 instruction streams.\n- **Clock speed** — cycles per second, in **GHz** (3.5 GHz = 3.5 billion cycles/s).\n- **Cache** — tiny, ultra-fast memory inside the CPU (L1, L2, L3) that keeps data close.',
          '- **Cœurs** — unités de traitement indépendantes. 8 cœurs traitent 8 tâches à la fois.\n- **Threads** — avec l’Hyper-Threading/SMT, chaque cœur gère 2 flux d’instructions.\n- **Fréquence** — cycles par seconde, en **GHz** (3,5 GHz = 3,5 milliards de cycles/s).\n- **Cache** — mémoire minuscule et ultra-rapide dans le CPU (L1, L2, L3) qui garde les données à portée.',
        ),
      },
      { type: 'diagram', diagram: 'memory-hierarchy', caption: t('The memory hierarchy: the closer to the CPU, the faster — and the smaller and more expensive.', 'La hiérarchie mémoire : plus c’est proche du CPU, plus c’est rapide — et petit et cher.') },
      {
        type: 'text',
        title: t('RAM vs storage', 'RAM vs stockage'),
        body: t(
          '**RAM** is the workbench: fast, but **volatile** — it empties when power is cut. **Storage** (SSD, HDD) is the filing cabinet: slower, but **non-volatile** — it keeps data without power.\n\nWhen you open a program, it is copied from storage into RAM so the CPU can work on it quickly. Not enough RAM? The OS starts using the disk as overflow (**paging**), and everything slows down.',
          'La **RAM** est l’établi : rapide, mais **volatile** — elle se vide à la coupure. Le **stockage** (SSD, HDD) est l’armoire : plus lent, mais **non volatile** — il garde les données sans courant.\n\nQuand vous ouvrez un programme, il est copié du stockage vers la RAM pour que le CPU travaille vite. Pas assez de RAM ? L’OS utilise le disque en débordement (**pagination**), et tout ralentit.',
        ),
      },
      {
        type: 'table',
        head: [t('Unit', 'Unité'), t('Equals', 'Vaut'), t('Real-world example', 'Exemple concret')],
        rows: [
          ['1 bit', t('0 or 1', '0 ou 1'), t('A single on/off signal', 'Un signal allumé/éteint')],
          [t('1 byte (B)', '1 octet (o)'), '8 bits', t('One character, e.g. "A"', 'Un caractère, ex. « A »')],
          [t('1 KB', '1 Ko'), t('1,000 bytes', '1 000 octets'), t('A short text file', 'Un petit fichier texte')],
          [t('1 MB', '1 Mo'), t('1,000 KB', '1 000 Ko'), t('A photo', 'Une photo')],
          [t('1 GB', '1 Go'), t('1,000 MB', '1 000 Mo'), t('A film; RAM is sized in GB', 'Un film ; la RAM se mesure en Go')],
          [t('1 TB', '1 To'), t('1,000 GB', '1 000 Go'), t('A typical hard drive', 'Un disque dur typique')],
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: t('Bits vs bytes — the network trap', 'Bits vs octets — le piège réseau'),
        body: t(
          'Network speeds use **bits per second** (Mb/s, lowercase b). File sizes use **bytes** (MB, uppercase B). A 100 Mb/s connection downloads at most about **12.5 MB/s** (100 ÷ 8). Users who confuse the two will report "slow internet" that is actually normal.\n\nNote: Windows shows sizes in powers of 1024 (1 KiB = 1024 bytes) while drive makers use 1000. That is why a "1 TB" disk shows about 931 GB.',
          'Les débits réseau utilisent les **bits par seconde** (Mb/s, b minuscule). Les tailles de fichiers utilisent les **octets** (Mo). Une connexion à 100 Mb/s télécharge au mieux environ **12,5 Mo/s** (100 ÷ 8). Les utilisateurs qui confondent signaleront un « internet lent » en réalité normal.\n\nÀ noter : Windows affiche les tailles en puissances de 1024 (1 Kio = 1024 octets), alors que les fabricants de disques utilisent 1000. C’est pourquoi un disque « 1 To » affiche environ 931 Go.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A 200 Mb/s link: maximum download speed in MB/s?', 'Lien à 200 Mb/s : débit de téléchargement max en Mo/s ?'),
          options: [t('200 MB/s', '200 Mo/s'), t('25 MB/s', '25 Mo/s'), t('1,600 MB/s', '1 600 Mo/s'), t('2 MB/s', '2 Mo/s')],
          answer: 1,
          explain: t('200 ÷ 8 = 25 MB/s (before protocol overhead).', '200 ÷ 8 = 25 Mo/s (avant surcoût des protocoles).'),
        },
      },
    ],
    vocabulary: [
      { term: t('Core', 'Cœur'), def: t('An independent processing unit inside a CPU.', 'Unité de traitement indépendante dans un CPU.') },
      { term: t('Volatile memory', 'Mémoire volatile'), def: t('Loses its content when power is removed (RAM).', 'Perd son contenu sans alimentation (RAM).') },
      { term: t('Cache', 'Cache'), def: t('Very fast memory close to the CPU.', 'Mémoire très rapide proche du CPU.') },
      { term: t('Byte', 'Octet'), def: t('8 bits — the basic unit of file size.', '8 bits — unité de base de la taille des fichiers.') },
      { term: t('Paging', 'Pagination'), def: t('Using disk space as overflow when RAM is full.', 'Utiliser le disque en débordement quand la RAM est pleine.') },
    ],
    practice: t(
      'In Task Manager (Ctrl+Shift+Esc → Performance) check CPU, Memory and Disk graphs. Constant 100% memory with heavy disk activity = RAM shortage. High CPU from a single process = a runaway program to investigate.',
      'Dans le Gestionnaire des tâches (Ctrl+Maj+Échap → Performances), observez CPU, Mémoire et Disque. Mémoire à 100 % avec forte activité disque = manque de RAM. CPU élevé par un seul processus = programme emballé à examiner.',
    ),
    quiz: [
      { kind: 'tf', prompt: t('RAM keeps its data when the computer is switched off.', 'La RAM conserve ses données quand l’ordinateur est éteint.'), answer: false, explain: t('RAM is volatile.', 'La RAM est volatile.') },
      { kind: 'mcq', prompt: t('How many bits in a byte?', 'Combien de bits dans un octet ?'), options: [t('4', '4'), t('8', '8'), t('10', '10'), t('16', '16')], answer: 1, explain: t('1 byte = 8 bits.', '1 octet = 8 bits.') },
      { kind: 'mcq', prompt: t('Which memory is fastest?', 'Quelle mémoire est la plus rapide ?'), options: [t('SSD', 'SSD'), t('RAM', 'RAM'), t('CPU cache', 'Cache CPU'), t('HDD', 'HDD')], answer: 2, explain: t('Cache sits inside the CPU.', 'Le cache est dans le CPU.') },
      { kind: 'mcq', prompt: t('A user’s 1 Gb/s fibre downloads at ~110 MB/s. This is…', 'La fibre 1 Gb/s d’un utilisateur télécharge à ~110 Mo/s. C’est…'), options: [t('A fault — should be 1,000 MB/s', 'Une panne — devrait être 1 000 Mo/s'), t('Normal — 1,000 ÷ 8 ≈ 125 MB/s max', 'Normal — 1 000 ÷ 8 ≈ 125 Mo/s max'), t('Impossible', 'Impossible'), t('A RAM problem', 'Un problème de RAM')], answer: 1, explain: t('Divide bits by 8; overhead explains the rest.', 'Divisez par 8 ; le surcoût explique le reste.') },
    ],
  },
  {
    id: 'l1-components.2',
    title: t('Storage, ports and peripherals', 'Stockage, ports et périphériques'),
    minutes: 12,
    objectives: [
      t('Compare HDD, SATA SSD and NVMe SSD', 'Comparer HDD, SSD SATA et SSD NVMe'),
      t('Identify common ports: USB-A/C, HDMI, DisplayPort, RJ45, audio', 'Identifier les ports courants : USB-A/C, HDMI, DisplayPort, RJ45, audio'),
      t('Choose the right connection for a peripheral', 'Choisir la bonne connexion pour un périphérique'),
    ],
    blocks: [
      {
        type: 'table',
        head: [t('Drive', 'Disque'), t('How it works', 'Fonctionnement'), t('Typical speed', 'Vitesse typique'), t('Use', 'Usage')],
        rows: [
          ['HDD', t('Spinning magnetic platters + moving head', 'Plateaux magnétiques + tête mobile'), '~150 MB/s', t('Cheap bulk storage, backups', 'Stockage de masse, sauvegardes')],
          ['SATA SSD', t('Flash memory, no moving parts', 'Mémoire flash, sans pièces mobiles'), '~550 MB/s', t('Upgrading older PCs', 'Mettre à niveau d’anciens PC')],
          ['NVMe SSD', t('Flash on the PCIe bus (M.2 slot)', 'Flash sur bus PCIe (slot M.2)'), '3,000–7,000 MB/s', t('OS drive, servers', 'Disque système, serveurs')],
        ],
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('The best upgrade for an old PC', 'La meilleure mise à niveau d’un vieux PC'),
        body: t('Replacing an HDD with an SSD often makes an old computer feel new: boot times drop from minutes to seconds.', 'Remplacer un HDD par un SSD rend souvent un vieil ordinateur comme neuf : le démarrage passe de minutes à secondes.'),
      },
      {
        type: 'table',
        head: [t('Port', 'Port'), t('Carries', 'Transporte'), t('Notes', 'Remarques')],
        rows: [
          ['USB-A', t('Data + power', 'Données + alimentation'), t('Rectangular; keyboards, mice, keys', 'Rectangulaire ; claviers, souris, clés')],
          ['USB-C', t('Data, power, video', 'Données, alimentation, vidéo'), t('Reversible; can charge laptops and drive monitors', 'Réversible ; peut charger un portable et piloter un écran')],
          ['HDMI', t('Video + audio', 'Vidéo + audio'), t('TVs, projectors, monitors', 'TV, projecteurs, écrans')],
          ['DisplayPort', t('Video + audio', 'Vidéo + audio'), t('Professional monitors, daisy-chaining', 'Écrans pro, chaînage')],
          ['RJ45', t('Ethernet network', 'Réseau Ethernet'), t('8-pin network jack — you will meet it daily', 'Prise réseau 8 broches — vous la verrez tous les jours')],
          [t('3.5 mm jack', 'Jack 3,5 mm'), t('Analogue audio', 'Audio analogique'), t('Headsets, speakers', 'Casques, enceintes')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'tf',
          prompt: t('An RJ45 port is used to connect a computer to a wired network.', 'Un port RJ45 sert à connecter un ordinateur à un réseau filaire.'),
          answer: true,
          explain: t('RJ45 is the Ethernet connector.', 'Le RJ45 est le connecteur Ethernet.'),
        },
      },
      {
        type: 'text',
        title: t('Peripherals and drivers', 'Périphériques et pilotes'),
        body: t(
          'A peripheral needs a **driver** — software that teaches the OS how to talk to that device. Most are installed automatically (**plug and play**), but printers, scanners and specialised hardware often need the vendor’s driver.\n\nWhen a device "isn’t recognised", check in this order: cable/port → device powered on → appears in Device Manager → driver status.',
          'Un périphérique a besoin d’un **pilote** — un logiciel qui apprend à l’OS à dialoguer avec lui. La plupart s’installent automatiquement (**plug and play**), mais imprimantes, scanners et matériel spécialisé demandent souvent le pilote du fabricant.\n\nQuand un appareil « n’est pas reconnu », vérifiez dans l’ordre : câble/port → appareil allumé → présent dans le Gestionnaire de périphériques → état du pilote.',
        ),
      },
    ],
    vocabulary: [
      { term: t('SSD', 'SSD'), def: t('Solid State Drive — flash storage with no moving parts.', 'Disque à mémoire flash sans pièces mobiles.') },
      { term: t('NVMe', 'NVMe'), def: t('Protocol for very fast SSDs over PCIe.', 'Protocole pour SSD très rapides via PCIe.') },
      { term: t('Driver', 'Pilote'), def: t('Software that lets the OS control a device.', 'Logiciel qui permet à l’OS de piloter un appareil.') },
      { term: t('Plug and play', 'Plug and play'), def: t('Automatic detection and setup of devices.', 'Détection et configuration automatiques des appareils.') },
    ],
    practice: t(
      'New hire setup: a laptop with only USB-C must connect to a monitor, keyboard and wired network. The answer is a USB-C dock (video + USB + RJ45 + charging) — one cable, everything works.',
      'Installation d’un nouvel employé : un portable avec uniquement de l’USB-C doit se connecter à un écran, un clavier et le réseau filaire. La réponse : une station d’accueil USB-C (vidéo + USB + RJ45 + charge) — un câble, tout fonctionne.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Which drive is the fastest?', 'Quel disque est le plus rapide ?'), options: [t('HDD', 'HDD'), t('SATA SSD', 'SSD SATA'), t('NVMe SSD', 'SSD NVMe'), t('USB key', 'Clé USB')], answer: 2, explain: t('NVMe uses the PCIe bus.', 'NVMe utilise le bus PCIe.') },
      { kind: 'mcq', prompt: t('Which port can charge a laptop and carry video?', 'Quel port peut charger un portable et transporter la vidéo ?'), options: [t('RJ45', 'RJ45'), t('USB-C', 'USB-C'), t('3.5 mm jack', 'Jack 3,5 mm'), t('USB-A', 'USB-A')], answer: 1, explain: t('USB-C supports power delivery and video modes.', 'L’USB-C gère la charge et les modes vidéo.') },
      { kind: 'tf', prompt: t('A driver is a hardware component.', 'Un pilote est un composant matériel.'), answer: false, explain: t('It is software.', 'C’est un logiciel.') },
      { kind: 'mcq', prompt: t('A new printer is not detected. First check?', 'Une nouvelle imprimante n’est pas détectée. Première vérification ?'), options: [t('Reinstall Windows', 'Réinstaller Windows'), t('Cable, port and power', 'Câble, port et alimentation'), t('Replace the motherboard', 'Changer la carte mère'), t('Buy a new printer', 'Acheter une nouvelle imprimante')], answer: 1, explain: t('Always start with the physical layer.', 'Commencez toujours par la couche physique.') },
    ],
  },
]
