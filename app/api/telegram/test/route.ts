import { NextResponse } from 'next/server';
import { sendTelegramTestMessage } from '@/lib/telegram';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { chatId, token } = body;

    if (!chatId) {
      return NextResponse.json(
        { success: false, error: 'Target Chat ID or @channel is required' },
        { status: 400 }
      );
    }

    const result = await sendTelegramTestMessage(chatId, token);

    if (result.success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { success: false, error: result.error || 'Failed to send test message' },
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
