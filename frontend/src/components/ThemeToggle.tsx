import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col">
        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Dark Mode</span>
        <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-500'}`}>Switch to {isDark ? 'light' : 'dark'} theme</span>
      </div>
      
      <button
        onClick={toggleTheme}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          isDark ? 'bg-[#e11d2a]' : 'bg-gray-200'
        }`}
        role="switch"
        aria-checked={isDark}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            isDark ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );
};

export default ThemeToggle; 