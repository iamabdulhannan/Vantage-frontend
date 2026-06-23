import React from 'react';
import { ScrollView, View, ViewStyle, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';

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
      contentContainerStyle={[{ paddingTop: insets.top + t.spacing.sm, paddingHorizontal: pad, paddingBottom: 32, gap: t.spacing.xl }, style]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}
