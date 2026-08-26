import { NextResponse } from 'next/server';
import { getRaffleByIdAsync, createEntryAsync, getEntryByWallet } from '@/lib/db';
import { verifyFlameboundHolder } from '@/lib/blockchain';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { walletAddress, taskStatus } = body;

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'WALLET_REQUIRED',
        message: 'A valid wallet address is required.'
      }, { status: 400 });
    }

    // 1. Verify raffle exists and is active
    const raffle = await getRaffleByIdAsync(id);
    if (!raffle) {
      return NextResponse.json({ success: false, error: 'Raffle not found' }, { status: 404 });
    }

    if (raffle.status !== 'live' && raffle.status !== 'ending_soon') {
      return NextResponse.json({
        success: false,
        error: 'RAFFLE_CLOSED',
        message: 'This raffle is currently closed and not accepting new entries.'
      }, { status: 400 });
    }

    // 2. Prevent duplicate entries
    const existing = getEntryByWallet(id, walletAddress);
    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'Your wallet has already entered this raffle.',
        entry: existing
      }, { status: 409 });
    }

    // 3. SERVER-SIDE STRICT ON-CHAIN HOLDER VERIFICATION
    const verification = await verifyFlameboundHolder(
      walletAddress,
      raffle.contractAddress,
      raffle.network
    );

    if (!verification.isHolder) {
      return NextResponse.json({
        success: false,
        error: 'HOLDER_CHECK_FAILED',
        message: 'Your wallet does not currently hold a Flamebound NFT. You cannot complete this holder-only raffle.',
        verification
      }, { status: 403 });
    }

    // 4. Create and persist verified entry into Supabase + Local
    const entry = await createEntryAsync({
      raffleId: id,
      walletAddress: verification.walletAddress,
      twitterUsername: body.twitterUsername || '',
      taskStatus: taskStatus || {},
      isHolder: true,
      tokenBalance: verification.tokenBalance,
      status: 'confirmed',
      contractAddress: raffle.contractAddress,
      network: raffle.customNetwork || raffle.network,
      metadata: {
        holderVerifiedVia: 'on-chain-smart-contract',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Raffle entry successfully verified and confirmed.',
      entry,
      verification,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Enter raffle error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'INTERNAL_ERROR',
      message: error.message
    }, { status: 500 });
  }
}
