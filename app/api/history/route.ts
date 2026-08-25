import { NextResponse } from 'next/server';
import { getHistoryData, saveSessionToHistory, deleteSessionFromHistory } from '@/lib/db';
import { SpeakingSession } from '@/lib/types';

export async function GET() {
  const history = getHistoryData();
  return NextResponse.json({ history });
}

export async function POST(request: Request) {
  try {
    const session: SpeakingSession = await request.json();
    if (!session || !session.questionId) {
      return NextResponse.json({ error: 'Invalid session data' }, { status: 400 });
    }
    const updated = saveSessionToHistory(session);
    return NextResponse.json({ history: updated });
  } catch (error) {
    console.error('Error saving session:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    const updated = deleteSessionFromHistory(id);
    return NextResponse.json({ history: updated });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
  }
}
