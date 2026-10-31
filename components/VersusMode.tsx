'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import type { QuizQuestionRecord } from '@/lib/supabase';
import { DIFFICULTY_LEVELS } from '@/lib/generator';
import {
  connectVersusChannel,
  generateRoomCode,
  normalizeRoomCode,
  calculateVersusPoints,
  VERSUS_DURATION_MS,
  type VersusRoomState,
  type VersusMessage,
  type VersusPlayer,
  type VersusPlayerAnswer,
} from '@/lib/versus-realtime';
import {
  Swords,
  Users,
  Copy,
  Check,
  Play,
  ArrowRight,
  Trophy,
  Timer,
  Zap,
  CheckCircle2,
  XCircle,
  Lightbulb,
  LogOut,
  Share2,
  Crown,
  Dices,
  Tag,
  Radio,
  RotateCcw,
  UserCheck,
  X,
} from 'lucide-react';
import {
  playCorrectSound,
  playWrongSound,
  playPointSound,
  playTickSound,
  playLockSound,
  playCountdownBeep,
} from '@/lib/sound';

import {
  pickWeightedQuestion,
  isQuestionAlreadyAsked,
  normalizeQuestionKey,
  type QuestionAnalyticsMap,
} from '@/lib/question-analytics';

interface VersusModeProps {
  poolByLevel: Record<number, QuizQuestionRecord[]>;
  playedIds: string[];
  onMarkQuestionPlayed: (questionId: string, question?: QuizQuestionRecord) => void;
  onRecordOutcome?: (question: QuizQuestionRecord, isCorrect: boolean) => void;
  analyticsMap?: QuestionAnalyticsMap;
  soundEnabled: boolean;
  initialRoomCode?: string | null;
}

const OPTION_LETTERS = ['A', 'B', 'C', 'D'] as const;

// Paliers de nombre de questions sélectionnables de 5 en 5 par l'hôte
const QUESTION_STEPS_5 = [5, 10, 15, 20, 25, 30] as const;

const PLAYER_BADGE_COLORS = [
  'bg-yellow-400 text-blue-950 border-yellow-300',
  'bg-sky-400 text-blue-950 border-sky-300',
  'bg-emerald-400 text-slate-950 border-emerald-300',
  'bg-amber-400 text-blue-950 border-amber-300',
  'bg-pink-400 text-slate-950 border-pink-300',
  'bg-indigo-400 text-white border-indigo-300',
  'bg-teal-400 text-slate-950 border-teal-300',
  'bg-orange-400 text-slate-950 border-orange-300',
];

const SESSION_PLAYER_ID_KEY = '7ter:versus:session_player_id:v2';
const STORAGE_PLAYER_NAME = '7ter:versus:player_name:v1';

function createFreshPlayerId(): string {
  return (
    'p_' +
    Math.random().toString(36).substring(2, 9) +
    '_' +
    Date.now().toString(36)
  );
}

function extractRoomCodeFromInput(raw: string): string {
  if (raw.includes('room=')) {
    const match = raw.match(/[?&]room=([a-zA-Z0-9]+)/i);
    if (match?.[1]) {
      return normalizeRoomCode(match[1]).slice(0, 4);
    }
  }
  return normalizeRoomCode(raw).slice(0, 4);
}

export default function VersusMode({
  poolByLevel,
  playedIds,
  onMarkQuestionPlayed,
  onRecordOutcome,
  analyticsMap = {},
  soundEnabled,
  initialRoomCode,
}: VersusModeProps) {
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [hostQuestionCount, setHostQuestionCount] = useState<number>(10);
  const [joinCodeInput, setJoinCodeInput] = useState<string>(
    initialRoomCode ? extractRoomCodeFromInput(initialRoomCode) : ''
  );

  // Pop-up de choix du nom au moment où un participant rejoint le salon
  const [pendingJoinCode, setPendingJoinCode] = useState<string | null>(null);
  const [joinPopupName, setJoinPopupName] = useState<string>('');
  const [joinPopupError, setJoinPopupError] = useState<string | null>(null);
  const joinNameInputRef = useRef<HTMLInputElement | null>(null);

  const [activeRoomCode, setActiveRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // État synchronisé du salon
  const [roomState, setRoomState] = useState<VersusRoomState | null>(null);

  // Chronomètre haute précision local (10.0s -> 0.0s)
  const [remainingMs, setRemainingMs] = useState<number>(VERSUS_DURATION_MS);
  const [localLockedOption, setLocalLockedOption] = useState<number | null>(null);
  const [, setLocalLockedElapsedMs] = useState<number | null>(null);

  const questionStartPerfRef = useRef<number>(0);
  const lastTickSecondRef = useRef<number>(10);
  const channelRef = useRef<ReturnType<typeof connectVersusChannel> | null>(null);
  const roomStateRef = useRef<VersusRoomState | null>(null);
  const isHostRef = useRef<boolean>(false);
  const playerIdRef = useRef<string>('');
  const playerNameRef = useRef<string>('');
  const soundEnabledRef = useRef<boolean>(soundEnabled);
  const syncSeqRef = useRef<number>(0);

  useEffect(() => {
    roomStateRef.current = roomState;
  }, [roomState]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  useEffect(() => {
    playerNameRef.current = playerName;
  }, [playerName]);

  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
  }, [soundEnabled]);

  // Initialisation de l'identifiant (par onglet via sessionStorage) et du pseudo joueur
  useEffect(() => {
    try {
      let savedId = sessionStorage.getItem(SESSION_PLAYER_ID_KEY);
      if (!savedId) {
        savedId = createFreshPlayerId();
        sessionStorage.setItem(SESSION_PLAYER_ID_KEY, savedId);
      }
      playerIdRef.current = savedId;
      setPlayerId(savedId);

      const savedName = localStorage.getItem(STORAGE_PLAYER_NAME);
      if (savedName) {
        playerNameRef.current = savedName;
        setPlayerName(savedName);
        setJoinPopupName(savedName);
      }
    } catch {
      const fallbackId = createFreshPlayerId();
      playerIdRef.current = fallbackId;
      setPlayerId(fallbackId);
    }
  }, []);

  // Si l'URL contient ?room=XXXX, pré-remplir et ouvrir directement le pop-up de pseudo pour rejoindre
  useEffect(() => {
    if (initialRoomCode && !activeRoomCode) {
      const clean = extractRoomCodeFromInput(initialRoomCode);
      if (clean.length >= 3) {
        setJoinCodeInput(clean);
        setPendingJoinCode(clean);
        setJoinPopupError(null);
      }
    }
  }, [initialRoomCode, activeRoomCode]);

  // Focus automatique sur le champ pseudo à l'ouverture du pop-up
  useEffect(() => {
    if (pendingJoinCode) {
      const timer = setTimeout(() => {
        joinNameInputRef.current?.focus();
        joinNameInputRef.current?.select();
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [pendingJoinCode]);

  const savePlayerName = (name: string) => {
    playerNameRef.current = name;
    setPlayerName(name);
    try {
      localStorage.setItem(STORAGE_PLAYER_NAME, name);
    } catch {
      // Ignore
    }
  };

  // Helper côté Hôte : met à jour l'état du salon de façon synchrone et le diffuse à tous les joueurs
  const commitHostRoomState = useCallback(
    (
      nextOrUpdater:
        | VersusRoomState
        | ((prev: VersusRoomState | null) => VersusRoomState | null)
    ): VersusRoomState | null => {
      const prev = roomStateRef.current;
      const computed =
        typeof nextOrUpdater === 'function'
          ? nextOrUpdater(prev)
          : nextOrUpdater;
      if (!computed) return null;

      syncSeqRef.current += 1;
      const stamped: VersusRoomState = {
        ...computed,
        syncSeq: syncSeqRef.current,
        updatedAt: Date.now(),
      };
      roomStateRef.current = stamped;
      setRoomState(stamped);
      channelRef.current?.sendMessage({
        type: 'ROOM_STATE_SYNC',
        state: stamped,
      });
      return stamped;
    },
    []
  );

  const usedInVersusRef = useRef<Set<string>>(new Set());

  // Sélection d'une question non jouée dans le niveau choisi (exclut strictement les questions déjà posées)
  const pickQuestionForLevel = useCallback(
    (level: number, theme: string): QuizQuestionRecord | null => {
      const playedSet = new Set([
        ...playedIds,
        ...Array.from(usedInVersusRef.current),
      ]);
      const allInLevel = poolByLevel[level] || [];
      const themeFiltered =
        theme === 'ALL'
          ? allInLevel
          : allInLevel.filter((q) => q.theme === theme);

      // 1. Chercher une question inédite dans le niveau + thème choisi
      const unaskedInTheme = themeFiltered.filter(
        (q) => !isQuestionAlreadyAsked(q, playedSet, analyticsMap)
      );
      if (unaskedInTheme.length > 0) {
        const picked = pickWeightedQuestion(
          unaskedInTheme,
          playedSet,
          analyticsMap
        );
        if (picked) {
          usedInVersusRef.current.add(picked.id);
          usedInVersusRef.current.add(normalizeQuestionKey(picked.question));
        }
        return picked;
      }

      // 2. Si le thème choisi n'a plus de questions inédites dans ce niveau, prendre n'importe quel thème de ce niveau
      const unaskedInLevel = allInLevel.filter(
        (q) => !isQuestionAlreadyAsked(q, playedSet, analyticsMap)
      );
      if (unaskedInLevel.length > 0) {
        const picked = pickWeightedQuestion(
          unaskedInLevel,
          playedSet,
          analyticsMap
        );
        if (picked) {
          usedInVersusRef.current.add(picked.id);
          usedInVersusRef.current.add(normalizeQuestionKey(picked.question));
        }
        return picked;
      }

      // 3. Si toutes les questions de ce niveau ont déjà été posées, chercher dans les niveaux voisins
      for (let delta = 1; delta <= 9; delta++) {
        for (const candidateLvl of [level + delta, level - delta]) {
          if (candidateLvl >= 1 && candidateLvl <= 10) {
            const adjList = poolByLevel[candidateLvl] || [];
            const unaskedAdj = adjList.filter(
              (q) => !isQuestionAlreadyAsked(q, playedSet, analyticsMap)
            );
            if (unaskedAdj.length > 0) {
              const picked = pickWeightedQuestion(
                unaskedAdj,
                playedSet,
                analyticsMap
              );
              if (picked) {
                usedInVersusRef.current.add(picked.id);
                usedInVersusRef.current.add(
                  normalizeQuestionKey(picked.question)
                );
              }
              return picked;
            }
          }
        }
      }

      const list = themeFiltered.length > 0 ? themeFiltered : allInLevel;
      const fallback = pickWeightedQuestion(list, playedSet, analyticsMap);
      if (fallback) {
        usedInVersusRef.current.add(fallback.id);
        usedInVersusRef.current.add(normalizeQuestionKey(fallback.question));
      }
      return fallback;
    },
    [poolByLevel, playedIds, analyticsMap]
  );

  // Fonction Hôte : Clôturer la question, calculer les rangs et les points dégressifs sur 10s
  const finalizeQuestionRound = useCallback(
    (current: VersusRoomState): VersusRoomState => {
      if (current.phase === 'reveal' || !current.currentQuestion) {
        return current;
      }

      const correctIdx = current.currentQuestion.correct_index;
      const rawAnswers = { ...current.answers };

      // Trier toutes les bonnes réponses par temps écoulé croissant (le plus rapide en 1er)
      const correctEntries = Object.values(rawAnswers)
        .filter((a) => a.optionIndex === correctIdx)
        .sort((a, b) => a.elapsedMs - b.elapsedMs);

      if (onRecordOutcome) {
        onRecordOutcome(current.currentQuestion, correctEntries.length > 0);
      }

      const rankByPlayerId: Record<string, number> = {};
      correctEntries.forEach((entry, idx) => {
        rankByPlayerId[entry.playerId] = idx + 1;
      });

      const finalizedAnswers: Record<string, VersusPlayerAnswer> = {};
      for (const [pId, ans] of Object.entries(rawAnswers)) {
        const isCorrect = ans.optionIndex === correctIdx;
        const rank = isCorrect ? rankByPlayerId[pId] ?? null : null;
        const pts = calculateVersusPoints(
          ans.elapsedMs,
          isCorrect,
          rank,
          current.doublePoints
        );
        finalizedAnswers[pId] = {
          ...ans,
          isCorrect,
          rank,
          pointsAwarded: pts,
        };
      }

      const updatedPlayers = current.players.map((p) => {
        const ans = finalizedAnswers[p.id];
        const gained = ans ? ans.pointsAwarded : 0;
        const isCorrect = ans ? ans.isCorrect : false;
        return {
          ...p,
          score: p.score + gained,
          lastDelta: gained,
          streak: isCorrect ? p.streak + 1 : 0,
        };
      });

      return {
        ...current,
        phase: 'reveal',
        players: updatedPlayers,
        answers: finalizedAnswers,
      };
    },
    []
  );

  // Connexion au canal temps réel lorsqu'un salon est actif
  useEffect(() => {
    if (!activeRoomCode || !playerId) return;

    const sendJoinHandshake = (conn: ReturnType<typeof connectVersusChannel>) => {
      if (isHostRef.current) return;
      const currentId = playerIdRef.current;
      const currentName = playerNameRef.current.trim() || 'Joueur';
      if (!currentId) return;
      conn.sendMessage({
        type: 'PLAYER_JOIN',
        player: { id: currentId, name: currentName },
      });
      conn.sendMessage({
        type: 'REQUEST_STATE',
        requesterId: currentId,
      });
    };

    const connection = connectVersusChannel(
      activeRoomCode,
      (msg: VersusMessage) => {
        if (isHostRef.current) {
          // L'Hôte traite les événements entrants des joueurs et diffuse le nouvel état
          if (msg.type === 'PLAYER_JOIN') {
            let isNewPlayer = false;
            commitHostRoomState((prev) => {
              if (!prev) return prev;
              const cleanJoinName = msg.player.name.trim() || 'Joueur';
              const exists = prev.players.some((p) => p.id === msg.player.id);
              if (!exists) isNewPlayer = true;
              const nextPlayers = exists
                ? prev.players.map((p) =>
                    p.id === msg.player.id ? { ...p, name: cleanJoinName } : p
                  )
                : [
                    ...prev.players,
                    {
                      id: msg.player.id,
                      name: cleanJoinName,
                      score: 0,
                      isHost: false,
                      colorIndex:
                        prev.players.length % PLAYER_BADGE_COLORS.length,
                      lastDelta: 0,
                      streak: 0,
                    },
                  ];
              return {
                ...prev,
                players: nextPlayers,
              };
            });
            if (isNewPlayer) {
              playPointSound(soundEnabledRef.current);
            }
            return;
          }

          if (msg.type === 'REQUEST_STATE') {
            if (roomStateRef.current) {
              connection.sendMessage({
                type: 'ROOM_STATE_SYNC',
                state: roomStateRef.current,
              });
            }
            return;
          }

          if (msg.type === 'PLAYER_LEAVE') {
            commitHostRoomState((prev) => {
              if (!prev) return prev;
              return {
                ...prev,
                players: prev.players.filter((p) => p.id !== msg.playerId),
              };
            });
            return;
          }

          if (msg.type === 'PLAYER_ANSWER') {
            commitHostRoomState((prev) => {
              if (!prev || prev.phase !== 'question' || !prev.currentQuestion) {
                return prev;
              }
              if (prev.answers[msg.playerId]) {
                return prev;
              }

              // Si le joueur qui répond n'était pas encore dans la liste, l'ajouter à la volée
              const playerExists = prev.players.some(
                (p) => p.id === msg.playerId
              );
              const updatedPlayers = playerExists
                ? prev.players
                : [
                    ...prev.players,
                    {
                      id: msg.playerId,
                      name: msg.playerName.trim() || 'Joueur',
                      score: 0,
                      isHost: false,
                      colorIndex:
                        prev.players.length % PLAYER_BADGE_COLORS.length,
                      lastDelta: 0,
                      streak: 0,
                    },
                  ];

              const isCorrect =
                msg.optionIndex === prev.currentQuestion.correct_index;
              const existingCorrectCount = Object.values(prev.answers).filter(
                (a) => a.isCorrect
              ).length;
              const provisionalRank = isCorrect
                ? existingCorrectCount + 1
                : null;
              const provisionalPoints = calculateVersusPoints(
                msg.elapsedMs,
                isCorrect,
                provisionalRank,
                prev.doublePoints
              );

              const nextAnswers: Record<string, VersusPlayerAnswer> = {
                ...prev.answers,
                [msg.playerId]: {
                  playerId: msg.playerId,
                  playerName: msg.playerName,
                  optionIndex: msg.optionIndex,
                  elapsedMs: msg.elapsedMs,
                  isCorrect,
                  pointsAwarded: provisionalPoints,
                  rank: provisionalRank,
                },
              };

              let nextState: VersusRoomState = {
                ...prev,
                players: updatedPlayers,
                answers: nextAnswers,
              };

              // Si tous les joueurs du salon ont répondu, on révèle immédiatement !
              if (
                Object.keys(nextAnswers).length >= updatedPlayers.length &&
                updatedPlayers.length > 0
              ) {
                nextState = finalizeQuestionRound(nextState);
              }

              return nextState;
            });
          }
        } else {
          // Joueur client : reçoit la synchronisation de l'Hôte
          if (msg.type === 'ROOM_STATE_SYNC' && msg.state) {
            // Protection anti-collision si l'onglet a été dupliqué depuis l'onglet Hôte
            if (msg.state.hostId && msg.state.hostId === playerIdRef.current) {
              const freshId = createFreshPlayerId();
              try {
                sessionStorage.setItem(SESSION_PLAYER_ID_KEY, freshId);
              } catch {
                // Ignore
              }
              playerIdRef.current = freshId;
              setPlayerId(freshId);
              roomStateRef.current = msg.state;
              setRoomState(msg.state);
              connection.sendMessage({
                type: 'PLAYER_JOIN',
                player: {
                  id: freshId,
                  name: playerNameRef.current.trim() || 'Joueur',
                },
              });
              return;
            }

            // Ignorer un snapshot plus ancien provenant du même hôte
            const prev = roomStateRef.current;
            if (
              prev &&
              prev.hostId === msg.state.hostId &&
              typeof prev.syncSeq === 'number' &&
              typeof msg.state.syncSeq === 'number' &&
              msg.state.syncSeq < prev.syncSeq
            ) {
              return;
            }

            roomStateRef.current = msg.state;
            setRoomState(msg.state);

            // Si l'hôte ne nous a pas encore inscrit dans la liste des joueurs, renvoyer immédiatement PLAYER_JOIN
            const myId = playerIdRef.current;
            const myName = playerNameRef.current.trim() || 'Joueur';
            const meInList = msg.state.players.find((p) => p.id === myId);
            if (!meInList || meInList.name !== myName) {
              connection.sendMessage({
                type: 'PLAYER_JOIN',
                player: { id: myId, name: myName },
              });
            }
          }
        }
      },
      (connected) => {
        setIsConnected(connected);
        if (connected) {
          if (isHostRef.current && roomStateRef.current) {
            connection.sendMessage({
              type: 'ROOM_STATE_SYNC',
              state: roomStateRef.current,
            });
          } else if (!isHostRef.current) {
            sendJoinHandshake(connection);
          }
        }
      }
    );

    channelRef.current = connection;

    // Dès l'ouverture du salon par l'Hôte, publier l'état initial (retenu sur les brokers)
    if (isHostRef.current && roomStateRef.current) {
      connection.sendMessage({
        type: 'ROOM_STATE_SYNC',
        state: roomStateRef.current,
      });
    } else if (!isHostRef.current) {
      // Envoi immédiat + boucle de relance automatique tant que le joueur n'est pas confirmé par l'Hôte
      sendJoinHandshake(connection);
    }

    const retryInterval = setInterval(() => {
      if (isHostRef.current) {
        // Côté Hôte : heartbeat de synchronisation en phase lobby pour accueillir instantanément les nouveaux téléphones
        if (roomStateRef.current && roomStateRef.current.phase === 'lobby') {
          connection.sendMessage({
            type: 'ROOM_STATE_SYNC',
            state: roomStateRef.current,
          });
        }
      } else {
        // Côté Joueur : relancer PLAYER_JOIN tant que l'état du salon n'est pas reçu ou que notre pseudo n'y figure pas
        const currentRoom = roomStateRef.current;
        const myId = playerIdRef.current;
        const myName = playerNameRef.current.trim() || 'Joueur';
        const isRegistered =
          currentRoom &&
          currentRoom.players.some((p) => p.id === myId && p.name === myName);
        if (!isRegistered) {
          sendJoinHandshake(connection);
        }
      }
    }, 1200);

    return () => {
      clearInterval(retryInterval);
      connection.disconnect();
      channelRef.current = null;
    };
  }, [activeRoomCode, playerId, commitHostRoomState, finalizeQuestionRound]);

  // Réinitialisation locale et déclenchement du chrono à chaque nouvelle question
  useEffect(() => {
    if (!roomState) return;

    if (roomState.phase === 'countdown') {
      setLocalLockedOption(null);
      setLocalLockedElapsedMs(null);
      setRemainingMs(VERSUS_DURATION_MS);
      playCountdownBeep(soundEnabled, false);
    } else if (roomState.phase === 'question') {
      questionStartPerfRef.current = performance.now();
      lastTickSecondRef.current = 10;
      setRemainingMs(VERSUS_DURATION_MS);
      playCountdownBeep(soundEnabled, true);
    } else if (roomState.phase === 'reveal' && roomState.currentQuestion) {
      const myAns = roomState.answers[playerId];
      if (myAns && myAns.isCorrect) {
        playCorrectSound(soundEnabled);
      } else {
        playWrongSound(soundEnabled);
      }
    }
  }, [roomState?.phase, roomState?.currentQuestion?.id, playerId, soundEnabled]);

  // Gestion du compte à rebours 3 -> 2 -> 1 côté Hôte
  useEffect(() => {
    if (!isHost || !roomState || roomState.phase !== 'countdown') return;

    const timer = setTimeout(() => {
      commitHostRoomState((prev) => {
        if (!prev || prev.phase !== 'countdown') return prev;
        if (prev.countdownValue > 1) {
          playCountdownBeep(soundEnabledRef.current, false);
          return {
            ...prev,
            countdownValue: prev.countdownValue - 1,
          };
        }
        // Passage à la phase question (10 secondes !)
        return {
          ...prev,
          phase: 'question',
          questionStartedAt: Date.now(),
        };
      });
    }, 750);

    return () => clearTimeout(timer);
  }, [isHost, roomState?.phase, roomState?.countdownValue, commitHostRoomState]);

  // Boucle du Timer 10 secondes (fluide 50ms) pendant la phase 'question'
  useEffect(() => {
    if (!roomState || roomState.phase !== 'question') return;

    const interval = setInterval(() => {
      const elapsed = performance.now() - questionStartPerfRef.current;
      const left = Math.max(0, VERSUS_DURATION_MS - elapsed);
      setRemainingMs(left);

      const secCeil = Math.ceil(left / 1000);
      if (
        secCeil !== lastTickSecondRef.current &&
        secCeil <= 5 &&
        secCeil > 0
      ) {
        lastTickSecondRef.current = secCeil;
        playTickSound(soundEnabledRef.current, secCeil <= 3);
      }

      if (left <= 0) {
        clearInterval(interval);
        if (isHostRef.current) {
          commitHostRoomState((prev) => {
            if (!prev || prev.phase !== 'question') return prev;
            return finalizeQuestionRound(prev);
          });
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [
    roomState?.phase,
    roomState?.currentQuestion?.id,
    commitHostRoomState,
    finalizeQuestionRound,
  ]);

  // Actions Hôte & Joueur
  const handleCreateRoom = () => {
    const cleanName = playerName.trim() || 'Hôte 7TER';
    savePlayerName(cleanName);
    setErrorMsg(null);

    let hostPlayerId = playerIdRef.current;
    if (!hostPlayerId) {
      hostPlayerId = createFreshPlayerId();
      playerIdRef.current = hostPlayerId;
      setPlayerId(hostPlayerId);
    }

    const code = generateRoomCode();
    const initialPlayer: VersusPlayer = {
      id: hostPlayerId,
      name: cleanName,
      score: 0,
      isHost: true,
      colorIndex: 0,
      lastDelta: 0,
      streak: 0,
    };

    syncSeqRef.current = 1;
    const initialState: VersusRoomState = {
      roomCode: code,
      hostId: hostPlayerId,
      phase: 'lobby',
      selectedLevel: 3,
      selectedTheme: 'ALL',
      doublePoints: false,
      totalQuestions: hostQuestionCount,
      questionNumber: 0,
      currentQuestion: null,
      questionStartedAt: 0,
      countdownValue: 3,
      players: [initialPlayer],
      answers: {},
      syncSeq: 1,
      updatedAt: Date.now(),
    };

    isHostRef.current = true;
    roomStateRef.current = initialState;
    setIsHost(true);
    setRoomState(initialState);
    setActiveRoomCode(code);
  };

  // Étape 1 pour rejoindre : valide le code de salon et ouvre le Pop-up de choix du pseudo
  const handleOpenJoinPopup = (e: React.FormEvent) => {
    e.preventDefault();
    const code = extractRoomCodeFromInput(joinCodeInput);
    if (code.length < 3) {
      setErrorMsg('Entrez un code de salon valide (ex: 7T42).');
      return;
    }
    setErrorMsg(null);
    setJoinPopupName(playerName);
    setJoinPopupError(null);
    setPendingJoinCode(code);
  };

  // Étape 2 pour rejoindre : valide le pseudo saisi dans le Pop-up et entre dans le salon
  const handleConfirmJoinWithName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingJoinCode) return;
    const cleanName = joinPopupName.trim();
    if (cleanName.length < 1) {
      setJoinPopupError('Choisis ton nom / pseudo pour rejoindre le salon !');
      return;
    }
    savePlayerName(cleanName);
    setJoinPopupError(null);
    const targetCode = pendingJoinCode;
    setPendingJoinCode(null);
    isHostRef.current = false;
    roomStateRef.current = null;
    setIsHost(false);
    setRoomState(null);
    setActiveRoomCode(targetCode);
  };

  const handleLeaveRoom = () => {
    if (channelRef.current && playerId && !isHost) {
      channelRef.current.sendMessage({
        type: 'PLAYER_LEAVE',
        playerId,
      });
    }
    isHostRef.current = false;
    roomStateRef.current = null;
    setActiveRoomCode(null);
    setRoomState(null);
    setIsHost(false);
    setLocalLockedOption(null);
    setLocalLockedElapsedMs(null);
  };

  const handleStartNextQuestion = () => {
    if (!isHost || !roomStateRef.current) return;
    const current = roomStateRef.current;
    const targetTotal = current.totalQuestions || 10;

    // Si on a atteint le nombre total de questions choisies, passer à l'écran de Podium final
    if (current.phase === 'reveal' && current.questionNumber >= targetTotal) {
      playPointSound(soundEnabled);
      commitHostRoomState((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          phase: 'finished',
        };
      });
      return;
    }

    const nextQ = pickQuestionForLevel(
      current.selectedLevel,
      current.selectedTheme
    );
    if (!nextQ) return;

    onMarkQuestionPlayed(nextQ.id, nextQ);

    commitHostRoomState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'countdown',
        countdownValue: 3,
        questionNumber: prev.questionNumber + 1,
        currentQuestion: nextQ,
        questionStartedAt: Date.now(),
        answers: {},
      };
    });
  };

  const handleRestartMatchInSalon = () => {
    if (!isHost || !roomStateRef.current) return;
    playPointSound(soundEnabled);
    commitHostRoomState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        phase: 'lobby',
        questionNumber: 0,
        currentQuestion: null,
        answers: {},
        players: prev.players.map((p) => ({
          ...p,
          score: 0,
          lastDelta: 0,
          streak: 0,
        })),
      };
    });
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!roomState || roomState.phase !== 'question') return;
    if (localLockedOption !== null || roomState.answers[playerId]) return;

    const elapsedMs = Math.max(
      0,
      Math.min(
        VERSUS_DURATION_MS,
        Math.round(performance.now() - questionStartPerfRef.current)
      )
    );

    setLocalLockedOption(optionIndex);
    setLocalLockedElapsedMs(elapsedMs);
    playLockSound(soundEnabled);

    const myName = playerName.trim() || 'Joueur';

    if (isHost) {
      // L'Hôte enregistre sa propre réponse directement et synchronise
      commitHostRoomState((prev) => {
        if (!prev || prev.phase !== 'question' || !prev.currentQuestion) {
          return prev;
        }
        if (prev.answers[playerId]) return prev;

        const isCorrect = optionIndex === prev.currentQuestion.correct_index;
        const existingCorrectCount = Object.values(prev.answers).filter(
          (a) => a.isCorrect
        ).length;
        const provisionalRank = isCorrect ? existingCorrectCount + 1 : null;
        const provisionalPoints = calculateVersusPoints(
          elapsedMs,
          isCorrect,
          provisionalRank,
          prev.doublePoints
        );

        const nextAnswers: Record<string, VersusPlayerAnswer> = {
          ...prev.answers,
          [playerId]: {
            playerId,
            playerName: myName,
            optionIndex,
            elapsedMs,
            isCorrect,
            pointsAwarded: provisionalPoints,
            rank: provisionalRank,
          },
        };

        let nextState: VersusRoomState = {
          ...prev,
          answers: nextAnswers,
        };

        if (
          Object.keys(nextAnswers).length >= prev.players.length &&
          prev.players.length > 0
        ) {
          nextState = finalizeQuestionRound(nextState);
        }

        return nextState;
      });
    } else {
      channelRef.current?.sendMessage({
        type: 'PLAYER_ANSWER',
        playerId,
        playerName: myName,
        optionIndex,
        elapsedMs,
      });
    }
  };

  const handleHostUpdateSettings = (
    partial: Partial<
      Pick<
        VersusRoomState,
        'selectedLevel' | 'selectedTheme' | 'doublePoints' | 'totalQuestions'
      >
    >
  ) => {
    if (!isHost) return;
    commitHostRoomState((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        ...partial,
      };
    });
  };

  const handleSpinRandomLevel = () => {
    if (!isHost || !roomState) return;
    const randomLvl = Math.floor(Math.random() * 10) + 1;
    playPointSound(soundEnabled);
    handleHostUpdateSettings({
      selectedLevel: randomLvl,
      selectedTheme: 'ALL',
    });
  };

  const handleShareRoom = async () => {
    if (!activeRoomCode) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${activeRoomCode}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Salon Versus #${activeRoomCode} — QUIZ du 7TER`,
          text: `Rejoins le salon Versus #${activeRoomCode} sur le Quiz du 7TER !`,
          url,
        });
        return;
      } catch {
        // Fallback copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // Ignore
    }
  };

  const handleCopyCode = async () => {
    if (!activeRoomCode) return;
    try {
      await navigator.clipboard.writeText(activeRoomCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // Ignore
    }
  };

  // Points disponibles en direct pendant la course des 10 secondes
  const liveAvailablePoints = useMemo(() => {
    const elapsed = VERSUS_DURATION_MS - remainingMs;
    const someoneAlreadyCorrect = roomState
      ? Object.values(roomState.answers).some((a) => a.isCorrect)
      : false;
    return calculateVersusPoints(
      elapsed,
      true,
      someoneAlreadyCorrect ? 2 : 1,
      roomState?.doublePoints ?? false
    );
  }, [remainingMs, roomState]);

  // Liste effective des joueurs (inclut le joueur local de façon optimiste dès réception de l'état du salon)
  const effectivePlayers = useMemo(() => {
    if (!roomState) return [];
    const list = [...roomState.players];
    if (!isHost && playerId && !list.some((p) => p.id === playerId)) {
      list.push({
        id: playerId,
        name: playerName.trim() || 'Joueur',
        score: 0,
        isHost: false,
        colorIndex: list.length % PLAYER_BADGE_COLORS.length,
        lastDelta: 0,
        streak: 0,
      });
    }
    return list;
  }, [roomState, isHost, playerId, playerName]);

  const sortedPlayers = useMemo(() => {
    return [...effectivePlayers].sort((a, b) => b.score - a.score);
  }, [effectivePlayers]);

  const totalQuestionsTarget = roomState?.totalQuestions || 10;
  const isLastQuestionOfMatch =
    Boolean(roomState) &&
    roomState!.questionNumber >= totalQuestionsTarget;

  // ============================================================================
  // 1. ÉCRAN D'ACCUEIL DU MODE VERSUS (CRÉER OU REJOINDRE UN SALON)
  // ============================================================================
  if (!activeRoomCode) {
    const hasPrefilledCode = Boolean(
      initialRoomCode && joinCodeInput.length >= 3
    );

    return (
      <section className="relative flex-1 min-h-0 flex flex-col justify-center overflow-y-auto rounded-2xl border-2 border-yellow-400/50 bg-gradient-to-b from-[#0b1d48]/95 via-[#081538]/95 to-[#050d26]/95 p-3.5 ls:p-2 sm:p-6 shadow-2xl backdrop-blur-md animate-fadeIn">
        <div className="mx-auto w-full max-w-2xl space-y-4 ls:space-y-2 my-auto">
          {/* En-tête Mode Versus */}
          <div className="text-center space-y-1.5 ls:space-y-0.5">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-3 py-1 ls:py-0.5 text-xs ls:text-[10px] font-black uppercase tracking-wider text-blue-950 shadow-lg">
              <Swords className="h-3.5 w-3.5 ls:h-3 ls:w-3" />
              <span>Mode Versus · Salon Temps Réel</span>
            </div>
            <h2 className="text-xl sm:text-2xl ls:text-base font-black text-white tracking-tight">
              Le 1er qui répond rafle le jackpot en{' '}
              <span className="text-yellow-400">10 secondes</span> !
            </h2>
            <p className="text-xs sm:text-sm ls:hidden text-blue-200/85 max-w-lg mx-auto">
              Chacun joue sur son téléphone. Dès que la question s’affiche, le
              chrono de <strong className="text-yellow-300">10s</strong> défile
              et les points diminuent à chaque dixième de seconde !
            </p>
          </div>

          {/* Grille 2 colonnes : Créer un salon (avec choix de 5 en 5) VS Rejoindre un salon (avec Pop-up pseudo) */}
          <div className="grid grid-cols-1 landscape:grid-cols-2 sm:grid-cols-2 gap-3.5 ls:gap-2">
            {/* Carte Créer un Salon (Hôte) */}
            <div
              className={`flex flex-col justify-between rounded-xl border-2 border-yellow-400/60 bg-gradient-to-b from-yellow-400/15 to-[#061233] p-4 ls:p-2.5 space-y-3 ls:space-y-2 ${
                hasPrefilledCode ? 'order-2 sm:order-1' : ''
              }`}
            >
              <div className="space-y-2.5 ls:space-y-1.5">
                <div className="flex items-center gap-1.5 text-yellow-300 font-black text-sm ls:text-xs uppercase">
                  <Crown className="h-4 w-4 ls:h-3.5 ls:w-3.5 text-yellow-400" />
                  <span>Héberger un Salon</span>
                </div>

                {/* Pseudo de l'hôte */}
                <div>
                  <label
                    htmlFor="versus-host-pseudo"
                    className="block text-[10px] font-black uppercase tracking-wider text-blue-200/90 mb-1 ls:mb-0.5"
                  >
                    Ton Nom d’Hôte
                  </label>
                  <input
                    id="versus-host-pseudo"
                    type="text"
                    value={playerName}
                    onChange={(e) => savePlayerName(e.target.value)}
                    placeholder="Ex: Thomas..."
                    maxLength={18}
                    className="w-full rounded-xl border border-blue-400/40 focus:border-yellow-400 bg-[#040b1e]/90 px-3 py-2 ls:py-1 text-xs sm:text-sm ls:text-xs font-extrabold text-white placeholder-blue-300/40 outline-none transition"
                  />
                </div>

                {/* Choix du nombre de questions de 5 en 5 */}
                <div>
                  <div className="flex items-center justify-between mb-1 ls:mb-0.5">
                    <span className="text-[10px] font-black uppercase tracking-wider text-yellow-300">
                      Nombre de questions (5 en 5)
                    </span>
                    <span className="rounded-md bg-yellow-400/20 border border-yellow-400/50 px-1.5 py-0.5 text-[10px] font-black text-yellow-300">
                      {hostQuestionCount} questions
                    </span>
                  </div>
                  <div className="grid grid-cols-6 gap-1">
                    {QUESTION_STEPS_5.map((count) => {
                      const active = hostQuestionCount === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() => setHostQuestionCount(count)}
                          className={`rounded-lg py-1.5 ls:py-1 text-xs font-black border transition ${
                            active
                              ? 'bg-yellow-400 text-blue-950 border-white shadow scale-105'
                              : 'bg-[#040b1e]/90 text-blue-200 border-blue-500/35 hover:border-yellow-400/60'
                          }`}
                        >
                          {count}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCreateRoom}
                className="shimmer-btn relative overflow-hidden w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-yellow-400 px-4 py-3 ls:py-2 text-xs sm:text-sm ls:text-xs font-black uppercase tracking-wide text-blue-950 shadow-lg shadow-yellow-400/25 active:scale-95 transition"
              >
                <Play className="h-4 w-4 fill-blue-950" />
                <span>Créer le Salon ({hostQuestionCount} Q.)</span>
              </button>
            </div>

            {/* Carte Rejoindre un Salon (Participants) */}
            <form
              onSubmit={handleOpenJoinPopup}
              className={`flex flex-col justify-between rounded-xl border-2 border-sky-400/50 bg-gradient-to-b from-sky-500/15 to-[#061233] p-4 ls:p-2.5 space-y-3 ls:space-y-2 ${
                hasPrefilledCode ? 'order-1 sm:order-2 ring-2 ring-sky-400/60' : ''
              }`}
            >
              <div className="space-y-2.5 ls:space-y-1.5">
                <div className="flex items-center gap-1.5 text-sky-300 font-black text-sm ls:text-xs uppercase">
                  <Users className="h-4 w-4 ls:h-3.5 ls:w-3.5 text-sky-400" />
                  <span>Rejoindre avec un Code</span>
                </div>
                <p className="text-xs ls:text-[11px] text-blue-100/80 leading-relaxed ls:leading-snug">
                  Entre le code à 4 caractères affiché sur l’écran de l’hôte. Tu
                  choisiras ton pseudo dans la fenêtre suivante.
                </p>
                <input
                  type="text"
                  value={joinCodeInput}
                  onChange={(e) =>
                    setJoinCodeInput(extractRoomCodeFromInput(e.target.value))
                  }
                  placeholder="CODE (ex: 7T42)"
                  maxLength={32}
                  autoCapitalize="characters"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full rounded-xl border-2 border-sky-400/40 focus:border-sky-300 bg-[#040b1e] px-3 py-2.5 ls:py-1.5 text-center font-mono text-xl ls:text-base font-black tracking-widest uppercase text-yellow-300 placeholder-blue-300/35 outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-300 hover:to-blue-400 px-4 py-3 ls:py-2 text-xs sm:text-sm ls:text-xs font-black uppercase tracking-wide text-slate-950 shadow-lg shadow-sky-400/20 active:scale-95 transition"
              >
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                <span>
                  {joinCodeInput.length >= 3
                    ? `Rejoindre #${joinCodeInput}`
                    : 'Rejoindre le Salon'}
                </span>
              </button>
            </form>
          </div>

          {errorMsg && (
            <p className="text-center text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 rounded-lg py-1.5 px-3">
              {errorMsg}
            </p>
          )}
        </div>

        {/* POP-UP MODAL : CHOIX DU NOM DU PARTICIPANT AU MOMENT DE REJOINDRE */}
        {pendingJoinCode && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
            <div className="relative w-full max-w-md rounded-2xl border-2 border-yellow-400 bg-gradient-to-b from-[#0d2256] via-[#09183e] to-[#050d26] p-5 sm:p-6 shadow-2xl space-y-4">
              <button
                type="button"
                onClick={() => setPendingJoinCode(null)}
                className="absolute top-3.5 right-3.5 flex h-8 w-8 items-center justify-center rounded-lg border border-blue-400/30 bg-blue-950/80 text-blue-200 hover:text-white transition"
                title="Fermer"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="text-center space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-blue-950 shadow">
                  <UserCheck className="h-3.5 w-3.5" />
                  <span>SALON #{pendingJoinCode}</span>
                </div>
                <h3 className="text-xl font-black text-white">
                  Choisis ton nom de joueur
                </h3>
                <p className="text-xs text-blue-200/80">
                  Ce pseudo s’affichera en direct sur tous les téléphones du
                  salon.
                </p>
              </div>

              <form onSubmit={handleConfirmJoinWithName} className="space-y-3.5">
                <div>
                  <label
                    htmlFor="popup-player-name"
                    className="block text-[11px] font-black uppercase tracking-wider text-yellow-300 mb-1.5"
                  >
                    Ton Pseudo
                  </label>
                  <input
                    ref={joinNameInputRef}
                    id="popup-player-name"
                    type="text"
                    value={joinPopupName}
                    onChange={(e) => {
                      setJoinPopupName(e.target.value);
                      if (joinPopupError) setJoinPopupError(null);
                    }}
                    placeholder="Ex: Julie, Alex, Le Boss..."
                    maxLength={18}
                    className="w-full rounded-xl border-2 border-yellow-400/70 focus:border-yellow-300 bg-[#040b1e] px-4 py-3 text-base font-extrabold text-white placeholder-blue-300/40 outline-none shadow-inner"
                  />
                  {joinPopupError && (
                    <p className="mt-1.5 text-xs font-bold text-rose-400">
                      {joinPopupError}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setPendingJoinCode(null)}
                    className="flex-1 rounded-xl border border-blue-400/35 bg-blue-950/80 hover:bg-blue-900 px-4 py-3 text-xs font-extrabold uppercase text-blue-200 transition"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="shimmer-btn flex-[2] inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-yellow-400 px-4 py-3 text-xs sm:text-sm font-black uppercase tracking-wide text-blue-950 shadow-lg shadow-yellow-400/25 active:scale-95 transition"
                  >
                    <span>Entrer dans le Salon</span>
                    <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </section>
    );
  }

  // Si on est joueur et qu'on attend la première synchronisation de l'Hôte
  if (!roomState) {
    return (
      <section className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-2xl border-2 border-blue-500/45 bg-[#091942]/95 p-6 text-center space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400/20 border border-yellow-400 text-yellow-300 animate-pulse">
          <Radio className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">
            Connexion au Salon{' '}
            <span className="text-yellow-400 font-mono">#{activeRoomCode}</span>
            …
          </h3>
          <p className="text-xs text-blue-200/75 max-w-sm">
            Bienvenue <strong className="text-yellow-300">{playerName}</strong> !
            En attente du signal de l’hôte sur le salon{' '}
            <strong className="text-white">#{activeRoomCode}</strong>.
          </p>
        </div>
        <button
          type="button"
          onClick={handleLeaveRoom}
          className="inline-flex items-center gap-1.5 rounded-xl border border-blue-400/40 bg-blue-950 px-4 py-2 text-xs font-extrabold text-blue-200 hover:text-white transition"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Changer de code</span>
        </button>
      </section>
    );
  }

  const question = roomState.currentQuestion;
  const myAnswer = roomState.answers[playerId];
  const hasLockedAnswer = localLockedOption !== null || Boolean(myAnswer);
  const effectiveSelectedIdx = myAnswer ? myAnswer.optionIndex : localLockedOption;

  // ============================================================================
  // 2. SALON ACTIF : BANDEAU JOUEURS + ZONE CENTRALE (LOBBY / 3-2-1 / 10S / REVEAL / PODIUM)
  // ============================================================================
  return (
    <div className="flex-1 min-h-0 flex flex-col justify-between gap-2 ls:gap-1">
      {/* BANDEAU HAUT : INFOS SALON + SCORES TEMPS RÉEL DES JOUEURS */}
      <section className="shrink-0 rounded-2xl border border-yellow-400/45 bg-[#091942]/95 px-2.5 py-2 ls:py-1 sm:px-3.5 sm:py-2.5 shadow-lg backdrop-blur-md space-y-2 ls:space-y-1">
        <div className="flex flex-wrap items-center justify-between gap-1.5 ls:gap-1">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-1.5 rounded-lg bg-yellow-400 px-2.5 py-1 ls:py-0.5 text-xs ls:text-[10px] font-black uppercase text-blue-950 shadow hover:bg-yellow-300 transition"
              title="Cliquer pour copier le code du salon"
            >
              <Swords className="h-3.5 w-3.5 ls:h-3 ls:w-3" />
              <span className="font-mono tracking-wider">
                SALON #{roomState.roomCode}
              </span>
              {copiedCode ? (
                <Check className="h-3 w-3 text-emerald-900" />
              ) : (
                <Copy className="h-3 w-3 opacity-75" />
              )}
            </button>

            <button
              type="button"
              onClick={handleShareRoom}
              className="inline-flex items-center gap-1 rounded-lg border border-sky-400/45 bg-sky-500/15 hover:bg-sky-400 hover:text-slate-950 px-2 py-1 ls:py-0.5 text-[11px] ls:text-[10px] font-extrabold text-sky-200 transition"
              title="Partager le lien direct du salon"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3 w-3 text-emerald-400" />
                  <span>Lien copié !</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3 w-3" />
                  <span className="hidden sm:inline">Inviter</span>
                </>
              )}
            </button>

            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'
                }`}
              />
              <span>{effectivePlayers.length} j.</span>
            </span>

            <span className="inline-flex items-center rounded-full bg-blue-950/90 border border-blue-400/35 px-2 py-0.5 text-[10px] font-black text-yellow-300">
              {roomState.questionNumber > 0
                ? `Q. ${roomState.questionNumber}/${totalQuestionsTarget}`
                : `${totalQuestionsTarget} Q.`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {isHost && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-md bg-yellow-400/15 border border-yellow-400/40 px-2 py-0.5 text-[10px] font-black text-yellow-300 uppercase">
                <Crown className="h-3 w-3 text-yellow-400" />
                Hôte
              </span>
            )}
            <button
              type="button"
              onClick={handleLeaveRoom}
              className="inline-flex items-center gap-1 rounded-lg border border-rose-400/35 bg-rose-950/60 hover:bg-rose-500 hover:text-white px-2 py-1 ls:py-0.5 text-[11px] ls:text-[10px] font-extrabold text-rose-200 transition"
              title="Quitter le salon"
            >
              <LogOut className="h-3 w-3" />
              <span className="hidden sm:inline">Quitter</span>
            </button>
          </div>
        </div>

        {/* Cartes des joueurs connectés (triés par score) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 ls:pb-0">
          {sortedPlayers.map((p, idx) => {
            const pAns = roomState.answers[p.id];
            const isMe = p.id === playerId;
            const badgeClass =
              PLAYER_BADGE_COLORS[p.colorIndex % PLAYER_BADGE_COLORS.length];

            return (
              <div
                key={p.id}
                className={`relative flex items-center justify-between gap-2 rounded-xl border px-2.5 py-1.5 ls:px-2 ls:py-0.5 min-w-[130px] sm:min-w-[155px] ls:min-w-[125px] shrink-0 transition-all ${
                  isMe
                    ? 'border-yellow-400 bg-blue-950/95 ring-1 ring-yellow-400/50'
                    : 'border-blue-500/35 bg-[#05102e]/90'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span
                    className={`flex h-5 w-5 ls:h-4 ls:w-4 shrink-0 items-center justify-center rounded-md text-[10px] ls:text-[9px] font-black border ${badgeClass}`}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0 ls:flex ls:items-center ls:gap-1.5">
                    <div className="flex items-center gap-1">
                      <span className="truncate text-xs ls:text-[11px] font-extrabold text-white">
                        {p.name}
                      </span>
                      {p.streak >= 2 && (
                        <span className="inline-flex items-center text-[10px] font-black text-amber-400">
                          🔥{p.streak}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs ls:text-[11px] font-black text-yellow-300">
                        {p.score} pts
                      </span>
                      {roomState.phase === 'reveal' &&
                        typeof p.lastDelta === 'number' &&
                        p.lastDelta > 0 && (
                          <span className="text-[10px] font-black text-emerald-400">
                            +{p.lastDelta}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                {/* Statut de réponse en direct */}
                {roomState.phase === 'question' && (
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                      pAns
                        ? 'bg-emerald-400 text-slate-950 animate-pulse'
                        : 'bg-blue-900/60 text-blue-300/60'
                    }`}
                  >
                    {pAns
                      ? `${(pAns.elapsedMs / 1000).toFixed(1)}s`
                      : '...'}
                  </span>
                )}
                {roomState.phase === 'reveal' && pAns && (
                  <span
                    className={`shrink-0 rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                      pAns.isCorrect
                        ? 'bg-emerald-400 text-slate-950'
                        : 'bg-rose-500 text-white'
                    }`}
                  >
                    {pAns.isCorrect
                      ? pAns.rank === 1
                        ? '🥇 1er'
                        : `#${pAns.rank}`
                      : '✗'}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ====================================================================
          PHASE A : LOBBY D'ATTENTE & RÉGLAGES DU SALON
         ==================================================================== */}
      {roomState.phase === 'lobby' && (
        <section className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto rounded-2xl border-2 border-blue-500/45 bg-gradient-to-b from-[#0b1d48]/95 via-[#081538]/95 to-[#050d26]/95 p-3.5 ls:p-2 sm:p-5 shadow-2xl">
          <div className="my-auto mx-auto w-full max-w-2xl space-y-3.5 ls:space-y-2 text-center">
            <div className="space-y-1 ls:space-y-0.5">
              <span className="text-[11px] ls:text-[10px] font-black uppercase tracking-widest text-yellow-300">
                Code du Salon à partager autour de la table
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="rounded-2xl border-2 border-yellow-400 bg-[#040b1e] px-6 py-1.5 ls:px-4 ls:py-0.5 font-mono text-3xl sm:text-5xl ls:text-2xl font-black tracking-[0.2em] text-yellow-400 shadow-inner">
                  {roomState.roomCode}
                </span>
              </div>
              <p className="text-xs ls:text-[11px] text-blue-200/80 pt-0.5">
                Ouvrez le jeu sur chaque téléphone → Mode{' '}
                <strong className="text-yellow-300">Versus</strong> → Code{' '}
                <strong className="text-white">{roomState.roomCode}</strong> ·
                Partie en{' '}
                <strong className="text-yellow-300">
                  {totalQuestionsTarget} questions
                </strong>
              </p>
            </div>

            {/* Règle de score dégressif en 10s */}
            <div className="grid grid-cols-3 gap-2 text-left ls:hidden">
              <div className="rounded-xl border border-yellow-400/35 bg-blue-950/70 p-2">
                <div className="flex items-center gap-1 text-yellow-300 font-black text-xs">
                  <Timer className="h-3.5 w-3.5" />
                  <span>10 Secondes</span>
                </div>
                <p className="text-[11px] text-blue-100/80 mt-0.5">
                  De <strong>1000 pts</strong> (0s) à <strong>100 pts</strong>{' '}
                  (10s) en continu.
                </p>
              </div>
              <div className="rounded-xl border border-emerald-400/35 bg-blue-950/70 p-2">
                <div className="flex items-center gap-1 text-emerald-300 font-black text-xs">
                  <Trophy className="h-3.5 w-3.5" />
                  <span>Bonus 1er</span>
                </div>
                <p className="text-[11px] text-blue-100/80 mt-0.5">
                  Le <strong>1er à répondre juste</strong> gagne{' '}
                  <strong>+150 pts</strong> bonus !
                </p>
              </div>
              <div className="rounded-xl border border-sky-400/35 bg-blue-950/70 p-2">
                <div className="flex items-center gap-1 text-sky-300 font-black text-xs">
                  <Zap className="h-3.5 w-3.5" />
                  <span>{totalQuestionsTarget} Questions</span>
                </div>
                <p className="text-[11px] text-blue-100/80 mt-0.5">
                  Podium final à l’issue des{' '}
                  <strong>{totalQuestionsTarget} manches</strong>.
                </p>
              </div>
            </div>

            {/* Sélecteurs pour l'Hôte (Nombre de questions de 5 en 5 + Difficulté) */}
            {isHost ? (
              <div className="rounded-xl border border-blue-400/35 bg-[#040b1e]/90 p-3 ls:p-2 space-y-2.5 ls:space-y-1.5">
                {/* Choix du nombre de questions de 5 en 5 */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 ls:pb-1 border-b border-blue-500/25">
                  <span className="text-xs ls:text-[11px] font-black uppercase text-sky-300">
                    Nombre de questions (de 5 en 5) :
                  </span>
                  <div className="flex items-center gap-1">
                    {QUESTION_STEPS_5.map((count) => {
                      const active = totalQuestionsTarget === count;
                      return (
                        <button
                          key={count}
                          type="button"
                          onClick={() =>
                            handleHostUpdateSettings({ totalQuestions: count })
                          }
                          className={`rounded-lg px-2.5 py-1 ls:py-0.5 text-xs ls:text-[11px] font-black border transition ${
                            active
                              ? 'bg-sky-400 text-slate-950 border-white scale-105'
                              : 'bg-blue-950/80 text-blue-200 border-blue-500/30 hover:border-sky-400/50'
                          }`}
                        >
                          {count}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Choix de la difficulté */}
                <div className="flex items-center justify-between">
                  <span className="text-xs ls:text-[11px] font-black uppercase text-yellow-300">
                    Difficulté (Niveau {roomState.selectedLevel}/10)
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleSpinRandomLevel}
                      className="inline-flex items-center gap-1 rounded-lg border border-yellow-400/60 bg-yellow-400/15 hover:bg-yellow-400 hover:text-blue-950 px-2 py-1 ls:py-0.5 text-[11px] ls:text-[10px] font-extrabold text-yellow-300 transition"
                    >
                      <Dices className="h-3.5 w-3.5" />
                      <span>Roulette</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        handleHostUpdateSettings({
                          doublePoints: !roomState.doublePoints,
                        })
                      }
                      className={`inline-flex items-center gap-1 rounded-lg border px-2 py-1 ls:py-0.5 text-[11px] ls:text-[10px] font-extrabold transition ${
                        roomState.doublePoints
                          ? 'border-yellow-300 bg-yellow-400 text-blue-950'
                          : 'border-blue-400/30 bg-blue-950 text-blue-200'
                      }`}
                    >
                      <Zap className="h-3 w-3" />
                      <span>x2</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-10 gap-1">
                  {DIFFICULTY_LEVELS.map((item) => {
                    const active = item.level === roomState.selectedLevel;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() =>
                          handleHostUpdateSettings({ selectedLevel: item.level })
                        }
                        className={`rounded-lg py-1.5 ls:py-1 text-xs ls:text-[11px] font-black border transition ${
                          active
                            ? 'bg-yellow-400 text-blue-950 border-white scale-105'
                            : 'bg-blue-950/80 text-blue-200 border-blue-500/30 hover:border-yellow-400/50'
                        }`}
                      >
                        {item.level}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-blue-400/30 bg-[#040b1e]/80 p-3 ls:p-2 text-xs font-bold text-blue-200">
                🎯 L’hôte prépare la partie (
                <span className="text-sky-300 font-black">
                  {totalQuestionsTarget} questions
                </span>{' '}
                · Niveau{' '}
                <span className="text-yellow-300 font-black">
                  {roomState.selectedLevel}/10
                </span>
                )… Tiens-toi prêt à dégainer !
              </div>
            )}
          </div>

          {/* Bouton Lancer en bas */}
          <div className="shrink-0 pt-2 ls:pt-1 border-t border-blue-500/30 flex items-center justify-between">
            <span className="text-xs font-bold text-blue-200/85">
              {effectivePlayers.length} joueur
              {effectivePlayers.length > 1 ? 's' : ''} dans le salon
            </span>
            {isHost && (
              <button
                type="button"
                onClick={handleStartNextQuestion}
                className="shimmer-btn relative overflow-hidden inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-5 py-2.5 ls:py-1.5 text-xs sm:text-sm ls:text-xs font-black uppercase tracking-wide text-blue-950 shadow-lg shadow-yellow-400/25 active:scale-95 transition"
              >
                <Play className="h-4 w-4 fill-blue-950" />
                <span>
                  Lancer la Partie ({totalQuestionsTarget} Q.) !
                </span>
              </button>
            )}
          </div>
        </section>
      )}

      {/* ====================================================================
          PHASE B : COMPTE À REBOURS 3 - 2 - 1 AVANT LA QUESTION
         ==================================================================== */}
      {roomState.phase === 'countdown' && question && (
        <section className="flex-1 min-h-0 flex flex-col items-center justify-center rounded-2xl border-2 border-yellow-400 bg-gradient-to-b from-[#0b1d48]/95 to-[#050d26]/95 p-6 ls:p-3 text-center space-y-4 ls:space-y-2 animate-fadeIn">
          <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400/20 border border-yellow-400 px-3.5 py-1 ls:py-0.5 text-xs ls:text-[10px] font-black uppercase text-yellow-300">
            <Tag className="h-3.5 w-3.5 ls:h-3 ls:w-3" />
            <span>
              Question {roomState.questionNumber}/{totalQuestionsTarget} · Niv.{' '}
              {question.difficulty} · {question.theme}
            </span>
          </div>
          <div className="flex h-28 w-28 sm:h-32 sm:w-32 ls:h-20 ls:w-20 items-center justify-center rounded-full border-4 border-yellow-400 bg-[#040b1e] shadow-2xl animate-pulse-gold">
            <span className="text-6xl sm:text-7xl ls:text-4xl font-black text-yellow-400">
              {roomState.countdownValue}
            </span>
          </div>
          <p className="text-sm sm:text-base ls:text-xs font-extrabold text-white uppercase tracking-wider">
            Doigt sur l’écran… Le plus rapide gagne le plus de points !
          </p>
        </section>
      )}

      {/* ====================================================================
          PHASE C & D : QUESTION EN COURS (TIMER 10S) OU RÉVÉLATION DES POINTS
         ==================================================================== */}
      {(roomState.phase === 'question' || roomState.phase === 'reveal') &&
        question && (
          <section className="relative flex-1 min-h-0 flex flex-col justify-between gap-2 ls:gap-1 overflow-hidden rounded-2xl border-2 border-blue-500/45 bg-gradient-to-b from-[#0b1d48]/95 via-[#081538]/95 to-[#050d26]/95 p-3 ls:p-2 sm:p-4 shadow-2xl backdrop-blur-md">
            {/* 1. HAUT DE CARTE : BARRE DE CHRONO 10S + JAUGE DE POINTS EN DIRECT + ÉNONCÉ */}
            <div className="shrink-0 space-y-2 ls:space-y-1">
              {roomState.phase === 'question' ? (
                <div className="rounded-xl border border-yellow-400/40 bg-[#040b1e]/95 px-3 py-2 ls:px-2.5 ls:py-1 space-y-1.5 ls:space-y-1">
                  <div className="flex items-center justify-between text-xs font-black">
                    <div className="flex items-center gap-1.5">
                      <Timer
                        className={`h-4 w-4 ls:h-3.5 ls:w-3.5 ${
                          remainingMs <= 3000
                            ? 'text-rose-400 animate-spin'
                            : 'text-yellow-400'
                        }`}
                      />
                      <span
                        className={`font-mono text-sm sm:text-base ls:text-xs ${
                          remainingMs <= 3000
                            ? 'text-rose-400 animate-pulse'
                            : 'text-white'
                        }`}
                      >
                        {(remainingMs / 1000).toFixed(1)}s
                      </span>
                      <span className="text-[11px] ls:text-[10px] font-bold text-blue-200/75 ml-1">
                        · Q. {roomState.questionNumber}/{totalQuestionsTarget}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="rounded-md bg-yellow-400 px-2 py-0.5 font-mono text-xs sm:text-sm ls:text-xs font-black text-blue-950 shadow">
                        ⚡ {liveAvailablePoints} PTS EN JEU
                      </span>
                    </div>
                  </div>

                  {/* Barre de progression 10 secondes fluide */}
                  <div className="h-2.5 ls:h-1.5 w-full overflow-hidden rounded-full bg-blue-950 border border-blue-500/30">
                    <div
                      className={`h-full transition-all duration-75 ease-linear ${
                        remainingMs <= 3000
                          ? 'bg-gradient-to-r from-rose-600 to-rose-400'
                          : remainingMs <= 6000
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-300'
                          : 'bg-gradient-to-r from-emerald-400 to-yellow-400'
                      }`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(100, (remainingMs / VERSUS_DURATION_MS) * 100)
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full bg-yellow-400 text-blue-950 px-2.5 py-0.5 text-[11px] ls:text-[10px] font-black uppercase">
                      <Tag className="h-3 w-3 fill-blue-950" />
                      Niv. {question.difficulty} · {question.theme}
                    </span>
                    {roomState.doublePoints && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 text-blue-950 px-2 py-0.5 text-[11px] ls:text-[10px] font-black">
                        x2
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] ls:text-[10px] font-bold text-blue-200/75">
                    Manche {roomState.questionNumber}/{totalQuestionsTarget}
                  </span>
                </div>
              )}

              {/* Énoncé */}
              <div className="rounded-xl border border-blue-400/30 bg-[#040b1e]/90 px-3.5 py-2.5 ls:px-3 ls:py-1.5 sm:px-5 sm:py-3 shadow-inner">
                <h3 className="text-[15px] sm:text-lg lg:text-xl ls:text-sm font-black text-white leading-snug">
                  {question.question}
                </h3>
              </div>
            </div>

            {/* 2. ZONE CENTRALE : LES 4 OPTIONS + RÉSULTATS DE LA MANCHE */}
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col">
              <div className="my-auto flex flex-col gap-2.5 ls:gap-1.5 py-1 ls:py-0.5">
                <div className="grid grid-cols-1 landscape:grid-cols-2 sm:grid-cols-2 gap-2 ls:gap-1.5">
                  {question.options.map((optionText, idx) => {
                    const isRevealed = roomState.phase === 'reveal';
                    const isCorrect = idx === question.correct_index;
                    const isMyChoice = effectiveSelectedIdx === idx;

                    // Quels joueurs ont choisi cette option (affiché à la révélation)
                    const playersWhoChoseThis = isRevealed
                      ? Object.values(roomState.answers).filter(
                          (a) => a.optionIndex === idx
                        )
                      : [];

                    let buttonStyle =
                      'border-blue-400/35 bg-blue-950/70 hover:bg-blue-900/75 hover:border-yellow-400 text-white';
                    let badgeStyle = 'bg-yellow-400 text-blue-950 font-black';

                    if (!isRevealed && hasLockedAnswer) {
                      if (isMyChoice) {
                        buttonStyle =
                          'border-yellow-400 bg-yellow-400/20 text-yellow-100 ring-2 ring-yellow-400/60';
                        badgeStyle = 'bg-yellow-400 text-blue-950 font-black';
                      } else {
                        buttonStyle =
                          'border-blue-900/40 bg-[#040b1e]/50 text-blue-300/40 opacity-55';
                        badgeStyle = 'bg-blue-950 text-blue-400/40';
                      }
                    } else if (isRevealed) {
                      if (isCorrect) {
                        buttonStyle =
                          'border-emerald-400 bg-emerald-500/25 text-emerald-50 ring-1 ring-emerald-400/60';
                        badgeStyle = 'bg-emerald-400 text-slate-950 font-black';
                      } else if (isMyChoice && !isCorrect) {
                        buttonStyle =
                          'border-rose-400 bg-rose-500/25 text-rose-100 ring-1 ring-rose-400/50';
                        badgeStyle = 'bg-rose-500 text-white font-black';
                      } else {
                        buttonStyle =
                          'border-blue-900/40 bg-[#040b1e]/40 text-blue-300/40 opacity-60';
                        badgeStyle = 'bg-blue-950 text-blue-400/40';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectOption(idx)}
                        disabled={isRevealed || hasLockedAnswer}
                        className={`group relative flex flex-col justify-between gap-1.5 rounded-xl border-2 px-3 py-2.5 sm:px-4 sm:py-3 text-left transition-all duration-150 ${buttonStyle} ${
                          !isRevealed && !hasLockedAnswer
                            ? 'active:scale-[0.98] cursor-pointer'
                            : 'cursor-default'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 w-full">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs sm:text-sm font-black shadow-sm ${badgeStyle}`}
                            >
                              {OPTION_LETTERS[idx]}
                            </span>
                            <span className="text-sm sm:text-base font-bold leading-snug break-words">
                              {optionText}
                            </span>
                          </div>

                          {isRevealed && isCorrect && (
                            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                          )}
                          {isRevealed && isMyChoice && !isCorrect && (
                            <XCircle className="h-5 w-5 shrink-0 text-rose-400" />
                          )}
                        </div>

                        {/* Badges des joueurs ayant choisi cette option (en phase reveal) */}
                        {isRevealed && playersWhoChoseThis.length > 0 && (
                          <div className="flex flex-wrap items-center gap-1 pt-1 border-t border-white/10 w-full">
                            {playersWhoChoseThis.map((ans) => (
                              <span
                                key={ans.playerId}
                                className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-black ${
                                  ans.isCorrect
                                    ? 'bg-emerald-400 text-slate-950'
                                    : 'bg-rose-500/80 text-white'
                                }`}
                              >
                                <span>{ans.playerName}</span>
                                <span className="opacity-80">
                                  {(ans.elapsedMs / 1000).toFixed(1)}s
                                </span>
                                {ans.isCorrect && (
                                  <span>+{ans.pointsAwarded}</span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Bandeau Podium de la Manche + Anecdote (en phase reveal) */}
                {roomState.phase === 'reveal' && (
                  <div className="rounded-xl border border-yellow-400/45 bg-[#040b1e]/95 px-3 py-2.5 space-y-2 animate-fadeIn">
                    {/* Résumé des vitesses de la manche */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-black uppercase text-yellow-300">
                        Sprint de la manche :
                      </span>
                      {Object.values(roomState.answers).length === 0 ? (
                        <span className="text-xs font-bold text-rose-300">
                          Personne n’a répondu dans les 10 secondes !
                        </span>
                      ) : (
                        Object.values(roomState.answers)
                          .sort((a, b) => a.elapsedMs - b.elapsedMs)
                          .map((ans) => (
                            <span
                              key={ans.playerId}
                              className={`inline-flex items-center gap-1 rounded-lg px-2 py-0.5 text-[11px] font-black ${
                                ans.isCorrect
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                                  : 'bg-rose-500/15 text-rose-300 border border-rose-400/30'
                              }`}
                            >
                              <span>
                                {ans.isCorrect
                                  ? ans.rank === 1
                                    ? '🥇 1er'
                                    : `🥈 #${ans.rank}`
                                  : '❌'}
                              </span>
                              <span>{ans.playerName}</span>
                              <span className="opacity-80">
                                {(ans.elapsedMs / 1000).toFixed(2)}s
                              </span>
                              <span>
                                {ans.isCorrect
                                  ? `+${ans.pointsAwarded} pts`
                                  : '+0 pt'}
                              </span>
                            </span>
                          ))
                      )}
                    </div>

                    {/* Anecdote */}
                    <div className="flex items-start gap-2 pt-1 border-t border-blue-500/30">
                      <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-yellow-400 text-blue-950">
                        <Lightbulb className="h-3 w-3" />
                      </div>
                      <p className="text-xs sm:text-sm text-blue-50 leading-snug">
                        <strong className="text-yellow-300 mr-1">
                          L’Anecdote du 7TER :
                        </strong>
                        {question.explanation}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 3. BARRE DU BAS : CONTRÔLES HÔTE POUR LA QUESTION SUIVANTE OU LE PODIUM */}
            <div className="shrink-0 pt-2 border-t border-blue-500/30 flex items-center justify-between gap-2 flex-wrap">
              {roomState.phase === 'reveal' ? (
                isHost ? (
                  <>
                    {!isLastQuestionOfMatch ? (
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className="text-[11px] font-black text-yellow-300 mr-1">
                          Niv. :
                        </span>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() =>
                              handleHostUpdateSettings({ selectedLevel: lvl })
                            }
                            className={`h-6 w-6 rounded-md text-[11px] font-black border transition ${
                              roomState.selectedLevel === lvl
                                ? 'bg-yellow-400 text-blue-950 border-white'
                                : 'bg-blue-950 text-blue-200 border-blue-500/30 hover:border-yellow-400'
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={handleSpinRandomLevel}
                          className="ml-1 inline-flex items-center gap-1 rounded-md border border-yellow-400/60 bg-yellow-400/15 px-2 py-1 text-[11px] font-black text-yellow-300 hover:bg-yellow-400 hover:text-blue-950 transition"
                          title="Niveau aléatoire"
                        >
                          <Dices className="h-3 w-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleHostUpdateSettings({
                              doublePoints: !roomState.doublePoints,
                            })
                          }
                          className={`inline-flex items-center gap-0.5 rounded-md border px-2 py-1 text-[11px] font-black transition ${
                            roomState.doublePoints
                              ? 'bg-yellow-400 text-blue-950 border-white'
                              : 'bg-blue-950 text-blue-200 border-blue-500/30'
                          }`}
                        >
                          x2
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs font-black text-yellow-300">
                        🏁 Manche {roomState.questionNumber}/
                        {totalQuestionsTarget} terminée !
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={handleStartNextQuestion}
                      className="shimmer-btn relative overflow-hidden inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 hover:from-yellow-200 hover:to-yellow-400 px-4 py-2 text-xs sm:text-sm font-black uppercase tracking-wide text-blue-950 shadow-lg shadow-yellow-400/25 active:scale-95 transition-all ml-auto"
                    >
                      {isLastQuestionOfMatch ? (
                        <>
                          <Trophy className="h-4 w-4" />
                          <span>Voir le Podium Final</span>
                        </>
                      ) : (
                        <>
                          <span>
                            Suivante ({roomState.questionNumber + 1}/
                            {totalQuestionsTarget})
                          </span>
                          <ArrowRight className="h-4 w-4 stroke-[2.5]" />
                        </>
                      )}
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-bold text-blue-200/85">
                    {isLastQuestionOfMatch
                      ? '🏁 Dernière question terminée ! En attente de l’affichage du podium final…'
                      : `⏳ En attente de l’hôte pour la question ${
                          roomState.questionNumber + 1
                        }/${totalQuestionsTarget}…`}
                  </span>
                )
              ) : (
                <div className="flex items-center justify-between w-full text-xs font-bold text-blue-200/80">
                  <span>
                    🏃‍♂️ Plus tu réponds tôt dans les 10s, plus tu marques de
                    points !
                  </span>
                  <span className="text-yellow-300 font-black">
                    {Object.keys(roomState.answers).length}/
                    {effectivePlayers.length} réponses
                  </span>
                </div>
              )}
            </div>
          </section>
        )}

      {/* ====================================================================
          PHASE E : PODIUM FINAL À L'ISSUE DU NOMBRE DE QUESTIONS CHOISI
         ==================================================================== */}
      {roomState.phase === 'finished' && (
        <section className="flex-1 min-h-0 flex flex-col justify-between overflow-y-auto rounded-2xl border-2 border-yellow-400 bg-gradient-to-b from-[#0b1d48]/95 via-[#081538]/95 to-[#050d26]/95 p-4 sm:p-6 shadow-2xl animate-fadeIn">
          <div className="my-auto mx-auto w-full max-w-xl space-y-4 text-center">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-yellow-400 px-3 py-1 text-xs font-black uppercase text-blue-950 shadow">
                <Trophy className="h-3.5 w-3.5" />
                <span>Podium Final · {totalQuestionsTarget} Questions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                {sortedPlayers[0]
                  ? `🏆 Victoire de ${sortedPlayers[0].name} !`
                  : 'Partie terminée !'}
              </h2>
            </div>

            <div className="space-y-2 text-left">
              {sortedPlayers.map((p, idx) => {
                const medal =
                  idx === 0
                    ? '🥇'
                    : idx === 1
                    ? '🥈'
                    : idx === 2
                    ? '🥉'
                    : `#${idx + 1}`;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between rounded-xl border px-3.5 py-2.5 ${
                      idx === 0
                        ? 'border-yellow-400 bg-yellow-400/15 ring-1 ring-yellow-400/50'
                        : 'border-blue-400/30 bg-[#040b1e]/90'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg font-black">{medal}</span>
                      <span className="text-sm sm:text-base font-extrabold text-white">
                        {p.name}
                      </span>
                    </div>
                    <span className="font-mono text-sm sm:text-base font-black text-yellow-300">
                      {p.score} pts
                    </span>
                  </div>
                );
              })}
            </div>

            {isHost ? (
              <div className="pt-2 space-y-3">
                <div className="flex flex-wrap items-center justify-center gap-1.5">
                  <span className="text-xs font-black uppercase text-sky-300 mr-1">
                    Prochaine partie (5 en 5) :
                  </span>
                  {QUESTION_STEPS_5.map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() =>
                        handleHostUpdateSettings({ totalQuestions: count })
                      }
                      className={`rounded-lg px-2.5 py-1 text-xs font-black border transition ${
                        totalQuestionsTarget === count
                          ? 'bg-sky-400 text-slate-950 border-white'
                          : 'bg-blue-950 text-blue-200 border-blue-500/35'
                      }`}
                    >
                      {count} Q.
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleRestartMatchInSalon}
                  className="shimmer-btn inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500 px-6 py-3 text-xs sm:text-sm font-black uppercase text-blue-950 shadow-lg active:scale-95 transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Nouvelle Partie dans ce Salon</span>
                </button>
              </div>
            ) : (
              <p className="text-xs font-bold text-blue-200/80">
                En attente de l’hôte pour relancer une nouvelle partie…
              </p>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
