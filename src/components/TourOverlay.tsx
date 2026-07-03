import React, { useEffect, useState } from 'react';
import { View, Modal, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  LayoutDashboard,
  BookOpen,
  Wallet,
  Users,
  Settings,
  BellRing,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';
import { Button } from './Button';

const TOUR_KEY = 'vantage.tour.v1';

interface TourStep {
  icon: LucideIcon;
  tint: string;
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  {
    icon: LayoutDashboard,
    tint: '#818CF8',
    title: 'This is your Overview',
    body: 'Revenue, capital, expenses and profit, all live. Every number here comes from what you record, nothing is made up.',
  },
  {
    icon: BookOpen,
    tint: '#22D3EE',
    title: 'Ledgers is your khata book',
    body: 'Add customers, tap YOU GAVE when you give credit and YOU GOT when cash comes in. Share a PDF statement on WhatsApp anytime.',
  },
  {
    icon: BellRing,
    tint: '#FBBF24',
    title: 'Never chase payments from memory',
    body: 'Inside any customer khata, set a payment reminder. We notify you a day before and on the day. Their promise history builds a reliability status.',
  },
  {
    icon: Wallet,
    tint: '#34D399',
    title: 'Payroll runs itself',
    body: 'Add employees with salaries. Tax is worked out per person using real government slabs, and one tap pays everyone.',
  },
  {
    icon: Users,
    tint: '#A5B4FC',
    title: 'Partners get their exact share',
    body: 'Record each partner with their percentage. Payouts are computed for you, and you always see what the company keeps.',
  },
  {
    icon: Settings,
    tint: '#67E8F9',
    title: 'Settings has the rest',
    body: 'Edit your company profile, manage team seats, and change your plan anytime. That is the tour, go run your business.',
  },
];

/**
 * One-time guided tour shown on the first visit to the dashboard after
 * setting up a company or signing in on a new device.
 */
export function TourOverlay() {
  const t = useTheme();
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(TOUR_KEY)
      .then((seen) => {
        if (!seen) setVisible(true);
      })
      .catch(() => {});
  }, []);

  const finish = () => {
    setVisible(false);
    AsyncStorage.setItem(TOUR_KEY, '1').catch(() => {});
  };

  if (!visible) return null;

  const s = STEPS[step];
  const Icon = s.icon;
  const last = step === STEPS.length - 1;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={finish} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: 'rgba(6, 9, 22, 0.82)', justifyContent: 'flex-end' }}>
        <Pressable style={{ flex: 1 }} onPress={finish} accessibilityLabel="Skip tour" />
        <Animated.View
          key={step}
          entering={FadeInDown.springify().damping(17)}
          style={{
            backgroundColor: t.colors.bgElevated,
            borderTopLeftRadius: 26,
            borderTopRightRadius: 26,
            padding: 24,
            paddingBottom: 34,
            gap: 16,
            borderTopWidth: 1,
            borderColor: t.colors.border,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            <Animated.View entering={FadeIn.delay(80)}>
              <View
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  backgroundColor: `${s.tint}22`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={25} color={s.tint} strokeWidth={2.2} />
              </View>
            </Animated.View>
            <View style={{ flex: 1 }}>
              <Text variant="micro" tone="subtle" weight="semibold" style={{ letterSpacing: 0.5 }}>
                QUICK TOUR · {step + 1} OF {STEPS.length}
              </Text>
              <Text variant="h3" weight="bold" style={{ marginTop: 2 }}>
                {s.title}
              </Text>
            </View>
          </View>

          <Text variant="body" tone="muted" style={{ lineHeight: 22 }}>
            {s.body}
          </Text>

          {/* Progress dots */}
          <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
            {STEPS.map((_, i) => (
              <View
                key={i}
                style={{
                  width: i === step ? 22 : 7,
                  height: 7,
                  borderRadius: 4,
                  backgroundColor: i <= step ? t.colors.accent : t.colors.surfaceAlt,
                }}
              />
            ))}
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
            {!last && (
              <Pressable onPress={finish} hitSlop={10} accessibilityLabel="Skip tour" nativeID="tour-skip">
                <Text variant="bodySm" weight="semibold" tone="subtle">
                  Skip
                </Text>
              </Pressable>
            )}
            <View style={{ flex: 1 }}>
              <Button
                label={last ? 'Start using Vantage' : 'Next'}
                iconRight={ArrowRight}
                onPress={() => (last ? finish() : setStep((x) => x + 1))}
                nativeID="tour-next"
              />
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
