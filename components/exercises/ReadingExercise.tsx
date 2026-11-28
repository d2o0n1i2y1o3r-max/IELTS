'use client';

import React, { useState } from 'react';
import { Exercise } from '@/lib/types';
import { BookOpenText, ChevronDown, ChevronUp } from 'lucide-react';

interface ReadingExerciseProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  language?: 'en' | 'uz' | 'ru';
}

export default function ReadingExercise({ exercise, onAnswer, language = 'uz' }: ReadingExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [passageExpanded, setPassageExpanded] = useState(true);

  const labels = {
    uz: {
      header: "O'qish mashqi",
      readPassage: "Matnni o'qing va savolga javob bering:",
      submit: "Tekshirish",
      selectAnswer: "Javobni tanlang",
    },
    en: {
      header: 'Reading Exercise',
      readPassage: 'Read the passage and answer the question:',
      submit: 'Check',
      selectAnswer: 'Select your answer',
    },
    ru: {
      header: 'Упражнение на чтение',
      readPassage: 'Прочитайте текст и ответьте на вопрос:',
      submit: 'Проверить',
      selectAnswer: 'Выберите ответ',
    },
  };

  const l = labels[language] || labels.uz;

  const handleSubmit = () => {
    if (!selectedOption || submitted) return;
    setSubmitted(true);
    onAnswer(selectedOption);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/25">
          <BookOpenText className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-xs font-bold text-teal-500 uppercase tracking-wider">
            {l.header}
          </span>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {l.readPassage}
          </p>
        </div>
      </div>

      {/* Reading Passage */}
      {exercise.readingPassage && (
        <div className="rounded-2xl border-2 border-teal-200 dark:border-teal-900/50 overflow-hidden">
          {/* Passage Header */}
          <button
            onClick={() => setPassageExpanded(!passageExpanded)}
            className="w-full flex items-center justify-between px-4 py-3 bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-950/50 transition"
          >
            <div className="flex items-center gap-2">
              <BookOpenText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <span className="text-sm font-bold text-teal-700 dark:text-teal-300">
                📖 Matn
              </span>
            </div>
            {passageExpanded ? (
              <ChevronUp className="w-4 h-4 text-teal-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-teal-500" />
            )}
          </button>

          {/* Passage Body */}
          {passageExpanded && (
            <div className="px-5 py-4 bg-white dark:bg-slate-900/50">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-line">
                {exercise.readingPassage}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Question */}
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
        <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
          ❓ {exercise.question}
        </h3>
      </div>

      {/* Options */}
      {exercise.options && (
        <div className="space-y-3">
          {exercise.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            return (
              <button
                key={idx}
                onClick={() => !submitted && setSelectedOption(option)}
                disabled={submitted}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30 shadow-md shadow-teal-500/10 scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-teal-300 dark:hover:border-teal-700'
                } ${submitted ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isSelected
                        ? 'border-teal-500 bg-teal-500 text-white'
                        : 'border-slate-300 dark:border-slate-600 text-slate-400'
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      isSelected
                        ? 'text-teal-700 dark:text-teal-300'
                        : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {option}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!selectedOption || submitted}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
          selectedOption && !submitted
            ? 'bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/25 hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
        }`}
      >
        {l.submit}
      </button>
    </div>
  );
}
