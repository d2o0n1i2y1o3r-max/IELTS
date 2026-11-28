'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Exercise } from '@/lib/types';
import { Mic, MicOff, Volume2, Sparkles, Check, AlertCircle } from 'lucide-react';

interface SpeakingExerciseProps {
  exercise: Exercise;
  onAnswer: (answer: string) => void;
  language: 'en' | 'uz' | 'ru';
}

export default function SpeakingExercise({
  exercise,
  onAnswer,
  language,
}: SpeakingExerciseProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [audioPlayed, setAudioPlayed] = useState(false);
  const recognitionRef = useRef<any>(null);

  const targetPhrase =
    exercise.targetPhrase || exercise.correctAnswer || exercise.question;

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsRecording(true);
        };

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error:', event.error);
          setIsRecording(false);
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } else {
        setSpeechSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      // Fallback: prompt text if mic unsupported
      const manual = prompt("Mikrofon qo'llab-quvvatlanmadi. Gapni yozib kiriting:", targetPhrase);
      if (manual) {
        setTranscript(manual);
      }
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error('Failed to start recognition:', err);
      }
    }
  };

  const playModelAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(targetPhrase);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
    setAudioPlayed(true);
  };

  const handleSubmit = () => {
    if (transcript.trim()) {
      onAnswer(transcript.trim());
    }
  };

  return (
    <div className="space-y-6">
      {/* Exercise Instruction */}
      <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
        <Mic className="w-4 h-4" />
        Gapirish (Speaking) Mashqi
      </div>

      <div className="text-base font-bold text-slate-900 dark:text-white">
        {exercise.question || "Quyidagi gapni baland ovozda ravon talaffuz qiling:"}
      </div>

      {/* Target Phrase Display Card */}
      <div className="p-6 rounded-3xl bg-emerald-50/70 dark:bg-emerald-950/30 border-2 border-emerald-500/30 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            Aytilishi kerak bo'lgan matn:
          </span>
          <button
            type="button"
            onClick={playModelAudio}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition shadow-xs"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Namunani eshitish</span>
          </button>
        </div>

        <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-relaxed">
          "{targetPhrase}"
        </p>

        {exercise.explanation && (
          <p className="text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-emerald-200/50 dark:border-emerald-900/40">
            💡 {exercise.explanation}
          </p>
        )}
      </div>

      {/* Microphone Control Area */}
      <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4 shadow-xs">
        <button
          type="button"
          onClick={toggleRecording}
          className={`relative w-20 h-20 rounded-full flex items-center justify-center text-white transition-all transform active:scale-95 shadow-xl ${
            isRecording
              ? 'bg-rose-600 shadow-rose-500/40 ring-8 ring-rose-400/30 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30 hover:scale-105'
          }`}
        >
          {isRecording ? <MicOff className="w-9 h-9" /> : <Mic className="w-9 h-9" />}
        </button>

        <div className="text-center space-y-1">
          <div className="text-sm font-bold text-slate-800 dark:text-slate-200">
            {isRecording
              ? "Tinglayapman... Hozir gapiring!"
              : transcript
              ? "Yozib olindi. Yana aytishingiz yoki tasdiqlashingiz mumkin"
              : "Mikrofonni bosing va gapiring"}
          </div>
          <p className="text-xs text-slate-400">
            {isRecording ? "Gapirib bo'lgach tugmani yana bir bor bosing" : "Aniq va ravon talaffuz qiling"}
          </p>
        </div>

        {/* Real-time Transcript Bubble */}
        {transcript && (
          <div className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-sm font-medium">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
              Siz aytgan matn:
            </span>
            <p className="text-base font-bold text-blue-600 dark:text-blue-400">
              "{transcript}"
            </p>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!transcript.trim()}
        className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-slate-300 disabled:to-slate-400 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/25 transition-all text-base disabled:cursor-not-allowed disabled:opacity-50"
      >
        Tekshirish (Check)
      </button>
    </div>
  );
}
