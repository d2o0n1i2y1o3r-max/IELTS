'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface MoodMascotProps {
  mood: 'calm' | 'angry';
  className?: string;
}

export default function MoodMascot({ mood, className }: MoodMascotProps) {
  return (
    <div className={twMerge("relative w-48 h-48 flex items-center justify-center", className)}>
      <div
        className={clsx(
          "absolute inset-0 rounded-full blur-xl opacity-50 transition-colors duration-700 ease-in-out",
          mood === 'calm' ? 'bg-blue-400 dark:bg-blue-500' : 'bg-red-400 dark:bg-red-500'
        )}
      />
      <div
        className={clsx(
          "relative w-32 h-32 rounded-full shadow-lg transition-all duration-700 ease-in-out flex items-center justify-center overflow-hidden",
          mood === 'calm' 
            ? 'bg-gradient-to-br from-blue-400 to-blue-600 scale-100 animate-[bounce_3s_infinite]' 
            : 'bg-gradient-to-br from-red-500 to-rose-700 scale-110 animate-[pulse_1s_infinite]'
        )}
      >
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="flex gap-4">
            <div className={clsx(
              "w-3 bg-white rounded-full transition-all duration-500",
              mood === 'calm' ? 'h-4' : 'h-2 rotate-12'
            )} />
            <div className={clsx(
              "w-3 bg-white rounded-full transition-all duration-500",
              mood === 'calm' ? 'h-4' : 'h-2 -rotate-12'
            )} />
          </div>
          <div className={clsx(
            "w-8 bg-white rounded-full transition-all duration-500",
            mood === 'calm' ? 'h-2 mt-2' : 'h-1 mt-4 opacity-70'
          )} />
        </div>
      </div>
    </div>
  );
}
