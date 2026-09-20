'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Raffle, CustomTask } from '@/lib/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelArtwork } from '@/components/PixelArtworks';
import { useWallet } from '@/lib/wallet-context';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Share2, 
  Twitter, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle, 
  Copy, 
  Check, 
  MessageSquare, 
  Wallet, 
  AtSign, 
  Send, 
  Globe, 
  Sparkles
} from 'lucide-react';

export default function SingleRafflePage() {
  const params = useParams();
  const router = useRouter();
  const raffleId = params?.id as string;
  const { address } = useWallet();

  const [raffle, setRaffle] = useState<Raffle | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [twitterHandle, setTwitterHandle] = useState('');
  const [walletInput, setWalletInput] = useState('');

  // Checklist Tasks
  const [tasks, setTasks] = useState({
    handleLinked: false,
    walletProvided: false,
    followPartner: false,
    followDotset: false,
    engage: false,
  });

  const [customTasksDone, setCustomTasksDone] = useState<Record<string, boolean>>({});

  // Receipt
  const [entryReceipt, setEntryReceipt] = useState<{
    id: string;
    walletAddress: string;
    twitterUsername?: string;
    verifiedAt: string;
  } | null>(null);

  const [copiedReceipt, setCopiedReceipt] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Countdown state
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isEnded: boolean;
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, isEnded: false });

  // Auto-fill wallet if user has connected wallet
  useEffect(() => {
    if (address && !walletInput) {
      setWalletInput(address);
      setTasks(prev => ({ ...prev, walletProvided: true }));
    }
  }, [address]);

  // Fetch Raffle Details
  useEffect(() => {
    if (!raffleId) return;

    const fetchRaffle = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/raffles/${raffleId}`);
        const data = await res.json();
        if (data.success && data.raffle) {
          setRaffle(data.raffle);

          // Check localStorage for existing submitted entry
          if (typeof window !== 'undefined') {
            const cachedKeys = Object.keys(localStorage).filter(k => k.startsWith(`dotset_entry_${data.raffle.id}_`));
            if (cachedKeys.length > 0) {
              const cached = localStorage.getItem(cachedKeys[0]);
              if (cached) {
                try {
                  const parsed = JSON.parse(cached);
                  setEntryReceipt({
                    id: parsed.id || `TKT-${Math.floor(100000 + Math.random() * 900000)}`,
                    walletAddress: parsed.walletAddress || '',
                    twitterUsername: parsed.twitterUsername || '',
                    verifiedAt: parsed.createdAt || new Date().toISOString(),
                  });
                } catch (e) {
                  // ignore
                }
              }
            }
          }
        } else {
          setError(data.error || 'Raffle not found');
        }
      } catch (err) {
        console.error('Failed to load raffle:', err);
        setError('Failed to load raffle details.');
      } finally {
        setLoading(false);
      }
    };

    fetchRaffle();
  }, [raffleId]);

  // Countdown timer calculation
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

  const projectName = raffle?.project || 'DOTSET';
  const isLive = raffle?.status === 'live' && !timeLeft.isEnded;
  const mintStage = raffle?.mintStage || (raffle?.entryMethod === 'fcfs' ? 'FCFS' : 'GTD');

  const customTasksList: CustomTask[] = Array.isArray(raffle?.customTasks) ? raffle.customTasks : [];

  // Total required tasks count
  const baseTaskCount = 4; // handle, wallet, followPartner, followDotset
  const totalTasks = baseTaskCount + (raffle?.engageUrl ? 1 : 0) + customTasksList.length;

  const completedCount = 
    (tasks.handleLinked ? 1 : 0) +
    (tasks.walletProvided ? 1 : 0) +
    (tasks.followPartner ? 1 : 0) +
    (tasks.followDotset ? 1 : 0) +
    (tasks.engage ? 1 : 0) +
    Object.values(customTasksDone).filter(Boolean).length;

  const allTasksCompleted = 
    tasks.handleLinked && 
    tasks.walletProvided && 
    tasks.followPartner && 
    tasks.followDotset &&
    (!raffle?.engageUrl || tasks.engage) &&
    customTasksList.every(t => Boolean(customTasksDone[t.id]));

  const progressPercent = Math.min(100, Math.round((completedCount / totalTasks) * 100));

  const handleSaveHandle = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = twitterHandle.trim().replace(/^@/, '');
    if (!cleanHandle) {
      setError('Please enter your X / Twitter handle.');
      return;
    }
    setError(null);
    setTasks(prev => ({ ...prev, handleLinked: true }));
  };

  const handleSaveWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWallet = walletInput.trim().toLowerCase();
    if (!cleanWallet || cleanWallet.length < 6) {
      setError('Please enter a valid wallet address to receive your whitelist spot.');
      return;
    }
    setError(null);
    setTasks(prev => ({ ...prev, walletProvided: true }));
  };

  const handleFollowPartner = () => {
    const target = raffle?.followUrl || raffle?.twitterUrl || 'https://x.com/FlameboundNft';
    window.open(target, '_blank');
    setTasks(prev => ({ ...prev, followPartner: true }));
  };

  const handleFollowDotset = () => {
    window.open('https://x.com/FlameboundNft', '_blank');
    setTasks(prev => ({ ...prev, followDotset: true }));
  };

  const handleEngageTask = () => {
    const target = raffle?.engageUrl || raffle?.twitterUrl || 'https://x.com/FlameboundNft';
    window.open(target, '_blank');
    setTasks(prev => ({ ...prev, engage: true }));
  };

  const handleSubmitEntry = async () => {
    if (!raffle) return;
    const cleanHandle = twitterHandle.trim().replace(/^@/, '');
    const cleanWallet = walletInput.trim().toLowerCase();

    if (!cleanHandle) {
      setError('Please enter your X / Twitter handle.');
      return;
    }

    if (!cleanWallet) {
      setError('Please enter your wallet address.');
      return;
    }

    if (!allTasksCompleted) {
      setError('Please complete all social tasks above before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/raffles/${raffle.id}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: cleanWallet,
          twitterUsername: cleanHandle,
          taskStatus: {
            ...tasks,
            customTasksDone,
          },
        }),
      });

      const data = await res.json();

      if (data.success && data.entry) {
        setEntryReceipt({
          id: data.entry.id,
          walletAddress: data.entry.walletAddress,
          twitterUsername: data.entry.twitterUsername,
          verifiedAt: data.entry.createdAt || new Date().toISOString(),
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem(`dotset_entry_${raffle.id}_${cleanWallet}`, JSON.stringify(data.entry));
        }

        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#000000', '#ffffff', '#888888'],
        });
      } else {
        setError(data.message || data.error || 'Failed to submit entry.');
      }
    } catch (err) {
      console.error(err);
      setError('Network error submitting entry. Please retry.');
    } finally {
      setSubmitting(false);
    }
  };

  const getShortUrl = () => {
    if (typeof window !== 'undefined') return window.location.href;
    return `https://flamebound.site/raffle/${raffleId}`;
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = getShortUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleTwitterShare = () => {
    if (typeof window === 'undefined' || !raffle) return;
    const shortUrl = getShortUrl();
    const text = `DOTSET X ${raffle.project || raffle.title}\n[STAGE: ${mintStage}] • ${raffle.supply} SPOTS\n\nEnter now:`;
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shortUrl)}`;
    window.open(tweetUrl, '_blank');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-black selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        
        {/* Top Actions Bar */}
        <div className="flex items-center justify-between border-b-3 border-black pb-4 mb-6 sm:mb-8">
          <Link
            href="/#active-raffles"
            className="pixel-btn text-[10px] sm:text-xs py-2 px-3 sm:px-4 flex items-center gap-1.5 shadow-pixel"
          >
            <ArrowLeft size={14} />
            <span>[← ALL RAFFLES]</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="pixel-btn-white text-[10px] sm:text-xs py-2 px-3 flex items-center gap-1.5 border-2 border-black shadow-pixel-xs"
              title="Copy Page Link"
            >
              {copiedLink ? <Check size={14} /> : <Share2 size={14} />}
              <span className="hidden sm:inline">{copiedLink ? '[COPIED]' : '[SHARE]'}</span>
            </button>

            <button
              onClick={handleTwitterShare}
              className="bg-black text-white hover:bg-gray-800 p-2 sm:px-3 sm:py-2 border-2 border-black flex items-center gap-1.5 shadow-pixel-xs"
              title="Tweet on X"
            >
              <Twitter size={14} />
              <span className="hidden sm:inline font-pixel text-[10px]">[TWEET]</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border-3 border-black p-12 text-center shadow-pixel space-y-3">
            <span className="w-5 h-5 border-2 border-black border-t-transparent animate-spin inline-block" />
            <span className="font-pixel text-xs text-black block uppercase font-bold">
              LOADING RAFFLE SPECIFICATIONS...
            </span>
          </div>
        )}

        {/* Not Found State */}
        {!loading && !raffle && (
          <div className="bg-white border-3 border-black p-12 text-center shadow-pixel space-y-4">
            <h2 className="font-pixel text-base text-black font-bold uppercase">RAFFLE NOT FOUND</h2>
            <p className="font-mono text-sm text-gray-700">{error || 'This raffle does not exist or has ended.'}</p>
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
              
              <div className="bg-white border-2 sm:border-3 border-black shadow-pixel overflow-hidden">
                
                {/* Header Bar */}
                <div className="bg-black text-white px-3.5 sm:px-4 py-2.5 flex items-center justify-between border-b-2 sm:border-b-3 border-black">
                  <div className="flex items-center gap-2 truncate">
                    {raffle.logoUrl ? (
                      <img src={raffle.logoUrl} alt={projectName} className="w-5 h-5 object-contain shrink-0" />
                    ) : (
                      <img src="/images/dotset-logo.png" alt="DOTSET" className="w-5 h-5 object-contain shrink-0" />
                    )}
                    <span className="font-pixel text-xs text-white font-bold tracking-wide uppercase truncate">
                      {projectName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 border border-black font-bold tracking-wider ${
                      mintStage === 'GTD'
                        ? 'bg-white text-black shadow-pixel-xs'
                        : mintStage === 'FCFS'
                        ? 'bg-black text-white shadow-pixel-xs'
                        : 'bg-white text-black'
                    }`}>
                      [{mintStage}]
                    </span>
                    <span className={'font-pixel text-[8px] sm:text-[9px] px-2 py-0.5 border border-black font-bold ' + (isLive ? 'bg-white text-black animate-pulse' : 'bg-red-600 text-white')}>
                      {isLive ? '● LIVE' : 'CLOSED'}
                    </span>
                  </div>
                </div>

                {/* Big Artwork Banner */}
                <div className="relative border-b-2 sm:border-b-3 border-black bg-black flex items-center justify-center overflow-hidden h-56 sm:h-72">
                  <PixelArtwork
                    type={raffle.artworkType}
                    bannerUrl={raffle.bannerUrl}
                    logoUrl={raffle.logoUrl}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-black/90 border border-white/40 px-2 py-1 text-white font-pixel text-[9px] sm:text-[10px] font-bold shadow-pixel-xs">
                    [{raffle.customNetwork || raffle.network || 'ROBINHOOD NETWORK'}]
                  </div>
                  <div className="absolute top-3 left-3 px-2 py-1 font-pixel text-[9px] sm:text-[10px] font-bold shadow-pixel-xs border border-black bg-white text-black">
                    STAGE: {mintStage}
                  </div>
                </div>

                {/* Body Specs */}
                <div className="p-4 sm:p-6 space-y-4">
                  <div>
                    <h1 className="font-pixel text-base sm:text-xl text-black font-extrabold uppercase tracking-tight">
                      {raffle.title}
                    </h1>
                    <p className="font-mono text-xs sm:text-sm text-gray-700 font-bold mt-1.5 leading-relaxed">
                      {raffle.subtitle || raffle.description}
                    </p>
                  </div>

                  {raffle.notes && (
                    <div className="bg-gray-50 border-2 border-black p-3 font-mono text-xs font-bold text-black flex items-center gap-2">
                      <Sparkles size={15} className="text-black shrink-0" />
                      <span>{raffle.notes}</span>
                    </div>
                  )}

                  {/* Comprehensive Specifications Table */}
                  <div className="border-2 border-black bg-white">
                    <div className="bg-black text-white font-pixel text-[9px] px-3 py-1.5 font-bold uppercase">
                      WHITELIST SPECIFICATIONS
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 font-mono text-xs border-b border-black/20">
                      <div>
                        <span className="text-[8px] font-pixel text-gray-600 block font-bold">WL ALLOCATION:</span>
                        <span className="font-pixel text-xs text-black font-bold mt-0.5 block">{raffle.supply} SPOTS</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-pixel text-gray-600 block font-bold">TOTAL SUPPLY:</span>
                        <span className="font-bold text-black text-xs mt-0.5 block">{raffle.nftTotalSupply || 'TBA'}</span>
                      </div>
                      <div>
                        <span className="text-[8px] font-pixel text-gray-600 block font-bold">MINT PRICE:</span>
                        <span className="font-bold text-black text-xs bg-gray-100 px-1 py-0.5 border border-black inline-block mt-0.5">
                          {raffle.mintPrice || 'FREE'}
                        </span>
                      </div>
                      <div>
                        <span className="text-[8px] font-pixel text-gray-600 block font-bold">MINT DATE:</span>
                        <span className="font-bold text-black text-xs mt-0.5 block truncate">{raffle.mintDate || 'TBA'}</span>
                      </div>
                    </div>

                    <div className="p-3 space-y-1.5 font-mono text-xs">
                      <div className="flex justify-between items-center text-gray-800">
                        <span className="font-bold">MINT STAGE:</span>
                        <span className="font-pixel text-[9px] font-bold px-1.5 py-0.5 border border-black bg-black text-white">
                          [{mintStage}] {mintStage === 'GTD' ? 'GUARANTEED' : mintStage === 'FCFS' ? 'FIRST-COME FIRST-SERVED' : 'WHITELIST'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-800">
                        <span className="font-bold">MAX PER WHITELIST:</span>
                        <span className="font-bold text-black">{raffle.maxMintPerWallet || '1 PER WL'}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-800">
                        <span className="font-bold">ELIGIBILITY:</span>
                        <span className="font-bold text-black">OPEN TO ALL PARTICIPANTS</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-800 pt-1 border-t border-black/10">
                        <span className="font-bold">{mintStage === 'FCFS' ? 'CLAIMED SPOTS:' : 'TOTAL ENTRIES:'}</span>
                        <span className="font-pixel text-xs text-black font-bold">
                          {raffle.totalEntries} / {raffle.supply} {mintStage === 'FCFS' ? 'CLAIMED' : 'ENTRIES'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 4-Box Pixel Countdown Clock */}
                  <div className="bg-black text-white p-3.5 sm:p-4 border-2 sm:border-3 border-black shadow-pixel space-y-2.5">
                    <div className="flex items-center justify-between font-pixel text-[9px] border-b border-white/20 pb-1.5 font-bold">
                      <span className="text-gray-300">RAFFLE DEADLINE:</span>
                      <span className="text-white">
                        {new Date(raffle.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {isLive ? (
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white text-black p-1.5 border border-black shadow-pixel-xs">
                          <span className="font-pixel text-sm sm:text-base font-bold block">{String(timeLeft.days).padStart(2, '0')}</span>
                          <span className="font-pixel text-[7px] block font-bold text-gray-600">DAYS</span>
                        </div>
                        <div className="bg-white text-black p-1.5 border border-black shadow-pixel-xs">
                          <span className="font-pixel text-sm sm:text-base font-bold block">{String(timeLeft.hours).padStart(2, '0')}</span>
                          <span className="font-pixel text-[7px] block font-bold text-gray-600">HRS</span>
                        </div>
                        <div className="bg-white text-black p-1.5 border border-black shadow-pixel-xs">
                          <span className="font-pixel text-sm sm:text-base font-bold block">{String(timeLeft.minutes).padStart(2, '0')}</span>
                          <span className="font-pixel text-[7px] block font-bold text-gray-600">MIN</span>
                        </div>
                        <div className="bg-white text-black p-1.5 border border-black shadow-pixel-xs">
                          <span className="font-pixel text-sm sm:text-base font-bold block">{String(timeLeft.seconds).padStart(2, '0')}</span>
                          <span className="font-pixel text-[7px] block font-bold text-gray-600">SEC</span>
                        </div>
                      </div>
                    ) : (
                      <div className="font-pixel text-xs text-center text-red-400 py-2 bg-red-950/40 border border-red-800 uppercase font-bold">
                        [RAFFLE CONCLUDED]
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* Right Column: Whitelist Entry Checklist (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="bg-white border-2 sm:border-3 border-black shadow-pixel p-4 sm:p-6 space-y-4">
                
                <div className="border-b-2 border-black pb-3">
                  <h2 className="font-pixel text-sm sm:text-base text-black font-extrabold uppercase">
                    {raffle.entryMethod === 'fcfs' ? 'CLAIM FCFS WHITELIST' : 'ENTER WHITELIST'}
                  </h2>
                  <p className="font-mono text-xs text-gray-700 font-bold mt-1">
                    Complete requirements below to submit your verified entry.
                  </p>
                </div>

                {/* SUCCESS RECEIPT STATE */}
                {entryReceipt ? (
                  <div className="space-y-4 py-2">
                    <div className="bg-black text-white border-2 border-black p-4 sm:p-5 text-center space-y-2 shadow-pixel">
                      <div className="inline-block p-1.5 bg-white text-black mb-1">
                        <CheckCircle size={26} />
                      </div>
                      <h3 className="font-pixel text-xs sm:text-sm font-bold text-white uppercase">
                        {raffle.entryMethod === 'fcfs' ? 'FCFS SPOT CONFIRMED!' : 'WHITELIST ENTRY CONFIRMED!'}
                      </h3>
                      <p className="font-mono text-xs text-gray-300 font-bold">
                        Your entry is confirmed in this drop!
                      </p>
                    </div>

                    {/* Receipt Specs Card */}
                    <div className="bg-gray-50 border-2 border-black p-3.5 space-y-2 shadow-pixel-xs font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-black/20 pb-2">
                        <span className="font-pixel text-[9px] text-gray-600">TICKET ID:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-pixel text-xs font-bold text-black select-all">
                            {entryReceipt.id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(entryReceipt.id);
                              setCopiedReceipt(true);
                              setTimeout(() => setCopiedReceipt(false), 2000);
                            }}
                            className="p-1 bg-black text-white hover:bg-gray-800 transition-colors"
                            title="Copy Ticket ID"
                          >
                            {copiedReceipt ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 pt-1">
                        <div>
                          <span className="text-gray-600 block text-[9px]">WALLET:</span>
                          <span className="font-mono font-bold text-black select-all break-all text-xs">
                            {entryReceipt.walletAddress}
                          </span>
                        </div>
                        {entryReceipt.twitterUsername && (
                          <div>
                            <span className="text-gray-600 block text-[9px]">X HANDLE:</span>
                            <span className="font-mono font-bold text-black text-xs">
                              @{entryReceipt.twitterUsername.replace('@', '')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/#active-raffles"
                      className="w-full pixel-btn text-xs py-3 shadow-pixel block text-center"
                    >
                      [← RETURN TO ALL RAFFLES]
                    </Link>
                  </div>
                ) : (
                  /* SIMPLE OPEN ENTRY FORM */
                  <>
                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center font-pixel text-[9px] uppercase font-bold text-black">
                        <span>{completedCount}/{totalTasks} TASKS COMPLETED</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-2.5 bg-gray-200 border border-black p-0.5">
                        <div
                          className="h-full bg-black transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Error Notification */}
                    {error && (
                      <div className="bg-red-500 text-white border-2 border-black p-2 font-mono text-xs flex items-center gap-2 font-bold">
                        <ShieldAlert size={15} className="shrink-0" />
                        <div className="flex-1 text-[10px]">
                          {error}
                        </div>
                      </div>
                    )}

                    {/* CHECKLIST ITEMS */}
                    <div className="space-y-2 pt-1">
                      
                      {/* 1. YOUR X HANDLE */}
                      <div className={'border-2 border-black p-2.5 transition-colors ' + (tasks.handleLinked ? 'bg-gray-100' : 'bg-white')}>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <AtSign size={14} className="text-black shrink-0" />
                          <span className="font-pixel text-[10px] font-bold text-black uppercase">
                            YOUR X (TWITTER) HANDLE
                          </span>
                        </div>

                        <form onSubmit={handleSaveHandle} className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="@yourhandle"
                            value={twitterHandle}
                            onChange={(e) => {
                              setTwitterHandle(e.target.value);
                              setTasks(prev => ({ ...prev, handleLinked: false }));
                            }}
                            className="flex-1 bg-white border border-black p-1.5 text-xs font-mono font-bold outline-none"
                          />
                          <button
                            type="submit"
                            className={'pixel-btn text-[9px] py-1.5 px-2.5 shrink-0 ' + (tasks.handleLinked ? 'bg-black text-white' : '')}
                          >
                            {tasks.handleLinked ? '✓ DONE' : '[SET]'}
                          </button>
                        </form>
                      </div>

                      {/* 2. RECEIVING WALLET ADDRESS */}
                      <div className={'border-2 border-black p-2.5 transition-colors ' + (tasks.walletProvided ? 'bg-gray-100' : 'bg-white')}>
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <Wallet size={14} className="text-black shrink-0" />
                            <span className="font-pixel text-[10px] font-bold text-black uppercase">
                              RECEIVING WALLET ADDRESS
                            </span>
                          </div>
                          {address && (
                            <button
                              type="button"
                              onClick={() => {
                                setWalletInput(address);
                                setTasks(prev => ({ ...prev, walletProvided: true }));
                              }}
                              className="font-pixel text-[8px] underline text-gray-700"
                            >
                              [USE CONNECTED]
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleSaveWallet} className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="0x... (EVM Wallet Address)"
                            value={walletInput}
                            onChange={(e) => {
                              setWalletInput(e.target.value);
                              setTasks(prev => ({ ...prev, walletProvided: false }));
                            }}
                            className="flex-1 bg-white border border-black p-1.5 text-xs font-mono font-bold outline-none"
                          />
                          <button
                            type="submit"
                            className={'pixel-btn text-[9px] py-1.5 px-2.5 shrink-0 ' + (tasks.walletProvided ? 'bg-black text-white' : '')}
                          >
                            {tasks.walletProvided ? '✓ DONE' : '[SET]'}
                          </button>
                        </form>
                      </div>

                      {/* 3. FOLLOW PARTNER */}
                      <div className={'border-2 border-black p-2.5 flex items-center justify-between gap-2 transition-colors ' + (tasks.followPartner ? 'bg-gray-100' : 'bg-white')}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Twitter size={14} className="text-black shrink-0" />
                          <span className="font-pixel text-[9px] font-bold text-black uppercase truncate">
                            FOLLOW ({projectName})
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleFollowPartner}
                          className={'pixel-btn text-[9px] py-1.5 px-2.5 flex items-center gap-1 shrink-0 ' + (tasks.followPartner ? 'bg-black text-white' : '')}
                        >
                          {tasks.followPartner ? (
                            <>
                              <Check size={11} />
                              <span>[DONE]</span>
                            </>
                          ) : (
                            <>
                              <span>[FOLLOW]</span>
                              <ExternalLink size={10} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* 4. FOLLOW DOTSET */}
                      <div className={'border-2 border-black p-2.5 flex items-center justify-between gap-2 transition-colors ' + (tasks.followDotset ? 'bg-gray-100' : 'bg-white')}>
                        <div className="flex items-center gap-1.5 min-w-0">
                          <Twitter size={14} className="text-black shrink-0" />
                          <span className="font-pixel text-[9px] font-bold text-black uppercase truncate">
                            FOLLOW (DOTSET)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={handleFollowDotset}
                          className={'pixel-btn text-[9px] py-1.5 px-2.5 flex items-center gap-1 shrink-0 ' + (tasks.followDotset ? 'bg-black text-white' : '')}
                        >
                          {tasks.followDotset ? (
                            <>
                              <Check size={11} />
                              <span>[DONE]</span>
                            </>
                          ) : (
                            <>
                              <span>[FOLLOW]</span>
                              <ExternalLink size={10} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* 5. ENGAGE WITH POST */}
                      {raffle.engageUrl && (
                        <div className={'border-2 border-black p-2.5 flex items-center justify-between gap-2 transition-colors ' + (tasks.engage ? 'bg-gray-100' : 'bg-white')}>
                          <div className="flex items-center gap-1.5 min-w-0">
                            <MessageSquare size={14} className="text-black shrink-0" />
                            <span className="font-pixel text-[9px] font-bold text-black uppercase truncate">
                              ENGAGE WITH POST
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={handleEngageTask}
                            className={'pixel-btn text-[9px] py-1.5 px-2.5 flex items-center gap-1 shrink-0 ' + (tasks.engage ? 'bg-black text-white' : '')}
                          >
                            {tasks.engage ? (
                              <>
                                <Check size={11} />
                                <span>[DONE]</span>
                              </>
                            ) : (
                              <>
                                <span>[POST]</span>
                                <ExternalLink size={10} />
                              </>
                            )}
                          </button>
                        </div>
                      )}

                      {/* 6+. DYNAMIC CUSTOM TASKS */}
                      {customTasksList.map((ct, idx) => {
                        const isDone = Boolean(customTasksDone[ct.id]);
                        return (
                          <div
                            key={ct.id || idx}
                            className={'border-2 border-black p-2.5 flex items-center justify-between gap-2 transition-colors ' + (isDone ? 'bg-gray-100' : 'bg-white')}
                          >
                            <div className="flex items-center gap-1.5 min-w-0">
                              {ct.type === 'discord' ? (
                                <MessageSquare size={14} className="text-black shrink-0" />
                              ) : ct.type === 'telegram' ? (
                                <Send size={14} className="text-black shrink-0" />
                              ) : ct.type === 'twitter' ? (
                                <Twitter size={14} className="text-black shrink-0" />
                              ) : (
                                <Globe size={14} className="text-black shrink-0" />
                              )}
                              <span className="font-pixel text-[9px] font-bold text-black uppercase truncate">
                                {ct.title}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (ct.url) window.open(ct.url, '_blank');
                                setCustomTasksDone(prev => ({ ...prev, [ct.id]: true }));
                              }}
                              className={'pixel-btn text-[9px] py-1.5 px-2.5 flex items-center gap-1 shrink-0 ' + (isDone ? 'bg-black text-white' : '')}
                            >
                              {isDone ? (
                                <>
                                  <Check size={11} />
                                  <span>[DONE]</span>
                                </>
                              ) : (
                                <>
                                  <span>{ct.actionLabel || '[VISIT]'}</span>
                                  <ExternalLink size={10} />
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}

                    </div>

                    {/* Submit Whitelist Entry CTA */}
                    <div className="pt-2 border-t-2 border-black">
                      <button
                        type="button"
                        onClick={handleSubmitEntry}
                        disabled={!allTasksCompleted || submitting || !isLive || (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)}
                        className={'w-full py-3 font-pixel text-xs tracking-wider uppercase font-bold transition-all shadow-pixel text-center ' + (
                          allTasksCompleted && !submitting && isLive && !(raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                            ? 'bg-black text-white hover:bg-gray-800 cursor-pointer' 
                            : 'bg-gray-200 text-gray-500 border-2 border-black cursor-not-allowed'
                        )}
                      >
                        {submitting 
                          ? 'CONFIRMING ENTRY...' 
                          : !isLive
                          ? '[RAFFLE CLOSED / CONCLUDED]'
                          : (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                          ? '[ALL FCFS SPOTS CLAIMED]'
                          : allTasksCompleted 
                          ? (mintStage === 'FCFS' ? '[CLAIM FCFS SPOT]' : '[SUBMIT WHITELIST ENTRY]')
                          : ('[COMPLETE ALL TASKS (' + completedCount + '/' + totalTasks + ')]')}
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
