import { NextResponse } from 'next/server';
import { getRaffleByIdAsync, updateRaffleAsync, deleteRaffleAsync, getEntryByWallet } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const raffle = await getRaffleByIdAsync(id);
    if (!raffle) {
      return NextResponse.json({ success: false, error: 'Raffle not found' }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const wallet = searchParams.get('wallet');
    let userEntry = null;
    if (wallet) {
      userEntry = getEntryByWallet(id, wallet) || null;
    }

    return NextResponse.json({ success: true, raffle, userEntry });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const updated = await updateRaffleAsync(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Raffle not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, raffle: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const deleted = await deleteRaffleAsync(id);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
