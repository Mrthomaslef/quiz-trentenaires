'use client';

import React, { useState, useEffect, useMemo } from 'react';
import type { QuizQuestionRecord } from '@/lib/supabase';
import type { PlayerScore, CoopStats } from './Scoreboard';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award,
  Lightbulb,
  Tag,
  Zap,
  Timer,
  Eye,
  Flame,
  RotateCcw,
  Trophy,
  Sparkles,
  Grid,
  Split,
} from 'lucide-react';
import {
  playCorrectSound,
  playWrongSound,
  playPointSound,
  playTickSound,
  playJokerSound,
} from '@/lib/sound';

export type AnswerFormula = 'duo' | 'carre' | 'cash';

interface QuestionCardProps {
  question: QuizQuestionRecord | null;
  onNextQuestion: () => void;
  onAwardPoint: (teamId: string, delta: number) => void;
  teams: PlayerScore[];
  questionNumber: number;
  remainingInLevel: number;
  totalInLevel: number;
  doublePoints: boolean;
  timerEnabled: boolean;
  duoCarreCashEnabled?: boolean;
  soundEnabled: boolean;
  isCoopMode?: boolean;
  coopStats?: CoopStats;
  onCoopAnswer?: (isCorrect: boolean) => void;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

const CONFETTI_PIECES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 4.5 + 3) % 96}%`,
  delay: `${(i % 5) * 0.05}s`,
  color: i % 2 === 0 ? '#FACC15' : i % 3 === 0 ? '#38BDF8' : '#FFFFFF',
}));

function normalizeAnswerText(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\b(le|la|les|un|une|des|du|de|l|d)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export default function QuestionCard({
  question,
  onNextQuestion,
  onAwardPoint,
  teams,
  questionNumber,
  remainingInLevel,
  totalInLevel,
  doublePoints,
  timerEnabled,
  duoCarreCashEnabled = false,
  soundEnabled,
  isCoopMode = false,
  coopStats,
  onCoopAnswer,
}: QuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [awardedTeams, setAwardedTeams] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [shakeCard, setShakeCard] = useState<boolean>(false);

  // États spécifiques au mode Duo / Carré / Cash
  const [selectedFormula, setSelectedFormula] =
    useState<AnswerFormula | null>(null);
  const [duoIndices, setDuoIndices] = useState<number[]>([]);
  const [cashGuess, setCashGuess] = useState<string>('');
  const [cashRevealedWaitValidation, setCashRevealedWaitValidation] =
    useState<boolean>(false);

  const multiplier = doublePoints ? 2 : 1;
  const baseFormulaPoints = useMemo(() => {
    if (!duoCarreCashEnabled || isCoopMode) return 1;
    if (selectedFormula === 'cash') return 5;
    if (selectedFormula === 'carre') return 3;
    if (selectedFormula === 'duo') return 1;
    return 1;
  }, [duoCarreCashEnabled, isCoopMode, selectedFormula]);

  const pointValue = baseFormulaPoints * multiplier;

  useEffect(() => {
    setSelectedIndex(null);
    setAwardedTeams({});
    setTimeLeft(20);
    setShowConfetti(false);
    setShakeCard(false);
    setSelectedFormula(null);
    setDuoIndices([]);
    setCashGuess('');
    setCashRevealedWaitValidation(false);
  }, [question?.id]);

  // En mode Duo/Carré/Cash, le chrono attend que le joueur ait choisi sa formule (Duo, Carré ou Cash)
  const waitingForFormulaChoice =
    duoCarreCashEnabled && !isCoopMode && selectedFormula === null;

  useEffect(() => {
    if (
      !timerEnabled ||
      selectedIndex !== null ||
      !question ||
      waitingForFormulaChoice
    ) {
      return;
    }
    if (timeLeft <= 0) {
      setSelectedIndex(-1);
      setShakeCard(true);
      playWrongSound(soundEnabled);
      if (isCoopMode && onCoopAnswer) {
        onCoopAnswer(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      const next = timeLeft - 1;
      setTimeLeft(next);
      if (next <= 5 && next > 0) {
        playTickSound(soundEnabled, true);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [
    timerEnabled,
    timeLeft,
    selectedIndex,
    question,
    soundEnabled,
    isCoopMode,
    onCoopAnswer,
    waitingForFormulaChoice,
  ]);

  if (!question) {
    return (
      <div className="flex-1 flex items-center justify-center rounded-2xl border border-blue-500/40 bg-[#091942]/90 p-4 text-center">
        <p className="text-yellow-300 font-bold text-sm">
          Préparation du plateau du 7TER…
        </p>
      </div>
    );
  }

  const isRevealed = selectedIndex !== null;

  const handleSelectFormula = (formula: AnswerFormula) => {
    playJokerSound(soundEnabled);
    setSelectedFormula(formula);

    if (formula === 'duo') {
      const wrongIndices = [0, 1, 2, 3].filter(
        (i) => i !== question.correct_index
      );
      const randomWrong =
        wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
      setDuoIndices([question.correct_index, randomWrong].sort((a, b) => a - b));
    }
  };

  const handleOptionClick = (idx: number) => {
    if (isRevealed) return;
    setSelectedIndex(idx);

    const correct = idx === question.correct_index;
    if (correct) {
      setShowConfetti(true);
      playCorrectSound(soundEnabled);
    } else {
      setShakeCard(true);
      playWrongSound(soundEnabled);
    }

    if (isCoopMode && onCoopAnswer) {
      onCoopAnswer(correct);
    }
  };

  const handleSubmitCashForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (isRevealed) return;
    const trimmed = cashGuess.trim();
    if (!trimmed) {
      // Si champ vide, afficher la réponse et laisser valider Oui / Non à l'oral
      setCashRevealedWaitValidation(true);
      return;
    }

    const normUser = normalizeAnswerText(trimmed);
    const normCorrect = normalizeAnswerText(
      question.options[question.correct_index]
    );

    const isMatch =
      normUser.length >= 2 &&
      (normCorrect === normUser ||
        normCorrect.includes(normUser) ||
        normUser.includes(normCorrect));

    if (isMatch) {
      setSelectedIndex(question.correct_index);
      setShowConfetti(true);
      playCorrectSound(soundEnabled);
    } else {
      // Laisse quand même la possibilité de valider manuellement si l'orthographe était proche
      setCashRevealedWaitValidation(true);
    }
  };

  const handleResolveCashOral = (isCorrect: boolean) => {
    setCashRevealedWaitValidation(false);
    if (isCorrect) {
      setSelectedIndex(question.correct_index);
      setShowConfetti(true);
      playCorrectSound(soundEnabled);
    } else {
      const firstWrong = [0, 1, 2, 3].find((i) => i !== question.correct_index) ?? 0;
      setSelectedIndex(firstWrong);
      setShakeCard(true);
      playWrongSound(soundEnabled);
    }
  };

  const handleQuickAward = (teamId: string) => {
    if (awardedTeams[teamId]) {
      onAwardPoint(teamId, -pointValue);
      setAwardedTeams((prev) => ({ ...prev, [teamId]: false }));
    } else {
      onAwardPoint(teamId, pointValue);
      setAwardedTeams((prev) => ({ ...prev, [teamId]: true }));
      playPointSound(soundEnabled);
    }
  };

  return (
    <section
      key={question.id}
      className={`relative flex-1 min-h-0 flex flex-col gap-2 overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-[#0b1d48]/95 via-[#081538]/95 to-[#050d26]/95 p-3 sm:p-4 shadow-2xl backdrop-blur-md animate-fadeIn ${
        isCoopMode && coopStats?.status === 'failed'
          ? 'border-rose-500 shadow-rose-500/20'
          : isCoopMode && coopStats?.status === 'victory'
          ? 'border-emerald-400 shadow-emerald-400/25'
          : doublePoints
          ? 'border-yellow-400 shadow-yellow-400/15'
          : 'border-blue-500/45 shadow-blue-950/70'
      } ${shakeCard ? 'animate-shake' : ''}`}
    >
      {/* Pluie de confettis Jaune & Bleu sur bonne réponse */}
      {showConfetti && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden z-20">
          {CONFETTI_PIECES.map((piece) => (
            <span
              key={piece.id}
              style={{
                left: piece.left,
                animationDelay: piece.delay,
                backgroundColor: piece.color,
              }}
              className="absolute top-0 h-2.5 w-2 rounded-sm animate-confetti"
            />
          ))}
        </div>
      )}

      {/* 1. PARTIE HAUTE (shrink-0) : Métadonnées + Chrono + Énoncé */}
      <div className="shrink-0 space-y-2">
        {timerEnabled && !waitingForFormulaChoice && (
          <div className="flex items-center gap-2">
            <Timer className="h-3.5 w-3.5 text-yellow-400 shrink-0" />
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-blue-950 border border-blue-500/30">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 5
                    ? 'bg-rose-500'
                    : timeLeft <= 10
                    ? 'bg-amber-400'
                    : 'bg-yellow-400'
                }`}
                style={{ width: `${(timeLeft / 20) * 100}%` }}
              />
            </div>
            <span
              className={`font-mono text-xs font-black ${
                timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-yellow-300'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
        )}

        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {isCoopMode && (
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 text-blue-950 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide shadow">
                <Flame className="h-3 w-3 fill-blue-950" />
                Palier {question.difficulty} / 10
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 text-blue-950 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wide">
              <Tag className="h-3 w-3 fill-blue-950" />
              {question.theme}
            </span>
            {!isCoopMode && duoCarreCashEnabled && selectedFormula && (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-black uppercase shadow ${
                  selectedFormula === 'cash'
                    ? 'bg-gradient-to-r from-amber-300 to-yellow-400 text-slate-950'
                    : selectedFormula === 'carre'
                    ? 'bg-sky-400 text-slate-950'
                    : 'bg-emerald-400 text-slate-950'
                }`}
              >
                {selectedFormula === 'cash'
                  ? `💰 CASH (+${5 * multiplier} PTS)`
                  : selectedFormula === 'carre'
                  ? `🟦 CARRÉ (+${3 * multiplier} PTS)`
                  : `🎭 DUO (+${1 * multiplier} PT${multiplier > 1 ? 'S' : ''})`}
              </span>
            )}
            {!isCoopMode && doublePoints && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2.5 py-0.5 text-[11px] font-black text-blue-950 animate-pulse">
                <Zap className="h-3 w-3 fill-blue-950" />
                x2 (+{pointValue} PTS)
              </span>
            )}
          </div>

          <span className="text-[11px] font-bold text-blue-200/75">
            #{questionNumber} · {remainingInLevel}/{totalInLevel}
          </span>
        </div>

        {/* Énoncé bien mis en valeur */}
        <div className="rounded-xl border border-blue-400/30 bg-[#040b1e]/90 px-3.5 py-2.5 sm:px-5 sm:py-3.5 shadow-inner">
          <h3 className="text-[15px] sm:text-lg lg:text-xl font-black text-white leading-snug">
            {question.question}
          </h3>
        </div>
      </div>

      {/* 2. PARTIE CENTRALE : CHOIX DUO/CARRÉ/CASH OU RÉPONSES */}
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
        <div className="my-auto flex flex-col gap-2.5 py-1">
          {/* ÉTAPE 1 (si Duo/Carré/Cash est coché) : Choisir sa formule avant de voir les propositions */}
          {waitingForFormulaChoice && !isRevealed ? (
            <div className="space-y-3 py-1 animate-fadeIn">
              <p className="text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider text-yellow-300">
                🎯 Choisissez votre formule avant de découvrir les réponses :
              </p>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
                {/* BOUTON DUO (1 pt) */}
                <button
                  type="button"
                  onClick={() => handleSelectFormula('duo')}
                  className="group flex flex-col items-center justify-between gap-2 rounded-2xl border-2 border-emerald-400/60 bg-gradient-to-b from-emerald-500/20 to-[#05102e] hover:from-emerald-400 hover:to-teal-500 hover:text-slate-950 p-3 sm:p-4 text-center transition-all active:scale-95 shadow-lg"
                >
                  <span className="rounded-full bg-emerald-400 px-2.5 py-0.5 text-[11px] sm:text-xs font-black uppercase text-slate-950 shadow">
                    +{1 * multiplier} PT{multiplier > 1 ? 'S' : ''}
                  </span>
                  <div className="flex flex-col items-center">
                    <Split className="h-6 w-6 sm:h-7 sm:w-7 text-emerald-300 group-hover:text-slate-950 mb-1" />
                    <span className="text-base sm:text-xl font-black uppercase tracking-tight">
                      DUO
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-blue-200 group-hover:text-slate-900">
                    2 propositions
                  </span>
                </button>

                {/* BOUTON CARRÉ (3 pts) */}
                <button
                  type="button"
                  onClick={() => handleSelectFormula('carre')}
                  className="group flex flex-col items-center justify-between gap-2 rounded-2xl border-2 border-sky-400/60 bg-gradient-to-b from-sky-500/20 to-[#05102e] hover:from-sky-400 hover:to-blue-500 hover:text-slate-950 p-3 sm:p-4 text-center transition-all active:scale-95 shadow-lg"
                >
                  <span className="rounded-full bg-sky-400 px-2.5 py-0.5 text-[11px] sm:text-xs font-black uppercase text-slate-950 shadow">
                    +{3 * multiplier} PTS
                  </span>
                  <div className="flex flex-col items-center">
                    <Grid className="h-6 w-6 sm:h-7 sm:w-7 text-sky-300 group-hover:text-slate-950 mb-1" />
                    <span className="text-base sm:text-xl font-black uppercase tracking-tight">
                      CARRÉ
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-blue-200 group-hover:text-slate-900">
                    4 propositions
                  </span>
                </button>

                {/* BOUTON CASH (5 pts) */}
                <button
                  type="button"
                  onClick={() => handleSelectFormula('cash')}
                  className="group flex flex-col items-center justify-between gap-2 rounded-2xl border-2 border-yellow-400 bg-gradient-to-b from-yellow-400/25 to-[#05102e] hover:from-yellow-300 hover:to-amber-500 hover:text-slate-950 p-3 sm:p-4 text-center transition-all active:scale-95 shadow-xl"
                >
                  <span className="rounded-full bg-yellow-400 px-2.5 py-0.5 text-[11px] sm:text-xs font-black uppercase text-slate-950 shadow">
                    +{5 * multiplier} PTS
                  </span>
                  <div className="flex flex-col items-center">
                    <Sparkles className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-300 group-hover:text-slate-950 mb-1" />
                    <span className="text-base sm:text-xl font-black uppercase tracking-tight">
                      CASH
                    </span>
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-yellow-200 group-hover:text-slate-900">
                    Sans proposition !
                  </span>
                </button>
              </div>
            </div>
          ) : selectedFormula === 'cash' && !isRevealed ? (
            /* ÉTAPE 2A : MODE CASH (SANS PROPOSITIONS -> Saisie ou Validation orale directe) */
            <div className="rounded-2xl border-2 border-yellow-400/60 bg-[#05102e]/95 p-3.5 sm:p-4 space-y-3 animate-fadeIn">
              {!cashRevealedWaitValidation ? (
                <form onSubmit={handleSubmitCashForm} className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-yellow-300">
                      💰 Tenté en CASH pour +{5 * multiplier} points !
                    </span>
                    <button
                      type="button"
                      onClick={() => handleSelectFormula('carre')}
                      className="text-[11px] font-bold text-sky-300 hover:underline"
                    >
                      Passer en Carré (3 pts)
                    </button>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="text"
                      value={cashGuess}
                      onChange={(e) => setCashGuess(e.target.value)}
                      placeholder="Tape la réponse Cash (ou annonce-la à l'oral)..."
                      className="flex-1 rounded-xl border border-blue-400/40 focus:border-yellow-400 bg-blue-950/90 px-3.5 py-2.5 text-sm font-bold text-white placeholder-blue-300/40 outline-none"
                    />
                    <button
                      type="submit"
                      className="shimmer-btn relative overflow-hidden rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-4 py-2.5 text-xs sm:text-sm font-black uppercase text-blue-950 shadow-lg"
                    >
                      Vérifier le Cash
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-3 text-center">
                  <div className="rounded-xl border border-emerald-400/50 bg-emerald-950/40 p-3">
                    <span className="text-[11px] font-bold uppercase text-emerald-300 block">
                      Réponse attendue :
                    </span>
                    <span className="text-base sm:text-lg font-black text-white">
                      {question.options[question.correct_index]}
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleResolveCashOral(true)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-400 hover:bg-emerald-300 px-4 py-2 text-xs sm:text-sm font-black uppercase text-slate-950 shadow-lg active:scale-95 transition"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      <span>Accordé (+{5 * multiplier} pts) !</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleResolveCashOral(false)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 px-4 py-2 text-xs sm:text-sm font-black uppercase text-white shadow-lg active:scale-95 transition"
                    >
                      <XCircle className="h-4 w-4" />
                      <span>Raté (0 pt)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ÉTAPE 2B : GRILLE DES PROPOSITIONS (2 en mode DUO, 4 en mode CARRÉ ou Classique) */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              {question.options.map((optionText, idx) => {
                const isHiddenByDuo =
                  duoCarreCashEnabled &&
                  !isCoopMode &&
                  selectedFormula === 'duo' &&
                  duoIndices.length === 2 &&
                  !duoIndices.includes(idx) &&
                  !isRevealed;

                if (isHiddenByDuo) {
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2.5 rounded-xl border border-blue-900/30 bg-[#040b1e]/30 px-3 py-2.5 sm:px-4 sm:py-3 opacity-25 select-none"
                    >
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-950 text-xs font-black text-blue-500">
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="text-xs font-bold text-blue-400">
                        — Masqué en DUO —
                      </span>
                    </div>
                  );
                }

                const isCorrect = idx === question.correct_index;
                const isSelected = idx === selectedIndex;

                let buttonStyle =
                  'border-blue-400/35 bg-blue-950/70 hover:bg-blue-900/75 hover:border-yellow-400 text-white';
                let badgeStyle = 'bg-yellow-400 text-blue-950 font-black';

                if (isRevealed) {
                  if (isCorrect) {
                    buttonStyle =
                      'border-emerald-400 bg-emerald-500/25 text-emerald-50 ring-1 ring-emerald-400/60';
                    badgeStyle = 'bg-emerald-400 text-slate-950 font-black';
                  } else if (isSelected && !isCorrect) {
                    buttonStyle =
                      'border-rose-400 bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/50';
                    badgeStyle = 'bg-rose-500 text-white font-black';
                  } else {
                    buttonStyle =
                      'border-blue-900/40 bg-[#040b1e]/40 text-blue-300/40 opacity-55';
                    badgeStyle = 'bg-blue-950 text-blue-400/40';
                  }
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleOptionClick(idx)}
                    disabled={isRevealed}
                    className={`group relative flex items-center justify-between gap-2.5 rounded-xl border-2 px-3 py-2.5 sm:px-4 sm:py-3 text-left transition-all duration-150 ${buttonStyle} ${
                      !isRevealed
                        ? 'active:scale-[0.98] cursor-pointer'
                        : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs sm:text-sm font-black shadow-sm ${badgeStyle}`}
                      >
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span className="text-sm sm:text-base font-bold leading-snug break-words">
                        {optionText}
                      </span>
                    </div>

                    {isRevealed && isCorrect && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                    )}
                    {isRevealed && isSelected && !isCorrect && (
                      <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Zone Explication / Anecdote (juste sous les 4 réponses) */}
          {isRevealed ? (
            <div
              className={`rounded-xl border px-3 py-2.5 shadow-lg animate-fadeIn ${
                isCoopMode && coopStats?.status === 'failed'
                  ? 'border-rose-400/70 bg-rose-950/40'
                  : isCoopMode && coopStats?.status === 'victory'
                  ? 'border-emerald-400 bg-emerald-950/40'
                  : 'border-yellow-400/50 bg-[#07153a]/95'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-yellow-400 text-blue-950 font-black">
                  {isCoopMode && coopStats?.status === 'victory' ? (
                    <Trophy className="h-3.5 w-3.5" />
                  ) : (
                    <Lightbulb className="h-3.5 w-3.5" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    {isCoopMode ? (
                      coopStats?.status === 'victory' ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-yellow-400 text-blue-950">
                          🏆 VICTOIRE TOTALE 10 / 10 ! LÉGENDES DU 7TER !
                        </span>
                      ) : coopStats?.status === 'step_won' ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-400 text-slate-950">
                          ✅ PALIER {question.difficulty}/10 VALIDÉ !
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500 text-white">
                          💥 ERREUR AU PALIER {question.difficulty} ! CHUTE AU NIVEAU 1 (Réponse {OPTION_LETTERS[question.correct_index]})
                        </span>
                      )
                    ) : (
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          selectedIndex === question.correct_index
                            ? 'bg-emerald-400 text-slate-950'
                            : selectedIndex === -1
                            ? 'bg-amber-400 text-slate-950'
                            : 'bg-rose-500 text-white'
                        }`}
                      >
                        {selectedIndex === question.correct_index
                          ? `🎉 BINGO ! (+${pointValue} PT${pointValue > 1 ? 'S' : ''})`
                          : selectedIndex === -1
                          ? `⏱️ TEMPS ÉCOULÉ (${OPTION_LETTERS[question.correct_index]})`
                          : `❌ RATÉ (${OPTION_LETTERS[question.correct_index]})`}
                      </span>
                    )}
                    <span className="text-[11px] font-extrabold text-yellow-300">
                      L’Anecdote du 7TER :
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-blue-50 leading-snug">
                    {question.explanation}
                  </p>
                </div>
              </div>
            </div>
          ) : !isCoopMode && !waitingForFormulaChoice ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedIndex(question.correct_index);
                  setShowConfetti(true);
                  playCorrectSound(soundEnabled);
                }}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-yellow-300/80 hover:text-yellow-300 transition"
              >
                <Eye className="h-3 w-3" />
                Révéler la réponse (jeu à l’oral)
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* 3. PARTIE BASSE FIXE DANS LA CARTE (shrink-0) */}
      <div className="shrink-0 pt-2 border-t border-blue-500/30 flex items-center justify-between gap-2 flex-wrap">
        {isCoopMode ? (
          <>
            <div className="text-[11px] sm:text-xs font-bold text-blue-200/85">
              {!isRevealed ? (
                <span>🤝 Concertation à 4 : cliquez sur votre réponse finale !</span>
              ) : coopStats?.status === 'victory' ? (
                <span className="text-emerald-300 font-black">
                  🎉 Vous avez vaincu les 10 niveaux d’affilée !
                </span>
              ) : coopStats?.status === 'step_won' ? (
                <span className="text-emerald-300 font-extrabold">
                  🔥 Sans-faute ({question.difficulty}/10) ! Prêts pour la suite ?
                </span>
              ) : (
                <span className="text-rose-300 font-extrabold">
                  💀 Une erreur = retour au Niveau 1 !
                </span>
              )}
            </div>

            {isRevealed && (
              <button
                type="button"
                onClick={onNextQuestion}
                className={`shimmer-btn relative overflow-hidden inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wide shadow-lg active:scale-95 transition-all ml-auto ${
                  coopStats?.status === 'failed'
                    ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-rose-500/25'
                    : 'bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 text-blue-950 shadow-yellow-400/25'
                }`}
              >
                {coopStats?.status === 'victory' ? (
                  <>
                    <RotateCcw className="h-4 w-4 stroke-[2.5]" />
                    <span>Nouvelle Ascension (1 → 10)</span>
                  </>
                ) : coopStats?.status === 'failed' ? (
                  <>
                    <RotateCcw className="h-4 w-4 stroke-[2.5]" />
                    <span>Retomber au Niveau 1</span>
                  </>
                ) : (
                  <>
                    <span>Monter au Niveau {question.difficulty + 1}</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            )}
          </>
        ) : (
          <>
            <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
              <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-black uppercase text-yellow-300 mr-0.5">
                <Award className="h-3.5 w-3.5 text-yellow-400" />
                +{pointValue} pt{pointValue > 1 ? 's' : ''} :
              </span>
              {teams.map((team, idx) => {
                const isAwarded = Boolean(awardedTeams[team.id]);
                const tag = teams.length === 4 ? `J${idx + 1}` : `C${idx + 1}`;
                return (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => handleQuickAward(team.id)}
                    className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] sm:text-xs font-black transition-all ${
                      isAwarded
                        ? 'bg-emerald-400 text-slate-950 shadow scale-105'
                        : 'bg-blue-900/75 hover:bg-yellow-400 hover:text-blue-950 text-white border border-blue-400/40'
                    }`}
                  >
                    <span>
                      {isAwarded ? `✓ +${pointValue}` : `+${pointValue}`}
                    </span>
                    <span className="rounded bg-yellow-400/25 px-1 text-[10px] text-yellow-300">
                      {tag}
                    </span>
                    <span className="truncate max-w-[75px] sm:max-w-[110px]">
                      {team.name}
                    </span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={onNextQuestion}
              className="shimmer-btn relative overflow-hidden inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-yellow-400 px-3.5 py-2 sm:px-5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wide text-blue-950 shadow-lg shadow-yellow-400/25 active:scale-95 transition-all ml-auto"
            >
              <span>Suivante</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>
    </section>
  );
}
