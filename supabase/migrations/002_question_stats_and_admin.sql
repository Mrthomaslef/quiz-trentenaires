-- Migration 002 : Suivi détaillé des réponses, évaluation de la difficulté réelle et base "Déjà répondu"
alter table public.trentenaires_questions
  add column if not exists times_correct integer default 0,
  add column if not exists times_wrong integer default 0,
  add column if not exists difficulty_notes text default '',
  add column if not exists suggested_difficulty smallint check (suggested_difficulty >= 1 and suggested_difficulty <= 10),
  add column if not exists is_already_answered boolean default false,
  add column if not exists last_played_at timestamp with time zone;

-- RPC pour enregistrer le résultat d'une question (bonne ou mauvaise réponse) et basculer automatiquement
-- dans la base "déjà répondu" au-delà du seuil (ex: >= 2 réponses)
create or replace function public.record_trentenaires_question_outcome(
  question_id uuid,
  was_correct boolean,
  auto_archive_threshold integer default 2
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  new_played integer;
begin
  update public.trentenaires_questions
  set
    times_played = coalesce(times_played, 0) + 1,
    times_correct = coalesce(times_correct, 0) + (case when was_correct then 1 else 0 end),
    times_wrong = coalesce(times_wrong, 0) + (case when was_correct then 0 else 1 end),
    last_played_at = timezone('utc'::text, now()),
    is_already_answered = case
      when coalesce(times_played, 0) + 1 >= auto_archive_threshold then true
      else coalesce(is_already_answered, false)
    end
  where id = question_id;
end;
$$;

grant execute on function public.record_trentenaires_question_outcome(uuid, boolean, integer) to anon, authenticated;

-- RPC Admin pour mettre à jour la note, la difficulté ou le statut "déjà répondu" d'une question
create or replace function public.admin_update_trentenaires_question(
  admin_code text,
  question_id uuid,
  new_difficulty smallint default null,
  new_notes text default null,
  new_already_answered boolean default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if upper(trim(admin_code)) not in ('7TER', 'ADMIN', '7TER2026', 'TRENTENAIRES-QUIZ-SEED-2026') then
    raise exception 'Code administrateur invalide';
  end if;

  update public.trentenaires_questions
  set
    difficulty = coalesce(new_difficulty, difficulty),
    difficulty_notes = coalesce(new_notes, difficulty_notes),
    is_already_answered = coalesce(new_already_answered, is_already_answered)
  where id = question_id;
end;
$$;

grant execute on function public.admin_update_trentenaires_question(text, uuid, smallint, text, boolean) to anon, authenticated;
