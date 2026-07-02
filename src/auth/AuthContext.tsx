import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { PlanKey, BillingCycle } from '@/data/currencies';
import { setCurrencySymbol } from '@/data/format';
import { api, setToken, isApiEnabled, setOnUnauthorized } from '@/api/client';
import { loadSession, saveSession, clearSession } from './session-storage';

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
  capital: number;
  revenue: number;
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
  capital: number;
  revenue: number;
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
  /** True while restoring a persisted session on launch (show a splash, don't redirect). */
  hydrating: boolean;
  /** True when the active session came from the live API (not the local fallback). */
  online: boolean;
  /** True when the last session ended because the token expired — login shows a notice. */
  sessionExpired: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  updateCompany: (company: CompanyProfile) => void;
  /** Persist an edit to the company profile (name, currency, capital, revenue…) to the API. */
  saveCompany: (patch: Partial<Pick<CompanyProfile,
    'name' | 'industry' | 'country' | 'currencyCode' | 'currencySymbol' | 'capital' | 'revenue' | 'teamSize'>>) => Promise<void>;
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
    capital: Number(c.capital ?? 0),
    revenue: Number(c.revenue ?? 0),
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
  const [hydrating, setHydrating] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Restore a persisted session on launch.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const s = await loadSession();
      // Only restore a real (DB-backed) session — a token is required.
      if (!cancelled && s?.user && s.token) {
        setToken(s.token);
        setTokenState(s.token);
        setUser(s.user);
        setCompany(s.company);
        if (s.company) setCurrencySymbol(s.company.currencySymbol);
        setOnline(true);
        // Validate the restored token immediately — if it expired while the
        // app was closed, the 401 handler signs out with a notice instead of
        // letting screens render stale data.
        api.auth.me().catch(() => {});
      } else if (s) {
        await clearSession();
      }
      if (!cancelled) setHydrating(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Persist any session change (login, register, billing edit, sign-out).
  useEffect(() => {
    if (hydrating) return;
    if (user) saveSession({ token: tokenState, user, company });
    else clearSession();
  }, [user, company, tokenState, hydrating]);

  const applySession = useCallback((r: any) => {
    setSessionExpired(false);
    setToken(r.token);
    setTokenState(r.token);
    const u = mapUser(r.user);
    const c = mapCompany(r.company, r.user);
    setUser(u);
    setCompany(c);
    setCurrencySymbol(c.currencySymbol);
    setOnline(true);
  }, []);

  // Database-only auth: credentials are verified by the API. No local fallback.
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!isApiEnabled()) throw new Error('Backend is not configured. Please try again later.');
      const r = await api.auth.login(email, password);
      applySession(r);
    },
    [applySession],
  );

  const register = useCallback(
    async (input: RegisterInput) => {
      if (!isApiEnabled()) throw new Error('Backend is not configured. Please try again later.');
      const r = await api.auth.register({
        companyName: input.name,
        industry: input.industry,
        country: input.country,
        currencyCode: input.currencyCode,
        currencySymbol: input.currencySymbol,
        capital: input.capital,
        revenue: input.revenue,
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
    },
    [applySession],
  );

  const updateCompany = useCallback((c: CompanyProfile) => setCompany(c), []);

  const saveCompany = useCallback<AuthContextValue['saveCompany']>(
    async (patch) => {
      if (!isApiEnabled()) throw new Error('Backend is not configured.');
      const updated = await api.company.update(patch as Record<string, unknown>);
      setCompany((prev) => {
        const merged: CompanyProfile = {
          ...(prev as CompanyProfile),
          ...mapCompany(updated, { name: prev?.ownerName, role: prev?.ownerRole, email: prev?.ownerEmail }),
        };
        return merged;
      });
      if (patch.currencySymbol) setCurrencySymbol(patch.currencySymbol);
    },
    [],
  );

  const signOut = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setOnline(false);
    setUser(null);
    setCompany(null);
  }, []);

  // Any authed request that returns 401 forces a clean sign-out; the login
  // screen tells the user their session expired.
  useEffect(() => {
    setOnUnauthorized(() => {
      setSessionExpired(true);
      signOut();
    });
    return () => setOnUnauthorized(null);
  }, [signOut]);

  return (
    <AuthContext.Provider
      value={{ user, company, signedIn: !!user, token: tokenState, hydrating, online, sessionExpired, signIn, register, updateCompany, saveCompany, signOut }}
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
