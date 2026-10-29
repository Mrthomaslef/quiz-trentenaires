'use client';

import React, { useState, useEffect } from 'react';
import type { QuizQuestionRecord } from '@/lib/supabase';
import type { PlayerScore } from './Scoreboard';
import { getDifficultyInfo } from '@/lib/generator';
import {
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  Award,
  Lightbulb,
  Tag,
  Zap,
  Timer,
  Eye,
} from 'lucide-react';
import {
  playCorrectSound,
  playWrongSound,
  playPointSound,
  playTickSound,
} from '@/lib/sound';

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
  soundEnabled: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

const CONFETTI_PIECES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  left: `${(i * 4.5 + 3) % 96}%`,
  delay: `${(i % 5) * 0.06}s`,
  color: i % 2 === 0 ? '#FACC15' : i % 3 === 0 ? '#38BDF8' : '#FFFFFF',
}));

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
  soundEnabled,
}: QuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [awardedTeams, setAwardedTeams] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);
  const [shakeCard, setShakeCard] = useState<boolean>(false);

  const pointValue = doublePoints ? 2 : 1;

  // Réinitialise l'état local instantanément dès qu'on passe à la question suivante
  useEffect(() => {
    setSelectedIndex(null);
    setAwardedTeams({});
    setTimeLeft(20);
    setShowConfetti(false);
    setShakeCard(false);
  }, [question?.id]);

  // Compte à rebours Chrono 20s si activé
  useEffect(() => {
    if (!timerEnabled || selectedIndex !== null || !question) return;
    if (timeLeft <= 0) {
      setSelectedIndex(-1); // Temps écoulé -> révèle la réponse
      playWrongSound(soundEnabled);
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
  }, [timerEnabled, timeLeft, selectedIndex, question, soundEnabled]);

  if (!question) {
    return (
      <div className="rounded-3xl border-2 border-blue-500/40 bg-[#0b1d48]/90 p-8 text-center shadow-2xl">
        <p className="text-yellow-300 font-bold text-base">
          Préparation du plateau du 7TER…
        </p>
      </div>
    );
  }

  const isRevealed = selectedIndex !== null;
  const levelInfo = getDifficultyInfo(question.difficulty);

  const handleOptionClick = (idx: number) => {
    if (isRevealed) return;
    setSelectedIndex(idx);

    if (idx === question.correct_index) {
      setShowConfetti(true);
      playCorrectSound(soundEnabled);
    } else {
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
      className={`relative overflow-hidden rounded-3xl border-2 bg-gradient-to-b from-[#0b1d48]/95 via-[#081538]/95 to-[#050d26]/95 p-5 sm:p-7 shadow-2xl backdrop-blur-md animate-fadeIn ${
        doublePoints
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
              className="absolute top-0 h-3 w-2.5 rounded-sm animate-confetti"
            />
          ))}
        </div>
      )}

      {/* Barre Chrono 20s si activé */}
      {timerEnabled && (
        <div className="mb-4">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider mb-1">
            <span className="inline-flex items-center gap-1.5 text-sky-300">
              <Timer className="h-3.5 w-3.5 text-yellow-400" />
              Chrono du 7TER
            </span>
            <span
              className={`font-mono text-sm ${
                timeLeft <= 5 ? 'text-rose-400 animate-pulse' : 'text-yellow-300'
              }`}
            >
              {timeLeft}s
            </span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-blue-950 border border-blue-500/30">
            <div
              className={`h-full transition-all duration-1000 ease-linear ${
                timeLeft <= 5
                  ? 'bg-rose-500'
                  : timeLeft <= 10
                  ? 'bg-amber-400'
                  : 'bg-gradient-to-r from-yellow-300 to-yellow-500'
              }`}
              style={{ width: `${(timeLeft / 20) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Barre supérieure de métadonnées */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 text-blue-950 px-3 py-1 text-xs font-black uppercase tracking-wide shadow-sm">
            <Tag className="h-3.5 w-3.5 fill-blue-950" />
            {question.theme}
          </span>
          <span className="inline-flex items-center gap-1 rounded-full border border-blue-400/40 bg-blue-900/50 px-3 py-1 text-xs font-bold text-blue-100">
            Niveau {question.difficulty}/10 · {levelInfo.title}
          </span>
          {doublePoints && (
            <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 px-3 py-1 text-xs font-black text-blue-950 shadow-md animate-pulse">
              <Zap className="h-3.5 w-3.5 fill-blue-950" />
              QUITTE OU DOUBLE (+2 PTS)
            </span>
          )}
        </div>

        <div className="text-xs font-bold text-blue-200/80">
          Question #{questionNumber} · {remainingInLevel}/{totalInLevel} restantes
        </div>
      </div>

      {/* Énoncé de la question */}
      <div className="mb-6 rounded-2xl border border-blue-400/25 bg-[#040b1e]/75 p-4 sm:p-6 shadow-inner">
        <h3 className="text-lg sm:text-2xl font-black text-white leading-snug tracking-tight">
          {question.question}
        </h3>
      </div>

      {/* Grille des 4 propositions A / B / C / D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {question.options.map((optionText, idx) => {
          const isCorrect = idx === question.correct_index;
          const isSelected = idx === selectedIndex;

          let buttonStyle =
            'border-blue-400/35 bg-blue-950/65 hover:bg-blue-900/75 hover:border-yellow-400 text-white shadow-md';
          let badgeStyle =
            'bg-yellow-400 text-blue-950 font-black group-hover:scale-105';

          if (isRevealed) {
            if (isCorrect) {
              // Vert Émeraude éclatant + bordure Or pour la bonne réponse
              buttonStyle =
                'border-emerald-400 bg-emerald-500/25 text-emerald-50 shadow-xl shadow-emerald-500/15 ring-2 ring-emerald-400/60 scale-[1.01]';
              badgeStyle = 'bg-emerald-400 text-slate-950 font-black';
            } else if (isSelected && !isCorrect) {
              // Rouge Rose pour la mauvaise réponse sélectionnée
              buttonStyle =
                'border-rose-400 bg-rose-500/25 text-rose-100 shadow-lg shadow-rose-500/10 ring-1 ring-rose-400/50';
              badgeStyle = 'bg-rose-500 text-white font-black';
            } else {
              buttonStyle =
                'border-blue-900/40 bg-[#040b1e]/40 text-blue-300/40 opacity-60';
              badgeStyle = 'bg-blue-950 text-blue-400/40';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleOptionClick(idx)}
              disabled={isRevealed}
              className={`group relative flex items-center justify-between gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-150 min-h-[68px] ${buttonStyle} ${
                !isRevealed
                  ? 'active:scale-[0.98] cursor-pointer'
                  : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-black transition-transform shadow-sm ${badgeStyle}`}
                >
                  {OPTION_LETTERS[idx]}
                </span>
                <span className="text-sm sm:text-base font-bold leading-snug break-words">
                  {optionText}
                </span>
              </div>

              {isRevealed && isCorrect && (
                <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
              )}
              {isRevealed && isSelected && !isCorrect && (
                <XCircle className="h-6 w-6 shrink-0 text-rose-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bouton Révéler sans choisir (pour arbitrage oral entre couples) */}
      {!isRevealed && (
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setSelectedIndex(question.correct_index);
              setShowConfetti(true);
              playCorrectSound(soundEnabled);
            }}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-300/85 hover:text-yellow-300 underline-offset-4 hover:underline transition"
          >
            <Eye className="h-3.5 w-3.5" />
            Révéler directement la réponse (jeu à l’oral)
          </button>
        </div>
      )}

      {/* Encadré d'explication / anecdote dévoilé au clic */}
      {isRevealed && (
        <div className="mt-6 rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-br from-[#0d2259] via-[#071436] to-[#040b1e] p-4 sm:p-5 shadow-xl animate-fadeIn">
          <div className="flex items-start gap-3.5">
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-yellow-400 text-blue-950 font-black shadow-md">
              <Lightbulb className="h-5 w-5" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-3 py-0.5 rounded-full ${
                    selectedIndex === question.correct_index
                      ? 'bg-emerald-400 text-slate-950'
                      : selectedIndex === -1
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-rose-500 text-white'
                  }`}
                >
                  {selectedIndex === question.correct_index
                    ? '🎉 BINGO AU 7TER !'
                    : selectedIndex === -1
                    ? `⏱️ TEMPS ÉCOULÉ ! Réponse ${OPTION_LETTERS[question.correct_index]}`
                    : `❌ RATÉ ! La bonne réponse était ${OPTION_LETTERS[question.correct_index]}`}
                </span>
                <span className="text-xs font-extrabold text-yellow-300 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  L’Anecdote du 7TER
                </span>
              </div>
              <p className="text-sm sm:text-base text-blue-50 leading-relaxed font-medium">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barre d'attribution rapide des points + bouton Question Suivante (<10ms) */}
      <div className="mt-6 pt-5 border-t border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-yellow-300 mr-1">
            <Award className="h-4 w-4 text-yellow-400" />
            Attribuer +{pointValue} pt{pointValue > 1 ? 's' : ''} :
          </span>
          {teams.map((team) => {
            const isAwarded = Boolean(awardedTeams[team.id]);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => handleQuickAward(team.id)}
                className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs sm:text-sm font-black transition-all ${
                  isAwarded
                    ? 'bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-400/30 scale-105'
                    : 'bg-blue-900/70 hover:bg-yellow-400 hover:text-blue-950 text-white border border-blue-400/40'
                }`}
              >
                <span>
                  {isAwarded ? `✓ +${pointValue}` : `+${pointValue}`}
                </span>
                <span className="truncate max-w-[120px]">{team.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onNextQuestion}
          className="shimmer-btn relative overflow-hidden inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-yellow-400 px-6 py-3.5 text-sm sm:text-base font-black uppercase tracking-wide text-blue-950 shadow-xl shadow-yellow-400/25 active:scale-[0.97] transition-all"
        >
          <span>Question suivante</span>
          <ArrowRight className="h-5 w-5 stroke-[2.5]" />
        </button>
      </div>
    </section>
  );
}
