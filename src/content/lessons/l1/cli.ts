import { t, type Lesson } from '../types'

export const cliLessons: Lesson[] = [
  {
    id: 'l1-cli.1',
    title: t('Why the command line?', 'Pourquoi la ligne de commande ?'),
    minutes: 10,
    objectives: [
      t('Explain why IT professionals use the CLI', 'Expliquer pourquoi les pros de l’IT utilisent la CLI'),
      t('Name the main shells: cmd, PowerShell, bash', 'Nommer les principaux shells : cmd, PowerShell, bash'),
      t('Break a command into command, options and arguments', 'Décomposer une commande en commande, options et arguments'),
    ],
    blocks: [
      {
        type: 'text',
        title: t('Faster, repeatable, remote', 'Plus rapide, répétable, à distance'),
        body: t(
          'A graphical interface is great for occasional tasks. The **command line** wins when you need to:\n- do the same action on **50 machines**,\n- work on a **server with no screen** (over SSH),\n- configure **switches and routers** (they only have a CLI),\n- **document** exactly what you did — a command can be copied into a ticket.\n\nThe program that reads your commands is called a **shell**.',
          'Une interface graphique est parfaite pour les tâches ponctuelles. La **ligne de commande** l’emporte quand il faut :\n- faire la même action sur **50 machines**,\n- travailler sur un **serveur sans écran** (via SSH),\n- configurer des **commutateurs et routeurs** (ils n’ont qu’une CLI),\n- **documenter** exactement ce qu’on a fait — une commande se copie dans un ticket.\n\nLe programme qui lit vos commandes s’appelle un **shell**.',
        ),
      },
      {
        type: 'table',
        head: [t('Shell', 'Shell'), t('Platform', 'Plateforme'), t('Prompt looks like', 'Invite typique')],
        rows: [
          [t('Command Prompt (cmd)', 'Invite de commandes (cmd)'), 'Windows', 'C:\\Users\\sam>'],
          ['PowerShell', t('Windows (and Linux)', 'Windows (et Linux)'), 'PS C:\\Users\\sam>'],
          ['bash / zsh', 'Linux, macOS', 'sam@srv01:~$'],
          ['Cisco IOS', t('Network devices', 'Équipements réseau'), 'Switch1#'],
        ],
      },
      { type: 'diagram', diagram: 'command-anatomy', caption: t('Command, options and arguments — the grammar of almost every CLI.', 'Commande, options et arguments — la grammaire de presque toutes les CLI.') },
      {
        type: 'text',
        title: t('Reading the prompt', 'Lire l’invite'),
        body: t(
          'In `sam@srv01:~$`, **sam** is the user, **srv01** the machine, **~** the current folder (home) and **$** means a normal user. A **#** means you are **root** — be careful.',
          'Dans `sam@srv01:~$`, **sam** est l’utilisateur, **srv01** la machine, **~** le dossier courant (personnel) et **$** signifie utilisateur normal. Un **#** signifie que vous êtes **root** — prudence.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('In `ping -c 4 8.8.8.8`, what is `-c 4`?', 'Dans `ping -c 4 8.8.8.8`, que représente `-c 4` ?'),
          options: [t('The command', 'La commande'), t('An option with a value', 'Une option avec une valeur'), t('The target argument', 'L’argument cible'), t('The prompt', 'L’invite')],
          answer: 1,
          explain: t('-c is an option (count) and 4 is its value; 8.8.8.8 is the argument.', '-c est une option (nombre) et 4 sa valeur ; 8.8.8.8 est l’argument.'),
        },
      },
      {
        type: 'callout',
        tone: 'tip',
        title: t('Getting help', 'Obtenir de l’aide'),
        body: t('Never memorise everything. Use `command /?` (cmd), `Get-Help command` (PowerShell) or `man command` / `command --help` (Linux). Press **Tab** to auto-complete names and **↑** to recall previous commands.', 'Inutile de tout mémoriser. Utilisez `commande /?` (cmd), `Get-Help commande` (PowerShell) ou `man commande` / `commande --help` (Linux). Appuyez sur **Tab** pour compléter et **↑** pour rappeler les commandes précédentes.'),
      },
    ],
    vocabulary: [
      { term: t('Shell', 'Shell'), def: t('Program that interprets typed commands.', 'Programme qui interprète les commandes tapées.') },
      { term: t('Prompt', 'Invite'), def: t('Text showing the shell is ready for input.', 'Texte indiquant que le shell attend une commande.') },
      { term: t('Option / flag', 'Option'), def: t('Modifies how a command behaves (e.g. -c, /all).', 'Modifie le comportement d’une commande (ex. -c, /all).') },
      { term: t('Argument', 'Argument'), def: t('What the command acts on (a file, an address…).', 'Ce sur quoi agit la commande (un fichier, une adresse…).') },
      { term: 'SSH', def: t('Secure Shell — encrypted remote command line.', 'Ligne de commande distante chiffrée.') },
    ],
    practice: t(
      'Open a terminal right now: on Windows press Win+X → Terminal; on Linux/macOS open Terminal. Type `whoami` and press Enter. You have just run your first diagnostic command.',
      'Ouvrez un terminal maintenant : sous Windows Win+X → Terminal ; sous Linux/macOS ouvrez Terminal. Tapez `whoami` et Entrée. Vous venez d’exécuter votre première commande de diagnostic.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Which device type is usually configured only through a CLI?', 'Quel type d’équipement se configure généralement uniquement en CLI ?'), options: [t('Smartphone', 'Smartphone'), t('Network switch', 'Commutateur réseau'), t('Printer screen', 'Écran d’imprimante'), t('Mouse', 'Souris')], answer: 1, explain: t('Switches and routers are managed via CLI.', 'Commutateurs et routeurs se gèrent en CLI.') },
      { kind: 'tf', prompt: t('A # at the end of a Linux prompt usually means you are root.', 'Un # à la fin d’une invite Linux signifie généralement que vous êtes root.'), answer: true, explain: t('$ = user, # = root.', '$ = utilisateur, # = root.') },
      { kind: 'mcq', prompt: t('Which key auto-completes commands and paths?', 'Quelle touche complète automatiquement commandes et chemins ?'), options: ['Tab', 'Esc', 'Ctrl', 'F1'], answer: 0, explain: t('Tab completion saves time and typos.', 'La complétion par Tab évite fautes et pertes de temps.') },
      { kind: 'mcq', prompt: t('In `ipconfig /all`, `/all` is…', 'Dans `ipconfig /all`, `/all` est…'), options: [t('An option', 'Une option'), t('A file', 'Un fichier'), t('The shell', 'Le shell'), t('A user', 'Un utilisateur')], answer: 0, explain: t('Windows options often start with /.', 'Les options Windows commencent souvent par /.') },
    ],
  },
  {
    id: 'l1-cli.2',
    title: t('Navigating and managing files', 'Naviguer et gérer les fichiers'),
    minutes: 15,
    objectives: [
      t('Move around the filesystem with cd, ls/dir, pwd', 'Se déplacer avec cd, ls/dir, pwd'),
      t('Create, copy, move and delete files and folders', 'Créer, copier, déplacer et supprimer fichiers et dossiers'),
      t('Use the equivalent commands on Windows and Linux', 'Utiliser les commandes équivalentes sous Windows et Linux'),
    ],
    blocks: [
      {
        type: 'table',
        head: [t('Task', 'Tâche'), t('Linux (bash)', 'Linux (bash)'), t('Windows (cmd)', 'Windows (cmd)'), 'PowerShell'],
        rows: [
          [t('Where am I?', 'Où suis-je ?'), 'pwd', 'cd', 'Get-Location (pwd)'],
          [t('List contents', 'Lister le contenu'), 'ls -l', 'dir', 'Get-ChildItem (ls)'],
          [t('Change folder', 'Changer de dossier'), 'cd /var/log', 'cd C:\\Logs', 'cd C:\\Logs'],
          [t('Go up one level', 'Remonter d’un niveau'), 'cd ..', 'cd ..', 'cd ..'],
          [t('Create folder', 'Créer un dossier'), 'mkdir reports', 'mkdir reports', 'mkdir reports'],
          [t('Copy', 'Copier'), 'cp a.txt b.txt', 'copy a.txt b.txt', 'Copy-Item a.txt b.txt'],
          [t('Move / rename', 'Déplacer / renommer'), 'mv a.txt old/', 'move a.txt old\\', 'Move-Item a.txt old\\'],
          [t('Delete file', 'Supprimer un fichier'), 'rm a.txt', 'del a.txt', 'Remove-Item a.txt'],
          [t('Show file content', 'Afficher un fichier'), 'cat notes.txt', 'type notes.txt', 'Get-Content notes.txt'],
        ],
      },
      {
        type: 'example',
        title: t('A real session on a Linux server', 'Une vraie session sur un serveur Linux'),
        body: t('Creating a backup folder and copying a config file before editing it — a habit that saves careers.', 'Créer un dossier de sauvegarde et copier un fichier de configuration avant de le modifier — une habitude qui sauve des carrières.'),
        code: 'sam@srv01:~$ pwd\n/home/sam\nsam@srv01:~$ mkdir backups\nsam@srv01:~$ cp /etc/ssh/sshd_config backups/sshd_config.bak\nsam@srv01:~$ ls -l backups\n-rw-r--r-- 1 sam sam 3253 Nov 22 09:14 sshd_config.bak',
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('Which command shows your current folder on Linux?', 'Quelle commande affiche votre dossier courant sous Linux ?'),
          options: ['ls', 'pwd', 'cd', 'cat'],
          answer: 1,
          explain: t('pwd = print working directory.', 'pwd = print working directory (afficher le répertoire de travail).'),
        },
      },
      {
        type: 'callout',
        tone: 'warn',
        title: t('There is no recycle bin', 'Il n’y a pas de corbeille'),
        body: t('`rm` and `del` delete immediately. `rm -r` deletes folders and everything inside. Always run `pwd` and `ls` first, and never run `rm -rf` with a path you have not double-checked.', '`rm` et `del` suppriment immédiatement. `rm -r` supprime un dossier et tout son contenu. Faites toujours `pwd` et `ls` avant, et n’exécutez jamais `rm -rf` sur un chemin non vérifié deux fois.'),
      },
      {
        type: 'text',
        title: t('Wildcards', 'Caractères génériques'),
        body: t('`*` matches anything: `ls *.log` lists all log files; `cp *.pdf archive/` copies every PDF. `?` matches exactly one character: `report?.txt` matches report1.txt and reportA.txt.', '`*` correspond à n’importe quoi : `ls *.log` liste tous les journaux ; `cp *.pdf archive/` copie tous les PDF. `?` correspond à un seul caractère : `report?.txt` correspond à report1.txt et reportA.txt.'),
      },
    ],
    vocabulary: [
      { term: t('Working directory', 'Répertoire de travail'), def: t('The folder your shell is currently in.', 'Le dossier où se trouve actuellement votre shell.') },
      { term: t('Wildcard', 'Joker'), def: t('Pattern character like * or ? matching many names.', 'Caractère comme * ou ? correspondant à plusieurs noms.') },
      { term: 'cmdlet', def: t('A PowerShell command in Verb-Noun form.', 'Commande PowerShell de forme Verbe-Nom.') },
      { term: t('Recursive (-r)', 'Récursif (-r)'), def: t('Applies to a folder and everything inside it.', 'S’applique à un dossier et à tout son contenu.') },
    ],
    practice: t(
      'Golden rule before editing any configuration file on a server: copy it first (`cp file file.bak`). If your change breaks the service, you can restore it in seconds.',
      'Règle d’or avant de modifier un fichier de configuration sur un serveur : copiez-le d’abord (`cp fichier fichier.bak`). Si votre modification casse le service, vous restaurez en quelques secondes.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Windows cmd equivalent of `ls`?', 'Équivalent cmd Windows de `ls` ?'), options: ['dir', 'list', 'show', 'cat'], answer: 0, explain: t('dir lists folder contents.', 'dir liste le contenu.') },
      { kind: 'mcq', prompt: t('What does `mv old.txt new.txt` do?', 'Que fait `mv old.txt new.txt` ?'), options: [t('Copies the file', 'Copie le fichier'), t('Renames the file', 'Renomme le fichier'), t('Deletes it', 'Le supprime'), t('Shows it', 'L’affiche')], answer: 1, explain: t('mv moves — within the same folder that is a rename.', 'mv déplace — dans le même dossier, c’est un renommage.') },
      { kind: 'tf', prompt: t('Files deleted with rm go to a recycle bin.', 'Les fichiers supprimés avec rm vont dans une corbeille.'), answer: false, explain: t('They are gone immediately.', 'Ils disparaissent immédiatement.') },
      { kind: 'mcq', prompt: t('Which pattern matches every .log file?', 'Quel motif correspond à tous les fichiers .log ?'), options: ['?.log', '*.log', 'log*', '.log?'], answer: 1, explain: t('* matches any characters.', '* correspond à n’importe quels caractères.') },
    ],
  },
  {
    id: 'l1-cli.3',
    title: t('Your first diagnostic commands', 'Vos premières commandes de diagnostic'),
    minutes: 14,
    objectives: [
      t('Find a machine’s name, user and IP address from the CLI', 'Trouver le nom, l’utilisateur et l’adresse IP d’une machine en CLI'),
      t('Test connectivity with ping', 'Tester la connectivité avec ping'),
      t('Read command output to draw a conclusion', 'Lire la sortie d’une commande pour conclure'),
    ],
    blocks: [
      {
        type: 'table',
        head: [t('Question', 'Question'), 'Windows', 'Linux'],
        rows: [
          [t('Machine name?', 'Nom de la machine ?'), 'hostname', 'hostname'],
          [t('Who am I?', 'Qui suis-je ?'), 'whoami', 'whoami'],
          [t('My IP configuration?', 'Ma configuration IP ?'), 'ipconfig /all', 'ip a'],
          [t('Can I reach a host?', 'Puis-je joindre un hôte ?'), 'ping 192.168.1.1', 'ping -c 4 192.168.1.1'],
          [t('Which route do packets take?', 'Quel chemin prennent les paquets ?'), 'tracert 8.8.8.8', 'traceroute 8.8.8.8'],
        ],
      },
      {
        type: 'example',
        title: t('Reading ping output', 'Lire la sortie de ping'),
        body: t('**Reply from** = the host answered. **time=** is the round-trip latency. **Request timed out** = no answer: the host is down, unreachable, or a firewall blocks ping.', '**Reply from** = l’hôte a répondu. **time=** est la latence aller-retour. **Request timed out** = pas de réponse : hôte éteint, injoignable, ou un pare-feu bloque le ping.'),
        code: 'C:\\> ping 192.168.1.1\n\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\nReply from 192.168.1.1: bytes=32 time<1ms TTL=64\nReply from 192.168.1.1: bytes=32 time=1ms TTL=64\n\nPackets: Sent = 4, Received = 4, Lost = 0 (0% loss)',
      },
      {
        type: 'check',
        question: {
          kind: 'tf',
          prompt: t('"Request timed out" always means the remote computer is switched off.', '« Request timed out » signifie toujours que l’ordinateur distant est éteint.'),
          answer: false,
          explain: t('It could also be unreachable (routing) or a firewall dropping ICMP.', 'Il peut aussi être injoignable (routage) ou un pare-feu bloque l’ICMP.'),
        },
      },
      {
        type: 'text',
        title: t('The troubleshooting ladder', 'L’échelle de dépannage'),
        body: t(
          'Ping outward, step by step, to find where connectivity breaks:\n1. `ping 127.0.0.1` — is my own network stack working?\n2. `ping` my own IP — is my network card configured?\n3. `ping` the **default gateway** — can I reach my local router?\n4. `ping 8.8.8.8` — can I reach the internet by IP?\n5. `ping google.com` — does **name resolution (DNS)** work?\n\nThe first step that fails tells you where the problem is.',
          'Pinguez vers l’extérieur, étape par étape, pour trouver où la connectivité casse :\n1. `ping 127.0.0.1` — ma pile réseau fonctionne-t-elle ?\n2. `ping` ma propre IP — ma carte réseau est-elle configurée ?\n3. `ping` la **passerelle par défaut** — puis-je joindre mon routeur local ?\n4. `ping 8.8.8.8` — puis-je joindre internet par IP ?\n5. `ping google.com` — la **résolution de noms (DNS)** fonctionne-t-elle ?\n\nLa première étape qui échoue indique où est le problème.',
        ),
      },
      {
        type: 'check',
        question: {
          kind: 'mcq',
          prompt: t('ping 8.8.8.8 works but ping google.com fails. What is broken?', 'ping 8.8.8.8 fonctionne mais ping google.com échoue. Qu’est-ce qui est cassé ?'),
          options: [t('The network cable', 'Le câble réseau'), t('DNS (name resolution)', 'Le DNS (résolution de noms)'), t('The default gateway', 'La passerelle par défaut'), t('The CPU', 'Le CPU')],
          answer: 1,
          explain: t('IP connectivity is fine; translating names to IPs fails.', 'La connectivité IP fonctionne ; c’est la traduction nom → IP qui échoue.'),
        },
      },
    ],
    vocabulary: [
      { term: 'ping', def: t('Sends ICMP echo requests to test reachability and latency.', 'Envoie des requêtes ICMP echo pour tester l’accessibilité et la latence.') },
      { term: t('Latency', 'Latence'), def: t('Round-trip time, in milliseconds.', 'Temps aller-retour, en millisecondes.') },
      { term: t('Loopback (127.0.0.1)', 'Bouclage (127.0.0.1)'), def: t('Address that always points to the local machine.', 'Adresse qui désigne toujours la machine locale.') },
      { term: t('Default gateway', 'Passerelle par défaut'), def: t('The router a device sends traffic to for other networks.', 'Routeur auquel un appareil envoie le trafic destiné aux autres réseaux.') },
      { term: 'DNS', def: t('System translating names (google.com) into IP addresses.', 'Système qui traduit les noms (google.com) en adresses IP.') },
    ],
    practice: t(
      'This exact ladder is what you will use in the IT Operations Simulator and in real incidents. Write the results into the ticket: "Gateway reachable, 8.8.8.8 reachable, DNS failing" is a perfect handover to a colleague.',
      'C’est exactement cette échelle que vous utiliserez dans le Simulateur et en incident réel. Notez les résultats dans le ticket : « Passerelle joignable, 8.8.8.8 joignable, DNS en échec » est une passation parfaite à un collègue.',
    ),
    quiz: [
      { kind: 'mcq', prompt: t('Command to see full IP configuration on Windows?', 'Commande pour voir toute la configuration IP sous Windows ?'), options: ['ip a', 'ipconfig /all', 'netstat', 'hostname'], answer: 1, explain: t('ipconfig /all shows IP, mask, gateway, DNS, MAC, DHCP.', 'ipconfig /all affiche IP, masque, passerelle, DNS, MAC, DHCP.') },
      { kind: 'mcq', prompt: t('What does 127.0.0.1 always refer to?', 'Que désigne toujours 127.0.0.1 ?'), options: [t('The router', 'Le routeur'), t('The local machine', 'La machine locale'), t('Google', 'Google'), t('The DNS server', 'Le serveur DNS')], answer: 1, explain: t('Loopback.', 'Bouclage.') },
      { kind: 'mcq', prompt: t('Pinging the gateway fails, pinging yourself works. Where is the problem?', 'Le ping de la passerelle échoue, celui de soi-même fonctionne. Où est le problème ?'), options: [t('Between you and the router: cable, switch, VLAN or IP settings', 'Entre vous et le routeur : câble, commutateur, VLAN ou réglages IP'), t('DNS', 'DNS'), t('The website', 'Le site web'), t('The monitor', 'L’écran')], answer: 0, explain: t('Local link or local configuration.', 'Lien local ou configuration locale.') },
      { kind: 'tf', prompt: t('Linux ping runs forever unless you add -c or press Ctrl+C.', 'Sous Linux, ping tourne indéfiniment sauf avec -c ou Ctrl+C.'), answer: true, explain: t('Correct — Windows sends 4 by default.', 'Exact — Windows en envoie 4 par défaut.') },
    ],
  },
]
