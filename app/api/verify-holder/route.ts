import { NextResponse } from 'next/server';
import { verifyFlameboundHolder } from '@/lib/blockchain';
import { getRaffleById } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { walletAddress, raffleId, contractAddress, network } = await req.json();

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        error: 'WALLET_ADDRESS_REQUIRED',
        message: 'Wallet address is required for on-chain verification.'
      }, { status: 400 });
    }

    let targetContract = contractAddress;
    let targetNetwork = network || 'ETHEREUM';

    if (raffleId) {
      const raffle = getRaffleById(raffleId);
      if (raffle) {
        targetContract = raffle.contractAddress;
        targetNetwork = raffle.network || targetNetwork;
      }
    }

    // Call blockchain verification engine
    const verification = await verifyFlameboundHolder(walletAddress, targetContract, targetNetwork);

    return NextResponse.json({
      success: true,
      verification,
    });
  } catch (error: any) {
    console.error('Holder verification error:', error);
    return NextResponse.json({
      success: false,
      error: error.message || 'SERVER_VERIFICATION_ERROR',
      message: 'Failed to verify holder status on-chain.'
    }, { status: 500 });
  }
}
