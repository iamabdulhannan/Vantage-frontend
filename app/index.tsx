import React, { useEffect } from 'react';
import { View, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ArrowRight,
  ShieldCheck,
  Activity,
  Lock,
  TrendingUp,
  Wallet,
  Users,
} from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from '@/components/Text';
import { Button } from '@/components/Button';
import { LogoMark } from '@/components/Logo';
import { Sparkline } from '@/components/charts/Sparkline';
import { kpis } from '@/data/mock';
import { formatCurrency, formatPercent } from '@/data/format';

const { width } = Dimensions.get('window');

function GlassStat({ icon: Icon, label, value, delta }: any) {
  return (
    <View style={{ flex: 1, gap: 8 }}>
      <View
        style={{
          width: 34,
          height: 34,
          borderRadius: 10,
          backgroundColor: 'rgba(255,255,255,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon size={17} color="#67E8F9" strokeWidth={2.2} />
      </View>
      <Text variant="caption" style={{ color: 'rgba(255,255,255,0.6)' }} weight="medium">
        {label}
      </Text>
      <Text variant="h3" weight="bold" mono style={{ color: '#FFFFFF' }}>
        {value}
      </Text>
      <Text variant="micro" weight="bold" mono style={{ color: '#34D399' }}>
        {delta}
      </Text>
    </View>
  );
}

export default function Welcome() {
  const t = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // First launch → show the guided tour so a first-time owner understands
  // the app before seeing the marketing landing page.
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
      <LinearGradient colors={['#0B1020', '#1E1B4B', '#0B1020']} style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }} />
      <LinearGradient
        colors={['rgba(99,102,241,0.26)', 'rgba(11,16,32,0)']}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 0.6 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 380 }}
      />
      <View style={{ flex: 1, paddingTop: insets.top + 18, paddingBottom: insets.bottom + 16, paddingHorizontal: 24 }}>
        {/* Brand */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <LogoMark size={40} />
          <Text variant="h3" weight="bold" style={{ color: '#FFFFFF', letterSpacing: -0.4 }}>
            Vantage
          </Text>
          <View style={{ flex: 1 }} />
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
              backgroundColor: 'rgba(52,211,153,0.16)',
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 999,
            }}
          >
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#34D399' }} />
            <Text variant="micro" weight="semibold" style={{ color: '#34D399' }}>
              LIVE
            </Text>
          </View>
        </View>

        <View style={{ flex: 0.55 }} />

        {/* Hero copy */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 7,
            alignSelf: 'flex-start',
            backgroundColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 999,
            marginBottom: 16,
          }}
        >
          <Activity size={13} color="#67E8F9" strokeWidth={2.4} />
          <Text variant="caption" weight="medium" style={{ color: 'rgba(255,255,255,0.82)' }}>
            Real-time financial command center
          </Text>
        </View>

        <Text variant="display" weight="bold" style={{ color: '#FFFFFF', letterSpacing: -1 }}>
          Your business,
        </Text>
        <Text variant="display" weight="bold" style={{ color: '#22D3EE', letterSpacing: -1, marginBottom: 12 }}>
          in full view.
        </Text>
        <Text variant="body" style={{ color: 'rgba(255,255,255,0.7)', maxWidth: 360 }}>
          Track revenue, capital, expenses and partner earnings live — and keep every customer ledger
          balanced to the cent. One command center for the whole company.
        </Text>

        <View style={{ flex: 0.6 }} />

        {/* Live preview card */}
        <View
          style={{
            borderRadius: 24,
            padding: 20,
            backgroundColor: 'rgba(255,255,255,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
          }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <View>
              <Text variant="caption" style={{ color: 'rgba(255,255,255,0.55)' }} weight="medium">
                TOTAL REVENUE · FY 2026
              </Text>
              <Text variant="h1" weight="bold" mono style={{ color: '#FFFFFF', marginTop: 4 }}>
                {formatCurrency(kpis[0].value, { compact: true })}
              </Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 3,
                backgroundColor: 'rgba(52,211,153,0.16)',
                paddingHorizontal: 9,
                paddingVertical: 5,
                borderRadius: 999,
              }}
            >
              <TrendingUp size={13} color="#34D399" strokeWidth={2.6} />
              <Text variant="caption" weight="bold" mono style={{ color: '#34D399' }}>
                {formatPercent(kpis[0].delta)}
              </Text>
            </View>
          </View>
          <View style={{ marginHorizontal: -4, marginBottom: 18 }}>
            <Sparkline data={kpis[0].spark} color="#818CF8" width={width - 88} height={56} />
          </View>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <GlassStat icon={Wallet} label="Capital" value={formatCurrency(kpis[1].value, { compact: true })} delta={formatPercent(kpis[1].delta)} />
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <GlassStat icon={Users} label="Partners" value="5" delta="+2 active" />
          </View>
        </View>

        <View style={{ flex: 0.5 }} />

        {/* Trust badges */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {[
            { icon: ShieldCheck, label: 'SOC 2 Type II' },
            { icon: Lock, label: 'Bank-grade encryption' },
            { icon: Activity, label: 'Live sync' },
          ].map((b) => (
            <View
              key={b.label}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 7,
                backgroundColor: 'rgba(255,255,255,0.05)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
              }}
            >
              <b.icon size={14} color="#67E8F9" strokeWidth={2.2} />
              <Text variant="caption" weight="medium" style={{ color: 'rgba(255,255,255,0.78)' }}>
                {b.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={{ flex: 1 }} />

        {/* CTAs */}
        <View style={{ gap: 12 }}>
          <Button label="Set up your company" iconRight={ArrowRight} onPress={() => router.push('/setup')} size="lg" />
          <Button label="Sign in" variant="ghost" onPress={() => router.push('/login')} size="lg" />
        </View>
      </View>
    </View>
  );
}
