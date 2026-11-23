import fs from 'fs';
import path from 'path';
import { Question, SpeakingSession, PracticeSession, WritingPrompt, ReadingPassage, ListeningPassage, FullTestSession, User, LearnProgress, LearnSession, Unit, Lesson } from './types';

const dataDir = path.join(process.cwd(), 'data');
const questionsPath = path.join(dataDir, 'questions.json');
const writingPromptsPath = path.join(dataDir, 'writing-prompts.json');
const readingPassagesPath = path.join(dataDir, 'reading-passages.json');
const listeningPassagesPath = path.join(dataDir, 'listening-passages.json');
const historyPath = path.join(dataDir, 'history.json');
const usersPath = path.join(dataDir, 'users.json');
const learnProgressPath = path.join(dataDir, 'learn-progress.json');
const learnSessionsPath = path.join(dataDir, 'learn-sessions.json');
const learnUnitsPath = path.join(dataDir, 'learn/units.json');
const learnLessonsPath = path.join(dataDir, 'learn/lessons.json');

export function getQuestionsData(): Question[] {
  try {
    if (!fs.existsSync(questionsPath)) {
      return [];
    }
    const content = fs.readFileSync(questionsPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.questions || [];
  } catch {
    return [];
  }
}

export function getWritingPromptsData(): WritingPrompt[] {
  try {
    if (!fs.existsSync(writingPromptsPath)) {
      return [];
    }
    const content = fs.readFileSync(writingPromptsPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.prompts || [];
  } catch {
    return [];
  }
}

export function getReadingPassagesData(): ReadingPassage[] {
  try {
    if (!fs.existsSync(readingPassagesPath)) {
      return [];
    }
    const content = fs.readFileSync(readingPassagesPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.passages || [];
  } catch {
    return [];
  }
}

export function getListeningPassagesData(): ListeningPassage[] {
  try {
    if (!fs.existsSync(listeningPassagesPath)) {
      return [];
    }
    const content = fs.readFileSync(listeningPassagesPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.passages || [];
  } catch {
    return [];
  }
}

export function getHistoryData(): (PracticeSession | FullTestSession | LearnSession)[] {
  try {
    if (!fs.existsSync(historyPath)) {
      return [];
    }
    const content = fs.readFileSync(historyPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.sessions || [];
  } catch {
    return [];
  }
}

export function saveSessionToHistory(session: PracticeSession | FullTestSession | LearnSession): (PracticeSession | FullTestSession | LearnSession)[] {
  try {
    const existing = getHistoryData();
    const updated = [session, ...existing];
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(historyPath, JSON.stringify({ sessions: updated }, null, 2), 'utf8');
    return updated;
  } catch {
    return getHistoryData();
  }
}

export function deleteSessionFromHistory(id: string): (PracticeSession | FullTestSession | LearnSession)[] {
  try {
    const existing = getHistoryData();
    const updated = existing.filter(s => s.id !== id);
    
    fs.writeFileSync(historyPath, JSON.stringify({ sessions: updated }, null, 2), 'utf8');
    return updated;
  } catch {
    return getHistoryData();
  }
}

// ─── User (Registration) Functions ───

export function getUsersData(): User[] {
  try {
    if (!fs.existsSync(usersPath)) {
      return [];
    }
    const content = fs.readFileSync(usersPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.users || [];
  } catch {
    return [];
  }
}

export function findUserByEmail(email: string): User | undefined {
  const users = getUsersData();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function saveUser(user: User): User {
  try {
    const existing = getUsersData();
    const updated = [...existing, user];

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(usersPath, JSON.stringify({ users: updated }, null, 2), 'utf8');
    return user;
  } catch (err) {
    throw new Error(`Foydalanuvchini saqlashda xato: ${err}`);
  }
}

export function updateUser(userId: string, updates: Partial<User>): User {
  try {
    const users = getUsersData();
    const userIndex = users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new Error('Foydalanuvchi topilmadi');
    }

    const updatedUser = { ...users[userIndex], ...updates };
    users[userIndex] = updatedUser;

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(usersPath, JSON.stringify({ users }, null, 2), 'utf8');
    return updatedUser;
  } catch (err) {
    throw new Error(`Foydalanuvchini yangilashda xato: ${err}`);
  }
}

// ─── Learn Mode Functions ───

export function getLearnUnitsData(): Unit[] {
  try {
    if (!fs.existsSync(learnUnitsPath)) {
      return [];
    }
    const content = fs.readFileSync(learnUnitsPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.units || [];
  } catch {
    return [];
  }
}

export function getLearnLessonsData(): Lesson[] {
  try {
    if (!fs.existsSync(learnLessonsPath)) {
      return [];
    }
    const content = fs.readFileSync(learnLessonsPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.lessons || [];
  } catch {
    return [];
  }
}

export function getLearnProgressData(): LearnProgress[] {
  try {
    if (!fs.existsSync(learnProgressPath)) {
      return [];
    }
    const content = fs.readFileSync(learnProgressPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.progress || [];
  } catch {
    return [];
  }
}

export function saveLearnProgress(progress: LearnProgress[]): LearnProgress[] {
  try {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(learnProgressPath, JSON.stringify({ progress }, null, 2), 'utf8');
    return progress;
  } catch {
    return getLearnProgressData();
  }
}

export function getLearnSessionsData(): LearnSession[] {
  try {
    if (!fs.existsSync(learnSessionsPath)) {
      return [];
    }
    const content = fs.readFileSync(learnSessionsPath, 'utf8');
    const parsed = JSON.parse(content);
    return parsed.sessions || [];
  } catch {
    return [];
  }
}

export function saveLearnSession(session: LearnSession): LearnSession[] {
  try {
    const existing = getLearnSessionsData();
    const updated = [session, ...existing];

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    fs.writeFileSync(learnSessionsPath, JSON.stringify({ sessions: updated }, null, 2), 'utf8');
    return updated;
  } catch {
    return getLearnSessionsData();
  }
}

export function getUserLearnProgress(userId: string): LearnProgress | null {
  const progressList = getLearnProgressData();
  return progressList.find((p) => p.userId === userId) || null;
}

export function updateUserLearnProgress(userId: string, updates: Partial<LearnProgress>): LearnProgress {
  try {
    const progressList = getLearnProgressData();
    const existingIndex = progressList.findIndex((p) => p.userId === userId);

    let updatedProgress: LearnProgress;

    if (existingIndex >= 0) {
      updatedProgress = { ...progressList[existingIndex], ...updates };
      progressList[existingIndex] = updatedProgress;
    } else {
      // Create new progress entry
      updatedProgress = {
        userId,
        completedLessons: {},
        xp: 0,
        lastActiveDate: new Date().toISOString(),
        ...updates,
      };
      progressList.push(updatedProgress);
    }

    saveLearnProgress(progressList);
    return updatedProgress;
  } catch (err) {
    throw new Error(`Learn progress update error: ${err}`);
  }
}

export function getWeeklyLeaderboard(): Array<{ userId: string; name: string; xp: number; isGuest: boolean }> {
  try {
    const progressList = getLearnProgressData();
    const users = getUsersData();

    // Get Monday of current week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setHours(0, 0, 0, 0);

    // Filter progress by lastActiveDate >= Monday
    const weeklyProgress = progressList.filter((p) => new Date(p.lastActiveDate) >= monday);

    // Combine with user names
    const leaderboard = weeklyProgress.map((p) => {
      const user = users.find((u) => u.id === p.userId);
      return {
        userId: p.userId,
        name: user?.name || 'Guest',
        xp: p.xp,
        isGuest: !user,
      };
    });

    // Sort by XP descending and take top 20
    return leaderboard.sort((a, b) => b.xp - a.xp).slice(0, 20);
  } catch {
    return [];
  }
}
