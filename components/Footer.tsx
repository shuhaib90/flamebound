'use client';

import React from 'react';
import Link from 'next/link';
import { PixelFlame } from './PixelFlame';
import { FLAMEBOUND_PRIMARY_CONTRACT, formatAddress } from '@/lib/blockchain';
import { useWallet } from '@/lib/wallet-context';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const { isAdmin } = useWallet();

  return (
    <footer className="bg-black text-lime border-t-4 border-black py-12 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b-2 border-lime/30">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/images/flamebound-logo.png"
                alt="Flamebound Logo"
                className="h-10 w-auto object-contain drop-shadow-sm"
              />
              <span className="font-pixel text-lg text-white tracking-wider font-bold">
                FLAMEBOUND
              </span>
            </div>
            <p className="font-mono text-xs text-lime font-bold">
              Official Whitelist Raffle System for Flamebound NFT Holders.
            </p>
            <p className="font-mono text-xs text-gray-400 max-w-md leading-relaxed">
              Verify NFT holdings on-chain to participate in live allocations and partner mint whitelists.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-2 font-pixel text-xs">
            <div className="text-white uppercase font-bold text-[11px] mb-2 border-b border-lime/20 pb-1">
              NAVIGATION
            </div>
            <ul className="space-y-2">
              <li>
                <a href="#active-raffles" className="hover:text-white transition-colors">
                  [LIVE RAFFLES]
                </a>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition-colors">
                  [HOW IT WORKS]
                </Link>
              </li>
              <li>
                <a href="#winners" className="hover:text-white transition-colors">
                  [WINNERS]
                </a>
              </li>
              {isAdmin && (
                <li>
                  <Link href="/admin" className="text-lime hover:underline font-bold">
                    [★ ADMIN PANEL]
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Social & Contract Links */}
          <div className="space-y-2 font-pixel text-xs">
            <div className="text-white uppercase font-bold text-[11px] mb-2 border-b border-lime/20 pb-1">
              OFFICIAL LINKS
            </div>
            <ul className="space-y-2 font-mono text-xs font-bold">
              <li>
                <a
                  href="https://x.com/FlameboundNft"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>X (@FlameboundNft)</span>
                  <ExternalLink size={12} />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
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
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
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
                  className="flex items-center gap-1.5 hover:text-white transition-colors"
                >
                  <span>CONTRACT ({formatAddress(FLAMEBOUND_PRIMARY_CONTRACT)})</span>
                  <ExternalLink size={12} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-gray-400 font-bold">
          <div>
            &copy; 2026 FLAMEBOUND. ALL RIGHTS RESERVED.
          </div>
          <div className="flex items-center gap-4 text-lime">
            <span>OFFICIAL MINT PORTAL</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
