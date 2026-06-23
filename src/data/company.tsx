import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { setCurrencySymbol } from './format';
import { company as defaultCompany } from './mock';
import { PlanKey, BillingCycle } from './currencies';

export interface CompanyProfile {
  name: string;
  industry: string;
  country: string;
  currencyCode: string;
  currencySymbol: string;
  ownerName: string;
  ownerRole: string;
  ownerEmail: string;
  teamSize: string;
  seats: number;
  plan: PlanKey;
  billingCycle: BillingCycle;
  /** ISO date the current billing period started. */
  billingSince: string;
}

interface CompanyContextValue {
  company: CompanyProfile | null;
  /** Display name — falls back to the seed company before setup. */
  name: string;
  fiscalYear: string;
  createCompany: (profile: CompanyProfile) => void;
  /** Change plan / seats / cycle after signup; resets the billing period to now. */
  updateBilling: (input: { plan?: PlanKey; seats?: number; billingCycle?: BillingCycle }) => void;
}

const CompanyContext = createContext<CompanyContextValue | null>(null);

export function CompanyProvider({ children }: { children: React.ReactNode }) {
  const [company, setCompany] = useState<CompanyProfile | null>(null);

  const createCompany = useCallback((profile: CompanyProfile) => {
    setCurrencySymbol(profile.currencySymbol);
    setCompany(profile);
  }, []);

  const updateBilling = useCallback(
    (input: { plan?: PlanKey; seats?: number; billingCycle?: BillingCycle }) => {
      setCompany((prev) =>
        prev
          ? {
              ...prev,
              plan: input.plan ?? prev.plan,
              seats: input.seats ?? prev.seats,
              billingCycle: input.billingCycle ?? prev.billingCycle,
              billingSince: new Date().toISOString().slice(0, 10),
            }
          : prev
      );
    },
    []
  );

  const value = useMemo<CompanyContextValue>(
    () => ({
      company,
      name: company?.name ?? defaultCompany.name,
      fiscalYear: defaultCompany.fiscalYear,
      createCompany,
      updateBilling,
    }),
    [company, createCompany, updateBilling]
  );

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
}

export function useCompany() {
  const ctx = useContext(CompanyContext);
  if (!ctx) throw new Error('useCompany must be used within CompanyProvider');
  return ctx;
}
