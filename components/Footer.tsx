'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet-context';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const { isAdmin } = useWallet();

  return (
    <footer className="bg-[#080808] text-[#8a8a9a] border-t border-white/[0.08] py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-white/[0.06]">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-block py-1">
              <img
                src="/images/dotset-logo.png"
                alt="dotset"
                className="h-6 sm:h-7 w-auto brightness-0 invert opacity-95 object-contain"
              />
            </Link>
            <p className="font-dm text-xs text-[#8a8a9a] max-w-sm leading-relaxed">
              Open Web3 quest and whitelist raffle directory connecting crypto communities with verified early project allocations.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-2 font-dm text-xs">
            <div className="text-white uppercase font-semibold text-[11px] font-mono-dm mb-2">
              Platform
            </div>
            <ul className="space-y-2">
              <li>
                <a href="/#active-raffles" className="hover:text-white transition-colors">
                  Live Raffles
                </a>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="/#winners" className="hover:text-white transition-colors">
                  Winners Archive
                </a>
              </li>
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
                  href="https://x.com/dotsetxyz"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>𝕏 (Twitter)</span>
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
