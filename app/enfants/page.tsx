'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import {
  KIDS_QUESTIONS,
  KIDS_THEMES_META,
  type KidsQuestion,
  type KidsTheme,
} from '@/lib/kids-questions';
import {
  ArrowLeft,
  ArrowRight,
  Star,
  Volume2,
  VolumeX,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trophy,
  Eye,
  Speech,
  Plus,
  Minus,
} from 'lucide-react';
import {
  playCorrectSound,
  playWrongSound,
  playPointSound,
} from '@/lib/sound';

interface KidPlayer {
  id: string;
  name: string;
  avatar: string;
  stars: number;
}

const DEFAULT_KID_PLAYERS: KidPlayer[] = [
  { id: 'k1', name: 'Enfant 1', avatar: '🦁', stars: 0 },
  { id: 'k2', name: 'Enfant 2', avatar: '🐼', stars: 0 },
];

const KID_AVATARS = ['🦁', '🐼', '🦊', '🐸', '🦄', '🐨', '🐯', '🐰'];

function shuffleList<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Illustrations vectorielles SVG sur-mesure pour les questions visuelles (JO, Ferme, Terrain de Sport)
 */
function SpecialVisualSvg({ type }: { type?: string }) {
  if (type === 'olympic_rings') {
    return (
      <svg
        viewBox="0 0 320 130"
        className="h-24 sm:h-32 w-auto drop-shadow-xl"
        aria-label="Les 5 anneaux olympiques"
      >
        {/* Rangée du haut : Bleu, Noir, Rouge */}
        <circle
          cx="70"
          cy="50"
          r="34"
          fill="none"
          stroke="#0081C8"
          strokeWidth="9"
        />
        <circle
          cx="160"
          cy="50"
          r="34"
          fill="none"
          stroke="#1E293B"
          strokeWidth="9"
        />
        <circle
          cx="250"
          cy="50"
          r="34"
          fill="none"
          stroke="#EE334E"
          strokeWidth="9"
        />
        {/* Rangée du bas : Jaune, Vert */}
        <circle
          cx="115"
          cy="82"
          r="34"
          fill="none"
          stroke="#FCB131"
          strokeWidth="9"
        />
        <circle
          cx="205"
          cy="82"
          r="34"
          fill="none"
          stroke="#00A651"
          strokeWidth="9"
        />
      </svg>
    );
  }

  if (type === 'podium') {
    return (
      <svg
        viewBox="0 0 260 125"
        className="h-24 sm:h-32 w-auto drop-shadow-xl"
        aria-label="Podium olympique"
      >
        {/* 2e place Argent */}
        <rect
          x="20"
          y="55"
          width="68"
          height="60"
          rx="6"
          fill="#CBD5E1"
          stroke="#F8FAFC"
          strokeWidth="2"
        />
        <text
          x="54"
          y="92"
          textAnchor="middle"
          fontSize="24"
          fontWeight="900"
          fill="#1E293B"
        >
          2
        </text>
        <text x="54" y="44" textAnchor="middle" fontSize="28">
          🥈
        </text>

        {/* 1re place Or */}
        <rect
          x="96"
          y="30"
          width="68"
          height="85"
          rx="6"
          fill="#FACC15"
          stroke="#FEF08A"
          strokeWidth="3"
        />
        <text
          x="130"
          y="78"
          textAnchor="middle"
          fontSize="30"
          fontWeight="900"
          fill="#0F172A"
        >
          1
        </text>
        <text x="130" y="22" textAnchor="middle" fontSize="32">
          🥇
        </text>

        {/* 3e place Bronze */}
        <rect
          x="172"
          y="70"
          width="68"
          height="45"
          rx="6"
          fill="#D97706"
          stroke="#FDE68A"
          strokeWidth="2"
        />
        <text
          x="206"
          y="100"
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          fill="#FFFBEB"
        >
          3
        </text>
        <text x="206" y="58" textAnchor="middle" fontSize="26">
          🥉
        </text>
      </svg>
    );
  }

  return null;
}

export default function KidsQuizPage() {
  const [selectedTheme, setSelectedTheme] = useState<'ALL' | KidsTheme>('ALL');
  const [questions, setQuestions] = useState<KidsQuestion[]>(() =>
    shuffleList(KIDS_QUESTIONS)
  );
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [totalStars, setTotalStars] = useState<number>(0);
  const [kidPlayers, setKidPlayers] = useState<KidPlayer[]>(DEFAULT_KID_PLAYERS);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [pokemonMysteryMode, setPokemonMysteryMode] = useState<boolean>(false);
  const [imgError, setImgError] = useState<boolean>(false);
  const [editingKidId, setEditingKidId] = useState<string | null>(null);
  const [draftKidName, setDraftKidName] = useState<string>('');

  // Filtrage par thème
  const filteredQuestions = useMemo(() => {
    if (selectedTheme === 'ALL') return questions;
    return questions.filter((q) => q.theme === selectedTheme);
  }, [questions, selectedTheme]);

  const currentQuestion = useMemo(() => {
    if (filteredQuestions.length === 0) return null;
    return filteredQuestions[currentIndex % filteredQuestions.length];
  }, [filteredQuestions, currentIndex]);

  useEffect(() => {
    setSelectedOption(null);
    setImgError(false);
  }, [currentQuestion?.id]);

  // Lecture vocale de la question en français (idéal pour les enfants)
  const handleSpeakQuestion = useCallback(() => {
    if (!currentQuestion || typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const cleanOptions = currentQuestion.options
        .map((opt, idx) => `Réponse ${['A', 'B', 'C', 'D'][idx]} : ${opt}`)
        .join('. ');
      const utterance = new SpeechSynthesisUtterance(
        `${currentQuestion.question} ... ${cleanOptions}`
      );
      utterance.lang = 'fr-FR';
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech errors
    }
  }, [currentQuestion]);

  const handleSelectOption = (idx: number) => {
    if (!currentQuestion || selectedOption !== null) return;
    setSelectedOption(idx);

    const isCorrect = idx === currentQuestion.correct_index;
    if (isCorrect) {
      setTotalStars((s) => s + 1);
      playCorrectSound(soundEnabled);
    } else {
      playWrongSound(soundEnabled);
    }
  };

  const handleNextQuestion = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSelectedOption(null);
    setImgError(false);
    setCurrentIndex((i) => i + 1);
  };

  const handleUpdateKidStars = (id: string, delta: number) => {
    if (delta > 0) {
      playPointSound(soundEnabled);
      setTotalStars((s) => s + delta);
    }
    setKidPlayers((prev) =>
      prev.map((k) =>
        k.id === id ? { ...k, stars: Math.max(0, k.stars + delta) } : k
      )
    );
  };

  const handleAddKidPlayer = () => {
    if (kidPlayers.length >= 4) return;
    const nextIdx = kidPlayers.length;
    setKidPlayers((prev) => [
      ...prev,
      {
        id: `k_${Date.now()}`,
        name: `Enfant ${nextIdx + 1}`,
        avatar: KID_AVATARS[nextIdx % KID_AVATARS.length],
        stars: 0,
      },
    ]);
  };

  const handleResetKids = () => {
    setTotalStars(0);
    setKidPlayers((prev) => prev.map((k) => ({ ...k, stars: 0 })));
    setQuestions(shuffleList(KIDS_QUESTIONS));
    setCurrentIndex(0);
    setSelectedOption(null);
  };

  const isRevealed = selectedOption !== null;
  const shouldSilhouette =
    currentQuestion?.theme === 'Pokémon' &&
    pokemonMysteryMode &&
    !isRevealed;

  return (
    <div className="h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col justify-between select-none bg-gradient-to-b from-[#0b1f4d] via-[#08173a] to-[#040b1e]">
      {/* 1. HEADER MODE ENFANT */}
      <header className="shrink-0 border-b border-yellow-400/40 bg-[#050d26]/95 px-2.5 sm:px-4 py-2">
        <div className="mx-auto max-w-5xl flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Link
              href="/"
              className="inline-flex items-center gap-1 rounded-xl border border-blue-400/40 bg-blue-950/80 hover:bg-yellow-400 hover:text-blue-950 px-2.5 py-1.5 text-xs font-black text-blue-100 transition"
              title="Retourner au Quiz des Trentenaires"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Quiz Adultes</span>
            </Link>

            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-lg sm:text-xl">🎈</span>
              <h1 className="text-sm sm:text-lg font-black uppercase tracking-tight text-white truncate">
                QUIZ <span className="text-yellow-400">ENFANTS</span>
              </h1>
            </div>
          </div>

          {/* Compteur d'étoiles + Option Ombre Pokémon + Son + Reset */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-300 to-amber-500 px-3 py-1 text-xs font-black text-blue-950 shadow">
              <Star className="h-3.5 w-3.5 fill-blue-950" />
              <span>
                {totalStars} étoile{totalStars > 1 ? 's' : ''}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setPokemonMysteryMode((m) => !m)}
              className={`hidden md:inline-flex items-center gap-1 rounded-xl border px-2.5 py-1 text-[11px] font-black transition ${
                pokemonMysteryMode
                  ? 'border-yellow-300 bg-yellow-400 text-blue-950'
                  : 'border-blue-400/35 bg-blue-950/70 text-blue-200 hover:text-yellow-300'
              }`}
              title="Cacher les Pokémon en ombre chinoise avant la réponse"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Ombre Pokémon</span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled((s) => !s)}
              className={`flex h-8 w-8 items-center justify-center rounded-xl border transition ${
                soundEnabled
                  ? 'border-yellow-400/60 bg-yellow-400/15 text-yellow-300'
                  : 'border-blue-500/30 bg-blue-950/70 text-blue-300/50'
              }`}
              title={soundEnabled ? 'Couper le son' : 'Activer le son'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4 text-yellow-400" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </button>

            <button
              type="button"
              onClick={handleResetKids}
              className="inline-flex items-center gap-1 rounded-xl border border-blue-400/35 bg-blue-900/50 px-2.5 py-1.5 text-xs font-black text-blue-100 hover:bg-yellow-400 hover:text-blue-950 transition"
              title="Recommencer à zéro"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. CONTENU PRINCIPAL SANS SCROLL */}
      <main className="mx-auto w-full max-w-5xl flex-1 min-h-0 flex flex-col justify-between gap-2 px-2.5 py-2 sm:px-4 sm:py-3">
        {/* A. BARRE DES THÈMES ILLUSTRÉS (Tous, Ferme, Animaux, JO, Sport, Pokémon) */}
        <section className="shrink-0 rounded-2xl border border-blue-400/35 bg-[#091942]/90 p-2 shadow-lg space-y-2">
          <div className="grid grid-cols-6 gap-1.5">
            {KIDS_THEMES_META.map((th) => {
              const active = selectedTheme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  onClick={() => {
                    setSelectedTheme(th.id);
                    setCurrentIndex(0);
                  }}
                  className={`flex flex-col sm:flex-row items-center justify-center gap-1 rounded-xl border-2 py-1.5 px-1.5 text-xs sm:text-sm font-black transition-all ${
                    active
                      ? `bg-gradient-to-r ${th.colorClass} scale-[1.03] shadow-md`
                      : 'border-blue-500/30 bg-[#05102e]/90 text-blue-100 hover:border-yellow-400/60'
                  }`}
                >
                  <span className="text-base sm:text-lg leading-none">
                    {th.emoji}
                  </span>
                  <span className="truncate text-[10px] sm:text-xs font-black">
                    {th.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Mini-compteur d'étoiles par enfant (cliquable pour renommer) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-0.5">
            {kidPlayers.map((kid) => (
              <div
                key={kid.id}
                className="flex items-center justify-between gap-2 rounded-xl border border-yellow-400/40 bg-[#05102e]/90 px-2.5 py-1 min-w-[140px] shrink-0"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="text-base">{kid.avatar}</span>
                  {editingKidId === kid.id ? (
                    <input
                      type="text"
                      value={draftKidName}
                      onChange={(e) => setDraftKidName(e.target.value)}
                      onBlur={() => {
                        if (draftKidName.trim()) {
                          setKidPlayers((prev) =>
                            prev.map((k) =>
                              k.id === kid.id
                                ? { ...k, name: draftKidName.trim() }
                                : k
                            )
                          );
                        }
                        setEditingKidId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (draftKidName.trim()) {
                            setKidPlayers((prev) =>
                              prev.map((k) =>
                                k.id === kid.id
                                  ? { ...k, name: draftKidName.trim() }
                                  : k
                              )
                            );
                          }
                          setEditingKidId(null);
                        }
                      }}
                      autoFocus
                      maxLength={14}
                      className="w-20 rounded border border-yellow-400 bg-blue-950 px-1 py-0.5 text-xs font-bold text-white outline-none"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingKidId(kid.id);
                        setDraftKidName(kid.name);
                      }}
                      className="truncate text-xs font-extrabold text-white hover:text-yellow-300"
                      title="Cliquer pour changer le prénom"
                    >
                      {kid.name}
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-xs font-black text-yellow-300">
                    ⭐ {kid.stars}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleUpdateKidStars(kid.id, -1)}
                    disabled={kid.stars <= 0}
                    className="flex h-5 w-5 items-center justify-center rounded bg-blue-950 border border-blue-400/30 text-blue-200 disabled:opacity-30"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleUpdateKidStars(kid.id, 1)}
                    className="flex h-5 w-5 items-center justify-center rounded bg-yellow-400 text-blue-950 font-black"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}

            {kidPlayers.length < 4 && (
              <button
                type="button"
                onClick={handleAddKidPlayer}
                className="inline-flex items-center gap-1 rounded-xl border border-dashed border-yellow-400/50 px-2.5 py-1 text-xs font-extrabold text-yellow-300 hover:bg-yellow-400/15 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Ajouter un enfant</span>
              </button>
            )}
          </div>
        </section>

        {/* B. CARTE QUESTION VISUELLE (AVEC GRANDE IMAGE / ILLUSTRATION) */}
        {currentQuestion && (
          <section
            key={currentQuestion.id}
            className="relative flex-1 min-h-0 flex flex-col justify-between gap-2 overflow-hidden rounded-2xl border-2 border-yellow-400/55 bg-gradient-to-b from-[#0b1d48]/95 via-[#081538]/95 to-[#050d26]/95 p-3 sm:p-4 shadow-2xl animate-fadeIn"
          >
            {/* 1. CADRE IMAGE / ILLUSTRATION VISUELLE + ÉNONCÉ */}
            <div className="shrink-0 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center">
              {/* Cadre Image Illustré (5 colonnes sur tablette/desktop) */}
              <div
                className={`sm:col-span-5 relative flex flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-white/25 bg-gradient-to-br ${currentQuestion.visual.bgGradient} p-3 min-h-[130px] sm:min-h-[165px] shadow-xl`}
              >
                {/* Emojis de décor flottants */}
                <span className="absolute top-2 left-3 text-xl sm:text-2xl opacity-80 select-none">
                  {currentQuestion.visual.decorEmojis[0]}
                </span>
                <span className="absolute top-2 right-3 text-xl sm:text-2xl opacity-80 select-none">
                  {currentQuestion.visual.decorEmojis[1]}
                </span>

                {/* Image officielle (Pokémon) OU SVG spécial (JO / Podium) OU Grand Emoji */}
                {currentQuestion.visual.imageUrl && !imgError ? (
                  <img
                    src={currentQuestion.visual.imageUrl}
                    alt={currentQuestion.theme}
                    onError={() => setImgError(true)}
                    className={`h-24 sm:h-32 w-auto object-contain drop-shadow-2xl transition-all duration-500 ${
                      shouldSilhouette
                        ? 'brightness-0 contrast-200'
                        : 'scale-105'
                    }`}
                  />
                ) : currentQuestion.visual.specialSvg &&
                  (currentQuestion.visual.specialSvg === 'olympic_rings' ||
                    currentQuestion.visual.specialSvg === 'podium') ? (
                  <SpecialVisualSvg type={currentQuestion.visual.specialSvg} />
                ) : (
                  <div className="text-6xl sm:text-7xl drop-shadow-xl transform hover:scale-110 transition">
                    {currentQuestion.visual.mainEmoji}
                  </div>
                )}

                <span className="mt-1.5 rounded-full bg-black/45 backdrop-blur-sm border border-white/20 px-3 py-0.5 text-[11px] font-black text-white shadow">
                  {shouldSilhouette
                    ? '❓ Quel est ce Pokémon ?'
                    : currentQuestion.visual.badgeLabel}
                </span>
              </div>

              {/* Énoncé + Bouton Écouter la question (7 colonnes) */}
              <div className="sm:col-span-7 flex flex-col justify-between gap-2 rounded-2xl border border-blue-400/35 bg-[#040b1e]/90 p-3 sm:p-4 h-full">
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 px-3 py-0.5 text-xs font-black uppercase text-blue-950">
                    {currentQuestion.theme}
                  </span>

                  <button
                    type="button"
                    onClick={handleSpeakQuestion}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sky-400/50 bg-sky-500/20 hover:bg-sky-400 hover:text-slate-950 px-3 py-1 text-xs font-black text-sky-200 transition active:scale-95"
                    title="Lire la question à voix haute"
                  >
                    <Speech className="h-4 w-4" />
                    <span>🔊 Écouter</span>
                  </button>
                </div>

                <h2 className="text-base sm:text-xl font-black text-white leading-snug my-auto">
                  {currentQuestion.question}
                </h2>

                <div className="text-[11px] font-bold text-blue-200/75 flex items-center justify-between">
                  <span>Touchez la bonne image / réponse !</span>
                  <span>
                    Question {(currentIndex % filteredQuestions.length) + 1} /{' '}
                    {filteredQuestions.length}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. LES 4 GROS BOUTONS DE RÉPONSE ENFANTS */}
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
              <div className="my-auto space-y-2.5 py-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                  {currentQuestion.options.map((opt, idx) => {
                    const isCorrect = idx === currentQuestion.correct_index;
                    const isChosen = idx === selectedOption;

                    let cardStyle =
                      'border-blue-400/40 bg-blue-950/75 hover:bg-blue-900/80 hover:border-yellow-400 text-white';
                    let letterStyle = 'bg-yellow-400 text-blue-950';

                    if (isRevealed) {
                      if (isCorrect) {
                        cardStyle =
                          'border-emerald-400 bg-emerald-500/30 text-emerald-50 ring-2 ring-emerald-400 scale-[1.01]';
                        letterStyle = 'bg-emerald-400 text-slate-950';
                      } else if (isChosen && !isCorrect) {
                        cardStyle =
                          'border-rose-400 bg-rose-500/25 text-rose-100';
                        letterStyle = 'bg-rose-500 text-white';
                      } else {
                        cardStyle =
                          'border-blue-900/40 bg-[#040b1e]/40 text-blue-300/40 opacity-55';
                        letterStyle = 'bg-blue-950 text-blue-400/40';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={isRevealed}
                        className={`flex items-center justify-between gap-3 rounded-2xl border-2 px-4 py-3 text-left transition-all ${cardStyle} ${
                          !isRevealed
                            ? 'active:scale-95 cursor-pointer shadow-md'
                            : 'cursor-default'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-black shadow ${letterStyle}`}
                          >
                            {['A', 'B', 'C', 'D'][idx]}
                          </span>
                          <span className="text-base sm:text-lg font-extrabold leading-snug">
                            {opt}
                          </span>
                        </div>

                        {isRevealed && isCorrect && (
                          <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-400" />
                        )}
                        {isRevealed && isChosen && !isCorrect && (
                          <XCircle className="h-6 w-6 shrink-0 text-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Explication bienveillante pour les enfants */}
                {isRevealed && (
                  <div
                    className={`rounded-2xl border-2 px-3.5 py-2.5 shadow-lg animate-fadeIn ${
                      selectedOption === currentQuestion.correct_index
                        ? 'border-emerald-400 bg-emerald-950/50'
                        : 'border-amber-400 bg-amber-950/40'
                    }`}
                  >
                    <p className="text-xs sm:text-sm font-bold text-white leading-snug">
                      <span className="font-black text-yellow-300 mr-1.5">
                        {selectedOption === currentQuestion.correct_index
                          ? '🎉 BRAVO ! +1 Étoile ⭐ :'
                          : '💡 Bien essayé ! La bonne réponse était :'}
                      </span>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* 3. BARRE DU BAS : DONNER UNE ÉTOILE À UN ENFANT + QUESTION SUIVANTE */}
            <div className="shrink-0 pt-2 border-t border-blue-500/30 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-black text-yellow-300">
                  ⭐ +1 pour :
                </span>
                {kidPlayers.map((kid) => (
                  <button
                    key={kid.id}
                    type="button"
                    onClick={() => handleUpdateKidStars(kid.id, 1)}
                    className="inline-flex items-center gap-1 rounded-xl border border-yellow-400/50 bg-blue-950/90 hover:bg-yellow-400 hover:text-blue-950 px-2.5 py-1 text-xs font-black text-white transition active:scale-95"
                  >
                    <span>{kid.avatar}</span>
                    <span>{kid.name}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="shimmer-btn relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-yellow-400 px-5 py-2 text-xs sm:text-sm font-black uppercase tracking-wide text-blue-950 shadow-lg shadow-yellow-400/25 active:scale-95 transition ml-auto"
              >
                <span>Question Suivante</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
