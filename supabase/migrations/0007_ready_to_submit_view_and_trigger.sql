-- =====================================================================
-- 0007_ready_to_submit_view_and_trigger.sql
-- 1) Atualiza profile_onboarding_status para contar 'ready_to_submit'
--    como bloqueante (o usuário ainda não clicou em "Enviar para análise").
-- 2) Atualiza o trigger guard para permitir o dono setar 'ready_to_submit'.
-- 3) Backfill: uploads do PR3 entraram como 'under_review' mas conceitualmente
--    são 'ready_to_submit' (admin nunca revisou). Reclassifica todos os
--    profile_documents.under_review com reviewed_at IS NULL.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) View atualizada
-- ---------------------------------------------------------------------
create or replace view public.profile_onboarding_status
with (security_invoker = on)
as
with required_docs as (
  select
    pd.profile_id,
    pd.document_type_id,
    pd.status
  from public.profile_documents pd
  join public.document_types dt on dt.id = pd.document_type_id
  where dt.is_required = true
),
agg as (
  select
    profile_id,
    count(*) filter (where status = 'pending')          as pending_count,
    count(*) filter (where status = 'rejected')         as rejected_count,
    count(*) filter (where status = 'ready_to_submit')  as ready_to_submit_count,
    count(*) filter (where status = 'under_review')     as under_review_count,
    count(*) filter (where status = 'approved')         as approved_count,
    count(*)                                            as required_total
  from required_docs
  group by profile_id
)
select
  p.id as profile_id,
  case
    when coalesce(a.required_total, 0) = 0                                then 'documents_incomplete'
    when coalesce(a.pending_count, 0) > 0
      or coalesce(a.rejected_count, 0) > 0
      or coalesce(a.ready_to_submit_count, 0) > 0                          then 'documents_incomplete'
    when coalesce(a.approved_count, 0) = a.required_total                  then 'documents_approved'
    else                                                                       'documents_under_review'
  end as onboarding_status,
  coalesce(a.pending_count, 0)         as pending_count,
  coalesce(a.rejected_count, 0)        as rejected_count,
  -- Mantemos under_review_count/approved_count/required_total nas mesmas
  -- posições da view original (0005) — Postgres não deixa reordenar com
  -- CREATE OR REPLACE VIEW. A coluna nova fica no FINAL.
  coalesce(a.under_review_count, 0)    as under_review_count,
  coalesce(a.approved_count, 0)        as approved_count,
  coalesce(a.required_total, 0)        as required_total,
  coalesce(a.ready_to_submit_count, 0) as ready_to_submit_count
from public.profiles p
left join agg a on a.profile_id = p.id;

-- ---------------------------------------------------------------------
-- 2) Trigger guard atualizado: owner pode setar ready_to_submit
-- ---------------------------------------------------------------------
create or replace function public.guard_profile_documents_owner_status()
returns trigger
language plpgsql
as $$
begin
  if auth.uid() is not null and auth.uid() = new.profile_id then
    if new.status not in ('pending', 'ready_to_submit', 'under_review') then
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

-- ---------------------------------------------------------------------
-- 3) Backfill: uploads que entraram como under_review sem revisão humana
--    devem ser tratados como ready_to_submit (semântica nova do PR4).
-- ---------------------------------------------------------------------
update public.profile_documents
set status = 'ready_to_submit'
where status = 'under_review' and reviewed_at is null;

update public.profile_document_uploads
set status_at_upload = 'ready_to_submit'
where status_at_upload = 'under_review' and reviewed_at is null;
