'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ModuleType } from '@/lib/types';
import { Play, Clock, Award, Headphones } from 'lucide-react';

const moduleSequence: ModuleType[] = ['listening', 'reading', 'writing', 'speaking'];
const moduleNames: Record<ModuleType, string> = {
  listening: 'Listening',
  reading: 'Reading',
  writing: 'Writing',
  speaking: 'Speaking',
  'full-test': 'Full Test'
};

export default function FullTestPage() {
  const router = useRouter();
  const { isFullTestMode, startFullTest, setCurrentModuleInSequence } = useAppStore();

  useEffect(() => {
    if (!isFullTestMode) {
      startFullTest();
    }
  }, [isFullTestMode, startFullTest]);

  const handleStart = () => {
    setCurrentModuleInSequence('listening');
    router.push('/listening');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mx-auto">
            <Play className="w-8 h-8" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            IELTS Full Test
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Complete all 4 sections in sequence, just like the real exam
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Test Structure</h2>
            <div className="space-y-3">
              {moduleSequence.map((module, index) => (
                <div key={module} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white">
                      {moduleNames[module]}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {module === 'listening' && '30 minutes • Audio passages with questions'}
                      {module === 'reading' && '60 minutes • Timed reading passages'}
                      {module === 'writing' && '60 minutes • Task 1 & Task 2 essays'}
                      {module === 'speaking' && '11-14 minutes • Speaking interview'}
                    </p>
                  </div>
                  <Clock className="w-5 h-5 text-slate-400" />
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-6 space-y-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <Award className="w-4 h-4" />
              <span>You'll receive a band score for each section plus an overall band score at the end</span>
            </div>
            <button
              onClick={handleStart}
              className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all text-lg"
            >
              Start Full Test
            </button>
          </div>
        </div>

        <div className="text-center text-sm text-slate-500 dark:text-slate-400">
          <p>This test follows the official IELTS exam order: Listening → Reading → Writing → Speaking</p>
        </div>
      </div>
    </div>
  );
}
