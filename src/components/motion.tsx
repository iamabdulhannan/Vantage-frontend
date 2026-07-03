import React, { useEffect } from 'react';
import { Pressable, PressableProps, ViewStyle, StyleProp } from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  cancelAnimation,
  Easing,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

/**
 * Reveal - staggered entrance. Pass `index` for list stagger.
 * Runs on the UI thread via Reanimated layout animations.
 */
export function Reveal({
  children,
  index = 0,
  delay = 0,
  style,
}: {
  children: React.ReactNode;
  index?: number;
  delay?: number;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Animated.View
      style={style}
      entering={FadeInDown.delay(delay + index * 65)
        .duration(440)
        .springify()
        .damping(16)
        .mass(0.7)}
    >
      {children}
    </Animated.View>
  );
}

/** PressableScale - springy press feedback on the UI thread. */
export function PressableScale({
  children,
  onPress,
  style,
  scaleTo = 0.97,
  ...rest
}: PressableProps & { scaleTo?: number; style?: StyleProp<ViewStyle>; children: React.ReactNode }) {
  const scale = useSharedValue(1);
  const aStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(scaleTo, { damping: 18, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 14, stiffness: 220 });
      }}
      style={[style, aStyle]}
      {...rest}
    >
      {children}
    </AnimatedPressable>
  );
}

/** PulseDot - a live status dot with an expanding, fading ring. */
export function PulseDot({ color, size = 8 }: { color: string; size?: number }) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.55);

  useEffect(() => {
    scale.value = withRepeat(withSequence(withTiming(2.6, { duration: 1400, easing: Easing.out(Easing.ease) }), withTiming(1, { duration: 0 })), -1, false);
    opacity.value = withRepeat(withSequence(withTiming(0, { duration: 1400, easing: Easing.out(Easing.ease) }), withTiming(0.55, { duration: 0 })), -1, false);
    return () => {
      cancelAnimation(scale);
      cancelAnimation(opacity);
    };
  }, []);

  const ringStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }], opacity: opacity.value }));

  return (
    <Animated.View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View
        style={[{ position: 'absolute', width: size, height: size, borderRadius: size / 2, backgroundColor: color }, ringStyle]}
      />
      <Animated.View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color }} />
    </Animated.View>
  );
}

/** ProgressBar - animated fill (0..1). */
export function ProgressBar({
  progress,
  color,
  track,
  height = 8,
  delay = 250,
}: {
  progress: number;
  color: string;
  track: string;
  height?: number;
  delay?: number;
}) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withDelay(delay, withTiming(Math.max(0, Math.min(1, progress)), { duration: 900, easing: Easing.out(Easing.cubic) }));
  }, [progress]);
  const fill = useAnimatedStyle(() => ({ width: `${w.value * 100}%` }));
  return (
    <Animated.View style={{ height, borderRadius: height / 2, backgroundColor: track, overflow: 'hidden' }}>
      <Animated.View style={[{ height, borderRadius: height / 2, backgroundColor: color }, fill]} />
    </Animated.View>
  );
}
