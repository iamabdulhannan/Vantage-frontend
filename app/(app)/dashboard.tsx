import React, { useState, useEffect, useCallback } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { FileText, ArrowDownLeft, Flame, Hourglass, Users2, ArrowRight, Plus } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { StatCard } from '@/components/StatCard';
import { Segmented } from '@/components/Segmented';
import { AreaChart } from '@/components/charts/AreaChart';
import { DonutChart, DonutLegend } from '@/components/charts/DonutChart';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Reveal, PressableScale, ProgressBar } from '@/components/motion';
import { ConnectionBadge } from '@/components/ConnectionBadge';
import { AddExpenseSheet } from '@/components/sheets';
import { useStore } from '@/data/store';
import { useAuth } from '@/auth/AuthContext';
import { useCompany } from '@/data/company';
import { api, isApiEnabled } from '@/api/client';
import { kpis, currentUser, computePayroll } from '@/data/mock';
import { formatCurrency, relativeDate } from '@/data/format';

// 12 zero months with real labels — shown until the live aggregate arrives.
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const EMPTY_SERIES = Array.from({ length: 12 }, (_, i) => {
  const d = new Date();
  d.setMonth(d.getMonth() - (11 - i));
  return { label: MONTH_LABELS[d.getMonth()], revenue: 0, expense: 0 };
});

function MiniMetric({ icon: Icon, label, value, tint }: any) {
  const t = useTheme();
  return (
    <Card elevation={1} style={{ flex: 1, gap: 10 }}>
      <View style={{ width: 32, height: 32, borderRadius: 10, backgroundColor: tint, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={16} color={t.colors.text} strokeWidth={2.2} />
      </View>
      <Text variant="caption" tone="subtle" weight="medium">
        {label}
      </Text>
      <Text variant="h3" weight="bold" mono>
        {value}
      </Text>
    </Card>
  );
}

export default function Dashboard() {
  const t = useTheme();
  const router = useRouter();
  const [period, setPeriod] = useState('12M');
  const [expenseOpen, setExpenseOpen] = useState(false);
  const { expenses, employees, activity, receipts, refresh } = useStore();
  const { user, token } = useAuth();
  const { company, name: companyName, fiscalYear } = useCompany();
  const greetName = (user?.name ?? currentUser.name).split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const initials = user?.initials ?? currentUser.initials;
  const pay = computePayroll(employees, company?.country, company?.currencyCode);

  // Pull the fully-aggregated dashboard from the API when signed in live;
  // refetch after mutations. Falls back to local computation when offline.
  const [agg, setAgg] = useState<any | null>(null);
  const loadAgg = useCallback(() => {
    if (!token || !isApiEnabled()) {
      setAgg(null);
      return;
    }
    api.dashboard
      .get()
      .then(setAgg)
      .catch(() => {});
  }, [token]);

  // Refetch the aggregate after local mutations…
  useEffect(() => {
    loadAgg();
  }, [loadAgg, receipts, expenses.length, employees.length]);

  // …and pull fresh data from the DB every time the dashboard regains focus.
  useFocusEffect(
    useCallback(() => {
      refresh();
      loadAgg();
    }, [refresh, loadAgg]),
  );

  // Real values only: before the aggregate arrives (or if it fails) we show
  // store-derived figures — never the demo numbers from mock.ts. kpis[] is
  // used purely for labels/intents; mock deltas and sparklines are always
  // stripped so fabricated growth can never render.
  const localExpense = expenses.reduce((s, d) => s + d.value, 0);
  const revenue = agg ? agg.kpis.revenue : receipts;
  const capital = agg ? agg.kpis.capital : company?.capital ?? 0;
  const totalExpense = agg ? agg.kpis.expenses : localExpense;
  const profit = agg ? agg.kpis.profit : revenue - totalExpense;
  const tr = agg?.trends;
  const liveKpis = [
    { ...kpis[0], value: revenue, delta: tr?.revenue?.delta ?? null, spark: tr?.revenue?.spark ?? [] },
    { ...kpis[1], value: capital, delta: tr?.capital?.delta ?? null, spark: tr?.capital?.spark ?? [] },
    { ...kpis[2], value: totalExpense, delta: tr?.expenses?.delta ?? null, spark: tr?.expenses?.spark ?? [] },
    { ...kpis[3], value: profit, delta: tr?.profit?.delta ?? null, spark: tr?.profit?.spark ?? [] },
  ];

  // CEO metrics
  const monthlyBurn = agg ? agg.cash.monthlyBurn : Math.round(localExpense / 12);
  const runwayMonths = agg
    ? String(agg.cash.runwayMonths ?? '∞')
    : monthlyBurn > 0
    ? (capital / monthlyBurn).toFixed(1)
    : '∞';

  // Charts/activity prefer live data, fall back to the local store.
  const donutData = agg && agg.expenseBreakdown?.length ? agg.expenseBreakdown : expenses;
  const activityList = agg && agg.activity?.length ? agg.activity : activity;
  const chartSeries = agg?.series?.length ? agg.series : EMPTY_SERIES;

  let idx = 0;

  return (
    <Screen>
      <Reveal index={idx++}>
        <Header
          title="Overview"
          subtitle={`${greeting}, ${greetName}`}
          initials={initials}
          onBell={() => router.push('/(app)/notifications')}
          unread={activityList.length > 0}
        />
      </Reveal>

      <Reveal index={idx++}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text variant="bodySm" tone="muted" weight="medium">
            {companyName} · {fiscalYear}
          </Text>
          <ConnectionBadge />
        </View>
      </Reveal>

      {/* KPI grid */}
      <View style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Reveal index={idx++} style={{ flex: 1 }}>
            <StatCard kpi={liveKpis[0]} />
          </Reveal>
          <Reveal index={idx++} style={{ flex: 1 }}>
            <StatCard kpi={liveKpis[1]} />
          </Reveal>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <Reveal index={idx++} style={{ flex: 1 }}>
            <StatCard kpi={liveKpis[2]} />
          </Reveal>
          <Reveal index={idx++} style={{ flex: 1 }}>
            <StatCard kpi={liveKpis[3]} />
          </Reveal>
        </View>
      </View>

      {/* CEO mini metrics */}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Reveal index={idx++} style={{ flex: 1 }}>
          <MiniMetric icon={Flame} label="Monthly burn" value={formatCurrency(monthlyBurn, { compact: true })} tint={t.colors.warningSoft} />
        </Reveal>
        <Reveal index={idx++} style={{ flex: 1 }}>
          <MiniMetric icon={Hourglass} label="Cash runway" value={`${runwayMonths} mo`} tint={t.colors.accentSoft} />
        </Reveal>
      </View>

      {/* Revenue vs Expense */}
      <Reveal index={idx++}>
        <Card elevation={1} style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: 2 }}>
              <Text variant="h3" weight="bold">
                Revenue vs Expenses
              </Text>
              <Text variant="caption" tone="subtle">
                Monthly · thousands
              </Text>
            </View>
            <View style={{ width: 132 }}>
              <Segmented options={['3M', '6M', '12M']} value={period} onChange={setPeriod} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: t.colors.accent }} />
              <Text variant="caption" tone="muted" weight="medium">
                Revenue
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 14, height: 3, borderRadius: 2, backgroundColor: t.colors.textSubtle }} />
              <Text variant="caption" tone="muted" weight="medium">
                Expenses
              </Text>
            </View>
          </View>

          <AreaChart data={period === '3M' ? chartSeries.slice(-3) : period === '6M' ? chartSeries.slice(-6) : chartSeries} />
        </Card>
      </Reveal>

      {/* Live payroll */}
      <Reveal index={idx++}>
        <PressableScale onPress={() => router.push('/(app)/payroll')}>
          <Card elevation={2} style={{ gap: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 38, height: 38, borderRadius: 12, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Users2 size={19} color={t.colors.accent} strokeWidth={2.2} />
                </View>
                <View>
                  <Text variant="h3" weight="bold">
                    Live Payroll
                  </Text>
                  <Text variant="caption" tone="subtle">
                    {pay.headcount} employees · pays {relativeDate(pay.nextPayday)}
                  </Text>
                </View>
              </View>
              <ArrowRight size={20} color={t.colors.textSubtle} strokeWidth={2.2} />
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 12 }}>
              <View style={{ flex: 1, minWidth: 0 }}>
                <Text variant="caption" tone="subtle" weight="medium" style={{ letterSpacing: 0.4 }}>
                  NET THIS MONTH
                </Text>
                <AnimatedNumber value={pay.net} compact size={26} weight="bold" />
              </View>
              <View style={{ alignItems: 'flex-end', flexShrink: 0 }}>
                <Text variant="caption" tone="subtle">
                  {pay.pendingCount} pending
                </Text>
                <Text variant="bodySm" weight="bold" mono tone="warning">
                  {formatCurrency(pay.pendingAmount, { compact: true })}
                </Text>
              </View>
            </View>

            <View style={{ gap: 6 }}>
              <ProgressBar progress={pay.paidRatio} color={t.colors.success} track={t.colors.surfaceAlt} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="micro" tone="success" weight="semibold">
                  {Math.round(pay.paidRatio * 100)}% disbursed
                </Text>
                <Text variant="micro" tone="subtle">
                  {formatCurrency(pay.gross, { compact: true })} gross
                </Text>
              </View>
            </View>
          </Card>
        </PressableScale>
      </Reveal>

      {/* Expense breakdown */}
      <Reveal index={idx++}>
        <Card elevation={1} style={{ gap: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Pressable onPress={() => router.push('/(app)/expenses')} hitSlop={6} style={{ gap: 2, flex: 1 }} accessibilityRole="button">
              <Text variant="h3" weight="bold">
                Expense Breakdown
              </Text>
              <Text variant="caption" tone="accent" weight="semibold">
                Manage all expenses →
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setExpenseOpen(true)}
              nativeID="open-expense"
              accessibilityLabel="Add expense"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 5,
                backgroundColor: t.colors.accentSoft,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: t.radius.full,
              }}
            >
              <Plus size={15} color={t.colors.accent} strokeWidth={2.6} />
              <Text variant="caption" weight="bold" tone="accent">
                Add
              </Text>
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
            <DonutChart data={donutData} centerValue={formatCurrency(totalExpense, { compact: true })} centerLabel="Total" />
            <DonutLegend data={donutData} />
          </View>
        </Card>
      </Reveal>

      {/* Recent activity */}
      <Reveal index={idx++}>
        <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
          <View style={{ padding: t.spacing.xl, paddingBottom: t.spacing.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text variant="h3" weight="bold">
              Recent Activity
            </Text>
            <Pressable onPress={() => router.push('/(app)/ledgers')} hitSlop={8} accessibilityRole="button">
              <Text variant="bodySm" weight="semibold" tone="accent">
                View all
              </Text>
            </Pressable>
          </View>
          {activityList.slice(0, 6).map((a: any) => {
            const isPayment = a.type === 'payment';
            const Icon = isPayment ? ArrowDownLeft : FileText;
            return (
              <View
                key={a.id}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: t.spacing.xl,
                  paddingVertical: 13,
                  borderTopWidth: 1,
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
      </Reveal>

      <AddExpenseSheet visible={expenseOpen} onClose={() => setExpenseOpen(false)} />
    </Screen>
  );
}
