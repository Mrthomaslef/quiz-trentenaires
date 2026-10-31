import { supabase } from './supabase';
import type { QuizQuestionRecord } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type VersusPhase = 'lobby' | 'countdown' | 'question' | 'reveal';

export interface VersusPlayer {
  id: string;
  name: string;
  score: number;
  isHost: boolean;
  colorIndex: number;
  lastDelta?: number;
  streak: number;
}

export interface VersusPlayerAnswer {
  playerId: string;
  playerName: string;
  optionIndex: number; // 0..3, or -1 if timeout
  elapsedMs: number; // 0..10000
  isCorrect: boolean;
  pointsAwarded: number;
  rank: number | null; // 1, 2, 3... among correct answers
}

export interface VersusRoomState {
  roomCode: string;
  hostId: string;
  phase: VersusPhase;
  selectedLevel: number;
  selectedTheme: string;
  doublePoints: boolean;
  questionNumber: number;
  currentQuestion: QuizQuestionRecord | null;
  questionStartedAt: number; // Host timestamp for reference
  countdownValue: number; // 3, 2, 1
  players: VersusPlayer[];
  answers: Record<string, VersusPlayerAnswer>;
}

export type VersusMessage =
  | {
      type: 'PLAYER_JOIN';
      player: { id: string; name: string };
    }
  | {
      type: 'PLAYER_LEAVE';
      playerId: string;
    }
  | {
      type: 'PLAYER_ANSWER';
      playerId: string;
      playerName: string;
      optionIndex: number;
      elapsedMs: number;
    }
  | {
      type: 'REQUEST_STATE';
      requesterId: string;
    }
  | {
      type: 'ROOM_STATE_SYNC';
      state: VersusRoomState;
    };

export const VERSUS_DURATION_MS = 10_000; // 10 secondes
export const VERSUS_MAX_POINTS = 1000;
export const VERSUS_MIN_POINTS = 100;

/**
 * Calcule les points gagnés en fonction du temps écoulé sur 10 secondes.
 * À 0s -> 1000 pts, décroît linéairement jusqu'à 100 pts à 10s.
 * Le 1er joueur à avoir la bonne réponse reçoit en plus un bonus de vitesse (+150 pts).
 */
export function calculateVersusPoints(
  elapsedMs: number,
  isCorrect: boolean,
  correctRank: number | null,
  doublePoints = false
): number {
  if (!isCorrect) return 0;
  const clamped = Math.max(0, Math.min(VERSUS_DURATION_MS, elapsedMs));
  const ratio = (VERSUS_DURATION_MS - clamped) / VERSUS_DURATION_MS;
  const timePoints = Math.round(
    VERSUS_MIN_POINTS + (VERSUS_MAX_POINTS - VERSUS_MIN_POINTS) * ratio
  );
  const firstBonus =
    correctRank === 1 ? 150 : correctRank === 2 ? 50 : 0;
  const total = timePoints + firstBonus;
  return doublePoints ? total * 2 : total;
}

/**
 * Génère un code de salon court et lisible à 4 caractères (sans 0/O/1/I).
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Crée un pont temps réel hybride :
 * 1. Supabase Realtime Broadcast (multi-téléphones via Internet / 4G / Wi-Fi)
 * 2. BroadcastChannel natif du navigateur (synchronisation <1ms entre onglets locaux)
 */
export function connectVersusChannel(
  roomCode: string,
  onMessage: (msg: VersusMessage) => void,
  onStatusChange?: (connected: boolean) => void
) {
  const normalizedCode = roomCode.trim().toUpperCase();
  const channelName = `quiz7ter:versus:${normalizedCode}`;

  // 1. Canal local multi-onglets (fallback instantané)
  let localBC: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      localBC = new BroadcastChannel(channelName);
      localBC.onmessage = (event) => {
        if (event?.data) {
          onMessage(event.data as VersusMessage);
        }
      };
    } catch {
      localBC = null;
    }
  }

  // 2. Canal Supabase Realtime Broadcast (multi-smartphones)
  const realtimeChannel: RealtimeChannel = supabase.channel(channelName, {
    config: {
      broadcast: { self: false, ack: false },
    },
  });

  realtimeChannel
    .on('broadcast', { event: 'versus_msg' }, (payload) => {
      if (payload?.payload) {
        onMessage(payload.payload as VersusMessage);
      }
    })
    .subscribe((status) => {
      if (onStatusChange) {
        onStatusChange(status === 'SUBSCRIBED');
      }
    });

  const sendMessage = (msg: VersusMessage) => {
    // Envoi local inter-onglets
    if (localBC) {
      try {
        localBC.postMessage(msg);
      } catch {
        // Ignore
      }
    }
    // Envoi Supabase Realtime vers tous les téléphones du salon
    realtimeChannel
      .send({
        type: 'broadcast',
        event: 'versus_msg',
        payload: msg,
      })
      .catch(() => {});
  };

  const disconnect = () => {
    if (localBC) {
      try {
        localBC.close();
      } catch {
        // Ignore
      }
    }
    supabase.removeChannel(realtimeChannel).catch(() => {});
  };

  return {
    sendMessage,
    disconnect,
  };
}
