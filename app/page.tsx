'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { DotsetHero } from '@/components/DotsetHero';
import { RaffleCard } from '@/components/RaffleCard';
import { HowItWorks } from '@/components/HowItWorks';
import { WinnersSection } from '@/components/WinnersSection';
import { Footer } from '@/components/Footer';
import { Raffle, CustomChain } from '@/lib/types';
import { BUILTIN_CHAINS } from '@/lib/db';
import { ChainLogo } from '@/components/ChainBadge';
import { Sparkles, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [availableChains, setAvailableChains] = useState<CustomChain[]>(BUILTIN_CHAINS);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'fcfs' | 'gtd' | 'closed'>('all');
  const [networkFilter, setNetworkFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchRaffles = async () => {
    try {
      setLoading(true);
      const [rRes, chRes] = await Promise.all([
        fetch('/api/raffles'),
        fetch('/api/chains'),
      ]);
      const [rData, chData] = await Promise.all([
        rRes.json(),
        chRes.json(),
      ]);
      if (rData.success && rData.raffles) {
        setRaffles(rData.raffles);
      }
      if (chData.success && chData.chains) {
        setAvailableChains(chData.chains);
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

  const filterChains = useMemo(() => {
    const list: Array<{ id: string; name: string; logoUrl?: string; network?: string }> = [
      { id: 'all', name: 'ALL' },
    ];

    const added = new Set<string>();

    // 1. Add chains from existing raffles
    for (const r of raffles) {
      const raw = (r.customNetwork || r.network || '').trim();
      if (raw) {
        const key = raw.toLowerCase();
        if (!added.has(key)) {
          added.add(key);
          list.push({
            id: key,
            name: raw,
            logoUrl: r.customNetworkLogoUrl,
            network: r.network,
          });
        }
      }
    }

    // 2. Add standard and saved custom chains
    for (const c of availableChains) {
      const key = (c.isBuiltIn ? c.network : c.name).toLowerCase();
      if (!added.has(key) && !added.has(c.name.toLowerCase())) {
        added.add(key);
        list.push({
          id: key,
          name: c.isBuiltIn ? (c.network === 'ROBINHOOD' ? 'Robinhood' : c.network === 'ETHEREUM' ? 'Ethereum' : c.name.split(' ')[0]) : c.name,
          logoUrl: c.logoUrl,
          network: c.network,
        });
      }
    }

    return list;
  }, [raffles, availableChains]);

  const filteredRaffles = raffles.filter(r => {
    const isLive = r.status === 'live' || r.status === 'ending_soon';
    const mintStage = r.mintStage || (r.entryMethod === 'fcfs' ? 'FCFS' : 'GTD');

    if (statusFilter === 'live' && !isLive) return false;
    if (statusFilter === 'closed' && isLive) return false;
    if (statusFilter === 'fcfs' && mintStage !== 'FCFS') return false;
    if (statusFilter === 'gtd' && mintStage !== 'GTD') return false;

    if (networkFilter !== 'all') {
      const net = networkFilter.toLowerCase();
      const raffleNet = (r.network || '').toLowerCase();
      const raffleCustomNet = (r.customNetwork || '').toLowerCase();
      if (
        raffleNet !== net &&
        raffleCustomNet !== net &&
        !raffleCustomNet.includes(net) &&
        !raffleNet.includes(net)
      ) {
        return false;
      }
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
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#293681] selection:text-white">
      {/* Navigation Header */}
      <Header />

      {/* Hero Section */}
      <DotsetHero />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-16">
        
        {/* ACTIVE RAFFLES DIRECTORY */}
        <section id="active-raffles" className="scroll-mt-24 space-y-6">
          
          {/* Section Header with Dotset glowing indicator */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-1 h-6 rounded bg-[#293681]" />
              <div>
                <h2 className="font-syne text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                  Featured Allocations
                </h2>
                <p className="font-dm text-xs text-gray-500">
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
                className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 pl-9 font-dm text-xs text-gray-900 placeholder-gray-400 outline-none focus:border-[#293681] focus:ring-1 focus:ring-[#293681] transition-colors"
              />
              <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
            </div>
          </div>

          {/* Filter Tabs & Network Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-1.5 font-dm text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-[#293681] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                All ({raffles.length})
              </button>
              <button
                onClick={() => setStatusFilter('live')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === 'live'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusFilter === 'live' ? 'bg-white' : 'bg-[#16a34a] animate-pulse'}`} />
                <span>Live</span>
              </button>
              <button
                onClick={() => setStatusFilter('fcfs')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === 'fcfs'
                    ? 'bg-[#ea580c] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                FCFS
              </button>
              <button
                onClick={() => setStatusFilter('gtd')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === 'gtd'
                    ? 'bg-[#4274d9] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Guaranteed
              </button>
              <button
                onClick={() => setStatusFilter('closed')}
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  statusFilter === 'closed'
                    ? 'bg-gray-800 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                Closed
              </button>
            </div>

            {/* Dynamic Network Pills */}
            <div className="flex flex-wrap items-center gap-1.5 font-mono-dm text-[11px]">
              {filterChains.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setNetworkFilter(c.id)}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium transition-all uppercase border ${
                    networkFilter === c.id
                      ? 'bg-[#293681] text-white border-[#293681] shadow-sm'
                      : 'bg-white text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  {c.id !== 'all' && (
                    <ChainLogo
                      network={c.network || c.id}
                      customNetwork={c.name}
                      customNetworkLogoUrl={c.logoUrl}
                      size={13}
                    />
                  )}
                  <span>{c.name}</span>
                </button>
              ))}
            </div>

          </div>

          {/* Campaign Grid */}
          {loading ? (
            <div className="bg-gray-50 border border-gray-200 p-12 rounded-2xl text-center space-y-3">
              <span className="w-6 h-6 border-2 border-[#293681] border-t-transparent animate-spin inline-block rounded-full" />
              <p className="font-dm text-xs text-gray-500">
                Fetching active campaigns...
              </p>
            </div>
          ) : filteredRaffles.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 p-12 rounded-2xl text-center space-y-3">
              <p className="font-dm text-sm text-gray-800 font-semibold">
                No allocations matching this filter.
              </p>
              <button
                onClick={() => {
                  setStatusFilter('all');
                  setNetworkFilter('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 bg-[#293681] text-white text-xs font-semibold rounded-xl hover:bg-[#1f2963] transition-colors"
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
