'use client';

import React from 'react';
import { Wallet, Share2, ShieldCheck, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'CONNECT WALLET',
      desc: 'Connect your Web3 wallet (MetaMask, Coinbase, Rainbow, Rabby) securely with 1 click.',
      icon: Wallet,
    },
    {
      num: '02',
      title: 'COMPLETE TASKS',
      desc: 'Follow partner & DOTSET community channels, like, retweet and engage to qualify.',
      icon: Share2,
    },
    {
      num: '03',
      title: 'HOLDER MULTIPLIER',
      desc: 'Our engine verifies your DOTSET NFT holdings on-chain and multiplies your draw tickets from 1x to 50x or 100% Auto-Win.',
      icon: ShieldCheck,
      highlight: true,
    },
    {
      num: '04',
      title: 'PROVABLE DRAW',
      desc: 'Transparent on-chain drawings award spots directly to verified wallets with provable fairness.',
      icon: Trophy,
    },
  ];

  return (
    <section id="how-it-works" className="py-14 md:py-20 border-b-3 border-black bg-gray-50 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-block font-pixel text-[9px] bg-black text-white px-3 py-1 uppercase font-bold mb-2">
            TRANSPARENT SYSTEM
          </div>
          <h2 className="font-pixel text-xl sm:text-3xl text-black font-extrabold uppercase tracking-tight">
            HOW DOTSET RAFFLES WORK
          </h2>
          <p className="font-mono text-xs sm:text-sm text-gray-700 font-bold mt-2">
            100% On-Chain Verifiable • Multiplied Holder Odds • Guaranteed Passes
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`border-2 sm:border-3 border-black p-5 shadow-pixel flex flex-col justify-between ${
                  step.highlight ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3 border-b-2 border-current pb-2">
                    <span className={`font-pixel text-xs font-bold ${step.highlight ? 'text-white' : 'text-black'}`}>
                      STEP {step.num}
                    </span>
                    <Icon size={20} className={step.highlight ? 'text-white' : 'text-black'} />
                  </div>

                  <h3 className={`font-pixel text-xs font-bold uppercase mb-2 ${
                    step.highlight ? 'text-white' : 'text-black'
                  }`}>
                    {step.title}
                  </h3>

                  <p className={`font-mono text-xs leading-relaxed ${
                    step.highlight ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {step.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t-2 border-current/20 flex items-center justify-between font-pixel text-[8px] font-bold">
                  <span className={step.highlight ? 'text-white' : 'text-black'}>
                    {idx === 2 ? '50x-100% BENEFIT' : 'AUTOMATED'}
                  </span>
                  <ArrowRight size={12} className={step.highlight ? 'text-white' : 'text-black'} />
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Guide CTA */}
        <div className="mt-8 text-center">
          <Link
            href="/how-it-works"
            className="pixel-btn text-xs py-3 px-6 shadow-pixel inline-flex items-center gap-2"
          >
            <span>[VIEW FULL MULTIPLIER & BENEFIT MATRIX →]</span>
          </Link>
        </div>

      </div>
    </section>
  );
}
