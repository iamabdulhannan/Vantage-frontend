import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import {
  customers as seedCustomers,
  expenseBreakdown as seedExpenses,
  employees as seedEmployees,
  partners as seedPartners,
  recentActivity as seedActivity,
  EXPENSE_COLORS,
  Customer,
  LedgerEntry,
  ExpenseSlice,
  Employee,
  Partner,
} from './mock';
import { useAuth } from '@/auth/AuthContext';
import { api, isApiEnabled, getToken } from '@/api/client';

/** Map an API customer (entries with kind/amount) to the local Customer shape. */
function mapApiCustomer(c: any): Customer {
  const ledger: LedgerEntry[] = (c.entries ?? []).map((e: any) => ({
    id: e.id,
    date: String(e.date).slice(0, 10),
    memo: e.memo,
    type: e.kind === 'gave' ? 'invoice' : 'payment',
    debit: e.kind === 'gave' ? Number(e.amount) : 0,
    credit: e.kind === 'got' ? Number(e.amount) : 0,
    balance: 0,
  }));
  return recalc({
    id: c.id,
    name: c.name,
    company: c.business ?? '',
    phone: c.phone ?? undefined,
    email: c.email ?? undefined,
    initials: c.initials,
    balance: 0,
    status: 'settled',
    lastActivity: c.lastActivity ? String(c.lastActivity).slice(0, 10) : new Date().toISOString().slice(0, 10),
    ledger,
  });
}

/** Fire an API mutation only when a live session exists; never throws. */
function sync(fn: () => Promise<unknown>) {
  if (isApiEnabled() && getToken()) fn().catch(() => {});
}

export interface ActivityItem {
  id: string;
  who: string;
  what: string;
  amount: number;
  type: 'invoice' | 'payment';
  when: string; // ISO timestamp
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

/** Recompute running balance for each entry + the customer's net balance/status. */
function recalc(customer: Customer): Customer {
  let bal = 0;
  const ledger = customer.ledger.map((e) => {
    bal += e.debit - e.credit;
    return { ...e, balance: bal };
  });
  const balance = bal;
  // balance > 0 => customer owes us; balance < 0 => we hold their advance.
  const status: Customer['status'] = balance === 0 ? 'settled' : balance > 0 ? 'current' : 'overdue';
  return { ...customer, ledger, balance, status };
}

interface StoreValue {
  customers: Customer[];
  expenses: ExpenseSlice[];
  employees: Employee[];
  partners: Partner[];
  activity: ActivityItem[];
  /** Payments received via the khata book this session — feeds live revenue. */
  receipts: number;
  addCustomer: (input: {
    name: string;
    company: string;
    phone?: string;
    email?: string;
    openingBalance?: number;
    openingKind?: 'get' | 'give';
  }) => string;
  addEntry: (customerId: string, input: { kind: 'gave' | 'got'; amount: number; memo: string }) => void;
  addExpense: (input: { label: string; value: number }) => void;
  addEmployee: (input: { name: string; role: string; dept: string; salary: number }) => void;
  /** Permanently remove an employee from payroll (super-admin action). */
  removeEmployee: (id: string) => void;
  /** Raise an employee's monthly salary by `amount`; resets them to pending. */
  incrementSalary: (id: string, amount: number) => void;
  addPartner: (input: {
    name: string;
    region: string;
    share: number;
    revenue: number;
    contact?: string;
    phone?: string;
    email?: string;
  }) => void;
  /** Disburse every pending salary; returns the amount paid out. */
  runPayroll: () => number;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>(() => seedCustomers.map((c) => recalc(c)));
  const [expenses, setExpenses] = useState<ExpenseSlice[]>(() => seedExpenses.map((e) => ({ ...e })));
  const [employees, setEmployees] = useState<Employee[]>(() => seedEmployees.map((e) => ({ ...e })));
  const [partners, setPartners] = useState<Partner[]>(() => seedPartners.map((p) => ({ ...p })));
  const [activity, setActivity] = useState<ActivityItem[]>(() => seedActivity.map((a) => ({ ...a })));
  const [receipts, setReceipts] = useState(0);

  const { token } = useAuth();

  // When a live session signs in, replace the seed data with the company's real data.
  useEffect(() => {
    if (!token || !isApiEnabled()) return;
    let cancelled = false;
    (async () => {
      try {
        const [cs, ex, pr, em]: any[] = await Promise.all([
          api.customers.list(),
          api.expenses.list(),
          api.partners.list(),
          api.employees.list(),
        ]);
        if (cancelled) return;
        setCustomers((cs.customers ?? []).map(mapApiCustomer));
        setExpenses((ex.expenses ?? []).map((e: any) => ({ label: e.label, value: Number(e.value), color: e.color })));
        setPartners(
          (pr.partners ?? []).map((p: any) => ({
            id: p.id,
            name: p.name,
            region: p.region,
            contact: p.contact ?? undefined,
            phone: p.phone ?? undefined,
            email: p.email ?? undefined,
            share: p.share,
            revenue: Number(p.revenue),
            delta: p.delta ?? 0,
            status: p.status,
          })),
        );
        setEmployees(
          (em.employees ?? []).map((e: any) => ({
            id: e.id,
            name: e.name,
            role: e.role,
            dept: e.dept,
            initials: e.initials,
            salary: Number(e.salary),
            status: e.status,
          })),
        );
        setActivity([]);
        setReceipts(0);
      } catch {
        // Keep the seed/local data if the API is unreachable.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const logActivity = useCallback((item: Omit<ActivityItem, 'id' | 'when'>) => {
    setActivity((prev) => [{ id: `act${Date.now()}`, when: nowISO(), ...item }, ...prev]);
  }, []);

  const addCustomer = useCallback(
    (input: {
      name: string;
      company: string;
      phone?: string;
      email?: string;
      openingBalance?: number;
      openingKind?: 'get' | 'give';
    }) => {
      const id = `c${Date.now()}`;
      const opening = input.openingBalance && input.openingBalance > 0 ? input.openingBalance : 0;
      // "get" => customer owes us (a debit/you-gave); "give" => we hold their advance (a credit/you-got).
      const ledger: LedgerEntry[] = opening
        ? [
            {
              id: `e${Date.now()}`,
              date: todayISO(),
              memo: 'Opening balance',
              type: input.openingKind === 'give' ? 'payment' : 'invoice',
              debit: input.openingKind === 'give' ? 0 : opening,
              credit: input.openingKind === 'give' ? opening : 0,
              balance: 0,
            },
          ]
        : [];
      const next: Customer = recalc({
        id,
        name: input.name.trim(),
        company: input.company.trim(),
        phone: input.phone?.trim() || undefined,
        email: input.email?.trim() || undefined,
        initials: initialsFrom(input.name),
        balance: 0,
        status: 'settled',
        lastActivity: todayISO(),
        ledger,
      });
      setCustomers((prev) => [next, ...prev]);
      sync(() =>
        api.customers.create({
          name: input.name,
          business: input.company,
          phone: input.phone,
          email: input.email,
          openingBalance: opening || undefined,
          openingKind: input.openingKind,
        }),
      );
      return id;
    },
    []
  );

  const addEntry = useCallback(
    (customerId: string, input: { kind: 'gave' | 'got'; amount: number; memo: string }) => {
      const gave = input.kind === 'gave';
      let who = '';
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id !== customerId) return c;
          who = c.name;
          const entry: LedgerEntry = {
            id: `e${Date.now()}`,
            date: todayISO(),
            memo: input.memo.trim() || (gave ? 'You gave' : 'You got'),
            type: gave ? 'invoice' : 'payment',
            debit: gave ? input.amount : 0,
            credit: gave ? 0 : input.amount,
            balance: 0,
          };
          return recalc({ ...c, lastActivity: todayISO(), ledger: [...c.ledger, entry] });
        })
      );
      // A "got" entry is a payment received — count it toward live revenue.
      if (!gave) setReceipts((r) => r + input.amount);
      sync(() => api.customers.addEntry(customerId, { kind: input.kind, amount: input.amount, memo: input.memo }));
      logActivity({
        who: who || 'Customer',
        what: gave ? (input.memo.trim() || 'Credit extended') : 'Payment received',
        amount: input.amount,
        type: gave ? 'invoice' : 'payment',
      });
    },
    [logActivity]
  );

  const addExpense = useCallback(
    (input: { label: string; value: number }) => {
      setExpenses((prev) => {
        const color = EXPENSE_COLORS[prev.length % EXPENSE_COLORS.length];
        return [...prev, { label: input.label.trim(), value: input.value, color }];
      });
      sync(() => api.expenses.create({ label: input.label, value: input.value }));
      logActivity({ who: input.label.trim(), what: 'Expense recorded', amount: input.value, type: 'invoice' });
    },
    [logActivity]
  );

  const runPayroll = useCallback(() => {
    let disbursed = 0;
    setEmployees((prev) => {
      disbursed = prev.filter((e) => e.status === 'pending').reduce((s, e) => s + e.salary, 0);
      return prev.map((e) => (e.status === 'pending' ? { ...e, status: 'paid' } : e));
    });
    if (disbursed > 0) {
      logActivity({ who: 'Payroll', what: 'Salaries disbursed', amount: disbursed, type: 'payment' });
    }
    sync(() => api.employees.runPayroll());
    return disbursed;
  }, [logActivity]);

  const addEmployee = useCallback((input: { name: string; role: string; dept: string; salary: number }) => {
    const employee: Employee = {
      id: `emp${Date.now()}`,
      name: input.name.trim(),
      role: input.role.trim() || 'Team member',
      dept: input.dept.trim() || 'General',
      initials: initialsFrom(input.name),
      salary: input.salary,
      status: 'pending',
    };
    setEmployees((prev) => [...prev, employee]);
    sync(() => api.employees.create({ name: input.name, role: input.role, dept: input.dept, salary: input.salary }));
  }, []);

  const removeEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    sync(() => api.employees.remove(id));
  }, []);

  const incrementSalary = useCallback(
    (id: string, amount: number) => {
      let who = '';
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          who = e.name;
          // A raise means a fresh amount is now owed → back to pending until run.
          return { ...e, salary: e.salary + amount, status: 'pending' };
        })
      );
      if (amount > 0 && who) {
        logActivity({ who, what: 'Salary increment', amount, type: 'invoice' });
      }
      sync(() => api.employees.increment(id, amount));
    },
    [logActivity]
  );

  const addPartner = useCallback(
    (input: { name: string; region: string; share: number; revenue: number; contact?: string; phone?: string; email?: string }) => {
      const partner: Partner = {
        id: `p${Date.now()}`,
        name: input.name.trim(),
        region: input.region.trim() || 'Global',
        contact: input.contact?.trim() || undefined,
        phone: input.phone?.trim() || undefined,
        email: input.email?.trim() || undefined,
        share: input.share,
        revenue: input.revenue,
        delta: 0,
        status: 'active',
      };
      setPartners((prev) => [...prev, partner]);
      sync(() =>
        api.partners.create({
          name: input.name,
          region: input.region,
          share: input.share,
          revenue: input.revenue,
          contact: input.contact,
          phone: input.phone,
          email: input.email,
        }),
      );
    },
    []
  );

  const value = useMemo<StoreValue>(
    () => ({
      customers,
      expenses,
      employees,
      partners,
      activity,
      receipts,
      addCustomer,
      addEntry,
      addExpense,
      addEmployee,
      removeEmployee,
      incrementSalary,
      addPartner,
      runPayroll,
    }),
    [
      customers,
      expenses,
      employees,
      partners,
      activity,
      receipts,
      addCustomer,
      addEntry,
      addExpense,
      addEmployee,
      removeEmployee,
      incrementSalary,
      addPartner,
      runPayroll,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
