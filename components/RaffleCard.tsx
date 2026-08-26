'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Raffle } from '@/lib/types';
import { PixelArtwork } from './PixelArtworks';
import { useWallet } from '@/lib/wallet-context';
import { 
  ArrowRight,
  Share2, 
  Twitter, 
  Check, 
  Edit3,
  Clock,
  Flame
} from 'lucide-react';

interface RaffleCardProps {
  raffle: Raffle;
  onEnter?: (raffle: Raffle) => void;
  onEdit?: (raffle: Raffle) => void;
}

export function RaffleCard({ raffle, onEdit }: RaffleCardProps) {
  const router = useRouter();
  const { isAdmin } = useWallet();
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
  const raffleSlug = raffle.slug || raffle.id;
  const rafflePageUrl = `/raffle/${raffleSlug}`;

  const getShortUrl = () => {
    if (typeof window !== 'undefined') {
      return `${window.location.origin}/r/${raffleSlug}`;
    }
    return `https://flamebound.site/r/${raffleSlug}`;
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const url = getShortUrl();
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    }
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shortUrl = getShortUrl();
    const roleType = raffle.eligibility === 'public' ? 'Public' : raffle.eligibility === 'holders_only' ? 'Holders' : 'Minters';
    const methodType = raffle.entryMethod === 'fcfs' ? '⚡ FCFS Instant Claim' : '🎲 Verified Draw';
    const text = `🔥 ${raffle.title} Whitelist Drop\n🎟️ ${raffle.supply} Spots • ${methodType} (${roleType})\n\nEnter now:`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shortUrl)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div 
      id={`raffle-${raffle.id}`}
      className="bg-white border-3 sm:border-4 border-black shadow-pixel sm:shadow-pixel-lg flex flex-col justify-between transition-transform duration-150 hover:-translate-y-1 hover:shadow-pixel-xl select-none scroll-mt-28 group"
    >
      <div>
        {/* Card Header Bar */}
        <div className="bg-black text-lime px-3 sm:px-4 py-2 flex items-center justify-between border-b-3 sm:border-b-4 border-black">
          <div className="flex items-center gap-2 truncate">
            {raffle.logoUrl ? (
              <img
                src={raffle.logoUrl}
                alt={raffle.project}
                className="w-5 h-5 object-contain shrink-0"
              />
            ) : (
              <span className="w-2 h-2 bg-lime inline-block" />
            )}
            <span className="font-pixel text-[10px] sm:text-[11px] text-white tracking-wide truncate uppercase font-bold">
              {raffle.project || 'FLAMEBOUND'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <span className={`font-pixel text-[8px] sm:text-[9px] px-1.5 py-0.5 border border-black font-bold ${
              raffle.entryMethod === 'fcfs' ? 'bg-lime text-black' : 'bg-white text-black'
            }`}>
              {raffle.entryMethod === 'fcfs' ? '⚡ FCFS' : raffle.type || 'WL RAFFLE'}
            </span>
            <span className="font-pixel text-[8px] sm:text-[9px] bg-black text-white px-1.5 py-0.5 border border-white/40 font-bold">
              {raffle.eligibility === 'public' ? '🌐 OPEN' : raffle.eligibility === 'holders_only' ? '🛡️ HOLDERS' : '🔥 MINTERS'}
            </span>
            <span className={`font-pixel text-[8px] sm:text-[9px] px-1.5 sm:px-2 py-0.5 border border-black font-bold ${
              isLive ? 'bg-lime text-black animate-pulse' : 'bg-red-600 text-white'
            }`}>
              {isLive ? '■ LIVE' : 'CLOSED'}
            </span>
          </div>
        </div>

        {/* Artwork Image Banner with Direct Link */}
        <Link href={rafflePageUrl} className="block relative border-b-3 sm:border-b-4 border-black bg-black flex items-center justify-center overflow-hidden h-40 sm:h-44 cursor-pointer">
          <PixelArtwork
            type={raffle.artworkType}
            bannerUrl={raffle.bannerUrl}
            logoUrl={raffle.logoUrl}
            className="w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
          
          <div className="absolute top-2 right-2 bg-black/90 border border-lime px-2 py-0.5 text-lime font-pixel text-[8px] sm:text-[9px] font-bold shadow-pixel-xs">
            [{raffle.customNetwork || raffle.network || 'ROBINHOOD NETWORK'}]
          </div>

          {raffle.entryMethod === 'fcfs' && (
            <div className="absolute top-2 left-2 bg-lime text-black border border-black px-2 py-0.5 font-pixel text-[8px] sm:text-[9px] font-bold shadow-pixel-xs">
              ⚡ FCFS INSTANT WL
            </div>
          )}

          {raffle.notes && (
            <div className="absolute bottom-2 left-2 bg-black/90 text-lime font-mono text-[9px] sm:text-[10px] px-2 py-0.5 border border-lime truncate max-w-[90%] font-bold">
              ⚡ {raffle.notes}
            </div>
          )}
        </Link>

        {/* Highlighted Specs Only */}
        <div className="p-3 sm:p-4 space-y-3">
          <div>
            <Link href={rafflePageUrl}>
              <h3 className="font-pixel text-sm sm:text-base font-bold text-black uppercase tracking-tight line-clamp-1 hover:text-gray-700 transition-colors">
                {raffle.title}
              </h3>
            </Link>
          </div>

          {/* Compact 2x2 Highlights Badge Grid */}
          <div className="grid grid-cols-2 gap-1.5 bg-lime/15 border-2 sm:border-3 border-black p-2.5 font-mono text-xs">
            <div>
              <span className="text-[8px] font-pixel text-gray-700 block font-bold">
                {raffle.entryMethod === 'fcfs' ? 'FCFS SPOTS:' : 'WL SPOTS:'}
              </span>
              <span className="font-pixel text-[11px] text-black font-bold mt-0.5 block">{raffle.supply} SPOTS</span>
            </div>

            <div>
              <span className="text-[8px] font-pixel text-gray-700 block font-bold">MINT PRICE:</span>
              <span className="font-mono text-xs font-bold text-black mt-0.5 block truncate">
                {raffle.mintPrice || 'FREE'}
              </span>
            </div>

            <div className="pt-1 border-t border-black/15">
              <span className="text-[8px] font-pixel text-gray-700 block font-bold">
                {raffle.entryMethod === 'fcfs' ? 'CLAIMED:' : 'ENTRIES:'}
              </span>
              <span className="font-pixel text-[10px] text-black font-bold mt-0.5 block">
                {raffle.entryMethod === 'fcfs' 
                  ? `${raffle.totalEntries} / ${raffle.supply} CLAIMED` 
                  : `${raffle.totalEntries} ENTRIES`}
              </span>
            </div>

            <div className="pt-1 border-t border-black/15">
              <span className="text-[8px] font-pixel text-gray-700 block font-bold">ELIGIBILITY:</span>
              <span className="font-mono text-[10px] font-bold text-black mt-0.5 block truncate">
                {raffle.eligibility === 'public' ? 'OPEN TO ALL' : raffle.eligibility === 'holders_only' ? 'HOLDERS' : 'MINTERS'}
              </span>
            </div>
          </div>

          {/* Compact Countdown Bar */}
          <div className="bg-black text-lime px-2.5 py-1.5 border-2 border-black flex items-center justify-between text-[9px] font-pixel font-bold shadow-pixel-xs">
            <span className="text-white flex items-center gap-1">
              <Clock size={11} className="text-lime" />
              <span>ENDS:</span>
            </span>
            {isLive ? (
              <span className="text-lime tracking-wide">
                {String(timeLeft.days).padStart(2, '0')}D : {String(timeLeft.hours).padStart(2, '0')}H : {String(timeLeft.minutes).padStart(2, '0')}M : {String(timeLeft.seconds).padStart(2, '0')}S
              </span>
            ) : (
              <span className="text-red-400">CLOSED</span>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons: Open Full Page + Share + Twitter */}
      <div className="p-3 sm:p-4 pt-0 space-y-2">
        <div className="flex gap-2">
          {/* Main Enter CTA (Navigates to Full Page) */}
          <Link
            href={rafflePageUrl}
            className={`flex-1 text-[10px] sm:text-xs py-2.5 sm:py-3 flex items-center justify-center gap-1.5 ${
              isLive
                ? (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                  ? 'bg-gray-300 text-gray-600 border-3 border-black cursor-not-allowed font-pixel text-[9px]'
                  : 'pixel-btn shadow-pixel hover:bg-black/90'
                : 'bg-gray-300 text-gray-600 border-3 border-black cursor-not-allowed font-pixel text-[9px] sm:text-[10px]'
            }`}
          >
            <span>
              {isLive 
                ? (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                  ? '[FCFS FILLED]'
                  : raffle.entryMethod === 'fcfs' 
                  ? '[CLAIM FCFS SPOT]' 
                  : '[ENTER RAFFLE]'
                : '[VIEW DETAILS]'}
            </span>
            <ArrowRight size={13} />
          </Link>

          {/* Share SVG Icon */}
          <button
            type="button"
            onClick={handleShare}
            className="w-10 sm:w-11 bg-white text-black hover:bg-black hover:text-lime border-2 sm:border-3 border-black flex items-center justify-center shadow-pixel transition-colors shrink-0"
            title="Copy Raffle Link"
            aria-label="Copy Raffle Link"
          >
            {copiedShare ? <Check size={16} className="text-black" /> : <Share2 size={16} />}
          </button>

          {/* Twitter SVG Icon */}
          <button
            type="button"
            onClick={handleTwitterShare}
            className="w-10 sm:w-11 bg-black text-lime hover:bg-white hover:text-black border-2 sm:border-3 border-black flex items-center justify-center shadow-pixel transition-colors shrink-0"
            title="Share on X"
            aria-label="Share on X"
          >
            <Twitter size={16} />
          </button>
        </div>

        {/* If Admin connected, show direct card editing button */}
        {isAdmin && onEdit && (
          <button
            onClick={() => onEdit(raffle)}
            className="w-full pixel-btn-white text-[9px] py-1.5 flex items-center justify-center gap-1 border-2 border-black"
          >
            <Edit3 size={11} />
            <span>[ADMIN: EDIT]</span>
          </button>
        )}
      </div>

    </div>
  );
}