import React from 'react';
import { View, Pressable } from 'react-native';
import { Sun, Moon, Bell } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';
import { Avatar } from './Avatar';

export function Header({
  title,
  subtitle,
  initials,
  showBell = true,
}: {
  title: string;
  subtitle?: string;
  initials?: string;
  showBell?: boolean;
}) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <View style={{ flex: 1 }}>
        {subtitle && (
          <Text variant="bodySm" tone="muted" weight="medium">
            {subtitle}
          </Text>
        )}
        <Text variant="h1" weight="bold" style={{ letterSpacing: -0.6 }} numberOfLines={1}>
          {title}
        </Text>
      </View>

      <Pressable
        onPress={t.toggleMode}
        hitSlop={8}
        accessibilityLabel={t.mode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        style={{
          width: 42,
          height: 42,
          borderRadius: 14,
          backgroundColor: t.colors.surface,
          borderWidth: 1,
          borderColor: t.colors.border,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {t.mode === 'dark' ? (
          <Sun size={20} color={t.colors.warning} strokeWidth={2.2} />
        ) : (
          <Moon size={20} color={t.colors.text} strokeWidth={2.2} />
        )}
      </Pressable>

      {showBell && (
        <Pressable
          hitSlop={8}
          accessibilityLabel="Notifications"
          style={{
            width: 42,
            height: 42,
            borderRadius: 14,
            backgroundColor: t.colors.surface,
            borderWidth: 1,
            borderColor: t.colors.border,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Bell size={20} color={t.colors.text} strokeWidth={2.2} />
          <View
            style={{
              position: 'absolute',
              top: 9,
              right: 10,
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: t.colors.danger,
              borderWidth: 1.5,
              borderColor: t.colors.surface,
            }}
          />
        </Pressable>
      )}

      {initials && <Avatar initials={initials} size={42} />}
    </View>
  );
}
