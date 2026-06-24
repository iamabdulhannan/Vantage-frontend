import React, { useCallback, useEffect, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { ArrowLeft, ArrowDownLeft, FileText, BellOff } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Reveal } from '@/components/motion';
import { useStore } from '@/data/store';
import { api, isApiEnabled, getToken } from '@/api/client';
import { formatCurrency, relativeDate } from '@/data/format';

export default function Notifications() {
  const t = useTheme();
  const router = useRouter();
  const { activity } = useStore();
  const [items, setItems] = useState<any[]>(activity);

  const load = useCallback(() => {
    if (isApiEnabled() && getToken()) {
      api.dashboard
        .get()
        .then((d: any) => setItems(d.activity?.length ? d.activity : activity))
        .catch(() => setItems(activity));
    } else {
      setItems(activity);
    }
  }, [activity]);

  useEffect(() => load(), [load]);
  useFocusEffect(useCallback(() => load(), [load]));

  let idx = 0;

  return (
    <Screen>
      <Reveal index={idx++}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityLabel="Back"
            style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, alignItems: 'center', justifyContent: 'center' }}
          >
            <ArrowLeft size={20} color={t.colors.text} strokeWidth={2.2} />
          </Pressable>
          <View style={{ flex: 1 }}>
            <Text variant="bodySm" tone="muted" weight="medium">
              Activity
            </Text>
            <Text variant="h1" weight="bold" style={{ letterSpacing: -0.5 }}>
              Notifications
            </Text>
          </View>
        </View>
      </Reveal>

      {items.length === 0 ? (
        <Reveal index={idx++}>
          <Card elevation={1} style={{ alignItems: 'center', gap: 12, paddingVertical: 36 }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <BellOff size={24} color={t.colors.textSubtle} strokeWidth={2.2} />
            </View>
            <Text variant="h3" weight="bold" center>
              You’re all caught up
            </Text>
            <Text variant="bodySm" tone="muted" center>
              Payments, expenses and payroll events will show up here as they happen.
            </Text>
          </Card>
        </Reveal>
      ) : (
        <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
          {items.map((a: any, i: number) => {
            const isPayment = a.type === 'payment';
            const Icon = isPayment ? ArrowDownLeft : FileText;
            return (
              <View
                key={a.id ?? i}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: t.spacing.xl,
                  paddingVertical: 14,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: t.colors.divider,
                }}
              >
                <View
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    backgroundColor: isPayment ? t.colors.successSoft : t.colors.accentSoft,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon size={18} color={isPayment ? t.colors.success : t.colors.accent} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text variant="bodySm" weight="semibold" numberOfLines={1}>
                    {a.who}
                  </Text>
                  <Text variant="caption" tone="subtle" numberOfLines={1}>
                    {a.what} · {relativeDate(a.when)}
                  </Text>
                </View>
                <Text variant="bodySm" weight="bold" mono tone={isPayment ? 'success' : 'default'}>
                  {isPayment ? '+' : ''}
                  {formatCurrency(a.amount, { compact: true })}
                </Text>
              </View>
            );
          })}
        </Card>
      )}
    </Screen>
  );
}
