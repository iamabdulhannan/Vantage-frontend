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
  Reminder,
  ExpenseSlice,
  Employee,
  Partner,
} from './mock';
import { useAuth } from '@/auth/AuthContext';
import { api, isApiEnabled, getToken } from '@/api/client';
import { toast } from '@/components/Toast';

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
    reminders: (c.reminders ?? []).map((r: any) => ({
      id: r.id,
      dueAt: String(r.dueAt),
      note: r.note ?? undefined,
      status: r.status,
    })),
    reliability: c.reliability,
  });
}

/** Fire an API mutation only when a live session exists; never throws. */
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
  /** Payments received via the khata book this session - feeds live revenue. */
  receipts: number;
  addCustomer: (input: {
    name: string;
    company: string;
    phone?: string;
    email?: string;
    openingBalance?: number;
    openingKind?: 'get' | 'give';
  }) => string;
  /** Edit a customer's profile (name / business / phone / email). */
  updateCustomer: (id: string, patch: { name?: string; company?: string; phone?: string; email?: string }) => void;
  /** Delete a customer and their whole ledger. */
  removeCustomer: (id: string) => void;
  addEntry: (customerId: string, input: { kind: 'gave' | 'got'; amount: number; memo: string }) => void;
  /** Edit an existing ledger entry. */
  updateEntry: (customerId: string, entryId: string, input: { kind?: 'gave' | 'got'; amount?: number; memo?: string }) => void;
  /** Delete a ledger entry. */
  removeEntry: (customerId: string, entryId: string) => void;
  /** Set a collection promise ("will pay on <date>"); reschedules any open one. */
  addReminder: (customerId: string, dueAtISO: string, note?: string) => void;
  /** Mark a promise kept / missed. */
  setReminderStatus: (customerId: string, reminderId: string, status: 'kept' | 'missed') => void;
  addExpense: (input: { label: string; value: number; note?: string }) => void;
  /** Edit an expense (category / amount / note). */
  updateExpense: (id: string, patch: { label?: string; value?: number; note?: string }) => void;
  /** Delete an expense record. */
  removeExpense: (id: string) => void;
  addEmployee: (input: { name: string; role: string; dept: string; salary: number }) => void;
  /** Edit an employee's profile (name / role / dept / salary - full set). */
  updateEmployee: (id: string, patch: { name?: string; role?: string; dept?: string; salary?: number }) => void;
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
  /** Edit a partner (profile / share / revenue / status). */
  updatePartner: (id: string, patch: Partial<Omit<Partner, 'id' | 'delta'>>) => void;
  /** Remove a partner from the split. */
  removePartner: (id: string) => void;
  /** Disburse every pending salary; returns the amount paid out. */
  runPayroll: () => number;
  /** Re-pull all data from the API (real-time refresh). */
  refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  // With a live API the app must NEVER show demo data - an expired session or
  // failed refresh should show empty state, not fake customers and revenue.
  const live = isApiEnabled();
  const [customers, setCustomers] = useState<Customer[]>(() => (live ? [] : seedCustomers.map((c) => recalc(c))));
  const [expenses, setExpenses] = useState<ExpenseSlice[]>(() =>
    live ? [] : seedExpenses.map((e, i) => ({ ...e, id: `seed-exp-${i}` })),
  );
  const [employees, setEmployees] = useState<Employee[]>(() => (live ? [] : seedEmployees.map((e) => ({ ...e }))));
  const [partners, setPartners] = useState<Partner[]>(() => (live ? [] : seedPartners.map((p) => ({ ...p }))));
  const [activity, setActivity] = useState<ActivityItem[]>(() => (live ? [] : seedActivity.map((a) => ({ ...a }))));
  const [receipts, setReceipts] = useState(0);

  const { token } = useAuth();

  /** Pull the company's live data from the API and replace local state. */
  const refresh = useCallback(async () => {
    if (!isApiEnabled() || !getToken()) return;
    try {
      const [cs, ex, pr, em]: any[] = await Promise.all([
        api.customers.list(),
        api.expenses.list(),
        api.partners.list(),
        api.employees.list(),
      ]);
      setCustomers((cs.customers ?? []).map(mapApiCustomer));
      setExpenses(
        (ex.expenses ?? []).map((e: any) => ({
          id: e.id,
          label: e.label,
          value: Number(e.value),
          color: e.color,
          note: e.note ?? undefined,
          date: e.date ? String(e.date).slice(0, 10) : undefined,
        })),
      );
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
    } catch {
      // Keep current data if the API is briefly unreachable.
    }
  }, []);

  // Fire a mutation, then re-pull from the DB so optimistic temp-id rows are replaced by the
  // real server records (correct ids + server-computed balances). Keeps the UI truthful in
  // real time and prevents follow-up edits/deletes from hitting a stale temp id (→ 404, lost).
  const syncThenRefresh = useCallback(
    (fn: () => Promise<unknown>) => {
      if (isApiEnabled() && getToken()) {
        fn()
          .then(() => refresh())
          .catch((e) => {
            console.warn('[store] mutation failed to persist', e);
            toast.error(e?.message || 'Could not save your change - check your connection and try again.');
            // Re-pull so the optimistic UI rolls back to the server's truth.
            refresh();
          });
      }
    },
    [refresh],
  );

  // Replace seed data with real data when a live session signs in.
  useEffect(() => {
    if (token && isApiEnabled()) {
      setActivity([]);
      setReceipts(0);
      refresh();
    }
  }, [token, refresh]);

  const logActivity = useCallback((item: Omit<ActivityItem, 'id' | 'when'>) => {
    setActivity((prev) => [{ id: `act${Date.now()}`, when: nowISO(), ...item }, ...prev]);
  }, []);

  const addCustomer = useCallback(
    (input: {
      name: string;
      company: string;
      phone?: string;
      email?: string;
    }) => {
      const id = `c${Date.now()}`;
      // DigiKhata-style: a customer starts with a clean ledger (zero balance).
      // The balance builds purely from real You Gave / You Got entries added later.
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
        ledger: [],
      });
      setCustomers((prev) => [next, ...prev]);
      // Persist to the DB, then re-pull so the optimistic temp-id row is replaced by the
      // real server row (real customer id + entry ids). Without this, adding an entry to a
      // freshly-created customer would hit /customers/<tempId>/entries → 404 and be lost.
      if (isApiEnabled() && getToken()) {
        api.customers
          .create({
            name: input.name.trim(),
            business: input.company?.trim() || undefined,
            phone: input.phone?.trim() || undefined,
            email: input.email?.trim() || undefined,
          })
          .then(() => refresh())
          .catch((e) => {
            console.warn('[store] addCustomer failed to persist', e);
            toast.error(e?.message || 'Could not save the customer - check your connection and try again.');
            refresh();
          });
      }
      return id;
    },
    [refresh]
  );

  const updateCustomer = useCallback(
    (id: string, patch: { name?: string; company?: string; phone?: string; email?: string }) => {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id !== id
            ? c
            : {
                ...c,
                name: patch.name?.trim() || c.name,
                company: patch.company !== undefined ? patch.company.trim() : c.company,
                phone: patch.phone !== undefined ? patch.phone.trim() || undefined : c.phone,
                email: patch.email !== undefined ? patch.email.trim() || undefined : c.email,
                initials: patch.name ? initialsFrom(patch.name) : c.initials,
              },
        ),
      );
      syncThenRefresh(() =>
        api.customers.update(id, {
          name: patch.name?.trim(),
          business: patch.company?.trim(),
          phone: patch.phone?.trim() || undefined,
          email: patch.email?.trim() || undefined,
        }),
      );
    },
    [syncThenRefresh],
  );

  const removeCustomer = useCallback(
    (id: string) => {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      syncThenRefresh(() => api.customers.remove(id));
    },
    [syncThenRefresh],
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
      // A "got" entry is a payment received - count it toward live revenue.
      if (!gave) setReceipts((r) => r + input.amount);
      syncThenRefresh(() => api.customers.addEntry(customerId, { kind: input.kind, amount: input.amount, memo: input.memo }));
      logActivity({
        who: who || 'Customer',
        what: gave ? (input.memo.trim() || 'Credit extended') : 'Payment received',
        amount: input.amount,
        type: gave ? 'invoice' : 'payment',
      });
    },
    [logActivity, syncThenRefresh]
  );

  const updateEntry = useCallback(
    (customerId: string, entryId: string, input: { kind?: 'gave' | 'got'; amount?: number; memo?: string }) => {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id !== customerId) return c;
          const ledger = c.ledger.map((e) => {
            if (e.id !== entryId) return e;
            const kind = input.kind ?? (e.debit > 0 ? 'gave' : 'got');
            const amount = input.amount ?? (e.debit > 0 ? e.debit : e.credit);
            const gave = kind === 'gave';
            return {
              ...e,
              memo: input.memo ?? e.memo,
              type: gave ? 'invoice' : ('payment' as LedgerEntry['type']),
              debit: gave ? amount : 0,
              credit: gave ? 0 : amount,
            };
          });
          return recalc({ ...c, lastActivity: todayISO(), ledger });
        })
      );
      syncThenRefresh(() => api.customers.updateEntry(customerId, entryId, input));
    },
    [syncThenRefresh]
  );

  const removeEntry = useCallback((customerId: string, entryId: string) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id !== customerId ? c : recalc({ ...c, ledger: c.ledger.filter((e) => e.id !== entryId) }))),
    );
    syncThenRefresh(() => api.customers.removeEntry(customerId, entryId));
  }, [syncThenRefresh]);

  const addReminder = useCallback(
    (customerId: string, dueAtISO: string, note?: string) => {
      const reminder: Reminder = { id: `r${Date.now()}`, dueAt: dueAtISO, note, status: 'pending' };
      setCustomers((prev) =>
        prev.map((c) =>
          c.id !== customerId
            ? c
            : {
                ...c,
                reminders: [
                  reminder,
                  ...(c.reminders ?? []).map((r) => (r.status === 'pending' ? { ...r, status: 'rescheduled' as const } : r)),
                ],
              },
        ),
      );
      syncThenRefresh(() => api.customers.addReminder(customerId, { dueAt: dueAtISO, note }));
    },
    [syncThenRefresh],
  );

  const setReminderStatus = useCallback(
    (customerId: string, reminderId: string, status: 'kept' | 'missed') => {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id !== customerId
            ? c
            : { ...c, reminders: (c.reminders ?? []).map((r) => (r.id === reminderId ? { ...r, status } : r)) },
        ),
      );
      syncThenRefresh(() => api.customers.updateReminder(customerId, reminderId, { status }));
    },
    [syncThenRefresh],
  );

  const addExpense = useCallback(
    (input: { label: string; value: number; note?: string }) => {
      setExpenses((prev) => {
        const color = EXPENSE_COLORS[prev.length % EXPENSE_COLORS.length];
        return [
          ...prev,
          {
            id: `exp${Date.now()}`,
            label: input.label.trim(),
            value: input.value,
            color,
            note: input.note?.trim() || undefined,
            date: todayISO(),
          },
        ];
      });
      syncThenRefresh(() => api.expenses.create({ label: input.label, value: input.value, note: input.note }));
      logActivity({ who: input.label.trim(), what: 'Expense recorded', amount: input.value, type: 'invoice' });
    },
    [logActivity, syncThenRefresh]
  );

  const removeExpense = useCallback((id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    syncThenRefresh(() => api.expenses.remove(id));
  }, [syncThenRefresh]);

  const updateExpense = useCallback(
    (id: string, patch: { label?: string; value?: number; note?: string }) => {
      setExpenses((prev) =>
        prev.map((e) =>
          e.id !== id
            ? e
            : {
                ...e,
                label: patch.label?.trim() || e.label,
                value: patch.value ?? e.value,
                note: patch.note !== undefined ? patch.note.trim() || undefined : e.note,
              },
        ),
      );
      syncThenRefresh(() => api.expenses.update(id, patch));
    },
    [syncThenRefresh],
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
    syncThenRefresh(() => api.employees.runPayroll());
    return disbursed;
  }, [logActivity, syncThenRefresh]);

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
    syncThenRefresh(() => api.employees.create({ name: input.name, role: input.role, dept: input.dept, salary: input.salary }));
  }, [syncThenRefresh]);

  const removeEmployee = useCallback((id: string) => {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    syncThenRefresh(() => api.employees.remove(id));
  }, [syncThenRefresh]);

  const updateEmployee = useCallback(
    (id: string, patch: { name?: string; role?: string; dept?: string; salary?: number }) => {
      setEmployees((prev) =>
        prev.map((e) => {
          if (e.id !== id) return e;
          const salaryChanged = patch.salary !== undefined && patch.salary !== e.salary;
          return {
            ...e,
            name: patch.name?.trim() || e.name,
            role: patch.role !== undefined ? patch.role.trim() || 'Team member' : e.role,
            dept: patch.dept !== undefined ? patch.dept.trim() || 'General' : e.dept,
            salary: patch.salary ?? e.salary,
            initials: patch.name ? initialsFrom(patch.name) : e.initials,
            status: salaryChanged ? 'pending' : e.status,
          };
        }),
      );
      syncThenRefresh(() => api.employees.update(id, patch));
    },
    [syncThenRefresh],
  );

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
      syncThenRefresh(() => api.employees.increment(id, amount));
    },
    [logActivity, syncThenRefresh]
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
      syncThenRefresh(() =>
        api.partners.create({
          name: input.name.trim(),
          region: input.region?.trim() || undefined,
          share: input.share,
          revenue: input.revenue,
          contact: input.contact?.trim() || undefined,
          phone: input.phone?.trim() || undefined,
          email: input.email?.trim() || undefined,
        }),
      );
    },
    [syncThenRefresh]
  );

  const updatePartner = useCallback(
    (id: string, patch: Partial<Omit<Partner, 'id' | 'delta'>>) => {
      setPartners((prev) => prev.map((p) => (p.id !== id ? p : { ...p, ...patch })));
      syncThenRefresh(() =>
        api.partners.update(id, {
          name: patch.name?.trim(),
          region: patch.region?.trim() || undefined,
          contact: patch.contact?.trim() || undefined,
          phone: patch.phone?.trim() || undefined,
          email: patch.email?.trim() || undefined,
          share: patch.share,
          revenue: patch.revenue,
          status: patch.status,
        }),
      );
    },
    [syncThenRefresh],
  );

  const removePartner = useCallback(
    (id: string) => {
      setPartners((prev) => prev.filter((p) => p.id !== id));
      syncThenRefresh(() => api.partners.remove(id));
    },
    [syncThenRefresh],
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
      updateCustomer,
      removeCustomer,
      addEntry,
      updateEntry,
      removeEntry,
      addReminder,
      setReminderStatus,
      addExpense,
      updateExpense,
      removeExpense,
      addEmployee,
      updateEmployee,
      removeEmployee,
      incrementSalary,
      addPartner,
      updatePartner,
      removePartner,
      runPayroll,
      refresh,
    }),
    [
      customers,
      expenses,
      employees,
      partners,
      activity,
      receipts,
      addCustomer,
      updateCustomer,
      removeCustomer,
      addEntry,
      updateEntry,
      removeEntry,
      addReminder,
      setReminderStatus,
      addExpense,
      updateExpense,
      removeExpense,
      addEmployee,
      updateEmployee,
      removeEmployee,
      incrementSalary,
      addPartner,
      updatePartner,
      removePartner,
      runPayroll,
      refresh,
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
