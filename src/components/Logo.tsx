import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export function LogoMark({ size = 44, radius }: { size?: number; radius?: number }) {
  const t = useTheme();
  const r = radius ?? size * 0.3;
  return (
    <LinearGradient
      colors={t.gradients.accent}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: r, alignItems: 'center', justifyContent: 'center' }}
    >
      <Svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24">
        {/* ascending chevron — a vantage point looking up at growth */}
        <Path
          d="M3 16.5 L9 9 L12.5 13 L21 4"
          stroke="#FFFFFF"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <Path
          d="M15.5 4 L21 4 L21 9.5"
          stroke="#FFFFFF"
          strokeWidth={2.6}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </Svg>
    </LinearGradient>
  );
}

export function Wordmark({ size = 44, tone = 'default' }: { size?: number; tone?: 'default' | 'inverse' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <LogoMark size={size} />
      <Text variant="h2" weight="bold" tone={tone === 'inverse' ? 'inverse' : 'default'} style={{ letterSpacing: -0.5 }}>
        Vantage
      </Text>
    </View>
  );
}
