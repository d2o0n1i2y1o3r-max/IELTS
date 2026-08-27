'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface AIMascotProps {
  mood: 'calm' | 'agitated';
  isThinking?: boolean;
  className?: string;
}

export default function AIMascot({ mood, isThinking, className }: AIMascotProps) {
  return (
    <div className={twMerge("relative w-48 h-48 flex items-center justify-center transition-all duration-700", className)}>
      {/* Glow effect */}
      <div
        className={clsx(
          "absolute inset-0 rounded-full blur-2xl opacity-40 transition-colors duration-1000 ease-in-out",
          mood === 'calm' ? 'bg-blue-400 dark:bg-blue-500' : 'bg-red-400 dark:bg-red-500',
          isThinking && "animate-pulse opacity-70"
        )}
      />
      
      {/* Main body */}
      <div
        className={clsx(
          "relative w-32 h-32 rounded-[2rem] shadow-xl transition-all duration-1000 ease-in-out flex items-center justify-center overflow-hidden",
          mood === 'calm' 
            ? 'bg-gradient-to-br from-blue-400 to-blue-600' 
            : 'bg-gradient-to-br from-red-500 to-rose-700 scale-105',
          isThinking ? 'animate-[bounce_2s_infinite]' : (mood === 'calm' ? 'animate-[pulse_4s_infinite]' : 'animate-[pulse_1.5s_infinite]')
        )}
        style={{
          borderRadius: isThinking ? '50%' : (mood === 'calm' ? '40% 60% 70% 30% / 40% 50% 60% 50%' : '30% 70% 40% 60% / 50% 30% 70% 50%'),
        }}
      >
        <div className="flex flex-col items-center justify-center gap-2 mt-2">
          {/* Eyes */}
          <div className="flex gap-5">
            <div className={clsx(
              "bg-white rounded-full transition-all duration-500",
              mood === 'calm' ? 'w-3 h-5' : 'w-4 h-3 rotate-12',
              isThinking && 'h-2 w-4 animate-ping'
            )} />
            <div className={clsx(
              "bg-white rounded-full transition-all duration-500",
              mood === 'calm' ? 'w-3 h-5' : 'w-4 h-3 -rotate-12',
              isThinking && 'h-2 w-4 animate-ping'
            )} />
          </div>
          {/* Mouth */}
          <div className={clsx(
            "bg-white rounded-full transition-all duration-500",
            mood === 'calm' ? 'w-6 h-2 mt-1' : 'w-8 h-1 mt-3 opacity-80',
            isThinking && 'w-3 h-3 mt-2'
          )} />
        </div>
      </div>
    </div>
  );
}
