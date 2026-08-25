import fs from 'fs';
import path from 'path';
import { Question, SpeakingSession, PracticeSession, WritingPrompt, ReadingPassage, ListeningPassage, FullTestSession, User } from './types';

const dataDir = path.join(process.cwd(), 'data');
const questionsPath = path.join(dataDir, 'questions.json');
const writingPromptsPath = path.join(dataDir, 'writing-prompts.json');
const readingPassagesPath = path.join(dataDir, 'reading-passages.json');
const listeningPassagesPath = path.join(dataDir, 'listening-passages.json');
const historyPath = path.join(dataDir, 'history.json');
const usersPath = path.join(dataDir, 'users.json');

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

export function getHistoryData(): (PracticeSession | FullTestSession)[] {
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

export function saveSessionToHistory(session: PracticeSession | FullTestSession): (PracticeSession | FullTestSession)[] {
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

export function deleteSessionFromHistory(id: string): (PracticeSession | FullTestSession)[] {
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
