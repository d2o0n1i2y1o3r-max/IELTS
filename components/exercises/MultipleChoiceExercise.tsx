'use client';

import React, { useState } from 'react';
import { Exercise } from '@/lib/types';
import { useTranslation } from 'react-i18next';

interface MultipleChoiceExerciseProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  language: 'en' | 'uz' | 'ru';
}

export default function MultipleChoiceExercise({ exercise, onAnswer, language }: MultipleChoiceExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const { t } = useTranslation();

  const questionText = exercise.translations?.[language] || exercise.question;

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(selectedOption);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && selectedOption) {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-lg font-semibold text-slate-900 dark:text-white">
        {questionText}
      </div>

      <div className="space-y-3" role="radiogroup" aria-label="Answer options">
        {exercise.options?.map((option, index) => (
          <button
            key={index}
            type="button"
            onClick={() => setSelectedOption(option)}
            onKeyDown={handleKeyPress}
            className={`w-full p-4 text-left rounded-xl border-2 transition-all ${
              selectedOption === option
                ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600'
            }`}
            aria-checked={selectedOption === option}
            role="radio"
            tabIndex={0}
          >
            <div className="flex items-center gap-3">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                selectedOption === option
                  ? 'border-brand-500 bg-brand-500'
                  : 'border-slate-300 dark:border-slate-600'
              }`}>
                {selectedOption === option && (
                  <div className="w-2.5 h-2.5 rounded-full bg-white" />
                )}
              </div>
              <span className="font-medium">{option}</span>
            </div>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedOption}
        className="w-full py-4 px-6 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 disabled:from-slate-400 disabled:to-slate-500 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg disabled:cursor-not-allowed disabled:opacity-60"
      >
        {t('learn.check')}
      </button>
    </div>
  );
}
