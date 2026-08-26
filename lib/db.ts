import fs from 'fs';
import path from 'path';
import { Raffle, RaffleEntry, Winner, AdminStats } from './types';
import { formatAddress, FLAMEBOUND_PRIMARY_CONTRACT } from './blockchain';
import { supabase } from './supabase';

const DB_FILE = path.join(process.cwd(), 'data', 'flamebound_db.json');

interface DatabaseSchema {
  raffles: Raffle[];
  entries: RaffleEntry[];
}

const DEFAULT_RAFFLES: Raffle[] = [
  {
    id: 'raffle-fb-genesis-01',
    title: 'FLAMEBOUND GENESIS WL',
    project: 'FLAMEBOUND',
    type: 'WL RAFFLE',
    subtitle: 'Win a guaranteed Flamebound Genesis whitelist spot.',
    description: 'The premier whitelist raffle for the inaugural Flamebound Genesis NFT collection. Verified Flamebound holders get guaranteed Phase 1 mint allocation.',
    status: 'live',
    supply: 50,
    nftTotalSupply: '1,000 NFTs',
    mintPrice: '0.0001 ETH',
    mintDate: '15 SEP 2026 — 18:00 UTC',
    maxMintPerWallet: '1 PER WL',
    totalEntries: 142,
    startDate: '2026-08-01T00:00:00.000Z',
    endDate: '2026-08-28T23:59:00.000Z',
    network: 'ETHEREUM',
    contractAddress: FLAMEBOUND_PRIMARY_CONTRACT,
    requiredTokenCount: 1,
    artworkType: 'genesis',
    logoUrl: '/images/flamebound-logo.png',
    bannerUrl: '/images/flamebound-logo.png',
    followUrl: 'https://x.com/FlameboundNft',
    engageUrl: 'https://x.com/FlameboundNft',
    twitterUrl: 'https://x.com/FlameboundNft',
    discordUrl: 'https://discord.com',
    mintUrl: 'https://opensea.io/collection/flamebound-259045050',
    notes: 'Guaranteed Phase 1 Mint for Whitelist Winners',
    tasks: [
      {
        id: 'task-follow-partner',
        title: 'FOLLOW FLAMEBOUND',
        description: 'Follow on X',
        type: 'follow',
        buttonLabel: 'FOLLOW',
        targetUrl: 'https://x.com/FlameboundNft',
        required: true,
      },
      {
        id: 'task-follow-fb',
        title: 'FOLLOW FLAMEBOUND',
        description: 'Follow @FlameboundNft on X',
        type: 'follow',
        buttonLabel: 'FOLLOW',
        targetUrl: 'https://x.com/FlameboundNft',
        required: true,
      },
      {
        id: 'task-engage',
        title: 'ENGAGE WITH POST',
        description: 'Engage with announcement tweet',
        type: 'engage',
        buttonLabel: 'VIEW POST',
        required: true,
      },
      {
        id: 'task-wallet',
        title: 'CONNECT WALLET',
        description: 'Connect EVM wallet via RainbowKit',
        type: 'wallet',
        buttonLabel: 'CONNECT',
        required: true,
      },
      {
        id: 'task-holder',
        title: 'HOLDER CHECK',
        description: 'Verify active holding on Flamebound Contract',
        type: 'holder_check',
        buttonLabel: 'VERIFY',
        required: true,
      },
    ],
    createdAt: '2026-08-01T00:00:00.000Z',
  },
  {
    id: 'raffle-fb-beasts-02',
    title: 'CYBER-BEASTS ALLOCATION #1',
    project: 'CYBER-BEASTS',
    type: 'PARTNER WL',
    subtitle: 'Exclusive partner allocation for verified Flamebound holders.',
    description: 'Partner whitelist allocation with Cyber-Beasts. 25 guaranteed spots reserved for Flamebound holders.',
    status: 'live',
    supply: 25,
    nftTotalSupply: '2,500 NFTs',
    mintPrice: 'FREE MINT',
    mintDate: '22 SEP 2026 — 20:00 UTC',
    maxMintPerWallet: '2 PER WL',
    totalEntries: 68,
    startDate: '2026-08-10T00:00:00.000Z',
    endDate: '2026-08-30T18:00:00.000Z',
    network: 'BASE',
    contractAddress: FLAMEBOUND_PRIMARY_CONTRACT,
    requiredTokenCount: 1,
    artworkType: 'cyber_beast',
    logoUrl: '/images/flamebound-logo.png',
    bannerUrl: '/images/flamebound-logo.png',
    followUrl: 'https://x.com/FlameboundNft',
    engageUrl: 'https://x.com/FlameboundNft',
    twitterUrl: 'https://x.com/FlameboundNft',
    discordUrl: 'https://discord.com',
    mintUrl: 'https://opensea.io/collection/flamebound-259045050',
    notes: 'Free companion mint for Genesis holders on Base L2 network.',
    tasks: [],
    createdAt: '2026-08-10T00:00:00.000Z',
  },
  {
    id: 'raffle-fb-relic-03',
    title: 'FOUNDERS PASS WL #0',
    project: 'FOUNDERS PASS',
    type: 'VIP MINT',
    subtitle: 'Guaranteed allocation for early-access founders pass',
    description: 'Founders Pass raffle for the premier tier community members.',
    status: 'winners_drawn',
    supply: 10,
    nftTotalSupply: '100 PASSES',
    mintPrice: '0.05 ETH',
    mintDate: '20 JUL 2026',
    maxMintPerWallet: '1 PER WL',
    totalEntries: 215,
    startDate: '2026-07-01T00:00:00.000Z',
    endDate: '2026-07-21T00:00:00.000Z',
    network: 'ETHEREUM',
    contractAddress: FLAMEBOUND_PRIMARY_CONTRACT,
    requiredTokenCount: 1,
    artworkType: 'founders_pass',
    logoUrl: '/images/flamebound-logo.png',
    bannerUrl: '/images/flamebound-logo.png',
    followUrl: 'https://x.com/FlameboundNft',
    engageUrl: 'https://x.com/FlameboundNft',
    twitterUrl: 'https://x.com/FlameboundNft',
    discordUrl: 'https://discord.com',
    mintUrl: 'https://opensea.io/collection/flamebound-259045050',
    notes: 'VIP Founders allocation • Concluded',
    winners: [
      {
        wallet: '0x8B7a0A0CA2B05319d27E70Df91D106bfe8fF05fb',
        shortWallet: '0x8B7a...05fb',
        entryNumber: 'FB-771829',
        rank: 1,
        drawnAt: '2026-07-21T00:05:00.000Z',
        txUrl: 'https://etherscan.io/tx/0x9a8f...',
      },
      {
        wallet: '0x71C841029c71dC6F6F6d625D8F0B8d35687796d1',
        shortWallet: '0x71C8...96d1',
        entryNumber: 'FB-104928',
        rank: 2,
        drawnAt: '2026-07-21T00:05:00.000Z',
        txUrl: 'https://etherscan.io/tx/0x3d2c...',
      },
    ],
    createdAt: '2026-07-01T00:00:00.000Z',
  },
];

const DEFAULT_ENTRIES: RaffleEntry[] = [
  {
    id: 'FB-771829',
    raffleId: 'raffle-fb-genesis-01',
    walletAddress: '0x8B7a0A0CA2B05319d27E70Df91D106bfe8fF05fb',
    shortAddress: '0x8B7a...05fb',
    twitterUsername: 'flame_admin',
    taskStatus: {
      followFlamebound: true,
      followPartner: true,
      engage: true,
      wallet: true,
      holderCheck: true,
    },
    isHolder: true,
    tokenBalance: 3,
    contractAddress: FLAMEBOUND_PRIMARY_CONTRACT,
    network: 'ETHEREUM',
    verifiedAt: '2026-08-15T14:32:00.000Z',
    status: 'confirmed',
  },
];

// Helper to map DB row to Raffle type
function mapDbRowToRaffle(row: any): Raffle {
  return {
    id: row.id,
    title: row.title,
    project: row.project || 'FLAMEBOUND',
    type: row.type || 'WL RAFFLE',
    subtitle: row.subtitle || '',
    description: row.description || '',
    status: row.status || 'live',
    supply: row.supply || 50,
    nftTotalSupply: row.nft_total_supply || '1,000 NFTs',
    mintPrice: row.mint_price || 'FREE',
    mintDate: row.mint_date || 'TBA',
    maxMintPerWallet: row.max_mint_per_wallet || '1 PER WL',
    totalEntries: row.total_entries || 0,
    startDate: row.start_date,
    endDate: row.end_date,
    network: row.network || 'ROBINHOOD NETWORK',
    customNetwork: row.custom_network,
    contractAddress: row.contract_address || FLAMEBOUND_PRIMARY_CONTRACT,
    requiredTokenCount: row.required_token_count || 1,
    artworkType: row.artwork_type || 'genesis',
    logoUrl: row.logo_url || '/images/flamebound-logo.png',
    bannerUrl: row.banner_url || '/images/flamebound-logo.png',
    followUrl: row.follow_url || 'https://x.com/FlameboundNft',
    engageUrl: row.engage_url || 'https://x.com/FlameboundNft',
    twitterUrl: row.twitter_url || 'https://x.com/FlameboundNft',
    discordUrl: row.discord_url || 'https://discord.com',
    mintUrl: row.mint_url || 'https://opensea.io/collection/flamebound-259045050',
    notes: row.notes || '',
    winners: Array.isArray(row.winners) ? row.winners : [],
    createdAt: row.created_at || new Date().toISOString(),
  };
}

// Local File Sync Helper (Graceful Fallback)
function ensureDb(): DatabaseSchema {
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initialData: DatabaseSchema = {
        raffles: DEFAULT_RAFFLES,
        entries: DEFAULT_ENTRIES,
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
      return initialData;
    }
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return {
      raffles: DEFAULT_RAFFLES,
      entries: DEFAULT_ENTRIES,
    };
  }
}

function writeDb(data: DatabaseSchema): void {
  try {
    const dataDir = path.dirname(DB_FILE);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to write local database file:', error);
  }
}

// ============================================================================
// ASYNC SUPABASE DATA ACCESS (WITH LOCAL FALLBACK)
// ============================================================================

export async function getRafflesAsync(): Promise<Raffle[]> {
  try {
    const { data, error } = await supabase
      .from('flamebound_raffles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return getRaffles();
    }
    return data.map(mapDbRowToRaffle);
  } catch (err) {
    return getRaffles();
  }
}

export function getRaffles(): Raffle[] {
  const db = ensureDb();
  return db.raffles;
}

export async function getRaffleByIdAsync(id: string): Promise<Raffle | null> {
  try {
    const { data, error } = await supabase
      .from('flamebound_raffles')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return getRaffleById(id) || null;
    }
    return mapDbRowToRaffle(data);
  } catch (err) {
    return getRaffleById(id) || null;
  }
}

export function getRaffleById(id: string): Raffle | undefined {
  const db = ensureDb();
  return db.raffles.find(r => r.id === id);
}

export async function createRaffleAsync(raffleData: Partial<Raffle>): Promise<Raffle> {
  const id = `raffle-${Date.now()}`;
  const row = {
    id,
    title: raffleData.title || 'Untitled Whitelist Raffle',
    project: raffleData.project || 'FLAMEBOUND',
    type: raffleData.type || 'WL RAFFLE',
    subtitle: raffleData.subtitle || '',
    description: raffleData.description || '',
    status: raffleData.status || 'live',
    supply: raffleData.supply || 50,
    nft_total_supply: raffleData.nftTotalSupply || '1,000 NFTs',
    mint_price: raffleData.mintPrice || 'FREE',
    mint_date: raffleData.mintDate || 'TBA',
    max_mint_per_wallet: raffleData.maxMintPerWallet || '1 PER WL',
    total_entries: 0,
    start_date: raffleData.startDate || new Date().toISOString(),
    end_date: raffleData.endDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    network: raffleData.network || 'ROBINHOOD NETWORK',
    custom_network: raffleData.customNetwork || null,
    contract_address: raffleData.contractAddress || FLAMEBOUND_PRIMARY_CONTRACT,
    required_token_count: raffleData.requiredTokenCount || 1,
    artwork_type: raffleData.artworkType || 'custom',
    banner_url: raffleData.bannerUrl || null,
    logo_url: raffleData.logoUrl || '/images/flamebound-logo.png',
    follow_url: raffleData.followUrl || 'https://x.com/FlameboundNft',
    engage_url: raffleData.engageUrl || 'https://x.com/FlameboundNft',
    twitter_url: raffleData.twitterUrl || 'https://x.com/FlameboundNft',
    discord_url: raffleData.discordUrl || 'https://discord.com',
    mint_url: raffleData.mintUrl || 'https://opensea.io/collection/flamebound-259045050',
    notes: raffleData.notes || '',
    winners: [],
  };

  try {
    await supabase.from('flamebound_raffles').insert(row);
  } catch (err) {
    console.error('Supabase create error:', err);
  }

  // Also sync local
  return createRaffle(raffleData);
}

export function createRaffle(raffleData: Partial<Raffle>): Raffle {
  const db = ensureDb();
  const id = `raffle-${Date.now()}`;
  const newRaffle: Raffle = {
    id,
    title: raffleData.title || 'Untitled Whitelist Raffle',
    project: raffleData.project || 'FLAMEBOUND',
    type: raffleData.type || 'WL RAFFLE',
    subtitle: raffleData.subtitle || '',
    description: raffleData.description || '',
    status: raffleData.status || 'live',
    supply: raffleData.supply || 50,
    nftTotalSupply: raffleData.nftTotalSupply || '1,000 NFTs',
    mintPrice: raffleData.mintPrice || 'FREE',
    mintDate: raffleData.mintDate || 'TBA',
    maxMintPerWallet: raffleData.maxMintPerWallet || '1 PER WL',
    totalEntries: 0,
    startDate: raffleData.startDate || new Date().toISOString(),
    endDate: raffleData.endDate || new Date(Date.now() + 7 * 86400000).toISOString(),
    network: raffleData.network || 'ROBINHOOD NETWORK',
    customNetwork: raffleData.customNetwork,
    contractAddress: raffleData.contractAddress || FLAMEBOUND_PRIMARY_CONTRACT,
    requiredTokenCount: raffleData.requiredTokenCount || 1,
    artworkType: raffleData.artworkType || 'custom',
    bannerUrl: raffleData.bannerUrl,
    logoUrl: raffleData.logoUrl || '/images/flamebound-logo.png',
    followUrl: raffleData.followUrl || 'https://x.com/FlameboundNft',
    engageUrl: raffleData.engageUrl || 'https://x.com/FlameboundNft',
    twitterUrl: raffleData.twitterUrl || 'https://x.com/FlameboundNft',
    discordUrl: raffleData.discordUrl || 'https://discord.com',
    mintUrl: raffleData.mintUrl || 'https://opensea.io/collection/flamebound-259045050',
    notes: raffleData.notes || '',
    tasks: raffleData.tasks || [],
    createdAt: new Date().toISOString(),
  };

  db.raffles.unshift(newRaffle);
  writeDb(db);
  return newRaffle;
}

export async function updateRaffleAsync(id: string, updates: Partial<Raffle>): Promise<Raffle | null> {
  const rowUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.title) rowUpdates.title = updates.title;
  if (updates.project) rowUpdates.project = updates.project;
  if (updates.type) rowUpdates.type = updates.type;
  if (updates.subtitle !== undefined) rowUpdates.subtitle = updates.subtitle;
  if (updates.description !== undefined) rowUpdates.description = updates.description;
  if (updates.status) rowUpdates.status = updates.status;
  if (updates.supply !== undefined) rowUpdates.supply = updates.supply;
  if (updates.nftTotalSupply !== undefined) rowUpdates.nft_total_supply = updates.nftTotalSupply;
  if (updates.mintPrice !== undefined) rowUpdates.mint_price = updates.mintPrice;
  if (updates.mintDate !== undefined) rowUpdates.mint_date = updates.mintDate;
  if (updates.maxMintPerWallet !== undefined) rowUpdates.max_mint_per_wallet = updates.maxMintPerWallet;
  if (updates.network) rowUpdates.network = updates.network;
  if (updates.customNetwork !== undefined) rowUpdates.custom_network = updates.customNetwork;
  if (updates.contractAddress) rowUpdates.contract_address = updates.contractAddress;
  if (updates.bannerUrl !== undefined) rowUpdates.banner_url = updates.bannerUrl;
  if (updates.logoUrl !== undefined) rowUpdates.logo_url = updates.logoUrl;
  if (updates.followUrl !== undefined) rowUpdates.follow_url = updates.followUrl;
  if (updates.engageUrl !== undefined) rowUpdates.engage_url = updates.engageUrl;
  if (updates.endDate) rowUpdates.end_date = updates.endDate;
  if (updates.notes !== undefined) rowUpdates.notes = updates.notes;
  if (updates.winners !== undefined) rowUpdates.winners = updates.winners;

  try {
    await supabase.from('flamebound_raffles').update(rowUpdates).eq('id', id);
  } catch (err) {
    console.error('Supabase update error:', err);
  }

  return updateRaffle(id, updates);
}

export function updateRaffle(id: string, updates: Partial<Raffle>): Raffle | null {
  const db = ensureDb();
  const index = db.raffles.findIndex(r => r.id === id);
  if (index === -1) return null;

  db.raffles[index] = { ...db.raffles[index], ...updates };
  writeDb(db);
  return db.raffles[index];
}

export async function deleteRaffleAsync(id: string): Promise<boolean> {
  try {
    await supabase.from('flamebound_raffles').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase delete error:', err);
  }
  return deleteRaffle(id);
}

export function deleteRaffle(id: string): boolean {
  const db = ensureDb();
  const initialLen = db.raffles.length;
  db.raffles = db.raffles.filter(r => r.id !== id);
  db.entries = db.entries.filter(e => e.raffleId !== id);
  writeDb(db);
  return db.raffles.length < initialLen;
}

export async function getEntriesAsync(raffleId?: string): Promise<RaffleEntry[]> {
  try {
    let query = supabase.from('flamebound_entries').select('*').order('created_at', { ascending: false });
    if (raffleId) {
      query = query.eq('raffle_id', raffleId);
    }
    const { data, error } = await query;
    if (error || !data || data.length === 0) {
      return getEntries(raffleId);
    }
    return data.map((e: any) => ({
      id: e.id,
      raffleId: e.raffle_id,
      walletAddress: e.wallet_address,
      shortAddress: formatAddress(e.wallet_address),
      twitterUsername: e.twitter_username || '',
      taskStatus: e.task_status || {},
      isHolder: e.is_verified_holder,
      tokenBalance: e.token_balance || 1,
      contractAddress: e.contract_address,
      network: e.network,
      verifiedAt: e.verified_at,
      status: 'confirmed' as const,
    }));
  } catch (err) {
    return getEntries(raffleId);
  }
}

export function getEntries(raffleId?: string): RaffleEntry[] {
  const db = ensureDb();
  if (raffleId) {
    return db.entries.filter(e => e.raffleId === raffleId);
  }
  return db.entries;
}

export function getEntryByWallet(raffleId: string, walletAddress: string): RaffleEntry | undefined {
  const db = ensureDb();
  const normalized = walletAddress.toLowerCase();
  return db.entries.find(
    e => e.raffleId === raffleId && e.walletAddress.toLowerCase() === normalized
  );
}

export async function createEntryAsync(entryData: Omit<RaffleEntry, 'id' | 'shortAddress' | 'verifiedAt'>): Promise<RaffleEntry> {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const entryId = `FB-${randomDigits}`;
  const now = new Date().toISOString();

  const row = {
    id: entryId,
    raffle_id: entryData.raffleId,
    wallet_address: entryData.walletAddress,
    twitter_username: entryData.twitterUsername || null,
    task_status: entryData.taskStatus || {},
    is_verified_holder: entryData.isHolder ?? true,
    token_balance: entryData.tokenBalance || 1,
    contract_address: entryData.contractAddress,
    network: entryData.network,
    verified_at: now,
  };

  try {
    await supabase.from('flamebound_entries').insert(row);
    // Increment total entries on Supabase raffle
    const { data: currentRaffle } = await supabase
      .from('flamebound_raffles')
      .select('total_entries')
      .eq('id', entryData.raffleId)
      .single();
    
    if (currentRaffle) {
      await supabase
        .from('flamebound_raffles')
        .update({ total_entries: (currentRaffle.total_entries || 0) + 1 })
        .eq('id', entryData.raffleId);
    }
  } catch (err) {
    console.error('Supabase entry creation error:', err);
  }

  // Also sync local
  return createEntry(entryData);
}

export function createEntry(entryData: Omit<RaffleEntry, 'id' | 'shortAddress' | 'verifiedAt'>): RaffleEntry {
  const db = ensureDb();

  const existing = getEntryByWallet(entryData.raffleId, entryData.walletAddress);
  if (existing) {
    throw new Error('DUPLICATE_ENTRY: This wallet has already entered this raffle.');
  }

  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  const entryId = `FB-${randomDigits}`;

  const newEntry: RaffleEntry = {
    ...entryData,
    id: entryId,
    shortAddress: formatAddress(entryData.walletAddress),
    verifiedAt: new Date().toISOString(),
  };

  db.entries.unshift(newEntry);

  const raffle = db.raffles.find(r => r.id === entryData.raffleId);
  if (raffle) {
    raffle.totalEntries = (raffle.totalEntries || 0) + 1;
  }

  writeDb(db);
  return newEntry;
}

export function deleteEntry(id: string): boolean {
  const db = ensureDb();
  const initialLen = db.entries.length;
  db.entries = db.entries.filter(e => e.id !== id);
  writeDb(db);
  return db.entries.length < initialLen;
}

export async function drawRaffleWinnersAsync(raffleId: string, customCount?: number): Promise<{ raffle: Raffle; winners: Winner[] }> {
  const result = drawRaffleWinners(raffleId, customCount);
  try {
    await supabase.from('flamebound_raffles').update({
      status: 'winners_drawn',
      winners: result.winners,
    }).eq('id', raffleId);
  } catch (err) {
    console.error('Supabase draw update error:', err);
  }
  return result;
}

export function drawRaffleWinners(raffleId: string, customCount?: number): { raffle: Raffle; winners: Winner[] } {
  const db = ensureDb();
  const raffle = db.raffles.find(r => r.id === raffleId);
  if (!raffle) {
    throw new Error('Raffle not found');
  }

  const eligibleEntries = db.entries.filter(
    e => e.raffleId === raffleId && e.status === 'confirmed' && e.isHolder
  );

  const count = customCount || raffle.supply || 10;
  const winnerCount = Math.min(count, eligibleEntries.length);

  const shuffled = [...eligibleEntries].sort(() => Math.random() - 0.5);
  const selectedEntries = shuffled.slice(0, winnerCount);

  const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const winners: Winner[] = selectedEntries.map((entry, index) => ({
    rank: index + 1,
    wallet: entry.walletAddress,
    shortWallet: entry.shortAddress,
    entryNumber: entry.id,
    drawnAt: new Date().toISOString(),
    txUrl: `https://etherscan.io/tx/${mockTxHash}`,
  }));

  raffle.status = 'winners_drawn';
  raffle.winners = winners;
  raffle.winnerTxHash = mockTxHash;

  writeDb(db);
  return { raffle, winners };
}

export async function getAdminStatsAsync(): Promise<AdminStats> {
  try {
    const raffles = await getRafflesAsync();
    const entries = await getEntriesAsync();
    const activeRaffles = raffles.filter(r => r.status === 'live' || r.status === 'ending_soon').length;
    const verifiedHolders = entries.filter(e => e.isHolder).length;
    const totalWinners = raffles.reduce((acc, r) => acc + (r.winners?.length || 0), 0);

    return {
      totalRaffles: raffles.length,
      activeRaffles,
      totalEntries: entries.length,
      totalVerifiedHolders: verifiedHolders,
      totalWinnersSelected: totalWinners,
    };
  } catch (err) {
    return getAdminStats();
  }
}

export function getAdminStats(): AdminStats {
  const db = ensureDb();
  const activeRaffles = db.raffles.filter(r => r.status === 'live' || r.status === 'ending_soon').length;
  const verifiedHolders = db.entries.filter(e => e.isHolder).length;
  const totalWinners = db.raffles.reduce((acc, r) => acc + (r.winners?.length || 0), 0);

  return {
    totalRaffles: db.raffles.length,
    activeRaffles,
    totalEntries: db.entries.length,
    totalVerifiedHolders: verifiedHolders,
    totalWinnersSelected: totalWinners,
  };
}

export async function resetDatabaseAsync(): Promise<void> {
  resetDatabase();
  try {
    await supabase.from('flamebound_entries').delete().neq('id', '___');
    for (const r of DEFAULT_RAFFLES) {
      await supabase.from('flamebound_raffles').upsert({
        id: r.id,
        title: r.title,
        project: r.project,
        type: r.type,
        subtitle: r.subtitle,
        description: r.description,
        status: r.status,
        supply: r.supply,
        nft_total_supply: r.nftTotalSupply,
        mint_price: r.mintPrice,
        mint_date: r.mintDate,
        max_mint_per_wallet: r.maxMintPerWallet,
        total_entries: r.totalEntries,
        start_date: r.startDate,
        end_date: r.endDate,
        network: r.network,
        contract_address: r.contractAddress,
        required_token_count: r.requiredTokenCount,
        artwork_type: r.artworkType,
        logo_url: r.logoUrl,
        banner_url: r.bannerUrl,
        follow_url: r.followUrl,
        engage_url: r.engageUrl,
        twitter_url: r.twitterUrl,
        discord_url: r.discordUrl,
        mint_url: r.mintUrl,
        notes: r.notes,
        winners: r.winners || [],
      });
    }
  } catch (err) {
    console.error('Supabase reset error:', err);
  }
}

export function resetDatabase(): void {
  const initial: DatabaseSchema = {
    raffles: DEFAULT_RAFFLES,
    entries: DEFAULT_ENTRIES,
  };
  writeDb(initial);
}
