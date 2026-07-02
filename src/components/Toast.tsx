import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInUp, FadeOutUp, LinearTransition } from 'react-native-reanimated';
import { CheckCircle2, AlertTriangle, Info } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  type: ToastType;
  message: string;
}

// Module-level bridge so non-component code (the data store, API helpers)
// can raise a toast: `toast.error('Could not save…')`. The host registers
// the real implementation when it mounts.
let pushFn: ((message: string, type: ToastType) => void) | null = null;

export const toast = {
  success: (message: string) => pushFn?.(message, 'success'),
  error: (message: string) => pushFn?.(message, 'error'),
  info: (message: string) => pushFn?.(message, 'info'),
};

const AUTO_DISMISS_MS = 4000;
const MAX_VISIBLE = 2;

/** Mount once at the app root — renders queued toasts above everything. */
export function ToastHost() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<ToastItem[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: ToastType) => {
      const id = ++counter.current;
      setItems((prev) => [...prev.slice(-(MAX_VISIBLE - 1)), { id, type, message }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss],
  );

  useEffect(() => {
    pushFn = push;
    return () => {
      if (pushFn === push) pushFn = null;
    };
  }, [push]);

  if (items.length === 0) return null;

  const meta: Record<ToastType, { icon: typeof Info; color: string; bg: string }> = {
    success: { icon: CheckCircle2, color: t.colors.success, bg: t.colors.successSoft },
    error: { icon: AlertTriangle, color: t.colors.danger, bg: t.colors.dangerSoft },
    info: { icon: Info, color: t.colors.accent, bg: t.colors.accentSoft },
  };

  return (
    <View
      pointerEvents="box-none"
      style={{ position: 'absolute', top: insets.top + 10, left: 16, right: 16, gap: 8, zIndex: 1000 }}
    >
      {items.map((item) => {
        const { icon: Icon, color, bg } = meta[item.type];
        return (
          <Animated.View key={item.id} entering={FadeInUp.springify().damping(16)} exiting={FadeOutUp} layout={LinearTransition.springify()}>
            <Pressable
              onPress={() => dismiss(item.id)}
              accessibilityRole="alert"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                backgroundColor: t.colors.bgElevated,
                borderWidth: 1,
                borderColor: t.colors.border,
                borderRadius: 14,
                paddingHorizontal: 14,
                paddingVertical: 12,
                ...t.shadow(3),
              }}
            >
              <View style={{ width: 30, height: 30, borderRadius: 9, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={16} color={color} strokeWidth={2.4} />
              </View>
              <Text variant="bodySm" weight="medium" style={{ flex: 1 }} numberOfLines={2}>
                {item.message}
              </Text>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
