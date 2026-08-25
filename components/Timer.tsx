'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Clock, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function Timer() {
  const {
    currentQuestion,
    recordingState,
    setRecordingState,
    prepTimeLeft,
    setPrepTimeLeft,
    speakTimeLeft,
    setSpeakTimeLeft
  } = useAppStore();

  const { t } = useTranslation();

  useEffect(() => {
    let prepInterval: any = null;
    if (recordingState === 'preparing' && prepTimeLeft > 0) {
      prepInterval = setInterval(() => {
        setPrepTimeLeft(prepTimeLeft - 1);
      }, 1000);
    } else if (recordingState === 'preparing' && prepTimeLeft === 0) {
      setRecordingState('recording');
    }
    return () => clearInterval(prepInterval);
  }, [recordingState, prepTimeLeft, setPrepTimeLeft, setRecordingState]);

  useEffect(() => {
    let speakInterval: any = null;
    if (recordingState === 'recording' && speakTimeLeft > 0) {
      speakInterval = setInterval(() => {
        setSpeakTimeLeft(speakTimeLeft - 1);
      }, 1000);
    }
    return () => clearInterval(speakInterval);
  }, [recordingState, speakTimeLeft, setSpeakTimeLeft]);

  if (!currentQuestion) return null;

  const isPrepPhase = recordingState === 'preparing';
  const activeTime = isPrepPhase ? prepTimeLeft : speakTimeLeft;
  const maxTime = isPrepPhase ? currentQuestion.prepTime || 60 : currentQuestion.timeLimit || 45;
  const percentage = Math.max(0, Math.min(100, (activeTime / maxTime) * 100));

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div
          className={`p-2.5 rounded-xl ${
            isPrepPhase
              ? 'bg-amber-100 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400'
              : 'bg-brand-100 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
          }`}
        >
          <Clock className="w-5 h-5" />
        </div>
        <div>
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            {isPrepPhase ? t('session.prep_timer_label') : t('session.speak_timer_label')}
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
            {formatTime(activeTime)}
          </div>
        </div>
      </div>

      {isPrepPhase && (
        <button
          onClick={() => {
            setPrepTimeLeft(0);
            setRecordingState('recording');
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-sm transition-all"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          {t('session.skip_prep')}
        </button>
      )}

      <div className="w-24 sm:w-32 bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isPrepPhase ? 'bg-amber-500' : 'bg-brand-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
