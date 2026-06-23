import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { company as defaultCompany } from './mock';
import { PlanKey, BillingCycle } from './currencies';
import { useAuth, CompanyProfile } from '@/auth/AuthContext';
import { api, isApiEnabled, getToken } from '@/api/client';

export type { CompanyProfile } from '@/auth/AuthContext';

interface CompanyContextValue {
  company: CompanyProfile | null;
  /** Display name — falls back to the seed company before setup. */
  name: string;
  fiscalYear: string;
  /** Change plan / seats / cycle; optimistic locally + synced to the API when online. */
  updateBilling: (input: { plan?: PlanKey; seats?: number; billingCycle?: BillingCycle }) => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const { company, updateCompany } = useAuth();

  const updateBilling = useCallback(
    (input: { plan?: PlanKey; seats?: number; billingCycle?: BillingCycle }) => {
      if (company) {
        // Optimistic local update so the UI reacts instantly.
        updateCompany({
          ...company,
          plan: input.plan ?? company.plan,
          seats: input.seats ?? company.seats,
          billingCycle: input.billingCycle ?? company.billingCycle,
          billingSince: new Date().toISOString().slice(0, 10),
        });
      }
      // Best-effort persistence when a live session is available.
      if (isApiEnabled() && getToken()) {
        api.billing.update(input).catch(() => {});
      }
    },
    [company, updateCompany],
  );

  const value = useMemo<CompanyContextValue>(
    () => ({
      company,
      name: company?.name ?? defaultCompany.name,
      fiscalYear: defaultCompany.fiscalYear,
      updateBilling,
    }),
    [company, updateBilling],
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
