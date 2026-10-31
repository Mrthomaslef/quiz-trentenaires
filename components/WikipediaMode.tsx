'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Scoreboard, { type PlayerScore } from './Scoreboard';
import {
  Globe,
  Sparkles,
  Eye,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Search,
  Shuffle,
  Award,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  X,
  Move,
  Grid,
  RefreshCw,
  Users,
  User,
  HelpCircle,
  BookOpen,
} from 'lucide-react';
import {
  playCorrectSound,
  playWrongSound,
  playPointSound,
  playJokerSound,
} from '@/lib/sound';

export type WikiSourceMode = 'mix' | 'popular' | 'random';

export interface WikiPageChallenge {
  pageid: number | string;
  title: string;
  cleanTitle: string; // Title without parenthetical disambiguation e.g. "Avatar (film)" -> "Avatar"
  imageUrl: string;
  description: string;
  extract: string;
  pageUrl: string;
  options: string[]; // 4 shuffled Wikipedia titles including `title`
  correctIndex: number;
  sourceType: 'random' | 'popular';
  categories?: string[];
  enrichedCloseOptions?: boolean;
}

interface WikipediaModeProps {
  teams: PlayerScore[];
  teamMode: '2_couples' | '4_players';
  onToggleTeamMode: () => void;
  onUpdateScore: (id: string, delta: number) => void;
  onRenameTeam: (id: string, newName: string) => void;
  lastScoredId: string | null;
  soundEnabled: boolean;
}

interface WikiThematicCluster {
  id: string;
  keywords: RegExp;
  titles: string[];
}

/**
 * Groupes thématiques fins sur Wikipédia FR :
 * Permet de proposer 3 distracteurs de même nature (même catégorie de monument, d'animal, de personnalité, etc.)
 * très proches de la vraie réponse.
 */
const WIKI_THEMATIC_CLUSTERS: WikiThematicCluster[] = [
  {
    id: 'monuments_france',
    keywords: /(monument historique|château|cathédrale|abbaye|église|fortification|pont|tour|architecture.*france|paris|normandie|loire)/i,
    titles: [
      'Tour Eiffel',
      'Mont Saint-Michel',
      'Château de Versailles',
      'Cathédrale Notre-Dame de Paris',
      'Pont du Gard',
      'Château de Chambord',
      'Cité de Carcassonne',
      'Fort Boyard',
      'Arc de triomphe de l\'Étoile',
      'Basilique du Sacré-Cœur de Montmartre',
      'Viaduc de Millau',
      'Palais des papes d\'Avignon',
      'Château de Chenonceau',
      'Arènes de Nîmes',
      'Panthéon (Paris)',
    ],
  },
  {
    id: 'merveilles_antiques_monde',
    keywords: /(archéologique|mausolée|temple|amphithéâtre|pyramide|ruines|patrimoine mondial|antique|inca|maya|romain|égypte|inde)/i,
    titles: [
      'Colisée',
      'Taj Mahal',
      'Machu Picchu',
      'Grande Muraille',
      'Pyramide de Khéops',
      'Pétra',
      'Acropole d\'Athènes',
      'Stonehenge',
      'Chichén Itzá',
      'Angkor Wat',
      'Alhambra (Grenade)',
      'Moaï',
      'Sainte-Sophie (Istanbul)',
      'Panthéon (Rome)',
      'Abou Simbel',
    ],
  },
  {
    id: 'architecture_moderne_monde',
    keywords: /(gratte-ciel|pont suspendu|statue|opéra|horloge|tour|édifice|architecture moderne|new york|londres|barcelone|sydney)/i,
    titles: [
      'Statue de la Liberté',
      'Christ Rédempteur',
      'Opéra de Sydney',
      'Golden Gate Bridge',
      'Big Ben',
      'Sagrada Família',
      'Tour de Pise',
      'Mont Rushmore',
      'Empire State Building',
      'Burj Khalifa',
      'Tower Bridge',
      'Atomium',
    ],
  },
  {
    id: 'sites_naturels_volcans',
    keywords: /(montagne|sommet|volcan|canyon|chute d'eau|cascade|dune|désert|grotte|phénomène|aurore|éclipse|géologie)/i,
    titles: [
      'Dune du Pilat',
      'Mont Blanc',
      'Grand Canyon',
      'Chutes du Niagara',
      'Mont Fuji',
      'Aurore polaire',
      'Éclipse solaire',
      'Vésuve',
      'Pompéi',
      'Grotte de Lascaux',
      'Etna',
      'Kilimandjaro',
      'Baie d\'Along',
      'Uluru',
    ],
  },
  {
    id: 'animaux_insolites',
    keywords: /(mammifère|rongeur|marsupial|monotrème|amphibien|reptile|lézard|endémique|australie|animal)/i,
    titles: [
      'Ornithorynque',
      'Axolotl',
      'Tardigrade',
      'Caméléon',
      'Pangolin',
      'Capibara',
      'Quokka',
      'Raton laveur',
      'Suricate',
      'Échidné',
      'Tatou',
      'Paresseux',
      'Okapi',
      'Lémur catta',
    ],
  },
  {
    id: 'grands_animaux_marins_oiseaux',
    keywords: /(ursidé|cétacé|oiseau|manchot|céphalopode|marin|océan|forêt|bambou|carnivore)/i,
    titles: [
      'Panda géant',
      'Koala',
      'Toucan',
      'Flamant rose',
      'Manchot empereur',
      'Baleine bleue',
      'Narval',
      'Pieuvre',
      'Panda roux',
      'Ours polaire',
      'Orque',
      'Paon bleu',
    ],
  },
  {
    id: 'animaux_prehistoriques_disparus',
    keywords: /(dinosaure|préhistoire|fossile|espèce disparue|éteint|pléistocène|crétacé|jurassique)/i,
    titles: [
      'Dodo',
      'Tyrannosaurus',
      'Mammouth laineux',
      'Triceratops',
      'Smilodon',
      'Diplodocus',
      'Vélociraptor',
      'Thylacine',
      'Ptérodactyle',
      'Mégalodon',
    ],
  },
  {
    id: 'dirigeants_histoire',
    keywords: /(empereur|roi|reine|pharaon|monarque|homme d'état|président|général|histoire de france)/i,
    titles: [
      'Napoléon Ier',
      'Cléopâtre VII',
      'Louis XIV',
      'Jules César',
      'Jeanne d\'Arc',
      'Charlemagne',
      'François Ier',
      'Marie-Antoinette d\'Autriche',
      'Vercingétorix',
      'Henri IV (roi de France)',
      'Louis XVI',
      'Alexandre le Grand',
    ],
  },
  {
    id: 'scientifiques_explorateurs',
    keywords: /(physicien|chimiste|scientifique|astronaute|spationaute|mathématicien|inventeur|biologiste|astronome|prix nobel)/i,
    titles: [
      'Albert Einstein',
      'Marie Curie',
      'Léonard de Vinci',
      'Thomas Pesquet',
      'Louis Pasteur',
      'Galilée (savant)',
      'Isaac Newton',
      'Nikola Tesla',
      'Charles Darwin',
      'Stephen Hawking',
      'Neil Armstrong',
      'Gustave Eiffel',
    ],
  },
  {
    id: 'ecrivains_philosophes',
    keywords: /(écrivain|romancier|poète|dramaturge|philosophe|littérature|auteur|académie française)/i,
    titles: [
      'Molière',
      'Victor Hugo',
      'Jules Verne',
      'William Shakespeare',
      'Voltaire',
      'Émile Zola',
      'Alexandre Dumas',
      'Marcel Proust',
      'Albert Camus',
      'Jean de La Fontaine',
      'Charles Baudelaire',
      'Honoré de Balzac',
    ],
  },
  {
    id: 'peintres_artistes',
    keywords: /(peintre|artiste|sculpteur|impressionnisme|surréalisme|cubisme|renaissance)/i,
    titles: [
      'Frida Kahlo',
      'Vincent van Gogh',
      'Pablo Picasso',
      'Claude Monet',
      'Salvador Dalí',
      'Michel-Ange',
      'Rembrandt',
      'Henri Matisse',
      'Auguste Rodin',
      'Paul Cézanne',
      'Édouard Manet',
      'Edgar Degas',
    ],
  },
  {
    id: 'tableaux_celebres',
    keywords: /(tableau|peinture|huile sur toile|œuvre|musée du louvre|musée d'orsay)/i,
    titles: [
      'La Joconde',
      'La Nuit étoilée',
      'Le Cri',
      'Guernica',
      'La Liberté guidant le peuple',
      'La Jeune Fille à la perle',
      'La Naissance de Vénus (Botticelli)',
      'Les Tournesols',
      'Le Radeau de la Méduse',
      'La Persistance de la mémoire',
      'Impression, soleil levant',
      'Les Noces de Cana',
    ],
  },
  {
    id: 'sculptures_archeologie',
    keywords: /(sculpture|statue|marbre|bronze|artéfact|archéologie|antiquité|stèle|masque)/i,
    titles: [
      'Le Penseur',
      'Vénus de Milo',
      'Masque de Toutânkhamon',
      'Pierre de Rosette',
      'Victoire de Samothrace',
      'David (Michel-Ange)',
      'Buste de Néfertiti',
      'Armée de terre cuite',
      'Code de Hammurabi',
      'Discobole',
    ],
  },
  {
    id: 'icones_spectacle_sport',
    keywords: /(acteur|actrice|chanteur|chanteuse|musicien|footballeur|sportif|cinéma|pop|rock)/i,
    titles: [
      'Charlie Chaplin',
      'Marilyn Monroe',
      'Michael Jackson',
      'Zinédine Zidane',
      'Elvis Presley',
      'Freddie Mercury',
      'Pelé',
      'Mohamed Ali',
      'Édith Piaf',
      'Bob Marley',
      'Audrey Hepburn',
      'Bruce Lee',
    ],
  },
  {
    id: 'espace_aviation_navires',
    keywords: /(avion|paquebot|navire|bateau|mission spatiale|station spatiale|télescope|fusée|aérospatiale|nasa)/i,
    titles: [
      'Titanic',
      'Concorde (avion)',
      'Apollo 11',
      'Station spatiale internationale',
      'Télescope spatial James-Webb',
      'Spoutnik 1',
      'Airbus A380',
      'Fusée Ariane',
      'Dirigeable Hindenburg',
      'Belem',
      'Hermione (frégate)',
      'Curiosity (astromobile)',
    ],
  },
  {
    id: 'trains_voitures_motos',
    keywords: /(train|automobile|voiture|scooter|moto|véhicule|transport ferroviaire|constructeur)/i,
    titles: [
      'TGV',
      'Citroën 2CV',
      'Vespa',
      'Volkswagen Coccinelle',
      'Citroën DS',
      'Orient-Express',
      'Ford Mustang',
      'Renault 4L',
      'Harley-Davidson',
      'Solex',
      'Eurostar',
    ],
  },
  {
    id: 'objets_retro_tech',
    keywords: /(console|jeu|jouet|casse-tête|électronique|informatique|télécommunications|baladeur|appareil)/i,
    titles: [
      'Rubik\'s Cube',
      'Game Boy',
      'Minitel',
      'Walkman',
      'Tamagotchi',
      'Polaroid',
      'Disquette',
      'Cassette audio',
      'Jukebox',
      'Flipper',
      'Furby',
    ],
  },
  {
    id: 'gastronomie_francaise',
    keywords: /(cuisine française|pâtisserie|viennoiserie|fromage|pain|plat traditionnel|gastronomie|recette)/i,
    titles: [
      'Croissant (viennoiserie)',
      'Baguette de pain',
      'Ratatouille',
      'Fondue savoyarde',
      'Macaron',
      'Camembert de Normandie',
      'Cassoulet',
      'Quiche lorraine',
      'Raclette',
      'Bouillabaisse',
      'Bœuf bourguignon',
      'Gratin dauphinois',
      'Tarte Tatin',
    ],
  },
  {
    id: 'plats_monde',
    keywords: /(cuisine japonaise|cuisine italienne|spécialité culinaire|plat|mets)/i,
    titles: [
      'Sushi',
      'Pizza',
      'Paella',
      'Couscous',
      'Ramen',
      'Tacos',
      'Poutine',
      'Pad thaï',
      'Tiramisu',
      'Houmous',
      'Fish and chips',
    ],
  },
  {
    id: 'evenements_sportifs',
    keywords: /(compétition|tournoi|championnat|course cycliste|tennis|football|olympique)/i,
    titles: [
      'Tour de France',
      'Coupe du monde de football',
      'Jeux olympiques',
      'Roland-Garros',
      '24 Heures du Mans',
      'Tournoi des Six Nations',
      'Vendée Globe',
      'Super Bowl',
      'Ligue des champions de l\'UEFA',
      'Paris-Roubaix',
    ],
  },
  {
    id: 'bd_franco_belge',
    keywords: /(bande dessinée|personnage de fiction|comics|manga|album)/i,
    titles: [
      'Astérix',
      'Tintin',
      'Lucky Luke',
      'Gaston Lagaffe',
      'Spirou',
      'Corto Maltese',
      'Blake et Mortimer',
      'Les Schtroumpfs',
      'Marsupilami',
      'Titeuf',
      'Boule et Bill',
    ],
  },
  {
    id: 'personnages_pop_culture',
    keywords: /(jeu vidéo|nintendo|pokémon|star wars|sorcier|super-héros|fiction)/i,
    titles: [
      'Pikachu',
      'Mario (personnage)',
      'Dark Vador',
      'Harry Potter',
      'James Bond',
      'Indiana Jones',
      'Sherlock Holmes',
      'Spider-Man',
      'Batman',
      'Sonic',
      'Lara Croft',
    ],
  },
  {
    id: 'arbres_plantes_nature',
    keywords: /(arbre|plante|fleur|botanique|végétal|espèce de plantes|organisme|champignon)/i,
    titles: [
      'Baobab',
      'Séquoia géant',
      'Bonsaï',
      'Tournesol',
      'Attrape-mouche de Vénus',
      'Blob (Physarum polycephalum)',
      'Orchidée',
      'Ginkgo biloba',
      'Edelweiss',
      'Lotus sacré',
      'Bambou',
    ],
  },
];

/**
 * Liste de grands classiques encyclopédiques sur Wikipédia FR (utilisée pour le mode Populaire / Mix)
 */
const FAMOUS_WIKI_TITLES: string[] = Array.from(
  new Set(WIKI_THEMATIC_CLUSTERS.flatMap((c) => c.titles))
);

/**
 * Secours hors-ligne immédiat si l'API Wikipédia met du temps au tout premier rendu,
 * avec des propositions garanties très proches de la vraie réponse.
 */
const INSTANT_FALLBACK_CHALLENGES: Array<
  Omit<WikiPageChallenge, 'options' | 'correctIndex'> & {
    closeDistractors: string[];
  }
> = [
  {
    pageid: 5771784,
    title: 'Mont Saint-Michel',
    cleanTitle: 'Mont Saint-Michel',
    imageUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Mont_St_Michel_in_the_afternoon.jpg/960px-Mont_St_Michel_in_the_afternoon.jpg',
    description: 'Îlot rocheux granitique dans la Manche, Normandie, France',
    extract:
      'Le mont Saint-Michel est un îlot rocheux granitique d’environ 960 mètres de circonférence situé à l’est de l’embouchure du fleuve du Couesnon, dans le département de la Manche en Normandie.',
    pageUrl: 'https://fr.wikipedia.org/wiki/Mont_Saint-Michel',
    sourceType: 'popular',
    closeDistractors: [
      'Cité de Carcassonne',
      'Château de Chambord',
      'Fort Boyard',
      'Palais des papes d\'Avignon',
      'Château d\'If',
      'Cathédrale Notre-Dame de Chartres',
    ],
  },
  {
    pageid: 30674,
    title: 'Ornithorynque',
    cleanTitle: 'Ornithorynque',
    imageUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/3/32/Ornithorhynchus.jpg/960px-Ornithorhynchus.jpg',
    description: 'Mammifère ovipare semi-aquatique endémique à l\'Australie',
    extract:
      'L\'ornithorynque est un animal semi-aquatique endémique de l\'est de l\'Australie et de la Tasmanie. C\'est l\'une des cinq espèces de l\'ordre des monotrèmes, seul ordre de mammifères qui pond des œufs.',
    pageUrl: 'https://fr.wikipedia.org/wiki/Ornithorynque',
    sourceType: 'popular',
    closeDistractors: [
      'Échidné',
      'Capibara',
      'Quokka',
      'Axolotl',
      'Pangolin',
      'Tatou',
    ],
  },
  {
    pageid: 17076,
    title: 'Taj Mahal',
    cleanTitle: 'Taj Mahal',
    imageUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Taj_Mahal%2C_Agra%2C_India_edit3.jpg/960px-Taj_Mahal%2C_Agra%2C_India_edit3.jpg',
    description: 'Mausolée de marbre à Agra, État de l\'Uttar Pradesh, Inde',
    extract:
      'Le Taj Mahal est un mausolée de marbre blanc construit par l’empereur moghol Shâh Jahân en mémoire de son épouse Arjumand Bânu Begam, connue sous le nom de Mumtaz Mahal.',
    pageUrl: 'https://fr.wikipedia.org/wiki/Taj_Mahal',
    sourceType: 'popular',
    closeDistractors: [
      'Alhambra',
      'Angkor Wat',
      'Sainte-Sophie',
      'Pétra',
      'Palais des Vents',
      'Mosquée bleue',
    ],
  },
  {
    pageid: 44927,
    title: 'Panda géant',
    cleanTitle: 'Panda géant',
    imageUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/5/56/Panda_at_the_Chengdu_Research_Base_of_Giant_Panda_Breeding%2C_Chengdu%2C_China_-_panoramio.jpg/960px-Panda_at_the_Chengdu_Research_Base_of_Giant_Panda_Breeding%2C_Chengdu%2C_China_-_panoramio.jpg',
    description: 'Espèce de mammifères endémique de Chine',
    extract:
      'Le Panda géant est un mammifère de l’ordre des Carnivores et de la famille des Ursidés, endémique de Chine. Il se caractérise par son pelage blanc parsemé de taches noires.',
    pageUrl: 'https://fr.wikipedia.org/wiki/Panda_g%C3%A9ant',
    sourceType: 'popular',
    closeDistractors: [
      'Koala',
      'Panda roux',
      'Ours à lunettes',
      'Ours polaire',
      'Paresseux',
      'Lémur catta',
    ],
  },
  {
    pageid: 24023,
    title: 'Colisée',
    cleanTitle: 'Colisée',
    imageUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/de/Colosseo_2020.jpg/960px-Colosseo_2020.jpg',
    description: 'Monument de la ville de Rome',
    extract:
      'Le Colisée, à l’origine amphithéâtre Flavien, est un immense amphithéâtre ovoïde situé dans le centre de la ville de Rome, le plus grand jamais construit dans l’Empire romain.',
    pageUrl: 'https://fr.wikipedia.org/wiki/Colis%C3%A9e',
    sourceType: 'popular',
    closeDistractors: [
      'Arènes de Nîmes',
      'Acropole d\'Athènes',
      'Panthéon de Rome',
      'Pont du Gard',
      'Théâtre antique d\'Orange',
      'Pompéi',
    ],
  },
  {
    pageid: 1359783,
    title: 'Tour Eiffel',
    cleanTitle: 'Tour Eiffel',
    imageUrl:
      'https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a8/Tour_Eiffel_Wikimedia_Commons.jpg/960px-Tour_Eiffel_Wikimedia_Commons.jpg',
    description: 'Tour de fer puddlé de 330 mètres à Paris, France',
    extract:
      'La tour Eiffel est une tour autoportante de fer puddlé de 330 m de hauteur située à Paris, à l’extrémité nord-ouest du parc du Champ-de-Mars en bordure de la Seine.',
    pageUrl: 'https://fr.wikipedia.org/wiki/Tour_Eiffel',
    sourceType: 'popular',
    closeDistractors: [
      'Viaduc de Millau',
      'Arc de triomphe de l\'Étoile',
      'Pont Alexandre-III',
      'Statue de la Liberté',
      'Grand Palais',
      'Golden Gate Bridge',
    ],
  },
];

function stripParentheses(title: string): string {
  return title.replace(/\s*\([^)]*\)\s*/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeForComparison(text: string): string {
  return stripParentheses(text)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/['’\-_.,:;!?/\\()[\]"]/g, ' ')
    .replace(/\b(le|la|les|un|une|des|du|de|d|l|au|aux|en|et|sur|dans)\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    new Array(n + 1).fill(0)
  );
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function isGuessMatchingTitle(guess: string, pageTitle: string): boolean {
  const normGuess = normalizeForComparison(guess);
  const normTitle = normalizeForComparison(pageTitle);
  const normFull = pageTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!normGuess || normGuess.length < 2) return false;
  if (normGuess === normTitle || normGuess === normFull) return true;

  const maxAllowedDist =
    normTitle.length <= 5 ? 1 : normTitle.length <= 10 ? 2 : 3;
  if (levenshteinDistance(normGuess, normTitle) <= maxAllowedDist) {
    return true;
  }

  // Si le titre comporte plusieurs mots significatifs et que le joueur a donné le cœur du titre
  const titleWords = normTitle.split(' ').filter((w) => w.length >= 3);
  const guessWords = normGuess.split(' ').filter((w) => w.length >= 3);
  if (
    titleWords.length >= 2 &&
    guessWords.length >= 1 &&
    titleWords.every((tw) =>
      guessWords.some((gw) => levenshteinDistance(gw, tw) <= 1)
    )
  ) {
    return true;
  }

  return false;
}

/**
 * Masque tous les mots du titre dans l'extrait ou la description pour éviter de donner la réponse dans l'indice
 */
function redactTitleFromText(text: string, title: string): string {
  if (!text) return '';
  const clean = stripParentheses(title);
  const rawWords = clean
    .split(/[\s\-’']+/)
    .map((w) => w.replace(/[^a-zA-ZÀ-ÿ0-9]/g, ''))
    .filter((w) => w.length >= 3);

  let redacted = text;
  // Masquer d'abord le titre complet
  if (clean.length >= 3) {
    const escapedClean = clean.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    redacted = redacted.replace(new RegExp(escapedClean, 'gi'), '██████');
  }
  for (const word of rawWords) {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    redacted = redacted.replace(new RegExp(escaped, 'gi'), '█████');
  }
  return redacted;
}

/**
 * Génère un indice avec les initiales du titre (ex: "T___ E_____")
 */
function buildInitialsMask(title: string): string {
  const clean = stripParentheses(title);
  return clean
    .split(' ')
    .map((word) => {
      if (word.length <= 1) return word;
      const first = word[0];
      const rest = word
        .slice(1)
        .replace(/[a-zA-ZÀ-ÿ0-9]/g, '_');
      return `${first}${rest}`;
    })
    .join('   ');
}

/**
 * Filtre les images Wikipédia non pertinentes (icônes, cartes muettes, drapeaux, blasons SVG génériques, bandeaux)
 */
function isGoodWikiImage(url: string, width?: number, height?: number): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  const badPatterns = [
    'defaut',
    'default',
    'disambig',
    'homonymie',
    'icon',
    'icone',
    'symbol',
    'logo_of',
    'flag_of',
    'drapeau',
    'blason',
    'coat_of_arms',
    'locator_map',
    'location_map',
    'carte_de',
    'map_of',
    'blank_map',
    'question_book',
    'nuvola',
    'crystal_clear',
    'ambox',
    'commons-logo',
    'wikidata-logo',
    'edit-clear',
    'folder_hexagonal',
    'stub',
    'ebauche',
    'replace_this_image',
    'no_image',
    'no_free_image',
    'portrait_placeholder',
    'silhouette',
    'oojs_ui',
    'red_pog',
    'blue_pog',
    'increase2',
    'decrease2',
    'steady2',
    '.svg',
  ];
  if (badPatterns.some((pat) => lower.includes(pat))) return false;
  if (width && width < 200) return false;
  if (height && height < 160) return false;
  return true;
}

function isGoodWikiArticle(title: string, description?: string, extract?: string): boolean {
  if (!title) return false;
  const lowerTitle = title.toLowerCase();
  const lowerDesc = (description || '').toLowerCase();
  const lowerExtract = (extract || '').toLowerCase();

  if (
    lowerTitle.includes('homonymie') ||
    lowerDesc.includes('homonymie') ||
    lowerExtract.includes('page d’homonymie') ||
    lowerExtract.includes("page d'homonymie") ||
    lowerTitle.startsWith('liste ') ||
    lowerTitle.startsWith('chronologie ') ||
    lowerTitle.startsWith('catégorie:') ||
    lowerTitle.startsWith('portail:') ||
    lowerTitle.startsWith('wikipédia:') ||
    lowerTitle.startsWith('projet:') ||
    lowerTitle.startsWith('modèle:') ||
    /^\d{3,4}(\s|$)/.test(lowerTitle) // éviter les pages d'années pures ex: "1984 en sport"
  ) {
    return false;
  }
  return true;
}

/**
 * Mots génériques (types de lieux, titres, prénoms courants) qui peuvent être partagés
 * entre la vraie réponse et un bon distracteur (ex: "Château de Chambord" et "Château de Blois"),
 * tandis que les mots spécifiques propres (ex: "Chambord", "Saint-Michel") ne doivent pas fuiter.
 */
const GENERIC_SHARED_WORDS = new Set([
  'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'd', 'l', 'au', 'aux', 'en', 'et', 'sur', 'dans', 'sous', 'par', 'pour', 'avec', 'chez',
  'chateau', 'eglise', 'cathedrale', 'basilique', 'abbaye', 'chapelle', 'palais', 'musee', 'pont', 'viaduc', 'tour', 'phare', 'fort', 'citadelle',
  'mont', 'pic', 'col', 'lac', 'ile', 'iles', 'baie', 'cap', 'grotte', 'foret', 'parc', 'jardin', 'place', 'porte', 'arc', 'statue', 'monument',
  'temple', 'mosquee', 'pyramide', 'tombeau', 'mausolee', 'gare', 'aeroport', 'stade', 'circuit', 'opera', 'theatre', 'universite',
  'bataille', 'siege', 'guerre', 'traite', 'revolution', 'affaire', 'royaume', 'empire', 'republique', 'duche', 'comte', 'principaute',
  'dynastie', 'maison', 'ordre', 'equipe', 'club', 'union', 'association', 'compagnie', 'societe', 'groupe', 'airlines', 'airways', 'air',
  'championnat', 'coupe', 'tournoi', 'jeux', 'grand', 'grande', 'petit', 'petite', 'haut', 'haute', 'bas', 'basse', 'nouveau', 'nouvelle',
  'vieux', 'vieille', 'nord', 'sud', 'est', 'ouest', 'central', 'national', 'royal', 'imperial', 'francais', 'francaise', 'france', 'paris',
  'monde', 'international', 'zoo', 'star', 'super', 'world', 'saint', 'sainte', 'notre', 'dame', 'roi', 'reine', 'prince', 'princesse', 'duc',
  'general', 'amiral', 'marechal', 'president', 'pape', 'jean', 'pierre', 'marie', 'louis', 'charles', 'henri', 'francois', 'paul', 'jacques',
  'philippe', 'antoine', 'nicolas', 'thomas', 'robert', 'richard', 'william', 'john', 'george', 'david', 'michael', 'peter', 'alexandre',
  'claude', 'bernard', 'andre', 'rene', 'roger', 'marcel', 'albert', 'victor', 'jules', 'emile', 'leon', 'joseph', 'edouard', 'georges',
]);

/**
 * Vérifie qu'une proposition candidate est pertinente et ne dévoile pas la vraie réponse
 * (ex: évite "Baie du Mont-Saint-Michel" ou "Abbaye du Mont-Saint-Michel" quand la réponse est "Mont Saint-Michel").
 */
function isValidDistractorForTarget(candidateTitle: string, targetTitle: string): boolean {
  const cClean = stripParentheses(candidateTitle);
  const tClean = stripParentheses(targetTitle);
  if (!isGoodWikiArticle(cClean)) return false;

  const cNorm = normalizeForComparison(cClean);
  const tNorm = normalizeForComparison(tClean);
  if (!cNorm || cNorm.length < 3) return false;
  if (cNorm === tNorm) return false;

  // Éviter qu'un titre contienne l'autre intégralement (ex: "Fémur" vs "Corps du fémur")
  if (tNorm.length >= 4 && (cNorm.includes(tNorm) || tNorm.includes(cNorm))) {
    return false;
  }

  // Éviter le partage d'un nom propre spécifique (ex: "Versailles", "Chambord", "Michel", "Zidane")
  const tSpecificWords = tNorm
    .split(' ')
    .filter((w) => w.length >= 4 && !GENERIC_SHARED_WORDS.has(w));
  const cWords = cNorm.split(' ');

  for (const tw of tSpecificWords) {
    if (
      cWords.some(
        (cw) =>
          cw === tw ||
          (tw.length >= 5 && cw.length >= 5 && (cw.includes(tw) || tw.includes(cw)))
      )
    ) {
      return false;
    }
  }

  return true;
}

/**
 * Trouve le groupe thématique le plus proche d'un article Wikipédia (via son titre, sa description ou ses catégories)
 */
function findMatchingThematicCluster(
  title: string,
  description?: string,
  categories?: string[]
): WikiThematicCluster {
  const clean = stripParentheses(title).toLowerCase();

  // 1. Correspondance directe dans l'un des clusters célèbres
  const exactCluster = WIKI_THEMATIC_CLUSTERS.find((cluster) =>
    cluster.titles.some(
      (t) => stripParentheses(t).toLowerCase() === clean
    )
  );
  if (exactCluster) return exactCluster;

  // 2. Correspondance sémantique via la description, les catégories et le titre
  const contextText = [
    title,
    description || '',
    ...(categories || []),
  ].join(' ');

  for (const cluster of WIKI_THEMATIC_CLUSTERS) {
    if (cluster.keywords.test(contextText)) {
      return cluster;
    }
  }

  return WIKI_THEMATIC_CLUSTERS[0];
}

/**
 * Sélectionne la catégorie Wikipédia la plus spécifique et pertinente pour trouver des pages sœurs
 */
function pickBestWikiCategory(categories?: string[], title?: string): string | null {
  if (!categories || categories.length === 0) return null;
  const tNorm = title ? normalizeForComparison(title) : '';

  const ignoredPatterns = [
    'naissance en',
    'deces en',
    'mort en',
    'article ',
    'page ',
    'wikipedia:',
    'portail:',
    'modele:',
    'homonymie',
    'redirection',
    'siecle',
    'annees ',
    'monument historique classe',
    'monument historique inscrit',
    'patrimoine mondial inscrit',
    'taxon decrit',
    'espece decrite',
    'animal decrit',
    'plante decrite',
    'statut uicn',
    'genome est sequence',
    'edifice represente',
    'label ',
    'film sorti en',
    'album sorti en',
    'jeu video sorti en',
    'roman paru en',
    'fondation en',
    'entreprise fondee en',
    'organisme fonde en',
  ];

  const scored: Array<{ raw: string; score: number }> = [];

  for (const rawCat of categories) {
    const withoutPrefix = rawCat.replace(/^Catégorie:/i, '').trim();
    const cNorm = normalizeForComparison(withoutPrefix);
    if (!cNorm) continue;
    if (/^\d{3,4}(\s|$)/.test(cNorm)) continue;
    if (ignoredPatterns.some((pat) => cNorm.includes(pat))) continue;
    if (tNorm && (cNorm === tNorm || cNorm.includes(tNorm) || tNorm.includes(cNorm))) {
      continue;
    }

    let score = 10;
    if (
      /(chateau|eglise|cathedrale|commune|ville|ile|montagne|sommet|lac|cours d eau|mammifere|oiseau|reptile|poisson|insecte|plante|arbre|fleur|acteur|actrice|chanteur|chanteuse|musicien|ecrivain|poete|peintre|sculpteur|footballeur|cycliste|joueur|joueuse|sportif|sportive|club|compagnie|film|serie|album|chanson|jeu video|roman|tableau|bataille|roi|empereur|president|gare|pont|musee|stade|navire|avion|automobile|fromage|plat|vin|mausolee|monument|parc)/.test(
        cNorm
      )
    ) {
      score += 25;
    }
    scored.push({ raw: rawCat, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.raw || null;
}

/**
 * Interroge Wikipédia (`morelike:` + membres de la catégorie principale) pour obtenir
 * des propositions très proches de la vraie réponse.
 */
async function fetchCloseWikiDistractors(
  title: string,
  categories?: string[],
  description?: string
): Promise<string[]> {
  try {
    const bestCat = pickBestWikiCategory(categories, title);
    let url = `https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search${
      bestCat ? '|categorymembers' : ''
    }&srsearch=${encodeURIComponent(
      `morelike:${stripParentheses(title)}`
    )}&srnamespace=0&srlimit=18`;

    if (bestCat) {
      url += `&cmtitle=${encodeURIComponent(bestCat)}&cmnamespace=0&cmlimit=25`;
    }

    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();

    const searchTitles: string[] = (data?.query?.search || []).map(
      (s: { title: string }) => s.title
    );
    const catTitles: string[] = (data?.query?.categorymembers || []).map(
      (c: { title: string }) => c.title
    );

    const candidateScores = new Map<string, number>();
    const targetFirstWord = normalizeForComparison(title).split(' ')[0] || '';

    searchTitles.forEach((cand, idx) => {
      if (!isValidDistractorForTarget(cand, title)) return;
      const clean = stripParentheses(cand);
      candidateScores.set(clean, (candidateScores.get(clean) || 0) + 45 - idx);
    });

    catTitles.forEach((cand, idx) => {
      if (!isValidDistractorForTarget(cand, title)) return;
      const clean = stripParentheses(cand);
      const prev = candidateScores.get(clean) || 0;
      // Bonus fort si le candidat est à la fois dans la même catégorie ET dans `morelike:`
      candidateScores.set(
        clean,
        prev + (prev > 0 ? 50 : 32) - Math.min(idx, 15)
      );
    });

    // Bonus si le candidat commence par le même mot générique (ex: "Château de...", "Église...", "Île...")
    for (const [cand, sc] of Array.from(candidateScores.entries())) {
      const candFirstWord = normalizeForComparison(cand).split(' ')[0] || '';
      if (targetFirstWord.length >= 3 && candFirstWord === targetFirstWord) {
        candidateScores.set(cand, sc + 25);
      }
    }

    const ranked = Array.from(candidateScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    if (ranked.length >= 3) {
      return ranked.slice(0, 6);
    }

    // Secours par recherche sur la description si `morelike:` + catégorie donnent moins de 3 résultats
    if (description && description.length >= 4) {
      const descUrl = `https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&list=search&srsearch=${encodeURIComponent(
        description
      )}&srnamespace=0&srlimit=12`;
      const descRes = await fetch(descUrl);
      if (descRes.ok) {
        const descData = await descRes.json();
        const descTitles: string[] = (descData?.query?.search || []).map(
          (s: { title: string }) => s.title
        );
        for (const cand of descTitles) {
          if (!isValidDistractorForTarget(cand, title)) continue;
          const clean = stripParentheses(cand);
          if (!ranked.includes(clean)) {
            ranked.push(clean);
          }
        }
      }
    }

    return ranked.slice(0, 6);
  } catch {
    return [];
  }
}

function buildOptionsForChallenge(
  correctTitle: string,
  priorityDistractors: string[],
  description?: string,
  categories?: string[],
  preserveOrderForPriority = false
): { options: string[]; correctIndex: number } {
  const cleanCorrect = stripParentheses(correctTitle);
  const chosenDistractors: string[] = [];
  const usedNorm = new Set<string>([normalizeForComparison(cleanCorrect)]);

  const tryAddCandidate = (rawCand: string) => {
    const clean = stripParentheses(rawCand);
    const norm = normalizeForComparison(clean);
    if (!norm || usedNorm.has(norm)) return;
    if (!isValidDistractorForTarget(clean, cleanCorrect)) return;
    usedNorm.add(norm);
    chosenDistractors.push(clean);
  };

  // 1. Utiliser d'abord les distracteurs proches prioritaires (issus de `morelike:` / catégorie ou liste dédiée)
  const orderedPriority = preserveOrderForPriority
    ? priorityDistractors.slice(0, 5).sort(() => Math.random() - 0.5)
    : [...priorityDistractors].sort(() => Math.random() - 0.5);

  for (const cand of orderedPriority) {
    tryAddCandidate(cand);
    if (chosenDistractors.length === 3) break;
  }

  // 2. Compléter si besoin avec le cluster thématique correspondant (même catégorie de sujet)
  if (chosenDistractors.length < 3) {
    const cluster = findMatchingThematicCluster(
      correctTitle,
      description,
      categories
    );
    const shuffledCluster = [...cluster.titles].sort(() => Math.random() - 0.5);
    for (const cand of shuffledCluster) {
      tryAddCandidate(cand);
      if (chosenDistractors.length === 3) break;
    }
  }

  // 3. Ultime secours dans la liste générale
  let safety = 0;
  while (chosenDistractors.length < 3 && safety < 50) {
    safety++;
    const fallback =
      FAMOUS_WIKI_TITLES[Math.floor(Math.random() * FAMOUS_WIKI_TITLES.length)];
    tryAddCandidate(fallback);
  }

  const allOptions = [cleanCorrect, ...chosenDistractors].sort(
    () => Math.random() - 0.5
  );
  const correctIndex = allOptions.findIndex(
    (o) => normalizeForComparison(o) === normalizeForComparison(cleanCorrect)
  );

  return {
    options: allOptions,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;
const STORAGE_WIKI_SEEN = '7ter:wiki:seen_pages:v1';

function loadSeenWikiKeys(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_WIKI_SEEN);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return new Set(parsed.map((v) => String(v)));
    }
  } catch {
    // Ignore storage errors
  }
  return new Set();
}

function saveSeenWikiKeys(keys: Set<string>): void {
  if (typeof window === 'undefined') return;
  try {
    const arr = Array.from(keys).slice(-2000);
    localStorage.setItem(STORAGE_WIKI_SEEN, JSON.stringify(arr));
  } catch {
    // Ignore storage errors
  }
}

export default function WikipediaMode({
  teams,
  teamMode,
  onToggleTeamMode,
  onUpdateScore,
  onRenameTeam,
  lastScoredId,
  soundEnabled,
}: WikipediaModeProps) {
  const [sourceMode, setSourceMode] = useState<WikiSourceMode>('mix');
  const seenPageIdsRef = useRef<Set<string>>(new Set());
  const allFallbacksSeenOnMountRef = useRef<boolean>(false);

  const [queue, setQueue] = useState<WikiPageChallenge[]>(() => {
    const persistedSeen = loadSeenWikiKeys();
    seenPageIdsRef.current = persistedSeen;

    const unseenFallbacks = INSTANT_FALLBACK_CHALLENGES.filter(
      (c) =>
        !persistedSeen.has(String(c.pageid)) &&
        !persistedSeen.has(`title:${c.title.toLowerCase()}`)
    );
    if (unseenFallbacks.length === 0) {
      allFallbacksSeenOnMountRef.current = true;
    }
    const basePool =
      unseenFallbacks.length > 0 ? unseenFallbacks : INSTANT_FALLBACK_CHALLENGES;
    const shuffled = [...basePool].sort(() => Math.random() - 0.5);
    return shuffled.map((item) => {
      const { options, correctIndex } = buildOptionsForChallenge(
        item.title,
        item.closeDistractors,
        item.description
      );
      return {
        ...item,
        options,
        correctIndex,
        enrichedCloseOptions: true,
      };
    });
  });

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [isFetchingMore, setIsFetchingMore] = useState<boolean>(false);
  const [guessInput, setGuessInput] = useState<string>('');
  const [wrongAttemptMessage, setWrongAttemptMessage] = useState<string | null>(
    null
  );
  const [revealed, setRevealed] = useState<boolean>(false);
  const [wonMethod, setWonMethod] = useState<'cash' | 'qcm' | 'oral' | null>(
    null
  );
  const [showQcm, setShowQcm] = useState<boolean>(false);
  const [selectedQcmIndex, setSelectedQcmIndex] = useState<number | null>(null);
  const [hintLevel, setHintLevel] = useState<number>(0); // 0: aucun, 1: description, 2: extrait caviardé, 3: initiales
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [zoomPan, setZoomPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreenZoom, setIsFullscreenZoom] = useState<boolean>(false);
  const [isDraggingZoom, setIsDraggingZoom] = useState<boolean>(false);
  const [awardedTeams, setAwardedTeams] = useState<Record<string, boolean>>({});

  const dragStartRef = useRef<{
    x: number;
    y: number;
    panX: number;
    panY: number;
    moved: boolean;
  } | null>(null);
  const pinchStartRef = useRef<{
    dist: number;
    startScale: number;
  } | null>(null);
  const lastTapRef = useRef<number>(0);

  const fetchingRef = useRef<boolean>(false);

  const currentChallenge = queue[currentIndex] || null;

  const markChallengeSeen = useCallback((challenge: WikiPageChallenge | null) => {
    if (!challenge) return;
    seenPageIdsRef.current.add(String(challenge.pageid));
    seenPageIdsRef.current.add(`title:${challenge.title.toLowerCase()}`);
    seenPageIdsRef.current.add(`title:${challenge.cleanTitle.toLowerCase()}`);
    saveSeenWikiKeys(seenPageIdsRef.current);
  }, []);

  // Points gagnables selon l'aide utilisée :
  // - Cash sans QCM ni indice = 3 pts
  // - Cash avec indice = 2 pts
  // - QCM 4 choix = 1 pt
  const currentPointValue = useMemo(() => {
    if (showQcm || wonMethod === 'qcm') return 1;
    if (hintLevel >= 2) return 1;
    if (hintLevel === 1) return 2;
    return 3;
  }, [showQcm, wonMethod, hintLevel]);

  /**
   * Récupère un lot de pages aléatoires illustrées directement depuis l'API Wikipédia FR
   * avec leurs catégories pour générer des propositions très proches.
   */
  const fetchRandomWikiBatch = useCallback(async (): Promise<WikiPageChallenge[]> => {
    const url =
      'https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=random&grnnamespace=0&grnlimit=30&prop=pageimages|extracts|description|info|categories&clshow=!hidden&cllimit=30&pithumbsize=1280&exintro=1&explaintext=1&exsentences=2&inprop=url';

    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const pagesObj = data?.query?.pages || {};
    const rawPages = Object.values(pagesObj) as Array<{
      pageid: number;
      title: string;
      thumbnail?: { source: string; width: number; height: number };
      description?: string;
      extract?: string;
      fullurl?: string;
      categories?: Array<{ title: string }>;
    }>;

    const validChallenges: WikiPageChallenge[] = [];

    for (const p of rawPages) {
      const idStr = String(p.pageid);
      if (seenPageIdsRef.current.has(idStr)) continue;
      if (!p.thumbnail?.source) continue;
      if (
        !isGoodWikiImage(
          p.thumbnail.source,
          p.thumbnail.width,
          p.thumbnail.height
        )
      ) {
        continue;
      }
      if (!isGoodWikiArticle(p.title, p.description, p.extract)) {
        continue;
      }

      seenPageIdsRef.current.add(idStr);
      const pageCategories = (p.categories || []).map((c) => c.title);
      const cluster = findMatchingThematicCluster(
        p.title,
        p.description,
        pageCategories
      );
      const { options, correctIndex } = buildOptionsForChallenge(
        p.title,
        cluster.titles,
        p.description,
        pageCategories
      );

      validChallenges.push({
        pageid: p.pageid,
        title: p.title,
        cleanTitle: stripParentheses(p.title),
        imageUrl: p.thumbnail.source,
        description:
          p.description || 'Article encyclopédique sur Wikipédia',
        extract:
          p.extract ||
          `Article encyclopédique de Wikipédia consacré à ${stripParentheses(
            p.title
          )}.`,
        pageUrl:
          p.fullurl ||
          `https://fr.wikipedia.org/wiki/${encodeURIComponent(
            p.title.replace(/ /g, '_')
          )}`,
        options,
        correctIndex,
        sourceType: 'random',
        categories: pageCategories,
        enrichedCloseOptions: false,
      });
    }

    // Enrichir les pages aléatoires du lot avec de vraies pages sœurs Wikipédia (`morelike:` + catégorie)
    await Promise.all(
      validChallenges.slice(0, 6).map(async (challenge) => {
        const closeTitles = await fetchCloseWikiDistractors(
          challenge.title,
          challenge.categories,
          challenge.description
        );
        if (closeTitles.length >= 2) {
          const { options, correctIndex } = buildOptionsForChallenge(
            challenge.title,
            closeTitles,
            challenge.description,
            challenge.categories,
            true
          );
          challenge.options = options;
          challenge.correctIndex = correctIndex;
          challenge.enrichedCloseOptions = true;
        }
      })
    );

    return validChallenges;
  }, []);

  /**
   * Récupère un lot de pages populaires/illustres depuis Wikipédia FR avec leurs vraies images principales
   * et des propositions issues du même groupe thématique.
   */
  const fetchPopularWikiBatch = useCallback(async (): Promise<WikiPageChallenge[]> => {
    const unusedTitles = FAMOUS_WIKI_TITLES.filter(
      (t) => !seenPageIdsRef.current.has(`title:${t.toLowerCase()}`)
    );
    const pool = unusedTitles.length >= 8 ? unusedTitles : FAMOUS_WIKI_TITLES;
    const picked = [...pool]
      .sort(() => Math.random() - 0.5)
      .slice(0, 12);

    const titlesParam = picked.map((t) => encodeURIComponent(t)).join('|');
    const url = `https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&titles=${titlesParam}&prop=pageimages|extracts|description|info|categories&clshow=!hidden&cllimit=30&pithumbsize=1280&exintro=1&explaintext=1&exsentences=2&inprop=url`;

    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const pagesObj = data?.query?.pages || {};
    const rawPages = Object.values(pagesObj) as Array<{
      pageid?: number;
      title: string;
      thumbnail?: { source: string; width: number; height: number };
      description?: string;
      extract?: string;
      fullurl?: string;
      categories?: Array<{ title: string }>;
    }>;

    const validChallenges: WikiPageChallenge[] = [];
    for (const p of rawPages) {
      if (!p.pageid || !p.thumbnail?.source) continue;
      const idStr = String(p.pageid);
      if (seenPageIdsRef.current.has(idStr)) continue;
      if (
        !isGoodWikiImage(
          p.thumbnail.source,
          p.thumbnail.width,
          p.thumbnail.height
        )
      ) {
        continue;
      }

      seenPageIdsRef.current.add(idStr);
      seenPageIdsRef.current.add(`title:${p.title.toLowerCase()}`);

      const pageCategories = (p.categories || []).map((c) => c.title);
      const cluster = findMatchingThematicCluster(
        p.title,
        p.description,
        pageCategories
      );
      const { options, correctIndex } = buildOptionsForChallenge(
        p.title,
        cluster.titles,
        p.description,
        pageCategories
      );

      validChallenges.push({
        pageid: p.pageid,
        title: p.title,
        cleanTitle: stripParentheses(p.title),
        imageUrl: p.thumbnail.source,
        description:
          p.description || 'Article incontournable de Wikipédia',
        extract:
          p.extract ||
          `Article encyclopédique de Wikipédia consacré à ${stripParentheses(
            p.title
          )}.`,
        pageUrl:
          p.fullurl ||
          `https://fr.wikipedia.org/wiki/${encodeURIComponent(
            p.title.replace(/ /g, '_')
          )}`,
        options,
        correctIndex,
        sourceType: 'popular',
        categories: pageCategories,
        enrichedCloseOptions: true,
      });
    }

    return validChallenges.sort(() => Math.random() - 0.5);
  }, []);

  /**
   * Alimente la file d'attente de pages Wikipédia en arrière-plan
   */
  const replenishQueue = useCallback(
    async (modeOverride?: WikiSourceMode, replaceUpcoming = false) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      setIsFetchingMore(true);

      const targetMode = modeOverride ?? sourceMode;
      try {
        let fetched: WikiPageChallenge[] = [];
        if (targetMode === 'random') {
          const [batch1, batch2] = await Promise.all([
            fetchRandomWikiBatch(),
            fetchRandomWikiBatch(),
          ]);
          fetched = [...batch1, ...batch2];
        } else if (targetMode === 'popular') {
          fetched = await fetchPopularWikiBatch();
        } else {
          // Mix : combine vrai hasard Wikipédia + pages célèbres Wikipédia
          const [randomBatch, popularBatch] = await Promise.all([
            fetchRandomWikiBatch(),
            fetchPopularWikiBatch(),
          ]);
          const combined = [...randomBatch, ...popularBatch];
          fetched = combined.sort(() => Math.random() - 0.5);
        }

        if (fetched.length > 0) {
          // Précharger les 2 premières images dans le navigateur
          fetched.slice(0, 2).forEach((item) => {
            if (typeof window !== 'undefined') {
              const img = new window.Image();
              img.src = item.imageUrl;
            }
          });

          setQueue((prev) => {
            if (replaceUpcoming) {
              const current = prev[currentIndex] ? [prev[currentIndex]] : [];
              return [...current, ...fetched];
            }
            return [...prev, ...fetched];
          });
          if (replaceUpcoming) {
            setCurrentIndex(0);
          }
        }
      } catch {
        // Garde la file actuelle en cas d'erreur réseau
      } finally {
        fetchingRef.current = false;
        setIsFetchingMore(false);
      }
    },
    [sourceMode, currentIndex, fetchRandomWikiBatch, fetchPopularWikiBatch]
  );

  // Chargement initial dès l'ouverture du mode Wikipédia
  useEffect(() => {
    replenishQueue(sourceMode, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recharger automatiquement quand il reste moins de 5 pages en réserve
  useEffect(() => {
    if (queue.length - currentIndex <= 5 && !fetchingRef.current) {
      replenishQueue(sourceMode, false);
    }
  }, [currentIndex, queue.length, sourceMode, replenishQueue]);

  // Précharger l'image suivante et enrichir ses propositions proches dès que l'index change
  useEffect(() => {
    const nextItem = queue[currentIndex + 1];
    if (nextItem && typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = nextItem.imageUrl;

      if (!nextItem.enrichedCloseOptions) {
        let cancelled = false;
        fetchCloseWikiDistractors(
          nextItem.title,
          nextItem.categories,
          nextItem.description
        ).then((closeTitles) => {
          if (cancelled || closeTitles.length < 2) return;
          setQueue((prev) =>
            prev.map((item) => {
              if (item.pageid !== nextItem.pageid || item.enrichedCloseOptions) {
                return item;
              }
              const { options, correctIndex } = buildOptionsForChallenge(
                item.title,
                closeTitles,
                item.description,
                item.categories,
                true
              );
              return {
                ...item,
                options,
                correctIndex,
                enrichedCloseOptions: true,
              };
            })
          );
        });
        return () => {
          cancelled = true;
        };
      }
    }
  }, [currentIndex, queue]);

  const resetZoom = useCallback(() => {
    setZoomScale(1);
    setZoomPan({ x: 0, y: 0 });
    setIsDraggingZoom(false);
    dragStartRef.current = null;
    pinchStartRef.current = null;
  }, []);

  const applyZoomScale = useCallback((nextScale: number) => {
    const clamped = Math.min(5, Math.max(1, Math.round(nextScale * 100) / 100));
    setZoomScale(clamped);
    if (clamped <= 1.02) {
      setZoomScale(1);
      setZoomPan({ x: 0, y: 0 });
    }
  }, []);

  const handleZoomStep = useCallback(
    (delta: number) => {
      setZoomScale((prev) => {
        const next = Math.min(5, Math.max(1, Math.round((prev + delta) * 100) / 100));
        if (next <= 1.02) {
          setZoomPan({ x: 0, y: 0 });
          return 1;
        }
        return next;
      });
    },
    []
  );

  const handleImageWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY < 0 ? 0.35 : -0.35;
    setZoomScale((prev) => {
      const next = Math.min(5, Math.max(1, Math.round((prev + delta) * 100) / 100));
      if (next <= 1.02) {
        setZoomPan({ x: 0, y: 0 });
        return 1;
      }
      return next;
    });
  }, []);

  const handleMouseDownZoom = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        panX: zoomPan.x,
        panY: zoomPan.y,
        moved: false,
      };
      if (zoomScale > 1) {
        setIsDraggingZoom(true);
      }
    },
    [zoomPan.x, zoomPan.y, zoomScale]
  );

  const handleMouseMoveZoom = useCallback(
    (e: React.MouseEvent) => {
      if (!dragStartRef.current) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
        dragStartRef.current.moved = true;
      }
      if (zoomScale > 1) {
        setZoomPan({
          x: dragStartRef.current.panX + dx,
          y: dragStartRef.current.panY + dy,
        });
      }
    },
    [zoomScale]
  );

  const handleMouseUpZoom = useCallback(() => {
    setIsDraggingZoom(false);
  }, []);

  const handleTouchStartZoom = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        pinchStartRef.current = {
          dist: Math.max(10, dist),
          startScale: zoomScale,
        };
        dragStartRef.current = null;
        setIsDraggingZoom(true);
        return;
      }

      if (e.touches.length === 1) {
        const now = Date.now();
        if (now - lastTapRef.current < 280) {
          // Double-tap : basculer entre x1 et x2.5
          if (zoomScale > 1.1) {
            resetZoom();
          } else {
            setZoomScale(2.5);
            setZoomPan({ x: 0, y: 0 });
          }
          lastTapRef.current = 0;
          return;
        }
        lastTapRef.current = now;

        dragStartRef.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
          panX: zoomPan.x,
          panY: zoomPan.y,
          moved: false,
        };
        if (zoomScale > 1) {
          setIsDraggingZoom(true);
        }
      }
    },
    [zoomScale, zoomPan.x, zoomPan.y, resetZoom]
  );

  const handleTouchMoveZoom = useCallback(
    (e: React.TouchEvent) => {
      e.stopPropagation();
      if (e.touches.length === 2 && pinchStartRef.current) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const dist = Math.hypot(dx, dy);
        const ratio = dist / pinchStartRef.current.dist;
        const nextScale = Math.min(
          5,
          Math.max(1, Math.round(pinchStartRef.current.startScale * ratio * 100) / 100)
        );
        setZoomScale(nextScale);
        if (nextScale <= 1.02) {
          setZoomPan({ x: 0, y: 0 });
        }
        return;
      }

      if (e.touches.length === 1 && dragStartRef.current && zoomScale > 1) {
        const dx = e.touches[0].clientX - dragStartRef.current.x;
        const dy = e.touches[0].clientY - dragStartRef.current.y;
        if (Math.abs(dx) > 4 || Math.abs(dy) > 4) {
          dragStartRef.current.moved = true;
        }
        setZoomPan({
          x: dragStartRef.current.panX + dx,
          y: dragStartRef.current.panY + dy,
        });
      }
    },
    [zoomScale]
  );

  const handleTouchEndZoom = useCallback(() => {
    pinchStartRef.current = null;
    setIsDraggingZoom(false);
  }, []);

  useEffect(() => {
    if (!isFullscreenZoom) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsFullscreenZoom(false);
      } else if (e.key === '+' || e.key === '=') {
        handleZoomStep(0.5);
      } else if (e.key === '-') {
        handleZoomStep(-0.5);
      } else if (e.key === '0') {
        resetZoom();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreenZoom, handleZoomStep, resetZoom]);

  const resetRoundState = useCallback(() => {
    setGuessInput('');
    setWrongAttemptMessage(null);
    setRevealed(false);
    setWonMethod(null);
    setShowQcm(false);
    setSelectedQcmIndex(null);
    setHintLevel(0);
    resetZoom();
    setIsFullscreenZoom(false);
    setAwardedTeams({});
  }, [resetZoom]);

  const handleNextPage = useCallback(() => {
    resetRoundState();
    setRoundNumber((n) => n + 1);
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setCurrentIndex(0);
      replenishQueue(sourceMode, false);
    }
  }, [currentIndex, queue.length, resetRoundState, replenishQueue, sourceMode]);

  const handleChangeSourceMode = (newMode: WikiSourceMode) => {
    if (newMode === sourceMode) return;
    setSourceMode(newMode);
    resetRoundState();
    // Si on a déjà en file un article du bon type, avancer dessus, sinon rafraîchir
    const nextMatchingIdx = queue.findIndex(
      (item, idx) =>
        idx > currentIndex &&
        (newMode === 'mix' || item.sourceType === newMode)
    );
    if (nextMatchingIdx !== -1) {
      setCurrentIndex(nextMatchingIdx);
    }
    replenishQueue(newMode, false);
  };

  const handleCashSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChallenge || revealed) return;
    const trimmed = guessInput.trim();
    if (!trimmed) return;

    if (
      isGuessMatchingTitle(trimmed, currentChallenge.title) ||
      isGuessMatchingTitle(trimmed, currentChallenge.cleanTitle)
    ) {
      playCorrectSound(soundEnabled);
      setRevealed(true);
      setWonMethod('cash');
      setWrongAttemptMessage(null);
    } else {
      playWrongSound(soundEnabled);
      setWrongAttemptMessage(`« ${trimmed} » n'est pas le titre de cette page !`);
      setGuessInput('');
    }
  };

  const handleSelectQcmOption = (idx: number) => {
    if (!currentChallenge || revealed || selectedQcmIndex !== null) return;
    setSelectedQcmIndex(idx);
    const isCorrect = idx === currentChallenge.correctIndex;
    if (isCorrect) {
      playCorrectSound(soundEnabled);
      setWonMethod('qcm');
    } else {
      playWrongSound(soundEnabled);
    }
    setRevealed(true);
  };

  const handleRevealOral = () => {
    if (!currentChallenge || revealed) return;
    playJokerSound(soundEnabled);
    setWonMethod('oral');
    setRevealed(true);
  };

  const handleUnlockNextHint = () => {
    if (hintLevel >= 3 || revealed) return;
    playJokerSound(soundEnabled);
    setHintLevel((h) => Math.min(3, h + 1));
  };

  const handleToggleAwardTeam = (teamId: string) => {
    const already = Boolean(awardedTeams[teamId]);
    if (already) {
      onUpdateScore(teamId, -currentPointValue);
      setAwardedTeams((prev) => ({ ...prev, [teamId]: false }));
    } else {
      playPointSound(soundEnabled);
      onUpdateScore(teamId, currentPointValue);
      setAwardedTeams((prev) => ({ ...prev, [teamId]: true }));
    }
  };

  const redactedDescription = useMemo(() => {
    if (!currentChallenge) return '';
    return redactTitleFromText(
      currentChallenge.description,
      currentChallenge.title
    );
  }, [currentChallenge]);

  const redactedExtract = useMemo(() => {
    if (!currentChallenge) return '';
    return redactTitleFromText(
      currentChallenge.extract,
      currentChallenge.title
    );
  }, [currentChallenge]);

  const initialsMask = useMemo(() => {
    if (!currentChallenge) return '';
    return buildInitialsMask(currentChallenge.title);
  }, [currentChallenge]);

  if (!currentChallenge) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-blue-500/35 bg-[#091942]/90 p-6 text-center">
        <RefreshCw className="h-8 w-8 animate-spin text-yellow-400 mb-2" />
        <p className="text-sm font-black text-white">
          Tirage d&apos;une page Wikipédia illustrée au hasard...
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2 overflow-hidden">
      {/* 1. Bandeau des scores (2 Couples ou 4 Joueurs) */}
      <Scoreboard
        mode={teamMode}
        teams={teams}
        onUpdateScore={onUpdateScore}
        onRenameTeam={onRenameTeam}
        lastScoredId={lastScoredId}
      />

      {/* 2. Barre de contrôle Wikipédia compacte sur 1 ligne en portrait */}
      <div className="shrink-0 flex items-center justify-between gap-1 rounded-xl border border-blue-500/35 bg-[#071436]/95 px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-md">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-black text-slate-900 shadow-sm shrink-0">
            <Globe className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-700" />
            <span>WIKIPÉDIA</span>
          </span>
          <span className="text-[10px] sm:text-xs font-extrabold text-blue-200 hidden md:inline truncate">
            Devinez le titre de la page à partir de son image principale !
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <div className="inline-flex rounded-lg bg-[#040b1e] p-0.5 border border-blue-500/30">
            <button
              type="button"
              onClick={() => handleChangeSourceMode('mix')}
              className={`inline-flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] font-black transition ${
                sourceMode === 'mix'
                  ? 'bg-yellow-400 text-blue-950 shadow'
                  : 'text-blue-200 hover:text-white'
              }`}
              title="Mélange équilibré d'articles célèbres et de pages tirées au hasard sur Wikipédia"
            >
              <Sparkles className="h-3 w-3 shrink-0" />
              <span>Mix</span>
            </button>
            <button
              type="button"
              onClick={() => handleChangeSourceMode('random')}
              className={`inline-flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] font-black transition ${
                sourceMode === 'random'
                  ? 'bg-sky-400 text-slate-950 shadow'
                  : 'text-sky-300 hover:text-white'
              }`}
              title="100% Pur Hasard sur tout Wikipédia FR (articles parfois insolites ou pointus !)"
            >
              <Shuffle className="h-3 w-3 shrink-0" />
              <span>Hasard</span>
            </button>
            <button
              type="button"
              onClick={() => handleChangeSourceMode('popular')}
              className={`inline-flex items-center gap-1 rounded-md px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] font-black transition ${
                sourceMode === 'popular'
                  ? 'bg-emerald-400 text-slate-950 shadow'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="Uniquement des pages Wikipédia célèbres et incontournables"
            >
              <BookOpen className="h-3 w-3 shrink-0" />
              <span>Classiques</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTeamMode}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-400/35 bg-blue-950/80 hover:bg-blue-900 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] font-extrabold text-blue-100 transition"
            title="Basculer l'affichage des scores entre 2 Équipes et 4 Joueurs"
          >
            {teamMode === '2_couples' ? (
              <>
                <Users className="h-3 w-3 text-yellow-400 shrink-0" />
                <span>2 Éq.</span>
              </>
            ) : (
              <>
                <User className="h-3 w-3 text-sky-400 shrink-0" />
                <span>4 J.</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Carte principale Wikipédia (optimisée portrait : zone centrale adaptative + barre du bas toujours fixe) */}
      <section className="flex-1 min-h-0 flex flex-col justify-between rounded-2xl border-2 border-yellow-400/45 bg-gradient-to-b from-[#0b1f52]/95 via-[#07153a]/95 to-[#050e29]/95 p-2 sm:p-4 shadow-2xl overflow-hidden">
        {/* En-tête de la carte : Numéro de page + Badge Points + Boutons d'aide (Indices / QCM) */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-1 mb-1.5">
          <div className="flex items-center gap-1">
            <span className="rounded-lg bg-yellow-400 px-2 py-0.5 text-[10px] sm:text-xs font-black uppercase text-blue-950 shadow">
              Page #{roundNumber}
            </span>
            <span
              className={`rounded-lg border px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-black ${
                currentChallenge.sourceType === 'random'
                  ? 'border-sky-400/50 bg-sky-500/15 text-sky-300'
                  : 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
              }`}
            >
              {currentChallenge.sourceType === 'random'
                ? '🎲 Aléatoire'
                : '⭐ Classique'}
            </span>
            <span className="rounded-lg border border-yellow-400/50 bg-yellow-400/15 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-black text-yellow-300">
              +{currentPointValue} pt{currentPointValue > 1 ? 's' : ''}
            </span>
          </div>

          {!revealed && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleUnlockNextHint}
                disabled={hintLevel >= 3}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-400/50 bg-amber-500/20 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-40 px-2 py-1 text-[10px] sm:text-xs font-black text-amber-300 transition"
                title="Débloquer un indice progressif (1: Catégorie, 2: Extrait caviardé, 3: Initiales)"
              >
                <Lightbulb className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span>
                  {hintLevel === 0
                    ? 'Indice (1/3)'
                    : hintLevel === 1
                    ? 'Extrait (2/3)'
                    : hintLevel === 2
                    ? 'Initiales (3/3)'
                    : '3/3 Indices'}
                </span>
              </button>

              {!showQcm && (
                <button
                  type="button"
                  onClick={() => {
                    playJokerSound(soundEnabled);
                    setShowQcm(true);
                  }}
                  className="inline-flex items-center gap-1 rounded-lg border border-sky-400/50 bg-sky-500/20 hover:bg-sky-400 hover:text-slate-950 px-2 py-1 text-[10px] sm:text-xs font-black text-sky-300 transition"
                  title="Afficher 4 propositions de titres Wikipédia (passe le gain à 1 pt)"
                >
                  <Grid className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  <span>4 Choix (1 pt)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Zone Centrale Scrollable : Image principale Wikipédia + Indices éventuels */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          <div className="min-h-full flex flex-col md:flex-row items-center justify-center gap-2 sm:gap-3">
            {/* Cadre Photo Wikipédia avec hauteur adaptative en mode portrait */}
            <div
              data-no-pull-refresh="true"
              onWheel={handleImageWheel}
              onMouseDown={handleMouseDownZoom}
              onMouseMove={handleMouseMoveZoom}
              onMouseUp={handleMouseUpZoom}
              onMouseLeave={handleMouseUpZoom}
              onTouchStart={handleTouchStartZoom}
              onTouchMove={handleTouchMoveZoom}
              onTouchEnd={handleTouchEndZoom}
              onDoubleClick={(e) => {
                e.stopPropagation();
                if (zoomScale > 1.1) {
                  resetZoom();
                } else {
                  setZoomScale(2.5);
                  setZoomPan({ x: 0, y: 0 });
                }
              }}
              className={`relative flex-1 w-full h-full ${
                hintLevel > 0 || revealed
                  ? 'min-h-[125px] max-h-[21dvh] sm:max-h-[26dvh] md:max-h-[44dvh]'
                  : 'min-h-[165px] max-h-[32dvh] sm:max-h-[36dvh] md:max-h-[44dvh]'
              } flex items-center justify-center rounded-xl border border-blue-400/35 bg-[#03091a]/90 p-1.5 overflow-hidden select-none group transition-all ${
                zoomScale > 1
                  ? isDraggingZoom
                    ? 'cursor-grabbing touch-none'
                    : 'cursor-grab touch-none'
                  : 'cursor-zoom-in'
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={currentChallenge.imageUrl}
                alt="Image principale Wikipédia à deviner"
                draggable={false}
                onError={() => {
                  // Si une miniature Wikimedia échoue au chargement, passer automatiquement à la suivante
                  handleNextPage();
                }}
                onClick={() => {
                  if (dragStartRef.current?.moved) return;
                  if (zoomScale <= 1.02) {
                    setIsFullscreenZoom(true);
                  }
                }}
                style={{
                  transform: `translate3d(${zoomPan.x}px, ${zoomPan.y}px, 0) scale(${zoomScale})`,
                  transition: isDraggingZoom ? 'none' : 'transform 0.18s ease-out',
                }}
                className="max-h-full max-w-full rounded-lg object-contain pointer-events-auto select-none"
              />

              {/* Badge d'état quand l'image est zoomée dans le cadre */}
              {zoomScale > 1.02 && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                  className="absolute top-1.5 left-1.5 z-10 inline-flex items-center gap-1 rounded-lg bg-slate-950/85 border border-yellow-400/40 px-2 py-0.5 text-[10px] font-bold text-yellow-300 shadow-md"
                >
                  <Move className="h-3 w-3 shrink-0" />
                  <span className="hidden xs:inline">Glissez</span>
                  <button
                    type="button"
                    onClick={resetZoom}
                    className="ml-0.5 inline-flex items-center gap-0.5 rounded bg-yellow-400/20 hover:bg-yellow-400 hover:text-slate-950 px-1.5 py-0.5 text-[10px] font-black text-yellow-200 transition"
                    title="Réinitialiser le zoom (x1)"
                  >
                    <RotateCcw className="h-2.5 w-2.5" />
                    <span>x1</span>
                  </button>
                </div>
              )}

              {/* Barre d'outils de zoom en bas à droite de l'image */}
              <div
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className="absolute bottom-1.5 right-1.5 z-10 inline-flex items-center gap-0.5 rounded-xl bg-slate-950/90 border border-white/20 p-1 shadow-lg backdrop-blur-sm"
              >
                <button
                  type="button"
                  onClick={() => handleZoomStep(-0.75)}
                  disabled={zoomScale <= 1.02}
                  className="inline-flex items-center justify-center rounded-lg p-1 text-white/90 hover:bg-blue-800 disabled:opacity-35 transition"
                  title="Dézoomer (-)"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (zoomScale > 1.02) {
                      resetZoom();
                    } else {
                      applyZoomScale(2);
                    }
                  }}
                  className="rounded-md px-1 py-0.5 text-[10px] font-black text-yellow-300 hover:bg-white/10 transition min-w-[34px] text-center"
                  title={
                    zoomScale > 1.02
                      ? 'Réinitialiser le zoom à 100%'
                      : 'Zoomer à 200%'
                  }
                >
                  {Math.round(zoomScale * 100)}%
                </button>

                <button
                  type="button"
                  onClick={() => handleZoomStep(0.75)}
                  disabled={zoomScale >= 5}
                  className="inline-flex items-center justify-center rounded-lg p-1 text-white/90 hover:bg-blue-800 disabled:opacity-35 transition"
                  title="Zoomer sur l’image (+)"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </button>

                <div className="h-3.5 w-px bg-white/20 mx-0.5" />

                <button
                  type="button"
                  onClick={() => setIsFullscreenZoom(true)}
                  className="inline-flex items-center gap-1 rounded-lg bg-yellow-400 hover:bg-yellow-300 px-1.5 py-0.5 text-[10px] font-black text-slate-950 transition shadow"
                  title="Ouvrir l'image en plein écran avec la loupe interactive"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>Loupe</span>
                </button>
              </div>
            </div>

            {/* Panneau latéral (ou sous l'image en portrait) : Indices débloqués OU Résultat complet une fois révélé */}
            {(hintLevel > 0 || revealed) && (
              <div className="w-full md:w-2/5 shrink-0 flex flex-col gap-1 sm:gap-1.5 rounded-xl border border-blue-400/35 bg-blue-950/65 p-2 sm:p-2.5 text-left">
                {!revealed ? (
                  <>
                    <div className="flex items-center gap-1 text-[10px] sm:text-[11px] font-black uppercase text-amber-300">
                      <HelpCircle className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      <span>Indices Wikipédia</span>
                    </div>

                    {hintLevel >= 1 && (
                      <div className="rounded-lg bg-[#050f2c] border border-amber-400/30 px-2 py-1">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-amber-400 block">
                          Indice 1 — Description :
                        </span>
                        <p className="text-[11px] sm:text-xs font-bold text-white leading-snug">
                          {redactedDescription}
                        </p>
                      </div>
                    )}

                    {hintLevel >= 2 && (
                      <div className="rounded-lg bg-[#050f2c] border border-sky-400/30 px-2 py-1">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-sky-400 block">
                          Indice 2 — Extrait caviardé :
                        </span>
                        <p className="text-[10px] sm:text-[11px] leading-snug text-blue-100 line-clamp-2 sm:line-clamp-3">
                          {redactedExtract}
                        </p>
                      </div>
                    )}

                    {hintLevel >= 3 && (
                      <div className="rounded-lg bg-[#050f2c] border border-emerald-400/30 px-2 py-1">
                        <span className="text-[9px] sm:text-[10px] font-black uppercase text-emerald-400 block">
                          Indice 3 — Structure du titre :
                        </span>
                        <p className="font-mono text-xs sm:text-sm font-black tracking-wider text-yellow-300">
                          {initialsMask}
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                          wonMethod === 'cash'
                            ? 'bg-emerald-400 text-slate-950'
                            : wonMethod === 'qcm'
                            ? 'bg-sky-400 text-slate-950'
                            : 'bg-yellow-400 text-blue-950'
                        }`}
                      >
                        {wonMethod === 'cash' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Trouvé en Cash !</span>
                          </>
                        ) : wonMethod === 'qcm' ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Réponse QCM</span>
                          </>
                        ) : (
                          <>
                            <Globe className="h-3 w-3" />
                            <span>Titre Officiel Wikipédia</span>
                          </>
                        )}
                      </span>

                      <a
                        href={currentChallenge.pageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-md border border-blue-400/40 bg-blue-900/60 hover:bg-blue-800 px-2 py-0.5 text-[10px] font-bold text-sky-300 transition"
                      >
                        <span>Article</span>
                        <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>

                    <h2 className="text-sm sm:text-xl font-black text-yellow-300 leading-tight">
                      {currentChallenge.title}
                    </h2>

                    {currentChallenge.description && (
                      <p className="text-[10px] sm:text-[11px] font-bold text-sky-200 leading-snug">
                        {currentChallenge.description}
                      </p>
                    )}

                    <p className="text-[10px] sm:text-[11px] leading-snug text-blue-100/90 line-clamp-2 sm:line-clamp-3">
                      {currentChallenge.extract}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Zone du bas FIXE (shrink-0) : Saisie Cash / QCM 4 choix (2x2 en portrait) / Attribution des points & Page suivante */}
        <div className="shrink-0 pt-1.5 mt-1.5 border-t border-blue-500/30 flex flex-col gap-1.5">
          {!revealed ? (
            <>
              {/* Si le mode QCM 4 choix est activé : Grille 2x2 dès le mode portrait mobile */}
              {showQcm ? (
                <div className="grid grid-cols-2 gap-1.5">
                  {currentChallenge.options.map((opt, idx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectQcmOption(idx)}
                      className="flex items-center gap-1.5 sm:gap-2 rounded-xl border border-blue-400/45 bg-blue-950/85 hover:border-yellow-400 hover:bg-blue-900/90 px-2.5 py-2 text-left transition active:scale-[0.99]"
                    >
                      <span className="flex h-5 w-5 sm:h-6 sm:w-6 shrink-0 items-center justify-center rounded-md sm:rounded-lg bg-yellow-400 text-[10px] sm:text-xs font-black text-blue-950">
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="text-[11px] sm:text-sm font-extrabold text-white line-clamp-2 leading-tight">
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                /* Formulaire de saisie Cash + Bouton Révéler à l'oral */
                <div className="flex flex-col gap-1.5">
                  {wrongAttemptMessage && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-rose-400/50 bg-rose-500/20 px-2.5 py-1 text-[11px] font-bold text-rose-200 animate-shake">
                      <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                      <span className="truncate">
                        {wrongAttemptMessage} Essayez encore ou passez en 4 Choix !
                      </span>
                    </div>
                  )}

                  <form
                    onSubmit={handleCashSubmit}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5"
                  >
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-blue-300/70" />
                      <input
                        type="text"
                        value={guessInput}
                        onChange={(e) => setGuessInput(e.target.value)}
                        placeholder="Titre de la page Wikipédia (ou jouez à l'oral)..."
                        className="w-full rounded-xl border border-blue-400/50 bg-[#040c24] pl-8 pr-3 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white placeholder-blue-300/50 focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="submit"
                        disabled={!guessInput.trim()}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 disabled:opacity-40 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-blue-950 shadow transition active:scale-95"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Valider</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRevealOral}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1 rounded-xl border border-yellow-400/55 bg-yellow-400/15 hover:bg-yellow-400 hover:text-blue-950 px-2.5 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-black text-yellow-300 transition active:scale-95"
                        title="Révéler directement le titre de la page Wikipédia (idéal pour jouer à l'oral en soirée)"
                      >
                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span>Révéler</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextPage}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-400/35 bg-blue-950/80 hover:bg-blue-900 px-2.5 py-1.5 sm:py-2 text-xs font-bold text-blue-200 transition"
                        title="Passer à une autre page Wikipédia"
                      >
                        <Shuffle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden md:inline">Autre image</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            /* État Révélé : Si QCM utilisé, rappeler les 4 choix colorés + Barre d'attribution des points + Bouton Page Suivante */
            <div className="flex flex-col gap-1.5">
              {showQcm && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {currentChallenge.options.map((opt, idx) => {
                    const isCorrect = idx === currentChallenge.correctIndex;
                    const isSelected = idx === selectedQcmIndex;
                    let style =
                      'border-blue-500/30 bg-blue-950/40 text-blue-200/60';
                    if (isCorrect) {
                      style =
                        'border-emerald-400 bg-emerald-500/25 text-emerald-200 font-black';
                    } else if (isSelected) {
                      style =
                        'border-rose-400 bg-rose-500/25 text-rose-200 font-bold';
                    }
                    return (
                      <div
                        key={opt}
                        className={`flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] ${style}`}
                      >
                        <span className="font-black">{OPTION_LETTERS[idx]}.</span>
                        <span className="truncate">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Attribution rapide des points aux équipes / joueurs + Bouton Page suivante */}
              <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-yellow-400/40 bg-[#050f2c]/95 px-2 py-1.5">
                <div className="flex flex-wrap items-center gap-1">
                  <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-black uppercase text-yellow-300 mr-0.5">
                    <Award className="h-3.5 w-3.5" />
                    <span>+{currentPointValue} pt{currentPointValue > 1 ? 's' : ''} :</span>
                  </span>

                  {teams.map((team, idx) => {
                    const awarded = Boolean(awardedTeams[team.id]);
                    const tag = teams.length === 4 ? `J${idx + 1}` : `E${idx + 1}`;
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => handleToggleAwardTeam(team.id)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] sm:text-xs font-black transition active:scale-95 ${
                          awarded
                            ? 'border-emerald-300 bg-emerald-400 text-slate-950 shadow'
                            : 'border-yellow-400/50 bg-yellow-400/15 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950'
                        }`}
                      >
                        <span>
                          {awarded
                            ? `✓ +${currentPointValue}`
                            : `+${currentPointValue}`}
                        </span>
                        <span className="rounded bg-yellow-400/25 px-1 text-[9px] text-yellow-200">
                          {tag}
                        </span>
                        <span className="truncate max-w-[60px] sm:max-w-[100px]">
                          {team.name}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleNextPage}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-black text-blue-950 shadow-lg transition active:scale-95"
                >
                  <span>
                    {isFetchingMore && currentIndex + 1 >= queue.length
                      ? 'Chargement...'
                      : 'Page suivante'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. Modale Loupe Plein Écran (Zoom interactif x1 à x5 + Déplacement libre) */}
      {isFullscreenZoom && (
        <div
          data-no-pull-refresh="true"
          className="fixed inset-0 z-[100000] flex flex-col bg-slate-950/95 backdrop-blur-md select-none animate-fadeIn"
        >
          {/* Barre supérieure de la modale */}
          <div className="shrink-0 flex items-center justify-between gap-2 border-b border-blue-500/30 bg-[#050f2c]/95 px-3 py-2.5 sm:px-5">
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-flex items-center gap-1 rounded-lg bg-yellow-400 px-2 py-0.5 text-xs font-black text-blue-950 shadow">
                <ZoomIn className="h-3.5 w-3.5" />
                <span>LOUPE WIKIPÉDIA</span>
              </span>
              <span className="text-xs font-bold text-blue-200 truncate hidden sm:inline">
                Pincez à 2 doigts, utilisez la molette ou glissez pour inspecter les détails
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreenZoom(false)}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/25 bg-white/10 hover:bg-rose-500 hover:border-rose-400 px-3 py-1.5 text-xs font-black text-white transition"
            >
              <X className="h-4 w-4" />
              <span>Fermer</span>
            </button>
          </div>

          {/* Zone centrale d'exploration de l'image */}
          <div
            data-no-pull-refresh="true"
            onWheel={handleImageWheel}
            onMouseDown={handleMouseDownZoom}
            onMouseMove={handleMouseMoveZoom}
            onMouseUp={handleMouseUpZoom}
            onMouseLeave={handleMouseUpZoom}
            onTouchStart={handleTouchStartZoom}
            onTouchMove={handleTouchMoveZoom}
            onTouchEnd={handleTouchEndZoom}
            onClick={(e) => {
              if (e.target === e.currentTarget && !dragStartRef.current?.moved && zoomScale <= 1.02) {
                setIsFullscreenZoom(false);
              }
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              if (zoomScale > 1.1) {
                resetZoom();
              } else {
                applyZoomScale(2.5);
              }
            }}
            className={`relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden p-2 sm:p-6 touch-none ${
              zoomScale > 1
                ? isDraggingZoom
                  ? 'cursor-grabbing'
                  : 'cursor-grab'
                : 'cursor-zoom-in'
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentChallenge.imageUrl}
              alt="Image Wikipédia en plein écran"
              draggable={false}
              onClick={(e) => {
                e.stopPropagation();
                if (dragStartRef.current?.moved) return;
                if (zoomScale <= 1.02) {
                  applyZoomScale(2);
                }
              }}
              style={{
                transform: `translate3d(${zoomPan.x}px, ${zoomPan.y}px, 0) scale(${zoomScale})`,
                transition: isDraggingZoom ? 'none' : 'transform 0.18s ease-out',
              }}
              className="max-h-full max-w-full rounded-lg object-contain shadow-2xl select-none"
            />
          </div>

          {/* Barre inférieure de contrôle du niveau de zoom */}
          <div className="shrink-0 flex flex-wrap items-center justify-center gap-2 border-t border-blue-500/30 bg-[#050f2c]/95 px-3 py-2.5">
            <button
              type="button"
              onClick={() => handleZoomStep(-0.75)}
              disabled={zoomScale <= 1.02}
              className="inline-flex items-center justify-center rounded-xl border border-blue-400/40 bg-blue-950 hover:bg-blue-800 disabled:opacity-35 p-2 text-white transition"
              title="Dézoomer (-)"
            >
              <ZoomOut className="h-4 w-4" />
            </button>

            <div className="inline-flex items-center gap-1 rounded-xl bg-[#03091c] p-1 border border-blue-500/30">
              {[1, 1.5, 2, 3, 4].map((lvl) => {
                const isActive = Math.abs(zoomScale - lvl) < 0.2;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => applyZoomScale(lvl)}
                    className={`rounded-lg px-2.5 py-1 text-xs font-black transition ${
                      isActive
                        ? 'bg-yellow-400 text-blue-950 shadow'
                        : 'text-blue-200 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    x{lvl}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => handleZoomStep(0.75)}
              disabled={zoomScale >= 5}
              className="inline-flex items-center justify-center rounded-xl border border-blue-400/40 bg-blue-950 hover:bg-blue-800 disabled:opacity-35 p-2 text-white transition"
              title="Zoomer (+)"
            >
              <ZoomIn className="h-4 w-4" />
            </button>

            {(zoomScale > 1.02 || zoomPan.x !== 0 || zoomPan.y !== 0) && (
              <button
                type="button"
                onClick={resetZoom}
                className="inline-flex items-center gap-1 rounded-xl border border-amber-400/50 bg-amber-500/20 hover:bg-amber-400 hover:text-slate-950 px-3 py-1.5 text-xs font-black text-amber-300 transition"
                title="Réinitialiser le cadrage et le zoom"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Recadrer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
