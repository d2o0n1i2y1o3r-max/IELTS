export type ExamPart = 'part1' | 'part2' | 'part3' | 'cefr';
export type ModuleType = 'speaking' | 'writing' | 'reading' | 'listening' | 'full-test' | 'learn';
export type WritingTaskType = 'task1' | 'task2';

export interface Question {
  id: string;
  part: ExamPart;
  topic: string;
  topicKey?: string;
  question: string;
  instructions?: string;
  bulletPoints?: string[];
  timeLimit: number; // in seconds
  prepTime: number; // in seconds
}

export interface CriteriaScores {
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalAccuracy: number;
  pronunciation: number;
}

export interface EvaluationResult {
  overallBand: number;
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
  criteriaScores: CriteriaScores;
  strengths: string[];
  weaknesses: string[];
  improvedSample: string;
  detailedFeedback: string;
}

export interface SpeakingSession {
  id: string;
  module: 'speaking';
  createdAt: string;
  questionId: string;
  part: ExamPart;
  topic: string;
  questionText: string;
  transcript: string;
  duration: number; // in seconds
  audioUrl?: string;
  evaluation: EvaluationResult;
}

// ─── Writing Types ───

export interface WritingPrompt {
  id: string;
  taskType: WritingTaskType;
  title: string;
  prompt: string;
  instructions: string;
  timeLimit: number; // in seconds
  minWords: number;
  maxWords: number;
  sampleTopic: string;
}

export interface WritingCriteriaScores {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
}

export interface WritingEvaluation {
  overallBand: number;
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
  criteriaScores: WritingCriteriaScores;
  strengths: string[];
  weaknesses: string[];
  improvedSample: string;
  detailedFeedback: string;
  wordCount: number;
}

export interface WritingSession {
  id: string;
  module: 'writing';
  createdAt: string;
  promptId: string;
  taskType: WritingTaskType;
  topic: string;
  promptText: string;
  essay: string;
  duration: number;
  evaluation: WritingEvaluation;
}

// ─── Reading Types ───

export type ReadingQuestionType = 'multiple-choice' | 'true-false-notgiven' | 'fill-blank';

export interface ReadingQuestion {
  id: string;
  type: ReadingQuestionType;
  question: string;
  options?: string[]; // for multiple-choice and true-false-notgiven
  correctAnswer: string;
  explanation: string;
}

export interface ReadingPassage {
  id: string;
  title: string;
  topic: string;
  passage: string;
  timeLimit: number; // in seconds
  questions: ReadingQuestion[];
}

export interface ReadingSession {
  id: string;
  module: 'reading';
  createdAt: string;
  passageId: string;
  passageTitle: string;
  topic: string;
  answers: Record<string, string>;
  correctCount: number;
  totalQuestions: number;
  duration: number;
  evaluation: {
    overallBand: number;
    cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
    rawScore: number;
    totalQuestions: number;
    detailedFeedback: string;
  };
}

// ─── Listening Types ───

export type ListeningQuestionType = 'multiple-choice' | 'form-completion' | 'matching' | 'true-false-notgiven';

export interface ListeningQuestion {
  id: string;
  type: ListeningQuestionType;
  question: string;
  options?: string[]; // for multiple-choice and matching
  matchItems?: string[]; // items to match from (for matching type)
  correctAnswer: string;
  explanation: string;
}

export interface ListeningPassage {
  id: string;
  title: string;
  topic: string;
  script: string; // text script for TTS
  timeLimit: number;
  questions: ListeningQuestion[];
}

export interface ListeningSession {
  id: string;
  module: 'listening';
  createdAt: string;
  passageId: string;
  passageTitle: string;
  topic: string;
  answers: Record<string, string>;
  correctCount: number;
  totalQuestions: number;
  duration: number;
  evaluation: ListeningEvaluation;
}

export interface ListeningEvaluation {
  overallBand: number;
  cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
  rawScore: number;
  totalQuestions: number;
  detailedFeedback: string;
}

export interface FullTestSession {
  id: string;
  module: 'full-test';
  createdAt: string;
  moduleResults: Record<string, any>;
  moduleBands: Record<string, number>;
  overallBand: number;
  evaluation: {
    overallBand: number;
    cefrLevel: 'B1' | 'B2' | 'C1' | 'C2';
    detailedFeedback: string;
  };
}

// ─── Unified Session Type ───

export type PracticeSession = SpeakingSession | WritingSession | ReadingSession | ListeningSession | FullTestSession;

// ─── Utility: raw score to IELTS band conversion ───

export function rawScoreToBand(correct: number, total: number): number {
  const pct = total > 0 ? (correct / total) * 100 : 0;
  if (pct >= 95) return 9.0;
  if (pct >= 87) return 8.5;
  if (pct >= 80) return 8.0;
  if (pct >= 73) return 7.5;
  if (pct >= 67) return 7.0;
  if (pct >= 60) return 6.5;
  if (pct >= 53) return 6.0;
  if (pct >= 47) return 5.5;
  if (pct >= 40) return 5.0;
  if (pct >= 33) return 4.5;
  if (pct >= 27) return 4.0;
  if (pct >= 20) return 3.5;
  return 3.0;
}

export function bandToCefr(band: number): 'B1' | 'B2' | 'C1' | 'C2' {
  if (band >= 8.0) return 'C2';
  if (band >= 7.0) return 'C1';
  if (band >= 5.5) return 'B2';
  return 'B1';
}

// ─── User (Registration) Types ───

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  // passwordHash va boshqa maydonlar keyinchalik qo'shilishi mumkin
}

// ─── Learn Mode Types ───

export type ExerciseType =
  | 'multiple-choice'
  | 'fill-blank'
  | 'match-pairs'
  | 'error-correction'
  | 'listening'
  | 'speaking';

export type GameMode = 'normal' | 'gold' | 'diamond';

export interface GameModeConfig {
  id: GameMode;
  name: string;
  title: string;
  multiplier: number;
  multiplierText: string;
  questionCount: number;
  difficultyLabel: string;
  color: string;
  borderColor: string;
  gradient: string;
  description: string;
}

export const GAME_MODES: Record<GameMode, GameModeConfig> = {
  normal: {
    id: 'normal',
    name: 'Oddiy',
    title: "Oddiy O'yin",
    multiplier: 1.0,
    multiplierText: '1x XP',
    questionCount: 5,
    difficultyLabel: "Me'yordagi daraja",
    color: 'text-emerald-500',
    borderColor: 'border-emerald-500',
    gradient: 'from-emerald-500 to-green-600',
    description: "Standart 5 ta mashq, odatiy 5 XP mukofot.",
  },
  gold: {
    id: 'gold',
    name: 'Oltin',
    title: "Oltin O'yin",
    multiplier: 1.5,
    multiplierText: '1.5x XP',
    questionCount: 8,
    difficultyLabel: "Qiyin topshiriqlar",
    color: 'text-amber-500',
    borderColor: 'border-amber-400',
    gradient: 'from-amber-400 via-yellow-500 to-amber-600',
    description: "8 ta qiyin topshiriq va 1.5 barobar ko'p XP mukofoti!",
  },
  diamond: {
    id: 'diamond',
    name: 'Olmos',
    title: "Olmos O'yin",
    multiplier: 2.0,
    multiplierText: '2x XP',
    questionCount: 12,
    difficultyLabel: "O'ta qiyin (Master)",
    color: 'text-cyan-400',
    borderColor: 'border-cyan-400',
    gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
    description: "12 ta o'ta murakkab savol va 2 barobar KATTA XP sovrini!",
  },
};

export interface Exercise {
  id: string;
  type: ExerciseType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  translations?: Record<string, string>;
  audioPrompt?: string; // For listening exercises (spoken aloud)
  targetPhrase?: string; // For speaking exercises (user must say this)
}

export interface TopicTheory {
  title: string;
  summary: string;
  rules: string[];
  vocabulary: { word: string; meaning: string; example: string }[];
  tips: string[];
}

export interface Lesson {
  id: string;
  unitId: string;
  order: number;
  title: string;
  level?: string;
  theory?: TopicTheory;
  exercises: Exercise[];
}

export interface Unit {
  id: string;
  order: number;
  topic: string;
  level?: string;
  theory?: TopicTheory;
  lessons: string[];
}

export function getLevelFromXP(xp: number): {
  level: 'beginner' | 'elementary' | 'intermediate' | 'upper' | 'advanced';
  label: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  band: string;
} {
  const safeXp = Math.max(0, xp || 0);
  if (safeXp < 1000) {
    return {
      level: 'beginner',
      label: "Boshlang'ich (Beginner)",
      currentLevelXp: safeXp,
      nextLevelXp: 1000,
      progressPercent: Math.min(100, Math.floor((safeXp / 1000) * 100)),
      band: 'Band 3.5 – 4.0',
    };
  }
  if (safeXp < 2000) {
    const lvlXp = safeXp - 1000;
    return {
      level: 'elementary',
      label: 'Elementary',
      currentLevelXp: lvlXp,
      nextLevelXp: 1000,
      progressPercent: Math.min(100, Math.floor((lvlXp / 1000) * 100)),
      band: 'Band 4.5 – 5.0',
    };
  }
  if (safeXp < 3000) {
    const lvlXp = safeXp - 2000;
    return {
      level: 'intermediate',
      label: "O'rta (Intermediate)",
      currentLevelXp: lvlXp,
      nextLevelXp: 1000,
      progressPercent: Math.min(100, Math.floor((lvlXp / 1000) * 100)),
      band: 'Band 5.5 – 6.0',
    };
  }
  if (safeXp < 4000) {
    const lvlXp = safeXp - 3000;
    return {
      level: 'upper',
      label: 'Upper-Intermediate',
      currentLevelXp: lvlXp,
      nextLevelXp: 1000,
      progressPercent: Math.min(100, Math.floor((lvlXp / 1000) * 100)),
      band: 'Band 6.5 – 7.0',
    };
  }
  const lvlXp = safeXp - 4000;
  return {
    level: 'advanced',
    label: 'Advanced (Yuqori)',
    currentLevelXp: lvlXp,
    nextLevelXp: 1000,
    progressPercent: 100,
    band: 'Band 7.5 – 9.0',
  };
}

export interface LearnProgress {
  userId: string;
  completedLessons: Record<string, { stars: number; completedAt: string }>;
  xp: number;
  lastActiveDate: string;
}

export interface LearnSession {
  id: string;
  userId: string;
  lessonId: string;
  exercisesCompleted: string[];
  correctCount: number;
  totalExercises: number;
  xpEarned: number;
  duration: number;
  completedAt: string;
}
