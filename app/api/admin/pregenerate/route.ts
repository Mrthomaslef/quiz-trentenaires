import { NextResponse } from 'next/server';
import {
  generateQuestionsBatchWithLLM,
  validateQuestionBatch,
} from '@/lib/generator';
import { insertValidatedQuestions } from '@/lib/supabase';
import { ALL_SEED_QUESTIONS } from '@/lib/seed-data';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const tokenFromHeader = authHeader.replace(/^Bearer\s+/i, '').trim();
    const body = await request.json().catch(() => ({}));
    const token = tokenFromHeader || body?.secretToken || '';
    const expectedToken =
      process.env.PREGENERATE_SECRET_TOKEN || 'trentenaires-quiz-seed-2026';

    if (token !== expectedToken) {
      return NextResponse.json(
        { error: 'Non autorisé : PREGENERATE_SECRET_TOKEN invalide.' },
        { status: 401 }
      );
    }

    const level =
      typeof body?.level === 'number' && body.level >= 1 && body.level <= 10
        ? body.level
        : null;
    const useLlm = Boolean(body?.useLlm);

    let batchToInsert = [];

    if (useLlm && level) {
      batchToInsert = await generateQuestionsBatchWithLLM(level, body?.count || 10);
    } else {
      const sourcePool = level
        ? ALL_SEED_QUESTIONS.filter((q) => q.difficulty === level)
        : ALL_SEED_QUESTIONS;
      batchToInsert = validateQuestionBatch(sourcePool);
    }

    const inserted = await insertValidatedQuestions(batchToInsert, expectedToken);

    return NextResponse.json({
      status: 'ok',
      validated: batchToInsert.length,
      inserted,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur serveur';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
