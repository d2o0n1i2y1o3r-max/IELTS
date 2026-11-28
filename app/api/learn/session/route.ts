import { NextResponse } from 'next/server';
import { saveLearnSession, getUserLearnProgress, updateUserLearnProgress } from '@/lib/db';
import { LearnSession, LearnProgress } from '@/lib/types';

const XP_PER_CORRECT = 5;
const XP_PERFECT_BONUS = 10;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, lessonId, exercisesCompleted, correctCount, totalExercises, duration } = body;

    if (!userId || !lessonId) {
      return NextResponse.json({ error: 'userId and lessonId are required' }, { status: 400 });
    }

    // Compute XP server-side
    const xpEarned = correctCount * XP_PER_CORRECT;
    const isPerfect = correctCount === totalExercises;
    const totalXp = isPerfect ? xpEarned + XP_PERFECT_BONUS : xpEarned;

    // Calculate stars (1-3 based on accuracy)
    const accuracy = correctCount / totalExercises;
    let stars = 1;
    if (accuracy >= 0.8) stars = 2;
    if (accuracy >= 0.95) stars = 3;

    // Save session
    const session: LearnSession = {
      id: `learn-session-${Date.now()}`,
      userId,
      lessonId,
      exercisesCompleted,
      correctCount,
      totalExercises,
      xpEarned: totalXp,
      duration,
      completedAt: new Date().toISOString(),
    };

    saveLearnSession(session);

    // Update user progress
    const currentProgress = getUserLearnProgress(userId);

    // Update completed lessons
    const completedLessons = currentProgress?.completedLessons || {};
    completedLessons[lessonId] = {
      stars,
      completedAt: new Date().toISOString(),
    };

    const updatedProgress = updateUserLearnProgress(userId, {
      completedLessons,
      xp: (currentProgress?.xp || 0) + totalXp,
      lastActiveDate: new Date().toISOString(),
    });

    return NextResponse.json({
      session,
      progress: updatedProgress,
      stars,
      isPerfect,
      accuracy,
    });
  } catch (error) {
    console.error('Error saving learn session:', error);
    return NextResponse.json({ error: 'Failed to save session' }, { status: 500 });
  }
}
