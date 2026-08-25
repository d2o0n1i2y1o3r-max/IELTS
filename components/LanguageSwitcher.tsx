'use client';

import React from 'react';
import { useAppStore } from '@/lib/store';
import i18n from '@/lib/i18n';
import { Globe } from 'lucide-react';

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'uz', name: "O'zbek", flag: '🇺🇿' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];

export default function LanguageSwitcher() {
  const { language, setLanguage } = useAppStore();

  const handleLanguageChange = (code: 'en' | 'uz' | 'ru') => {
    setLanguage(code);
    i18n.changeLanguage(code);
  };

  return (
    <div className="relative inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
      <Globe className="w-4 h-4 ml-1.5 text-slate-400" />
      {languages.map((lang) => (
        <button
          key={lang.code}
          onClick={() => handleLanguageChange(lang.code as 'en' | 'uz' | 'ru')}
          className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
            language === lang.code
              ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <span className="mr-1">{lang.flag}</span>
          {lang.name}
        </button>
      ))}
    </div>
  );
}
