import React, { useState } from 'react';
import { View } from 'react-native';
import { TrendingUp, TrendingDown, MapPin, UserPlus } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Reveal, PressableScale } from '@/components/motion';
import { AddPartnerSheet, EditPartnerSheet } from '@/components/sheets';
import { useStore } from '@/data/store';
import { registerQuickAdd } from '@/utils/quickAdd';
import { useRefreshOnFocus } from '@/data/useRefreshOnFocus';
import { Partner } from '@/data/mock';
import { formatCurrency, formatPercent } from '@/data/format';

const SHARE_COLORS = ['#16A34A', '#0E7490', '#C2760A', '#15803D', '#0891B2'];

const STATUS: Record<Partner['status'], { intent: 'success' | 'warning' | 'neutral'; label: string }> = {
  active: { intent: 'success', label: 'Active' },
  review: { intent: 'warning', label: 'In review' },
  paused: { intent: 'neutral', label: 'Paused' },
};

export default function Partners() {
  const t = useTheme();
  const { partners } = useStore();
  useRefreshOnFocus();
  const [addOpen, setAddOpen] = useState(false);
  const [editPartner, setEditPartner] = useState<Partner | null>(null);

  // Center + on this tab adds a partner.
  React.useEffect(() => registerQuickAdd('partners', () => setAddOpen(true)), []);
  const totalRevenue = partners.reduce((s, p) => s + p.revenue, 0);
  const totalShare = partners.reduce((s, p) => s + p.share, 0);
  const activeCount = partners.filter((p) => p.status === 'active').length;
  // Professional split math: a partner's payout is their agreed share % applied
  // to the revenue they contribute. Company keeps the remainder.
  const earningsOf = (p: Partner) => Math.round((p.revenue * p.share) / 100);
  const totalPayout = partners.reduce((s, p) => s + earningsOf(p), 0);
  const companyKeeps = totalRevenue - totalPayout;
  const overAllocated = totalShare > 100;

  return (
    <View style={{ flex: 1 }}>
    <Screen>
      <Reveal index={0}>
        <Header title="Partners" subtitle="Revenue & equity share" showBell={false} />
      </Reveal>

      {/* Distribution summary */}
      <Reveal index={1}>
        <Card elevation={2} style={{ gap: 18 }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
            <View style={{ gap: 4, flex: 1, minWidth: 0 }}>
              <Text variant="caption" tone="subtle" weight="medium" style={{ letterSpacing: 0.4 }}>
                PARTNER REVENUE · FY 2026
              </Text>
              <AnimatedNumber value={totalRevenue} compact size={28} weight="bold" />
            </View>
            <View style={{ flexShrink: 0 }}>
              <Badge label={`${activeCount} active`} intent="success" dot />
            </View>
          </View>

          {/* Stacked share bar */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', height: 12, borderRadius: 6, overflow: 'hidden', gap: 2 }}>
              {partners.map((p, i) => (
                <View key={p.id} style={{ flex: p.share, backgroundColor: SHARE_COLORS[i % SHARE_COLORS.length] }} />
              ))}
            </View>
            <Text variant="caption" tone={overAllocated ? 'danger' : 'subtle'} weight={overAllocated ? 'semibold' : 'regular'}>
              {overAllocated
                ? `⚠ Shares add up to ${totalShare}% - over 100%. Review the split.`
                : `${totalShare}% of revenue distributed across ${partners.length} ${partners.length === 1 ? 'partner' : 'partners'}`}
            </Text>
          </View>

          {/* Payout math - computed, never typed in */}
          <View style={{ height: 1, backgroundColor: t.colors.divider }} />
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="caption" tone="subtle" weight="medium">
                Partner payouts
              </Text>
              <Text variant="body" weight="bold" mono tone="danger">
                {formatCurrency(totalPayout, { compact: true })}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="caption" tone="subtle" weight="medium">
                Company keeps
              </Text>
              <Text variant="body" weight="bold" mono tone="success">
                {formatCurrency(companyKeeps, { compact: true })}
              </Text>
            </View>
          </View>
        </Card>
      </Reveal>

      {/* Partner list */}
      {partners.length === 0 && (
        <Reveal index={2}>
          <Card elevation={1} style={{ alignItems: 'center', gap: 10, paddingVertical: 32 }}>
            <View style={{ width: 52, height: 52, borderRadius: 16, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={24} color={t.colors.accent} strokeWidth={2.2} />
            </View>
            <Text variant="h3" weight="bold" center>
              No partners yet
            </Text>
            <Text variant="bodySm" tone="muted" center style={{ maxWidth: 260 }}>
              Add a partner with their revenue share - Vantage computes their exact payout for you.
            </Text>
          </Card>
        </Reveal>
      )}
      <View style={{ gap: 12 }}>
        {partners.map((p, i) => {
          const up = p.delta >= 0;
          const Trend = up ? TrendingUp : TrendingDown;
          const color = SHARE_COLORS[i % SHARE_COLORS.length];
          const status = STATUS[p.status];
          return (
            <Reveal key={p.id} index={2 + i}>
            <PressableScale onPress={() => setEditPartner(p)} nativeID={`partner-${i}`} scaleTo={0.985} accessibilityLabel={`Edit ${p.name}`}>
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

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ gap: 2, flex: 1 }}>
                  <Text variant="caption" tone="subtle" weight="medium">
                    Contribution
                  </Text>
                  <Text variant="h3" weight="bold" mono>
                    {formatCurrency(p.revenue, { compact: true })}
                  </Text>
                </View>
                <View style={{ gap: 2, flex: 1 }}>
                  <Text variant="caption" tone="subtle" weight="medium">
                    Payout ({p.share}%)
                  </Text>
                  <Text variant="h3" weight="bold" mono tone="accent">
                    {formatCurrency(earningsOf(p), { compact: true })}
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
            </PressableScale>
            </Reveal>
          );
        })}
      </View>
    </Screen>
    <AddPartnerSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    <EditPartnerSheet visible={editPartner !== null} partner={editPartner} onClose={() => setEditPartner(null)} />
    </View>
  );
}
