'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Wallet,
  ShoppingBag,
} from 'lucide-react';
import {
  playCorrectSound,
  playWrongSound,
  playSuspenseSound,
  playFinalAnswerJingle,
  playFinalAnswerSuspenseSound,
  playJokerSound,
  playPointSound,
  startMillionsZoukMusic,
  stopMillionsZoukMusic,
  setMillionsZoukStep,
  setMillionsSuspenseLocked,
} from '@/lib/sound';

import {
  pickWeightedQuestion,
  isQuestionAlreadyAsked,
  normalizeQuestionKey,
  type QuestionAnalyticsMap,
} from '@/lib/question-analytics';
import HostReaction, { type HostExpression } from '@/components/HostReaction';

interface MillionsModeProps {
  poolByLevel: Record<number, QuizQuestionRecord[]>;
  playedIds: string[];
  onMarkQuestionPlayed: (questionId: string, question?: QuizQuestionRecord) => void;
  onRecordOutcome?: (question: QuizQuestionRecord, isCorrect: boolean) => void;
  analyticsMap?: QuestionAnalyticsMap;
  soundEnabled: boolean;
  zoukMusicEnabled?: boolean;
  onToggleZoukMusic?: () => void;
  userPseudo?: string;
  cagnotteBalance?: number;
  onAddMoneyToCagnotte?: (amount: number, reason: string) => void;
  onOpenShopModal?: () => void;
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
const STORAGE_MILLIONS_RUN = '7ter:millions:run_state:v1';

interface MillionsRecord {
  bestAmount: number;
  millionWins: number;
  gamesPlayed: number;
}

export default function MillionsMode({
  poolByLevel,
  playedIds,
  onMarkQuestionPlayed,
  onRecordOutcome,
  analyticsMap = {},
  soundEnabled,
  zoukMusicEnabled: propZoukEnabled,
  onToggleZoukMusic,
  userPseudo,
  cagnotteBalance = 0,
  onAddMoneyToCagnotte,
  onOpenShopModal,
}: MillionsModeProps) {
  const [currentStep, setCurrentStep] = useState<number>(1); // 1 to 15
  const [currentQuestion, setCurrentQuestion] =
    useState<QuizQuestionRecord | null>(null);
  const [pendingOption, setPendingOption] = useState<number | null>(null); // "Dernier mot ?" (orange)
  const [lockedOption, setLockedOption] = useState<number | null>(null); // Validé
  const [isSuspenseLock, setIsSuspenseLock] = useState<boolean>(false); // Suspense avant révélation
  const [suspenseStage, setSuspenseStage] = useState<0 | 1 | 2>(0);
  const [suspenseDurationMs, setSuspenseDurationMs] = useState<number>(2200);
  const suspenseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suspenseStageTimersRef = useRef<Array<ReturnType<typeof setTimeout>>>(
    []
  );
  const [runStatus, setRunStatus] = useState<
    'playing' | 'step_won' | 'failed' | 'walked_away' | 'millionaire'
  >('playing');
  const [hydratedRun, setHydratedRun] = useState<boolean>(false);

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
  const [internalZoukEnabled, setInternalZoukEnabled] = useState<boolean>(true);
  const zoukMusicEnabled =
    propZoukEnabled !== undefined ? propZoukEnabled : internalZoukEnabled;

  const [stats, setStats] = useState<MillionsRecord>({
    bestAmount: 0,
    millionWins: 0,
    gamesPlayed: 1,
  });

  const clearAllSuspenseTimers = useCallback(() => {
    if (suspenseTimerRef.current) {
      clearTimeout(suspenseTimerRef.current);
      suspenseTimerRef.current = null;
    }
    suspenseStageTimersRef.current.forEach((id) => clearTimeout(id));
    suspenseStageTimersRef.current = [];
  }, []);

  // Lancement / arrêt automatique de la musique "Qui veut gagner des millions"
  useEffect(() => {
    if (
      soundEnabled &&
      zoukMusicEnabled &&
      runStatus === 'playing' &&
      !isSuspenseLock
    ) {
      startMillionsZoukMusic(true, currentStep);
    } else {
      stopMillionsZoukMusic();
    }
    return () => {
      stopMillionsZoukMusic();
    };
  }, [soundEnabled, zoukMusicEnabled, runStatus, isSuspenseLock, currentStep]);

  useEffect(() => {
    return () => {
      clearAllSuspenseTimers();
    };
  }, [clearAllSuspenseTimers]);

  const handleToggleZoukButton = () => {
    if (onToggleZoukMusic) {
      onToggleZoukMusic();
    } else {
      const next = !zoukMusicEnabled;
      setInternalZoukEnabled(next);
      if (next) {
        startMillionsZoukMusic(true, currentStep);
      } else {
        stopMillionsZoukMusic();
      }
    }
  };

  useEffect(() => {
    setMillionsZoukStep(currentStep);
  }, [currentStep]);

  useEffect(() => {
    setMillionsSuspenseLocked(pendingOption !== null);
  }, [pendingOption]);

  const ladderScrollRef = useRef<HTMLDivElement | null>(null);
  const desktopLadderScrollRef = useRef<HTMLDivElement | null>(null);
  const stepItemRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const desktopStepItemRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const centerCurrentStepInScroll = useCallback(
    (behavior: ScrollBehavior = 'smooth') => {
      const container = ladderScrollRef.current;
      const activeEl = stepItemRefs.current[currentStep];
      if (container && activeEl && container.clientWidth > 0) {
        const containerRect = container.getBoundingClientRect();
        const activeRect = activeEl.getBoundingClientRect();
        const targetScrollLeft =
          container.scrollLeft +
          (activeRect.left - containerRect.left) -
          containerRect.width / 2 +
          activeRect.width / 2;

        container.scrollTo({
          left: Math.max(0, targetScrollLeft),
          behavior,
        });
      }

      const desktopContainer = desktopLadderScrollRef.current;
      const desktopActiveEl = desktopStepItemRefs.current[currentStep];
      if (
        desktopContainer &&
        desktopActiveEl &&
        desktopContainer.scrollHeight > desktopContainer.clientHeight
      ) {
        const containerRect = desktopContainer.getBoundingClientRect();
        const activeRect = desktopActiveEl.getBoundingClientRect();
        const targetScrollTop =
          desktopContainer.scrollTop +
          (activeRect.top - containerRect.top) -
          containerRect.height / 2 +
          activeRect.height / 2;

        desktopContainer.scrollTo({
          top: Math.max(0, targetScrollTop),
          behavior,
        });
      }
    },
    [currentStep]
  );

  useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      centerCurrentStepInScroll('smooth');
    });
    return () => cancelAnimationFrame(rafId);
  }, [centerCurrentStepInScroll, currentQuestion]);

  useEffect(() => {
    const handleResize = () => centerCurrentStepInScroll('auto');
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [centerCurrentStepInScroll]);

  // Recentrage dès que la taille réelle de la pyramide change (passage en
  // paysage, colonne qui apparaît, tête de l'animateur qui prend de la place…)
  const hasQuestion = Boolean(currentQuestion);
  useEffect(() => {
    if (!hasQuestion || typeof ResizeObserver === 'undefined') return;
    let rafId = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => centerCurrentStepInScroll('auto'));
    });
    if (desktopLadderScrollRef.current) {
      observer.observe(desktopLadderScrollRef.current);
    }
    if (ladderScrollRef.current) {
      observer.observe(ladderScrollRef.current);
    }
    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [hasQuestion, centerCurrentStepInScroll]);

  // Chargement des records et de la partie en cours depuis localStorage (pour ne pas changer de question au rafraîchissement)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_MILLIONS_STATS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.bestAmount === 'number') {
          setStats(parsed);
        }
      }

      const savedRun = localStorage.getItem(STORAGE_MILLIONS_RUN);
      if (savedRun) {
        const parsedRun = JSON.parse(savedRun);
        if (parsedRun && parsedRun.currentQuestion?.id) {
          setCurrentStep(
            typeof parsedRun.currentStep === 'number' ? parsedRun.currentStep : 1
          );
          setCurrentQuestion(parsedRun.currentQuestion);
          setPendingOption(parsedRun.pendingOption ?? null);
          setLockedOption(parsedRun.lockedOption ?? null);
          if (parsedRun.runStatus) setRunStatus(parsedRun.runStatus);
          if (parsedRun.jokers) setJokers(parsedRun.jokers);
          if (Array.isArray(parsedRun.hiddenOptions)) {
            setHiddenOptions(parsedRun.hiddenOptions);
          }
          if (Array.isArray(parsedRun.audiencePoll)) {
            setAudiencePoll(parsedRun.audiencePoll);
          }
          if (parsedRun.friendAdvice) {
            setFriendAdvice(parsedRun.friendAdvice);
          }
        }
      }
    } catch {
      // Ignore
    } finally {
      setHydratedRun(true);
    }
  }, []);

  // Sauvegarde automatique de la question et de l'état en cours
  useEffect(() => {
    if (!hydratedRun || !currentQuestion) return;
    try {
      localStorage.setItem(
        STORAGE_MILLIONS_RUN,
        JSON.stringify({
          currentStep,
          currentQuestion,
          pendingOption,
          lockedOption,
          runStatus,
          jokers,
          hiddenOptions,
          audiencePoll,
          friendAdvice,
        })
      );
    } catch {
      // Ignore
    }
  }, [
    hydratedRun,
    currentStep,
    currentQuestion,
    pendingOption,
    lockedOption,
    runStatus,
    jokers,
    hiddenOptions,
    audiencePoll,
    friendAdvice,
  ]);

  const saveStats = useCallback((next: MillionsRecord) => {
    setStats(next);
    try {
      localStorage.setItem(STORAGE_MILLIONS_STATS, JSON.stringify(next));
    } catch {
      // Ignore
    }
  }, []);

  const usedInMillionsRef = useRef<Set<string>>(new Set());

  const registerUsedQuestion = useCallback((q?: QuizQuestionRecord | null) => {
    if (!q) return;
    usedInMillionsRef.current.add(q.id);
    usedInMillionsRef.current.add(normalizeQuestionKey(q.question));
  }, []);

  // Tirage d'une question correspondant au niveau du palier (exclut strictement les questions déjà posées)
  const pickQuestionForStep = useCallback(
    (stepNumber: number, excludeId?: string): QuizQuestionRecord | null => {
      const stepInfo =
        MILLION_LADDER.find((s) => s.step === stepNumber) || MILLION_LADDER[0];
      const playedSet = new Set([...playedIds, ...Array.from(usedInMillionsRef.current)]);
      if (excludeId) {
        playedSet.add(excludeId);
      }

      const targetLevelList = poolByLevel[stepInfo.level] || [];
      const hasUnaskedInTarget = targetLevelList.some(
        (q) =>
          q.id !== excludeId &&
          !isQuestionAlreadyAsked(q, playedSet, analyticsMap)
      );

      if (hasUnaskedInTarget) {
        const picked = pickWeightedQuestion(
          targetLevelList,
          playedSet,
          analyticsMap,
          excludeId
        );
        registerUsedQuestion(picked);
        return picked;
      }

      // Si toutes les questions de ce niveau ont déjà été posées, chercher dans les niveaux voisins
      for (let delta = 1; delta <= 9; delta++) {
        for (const candidateLvl of [
          stepInfo.level + delta,
          stepInfo.level - delta,
        ]) {
          if (candidateLvl >= 1 && candidateLvl <= 10) {
            const adjList = poolByLevel[candidateLvl] || [];
            const hasUnaskedAdj = adjList.some(
              (q) =>
                q.id !== excludeId &&
                !isQuestionAlreadyAsked(q, playedSet, analyticsMap)
            );
            if (hasUnaskedAdj) {
              const picked = pickWeightedQuestion(
                adjList,
                playedSet,
                analyticsMap,
                excludeId
              );
              registerUsedQuestion(picked);
              return picked;
            }
          }
        }
      }

      const fallback = pickWeightedQuestion(
        targetLevelList,
        playedSet,
        analyticsMap,
        excludeId
      );
      registerUsedQuestion(fallback);
      return fallback;
    },
    [poolByLevel, playedIds, analyticsMap, registerUsedQuestion]
  );

  // Initialisation de la première question uniquement après hydratation si aucune question n'était sauvegardée
  useEffect(() => {
    if (hydratedRun && !currentQuestion) {
      const q = pickQuestionForStep(1);
      if (q) {
        setCurrentQuestion(q);
      }
    } else if (hydratedRun && currentQuestion) {
      registerUsedQuestion(currentQuestion);
    }
  }, [hydratedRun, currentQuestion, pickQuestionForStep, registerUsedQuestion]);

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
      lockedOption !== null ||
      isSuspenseLock
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
      lockedOption !== null ||
      isSuspenseLock
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
      lockedOption !== null ||
      isSuspenseLock
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
      lockedOption !== null ||
      isSuspenseLock
    ) {
      return;
    }
    playJokerSound(soundEnabled);

    const oldQuestion = currentQuestion;
    registerUsedQuestion(oldQuestion);
    onMarkQuestionPlayed(oldQuestion.id, oldQuestion);

    const replacement = pickQuestionForStep(currentStep, oldQuestion.id);
    if (replacement) {
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
      isSuspenseLock ||
      hiddenOptions.includes(idx)
    ) {
      return;
    }
    setPendingOption(idx);
    playSuspenseSound(soundEnabled, currentStep);
  };

  const handleConfirmFinalAnswer = () => {
    if (
      pendingOption === null ||
      !currentQuestion ||
      runStatus !== 'playing' ||
      isSuspenseLock
    ) {
      return;
    }

    const chosenOption = pendingOption;
    const questionSnapshot = currentQuestion;
    const stepSnapshot = currentStep;
    const wonAmount = currentStepInfo.amount;
    const safeHavenSnapshot = guaranteedSafeHavenAmount;

    registerUsedQuestion(questionSnapshot);
    onMarkQuestionPlayed(questionSnapshot.id, questionSnapshot);

    const suspenseDelayMs = !soundEnabled
      ? 1100
      : stepSnapshot <= 5
      ? 2100
      : stepSnapshot <= 10
      ? 2500
      : 3000;

    clearAllSuspenseTimers();
    setIsSuspenseLock(true);
    setSuspenseStage(0);
    setSuspenseDurationMs(suspenseDelayMs);
    stopMillionsZoukMusic();
    playFinalAnswerJingle(soundEnabled, stepSnapshot);
    playFinalAnswerSuspenseSound(soundEnabled, suspenseDelayMs, stepSnapshot);

    const stage1Id = setTimeout(() => {
      setSuspenseStage(1);
    }, Math.round(suspenseDelayMs * 0.36));

    const stage2Id = setTimeout(() => {
      setSuspenseStage(2);
    }, Math.round(suspenseDelayMs * 0.72));

    suspenseStageTimersRef.current = [stage1Id, stage2Id];

    suspenseTimerRef.current = setTimeout(() => {
      suspenseTimerRef.current = null;
      suspenseStageTimersRef.current = [];
      setIsSuspenseLock(false);
      setLockedOption(chosenOption);

      const isCorrect = chosenOption === questionSnapshot.correct_index;
      if (onRecordOutcome) {
        onRecordOutcome(questionSnapshot, isCorrect);
      }
      if (isCorrect) {
        playCorrectSound(soundEnabled);
        if (stepSnapshot >= 15) {
          setRunStatus('millionaire');
          if (onAddMoneyToCagnotte) {
            onAddMoneyToCagnotte(1000000, 'Victoire à 1 000 000 € !');
          }
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
        if (safeHavenSnapshot > 0 && onAddMoneyToCagnotte) {
          onAddMoneyToCagnotte(
            safeHavenSnapshot,
            `Palier de sécurité garanti (${formatEuros(safeHavenSnapshot)})`
          );
        }
        if (safeHavenSnapshot > stats.bestAmount) {
          saveStats({
            ...stats,
            bestAmount: safeHavenSnapshot,
          });
        }
      }
    }, suspenseDelayMs);
  };

  const handleWalkAway = () => {
    if (runStatus !== 'playing' || currentStep <= 1 || isSuspenseLock) return;
    if (currentQuestion) {
      registerUsedQuestion(currentQuestion);
      onMarkQuestionPlayed(currentQuestion.id, currentQuestion);
    }
    playPointSound(soundEnabled);
    setRunStatus('walked_away');
    if (currentWalkAwayAmount > 0 && onAddMoneyToCagnotte) {
      onAddMoneyToCagnotte(
        currentWalkAwayAmount,
        `Chèque encaissé au palier ${currentStep - 1} (${formatEuros(
          currentWalkAwayAmount
        )})`
      );
    }
    if (currentWalkAwayAmount > stats.bestAmount) {
      saveStats({
        ...stats,
        bestAmount: currentWalkAwayAmount,
      });
    }
  };

  const handleAdvanceToNextStep = () => {
    clearAllSuspenseTimers();
    setIsSuspenseLock(false);
    if (currentQuestion) {
      registerUsedQuestion(currentQuestion);
      onMarkQuestionPlayed(currentQuestion.id, currentQuestion);
    }
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
    clearAllSuspenseTimers();
    setIsSuspenseLock(false);
    if (currentQuestion) {
      registerUsedQuestion(currentQuestion);
      onMarkQuestionPlayed(currentQuestion.id, currentQuestion);
    }
    const firstQ = pickQuestionForStep(1, currentQuestion?.id);
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

  // ==========================================================================
  // RÉACTIONS DE L'ANIMATEUR (tête FMV pixelisée au-dessus de la pyramide)
  // ==========================================================================
  const hostExpression: HostExpression =
    runStatus === 'millionaire'
      ? 'ecstatic'
      : runStatus === 'step_won'
      ? 'happy'
      : runStatus === 'failed'
      ? 'sad'
      : runStatus === 'walked_away'
      ? 'cheque'
      : pendingOption !== null || isSuspenseLock
      ? 'suspense'
      : 'neutral';

  const hostLinesByMood: Record<string, string[]> = {
    neutral: [
      `Pour ${currentStepInfo.label}, je vous écoute…`,
      'Prenez votre temps, on a toute la soirée.',
      'Alors, une petite idée ?',
      'Le public est avec vous !',
    ],
    pending: [
      '« C’est votre dernier mot ? »',
      'Vous êtes sûr de vous ?',
      'Hmm… intéressant comme choix.',
    ],
    suspense: [
      'On verrouille… Suspense !',
      'Le public retient son souffle…',
      'Regardez-moi bien dans les yeux…',
    ],
    happy: [
      'C’est la bonne réponse !',
      'Magnifique ! On continue ?',
      `Bravo ! ${currentStepInfo.label} !`,
    ],
    safe: [`Palier ${currentStepInfo.label} assuré ! Bravo !`],
    sad: [
      'Ah… je suis vraiment désolé.',
      'Oh non… c’était pourtant si près !',
      'Dommage… quel parcours quand même !',
    ],
    ecstatic: ['UN MILLION !!! VOUS ÊTES MILLIONNAIRE !'],
    cheque: ['Sage décision. Voici votre chèque !'],
  };

  const hostMoodKey =
    hostExpression === 'suspense'
      ? isSuspenseLock
        ? 'suspense'
        : 'pending'
      : hostExpression === 'happy' && currentStepInfo.isSafeHaven
      ? 'safe'
      : hostExpression;
  const hostLines = hostLinesByMood[hostMoodKey];
  const hostLineSeed =
    currentStep * 7 +
    (currentQuestion.id?.length ?? 0) +
    suspenseStage +
    (pendingOption ?? 0);
  const hostLine = hostLines[hostLineSeed % hostLines.length];

  return (
    <div className="flex-1 min-h-0 flex flex-col landscape:flex-row lg:flex-row gap-2 ls:gap-1.5 sm:gap-2.5 overflow-hidden">
      {/* ====================================================================
          COLONNE PRINCIPALE : JOKERS + ÉNONCÉ + 4 LOSANGES DE RÉPONSE
         ==================================================================== */}
      <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 ls:gap-1 overflow-hidden">
        {/* 1. BARRE SUPÉRIEURE : LES 4 JOKERS + INFOS GAIN EN JEU */}
        <section className="shrink-0 rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-r from-[#091b46]/95 via-[#071436]/95 to-[#091b46]/95 px-2.5 sm:px-3 ls:px-2.5 py-1.5 sm:py-2 ls:py-1 shadow-xl space-y-1.5 sm:space-y-2 ls:space-y-1">
          <div className="flex flex-col landscape:flex-row sm:flex-row landscape:items-center sm:items-center justify-between gap-1.5 ls:gap-1 sm:gap-2">
            {/* Gain de la question actuelle + Cagnotte + Toggle Musique Zouk */}
            <div className="flex items-center justify-between sm:justify-start gap-1.5 ls:gap-1 flex-wrap">
              <div className="flex items-center gap-1.5 ls:gap-1 flex-wrap">
                <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-2 sm:px-2.5 ls:px-2 py-0.5 sm:py-1 ls:py-0.5 text-xs sm:text-sm ls:text-xs font-black uppercase text-blue-950 shadow">
                  <Banknote className="h-3.5 w-3.5 sm:h-4 sm:w-4 ls:h-3.5 ls:w-3.5" />
                  <span>
                    Palier {currentStep}/15 · {currentStepInfo.label}
                  </span>
                </span>

                <span className="inline-flex items-center gap-1 rounded-lg border border-blue-400/35 bg-blue-950/80 px-1.5 sm:px-2 py-0.5 sm:py-1 ls:py-0.5 text-[10px] sm:text-[11px] ls:text-[10px] font-bold text-blue-200">
                  <ShieldCheck className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-yellow-400" />
                  <span>
                    Garanti : {formatEuros(guaranteedSafeHavenAmount)}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={onOpenShopModal}
                  className="inline-flex items-center gap-1 rounded-lg border border-emerald-400/60 bg-emerald-950/80 hover:bg-emerald-400 hover:text-slate-950 px-2 py-0.5 sm:py-1 ls:py-0.5 text-[10px] sm:text-[11px] ls:text-[10px] font-black text-emerald-300 transition shadow-sm"
                  title="Cagnotte personnelle & Boutique de questions (+10 nouvelles questions au hasard)"
                >
                  <Wallet className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                  <span>
                    {userPseudo ? `${userPseudo} : ` : 'Cagnotte : '}
                    {formatEuros(cagnotteBalance)}
                  </span>
                  <ShoppingBag className="h-3 w-3 ml-0.5 opacity-85 shrink-0" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleToggleZoukButton}
                className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-bold transition active:scale-95 ${
                  zoukMusicEnabled && soundEnabled
                    ? 'border-yellow-400/70 bg-yellow-400/20 text-yellow-200'
                    : 'border-blue-500/35 bg-blue-950/70 text-blue-300/60'
                }`}
                title="Activer / couper le thème original de Qui veut gagner des millions"
              >
                <Music className="h-3 w-3" />
                <span>TV {zoukMusicEnabled && soundEnabled ? 'ON' : 'OFF'}</span>
              </button>
            </div>

            {/* LES 4 BOUTONS JOKERS */}
            <div className="grid grid-cols-4 landscape:flex sm:flex items-center gap-1 sm:gap-1.5 ls:gap-1">
              <button
                type="button"
                onClick={handleUseFiftyFifty}
                disabled={
                  !jokers.fiftyFifty ||
                  runStatus !== 'playing' ||
                  isSuspenseLock
                }
                className={`inline-flex items-center justify-center gap-1 rounded-full border-2 px-2 sm:px-2.5 ls:px-2 py-1 ls:py-0.5 text-[10px] sm:text-xs ls:text-[10px] font-black transition ${
                  jokers.fiftyFifty && !isSuspenseLock
                    ? 'border-yellow-400 bg-gradient-to-b from-blue-800 to-blue-950 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950 shadow cursor-pointer active:scale-95'
                    : 'border-blue-900/40 bg-blue-950/40 text-blue-400/30 line-through cursor-not-allowed'
                }`}
                title="Joker 50:50 — Élimine 2 mauvaises réponses"
              >
                <Scissors className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span>50:50</span>
              </button>

              <button
                type="button"
                onClick={handleUseAudience}
                disabled={
                  !jokers.audience || runStatus !== 'playing' || isSuspenseLock
                }
                className={`inline-flex items-center justify-center gap-1 rounded-full border-2 px-2 sm:px-2.5 ls:px-2 py-1 ls:py-0.5 text-[10px] sm:text-xs ls:text-[10px] font-black transition ${
                  jokers.audience && !isSuspenseLock
                    ? 'border-yellow-400 bg-gradient-to-b from-blue-800 to-blue-950 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950 shadow cursor-pointer active:scale-95'
                    : 'border-blue-900/40 bg-blue-950/40 text-blue-400/30 line-through cursor-not-allowed'
                }`}
                title="Joker Avis du Public — Sondage en pourcentages"
              >
                <Users className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span>Public</span>
              </button>

              <button
                type="button"
                onClick={handleUsePhoneFriend}
                disabled={
                  !jokers.phoneFriend ||
                  runStatus !== 'playing' ||
                  isSuspenseLock
                }
                className={`inline-flex items-center justify-center gap-1 rounded-full border-2 px-2 sm:px-2.5 ls:px-2 py-1 ls:py-0.5 text-[10px] sm:text-xs ls:text-[10px] font-black transition ${
                  jokers.phoneFriend && !isSuspenseLock
                    ? 'border-yellow-400 bg-gradient-to-b from-blue-800 to-blue-950 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950 shadow cursor-pointer active:scale-95'
                    : 'border-blue-900/40 bg-blue-950/40 text-blue-400/30 line-through cursor-not-allowed'
                }`}
                title="Joker Appel à un Ami — Conseil d’un ami du 7TER"
              >
                <PhoneCall className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span>Ami</span>
              </button>

              <button
                type="button"
                onClick={handleUseSwitchQuestion}
                disabled={
                  !jokers.switchQuestion ||
                  runStatus !== 'playing' ||
                  isSuspenseLock
                }
                className={`inline-flex items-center justify-center gap-1 rounded-full border-2 px-2 sm:px-2.5 ls:px-2 py-1 ls:py-0.5 text-[10px] sm:text-xs ls:text-[10px] font-black transition ${
                  jokers.switchQuestion && !isSuspenseLock
                    ? 'border-yellow-400 bg-gradient-to-b from-blue-800 to-blue-950 text-yellow-300 hover:bg-yellow-400 hover:text-blue-950 shadow cursor-pointer active:scale-95'
                    : 'border-blue-900/40 bg-blue-950/40 text-blue-400/30 line-through cursor-not-allowed'
                }`}
                title="Joker Switch — Changer de question"
              >
                <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0" />
                <span>Switch</span>
              </button>
            </div>
          </div>

          {/* Mini-barre des 15 paliers en portrait uniquement (masquée en paysage et sur grand écran où la tour complète est à droite) */}
          <div className="grid grid-cols-15 gap-0.5 landscape:hidden lg:hidden">
            <div
              ref={ladderScrollRef}
              className="col-span-full relative flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 scroll-smooth"
            >
              <div
                aria-hidden="true"
                className="shrink-0 w-[calc(50%-1rem)]"
              />
              {MILLION_LADDER.map((item) => {
                const isCurrent = item.step === currentStep;
                const isPassed = item.step < currentStep;
                return (
                  <div
                    key={item.step}
                    ref={(el) => {
                      stepItemRefs.current[item.step] = el;
                    }}
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
              <div
                aria-hidden="true"
                className="shrink-0 w-[calc(50%-1rem)]"
              />
            </div>
          </div>
        </section>

        {/* 2. CARTE QUESTION STYLE PLATEAU TV "QUI VEUT GAGNER DES MILLIONS" */}
        <section
          className={`relative flex-1 min-h-0 flex flex-col justify-between gap-1.5 ls:gap-1 sm:gap-2 overflow-hidden rounded-2xl border-2 bg-gradient-to-b from-[#0b1d48]/95 via-[#071334]/95 to-[#040a1d]/95 p-2.5 ls:p-2 sm:p-4 shadow-2xl transition-all duration-500 ${
            isSuspenseLock
              ? 'border-amber-400/90 shadow-[0_0_45px_rgba(245,158,11,0.3)]'
              : 'border-blue-500/50'
          }`}
        >
          {/* Faisceaux projecteurs TV croisés pendant le suspense du dernier mot */}
          {isSuspenseLock && (
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 overflow-hidden z-0"
            >
              <div className="animate-millions-spotlight absolute -top-1/2 left-1/4 h-[200%] w-36 bg-gradient-to-r from-transparent via-amber-400/18 to-transparent blur-xl" />
              <div
                className="animate-millions-spotlight absolute -top-1/2 right-1/4 h-[200%] w-36 bg-gradient-to-r from-transparent via-sky-400/18 to-transparent blur-xl"
                style={{ animationDelay: '-0.9s' }}
              />
            </div>
          )}

          {/* Énoncé */}
          <div className="relative z-10 shrink-0 space-y-1.5 ls:space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between text-xs gap-1.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 text-blue-950 px-2 sm:px-2.5 py-0.5 text-[10px] sm:text-[11px] ls:text-[10px] font-black uppercase truncate max-w-[200px] sm:max-w-none">
                <Tag className="h-3 w-3 fill-blue-950 shrink-0" />
                <span className="truncate">
                  {currentQuestion.theme} · Niv. {currentQuestion.difficulty}/10
                </span>
              </span>

              <span className="text-[10px] sm:text-[11px] ls:text-[10px] font-bold text-yellow-300 shrink-0">
                Record : {formatEuros(stats.bestAmount)}
                {stats.millionWins > 0 ? ` (🏆 ${stats.millionWins}x)` : ''}
              </span>
            </div>

            {/* Animateur FMV en portrait (la colonne pyramide est masquée) */}
            <HostReaction
              variant="inline"
              className="landscape:hidden lg:hidden"
              expression={hostExpression}
              line={hostLine}
              isSuspenseLock={isSuspenseLock}
              suspenseStage={suspenseStage}
            />

            <div
              className={`rounded-2xl border-2 bg-gradient-to-r from-[#040b1e] via-[#091c4e] to-[#040b1e] px-3 py-2 ls:px-3 ls:py-1.5 sm:px-5 sm:py-3.5 text-center shadow-inner transition-colors duration-300 ${
                isSuspenseLock ? 'border-amber-400/80' : 'border-yellow-400/45'
              }`}
            >
              <h3 className="text-sm sm:text-lg lg:text-xl ls:text-sm font-black text-white leading-snug">
                {currentQuestion.question}
              </h3>
            </div>
          </div>

          {/* Zone centrale : Les 4 propositions A/B/C/D fixes en haut + Retours Jokers / Suspense / Anecdote en dessous */}
          <div className="relative z-10 flex-1 min-h-0 overflow-y-auto flex flex-col gap-2 ls:gap-1 sm:gap-2.5 py-0.5 sm:py-1">
            {/* Grille 2x2 des 4 réponses style losanges TV */}
            <div className="shrink-0 grid grid-cols-1 landscape:grid-cols-2 sm:grid-cols-2 gap-1.5 ls:gap-1 sm:gap-2.5">
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
                      className="flex items-center justify-between gap-2 rounded-xl border-2 border-blue-900/30 bg-[#040b1e]/30 px-3 py-2 ls:px-2.5 ls:py-1.5 sm:px-4 sm:py-3 opacity-25 select-none"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs sm:text-base ls:text-xs font-black shrink-0 text-blue-500">
                          ◆ {OPTION_LETTERS[idx]} :
                        </span>
                        <span className="text-xs sm:text-base ls:text-xs font-extrabold leading-snug break-words text-blue-400">
                          — Éliminé par le 50:50 —
                        </span>
                      </div>
                      <span className="h-4 w-4 sm:h-5 sm:w-5 ls:h-4 ls:w-4 shrink-0" aria-hidden="true" />
                    </div>
                  );
                }

                let btnStyle =
                  'border-blue-400/45 bg-gradient-to-r from-[#07173f] via-[#0b235c] to-[#07173f] hover:border-yellow-400 text-white';
                let letterColor = 'text-yellow-400';

                if (isPending && !isRevealed) {
                  // Orange "C'est votre dernier mot ?" / Pulsation dramatique au verrouillage
                  btnStyle = isSuspenseLock
                    ? 'shimmer-btn overflow-hidden border-white bg-gradient-to-r from-amber-400 via-orange-500 to-amber-400 text-slate-950 ring-2 ring-yellow-200 animate-millions-lock'
                    : 'border-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 ring-2 ring-amber-300 shadow-lg';
                  letterColor = 'text-slate-950';
                } else if (isSuspenseLock && !isRevealed) {
                  btnStyle =
                    'border-blue-900/40 bg-[#030817]/80 text-blue-300/35 opacity-40';
                  letterColor = 'text-blue-400/40';
                } else if (isRevealed) {
                  if (isCorrect) {
                    btnStyle =
                      'border-emerald-300 bg-gradient-to-r from-emerald-500 to-green-500 text-slate-950 ring-2 ring-emerald-300 animate-millions-reveal-win';
                    letterColor = 'text-slate-950';
                  } else if (isLocked && !isCorrect) {
                    btnStyle =
                      'border-rose-300 bg-gradient-to-r from-rose-600 to-red-500 text-white ring-2 ring-rose-400 animate-shake';
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
                    disabled={isRevealed || isSuspenseLock}
                    className={`group relative flex items-center justify-between gap-2 rounded-xl border-2 px-3 py-2 ls:px-2.5 ls:py-1.5 sm:px-4 sm:py-3 text-left transition-colors ${btnStyle} ${
                      !isRevealed && !isSuspenseLock
                        ? 'cursor-pointer'
                        : 'cursor-default'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span
                        className={`text-xs sm:text-base ls:text-xs font-black shrink-0 ${letterColor}`}
                      >
                        ◆ {OPTION_LETTERS[idx]} :
                      </span>
                      <span className="text-[13px] sm:text-base ls:text-xs font-extrabold leading-snug break-words">
                        {optText}
                      </span>
                    </div>

                    <span className="flex h-4 w-4 sm:h-5 sm:w-5 ls:h-4 ls:w-4 shrink-0 items-center justify-center">
                      {isSuspenseLock && isPending && !isRevealed && (
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-950 opacity-75" />
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-slate-950" />
                        </span>
                      )}
                      {isRevealed && isCorrect && (
                        <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 ls:h-4 ls:w-4 text-slate-950" />
                      )}
                      {isRevealed && isLocked && !isCorrect && (
                        <XCircle className="h-4 w-4 sm:h-5 sm:w-5 ls:h-4 ls:w-4 text-white" />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Bandeau d'animation SUSPENSE TV en direct après validation du dernier mot */}
            {isSuspenseLock && pendingOption !== null && !isRevealed && (
              <div className="rounded-xl border-2 border-amber-400 bg-gradient-to-r from-[#1c1002]/95 via-[#2e1904]/95 to-[#1c1002]/95 px-3.5 py-2.5 ls:px-2.5 ls:py-1.5 shadow-[0_0_30px_rgba(245,158,11,0.35)] animate-fadeIn space-y-2 ls:space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="relative flex h-3 w-3 shrink-0">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-85" />
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-400" />
                    </span>
                    <span className="text-xs sm:text-sm ls:text-xs font-black text-amber-200 truncate">
                      {suspenseStage === 0 &&
                        `🎙️ « Réponse ${OPTION_LETTERS[pendingOption]} verrouillée… C’est votre dernier mot ! »`}
                      {suspenseStage === 1 &&
                        (currentStep >= 10
                          ? `🔥 « ${currentStepInfo.label} sont en jeu… Le plateau retient son souffle ! »`
                          : '👀 « Le plateau s’assombrit… Jean-Pierre vous fixe dans les yeux… »')}
                      {suspenseStage === 2 &&
                        `⚡ « Verdict imminent pour le palier à ${currentStepInfo.label}… »`}
                    </span>
                  </div>
                  <span className="shrink-0 rounded-md border border-amber-400/60 bg-amber-400/20 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-yellow-300">
                    Dernier mot
                  </span>
                </div>

                {/* Jauge de tension dramatique */}
                <div className="h-1.5 w-full rounded-full bg-slate-950/90 overflow-hidden border border-amber-500/35">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-300 to-white"
                    style={{
                      width:
                        suspenseStage === 0
                          ? '36%'
                          : suspenseStage === 1
                          ? '74%'
                          : '100%',
                      transition: `width ${Math.round(
                        suspenseDurationMs * 0.34
                      )}ms linear`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Résultat Joker Avis du Public */}
            {audiencePoll && !isRevealed && !isSuspenseLock && (
              <div className="rounded-xl border border-sky-400/50 bg-[#051235]/95 p-2.5 ls:p-1.5 animate-fadeIn">
                <div className="text-[11px] ls:text-[10px] font-black uppercase text-sky-300 mb-1.5 ls:mb-1 flex items-center gap-1.5">
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
            {friendAdvice && !isRevealed && !isSuspenseLock && (
              <div className="rounded-xl border border-amber-400/60 bg-amber-950/35 px-3 py-2 ls:px-2.5 ls:py-1 animate-fadeIn">
                <div className="flex items-center gap-1.5 text-[11px] ls:text-[10px] font-black text-yellow-300">
                  <PhoneCall className="h-3.5 w-3.5 text-amber-400" />
                  <span>{friendAdvice.friendName} :</span>
                </div>
                <p className="text-xs ls:text-[11px] text-amber-50 italic mt-0.5 leading-snug">
                  {friendAdvice.message}
                </p>
              </div>
            )}

            {/* Zone Anecdote & Bilan après validation */}
            {isRevealed && (
              <div
                className={`rounded-xl border px-3.5 py-2.5 ls:px-2.5 ls:py-1.5 shadow-lg animate-fadeIn ${
                  runStatus === 'millionaire' || runStatus === 'step_won'
                    ? 'border-emerald-400 bg-emerald-950/45'
                    : runStatus === 'walked_away'
                    ? 'border-yellow-400 bg-blue-950/80'
                    : 'border-rose-400 bg-rose-950/45'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  <div className="mt-0.5 flex h-6 w-6 ls:h-5 ls:w-5 shrink-0 items-center justify-center rounded-lg bg-yellow-400 text-blue-950">
                    {runStatus === 'millionaire' ? (
                      <Trophy className="h-3.5 w-3.5" />
                    ) : (
                      <Lightbulb className="h-3.5 w-3.5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <div className="text-xs ls:text-[11px] font-black uppercase">
                      {runStatus === 'millionaire' ? (
                        <span className="text-yellow-300">
                          🏆 1 000 000 € ! VOUS AVEZ FAIT SAUTER LA BANQUE DU
                          7TER ! (+1 000 000 € dans votre cagnotte !)
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
                          {formatEuros(currentWalkAwayAmount)} ! (+
                          {formatEuros(currentWalkAwayAmount)} ajoutés à votre
                          cagnotte)
                        </span>
                      ) : (
                        <span className="text-rose-300">
                          💥 MAUVAISE RÉPONSE ! Vous repartez avec le palier
                          garanti de {formatEuros(guaranteedSafeHavenAmount)}
                          {guaranteedSafeHavenAmount > 0
                            ? ` (+${formatEuros(guaranteedSafeHavenAmount)} ajoutés à votre cagnotte)`
                            : '.'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm ls:text-xs text-blue-50 leading-snug">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barre du bas fixe : hauteur et position du bouton principal verrouillées au pixel près */}
          <div className="shrink-0 pt-2 ls:pt-1 border-t border-blue-500/30 flex items-center justify-between gap-2">
            {!isRevealed ? (
              <>
                <div className="flex items-center gap-2 min-w-0">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={handleWalkAway}
                      disabled={isSuspenseLock}
                      className={`shrink-0 inline-flex items-center gap-1.5 rounded-xl border px-2.5 sm:px-3 py-2 ls:py-1 text-xs font-black transition-colors ${
                        isSuspenseLock
                          ? 'border-blue-800/30 bg-blue-950/40 text-blue-400/30 cursor-not-allowed'
                          : 'border-yellow-400/50 bg-blue-950/90 hover:bg-yellow-400 hover:text-blue-950 text-yellow-300'
                      }`}
                      title="Ne pas répondre et repartir avec les gains acquis"
                    >
                      <Banknote className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Encaisser {formatEuros(currentWalkAwayAmount)}
                      </span>
                    </button>
                  )}

                  <span
                    className={`hidden md:inline ls:hidden truncate text-xs ${
                      isSuspenseLock
                        ? 'font-black text-amber-200 animate-pulse'
                        : pendingOption !== null
                        ? 'font-black text-amber-300'
                        : 'font-bold text-blue-200/80'
                    }`}
                  >
                    {isSuspenseLock && pendingOption !== null
                      ? `🥁 Réponse ${OPTION_LETTERS[pendingOption]} verrouillée… Suspense sur le plateau !`
                      : pendingOption !== null
                      ? `🎙️ Réponse ${OPTION_LETTERS[pendingOption]} : « C’est votre dernier mot ? »`
                      : 'Cliquez sur une réponse puis validez votre dernier mot.'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmFinalAnswer}
                  disabled={pendingOption === null || isSuspenseLock}
                  className={`shrink-0 relative overflow-hidden inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border px-3.5 sm:px-5 py-2 ls:py-1.5 text-xs sm:text-sm ls:text-xs font-black uppercase transition-colors ml-auto ${
                    isSuspenseLock
                      ? 'border-amber-300 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-slate-950 shadow-lg animate-pulse cursor-wait'
                      : pendingOption !== null
                      ? 'shimmer-btn border-transparent bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 shadow-lg cursor-pointer'
                      : 'border-blue-500/30 bg-blue-950/50 text-blue-300/40 cursor-not-allowed'
                  }`}
                >
                  {isSuspenseLock ? (
                    <>
                      <Sparkles className="h-4 w-4 shrink-0 animate-spin" />
                      <span>Suspense…</span>
                    </>
                  ) : (
                    <>
                      <span className="sm:hidden">
                        {pendingOption !== null
                          ? `Dernier mot (${OPTION_LETTERS[pendingOption]})`
                          : 'Dernier mot'}
                      </span>
                      <span className="hidden sm:inline">
                        Oui, c’est mon dernier mot !
                      </span>
                      <ArrowRight className="h-4 w-4 shrink-0 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </>
            ) : runStatus === 'step_won' ? (
              <button
                type="button"
                onClick={handleAdvanceToNextStep}
                className="shimmer-btn shrink-0 relative overflow-hidden inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-transparent bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-3.5 sm:px-5 py-2 ls:py-1.5 text-xs sm:text-sm ls:text-xs font-black uppercase text-blue-950 shadow-lg transition-colors ml-auto"
              >
                <span>
                  Jouer pour{' '}
                  {MILLION_LADDER[currentStep]?.label || '1 000 000 €'}
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 stroke-[2.5]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleStartNewMillionGame}
                className="shimmer-btn shrink-0 relative overflow-hidden inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-transparent bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-3.5 sm:px-5 py-2 ls:py-1.5 text-xs sm:text-sm ls:text-xs font-black uppercase text-blue-950 shadow-lg transition-colors ml-auto"
              >
                <RotateCcw className="h-4 w-4 shrink-0 stroke-[2.5]" />
                <span>Nouvelle Ascension vers le Million</span>
              </button>
            )}
          </div>
        </section>
      </div>

      {/* ====================================================================
          COLONNE DROITE (PAYSAGE & DESKTOP) : PYRAMIDE OFFICIELLE DES 15 PALIERS
         ==================================================================== */}
      <aside className="hidden landscape:flex lg:flex w-44 sm:w-52 lg:w-64 shrink-0 flex-col justify-between rounded-2xl border-2 border-yellow-400/45 bg-gradient-to-b from-[#071538]/95 via-[#050f29]/95 to-[#030817]/95 p-2 sm:p-2.5 lg:p-3 shadow-2xl">
        <HostReaction
          expression={hostExpression}
          line={hostLine}
          isSuspenseLock={isSuspenseLock}
          suspenseStage={suspenseStage}
        />
        <div className="flex items-center justify-between border-b border-blue-500/30 pb-1.5 lg:pb-2 mb-1">
          <span className="text-[11px] lg:text-xs font-black uppercase tracking-wider text-yellow-400 flex items-center gap-1">
            <Trophy className="h-3 w-3 lg:h-3.5 lg:w-3.5 shrink-0" />
            <span className="truncate">Pyramide</span>
          </span>
          <span className="text-[10px] font-bold text-blue-300 shrink-0">15 paliers</span>
        </div>

        <div
          ref={desktopLadderScrollRef}
          className="flex-1 min-h-0 overflow-y-auto flex flex-col justify-between gap-0.5 scroll-smooth"
        >
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
                ref={(el) => {
                  desktopStepItemRefs.current[item.step] = el;
                }}
                className={`shrink-0 flex items-center justify-between rounded-lg border px-2.5 py-1 ls:py-0.5 text-xs ls:text-[11px] transition ${rowStyle}`}
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
