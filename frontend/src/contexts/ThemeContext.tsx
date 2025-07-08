import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: ThemeColors;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get theme from localStorage or default to light
    const savedTheme = localStorage.getItem('epicenter-theme') as Theme;
    return savedTheme || 'light';
  });

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('epicenter-theme', newTheme);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkTheme : lightTheme;

  // Apply theme to document root
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
};

interface ThemeColors {
  primary: string;
  primaryHover: string;
  primaryLight: string;
  background: string;
  surface: string;
  cardBackground: string;
  border: string;
  borderLight: string;
  text: string;
  textSecondary: string;
  textMuted: string;
}

const lightTheme: ThemeColors = {
  primary: '#e11d2a', // Keep same red for consistency
  primaryHover: '#c11825',
  primaryLight: '#fef2f2', // Very light red/pink background
  background: '#fafafa', // Very light gray background
  surface: '#ffffff', // Pure white for surfaces
  cardBackground: '#f8f9fa', // Light gray for cards
  border: '#e5e7eb', // Light border
  borderLight: '#f3f4f6', // Very light border
  text: '#1f2937', // Dark gray text
  textSecondary: '#6b7280', // Medium gray text
  textMuted: '#9ca3af', // Light gray text
};

const darkTheme: ThemeColors = {
  primary: '#e11d2a',
  primaryHover: '#c11825',
  primaryLight: '#1a1a1a',
  background: '#0a0a0a', // deepBlack
  surface: '#111', // charcoalBlack
  cardBackground: '#181818', // darkGray
  border: '#333',
  borderLight: '#222',
  text: '#ffffff',
  textSecondary: '#d1d5db',
  textMuted: '#9ca3af',
};

// Theme configuration
export const themes = {
  light: {
    // Current light theme colors (preserving existing)
    background: 'bg-white',
    surface: 'bg-gray-50',
    text: 'text-gray-900',
    textSecondary: 'text-gray-600',
    border: 'border-gray-200',
    accent: 'text-purple-600',
  },
  dark: {
    // New dark theme using Figma specifications
    background: 'bg-[#0a0a0a]', // deepBlack
    surface: 'bg-[#111]', // charcoalBlack
    cardBackground: 'bg-[#181818]', // darkGray
    text: 'text-white',
    textSecondary: 'text-gray-300',
    border: 'border-[#333]',
    accent: 'text-[#e11d2a]', // primaryRed
    primaryRed: '#e11d2a',
    deepBlack: '#0a0a0a',
    charcoalBlack: '#111',
    darkGray: '#181818',
    white: '#fff',
  }
};

export { lightTheme, darkTheme };
export default ThemeContext; 