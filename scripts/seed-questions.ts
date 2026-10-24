import { validateQuestionBatch } from '../lib/generator';
import { insertValidatedQuestions } from '../lib/supabase';
import { ALL_SEED_QUESTIONS } from '../lib/seed-data';

async function main() {
  console.log('🚀 Démarrage du batch de pré-génération et validation Zod...');
  console.log(`📦 Questions totales dans le pool source : ${ALL_SEED_QUESTIONS.length}`);

  const validated = validateQuestionBatch(ALL_SEED_QUESTIONS);
  console.log(`✅ Questions validées par QuestionSchema (Zod) : ${validated.length}`);

  for (let lvl = 1; lvl <= 10; lvl++) {
    const levelBatch = validated.filter((q) => q.difficulty === lvl);
    const inserted = await insertValidatedQuestions(levelBatch);
    console.log(
      `   • Niveau ${lvl}/10 : ${levelBatch.length} validées -> ${inserted} nouvelles insérées dans Supabase`
    );
  }

  console.log('🎉 Base Supabase alimentée avec succès ! Zéro latence garantie en soirée.');
}

main().catch((err) => {
  console.error('❌ Erreur lors du seed Supabase :', err);
  process.exit(1);
});
