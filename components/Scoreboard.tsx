'use client';

import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Pencil,
  Check,
  Crown,
  Flame,
  Trophy,
  Sparkles,
} from 'lucide-react';

export type GameMode =
  | '2_couples'
  | '4_players'
  | 'coop'
  | 'versus'
  | 'millions'
  | 'wikipedia'
  | 'code_route';

export interface PlayerScore {
  id: string;
  name: string;
  score: number;
}

export interface CoopStats {
  currentStep: number; // 1 to 10
  bestStep: number; // 0 to 10
  attempts: number;
  victories: number;
  status: 'playing' | 'step_won' | 'failed' | 'victory';
}

interface ScoreboardProps {
  mode: GameMode;
  teams: PlayerScore[];
  onUpdateScore: (id: string, delta: number) => void;
  onRenameTeam: (id: string, newName: string) => void;
  lastScoredId?: string | null;
  coopStats?: CoopStats;
  onResetCoopRun?: () => void;
}

export default function Scoreboard({
  mode,
  teams,
  onUpdateScore,
  onRenameTeam,
  lastScoredId,
  coopStats,
}: ScoreboardProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftName, setDraftName] = useState<string>('');

  const startEditing = (team: PlayerScore) => {
    setEditingId(team.id);
    setDraftName(team.name);
  };

  const commitEditing = (id: string) => {
    const trimmed = draftName.trim();
    if (trimmed) {
      onRenameTeam(id, trimmed);
    }
    setEditingId(null);
  };

  // Affichage spécial pour le Mode ENSEMBLE (Ascension 1 -> 10 sans erreur)
  if (mode === 'coop' && coopStats) {
    const completedCount =
      coopStats.status === 'victory'
        ? 10
        : coopStats.status === 'step_won'
        ? coopStats.currentStep
        : coopStats.currentStep - 1;

    return (
      <section className="shrink-0 rounded-2xl border-2 border-yellow-400/55 bg-gradient-to-r from-[#0c2157]/95 via-[#091942]/95 to-[#0c2157]/95 px-2.5 py-1.5 sm:px-4 sm:py-2 shadow-xl backdrop-blur-md">
        <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-yellow-400 px-2 py-0.5 text-[10px] sm:text-xs font-black uppercase text-blue-950 shadow">
              <Flame className="h-3 w-3 fill-blue-950" />
              Ensemble (À 4)
            </span>
            <span className="text-[11px] sm:text-xs font-extrabold text-white">
              Réussir <span className="text-yellow-300">1 → 10</span> sans erreur !
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-bold">
            <span className="rounded-md bg-blue-950/90 border border-blue-400/35 px-2 py-0.5 text-blue-200">
              Essai #{coopStats.attempts}
            </span>
            <span className="rounded-md bg-blue-950/90 border border-yellow-400/40 px-2 py-0.5 text-yellow-300 flex items-center gap-1">
              <Trophy className="h-3 w-3 text-yellow-400" />
              Record : {coopStats.bestStep}/10
            </span>
            {coopStats.victories > 0 && (
              <span className="rounded-md bg-emerald-500/20 border border-emerald-400/50 px-2 py-0.5 text-emerald-300 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {coopStats.victories}
              </span>
            )}
          </div>
        </div>

        {/* Barre d'Ascension des 10 paliers (1 -> 10) */}
        <div className="grid grid-cols-10 gap-1">
          {Array.from({ length: 10 }, (_, idx) => {
            const lvl = idx + 1;
            const isDone = lvl <= completedCount;
            const isCurrent =
              lvl === coopStats.currentStep && coopStats.status !== 'victory';
            const isFailedHere =
              isCurrent && coopStats.status === 'failed';

            let stepStyle =
              'bg-[#040b1e]/80 border-blue-500/30 text-blue-300/60';
            if (isDone) {
              stepStyle =
                'bg-emerald-500 text-slate-950 border-emerald-300 font-black';
            } else if (isFailedHere) {
              stepStyle =
                'bg-rose-500 text-white border-rose-300 font-black animate-shake';
            } else if (isCurrent) {
              stepStyle =
                'bg-gradient-to-b from-yellow-300 via-yellow-400 to-amber-500 text-blue-950 border-white font-black scale-105 z-10';
            }

            return (
              <div
                key={lvl}
                className={`flex flex-col items-center justify-center rounded-lg border py-1 transition-all ${stepStyle}`}
              >
                <span className="text-xs font-black leading-none">
                  {isDone ? '✓' : isFailedHere ? '✗' : lvl}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  const maxScore = Math.max(...teams.map((t) => t.score), 0);

  const c1Score = teams[0]?.score ?? 0;
  const c2Score = teams[1]?.score ?? 0;
  const totalDuel = c1Score + c2Score;
  const c1Percent = totalDuel === 0 ? 50 : Math.round((c1Score / totalDuel) * 100);

  return (
    <section className="shrink-0 rounded-2xl border border-blue-500/35 bg-[#091942]/90 px-2 py-1 sm:px-3 sm:py-2 shadow-lg backdrop-blur-md">
      {/* En portrait mobile : 2 colonnes (2x1 en 2 Équipes, 2x2 ultra-compact en 4 Joueurs pour que les noms soient 100% lisibles) */}
      <div
        className={`grid gap-1 sm:gap-2 ${
          mode === '2_couples' ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'
        }`}
      >
        {teams.map((team, idx) => {
          const isLeader = maxScore > 0 && team.score === maxScore;
          const isJustScored = lastScoredId === team.id;
          const playerNumber = idx + 1;

          const cardThemes = [
            'border-yellow-400/55 bg-gradient-to-b from-yellow-500/15 to-blue-950/90',
            'border-sky-400/55 bg-gradient-to-b from-sky-500/15 to-blue-950/90',
            'border-amber-400/55 bg-gradient-to-b from-amber-500/15 to-blue-950/90',
            'border-indigo-400/55 bg-gradient-to-b from-indigo-500/15 to-blue-950/90',
          ];

          const badgeColors = [
            'bg-yellow-400 text-blue-950',
            'bg-sky-400 text-blue-950',
            'bg-amber-400 text-blue-950',
            'bg-indigo-400 text-blue-950',
          ];

          return (
            <div
              key={team.id}
              className={`relative flex flex-row sm:flex-col items-center sm:items-stretch justify-between gap-1 rounded-xl border px-2 py-1 sm:px-3 sm:py-2 transition-all ${
                cardThemes[idx % cardThemes.length]
              } ${isLeader ? 'ring-1 ring-yellow-400' : ''}`}
            >
              {isJustScored && (
                <span className="pointer-events-none absolute -top-2 right-1 z-20 rounded-full bg-yellow-400 px-1.5 py-0.5 text-[9px] font-black text-blue-950 shadow animate-float-up">
                  +PT ⚡
                </span>
              )}

              {/* Partie Gauche (ou Haut sur desktop) : Pastille Numéro (J1..J4 / E1..E2) + Nom */}
              <div className="min-w-0 flex-1 sm:w-full sm:mb-1">
                {editingId === team.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      commitEditing(team.id);
                    }}
                    className="flex items-center gap-1"
                  >
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onBlur={() => commitEditing(team.id)}
                      autoFocus
                      maxLength={18}
                      className="w-full rounded border border-yellow-400 bg-blue-950 px-1 py-0.5 text-[11px] font-bold text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded bg-yellow-400 p-0.5 text-blue-950"
                      aria-label="Valider"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditing(team)}
                    className="group flex items-center gap-1 text-left w-full min-w-0"
                    title="Cliquer pour renommer"
                  >
                    <span
                      className={`inline-flex h-4 sm:h-5 shrink-0 items-center justify-center rounded px-1 text-[10px] sm:text-[11px] font-black shadow-sm ${
                        badgeColors[idx % badgeColors.length]
                      }`}
                    >
                      {mode === '4_players' ? `J${playerNumber}` : `E${playerNumber}`}
                    </span>

                    {isLeader && (
                      <Crown className="h-3 w-3 shrink-0 text-yellow-400 fill-yellow-400" />
                    )}

                    <span className="truncate text-[11px] sm:text-xs font-extrabold text-white group-hover:text-yellow-300">
                      {team.name}
                    </span>
                    <Pencil className="hidden md:inline h-2.5 w-2.5 shrink-0 text-blue-300/50 opacity-0 group-hover:opacity-100 ml-auto" />
                  </button>
                )}
              </div>

              {/* Partie Droite (ou Bas sur desktop) : Score + Boutons - / + */}
              <div className="flex items-center justify-end sm:justify-between gap-1.5 sm:gap-1 shrink-0">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-sm sm:text-xl font-black leading-none text-yellow-300">
                    {team.score}
                  </span>
                  <span className="text-[9px] font-bold uppercase text-blue-200/70 hidden sm:inline">
                    pt{team.score > 1 ? 's' : ''}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpdateScore(team.id, -1)}
                    disabled={team.score <= 0}
                    className="flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-md border border-blue-400/30 bg-blue-950/90 text-blue-200 hover:bg-blue-900 disabled:opacity-30 transition"
                    aria-label={`Retirer 1 point à ${team.name}`}
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateScore(team.id, 1)}
                    className="flex h-5 w-5 sm:h-7 sm:w-7 items-center justify-center rounded-md bg-gradient-to-br from-yellow-300 to-amber-500 text-blue-950 font-black shadow active:scale-90 transition"
                    aria-label={`Ajouter 1 point à ${team.name}`}
                  >
                    <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mini Jauge de Domination Jaune vs Bleu intégrée (2 Couples) */}
      {mode === '2_couples' && teams.length >= 2 && (
        <div className="mt-1 flex items-center gap-2">
          <span className="text-[9px] font-black text-yellow-300 w-7 text-right">
            {c1Percent}%
          </span>
          <div className="h-1 flex-1 overflow-hidden rounded-full bg-sky-500/30 flex">
            <div
              className="h-full bg-gradient-to-r from-yellow-300 to-amber-400 transition-all duration-500"
              style={{ width: `${c1Percent}%` }}
            />
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500"
              style={{ width: `${100 - c1Percent}%` }}
            />
          </div>
          <span className="text-[9px] font-black text-sky-300 w-7">
            {100 - c1Percent}%
          </span>
        </div>
      )}
    </section>
  );
}
