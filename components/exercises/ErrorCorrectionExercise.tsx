'use client';

import React, { useState } from 'react';
import { Exercise } from '@/lib/types';
import { useTranslation } from 'react-i18next';

interface ErrorCorrectionExerciseProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  language: 'en' | 'uz' | 'ru';
}

export default function ErrorCorrectionExercise({ exercise, onAnswer, language }: ErrorCorrectionExerciseProps) {
  const [userAnswer, setUserAnswer] = useState<string>('');
  const { t } = useTranslation();

  const questionText = exercise.translations?.[language] || exercise.question;

  const handleSubmit = () => {
    if (userAnswer.trim()) {
      onAnswer(userAnswer.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && userAnswer.trim()) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold text-slate-900 dark:text-white">
        {questionText}
      </div>

      <div>
        <textarea
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Type the corrected sentence..."
          rows={4}
          className="w-full px-4 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all text-lg resize-none"
          aria-label="Corrected sentence"
        />
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!userAnswer.trim()}
        className="w-full py-4 px-6 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t('learn.check')}
      </button>
    </div>
  );
}
