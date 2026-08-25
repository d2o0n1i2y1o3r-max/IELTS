import { NextResponse } from 'next/server';
import { getListeningPassagesData } from '@/lib/db';

export async function GET() {
  const passages = getListeningPassagesData();
  return NextResponse.json({ passages });
}
