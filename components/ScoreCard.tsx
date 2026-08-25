'use client';

import React from 'react';
import { EvaluationResult } from '@/lib/types';
import { Award, CheckCircle2, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ScoreCardProps {
  evaluation: EvaluationResult;
}

export default function ScoreCard({ evaluation }: ScoreCardProps) {
  const { t } = useTranslation();

  const getBandBadgeColor = (band: number) => {
    if (band >= 8.0) return 'from-emerald-500 to-teal-600 text-white';
    if (band >= 7.0) return 'from-brand-500 to-blue-600 text-white';
    if (band >= 6.0) return 'from-amber-500 to-orange-600 text-white';
    return 'from-rose-500 to-red-600 text-white';
  };

  const criteria = [
    {
      key: 'fluency',
      title: t('feedback.fluency'),
      score: evaluation.criteriaScores.fluencyCoherence,
    },
    {
      key: 'lexical',
      title: t('feedback.lexical'),
      score: evaluation.criteriaScores.lexicalResource,
    },
    {
      key: 'grammar',
      title: t('feedback.grammar'),
      score: evaluation.criteriaScores.grammaticalAccuracy,
    },
    {
      key: 'pronunciation',
      title: t('feedback.pronunciation'),
      score: evaluation.criteriaScores.pronunciation,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner: Overall Score & CEFR */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-500/20 text-brand-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-brand-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            AI Official Band Benchmark
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">{t('feedback.title')}</h2>
          <p className="text-slate-400 text-sm max-w-lg">
            {evaluation.detailedFeedback}
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 min-w-[100px]">
            <div className="text-xs text-slate-400 font-medium uppercase">CEFR</div>
            <div className="text-2xl font-black text-brand-400">{evaluation.cefrLevel}</div>
          </div>

          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${getBandBadgeColor(
              evaluation.overallBand
            )} p-4 flex flex-col items-center justify-center shadow-lg shadow-brand-500/20 transform hover:scale-105 transition-transform`}
          >
            <Award className="w-6 h-6 mb-1 opacity-90" />
            <div className="text-3xl sm:text-4xl font-black font-mono">
              {evaluation.overallBand.toFixed(1)}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold opacity-80">
              Band Score
            </div>
          </div>
        </div>
      </div>

      {/* Criteria Breakdown Grid */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-500" />
          {t('feedback.criteria_heading')}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {criteria.map((item) => (
            <div
              key={item.key}
              className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {item.title}
                </span>
                <span className="text-lg font-extrabold font-mono text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 px-2.5 py-0.5 rounded-lg">
                  {item.score.toFixed(1)}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item.score / 9) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-6 rounded-3xl space-y-3">
          <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            {t('feedback.strengths_title')}
          </h4>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-400/90 leading-relaxed">
            {evaluation.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Weaknesses */}
        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-3xl space-y-3">
          <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            {t('feedback.weaknesses_title')}
          </h4>
          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-400/90 leading-relaxed">
            {evaluation.weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Band 8.5+ Model Sample Answer */}
      <div className="bg-gradient-to-br from-brand-50 to-blue-50 dark:from-slate-900 dark:to-slate-800/80 border border-brand-200 dark:border-slate-700 p-6 sm:p-8 rounded-3xl space-y-3 shadow-sm">
        <h4 className="font-bold text-brand-900 dark:text-brand-300 text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          {t('feedback.improved_sample_title')}
        </h4>
        <p className="text-slate-700 dark:text-slate-300 leading-relaxed italic text-base bg-white/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-brand-100 dark:border-slate-800">
          "{evaluation.improvedSample}"
        </p>
      </div>
    </div>
  );
}
