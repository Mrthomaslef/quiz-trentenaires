'use client';

import React, { useState } from 'react';
import { Users, User, Plus, Minus, RotateCcw, Pencil, Check, Trophy } from 'lucide-react';

export type GameMode = '2_couples' | '4_players';

export interface PlayerScore {
  id: string;
  name: string;
  score: number;
}

interface ScoreboardProps {
  mode: GameMode;
  onModeChange: (mode: GameMode) => void;
  teams: PlayerScore[];
  onUpdateScore: (id: string, delta: number) => void;
  onRenameTeam: (id: string, newName: string) => void;
  onResetScores: () => void;
}

export default function Scoreboard({
  mode,
  onModeChange,
  teams,
  onUpdateScore,
  onRenameTeam,
  onResetScores,
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

  const maxScore = Math.max(...teams.map((t) => t.score), 0);

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-900/75 p-4 sm:p-5 shadow-xl backdrop-blur-md">
      {/* Header : Switch Mode 2 Couples / 4 Joueurs + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-xl bg-slate-950/80 p-1 border border-slate-800">
          <button
            type="button"
            onClick={() => onModeChange('2_couples')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              mode === '2_couples'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-4 w-4" />
            Mode 2 Couples
          </button>
          <button
            type="button"
            onClick={() => onModeChange('4_players')}
            className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
              mode === '4_players'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="h-4 w-4" />
            Mode 4 Joueurs
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs text-slate-400">
            Astuce : cliquez sur un nom pour le renommer
          </span>
          <button
            type="button"
            onClick={onResetScores}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700/80 bg-slate-800/70 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition"
            title="Remettre les compteurs à zéro"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Réinitialiser scores
          </button>
        </div>
      </div>

      {/* Cartes de score */}
      <div
        className={`grid gap-3 ${
          mode === '2_couples'
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {teams.map((team, idx) => {
          const isLeader = maxScore > 0 && team.score === maxScore;
          const accentBorders = [
            'border-indigo-500/40 bg-indigo-950/20',
            'border-emerald-500/40 bg-emerald-950/20',
            'border-amber-500/40 bg-amber-950/20',
            'border-rose-500/40 bg-rose-950/20',
          ];
          const cardStyle = accentBorders[idx % accentBorders.length];

          return (
            <div
              key={team.id}
              className={`relative flex items-center justify-between rounded-xl border p-3.5 transition-all ${cardStyle}`}
            >
              <div className="min-w-0 flex-1 pr-2">
                {editingId === team.id ? (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      commitEditing(team.id);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      value={draftName}
                      onChange={(e) => setDraftName(e.target.value)}
                      onBlur={() => commitEditing(team.id)}
                      autoFocus
                      maxLength={24}
                      className="w-full rounded-lg border border-indigo-400 bg-slate-900 px-2.5 py-1 text-sm font-semibold text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-500"
                      aria-label="Valider le nom"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                  </form>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEditing(team)}
                    className="group flex items-center gap-1.5 text-left max-w-full"
                    title="Cliquer pour renommer"
                  >
                    {isLeader && (
                      <Trophy className="h-4 w-4 shrink-0 text-amber-400" />
                    )}
                    <span className="truncate text-sm sm:text-base font-bold text-slate-100 group-hover:text-indigo-300 transition">
                      {team.name}
                    </span>
                    <Pencil className="h-3 w-3 shrink-0 text-slate-500 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                )}

                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                    {team.score}
                  </span>
                  <span className="text-xs font-medium text-slate-400">
                    {team.score > 1 ? 'points' : 'point'}
                  </span>
                </div>
              </div>

              {/* Boutons rapides -1 / +1 */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateScore(team.id, -1)}
                  disabled={team.score <= 0}
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 disabled:pointer-events-none transition"
                  aria-label={`Retirer 1 point à ${team.name}`}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateScore(team.id, 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-md shadow-emerald-600/20 active:scale-95 transition"
                  aria-label={`Ajouter 1 point à ${team.name}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
