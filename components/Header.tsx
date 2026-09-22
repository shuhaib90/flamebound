'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet-context';
import { Menu, X, Twitter, Send, MessageSquare } from 'lucide-react';

export function Header() {
  const { isAdmin } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200 select-none h-16 flex items-center">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center group py-1">
            <img
              src="/images/dotset-logo.png"
              alt="dotset"
              className="h-6 sm:h-7 w-auto opacity-95 group-hover:opacity-100 transition-opacity object-contain"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 ml-6 font-dm text-sm font-medium text-gray-600">
            <Link 
              href="/#active-raffles" 
              className="px-3.5 py-1.5 rounded-md hover:text-[#293681] hover:bg-gray-100 transition-colors"
            >
              Raffles
            </Link>
            <Link 
              href="/how-it-works" 
              className="px-3.5 py-1.5 rounded-md hover:text-[#293681] hover:bg-gray-100 transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="/#winners" 
              className="px-3.5 py-1.5 rounded-md hover:text-[#293681] hover:bg-gray-100 transition-colors"
            >
              Winners
            </Link>
            <Link 
              href="/collab" 
              className="px-3.5 py-1.5 rounded-md hover:text-[#293681] hover:bg-gray-100 transition-colors text-blue-900 font-semibold"
            >
              Request Collab
            </Link>
          </nav>

          {/* Right Action: Socials, Live Pulse Badge & Explore Action */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Social Icons */}
            <div className="flex items-center space-x-1 pr-2 border-r border-gray-200">
              <a
                href="https://x.com/dotsetxyz"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-gray-500 hover:text-[#293681] hover:bg-gray-100 transition-colors"
                title="Follow DOTSET on X"
              >
                <Twitter size={15} />
              </a>
              <a
                href="https://discord.gg/Jq2Jt2HdfY"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-gray-500 hover:text-[#293681] hover:bg-gray-100 transition-colors"
                title="Join DOTSET Discord"
              >
                <MessageSquare size={15} />
              </a>
              <a
                href="https://t.me/dotset_xyz"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-gray-500 hover:text-[#293681] hover:bg-gray-100 transition-colors"
                title="DOTSET Telegram Channel"
              >
                <Send size={15} />
              </a>
            </div>

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 font-mono-dm text-xs text-gray-600">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
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
              className="p-2 rounded-lg bg-gray-100 border border-gray-200 text-gray-700"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 backdrop-blur-2xl border-b border-gray-200 px-4 py-4 space-y-2 font-dm text-sm z-50 shadow-lg">
          <Link
            href="/#active-raffles"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-gray-600 hover:text-[#293681] hover:bg-gray-50"
          >
            Raffles
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-gray-600 hover:text-[#293681] hover:bg-gray-50"
          >
            How It Works
          </Link>
          <Link
            href="/#winners"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-gray-600 hover:text-[#293681] hover:bg-gray-50"
          >
            Winners
          </Link>
          <Link
            href="/collab"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-[#293681] font-semibold hover:bg-gray-50"
          >
            Request Collab
          </Link>

          <div className="pt-2 border-t border-gray-200 flex items-center gap-3 px-2">
            <a
              href="https://x.com/dotsetxyz"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#293681]"
            >
              <Twitter size={14} />
              <span>X</span>
            </a>
            <a
              href="https://discord.gg/Jq2Jt2HdfY"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#293681]"
            >
              <MessageSquare size={14} />
              <span>Discord</span>
            </a>
            <a
              href="https://t.me/dotset_xyz"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#293681]"
            >
              <Send size={14} />
              <span>Telegram</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
