'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Unit, Lesson, LearnProgress } from '@/lib/types';
import {
  BookOpen,
  Lock,
  Star,
  Trophy,
  Sparkles,
  Zap,
  ArrowRight,
  GraduationCap,
  Layers,
  CheckCircle2,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getStoredUser, UserProfile } from '@/lib/userAuth';

type LevelKey = 'beginner' | 'elementary' | 'intermediate' | 'upper' | 'advanced';

interface LevelTab {
  id: LevelKey;
  label: string;
  cefr: string;
  band: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const LEVEL_TABS: LevelTab[] = [
  {
    id: 'beginner',
    label: "Boshlang'ich",
    cefr: 'A1 · A2',
    band: 'Band 3.5 – 4.0',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    borderColor: 'border-emerald-500',
  },
  {
    id: 'elementary',
    label: 'Elementary',
    cefr: 'A2 · B1',
    band: 'Band 4.5 – 5.0',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    borderColor: 'border-blue-500',
  },
  {
    id: 'intermediate',
    label: "O'rta (Intermediate)",
    cefr: 'B1 · B2',
    band: 'Band 5.5 – 6.0',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    borderColor: 'border-purple-500',
  },
  {
    id: 'upper',
    label: 'Upper-Intermediate',
    cefr: 'B2 · C1',
    band: 'Band 6.5 – 7.0',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderColor: 'border-amber-500',
  },
  {
    id: 'advanced',
    label: 'Advanced (Yuqori)',
    cefr: 'C1 · C2',
    band: 'Band 7.5 – 9.0',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
    borderColor: 'border-rose-500',
  },
];

export default function LearnPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('beginner');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const stored = getStoredUser();
        setUserProfile(stored);

        // Detect user's registered level
        let initialLevel: LevelKey = 'beginner';
        if (stored && (stored as any).overallLevel) {
          const lvl = (stored as any).overallLevel as LevelKey;
          if (LEVEL_TABS.some((t) => t.id === lvl)) {
            initialLevel = lvl;
          }
        }
        setSelectedLevel(initialLevel);

        const userId = stored?.id || 'user-default';

        const [unitsRes, lessonsRes, progressRes] = await Promise.all([
          fetch('/api/learn/units'),
          fetch('/api/learn/lessons'),
          fetch(`/api/learn/progress?userId=${userId}`),
        ]);

        const unitsData = await unitsRes.json();
        const lessonsData = await lessonsRes.json();
        const progressData = await progressRes.json();

        setUnits(unitsData.units || []);
        setLessons(lessonsData.lessons || []);
        setProgress(progressData);
      } catch (error) {
        console.error('Error loading learn data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  // Filter units for the selected level
  const filteredUnits = units.filter((u) => {
    if (u.level) {
      return u.level === selectedLevel;
    }
    // Fallback for older units: default to intermediate
    return selectedLevel === 'intermediate';
  });

  const getLessonState = (lessonId: string, lessonOrder: number, unitOrder: number) => {
    if (!progress) return 'unlocked';
    const completedLesson = progress.completedLessons?.[lessonId];
    if (completedLesson) return 'completed';

    // In level mode, unlock the first lesson of the unit directly
    if (lessonOrder === 1) return 'unlocked';

    const previousLessonId = lessons.find(
      (l) => l.unitId === `unit-${unitOrder}` && l.order === lessonOrder - 1
    )?.id;

    if (previousLessonId && progress.completedLessons?.[previousLessonId]) return 'unlocked';
    return 'unlocked'; // Allow open practice across levels
  };

  const getStars = (lessonId: string) => {
    return progress?.completedLessons?.[lessonId]?.stars || 0;
  };

  const handleLessonClick = (lessonId: string) => {
    router.push(`/learn/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        <p className="text-xs text-slate-500">Darslar va mashqlar yuklanmoqda...</p>
      </div>
    );
  }

  const activeTabMeta = LEVEL_TABS.find((t) => t.id === selectedLevel) || LEVEL_TABS[0];
  const userRegisteredLevel = ((userProfile as any)?.overallLevel as LevelKey) || 'beginner';
  const isCurrentUsersLevel = selectedLevel === userRegisteredLevel;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 px-4">
      {/* ─── Header & User Level Banner ─── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-brand-500" />
              IELTS Darslar va Mashqlar
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Darajangizga moslashtirilgan interaktiv grammatika, lug'at va IELTS amaliy mashg'ulotlari.
            </p>
          </div>

          {/* XP Badge */}
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs self-start">
            <div className="p-2 bg-amber-500/10 text-amber-500 rounded-xl">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400">Jami Ball (XP)</div>
              <div className="text-lg font-black text-slate-900 dark:text-white">
                {progress?.xp || 0} XP
              </div>
            </div>
          </div>
        </div>

        {/* Personalized Level Prompt */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl text-white shadow-lg shadow-indigo-500/15 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5" />
              Siz tanlagan daraja
            </div>
            <h2 className="text-lg sm:text-xl font-black">
              {LEVEL_TABS.find((t) => t.id === userRegisteredLevel)?.label || 'Beginner'} darajasi
            </h2>
            <p className="text-xs text-blue-100 max-w-lg">
              {isCurrentUsersLevel
                ? "Ayni paytda ro'yxatdan o'tishda tanlagan darajangiz bo'yicha maxsus darslar va mashqlar ko'rsatilmoqda."
                : "Siz boshqa darajani ko'rmoqdasiz. O'z darajangizga qaytish uchun yuqoridagi yorliqdan foydalanishingiz mumkin."}
            </p>
          </div>

          {!isCurrentUsersLevel && (
            <button
              type="button"
              onClick={() => setSelectedLevel(userRegisteredLevel)}
              className="px-4 py-2.5 bg-white text-indigo-700 hover:bg-blue-50 font-bold rounded-xl text-xs transition shadow-sm self-start sm:self-auto"
            >
              Mening darajamga o'tish
            </button>
          )}
        </div>
      </div>

      {/* ─── Level Selector Tabs ─── */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Darajani tanlang:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LEVEL_TABS.map((tab) => {
            const isSelected = selectedLevel === tab.id;
            const isUserDefault = userRegisteredLevel === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedLevel(tab.id)}
                className={`relative p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? `${tab.bgColor} ${tab.borderColor} ring-2 ring-blue-500/40 shadow-sm`
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isUserDefault && (
                  <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-blue-600 text-white shadow-xs">
                    Sizniki
                  </span>
                )}
                <div className={`text-xs font-bold truncate ${isSelected ? tab.color : 'text-slate-800 dark:text-slate-200'}`}>
                  {tab.label}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {tab.cefr}
                </div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {tab.band}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Units & Lessons for the selected level ─── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-brand-500" />
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {activeTabMeta.label} uchun darslar va mashqlar
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-semibold">
            {filteredUnits.length} ta modul
          </span>
        </div>

        {filteredUnits.length === 0 ? (
          <div className="text-center py-12 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <GraduationCap className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Bu daraja uchun darslar tayyorlanmoqda
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Boshqa darajalarni tanlab interaktiv mashqlarni bajarishingiz mumkin.
            </p>
          </div>
        ) : (
          filteredUnits.map((unit) => (
            <div
              key={unit.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                    Modul {unit.order}
                  </span>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                    {unit.topic}
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                  {unit.lessons.length} ta dars
                </span>
              </div>

              {/* Lesson Items */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {unit.lessons.map((lessonId, idx) => {
                  const lesson = lessons.find((l) => l.id === lessonId);
                  if (!lesson) return null;

                  const stars = getStars(lessonId);
                  const isDone = stars > 0;
                  const exerciseCount = lesson.exercises?.length || 4;

                  return (
                    <div
                      key={lessonId}
                      onClick={() => handleLessonClick(lessonId)}
                      className="group p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-brand-500/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all cursor-pointer flex flex-col justify-between gap-3 shadow-xs hover:shadow-md"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400">
                            Dars {idx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition">
                            {lesson.title}
                          </h4>
                        </div>

                        {isDone ? (
                          <div className="flex items-center gap-1 text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full text-xs font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-500" />
                            <span>{stars}/3</span>
                          </div>
                        ) : (
                          <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-brand-500 transition">
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500">
                        <span className="flex items-center gap-1">
                          <Zap className="w-3.5 h-3.5 text-brand-500" />
                          {exerciseCount} ta mashq
                        </span>
                        <span className="font-bold text-brand-600 dark:text-brand-400 group-hover:underline">
                          Mashqni boshlash →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
