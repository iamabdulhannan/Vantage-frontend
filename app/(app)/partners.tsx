import React, { useState } from 'react';
import { View } from 'react-native';
import { TrendingUp, TrendingDown, MapPin, UserPlus } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Fab } from '@/components/Fab';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Reveal } from '@/components/motion';
import { AddPartnerSheet } from '@/components/sheets';
import { useStore } from '@/data/store';
import { Partner } from '@/data/mock';
import { formatCurrency, formatPercent } from '@/data/format';

const SHARE_COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#06B6D4', '#22D3EE'];

const STATUS: Record<Partner['status'], { intent: 'success' | 'warning' | 'neutral'; label: string }> = {
  active: { intent: 'success', label: 'Active' },
  review: { intent: 'warning', label: 'In review' },
  paused: { intent: 'neutral', label: 'Paused' },
};

export default function Partners() {
  const t = useTheme();
  const { partners } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const totalRevenue = partners.reduce((s, p) => s + p.revenue, 0);
  const totalShare = partners.reduce((s, p) => s + p.share, 0);
  const activeCount = partners.filter((p) => p.status === 'active').length;

  return (
    <View style={{ flex: 1 }}>
    <Screen>
      <Reveal index={0}>
        <Header title="Partners" subtitle="Revenue & equity share" showBell={false} />
      </Reveal>

      {/* Distribution summary */}
      <Reveal index={1}>
        <Card elevation={2} style={{ gap: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: 4 }}>
              <Text variant="caption" tone="subtle" weight="medium" style={{ letterSpacing: 0.4 }}>
                PARTNER REVENUE · FY 2026
              </Text>
              <AnimatedNumber value={totalRevenue} compact size={28} weight="bold" />
            </View>
            <Badge label={`${activeCount} active`} intent="success" dot />
          </View>

          {/* Stacked share bar */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
              {partners.map((p, i) => (
                <View key={p.id} style={{ flex: p.share, backgroundColor: SHARE_COLORS[i % SHARE_COLORS.length] }} />
              ))}
            </View>
            <Text variant="caption" tone="subtle">
              {totalShare}% of revenue distributed across {partners.length} partners
            </Text>
          </View>
        </Card>
      </Reveal>

      {/* Partner list */}
      <View style={{ gap: 12 }}>
        {partners.map((p, i) => {
          const up = p.delta >= 0;
          const Trend = up ? TrendingUp : TrendingDown;
          const color = SHARE_COLORS[i % SHARE_COLORS.length];
          const status = STATUS[p.status];
          return (
            <Reveal key={p.id} index={2 + i}>
            <Card elevation={1} style={{ gap: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 14,
                    backgroundColor: color,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text weight="bold" mono style={{ color: '#FFFFFF', fontSize: 16 }}>
                    {p.share}%
                  </Text>
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text variant="body" weight="semibold" numberOfLines={1}>
                    {p.name}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} color={t.colors.textSubtle} strokeWidth={2.2} />
                    <Text variant="caption" tone="subtle" numberOfLines={1}>
                      {[p.region, p.contact, p.phone].filter(Boolean).join(' · ')}
                    </Text>
                  </View>
                </View>
                <Badge label={status.label} intent={status.intent} dot />
              </View>

              <View style={{ height: 1, backgroundColor: t.colors.divider }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ gap: 2 }}>
                  <Text variant="caption" tone="subtle" weight="medium">
                    Revenue contribution
                  </Text>
                  <Text variant="h3" weight="bold" mono>
                    {formatCurrency(p.revenue, { compact: true })}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    backgroundColor: up ? t.colors.successSoft : t.colors.dangerSoft,
                    paddingHorizontal: 9,
                    paddingVertical: 5,
                    borderRadius: 999,
                  }}
                >
                  <Trend size={13} color={up ? t.colors.success : t.colors.danger} strokeWidth={2.5} />
                  <Text variant="caption" weight="bold" mono style={{ color: up ? t.colors.success : t.colors.danger }}>
                    {formatPercent(p.delta)}
                  </Text>
                </View>
              </View>
            </Card>
            </Reveal>
          );
        })}
      </View>
    </Screen>
    <Fab icon={UserPlus} label="Add partner" onPress={() => setAddOpen(true)} />
    <AddPartnerSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}
