'use client';

import React, { useState } from 'react';
import {
  Users,
  User,
  Plus,
  Minus,
  RotateCcw,
  Pencil,
  Check,
  Crown,
  Swords,
} from 'lucide-react';

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
  lastScoredId?: string | null;
}

export default function Scoreboard({
  mode,
  onModeChange,
  teams,
  onUpdateScore,
  onRenameTeam,
  onResetScores,
  lastScoredId,
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

  // Calcul de la jauge de duel en mode 2 Couples
  const c1Score = teams[0]?.score ?? 0;
  const c2Score = teams[1]?.score ?? 0;
  const totalDuel = c1Score + c2Score;
  const c1Percent = totalDuel === 0 ? 50 : Math.round((c1Score / totalDuel) * 100);

  return (
    <section className="rounded-3xl border-2 border-blue-500/35 bg-gradient-to-b from-[#0b1d48]/90 to-[#06112b]/95 p-4 sm:p-5 shadow-2xl shadow-blue-950/60 backdrop-blur-md">
      {/* Header : Switch Mode 2 Couples / 4 Joueurs + Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="inline-flex rounded-2xl bg-[#040b1e]/90 p-1.5 border border-blue-500/30 shadow-inner">
          <button
            type="button"
            onClick={() => onModeChange('2_couples')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-extrabold tracking-wide transition-all ${
              mode === '2_couples'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-950 shadow-md shadow-yellow-400/25'
                : 'text-blue-200/75 hover:text-white'
            }`}
          >
            <Users className="h-4 w-4" />
            Duel 2 Couples
          </button>
          <button
            type="button"
            onClick={() => onModeChange('4_players')}
            className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-1.5 text-xs sm:text-sm font-extrabold tracking-wide transition-all ${
              mode === '4_players'
                ? 'bg-gradient-to-r from-yellow-400 to-amber-400 text-blue-950 shadow-md shadow-yellow-400/25'
                : 'text-blue-200/75 hover:text-white'
            }`}
          >
            <User className="h-4 w-4" />
            4 Joueurs Solo
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden md:inline text-xs font-medium text-blue-200/70">
            ✏️ Cliquez sur un nom d’équipe pour le personnaliser
          </span>
          <button
            type="button"
            onClick={onResetScores}
            className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/30 bg-blue-900/40 px-3 py-1.5 text-xs font-bold text-blue-100 hover:bg-blue-800/60 hover:border-yellow-400/50 hover:text-yellow-300 transition"
            title="Remettre les compteurs à zéro"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Remise à zéro
          </button>
        </div>
      </div>

      {/* Jauge de Domination Jaune vs Bleu (Mode 2 Couples) */}
      {mode === '2_couples' && teams.length >= 2 && (
        <div className="mb-4 rounded-2xl bg-[#040b1e]/80 border border-blue-500/30 p-3">
          <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider mb-1.5">
            <span className="text-yellow-300 flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-400 inline-block" />
              {teams[0].name} ({c1Percent}%)
            </span>
            <span className="text-blue-300/80 flex items-center gap-1 text-[11px]">
              <Swords className="h-3.5 w-3.5 text-yellow-400" />
              Jauge du 7TER
            </span>
            <span className="text-sky-300 flex items-center gap-1.5">
              ({100 - c1Percent}%) {teams[1].name}
              <span className="h-2.5 w-2.5 rounded-full bg-sky-400 inline-block" />
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-sky-500/30 flex p-0.5 border border-blue-400/20">
            <div
              className="h-full rounded-l-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 transition-all duration-500"
              style={{ width: `${c1Percent}%` }}
            />
            <div
              className="h-full rounded-r-full bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-500"
              style={{ width: `${100 - c1Percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Cartes de score */}
      <div
        className={`grid gap-3.5 ${
          mode === '2_couples'
            ? 'grid-cols-1 sm:grid-cols-2'
            : 'grid-cols-2 lg:grid-cols-4'
        }`}
      >
        {teams.map((team, idx) => {
          const isLeader = maxScore > 0 && team.score === maxScore;
          const isJustScored = lastScoredId === team.id;

          const cardThemes = [
            'border-yellow-400/60 bg-gradient-to-br from-yellow-500/15 via-blue-950/80 to-blue-950/90 shadow-lg shadow-yellow-500/5',
            'border-sky-400/60 bg-gradient-to-br from-sky-500/15 via-blue-950/80 to-blue-950/90 shadow-lg shadow-sky-500/5',
            'border-amber-400/60 bg-gradient-to-br from-amber-500/15 via-blue-950/80 to-blue-950/90',
            'border-indigo-400/60 bg-gradient-to-br from-indigo-500/15 via-blue-950/80 to-blue-950/90',
          ];
          const cardStyle = cardThemes[idx % cardThemes.length];

          return (
            <div
              key={team.id}
              className={`relative flex items-center justify-between rounded-2xl border-2 p-4 transition-all duration-200 ${cardStyle} ${
                isLeader ? 'ring-2 ring-yellow-400/70' : ''
              }`}
            >
              {/* Animation flottante +1 PT */}
              {isJustScored && (
                <span className="pointer-events-none absolute -top-3 right-4 z-20 rounded-full bg-yellow-400 px-2.5 py-0.5 text-xs font-black text-blue-950 shadow-lg animate-float-up">
                  + POINT ! ⚡
                </span>
              )}

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
                      className="w-full rounded-xl border-2 border-yellow-400 bg-blue-950 px-2.5 py-1 text-sm font-bold text-white outline-none"
                    />
                    <button
                      type="submit"
                      className="rounded-xl bg-yellow-400 p-1.5 text-blue-950 hover:bg-yellow-300 font-bold"
                      aria-label="Valider le nom"
                    >
                      <Check className="h-4 w-4" />
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
                      <Crown className="h-4 w-4 shrink-0 text-yellow-400 fill-yellow-400 animate-bounce" />
                    )}
                    <span className="truncate text-sm sm:text-base font-extrabold text-white group-hover:text-yellow-300 transition">
                      {team.name}
                    </span>
                    <Pencil className="h-3.5 w-3.5 shrink-0 text-blue-300/60 opacity-0 group-hover:opacity-100 transition" />
                  </button>
                )}

                <div className="mt-1 flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black tracking-tight text-yellow-300 drop-shadow">
                    {team.score}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-200/75">
                    {team.score > 1 ? 'pts' : 'pt'}
                  </span>
                </div>
              </div>

              {/* Boutons rapides -1 / +1 */}
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => onUpdateScore(team.id, -1)}
                  disabled={team.score <= 0}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/30 bg-blue-950/90 text-blue-200 hover:bg-blue-900 hover:text-white disabled:opacity-35 disabled:pointer-events-none transition"
                  aria-label={`Retirer 1 point à ${team.name}`}
                >
                  <Minus className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateScore(team.id, 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-yellow-400 text-blue-950 font-black shadow-lg shadow-yellow-400/25 active:scale-90 transition"
                  aria-label={`Ajouter 1 point à ${team.name}`}
                >
                  <Plus className="h-5 w-5 stroke-[2.5]" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
