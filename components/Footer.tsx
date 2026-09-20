'use client';

import React from 'react';
import Link from 'next/link';
import { FLAMEBOUND_PRIMARY_CONTRACT, formatAddress } from '@/lib/blockchain';
import { useWallet } from '@/lib/wallet-context';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const { isAdmin } = useWallet();

  return (
    <footer className="bg-white text-black border-t-3 border-black py-10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b-2 border-black/20">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/images/dotset-logo.png"
                alt="DOTSET Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="font-pixel text-lg text-black tracking-wider font-bold">
                DOTSET
              </span>
            </div>
            <p className="font-mono text-xs text-gray-800 font-bold">
              Official Whitelist & Allocation System for DOTSET Community & Partners.
            </p>
            <p className="font-mono text-xs text-gray-600 max-w-md leading-relaxed">
              Verify NFT holdings on-chain to participate in live guaranteed allocations and partner mint whitelists.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2 font-pixel text-xs">
            <div className="text-black uppercase font-bold text-[10px] mb-2 border-b border-black/20 pb-1">
              NAVIGATION
            </div>
            <ul className="space-y-2 font-mono text-xs font-bold">
              <li>
                <a href="#active-raffles" className="hover:underline transition-colors">
                  [RAFFLES]
                </a>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:underline transition-colors">
                  [HOW IT WORKS]
                </Link>
              </li>
              <li>
                <a href="#winners" className="hover:underline transition-colors">
                  [WINNERS]
                </a>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/admin" className="text-black hover:underline font-bold">
                    [★ ADMIN PANEL]
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Social & Contract Links */}
          <div className="space-y-2 font-pixel text-xs">
            <div className="text-black uppercase font-bold text-[10px] mb-2 border-b border-black/20 pb-1">
              OFFICIAL LINKS
            </div>
            <ul className="space-y-2 font-mono text-xs font-bold">
              <li>
                <a
                  href="https://x.com/FlameboundNft"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:underline transition-colors"
                >
                  <span>X (TWITTER)</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:underline transition-colors"
                >
                  <span>DISCORD</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://opensea.io/collection/flamebound-259045050"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:underline transition-colors"
                >
                  <span>OPENSEA COLLECTION</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href={`https://etherscan.io/address/${FLAMEBOUND_PRIMARY_CONTRACT}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:underline transition-colors"
                >
                  <span>CONTRACT ({formatAddress(FLAMEBOUND_PRIMARY_CONTRACT)})</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-gray-600 font-bold">
          <div>
            &copy; 2026 DOTSET. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-3 text-black">
            <span>OFFICIAL WL PORTAL</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
