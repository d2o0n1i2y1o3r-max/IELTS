'use client';

export type UserPlan = 'demo' | 'free' | 'pro' | 'plus';
export type AIModelType = 'gemini' | 'claude' | 'chatgpt';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isDemo: boolean;
  plan: UserPlan;
  activeModel: AIModelType;
  createdAt: string;
}

const STORAGE_KEY = 'ielts_user_profile';

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as UserProfile;
  } catch {
    return null;
  }
}

export function saveStoredUser(user: UserProfile | null): void {
  if (typeof window === 'undefined') return;
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  }
  window.dispatchEvent(new Event('ielts_auth_changed'));
}

export function setDemoUser(): UserProfile {
  const demo: UserProfile = {
    id: 'demo_' + Math.random().toString(36).substring(2, 9),
    name: 'Demo Foydalanuvchi',
    email: 'demo@ieltsprep.uz',
    isDemo: true,
    plan: 'demo',
    activeModel: 'gemini',
    createdAt: new Date().toISOString(),
  };
  saveStoredUser(demo);
  return demo;
}

export function setGoogleUser(name: string, email: string, avatar?: string): UserProfile {
  const current = getStoredUser();
  const user: UserProfile = {
    id: 'google_' + Math.random().toString(36).substring(2, 9),
    name,
    email,
    avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    isDemo: false,
    plan: (current && !current.isDemo && current.plan !== 'demo') ? current.plan : 'free',
    activeModel: 'gemini',
    createdAt: new Date().toISOString(),
  };
  saveStoredUser(user);
  return user;
}

export function upgradePlan(plan: 'pro' | 'plus'): UserProfile | null {
  const user = getStoredUser();
  if (!user) return null;
  user.plan = plan;
  if (plan === 'pro') {
    user.activeModel = 'gemini'; // can choose gemini or claude
  } else if (plan === 'plus') {
    user.activeModel = 'chatgpt'; // can choose chatgpt, claude, gemini
  }
  saveStoredUser(user);
  return user;
}

export function setActiveModel(model: AIModelType): UserProfile | null {
  const user = getStoredUser();
  if (!user) return null;
  user.activeModel = model;
  saveStoredUser(user);
  return user;
}

export function logoutUser(): void {
  saveStoredUser(null);
}
