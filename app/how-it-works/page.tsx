'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useWallet } from '@/lib/wallet-context';
import { getHolderMultiplier } from '@/lib/multiplier';
import { 
  ArrowLeft, 
  Crown, 
  Zap, 
  ShieldCheck, 
  Flame, 
  ExternalLink, 
  Trophy, 
  CheckCircle2, 
  Calculator, 
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HowItWorksPage() {
  const { isConnected, address, holderStatus } = useWallet();
  const [testBalance, setTestBalance] = useState<number>(holderStatus?.tokenBalance || 1);

  const balance = Math.max(0, Number(testBalance) || 0);
  const currentTier = getHolderMultiplier(balance);

  const userBalance = holderStatus?.tokenBalance || 0;
  const liveUserTier = getHolderMultiplier(userBalance);

  return (
    <div className="min-h-screen flex flex-col bg-lime selection:bg-black selection:text-lime">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b-4 border-black pb-4">
          <Link
            href="/#active-raffles"
            className="pixel-btn text-[10px] sm:text-xs py-2 px-3 sm:px-4 flex items-center gap-1.5 shadow-pixel"
          >
            <ArrowLeft size={14} />
            <span>[← ALL RAFFLES]</span>
          </Link>

          <div className="flex items-center gap-2">
            <a
              href="https://opensea.io/collection/flamebound-259045050"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-black text-lime hover:bg-white hover:text-black py-2 px-3 sm:px-4 border-3 border-black font-pixel text-[10px] sm:text-xs font-bold transition-colors flex items-center gap-1.5 shadow-pixel-sm"
            >
              <span>[BUY ON OPENSEA]</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Hero Section */}
        <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-pixel-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-black pb-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-black text-lime px-3 py-1 font-pixel text-[10px] uppercase font-bold mb-2">
                <Sparkles size={13} />
                <span>FLAMEBOUND PROVABLE MULTIPLIER ENGINE</span>
              </div>
              <h1 className="font-pixel text-2xl sm:text-4xl text-black font-extrabold uppercase tracking-tight">
                HOW HOLDER MULTIPLIERS WORK
              </h1>
            </div>

            {/* Quick Live Wallet Status */}
            {isConnected && (
              <div className="bg-lime/30 border-3 border-black p-3 font-mono text-xs shrink-0 space-y-1">
                <span className="text-[9px] font-pixel text-gray-700 block font-bold">YOUR WALLET STATUS:</span>
                <span className="font-bold text-black block">{userBalance} Flamebound NFT(s) Held</span>
                <span className={`font-pixel text-[10px] px-2 py-0.5 border border-black font-bold inline-block ${
                  liveUserTier.tierRank === 'TITAN_WHALE' 
                    ? 'bg-lime text-black' 
                    : liveUserTier.tierRank === 'WHALE'
                    ? 'bg-amber-400 text-black'
                    : 'bg-black text-lime'
                }`}>
                  [{liveUserTier.multiplierLabel}]
                </span>
              </div>
            )}
          </div>

          <p className="font-mono text-sm sm:text-base text-gray-800 font-bold leading-relaxed max-w-4xl">
            Flamebound rewards long-term believers and community holders. Every single Flamebound NFT you hold in your Web3 wallet directly multiplies your winning probability across all whitelist raffles, first-come first-served drops, and partner allocations.
          </p>
        </div>

        {/* 3 Main Holding Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* TIER 1: 1 - 49 NFTS */}
          <div className="bg-white border-4 border-black p-6 shadow-pixel flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-pixel text-xs bg-black text-white px-2 py-1 font-bold">
                  TIER 01: PIONEER
                </span>
                <ShieldCheck size={20} className="text-black" />
              </div>
              
              <div className="space-y-1">
                <span className="font-pixel text-2xl text-black font-bold block">1x - 49x</span>
                <span className="font-pixel text-[10px] text-gray-600 block font-bold">WIN CHANCE MULTIPLIER</span>
              </div>

              <div className="bg-lime/20 border-2 border-black p-3 font-mono text-xs space-y-1 font-bold">
                <div>• <strong>Hold Requirement:</strong> 1 to 49 NFTs</div>
                <div>• <strong>Draw Weight:</strong> 1 ticket per NFT held</div>
                <div>• <strong>Example:</strong> Hold 10 NFTs = 10x Draw Chance</div>
              </div>

              <p className="font-mono text-xs text-gray-700 leading-relaxed">
                Entry tickets are linearly multiplied for every Flamebound NFT in your wallet, giving you stronger odds against standard public entrants.
              </p>
            </div>

            <div className="pt-3 border-t-2 border-black/20 font-pixel text-[9px] text-black font-bold">
              [STANDARD HOLDER PRIORITY]
            </div>
          </div>

          {/* TIER 2: 50 - 99 NFTS */}
          <div className="bg-white border-4 border-black p-6 shadow-pixel flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-black pb-2">
                <span className="font-pixel text-xs bg-amber-400 text-black px-2 py-1 font-bold border border-black">
                  TIER 02: WHALE
                </span>
                <Zap size={20} className="text-amber-500 fill-amber-500" />
              </div>
              
              <div className="space-y-1">
                <span className="font-pixel text-2xl text-black font-bold block">50x - 99x</span>
                <span className="font-pixel text-[10px] text-gray-600 block font-bold">HIGH-WEIGHT MULTIPLIER</span>
              </div>

              <div className="bg-amber-100 border-2 border-black p-3 font-mono text-xs space-y-1 font-bold">
                <div>• <strong>Hold Requirement:</strong> 50 to 99 NFTs</div>
                <div>• <strong>Draw Weight:</strong> 50 - 99 tickets</div>
                <div>• <strong>Example:</strong> Hold 50 NFTs = 50x Win Boost</div>
              </div>

              <p className="font-mono text-xs text-gray-700 leading-relaxed">
                Whales holding 50+ NFTs receive massive statistical priority in every provably fair raffle draw with 50x to 99x weighted tickets.
              </p>
            </div>

            <div className="pt-3 border-t-2 border-black/20 font-pixel text-[9px] text-amber-700 font-bold">
              [WHALE TIER BOOST ACTIVATED]
            </div>
          </div>

          {/* TIER 3: 100+ NFTS (100% GUARANTEED WIN) */}
          <div className="bg-black text-lime border-4 border-black p-6 shadow-pixel flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b-2 border-lime/30 pb-2">
                <span className="font-pixel text-xs bg-lime text-black px-2 py-1 font-bold">
                  TIER 03: TITAN
                </span>
                <Crown size={22} className="text-lime fill-lime" />
              </div>
              
              <div className="space-y-1">
                <span className="font-pixel text-2xl text-lime font-bold block">100% AUTO-WIN</span>
                <span className="font-pixel text-[10px] text-white block font-bold">GUARANTEED SPOT ALLOCATION</span>
              </div>

              <div className="bg-white/10 border-2 border-lime p-3 font-mono text-xs space-y-1 font-bold text-white">
                <div>• <strong>Hold Requirement:</strong> 100+ NFTs</div>
                <div>• <strong>Draw Privilege:</strong> Automatic Winner Pass</div>
                <div>• <strong>Guarantee:</strong> 100% Spot in Every Draw</div>
              </div>

              <p className="font-mono text-xs text-gray-300 leading-relaxed">
                Holding 100 or more Flamebound NFTs bypasses the random draw completely — your wallet automatically secures a guaranteed winning whitelist spot on every drop.
              </p>
            </div>

            <div className="pt-3 border-t-2 border-lime/30 font-pixel text-[9px] text-lime font-bold">
              [👑 100% GUARANTEED ALLOCATION]
            </div>
          </div>

        </div>

        {/* Interactive Multiplier Calculator */}
        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-pixel-lg space-y-6">
          <div className="flex items-center gap-2 border-b-3 border-black pb-3">
            <Calculator size={22} className="text-black" />
            <h2 className="font-pixel text-lg sm:text-xl text-black font-extrabold uppercase">
              INTERACTIVE WIN CHANCE CALCULATOR
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Input Controls (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              <label className="block font-pixel text-xs text-black font-bold uppercase">
                ENTER YOUR FLAMEBOUND NFT COUNT:
              </label>

              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={testBalance}
                  onChange={(e) => setTestBalance(Math.max(0, parseInt(e.target.value) || 0))}
                  className="bg-lime/20 border-3 border-black p-3 font-mono text-xl font-bold text-black outline-none w-32 text-center"
                />
                <span className="font-pixel text-xs text-black font-bold">NFTS HELD</span>
              </div>

              {/* Quick Preset Buttons */}
              <div className="space-y-1.5">
                <span className="font-pixel text-[9px] text-gray-600 uppercase font-bold block">
                  QUICK PRESETS:
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setTestBalance(1)}
                    className="pixel-btn text-[9px] py-1.5 px-2.5 font-bold"
                  >
                    [1 NFT (1x)]
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestBalance(10)}
                    className="pixel-btn text-[9px] py-1.5 px-2.5 font-bold"
                  >
                    [10 NFTS (10x)]
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestBalance(50)}
                    className="pixel-btn text-[9px] py-1.5 px-2.5 font-bold bg-amber-400 text-black"
                  >
                    [50 NFTS (50x WHALE)]
                  </button>
                  <button
                    type="button"
                    onClick={() => setTestBalance(100)}
                    className="pixel-btn text-[9px] py-1.5 px-2.5 font-bold bg-black text-lime"
                  >
                    [100 NFTS (👑 100% GTD)]
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Tier Output Card (6 cols) */}
            <div className="lg:col-span-6">
              <div className={`border-4 border-black p-5 sm:p-6 shadow-pixel space-y-3 ${
                currentTier.tierRank === 'TITAN_WHALE'
                  ? 'bg-black text-lime'
                  : currentTier.tierRank === 'WHALE'
                  ? 'bg-amber-400 text-black'
                  : currentTier.tierRank === 'HOLDER'
                  ? 'bg-lime text-black'
                  : 'bg-white text-black'
              }`}>
                <div className="flex justify-between items-center border-b-2 border-black/30 pb-2 font-pixel text-[10px] font-bold">
                  <span>SIMULATED TIER STATUS:</span>
                  <span>[{currentTier.tierName}]</span>
                </div>

                <div className="space-y-1">
                  <span className="font-pixel text-3xl sm:text-4xl font-extrabold block">
                    {currentTier.multiplierLabel}
                  </span>
                  <span className="font-mono text-xs font-bold block">
                    {currentTier.isGuaranteed 
                      ? '👑 Instant Auto-Win in Every Whitelist Draw' 
                      : `Draw Weight: ${currentTier.multiplier} Tickets in Pool`}
                  </span>
                </div>

                <p className="font-mono text-xs leading-relaxed pt-2 border-t border-black/20">
                  {currentTier.description}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* How It Applies Across All Drop Types */}
        <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-pixel-lg space-y-6">
          <div className="flex items-center gap-2 border-b-3 border-black pb-3">
            <Trophy size={22} className="text-black" />
            <h2 className="font-pixel text-lg sm:text-xl text-black font-extrabold uppercase">
              MULTIPLIER RULES ACROSS RAFFLE MODES
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            
            {/* Public Drops */}
            <div className="border-3 border-black p-4 bg-lime/10 space-y-2">
              <span className="font-pixel text-xs text-black font-bold block bg-white px-2 py-1 border border-black">
                [PUBLIC / OPEN RAFFLES]
              </span>
              <p className="font-bold text-gray-800 leading-relaxed">
                Open to all users worldwide without holding requirements (0 NFTs = 1x Base Chance). If you hold Flamebound NFTs in your connected wallet, your entries automatically jump to 1x - 50x or 100% Guaranteed Win!
              </p>
            </div>

            {/* Minters Drops */}
            <div className="border-3 border-black p-4 bg-lime/10 space-y-2">
              <span className="font-pixel text-xs text-black font-bold block bg-lime px-2 py-1 border border-black">
                [MINTERS ONLY RAFFLES]
              </span>
              <p className="font-bold text-gray-800 leading-relaxed">
                Restricted strictly to verified on-chain Flamebound NFT minters. Your verified mint count dictates your multiplier and weight during winner draws.
              </p>
            </div>

            {/* Holders Only Drops */}
            <div className="border-3 border-black p-4 bg-lime/10 space-y-2">
              <span className="font-pixel text-xs text-black font-bold block bg-black text-white px-2 py-1 border border-black">
                [HOLDERS ONLY RAFFLES]
              </span>
              <p className="font-bold text-gray-800 leading-relaxed">
                Exclusive VIP allocations for current Flamebound NFT holders. 100+ holders secure guaranteed spots; 50-99 holders receive 50x-99x weighted tickets.
              </p>
            </div>

          </div>
        </div>

        {/* CTA Footer Banner */}
        <div className="bg-black text-lime border-4 border-black p-6 sm:p-10 shadow-pixel-lg text-center space-y-5">
          <h3 className="font-pixel text-xl sm:text-3xl text-white font-extrabold uppercase">
            BOOST YOUR WINNING PROBABILITY TODAY
          </h3>
          <p className="font-mono text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto font-bold">
            Hold 1 to 50 NFTs for multiplied tickets or acquire 100+ Flamebound NFTs to lock in 100% guaranteed whitelist winner status for every future partner allocation drop.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <a
              href="https://opensea.io/collection/flamebound-259045050"
              target="_blank"
              rel="noopener noreferrer"
              className="pixel-btn-white text-xs sm:text-sm py-3.5 px-6 w-full sm:w-auto font-bold flex items-center justify-center gap-2"
            >
              <span>[BUY FLAMEBOUND ON OPENSEA]</span>
              <ExternalLink size={15} />
            </a>

            <Link
              href="/#active-raffles"
              className="pixel-btn text-xs sm:text-sm py-3.5 px-6 w-full sm:w-auto font-bold flex items-center justify-center gap-2"
            >
              <span>[EXPLORE LIVE RAFFLES]</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
