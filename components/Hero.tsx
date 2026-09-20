'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowDown, Sparkles, ExternalLink } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-10 pb-12 sm:pt-16 sm:pb-18 border-b-3 border-black bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Status Indicator & Official Logo */}
        <div className="flex flex-col items-center justify-center mb-6 gap-3">
          <img
            src="/images/dotset-logo.png"
            alt="DOTSET Official Logo"
            className="w-24 h-24 sm:w-28 sm:h-28 object-contain hover:scale-105 transition-transform"
          />
          <div className="inline-flex items-center gap-2 bg-black text-white px-3.5 py-1.5 border-2 border-black shadow-pixel-xs">
            <span className="w-2 h-2 bg-white inline-block animate-pulse" />
            <span className="font-pixel text-[10px] tracking-wider uppercase font-bold">
              OFFICIAL RAFFLE & WHITELIST HUB
            </span>
          </div>
        </div>

        {/* Large Pixel Heading */}
        <div className="text-center space-y-3 mb-6 max-w-4xl mx-auto">
          <h1 className="font-pixel text-3xl sm:text-5xl md:text-6xl text-black tracking-tight leading-tight uppercase font-extrabold">
            DOTSET<br />
            <span className="inline-block mt-2 text-white bg-black px-4 py-1 border-3 border-black shadow-pixel">
              RAFFLES & DROPS
            </span>
          </h1>

          <p className="font-mono text-xs sm:text-sm md:text-base text-gray-700 max-w-2xl mx-auto pt-3 leading-relaxed font-bold">
            Verify on-chain eligibility. Multiplied win tickets for community holders. Enter exclusive guaranteed & FCFS whitelist allocations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href="#active-raffles"
            className="pixel-btn text-xs sm:text-sm py-3.5 px-6 w-full sm:w-auto shadow-pixel flex items-center justify-center gap-2"
          >
            <span>[BROWSE ACTIVE RAFFLES]</span>
            <ArrowDown size={14} className="animate-bounce" />
          </a>

          <Link
            href="/how-it-works"
            className="pixel-btn-white text-xs sm:text-sm py-3.5 px-6 w-full sm:w-auto shadow-pixel flex items-center justify-center gap-2"
          >
            <span>[HOW IT WORKS]</span>
          </Link>
        </div>

        {/* 8-Bit Marquee Ticker */}
        <div className="mt-10 border-2 border-black bg-black text-white py-2 overflow-hidden shadow-pixel-xs">
          <div className="animate-marquee font-pixel text-[9px] sm:text-[10px] flex gap-8 whitespace-nowrap uppercase font-bold tracking-wider">
            <span>● DOTSET WHITELIST DROPS LIVE</span>
            <span>■ 100% PROVABLE ON-CHAIN VERIFICATION</span>
            <span>● 50X MULTIPLIERS & TITAN GUARANTEES</span>
            <span>■ FIRST-COME FIRST-SERVED & LOTTERY RAFFLES</span>
            <span>● DOTSET WHITELIST DROPS LIVE</span>
            <span>■ 100% PROVABLE ON-CHAIN VERIFICATION</span>
            <span>● 50X MULTIPLIERS & TITAN GUARANTEES</span>
          </div>
        </div>

      </div>
    </section>
  );
}
