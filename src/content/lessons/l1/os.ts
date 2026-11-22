import { t, type Lesson } from '../types'

export const osLessons: Lesson[] = [
  {
    id: 'l1-os.1',
    title: t('What an operating system does', 'Le rôle d’un système d’exploitation'),
    minutes: 12,
    objectives: [
      t('Explain the role of the kernel, drivers and user interface', 'Expliquer le rôle du noyau, des pilotes et de l’interface'),
      t('Compare Windows, Linux and macOS', 'Comparer Windows, Linux et macOS'),
      t('Distinguish desktop and server operating systems', 'Distinguer OS de bureau et OS serveur'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('The manager between hardware and you', 'Le gestionnaire entre le matériel et vous'),
        body: t(
          'The **operating system (OS)** manages the hardware and gives programs a stable way to use it. Without it, every application would need to know how to drive every disk, screen and network card.\n\nIts core jobs:\n- **Process management** — sharing CPU time between running programs.\n- **Memory management** — giving each program its own RAM and protecting it from others.\n- **Storage** — organising files through a filesystem.\n- **Devices** — controlling hardware through **drivers**.\n- **Security** — users, passwords and permissions.\n- **Networking** — the TCP/IP stack that lets the machine communicate.',
          'Le **système d’exploitation (OS)** gère le matériel et offre aux programmes un moyen stable de l’utiliser. Sans lui, chaque application devrait savoir piloter chaque disque, écran et carte réseau.\n\nSes missions principales :\n- **Gestion des processus** — partager le temps CPU entre les programmes.\n- **Gestion de la mémoire** — donner à chaque programme sa RAM et la protéger des autres.\n- **Stockage** — organiser les fichiers via un système de fichiers.\n- **Périphériques** — piloter le matériel via des **pilotes**.\n- **Sécurité** — utilisateurs, mots de passe et permissions.\n- **Réseau** — la pile TCP/IP qui permet de communiquer.',
        ),
      },
      { type: 'diagram', diagram: 'os-layers', caption: t('Applications talk to the OS; the kernel and drivers talk to the hardware.', 'Les applications parlent à l’OS ; le noyau et les pilotes parlent au matériel.') },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which part of the OS talks directly to the hardware?', 'Quelle partie de l’OS parle directement au matériel ?'),
          options: [t('The desktop wallpaper', 'Le fond d’écran'), t('The kernel and drivers', 'Le noyau et les pilotes'), t('The web browser', 'Le navigateur'), t('The user', 'L’utilisateur')],
          answer: 1,
          explain: t('The kernel, helped by drivers, controls the hardware.', 'Le noyau, aidé des pilotes, contrôle le matériel.'),
        },
      },
      {
        type: 'table',
        head: [t('OS', 'OS'), t('Where you meet it', 'Où on le rencontre'), t('Admin tools', 'Outils d’admin')],
        rows: [
          ['Windows / Windows Server', t('Most office PCs; Active Directory domains', 'La plupart des PC de bureau ; domaines Active Directory'), t('Settings, MMC consoles, PowerShell', 'Paramètres, consoles MMC, PowerShell')],
          ['Linux (Ubuntu, Debian, RHEL)', t('Servers, cloud, network appliances', 'Serveurs, cloud, appliances réseau'), t('Terminal, bash, SSH', 'Terminal, bash, SSH')],
          ['macOS', t('Design and development teams', 'Équipes design et développement'), t('System Settings, Terminal', 'Réglages Système, Terminal')],
          [t('Network OS (Cisco IOS…)', 'OS réseau (Cisco IOS…)'), t('Switches and routers', 'Commutateurs et routeurs'), t('CLI over console or SSH', 'CLI via console ou SSH')],
        ],
      },
      {
        type: 'callout',
        tone: 'info',
        title: t('Server editions', 'Éditions serveur'),
        body: t(
          'A **server OS** is optimised to run services 24/7 for many users: it often has no graphical interface (Linux) or a minimal one (Windows Server Core), supports more RAM and CPUs, and includes roles like file sharing, DNS, DHCP and directory services. You will install both in Level 3.',
          'Un **OS serveur** est optimisé pour faire tourner des services 24 h/24 pour de nombreux utilisateurs : souvent sans interface graphique (Linux) ou minimale (Windows Server Core), il gère plus de RAM et de CPU, et inclut des rôles comme le partage de fichiers, DNS, DHCP et l’annuaire. Vous installerez les deux au niveau 3.',
        ),
      },
    ],
    vocabulary: [
      { term: t('Kernel', 'Noyau'), def: t('The core of the OS that manages CPU, memory and devices.', 'Cœur de l’OS qui gère CPU, mémoire et périphériques.') },
      { term: t('Process', 'Processus'), def: t('A running instance of a program.', 'Instance d’un programme en cours d’exécution.') },
      { term: t('GUI', 'Interface graphique (GUI)'), def: t('Graphical User Interface: windows, icons, mouse.', 'Fenêtres, icônes, souris.') },
      { term: t('CLI', 'CLI'), def: t('Command-Line Interface: text commands.', 'Interface en ligne de commande : commandes texte.') },
    ],
    practice: t(
      'Ticket triage: "Excel freezes" is an application problem; "every program is slow" points to the OS or hardware (RAM, disk); "can’t log in" is a security/account issue. Classifying the layer first tells you which tool to open.',
      'Tri des tickets : « Excel se fige » est un problème d’application ; « tous les programmes sont lents » pointe vers l’OS ou le matériel (RAM, disque) ; « impossible de se connecter » est un problème de compte/sécurité. Classer la couche d’abord indique quel outil ouvrir.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Which is NOT a job of the OS?', 'Lequel n’est PAS un rôle de l’OS ?'), options: [t('Managing memory', 'Gérer la mémoire'), t('Scheduling processes', 'Ordonnancer les processus'), t('Writing your emails', 'Rédiger vos e-mails'), t('Controlling devices', 'Piloter les périphériques')], answer: 2, explain: t('That is an application’s job (and yours).', 'C’est le rôle d’une application (et le vôtre).') },
      { kind: 'tf', prompt: t('Most network switches run an operating system.', 'La plupart des commutateurs réseau exécutent un système d’exploitation.'), answer: true, explain: t('E.g. Cisco IOS.', 'Ex. Cisco IOS.') },
      { kind: 'mcq', prompt: t('Where is Linux most common in companies?', 'Où Linux est-il le plus courant en entreprise ?'), options: [t('Reception desk PCs', 'PC de l’accueil'), t('Servers and cloud', 'Serveurs et cloud'), t('Printers only', 'Imprimantes uniquement'), t('Nowhere', 'Nulle part')], answer: 1, explain: t('Linux dominates servers and cloud.', 'Linux domine serveurs et cloud.') },
      { kind: 'mcq', prompt: t('A running copy of a program is called a…', 'Une copie en cours d’exécution d’un programme s’appelle…'), options: [t('Driver', 'Pilote'), t('Process', 'Processus'), t('Kernel', 'Noyau'), t('Partition', 'Partition')], answer: 1, explain: t('That is a process.', 'C’est un processus.') },
    ],
  },
  {
    id: 'l1-os.2',
    title: t('Boot process and user accounts', 'Démarrage et comptes utilisateurs'),
    minutes: 13,
    objectives: [
      t('Describe the boot sequence from power-on to login', 'Décrire la séquence de démarrage jusqu’à la connexion'),
      t('Explain BIOS/UEFI and POST', 'Expliquer BIOS/UEFI et le POST'),
      t('Differentiate standard users and administrators', 'Différencier utilisateurs standard et administrateurs'),
    ],
    blocks: [
      { type: 'diagram', diagram: 'boot-sequence', caption: t('Each stage hands over to the next. Knowing where it stops tells you what is broken.', 'Chaque étape passe la main à la suivante. Savoir où ça bloque indique ce qui est cassé.') },
      {
        type: 'text',
        title: t('From power button to desktop', 'Du bouton d’allumage au bureau'),
        body: t(
          '1. **Power on** — the PSU stabilises voltages.\n2. **Firmware (UEFI/BIOS)** starts from a chip on the motherboard.\n3. **POST** (Power-On Self-Test) checks CPU, RAM and essential hardware. Failures produce **beep codes** or LED codes.\n4. The firmware finds a **boot device** (SSD, USB, network) following the boot order.\n5. The **bootloader** (Windows Boot Manager, GRUB) loads the **kernel**.\n6. The kernel starts drivers and services, then shows the **login screen**.',
          '1. **Mise sous tension** — l’alimentation stabilise les tensions.\n2. Le **firmware (UEFI/BIOS)** démarre depuis une puce de la carte mère.\n3. Le **POST** (auto-test au démarrage) vérifie CPU, RAM et matériel essentiel. Les échecs produisent des **bips** ou codes LED.\n4. Le firmware cherche un **périphérique de démarrage** (SSD, USB, réseau) selon l’ordre de boot.\n5. Le **chargeur d’amorçage** (Windows Boot Manager, GRUB) charge le **noyau**.\n6. Le noyau lance pilotes et services, puis affiche l’**écran de connexion**.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('The PC beeps and shows nothing. Which stage failed?', 'Le PC bipe et n’affiche rien. Quelle étape a échoué ?'),
          options: [t('Login', 'Connexion'), t('POST', 'POST'), t('Bootloader', 'Chargeur d’amorçage'), t('Desktop', 'Bureau')],
          answer: 1,
          explain: t('Beep codes come from POST — usually RAM or GPU.', 'Les bips viennent du POST — souvent RAM ou carte graphique.'),
        },
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('"No bootable device"', '« No bootable device »'),
        body: t(
          'POST passed, but the firmware found nothing to boot. Check: is a USB key plugged in first in the boot order? Is the disk detected in UEFI? Has the disk failed?',
          'Le POST est passé, mais le firmware n’a rien trouvé à démarrer. Vérifiez : une clé USB est-elle prioritaire dans l’ordre de boot ? Le disque est-il détecté dans l’UEFI ? Le disque est-il en panne ?',
        ),
      },
      {
        type: 'text',
        title: t('Users and privileges', 'Utilisateurs et privilèges'),
        body: t(
          'Every person logs in with their **own account**. A **standard user** can work but not change the system. An **administrator** (Windows) or **root** (Linux) can install software, change settings and access every file.\n\nThe **principle of least privilege**: give people only the rights they need. Daily work with an admin account means a single malicious attachment can take over the whole machine.',
          'Chaque personne se connecte avec **son propre compte**. Un **utilisateur standard** peut travailler mais pas modifier le système. Un **administrateur** (Windows) ou **root** (Linux) peut installer des logiciels, changer les réglages et accéder à tous les fichiers.\n\nLe **principe du moindre privilège** : n’accorder que les droits nécessaires. Travailler au quotidien en administrateur signifie qu’une seule pièce jointe malveillante peut prendre le contrôle de toute la machine.',
        ),
      },
      {
        type: 'code',
        code: '# Windows (PowerShell)\nwhoami\nnet localgroup administrators\n\n# Linux\nwhoami\nid\nsudo apt update   # run ONE command as root',
        caption: t('Check who you are and whether you have admin rights.', 'Vérifier qui vous êtes et si vous avez les droits admin.'),
      },
    ],
    vocabulary: [
      { term: t('UEFI / BIOS', 'UEFI / BIOS'), def: t('Firmware that starts the computer before the OS.', 'Firmware qui démarre l’ordinateur avant l’OS.') },
      { term: t('POST', 'POST'), def: t('Power-On Self-Test of essential hardware.', 'Auto-test du matériel essentiel au démarrage.') },
      { term: t('Bootloader', 'Chargeur d’amorçage'), def: t('Small program that loads the OS kernel.', 'Petit programme qui charge le noyau de l’OS.') },
      { term: t('Least privilege', 'Moindre privilège'), def: t('Grant only the permissions required for the task.', 'N’accorder que les permissions nécessaires.') },
      { term: t('root', 'root'), def: t('The all-powerful administrator account on Linux.', 'Le compte administrateur tout-puissant sous Linux.') },
    ],
    practice: t(
      'When a user calls with "my PC won’t start", ask what they see: nothing at all (power), beeps/logo only (POST/hardware), an error about boot device (storage/boot order), Windows logo then crash (OS/driver). Each answer sends you to a different fix.',
      'Quand un utilisateur appelle pour « mon PC ne démarre pas », demandez ce qu’il voit : rien du tout (alimentation), bips/logo seulement (POST/matériel), erreur de périphérique de démarrage (stockage/ordre de boot), logo Windows puis plantage (OS/pilote). Chaque réponse oriente vers une solution différente.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('What runs first when a computer powers on?', 'Qu’est-ce qui s’exécute en premier à l’allumage ?'), options: [t('The kernel', 'Le noyau'), t('UEFI/BIOS firmware', 'Le firmware UEFI/BIOS'), t('The login screen', 'L’écran de connexion'), t('The browser', 'Le navigateur')], answer: 1, explain: t('Firmware starts before anything else.', 'Le firmware démarre avant tout le reste.') },
      { kind: 'tf', prompt: t('Users should work daily with an administrator account for convenience.', 'Les utilisateurs devraient travailler en administrateur au quotidien par commodité.'), answer: false, explain: t('Least privilege: admin only when needed.', 'Moindre privilège : admin uniquement si nécessaire.') },
      { kind: 'mcq', prompt: t('GRUB is an example of a…', 'GRUB est un exemple de…'), options: [t('Bootloader', 'Chargeur d’amorçage'), t('Driver', 'Pilote'), t('Firewall', 'Pare-feu'), t('Filesystem', 'Système de fichiers')], answer: 0, explain: t('GRUB loads Linux kernels.', 'GRUB charge les noyaux Linux.') },
      { kind: 'mcq', prompt: t('Which Linux command runs a single command as root?', 'Quelle commande Linux exécute une seule commande en root ?'), options: [t('whoami', 'whoami'), t('sudo', 'sudo'), t('ls', 'ls'), t('cd', 'cd')], answer: 1, explain: t('sudo = "superuser do".', 'sudo = « superuser do ».') },
    ],
  },
]

export const fsLessons: Lesson[] = [
  {
    id: 'l1-fs.1',
    title: t('Files, folders and paths', 'Fichiers, dossiers et chemins'),
    minutes: 11,
    objectives: [
      t('Read Windows and Linux paths', 'Lire des chemins Windows et Linux'),
      t('Distinguish absolute and relative paths', 'Distinguer chemins absolus et relatifs'),
      t('Navigate a directory tree mentally', 'Naviguer mentalement dans une arborescence'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Everything lives in a tree', 'Tout vit dans un arbre'),
        body: t(
          'Files are organised in **folders** (also called **directories**), which can contain other folders. This forms a **tree**. The top is the **root**.\n\n- On **Windows**, each drive has its own root: `C:\\`, `D:\\`. Separator: backslash `\\`.\n- On **Linux/macOS**, there is a single root `/` and drives are attached (**mounted**) inside it. Separator: slash `/`.',
          'Les fichiers sont rangés dans des **dossiers** (aussi appelés **répertoires**), qui peuvent contenir d’autres dossiers. Cela forme un **arbre**. Le sommet est la **racine**.\n\n- Sous **Windows**, chaque lecteur a sa racine : `C:\\`, `D:\\`. Séparateur : antislash `\\`.\n- Sous **Linux/macOS**, il y a une seule racine `/` et les disques y sont rattachés (**montés**). Séparateur : slash `/`.',
        ),
      },
      { type: 'diagram', diagram: 'fs-tree', caption: t('The same idea on both systems: a path describes the route from the root to a file.', 'Même idée sur les deux systèmes : un chemin décrit la route de la racine jusqu’au fichier.') },
      {
        type: 'table',
        head: [t('Kind', 'Type'), 'Windows', 'Linux'],
        rows: [
          [t('Absolute path', 'Chemin absolu'), 'C:\\Users\\sam\\Documents\\report.docx', '/home/sam/documents/report.odt'],
          [t('User home', 'Dossier personnel'), 'C:\\Users\\sam', '/home/sam  (~)'],
          [t('Programs', 'Programmes'), 'C:\\Program Files', '/usr/bin'],
          [t('System config', 'Configuration système'), 'C:\\Windows\\System32', '/etc'],
          [t('Logs', 'Journaux'), t('Event Viewer', 'Observateur d’événements'), '/var/log'],
        ],
      },
      {
        type: 'text',
        title: t('Absolute vs relative', 'Absolu vs relatif'),
        body: t(
          'An **absolute path** starts from the root and works from anywhere: `/etc/hosts`.\nA **relative path** starts from where you currently are: if you are in `/home/sam`, then `documents/report.odt` points to `/home/sam/documents/report.odt`.\n\nTwo special names: `.` means **this folder**, `..` means **the parent folder**.',
          'Un **chemin absolu** part de la racine et fonctionne de partout : `/etc/hosts`.\nUn **chemin relatif** part de l’endroit où vous êtes : si vous êtes dans `/home/sam`, alors `documents/report.odt` désigne `/home/sam/documents/report.odt`.\n\nDeux noms spéciaux : `.` signifie **ce dossier**, `..` signifie **le dossier parent**.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('You are in /home/sam/documents. What does ../pictures point to?', 'Vous êtes dans /home/sam/documents. Que désigne ../pictures ?'),
          options: ['/home/sam/documents/pictures', '/home/sam/pictures', '/pictures', '/home/pictures'],
          answer: 1,
          explain: t('.. goes up to /home/sam, then into pictures.', '.. remonte à /home/sam, puis entre dans pictures.'),
        },
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('Case sensitivity', 'Sensibilité à la casse'),
        body: t('Linux treats `Report.txt` and `report.txt` as two different files. Windows does not. Scripts copied between systems often break because of this.', 'Linux considère `Report.txt` et `report.txt` comme deux fichiers différents. Windows non. Des scripts copiés d’un système à l’autre cassent souvent à cause de cela.'),
      },
    ],
    vocabulary: [
      { term: t('Directory', 'Répertoire'), def: t('Another word for folder.', 'Autre mot pour dossier.') },
      { term: t('Root', 'Racine'), def: t('Top of the directory tree (C:\\ or /).', 'Sommet de l’arborescence (C:\\ ou /).') },
      { term: t('Absolute path', 'Chemin absolu'), def: t('Full path from the root.', 'Chemin complet depuis la racine.') },
      { term: t('Relative path', 'Chemin relatif'), def: t('Path from the current folder.', 'Chemin depuis le dossier courant.') },
      { term: t('Mount', 'Monter'), def: t('Attach a drive into the Linux tree.', 'Rattacher un disque à l’arborescence Linux.') },
    ],
    practice: t(
      'When guiding a user over the phone, always give absolute paths ("open C:\\Users\\yourname\\Downloads") — relative instructions depend on where they already are, and they rarely know.',
      'Quand vous guidez un utilisateur par téléphone, donnez toujours des chemins absolus (« ouvrez C:\\Users\\votrenom\\Téléchargements ») — les instructions relatives dépendent de l’endroit où il se trouve, et il l’ignore souvent.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Linux path separator?', 'Séparateur de chemin sous Linux ?'), options: ['\\', '/', ':', '|'], answer: 1, explain: t('Linux uses forward slash.', 'Linux utilise le slash.') },
      { kind: 'tf', prompt: t('.. refers to the parent directory.', '.. désigne le dossier parent.'), answer: true, explain: t('Correct.', 'Exact.') },
      { kind: 'mcq', prompt: t('Where are Linux system configuration files usually found?', 'Où trouve-t-on généralement la configuration système Linux ?'), options: ['/home', '/etc', '/tmp', '/boot/efi'], answer: 1, explain: t('/etc holds configuration.', '/etc contient la configuration.') },
      { kind: 'tf', prompt: t('On Linux, File.txt and file.txt are the same file.', 'Sous Linux, File.txt et file.txt sont le même fichier.'), answer: false, explain: t('Linux is case-sensitive.', 'Linux est sensible à la casse.') },
    ],
  },
  {
    id: 'l1-fs.2',
    title: t('Filesystems, partitions and extensions', 'Systèmes de fichiers, partitions et extensions'),
    minutes: 12,
    objectives: [
      t('Compare NTFS, FAT32, exFAT and ext4', 'Comparer NTFS, FAT32, exFAT et ext4'),
      t('Explain what a partition and formatting are', 'Expliquer ce que sont une partition et un formatage'),
      t('Recognise file extensions and why they matter', 'Reconnaître les extensions et leur importance'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Disk → partition → filesystem', 'Disque → partition → système de fichiers'),
        body: t(
          'A physical disk is divided into **partitions** (sections). Each partition is **formatted** with a **filesystem** — the set of rules for storing files, names, sizes, dates and permissions.\n\nFormatting **erases the index** of files; data recovery is sometimes possible afterwards, which is why secure disposal needs proper wiping tools.',
          'Un disque physique est divisé en **partitions** (sections). Chaque partition est **formatée** avec un **système de fichiers** — l’ensemble des règles pour stocker fichiers, noms, tailles, dates et permissions.\n\nLe formatage **efface l’index** des fichiers ; une récupération reste parfois possible, d’où la nécessité d’outils d’effacement sécurisé pour la mise au rebut.',
        ),
      },
      {
        type: 'table',
        head: [t('Filesystem', 'Système'), t('Used by', 'Utilisé par'), t('Max file size', 'Taille max fichier'), t('Strengths', 'Atouts')],
        rows: [
          ['NTFS', 'Windows', t('Huge (16 TB+)', 'Énorme (16 To+)'), t('Permissions, encryption, journaling', 'Permissions, chiffrement, journalisation')],
          ['FAT32', t('Old USB keys, cameras', 'Vieilles clés USB, appareils photo'), '4 GB', t('Works everywhere', 'Compatible partout')],
          ['exFAT', t('USB keys, SD cards', 'Clés USB, cartes SD'), t('Huge', 'Énorme'), t('Cross-platform, no 4 GB limit', 'Multiplateforme, sans limite de 4 Go')],
          ['ext4', 'Linux', t('16 TB', '16 To'), t('Permissions, journaling, reliable', 'Permissions, journalisation, fiable')],
          ['APFS', 'macOS', t('Huge', 'Énorme'), t('Snapshots, encryption', 'Instantanés, chiffrement')],
        ],
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('A user can’t copy a 6 GB video to a USB key. Most likely cause?', 'Un utilisateur ne peut pas copier une vidéo de 6 Go sur une clé USB. Cause probable ?'),
          options: [t('The key is FAT32', 'La clé est en FAT32'), t('The key is NTFS', 'La clé est en NTFS'), t('Bad RAM', 'RAM défectueuse'), t('No internet', 'Pas d’internet')],
          answer: 0,
          explain: t('FAT32 cannot store files over 4 GB. Reformat as exFAT (after saving its contents).', 'FAT32 ne stocke pas de fichiers de plus de 4 Go. Reformatez en exFAT (après avoir sauvegardé le contenu).'),
        },
      },
      {
        type: 'text',
        title: t('Extensions tell the OS what a file is', 'L’extension dit à l’OS ce qu’est un fichier'),
        body: t(
          'The **extension** is the part after the last dot: `.docx`, `.pdf`, `.exe`, `.ps1`, `.sh`, `.zip`. Windows uses it to choose which program opens the file.\n\nWindows hides known extensions by default — attackers exploit this with names like `invoice.pdf.exe`. **Turn on "File name extensions"** in File Explorer on every PC you manage.',
          'L’**extension** est la partie après le dernier point : `.docx`, `.pdf`, `.exe`, `.ps1`, `.sh`, `.zip`. Windows l’utilise pour choisir le programme qui ouvre le fichier.\n\nWindows masque par défaut les extensions connues — les attaquants en profitent avec des noms comme `facture.pdf.exe`. **Activez « Extensions de noms de fichiers »** dans l’Explorateur sur chaque PC que vous gérez.',
        ),
      },
      {
        type: 'callout',
        tone: 'pro',
        title: t('Permissions preview', 'Aperçu des permissions'),
        body: t(
          'NTFS and ext4 store **who may read, write or execute** each file. On Linux you will read strings like `-rwxr-x---` (owner / group / others). You will master this in Level 3.',
          'NTFS et ext4 stockent **qui peut lire, écrire ou exécuter** chaque fichier. Sous Linux vous lirez des chaînes comme `-rwxr-x---` (propriétaire / groupe / autres). Vous maîtriserez cela au niveau 3.',
        ),
      },
    ],
    vocabulary: [
      { term: t('Partition', 'Partition'), def: t('A section of a disk treated as a separate volume.', 'Section d’un disque traitée comme un volume distinct.') },
      { term: t('Format', 'Formater'), def: t('Prepare a partition with a filesystem.', 'Préparer une partition avec un système de fichiers.') },
      { term: t('Journaling', 'Journalisation'), def: t('Logging changes so a crash doesn’t corrupt the filesystem.', 'Enregistrer les modifications pour qu’un crash ne corrompe pas le système de fichiers.') },
      { term: t('Extension', 'Extension'), def: t('Suffix after the last dot indicating file type.', 'Suffixe après le dernier point indiquant le type.') },
    ],
    practice: t(
      'Preparing a USB key to share large files between Windows and Mac users: format it exFAT. Preparing an internal Windows data disk: NTFS. A Linux server data volume: ext4 (or XFS).',
      'Préparer une clé USB pour partager de gros fichiers entre Windows et Mac : formatez-la en exFAT. Un disque de données interne Windows : NTFS. Un volume de données sur serveur Linux : ext4 (ou XFS).',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Maximum file size on FAT32?', 'Taille maximale d’un fichier en FAT32 ?'), options: ['2 GB', '4 GB', '16 TB', t('Unlimited', 'Illimitée')], answer: 1, explain: t('4 GB (minus one byte).', '4 Go (moins un octet).') },
      { kind: 'mcq', prompt: t('Default filesystem for Windows system drives?', 'Système de fichiers par défaut du disque système Windows ?'), options: ['ext4', 'FAT32', 'NTFS', 'APFS'], answer: 2, explain: t('NTFS.', 'NTFS.') },
      { kind: 'tf', prompt: t('invoice.pdf.exe is a PDF document.', 'facture.pdf.exe est un document PDF.'), answer: false, explain: t('The real extension is .exe — a program. Classic phishing trick.', 'La vraie extension est .exe — un programme. Piège classique d’hameçonnage.') },
      { kind: 'tf', prompt: t('Formatting a partition is a secure way to destroy confidential data.', 'Formater une partition est un moyen sûr de détruire des données confidentielles.'), answer: false, explain: t('Data can often be recovered; use secure wipe tools.', 'Les données sont souvent récupérables ; utilisez un effacement sécurisé.') },
    ],
  },
]
