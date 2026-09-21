'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet-context';
import { Menu, X } from 'lucide-react';

export function Header() {
  const { isAdmin } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.08] select-none h-16 flex items-center">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center group py-1">
            <img
              src="/images/dotset-logo.png"
              alt="dotset"
              className="h-6 sm:h-7 w-auto brightness-0 invert opacity-95 group-hover:opacity-100 transition-opacity object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 ml-6 font-dm text-sm font-medium text-[#8a8a9a]">
            <Link 
              href="/#active-raffles" 
              className="px-3.5 py-1.5 rounded-md hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Raffles
            </Link>
            <Link 
              href="/how-it-works" 
              className="px-3.5 py-1.5 rounded-md hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="/#winners" 
              className="px-3.5 py-1.5 rounded-md hover:text-white hover:bg-white/[0.06] transition-colors"
            >
              Winners
            </Link>
          </nav>

          {/* Right Action: Live Pulse Badge & Explore Action */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] font-mono-dm text-xs text-[#8a8a9a]">
              <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
              <span>Live Allocations</span>
            </div>

            <a
              href="/#active-raffles"
              className="btn-primary-cq text-xs py-2 px-4 font-semibold"
            >
              <span>Explore Drops</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-[#080808]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-4 space-y-2 font-dm text-sm z-50">
          <Link
            href="/#active-raffles"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-[#8a8a9a] hover:text-white hover:bg-white/[0.05]"
          >
            Raffles
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-[#8a8a9a] hover:text-white hover:bg-white/[0.05]"
          >
            How It Works
          </Link>
          <Link
            href="/#winners"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-[#8a8a9a] hover:text-white hover:bg-white/[0.05]"
          >
            Winners
          </Link>
        </div>
      )}
    </header>
  );
}
