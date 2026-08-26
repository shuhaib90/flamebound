'use client';

import React from 'react';
import { Raffle } from '@/lib/types';
import { PixelFlame, PixelCheck } from './PixelFlame';
import { Trophy, ExternalLink, ShieldCheck, Sparkles, Hash } from 'lucide-react';
import { formatAddress, FLAMEBOUND_PRIMARY_CONTRACT } from '@/lib/blockchain';

export function WinnersSection({ raffles }: { raffles: Raffle[] }) {
  const closedOrDrawnRaffles = raffles.filter(
    r => r.status === 'winners_drawn' || r.status === 'closed' || (r.winners && r.winners.length > 0)
  );

  return (
    <section id="winners" className="py-16 md:py-24 border-b-4 border-black bg-lime select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-4 border-black pb-4 mb-10 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={20} className="text-black" />
              <span className="font-pixel text-xs bg-black text-lime px-2 py-0.5 uppercase font-bold">
                PROVABLY FAIR
              </span>
            </div>
            <h2 className="font-pixel text-2xl sm:text-4xl text-black font-extrabold uppercase tracking-tight">
              WINNERS & PAST RAFFLES
            </h2>
          </div>
          <p className="font-mono text-xs sm:text-sm text-black font-bold max-w-md">
            All winners are drawn on-chain with verified Flamebound holder eligibility.
          </p>
        </div>

        {/* Closed / Winner Raffles List */}
        {closedOrDrawnRaffles.length === 0 ? (
          <div className="bg-white border-4 border-black p-8 text-center shadow-pixel">
            <p className="font-pixel text-xs text-black font-bold">NO CONCLUDED RAFFLES YET. ACTIVE RAFFLES IN PROGRESS.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {closedOrDrawnRaffles.map((raffle) => (
              <div key={raffle.id} className="bg-white border-4 border-black shadow-pixel-lg p-6 md:p-8">
                
                {/* Raffle Info Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b-3 border-black pb-4 mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="font-pixel text-[10px] bg-black text-white px-2 py-0.5 font-bold">
                        {raffle.status === 'winners_drawn' ? 'RAFFLE CONCLUDED' : 'RAFFLE CLOSED'}
                      </span>
                      <span className="font-pixel text-[10px] bg-lime text-black border border-black px-2 py-0.5 font-bold">
                        {raffle.customNetwork || raffle.network}
                      </span>
                    </div>
                    <h3 className="font-pixel text-lg sm:text-xl text-black font-bold uppercase">
                      {raffle.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs font-mono">
                    <div className="bg-lime/20 border-2 border-black px-3 py-1.5 font-bold">
                      <span className="text-gray-600 block text-[9px] uppercase">TOTAL SPOTS:</span>
                      <span className="font-pixel text-xs text-black">{raffle.supply} SPOTS</span>
                    </div>
                    <div className="bg-lime/20 border-2 border-black px-3 py-1.5 font-bold">
                      <span className="text-gray-600 block text-[9px] uppercase">TOTAL ENTRIES:</span>
                      <span className="font-pixel text-xs text-black">{raffle.totalEntries}</span>
                    </div>
                  </div>
                </div>

                {/* Winners Table */}
                {raffle.winners && raffle.winners.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles size={16} className="text-black" />
                      <span className="font-pixel text-xs uppercase font-bold text-black">
                        SELECTED WHITELIST WINNERS ({raffle.winners.length})
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {raffle.winners.map((winner) => (
                        <div
                          key={winner.rank}
                          className="bg-black text-lime border-2 border-black p-3 flex items-center justify-between font-mono text-xs shadow-pixel-sm"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-pixel text-[10px] bg-lime text-black px-1.5 py-0.5 font-bold">
                              #{winner.rank}
                            </span>
                            <span className="font-bold text-white truncate select-all">
                              {winner.shortWallet}
                            </span>
                          </div>
                          <span className="font-pixel text-[9px] text-lime font-bold">
                            {winner.entryNumber}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-lime/10 border-2 border-black font-mono text-xs text-black font-bold">
                    Winner drawing will be published here upon raffle conclusion.
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
