import type { Laudo } from '@/types/domain';

export const LAUDOS: Laudo[] = [
  { id: '1', caso: '#4829-23', nome: 'Maria Silva Santos', data: 'Emitido em 12 Out 2023', status: 'EM REVISÃO' },
  { id: '2', caso: '#4835-23', nome: 'João Pereira Alencar', data: 'Emitido em 11 Out 2023', status: 'FINALIZADO' },
  { id: '3', caso: '#4838-23', nome: 'Ana Costa Marinho', data: 'Emitido em 10 Out 2023', status: 'PENDENTE' },
  { id: '4', caso: '#4842-23', nome: 'Roberto Silva Lima', data: 'Emitido em 09 Out 2023', status: 'FINALIZADO' },
  { id: '5', caso: '#4850-23', nome: 'Francisca Oliveira', data: 'Emitido em 08 Out 2023', status: 'EM REVISÃO' },
  { id: '6', caso: '#4855-23', nome: 'Carlos Eduardo Santos', data: 'Emitido em 07 Out 2023', status: 'FINALIZADO' },
];

export const FILTROS_LAUDOS = ['Todos', 'Aguardando Revisão', 'Finalizados'] as const;
export type FiltroLaudo = (typeof FILTROS_LAUDOS)[number];
