'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { RaffleCard } from '@/components/RaffleCard';
import { RaffleModal } from '@/components/RaffleModal';
import { HowItWorks } from '@/components/HowItWorks';
import { WinnersSection } from '@/components/WinnersSection';
import { Footer } from '@/components/Footer';
import { Raffle } from '@/lib/types';
import { PixelFlame } from '@/components/PixelFlame';
import { Sparkles, Flame, RefreshCw, Filter } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRaffle, setSelectedRaffle] = useState<Raffle | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'live' | 'closed'>('all');

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

  // Handle direct share deep-linking ?raffle=raffleId
  useEffect(() => {
    if (typeof window !== 'undefined' && raffles.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const raffleId = params.get('raffle');
      if (raffleId) {
        const found = raffles.find(r => r.id === raffleId);
        if (found) {
          setSelectedRaffle(found);
          setIsModalOpen(true);
          setTimeout(() => {
            const el = document.getElementById(`raffle-${raffleId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 300);
        }
      }
    }
  }, [raffles]);

  const handleOpenRaffle = (raffle: Raffle) => {
    setSelectedRaffle(raffle);
    setIsModalOpen(true);
  };

  const handleEditRaffle = (raffle: Raffle) => {
    router.push('/admin');
  };

  const filteredRaffles = raffles.filter(r => {
    if (filter === 'live') return r.status === 'live' || r.status === 'ending_soon';
    if (filter === 'closed') return r.status === 'closed' || r.status === 'winners_drawn';
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-lime">
      {/* Fixed/Top Pixel Navigation Bar */}
      <Header />

      {/* Hero Section */}
      <Hero />

      {/* Main Content Area */}
      <main className="flex-1">
        
        {/* LIVE RAFFLES SECTION */}
        <section id="active-raffles" className="py-16 md:py-24 border-b-4 border-black select-none">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header with Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between border-b-4 border-black pb-4 mb-8 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Flame size={20} className="text-black fill-black" />
                  <span className="font-pixel text-xs bg-black text-lime px-2 py-0.5 uppercase font-bold">
                    ACTIVE ALLOCATIONS
                  </span>
                </div>
                <h2 className="font-pixel text-2xl sm:text-4xl md:text-5xl text-black font-extrabold uppercase tracking-tight">
                  LIVE RAFFLES
                </h2>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-2 font-pixel text-[10px]">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-2 border-3 border-black uppercase font-bold transition-all ${
                    filter === 'all' ? 'bg-black text-lime shadow-pixel-sm' : 'bg-white text-black hover:bg-black/10'
                  }`}
                >
                  ALL ({raffles.length})
                </button>
                <button
                  onClick={() => setFilter('live')}
                  className={`px-3 py-2 border-3 border-black uppercase font-bold transition-all ${
                    filter === 'live' ? 'bg-black text-lime shadow-pixel-sm' : 'bg-white text-black hover:bg-black/10'
                  }`}
                >
                  ■ LIVE ONLY
                </button>
                <button
                  onClick={() => setFilter('closed')}
                  className={`px-3 py-2 border-3 border-black uppercase font-bold transition-all ${
                    filter === 'closed' ? 'bg-black text-lime shadow-pixel-sm' : 'bg-white text-black hover:bg-black/10'
                  }`}
                >
                  CLOSED
                </button>
              </div>
            </div>

            {/* Raffles Grid */}
            {loading ? (
              <div className="bg-white border-4 border-black p-12 text-center shadow-pixel-lg">
                <div className="animate-spin inline-block mb-3">
                  <PixelFlame size={32} />
                </div>
                <p className="font-pixel text-xs text-black uppercase">
                  FETCHING LIVE WHITELIST RAFFLES...
                </p>
              </div>
            ) : filteredRaffles.length === 0 ? (
              <div className="bg-white border-4 border-black p-12 text-center shadow-pixel-lg space-y-3">
                <p className="font-pixel text-sm text-black uppercase font-bold">
                  NO ACTIVE RAFFLES MATCHING FILTER.
                </p>
                <button
                  onClick={() => setFilter('all')}
                  className="pixel-btn text-xs py-2 px-4 shadow-pixel"
                >
                  VIEW ALL RAFFLES
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredRaffles.map((raffle) => (
                  <RaffleCard
                    key={raffle.id}
                    raffle={raffle}
                    onEnter={handleOpenRaffle}
                    onEdit={handleEditRaffle}
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

      {/* Interactive Raffle Modal */}
      <RaffleModal
        raffle={selectedRaffle}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={() => {
          fetchRaffles();
        }}
      />
    </div>
  );
}
