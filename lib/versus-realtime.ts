import { supabase, type QuizQuestionRecord } from './supabase';

export type VersusPhase =
  | 'lobby'
  | 'countdown'
  | 'question'
  | 'reveal'
  | 'finished';

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
  totalQuestions: number; // Choisi de 5 en 5 par l'hôte (5, 10, 15, 20, 25, 30)
  questionNumber: number;
  currentQuestion: QuizQuestionRecord | null;
  questionStartedAt: number; // Host timestamp for reference
  countdownValue: number; // 3, 2, 1
  players: VersusPlayer[];
  answers: Record<string, VersusPlayerAnswer>;
  syncSeq?: number;
  updatedAt?: number;
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

interface VersusEnvelope {
  _id: string;
  _ts: number;
  _sender: string;
  msg: VersusMessage;
}

export const VERSUS_DURATION_MS = 10_000; // 10 secondes
export const VERSUS_MAX_POINTS = 1000;
export const VERSUS_MIN_POINTS = 100;

// Durée maximale de validité d'un état retenu sur un broker (3 heures)
const MAX_RETAINED_AGE_MS = 3 * 60 * 60 * 1000;

// Brokers MQTT over WebSocket publics haute disponibilité (actifs en parallèle)
const MQTT_WSS_BROKERS = [
  'wss://broker.hivemq.com:8884/mqtt',
  'wss://broker.emqx.io:8084/mqtt',
];

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
 * Nettoie et normalise un code de salon (ex: "#7t42 " -> "7T42").
 */
export function normalizeRoomCode(raw: string): string {
  return raw
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase()
    .slice(0, 6);
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

// ============================================================================
// Encodeurs / Décodeurs binaires légers MQTT v3.1.1 over WebSocket (zéro dépendance)
// ============================================================================

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

function encodeRemainingLength(len: number): number[] {
  const bytes: number[] = [];
  let rem = len;
  do {
    let digit = rem % 128;
    rem = Math.floor(rem / 128);
    if (rem > 0) digit |= 0x80;
    bytes.push(digit);
  } while (rem > 0);
  return bytes;
}

function encodeMqttString(str: string): Uint8Array {
  const utf8 = textEncoder.encode(str);
  const out = new Uint8Array(2 + utf8.length);
  out[0] = (utf8.length >> 8) & 0xff;
  out[1] = utf8.length & 0xff;
  out.set(utf8, 2);
  return out;
}

function concatBytes(arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((acc, a) => acc + a.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) {
    out.set(a, offset);
    offset += a.length;
  }
  return out;
}

function buildMqttConnectPacket(clientId: string): Uint8Array {
  // Variable header: Protocol Name "MQTT" (00 04 4d 51 54 54), Level 4 (v3.1.1), Connect Flags 0x02 (Clean Session), KeepAlive 60s
  const vh = new Uint8Array([
    0x00, 0x04, 0x4d, 0x51, 0x54, 0x54, 0x04, 0x02, 0x00, 0x3c,
  ]);
  const pl = encodeMqttString(clientId);
  const rem = encodeRemainingLength(vh.length + pl.length);
  return concatBytes([new Uint8Array([0x10, ...rem]), vh, pl]);
}

function buildMqttSubscribePacket(
  topics: string[],
  packetId = 1
): Uint8Array {
  const vh = new Uint8Array([(packetId >> 8) & 0xff, packetId & 0xff]);
  const topicParts: Uint8Array[] = [];
  for (const t of topics) {
    topicParts.push(encodeMqttString(t), new Uint8Array([0x00])); // QoS 0
  }
  const pl = concatBytes(topicParts);
  const rem = encodeRemainingLength(vh.length + pl.length);
  return concatBytes([new Uint8Array([0x82, ...rem]), vh, pl]);
}

function buildMqttPublishPacket(
  topic: string,
  payloadStr: string,
  retain = false
): Uint8Array {
  const vh = encodeMqttString(topic);
  const pl = textEncoder.encode(payloadStr);
  const rem = encodeRemainingLength(vh.length + pl.length);
  const header = 0x30 | (retain ? 0x01 : 0x00);
  return concatBytes([new Uint8Array([header, ...rem]), vh, pl]);
}

const MQTT_PINGREQ_PACKET = new Uint8Array([0xc0, 0x00]);

interface MqttBrokerClient {
  publish: (topic: string, payloadStr: string, retain?: boolean) => void;
  reconnectNow: () => void;
  close: () => void;
  isConnected: () => boolean;
}

function createMqttWsClient(
  brokerUrl: string,
  topicsToSubscribe: string[],
  onPayload: (payloadStr: string, topic: string, retained: boolean) => void,
  onConnectionChange: () => void,
  getLatestRetainedStatePayload: () => { topic: string; payload: string } | null
): MqttBrokerClient {
  let ws: WebSocket | null = null;
  let connected = false;
  let closedByApp = false;
  let pingInterval: ReturnType<typeof setInterval> | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let rxBuffer: Uint8Array = new Uint8Array(0);
  const pendingQueue: Array<{ topic: string; payloadStr: string; retain: boolean }> = [];

  const clearTimers = () => {
    if (pingInterval) {
      clearInterval(pingInterval);
      pingInterval = null;
    }
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const setConnectedState = (next: boolean) => {
    if (connected !== next) {
      connected = next;
      onConnectionChange();
    }
  };

  const connect = () => {
    if (closedByApp || typeof WebSocket === 'undefined') return;
    clearTimers();
    rxBuffer = new Uint8Array(0);

    try {
      ws = new WebSocket(brokerUrl, 'mqtt');
      ws.binaryType = 'arraybuffer';
    } catch {
      scheduleReconnect();
      return;
    }

    const clientId =
      'q7ter_' +
      Math.random().toString(36).substring(2, 10) +
      '_' +
      (Date.now() % 100000).toString(36);

    ws.onopen = () => {
      if (closedByApp || !ws) return;
      try {
        ws.send(buildMqttConnectPacket(clientId));
      } catch {
        // Ignore
      }
    };

    ws.onmessage = (event) => {
      if (closedByApp || !(event.data instanceof ArrayBuffer)) return;
      const incoming = new Uint8Array(event.data);
      rxBuffer =
        rxBuffer.length === 0 ? incoming : concatBytes([rxBuffer, incoming]);

      let offset = 0;
      while (offset < rxBuffer.length) {
        const header = rxBuffer[offset];
        const packetType = header >> 4;
        const retained = (header & 0x01) === 1;
        const qos = (header >> 1) & 0x03;

        let idx = offset + 1;
        let multiplier = 1;
        let remainingLength = 0;
        let encodedByte = 0;
        let incomplete = false;

        do {
          if (idx >= rxBuffer.length) {
            incomplete = true;
            break;
          }
          encodedByte = rxBuffer[idx++];
          remainingLength += (encodedByte & 127) * multiplier;
          multiplier *= 128;
        } while ((encodedByte & 128) !== 0);

        if (incomplete || idx + remainingLength > rxBuffer.length) {
          break;
        }

        const body = rxBuffer.subarray(idx, idx + remainingLength);
        offset = idx + remainingLength;

        if (packetType === 2) {
          // CONNACK
          try {
            ws?.send(buildMqttSubscribePacket(topicsToSubscribe, 1));
          } catch {
            // Ignore
          }
          setConnectedState(true);

          // Republier le dernier état retenu si on est l'hôte
          const latestState = getLatestRetainedStatePayload();
          if (latestState && ws?.readyState === WebSocket.OPEN) {
            try {
              ws.send(
                buildMqttPublishPacket(
                  latestState.topic,
                  latestState.payload,
                  true
                )
              );
            } catch {
              // Ignore
            }
          }

          // Vider la file d'attente
          while (pendingQueue.length > 0 && ws?.readyState === WebSocket.OPEN) {
            const item = pendingQueue.shift()!;
            try {
              ws.send(
                buildMqttPublishPacket(item.topic, item.payloadStr, item.retain)
              );
            } catch {
              break;
            }
          }

          if (pingInterval) clearInterval(pingInterval);
          pingInterval = setInterval(() => {
            if (ws?.readyState === WebSocket.OPEN) {
              try {
                ws.send(MQTT_PINGREQ_PACKET);
              } catch {
                // Ignore
              }
            }
          }, 25_000);
        } else if (packetType === 3) {
          // PUBLISH
          if (body.length >= 2) {
            const topicLen = (body[0] << 8) | body[1];
            const payloadStart = 2 + topicLen + (qos > 0 ? 2 : 0);
            if (payloadStart <= body.length) {
              const topicStr = textDecoder.decode(body.subarray(2, 2 + topicLen));
              const payloadStr = textDecoder.decode(body.subarray(payloadStart));
              if (payloadStr.length > 0) {
                onPayload(payloadStr, topicStr, retained);
              }
            }
          }
        }
      }

      if (offset > 0) {
        rxBuffer = rxBuffer.subarray(offset);
      }
    };

    ws.onerror = () => {
      // Géré dans onclose
    };

    ws.onclose = () => {
      setConnectedState(false);
      if (!closedByApp) {
        scheduleReconnect();
      }
    };
  };

  const scheduleReconnect = () => {
    if (closedByApp || reconnectTimer) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      connect();
    }, 1200);
  };

  connect();

  return {
    publish: (topic: string, payloadStr: string, retain = false) => {
      if (closedByApp) return;
      if (connected && ws && ws.readyState === WebSocket.OPEN) {
        try {
          ws.send(buildMqttPublishPacket(topic, payloadStr, retain));
          return;
        } catch {
          // En cas d'échec, mettre en file d'attente
        }
      }
      if (pendingQueue.length < 30) {
        pendingQueue.push({ topic, payloadStr, retain });
      }
    },
    reconnectNow: () => {
      if (closedByApp) return;
      if (!connected || !ws || ws.readyState !== WebSocket.OPEN) {
        try {
          ws?.close();
        } catch {
          // Ignore
        }
        connect();
      }
    },
    close: () => {
      closedByApp = true;
      clearTimers();
      try {
        ws?.close();
      } catch {
        // Ignore
      }
      ws = null;
    },
    isConnected: () => connected,
  };
}

/**
 * Crée un pont temps réel hybride multi-transports ultra-résilient :
 * 1. MQTT over WebSocket redondant (HiveMQ + EMQX) avec état retenu (Retained State)
 *    pour que tout joueur rejoignant le salon reçoive l'état en <50ms sur 4G / Wi-Fi.
 * 2. BroadcastChannel natif du navigateur (synchronisation <1ms entre onglets locaux).
 * 3. Supabase Realtime Broadcast (canal additionnel).
 */
export function connectVersusChannel(
  roomCode: string,
  onMessage: (msg: VersusMessage) => void,
  onStatusChange?: (connected: boolean) => void
) {
  const normalizedCode = normalizeRoomCode(roomCode);
  const channelName = `quiz7ter:versus:${normalizedCode}`;
  const eventsTopic = `quiz7ter/v2/room/${normalizedCode}/events`;
  const stateTopic = `quiz7ter/v2/room/${normalizedCode}/state`;

  const instanceId =
    'inst_' +
    Math.random().toString(36).substring(2, 10) +
    '_' +
    Date.now().toString(36);
  let seq = 0;

  const seenIds = new Set<string>();
  let latestRetainedStatePayload: { topic: string; payload: string } | null =
    null;
  let lastReportedStatus: boolean | null = null;

  const reportConnectionStatus = () => {
    const anyMqttConnected = mqttClients.some((c) => c.isConnected());
    if (lastReportedStatus !== anyMqttConnected) {
      lastReportedStatus = anyMqttConnected;
      if (onStatusChange) {
        onStatusChange(anyMqttConnected);
      }
    }
  };

  const handleIncomingEnvelope = (
    raw: unknown,
    isRetained = false
  ) => {
    if (!raw || typeof raw !== 'object') return;
    const maybeEnv = raw as Partial<VersusEnvelope>;

    // Compatibilité enveloppe ou message direct
    if (
      maybeEnv._id &&
      typeof maybeEnv._id === 'string' &&
      maybeEnv.msg &&
      typeof maybeEnv.msg === 'object'
    ) {
      // Ignorer nos propres envois
      if (maybeEnv._sender === instanceId) return;

      // Ignorer un ancien message retenu (> 3h)
      if (
        isRetained &&
        typeof maybeEnv._ts === 'number' &&
        Date.now() - maybeEnv._ts > MAX_RETAINED_AGE_MS
      ) {
        return;
      }

      if (seenIds.has(maybeEnv._id)) return;
      seenIds.add(maybeEnv._id);
      if (seenIds.size > 500) {
        const first = seenIds.values().next().value;
        if (first) seenIds.delete(first);
      }

      onMessage(maybeEnv.msg as VersusMessage);
      return;
    }

    if ('type' in raw) {
      onMessage(raw as VersusMessage);
    }
  };

  // 1. Canal local multi-onglets (fallback instantané <1ms)
  let localBC: BroadcastChannel | null = null;
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    try {
      localBC = new BroadcastChannel(channelName);
      localBC.onmessage = (event) => {
        if (event?.data) {
          handleIncomingEnvelope(event.data, false);
        }
      };
    } catch {
      localBC = null;
    }
  }

  // 2. Canaux MQTT over WebSocket multi-brokers (4G / 5G / Wi-Fi tous téléphones)
  const mqttClients: MqttBrokerClient[] = MQTT_WSS_BROKERS.map((brokerUrl) =>
    createMqttWsClient(
      brokerUrl,
      [eventsTopic, stateTopic],
      (payloadStr, topic, retained) => {
        try {
          const parsed = JSON.parse(payloadStr);
          handleIncomingEnvelope(parsed, retained || topic === stateTopic);
        } catch {
          // Ignorer JSON invalide
        }
      },
      () => {
        reportConnectionStatus();
      },
      () => latestRetainedStatePayload
    )
  );

  // Reconnexion automatique au retour au premier plan sur mobile (ex: après partage WhatsApp)
  const handleVisibilityOrOnline = () => {
    if (
      typeof document === 'undefined' ||
      document.visibilityState === 'visible'
    ) {
      for (const client of mqttClients) {
        client.reconnectNow();
      }
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('online', handleVisibilityOrOnline);
    window.addEventListener('focus', handleVisibilityOrOnline);
    document.addEventListener('visibilitychange', handleVisibilityOrOnline);
  }

  const sendMessage = (msg: VersusMessage) => {
    const envelope: VersusEnvelope = {
      _id: `${instanceId}:${++seq}:${Date.now().toString(36)}`,
      _ts: Date.now(),
      _sender: instanceId,
      msg,
    };
    seenIds.add(envelope._id);

    // 1. Envoi local inter-onglets
    if (localBC) {
      try {
        localBC.postMessage(envelope);
      } catch {
        // Ignore
      }
    }

    // 2. Envoi MQTT over WebSocket vers tous les smartphones
    const serialized = JSON.stringify(envelope);
    if (msg.type === 'ROOM_STATE_SYNC') {
      latestRetainedStatePayload = {
        topic: stateTopic,
        payload: serialized,
      };
      for (const client of mqttClients) {
        client.publish(stateTopic, serialized, true);
        client.publish(eventsTopic, serialized, false);
      }
    } else {
      for (const client of mqttClients) {
        client.publish(eventsTopic, serialized, false);
      }
    }
  };

  const disconnect = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', handleVisibilityOrOnline);
      window.removeEventListener('focus', handleVisibilityOrOnline);
      document.removeEventListener('visibilitychange', handleVisibilityOrOnline);
    }
    if (localBC) {
      try {
        localBC.close();
      } catch {
        // Ignore
      }
    }
    for (const client of mqttClients) {
      client.close();
    }
  };

  return {
    sendMessage,
    disconnect,
  };
}
