'use client';

import React from 'react';
import { TopicTheory } from '@/lib/types';
import { BookOpen, CheckCircle, Lightbulb, Sparkles, X, ArrowRight, Bookmark } from 'lucide-react';

interface TopicTheoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: () => void;
  theory?: TopicTheory;
  title: string;
  level?: string;
}

export default function TopicTheoryModal({
  isOpen,
  onClose,
  onStart,
  theory,
  title,
  level = 'beginner',
}: TopicTheoryModalProps) {
  if (!isOpen) return null;

  // Fallback default theory if unit/lesson doesn't have an explicit one
  const safeTheory: TopicTheory = theory || {
    title: title || 'Dars Nazariyasi va Asosiy Qoidalar',
    summary:
      "Ushbu bo'limda siz mavzuning asosiy grammatik qoidalari, eng muhim so'z boyligi va IELTS imtihonida ballingizni oshiruvchi amaliy usullarni o'rganasiz.",
    rules: [
      "Present Simple: Doimiy takrorlanadigan ish-harakatlar uchun ishlatiladi (He/She/It fe'liga -s/-es qo'shiladi).",
      "To Be (am/is/are): Holat va kasb-korlarni ifodalashda egaga qarab to'g'ri tanlanishi shart.",
      "Imlo va tinish belgilari: Gap bosh harf bilan boshlanishi va oxirida nuqta qo'yilishi lozim.",
    ],
    vocabulary: [
      {
        word: 'Achieve',
        meaning: 'Erishmoq, qo\'lga kiritmoq',
        example: 'He worked hard to achieve a high score in IELTS.',
      },
      {
        word: 'Fluent',
        meaning: 'Ravon, erkin gapiruvchi',
        example: 'She is fluent in both English and Uzbek.',
      },
      {
        word: 'Practice',
        meaning: 'Mashq qilmoq, amaliyot',
        example: 'Daily speaking practice improves your pronunciation.',
      },
    ],
    tips: [
      "Savollarni diqqat bilan o'qing va ortiqcha so'z qo'shishdan saqlaning.",
      "Speaking va Listening mashqlarida tovushlarni aniq talaffuz qiling.",
      "Xato qilsangiz tushkunlikka tushmang, tizim sizga to'g'ri tushuntirishni beradi.",
    ],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
              <BookOpen className="w-3.5 h-3.5" />
              Mavzu Nazariyasi & Qoidalar
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              {safeTheory.title || title}
            </h2>
            <p className="text-xs text-blue-100 max-w-lg leading-relaxed">
              {safeTheory.summary}
            </p>
          </div>

          <button
            onClick={onClose}
            type="button"
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800 dark:text-slate-200">
          {/* Section 1: Grammar Rules */}
          {safeTheory.rules && safeTheory.rules.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-2">
                <Bookmark className="w-4 h-4" />
                Asosiy Qoidalar va Grammatika
              </h3>
              <div className="space-y-2">
                {safeTheory.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 text-xs sm:text-sm flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed text-slate-700 dark:text-slate-300">
                      {rule}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 2: Key Vocabulary */}
          {safeTheory.vocabulary && safeTheory.vocabulary.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Mavzuga oid muhim so'zlar (Vocabulary)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {safeTheory.vocabulary.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        {item.word}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                        {item.meaning}
                      </span>
                    </div>
                    {item.example && (
                      <p className="text-xs text-slate-500 italic dark:text-slate-400">
                        "{item.example}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: IELTS Tips */}
          {safeTheory.tips && safeTheory.tips.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                IELTS Imtihoni Uchun Maslahatlar
              </h3>
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 space-y-2">
                {safeTheory.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-amber-900 dark:text-amber-200">
                    <span className="text-amber-500 font-bold shrink-0">💡</span>
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Action Button */}
        <div className="p-4 sm:p-5 bg-slate-50 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 font-bold text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Yopish
          </button>
          <button
            type="button"
            onClick={onStart}
            className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-sm shadow-lg shadow-emerald-500/30 flex items-center gap-2 transition"
          >
            <span>Tushundim, Mashqlarni Boshlash</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
