import React, { useState } from 'react';
import { View, Pressable, Switch } from 'react-native';
import {
  ChevronRight,
  Bell,
  Fingerprint,
  Users2,
  CreditCard,
  Blocks,
  LifeBuoy,
  ShieldCheck,
  LogOut,
  Moon,
  Building2,
  type LucideIcon,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useAuth } from '@/auth/AuthContext';
import { useCompany } from '@/data/company';
import { currencySymbol } from '@/data/format';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { ConnectionBadge } from '@/components/ConnectionBadge';
import { currentUser } from '@/data/mock';

function SectionLabel({ children }: { children: string }) {
  return (
    <Text variant="caption" tone="subtle" weight="semibold" style={{ letterSpacing: 0.6, marginLeft: 4, marginBottom: -6 }}>
      {children.toUpperCase()}
    </Text>
  );
}

function Row({
  icon: Icon,
  label,
  right,
  onPress,
  first,
  danger,
}: {
  icon: LucideIcon;
  label: string;
  right?: React.ReactNode;
  onPress?: () => void;
  first?: boolean;
  danger?: boolean;
}) {
  const t = useTheme();
  const color = danger ? t.colors.danger : t.colors.accent;
  const tint = danger ? t.colors.dangerSoft : t.colors.accentSoft;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 13,
        paddingHorizontal: t.spacing.xl,
        paddingVertical: 14,
        borderTopWidth: first ? 0 : 1,
        borderTopColor: t.colors.divider,
        backgroundColor: pressed ? t.colors.surfaceAlt : 'transparent',
      })}
    >
      <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={18} color={color} strokeWidth={2.2} />
      </View>
      <Text variant="bodySm" weight="medium" tone={danger ? 'danger' : 'default'} style={{ flex: 1 }}>
        {label}
      </Text>
      {right ?? <ChevronRight size={18} color={t.colors.textSubtle} strokeWidth={2.2} />}
    </Pressable>
  );
}

export default function Settings() {
  const t = useTheme();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const { company, name: companyName } = useCompany();
  const [notif, setNotif] = useState(true);
  const [biometric, setBiometric] = useState(false);

  const profile = {
    name: user?.name ?? currentUser.name,
    email: user?.email ?? currentUser.email,
    role: user?.role ?? currentUser.role,
    initials: user?.initials ?? currentUser.initials,
  };

  const switchTrack = { false: t.colors.borderStrong, true: t.colors.accent };

  return (
    <Screen>
      <Header title="Settings" showBell={false} />

      {/* Profile */}
      <Card elevation={2} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar initials={profile.initials} size={56} />
        <View style={{ flex: 1, gap: 5 }}>
          <Text variant="h3" weight="bold" numberOfLines={1}>
            {profile.name}
          </Text>
          <Text variant="caption" tone="muted" numberOfLines={1}>
            {profile.email}
          </Text>
          <Badge label={profile.role} intent="accent" />
        </View>
      </Card>

      {/* Company */}
      <Pressable onPress={() => router.push('/(app)/company')} accessibilityRole="button" nativeID="open-company">
        <Card elevation={1} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ gap: 4, flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text variant="caption" tone="subtle" weight="medium" style={{ letterSpacing: 0.4 }}>
                COMPANY
              </Text>
              <ConnectionBadge />
            </View>
            <Text variant="body" weight="bold" numberOfLines={1}>
              {companyName}
            </Text>
            {company && (
              <Text variant="caption" tone="subtle" numberOfLines={1}>
                {company.industry} · {company.seats} seats · {company.plan} plan
              </Text>
            )}
          </View>
          <View style={{ alignItems: 'center', backgroundColor: t.colors.accentSoft, borderRadius: t.radius.md, paddingHorizontal: 12, paddingVertical: 8 }}>
            <Text variant="caption" tone="subtle" weight="medium">
              Currency
            </Text>
            <Text variant="body" weight="bold" mono tone="accent">
              {currencySymbol()}
            </Text>
          </View>
        </Card>
      </Pressable>

      <SectionLabel>Preferences</SectionLabel>
      <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
        <Row
          first
          icon={Moon}
          label="Dark appearance"
          right={<Switch value={t.mode === 'dark'} onValueChange={t.toggleMode} trackColor={switchTrack} thumbColor="#FFFFFF" />}
        />
        <Row
          icon={Bell}
          label="Push notifications"
          right={<Switch value={notif} onValueChange={setNotif} trackColor={switchTrack} thumbColor="#FFFFFF" />}
        />
        <Row
          icon={Fingerprint}
          label="Biometric login"
          right={<Switch value={biometric} onValueChange={setBiometric} trackColor={switchTrack} thumbColor="#FFFFFF" />}
        />
      </Card>

      <SectionLabel>Company</SectionLabel>
      <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
        <Row first icon={Building2} label="Company profile" onPress={() => router.push('/(app)/company')} />
        <Row icon={CreditCard} label="Billing & plan" onPress={() => router.push('/(app)/billing')} />
        <Row icon={Users2} label="Team members" />
        <Row icon={Blocks} label="Integrations" />
      </Card>

      <SectionLabel>Support</SectionLabel>
      <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
        <Row first icon={LifeBuoy} label="Help center" />
        <Row icon={ShieldCheck} label="Privacy & security" />
      </Card>

      <View style={{ marginTop: 8 }}>
        <Button label="Sign out" variant="danger" icon={LogOut} onPress={signOut} />
      </View>

      <Text variant="caption" tone="subtle" center style={{ marginTop: 4 }}>
        Vantage · v1.0.0 (prototype)
      </Text>
    </Screen>
  );
}
