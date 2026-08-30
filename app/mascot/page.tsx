'use client';

import React, { useState, useRef, useEffect } from 'react';
import AIMascot from '@/components/AIMascot';
import { useMascotMood } from '@/hooks/useMascotMood';
import { useConversationStorage } from '@/hooks/useConversationStorage';
import ConversationSidebar from '@/components/ConversationSidebar';
import { Send, User, Menu } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

export default function MascotChatPage() {
  const { mood, updateMood } = useMascotMood();
  const {
    conversations,
    currentConversationId,
    createConversation,
    updateConversation,
    deleteConversation,
    loadConversation,
    setCurrentConversationId
  } = useConversationStorage();
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Salom! Men sizning IELTS bo'yicha AI yordamchiningizman. Grammatika, so'z boyligi yoki IELTS strategiyalari bo'yicha istalgan savolingizni bering!",
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleNewConversation = () => {
    const initialMessage: Message = {
      id: '1',
      role: 'assistant',
      content: "Salom! Men sizning IELTS bo'yicha AI yordamchiningizman. Grammatika, so'z boyligi yoki IELTS strategiyalari bo'yicha istalgan savolingizni bering!",
    };
    const newId = createConversation(initialMessage);
    setMessages([initialMessage]);
    updateMood('calm');
  };

  const handleSelectConversation = (id: string) => {
    const loadedMessages = loadConversation(id);
    setMessages(loadedMessages);
    setSidebarOpen(false);
  };

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isThinking) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsThinking(true);

    if (!currentConversationId) {
      createConversation(userMessage);
    } else {
      updateConversation(currentConversationId, updatedMessages);
    }

    try {
      const response = await fetch('/api/mascot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply };
        const finalMessages = [...updatedMessages, assistantMessage];
        setMessages(finalMessages);
        
        if (currentConversationId) {
          updateConversation(currentConversationId, finalMessages);
        }
        
        if (data.mood) updateMood(data.mood);
        
        if (data.error) {
          console.error('API Error:', data.error);
        }
      } else {
        throw new Error('No reply from AI');
      }
    } catch (error) {
      console.error('Mascot fetch error:', error);
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "Tarmoq xatosi yuz berdi. Iltimos, internet ulanishingizni tekshiring va qaytadan urinib ko'ring.",
        error: true
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      
      if (currentConversationId) {
        updateConversation(currentConversationId, finalMessages);
      }
      
      updateMood('agitated');
    } finally {
      setIsThinking(false);
    }
  };

  const handleRetry = async (messageId: string) => {
    const errorIndex = messages.findIndex(m => m.id === messageId);
    if (errorIndex === -1) return;

    const messagesBeforeError = messages.slice(0, errorIndex);
    
    setIsThinking(true);
    setMessages(prev => prev.filter(m => m.id !== messageId));

    try {
      const response = await fetch('/api/mascot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messagesBeforeError.map(m => ({ role: m.role, content: m.content }))
        })
      });

      const data = await response.json();

      if (data.reply) {
        const assistantMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: data.reply };
        const finalMessages = [...messagesBeforeError, assistantMessage];
        setMessages(finalMessages);
        
        if (currentConversationId) {
          updateConversation(currentConversationId, finalMessages);
        }
        
        if (data.mood) updateMood(data.mood);
        
        if (data.error) {
          console.error('API Error:', data.error);
        }
      } else {
        throw new Error('No reply from AI');
      }
    } catch (error) {
      console.error('Mascot retry error:', error);
      const errorMessage: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "Qayta urinish ham muvaffaqiyatsiz bo'ldi. Iltimos keyinroq qayta urinib ko'ring.",
        error: true
      };
      const finalMessages = [...messagesBeforeError, errorMessage];
      setMessages(finalMessages);
      
      if (currentConversationId) {
        updateConversation(currentConversationId, finalMessages);
      }
      
      updateMood('agitated');
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={deleteConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex-1 flex flex-col lg:flex-row gap-8 max-w-5xl mx-auto min-h-[75vh] p-4 lg:p-8">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden mb-4 p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
        >
          <Menu size={20} className="text-slate-600 dark:text-slate-400" />
        </button>

        <div className="lg:w-1/3 flex flex-col items-center justify-start space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">AI Buddy</h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              IELTS savollaringizga javob beradi va holatingizga qarab o'zgaradi.
            </p>
          </div>
          
          <div className="bg-white/50 dark:bg-slate-900/50 p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center w-full">
            <AIMascot mood={mood} isThinking={isThinking} className="my-4" />
            
            <div className="mt-6 flex flex-col items-center w-full space-y-2">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Joriy Holat: <span className={mood === 'agitated' ? 'text-red-500 font-bold' : 'text-blue-500 font-bold'}>{mood.toUpperCase()}</span>
              </span>
              {isThinking && (
                <span className="text-xs text-slate-400 animate-pulse">AI o'ylamoqda...</span>
              )}
            </div>
          </div>
        </div>

        <div className="lg:w-2/3 flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden h-[600px]">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex justify-between items-center">
            <h2 className="font-semibold text-slate-800 dark:text-slate-200">Suhbat</h2>
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
                      disabled={isThinking}
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
            
            {isThinking && (
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
            <form onSubmit={handleSend} className="flex items-center gap-2 relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isThinking}
                placeholder="Savolingizni yozing..."
                className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-full px-5 py-3 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isThinking}
                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-blue-600 flex-shrink-0"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
