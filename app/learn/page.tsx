'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Unit, Lesson, LearnProgress, getLevelFromXP } from '@/lib/types';
import {
  BookOpen,
  Lock,
  Star,
  Trophy,
  Sparkles,
  Zap,
  Volume2,
  Mic,
  Gift,
  HelpCircle,
  Check,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { getStoredUser, UserProfile } from '@/lib/userAuth';
import MysteryChestModal, { ChestRarity } from '@/components/MysteryChestModal';
import TopicTheoryModal from '@/components/TopicTheoryModal';

type LevelKey = 'beginner' | 'elementary' | 'intermediate' | 'upper' | 'advanced';

interface LevelTab {
  id: LevelKey;
  label: string;
  cefr: string;
  band: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

const LEVEL_TABS: LevelTab[] = [
  {
    id: 'beginner',
    label: "Boshlang'ich",
    cefr: 'A1 · A2',
    band: 'Band 3.5 – 4.0',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10 dark:bg-emerald-500/20',
    borderColor: 'border-emerald-500',
  },
  {
    id: 'elementary',
    label: 'Elementary',
    cefr: 'A2 · B1',
    band: 'Band 4.5 – 5.0',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10 dark:bg-blue-500/20',
    borderColor: 'border-blue-500',
  },
  {
    id: 'intermediate',
    label: "O'rta (Intermediate)",
    cefr: 'B1 · B2',
    band: 'Band 5.5 – 6.0',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10 dark:bg-purple-500/20',
    borderColor: 'border-purple-500',
  },
  {
    id: 'upper',
    label: 'Upper-Intermediate',
    cefr: 'B2 · C1',
    band: 'Band 6.5 – 7.0',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10 dark:bg-amber-500/20',
    borderColor: 'border-amber-500',
  },
  {
    id: 'advanced',
    label: 'Advanced (Yuqori)',
    cefr: 'C1 · C2',
    band: 'Band 7.5 – 9.0',
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10 dark:bg-rose-500/20',
    borderColor: 'border-rose-500',
  },
];

// Path horizontal offsets (in px) for serpentine 10-step curve
const PATH_OFFSETS = [0, 55, 80, 50, 0, -50, -80, -55, -20, 0];

export default function LearnPage() {
  const router = useRouter();
  const { t } = useTranslation();

  const [units, setUnits] = useState<Unit[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState<LearnProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<LevelKey>('beginner');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Modals state
  const [activeChestId, setActiveChestId] = useState<string | null>(null);
  const [activeTheoryUnit, setActiveTheoryUnit] = useState<Unit | null>(null);
  const [pendingLessonId, setPendingLessonId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const stored = getStoredUser();
        setUserProfile(stored);

        const userId = stored?.id || 'user-default';

        const [unitsRes, lessonsRes, progressRes] = await Promise.all([
          fetch('/api/learn/units'),
          fetch('/api/learn/lessons'),
          fetch(`/api/learn/progress?userId=${userId}`),
        ]);

        const unitsData = await unitsRes.json();
        const lessonsData = await lessonsRes.json();
        const progressData = await progressRes.json();

        setUnits(unitsData.units || []);
        setLessons(lessonsData.lessons || []);
        setProgress(progressData);

        // Derive level from XP or user's stored level
        if (progressData?.xp) {
          const xpLevel = getLevelFromXP(progressData.xp);
          setSelectedLevel(xpLevel.level);
        } else if (stored && (stored as any).overallLevel) {
          const lvl = (stored as any).overallLevel as LevelKey;
          if (LEVEL_TABS.some((t) => t.id === lvl)) {
            setSelectedLevel(lvl);
          }
        }
      } catch (error) {
        console.error('Error loading learn data:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Filter units for the selected level
  const filteredUnits = units.filter((u) => {
    if (u.level) return u.level === selectedLevel;
    return selectedLevel === 'intermediate';
  });

  const currentXp = progress?.xp || 0;
  const levelInfo = getLevelFromXP(currentXp);

  const getStars = (lessonId: string) => {
    return progress?.completedLessons?.[lessonId]?.stars || 0;
  };

  const isChestOpened = (chestKey: string) => {
    return Boolean(progress?.completedLessons?.[`chest-${chestKey}`]);
  };

  const handleOpenChest = (chestKey: string) => {
    setActiveChestId(chestKey);
  };

  const handleClaimChestReward = (xpWon: number, rarity: ChestRarity) => {
    setProgress((prev) => {
      if (!prev) return prev;
      const updatedLessons = { ...(prev.completedLessons || {}) };
      if (activeChestId) {
        updatedLessons[`chest-${activeChestId}`] = {
          stars: 3,
          completedAt: new Date().toISOString(),
        };
      }
      return {
        ...prev,
        xp: prev.xp + xpWon,
        completedLessons: updatedLessons,
      };
    });
  };

  const handleNodeClick = (lessonId: string, unit: Unit) => {
    setPendingLessonId(lessonId);
    setActiveTheoryUnit(unit);
  };

  const handleStartExercise = () => {
    if (pendingLessonId) {
      const target = pendingLessonId;
      setPendingLessonId(null);
      setActiveTheoryUnit(null);
      router.push(`/learn/lesson/${target}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500" />
        <p className="text-xs text-slate-500">IELTS darslar va xarita yuklanmoqda...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 px-4">
      {/* ─── Level & XP Promotion Progress Card (Duolingo Header) ─── */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Sizning Hozirgi Darajangiz
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>{levelInfo.label}</span>
              <span className="text-xs px-2.5 py-1 rounded-xl bg-blue-500 text-white font-bold">
                {levelInfo.band}
              </span>
            </h1>
          </div>

          {/* Current XP Display */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30">
            <Trophy className="w-6 h-6 text-amber-500" />
            <div>
              <div className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase">
                Jami To'plangan
              </div>
              <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                {currentXp} XP
              </div>
            </div>
          </div>
        </div>

        {/* 1000 XP Promotion Progress Bar */}
        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-600 dark:text-slate-400">
              Keyingi darajaga: <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{levelInfo.currentLevelXp} / 1000 XP</span>
            </span>
            <span className="text-slate-500 text-[11px]">
              {1000 - levelInfo.currentLevelXp > 0
                ? `Yana ${1000 - levelInfo.currentLevelXp} XP (Har mashq +5 XP)`
                : "Daraja oshirildi! 🎉"}
            </span>
          </div>

          <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full p-0.5 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 via-green-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* ─── Level Selector Tabs ─── */}
      <div className="space-y-2">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          CEFR Darajalari:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {LEVEL_TABS.map((tab) => {
            const isSelected = selectedLevel === tab.id;
            const isUserCurrentLevel = levelInfo.level === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedLevel(tab.id)}
                className={`relative p-3 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? `${tab.bgColor} ${tab.borderColor} ring-2 ring-emerald-500/40 shadow-sm`
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {isUserCurrentLevel && (
                  <span className="absolute -top-1.5 right-2 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-600 text-white shadow-xs">
                    Sizniki
                  </span>
                )}
                <div className={`text-xs font-bold truncate ${isSelected ? tab.color : 'text-slate-800 dark:text-slate-200'}`}>
                  {tab.label}
                </div>
                <div className="text-[10px] text-slate-400 font-medium mt-0.5">
                  {tab.cefr}
                </div>
                <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                  {tab.band}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Units with Duolingo Winding Paths ─── */}
      <div className="space-y-12">
        {filteredUnits.length === 0 ? (
          <div className="text-center py-12 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
            <BookOpen className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300">
              Ushbu daraja darslari tayyorlanmoqda
            </h3>
            <p className="text-xs text-slate-500">
              Boshqa darajalarni tanlab interaktiv mashqlarni bajarishingiz mumkin.
            </p>
          </div>
        ) : (
          filteredUnits.map((unit, unitIdx) => {
            const unitLessons = unit.lessons
              .map((lid) => lessons.find((l) => l.id === lid))
              .filter(Boolean) as Lesson[];

            // Construct 10-step serpentine checkpoints:
            // 1-4: Lessons
            // 5: Mystery Chest
            // 6-9: Lessons
            // 10: Trophy / Final Checkpoint
            const steps = Array.from({ length: 10 }, (_, stepIdx) => {
              if (stepIdx === 4) {
                // Milestone 5: Mystery Treasure Chest
                const chestKey = `${unit.id}-chest`;
                const opened = isChestOpened(chestKey);
                return {
                  type: 'chest' as const,
                  index: stepIdx,
                  chestKey,
                  opened,
                  title: "Sehrli Sovg'a Sandig'i",
                };
              }

              if (stepIdx === 9) {
                // Milestone 10: Unit Trophy / Final exam
                const targetLesson = unitLessons[unitLessons.length - 1] || unitLessons[0];
                const stars = targetLesson ? getStars(targetLesson.id) : 0;
                return {
                  type: 'trophy' as const,
                  index: stepIdx,
                  lesson: targetLesson,
                  stars,
                  title: `${unit.topic} - Imtihon`,
                };
              }

              // Normal lesson nodes
              const lessonOffset = stepIdx > 4 ? stepIdx - 1 : stepIdx;
              const lesson = unitLessons[lessonOffset % (unitLessons.length || 1)] || unitLessons[0];
              const stars = lesson ? getStars(lesson.id) : 0;

              return {
                type: 'lesson' as const,
                index: stepIdx,
                lesson,
                stars,
                title: lesson?.title || `Mashq ${stepIdx + 1}`,
              };
            });

            // Find first uncompleted node to mark as "active" with "START" bubble
            let activeStepIndex = 0;
            for (let i = 0; i < steps.length; i++) {
              const s = steps[i];
              if (s.type === 'chest' && !s.opened) {
                activeStepIndex = i;
                break;
              }
              if (s.type === 'lesson' && s.stars === 0) {
                activeStepIndex = i;
                break;
              }
              if (s.type === 'trophy' && s.stars === 0) {
                activeStepIndex = i;
                break;
              }
            }

            return (
              <div
                key={unit.id}
                className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-8"
              >
                {/* Unit Header with Theory Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                  <div className="space-y-1">
                    <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Mavzu {unitIdx + 1}
                    </span>
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      {unit.topic}
                    </h2>
                  </div>

                  {/* Topic Guidebook / Theory Button */}
                  <button
                    type="button"
                    onClick={() => setActiveTheoryUnit(unit)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 text-xs font-black transition active:scale-95 self-start sm:self-auto"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Mavzu Qoidalari & Nazariya</span>
                  </button>
                </div>

                {/* ─── Duolingo Serpentine Winding Path ─── */}
                <div className="relative py-8 flex flex-col items-center justify-center min-h-[700px] select-none">
                  {/* Subtle Snake Trail SVG in background */}
                  <div className="absolute inset-y-0 w-32 pointer-events-none flex justify-center">
                    <div className="w-2.5 h-full bg-slate-200/70 dark:bg-slate-800/80 rounded-full" />
                  </div>

                  {/* Mascot: Green owl with headphones cheering along the active node */}
                  <div
                    className="absolute z-10 transition-all duration-700 pointer-events-none hidden sm:block"
                    style={{
                      top: `${Math.max(10, activeStepIndex * 78)}px`,
                      left: PATH_OFFSETS[activeStepIndex] > 0 ? '15%' : '65%',
                    }}
                  >
                    <div className="flex flex-col items-center animate-bounce">
                      {/* Mascot SVG matching user picture */}
                      <svg
                        className="w-24 h-24 drop-shadow-xl"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        {/* Owl Body */}
                        <ellipse cx="50" cy="55" rx="32" ry="34" fill="#58CC02" />
                        <ellipse cx="50" cy="58" rx="25" ry="26" fill="#78D824" />

                        {/* Cheeks */}
                        <circle cx="32" cy="62" r="4" fill="#F4900C" opacity="0.4" />
                        <circle cx="68" cy="62" r="4" fill="#F4900C" opacity="0.4" />

                        {/* Closed Happy Eyes (^ ^) */}
                        <path
                          d="M 33 50 Q 38 43 43 50"
                          stroke="#1B4D06"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M 57 50 Q 62 43 67 50"
                          stroke="#1B4D06"
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Orange Beak */}
                        <path
                          d="M 50 51 L 44 58 L 56 58 Z"
                          fill="#FF9600"
                          stroke="#CC7000"
                          strokeWidth="1.5"
                        />

                        {/* Feet */}
                        <ellipse cx="38" cy="90" rx="7" ry="4" fill="#FF9600" />
                        <ellipse cx="62" cy="90" rx="7" ry="4" fill="#FF9600" />

                        {/* Blue Headphones Headband */}
                        <path
                          d="M 22 45 C 22 24, 78 24, 78 45"
                          stroke="#2B70C9"
                          strokeWidth="6"
                          strokeLinecap="round"
                          fill="none"
                        />
                        <path
                          d="M 28 42 C 28 29, 72 29, 72 42"
                          stroke="#1E5496"
                          strokeWidth="2"
                          strokeLinecap="round"
                          fill="none"
                        />

                        {/* Ear Cups */}
                        <rect x="15" y="42" width="12" height="18" rx="6" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
                        <rect x="73" y="42" width="12" height="18" rx="6" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="2" />
                      </svg>
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                        Davom et! 🚀
                      </span>
                    </div>
                  </div>

                  {/* Render 10 Nodes */}
                  <div className="w-full space-y-7 relative z-20">
                    {steps.map((step, sIdx) => {
                      const offsetPx = PATH_OFFSETS[sIdx] || 0;
                      const isActive = sIdx === activeStepIndex;

                      // 1. CHEST NODE
                      if (step.type === 'chest') {
                        return (
                          <div
                            key={`chest-${sIdx}`}
                            className="flex justify-center"
                            style={{ transform: `translateX(${offsetPx}px)` }}
                          >
                            <button
                              type="button"
                              onClick={() => handleOpenChest(step.chestKey)}
                              className={`relative group flex flex-col items-center transition-transform active:scale-95 ${
                                step.opened ? 'opacity-80' : 'hover:scale-110'
                              }`}
                            >
                              {/* Chest Visual */}
                              <div
                                className={`w-20 h-16 rounded-2xl flex items-center justify-center border-4 shadow-xl transition-all ${
                                  step.opened
                                    ? 'bg-amber-700/60 border-amber-900/60 shadow-none'
                                    : 'bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 border-amber-300 shadow-amber-500/50 animate-pulse'
                                }`}
                              >
                                <Gift className="w-8 h-8 text-white drop-shadow-md" />
                              </div>

                              {/* Chest Badge */}
                              <span
                                className={`mt-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${
                                  step.opened
                                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                                    : 'bg-amber-500 text-white animate-bounce'
                                }`}
                              >
                                {step.opened ? "Ochilgan ✓" : "Sandiqni Ochish! 🎁"}
                              </span>
                            </button>
                          </div>
                        );
                      }

                      // 2. TROPHY NODE
                      if (step.type === 'trophy') {
                        const isDone = step.stars > 0;
                        return (
                          <div
                            key={`trophy-${sIdx}`}
                            className="flex justify-center"
                            style={{ transform: `translateX(${offsetPx}px)` }}
                          >
                            <button
                              type="button"
                              onClick={() => {
                                if (step.lesson) handleNodeClick(step.lesson.id, unit);
                              }}
                              className="relative group flex flex-col items-center transition-transform active:scale-95 hover:scale-105"
                            >
                              <div
                                className={`w-20 h-20 rounded-full flex items-center justify-center border-4 shadow-xl transition-all ${
                                  isDone
                                    ? 'bg-amber-400 border-amber-200 text-amber-950 shadow-amber-400/50'
                                    : isActive
                                    ? 'bg-emerald-500 border-emerald-300 text-white ring-4 ring-emerald-300/50 animate-pulse'
                                    : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                                }`}
                              >
                                <Trophy className="w-9 h-9 drop-shadow-md" />
                              </div>

                              <span className="mt-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {isDone ? "Yakunlangan 🏆" : "Mavzu Imtihoni"}
                              </span>
                            </button>
                          </div>
                        );
                      }

                      // 3. REGULAR LESSON NODE
                      const isDone = step.stars > 0;
                      return (
                        <div
                          key={`lesson-${sIdx}`}
                          className="flex justify-center relative"
                          style={{ transform: `translateX(${offsetPx}px)` }}
                        >
                          {/* Active "START" Speech Bubble */}
                          {isActive && (
                            <div className="absolute -top-10 flex flex-col items-center z-30 animate-bounce">
                              <div className="bg-emerald-600 text-white font-black text-[11px] px-3.5 py-1 rounded-xl shadow-lg tracking-wider">
                                START
                              </div>
                              <div className="w-2 h-2 bg-emerald-600 rotate-45 -mt-1" />
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => {
                              if (step.lesson) handleNodeClick(step.lesson.id, unit);
                            }}
                            className="relative group flex flex-col items-center transition-transform active:scale-95 hover:scale-105"
                          >
                            {/* Outer Progress Ring for Active Node */}
                            {isActive && (
                              <div className="absolute -inset-2 rounded-full border-4 border-dashed border-emerald-400 animate-spin-slow pointer-events-none" />
                            )}

                            {/* Circular 3D Node */}
                            <div
                              className={`w-16 h-16 rounded-full flex items-center justify-center border-b-4 transition-all shadow-lg ${
                                isDone
                                  ? 'bg-amber-400 border-amber-600 text-amber-950 shadow-amber-400/30'
                                  : isActive
                                  ? 'bg-[#58CC02] border-[#46A302] text-white shadow-emerald-500/50 ring-4 ring-emerald-300/40'
                                  : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400'
                              }`}
                            >
                              {isDone ? (
                                <Check className="w-8 h-8 stroke-[3]" />
                              ) : (
                                <BookOpen className="w-7 h-7" />
                              )}
                            </div>

                            {/* Node Label / Stars */}
                            <div className="mt-1 text-center">
                              {isDone ? (
                                <div className="flex items-center gap-0.5 text-amber-500 font-black text-[10px]">
                                  <Star className="w-3 h-3 fill-amber-500" />
                                  <span>{step.stars}/3</span>
                                </div>
                              ) : (
                                <span className="text-[10px] font-bold text-slate-500">
                                  {step.title.slice(0, 16)}...
                                </span>
                              )}
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ─── Mystery Treasure Chest Modal ─── */}
      {activeChestId && (
        <MysteryChestModal
          isOpen={Boolean(activeChestId)}
          chestId={activeChestId}
          onClose={() => setActiveChestId(null)}
          onClaim={handleClaimChestReward}
          userId={progress?.userId || 'user-default'}
        />
      )}

      {/* ─── Topic Theory Guidebook Modal ─── */}
      {activeTheoryUnit && (
        <TopicTheoryModal
          isOpen={Boolean(activeTheoryUnit)}
          onClose={() => {
            setActiveTheoryUnit(null);
            setPendingLessonId(null);
          }}
          onStart={handleStartExercise}
          theory={activeTheoryUnit.theory}
          title={activeTheoryUnit.topic}
          level={activeTheoryUnit.level}
        />
      )}
    </div>
  );
}
