'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, MessageSquare, Trash2, MoreVertical } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  error?: boolean;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: string;
}

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function ConversationSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isOpen,
  onToggle
}: ConversationSidebarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    onDeleteConversation(id);
    setShowDeleteConfirm(null);
  };

  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed bottom-4 right-4 z-50 w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center"
      >
        <MessageSquare size={20} />
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <h2 className="font-semibold text-slate-900 dark:text-white">Suhbatlar tarixi</h2>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={18} className="text-slate-500 dark:text-slate-400" />
            </button>
          </div>

          <button
            onClick={onNewConversation}
            className="m-4 flex items-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors"
          >
            <Plus size={18} />
            Yangi suhbat
          </button>

          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
            {conversations.length === 0 ? (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                Hali suhbatlar yo'q
              </div>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group relative p-3 rounded-xl cursor-pointer transition-colors ${
                    currentConversationId === conv.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                  }`}
                >
                  <button
                    onClick={() => onSelectConversation(conv.id)}
                    className="w-full text-left"
                  >
                    <div className="flex items-start gap-3">
                      <MessageSquare size={16} className="text-slate-400 dark:text-slate-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {conv.title}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {new Date(conv.createdAt).toLocaleDateString('uz-UZ')}
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => setShowDeleteConfirm(conv.id)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 size={14} />
                  </button>

                  {showDeleteConfirm === conv.id && (
                    <div className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl flex items-center justify-center gap-2 z-10">
                      <span className="text-xs text-slate-600 dark:text-slate-300">O'chirish?</span>
                      <button
                        onClick={() => handleDelete(conv.id)}
                        className="px-2 py-1 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg"
                      >
                        Ha
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(null)}
                        className="px-2 py-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs rounded-lg"
                      >
                        Yo'q
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isOpen && (
        <div
          onClick={onToggle}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}
    </>
  );
}
