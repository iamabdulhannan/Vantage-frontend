import React from 'react';
import { Pressable, ActivityIndicator, View, ViewStyle } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  nativeID?: string;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconRight: IconRight,
  loading = false,
  disabled = false,
  fullWidth = true,
  style,
  nativeID,
}: Props) {
  const t = useTheme();
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const heights: Record<Size, number> = { sm: 38, md: 48, lg: 56 };
  const height = heights[size];
  const isDisabled = disabled || loading;

  const textTone =
    variant === 'primary' ? 'accentText' : variant === 'danger' ? 'inverse' : variant === 'ghost' ? 'accent' : 'default';

  const iconColor =
    variant === 'primary'
      ? t.colors.accentText
      : variant === 'danger'
      ? '#FFFFFF'
      : variant === 'ghost'
      ? t.colors.accent
      : t.colors.text;

  const content = (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
      {loading ? (
        <ActivityIndicator color={iconColor} size="small" />
      ) : (
        <>
          {Icon && <Icon size={size === 'lg' ? 20 : 18} color={iconColor} strokeWidth={2.2} />}
          <Text
            variant={size === 'sm' ? 'bodySm' : 'body'}
            weight={variant === 'primary' || variant === 'danger' ? 'bold' : 'semibold'}
            tone={textTone as any}
          >
            {label}
          </Text>
          {IconRight && <IconRight size={size === 'lg' ? 20 : 18} color={iconColor} strokeWidth={2.2} />}
        </>
      )}
    </View>
  );

  const baseStyle: ViewStyle = {
    height,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: t.spacing['2xl'],
    width: fullWidth ? '100%' : undefined,
    opacity: isDisabled ? 0.5 : 1,
  };

  return (
    <AnimatedPressable
      onPress={isDisabled ? undefined : onPress}
      onPressIn={() => !isDisabled && (scale.value = withSpring(0.96, { damping: 18, stiffness: 320 }))}
      onPressOut={() => (scale.value = withSpring(1, { damping: 14, stiffness: 220 }))}
      nativeID={nativeID}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      style={[{ width: fullWidth ? '100%' : undefined }, aStyle, style]}
    >
      {variant === 'primary' ? (
        <LinearGradient colors={t.gradients.accent} start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }} style={[baseStyle, t.shadow(2)]}>
          {content}
        </LinearGradient>
      ) : (
        <View
          style={[
            baseStyle,
            variant === 'danger' && { backgroundColor: t.colors.danger },
            variant === 'secondary' && { backgroundColor: t.colors.surfaceAlt, borderWidth: 1, borderColor: t.colors.border },
            variant === 'ghost' && { backgroundColor: 'transparent' },
          ]}
        >
          {content}
        </View>
      )}
    </AnimatedPressable>
  );
}
