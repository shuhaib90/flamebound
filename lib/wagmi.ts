'use client';

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http, defineChain } from 'viem';
import { mainnet, base, sepolia, polygon, arbitrum } from 'viem/chains';

// Robinhood Network / Chain Configuration
export const robinhoodChain = defineChain({
  id: 13371,
  name: 'Robinhood Chain',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: {
      http: ['https://robinhood-mainnet.g.alchemy.com/v2/alch_008u8jC_qTSIJvqgLbdGY'],
    },
  },
  blockExplorers: {
    default: { name: 'Explorer', url: 'https://etherscan.io' },
  },
});

export const ADMIN_WALLET = '0x8B7a0A0CA2B05319d27E70Df91D106bfe8fF05fb';

export function isAdminWallet(address?: string | null): boolean {
  if (!address) return false;
  return address.toLowerCase() === ADMIN_WALLET.toLowerCase();
}

export const wagmiConfig = getDefaultConfig({
  appName: 'FLAMEBOUND Whitelist Raffles',
  projectId: '3fcc6bba6f1de962d911bb5b5c3dba68', // Public WalletConnect project ID
  chains: [mainnet, robinhoodChain, base, sepolia, polygon, arbitrum],
  transports: {
    [mainnet.id]: http('https://robinhood-mainnet.g.alchemy.com/v2/alch_008u8jC_qTSIJvqgLbdGY'),
    [robinhoodChain.id]: http('https://robinhood-mainnet.g.alchemy.com/v2/alch_008u8jC_qTSIJvqgLbdGY'),
    [base.id]: http('https://mainnet.base.org'),
    [sepolia.id]: http('https://rpc.sepolia.org'),
    [polygon.id]: http('https://polygon-rpc.com'),
    [arbitrum.id]: http('https://arb1.arbitrum.io/rpc'),
  },
  ssr: true,
});
