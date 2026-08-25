'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { WritingPrompt, WritingTaskType } from '@/lib/types';
import { PenTool, Clock, FileText, Send, Sparkles, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function WritingPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    currentWritingPrompt,
    setCurrentWritingPrompt,
    writingEssay,
    setWritingEssay,
    writingTimeLeft,
    setWritingTimeLeft,
    writingState,
    setWritingState,
    isFullTestMode,
    setFullTestResult
  } = useAppStore();

  const [prompts, setPrompts] = useState<WritingPrompt[]>([]);
  const [selectedTaskType, setSelectedTaskType] = useState<WritingTaskType>('task2');
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    async function loadPrompts() {
      try {
        const res = await fetch('/api/writing-prompts');
        const data = await res.json();
        if (data.prompts) setPrompts(data.prompts);
      } catch (err) {
        console.error('Error loading writing prompts:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPrompts();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (writingState === 'writing' && writingTimeLeft > 0) {
      interval = setInterval(() => {
        setWritingTimeLeft(writingTimeLeft - 1);
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else if (writingTimeLeft === 0 && writingState === 'writing') {
      handleSubmit();
    }
    return () => clearInterval(interval);
  }, [writingState, writingTimeLeft, setWritingTimeLeft]);

  const selectPrompt = (prompt: WritingPrompt) => {
    setCurrentWritingPrompt(prompt);
    setWritingState('writing');
  };

  const handleSubmit = async () => {
    if (!currentWritingPrompt || !writingEssay.trim()) return;

    setWritingState('evaluating');
    try {
      const res = await fetch('/api/evaluate-writing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          essay: writingEssay,
          promptText: currentWritingPrompt.prompt,
          taskType: currentWritingPrompt.taskType,
          topic: currentWritingPrompt.sampleTopic
        })
      });

      const data = await res.json();
      const evaluation = data.evaluation;

      if (isFullTestMode) {
        setFullTestResult('writing', { evaluation, essay: writingEssay, duration: elapsedTime });
        router.push('/full-test/transition?module=writing');
      } else {
        const sessionObj = {
          id: `writing-${Date.now()}`,
          module: 'writing' as const,
          createdAt: new Date().toISOString(),
          promptId: currentWritingPrompt.id,
          taskType: currentWritingPrompt.taskType,
          topic: currentWritingPrompt.sampleTopic,
          promptText: currentWritingPrompt.prompt,
          essay: writingEssay,
          duration: elapsedTime,
          evaluation
        };

        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionObj)
        });

        router.push(`/feedback/${sessionObj.id}`);
      }
    } catch (err) {
      console.error('Error evaluating writing:', err);
      setWritingState('idle');
    }
  };

  const wordCount = writingEssay.trim().split(/\s+/).filter(Boolean).length;
  const filteredPrompts = prompts.filter(p => p.taskType === selectedTaskType);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (writingState === 'idle' && !currentWritingPrompt) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <PenTool className="w-8 h-8 text-brand-500" />
            IELTS Writing Practice
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Practice Task 1 (Academic/General) and Task 2 essays with AI evaluation
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setSelectedTaskType('task1')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${
              selectedTaskType === 'task1'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Task 1
          </button>
          <button
            onClick={() => setSelectedTaskType('task2')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all ${
              selectedTaskType === 'task2'
                ? 'bg-brand-600 text-white shadow-md'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Task 2
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPrompts.map((prompt) => (
            <div
              key={prompt.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => selectPrompt(prompt)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {prompt.taskType.toUpperCase()}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {Math.floor(prompt.timeLimit / 60)} minutes
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{prompt.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-3 mb-4">{prompt.prompt}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{prompt.minWords}-{prompt.maxWords} words</span>
                <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold">
                  Start Practice <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentWritingPrompt) {
    const minutes = Math.floor(writingTimeLeft / 60);
    const seconds = writingTimeLeft % 60;

    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                {currentWritingPrompt.taskType.toUpperCase()}
              </span>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {currentWritingPrompt.sampleTopic}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {currentWritingPrompt.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {wordCount} words
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            <PenTool className="w-4 h-4" />
            Writing Prompt
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
            {currentWritingPrompt.prompt}
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
            {currentWritingPrompt.instructions}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <textarea
            value={writingEssay}
            onChange={(e) => setWritingEssay(e.target.value)}
            placeholder="Start writing your essay here..."
            className="w-full h-96 p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
            disabled={writingState === 'evaluating'}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Target: {currentWritingPrompt.minWords}-{currentWritingPrompt.maxWords} words
            </span>
            <button
              onClick={handleSubmit}
              disabled={writingState !== 'writing' || wordCount < currentWritingPrompt.minWords}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-2xl shadow-md transition-all text-sm"
            >
              {writingState === 'evaluating' ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  Evaluating...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit for Evaluation
                </>
              )}
            </button>
          </div>
        </div>

        {writingState === 'evaluating' && (
          <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-md w-full text-center space-y-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
              <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto animate-bounce">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Analyzing your essay...
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Evaluating task achievement, coherence, lexical resource, and grammar against official band criteria.
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

  return null;
}
