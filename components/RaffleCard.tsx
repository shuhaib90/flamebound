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
  Clock, 
  Users, 
  Edit3,
  Flame,
  CheckCircle2
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
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const handleTwitterShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shortUrl = getShortUrl();
    const text = `DOTSET X ${raffle.project || raffle.title}\n[STAGE: ${mintStage}] • ${raffle.supply} SPOTS\n\nEnter now:`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shortUrl)}`;
    window.open(tweetUrl, '_blank');
  };

  const formatCountdown = () => {
    if (timeLeft.isEnded || !isLive) return 'Ended';
    if (timeLeft.days > 0) return `${timeLeft.days}d ${timeLeft.hours}h left`;
    if (timeLeft.hours > 0) return `${timeLeft.hours}h ${timeLeft.minutes}m left`;
    return `${timeLeft.minutes}m ${timeLeft.seconds}s left`;
  };

  const collaboratorTitle = raffle.project && !raffle.title.toLowerCase().includes(raffle.project.toLowerCase())
    ? `DOTSET X ${raffle.project.toUpperCase()}`
    : raffle.title;

  return (
    <div 
      id={`raffle-${raffle.id}`}
      className="cq-card flex flex-col justify-between overflow-hidden select-none group"
    >
      <div>
        {/* Cover Artwork Banner matching CloudQuest */}
        <Link 
          href={rafflePageUrl} 
          className="block relative overflow-hidden h-44 sm:h-48 cursor-pointer bg-[#111111]"
        >
          <PixelArtwork
            type={raffle.artworkType}
            bannerUrl={raffle.bannerUrl}
            logoUrl={raffle.logoUrl}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          
          {/* Bottom gradient fade */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-[#0f0f0f]/30 to-transparent" />

          {/* Top-Left: Network & Stage Pills */}
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
            <span className="px-2.5 py-0.5 rounded bg-black/60 backdrop-blur-md border border-white/10 text-[#f0f0f0] font-mono-dm text-[10px] uppercase font-medium">
              {raffle.customNetwork || raffle.network || 'ROBINHOOD'}
            </span>
            <span className={`px-2 py-0.5 rounded font-mono-dm text-[10px] uppercase font-semibold ${
              mintStage === 'GTD' 
                ? 'bg-[#4f52c8]/40 border border-[#a5b4fc]/30 text-[#a5b4fc]' 
                : mintStage === 'FCFS' 
                ? 'bg-[#fb923c]/20 border border-[#fb923c]/40 text-[#fb923c]' 
                : 'bg-white/10 border border-white/20 text-white'
            }`}>
              {mintStage}
            </span>
          </div>

          {/* Top-Right: Live Status Indicator */}
          <div className="absolute top-3 right-3 z-10">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono-dm text-[10px] font-medium backdrop-blur-md ${
              isLive 
                ? 'bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80]' 
                : 'bg-white/5 border border-white/10 text-[#8a8a9a]'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#4ade80] animate-pulse' : 'bg-gray-500'}`} />
              <span>{isLive ? 'Live' : 'Closed'}</span>
            </span>
          </div>
        </Link>

        {/* Card Body */}
        <div className="p-4 sm:p-5 space-y-3">
          
          {/* Project Title & Verified Tag */}
          <div>
            <Link href={rafflePageUrl}>
              <h3 className="font-syne text-base font-bold text-white group-hover:text-[#a5b4fc] transition-colors flex items-center gap-1.5 line-clamp-1">
                <span>{collaboratorTitle}</span>
                <CheckCircle2 size={14} className="text-[#38bdf8] shrink-0" />
              </h3>
            </Link>
            {raffle.subtitle && (
              <p className="font-dm text-xs text-[#8a8a9a] line-clamp-1 mt-0.5">
                {raffle.subtitle}
              </p>
            )}
          </div>

          {/* 3-Column Stats Row */}
          <div className="grid grid-cols-3 gap-2 py-2 border-y border-white/[0.06] font-dm text-xs">
            <div>
              <span className="text-[10px] text-[#555566] font-mono-dm block uppercase">Ends In</span>
              <span className="font-mono-dm text-xs text-[#f0f0f0] font-medium mt-0.5 block truncate">
                {formatCountdown()}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#555566] font-mono-dm block uppercase">Entries</span>
              <span className="font-mono-dm text-xs text-[#f0f0f0] font-medium mt-0.5 block">
                {raffle.totalEntries || 0}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-[#555566] font-mono-dm block uppercase">Spots</span>
              <span className="font-mono-dm text-xs text-[#a5b4fc] font-semibold mt-0.5 block">
                {raffle.supply} WL
              </span>
            </div>
          </div>

          {/* CloudQuest Task Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[#8a8a9a] font-mono-dm text-[10px]">
              X Follow
            </span>
            {raffle.engageUrl && (
              <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[#8a8a9a] font-mono-dm text-[10px]">
                Like & RT
              </span>
            )}
            <span className="px-2 py-0.5 rounded bg-white/[0.03] border border-white/[0.06] text-[#8a8a9a] font-mono-dm text-[10px]">
              Wallet
            </span>
          </div>

        </div>
      </div>

      {/* Action Footer */}
      <div className="p-4 sm:p-5 pt-0">
        <div className="flex gap-2">
          {/* Main Enter Button */}
          <Link
            href={rafflePageUrl}
            className={`flex-1 py-2.5 px-4 rounded-lg font-dm text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
              isLive
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-white/10 text-[#8a8a9a] border border-white/10'
            }`}
          >
            <span>
              {isLive 
                ? (raffle.entryMethod === 'fcfs' ? 'Claim FCFS Spot' : 'Enter Raffle') 
                : 'View Details'}
            </span>
            <ArrowRight size={14} />
          </Link>

          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className="p-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#8a8a9a] hover:text-white border border-white/[0.08] transition-colors"
            title="Copy Link"
          >
            {copiedShare ? <Check size={14} className="text-[#4ade80]" /> : <Share2 size={14} />}
          </button>

          {/* Twitter Button */}
          <button
            type="button"
            onClick={handleTwitterShare}
            className="p-2.5 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-[#8a8a9a] hover:text-white border border-white/[0.08] transition-colors"
            title="Share on X"
          >
            <Twitter size={14} />
          </button>
        </div>
      </div>

    </div>
  );
}
