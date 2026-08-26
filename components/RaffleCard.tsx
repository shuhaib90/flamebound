'use client';

import React, { useState, useEffect } from 'react';
import { Raffle } from '@/lib/types';
import { PixelArtwork } from './PixelArtworks';
import { formatAddress } from '@/lib/blockchain';
import { useWallet } from '@/lib/wallet-context';
import { 
  Users, 
  ExternalLink, 
  Flame, 
  Clock, 
  Coins, 
  Tag, 
  Shield, 
  Edit3,
  Share2,
  Check,
  Twitter
} from 'lucide-react';

interface RaffleCardProps {
  raffle: Raffle;
  onEnter: (raffle: Raffle) => void;
  onEdit?: (raffle: Raffle) => void;
}

export function RaffleCard({ raffle, onEnter, onEdit }: RaffleCardProps) {
  const { isConnected, isAdmin } = useWallet();
  const [copiedShare, setCopiedShare] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  useEffect(() => {
    const calculateTime = () => {
      const difference = new Date(raffle.endDate).getTime() - new Date().getTime();
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isEnded: false,
      });
    };

    calculateTime();
    const timer = setInterval(calculateTime, 1000);
    return () => clearInterval(timer);
  }, [raffle.endDate]);

  const isLive = raffle.status === 'live' && !timeLeft.isEnded;

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/?raffle=${raffle.id}` 
      : `https://flamebound.com/?raffle=${raffle.id}`;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = typeof window !== 'undefined' 
      ? `${window.location.origin}/?raffle=${raffle.id}` 
      : `https://flamebound.com/?raffle=${raffle.id}`;
    const text = `Entering the @FlameboundNft whitelist raffle for ${raffle.title}! Check your holder eligibility & enter here:`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div 
      id={`raffle-${raffle.id}`}
      className="bg-white border-4 border-black shadow-pixel-lg flex flex-col justify-between transition-transform duration-200 hover:-translate-y-1 hover:shadow-pixel-xl select-none scroll-mt-28"
    >
      <div>
        {/* Card Header Bar */}
        <div className="bg-black text-lime px-4 py-2.5 flex items-center justify-between border-b-4 border-black">
          <div className="flex items-center gap-2 truncate">
            {raffle.logoUrl ? (
              <img
                src={raffle.logoUrl}
                alt={raffle.project}
                className="w-5 h-5 object-contain shrink-0 drop-shadow-sm"
              />
            ) : (
              <span className="w-2.5 h-2.5 bg-lime inline-block" />
            )}
            <span className="font-pixel text-[11px] text-white tracking-wide truncate uppercase font-bold">
              {raffle.project || 'FLAMEBOUND'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="font-pixel text-[9px] bg-white text-black px-1.5 py-0.5 border border-black font-bold">
              {raffle.type || 'WL RAFFLE'}
            </span>
            <span className={`font-pixel text-[9px] px-2 py-0.5 border border-black font-bold ${
              isLive ? 'bg-lime text-black animate-pulse' : 'bg-red-600 text-white'
            }`}>
              {isLive ? '■ LIVE' : 'CLOSED'}
            </span>
          </div>
        </div>

        {/* Artwork Image Banner */}
        <div className="relative border-b-4 border-black bg-black flex items-center justify-center overflow-hidden h-48 sm:h-52">
          <PixelArtwork
            type={raffle.artworkType}
            bannerUrl={raffle.bannerUrl}
            logoUrl={raffle.logoUrl}
            className="w-full h-full"
          />
          
          <div className="absolute top-2 right-2 bg-black/90 border-2 border-lime px-2 py-1 text-lime font-pixel text-[9px] font-bold shadow-pixel-sm">
            [{raffle.customNetwork || raffle.network || 'ROBINHOOD NETWORK'}]
          </div>

          {raffle.notes && (
            <div className="absolute bottom-2 left-2 bg-black/90 text-lime font-mono text-[10px] px-2 py-0.5 border border-lime truncate max-w-[90%] font-bold">
              ⚡ {raffle.notes}
            </div>
          )}
        </div>

        {/* Raffle Details Content */}
        <div className="p-4 sm:p-5 space-y-4">
          <div>
            <h3 className="font-pixel text-base sm:text-lg font-bold text-black uppercase tracking-tight line-clamp-1">
              {raffle.title}
            </h3>
            <p className="font-mono text-xs text-gray-800 font-bold mt-1 line-clamp-2">
              {raffle.subtitle}
            </p>
          </div>

          {/* NFT Mint & Whitelist Specifications Grid */}
          <div className="grid grid-cols-2 gap-2 bg-lime/20 border-3 border-black p-3 font-mono text-xs">
            <div className="border-b-2 sm:border-b-0 border-black/20 pb-1">
              <span className="font-pixel text-[8px] uppercase text-gray-700 block font-bold">WL ALLOCATION:</span>
              <span className="font-pixel text-xs text-black font-bold mt-0.5 block">{raffle.supply} SPOTS</span>
            </div>

            <div className="border-b-2 sm:border-b-0 border-black/20 pb-1">
              <span className="font-pixel text-[8px] uppercase text-gray-700 block font-bold">TOTAL NFT SUPPLY:</span>
              <span className="font-mono text-xs font-bold text-black mt-0.5 block">{raffle.nftTotalSupply || 'TBA'}</span>
            </div>

            <div className="pt-1">
              <span className="font-pixel text-[8px] uppercase text-gray-700 block font-bold">MINT PRICE:</span>
              <span className="font-mono text-xs font-bold text-black mt-0.5 block bg-white px-1 border border-black inline-block">
                {raffle.mintPrice || 'FREE'}
              </span>
            </div>

            <div className="pt-1">
              <span className="font-pixel text-[8px] uppercase text-gray-700 block font-bold">MINT DATE:</span>
              <span className="font-mono text-xs font-bold text-black mt-0.5 block truncate">
                {raffle.mintDate || 'TBA'}
              </span>
            </div>
          </div>

          {/* Spec Rows */}
          <div className="space-y-1.5 font-mono text-xs border-t-2 border-black pt-3">
            <div className="flex justify-between items-center text-gray-800">
              <span className="font-bold">NETWORK:</span>
              <span className="font-bold text-black">[{raffle.customNetwork || raffle.network || 'ROBINHOOD NETWORK'}]</span>
            </div>

            <div className="flex justify-between items-center text-gray-800">
              <span className="font-bold">MAX PER WL:</span>
              <span className="font-bold text-black">{raffle.maxMintPerWallet || '1 PER WL'}</span>
            </div>

            <div className="flex justify-between items-center text-gray-800">
              <span className="font-bold">TOTAL ENTRIES:</span>
              <span className="font-pixel text-[11px] font-bold text-black">{raffle.totalEntries} ENTRIES</span>
            </div>
          </div>

          {/* 4-Box Pixel Countdown Clock */}
          <div className="bg-black text-lime p-3 border-3 border-black shadow-pixel-sm space-y-2">
            <div className="flex items-center justify-between font-pixel text-[9px] border-b border-lime/30 pb-1.5 font-bold">
              <span className="text-white">RAFFLE ENDS:</span>
              <span className="text-lime">
                {new Date(raffle.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>

            {isLive ? (
              <div className="grid grid-cols-4 gap-1.5 text-center">
                <div className="bg-lime text-black p-1 border-2 border-black shadow-pixel-xs">
                  <span className="font-pixel text-xs font-bold block">{String(timeLeft.days).padStart(2, '0')}</span>
                  <span className="font-pixel text-[7px] block font-bold text-black/80">DAYS</span>
                </div>
                <div className="bg-lime text-black p-1 border-2 border-black shadow-pixel-xs">
                  <span className="font-pixel text-xs font-bold block">{String(timeLeft.hours).padStart(2, '0')}</span>
                  <span className="font-pixel text-[7px] block font-bold text-black/80">HRS</span>
                </div>
                <div className="bg-lime text-black p-1 border-2 border-black shadow-pixel-xs">
                  <span className="font-pixel text-xs font-bold block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                  <span className="font-pixel text-[7px] block font-bold text-black/80">MIN</span>
                </div>
                <div className="bg-lime text-black p-1 border-2 border-black shadow-pixel-xs">
                  <span className="font-pixel text-xs font-bold block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                  <span className="font-pixel text-[7px] block font-bold text-black/80">SEC</span>
                </div>
              </div>
            ) : (
              <div className="font-pixel text-[10px] text-center text-red-400 py-1 bg-red-950/40 border border-red-800 uppercase font-bold">
                ★ RAFFLE CONCLUDED ★
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card Action Buttons (Enter + Share SVG + Twitter SVG) */}
      <div className="p-4 sm:p-5 pt-0 space-y-2">
        <div className="flex gap-2">
          {/* Main Enter CTA */}
          <button
            onClick={() => onEnter(raffle)}
            disabled={!isLive}
            className={`flex-1 text-xs py-3.5 ${
              isLive
                ? 'pixel-btn shadow-pixel hover:bg-black/90'
                : 'bg-gray-300 text-gray-600 border-3 border-black cursor-not-allowed font-pixel text-[10px]'
            }`}
          >
            {isLive ? '[ENTER RAFFLE NOW]' : '[RAFFLE CLOSED]'}
          </button>

          {/* Share SVG Icon Only */}
          <button
            onClick={handleShare}
            className="w-12 bg-white text-black hover:bg-black hover:text-lime border-3 border-black flex items-center justify-center shadow-pixel transition-colors shrink-0"
            title="Copy Raffle Deep Link"
            aria-label="Copy Raffle Deep Link"
          >
            {copiedShare ? <Check size={18} className="text-black" /> : <Share2 size={18} />}
          </button>

          {/* Twitter SVG Icon Only */}
          <button
            onClick={handleTwitterShare}
            className="w-12 bg-black text-lime hover:bg-white hover:text-black border-3 border-black flex items-center justify-center shadow-pixel transition-colors shrink-0"
            title="Share on X (Twitter)"
            aria-label="Share on X (Twitter)"
          >
            <Twitter size={18} />
          </button>
        </div>

        {/* If Admin connected, show direct card editing button */}
        {isAdmin && (
          <button
            onClick={() => onEdit ? onEdit(raffle) : window.location.assign('/admin')}
            className="w-full pixel-btn-white text-[10px] py-2 flex items-center justify-center gap-1.5 border-2 border-black"
          >
            <Edit3 size={13} />
            <span>[ADMIN: EDIT RAFFLE SPECS]</span>
          </button>
        )}
      </div>

    </div>
  );
}
