import React from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, BookOpen, Wallet, Users, Settings, Plus, type LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { triggerQuickAdd } from '@/utils/quickAdd';
import { PressableScale } from './motion';

const TAB_META: Record<string, { icon: LucideIcon; label: string }> = {
  dashboard: { icon: LayoutDashboard, label: 'Home' },
  ledgers: { icon: BookOpen, label: 'Ledgers' },
  payroll: { icon: Wallet, label: 'Payroll' },
  partners: { icon: Users, label: 'Partners' },
  settings: { icon: Settings, label: 'Settings' },
};

/**
 * Floating white pill tab bar: the active tab sits in a dark icon pill, the
 * others are quiet icons, and a raised green + in the middle triggers the
 * active screen's add action (customer / expense / employee / partner).
 */
export function FloatingTabBar({ state, navigation }: BottomTabBarProps) {
  const t = useTheme();
  const insets = useSafeAreaInsets();

  const visibleRoutes = state.routes.filter((r) => TAB_META[r.name]);
  const activeRouteName = state.routes[state.index]?.name ?? 'dashboard';

  const renderTab = (route: (typeof state.routes)[number]) => {
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
            backgroundColor: t.colors.brand,
            borderRadius: 999,
            width: 46,
            height: 46,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon size={20} color={t.colors.brandText} strokeWidth={2.4} />
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
        style={{ width: 46, height: 46, alignItems: 'center', justifyContent: 'center' }}
      >
        <Icon size={21} color={t.colors.textSubtle} strokeWidth={2} />
      </Pressable>
    );
  };

  const leftTabs = visibleRoutes.slice(0, 2);
  const rightTabs = visibleRoutes.slice(2);

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
          paddingHorizontal: 12,
          paddingVertical: 8,
          borderWidth: 1,
          borderColor: t.colors.border,
          ...t.shadow(2),
        }}
      >
        {leftTabs.map(renderTab)}

        {/* Center +: the ONE add button - acts on whatever screen is active. */}
        <PressableScale
          onPress={() => triggerQuickAdd(activeRouteName)}
          scaleTo={0.92}
          nativeID="quick-add"
          accessibilityLabel="Add"
          style={{
            width: 56,
            height: 56,
            borderRadius: 999,
            backgroundColor: t.colors.accent,
            alignItems: 'center',
            justifyContent: 'center',
            marginTop: -22,
            borderWidth: 4,
            borderColor: t.colors.bg,
            ...t.shadow(2),
          }}
        >
          <Plus size={26} color={t.colors.accentText} strokeWidth={2.6} />
        </PressableScale>

        {rightTabs.map(renderTab)}
      </View>
    </View>
  );
}
