create extension if not exists pgcrypto;

create table if not exists public.perfil (
  id uuid primary key references auth.users (id) on delete cascade,
  perfil text not null,
  score smallint not null check (score >= 10 and score <= 40),
  quiz_responses jsonb not null default '{}'::jsonb,
  quiz_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint perfil_tipo_check check (
    perfil in ('conservador', 'moderado', 'agressivo', 'muito_agressivo')
  )
);

create index if not exists perfil_perfil_idx on public.perfil (perfil);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_perfil_updated_at on public.perfil;
create trigger set_perfil_updated_at
before update on public.perfil
for each row
execute function public.set_updated_at();

alter table public.perfil enable row level security;

drop policy if exists "perfil_select_own" on public.perfil;
create policy "perfil_select_own"
on public.perfil
for select
to authenticated
using (auth.uid() = id);

drop policy if exists "perfil_insert_own" on public.perfil;
create policy "perfil_insert_own"
on public.perfil
for insert
to authenticated
with check (auth.uid() = id);

drop policy if exists "perfil_update_own" on public.perfil;
create policy "perfil_update_own"
on public.perfil
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);
