import { MaterialCommunityIcons } from '@expo/vector-icons';

export type MaterialIconName = keyof typeof MaterialCommunityIcons.glyphMap;

export type StatusTone = 'success' | 'info' | 'warning' | 'neutral' | 'live';

export type StatusVariant = {
  label: string;
  tone: StatusTone;
};

export type PericiaStatus = 'CONCLUÍDO' | 'AGORA' | 'PRÓXIMO' | 'PENDENTE';

export type LaudoStatus = 'EM REVISÃO' | 'FINALIZADO' | 'PENDENTE';

export type Evento = {
  id: string;
  hora: string;
  caso: string;
  nome: string;
  tipo: string;
  status: PericiaStatus;
};

export type Laudo = {
  id: string;
  caso: string;
  nome: string;
  data: string;
  status: LaudoStatus;
};

export type SolicitacaoTipo = 'JUSTIÇA COMUM' | 'TRABALHISTA' | 'PREVIDENCIÁRIO';

export type Solicitacao = {
  id: string;
  numero: string;
  tipo: SolicitacaoTipo;
  nome: string;
  processo: string;
  data: string;
  local: string;
  localIcon: 'location' | 'medical';
};

export type DocItem = {
  id: string;
  name: string;
  description: string;
  details: string;
  icon: MaterialIconName;
};

export type AttachedFile = {
  uri: string;
  name: string;
  mimeType?: string;
  size?: number;
  isMock?: boolean;
};

export type FaqItem = {
  question: string;
  answer: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export type PassoState = 'done' | 'current' | 'pending';

export type Passo = {
  numero: number;
  titulo: string;
  icon: MaterialIconName;
  state: PassoState;
};
