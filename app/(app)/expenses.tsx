import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { DonutChart, DonutLegend } from '@/components/charts/DonutChart';
import { Reveal, PressableScale } from '@/components/motion';
import { Fab } from '@/components/Fab';
import { AddExpenseSheet } from '@/components/sheets';
import { useStore } from '@/data/store';
import { formatCurrency, relativeDate } from '@/data/format';

export default function Expenses() {
  const t = useTheme();
  const router = useRouter();
  const { expenses, removeExpense } = useStore();
  const [addOpen, setAddOpen] = useState(false);

  const total = expenses.reduce((s, e) => s + e.value, 0);

  // Group records by category for the donut.
  const grouped = useMemo(() => {
    const m = new Map<string, { label: string; value: number; color: string }>();
    for (const e of expenses) {
      const cur = m.get(e.label);
      if (cur) cur.value += e.value;
      else m.set(e.label, { label: e.label, value: e.value, color: e.color });
    }
    return [...m.values()].sort((a, b) => b.value - a.value);
  }, [expenses]);

  let idx = 0;

  return (
    <View style={{ flex: 1 }}>
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
                Manage all spending
              </Text>
              <Text variant="h1" weight="bold" style={{ letterSpacing: -0.5 }}>
                Expenses
              </Text>
            </View>
          </View>
        </Reveal>

        {/* Total + breakdown */}
        <Reveal index={idx++}>
          <Card elevation={2} style={{ gap: 18 }}>
            <View style={{ gap: 4 }}>
              <Text variant="caption" tone="subtle" weight="medium" style={{ letterSpacing: 0.4 }}>
                TOTAL EXPENSES
              </Text>
              <AnimatedNumber value={total} compact size={30} weight="bold" color={t.colors.warning} />
              <Text variant="caption" tone="subtle">
                {expenses.length} records · {grouped.length} categories
              </Text>
            </View>
            {grouped.length > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
                <DonutChart data={grouped} centerValue={formatCurrency(total, { compact: true })} centerLabel="Total" />
                <DonutLegend data={grouped} />
              </View>
            )}
          </Card>
        </Reveal>

        {/* All records */}
        <Reveal index={idx++}>
          <Text variant="h3" weight="bold">
            All expenses
          </Text>
        </Reveal>

        <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
          {expenses.length === 0 ? (
            <View style={{ padding: 32, alignItems: 'center', gap: 6 }}>
              <Text variant="body" weight="semibold">
                No expenses yet
              </Text>
              <Text variant="bodySm" tone="subtle" center>
                Tap “Add expense” to record your first one.
              </Text>
            </View>
          ) : (
            expenses.map((e, i) => (
              <View
                key={e.id ?? `${e.label}-${i}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  paddingHorizontal: t.spacing.xl,
                  paddingVertical: 13,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: t.colors.divider,
                }}
              >
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: t.colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <View style={{ width: 12, height: 12, borderRadius: 4, backgroundColor: e.color }} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="bodySm" weight="semibold" numberOfLines={1}>
                    {e.label}
                  </Text>
                  <Text variant="caption" tone="subtle" numberOfLines={1}>
                    {[e.note, e.date ? relativeDate(e.date) : null].filter(Boolean).join(' · ') || 'Expense'}
                  </Text>
                </View>
                <Text variant="bodySm" weight="bold" mono tone="warning">
                  {formatCurrency(e.value, { compact: true })}
                </Text>
                <PressableScale
                  onPress={() => e.id && removeExpense(e.id)}
                  scaleTo={0.85}
                  accessibilityLabel={`Delete ${e.label}`}
                  style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: t.colors.dangerSoft, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Trash2 size={16} color={t.colors.danger} strokeWidth={2.2} />
                </PressableScale>
              </View>
            ))
          )}
        </Card>
      </Screen>

      <Fab icon={Plus} label="Add expense" onPress={() => setAddOpen(true)} />
      <AddExpenseSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}
