# Le Grand Quiz des Trentenaires (Édition 4 Joueurs / 2 Couples)

Application web de quiz multijoueur local conçue pour les soirées entre trentenaires (nés entre 1990 et 1998).

## Fonctionnalités Clés

- **Zéro Latence en Soirée (`< 10ms`)** : 300 questions pré-générées (30 par niveau de difficulté de `1` à `10`), validées avec `Zod` (`QuestionSchema`) et stockées sur **Supabase PostgreSQL** (`public.trentenaires_questions`).
- **Sélecteur de Difficulté en Direct (`1` à `10`)** : Changez de niveau à tout moment de la soirée (*Apéro Détendu*, *Intermédiaire Doux*, *Standard Trentenaire*, *Avancé / Costaud*, *Expert Impitoyable*).
- **Double Mode de Jeu instantané** :
  - **Mode `2 Couples`** (`Couple 1` vs `Couple 2`, renommables d'un clic)
  - **Mode `4 Joueurs`** (`Joueur 1` à `Joueur 4`, renommables d'un clic)
  - Attribution rapide `+1` / `-1` et sauvegarde automatique dans `localStorage`.
- **Révélation & Anecdote Débat** : Bonne réponse en **Vert Émeraude**, mauvaise réponse sélectionnée en **Rouge Rose**, suivie d'une explication détaillée pour lancer les débats autour de la table.

## Commandes

```bash
npm install
npm run seed:questions   # Valide avec Zod et alimente la base Supabase (300 questions)
npm run dev              # Lance le serveur local sur http://localhost:3000
npm run build            # Vérifie le build de production Next.js (TypeScript + ESLint)
```
