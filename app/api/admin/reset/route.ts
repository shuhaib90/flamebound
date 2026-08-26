import { NextResponse } from 'next/server';
import { resetDatabaseAsync } from '@/lib/db';

export async function POST() {
  try {
    await resetDatabaseAsync();
    return NextResponse.json({ success: true, message: 'Database reset to default seed state in Supabase.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
