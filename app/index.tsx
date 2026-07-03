import React, { useEffect } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { ArrowRight, BookOpen, LayoutDashboard, Users2, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { LogoMark } from '@/components/Logo';

const FEATURES: { icon: LucideIcon; tint: string; title: string; sub: string }[] = [
  {
    icon: BookOpen,
    tint: '#22D3EE',
    title: 'Customer khata',
    sub: 'You gave, you got - balances work themselves out.',
  },
  {
    icon: LayoutDashboard,
    tint: '#818CF8',
    title: 'Live profit & cash',
    sub: 'Revenue, expenses and runway, always up to date.',
  },
  {
    icon: Users2,
    tint: '#34D399',
    title: 'Payroll & partners',
    sub: 'Salaries and profit splits computed for you.',
  },
];

export default function Welcome() {
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
    <View style={{ flex: 1, backgroundColor: '#0B1020' }}>
      <LinearGradient
        colors={['#0B1020', '#1E1B4B', '#0B1020']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={['rgba(99,102,241,0.20)', 'rgba(11,16,32,0)']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.9, y: 0.8 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 400 }}
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
          <Text variant="h3" weight="bold" style={{ color: '#FFFFFF', letterSpacing: -0.4 }}>
            Vantage
          </Text>
        </Animated.View>

        <View style={{ flex: 1 }} />

        {/* Hero - one idea, no bulk */}
        <Animated.View entering={FadeInDown.delay(100).springify().damping(16)} style={{ gap: 14 }}>
          <Text weight="bold" style={{ color: '#FFFFFF', fontSize: 34, lineHeight: 41, letterSpacing: -1 }}>
            The simple way to{'\n'}run your business.
          </Text>
          <Text variant="body" style={{ color: 'rgba(235,238,255,0.68)', lineHeight: 23, maxWidth: 310 }}>
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
                    width: 42,
                    height: 42,
                    borderRadius: 13,
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.10)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={19} color={f.tint} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodySm" weight="semibold" style={{ color: '#FFFFFF' }}>
                    {f.title}
                  </Text>
                  <Text variant="caption" style={{ color: 'rgba(235,238,255,0.55)' }}>
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
            <Text variant="bodySm" weight="semibold" center style={{ color: 'rgba(235,238,255,0.75)' }}>
              Already have an account? <Text variant="bodySm" weight="bold" style={{ color: '#67E8F9' }}>Sign in</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </View>
    </View>
  );
}
