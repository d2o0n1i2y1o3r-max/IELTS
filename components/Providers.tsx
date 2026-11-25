'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import i18n from '@/lib/i18n';
import { useAppStore } from '@/lib/store';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);
  const pathname = usePathname();
  const router = useRouter();
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

      // Check registration status
      const checkAuth = () => {
        const profile = localStorage.getItem('ielts_user_profile');
        const hasUser = Boolean(profile);
        setIsAuthorized(hasUser);

        // If not registered and attempting to access protected page
        if (!hasUser && pathname !== '/auth' && !pathname.startsWith('/admin')) {
          router.replace('/auth');
        }
      };

      checkAuth();
      window.addEventListener('ielts_auth_changed', checkAuth);
      return () => window.removeEventListener('ielts_auth_changed', checkAuth);
    }
  }, [setTheme, setLanguage, pathname, router]);

  // Protected route gate
  if (mounted && pathname !== '/auth' && !pathname.startsWith('/admin') && isAuthorized === false) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center mx-auto text-xl font-bold animate-pulse">
            🔒
          </div>
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
            Iltimos, avval ro'yxatdan o'ting
          </h2>
          <p className="text-xs text-slate-500">
            Ro'yxatdan o'tish sahifasiga yo'naltirilmoqda...
          </p>
        </div>
      </div>
    );
  }

  return <div suppressHydrationWarning>{children}</div>;
}
