'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { PracticeSession, SpeakingSession } from '@/lib/types';
import ScoreCard from '@/components/ScoreCard';
import { ArrowLeft, RotateCcw, History, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function FeedbackPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { t } = useTranslation();
  const { currentSession, history, resetSession } = useAppStore();

  const [session, setSession] = useState<PracticeSession | null>(currentSession);

  useEffect(() => {
    if (!session && id) {
      // Find in history array or fetch history
      const found = history.find((s) => s.id === id);
      if (found) {
        setSession(found);
      } else {
        fetch('/api/history')
          .then((res) => res.json())
          .then((data) => {
            if (data.history) {
              const matched = data.history.find((s: PracticeSession) => s.id === id);
              if (matched) setSession(matched);
            }
          });
      }
    }
  }, [id, session, history]);

  // Type guard to ensure we only process Speaking sessions
  const isSpeakingSession = (s: PracticeSession): s is SpeakingSession => {
    return s.module === 'speaking';
  };

  if (!session) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (!isSpeakingSession(session)) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
            Feedback Not Available
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            This feedback page is only available for Speaking sessions. Please use the History page to view results for other modules.
          </p>
          <button
            onClick={() => router.push('/history')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl transition-all"
          >
            <History className="w-4 h-4" />
            Go to History
          </button>
        </div>
      </div>
    );
  }

  if (!session.evaluation) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Top Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetSession();
              router.push('/session');
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
          >
            <RotateCcw className="w-4 h-4" />
            {t('feedback.practice_again')}
          </button>

          <button
            onClick={() => router.push('/history')}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-2xl transition-all text-sm"
          >
            <History className="w-4 h-4" />
            {t('feedback.view_history')}
          </button>
        </div>
      </div>

      {/* Main ScoreCard Breakdown Component */}
      <ScoreCard evaluation={session.evaluation} />

      {/* User Transcript Box */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          <FileText className="w-4 h-4 text-brand-500" />
          Candidate Spoken Transcript
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-200 text-sm leading-relaxed font-mono">
          "{session.transcript}"
        </div>
      </div>
    </div>
  );
}
