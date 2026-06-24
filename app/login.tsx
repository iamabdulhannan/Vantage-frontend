import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Mail, Lock, ArrowLeft, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/auth/AuthContext';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { LogoMark } from '@/components/Logo';

export default function Login() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signIn } = useAuth();

  const [email, setEmail] = useState('alex@northwind.io');
  const [password, setPassword] = useState('vantage');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    const next: typeof errors = {};
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) next.email = 'Enter a valid email address';
    if (password.length < 4) next.password = 'Password must be at least 4 characters';
    setErrors(next);
    setFormError(undefined);
    if (Object.keys(next).length) return;
    setLoading(true);
    try {
      await signIn(email, password);
      // Gate in root layout handles redirect once signed in.
    } catch (e: any) {
      setFormError(e?.message || 'Could not sign in. Please try again.');
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      {/* Brand header */}
      <LinearGradient colors={['#0B1020', '#1E1B4B']} style={{ paddingTop: insets.top + 12, paddingBottom: 36, paddingHorizontal: 24 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Go back"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.1)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.2} />
        </Pressable>
        <LogoMark size={48} />
        <Text variant="h1" weight="bold" style={{ color: '#FFFFFF', marginTop: 18, letterSpacing: -0.5 }}>
          Welcome back
        </Text>
        <Text variant="body" style={{ color: 'rgba(255,255,255,0.65)', marginTop: 4 }}>
          Sign in to your command center
        </Text>
      </LinearGradient>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24, gap: 18 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ gap: 16 }}>
            <Field
              label="Email address"
              icon={Mail}
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              placeholder="you@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
            />
            <Field
              label="Password"
              icon={Lock}
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              placeholder="••••••••"
              secure
              autoComplete="password"
              textContentType="password"
            />
          </View>

          <Pressable hitSlop={8} style={{ alignSelf: 'flex-end' }}>
            <Text variant="bodySm" weight="semibold" tone="accent">
              Forgot password?
            </Text>
          </Pressable>

          {formError && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.colors.dangerSoft, borderRadius: t.radius.md, padding: 12 }}>
              <Text variant="bodySm" weight="medium" tone="danger" style={{ flex: 1 }}>
                {formError}
              </Text>
            </View>
          )}

          <Button label="Sign in" onPress={submit} loading={loading} size="lg" nativeID="login-submit" />

          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 4 }}>
            <ShieldCheck size={14} color={t.colors.success} strokeWidth={2.2} />
            <Text variant="caption" tone="subtle">
              Protected with bank-grade encryption
            </Text>
          </View>

          <Text variant="caption" tone="subtle" center style={{ marginTop: 4 }}>
            Sign in with your Vantage account. New here?{' '}
            <Text variant="caption" weight="semibold" tone="accent" onPress={() => router.replace('/setup')}>
              Set up your company
            </Text>
            .
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
