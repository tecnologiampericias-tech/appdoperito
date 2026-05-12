import type { Solicitacao } from '@/types/domain';

export const SOLICITACOES: Solicitacao[] = [
  {
    id: '1',
    numero: '#142-2024',
    tipo: 'JUSTIÇA COMUM',
    nome: 'Ricardo Oliveira Santos',
    processo: '5001245-12.2024.8.21.0001',
    data: '15 de Maio, 2024 às 14:30',
    local: 'Vara Cível de Porto Alegre - Sala 402',
    localIcon: 'location',
  },
  {
    id: '2',
    numero: '#145-2024',
    tipo: 'TRABALHISTA',
    nome: 'Beatriz Mendes Farias',
    processo: '0020456-77.2023.5.04.0012',
    data: '18 de Maio, 2024 às 09:00',
    local: 'Clínica MedExpert - Unidade Centro',
    localIcon: 'medical',
  },
  {
    id: '3',
    numero: '#150-2024',
    tipo: 'PREVIDENCIÁRIO',
    nome: 'Carlos Eduardo Braga',
    processo: '5009876-45.2024.4.03.6100',
    data: '22 de Maio, 2024 às 11:15',
    local: 'Agência INSS - Centro',
    localIcon: 'location',
  },
];
