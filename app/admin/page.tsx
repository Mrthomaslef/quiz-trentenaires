'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  fetchAllQuestionsFromSupabase,
  type QuizQuestionRecord,
} from '@/lib/supabase';
import { getAllLocalSeedQuestionsGrouped } from '@/lib/seed-data';
import { DIFFICULTY_LEVELS } from '@/lib/generator';
import {
  loadQuestionAnalytics,
  saveQuestionAnalytics,
  loadAdminSettings,
  saveAdminSettings,
  verifyAdminCode,
  getQuestionAnalytics,
  evaluateQuestionDifficulty,
  updateQuestionAdminEntry,
  recordQuestionAnswerOutcome,
  ADMIN_SESSION_UNLOCKED_KEY,
  type QuestionAnalyticsMap,
  type AdminSettings,
  DEFAULT_ADMIN_SETTINGS,
} from '@/lib/question-analytics';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  BarChart3,
  Archive,
  Sparkles,
  Search,
  CheckCircle2,
  XCircle,
  MessageSquare,
  RotateCcw,
  SlidersHorizontal,
  Download,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Tag,
  Check,
  Eye,
  LogOut,
  Plus,
} from 'lucide-react';

type AdminTab = 'overview' | 'evaluate' | 'already_answered';
type StatusFilter =
  | 'ALL'
  | 'ANSWERED'
  | 'ALREADY_ANSWERED_POOL'
  | 'WITH_NOTES'
  | 'TOO_EASY'
  | 'TOO_HARD'
  | 'FRESH';

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function AdminQuestionsPage() {
  const [unlocked, setUnlocked] = useState<boolean>(false);
  const [codeInput, setCodeInput] = useState<string>('');
  const [codeError, setCodeError] = useState<string | null>(null);
  const [activeAdminCode, setActiveAdminCode] = useState<string>('7TER');

  const [questionsByLevel, setQuestionsByLevel] = useState<
    Record<number, QuizQuestionRecord[]>
  >(() => getAllLocalSeedQuestionsGrouped());
  const [analyticsMap, setAnalyticsMap] = useState<QuestionAnalyticsMap>({});
  const [settings, setSettings] = useState<AdminSettings>(
    DEFAULT_ADMIN_SETTINGS
  );

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [selectedLevel, setSelectedLevel] = useState<number | 'ALL'>('ALL');
  const [selectedTheme, setSelectedTheme] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // État d'édition de note par question
  const [draftNotes, setDraftNotes] = useState<Record<string, string>>({});
  const [savedFeedbackId, setSavedFeedbackId] = useState<string | null>(null);
  const [expandedAnswerId, setExpandedAnswerId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedUnlock = sessionStorage.getItem(ADMIN_SESSION_UNLOCKED_KEY);
      if (savedUnlock && verifyAdminCode(savedUnlock)) {
        setUnlocked(true);
        setActiveAdminCode(savedUnlock.toUpperCase());
      }
      setAnalyticsMap(loadQuestionAnalytics());
      setSettings(loadAdminSettings());
    } catch {
      // Ignore
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
          setQuestionsByLevel((prev) => {
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
                merged[lvl] = [...remoteList, ...extraLocal];
              } else {
                merged[lvl] = localList;
              }
            }
            return merged;
          });
        }
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, []);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminCode(codeInput)) {
      const clean = codeInput.trim().toUpperCase();
      setUnlocked(true);
      setActiveAdminCode(clean);
      setCodeError(null);
      try {
        sessionStorage.setItem(ADMIN_SESSION_UNLOCKED_KEY, clean);
      } catch {
        // Ignore
      }
    } else {
      setCodeError(
        'Code administrateur incorrect (essayez le code du 7TER : 7TER ou ADMIN).'
      );
    }
  };

  const handleLockSession = () => {
    setUnlocked(false);
    setCodeInput('');
    try {
      sessionStorage.removeItem(ADMIN_SESSION_UNLOCKED_KEY);
    } catch {
      // Ignore
    }
  };

  // Liste complète enrichie de toutes les questions avec leurs statistiques et diagnostics de difficulté
  const allEnrichedQuestions = useMemo(() => {
    const list: Array<{
      question: QuizQuestionRecord;
      effectiveDifficulty: number;
      analytics: ReturnType<typeof getQuestionAnalytics>;
      evaluation: ReturnType<typeof evaluateQuestionDifficulty>;
    }> = [];

    for (let lvl = 1; lvl <= 10; lvl++) {
      for (const q of questionsByLevel[lvl] || []) {
        const analytics = getQuestionAnalytics(
          q,
          analyticsMap,
          settings.autoArchiveThreshold
        );
        const effectiveDifficulty =
          analytics.difficultyOverride ?? q.difficulty;
        const evaluation = evaluateQuestionDifficulty(
          effectiveDifficulty,
          analytics.timesAnswered,
          analytics.timesCorrect
        );
        list.push({
          question: q,
          effectiveDifficulty,
          analytics,
          evaluation,
        });
      }
    }
    return list;
  }, [questionsByLevel, analyticsMap, settings.autoArchiveThreshold]);

  // Agrégations globales pour le tableau de bord
  const globalSummary = useMemo(() => {
    const totalQuestions = allEnrichedQuestions.length;
    let answeredAtLeastOnce = 0;
    let inAlreadyAnsweredPoolCount = 0;
    let withNotesCount = 0;
    let totalAnswersRecorded = 0;
    let totalCorrectRecorded = 0;
    let tooEasyCount = 0;
    let tooHardCount = 0;
    let calibratedCount = 0;

    const byLevel: Record<
      number,
      {
        level: number;
        total: number;
        freshCount: number;
        alreadyAnsweredCount: number;
        totalPlays: number;
        totalCorrect: number;
        avgSuccessRate: number | null;
        notesCount: number;
      }
    > = {};

    for (let lvl = 1; lvl <= 10; lvl++) {
      byLevel[lvl] = {
        level: lvl,
        total: 0,
        freshCount: 0,
        alreadyAnsweredCount: 0,
        totalPlays: 0,
        totalCorrect: 0,
        avgSuccessRate: null,
        notesCount: 0,
      };
    }

    const byTheme: Record<
      string,
      {
        theme: string;
        total: number;
        answered: number;
        alreadyAnsweredPool: number;
        totalPlays: number;
        totalCorrect: number;
      }
    > = {};

    for (const item of allEnrichedQuestions) {
      const lvl = item.effectiveDifficulty;
      const th = item.question.theme;
      const a = item.analytics;

      if (byLevel[lvl]) {
        byLevel[lvl].total += 1;
        if (a.inAlreadyAnsweredPool) {
          byLevel[lvl].alreadyAnsweredCount += 1;
        } else {
          byLevel[lvl].freshCount += 1;
        }
        byLevel[lvl].totalPlays += a.timesAnswered;
        byLevel[lvl].totalCorrect += a.timesCorrect;
        if (a.notes.trim().length > 0) {
          byLevel[lvl].notesCount += 1;
        }
      }

      if (!byTheme[th]) {
        byTheme[th] = {
          theme: th,
          total: 0,
          answered: 0,
          alreadyAnsweredPool: 0,
          totalPlays: 0,
          totalCorrect: 0,
        };
      }
      byTheme[th].total += 1;
      if (a.timesAnswered > 0) byTheme[th].answered += 1;
      if (a.inAlreadyAnsweredPool) byTheme[th].alreadyAnsweredPool += 1;
      byTheme[th].totalPlays += a.timesAnswered;
      byTheme[th].totalCorrect += a.timesCorrect;

      if (a.timesAnswered > 0) {
        answeredAtLeastOnce += 1;
        totalAnswersRecorded += a.timesAnswered;
        totalCorrectRecorded += a.timesCorrect;
      }
      if (a.inAlreadyAnsweredPool) {
        inAlreadyAnsweredPoolCount += 1;
      }
      if (a.notes.trim().length > 0) {
        withNotesCount += 1;
      }

      if (item.evaluation.diagnostic === 'too_easy') tooEasyCount += 1;
      if (item.evaluation.diagnostic === 'too_hard') tooHardCount += 1;
      if (item.evaluation.diagnostic === 'calibrated') calibratedCount += 1;
    }

    for (let lvl = 1; lvl <= 10; lvl++) {
      if (byLevel[lvl].totalPlays > 0) {
        byLevel[lvl].avgSuccessRate = Math.round(
          (byLevel[lvl].totalCorrect / byLevel[lvl].totalPlays) * 100
        );
      }
    }

    const globalSuccessRate =
      totalAnswersRecorded > 0
        ? Math.round((totalCorrectRecorded / totalAnswersRecorded) * 100)
        : null;

    return {
      totalQuestions,
      freshPoolCount: totalQuestions - inAlreadyAnsweredPoolCount,
      answeredAtLeastOnce,
      inAlreadyAnsweredPoolCount,
      withNotesCount,
      totalAnswersRecorded,
      totalCorrectRecorded,
      globalSuccessRate,
      tooEasyCount,
      tooHardCount,
      calibratedCount,
      byLevel: Object.values(byLevel),
      byTheme: Object.values(byTheme).sort((a, b) => b.total - a.total),
    };
  }, [allEnrichedQuestions]);

  const allThemes = useMemo(() => {
    return Array.from(
      new Set(allEnrichedQuestions.map((item) => item.question.theme))
    ).sort();
  }, [allEnrichedQuestions]);

  // Filtrage des questions pour l'onglet Évaluation & Notes ou Base "Déjà répondu"
  const filteredQuestions = useMemo(() => {
    return allEnrichedQuestions
      .filter((item) => {
        if (activeTab === 'already_answered' && !item.analytics.inAlreadyAnsweredPool) {
          return false;
        }
        if (selectedLevel !== 'ALL' && item.effectiveDifficulty !== selectedLevel) {
          return false;
        }
        if (selectedTheme !== 'ALL' && item.question.theme !== selectedTheme) {
          return false;
        }
        if (statusFilter === 'ANSWERED' && item.analytics.timesAnswered === 0) {
          return false;
        }
        if (
          statusFilter === 'ALREADY_ANSWERED_POOL' &&
          !item.analytics.inAlreadyAnsweredPool
        ) {
          return false;
        }
        if (
          statusFilter === 'FRESH' &&
          item.analytics.inAlreadyAnsweredPool
        ) {
          return false;
        }
        if (
          statusFilter === 'WITH_NOTES' &&
          item.analytics.notes.trim().length === 0
        ) {
          return false;
        }
        if (
          statusFilter === 'TOO_EASY' &&
          item.evaluation.diagnostic !== 'too_easy'
        ) {
          return false;
        }
        if (
          statusFilter === 'TOO_HARD' &&
          item.evaluation.diagnostic !== 'too_hard'
        ) {
          return false;
        }

        if (searchQuery.trim().length > 0) {
          const qLower = searchQuery.trim().toLowerCase();
          const inQuestion = item.question.question
            .toLowerCase()
            .includes(qLower);
          const inNotes = item.analytics.notes.toLowerCase().includes(qLower);
          const inTheme = item.question.theme.toLowerCase().includes(qLower);
          const inOptions = item.question.options.some((opt) =>
            opt.toLowerCase().includes(qLower)
          );
          if (!inQuestion && !inNotes && !inTheme && !inOptions) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        // Trier d'abord par nombre de réponses décroissant, puis par niveau
        if (b.analytics.timesAnswered !== a.analytics.timesAnswered) {
          return b.analytics.timesAnswered - a.analytics.timesAnswered;
        }
        return a.effectiveDifficulty - b.effectiveDifficulty;
      });
  }, [
    allEnrichedQuestions,
    activeTab,
    selectedLevel,
    selectedTheme,
    statusFilter,
    searchQuery,
  ]);

  const showSavedFeedback = useCallback((id: string) => {
    setSavedFeedbackId(id);
    setTimeout(() => {
      setSavedFeedbackId((prev) => (prev === id ? null : prev));
    }, 1800);
  }, []);

  const handleSaveNoteAndDifficulty = (
    question: QuizQuestionRecord,
    updates: {
      notes?: string;
      difficultyOverride?: number;
      inAlreadyAnsweredPool?: boolean;
      resetStats?: boolean;
    }
  ) => {
    const nextMap = updateQuestionAdminEntry(
      question,
      updates,
      activeAdminCode,
      analyticsMap
    );
    setAnalyticsMap(nextMap);
    showSavedFeedback(question.id);
  };

  const handleSimulateOutcome = (
    question: QuizQuestionRecord,
    isCorrect: boolean
  ) => {
    const nextMap = recordQuestionAnswerOutcome(
      question,
      isCorrect,
      analyticsMap
    );
    setAnalyticsMap(nextMap);
    showSavedFeedback(question.id);
  };

  const handleUpdateThreshold = (newThreshold: number) => {
    const clamped = Math.max(1, Math.min(10, newThreshold));
    const nextSettings: AdminSettings = {
      ...settings,
      autoArchiveThreshold: clamped,
    };
    setSettings(nextSettings);
    saveAdminSettings(nextSettings);
  };

  const handleRestoreAllAlreadyAnswered = () => {
    const updated: QuestionAnalyticsMap = {};
    for (const [k, v] of Object.entries(analyticsMap)) {
      updated[k] = {
        ...v,
        inAlreadyAnsweredPool: false,
        manualPoolOverride: false,
      };
    }
    saveQuestionAnalytics(updated);
    setAnalyticsMap(updated);
  };

  const handleExportReport = () => {
    const exportPayload = {
      exportedAt: new Date().toISOString(),
      settings,
      summary: globalSummary,
      questionsWithActivityOrNotes: allEnrichedQuestions
        .filter(
          (i) =>
            i.analytics.timesAnswered > 0 ||
            i.analytics.notes.trim().length > 0 ||
            i.analytics.difficultyOverride !== undefined ||
            i.analytics.inAlreadyAnsweredPool
        )
        .map((i) => ({
          id: i.question.id,
          question: i.question.question,
          theme: i.question.theme,
          initialDifficulty: i.question.difficulty,
          effectiveDifficulty: i.effectiveDifficulty,
          suggestedDifficulty: i.evaluation.suggestedDifficulty,
          diagnostic: i.evaluation.label,
          timesAnswered: i.analytics.timesAnswered,
          timesCorrect: i.analytics.timesCorrect,
          timesWrong: i.analytics.timesWrong,
          successRate: i.evaluation.successRate,
          inAlreadyAnsweredPool: i.analytics.inAlreadyAnsweredPool,
          notes: i.analytics.notes,
        })),
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `quiz-7ter-stats-admin-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ============================================================================
  // ÉCRAN DE VERROUILLAGE PAR CODE ADMIN
  // ============================================================================
  if (!unlocked) {
    return (
      <div className="min-h-[100dvh] w-full flex flex-col justify-between bg-[#050d26] p-4 select-none">
        <header className="mx-auto w-full max-w-5xl flex items-center justify-between py-2">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/40 bg-blue-950/80 hover:bg-yellow-400 hover:text-blue-950 px-3 py-1.5 text-xs font-black text-blue-100 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Retour au Quiz du 7TER</span>
          </Link>
        </header>

        <main className="mx-auto my-auto w-full max-w-md rounded-2xl border-2 border-purple-400/60 bg-gradient-to-b from-[#0c1f4f]/95 via-[#081538]/95 to-[#050d26]/95 p-6 shadow-2xl space-y-5">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-purple-400 bg-purple-500/20 text-purple-300 shadow-lg">
              <Lock className="h-7 w-7" />
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/25 border border-purple-400/40 px-3 py-0.5 text-[11px] font-black uppercase tracking-wider text-purple-200">
              Espace Dédié Administrateur
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Évaluation &amp; Stats des Questions
            </h1>
            <p className="text-xs sm:text-sm text-blue-200/80">
              Entrez le code administrateur pour accéder aux notes de
              difficulté, aux statistiques détaillées et à la base{' '}
              <strong className="text-purple-300">« Déjà répondu »</strong>.
            </p>
          </div>

          <form onSubmit={handleUnlockSubmit} className="space-y-3">
            <div>
              <label
                htmlFor="admin-code-input"
                className="block text-[11px] font-black uppercase tracking-wider text-yellow-300 mb-1.5"
              >
                Code d&apos;accès Admin
              </label>
              <input
                id="admin-code-input"
                type="password"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Code Admin (ex: 7TER)"
                autoFocus
                className="w-full rounded-xl border-2 border-purple-400/50 focus:border-yellow-400 bg-[#040b1e] px-4 py-3 text-center font-mono text-lg font-black tracking-widest uppercase text-yellow-300 placeholder-blue-300/35 outline-none transition"
              />
            </div>

            {codeError && (
              <div className="rounded-xl border border-rose-500/50 bg-rose-950/60 px-3 py-2 text-xs font-bold text-rose-300 text-center">
                {codeError}
              </div>
            )}

            <button
              type="submit"
              className="shimmer-btn w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wide text-blue-950 shadow-lg active:scale-95 transition"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>Déverrouiller l&apos;Espace Admin</span>
            </button>
          </form>

          <div className="rounded-xl border border-blue-500/30 bg-[#040b1e]/70 p-3 text-[11px] text-blue-200/75 space-y-1">
            <p className="font-extrabold text-yellow-300">
              💡 Fonctionnement automatique :
            </p>
            <p>
              • Chaque question répondue pendant une partie voit son taux de
              réussite et son compteur mis à jour.
            </p>
            <p>
              • Dès qu&apos;une question est répondue{' '}
              <strong className="text-white">
                {settings.autoArchiveThreshold} fois ou plus
              </strong>
              , elle bascule dans la base{' '}
              <strong className="text-purple-300">« Déjà répondu »</strong> et
              sa probabilité d&apos;apparition est fortement réduite.
            </p>
          </div>
        </main>

        <div />
      </div>
    );
  }

  // ============================================================================
  // TABLEAU DE BORD ADMINISTRATEUR DÉVERROUILLÉ
  // ============================================================================
  return (
    <div className="min-h-[100dvh] w-full flex flex-col bg-[#050d26] text-white">
      {/* EN-TÊTE ADMIN */}
      <header className="sticky top-0 z-30 border-b border-purple-400/35 bg-[#050d26]/95 backdrop-blur-md px-3 sm:px-6 py-2.5">
        <div className="mx-auto max-w-6xl flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/40 bg-blue-950/80 hover:bg-yellow-400 hover:text-blue-950 px-3 py-1.5 text-xs font-black text-blue-100 transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Retour au Jeu</span>
            </Link>

            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-purple-400 to-indigo-400 px-2.5 py-1 text-xs font-black uppercase text-slate-950 shadow">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Admin 7TER</span>
              </span>
              <h1 className="text-sm sm:text-lg font-black uppercase tracking-tight text-white">
                Calibrage Difficulté, Notes &amp; Base « Déjà Répondu »
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportReport}
              className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-400/50 bg-emerald-500/15 hover:bg-emerald-400 hover:text-slate-950 px-3 py-1.5 text-xs font-black text-emerald-300 transition"
              title="Exporter toutes les notes et statistiques en JSON"
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exporter JSON</span>
            </button>

            <button
              type="button"
              onClick={handleLockSession}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-400/40 bg-rose-950/60 hover:bg-rose-500 hover:text-white px-2.5 py-1.5 text-xs font-extrabold text-rose-200 transition"
              title="Verrouiller l'espace Admin"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Verrouiller</span>
            </button>
          </div>
        </div>

        {/* BARRE DES 3 ONGLETS DE L'ESPACE ADMIN */}
        <div className="mx-auto max-w-6xl mt-2.5 grid grid-cols-3 gap-1.5 rounded-xl bg-[#040b1e] p-1 border border-blue-500/35">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs sm:text-sm font-black transition ${
              activeTab === 'overview'
                ? 'bg-gradient-to-r from-yellow-300 to-amber-500 text-blue-950 shadow'
                : 'text-blue-200 hover:text-white'
            }`}
          >
            <BarChart3 className="h-4 w-4 shrink-0" />
            <span>1. Statistiques Globales</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('evaluate')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs sm:text-sm font-black transition ${
              activeTab === 'evaluate'
                ? 'bg-gradient-to-r from-sky-300 to-blue-500 text-slate-950 shadow'
                : 'text-sky-300 hover:text-white'
            }`}
          >
            <MessageSquare className="h-4 w-4 shrink-0" />
            <span>
              2. Évaluer &amp; Notes ({globalSummary.withNotesCount} notes)
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('already_answered')}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg py-2 px-2 text-xs sm:text-sm font-black transition ${
              activeTab === 'already_answered'
                ? 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white shadow'
                : 'text-purple-300 hover:text-white'
            }`}
          >
            <Archive className="h-4 w-4 shrink-0" />
            <span>
              3. Base « Déjà Répondu » (
              {globalSummary.inAlreadyAnsweredPoolCount})
            </span>
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 p-3 sm:p-6 space-y-5">
        {/* CARTES KPI COMMUNES EN HAUT */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          <div className="rounded-2xl border border-blue-500/40 bg-[#091942]/90 p-3">
            <span className="text-[10px] font-black uppercase text-blue-300">
              Total Questions
            </span>
            <div className="text-xl sm:text-2xl font-black text-white mt-0.5">
              {globalSummary.totalQuestions}
            </div>
            <span className="text-[11px] text-emerald-300 font-bold">
              {globalSummary.freshPoolCount} fraîches prioritaires
            </span>
          </div>

          <div className="rounded-2xl border border-purple-400/50 bg-purple-950/35 p-3">
            <span className="text-[10px] font-black uppercase text-purple-300">
              Base « Déjà Répondu »
            </span>
            <div className="text-xl sm:text-2xl font-black text-purple-200 mt-0.5">
              {globalSummary.inAlreadyAnsweredPoolCount}
            </div>
            <span className="text-[11px] text-purple-300/80 font-bold">
              Répondues &ge; {settings.autoArchiveThreshold}x (moins proposées)
            </span>
          </div>

          <div className="rounded-2xl border border-sky-400/40 bg-[#091942]/90 p-3">
            <span className="text-[10px] font-black uppercase text-sky-300">
              Questions Testées
            </span>
            <div className="text-xl sm:text-2xl font-black text-sky-200 mt-0.5">
              {globalSummary.answeredAtLeastOnce}
            </div>
            <span className="text-[11px] text-blue-200/80 font-bold">
              {globalSummary.totalAnswersRecorded} réponses cumulées
            </span>
          </div>

          <div className="rounded-2xl border border-emerald-400/40 bg-[#091942]/90 p-3">
            <span className="text-[10px] font-black uppercase text-emerald-300">
              Taux de Réussite Réel
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-300 mt-0.5">
              {globalSummary.globalSuccessRate !== null
                ? `${globalSummary.globalSuccessRate}%`
                : '—'}
            </div>
            <span className="text-[11px] text-blue-200/80 font-bold">
              {globalSummary.totalCorrectRecorded} bonnes /{' '}
              {globalSummary.totalAnswersRecorded} rép.
            </span>
          </div>

          <div className="rounded-2xl border border-amber-400/40 bg-[#091942]/90 p-3">
            <span className="text-[10px] font-black uppercase text-amber-300">
              À Recalibrer (Auto)
            </span>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-0.5">
              {globalSummary.tooEasyCount + globalSummary.tooHardCount}
            </div>
            <span className="text-[11px] text-amber-200/80 font-bold">
              {globalSummary.tooEasyCount} trop faciles ·{' '}
              {globalSummary.tooHardCount} trop dures
            </span>
          </div>

          <div className="rounded-2xl border border-yellow-400/40 bg-[#091942]/90 p-3">
            <span className="text-[10px] font-black uppercase text-yellow-300">
              Notes Admin
            </span>
            <div className="text-xl sm:text-2xl font-black text-yellow-300 mt-0.5">
              {globalSummary.withNotesCount}
            </div>
            <span className="text-[11px] text-blue-200/80 font-bold">
              Questions annotées
            </span>
          </div>
        </section>

        {/* ====================================================================
            ONGLET 1 : VUE D'ENSEMBLE & STATISTIQUES PAR NIVEAU ET THÈME
           ==================================================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {/* Réglage du seuil de bascule dans la base "Déjà répondu" */}
            <section className="rounded-2xl border border-purple-400/45 bg-gradient-to-r from-purple-950/45 via-[#091942]/95 to-[#091942]/95 p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2 text-purple-300 font-black text-xs sm:text-sm uppercase">
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>
                    Règle d&apos;alimentation automatique de la base « Déjà
                    Répondu »
                  </span>
                </div>
                <p className="text-xs text-blue-100/85 leading-relaxed">
                  Toute question répondue au moins{' '}
                  <strong className="text-yellow-300">
                    {settings.autoArchiveThreshold} fois
                  </strong>{' '}
                  est automatiquement rangée dans la base{' '}
                  <strong className="text-purple-300">« Déjà répondu »</strong>.
                  Elle reste dans le jeu mais passe après les questions fraîches
                  (et a un poids réduit de 85% lors des tirages aléatoires).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-yellow-300">
                  Seuil de réponses :
                </span>
                {[2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleUpdateThreshold(val)}
                    className={`rounded-xl px-3 py-1.5 text-xs font-black border transition ${
                      settings.autoArchiveThreshold === val
                        ? 'bg-yellow-400 text-blue-950 border-white shadow'
                        : 'bg-[#040b1e] text-blue-200 border-blue-500/40 hover:border-yellow-400'
                    }`}
                  >
                    {val}x
                  </button>
                ))}
              </div>
            </section>

            {/* Tableau de calibrage par Niveau de Difficulté (1 -> 10) */}
            <section className="rounded-2xl border border-blue-500/40 bg-[#091942]/90 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm sm:text-base font-black uppercase text-yellow-300">
                    📊 Statistiques &amp; Difficulté Réelle par Niveau (1 à 10)
                  </h2>
                  <p className="text-xs text-blue-200/75">
                    Cliquez sur un niveau pour inspecter ou annoter ses
                    questions.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-blue-500/30 text-blue-300 uppercase text-[10px]">
                      <th className="py-2 px-2.5">Niveau</th>
                      <th className="py-2 px-2.5">Total</th>
                      <th className="py-2 px-2.5">Fraîches</th>
                      <th className="py-2 px-2.5 text-purple-300">
                        Base Déjà Répondu
                      </th>
                      <th className="py-2 px-2.5">Réponses</th>
                      <th className="py-2 px-2.5">Réussite Observée</th>
                      <th className="py-2 px-2.5">Notes Admin</th>
                      <th className="py-2 px-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-blue-500/20">
                    {globalSummary.byLevel.map((row) => {
                      const info = DIFFICULTY_LEVELS.find(
                        (d) => d.level === row.level
                      );
                      return (
                        <tr
                          key={row.level}
                          className="hover:bg-blue-900/30 transition"
                        >
                          <td className="py-2.5 px-2.5 font-black text-white">
                            <span className="inline-flex items-center gap-1.5">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-yellow-400 text-blue-950 font-black">
                                {row.level}
                              </span>
                              <span>{info?.title}</span>
                            </span>
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-blue-100">
                            {row.total} q.
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-emerald-300">
                            {row.freshCount}
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-purple-300">
                            {row.alreadyAnsweredCount}
                          </td>
                          <td className="py-2.5 px-2.5 font-mono font-bold text-sky-300">
                            {row.totalPlays}x
                          </td>
                          <td className="py-2.5 px-2.5">
                            {row.avgSuccessRate !== null ? (
                              <div className="flex items-center gap-2 max-w-[140px]">
                                <div className="h-2 flex-1 rounded-full bg-blue-950 overflow-hidden">
                                  <div
                                    className={`h-full ${
                                      row.avgSuccessRate >= 70
                                        ? 'bg-emerald-400'
                                        : row.avgSuccessRate >= 40
                                        ? 'bg-yellow-400'
                                        : 'bg-rose-500'
                                    }`}
                                    style={{ width: `${row.avgSuccessRate}%` }}
                                  />
                                </div>
                                <span className="font-mono font-black text-white">
                                  {row.avgSuccessRate}%
                                </span>
                              </div>
                            ) : (
                              <span className="text-blue-400/50">
                                Non joué
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-2.5 font-bold text-yellow-300">
                            {row.notesCount > 0 ? `📝 ${row.notesCount}` : '—'}
                          </td>
                          <td className="py-2.5 px-2.5 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedLevel(row.level);
                                setActiveTab('evaluate');
                              }}
                              className="rounded-lg border border-yellow-400/50 bg-yellow-400/15 hover:bg-yellow-400 hover:text-blue-950 px-2.5 py-1 text-[11px] font-black text-yellow-300 transition"
                            >
                              Évaluer Niv. {row.level}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Statistiques par Thème */}
            <section className="rounded-2xl border border-blue-500/40 bg-[#091942]/90 p-4 space-y-3">
              <h2 className="text-sm sm:text-base font-black uppercase text-yellow-300">
                🏷️ Répartition &amp; Performance par Thème
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {globalSummary.byTheme.map((th) => {
                  const rate =
                    th.totalPlays > 0
                      ? Math.round((th.totalCorrect / th.totalPlays) * 100)
                      : null;
                  return (
                    <button
                      key={th.theme}
                      type="button"
                      onClick={() => {
                        setSelectedTheme(th.theme);
                        setSelectedLevel('ALL');
                        setActiveTab('evaluate');
                      }}
                      className="flex flex-col justify-between rounded-xl border border-blue-400/30 bg-[#040b1e]/85 hover:border-yellow-400 p-3 text-left transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-black text-xs sm:text-sm text-white truncate">
                          {th.theme}
                        </span>
                        <span className="rounded-full bg-blue-950 border border-blue-500/40 px-2 py-0.5 text-[10px] font-black text-yellow-300 shrink-0">
                          {th.total} q.
                        </span>
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-blue-200/80">
                        <span>
                          Jouées :{' '}
                          <strong className="text-white">{th.answered}</strong>{' '}
                          ({th.totalPlays} rép.)
                        </span>
                        <span className="text-purple-300 font-bold">
                          Déjà rép. : {th.alreadyAnsweredPool}
                        </span>
                        <span className="font-mono font-black text-emerald-300">
                          {rate !== null ? `${rate}%` : '—'}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}

        {/* ====================================================================
            ONGLETS 2 & 3 : ÉVALUATION DE LA DIFFICULTÉ, NOTES & BASE "DÉJÀ RÉPONDU"
           ==================================================================== */}
        {(activeTab === 'evaluate' || activeTab === 'already_answered') && (
          <div className="space-y-4">
            {activeTab === 'already_answered' && (
              <div className="rounded-2xl border-2 border-purple-400/60 bg-gradient-to-r from-purple-950/60 via-[#091942] to-[#050d26] p-4 flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black uppercase text-purple-300">
                    <Archive className="h-4 w-4" />
                    <span>
                      Base « Déjà Répondu » (
                      {globalSummary.inAlreadyAnsweredPoolCount} questions)
                    </span>
                  </div>
                  <p className="text-xs text-blue-100/85 max-w-2xl">
                    Ces questions ont été répondues plusieurs fois (&ge;{' '}
                    {settings.autoArchiveThreshold} fois) ou ont été placées ici
                    manuellement. Elles sont automatiquement{' '}
                    <strong className="text-yellow-300">
                      beaucoup moins proposées
                    </strong>{' '}
                    pendant les soirées pour privilégier les questions inédites.
                  </p>
                </div>

                {globalSummary.inAlreadyAnsweredPoolCount > 0 && (
                  <button
                    type="button"
                    onClick={handleRestoreAllAlreadyAnswered}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-yellow-400/60 bg-yellow-400/15 hover:bg-yellow-400 hover:text-blue-950 px-3 py-2 text-xs font-black text-yellow-300 transition"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Remettre toute la base en « Fraîches »</span>
                  </button>
                )}
              </div>
            )}

            {/* BARRE DE FILTRES (Niveau, Thème, Diagnostic Difficulté, Recherche texte/note) */}
            <section className="rounded-2xl border border-blue-500/40 bg-[#091942]/95 p-3.5 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {/* Recherche */}
                <div className="relative">
                  <Search className="h-4 w-4 text-blue-300/60 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Chercher un énoncé, une note, une réponse..."
                    className="w-full rounded-xl border border-blue-400/40 focus:border-yellow-400 bg-[#040b1e] pl-9 pr-3 py-2 text-xs font-bold text-white placeholder-blue-300/40 outline-none"
                  />
                </div>

                {/* Filtre Niveau */}
                <select
                  value={selectedLevel}
                  onChange={(e) =>
                    setSelectedLevel(
                      e.target.value === 'ALL'
                        ? 'ALL'
                        : Number.parseInt(e.target.value, 10)
                    )
                  }
                  aria-label="Filtrer par niveau de difficulté"
                  className="rounded-xl border border-blue-400/40 bg-[#040b1e] px-3 py-2 text-xs font-bold text-yellow-300 outline-none focus:border-yellow-400"
                >
                  <option value="ALL">Tous les niveaux (1 à 10)</option>
                  {DIFFICULTY_LEVELS.map((d) => (
                    <option key={d.level} value={d.level}>
                      Niveau {d.level} — {d.title}
                    </option>
                  ))}
                </select>

                {/* Filtre Thème */}
                <select
                  value={selectedTheme}
                  onChange={(e) => setSelectedTheme(e.target.value)}
                  aria-label="Filtrer par thème"
                  className="rounded-xl border border-blue-400/40 bg-[#040b1e] px-3 py-2 text-xs font-bold text-sky-300 outline-none focus:border-yellow-400"
                >
                  <option value="ALL">Tous les thèmes</option>
                  {allThemes.map((th) => (
                    <option key={th} value={th}>
                      {th}
                    </option>
                  ))}
                </select>

                {/* Filtre Statut / Diagnostic */}
                <select
                  value={statusFilter}
                  onChange={(e) =>
                    setStatusFilter(e.target.value as StatusFilter)
                  }
                  aria-label="Filtrer par statut ou diagnostic de difficulté"
                  className="rounded-xl border border-blue-400/40 bg-[#040b1e] px-3 py-2 text-xs font-bold text-purple-200 outline-none focus:border-yellow-400"
                >
                  <option value="ALL">Toutes les questions</option>
                  <option value="ANSWERED">
                    Déjà jouées au moins 1 fois ({globalSummary.answeredAtLeastOnce})
                  </option>
                  <option value="ALREADY_ANSWERED_POOL">
                    Dans la base « Déjà répondu » (
                    {globalSummary.inAlreadyAnsweredPoolCount})
                  </option>
                  <option value="FRESH">
                    Questions fraîches uniquement ({globalSummary.freshPoolCount})
                  </option>
                  <option value="WITH_NOTES">
                    Avec notes Admin ({globalSummary.withNotesCount})
                  </option>
                  <option value="TOO_EASY">
                    Diagnostic : Trop faciles ({globalSummary.tooEasyCount})
                  </option>
                  <option value="TOO_HARD">
                    Diagnostic : Trop dures ({globalSummary.tooHardCount})
                  </option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-blue-200/80 pt-1 border-t border-blue-500/20">
                <span>
                  Affichage de{' '}
                  <strong className="text-yellow-300">
                    {filteredQuestions.length}
                  </strong>{' '}
                  question{filteredQuestions.length > 1 ? 's' : ''}
                </span>
                {(selectedLevel !== 'ALL' ||
                  selectedTheme !== 'ALL' ||
                  statusFilter !== 'ALL' ||
                  searchQuery.trim() !== '') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedLevel('ALL');
                      setSelectedTheme('ALL');
                      setStatusFilter('ALL');
                      setSearchQuery('');
                    }}
                    className="text-yellow-300 hover:underline font-bold"
                  >
                    Réinitialiser les filtres
                  </button>
                )}
              </div>
            </section>

            {/* LISTE DES QUESTIONS AVEC ÉVALUATION DE DIFFICULTÉ, PRISE DE NOTES & GESTION BASE "DÉJÀ RÉPONDU" */}
            {filteredQuestions.length === 0 ? (
              <div className="rounded-2xl border border-blue-500/35 bg-[#091942]/80 p-8 text-center space-y-2">
                <p className="text-sm font-black text-yellow-300">
                  Aucune question ne correspond à ces critères.
                </p>
                <p className="text-xs text-blue-200/75">
                  Modifiez les filtres ou répondez à quelques questions en
                  partie pour alimenter automatiquement les statistiques et la
                  base « Déjà répondu ».
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredQuestions.slice(0, 80).map((item) => {
                  const { question, effectiveDifficulty, analytics, evaluation } =
                    item;
                  const noteValue =
                    draftNotes[question.id] !== undefined
                      ? draftNotes[question.id]
                      : analytics.notes;
                  const isSaved = savedFeedbackId === question.id;
                  const isExpanded = expandedAnswerId === question.id;

                  return (
                    <article
                      key={question.id}
                      className={`rounded-2xl border-2 p-3.5 sm:p-4 transition space-y-3 ${
                        analytics.inAlreadyAnsweredPool
                          ? 'border-purple-400/55 bg-gradient-to-b from-purple-950/30 to-[#071436]/95'
                          : 'border-blue-500/40 bg-[#091942]/95'
                      }`}
                    >
                      {/* Ligne 1 : Badges Niveau, Thème, Statut "Déjà répondu", et Diagnostic de difficulté */}
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="inline-flex items-center gap-1 rounded-lg bg-yellow-400 px-2.5 py-0.5 text-xs font-black text-blue-950">
                            Niv. {effectiveDifficulty}/10
                            {analytics.difficultyOverride !== undefined &&
                              analytics.difficultyOverride !==
                                question.difficulty && (
                                <span className="text-[10px] opacity-75">
                                  (orig. {question.difficulty})
                                </span>
                              )}
                          </span>

                          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-950 border border-blue-400/35 px-2.5 py-0.5 text-[11px] font-bold text-sky-300">
                            <Tag className="h-3 w-3" />
                            {question.theme}
                          </span>

                          {analytics.inAlreadyAnsweredPool ? (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-purple-500/30 border border-purple-400/60 px-2.5 py-0.5 text-[11px] font-black text-purple-200">
                              <Archive className="h-3 w-3" />
                              Base « Déjà répondu » (Moins proposée)
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-400/40 px-2 py-0.5 text-[10px] font-extrabold text-emerald-300">
                              <Sparkles className="h-3 w-3" />
                              Question Fraîche
                            </span>
                          )}

                          {/* Diagnostic automatique de difficulté réelle */}
                          {evaluation.diagnostic === 'too_easy' && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-cyan-500/20 border border-cyan-400/50 px-2 py-0.5 text-[11px] font-black text-cyan-200">
                              <TrendingDown className="h-3 w-3" />
                              {evaluation.label}
                            </span>
                          )}
                          {evaluation.diagnostic === 'too_hard' && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-rose-500/25 border border-rose-400/60 px-2 py-0.5 text-[11px] font-black text-rose-200">
                              <TrendingUp className="h-3 w-3" />
                              {evaluation.label}
                            </span>
                          )}
                          {evaluation.diagnostic === 'calibrated' && (
                            <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/20 border border-emerald-400/50 px-2 py-0.5 text-[11px] font-black text-emerald-300">
                              <CheckCircle2 className="h-3 w-3" />
                              Bien calibrée
                            </span>
                          )}
                        </div>

                        {/* Compteurs Réponses / Bonne / Mauvaise */}
                        <div className="flex items-center gap-2 text-xs">
                          <span className="rounded-lg bg-[#040b1e] border border-blue-500/30 px-2.5 py-1 font-mono font-bold text-blue-200">
                            Répondue :{' '}
                            <strong className="text-yellow-300">
                              {analytics.timesAnswered}x
                            </strong>
                          </span>
                          <span className="rounded-lg bg-emerald-950/60 border border-emerald-400/35 px-2 py-1 font-mono font-bold text-emerald-300">
                            ✓ {analytics.timesCorrect}
                          </span>
                          <span className="rounded-lg bg-rose-950/60 border border-rose-400/35 px-2 py-1 font-mono font-bold text-rose-300">
                            ✗ {analytics.timesWrong}
                          </span>
                          {evaluation.successRate !== null && (
                            <span className="rounded-lg bg-blue-950 border border-yellow-400/40 px-2 py-1 font-mono font-black text-yellow-300">
                              {evaluation.successRate}% réussite
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Ligne 2 : Énoncé de la question + bouton Voir les 4 options / réponse */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-[#040b1e]/90 border border-blue-500/25 px-3.5 py-2.5">
                        <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                          {question.question}
                        </h3>
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedAnswerId(
                              isExpanded ? null : question.id
                            )
                          }
                          className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold text-yellow-300 hover:underline"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>
                            {isExpanded
                              ? 'Masquer la réponse'
                              : `Réponse : ${question.options[question.correct_index]}`}
                          </span>
                        </button>
                      </div>

                      {isExpanded && (
                        <div className="rounded-xl border border-blue-400/30 bg-[#05102e] p-3 space-y-2 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {question.options.map((opt, idx) => {
                              const isCorrect = idx === question.correct_index;
                              return (
                                <div
                                  key={idx}
                                  className={`rounded-lg px-2.5 py-1.5 font-bold flex items-center gap-2 ${
                                    isCorrect
                                      ? 'bg-emerald-500/25 border border-emerald-400 text-emerald-200'
                                      : 'bg-blue-950/60 text-blue-200/75'
                                  }`}
                                >
                                  <span className="font-black">
                                    {OPTION_LETTERS[idx]}.
                                  </span>
                                  <span>{opt}</span>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-blue-200/85 italic">
                            💡 {question.explanation}
                          </p>
                        </div>
                      )}

                      {/* Ligne 3 : Zone de Notes Admin + Calibrage de la difficulté (1 à 10) + Bascule Base "Déjà répondu" */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center pt-1">
                        {/* Champ de prise de note sur la question */}
                        <div className="lg:col-span-6 flex items-center gap-1.5">
                          <input
                            type="text"
                            value={noteValue}
                            onChange={(e) =>
                              setDraftNotes((prev) => ({
                                ...prev,
                                [question.id]: e.target.value,
                              }))
                            }
                            placeholder="📝 Note Admin (ex: Trop facile pour un niv 7, reformuler l'indice, déjà tombée samedi...)"
                            className="flex-1 rounded-xl border border-blue-400/40 focus:border-yellow-400 bg-[#040b1e] px-3 py-2 text-xs font-bold text-white placeholder-blue-300/40 outline-none"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveNoteAndDifficulty(question, {
                                notes: noteValue,
                              })
                            }
                            className="shrink-0 inline-flex items-center gap-1 rounded-xl bg-yellow-400 hover:bg-yellow-300 px-3 py-2 text-xs font-black text-blue-950 shadow transition active:scale-95"
                          >
                            {isSaved ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Noté !</span>
                              </>
                            ) : (
                              <span>Enregistrer note</span>
                            )}
                          </button>
                        </div>

                        {/* Ajuster le niveau de difficulté (1 à 10) + Boutons test rapide (+1 Bonne / +1 Ratée) + Bascule Base Déjà Répondu */}
                        <div className="lg:col-span-6 flex flex-wrap items-center justify-end gap-1.5">
                          {/* Sélecteur de recalibrage de niveau */}
                          <div className="inline-flex items-center gap-1 rounded-xl border border-blue-400/35 bg-[#040b1e] px-2 py-1">
                            <span className="text-[10px] font-extrabold text-blue-300">
                              Difficulté :
                            </span>
                            <select
                              value={effectiveDifficulty}
                              onChange={(e) =>
                                handleSaveNoteAndDifficulty(question, {
                                  difficultyOverride: Number.parseInt(
                                    e.target.value,
                                    10
                                  ),
                                })
                              }
                              aria-label="Modifier le niveau de difficulté"
                              className="bg-transparent text-xs font-black text-yellow-300 outline-none cursor-pointer"
                            >
                              {Array.from({ length: 10 }, (_, i) => i + 1).map(
                                (lvl) => (
                                  <option
                                    key={lvl}
                                    value={lvl}
                                    className="bg-[#050d26] text-white"
                                  >
                                    Niv. {lvl}
                                  </option>
                                )
                              )}
                            </select>
                          </div>

                          {/* Enregistrer manuellement une bonne ou mauvaise réponse en soirée */}
                          <button
                            type="button"
                            onClick={() => handleSimulateOutcome(question, true)}
                            className="inline-flex items-center gap-1 rounded-xl border border-emerald-400/40 bg-emerald-500/15 hover:bg-emerald-400 hover:text-slate-950 px-2.5 py-1.5 text-[11px] font-black text-emerald-300 transition"
                            title="Noter +1 bonne réponse sur cette question"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Bonne</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleSimulateOutcome(question, false)
                            }
                            className="inline-flex items-center gap-1 rounded-xl border border-rose-400/40 bg-rose-500/15 hover:bg-rose-500 hover:text-white px-2.5 py-1.5 text-[11px] font-black text-rose-300 transition"
                            title="Noter +1 mauvaise réponse sur cette question"
                          >
                            <Plus className="h-3 w-3" />
                            <span>Ratée</span>
                          </button>

                          {/* Basculer manuellement dans / hors de la base "Déjà répondu" */}
                          <button
                            type="button"
                            onClick={() =>
                              handleSaveNoteAndDifficulty(question, {
                                inAlreadyAnsweredPool:
                                  !analytics.inAlreadyAnsweredPool,
                              })
                            }
                            className={`inline-flex items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[11px] font-black transition ${
                              analytics.inAlreadyAnsweredPool
                                ? 'border-emerald-400/50 bg-emerald-500/20 text-emerald-200 hover:bg-emerald-400 hover:text-slate-950'
                                : 'border-purple-400/50 bg-purple-500/20 text-purple-200 hover:bg-purple-400 hover:text-slate-950'
                            }`}
                            title={
                              analytics.inAlreadyAnsweredPool
                                ? 'Remettre dans les questions fraîches prioritaires'
                                : 'Mettre dans la base Déjà répondu (moins proposée)'
                            }
                          >
                            <Archive className="h-3 w-3" />
                            <span>
                              {analytics.inAlreadyAnsweredPool
                                ? 'Remettre Fraîche'
                                : 'Classer Déjà répondu'}
                            </span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
