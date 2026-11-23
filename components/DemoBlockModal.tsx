'use client';

import React from 'react';
import Link from 'next/link';
import { Lock, Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';

interface DemoBlockModalProps {
  featureName?: string;
  onClose?: () => void;
}

export default function DemoBlockModal({
  featureName = "AI Suhbat va Baholash",
  onClose
}: DemoBlockModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-bold uppercase tracking-wider">
            <ShieldAlert className="w-3.5 h-3.5" />
            Demo versiya cheklovi
          </div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white">
            {featureName} faqat Google hisobda mavjud
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Siz hozirda <strong>Demo versiya</strong>dasiz. Demo rejimida AI bilan jonli suhbat va AI baholash cheklangan. Barcha sun'iy intellekt xizmatlaridan foydalanish uchun haqiqiy Google hisobingiz bilan kiring.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-left space-y-2">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Google orqali kirsangiz nimalar ochiladi:
          </div>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
            <li>AI Buddy bilan cheksiz jonli suhbat</li>
            <li>Speaking va Writing topshiriqlarini AI orqali baholash</li>
            <li>Pro va Plus tariflari (Claude, ChatGPT, Gemini)</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {onClose && (
            <button
              onClick={onClose}
              className="py-3 px-5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Orqaga
            </button>
          )}
          <Link
            href="/auth"
            className="flex-1 py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 transition"
          >
            Google bilan kirish
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
