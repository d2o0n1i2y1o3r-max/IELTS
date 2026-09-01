'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import AIMascot from '@/components/AIMascot';
import { useMascotMood } from '@/hooks/useMascotMood';
import { User, MessageSquare, Square, Play, Mic, MicOff, Volume2, AlertCircle } from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function VoiceChatPage() {
  const { mood, updateMood } = useMascotMood();
  const [messages, setMessages] = useState<Message[]>([]);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConversationActive, setIsConversationActive] = useState(true);
  const [activeTtsVoice, setActiveTtsVoice] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const recognitionRef = useRef<any>(null);
  const isRecognitionRunningRef = useRef(false);
  const shouldRestartRef = useRef(false);
  const isSpeakingRef = useRef(false);
  const isProcessingRef = useRef(false);
  const isConversationActiveRef = useRef(true);
  const transcriptRef = useRef('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    isConversationActiveRef.current = isConversationActive;
  }, [isConversationActive]);

  useEffect(() => {
    transcriptRef.current = transcript;
  }, [transcript]);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceState]);

  const initEchoCancellationMedia = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) return;
    try {
      if (!mediaStreamRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
        console.log('[Mic] Echo cancellation, noise suppression & auto gain enabled.');
      }
    } catch (err) {
      console.warn('[Mic] getUserMedia audio constraints notice:', err);
    }
  }, []);

  const stopRecognition = useCallback(() => {
    shouldRestartRef.current = false;
    if (recognitionRef.current && isRecognitionRunningRef.current) {
      isRecognitionRunningRef.current = false;
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }
  }, []);

  const startListening = useCallback(() => {
    if (!isConversationActiveRef.current) return;
    if (isSpeakingRef.current) {
      console.log('[STT] Blocked startListening because AI is currently speaking.');
      return;
    }
    if (isProcessingRef.current) {
      console.log('[STT] Blocked startListening because AI is processing reply.');
      return;
    }
    if (isRecognitionRunningRef.current) return;

    setErrorMessage('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMessage("Sizning brauzeringiz ovozni tanish funksiyasini qo'llab-quvvatlamaydi. Chrome yoki Edge brauzeridan foydalaning.");
      return;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (_) {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'uz-UZ';

    recognition.onstart = () => {
      isRecognitionRunningRef.current = true;
      setVoiceState('listening');
      setTranscript('');
      transcriptRef.current = '';
    };

    recognition.onresult = (event: any) => {
      if (isSpeakingRef.current) {
        console.log('[STT Echo Guard] Ignored speech input because AI is currently speaking.');
        return;
      }
      if (isProcessingRef.current) {
        console.log('[STT Guard] Ignored speech input because response is processing.');
        return;
      }

      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += t;
        } else {
          interimTranscript += t;
        }
      }

      const current = finalTranscript || interimTranscript;
      setTranscript(current);
      transcriptRef.current = current;

      if (finalTranscript.trim()) {
        isRecognitionRunningRef.current = false;
        shouldRestartRef.current = false;
        try {
          recognition.abort();
        } catch (_) {}
        handleUserMessage(finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error === 'aborted') {
        console.log('[STT] aborted (non-critical)');
        return;
      }

      isRecognitionRunningRef.current = false;

      if (event.error === 'not-allowed') {
        setErrorMessage("Mikrofon ruxsati berilmadi. Iltimos, brauzer sozlamalaridan mikrofon ruxsatini bering.");
        setVoiceState('idle');
        shouldRestartRef.current = false;
      } else if (event.error === 'no-speech') {
        console.log('[STT] no-speech detected, scheduled restart');
      } else {
        console.error('[STT] recognition error:', event.error);
        setVoiceState('idle');
      }
    };

    recognition.onend = () => {
      isRecognitionRunningRef.current = false;
      if (
        isConversationActiveRef.current &&
        !isSpeakingRef.current &&
        !isProcessingRef.current &&
        shouldRestartRef.current
      ) {
        setTimeout(() => {
          if (isConversationActiveRef.current && !isSpeakingRef.current && !isProcessingRef.current) {
            startListening();
          }
        }, 300);
      }
    };

    recognitionRef.current = recognition;
    shouldRestartRef.current = true;

    try {
      recognition.start();
    } catch (e) {
      console.error('[STT] start error:', e);
      isRecognitionRunningRef.current = false;
    }
  }, []);

  const speakWithBrowserTTS = useCallback((text: string) => {
    stopRecognition();
    isSpeakingRef.current = true;
    setVoiceState('speaking');

    const synth = window.speechSynthesis;
    if (!synth) {
      isSpeakingRef.current = false;
      setVoiceState('idle');
      setActiveTtsVoice(null);
      setTimeout(() => startListening(), 500);
      return;
    }

    synth.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const applyVoice = () => {
      const voices = synth.getVoices();

      const PRIORITY = [
        { prefix: 'uz', label: "O'zbekcha ovoz" },
        { prefix: 'tr', label: "Turkcha talaffuz (o'zbekcha to'liq qo'llab-quvvatlanmaydi)" },
        { prefix: 'az', label: "Ozarbayjon talaffuzi (o'zbekcha to'liq qo'llab-quvvatlanmaydi)" },
        { prefix: 'en', label: "Inglizcha talaffuz (fallback)" },
        { prefix: 'ru', label: "Ruscha talaffuz (fallback)" },
      ];

      let chosenVoice: SpeechSynthesisVoice | undefined;
      let chosenLabel = '';

      for (const { prefix, label } of PRIORITY) {
        const found = voices.find(v => v.lang.toLowerCase().startsWith(prefix));
        if (found) {
          chosenVoice = found;
          chosenLabel = label;
          break;
        }
      }

      if (chosenVoice) {
        utterance.voice = chosenVoice;
        utterance.lang = chosenVoice.lang;
        setActiveTtsVoice(chosenLabel);
        console.log(`[TTS] Browser fallback — voice: ${chosenVoice.name} (${chosenVoice.lang}) — ${chosenLabel}`);
      } else {
        utterance.lang = 'uz-UZ';
        setActiveTtsVoice("Standart ovoz (uz-UZ)");
      }

      utterance.rate = 0.9;
      utterance.pitch = 1;

      const finishSpeech = () => {
        // 500ms delay after TTS completion before reactivating mic to prevent picking up room echo
        setTimeout(() => {
          isSpeakingRef.current = false;
          setVoiceState('idle');
          if (isConversationActiveRef.current) {
            startListening();
          }
        }, 500);
      };

      utterance.onend = finishSpeech;
      utterance.onerror = finishSpeech;

      synth.speak(utterance);
    };

    const voices = synth.getVoices();
    if (voices.length > 0) {
      applyVoice();
    } else {
      synth.onvoiceschanged = () => {
        synth.onvoiceschanged = null;
        applyVoice();
      };
    }
  }, [stopRecognition, startListening]);

  const speakWithElevenLabs = useCallback(async (text: string) => {
    stopRecognition();
    isSpeakingRef.current = true;
    setVoiceState('speaking');

    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('ElevenLabs TTS failed');

      const audioBuffer = await response.arrayBuffer();
      const blob = new Blob([audioBuffer], { type: 'audio/mpeg' });
      const url = URL.createObjectURL(blob);

      if (audioRef.current) {
        audioRef.current.pause();
        URL.revokeObjectURL(audioRef.current.src);
      }

      const audio = new Audio(url);
      audioRef.current = audio;

      const handleAudioEnd = () => {
        URL.revokeObjectURL(url);
        // 500ms room echo buffer before listening again
        setTimeout(() => {
          isSpeakingRef.current = false;
          setVoiceState('idle');
          if (isConversationActiveRef.current) {
            startListening();
          }
        }, 500);
      };

      audio.onended = handleAudioEnd;

      audio.onerror = () => {
        URL.revokeObjectURL(url);
        console.warn('[TTS] Audio playback error, falling back to browser TTS');
        speakWithBrowserTTS(text);
      };

      await audio.play();
      setActiveTtsVoice(null);
      console.log('[TTS] Playing ElevenLabs eleven_multilingual_v2 audio');
    } catch (err) {
      console.warn('[TTS] ElevenLabs unavailable, falling back to browser TTS:', err);
      speakWithBrowserTTS(text);
    }
  }, [stopRecognition, startListening, speakWithBrowserTTS]);

  const speakResponse = useCallback((text: string) => {
    stopRecognition();
    isSpeakingRef.current = true;
    setVoiceState('speaking');
    speakWithElevenLabs(text);
  }, [stopRecognition, speakWithElevenLabs]);

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 1): Promise<any> => {
    let lastErr: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, options);
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return await res.json();
      } catch (err: any) {
        lastErr = err;
        console.warn(`[voice-chat] Attempt ${attempt + 1}/${retries + 1} failed:`, err?.message || err);
        if (attempt < retries) {
          await new Promise(r => setTimeout(r, 800));
        }
      }
    }
    throw lastErr;
  };

  const handleUserMessage = useCallback(async (userText: string) => {
    stopRecognition();
    isProcessingRef.current = true;
    setVoiceState('processing');
    setTranscript('');
    transcriptRef.current = '';

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userText };

    setMessages(prev => {
      const updated = [...prev, userMessage];

      fetchWithRetry('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map(m => ({ role: m.role, content: m.content }))
        })
      }, 1)
        .then(data => {
          isProcessingRef.current = false;
          if (data && data.reply) {
            setMessages(p => [...p, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply }]);
            if (data.mood) updateMood(data.mood);
            if (data.error) console.error('[API notice]', data.error);
            speakResponse(data.reply);
          } else {
            throw new Error('Empty response from AI server');
          }
        })
        .catch(error => {
          console.error('[voice-chat] API fetch error details:', error);
          isProcessingRef.current = false;

          const friendlyFallback = "Kechirasiz, biroz muammo bo'ldi, qaytadan urinib ko'raylik.";
          setMessages(p => [...p, {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: friendlyFallback,
            error: true
          }]);
          updateMood('agitated');

          // Speak error fallback and restart listening
          speakResponse(friendlyFallback);
        });

      return updated;
    });
  }, [stopRecognition, speakResponse, updateMood]);

  const initializeConversation = useCallback(() => {
    initEchoCancellationMedia();
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: "Salom! Bugun nima haqida gaplashamiz?"
    };
    setMessages([welcomeMessage]);
    speakResponse(welcomeMessage.content);
  }, [initEchoCancellationMedia, speakResponse]);

  useEffect(() => {
    initializeConversation();

    return () => {
      shouldRestartRef.current = false;
      isConversationActiveRef.current = false;
      isSpeakingRef.current = false;
      isProcessingRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(t => t.stop());
      }
      window.speechSynthesis?.cancel();
    };
  }, []);

  const stopConversation = () => {
    shouldRestartRef.current = false;
    isSpeakingRef.current = false;
    isProcessingRef.current = false;
    stopRecognition();
    if (audioRef.current) audioRef.current.pause();
    window.speechSynthesis?.cancel();
    setIsConversationActive(false);
    isConversationActiveRef.current = false;
    setVoiceState('idle');
  };

  const resumeConversation = () => {
    setIsConversationActive(true);
    isConversationActiveRef.current = true;
    if (messages.length === 0) {
      initializeConversation();
    } else {
      startListening();
    }
  };

  const handleRetry = async (messageId: string) => {
    const errorIndex = messages.findIndex(m => m.id === messageId);
    if (errorIndex === -1) return;

    const messagesBeforeError = messages.slice(0, errorIndex);
    stopRecognition();
    isProcessingRef.current = true;
    setVoiceState('processing');
    setMessages(prev => prev.filter(m => m.id !== messageId));

    try {
      const data = await fetchWithRetry('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesBeforeError.map(m => ({ role: m.role, content: m.content }))
        })
      }, 1);

      isProcessingRef.current = false;

      if (data && data.reply) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply }]);
        if (data.mood) updateMood(data.mood);
        speakResponse(data.reply);
      } else {
        throw new Error('No reply from AI');
      }
    } catch (error) {
      console.error('[retry] error details:', error);
      isProcessingRef.current = false;
      const fallbackText = "Qayta urinish ham muvaffaqiyatsiz bo'ldi. Iltimos, keyinroq qayta urinib ko'ring.";
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallbackText,
        error: true
      }]);
      updateMood('agitated');
      speakResponse(fallbackText);
    }
  };

  const getStateText = () => {
    switch (voiceState) {
      case 'listening':
        return 'Tinglayapman...';
      case 'processing':
        return "O'ylayapman...";
      case 'speaking':
        return 'AI Gapirmoqda...';
      default:
        return isConversationActive ? 'Kutilmoqda' : 'Suhbat to\'xtatilgan';
    }
  };

  const getStateColor = () => {
    switch (voiceState) {
      case 'listening':
        return 'text-emerald-500 font-semibold';
      case 'processing':
        return 'text-blue-500 font-semibold';
      case 'speaking':
        return 'text-purple-500 font-semibold';
      default:
        return 'text-slate-500';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto min-h-[75vh]">
      <div className="lg:w-1/3 flex flex-col items-center justify-start mt-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Erkin Suhbat</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            AI bilan erkin, tabiiy suhbat
          </p>
        </div>

        <div className="bg-white/50 dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center w-full space-y-4">
          <AIMascot mood={mood} isThinking={voiceState === 'processing'} className="my-2" />

          {/* Microphone & Voice Status Indicator */}
          <div className="w-full flex flex-col items-center space-y-3 pt-2">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 shadow-xs">
              {voiceState === 'listening' ? (
                <>
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  <Mic size={16} className="text-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Mikrofon faol (Tinglayapman)
                  </span>
                </>
              ) : voiceState === 'speaking' ? (
                <>
                  <Volume2 size={16} className="text-purple-500 animate-pulse" />
                  <MicOff size={16} className="text-purple-400" />
                  <span className="text-xs font-semibold text-purple-600 dark:text-purple-400">
                    Mikrofon o'chirilgan (AI gapirmoqda)
                  </span>
                </>
              ) : voiceState === 'processing' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
                  <MicOff size={16} className="text-slate-400" />
                  <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                    AI o'ylamoqda...
                  </span>
                </>
              ) : (
                <>
                  <MicOff size={16} className="text-slate-400" />
                  <span className="text-xs font-medium text-slate-500">
                    Mikrofon tayyor
                  </span>
                </>
              )}
            </div>

            <div className="flex flex-col items-center text-center space-y-1">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Mascot kayfiyati:{' '}
                <span className={mood === 'agitated' ? 'text-red-500 font-bold' : 'text-blue-500 font-bold'}>
                  {mood.toUpperCase()}
                </span>
              </span>

              {getStateText() && (
                <span className={`text-xs animate-pulse ${getStateColor()}`}>
                  {getStateText()}
                </span>
              )}

              {activeTtsVoice && (
                <span className="text-xs text-amber-600 dark:text-amber-400 font-medium pt-1">
                  Ovoz: {activeTtsVoice}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-2/3 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden h-[600px]">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
          <h2 className="font-semibold text-slate-800 dark:text-slate-200">Suhbat</h2>
          <a href="/mascot" className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
            <MessageSquare size={14} />
            Yozma chat
          </a>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">AI</span>
                </div>
              )}

              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm'
              }`}>
                {msg.content}
                {msg.error && (
                  <button
                    onClick={() => handleRetry(msg.id)}
                    disabled={voiceState !== 'idle'}
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50 block"
                  >
                    Qayta urinish
                  </button>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                  <User size={16} className="text-slate-500 dark:text-slate-400" />
                </div>
              )}
            </div>
          ))}

          {voiceState === 'listening' && transcript && (
            <div className="flex gap-3 justify-end">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                {transcript}
                <span className="animate-pulse">...</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-slate-500 dark:text-slate-400" />
              </div>
            </div>
          )}

          {voiceState === 'processing' && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center flex-shrink-0">
                <span className="text-blue-600 dark:text-blue-400 text-xs font-bold">AI</span>
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={endOfMessagesRef} />
        </div>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex flex-col items-center gap-4">
            {errorMessage && (
              <div className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg flex items-center gap-1">
                <AlertCircle size={14} />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="flex items-center gap-3">
              {isConversationActive ? (
                <button
                  onClick={stopConversation}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors shadow-md"
                  title="Suhbatni to'xtatish"
                >
                  <Square size={24} />
                </button>
              ) : (
                <button
                  onClick={resumeConversation}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors shadow-md"
                  title="Suhbatni davom ettirish"
                >
                  <Play size={24} />
                </button>
              )}

              <div className="text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isConversationActive ? 'Suhbatni tugatish' : 'Suhbatni davom ettirish'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isConversationActive ? "Tugmani bosib to'xtating" : 'Tugmani bosib davom ettiring'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
