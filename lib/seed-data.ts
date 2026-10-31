import { QUESTIONS_PART_1, type RawSeedQuestion } from './questions-part1';
import { QUESTIONS_PART_2 } from './questions-part2';
import { QUESTIONS_PART_3 } from './questions-part3';
import { QUESTIONS_PART_4 } from './questions-part4';
import { QUESTIONS_SPORT } from './questions-sport';
import { QUESTIONS_THEMES_CONNUS } from './questions-themes-connus';
import { QUESTIONS_PACK_1 } from './questions-pack-1';
import { QUESTIONS_PACK_2 } from './questions-pack-2';
import { QUESTIONS_PACK_3 } from './questions-pack-3';
import { QUESTIONS_PACK_4 } from './questions-pack-4';
import { QUESTIONS_PACK_5 } from './questions-pack-5';
import type { QuizQuestionRecord } from './supabase';

const RAW_SEED_QUESTIONS: RawSeedQuestion[] = [
  ...QUESTIONS_PART_1,
  ...QUESTIONS_PART_2,
  ...QUESTIONS_PART_3,
  ...QUESTIONS_PART_4,
  ...QUESTIONS_SPORT,
  ...QUESTIONS_THEMES_CONNUS,
  ...QUESTIONS_PACK_1,
  ...QUESTIONS_PACK_2,
  ...QUESTIONS_PACK_3,
  ...QUESTIONS_PACK_4,
  ...QUESTIONS_PACK_5,
];

function normalizeSeedQuestionKey(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 120);
}

export const ALL_SEED_QUESTIONS: RawSeedQuestion[] = (() => {
  const seen = new Set<string>();
  const unique: RawSeedQuestion[] = [];
  for (const q of RAW_SEED_QUESTIONS) {
    const key = normalizeSeedQuestionKey(q.question);
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(q);
    }
  }
  return unique;
})();

export function getLocalSeedQuestionsByLevel(
  level: number
): QuizQuestionRecord[] {
  return ALL_SEED_QUESTIONS.filter((q) => q.difficulty === level).map(
    (q, idx) => ({
      id: `local-l${level}-${idx + 1}`,
      difficulty: q.difficulty,
      theme: q.theme,
      question: q.question,
      options: q.options,
      correct_index: q.correct_index,
      explanation: q.explanation,
      target_audience: '30yo_couples',
      times_played: 0,
    })
  );
}

export function getAllLocalSeedQuestionsGrouped(): Record<
  number,
  QuizQuestionRecord[]
> {
  const grouped: Record<number, QuizQuestionRecord[]> = {};
  for (let lvl = 1; lvl <= 10; lvl++) {
    grouped[lvl] = getLocalSeedQuestionsByLevel(lvl);
  }
  return grouped;
}
