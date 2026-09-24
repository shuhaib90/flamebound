import fs from 'fs';
import path from 'path';
import { Raffle, RaffleEntry, Winner, AdminStats, CollabRequest, CustomChain } from './types';
import { formatAddress } from './blockchain';
import { supabase } from './supabase';

const DB_FILE = path.join(process.cwd(), 'data', 'flamebound_db.json');

interface DatabaseSchema {
  raffles: Raffle[];
  entries: RaffleEntry[];
  collabRequests?: CollabRequest[];
  customChains?: CustomChain[];
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
    discordUrl: 'https://discord.gg/Jq2Jt2HdfY',
    mintUrl: '',
    notes: 'Official Dotset Allocation',
    tasks: [],
    customTasks: [
      {
        id: 'task-official-tg',
        title: 'Join DOTSET Telegram',
        url: 'https://t.me/dotset_xyz',
        actionLabel: 'Join TG',
        type: 'telegram',
        required: true,
      },
      {
        id: 'task-official-discord',
        title: 'Join DOTSET Discord',
        url: 'https://discord.gg/Jq2Jt2HdfY',
        actionLabel: 'Join Discord',
        type: 'discord',
        required: true,
      },
    ],
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
    customNetwork: row.custom_network || row.customNetwork,
    customNetworkLogoUrl: row.custom_network_logo_url || row.customNetworkLogoUrl,
    walletAddressLabel: row.wallet_address_label || row.walletAddressLabel,
    walletAddressPlaceholder: row.wallet_address_placeholder || row.walletAddressPlaceholder,
    entryMethod: row.entry_method || 'raffle',
    artworkType: row.artwork_type || 'genesis',
    logoUrl: row.logo_url || '/images/dotset-logo.png',
    bannerUrl: row.banner_url || '/images/dotset-logo.png',
    followUrl: row.follow_url || 'https://x.com/dotsetxyz',
    engageUrl: row.engage_url || 'https://x.com/dotsetxyz',
    twitterUrl: row.twitter_url || 'https://x.com/dotsetxyz',
    discordUrl: row.discord_url || 'https://discord.gg/Jq2Jt2HdfY',
    mintUrl: row.mint_url || '',
    notes: row.notes || '',
    customTasks: Array.isArray(row.custom_tasks) 
      ? row.custom_tasks 
      : (typeof row.custom_tasks === 'string' ? (() => { try { return JSON.parse(row.custom_tasks); } catch { return []; } })() : (Array.isArray(row.customTasks) ? row.customTasks : [])),
    winners: Array.isArray(row.winners) ? row.winners : [],
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
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
  if (!idOrSlug) return null;
  const cleanTerm = idOrSlug.trim();

  try {
    // 1. Direct ID match first (primary key)
    const { data: byId } = await supabase
      .from('flamebound_raffles')
      .select('*')
      .eq('id', cleanTerm)
      .maybeSingle();

    if (byId) {
      return mapDbRowToRaffle(byId);
    }

    // 2. Slug match (order by created_at descending to pick latest if multiple share slug)
    const { data: bySlug, error } = await supabase
      .from('flamebound_raffles')
      .select('*')
      .eq('slug', cleanTerm)
      .order('created_at', { ascending: false })
      .limit(1);

    if (bySlug && bySlug.length > 0) {
      return mapDbRowToRaffle(bySlug[0]);
    }

    // 3. Fallback to or filter query
    const { data: orMatches } = await supabase
      .from('flamebound_raffles')
      .select('*')
      .or(`id.eq.${cleanTerm},slug.eq.${cleanTerm}`)
      .order('created_at', { ascending: false })
      .limit(1);

    if (orMatches && orMatches.length > 0) {
      return mapDbRowToRaffle(orMatches[0]);
    }

    return getRaffleById(cleanTerm);
  } catch (err) {
    return getRaffleById(cleanTerm);
  }
}

export function getRaffleById(idOrSlug: string): Raffle | null {
  if (!idOrSlug) return null;
  const db = ensureDb();
  const cleanTerm = idOrSlug.trim();
  const byId = db.raffles.find(r => r.id === cleanTerm);
  if (byId) return byId;
  const bySlug = db.raffles.filter(r => r.slug === cleanTerm);
  if (bySlug.length > 0) return bySlug[bySlug.length - 1];
  return null;
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
        custom_network_logo_url: newRaffle.customNetworkLogoUrl,
        wallet_address_label: newRaffle.walletAddressLabel,
        wallet_address_placeholder: newRaffle.walletAddressPlaceholder,
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

    if (error) {
      console.error('Supabase create raffle error:', error);
    } else if (inserted) {
      const mapped = mapDbRowToRaffle(inserted);
      createRaffle(mapped);
      if (mapped.customNetwork && mapped.customNetwork.trim()) {
        saveCustomChainAsync({
          name: mapped.customNetwork.trim(),
          network: mapped.network || 'CUSTOM',
          logoUrl: mapped.customNetworkLogoUrl,
          walletAddressLabel: mapped.walletAddressLabel,
          walletAddressPlaceholder: mapped.walletAddressPlaceholder,
        }).catch(() => {});
      }
      return mapped;
    }
  } catch (err) {
    console.error('Supabase create raffle exception:', err);
  }

  if (newRaffle.customNetwork && newRaffle.customNetwork.trim()) {
    saveCustomChainAsync({
      name: newRaffle.customNetwork.trim(),
      network: newRaffle.network || 'CUSTOM',
      logoUrl: newRaffle.customNetworkLogoUrl,
      walletAddressLabel: newRaffle.walletAddressLabel,
      walletAddressPlaceholder: newRaffle.walletAddressPlaceholder,
    }).catch(() => {});
  }

  return createRaffle(newRaffle);
}

export function createRaffle(data: Partial<Raffle> & Omit<Raffle, 'totalEntries' | 'winners'>): Raffle {
  const db = ensureDb();
  const newRaffle: Raffle = {
    ...data,
    id: data.id || `raffle-${Date.now()}`,
    slug: data.slug || data.id || `raffle-${Date.now()}`,
    totalEntries: data.totalEntries || 0,
    winners: data.winners || [],
    createdAt: data.createdAt || new Date().toISOString(),
  } as Raffle;

  // Avoid duplicates in local cache
  const existingIdx = db.raffles.findIndex(r => r.id === newRaffle.id || r.slug === newRaffle.slug);
  if (existingIdx !== -1) {
    db.raffles[existingIdx] = newRaffle;
  } else {
    db.raffles.unshift(newRaffle);
  }
  writeDb(db);
  return newRaffle;
}

export async function updateRaffleAsync(id: string, updates: Partial<Raffle>): Promise<Raffle | null> {
  if (updates.customNetwork && updates.customNetwork.trim()) {
    saveCustomChainAsync({
      name: updates.customNetwork.trim(),
      network: updates.network || 'CUSTOM',
      logoUrl: updates.customNetworkLogoUrl,
      walletAddressLabel: updates.walletAddressLabel,
      walletAddressPlaceholder: updates.walletAddressPlaceholder,
    }).catch(() => {});
  }

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
  if (updates.customNetworkLogoUrl !== undefined) dbUpdates.custom_network_logo_url = updates.customNetworkLogoUrl;
  if (updates.walletAddressLabel !== undefined) dbUpdates.wallet_address_label = updates.walletAddressLabel;
  if (updates.walletAddressPlaceholder !== undefined) dbUpdates.wallet_address_placeholder = updates.walletAddressPlaceholder;
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
    collabRequests: [],
  };
  writeDb(initial);
}

// ============================================================================
// COLLAB REQUESTS CRUD OPERATIONS
// ============================================================================

function mapDbRowToCollabRequest(row: any): CollabRequest {
  return {
    id: row.id,
    project: row.project,
    title: row.title,
    slug: row.slug || row.id,
    supply: row.supply || 50,
    mintStage: row.mint_stage || 'GTD',
    network: row.network || 'ETHEREUM',
    customNetwork: row.custom_network || row.customNetwork,
    customNetworkLogoUrl: row.custom_network_logo_url || row.customNetworkLogoUrl,
    walletAddressLabel: row.wallet_address_label || row.walletAddressLabel,
    walletAddressPlaceholder: row.wallet_address_placeholder || row.walletAddressPlaceholder,
    subtitle: row.subtitle || '',
    description: row.description || '',
    nftTotalSupply: row.nft_total_supply,
    mintPrice: row.mint_price,
    mintDate: row.mint_date,
    maxMintPerWallet: row.max_mint_per_wallet,
    logoUrl: row.logo_url || '/images/dotset-logo.png',
    bannerUrl: row.banner_url || '/images/dotset-logo.png',
    artworkType: row.artwork_type || 'genesis',
    followUrl: row.follow_url || '',
    engageUrl: row.engage_url || '',
    twitterUrl: row.twitter_url || '',
    discordUrl: row.discord_url || '',
    mintUrl: row.mint_url || '',
    notes: row.notes || '',
    customTasks: Array.isArray(row.custom_tasks) 
      ? row.custom_tasks 
      : (typeof row.custom_tasks === 'string' ? (() => { try { return JSON.parse(row.custom_tasks); } catch { return []; } })() : (Array.isArray(row.customTasks) ? row.customTasks : [])),
    requesterTwitter: row.requester_twitter,
    requesterTelegram: row.requester_telegram,
    requesterEmail: row.requester_email,
    requesterDiscord: row.requester_discord,
    status: row.status || 'pending',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    updatedAt: row.updated_at || row.updatedAt,
  };
}

export async function getCollabRequestsAsync(): Promise<CollabRequest[]> {
  try {
    const { data, error } = await supabase
      .from('flamebound_collab_requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map(mapDbRowToCollabRequest);
    }
  } catch (err) {
    console.warn('Supabase getCollabRequests error:', err);
  }

  const db = ensureDb();
  return db.collabRequests || [];
}

export async function createCollabRequestAsync(data: Omit<CollabRequest, 'id' | 'status' | 'createdAt'>): Promise<CollabRequest> {
  const newReq: CollabRequest = {
    ...data,
    id: `collab-${Date.now()}`,
    slug: data.slug || `collab-${Date.now()}`,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  try {
    const { data: inserted, error } = await supabase
      .from('flamebound_collab_requests')
      .insert({
        id: newReq.id,
        project: newReq.project,
        title: newReq.title,
        slug: newReq.slug,
        supply: newReq.supply,
        mint_stage: newReq.mintStage || 'GTD',
        network: newReq.network,
        custom_network: newReq.customNetwork,
        custom_network_logo_url: newReq.customNetworkLogoUrl,
        wallet_address_label: newReq.walletAddressLabel,
        wallet_address_placeholder: newReq.walletAddressPlaceholder,
        subtitle: newReq.subtitle,
        description: newReq.description,
        nft_total_supply: newReq.nftTotalSupply,
        mint_price: newReq.mintPrice,
        mint_date: newReq.mintDate,
        max_mint_per_wallet: newReq.maxMintPerWallet,
        logo_url: newReq.logoUrl,
        banner_url: newReq.bannerUrl,
        artwork_type: newReq.artworkType || 'genesis',
        follow_url: newReq.followUrl,
        engage_url: newReq.engageUrl,
        twitter_url: newReq.twitterUrl,
        discord_url: newReq.discordUrl,
        mint_url: newReq.mintUrl,
        notes: newReq.notes,
        custom_tasks: newReq.customTasks || [],
        requester_twitter: newReq.requesterTwitter,
        requester_telegram: newReq.requesterTelegram,
        requester_email: newReq.requesterEmail,
        requester_discord: newReq.requesterDiscord,
        status: 'pending',
      })
      .select()
      .single();

    if (!error && inserted) {
      const mapped = mapDbRowToCollabRequest(inserted);
      saveLocalCollabRequest(mapped);
      if (mapped.customNetwork && mapped.customNetwork.trim()) {
        saveCustomChainAsync({
          name: mapped.customNetwork.trim(),
          network: mapped.network || 'CUSTOM',
          logoUrl: mapped.customNetworkLogoUrl,
          walletAddressLabel: mapped.walletAddressLabel,
          walletAddressPlaceholder: mapped.walletAddressPlaceholder,
        }).catch(() => {});
      }
      return mapped;
    }
    if (error) {
      console.error('Supabase create collab request error:', error);
    }
  } catch (err) {
    console.error('Supabase create collab request exception:', err);
  }

  if (newReq.customNetwork && newReq.customNetwork.trim()) {
    saveCustomChainAsync({
      name: newReq.customNetwork.trim(),
      network: newReq.network || 'CUSTOM',
      logoUrl: newReq.customNetworkLogoUrl,
      walletAddressLabel: newReq.walletAddressLabel,
      walletAddressPlaceholder: newReq.walletAddressPlaceholder,
    }).catch(() => {});
  }

  saveLocalCollabRequest(newReq);
  return newReq;
}

function saveLocalCollabRequest(req: CollabRequest) {
  const db = ensureDb();
  if (!db.collabRequests) db.collabRequests = [];
  const idx = db.collabRequests.findIndex(r => r.id === req.id);
  if (idx !== -1) {
    db.collabRequests[idx] = req;
  } else {
    db.collabRequests.unshift(req);
  }
  writeDb(db);
}

export async function updateCollabRequestAsync(id: string, updates: Partial<CollabRequest>): Promise<CollabRequest | null> {
  if (updates.customNetwork && updates.customNetwork.trim()) {
    saveCustomChainAsync({
      name: updates.customNetwork.trim(),
      network: updates.network || 'CUSTOM',
      logoUrl: updates.customNetworkLogoUrl,
      walletAddressLabel: updates.walletAddressLabel,
      walletAddressPlaceholder: updates.walletAddressPlaceholder,
    }).catch(() => {});
  }

  const dbUpdates: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.project !== undefined) dbUpdates.project = updates.project;
  if (updates.title !== undefined) dbUpdates.title = updates.title;
  if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
  if (updates.supply !== undefined) dbUpdates.supply = updates.supply;
  if (updates.mintStage !== undefined) dbUpdates.mint_stage = updates.mintStage;
  if (updates.network !== undefined) dbUpdates.network = updates.network;
  if (updates.customNetwork !== undefined) dbUpdates.custom_network = updates.customNetwork;
  if (updates.customNetworkLogoUrl !== undefined) dbUpdates.custom_network_logo_url = updates.customNetworkLogoUrl;
  if (updates.walletAddressLabel !== undefined) dbUpdates.wallet_address_label = updates.walletAddressLabel;
  if (updates.walletAddressPlaceholder !== undefined) dbUpdates.wallet_address_placeholder = updates.walletAddressPlaceholder;
  if (updates.subtitle !== undefined) dbUpdates.subtitle = updates.subtitle;
  if (updates.description !== undefined) dbUpdates.description = updates.description;
  if (updates.nftTotalSupply !== undefined) dbUpdates.nft_total_supply = updates.nftTotalSupply;
  if (updates.mintPrice !== undefined) dbUpdates.mint_price = updates.mintPrice;
  if (updates.mintDate !== undefined) dbUpdates.mint_date = updates.mintDate;
  if (updates.maxMintPerWallet !== undefined) dbUpdates.max_mint_per_wallet = updates.maxMintPerWallet;
  if (updates.logoUrl !== undefined) dbUpdates.logo_url = updates.logoUrl;
  if (updates.bannerUrl !== undefined) dbUpdates.banner_url = updates.bannerUrl;
  if (updates.artworkType !== undefined) dbUpdates.artwork_type = updates.artworkType;
  if (updates.followUrl !== undefined) dbUpdates.follow_url = updates.followUrl;
  if (updates.engageUrl !== undefined) dbUpdates.engage_url = updates.engageUrl;
  if (updates.twitterUrl !== undefined) dbUpdates.twitter_url = updates.twitterUrl;
  if (updates.discordUrl !== undefined) dbUpdates.discord_url = updates.discordUrl;
  if (updates.mintUrl !== undefined) dbUpdates.mint_url = updates.mintUrl;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
  if (updates.customTasks !== undefined) dbUpdates.custom_tasks = updates.customTasks;
  if (updates.requesterTwitter !== undefined) dbUpdates.requester_twitter = updates.requesterTwitter;
  if (updates.requesterTelegram !== undefined) dbUpdates.requester_telegram = updates.requesterTelegram;
  if (updates.requesterEmail !== undefined) dbUpdates.requester_email = updates.requesterEmail;
  if (updates.requesterDiscord !== undefined) dbUpdates.requester_discord = updates.requesterDiscord;
  if (updates.status !== undefined) dbUpdates.status = updates.status;

  try {
    const { data, error } = await supabase
      .from('flamebound_collab_requests')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      const mapped = mapDbRowToCollabRequest(data);
      saveLocalCollabRequest(mapped);
      return mapped;
    }
    if (error) console.error('Supabase update collab error:', error);
  } catch (err) {
    console.error('Supabase update collab exception:', err);
  }

  const db = ensureDb();
  if (db.collabRequests) {
    const idx = db.collabRequests.findIndex(r => r.id === id);
    if (idx !== -1) {
      db.collabRequests[idx] = {
        ...db.collabRequests[idx],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      writeDb(db);
      return db.collabRequests[idx];
    }
  }
  return null;
}

export async function updateCollabRequestStatusAsync(id: string, status: 'pending' | 'approved' | 'rejected'): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('flamebound_collab_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);

    if (error) console.error('Supabase update collab status error:', error);
  } catch (err) {
    console.error('Supabase update collab status exception:', err);
  }

  const db = ensureDb();
  if (db.collabRequests) {
    const req = db.collabRequests.find(r => r.id === id);
    if (req) {
      req.status = status;
      writeDb(db);
    }
  }
  return true;
}

export async function deleteCollabRequestAsync(id: string): Promise<boolean> {
  try {
    await supabase.from('flamebound_collab_requests').delete().eq('id', id);
  } catch (err) {
    console.error('Supabase delete collab request error:', err);
  }

  const db = ensureDb();
  if (db.collabRequests) {
    db.collabRequests = db.collabRequests.filter(r => r.id !== id);
    writeDb(db);
  }
  return true;
}

export async function approveAndPublishCollabRequestAsync(id: string): Promise<Raffle | null> {
  // 1. Fetch collab request
  let collab: CollabRequest | null = null;
  try {
    const { data } = await supabase
      .from('flamebound_collab_requests')
      .select('*')
      .eq('id', id)
      .single();
    if (data) collab = mapDbRowToCollabRequest(data);
  } catch (err) {
    // fallback
  }

  if (!collab) {
    const db = ensureDb();
    collab = db.collabRequests?.find(r => r.id === id) || null;
  }

  if (!collab) return null;

  // 2. Convert and publish as a Live Raffle
  const liveRaffle = await createRaffleAsync({
    title: collab.title,
    project: collab.project,
    slug: collab.slug || `raffle-${Date.now()}`,
    type: 'WL RAFFLE',
    mintStage: collab.mintStage || 'GTD',
    subtitle: collab.subtitle || '',
    description: collab.description || '',
    status: 'live',
    supply: collab.supply,
    nftTotalSupply: collab.nftTotalSupply || '1,000 NFTs',
    mintPrice: collab.mintPrice || 'FREE MINT',
    mintDate: collab.mintDate || 'TBA',
    maxMintPerWallet: collab.maxMintPerWallet || '1 PER WL',
    network: collab.network,
    customNetwork: collab.customNetwork,
    customNetworkLogoUrl: collab.customNetworkLogoUrl,
    walletAddressLabel: collab.walletAddressLabel,
    walletAddressPlaceholder: collab.walletAddressPlaceholder,
    entryMethod: 'raffle',
    artworkType: collab.artworkType || 'genesis',
    logoUrl: collab.logoUrl || '/images/dotset-logo.png',
    bannerUrl: collab.bannerUrl || '/images/dotset-logo.png',
    followUrl: collab.followUrl,
    engageUrl: collab.engageUrl,
    twitterUrl: collab.twitterUrl,
    discordUrl: collab.discordUrl,
    mintUrl: collab.mintUrl,
    notes: collab.notes || `Collab approved from @${collab.requesterTwitter.replace('@', '')}`,
    customTasks: collab.customTasks || [],
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
  });

  // 3. Mark collab status as approved
  await updateCollabRequestStatusAsync(id, 'approved');

  return liveRaffle;
}

// ============================================================================
// CUSTOM CHAINS REGISTRY & PERSISTENCE
// ============================================================================

export const BUILTIN_CHAINS: CustomChain[] = [
  {
    id: 'ethereum',
    name: 'Ethereum (ETH)',
    network: 'ETHEREUM',
    walletAddressLabel: 'Receiving EVM Wallet Address',
    walletAddressPlaceholder: '0x... (Whitelist receiver)',
    isBuiltIn: true,
  },
  {
    id: 'base',
    name: 'Base',
    network: 'BASE',
    walletAddressLabel: 'Receiving Base (EVM) Wallet Address',
    walletAddressPlaceholder: '0x... (Base Address)',
    isBuiltIn: true,
  },
  {
    id: 'polygon',
    name: 'Polygon',
    network: 'POLYGON',
    walletAddressLabel: 'Receiving Polygon (EVM) Wallet Address',
    walletAddressPlaceholder: '0x... (Polygon Address)',
    isBuiltIn: true,
  },
  {
    id: 'robinhood',
    name: 'Robinhood Chain',
    network: 'ROBINHOOD',
    walletAddressLabel: 'Receiving Robinhood Chain Address',
    walletAddressPlaceholder: '0x... (Robinhood Address)',
    isBuiltIn: true,
  },
  {
    id: 'apechain',
    name: 'ApeChain',
    network: 'APECHAIN',
    walletAddressLabel: 'Receiving ApeChain Wallet Address',
    walletAddressPlaceholder: '0x... (ApeChain Address)',
    isBuiltIn: true,
  },
  {
    id: 'arbitrum',
    name: 'Arbitrum',
    network: 'ARBITRUM',
    walletAddressLabel: 'Receiving Arbitrum Wallet Address',
    walletAddressPlaceholder: '0x... (Arbitrum Address)',
    isBuiltIn: true,
  },
  {
    id: 'solana',
    name: 'Solana',
    network: 'SOLANA',
    walletAddressLabel: 'Receiving Solana Wallet Address',
    walletAddressPlaceholder: 'Enter Solana Address (e.g. 7xKX...)',
    isBuiltIn: true,
  },
];

function saveLocalCustomChain(chain: CustomChain) {
  const db = ensureDb();
  if (!db.customChains) db.customChains = [];
  const idx = db.customChains.findIndex(
    c => c.id === chain.id || c.name.toLowerCase() === chain.name.toLowerCase()
  );
  if (idx !== -1) {
    db.customChains[idx] = { ...db.customChains[idx], ...chain };
  } else {
    db.customChains.push(chain);
  }
  writeDb(db);
}

export async function saveCustomChainAsync(chain: {
  id?: string;
  name: string;
  network?: string;
  logoUrl?: string;
  walletAddressLabel?: string;
  walletAddressPlaceholder?: string;
}): Promise<CustomChain> {
  const name = (chain.name || '').trim();
  if (!name) throw new Error('Chain name is required');

  const slug = chain.id || name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const newChain: CustomChain = {
    id: slug || `chain-${Date.now()}`,
    name: name,
    network: chain.network || 'CUSTOM',
    logoUrl: chain.logoUrl || undefined,
    walletAddressLabel: chain.walletAddressLabel || `Receiving ${name} Wallet Address`,
    walletAddressPlaceholder: chain.walletAddressPlaceholder || '0x... (Whitelist receiver)',
    isBuiltIn: false,
    createdAt: new Date().toISOString(),
  };

  try {
    const { data, error } = await supabase
      .from('flamebound_custom_chains')
      .upsert({
        id: newChain.id,
        name: newChain.name,
        network: newChain.network,
        logo_url: newChain.logoUrl,
        wallet_address_label: newChain.walletAddressLabel,
        wallet_address_placeholder: newChain.walletAddressPlaceholder,
        is_builtin: false,
        created_at: newChain.createdAt,
      })
      .select()
      .single();

    if (!error && data) {
      const saved: CustomChain = {
        id: data.id,
        name: data.name,
        network: data.network,
        logoUrl: data.logo_url,
        walletAddressLabel: data.wallet_address_label,
        walletAddressPlaceholder: data.wallet_address_placeholder,
        isBuiltIn: !!data.is_builtin,
        createdAt: data.created_at,
      };
      saveLocalCustomChain(saved);
      return saved;
    }
  } catch (err) {
    // Graceful fallback if table is not yet migrated
  }

  saveLocalCustomChain(newChain);
  return newChain;
}

export async function getCustomChainsAsync(): Promise<CustomChain[]> {
  try {
    const { data, error } = await supabase
      .from('flamebound_custom_chains')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        name: d.name,
        network: d.network || 'CUSTOM',
        logoUrl: d.logo_url,
        walletAddressLabel: d.wallet_address_label,
        walletAddressPlaceholder: d.wallet_address_placeholder,
        isBuiltIn: !!d.is_builtin,
        createdAt: d.created_at,
      }));
    }
  } catch (err) {
    // fallback
  }

  const db = ensureDb();
  return db.customChains || [];
}

export async function getAllAvailableChainsAsync(): Promise<CustomChain[]> {
  const customSaved = await getCustomChainsAsync();
  const raffles = await getRafflesAsync();
  const collabs = await getCollabRequestsAsync();

  const chainMap = new Map<string, CustomChain>();

  // 1. Add Built-in chains
  for (const b of BUILTIN_CHAINS) {
    chainMap.set(b.id.toLowerCase(), b);
    chainMap.set(b.name.toLowerCase(), b);
    chainMap.set(b.network.toLowerCase(), b);
  }

  // 2. Add saved custom chains
  for (const c of customSaved) {
    const key = c.name.toLowerCase();
    if (!chainMap.has(key)) {
      chainMap.set(key, c);
    } else {
      const existing = chainMap.get(key)!;
      if (!existing.logoUrl && c.logoUrl) {
        existing.logoUrl = c.logoUrl;
      }
    }
  }

  // 3. Extract any custom chains used in active or past raffles
  for (const r of raffles) {
    if (r.customNetwork && r.customNetwork.trim()) {
      const name = r.customNetwork.trim();
      const key = name.toLowerCase();
      if (!chainMap.has(key)) {
        const extracted: CustomChain = {
          id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: name,
          network: r.network || 'CUSTOM',
          logoUrl: r.customNetworkLogoUrl,
          walletAddressLabel: r.walletAddressLabel,
          walletAddressPlaceholder: r.walletAddressPlaceholder,
          isBuiltIn: false,
        };
        chainMap.set(key, extracted);
        saveCustomChainAsync(extracted).catch(() => {});
      } else if (r.customNetworkLogoUrl) {
        const existing = chainMap.get(key)!;
        if (!existing.logoUrl) {
          existing.logoUrl = r.customNetworkLogoUrl;
        }
      }
    }
  }

  // 4. Extract any custom chains used in collab requests
  for (const c of collabs) {
    if (c.customNetwork && c.customNetwork.trim()) {
      const name = c.customNetwork.trim();
      const key = name.toLowerCase();
      if (!chainMap.has(key)) {
        const extracted: CustomChain = {
          id: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          name: name,
          network: c.network || 'CUSTOM',
          logoUrl: c.customNetworkLogoUrl,
          walletAddressLabel: c.walletAddressLabel,
          walletAddressPlaceholder: c.walletAddressPlaceholder,
          isBuiltIn: false,
        };
        chainMap.set(key, extracted);
        saveCustomChainAsync(extracted).catch(() => {});
      }
    }
  }

  // Return unique list
  return Array.from(new Set(chainMap.values()));
}

