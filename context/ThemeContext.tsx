import { createContext, useContext, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ACCENT = '#A855F7';
export const ACCENT_DARK = '#9333ea';

export const darkTheme = {
  bg: '#000',
  bg2: '#0f0f0f',
  bg3: '#1a1a2e',
  text: '#fff',
  textDim: '#333',
  textHint: '#2d1b4e',
  border: '#1a1a2e',
  tabBar: '#000',
  tabBorder: '#222',
};

export const lightTheme = {
  bg: '#f5f5f5',
  bg2: '#fff',
  bg3: '#e8e8f0',
  text: '#111',
  textDim: '#999',
  textHint: '#bbb',
  border: '#ddd',
  tabBar: '#fff',
  tabBorder: '#eee',
};

type Theme = typeof darkTheme;
type ThemeContextType = { theme: Theme; isDark: boolean; toggle: () => void };

const ThemeContext = createContext<ThemeContextType>({
  theme: darkTheme,
  isDark: true,
  toggle: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(true);

  const toggle = useCallback(async () => {
    const next = !isDark;
    setIsDark(next);
    await AsyncStorage.setItem('theme', next ? 'dark' : 'light');
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);