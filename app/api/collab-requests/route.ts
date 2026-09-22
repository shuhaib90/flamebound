import { NextResponse } from 'next/server';
import { getCollabRequestsAsync, createCollabRequestAsync } from '@/lib/db';

export async function GET() {
  try {
    const collabRequests = await getCollabRequestsAsync();
    return NextResponse.json({ success: true, collabRequests });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Required validation
    if (!body.project?.trim()) {
      return NextResponse.json({ success: false, error: 'Project name is required' }, { status: 400 });
    }
    if (!body.title?.trim()) {
      return NextResponse.json({ success: false, error: 'Raffle title is required' }, { status: 400 });
    }
    if (!body.requesterTwitter?.trim()) {
      return NextResponse.json({ success: false, error: 'Requester X (Twitter) handle is required' }, { status: 400 });
    }
    if (!body.requesterTelegram?.trim()) {
      return NextResponse.json({ success: false, error: 'Requester Telegram contact is required' }, { status: 400 });
    }

    const newCollab = await createCollabRequestAsync({
      project: body.project.trim(),
      title: body.title.trim(),
      slug: body.slug?.trim() || body.project.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      supply: parseInt(body.supply) || 50,
      mintStage: body.mintStage || 'GTD',
      network: body.network || 'ETHEREUM',
      customNetwork: body.customNetwork || '',
      customNetworkLogoUrl: body.customNetworkLogoUrl || '',
      walletAddressLabel: body.walletAddressLabel || 'Receiving EVM Wallet Address',
      walletAddressPlaceholder: body.walletAddressPlaceholder || '0x... (Whitelist receiver)',
      subtitle: body.subtitle || '',
      description: body.description || '',
      nftTotalSupply: body.nftTotalSupply || '1,000 NFTs',
      mintPrice: body.mintPrice || 'FREE MINT',
      mintDate: body.mintDate || 'TBA',
      maxMintPerWallet: body.maxMintPerWallet || '1 PER WL',
      logoUrl: body.logoUrl || '/images/dotset-logo.png',
      bannerUrl: body.bannerUrl || '/images/dotset-logo.png',
      artworkType: body.artworkType || 'genesis',
      followUrl: body.followUrl || '',
      engageUrl: body.engageUrl || '',
      twitterUrl: body.twitterUrl || '',
      discordUrl: body.discordUrl || '',
      mintUrl: body.mintUrl || '',
      notes: body.notes || '',
      customTasks: body.customTasks || [],
      requesterTwitter: body.requesterTwitter.trim(),
      requesterTelegram: body.requesterTelegram.trim(),
      requesterEmail: body.requesterEmail?.trim() || '',
      requesterDiscord: body.requesterDiscord?.trim() || '',
    });

    return NextResponse.json({ success: true, collabRequest: newCollab }, { status: 201 });
  } catch (error: any) {
    console.error('API create collab request error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit request' }, { status: 400 });
  }
}
