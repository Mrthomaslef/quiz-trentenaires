'use client';

import React, { useState } from 'react';
import { DIFFICULTY_LEVELS, getDifficultyInfo } from '@/lib/generator';
import { Dices, Zap, Timer } from 'lucide-react';
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
  availableThemes: string[];
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
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
  availableThemes,
  selectedTheme,
  onSelectTheme,
}: DifficultySelectorProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  const currentInfo = getDifficultyInfo(selectedLevel);

  const handleSpinRoulette = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    let steps = 0;
    const totalSteps = 12;
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
    }, 70);
  };

  return (
    <section className="shrink-0 rounded-2xl border border-blue-500/35 bg-[#091942]/90 px-2.5 py-2 sm:px-3.5 sm:py-2.5 shadow-lg backdrop-blur-md space-y-2">
      {/* Ligne 1 : Les 10 niveaux sur une seule ligne horizontale compacte */}
      <div className="grid grid-cols-10 gap-1 sm:gap-1.5">
        {DIFFICULTY_LEVELS.map((item) => {
          const isSelected = item.level === selectedLevel;
          const stats = countsByLevel[item.level];
          const remaining = stats ? stats.remaining : 60;

          return (
            <button
              key={item.level}
              type="button"
              onClick={() => onSelectLevel(item.level)}
              className={`group flex flex-col items-center justify-center rounded-xl py-1 sm:py-1.5 px-1 transition-all border ${
                isSelected
                  ? 'bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 text-blue-950 border-white shadow-md scale-[1.04] font-black z-10'
                  : 'bg-[#05102e]/90 hover:bg-blue-900/70 text-blue-100 border-blue-500/30 hover:border-yellow-400/50'
              }`}
              title={`Niveau ${item.level} — ${item.title} (${remaining} restantes)`}
            >
              <span className="text-sm sm:text-base font-black leading-none">
                {item.level}
              </span>
              <span
                className={`text-[9px] font-bold leading-none mt-0.5 hidden sm:inline ${
                  isSelected ? 'text-blue-950/85' : 'text-blue-300/70'
                }`}
              >
                {remaining}q
              </span>
            </button>
          );
        })}
      </div>

      {/* Ligne 2 : Titre du niveau actif + Sélecteur Thème + Boutons Roulette / x2 / Chrono */}
      <div className="flex flex-wrap items-center justify-between gap-1.5 text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="shrink-0 rounded-md bg-yellow-400 px-2 py-0.5 text-[11px] font-black uppercase text-blue-950">
            Niv. {currentInfo.level} · {currentInfo.title}
          </span>
          <span className="hidden lg:inline truncate text-blue-200/80 text-xs">
            {currentInfo.subtitle}
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Sélecteur de thème compact */}
          <select
            value={selectedTheme}
            onChange={(e) => onSelectTheme(e.target.value)}
            aria-label="Filtrer par thème"
            className="rounded-lg border border-blue-400/35 bg-[#05102e] px-2 py-1 text-[11px] font-bold text-yellow-300 outline-none focus:border-yellow-400"
          >
            <option value="ALL">Tous les thèmes</option>
            {availableThemes.map((th) => (
              <option key={th} value={th}>
                {th}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleSpinRoulette}
            disabled={isSpinning}
            className="inline-flex items-center gap-1 rounded-lg border border-yellow-400/70 bg-yellow-400/15 hover:bg-yellow-400 hover:text-blue-950 px-2 py-1 text-[11px] font-extrabold text-yellow-300 transition active:scale-95"
            title="Tirer un niveau au sort"
          >
            <Dices className={`h-3.5 w-3.5 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>Roulette</span>
          </button>

          <button
            type="button"
            onClick={onToggleDoublePoints}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-extrabold transition active:scale-95 ${
              doublePoints
                ? 'border-yellow-300 bg-yellow-400 text-blue-950 shadow'
                : 'border-blue-400/30 bg-[#05102e] text-blue-200 hover:text-yellow-300'
            }`}
            title="Doubler les points sur cette question"
          >
            <Zap className="h-3 w-3" />
            <span>x2</span>
          </button>

          <button
            type="button"
            onClick={onToggleTimer}
            className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-extrabold transition active:scale-95 ${
              timerEnabled
                ? 'border-sky-300 bg-sky-400 text-blue-950 shadow'
                : 'border-blue-400/30 bg-[#05102e] text-blue-200 hover:text-sky-300'
            }`}
            title="Activer le compte à rebours 20s"
          >
            <Timer className="h-3 w-3" />
            <span>20s</span>
          </button>
        </div>
      </div>
    </section>
  );
}
