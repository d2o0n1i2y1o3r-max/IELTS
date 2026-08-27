'use client';

import React from 'react';
import MoodMascot from '@/components/MoodMascot';
import { useMascotMood } from '@/hooks/useMascotMood';

export default function MascotPage() {
  const { mood, angerLevel, handleCorrectAnswer, handleIncorrectAnswer, resetMood } = useMascotMood(3);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Mascot</h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
          Foydalanuvchining natijasiga qarab holatini o'zgartiruvchi interaktiv AI Buddy. Quyi tugmalar orqali sinab ko'ring.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center w-full max-w-md">
        <MoodMascot mood={mood} className="my-8" />
        
        <div className="mt-8 flex flex-col items-center w-full space-y-4">
          <div className="flex justify-between w-full text-sm font-medium text-slate-500 dark:text-slate-400 px-2">
            <span>Current Mood: <span className={mood === 'angry' ? 'text-red-500 font-bold' : 'text-blue-500 font-bold'}>{mood.toUpperCase()}</span></span>
            <span>Anger Level: <span className="font-bold">{angerLevel}</span> / 3</span>
          </div>
          
          <div className="flex gap-4 w-full">
            <button
              onClick={handleCorrectAnswer}
              className="flex-1 py-3 px-4 bg-emerald-100 hover:bg-emerald-200 text-emerald-700 dark:bg-emerald-900/30 dark:hover:bg-emerald-900/50 dark:text-emerald-400 rounded-xl font-medium transition-colors"
            >
              To'g'ri javob
            </button>
            <button
              onClick={handleIncorrectAnswer}
              className="flex-1 py-3 px-4 bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-900/30 dark:hover:bg-rose-900/50 dark:text-rose-400 rounded-xl font-medium transition-colors"
            >
              Noto'g'ri javob
            </button>
          </div>
          
          <button
            onClick={resetMood}
            className="mt-4 text-sm text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
