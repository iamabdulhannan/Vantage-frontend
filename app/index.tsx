import React, { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ArrowRight, BookOpen, LayoutDashboard, Users2, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { LogoMark } from '@/components/Logo';

const FEATURES: { icon: LucideIcon; tint: string; soft: string; title: string; sub: string }[] = [
  {
    icon: BookOpen,
    tint: '#16A34A',
    soft: '#E3F3E8',
    title: 'Customer khata',
    sub: 'You gave, you got - balances work themselves out.',
  },
  {
    icon: LayoutDashboard,
    tint: '#0E7490',
    soft: '#E0F2F5',
    title: 'Live profit & cash',
    sub: 'Revenue, expenses and runway, always up to date.',
  },
  {
    icon: Users2,
    tint: '#C2760A',
    soft: '#FBF0DB',
    title: 'Payroll & partners',
    sub: 'Salaries and profit splits computed for you.',
  },
];

export default function Welcome() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // First launch → show the guided tour so a first-time owner understands
  // the app before seeing this landing page.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem('vantage.onboarded.v1')
      .then((seen) => {
        if (!cancelled && !seen) router.replace('/onboarding');
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <LinearGradient
        colors={t.gradients.glow}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.9, y: 0.8 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 380 }}
      />

      <View
        style={{
          flex: 1,
          paddingTop: insets.top + 20,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 28,
        }}
      >
        {/* Brand */}
        <Animated.View entering={FadeIn.duration(600)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogoMark size={38} />
          <Text variant="h3" weight="bold" style={{ letterSpacing: -0.4 }}>
            Vantage
          </Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Hero - one idea, no bulk */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(16)} style={{ gap: 14 }}>
          <Text weight="bold" style={{ fontSize: 34, lineHeight: 41, letterSpacing: -1 }}>
            The simple way to{'\n'}run your business.
          </Text>
          <Text variant="body" tone="muted" style={{ lineHeight: 23, maxWidth: 310 }}>
            Khata, profit, payroll and partner splits - one clean app, live from anywhere.
          </Text>
        </Animated.View>

        {/* Three light feature rows */}
        <View style={{ gap: 18, marginTop: 34 }}>
          {FEATURES.map((f, i) => {
            const Icon = f.icon;
            return (
              <Animated.View
                key={f.title}
                entering={FadeInDown.delay(220 + i * 110).springify().damping(16)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: f.soft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={19} color={f.tint} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodySm" weight="semibold">
                    {f.title}
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {f.sub}
                  </Text>
                </View>
              </Animated.View>
            );
          })}
        </View>

        <View style={{ flex: 1 }} />

        {/* CTA */}
        <Animated.View entering={FadeInDown.delay(600).springify().damping(16)} style={{ gap: 16 }}>
          <Button label="Set up your company" iconRight={ArrowRight} size="lg" onPress={() => router.push('/setup')} nativeID="cta-setup" />
          <Pressable onPress={() => router.push('/login')} hitSlop={8} accessibilityLabel="Sign in" nativeID="cta-signin">
            <Text variant="bodySm" weight="semibold" center tone="muted">
              Already have an account? <Text variant="bodySm" weight="bold" tone="accent">Sign in</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
