import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SessionUser, CompanyProfile } from './AuthContext';

const KEY = 'vantage.session.v1';

export interface PersistedSession {
  token: string | null;
  user: SessionUser;
  company: CompanyProfile | null;
}

export async function loadSession(): Promise<PersistedSession | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as PersistedSession) : null;
  } catch {
    return null;
  }
}

export async function saveSession(session: PersistedSession): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(session));
  } catch {
    // best-effort
  }
}

export async function clearSession(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {
    // best-effort
  }
}
