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

/**
 * Liste de grands classiques encyclopédiques sur Wikipédia FR (utilisée pour le mode Populaire / Mix
 * et en secours instantané pendant le préchargement réseau).
 */
const FAMOUS_WIKI_TITLES: string[] = [
  'Tour Eiffel',
  'La Joconde',
  'Mont Saint-Michel',
  'Statue de la Liberté',
  'Colisée',
  'Taj Mahal',
  'Machu Picchu',
  'Grande Muraille',
  'Château de Versailles',
  'Cathédrale Notre-Dame de Paris',
  'Pyramide de Khéops',
  'Pétra',
  'Christ Rédempteur',
  'Acropole d\'Athènes',
  'Stonehenge',
  'Opéra de Sydney',
  'Golden Gate Bridge',
  'Big Ben',
  'Sagrada Família',
  'Pont du Gard',
  'Château de Chambord',
  'Dune du Pilat',
  'Mont Blanc',
  'Grand Canyon',
  'Chutes du Niagara',
  'Mont Fuji',
  'Ornithorynque',
  'Axolotl',
  'Panda géant',
  'Tardigrade',
  'Caméléon',
  'Narval',
  'Koala',
  'Toucan',
  'Flamant rose',
  'Manchot empereur',
  'Baleine bleue',
  'Pieuvre',
  'Raton laveur',
  'Suricate',
  'Capibara',
  'Quokka',
  'Pangolin',
  'Dodo',
  'Tyrannosaurus',
  'Mammouth laineux',
  'Napoléon Ier',
  'Albert Einstein',
  'Marie Curie',
  'Léonard de Vinci',
  'Cléopâtre VII',
  'Louis XIV',
  'Charlie Chaplin',
  'Marilyn Monroe',
  'Michael Jackson',
  'Zinédine Zidane',
  'Thomas Pesquet',
  'Molière',
  'Victor Hugo',
  'Jules Verne',
  'Frida Kahlo',
  'Vincent van Gogh',
  'La Nuit étoilée',
  'Le Cri',
  'Guernica',
  'La Liberté guidant le peuple',
  'Le Penseur',
  'Vénus de Milo',
  'Masque de Toutânkhamon',
  'Pierre de Rosette',
  'Grotte de Lascaux',
  'Moaï',
  'Titanic',
  'Concorde (avion)',
  'Apollo 11',
  'Station spatiale internationale',
  'Télescope spatial James-Webb',
  'TGV',
  'Citroën 2CV',
  'Vespa',
  'Rubik\'s Cube',
  'Game Boy',
  'Minitel',
  'Walkman',
  'Croissant (viennoiserie)',
  'Baguette de pain',
  'Ratatouille',
  'Fondue savoyarde',
  'Macaron',
  'Camembert de Normandie',
  'Sushi',
  'Pizza',
  'Tour de France',
  'Coupe du monde de football',
  'Jeux olympiques',
  'Roland-Garros',
  'Astérix',
  'Tintin',
  'Lucky Luke',
  'Pikachu',
  'Mario (personnage)',
  'Dark Vador',
  'Harry Potter',
  'Tour de Pise',
  'Alhambra (Grenade)',
  'Mont Rushmore',
  'Chichén Itzá',
  'Angkor Wat',
  'Aurore polaire',
  'Éclipse solaire',
  'Vésuve',
  'Pompeï',
  'baobab',
  'Séquoia géant',
  'Bonsaï',
  'Tournesol',
  'Attrape-mouche de Vénus',
  'Blob (Physarum polycephalum)',
];

/**
 * Secours hors-ligne immédiat si l'API Wikipédia met du temps au tout premier rendu
 */
const INSTANT_FALLBACK_CHALLENGES: Omit<WikiPageChallenge, 'options' | 'correctIndex'>[] = [
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
    /^\d{4}(\s|$)/.test(lowerTitle) // éviter les pages d'années pures ex: "1984 en sport"
  ) {
    return false;
  }
  return true;
}

function buildOptionsForChallenge(
  correctTitle: string,
  distractorPool: string[]
): { options: string[]; correctIndex: number } {
  const cleanCorrect = stripParentheses(correctTitle);
  const candidates = distractorPool
    .map((t) => stripParentheses(t))
    .filter(
      (t) =>
        t &&
        t.toLowerCase() !== cleanCorrect.toLowerCase() &&
        t.length >= 3
    );

  // Mélanger les candidats
  const shuffledCandidates = [...candidates].sort(() => Math.random() - 0.5);
  const chosenDistractors: string[] = [];
  const usedLower = new Set<string>([cleanCorrect.toLowerCase()]);

  for (const cand of shuffledCandidates) {
    if (!usedLower.has(cand.toLowerCase())) {
      usedLower.add(cand.toLowerCase());
      chosenDistractors.push(cand);
      if (chosenDistractors.length === 3) break;
    }
  }

  while (chosenDistractors.length < 3) {
    const fallback = stripParentheses(
      FAMOUS_WIKI_TITLES[Math.floor(Math.random() * FAMOUS_WIKI_TITLES.length)]
    );
    if (!usedLower.has(fallback.toLowerCase())) {
      usedLower.add(fallback.toLowerCase());
      chosenDistractors.push(fallback);
    }
  }

  const allOptions = [cleanCorrect, ...chosenDistractors].sort(
    () => Math.random() - 0.5
  );
  const correctIndex = allOptions.findIndex(
    (o) => o.toLowerCase() === cleanCorrect.toLowerCase()
  );

  return {
    options: allOptions,
    correctIndex: correctIndex >= 0 ? correctIndex : 0,
  };
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

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
  const [queue, setQueue] = useState<WikiPageChallenge[]>(() => {
    const shuffled = [...INSTANT_FALLBACK_CHALLENGES].sort(
      () => Math.random() - 0.5
    );
    return shuffled.map((item) => {
      const { options, correctIndex } = buildOptionsForChallenge(
        item.title,
        FAMOUS_WIKI_TITLES
      );
      return {
        ...item,
        options,
        correctIndex,
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
  const [zoomedImage, setZoomedImage] = useState<boolean>(false);
  const [awardedTeams, setAwardedTeams] = useState<Record<string, boolean>>({});

  const seenPageIdsRef = useRef<Set<string>>(
    new Set(INSTANT_FALLBACK_CHALLENGES.map((c) => String(c.pageid)))
  );
  const fetchingRef = useRef<boolean>(false);

  const currentChallenge = queue[currentIndex] || null;

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
   */
  const fetchRandomWikiBatch = useCallback(async (): Promise<WikiPageChallenge[]> => {
    const url =
      'https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=random&grnnamespace=0&grnlimit=30&prop=pageimages|extracts|description|info&pithumbsize=900&exintro=1&explaintext=1&exsentences=2&inprop=url';

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
    }>;

    const allTitlesInBatch = rawPages.map((p) => p.title);
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
      const { options, correctIndex } = buildOptionsForChallenge(p.title, [
        ...allTitlesInBatch,
        ...FAMOUS_WIKI_TITLES,
      ]);

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
      });
    }

    return validChallenges;
  }, []);

  /**
   * Récupère un lot de pages populaires/illustres depuis Wikipédia FR avec leurs vraies images principales
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
    const url = `https://fr.wikipedia.org/w/api.php?action=query&format=json&origin=*&redirects=1&titles=${titlesParam}&prop=pageimages|extracts|description|info&pithumbsize=900&exintro=1&explaintext=1&exsentences=2&inprop=url`;

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

      const { options, correctIndex } = buildOptionsForChallenge(
        p.title,
        FAMOUS_WIKI_TITLES
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

  // Précharger l'image suivante dès que l'index change
  useEffect(() => {
    const nextItem = queue[currentIndex + 1];
    if (nextItem && typeof window !== 'undefined') {
      const img = new window.Image();
      img.src = nextItem.imageUrl;
    }
  }, [currentIndex, queue]);

  const resetRoundState = useCallback(() => {
    setGuessInput('');
    setWrongAttemptMessage(null);
    setRevealed(false);
    setWonMethod(null);
    setShowQcm(false);
    setSelectedQcmIndex(null);
    setHintLevel(0);
    setZoomedImage(false);
    setAwardedTeams({});
  }, []);

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
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
      {/* 1. Bandeau des scores (2 Couples ou 4 Joueurs) */}
      <Scoreboard
        mode={teamMode}
        teams={teams}
        onUpdateScore={onUpdateScore}
        onRenameTeam={onRenameTeam}
        lastScoredId={lastScoredId}
      />

      {/* 2. Barre de contrôle Wikipédia : Choix du tirage (Mix / Pur Hasard / Célèbres) + Switch 2 Couples / 4 Solo */}
      <div className="shrink-0 flex flex-wrap items-center justify-between gap-1.5 rounded-xl border border-blue-500/35 bg-[#071436]/95 px-2.5 py-1.5 shadow-md">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg bg-white px-2 py-0.5 text-[10px] sm:text-xs font-black text-slate-900 shadow-sm">
            <Globe className="h-3.5 w-3.5 text-blue-700" />
            <span>WIKIPÉDIA</span>
          </span>
          <span className="text-[10px] sm:text-xs font-extrabold text-blue-200 hidden sm:inline">
            Devinez le titre de la page à partir de son image principale !
          </span>
        </div>

        <div className="flex items-center gap-1 flex-wrap">
          <div className="inline-flex rounded-lg bg-[#040b1e] p-0.5 border border-blue-500/30">
            <button
              type="button"
              onClick={() => handleChangeSourceMode('mix')}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black transition ${
                sourceMode === 'mix'
                  ? 'bg-yellow-400 text-blue-950 shadow'
                  : 'text-blue-200 hover:text-white'
              }`}
              title="Mélange équilibré d'articles célèbres et de pages tirées au hasard sur Wikipédia"
            >
              <Sparkles className="h-3 w-3" />
              <span>Mix</span>
            </button>
            <button
              type="button"
              onClick={() => handleChangeSourceMode('random')}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black transition ${
                sourceMode === 'random'
                  ? 'bg-sky-400 text-slate-950 shadow'
                  : 'text-sky-300 hover:text-white'
              }`}
              title="100% Pur Hasard sur tout Wikipédia FR (articles parfois insolites ou pointus !)"
            >
              <Shuffle className="h-3 w-3" />
              <span>Pur Hasard</span>
            </button>
            <button
              type="button"
              onClick={() => handleChangeSourceMode('popular')}
              className={`inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black transition ${
                sourceMode === 'popular'
                  ? 'bg-emerald-400 text-slate-950 shadow'
                  : 'text-emerald-300 hover:text-white'
              }`}
              title="Uniquement des pages Wikipédia célèbres et incontournables"
            >
              <BookOpen className="h-3 w-3" />
              <span>Classiques</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onToggleTeamMode}
            className="inline-flex items-center gap-1 rounded-lg border border-blue-400/35 bg-blue-950/80 hover:bg-blue-900 px-2 py-1 text-[10px] font-extrabold text-blue-100 transition"
            title="Basculer l'affichage des scores entre 2 Couples et 4 Joueurs"
          >
            {teamMode === '2_couples' ? (
              <>
                <Users className="h-3 w-3 text-yellow-400" />
                <span className="hidden xs:inline">2 Couples</span>
              </>
            ) : (
              <>
                <User className="h-3 w-3 text-sky-400" />
                <span className="hidden xs:inline">4 Solo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. Carte principale Wikipédia */}
      <section className="flex-1 min-h-0 flex flex-col justify-between rounded-2xl border-2 border-yellow-400/45 bg-gradient-to-b from-[#0b1f52]/95 via-[#07153a]/95 to-[#050e29]/95 p-2.5 sm:p-4 shadow-2xl overflow-y-auto">
        {/* En-tête de la carte : Numéro de page + Badge Points + Boutons d'aide (Indices / QCM) */}
        <div className="shrink-0 flex flex-wrap items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <span className="rounded-lg bg-yellow-400 px-2 py-0.5 text-[10px] sm:text-xs font-black uppercase text-blue-950 shadow">
              Page #{roundNumber}
            </span>
            <span
              className={`rounded-lg border px-2 py-0.5 text-[10px] sm:text-xs font-black ${
                currentChallenge.sourceType === 'random'
                  ? 'border-sky-400/50 bg-sky-500/15 text-sky-300'
                  : 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300'
              }`}
            >
              {currentChallenge.sourceType === 'random'
                ? '🎲 Aléatoire Wikipédia'
                : '⭐ Classique Wikipédia'}
            </span>
            <span className="rounded-lg border border-yellow-400/50 bg-yellow-400/15 px-2 py-0.5 text-[10px] sm:text-xs font-black text-yellow-300">
              +{currentPointValue} pt{currentPointValue > 1 ? 's' : ''}
            </span>
          </div>

          {!revealed && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleUnlockNextHint}
                disabled={hintLevel >= 3}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-400/50 bg-amber-500/20 hover:bg-amber-400 hover:text-slate-950 disabled:opacity-40 px-2 py-1 text-[10px] sm:text-xs font-black text-amber-300 transition"
                title="Débloquer un indice progressif (1: Catégorie, 2: Extrait caviardé, 3: Initiales)"
              >
                <Lightbulb className="h-3.5 w-3.5" />
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
                  <Grid className="h-3.5 w-3.5" />
                  <span>4 Choix (1 pt)</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Zone Centrale : Image principale Wikipédia + Indices éventuels */}
        <div className="flex-1 min-h-0 flex flex-col md:flex-row items-center justify-center gap-3 my-1">
          {/* Cadre Photo Wikipédia */}
          <div className="relative flex-1 w-full h-full min-h-[160px] max-h-[38dvh] md:max-h-[44dvh] flex items-center justify-center rounded-xl border border-blue-400/35 bg-[#03091a]/90 p-1.5 overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={currentChallenge.imageUrl}
              alt="Image principale Wikipédia à deviner"
              onError={() => {
                // Si une miniature Wikimedia échoue au chargement, passer automatiquement à la suivante
                handleNextPage();
              }}
              onClick={() => setZoomedImage((z) => !z)}
              className={`max-h-full max-w-full rounded-lg transition-all duration-300 cursor-zoom-in ${
                zoomedImage
                  ? 'object-cover scale-125 cursor-zoom-out'
                  : 'object-contain'
              }`}
            />

            <button
              type="button"
              onClick={() => setZoomedImage((z) => !z)}
              className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-slate-950/80 border border-white/20 px-2 py-1 text-[10px] font-bold text-white/90 hover:bg-yellow-400 hover:text-slate-950 transition"
              title={zoomedImage ? 'Dézoomer' : 'Zoomer sur l’image'}
            >
              {zoomedImage ? (
                <>
                  <ZoomOut className="h-3 w-3" />
                  <span>Réduire</span>
                </>
              ) : (
                <>
                  <ZoomIn className="h-3 w-3" />
                  <span>Loupe</span>
                </>
              )}
            </button>
          </div>

          {/* Panneau latéral (ou sous l'image) : Indices débloqués OU Résultat complet une fois révélé */}
          {(hintLevel > 0 || revealed) && (
            <div className="w-full md:w-2/5 shrink-0 flex flex-col gap-1.5 rounded-xl border border-blue-400/35 bg-blue-950/65 p-2.5 text-left">
              {!revealed ? (
                <>
                  <div className="flex items-center gap-1 text-[11px] font-black uppercase text-amber-300">
                    <HelpCircle className="h-3.5 w-3.5" />
                    <span>Indices Wikipédia</span>
                  </div>

                  {hintLevel >= 1 && (
                    <div className="rounded-lg bg-[#050f2c] border border-amber-400/30 px-2.5 py-1.5">
                      <span className="text-[10px] font-black uppercase text-amber-400 block">
                        Indice 1 — Description :
                      </span>
                      <p className="text-xs font-bold text-white">
                        {redactedDescription}
                      </p>
                    </div>
                  )}

                  {hintLevel >= 2 && (
                    <div className="rounded-lg bg-[#050f2c] border border-sky-400/30 px-2.5 py-1.5">
                      <span className="text-[10px] font-black uppercase text-sky-400 block">
                        Indice 2 — Extrait caviardé :
                      </span>
                      <p className="text-[11px] leading-snug text-blue-100 line-clamp-3">
                        {redactedExtract}
                      </p>
                    </div>
                  )}

                  {hintLevel >= 3 && (
                    <div className="rounded-lg bg-[#050f2c] border border-emerald-400/30 px-2.5 py-1.5">
                      <span className="text-[10px] font-black uppercase text-emerald-400 block">
                        Indice 3 — Structure du titre :
                      </span>
                      <p className="font-mono text-xs sm:text-sm font-black tracking-wider text-yellow-300">
                        {initialsMask}
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-1.5">
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
                      <span>Article Wikipédia</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  </div>

                  <h2 className="text-base sm:text-xl font-black text-yellow-300 leading-tight">
                    {currentChallenge.title}
                  </h2>

                  {currentChallenge.description && (
                    <p className="text-[11px] font-bold text-sky-200">
                      {currentChallenge.description}
                    </p>
                  )}

                  <p className="text-[11px] leading-snug text-blue-100/90 line-clamp-3">
                    {currentChallenge.extract}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Zone du bas : Saisie Cash / QCM 4 choix / Attribution des points & Page suivante */}
        <div className="shrink-0 mt-2 flex flex-col gap-2">
          {!revealed ? (
            <>
              {/* Si le mode QCM 4 choix est activé */}
              {showQcm ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {currentChallenge.options.map((opt, idx) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => handleSelectQcmOption(idx)}
                      className="flex items-center gap-2 rounded-xl border border-blue-400/45 bg-blue-950/85 hover:border-yellow-400 hover:bg-blue-900/90 px-3 py-2 text-left transition active:scale-[0.99]"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-yellow-400 text-xs font-black text-blue-950">
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="text-xs sm:text-sm font-extrabold text-white truncate">
                        {opt}
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                /* Formulaire de saisie Cash + Bouton Révéler à l'oral */
                <div className="flex flex-col gap-1.5">
                  {wrongAttemptMessage && (
                    <div className="flex items-center gap-1.5 rounded-lg border border-rose-400/50 bg-rose-500/20 px-2.5 py-1 text-xs font-bold text-rose-200 animate-shake">
                      <XCircle className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                      <span>
                        {wrongAttemptMessage} Essayez encore, prenez un indice ou
                        passez en 4 Choix !
                      </span>
                    </div>
                  )}

                  <form
                    onSubmit={handleCashSubmit}
                    className="flex flex-col sm:flex-row items-stretch sm:items-center gap-1.5"
                  >
                    <div className="relative flex-1">
                      <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-300/70" />
                      <input
                        type="text"
                        value={guessInput}
                        onChange={(e) => setGuessInput(e.target.value)}
                        placeholder="Tapez le titre de la page Wikipédia (ou jouez à l'oral)..."
                        className="w-full rounded-xl border border-blue-400/50 bg-[#040c24] pl-9 pr-3 py-2 text-xs sm:text-sm font-bold text-white placeholder-blue-300/50 focus:border-yellow-400 focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="submit"
                        disabled={!guessInput.trim()}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 disabled:opacity-40 px-4 py-2 text-xs sm:text-sm font-black text-blue-950 shadow transition active:scale-95"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        <span>Valider</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRevealOral}
                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl border border-yellow-400/55 bg-yellow-400/15 hover:bg-yellow-400 hover:text-blue-950 px-3 py-2 text-xs sm:text-sm font-black text-yellow-300 transition active:scale-95"
                        title="Révéler directement le titre de la page Wikipédia (idéal pour jouer à l'oral en soirée)"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Révéler le titre</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleNextPage}
                        className="inline-flex items-center justify-center gap-1 rounded-xl border border-blue-400/35 bg-blue-950/80 hover:bg-blue-900 px-2.5 py-2 text-xs font-bold text-blue-200 transition"
                        title="Passer à une autre page Wikipédia"
                      >
                        <Shuffle className="h-4 w-4" />
                        <span className="hidden md:inline">Autre image</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            /* État Révélé : Si QCM utilisé, rappeler les 4 choix colorés + Barre d'attribution des points + Bouton Page Suivante */
            <div className="flex flex-col gap-2">
              {showQcm && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
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
                        className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs ${style}`}
                      >
                        <span className="font-black">{OPTION_LETTERS[idx]}.</span>
                        <span className="truncate">{opt}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Attribution rapide des points aux équipes / joueurs + Bouton Page suivante */}
              <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-yellow-400/40 bg-[#050f2c]/95 px-2.5 py-2">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase text-yellow-300 mr-1">
                    <Award className="h-3.5 w-3.5" />
                    <span>+{currentPointValue} pt{currentPointValue > 1 ? 's' : ''} :</span>
                  </span>

                  {teams.map((team) => {
                    const awarded = Boolean(awardedTeams[team.id]);
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => handleToggleAwardTeam(team.id)}
                        className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-black transition active:scale-95 ${
                          awarded
                            ? 'border-emerald-300 bg-emerald-400 text-slate-950 shadow'
                            : 'border-yellow-400/50 bg-yellow-400/15 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950'
                        }`}
                      >
                        <span>
                          {awarded
                            ? `✓ ${team.name} (+${currentPointValue})`
                            : `+ ${team.name}`}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleNextPage}
                  className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 px-4 py-2 text-xs sm:text-sm font-black text-blue-950 shadow-lg transition active:scale-95"
                >
                  <span>
                    {isFetchingMore && currentIndex + 1 >= queue.length
                      ? 'Chargement...'
                      : 'Page Wikipédia suivante'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
