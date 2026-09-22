import { NextResponse } from 'next/server';
import { getAllAvailableChainsAsync, saveCustomChainAsync } from '@/lib/db';

export async function GET() {
  try {
    const chains = await getAllAvailableChainsAsync();
    return NextResponse.json({
      success: true,
      chains,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch chains' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { success: false, error: 'Chain name is required' },
        { status: 400 }
      );
    }

    const saved = await saveCustomChainAsync({
      name: body.name.trim(),
      network: body.network || 'CUSTOM',
      logoUrl: body.logoUrl,
      walletAddressLabel: body.walletAddressLabel,
      walletAddressPlaceholder: body.walletAddressPlaceholder,
    });

    return NextResponse.json({
      success: true,
      chain: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save chain' },
      { status: 500 }
    );
  }
}
