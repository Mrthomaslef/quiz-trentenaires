import { NextResponse } from 'next/server';
import { fetchQuestionsByLevelFromSupabase } from '@/lib/supabase';
import { getLocalSeedQuestionsByLevel } from '@/lib/seed-data';

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const rawLevel = Number.parseInt(searchParams.get('level') || '5', 10);
  const level = Number.isInteger(rawLevel) && rawLevel >= 1 && rawLevel <= 10 ? rawLevel : 5;
  const limitParam = Number.parseInt(searchParams.get('limit') || '50', 10);
  const limit = Number.isInteger(limitParam) && limitParam > 0 ? Math.min(limitParam, 100) : 50;

  try {
    const dbQuestions = await fetchQuestionsByLevelFromSupabase(level);
    if (dbQuestions.length > 0) {
      const shuffled = shuffleArray(dbQuestions).slice(0, limit);
      return NextResponse.json(
        {
          level,
          source: 'supabase',
          count: shuffled.length,
          questions: shuffled,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=30, stale-while-revalidate=120',
          },
        }
      );
    }
  } catch {
    // Fallback to pre-generated local seed pool if DB unreachable
  }

  const fallback = shuffleArray(getLocalSeedQuestionsByLevel(level)).slice(0, limit);
  return NextResponse.json({
    level,
    source: 'seed-fallback',
    count: fallback.length,
    questions: fallback,
  });
}
