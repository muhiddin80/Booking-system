'use client';

import { useTheme } from '@/contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();

  const getIcon = () => {
    return resolvedTheme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />;
  };

  const getLabel = () => {
    return resolvedTheme === 'dark' ? 'Dark' : 'Light';
  };

  return (
    <button
      onClick={toggleTheme}
      className={`flex items-center space-x-2 p-2 rounded-lg transition-colors duration-200 ${
        resolvedTheme === 'dark' 
          ? 'bg-gray-800 hover:bg-gray-700' 
          : 'bg-gray-100 hover:bg-gray-200'
      }`}
      title={`Current theme: ${getLabel()}. Click to toggle.`}
    >
      {getIcon()}
      <span className={`text-sm font-medium hidden sm:inline ${
        resolvedTheme === 'dark' 
          ? 'text-gray-300' 
          : 'text-gray-700'
      }`}>
        {getLabel()}
      </span>
    </button>
  );
}
