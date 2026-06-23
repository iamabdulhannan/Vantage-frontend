import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface Props extends ViewProps {
  elevation?: 0 | 1 | 2 | 3;
  padded?: boolean;
  style?: ViewStyle | ViewStyle[];
  children: React.ReactNode;
}

export function Card({ elevation = 1, padded = true, style, children, ...rest }: Props) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.colors.surface,
          borderRadius: t.radius.xl,
          borderWidth: 1,
          borderColor: t.colors.border,
          padding: padded ? t.spacing.xl : 0,
        },
        elevation > 0 && t.shadow(elevation as 1 | 2 | 3),
        style as ViewStyle,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}
