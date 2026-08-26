export type RaffleStatus = 'live' | 'ending_soon' | 'closed' | 'drawing' | 'winners_drawn';

export interface EntryTask {
  id: string;
  title: string;
  description: string;
  type: 'follow' | 'engage' | 'wallet' | 'holder_check';
  buttonLabel: string;
  targetUrl?: string;
  required: boolean;
}

export interface Raffle {
  id: string;
  title: string;
  project: string;
  type: string; // e.g. "WL RAFFLE"
  description: string;
  subtitle: string;
  status: RaffleStatus;
  
  // Whitelist & Mint Details
  supply: number; // e.g. 50 WL SPOTS
  nftTotalSupply?: string | number; // e.g. "1,000 NFTs"
  mintPrice?: string; // e.g. "0.0001 ETH", "FREE MINT"
  mintDate?: string; // e.g. "15 SEP 2026 — 18:00 UTC"
  maxMintPerWallet?: string | number; // e.g. "1 PER WL"
  
  totalEntries: number;
  startDate: string; // ISO string
  endDate: string; // ISO string e.g. "2026-08-25T23:59:00Z"
  network: string; // e.g. "ETHEREUM", "ROBINHOOD NETWORK", "BASE", "SEPOLIA", "POLYGON", "CUSTOM"
  customNetwork?: string;
  contractAddress: string; // Contract address for Flamebound NFTs
  requiredTokenCount: number; // default 1
  
  // Visual Media
  artworkType: 'genesis' | 'cyber_beast' | 'founders_pass' | 'relic' | 'custom';
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
  winners?: Winner[];
  winnerTxHash?: string;
  createdAt: string;
}

export interface Winner {
  rank: number;
  wallet: string;
  shortWallet: string;
  entryNumber: string;
  drawnAt: string;
  txUrl?: string;
}

export interface RaffleEntry {
  id: string; // e.g. "FB-849201"
  raffleId: string;
  walletAddress: string;
  shortAddress: string;
  twitterUsername?: string;
  taskStatus: Record<string, any>;
  isHolder: boolean;
  tokenBalance: number;
  verifiedAt: string;
  status: 'confirmed' | 'disqualified';
  network: string;
  contractAddress?: string;
  metadata?: {
    userAgent?: string;
    ipHash?: string;
    holderVerifiedVia?: string;
  };
}

export interface HolderVerificationResult {
  isHolder: boolean;
  walletAddress: string;
  contractAddress: string;
  network: string;
  tokenBalance: number;
  tokenIds?: string[];
  verifiedOnChain: boolean;
  timestamp: string;
  message: string;
  error?: string;
}

export interface AdminStats {
  totalRaffles: number;
  activeRaffles: number;
  totalEntries: number;
  totalVerifiedHolders: number;
  totalWinnersSelected: number;
}
