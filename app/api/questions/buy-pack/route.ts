import { NextResponse } from 'next/server';
import {
  generateRandomTenQuestionsWithLLM,
  validateQuestionBatch,
  type ValidatedQuestion,
} from '@/lib/generator';
import { insertValidatedQuestions, type QuizQuestionRecord } from '@/lib/supabase';
import { BONUS_SHOP_QUESTIONS } from '@/lib/bonus-shop-questions';
import { normalizeQuestionKey } from '@/lib/question-analytics';

function pickTenUnseenBonusQuestions(
  excludeKeys: Set<string>,
  count = 10
): ValidatedQuestion[] {
  const pool = [...BONUS_SHOP_QUESTIONS];
  // Shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const unseen = pool.filter(
    (q) => !excludeKeys.has(normalizeQuestionKey(q.question))
  );
  const chosen =
    unseen.length >= count
      ? unseen.slice(0, count)
      : [...unseen, ...pool.filter((q) => !unseen.includes(q))].slice(0, count);

  return validateQuestionBatch(chosen);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const existingKeysArray: string[] = Array.isArray(body?.excludeKeys)
      ? body.excludeKeys
      : [];
    const excludeKeys = new Set<string>(existingKeysArray);
    const pseudo =
      typeof body?.pseudo === 'string' && body.pseudo.trim().length > 0
        ? body.pseudo.trim()
        : 'Joueur';

    let generatedBatch: ValidatedQuestion[] = [];
    let source: 'ai' | 'bonus-pack' = 'ai';

    try {
      generatedBatch = await generateRandomTenQuestionsWithLLM(10);
      if (generatedBatch.length < 10) {
        const extra = pickTenUnseenBonusQuestions(
          new Set([
            ...Array.from(excludeKeys),
            ...generatedBatch.map((q) => normalizeQuestionKey(q.question)),
          ]),
          10 - generatedBatch.length
        );
        generatedBatch = [...generatedBatch, ...extra];
      }
    } catch {
      source = 'bonus-pack';
      generatedBatch = pickTenUnseenBonusQuestions(excludeKeys, 10);
    }

    let insertedCount = 0;
    try {
      insertedCount = await insertValidatedQuestions(generatedBatch);
    } catch {
      // Non-blocking if Supabase RPC is offline; questions are still returned and added locally
    }

    const nowTs = Date.now();
    const records: QuizQuestionRecord[] = generatedBatch.map((q, idx) => ({
      id: `custom-pack-${nowTs}-${idx + 1}`,
      difficulty: q.difficulty,
      theme: q.theme,
      question: q.question,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation,
      target_audience: '30yo_couples',
      times_played: 0,
      times_correct: 0,
      times_wrong: 0,
      difficulty_notes: `Créée par ${pseudo} via la Boutique Millions`,
      is_already_answered: false,
      created_at: new Date().toISOString(),
    }));

    return NextResponse.json({
      status: 'ok',
      source,
      count: records.length,
      insertedSupabase: insertedCount,
      questions: records,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
