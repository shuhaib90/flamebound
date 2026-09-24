import { NextResponse } from 'next/server';
import { getRaffleByIdAsync } from '@/lib/db';
import { sendTelegramRaffleNotification } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { raffleId, chatId, token } = body;

    if (!raffleId) {
      return NextResponse.json(
        { success: false, error: 'raffleId is required' },
        { status: 400 }
      );
    }

    const raffle = await getRaffleByIdAsync(raffleId);
    if (!raffle) {
      return NextResponse.json(
        { success: false, error: 'Raffle not found' },
        { status: 404 }
      );
    }

    const result = await sendTelegramRaffleNotification(raffle, chatId, token);

    if (result.success) {
      return NextResponse.json({ success: true, messageId: result.messageId });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send notification' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
