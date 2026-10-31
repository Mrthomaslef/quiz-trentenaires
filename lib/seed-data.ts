import { QUESTIONS_PART_1, type RawSeedQuestion } from './questions-part1';
import { QUESTIONS_PART_2 } from './questions-part2';
import { QUESTIONS_PART_3 } from './questions-part3';
import { QUESTIONS_PART_4 } from './questions-part4';
import { QUESTIONS_SPORT } from './questions-sport';
import { QUESTIONS_THEMES_CONNUS } from './questions-themes-connus';
import type { QuizQuestionRecord } from './supabase';

export const ALL_SEED_QUESTIONS: RawSeedQuestion[] = [
  ...QUESTIONS_PART_1,
  ...QUESTIONS_PART_2,
  ...QUESTIONS_PART_3,
  ...QUESTIONS_PART_4,
  ...QUESTIONS_SPORT,
  ...QUESTIONS_THEMES_CONNUS,
];

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
