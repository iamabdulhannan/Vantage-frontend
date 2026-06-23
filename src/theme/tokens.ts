/**
 * Vantage design tokens — "Trust & Authority" finance theme.
 * Professional navy + electric blue, full light & dark support.
 * Money/data values use Fira Code (tabular figures); UI uses Fira Sans.
 */

export type Mode = 'light' | 'dark';

export interface Palette {
  // Surfaces
  bg: string;
  bgElevated: string;
  surface: string;
  surfaceAlt: string;
  surfaceSunken: string;
  // Brand
  brand: string; // deep navy
  brandText: string; // text/icon that sits on brand surfaces
  accent: string; // primary CTA
  accentPressed: string;
  accentSoft: string; // tinted background
  accentText: string;
  // Text
  text: string;
  textMuted: string;
  textSubtle: string;
  textInverse: string;
  // Lines
  border: string;
  borderStrong: string;
  divider: string;
  // Status
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  // Misc
  scrim: string;
  shimmer: string;
}

export const lightPalette: Palette = {
  bg: '#F4F5FB',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#EEEFFA',
  surfaceSunken: '#E6E8F6',

  brand: '#1E1B4B',
  brandText: '#FFFFFF',
  accent: '#4F46E5',
  accentPressed: '#4338CA',
  accentSoft: '#E9E9FE',
  accentText: '#FFFFFF',

  text: '#0E1130',
  textMuted: '#565B83',
  textSubtle: '#8A8FB4',
  textInverse: '#F5F6FF',

  border: '#E6E7F4',
  borderStrong: '#CFD1EC',
  divider: '#EEEFF8',

  success: '#0F9D58',
  successSoft: '#DCFCE7',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  danger: '#E11D48',
  dangerSoft: '#FFE4E6',
  info: '#4F46E5',
  infoSoft: '#E9E9FE',

  scrim: 'rgba(15, 12, 40, 0.5)',
  shimmer: 'rgba(79, 70, 229, 0.06)',
};

export const darkPalette: Palette = {
  bg: '#0B1020',
  bgElevated: '#141A30',
  surface: '#141A30',
  surfaceAlt: '#1C2342',
  surfaceSunken: '#0D1326',

  brand: '#0B1020',
  brandText: '#EEF2FF',
  accent: '#818CF8',
  accentPressed: '#6366F1',
  accentSoft: 'rgba(129, 140, 248, 0.18)',
  accentText: '#FFFFFF',

  text: '#EEF2FF',
  textMuted: '#A6ADCE',
  textSubtle: '#6E7599',
  textInverse: '#0B1020',

  border: '#242C4B',
  borderStrong: '#34406B',
  divider: '#1A2238',

  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.16)',
  danger: '#FB7185',
  dangerSoft: 'rgba(251, 113, 133, 0.16)',
  info: '#818CF8',
  infoSoft: 'rgba(129, 140, 248, 0.18)',

  scrim: 'rgba(0, 0, 0, 0.62)',
  shimmer: 'rgba(255, 255, 255, 0.06)',
};

// Brand gradients per mode (used for hero, headers, CTA accents)
export interface GradientSet {
  brand: readonly [string, string];
  accent: readonly [string, string];
  glow: readonly [string, string];
}

export const gradients: { light: GradientSet; dark: GradientSet } = {
  light: {
    brand: ['#1E1B4B', '#312E81'] as const,
    accent: ['#4F46E5', '#06B6D4'] as const,
    glow: ['rgba(79,70,229,0.20)', 'rgba(6,182,212,0.02)'] as const,
  },
  dark: {
    brand: ['#0B1020', '#1E1B4B'] as const,
    accent: ['#6366F1', '#22D3EE'] as const,
    glow: ['rgba(99,102,241,0.24)', 'rgba(11,16,32,0)'] as const,
  },
};

export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  '3xl': 32,
  '4xl': 40,
  '5xl': 56,
  '6xl': 72,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 28,
  full: 999,
} as const;

export const fonts = {
  // UI / prose
  light: 'FiraSans_300Light',
  regular: 'FiraSans_400Regular',
  medium: 'FiraSans_500Medium',
  semibold: 'FiraSans_600SemiBold',
  bold: 'FiraSans_700Bold',
  // Numeric / data (tabular feel)
  monoRegular: 'FiraCode_400Regular',
  monoMedium: 'FiraCode_500Medium',
  monoSemibold: 'FiraCode_600SemiBold',
  monoBold: 'FiraCode_700Bold',
} as const;

export const type = {
  display: { fontSize: 32, lineHeight: 38, letterSpacing: -0.5 },
  h1: { fontSize: 25, lineHeight: 31, letterSpacing: -0.4 },
  h2: { fontSize: 20, lineHeight: 26, letterSpacing: -0.3 },
  h3: { fontSize: 16, lineHeight: 22, letterSpacing: -0.2 },
  body: { fontSize: 15, lineHeight: 22, letterSpacing: 0 },
  bodySm: { fontSize: 13, lineHeight: 19, letterSpacing: 0 },
  caption: { fontSize: 12, lineHeight: 16, letterSpacing: 0.2 },
  micro: { fontSize: 11, lineHeight: 14, letterSpacing: 0.4 },
} as const;

export function shadow(mode: Mode, level: 1 | 2 | 3) {
  // Web uses boxShadow via RN-web; native uses elevation/shadow props.
  const dark = mode === 'dark';
  const color = dark ? '#000000' : '#1E1B4B';
  const opacity = dark ? [0.4, 0.5, 0.6][level - 1] : [0.06, 0.1, 0.16][level - 1];
  const radiusMap = [10, 20, 36][level - 1];
  const offsetY = [4, 10, 20][level - 1];
  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radiusMap,
    shadowOffset: { width: 0, height: offsetY },
    elevation: level * 4,
  };
}
