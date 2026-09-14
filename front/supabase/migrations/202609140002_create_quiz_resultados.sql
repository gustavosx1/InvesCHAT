create extension if not exists pgcrypto;

create table if not exists public.quiz_resultados (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  nota smallint not null check (nota >= 0 and nota <= 30),
  quiz_completed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  respostas jsonb not null default '{}'::jsonb,
  quiz_tipo text not null default 'conhecimento_financeiro'
);

create index if not exists quiz_resultados_user_id_idx on public.quiz_resultados (user_id);
create index if not exists quiz_resultados_quiz_completed_at_idx on public.quiz_resultados (quiz_completed_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_quiz_resultados_updated_at on public.quiz_resultados;
create trigger set_quiz_resultados_updated_at
before update on public.quiz_resultados
for each row
execute function public.set_updated_at();

alter table public.quiz_resultados enable row level security;

drop policy if exists "quiz_resultados_select_own" on public.quiz_resultados;
create policy "quiz_resultados_select_own"
on public.quiz_resultados
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "quiz_resultados_insert_own" on public.quiz_resultados;
create policy "quiz_resultados_insert_own"
on public.quiz_resultados
for insert
to authenticated
with check (auth.uid() = user_id);
