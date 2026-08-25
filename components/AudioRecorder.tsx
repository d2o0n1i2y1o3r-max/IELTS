'use client';

import React, { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Mic, Pause, Play, RotateCcw, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function AudioRecorder() {
  const {
    transcript,
    setTranscript,
    recordingState,
    setRecordingState,
    resetSession,
    elapsedSpeakingTime,
    setElapsedSpeakingTime
  } = useAppStore();

  const { t } = useTranslation();
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [micSupported, setMicSupported] = React.useState<boolean>(true);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setMicSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      let currentTranscript = '';
      for (let i = 0; i < event.results.length; i++) {
        currentTranscript += event.results[i][0].transcript + ' ';
      }
      setTranscript(currentTranscript.trim());
    };

    recognition.onerror = () => {};

    recognition.onend = () => {
      if (useAppStore.getState().recordingState === 'recording') {
        try {
          recognition.start();
        } catch {}
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [setTranscript]);

  useEffect(() => {
    if (recordingState === 'recording') {
      timerRef.current = setInterval(() => {
        setElapsedSpeakingTime(useAppStore.getState().elapsedSpeakingTime + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState, setElapsedSpeakingTime]);

  const startRecording = () => {
    setRecordingState('recording');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch {}
    }
  };

  const pauseRecording = () => {
    setRecordingState('paused');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const stopAndEvaluate = async () => {
    setRecordingState('evaluating');
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
  };

  const handleManualTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span
              className={`w-3 h-3 rounded-full ${
                recordingState === 'recording'
                  ? 'bg-red-500 animate-ping'
                  : recordingState === 'paused'
                  ? 'bg-amber-400'
                  : 'bg-slate-600'
              }`}
            />
            <span className="text-xs font-mono uppercase tracking-widest text-slate-400">
              {recordingState === 'recording'
                ? 'Live Voice Input'
                : recordingState === 'paused'
                ? 'Recording Paused'
                : 'Ready to Record'}
            </span>
          </div>

          <div className="font-mono text-sm bg-slate-800 px-3 py-1 rounded-full text-slate-300">
            {Math.floor(elapsedSpeakingTime / 60)}:
            {(elapsedSpeakingTime % 60).toString().padStart(2, '0')}
          </div>
        </div>

        <div className="flex items-center justify-center gap-1.5 h-16 py-2">
          {[40, 70, 35, 90, 60, 100, 45, 80, 55, 95, 30, 75, 50, 85, 65].map((val, idx) => (
            <div
              key={idx}
              className="w-1.5 bg-brand-400 rounded-full transition-all duration-300"
              style={{
                height:
                  recordingState === 'recording'
                    ? `${Math.max(15, Math.sin(idx + elapsedSpeakingTime) * 35 + val)}%`
                    : '20%',
                opacity: recordingState === 'recording' ? 0.9 : 0.3,
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-4 mt-6">
          {recordingState === 'idle' || recordingState === 'preparing' ? (
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-brand-500 to-blue-600 hover:from-brand-600 hover:to-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-brand-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Mic className="w-5 h-5" />
              {t('session.start_recording')}
            </button>
          ) : recordingState === 'recording' ? (
            <>
              <button
                onClick={pauseRecording}
                className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl transition-all"
                title={t('session.pause')}
              >
                <Pause className="w-5 h-5" />
              </button>
              <button
                onClick={stopAndEvaluate}
                className="px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-lg shadow-red-600/30 transition-all"
              >
                {t('session.stop_recording')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={startRecording}
                className="p-3.5 bg-brand-600 text-white rounded-2xl transition-all"
                title={t('session.resume')}
              >
                <Play className="w-5 h-5" />
              </button>
              <button
                onClick={stopAndEvaluate}
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition-all"
              >
                {t('session.stop_recording')}
              </button>
            </>
          )}

          <button
            onClick={resetSession}
            className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-2xl transition-all"
            title={t('session.reset')}
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {!micSupported && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-2xl text-amber-800 dark:text-amber-300 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>{t('session.mic_permission_denied')}</div>
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {t('session.transcript_heading')}
        </label>
        <textarea
          value={transcript}
          onChange={handleManualTextChange}
          placeholder={t('session.transcript_placeholder')}
          rows={5}
          className="w-full p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all outline-none text-base leading-relaxed"
        />
      </div>
    </div>
  );
}
