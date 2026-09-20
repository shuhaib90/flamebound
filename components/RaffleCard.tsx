'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Sparkles
} from 'lucide-react';

interface RaffleCardProps {
  raffle: Raffle;
  onEnter?: (raffle: Raffle) => void;
  onEdit?: (raffle: Raffle) => void;
}

export function RaffleCard({ raffle, onEdit }: RaffleCardProps) {
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
  const mintStage = raffle.mintStage || (raffle.entryMethod === 'fcfs' ? 'FCFS' : 'GTD');

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
    const text = `DOTSET X ${raffle.project || raffle.title}\n[STAGE: ${mintStage}] • ${raffle.supply} SPOTS (${roleType})\n\nEnter now:`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shortUrl)}`;
    window.open(tweetUrl, '_blank');
  };

  // Format countdown like EmperorJournals (e.g. "17h 51m left" or "2d 14h left")
  const formatCountdown = () => {
    if (timeLeft.isEnded || !isLive) return 'Ended';
    if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h left`;
    if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m left`;
    return `${timeLeft.minutes}m ${timeLeft.seconds}s left`;
  };

  const collaboratorTitle = raffle.project && !raffle.title.toLowerCase().includes(raffle.project.toLowerCase())
    ? `DOTSET X ${raffle.project.toUpperCase()}`
    : raffle.title.toUpperCase();

  return (
    <div 
      id={`raffle-${raffle.id}`}
      className="bg-white border-2 sm:border-3 border-black shadow-pixel flex flex-col justify-between transition-all duration-150 hover:-translate-y-1 hover:shadow-pixel-lg select-none scroll-mt-28 group"
    >
      <div>
        {/* Artwork Image Banner (EmperorJournals style with overlay badges) */}
        <Link 
          href={rafflePageUrl} 
          className="block relative border-b-2 sm:border-b-3 border-black bg-black flex items-center justify-center overflow-hidden h-44 sm:h-48 cursor-pointer"
        >
          <PixelArtwork
            type={raffle.artworkType}
            bannerUrl={raffle.bannerUrl}
            logoUrl={raffle.logoUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Top-Left: Network & Stage Pills */}
          <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
            <span className="bg-black/90 text-white font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 border border-white/40 font-bold uppercase shadow-pixel-xs">
              {raffle.customNetwork || raffle.network || 'ROBINHOOD'}
            </span>
            <span className={`font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 border border-black font-bold uppercase shadow-pixel-xs ${
              mintStage === 'GTD' 
                ? 'bg-white text-black' 
                : mintStage === 'FCFS' 
                ? 'bg-black text-white' 
                : 'bg-white text-black'
            }`}>
              [{mintStage}]
            </span>
          </div>

          {/* Top-Right: Live / Closed Status */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <span className={`font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 border border-black font-bold uppercase shadow-pixel-xs ${
              isLive ? 'bg-white text-black animate-pulse' : 'bg-red-600 text-white'
            }`}>
              {isLive ? '● LIVE' : 'CLOSED'}
            </span>
          </div>

          {/* Bottom Banner Tag: Eligibility */}
          <div className="absolute bottom-2 left-2.5 bg-black/90 text-white font-pixel text-[8px] px-2 py-0.5 border border-white/30 truncate max-w-[85%] font-bold">
            {raffle.eligibility === 'public' ? 'OPEN TO ALL' : raffle.eligibility === 'holders_only' ? 'DOTSET HOLDERS ONLY' : 'DOTSET MINTERS ONLY'}
          </div>
        </Link>

        {/* Card Details */}
        <div className="p-3.5 sm:p-4 space-y-3">
          
          {/* Project Title */}
          <div>
            <Link href={rafflePageUrl}>
              <h3 className="font-pixel text-xs sm:text-sm font-bold text-black uppercase tracking-tight line-clamp-1 hover:underline">
                {collaboratorTitle}
              </h3>
            </Link>
            {raffle.subtitle && (
              <p className="font-mono text-[11px] text-gray-600 truncate mt-0.5 font-bold">
                {raffle.subtitle}
              </p>
            )}
          </div>

          {/* EmperorJournals 3-Box Stats Matrix */}
          <div className="grid grid-cols-3 gap-1.5 bg-gray-50 border-2 border-black p-2 font-mono text-center">
            
            {/* Ends In */}
            <div className="p-1 border-r border-black/20">
              <span className="text-[8px] font-pixel text-gray-600 block uppercase font-bold">ENDS IN</span>
              <span className="font-mono text-[11px] text-black font-bold mt-0.5 block truncate">
                {formatCountdown()}
              </span>
            </div>

            {/* Entries */}
            <div className="p-1 border-r border-black/20">
              <span className="text-[8px] font-pixel text-gray-600 block uppercase font-bold">ENTRIES</span>
              <span className="font-mono text-[11px] text-black font-bold mt-0.5 block truncate">
                {raffle.totalEntries || 0}
              </span>
            </div>

            {/* Spots */}
            <div className="p-1">
              <span className="text-[8px] font-pixel text-gray-600 block uppercase font-bold">SPOTS</span>
              <span className="font-pixel text-[10px] text-black font-bold mt-0.5 block truncate">
                {raffle.supply}
              </span>
            </div>

          </div>

          {/* Mint Price & Stage Row */}
          <div className="flex justify-between items-center text-[11px] font-mono px-1 font-bold text-gray-700">
            <span>MINT PRICE: <strong className="text-black">{raffle.mintPrice || 'FREE'}</strong></span>
            <span>DATE: <strong className="text-black">{raffle.mintDate || 'TBA'}</strong></span>
          </div>

        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-3.5 sm:p-4 pt-0 space-y-2">
        <div className="flex gap-2">
          {/* Main CTA */}
          <Link
            href={rafflePageUrl}
            className={`flex-1 text-[10px] sm:text-xs py-2.5 sm:py-3 flex items-center justify-center gap-1.5 transition-all ${
              isLive
                ? (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                  ? 'bg-gray-200 text-gray-600 border-2 border-black cursor-not-allowed font-pixel text-[9px]'
                  : 'pixel-btn shadow-pixel'
                : 'bg-gray-200 text-gray-600 border-2 border-black cursor-not-allowed font-pixel text-[9px]'
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
            className="w-10 sm:w-11 bg-white text-black hover:bg-black hover:text-white border-2 border-black flex items-center justify-center shadow-pixel transition-colors shrink-0"
            title="Copy Raffle Link"
            aria-label="Copy Raffle Link"
          >
            {copiedShare ? <Check size={15} /> : <Share2 size={15} />}
          </button>

          {/* Twitter SVG Icon */}
          <button
            type="button"
            onClick={handleTwitterShare}
            className="w-10 sm:w-11 bg-white text-black hover:bg-black hover:text-white border-2 border-black flex items-center justify-center shadow-pixel transition-colors shrink-0"
            title="Share on X"
            aria-label="Share on X"
          >
            <Twitter size={15} />
          </button>
        </div>

        {/* Admin Quick Edit Button */}
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
