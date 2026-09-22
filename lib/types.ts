export type RaffleStatus = 'live' | 'ending_soon' | 'closed' | 'drawing' | 'winners_drawn';
export type MintStage = 'GTD' | 'FCFS' | 'WL' | 'CUSTOM';

export interface CustomTask {
  id: string;
  title: string;
  url: string;
  actionLabel?: string;
  type?: 'link' | 'discord' | 'telegram' | 'twitter' | 'youtube' | 'website' | 'custom';
  required?: boolean;
}

export interface EntryTask {
  id: string;
  title: string;
  description: string;
  type: 'follow' | 'engage' | 'wallet' | 'custom';
  buttonLabel: string;
  targetUrl?: string;
  required: boolean;
}

export interface Raffle {
  id: string;
  slug?: string; // Short clean URL slug e.g. "cult", "justbanners"
  title: string;
  project: string;
  type: string; // e.g. "WL RAFFLE"
  mintStage?: MintStage; // 'GTD' | 'FCFS' | 'WL' | 'CUSTOM'
  description: string;
  subtitle: string;
  status: RaffleStatus;
  
  // Whitelist & Mint Details
  supply: number; // e.g. 50 WL SPOTS
  nftTotalSupply?: string | number; // e.g. "1,000 NFTs"
  mintPrice?: string; // e.g. "0.0001 ETH", "FREE MINT"
  mintDate?: string; // e.g. "15 SEP 2026 — 18:00 UTC"
  maxMintPerWallet?: string | number; // e.g. "1 PER WL"
  
  // Allocation Mode
  entryMethod?: 'raffle' | 'fcfs'; // default 'raffle'
  
  totalEntries: number;
  startDate: string; // ISO string
  endDate: string; // ISO string e.g. "2026-08-25T23:59:00Z"
  network: string; // e.g. "ETHEREUM", "APECHAIN", "BASE", "POLYGON", "ROBINHOOD", "SOLANA", "ARBITRUM", "CUSTOM"
  customNetwork?: string;
  customNetworkLogoUrl?: string; // Custom network/chain logo image URL
  walletAddressLabel?: string; // Custom editable wallet input label (e.g. "Receiving EVM Wallet Address")
  walletAddressPlaceholder?: string; // Custom editable wallet placeholder
  contractAddress?: string;
  
  // Visual Media
  artworkType?: 'genesis' | 'cyber_beast' | 'founders_pass' | 'relic' | 'custom';
  bannerUrl?: string; // Custom uploaded artwork image
  logoUrl?: string; // Custom uploaded project logo
  
  // Task URLs & Links
  followUrl?: string; // Custom Follow Task URL
  engageUrl?: string; // Custom Comment / Tweet Engagement URL
  twitterUrl?: string;
  discordUrl?: string;
  mintUrl?: string;
  notes?: string;

  tasks?: EntryTask[];
  customTasks?: CustomTask[];
  winners?: Winner[];
  winnerTxHash?: string;
  createdAt: string;
}

export interface Winner {
  rank: number;
  wallet: string;
  shortWallet: string;
  entryNumber: string;
  twitterUsername?: string;
  drawnAt: string;
  txUrl?: string;
}

export interface RaffleEntry {
  id: string; // e.g. "FB-849201"
  raffleId: string;
  walletAddress: string;
  shortAddress: string;
  twitterUsername?: string;
  taskStatus?: Record<string, any>;
  isHolder?: boolean;
  tokenBalance?: number;
  verifiedAt: string;
  status: 'confirmed' | 'disqualified';
  network?: string;
  contractAddress?: string;
  metadata?: {
    userAgent?: string;
    ipHash?: string;
    entryMethod?: string;
    isFcfsWinner?: boolean;
    [key: string]: any;
  };
}

export interface AdminStats {
  totalRaffles: number;
  activeRaffles: number;
  totalEntries: number;
  totalWinnersSelected: number;
}

export interface HolderVerificationResult {
  isHolder: boolean;
  walletAddress: string;
  contractAddress?: string;
  network?: string;
  tokenBalance?: number;
  tokenIds?: string[];
  verifiedOnChain?: boolean;
  timestamp?: string;
  message?: string;
  error?: string;
}

export interface CollabRequest {
  id: string;
  project: string;
  title: string;
  slug?: string;
  supply: number;
  mintStage?: MintStage;
  network: string;
  customNetwork?: string;
  customNetworkLogoUrl?: string;
  walletAddressLabel?: string;
  walletAddressPlaceholder?: string;
  subtitle?: string;
  description?: string;
  nftTotalSupply?: string | number;
  mintPrice?: string;
  mintDate?: string;
  maxMintPerWallet?: string | number;
  logoUrl?: string;
  bannerUrl?: string;
  artworkType?: 'genesis' | 'cyber_beast' | 'founders_pass' | 'relic' | 'custom';
  followUrl?: string;
  engageUrl?: string;
  twitterUrl?: string;
  discordUrl?: string;
  mintUrl?: string;
  notes?: string;
  customTasks?: CustomTask[];
  requesterTwitter: string;
  requesterTelegram: string;
  requesterEmail?: string;
  requesterDiscord?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  updatedAt?: string;
}

