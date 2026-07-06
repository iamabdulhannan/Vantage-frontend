import React, { createContext, useContext, useMemo, useState, useCallback } from 'react';
import { useColorScheme } from 'react-native';
import {
  Mode,
  Palette,
  lightPalette,
  darkPalette,
  gradients,
  spacing,
  radius,
  fonts,
  type as typeScale,
  shadow,
} from './tokens';

interface ThemeContextValue {
  mode: Mode;
  colors: Palette;
  gradients: typeof gradients.light;
  spacing: typeof spacing;
  radius: typeof radius;
  fonts: typeof fonts;
  type: typeof typeScale;
  shadow: (level: 1 | 2 | 3) => ReturnType<typeof shadow>;
  toggleMode: () => void;
  setMode: (m: Mode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [override, setOverride] = useState<Mode | null>(null);
  // Meadow ships light-first; the header toggle still switches to dark green.
  const mode: Mode = override ?? 'light';

  const toggleMode = useCallback(() => {
    setOverride((prev) => ((prev ?? 'light') === 'dark' ? 'light' : 'dark'));
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      mode,
      colors: mode === 'dark' ? darkPalette : lightPalette,
      gradients: mode === 'dark' ? gradients.dark : gradients.light,
      spacing,
      radius,
      fonts,
      type: typeScale,
      shadow: (level: 1 | 2 | 3) => shadow(mode, level),
      toggleMode,
      setMode: setOverride,
    }),
    [mode, toggleMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
