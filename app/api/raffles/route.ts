import { NextResponse } from 'next/server';
import { getRafflesAsync, createRaffleAsync } from '@/lib/db';

export async function GET() {
  try {
    const raffles = await getRafflesAsync();
    return NextResponse.json({ success: true, raffles });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newRaffle = await createRaffleAsync(body);
    return NextResponse.json({ success: true, raffle: newRaffle }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
