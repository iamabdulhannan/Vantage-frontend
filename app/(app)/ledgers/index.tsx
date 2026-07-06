import React, { useMemo, useState } from 'react';
import { View, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Search, ChevronRight, ArrowDownLeft, ArrowUpRight } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Segmented } from '@/components/Segmented';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Reveal, PressableScale } from '@/components/motion';
import { AddCustomerSheet } from '@/components/sheets';
import { useStore } from '@/data/store';
import { registerQuickAdd } from '@/utils/quickAdd';
import { useRefreshOnFocus } from '@/data/useRefreshOnFocus';
import { formatCurrency, relativeDate } from '@/data/format';

export default function Ledgers() {
  const t = useTheme();
  const router = useRouter();
  const { customers } = useStore();
  useRefreshOnFocus();
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [addOpen, setAddOpen] = useState(false);

  // Center + on this tab adds a customer.
  React.useEffect(() => registerQuickAdd('ledgers', () => setAddOpen(true)), []);

  // DigiKhata semantics: balance > 0 => customer owes us ("You'll get"),
  // balance < 0 => we owe them / advance ("You'll give").
  const youllGet = customers.filter((c) => c.balance > 0).reduce((s, c) => s + c.balance, 0);
  const youllGive = customers.filter((c) => c.balance < 0).reduce((s, c) => s + Math.abs(c.balance), 0);

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchesQuery =
        !query ||
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.company.toLowerCase().includes(query.toLowerCase());
      const matchesFilter =
        filter === 'All' ||
        (filter === "You'll Get" && c.balance > 0) ||
        (filter === "You'll Give" && c.balance < 0);
      return matchesQuery && matchesFilter;
    });
  }, [query, filter, customers]);

  let idx = 0;

  return (
    <View style={{ flex: 1 }}>
    <Screen>
      <Reveal index={idx++}>
        <Header title="Khata Book" subtitle="Customer ledgers" showBell={false} />
      </Reveal>

      {/* You'll Get / You'll Give summary */}
      <Reveal index={idx++}>
        <Card elevation={2} padded={false} style={{ overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, padding: t.spacing.xl, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ArrowDownLeft size={15} color={t.colors.success} strokeWidth={2.6} />
                <Text variant="caption" tone="subtle" weight="semibold" style={{ letterSpacing: 0.3 }}>
                  YOU'LL GET
                </Text>
              </View>
              <AnimatedNumber value={youllGet} compact={false} size={20} weight="bold" color={t.colors.success} />
            </View>
            <View style={{ width: 1, backgroundColor: t.colors.border }} />
            <View style={{ flex: 1, padding: t.spacing.xl, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <ArrowUpRight size={15} color={t.colors.danger} strokeWidth={2.6} />
                <Text variant="caption" tone="subtle" weight="semibold" style={{ letterSpacing: 0.3 }}>
                  YOU'LL GIVE
                </Text>
              </View>
              <AnimatedNumber value={youllGive} compact={false} size={20} weight="bold" color={t.colors.danger} />
            </View>
          </View>
        </Card>
      </Reveal>

      {/* Search */}
      <Reveal index={idx++}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            height: 48,
            borderRadius: t.radius.lg,
            borderWidth: 1,
            borderColor: t.colors.border,
            backgroundColor: t.colors.surface,
            paddingHorizontal: 14,
          }}
        >
          <Search size={18} color={t.colors.textSubtle} strokeWidth={2.2} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search customers"
            placeholderTextColor={t.colors.textSubtle}
            style={{ flex: 1, fontFamily: t.fonts.regular, fontSize: 15, color: t.colors.text, height: '100%' }}
          />
        </View>
      </Reveal>

      <Reveal index={idx++}>
        <Segmented options={['All', "You'll Get", "You'll Give"]} value={filter} onChange={setFilter} />
      </Reveal>

      {/* List */}
      <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
        {filtered.length === 0 ? (
          <View style={{ padding: 32, alignItems: 'center', gap: 6 }}>
            <Text variant="body" weight="semibold">
              No customers found
            </Text>
            <Text variant="bodySm" tone="subtle" center>
              Try a different search or filter.
            </Text>
          </View>
        ) : (
          filtered.map((c, i) => {
            const settled = c.balance === 0;
            const get = c.balance > 0;
            const color = settled ? t.colors.textSubtle : get ? t.colors.success : t.colors.danger;
            const label = settled ? 'Settled' : get ? "You'll get" : "You'll give";
            return (
              <Reveal key={c.id} index={i} delay={120}>
                <PressableScale
                  onPress={() => router.push(`/(app)/ledgers/${c.id}`)}
                  nativeID={`cust-${i}`}
                  scaleTo={0.98}
                  accessibilityLabel={`${c.name}, ${label} ${formatCurrency(Math.abs(c.balance))}`}
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
                  <Avatar initials={c.initials} size={44} />
                  <View style={{ flex: 1, gap: 3 }}>
                    <Text variant="bodySm" weight="semibold" numberOfLines={1}>
                      {c.name}
                    </Text>
                    <Text variant="caption" tone="subtle" numberOfLines={1}>
                      {[c.company || null, c.phone || null].filter(Boolean).join(' · ') || relativeDate(c.lastActivity)}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <Text variant="bodySm" weight="bold" mono style={{ color }}>
                      {formatCurrency(Math.abs(c.balance))}
                    </Text>
                    <Text variant="micro" weight="semibold" style={{ color, letterSpacing: 0.2 }}>
                      {label}
                    </Text>
                  </View>
                  <ChevronRight size={18} color={t.colors.textSubtle} strokeWidth={2.2} />
                </PressableScale>
              </Reveal>
            );
          })
        )}
      </Card>
    </Screen>
    <AddCustomerSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    </View>
  );
}
