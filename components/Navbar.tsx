'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sparkles,
  Mic,
  BookOpen as BookIcon,
  History,
  Menu,
  X,
  PenTool,
  Headphones,
  User,
  Bot,
  PhoneCall,
  FileText,
  ShieldCheck,
  ExternalLink
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageSwitcher from './LanguageSwitcher';
import Logo from './Logo';
import { useTranslation } from 'react-i18next';
import { getStoredUser, UserProfile } from '@/lib/userAuth';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const pathname = usePathname();
  const { t } = useTranslation();

  useEffect(() => {
    setUserProfile(getStoredUser());
    const onAuth = () => setUserProfile(getStoredUser());
    window.addEventListener('ielts_auth_changed', onAuth);
    return () => window.removeEventListener('ielts_auth_changed', onAuth);
  }, []);

  const navSections = [
    {
      title: 'ASOSIY',
      items: [
        { href: '/auth', label: userProfile ? 'Mening profilim' : "Ro'yxatdan o'tish", icon: User },
        { href: '/', label: t('nav.home') || 'Bosh sahifa', icon: Sparkles },
        { href: '/learn', label: t('nav.learn') || "O'rganish", icon: FileText },
      ],
    },
    {
      title: 'IELTS MODULLARI',
      items: [
        { href: '/speaking', label: t('nav.practice') || 'Gapirish (Speaking)', icon: Mic },
        { href: '/writing', label: t('nav.writing') || 'Yozish (Writing)', icon: PenTool },
        { href: '/reading', label: t('nav.reading') || "O'qish (Reading)", icon: BookIcon },
        { href: '/listening', label: t('nav.listening') || 'Tinglash (Listening)', icon: Headphones },
      ],
    },
    {
      title: 'SUN\'IY INTELLEKT',
      items: [
        { href: '/mascot', label: 'AI Maskot', icon: Bot },
        { href: '/voice-chat', label: 'Ovozli suhbat', icon: PhoneCall },
        {
          href: 'https://repititor-ai-1-htufczg17-doniyor.vercel.app/',
          label: 'AI Repititor',
          icon: ExternalLink,
          external: true,
        },
      ],
    },
    {
      title: 'HISOB VA BOSHQARUV',
      items: [
        { href: '/history', label: t('nav.history') || 'Tarix va Tahlil', icon: History },
        { href: '/admin', label: 'Admin', icon: ShieldCheck },
      ],
    },
  ];

  const renderNavLinks = (onItemClick?: () => void) => (
    <div className="space-y-5">
      {navSections.map((section) => (
        <div key={section.title} className="space-y-1">
          <p className="px-3 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {section.title}
          </p>
          <div className="space-y-1 mt-1">
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              const isExternal = 'external' in item && item.external;

              const content = (
                <div
                  className={`flex items-center justify-between px-3.5 py-2.5 text-sm font-medium rounded-xl transition-all ${
                    isActive
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 font-semibold border-l-4 border-brand-500 pl-3'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.href === '/auth' && userProfile && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider flex-shrink-0 ml-2 ${
                        userProfile.isDemo
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
                          : userProfile.plan === 'plus'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300'
                          : userProfile.plan === 'pro'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                          : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
                      }`}
                    >
                      {userProfile.isDemo ? 'DEMO' : userProfile.plan}
                    </span>
                  )}
                </div>
              );

              if (isExternal) {
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={onItemClick}
                    className="block"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link key={item.href} href={item.href} onClick={onItemClick} className="block">
                  {content}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-64 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200 dark:border-slate-800 z-40 transition-colors shadow-sm">
        {/* Top Logo Area */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size={30} />
            <div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                IELTSPrep
                <span className="text-[10px] px-1.5 py-0.2 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded font-bold border border-brand-500/20">
                  AI
                </span>
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {renderNavLinks()}
        </div>

        {/* Bottom Actions Area: Language & Theme */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
          {userProfile && (
            <div className="flex items-center gap-2.5 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="w-8 h-8 rounded-lg bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-brand-600 dark:text-brand-400 font-bold text-xs uppercase">
                {userProfile.email?.substring(0, 2) || 'GU'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {userProfile.email || 'Guest User'}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {userProfile.isDemo ? 'Demo Mode' : userProfile.plan || 'Free'}
                </p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ================= MOBILE TOP HEADER ================= */}
      <header className="md:hidden sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Logo size={28} />
          <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            IELTSPrep
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10 animate-in slide-in-from-left duration-200">
            {/* Drawer Header */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-200 dark:border-slate-800">
              <Link
                href="/"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2"
              >
                <Logo size={28} />
                <span className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                  IELTSPrep
                </span>
              </Link>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
              {renderNavLinks(() => setMobileMenuOpen(false))}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <LanguageSwitcher />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
