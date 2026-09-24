'use client';

import React from 'react';
import Link from 'next/link';
import { useWallet } from '@/lib/wallet-context';
import { ExternalLink } from 'lucide-react';

export function Footer() {
  const { isAdmin } = useWallet();

  return (
    <footer className="bg-[#F9F9FB] dark:bg-[#07090f] text-gray-600 dark:text-slate-400 border-t border-gray-200 dark:border-slate-800/80 py-12 select-none transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-gray-200 dark:border-slate-800/80">
          
          {/* Brand */}
          <div className="md:col-span-2 space-y-3">
            <Link href="/" className="inline-block py-1">
              <img
                src="/images/dotset-logo.png"
                alt="dotset"
                className="h-6 sm:h-7 w-auto opacity-95 object-contain dark:brightness-110"
              />
            </Link>
            <p className="font-dm text-xs text-gray-500 dark:text-slate-400 max-w-sm leading-relaxed">
              Open Web3 quest and whitelist raffle directory connecting crypto communities with verified early project allocations.
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-2 font-dm text-xs">
            <div className="text-gray-900 dark:text-slate-100 uppercase font-semibold text-[11px] font-mono-dm mb-2">
              Platform
            </div>
            <ul className="space-y-2">
              <li>
                <a href="/#active-raffles" className="text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 transition-colors">
                  Live Raffles
                </a>
              </li>
              <li>
                <Link href="/how-it-works" className="text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <a href="/#winners" className="text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 transition-colors">
                  Winners Archive
                </a>
              </li>
              <li>
                <Link href="/collab" className="text-[#293681] dark:text-blue-400 font-semibold hover:underline transition-colors flex items-center gap-1">
                  <span>Submit Collab Request</span>
                  <span className="px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-900/40 text-[10px] text-blue-800 dark:text-blue-300 uppercase font-mono-dm">Partner</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div className="space-y-2 font-dm text-xs">
            <div className="text-gray-900 dark:text-slate-100 uppercase font-semibold text-[11px] font-mono-dm mb-2">
              Community & Social
            </div>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/dotsetarena"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 transition-colors"
                >
                  <span>𝕏 (Twitter)</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/Jq2Jt2HdfY"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 transition-colors"
                >
                  <span>Discord Community</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/dotset_xyz"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 transition-colors"
                >
                  <span>Telegram Channel</span>
                  <ExternalLink size={11} />
                </a>
              </li>
              <li>
                <a
                  href="https://t.me/+z9ju9E3IXBEwNTdl"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-gray-600 dark:text-slate-400 hover:text-[#293681] dark:hover:text-blue-400 transition-colors"
                >
                  <span>Telegram Group</span>
                  <ExternalLink size={11} />
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 font-dm text-xs text-gray-500 dark:text-slate-500">
          <div>
            &copy; 2026 DOTSET. All rights reserved.
          </div>
          <div className="flex items-center gap-1 text-gray-600 dark:text-slate-400 font-medium">
            <span>Empowering Web3 communities</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
