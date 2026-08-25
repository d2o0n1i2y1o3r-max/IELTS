export type ExamPart = 'part1' | 'part2' | 'part3' | 'cefr';
export type ModuleType = 'speaking' | 'writing' | 'reading' | 'listening' | 'full-test';
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
