import { NextResponse } from 'next/server';
import { getReadingPassagesData } from '@/lib/db';

export async function GET() {
  const passages = getReadingPassagesData();
  return NextResponse.json({ passages });
}
