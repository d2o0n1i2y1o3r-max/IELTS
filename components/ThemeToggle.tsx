'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useAppStore();
  const { t } = useTranslation();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 dark:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500"
      aria-label="Toggle theme"
      title={theme === 'dark' ? t('nav.theme_light') : t('nav.theme_dark')}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-amber-400" />
      ) : (
        <Moon className="w-5 h-5 text-slate-700" />
      )}
    </button>
  );
}
