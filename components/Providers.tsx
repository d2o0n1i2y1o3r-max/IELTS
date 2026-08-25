'use client';

import React, { useEffect } from 'react';
import i18n from '@/lib/i18n';
import { useAppStore } from '@/lib/store';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  const { setTheme, setLanguage } = useAppStore();

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('speakprep_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') {
        setTheme(savedTheme);
      } else {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
      }

      const savedLang = localStorage.getItem('speakprep_lang') as 'en' | 'uz' | 'ru';
      if (savedLang && ['en', 'uz', 'ru'].includes(savedLang)) {
        setLanguage(savedLang);
        i18n.changeLanguage(savedLang);
      }
    }
  }, [setTheme, setLanguage]);

  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <div suppressHydrationWarning>{children}</div>;
}
