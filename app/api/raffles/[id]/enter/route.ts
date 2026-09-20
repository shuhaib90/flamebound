import { NextResponse } from 'next/server';
import { getRaffleByIdAsync, createEntryAsync, getEntryByWalletAsync } from '@/lib/db';
import { isValidEvmAddress } from '@/lib/blockchain';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { walletAddress, twitterUsername, taskStatus } = body;

    const cleanWallet = (walletAddress || '').trim().toLowerCase();
    const cleanTwitter = (twitterUsername || '').trim().replace(/^@/, '');

    if (!cleanWallet) {
      return NextResponse.json({
        success: false,
        error: 'WALLET_REQUIRED',
        message: 'Please enter a valid EVM wallet address to receive your whitelist spot.'
      }, { status: 400 });
    }

    if (!cleanTwitter) {
      return NextResponse.json({
        success: false,
        error: 'TWITTER_REQUIRED',
        message: 'Please enter your X / Twitter handle to participate.'
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
    const existing = await getEntryByWalletAsync(id, cleanWallet);
    if (existing) {
      return NextResponse.json({
        success: true,
        isExisting: true,
        message: 'This wallet has already entered this raffle.',
        entry: existing
      }, { status: 200 });
    }

    // 3. FCFS Spot Limit Enforcement
    const isFcfs = raffle.entryMethod === 'fcfs';
    if (isFcfs && (raffle.totalEntries || 0) >= raffle.supply) {
      return NextResponse.json({
        success: false,
        error: 'FCFS_FILLED',
        message: `All ${raffle.supply} FCFS whitelist spots have already been claimed!`
      }, { status: 400 });
    }

    // 4. Create and persist open verified entry
    const entry = await createEntryAsync({
      raffleId: id,
      walletAddress: cleanWallet,
      twitterUsername: cleanTwitter,
      taskStatus: taskStatus || {},
      network: raffle.customNetwork || raffle.network,
    });

    return NextResponse.json({
      success: true,
      message: isFcfs 
        ? '★ CONGRATULATIONS! Your FCFS Whitelist Spot has been instantly confirmed! ★' 
        : 'Raffle entry successfully submitted and confirmed!',
      entry
    }, { status: 201 });

  } catch (error) {
    console.error('API /raffles/[id]/enter error:', error);
    return NextResponse.json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to submit raffle entry. Please try again.'
    }, { status: 500 });
  }
}
