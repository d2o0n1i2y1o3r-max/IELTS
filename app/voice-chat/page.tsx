'use client';

import React, { useState, useRef, useEffect } from 'react';
import AIMascot from '@/components/AIMascot';
import { useMascotMood } from '@/hooks/useMascotMood';
import { Mic, User, RotateCcw, MessageSquare, Square, Play } from 'lucide-react';

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
  const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);
  const hasAutoStartedRef = useRef(false);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceState]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
    }
  }, []);

  const speakResponse = (text: string) => {
    return new Promise<void>((resolve, reject) => {
      if (!synthesisRef.current) {
        setVoiceState('idle');
        reject(new Error('Speech synthesis not available'));
        return;
      }

      setVoiceState('speaking');
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      let voices = synthesisRef.current.getVoices();
      if (voices.length === 0) {
        voices = synthesisRef.current.getVoices();
      }

      const uzVoice = voices.find(voice => voice.lang.includes('uz'));
      const ruVoice = voices.find(voice => voice.lang.includes('ru'));
      const enVoice = voices.find(voice => voice.lang.includes('en'));

      if (uzVoice) {
        utterance.voice = uzVoice;
        utterance.lang = 'uz-UZ';
      } else if (ruVoice) {
        utterance.voice = ruVoice;
        utterance.lang = 'ru-RU';
        setErrorMessage('O\'zbek tili ovozi topilmadi, rus tilidan foydalanilmoqda.');
      } else if (enVoice) {
        utterance.voice = enVoice;
        utterance.lang = 'en-US';
        setErrorMessage('O\'zbek va rus tillari ovozlari topilmadi, ingliz tilidan foydalanilmoqda.');
      }

      utterance.rate = 0.9;
      utterance.pitch = 1;

      utterance.onend = () => {
        setVoiceState('idle');
        if (isConversationActive) {
          setTimeout(() => {
            startListening();
          }, 500);
        }
        resolve();
      };

      utterance.onerror = () => {
        setVoiceState('idle');
        reject(new Error('Speech synthesis error'));
      };

      synthesisRef.current.speak(utterance);
    });
  };

  useEffect(() => {
    if (!hasAutoStartedRef.current && isConversationActive) {
      hasAutoStartedRef.current = true;
      initializeConversation();
    }
  }, [isConversationActive]);

  const initializeConversation = async () => {
    const welcomeMessage: Message = {
      id: '1',
      role: 'assistant',
      content: "Salom! Bugun nima haqida gaplashamiz?"
    };
    setMessages([welcomeMessage]);
    
    try {
      await speakResponse(welcomeMessage.content);
    } catch (error) {
      console.log('Auto-start blocked by browser, requiring user interaction');
      setNeedsUserInteraction(true);
    }
  };

  const startListening = () => {
    if (!isConversationActive) return;
    
    setErrorMessage('');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setErrorMessage('Sizning brauzeringiz ovozni tanish funksiyasini qo\'llab-quvvatlamaydi. Chrome yoki Edge brauzeridan foydalaning.');
      return;
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'uz-UZ';

    recognition.onstart = () => {
      setVoiceState('listening');
      setTranscript('');
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      setTranscript(finalTranscript || interimTranscript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setVoiceState('idle');
      
      if (event.error === 'not-allowed') {
        setErrorMessage('Mikrofon ruxsati berilmadi. Iltimos, brauzer sozlamalaridan mikrofon ruxsatini bering.');
      } else if (event.error === 'no-speech') {
        setErrorMessage('Ovoz aniqlanmadi. Iltimos, qayta urinib ko\'ring.');
      } else {
        setErrorMessage(`Ovozni tanishda xato: ${event.error}`);
      }
    };

    recognition.onend = () => {
      if (transcript.trim()) {
        handleUserMessage(transcript.trim());
      } else {
        setVoiceState('idle');
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setVoiceState('idle');
  };

  const stopConversation = () => {
    stopListening();
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsConversationActive(false);
    setVoiceState('idle');
  };

  const resumeConversation = () => {
    setIsConversationActive(true);
    setNeedsUserInteraction(false);
    if (messages.length === 0) {
      initializeConversation();
    } else {
      startListening();
    }
  };

  const handleUserMessage = async (userText: string) => {
    setVoiceState('processing');
    setTranscript('');
    
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: userText };
    setMessages(prev => [...prev, userMessage]);

    try {
      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();

      if (data.reply) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply }]);
        if (data.mood) updateMood(data.mood);
        
        if (data.error) {
          console.error('API Error:', data.error);
        }
        
        speakResponse(data.reply);
      } else {
        throw new Error('No reply from AI');
      }
    } catch (error) {
      console.error('Voice chat fetch error:', error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "Tarmoq xatosi yuz berdi. Iltimos, internet ulanishingizni tekshiring va qaytadan urinib ko'ring.",
        error: true
      }]);
      updateMood('agitated');
      setVoiceState('idle');
    }
  };

  const handleRetry = async (messageId: string) => {
    const errorIndex = messages.findIndex(m => m.id === messageId);
    if (errorIndex === -1) return;

    const messagesBeforeError = messages.slice(0, errorIndex);
    
    setVoiceState('processing');
    setMessages(prev => prev.filter(m => m.id !== messageId));

    try {
      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesBeforeError.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();

      if (data.reply) {
        setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply }]);
        if (data.mood) updateMood(data.mood);
        
        if (data.error) {
          console.error('API Error:', data.error);
        }
        
        speakResponse(data.reply);
      } else {
        throw new Error('No reply from AI');
      }
    } catch (error) {
      console.error('Voice chat retry error:', error);
      setMessages(prev => [...prev, { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "Qayta urinish ham muvaffaqiyatsiz bo'ldi. Iltimos keyinroq qayta urinib ko'ring.",
        error: true
      }]);
      updateMood('agitated');
      setVoiceState('idle');
    }
  };

  const getStateText = () => {
    switch (voiceState) {
      case 'listening': return 'Tinglayapman...';
      case 'processing': return 'O\'ylayapman...';
      case 'speaking': return 'Gapiryapman...';
      default: return '';
    }
  };

  const getStateColor = () => {
    switch (voiceState) {
      case 'listening': return 'text-green-500';
      case 'processing': return 'text-blue-500';
      case 'speaking': return 'text-purple-500';
      default: return 'text-slate-500';
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
        
        <div className="bg-white/50 dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center w-full">
          <AIMascot mood={mood} isThinking={voiceState !== 'idle'} className="my-4" />
          
          <div className="mt-6 flex flex-col items-center w-full space-y-2">
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Joriy Holat: <span className={mood === 'agitated' ? 'text-red-500 font-bold' : 'text-blue-500 font-bold'}>{mood.toUpperCase()}</span>
            </span>
            {getStateText() && (
              <span className={`text-xs animate-pulse ${getStateColor()}`}>{getStateText()}</span>
            )}
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
                    className="mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
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
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                <User size={16} className="text-slate-500 dark:text-slate-400" />
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-slate-700 dark:text-slate-300">
                {transcript}
                <span className="animate-pulse">...</span>
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
              <div className="text-xs text-red-500 text-center bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                {errorMessage}
              </div>
            )}
            
            {needsUserInteraction && (
              <div className="text-xs text-amber-600 text-center bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg">
                Suhbatni boshlash uchun tugmani bosing
              </div>
            )}
            
            <div className="flex items-center gap-3">
              {isConversationActive ? (
                <button
                  onClick={stopConversation}
                  className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition-colors"
                >
                  <Square size={24} />
                </button>
              ) : (
                <button
                  onClick={resumeConversation}
                  className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition-colors"
                >
                  <Play size={24} />
                </button>
              )}
              
              <div className="text-center">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {isConversationActive ? 'Suhbatni tugatish' : 'Suhbatni davom ettirish'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isConversationActive ? 'Tugmani bosib to\'xtating' : 'Tugmani bosib davom ettiring'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
