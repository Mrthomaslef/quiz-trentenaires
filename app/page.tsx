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
import { Sparkles, Database, RotateCcw, Wine, Zap } from 'lucide-react';

const STORAGE_KEYS = {
  MODE: 'trentenaires:mode:v1',
  COUPLES: 'trentenaires:couples:v1',
  PLAYERS: 'trentenaires:players:v1',
  LEVEL: 'trentenaires:level:v1',
  PLAYED_IDS: 'trentenaires:played_ids:v1',
  QUESTION_COUNT: 'trentenaires:q_count:v1',
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
  // Initialisation immédiate avec le pool pré-généré en mémoire (<10ms) puis synchronisation Supabase
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
  const [mode, setMode] = useState<GameMode>('2_couples');
  const [couples, setCouples] = useState<PlayerScore[]>(DEFAULT_COUPLES);
  const [players, setPlayers] = useState<PlayerScore[]>(DEFAULT_PLAYERS);
  const [playedIds, setPlayedIds] = useState<string[]>([]);
  const [questionNumber, setQuestionNumber] = useState<number>(1);
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
    } catch {
      // Ignore storage errors
    }
  }, [hydrated, mode, couples, players, selectedLevel, playedIds, questionNumber]);

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
    return poolByLevel[selectedLevel] || [];
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
      // Si toutes les questions du niveau ont été jouées, on recycle proprement ce niveau
      if (unplayedInCurrentLevel.length <= 1) {
        const levelIds = new Set(currentLevelQuestions.map((q) => q.id));
        const filtered = prev.filter((id) => !levelIds.has(id));
        return filtered;
      }
      return [...prev, activeQuestion.id];
    });

    setQuestionNumber((n) => n + 1);
  }, [activeQuestion, unplayedInCurrentLevel.length, currentLevelQuestions]);

  const activeTeams = mode === '2_couples' ? couples : players;

  const handleUpdateScore = useCallback(
    (id: string, delta: number) => {
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
    [mode]
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
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950/50 via-slate-950 to-slate-950 pb-14">
      {/* En-tête de soirée */}
      <header className="border-b border-slate-800/80 bg-slate-950/75 backdrop-blur-md sticky top-0 z-30">
        <div className="mx-auto max-w-5xl px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <Wine className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-xl font-black tracking-tight text-white">
                  Le Grand Quiz des Trentenaires
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-300">
                  <Sparkles className="h-3 w-3" />
                  Édition 90–98
                </span>
              </div>
              <p className="text-xs text-slate-400">
                2 Couples ou 4 Joueurs · Zéro latence · {totalPoolCount} questions pré-générées
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                dbSynced
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                  : 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300'
              }`}
              title={
                dbSynced
                  ? 'Connecté en direct à la base PostgreSQL Supabase'
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
                  <span className="hidden sm:inline">Cache Instantané</span>
                </>
              )}
            </span>

            <button
              type="button"
              onClick={handleResetPartyHistory}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/90 px-2.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
              title="Mélanger à nouveau toutes les questions de la soirée"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Nouvelle soirée</span>
            </button>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="mx-auto max-w-5xl px-4 pt-5 space-y-5">
        {/* 1. Tableau des scores (2 Couples / 4 Joueurs) */}
        <Scoreboard
          mode={mode}
          onModeChange={setMode}
          teams={activeTeams}
          onUpdateScore={handleUpdateScore}
          onRenameTeam={handleRenameTeam}
          onResetScores={handleResetScores}
        />

        {/* 2. Sélecteur de difficulté en direct (1 à 10) */}
        <DifficultySelector
          selectedLevel={selectedLevel}
          onSelectLevel={setSelectedLevel}
          countsByLevel={countsByLevel}
        />

        {/* 3. Carte Question active & Explication */}
        <QuestionCard
          question={activeQuestion}
          onNextQuestion={handleNextQuestion}
          onAwardPoint={handleUpdateScore}
          teams={activeTeams}
          questionNumber={questionNumber}
          remainingInLevel={countsByLevel[selectedLevel]?.remaining ?? 0}
          totalInLevel={countsByLevel[selectedLevel]?.total ?? 0}
        />
      </main>
    </div>
  );
}
