'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Raffle } from '@/lib/types';
import { useWallet } from '@/lib/wallet-context';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelArtwork } from '@/components/PixelArtworks';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Share2, 
  Twitter, 
  Check, 
  Copy, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle, 
  Flame, 
  MessageSquare, 
  Wallet,
  AtSign,
  Sparkles
} from 'lucide-react';

export default function SingleRafflePage() {
  const params = useParams();
  const raffleId = params?.id as string;

  const { address, shortAddress, isConnected, holderStatus, isVerifyingHolder, checkHolderEligibility } = useWallet();

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedReceipt, setCopiedReceipt] = useState(false);

  const [twitterHandle, setTwitterHandle] = useState('');
  const [tasks, setTasks] = useState({
    handleLinked: false,
    followPartner: false,
    followFlamebound: false,
    engage: false,
    wallet: false,
    holderCheck: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [entryReceipt, setEntryReceipt] = useState<{
    id: string;
    walletAddress: string;
    tokenBalance: number;
    verifiedAt: string;
  } | null>(null);

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  const fetchRaffle = async (walletAddr?: string | null) => {
    if (!raffleId) return;
    setLoading(true);
    try {
      const targetWallet = walletAddr || address;

      // Instant local cache restore on browser refresh
      if (targetWallet && typeof window !== 'undefined') {
        const cached = localStorage.getItem(`flamebound_entry_${raffleId}_${targetWallet.toLowerCase()}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.id) {
              setEntryReceipt(parsed);
              if (parsed.twitterUsername) setTwitterHandle(parsed.twitterUsername);
              setTasks({ handleLinked: true, followPartner: true, followFlamebound: true, engage: true, wallet: true, holderCheck: true });
            }
          } catch (e) {}
        }
      }

      const query = targetWallet ? `?wallet=${encodeURIComponent(targetWallet)}` : '';
      const res = await fetch(`/api/raffles/${raffleId}${query}`);
      const data = await res.json();
      if (data.success && data.raffle) {
        setRaffle(data.raffle);
        if (data.userEntry) {
          setEntryReceipt(data.userEntry);
          if (data.userEntry.twitterUsername) setTwitterHandle(data.userEntry.twitterUsername);
          setTasks({ handleLinked: true, followPartner: true, followFlamebound: true, engage: true, wallet: true, holderCheck: true });
          if (typeof window !== 'undefined' && targetWallet) {
            localStorage.setItem(`flamebound_entry_${raffleId}_${targetWallet.toLowerCase()}`, JSON.stringify(data.userEntry));
          }
        }
      } else {
        setError('Raffle not found or has concluded.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load raffle specifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRaffle(address);
  }, [raffleId, address]);

  useEffect(() => {
    if (isConnected && address) {
      setTasks(prev => ({ ...prev, wallet: true }));
      if (raffle) {
        if (raffle.eligibility === 'public') {
          setTasks(prev => ({ ...prev, holderCheck: true }));
          setError(null);
        } else {
          checkHolderEligibility(raffle.contractAddress, raffle.network);
        }
      }
    } else {
      setTasks(prev => ({ ...prev, wallet: false, holderCheck: false }));
    }
  }, [isConnected, address, raffle]);

  useEffect(() => {
    if (raffle?.eligibility === 'public') {
      setTasks(prev => ({ ...prev, holderCheck: true }));
      setError(null);
      return;
    }

    if (holderStatus && holderStatus.isHolder) {
      setTasks(prev => ({ ...prev, holderCheck: true }));
      setError(null);
    } else if (holderStatus && !holderStatus.isHolder && isConnected) {
      setTasks(prev => ({ ...prev, holderCheck: false }));
      const role = raffle?.eligibility === 'holders_only' ? 'Flamebound NFT holder' : 'Flamebound minter';
      setError(holderStatus.message || `Your wallet is not a verified ${role}.`);
    }
  }, [holderStatus, isConnected, raffle]);

  useEffect(() => {
    if (!raffle?.endDate) return;

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
  }, [raffle?.endDate]);

  const projectName = raffle?.project || 'FLAMEBOUND';
  const isLive = raffle?.status === 'live' && !timeLeft.isEnded;

  const handleSaveHandle = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = twitterHandle.trim().replace(/^@/, '');
    if (!cleanHandle) {
      setError('Please enter your X / Twitter handle');
      return;
    }
    setError(null);
    setTasks(prev => ({ ...prev, handleLinked: true }));
  };

  const handleFollowPartner = () => {
    const target = raffle?.followUrl || raffle?.twitterUrl || 'https://x.com/FlameboundNft';
    window.open(target, '_blank');
    setTasks(prev => ({ ...prev, followPartner: true }));
  };

  const handleFollowFlamebound = () => {
    window.open('https://x.com/FlameboundNft', '_blank');
    setTasks(prev => ({ ...prev, followFlamebound: true }));
  };

  const handleEngageTask = () => {
    const target = raffle?.engageUrl || raffle?.twitterUrl || 'https://x.com/FlameboundNft';
    window.open(target, '_blank');
    setTasks(prev => ({ ...prev, engage: true }));
  };

  const handleRunHolderCheck = async () => {
    if (!isConnected || !address || !raffle) {
      setError('Please connect your Web3 wallet first using RainbowKit.');
      return;
    }

    const res = await checkHolderEligibility(raffle.contractAddress, raffle.network);
    if (res && res.isHolder) {
      setTasks(prev => ({ ...prev, holderCheck: true }));
      setError(null);
    } else {
      setTasks(prev => ({ ...prev, holderCheck: false }));
      setError(res?.message || 'Your wallet does not currently hold a Flamebound NFT.');
    }
  };

  const completedCount = Object.values(tasks).filter(Boolean).length;
  const totalTasks = 6;
  const progressPercent = (completedCount / totalTasks) * 100;
  const allTasksCompleted = completedCount === totalTasks;

  const handleSubmitEntry = async () => {
    if (!allTasksCompleted || !address || !raffle) {
      setError('Please complete all checklist requirements before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/raffles/' + raffle.id + '/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          twitterUsername: twitterHandle.trim().replace(/^@/, ''),
          taskStatus: tasks,
          contractAddress: raffle.contractAddress,
          network: raffle.customNetwork || raffle.network,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit raffle entry.');
      }

      if (data.entry) {
        setEntryReceipt(data.entry);
        if (typeof window !== 'undefined' && address) {
          localStorage.setItem(`flamebound_entry_${raffle.id}_${address.toLowerCase()}`, JSON.stringify(data.entry));
        }
      }

      if (!data.isExisting) {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#A6FF00', '#000000', '#FFFFFF'],
        });
      }
    } catch (err: any) {
      setError(err.message || 'Submission error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleTwitterShare = () => {
    if (typeof window === 'undefined' || !raffle) return;
    const text = 'Entering the @FlameboundNft whitelist raffle for ' + raffle.title + '! Check your holder eligibility & enter here:';
    const tweetUrl = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + '&url=' + encodeURIComponent(window.location.href);
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-lime selection:bg-black selection:text-lime">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        
        {/* Back Link & Quick Actions Bar */}
        <div className="flex items-center justify-between border-b-4 border-black pb-3 sm:pb-4 mb-4 sm:mb-8">
          <Link
            href="/#active-raffles"
            className="pixel-btn text-[10px] sm:text-xs py-2 px-3 sm:px-4 flex items-center gap-1.5 sm:gap-2 shadow-pixel"
          >
            <ArrowLeft size={14} />
            <span>[← ALL RAFFLES]</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="pixel-btn-white text-[10px] sm:text-xs py-2 px-3 flex items-center gap-1.5 border-3 border-black shadow-pixel-sm"
              title="Copy Page Link"
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copiedLink ? '[LINK COPIED]' : '[SHARE]'}</span>
            </button>

            <button
              onClick={handleTwitterShare}
              className="bg-black text-lime hover:bg-black/90 p-2 sm:px-3 sm:py-2 border-3 border-black flex items-center gap-1.5 shadow-pixel-sm"
              title="Tweet on X"
            >
              <Twitter size={14} />
              <span className="hidden sm:inline font-pixel text-[10px]">[TWEET]</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border-4 border-black p-12 text-center shadow-pixel-lg">
            <span className="font-pixel text-sm text-black block animate-pulse">
              LOADING RAFFLE SPECIFICATIONS...
            </span>
          </div>
        )}

        {/* Not Found Error */}
        {!loading && !raffle && (
          <div className="bg-white border-4 border-black p-12 text-center shadow-pixel-lg space-y-4">
            <h2 className="font-pixel text-lg text-black font-bold uppercase">RAFFLE NOT FOUND</h2>
            <p className="font-mono text-sm text-gray-700">{error || 'This raffle does not exist or has been removed.'}</p>
            <Link href="/" className="pixel-btn text-xs py-3 px-6 inline-block">
              [RETURN HOME]
            </Link>
          </div>
        )}

        {/* Main Content Layout */}
        {!loading && raffle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
            
            {/* Left Column: Raffle Media & Complete Technical Specs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Main Card Media & Title Box */}
              <div className="bg-white border-3 sm:border-4 border-black shadow-pixel-lg overflow-hidden">
                
                {/* Header Bar */}
                <div className="bg-black text-lime px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between border-b-3 sm:border-b-4 border-black">
                  <div className="flex items-center gap-2 truncate">
                    {raffle.logoUrl ? (
                      <img src={raffle.logoUrl} alt={projectName} className="w-6 h-6 object-contain shrink-0" />
                    ) : (
                      <img src="/images/flamebound-logo.png" alt="Flamebound" className="w-6 h-6 object-contain shrink-0" />
                    )}
                    <span className="font-pixel text-xs text-white font-bold tracking-wide uppercase truncate">
                      {projectName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-pixel text-[8px] sm:text-[9px] bg-white text-black px-1.5 sm:px-2 py-0.5 border border-black font-bold">
                      {raffle.type || 'WL RAFFLE'}
                    </span>
                    <span className={'font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 border border-black font-bold ' + (isLive ? 'bg-lime text-black animate-pulse' : 'bg-red-600 text-white')}>
                      {isLive ? '■ LIVE' : 'CLOSED'}
                    </span>
                  </div>
                </div>

                {/* Big Artwork Banner */}
                <div className="relative border-b-3 sm:border-b-4 border-black bg-black flex items-center justify-center overflow-hidden h-56 sm:h-80">
                  <PixelArtwork
                    type={raffle.artworkType}
                    bannerUrl={raffle.bannerUrl}
                    logoUrl={raffle.logoUrl}
                    className="w-full h-full"
                  />
                  <div className="absolute top-3 right-3 bg-black/90 border-2 border-lime px-2 py-1 text-lime font-pixel text-[9px] sm:text-[10px] font-bold shadow-pixel-sm">
                    [{raffle.customNetwork || raffle.network || 'ROBINHOOD NETWORK'}]
                  </div>
                </div>

                {/* Body Specs */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <h1 className="font-pixel text-lg sm:text-2xl text-black font-extrabold uppercase tracking-tight">
                      {raffle.title}
                    </h1>
                    <p className="font-mono text-xs sm:text-sm text-gray-800 font-bold mt-2 leading-relaxed">
                      {raffle.subtitle || raffle.description}
                    </p>
                  </div>

                  {raffle.notes && (
                    <div className="bg-lime/20 border-2 sm:border-3 border-black p-3 font-mono text-xs font-bold text-black flex items-center gap-2">
                      <Sparkles size={16} className="text-black shrink-0" />
                      <span>{raffle.notes}</span>
                    </div>
                  )}

                  {/* Comprehensive Specifications Table */}
                  <div className="border-2 sm:border-3 border-black bg-white">
                    <div className="bg-black text-white font-pixel text-[9px] sm:text-[10px] px-3 py-2 font-bold uppercase">
                      NFT WHITELIST SPECIFICATIONS
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 p-3 sm:p-4 font-mono text-xs border-b-2 border-black/20">
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-pixel text-gray-600 block font-bold">WL ALLOCATION:</span>
                        <span className="font-pixel text-xs sm:text-sm text-black font-bold mt-0.5 block">{raffle.supply} SPOTS</span>
                      </div>
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-pixel text-gray-600 block font-bold">TOTAL SUPPLY:</span>
                        <span className="font-bold text-black text-xs sm:text-sm mt-0.5 block">{raffle.nftTotalSupply || 'TBA'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-pixel text-gray-600 block font-bold">MINT PRICE:</span>
                        <span className="font-bold text-black text-xs bg-lime/30 px-1 py-0.5 border border-black inline-block mt-0.5">
                          {raffle.mintPrice || 'FREE'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] sm:text-[9px] font-pixel text-gray-600 block font-bold">MINT DATE:</span>
                        <span className="font-bold text-black text-xs mt-0.5 block truncate">{raffle.mintDate || 'TBA'}</span>
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 space-y-2 font-mono text-xs">
                      <div className="flex justify-between items-center text-gray-800">
                        <span className="font-bold">MAX PER WHITELIST:</span>
                        <span className="font-bold text-black">{raffle.maxMintPerWallet || '1 PER WL'}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-800">
                        <span className="font-bold">ENTRY METHOD:</span>
                        <span className="font-pixel text-[10px] font-bold text-black bg-lime px-1 border border-black">
                          {raffle.entryMethod === 'fcfs' ? '⚡ FIRST-COME, FIRST-SERVED (FCFS)' : '🎲 RANDOM RAFFLE DRAW'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-800">
                        <span className="font-bold">ELIGIBILITY:</span>
                        <span className="font-bold text-black">
                          {raffle.eligibility === 'public' ? 'OPEN TO ALL (PUBLIC)' : raffle.eligibility === 'holders_only' ? 'FLAMEBOUND HOLDERS ONLY' : 'FLAMEBOUND MINTERS ONLY'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-800 pt-1 border-t border-black/10">
                        <span className="font-bold">{raffle.entryMethod === 'fcfs' ? 'CLAIMED SPOTS:' : 'TOTAL ENTRIES:'}</span>
                        <span className="font-pixel text-xs text-black font-bold">
                          {raffle.totalEntries} / {raffle.supply} {raffle.entryMethod === 'fcfs' ? 'CLAIMED' : 'ENTRIES'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4-Box Pixel Countdown Clock */}
                  <div className="bg-black text-lime p-3.5 sm:p-4 border-3 sm:border-4 border-black shadow-pixel space-y-2.5 sm:space-y-3">
                    <div className="flex items-center justify-between font-pixel text-[9px] sm:text-[10px] border-b border-lime/30 pb-2 font-bold">
                      <span className="text-white">RAFFLE DEADLINE:</span>
                      <span className="text-lime">
                        {new Date(raffle.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {isLive ? (
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-lime text-black p-1.5 sm:p-2 border-2 border-black shadow-pixel-xs">
                          <span className="font-pixel text-sm sm:text-lg font-bold block">{String(timeLeft.days).padStart(2, '0')}</span>
                          <span className="font-pixel text-[7px] sm:text-[8px] block font-bold text-black/80">DAYS</span>
                        </div>
                        <div className="bg-lime text-black p-1.5 sm:p-2 border-2 border-black shadow-pixel-xs">
                          <span className="font-pixel text-sm sm:text-lg font-bold block">{String(timeLeft.hours).padStart(2, '0')}</span>
                          <span className="font-pixel text-[7px] sm:text-[8px] block font-bold text-black/80">HRS</span>
                        </div>
                        <div className="bg-lime text-black p-1.5 sm:p-2 border-2 border-black shadow-pixel-xs">
                          <span className="font-pixel text-sm sm:text-lg font-bold block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                          <span className="font-pixel text-[7px] sm:text-[8px] block font-bold text-black/80">MIN</span>
                        </div>
                        <div className="bg-lime text-black p-1.5 sm:p-2 border-2 border-black shadow-pixel-xs">
                          <span className="font-pixel text-sm sm:text-lg font-bold block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                          <span className="font-pixel text-[7px] sm:text-[8px] block font-bold text-black/80">SEC</span>
                        </div>
                      </div>
                    ) : (
                      <div className="font-pixel text-xs text-center text-red-400 py-2 bg-red-950/40 border border-red-800 uppercase font-bold">
                        ★ RAFFLE CONCLUDED ★
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* Right Column: Whitelist Verification & Entry Checklist (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white border-3 sm:border-4 border-black shadow-pixel-lg p-4 sm:p-6 space-y-4">
                
                <div className="border-b-3 border-black pb-3">
                  <div className="flex items-center gap-2">
                    <Flame size={20} className="text-black" />
                    <h2 className="font-pixel text-base sm:text-lg text-black font-extrabold uppercase">
                      {raffle.entryMethod === 'fcfs' ? 'CLAIM FCFS WHITELIST' : 'ENTER WHITELIST'}
                    </h2>
                  </div>
                  <p className="font-mono text-xs text-gray-700 font-bold mt-1">
                    {raffle.entryMethod === 'fcfs' 
                      ? 'First-come, first-served! Complete requirements to instantly secure your whitelist spot.'
                      : 'Complete all requirements below to submit your verified on-chain entry.'}
                  </p>
                </div>

                {/* SUCCESS RECEIPT STATE */}
                {entryReceipt ? (
                  <div className="space-y-4 py-2">
                    <div className="bg-lime border-3 sm:border-4 border-black p-4 sm:p-5 text-center space-y-2.5 shadow-pixel">
                      <div className="inline-block p-2 bg-black text-lime mb-1">
                        <CheckCircle size={30} />
                      </div>
                      <h3 className="font-pixel text-sm sm:text-base font-bold text-black uppercase">
                        {raffle.entryMethod === 'fcfs' ? 'FCFS SPOT CONFIRMED!' : 'WHITELIST ENTRY CONFIRMED!'}
                      </h3>
                      <p className="font-mono text-xs text-black font-bold">
                        {raffle.entryMethod === 'fcfs' 
                          ? '★ Guaranteed FCFS spot confirmed! Your wallet is officially whitelisted for this mint.'
                          : 'Your on-chain verification was approved. Your wallet is officially enrolled into this whitelist raffle!'}
                      </p>
                    </div>

                    {/* Receipt Specs Card */}
                    <div className="bg-black text-lime border-3 sm:border-4 border-black p-3.5 sm:p-4 space-y-2.5 shadow-pixel-sm">
                      <div className="flex items-center justify-between border-b-2 border-lime/30 pb-2">
                        <span className="font-pixel text-[9px] sm:text-[10px] text-white">TICKET ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-pixel text-xs sm:text-sm font-bold text-lime tracking-wider select-all">
                            {entryReceipt.id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(entryReceipt.id);
                              setCopiedReceipt(true);
                              setTimeout(() => setCopiedReceipt(false), 2000);
                            }}
                            className="p-1 bg-lime text-black border border-black hover:bg-white transition-colors"
                            title="Copy Ticket ID"
                          >
                            {copiedReceipt ? <Check size={13} /> : <Copy size={13} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 text-xs pt-1">
                        <div>
                          <span className="text-gray-300 block text-[9px] sm:text-[10px]">WALLET:</span>
                          <span className="font-mono font-bold text-white select-all break-all text-[11px] sm:text-xs">
                            {entryReceipt.walletAddress}
                          </span>
                        </div>
                        {raffle.eligibility !== 'public' && (
                          <div>
                            <span className="text-gray-300 block text-[9px] sm:text-[10px]">VERIFIED MINTS:</span>
                            <span className="font-mono font-bold text-lime text-[11px] sm:text-xs">
                              {entryReceipt.tokenBalance} Flamebound NFT(s)
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {twitterHandle && (
                      <div className="p-3 bg-lime/20 border-2 border-black flex justify-between text-xs">
                        <span className="text-gray-700 font-bold">X / TWITTER HANDLE:</span>
                        <span className="font-bold text-black font-mono">@{twitterHandle.replace('@', '')}</span>
                      </div>
                    )}

                    <Link
                      href="/#active-raffles"
                      className="w-full pixel-btn text-xs py-3 shadow-pixel block text-center"
                    >
                      [← RETURN TO ALL RAFFLES]
                    </Link>
                  </div>
                ) : (
                  /* SIMPLE CLEAN ENTRY FORM */
                  <>
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-pixel text-[9px] sm:text-[10px] uppercase font-bold text-black">
                        <span>{completedCount}/{totalTasks} REQUIREMENTS COMPLETED</span>
                        <span>{progressPercent.toFixed(0)}%</span>
                      </div>
                      <div className="h-3 sm:h-3.5 bg-black border-2 border-black p-0.5">
                        <div
                          className="h-full bg-lime transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Error Notification */}
                    {error && (
                      <div className="bg-red-500 text-white border-2 sm:border-3 border-black p-2 font-mono text-xs flex items-center gap-2 font-bold">
                        <ShieldAlert size={16} className="shrink-0" />
                        <div className="flex-1 text-[10px] sm:text-[11px]">
                          {error}
                        </div>
                      </div>
                    )}

                    {/* CHECKLIST ITEMS (RESPONSIVE) */}
                    <div className="space-y-2.5 pt-1">
                      
                      {/* 1. SEPARATE DEDICATED BOX: YOUR X HANDLE */}
                      <div className={'border-2 sm:border-3 border-black p-2.5 sm:p-3 transition-colors ' + (tasks.handleLinked ? 'bg-lime/25' : 'bg-white')}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AtSign size={14} className="text-black shrink-0" />
                          <span className="font-pixel text-[10px] sm:text-[11px] font-bold text-black uppercase truncate">
                            YOUR X (TWITTER) HANDLE
                          </span>
                        </div>

                        <form onSubmit={handleSaveHandle} className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                          <input
                            type="text"
                            placeholder="Enter handle (e.g. @yourhandle)"
                            value={twitterHandle}
                            onChange={(e) => {
                              setTwitterHandle(e.target.value);
                              setTasks(prev => ({ ...prev, handleLinked: false }));
                            }}
                            className="w-full sm:flex-1 bg-lime/15 border-2 border-black p-2 text-xs font-mono font-bold outline-none min-w-0"
                          />
                          <button
                            type="submit"
                            className={'pixel-btn text-[9px] sm:text-[10px] py-2 px-3 shrink-0 text-center ' + (tasks.handleLinked ? 'bg-black text-lime' : '')}
                          >
                            {tasks.handleLinked ? '✓ LINKED' : '[CONFIRM HANDLE]'}
                          </button>
                        </form>
                      </div>

                      {/* 2. FOLLOW ( {PROJECT_NAME} ) - FIRST */}
                      <div className={'border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ' + (tasks.followPartner ? 'bg-lime/25' : 'bg-white')}>
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <Twitter size={14} className="text-black shrink-0" />
                          <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                            FOLLOW ({projectName})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleFollowPartner}
                          className={'pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3.5 flex items-center gap-1 shrink-0 ' + (tasks.followPartner ? 'bg-black text-lime' : '')}
                        >
                          {tasks.followPartner ? (
                            <>
                              <Check size={11} />
                              <span>[FOLLOWED]</span>
                            </>
                          ) : (
                            <>
                              <span className="sm:hidden">[FOLLOW]</span>
                              <span className="hidden sm:inline">[FOLLOW @{projectName.toUpperCase()}]</span>
                              <ExternalLink size={10} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* 3. FOLLOW ( FLAMEBOUND ) - SECOND */}
                      <div className={'border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ' + (tasks.followFlamebound ? 'bg-lime/25' : 'bg-white')}>
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <Twitter size={14} className="text-black shrink-0" />
                          <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                            FOLLOW (FLAMEBOUND)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleFollowFlamebound}
                          className={'pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3.5 flex items-center gap-1 shrink-0 ' + (tasks.followFlamebound ? 'bg-black text-lime' : '')}
                        >
                          {tasks.followFlamebound ? (
                            <>
                              <Check size={11} />
                              <span>[FOLLOWED]</span>
                            </>
                          ) : (
                            <>
                              <span className="sm:hidden">[FOLLOW]</span>
                              <span className="hidden sm:inline">[FOLLOW @FLAMEBOUNDNFT]</span>
                              <ExternalLink size={10} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* 4. ENGAGE WITH POST */}
                      <div className={'border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ' + (tasks.engage ? 'bg-lime/25' : 'bg-white')}>
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <MessageSquare size={14} className="text-black shrink-0" />
                          <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                            ENGAGE WITH POST
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleEngageTask}
                          className={'pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3.5 flex items-center gap-1 shrink-0 ' + (tasks.engage ? 'bg-black text-lime' : '')}
                        >
                          {tasks.engage ? (
                            <>
                              <Check size={11} />
                              <span>[DONE]</span>
                            </>
                          ) : (
                            <>
                              <span>[VIEW POST]</span>
                              <ExternalLink size={10} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* 5. CONNECT EVM WALLET */}
                      <div className={'border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ' + (tasks.wallet ? 'bg-lime/25' : 'bg-white')}>
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <Wallet size={14} className="text-black shrink-0" />
                          <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                            {isConnected && address ? ('WALLET: ' + shortAddress) : 'CONNECT WALLET'}
                          </span>
                        </div>

                        <div className="shrink-0">
                          <ConnectButton.Custom>
                            {({ account, openConnectModal, mounted }) => {
                              if (!mounted) return null;
                              if (!account) {
                                return (
                                  <button
                                    type="button"
                                    onClick={openConnectModal}
                                    className="pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3"
                                  >
                                    [CONNECT]
                                  </button>
                                );
                              }
                              return (
                                <span className="font-pixel text-[9px] bg-black text-lime px-2 py-1 border border-black font-bold inline-block">
                                  ✓ LINKED
                                </span>
                              );
                            }}
                          </ConnectButton.Custom>
                        </div>
                      </div>

                      {/* 6. ON-CHAIN ELIGIBILITY CHECK */}
                      <div className={'border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ' + (tasks.holderCheck ? 'bg-lime/25' : 'bg-white')}>
                        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                          <Flame size={14} className="text-black shrink-0" />
                          <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                            {raffle.eligibility === 'public'
                              ? '✓ OPEN TO ALL (NO NFT REQUIRED)'
                              : holderStatus && holderStatus.isHolder 
                              ? (`VERIFIED ${raffle.eligibility === 'holders_only' ? 'HOLDER' : 'MINTER'} (${holderStatus.tokenBalance} NFT)`)
                              : (`${raffle.eligibility === 'holders_only' ? 'HOLDER' : 'MINTER'} CHECK`)}
                          </span>
                        </div>

                        {raffle.eligibility === 'public' ? (
                          <span className="font-pixel text-[9px] bg-black text-lime px-2 py-1 border border-black font-bold">
                            ✓ ELIGIBLE
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleRunHolderCheck}
                            disabled={isVerifyingHolder || !isConnected}
                            className={'pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3 flex items-center gap-1.5 shrink-0 ' + (!isConnected ? 'opacity-50 cursor-not-allowed ' : ' ') + (tasks.holderCheck ? 'bg-black text-lime' : '')}
                          >
                            <span>
                              {isVerifyingHolder 
                                ? 'CHECKING...' 
                                : tasks.holderCheck 
                                ? '✓ VERIFIED' 
                                : (`[VERIFY ${raffle.eligibility === 'holders_only' ? 'HOLDER' : 'MINTER'}]`)}
                            </span>
                          </button>
                        )}
                      </div>

                    </div>

                    {/* Submit Whitelist Entry CTA */}
                    <div className="pt-3 border-t-3 border-black">
                      <button
                        type="button"
                        onClick={handleSubmitEntry}
                        disabled={!allTasksCompleted || submitting || !isLive || (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)}
                        className={'w-full py-3.5 sm:py-4 font-pixel text-xs tracking-wider uppercase font-bold transition-all shadow-pixel text-center ' + (
                          allTasksCompleted && !submitting && isLive && !(raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                            ? 'bg-black text-lime hover:bg-black/90 cursor-pointer' 
                            : 'bg-gray-300 text-gray-600 border-3 border-black cursor-not-allowed opacity-75'
                        )}
                      >
                        {submitting 
                          ? 'CONFIRMING ENTRY ON-CHAIN...' 
                          : (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                          ? '[ALL FCFS SPOTS CLAIMED / CLOSED]'
                          : allTasksCompleted 
                          ? (raffle.entryMethod === 'fcfs' ? '[★ CLAIM FCFS GUARANTEED SPOT ★]' : '[★ SUBMIT WHITELIST ENTRY ★]')
                          : ('[COMPLETE ALL REQUIREMENTS (' + completedCount + '/' + totalTasks + ')]')}
                      </button>
                    </div>
                  </>
                )}

              </div>

            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}