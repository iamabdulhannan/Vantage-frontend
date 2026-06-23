import React, { useState } from 'react';
import { View } from 'react-native';
import { Wallet, CalendarClock, Play, UserPlus } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Screen } from '@/components/Screen';
import { Header } from '@/components/Header';
import { Text } from '@/components/Text';
import { Card } from '@/components/Card';
import { Avatar } from '@/components/Avatar';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import { Fab } from '@/components/Fab';
import { AnimatedNumber } from '@/components/AnimatedNumber';
import { Reveal, ProgressBar, PressableScale } from '@/components/motion';
import { AddEmployeeSheet, EmployeeSheet } from '@/components/sheets';
import { useStore } from '@/data/store';
import { computePayroll, TAX_RATE, Employee } from '@/data/mock';
import { formatCurrency, formatDate } from '@/data/format';
import { ChevronRight } from 'lucide-react-native';

function BreakdownCell({ label, value, tone }: { label: string; value: number; tone?: 'default' | 'warning' | 'success' }) {
  const t = useTheme();
  return (
    <View style={{ flex: 1, backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 14, gap: 5 }}>
      <Text variant="caption" tone="subtle" weight="medium">
        {label}
      </Text>
      <AnimatedNumber
        value={value}
        compact
        prefix=""
        size={16}
        weight="bold"
        color={tone === 'warning' ? t.colors.warning : tone === 'success' ? t.colors.success : t.colors.text}
      />
    </View>
  );
}

export default function Payroll() {
  const t = useTheme();
  const { employees, runPayroll } = useStore();
  const [addOpen, setAddOpen] = useState(false);
  const [selected, setSelected] = useState<Employee | null>(null);
  const pay = computePayroll(employees);
  const allPaid = pay.pendingCount === 0;
  let idx = 0;

  return (
    <View style={{ flex: 1 }}>
    <Screen>
      <Reveal index={idx++}>
        <Header title="Payroll" subtitle="June 2026 cycle" showBell={false} />
      </Reveal>

      {/* Hero */}
      <Reveal index={idx++}>
        <Card elevation={2} style={{ gap: 18 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ gap: 4 }}>
              <Text variant="caption" tone="subtle" weight="medium" style={{ letterSpacing: 0.4 }}>
                NET PAYABLE THIS MONTH
              </Text>
              <AnimatedNumber value={pay.net} compact size={34} weight="bold" />
            </View>
            <View style={{ width: 46, height: 46, borderRadius: 14, backgroundColor: t.colors.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
              <Wallet size={22} color={t.colors.accent} strokeWidth={2.2} />
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <BreakdownCell label="Gross" value={pay.gross} />
            <BreakdownCell label={`Tax (${Math.round(TAX_RATE * 100)}%)`} value={pay.tax} tone="warning" />
            <BreakdownCell label="Net" value={pay.net} tone="success" />
          </View>

          <View style={{ gap: 7 }}>
            <ProgressBar progress={pay.paidRatio} color={t.colors.success} track={t.colors.surfaceAlt} height={10} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="caption" tone="success" weight="semibold">
                {pay.paidCount} of {pay.headcount} paid · {formatCurrency(pay.paidAmount, { compact: true })}
              </Text>
              <Text variant="caption" tone="warning" weight="semibold">
                {formatCurrency(pay.pendingAmount, { compact: true })} pending
              </Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: t.colors.surfaceAlt, borderRadius: t.radius.md, padding: 12 }}>
            <CalendarClock size={16} color={t.colors.textMuted} strokeWidth={2.2} />
            <Text variant="bodySm" tone="muted" weight="medium" style={{ flex: 1 }}>
              Next payday
            </Text>
            <Text variant="bodySm" weight="bold" mono>
              {formatDate(pay.nextPayday)}
            </Text>
          </View>

          <Button
            label={allPaid ? 'All salaries disbursed' : `Run payroll · ${formatCurrency(pay.pendingAmount, { compact: true })}`}
            icon={Play}
            disabled={allPaid}
            onPress={runPayroll}
          />
        </Card>
      </Reveal>

      {/* Team */}
      <Reveal index={idx++}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text variant="h3" weight="bold">
            Team
          </Text>
          <Text variant="bodySm" tone="subtle" weight="medium">
            {pay.headcount} employees
          </Text>
        </View>
      </Reveal>

      <View style={{ gap: 10 }}>
        {employees.map((e, i) => (
          <Reveal key={e.id} index={idx + i}>
            <PressableScale
              onPress={() => setSelected(e)}
              scaleTo={0.98}
              accessibilityLabel={`Manage ${e.name}`}
            >
              <Card elevation={1} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <Avatar initials={e.initials} size={44} />
                <View style={{ flex: 1, gap: 3 }}>
                  <Text variant="bodySm" weight="semibold" numberOfLines={1}>
                    {e.name}
                  </Text>
                  <Text variant="caption" tone="subtle" numberOfLines={1}>
                    {e.role} · {e.dept}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 5 }}>
                  <Text variant="bodySm" weight="bold" mono>
                    {formatCurrency(e.salary, { compact: true })}
                  </Text>
                  <Badge
                    label={e.status === 'paid' ? 'Paid' : 'Pending'}
                    intent={e.status === 'paid' ? 'success' : 'warning'}
                    dot
                  />
                </View>
                <ChevronRight size={18} color={t.colors.textSubtle} strokeWidth={2.2} />
              </Card>
            </PressableScale>
          </Reveal>
        ))}
      </View>
    </Screen>
    <Fab icon={UserPlus} label="Add employee" onPress={() => setAddOpen(true)} />
    <AddEmployeeSheet visible={addOpen} onClose={() => setAddOpen(false)} />
    <EmployeeSheet visible={selected !== null} employee={selected} onClose={() => setSelected(null)} />
    </View>
  );
}
