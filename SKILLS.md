# SKILLS.md — Spécifications Agent (Antigravity)
**Projet :** Le Grand Quiz des Trentenaires (Édition 4 Joueurs / 2 Couples)  
**Stack Cible :** Next.js (App Router) • Tailwind CSS • Vercel / GitHub Pages • GitHub • Supabase (PostgreSQL) / SambaNova (LLM Inférence)

---

## 1. Vue d'ensemble et Objectif pour l'Agent
Ce document définit les compétences, les règles métier et l'architecture technique permettant à **Antigravity** de construire, alimenter et déployer une application web de quiz multijoueur local.

### Principe Fondamental : Zéro Latence en Soirée (Questions pré-générées)
Les questions **ne doivent jamais** être générées à la volée pendant que les joueurs attendent devant l'écran. Elles doivent être **générées en avance (batch/seed)**, validées selon un schéma JSON strict, et stockées sur le serveur de données (**Supabase** PostgreSQL, éventuellement alimenté par un moteur d'inférence ultra-rapide type **SambaNova / LLM API** lors des tâches de fond).

---

## 2. Architecture Technique & Flux de Données

1. **Dépôt GitHub :** Source unique de vérité contenant le front-end, les routes d'API de pré-génération et les migrations de base de données.
2. **Base de données & Backend (Supabase) :**
   - Stocke les questions pré-générées classées par niveau de difficulté (`1` à `10`) dans `public.trentenaires_questions`.
   - Gère le marquage ou le tirage aléatoire pour éviter qu'une même question ne retombe lors d'une même soirée.
3. **Moteur de Pré-génération (Worker / Cron / Script Seed) :**
   - Le script serveur (`/scripts/seed-questions.ts` ou la route `/api/admin/pregenerate`) valide et remplit la base Supabase avec **30 questions par niveau** (soit 300 questions en réserve).
4. **Hébergement & CI/CD :**
   - Connecté au repo GitHub (`Mrthomaslef/quiz-trentenaires`).
   - Déploie automatiquement à chaque `git push` sur la branche `main`.
   - Pré-charge les lots de questions pour une transition instantanée (`< 10ms`) entre les questions.
