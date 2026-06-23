import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export function Avatar({ initials, size = 40 }: { initials: string; size?: number }) {
  const t = useTheme();
  return (
    <LinearGradient
      colors={t.gradients.accent}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ width: size, height: size, borderRadius: size / 3, alignItems: 'center', justifyContent: 'center' }}
    >
      <Text weight="bold" style={{ color: '#FFFFFF', fontSize: size * 0.38 }} mono>
        {initials}
      </Text>
    </LinearGradient>
  );
}
