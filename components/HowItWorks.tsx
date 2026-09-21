'use client';

import React from 'react';
import { Wallet, Share2, ShieldCheck, Trophy, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Discover Quests',
      desc: 'Explore active guaranteed & FCFS whitelist drops from verified emerging Web3 projects.',
      icon: Wallet,
    },
    {
      num: '02',
      title: 'Complete Social Tasks',
      desc: 'Follow partner & DOTSET community accounts, like, repost, and join project channels.',
      icon: Share2,
    },
    {
      num: '03',
      title: 'Provide Receiving Wallet',
      desc: 'Enter your EVM address to register for whitelist allocation without complex blockers.',
      icon: ShieldCheck,
      highlight: true,
    },
    {
      num: '04',
      title: 'Win Whitelist Spots',
      desc: 'Selected winners are published on the Winners archive and submitted for mint day access.',
      icon: Trophy,
    },
  ];

  return (
    <section id="how-it-works" className="py-12 select-none">
      <div className="space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded bg-[#293681]" />
            <div>
              <h2 className="font-syne text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                How DOTSET Works
              </h2>
              <p className="font-dm text-xs text-gray-500">
                Transparent, open whitelist raffle and quest distribution
              </p>
            </div>
          </div>

          <Link
            href="/how-it-works"
            className="text-xs text-[#293681] hover:text-[#4274d9] hover:underline flex items-center gap-1 font-mono-dm font-medium"
          >
            <span>Read full guide</span>
            <ArrowRight size={12} />
          </Link>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className={`cq-card p-5 flex flex-col justify-between ${
                  step.highlight ? 'border-[#293681]/30 bg-blue-50/40' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="font-mono-dm text-xs font-bold text-[#293681]">
                      {step.num}
                    </span>
                    <div className="p-2 rounded-lg bg-blue-50 text-[#293681]">
                      <Icon size={18} />
                    </div>
                  </div>

                  <h3 className="font-syne text-sm font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>

                  <p className="font-dm text-xs text-gray-500 leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-gray-100 font-mono-dm text-[10px] text-gray-400 uppercase font-medium">
                  {idx === 2 ? 'Open to All' : 'Automated'}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
