/** Mock financial data for the Vantage prototype. */

export interface Kpi {
  key: string;
  label: string;
  value: number;
  delta: number; // % change vs previous period
  spark: number[];
  intent: 'accent' | 'success' | 'danger' | 'warning';
}

export interface SeriesPoint {
  label: string;
  revenue: number;
  expense: number;
}

export interface ExpenseSlice {
  id?: string;
  label: string;
  value: number;
  color: string;
  note?: string;
  date?: string;
}

export interface Partner {
  id: string;
  name: string;
  region: string;
  contact?: string; // primary contact person
  phone?: string;
  email?: string;
  share: number; // % ownership / revenue share
  revenue: number;
  delta: number;
  status: 'active' | 'review' | 'paused';
}

export interface Reminder {
  id: string;
  dueAt: string; // ISO
  note?: string;
  status: 'pending' | 'kept' | 'missed' | 'rescheduled';
}

export interface Reliability {
  label: string;
  kept: number;
  missed: number;
  rescheduled: number;
}

export interface LedgerEntry {
  id: string;
  date: string;
  memo: string;
  type: 'invoice' | 'payment' | 'credit' | 'refund';
  debit: number;
  credit: number;
  balance: number;
}

export interface Customer {
  id: string;
  name: string;
  company: string;
  phone?: string;
  email?: string;
  initials: string;
  balance: number; // outstanding (positive = owes us)
  status: 'current' | 'overdue' | 'settled';
  lastActivity: string;
  ledger: LedgerEntry[];
  reminders?: Reminder[];
  reliability?: Reliability;
}

export const company = {
  name: 'Northwind Holdings',
  tagline: 'Consolidated · USD',
  fiscalYear: 'FY 2026',
};

export const kpis: Kpi[] = [
  {
    key: 'revenue',
    label: 'Total Revenue',
    value: 4_820_500,
    delta: 12.4,
    intent: 'accent',
    spark: [38, 41, 39, 46, 50, 48, 55, 59, 57, 64, 68, 72],
  },
  {
    key: 'capital',
    label: 'Working Capital',
    value: 2_140_000,
    delta: 5.8,
    intent: 'success',
    spark: [50, 52, 51, 54, 53, 56, 58, 57, 60, 62, 61, 64],
  },
  {
    key: 'expenses',
    label: 'Total Expenses',
    value: 2_956_300,
    delta: 3.2,
    intent: 'warning',
    spark: [30, 32, 31, 35, 34, 36, 38, 37, 40, 41, 43, 44],
  },
  {
    key: 'profit',
    label: 'Net Profit',
    value: 1_864_200,
    delta: 18.6,
    intent: 'success',
    spark: [20, 24, 22, 28, 31, 29, 35, 40, 38, 45, 49, 54],
  },
];

export const monthlySeries: SeriesPoint[] = [
  { label: 'Jul', revenue: 320, expense: 210 },
  { label: 'Aug', revenue: 342, expense: 224 },
  { label: 'Sep', revenue: 358, expense: 231 },
  { label: 'Oct', revenue: 401, expense: 246 },
  { label: 'Nov', revenue: 437, expense: 252 },
  { label: 'Dec', revenue: 472, expense: 268 },
  { label: 'Jan', revenue: 455, expense: 261 },
  { label: 'Feb', revenue: 498, expense: 274 },
  { label: 'Mar', revenue: 531, expense: 281 },
  { label: 'Apr', revenue: 564, expense: 293 },
  { label: 'May', revenue: 602, expense: 304 },
  { label: 'Jun', revenue: 648, expense: 312 },
];

export const expenseBreakdown: ExpenseSlice[] = [
  { label: 'Payroll', value: 1_320_000, color: '#4F46E5' },
  { label: 'Operations', value: 642_000, color: '#6366F1' },
  { label: 'Marketing', value: 458_000, color: '#818CF8' },
  { label: 'R&D', value: 326_300, color: '#06B6D4' },
  { label: 'Facilities', value: 210_000, color: '#22D3EE' },
];

// Palette ramp for dynamically-added expense categories.
export const EXPENSE_COLORS = ['#4F46E5', '#6366F1', '#818CF8', '#06B6D4', '#22D3EE', '#A5B4FC', '#67E8F9'];

export const partners: Partner[] = [
  { id: 'p1', name: 'Meridian Capital', region: 'North America', share: 32, revenue: 1_542_000, delta: 9.1, status: 'active' },
  { id: 'p2', name: 'Aurora Ventures', region: 'EMEA', share: 24, revenue: 1_156_900, delta: 14.7, status: 'active' },
  { id: 'p3', name: 'Pacific Synergy', region: 'APAC', share: 18, revenue: 867_700, delta: -2.3, status: 'review' },
  { id: 'p4', name: 'Summit Partners', region: 'LATAM', share: 14, revenue: 674_800, delta: 6.4, status: 'active' },
  { id: 'p5', name: 'Helix Group', region: 'North America', share: 12, revenue: 578_400, delta: 1.2, status: 'paused' },
];

function entries(seed: { date: string; memo: string; type: LedgerEntry['type']; debit: number; credit: number }[]): LedgerEntry[] {
  let bal = 0;
  return seed.map((e, i) => {
    bal += e.debit - e.credit;
    return { id: `e${i}`, balance: bal, ...e };
  });
}

export const customers: Customer[] = [
  {
    id: 'c1',
    name: 'Elena Russo',
    company: 'Vertex Logistics',
    initials: 'VL',
    balance: 18_450,
    status: 'overdue',
    lastActivity: '2026-06-18',
    ledger: entries([
      { date: '2026-04-02', memo: 'Invoice #1042 - Q2 services', type: 'invoice', debit: 24_000, credit: 0 },
      { date: '2026-04-20', memo: 'Payment received - ACH', type: 'payment', debit: 0, credit: 12_000 },
      { date: '2026-05-11', memo: 'Invoice #1088 - freight', type: 'invoice', debit: 9_450, credit: 0 },
      { date: '2026-05-30', memo: 'Credit note - adjustment', type: 'credit', debit: 0, credit: 3_000 },
    ]),
  },
  {
    id: 'c2',
    name: 'Marcus Chen',
    company: 'Brightline Media',
    initials: 'BM',
    balance: 0,
    status: 'settled',
    lastActivity: '2026-06-12',
    ledger: entries([
      { date: '2026-03-15', memo: 'Invoice #0991 - campaign', type: 'invoice', debit: 31_000, credit: 0 },
      { date: '2026-04-01', memo: 'Payment received - wire', type: 'payment', debit: 0, credit: 31_000 },
    ]),
  },
  {
    id: 'c3',
    name: 'Sofia Almeida',
    company: 'Orbital Foods',
    initials: 'OF',
    balance: 7_200,
    status: 'current',
    lastActivity: '2026-06-20',
    ledger: entries([
      { date: '2026-05-05', memo: 'Invoice #1101 - supply', type: 'invoice', debit: 14_200, credit: 0 },
      { date: '2026-06-01', memo: 'Payment received - card', type: 'payment', debit: 0, credit: 7_000 },
    ]),
  },
  {
    id: 'c4',
    name: 'David Okafor',
    company: 'Nimbus Cloud',
    initials: 'NC',
    balance: 42_800,
    status: 'overdue',
    lastActivity: '2026-06-09',
    ledger: entries([
      { date: '2026-02-18', memo: 'Invoice #0934 - annual license', type: 'invoice', debit: 60_000, credit: 0 },
      { date: '2026-03-22', memo: 'Payment received - wire', type: 'payment', debit: 0, credit: 17_200 },
    ]),
  },
  {
    id: 'c5',
    name: 'Priya Nair',
    company: 'Cobalt Retail',
    initials: 'CR',
    balance: 3_150,
    status: 'current',
    lastActivity: '2026-06-21',
    ledger: entries([
      { date: '2026-06-02', memo: 'Invoice #1140 - POS units', type: 'invoice', debit: 8_150, credit: 0 },
      { date: '2026-06-15', memo: 'Payment received - ACH', type: 'payment', debit: 0, credit: 5_000 },
    ]),
  },
  {
    id: 'c6',
    name: 'Liam Walsh',
    company: 'Granite Build',
    initials: 'GB',
    balance: -5_000,
    status: 'settled',
    lastActivity: '2026-05-28',
    ledger: entries([
      { date: '2026-04-10', memo: 'Materials supplied on credit', type: 'invoice', debit: 22_500, credit: 0 },
      { date: '2026-05-02', memo: 'Payment received - wire', type: 'payment', debit: 0, credit: 22_500 },
      { date: '2026-05-20', memo: 'Advance for next order', type: 'payment', debit: 0, credit: 5_000 },
    ]),
  },
];

export const recentActivity = [
  { id: 'a1', who: 'Vertex Logistics', what: 'Invoice #1088 issued', amount: 9_450, type: 'invoice' as const, when: '2026-06-21T09:12:00' },
  { id: 'a2', who: 'Cobalt Retail', what: 'Payment received', amount: 5_000, type: 'payment' as const, when: '2026-06-21T08:40:00' },
  { id: 'a3', who: 'Aurora Ventures', what: 'Partner distribution', amount: 84_000, type: 'payment' as const, when: '2026-06-20T17:05:00' },
  { id: 'a4', who: 'Orbital Foods', what: 'Payment received', amount: 7_000, type: 'payment' as const, when: '2026-06-20T14:22:00' },
  { id: 'a5', who: 'Nimbus Cloud', what: 'Invoice overdue', amount: 42_800, type: 'invoice' as const, when: '2026-06-19T11:00:00' },
];

export const currentUser = {
  name: 'Alex Mercer',
  role: 'Founder & CEO',
  email: 'alex@northwind.io',
  initials: 'AM',
};

// ---------------------------------------------------------------------------
// Payroll
// ---------------------------------------------------------------------------
export interface Employee {
  id: string;
  name: string;
  role: string;
  dept: string;
  initials: string;
  salary: number; // gross monthly
  status: 'paid' | 'pending';
}

export const employees: Employee[] = [
  { id: 'e1', name: 'Maya Thomas', role: 'VP Engineering', dept: 'Engineering', initials: 'MT', salary: 18_500, status: 'paid' },
  { id: 'e2', name: 'Daniel Cruz', role: 'Head of Sales', dept: 'Sales', initials: 'DC', salary: 16_200, status: 'paid' },
  { id: 'e3', name: 'Aisha Khan', role: 'Finance Lead', dept: 'Finance', initials: 'AK', salary: 14_800, status: 'paid' },
  { id: 'e4', name: 'Tomás Silva', role: 'Senior Designer', dept: 'Product', initials: 'TS', salary: 11_400, status: 'pending' },
  { id: 'e5', name: 'Grace Liu', role: 'Backend Engineer', dept: 'Engineering', initials: 'GL', salary: 12_600, status: 'pending' },
  { id: 'e6', name: 'Omar Farooq', role: 'Account Manager', dept: 'Sales', initials: 'OF', salary: 9_300, status: 'pending' },
  { id: 'e7', name: 'Nadia Reyes', role: 'People Ops', dept: 'Operations', initials: 'NR', salary: 8_700, status: 'paid' },
  { id: 'e8', name: 'Victor Hsu', role: 'Data Analyst', dept: 'Engineering', initials: 'VH', salary: 10_100, status: 'pending' },
];

import { taxRuleFor } from '@/utils/salary-tax';

export function computePayroll(list: Employee[] = employees, country?: string | null, currencyCode?: string | null) {
  const rule = taxRuleFor(country, currencyCode);
  const gross = list.reduce((s, e) => s + e.salary, 0);
  // Progressive slabs are per-person - each salary is taxed in its own bracket.
  const tax = list.reduce((s, e) => s + rule.monthlyTax(e.salary), 0);
  const net = gross - tax;
  const paid = list.filter((e) => e.status === 'paid');
  const pending = list.filter((e) => e.status === 'pending');
  const paidAmount = paid.reduce((s, e) => s + e.salary, 0);
  const pendingAmount = pending.reduce((s, e) => s + e.salary, 0);
  return {
    gross,
    tax,
    net,
    taxRule: rule.name,
    effectiveRate: gross ? tax / gross : 0,
    headcount: list.length,
    paidCount: paid.length,
    pendingCount: pending.length,
    paidAmount,
    pendingAmount,
    paidRatio: gross ? paidAmount / gross : 0,
    nextPayday: '2026-06-30',
  };
}
