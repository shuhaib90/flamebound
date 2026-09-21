'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Trophy, 
  ArrowRight,
  Zap,
  CheckCircle2
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#293681] selection:text-white">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <Link
            href="/#active-raffles"
            className="btn-outline-cq text-xs py-2 px-3.5 flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>All Raffles</span>
          </Link>
        </div>

        {/* Hero Section */}
        <div className="cq-card p-6 sm:p-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-[#293681] font-mono-dm text-xs font-semibold">
            <span>Web3 Quest Protocol</span>
          </div>
          <h1 className="font-syne text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            How DOTSET Raffles & Quests Work
          </h1>
          <p className="font-dm text-sm sm:text-base text-gray-500 leading-relaxed max-w-3xl">
            DOTSET connects Web3 enthusiasts with emerging crypto collections and ecosystems. We host whitelist raffles, first-come first-served drops, and exclusive community allocations without complicated roadblocks.
          </p>
        </div>

        {/* 3 Main Drop Types */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* GTD Drops */}
          <div className="cq-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-mono-dm text-xs px-2.5 py-0.5 rounded bg-blue-50 text-[#293681] font-bold border border-blue-200">
                  GTD Spots
                </span>
                <ShieldCheck size={18} className="text-[#293681]" />
              </div>
              
              <h3 className="font-syne text-base font-bold text-gray-900">
                Guaranteed Whitelist
              </h3>

              <p className="font-dm text-xs text-gray-500 leading-relaxed">
                Winning tickets in GTD campaigns secure guaranteed mint spots during phase 1, ensuring you can mint before public access.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 font-mono-dm text-[10px] text-gray-400 font-medium">
              Phase 1 Priority
            </div>
          </div>

          {/* FCFS Drops */}
          <div className="cq-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-mono-dm text-xs px-2.5 py-0.5 rounded bg-orange-50 text-[#ea580c] font-bold border border-orange-200">
                  FCFS Drops
                </span>
                <Zap size={18} className="text-[#ea580c]" />
              </div>
              
              <h3 className="font-syne text-base font-bold text-gray-900">
                First-Come First-Served
              </h3>

              <p className="font-dm text-xs text-gray-500 leading-relaxed">
                Speed matters! The first entrants to complete social verification instantly secure the allocated whitelist spots until the supply cap is filled.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 font-mono-dm text-[10px] text-gray-400 font-medium">
              Instant Confirmation
            </div>
          </div>

          {/* Lottery Drops */}
          <div className="cq-card p-6 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                <span className="font-mono-dm text-xs px-2.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                  WL Raffle
                </span>
                <Trophy size={18} className="text-emerald-600" />
              </div>
              
              <h3 className="font-syne text-base font-bold text-gray-900">
                Randomized Selection
              </h3>

              <p className="font-dm text-xs text-gray-500 leading-relaxed">
                Open lottery draws distribute available whitelist spots across verified registered entrants when the countdown closes.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-100 font-mono-dm text-[10px] text-gray-400 font-medium">
              Random Selection
            </div>
          </div>

        </div>

        {/* 4-Step Walkthrough */}
        <div className="cq-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-gray-200">
            <CheckCircle2 size={20} className="text-[#293681]" />
            <h2 className="font-syne text-lg sm:text-xl font-bold text-gray-900">
              Participation Process
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 font-dm text-xs">
            <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <span className="font-mono-dm text-xs font-bold text-[#293681]">01. Set X Handle & Wallet</span>
              <p className="text-gray-500 leading-relaxed">
                Enter your X (Twitter) handle and receiving EVM wallet address to establish your verifiable ticket receipt.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <span className="font-mono-dm text-xs font-bold text-[#293681]">02. Complete Social Quests</span>
              <p className="text-gray-500 leading-relaxed">
                Follow target project channels, engage with the campaign tweet, and complete any custom community tasks.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <span className="font-mono-dm text-xs font-bold text-[#293681]">03. Instant Ticket Generation</span>
              <p className="text-gray-500 leading-relaxed">
                Once requirements are met, your ticket is locked in with a unique identifier and timestamp.
              </p>
            </div>

            <div className="space-y-2 p-4 rounded-lg bg-gray-50 border border-gray-200">
              <span className="font-mono-dm text-xs font-bold text-[#293681]">04. Draw & Allocation</span>
              <p className="text-gray-500 leading-relaxed">
                Winners are published directly to the platform archive and exported for partner mint allowlists.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Banner */}
        <div className="bg-[#293681] text-white p-8 sm:p-12 rounded-2xl shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <h3 className="font-syne text-xl sm:text-2xl font-bold">
              Ready to claim your first allocation?
            </h3>
            <p className="font-dm text-xs sm:text-sm text-blue-100">
              Discover verified drops across Robinhood, Ethereum, and EVM networks today.
            </p>
          </div>

          <Link
            href="/#active-raffles"
            className="px-6 py-3 rounded-lg bg-white text-[#293681] hover:bg-gray-100 font-dm font-semibold text-sm shrink-0 transition-colors shadow-md"
          >
            Browse Active Drops
          </Link>
        </div>

      </main>

      <Footer />
    </div>
  );
}
