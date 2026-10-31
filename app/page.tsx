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
import {
  fetchAllQuestionsFromSupabase,
  incrementQuestionPlayed,
  type QuizQuestionRecord,
} from '@/lib/supabase';
import { getAllLocalSeedQuestionsGrouped } from '@/lib/seed-data';
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
  PLAYED_IDS: '7ter:played_ids:v1',
  QUESTION_COUNT: '7ter:q_count:v1',
  SOUND: '7ter:sound:v1',
  COOP: '7ter:coop:v1',
};

const DEFAULT_COUPLES: PlayerScore[] = [
  { id: 'c1', name: 'Couple 1', score: 0 },
  { id: 'c2', name: 'Couple 2', score: 0 },
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
  const [initialRoomCode, setInitialRoomCode] = useState<string | null>(null);
  const [couples, setCouples] = useState<PlayerScore[]>(DEFAULT_COUPLES);
  const [players, setPlayers] = useState<PlayerScore[]>(DEFAULT_PLAYERS);
  const [coopStats, setCoopStats] = useState<CoopStats>(DEFAULT_COOP);
  const [playedIds, setPlayedIds] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [doublePoints, setDoublePoints] = useState<boolean>(false);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [duoCarreCashEnabled, setDuoCarreCashEnabled] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [zoukMusicEnabled, setZoukMusicEnabled] = useState<boolean>(true);
  const [lastScoredId, setLastScoredId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) as GameMode | null;
      if (
        savedMode === '2_couples' ||
        savedMode === '4_players' ||
        savedMode === 'coop' ||
        savedMode === 'versus' ||
        savedMode === 'millions'
      ) {
        setMode(savedMode);
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
        if (Array.isArray(parsed) && parsed.length === 2) setCouples(parsed);
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

      const savedPlayed = localStorage.getItem(STORAGE_KEYS.PLAYED_IDS);
      if (savedPlayed) {
        const parsed = JSON.parse(savedPlayed);
        if (Array.isArray(parsed)) setPlayedIds(parsed);
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
          setPoolByLevel((prev) => {
            const merged: Record<number, QuizQuestionRecord[]> = {};
            for (let lvl = 1; lvl <= 10; lvl++) {
              const remoteList = remoteGrouped[lvl] || [];
              const localList = prev[lvl] || [];
              if (remoteList.length > 0) {
                const seenQuestions = new Set(
                  remoteList.map((q) => q.question.trim().toLowerCase())
                );
                const extraLocal = localList.filter(
                  (q) => !seenQuestions.has(q.question.trim().toLowerCase())
                );
                merged[lvl] = shuffleQuestions([...remoteList, ...extraLocal]);
              } else {
                merged[lvl] = localList;
              }
            }
            return merged;
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
      localStorage.setItem(STORAGE_KEYS.PLAYED_IDS, JSON.stringify(playedIds));
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
    playedIds,
    questionNumber,
    soundEnabled,
    duoCarreCashEnabled,
  ]);

  // Niveau effectif : en mode Ensemble (coop), c'est le palier d'ascension (1 -> 10)
  const effectiveLevel = mode === 'coop' ? coopStats.currentStep : selectedLevel;

  const playedSet = useMemo(() => new Set(playedIds), [playedIds]);

  const countsByLevel = useMemo(() => {
    const stats: Record<number, { total: number; remaining: number }> = {};
    for (let lvl = 1; lvl <= 10; lvl++) {
      const list = poolByLevel[lvl] || [];
      const remaining = list.filter((q) => !playedSet.has(q.id)).length;
      stats[lvl] = {
        total: list.length,
        remaining: remaining > 0 ? remaining : list.length,
      };
    }
    return stats;
  }, [poolByLevel, playedSet]);

  const currentLevelQuestions = useMemo(() => {
    const allInLevel = poolByLevel[effectiveLevel] || [];
    if (selectedTheme === 'ALL' || mode === 'coop') return allInLevel;
    const filtered = allInLevel.filter((q) => q.theme === selectedTheme);
    return filtered.length > 0 ? filtered : allInLevel;
  }, [poolByLevel, effectiveLevel, selectedTheme, mode]);

  const availableThemesInLevel = useMemo(() => {
    const allInLevel = poolByLevel[effectiveLevel] || [];
    return Array.from(new Set(allInLevel.map((q) => q.theme)));
  }, [poolByLevel, effectiveLevel]);

  const unplayedInCurrentLevel = useMemo(() => {
    return currentLevelQuestions.filter((q) => !playedSet.has(q.id));
  }, [currentLevelQuestions, playedSet]);

  const activeQuestion = useMemo(() => {
    if (unplayedInCurrentLevel.length > 0) {
      return unplayedInCurrentLevel[0];
    }
    return currentLevelQuestions[0] || null;
  }, [unplayedInCurrentLevel, currentLevelQuestions]);

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

    incrementQuestionPlayed(activeQuestion.id);

    setPlayedIds((prev) => {
      if (unplayedInCurrentLevel.length <= 1) {
        const levelIds = new Set(currentLevelQuestions.map((q) => q.id));
        const filtered = prev.filter((id) => !levelIds.has(id));
        return filtered;
      }
      return [...prev, activeQuestion.id];
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
  }, [activeQuestion, unplayedInCurrentLevel.length, currentLevelQuestions, mode]);

  const activeTeams = mode === '2_couples' ? couples : players;

  const handleUpdateScore = useCallback(
    (id: string, delta: number) => {
      if (delta > 0) {
        setLastScoredId(id);
        playPointSound(soundEnabled);
        setTimeout(() => {
          setLastScoredId((prev) => (prev === id ? null : prev));
        }, 900);
      }
      if (mode === '2_couples') {
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
    [mode, soundEnabled]
  );

  const handleRenameTeam = useCallback(
    (id: string, newName: string) => {
      if (mode === '2_couples') {
        setCouples((prev) =>
          prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
        );
      } else {
        setPlayers((prev) =>
          prev.map((t) => (t.id === id ? { ...t, name: newName } : t))
        );
      }
    },
    [mode]
  );

  const handleResetAll = useCallback(() => {
    setCouples((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setPlayers((prev) => prev.map((t) => ({ ...t, score: 0 })));
    setCoopStats(DEFAULT_COOP);
    setPlayedIds([]);
    setQuestionNumber(1);
    setSelectedTheme('ALL');
  }, []);

  const handleMarkVersusQuestionPlayed = useCallback((questionId: string) => {
    incrementQuestionPlayed(questionId);
    setPlayedIds((prev) => (prev.includes(questionId) ? prev : [...prev, questionId]));
  }, []);

  const totalPoolCount = useMemo(
    () =>
      Object.values(poolByLevel).reduce((sum, arr) => sum + arr.length, 0),
    [poolByLevel]
  );

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none">
      {/* En-tête avec barre de modes 100% visible sur mobile et desktop */}
      <header className="shrink-0 border-b border-yellow-400/35 bg-[#050d26]/95 px-2.5 sm:px-4 py-1.5 sm:py-2">
        <div className="mx-auto max-w-5xl flex flex-col gap-1.5">
          {/* Ligne 1 : Logo 7TER + Bouton Mode Enfant + Son + Reset */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative flex h-7 w-10 sm:h-8 sm:w-12 shrink-0 items-center justify-center rounded-lg border-2 border-yellow-400 bg-gradient-to-br from-[#133282] to-[#06102b] shadow">
                <span className="text-sm sm:text-base font-black text-yellow-400 tracking-tighter">
                  7
                </span>
                <span className="text-[8px] sm:text-[9px] font-black uppercase text-white ml-0.5">
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

            <div className="flex items-center gap-1.5 shrink-0">
              <Link
                href="/enfants"
                className="inline-flex items-center gap-1 rounded-lg border border-lime-400/60 bg-gradient-to-r from-lime-400/25 to-emerald-500/25 hover:from-lime-400 hover:to-emerald-400 hover:text-slate-950 px-2.5 py-1 text-[11px] font-black text-lime-300 transition shadow-sm"
                title="Ouvrir la page dédiée au Mode Enfant (Quiz sur images : Ferme, JO, Animaux, Sport, Pokémon)"
              >
                <span>🎈</span>
                <span>Mode Enfant</span>
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
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-black transition active:scale-95 ${
                  zoukMusicEnabled && soundEnabled
                    ? 'border-emerald-300 bg-gradient-to-r from-emerald-400 to-amber-300 text-slate-950 shadow'
                    : 'border-emerald-400/40 bg-emerald-950/60 text-emerald-300 hover:bg-emerald-500/20'
                }`}
                title="Jouer / couper le générique Qui veut gagner des millions (Version Zouk Antillais)"
              >
                <Music className="h-3 w-3" />
                <span>🌴 Zouk {zoukMusicEnabled && soundEnabled ? 'ON' : 'OFF'}</span>
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
                className={`flex h-7 w-7 items-center justify-center rounded-lg border transition ${
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
                className="inline-flex items-center gap-1 rounded-lg border border-blue-400/35 bg-blue-900/50 px-2 py-1 text-[11px] font-extrabold text-blue-100 hover:bg-yellow-400 hover:text-blue-950 transition"
                title="Remettre les scores et la soirée à zéro"
              >
                <RotateCcw className="h-3 w-3" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>

          {/* Ligne 2 : Sélecteur des 5 Modes de Jeu (2 Couples | 4 Solo | Ensemble | Versus 10s | Millions) */}
          <div className="grid grid-cols-5 gap-1 rounded-xl bg-[#040b1e] p-1 border border-blue-500/35">
            <button
              type="button"
              onClick={() => {
                stopMillionsZoukMusic();
                setMode('2_couples');
              }}
              className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 text-[10px] sm:text-xs font-black transition ${
                mode === '2_couples'
                  ? 'bg-yellow-400 text-blue-950 shadow'
                  : 'text-blue-200/80 hover:text-white'
              }`}
            >
              <Users className="h-3 w-3 shrink-0" />
              <span className="truncate">2 Couples</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopMillionsZoukMusic();
                setMode('4_players');
              }}
              className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 text-[10px] sm:text-xs font-black transition ${
                mode === '4_players'
                  ? 'bg-yellow-400 text-blue-950 shadow'
                  : 'text-blue-200/80 hover:text-white'
              }`}
            >
              <User className="h-3 w-3 shrink-0" />
              <span className="truncate">4 Solo</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopMillionsZoukMusic();
                setMode('coop');
                setCoopStats((prev) => ({ ...prev, status: 'playing' }));
              }}
              className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 text-[10px] sm:text-xs font-black transition ${
                mode === 'coop'
                  ? 'bg-gradient-to-r from-yellow-300 to-amber-500 text-blue-950 shadow'
                  : 'text-yellow-300/90 hover:text-yellow-300'
              }`}
              title="Mode coopératif à 4 : réussir les 10 niveaux d'affilée sans erreur"
            >
              <Flame className="h-3 w-3 shrink-0" />
              <span className="truncate">Ensemble</span>
            </button>

            <button
              type="button"
              onClick={() => {
                stopMillionsZoukMusic();
                setMode('versus');
              }}
              className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 text-[10px] sm:text-xs font-black transition ${
                mode === 'versus'
                  ? 'bg-gradient-to-r from-sky-300 via-sky-400 to-blue-500 text-slate-950 shadow'
                  : 'text-sky-300 hover:text-white'
              }`}
              title="Salon Versus Multi-Téléphones : Timer 10s à points dégressifs"
            >
              <Swords className="h-3 w-3 shrink-0" />
              <span className="truncate">Versus 10s</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMode('millions');
                if (soundEnabled && zoukMusicEnabled) {
                  startMillionsZoukMusic(true, 1);
                }
              }}
              className={`inline-flex items-center justify-center gap-1 rounded-lg py-1.5 px-1 text-[10px] sm:text-xs font-black transition ${
                mode === 'millions'
                  ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 text-blue-950 shadow'
                  : 'text-amber-300 hover:text-white'
              }`}
              title="Qui veut gagner des Millions : 15 paliers, 2 paliers de sécurité et 4 Jokers !"
            >
              <Gem className="h-3 w-3 shrink-0" />
              <span className="truncate">Millions</span>
            </button>
          </div>
        </div>
      </header>

      {/* Cockpit Principal Sans Scroll (occupe exactement le reste de la hauteur 100dvh) */}
      <main className="mx-auto w-full max-w-5xl flex-1 min-h-0 flex flex-col justify-between gap-2 px-2.5 py-2 sm:px-4 sm:py-3">
        {mode === 'versus' ? (
          <VersusMode
            poolByLevel={poolByLevel}
            playedIds={playedIds}
            onMarkQuestionPlayed={handleMarkVersusQuestionPlayed}
            soundEnabled={soundEnabled}
            initialRoomCode={initialRoomCode}
          />
        ) : mode === 'millions' ? (
          <MillionsMode
            poolByLevel={poolByLevel}
            playedIds={playedIds}
            onMarkQuestionPlayed={handleMarkVersusQuestionPlayed}
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
            />
          </>
        )}
      </main>
    </div>
  );
}
