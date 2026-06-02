import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface ThemeColors {
  leather: string;
  leatherLight: string;
  leatherDark: string;
  parchment: string;
  cream: string;
  walnut: string;
  amber: string;
  amberGlow: string;
  stitch: string;
  brass: string;
  insetShadow: string;
  emboss: string;
  dangerRed: string;
  dangerBg: string;
  successGreen: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  cardBorder: string;
  divider: string;
  overlay: string;
  statusBar: 'light-content' | 'dark-content';
}

const lightTheme: ThemeColors = {
  leather: '#4A3728',
  leatherLight: '#6B4F3E',
  leatherDark: '#3E2B1E',
  parchment: '#F5F0E8',
  cream: '#FAF7F2',
  walnut: '#3E2B1E',
  amber: '#D4A03C',
  amberGlow: '#E8B84B',
  stitch: '#C4A87C',
  brass: '#B8976A',
  insetShadow: 'rgba(0,0,0,0.25)',
  emboss: 'rgba(255,255,255,0.15)',
  dangerRed: '#A52422',
  dangerBg: '#F5D5D5',
  successGreen: '#4A7C59',
  text: '#3E2B1E',
  textSecondary: '#7A6552',
  textMuted: '#A89580',
  cardBorder: '#E0D5C5',
  divider: '#E8DFD2',
  overlay: 'rgba(30,20,14,0.55)',
  statusBar: 'light-content',
};

const darkTheme: ThemeColors = {
  leather: '#1A1210',
  leatherLight: '#2E2219',
  leatherDark: '#0E0A08',
  parchment: '#1E1814',
  cream: '#252019',
  walnut: '#F5F0E8',
  amber: '#D4A03C',
  amberGlow: '#E8B84B',
  stitch: '#5C4A38',
  brass: '#8A7352',
  insetShadow: 'rgba(0,0,0,0.5)',
  emboss: 'rgba(255,255,255,0.06)',
  dangerRed: '#D44240',
  dangerBg: '#3A1A1A',
  successGreen: '#5AAA6E',
  text: '#F0E8DB',
  textSecondary: '#B8A892',
  textMuted: '#7A6B5C',
  cardBorder: '#3A2F25',
  divider: '#332A22',
  overlay: 'rgba(0,0,0,0.7)',
  statusBar: 'light-content',
};

interface ThemeContextType {
  colors: ThemeColors;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  colors: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = useCallback(() => {
    setIsDark((prev) => !prev);
  }, []);

  const colors = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ colors, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
