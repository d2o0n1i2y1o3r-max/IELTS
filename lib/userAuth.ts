'use client';

export type UserPlan = 'demo' | 'free' | 'pro' | 'pro_yearly' | 'plus';
export type AIModelType = 'gemini' | 'claude' | 'chatgpt' | 'claude_opus';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  isDemo: boolean;
  plan: UserPlan;
  activeModel: AIModelType;
  createdAt: string;
  proExpiry?: string;
}

export const PRO_PRICING = {
  monthly: {
    id: 'monthly',
    name: 'PRO Oylik',
    price: 10000,
    formattedPrice: "10 000 so'm",
    period: '/ oy',
    desc: "Har oy to'lanadi, istalgan vaqtda bekor qilish mumkin",
  },
  yearly: {
    id: 'yearly',
    name: 'PRO Yillik (Chegirma bilan)',
    price: 90000,
    formattedPrice: "90 000 so'm",
    period: '/ yil',
    discount: '25% chegirma',
    savings: "30 000 so'm tejaladi",
    desc: "Oyiga atigi 7 500 so'mdan to'g'ri keladi",
  },
} as const;

export interface ModelDefinition {
  id: AIModelType;
  name: string;
  badge: string;
  isPro: boolean;
  notice?: string;
  provider: 'Google' | 'OpenAI' | 'Anthropic';
  description: string;
}

export const AI_MODELS: ModelDefinition[] = [
  {
    id: 'gemini',
    name: 'Gemini 2.0 Flash',
    badge: 'Medium · Free',
    isPro: false,
    provider: 'Google',
    description: 'Tezkor va aniq umumiy javoblar',
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT (GPT-4o)',
    badge: 'Fast · Free',
    isPro: false,
    provider: 'OpenAI',
    description: 'Tabiiy muloqot va grammatik tahlil',
  },
  {
    id: 'claude',
    name: 'Claude 3.5 Sonnet (Thinking)',
    badge: 'Paid Pro',
    isPro: true,
    notice: 'Notice',
    provider: 'Anthropic',
    description: 'Chuqur fikrlash va yuqori darajadagi IELTS baholash',
  },
  {
    id: 'claude_opus',
    name: 'Claude 3 Opus (Thinking)',
    badge: 'Paid Pro',
    isPro: true,
    notice: 'Notice',
    provider: 'Anthropic',
    description: 'Eng murakkab insholar va akademik tahlil',
  },
];

const STORAGE_KEY = 'ielts_user_profile';

export function getStoredUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as UserProfile;
    // ensure activeModel exists
    if (!parsed.activeModel) {
      parsed.activeModel = 'gemini';
    }
    return parsed;
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

export function isProUser(user: UserProfile | null): boolean {
  if (!user) return false;
  return user.plan === 'pro' || user.plan === 'pro_yearly' || user.plan === 'plus';
}

export function canUseModel(modelId: AIModelType, user: UserProfile | null): boolean {
  const model = AI_MODELS.find((m) => m.id === modelId);
  if (!model) return false;
  if (!model.isPro) return true; // Free models (Gemini, ChatGPT)
  return isProUser(user); // Claude models require PRO
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
    plan: current && !current.isDemo && current.plan !== 'demo' ? current.plan : 'free',
    activeModel: current?.activeModel || 'gemini',
    createdAt: new Date().toISOString(),
  };
  saveStoredUser(user);
  return user;
}

export function upgradePlan(plan: 'pro' | 'plus' | 'pro_yearly'): UserProfile | null {
  const user = getStoredUser();
  if (!user) return null;
  user.plan = plan;
  if (plan === 'pro' || plan === 'pro_yearly') {
    user.activeModel = 'claude';
  } else if (plan === 'plus') {
    user.activeModel = 'chatgpt';
  }
  saveStoredUser(user);
  return user;
}

export function setActiveModel(model: AIModelType): UserProfile | null {
  const user = getStoredUser();
  if (!user) return null;
  // If user tries to set a PRO model without PRO, block
  if ((model === 'claude' || model === 'claude_opus') && !isProUser(user)) {
    return null;
  }
  user.activeModel = model;
  saveStoredUser(user);
  return user;
}

export function logoutUser(): void {
  saveStoredUser(null);
}
