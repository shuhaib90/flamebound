import { NextResponse } from 'next/server';
import { getRaffleByIdAsync, updateRaffleAsync } from '@/lib/db';
import { Winner } from '@/lib/types';
import { sendTelegramWinnersNotification } from '@/lib/telegram';

function formatAddress(address: string): string {
  if (!address) return '';
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const raffle = await getRaffleByIdAsync(id);
    if (!raffle) {
      return NextResponse.json({ success: false, error: 'Raffle not found' }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      winners: raffle.winners || [],
      status: raffle.status,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { winners = [], notifyTelegram = true } = body;

    const raffle = await getRaffleByIdAsync(id);
    if (!raffle) {
      return NextResponse.json({ success: false, error: 'Raffle not found' }, { status: 404 });
    }

    if (!Array.isArray(winners)) {
      return NextResponse.json({ success: false, error: 'Winners must be an array of objects or strings' }, { status: 400 });
    }

    // Format & clean each winner item
    const formattedWinners: Winner[] = winners.map((item: any, index: number) => {
      let wallet = '';
      let twitter = '';
      let telegram = '';

      if (typeof item === 'string') {
        wallet = item.trim();
      } else if (item && typeof item === 'object') {
        wallet = (item.wallet || item.walletAddress || item.address || '').trim();
        twitter = (item.twitter || item.twitterUsername || item.handle || item.xUsername || '').trim();
        telegram = (item.telegram || item.telegramUsername || item.tgUsername || item.tg || '').trim();
      }

      // Format short wallet
      const short = formatAddress(wallet);
      const cleanTwitter = twitter ? (twitter.startsWith('@') ? twitter : `@${twitter}`) : '';
      const cleanTelegram = telegram ? (telegram.startsWith('@') ? telegram : `@${telegram}`) : '';

      return {
        rank: index + 1,
        wallet,
        shortWallet: short,
        entryNumber: `WIN-${String(index + 1).padStart(2, '0')}`,
        twitterUsername: cleanTwitter,
        telegramUsername: cleanTelegram,
        drawnAt: new Date().toISOString(),
      };
    }).filter(w => Boolean(w.wallet));

    // Update raffle in database
    const updatedRaffle = await updateRaffleAsync(id, {
      winners: formattedWinners,
      status: 'winners_drawn',
    });

    if (!updatedRaffle) {
      return NextResponse.json({ success: false, error: 'Failed to update raffle with winners' }, { status: 500 });
    }

    // Optional Telegram notification
    let telegramResult = null;
    if (notifyTelegram && formattedWinners.length > 0) {
      try {
        telegramResult = await sendTelegramWinnersNotification(updatedRaffle);
      } catch (tgErr: any) {
        console.error('Failed to send Telegram winners notification:', tgErr);
        telegramResult = { success: false, error: tgErr.message };
      }
    }

    return NextResponse.json({
      success: true,
      raffle: updatedRaffle,
      winners: formattedWinners,
      telegram: telegramResult,
      message: `Successfully published ${formattedWinners.length} winner(s)!`
    });
  } catch (err: any) {
    console.error('Error saving winners:', err);
    return NextResponse.json({ success: false, error: err.message || 'Internal server error' }, { status: 500 });
  }
}
