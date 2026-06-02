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
  leather: '#3B3B3B', // Dark gray header
  leatherLight: '#9A8174', // Taupe accents
  leatherDark: '#050206', // Black deep accents
  parchment: '#FFFFFF', // White background
  cream: '#FFFFFF', // White cards
  walnut: '#FFFFFF', // White text on colored elements
  amber: '#9A8174', // Taupe as primary accent
  amberGlow: '#9A8174',
  stitch: '#9A8174',
  brass: '#9A8174',
  insetShadow: 'rgba(0,0,0,0.1)',
  emboss: 'rgba(255,255,255,0.2)',
  dangerRed: '#A52422',
  dangerBg: '#F5D5D5',
  successGreen: '#4A7C59',
  text: '#050206', // Black text
  textSecondary: '#3B3B3B', // Dark gray secondary text
  textMuted: '#9A8174', // Taupe muted text
  cardBorder: '#F0F0F0',
  divider: '#E0E0E0',
  overlay: 'rgba(5,2,6,0.5)',
  statusBar: 'light-content',
};

const darkTheme: ThemeColors = {
  leather: '#050206', // Black header
  leatherLight: '#3B3B3B', // Dark gray accents
  leatherDark: '#000000',
  parchment: '#3B3B3B', // Dark gray background
  cream: '#3B3B3B', // Dark gray cards
  walnut: '#FFFFFF', // White text on colored elements
  amber: '#9A8174', // Taupe primary accent
  amberGlow: '#9A8174',
  stitch: '#9A8174',
  brass: '#9A8174',
  insetShadow: 'rgba(0,0,0,0.5)',
  emboss: 'rgba(255,255,255,0.06)',
  dangerRed: '#D44240',
  dangerBg: '#3A1A1A',
  successGreen: '#5AAA6E',
  text: '#FFFFFF', // White text
  textSecondary: '#9A8174', // Taupe secondary text
  textMuted: '#9A8174',
  cardBorder: '#050206', // Black borders for contrast against gray
  divider: '#050206',
  overlay: 'rgba(5,2,6,0.7)',
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
