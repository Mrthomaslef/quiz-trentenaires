'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Scoreboard, { type PlayerScore } from './Scoreboard';
import CodeRouteVisual from './CodeRouteVisual';
import {
  CODE_ROUTE_QUESTIONS,
  CODE_ROUTE_THEMES_META,
  type CodeRouteQuestion,
  type CodeRouteTheme,
} from '@/lib/code-route-questions';
import {
  Car,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Award,
  Timer,
  ZoomIn,
  ZoomOut,
  Maximize2,
  X,
  Users,
  User,
  ShieldAlert,
  RotateCcw,
  Eye,
  Flame,
} from 'lucide-react';
import {
  playCorrectSound,
  playWrongSound,
  playPointSound,
  playTickSound,
} from '@/lib/sound';

interface CodeRouteModeProps {
  teams: PlayerScore[];
  teamMode: '2_couples' | '4_players';
  onToggleTeamMode: () => void;
  onUpdateScore: (id: string, delta: number) => void;
  onRenameTeam: (id: string, newName: string) => void;
  lastScoredId: string | null;
  soundEnabled: boolean;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const STORAGE_CODE_ROUTE_PLAYED = '7ter:code_route:played_ids:v1';

export default function CodeRouteMode({
  teams,
  teamMode,
  onUpdateScore,
  onRenameTeam,
  onToggleTeamMode,
  lastScoredId,
  soundEnabled,
}: CodeRouteModeProps) {
  const [selectedTheme, setSelectedTheme] = useState<'ALL' | CodeRouteTheme>('ALL');
  const [onlyTraps, setOnlyTraps] = useState<boolean>(false);
  const [questions] = useState<CodeRouteQuestion[]>(() =>
    shuffleArray(CODE_ROUTE_QUESTIONS)
  );
  const [playedIds, setPlayedIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem(STORAGE_CODE_ROUTE_PLAYED);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [awardedTeams, setAwardedTeams] = useState<Record<string, boolean>>({});
  const [timerEnabled, setTimerEnabled] = useState<boolean>(false);
  const [timeLeft, setTimeLeft] = useState<number>(20);
  const [zoomedImage, setZoomedImage] = useState<boolean>(false);
  const [isFullscreenSlide, setIsFullscreenSlide] = useState<boolean>(false);

  // Compteur style Examen Officiel (objectif : max 5 fautes sur 40)
  const [examAnswered, setExamAnswered] = useState<number>(0);
  const [examCorrect, setExamCorrect] = useState<number>(0);
  const [examFaults, setExamFaults] = useState<number>(0);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_CODE_ROUTE_PLAYED,
        JSON.stringify(playedIds)
      );
    } catch {
      // Ignore
    }
  }, [playedIds]);

  const playedSet = useMemo(() => new Set(playedIds), [playedIds]);

  const filteredQuestions = useMemo(() => {
    const matching = questions.filter((q) => {
      if (selectedTheme !== 'ALL' && q.theme !== selectedTheme) return false;
      if (onlyTraps && q.difficulty !== 'Piège Examen') return false;
      return true;
    });
    const unplayed = matching.filter((q) => !playedSet.has(q.id));
    return unplayed.length > 0 ? unplayed : matching;
  }, [questions, selectedTheme, onlyTraps, playedSet]);

  const currentQuestion = useMemo(() => {
    if (filteredQuestions.length === 0) return null;
    return filteredQuestions[0];
  }, [filteredQuestions]);

  const isRevealed = selectedIndex !== null;

  useEffect(() => {
    setSelectedIndex(null);
    setAwardedTeams({});
    setTimeLeft(20);
    setZoomedImage(false);
    setIsFullscreenSlide(false);
  }, [currentQuestion?.id]);

  // Compte à rebours officiel 20 secondes (comme à l'examen ETG)
  useEffect(() => {
    if (!timerEnabled || isRevealed || !currentQuestion) return;

    if (timeLeft <= 0) {
      setSelectedIndex(-1);
      setExamAnswered((n) => n + 1);
      setExamFaults((f) => f + 1);
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
  }, [timerEnabled, timeLeft, isRevealed, currentQuestion, soundEnabled]);

  const handleSelectOption = (idx: number) => {
    if (!currentQuestion || isRevealed) return;
    setSelectedIndex(idx);
    setExamAnswered((n) => n + 1);

    const isCorrect = idx === currentQuestion.correct_index;
    if (isCorrect) {
      setExamCorrect((c) => c + 1);
      playCorrectSound(soundEnabled);
    } else {
      setExamFaults((f) => f + 1);
      playWrongSound(soundEnabled);
    }
  };

  const handleNextQuestion = useCallback(() => {
    if (currentQuestion) {
      setPlayedIds((prev) =>
        prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
      );
    }
    setSelectedIndex(null);
    setAwardedTeams({});
    setTimeLeft(20);
    setZoomedImage(false);
    setIsFullscreenSlide(false);
    setCurrentIndex((i) => i + 1);
  }, [currentQuestion]);

  const handleResetExamStats = () => {
    setExamAnswered(0);
    setExamCorrect(0);
    setExamFaults(0);
    // On conserve playedIds pour ne pas reposer les diapositives déjà jouées
    if (currentQuestion) {
      setPlayedIds((prev) =>
        prev.includes(currentQuestion.id) ? prev : [...prev, currentQuestion.id]
      );
    }
    setSelectedIndex(null);
  };

  const handleToggleAwardTeam = (teamId: string) => {
    const already = Boolean(awardedTeams[teamId]);
    if (already) {
      onUpdateScore(teamId, -1);
      setAwardedTeams((prev) => ({ ...prev, [teamId]: false }));
    } else {
      playPointSound(soundEnabled);
      onUpdateScore(teamId, 1);
      setAwardedTeams((prev) => ({ ...prev, [teamId]: true }));
    }
  };

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center rounded-2xl border border-blue-500/35 bg-[#091942]/90 p-6 text-center">
        <p className="text-sm font-black text-white mb-2">
          Aucune question trouvée pour ce filtre.
        </p>
        <button
          type="button"
          onClick={() => {
            setSelectedTheme('ALL');
            setOnlyTraps(false);
          }}
          className="rounded-xl bg-yellow-400 px-4 py-2 text-xs font-black text-blue-950"
        >
          Afficher toutes les questions illustrées
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-1.5 sm:gap-2 overflow-hidden">
      {/* 1. Bandeau des scores (2 Équipes ou 4 Joueurs) */}
      <Scoreboard
        mode={teamMode}
        teams={teams}
        onUpdateScore={onUpdateScore}
        onRenameTeam={onRenameTeam}
        lastScoredId={lastScoredId}
      />

      {/* 2. Barre de contrôle Code de la Route compacte pour mode portrait */}
      <div className="shrink-0 flex flex-col gap-1 rounded-xl border border-blue-500/35 bg-[#071436]/95 px-2 py-1 sm:px-2.5 sm:py-1.5 shadow-md">
        <div className="flex items-center justify-between gap-1 flex-wrap">
          <div className="flex items-center gap-1 min-w-0">
            <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 px-1.5 py-0.5 text-[10px] sm:text-xs font-black text-white shadow-sm shrink-0">
              <Car className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              <span className="hidden xs:inline sm:inline">CODE DE LA ROUTE</span>
              <span className="xs:hidden sm:hidden">CODE</span>
            </span>

            {/* Compteur Examen Officiel (Bonnes réponses / Fautes) */}
            <div className="inline-flex items-center gap-1 rounded-lg border border-blue-400/35 bg-[#040b1e] px-1.5 py-0.5 text-[10px] sm:text-xs font-black">
              <span className="text-emerald-400">✓ {examCorrect}</span>
              <span className="text-blue-400/50">|</span>
              <span
                className={
                  examFaults > 5 ? 'text-rose-400 animate-pulse' : 'text-amber-300'
                }
              >
                ✗ {examFaults}
                <span className="hidden sm:inline">
                  {' '}
                  faute{examFaults > 1 ? 's' : ''}
                </span>
              </span>
              {examAnswered > 0 && (
                <button
                  type="button"
                  onClick={handleResetExamStats}
                  className="ml-0.5 text-blue-300 hover:text-yellow-300"
                  title="Remettre le compteur de fautes d'examen à zéro"
                >
                  <RotateCcw className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {/* Bouton Filtre Spécial Pièges d'Examen */}
            <button
              type="button"
              onClick={() => {
                setOnlyTraps((t) => !t);
                setCurrentIndex(0);
              }}
              className={`inline-flex items-center gap-1 rounded-lg border px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] font-black transition ${
                onlyTraps
                  ? 'border-rose-300 bg-rose-500 text-white shadow'
                  : 'border-rose-400/40 bg-rose-950/50 text-rose-200 hover:bg-rose-900/60'
              }`}
              title="Afficher uniquement les grands pièges de l'examen du Code de la route"
            >
              <Flame className="h-3 w-3 shrink-0" />
              <span>Pièges</span>
            </button>

            {/* Bouton Chrono Officiel 20s */}
            <button
              type="button"
              onClick={() => setTimerEnabled((t) => !t)}
              className={`inline-flex items-center gap-1 rounded-lg border px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] font-black transition ${
                timerEnabled
                  ? 'border-sky-300 bg-sky-400 text-slate-950 shadow'
                  : 'border-blue-400/35 bg-blue-950/80 text-blue-200 hover:text-sky-300'
              }`}
              title="Activer le chronomètre officiel de 20 secondes par diapositive"
            >
              <Timer className="h-3 w-3 shrink-0" />
              <span>20s</span>
            </button>

            {/* Bascule 2 Équipes / 4 Joueurs */}
            <button
              type="button"
              onClick={onToggleTeamMode}
              className="inline-flex items-center gap-1 rounded-lg border border-blue-400/35 bg-blue-950/80 hover:bg-blue-900 px-1.5 sm:px-2 py-0.5 sm:py-1 text-[10px] font-extrabold text-blue-100 transition"
              title="Basculer l'affichage des scores entre 2 Équipes et 4 Joueurs"
            >
              {teamMode === '2_couples' ? (
                <>
                  <Users className="h-3 w-3 text-yellow-400 shrink-0" />
                  <span>2 Éq.</span>
                </>
              ) : (
                <>
                  <User className="h-3 w-3 text-sky-400 shrink-0" />
                  <span>4 J.</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sélecteur des 6 catégories visuelles du Code de la route */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
          {CODE_ROUTE_THEMES_META.map((th) => {
            const active = selectedTheme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => {
                  setSelectedTheme(th.id);
                  setCurrentIndex(0);
                }}
                className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 sm:py-1 text-[10px] sm:text-[11px] font-black shrink-0 transition ${
                  active
                    ? 'bg-yellow-400 text-blue-950 shadow'
                    : 'bg-[#040b1e] text-blue-200/85 hover:text-white border border-blue-500/25'
                }`}
              >
                <span>{th.emoji}</span>
                <span>{th.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Carte principale Code de la Route (optimisée portrait : zone centrale scrollable + barre du bas toujours fixe) */}
      <section className="flex-1 min-h-0 flex flex-col justify-between rounded-2xl border-2 border-yellow-400/45 bg-gradient-to-b from-[#0b1f52]/95 via-[#07153a]/95 to-[#050e29]/95 p-2 sm:p-3.5 shadow-2xl overflow-hidden">
        {/* Barre de progression 20s si activée */}
        {timerEnabled && !isRevealed && (
          <div className="shrink-0 flex items-center gap-2 mb-1.5">
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

        {/* Corps central (Diapositive en haut en portrait / à gauche sur desktop + Question & A/B/C/D) */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-0.5">
          <div className="min-h-full grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3 items-stretch content-start md:content-center">
            {/* COLONNE GAUCHE / HAUT PORTRAIT (5/12) : Diapositive 16:9 parfaitement proportionnée */}
            <div className="md:col-span-5 flex flex-col justify-between rounded-xl border-2 border-blue-400/40 bg-[#03091a] overflow-hidden shadow-xl relative group">
              {/* Badges sur l'image (Code ETG + Contexte + Difficulté) */}
              <div className="absolute top-1.5 left-1.5 right-1.5 z-10 flex items-center justify-between gap-1 pointer-events-none">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="rounded-md bg-slate-950/85 border border-yellow-400/60 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black text-yellow-300 shadow shrink-0">
                    {currentQuestion.codeRef}
                  </span>
                  {currentQuestion.visual.contextBadge && (
                    <span className="rounded-md bg-slate-950/85 border border-sky-400/40 px-1.5 py-0.5 text-[9px] sm:text-[10px] font-bold text-sky-200 shadow truncate">
                      {currentQuestion.visual.contextBadge}
                    </span>
                  )}
                </div>

                <span
                  className={`rounded-md px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black uppercase shadow shrink-0 ${
                    currentQuestion.difficulty === 'Piège Examen'
                      ? 'bg-rose-500 text-white'
                      : currentQuestion.difficulty === 'Moyen'
                      ? 'bg-amber-400 text-slate-950'
                      : 'bg-emerald-400 text-slate-950'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>

              {/* Scène visuelle 100% illustrée en ratio 16:9 adapté au mode portrait */}
              <div
                onClick={() => setZoomedImage((z) => !z)}
                className="relative w-full aspect-[16/9] max-h-[20dvh] sm:max-h-[25dvh] md:max-h-none md:aspect-auto md:flex-1 flex items-center justify-center overflow-hidden cursor-zoom-in bg-[#03091a]"
              >
                <div
                  className={`w-full h-full transition-transform duration-300 ${
                    zoomedImage ? 'scale-125 cursor-zoom-out' : 'scale-100'
                  }`}
                >
                  <CodeRouteVisual visual={currentQuestion.visual} />
                </div>
              </div>

              {/* Bandeau légende de la photo + boutons Zoom & Plein Écran */}
              <div className="shrink-0 flex items-center justify-between gap-1.5 bg-slate-950/95 border-t border-blue-500/30 px-2 py-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-blue-200 truncate">
                  📷 {currentQuestion.visual.caption}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setZoomedImage((z) => !z)}
                    className="inline-flex items-center gap-0.5 rounded bg-blue-900/70 hover:bg-yellow-400 hover:text-slate-950 px-1.5 py-0.5 text-[10px] font-bold text-white transition"
                    title="Zoomer x1.25 dans le cadre"
                  >
                    {zoomedImage ? (
                      <>
                        <ZoomOut className="h-3 w-3" />
                        <span className="hidden xs:inline">100%</span>
                      </>
                    ) : (
                      <>
                        <ZoomIn className="h-3 w-3" />
                        <span className="hidden xs:inline">Zoom</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsFullscreenSlide(true)}
                    className="inline-flex items-center gap-0.5 rounded bg-yellow-400 hover:bg-yellow-300 px-1.5 py-0.5 text-[10px] font-black text-slate-950 transition shadow"
                    title="Agrandir la diapositive en plein écran"
                  >
                    <Maximize2 className="h-3 w-3" />
                    <span>Loupe</span>
                  </button>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE / BAS PORTRAIT (7/12) : Énoncé + 4 Propositions A / B / C / D + Explication */}
            <div className="md:col-span-7 flex flex-col justify-between gap-1.5 sm:gap-2">
              {/* En-tête de la question */}
              <div className="rounded-xl border border-blue-400/35 bg-[#040b1e]/95 px-2.5 py-1.5 sm:px-4 sm:py-2.5 shadow-inner">
                <div className="flex items-center justify-between gap-2 mb-0.5">
                  <span className="text-[10px] sm:text-xs font-black uppercase tracking-wide text-yellow-400 truncate">
                    {currentQuestion.theme}
                  </span>
                  <span className="text-[10px] sm:text-xs font-bold text-blue-300/80 shrink-0">
                    Diapo {(currentIndex % filteredQuestions.length) + 1} /{' '}
                    {filteredQuestions.length}
                  </span>
                </div>
                <h2 className="text-xs sm:text-base font-black text-white leading-snug">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Grille des 4 boutons de télécommande Code de la route (A, B, C, D) */}
              <div className="grid grid-cols-1 gap-1 sm:gap-1.5">
                {currentQuestion.options.map((optText, idx) => {
                  const isCorrect = idx === currentQuestion.correct_index;
                  const isChosen = idx === selectedIndex;

                  let btnStyle =
                    'border-blue-400/35 bg-blue-950/75 hover:bg-blue-900/85 hover:border-yellow-400 text-white';
                  let letterBadge = 'bg-yellow-400 text-blue-950';

                  if (isRevealed) {
                    if (isCorrect) {
                      btnStyle =
                        'border-emerald-400 bg-emerald-500/25 text-emerald-50 ring-1 ring-emerald-400/60';
                      letterBadge = 'bg-emerald-400 text-slate-950';
                    } else if (isChosen && !isCorrect) {
                      btnStyle =
                        'border-rose-400 bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/50';
                      letterBadge = 'bg-rose-500 text-white';
                    } else {
                      btnStyle =
                        'border-blue-900/40 bg-[#040b1e]/40 text-blue-300/45 opacity-55';
                      letterBadge = 'bg-blue-950 text-blue-400/40';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectOption(idx)}
                      disabled={isRevealed}
                      className={`flex items-center justify-between gap-2 rounded-xl border-2 px-2.5 py-1.5 sm:px-3 sm:py-2 text-left transition-all ${btnStyle} ${
                        !isRevealed
                          ? 'active:scale-[0.99] cursor-pointer'
                          : 'cursor-default'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`flex h-5 w-5 sm:h-7 sm:w-7 shrink-0 items-center justify-center rounded-md sm:rounded-lg text-[11px] sm:text-sm font-black shadow ${letterBadge}`}
                        >
                          {OPTION_LETTERS[idx]}
                        </span>
                        <span className="text-[11px] sm:text-sm font-bold leading-snug">
                          {optText}
                        </span>
                      </div>

                      {isRevealed && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-emerald-400" />
                      )}
                      {isRevealed && isChosen && !isCorrect && (
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0 text-rose-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Correction officielle & Barème de points/amende */}
              {isRevealed ? (
                <div
                  className={`rounded-xl border px-2.5 py-1.5 sm:px-3 sm:py-2 shadow-lg animate-fadeIn ${
                    selectedIndex === currentQuestion.correct_index
                      ? 'border-emerald-400/70 bg-emerald-950/45'
                      : 'border-rose-400/70 bg-rose-950/45'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1.5 mb-0.5">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                        selectedIndex === currentQuestion.correct_index
                          ? 'bg-emerald-400 text-slate-950'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {selectedIndex === currentQuestion.correct_index
                        ? '✅ Bonne réponse (0 faute)'
                        : `❌ Faute d'examen (Réponse ${OPTION_LETTERS[currentQuestion.correct_index]})`}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-yellow-300">
                      Correction officielle :
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-blue-50 leading-snug">
                    {currentQuestion.explanation}
                  </p>
                  {currentQuestion.penaltyInfo && (
                    <p className="mt-1 inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-extrabold text-amber-300">
                      <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-rose-400" />
                      <span>{currentQuestion.penaltyInfo}</span>
                    </p>
                  )}
                </div>
              ) : (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedIndex(currentQuestion.correct_index);
                      playCorrectSound(soundEnabled);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold text-yellow-300/80 hover:text-yellow-300 transition"
                  >
                    <Eye className="h-3 w-3" />
                    <span>Révéler la correction (jeu à l’oral)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Barre du bas FIXE (shrink-0) : Attribution rapide des points aux équipes + Diapo suivante */}
        <div className="shrink-0 pt-1.5 mt-1.5 border-t border-blue-500/30 flex items-center justify-between gap-1.5 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-black uppercase text-yellow-300 mr-0.5">
              <Award className="h-3.5 w-3.5 text-yellow-400" />
              +1 pt :
            </span>
            {teams.map((team, idx) => {
              const isAwarded = Boolean(awardedTeams[team.id]);
              const tag = teams.length === 4 ? `J${idx + 1}` : `E${idx + 1}`;
              return (
                <button
                  key={team.id}
                  type="button"
                  onClick={() => handleToggleAwardTeam(team.id)}
                  className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] sm:text-xs font-black transition-all ${
                    isAwarded
                      ? 'bg-emerald-400 text-slate-950 shadow scale-105'
                      : 'bg-blue-900/75 hover:bg-yellow-400 hover:text-blue-950 text-white border border-blue-400/40'
                  }`}
                >
                  <span>{isAwarded ? '✓ +1' : '+1'}</span>
                  <span className="rounded bg-yellow-400/25 px-1 text-[9px] sm:text-[10px] text-yellow-300">
                    {tag}
                  </span>
                  <span className="truncate max-w-[60px] sm:max-w-[110px]">
                    {team.name}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNextQuestion}
            className="shimmer-btn relative overflow-hidden inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-yellow-400 px-3 py-1.5 sm:px-5 sm:py-2 text-xs sm:text-sm font-black uppercase tracking-wide text-blue-950 shadow-lg shadow-yellow-400/25 active:scale-95 transition-all ml-auto"
          >
            <span>Diapo Suivante</span>
            <ArrowRight className="h-4 w-4 stroke-[2.5]" />
          </button>
        </div>
      </section>

      {/* 4. Modale Loupe Plein Écran pour la Diapositive Code de la Route (idéal en mode portrait) */}
      {isFullscreenSlide && (
        <div
          data-no-pull-refresh="true"
          onClick={() => setIsFullscreenSlide(false)}
          className="fixed inset-0 z-[100000] flex flex-col justify-between bg-slate-950/95 backdrop-blur-md p-3 sm:p-6 select-none animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex items-center justify-between gap-2 border-b border-blue-500/30 pb-2.5"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="rounded-lg bg-yellow-400 px-2 py-0.5 text-xs font-black text-blue-950">
                {currentQuestion.codeRef}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white truncate">
                {currentQuestion.visual.caption}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreenSlide(false)}
              className="inline-flex items-center gap-1 rounded-xl border border-white/25 bg-white/10 hover:bg-rose-500 px-3 py-1.5 text-xs font-black text-white transition shrink-0"
            >
              <X className="h-4 w-4" />
              <span>Fermer</span>
            </button>
          </div>

          <div
            onClick={(e) => e.stopPropagation()}
            className="flex-1 min-h-0 flex flex-col items-center justify-center gap-3 my-auto"
          >
            <div className="w-full max-w-4xl aspect-[16/9] rounded-2xl border-2 border-yellow-400/60 bg-[#03091a] overflow-hidden shadow-2xl">
              <CodeRouteVisual visual={currentQuestion.visual} />
            </div>
            <div className="w-full max-w-2xl rounded-xl border border-blue-400/35 bg-[#05102e]/95 p-3 text-center">
              <p className="text-xs sm:text-base font-black text-white">
                {currentQuestion.question}
              </p>
            </div>
          </div>

          <div className="text-center text-[11px] font-bold text-blue-300/80">
            Touchez « Fermer » pour revenir au boîtier de réponse A / B / C / D
          </div>
        </div>
      )}
    </div>
  );
}
