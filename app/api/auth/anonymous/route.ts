import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'anonymous-users.json');

const WORDS = [
  'amber', 'anchor', 'arrow', 'autumn', 'bamboo', 'beacon', 'birch', 'blaze',
  'breeze', 'bridge', 'brook', 'canvas', 'canyon', 'cedar', 'cliff', 'cloud',
  'comet', 'coral', 'cove', 'crane', 'crystal', 'delta', 'desert', 'dove',
  'drift', 'dune', 'eagle', 'echo', 'ember', 'falcon', 'feather', 'fern',
  'flint', 'forest', 'frost', 'glade', 'grove', 'harbor', 'haven', 'hawk',
  'island', 'jasper', 'lagoon', 'lake', 'lark', 'laurel', 'leaf', 'meadow',
  'meteor', 'moon', 'moss', 'mountain', 'nebula', 'oasis', 'ocean', 'orbit',
  'otter', 'peak', 'pebble', 'pine', 'planet', 'polar', 'prairie', 'quartz',
  'rain', 'raven', 'reef', 'ridge', 'river', 'robin', 'sail', 'shadow',
  'silver', 'solar', 'spark', 'spruce', 'star', 'stone', 'storm', 'stream',
  'summit', 'sunset', 'swift', 'tide', 'timber', 'trail', 'valley', 'wave',
  'willow', 'wind', 'winter', 'wolf', 'zenith', 'aurora', 'cascade', 'glacier'
];

function generateRecoveryCode(): string {
  const selected: string[] = [];
  while (selected.length < 4) {
    const word = WORDS[Math.floor(Math.random() * WORDS.length)];
    if (!selected.includes(word)) {
      selected.push(word);
    }
  }
  return selected.join('-');
}

function hashRecoveryCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toLowerCase()).digest('hex');
}

function getStoredUsers(): Record<string, any> {
  try {
    if (!fs.existsSync(USERS_FILE)) return {};
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data || '{}');
  } catch {
    return {};
  }
}

function saveStoredUsers(users: Record<string, any>): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save anonymous users:', err);
  }
}

export async function POST() {
  try {
    const users = getStoredUsers();

    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const userId = `u_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const token = crypto.randomBytes(32).toString('hex');
    const nickname = `Guest-${randomNum}`;
    const recoveryCode = generateRecoveryCode();
    const recoveryCodeHash = hashRecoveryCode(recoveryCode);

    const userRecord = {
      id: userId,
      token,
      nickname,
      recoveryCodeHash,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users[userId] = userRecord;
    saveStoredUsers(users);

    return NextResponse.json({
      user: {
        userId,
        token,
        nickname,
        recoveryCode, // sent once on creation so user can note it down
        createdAt: userRecord.createdAt,
      },
    });
  } catch (error) {
    console.error('Create anonymous user error:', error);
    return NextResponse.json({ error: 'Failed to create anonymous account' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { token, nickname } = await request.json();
    if (!token || !nickname) {
      return NextResponse.json({ error: 'Token and nickname required' }, { status: 400 });
    }

    const trimmed = String(nickname).trim();
    if (trimmed.length < 2 || trimmed.length > 20) {
      return NextResponse.json({ error: 'Nickname must be between 2 and 20 characters' }, { status: 400 });
    }

    const users = getStoredUsers();
    const userEntry = Object.values(users).find((u: any) => u.token === token);

    if (!userEntry) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    userEntry.nickname = trimmed;
    userEntry.updatedAt = new Date().toISOString();
    users[userEntry.id] = userEntry;
    saveStoredUsers(users);

    return NextResponse.json({ success: true, nickname: trimmed });
  } catch (error) {
    console.error('Update nickname error:', error);
    return NextResponse.json({ error: 'Failed to update nickname' }, { status: 500 });
  }
}
