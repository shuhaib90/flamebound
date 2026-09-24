'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from '@/lib/theme-context';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  className?: string;
  variant?: 'icon' | 'pill';
}

export function ThemeToggle({ className = '', variant = 'icon' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-lg bg-gray-100 dark:bg-gray-800 animate-pulse ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  if (variant === 'pill') {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          isDark
            ? 'bg-slate-800 text-amber-300 border border-slate-700 hover:bg-slate-700'
            : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
        } ${className}`}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-blue-600" />}
        <span>{isDark ? 'Light' : 'Night'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-lg transition-all border ${
        isDark
          ? 'bg-slate-800/80 border-slate-700 text-amber-300 hover:bg-slate-700 hover:text-amber-200 shadow-sm'
          : 'bg-gray-100/90 border-gray-200 text-gray-600 hover:bg-gray-200 hover:text-[#293681] shadow-sm'
      } ${className}`}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun size={16} className="transition-transform rotate-0 hover:rotate-45" />
      ) : (
        <Moon size={16} className="transition-transform rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
