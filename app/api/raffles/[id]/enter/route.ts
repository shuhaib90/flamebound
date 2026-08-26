import { NextResponse } from 'next/server';
import { getRaffleByIdAsync, createEntryAsync, getEntryByWalletAsync } from '@/lib/db';
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

    // 2. Prevent duplicate entries on database
    const existing = await getEntryByWalletAsync(id, walletAddress);
    if (existing) {
      return NextResponse.json({
        success: true,
        isExisting: true,
        message: 'Your wallet has already entered this raffle.',
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

    // 4. DYNAMIC ELIGIBILITY CHECK (MINTERS ONLY / HOLDERS ONLY / PUBLIC)
    const eligibility = raffle.eligibility || 'minters_only';
    let verification: any = {
      isHolder: true,
      walletAddress,
      contractAddress: raffle.contractAddress,
      network: raffle.customNetwork || raffle.network,
      tokenBalance: 0,
      verifiedOnChain: false,
      message: '✓ Public Whitelist Entry Approved'
    };

    if (eligibility !== 'public') {
      verification = await verifyFlameboundHolder(
        walletAddress,
        raffle.contractAddress,
        raffle.network
      );

      if (!verification.isHolder) {
        const roleName = eligibility === 'minters_only' ? 'Flamebound minter' : 'Flamebound NFT holder';
        return NextResponse.json({
          success: false,
          error: 'ELIGIBILITY_CHECK_FAILED',
          message: `Your wallet is not a verified ${roleName}. You cannot enter this ${roleName}-only whitelist.`,
          verification
        }, { status: 403 });
      }
    }

    // 5. Create and persist verified entry into Supabase + Local
    const entry = await createEntryAsync({
      raffleId: id,
      walletAddress: verification.walletAddress,
      twitterUsername: body.twitterUsername || '',
      taskStatus: taskStatus || {},
      isHolder: verification.isHolder,
      tokenBalance: verification.tokenBalance || 1,
      status: 'confirmed',
      contractAddress: raffle.contractAddress,
      network: raffle.customNetwork || raffle.network,
      metadata: {
        eligibility,
        entryMethod: raffle.entryMethod || 'raffle',
        isFcfsWinner: isFcfs,
      }
    });

    return NextResponse.json({
      success: true,
      message: isFcfs 
        ? '★ CONGRATULATIONS! Your FCFS Whitelist Spot has been instantly confirmed! ★' 
        : 'Raffle entry successfully verified and confirmed.',
      entry,
      verification,
      isFcfsWinner: isFcfs,
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
