import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Building2, User, Tag, Hash, FileText, Briefcase, Users2, MapPin, Percent, TrendingUp, Trash2, Phone, Mail } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Sheet } from './Sheet';
import { Field } from './Field';
import { Button } from './Button';
import { Text } from './Text';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { PressableScale } from './motion';
import { useStore } from '@/data/store';
import { Employee, LedgerEntry } from '@/data/mock';
import { currencySymbol, formatCurrency } from '@/data/format';

function parseAmount(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function ColorButton({ label, color, onPress, disabled }: { label: string; color: string; onPress: () => void; disabled?: boolean }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={disabled ? () => {} : onPress}
      style={{
        height: 48,
        borderRadius: t.radius.lg,
        backgroundColor: color,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.5 : 1,
        ...t.shadow(2),
      }}
      accessibilityRole="button"
    >
      <Text weight="bold" style={{ color: '#FFFFFF' }}>
        {label}
      </Text>
    </PressableScale>
  );
}

/* -------------------------------------------------------------------------- */

function DirectionToggle({ value, onChange }: { value: 'get' | 'give'; onChange: (v: 'get' | 'give') => void }) {
  const t = useTheme();
  const pill = (key: 'get' | 'give', label: string, color: string) => {
    const active = value === key;
    return (
      <PressableScale
        onPress={() => onChange(key)}
        style={{
          flex: 1,
          height: 44,
          borderRadius: t.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? color : t.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: active ? color : t.colors.border,
        }}
      >
        <Text variant="bodySm" weight="semibold" style={{ color: active ? '#FFFFFF' : t.colors.textMuted }}>
          {label}
        </Text>
      </PressableScale>
    );
  };
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      {pill('get', "You'll get", t.colors.success)}
      {pill('give', "You'll give", t.colors.danger)}
    </View>
  );
}

export function AddCustomerSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addCustomer } = useStore();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [opening, setOpening] = useState('');
  const [openingKind, setOpeningKind] = useState<'get' | 'give'>('get');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setName('');
      setCompany('');
      setPhone('');
      setEmail('');
      setOpening('');
      setOpeningKind('get');
      setError(undefined);
    }
  }, [visible]);

  const submit = () => {
    if (name.trim().length < 2) {
      setError('Enter the customer name');
      return;
    }
    if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    addCustomer({
      name,
      company,
      phone,
      email,
      openingBalance: parseAmount(opening),
      openingKind,
    });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="New customer" subtitle="Save full contact + opening balance">
      <View style={{ gap: 16 }}>
        <Field label="Customer name *" icon={User} value={name} onChangeText={setName} placeholder="e.g. Sara Ahmed" autoFocus />
        <Field
          label="Phone number"
          icon={Phone}
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g. 0300 1234567"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
        />
        <Field label="Business / company" icon={Building2} value={company} onChangeText={setCompany} placeholder="e.g. Ahmed Traders" />
        <Field
          label="Email (optional)"
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder="e.g. sara@traders.pk"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <View style={{ gap: 10 }}>
          <Field
            label={`Opening balance (${currencySymbol()}) — optional`}
            icon={Hash}
            value={opening}
            onChangeText={setOpening}
            placeholder="0"
            keyboardType="numeric"
          />
          {parseAmount(opening) > 0 && <DirectionToggle value={openingKind} onChange={setOpeningKind} />}
        </View>
        {error && (
          <Text variant="caption" tone="danger" weight="medium">
            {error}
          </Text>
        )}
        <Button label="Add customer" onPress={submit} nativeID="submit-customer" />
      </View>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */

export function AddEntrySheet({
  visible,
  onClose,
  customerId,
  kind,
}: {
  visible: boolean;
  onClose: () => void;
  customerId: string;
  kind: 'gave' | 'got';
}) {
  const t = useTheme();
  const { addEntry } = useStore();
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setAmount('');
      setMemo('');
      setError(undefined);
    }
  }, [visible, kind]);

  const isGave = kind === 'gave';
  const color = isGave ? t.colors.danger : t.colors.success;

  const submit = () => {
    const value = parseAmount(amount);
    if (value <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    addEntry(customerId, { kind, amount: value, memo });
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={isGave ? 'You Gave' : 'You Got'}
      subtitle={isGave ? 'Money given / sold on credit' : 'Payment received'}
    >
      <View style={{ gap: 16 }}>
        <Field
          label={`Amount (${currencySymbol()})`}
          icon={Hash}
          value={amount}
          onChangeText={setAmount}
          placeholder="0"
          keyboardType="numeric"
          error={error}
          autoFocus
        />
        <Field label="Note (optional)" icon={FileText} value={memo} onChangeText={setMemo} placeholder={isGave ? 'e.g. Goods supplied' : 'e.g. Cash payment'} />
        <ColorButton label={isGave ? 'Save — You Gave' : 'Save — You Got'} color={color} onPress={submit} />
      </View>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */

export function EditEntrySheet({
  visible,
  onClose,
  customerId,
  entry,
}: {
  visible: boolean;
  onClose: () => void;
  customerId: string;
  entry: LedgerEntry | null;
}) {
  const t = useTheme();
  const { updateEntry, removeEntry } = useStore();
  const [kind, setKind] = useState<'gave' | 'got'>('gave');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (visible && entry) {
      const gave = entry.debit > 0;
      setKind(gave ? 'gave' : 'got');
      setAmount(String(gave ? entry.debit : entry.credit));
      setMemo(entry.memo);
      setError(undefined);
      setConfirmDelete(false);
    }
  }, [visible, entry?.id]);

  if (!entry) return null;

  const save = () => {
    const value = parseAmount(amount);
    if (value <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    updateEntry(customerId, entry.id, { kind, amount: value, memo });
    onClose();
  };

  const del = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeEntry(customerId, entry.id);
    onClose();
  };

  const pill = (key: 'gave' | 'got', label: string, color: string) => {
    const active = kind === key;
    return (
      <PressableScale
        onPress={() => setKind(key)}
        style={{
          flex: 1,
          height: 44,
          borderRadius: t.radius.md,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: active ? color : t.colors.surfaceAlt,
          borderWidth: 1,
          borderColor: active ? color : t.colors.border,
        }}
      >
        <Text variant="bodySm" weight="semibold" style={{ color: active ? '#FFFFFF' : t.colors.textMuted }}>
          {label}
        </Text>
      </PressableScale>
    );
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Edit entry" subtitle="Update or delete this transaction">
      <View style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          {pill('gave', 'You gave', t.colors.danger)}
          {pill('got', 'You got', t.colors.success)}
        </View>
        <Field label={`Amount (${currencySymbol()})`} icon={Hash} value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" error={error} />
        <Field label="Note (optional)" icon={FileText} value={memo} onChangeText={setMemo} placeholder="e.g. Goods supplied" />
        <Button label="Save changes" onPress={save} nativeID="save-entry" />
        <Button
          label={confirmDelete ? 'Tap again to confirm delete' : 'Delete entry'}
          variant="danger"
          icon={Trash2}
          onPress={del}
          nativeID="delete-entry"
        />
      </View>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */

const EXPENSE_CATEGORIES = ['Payroll', 'Operations', 'Marketing', 'R&D', 'Facilities', 'Travel', 'Software', 'Taxes', 'Other'];

export function AddExpenseSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const t = useTheme();
  const { addExpense } = useStore();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setLabel('');
      setAmount('');
      setNote('');
      setError(undefined);
    }
  }, [visible]);

  const submit = () => {
    const value = parseAmount(amount);
    if (label.trim().length < 2) {
      setError('Enter an expense category');
      return;
    }
    if (value <= 0) {
      setError('Enter an amount greater than 0');
      return;
    }
    addExpense({ label, value, note });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Add expense" subtitle="Record any kind of company expense">
      <View style={{ gap: 16 }}>
        <Field label="Category" icon={Tag} value={label} onChangeText={setLabel} placeholder="e.g. Travel" autoFocus />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {EXPENSE_CATEGORIES.map((c) => {
            const active = c.toLowerCase() === label.trim().toLowerCase();
            return (
              <PressableScale
                key={c}
                onPress={() => setLabel(c)}
                scaleTo={0.96}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 7,
                  borderRadius: 999,
                  backgroundColor: active ? t.colors.accentSoft : t.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: active ? t.colors.accent : 'transparent',
                }}
              >
                <Text variant="caption" weight={active ? 'semibold' : 'regular'} tone={active ? 'accent' : 'muted'}>
                  {c}
                </Text>
              </PressableScale>
            );
          })}
        </View>
        <Field label={`Amount (${currencySymbol()})`} icon={Hash} value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" error={error} />
        <Field label="Note (optional)" icon={FileText} value={note} onChangeText={setNote} placeholder="e.g. Q3 ad campaign" />
        <Button label="Add expense" onPress={submit} nativeID="submit-expense" />
      </View>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */

export function AddEmployeeSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addEmployee } = useStore();
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [dept, setDept] = useState('');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setName('');
      setRole('');
      setDept('');
      setSalary('');
      setError(undefined);
    }
  }, [visible]);

  const submit = () => {
    const value = parseAmount(salary);
    if (name.trim().length < 2) {
      setError('Enter the employee name');
      return;
    }
    if (value <= 0) {
      setError('Enter a monthly salary greater than 0');
      return;
    }
    addEmployee({ name, role, dept, salary: value });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Add employee" subtitle="New hire joins this payroll cycle">
      <View style={{ gap: 16 }}>
        <Field label="Full name" icon={User} value={name} onChangeText={setName} placeholder="e.g. Sara Ahmed" autoFocus />
        <Field label="Role" icon={Briefcase} value={role} onChangeText={setRole} placeholder="e.g. Backend Engineer" />
        <Field label="Department" icon={Users2} value={dept} onChangeText={setDept} placeholder="e.g. Engineering" />
        <Field label={`Monthly salary (${currencySymbol()})`} icon={Hash} value={salary} onChangeText={setSalary} placeholder="0" keyboardType="numeric" error={error} />
        <Button label="Add employee" onPress={submit} nativeID="submit-employee" />
      </View>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */

export function AddPartnerSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addPartner } = useStore();
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [share, setShare] = useState('');
  const [revenue, setRevenue] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setName('');
      setRegion('');
      setContact('');
      setPhone('');
      setEmail('');
      setShare('');
      setRevenue('');
      setError(undefined);
    }
  }, [visible]);

  const submit = () => {
    const shareValue = parseAmount(share);
    const revenueValue = parseAmount(revenue);
    if (name.trim().length < 2) {
      setError('Enter the partner name');
      return;
    }
    if (shareValue <= 0 || shareValue > 100) {
      setError('Enter a share between 1 and 100');
      return;
    }
    if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    addPartner({ name, region, contact, phone, email, share: shareValue, revenue: revenueValue });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Add partner" subtitle="Bring a new partner into the split">
      <View style={{ gap: 16 }}>
        <Field label="Partner / firm name *" icon={Building2} value={name} onChangeText={setName} placeholder="e.g. Crescent Capital" autoFocus />
        <Field label="Contact person" icon={User} value={contact} onChangeText={setContact} placeholder="e.g. Imran Sheikh" />
        <Field label="Region" icon={MapPin} value={region} onChangeText={setRegion} placeholder="e.g. EMEA" />
        <Field
          label="Phone number"
          icon={Phone}
          value={phone}
          onChangeText={setPhone}
          placeholder="e.g. 0300 1234567"
          keyboardType="phone-pad"
          textContentType="telephoneNumber"
          autoComplete="tel"
        />
        <Field
          label="Email (optional)"
          icon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder="e.g. imran@crescent.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
        />
        <Field label="Revenue share (%)" icon={Percent} value={share} onChangeText={setShare} placeholder="0" keyboardType="numeric" />
        <Field label={`Revenue contribution (${currencySymbol()})`} icon={Hash} value={revenue} onChangeText={setRevenue} placeholder="0" keyboardType="numeric" />
        {error && (
          <Text variant="caption" tone="danger" weight="medium">
            {error}
          </Text>
        )}
        <Button label="Add partner" onPress={submit} nativeID="submit-partner" />
      </View>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */

export function EmployeeSheet({ visible, onClose, employee }: { visible: boolean; onClose: () => void; employee: Employee | null }) {
  const t = useTheme();
  const { incrementSalary, removeEmployee } = useStore();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (visible) {
      setAmount('');
      setError(undefined);
      setConfirmRemove(false);
    }
  }, [visible, employee?.id]);

  if (!employee) return null;

  const applyIncrement = () => {
    const value = parseAmount(amount);
    if (value <= 0) {
      setError('Enter an increment amount greater than 0');
      return;
    }
    incrementSalary(employee.id, value);
    onClose();
  };

  const remove = () => {
    if (!confirmRemove) {
      setConfirmRemove(true);
      return;
    }
    removeEmployee(employee.id);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Manage employee" subtitle="Increment salary or remove from payroll">
      <View style={{ gap: 18 }}>
        {/* Identity */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Avatar initials={employee.initials} size={48} />
          <View style={{ flex: 1, gap: 3 }}>
            <Text variant="body" weight="bold" numberOfLines={1}>
              {employee.name}
            </Text>
            <Text variant="caption" tone="subtle" numberOfLines={1}>
              {employee.role} · {employee.dept}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 5 }}>
            <Text variant="bodySm" weight="bold" mono>
              {formatCurrency(employee.salary, { compact: true })}
            </Text>
            <Badge label={employee.status === 'paid' ? 'Paid' : 'Pending'} intent={employee.status === 'paid' ? 'success' : 'warning'} dot />
          </View>
        </View>

        <View style={{ height: 1, backgroundColor: t.colors.divider }} />

        {/* Increment */}
        <View style={{ gap: 12 }}>
          <Field
            label={`Increment amount (${currencySymbol()})`}
            icon={Hash}
            value={amount}
            onChangeText={setAmount}
            placeholder="e.g. 2000"
            keyboardType="numeric"
            error={error}
            autoFocus
          />
          <Button label="Apply increment" icon={TrendingUp} onPress={applyIncrement} nativeID="apply-increment" />
        </View>

        <View style={{ height: 1, backgroundColor: t.colors.divider }} />

        {/* Remove (super-admin) */}
        <Button
          label={confirmRemove ? 'Tap again to confirm removal' : 'Remove employee'}
          variant="danger"
          icon={Trash2}
          onPress={remove}
          nativeID="remove-employee"
        />
      </View>
    </Sheet>
  );
}
