'use client';

import React from 'react';
import { DIFFICULTY_LEVELS, getDifficultyInfo } from '@/lib/generator';
import { Flame, Sparkles } from 'lucide-react';

interface DifficultySelectorProps {
  selectedLevel: number;
  onSelectLevel: (level: number) => void;
  countsByLevel: Record<number, { total: number; remaining: number }>;
}

export default function DifficultySelector({
  selectedLevel,
  onSelectLevel,
  countsByLevel,
}: DifficultySelectorProps) {
  const currentInfo = getDifficultyInfo(selectedLevel);
  const currentStats = countsByLevel[selectedLevel] || { total: 0, remaining: 0 };

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3.5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <Flame className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">
            Sélecteur de Difficulté en Direct (1 à 10)
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 font-medium ${currentInfo.badgeColor}`}
          >
            <Sparkles className="h-3 w-3" />
            Niveau {selectedLevel}/10 · {currentInfo.tierLabel}
          </span>
          {currentStats.total > 0 && (
            <span className="rounded-full bg-slate-800/90 border border-slate-700/70 px-2.5 py-0.5 text-slate-300 font-medium">
              {currentStats.remaining} / {currentStats.total} dispo
            </span>
          )}
        </div>
      </div>

      {/* Grille 1 à 10 interactive */}
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
              className={`group relative flex flex-col items-center justify-center rounded-xl py-2.5 px-2 transition-all duration-150 border ${
                isSelected
                  ? `bg-gradient-to-br ${item.accentGradient} text-white border-white/30 shadow-lg shadow-indigo-500/20 scale-[1.03]`
                  : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:border-slate-600'
              }`}
              title={`Niveau ${item.level} — ${item.title}`}
            >
              <span className="text-base sm:text-lg font-extrabold leading-none">
                {item.level}
              </span>
              <span
                className={`mt-1 text-[10px] font-medium truncate max-w-full ${
                  isSelected ? 'text-white/90' : 'text-slate-400 group-hover:text-slate-300'
                }`}
              >
                {remaining} q.
              </span>
            </button>
          );
        })}
      </div>

      {/* Description dynamique du niveau actif */}
      <div className="mt-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl bg-slate-950/60 border border-slate-800/80 px-3.5 py-2.5">
        <div>
          <span className="text-sm font-bold text-white">
            Niveau {currentInfo.level} — {currentInfo.title} :{' '}
          </span>
          <span className="text-xs sm:text-sm text-slate-300">
            {currentInfo.subtitle}
          </span>
        </div>
      </div>
    </section>
  );
}
