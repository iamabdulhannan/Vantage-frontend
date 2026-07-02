import React, { useRef, useState } from 'react';
import { View, Dimensions, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  runOnJS,
} from 'react-native-reanimated';
import {
  BookOpen,
  LayoutDashboard,
  Users2,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  TrendingUp,
  Share2,
  type LucideIcon,
} from 'lucide-react-native';
import { Text } from '@/components/Text';
import { LogoMark } from '@/components/Logo';
import { PressableScale } from '@/components/motion';

export const ONBOARDED_KEY = 'vantage.onboarded.v1';

const { width: W, height: H } = Dimensions.get('window');

interface Slide {
  key: string;
  icon: LucideIcon;
  tint: string;
  title: string;
  body: string;
  bullets: { icon: LucideIcon; color: string; text: string }[];
}

const SLIDES: Slide[] = [
  {
    key: 'welcome',
    icon: Wallet,
    tint: '#818CF8',
    title: 'Run your whole business from your pocket',
    body: 'Vantage is like a manager for your shop or company — money in, money out, always up to date.',
    bullets: [
      { icon: TrendingUp, color: '#34D399', text: 'Everything saves automatically to the cloud' },
      { icon: Users2, color: '#22D3EE', text: 'Your whole team can use it — one account each' },
    ],
  },
  {
    key: 'khata',
    icon: BookOpen,
    tint: '#22D3EE',
    title: 'A digital khata for every customer',
    body: 'Give goods on credit? Tap YOU GAVE. Cash comes in? Tap YOU GOT. The balance works itself out.',
    bullets: [
      { icon: ArrowUpRight, color: '#FB7185', text: 'YOU GAVE — customer owes you more' },
      { icon: ArrowDownLeft, color: '#34D399', text: 'YOU GOT — payment received, balance drops' },
      { icon: Share2, color: '#818CF8', text: 'Share a PDF statement on WhatsApp anytime' },
    ],
  },
  {
    key: 'dashboard',
    icon: LayoutDashboard,
    tint: '#818CF8',
    title: 'Know your money at a glance',
    body: 'Revenue, expenses, profit and how long your cash will last — calculated live from what you record.',
    bullets: [
      { icon: TrendingUp, color: '#34D399', text: 'Real growth numbers — never made-up figures' },
      { icon: Wallet, color: '#FBBF24', text: 'Cash runway warns you before money runs low' },
    ],
  },
  {
    key: 'team',
    icon: Users2,
    tint: '#34D399',
    title: 'Pay your team & partners right',
    body: 'Salaries with tax worked out for you, and partner profit split to the exact percent. No calculator needed.',
    bullets: [
      { icon: Wallet, color: '#22D3EE', text: 'One tap runs the whole payroll' },
      { icon: TrendingUp, color: '#818CF8', text: 'Each partner sees their exact share' },
    ],
  },
];

function SlideView({ slide, index, scrollX }: { slide: Slide; index: number; scrollX: Animated.SharedValue<number> }) {
  const range = [(index - 1) * W, index * W, (index + 1) * W];

  // Parallax: the illustration drifts at half speed and scales in — the
  // classic onboarding motion pattern.
  const artStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: interpolate(scrollX.value, range, [W * 0.35, 0, -W * 0.35], Extrapolation.CLAMP) },
      { scale: interpolate(scrollX.value, range, [0.72, 1, 0.72], Extrapolation.CLAMP) },
    ],
    opacity: interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP),
  }));

  const textStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: interpolate(scrollX.value, range, [W * 0.18, 0, -W * 0.18], Extrapolation.CLAMP) }],
    opacity: interpolate(scrollX.value, range, [0, 1, 0], Extrapolation.CLAMP),
  }));

  const Icon = slide.icon;

  return (
    <View style={{ width: W, paddingHorizontal: 28 }}>
      {/* Illustration */}
      <Animated.View style={[{ alignItems: 'center', marginTop: H * 0.045, marginBottom: 30 }, artStyle]}>
        <View style={{ width: 168, height: 168, alignItems: 'center', justifyContent: 'center' }}>
          {/* Glow orb */}
          <LinearGradient
            colors={[`${slide.tint}55`, `${slide.tint}00`]}
            style={{ position: 'absolute', width: 168, height: 168, borderRadius: 84 }}
          />
          <View
            style={{
              width: 116,
              height: 116,
              borderRadius: 34,
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.14)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={52} color={slide.tint} strokeWidth={1.8} />
          </View>
        </View>
      </Animated.View>

      {/* Copy */}
      <Animated.View style={[{ gap: 14 }, textStyle]}>
        <Text variant="h1" weight="bold" style={{ color: '#FFFFFF', letterSpacing: -0.6, lineHeight: 36 }}>
          {slide.title}
        </Text>
        <Text variant="body" style={{ color: 'rgba(235,238,255,0.72)', lineHeight: 23 }}>
          {slide.body}
        </Text>
        <View style={{ gap: 12, marginTop: 8 }}>
          {slide.bullets.map((b, i) => {
            const BIcon = b.icon;
            return (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 11,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.10)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <BIcon size={16} color={b.color} strokeWidth={2.4} />
                </View>
                <Text variant="bodySm" style={{ color: 'rgba(235,238,255,0.85)', flex: 1, lineHeight: 20 }} weight="medium">
                  {b.text}
                </Text>
              </View>
            );
          })}
        </View>
      </Animated.View>
    </View>
  );
}

/** The famous "worm" pagination dot — active dot stretches, neighbours shrink. */
function Dot({ index, scrollX }: { index: number; scrollX: Animated.SharedValue<number> }) {
  const range = [(index - 1) * W, index * W, (index + 1) * W];
  const style = useAnimatedStyle(() => ({
    width: interpolate(scrollX.value, range, [8, 26, 8], Extrapolation.CLAMP),
    opacity: interpolate(scrollX.value, range, [0.35, 1, 0.35], Extrapolation.CLAMP),
  }));
  return (
    <Animated.View
      style={[{ height: 8, borderRadius: 4, backgroundColor: '#A5B4FC' }, style]}
    />
  );
}

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const scrollX = useSharedValue(0);
  const pageSV = useSharedValue(0);
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [page, setPage] = useState(0);

  // Track the page inside the scroll handler (not onMomentumScrollEnd, which
  // never fires on web or for programmatic scrolls).
  const onScroll = useAnimatedScrollHandler((e) => {
    scrollX.value = e.contentOffset.x;
    const p = Math.round(e.contentOffset.x / W);
    if (p !== pageSV.value) {
      pageSV.value = p;
      runOnJS(setPage)(p);
    }
  });

  const finish = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDED_KEY, '1');
    } catch {
      // non-fatal — worst case the tour shows again
    }
    router.replace('/');
  };

  const next = () => {
    if (page >= SLIDES.length - 1) {
      void finish();
      return;
    }
    scrollRef.current?.scrollTo({ x: (page + 1) * W, animated: true });
  };

  const last = page === SLIDES.length - 1;

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1020' }}>
      <LinearGradient
        colors={['#0B1020', '#1E1B4B', '#0B1020']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <LinearGradient
        colors={['rgba(99,102,241,0.22)', 'rgba(11,16,32,0)']}
        start={{ x: 0.3, y: 0 }}
        end={{ x: 0.9, y: 0.7 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 420 }}
      />

      {/* Top bar: brand + skip */}
      <View
        style={{
          paddingTop: insets.top + 14,
          paddingHorizontal: 24,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogoMark size={34} />
          <Text variant="h3" weight="bold" style={{ color: '#FFFFFF', letterSpacing: -0.4 }}>
            Vantage
          </Text>
        </View>
        {!last && (
          <Pressable onPress={finish} hitSlop={10} accessibilityLabel="Skip tour" nativeID="onboarding-skip">
            <Text variant="bodySm" weight="semibold" style={{ color: 'rgba(235,238,255,0.6)' }}>
              Skip
            </Text>
          </Pressable>
        )}
      </View>

      {/* Slides */}
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        style={{ flex: 1 }}
      >
        {SLIDES.map((s, i) => (
          <SlideView key={s.key} slide={s} index={i} scrollX={scrollX} />
        ))}
      </Animated.ScrollView>

      {/* Dots + CTA */}
      <View style={{ paddingHorizontal: 24, paddingBottom: insets.bottom + 20, gap: 22 }}>
        <View style={{ flexDirection: 'row', gap: 7, justifyContent: 'center' }}>
          {SLIDES.map((_, i) => (
            <Dot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>
        <PressableScale onPress={next} scaleTo={0.97} accessibilityLabel={last ? 'Get started' : 'Next'} nativeID="onboarding-next">
          <LinearGradient
            colors={['#6366F1', '#22D3EE']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={{
              height: 56,
              borderRadius: 18,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Text weight="bold" style={{ color: '#FFFFFF', fontSize: 16 }}>
              {last ? 'Get started — it’s easy' : 'Next'}
            </Text>
            <ArrowRight size={19} color="#FFFFFF" strokeWidth={2.6} />
          </LinearGradient>
        </PressableScale>
      </View>
    </View>
  );
}
