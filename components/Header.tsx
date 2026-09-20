'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useWallet } from '@/lib/wallet-context';
import { ProfileModal } from './ProfileModal';
import { User, Menu, X, Sparkles } from 'lucide-react';

export function Header() {
  const { isConnected, isAdmin } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b-3 border-black select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo & Brand (DOTSET with Uploaded Logo) */}
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/images/dotset-logo.png"
                alt="DOTSET"
                className="h-11 w-auto object-contain group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col">
                <span className="font-pixel text-lg sm:text-xl font-bold tracking-tight text-black group-hover:text-black/80">
                  DOTSET
                </span>
                <span className="font-mono text-[9px] sm:text-[10px] tracking-widest text-gray-600 font-bold uppercase">
                  WHITELIST & RAFFLES
                </span>
              </div>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center space-x-2 font-mono text-xs font-bold text-black uppercase">
              <Link 
                href="/#active-raffles" 
                className="px-3 py-2 border-2 border-transparent hover:border-black hover:bg-black hover:text-white transition-all"
              >
                [RAFFLES]
              </Link>
              <Link 
                href="/request-collab" 
                className="px-3 py-2 border-2 border-transparent hover:border-black hover:bg-black hover:text-white transition-all"
              >
                [REQUEST COLLAB]
              </Link>
              <Link 
                href="/how-it-works" 
                className="px-3 py-2 border-2 border-transparent hover:border-black hover:bg-black hover:text-white transition-all"
              >
                [HOW IT WORKS]
              </Link>
              <Link 
                href="/#winners" 
                className="px-3 py-2 border-2 border-transparent hover:border-black hover:bg-black hover:text-white transition-all"
              >
                [WINNERS]
              </Link>

              {/* Admin Panel link for admin wallet */}
              {isAdmin && (
                <Link
                  href="/admin"
                  className="bg-black text-white hover:bg-white hover:text-black px-3 py-2 border-2 border-black font-pixel text-[10px] transition-all flex items-center gap-1 shadow-pixel-xs"
                >
                  <Sparkles size={12} />
                  <span>[ADMIN]</span>
                </Link>
              )}
            </nav>

            {/* Right Action: Profile + Connect Wallet */}
            <div className="hidden md:flex items-center space-x-2.5">
              {isConnected && (
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="bg-white hover:bg-black hover:text-white text-black p-2.5 border-2 border-black transition-colors flex items-center justify-center shadow-pixel-sm"
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
                              <span className="w-2 h-2 bg-white inline-block animate-ping" />
                              <span>[CONNECT WALLET]</span>
                            </button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <button
                              onClick={openChainModal}
                              type="button"
                              className="bg-red-600 text-white border-2 border-black font-pixel text-[10px] py-2 px-3 shadow-pixel-xs"
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
                              className="bg-black text-white hover:bg-white hover:text-black border-2 border-black font-mono text-xs font-bold py-2 px-3 shadow-pixel-xs flex items-center gap-2 transition-colors"
                            >
                              <span className="w-2 h-2 rounded-full bg-white inline-block" />
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
                  className="bg-white text-black p-2 border-2 border-black shadow-pixel-xs flex items-center justify-center"
                  title="My Profile"
                >
                  <User size={16} />
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-b-3 border-black px-4 pt-3 pb-6 space-y-2.5 font-mono font-bold text-xs uppercase">
            <Link
              href="/#active-raffles"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 border-2 border-black bg-white hover:bg-black hover:text-white"
            >
              [RAFFLES]
            </Link>
            <Link
              href="/request-collab"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 border-2 border-black bg-white hover:bg-black hover:text-white"
            >
              [REQUEST COLLAB]
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 border-2 border-black bg-white hover:bg-black hover:text-white"
            >
              [HOW IT WORKS]
            </Link>
            <Link
              href="/#winners"
              onClick={() => setMobileMenuOpen(false)}
              className="block p-2.5 border-2 border-black bg-white hover:bg-black hover:text-white"
            >
              [WINNERS]
            </Link>

            {isConnected && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfileModalOpen(true);
                }}
                className="w-full text-left p-2.5 border-2 border-black bg-black text-white font-pixel text-[10px] flex items-center gap-2"
              >
                <User size={14} />
                <span>[MY PROFILE PASSPORT]</span>
              </button>
            )}

            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block p-2.5 border-2 border-black bg-black text-white font-pixel text-[10px]"
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
