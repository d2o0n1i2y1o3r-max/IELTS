'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Mic,
  PenTool,
  BookOpen,
  Headphones,
  Star,
  Zap,
  Trophy,
  User,
  Pencil,
  Clock,
  Target,
  Calendar,
  LogOut,
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
type Level = 'beginner' | 'elementary' | 'intermediate' | 'upper' | 'advanced';

interface LevelOption {
  value: Level;
  label: string;
  band: string;
  desc: string;
  color: string;
  bg: string;
  border: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const LEVELS: LevelOption[] = [
  {
    value: 'beginner',
    label: "Boshlang'ich",
    band: 'Band 1–3',
    desc: 'IELTS bilan endigina tanishyapman',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/40',
    border: 'border-red-300 dark:border-red-800',
  },
  {
    value: 'elementary',
    label: 'Asosiy',
    band: 'Band 3.5–4.5',
    desc: "Ba'zi grammatika va so'zlarni bilaman",
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-300 dark:border-orange-800',
  },
  {
    value: 'intermediate',
    label: "O'rta",
    band: 'Band 5–5.5',
    desc: 'Ingliz tilida muloqot qila olaman',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-300 dark:border-yellow-800',
  },
  {
    value: 'upper',
    label: "Yuqori o'rta",
    band: 'Band 6–7',
    desc: "Ingliz tilida erkin so'zlasha olaman",
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-800',
  },
  {
    value: 'advanced',
    label: "Ilg'or",
    band: 'Band 7.5–9',
    desc: 'Ingliz tilini yaxshi bilaman',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
];

const TARGET_BANDS = [
  { value: '6.0', label: 'Band 6.0', desc: "Universitet yoki kollej talabi", emoji: '🎯' },
  { value: '6.5', label: 'Band 6.5', desc: "Xalqaro standart va viza talablari", emoji: '🚀' },
  { value: '7.0', label: 'Band 7.0', desc: "Top universitetlar va to'liq grantlar", emoji: '⭐' },
  { value: '7.5', label: 'Band 7.5', desc: "Magistratura va xalqaro stipendiyalar", emoji: '🔥' },
  { value: '8.0+', label: 'Band 8.0 - 9.0', desc: "Eng yuqori ekspert darajasi", emoji: '👑' },
];

const GOALS = [
  { value: 'study_abroad', label: "🎓 Chet elda o'qish", desc: 'Xalqaro universitetlar uchun IELTS' },
  { value: 'work_abroad', label: '💼 Xorijda ishlash', desc: 'Xalqaro kompaniyalarda karyera' },
  { value: 'immigration', label: '✈️ Immigratsiya', desc: "Doimiy yashash va ko'chib o'tish" },
  { value: 'local_degree', label: "🏛️ O'zbekistonda magistratura / ish", desc: 'Davlat granti yoki ish talabi' },
  { value: 'general', label: '📚 Shaxsiy rivojlanish', desc: 'Ingliz tili darajasini oshirish' },
];

const SKILL_EVAL_OPTIONS = [
  { value: 'low', label: "Boshlang'ich (Band 4.0 - 5.0)", desc: "Qiyinchilik bilan so'z topaman, tez toliqaman", emoji: '🔴' },
  { value: 'mid', label: "O'rta (Band 5.5 - 6.0)", desc: "Oddiy mavzularda tushunaman va fikrimni yetkaza olaman", emoji: '🟡' },
  { value: 'high', label: "Yaxshi (Band 6.5 - 7.0)", desc: "Erkin va deyarli xatolarsiz bajara olaman", emoji: '🟢' },
  { value: 'pro', label: "A'lo (Band 7.5+)", desc: "Murakkab mavzularda ham bemalol fikr yurita olaman", emoji: '🌟' },
];

const TIMELINES = [
  { value: '1_month', label: '⚡ 1 oy ichida', desc: 'Tezkor intensiv tayyorgarlik' },
  { value: '3_months', label: '📅 2-3 oy ichida', desc: "O'rtacha va tizimli tayyorgarlik" },
  { value: '6_months', label: '🗓️ 6 oy ichida', desc: "Har tomonlama chuqur o'rganish" },
  { value: '1_year', label: '🎓 1 yil ichida', desc: "Boshlang'ichdan yuqori darajagacha" },
  { value: 'not_set', label: '🤔 Hali aniq emas', desc: 'Shunchaki bilimimni sinash uchun' },
];

const DAILY_TIMES = [
  { value: 15, label: '15 daqiqa / kun', desc: 'Yengil rejim (Haftasiga ~1.5 soat)', emoji: '🌱' },
  { value: 30, label: '30 daqiqa / kun', desc: 'Optimal rejim (Haftasiga ~3.5 soat)', emoji: '⚡' },
  { value: 45, label: '45 daqiqa / kun', desc: 'Intensiv rejim (Haftasiga ~5.5 soat)', emoji: '🔥' },
  { value: 60, label: '1 soat+ / kun', desc: 'Maksimal rejim (Haftasiga 7+ soat)', emoji: '🏆' },
];

// ─── Storage helpers ──────────────────────────────────────────────────────────
function saveProfile(profile: Record<string, unknown>) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ielts_user_profile', JSON.stringify(profile));
    window.dispatchEvent(new Event('ielts_auth_changed'));
  }
}

function loadProfile(): Record<string, unknown> | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('ielts_user_profile');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AuthPage() {
  const router = useRouter();
  const [step, setStep] = useState<number>(0);
  const [nickname, setNickname] = useState('');
  const [overallLevel, setOverallLevel] = useState<Level | null>(null);
  const [targetBand, setTargetBand] = useState<string | null>(null);
  const [goal, setGoal] = useState<string | null>(null);
  const [speakingLevel, setSpeakingLevel] = useState<string | null>(null);
  const [writingLevel, setWritingLevel] = useState<string | null>(null);
  const [listeningLevel, setListeningLevel] = useState<string | null>(null);
  const [readingLevel, setReadingLevel] = useState<string | null>(null);
  const [examTimeline, setExamTimeline] = useState<string | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);

  const [existingProfile, setExistingProfile] = useState<Record<string, unknown> | null>(null);
  const [editMode, setEditMode] = useState<boolean>(false);

  useEffect(() => {
    const isRegisterMode =
      typeof window !== 'undefined' &&
      (window.location.search.includes('register') || window.location.search.includes('mode=new'));

    const profile = loadProfile();
    if (profile && !isRegisterMode) {
      setExistingProfile(profile);
    } else {
      setStep(1);
    }
  }, []);

  // ── Step helpers ────────────────────────────────────────────────────────────
  const totalSteps = 10; // Exactly 10 questions
  const currentStepNum = step; // 1-based questions start at step 1

  const canProceed = () => {
    if (step === 1) return nickname.trim().length >= 2;
    if (step === 2) return overallLevel !== null;
    if (step === 3) return targetBand !== null;
    if (step === 4) return goal !== null;
    if (step === 5) return speakingLevel !== null;
    if (step === 6) return writingLevel !== null;
    if (step === 7) return listeningLevel !== null;
    if (step === 8) return readingLevel !== null;
    if (step === 9) return examTimeline !== null;
    if (step === 10) return weeklyGoal !== null;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;

    if (step < 10) {
      setStep(step + 1);
    } else {
      // Step 10 finished -> Save profile and go to completion step 11
      const profile = {
        id: `user-${Date.now()}`,
        name: nickname.trim(),
        nickname: nickname.trim(),
        email: `${nickname.trim().toLowerCase().replace(/\s+/g, '')}@ieltsprep.uz`,
        overallLevel,
        targetBand,
        goal,
        skillLevels: {
          Speaking: speakingLevel,
          Writing: writingLevel,
          "Tinglash (Listening)": listeningLevel,
          "O'qish (Reading)": readingLevel,
        },
        examTimeline,
        weeklyGoalMinutes: weeklyGoal,
        createdAt: new Date().toISOString(),
        xp: 0,
        streak: 1,
        isDemo: false,
        plan: 'free',
      };

      saveProfile(profile);
      setExistingProfile(profile);
      setEditMode(false);
      setStep(11);

      // Async sync to server
      try {
        fetch('/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: profile.name, email: profile.email }),
        }).catch(() => {});
      } catch {}
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleStartEdit = () => {
    if (existingProfile) {
      setNickname((existingProfile.nickname as string) || (existingProfile.name as string) || '');
      setOverallLevel((existingProfile.overallLevel as Level) || null);
      setTargetBand((existingProfile.targetBand as string) || null);
      setGoal((existingProfile.goal as string) || null);

      const skills = (existingProfile.skillLevels as Record<string, string>) || {};
      setSpeakingLevel(skills['Speaking'] || null);
      setWritingLevel(skills['Writing'] || null);
      setListeningLevel(skills['Tinglash (Listening)'] || null);
      setReadingLevel(skills["O'qish (Reading)"] || null);

      setExamTimeline((existingProfile.examTimeline as string) || null);
      setWeeklyGoal((existingProfile.weeklyGoalMinutes as number) || null);

      setEditMode(true);
      setStep(1);
    }
  };

  const handleLogout = () => {
    if (confirm("Hisobingizdan chiqmoqchimisiz?")) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('ielts_user_profile');
        window.dispatchEvent(new Event('ielts_auth_changed'));
      }
      setExistingProfile(null);
      setEditMode(false);
      setStep(1);
    }
  };

  const handleStartFresh = () => {
    setNickname('');
    setOverallLevel(null);
    setTargetBand(null);
    setGoal(null);
    setSpeakingLevel(null);
    setWritingLevel(null);
    setListeningLevel(null);
    setReadingLevel(null);
    setExamTimeline(null);
    setWeeklyGoal(null);
    setEditMode(false);
    setStep(1);
  };

  // ── Render: Existing Profile Dashboard (Step 0) ───────────────────────────
  if (existingProfile && step === 0) {
    const lvl = LEVELS.find((l) => l.value === existingProfile.overallLevel);
    const displayName = (existingProfile.nickname as string) || (existingProfile.name as string) || 'Foydalanuvchi';

    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-2xl font-black text-brand-600 dark:text-brand-400">
                {displayName[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {displayName}
                </h2>
                {lvl && (
                  <span
                    className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${lvl.bg} ${lvl.color} border ${lvl.border}`}
                  >
                    {lvl.label} · {lvl.band}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Pencil className="w-4 h-4" />
                Tahrirlash
              </button>
              <button
                type="button"
                onClick={handleStartFresh}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition"
              >
                <User className="w-4 h-4" />
                Qayta o'tish
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/50 transition border border-red-200 dark:border-red-900/50"
              >
                <LogOut className="w-4 h-4" />
                Chiqish
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'XP', value: (existingProfile.xp as number) || 0, icon: <Zap className="w-4 h-4" /> },
              { label: 'Seriya', value: (existingProfile.streak as number) || 1, icon: '🔥' },
              {
                label: 'Maqsad',
                value: `${existingProfile.weeklyGoalMinutes || 30} daq`,
                icon: <Star className="w-4 h-4" />,
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl"
              >
                <div className="flex justify-center mb-1 text-brand-500">
                  {typeof stat.icon === 'string' ? (
                    <span className="text-lg">{stat.icon}</span>
                  ) : (
                    stat.icon
                  )}
                </div>
                <div className="text-lg font-black text-slate-900 dark:text-white">{stat.value}</div>
                <div className="text-[11px] text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Target Band & Goal */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Maqsadli IELTS Balli
            </h3>
            <p className="text-lg font-black text-brand-600 dark:text-brand-400">
              Band {(existingProfile.targetBand as string) || '7.0'}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
              Asosiy Maqsad
            </h3>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {GOALS.find((g) => g.value === existingProfile.goal)?.label || "Chet elda o'qish"}
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            Bosh sahifaga o'tish
          </button>
          <button
            type="button"
            onClick={() => router.push('/speaking')}
            className="flex-1 py-4 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <Trophy className="w-5 h-5" />
            Mashqni boshlash
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Done Screen (Step 11) ──────────────────────────────────────────
  if (step === 11) {
    const lvl = LEVELS.find((l) => l.value === overallLevel);
    return (
      <div className="max-w-md mx-auto text-center py-8 space-y-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/30">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Tabriklaymiz, {nickname}! 🎉</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            10 ta savol yakunlandi. Shaxsiy IELTS o'quv rejangiz tayyorlandi!
          </p>
        </div>

        {lvl && (
          <div className={`inline-block px-4 py-2 rounded-2xl text-sm font-bold ${lvl.bg} ${lvl.color} border ${lvl.border}`}>
            Boshlang'ich darajangiz: {lvl.label} ({lvl.band}) → Maqsad: Band {targetBand}
          </div>
        )}

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-left space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Sizning tayyorgarlik parametrlaringiz:
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            🎯 <strong>Kunlik vaqt:</strong> {weeklyGoal} daqiqa
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            📅 <strong>Imtihon muddati:</strong> {TIMELINES.find((t) => t.value === examTimeline)?.label}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            ✨ Barcha IELTS modullari (Speaking, Writing, Reading, Listening) ochildi!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => { setStep(0); router.push('/'); }}
            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            Bosh sahifaga o'tish
          </button>
          <button
            type="button"
            onClick={() => { setStep(0); router.push('/speaking'); }}
            className="flex-1 py-4 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            Mashqni boshlash
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ── Render: 10 Questions Steps (Step 1 to 10) ─────────────────────────────
  return (
    <div className="max-w-xl mx-auto py-4 space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Savol {currentStepNum} / {totalSteps}</span>
          <span>{Math.round((currentStepNum / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStepNum / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* ── 1-savol: Ism / Nickname ─────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              1-savol: Ismingiz nima?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Platformada sizga murojaat qilishimiz uchun ismingizni yozing
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              autoFocus
              placeholder="Masalan: Doniyor, Kamola, Jasur..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
              maxLength={25}
              minLength={2}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-semibold focus:outline-none focus:border-brand-500 dark:focus:border-brand-400 transition"
            />
            <p className="text-xs text-slate-400 text-right">{nickname.length}/25 belgi</p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            🔒 Ro'yxatdan o'tgach barcha IELTS mashqlari va AI baholash xizmatlari ochiladi.
          </div>
        </div>
      )}

      {/* ── 2-savol: Hozirgi umumiy daraja ────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              2-savol: Hozirgi ingliz tili darajangiz qanday?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Taxminiy darajangizni tanlang — savollar shunga moslashtiriladi
            </p>
          </div>

          <div className="space-y-3">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                type="button"
                onClick={() => setOverallLevel(lvl.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                  overallLevel === lvl.value
                    ? `${lvl.bg} ${lvl.border} shadow-sm`
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`font-black text-base ${overallLevel === lvl.value ? lvl.color : 'text-slate-800 dark:text-slate-200'}`}>
                      {lvl.label}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${lvl.bg} ${lvl.color} border ${lvl.border}`}>
                      {lvl.band}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{lvl.desc}</p>
                </div>
                {overallLevel === lvl.value && (
                  <CheckCircle className={`w-5 h-5 flex-shrink-0 ${lvl.color}`} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 3-savol: Maqsadli IELTS balli ───────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Target className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              3-savol: Qanday IELTS ballini maqsad qilgansiz?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Siz erishmoqchi bo'lgan maqsadli ball
            </p>
          </div>

          <div className="space-y-3">
            {TARGET_BANDS.map((tb) => (
              <button
                key={tb.value}
                type="button"
                onClick={() => setTargetBand(tb.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 ${
                  targetBand === tb.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{tb.emoji}</span>
                  <div>
                    <div className={`font-bold ${targetBand === tb.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {tb.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tb.desc}</div>
                  </div>
                </div>
                {targetBand === tb.value && (
                  <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 4-savol: Asosiy maqsad ───────────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              4-savol: IELTS sizga nima uchun kerak?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Asosiy motivatsiyangizni belgilang
            </p>
          </div>

          <div className="space-y-3">
            {GOALS.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGoal(g.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  goal === g.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className={`font-bold ${goal === g.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {g.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{g.desc}</div>
                </div>
                {goal === g.value && <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 5-savol: Speaking ko'nikmasi ─────────────────────────────────── */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Mic className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              5-savol: Speaking (Gapirish) darajangiz qanday?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ingliz tilida gapirish bo'yicha o'zingizni baholang
            </p>
          </div>

          <div className="space-y-3">
            {SKILL_EVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setSpeakingLevel(opt.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  speakingLevel === opt.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.emoji}</span>
                  <div>
                    <div className={`font-bold text-sm ${speakingLevel === opt.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </div>
                {speakingLevel === opt.value && <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 6-savol: Writing ko'nikmasi ──────────────────────────────────── */}
      {step === 6 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <PenTool className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              6-savol: Writing (Insho va xat) darajangiz qanday?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Yozma fikr bildirish ko'nikmangizni baholang
            </p>
          </div>

          <div className="space-y-3">
            {SKILL_EVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setWritingLevel(opt.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  writingLevel === opt.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.emoji}</span>
                  <div>
                    <div className={`font-bold text-sm ${writingLevel === opt.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </div>
                {writingLevel === opt.value && <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 7-savol: Listening ko'nikmasi ────────────────────────────────── */}
      {step === 7 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Headphones className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              7-savol: Listening (Tinglab tushunish) darajangiz?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ingliz tilidagi audio va nutqlarni tushunish darajangiz
            </p>
          </div>

          <div className="space-y-3">
            {SKILL_EVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setListeningLevel(opt.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  listeningLevel === opt.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.emoji}</span>
                  <div>
                    <div className={`font-bold text-sm ${listeningLevel === opt.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </div>
                {listeningLevel === opt.value && <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 8-savol: Reading ko'nikmasi ──────────────────────────────────── */}
      {step === 8 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <BookOpen className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              8-savol: Reading (Matn o'qish) darajangiz qanday?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Ingliz tilidagi ilmiy va badiiy matnlarni tushunish darajangiz
            </p>
          </div>

          <div className="space-y-3">
            {SKILL_EVAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setReadingLevel(opt.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  readingLevel === opt.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.emoji}</span>
                  <div>
                    <div className={`font-bold text-sm ${readingLevel === opt.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                      {opt.label}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{opt.desc}</div>
                  </div>
                </div>
                {readingLevel === opt.value && <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 9-savol: Imtihon topshirish vaqti ────────────────────────────── */}
      {step === 9 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              9-savol: Imtihonni qachon topshirmoqchisiz?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tayyorgarlik sur'atini belgilash uchun muhim
            </p>
          </div>

          <div className="space-y-3">
            {TIMELINES.map((tm) => (
              <button
                key={tm.value}
                type="button"
                onClick={() => setExamTimeline(tm.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center justify-between ${
                  examTimeline === tm.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className={`font-bold text-sm ${examTimeline === tm.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {tm.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{tm.desc}</div>
                </div>
                {examTimeline === tm.value && <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── 10-savol: Kunlik o'rganish vaqti ─────────────────────────────── */}
      {step === 10 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Clock className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              10-savol: Kuniga qancha vaqt ajrata olasiz?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Kunlik o'rganish maqsadingizni belgilang
            </p>
          </div>

          <div className="space-y-3">
            {DAILY_TIMES.map((dt) => (
              <button
                key={dt.value}
                type="button"
                onClick={() => setWeeklyGoal(dt.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  weeklyGoal === dt.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl">{dt.emoji}</span>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${weeklyGoal === dt.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {dt.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{dt.desc}</div>
                </div>
                {weeklyGoal === dt.value && (
                  <CheckCircle className="w-5 h-5 text-brand-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-2">
        {step > 1 && (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>
        )}
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
            canProceed()
              ? 'bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white shadow-lg shadow-brand-500/25 hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {step === 10 ? (
            <>
              <Trophy className="w-4 h-4" />
              Profil yaratish va Boshlash
            </>
          ) : (
            <>
              Keyingi savol
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
