import React from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Minus, Plus, CreditCard, CalendarClock, Check, Building2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useCompany } from '@/data/company';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Reveal, PressableScale } from '@/components/motion';
import { PLANS, ANNUAL_DISCOUNT } from '@/data/currencies';
import { computeBilling, nextRenewal } from '@/data/billing';
import { formatUSD, formatDate } from '@/data/format';

function BackHeader({ onBack, title, subtitle }: { onBack: () => void; title: string; subtitle?: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Pressable
        onPress={onBack}
        hitSlop={10}
        accessibilityLabel="Back"
        style={{ width: 42, height: 42, borderRadius: 14, backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, alignItems: 'center', justifyContent: 'center' }}
      >
        <ArrowLeft size={20} color={t.colors.text} strokeWidth={2.2} />
      </Pressable>
      <View style={{ flex: 1 }}>
        {subtitle && (
          <Text variant="bodySm" tone="muted" weight="medium">
            {subtitle}
          </Text>
        )}
        <Text variant="h1" weight="bold" style={{ letterSpacing: -0.5 }}>
          {title}
        </Text>
      </View>
    </View>
  );
}

export default function Billing() {
  const t = useTheme();
  const router = useRouter();
  const { company, updateBilling } = useCompany();

  if (!company) {
    return (
      <Screen>
        <BackHeader onBack={() => router.back()} title="Billing" />
        <Card elevation={1} style={{ gap: 14, alignItems: 'center', paddingVertical: 28 }}>
          <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
            <Building2 size={26} color={t.colors.accent} strokeWidth={2.2} />
          </View>
          <Text variant="h3" weight="bold" center>
            No subscription yet
          </Text>
          <Text variant="bodySm" tone="muted" center>
            Set up your company to choose a plan and start billing.
          </Text>
          <Button label="Set up company" onPress={() => router.push('/setup')} fullWidth={false} />
        </Card>
      </Screen>
    );
  }

  const bill = computeBilling(company.plan, company.seats, company.billingCycle);
  const selectedPlan = PLANS.find((p) => p.key === company.plan) ?? PLANS[0];
  const renew = nextRenewal(new Date(company.billingSince), company.billingCycle);

  return (
    <Screen>
      <Reveal index={0}>
        <BackHeader onBack={() => router.back()} title="Billing" subtitle={company.name} />
      </Reveal>

      {/* Current charge */}
      <Reveal index={1}>
        <Card elevation={2} style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: 4 }}>
              <Text variant="caption" tone="subtle" weight="medium" style={{ letterSpacing: 0.4 }}>
                {company.billingCycle === 'annual' ? 'BILLED YEARLY' : 'BILLED MONTHLY'}
              </Text>
              <Text variant="display" weight="bold" mono tone="accent">
                {formatUSD(bill.dueNow)}
              </Text>
              <Text variant="caption" tone="subtle">
                ≈ {formatUSD(Math.round(bill.effectiveMonthly))}/mo · {bill.seats} {bill.seats === 1 ? 'seat' : 'seats'} on {selectedPlan.name}
              </Text>
            </View>
            <View style={{ backgroundColor: t.colors.accentSoft, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 }}>
              <Text variant="micro" weight="bold" tone="accent">
                {selectedPlan.name.toUpperCase()}
              </Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 12 }}>
            <CalendarClock size={16} color={t.colors.textMuted} strokeWidth={2.2} />
            <Text variant="bodySm" tone="muted" weight="medium" style={{ flex: 1 }}>
              Next invoice
            </Text>
            <Text variant="bodySm" weight="bold" mono>
              {formatUSD(bill.dueNow)} · {formatDate(renew.toISOString())}
            </Text>
          </View>
        </Card>
      </Reveal>

      {/* Billing cycle */}
      <Reveal index={2}>
        <View style={{ gap: 8 }}>
          <Text variant="bodySm" weight="medium" tone="muted">
            Billing cycle
          </Text>
          <View style={{ flexDirection: 'row', backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 4, gap: 4 }}>
            {(['monthly', 'annual'] as const).map((c) => {
              const active = company.billingCycle === c;
              return (
                <PressableScale
                  key={c}
                  onPress={() => updateBilling({ billingCycle: c })}
                  scaleTo={0.98}
                  style={{ flex: 1, paddingVertical: 11, borderRadius: t.radius.sm, alignItems: 'center', backgroundColor: active ? t.colors.surface : 'transparent', ...(active ? t.shadow(1) : {}) }}
                >
                  <Text variant="bodySm" weight="semibold" tone={active ? 'accent' : 'subtle'}>
                    {c === 'monthly' ? 'Monthly' : `Annual · save ${Math.round(ANNUAL_DISCOUNT * 100)}%`}
                  </Text>
                </PressableScale>
              );
            })}
          </View>
        </View>
      </Reveal>

      {/* Seats */}
      <Reveal index={3}>
        <View style={{ gap: 8 }}>
          <Text variant="bodySm" weight="medium" tone="muted">
            Paid seats · min {selectedPlan.minSeats} on {selectedPlan.name}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: t.colors.surface, borderWidth: 1, borderColor: t.colors.border, borderRadius: t.radius.lg, padding: 10 }}>
            <PressableScale onPress={() => updateBilling({ seats: Math.max(selectedPlan.minSeats, company.seats - 1) })} scaleTo={0.9} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <Minus size={20} color={t.colors.text} strokeWidth={2.6} />
            </PressableScale>
            <View style={{ alignItems: 'center' }}>
              <Text variant="h1" weight="bold" mono>
                {bill.seats}
              </Text>
              <Text variant="micro" tone="subtle">
                × {formatUSD(company.billingCycle === 'annual' ? bill.annualPerSeat : bill.monthlyPerSeat)}
                {company.billingCycle === 'annual' ? '/yr' : '/mo'}
              </Text>
            </View>
            <PressableScale onPress={() => updateBilling({ seats: Math.min(500, bill.seats + 1) })} scaleTo={0.9} style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: t.colors.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} color="#FFFFFF" strokeWidth={2.6} />
            </PressableScale>
          </View>
        </View>
      </Reveal>

      {/* Plans */}
      <Reveal index={4}>
        <View style={{ gap: 10 }}>
          <Text variant="bodySm" weight="medium" tone="muted">
            Plan
          </Text>
          {PLANS.map((p) => {
            const active = p.key === company.plan;
            return (
              <PressableScale
                key={p.key}
                onPress={() => updateBilling({ plan: p.key, seats: Math.max(company.seats, p.minSeats) })}
                scaleTo={0.98}
                style={{
                  gap: 12,
                  padding: 16,
                  borderRadius: t.radius.lg,
                  backgroundColor: t.colors.surface,
                  borderWidth: 1.5,
                  borderColor: active ? t.colors.accent : t.colors.border,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: active ? t.colors.accent : t.colors.borderStrong, alignItems: 'center', justifyContent: 'center' }}>
                    {active && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: t.colors.accent }} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text variant="body" weight="bold">
                      {p.name}
                    </Text>
                    <Text variant="caption" tone="subtle">
                      {p.blurb}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text variant="bodySm" weight="bold" mono>
                      {formatUSD(p.pricePerSeat)}
                    </Text>
                    <Text variant="micro" tone="subtle">
                      /seat/mo
                    </Text>
                  </View>
                </View>
                {active && (
                  <View style={{ gap: 6, paddingLeft: 34 }}>
                    {p.features.map((f) => (
                      <View key={f} style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                        <Check size={14} color={t.colors.success} strokeWidth={2.8} />
                        <Text variant="caption" tone="muted">
                          {f}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </PressableScale>
            );
          })}
        </View>
      </Reveal>

      {/* Payment method */}
      <Reveal index={5}>
        <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: t.spacing.xl }}>
            <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={18} color={t.colors.accent} strokeWidth={2.2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text variant="bodySm" weight="semibold">
                Payment method
              </Text>
              <Text variant="caption" tone="subtle">
                Add a card to start your subscription
              </Text>
            </View>
            <Text variant="bodySm" weight="semibold" tone="accent">
              Add
            </Text>
          </View>
        </Card>
      </Reveal>

      <Reveal index={6}>
        <Text variant="caption" tone="subtle" center>
          Billed in USD. Taxes calculated at checkout. Cancel anytime.
        </Text>
      </Reveal>
    </Screen>
  );
}
