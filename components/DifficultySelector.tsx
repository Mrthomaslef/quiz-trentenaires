'use client';

import React, { useState } from 'react';
import { DIFFICULTY_LEVELS, getDifficultyInfo } from '@/lib/generator';
import { Dices, Zap, Timer, Sparkles } from 'lucide-react';
import { playTickSound, playPointSound } from '@/lib/sound';

interface DifficultySelectorProps {
  selectedLevel: number;
  onSelectLevel: (level: number) => void;
  countsByLevel: Record<number, { total: number; remaining: number }>;
  doublePoints: boolean;
  onToggleDoublePoints: () => void;
  timerEnabled: boolean;
  onToggleTimer: () => void;
  soundEnabled: boolean;
}

export default function DifficultySelector({
  selectedLevel,
  onSelectLevel,
  countsByLevel,
  doublePoints,
  onToggleDoublePoints,
  timerEnabled,
  onToggleTimer,
  soundEnabled,
}: DifficultySelectorProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const currentInfo = getDifficultyInfo(selectedLevel);
  const currentStats = countsByLevel[selectedLevel] || { total: 0, remaining: 0 };

  // Roulette animée du 7TER : fait défiler les niveaux avant de s'arrêter sur un niveau surprise
  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let steps = 0;
    const totalSteps = 14;
    const interval = setInterval(() => {
      steps += 1;
      const randomLvl = Math.floor(Math.random() * 10) + 1;
      onSelectLevel(randomLvl);
      playTickSound(soundEnabled, steps > totalSteps - 3);
      if (steps >= totalSteps) {
        clearInterval(interval);
        setIsSpinning(false);
        playPointSound(soundEnabled);
      }
    }, 75);
  };

  return (
    <section className="rounded-3xl border-2 border-blue-500/35 bg-gradient-to-b from-[#0b1d48]/90 to-[#06112b]/95 p-4 sm:p-5 shadow-2xl shadow-blue-950/60 backdrop-blur-md">
      {/* Barre supérieure : Titre + Modes Spéciaux 7TER (Roulette, Quitte ou Double, Chrono) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-yellow-400 text-blue-950 font-black shadow-md shadow-yellow-400/20">
            <Sparkles className="h-4 w-4 fill-blue-950" />
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
              Échelle du 7TER (Niveaux 1 à 10)
            </h2>
            <p className="text-xs text-blue-200/75">
              Changez l’intensité à tout moment ou lancez la roulette !
            </p>
          </div>
        </div>

        {/* Boutons Gadgets Originaux du 7TER */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleSpinRoulette}
            disabled={isSpinning}
            className="inline-flex items-center gap-1.5 rounded-xl border-2 border-yellow-400/80 bg-yellow-400/15 hover:bg-yellow-400 hover:text-blue-950 px-3 py-1.5 text-xs font-extrabold text-yellow-300 transition-all active:scale-95"
            title="Tirer un niveau de difficulté au hasard"
          >
            <Dices className={`h-4 w-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'Tirage...' : 'Roulette Niveau'}</span>
          </button>

          <button
            type="button"
            onClick={onToggleDoublePoints}
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
              doublePoints
                ? 'border-yellow-300 bg-gradient-to-r from-yellow-400 to-amber-500 text-blue-950 shadow-lg shadow-yellow-400/30'
                : 'border-blue-400/30 bg-blue-950/70 text-blue-200 hover:border-yellow-400/50 hover:text-yellow-300'
            }`}
            title="Activer le mode Quitte ou Double (+2 points sur la question)"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>Quitte ou Double x2</span>
          </button>

          <button
            type="button"
            onClick={onToggleTimer}
            className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-3 py-1.5 text-xs font-extrabold transition-all active:scale-95 ${
              timerEnabled
                ? 'border-sky-300 bg-gradient-to-r from-sky-400 to-blue-500 text-blue-950 shadow-lg shadow-sky-400/30'
                : 'border-blue-400/30 bg-blue-950/70 text-blue-200 hover:border-sky-400/50 hover:text-sky-300'
            }`}
            title="Activer le compte à rebours de 20 secondes par question"
          >
            <Timer className="h-3.5 w-3.5" />
            <span>Chrono 20s</span>
          </button>
        </div>
      </div>

      {/* Grille 1 à 10 interactive Jaune & Bleu */}
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {DIFFICULTY_LEVELS.map((item) => {
          const isSelected = item.level === selectedLevel;
          const stats = countsByLevel[item.level];
          const remaining = stats ? stats.remaining : 30;

          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onSelectLevel(item.level)}
              className={`group relative flex flex-col items-center justify-center rounded-2xl py-2.5 px-2 transition-all duration-150 border-2 ${
                isSelected
                  ? 'bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 text-blue-950 border-white shadow-xl scale-[1.06] animate-pulse-gold z-10'
                  : 'bg-[#061336]/90 hover:bg-blue-900/70 text-blue-100 border-blue-500/30 hover:border-yellow-400/60'
              }`}
              title={`Niveau ${item.level} — ${item.title}`}
            >
              <span className="text-lg sm:text-xl font-black leading-none">
                {item.level}
              </span>
              <span
                className={`mt-1 text-[10px] font-bold truncate max-w-full ${
                  isSelected
                    ? 'text-blue-950/90'
                    : 'text-blue-300/75 group-hover:text-yellow-300'
                }`}
              >
                {remaining} q.
              </span>
            </button>
          );
        })}
      </div>

      {/* Bandeau descriptif dynamique du niveau actif */}
      <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-2xl bg-[#040b1e]/90 border border-yellow-400/30 px-4 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center rounded-lg bg-yellow-400 px-2.5 py-0.5 text-xs font-black uppercase text-blue-950">
            Niveau {currentInfo.level}/10 · {currentInfo.tierLabel}
          </span>
          <span className="text-sm font-extrabold text-yellow-300">
            {currentInfo.title} :
          </span>
          <span className="text-xs sm:text-sm text-blue-100/90">
            {currentInfo.subtitle}
          </span>
        </div>

        {currentStats.total > 0 && (
          <span className="shrink-0 self-start sm:self-center rounded-full bg-blue-950 border border-blue-400/40 px-3 py-1 text-xs font-bold text-yellow-300">
            {currentStats.remaining} / {currentStats.total} en stock
          </span>
        )}
      </div>
    </section>
  );
}
