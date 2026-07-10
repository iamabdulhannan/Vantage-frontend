import React, { useEffect, useState } from 'react';
import { View, Modal, Pressable } from 'react-native';
import { Sparkles, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';
import { Button } from './Button';
import { LogoMark } from './Logo';

/**
 * Sponsored interstitial shown to FREE-plan companies before sharing a
 * statement - the free tier's earning channel. Currently a house ad slot;
 * swap the card contents for a real ad network (AdMob) creative when ad
 * account IDs exist. Continue unlocks after a short countdown.
 */
export function AdInterstitial({
  visible,
  onClose,
  onContinue,
}: {
  visible: boolean;
  onClose: () => void;
  onContinue: () => void;
}) {
  const t = useTheme();
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(3);

  useEffect(() => {
    if (!visible) return;
    setSecondsLeft(3);
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [visible]);

  const canContinue = secondsLeft === 0;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={{ flex: 1, backgroundColor: t.colors.scrim, justifyContent: 'center', paddingHorizontal: 24 }}>
        <View
          style={{
            backgroundColor: t.colors.bgElevated,
            borderRadius: 24,
            padding: 22,
            gap: 16,
            borderWidth: 1,
            borderColor: t.colors.border,
            ...t.shadow(3),
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ backgroundColor: t.colors.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
              <Text variant="micro" weight="semibold" tone="subtle" style={{ letterSpacing: 0.6 }}>
                SPONSORED
              </Text>
            </View>
            <View style={{ flex: 1 }} />
            {canContinue && (
              <Pressable onPress={onClose} hitSlop={10} accessibilityLabel="Close ad">
                <X size={18} color={t.colors.textSubtle} strokeWidth={2.2} />
              </Pressable>
            )}
          </View>

          {/* Ad creative slot - house ad until a real network is wired. */}
          <View style={{ alignItems: 'center', gap: 12, paddingVertical: 10 }}>
            <LogoMark size={56} />
            <Text variant="h3" weight="bold" center>
              Tired of ads on your statements?
            </Text>
            <Text variant="bodySm" tone="muted" center style={{ maxWidth: 280 }}>
              Upgrade to a paid plan: no ads on shared khata statements, plus team member logins
              for your staff.
            </Text>
            <Pressable
              onPress={() => {
                onClose();
                router.push('/(app)/billing');
              }}
              accessibilityLabel="See plans"
              nativeID="ad-upgrade"
            >
              <Text variant="bodySm" weight="bold" tone="accent">
                See plans from $10/month
              </Text>
            </Pressable>
          </View>

          <Button
            label={canContinue ? 'Continue to share' : `Continue in ${secondsLeft}...`}
            disabled={!canContinue}
            onPress={() => {
              onClose();
              onContinue();
            }}
            nativeID="ad-continue"
          />
        </View>
      </View>
    </Modal>
  );
}
