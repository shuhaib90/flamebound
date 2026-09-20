'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet-context';
import { ProfileModal } from './ProfileModal';
import { User, Menu, X, Sparkles, Send } from 'lucide-react';

export function Header() {
  const { isConnected, isAdmin } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/[0.08] select-none h-16 flex items-center">
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo & Brand matching CloudQuest */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 p-0.5 group-hover:border-white/25 transition-colors">
                <img
                  src="/images/dotset-logo.png"
                  alt="DOTSET"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-syne text-lg font-bold tracking-tight text-white group-hover:text-gray-200 transition-colors">
                DOTSET
              </span>
            </Link>

            {/* Desktop Nav Links (CloudQuest Style) */}
            <nav className="hidden md:flex items-center space-x-1 ml-6 font-dm text-sm font-medium text-[#8a8a9a]">
              <Link 
                href="/#active-raffles" 
                className="px-3.5 py-1.5 rounded-md hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Raffles
              </Link>
              <Link 
                href="/request-collab" 
                className="px-3.5 py-1.5 rounded-md hover:text-white hover:bg-white/[0.06] transition-colors"
              >
                Request Collab
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

              {isAdmin && (
                <Link
                  href="/admin"
                  className="px-3 py-1.5 rounded-md text-[#a5b4fc] bg-[#4f52c8]/20 border border-[#a5b4fc]/30 text-xs font-mono-dm flex items-center gap-1.5 ml-2 hover:bg-[#4f52c8]/30 transition-colors"
                >
                  <Sparkles size={12} />
                  <span>Admin</span>
                </Link>
              )}
            </nav>

            {/* Right Action: CloudQuest Live Pulse Badge & Action Button */}
            <div className="hidden md:flex items-center space-x-3">
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08] font-mono-dm text-xs text-[#8a8a9a]">
                <span className="w-2 h-2 rounded-full bg-[#4ade80] animate-pulse" />
                <span>Live Allocations</span>
              </div>

              <Link
                href="/request-collab"
                className="btn-primary-cq text-xs py-2 px-3.5 flex items-center gap-1.5 font-medium"
              >
                <Send size={12} />
                <span>Submit Collab</span>
              </Link>

              {isConnected && (
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-white border border-white/[0.08] transition-colors"
                  title="My Profile Passport"
                >
                  <User size={15} />
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              <Link
                href="/request-collab"
                className="btn-primary-cq text-[11px] py-1.5 px-2.5 font-medium"
              >
                Collab
              </Link>
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
          <div className="md:hidden absolute top-16 left-0 w-full bg-[#080808]/95 backdrop-blur-2xl border-b border-white/[0.08] px-4 py-4 space-y-2 font-dm text-sm">
            <Link
              href="/#active-raffles"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-lg text-[#8a8a9a] hover:text-white hover:bg-white/[0.05]"
            >
              Raffles
            </Link>
            <Link
              href="/request-collab"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 rounded-lg text-[#8a8a9a] hover:text-white hover:bg-white/[0.05]"
            >
              Request Collab
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

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 rounded-lg text-[#a5b4fc] bg-[#4f52c8]/20 border border-[#a5b4fc]/30 font-mono-dm text-xs"
              >
                Admin Controller
              </Link>
            )}
          </div>
        )}
      </header>

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />
    </>
  );
}
