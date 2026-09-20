'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  ArrowLeft, 
  ShieldCheck, 
  ExternalLink, 
  Trophy, 
  Sparkles,
  ArrowRight,
  Send,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#f0f0f0] selection:bg-[#4f52c8] selection:text-white">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <Link
            href="/#active-raffles"
            className="btn-outline-cq text-xs py-2 px-3.5 flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>All Raffles</span>
          </Link>

          <Link
            href="/request-collab"
            className="btn-primary-cq text-xs py-2 px-3.5 flex items-center gap-1.5"
          >
            <Send size={12} />
            <span>Request Collab</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="cq-card p-6 sm:p-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f52c8]/20 border border-[#a5b4fc]/30 text-[#a5b4fc] font-mono-dm text-xs">
            <Sparkles size={12} />
            <span>Fair Allocation Protocol</span>
          </div>
          <h1 className="font-syne text-2xl sm:text-4xl font-bold text-white tracking-tight">
            How DOTSET Raffles & Quests Work
          </h1>
          <p className="font-dm text-sm sm:text-base text-[#8a8a9a] leading-relaxed max-w-3xl">
            DOTSET connects Web3 enthusiasts with emerging crypto collections and ecosystems. We host provably fair whitelist raffles, first-come first-served drops, and exclusive community allocations without complicated roadblocks.
          </p>
        </div>

        {/* 3 Main Drop Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* GTD Drops */}
          <div className="cq-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="font-mono-dm text-xs px-2.5 py-0.5 rounded bg-[#a5b4fc]/20 text-[#a5b4fc] font-semibold border border-[#a5b4fc]/30">
                  GTD Spots
                </span>
                <ShieldCheck size={18} className="text-[#a5b4fc]" />
              </div>
              
              <h3 className="font-syne text-base font-bold text-white">
                Guaranteed Whitelist
              </h3>

              <p className="font-dm text-xs text-[#8a8a9a] leading-relaxed">
                Winning tickets in GTD campaigns secure 100% guaranteed mint spots during phase 1, ensuring you can mint before public access.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.06] font-mono-dm text-[10px] text-[#555566]">
              Phase 1 Priority
            </div>
          </div>

          {/* FCFS Drops */}
          <div className="cq-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="font-mono-dm text-xs px-2.5 py-0.5 rounded bg-[#fb923c]/20 text-[#fb923c] font-semibold border border-[#fb923c]/30">
                  FCFS Drops
                </span>
                <Zap size={18} className="text-[#fb923c]" />
              </div>
              
              <h3 className="font-syne text-base font-bold text-white">
                First-Come First-Served
              </h3>

              <p className="font-dm text-xs text-[#8a8a9a] leading-relaxed">
                Speed matters! The first entrants to complete social verification instantly secure the allocated whitelist spots until the supply cap is filled.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.06] font-mono-dm text-[10px] text-[#555566]">
              Instant Confirmation
            </div>
          </div>

          {/* Lottery Drops */}
          <div className="cq-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                <span className="font-mono-dm text-xs px-2.5 py-0.5 rounded bg-[#4ade80]/20 text-[#4ade80] font-semibold border border-[#4ade80]/30">
                  Lottery WL
                </span>
                <Trophy size={18} className="text-[#4ade80]" />
              </div>
              
              <h3 className="font-syne text-base font-bold text-white">
                Provable Random Draw
              </h3>

              <p className="font-dm text-xs text-[#8a8a9a] leading-relaxed">
                Open lottery draws distribute available whitelist spots across all verified registered entrants using provably fair on-chain random selection.
              </p>
            </div>

            <div className="pt-3 border-t border-white/[0.06] font-mono-dm text-[10px] text-[#555566]">
              Provably Fair Drawing
            </div>
          </div>

        </div>

        {/* 4-Step Walkthrough */}
        <div className="cq-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-white/[0.08]">
            <CheckCircle2 size={20} className="text-[#38bdf8]" />
            <h2 className="font-syne text-lg sm:text-xl font-bold text-white">
              Participation Process
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-dm text-xs">
            <div className="space-y-2 p-4 rounded-lg bg-[#111111] border border-white/[0.06]">
              <span className="font-mono-dm text-xs font-bold text-[#a5b4fc]">01. Connect & Set X Handle</span>
              <p className="text-[#8a8a9a] leading-relaxed">
                Enter your X (Twitter) username and receiving EVM wallet address to establish your verifiable ticket receipt.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-[#111111] border border-white/[0.06]">
              <span className="font-mono-dm text-xs font-bold text-[#a5b4fc]">02. Complete Social Actions</span>
              <p className="text-[#8a8a9a] leading-relaxed">
                Follow target project channels, engage with the campaign post, and join partner communities.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-[#111111] border border-white/[0.06]">
              <span className="font-mono-dm text-xs font-bold text-[#a5b4fc]">03. Instant Ticket Generation</span>
              <p className="text-[#8a8a9a] leading-relaxed">
                Receive a unique digital ticket ID confirming your registration into the active campaign database.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-[#111111] border border-white/[0.06]">
              <span className="font-mono-dm text-xs font-bold text-[#a5b4fc]">04. Winner Publication & Mint</span>
              <p className="text-[#8a8a9a] leading-relaxed">
                When the countdown closes, selected winners are published on the Winners archive and whitelisted directly for mint day.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Footer */}
        <div className="cq-card p-8 text-center space-y-4 bg-gradient-to-b from-[#0f0f0f] to-[#141414]">
          <h3 className="font-syne text-xl sm:text-2xl font-bold text-white">
            Ready to Explore Active Drops?
          </h3>
          <p className="font-dm text-xs sm:text-sm text-[#8a8a9a] max-w-lg mx-auto">
            Discover verified Web3 allocations, participate in seconds, and secure your whitelist spots.
          </p>
          <div className="pt-2">
            <Link
              href="/#active-raffles"
              className="btn-primary-cq text-xs py-2.5 px-6 inline-flex items-center gap-2"
            >
              <span>Explore Active Raffles</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
