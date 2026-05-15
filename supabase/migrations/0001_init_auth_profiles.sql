-- =====================================================================
-- 0001_init_auth_profiles.sql
-- Cria a tabela public.profiles ligada a auth.users, RLS e trigger que
-- popula um profile automaticamente quando um usuário é criado.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Tabela profiles
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text        not null,
  cpf         text        not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint profiles_cpf_unique unique (cpf),
  constraint profiles_cpf_format check (cpf ~ '^[0-9]{11}$')
);

comment on table  public.profiles            is 'Perfil estendido do usuário autenticado (1:1 com auth.users).';
comment on column public.profiles.id         is 'FK para auth.users.id.';
comment on column public.profiles.cpf        is 'CPF apenas dígitos (11 chars).';

-- ---------------------------------------------------------------------
-- updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- INSERT é feito apenas pela trigger handle_new_user (SECURITY DEFINER).
-- DELETE é cascateado pelo ON DELETE CASCADE em auth.users.

-- ---------------------------------------------------------------------
-- Trigger handle_new_user
-- Lê full_name e cpf do raw_user_meta_data passado no signUp() do client.
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, cpf)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'cpf', '')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
