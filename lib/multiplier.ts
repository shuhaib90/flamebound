export interface MultiplierTier {
  multiplier: number;
  multiplierLabel: string;
  tierName: string;
  badgeColor: string;
  isGuaranteed: boolean;
  tierRank: 'TITAN_WHALE' | 'WHALE' | 'HOLDER' | 'PUBLIC';
  description: string;
}

/**
 * Returns the win multiplier tier and benefits for a given DOTSET NFT balance.
 * 
 * Rules:
 * - Hold 100+ NFTs: 100% Guaranteed Win allocation in every draw / 100x+ weight
 * - Hold 50-99 NFTs: 50x-99x Win Chance multiplier
 * - Hold 1-49 NFTs: 1x-49x Win Chance multiplier (1 ticket per NFT)
 * - Hold 0 NFTs: 1x Base Chance (in public drops)
 */
export function getHolderMultiplier(balance: number = 0): MultiplierTier {
  const count = Math.max(0, Number(balance) || 0);

  if (count >= 100) {
    return {
      multiplier: count,
      multiplierLabel: '100% GUARANTEED WIN',
      tierName: 'TITAN WHALE (100+ NFTS)',
      badgeColor: 'bg-lime text-black border-black',
      isGuaranteed: true,
      tierRank: 'TITAN_WHALE',
      description: 'Holding 100+ DOTSET NFTs grants 100% guaranteed allocation pass in every raffle draw!',
    };
  }

  if (count >= 50) {
    return {
      multiplier: count,
      multiplierLabel: `${count}x WIN CHANCE`,
      tierName: `WHALE BOOST (${count} NFTS)`,
      badgeColor: 'bg-amber-400 text-black border-black',
      isGuaranteed: false,
      tierRank: 'WHALE',
      description: `Holding ${count} NFTs gives you ${count}x weighted tickets during the random draw.`,
    };
  }

  if (count >= 1) {
    return {
      multiplier: count,
      multiplierLabel: `${count}x WIN CHANCE`,
      tierName: `VERIFIED HOLDER (${count} NFT${count > 1 ? 'S' : ''})`,
      badgeColor: 'bg-white text-black border-black',
      isGuaranteed: false,
      tierRank: 'HOLDER',
      description: `Holding ${count} NFT${count > 1 ? 's' : ''} gives you ${count}x weighted ticket${count > 1 ? 's' : ''} during the draw.`,
    };
  }

  return {
    multiplier: 1,
    multiplierLabel: '1x BASE CHANCE',
    tierName: 'PUBLIC PARTICIPANT (0 NFTS)',
    badgeColor: 'bg-gray-100 text-gray-800 border-gray-400',
    isGuaranteed: false,
    tierRank: 'PUBLIC',
    description: 'Holding 0 DOTSET NFTs grants standard 1x entry. Hold DOTSET NFTs to boost odds up to 50x or 100% Guaranteed Win!',
  };
}
