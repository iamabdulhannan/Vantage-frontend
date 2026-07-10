import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Share2, Pencil, BellRing, CheckCircle2, XCircle, RotateCcw, CalendarClock } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Reveal, PressableScale } from '@/components/motion';
import { AddEntrySheet, EditEntrySheet, EditCustomerSheet, ReminderSheet } from '@/components/sheets';
import { AdInterstitial } from '@/components/AdInterstitial';
import { useStore } from '@/data/store';
import { useCompany } from '@/data/company';
import { shareStatement } from '@/utils/statement';
import { formatCurrency, formatDate } from '@/data/format';
import type { LedgerEntry } from '@/data/mock';

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
  const { customers, setReminderStatus } = useStore();
  const { company, name: companyName } = useCompany();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [entryKind, setEntryKind] = useState<'gave' | 'got' | null>(null);
  const [editEntry, setEditEntry] = useState<LedgerEntry | null>(null);
  const [editCustomerOpen, setEditCustomerOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
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

  // DigiKhata order: newest entry on top. Running balances stay chronological
  // (computed oldest-first in recalc), we only flip the display order.
  const rows = [...customer.ledger].reverse();

  const onFreePlan = company?.plan === 'free';

  const doShare = async () => {
    try {
      setSharing(true);
      // Free tier: the shared PDF carries a sponsored block.
      await shareStatement(customer, { companyName, showAd: onFreePlan });
    } catch {
      // ignore - user cancelled or share unavailable
    } finally {
      setSharing(false);
    }
  };

  // Free tier: a sponsored interstitial runs before the share sheet opens.
  const onShare = () => {
    if (onFreePlan) setAdOpen(true);
    else void doShare();
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
            {customer.reliability && customer.reliability.label !== 'New' && (
              <Text
                variant="micro"
                weight="bold"
                style={{
                  color:
                    customer.reliability.label === 'Reliable'
                      ? t.colors.success
                      : customer.reliability.label === 'Usually pays'
                      ? t.colors.accent
                      : t.colors.danger,
                }}
              >
                {customer.reliability.label} · {customer.reliability.kept} kept · {customer.reliability.missed} missed · {customer.reliability.rescheduled} rescheduled
              </Text>
            )}
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
            <AnimatedNumber value={Math.abs(customer.balance)} compact={false} size={30} weight="bold" color={balColor} />
          </View>
          <View style={{ height: 1, backgroundColor: t.colors.divider }} />
          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="caption" tone="subtle" weight="medium">
                Total you gave
              </Text>
              <Text variant="body" weight="bold" mono tone="danger">
                {formatCurrency(totalGave)}
              </Text>
            </View>
            <View style={{ flex: 1, gap: 3 }}>
              <Text variant="caption" tone="subtle" weight="medium">
                Total you got
              </Text>
              <Text variant="body" weight="bold" mono tone="success">
                {formatCurrency(totalGot)}
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

      {/* Payment promise / reminder */}
      <Reveal index={idx++}>
        {(() => {
          const reminders = customer.reminders ?? [];
          const active = reminders.find((r) => r.status === 'pending');
          const history = reminders.filter((r) => r.status !== 'pending');
          const overdue = active && new Date(active.dueAt).getTime() < Date.now();
          return (
            <Card elevation={1} style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 34, height: 34, borderRadius: 10, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <CalendarClock size={17} color={t.colors.accent} strokeWidth={2.2} />
                </View>
                <Text variant="bodySm" weight="semibold" style={{ flex: 1 }}>
                  Payment promise
                </Text>
                {!active && (
                  <PressableScale onPress={() => setReminderOpen(true)} nativeID="set-reminder" scaleTo={0.95} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: t.colors.accentSoft, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999 }}>
                    <BellRing size={14} color={t.colors.accent} strokeWidth={2.4} />
                    <Text variant="caption" weight="bold" tone="accent">
                      Set reminder
                    </Text>
                  </PressableScale>
                )}
              </View>

              {active && (
                <View style={{ backgroundColor: overdue ? t.colors.dangerSoft : t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 12, gap: 10 }}>
                  <Text variant="bodySm" weight="semibold" tone={overdue ? 'danger' : 'default'}>
                    {overdue ? 'Overdue: ' : 'Will pay on '}
                    {formatDate(active.dueAt)}
                    {active.note ? ` · ${active.note}` : ''}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    <PressableScale onPress={() => setReminderStatus(customer.id, active.id, 'kept')} nativeID="promise-kept" scaleTo={0.95} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: t.colors.successSoft, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 }}>
                      <CheckCircle2 size={13} color={t.colors.success} strokeWidth={2.4} />
                      <Text variant="micro" weight="bold" style={{ color: t.colors.success }}>Paid</Text>
                    </PressableScale>
                    <PressableScale onPress={() => setReminderOpen(true)} nativeID="promise-reschedule" scaleTo={0.95} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: t.colors.warningSoft, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 }}>
                      <RotateCcw size={13} color={t.colors.warning} strokeWidth={2.4} />
                      <Text variant="micro" weight="bold" style={{ color: t.colors.warning }}>Reschedule</Text>
                    </PressableScale>
                    <PressableScale onPress={() => setReminderStatus(customer.id, active.id, 'missed')} nativeID="promise-missed" scaleTo={0.95} style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: t.colors.dangerSoft, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 999 }}>
                      <XCircle size={13} color={t.colors.danger} strokeWidth={2.4} />
                      <Text variant="micro" weight="bold" style={{ color: t.colors.danger }}>Missed</Text>
                    </PressableScale>
                  </View>
                </View>
              )}

              {history.length > 0 && (
                <View style={{ gap: 8 }}>
                  <Text variant="micro" tone="subtle" weight="semibold" style={{ letterSpacing: 0.4 }}>
                    PROMISE HISTORY
                  </Text>
                  {history.slice(0, 5).map((r) => {
                    const meta =
                      r.status === 'kept'
                        ? { icon: CheckCircle2, color: t.colors.success, label: 'Kept' }
                        : r.status === 'missed'
                        ? { icon: XCircle, color: t.colors.danger, label: 'Missed' }
                        : { icon: RotateCcw, color: t.colors.warning, label: 'Rescheduled' };
                    const HIcon = meta.icon;
                    return (
                      <View key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <HIcon size={14} color={meta.color} strokeWidth={2.4} />
                        <Text variant="caption" tone="muted" style={{ flex: 1 }} numberOfLines={1}>
                          {formatDate(r.dueAt)}
                          {r.note ? ` · ${r.note}` : ''}
                        </Text>
                        <Text variant="micro" weight="bold" style={{ color: meta.color }}>
                          {meta.label}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              {!active && history.length === 0 && (
                <Text variant="caption" tone="subtle">
                  No promise set. When {customer.name.split(' ')[0]} says "I will pay on Friday", save it here and we will remind you.
                </Text>
              )}
            </Card>
          );
        })()}
      </Reveal>

      {/* Entries header */}
      <Reveal index={idx++}>
        <Text variant="micro" tone="subtle" weight="semibold" style={{ letterSpacing: 0.4, paddingHorizontal: 4 }}>
          ENTRIES · NEWEST FIRST
        </Text>
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
                <View style={{ flex: 1, minWidth: 0, gap: 3, paddingRight: 10 }}>
                  <Text variant="bodySm" weight="medium" numberOfLines={1}>
                    {e.memo}
                  </Text>
                  <Text variant="micro" tone="subtle" numberOfLines={1}>
                    {formatDate(e.date)} · {gave ? 'You gave' : 'You got'}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', flexShrink: 0, gap: 3 }}>
                  <Text variant="bodySm" weight="bold" mono style={{ color: gave ? t.colors.danger : t.colors.success }}>
                    {gave ? '-' : '+'}{formatCurrency(gave ? e.debit : e.credit)}
                  </Text>
                  <Text variant="micro" weight="semibold" style={{ color: e.balance > 0 ? t.colors.success : e.balance < 0 ? t.colors.danger : t.colors.textSubtle }} numberOfLines={1}>
                    Bal {formatCurrency(Math.abs(e.balance))} {e.balance === 0 ? '· Settled' : e.balance > 0 ? "· You'll get" : "· You'll give"}
                  </Text>
                </View>
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
      <AdInterstitial visible={adOpen} onClose={() => setAdOpen(false)} onContinue={() => void doShare()} />
      <ReminderSheet
        visible={reminderOpen}
        onClose={() => setReminderOpen(false)}
        customerId={customer.id}
        customerName={customer.name}
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
