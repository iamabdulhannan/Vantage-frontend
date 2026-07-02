import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';
import { passwordStrength } from '@/utils/password';

/** Four-segment live strength meter shown under password fields. */
export function PasswordStrength({ password }: { password: string }) {
  const t = useTheme();
  if (!password) return null;

  const { score, label } = passwordStrength(password);
  const colors = [t.colors.danger, t.colors.danger, t.colors.warning, t.colors.accent, t.colors.success];
  const color = colors[score];

  return (
    <View style={{ gap: 6 }}>
      <View style={{ flexDirection: 'row', gap: 5 }}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: i < score ? color : t.colors.surfaceAlt,
            }}
          />
        ))}
      </View>
      <Text variant="micro" weight="semibold" style={{ color }}>
        {label}
      </Text>
    </View>
  );
}
