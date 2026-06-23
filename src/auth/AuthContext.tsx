import React, { createContext, useContext, useState, useCallback } from 'react';
import { currentUser } from '@/data/mock';

interface User {
  name: string;
  role: string;
  email: string;
  initials: string;
}

interface AuthContextValue {
  user: User | null;
  signedIn: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  /** Sign in immediately as a specific user (used right after company setup). */
  register: (user: { name: string; role: string; email: string }) => void;
  signOut: () => void;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || 'U';
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const signIn = useCallback(async (email: string, _password: string) => {
    // Mock: accept any credentials, resolve after a short delay.
    await new Promise((r) => setTimeout(r, 900));
    setUser({ ...currentUser, email: email || currentUser.email });
  }, []);

  const register = useCallback((u: { name: string; role: string; email: string }) => {
    setUser({ name: u.name, role: u.role, email: u.email, initials: initialsFrom(u.name) });
  }, []);

  const signOut = useCallback(() => setUser(null), []);

  return (
    <AuthContext.Provider value={{ user, signedIn: !!user, signIn, register, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
