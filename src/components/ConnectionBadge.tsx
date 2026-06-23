import React from 'react';
import { View } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/auth/AuthContext';
import { Text } from './Text';
import { PulseDot } from './motion';

/**
 * Shows whether the session is backed by the live API ("LIVE") or running
 * on local data ("LOCAL", e.g. the backend is unreachable / protected).
 */
export function ConnectionBadge() {
  const t = useTheme();
  const { online } = useAuth();

  const color = online ? t.colors.success : t.colors.warning;
  const bg = online ? t.colors.successSoft : t.colors.warningSoft;

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 7,
        backgroundColor: bg,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 999,
      }}
    >
      {online ? (
        <PulseDot color={color} size={7} />
      ) : (
        <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
      )}
      <Text variant="micro" weight="bold" style={{ color, letterSpacing: 0.4 }}>
        {online ? 'LIVE' : 'LOCAL'}
      </Text>
    </View>
  );
}
