import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, AppState, Platform, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn } from 'react-native-reanimated';
import { Fingerprint } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/auth/AuthContext';
import { Text } from './Text';
import { Button } from './Button';
import { LogoMark } from './Logo';
import { PressableScale } from './motion';
import { authenticateBiometric, isBiometricEnabled } from '@/utils/biometric';

/**
 * Full-screen app lock. When the user enabled fingerprint login, a signed-in
 * session is hidden behind this screen on cold start AND whenever the app
 * comes back from the background - unlock with a fingerprint instead of
 * typing the password again. "Use password instead" signs out to the login
 * screen as the escape hatch.
 */
export function BiometricLock() {
  const t = useTheme();
  const { signedIn, signOut } = useAuth();
  // null = still reading the preference (render the shield, not the app).
  const [enabled, setEnabled] = useState<boolean | null>(Platform.OS === 'web' ? false : null);
  const [locked, setLocked] = useState(true);
  const [failed, setFailed] = useState(false);
  const prompting = useRef(false);

  const tryUnlock = useCallback(async () => {
    if (prompting.current) return;
    prompting.current = true;
    setFailed(false);
    const ok = await authenticateBiometric('Unlock Vantage');
    prompting.current = false;
    if (ok) setLocked(false);
    else setFailed(true);
  }, []);

  // Read the preference once.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    isBiometricEnabled().then(setEnabled).catch(() => setEnabled(false));
  }, []);

  // Re-lock whenever the app is backgrounded.
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'background') setLocked(true);
    });
    return () => sub.remove();
  }, []);

  // Auto-prompt the moment the lock becomes visible.
  const shouldLock = signedIn && enabled === true && locked;
  useEffect(() => {
    if (shouldLock) void tryUnlock();
  }, [shouldLock, tryUnlock]);

  // Reading the flag: keep the app hidden briefly so content never flashes
  // before the lock decision is known.
  const deciding = signedIn && enabled === null;

  if (!shouldLock && !deciding) return null;

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: t.colors.bg, zIndex: 2000 }}>
      <LinearGradient
        colors={t.gradients.glow}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 360 }}
      />
      {!deciding && (
        <Animated.View entering={FadeIn.duration(300)} style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, gap: 22 }}>
          <LogoMark size={64} />
          <View style={{ alignItems: 'center', gap: 6 }}>
            <Text variant="h2" weight="bold">
              Vantage is locked
            </Text>
            <Text variant="bodySm" tone="muted" center>
              {failed ? 'Fingerprint not recognised. Try again.' : 'Unlock with your fingerprint to continue.'}
            </Text>
          </View>

          <PressableScale
            onPress={tryUnlock}
            scaleTo={0.92}
            accessibilityLabel="Unlock with fingerprint"
            nativeID="biometric-unlock"
            style={{
              width: 84,
              height: 84,
              borderRadius: 999,
              backgroundColor: t.colors.accentSoft,
              borderWidth: 2,
              borderColor: t.colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Fingerprint size={40} color={t.colors.accent} strokeWidth={1.8} />
          </PressableScale>

          <Pressable onPress={signOut} hitSlop={10} accessibilityLabel="Use password instead" nativeID="biometric-password">
            <Text variant="bodySm" weight="semibold" tone="accent">
              Use password instead
            </Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}
