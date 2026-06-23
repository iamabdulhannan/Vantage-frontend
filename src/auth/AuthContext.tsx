import React, { createContext, useContext, useState, useCallback } from 'react';
import { currentUser } from '@/data/mock';
import { PlanKey, BillingCycle } from '@/data/currencies';
import { setCurrencySymbol } from '@/data/format';
import { api, setToken, isApiEnabled } from '@/api/client';

export interface SessionUser {
  id?: string;
  name: string;
  role: string;
  email: string;
  initials: string;
}

export interface CompanyProfile {
  id?: string;
  name: string;
  industry?: string;
  country?: string;
  currencyCode: string;
  currencySymbol: string;
  ownerName: string;
  ownerRole: string;
  ownerEmail: string;
  teamSize?: string;
  seats: number;
  plan: PlanKey;
  billingCycle: BillingCycle;
  billingSince: string;
}

export interface RegisterInput {
  name: string; // company name
  industry?: string;
  country?: string;
  currencyCode: string;
  currencySymbol: string;
  teamSize?: string;
  seats: number;
  plan: PlanKey;
  billingCycle: BillingCycle;
  ownerName: string;
  ownerRole: string;
  ownerEmail: string;
  password: string;
}

interface AuthContextValue {
  user: SessionUser | null;
  company: CompanyProfile | null;
  signedIn: boolean;
  /** Reactive JWT — non-null only for a live API session; drives data hydration. */
  token: string | null;
  /** True when the active session came from the live API (not the local fallback). */
  online: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  updateCompany: (company: CompanyProfile) => void;
  signOut: () => void;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || 'U';
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function mapUser(u: any): SessionUser {
  return { id: u.id, name: u.name, role: u.role, email: u.email, initials: u.initials || initialsFrom(u.name) };
}

function mapCompany(c: any, u: any): CompanyProfile {
  return {
    id: c.id,
    name: c.name,
    industry: c.industry ?? undefined,
    country: c.country ?? undefined,
    currencyCode: c.currencyCode,
    currencySymbol: c.currencySymbol,
    ownerName: u.name,
    ownerRole: u.role,
    ownerEmail: u.email,
    teamSize: c.teamSize ?? undefined,
    seats: c.seats,
    plan: c.plan,
    billingCycle: c.billingCycle,
    billingSince: c.billingSince ? String(c.billingSince).slice(0, 10) : todayISO(),
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [tokenState, setTokenState] = useState<string | null>(null);
  const [online, setOnline] = useState(false);

  const applySession = useCallback((r: any) => {
    setToken(r.token);
    setTokenState(r.token);
    const u = mapUser(r.user);
    const c = mapCompany(r.company, r.user);
    setUser(u);
    setCompany(c);
    setCurrencySymbol(c.currencySymbol);
    setOnline(true);
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      try {
        if (!isApiEnabled()) throw new Error('offline');
        const r = await api.auth.login(email, password);
        applySession(r);
      } catch {
        // Fallback: local demo session (keeps the app usable while the API is unreachable).
        await new Promise((res) => setTimeout(res, 600));
        setToken(null);
        setTokenState(null);
        setOnline(false);
        setUser({ ...currentUser, email: email || currentUser.email });
      }
    },
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      try {
        if (!isApiEnabled()) throw new Error('offline');
        const r = await api.auth.register({
          companyName: input.name,
          industry: input.industry,
          country: input.country,
          currencyCode: input.currencyCode,
          currencySymbol: input.currencySymbol,
          teamSize: input.teamSize,
          seats: input.seats,
          plan: input.plan,
          billingCycle: input.billingCycle,
          ownerName: input.ownerName,
          ownerRole: input.ownerRole,
          email: input.ownerEmail,
          password: input.password,
        });
        applySession(r);
      } catch {
        // Fallback: create the company locally so setup still completes offline.
        setToken(null);
        setTokenState(null);
        setOnline(false);
        setCurrencySymbol(input.currencySymbol);
        setUser({
          name: input.ownerName,
          role: input.ownerRole,
          email: input.ownerEmail,
          initials: initialsFrom(input.ownerName),
        });
        setCompany({
          name: input.name,
          industry: input.industry,
          country: input.country,
          currencyCode: input.currencyCode,
          currencySymbol: input.currencySymbol,
          ownerName: input.ownerName,
          ownerRole: input.ownerRole,
          ownerEmail: input.ownerEmail,
          teamSize: input.teamSize,
          seats: input.seats,
          plan: input.plan,
          billingCycle: input.billingCycle,
          billingSince: todayISO(),
        });
      }
    },
    [applySession],
  );

  const updateCompany = useCallback((c: CompanyProfile) => setCompany(c), []);

  const signOut = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setOnline(false);
    setUser(null);
    setCompany(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, company, signedIn: !!user, token: tokenState, online, signIn, register, updateCompany, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
