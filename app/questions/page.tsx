'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Question, ExamPart } from '@/lib/types';
import { BookOpen, Search, ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function QuestionsPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { setSelectedPart, setSelectedTopic, setCurrentQuestion } = useAppStore();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPart, setSelectedPartFilter] = useState<string>('all');
  const [selectedTopic, setSelectedTopicFilter] = useState<string>('All Topics');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetch('/api/questions')
      .then((res) => res.json())
      .then((data) => {
        if (data.questions) setQuestions(data.questions);
      })
      .finally(() => setLoading(false));
  }, []);

  const partsList: { id: string; label: string }[] = [
    { id: 'all', label: t('questions_page.all_parts') },
    { id: 'part1', label: 'Part 1' },
    { id: 'part2', label: 'Part 2 (Cue Card)' },
    { id: 'part3', label: 'Part 3' },
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
    'Food & Cooking',
  ];

  const filteredQuestions = questions.filter((q) => {
    const matchesPart = selectedPart === 'all' || q.part === selectedPart;
    const matchesTopic = selectedTopic === 'All Topics' || q.topic === selectedTopic;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.topic.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesPart && matchesTopic && matchesSearch;
  });

  const startPractice = (q: Question) => {
    setSelectedPart(q.part);
    setSelectedTopic(q.topic);
    setCurrentQuestion(q);
    router.push('/session');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-brand-500" />
          {t('questions_page.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {t('questions_page.subtitle')}
        </p>
      </div>

      {/* Filter Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('questions_page.search_placeholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          {/* Part Filter */}
          <select
            value={selectedPart}
            onChange={(e) => setSelectedPartFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {partsList.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>

          {/* Topic Filter */}
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopicFilter(e.target.value)}
            className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {topicsList.map((top) => (
              <option key={top} value={top}>
                {top}
              </option>
            ))}
          </select>
        </div>

        {/* Quick Topic Filter Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {topicsList.map((top) => {
            const isSelected = selectedTopic === top;
            return (
              <button
                key={top}
                type="button"
                onClick={() => setSelectedTopicFilter(top)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                }`}
              >
                {top === 'All Topics' ? t('home.all_topics') : top}
              </button>
            );
          })}
        </div>
      </div>

      {/* Questions Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12 text-slate-500 dark:text-slate-400">
          No prompts found matching your filter criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredQuestions.map((q) => (
            <div
              key={q.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between space-y-4 hover:border-brand-300 dark:hover:border-brand-800 transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400">
                    {q.part.toUpperCase()}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-semibold text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {q.timeLimit}s limit
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {q.topic}
                </div>

                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug">
                  "{q.question}"
                </h3>

                {q.bulletPoints && (
                  <ul className="space-y-1 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                    {q.bulletPoints.map((pt, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-brand-500">•</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <button
                onClick={() => startPractice(q)}
                className="w-full py-2.5 px-4 bg-brand-50 dark:bg-brand-950/60 hover:bg-brand-600 text-brand-700 dark:text-brand-300 hover:text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                {t('questions_page.start_this')} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
