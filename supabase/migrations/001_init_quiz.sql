-- Table dédiée au Grand Quiz des Trentenaires (sur l'instance Supabase partagée)
create table if not exists public.trentenaires_questions (
  id uuid default gen_random_uuid() primary key,
  difficulty smallint not null check (difficulty >= 1 and difficulty <= 10),
  theme text not null,
  question text not null,
  options jsonb not null, -- Tableau exact de 4 chaînes de caractères : ["Réponse A", "Réponse B", "Réponse C", "Réponse D"]
  correct_index smallint not null check (correct_index >= 0 and correct_index <= 3),
  explanation text not null,
  target_audience text default '30yo_couples',
  times_played integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index pour accélérer le filtrage par niveau de difficulté (1 à 10)
create index if not exists idx_trentenaires_questions_difficulty on public.trentenaires_questions(difficulty);

-- Index d'unicité pour éviter les doublons lors des seeds successifs
create unique index if not exists idx_trentenaires_questions_unique_q
  on public.trentenaires_questions (difficulty, md5(question));

-- Sécurité RLS (Row Level Security) : lecture publique rapide, écriture contrôlée via RPC ou Service Role
alter table public.trentenaires_questions enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'trentenaires_questions'
      and policyname = 'Lecture publique des questions trentenaires'
  ) then
    create policy "Lecture publique des questions trentenaires"
      on public.trentenaires_questions for select
      using (true);
  end if;
end $$;

-- RPC sécurisée pour incrémenter le compteur times_played
create or replace function public.increment_trentenaires_question_played(question_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.trentenaires_questions
  set times_played = coalesce(times_played, 0) + 1
  where id = question_id;
end;
$$;

grant execute on function public.increment_trentenaires_question_played(uuid) to anon, authenticated;

-- RPC sécurisée par token pour pré-générer et insérer des lots en base sans exposer de service_role
create or replace function public.seed_trentenaires_questions(secret_token text, payload jsonb)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  item jsonb;
  inserted_count integer := 0;
begin
  if secret_token is distinct from 'trentenaires-quiz-seed-2026' then
    raise exception 'Token de pré-génération invalide';
  end if;

  if jsonb_typeof(payload) <> 'array' then
    raise exception 'Le payload doit être un tableau JSON';
  end if;

  for item in select * from jsonb_array_elements(payload)
  loop
    insert into public.trentenaires_questions (
      difficulty,
      theme,
      question,
      options,
      correct_index,
      explanation,
      target_audience
    )
    values (
      (item->>'difficulty')::smallint,
      item->>'theme',
      item->>'question',
      item->'options',
      (item->>'correct_index')::smallint,
      item->>'explanation',
      coalesce(item->>'target_audience', '30yo_couples')
    )
    on conflict (difficulty, md5(question)) do nothing;

    if found then
      inserted_count := inserted_count + 1;
    end if;
  end loop;

  return inserted_count;
end;
$$;

grant execute on function public.seed_trentenaires_questions(text, jsonb) to anon, authenticated;
