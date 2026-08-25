'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { PracticeSession, ModuleType, FullTestSession } from '@/lib/types';
import HistoryChart from '@/components/HistoryChart';
import { History, Award, Trash2, ChevronRight, Mic, Calendar, Clock, PenTool, BookOpen, Headphones, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const moduleIcons: Record<ModuleType, any> = {
  speaking: Mic,
  writing: PenTool,
  reading: BookOpen,
  listening: Headphones,
  'full-test': Trophy
};

const moduleColors: Record<ModuleType, string> = {
  speaking: 'bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400',
  writing: 'bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400',
  reading: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400',
  listening: 'bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400',
  'full-test': 'bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
};

export default function HistoryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { history, setHistory } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<ModuleType | 'all'>('all');

  useEffect(() => {
    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setHistory(data.history);
      })
      .finally(() => setLoading(false));
  }, [setHistory]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/history?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.history) setHistory(data.history);
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  };

  const filteredHistory = selectedModule === 'all' 
    ? history 
    : history.filter(sess => sess.module === selectedModule);

  const getModuleLabel = (module: ModuleType) => {
    const labels: Record<ModuleType, string> = {
      speaking: 'Speaking',
      writing: 'Writing',
      reading: 'Reading',
      listening: 'Listening',
      'full-test': 'Full Test'
    };
    return labels[module];
  };

  const getSessionTitle = (session: PracticeSession) => {
    if (session.module === 'speaking') {
      return (session as any).questionText;
    } else if (session.module === 'writing') {
      return (session as any).promptText;
    } else if (session.module === 'reading') {
      return (session as any).passageTitle;
    } else if (session.module === 'listening') {
      return (session as any).passageTitle;
    } else if (session.module === 'full-test') {
      return 'Full IELTS Test';
    }
    return 'Practice Session';
  };

  const getSessionTopic = (session: PracticeSession) => {
    if (session.module === 'speaking') {
      return (session as any).topic;
    } else if (session.module === 'writing') {
      return (session as any).topic;
    } else if (session.module === 'reading') {
      return (session as any).topic;
    } else if (session.module === 'listening') {
      return (session as any).topic;
    } else if (session.module === 'full-test') {
      return 'All Sections';
    }
    return 'General';
  };

  const getSessionSubLabel = (session: PracticeSession) => {
    if (session.module === 'speaking') {
      return (session as any).part?.toUpperCase() || 'PART 1';
    } else if (session.module === 'writing') {
      return (session as any).taskType?.toUpperCase() || 'TASK 2';
    } else if (session.module === 'reading') {
      return 'READING';
    } else if (session.module === 'listening') {
      return 'LISTENING';
    } else if (session.module === 'full-test') {
      return 'FULL TEST';
    }
    return 'PRACTICE';
  };

  const getSessionDuration = (session: PracticeSession) => {
    if (session.module === 'full-test') {
      return '-';
    }
    return (session as any).duration || 0;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
          <History className="w-8 h-8 text-brand-500" />
          {t('history.title')}
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          {t('history.subtitle')}
        </p>
      </div>

      {/* Module Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedModule('all')}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${
            selectedModule === 'all'
              ? 'bg-brand-600 text-white shadow-md'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          All Modules
        </button>
        {(['speaking', 'writing', 'reading', 'listening', 'full-test'] as ModuleType[]).map((module) => {
          const Icon = moduleIcons[module];
          return (
            <button
              key={module}
              onClick={() => setSelectedModule(module)}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                selectedModule === module
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              {getModuleLabel(module)}
            </button>
          );
        })}
      </div>

      {/* Progress Chart */}
      <HistoryChart sessions={filteredHistory} />

      {/* Sessions List / Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-500" />
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-4">
          <History className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto" />
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            {selectedModule === 'all' ? t('history.no_sessions') : `No ${getModuleLabel(selectedModule as ModuleType)} sessions recorded yet.`}
          </h3>
          <button
            onClick={() => router.push(selectedModule === 'all' ? '/' : `/${selectedModule}`)}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md text-sm transition-all"
          >
            {selectedModule === 'all' ? 'Start First Practice Session' : `Start ${getModuleLabel(selectedModule as ModuleType)} Practice`}
          </button>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredHistory.map((sess: PracticeSession) => {
              const band = sess.evaluation?.overallBand || 6.0;
              const dateStr = new Date(sess.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });
              const Icon = moduleIcons[sess.module];
              const moduleColor = moduleColors[sess.module];

              return (
                <div
                  key={sess.id}
                  onClick={() => router.push(`/feedback/${sess.id}`)}
                  className="p-5 sm:p-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${moduleColor}`}>
                        {getSessionSubLabel(sess)}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {getSessionTopic(sess)}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug line-clamp-2">
                      {getSessionTitle(sess)}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {dateStr}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {getSessionDuration(sess)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <div className="text-right">
                      <div className="text-2xl font-black font-mono text-brand-600 dark:text-brand-400 flex items-center gap-1">
                        <Award className="w-5 h-5 text-amber-500" />
                        {band.toFixed(1)}
                      </div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        {sess.evaluation?.cefrLevel || 'B2'} Level
                      </div>
                    </div>

                    <button
                      onClick={(e) => handleDelete(sess.id, e)}
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-xl transition-colors"
                      title={t('history.delete_session')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
