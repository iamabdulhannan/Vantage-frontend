import React from 'react';
import { View, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Intent = 'neutral' | 'success' | 'danger' | 'warning' | 'accent';

const DOT = '●';

export function Badge({
  label,
  intent = 'neutral',
  dot = false,
  style,
}: {
  label: string;
  intent?: Intent;
  dot?: boolean;
  style?: ViewStyle;
}) {
  const t = useTheme();
  const map = {
    neutral: { bg: t.colors.surfaceAlt, fg: t.colors.textMuted },
    success: { bg: t.colors.successSoft, fg: t.colors.success },
    danger: { bg: t.colors.dangerSoft, fg: t.colors.danger },
    warning: { bg: t.colors.warningSoft, fg: t.colors.warning },
    accent: { bg: t.colors.accentSoft, fg: t.colors.accent },
  }[intent];

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          alignSelf: 'flex-start',
          backgroundColor: map.bg,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: t.radius.full,
        },
        style,
      ]}
    >
      {dot && <Text variant="micro" style={{ color: map.fg, lineHeight: 12 }}>{DOT}</Text>}
      <Text variant="micro" weight="semibold" style={{ color: map.fg, letterSpacing: 0.3 }}>
        {label}
      </Text>
    </View>
  );
}
