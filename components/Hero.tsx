'use client';

import React from 'react';
import Link from 'next/link';
import { PixelFlame } from './PixelFlame';
import { Flame, ShieldCheck, ExternalLink, ArrowDown } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 border-b-4 border-black select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Status Indicator & Transparent Official Logo */}
        <div className="flex flex-col items-center justify-center mb-6 gap-3">
          <img
            src="/images/flamebound-logo.png"
            alt="Flamebound Official Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain hover:scale-105 transition-transform drop-shadow-md"
          />
          <div className="inline-flex items-center gap-2.5 bg-black text-lime px-4 py-2 border-3 border-black shadow-pixel-sm">
            <span className="w-2.5 h-2.5 bg-lime inline-block border border-black animate-pulse" />
            <span className="font-pixel text-[11px] sm:text-xs tracking-wider uppercase font-bold">
              OFFICIAL WL RAFFLE PORTAL
            </span>
          </div>
        </div>

        {/* Large Pixel Heading */}
        <div className="text-center space-y-3 mb-8">
          <h1 className="font-pixel text-3xl sm:text-5xl md:text-6xl lg:text-7xl text-black tracking-tight leading-tight uppercase font-extrabold">
            FLAMEBOUND<br />
            <span className="inline-block mt-2 text-black bg-white px-4 py-1 border-4 border-black shadow-pixel">
              WL RAFFLES
            </span>
          </h1>

          <p className="font-mono text-sm sm:text-base md:text-lg text-black max-w-2xl mx-auto pt-4 leading-relaxed font-bold">
            Earn your spot. Verify minter eligibility on-chain. Enter live partner & genesis whitelist allocations.
          </p>
        </div>

        {/* Action Buttons with OpenSea Link */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <a
            href="#active-raffles"
            className="pixel-btn text-xs sm:text-sm py-4 px-8 w-full sm:w-auto shadow-pixel-lg flex items-center justify-center gap-3"
          >
            <span>[ENTER LIVE RAFFLES]</span>
            <ArrowDown size={16} className="animate-bounce" />
          </a>

          {/* Official OpenSea Collection Button */}
          <a
            href="https://opensea.io/collection/flamebound-259045050"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black hover:bg-black hover:text-lime border-4 border-black font-pixel text-xs sm:text-sm py-3.5 px-6 w-full sm:w-auto shadow-pixel-lg flex items-center justify-center gap-2.5 transition-colors font-bold"
          >
            <span>[BUY ON OPENSEA]</span>
            <ExternalLink size={16} />
          </a>

          <Link
            href="/how-it-works"
            className="pixel-btn-white text-xs sm:text-sm py-4 px-6 w-full sm:w-auto shadow-pixel-lg flex items-center justify-center gap-2"
          >
            <span>[HOW IT WORKS]</span>
          </Link>
        </div>

        {/* 8-Bit Marquee Ticker */}
        <div className="mt-14 border-3 border-black bg-black text-lime py-2.5 overflow-hidden shadow-pixel-sm">
          <div className="animate-marquee font-pixel text-[10px] sm:text-xs flex gap-8 whitespace-nowrap uppercase font-bold">
            <span>★ FLAMEBOUND WHITELIST RAFFLES LIVE</span>
            <span>■ 100% ON-CHAIN MINTER VERIFICATION</span>
            <span>★ GUARANTEED MINT ALLOCATIONS</span>
            <span>■ PROVABLY FAIR WINNER SELECTION</span>
            <span>★ OFFICIAL OPENSEA COLLECTION VERIFIED</span>
            <span>■ FLAMEBOUND WHITELIST RAFFLES LIVE</span>
            <span>★ 100% ON-CHAIN MINTER VERIFICATION</span>
            <span>■ GUARANTEED MINT ALLOCATIONS</span>
            <span>★ PROVABLY FAIR WINNER SELECTION</span>
          </div>
        </div>

      </div>
    </section>
  );
}
