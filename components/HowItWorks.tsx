'use client';

import React from 'react';
import { Wallet, Share2, ShieldCheck, Trophy, ArrowRight } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'CONNECT WALLET',
      desc: 'Connect your Web3 crypto wallet (MetaMask, Coinbase, Rainbow, or WalletConnect) via RainbowKit.',
      icon: Wallet,
    },
    {
      num: '02',
      title: 'COMPLETE TASKS',
      desc: 'Follow @FlameboundNft on X and engage with partner whitelist updates to enter.',
      icon: Share2,
    },
    {
      num: '03',
      title: 'ON-CHAIN MINTER CHECK',
      desc: 'Our engine verifies your Flamebound NFT mints directly on-chain in real-time.',
      icon: ShieldCheck,
      highlight: true,
    },
    {
      num: '04',
      title: 'PROVABLY FAIR DRAW',
      desc: 'When the timer closes, verified minters are entered into the verifiable random draw for guaranteed whitelist spots.',
      icon: Trophy,
    },
  ];

  return (
    <section id="how-it-works" className="py-16 md:py-24 border-b-4 border-black bg-lime select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block font-pixel text-xs bg-black text-lime px-3 py-1 uppercase font-bold mb-3">
            VERIFICATION PIPELINE
          </div>
          <h2 className="font-pixel text-2xl sm:text-4xl text-black font-extrabold uppercase tracking-tight">
            HOW FLAMEBOUND RAFFLES WORK
          </h2>
          <p className="font-mono text-xs sm:text-sm text-black font-bold mt-3">
            100% On-Chain Verifiable • Zero Fake Entries • Minter Priority
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`border-4 border-black p-6 shadow-pixel-lg flex flex-col justify-between ${
                  step.highlight ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4 border-b-3 border-black pb-2">
                    <span className={`font-pixel text-sm font-bold ${step.highlight ? 'text-lime' : 'text-black'}`}>
                      STEP {step.num}
                    </span>
                    <Icon size={22} className={step.highlight ? 'text-lime' : 'text-black'} />
                  </div>

                  <h3 className={`font-pixel text-xs sm:text-sm font-bold uppercase mb-2 ${
                    step.highlight ? 'text-lime' : 'text-black'
                  }`}>
                    {step.title}
                  </h3>

                  <p className={`font-mono text-xs leading-relaxed ${
                    step.highlight ? 'text-gray-300' : 'text-gray-800'
                  }`}>
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t-2 border-black/20 flex items-center justify-between font-pixel text-[9px]">
                  <span className={step.highlight ? 'text-lime' : 'text-black'}>
                    {idx === 2 ? 'STRICT REQUIREMENT' : 'AUTOMATED'}
                  </span>
                  <ArrowRight size={14} className={step.highlight ? 'text-lime' : 'text-black'} />
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
