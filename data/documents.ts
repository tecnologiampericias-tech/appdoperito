import type { AttachedFile, DocItem } from '@/types/domain';

export const DOCUMENTS: DocItem[] = [
  {
    id: 'doc-pessoal',
    name: 'Documento Pessoal (RG ou CNH)',
    description: 'RG ou CNH com foto e dados pessoais legíveis.',
    details:
      'RG: número do registro (alguns já trazem o CPF), data de expedição, validade dentro de 10 anos contados desta data, nome completo, nome completo do pai e da mãe, órgão de expedição e foto.\n\nCNH: número do RG com órgão expedidor e CPF, data de validade, nome completo, nome do pai e da mãe, e foto.',
    icon: 'card-account-details-outline',
  },
  {
    id: 'cedula-profissional',
    name: 'Cédula Profissional (Órgão de Classe)',
    description: 'CRM, CREA, CAU, COREN ou outro conselho aplicável.',
    details:
      'Precisa conter foto, número da inscrição no órgão de classe, dados pessoais (RG, CPF, nome completo, nome dos pais) e a data de inscrição/expedição.',
    icon: 'badge-account-horizontal-outline',
  },
  {
    id: 'cpf',
    name: 'Comprovante de CPF',
    description: 'Emitido pela Receita Federal nos últimos 30 dias.',
    details:
      'Emitido obrigatoriamente junto à Receita Federal. Deve conter nome completo, número do CPF, data de nascimento, situação "REGULAR" e data de emissão dentro de 30 dias corridos.',
    icon: 'numeric',
  },
  {
    id: 'titulo-eleitor',
    name: 'Título de Eleitor',
    description: 'Versão eletrônica ou física, com dados completos.',
    details:
      'Aceito tanto o eletrônico quanto o físico. Precisa conter nome completo, número do CPF, número do título, seção, zona e nome completo dos pais.',
    icon: 'vote-outline',
  },
  {
    id: 'residencia',
    name: 'Comprovante de Residência',
    description: 'TJPR até 30 dias; demais tribunais até 3 meses.',
    details:
      'TJPR: atualizado até 30 dias e sem mostrar valores ou descrição de serviços. Demais tribunais: atualizado até 3 meses e sem qualquer rasura.\n\nDeve conter data de vencimento, nome completo do profissional, endereço completo, CEP e cidade/UF.',
    icon: 'home-outline',
  },
  {
    id: 'regularidade-financeira',
    name: 'Regularidade Financeira',
    description: 'Quitação com a tesouraria do órgão de classe.',
    details:
      'Emitida pelo órgão de classe, dentro da data de validade, com a situação "quite com a tesouraria do conselho". Deve conter nome completo do profissional e número da inscrição.',
    icon: 'cash-check',
  },
  {
    id: 'certidao-etica',
    name: 'Certidão Ético-Profissional',
    description: 'Emitida pelo órgão de classe, dentro da validade.',
    details:
      'Emitida pelo órgão de classe. Deve apresentar data de validade e data de emissão (no TJPR é obrigatório estar dentro de 30 dias corridos). Não pode haver conduta disciplinar nos últimos 5 anos — 10 anos no caso do TJRJ. Conter nome completo do profissional e número da inscrição.',
    icon: 'shield-check-outline',
  },
  {
    id: 'diploma',
    name: 'Diploma',
    description: 'Graduação concluída, com registro autenticado no verso.',
    details:
      'Deve conter nome completo do profissional, nome da instituição de ensino, indicação da conclusão da graduação na área de atuação, data da colação/conclusão do curso e verso com o registro autenticado.',
    icon: 'school-outline',
  },
  {
    id: 'especializacoes',
    name: 'Certificado de Especializações',
    description: 'Se houver, com registro autenticado no verso.',
    details:
      'Quando houver, deve conter nome completo do profissional, nome da instituição de ensino ou hospital de residência médica, identificação da especialidade cursada e verso com o registro autenticado.',
    icon: 'certificate-outline',
  },
  {
    id: 'rqe',
    name: 'Certidão de RQE (exclusivo médicos)',
    description: 'Registro de Qualificação de Especialidade emitido pelo CRM.',
    details:
      'Exclusivo para médicos. Emitido junto ao CRM do Estado, com a indicação da qualificação (ex.: cardiologista, clínica médica, ortopedia e traumatologia, neurologia). Deve conter nome completo, número da inscrição, número do RQE, data de validade e data de emissão (TJPR considera apenas dentro de 30 dias corridos).',
    icon: 'medal-outline',
  },
  {
    id: 'nit',
    name: 'Comprovante NIT',
    description: 'Extrato de contribuição previdenciária.',
    details:
      'Obrigatoriamente o extrato de contribuição previdenciária — a CTPS digital e a física são rejeitadas. Precisa conter número do NIT, nome completo do profissional e CPF.',
    icon: 'card-text-outline',
  },
  {
    id: 'curriculo',
    name: 'Currículo',
    description: 'Experiência acadêmica e profissional do perito.',
    details:
      'Contém experiência acadêmica e profissional. Alteramos o número de telefone e e-mail para os do escritório. Aceitamos o currículo Lattes de forma geral — obrigatório para cadastro no TJAM e no TJFT.',
    icon: 'file-account-outline',
  },
  {
    id: 'bancarios',
    name: 'Comprovante de Dados Bancários',
    description: 'Conta em nome do perito titular.',
    details:
      'Precisa conter nome da instituição bancária, nome do perito como titular da conta, CPF, número da agência e número da conta bancária.',
    icon: 'bank-outline',
  },
  {
    id: 'foto',
    name: 'Foto Profissional',
    description: 'Foto utilizada para cadastro no TJSP e cartas.',
    details:
      'Utilizada para cadastro no TJSP e reaproveitada na carta de apresentação aos tribunais. Não há requisitos rígidos, mas pedimos que seja o mais profissional possível e transmita seriedade.',
    icon: 'account-box-outline',
  },
  {
    id: 'inscricao-municipal',
    name: 'Inscrição Municipal (TJMG e JT)',
    description: 'Exigido para TJMG e Justiça do Trabalho.',
    details:
      'Comprovante de inscrição municipal contendo: número da inscrição municipal, nome completo, número do CPF, situação ativa/regular e a atividade profissional desenvolvida.',
    icon: 'city-variant-outline',
  },
  {
    id: 'curso-pericia-tjrj',
    name: 'Curso em Perícia Judicial (TJRJ)',
    description: 'Certificado obrigatório para cadastro no TJRJ.',
    details:
      'Obrigatório que seja em perícia judicial (perícia médica é rejeitada). Carga horária mínima de 21h. Deve conter nome completo do profissional e data da conclusão.',
    icon: 'gavel',
  },
];

export const INITIAL_FILES: Record<string, AttachedFile> = {
  'doc-pessoal': { uri: '', name: 'rg-frente-verso.pdf', mimeType: 'application/pdf', size: 245_000, isMock: true },
  cpf: { uri: '', name: 'comprovante-cpf-receita.pdf', mimeType: 'application/pdf', size: 182_400, isMock: true },
  residencia: { uri: '', name: 'conta-luz-marco.pdf', mimeType: 'application/pdf', size: 318_000, isMock: true },
  bancarios: { uri: '', name: 'comprovante-bancario.pdf', mimeType: 'application/pdf', size: 152_900, isMock: true },
};
