import React from 'react';
import { View, Pressable } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

export function Segmented({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: t.colors.surfaceAlt,
        borderRadius: t.radius.md,
        padding: 3,
        gap: 2,
      }}
    >
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              paddingVertical: 7,
              borderRadius: t.radius.sm,
              alignItems: 'center',
              backgroundColor: active ? t.colors.surface : 'transparent',
              ...(active ? t.shadow(1) : {}),
            }}
          >
            <Text variant="caption" weight={active ? 'semibold' : 'medium'} tone={active ? 'accent' : 'subtle'}>
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
