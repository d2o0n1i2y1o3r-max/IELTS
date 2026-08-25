'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import Timer from '@/components/Timer';
import AudioRecorder from '@/components/AudioRecorder';
import { HelpCircle, Sparkles, Mic, Clock, Play, Pause, RotateCcw, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function PracticeSessionPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    currentQuestion,
    transcript,
    recordingState,
    prepTimeLeft,
    speakTimeLeft,
    elapsedSpeakingTime,
    setRecordingState,
    setPrepTimeLeft,
    setSpeakTimeLeft,
    setElapsedSpeakingTime,
    setCurrentSession,
    setTranscript,
    appendTranscript,
    resetSession,
    setCurrentQuestion,
    isFullTestMode,
    setFullTestResult
  } = useAppStore();

  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    if (!currentQuestion) {
      fetch('/api/questions')
        .then((res) => res.json())
        .then((data) => {
          if (isMounted && data.questions && data.questions.length > 0) {
            setCurrentQuestion(data.questions[0]);
          }
        })
        .catch(() => {
          if (isMounted) {
            setCurrentQuestion({
              id: 'q1',
              part: 'part1',
              topic: 'Hometown & Neighborhood',
              question: 'Can you describe the town or city where you grew up?',
              instructions: 'Answer in 2-3 detailed sentences.',
              timeLimit: 45,
              prepTime: 0
            });
          }
        });
    }
    return () => {
      setIsMounted(false);
    };
  }, [currentQuestion, setCurrentQuestion]);

  useEffect(() => {
    if (recordingState === 'evaluating' && currentQuestion) {
      const evaluate = async () => {
        try {
          const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              transcript: transcript || 'The candidate provided a short audio response.',
              questionText: currentQuestion?.question,
              part: currentQuestion?.part,
              topic: currentQuestion?.topic
            })
          });

          const data = await res.json();
          const evaluation = data.evaluation;

          const sessionObj = {
            id: `sess-${Date.now()}`,
            module: 'speaking' as const,
            createdAt: new Date().toISOString(),
            questionId: currentQuestion.id,
            part: currentQuestion.part,
            topic: currentQuestion.topic,
            questionText: currentQuestion.question,
            transcript: transcript || 'Audio response provided.',
            duration: elapsedSpeakingTime || 45,
            evaluation
          };

          if (isFullTestMode) {
            setFullTestResult('speaking', { evaluation, transcript, duration: elapsedSpeakingTime || 45 });
            router.push('/full-test/results');
          } else {
            await fetch('/api/history', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(sessionObj)
            });

            setCurrentSession(sessionObj);
            setRecordingState('completed');
            router.push(`/feedback/${sessionObj.id}`);
          }
        } catch {
          setRecordingState('idle');
        }
      };

      evaluate();
    }
  }, [
    recordingState,
    currentQuestion,
    transcript,
    elapsedSpeakingTime,
    router,
    setCurrentSession,
    setRecordingState
  ]);

  if (!currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  const isPart2 = currentQuestion.part === 'part2';

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              {currentQuestion.part.toUpperCase()}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              • {currentQuestion.topic}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            {t('session.title')}
          </h1>
        </div>

        {isPart2 && recordingState === 'idle' && (
          <button
            onClick={() => setRecordingState('preparing')}
            className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
          >
            Start 1-Min Prep Phase
          </button>
        )}
      </div>

      <Timer />

      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
          <HelpCircle className="w-4 h-4" />
          Examiner Question
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
          "{currentQuestion.question}"
        </h2>

        {currentQuestion.instructions && (
          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            {currentQuestion.instructions}
          </p>
        )}

        {currentQuestion.bulletPoints && currentQuestion.bulletPoints.length > 0 && (
          <div className="mt-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {t('session.cue_card_points')}
            </span>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-300">
              {currentQuestion.bulletPoints.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-brand-500 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <AudioRecorder />

      {recordingState === 'evaluating' && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto animate-bounce">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {t('session.evaluating_msg')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {t('session.evaluating_sub')}
              </p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-brand-500 h-full w-2/3 animate-pulse rounded-full" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
