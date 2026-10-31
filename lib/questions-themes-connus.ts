import type { RawSeedQuestion } from './questions-part1';

export const QUESTIONS_THEMES_CONNUS: RawSeedQuestion[] = [
  // ============================================================================
  // NIVEAU 1 (4 questions : Animaux & Nature, BD & Mangas, Mythologie & Légendes, Littérature & Contes)
  // ============================================================================
  {
    difficulty: 1,
    theme: 'Animaux & Nature',
    question:
      'Quel est le plus grand mammifère vivant actuellement sur la planète Terre ?',
    options: [
      'L’éléphant d’Afrique',
      'La baleine bleue',
      'Le cachalot géant',
      'Le requin-baleine',
    ],
    correct_index: 1,
    explanation:
      'La baleine bleue peut atteindre 30 mètres de long et peser plus de 170 tonnes. Sa langue à elle seule pèse autant qu’un éléphant !',
  },
  {
    difficulty: 1,
    theme: 'BD & Mangas',
    question:
      'Quel est le nom du petit chien fidèle qui accompagne Astérix et surtout Obélix dans leurs aventures ?',
    options: ['Milou', 'Rantanplan', 'Idéfix', 'Spip'],
    correct_index: 2,
    explanation:
      'Apparu en 1963 dans « Le Tour de Gaule d’Astérix », Idéfix est célèbre pour pleurer chaque fois que quelqu’un déracine un arbre.',
  },
  {
    difficulty: 1,
    theme: 'Mythologie & Légendes',
    question:
      'Dans la mythologie grecque, qui est le roi des dieux de l’Olympe, maître de la foudre et du tonnerre ?',
    options: ['Poséidon', 'Hadès', 'Zeus', 'Apollon'],
    correct_index: 2,
    explanation:
      'Zeus règne sur le mont Olympe après avoir renversé son père Cronos, partageant le monde avec ses frères Poséidon (les mers) et Hadès (les Enfers).',
  },
  {
    difficulty: 1,
    theme: 'Littérature & Contes',
    question:
      'Dans la célèbre fable de Jean de La Fontaine, quel animal rusé flatte le Corbeau pour lui voler son fromage ?',
    options: ['Le Loup', 'Le Renard', 'La Belette', 'Le Chat'],
    correct_index: 1,
    explanation:
      '« Tout flatteur vit aux dépens de celui qui l’écoute » : Maître Renard complimente le ramage du Corbeau pour lui faire ouvrir le bec.',
  },

  // ============================================================================
  // NIVEAU 2 (4 questions)
  // ============================================================================
  {
    difficulty: 2,
    theme: 'Animaux & Nature',
    question:
      'De quelle plante le panda géant se nourrit-il à hauteur de 99 % de son alimentation quotidienne ?',
    options: ['L’eucalyptus', 'Le bambou', 'La fougère', 'Le roseau sucré'],
    correct_index: 1,
    explanation:
      'Un panda géant adulte passe jusqu’à 14 heures par jour à mâcher entre 15 et 38 kilos de bambou pour subvenir à ses besoins énergétiques.',
  },
  {
    difficulty: 2,
    theme: 'BD & Mangas',
    question:
      'Combien de boules de cristal Son Goku et ses amis doivent-ils réunir pour invoquer le dragon sacré Shenron dans « Dragon Ball » ?',
    options: ['5 boules', '7 boules', '9 boules', '12 boules'],
    correct_index: 1,
    explanation:
      'Les 7 Dragon Balls sont numérotées de 1 à 7 étoiles. Celle à 4 étoiles (Suu Shinchuu) est le précieux souvenir laissé à Goku par son grand-père Son Gohan.',
  },
  {
    difficulty: 2,
    theme: 'Mythologie & Légendes',
    question:
      'Quelle est la seule partie du corps du héros grec Achille qui était vulnérable aux blessures ?',
    options: ['Son épaule', 'Son cœur', 'Son talon', 'Sa nuque'],
    correct_index: 2,
    explanation:
      'Sa mère Thétis l’avait plongé bébé dans les eaux du Styx pour le rendre invulnérable, en le tenant par le talon qui ne fut donc pas mouillé.',
  },
  {
    difficulty: 2,
    theme: 'Littérature & Contes',
    question:
      'Quel célèbre écrivain et aviateur français est l’auteur du « Petit Prince », publié en 1943 ?',
    options: [
      'Marcel Pagnol',
      'Jules Verne',
      'Antoine de Saint-Exupéry',
      'Romain Gary',
    ],
    correct_index: 2,
    explanation:
      'Illustré de ses propres aquarelles, « Le Petit Prince » d’Antoine de Saint-Exupéry est l’ouvrage le plus traduit au monde après la Bible.',
  },

  // ============================================================================
  // NIVEAU 3 (4 questions)
  // ============================================================================
  {
    difficulty: 3,
    theme: 'Animaux & Nature',
    question:
      'Quel oiseau est capable de voler sur place et même à reculons grâce au battement ultra-rapide de ses ailes ?',
    options: [
      'Le martin-pêcheur',
      'Le colibri (oiseau-mouche)',
      'L’hirondelle rustique',
      'Le martinet noir',
    ],
    correct_index: 1,
    explanation:
      'Le colibri peut battre des ailes de 50 à 80 fois par seconde en décrivant un huit horizontal, ce qui lui permet de butiner en vol stationnaire.',
  },
  {
    difficulty: 3,
    theme: 'BD & Mangas',
    question:
      'Dans les aventures de Tintin, quel est le juron favori du capitaine Haddock impliquant un phénomène météo ?',
    options: [
      'Mille millions de mille sabords !',
      'Sacré tonnerre de Nantes !',
      'Ventre-saint-gris !',
      'Par Toutatis !',
    ],
    correct_index: 0,
    explanation:
      'Avec « Tonnerre de Brest ! » et « Bachi-bouzouk ! », « Mille millions de mille sabords ! » est la signature verbale du marin créé par Hergé en 1941.',
  },
  {
    difficulty: 3,
    theme: 'Mythologie & Légendes',
    question:
      'Dans la légende arthurienne, comment s’appelle l’enchanteur qui guide le roi Arthur et l’aide à fonder la Table Ronde ?',
    options: ['Gandalf', 'Merlin', 'Panoramix', 'Lancelot'],
    correct_index: 1,
    explanation:
      'Prophète et magicien des forêts de Brocéliande, Merlin conseille Uther Pendragon puis son fils Arthur dès l’épisode de l’épée Excalibur.',
  },
  {
    difficulty: 3,
    theme: 'Littérature & Contes',
    question:
      'Quel célèbre détective privé londonien, créé par Sir Arthur Conan Doyle, habite au 221B Baker Street ?',
    options: [
      'Hercule Poirot',
      'Sherlock Holmes',
      'Arsène Lupin',
      'Le commissaire Maigret',
    ],
    correct_index: 1,
    explanation:
      'Accompagné du fidèle docteur John Watson, Sherlock Holmes apparaît pour la première fois en 1887 dans le roman « Une étude en rouge ».',
  },

  // ============================================================================
  // NIVEAU 4 (4 questions)
  // ============================================================================
  {
    difficulty: 4,
    theme: 'Animaux & Nature',
    question:
      'Combien de cœurs possède une pieuvre (poulpe) pour faire circuler son sang bleu dans son corps ?',
    options: ['1 seul cœur', '2 cœurs', '3 cœurs', '8 cœurs'],
    correct_index: 2,
    explanation:
      'La pieuvre possède trois cœurs : deux cœurs branchiaux qui pompent le sang vers les branchies, et un cœur systémique pour le reste du corps.',
  },
  {
    difficulty: 4,
    theme: 'BD & Mangas',
    question:
      'Dans le manga « One Piece », quel fruit du démon Monkey D. Luffy a-t-il mangé enfant, rendant son corps élastique ?',
    options: [
      'Le Mera Mera no Mi (Fruit du Feu)',
      'Le Gomu Gomu no Mi (Fruit du Caoutchouc)',
      'Le Bara Bara no Mi (Fruit de la Fragmentation)',
      'Le Yami Yami no Mi (Fruit des Ténèbres)',
    ],
    correct_index: 1,
    explanation:
      'En avalant le Gomu Gomu no Mi rapporté par l’équipage de Shanks le Roux, Luffy devient un homme-caoutchouc mais perd à jamais la capacité de nager.',
  },
  {
    difficulty: 4,
    theme: 'Mythologie & Légendes',
    question:
      'Quelle créature de la mythologie grecque possède un corps d’homme et une tête de taureau, enfermée au cœur du Labyrinthe de Crète ?',
    options: ['Le Centaure', 'Le Minotaure', 'Le Cerbère', 'La Chimère'],
    correct_index: 1,
    explanation:
      'Né des amours de la reine Pasiphaé et d’un taureau blanc envoyé par Poséidon, le Minotaure fut finalement vaincu par Thésée grâce au fil d’Ariane.',
  },
  {
    difficulty: 4,
    theme: 'Littérature & Contes',
    question:
      'Dans « Les Trois Mousquetaires » d’Alexandre Dumas, comment s’appelle le jeune Gascon qui rejoint Athos, Porthos et Aramis ?',
    options: ['Cyrano de Bergerac', 'Lagardère', 'D’Artagnan', 'Monte-Cristo'],
    correct_index: 2,
    explanation:
      'Inspiré du véritable Charles de Batz de Castelmore d’Artagnan, le héros quitte sa Gascogne natale pour Paris où il adopte la devise « Un pour tous, tous pour un ».',
  },

  // ============================================================================
  // NIVEAU 5 (4 questions)
  // ============================================================================
  {
    difficulty: 5,
    theme: 'Animaux & Nature',
    question:
      'Quel mammifère semi-aquatique d’Australie a la particularité de pondre des œufs tout en allaitant ses petits ?',
    options: [
      'Le wombat',
      'L’ornithorynque',
      'Le diable de Tasmanie',
      'Le wallaby',
    ],
    correct_index: 1,
    explanation:
      'Avec l’échidné, l’ornithorynque fait partie de l’ordre des monotrèmes : doté d’un bec de canard et d’une queue de castor, le mâle possède même un aiguillon venimeux !',
  },
  {
    difficulty: 5,
    theme: 'BD & Mangas',
    question:
      'Quel est le prénom du garçon espiègle à la mèche blonde, héros de la bande dessinée culte de Zep créée en 1992 ?',
    options: ['Cédric', 'Titeuf', 'Boule', 'Kid Paddle'],
    correct_index: 1,
    explanation:
      'Célèbre pour son expression « C’est pô juste ! » et son amour pour Nadia, Titeuf tire son nom de sa tête ronde (« p’tit œuf ») dessinée par le Suisse Zep.',
  },
  {
    difficulty: 5,
    theme: 'Mythologie & Légendes',
    question:
      'Dans la mythologie égyptienne, quel dieu à tête de chacal préside à la momification et à la pesée des âmes des défunts ?',
    options: ['Horus', 'Rê (Râ)', 'Anubis', 'Sobek'],
    correct_index: 2,
    explanation:
      'Anubis guide les morts dans l’au-delà et supervise la pesée du cœur face à la plume de Maât, déesse de la vérité et de la justice.',
  },
  {
    difficulty: 5,
    theme: 'Littérature & Contes',
    question:
      'Dans le roman dystopique « 1984 » de George Orwell, comment s’appelle le chef omniprésent du Parti qui surveille tous les citoyens ?',
    options: [
      'Grand Manitou',
      'Big Brother',
      'Le Commandeur',
      'Le Grand Architecte',
    ],
    correct_index: 1,
    explanation:
      'La formule « Big Brother is watching you » (« Big Brother vous regarde ») publiée en 1949 est passée dans le langage courant pour désigner la surveillance de masse.',
  },

  // ============================================================================
  // NIVEAU 6 (4 questions)
  // ============================================================================
  {
    difficulty: 6,
    theme: 'Animaux & Nature',
    question:
      'Quel est le seul continent de la planète sur lequel on ne trouve aucun serpent ni reptile à l’état sauvage ?',
    options: [
      'L’Océanie',
      'L’Antarctique',
      'L’Europe',
      'L’Amérique du Sud',
    ],
    correct_index: 1,
    explanation:
      'Les reptiles étant ectothermes (à sang froid), aucun serpent, lézard ou tortue terrestre ne peut survivre aux températures polaires de l’Antarctique.',
  },
  {
    difficulty: 6,
    theme: 'BD & Mangas',
    question:
      'Dans le manga « Naruto » de Masashi Kishimoto, comment s’appelle le démon renard à neuf queues scellé en Naruto à sa naissance ?',
    options: ['Shukaku', 'Kurama (Kyûbi)', 'Susanoo', 'Gamabunta'],
    correct_index: 1,
    explanation:
      'Appelé Kyûbi (« Neuf queues »), le plus puissant des démons à queues porte en réalité le prénom de Kurama et finit par devenir l’allié de Naruto.',
  },
  {
    difficulty: 6,
    theme: 'Mythologie & Légendes',
    question:
      'Dans la mythologie nordique, comment s’appelle le marteau magique du dieu du tonnerre Thor, qui revient toujours dans sa main ?',
    options: ['Gungnir', 'Mjöllnir', 'Gram', 'Bifröst'],
    correct_index: 1,
    explanation:
      'Forgé par les nains Brokk et Eitri, Mjöllnir signifie « le broyeur ». Gungnir est quant à elle la lance infaillible d’Odin, et Bifröst le pont arc-en-ciel.',
  },
  {
    difficulty: 6,
    theme: 'Littérature & Contes',
    question:
      'Quel est le numéro de matricule de bagnard que porte Jean Valjean au début des « Misérables » de Victor Hugo ?',
    options: ['1789', '24601', '99999', '18150'],
    correct_index: 1,
    explanation:
      'Condamné à cinq ans de bagne à Toulon pour avoir volé un pain (puis dix-neuf ans après ses tentatives d’évasion), Jean Valjean porte le matricule 24601.',
  },

  // ============================================================================
  // NIVEAU 7 (4 questions)
  // ============================================================================
  {
    difficulty: 7,
    theme: 'Animaux & Nature',
    question:
      'Quel oiseau rapace détient le record absolu de vitesse du règne animal en atteignant plus de 380 km/h lors de ses piqués ?',
    options: [
      'L’aigle royal',
      'Le faucon pèlerin',
      'Le condor des Andes',
      'L’épervier d’Europe',
    ],
    correct_index: 1,
    explanation:
      'Si le guépard est l’animal terrestre le plus rapide (~110 km/h), le faucon pèlerin en piqué dépasse les 380 km/h, un record homologué à 389 km/h !',
  },
  {
    difficulty: 7,
    theme: 'BD & Mangas',
    question:
      'Quel duo d’auteurs belges a créé les aventures de « Blake et Mortimer » pour le lancement du journal Tintin en 1946 ? (indice : un seul auteur signait)',
    options: [
      'Franquin',
      'Edgar P. Jacobs',
      'Peyo',
      'Morris',
    ],
    correct_index: 1,
    explanation:
      'Edgar P. Jacobs, ancien chanteur d’opéra et collaborateur d’Hergé, a créé à lui seul le capitaine Francis Blake et le professeur Philip Mortimer (« La Marque jaune »).',
  },
  {
    difficulty: 7,
    theme: 'Mythologie & Légendes',
    question:
      'Dans la mythologie grecque, quel Titan fut condamné par Zeus à avoir le foie dévoré chaque jour par un aigle pour avoir donné le feu aux hommes ?',
    options: ['Atlas', 'Prométhée', 'Cronos', 'Épiméthée'],
    correct_index: 1,
    explanation:
      'Enchaîné au mont Caucase, Prométhée voyait son foie repousser chaque nuit avant d’être finalement délivré de son supplice par Héraclès.',
  },
  {
    difficulty: 7,
    theme: 'Littérature & Contes',
    question:
      'Quelle romancière britannique a écrit à seulement 19 ans le roman gothique « Frankenstein ou le Prométhée moderne », publié en 1818 ?',
    options: [
      'Jane Austen',
      'Emily Brontë',
      'Mary Shelley',
      'Virginia Woolf',
    ],
    correct_index: 2,
    explanation:
      'Lors d’un été pluvieux au bord du lac Léman en 1816 avec Lord Byron et Percy Shelley, la jeune Mary Shelley imagine l’histoire du docteur Victor Frankenstein.',
  },

  // ============================================================================
  // NIVEAU 8 (4 questions)
  // ============================================================================
  {
    difficulty: 8,
    theme: 'Animaux & Nature',
    question:
      'Quel arbre millénaire originaire d’Asie, surnommé « l’arbre aux quarante écus », est le seul survivant d’une famille apparue avant les dinosaures ?',
    options: [
      'Le séquoia géant',
      'Le baobab africain',
      'Le Ginkgo biloba',
      'Le cèdre du Liban',
    ],
    correct_index: 2,
    explanation:
      'Apparu il y a plus de 270 millions d’années, le Ginkgo biloba est un fossile vivant si résistant que plusieurs spécimens ont survécu à l’explosion d’Hiroshima en 1945.',
  },
  {
    difficulty: 8,
    theme: 'BD & Mangas',
    question:
      'Dans le manga « Death Note », quel est le fruit dont raffole Ryuk, le dieu de la mort (Shinigami) qui laisse tomber son carnet sur Terre ?',
    options: ['Les pêches', 'Les pommes', 'Les raisins noirs', 'Les kakis'],
    correct_index: 1,
    explanation:
      'Pour Ryuk, les pommes du monde des humains sont aussi savoureuses et addictives que la cigarette ou l’alcool, car celles du monde des Shinigami ont le goût du sable.',
  },
  {
    difficulty: 8,
    theme: 'Mythologie & Légendes',
    question:
      'Quelles étaient les trois sœurs Gorgones de la mythologie grecque, dont seule Méduse était mortelle ?',
    options: [
      'Clotho, Lachésis et Atropos',
      'Sthéno, Euryale et Méduse',
      'Tisiphone, Mégère et Alecto',
      'Aglaé, Euphrosyne et Thalie',
    ],
    correct_index: 1,
    explanation:
      'Sthéno, Euryale et Méduse étaient les trois Gorgones. Clotho, Lachésis et Atropos sont les trois Moires (Parques), et Aglaé, Euphrosyne et Thalie les trois Grâces.',
  },
  {
    difficulty: 8,
    theme: 'Littérature & Contes',
    question:
      'Par quelle phrase devenue mythique s’ouvre le roman « L’Étranger » d’Albert Camus, publié en 1942 ?',
    options: [
      '« Longtemps, je me suis couché de bonne heure. »',
      '« Aujourd’hui, maman est morte. »',
      '« Doukipudonktan, se demanda Gabriel excédé. »',
      '« Ça a débuté comme ça. »',
    ],
    correct_index: 1,
    explanation:
      '« Aujourd’hui, maman est morte. Ou peut-être hier, je ne sais pas. » est l’incipit célèbre prononcé par Meursault, le narrateur de « L’Étranger ».',
  },

  // ============================================================================
  // NIVEAU 9 (4 questions)
  // ============================================================================
  {
    difficulty: 9,
    theme: 'Animaux & Nature',
    question:
      'Quel micro-animal à huit pattes, surnommé « ourson d’eau », est capable de survivre au vide spatial, à -272 °C et à des radiations extrêmes ?',
    options: [
      'L’axolotl',
      'Le tardigrade',
      'Le rotifère géant',
      'La limule',
    ],
    correct_index: 1,
    explanation:
      'Mesurant moins d’un millimètre, le tardigrade entre en cryptobiose (état de vie quasi suspendue) en se déshydratant à 99 %, résistant ainsi aux conditions les plus extrêmes de l’Univers.',
  },
  {
    difficulty: 9,
    theme: 'BD & Mangas',
    question:
      'Dans la bande dessinée « XIII » de William Vance et Jean Van Hamme, quel nombre en chiffres romains est tatoué sur la clavicule du héros amnésique ?',
    options: ['VII', 'IX', 'XIII', 'XXI'],
    correct_index: 2,
    explanation:
      'Retrouvé blessé par balle sur une plage avec le chiffre romain XIII tatoué sur la clavicule gauche, le héros découvre qu’il est mêlé à une conspiration au sommet des États-Unis.',
  },
  {
    difficulty: 9,
    theme: 'Mythologie & Légendes',
    question:
      'Dans la mythologie nordique, comment s’appellent les deux corbeaux d’Odin qui parcourent le monde chaque jour et dont les noms signifient « Pensée » et « Mémoire » ?',
    options: [
      'Geri et Freki',
      'Hugin et Munin',
      'Sköll et Hati',
      'Fenrir et Jörmungand',
    ],
    correct_index: 1,
    explanation:
      'Hugin (« Pensée ») et Munin (« Mémoire ») se perchent sur les épaules d’Odin pour lui murmurer tout ce qu’ils ont vu, tandis que Geri et Freki sont ses deux loups.',
  },
  {
    difficulty: 9,
    theme: 'Littérature & Contes',
    question:
      'Quel romancier français a remporté deux fois le prix Goncourt, une première fois sous son nom en 1956 et une seconde sous le pseudonyme d’Émile Ajar en 1975 ?',
    options: [
      'André Malraux',
      'Romain Gary',
      'Boris Vian',
      'Louis-Ferdinand Céline',
    ],
    correct_index: 1,
    explanation:
      'Alors que le prix Goncourt ne peut être attribué qu’une seule fois dans la vie d’un auteur, Romain Gary l’a reçu pour « Les Racines du ciel » (1956) puis pour « La Vie devant soi » (1975) sous le nom d’Émile Ajar !',
  },

  // ============================================================================
  // NIVEAU 10 (4 questions)
  // ============================================================================
  {
    difficulty: 10,
    theme: 'Animaux & Nature',
    question:
      'Quelle espèce de méduse est qualifiée de « biologiquement immortelle » car elle peut inverser son vieillissement et redevenir un polype juvénile ?',
    options: [
      'Physalia physalis (Galère portugaise)',
      'Turritopsis dohrnii',
      'Chironex fleckeri (Cuboméduse)',
      'Cyanea capillata (Crinière de lion)',
    ],
    correct_index: 1,
    explanation:
      'Par un processus de transdifférenciation cellulaire, la petite méduse Turritopsis dohrnii peut rajeunir indéfiniment après un stress ou une blessure.',
  },
  {
    difficulty: 10,
    theme: 'BD & Mangas',
    question:
      'Sous quel pseudonyme Jean Giraud a-t-il révolutionné la bande dessinée de science-fiction avec « L’Incal » (avec Jodorowsky) et « Arzach » ?',
    options: ['Enki Bilal', 'Mœbius', 'Gotlib', 'Druillet'],
    correct_index: 1,
    explanation:
      'Dessinateur réaliste du western « Blueberry » sous le nom de Gir, Jean Giraud signait Mœbius (d’après le ruban du mathématicien Möbius) pour ses œuvres visionnaires de science-fiction.',
  },
  {
    difficulty: 10,
    theme: 'Mythologie & Légendes',
    question:
      'Dans l’Épopée de Gilgamesh, plus ancien récit épique écrit de l’humanité, comment s’appelle l’homme sauvage créé par les dieux qui devient le frère d’armes du roi d’Uruk ?',
    options: ['Enkidu', 'Humbaba', 'Utnapishtim', 'Marduk'],
    correct_index: 0,
    explanation:
      'Façonné dans l’argile pour rivaliser avec Gilgamesh, Enkidu devient son ami inséparable. Sa mort tragique pousse Gilgamesh à entreprendre sa quête désespérée de l’immortalité.',
  },
  {
    difficulty: 10,
    theme: 'Littérature & Contes',
    question:
      'Dans quel roman de Georges Perec publié en 1969, long de 300 pages, la lettre « e » n’apparaît-elle pas une seule fois (lipogramme) ?',
    options: [
      'La Vie mode d’emploi',
      'Les Choses',
      'La Disparition',
      'W ou le souvenir d’enfance',
    ],
    correct_index: 2,
    explanation:
      'Véritable prouesse de l’Oulipo, « La Disparition » raconte l’enquête autour de la disparition d’Anton Voyl sans jamais utiliser la voyelle la plus fréquente du français !',
  },
];
