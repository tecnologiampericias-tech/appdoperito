-- =====================================================================
-- 0004_storage_profile_documents.sql
-- Bucket privado para os arquivos enviados pelo perito no onboarding.
-- Convenção de path: '{user_id}/{document_type_id}/{upload_id}.{ext}'
-- O dono pode ler/inserir/deletar apenas seus próprios arquivos.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('profile-documents', 'profile-documents', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Policies (a primeira pasta do path precisa bater com auth.uid())
-- ---------------------------------------------------------------------
drop policy if exists "profile_documents_select_own_files" on storage.objects;
create policy "profile_documents_select_own_files"
  on storage.objects for select
  using (
    bucket_id = 'profile-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "profile_documents_insert_own_files" on storage.objects;
create policy "profile_documents_insert_own_files"
  on storage.objects for insert
  with check (
    bucket_id = 'profile-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "profile_documents_delete_own_files" on storage.objects;
create policy "profile_documents_delete_own_files"
  on storage.objects for delete
  using (
    bucket_id = 'profile-documents'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
