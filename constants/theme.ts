import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  primary: '#4AAFA6',
  primaryDark: '#2A8A7D',
  primaryDarker: '#1A3A36',
  primaryDisabled: '#A8D4CF',
  primaryTint: '#D4F1EC',
  primarySurface: '#E8F5F3',
  primarySurfaceSoft: '#F4FAF8',
  primaryBorder: '#B9DCD7',
  primarySurfaceAlt: '#EAF5F3',

  text: '#1A3A36',
  textMuted: '#687076',
  textSubtle: '#8A9BA5',
  textPlaceholder: '#A0AEB8',
  textHint: '#B0BEC5',
  textBody: '#445754',
  textSoft: '#5A6670',

  surface: '#FFFFFF',
  surfaceAlt: '#F7F9FA',
  surfaceInput: '#F4F7F7',

  bgBlueGrey: '#EEF1F3',
  bgGreyLight: '#F5F7F8',
  bgGreyMint: '#E8F0F2',

  border: '#E8EDEF',
  borderSubtle: '#E0E5E8',
  borderMint: '#E0EDEB',
  divider: '#EEF1F3',

  danger: '#C25A4A',
  dangerBg: '#FCF4F2',
  dangerBorder: '#F3CFC8',
  dangerNotif: '#E74C3C',

  warning: '#A07400',
  warningBg: '#FFF3C4',

  pending: '#E07A5F',

  inputText: '#2D3436',
  onlineDot: '#86E0A6',
  dotMuted: '#C0CBD1',
  dotMutedDeep: '#D8DEE2',
  helperLink: '#8A9694',
  helperLinkUnderline: '#C7D2D0',

  white: '#FFFFFF',
  black: '#000000',

  socialGoogleBorder: '#DADCE0',
  socialGoogleText: '#3C4043',
  socialGoogleBrand: '#4285F4',
  socialApple: '#000000',

  overlay: 'rgba(20, 36, 33, 0.55)',
  onPrimary90: 'rgba(255, 255, 255, 0.9)',
  onPrimary88: 'rgba(255, 255, 255, 0.88)',
  onPrimary85: 'rgba(255, 255, 255, 0.85)',
  onPrimary80: 'rgba(255, 255, 255, 0.8)',
  onPrimary75: 'rgba(255, 255, 255, 0.75)',
  onPrimary18: 'rgba(255, 255, 255, 0.18)',
  onPrimary22: 'rgba(255, 255, 255, 0.22)',
  onPrimary16: 'rgba(255, 255, 255, 0.16)',
  onPrimary14: 'rgba(255, 255, 255, 0.14)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 28,
  huge: 32,
} as const;

export const radius = {
  sm: 8,
  md: 10,
  lg: 12,
  xl: 14,
  xxl: 16,
  pill: 22,
  card: 18,
  modal: 20,
  hero: 24,
} as const;

export const fontWeight = {
  medium: '500',
  semibold: '600',
  bold: '700',
  black: '800',
} as const;

export const typography = {
  eyebrow: {
    fontSize: 10,
    fontWeight: fontWeight.black,
    letterSpacing: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: fontWeight.bold,
    letterSpacing: 0.7,
  },
  labelLg: {
    fontSize: 12,
    fontWeight: fontWeight.bold,
    letterSpacing: 1,
  },
  caption: {
    fontSize: 12,
    color: colors.textMuted,
  },
  bodySm: {
    fontSize: 13,
    color: colors.text,
  },
  body: {
    fontSize: 14,
    color: colors.text,
  },
  bodyLg: {
    fontSize: 15,
    color: colors.text,
  },
  titleSm: {
    fontSize: 18,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  title: {
    fontSize: 22,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  titleLg: {
    fontSize: 26,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
  display: {
    fontSize: 32,
    fontWeight: fontWeight.black,
    color: colors.text,
  },
} as const satisfies Record<string, TextStyle>;

export const shadow = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  soft: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 1,
  },
  card: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardLg: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  primary: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  primaryDark: {
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 5,
  },
  modal: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 12,
  },
  topBarUp: {
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 6,
  },
} as const satisfies Record<string, ViewStyle>;

export const layout = {
  statusBarTop: Platform.select({ ios: 60, android: 40, default: 14 }) as number,
  authHeaderTop: Platform.select({ ios: 70, android: 50, default: 14 }) as number,
  compactHeaderTop: Platform.select({ ios: 56, android: 36, default: 14 }) as number,
  iosBottomSafe: Platform.OS === 'ios' ? 30 : 18,
  iosBottomSafeSm: Platform.OS === 'ios' ? 28 : 14,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

