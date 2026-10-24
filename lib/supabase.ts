import { createClient } from '@supabase/supabase-js';
import type { ValidatedQuestion } from './generator';

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bfpyeoeggxhaiyvvltbm.supabase.co';

export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_qW4Y_G7K9sk8Q8mO5TQleg_QGx2pc_7';

export const QUIZ_TABLE = 'trentenaires_questions';

export interface QuizQuestionRecord {
  id: string;
  difficulty: number;
  theme: string;
  question: string;
  options: [string, string, string, string];
  correct_index: number;
  explanation: string;
  target_audience?: string;
  times_played?: number;
  created_at?: string;
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
  },
});

export function getSupabaseServiceClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && serviceKey.trim().length > 0) {
    return createClient(SUPABASE_URL, serviceKey.trim(), {
      auth: { persistSession: false },
    });
  }
  return supabase;
}

export async function fetchQuestionsByLevelFromSupabase(
  level: number
): Promise<QuizQuestionRecord[]> {
  const { data, error } = await supabase
    .from(QUIZ_TABLE)
    .select(
      'id, difficulty, theme, question, options, correct_index, explanation, target_audience, times_played, created_at'
    )
    .eq('difficulty', level)
    .limit(200);

  if (error || !data) {
    throw new Error(error?.message || 'Erreur lors de la lecture Supabase');
  }

  return data.map((row) => ({
    id: String(row.id),
    difficulty: Number(row.difficulty),
    theme: String(row.theme),
    question: String(row.question),
    options: (Array.isArray(row.options) ? row.options.slice(0, 4) : ['', '', '', '']) as [
      string,
      string,
      string,
      string,
    ],
    correct_index: Number(row.correct_index),
    explanation: String(row.explanation),
    target_audience: row.target_audience ?? '30yo_couples',
    times_played: row.times_played ?? 0,
    created_at: row.created_at,
  }));
}

export async function fetchAllQuestionsFromSupabase(): Promise<
  Record<number, QuizQuestionRecord[]>
> {
  const { data, error } = await supabase
    .from(QUIZ_TABLE)
    .select(
      'id, difficulty, theme, question, options, correct_index, explanation, target_audience, times_played, created_at'
    )
    .order('difficulty', { ascending: true })
    .limit(1000);

  if (error || !data) {
    throw new Error(error?.message || 'Erreur lors du pré-chargement Supabase');
  }

  const grouped: Record<number, QuizQuestionRecord[]> = {};
  for (let lvl = 1; lvl <= 10; lvl++) {
    grouped[lvl] = [];
  }

  for (const row of data) {
    const lvl = Number(row.difficulty);
    if (lvl >= 1 && lvl <= 10) {
      grouped[lvl].push({
        id: String(row.id),
        difficulty: lvl,
        theme: String(row.theme),
        question: String(row.question),
        options: (Array.isArray(row.options)
          ? row.options.slice(0, 4)
          : ['', '', '', '']) as [string, string, string, string],
        correct_index: Number(row.correct_index),
        explanation: String(row.explanation),
        target_audience: row.target_audience ?? '30yo_couples',
        times_played: row.times_played ?? 0,
        created_at: row.created_at,
      });
    }
  }

  return grouped;
}

export async function incrementQuestionPlayed(questionId: string): Promise<void> {
  if (!questionId || questionId.startsWith('local-')) return;
  try {
    await supabase.rpc('increment_trentenaires_question_played', {
      question_id: questionId,
    });
  } catch {
    // Non-blocking metrics update
  }
}

export async function insertValidatedQuestions(
  questions: ValidatedQuestion[],
  secretToken = process.env.PREGENERATE_SECRET_TOKEN || 'trentenaires-quiz-seed-2026'
): Promise<number> {
  if (questions.length === 0) return 0;

  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (serviceKey && serviceKey.trim().length > 0) {
    const admin = getSupabaseServiceClient();
    const { data, error } = await admin
      .from(QUIZ_TABLE)
      .insert(
        questions.map((q) => ({
          ...q,
          target_audience: '30yo_couples',
        }))
      )
      .select('id');
    if (error) throw new Error(error.message);
    return data?.length ?? 0;
  }

  const { data, error } = await supabase.rpc('seed_trentenaires_questions', {
    secret_token: secretToken,
    payload: questions.map((q) => ({
      ...q,
      target_audience: '30yo_couples',
    })),
  });

  if (error) {
    throw new Error(error.message);
  }

  return Number(data) || 0;
}
