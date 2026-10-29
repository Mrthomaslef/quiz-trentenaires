'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Scoreboard, { type GameMode, type PlayerScore } from '@/components/Scoreboard';
import DifficultySelector from '@/components/DifficultySelector';
import QuestionCard from '@/components/QuestionCard';
import {
  fetchAllQuestionsFromSupabase,
  incrementQuestionPlayed,
  type QuizQuestionRecord,
} from '@/lib/supabase';
import { getAllLocalSeedQuestionsGrouped } from '@/lib/seed-data';
import {
  Sparkles,
  Database,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Filter,
} from 'lucide-react';
import { playPointSound } from '@/lib/sound';

const STORAGE_KEYS = {
  MODE: '7ter:mode:v1',
  COUPLES: '7ter:couples:v1',
  PLAYERS: '7ter:players:v1',
  LEVEL: '7ter:level:v1',
  PLAYED_IDS: '7ter:played_ids:v1',
  QUESTION_COUNT: '7ter:q_count:v1',
  SOUND: '7ter:sound:v1',
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
  const [couples, setCouples] = useState<PlayerScore[]>(DEFAULT_COUPLES);
  const [players, setPlayers] = useState<PlayerScore[]>(DEFAULT_PLAYERS);
  const [playedIds, setPlayedIds] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
  const [doublePoints, setDoublePoints] = useState<boolean>(false);
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [lastScoredId, setLastScoredId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState<boolean>(false);

  // Hydratation depuis localStorage au montage
  useEffect(() => {
    try {
      const savedMode = localStorage.getItem(STORAGE_KEYS.MODE) as GameMode | null;
      if (savedMode === '2_couples' || savedMode === '4_players') {
        setMode(savedMode);
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
    } catch {
      // Ignore storage errors in private mode
    } finally {
      setHydrated(true);
    }
  }, []);

  // Pré-chargement (Prefetching) de toute la banque Supabase dès l'ouverture
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
              merged[lvl] =
                remoteList.length > 0
                  ? shuffleQuestions(remoteList)
                  : prev[lvl] || [];
            }
            return merged;
          });
          setDbSynced(true);
        }
      })
      .catch(() => {
        // Fallback local transparent déjà chargé en mémoire
      });

    return () => {
      active = false;
    };
  }, []);

  // Sauvegarde automatique dans localStorage
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEYS.MODE, mode);
      localStorage.setItem(STORAGE_KEYS.COUPLES, JSON.stringify(couples));
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(players));
      localStorage.setItem(STORAGE_KEYS.LEVEL, String(selectedLevel));
      localStorage.setItem(STORAGE_KEYS.PLAYED_IDS, JSON.stringify(playedIds));
      localStorage.setItem(STORAGE_KEYS.QUESTION_COUNT, String(questionNumber));
      localStorage.setItem(STORAGE_KEYS.SOUND, String(soundEnabled));
    } catch {
      // Ignore storage errors
    }
  }, [hydrated, mode, couples, players, selectedLevel, playedIds, questionNumber, soundEnabled]);

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
    const allInLevel = poolByLevel[selectedLevel] || [];
    if (selectedTheme === 'ALL') return allInLevel;
    const filtered = allInLevel.filter((q) => q.theme === selectedTheme);
    return filtered.length > 0 ? filtered : allInLevel;
  }, [poolByLevel, selectedLevel, selectedTheme]);

  const availableThemesInLevel = useMemo(() => {
    const allInLevel = poolByLevel[selectedLevel] || [];
    return Array.from(new Set(allInLevel.map((q) => q.theme)));
  }, [poolByLevel, selectedLevel]);

  const unplayedInCurrentLevel = useMemo(() => {
    return currentLevelQuestions.filter((q) => !playedSet.has(q.id));
  }, [currentLevelQuestions, playedSet]);

  const activeQuestion = useMemo(() => {
    if (unplayedInCurrentLevel.length > 0) {
      return unplayedInCurrentLevel[0];
    }
    return currentLevelQuestions[0] || null;
  }, [unplayedInCurrentLevel, currentLevelQuestions]);

  // Transition instantanée (<10ms) vers la question suivante
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

    setDoublePoints(false);
    setQuestionNumber((n) => n + 1);
  }, [activeQuestion, unplayedInCurrentLevel.length, currentLevelQuestions]);

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

  const handleResetScores = useCallback(() => {
    if (mode === '2_couples') {
      setCouples((prev) => prev.map((t) => ({ ...t, score: 0 })));
    } else {
      setPlayers((prev) => prev.map((t) => ({ ...t, score: 0 })));
    }
  }, [mode]);

  const handleResetPartyHistory = useCallback(() => {
    setPlayedIds([]);
    setQuestionNumber(1);
    setSelectedTheme('ALL');
    setPoolByLevel((prev) => {
      const reshuffled: Record<number, QuizQuestionRecord[]> = {};
      for (let lvl = 1; lvl <= 10; lvl++) {
        reshuffled[lvl] = shuffleQuestions(prev[lvl] || []);
      }
      return reshuffled;
    });
  }, []);

  const totalPoolCount = useMemo(
    () =>
      Object.values(poolByLevel).reduce((sum, arr) => sum + arr.length, 0),
    [poolByLevel]
  );

  return (
    <div className="min-h-screen pb-16">
      {/* En-tête Plateau TV Jaune & Bleu du 7TER */}
      <header className="border-b-2 border-yellow-400/40 bg-[#050d26]/90 backdrop-blur-xl sticky top-0 z-30 shadow-xl shadow-blue-950/50">
        <div className="mx-auto max-w-5xl px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          {/* Logo Plaque "7 TER" + Titre */}
          <div className="flex items-center gap-3.5">
            <div className="relative flex h-12 w-16 shrink-0 items-center justify-center rounded-xl border-2 border-yellow-400 bg-gradient-to-br from-[#133282] via-[#0b1d48] to-[#06102b] shadow-lg shadow-yellow-400/20">
              <div className="absolute inset-0.5 rounded-[9px] border border-sky-400/35 pointer-events-none" />
              <div className="flex items-baseline gap-0.5 leading-none">
                <span className="text-2xl font-black text-yellow-400 tracking-tighter drop-shadow">
                  7
                </span>
                <span className="text-xs font-black uppercase text-white tracking-wider">
                  TER
                </span>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-2xl font-black uppercase tracking-tight text-white">
                  QUIZ du <span className="text-yellow-400">7TER</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-yellow-400 text-blue-950 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide shadow-sm">
                  <Sparkles className="h-3 w-3 fill-blue-950" />
                  Show 90–98
                </span>
              </div>
              <p className="text-xs font-medium text-blue-200/80">
                2 Couples ou 4 Joueurs · {totalPoolCount} questions en stock · Zéro latence
              </p>
            </div>
          </div>

          {/* Actions Header : Son, Statut DB, Nouvelle soirée */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition ${
                soundEnabled
                  ? 'border-yellow-400/60 bg-yellow-400/15 text-yellow-300'
                  : 'border-blue-500/30 bg-blue-950/70 text-blue-300/60'
              }`}
              title={soundEnabled ? 'Couper les bruitages TV' : 'Activer les bruitages TV'}
            >
              {soundEnabled ? (
                <>
                  <Volume2 className="h-4 w-4 text-yellow-400" />
                  <span className="hidden sm:inline">Son TV</span>
                </>
              ) : (
                <>
                  <VolumeX className="h-4 w-4" />
                  <span className="hidden sm:inline">Muet</span>
                </>
              )}
            </button>

            <span
              className={`inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold ${
                dbSynced
                  ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-sky-400/40 bg-sky-500/15 text-sky-300'
              }`}
              title={
                dbSynced
                  ? 'Connecté en direct à Supabase PostgreSQL'
                  : 'Pool pré-chargé en mémoire locale (<10ms)'
              }
            >
              {dbSynced ? (
                <>
                  <Database className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Supabase Live</span>
                </>
              ) : (
                <>
                  <Zap className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Prêt &lt;10ms</span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={handleResetPartyHistory}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/35 bg-blue-900/50 px-3 py-1.5 text-xs font-extrabold text-blue-100 hover:bg-yellow-400 hover:text-blue-950 hover:border-yellow-400 transition"
              title="Rebattre toutes les cartes pour une nouvelle soirée"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nouvelle soirée</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="mx-auto max-w-5xl px-4 pt-5 space-y-5">
        {/* 1. Tableau des scores (2 Couples / 4 Joueurs + Jauge du 7TER) */}
        <Scoreboard
          mode={mode}
          onModeChange={setMode}
          teams={activeTeams}
          onUpdateScore={handleUpdateScore}
          onRenameTeam={handleRenameTeam}
          onResetScores={handleResetScores}
          lastScoredId={lastScoredId}
        />

        {/* 2. Sélecteur de difficulté en direct (1 à 10) + Roulette & Modes */}
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
          soundEnabled={soundEnabled}
        />

        {/* Barre de filtre rapide par thème (optionnel) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-yellow-300 shrink-0 mr-1">
            <Filter className="h-3.5 w-3.5" />
            Thème :
          </span>
          <button
            type="button"
            onClick={() => setSelectedTheme('ALL')}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-extrabold transition ${
              selectedTheme === 'ALL'
                ? 'bg-yellow-400 text-blue-950 shadow-md'
                : 'bg-[#0b1d48]/80 text-blue-200 border border-blue-500/30 hover:border-yellow-400/50'
            }`}
          >
            Tous les thèmes
          </button>
          {availableThemesInLevel.map((th) => (
            <button
              key={th}
              type="button"
              onClick={() => setSelectedTheme(th)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold transition ${
                selectedTheme === th
                  ? 'bg-yellow-400 text-blue-950 shadow-md font-extrabold'
                  : 'bg-[#0b1d48]/80 text-blue-200 border border-blue-500/30 hover:border-yellow-400/50'
              }`}
            >
              {th}
            </button>
          ))}
        </div>

        {/* 3. Carte Question active & Explication */}
        <QuestionCard
          question={activeQuestion}
          onNextQuestion={handleNextQuestion}
          onAwardPoint={handleUpdateScore}
          teams={activeTeams}
          questionNumber={questionNumber}
          remainingInLevel={unplayedInCurrentLevel.length || currentLevelQuestions.length}
          totalInLevel={currentLevelQuestions.length}
          doublePoints={doublePoints}
          timerEnabled={timerEnabled}
          soundEnabled={soundEnabled}
        />
      </main>
    </div>
  );
}
