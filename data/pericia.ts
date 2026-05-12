import type { Passo } from '@/types/domain';

export const PASSOS_PERICIA: Passo[] = [
  {
    numero: 1,
    titulo: 'Validar Identidade',
    icon: 'account-search-outline',
    state: 'done',
  },
  {
    numero: 2,
    titulo: 'Coletar Anamnese',
    icon: 'clipboard-text-outline',
    state: 'current',
  },
  {
    numero: 3,
    titulo: 'Emitir Parecer',
    icon: 'file-document-edit-outline',
    state: 'pending',
  },
];
