'use client';

import React, { useState, useRef, useEffect } from 'react';
import AIMascot from '@/components/AIMascot';
import { useMascotMood } from '@/hooks/useMascotMood';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function VoiceOnlyPage() {
  const { mood, updateMood } = useMascotMood();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConversationActive, setIsConversationActive] = useState(true);
  
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthesisRef.current = window.speechSynthesis;
      initializeConversation();
    }
  }, []);

  const speakWithBrowserTTS = (text: string) => {
    if (!synthesisRef.current) {
      setVoiceState('idle');
      return;
    }

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
    } else if (enVoice) {
      utterance.voice = enVoice;
      utterance.lang = 'en-US';
    }

    utterance.rate = 0.9;
    utterance.pitch = 1;

    utterance.onend = () => {
      setVoiceState('idle');
      setTimeout(() => {
        startListening();
      }, 500);
    };

    utterance.onerror = () => {
      setVoiceState('idle');
    };

    synthesisRef.current.speak(utterance);
  };

  const speakResponse = (text: string) => {
    setVoiceState('speaking');
    speakWithBrowserTTS(text);
  };

  const initializeConversation = () => {
    speakResponse("Salom! Bugun nima haqida gaplashamiz?");
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
    startListening();
  };

  const handleUserMessage = async (userText: string) => {
    setVoiceState('processing');
    setTranscript('');
    
    try {
      const response = await fetch('/api/voice-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: userText }]
        })
      });

      const data = await response.json();

      if (data.reply) {
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
      case 'listening': return 'text-green-400';
      case 'processing': return 'text-blue-400';
      case 'speaking': return 'text-purple-400';
      default: return 'text-slate-400';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-950 flex items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center space-y-6">
        <div className="relative">
          <div className="w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
            <AIMascot mood={mood} isThinking={voiceState !== 'idle'} className="w-full h-full" />
          </div>
        </div>
        
        <div className="flex flex-col items-center space-y-1">
          <span className="text-white text-sm font-medium opacity-90">
            Joriy Holat: <span className={`font-bold ${mood === 'agitated' ? 'text-red-400' : 'text-blue-300'}`}>{mood.toUpperCase()}</span>
          </span>
          {getStateText() && (
            <span className={`text-sm animate-pulse ${getStateColor()}`}>{getStateText()}</span>
          )}
        </div>

        {errorMessage && (
          <div className="text-xs text-red-300 text-center bg-red-950/30 px-4 py-2 rounded-lg max-w-md border border-red-900/30">
            {errorMessage}
          </div>
        )}
        
        <div className="flex items-center gap-4">
          {isConversationActive ? (
            <button
              onClick={stopConversation}
              className="w-12 h-12 rounded-full bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/20 flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <div className="w-3 h-3 bg-red-400 rounded-sm" />
            </button>
          ) : (
            <button
              onClick={resumeConversation}
              className="w-12 h-12 rounded-full bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/20 flex items-center justify-center transition-all backdrop-blur-sm"
            >
              <div className="w-0 h-0 border-t-6 border-t-transparent border-l-10 border-l-green-400 border-b-6 border-b-transparent ml-1" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}