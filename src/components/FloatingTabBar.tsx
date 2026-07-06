import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, BookOpen, Wallet, Users, Settings, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

const TAB_META: Record<string, { icon: LucideIcon; label: string }> = {
  dashboard: { icon: LayoutDashboard, label: 'Home' },
  ledgers: { icon: BookOpen, label: 'Ledgers' },
  payroll: { icon: Wallet, label: 'Payroll' },
  partners: { icon: Users, label: 'Partners' },
  settings: { icon: Settings, label: 'Settings' },
};

/**
 * Floating white pill tab bar: the active tab sits in a dark pill with its
 * label, the others show as quiet icons.
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((r) => TAB_META[r.name]);

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', left: 14, right: 14, bottom: insets.bottom + 12 }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: t.colors.bgElevated,
          borderRadius: 999,
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: t.colors.border,
          ...t.shadow(2),
        }}
      >
        {visibleRoutes.map((route) => {
          const meta = TAB_META[route.name];
          const Icon = meta.icon;
          const routeIndex = state.routes.findIndex((r) => r.key === route.key);
          const focused = state.index === routeIndex;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) {
              navigation.navigate(route.name as never);
            }
          };

          if (focused) {
            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                accessibilityRole="button"
                accessibilityState={{ selected: true }}
                accessibilityLabel={meta.label}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: t.colors.brand,
                  borderRadius: 999,
                  paddingHorizontal: 16,
                  paddingVertical: 11,
                }}
              >
                <Icon size={19} color={t.colors.brandText} strokeWidth={2.4} />
                <Text variant="bodySm" weight="bold" style={{ color: t.colors.brandText }}>
                  {meta.label}
                </Text>
              </Pressable>
            );
          }

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="button"
              accessibilityLabel={meta.label}
              hitSlop={6}
              style={{ paddingHorizontal: 14, paddingVertical: 11 }}
            >
              <Icon size={21} color={t.colors.textSubtle} strokeWidth={2} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
