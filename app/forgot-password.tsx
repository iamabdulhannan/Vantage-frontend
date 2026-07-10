import React, { useState } from 'react';
import { View, ScrollView, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Mail, Lock, Hash, CheckCircle2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { Field } from '@/components/Field';
import { LogoMark } from '@/components/Logo';
import { PasswordStrength } from '@/components/PasswordStrength';
import { validatePassword } from '@/utils/password';
import { useKeyboardHeight } from '@/utils/useKeyboardHeight';
import { api } from '@/api/client';
import { toast } from '@/components/Toast';

export default function ForgotPassword() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const kb = useKeyboardHeight();

  // Two steps: request the code, then enter code + new password.
  const [stage, setStage] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const sendCode = async () => {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError('Enter a valid email address');
    setError(undefined);
    setLoading(true);
    try {
      const res: any = await api.auth.forgotPassword(email.trim());
      setStage('reset');
      if (res && res.delivered === false) {
        toast.info('Email delivery is not configured yet. Ask your admin for the code.');
      } else {
        toast.success('If that email has an account, a 6-digit code is on its way.');
      }
    } catch (e: any) {
      setError(e?.message || 'Could not send the code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
    if (code.trim().length !== 6) return setError('Enter the 6-digit code from your email');
    const pwErr = validatePassword(password);
    if (pwErr) return setError(pwErr);
    setError(undefined);
    setLoading(true);
    try {
      await api.auth.resetPassword({ email: email.trim(), code: code.trim(), password });
      setStage('done');
    } catch (e: any) {
      setError(e?.message || 'Could not reset your password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.colors.bg }}>
      <LinearGradient colors={t.gradients.brand} style={{ paddingTop: insets.top + 12, paddingBottom: 36, paddingHorizontal: 24 }}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          accessibilityLabel="Go back"
          nativeID="forgot-back"
          style={{
            width: 38,
            height: 38,
            borderRadius: 12,
            backgroundColor: 'rgba(255,255,255,0.14)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
          }}
        >
          <ArrowLeft size={20} color="#FFFFFF" strokeWidth={2.2} />
        </Pressable>
        <LogoMark size={48} />
        <Text variant="h1" weight="bold" style={{ color: '#FFFFFF', marginTop: 18, letterSpacing: -0.5 }}>
          Reset password
        </Text>
        <Text variant="body" style={{ color: 'rgba(255,255,255,0.72)', marginTop: 4 }}>
          {stage === 'request'
            ? 'We will email you a 6-digit code.'
            : stage === 'reset'
            ? 'Enter the code and your new password.'
            : 'All set.'}
        </Text>
      </LinearGradient>

      <View style={{ flex: 1, paddingBottom: kb }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: insets.bottom + 24, gap: 18 }} keyboardShouldPersistTaps="handled">
          {stage === 'request' && (
            <>
              <Field
                label="Email address"
                icon={Mail}
                value={email}
                onChangeText={setEmail}
                placeholder="you@company.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
                autoFocus
              />
              {error && (
                <Text variant="caption" tone="danger" weight="medium">
                  {error}
                </Text>
              )}
              <Button label="Send code" onPress={sendCode} loading={loading} size="lg" nativeID="send-code" />
            </>
          )}

          {stage === 'reset' && (
            <>
              <Field
                label="6-digit code"
                icon={Hash}
                value={code}
                onChangeText={(v) => setCode(v.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                keyboardType="number-pad"
                autoFocus
              />
              <View style={{ gap: 10 }}>
                <Field label="New password" icon={Lock} value={password} onChangeText={setPassword} placeholder="Min 8 - letters & numbers" secure autoComplete="password-new" />
                <PasswordStrength password={password} />
              </View>
              {error && (
                <Text variant="caption" tone="danger" weight="medium">
                  {error}
                </Text>
              )}
              <Button label="Set new password" onPress={resetPassword} loading={loading} size="lg" nativeID="do-reset" />
              <Pressable onPress={sendCode} hitSlop={8} accessibilityLabel="Resend code" nativeID="resend-code">
                <Text variant="bodySm" weight="semibold" tone="accent" center>
                  Resend code
                </Text>
              </Pressable>
            </>
          )}

          {stage === 'done' && (
            <View style={{ alignItems: 'center', gap: 16, paddingTop: 20 }}>
              <View style={{ width: 64, height: 64, borderRadius: 20, backgroundColor: t.colors.successSoft, alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={32} color={t.colors.success} strokeWidth={2.2} />
              </View>
              <Text variant="h3" weight="bold" center>
                Password updated
              </Text>
              <Text variant="bodySm" tone="muted" center style={{ maxWidth: 280 }}>
                You can now sign in with your new password.
              </Text>
              <View style={{ width: '100%', marginTop: 8 }}>
                <Button label="Back to sign in" onPress={() => router.replace('/login')} size="lg" nativeID="back-to-login" />
              </View>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}
