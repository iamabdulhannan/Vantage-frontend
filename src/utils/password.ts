/**
 * One password policy for the whole product - mirrored by the API
 * (auth.dto.ts / team.module.ts). Keep the two in sync.
 */
export const PASSWORD_MIN = 8;

/** Human-readable policy error, or null when the password is acceptable. */
export function validatePassword(pw: string): string | null {
  if (pw.length < PASSWORD_MIN) return `Password must be at least ${PASSWORD_MIN} characters`;
  if (!/[A-Za-z]/.test(pw)) return 'Add at least one letter';
  if (!/\d/.test(pw)) return 'Add at least one number';
  return null;
}

export interface Strength {
  /** 0-4 */
  score: number;
  label: 'Too short' | 'Weak' | 'Fair' | 'Good' | 'Strong';
}

/** Rough strength score for the meter - guidance, not a gate. */
export function passwordStrength(pw: string): Strength {
  if (pw.length === 0) return { score: 0, label: 'Too short' };
  let score = 0;
  if (pw.length >= PASSWORD_MIN) score++;
  if (/[A-Za-z]/.test(pw) && /\d/.test(pw)) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw) || pw.length >= 12) score++;
  const label = (['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const)[score];
  return { score, label };
}
