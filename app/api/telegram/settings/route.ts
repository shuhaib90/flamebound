import { NextResponse } from 'next/server';
import { getTelegramConfig, updateTelegramConfig } from '@/lib/telegram';

export async function GET() {
  const config = getTelegramConfig();
  // Mask token for safe viewing
  const maskedToken = config.botToken 
    ? `${config.botToken.slice(0, 8)}...${config.botToken.slice(-6)}`
    : '';

  return NextResponse.json({
    success: true,
    config: {
      ...config,
      maskedToken,
      botUsername: 'DOTSETRAFFLESbot',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = updateTelegramConfig({
      chatId: body.chatId !== undefined ? body.chatId.trim() : undefined,
      botToken: body.botToken !== undefined && body.botToken.trim() ? body.botToken.trim() : undefined,
      autoNotify: body.autoNotify !== undefined ? !!body.autoNotify : undefined,
    });

    return NextResponse.json({
      success: true,
      config: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error' },
      { status: 500 }
    );
  }
}
