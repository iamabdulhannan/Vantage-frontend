import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

type Variant = 'display' | 'h1' | 'h2' | 'h3' | 'body' | 'bodySm' | 'caption' | 'micro';
type Weight = 'light' | 'regular' | 'medium' | 'semibold' | 'bold';
type Tone = 'default' | 'muted' | 'subtle' | 'inverse' | 'accent' | 'success' | 'danger' | 'warning' | 'brandText' | 'accentText';

interface Props extends TextProps {
  variant?: Variant;
  weight?: Weight;
  tone?: Tone;
  mono?: boolean; // use Fira Code (tabular figures for money/data)
  center?: boolean;
  children: React.ReactNode;
}

export function Text({
  variant = 'body',
  weight = 'regular',
  tone = 'default',
  mono = false,
  center,
  style,
  children,
  ...rest
}: Props) {
  const t = useTheme();
  const scale = t.type[variant];

  const toneColor: Record<Tone, string> = {
    default: t.colors.text,
    muted: t.colors.textMuted,
    subtle: t.colors.textSubtle,
    inverse: t.colors.textInverse,
    accent: t.colors.accent,
    success: t.colors.success,
    danger: t.colors.danger,
    warning: t.colors.warning,
    brandText: t.colors.brandText,
    accentText: t.colors.accentText, // white — for labels on gradient/accent buttons
  };

  const monoMap: Record<Weight, string> = {
    light: t.fonts.monoRegular,
    regular: t.fonts.monoRegular,
    medium: t.fonts.monoMedium,
    semibold: t.fonts.monoSemibold,
    bold: t.fonts.monoBold,
  };
  const uiMap: Record<Weight, string> = {
    light: t.fonts.light,
    regular: t.fonts.regular,
    medium: t.fonts.medium,
    semibold: t.fonts.semibold,
    bold: t.fonts.bold,
  };

  const composed: TextStyle = {
    fontFamily: mono ? monoMap[weight] : uiMap[weight],
    fontSize: scale.fontSize,
    lineHeight: scale.lineHeight,
    letterSpacing: scale.letterSpacing,
    color: toneColor[tone],
    textAlign: center ? 'center' : undefined,
  };

  return (
    <RNText style={[composed, style]} {...rest}>
      {children}
    </RNText>
  );
}
