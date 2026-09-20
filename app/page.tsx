'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { RaffleCard } from '@/components/RaffleCard';
import { HowItWorks } from '@/components/HowItWorks';
import { WinnersSection } from '@/components/WinnersSection';
import { Footer } from '@/components/Footer';
import { Raffle } from '@/lib/types';
import { Sparkles, Filter, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState<'all' | 'live' | 'fcfs' | 'gtd' | 'closed'>('all');
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

    if (stageFilter === 'live' && !isLive) return false;
    if (stageFilter === 'closed' && isLive) return false;
    if (stageFilter === 'fcfs' && mintStage !== 'FCFS') return false;
    if (stageFilter === 'gtd' && mintStage !== 'GTD') return false;

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
    <div className="min-h-screen flex flex-col bg-white selection:bg-black selection:text-white">
      {/* Fixed/Top Pixel Navigation Bar */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* LIVE RAFFLES DIRECTORY */}
        <section id="active-raffles" className="py-12 sm:py-16 border-b-3 border-black select-none bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b-3 border-black pb-4 mb-6 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-pixel text-[9px] bg-black text-white px-2 py-0.5 uppercase font-bold">
                    VERIFIED DIRECTORY
                  </span>
                  <span className="font-pixel text-[9px] border border-black px-2 py-0.5 uppercase font-bold text-gray-700">
                    {filteredRaffles.length} RAFFLE{filteredRaffles.length !== 1 ? 'S' : ''}
                  </span>
                </div>
                <h2 className="font-pixel text-xl sm:text-3xl md:text-4xl text-black font-extrabold uppercase tracking-tight">
                  ACTIVE RAFFLES & DROPS
                </h2>
              </div>

              {/* Search Bar */}
              <div className="w-full md:w-72 relative">
                <input
                  type="text"
                  placeholder="Search project name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border-2 border-black p-2 pl-8 font-mono text-xs text-black font-bold outline-none shadow-pixel-xs"
                />
                <Search size={14} className="absolute left-2.5 top-3 text-gray-500" />
              </div>
            </div>

            {/* EmperorJournals-Style Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
              
              {/* Stage Filter Buttons */}
              <div className="flex flex-wrap gap-1.5 font-pixel text-[9px] font-bold uppercase">
                <button
                  onClick={() => setStageFilter('all')}
                  className={`px-3 py-2 border-2 border-black transition-all ${
                    stageFilter === 'all' ? 'bg-black text-white shadow-pixel-xs' : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  [ALL ({raffles.length})]
                </button>
                <button
                  onClick={() => setStageFilter('live')}
                  className={`px-3 py-2 border-2 border-black transition-all ${
                    stageFilter === 'live' ? 'bg-black text-white shadow-pixel-xs' : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  ● LIVE NOW
                </button>
                <button
                  onClick={() => setStageFilter('fcfs')}
                  className={`px-3 py-2 border-2 border-black transition-all ${
                    stageFilter === 'fcfs' ? 'bg-black text-white shadow-pixel-xs' : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  [FCFS]
                </button>
                <button
                  onClick={() => setStageFilter('gtd')}
                  className={`px-3 py-2 border-2 border-black transition-all ${
                    stageFilter === 'gtd' ? 'bg-black text-white shadow-pixel-xs' : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  [GTD]
                </button>
                <button
                  onClick={() => setStageFilter('closed')}
                  className={`px-3 py-2 border-2 border-black transition-all ${
                    stageFilter === 'closed' ? 'bg-black text-white shadow-pixel-xs' : 'bg-white text-black hover:bg-gray-100'
                  }`}
                >
                  CLOSED
                </button>
              </div>

              {/* Network Pills */}
              <div className="flex flex-wrap gap-1 font-mono text-xs font-bold">
                {['all', 'robinhood', 'ethereum', 'base', 'polygon'].map((net) => (
                  <button
                    key={net}
                    onClick={() => setNetworkFilter(net)}
                    className={`px-2.5 py-1.5 border-2 border-black text-[10px] uppercase font-bold transition-colors ${
                      networkFilter === net ? 'bg-black text-white' : 'bg-gray-50 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {net === 'all' ? 'ALL NETWORKS' : net}
                  </button>
                ))}
              </div>

            </div>

            {/* Raffles Grid */}
            {loading ? (
              <div className="bg-white border-3 border-black p-12 text-center shadow-pixel space-y-3">
                <span className="w-4 h-4 border-2 border-black border-t-transparent animate-spin inline-block" />
                <p className="font-pixel text-xs text-black uppercase font-bold">
                  FETCHING VERIFIED RAFFLES...
                </p>
              </div>
            ) : filteredRaffles.length === 0 ? (
              <div className="bg-white border-3 border-black p-12 text-center shadow-pixel space-y-4">
                <p className="font-pixel text-xs text-black uppercase font-bold">
                  NO ACTIVE RAFFLES MATCHING FILTER.
                </p>
                <button
                  onClick={() => {
                    setStageFilter('all');
                    setNetworkFilter('all');
                    setSearchQuery('');
                  }}
                  className="pixel-btn text-xs py-2.5 px-4 shadow-pixel"
                >
                  RESET FILTERS
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {filteredRaffles.map((raffle) => (
                  <RaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    onEdit={() => router.push('/admin')}
                  />
                ))}
              </div>
            )}

          </div>
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
