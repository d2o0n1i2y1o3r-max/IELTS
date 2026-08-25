'use client';

import React from 'react';
import { PracticeSession } from '@/lib/types';

interface HistoryChartProps {
  sessions: PracticeSession[];
}

export default function HistoryChart({ sessions }: HistoryChartProps) {
  if (!sessions || sessions.length === 0) return null;

  // Chronological sort
  const sorted = [...sessions].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const maxScore = 9;

  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-slate-900 dark:text-white text-base">
          Score Progression (IELTS Band 1 - 9)
        </h3>
        <span className="text-xs font-semibold px-2.5 py-1 bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 rounded-lg">
          {sorted.length} Sessions Logged
        </span>
      </div>

      <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800 px-2">
        {sorted.map((session, idx) => {
          const band = session.evaluation?.overallBand || 6.0;
          const heightPercent = (band / maxScore) * 100;
          const dateLabel = new Date(session.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
          });

          return (
            <div key={session.id || idx} className="flex-1 flex flex-col items-center gap-2 group">
              <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
                {band.toFixed(1)}
              </div>
              <div className="w-full max-w-[36px] bg-slate-100 dark:bg-slate-800 rounded-t-xl overflow-hidden h-full flex items-end">
                <div
                  className="w-full bg-gradient-to-t from-brand-600 to-brand-400 group-hover:from-brand-500 group-hover:to-blue-400 transition-all rounded-t-xl"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>
              <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 truncate w-full text-center">
                {dateLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
