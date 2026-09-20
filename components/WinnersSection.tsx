'use client';

import React from 'react';
import { Raffle } from '@/lib/types';
import { Trophy, Sparkles } from 'lucide-react';

export function WinnersSection({ raffles }: { raffles: Raffle[] }) {
  const closedOrDrawnRaffles = raffles.filter(
    r => r.status === 'winners_drawn' || r.status === 'closed' || (r.winners && r.winners.length > 0)
  );

  return (
    <section id="winners" className="py-14 md:py-20 border-b-3 border-black bg-white select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b-3 border-black pb-4 mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={18} className="text-black" />
              <span className="font-pixel text-[9px] bg-black text-white px-2 py-0.5 uppercase font-bold">
                PROVABLE RESULTS
              </span>
            </div>
            <h2 className="font-pixel text-xl sm:text-3xl md:text-4xl text-black font-extrabold uppercase tracking-tight">
              PAST RAFFLES & WINNERS
            </h2>
          </div>
          <p className="font-mono text-xs text-gray-700 font-bold max-w-md">
            All winners are drawn on-chain with verified DOTSET holder weighting and guaranteed passes.
          </p>
        </div>

        {/* Closed / Winner Raffles List */}
        {closedOrDrawnRaffles.length === 0 ? (
          <div className="bg-gray-50 border-2 sm:border-3 border-black p-8 text-center shadow-pixel">
            <p className="font-pixel text-xs text-black font-bold uppercase">
              NO CONCLUDED RAFFLES YET. ACTIVE RAFFLES IN PROGRESS.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {closedOrDrawnRaffles.map((raffle) => (
              <div key={raffle.id} className="bg-white border-2 sm:border-3 border-black shadow-pixel p-5 md:p-7">
                
                {/* Raffle Info Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b-2 border-black pb-3 mb-5 gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-pixel text-[9px] bg-black text-white px-2 py-0.5 font-bold">
                        {raffle.status === 'winners_drawn' ? 'RAFFLE CONCLUDED' : 'RAFFLE CLOSED'}
                      </span>
                      <span className="font-pixel text-[9px] bg-white text-black border border-black px-2 py-0.5 font-bold">
                        {raffle.customNetwork || raffle.network}
                      </span>
                    </div>
                    <h3 className="font-pixel text-base sm:text-lg text-black font-bold uppercase">
                      {raffle.title}
                    </h3>
                  </div>

                  <div className="flex flex-wrap gap-3 text-xs font-mono">
                    <div className="bg-gray-100 border-2 border-black px-3 py-1 font-bold">
                      <span className="text-gray-600 block text-[8px] uppercase font-pixel">TOTAL SPOTS:</span>
                      <span className="font-pixel text-xs text-black">{raffle.supply} SPOTS</span>
                    </div>
                    <div className="bg-gray-100 border-2 border-black px-3 py-1 font-bold">
                      <span className="text-gray-600 block text-[8px] uppercase font-pixel">TOTAL ENTRIES:</span>
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
                      {raffle.winners.map((winner) => (
                        <div
                          key={winner.rank}
                          className="bg-black text-white border-2 border-black p-2.5 flex items-center justify-between font-mono text-xs shadow-pixel-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-pixel text-[9px] bg-white text-black px-1.5 py-0.5 font-bold">
                              #{winner.rank}
                            </span>
                            <span className="font-bold text-white truncate select-all text-xs">
                              {winner.shortWallet}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {winner.multiplier && (
                              <span className={`font-pixel text-[8px] px-1 py-0.5 border font-bold ${
                                winner.isGuaranteed 
                                  ? 'bg-white text-black border-white' 
                                  : 'bg-white/10 text-white border-white/40'
                              }`}>
                                [{winner.multiplier}]
                              </span>
                            )}
                            <span className="font-pixel text-[9px] text-gray-300 font-bold">
                              {winner.entryNumber}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-gray-50 border-2 border-black font-mono text-xs text-black font-bold">
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
