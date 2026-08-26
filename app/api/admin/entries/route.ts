import { NextResponse } from 'next/server';
import { getEntriesAsync, deleteEntry, getAdminStatsAsync } from '@/lib/db';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const raffleId = searchParams.get('raffleId') || undefined;
    const entries = await getEntriesAsync(raffleId);
    const stats = await getAdminStatsAsync();

    return NextResponse.json({ success: true, entries, stats });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Entry ID is required' }, { status: 400 });
    }
    const deleted = deleteEntry(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
