'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { ListeningPassage } from '@/lib/types';
import { Headphones, Clock, Play, Pause, RotateCcw, CheckCircle, XCircle, Sparkles, ArrowRight, Volume2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ListeningPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const {
    currentListeningPassage,
    setCurrentListeningPassage,
    listeningAnswers,
    setListeningAnswers,
    setListeningAnswer,
    listeningTimeLeft,
    setListeningTimeLeft,
    listeningState,
    setListeningState,
    isPlaying,
    setIsPlaying,
    isFullTestMode,
    fullTestSessionId,
    setFullTestResult
  } = useAppStore();

  const [passages, setPassages] = useState<ListeningPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [currentPosition, setCurrentPosition] = useState(0);
  const [speechRate, setSpeechRate] = useState(1);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    async function loadPassages() {
      try {
        const res = await fetch('/api/listening-passages');
        const data = await res.json();
        if (data.passages) setPassages(data.passages);
      } catch (err) {
        console.error('Error loading listening passages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPassages();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (listeningState === 'listening' && listeningTimeLeft > 0) {
      interval = setInterval(() => {
        setListeningTimeLeft(listeningTimeLeft - 1);
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [listeningState, listeningTimeLeft, setListeningTimeLeft]);

  const selectPassage = (passage: ListeningPassage) => {
    setCurrentListeningPassage(passage);
    setListeningState('listening');
  };

  const handlePlayPause = () => {
    if (!currentListeningPassage) return;

    if (isPlaying) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(currentListeningPassage.script);
      utterance.rate = speechRate;
      utterance.onend = () => setIsPlaying(false);
      window.speechSynthesis.speak(utterance);
      setIsPlaying(true);
      speechRef.current = utterance;
    }
  };

  const handleReplay = () => {
    if (!currentListeningPassage) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentListeningPassage.script);
    utterance.rate = speechRate;
    utterance.onend = () => setIsPlaying(false);
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    speechRef.current = utterance;
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleSubmit = async () => {
    if (!currentListeningPassage) return;

    handleStop();
    setListeningState('idle');
    try {
      const res = await fetch('/api/evaluate-listening', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passageId: currentListeningPassage.id,
          answers: listeningAnswers,
          passageTitle: currentListeningPassage.title,
          topic: currentListeningPassage.topic,
          duration: elapsedTime
        })
      });

      const data = await res.json();
      setResults(data);

      if (isFullTestMode) {
        setFullTestResult('listening', data);
        router.push('/full-test/transition?module=listening');
      } else {
        const sessionObj = data.session;
        await fetch('/api/history', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(sessionObj)
        });
        setShowResults(true);
      }
    } catch (err) {
      console.error('Error evaluating listening:', err);
    }
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setListeningAnswer(questionId, answer);
  };

  const getAnswerStatus = (questionId: string) => {
    if (!results) return 'unanswered';
    const question = currentListeningPassage?.questions.find(q => q.id === questionId);
    const userAnswer = listeningAnswers[questionId]?.toLowerCase().trim();
    const correctAnswer = question?.correctAnswer?.toLowerCase().trim();
    
    if (!userAnswer) return 'unanswered';
    if (userAnswer === correctAnswer) return 'correct';
    return 'incorrect';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500" />
      </div>
    );
  }

  if (listeningState === 'idle' && !currentListeningPassage) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
            <Headphones className="w-8 h-8 text-brand-500" />
            IELTS Listening Practice
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Practice listening comprehension with audio passages and multiple question types
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {passages.map((passage) => (
            <div
              key={passage.id}
              className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all cursor-pointer"
              onClick={() => selectPassage(passage)}
            >
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                  {passage.topic}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  {Math.floor(passage.timeLimit / 60)} min
                </span>
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white mb-2">{passage.title}</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4">
                {passage.questions.length} questions
              </p>
              <div className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-semibold text-sm">
                Start Practice <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (currentListeningPassage && !showResults) {
    const minutes = Math.floor(listeningTimeLeft / 60);
    const seconds = listeningTimeLeft % 60;

    return (
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                {currentListeningPassage.topic}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
              {currentListeningPassage.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
              <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {minutes}:{seconds.toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              <Volume2 className="w-4 h-4" />
              Audio Passage
            </div>
            <div className="flex items-center gap-2">
              <select
                value={speechRate}
                onChange={(e) => setSpeechRate(Number(e.target.value))}
                className="px-3 py-1 text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
              >
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
              </select>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {currentListeningPassage.script}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              className="flex items-center gap-2 px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {isPlaying ? 'Pause' : 'Play Audio'}
            </button>
            <button
              onClick={handleReplay}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all"
            >
              <RotateCcw className="w-5 h-5" />
              Replay
            </button>
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all"
            >
              Stop
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Questions</h2>
          
          <div className="space-y-6">
            {currentListeningPassage.questions.map((question, index) => (
              <div key={question.id} className="p-5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-start gap-3 mb-4">
                  <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-bold text-sm">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 dark:text-white mb-2">{question.question}</p>
                    <span className="inline-block px-2 py-1 text-xs font-medium rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {question.type.replace('-', ' ')}
                    </span>
                  </div>
                </div>

                {question.type === 'multiple-choice' && question.options && (
                  <div className="space-y-2 ml-11">
                    {question.options.map((option, optIndex) => (
                      <label key={optIndex} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={listeningAnswers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4 text-brand-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{option}</span>
                  </label>
                    ))}
                  </div>
                )}

                {question.type === 'true-false-notgiven' && question.options && (
                  <div className="space-y-2 ml-11">
                    {question.options.map((option) => (
                      <label key={option} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-colors">
                    <input
                      type="radio"
                      name={question.id}
                      value={option}
                      checked={listeningAnswers[question.id] === option}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      className="w-4 h-4 text-brand-600"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{option}</span>
                  </label>
                    ))}
                  </div>
                )}

                {question.type === 'form-completion' && (
                  <div className="ml-11">
                    <input
                      type="text"
                      value={listeningAnswers[question.id] || ''}
                      onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>
                )}

                {question.type === 'matching' && question.options && question.matchItems && (
                  <div className="ml-11 space-y-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                      Match the items to the options:
                    </div>
                    <div className="space-y-2">
                      {question.matchItems.map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center gap-3">
                          <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                          <select
                            value={listeningAnswers[`${question.id}-${itemIndex}`] || ''}
                            onChange={(e) => handleAnswerChange(`${question.id}-${itemIndex}`, e.target.value)}
                            className="flex-1 p-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white"
                          >
                            <option value="">Select option</option>
                            {question.options?.map((option) => (
                              <option key={option} value={option}>{option}</option>
                            ))}
                          </select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={Object.keys(listeningAnswers).length < currentListeningPassage.questions.length}
            className="w-full py-4 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-bold rounded-2xl shadow-md transition-all"
          >
            Submit Answers
          </button>
        </div>
      </div>
    );
  }

  if (showResults && results && currentListeningPassage) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6">
          <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 mx-auto">
            <Sparkles className="w-10 h-10" />
          </div>
          <div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              Band Score: {results.evaluation.overallBand.toFixed(1)}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              CEFR Level: {results.evaluation.cefrLevel}
            </p>
          </div>
          <div className="flex items-center justify-center gap-8 text-center">
            <div>
              <div className="text-3xl font-black font-mono text-brand-600 dark:text-brand-400">
                {results.evaluation.rawScore}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">
                Correct
              </div>
            </div>
            <div className="text-slate-300 dark:text-slate-600 text-2xl">/</div>
            <div>
              <div className="text-3xl font-black font-mono text-slate-600 dark:text-slate-400">
                {results.evaluation.totalQuestions}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">
                Total
              </div>
            </div>
          </div>
          <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
            {results.evaluation.detailedFeedback}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => {
                setShowResults(false);
                setCurrentListeningPassage(null);
                setListeningAnswers({});
                setListeningState('idle');
                handleStop();
              }}
              className="px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl transition-all"
            >
              Try Another Passage
            </button>
            <button
              onClick={() => router.push('/history')}
              className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-2xl shadow-md transition-all"
            >
              View History
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Answer Review</h3>
          <div className="space-y-4">
            {currentListeningPassage.questions.map((question, index) => {
              const status = getAnswerStatus(question.id);
              return (
                <div key={question.id} className="p-4 rounded-2xl border ${
                  status === 'correct' ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' :
                  status === 'incorrect' ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800' :
                  'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                }">
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-slate-900 font-bold text-sm">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white mb-2">{question.question}</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500 dark:text-slate-400">Your answer:</span>
                          <span className={`font-medium ${status === 'correct' ? 'text-emerald-600 dark:text-emerald-400' : status === 'incorrect' ? 'text-rose-600 dark:text-rose-400' : 'text-slate-600 dark:text-slate-400'}`}>
                            {listeningAnswers[question.id] || 'Not answered'}
                          </span>
                          {status === 'correct' && <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />}
                          {status === 'incorrect' && <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />}
                        </div>
                        {status !== 'correct' && (
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500 dark:text-slate-400">Correct answer:</span>
                            <span className="font-medium text-emerald-600 dark:text-emerald-400">
                              {question.correctAnswer}
                            </span>
                          </div>
                        )}
                        <p className="text-slate-600 dark:text-slate-400 italic text-xs mt-2">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
