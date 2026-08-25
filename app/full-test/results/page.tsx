'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ModuleType } from '@/lib/types';
import { Award, Headphones, BookOpen, PenTool, Mic, Trophy, TrendingUp, Calendar, Clock, ArrowRight, Home } from 'lucide-react';

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

const moduleColors: Record<ModuleType, string> = {
  listening: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  reading: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  writing: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  speaking: 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400',
  'full-test': 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
};

export default function FullTestResultsPage() {
  const router = useRouter();
  const { fullTestResults, fullTestSessionId, resetFullTest, setHistory } = useAppStore();
  const [saving, setSaving] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const saveFullTest = async () => {
      if (!fullTestSessionId || Object.keys(fullTestResults).length === 0) return;

      const moduleBands: Record<string, number> = {
        listening: fullTestResults.listening?.evaluation?.overallBand || 0,
        reading: fullTestResults.reading?.evaluation?.overallBand || 0,
        writing: fullTestResults.writing?.evaluation?.overallBand || 0,
        speaking: fullTestResults.speaking?.evaluation?.overallBand || 0
      };

      const overallBand = Object.values(moduleBands).reduce((sum, band) => sum + band, 0) / 4;

      const fullTestSession = {
        id: fullTestSessionId,
        module: 'full-test' as const,
        createdAt: new Date().toISOString(),
        moduleResults: fullTestResults,
        moduleBands,
        overallBand,
        evaluation: {
          overallBand,
          cefrLevel: overallBand >= 8.0 ? 'C2' : overallBand >= 7.0 ? 'C1' : overallBand >= 5.5 ? 'B2' : 'B1',
          detailedFeedback: `Full IELTS Test completed. Overall Band Score: ${overallBand.toFixed(1)}`
        }
      };

      await fetch('/api/history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fullTestSession)
      });

      const historyRes = await fetch('/api/history');
      const historyData = await historyRes.json();
      if (historyData.history) setHistory(historyData.history);

      setSaving(false);
      setSaved(true);
      resetFullTest();
    };

    saveFullTest();
  }, [fullTestResults, fullTestSessionId, resetFullTest, setHistory]);

  const moduleBands: Record<string, number> = {
    listening: fullTestResults.listening?.evaluation?.overallBand || 0,
    reading: fullTestResults.reading?.evaluation?.overallBand || 0,
    writing: fullTestResults.writing?.evaluation?.overallBand || 0,
    speaking: fullTestResults.speaking?.evaluation?.overallBand || 0
  };

  const overallBand = Object.values(moduleBands).reduce((sum, band) => sum + band, 0) / 4;
  const cefrLevel = overallBand >= 8.0 ? 'C2' : overallBand >= 7.0 ? 'C1' : overallBand >= 5.5 ? 'B2' : 'B1';

  if (saving) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto animate-bounce">
            <Trophy className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Saving your results...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4">
      <div className="max-w-4xl mx-auto space-y-8 py-8">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/20 mx-auto">
            <Trophy className="w-10 h-10" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white">
            Full Test Complete!
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Your IELTS Band Score Results
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="text-center space-y-4">
            <div className="text-6xl font-black font-mono text-brand-600 dark:text-brand-400">
              {overallBand.toFixed(1)}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold text-slate-900 dark:text-white">
                Overall Band Score
              </div>
              <div className="text-lg text-slate-600 dark:text-slate-400">
                CEFR Level: {cefrLevel}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(Object.keys(moduleBands) as ModuleType[]).map((module) => {
              const Icon = moduleIcons[module];
              const band = moduleBands[module];
              return (
                <div key={module} className={`p-4 rounded-2xl ${moduleColors[module]}`}>
                  <Icon className="w-6 h-6 mb-2" />
                  <div className="text-2xl font-black font-mono">
                    {band.toFixed(1)}
                  </div>
                  <div className="text-xs font-semibold">
                    {moduleNames[module]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Module Breakdown</h2>
          <div className="space-y-4">
            {(Object.keys(moduleBands) as ModuleType[]).map((module) => {
              const Icon = moduleIcons[module];
              const band = moduleBands[module];
              const result = fullTestResults[module];
              const percentage = (band / 9) * 100;
              return (
                <div key={module} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${moduleColors[module]}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {moduleNames[module]}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {result?.evaluation?.cefrLevel || 'B2'} Level
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
                      {band.toFixed(1)}
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-brand-600 to-brand-400 h-full rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => router.push('/')}
            className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Return Home
          </button>
          <button
            onClick={() => router.push('/history')}
            className="flex-1 py-4 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            View History
          </button>
        </div>
      </div>
    </div>
  );
}
