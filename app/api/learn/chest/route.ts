import { NextResponse } from 'next/server';
import { getUserLearnProgress, updateUserLearnProgress } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, chestId, xpReward, rarity } = body;

    if (!userId || !xpReward) {
      return NextResponse.json({ error: 'userId and xpReward are required' }, { status: 400 });
    }

    const currentProgress = getUserLearnProgress(userId);
    const completedLessons = currentProgress?.completedLessons || {};

    // Mark this chest as opened in progress if chestId provided
    if (chestId) {
      completedLessons[`chest-${chestId}`] = {
        stars: 3,
        completedAt: new Date().toISOString(),
      };
    }

    const newXp = (currentProgress?.xp || 0) + Number(xpReward);

    const updatedProgress = updateUserLearnProgress(userId, {
      completedLessons,
      xp: newXp,
      lastActiveDate: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      reward: {
        chestId,
        xpReward,
        rarity,
      },
      progress: updatedProgress,
    });
  } catch (error) {
    console.error('Error opening chest:', error);
    return NextResponse.json({ error: 'Failed to claim chest reward' }, { status: 500 });
  }
}
