import { colors } from '@/constants/theme';
import type { LaudoStatus, PericiaStatus, StatusTone } from '@/types/domain';

export type StatusVisual = {
  bg: string;
  color: string;
};

const TONE_STYLES: Record<StatusTone, StatusVisual> = {
  success: { bg: colors.primaryTint, color: colors.primaryDark },
  info: { bg: colors.primaryTint, color: colors.primaryDark },
  warning: { bg: colors.warningBg, color: colors.warning },
  neutral: { bg: colors.bgBlueGrey, color: colors.textMuted },
  live: { bg: colors.surface, color: colors.primaryDark },
};

export function styleForTone(tone: StatusTone): StatusVisual {
  return TONE_STYLES[tone];
}

const PERICIA_TONE: Record<PericiaStatus, StatusTone> = {
  CONCLUÍDO: 'success',
  PRÓXIMO: 'info',
  AGORA: 'live',
  PENDENTE: 'neutral',
};

const LAUDO_TONE: Record<LaudoStatus, StatusTone> = {
  FINALIZADO: 'success',
  'EM REVISÃO': 'info',
  PENDENTE: 'warning',
};

export function periciaStatusVisual(status: PericiaStatus): StatusVisual {
  return styleForTone(PERICIA_TONE[status]);
}

export function laudoStatusVisual(status: LaudoStatus): StatusVisual {
  return styleForTone(LAUDO_TONE[status]);
}
