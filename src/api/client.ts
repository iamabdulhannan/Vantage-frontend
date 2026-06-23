/**
 * Thin typed client for the Vantage API (NestJS on Vercel).
 * Base URL comes from EXPO_PUBLIC_API_URL; the JWT is held in memory and
 * attached to every authed request. All callers treat the API as best-effort
 * and fall back to local state when it's unreachable.
 */
const BASE = (process.env.EXPO_PUBLIC_API_URL ?? '').replace(/\/$/, '');

let token: string | null = null;
export function setToken(t: string | null) {
  token = t;
}
export function getToken() {
  return token;
}
export function isApiEnabled() {
  return BASE.length > 0;
}

async function request<T = any>(
  path: string,
  options: { method?: string; body?: unknown; auth?: boolean } = {},
): Promise<T> {
  if (!BASE) throw new Error('API not configured');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const res = await fetch(`${BASE}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.auth !== false && token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) {
      const msg = data && (Array.isArray(data.message) ? data.message.join(', ') : data.message || data.error);
      throw new Error(msg || `Request failed (${res.status})`);
    }
    return data as T;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
    register: (body: Record<string, unknown>) =>
      request('/auth/register', { method: 'POST', body, auth: false }),
    me: () => request('/auth/me'),
  },
  customers: {
    list: () => request('/customers'),
    create: (body: Record<string, unknown>) => request('/customers', { method: 'POST', body }),
    get: (id: string) => request(`/customers/${id}`),
    addEntry: (id: string, body: { kind: 'gave' | 'got'; amount: number; memo?: string }) =>
      request(`/customers/${id}/entries`, { method: 'POST', body }),
  },
  expenses: {
    list: () => request('/expenses'),
    create: (body: { label: string; value: number }) => request('/expenses', { method: 'POST', body }),
  },
  partners: {
    list: () => request('/partners'),
    create: (body: Record<string, unknown>) => request('/partners', { method: 'POST', body }),
  },
  employees: {
    list: () => request('/employees'),
    create: (body: Record<string, unknown>) => request('/employees', { method: 'POST', body }),
    increment: (id: string, amount: number) =>
      request(`/employees/${id}/increment`, { method: 'PATCH', body: { amount } }),
    remove: (id: string) => request(`/employees/${id}`, { method: 'DELETE' }),
    runPayroll: () => request('/employees/payroll/run', { method: 'POST' }),
  },
  billing: {
    get: () => request('/billing/me'),
    update: (body: Record<string, unknown>) => request('/billing/me', { method: 'PATCH', body }),
  },
  dashboard: { get: () => request('/dashboard/me') },
};
