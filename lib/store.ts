import { create } from 'zustand';
import { Question, ExamPart, PracticeSession, WritingPrompt, ReadingPassage, ListeningPassage, ModuleType } from './types';

interface AppState {
  theme: 'light' | 'dark';
  language: 'en' | 'uz' | 'ru';
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'en' | 'uz' | 'ru') => void;
  toggleTheme: () => void;

  selectedPart: ExamPart;
  selectedTopic: string;
  currentQuestion: Question | null;
  transcript: string;
  recordingState: 'idle' | 'preparing' | 'recording' | 'paused' | 'evaluating' | 'completed';
  prepTimeLeft: number;
  speakTimeLeft: number;
  elapsedSpeakingTime: number;
  
  currentSession: PracticeSession | null;
  history: PracticeSession[];

  // Writing state
  currentWritingPrompt: WritingPrompt | null;
  writingEssay: string;
  writingTimeLeft: number;
  writingState: 'idle' | 'writing' | 'evaluating' | 'completed';

  // Reading state
  currentReadingPassage: ReadingPassage | null;
  readingAnswers: Record<string, string>;
  readingTimeLeft: number;
  readingState: 'idle' | 'reading' | 'completed';

  // Listening state
  currentListeningPassage: ListeningPassage | null;
  listeningAnswers: Record<string, string>;
  listeningTimeLeft: number;
  listeningState: 'idle' | 'listening' | 'completed';
  isPlaying: boolean;

  // Full Test mode
  isFullTestMode: boolean;
  fullTestSessionId: string;
  currentModuleInSequence: ModuleType | null;
  fullTestResults: Record<ModuleType, any>;
  fullTestCompleted: boolean;

  setSelectedPart: (part: ExamPart) => void;
  setSelectedTopic: (topic: string) => void;
  setCurrentQuestion: (q: Question | null) => void;
  setTranscript: (text: string) => void;
  appendTranscript: (text: string) => void;
  setRecordingState: (state: 'idle' | 'preparing' | 'recording' | 'paused' | 'evaluating' | 'completed') => void;
  setPrepTimeLeft: (time: number) => void;
  setSpeakTimeLeft: (time: number) => void;
  setElapsedSpeakingTime: (time: number) => void;
  setCurrentSession: (session: PracticeSession | null) => void;
  setHistory: (history: PracticeSession[]) => void;
  resetSession: () => void;

  // Writing actions
  setCurrentWritingPrompt: (prompt: WritingPrompt | null) => void;
  setWritingEssay: (essay: string) => void;
  setWritingTimeLeft: (time: number) => void;
  setWritingState: (state: 'idle' | 'writing' | 'evaluating' | 'completed') => void;

  // Reading actions
  setCurrentReadingPassage: (passage: ReadingPassage | null) => void;
  setReadingAnswers: (answers: Record<string, string>) => void;
  setReadingAnswer: (questionId: string, answer: string) => void;
  setReadingTimeLeft: (time: number) => void;
  setReadingState: (state: 'idle' | 'reading' | 'completed') => void;

  // Listening actions
  setCurrentListeningPassage: (passage: ListeningPassage | null) => void;
  setListeningAnswers: (answers: Record<string, string>) => void;
  setListeningAnswer: (questionId: string, answer: string) => void;
  setListeningTimeLeft: (time: number) => void;
  setListeningState: (state: 'idle' | 'listening' | 'completed') => void;
  setIsPlaying: (playing: boolean) => void;

  // Full Test actions
  startFullTest: () => void;
  setFullTestSessionId: (id: string) => void;
  setCurrentModuleInSequence: (module: ModuleType | null) => void;
  setFullTestResult: (module: ModuleType, result: any) => void;
  completeFullTest: () => void;
  resetFullTest: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  theme: 'light',
  language: 'en',
  setTheme: (theme) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('speakprep_theme', theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    set({ theme });
  },
  toggleTheme: () => {
    const nextTheme = get().theme === 'light' ? 'dark' : 'light';
    get().setTheme(nextTheme);
  },
  setLanguage: (lang) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('speakprep_lang', lang);
    }
    set({ language: lang });
  },

  selectedPart: 'part1',
  selectedTopic: 'All Topics',
  currentQuestion: null,
  transcript: '',
  recordingState: 'idle',
  prepTimeLeft: 0,
  speakTimeLeft: 45,
  elapsedSpeakingTime: 0,
  
  currentSession: null,
  history: [],

  // Writing state
  currentWritingPrompt: null,
  writingEssay: '',
  writingTimeLeft: 0,
  writingState: 'idle',

  // Reading state
  currentReadingPassage: null,
  readingAnswers: {},
  readingTimeLeft: 0,
  readingState: 'idle',

  // Listening state
  currentListeningPassage: null,
  listeningAnswers: {},
  listeningTimeLeft: 0,
  listeningState: 'idle',
  isPlaying: false,

  // Full Test mode
  isFullTestMode: false,
  fullTestSessionId: '',
  currentModuleInSequence: null,
  fullTestResults: {} as Record<ModuleType, any>,
  fullTestCompleted: false,

  setSelectedPart: (selectedPart) => set({ selectedPart }),
  setSelectedTopic: (selectedTopic) => set({ selectedTopic }),
  setCurrentQuestion: (currentQuestion) => set({ 
    currentQuestion,
    transcript: '',
    recordingState: 'idle',
    prepTimeLeft: currentQuestion?.prepTime || 0,
    speakTimeLeft: currentQuestion?.timeLimit || 45,
    elapsedSpeakingTime: 0
  }),
  setTranscript: (transcript) => set({ transcript }),
  appendTranscript: (text) => set((state) => ({ transcript: (state.transcript + ' ' + text).trim() })),
  setRecordingState: (recordingState) => set({ recordingState }),
  setPrepTimeLeft: (prepTimeLeft) => set({ prepTimeLeft }),
  setSpeakTimeLeft: (speakTimeLeft) => set({ speakTimeLeft }),
  setElapsedSpeakingTime: (elapsedSpeakingTime) => set({ elapsedSpeakingTime }),
  setCurrentSession: (currentSession) => set({ currentSession }),
  setHistory: (history) => set({ history }),
  resetSession: () => {
    const q = get().currentQuestion;
    set({
      transcript: '',
      recordingState: 'idle',
      prepTimeLeft: q?.prepTime || 0,
      speakTimeLeft: q?.timeLimit || 45,
      elapsedSpeakingTime: 0
    });
  },

  // Writing actions
  setCurrentWritingPrompt: (currentWritingPrompt) => set({ 
    currentWritingPrompt,
    writingEssay: '',
    writingTimeLeft: currentWritingPrompt?.timeLimit || 0,
    writingState: 'idle'
  }),
  setWritingEssay: (writingEssay) => set({ writingEssay }),
  setWritingTimeLeft: (writingTimeLeft) => set({ writingTimeLeft }),
  setWritingState: (writingState) => set({ writingState }),

  // Reading actions
  setCurrentReadingPassage: (currentReadingPassage) => set({
    currentReadingPassage,
    readingAnswers: {},
    readingTimeLeft: currentReadingPassage?.timeLimit || 0,
    readingState: 'idle'
  }),
  setReadingAnswers: (readingAnswers) => set({ readingAnswers }),
  setReadingAnswer: (questionId, answer) => set((state) => ({
    readingAnswers: { ...state.readingAnswers, [questionId]: answer }
  })),
  setReadingTimeLeft: (readingTimeLeft) => set({ readingTimeLeft }),
  setReadingState: (readingState) => set({ readingState }),

  // Listening actions
  setCurrentListeningPassage: (currentListeningPassage) => set({
    currentListeningPassage,
    listeningAnswers: {},
    listeningTimeLeft: currentListeningPassage?.timeLimit || 0,
    listeningState: 'idle',
    isPlaying: false
  }),
  setListeningAnswers: (listeningAnswers) => set({ listeningAnswers }),
  setListeningAnswer: (questionId, answer) => set((state) => ({
    listeningAnswers: { ...state.listeningAnswers, [questionId]: answer }
  })),
  setListeningTimeLeft: (listeningTimeLeft) => set({ listeningTimeLeft }),
  setListeningState: (listeningState) => set({ listeningState }),
  setIsPlaying: (isPlaying) => set({ isPlaying }),

  // Full Test actions
  startFullTest: () => set({
    isFullTestMode: true,
    fullTestSessionId: `full-test-${Date.now()}`,
    currentModuleInSequence: 'listening',
    fullTestResults: {} as Record<ModuleType, any>,
    fullTestCompleted: false
  }),
  setFullTestSessionId: (fullTestSessionId) => set({ fullTestSessionId }),
  setCurrentModuleInSequence: (currentModuleInSequence) => set({ currentModuleInSequence }),
  setFullTestResult: (module, result) => set((state) => ({
    fullTestResults: { ...state.fullTestResults, [module]: result }
  })),
  completeFullTest: () => set({ fullTestCompleted: true }),
  resetFullTest: () => set({
    isFullTestMode: false,
    fullTestSessionId: '',
    currentModuleInSequence: null,
    fullTestResults: {} as Record<ModuleType, any>,
    fullTestCompleted: false
  })
}));
