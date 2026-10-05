import { NextResponse } from 'next/server';
import { syncRaffleEntryCountAsync } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { raffleId } = body;
    if (!raffleId) {
      return NextResponse.json({ success: false, error: 'Raffle ID is required' }, { status: 400 });
    }

    const realCount = await syncRaffleEntryCountAsync(raffleId);
    return NextResponse.json({ success: true, count: realCount });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to sync' }, { status: 500 });
  }
}
