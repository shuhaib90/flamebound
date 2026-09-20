'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet-context';
import { ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  const { isAdmin } = useWallet();

  return (
    <footer className="bg-[#080808] text-[#8a8a9a] border-t border-white/[0.08] py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/[0.06]">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg overflow-hidden flex items-center justify-center bg-white/5 border border-white/10 p-0.5">
                <img
                  src="/images/dotset-logo.png"
                  alt="DOTSET"
                  className="w-full h-full object-contain"
                />
              </div>
              <span className="font-syne text-lg text-white font-bold tracking-tight">
                DOTSET
              </span>
            </div>
            <p className="font-dm text-xs text-[#8a8a9a] max-w-sm leading-relaxed">
              Open Web3 quest and whitelist raffle directory connecting crypto communities with verified early projects.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-2 font-dm text-xs">
            <div className="text-white uppercase font-semibold text-[11px] font-mono-dm mb-2">
              Platform
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#active-raffles" className="hover:text-white transition-colors">
                  Live Raffles
                </a>
              </li>
              <li>
                <Link href="/request-collab" className="hover:text-white transition-colors">
                  Request Collab
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="#winners" className="hover:text-white transition-colors">
                  Winners Archive
                </a>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/admin" className="text-[#a5b4fc] hover:underline">
                    Admin Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-2 font-dm text-xs">
            <div className="text-white uppercase font-semibold text-[11px] font-mono-dm mb-2">
              Community & Social
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/FlameboundNft"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>X (Twitter)</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>Discord</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://opensea.io/collection/flamebound-259045050"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>OpenSea</span>
                  <ExternalLink size={11} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-dm text-xs text-[#555566]">
          <div>
            &copy; 2026 DOTSET. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-[#8a8a9a]">
            <span>Empowering Web3 communities</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
