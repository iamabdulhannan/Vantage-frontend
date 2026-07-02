import React, { useEffect, useState } from 'react';
import { View, TextInput, Pressable, TextInputProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated';
import { Eye, EyeOff, LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

interface Props extends TextInputProps {
  label: string;
  icon?: LucideIcon;
  error?: string;
  secure?: boolean;
}

export function Field({ label, icon: Icon, error, secure, style, ...rest }: Props) {
  const t = useTheme();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(!!secure);

  // Smoothly animate the focus ring instead of snapping — small touch that
  // makes every form in the app feel polished.
  const focusSV = useSharedValue(0);
  useEffect(() => {
    focusSV.value = withTiming(focused ? 1 : 0, { duration: 160 });
  }, [focused, focusSV]);

  const ringStyle = useAnimatedStyle(() => ({
    borderColor: error
      ? t.colors.danger
      : interpolateColor(focusSV.value, [0, 1], [t.colors.border, t.colors.accent]),
    shadowOpacity: focusSV.value * 0.35,
  }));

  return (
    <View style={{ gap: 7 }}>
      <Text variant="bodySm" weight="medium" tone="muted">
        {label}
      </Text>
      <Animated.View
        style={[
          {
            flexDirection: 'row',
            alignItems: 'center',
            height: 48,
            borderRadius: t.radius.lg,
            borderWidth: 1.5,
            backgroundColor: t.colors.surface,
            paddingHorizontal: 14,
            gap: 10,
            shadowColor: t.colors.accent,
            shadowOffset: { width: 0, height: 0 },
            shadowRadius: 6,
          },
          ringStyle,
        ]}
      >
        {Icon && <Icon size={18} color={focused ? t.colors.accent : t.colors.textSubtle} strokeWidth={2.2} />}
        <TextInput
          style={[
            {
              flex: 1,
              fontFamily: t.fonts.regular,
              fontSize: 15,
              color: t.colors.text,
              height: '100%',
              // remove the browser's default focus outline on web (native ignores this)
              outlineStyle: 'none',
              outlineWidth: 0,
            } as any,
            style as any,
          ]}
          placeholderTextColor={t.colors.textSubtle}
          secureTextEntry={hidden}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...rest}
        />
        {secure && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10} accessibilityLabel={hidden ? 'Show password' : 'Hide password'}>
            {hidden ? (
              <EyeOff size={18} color={t.colors.textSubtle} strokeWidth={2.2} />
            ) : (
              <Eye size={18} color={t.colors.accent} strokeWidth={2.2} />
            )}
          </Pressable>
        )}
      </Animated.View>
      {error ? (
        <Text variant="caption" tone="danger" weight="medium">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
