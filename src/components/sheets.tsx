import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Building2, User, Tag, Hash, FileText, Briefcase, Users2, MapPin, Percent, TrendingUp, Trash2, Phone, Mail, BellRing } from 'lucide-react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Sheet } from './Sheet';
import { Field } from './Field';
import { Button } from './Button';
import { Text } from './Text';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { PressableScale } from './motion';
import { useStore } from '@/data/store';
import { scheduleReminderNotifications } from '@/utils/reminders';
import { Employee, LedgerEntry, ExpenseSlice, Partner } from '@/data/mock';
import { currencySymbol, formatCurrency, formatDate } from '@/data/format';

function parseAmount(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  return Number.isFinite(n) ? n : 0;
}

function ColorButton({ label, color, onPress, disabled, nativeID }: { label: string; color: string; onPress: () => void; disabled?: boolean; nativeID?: string }) {
  const t = useTheme();
  return (
    <PressableScale
      onPress={disabled ? () => {} : onPress}
      nativeID={nativeID}
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

export function AddCustomerSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { addCustomer } = useStore();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    if (visible) {
      setName('');
      setCompany('');
      setPhone('');
      setEmail('');
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
    addCustomer({ name, company, phone, email });
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="New customer" subtitle="The balance builds from the entries you add">
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

export function EditCustomerSheet({
  visible,
  onClose,
  customer,
  onDeleted,
}: {
  visible: boolean;
  onClose: () => void;
  customer: { id: string; name: string; company: string; phone?: string; email?: string } | null;
  onDeleted?: () => void;
}) {
  const { updateCustomer, removeCustomer } = useStore();
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (visible && customer) {
      setName(customer.name);
      setCompany(customer.company || '');
      setPhone(customer.phone || '');
      setEmail(customer.email || '');
      setError(undefined);
      setConfirmDelete(false);
    }
  }, [visible, customer?.id]);

  if (!customer) return null;

  const save = () => {
    if (name.trim().length < 2) {
      setError('Enter the customer name');
      return;
    }
    if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    updateCustomer(customer.id, { name, company, phone, email });
    onClose();
  };

  const del = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeCustomer(customer.id);
    onClose();
    onDeleted?.();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Edit customer" subtitle="Update details or delete this account">
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
        {error && (
          <Text variant="caption" tone="danger" weight="medium">
            {error}
          </Text>
        )}
        <Button label="Save changes" onPress={save} nativeID="save-customer-edit" />
        <Button
          label={confirmDelete ? 'Tap again to delete customer + ledger' : 'Delete customer'}
          variant="danger"
          icon={Trash2}
          onPress={del}
          nativeID="delete-customer"
        />
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
        <Field label="Details (items, bill no, reason)" icon={FileText} value={memo} onChangeText={setMemo} placeholder={isGave ? 'e.g. 10 cartons supplied - Bill #221' : 'e.g. Cash payment received'} />
        <ColorButton label={isGave ? 'Save - You Gave' : 'Save - You Got'} color={color} onPress={submit} nativeID="save-add-entry" />
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
        <Field label="Details (items, bill no, reason)" icon={FileText} value={memo} onChangeText={setMemo} placeholder="e.g. 10 cartons supplied - Bill #221" />
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

export function EditExpenseSheet({
  visible,
  onClose,
  expense,
}: {
  visible: boolean;
  onClose: () => void;
  expense: ExpenseSlice | null;
}) {
  const { updateExpense, removeExpense } = useStore();
  const [label, setLabel] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (visible && expense) {
      setLabel(expense.label);
      setAmount(String(expense.value));
      setNote(expense.note ?? '');
      setError(undefined);
      setConfirmDelete(false);
    }
  }, [visible, expense?.id]);

  if (!expense || !expense.id) return null;
  const id = expense.id;

  const save = () => {
    const value = parseAmount(amount);
    if (label.trim().length < 2) return setError('Enter an expense category');
    if (value <= 0) return setError('Enter an amount greater than 0');
    updateExpense(id, { label, value, note });
    onClose();
  };

  const del = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removeExpense(id);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Edit expense" subtitle="Update or delete this record">
      <View style={{ gap: 16 }}>
        <Field label="Category" icon={Tag} value={label} onChangeText={setLabel} placeholder="e.g. Travel" />
        <Field label={`Amount (${currencySymbol()})`} icon={Hash} value={amount} onChangeText={setAmount} placeholder="0" keyboardType="numeric" error={error} />
        <Field label="Note (optional)" icon={FileText} value={note} onChangeText={setNote} placeholder="e.g. Q3 ad campaign" />
        <Button label="Save changes" onPress={save} nativeID="save-expense-edit" />
        <Button
          label={confirmDelete ? 'Tap again to confirm delete' : 'Delete expense'}
          variant="danger"
          icon={Trash2}
          onPress={del}
          nativeID="delete-expense"
        />
      </View>
    </Sheet>
  );
}

/* -------------------------------------------------------------------------- */

const PARTNER_STATUSES: { key: Partner['status']; label: string }[] = [
  { key: 'active', label: 'Active' },
  { key: 'review', label: 'In review' },
  { key: 'paused', label: 'Paused' },
];

export function EditPartnerSheet({
  visible,
  onClose,
  partner,
}: {
  visible: boolean;
  onClose: () => void;
  partner: Partner | null;
}) {
  const t = useTheme();
  const { updatePartner, removePartner } = useStore();
  const [name, setName] = useState('');
  const [region, setRegion] = useState('');
  const [contact, setContact] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [share, setShare] = useState('');
  const [revenue, setRevenue] = useState('');
  const [status, setStatus] = useState<Partner['status']>('active');
  const [error, setError] = useState<string | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (visible && partner) {
      setName(partner.name);
      setRegion(partner.region || '');
      setContact(partner.contact || '');
      setPhone(partner.phone || '');
      setEmail(partner.email || '');
      setShare(String(partner.share));
      setRevenue(String(partner.revenue));
      setStatus(partner.status);
      setError(undefined);
      setConfirmDelete(false);
    }
  }, [visible, partner?.id]);

  if (!partner) return null;

  const save = () => {
    const shareValue = parseAmount(share);
    const revenueValue = parseAmount(revenue);
    if (name.trim().length < 2) return setError('Enter the partner name');
    if (shareValue <= 0 || shareValue > 100) return setError('Enter a share between 1 and 100');
    if (email.trim() && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return setError('Enter a valid email address');
    updatePartner(partner.id, { name, region, contact, phone, email, share: shareValue, revenue: revenueValue, status });
    onClose();
  };

  const del = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    removePartner(partner.id);
    onClose();
  };

  return (
    <Sheet visible={visible} onClose={onClose} title="Edit partner" subtitle="Update the split, status or details">
      <View style={{ gap: 16 }}>
        {/* Status pills */}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {PARTNER_STATUSES.map(({ key, label }) => {
            const active = status === key;
            return (
              <PressableScale
                key={key}
                onPress={() => setStatus(key)}
                scaleTo={0.96}
                style={{
                  flex: 1,
                  paddingVertical: 10,
                  borderRadius: t.radius.md,
                  alignItems: 'center',
                  backgroundColor: active ? t.colors.accentSoft : t.colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: active ? t.colors.accent : 'transparent',
                }}
              >
                <Text variant="bodySm" weight={active ? 'semibold' : 'regular'} tone={active ? 'accent' : 'muted'}>
                  {label}
                </Text>
              </PressableScale>
            );
          })}
        </View>
        <Field label="Partner / firm name *" icon={Building2} value={name} onChangeText={setName} placeholder="e.g. Crescent Capital" />
        <Field label="Contact person" icon={User} value={contact} onChangeText={setContact} placeholder="e.g. Imran Sheikh" />
        <Field label="Region" icon={MapPin} value={region} onChangeText={setRegion} placeholder="e.g. EMEA" />
        <Field label="Phone number" icon={Phone} value={phone} onChangeText={setPhone} placeholder="e.g. 0300 1234567" keyboardType="phone-pad" />
        <Field label="Email (optional)" icon={Mail} value={email} onChangeText={setEmail} placeholder="e.g. imran@crescent.com" keyboardType="email-address" autoCapitalize="none" />
        <Field label="Revenue share (%)" icon={Percent} value={share} onChangeText={setShare} placeholder="0" keyboardType="numeric" />
        <Field label={`Revenue contribution (${currencySymbol()})`} icon={Hash} value={revenue} onChangeText={setRevenue} placeholder="0" keyboardType="numeric" />
        {error && (
          <Text variant="caption" tone="danger" weight="medium">
            {error}
          </Text>
        )}
        <Button label="Save changes" onPress={save} nativeID="save-partner-edit" />
        <Button
          label={confirmDelete ? 'Tap again to remove partner' : 'Remove partner'}
          variant="danger"
          icon={Trash2}
          onPress={del}
          nativeID="delete-partner"
        />
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
  const { incrementSalary, removeEmployee, updateEmployee } = useStore();
  const [amount, setAmount] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [dept, setDept] = useState('');
  const [salary, setSalary] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [confirmRemove, setConfirmRemove] = useState(false);

  useEffect(() => {
    if (visible && employee) {
      setAmount('');
      setName(employee.name);
      setRole(employee.role);
      setDept(employee.dept);
      setSalary(String(employee.salary));
      setError(undefined);
      setConfirmRemove(false);
    }
  }, [visible, employee?.id]);

  if (!employee) return null;

  const saveProfile = () => {
    const salaryValue = parseAmount(salary);
    if (name.trim().length < 2) return setError('Enter the employee name');
    if (salaryValue <= 0) return setError('Enter a monthly salary greater than 0');
    updateEmployee(employee.id, { name, role, dept, salary: salaryValue });
    onClose();
  };

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

        {/* Edit profile - name / role / dept / salary (full set, can go down) */}
        <View style={{ gap: 12 }}>
          <Field label="Full name" icon={User} value={name} onChangeText={setName} placeholder="e.g. Sara Ahmed" />
          <Field label="Role" icon={Briefcase} value={role} onChangeText={setRole} placeholder="e.g. Backend Engineer" />
          <Field label="Department" icon={Users2} value={dept} onChangeText={setDept} placeholder="e.g. Engineering" />
          <Field label={`Monthly salary (${currencySymbol()})`} icon={Hash} value={salary} onChangeText={setSalary} placeholder="0" keyboardType="numeric" />
          <Button label="Save changes" variant="secondary" onPress={saveProfile} nativeID="save-employee-edit" />
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

/* -------------------------------------------------------------------------- */

const REMINDER_DAYS = [
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'Next week', days: 7 },
  { label: 'In 2 weeks', days: 14 },
];

const REMINDER_TIMES = [
  { label: 'Morning', hour: 10 },
  { label: 'Afternoon', hour: 15 },
  { label: 'Evening', hour: 19 },
];

/** "This customer will pay on <date>" - schedules local notifications too. */
export function ReminderSheet({
  visible,
  onClose,
  customerId,
  customerName,
}: {
  visible: boolean;
  onClose: () => void;
  customerId: string;
  customerName: string;
}) {
  const t = useTheme();
  const { addReminder } = useStore();
  const [days, setDays] = useState(1);
  const [customDays, setCustomDays] = useState('');
  const [hour, setHour] = useState(10);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (visible) {
      setDays(1);
      setCustomDays('');
      setHour(10);
      setNote('');
    }
  }, [visible]);

  const effectiveDays = customDays.trim() ? Math.max(1, Math.round(parseAmount(customDays))) : days;
  const due = new Date();
  due.setDate(due.getDate() + effectiveDays);
  due.setHours(hour, 0, 0, 0);

  const save = () => {
    const iso = due.toISOString();
    addReminder(customerId, iso, note.trim() || undefined);
    void scheduleReminderNotifications(customerName, iso);
    onClose();
  };

  const pill = (active: boolean, label: string, onPress: () => void, key: string) => (
    <PressableScale
      key={key}
      onPress={onPress}
      scaleTo={0.96}
      style={{
        paddingHorizontal: 13,
        paddingVertical: 9,
        borderRadius: 999,
        backgroundColor: active ? t.colors.accentSoft : t.colors.surfaceAlt,
        borderWidth: 1,
        borderColor: active ? t.colors.accent : 'transparent',
      }}
    >
      <Text variant="bodySm" weight={active ? 'semibold' : 'regular'} tone={active ? 'accent' : 'muted'}>
        {label}
      </Text>
    </PressableScale>
  );

  return (
    <Sheet visible={visible} onClose={onClose} title="Set payment reminder" subtitle={`When will ${customerName} pay?`}>
      <View style={{ gap: 16 }}>
        <View style={{ gap: 8 }}>
          <Text variant="bodySm" weight="medium" tone="muted">
            Day
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {REMINDER_DAYS.map((d) =>
              pill(!customDays.trim() && days === d.days, d.label, () => {
                setDays(d.days);
                setCustomDays('');
              }, `d-${d.days}`),
            )}
          </View>
          <Field
            label="Or after how many days?"
            icon={Hash}
            value={customDays}
            onChangeText={setCustomDays}
            placeholder="e.g. 10"
            keyboardType="numeric"
          />
        </View>

        <View style={{ gap: 8 }}>
          <Text variant="bodySm" weight="medium" tone="muted">
            Time
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {REMINDER_TIMES.map((tm) => pill(hour === tm.hour, `${tm.label} ${tm.hour > 12 ? tm.hour - 12 : tm.hour}${tm.hour >= 12 ? 'pm' : 'am'}`, () => setHour(tm.hour), `t-${tm.hour}`))}
          </View>
        </View>

        <Field label="Note (optional)" icon={FileText} value={note} onChangeText={setNote} placeholder="e.g. Promised after Eid" />

        <View style={{ backgroundColor: t.colors.accentSoft, borderRadius: t.radius.md, padding: 12, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <BellRing size={16} color={t.colors.accent} strokeWidth={2.2} />
          <Text variant="caption" tone="accent" weight="medium" style={{ flex: 1 }}>
            Due {formatDate(due.toISOString())} around {hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'pm' : 'am'}. You will be notified a day before and on the day.
          </Text>
        </View>

        <Button label="Save reminder" icon={BellRing} onPress={save} nativeID="save-reminder" />
      </View>
    </Sheet>
  );
}
