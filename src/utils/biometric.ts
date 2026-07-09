import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Fingerprint / Face unlock (app-lock pattern): the password signs you in
 * once; while a session exists, returning to the app asks for a biometric
 * instead of the password. State lives on-device only.
 */

const ENABLED_KEY = 'vantage.biometric.v1';

export interface BiometricSupport {
  available: boolean;
  /** Human label for the strongest enrolled method, e.g. "Fingerprint". */
  label: string;
}

export async function getBiometricSupport(): Promise<BiometricSupport> {
  if (Platform.OS === 'web') return { available: false, label: 'Biometric' };
  try {
    const [hasHardware, enrolled, types] = await Promise.all([
      LocalAuthentication.hasHardwareAsync(),
      LocalAuthentication.isEnrolledAsync(),
      LocalAuthentication.supportedAuthenticationTypesAsync(),
    ]);
    const label = types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)
      ? 'Face unlock'
      : 'Fingerprint';
    return { available: hasHardware && enrolled, label };
  } catch {
    return { available: false, label: 'Biometric' };
  }
}

export async function isBiometricEnabled(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(ENABLED_KEY)) === '1';
  } catch {
    return false;
  }
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  try {
    if (enabled) await AsyncStorage.setItem(ENABLED_KEY, '1');
    else await AsyncStorage.removeItem(ENABLED_KEY);
  } catch {
    // non-fatal
  }
}

/** Prompt the OS biometric dialog. Device PIN is allowed as fallback. */
export async function authenticateBiometric(prompt: string): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    const res = await LocalAuthentication.authenticateAsync({
      promptMessage: prompt,
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return res.success;
  } catch {
    return false;
  }
}
