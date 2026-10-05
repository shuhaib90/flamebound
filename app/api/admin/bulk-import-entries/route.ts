import { NextResponse } from 'next/server';
import { bulkImportEntriesAsync } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { raffleId, entries, rawText } = body;

    if (!raffleId) {
      return NextResponse.json({ success: false, error: 'Raffle ID is required' }, { status: 400 });
    }

    let parsedEntries: Array<{ walletAddress: string; twitterUsername?: string; telegramUsername?: string }> = [];

    if (Array.isArray(entries) && entries.length > 0) {
      parsedEntries = entries;
    } else if (typeof rawText === 'string') {
      const lines = rawText.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;
        // Split by comma, tab, or space
        const parts = trimmed.split(/[\t,]+/).map(p => p.trim().replace(/^["']|["']$/g, ''));
        if (parts.length > 0 && parts[0]) {
          const wallet = parts[0];
          const twitter = parts[1] || '';
          const telegram = parts[2] || '';
          parsedEntries.push({
            walletAddress: wallet,
            twitterUsername: twitter,
            telegramUsername: telegram,
          });
        }
      }
    }

    if (parsedEntries.length === 0) {
      return NextResponse.json({ success: false, error: 'No valid entries provided to import' }, { status: 400 });
    }

    const result = await bulkImportEntriesAsync(raffleId, parsedEntries);
    return NextResponse.json({
      success: true,
      added: result.added,
      skipped: result.skipped,
      total: result.total,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to bulk import' }, { status: 500 });
  }
}
