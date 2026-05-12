import type { FaqItem } from '@/types/domain';

export const FAQ: FaqItem[] = [
  {
    question: 'Quais documentos preciso enviar?',
    answer:
      'O cadastro reúne 16 itens: documento pessoal (RG ou CNH), cédula do órgão de classe, comprovante de CPF, título de eleitor, comprovante de residência, regularidade financeira, certidão ético-profissional, diploma, certificado de especializações (se houver), certidão de RQE (exclusivo médicos), comprovante NIT, currículo, dados bancários, foto profissional, inscrição municipal (TJMG e Justiça do Trabalho) e certificado de curso em perícia judicial (TJRJ). Toque em cada item no dossiê para ver as exigências detalhadas.',
  },
  {
    question: 'Como tirar a Certidão Ético-Profissional?',
    answer:
      'Acesse o portal do seu órgão de classe (CRM, CREA, CAU, COREN, etc.), faça login com o número da sua inscrição e solicite a Certidão Ético-Profissional. Atenção aos prazos: o TJPR só aceita certidões emitidas há, no máximo, 30 dias corridos, e o TJRJ exige inexistência de conduta disciplinar nos últimos 10 anos.',
  },
  {
    question: 'O comprovante de CPF da Receita serve?',
    answer:
      'Sim — e é o único aceito. Precisa ser emitido pela Receita Federal, com no máximo 30 dias de emissão, exibindo nome completo, número do CPF, data de nascimento e a situação "REGULAR".',
  },
  {
    question: 'Posso enviar fotos do celular?',
    answer:
      'Sim. Aceitamos JPG, PNG e PDF de até 10 MB por arquivo. Para documentos físicos, tire a foto em local bem iluminado, sem reflexos, e certifique-se de que todos os dados estão legíveis. Para documentos com frente e verso, anexe as duas faces.',
  },
  {
    question: 'Quanto tempo leva a validação?',
    answer:
      'Após o envio completo do dossiê, nossa equipe faz a validação em até 48 horas úteis. Você receberá notificações por e-mail e no app a cada etapa concluída. Documentos com pendências são sinalizados individualmente para reenvio.',
  },
  {
    question: 'Posso editar um documento já enviado?',
    answer:
      'Sim. No dossiê, toque no ícone de olho ao lado do documento anexado para visualizá-lo. Dentro da pré-visualização há um botão "Remover" que permite excluir o arquivo e enviar uma nova versão.',
  },
];

export const HUMAN_SUPPORT_URL = 'https://wa.me/5511999999999';
