'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/lib/wallet-context';
import { Raffle, RaffleEntry, Winner } from '@/lib/types';
import { formatAddress, FLAMEBOUND_PRIMARY_CONTRACT } from '@/lib/blockchain';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  X, 
  Trophy, 
  Flame, 
  ShieldCheck, 
  ExternalLink, 
  Copy, 
  Check, 
  Layers, 
  Sparkles, 
  Wallet, 
  RefreshCw,
  Crown
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const { address, shortAddress, isConnected, holderStatus, isVerifyingHolder, checkHolderEligibility } = useWallet();
  const [activeTab, setActiveTab] = useState<'holdings' | 'entries' | 'wins'>('holdings');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userEntries, setUserEntries] = useState<RaffleEntry[]>([]);
  const [userWins, setUserWins] = useState<{ raffle: Raffle; winner: Winner }[]>([]);
  const [allRaffles, setAllRaffles] = useState<Raffle[]>([]);

  useEffect(() => {
    if (isOpen && address) {
      fetchUserData();
    }
  }, [isOpen, address]);

  const fetchUserData = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const [rafflesRes, entriesRes] = await Promise.all([
        fetch('/api/raffles'),
        fetch('/api/admin/entries'),
      ]);

      const rafflesData = await rafflesRes.json();
      const entriesData = await entriesRes.json();

      if (rafflesData.success) {
        setAllRaffles(rafflesData.raffles);
        // Find won raffles
        const wins: { raffle: Raffle; winner: Winner }[] = [];
        const normAddr = address.toLowerCase();

        rafflesData.raffles.forEach((r: Raffle) => {
          if (r.winners && Array.isArray(r.winners)) {
            const found = r.winners.find(w => w.wallet.toLowerCase() === normAddr);
            if (found) {
              wins.push({ raffle: r, winner: found });
            }
          }
        });
        setUserWins(wins);
      }

      if (entriesData.success && Array.isArray(entriesData.entries)) {
        const normAddr = address.toLowerCase();
        const myEntries = entriesData.entries.filter(
          (e: RaffleEntry) => e.walletAddress.toLowerCase() === normAddr
        );
        setUserEntries(myEntries);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const balance = holderStatus?.tokenBalance || 0;

  // Determine Holding Tier
  const getTierInfo = (count: number) => {
    if (count >= 10) return { title: 'ELDER FLAME WHALE', badge: '👑 VIP TIER', color: 'bg-black text-lime border-lime' };
    if (count >= 6) return { title: 'FLAMEBOUND TITAN', badge: '★★★ TIER 3', color: 'bg-black text-lime border-white' };
    if (count >= 3) return { title: 'INFERNO LORD', badge: '★★ TIER 2', color: 'bg-lime text-black border-black' };
    if (count >= 1) return { title: 'FLAME KEEPER', badge: '★ TIER 1', color: 'bg-white text-black border-black' };
    return { title: 'NON-HOLDER', badge: 'UNVERIFIED', color: 'bg-gray-200 text-gray-700 border-black' };
  };

  const tier = getTierInfo(balance);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 select-none overflow-y-auto w-full">
      <div className="bg-white border-3 sm:border-4 border-black shadow-none sm:shadow-pixel-xl w-full max-w-[96vw] sm:max-w-2xl my-auto relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Header */}
        <div className="bg-lime border-b-3 sm:border-b-4 border-black p-3 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="/images/flamebound-logo.png"
              alt="Flamebound"
              className="w-10 h-10 object-contain drop-shadow-sm"
            />
            <div>
              <span className="font-pixel text-[10px] bg-black text-lime px-2 py-0.5 font-bold uppercase block w-fit">
                USER PROFILE
              </span>
              <h2 className="font-pixel text-base sm:text-lg text-black font-bold uppercase mt-0.5">
                FLAMEBOUND PASSPORT
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 border-2 border-black bg-black text-lime hover:bg-white hover:text-black transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto font-mono text-xs">
          
          {/* Wallet Info Card */}
          {!isConnected || !address ? (
            <div className="bg-lime/20 border-3 border-black p-6 text-center space-y-3 shadow-pixel-sm">
              <p className="font-pixel text-xs text-black uppercase font-bold">
                CONNECT YOUR EVM WALLET TO VIEW YOUR ENTRIES & HOLDER TIER
              </p>
              <div className="flex justify-center pt-2">
                <ConnectButton />
              </div>
            </div>
          ) : (
            <>
              {/* Connected User Overview */}
              <div className="bg-black text-lime border-4 border-black p-4 sm:p-5 shadow-pixel-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b-2 border-lime/30 pb-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-gray-300 block font-bold">CONNECTED WALLET:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs sm:text-sm font-bold text-white select-all break-all">
                        {address}
                      </span>
                      <button
                        onClick={copyAddress}
                        className="p-1 bg-lime text-black border border-black hover:bg-white transition-colors shrink-0"
                        title="Copy Address"
                      >
                        {copied ? <Check size={12} /> : <Copy size={12} />}
                      </button>
                    </div>
                  </div>

                  <div className={`px-3 py-1.5 border-2 font-pixel text-[10px] uppercase font-bold self-start sm:self-auto ${tier.color}`}>
                    {tier.badge}
                  </div>
                </div>

                {/* Holdings & Tier Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="bg-lime/10 border-2 border-lime/40 p-2">
                    <span className="text-[9px] text-gray-300 block font-bold">NFT HOLDINGS</span>
                    <span className="font-pixel text-base text-lime font-bold mt-0.5 block">{balance} NFT</span>
                  </div>

                  <div className="bg-lime/10 border-2 border-lime/40 p-2">
                    <span className="text-[9px] text-gray-300 block font-bold">HOLDER TIER</span>
                    <span className="font-pixel text-[10px] text-white font-bold mt-1 block truncate">{tier.title}</span>
                  </div>

                  <div className="bg-lime/10 border-2 border-lime/40 p-2">
                    <span className="text-[9px] text-gray-300 block font-bold">ENTERED</span>
                    <span className="font-pixel text-base text-white font-bold mt-0.5 block">{userEntries.length}</span>
                  </div>

                  <div className="bg-lime/10 border-2 border-lime/40 p-2">
                    <span className="text-[9px] text-gray-300 block font-bold">WON WHITELISTS</span>
                    <span className="font-pixel text-base text-lime font-bold mt-0.5 block">{userWins.length}</span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b-3 border-black gap-2">
                <button
                  onClick={() => setActiveTab('holdings')}
                  className={`px-3 py-2 font-pixel text-[10px] border-2 border-black uppercase font-bold flex items-center gap-1.5 ${
                    activeTab === 'holdings' ? 'bg-black text-lime shadow-pixel-xs' : 'bg-white text-black hover:bg-black/10'
                  }`}
                >
                  <Flame size={12} />
                  <span>HOLDINGS & PERKS</span>
                </button>

                <button
                  onClick={() => setActiveTab('entries')}
                  className={`px-3 py-2 font-pixel text-[10px] border-2 border-black uppercase font-bold flex items-center gap-1.5 ${
                    activeTab === 'entries' ? 'bg-black text-lime shadow-pixel-xs' : 'bg-white text-black hover:bg-black/10'
                  }`}
                >
                  <Layers size={12} />
                  <span>ENTERED RAFFLES ({userEntries.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('wins')}
                  className={`px-3 py-2 font-pixel text-[10px] border-2 border-black uppercase font-bold flex items-center gap-1.5 ${
                    activeTab === 'wins' ? 'bg-black text-lime shadow-pixel-xs' : 'bg-white text-black hover:bg-black/10'
                  }`}
                >
                  <Trophy size={12} />
                  <span>WON WHITELISTS ({userWins.length})</span>
                </button>
              </div>

              {/* TAB 1: HOLDINGS & TIER PERKS */}
              {activeTab === 'holdings' && (
                <div className="space-y-4">
                  <div className="bg-white border-3 border-black p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-pixel text-xs text-black font-bold uppercase">
                        ON-CHAIN VERIFIED HOLDINGS
                      </h3>
                      <button
                        onClick={() => checkHolderEligibility()}
                        disabled={isVerifyingHolder}
                        className="pixel-btn text-[9px] py-1 px-2.5 flex items-center gap-1"
                      >
                        <RefreshCw size={11} className={isVerifyingHolder ? 'animate-spin' : ''} />
                        <span>{isVerifyingHolder ? 'CHECKING...' : 'RE-VERIFY'}</span>
                      </button>
                    </div>

                    {balance > 0 ? (
                      <div className="bg-lime/20 border-2 border-black p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-black">Flamebound Collection Balance:</span>
                          <span className="font-pixel text-sm text-black font-bold">{balance} NFT(s)</span>
                        </div>
                        <p className="text-[11px] text-gray-700">
                          Your wallet is 100% eligible for all live and upcoming Flamebound partner & genesis whitelist raffles.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-red-50 border-2 border-red-700 p-3 space-y-2">
                        <p className="text-red-900 font-bold text-xs">
                          No Flamebound NFTs currently detected in this wallet.
                        </p>
                        <p className="text-gray-700 text-[11px]">
                          Purchase a Flamebound NFT on OpenSea to unlock instant guaranteed entry to holder-only raffles.
                        </p>
                        <a
                          href="https://opensea.io/collection/flamebound-259045050"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 pixel-btn text-[10px] py-1.5 px-3 mt-1"
                        >
                          <span>[BUY ON OPENSEA ↗]</span>
                        </a>
                      </div>
                    )}

                    <div className="pt-2 border-t border-black/20 text-[11px] text-gray-700 flex justify-between items-center">
                      <span>Contract: {formatAddress(FLAMEBOUND_PRIMARY_CONTRACT)}</span>
                      <a
                        href={`https://etherscan.io/address/${FLAMEBOUND_PRIMARY_CONTRACT}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-black font-bold flex items-center gap-1"
                      >
                        <span>Etherscan</span>
                        <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ENTERED RAFFLES */}
              {activeTab === 'entries' && (
                <div className="space-y-3">
                  {userEntries.length === 0 ? (
                    <div className="bg-white border-3 border-black p-6 text-center text-gray-700 font-pixel text-[10px]">
                      YOU HAVE NOT ENTERED ANY RAFFLES YET.
                    </div>
                  ) : (
                    userEntries.map((entry) => {
                      const raffle = allRaffles.find(r => r.id === entry.raffleId);
                      return (
                        <div key={entry.id} className="bg-white border-3 border-black p-3.5 flex items-center justify-between gap-3 shadow-pixel-xs">
                          <div>
                            <span className="font-pixel text-[9px] bg-black text-lime px-2 py-0.5 font-bold uppercase">
                              {raffle?.project || 'FLAMEBOUND'}
                            </span>
                            <h4 className="font-pixel text-xs font-bold text-black uppercase mt-1">
                              {raffle?.title || entry.raffleId}
                            </h4>
                            <span className="text-[10px] text-gray-600 block mt-0.5 font-mono">
                              Entered: {new Date(entry.verifiedAt).toLocaleDateString()}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-pixel text-xs font-bold text-black block">
                              {entry.id}
                            </span>
                            <span className="font-pixel text-[8px] bg-lime text-black px-1.5 py-0.5 border border-black font-bold inline-block mt-1">
                              ✓ CONFIRMED
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {/* TAB 3: WON WHITELISTS */}
              {activeTab === 'wins' && (
                <div className="space-y-3">
                  {userWins.length === 0 ? (
                    <div className="bg-white border-3 border-black p-6 text-center text-gray-700 font-pixel text-[10px]">
                      NO WHITELIST WINS YET. ENTER LIVE RAFFLES TO WIN ALLOCATIONS!
                    </div>
                  ) : (
                    userWins.map(({ raffle, winner }) => (
                      <div key={raffle.id} className="bg-black text-lime border-4 border-black p-4 flex items-center justify-between gap-3 shadow-pixel-sm">
                        <div>
                          <div className="flex items-center gap-2">
                            <Trophy size={16} className="text-lime" />
                            <span className="font-pixel text-[10px] bg-lime text-black px-2 py-0.5 font-bold uppercase">
                              ★ WINNER (RANK #{winner.rank})
                            </span>
                          </div>
                          <h4 className="font-pixel text-sm font-bold text-white uppercase mt-1.5">
                            {raffle.title}
                          </h4>
                          <span className="text-[10px] text-gray-300 font-mono block mt-0.5">
                            Spot Allocation: {raffle.maxMintPerWallet || '1 PER WL'} • [{raffle.network}]
                          </span>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="font-pixel text-[9px] text-lime font-bold block">
                            {winner.entryNumber}
                          </span>
                          <span className="font-pixel text-[8px] bg-white text-black px-2 py-0.5 border border-black font-bold block mt-1">
                            GUARANTEED WL
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}

        </div>

      </div>
    </div>
  );
}
