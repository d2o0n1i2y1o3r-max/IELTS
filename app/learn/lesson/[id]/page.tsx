'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Lesson, Exercise, LearnProgress } from '@/lib/types';
import { ArrowRight, CheckCircle, AlertCircle, Loader2, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Exercise components
import MultipleChoiceExercise from '@/components/exercises/MultipleChoiceExercise';
import FillBlankExercise from '@/components/exercises/FillBlankExercise';
import MatchPairsExercise from '@/components/exercises/MatchPairsExercise';
import ErrorCorrectionExercise from '@/components/exercises/ErrorCorrectionExercise';
import ListeningExercise from '@/components/exercises/ListeningExercise';
import SpeakingExercise from '@/components/exercises/SpeakingExercise';
import TopicTheoryModal from '@/components/TopicTheoryModal';

function normalizeAnswerText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[’`]/g, "'")
    .replace(/[.,!?;:()]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\bhe's\b/g, 'he is')
    .replace(/\bshe's\b/g, 'she is')
    .replace(/\bit's\b/g, 'it is')
    .replace(/\bthey're\b/g, 'they are')
    .replace(/\bwe're\b/g, 'we are')
    .replace(/\byou're\b/g, 'you are')
    .replace(/\bdon't\b/g, 'do not')
    .replace(/\bdoesn't\b/g, 'does not')
    .replace(/\bdidn't\b/g, 'did not')
    .replace(/\bwon't\b/g, 'will not')
    .replace(/\bcan't\b/g, 'cannot');
}

function checkIsAnswerCorrect(userAns: string, correctAns: string, exerciseType?: string): boolean {
  if (!userAns || !correctAns) return false;

  const normUser = normalizeAnswerText(userAns);
  const normCorrect = normalizeAnswerText(correctAns);

  if (normUser === normCorrect) return true;

  if (exerciseType === 'error-correction') {
    const userWords = normUser.split(' ').filter(Boolean);
    const correctWords = normCorrect.split(' ').filter(Boolean);

    // If user typed the corrected verb or word directly (e.g. 'is' or 'are -> is')
    if (userWords.length <= 3 && userWords.every((w) => correctWords.includes(w) || w === 'to' || w === '->')) {
      return true;
    }
  }

  if (normUser.replace(/\s/g, '') === normCorrect.replace(/\s/g, '')) return true;

  return false;
}

export default function LessonPlayerPage() {
  const router = useRouter();
  const params = useParams();
  const { language, setCurrentLesson, addExerciseResult, exerciseResults } = useAppStore();
  const { t } = useTranslation();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [wrongAnswers, setWrongAnswers] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [showTheoryModal, setShowTheoryModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        let userData: any = null;
        if (typeof window !== 'undefined') {
          const raw = localStorage.getItem('ielts_user_profile') || localStorage.getItem('registered_user');
          try {
            userData = raw ? JSON.parse(raw) : null;
          } catch {}
        }

        const effectiveUserId = userData?.id || 'user-default';

        const [lessonsRes, progressRes] = await Promise.all([
          fetch('/api/learn/lessons'),
          fetch(`/api/learn/progress?userId=${effectiveUserId}`),
        ]);

        const lessonsData = await lessonsRes.json();
        const progressData = await progressRes.json();

        const lessonData = lessonsData.lessons.find((l: Lesson) => l.id === params.id);

        if (!lessonData) {
          router.push('/learn');
          return;
        }

        setLesson(lessonData);
        setProgress(progressData);
        setCurrentLesson(lessonData);
        setStartTime(Date.now());
      } catch (error) {
        console.error('Error loading lesson:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id, router, setCurrentLesson]);

  const currentExercise = lesson?.exercises[currentExerciseIndex];
  const progressPercent = lesson ? ((currentExerciseIndex) / lesson.exercises.length) * 100 : 0;

  const handleAnswer = async (answer: string) => {
    if (!currentExercise || !progress) return;

    setSubmitting(true);

    const correct = checkIsAnswerCorrect(
      answer,
      currentExercise.correctAnswer,
      currentExercise.type
    );
    setIsCorrect(correct);
    setShowFeedback(true);

    addExerciseResult(currentExercise.id, correct);

    if (!correct) {
      // Add to wrong answers for re-queue
      wrongAnswers.push(currentExercise);
      setWrongAnswers([...wrongAnswers]);
    }

    setSubmitting(false);
  };

  const handleContinue = () => {
    setShowFeedback(false);

    // Check if we have wrong answers to re-queue
    if (wrongAnswers.length > 0 && currentExerciseIndex >= (lesson?.exercises.length || 0) - 1) {
      // Add wrong answers to the end
      setLesson((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          exercises: [...prev.exercises, ...wrongAnswers],
        };
      });
      setWrongAnswers([]);
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else if (currentExerciseIndex < (lesson?.exercises.length || 0) - 1) {
      setCurrentExerciseIndex(currentExerciseIndex + 1);
    } else {
      // Lesson complete
      completeLesson();
    }
  };

  const completeLesson = async () => {
    if (!lesson || !progress) return;

    const correctCount = Object.values(exerciseResults).filter((v) => v).length;
    const totalExercises = lesson.exercises.length;
    const duration = Math.floor((Date.now() - startTime) / 1000);

    try {
      const res = await fetch('/api/learn/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: progress.userId,
          lessonId: lesson.id,
          exercisesCompleted: lesson.exercises.map((e) => e.id),
          correctCount,
          totalExercises,
          duration,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push(`/learn/complete?lessonId=${lesson.id}&stars=${data.stars}&xp=${data.progress.xp}`);
      } else {
        console.error('Failed to complete lesson:', data.error);
      }
    } catch (error) {
      console.error('Error completing lesson:', error);
    }
  };

  const renderExercise = () => {
    if (!currentExercise) return null;

    const components: Record<string, any> = {
      'multiple-choice': MultipleChoiceExercise,
      'fill-blank': FillBlankExercise,
      'match-pairs': MatchPairsExercise,
      'error-correction': ErrorCorrectionExercise,
      'listening': ListeningExercise,
      'speaking': SpeakingExercise,
    };

    const ExerciseComponent = components[currentExercise.type];

    if (!ExerciseComponent) {
      return <div className="text-red-500">Unknown exercise type</div>;
    }

    return (
      <ExerciseComponent
        exercise={currentExercise}
        onAnswer={handleAnswer}
        language={language as 'en' | 'uz' | 'ru'}
      />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-10 h-10 animate-spin text-brand-500" />
      </div>
    );
  }

  if (!lesson) {
    return <div className="text-center text-slate-500">Lesson not found</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      {/* Progress Bar & Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white">
              {lesson.title}
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              {currentExerciseIndex + 1} / {lesson.exercises.length}
            </span>
          </div>

          {/* Theory Guidebook Button */}
          <button
            type="button"
            onClick={() => setShowTheoryModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-bold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition active:scale-95"
            title="Mavzu qoidalari va tushuntirishlarni ko'rish"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Mavzu Qoidalari</span>
          </button>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-blue-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Topic Theory Modal */}
      <TopicTheoryModal
        isOpen={showTheoryModal}
        onClose={() => setShowTheoryModal(false)}
        onStart={() => setShowTheoryModal(false)}
        theory={lesson.theory}
        title={lesson.title}
        level={lesson.level}
      />

      {/* Exercise */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
        {showFeedback ? (
          <div className="space-y-6">
            <div
              className={`p-4 rounded-xl border-2 ${
                isCorrect
                  ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900'
                  : 'bg-red-50 dark:bg-red-950/50 border-red-200 dark:border-red-900'
              }`}
            >
              <div className="flex items-start gap-3">
                {isCorrect ? (
                  <CheckCircle className="w-6 h-6 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`font-semibold ${isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'}`}>
                    {isCorrect ? t('learn.correct') : t('learn.incorrect')}
                  </p>
                  {!isCorrect && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                      {t('learn.correct_answer')}: {currentExercise?.correctAnswer}
                    </p>
                  )}
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                    {currentExercise?.explanation}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleContinue}
              disabled={submitting}
              className="w-full py-4 px-6 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg flex items-center justify-center gap-2"
            >
              {t('learn.continue')}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        ) : (
          renderExercise()
        )}
      </div>
    </div>
  );
}
