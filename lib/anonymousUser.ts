// lib/anonymousUser.ts
// Client-side anonymous user management (100% free, no email, no password)

export interface AnonymousUser {
  userId: string;
  token: string;
  nickname: string;
  recoveryCode?: string; // Only stored locally or shown once to user
  createdAt: string;
}

const STORAGE_KEY = 'ielts_anon_user';

export function getLocalUser(): AnonymousUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveLocalUser(user: AnonymousUser): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  // Dispatch custom event so all components react immediately
  window.dispatchEvent(new CustomEvent('ielts_user_updated', { detail: user }));
}

/**
 * Initializes anonymous user on first visit.
 * If already existing, returns current user.
 */
export async function getOrInitUser(): Promise<AnonymousUser> {
  const existing = getLocalUser();
  if (existing && existing.token && existing.userId) {
    return existing;
  }

  // Request new anonymous account from server
  try {
    const res = await fetch('/api/auth/anonymous', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.user) {
        saveLocalUser(data.user);
        return data.user;
      }
    }
  } catch (err) {
    console.warn('Server anonymous creation failed, falling back to local generation:', err);
  }

  // Client fallback if network offline
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const fallbackUser: AnonymousUser = {
    userId: `u_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    token: Array.from(crypto.getRandomValues(new Uint8Array(32)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join(''),
    nickname: `Guest-${randomNum}`,
    recoveryCode: 'swift-falcon-river-cloud',
    createdAt: new Date().toISOString(),
  };

  saveLocalUser(fallbackUser);
  return fallbackUser;
}

/**
 * Restore an anonymous user account via 4-word recovery code
 */
export async function restoreAccountByCode(recoveryCode: string): Promise<{ success: boolean; user?: AnonymousUser; error?: string }> {
  try {
    const res = await fetch('/api/auth/anonymous/restore', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recoveryCode: recoveryCode.trim().toLowerCase() }),
    });

    const data = await res.json();
    if (res.ok && data.user) {
      const restoredUser: AnonymousUser = {
        ...data.user,
        recoveryCode: recoveryCode.trim().toLowerCase(),
      };
      saveLocalUser(restoredUser);
      return { success: true, user: restoredUser };
    }

    return { success: false, error: data.error || 'Invalid recovery code' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error' };
  }
}

/**
 * Updates optional nickname (2-20 characters)
 */
export async function updateLocalNickname(nickname: string): Promise<{ success: boolean; error?: string }> {
  const trimmed = nickname.trim();
  if (trimmed.length < 2 || trimmed.length > 20) {
    return { success: false, error: 'Nickname must be between 2 and 20 characters.' };
  }

  const current = getLocalUser();
  if (!current) {
    return { success: false, error: 'User not initialized' };
  }

  current.nickname = trimmed;
  saveLocalUser(current);

  // Sync to server
  try {
    await fetch('/api/auth/anonymous', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: current.token, nickname: trimmed }),
    });
  } catch (e) {
    console.warn('Failed to sync nickname to server:', e);
  }

  return { success: true };
}
