import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const USERS_FILE = path.join(process.cwd(), 'data', 'anonymous-users.json');

function hashRecoveryCode(code: string): string {
  return crypto.createHash('sha256').update(code.trim().toLowerCase()).digest('hex');
}

export async function POST(request: Request) {
  try {
    const { recoveryCode } = await request.json();

    if (!recoveryCode || typeof recoveryCode !== 'string') {
      return NextResponse.json({ error: 'Recovery code is required' }, { status: 400 });
    }

    const hashed = hashRecoveryCode(recoveryCode);

    if (!fs.existsSync(USERS_FILE)) {
      return NextResponse.json({ error: 'No accounts registered yet' }, { status: 404 });
    }

    const content = fs.readFileSync(USERS_FILE, 'utf-8');
    const users: Record<string, any> = JSON.parse(content || '{}');

    const matchedUser = Object.values(users).find(
      (u: any) => u.recoveryCodeHash === hashed
    );

    if (!matchedUser) {
      return NextResponse.json(
        { error: 'Recovery code not found. Please check spelling and hyphenation (e.g. word-word-word-word).' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        userId: matchedUser.id,
        token: matchedUser.token,
        nickname: matchedUser.nickname,
        createdAt: matchedUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Restore anonymous user error:', error);
    return NextResponse.json({ error: 'Failed to restore account' }, { status: 500 });
  }
}
