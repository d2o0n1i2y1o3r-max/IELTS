import { NextResponse } from 'next/server';
import { getLearnUnitsData } from '@/lib/db';

export async function GET() {
  try {
    const units = getLearnUnitsData();
    return NextResponse.json({ units });
  } catch (error) {
    console.error('Error fetching units:', error);
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 });
  }
}
