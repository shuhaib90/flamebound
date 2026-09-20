'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { DotsetHero } from '@/components/DotsetHero';
import { RaffleCard } from '@/components/RaffleCard';
import { HowItWorks } from '@/components/HowItWorks';
import { WinnersSection } from '@/components/WinnersSection';
import { Footer } from '@/components/Footer';
import { Raffle } from '@/lib/types';
import { Sparkles, Search, Flame } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'fcfs' | 'gtd' | 'closed'>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/raffles');
      const data = await res.json();
      if (data.success && data.raffles) {
        setRaffles(data.raffles);
      }
    } catch (err) {
      console.error('Failed to fetch raffles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffles();
  }, []);

  const filteredRaffles = raffles.filter(r => {
    const isLive = r.status === 'live' || r.status === 'ending_soon';
    const mintStage = r.mintStage || (r.entryMethod === 'fcfs' ? 'FCFS' : 'GTD');

    if (statusFilter === 'live' && !isLive) return false;
    if (statusFilter === 'closed' && isLive) return false;
    if (statusFilter === 'fcfs' && mintStage !== 'FCFS') return false;
    if (statusFilter === 'gtd' && mintStage !== 'GTD') return false;

    if (networkFilter !== 'all') {
      const net = (r.customNetwork || r.network || '').toLowerCase();
      if (!net.includes(networkFilter.toLowerCase())) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (r.title || '').toLowerCase().includes(q);
      const matchProject = (r.project || '').toLowerCase().includes(q);
      if (!matchTitle && !matchProject) return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#f0f0f0] selection:bg-[#4f52c8] selection:text-white">
      {/* Navigation Header */}
      <Header />

      {/* Hero Section */}
      <DotsetHero />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        
        {/* ACTIVE RAFFLES DIRECTORY */}
        <section id="active-raffles" className="scroll-mt-24 space-y-6">
          
          {/* Section Header with CloudQuest glowing indicator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/[0.08]">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded bg-[#a5b4fc]" />
              <div>
                <h2 className="font-syne text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Featured Allocations
                </h2>
                <p className="font-dm text-xs text-[#8a8a9a]">
                  Browse live and upcoming partner whitelist raffles
                </p>
              </div>
            </div>

            {/* Search Input */}
            <div className="w-full md:w-64 relative">
              <input
                type="text"
                placeholder="Search project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#111111] border border-white/[0.1] rounded-lg px-3 py-2 pl-9 font-dm text-xs text-white placeholder-[#555566] outline-none focus:border-[#a5b4fc]/50 transition-colors"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-[#555566]" />
            </div>
          </div>

          {/* CloudQuest Filter Tabs & Network Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5 font-dm text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-[#8a8a9a] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                All ({raffles.length})
              </button>
              <button
                onClick={() => setStatusFilter('live')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === 'live'
                    ? 'bg-[#4ade80]/15 text-[#4ade80] border border-[#4ade80]/30'
                    : 'text-[#8a8a9a] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80] animate-pulse" />
                <span>Live</span>
              </button>
              <button
                onClick={() => setStatusFilter('fcfs')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === 'fcfs'
                    ? 'bg-[#fb923c]/15 text-[#fb923c] border border-[#fb923c]/30'
                    : 'text-[#8a8a9a] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                FCFS
              </button>
              <button
                onClick={() => setStatusFilter('gtd')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === 'gtd'
                    ? 'bg-[#a5b4fc]/15 text-[#a5b4fc] border border-[#a5b4fc]/30'
                    : 'text-[#8a8a9a] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Guaranteed
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  statusFilter === 'closed'
                    ? 'bg-white/10 text-white border border-white/20'
                    : 'text-[#8a8a9a] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                Closed
              </button>
            </div>

            {/* Network Pills */}
            <div className="flex flex-wrap gap-1 font-mono-dm text-[11px]">
              {['all', 'robinhood', 'ethereum', 'base', 'polygon'].map((net) => (
                <button
                  key={net}
                  onClick={() => setNetworkFilter(net)}
                  className={`px-2.5 py-1 rounded transition-colors uppercase ${
                    networkFilter === net
                      ? 'bg-white/10 text-white border border-white/20'
                      : 'text-[#555566] hover:text-[#8a8a9a]'
                  }`}
                >
                  {net}
                </button>
              ))}
            </div>

          </div>

          {/* Campaign Grid */}
          {loading ? (
            <div className="bg-[#0f0f0f] border border-white/[0.08] p-12 rounded-xl text-center space-y-3">
              <span className="w-5 h-5 border-2 border-[#a5b4fc] border-t-transparent animate-spin inline-block rounded-full" />
              <p className="font-dm text-xs text-[#8a8a9a]">
                Fetching active campaigns...
              </p>
            </div>
          ) : filteredRaffles.length === 0 ? (
            <div className="bg-[#0f0f0f] border border-white/[0.08] p-12 rounded-xl text-center space-y-3">
              <p className="font-dm text-sm text-white font-medium">
                No active allocations matching this filter.
              </p>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setNetworkFilter('all');
                  setSearchQuery('');
                }}
                className="btn-outline-cq text-xs py-2 px-4"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRaffles.map((raffle) => (
                <RaffleCard
                  key={raffle.id}
                  raffle={raffle}
                  onEdit={() => router.push('/admin')}
                />
              ))}
            </div>
          )}

        </section>

        {/* HOW IT WORKS SECTION */}
        <HowItWorks />

        {/* WINNERS SECTION */}
        <WinnersSection raffles={raffles} />

      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
