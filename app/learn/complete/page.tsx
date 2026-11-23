'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Star, Trophy, Flame, ArrowRight, Home } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function LessonCompleteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  const [stars, setStars] = useState(0);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    const starsParam = searchParams.get('stars');
    const xpParam = searchParams.get('xp');

    if (starsParam) setStars(parseInt(starsParam, 10));
    if (xpParam) setXp(parseInt(xpParam, 10));
  }, [searchParams]);

  return (
    <div className="max-w-md mx-auto space-y-8 pb-12">
      {/* Success Animation */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-brand-500 to-blue-600 rounded-full shadow-2xl shadow-brand-500/30">
          <Trophy className="w-12 h-12 text-white" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">
          {t('learn.lesson_complete')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{t('learn.great_job')}</p>
      </div>

      {/* Stars */}
      <div className="flex justify-center gap-4">
        {[1, 2, 3].map((star) => (
          <Star
            key={star}
            className={`w-12 h-12 transition-all ${
              star <= stars ? 'text-amber-400 fill-amber-400 scale-110' : 'text-slate-300'
            }`}
          />
        ))}
      </div>

      {/* Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-100 dark:bg-brand-950 rounded-xl">
              <Trophy className="w-5 h-5 text-brand-500" />
            </div>
            <span className="text-slate-600 dark:text-slate-400">{t('learn.xp_earned')}</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">+{xp}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-950 rounded-xl">
              <Flame className="w-5 h-5 text-orange-500" />
            </div>
            <span className="text-slate-600 dark:text-slate-400">{t('learn.streak')}</span>
          </div>
          <span className="text-2xl font-bold text-slate-900 dark:text-white">🔥</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <button
          onClick={() => router.push('/learn')}
          className="w-full py-4 px-6 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-2"
        >
          {t('learn.continue_learning')}
          <ArrowRight className="w-5 h-5" />
        </button>

        <button
          onClick={() => router.push('/')}
          className="w-full py-4 px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all text-lg flex items-center justify-center gap-2"
        >
          <Home className="w-5 h-5" />
          {t('nav.home')}
        </button>
      </div>
    </div>
  );
}

export default function LessonCompletePage() {
  return (
    <Suspense fallback={<div className="max-w-md mx-auto py-12 text-center text-slate-400">Loading...</div>}>
      <LessonCompleteContent />
    </Suspense>
  );
}
