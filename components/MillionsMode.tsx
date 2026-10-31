'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import type { QuizQuestionRecord } from '@/lib/supabase';
import {
  Trophy,
  Sparkles,
  PhoneCall,
  Users,
  RefreshCw,
  Scissors,
  ArrowRight,
  RotateCcw,
  ShieldCheck,
  Banknote,
  CheckCircle2,
  XCircle,
  Lightbulb,
  Tag,
  Music,
} from 'lucide-react';
import {
  playCorrectSound,
  playWrongSound,
  playSuspenseSound,
  playJokerSound,
  playPointSound,
  startMillionsZoukMusic,
  stopMillionsZoukMusic,
  setMillionsZoukStep,
} from '@/lib/sound';

interface MillionsModeProps {
  poolByLevel: Record<number, QuizQuestionRecord[]>;
  playedIds: string[];
  onMarkQuestionPlayed: (questionId: string) => void;
  soundEnabled: boolean;
}

export interface MillionStep {
  step: number; // 1..15
  amount: number;
  label: string;
  level: number; // 1..10 difficulty
  isSafeHaven: boolean;
  isJackpot?: boolean;
}

export const MILLION_LADDER: MillionStep[] = [
  { step: 1, amount: 100, label: '100 €', level: 1, isSafeHaven: false },
  { step: 2, amount: 200, label: '200 €', level: 1, isSafeHaven: false },
  { step: 3, amount: 300, label: '300 €', level: 2, isSafeHaven: false },
  { step: 4, amount: 500, label: '500 €', level: 2, isSafeHaven: false },
  {
    step: 5,
    amount: 1500,
    label: '1 500 €',
    level: 3,
    isSafeHaven: true,
  },
  { step: 6, amount: 3000, label: '3 000 €', level: 4, isSafeHaven: false },
  { step: 7, amount: 6000, label: '6 000 €', level: 4, isSafeHaven: false },
  { step: 8, amount: 12000, label: '12 000 €', level: 5, isSafeHaven: false },
  { step: 9, amount: 24000, label: '24 000 €', level: 6, isSafeHaven: false },
  {
    step: 10,
    amount: 48000,
    label: '48 000 €',
    level: 7,
    isSafeHaven: true,
  },
  { step: 11, amount: 72000, label: '72 000 €', level: 8, isSafeHaven: false },
  {
    step: 12,
    amount: 150000,
    label: '150 000 €',
    level: 8,
    isSafeHaven: false,
  },
  {
    step: 13,
    amount: 300000,
    label: '300 000 €',
    level: 9,
    isSafeHaven: false,
  },
  {
    step: 14,
    amount: 500000,
    label: '500 000 €',
    level: 9,
    isSafeHaven: false,
  },
  {
    step: 15,
    amount: 1000000,
    label: '1 000 000 €',
    level: 10,
    isSafeHaven: true,
    isJackpot: true,
  },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

const STORAGE_MILLIONS_STATS = '7ter:millions:stats:v1';

interface MillionsRecord {
  bestAmount: number;
  millionWins: number;
  gamesPlayed: number;
}

export default function MillionsMode({
  poolByLevel,
  playedIds,
  onMarkQuestionPlayed,
  soundEnabled,
}: MillionsModeProps) {
  const [currentStep, setCurrentStep] = useState<number>(1); // 1 to 15
  const [currentQuestion, setCurrentQuestion] =
    useState<QuizQuestionRecord | null>(null);
  const [pendingOption, setPendingOption] = useState<number | null>(null); // "Dernier mot ?" (orange)
  const [lockedOption, setLockedOption] = useState<number | null>(null); // Validé
  const [runStatus, setRunStatus] = useState<
    'playing' | 'step_won' | 'failed' | 'walked_away' | 'millionaire'
  >('playing');

  // État des 4 Jokers (true = disponible, false = déjà utilisé sur cette partie)
  const [jokers, setJokers] = useState({
    fiftyFifty: true,
    audience: true,
    phoneFriend: true,
    switchQuestion: true,
  });

  // Effets actifs des jokers sur la question en cours
  const [hiddenOptions, setHiddenOptions] = useState<number[]>([]);
  const [audiencePoll, setAudiencePoll] = useState<number[] | null>(null);
  const [friendAdvice, setFriendAdvice] = useState<{
    friendName: string;
    message: string;
  } | null>(null);
  const [zoukMusicEnabled, setZoukMusicEnabled] = useState<boolean>(true);

  const [stats, setStats] = useState<MillionsRecord>({
    bestAmount: 0,
    millionWins: 0,
    gamesPlayed: 1,
  });

  // Lancement / arrêt automatique de la musique Zouk "Qui veut gagner des millions"
  useEffect(() => {
    if (soundEnabled && zoukMusicEnabled && runStatus === 'playing') {
      startMillionsZoukMusic(true, currentStep);
    } else {
      stopMillionsZoukMusic();
    }
    return () => {
      stopMillionsZoukMusic();
    };
  }, [soundEnabled, zoukMusicEnabled, runStatus]);

  useEffect(() => {
    setMillionsZoukStep(currentStep);
  }, [currentStep]);

  // Chargement des records depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MILLIONS_STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.bestAmount === 'number') {
          setStats(parsed);
        }
      }
    } catch {
      // Ignore
    }
  }, []);

  const saveStats = useCallback((next: MillionsRecord) => {
    setStats(next);
    try {
      localStorage.setItem(STORAGE_MILLIONS_STATS, JSON.stringify(next));
    } catch {
      // Ignore
    }
  }, []);

  // Tirage d'une question correspondant au niveau du palier
  const pickQuestionForStep = useCallback(
    (stepNumber: number, excludeId?: string): QuizQuestionRecord | null => {
      const stepInfo =
        MILLION_LADDER.find((s) => s.step === stepNumber) || MILLION_LADDER[0];
      const list = poolByLevel[stepInfo.level] || [];
      const playedSet = new Set(playedIds);
      const candidates = list.filter(
        (q) => !playedSet.has(q.id) && q.id !== excludeId
      );
      const pool =
        candidates.length > 0
          ? candidates
          : list.filter((q) => q.id !== excludeId);
      if (pool.length === 0) return list[0] || null;
      return pool[Math.floor(Math.random() * pool.length)];
    },
    [poolByLevel, playedIds]
  );

  // Initialisation de la première question
  useEffect(() => {
    if (!currentQuestion) {
      const q = pickQuestionForStep(1);
      if (q) {
        setCurrentQuestion(q);
      }
    }
  }, [currentQuestion, pickQuestionForStep]);

  const currentStepInfo = useMemo(
    () =>
      MILLION_LADDER.find((s) => s.step === currentStep) || MILLION_LADDER[0],
    [currentStep]
  );

  // Gain acquis si le joueur décide de s'arrêter avant de répondre
  const currentWalkAwayAmount = useMemo(() => {
    if (currentStep <= 1) return 0;
    const prev = MILLION_LADDER.find((s) => s.step === currentStep - 1);
    return prev ? prev.amount : 0;
  }, [currentStep]);

  // Palier de sécurité garanti en cas de mauvaise réponse
  const guaranteedSafeHavenAmount = useMemo(() => {
    if (currentStep > 10) return 48000;
    if (currentStep > 5) return 1500;
    return 0;
  }, [currentStep]);

  const formatEuros = (amount: number) =>
    amount.toLocaleString('fr-FR') + ' €';

  // ============================================================================
  // ACTIONS DES 4 JOKERS
  // ============================================================================
  const handleUseFiftyFifty = () => {
    if (
      !jokers.fiftyFifty ||
      !currentQuestion ||
      runStatus !== 'playing' ||
      lockedOption !== null
    ) {
      return;
    }
    playJokerSound(soundEnabled);

    const wrongIndices = [0, 1, 2, 3].filter(
      (i) => i !== currentQuestion.correct_index
    );
    // Mélanger les 3 mauvaises réponses et en cacher 2
    const shuffledWrong = wrongIndices.sort(() => Math.random() - 0.5);
    const toHide = shuffledWrong.slice(0, 2);

    setHiddenOptions(toHide);
    if (pendingOption !== null && toHide.includes(pendingOption)) {
      setPendingOption(null);
    }
    setJokers((prev) => ({ ...prev, fiftyFifty: false }));
  };

  const handleUseAudience = () => {
    if (
      !jokers.audience ||
      !currentQuestion ||
      runStatus !== 'playing' ||
      lockedOption !== null
    ) {
      return;
    }
    playJokerSound(soundEnabled);

    const correctIdx = currentQuestion.correct_index;
    const visibleIndices = [0, 1, 2, 3].filter(
      (i) => !hiddenOptions.includes(i)
    );

    // Plus la question est facile, plus le public vote massivement pour la bonne réponse
    const baseCorrectPct =
      currentStep <= 5
        ? 76
        : currentStep <= 10
        ? 58
        : 44;
    const correctPct = Math.min(
      92,
      baseCorrectPct + Math.floor(Math.random() * 12)
    );

    const result = [0, 0, 0, 0];
    result[correctIdx] = correctPct;

    let remaining = 100 - correctPct;
    const otherVisible = visibleIndices.filter((i) => i !== correctIdx);
    otherVisible.forEach((idx, pos) => {
      if (pos === otherVisible.length - 1) {
        result[idx] = remaining;
      } else {
        const share = Math.floor(Math.random() * (remaining + 1));
        result[idx] = share;
        remaining -= share;
      }
    });

    setAudiencePoll(result);
    setJokers((prev) => ({ ...prev, audience: false }));
  };

  const handleUsePhoneFriend = () => {
    if (
      !jokers.phoneFriend ||
      !currentQuestion ||
      runStatus !== 'playing' ||
      lockedOption !== null
    ) {
      return;
    }
    playJokerSound(soundEnabled);

    const friends = [
      'Maxime (l’encyclopédie du groupe)',
      'Sarah (imbattable sur les années 90)',
      'Julien (le roi des blind-tests)',
      'Camille (toujours au taquet)',
    ];
    const friendName = friends[currentStep % friends.length];
    const correctLetter = OPTION_LETTERS[currentQuestion.correct_index];
    const correctText = currentQuestion.options[currentQuestion.correct_index];

    const confidence =
      currentStep <= 10 ? 'à 95%' : 'à 80%';

    setFriendAdvice({
      friendName,
      message: `« Allô ! Écoute, ne cherche pas plus loin : je suis sûr ${confidence} que c’est la réponse ${correctLetter} (${correctText}). ${currentQuestion.explanation.slice(
        0,
        95
      )}… Fonce ! »`,
    });
    setJokers((prev) => ({ ...prev, phoneFriend: false }));
  };

  const handleUseSwitchQuestion = () => {
    if (
      !jokers.switchQuestion ||
      !currentQuestion ||
      runStatus !== 'playing' ||
      lockedOption !== null
    ) {
      return;
    }
    playJokerSound(soundEnabled);

    const replacement = pickQuestionForStep(currentStep, currentQuestion.id);
    if (replacement) {
      onMarkQuestionPlayed(replacement.id);
      setCurrentQuestion(replacement);
      setPendingOption(null);
      setHiddenOptions([]);
      setAudiencePoll(null);
      setFriendAdvice(null);
      setJokers((prev) => ({ ...prev, switchQuestion: false }));
    }
  };

  // ============================================================================
  // SÉLECTION & VALIDATION ("C'EST VOTRE DERNIER MOT ?")
  // ============================================================================
  const handleClickOption = (idx: number) => {
    if (
      runStatus !== 'playing' ||
      lockedOption !== null ||
      hiddenOptions.includes(idx)
    ) {
      return;
    }
    setPendingOption(idx);
    playSuspenseSound(soundEnabled);
  };

  const handleConfirmFinalAnswer = () => {
    if (
      pendingOption === null ||
      !currentQuestion ||
      runStatus !== 'playing'
    ) {
      return;
    }

    setLockedOption(pendingOption);
    onMarkQuestionPlayed(currentQuestion.id);

    const isCorrect = pendingOption === currentQuestion.correct_index;
    if (isCorrect) {
      playCorrectSound(soundEnabled);
      const wonAmount = currentStepInfo.amount;
      if (currentStep >= 15) {
        setRunStatus('millionaire');
        saveStats({
          bestAmount: Math.max(stats.bestAmount, 1000000),
          millionWins: stats.millionWins + 1,
          gamesPlayed: stats.gamesPlayed,
        });
      } else {
        setRunStatus('step_won');
        if (wonAmount > stats.bestAmount) {
          saveStats({
            ...stats,
            bestAmount: wonAmount,
          });
        }
      }
    } else {
      playWrongSound(soundEnabled);
      setRunStatus('failed');
      if (guaranteedSafeHavenAmount > stats.bestAmount) {
        saveStats({
          ...stats,
          bestAmount: guaranteedSafeHavenAmount,
        });
      }
    }
  };

  const handleWalkAway = () => {
    if (runStatus !== 'playing' || currentStep <= 1) return;
    playPointSound(soundEnabled);
    setRunStatus('walked_away');
    if (currentWalkAwayAmount > stats.bestAmount) {
      saveStats({
        ...stats,
        bestAmount: currentWalkAwayAmount,
      });
    }
  };

  const handleAdvanceToNextStep = () => {
    const nextStep = Math.min(15, currentStep + 1);
    const nextQ = pickQuestionForStep(nextStep, currentQuestion?.id);
    setCurrentStep(nextStep);
    setCurrentQuestion(nextQ);
    setPendingOption(null);
    setLockedOption(null);
    setHiddenOptions([]);
    setAudiencePoll(null);
    setFriendAdvice(null);
    setRunStatus('playing');
  };

  const handleStartNewMillionGame = () => {
    const firstQ = pickQuestionForStep(1);
    setCurrentStep(1);
    setCurrentQuestion(firstQ);
    setPendingOption(null);
    setLockedOption(null);
    setHiddenOptions([]);
    setAudiencePoll(null);
    setFriendAdvice(null);
    setJokers({
      fiftyFifty: true,
      audience: true,
      phoneFriend: true,
      switchQuestion: true,
    });
    setRunStatus('playing');
    saveStats({
      ...stats,
      gamesPlayed: stats.gamesPlayed + 1,
    });
  };

  if (!currentQuestion) {
    return (
      <div className="flex-1 flex items-center justify-center rounded-2xl border border-blue-500/40 bg-[#091942]/90 p-6 text-center">
        <p className="text-yellow-300 font-bold text-sm">
          Préparation du plateau Qui Veut Gagner des Millions…
        </p>
      </div>
    );
  }

  const isRevealed =
    runStatus === 'step_won' ||
    runStatus === 'failed' ||
    runStatus === 'millionaire' ||
    runStatus === 'walked_away';

  return (
    <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-2.5 overflow-hidden">
      {/* ====================================================================
          COLONNE PRINCIPALE : JOKERS + ÉNONCÉ + 4 LOSANGES DE RÉPONSE
         ==================================================================== */}
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 overflow-hidden">
        {/* 1. BARRE SUPÉRIEURE : LES 4 JOKERS + INFOS GAIN EN JEU */}
        <section className="shrink-0 rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-r from-[#091b46]/95 via-[#071436]/95 to-[#091b46]/95 px-3 py-2 shadow-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Gain de la question actuelle + Toggle Musique Zouk */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-2.5 py-1 text-xs sm:text-sm font-black uppercase text-blue-950 shadow">
                <Banknote className="h-4 w-4" />
                <span>
                  Palier {currentStep}/15 · {currentStepInfo.label}
                </span>
              </span>

              <button
                type="button"
                onClick={() => setZoukMusicEnabled((z) => !z)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-[11px] font-black transition active:scale-95 ${
                  zoukMusicEnabled && soundEnabled
                    ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow'
                    : 'border-blue-500/35 bg-blue-950/70 text-blue-300/60'
                }`}
                title="Activer / couper le thème Qui veut gagner des millions version Zouk Antillais"
              >
                <Music className="h-3.5 w-3.5" />
                <span>🌴 Zouk {zoukMusicEnabled && soundEnabled ? 'ON' : 'OFF'}</span>
              </button>

              <span className="hidden md:inline-flex items-center gap-1 rounded-lg border border-blue-400/35 bg-blue-950/80 px-2 py-1 text-[11px] font-bold text-blue-200">
                <ShieldCheck className="h-3.5 w-3.5 text-yellow-400" />
                <span>
                  Garanti : {formatEuros(guaranteedSafeHavenAmount)}
                </span>
              </span>
            </div>

            {/* LES 4 BOUTONS JOKERS */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleUseFiftyFifty}
                disabled={!jokers.fiftyFifty || runStatus !== 'playing'}
                className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-[11px] sm:text-xs font-black transition ${
                  jokers.fiftyFifty
                    ? 'border-yellow-400 bg-gradient-to-b from-blue-800 to-blue-950 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950 shadow cursor-pointer active:scale-95'
                    : 'border-blue-900/40 bg-blue-950/40 text-blue-400/30 line-through cursor-not-allowed'
                }`}
                title="Joker 50:50 — Élimine 2 mauvaises réponses"
              >
                <Scissors className="h-3.5 w-3.5" />
                <span>50:50</span>
              </button>

              <button
                type="button"
                onClick={handleUseAudience}
                disabled={!jokers.audience || runStatus !== 'playing'}
                className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-[11px] sm:text-xs font-black transition ${
                  jokers.audience
                    ? 'border-yellow-400 bg-gradient-to-b from-blue-800 to-blue-950 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950 shadow cursor-pointer active:scale-95'
                    : 'border-blue-900/40 bg-blue-950/40 text-blue-400/30 line-through cursor-not-allowed'
                }`}
                title="Joker Avis du Public — Sondage en pourcentages"
              >
                <Users className="h-3.5 w-3.5" />
                <span>Public</span>
              </button>

              <button
                type="button"
                onClick={handleUsePhoneFriend}
                disabled={!jokers.phoneFriend || runStatus !== 'playing'}
                className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-[11px] sm:text-xs font-black transition ${
                  jokers.phoneFriend
                    ? 'border-yellow-400 bg-gradient-to-b from-blue-800 to-blue-950 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950 shadow cursor-pointer active:scale-95'
                    : 'border-blue-900/40 bg-blue-950/40 text-blue-400/30 line-through cursor-not-allowed'
                }`}
                title="Joker Appel à un Ami — Conseil d’un ami du 7TER"
              >
                <PhoneCall className="h-3.5 w-3.5" />
                <span>Ami</span>
              </button>

              <button
                type="button"
                onClick={handleUseSwitchQuestion}
                disabled={!jokers.switchQuestion || runStatus !== 'playing'}
                className={`inline-flex items-center gap-1 rounded-full border-2 px-2.5 py-1 text-[11px] sm:text-xs font-black transition ${
                  jokers.switchQuestion
                    ? 'border-yellow-400 bg-gradient-to-b from-blue-800 to-blue-950 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950 shadow cursor-pointer active:scale-95'
                    : 'border-blue-900/40 bg-blue-950/40 text-blue-400/30 line-through cursor-not-allowed'
                }`}
                title="Joker Switch — Changer de question"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Switch</span>
              </button>
            </div>
          </div>

          {/* Mini-barre des 15 paliers sur mobile/tablette (masquée sur grand écran où la tour complète est à droite) */}
          <div className="grid grid-cols-15 gap-0.5 lg:hidden">
            <div className="col-span-full flex items-center gap-1 overflow-x-auto pb-0.5">
              {MILLION_LADDER.map((item) => {
                const isCurrent = item.step === currentStep;
                const isPassed = item.step < currentStep;
                return (
                  <div
                    key={item.step}
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-black border ${
                      isCurrent
                        ? 'bg-amber-400 text-slate-950 border-white scale-105'
                        : isPassed
                        ? 'bg-emerald-500/30 text-emerald-300 border-emerald-400/40'
                        : item.isSafeHaven
                        ? 'bg-yellow-400/15 text-yellow-300 border-yellow-400/50'
                        : 'bg-[#040b1e] text-blue-300/60 border-blue-500/25'
                    }`}
                  >
                    {item.step}. {item.label}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 2. CARTE QUESTION STYLE PLATEAU TV "QUI VEUT GAGNER DES MILLIONS" */}
        <section className="relative flex-1 min-h-0 flex flex-col justify-between gap-2 overflow-hidden rounded-2xl border-2 border-blue-500/50 bg-gradient-to-b from-[#0b1d48]/95 via-[#071334]/95 to-[#040a1d]/95 p-3 sm:p-4 shadow-2xl">
          {/* Énoncé */}
          <div className="shrink-0 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 text-blue-950 px-2.5 py-0.5 text-[11px] font-black uppercase">
                <Tag className="h-3 w-3 fill-blue-950" />
                {currentQuestion.theme} · Niv. {currentQuestion.difficulty}/10
              </span>

              <span className="text-[11px] font-bold text-yellow-300">
                Record : {formatEuros(stats.bestAmount)}
                {stats.millionWins > 0 ? ` (🏆 ${stats.millionWins}x)` : ''}
              </span>
            </div>

            <div className="rounded-2xl border-2 border-yellow-400/45 bg-gradient-to-r from-[#040b1e] via-[#091c4e] to-[#040b1e] px-4 py-3 sm:px-5 sm:py-3.5 text-center shadow-inner">
              <h3 className="text-base sm:text-lg lg:text-xl font-black text-white leading-snug">
                {currentQuestion.question}
              </h3>
            </div>
          </div>

          {/* Zone centrale : Fenêtres Jokers (Public / Ami) + Les 4 propositions A/B/C/D */}
          <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
            <div className="my-auto space-y-2.5 py-1">
              {/* Résultat Joker Avis du Public */}
              {audiencePoll && !isRevealed && (
                <div className="rounded-xl border border-sky-400/50 bg-[#051235]/95 p-2.5 animate-fadeIn">
                  <div className="text-[11px] font-black uppercase text-sky-300 mb-1.5 flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5" />
                    <span>Vote du Public en direct :</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {audiencePoll.map((pct, idx) => (
                      <div key={idx} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-black">
                          <span className="text-yellow-400">
                            {OPTION_LETTERS[idx]}
                          </span>
                          <span className="text-white">{pct}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-blue-950 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-sky-400 to-yellow-400 transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Résultat Joker Appel à un Ami */}
              {friendAdvice && !isRevealed && (
                <div className="rounded-xl border border-amber-400/60 bg-amber-950/35 px-3 py-2 animate-fadeIn">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-yellow-300">
                    <PhoneCall className="h-3.5 w-3.5 text-amber-400" />
                    <span>{friendAdvice.friendName} :</span>
                  </div>
                  <p className="text-xs text-amber-50 italic mt-0.5 leading-snug">
                    {friendAdvice.message}
                  </p>
                </div>
              )}

              {/* Grille 2x2 des 4 réponses style losanges TV */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
                {currentQuestion.options.map((optText, idx) => {
                  const isHiddenBy5050 = hiddenOptions.includes(idx);
                  const isPending =
                    pendingOption === idx && lockedOption === null;
                  const isLocked = lockedOption === idx;
                  const isCorrect = idx === currentQuestion.correct_index;

                  if (isHiddenBy5050) {
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 rounded-xl border border-blue-900/30 bg-[#040b1e]/30 px-4 py-3 opacity-25 select-none"
                      >
                        <span className="text-xs font-black text-blue-500">
                          {OPTION_LETTERS[idx]} :
                        </span>
                        <span className="text-xs text-blue-400">
                          — Éliminé par le 50:50 —
                        </span>
                      </div>
                    );
                  }

                  let btnStyle =
                    'border-blue-400/45 bg-gradient-to-r from-[#07173f] via-[#0b235c] to-[#07173f] hover:border-yellow-400 text-white';
                  let letterColor = 'text-yellow-400';

                  if (isPending && !isRevealed) {
                    // Orange "C'est votre dernier mot ?"
                    btnStyle =
                      'border-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-lg scale-[1.01]';
                    letterColor = 'text-slate-950';
                  } else if (isRevealed) {
                    if (isCorrect) {
                      btnStyle =
                        'border-emerald-300 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 ring-2 ring-emerald-300 font-black';
                      letterColor = 'text-slate-950';
                    } else if (isLocked && !isCorrect) {
                      btnStyle =
                        'border-rose-300 bg-gradient-to-r from-rose-600 to-red-500 text-white ring-2 ring-rose-400';
                      letterColor = 'text-yellow-200';
                    } else {
                      btnStyle =
                        'border-blue-900/40 bg-[#040b1e]/50 text-blue-300/40 opacity-55';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleClickOption(idx)}
                      disabled={isRevealed}
                      className={`group relative flex items-center justify-between gap-2.5 rounded-xl border-2 px-3.5 py-2.5 sm:px-4 sm:py-3 text-left transition-all ${btnStyle} ${
                        !isRevealed ? 'cursor-pointer active:scale-95' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`text-sm sm:text-base font-black shrink-0 ${letterColor}`}
                        >
                          ◆ {OPTION_LETTERS[idx]} :
                        </span>
                        <span className="text-sm sm:text-base font-extrabold leading-snug break-words">
                          {optText}
                        </span>
                      </div>

                      {isRevealed && isCorrect && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-slate-950" />
                      )}
                      {isRevealed && isLocked && !isCorrect && (
                        <XCircle className="h-5 w-5 shrink-0 text-white" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Bandeau "C'est votre dernier mot ?" quand une option est pré-sélectionnée en orange */}
              {pendingOption !== null && !isRevealed && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border-2 border-amber-400 bg-gradient-to-r from-amber-500/20 via-orange-500/25 to-amber-500/20 px-3.5 py-2 animate-fadeIn">
                  <span className="text-xs sm:text-sm font-black text-amber-300">
                    🎙️ Réponse {OPTION_LETTERS[pendingOption]} : « C’est votre
                    dernier mot ? »
                  </span>
                  <button
                    type="button"
                    onClick={handleConfirmFinalAnswer}
                    className="shimmer-btn relative overflow-hidden inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-4 py-1.5 text-xs sm:text-sm font-black uppercase text-slate-950 shadow-lg active:scale-95 transition"
                  >
                    <span>Oui, c’est mon dernier mot !</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>
              )}

              {/* Zone Anecdote & Bilan après validation */}
              {isRevealed && (
                <div
                  className={`rounded-xl border px-3.5 py-2.5 shadow-lg animate-fadeIn ${
                    runStatus === 'millionaire' || runStatus === 'step_won'
                      ? 'border-emerald-400 bg-emerald-950/45'
                      : runStatus === 'walked_away'
                      ? 'border-yellow-400 bg-blue-950/80'
                      : 'border-rose-400 bg-rose-950/45'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-yellow-400 text-blue-950">
                      {runStatus === 'millionaire' ? (
                        <Trophy className="h-3.5 w-3.5" />
                      ) : (
                        <Lightbulb className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="text-xs font-black uppercase">
                        {runStatus === 'millionaire' ? (
                          <span className="text-yellow-300">
                            🏆 1 000 000 € ! VOUS AVEZ FAIT SAUTER LA BANQUE DU
                            7TER !
                          </span>
                        ) : runStatus === 'step_won' ? (
                          <span className="text-emerald-300">
                            ✅ PALIER {currentStepInfo.label} VALIDÉ !
                            {currentStepInfo.isSafeHaven
                              ? ' (🔒 PALIER DE SÉCURITÉ VERROUILLÉ !)'
                              : ''}
                          </span>
                        ) : runStatus === 'walked_away' ? (
                          <span className="text-yellow-300">
                            💼 VOUS REPARTEZ AVEC LE CHÈQUE DE{' '}
                            {formatEuros(currentWalkAwayAmount)} !
                          </span>
                        ) : (
                          <span className="text-rose-300">
                            💥 MAUVAISE RÉPONSE ! Vous repartez avec le palier
                            garanti de {formatEuros(guaranteedSafeHavenAmount)}.
                          </span>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-blue-50 leading-snug">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Barre du bas : S'arrêter et encaisser OU Question suivante / Nouvelle partie */}
          <div className="shrink-0 pt-2 border-t border-blue-500/30 flex items-center justify-between gap-2 flex-wrap">
            {!isRevealed ? (
              <>
                <span className="text-[11px] sm:text-xs font-bold text-blue-200/80">
                  Cliquez sur une réponse puis confirmez votre dernier mot.
                </span>

                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleWalkAway}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-yellow-400/50 bg-blue-950/90 hover:bg-yellow-400 hover:text-blue-950 px-3 py-1.5 text-xs font-black text-yellow-300 transition ml-auto"
                    title="Ne pas répondre et repartir avec les gains acquis"
                  >
                    <Banknote className="h-3.5 w-3.5" />
                    <span>
                      S’arrêter et encaisser {formatEuros(currentWalkAwayAmount)}
                    </span>
                  </button>
                )}
              </>
            ) : runStatus === 'step_won' ? (
              <button
                type="button"
                onClick={handleAdvanceToNextStep}
                className="shimmer-btn relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-5 py-2 text-xs sm:text-sm font-black uppercase text-blue-950 shadow-lg active:scale-95 transition ml-auto"
              >
                <span>
                  Jouer pour{' '}
                  {MILLION_LADDER[currentStep]?.label || '1 000 000 €'}
                </span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartNewMillionGame}
                className="shimmer-btn relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-5 py-2 text-xs sm:text-sm font-black uppercase text-blue-950 shadow-lg active:scale-95 transition ml-auto"
              >
                <RotateCcw className="h-4 w-4 stroke-[2.5]" />
                <span>Nouvelle Ascension vers le Million</span>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ====================================================================
          COLONNE DROITE (DESKTOP) : PYRAMIDE OFFICIELLE DES 15 PALIERS
         ==================================================================== */}
      <aside className="hidden lg:flex w-64 shrink-0 flex-col justify-between rounded-2xl border-2 border-yellow-400/45 bg-gradient-to-b from-[#071538]/95 via-[#050f29]/95 to-[#030817]/95 p-3 shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-500/30 pb-2 mb-1">
          <span className="text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1.5">
            <Trophy className="h-3.5 w-3.5" />
            <span>Pyramide des Gains</span>
          </span>
          <span className="text-[10px] font-bold text-blue-300">15 paliers</span>
        </div>

        <div className="flex-1 flex flex-col justify-between gap-0.5">
          {[...MILLION_LADDER].reverse().map((item) => {
            const isCurrent = item.step === currentStep;
            const isPassed = item.step < currentStep;

            let rowStyle = 'text-amber-300/80 border-transparent';
            if (item.isSafeHaven) {
              rowStyle = 'text-white font-black';
            }
            if (isPassed) {
              rowStyle = 'text-emerald-400/85';
            }
            if (isCurrent) {
              rowStyle =
                'bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black border-white shadow scale-[1.02]';
            }

            return (
              <div
                key={item.step}
                className={`flex items-center justify-between rounded-lg border px-2.5 py-1 text-xs transition ${rowStyle}`}
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-5 font-mono text-[11px] font-black opacity-80">
                    {item.step}
                  </span>
                  <span className="text-[10px]">
                    {isPassed ? '◆' : item.isSafeHaven ? '★' : '·'}
                  </span>
                </div>
                <span className="font-mono font-black tracking-tight">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
