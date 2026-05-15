-- =====================================================================
-- 0005_profile_onboarding_view.sql
-- View derivada que resume o estado de onboarding do perfil em três
-- valores consumidos pelo app:
--   * documents_incomplete   → tem doc obrigatório pending ou rejected
--   * documents_under_review → todos obrigatórios enviados, falta aprovar
--   * documents_approved     → todos obrigatórios aprovados
-- Considera apenas tipos com is_required = true.
-- security_invoker = on garante que a view respeite a RLS de quem chama.
-- =====================================================================

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
    count(*) filter (where status = 'pending')       as pending_count,
    count(*) filter (where status = 'rejected')      as rejected_count,
    count(*) filter (where status = 'under_review')  as under_review_count,
    count(*) filter (where status = 'approved')      as approved_count,
    count(*)                                         as required_total
  from required_docs
  group by profile_id
)
select
  p.id as profile_id,
  case
    when coalesce(a.required_total, 0) = 0                                then 'documents_incomplete'
    when coalesce(a.pending_count, 0) > 0
      or coalesce(a.rejected_count, 0) > 0                                then 'documents_incomplete'
    when coalesce(a.approved_count, 0) = a.required_total                 then 'documents_approved'
    else                                                                       'documents_under_review'
  end as onboarding_status,
  coalesce(a.pending_count, 0)      as pending_count,
  coalesce(a.rejected_count, 0)     as rejected_count,
  coalesce(a.under_review_count, 0) as under_review_count,
  coalesce(a.approved_count, 0)     as approved_count,
  coalesce(a.required_total, 0)     as required_total
from public.profiles p
left join agg a on a.profile_id = p.id;

comment on view public.profile_onboarding_status is
  'Status derivado de onboarding por perfil — usado pelo app para gate e badge.';
