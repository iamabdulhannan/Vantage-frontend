import React from 'react';
import { ScrollView, View, ViewStyle, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useKeyboardHeight } from '@/utils/useKeyboardHeight';

export function Screen({
  children,
  scroll = true,
  padded = true,
  style,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  padded?: boolean;
  style?: ViewStyle;
}) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();
  const pad = padded ? t.spacing.xl : 0;

  if (!scroll) {
    return (
      <View style={[{ flex: 1, backgroundColor: t.colors.bg, paddingTop: insets.top, paddingHorizontal: pad }, style]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: t.colors.bg }}
      // Extra bottom padding = live keyboard height, so focused inputs scroll
      // clear of the keyboard on every platform (incl. Android edge-to-edge,
      // where adjustResize no longer resizes the window).
      contentContainerStyle={[
        { paddingTop: insets.top + t.spacing.sm, paddingHorizontal: pad, paddingBottom: 108 + kb, gap: t.spacing.xl },
        style,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
