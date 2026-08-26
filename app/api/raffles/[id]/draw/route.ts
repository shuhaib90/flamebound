import { NextResponse } from 'next/server';
import { drawRaffleWinnersAsync, getRaffleByIdAsync } from '@/lib/db';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { winnerCount } = body;

    const raffle = await getRaffleByIdAsync(id);
    if (!raffle) {
      return NextResponse.json({ success: false, error: 'Raffle not found' }, { status: 404 });
    }

    const result = await drawRaffleWinnersAsync(id, winnerCount ? Number(winnerCount) : undefined);

    return NextResponse.json({
      success: true,
      raffle: result.raffle,
      winners: result.winners,
      message: `Successfully selected ${result.winners.length} winner(s).`
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
