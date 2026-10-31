import {
  type QuizQuestionRecord,
  incrementQuestionPlayed,
  recordQuestionOutcomeSupabase,
  updateQuestionAdminSupabase,
} from './supabase';

export const ADMIN_STATS_STORAGE_KEY = '7ter:question_stats:v1';
export const ADMIN_SETTINGS_STORAGE_KEY = '7ter:admin_settings:v1';
export const ADMIN_SESSION_UNLOCKED_KEY = '7ter:admin_unlocked:v1';

export const VALID_ADMIN_CODES = ['7TER', 'ADMIN', '7TER2026', '1234'];
export const DEFAULT_AUTO_ARCHIVE_THRESHOLD = 1;

export type DifficultyDiagnostic =
  | 'untested'
  | 'calibrated'
  | 'too_easy'
  | 'too_hard';

export interface QuestionAnalyticsEntry {
  questionId: string;
  questionKey: string; // normalized question text for cross-matching local & remote IDs
  timesAnswered: number;
  timesCorrect: number;
  timesWrong: number;
  notes: string;
  difficultyOverride?: number;
  suggestedDifficulty?: number;
  inAlreadyAnsweredPool: boolean;
  manualPoolOverride?: boolean; // true if admin manually forced or restored
  lastAnsweredAt?: string;
  updatedAt?: string;
}

export type QuestionAnalyticsMap = Record<string, QuestionAnalyticsEntry>;

export interface AdminSettings {
  autoArchiveThreshold: number; // default: 1 (any asked question goes to "Déjà répondu" pool and is not re-asked)
  alreadyAnsweredWeight: number; // default: 0 (excluded while fresh questions remain)
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  autoArchiveThreshold: DEFAULT_AUTO_ARCHIVE_THRESHOLD,
  alreadyAnsweredWeight: 0,
};

export function normalizeQuestionKey(questionText: string): string {
  return questionText
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 120);
}

export function verifyAdminCode(input: string): boolean {
  const cleaned = input.trim().toUpperCase();
  return VALID_ADMIN_CODES.includes(cleaned);
}

export function loadQuestionAnalytics(): QuestionAnalyticsMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ADMIN_STATS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      return parsed as QuestionAnalyticsMap;
    }
  } catch {
    // Ignore storage errors
  }
  return {};
}

export function saveQuestionAnalytics(map: QuestionAnalyticsMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_STATS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage errors
  }
}

export function loadAdminSettings(): AdminSettings {
  if (typeof window === 'undefined') return DEFAULT_ADMIN_SETTINGS;
  try {
    const raw = localStorage.getItem(ADMIN_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_ADMIN_SETTINGS;
    const parsed = JSON.parse(raw);
    return {
      autoArchiveThreshold:
        typeof parsed?.autoArchiveThreshold === 'number' &&
        parsed.autoArchiveThreshold >= 1
          ? parsed.autoArchiveThreshold
          : DEFAULT_AUTO_ARCHIVE_THRESHOLD,
      alreadyAnsweredWeight:
        typeof parsed?.alreadyAnsweredWeight === 'number' &&
        parsed.alreadyAnsweredWeight >= 0 &&
        parsed.alreadyAnsweredWeight <= 1
          ? parsed.alreadyAnsweredWeight
          : 0,
    };
  } catch {
    return DEFAULT_ADMIN_SETTINGS;
  }
}

export function saveAdminSettings(settings: AdminSettings): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADMIN_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore
  }
}

/**
 * Calcule le taux de réussite attendu pour un niveau de difficulté donné (1 à 10)
 * Niv 1 : ~90%, Niv 5 : ~58%, Niv 10 : ~18%
 */
export function getExpectedSuccessRateForLevel(level: number): number {
  const clamped = Math.max(1, Math.min(10, level));
  return Math.round(98 - clamped * 8);
}

/**
 * Évalue la difficulté réelle observée d'une question d'après ses statistiques de bonnes/mauvaises réponses
 */
export function evaluateQuestionDifficulty(
  assignedDifficulty: number,
  timesAnswered: number,
  timesCorrect: number
): {
  diagnostic: DifficultyDiagnostic;
  successRate: number | null;
  expectedRate: number;
  suggestedDifficulty: number;
  delta: number;
  label: string;
} {
  const expectedRate = getExpectedSuccessRateForLevel(assignedDifficulty);

  if (timesAnswered <= 0) {
    return {
      diagnostic: 'untested',
      successRate: null,
      expectedRate,
      suggestedDifficulty: assignedDifficulty,
      delta: 0,
      label: 'Non testée',
    };
  }

  const successRate = Math.round((timesCorrect / timesAnswered) * 100);
  // Conversion du taux de réussite observé en niveau estimé (100% -> niv 1, 0% -> niv 10)
  const rawEstimatedLevel = Math.round(10 - (successRate / 100) * 9);
  const estimatedLevel = Math.max(1, Math.min(10, rawEstimatedLevel));

  // Lissage selon le nombre de réponses (à 1 réponse on ajuste prudemment, dès 2+ réponses on fait confiance au réel)
  const weight = timesAnswered === 1 ? 0.5 : 0.85;
  const suggestedDifficulty = Math.max(
    1,
    Math.min(
      10,
      Math.round(
        assignedDifficulty * (1 - weight) + estimatedLevel * weight
      )
    )
  );

  const delta = suggestedDifficulty - assignedDifficulty;
  const rateDiff = successRate - expectedRate;

  if (rateDiff >= 25 || delta <= -2) {
    return {
      diagnostic: 'too_easy',
      successRate,
      expectedRate,
      suggestedDifficulty,
      delta,
      label: `Plus facile que prévu (Niv. ${suggestedDifficulty} conseillé)`,
    };
  }

  if (rateDiff <= -25 || delta >= 2) {
    return {
      diagnostic: 'too_hard',
      successRate,
      expectedRate,
      suggestedDifficulty,
      delta,
      label: `Plus dure que prévu (Niv. ${suggestedDifficulty} conseillé)`,
    };
  }

  return {
    diagnostic: 'calibrated',
    successRate,
    expectedRate,
    suggestedDifficulty,
    delta,
    label: 'Bien calibrée',
  };
}

/**
 * Récupère l'entrée analytique d'une question (fusionne les données locales et celles de Supabase)
 */
export function getQuestionAnalytics(
  question: QuizQuestionRecord,
  map: QuestionAnalyticsMap,
  threshold = DEFAULT_AUTO_ARCHIVE_THRESHOLD
): QuestionAnalyticsEntry {
  const key = normalizeQuestionKey(question.question);
  const existing = map[question.id] || map[key];

  const remotePlayed = question.times_played ?? 0;
  const remoteCorrect = question.times_correct ?? 0;
  const remoteWrong = question.times_wrong ?? 0;

  const timesAnswered = Math.max(
    existing?.timesAnswered ?? 0,
    remotePlayed,
    (existing?.timesCorrect ?? 0) + (existing?.timesWrong ?? 0)
  );
  const timesCorrect = Math.max(existing?.timesCorrect ?? 0, remoteCorrect);
  const timesWrong = Math.max(
    existing?.timesWrong ?? 0,
    remoteWrong,
    Math.max(0, timesAnswered - timesCorrect)
  );

  const notes = existing?.notes || question.difficulty_notes || '';
  const difficultyOverride = existing?.difficultyOverride;

  let inAlreadyAnsweredPool = false;
  if (existing?.manualPoolOverride !== undefined) {
    inAlreadyAnsweredPool = existing.inAlreadyAnsweredPool;
  } else {
    inAlreadyAnsweredPool =
      Boolean(existing?.inAlreadyAnsweredPool) ||
      Boolean(question.is_already_answered) ||
      timesAnswered >= Math.max(1, threshold);
  }

  const evalResult = evaluateQuestionDifficulty(
    difficultyOverride ?? question.difficulty,
    timesAnswered,
    timesCorrect
  );

  return {
    questionId: question.id,
    questionKey: key,
    timesAnswered,
    timesCorrect,
    timesWrong,
    notes,
    difficultyOverride,
    suggestedDifficulty: evalResult.suggestedDifficulty,
    inAlreadyAnsweredPool,
    manualPoolOverride: existing?.manualPoolOverride,
    lastAnsweredAt: existing?.lastAnsweredAt || question.last_played_at,
    updatedAt: existing?.updatedAt,
  };
}

/**
 * Détermine si une question a déjà été posée (que ce soit via son ID, son texte normalisé,
 * son historique local ou son historique Supabase).
 */
export function isQuestionAlreadyAsked(
  question: QuizQuestionRecord,
  playedIdsInSession: Set<string>,
  analyticsMap: QuestionAnalyticsMap,
  threshold = DEFAULT_AUTO_ARCHIVE_THRESHOLD
): boolean {
  const key = normalizeQuestionKey(question.question);
  if (playedIdsInSession.has(question.id) || playedIdsInSession.has(key)) {
    return true;
  }

  const entry = getQuestionAnalytics(question, analyticsMap, threshold);
  if (entry.manualPoolOverride === false) {
    return false;
  }

  return (
    entry.inAlreadyAnsweredPool ||
    entry.timesAnswered > 0 ||
    (question.times_played ?? 0) > 0 ||
    Boolean(question.is_already_answered)
  );
}

/**
 * Marque une question comme ayant été posée (même si aucune option n'a été cliquée, ex: jeu à l'oral ou passage à la suivante).
 */
export function markQuestionAsAsked(
  question: QuizQuestionRecord,
  currentMap?: QuestionAnalyticsMap
): QuestionAnalyticsMap {
  const map = { ...(currentMap ?? loadQuestionAnalytics()) };
  const settings = loadAdminSettings();
  const current = getQuestionAnalytics(
    question,
    map,
    settings.autoArchiveThreshold
  );

  const nextAnswered = Math.max(1, current.timesAnswered);
  const nowIso = new Date().toISOString();

  const updatedEntry: QuestionAnalyticsEntry = {
    ...current,
    questionId: question.id,
    questionKey: normalizeQuestionKey(question.question),
    timesAnswered: nextAnswered,
    inAlreadyAnsweredPool: true,
    manualPoolOverride: undefined,
    lastAnsweredAt: nowIso,
    updatedAt: nowIso,
  };

  map[question.id] = updatedEntry;
  map[updatedEntry.questionKey] = updatedEntry;

  saveQuestionAnalytics(map);
  incrementQuestionPlayed(question.id);

  return map;
}

/**
 * Enregistre une réponse (bonne ou mauvaise) à une question.
 * Dès qu'une question a été posée/répondue, elle bascule dans la base "Déjà répondu"
 * afin de ne plus être reposée.
 */
export function recordQuestionAnswerOutcome(
  question: QuizQuestionRecord,
  isCorrect: boolean,
  currentMap?: QuestionAnalyticsMap
): QuestionAnalyticsMap {
  const map = { ...(currentMap ?? loadQuestionAnalytics()) };
  const settings = loadAdminSettings();
  const current = getQuestionAnalytics(
    question,
    map,
    settings.autoArchiveThreshold
  );

  const nextAnswered = current.timesAnswered + 1;
  const nextCorrect = current.timesCorrect + (isCorrect ? 1 : 0);
  const nextWrong = current.timesWrong + (isCorrect ? 0 : 1);

  const evalResult = evaluateQuestionDifficulty(
    current.difficultyOverride ?? question.difficulty,
    nextAnswered,
    nextCorrect
  );

  const nowIso = new Date().toISOString();
  const updatedEntry: QuestionAnalyticsEntry = {
    ...current,
    questionId: question.id,
    questionKey: normalizeQuestionKey(question.question),
    timesAnswered: nextAnswered,
    timesCorrect: nextCorrect,
    timesWrong: nextWrong,
    suggestedDifficulty: evalResult.suggestedDifficulty,
    inAlreadyAnsweredPool: true,
    manualPoolOverride: undefined,
    lastAnsweredAt: nowIso,
    updatedAt: nowIso,
  };

  map[question.id] = updatedEntry;
  map[updatedEntry.questionKey] = updatedEntry;

  saveQuestionAnalytics(map);

  // Synchronisation non-bloquante avec Supabase (seuil forcé à 1 pour marquer is_already_answered = true dès la 1re fois)
  recordQuestionOutcomeSupabase(question.id, isCorrect, 1);

  return map;
}

/**
 * Met à jour les informations d'administration d'une question (Note, Difficulté, Statut "Déjà répondu")
 */
export function updateQuestionAdminEntry(
  question: QuizQuestionRecord,
  updates: {
    notes?: string;
    difficultyOverride?: number;
    inAlreadyAnsweredPool?: boolean;
    resetStats?: boolean;
  },
  adminCode = '7TER',
  currentMap?: QuestionAnalyticsMap
): QuestionAnalyticsMap {
  const map = { ...(currentMap ?? loadQuestionAnalytics()) };
  const settings = loadAdminSettings();
  const current = getQuestionAnalytics(
    question,
    map,
    settings.autoArchiveThreshold
  );

  const timesAnswered = updates.resetStats ? 0 : current.timesAnswered;
  const timesCorrect = updates.resetStats ? 0 : current.timesCorrect;
  const timesWrong = updates.resetStats ? 0 : current.timesWrong;

  const nextDifficulty =
    updates.difficultyOverride !== undefined
      ? updates.difficultyOverride
      : current.difficultyOverride;

  const nextPoolStatus =
    updates.inAlreadyAnsweredPool !== undefined
      ? updates.inAlreadyAnsweredPool
      : updates.resetStats
      ? false
      : current.inAlreadyAnsweredPool;

  const manualPoolOverride =
    updates.inAlreadyAnsweredPool !== undefined
      ? updates.inAlreadyAnsweredPool
      : updates.resetStats
      ? false
      : current.manualPoolOverride;

  const evalResult = evaluateQuestionDifficulty(
    nextDifficulty ?? question.difficulty,
    timesAnswered,
    timesCorrect
  );

  const nowIso = new Date().toISOString();
  const updatedEntry: QuestionAnalyticsEntry = {
    ...current,
    questionId: question.id,
    questionKey: normalizeQuestionKey(question.question),
    timesAnswered,
    timesCorrect,
    timesWrong,
    notes: updates.notes !== undefined ? updates.notes : current.notes,
    difficultyOverride: nextDifficulty,
    suggestedDifficulty: evalResult.suggestedDifficulty,
    inAlreadyAnsweredPool: nextPoolStatus,
    manualPoolOverride,
    updatedAt: nowIso,
  };

  map[question.id] = updatedEntry;
  map[updatedEntry.questionKey] = updatedEntry;

  saveQuestionAnalytics(map);

  // Sync non-bloquant vers Supabase
  updateQuestionAdminSupabase({
    adminCode,
    questionId: question.id,
    newDifficulty: nextDifficulty,
    newNotes: updatedEntry.notes,
    newAlreadyAnswered: nextPoolStatus,
  });

  return map;
}

/**
 * Trie une liste de questions pour que :
 * 1. Les questions jamais posées passent exclusivement en premier.
 * 2. Les questions déjà posées ne soient placées qu'en toute fin de file (uniquement en cas d'épuisement total).
 */
export function prioritizeQuestionsByAnalytics(
  questions: QuizQuestionRecord[],
  playedIdsInSession: Set<string>,
  analyticsMap: QuestionAnalyticsMap,
  threshold = DEFAULT_AUTO_ARCHIVE_THRESHOLD
): QuizQuestionRecord[] {
  if (questions.length <= 1) return questions;

  const freshUnplayed: QuizQuestionRecord[] = [];
  const alreadyAsked: QuizQuestionRecord[] = [];
  const playedThisSession: QuizQuestionRecord[] = [];

  for (const q of questions) {
    const key = normalizeQuestionKey(q.question);
    const inSession =
      playedIdsInSession.has(q.id) || playedIdsInSession.has(key);

    if (inSession) {
      playedThisSession.push(q);
    } else if (
      isQuestionAlreadyAsked(q, playedIdsInSession, analyticsMap, threshold)
    ) {
      alreadyAsked.push(q);
    } else {
      freshUnplayed.push(q);
    }
  }

  alreadyAsked.sort((a, b) => {
    const aCount = getQuestionAnalytics(a, analyticsMap, threshold).timesAnswered;
    const bCount = getQuestionAnalytics(b, analyticsMap, threshold).timesAnswered;
    return aCount - bCount;
  });

  return [...freshUnplayed, ...alreadyAsked, ...playedThisSession];
}

/**
 * Sélection d'une question aléatoire (pour Versus / Millions) :
 * - Exclut strictement toutes les questions déjà posées tant qu'il reste au moins une question inédite.
 */
export function pickWeightedQuestion(
  candidates: QuizQuestionRecord[],
  playedIdsInSession: Set<string>,
  analyticsMap: QuestionAnalyticsMap,
  excludeId?: string,
  threshold = DEFAULT_AUTO_ARCHIVE_THRESHOLD
): QuizQuestionRecord | null {
  const available = candidates.filter((q) => q.id !== excludeId);
  if (available.length === 0) return candidates[0] || null;

  // Filtrage strict : uniquement les questions qui n'ont JAMAIS été posées
  const strictlyUnasked = available.filter(
    (q) => !isQuestionAlreadyAsked(q, playedIdsInSession, analyticsMap, threshold)
  );

  if (strictlyUnasked.length > 0) {
    return strictlyUnasked[Math.floor(Math.random() * strictlyUnasked.length)];
  }

  // Secours uniquement si 100% des questions ont déjà été posées :
  // exclure d'abord celles jouées dans la session courante
  const notInCurrentSession = available.filter((q) => {
    const key = normalizeQuestionKey(q.question);
    return !playedIdsInSession.has(q.id) && !playedIdsInSession.has(key);
  });

  const fallbackPool =
    notInCurrentSession.length > 0 ? notInCurrentSession : available;

  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
}
