/**
 * Vantage design tokens - "Meadow" finance theme.
 * Warm cream surfaces, white cards and a confident emerald accent,
 * with a deep-green dark mode. One family app-wide: Fira Sans.
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
  bg: '#F4F5EF',
  bgElevated: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceAlt: '#EFF1E8',
  surfaceSunken: '#E8EBDF',

  brand: '#151A17',
  brandText: '#FFFFFF',
  accent: '#16A34A',
  accentPressed: '#15803D',
  accentSoft: '#E3F3E8',
  accentText: '#FFFFFF',

  text: '#171C19',
  textMuted: '#5C665F',
  textSubtle: '#939C94',
  textInverse: '#FFFFFF',

  border: '#EBEDE3',
  borderStrong: '#D6DACB',
  divider: '#F0F2E9',

  success: '#16A34A',
  successSoft: '#E3F3E8',
  warning: '#C2760A',
  warningSoft: '#FBF0DB',
  danger: '#DC2626',
  dangerSoft: '#FCE9E7',
  info: '#0E7490',
  infoSoft: '#E0F2F5',

  scrim: 'rgba(21, 26, 23, 0.45)',
  shimmer: 'rgba(22, 163, 74, 0.06)',
};

export const darkPalette: Palette = {
  bg: '#0F1512',
  bgElevated: '#171F1A',
  surface: '#171F1A',
  surfaceAlt: '#20291F',
  surfaceSunken: '#0C110E',

  brand: '#0F1512',
  brandText: '#F0F5EF',
  accent: '#34D399',
  accentPressed: '#10B981',
  accentSoft: 'rgba(52, 211, 153, 0.16)',
  accentText: '#0B1B12',

  text: '#F0F5EF',
  textMuted: '#A9B5AA',
  textSubtle: '#71806F',
  textInverse: '#0F1512',

  border: '#25301F',
  borderStrong: '#37452F',
  divider: '#1B241C',

  success: '#34D399',
  successSoft: 'rgba(52, 211, 153, 0.16)',
  warning: '#FBBF24',
  warningSoft: 'rgba(251, 191, 36, 0.16)',
  danger: '#F87171',
  dangerSoft: 'rgba(248, 113, 113, 0.16)',
  info: '#67E8F9',
  infoSoft: 'rgba(103, 232, 249, 0.14)',

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
    brand: ['#151A17', '#25302A'] as const,
    accent: ['#16A34A', '#22C55E'] as const,
    glow: ['rgba(22,163,74,0.16)', 'rgba(244,245,239,0)'] as const,
  },
  dark: {
    brand: ['#0F1512', '#1B2A20'] as const,
    accent: ['#10B981', '#34D399'] as const,
    glow: ['rgba(52,211,153,0.20)', 'rgba(15,21,18,0)'] as const,
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
  // One family app-wide: numeric text uses Fira Sans too (tabular figures
  // via fontVariant where it matters). The old Fira Code clashed with RTL
  // currency symbols and made the app feel stitched together.
  monoRegular: 'FiraSans_400Regular',
  monoMedium: 'FiraSans_500Medium',
  monoSemibold: 'FiraSans_600SemiBold',
  monoBold: 'FiraSans_700Bold',
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
  const color = dark ? '#000000' : '#3A4438';
  const opacity = dark ? [0.4, 0.5, 0.6][level - 1] : [0.05, 0.08, 0.12][level - 1];
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
