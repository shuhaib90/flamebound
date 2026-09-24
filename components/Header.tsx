'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet-context';
import { Menu, X, Twitter, Send, MessageSquare } from 'lucide-react';
import { ThemeToggle } from '@/components/ThemeToggle';

export function Header() {
  const { isAdmin } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#090b14]/90 backdrop-blur-xl border-b border-gray-200 dark:border-slate-800 select-none h-16 flex items-center transition-colors duration-200">
      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center group py-1">
            <img
              src="/images/dotset-logo.png"
              alt="dotset"
              className="h-6 sm:h-7 w-auto opacity-95 group-hover:opacity-100 transition-opacity object-contain dark:brightness-110"
            />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 ml-6 font-dm text-sm font-medium text-gray-600 dark:text-slate-300">
            <Link 
              href="/#active-raffles" 
              className="px-3.5 py-1.5 rounded-md hover:text-[#293681] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              Raffles
            </Link>
            <Link 
              href="/how-it-works" 
              className="px-3.5 py-1.5 rounded-md hover:text-[#293681] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              How It Works
            </Link>
            <Link 
              href="/#winners" 
              className="px-3.5 py-1.5 rounded-md hover:text-[#293681] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors"
            >
              Winners
            </Link>
            <Link 
              href="/collab" 
              className="px-3.5 py-1.5 rounded-md hover:text-[#293681] dark:hover:text-blue-300 hover:bg-gray-100 dark:hover:bg-slate-800/60 transition-colors text-blue-900 dark:text-blue-400 font-semibold"
            >
              Request Collab
            </Link>
          </nav>

          {/* Right Action: Socials, Live Pulse Badge, Theme Toggle & Explore Action */}
          <div className="hidden md:flex items-center space-x-2.5">
            {/* Social Icons */}
            <div className="flex items-center space-x-1 pr-2 border-r border-gray-200 dark:border-slate-800">
              <a
                href="https://x.com/dotsetarena"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Follow DOTSET on X"
              >
                <Twitter size={15} />
              </a>
              <a
                href="https://discord.gg/Jq2Jt2HdfY"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="Join DOTSET Discord"
              >
                <MessageSquare size={15} />
              </a>
              <a
                href="https://t.me/dotset_xyz"
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg text-gray-500 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                title="DOTSET Telegram Channel"
              >
                <Send size={15} />
              </a>
            </div>

            {/* Night / Light Mode Toggle */}
            <ThemeToggle />

            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 dark:bg-slate-800/80 border border-gray-200 dark:border-slate-700 font-mono-dm text-xs text-gray-600 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
              <span>Live Allocations</span>
            </div>

            <a
              href="/#active-raffles"
              className="btn-primary-cq text-xs py-2 px-4 font-semibold shadow-sm"
            >
              <span>Explore Drops</span>
            </a>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-white/95 dark:bg-[#090b14]/95 backdrop-blur-2xl border-b border-gray-200 dark:border-slate-800 px-4 py-4 space-y-2 font-dm text-sm z-50 shadow-lg">
          <Link
            href="/#active-raffles"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-[#293681] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800/60"
          >
            Raffles
          </Link>
          <Link
            href="/how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-[#293681] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800/60"
          >
            How It Works
          </Link>
          <Link
            href="/#winners"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-gray-600 dark:text-slate-300 hover:text-[#293681] dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-slate-800/60"
          >
            Winners
          </Link>
          <Link
            href="/collab"
            onClick={() => setMobileMenuOpen(false)}
            className="block p-2.5 rounded-lg text-[#293681] dark:text-blue-400 font-semibold hover:bg-gray-50 dark:hover:bg-slate-800/60"
          >
            Request Collab
          </Link>

          <div className="pt-2 border-t border-gray-200 dark:border-slate-800 flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <a
                href="https://x.com/dotsetxyz"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400"
              >
                <Twitter size={14} />
                <span>X</span>
              </a>
              <a
                href="https://discord.gg/Jq2Jt2HdfY"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400"
              >
                <MessageSquare size={14} />
                <span>Discord</span>
              </a>
              <a
                href="https://t.me/dotset_xyz"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400"
              >
                <Send size={14} />
                <span>Telegram</span>
              </a>
            </div>
            
            <a
              href="/#active-raffles"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-primary-cq text-xs py-1.5 px-3 font-semibold"
            >
              Explore Drops
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
