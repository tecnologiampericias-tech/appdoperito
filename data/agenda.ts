import type { Evento } from '@/types/domain';

export const DIAS_SEMANA = [
  { sigla: 'SEG', num: '12' },
  { sigla: 'TER', num: '13' },
  { sigla: 'QUA', num: '14' },
  { sigla: 'QUI', num: '15' },
  { sigla: 'SEX', num: '16' },
  { sigla: 'SAB', num: '17' },
  { sigla: 'DOM', num: '18' },
];

export const EVENTOS: Evento[] = [
  { id: '1', hora: '08:00', caso: '#4920-23', nome: 'Carlos Alberto Souza', tipo: 'Perícia Médica - Geral', status: 'CONCLUÍDO' },
  { id: '2', hora: '09:30', caso: '#4925-23', nome: 'Beatriz Mendonça', tipo: 'Avaliação Funcional', status: 'AGORA' },
  { id: '3', hora: '11:00', caso: '#4930-23', nome: 'Roberto Silva de Assis', tipo: 'Laudo Complementar', status: 'PRÓXIMO' },
  { id: '4', hora: '14:00', caso: '#4938-23', nome: 'Lúcia Ferreira Lima', tipo: 'Exame Admissional', status: 'PENDENTE' },
  { id: '5', hora: '15:30', caso: '', nome: '', tipo: '', status: 'PENDENTE' },
];
