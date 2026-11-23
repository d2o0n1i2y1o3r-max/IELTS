'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Unit, Lesson, LearnProgress } from '@/lib/types';
import { BookOpen, Lock, Star, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function LearnPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useAppStore();

  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Get userId from localStorage
        const userId = typeof window !== 'undefined' ? localStorage.getItem('registered_user')?.replace(/"/g, '').replace(/'/g, '') : null;
        const userData = userId ? JSON.parse(userId) : null;

        if (!userData?.id) {
          router.push('/auth');
          return;
        }

        const [unitsRes, lessonsRes, progressRes] = await Promise.all([
          fetch('/api/learn/units'),
          fetch('/api/learn/lessons'),
          fetch(`/api/learn/progress?userId=${userData.id}`),
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

  const getLessonState = (lessonId: string, lessonOrder: number, unitOrder: number) => {
    if (!progress) return 'locked';

    const completedLesson = progress.completedLessons[lessonId];
    if (completedLesson) return 'completed';

    // Check if previous lesson is completed
    const previousLessonId = lessons.find(
      (l) => l.unitId === `unit-${unitOrder}` && l.order === lessonOrder - 1
    )?.id;

    if (lessonOrder === 1 && unitOrder === 1) return 'unlocked';
    if (previousLessonId && progress.completedLessons[previousLessonId]) return 'unlocked';

    return 'locked';
  };

  const getStars = (lessonId: string) => {
    return progress?.completedLessons[lessonId]?.stars || 0;
  };

  const handleLessonClick = (lessonId: string, state: string) => {
    if (state === 'locked') return;
    router.push(`/learn/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-500" />
          {t('learn.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400">{t('learn.subtitle')}</p>
      </div>

      {/* XP Display */}
      {progress && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-brand-100 dark:bg-brand-950 rounded-xl">
            <Trophy className="w-5 h-5 text-brand-500" />
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{t('learn.xp')}</div>
            <div className="text-xl font-bold text-slate-900 dark:text-white">{progress.xp}</div>
          </div>
        </div>
      )}

      {/* Learning Path */}
      <div className="space-y-8">
        {units.map((unit) => (
          <div key={unit.id} className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{unit.topic}</h2>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />

              <div className="space-y-4">
                {unit.lessons.map((lessonId, index) => {
                  const lesson = lessons.find((l) => l.id === lessonId);
                  if (!lesson) return null;

                  const state = getLessonState(lessonId, lesson.order, unit.order);
                  const stars = getStars(lessonId);

                  return (
                    <div key={lessonId} className="relative pl-16">
                      {/* Node */}
                      <div
                        onClick={() => handleLessonClick(lessonId, state)}
                        className={`absolute left-4 w-5 h-5 rounded-full border-4 transition-all cursor-pointer ${
                          state === 'completed'
                            ? 'bg-brand-500 border-brand-500'
                            : state === 'unlocked'
                            ? 'bg-white dark:bg-slate-900 border-brand-500 hover:scale-110'
                            : 'bg-slate-200 dark:bg-slate-700 border-slate-300 dark:border-slate-600'
                        }`}
                      >
                        {state === 'locked' && <Lock className="w-3 h-3 text-slate-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />}
                      </div>

                      {/* Lesson Card */}
                      <div
                        onClick={() => handleLessonClick(lessonId, state)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          state === 'completed'
                            ? 'bg-brand-50 dark:bg-brand-950/50 border-brand-500'
                            : state === 'unlocked'
                            ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-brand-500'
                            : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">{lesson.title}</h3>
                          </div>

                          {state === 'completed' && (
                            <div className="flex gap-1">
                              {[1, 2, 3].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= stars ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          {state === 'locked' && <Lock className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
