'use client';

import React from 'react';
import { Award, CheckCircle2, AlertCircle, Sparkles, TrendingUp, BookOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ScoreCardProps {
  evaluation: any;
  module?: string;
}

export default function ScoreCard({ evaluation, module = 'speaking' }: ScoreCardProps) {
  const { t } = useTranslation();

  const overallBand = Number(evaluation.overallBand ?? evaluation.band ?? 6.0);
  const cefrLevel = evaluation.cefrLevel || (overallBand >= 8 ? 'C2' : overallBand >= 7 ? 'C1' : overallBand >= 5.5 ? 'B2' : 'B1');

  const getBandBadgeColor = (band: number) => {
    if (band >= 8.0) return 'from-emerald-500 to-teal-600 text-white';
    if (band >= 7.0) return 'from-blue-500 to-indigo-600 text-white';
    if (band >= 6.0) return 'from-amber-500 to-orange-600 text-white';
    return 'from-rose-500 to-red-600 text-white';
  };

  // Build criteria dynamically based on module / available scores
  const criteriaScores = evaluation.criteriaScores || {};
  let criteria: Array<{ key: string; title: string; score: number }> = [];

  if (module === 'writing' || criteriaScores.taskAchievement !== undefined || evaluation.taskAchievement !== undefined) {
    criteria = [
      {
        key: 'ta',
        title: 'Task Achievement',
        score: Number(criteriaScores.taskAchievement ?? evaluation.taskAchievement ?? overallBand),
      },
      {
        key: 'cc',
        title: 'Coherence & Cohesion',
        score: Number(criteriaScores.coherenceCohesion ?? evaluation.coherence ?? overallBand),
      },
      {
        key: 'lr',
        title: 'Lexical Resource',
        score: Number(criteriaScores.lexicalResource ?? evaluation.lexicalResource ?? overallBand),
      },
      {
        key: 'gra',
        title: 'Grammar Accuracy',
        score: Number(criteriaScores.grammaticalRange ?? evaluation.grammar ?? overallBand),
      },
    ];
  } else if (module === 'reading' || module === 'listening') {
    const rawScore = evaluation.rawScore ?? 0;
    const total = evaluation.totalQuestions ?? 40;
    criteria = [
      {
        key: 'raw',
        title: 'Correct Answers',
        score: rawScore,
      },
      {
        key: 'total',
        title: 'Total Questions',
        score: total,
      },
      {
        key: 'pct',
        title: 'Accuracy',
        score: total > 0 ? Math.round((rawScore / total) * 100) : 0,
      },
      {
        key: 'band',
        title: 'Band Score',
        score: overallBand,
      },
    ];
  } else {
    // Speaking
    criteria = [
      {
        key: 'fluency',
        title: t('feedback.fluency', 'Fluency & Coherence'),
        score: Number(criteriaScores.fluencyCoherence ?? evaluation.fluency ?? overallBand),
      },
      {
        key: 'lexical',
        title: t('feedback.lexical', 'Lexical Resource'),
        score: Number(criteriaScores.lexicalResource ?? evaluation.lexical ?? overallBand),
      },
      {
        key: 'grammar',
        title: t('feedback.grammar', 'Grammar Accuracy'),
        score: Number(criteriaScores.grammaticalAccuracy ?? evaluation.grammar ?? overallBand),
      },
      {
        key: 'pronunciation',
        title: t('feedback.pronunciation', 'Pronunciation (est.)'),
        score: Number(criteriaScores.pronunciation ?? evaluation.pronunciation ?? overallBand),
      },
    ];
  }

  const strengths: string[] = evaluation.strengths || ['Good attempt on the task', 'Clear communicative response'];
  const weaknesses: string[] = evaluation.weaknesses || ['Continue expanding your active vocabulary', 'Focus on complex grammatical structures'];
  const modelAnswer = evaluation.modelAnswer || evaluation.improvedSample;
  const feedbackText = evaluation.detailedFeedback || evaluation.feedback || 'Well done! Keep practicing daily to reach your target band.';

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Overall Score & CEFR */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-semibold uppercase tracking-wider border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Official IELTS Band Benchmark
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold capitalize">{module} Evaluation</h2>
          <p className="text-slate-300 text-sm max-w-lg leading-relaxed">
            {feedbackText}
          </p>
          {evaluation.pronunciationNote && (
            <p className="text-[11px] text-slate-400 italic">
              ℹ️ {evaluation.pronunciationNote}
            </p>
          )}
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="text-center p-4 bg-slate-800/80 rounded-2xl border border-slate-700/60 min-w-[100px]">
            <div className="text-xs text-slate-400 font-medium uppercase">CEFR</div>
            <div className="text-2xl font-black text-blue-400">{cefrLevel}</div>
          </div>

          <div
            className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-gradient-to-tr ${getBandBadgeColor(
              overallBand
            )} p-4 flex flex-col items-center justify-center shadow-lg transform hover:scale-105 transition-transform`}
          >
            <Award className="w-6 h-6 mb-1 opacity-90" />
            <div className="text-3xl sm:text-4xl font-black font-mono">
              {overallBand.toFixed(1)}
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
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Score Breakdown
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
                <span className="text-lg font-extrabold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-0.5 rounded-lg">
                  {typeof item.score === 'number' ? (item.key === 'pct' ? `${item.score}%` : item.score.toFixed(1)) : item.score}
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, item.key === 'pct' ? item.score : (item.score / 9) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-6 rounded-3xl space-y-3">
          <h4 className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            Key Strengths
          </h4>
          <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-400/90 leading-relaxed">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 p-6 rounded-3xl space-y-3">
          <h4 className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            Areas for Improvement
          </h4>
          <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-400/90 leading-relaxed">
            {weaknesses.map((w, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-500 font-bold">•</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* High-Band Model Sample Answer */}
      {modelAnswer && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800/80 border border-blue-200 dark:border-slate-700 p-6 sm:p-8 rounded-3xl space-y-3 shadow-sm">
          <h4 className="font-bold text-blue-900 dark:text-blue-300 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Band 8.5+ Model Response
          </h4>
          <p className="text-slate-800 dark:text-slate-200 leading-relaxed italic text-sm sm:text-base bg-white/80 dark:bg-slate-900/80 p-5 rounded-2xl border border-blue-100 dark:border-slate-800">
            "{modelAnswer}"
          </p>
        </div>
      )}
    </div>
  );
}
