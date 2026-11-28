'use client';

import React, { useState, useEffect } from 'react';
import { Exercise } from '@/lib/types';
import { Volume2, VolumeX, Sparkles, Check, Snail } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ListeningExerciseProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  language: 'en' | 'uz' | 'ru';
}

export default function ListeningExercise({
  exercise,
  onAnswer,
  language,
}: ListeningExerciseProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const { t } = useTranslation();

  const phraseToSpeak =
    exercise.audioPrompt || exercise.options?.[0] || exercise.correctAnswer;

  const playAudio = (rate: number = 0.95) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(phraseToSpeak);
    utterance.lang = 'en-US';
    utterance.rate = rate;

    // Pick English voice if available
    const voices = window.speechSynthesis.getVoices();
    const enVoice =
      voices.find((v) => v.lang.startsWith('en') && v.name.includes('Natural')) ||
      voices.find((v) => v.lang.startsWith('en'));
    if (enVoice) utterance.voice = enVoice;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  // Auto-play audio on initial mount
  useEffect(() => {
    const timer = setTimeout(() => {
      playAudio(0.95);
    }, 400);
    return () => clearTimeout(timer);
  }, [exercise.id]);

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(selectedOption);
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Instruction */}
      <div className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
        <Volume2 className="w-4 h-4" />
        Tinglash (Listening) Mashqi
      </div>

      <div className="text-lg font-bold text-slate-900 dark:text-white">
        {exercise.question || "Audioni eshiting va to'g'ri javobni tanlang:"}
      </div>

      {/* Audio Play Buttons */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50">
        <button
          type="button"
          onClick={() => playAudio(0.95)}
          className={`w-16 h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-all ${
            isPlaying ? 'ring-4 ring-blue-400 animate-pulse' : ''
          }`}
          title="Tinglash (Oddiy tezlik)"
        >
          <Volume2 className="w-8 h-8" />
        </button>

        <button
          type="button"
          onClick={() => playAudio(0.7)}
          className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs transition-all active:scale-95"
          title="Sekinroq tinglash (Slow motion)"
        >
          <Snail className="w-6 h-6 text-amber-500" />
        </button>

        <div className="text-xs text-slate-600 dark:text-slate-400">
          <p className="font-bold text-slate-800 dark:text-slate-200">
            {isPlaying ? "Audio ijro etilmoqda..." : "Tugmani bosib qayta eshiting"}
          </p>
          <p className="text-[11px] text-slate-500">
            IELTS imtihonida talaffuzni farqlash juda muhim.
          </p>
        </div>
      </div>

      {/* Options List */}
      <div className="space-y-3" role="radiogroup">
        {exercise.options?.map((option, index) => {
          const isSelected = selectedOption === option;

          return (
            <button
              key={index}
              type="button"
              onClick={() => setSelectedOption(option)}
              className={`w-full p-4 rounded-2xl border-2 text-left transition-all flex items-center justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100 font-bold shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-base">{option}</span>
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                  isSelected
                    ? 'border-blue-600 bg-blue-600 text-white'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
              >
                {isSelected && <Check className="w-4 h-4" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!selectedOption}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-black rounded-2xl shadow-lg shadow-blue-500/25 transition-all text-base disabled:cursor-not-allowed disabled:opacity-50"
      >
        Tekshirish (Check)
      </button>
    </div>
  );
}
