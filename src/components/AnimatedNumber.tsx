import React, { useEffect } from 'react';
import { TextInput, TextStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedProps, withTiming, Easing } from 'react-native-reanimated';
import { useTheme } from '@/theme/ThemeProvider';
import { currencyPrefix } from '@/data/format';

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

/**
 * Count-up money ticker. Animates value changes on the UI thread.
 * Formatting happens inside a worklet (compact M/K or grouped digits).
 */
export function AnimatedNumber({
  value,
  prefix,
  compact = true,
  size = 28,
  weight = 'bold',
  color,
  duration = 950,
  style,
}: {
  value: number;
  prefix?: string;
  compact?: boolean;
  size?: number;
  weight?: 'medium' | 'semibold' | 'bold';
  color?: string;
  duration?: number;
  style?: TextStyle;
}) {
  const t = useTheme();
  const sv = useSharedValue(0);

  useEffect(() => {
    sv.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) });
  }, [value]);

  const fontFamily =
    weight === 'bold' ? t.fonts.monoBold : weight === 'semibold' ? t.fonts.monoSemibold : t.fonts.monoMedium;
  const pfx = prefix ?? currencyPrefix();

  const animatedProps = useAnimatedProps(() => {
    const v = sv.value;
    const sign = v < 0 ? '-' : '';
    const abs = Math.abs(v);
    let body: string;
    if (compact) {
      if (abs >= 1_000_000) body = (abs / 1_000_000).toFixed(2) + 'M';
      else if (abs >= 1_000) body = (abs / 1_000).toFixed(1) + 'K';
      else body = abs.toFixed(0);
    } else {
      // grouped integer with thousands separators (worklet-safe)
      let intStr = Math.round(abs).toFixed(0);
      let out = '';
      let c = 0;
      for (let i = intStr.length - 1; i >= 0; i--) {
        out = intStr[i] + out;
        c++;
        if (c % 3 === 0 && i > 0) out = ',' + out;
      }
      body = out;
    }
    const text = `${sign}${pfx}${body}`;
    return { text, defaultValue: text } as any;
  });

  return (
    <AnimatedTextInput
      editable={false}
      underlineColorAndroid="transparent"
      animatedProps={animatedProps}
      style={[
        {
          fontFamily,
          fontSize: size,
          lineHeight: size * 1.12,
          color: color ?? t.colors.text,
          padding: 0,
          margin: 0,
          // TextInput has a large intrinsic width (scales with font size) -
          // without these it shoves row siblings outside their card.
          minWidth: 0,
          flexShrink: 1,
        },
        style,
      ]}
      pointerEvents="none"
    />
  );
}
