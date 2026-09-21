'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAccount, useDisconnect, useChainId } from 'wagmi';
import { formatAddress, DOTSET_PRIMARY_CONTRACT } from './blockchain';
import { HolderVerificationResult } from './types';
import { ADMIN_WALLET, isAdminWallet } from './wagmi';

interface WalletContextType {
  address: string | null;
  shortAddress: string;
  isConnected: boolean;
  isAdmin: boolean;
  network: string;
  holderStatus: HolderVerificationResult | null;
  isVerifyingHolder: boolean;
  disconnect: () => void;
  checkHolderEligibility: (contractAddress?: string, chainNetwork?: string) => Promise<HolderVerificationResult | null>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const { address: wagmiAddress, isConnected: wagmiIsConnected } = useAccount();
  const { disconnect: wagmiDisconnect } = useDisconnect();
  const chainId = useChainId();

  const [holderStatus, setHolderStatus] = useState<HolderVerificationResult | null>(null);
  const [isVerifyingHolder, setIsVerifyingHolder] = useState<boolean>(false);

  const address = wagmiAddress || null;
  const isConnected = Boolean(wagmiIsConnected && wagmiAddress);
  const isAdmin = isAdminWallet(address);

  // Automatically check holder eligibility when connected wallet changes
  useEffect(() => {
    if (address) {
      checkHolderEligibility();
    } else {
      setHolderStatus(null);
    }
  }, [address]);

  const disconnect = () => {
    wagmiDisconnect();
    setHolderStatus(null);
  };

  const checkHolderEligibility = async (contractAddress?: string, chainNetwork?: string): Promise<HolderVerificationResult | null> => {
    if (!address) return null;
    setIsVerifyingHolder(true);

    try {
      const res = await fetch('/api/verify-holder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          contractAddress: contractAddress || DOTSET_PRIMARY_CONTRACT,
          network: chainNetwork || 'ROBINHOOD NETWORK',
        }),
      });

      const data = await res.json();
      if (data.success && data.verification) {
        setHolderStatus(data.verification);
        return data.verification;
      }
      return null;
    } catch (err) {
      console.error('Failed to verify holder status:', err);
      return null;
    } finally {
      setIsVerifyingHolder(false);
    }
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        shortAddress: address ? formatAddress(address) : '',
        isConnected,
        isAdmin,
        network: 'ROBINHOOD / ETHEREUM',
        holderStatus,
        isVerifyingHolder,
        disconnect,
        checkHolderEligibility,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
