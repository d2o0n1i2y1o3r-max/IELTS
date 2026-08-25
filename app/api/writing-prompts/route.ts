import { NextResponse } from 'next/server';
import { getWritingPromptsData } from '@/lib/db';

export async function GET() {
  const prompts = getWritingPromptsData();
  return NextResponse.json({ prompts });
}
