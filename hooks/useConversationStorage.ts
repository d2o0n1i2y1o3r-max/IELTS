import { useState, useEffect } from 'react';

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

const STORAGE_KEY = 'ai_conversations';

export function useConversationStorage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConversations(JSON.parse(stored));
      } catch {
        console.error('Failed to parse conversations from localStorage');
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  }, [conversations]);

  const createConversation = (firstMessage: Message): string => {
    const id = `conv-${Date.now()}`;
    const title = firstMessage.content.slice(0, 30) + (firstMessage.content.length > 30 ? '...' : '');
    
    const newConversation: Conversation = {
      id,
      title,
      messages: [firstMessage],
      createdAt: new Date().toISOString()
    };

    setConversations(prev => [newConversation, ...prev]);
    setCurrentConversationId(id);
    return id;
  };

  const updateConversation = (id: string, messages: Message[]): void => {
    setConversations(prev => 
      prev.map(conv => 
        conv.id === id 
          ? { ...conv, messages, title: messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? '...' : '') }
          : conv
      )
    );
  };

  const deleteConversation = (id: string): void => {
    setConversations(prev => prev.filter(conv => conv.id !== id));
    if (currentConversationId === id) {
      setCurrentConversationId(null);
    }
  };

  const loadConversation = (id: string): Message[] => {
    const conversation = conversations.find(conv => conv.id === id);
    if (conversation) {
      setCurrentConversationId(id);
      return conversation.messages;
    }
    return [];
  };

  return {
    conversations,
    currentConversationId,
    createConversation,
    updateConversation,
    deleteConversation,
    loadConversation,
    setCurrentConversationId
  };
}
