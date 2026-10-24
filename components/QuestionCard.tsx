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
} from 'lucide-react';

interface QuestionCardProps {
  question: QuizQuestionRecord | null;
  onNextQuestion: () => void;
  onAwardPoint: (teamId: string, delta: number) => void;
  teams: PlayerScore[];
  questionNumber: number;
  remainingInLevel: number;
  totalInLevel: number;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

export default function QuestionCard({
  question,
  onNextQuestion,
  onAwardPoint,
  teams,
  questionNumber,
  remainingInLevel,
  totalInLevel,
}: QuestionCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [awardedTeams, setAwardedTeams] = useState<Record<string, boolean>>({});

  // Réinitialise l'état local instantanément dès qu'on passe à la question suivante
  useEffect(() => {
    setSelectedIndex(null);
    setAwardedTeams({});
  }, [question?.id]);

  if (!question) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/75 p-8 text-center shadow-xl">
        <p className="text-slate-300 text-base">
          Chargement des questions pré-générées…
        </p>
      </div>
    );
  }

  const isRevealed = selectedIndex !== null;
  const levelInfo = getDifficultyInfo(question.difficulty);

  const handleOptionClick = (idx: number) => {
    if (isRevealed) return;
    setSelectedIndex(idx);
  };

  const handleQuickAward = (teamId: string) => {
    if (awardedTeams[teamId]) {
      onAwardPoint(teamId, -1);
      setAwardedTeams((prev) => ({ ...prev, [teamId]: false }));
    } else {
      onAwardPoint(teamId, 1);
      setAwardedTeams((prev) => ({ ...prev, [teamId]: true }));
    }
  };

  return (
    <section className="rounded-2xl border border-slate-800/90 bg-slate-900/85 p-5 sm:p-7 shadow-2xl backdrop-blur-md transition-all">
      {/* Barre supérieure de métadonnées */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 text-xs font-semibold text-indigo-300">
            <Tag className="h-3.5 w-3.5" />
            {question.theme}
          </span>
          <span
            className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold ${levelInfo.badgeColor}`}
          >
            Niveau {question.difficulty}/10 · {levelInfo.title}
          </span>
        </div>

        <div className="text-xs font-medium text-slate-400">
          Question #{questionNumber} · Reste {remainingInLevel}/{totalInLevel} dans ce niveau
        </div>
      </div>

      {/* Énoncé de la question */}
      <h3 className="text-lg sm:text-2xl font-extrabold text-white leading-snug tracking-tight mb-6">
        {question.question}
      </h3>

      {/* Grille des 4 propositions A / B / C / D */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {question.options.map((optionText, idx) => {
          const isCorrect = idx === question.correct_index;
          const isSelected = idx === selectedIndex;

          let buttonStyle =
            'border-slate-700/80 bg-slate-800/70 hover:bg-slate-800 hover:border-indigo-500/60 text-slate-100';
          let badgeStyle =
            'bg-slate-700/90 text-slate-200 group-hover:bg-indigo-600 group-hover:text-white';

          if (isRevealed) {
            if (isCorrect) {
              // Vert Émeraude pour la bonne réponse
              buttonStyle =
                'border-emerald-400 bg-emerald-500/20 text-emerald-50 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-400/50';
              badgeStyle = 'bg-emerald-500 text-slate-950 font-black';
            } else if (isSelected && !isCorrect) {
              // Rouge Rose pour la mauvaise réponse sélectionnée
              buttonStyle =
                'border-rose-400 bg-rose-500/20 text-rose-100 shadow-lg shadow-rose-500/10 ring-1 ring-rose-400/50';
              badgeStyle = 'bg-rose-500 text-white font-black';
            } else {
              buttonStyle =
                'border-slate-800 bg-slate-900/40 text-slate-500 opacity-65';
              badgeStyle = 'bg-slate-800 text-slate-500';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleOptionClick(idx)}
              disabled={isRevealed}
              className={`group relative flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-all duration-150 min-h-[64px] ${buttonStyle} ${
                !isRevealed ? 'active:scale-[0.99] cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors ${badgeStyle}`}
                >
                  {OPTION_LETTERS[idx]}
                </span>
                <span className="text-sm sm:text-base font-semibold leading-snug break-words">
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

      {/* Encadré d'explication / anecdote dévoilé au clic */}
      {isRevealed && (
        <div className="mt-6 rounded-xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/50 via-slate-900/90 to-slate-900 p-4 sm:p-5 shadow-inner animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Lightbulb className="h-4 w-4" />
            </div>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    selectedIndex === question.correct_index
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  }`}
                >
                  {selectedIndex === question.correct_index
                    ? 'Bonne réponse !'
                    : `Raté ! La bonne réponse était ${OPTION_LETTERS[question.correct_index]}`}
                </span>
                <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5" />
                  Le saviez-vous ? (Point débat entre couples)
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Barre d'attribution rapide des points + bouton Question Suivante (<10ms) */}
      <div className="mt-6 pt-5 border-t border-slate-800/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 mr-1">
            <Award className="h-4 w-4 text-amber-400" />
            Attribuer +1 pt :
          </span>
          {teams.map((team) => {
            const isAwarded = Boolean(awardedTeams[team.id]);
            return (
              <button
                key={team.id}
                type="button"
                onClick={() => handleQuickAward(team.id)}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs sm:text-sm font-bold transition-all ${
                  isAwarded
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/25'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                }`}
              >
                <span>{isAwarded ? '✓ +1' : '+1'}</span>
                <span className="truncate max-w-[120px]">{team.name}</span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onNextQuestion}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 px-5 py-3 text-sm sm:text-base font-extrabold text-white shadow-lg shadow-indigo-600/30 active:scale-[0.98] transition-all"
        >
          <span>Question suivante</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
}
