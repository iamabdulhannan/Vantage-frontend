import React, { useEffect } from 'react';
import { View, Text as RNText } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  FiraSans_300Light,
  FiraSans_400Regular,
  FiraSans_500Medium,
  FiraSans_600SemiBold,
  FiraSans_700Bold,
} from '@expo-google-fonts/fira-sans';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { ToastHost } from '@/components/Toast';
import { LogoMark } from '@/components/Logo';
import { AuthProvider, useAuth } from '@/auth/AuthContext';
import { CompanyProvider } from '@/data/company';
import { StoreProvider } from '@/data/store';

function Gate() {
  const { signedIn, hydrating } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const t = useTheme();

  useEffect(() => {
    if (hydrating) return;
    const inApp = segments[0] === '(app)';
    if (!signedIn && inApp) {
      router.replace('/');
    } else if (signedIn && !inApp) {
      router.replace('/(app)/dashboard');
    }
  }, [signedIn, segments, hydrating]);

  if (hydrating) return <ThemedLoader />;

  return (
    <>
      <StatusBar style={t.mode === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: t.colors.bg },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
        <Stack.Screen name="setup" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="login" options={{ animation: 'slide_from_bottom' }} />
        <Stack.Screen name="(app)" />
      </Stack>
      <ToastHost />
    </>
  );
}

/** Branded splash - shown while fonts load and the session restores. */
function ThemedLoader() {
  const pulse = useSharedValue(1);
  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.07, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
    );
  }, [pulse]);
  const logoStyle = useAnimatedStyle(() => ({ transform: [{ scale: pulse.value }] }));

  return (
    <View style={{ flex: 1, backgroundColor: '#0B1020', alignItems: 'center', justifyContent: 'center' }}>
      <LinearGradient
        colors={['#0B1020', '#1E1B4B', '#0B1020']}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <Animated.View style={[{ alignItems: 'center', gap: 16 }, logoStyle]}>
        <LogoMark size={72} />
        {/* System font on purpose - this renders before custom fonts load. */}
        <RNText style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '700', letterSpacing: -0.5 }}>
          Vantage
        </RNText>
      </Animated.View>
      <RNText style={{ color: 'rgba(235,238,255,0.45)', fontSize: 12, position: 'absolute', bottom: 48 }}>
        Your business, in full view
      </RNText>
    </View>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    FiraSans_300Light,
    FiraSans_400Regular,
    FiraSans_500Medium,
    FiraSans_600SemiBold,
    FiraSans_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <CompanyProvider>
              <StoreProvider>{loaded ? <Gate /> : <ThemedLoader />}</StoreProvider>
            </CompanyProvider>
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
