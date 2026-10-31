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
} from 'lucide-react';
import {
  playPointSound,
  startMillionsZoukMusic,
  stopMillionsZoukMusic,
} from '@/lib/sound';

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

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none pb-[env(safe-area-inset-bottom)]">
      {/* En-tête avec barre de modes 100% visible et lisible en mode portrait et desktop */}
      <header className="shrink-0 border-b border-yellow-400/35 bg-[#050d26]/95 px-2 sm:px-4 py-1 sm:py-2">
        <div className="mx-auto max-w-5xl flex flex-col gap-1 sm:gap-1.5">
          {/* Ligne 1 : Logo 7TER + Bouton Mode Enfant + Espace Admin + Son + Reset */}
          <div className="flex items-center justify-between gap-1.5">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <div className="relative flex h-6 w-9 sm:h-8 sm:w-12 shrink-0 items-center justify-center rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-[#133282] to-[#06102b] shadow">
                <span className="text-xs sm:text-base font-black text-yellow-400 tracking-tighter">
                  7
                </span>
                <span className="text-[7px] sm:text-[9px] font-black uppercase text-white ml-0.5">
                  TER
                </span>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xs sm:text-lg font-black uppercase tracking-tight text-white truncate">
                    QUIZ du <span className="text-yellow-400">7TER</span>
                  </h1>
                  <span className="hidden md:inline-flex items-center gap-1 rounded-full bg-yellow-400/15 border border-yellow-400/40 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                    {totalPoolCount} questions
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
              <Link
                href="/enfants"
                className="inline-flex items-center gap-1 rounded-lg border border-lime-400/60 bg-gradient-to-r from-lime-400/25 to-emerald-500/25 hover:from-lime-400 hover:to-emerald-400 hover:text-slate-950 px-2 py-1 text-[10px] sm:text-[11px] font-black text-lime-300 transition shadow-sm"
                title="Ouvrir la page dédiée au Mode Enfant (Quiz sur images : Ferme, JO, Animaux, Sport, Pokémon)"
              >
                <span>🎈</span>
                <span className=" sm:inline">Enfants</span>
              </Link>

              <Link
                href="/admin"
                className="inline-flex items-center gap-1 rounded-lg border border-purple-400/60 bg-gradient-to-r from-purple-500/25 to-indigo-500/25 hover:from-purple-400 hover:to-indigo-400 hover:text-slate-950 px-1.5 sm:px-2 py-1 text-[10px] sm:text-[11px] font-black text-purple-200 transition shadow-sm"
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
                className={`flex h-6 sm:h-7 items-center justify-center gap-1 rounded-lg border px-1.5 text-[10px] font-bold transition active:scale-95 ${
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
                className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-lg border transition ${
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
                className={`hidden md:inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] font-bold ${
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
                className="inline-flex h-6 sm:h-7 items-center gap-1 rounded-lg border border-blue-400/35 bg-blue-900/50 px-1.5 sm:px-2 text-[10px] sm:text-[11px] font-extrabold text-blue-100 hover:bg-yellow-400 hover:text-blue-950 transition"
                title="Remettre les scores et la soirée à zéro"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Ligne 2 : Sélecteur des 5 Catégories de Modes (Icône au-dessus du texte en portrait mobile pour 0 troncature) */}
          <div className="flex flex-col gap-1 rounded-xl bg-[#040b1e] p-1 border border-blue-500/35">
            <div className="grid grid-cols-5 gap-1">
              <button
                type="button"
                onClick={() => {
                  stopMillionsZoukMusic();
                  setMode(classicSubMode);
                  if (classicSubMode === 'coop') {
                    setCoopStats((prev) => ({ ...prev, status: 'playing' }));
                  }
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs font-black leading-tight transition ${
                  mode === '2_couples' || mode === '4_players' || mode === 'coop'
                    ? 'bg-yellow-400 text-blue-950 shadow'
                    : 'text-blue-200/80 hover:text-white'
                }`}
                title="Mode de base (2 Équipes, 4 Joueurs ou Ensemble)"
              >
                <Users className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-full">
                  Classique{' '}
                  <span className="hidden md:inline opacity-80 font-extrabold">
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
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs font-black leading-tight transition ${
                  mode === 'versus'
                    ? 'bg-gradient-to-r from-sky-300 via-sky-400 to-blue-500 text-slate-950 shadow'
                    : 'text-sky-300 hover:text-white'
                }`}
                title="Salon Versus Multi-Téléphones : Timer 10s à points dégressifs"
              >
                <Swords className="h-3.5 w-3.5 shrink-0" />
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
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs font-black leading-tight transition ${
                  mode === 'millions'
                    ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 text-blue-950 shadow'
                    : 'text-amber-300 hover:text-white'
                }`}
                title="Qui veut gagner des Millions : 15 paliers, 2 paliers de sécurité et 4 Jokers !"
              >
                <Gem className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-full">Millions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopMillionsZoukMusic();
                  setMode('wikipedia');
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs font-black leading-tight transition ${
                  mode === 'wikipedia'
                    ? 'bg-gradient-to-r from-white via-slate-100 to-sky-200 text-slate-950 shadow'
                    : 'text-emerald-300 hover:text-white'
                }`}
                title="Mode Wikipédia : Une image principale issue de Wikipédia au hasard, devinez le titre de la page !"
              >
                <Globe className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-full">Wikipédia</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  stopMillionsZoukMusic();
                  setMode('code_route');
                }}
                className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 rounded-lg py-1 sm:py-1.5 px-0.5 sm:px-1.5 text-[10px] sm:text-xs font-black leading-tight transition ${
                  mode === 'code_route'
                    ? 'bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 text-white shadow'
                    : 'text-rose-300 hover:text-white'
                }`}
                title="Section Code de la Route : 100% questions avec images (panneaux, priorités, intersections, voyants, pièges examen) !"
              >
                <Car className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate max-w-full">Code Route</span>
              </button>
            </div>

            {/* Sous-modes de la catégorie Classique : 2 Équipes | 4 Joueurs | Ensemble */}
            {(mode === '2_couples' || mode === '4_players' || mode === 'coop') && (
              <div className="flex items-center gap-1 pt-0.5 border-t border-blue-500/25">
                <span className="hidden sm:inline-block px-2 text-[10px] font-extrabold uppercase tracking-wider text-blue-300/80 shrink-0">
                  Sous-mode :
                </span>
                <div className="grid grid-cols-3 gap-1 flex-1">
                  <button
                    type="button"
                    onClick={() => {
                      stopMillionsZoukMusic();
                      setClassicSubMode('2_couples');
                      setMode('2_couples');
                    }}
                    className={`inline-flex items-center justify-center gap-1 rounded-md py-1 px-1.5 text-[10px] sm:text-[11px] font-black transition ${
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
                    className={`inline-flex items-center justify-center gap-1 rounded-md py-1 px-1.5 text-[10px] sm:text-[11px] font-black transition ${
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
                    className={`inline-flex items-center justify-center gap-1 rounded-md py-1 px-1.5 text-[10px] sm:text-[11px] font-black transition ${
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
      <main className="mx-auto w-full max-w-5xl flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2 px-2 py-1.5 sm:px-4 sm:py-2.5">
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
    </div>
  );
}
