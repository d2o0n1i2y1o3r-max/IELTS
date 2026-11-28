'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Exercise } from '@/lib/types';
import { PenLine, Send, AlertTriangle, CheckCircle2, Type } from 'lucide-react';

interface WritingExerciseProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  language?: 'en' | 'uz' | 'ru';
}

export default function WritingExercise({ exercise, onAnswer, language = 'uz' }: WritingExerciseProps) {
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const minWords = exercise.minWords || 5;

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const hasEnoughWords = wordCount >= minWords;

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [text]);

  const handleSubmit = () => {
    if (!hasEnoughWords || submitted) return;
    setSubmitted(true);

    // Check if key phrases are present, or just accept if word count met
    const keyPhrases = exercise.keyPhrases || [];
    const normalizedText = text.toLowerCase().trim();

    if (keyPhrases.length > 0) {
      // Check if at least half of the key phrases are present
      const matchCount = keyPhrases.filter((phrase) =>
        normalizedText.includes(phrase.toLowerCase())
      ).length;
      const threshold = Math.max(1, Math.ceil(keyPhrases.length * 0.4));

      if (matchCount >= threshold) {
        onAnswer(exercise.correctAnswer); // Mark as correct
      } else {
        onAnswer(text); // Send user's text (will be compared and likely incorrect)
      }
    } else {
      // No key phrases — accept if word count is met
      if (hasEnoughWords) {
        onAnswer(exercise.correctAnswer); // Auto-accept
      } else {
        onAnswer(text);
      }
    }
  };

  const labels = {
    uz: {
      prompt: 'Yozma topshiriq',
      placeholder: "Bu yerga yozing...",
      words: 'so\'z',
      minRequired: `Kamida ${minWords} so'z yozing`,
      submit: 'Yuborish',
      tip: exercise.writingPrompt || exercise.question,
    },
    en: {
      prompt: 'Writing Task',
      placeholder: 'Write your answer here...',
      words: 'words',
      minRequired: `Write at least ${minWords} words`,
      submit: 'Submit',
      tip: exercise.writingPrompt || exercise.question,
    },
    ru: {
      prompt: 'Письменное задание',
      placeholder: 'Напишите ответ здесь...',
      words: 'слов',
      minRequired: `Напишите минимум ${minWords} слов`,
      submit: 'Отправить',
      tip: exercise.writingPrompt || exercise.question,
    },
  };

  const l = labels[language] || labels.uz;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/25">
          <PenLine className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-xs font-bold text-purple-500 uppercase tracking-wider">
            {l.prompt}
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {exercise.question}
          </h3>
        </div>
      </div>

      {/* Writing Prompt / Instructions */}
      {exercise.writingPrompt && (
        <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50">
          <p className="text-sm text-purple-800 dark:text-purple-300 leading-relaxed">
            💡 {exercise.writingPrompt}
          </p>
        </div>
      )}

      {/* Textarea */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={submitted}
          placeholder={l.placeholder}
          rows={4}
          className={`w-full p-4 rounded-2xl border-2 text-base resize-none transition-all duration-200 focus:outline-none focus:ring-0 ${
            submitted
              ? 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-500'
              : hasEnoughWords
              ? 'border-emerald-300 dark:border-emerald-700 bg-emerald-50/50 dark:bg-emerald-950/20 focus:border-emerald-500'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:border-purple-500 dark:focus:border-purple-400'
          }`}
          style={{ minHeight: '120px' }}
        />

        {/* Word Counter Badge */}
        <div
          className={`absolute bottom-3 right-3 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
            hasEnoughWords
              ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
          }`}
        >
          <Type className="w-3 h-3" />
          {wordCount} / {minWords} {l.words}
          {hasEnoughWords && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
        </div>
      </div>

      {/* Min words warning */}
      {!hasEnoughWords && text.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>{l.minRequired}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={!hasEnoughWords || submitted}
        className={`w-full py-4 px-6 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-200 ${
          hasEnoughWords && !submitted
            ? 'bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white shadow-lg shadow-purple-500/25 hover:scale-[1.02] active:scale-[0.98]'
            : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
        }`}
      >
        <Send className="w-5 h-5" />
        {l.submit}
      </button>
    </div>
  );
}
