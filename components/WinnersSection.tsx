'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Raffle } from '@/lib/types';
import { PixelArtwork } from './PixelArtworks';
import { ChainBadge } from './ChainBadge';
import { 
  Trophy, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Search, 
  ExternalLink,
  Twitter,
  ArrowRight
} from 'lucide-react';

export function WinnersSection({ raffles }: { raffles: Raffle[] }) {
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedWallet, setCopiedWallet] = useState<string | null>(null);

  const closedOrDrawnRaffles = raffles.filter(
    r => r.status === 'winners_drawn' || r.status === 'closed' || (r.winners && r.winners.length > 0)
  );

  const handleCopyWallet = (wallet: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(wallet);
      setCopiedWallet(wallet);
      setTimeout(() => setCopiedWallet(null), 2000);
    }
  };

  const openWinnersModal = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setSearchQuery('');
    setCopiedWallet(null);
  };

  const closeWinnersModal = () => {
    setSelectedRaffle(null);
    setSearchQuery('');
  };

  // Filtered winners in modal
  const filteredWinners = selectedRaffle?.winners ? selectedRaffle.winners.filter(w => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      w.wallet.toLowerCase().includes(q) ||
      (w.twitterUsername && w.twitterUsername.toLowerCase().includes(q))
    );
  }) : [];

  const userMatchedWinner = searchQuery.trim() && filteredWinners.length > 0;

  return (
    <section id="winners" className="py-12 select-none space-y-8 scroll-mt-24">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-4 border-b border-gray-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-6 rounded bg-[#ea580c]" />
          <div>
            <h2 className="font-syne text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              Winners & Completed Allocations
            </h2>
            <p className="font-dm text-xs text-gray-500 dark:text-slate-400">
              Transparent records of past campaigns and selected whitelist winners
            </p>
          </div>
        </div>
      </div>

      {/* Closed / Winner Raffles Cards Grid */}
      {closedOrDrawnRaffles.length === 0 ? (
        <div className="cq-card p-10 text-center dark:bg-slate-900/60 dark:border-slate-800">
          <p className="font-dm text-xs text-gray-500 dark:text-slate-400">
            No concluded campaigns yet. Live allocations are currently underway.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {closedOrDrawnRaffles.map((raffle) => {
            const collaboratorTitle = raffle.project && !raffle.title.toLowerCase().includes(raffle.project.toLowerCase())
              ? `DOTSET X ${raffle.project.toUpperCase()}`
              : raffle.title;
            const mintStage = raffle.mintStage || (raffle.entryMethod === 'fcfs' ? 'FCFS' : 'GTD');
            const winnerCount = raffle.winners?.length || 0;

            return (
              <div 
                key={raffle.id} 
                className="cq-card flex flex-col justify-between overflow-hidden group hover:border-[#293681] dark:hover:border-blue-500 transition-all shadow-sm"
              >
                <div>
                  {/* Cover Artwork Banner */}
                  <div className="relative overflow-hidden aspect-[16/9] w-full bg-gray-100 dark:bg-slate-800">
                    <PixelArtwork
                      type={raffle.artworkType}
                      bannerUrl={raffle.bannerUrl}
                      logoUrl={raffle.logoUrl}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    
                    {/* Bottom gradient fade */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                    {/* Top-Left: Network & Stage Pills */}
                    <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5 z-10">
                      <ChainBadge
                        network={raffle.network}
                        customNetwork={raffle.customNetwork}
                        customNetworkLogoUrl={raffle.customNetworkLogoUrl}
                        size="sm"
                      />
                      <span className={`px-2 py-0.5 rounded font-mono-dm text-[10px] uppercase font-semibold shadow-sm ${
                        mintStage === 'GTD' 
                          ? 'bg-[#293681] text-white border border-[#293681]' 
                          : mintStage === 'FCFS' 
                          ? 'bg-[#ea580c] text-white border border-[#ea580c]' 
                          : 'bg-gray-800 text-white'
                      }`}>
                        {mintStage}
                      </span>
                    </div>

                    {/* Top-Right: Winner Status Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono-dm text-[10px] font-semibold bg-amber-500/90 text-white backdrop-blur-md shadow-sm">
                        <Trophy size={11} className="text-amber-200" />
                        <span>{winnerCount > 0 ? 'Winners Drawn' : 'Concluded'}</span>
                      </span>
                    </div>
                  </div>

                  {/* Overlapping Project Logo Avatar */}
                  <div className="relative px-4 sm:px-5 flex items-end justify-between -mt-6 sm:-mt-7 z-20 pointer-events-none">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-900 p-1 border-2 border-white dark:border-slate-800 shadow-md overflow-hidden flex items-center justify-center pointer-events-auto shrink-0 ring-1 ring-gray-100 dark:ring-slate-800">
                      {raffle.logoUrl ? (
                        <img
                          src={raffle.logoUrl}
                          alt={raffle.project || raffle.title}
                          className="w-full h-full object-contain rounded-xl"
                          onError={e => {
                            (e.target as HTMLImageElement).src = '/images/dotset-logo.png';
                          }}
                        />
                      ) : (
                        <img
                          src="/images/dotset-logo.png"
                          alt="DOTSET"
                          className="w-full h-full object-contain p-1"
                        />
                      )}
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-4 sm:p-5 pt-2 sm:pt-3 space-y-3">
                    
                    {/* Project Title */}
                    <div>
                      <h3 className="font-syne text-base font-bold text-gray-900 dark:text-white flex items-center gap-1.5 line-clamp-1">
                        <span>{collaboratorTitle}</span>
                        <CheckCircle2 size={14} className="text-[#38bdf8] shrink-0" />
                      </h3>
                      {raffle.subtitle && (
                        <p className="font-dm text-xs text-gray-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                          {raffle.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 dark:border-slate-800 font-dm text-xs">
                      <div>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono-dm block uppercase font-medium">Spots</span>
                        <span className="font-mono-dm text-xs text-[#293681] dark:text-blue-400 font-bold mt-0.5 block truncate">
                          {raffle.supply} WL
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono-dm block uppercase font-medium">Winners</span>
                        <span className="font-mono-dm text-xs text-amber-600 dark:text-amber-400 font-bold mt-0.5 block truncate flex items-center gap-1">
                          <Trophy size={11} />
                          <span>{winnerCount}</span>
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono-dm block uppercase font-medium">Registrations</span>
                        <span className="font-mono-dm text-xs text-gray-900 dark:text-slate-200 font-semibold mt-0.5 block truncate">
                          {raffle.totalEntries || 0}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="p-4 sm:p-5 pt-0 space-y-2">
                  <button
                    onClick={() => openWinnersModal(raffle)}
                    type="button"
                    className="w-full btn-primary-cq text-xs py-2.5 px-4 font-semibold flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Trophy size={14} className="text-amber-300" />
                    <span>See Winners ({winnerCount})</span>
                  </button>

                  <Link
                    href={`/raffle/${raffle.slug || raffle.id}`}
                    className="block text-center font-dm text-[11px] text-gray-500 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 py-1 transition-colors"
                  >
                    View Campaign Details →
                  </Link>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* =========================================================
          WINNERS MODAL CARD (POPUP)
          ========================================================= */}
      {selectedRaffle && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200"
          onClick={closeWinnersModal}
        >
          <div 
            className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header with Banner & Logo */}
            <div className="relative">
              {/* Header Banner */}
              <div className="h-28 sm:h-32 w-full overflow-hidden relative bg-gray-100 dark:bg-slate-800">
                <PixelArtwork
                  type={selectedRaffle.artworkType}
                  bannerUrl={selectedRaffle.bannerUrl}
                  logoUrl={selectedRaffle.logoUrl}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                
                {/* Close Button */}
                <button
                  onClick={closeWinnersModal}
                  type="button"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/50 text-white/80 hover:text-white hover:bg-black/70 transition-colors z-20 backdrop-blur-sm"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>

                {/* Network & Stage Badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
                  <ChainBadge
                    network={selectedRaffle.network}
                    customNetwork={selectedRaffle.customNetwork}
                    customNetworkLogoUrl={selectedRaffle.customNetworkLogoUrl}
                    size="sm"
                  />
                  <span className="px-2 py-0.5 rounded font-mono-dm text-[10px] uppercase font-semibold bg-amber-500 text-white shadow-sm flex items-center gap-1">
                    <Trophy size={10} />
                    <span>Winners List</span>
                  </span>
                </div>
              </div>

              {/* Logo and Title Banner Overlay */}
              <div className="px-6 -mt-8 flex items-end justify-between relative z-10 pb-2">
                <div className="flex items-end gap-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 p-1 border-2 border-white dark:border-slate-800 shadow-lg overflow-hidden shrink-0 ring-1 ring-gray-100 dark:ring-slate-800">
                    {selectedRaffle.logoUrl ? (
                      <img
                        src={selectedRaffle.logoUrl}
                        alt={selectedRaffle.project || selectedRaffle.title}
                        className="w-full h-full object-contain rounded-xl"
                        onError={e => {
                          (e.target as HTMLImageElement).src = '/images/dotset-logo.png';
                        }}
                      />
                    ) : (
                      <img
                        src="/images/dotset-logo.png"
                        alt="DOTSET"
                        className="w-full h-full object-contain p-1"
                      />
                    )}
                  </div>
                  <div className="pt-8">
                    <h3 className="font-syne text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1.5">
                      <span>{selectedRaffle.title}</span>
                      <CheckCircle2 size={16} className="text-[#38bdf8] shrink-0" />
                    </h3>
                    <p className="font-dm text-xs text-gray-500 dark:text-slate-400">
                      {selectedRaffle.supply} Guaranteed / Whitelist Spots • {selectedRaffle.winners?.length || 0} Winners
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Body & Winner Checker */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              
              {/* Live Winner Search & Checker */}
              <div className="relative">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" />
                <input
                  type="text"
                  placeholder="Check your wallet (0x...) or X username (@handle)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/80 text-gray-900 dark:text-slate-100 font-mono-dm text-xs focus:outline-none focus:border-[#293681] dark:focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 transition-all"
                />
              </div>

              {/* Status Alert if searching */}
              {searchQuery.trim() && (
                <div className={`p-3 rounded-xl border font-dm text-xs flex items-center gap-2.5 ${
                  userMatchedWinner
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300'
                    : 'bg-gray-50 dark:bg-slate-800/60 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-400'
                }`}>
                  {userMatchedWinner ? (
                    <>
                      <Sparkles size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <div>
                        <span className="font-bold">🎉 Congratulations!</span> You are selected in this whitelist allocation!
                      </div>
                    </>
                  ) : (
                    <>
                      <Users size={16} className="text-gray-400 dark:text-slate-500 shrink-0" />
                      <div>No match found for &ldquo;{searchQuery}&rdquo;. Try another address or handle.</div>
                    </>
                  )}
                </div>
              )}

              {/* Winners Table / List */}
              {selectedRaffle.winners && selectedRaffle.winners.length > 0 ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-dm text-xs text-gray-500 dark:text-slate-400 px-1">
                    <span className="font-semibold text-gray-900 dark:text-slate-200">
                      Selected Wallets ({filteredWinners.length})
                    </span>
                    <span className="text-[11px] font-mono-dm">Click wallet to copy</span>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                    {filteredWinners.map((winner, idx) => (
                      <div
                        key={`${winner.wallet}-${winner.rank || idx}`}
                        className="p-3 rounded-xl bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/80 hover:border-gray-300 dark:hover:border-slate-600 flex items-center justify-between gap-3 font-mono-dm text-xs transition-colors"
                      >
                        {/* Rank and Wallet */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-md bg-[#293681] dark:bg-blue-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                            #{winner.rank || idx + 1}
                          </span>
                          
                          <button
                            type="button"
                            onClick={() => handleCopyWallet(winner.wallet)}
                            className="text-gray-900 dark:text-slate-100 font-medium hover:text-[#293681] dark:hover:text-blue-400 text-left truncate flex items-center gap-1.5 transition-colors"
                            title="Click to copy wallet"
                          >
                            <span className="truncate">{winner.wallet}</span>
                            {copiedWallet === winner.wallet ? (
                              <Check size={13} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            ) : (
                              <Copy size={13} className="text-gray-400 dark:text-slate-500 shrink-0 opacity-60 hover:opacity-100" />
                            )}
                          </button>
                        </div>

                        {/* Twitter Handle / Verified badge */}
                        <div className="flex items-center gap-2 shrink-0">
                          {winner.twitterUsername && (
                            <a
                              href={`https://x.com/${winner.twitterUsername.replace('@', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-[11px] font-medium hover:bg-blue-100 dark:hover:bg-blue-900/60 transition-colors flex items-center gap-1"
                              title={`View @${winner.twitterUsername.replace('@', '')} on X`}
                            >
                              <Twitter size={11} />
                              <span>@{winner.twitterUsername.replace('@', '')}</span>
                            </a>
                          )}
                          <CheckCircle2 size={16} className="text-[#16a34a] dark:text-emerald-400 shrink-0" />
                        </div>
                      </div>
                    ))}

                    {filteredWinners.length === 0 && (
                      <div className="p-8 text-center text-gray-400 dark:text-slate-500 font-dm text-xs">
                        No winners match your query.
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 dark:text-slate-400 font-dm text-xs bg-gray-50 dark:bg-slate-800/40 rounded-xl">
                  Winners drawing in progress. Please check back shortly.
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 bg-gray-50 dark:bg-slate-800/80 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between gap-3">
              <Link
                href={`/raffle/${selectedRaffle.slug || selectedRaffle.id}`}
                className="btn-outline-cq text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <span>View Full Campaign</span>
                <ExternalLink size={12} />
              </Link>

              <button
                onClick={closeWinnersModal}
                type="button"
                className="btn-primary-cq text-xs py-2 px-5 font-semibold"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </section>
  );
}
