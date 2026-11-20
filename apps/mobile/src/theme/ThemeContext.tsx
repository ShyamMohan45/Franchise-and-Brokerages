import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { lightColors, darkColors, ThemeColors } from './colors';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  isDark: boolean;
  colors: ThemeColors;
  setTheme: (theme: ThemePreference) => Promise<void>;
}

const STORAGE_KEY = 'fb_mobile_theme';

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'system',
  resolvedTheme: 'light',
  isDark: false,
  colors: lightColors,
  setTheme: async () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadTheme() {
      try {
        const storedTheme = await SecureStore.getItemAsync(STORAGE_KEY);
        if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
          setThemeState(storedTheme);
        }
      } catch (error) {
        console.warn('[ThemeContext] Error loading stored theme:', error);
      } finally {
        setIsLoaded(true);
      }
    }
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemePreference) => {
    setThemeState(newTheme);
    try {
      await SecureStore.setItemAsync(STORAGE_KEY, newTheme);
    } catch (error) {
      console.warn('[ThemeContext] Error persisting theme:', error);
    }
  };

  const resolvedTheme: ResolvedTheme = useMemo(() => {
    if (theme === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return theme;
  }, [theme, systemColorScheme]);

  const isDark = resolvedTheme === 'dark';
  const currentColors = isDark ? darkColors : lightColors;

  const contextValue = useMemo(
    () => ({
      theme,
      resolvedTheme,
      isDark,
      colors: currentColors,
      setTheme,
    }),
    [theme, resolvedTheme, isDark, currentColors]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
