import { z } from 'zod';

export const QuestionSchema = z.object({
  difficulty: z.number().int().min(1).max(10),
  theme: z.string().min(2),
  question: z.string().min(10),
  options: z.tuple([z.string(), z.string(), z.string(), z.string()]),
  correct_index: z.number().int().min(0).max(3),
  explanation: z.string().min(15),
});

export type ValidatedQuestion = z.infer<typeof QuestionSchema>;

export interface DifficultyLevelInfo {
  level: number;
  title: string;
  tierLabel: string;
  subtitle: string;
  badgeColor: string;
  accentGradient: string;
}

export const DIFFICULTY_LEVELS: DifficultyLevelInfo[] = [
  {
    level: 1,
    title: 'Apéro Détendu I',
    tierLabel: 'Échauffement',
    subtitle: 'Références universelles, souvenirs d’enfance évidents (Harry Potter, Friends, Disney, capitales majeures).',
    badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    accentGradient: 'from-emerald-500 to-teal-500',
  },
  {
    level: 2,
    title: 'Apéro Détendu II',
    tierLabel: 'Échauffement +',
    subtitle: 'Classiques incontournables des années 90/2000, tubes cultes et culture pop immédiate pour se mettre en jambe.',
    badgeColor: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10',
    accentGradient: 'from-emerald-500 to-cyan-500',
  },
  {
    level: 3,
    title: 'Facile +',
    tierLabel: 'Intermédiaire Doux',
    subtitle: 'Culture générale de base et classiques années 90-2000 sans piège vicieux.',
    badgeColor: 'text-cyan-300 border-cyan-500/40 bg-cyan-500/10',
    accentGradient: 'from-cyan-500 to-sky-500',
  },
  {
    level: 4,
    title: 'Intermédiaire Doux',
    tierLabel: 'Rythme de Croisière',
    subtitle: 'Cinéma, séries, géographie et gastronomie accessibles mais qui demandent un minimum d’attention.',
    badgeColor: 'text-sky-300 border-sky-500/40 bg-sky-500/10',
    accentGradient: 'from-sky-500 to-indigo-500',
  },
  {
    level: 5,
    title: 'Standard Trentenaire I',
    tierLabel: 'Cœur de Soirée',
    subtitle: 'Vrai défi équilibré pour nés en 1990-1998. Nécessite de la réflexion ou une concertation au sein du couple.',
    badgeColor: 'text-indigo-300 border-indigo-500/40 bg-indigo-500/10',
    accentGradient: 'from-indigo-500 to-violet-500',
  },
  {
    level: 6,
    title: 'Standard Trentenaire II',
    tierLabel: 'Cœur de Soirée +',
    subtitle: 'Le débat s’anime autour de la table : histoire, sciences, pop culture et société à hauteur de trentenaires.',
    badgeColor: 'text-violet-300 border-violet-500/40 bg-violet-500/10',
    accentGradient: 'from-violet-500 to-purple-500',
  },
  {
    level: 7,
    title: 'Avancé',
    tierLabel: 'Costaud',
    subtitle: 'Culture générale précise, dates clés, réalisateurs, sciences et littérature : élimination méthodique requise.',
    badgeColor: 'text-amber-300 border-amber-500/40 bg-amber-500/10',
    accentGradient: 'from-amber-500 to-orange-500',
  },
  {
    level: 8,
    title: 'Costaud +',
    tierLabel: 'Haute Voltige',
    subtitle: 'Détails exigeants, faux-amis historiques et références pointues pour départager les deux couples.',
    badgeColor: 'text-orange-300 border-orange-500/40 bg-orange-500/10',
    accentGradient: 'from-orange-500 to-rose-500',
  },
  {
    level: 9,
    title: 'Expert',
    tierLabel: 'Impitoyable I',
    subtitle: 'Érudition pure et questions piégeuses où l’intuition habituelle est fausse.',
    badgeColor: 'text-rose-300 border-rose-500/40 bg-rose-500/10',
    accentGradient: 'from-rose-500 to-pink-600',
  },
  {
    level: 10,
    title: 'Expert Impitoyable',
    tierLabel: 'Boss Final',
    subtitle: 'Le sommet absolu : détails historiques, scientifiques et culturels ultra-pointus réservés aux champions.',
    badgeColor: 'text-fuchsia-300 border-fuchsia-500/40 bg-fuchsia-500/10',
    accentGradient: 'from-rose-600 via-fuchsia-600 to-indigo-600',
  },
];

export function getDifficultyInfo(level: number): DifficultyLevelInfo {
  return (
    DIFFICULTY_LEVELS.find((d) => d.level === level) || DIFFICULTY_LEVELS[4]
  );
}

export function validateQuestionBatch(rawItems: unknown[]): ValidatedQuestion[] {
  const valid: ValidatedQuestion[] = [];
  for (const item of rawItems) {
    const parsed = QuestionSchema.safeParse(item);
    if (parsed.success) {
      valid.push(parsed.data);
    }
  }
  return valid;
}

/**
 * Interroge un serveur d'inférence compatible OpenAI/SambaNova ou Gemini en tâche de fond (batch/seed)
 * et valide chaque question via Zod (`QuestionSchema`).
 */
export async function generateQuestionsBatchWithLLM(
  difficulty: number,
  count = 10
): Promise<ValidatedQuestion[]> {
  const info = getDifficultyInfo(difficulty);
  const systemPrompt = `Tu es le créateur éditorial du jeu "Le Grand Quiz des Trentenaires (Édition 4 Joueurs / 2 Couples)".
Public cible : 4 personnes d'environ 30 ans (nés entre 1990 et 1998), jouant en 2 couples ou 4 joueurs solo à l'apéritif ou en soirée.
Ton : Convivial, cultivé, malin, propice au débat entre amis.
Thématiques variées : Pop Culture années 90/2000, Cinéma, Séries TV, Histoire, Géographie, Sciences, Musique, Gastronomie, Jeux Vidéo, Société, Sport, Animaux & Nature, BD & Mangas, Mythologie & Légendes, Littérature & Contes, Arts & Architecture, Internet, Memes & Réseaux, Humour & Comédie, Santé, Corps & Psychologie, Émissions TV & Télé-réalité, Espace & Astronomie, Marques, Pubs & Objets Cultes, Langue Française & Expressions, Jeux de Société & Jouets, Inventions, Tech & Insolite.

Génère exactement ${count} questions inédites de niveau ${difficulty}/10 (${info.title} : ${info.subtitle}).
Réponds UNIQUEMENT avec un tableau JSON strict d'objets ayant exactement cette structure :
[
  {
    "difficulty": ${difficulty},
    "theme": "Nom du thème",
    "question": "Intitulé clair de la question ?",
    "options": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
    "correct_index": 0,
    "explanation": "Explication détaillée et anecdote savoureuse d'au moins 25 caractères."
  }
]`;

  const aiApiKey = process.env.AI_API_KEY;
  const aiBaseUrl = process.env.AI_BASE_URL || 'https://api.sambanova.ai/v1';
  const aiModel = process.env.AI_MODEL || 'Meta-Llama-3.3-70B-Instruct';

  if (aiApiKey && aiApiKey !== 'votre_cle_api') {
    const response = await fetch(`${aiBaseUrl.replace(/\/$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${aiApiKey}`,
      },
      body: JSON.stringify({
        model: aiModel,
        messages: [
          { role: 'system', content: 'Tu réponds exclusivement en JSON valide.' },
          { role: 'user', content: systemPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Erreur API LLM (${response.status})`);
    }
    const json = await response.json();
    const content: string = json?.choices?.[0]?.message?.content || '[]';
    const cleaned = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned);
    return validateQuestionBatch(Array.isArray(parsed) ? parsed : []);
  }

  throw new Error('Aucune clé AI_API_KEY externe fournie — utilisation du pool pré-généré.');
}

export async function generateRandomTenQuestionsWithLLM(
  count = 10
): Promise<ValidatedQuestion[]> {
  const systemPrompt = `Tu es le créateur éditorial du jeu "Le Grand Quiz des Trentenaires (Édition 7TER)".
Public cible : Amis d'environ 30 ans (nés entre 1990 et 1998), jouant en soirée.
Ton : Convivial, cultivé, malin, propice au débat entre amis.
Thématiques variées : Pop Culture années 90/2000, Cinéma, Séries TV, Histoire, Géographie, Sciences, Musique, Gastronomie, Jeux Vidéo, Société, Sport, Animaux & Nature, BD & Mangas, Mythologie & Légendes, Littérature & Contes, Arts & Architecture, Internet & Memes, Humour & Comédie, Émissions TV, Espace & Astronomie, Marques & Objets Cultes, Langue Française, Jeux de Société.

Génère exactement ${count} questions TOTALEMENT INÉDITES au hasard, réparties sur les niveaux de difficulté 1 à 10 (de 1 = très facile à 10 = expert).
Chaque question doit porter sur un thème différent et avoir une anecdote savoureuse dans explanation.
Réponds UNIQUEMENT avec un tableau JSON strict d'objets ayant exactement cette structure :
[
  {
    "difficulty": 5,
    "theme": "Nom du thème",
    "question": "Intitulé clair de la question ?",
    "options": ["Réponse A", "Réponse B", "Réponse C", "Réponse D"],
    "correct_index": 0,
    "explanation": "Explication détaillée et anecdote savoureuse d'au moins 25 caractères."
  }
]`;

  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim().length > 0 && !geminiKey.startsWith('AQ.')) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(
        geminiKey.trim()
      )}`;
      const res = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            temperature: 0.85,
            responseMimeType: 'application/json',
          },
        }),
      });
      if (res.ok) {
        const json = await res.json();
        const text: string =
          json?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';
        const cleaned = text
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();
        const parsed = JSON.parse(cleaned);
        const validated = validateQuestionBatch(
          Array.isArray(parsed) ? parsed : []
        );
        if (validated.length >= count) {
          return validated.slice(0, count);
        }
      }
    } catch {
      // Fallback to AI_API_KEY or curated generator
    }
  }

  const aiApiKey = process.env.AI_API_KEY;
  const aiBaseUrl = process.env.AI_BASE_URL || 'https://api.sambanova.ai/v1';
  const aiModel = process.env.AI_MODEL || 'Meta-Llama-3.3-70B-Instruct';

  if (aiApiKey && aiApiKey !== 'votre_cle_api') {
    const response = await fetch(
      `${aiBaseUrl.replace(/\/$/, '')}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aiApiKey}`,
        },
        body: JSON.stringify({
          model: aiModel,
          messages: [
            {
              role: 'system',
              content: 'Tu réponds exclusivement en JSON valide.',
            },
            { role: 'user', content: systemPrompt },
          ],
          temperature: 0.8,
        }),
      }
    );

    if (response.ok) {
      const json = await response.json();
      const content: string = json?.choices?.[0]?.message?.content || '[]';
      const cleaned = content
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();
      const parsed = JSON.parse(cleaned);
      const validated = validateQuestionBatch(
        Array.isArray(parsed) ? parsed : []
      );
      if (validated.length > 0) {
        return validated.slice(0, count);
      }
    }
  }

  throw new Error(
    'Aucune clé AI_API_KEY externe active — bascule sur le générateur de pack inédit.'
  );
}

