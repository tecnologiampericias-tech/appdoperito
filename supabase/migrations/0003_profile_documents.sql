-- =====================================================================
-- 0003_profile_documents.sql
-- Modelagem do envio e aprovação de documentos do perito.
--   * profile_documents          → estado atual (1 linha por tipo)
--   * profile_document_uploads   → histórico (1 linha por arquivo enviado)
-- Inclui RLS por dono, trigger guard que impede o próprio usuário de
-- mudar status para approved/rejected, e estende handle_new_user para
-- popular profile_documents ('pending') no momento do signup.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enum de status
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'document_status') then
    create type public.document_status as enum
      ('pending', 'under_review', 'approved', 'rejected');
  end if;
end$$;

-- ---------------------------------------------------------------------
-- profile_document_uploads (histórico)
-- Criada antes para que profile_documents.current_upload_id possa
-- referenciá-la.
-- ---------------------------------------------------------------------
create table if not exists public.profile_document_uploads (
  id                uuid        primary key default gen_random_uuid(),
  profile_id        uuid        not null references public.profiles(id) on delete cascade,
  document_type_id  text        not null references public.document_types(id) on delete restrict,
  storage_path      text        not null,
  file_name         text        not null,
  mime_type         text,
  size_bytes        integer,
  status_at_upload  public.document_status not null default 'under_review',
  rejection_reason  text,
  reviewed_by       uuid        references auth.users(id),
  reviewed_at       timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists profile_document_uploads_by_profile_type_created_idx
  on public.profile_document_uploads (profile_id, document_type_id, created_at desc);

comment on table  public.profile_document_uploads is 'Histórico de uploads de documentos (1 linha por arquivo enviado).';
comment on column public.profile_document_uploads.storage_path is 'Caminho no bucket profile-documents: {uid}/{type}/{upload_id}.{ext}.';

-- ---------------------------------------------------------------------
-- profile_documents (estado atual, 1 linha por (profile, type))
-- ---------------------------------------------------------------------
create table if not exists public.profile_documents (
  profile_id         uuid        not null references public.profiles(id) on delete cascade,
  document_type_id   text        not null references public.document_types(id) on delete restrict,
  status             public.document_status not null default 'pending',
  current_upload_id  uuid        references public.profile_document_uploads(id) on delete set null,
  rejection_reason   text,
  reviewed_by        uuid        references auth.users(id),
  reviewed_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  primary key (profile_id, document_type_id)
);

comment on table  public.profile_documents is 'Estado atual de cada tipo de documento por perfil (1 linha por tipo).';
comment on column public.profile_documents.current_upload_id is 'Aponta para o upload corrente em profile_document_uploads.';

drop trigger if exists profile_documents_set_updated_at on public.profile_documents;
create trigger profile_documents_set_updated_at
  before update on public.profile_documents
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Trigger guard: o próprio usuário (auth.uid() = profile_id) NÃO pode
-- promover status para 'approved' ou 'rejected', nem preencher campos
-- de revisão. Esses campos só podem ser setados pelo service_role/admin.
-- ---------------------------------------------------------------------
create or replace function public.guard_profile_documents_owner_status()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and auth.uid() = new.profile_id then
    if new.status not in ('pending', 'under_review') then
      raise exception 'Owner cannot set profile_documents.status to %', new.status
        using errcode = '42501';
    end if;
    new.reviewed_by      := old.reviewed_by;
    new.reviewed_at      := old.reviewed_at;
    new.rejection_reason := case when new.status = 'rejected' then new.rejection_reason else null end;
  end if;
  return new;
end;
$$;

drop trigger if exists profile_documents_guard_owner_status on public.profile_documents;
create trigger profile_documents_guard_owner_status
  before update on public.profile_documents
  for each row execute function public.guard_profile_documents_owner_status();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.profile_documents         enable row level security;
alter table public.profile_document_uploads  enable row level security;

-- profile_documents: dono lê e atualiza (status limitado pela trigger).
drop policy if exists "profile_documents_select_own" on public.profile_documents;
create policy "profile_documents_select_own"
  on public.profile_documents for select
  using (auth.uid() = profile_id);

drop policy if exists "profile_documents_update_own" on public.profile_documents;
create policy "profile_documents_update_own"
  on public.profile_documents for update
  using (auth.uid() = profile_id)
  with check (auth.uid() = profile_id);

-- INSERT é feito apenas pela trigger handle_new_user (SECURITY DEFINER).
-- DELETE é cascateado por profiles.id.

-- profile_document_uploads: dono lê e insere; nunca edita/deleta.
drop policy if exists "profile_document_uploads_select_own" on public.profile_document_uploads;
create policy "profile_document_uploads_select_own"
  on public.profile_document_uploads for select
  using (auth.uid() = profile_id);

drop policy if exists "profile_document_uploads_insert_own" on public.profile_document_uploads;
create policy "profile_document_uploads_insert_own"
  on public.profile_document_uploads for insert
  with check (auth.uid() = profile_id);

-- ---------------------------------------------------------------------
-- Estende handle_new_user: além de criar profiles, popula
-- profile_documents com uma linha 'pending' por tipo do catálogo.
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

  insert into public.profile_documents (profile_id, document_type_id, status)
  select new.id, dt.id, 'pending'
  from public.document_types dt;

  return new;
end;
$$;
