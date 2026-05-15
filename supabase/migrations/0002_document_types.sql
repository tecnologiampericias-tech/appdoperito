-- =====================================================================
-- 0002_document_types.sql
-- Catálogo de tipos de documento exigidos no onboarding do perito.
-- É a fonte da verdade que o app passa a consumir no lugar de
-- data/documents.ts. Inclui flag is_required para liberar o gate de
-- onboarding mesmo quando o profissional não se enquadra em todos os
-- tribunais (RQE, Inscrição Municipal, Curso TJRJ, Especializações).
-- =====================================================================

create table if not exists public.document_types (
  id           text        primary key,
  name         text        not null,
  description  text        not null,
  details      text        not null,
  icon         text        not null,
  is_required  boolean     not null default true,
  sort_order   smallint    not null,
  created_at   timestamptz not null default now(),
  constraint document_types_sort_order_unique unique (sort_order)
);

comment on table  public.document_types             is 'Catálogo de tipos de documento exigidos no onboarding do perito.';
comment on column public.document_types.id          is 'Slug estável usado pelo client (ex.: "doc-pessoal", "rqe").';
comment on column public.document_types.icon        is 'Nome do ícone MaterialCommunityIcons usado no client.';
comment on column public.document_types.is_required is 'Se false, o tipo é opcional e não bloqueia o onboarding.';

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------
alter table public.document_types enable row level security;

drop policy if exists "document_types_read_all" on public.document_types;
create policy "document_types_read_all"
  on public.document_types for select
  using (auth.role() = 'authenticated');

-- INSERT/UPDATE/DELETE deliberadamente sem policy: catálogo é mantido
-- via migrations (ou pelo service_role em ferramentas administrativas).

-- ---------------------------------------------------------------------
-- Seed dos 16 tipos (espelha data/documents.ts em 2026-05-15)
-- ---------------------------------------------------------------------
insert into public.document_types (id, name, description, details, icon, is_required, sort_order) values
  (
    'doc-pessoal',
    'Documento Pessoal (RG ou CNH)',
    'RG ou CNH com foto e dados pessoais legíveis.',
    'RG: número do registro (alguns já trazem o CPF), data de expedição, validade dentro de 10 anos contados desta data, nome completo, nome completo do pai e da mãe, órgão de expedição e foto.' || E'\n\n' ||
    'CNH: número do RG com órgão expedidor e CPF, data de validade, nome completo, nome do pai e da mãe, e foto.',
    'card-account-details-outline',
    true,
    1
  ),
  (
    'cedula-profissional',
    'Cédula Profissional (Órgão de Classe)',
    'CRM, CREA, CAU, COREN ou outro conselho aplicável.',
    'Precisa conter foto, número da inscrição no órgão de classe, dados pessoais (RG, CPF, nome completo, nome dos pais) e a data de inscrição/expedição.',
    'badge-account-horizontal-outline',
    true,
    2
  ),
  (
    'cpf',
    'Comprovante de CPF',
    'Emitido pela Receita Federal nos últimos 30 dias.',
    'Emitido obrigatoriamente junto à Receita Federal. Deve conter nome completo, número do CPF, data de nascimento, situação "REGULAR" e data de emissão dentro de 30 dias corridos.',
    'numeric',
    true,
    3
  ),
  (
    'titulo-eleitor',
    'Título de Eleitor',
    'Versão eletrônica ou física, com dados completos.',
    'Aceito tanto o eletrônico quanto o físico. Precisa conter nome completo, número do CPF, número do título, seção, zona e nome completo dos pais.',
    'vote-outline',
    true,
    4
  ),
  (
    'residencia',
    'Comprovante de Residência',
    'TJPR até 30 dias; demais tribunais até 3 meses.',
    'TJPR: atualizado até 30 dias e sem mostrar valores ou descrição de serviços. Demais tribunais: atualizado até 3 meses e sem qualquer rasura.' || E'\n\n' ||
    'Deve conter data de vencimento, nome completo do profissional, endereço completo, CEP e cidade/UF.',
    'home-outline',
    true,
    5
  ),
  (
    'regularidade-financeira',
    'Regularidade Financeira',
    'Quitação com a tesouraria do órgão de classe.',
    'Emitida pelo órgão de classe, dentro da data de validade, com a situação "quite com a tesouraria do conselho". Deve conter nome completo do profissional e número da inscrição.',
    'cash-check',
    true,
    6
  ),
  (
    'certidao-etica',
    'Certidão Ético-Profissional',
    'Emitida pelo órgão de classe, dentro da validade.',
    'Emitida pelo órgão de classe. Deve apresentar data de validade e data de emissão (no TJPR é obrigatório estar dentro de 30 dias corridos). Não pode haver conduta disciplinar nos últimos 5 anos — 10 anos no caso do TJRJ. Conter nome completo do profissional e número da inscrição.',
    'shield-check-outline',
    true,
    7
  ),
  (
    'diploma',
    'Diploma',
    'Graduação concluída, com registro autenticado no verso.',
    'Deve conter nome completo do profissional, nome da instituição de ensino, indicação da conclusão da graduação na área de atuação, data da colação/conclusão do curso e verso com o registro autenticado.',
    'school-outline',
    true,
    8
  ),
  (
    'especializacoes',
    'Certificado de Especializações',
    'Se houver, com registro autenticado no verso.',
    'Quando houver, deve conter nome completo do profissional, nome da instituição de ensino ou hospital de residência médica, identificação da especialidade cursada e verso com o registro autenticado.',
    'certificate-outline',
    false,
    9
  ),
  (
    'rqe',
    'Certidão de RQE (exclusivo médicos)',
    'Registro de Qualificação de Especialidade emitido pelo CRM.',
    'Exclusivo para médicos. Emitido junto ao CRM do Estado, com a indicação da qualificação (ex.: cardiologista, clínica médica, ortopedia e traumatologia, neurologia). Deve conter nome completo, número da inscrição, número do RQE, data de validade e data de emissão (TJPR considera apenas dentro de 30 dias corridos).',
    'medal-outline',
    false,
    10
  ),
  (
    'nit',
    'Comprovante NIT',
    'Extrato de contribuição previdenciária.',
    'Obrigatoriamente o extrato de contribuição previdenciária — a CTPS digital e a física são rejeitadas. Precisa conter número do NIT, nome completo do profissional e CPF.',
    'card-text-outline',
    true,
    11
  ),
  (
    'curriculo',
    'Currículo',
    'Experiência acadêmica e profissional do perito.',
    'Contém experiência acadêmica e profissional. Alteramos o número de telefone e e-mail para os do escritório. Aceitamos o currículo Lattes de forma geral — obrigatório para cadastro no TJAM e no TJFT.',
    'file-account-outline',
    true,
    12
  ),
  (
    'bancarios',
    'Comprovante de Dados Bancários',
    'Conta em nome do perito titular.',
    'Precisa conter nome da instituição bancária, nome do perito como titular da conta, CPF, número da agência e número da conta bancária.',
    'bank-outline',
    true,
    13
  ),
  (
    'foto',
    'Foto Profissional',
    'Foto utilizada para cadastro no TJSP e cartas.',
    'Utilizada para cadastro no TJSP e reaproveitada na carta de apresentação aos tribunais. Não há requisitos rígidos, mas pedimos que seja o mais profissional possível e transmita seriedade.',
    'account-box-outline',
    true,
    14
  ),
  (
    'inscricao-municipal',
    'Inscrição Municipal (TJMG e JT)',
    'Exigido para TJMG e Justiça do Trabalho.',
    'Comprovante de inscrição municipal contendo: número da inscrição municipal, nome completo, número do CPF, situação ativa/regular e a atividade profissional desenvolvida.',
    'city-variant-outline',
    false,
    15
  ),
  (
    'curso-pericia-tjrj',
    'Curso em Perícia Judicial (TJRJ)',
    'Certificado obrigatório para cadastro no TJRJ.',
    'Obrigatório que seja em perícia judicial (perícia médica é rejeitada). Carga horária mínima de 21h. Deve conter nome completo do profissional e data da conclusão.',
    'gavel',
    false,
    16
  )
on conflict (id) do nothing;
