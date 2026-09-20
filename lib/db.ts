import fs from 'fs';
import path from 'path';
import { Raffle, RaffleEntry, Winner, AdminStats } from './types';
import { formatAddress } from './blockchain';
import { supabase } from './supabase';

const DB_FILE = path.join(process.cwd(), 'data', 'flamebound_db.json');

interface DatabaseSchema {
  raffles: Raffle[];
  entries: RaffleEntry[];
}

const DEFAULT_RAFFLES: Raffle[] = [
  {
    id: 'raffle-dotset-genesis-01',
    title: 'DOTSET GENESIS WL',
    project: 'DOTSET',
    type: 'WL RAFFLE',
    mintStage: 'GTD',
    subtitle: 'Win an exclusive guaranteed Dotset Genesis whitelist spot.',
    description: 'The official whitelist allocation for the upcoming Dotset Genesis mint. Complete social quests to enter.',
    status: 'live',
    supply: 50,
    nftTotalSupply: '1,000 NFTs',
    mintPrice: 'FREE MINT',
    mintDate: 'TBA',
    maxMintPerWallet: '1 PER WL',
    totalEntries: 0,
    startDate: '2026-08-01T00:00:00.000Z',
    endDate: '2026-10-14T23:59:00.000Z',
    network: 'ETHEREUM',
    entryMethod: 'raffle',
    artworkType: 'genesis',
    logoUrl: '/images/dotset-logo.png',
    bannerUrl: '/images/dotset-logo.png',
    followUrl: 'https://x.com/dotsetxyz',
    engageUrl: 'https://x.com/dotsetxyz',
    twitterUrl: 'https://x.com/dotsetxyz',
    discordUrl: 'https://discord.com',
    mintUrl: '',
    notes: 'Official Dotset Allocation',
    tasks: [],
    customTasks: [],
    winners: [],
    createdAt: '2026-08-01T00:00:00.000Z',
  },
];

const DEFAULT_ENTRIES: RaffleEntry[] = [];

// Helper to map DB row to Raffle type
function mapDbRowToRaffle(row: any): Raffle {
  return {
    id: row.id,
    slug: row.slug || row.id,
    title: row.title,
    project: row.project || 'DOTSET',
    type: row.type || 'WL RAFFLE',
    mintStage: (row.mint_stage as any) || (row.entry_method === 'fcfs' ? 'FCFS' : 'GTD'),
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
    network: row.network || 'ETHEREUM',
    customNetwork: row.custom_network,
    entryMethod: row.entry_method || 'raffle',
    artworkType: row.artwork_type || 'genesis',
    logoUrl: row.logo_url || '/images/dotset-logo.png',
    bannerUrl: row.banner_url || '/images/dotset-logo.png',
    followUrl: row.follow_url || 'https://x.com/dotsetxyz',
    engageUrl: row.engage_url || 'https://x.com/dotsetxyz',
    twitterUrl: row.twitter_url || 'https://x.com/dotsetxyz',
    discordUrl: row.discord_url || 'https://discord.com',
    mintUrl: row.mint_url || '',
    notes: row.notes || '',
    customTasks: Array.isArray(row.custom_tasks) 
      ? row.custom_tasks 
      : (typeof row.custom_tasks === 'string' ? (() => { try { return JSON.parse(row.custom_tasks); } catch { return []; } })() : []),
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

export async function getRaffleByIdAsync(idOrSlug: string): Promise<Raffle | null> {
  try {
    const { data, error } = await supabase
      .from('flamebound_raffles')
      .select('*')
      .or(`id.eq.${idOrSlug},slug.eq.${idOrSlug}`)
      .single();

    if (error || !data) {
      return getRaffleById(idOrSlug);
    }
    return mapDbRowToRaffle(data);
  } catch (err) {
    return getRaffleById(idOrSlug);
  }
}

export function getRaffleById(idOrSlug: string): Raffle | null {
  const db = ensureDb();
  const raffle = db.raffles.find(r => r.id === idOrSlug || r.slug === idOrSlug);
  return raffle || null;
}

export async function createRaffleAsync(data: Omit<Raffle, 'id' | 'totalEntries' | 'winners' | 'createdAt'>): Promise<Raffle> {
  const newRaffle: Raffle = {
    ...data,
    id: `raffle-${Date.now()}`,
    slug: data.slug || `raffle-${Date.now()}`,
    totalEntries: 0,
    winners: [],
    createdAt: new Date().toISOString(),
  };

  try {
    const { data: inserted, error } = await supabase
      .from('flamebound_raffles')
      .insert({
        id: newRaffle.id,
        slug: newRaffle.slug,
        title: newRaffle.title,
        project: newRaffle.project,
        type: newRaffle.type,
        mint_stage: newRaffle.mintStage || (newRaffle.entryMethod === 'fcfs' ? 'FCFS' : 'GTD'),
        subtitle: newRaffle.subtitle,
        description: newRaffle.description,
        status: newRaffle.status,
        supply: newRaffle.supply,
        nft_total_supply: newRaffle.nftTotalSupply,
        mint_price: newRaffle.mintPrice,
        mint_date: newRaffle.mintDate,
        max_mint_per_wallet: newRaffle.maxMintPerWallet,
        total_entries: 0,
        start_date: newRaffle.startDate,
        end_date: newRaffle.endDate,
        network: newRaffle.network,
        custom_network: newRaffle.customNetwork,
        entry_method: newRaffle.entryMethod || 'raffle',
        artwork_type: newRaffle.artworkType || 'genesis',
        logo_url: newRaffle.logoUrl,
        banner_url: newRaffle.bannerUrl,
        follow_url: newRaffle.followUrl,
        engage_url: newRaffle.engageUrl,
        twitter_url: newRaffle.twitterUrl,
        discord_url: newRaffle.discordUrl,
        mint_url: newRaffle.mintUrl,
        notes: newRaffle.notes,
        custom_tasks: newRaffle.customTasks || [],
        winners: [],
      })
      .select()
      .single();

    if (!error && inserted) {
      createRaffle(data);
      return mapDbRowToRaffle(inserted);
    }
  } catch (err) {
    console.error('Supabase create raffle error:', err);
  }

  return createRaffle(data);
}

export function createRaffle(data: Omit<Raffle, 'id' | 'totalEntries' | 'winners' | 'createdAt'>): Raffle {
  const db = ensureDb();
  const newRaffle: Raffle = {
    ...data,
    id: `raffle-${Date.now()}`,
    slug: data.slug || `raffle-${Date.now()}`,
    totalEntries: 0,
    winners: [],
    createdAt: new Date().toISOString(),
  };

  db.raffles.unshift(newRaffle);
  writeDb(db);
  return newRaffle;
}

export async function updateRaffleAsync(id: string, updates: Partial<Raffle>): Promise<Raffle | null> {
  const dbUpdates: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.project !== undefined) dbUpdates.project = updates.project;
  if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
  if (updates.type !== undefined) dbUpdates.type = updates.type;
  if (updates.mintStage !== undefined) dbUpdates.mint_stage = updates.mintStage;
  if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.supply !== undefined) dbUpdates.supply = updates.supply;
  if (updates.nftTotalSupply !== undefined) dbUpdates.nft_total_supply = updates.nftTotalSupply;
  if (updates.mintPrice !== undefined) dbUpdates.mint_price = updates.mintPrice;
  if (updates.mintDate !== undefined) dbUpdates.mint_date = updates.mintDate;
  if (updates.maxMintPerWallet !== undefined) dbUpdates.max_mint_per_wallet = updates.maxMintPerWallet;
  if (updates.totalEntries !== undefined) dbUpdates.total_entries = updates.totalEntries;
  if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate;
  if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate;
  if (updates.network !== undefined) dbUpdates.network = updates.network;
  if (updates.customNetwork !== undefined) dbUpdates.custom_network = updates.customNetwork;
  if (updates.entryMethod !== undefined) dbUpdates.entry_method = updates.entryMethod;
  if (updates.artworkType !== undefined) dbUpdates.artwork_type = updates.artworkType;
  if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
  if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
  if (updates.followUrl !== undefined) dbUpdates.follow_url = updates.followUrl;
  if (updates.engageUrl !== undefined) dbUpdates.engage_url = updates.engageUrl;
  if (updates.twitterUrl !== undefined) dbUpdates.twitter_url = updates.twitterUrl;
  if (updates.discordUrl !== undefined) dbUpdates.discord_url = updates.discordUrl;
  if (updates.mintUrl !== undefined) dbUpdates.mint_url = updates.mintUrl;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.customTasks !== undefined) dbUpdates.custom_tasks = updates.customTasks;
  if (updates.winners !== undefined) dbUpdates.winners = updates.winners;
  if (updates.winnerTxHash !== undefined) dbUpdates.winner_tx_hash = updates.winnerTxHash;

  try {
    const { data, error } = await supabase
      .from('flamebound_raffles')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      updateRaffle(id, updates);
      return mapDbRowToRaffle(data);
    }
  } catch (err) {
    console.error('Supabase update raffle error:', err);
  }

  return updateRaffle(id, updates);
}

export function updateRaffle(id: string, updates: Partial<Raffle>): Raffle | null {
  const db = ensureDb();
  const index = db.raffles.findIndex(r => r.id === id);
  if (index === -1) return null;

  db.raffles[index] = {
    ...db.raffles[index],
    ...updates,
  };

  writeDb(db);
  return db.raffles[index];
}

export async function deleteRaffleAsync(id: string): Promise<boolean> {
  try {
    await supabase.from('flamebound_entries').delete().eq('raffle_id', id);
    await supabase.from('flamebound_raffles').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase delete raffle error:', err);
  }
  return deleteRaffle(id);
}

export function deleteRaffle(id: string): boolean {
  const db = ensureDb();
  const index = db.raffles.findIndex(r => r.id === id);
  if (index === -1) return false;

  db.raffles.splice(index, 1);
  db.entries = db.entries.filter(e => e.raffleId !== id);
  writeDb(db);
  return true;
}

// ============================================================================
// ENTRIES CRUD & VERIFICATION
// ============================================================================

export async function getEntriesAsync(raffleId?: string): Promise<RaffleEntry[]> {
  try {
    let query = supabase.from('flamebound_entries').select('*').order('verified_at', { ascending: false });
    if (raffleId) {
      query = query.eq('raffle_id', raffleId);
    }
    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      return getEntries(raffleId);
    }

    return data.map((row: any) => ({
      id: row.id,
      raffleId: row.raffle_id,
      walletAddress: row.wallet_address,
      shortAddress: row.short_address || formatAddress(row.wallet_address),
      twitterUsername: row.twitter_username,
      taskStatus: row.task_status || {},
      isHolder: !!row.is_holder,
      tokenBalance: row.token_balance || 0,
      verifiedAt: row.verified_at,
      status: row.status || 'confirmed',
      network: row.network || 'ETHEREUM',
      contractAddress: row.contract_address,
      metadata: row.metadata || {},
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

export async function checkExistingEntryAsync(raffleId: string, walletAddress: string): Promise<RaffleEntry | null> {
  const normalized = walletAddress.toLowerCase();
  try {
    const { data, error } = await supabase
      .from('flamebound_entries')
      .select('*')
      .eq('raffle_id', raffleId)
      .ilike('wallet_address', normalized)
      .maybeSingle();

    if (!error && data) {
      return {
        id: data.id,
        raffleId: data.raffle_id,
        walletAddress: data.wallet_address,
        shortAddress: data.short_address || formatAddress(data.wallet_address),
        twitterUsername: data.twitter_username,
        taskStatus: data.task_status || {},
        isHolder: !!data.is_holder,
        tokenBalance: data.token_balance || 0,
        verifiedAt: data.verified_at,
        status: data.status || 'confirmed',
        network: data.network || 'ETHEREUM',
        contractAddress: data.contract_address,
        metadata: data.metadata || {},
      };
    }
  } catch (err) {
    // fallback
  }

  return checkExistingEntry(raffleId, walletAddress);
}

export function checkExistingEntry(raffleId: string, walletAddress: string): RaffleEntry | null {
  const db = ensureDb();
  const normalized = walletAddress.toLowerCase();
  const entry = db.entries.find(
    e => e.raffleId === raffleId && e.walletAddress.toLowerCase() === normalized
  );
  return entry || null;
}

export const getEntryByWalletAsync = checkExistingEntryAsync;
export const getEntryByWallet = checkExistingEntry;

export async function deleteEntryAsync(id: string): Promise<boolean> {
  try {
    await supabase.from('flamebound_entries').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase delete entry error:', err);
  }
  return deleteEntry(id);
}

export function deleteEntry(id: string): boolean {
  const db = ensureDb();
  const index = db.entries.findIndex(e => e.id === id);
  if (index === -1) return false;
  db.entries.splice(index, 1);
  writeDb(db);
  return true;
}

export async function createEntryAsync(entryData: {
  raffleId: string;
  walletAddress: string;
  twitterUsername?: string;
  taskStatus?: Record<string, any>;
  network?: string;
  userAgent?: string;
  ipHash?: string;
}): Promise<RaffleEntry> {
  const existing = await checkExistingEntryAsync(entryData.raffleId, entryData.walletAddress);
  if (existing) {
    return existing;
  }

  const raffle = await getRaffleByIdAsync(entryData.raffleId);
  if (!raffle) {
    throw new Error('Raffle not found');
  }

  const isFcfs = raffle.entryMethod === 'fcfs';
  const entryCount = await getEntriesAsync(entryData.raffleId);
  const isFcfsWinner = isFcfs && (entryCount.length < (raffle.supply || 10));

  const newEntry: RaffleEntry = {
    id: `DS-${Math.floor(100000 + Math.random() * 900000)}`,
    raffleId: entryData.raffleId,
    walletAddress: entryData.walletAddress,
    shortAddress: formatAddress(entryData.walletAddress),
    twitterUsername: entryData.twitterUsername || '',
    taskStatus: entryData.taskStatus || {},
    isHolder: true,
    tokenBalance: 1,
    verifiedAt: new Date().toISOString(),
    status: 'confirmed',
    network: entryData.network || raffle.network || 'ETHEREUM',
    metadata: {
      userAgent: entryData.userAgent,
      ipHash: entryData.ipHash,
      entryMethod: raffle.entryMethod || 'raffle',
      isFcfsWinner: isFcfsWinner,
    },
  };

  try {
    await supabase.from('flamebound_entries').insert({
      id: newEntry.id,
      raffle_id: newEntry.raffleId,
      wallet_address: newEntry.walletAddress,
      short_address: newEntry.shortAddress,
      twitter_username: newEntry.twitterUsername,
      task_status: newEntry.taskStatus,
      is_holder: true,
      token_balance: 1,
      verified_at: newEntry.verifiedAt,
      status: newEntry.status,
      network: newEntry.network,
      metadata: newEntry.metadata,
    });

    await supabase.from('flamebound_raffles').update({
      total_entries: (raffle.totalEntries || 0) + 1,
    }).eq('id', entryData.raffleId);
  } catch (err) {
    console.error('Supabase create entry error:', err);
  }

  createEntryLocal(newEntry);
  return newEntry;
}

function createEntryLocal(newEntry: RaffleEntry): RaffleEntry {
  const db = ensureDb();
  db.entries.push(newEntry);

  const raffle = db.raffles.find(r => r.id === newEntry.raffleId);
  if (raffle) {
    raffle.totalEntries = (raffle.totalEntries || 0) + 1;
  }

  writeDb(db);
  return newEntry;
}

// ============================================================================
// DRAW WINNERS
// ============================================================================

export async function drawRaffleWinnersAsync(raffleId: string, customCount?: number): Promise<{ raffle: Raffle; winners: Winner[] }> {
  const raffle = await getRaffleByIdAsync(raffleId);
  if (!raffle) {
    throw new Error('Raffle not found');
  }

  const allEntries = await getEntriesAsync(raffleId);
  const eligibleEntries = allEntries.filter(e => e.status === 'confirmed');
  
  if (eligibleEntries.length === 0) {
    throw new Error(`No confirmed entries found for "${raffle.title}" yet.`);
  }

  const totalSlots = customCount || raffle.supply || 10;
  const availableSlots = Math.min(totalSlots, eligibleEntries.length);

  // If FCFS, sort by verifiedAt time ascending; otherwise shuffle randomly
  let pool = [...eligibleEntries];
  if (raffle.entryMethod === 'fcfs') {
    pool.sort((a, b) => new Date(a.verifiedAt).getTime() - new Date(b.verifiedAt).getTime());
  } else {
    // Fisher-Yates random shuffle
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }

  const selectedEntries = pool.slice(0, availableSlots);
  const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const winners: Winner[] = selectedEntries.map((e, index) => ({
    rank: index + 1,
    wallet: e.walletAddress,
    shortWallet: e.shortAddress || formatAddress(e.walletAddress),
    twitterUsername: e.twitterUsername || '',
    entryNumber: e.id,
    drawnAt: new Date().toISOString(),
    txUrl: `https://etherscan.io/tx/${mockTxHash}`,
  }));

  try {
    await supabase.from('flamebound_raffles').update({
      status: 'winners_drawn',
      winners: winners,
      winner_tx_hash: mockTxHash,
      updated_at: new Date().toISOString(),
    }).eq('id', raffleId);
  } catch (err) {
    console.error('Supabase draw update error:', err);
  }

  raffle.status = 'winners_drawn';
  raffle.winners = winners;
  raffle.winnerTxHash = mockTxHash;
  updateRaffle(raffleId, {
    status: 'winners_drawn',
    winners: winners,
    winnerTxHash: mockTxHash,
  });

  return { raffle, winners };
}

export function drawRaffleWinners(raffleId: string, customCount?: number): { raffle: Raffle; winners: Winner[] } {
  const db = ensureDb();
  const raffle = db.raffles.find(r => r.id === raffleId);
  if (!raffle) {
    throw new Error('Raffle not found');
  }

  const eligibleEntries = db.entries.filter(e => e.raffleId === raffleId && e.status === 'confirmed');
  if (eligibleEntries.length === 0) {
    throw new Error('No confirmed entries found for this raffle.');
  }

  const totalSlots = customCount || raffle.supply || 10;
  const availableSlots = Math.min(totalSlots, eligibleEntries.length);

  let pool = [...eligibleEntries];
  if (raffle.entryMethod === 'fcfs') {
    pool.sort((a, b) => new Date(a.verifiedAt).getTime() - new Date(b.verifiedAt).getTime());
  } else {
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
  }

  const selectedEntries = pool.slice(0, availableSlots);
  const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;

  const winners: Winner[] = selectedEntries.map((e, index) => ({
    rank: index + 1,
    wallet: e.walletAddress,
    shortWallet: e.shortAddress || formatAddress(e.walletAddress),
    twitterUsername: e.twitterUsername || '',
    entryNumber: e.id,
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
    const totalWinners = raffles.reduce((acc, r) => acc + (r.winners?.length || 0), 0);

    return {
      totalRaffles: raffles.length,
      activeRaffles,
      totalEntries: entries.length,
      totalWinnersSelected: totalWinners,
    };
  } catch (err) {
    return getAdminStats();
  }
}

export function getAdminStats(): AdminStats {
  const db = ensureDb();
  const activeRaffles = db.raffles.filter(r => r.status === 'live' || r.status === 'ending_soon').length;
  const totalWinners = db.raffles.reduce((acc, r) => acc + (r.winners?.length || 0), 0);

  return {
    totalRaffles: db.raffles.length,
    activeRaffles,
    totalEntries: db.entries.length,
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
        entry_method: r.entryMethod || 'raffle',
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
