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

interface SkillRating {
  skill: string;
  icon: React.ReactNode;
  level: Level | null;
}

// ─── Constants ───────────────────────────────────────────────────────────────
const LEVELS: LevelOption[] = [
  {
    value: 'beginner',
    label: 'Boshlang\'ich',
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
    desc: 'Ba\'zi grammatika va so\'zlarni bilaman',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-950/40',
    border: 'border-orange-300 dark:border-orange-800',
  },
  {
    value: 'intermediate',
    label: 'O\'rta',
    band: 'Band 5–5.5',
    desc: 'Ingliz tilida muloqot qila olaman',
    color: 'text-yellow-600 dark:text-yellow-400',
    bg: 'bg-yellow-50 dark:bg-yellow-950/40',
    border: 'border-yellow-300 dark:border-yellow-800',
  },
  {
    value: 'upper',
    label: 'Yuqori o\'rta',
    band: 'Band 6–7',
    desc: 'Ingliz tilida erkin so\'zlasha olaman',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/40',
    border: 'border-blue-300 dark:border-blue-800',
  },
  {
    value: 'advanced',
    label: 'Ilg\'or',
    band: 'Band 7.5–9',
    desc: 'Ingliz tilini yaxshi bilaman',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    border: 'border-emerald-300 dark:border-emerald-800',
  },
];

const SKILLS = [
  { skill: 'Speaking', icon: <Mic className="w-5 h-5" /> },
  { skill: 'Writing', icon: <PenTool className="w-5 h-5" /> },
  { skill: "O'qish (Reading)", icon: <BookOpen className="w-5 h-5" /> },
  { skill: 'Tinglash (Listening)', icon: <Headphones className="w-5 h-5" /> },
];

const GOALS = [
  { value: 'study_abroad', label: '🎓 Chet elda o\'qish', desc: 'Universitet uchun IELTS' },
  { value: 'work_abroad', label: '💼 Xorijda ishlash', desc: 'Ish uchun IELTS' },
  { value: 'immigration', label: '✈️ Immigratsiya', desc: 'Doimiy turar joy' },
  { value: 'general', label: '📚 Bilimni oshirish', desc: 'O\'z rivojlanishim uchun' },
];

const WEEKLY_GOALS = [
  { value: 5, label: '5 daqiqa / kun', desc: 'Yengil (Hafta 35 daqiqa)', emoji: '🌱' },
  { value: 15, label: '15 daqiqa / kun', desc: 'O\'rtacha (Hafta 105 daqiqa)', emoji: '⚡' },
  { value: 30, label: '30 daqiqa / kun', desc: 'Jiddiy (Hafta 210 daqiqa)', emoji: '🔥' },
  { value: 60, label: '1 soat / kun', desc: 'Intensiv (Hafta 7 soat)', emoji: '🏆' },
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
  const [step, setStep] = useState<number>(0); // 0=existing check, 1=name, 2=overall, 3=skills, 4=goal, 5=weeklyGoal, 6=done
  const [nickname, setNickname] = useState('');
  const [overallLevel, setOverallLevel] = useState<Level | null>(null);
  const [skillLevels, setSkillLevels] = useState<Record<string, Level | null>>({
    Speaking: null,
    Writing: null,
    "O'qish (Reading)": null,
    'Tinglash (Listening)': null,
  });
  const [goal, setGoal] = useState<string | null>(null);
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
  const [existingProfile, setExistingProfile] = useState<Record<string, unknown> | null>(null);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const isRegisterMode = typeof window !== 'undefined' && (
      window.location.search.includes('register') || 
      window.location.search.includes('mode=new')
    );
    const profile = loadProfile();
    if (profile && !isRegisterMode) {
      setExistingProfile(profile);
    } else {
      setStep(1);
    }
  }, []);

  // ── Step helpers ────────────────────────────────────────────────────────────
  const totalSteps = 5; // name, overall, skills, goal, weeklyGoal
  const currentStepNum = step - 1; // 1-based steps start at step index 1

  const canProceed = () => {
    if (step === 1) return nickname.trim().length >= 2;
    if (step === 2) return overallLevel !== null;
    if (step === 3) return Object.values(skillLevels).every((v) => v !== null);
    if (step === 4) return goal !== null;
    if (step === 5) return weeklyGoal !== null;
    return true;
  };

  const handleNext = () => {
    if (!canProceed()) return;
    if (step < 5) {
      setStep(step + 1);
    } else {
      // Save and finish
      const profile = {
        nickname: nickname.trim() || `Guest-${Math.floor(1000 + Math.random() * 9000)}`,
        overallLevel,
        skillLevels,
        goal,
        weeklyGoalMinutes: weeklyGoal,
        createdAt: new Date().toISOString(),
        xp: 0,
        streak: 0,
      };
      saveProfile(profile);
      setExistingProfile(profile);
      setStep(6);
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleStartEdit = () => {
    if (existingProfile) {
      setNickname((existingProfile.nickname as string) || '');
      setOverallLevel((existingProfile.overallLevel as Level) || null);
      setSkillLevels(
        (existingProfile.skillLevels as Record<string, Level | null>) || {
          Speaking: null,
          Writing: null,
          "O'qish (Reading)": null,
          'Tinglash (Listening)': null,
        }
      );
      setGoal((existingProfile.goal as string) || null);
      setWeeklyGoal((existingProfile.weeklyGoalMinutes as number) || null);
      setEditMode(true);
      setStep(1);
    }
  };

  // ── Render: Existing Profile Dashboard ──────────────────────────────────────
  if (existingProfile && step === 0) {
    const lvl = LEVELS.find((l) => l.value === existingProfile.overallLevel);
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        {/* Profile Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center text-2xl font-black text-brand-600 dark:text-brand-400">
                {(existingProfile.nickname as string)?.[0]?.toUpperCase() || 'G'}
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">
                  {existingProfile.nickname as string}
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
            <div className="flex items-center gap-2">
              <button
                onClick={handleStartEdit}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <Pencil className="w-4 h-4" />
                Tahrirlash
              </button>
              <button
                onClick={() => {
                  setNickname('');
                  setOverallLevel(null);
                  setSkillLevels({
                    Speaking: null,
                    Writing: null,
                    "O'qish (Reading)": null,
                    'Tinglash (Listening)': null,
                  });
                  setGoal(null);
                  setWeeklyGoal(null);
                  setEditMode(false);
                  setStep(1);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/40 hover:bg-brand-100 dark:hover:bg-brand-900/40 transition"
              >
                <User className="w-4 h-4" />
                Yangi ro'yxatdan o'tish
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'XP', value: (existingProfile.xp as number) || 0, icon: <Zap className="w-4 h-4" /> },
              { label: 'Seriya', value: (existingProfile.streak as number) || 0, icon: '🔥' },
              {
                label: 'Maqsad',
                value: `${existingProfile.weeklyGoalMinutes} daq`,
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

        {/* Skill Levels */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">
            Ko'nikmalar darajasi
          </h3>
          <div className="space-y-3">
            {SKILLS.map(({ skill, icon }) => {
              const skillLevel = (existingProfile.skillLevels as Record<string, Level>)?.[skill];
              const lvlInfo = LEVELS.find((l) => l.value === skillLevel);
              return (
                <div key={skill} className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm font-medium">
                    <span className="text-brand-500">{icon}</span>
                    {skill}
                  </div>
                  {lvlInfo && (
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${lvlInfo.bg} ${lvlInfo.color} border ${lvlInfo.border}`}
                    >
                      {lvlInfo.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Goal */}
        {existingProfile.goal && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Maqsad
            </h3>
            <p className="font-semibold text-slate-800 dark:text-slate-200">
              {GOALS.find((g) => g.value === existingProfile.goal)?.label}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => router.push('/learn')}
          className="w-full py-4 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
        >
          <Trophy className="w-5 h-5" />
          O'rganishni davom ettirish
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // ── Render: Done Screen ──────────────────────────────────────────────────────
  if (step === 6) {
    const lvl = LEVELS.find((l) => l.value === overallLevel);
    return (
      <div className="max-w-md mx-auto text-center py-8 space-y-6">
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-blue-600 flex items-center justify-center mx-auto shadow-2xl shadow-brand-500/30">
          <Trophy className="w-12 h-12 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Tabriklaymiz! 🎉</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Profil muvaffaqiyatli yaratildi
          </p>
        </div>
        {lvl && (
          <div className={`inline-block px-4 py-2 rounded-2xl text-sm font-bold ${lvl.bg} ${lvl.color} border ${lvl.border}`}>
            Sizning darajangiz: {lvl.label} · {lvl.band}
          </div>
        )}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 text-left space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Shaxsiy o'quv rejangiz tayyorlandi
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            🎯 Kun bo'yi <strong>{weeklyGoal} daqiqa</strong> o'rganish maqsadi
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            📚 Zaif ko'nikmalardan boshlash tavsiya etiladi
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-300">
            🔥 Seriya saqlash uchun har kuni kiring
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => { setStep(0); router.push('/'); }}
            className="flex-1 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
          >
            Bosh sahifaga o'tish
          </button>
          <button
            onClick={() => { setStep(0); router.push('/learn'); }}
            className="flex-1 py-4 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/25 hover:scale-[1.01] transition-all flex items-center justify-center gap-2"
          >
            O'rganishni boshlash
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  // ── Render: Steps ─────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto py-4 space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>Qadam {currentStepNum} / {totalSteps}</span>
          <span>{Math.round((currentStepNum / totalSteps) * 100)}%</span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 to-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStepNum / totalSteps) * 100}%` }}
          />
        </div>
      </div>

      {/* ── Step 1: Nickname ─────────────────────────────────────────────── */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <User className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Ismingizni kiriting
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Email yoki parol kerak emas — shunchaki ism yozing
            </p>
          </div>

          <div className="space-y-3">
            <input
              type="text"
              autoFocus
              placeholder="Masalan: Doniyor, Kamola, Ali..."
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && canProceed() && handleNext()}
              maxLength={20}
              minLength={2}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-lg font-semibold focus:outline-none focus:border-brand-500 dark:focus:border-brand-400 transition"
            />
            <p className="text-xs text-slate-400 text-right">{nickname.length}/20 belgi</p>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            💡 Hech qanday shaxsiy ma'lumot saqlanmaydi. Faqat ismingiz ko'rsatiladi.
          </div>

          <div className="flex justify-between items-center pt-2">
            <button
              type="button"
              onClick={() => router.push('/')}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition"
            >
              ← Bosh sahifaga o'tish
            </button>
            {existingProfile && (
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
              >
                Mavjud profilni ko'rish →
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Step 2: Overall Level ────────────────────────────────────────── */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Star className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Hozirgi ingliz til darajangiz?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              To'g'ri darajani tanlang — bu sizga mos o'quv rejasini tuzishga yordam beradi
            </p>
          </div>

          <div className="space-y-3">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.value}
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

      {/* ── Step 3: Skill Levels ─────────────────────────────────────────── */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Zap className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Ko'nikmalar darajangi belgilang
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Har bir ko'nikma uchun o'z darajangizni tanlang
            </p>
          </div>

          <div className="space-y-5">
            {SKILLS.map(({ skill, icon }) => (
              <div key={skill} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
                  <span className="text-brand-500">{icon}</span>
                  {skill}
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {LEVELS.map((lvl) => (
                    <button
                      key={lvl.value}
                      onClick={() =>
                        setSkillLevels((prev) => ({ ...prev, [skill]: lvl.value }))
                      }
                      title={`${lvl.label} (${lvl.band})`}
                      className={`py-2 rounded-xl text-[11px] font-bold transition-all border-2 ${
                        skillLevels[skill] === lvl.value
                          ? `${lvl.bg} ${lvl.color} ${lvl.border} shadow-sm scale-105`
                          : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-slate-300'
                      }`}
                    >
                      {lvl.label.split(' ')[0]}
                    </button>
                  ))}
                </div>
                {skillLevels[skill] && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 pl-1">
                    ✓ {LEVELS.find((l) => l.value === skillLevels[skill])?.label} ·{' '}
                    {LEVELS.find((l) => l.value === skillLevels[skill])?.band}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Step 4: Goal ─────────────────────────────────────────────────── */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8 text-brand-500" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              IELTS ni nima uchun o'rganasiz?
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Maqsadingizga mos mazmun taqdim etamiz
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {GOALS.map((g) => (
              <button
                key={g.value}
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

      {/* ── Step 5: Weekly Goal ──────────────────────────────────────────── */}
      {step === 5 && (
        <div className="space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-brand-500/10 dark:bg-brand-500/20 flex items-center justify-center mx-auto text-3xl">
              🎯
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white">
              Kunlik o'rganish maqsadi
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Qancha ko'p o'rgansangiz, shuncha tez o'sasiz
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {WEEKLY_GOALS.map((wg) => (
              <button
                key={wg.value}
                onClick={() => setWeeklyGoal(wg.value)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                  weeklyGoal === wg.value
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/30 shadow-sm'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
                }`}
              >
                <span className="text-2xl">{wg.emoji}</span>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${weeklyGoal === wg.value ? 'text-brand-600 dark:text-brand-400' : 'text-slate-800 dark:text-slate-200'}`}>
                    {wg.label}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">{wg.desc}</div>
                </div>
                {weeklyGoal === wg.value && (
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
            onClick={handleBack}
            className="flex items-center gap-2 px-5 py-3.5 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Orqaga
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={!canProceed()}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-sm transition-all ${
            canProceed()
              ? 'bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white shadow-lg shadow-brand-500/25 hover:scale-[1.01] active:scale-[0.99]'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          {step === 5 ? (
            <>
              <Trophy className="w-4 h-4" />
              Profil yaratish
            </>
          ) : (
            <>
              Davom etish
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
