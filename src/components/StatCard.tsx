import React from 'react';
import { View } from 'react-native';
import { TrendingUp, TrendingDown } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from './Text';
import { Card } from './Card';
import { Sparkline } from './charts/Sparkline';
import { AnimatedNumber } from './AnimatedNumber';
import { Kpi } from '@/data/mock';
import { formatPercent } from '@/data/format';

export function StatCard({ kpi }: { kpi: Kpi & { delta: number | null } }) {
  const t = useTheme();
  const up = (kpi.delta ?? 0) >= 0;
  const accentColor =
    kpi.intent === 'accent'
      ? t.colors.accent
      : kpi.intent === 'success'
      ? t.colors.success
      : kpi.intent === 'warning'
      ? t.colors.warning
      : t.colors.danger;
  const deltaColor = up ? t.colors.success : t.colors.danger;
  const Trend = up ? TrendingUp : TrendingDown;

  // Only show a delta badge / sparkline when there's real month-over-month history.
  const hasDelta = typeof kpi.delta === 'number';
  const hasSpark = Array.isArray(kpi.spark) && kpi.spark.length > 1 && kpi.spark.some((v) => v > 0);

  return (
    <Card elevation={1} style={{ flex: 1, gap: t.spacing.md, minWidth: 150 }}>
      <Text variant="caption" tone="subtle" weight="medium" style={{ letterSpacing: 0.4 }}>
        {kpi.label.toUpperCase()}
      </Text>
      <AnimatedNumber value={kpi.value} compact size={22} weight="bold" />
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', minHeight: 30 }}>
        {hasDelta ? (
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 3,
              backgroundColor: up ? t.colors.successSoft : t.colors.dangerSoft,
              paddingHorizontal: 7,
              paddingVertical: 3,
              borderRadius: t.radius.full,
            }}
          >
            <Trend size={12} color={deltaColor} strokeWidth={2.5} />
            <Text variant="micro" weight="bold" style={{ color: deltaColor }} mono>
              {formatPercent(kpi.delta as number)}
            </Text>
          </View>
        ) : (
          <View />
        )}
        {hasSpark && <Sparkline data={kpi.spark} color={accentColor} width={78} height={30} />}
      </View>
    </Card>
  );
}
