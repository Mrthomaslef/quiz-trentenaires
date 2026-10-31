export type KidsTheme =
  | 'Ferme'
  | 'Animaux'
  | 'JO'
  | 'Sport'
  | 'Pokémon'
  | 'Dinosaures'
  | 'Espace'
  | 'Disney & Contes';

export interface KidsQuestion {
  id: string;
  theme: KidsTheme;
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
  visual: {
    /** URL d'image haute résolution (ex: artwork officiel Pokémon) */
    imageUrl?: string;
    /** Si vrai, affiche l'ombre chinoise "Quel est ce Pokémon ?" avant la réponse */
    silhouetteBeforeReveal?: boolean;
    /** Type de scène SVG spéciale (ex: anneaux olympiques) */
    specialSvg?: 'olympic_rings' | 'podium' | 'soccer_field' | 'farm_barn';
    /** Grand emoji principal au centre de l'illustration */
    mainEmoji: string;
    /** Petits emojis de décor autour */
    decorEmojis: [string, string];
    /** Dégradé Tailwind du cadre image */
    bgGradient: string;
    /** Indice visuel sous l'image */
    badgeLabel: string;
  };
}

export const KIDS_THEMES_META: {
  id: 'ALL' | KidsTheme;
  label: string;
  emoji: string;
  colorClass: string;
}[] = [
  {
    id: 'ALL',
    label: 'Tous',
    emoji: '🌟',
    colorClass: 'from-yellow-300 to-amber-500 text-slate-950 border-white',
  },
  {
    id: 'Ferme',
    label: 'Ferme',
    emoji: '🐄',
    colorClass: 'from-lime-400 to-emerald-500 text-slate-950 border-lime-200',
  },
  {
    id: 'Animaux',
    label: 'Animaux',
    emoji: '🦁',
    colorClass: 'from-amber-400 to-orange-500 text-slate-950 border-amber-200',
  },
  {
    id: 'JO',
    label: 'JO',
    emoji: '🏅',
    colorClass: 'from-sky-400 to-indigo-500 text-white border-sky-200',
  },
  {
    id: 'Sport',
    label: 'Sport',
    emoji: '⚽',
    colorClass: 'from-emerald-400 to-teal-600 text-white border-emerald-200',
  },
  {
    id: 'Pokémon',
    label: 'Pokémon',
    emoji: '⚡',
    colorClass: 'from-rose-500 to-amber-500 text-white border-yellow-200',
  },
  {
    id: 'Dinosaures',
    label: 'Dinosaures',
    emoji: '🦖',
    colorClass: 'from-green-500 to-emerald-700 text-white border-green-200',
  },
  {
    id: 'Espace',
    label: 'Espace',
    emoji: '🚀',
    colorClass: 'from-indigo-500 to-purple-700 text-white border-indigo-200',
  },
  {
    id: 'Disney & Contes',
    label: 'Disney & Contes',
    emoji: '🏰',
    colorClass: 'from-pink-400 to-fuchsia-600 text-white border-pink-200',
  },
];

export const KIDS_QUESTIONS: KidsQuestion[] = [
  // ============================================================================
  // THÈME 1 : LA FERME (🐄)
  // ============================================================================
  {
    id: 'kids-ferme-1',
    theme: 'Ferme',
    question: 'Regarde bien l’image : comment appelle-t-on le bébé de la vache ?',
    options: ['🐮 Le veau', '🐷 Le porcelet', '🐴 Le poulain', '🐑 L’agneau'],
    correct_index: 0,
    explanation:
      'Le bébé de la vache et du taureau s’appelle le veau ! Il boit le bon lait de sa maman.',
    visual: {
      specialSvg: 'farm_barn',
      mainEmoji: '🐄',
      decorEmojis: ['🌾', '🥛'],
      bgGradient: 'from-emerald-600 via-lime-600 to-green-800',
      badgeLabel: 'Dans le pré de la ferme',
    },
  },
  {
    id: 'kids-ferme-2',
    theme: 'Ferme',
    question:
      'Quel oiseau de la basse-cour chante « Cocorico ! » très tôt le matin pour réveiller la ferme ?',
    options: ['🦆 Le canard', '🐓 Le coq', '🦃 Le dindon', '🦢 L’oie'],
    correct_index: 1,
    explanation:
      'C’est le coq avec sa belle crête rouge sur la tête qui chante « Cocorico » dès que le soleil se lève !',
    visual: {
      mainEmoji: '🐓',
      decorEmojis: ['☀️', '🏠'],
      bgGradient: 'from-amber-500 via-orange-500 to-rose-600',
      badgeLabel: 'Le réveil de la ferme',
    },
  },
  {
    id: 'kids-ferme-3',
    theme: 'Ferme',
    question:
      'Que tond-on sur le dos du mouton au printemps pour fabriquer des pulls bien chauds ?',
    options: [
      '🪶 Des plumes',
      '🧶 De la laine',
      '🌿 Du coton',
      '🪹 De la paille',
    ],
    correct_index: 1,
    explanation:
      'Le mouton a un épais manteau de laine ! On le tond quand il commence à faire chaud, comme une coupe de cheveux.',
    visual: {
      mainEmoji: '🐑',
      decorEmojis: ['🧶', '🌼'],
      bgGradient: 'from-sky-500 via-teal-600 to-emerald-700',
      badgeLabel: 'Tout doux comme un nuage',
    },
  },
  {
    id: 'kids-ferme-4',
    theme: 'Ferme',
    question:
      'Quel gros véhicule à grandes roues aide le fermier à labourer les champs et tirer la remorque ?',
    options: [
      '🚜 Le tracteur',
      '🚒 Le camion de pompiers',
      '🚓 La voiture de police',
      '🚂 Le train',
    ],
    correct_index: 0,
    explanation:
      'Le tracteur a d’immenses pneus crantés à l’arrière pour rouler dans la terre et la boue sans jamais rester coincé !',
    visual: {
      mainEmoji: '🚜',
      decorEmojis: ['🌻', '🌾'],
      bgGradient: 'from-green-600 via-emerald-700 to-lime-800',
      badgeLabel: 'Les machines des champs',
    },
  },
  {
    id: 'kids-ferme-5',
    theme: 'Ferme',
    question:
      'Quel petit insecte jaune et noir butine les fleurs de la ferme pour fabriquer le miel dans sa ruche ?',
    options: [
      '🐞 La coccinelle',
      '🐝 L’abeille',
      '🦋 Le papillon',
      '🐜 La fourmi',
    ],
    correct_index: 1,
    explanation:
      'Les abeilles récoltent le nectar des fleurs et fabriquent le délicieux miel doré à l’intérieur de la ruche !',
    visual: {
      mainEmoji: '🐝',
      decorEmojis: ['🍯', '🌻'],
      bgGradient: 'from-yellow-500 via-amber-600 to-orange-700',
      badgeLabel: 'La ruche dorée',
    },
  },
  {
    id: 'kids-ferme-6',
    theme: 'Ferme',
    question:
      'Quel animal rose à la queue en tire-bouchon adore se rouler dans la boue pour se rafraîchir ?',
    options: ['🐷 Le cochon', '🐐 La chèvre', '🐇 Le lapin', '🐴 L’âne'],
    correct_index: 0,
    explanation:
      'Le cochon se roule dans la boue pour protéger sa peau rose du soleil et se rafraîchir quand il fait chaud !',
    visual: {
      mainEmoji: '🐖',
      decorEmojis: ['🐽', '🌿'],
      bgGradient: 'from-pink-500 via-rose-500 to-amber-700',
      badgeLabel: 'Groin-groin à la ferme !',
    },
  },
  {
    id: 'kids-ferme-7',
    theme: 'Ferme',
    question:
      'Où la poule pond-elle ses œufs bien au chaud sur la paille ?',
    options: [
      '🏠 Dans le poulailler',
      '🌊 Dans la mare',
      '🌲 En haut d’un sapin',
      '🕳️ Dans un terrier',
    ],
    correct_index: 0,
    explanation:
      'Les poules dorment sur un perchoir et pondent leurs œufs dans le nid douillet du poulailler !',
    visual: {
      mainEmoji: '🐔',
      decorEmojis: ['🥚', '🐣'],
      bgGradient: 'from-amber-600 via-yellow-600 to-orange-800',
      badgeLabel: 'Le coin du poulailler',
    },
  },
  {
    id: 'kids-ferme-8',
    theme: 'Ferme',
    question:
      'Quel légume orange qui pousse sous la terre est le repas préféré des lapins de la ferme ?',
    options: [
      '🥕 La carotte',
      '🍅 La tomate',
      '🍌 La banane',
      '🍓 La fraise',
    ],
    correct_index: 0,
    explanation:
      'Les lapins raffolent des carottes croquantes ainsi que de leurs fanes vertes et du bon foin !',
    visual: {
      mainEmoji: '🐰',
      decorEmojis: ['🥕', '🥬'],
      bgGradient: 'from-orange-500 via-amber-600 to-emerald-700',
      badgeLabel: 'Le potager du fermier',
    },
  },

  // ============================================================================
  // THÈME 2 : LES ANIMAUX (🦁)
  // ============================================================================
  {
    id: 'kids-animaux-1',
    theme: 'Animaux',
    question:
      'Quel animal de la savane possède le plus long cou du monde pour manger les feuilles tout en haut des arbres ?',
    options: [
      '🦓 Le zèbre',
      '🦒 La girafe',
      '🐘 L’éléphant',
      '🦛 L’hippopotame',
    ],
    correct_index: 1,
    explanation:
      'La girafe peut mesurer jusqu’à 5,5 mètres de haut, et sa langue bleue mesure presque 50 centimètres !',
    visual: {
      mainEmoji: '🦒',
      decorEmojis: ['🌳', '☀️'],
      bgGradient: 'from-amber-500 via-yellow-600 to-orange-700',
      badgeLabel: 'Géant de la savane',
    },
  },
  {
    id: 'kids-animaux-2',
    theme: 'Animaux',
    question:
      'Quel est l’animal terrestre le plus rapide du monde à la course ?',
    options: [
      '🐆 Le guépard',
      '🐢 La tortue',
      '🐼 Le panda',
      '🐻 L’ours brun',
    ],
    correct_index: 0,
    explanation:
      'Le guépard peut courir jusqu’à 110 km/h sur une courte distance, aussi vite qu’une voiture sur l’autoroute !',
    visual: {
      mainEmoji: '🐆',
      decorEmojis: ['💨', '⚡'],
      bgGradient: 'from-yellow-500 via-orange-600 to-red-700',
      badgeLabel: 'Sprinteur de la nature',
    },
  },
  {
    id: 'kids-animaux-3',
    theme: 'Animaux',
    question:
      'Que mange presque toute la journée le grand panda noir et blanc d’Asie ?',
    options: [
      '🎍 Du bambou',
      '🍕 Des pizzas',
      '🐟 Des sardines',
      '🌰 Des noisettes',
    ],
    correct_index: 0,
    explanation:
      'Le panda géant passe jusqu’à 14 heures par jour à croquer des tiges et des feuilles de bambou !',
    visual: {
      mainEmoji: '🐼',
      decorEmojis: ['🎍', '🌿'],
      bgGradient: 'from-emerald-600 via-teal-700 to-slate-800',
      badgeLabel: 'Forêt de bambous',
    },
  },
  {
    id: 'kids-animaux-4',
    theme: 'Animaux',
    question:
      'Quel animal d’Australie saute très haut sur ses pattes arrière et porte son bébé dans une poche sur le ventre ?',
    options: [
      '🦘 Le kangourou',
      '🦊 Le renard',
      '🐺 Le loup',
      '🦌 Le cerf',
    ],
    correct_index: 0,
    explanation:
      'Le bébé kangourou reste bien au chaud dans la poche ventrale de sa maman pendant plusieurs mois !',
    visual: {
      mainEmoji: '🦘',
      decorEmojis: ['🪃', '🏜️'],
      bgGradient: 'from-orange-500 via-red-600 to-amber-800',
      badgeLabel: 'Champion du saut en Australie',
    },
  },
  {
    id: 'kids-animaux-5',
    theme: 'Animaux',
    question:
      'Combien de bras (tentacules) possède une pieuvre au fond de l’océan ?',
    options: ['4 bras', '6 bras', '8 bras', '12 bras'],
    correct_index: 2,
    explanation:
      'La pieuvre (ou poulpe) possède 8 grands tentacules recouverts de ventouses et elle a même 3 cœurs !',
    visual: {
      mainEmoji: '🐙',
      decorEmojis: ['🌊', '🐚'],
      bgGradient: 'from-blue-600 via-indigo-700 to-purple-800',
      badgeLabel: 'Sous l’océan',
    },
  },
  {
    id: 'kids-animaux-6',
    theme: 'Animaux',
    question:
      'Quel est le plus grand et le plus lourd de tous les animaux qui vivent sur la planète Terre ?',
    options: [
      '🐋 La baleine bleue',
      '🐘 L’éléphant d’Afrique',
      '🦈 Le requin blanc',
      '🐻‍❄️ L’ours polaire',
    ],
    correct_index: 0,
    explanation:
      'La baleine bleue peut mesurer 30 mètres de long : c’est aussi long que trois bus scolaires mis bout à bout !',
    visual: {
      mainEmoji: '🐋',
      decorEmojis: ['🌊', '💧'],
      bgGradient: 'from-cyan-600 via-blue-700 to-indigo-900',
      badgeLabel: 'Géant des océans',
    },
  },
  {
    id: 'kids-animaux-7',
    theme: 'Animaux',
    question:
      'Quel drôle de lézard est capable de changer la couleur de sa peau et de bouger ses deux yeux dans des directions différentes ?',
    options: [
      '🦎 Le caméléon',
      '🐊 Le crocodile',
      '🐸 La grenouille',
      '🐍 Le serpent',
    ],
    correct_index: 0,
    explanation:
      'Le caméléon change de couleur selon son humeur et la lumière, et il attrape les insectes avec sa langue ultra-rapide !',
    visual: {
      mainEmoji: '🦎',
      decorEmojis: ['🌈', '🍃'],
      bgGradient: 'from-lime-500 via-emerald-600 to-purple-700',
      badgeLabel: 'Le roi du camouflage',
    },
  },
  {
    id: 'kids-animaux-8',
    theme: 'Animaux',
    question:
      'Comment l’éléphant utilise-t-il sa longue trompe au quotidien ?',
    options: [
      '💦 Pour respirer, sentir, attraper à manger et se doucher',
      '🎈 Pour s’envoler dans les airs',
      '🎸 Pour jouer de la guitare',
      '🔥 Pour cracher du feu',
    ],
    correct_index: 0,
    explanation:
      'La trompe de l’éléphant compte des milliers de muscles : elle lui sert de nez, de main et même de tuyau d’arrosage !',
    visual: {
      mainEmoji: '🐘',
      decorEmojis: ['💦', '🌿'],
      bgGradient: 'from-slate-600 via-sky-700 to-blue-900',
      badgeLabel: 'La trompe magique',
    },
  },

  // ============================================================================
  // THÈME 3 : LES JEUX OLYMPIQUES - JO (🏅)
  // ============================================================================
  {
    id: 'kids-jo-1',
    theme: 'JO',
    question:
      'Observe les anneaux olympiques sur l’image : combien y a-t-il d’anneaux sur le drapeau des Jeux Olympiques ?',
    options: ['3 anneaux', '5 anneaux', '7 anneaux', '10 anneaux'],
    correct_index: 1,
    explanation:
      'Il y a 5 anneaux entrelacés (bleu, jaune, noir, vert et rouge) qui représentent les 5 continents du monde réunis par le sport !',
    visual: {
      specialSvg: 'olympic_rings',
      mainEmoji: '🏅',
      decorEmojis: ['🌍', '✨'],
      bgGradient: 'from-blue-700 via-indigo-800 to-slate-900',
      badgeLabel: 'Le symbole des Jeux Olympiques',
    },
  },
  {
    id: 'kids-jo-2',
    theme: 'JO',
    question:
      'Quelle médaille reçoit le champion qui termine à la 1re place sur la plus haute marche du podium aux JO ?',
    options: [
      '🥇 La médaille d’Or',
      '🥈 La médaille d’Argent',
      '🥉 La médaille de Bronze',
      '🍫 La médaille en Chocolat',
    ],
    correct_index: 0,
    explanation:
      'Le 1er reçoit la médaille d’Or, le 2e la médaille d’Argent et le 3e la médaille de Bronze !',
    visual: {
      specialSvg: 'podium',
      mainEmoji: '🥇',
      decorEmojis: ['🥈', '🥉'],
      bgGradient: 'from-yellow-500 via-amber-600 to-blue-900',
      badgeLabel: 'Le Podium Olympique',
    },
  },
  {
    id: 'kids-jo-3',
    theme: 'JO',
    question:
      'Que se transmettent les coureurs de main en main jusqu’à la cérémonie d’ouverture des Jeux Olympiques ?',
    options: [
      '🔥 La flamme olympique',
      '🍦 Une glace à la vanille',
      '🎈 Un ballon de baudruche',
      '☂️ Un parapluie',
    ],
    correct_index: 0,
    explanation:
      'Allumée en Grèce à Olympie grâce aux rayons du soleil, la flamme olympique voyage de relais en relais pour allumer la grande vasque !',
    visual: {
      mainEmoji: '🔥',
      decorEmojis: ['🏛️', '🏃'],
      bgGradient: 'from-orange-500 via-red-600 to-indigo-900',
      badgeLabel: 'Le Relais de la Flamme',
    },
  },
  {
    id: 'kids-jo-4',
    theme: 'JO',
    question:
      'Dans quel bassin les nageurs comme Léon Marchand plongent-ils pour gagner des médailles aux JO ?',
    options: [
      '🏊 Dans une piscine olympique de 50 mètres',
      '🛁 Dans une petite baignoire',
      '🛷 Sur une piste de luge',
      '🏜️ Dans le sable du désert',
    ],
    correct_index: 0,
    explanation:
      'Une piscine olympique mesure 50 mètres de long avec 8 couloirs délimités par des lignes d’eau !',
    visual: {
      mainEmoji: '🏊‍♂️',
      decorEmojis: ['🌊', '🥇'],
      bgGradient: 'from-sky-500 via-blue-600 to-cyan-800',
      badgeLabel: 'Natation Olympique',
    },
  },
  {
    id: 'kids-jo-5',
    theme: 'JO',
    question:
      'Aux Jeux Olympiques d’hiver, sur quoi glissent les athlètes du ski et du patinage ?',
    options: [
      '❄️ Sur la neige et la glace',
      '🏖️ Sur le sable chaud',
      '🌿 Sur la pelouse',
      '☁️ Sur les nuages',
    ],
    correct_index: 0,
    explanation:
      'Les JO d’hiver regroupent les sports de neige (ski, snowboard, biathlon) et les sports de glace (patinage, hockey, luge) !',
    visual: {
      mainEmoji: '⛷️',
      decorEmojis: ['❄️', '🏔️'],
      bgGradient: 'from-cyan-500 via-sky-600 to-blue-900',
      badgeLabel: 'Jeux Olympiques d’Hiver',
    },
  },
  {
    id: 'kids-jo-6',
    theme: 'JO',
    question:
      'Quel équipement utilise l’archer aux Jeux Olympiques pour viser le centre jaune de la cible ?',
    options: [
      '🏹 Un arc et des flèches',
      '🎾 Une raquette de tennis',
      '🥊 Des gants de boxe',
      '🛹 Un skateboard',
    ],
    correct_index: 0,
    explanation:
      'Au tir à l’arc olympique, la cible est placée à 70 mètres et le centre jaune rapporte 10 points !',
    visual: {
      mainEmoji: '🏹',
      decorEmojis: ['🎯', '🏅'],
      bgGradient: 'from-emerald-600 via-teal-700 to-blue-900',
      badgeLabel: 'En plein dans le mille !',
    },
  },

  // ============================================================================
  // THÈME 4 : LE SPORT (⚽)
  // ============================================================================
  {
    id: 'kids-sport-1',
    theme: 'Sport',
    question:
      'Au football, quel est le seul joueur de l’équipe qui a le droit d’attraper le ballon avec ses mains dans sa surface ?',
    options: [
      '🧤 Le gardien de but',
      '👟 L’avant-centre',
      '🚩 L’arbitre de touche',
      '📣 L’entraîneur',
    ],
    correct_index: 0,
    explanation:
      'Le gardien de but porte des gants spéciaux et un maillot d’une couleur différente pour plonger et arrêter les tirs !',
    visual: {
      specialSvg: 'soccer_field',
      mainEmoji: '⚽',
      decorEmojis: ['🧤', '🥅'],
      bgGradient: 'from-emerald-500 via-green-600 to-teal-800',
      badgeLabel: 'Sur le terrain de foot',
    },
  },
  {
    id: 'kids-sport-2',
    theme: 'Sport',
    question:
      'Dans quel sport fait-on rebondir un gros ballon orange pour le lancer dans un panier accroché en hauteur ?',
    options: [
      '🏀 Le basket-ball',
      '🎳 Le bowling',
      '⛳ Le golf',
      '🏓 Le ping-pong',
    ],
    correct_index: 0,
    explanation:
      'Au basket-ball, le panier est fixé à 3,05 mètres de haut (2,60 m pour les enfants en mini-basket) !',
    visual: {
      mainEmoji: '🏀',
      decorEmojis: ['🗑️', '👟'],
      bgGradient: 'from-orange-500 via-amber-600 to-red-800',
      badgeLabel: 'Swish dans le panier !',
    },
  },
  {
    id: 'kids-sport-3',
    theme: 'Sport',
    question:
      'Quelle est la forme si particulière d’un ballon de rugby ?',
    options: [
      '🏉 Il est ovale (comme un œuf)',
      '🟦 Il est tout carré',
      '🔺 Il est en forme de triangle',
      '⭐ Il est en forme d’étoile',
    ],
    correct_index: 0,
    explanation:
      'Le ballon de rugby est ovale, ce qui permet de bien le tenir contre soi en courant mais rend ses rebonds très imprévisibles !',
    visual: {
      mainEmoji: '🏉',
      decorEmojis: ['🏟️', '💪'],
      bgGradient: 'from-blue-600 via-indigo-700 to-emerald-800',
      badgeLabel: 'Essai transformé !',
    },
  },
  {
    id: 'kids-sport-4',
    theme: 'Sport',
    question:
      'Au judo, que noue-t-on autour de sa taille sur son kimono (judogi) pour indiquer son niveau ?',
    options: [
      '🥋 Une ceinture de couleur',
      '🧣 Une écharpe en laine',
      '👑 Une couronne en or',
      '🎩 Un chapeau haut-de-forme',
    ],
    correct_index: 0,
    explanation:
      'Au judo, on commence avec la ceinture blanche, puis jaune, orange, verte, bleue, marron et enfin la célèbre ceinture noire !',
    visual: {
      mainEmoji: '🥋',
      decorEmojis: ['🏅', '🤝'],
      bgGradient: 'from-indigo-600 via-blue-700 to-slate-900',
      badgeLabel: 'Sur le tatami',
    },
  },
  {
    id: 'kids-sport-5',
    theme: 'Sport',
    question:
      'Que doit-on obligatoirement porter sur la tête quand on fait du vélo pour bien se protéger ?',
    options: [
      '🪖 Un casque',
      '🕶️ Des lunettes de plage',
      '👑 Une couronne en papier',
      '🎧 Un gros casque de musique',
    ],
    correct_index: 0,
    explanation:
      'Tous les grands champions cyclistes portent un casque bien attaché pour protéger leur tête en cas de chute !',
    visual: {
      mainEmoji: '🚴',
      decorEmojis: ['🪖', '💛'],
      bgGradient: 'from-yellow-500 via-amber-500 to-emerald-700',
      badgeLabel: 'En route sur le vélo',
    },
  },
  {
    id: 'kids-sport-6',
    theme: 'Sport',
    question:
      'Avec quoi frappe-t-on la petite balle jaune par-dessus le filet au tennis ?',
    options: [
      '🎾 Avec une raquette',
      '🧹 Avec un balai',
      '🍳 Avec une poêle à crêpes',
      '🦶 Avec les pieds',
    ],
    correct_index: 0,
    explanation:
      'Les joueurs de tennis utilisent une raquette cordée pour envoyer la balle jaune de l’autre côté du filet !',
    visual: {
      mainEmoji: '🎾',
      decorEmojis: ['🏆', '👟'],
      bgGradient: 'from-lime-500 via-emerald-600 to-sky-800',
      badgeLabel: 'Jeu, set et match !',
    },
  },

  // ============================================================================
  // THÈME 5 : POKÉMON (⚡ IMAGES OFFICIELLES)
  // ============================================================================
  {
    id: 'kids-pokemon-1',
    theme: 'Pokémon',
    question:
      'Regarde cette image : quel est ce célèbre Pokémon jaune de type Électrik, meilleur ami de Sacha ?',
    options: [
      '⚡ Pikachu',
      '🔥 Salamèche',
      '💧 Carapuce',
      '🌱 Bulbizarre',
    ],
    correct_index: 0,
    explanation:
      'C’est Pikachu ! Ses joues rouges stockent de l’électricité et sa queue a la forme d’un éclair.',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png',
      mainEmoji: '⚡',
      decorEmojis: ['💛', '✨'],
      bgGradient: 'from-yellow-400 via-amber-500 to-orange-600',
      badgeLabel: 'Pokédex #025 · Type Électrik',
    },
  },
  {
    id: 'kids-pokemon-2',
    theme: 'Pokémon',
    question:
      'Quel est ce Pokémon de type Feu qui a toujours une petite flamme allumée au bout de la queue ?',
    options: [
      '🔥 Salamèche',
      '🐢 Carapuce',
      '💤 Ronflex',
      '🎵 Rondoudou',
    ],
    correct_index: 0,
    explanation:
      'Salamèche a une flamme au bout de la queue qui brille fort quand il est en pleine forme ! Il évolue en Reptincel puis en Dracaufeu.',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/4.png',
      mainEmoji: '🔥',
      decorEmojis: ['🧡', '🌋'],
      bgGradient: 'from-orange-500 via-red-500 to-amber-700',
      badgeLabel: 'Pokédex #004 · Type Feu',
    },
  },
  {
    id: 'kids-pokemon-3',
    theme: 'Pokémon',
    question:
      'Reconnais-tu cette petite tortue bleue de type Eau qui lance le Pistolet à O ?',
    options: [
      '💧 Carapuce',
      '🌱 Bulbizarre',
      '⚡ Pikachu',
      '🦊 Évoli',
    ],
    correct_index: 0,
    explanation:
      'Carapuce se cache dans sa carapace pour se protéger et projette de l’eau à toute vitesse !',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/7.png',
      mainEmoji: '💧',
      decorEmojis: ['🐢', '🌊'],
      bgGradient: 'from-sky-400 via-blue-500 to-indigo-700',
      badgeLabel: 'Pokédex #007 · Type Eau',
    },
  },
  {
    id: 'kids-pokemon-4',
    theme: 'Pokémon',
    question:
      'Quel est ce Pokémon de type Plante qui porte un gros bourgeon vert sur son dos ?',
    options: [
      '🌱 Bulbizarre',
      '🔥 Salamèche',
      '👻 Ectoplasma',
      '🐱 Miaouss',
    ],
    correct_index: 0,
    explanation:
      'Bulbizarre est le numéro 001 du Pokédex ! La graine sur son dos grandit avec lui quand il évolue en Herbizarre puis Florizarre.',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png',
      mainEmoji: '🌱',
      decorEmojis: ['🍃', '🌺'],
      bgGradient: 'from-emerald-400 via-green-600 to-teal-800',
      badgeLabel: 'Pokédex #001 · Type Plante',
    },
  },
  {
    id: 'kids-pokemon-5',
    theme: 'Pokémon',
    question:
      'Quel est cet adorable Pokémon marron aux longues oreilles capable d’évoluer en 8 Pokémon différents (Aquali, Voltali, Pyroli…) ?',
    options: [
      '🦊 Évoli',
      '⚡ Pikachu',
      '🦆 Psykokwak',
      '🐧 Tiplouf',
    ],
    correct_index: 0,
    explanation:
      'Évoli possède huit évolutions différentes selon la pierre ou l’environnement : Aquali, Voltali, Pyroli, Mentali, Noctali, Phyllali, Givrali et Nymphali !',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png',
      mainEmoji: '🦊',
      decorEmojis: ['✨', '🌈'],
      bgGradient: 'from-amber-500 via-orange-600 to-yellow-800',
      badgeLabel: 'Pokédex #133 · Pokémon Évolutif',
    },
  },
  {
    id: 'kids-pokemon-6',
    theme: 'Pokémon',
    question:
      'Quel est ce géant Pokémon gourmand qui passe ses journées à manger et à dormir au milieu des routes ?',
    options: [
      '💤 Ronflex',
      '🎵 Rondoudou',
      '🐉 Dracaufeu',
      '🔮 Mewtwo',
    ],
    correct_index: 0,
    explanation:
      'Ronflex pèse 460 kilos ! Il ne se réveille que pour manger 400 kilos de nourriture par jour ou quand il entend la Poké Flûte.',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png',
      mainEmoji: '💤',
      decorEmojis: ['🍎', '🌙'],
      bgGradient: 'from-teal-600 via-slate-700 to-blue-900',
      badgeLabel: 'Pokédex #143 · Le Roi de la Sieste',
    },
  },
  {
    id: 'kids-pokemon-7',
    theme: 'Pokémon',
    question:
      'Quel est ce petit Pokémon tout rond et rose qui adore chanter une berceuse endormant tout le monde ?',
    options: [
      '🎵 Rondoudou',
      '⭐ Mélofée',
      '🐱 Miaouss',
      '💧 Carapuce',
    ],
    correct_index: 0,
    explanation:
      'Quand Rondoudou chante sa berceuse, tous ceux qui l’écoutent s’endorment… et il se fâche en leur dessinant sur le visage !',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/39.png',
      mainEmoji: '🎵',
      decorEmojis: ['🎤', '💗'],
      bgGradient: 'from-pink-400 via-rose-500 to-purple-700',
      badgeLabel: 'Pokédex #039 · Chanteur Rose',
    },
  },
  {
    id: 'kids-pokemon-8',
    theme: 'Pokémon',
    question:
      'Quel est ce grand dragon ailé cracheur de feu, dernière évolution de Salamèche ?',
    options: [
      '🐉 Dracaufeu',
      '🌊 Tortank',
      '🌿 Florizarre',
      '⚡ Électhor',
    ],
    correct_index: 0,
    explanation:
      'Dracaufeu vole dans le ciel à la recherche d’adversaires puissants et son souffle brûlant peut faire fondre des rochers !',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png',
      mainEmoji: '🐉',
      decorEmojis: ['🔥', '🌋'],
      bgGradient: 'from-red-500 via-orange-600 to-amber-700',
      badgeLabel: 'Pokédex #006 · Type Feu & Vol',
    },
  },
  {
    id: 'kids-pokemon-9',
    theme: 'Pokémon',
    question:
      'Quel est ce Pokémon chat avec une pièce dorée sur le front qui sait parler comme les humains dans la Team Rocket ?',
    options: [
      '🐱 Miaouss',
      '🦊 Goupix',
      '🐶 Caninos',
      '🐭 Rattata',
    ],
    correct_index: 0,
    explanation:
      'Miaouss accompagne toujours Jessie et James de la Team Rocket et adore tout ce qui brille !',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/52.png',
      mainEmoji: '🐱',
      decorEmojis: ['🪙', '🚀'],
      bgGradient: 'from-amber-400 via-yellow-600 to-purple-800',
      badgeLabel: 'Pokédex #052 · Team Rocket',
    },
  },
  {
    id: 'kids-pokemon-10',
    theme: 'Pokémon',
    question:
      'Quel est ce Pokémon canard jaune qui se tient toujours la tête parce qu’il a mal au crâne ?',
    options: [
      '🦆 Psykokwak',
      '🐧 Tiplouf',
      '🦀 Krabby',
      '⭐ Stari',
    ],
    correct_index: 0,
    explanation:
      'Psykokwak a souvent la migraine, mais quand son mal de tête devient très fort, il libère d’incroyables pouvoirs psychiques !',
    visual: {
      imageUrl:
        'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/54.png',
      mainEmoji: '🦆',
      decorEmojis: ['💫', '💧'],
      bgGradient: 'from-yellow-400 via-sky-500 to-blue-700',
      badgeLabel: 'Pokédex #054 · Pokémon Canard',
    },
  },

  // ============================================================================
  // THÈME 6 : LES DINOSAURES (🦖)
  // ============================================================================
  {
    id: 'kids-dino-1',
    theme: 'Dinosaures',
    question:
      'Quel est le plus célèbre des dinosaures carnivores avec d’énormes dents et deux tout petits bras ?',
    options: [
      '🦖 Le Tyrannosaure (T-Rex)',
      '🦕 Le Diplodocus',
      '🐢 La Tortue géante',
      '🐊 Le Crocodile',
    ],
    correct_index: 0,
    explanation:
      'Le Tyrannosaure Rex (ou T-Rex) signifie « Roi des lézards tyrans » : ses dents étaient grandes comme des bananes !',
    visual: {
      mainEmoji: '🦖',
      decorEmojis: ['🌋', '🦴'],
      bgGradient: 'from-emerald-600 via-green-700 to-stone-800',
      badgeLabel: 'Le Roi des Dinosaures',
    },
  },
  {
    id: 'kids-dino-2',
    theme: 'Dinosaures',
    question:
      'Quel grand dinosaure herbivore marchait à quatre pattes avec un très long cou pour manger en haut des arbres ?',
    options: [
      '🦕 Le Diplodocus (ou Brachiosaure)',
      '🦖 Le Vélociraptor',
      '🦅 Le Ptérodactyle',
      '🦈 Le Mégalodon',
    ],
    correct_index: 0,
    explanation:
      'Avec son immense cou et sa longue queue, le Diplodocus ne mangeait que des plantes et des feuilles d’arbres !',
    visual: {
      mainEmoji: '🦕',
      decorEmojis: ['🌿', '🌴'],
      bgGradient: 'from-lime-500 via-emerald-600 to-teal-800',
      badgeLabel: 'Le Géant au long cou',
    },
  },
  {
    id: 'kids-dino-3',
    theme: 'Dinosaures',
    question:
      'Combien de cornes le Tricératops avait-il sur la tête pour se défendre ?',
    options: [
      '1 seule corne',
      '3 cornes',
      '10 cornes',
      'Aucune corne',
    ],
    correct_index: 1,
    explanation:
      '« Tricératops » veut dire « tête à trois cornes » : il avait deux grandes cornes au-dessus des yeux et une petite sur le museau !',
    visual: {
      mainEmoji: '🦕',
      decorEmojis: ['🛡️', '🌿'],
      bgGradient: 'from-amber-600 via-emerald-700 to-green-900',
      badgeLabel: 'Le bouclier à 3 cornes',
    },
  },
  {
    id: 'kids-dino-4',
    theme: 'Dinosaures',
    question:
      'Comment naissaient les bébés dinosaures il y a des millions d’années ?',
    options: [
      '🥚 Ils sortaient d’un œuf',
      '🌸 Ils poussaient dans les fleurs',
      '☁️ Ils tombaient des nuages',
      '🐚 Ils sortaient d’un coquillage',
    ],
    correct_index: 0,
    explanation:
      'Comme les oiseaux et les crocodiles d’aujourd’hui, toutes les mamans dinosaures pondaient des œufs dans des nids !',
    visual: {
      mainEmoji: '🥚',
      decorEmojis: ['🦖', '🌿'],
      bgGradient: 'from-yellow-500 via-lime-600 to-emerald-800',
      badgeLabel: 'Le nid des bébés dinos',
    },
  },
  {
    id: 'kids-dino-5',
    theme: 'Dinosaures',
    question:
      'Comment appelle-t-on les os de dinosaures transformés en pierre que les scientifiques déterrent avec un pinceau ?',
    options: [
      '🦴 Des fossiles',
      '💎 Des diamants',
      '🍬 Des bonbons',
      '🧱 Des briques Lego',
    ],
    correct_index: 0,
    explanation:
      'Les paléontologues fouillent la terre et la roche pour découvrir des fossiles : des squelettes et des empreintes de pas de dinosaures !',
    visual: {
      mainEmoji: '🦴',
      decorEmojis: ['🔍', '⛏️'],
      bgGradient: 'from-amber-600 via-stone-600 to-slate-800',
      badgeLabel: 'Fouilles préhistoriques',
    },
  },

  // ============================================================================
  // THÈME 7 : L’ESPACE (🚀)
  // ============================================================================
  {
    id: 'kids-espace-1',
    theme: 'Espace',
    question:
      'Dans quel engin géant qui crache du feu les astronautes décollent-ils pour aller dans l’espace ?',
    options: [
      '🚀 Une fusée',
      '⛵ Un bateau à voiles',
      '🚜 Un tracteur',
      '🛴 Une trottinette',
    ],
    correct_index: 0,
    explanation:
      '3, 2, 1… Décollage ! La fusée propulse les astronautes très vite au-dessus des nuages jusque dans l’espace !',
    visual: {
      mainEmoji: '🚀',
      decorEmojis: ['✨', '🪐'],
      bgGradient: 'from-indigo-600 via-purple-700 to-slate-900',
      badgeLabel: '3, 2, 1… Décollage !',
    },
  },
  {
    id: 'kids-espace-2',
    theme: 'Espace',
    question:
      'Sur quelle planète toute bleue recouverte d’océans habitons-nous ?',
    options: [
      '🌍 La planète Terre',
      '🔴 La planète Mars',
      '☀️ Le Soleil',
      '🌙 La Lune',
    ],
    correct_index: 0,
    explanation:
      'Nous habitons sur la Terre ! On l’appelle la « planète bleue » parce qu’elle est recouverte de grands océans.',
    visual: {
      mainEmoji: '🌍',
      decorEmojis: ['🌊', '☁️'],
      bgGradient: 'from-sky-500 via-blue-700 to-indigo-950',
      badgeLabel: 'Notre belle Planète Bleue',
    },
  },
  {
    id: 'kids-espace-3',
    theme: 'Espace',
    question:
      'Quelle est cette magnifique planète entourée de grands anneaux brillants ?',
    options: [
      '🪐 Saturne',
      '🌍 La Terre',
      '☀️ Le Soleil',
      '☄️ Une comète',
    ],
    correct_index: 0,
    explanation:
      'Saturne est célèbre pour ses immenses anneaux faits de milliards de morceaux de glace et de poussière qui tournent autour d’elle !',
    visual: {
      mainEmoji: '🪐',
      decorEmojis: ['✨', '🌌'],
      bgGradient: 'from-purple-600 via-indigo-700 to-amber-700',
      badgeLabel: 'Le Seigneur des Anneaux de l’espace',
    },
  },
  {
    id: 'kids-espace-4',
    theme: 'Espace',
    question:
      'Quel astre brille dans le ciel la nuit et change de forme (croissant ou toute ronde) en tournant autour de la Terre ?',
    options: [
      '🌙 La Lune',
      '🌈 L’arc-en-ciel',
      '🌩️ L’éclair',
      '🎈 Une montgolfière',
    ],
    correct_index: 0,
    explanation:
      'La Lune tourne autour de la Terre ! Des astronautes ont même marché dessus en laissant leurs empreintes de bottes dans la poussière.',
    visual: {
      mainEmoji: '🌙',
      decorEmojis: ['⭐', '👨‍🚀'],
      bgGradient: 'from-slate-700 via-indigo-800 to-blue-950',
      badgeLabel: 'Clair de Lune',
    },
  },
  {
    id: 'kids-espace-5',
    theme: 'Espace',
    question:
      'Quelle énorme boule de feu toute jaune nous éclaire et nous réchauffe pendant la journée ?',
    options: [
      '☀️ Le Soleil',
      '❄️ Un flocon de neige',
      '🔦 Une lampe de poche',
      '🕯️ Une bougie',
    ],
    correct_index: 0,
    explanation:
      'Le Soleil est l’étoile au centre de notre système solaire : toutes les planètes comme la Terre tournent autour de lui !',
    visual: {
      mainEmoji: '☀️',
      decorEmojis: ['🌻', '✨'],
      bgGradient: 'from-yellow-400 via-orange-500 to-red-700',
      badgeLabel: 'Notre étoile le Soleil',
    },
  },

  // ============================================================================
  // THÈME 8 : DISNEY & CONTES (🏰)
  // ============================================================================
  {
    id: 'kids-disney-1',
    theme: 'Disney & Contes',
    question:
      'Dans « La Reine des Neiges », comment s’appelle le petit bonhomme de neige rigolo qui rêve de l’été et a une carotte guise de nez ?',
    options: [
      '⛄ Olaf',
      '🦌 Sven',
      '🦁 Simba',
      '🧞 Le Génie',
    ],
    correct_index: 0,
    explanation:
      'Olaf a été créé par la magie d’Elsa : il adore les gros câlins chaleureux et chanter sous le soleil !',
    visual: {
      mainEmoji: '⛄',
      decorEmojis: ['❄️', '🥕'],
      bgGradient: 'from-cyan-400 via-sky-500 to-indigo-800',
      badgeLabel: 'La Reine des Neiges',
    },
  },
  {
    id: 'kids-disney-2',
    theme: 'Disney & Contes',
    question:
      'Quel jeune lionceau devient le roi de la Terre des Lions avec ses amis Timon et Pumbaa en chantant « Hakuna Matata » ?',
    options: [
      '🦁 Simba',
      '🐘 Dumbo',
      '🦌 Bambi',
      '🐻 Baloo',
    ],
    correct_index: 0,
    explanation:
      'Dans « Le Roi Lion », Simba grandit dans la jungle avec le suricate Timon et le phacochère Pumbaa !',
    visual: {
      mainEmoji: '🦁',
      decorEmojis: ['👑', '🌅'],
      bgGradient: 'from-amber-500 via-orange-600 to-red-800',
      badgeLabel: 'Le Roi Lion',
    },
  },
  {
    id: 'kids-disney-3',
    theme: 'Disney & Contes',
    question:
      'Que se passe-t-il sur le visage du pantin de bois Pinocchio à chaque fois qu’il dit un mensonge ?',
    options: [
      '👃 Son nez s’allonge',
      '👂 Ses oreilles deviennent bleues',
      '🎩 Son chapeau s’envole',
      '🦷 Ses dents brillent dans le noir',
    ],
    correct_index: 0,
    explanation:
      'Fabriqué par Geppetto, Pinocchio voit son nez en bois grandir dès qu’il ment à la Fée Bleue !',
    visual: {
      mainEmoji: '🤥',
      decorEmojis: ['🪵', '✨'],
      bgGradient: 'from-amber-600 via-rose-600 to-indigo-800',
      badgeLabel: 'Le pantin de bois',
    },
  },
  {
    id: 'kids-disney-4',
    theme: 'Disney & Contes',
    question:
      'Que perd Cendrillon dans l’escalier du château en s’enfuyant aux douze coups de minuit ?',
    options: [
      '👠 Sa pantoufle de verre',
      '🎒 Son cartable d’école',
      '☂️ Son parapluie rose',
      '🚲 Son vélo',
    ],
    correct_index: 0,
    explanation:
      'À minuit, le carrosse redevient une citrouille, mais le Prince retrouve Cendrillon grâce à sa pantoufle de verre !',
    visual: {
      mainEmoji: '👠',
      decorEmojis: ['🏰', '🎃'],
      bgGradient: 'from-pink-500 via-fuchsia-600 to-indigo-900',
      badgeLabel: 'Les 12 coups de minuit',
    },
  },
  {
    id: 'kids-disney-5',
    theme: 'Disney & Contes',
    question:
      'Que frotte Aladdin dans la Caverne aux Merveilles pour faire sortir le grand Génie bleu ?',
    options: [
      '🪔 Une lampe magique',
      '🍎 Une pomme rouge',
      '🎸 Une guitare électrique',
      '⚽ Un ballon de foot',
    ],
    correct_index: 0,
    explanation:
      'En frottant la lampe magique dorée, Aladdin libère le Génie qui lui accorde trois vœux et l’emmène sur le tapis volant !',
    visual: {
      mainEmoji: '🪔',
      decorEmojis: ['🧞', '✨'],
      bgGradient: 'from-indigo-600 via-purple-600 to-amber-600',
      badgeLabel: 'Trois vœux magiques',
    },
  },
];

