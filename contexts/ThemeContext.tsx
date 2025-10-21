import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ThemeMode = 'light' | 'dark';

interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  primary: string;
  border: string;
  borderLight: string;
  inputBackground: string;
  overlay: string;
  overlayLight: string;
  shadow: string;
  tabBar: string;
  icon: string;
  iconInactive: string;
  buttonDisabled: string;
  buttonDisabledText: string;
  error: string;
  checkboxBorder: string;
  checkboxChecked: string;
  gradient: string[];
  adGradients: {
    blue: string[];
    purple: string[];
    orange: string[];
  };
}

interface ThemeContextType {
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const lightColors: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F9FAFB',
  card: 'rgba(255, 255, 255, 0.95)',
  text: '#1F2937',
  textSecondary: '#6B7280',
  textTertiary: '#9CA3AF',
  primary: '#1F2937',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  inputBackground: '#FFFFFF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
  shadow: '#000',
  tabBar: '#FFFFFF',
  icon: '#1F2937',
  iconInactive: '#9CA3AF',
  buttonDisabled: '#D1D5DB',
  buttonDisabledText: '#9CA3AF',
  error: '#EF4444',
  checkboxBorder: '#D1D5DB',
  checkboxChecked: '#1F2937',
  gradient: ['#667eea', '#764ba2'],
  adGradients: {
    blue: ['#3b82f6', '#2563eb'],
    purple: ['#8b5cf6', '#7c3aed'],
    orange: ['#f97316', '#ea580c'],
  },
};

const darkColors: ThemeColors = {
  background: '#000000',
  surface: '#1A1A1A',
  card: 'rgba(26, 26, 26, 0.95)',
  text: '#FFFFFF',
  textSecondary: '#A1A1A1',
  textTertiary: '#737373',
  primary: '#FFFFFF',
  border: '#2A2A2A',
  borderLight: '#1F1F1F',
  inputBackground: '#1A1A1A',
  overlay: 'rgba(255, 255, 255, 0.5)',
  overlayLight: 'rgba(255, 255, 255, 0.3)',
  shadow: '#FFFFFF',
  tabBar: '#000000',
  icon: '#FFFFFF',
  iconInactive: '#737373',
  buttonDisabled: '#2A2A2A',
  buttonDisabledText: '#525252',
  error: '#EF4444',
  checkboxBorder: '#3F3F3F',
  checkboxChecked: '#FFFFFF',
  gradient: ['#667eea', '#764ba2'],
  adGradients: {
    blue: ['#1e40af', '#1e3a8a'],
    purple: ['#6b21a8', '#581c87'],
    orange: ['#c2410c', '#9a3412'],
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@intent_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>('light');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  const colors = theme === 'light' ? lightColors : darkColors;

  if (isLoading) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
