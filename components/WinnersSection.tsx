'use client';

import React from 'react';
import { Raffle } from '@/lib/types';
import { Trophy, CheckCircle2 } from 'lucide-react';

export function WinnersSection({ raffles }: { raffles: Raffle[] }) {
  const closedOrDrawnRaffles = raffles.filter(
    r => r.status === 'winners_drawn' || r.status === 'closed' || (r.winners && r.winners.length > 0)
  );

  return (
    <section id="winners" className="py-12 select-none space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-white/[0.08]">
        <div className="flex items-center gap-3">
          <div className="w-1 h-6 rounded bg-[#fb923c]" />
          <div>
            <h2 className="font-syne text-xl sm:text-2xl font-bold text-white tracking-tight">
              Winners & Completed Allocations
            </h2>
            <p className="font-dm text-xs text-[#8a8a9a]">
              Transparent records of past campaigns and selected whitelist wallets
            </p>
          </div>
        </div>
      </div>

      {/* Closed / Winner Raffles List */}
      {closedOrDrawnRaffles.length === 0 ? (
        <div className="cq-card p-10 text-center">
          <p className="font-dm text-xs text-[#8a8a9a]">
            No concluded campaigns yet. Live allocations currently underway.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {closedOrDrawnRaffles.map((raffle) => (
            <div key={raffle.id} className="cq-card p-6 space-y-5">
              
              {/* Raffle Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-white/[0.08] gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono-dm text-[10px] px-2 py-0.5 rounded bg-white/10 text-white font-medium">
                      {raffle.status === 'winners_drawn' ? 'Winners Selected' : 'Concluded'}
                    </span>
                    <span className="font-mono-dm text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-[#8a8a9a] border border-white/[0.06]">
                      {raffle.customNetwork || raffle.network}
                    </span>
                  </div>
                  <h3 className="font-syne text-base font-bold text-white">
                    {raffle.title}
                  </h3>
                </div>

                <div className="flex items-center gap-3 font-mono-dm text-xs">
                  <div className="px-3 py-1 rounded bg-[#111111] border border-white/[0.06]">
                    <span className="text-[#555566] text-[10px] block">SPOTS</span>
                    <span className="text-[#a5b4fc] font-bold">{raffle.supply} WL</span>
                  </div>
                  <div className="px-3 py-1 rounded bg-[#111111] border border-white/[0.06]">
                    <span className="text-[#555566] text-[10px] block">TOTAL REGISTRATIONS</span>
                    <span className="text-white font-bold">{raffle.totalEntries || 0}</span>
                  </div>
                </div>
              </div>

              {/* Winners Grid */}
              {raffle.winners && raffle.winners.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs font-dm text-[#f0f0f0]">
                    <Trophy size={14} className="text-[#a5b4fc]" />
                    <span className="font-medium">Selected Whitelist Wallets ({raffle.winners.length})</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                    {raffle.winners.map((winner) => (
                      <div
                        key={winner.rank}
                        className="p-2.5 rounded-lg bg-[#111111] border border-white/[0.06] flex items-center justify-between font-mono-dm text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white font-semibold">
                            #{winner.rank}
                          </span>
                          <span className="text-[#f0f0f0] truncate select-all">
                            {winner.shortWallet}
                          </span>
                        </div>
                        <CheckCircle2 size={13} className="text-[#4ade80] shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-[#111111] font-dm text-xs text-[#8a8a9a]">
                  Winner drawing will be published here upon raffle conclusion.
                </div>
              )}

            </div>
          ))}
        </div>
      )}
    </section>
  );
}
