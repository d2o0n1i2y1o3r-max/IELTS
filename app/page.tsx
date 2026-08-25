'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ExamPart, Question, PracticeSession } from '@/lib/types';
import { Mic, ArrowRight, BookOpen, Sparkles, Award, History, Layers, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setSelectedPart, setSelectedTopic, setCurrentQuestion, setHistory, history } = useAppStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ExamPart>('part1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All Topics');

  useEffect(() => {
    async function loadData() {
      try {
        const [qRes, hRes] = await Promise.all([
          fetch('/api/questions'),
          fetch('/api/history')
        ]);
        const qData = await qRes.json();
        const hData = await hRes.json();

        if (qData.questions) setQuestions(qData.questions);
        if (hData.history) setHistory(hData.history);
      } catch (err) {
        console.error('Error fetching home data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [setHistory]);

  const examFormats: { id: ExamPart; title: string; desc: string; badge: string }[] = [
    {
      id: 'part1',
      title: t('home.part1_title'),
      desc: t('home.part1_desc'),
      badge: '4-5 Mins',
    },
    {
      id: 'part2',
      title: t('home.part2_title'),
      desc: t('home.part2_desc'),
      badge: '1m Prep + 2m Talk',
    },
    {
      id: 'part3',
      title: t('home.part3_title'),
      desc: t('home.part3_desc'),
      badge: '4-5 Mins',
    },
    {
      id: 'cefr',
      title: t('home.cefr_title'),
      desc: t('home.cefr_desc'),
      badge: 'B1 - C1 Level',
    },
  ];

  const topicsList = [
    'All Topics',
    'Hometown & Neighborhood',
    'Work & Education',
    'Technology & Daily Life',
    'Free Time & Hobbies',
    'Memorable Experiences',
    'People & Role Models',
    'Environment & Nature',
    'Tourism & Globalization',
  ];

  const startPracticeSession = (questionToStart?: Question) => {
    let target = questionToStart;
    if (!target) {
      const filtered = questions.filter((q) => {
        const matchesPart = q.part === activeTab || activeTab === 'cefr';
        const matchesTopic = selectedCategory === 'All Topics' || q.topic === selectedCategory;
        return matchesPart && matchesTopic;
      });

      if (filtered.length > 0) {
        target = filtered[Math.floor(Math.random() * filtered.length)];
      } else if (questions.length > 0) {
        target = questions[0];
      }
    }

    if (target) {
      setSelectedPart(target.part);
      setSelectedTopic(target.topic);
      setCurrentQuestion(target);
      router.push('/session');
    }
  };

  const completedCount = history.length;
  const latestSession: PracticeSession | undefined = history[0];
  const avgScore =
    completedCount > 0
      ? (history.reduce((acc, curr) => acc + (curr.evaluation?.overallBand || 6.0), 0) / completedCount).toFixed(1)
      : '0.0';

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 rounded-3xl p-8 sm:p-12 text-white shadow-2xl border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-brand-400" />
            AI-Powered Speaking Examiner
          </div>

          <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
            {t('home.hero_title')}
          </h1>

          <p className="text-slate-300 text-base sm:text-lg leading-relaxed max-w-2xl">
            {t('home.hero_subtitle')}
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => startPracticeSession()}
              className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all text-base"
            >
              <Mic className="w-5 h-5" />
              {t('home.start_btn')}
            </button>

            <button
              onClick={() => router.push('/full-test')}
              className="flex items-center gap-2 px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold rounded-2xl shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all text-base"
            >
              <Trophy className="w-5 h-5" />
              Full Test
            </button>

            <button
              onClick={() => router.push('/questions')}
              className="flex items-center gap-2 px-6 py-4 bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-semibold rounded-2xl border border-slate-700 transition-all text-base"
            >
              <BookOpen className="w-5 h-5 text-brand-400" />
              {t('home.explore_bank')}
            </button>
          </div>
        </div>

        {/* Decorative Blurred Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full filter blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />
      </section>

      {/* Quick Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-brand-50 dark:bg-brand-950/60 rounded-2xl text-brand-600 dark:text-brand-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('home.latest_score')}
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {latestSession ? latestSession.evaluation?.overallBand.toFixed(1) : 'N/A'}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-blue-50 dark:bg-blue-950/60 rounded-2xl text-blue-600 dark:text-blue-400">
            <History className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('home.sessions_completed')}
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {completedCount}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/60 rounded-2xl text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {t('home.avg_score')}
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white">
              {avgScore}
            </div>
          </div>
        </div>
      </section>

      {/* Select Practice Format Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {t('home.select_part')}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Choose your target IELTS module or CEFR speaking test module.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {examFormats.map((fmt) => {
            const isSelected = activeTab === fmt.id;
            return (
              <div
                key={fmt.id}
                onClick={() => setActiveTab(fmt.id)}
                className={`cursor-pointer p-6 rounded-3xl border transition-all duration-200 space-y-4 relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-brand-500 shadow-xl shadow-brand-500/10 ring-2 ring-brand-500'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                      {fmt.badge}
                    </span>
                    {isSelected && (
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-pulse" />
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">{fmt.title}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {fmt.desc}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTab(fmt.id);
                    startPracticeSession();
                  }}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-brand-500 hover:text-white'
                  }`}
                >
                  Start {fmt.title} <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Select Topic Category */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {t('home.select_topic')}
          </h2>
          <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-3 py-1 rounded-full border border-brand-200 dark:border-brand-900">
            Selected: {selectedCategory}
          </span>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {topicsList.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setSelectedTopic(cat);
                }}
                className={`px-4 py-2.5 text-xs font-bold rounded-2xl border transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-md shadow-brand-600/30 scale-105'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping mr-0.5" />}
                {cat === 'All Topics' ? t('home.all_topics') : cat}
              </button>
            );
          })}
        </div>
      </section>

      {/* Features Overview */}
      <section className="bg-slate-100/70 dark:bg-slate-900/60 rounded-3xl p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white text-center">
          {t('home.features_title')}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <Mic className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t('home.feat_1_title')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('home.feat_1_desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t('home.feat_2_title')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('home.feat_2_desc')}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Layers className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">{t('home.feat_3_title')}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {t('home.feat_3_desc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
