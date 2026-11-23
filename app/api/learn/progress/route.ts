import { NextResponse } from 'next/server';
import { getUserLearnProgress, updateUserLearnProgress } from '@/lib/db';
import { LearnProgress } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const progress = getUserLearnProgress(userId);

    if (!progress) {
      // Return default progress structure for new users
      return NextResponse.json({
        userId,
        completedLessons: {},
        xp: 0,
        lastActiveDate: new Date().toISOString(),
      });
    }

    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching learn progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, updates } = body;

    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 });
    }

    const updatedProgress = updateUserLearnProgress(userId, updates);

    return NextResponse.json(updatedProgress);
  } catch (error) {
    console.error('Error updating learn progress:', error);
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 });
  }
}
