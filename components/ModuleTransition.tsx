'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ModuleType } from '@/lib/types';
import { ArrowRight, CheckCircle, Headphones, BookOpen, PenTool, Mic, Trophy } from 'lucide-react';

const moduleIcons: Record<ModuleType, any> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenTool,
  speaking: Mic,
  'full-test': Trophy
};

const moduleNames: Record<ModuleType, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
  'full-test': 'Full Test'
};

const moduleSequence: ModuleType[] = ['listening', 'reading', 'writing', 'speaking'];

export default function ModuleTransition({ completedModule }: { completedModule: ModuleType }) {
  const router = useRouter();
  const { setCurrentModuleInSequence } = useAppStore();
  const [countdown, setCountdown] = useState(3);

  const currentIndex = moduleSequence.indexOf(completedModule);
  const nextModule = currentIndex < moduleSequence.length - 1 ? moduleSequence[currentIndex + 1] : null;

  useEffect(() => {
    if (!nextModule) {
      router.push('/full-test/results');
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCurrentModuleInSequence(nextModule);
          router.push(`/${nextModule === 'speaking' ? 'session' : nextModule}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [nextModule, router, setCurrentModuleInSequence]);

  const CompletedIcon = moduleIcons[completedModule];
  const NextIcon = nextModule ? moduleIcons[nextModule] : null;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto">
          <CheckCircle className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            {moduleNames[completedModule]} Complete!
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Great job! Moving to the next section.
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400">
                <CompletedIcon className="w-6 h-6" />
              </div>
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                {moduleNames[completedModule]}
              </span>
            </div>

            <ArrowRight className="w-6 h-6 text-slate-400" />

            {nextModule && (
              <div className="flex flex-col items-center gap-2">
                <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
                  <NextIcon className="w-6 h-6" />
                </div>
                <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {moduleNames[nextModule]}
                </span>
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
            {nextModule ? (
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Starting {moduleNames[nextModule]} in
                </p>
                <div className="text-5xl font-black font-mono text-brand-600 dark:text-brand-400">
                  {countdown}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Loading your results...
                </p>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-brand-500 h-full w-2/3 animate-pulse rounded-full" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
