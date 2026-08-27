'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/lib/wallet-context';
import { ProfileModal } from './ProfileModal';
import { User, ShieldCheck, Flame, Menu, X, ExternalLink } from 'lucide-react';

export function Header() {
  const { isConnected, isAdmin, address, shortAddress } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-lime border-b-4 border-black select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand (Clean Transparent PNG Logo) */}
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/images/flamebound-logo.png"
                alt="Flamebound"
                className="h-12 w-auto object-contain group-hover:scale-105 transition-transform drop-shadow-sm"
              />
              <div className="flex flex-col">
                <span className="font-pixel text-lg sm:text-xl font-bold tracking-wider text-black group-hover:text-black/80">
                  FLAMEBOUND
                </span>
                <span className="font-mono text-[10px] tracking-widest text-black/80 font-bold">
                  WL RAFFLE SYSTEM
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-6 font-mono text-xs font-bold text-black uppercase">
              <Link 
                href="/#active-raffles" 
                className="hover:bg-black hover:text-lime px-3 py-1.5 border-2 border-transparent hover:border-black transition-colors"
              >
                [LIVE RAFFLES]
              </Link>
              <Link 
                href="/how-it-works" 
                className="hover:bg-black hover:text-lime px-3 py-1.5 border-2 border-transparent hover:border-black transition-colors"
              >
                [HOW IT WORKS]
              </Link>
              <Link 
                href="/#winners" 
                className="hover:bg-black hover:text-lime px-3 py-1.5 border-2 border-transparent hover:border-black transition-colors"
              >
                [WINNERS]
              </Link>

              {/* Only show Admin Panel button if connected wallet is the official Admin wallet */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-black text-lime hover:bg-white hover:text-black px-3 py-1.5 border-2 border-black font-pixel text-[10px] transition-colors flex items-center gap-1 shadow-pixel-sm animate-pulse"
                >
                  <span>★ [ADMIN PANEL]</span>
                </Link>
              )}
            </nav>

            {/* Right Action: User Profile SVG Button + RainbowKit Connect Button */}
            <div className="hidden md:flex items-center space-x-2.5">
              {/* Profile SVG Icon Button (Placed directly near wallet button) */}
              {isConnected && (
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="bg-black text-lime hover:bg-white hover:text-black p-2.5 border-3 border-black transition-colors flex items-center justify-center shadow-pixel"
                  title="My Profile Passport"
                  aria-label="My Profile Passport"
                >
                  <User size={16} />
                </button>
              )}

              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  mounted,
                }) => {
                  const ready = mounted;
                  const connected = ready && account && chain;

                  return (
                    <div
                      {...(!ready && {
                        'aria-hidden': true,
                        style: {
                          opacity: 0,
                          pointerEvents: 'none',
                          userSelect: 'none',
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <button
                              onClick={openConnectModal}
                              type="button"
                              className="pixel-btn text-xs py-2.5 px-4 shadow-pixel flex items-center gap-2"
                            >
                              <span className="w-2 h-2 bg-lime inline-block animate-ping" />
                              <span>[CONNECT WALLET]</span>
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="bg-red-600 text-white border-3 border-black font-pixel text-[10px] py-2 px-3 shadow-pixel"
                            >
                              [WRONG NETWORK]
                            </button>
                          );
                        }

                        return (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={openAccountModal}
                              type="button"
                              className="bg-black text-lime hover:bg-black/90 border-3 border-black font-mono text-xs font-bold py-2 px-3 shadow-pixel flex items-center gap-2"
                            >
                              <span className="w-2 h-2 rounded-full bg-lime inline-block" />
                              <span>{account.displayName}</span>
                            </button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center gap-2">
              {isConnected && (
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="bg-black text-lime hover:bg-white hover:text-black p-2 border-2 border-black transition-colors flex items-center justify-center"
                  title="My Profile"
                >
                  <User size={16} />
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 border-3 border-black bg-black text-lime hover:bg-white hover:text-black transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-lime border-b-4 border-black px-4 pt-3 pb-6 space-y-3 font-mono font-bold text-xs uppercase">
            <Link
              href="/#active-raffles"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 border-2 border-black bg-white hover:bg-black hover:text-lime"
            >
              [LIVE RAFFLES]
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 border-2 border-black bg-white hover:bg-black hover:text-lime"
            >
              [HOW IT WORKS]
            </Link>
            <Link
              href="/#winners"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2 border-2 border-black bg-white hover:bg-black hover:text-lime"
            >
              [WINNERS]
            </Link>

            {isConnected && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileModalOpen(true);
                }}
                className="w-full text-left p-2 border-2 border-black bg-black text-lime font-pixel text-[10px] flex items-center gap-2"
              >
                <User size={14} />
                <span>[MY PROFILE PASSPORT]</span>
              </button>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2 border-2 border-black bg-black text-lime font-pixel text-[10px]"
              >
                ★ [ADMIN PANEL]
              </Link>
            )}

            <div className="pt-2">
              <ConnectButton />
            </div>
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
