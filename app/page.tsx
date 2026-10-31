'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Scoreboard, {
  type GameMode,
  type PlayerScore,
  type CoopStats,
} from '@/components/Scoreboard';
import DifficultySelector from '@/components/DifficultySelector';
import QuestionCard from '@/components/QuestionCard';
import VersusMode from '@/components/VersusMode';
import MillionsMode from '@/components/MillionsMode';
import WikipediaMode from '@/components/WikipediaMode';
import CodeRouteMode from '@/components/CodeRouteMode';
import {
  fetchAllQuestionsFromSupabase,
  incrementQuestionPlayed,
  type QuizQuestionRecord,
} from '@/lib/supabase';
import { getAllLocalSeedQuestionsGrouped } from '@/lib/seed-data';
import {
  loadQuestionAnalytics,
  loadAdminSettings,
  recordQuestionAnswerOutcome,
  markQuestionAsAsked,
  isQuestionAlreadyAsked,
  normalizeQuestionKey,
  prioritizeQuestionsByAnalytics,
  getQuestionAnalytics,
  type QuestionAnalyticsMap,
  type AdminSettings,
  DEFAULT_ADMIN_SETTINGS,
} from '@/lib/question-analytics';
import {
  Database,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Users,
  User,
  Flame,
  Swords,
  Gem,
  Music,
  ShieldCheck,
  Globe,
  Car,
  Wallet,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  X,
} from 'lucide-react';
import {
  playPointSound,
  playCorrectSound,
  startMillionsZoukMusic,
  stopMillionsZoukMusic,
} from '@/lib/sound';

const PACK_10_QUESTIONS_PRICE = 1500;

const STORAGE_KEYS = {
  MODE: '7ter:mode:v2',
  COUPLES: '7ter:couples:v1',
  PLAYERS: '7ter:players:v1',
  LEVEL: '7ter:level:v1',
  THEME: '7ter:theme:v1',
  PLAYED_IDS: '7ter:played_ids:v1',
  QUESTION_COUNT: '7ter:q_count:v1',
  SOUND: '7ter:sound:v1',
  COOP: '7ter:coop:v1',
  ACTIVE_QUESTION_BY_KEY: '7ter:active_q_by_key:v1',
  ACTIVE_QUESTION_SNAPSHOT: '7ter:active_q_snapshot:v1',
  USER_PSEUDO: '7ter:user_pseudo:v1',
  USER_CAGNOTTE: '7ter:user_cagnotte:v1',
  CUSTOM_QUESTIONS: '7ter:custom_questions:v1',
  VERSUS_PLAYER_NAME: '7ter:versus:player_name:v1',
};

const DEFAULT_COUPLES: PlayerScore[] = [
  { id: 'c1', name: 'Équipe 1', score: 0 },
  { id: 'c2', name: 'Équipe 2', score: 0 },
];

const DEFAULT_PLAYERS: PlayerScore[] = [
  { id: 'p1', name: 'Joueur 1', score: 0 },
  { id: 'p2', name: 'Joueur 2', score: 0 },
  { id: 'p3', name: 'Joueur 3', score: 0 },
  { id: 'p4', name: 'Joueur 4', score: 0 },
];

const DEFAULT_COOP: CoopStats = {
  currentStep: 1,
  bestStep: 0,
  attempts: 1,
  victories: 0,
  status: 'playing',
};

type ClassicSubMode = '2_couples' | '4_players' | 'coop';

function shuffleQuestions(list: QuizQuestionRecord[]): QuizQuestionRecord[] {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function QuizHomePage() {
  const [poolByLevel, setPoolByLevel] = useState<Record<number, QuizQuestionRecord[]>>(() => {
    const initial = getAllLocalSeedQuestionsGrouped();
    const shuffled: Record<number, QuizQuestionRecord[]> = {};
    for (let lvl = 1; lvl <= 10; lvl++) {
      shuffled[lvl] = shuffleQuestions(initial[lvl] || []);
    }
    return shuffled;
  });

  const [dbSynced, setDbSynced] = useState<boolean>(false);
  const [selectedLevel, setSelectedLevel] = useState<number>(3);
  const [selectedTheme, setSelectedTheme] = useState<string>('ALL');
  const [mode, setMode] = useState<GameMode>('2_couples');
  const [classicSubMode, setClassicSubMode] = useState<ClassicSubMode>('2_couples');
  const [initialRoomCode, setInitialRoomCode] = useState<string | null>(null);
  const [couples, setCouples] = useState<PlayerScore[]>(DEFAULT_COUPLES);
  const [players, setPlayers] = useState<PlayerScore[]>(DEFAULT_PLAYERS);
  const [coopStats, setCoopStats] = useState<CoopStats>(DEFAULT_COOP);
  const [playedIds, setPlayedIds] = useState<string[]>([]);
  const [activeQuestionByKey, setActiveQuestionByKey] = useState<Record<string, string>>({});
  const [activeQuestionSnapshots, setActiveQuestionSnapshots] = useState<
    Record<string, QuizQuestionRecord>
  >({});
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [doublePoints, setDoublePoints] = useState<boolean>(false);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [duoCarreCashEnabled, setDuoCarreCashEnabled] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [zoukMusicEnabled, setZoukMusicEnabled] = useState<boolean>(true);
  const [lastScoredId, setLastScoredId] = useState<string | null>(null);
  const [analyticsMap, setAnalyticsMap] = useState<QuestionAnalyticsMap>({});
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(
    DEFAULT_ADMIN_SETTINGS
  );
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Profil personnel (Pseudo à la 1re connexion + Cagnotte personnelle + Boutique 10 questions)
  const [userPseudo, setUserPseudo] = useState<string>('');
  const [pseudoInput, setPseudoInput] = useState<string>('');
  const [showFirstTimePseudoModal, setShowFirstTimePseudoModal] = useState<boolean>(false);
  const [cagnotteBalance, setCagnotteBalance] = useState<number>(0);
  const [customBoughtQuestions, setCustomBoughtQuestions] = useState<QuizQuestionRecord[]>([]);
  const [showShopModal, setShowShopModal] = useState<boolean>(false);
  const [isBuyingPack, setIsBuyingPack] = useState<boolean>(false);
  const [shopFeedback, setShopFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
    questions?: QuizQuestionRecord[];
  } | null>(null);
  const [cagnotteToast, setCagnotteToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      setAnalyticsMap(loadQuestionAnalytics());
      setAdminSettings(loadAdminSettings());

      const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) as GameMode | null;
      if (
        savedMode === '2_couples' ||
        savedMode === '4_players' ||
        savedMode === 'coop' ||
        savedMode === 'versus' ||
        savedMode === 'millions' ||
        savedMode === 'wikipedia' ||
        savedMode === 'code_route'
      ) {
        setMode(savedMode);
        if (
          savedMode === '2_couples' ||
          savedMode === '4_players' ||
          savedMode === 'coop'
        ) {
          setClassicSubMode(savedMode);
        }
      }

      // Si l'URL contient ?room=XXXX, basculer automatiquement en mode Versus
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const roomParam = params.get('room');
        if (roomParam && roomParam.trim().length > 0) {
          setInitialRoomCode(roomParam.trim().toUpperCase());
          setMode('versus');
        }
      }

      const savedCouples = localStorage.getItem(STORAGE_KEYS.COUPLES);
      if (savedCouples) {
        const parsed = JSON.parse(savedCouples);
        if (Array.isArray(parsed) && parsed.length === 2) {
          setCouples(
            parsed.map((item: PlayerScore, idx: number) => ({
              ...item,
              name:
                item.name === `Couple ${idx + 1}`
                  ? `Équipe ${idx + 1}`
                  : item.name,
            }))
          );
        }
      }

      const savedPlayers = localStorage.getItem(STORAGE_KEYS.PLAYERS);
      if (savedPlayers) {
        const parsed = JSON.parse(savedPlayers);
        if (Array.isArray(parsed) && parsed.length === 4) setPlayers(parsed);
      }

      const savedCoop = localStorage.getItem(STORAGE_KEYS.COOP);
      if (savedCoop) {
        const parsed = JSON.parse(savedCoop);
        if (parsed && typeof parsed.currentStep === 'number') {
          setCoopStats({
            currentStep: parsed.currentStep,
            bestStep: parsed.bestStep || 0,
            attempts: parsed.attempts || 1,
            victories: parsed.victories || 0,
            status: 'playing',
          });
        }
      }

      const savedLevel = Number.parseInt(localStorage.getItem(STORAGE_KEYS.LEVEL) || '3', 10);
      if (savedLevel >= 1 && savedLevel <= 10) {
        setSelectedLevel(savedLevel);
      }

      const savedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
      if (savedTheme && savedTheme.trim().length > 0) {
        setSelectedTheme(savedTheme);
      }

      const savedPlayed = localStorage.getItem(STORAGE_KEYS.PLAYED_IDS);
      if (savedPlayed) {
        const parsed = JSON.parse(savedPlayed);
        if (Array.isArray(parsed)) setPlayedIds(parsed);
      }

      const savedActiveByKey = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUESTION_BY_KEY);
      if (savedActiveByKey) {
        const parsed = JSON.parse(savedActiveByKey);
        if (parsed && typeof parsed === 'object') {
          setActiveQuestionByKey(parsed);
        }
      }

      const savedSnapshots = localStorage.getItem(STORAGE_KEYS.ACTIVE_QUESTION_SNAPSHOT);
      if (savedSnapshots) {
        const parsed = JSON.parse(savedSnapshots);
        if (parsed && typeof parsed === 'object') {
          setActiveQuestionSnapshots(parsed);
        }
      }

      const savedQCount = Number.parseInt(
        localStorage.getItem(STORAGE_KEYS.QUESTION_COUNT) || '1',
        10
      );
      if (savedQCount >= 1) {
        setQuestionNumber(savedQCount);
      }

      const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND);
      if (savedSound === 'false') {
        setSoundEnabled(false);
      }

      const savedDCC = localStorage.getItem('7ter:dcc:v1');
      if (savedDCC === 'true') {
        setDuoCarreCashEnabled(true);
      }

      // Chargement du pseudo (1re connexion), de la cagnotte personnelle et des questions achetées
      const savedPseudo =
        localStorage.getItem(STORAGE_KEYS.USER_PSEUDO) ||
        localStorage.getItem(STORAGE_KEYS.VERSUS_PLAYER_NAME) ||
        '';
      if (savedPseudo && savedPseudo.trim().length > 0) {
        const cleanPseudo = savedPseudo.trim();
        setUserPseudo(cleanPseudo);
        setPseudoInput(cleanPseudo);
        localStorage.setItem(STORAGE_KEYS.USER_PSEUDO, cleanPseudo);
      } else {
        setShowFirstTimePseudoModal(true);
      }

      const savedCagnotte = Number.parseInt(
        localStorage.getItem(STORAGE_KEYS.USER_CAGNOTTE) || '0',
        10
      );
      if (Number.isFinite(savedCagnotte) && savedCagnotte >= 0) {
        setCagnotteBalance(savedCagnotte);
      }

      const savedCustomQ = localStorage.getItem(STORAGE_KEYS.CUSTOM_QUESTIONS);
      if (savedCustomQ) {
        const parsedCustom = JSON.parse(savedCustomQ);
        if (Array.isArray(parsedCustom) && parsedCustom.length > 0) {
          setCustomBoughtQuestions(parsedCustom);
          setPoolByLevel((prev) => {
            const nextPool: Record<number, QuizQuestionRecord[]> = { ...prev };
            for (const cq of parsedCustom as QuizQuestionRecord[]) {
              const lvl = Math.max(1, Math.min(10, Number(cq.difficulty) || 5));
              const list = nextPool[lvl] || [];
              const exists = list.some(
                (item) =>
                  normalizeQuestionKey(item.question) ===
                  normalizeQuestionKey(cq.question)
              );
              if (!exists) {
                nextPool[lvl] = [cq, ...list];
              }
            }
            return nextPool;
          });
        }
      }
    } catch {
      // Ignore storage errors
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetchAllQuestionsFromSupabase()
      .then((remoteGrouped) => {
        if (!active) return;
        const totalRemote = Object.values(remoteGrouped).reduce(
          (acc, arr) => acc + arr.length,
          0
        );
        if (totalRemote > 0) {
          const remoteByKey = new Map<string, QuizQuestionRecord>();
          for (let lvl = 1; lvl <= 10; lvl++) {
            for (const rq of remoteGrouped[lvl] || []) {
              remoteByKey.set(normalizeQuestionKey(rq.question), rq);
            }
          }

          setPoolByLevel((prev) => {
            const merged: Record<number, QuizQuestionRecord[]> = {};
            for (let lvl = 1; lvl <= 10; lvl++) {
              const remoteList = remoteGrouped[lvl] || [];
              const localList = prev[lvl] || [];
              if (remoteList.length > 0) {
                const seenKeys = new Set(
                  remoteList.map((q) => normalizeQuestionKey(q.question))
                );
                const extraLocal = localList.filter(
                  (q) => !seenKeys.has(normalizeQuestionKey(q.question))
                );
                merged[lvl] = shuffleQuestions([...remoteList, ...extraLocal]);
              } else {
                merged[lvl] = localList;
              }
            }
            return merged;
          });

          // Met à jour les snapshots actifs avec l'UUID Supabase réel, ou déverrouille si la question avait déjà été jouée
          setActiveQuestionSnapshots((prevSnaps) => {
            const nextSnaps = { ...prevSnaps };
            let changed = false;
            const slotsToRemove: string[] = [];

            for (const [slot, snap] of Object.entries(prevSnaps)) {
              if (!snap) continue;
              const match = remoteByKey.get(normalizeQuestionKey(snap.question));
              if (match) {
                if ((match.times_played ?? 0) > 0 || match.is_already_answered) {
                  delete nextSnaps[slot];
                  slotsToRemove.push(slot);
                  changed = true;
                } else if (snap.id !== match.id) {
                  nextSnaps[slot] = match;
                  changed = true;
                }
              }
            }

            if (changed) {
              setActiveQuestionByKey((prevKeys) => {
                const nextKeys = { ...prevKeys };
                for (const slot of slotsToRemove) {
                  delete nextKeys[slot];
                }
                for (const [slot, snap] of Object.entries(nextSnaps)) {
                  if (snap) {
                    nextKeys[slot] = snap.id;
                  }
                }
                return nextKeys;
              });
              return nextSnaps;
            }
            return prevSnaps;
          });

          setDbSynced(true);
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
      localStorage.setItem(STORAGE_KEYS.COUPLES, JSON.stringify(couples));
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
      localStorage.setItem(STORAGE_KEYS.COOP, JSON.stringify(coopStats));
      localStorage.setItem(STORAGE_KEYS.LEVEL, String(selectedLevel));
      localStorage.setItem(STORAGE_KEYS.THEME, selectedTheme);
      localStorage.setItem(STORAGE_KEYS.PLAYED_IDS, JSON.stringify(playedIds));
      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_QUESTION_BY_KEY,
        JSON.stringify(activeQuestionByKey)
      );
      localStorage.setItem(
        STORAGE_KEYS.ACTIVE_QUESTION_SNAPSHOT,
        JSON.stringify(activeQuestionSnapshots)
      );
      localStorage.setItem(STORAGE_KEYS.QUESTION_COUNT, String(questionNumber));
      localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
      localStorage.setItem('7ter:dcc:v1', String(duoCarreCashEnabled));
      if (userPseudo) {
        localStorage.setItem(STORAGE_KEYS.USER_PSEUDO, userPseudo);
        localStorage.setItem(STORAGE_KEYS.VERSUS_PLAYER_NAME, userPseudo);
      }
      localStorage.setItem(
        STORAGE_KEYS.USER_CAGNOTTE,
        String(cagnotteBalance)
      );
      localStorage.setItem(
        STORAGE_KEYS.CUSTOM_QUESTIONS,
        JSON.stringify(customBoughtQuestions)
      );
    } catch {
      // Ignore storage errors
    }
  }, [
    hydrated,
    mode,
    couples,
    players,
    coopStats,
    selectedLevel,
    selectedTheme,
    playedIds,
    activeQuestionByKey,
    activeQuestionSnapshots,
    questionNumber,
    soundEnabled,
    duoCarreCashEnabled,
    userPseudo,
    cagnotteBalance,
    customBoughtQuestions,
  ]);

  // Niveau effectif : en mode Ensemble (coop), c'est le palier d'ascension (1 -> 10)
  const effectiveLevel = mode === 'coop' ? coopStats.currentStep : selectedLevel;
  const effectiveSlotKey = `${effectiveLevel}:${mode === 'coop' ? 'ALL' : selectedTheme}`;

  const playedSet = useMemo(() => new Set(playedIds), [playedIds]);

  // Applique les éventuels reclassements de difficulté faits dans l'Espace Admin
  const effectivePoolByLevel = useMemo(() => {
    const hasOverrides = Object.values(analyticsMap).some(
      (entry) => typeof entry?.difficultyOverride === 'number'
    );
    if (!hasOverrides) return poolByLevel;

    const regrouped: Record<number, QuizQuestionRecord[]> = {};
    for (let lvl = 1; lvl <= 10; lvl++) {
      regrouped[lvl] = [];
    }

    for (let lvl = 1; lvl <= 10; lvl++) {
      for (const q of poolByLevel[lvl] || []) {
        const entry = getQuestionAnalytics(
          q,
          analyticsMap,
          adminSettings.autoArchiveThreshold
        );
        const targetLvl = entry.difficultyOverride ?? q.difficulty;
        const clampedLvl = Math.max(1, Math.min(10, targetLvl));
        regrouped[clampedLvl].push({
          ...q,
          difficulty: clampedLvl,
        });
      }
    }
    return regrouped;
  }, [poolByLevel, analyticsMap, adminSettings.autoArchiveThreshold]);

  const countsByLevel = useMemo(() => {
    const stats: Record<number, { total: number; remaining: number }> = {};
    for (let lvl = 1; lvl <= 10; lvl++) {
      const list = effectivePoolByLevel[lvl] || [];
      const freshRemaining = list.filter(
        (q) =>
          !isQuestionAlreadyAsked(
            q,
            playedSet,
            analyticsMap,
            adminSettings.autoArchiveThreshold
          )
      ).length;
      stats[lvl] = {
        total: list.length,
        remaining: freshRemaining,
      };
    }
    return stats;
  }, [
    effectivePoolByLevel,
    playedSet,
    analyticsMap,
    adminSettings.autoArchiveThreshold,
  ]);

  const currentLevelQuestions = useMemo(() => {
    const allInLevel = effectivePoolByLevel[effectiveLevel] || [];
    const baseList =
      selectedTheme === 'ALL' || mode === 'coop'
        ? allInLevel
        : (() => {
            const filtered = allInLevel.filter((q) => q.theme === selectedTheme);
            return filtered.length > 0 ? filtered : allInLevel;
          })();
    // Les questions déjà posées sont strictement exclues tant qu'il reste des questions inédites
    return prioritizeQuestionsByAnalytics(
      baseList,
      playedSet,
      analyticsMap,
      adminSettings.autoArchiveThreshold
    );
  }, [
    effectivePoolByLevel,
    effectiveLevel,
    selectedTheme,
    mode,
    playedSet,
    analyticsMap,
    adminSettings.autoArchiveThreshold,
  ]);

  const availableThemesInLevel = useMemo(() => {
    const allInLevel = effectivePoolByLevel[effectiveLevel] || [];
    return Array.from(new Set(allInLevel.map((q) => q.theme)));
  }, [effectivePoolByLevel, effectiveLevel]);

  const unplayedInCurrentLevel = useMemo(() => {
    return currentLevelQuestions.filter(
      (q) =>
        !isQuestionAlreadyAsked(
          q,
          playedSet,
          analyticsMap,
          adminSettings.autoArchiveThreshold
        )
    );
  }, [
    currentLevelQuestions,
    playedSet,
    analyticsMap,
    adminSettings.autoArchiveThreshold,
  ]);

  const activeQuestion = useMemo(() => {
    const pinnedId = activeQuestionByKey[effectiveSlotKey];
    if (pinnedId && !playedSet.has(pinnedId)) {
      const foundInPool = currentLevelQuestions.find((q) => q.id === pinnedId);
      if (
        foundInPool &&
        !playedSet.has(normalizeQuestionKey(foundInPool.question))
      ) {
        return foundInPool;
      }
      const snapshot = activeQuestionSnapshots[effectiveSlotKey];
      if (
        snapshot &&
        snapshot.id === pinnedId &&
        !playedSet.has(normalizeQuestionKey(snapshot.question))
      ) {
        const upgradedInPool = currentLevelQuestions.find(
          (q) =>
            normalizeQuestionKey(q.question) ===
            normalizeQuestionKey(snapshot.question)
        );
        return upgradedInPool || snapshot;
      }
    }
    if (unplayedInCurrentLevel.length > 0) {
      return unplayedInCurrentLevel[0];
    }
    // Si le thème sélectionné n'a plus de questions inédites dans ce niveau, chercher une question inédite tous thèmes confondus dans ce niveau
    const allInLevel = effectivePoolByLevel[effectiveLevel] || [];
    const unplayedAnyTheme = allInLevel.find(
      (q) =>
        !isQuestionAlreadyAsked(
          q,
          playedSet,
          analyticsMap,
          adminSettings.autoArchiveThreshold
        )
    );
    if (unplayedAnyTheme) {
      return unplayedAnyTheme;
    }
    return currentLevelQuestions[0] || null;
  }, [
    activeQuestionByKey,
    activeQuestionSnapshots,
    effectiveSlotKey,
    playedSet,
    currentLevelQuestions,
    unplayedInCurrentLevel,
    effectivePoolByLevel,
    effectiveLevel,
    analyticsMap,
    adminSettings.autoArchiveThreshold,
  ]);

  // Verrouille la question active pour ce niveau/thème afin qu'un rafraîchissement (F5 / PullToRefresh) ou la synchro Supabase ne change jamais la question en cours
  useEffect(() => {
    if (!hydrated || !activeQuestion) return;
    const currentPinnedId = activeQuestionByKey[effectiveSlotKey];
    const currentSnapshot = activeQuestionSnapshots[effectiveSlotKey];
    if (currentPinnedId !== activeQuestion.id || currentSnapshot?.id !== activeQuestion.id) {
      setActiveQuestionByKey((prev) => ({
        ...prev,
        [effectiveSlotKey]: activeQuestion.id,
      }));
      setActiveQuestionSnapshots((prev) => ({
        ...prev,
        [effectiveSlotKey]: activeQuestion,
      }));
    }
  }, [
    hydrated,
    activeQuestion,
    effectiveSlotKey,
    activeQuestionByKey,
    activeQuestionSnapshots,
  ]);

  // Résout l'enregistrement d'une question avec son vrai ID Supabase si disponible
  const resolvePoolQuestion = useCallback(
    (q: QuizQuestionRecord): QuizQuestionRecord => {
      if (!q.id.startsWith('local-')) return q;
      const targetKey = normalizeQuestionKey(q.question);
      for (let lvl = 1; lvl <= 10; lvl++) {
        const match = (effectivePoolByLevel[lvl] || []).find(
          (cand) =>
            !cand.id.startsWith('local-') &&
            normalizeQuestionKey(cand.question) === targetKey
        );
        if (match) return match;
      }
      return q;
    },
    [effectivePoolByLevel]
  );

  // Évaluation de la réponse en Mode Ensemble (1 -> 10 sans erreur)
  const handleCoopAnswer = useCallback((isCorrect: boolean) => {
    setCoopStats((prev) => {
      if (isCorrect) {
        const newBest = Math.max(prev.bestStep, prev.currentStep);
        if (prev.currentStep >= 10) {
          return {
            ...prev,
            bestStep: 10,
            victories: prev.victories + 1,
            status: 'victory',
          };
        }
        return {
          ...prev,
          bestStep: newBest,
          status: 'step_won',
        };
      }
      // Erreur -> statut failed (retombera au niveau 1 au clic suivant)
      return {
        ...prev,
        status: 'failed',
      };
    });
  }, []);

  const handleNextQuestion = useCallback(() => {
    if (!activeQuestion) return;

    const resolved = resolvePoolQuestion(activeQuestion);
    const qKey = normalizeQuestionKey(activeQuestion.question);

    // Marque définitivement la question comme posée dans les analytics locaux + Supabase
    setAnalyticsMap((prev) => markQuestionAsAsked(resolved, prev));

    setActiveQuestionByKey((prev) => {
      const next = { ...prev };
      delete next[effectiveSlotKey];
      return next;
    });
    setActiveQuestionSnapshots((prev) => {
      const next = { ...prev };
      delete next[effectiveSlotKey];
      return next;
    });

    setPlayedIds((prev) => {
      const nextSet = new Set(prev);
      nextSet.add(activeQuestion.id);
      nextSet.add(resolved.id);
      nextSet.add(qKey);
      return Array.from(nextSet);
    });

    if (mode === 'coop') {
      setCoopStats((prev) => {
        if (prev.status === 'step_won') {
          return {
            ...prev,
            currentStep: Math.min(10, prev.currentStep + 1),
            status: 'playing',
          };
        }
        // Si échec ou après une victoire 10/10 -> retour au Niveau 1 !
        return {
          ...prev,
          currentStep: 1,
          attempts: prev.attempts + 1,
          status: 'playing',
        };
      });
    }

    setDoublePoints(false);
    setQuestionNumber((n) => n + 1);
  }, [activeQuestion, effectiveSlotKey, mode, resolvePoolQuestion]);

  const wikiTeamMode: '2_couples' | '4_players' =
    classicSubMode === '4_players' ? '4_players' : '2_couples';
  const isTwoCouplesScore =
    mode === '2_couples' ||
    ((mode === 'wikipedia' || mode === 'code_route') &&
      wikiTeamMode === '2_couples');
  const activeTeams = isTwoCouplesScore ? couples : players;

  const handleUpdateScore = useCallback(
    (id: string, delta: number) => {
      if (delta > 0) {
        setLastScoredId(id);
        playPointSound(soundEnabled);
        setTimeout(() => {
          setLastScoredId((prev) => (prev === id ? null : prev));
        }, 900);
      }
      if (isTwoCouplesScore) {
        setCouples((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, score: Math.max(0, t.score + delta) } : t
          )
        );
      } else {
        setPlayers((prev) =>
          prev.map((t) =>
            t.id === id ? { ...t, score: Math.max(0, t.score + delta) } : t
          )
        );
      }
    },
    [isTwoCouplesScore, soundEnabled]
  );

  const handleRenameTeam = useCallback(
    (id: string, newName: string) => {
      if (isTwoCouplesScore) {
        setCouples((prev) =>
          prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
        );
      } else {
        setPlayers((prev) =>
          prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
        );
      }
    },
    [isTwoCouplesScore]
  );

  const handleResetAll = useCallback(() => {
    setCouples((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setPlayers((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setCoopStats(DEFAULT_COOP);
    // On conserve playedIds et analyticsMap pour que les questions déjà posées ne soient jamais reposées !
    setActiveQuestionByKey({});
    setActiveQuestionSnapshots({});
    setQuestionNumber(1);
    setSelectedTheme('ALL');
  }, []);

  const handleMarkVersusQuestionPlayed = useCallback(
    (questionId: string, questionObj?: QuizQuestionRecord) => {
      let targetQuestion = questionObj;
      if (!targetQuestion) {
        for (let lvl = 1; lvl <= 10; lvl++) {
          const found = (effectivePoolByLevel[lvl] || []).find(
            (q) => q.id === questionId
          );
          if (found) {
            targetQuestion = found;
            break;
          }
        }
      }

      if (targetQuestion) {
        const resolved = resolvePoolQuestion(targetQuestion);
        const qKey = normalizeQuestionKey(targetQuestion.question);
        setAnalyticsMap((prev) => markQuestionAsAsked(resolved, prev));
        setPlayedIds((prev) => {
          const nextSet = new Set(prev);
          nextSet.add(questionId);
          nextSet.add(resolved.id);
          nextSet.add(qKey);
          return Array.from(nextSet);
        });
      } else {
        incrementQuestionPlayed(questionId);
        setPlayedIds((prev) =>
          prev.includes(questionId) ? prev : [...prev, questionId]
        );
      }
    },
    [effectivePoolByLevel, resolvePoolQuestion]
  );

  const handleRecordQuestionOutcome = useCallback(
    (question: QuizQuestionRecord, isCorrect: boolean) => {
      const resolved = resolvePoolQuestion(question);
      setAnalyticsMap((prev) =>
        recordQuestionAnswerOutcome(resolved, isCorrect, prev)
      );
    },
    [resolvePoolQuestion]
  );

  const activeQuestionAnalytics = useMemo(() => {
    if (!activeQuestion) return null;
    return getQuestionAnalytics(
      activeQuestion,
      analyticsMap,
      adminSettings.autoArchiveThreshold
    );
  }, [activeQuestion, analyticsMap, adminSettings.autoArchiveThreshold]);

  const totalPoolCount = useMemo(
    () =>
      Object.values(poolByLevel).reduce((sum, arr) => sum + arr.length, 0),
    [poolByLevel]
  );

  const handleSaveFirstTimePseudo = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const cleaned = pseudoInput.trim();
      if (!cleaned) return;
      setUserPseudo(cleaned);
      setShowFirstTimePseudoModal(false);
      playPointSound(soundEnabled);
      // Si Joueur 1 a encore son nom par défaut, lui attribuer le pseudo choisi
      setPlayers((prev) =>
        prev.map((p, idx) =>
          idx === 0 && (p.name === 'Joueur 1' || !p.name)
            ? { ...p, name: cleaned }
            : p
        )
      );
      try {
        localStorage.setItem(STORAGE_KEYS.USER_PSEUDO, cleaned);
        localStorage.setItem(STORAGE_KEYS.VERSUS_PLAYER_NAME, cleaned);
      } catch {
        // Ignore
      }
    },
    [pseudoInput, soundEnabled]
  );

  const handleAddMoneyToCagnotte = useCallback(
    (amount: number, reason: string) => {
      if (amount <= 0) return;
      setCagnotteBalance((prev) => {
        const next = prev + amount;
        try {
          localStorage.setItem(STORAGE_KEYS.USER_CAGNOTTE, String(next));
        } catch {
          // Ignore
        }
        return next;
      });
      setCagnotteToast(
        `+${amount.toLocaleString('fr-FR')} € dans la cagnotte (${reason})`
      );
      setTimeout(() => {
        setCagnotteToast(null);
      }, 4500);
    },
    []
  );

  const handleBuyTenQuestionsPack = useCallback(async () => {
    if (isBuyingPack || cagnotteBalance < PACK_10_QUESTIONS_PRICE) return;
    setIsBuyingPack(true);
    setShopFeedback(null);

    try {
      const existingKeys: string[] = [];
      for (let lvl = 1; lvl <= 10; lvl++) {
        for (const q of poolByLevel[lvl] || []) {
          existingKeys.push(normalizeQuestionKey(q.question));
        }
      }

      const res = await fetch('/api/questions/buy-pack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pseudo: userPseudo || 'Joueur',
          excludeKeys: existingKeys,
        }),
      });

      const data = await res.json();
      if (!res.ok || !Array.isArray(data?.questions) || data.questions.length === 0) {
        throw new Error(data?.error || 'Impossible de générer le pack de 10 questions.');
      }

      const newQuestions: QuizQuestionRecord[] = data.questions;

      // Débiter la cagnotte
      setCagnotteBalance((prev) => {
        const next = Math.max(0, prev - PACK_10_QUESTIONS_PRICE);
        try {
          localStorage.setItem(STORAGE_KEYS.USER_CAGNOTTE, String(next));
        } catch {
          // Ignore
        }
        return next;
      });

      // Enregistrer et injecter immédiatement les 10 nouvelles questions dans le pool actif
      setCustomBoughtQuestions((prev) => [...newQuestions, ...prev]);
      setPoolByLevel((prev) => {
        const nextPool: Record<number, QuizQuestionRecord[]> = { ...prev };
        for (const nq of newQuestions) {
          const lvl = Math.max(1, Math.min(10, Number(nq.difficulty) || 5));
          const currentList = nextPool[lvl] || [];
          const alreadyIn = currentList.some(
            (item) =>
              normalizeQuestionKey(item.question) ===
              normalizeQuestionKey(nq.question)
          );
          if (!alreadyIn) {
            nextPool[lvl] = [nq, ...currentList];
          }
        }
        return nextPool;
      });

      playCorrectSound(soundEnabled);
      setShopFeedback({
        type: 'success',
        message: `10 nouvelles questions inédites ont été créées et ajoutées au jeu par ${
          userPseudo || 'vous'
        } !`,
        questions: newQuestions,
      });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erreur lors de la création des questions.';
      setShopFeedback({
        type: 'error',
        message: msg,
      });
    } finally {
      setIsBuyingPack(false);
    }
  }, [cagnotteBalance, isBuyingPack, poolByLevel, soundEnabled, userPseudo]);

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none pb-[env(safe-area-inset-bottom)]">
      {/* Notification flottante lors d'un gain dans la cagnotte */}
      {cagnotteToast && (
        <div className="fixed top-12 left-1/2 -translate-x-1/2 z-50 rounded-full border-2 border-emerald-300 bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-1.5 text-xs sm:text-sm font-black text-slate-950 shadow-2xl animate-bounce">
          💰 {cagnotteToast}
        </div>
      )}

      {/* En-tête avec barre de modes 100% visible et lisible en mode portrait, paysage et desktop */}
      <header className="shrink-0 border-b border-yellow-400/35 bg-[#050d26]/95 px-2 sm:px-4 py-1 sm:py-2 ls:py-0.5">
        <div className="mx-auto max-w-5xl flex flex-col gap-1 sm:gap-1.5 ls:gap-0.5">
          {/* Ligne 1 : Logo 7TER + Pseudo & Cagnotte/Boutique + Bouton Mode Enfant + Espace Admin + Son + Reset */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="relative flex h-6 w-9 sm:h-8 sm:w-12 ls:h-5 ls:w-8 shrink-0 items-center justify-center rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-[#133282] to-[#06102b] shadow">
                <span className="text-xs sm:text-base ls:text-xs font-black text-yellow-400 tracking-tighter">
                  7
                </span>
                <span className="text-[7px] sm:text-[9px] ls:text-[7px] font-black uppercase text-white ml-0.5">
                  TER
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-lg ls:text-xs font-black uppercase tracking-tight text-white truncate">
                    QUIZ du <span className="text-yellow-400">7TER</span>
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                    {totalPoolCount} questions
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              {/* Bouton Pseudo + Cagnotte personnelle & Boutique (+10 questions) */}
              <button
                type="button"
                onClick={() => {
                  setShopFeedback(null);
                  setShowShopModal(true);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-400/70 bg-gradient-to-r from-amber-400/20 via-yellow-400/20 to-emerald-400/20 hover:from-amber-400 hover:to-yellow-400 hover:text-slate-950 px-2 py-1 ls:py-0.5 text-[10px] sm:text-[11px] font-black text-amber-200 transition shadow-sm"
                title="Profil joueur, Cagnotte personnelle & Boutique (+10 nouvelles questions au hasard)"
              >
                <Wallet className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
                <span className="truncate max-w-[75px] sm:max-w-[110px]">
                  {userPseudo || 'Pseudo'}
                </span>
                <span className="rounded bg-emerald-500/25 border border-emerald-400/50 px-1 py-0.2 text-[9px] sm:text-[10px] font-black text-emerald-300">
                  {cagnotteBalance.toLocaleString('fr-FR')} €
                </span>
              </button>

              <Link
                href="/enfants"
                className="inline-flex items-center gap-1 rounded-lg border border-lime-400/60 bg-gradient-to-r from-lime-400/25 to-emerald-500/25 hover:from-lime-400 hover:to-emerald-400 hover:text-slate-950 px-2 py-1 ls:py-0.5 text-[10px] sm:text-[11px] font-black text-lime-300 transition shadow-sm"
                title="Ouvrir la page dédiée au Mode Enfant (Quiz sur images : Ferme, JO, Animaux, Sport, Pokémon)"
              >
                <span>🎈</span>
                <span className="hidden sm:inline">Enfants</span>
              </Link>

              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-lg border border-purple-400/60 bg-gradient-to-r from-purple-500/25 to-indigo-500/25 hover:from-purple-400 hover:to-indigo-400 hover:text-slate-950 px-1.5 sm:px-2 py-1 ls:py-0.5 text-[10px] sm:text-[11px] font-black text-purple-200 transition shadow-sm"
                title="Espace Admin (Code requis) : Évaluer la difficulté, notes, statistiques des questions et base Déjà répondu"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-purple-300 shrink-0" />
                <span className="hidden xs:inline sm:inline">Admin</span>
              </Link>

              <button
                type="button"
                onClick={() => {
                  const next = !zoukMusicEnabled;
                  setZoukMusicEnabled(next);
                  if (next) {
                    setSoundEnabled(true);
                    startMillionsZoukMusic(true, 1);
                  } else {
                    stopMillionsZoukMusic();
                  }
                }}
                className={`flex h-6 sm:h-7 ls:h-5 items-center justify-center gap-1 rounded-lg border px-1.5 text-[10px] font-bold transition active:scale-95 ${
                  zoukMusicEnabled && soundEnabled
                    ? 'border-yellow-400/60 bg-yellow-400/15 text-yellow-300'
                    : 'border-blue-500/30 bg-blue-950/70 text-blue-300/50'
                }`}
                title="Activer / couper le thème musical Qui veut gagner des millions"
              >
                <Music className="h-3 w-3" />
                <span>TV</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextSound = !soundEnabled;
                  setSoundEnabled(nextSound);
                  if (!nextSound) {
                    stopMillionsZoukMusic();
                  }
                }}
                className={`flex h-6 w-6 sm:h-7 sm:w-7 ls:h-5 ls:w-5 items-center justify-center rounded-lg border transition ${
                  soundEnabled
                    ? 'border-yellow-400/60 bg-yellow-400/15 text-yellow-300'
                    : 'border-blue-500/30 bg-blue-950/70 text-blue-300/50'
                }`}
                title={soundEnabled ? 'Couper le son' : 'Activer le son'}
              >
                {soundEnabled ? (
                  <Volume2 className="h-3.5 w-3.5 text-yellow-400" />
                ) : (
                  <VolumeX className="h-3.5 w-3.5" />
                )}
              </button>

              <span
                className={`hidden md:inline-flex items-center gap-1 rounded-lg border px-2 py-1 ls:py-0.5 text-[10px] font-bold ${
                  dbSynced
                    ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-sky-400/40 bg-sky-500/15 text-sky-300'
                }`}
              >
                {dbSynced ? (
                  <>
                    <Database className="h-3 w-3" />
                    <span>Live</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-3 w-3" />
                    <span>&lt;10ms</span>
                  </>
                )}
              </span>

              <button
                type="button"
                onClick={handleResetAll}
                className="inline-flex h-6 sm:h-7 ls:h-5 items-center gap-1 rounded-lg border border-blue-400/35 bg-blue-900/50 px-1.5 sm:px-2 text-[10px] sm:text-[11px] font-extrabold text-blue-100 hover:bg-yellow-400 hover:text-blue-950 transition"
                title="Remettre les scores et la soirée à zéro"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Ligne 2 : Sélecteur des 5 Catégories de Modes + Sous-modes (sur 1 seule ligne en paysage ls:/md: pour économiser la hauteur) */}
          <div className="flex flex-col ls:flex-row md:flex-row ls:items-center md:items-center gap-1 ls:gap-1.5 rounded-xl bg-[#040b1e] p-1 ls:p-0.5 border border-blue-500/35">
            <div className="grid grid-cols-5 gap-1 flex-1">
              <button
                type="button"
                onClick={() => {
                  stopMillionsZoukMusic();
                  setMode(classicSubMode);
                  if (classicSubMode === 'coop') {
                    setCoopStats((prev) => ({ ...prev, status: 'playing' }));
                  }
                }}
                className={`flex flex-col landscape:flex-row sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 ls:py-0.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs ls:text-[10px] font-black leading-tight transition ${
                  mode === '2_couples' || mode === '4_players' || mode === 'coop'
                    ? 'bg-yellow-400 text-blue-950 shadow'
                    : 'text-blue-200/80 hover:text-white'
                }`}
                title="Mode de base (2 Équipes, 4 Joueurs ou Ensemble)"
              >
                <Users className="h-3.5 w-3.5 ls:h-3 ls:w-3 shrink-0" />
                <span className="truncate max-w-full">
                  Classique{' '}
                  <span className="hidden lg:inline opacity-80 font-extrabold">
                    ({classicSubMode === '2_couples'
                      ? '2 Équipes'
                      : classicSubMode === '4_players'
                      ? '4 Joueurs'
                      : 'Ensemble'})
                  </span>
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopMillionsZoukMusic();
                  setMode('versus');
                }}
                className={`flex flex-col landscape:flex-row sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 ls:py-0.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs ls:text-[10px] font-black leading-tight transition ${
                  mode === 'versus'
                    ? 'bg-gradient-to-r from-sky-300 via-sky-400 to-blue-500 text-slate-950 shadow'
                    : 'text-sky-300 hover:text-white'
                }`}
                title="Salon Versus Multi-Téléphones : Timer 10s à points dégressifs"
              >
                <Swords className="h-3.5 w-3.5 ls:h-3 ls:w-3 shrink-0" />
                <span className="truncate max-w-full">Versus 10s</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('millions');
                  if (soundEnabled && zoukMusicEnabled) {
                    startMillionsZoukMusic(true, 1);
                  }
                }}
                className={`flex flex-col landscape:flex-row sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 ls:py-0.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs ls:text-[10px] font-black leading-tight transition ${
                  mode === 'millions'
                    ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 text-blue-950 shadow'
                    : 'text-amber-300 hover:text-white'
                }`}
                title="Qui veut gagner des Millions : 15 paliers, 2 paliers de sécurité et 4 Jokers !"
              >
                <Gem className="h-3.5 w-3.5 ls:h-3 ls:w-3 shrink-0" />
                <span className="truncate max-w-full">Millions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopMillionsZoukMusic();
                  setMode('wikipedia');
                }}
                className={`flex flex-col landscape:flex-row sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 ls:py-0.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs ls:text-[10px] font-black leading-tight transition ${
                  mode === 'wikipedia'
                    ? 'bg-gradient-to-r from-white via-slate-100 to-sky-200 text-slate-950 shadow'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="Mode Wikipédia : Une image principale issue de Wikipédia au hasard, devinez le titre de la page !"
              >
                <Globe className="h-3.5 w-3.5 ls:h-3 ls:w-3 shrink-0" />
                <span className="truncate max-w-full">Wikipédia</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopMillionsZoukMusic();
                  setMode('code_route');
                }}
                className={`flex flex-col landscape:flex-row sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 ls:py-0.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs ls:text-[10px] font-black leading-tight transition ${
                  mode === 'code_route'
                    ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white shadow'
                    : 'text-rose-300 hover:text-white'
                }`}
                title="Section Code de la Route : 100% questions avec images (panneaux, priorités, intersections, voyants, pièges examen) !"
              >
                <Car className="h-3.5 w-3.5 ls:h-3 ls:w-3 shrink-0" />
                <span className="truncate max-w-full">Code Route</span>
              </button>
            </div>

            {/* Sous-modes de la catégorie Classique : 2 Équipes | 4 Joueurs | Ensemble */}
            {(mode === '2_couples' || mode === '4_players' || mode === 'coop') && (
              <div className="flex items-center gap-1 pt-0.5 ls:pt-0 md:pt-0 border-t ls:border-t-0 md:border-t-0 ls:border-l md:border-l border-blue-500/25 ls:pl-1.5 md:pl-2 shrink-0">
                <span className="hidden lg:inline-block px-1 text-[10px] font-extrabold uppercase tracking-wider text-blue-300/80 shrink-0">
                  Sous-mode :
                </span>
                <div className="grid grid-cols-3 gap-1 flex-1 ls:flex-none md:flex-none">
                  <button
                    type="button"
                    onClick={() => {
                      stopMillionsZoukMusic();
                      setClassicSubMode('2_couples');
                      setMode('2_couples');
                    }}
                    className={`inline-flex items-center justify-center gap-1 rounded-md py-1 ls:py-0.5 px-1.5 sm:px-2 text-[10px] sm:text-[11px] ls:text-[10px] font-black transition ${
                      mode === '2_couples'
                        ? 'bg-blue-500/35 border border-yellow-400/80 text-yellow-300 shadow-sm'
                        : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30 border border-transparent'
                    }`}
                  >
                    <Users className="h-3 w-3 shrink-0" />
                    <span className="truncate">2 Équipes</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopMillionsZoukMusic();
                      setClassicSubMode('4_players');
                      setMode('4_players');
                    }}
                    className={`inline-flex items-center justify-center gap-1 rounded-md py-1 ls:py-0.5 px-1.5 sm:px-2 text-[10px] sm:text-[11px] ls:text-[10px] font-black transition ${
                      mode === '4_players'
                        ? 'bg-blue-500/35 border border-yellow-400/80 text-yellow-300 shadow-sm'
                        : 'text-blue-200/70 hover:text-white hover:bg-blue-900/30 border border-transparent'
                    }`}
                  >
                    <User className="h-3 w-3 shrink-0" />
                    <span className="truncate">4 Joueurs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      stopMillionsZoukMusic();
                      setClassicSubMode('coop');
                      setMode('coop');
                      setCoopStats((prev) => ({ ...prev, status: 'playing' }));
                    }}
                    className={`inline-flex items-center justify-center gap-1 rounded-md py-1 ls:py-0.5 px-1.5 sm:px-2 text-[10px] sm:text-[11px] ls:text-[10px] font-black transition ${
                      mode === 'coop'
                        ? 'bg-amber-500/25 border border-amber-400/80 text-yellow-300 shadow-sm'
                        : 'text-yellow-300/75 hover:text-yellow-300 hover:bg-blue-900/30 border border-transparent'
                    }`}
                    title="Mode coopératif : réussir les 10 niveaux d'affilée sans erreur"
                  >
                    <Flame className="h-3 w-3 shrink-0" />
                    <span className="truncate">Ensemble</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Cockpit Principal Sans Scroll (occupe exactement le reste de la hauteur 100dvh) */}
      <main className="mx-auto w-full max-w-5xl flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2 ls:gap-1 px-2 py-1.5 sm:px-4 sm:py-2.5 ls:py-1">
        {mode === 'versus' ? (
          <VersusMode
            poolByLevel={effectivePoolByLevel}
            playedIds={playedIds}
            onMarkQuestionPlayed={handleMarkVersusQuestionPlayed}
            onRecordOutcome={handleRecordQuestionOutcome}
            analyticsMap={analyticsMap}
            soundEnabled={soundEnabled}
            initialRoomCode={initialRoomCode}
          />
        ) : mode === 'millions' ? (
          <MillionsMode
            poolByLevel={effectivePoolByLevel}
            playedIds={playedIds}
            onMarkQuestionPlayed={handleMarkVersusQuestionPlayed}
            onRecordOutcome={handleRecordQuestionOutcome}
            analyticsMap={analyticsMap}
            soundEnabled={soundEnabled}
            zoukMusicEnabled={zoukMusicEnabled}
            onToggleZoukMusic={() => {
              const next = !zoukMusicEnabled;
              setZoukMusicEnabled(next);
              if (next) {
                setSoundEnabled(true);
                startMillionsZoukMusic(true, 1);
              } else {
                stopMillionsZoukMusic();
              }
            }}
            userPseudo={userPseudo}
            cagnotteBalance={cagnotteBalance}
            onAddMoneyToCagnotte={handleAddMoneyToCagnotte}
            onOpenShopModal={() => {
              setShopFeedback(null);
              setShowShopModal(true);
            }}
          />
        ) : mode === 'wikipedia' ? (
          <WikipediaMode
            teams={activeTeams}
            teamMode={wikiTeamMode}
            onToggleTeamMode={() =>
              setClassicSubMode((prev) =>
                prev === '4_players' ? '2_couples' : '4_players'
              )
            }
            onUpdateScore={handleUpdateScore}
            onRenameTeam={handleRenameTeam}
            lastScoredId={lastScoredId}
            soundEnabled={soundEnabled}
          />
        ) : mode === 'code_route' ? (
          <CodeRouteMode
            teams={activeTeams}
            teamMode={wikiTeamMode}
            onToggleTeamMode={() =>
              setClassicSubMode((prev) =>
                prev === '4_players' ? '2_couples' : '4_players'
              )
            }
            onUpdateScore={handleUpdateScore}
            onRenameTeam={handleRenameTeam}
            lastScoredId={lastScoredId}
            soundEnabled={soundEnabled}
          />
        ) : (
          <>
            {/* 1. Bandeau des scores OU Tour d'Ascension 1->10 en mode Ensemble */}
            <Scoreboard
              mode={mode}
              teams={activeTeams}
              onUpdateScore={handleUpdateScore}
              onRenameTeam={handleRenameTeam}
              lastScoredId={lastScoredId}
              coopStats={coopStats}
            />

            {/* 2. Barre de niveau 1-10 (affichée en mode Duel/Solo ; en mode Ensemble la progression est automatique 1->10) */}
            {mode !== 'coop' && (
              <DifficultySelector
                selectedLevel={selectedLevel}
                onSelectLevel={(lvl) => {
                  setSelectedLevel(lvl);
                  setSelectedTheme('ALL');
                }}
                countsByLevel={countsByLevel}
                doublePoints={doublePoints}
                onToggleDoublePoints={() => setDoublePoints((d) => !d)}
                timerEnabled={timerEnabled}
                onToggleTimer={() => setTimerEnabled((t) => !t)}
                duoCarreCashEnabled={duoCarreCashEnabled}
                onToggleDuoCarreCash={() => setDuoCarreCashEnabled((d) => !d)}
                soundEnabled={soundEnabled}
                availableThemes={availableThemesInLevel}
                selectedTheme={selectedTheme}
                onSelectTheme={setSelectedTheme}
              />
            )}

            {/* 3. Carte Question flexible (flex-1 min-h-0) avec boutons toujours visibles en bas */}
            <QuestionCard
              question={activeQuestion}
              onNextQuestion={handleNextQuestion}
              onAwardPoint={handleUpdateScore}
              teams={activeTeams}
              questionNumber={questionNumber}
              remainingInLevel={
                unplayedInCurrentLevel.length || currentLevelQuestions.length
              }
              totalInLevel={currentLevelQuestions.length}
              doublePoints={doublePoints}
              timerEnabled={timerEnabled}
              duoCarreCashEnabled={duoCarreCashEnabled && mode !== 'coop'}
              soundEnabled={soundEnabled}
              isCoopMode={mode === 'coop'}
              coopStats={coopStats}
              onCoopAnswer={handleCoopAnswer}
              onRecordOutcome={handleRecordQuestionOutcome}
              alreadyAnsweredCount={activeQuestionAnalytics?.timesAnswered ?? 0}
              isAlreadyAnsweredPool={Boolean(
                activeQuestionAnalytics?.inAlreadyAnsweredPool
              )}
            />
          </>
        )}
      </main>

      {/* ====================================================================
          MODALE 1 : BIENVENUE / CHOIX DU PSEUDO À LA PREMIÈRE CONNEXION
         ==================================================================== */}
      {hydrated && showFirstTimePseudoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
          <div className="w-full max-w-md rounded-2xl border-2 border-yellow-400 bg-gradient-to-b from-[#0b1f52] via-[#071538] to-[#040b1e] p-5 shadow-2xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-yellow-400 bg-gradient-to-br from-yellow-300 to-amber-500 text-blue-950 font-black text-lg shadow">
                7T
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black uppercase text-white">
                  Bienvenue au Quiz du <span className="text-yellow-400">7TER</span> !
                </h2>
                <p className="text-xs text-blue-200">
                  Entrez votre pseudo pour créer votre profil et votre cagnotte personnelle.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveFirstTimePseudo} className="space-y-3">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-wider text-yellow-300 mb-1">
                  Votre Pseudo
                </label>
                <input
                  type="text"
                  value={pseudoInput}
                  onChange={(e) => setPseudoInput(e.target.value)}
                  placeholder="Ex: Thomas, Camille, Max…"
                  maxLength={20}
                  autoFocus
                  className="w-full rounded-xl border-2 border-blue-400/50 focus:border-yellow-400 bg-[#040b1e] px-3.5 py-2.5 text-sm font-extrabold text-white placeholder-blue-300/40 outline-none transition"
                />
              </div>

              <div className="rounded-xl border border-emerald-400/40 bg-emerald-950/40 p-2.5 text-xs text-emerald-200 space-y-1">
                <div className="font-black text-emerald-300 flex items-center gap-1.5">
                  <Gem className="h-3.5 w-3.5 shrink-0" />
                  <span>Cagnotte & Boutique de Questions</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-100/90">
                  En mode <strong>Qui veut gagner des Millions</strong>, chaque gain encaissé ou palier de sécurité alimente votre cagnotte personnelle pour acheter la création de <strong>10 nouvelles questions au hasard</strong> !
                </p>
              </div>

              <button
                type="submit"
                disabled={!pseudoInput.trim()}
                className="w-full rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-amber-400 disabled:opacity-40 py-2.5 text-xs sm:text-sm font-black uppercase text-blue-950 shadow-lg transition"
              >
                Enregistrer mon pseudo et jouer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODALE 2 : PROFIL, CAGNOTTE PERSONNELLE & BOUTIQUE (+10 QUESTIONS)
         ==================================================================== */}
      {showShopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-3 sm:p-4">
          <div className="w-full max-w-lg max-h-[90dvh] flex flex-col justify-between rounded-2xl border-2 border-yellow-400/80 bg-gradient-to-b from-[#0b1f52] via-[#071538] to-[#040b1e] p-4 sm:p-5 shadow-2xl gap-3 overflow-hidden animate-fadeIn">
            {/* Header modale */}
            <div className="flex items-center justify-between border-b border-blue-500/30 pb-2.5 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 to-amber-500 text-blue-950 shadow">
                  <Wallet className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black uppercase text-white">
                    Profil & Boutique du <span className="text-yellow-400">7TER</span>
                  </h2>
                  <p className="text-[11px] text-blue-200">
                    Gagnez de l’argent en mode Millions et enrichissez le quiz !
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowShopModal(false)}
                className="rounded-lg border border-blue-400/30 bg-blue-950/70 p-1.5 text-blue-200 hover:text-white hover:bg-blue-900 transition"
                aria-label="Fermer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Contenu scrollable */}
            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-0.5">
              {/* Pseudo modifiable */}
              <div className="rounded-xl border border-blue-500/35 bg-[#040b1e]/90 p-3 space-y-2">
                <label className="block text-[10px] font-black uppercase tracking-wider text-blue-300">
                  Votre Pseudo Personnel
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={pseudoInput}
                    onChange={(e) => setPseudoInput(e.target.value)}
                    placeholder="Votre pseudo…"
                    maxLength={20}
                    className="flex-1 rounded-lg border border-blue-400/40 focus:border-yellow-400 bg-blue-950/70 px-3 py-1.5 text-xs sm:text-sm font-extrabold text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const clean = pseudoInput.trim();
                      if (!clean) return;
                      setUserPseudo(clean);
                      playPointSound(soundEnabled);
                      try {
                        localStorage.setItem(STORAGE_KEYS.USER_PSEUDO, clean);
                        localStorage.setItem(STORAGE_KEYS.VERSUS_PLAYER_NAME, clean);
                      } catch {
                        // Ignore
                      }
                    }}
                    className="rounded-lg bg-yellow-400 hover:bg-yellow-300 px-3 py-1.5 text-xs font-black text-blue-950 transition"
                  >
                    Mettre à jour
                  </button>
                </div>
              </div>

              {/* Cagnotte personnelle */}
              <div className="rounded-xl border-2 border-emerald-400/60 bg-gradient-to-r from-emerald-950/80 via-[#062426] to-emerald-950/80 p-3.5 flex items-center justify-between gap-3 shadow-inner">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-wider text-emerald-300">
                    Cagnotte personnelle de {userPseudo || 'Joueur'}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
                    {cagnotteBalance.toLocaleString('fr-FR')} €
                  </div>
                  <p className="text-[11px] text-emerald-200/80 mt-0.5">
                    Cumulée grâce à vos gains en mode « Qui veut gagner des Millions »
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowShopModal(false);
                    setMode('millions');
                  }}
                  className="shrink-0 inline-flex items-center gap-1 rounded-xl border border-yellow-400/70 bg-yellow-400/15 hover:bg-yellow-400 hover:text-blue-950 px-2.5 py-2 text-[11px] font-black text-yellow-300 transition"
                >
                  <Gem className="h-3.5 w-3.5" />
                  <span>Jouer à Millions</span>
                </button>
              </div>

              {/* Offre Boutique : Acheter la création de 10 nouvelles questions au hasard */}
              <div className="rounded-xl border-2 border-amber-400/70 bg-gradient-to-b from-[#132968]/90 to-[#081538]/95 p-3.5 space-y-2.5 shadow-lg">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-400/20 border border-amber-300/50 px-2 py-0.5 text-[10px] font-black uppercase text-amber-300">
                      <Sparkles className="h-3 w-3" />
                      Boutique de Création IA
                    </span>
                    <h3 className="text-sm sm:text-base font-black text-white">
                      Créer & Ajouter 10 Nouvelles Questions au Hasard
                    </h3>
                  </div>
                  <span className="shrink-0 rounded-lg bg-gradient-to-r from-yellow-300 to-amber-500 px-2.5 py-1 text-xs font-black text-blue-950 shadow">
                    {PACK_10_QUESTIONS_PRICE.toLocaleString('fr-FR')} €
                  </span>
                </div>

                <p className="text-xs text-blue-100/90 leading-relaxed">
                  Utilisez votre cagnotte pour commander la création immédiate de{' '}
                  <strong>10 nouvelles questions inédites au hasard</strong> (tous thèmes et niveaux 1 à 10). Elles sont générées et ajoutées directement dans le jeu !
                </p>

                <button
                  type="button"
                  onClick={handleBuyTenQuestionsPack}
                  disabled={
                    isBuyingPack || cagnotteBalance < PACK_10_QUESTIONS_PRICE
                  }
                  className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs sm:text-sm font-black uppercase transition shadow-lg ${
                    cagnotteBalance >= PACK_10_QUESTIONS_PRICE && !isBuyingPack
                      ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 text-blue-950 hover:brightness-110 cursor-pointer active:scale-98'
                      : 'border border-blue-500/30 bg-blue-950/60 text-blue-300/50 cursor-not-allowed'
                  }`}
                >
                  <ShoppingBag className="h-4 w-4 shrink-0" />
                  <span>
                    {isBuyingPack
                      ? 'Création et ajout des 10 questions en cours…'
                      : cagnotteBalance >= PACK_10_QUESTIONS_PRICE
                      ? `Acheter 10 nouvelles questions (${PACK_10_QUESTIONS_PRICE.toLocaleString(
                          'fr-FR'
                        )} €)`
                      : `Il vous manque ${(
                          PACK_10_QUESTIONS_PRICE - cagnotteBalance
                        ).toLocaleString(
                          'fr-FR'
                        )} € (Gagnez le 1er palier à 1 500 € en Millions !)`}
                  </span>
                </button>

                {shopFeedback && (
                  <div
                    className={`rounded-xl border p-2.5 text-xs space-y-1.5 ${
                      shopFeedback.type === 'success'
                        ? 'border-emerald-400 bg-emerald-950/60 text-emerald-200'
                        : 'border-rose-400 bg-rose-950/60 text-rose-200'
                    }`}
                  >
                    <div className="font-black flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                      <span>{shopFeedback.message}</span>
                    </div>
                    {shopFeedback.questions && shopFeedback.questions.length > 0 && (
                      <div className="max-h-32 overflow-y-auto space-y-1 pt-1 border-t border-emerald-400/30 text-[11px]">
                        {shopFeedback.questions.map((q, i) => (
                          <div key={q.id} className="truncate text-emerald-100">
                            <strong>#{i + 1} (Niv.{q.difficulty} · {q.theme}) :</strong>{' '}
                            {q.question}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {customBoughtQuestions.length > 0 && (
                <div className="rounded-xl border border-blue-500/30 bg-[#040b1e]/70 p-2.5 text-xs text-blue-200 flex items-center justify-between">
                  <span>Questions bonus débloquées par {userPseudo || 'vous'} :</span>
                  <span className="font-black text-yellow-300">
                    +{customBoughtQuestions.length} questions actives
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
