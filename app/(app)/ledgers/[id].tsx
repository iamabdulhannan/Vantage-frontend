import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Share2, Pencil } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Reveal, PressableScale } from '@/components/motion';
import { AddEntrySheet, EditEntrySheet, EditCustomerSheet } from '@/components/sheets';
import { useStore } from '@/data/store';
import { useCompany } from '@/data/company';
import { shareStatement } from '@/utils/statement';
import { formatCurrency, formatDate } from '@/data/format';
import type { LedgerEntry } from '@/data/mock';

const COL = 84;

function GiveGotButton({ kind, onPress }: { kind: 'gave' | 'got'; onPress: () => void }) {
  const t = useTheme();
  const isGave = kind === 'gave';
  const color = isGave ? t.colors.danger : t.colors.success;
  const Icon = isGave ? ArrowUpRight : ArrowDownLeft;
  return (
    <PressableScale
      onPress={onPress}
      nativeID={`btn-${kind}`}
      style={{
        flex: 1,
        height: 50,
        borderRadius: t.radius.lg,
        backgroundColor: color,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        ...t.shadow(2),
      }}
      accessibilityLabel={isGave ? 'Record you gave' : 'Record you got'}
    >
      <Icon size={19} color="#FFFFFF" strokeWidth={2.6} />
      <Text weight="bold" style={{ color: '#FFFFFF' }}>
        {isGave ? 'YOU GAVE' : 'YOU GOT'}
      </Text>
    </PressableScale>
  );
}

export default function LedgerDetail() {
  const t = useTheme();
  const router = useRouter();
  const { customers } = useStore();
  const { name: companyName } = useCompany();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entryKind, setEntryKind] = useState<'gave' | 'got' | null>(null);
  const [editEntry, setEditEntry] = useState<LedgerEntry | null>(null);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return (
      <Screen scroll={false}>
        <Text variant="h3" weight="bold" style={{ marginTop: 40 }}>
          Account not found
        </Text>
        <Button label="Go back" variant="secondary" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </Screen>
    );
  }

  const totalGave = customer.ledger.reduce((s, e) => s + e.debit, 0);
  const totalGot = customer.ledger.reduce((s, e) => s + e.credit, 0);
  const settled = customer.balance === 0;
  const get = customer.balance > 0;
  const balColor = settled ? t.colors.textSubtle : get ? t.colors.success : t.colors.danger;
  const balLabel = settled ? 'Settled up' : get ? "You'll get" : "You'll give";

  // most recent last -> show running balance per row
  const rows = customer.ledger;

  const onShare = async () => {
    try {
      setSharing(true);
      await shareStatement(customer, { companyName });
    } catch {
      // ignore — user cancelled or share unavailable
    } finally {
      setSharing(false);
    }
  };

  let idx = 0;

  return (
    <Screen>
      {/* Header */}
      <Reveal index={idx++}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={10}
            accessibilityLabel="Go back"
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: t.colors.surface,
              borderWidth: 1,
              borderColor: t.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowLeft size={20} color={t.colors.text} strokeWidth={2.2} />
          </Pressable>
          <Avatar initials={customer.initials} size={44} />
          <View style={{ flex: 1 }}>
            <Text variant="h3" weight="bold" numberOfLines={1}>
              {customer.name}
            </Text>
            <Text variant="bodySm" tone="muted" numberOfLines={1}>
              {[customer.company, customer.phone].filter(Boolean).join(' · ') || 'Customer'}
            </Text>
          </View>
          <Pressable
            onPress={() => setEditCustomerOpen(true)}
            hitSlop={10}
            accessibilityLabel="Edit customer"
            nativeID="edit-customer"
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: t.colors.surface,
              borderWidth: 1,
              borderColor: t.colors.border,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Pencil size={17} color={t.colors.text} strokeWidth={2.2} />
          </Pressable>
          <Pressable
            onPress={onShare}
            disabled={sharing}
            hitSlop={10}
            accessibilityLabel="Share statement as PDF"
            style={{
              width: 42,
              height: 42,
              borderRadius: 14,
              backgroundColor: t.colors.accentSoft,
              borderWidth: 1,
              borderColor: t.colors.accent,
              alignItems: 'center',
              justifyContent: 'center',
              opacity: sharing ? 0.6 : 1,
            }}
          >
            <Share2 size={18} color={t.colors.accent} strokeWidth={2.2} />
          </Pressable>
        </View>
      </Reveal>

      {/* Balance */}
      <Reveal index={idx++}>
        <Card elevation={2} style={{ gap: 16 }}>
          <View style={{ gap: 4 }}>
            <Text variant="caption" weight="semibold" style={{ color: balColor, letterSpacing: 0.3 }}>
              {balLabel.toUpperCase()}
            </Text>
            <AnimatedNumber value={Math.abs(customer.balance)} compact size={34} weight="bold" color={balColor} />
          </View>
          <View style={{ height: 1, backgroundColor: t.colors.divider }} />
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="caption" tone="subtle" weight="medium">
                Total you gave
              </Text>
              <Text variant="body" weight="bold" mono tone="danger">
                {formatCurrency(totalGave, { compact: true })}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="caption" tone="subtle" weight="medium">
                Total you got
              </Text>
              <Text variant="body" weight="bold" mono tone="success">
                {formatCurrency(totalGot, { compact: true })}
              </Text>
            </View>
          </View>
        </Card>
      </Reveal>

      {/* Action buttons */}
      <Reveal index={idx++}>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <GiveGotButton kind="gave" onPress={() => setEntryKind('gave')} />
          <GiveGotButton kind="got" onPress={() => setEntryKind('got')} />
        </View>
      </Reveal>

      {/* Entries header */}
      <Reveal index={idx++}>
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4 }}>
          <Text variant="micro" tone="subtle" weight="semibold" style={{ flex: 1, letterSpacing: 0.4 }}>
            ENTRIES
          </Text>
          <Text variant="micro" weight="semibold" style={{ width: COL, textAlign: 'right', color: t.colors.danger, letterSpacing: 0.3 }}>
            YOU GAVE
          </Text>
          <Text variant="micro" weight="semibold" style={{ width: COL, textAlign: 'right', color: t.colors.success, letterSpacing: 0.3 }}>
            YOU GOT
          </Text>
        </View>
      </Reveal>

      <Card elevation={1} padded={false} style={{ overflow: 'hidden' }}>
        {rows.length === 0 && (
          <View style={{ padding: 28, alignItems: 'center', gap: 6 }}>
            <Text variant="body" weight="semibold">
              No entries yet
            </Text>
            <Text variant="bodySm" tone="subtle" center>
              Tap YOU GAVE or YOU GOT above to record the first transaction.
            </Text>
          </View>
        )}
        {rows.map((e, i) => {
          const gave = e.debit > 0;
          return (
            <Reveal key={e.id} index={i} delay={160}>
              <PressableScale
                onPress={() => setEditEntry(e)}
                nativeID={`entry-${i}`}
                scaleTo={0.98}
                accessibilityLabel={`Edit ${e.memo}`}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingHorizontal: t.spacing.lg,
                  paddingVertical: 13,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: t.colors.divider,
                }}
              >
                <View style={{ flex: 1, gap: 3, paddingRight: 6 }}>
                  <Text variant="bodySm" weight="medium" numberOfLines={1}>
                    {e.memo}
                  </Text>
                  <Text variant="micro" tone="subtle">
                    {formatDate(e.date)} · Bal {formatCurrency(Math.abs(e.balance), { compact: true })}
                  </Text>
                </View>
                <Text variant="bodySm" weight="bold" mono style={{ width: COL, textAlign: 'right', color: gave ? t.colors.danger : t.colors.textSubtle }}>
                  {gave ? formatCurrency(e.debit, { compact: true }) : '—'}
                </Text>
                <Text variant="bodySm" weight="bold" mono style={{ width: COL, textAlign: 'right', color: !gave ? t.colors.success : t.colors.textSubtle }}>
                  {!gave ? formatCurrency(e.credit, { compact: true }) : '—'}
                </Text>
              </PressableScale>
            </Reveal>
          );
        })}
      </Card>

      {/* Share as PDF */}
      <Reveal index={idx++}>
        <Button label="Share statement (PDF)" icon={Share2} variant="secondary" onPress={onShare} loading={sharing} />
      </Reveal>

      <AddEntrySheet
        visible={entryKind !== null}
        kind={entryKind ?? 'gave'}
        customerId={customer.id}
        onClose={() => setEntryKind(null)}
      />
      <EditEntrySheet
        visible={editEntry !== null}
        entry={editEntry}
        customerId={customer.id}
        onClose={() => setEditEntry(null)}
      />
      <EditCustomerSheet
        visible={editCustomerOpen}
        customer={{ id: customer.id, name: customer.name, company: customer.company, phone: customer.phone, email: customer.email }}
        onClose={() => setEditCustomerOpen(false)}
        onDeleted={() => router.back()}
      />
    </Screen>
  );
}
