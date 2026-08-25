import { NextResponse } from 'next/server';
import { getQuestionsData } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const part = searchParams.get('part');
  const topic = searchParams.get('topic');

  let questions = getQuestionsData();

  if (part && part !== 'all') {
    questions = questions.filter(q => q.part === part);
  }

  if (topic && topic !== 'All Topics') {
    questions = questions.filter(q => q.topic === topic);
  }

  return NextResponse.json({ questions });
}
