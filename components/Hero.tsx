'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Send, Flame, Trophy, Users, ShieldCheck } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative pt-16 pb-12 sm:pt-24 sm:pb-16 select-none overflow-hidden">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Top Minimalist Pill matching CloudQuest */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.12] text-[#8a8a9a] font-mono-dm text-xs tracking-wider uppercase mb-6">
          <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
          <span>Web3 Raffle & Quest Platform</span>
        </div>

        {/* Hero Headline */}
        <h1 className="font-syne text-3xl sm:text-5xl md:text-6xl font-extrabold text-[#f0f0f0] tracking-tight leading-[1.1] mb-5">
          Discover & Enter Early Web3{' '}
          <span className="text-[#a5b4fc] italic font-normal">Allocations</span>
        </h1>

        {/* Subtitle */}
        <p className="font-dm text-sm sm:text-base md:text-lg text-[#8a8a9a] max-w-xl mx-auto mb-8 leading-relaxed">
          Complete verified social quests, explore exclusive partner whitelist drops, and earn confirmed spots from emerging crypto projects.
        </p>

        {/* CTA Buttons matching CloudQuest */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <a
            href="#active-raffles"
            className="btn-primary-cq shadow-lg"
          >
            <span>Explore Raffles</span>
            <ArrowRight size={15} />
          </a>

          <Link
            href="/request-collab"
            className="btn-outline-cq"
          >
            <span>Request Collab</span>
          </Link>
        </div>

        {/* Floating Stats Bar matching CloudQuest */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-14 sm:mt-18 max-w-4xl mx-auto">
          
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-4 sm:p-5 rounded-xl shadow-xl animate-float-1 transition-all hover:border-white/20">
            <div className="flex justify-center text-[#a5b4fc] mb-1.5">
              <Flame size={18} />
            </div>
            <div className="font-grotesk text-xl sm:text-2xl font-bold text-white">
              LIVE
            </div>
            <div className="font-mono-dm text-[11px] text-[#555566] uppercase mt-1">
              Active Raffles
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-white/[0.08] p-4 sm:p-5 rounded-xl shadow-xl animate-float-2 transition-all hover:border-white/20">
            <div className="flex justify-center text-[#38bdf8] mb-1.5">
              <Users size={18} />
            </div>
            <div className="font-grotesk text-xl sm:text-2xl font-bold text-white">
              100%
            </div>
            <div className="font-mono-dm text-[11px] text-[#555566] uppercase mt-1">
              Open to All
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-white/[0.08] p-4 sm:p-5 rounded-xl shadow-xl animate-float-3 transition-all hover:border-white/20">
            <div className="flex justify-center text-[#4ade80] mb-1.5">
              <ShieldCheck size={18} />
            </div>
            <div className="font-grotesk text-xl sm:text-2xl font-bold text-white">
              GTD / FCFS
            </div>
            <div className="font-mono-dm text-[11px] text-[#555566] uppercase mt-1">
              Guaranteed Spots
            </div>
          </div>

          <div className="bg-[#0f0f0f] border border-white/[0.08] p-4 sm:p-5 rounded-xl shadow-xl animate-float-4 transition-all hover:border-white/20">
            <div className="flex justify-center text-[#fb923c] mb-1.5">
              <Trophy size={18} />
            </div>
            <div className="font-grotesk text-xl sm:text-2xl font-bold text-white">
              PROVABLE
            </div>
            <div className="font-mono-dm text-[11px] text-[#555566] uppercase mt-1">
              Fair Drawings
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
