'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Raffle, CustomTask } from '@/lib/types';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { PixelArtwork } from '@/components/PixelArtworks';
import { ChainBadge } from '@/components/ChainBadge';
import { useWallet } from '@/lib/wallet-context';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Share2, 
  Twitter, 
  ExternalLink, 
  CheckCircle2, 
  Copy, 
  Check, 
  MessageSquare, 
  Wallet, 
  AtSign, 
  Send, 
  Globe, 
  ShieldAlert,
  ArrowRight,
  Youtube
} from 'lucide-react';

export default function SingleRafflePage() {
  const params = useParams();
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

  const baseTaskCount = 4;
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
    const target = raffle?.followUrl || raffle?.twitterUrl || 'https://x.com/dotsetxyz';
    window.open(target, '_blank');
    setTasks(prev => ({ ...prev, followPartner: true }));
  };

  const handleFollowDotset = () => {
    window.open('https://x.com/dotsetxyz', '_blank');
    setTasks(prev => ({ ...prev, followDotset: true }));
  };

  const handleEngageTask = () => {
    const target = raffle?.engageUrl || raffle?.twitterUrl || 'https://x.com/dotsetxyz';
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
      setError('Please enter your receiving wallet address.');
      return;
    }

    if (!allTasksCompleted) {
      setError('Please complete all requirements above before submitting.');
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
          colors: ['#4f52c8', '#a5b4fc', '#4ade80', '#ffffff'],
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
    return `https://dotset.xyz/raffle/${raffleId}`;
  };

  const handleShare = () => {
    if (typeof window === 'undefined') return;
    const url = getShortUrl();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
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
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#293681] selection:text-white">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <Link
            href="/#active-raffles"
            className="btn-outline-cq text-xs py-2 px-3.5 flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>All Raffles</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="btn-outline-cq text-xs py-2 px-3 flex items-center gap-1.5"
              title="Copy Page Link"
            >
              {copiedLink ? <Check size={14} className="text-[#16a34a]" /> : <Share2 size={14} />}
              <span>{copiedLink ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handleTwitterShare}
              className="btn-primary-cq text-xs py-2 px-3 flex items-center gap-1.5"
            >
              <Twitter size={14} />
              <span>Tweet</span>
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white border border-gray-200 p-12 rounded-xl text-center space-y-3 shadow-sm">
            <span className="w-5 h-5 border-2 border-[#293681] border-t-transparent animate-spin inline-block rounded-full" />
            <p className="font-dm text-sm text-gray-500">
              Loading campaign details...
            </p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && !raffle && (
          <div className="bg-white border border-gray-200 p-12 rounded-xl text-center space-y-4 shadow-sm">
            <h2 className="font-syne text-lg text-gray-900 font-bold">Campaign Not Found</h2>
            <p className="font-dm text-sm text-gray-500">{error || 'This raffle does not exist or has ended.'}</p>
            <Link href="/" className="btn-primary-cq text-xs py-2.5 px-5 inline-block">
              Return to Directory
            </Link>
          </div>
        )}

        {/* Main Content Layout */}
        {!loading && raffle && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Raffle Media & Complete Technical Specs (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="cq-card overflow-hidden">
                
                {/* Header Bar */}
                <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b border-gray-200">
                  <div className="flex items-center gap-2.5 truncate">
                    {raffle.logoUrl ? (
                      <img src={raffle.logoUrl} alt={projectName} className="w-5 h-5 object-contain rounded" />
                    ) : (
                      <img src="/images/dotset-logo.png" alt="DOTSET" className="w-5 h-5 object-contain rounded" />
                    )}
                    <span className="font-syne text-sm font-bold text-gray-900 tracking-wide truncate">
                      {projectName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded font-mono-dm text-[10px] uppercase font-bold bg-blue-50 border border-blue-200 text-[#293681]">
                      {mintStage}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono-dm text-[10px] font-semibold ${
                      isLive 
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' 
                        : 'bg-gray-100 border border-gray-200 text-gray-500'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#16a34a] animate-pulse' : 'bg-gray-400'}`} />
                      <span>{isLive ? 'Live' : 'Closed'}</span>
                    </span>
                  </div>
                </div>

                {/* Big Artwork Banner */}
                <div className="relative overflow-hidden h-64 sm:h-80 bg-gray-100">
                  <PixelArtwork
                    type={raffle.artworkType}
                    bannerUrl={raffle.bannerUrl}
                    logoUrl={raffle.logoUrl}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
                  
                  {/* Top-Right: Network Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <ChainBadge
                      network={raffle.network}
                      customNetwork={raffle.customNetwork}
                      customNetworkLogoUrl={raffle.customNetworkLogoUrl}
                      size="sm"
                    />
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded font-mono-dm text-[10px] font-bold bg-[#293681] text-white shadow-sm">
                    Stage: {mintStage}
                  </div>
                </div>

                {/* Body Specs */}
                <div className="p-6 space-y-5">
                  <div>
                    <h1 className="font-syne text-xl sm:text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
                      <span>{raffle.title}</span>
                      <CheckCircle2 size={18} className="text-[#38bdf8] shrink-0" />
                    </h1>
                    <p className="font-dm text-xs sm:text-sm text-gray-500 mt-2 leading-relaxed">
                      {raffle.subtitle || raffle.description}
                    </p>
                  </div>

                  {raffle.notes && (
                    <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-lg font-dm text-xs text-[#293681] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#293681] shrink-0" />
                      <span>{raffle.notes}</span>
                    </div>
                  )}

                  {/* Specifications Grid */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
                    <div className="bg-gray-50 px-4 py-2 font-mono-dm text-[11px] text-gray-600 uppercase font-semibold border-b border-gray-200">
                      Campaign Details
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 font-dm text-xs border-b border-gray-100">
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono-dm block uppercase font-medium">Allocation</span>
                        <span className="font-mono-dm text-sm text-[#293681] font-bold mt-0.5 block">{raffle.supply} Spots</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono-dm block uppercase font-medium">Total Supply</span>
                        <span className="font-mono-dm text-sm text-gray-900 font-medium mt-0.5 block">{raffle.nftTotalSupply || 'TBA'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono-dm block uppercase font-medium">Mint Price</span>
                        <span className="font-mono-dm text-xs text-[#16a34a] font-semibold mt-0.5 block">{raffle.mintPrice || 'FREE'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 font-mono-dm block uppercase font-medium">Mint Date</span>
                        <span className="font-mono-dm text-xs text-gray-900 mt-0.5 block truncate">{raffle.mintDate || 'TBA'}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 font-dm text-xs">
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Stage:</span>
                        <span className="font-mono-dm text-xs text-gray-900 font-semibold">
                          {mintStage === 'GTD' ? 'Guaranteed (GTD)' : mintStage === 'FCFS' ? 'First-Come First-Served' : 'Whitelist'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Max per Winner:</span>
                        <span className="font-mono-dm text-xs text-gray-900">{raffle.maxMintPerWallet || '1 Spot'}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600">
                        <span>Eligibility:</span>
                        <span className="font-mono-dm text-xs text-[#16a34a] font-medium">Open to All Participants</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-600 pt-2 border-t border-gray-100">
                        <span>Total Registered:</span>
                        <span className="font-mono-dm text-xs text-gray-900 font-bold">
                          {raffle.totalEntries || 0} Entrants
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Clock */}
                  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between font-mono-dm text-xs text-gray-600">
                      <span>Deadline:</span>
                      <span className="text-gray-900 font-semibold">
                        {new Date(raffle.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {isLive ? (
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                          <span className="font-grotesk text-lg sm:text-xl font-bold block text-gray-900">{String(timeLeft.days).padStart(2, '0')}</span>
                          <span className="font-mono-dm text-[9px] text-gray-400 uppercase font-medium">Days</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                          <span className="font-grotesk text-lg sm:text-xl font-bold block text-gray-900">{String(timeLeft.hours).padStart(2, '0')}</span>
                          <span className="font-mono-dm text-[9px] text-gray-400 uppercase font-medium">Hours</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                          <span className="font-grotesk text-lg sm:text-xl font-bold block text-gray-900">{String(timeLeft.minutes).padStart(2, '0')}</span>
                          <span className="font-mono-dm text-[9px] text-gray-400 uppercase font-medium">Mins</span>
                        </div>
                        <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                          <span className="font-grotesk text-lg sm:text-xl font-bold block text-gray-900">{String(timeLeft.seconds).padStart(2, '0')}</span>
                          <span className="font-mono-dm text-[9px] text-gray-400 uppercase font-medium">Secs</span>
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono-dm text-xs text-center text-red-600 py-2 bg-red-50 rounded-lg border border-red-200 font-medium">
                        Campaign Concluded
                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* Right Column: Whitelist Entry Checklist (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="cq-card p-5 sm:p-6 space-y-4">
                
                <div className="border-b border-gray-200 pb-3">
                  <h2 className="font-syne text-base font-bold text-gray-900">
                    {raffle.entryMethod === 'fcfs' ? 'Claim FCFS Spot' : 'Enter Whitelist'}
                  </h2>
                  <p className="font-dm text-xs text-gray-500 mt-1">
                    Complete requirements to submit your verified entry.
                  </p>
                </div>

                {/* SUCCESS RECEIPT STATE */}
                {entryReceipt ? (
                  <div className="space-y-4 py-2">
                    <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-xl text-center space-y-2">
                      <div className="inline-block p-2 bg-emerald-100 rounded-full text-emerald-600 mb-1">
                        <CheckCircle2 size={28} />
                      </div>
                      <h3 className="font-syne text-sm font-bold text-gray-900">
                        {raffle.entryMethod === 'fcfs' ? 'FCFS Spot Confirmed!' : 'Whitelist Entry Confirmed!'}
                      </h3>
                      <p className="font-dm text-xs text-gray-600">
                        Your registration has been successfully recorded.
                      </p>
                    </div>

                    {/* Receipt Specs Card */}
                    <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2.5 font-dm text-xs">
                      <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                        <span className="text-gray-500 font-mono-dm text-[11px]">Ticket ID:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-dm text-xs font-bold text-[#293681] select-all">
                            {entryReceipt.id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(entryReceipt.id);
                              setCopiedReceipt(true);
                              setTimeout(() => setCopiedReceipt(false), 2000);
                            }}
                            className="p-1 rounded bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                            title="Copy Ticket ID"
                          >
                            {copiedReceipt ? <Check size={12} className="text-[#16a34a]" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div>
                          <span className="text-gray-400 block font-mono-dm text-[10px] uppercase font-medium">Receiving Wallet:</span>
                          <span className="font-mono-dm text-xs text-gray-900 select-all break-all font-medium">
                            {entryReceipt.walletAddress}
                          </span>
                        </div>
                        {entryReceipt.twitterUsername && (
                          <div>
                            <span className="text-gray-400 block font-mono-dm text-[10px] uppercase font-medium">X Handle:</span>
                            <span className="font-mono-dm text-xs text-gray-900 font-medium">
                              @{entryReceipt.twitterUsername.replace('@', '')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <Link
                      href="/#active-raffles"
                      className="w-full btn-outline-cq text-xs py-3 block text-center"
                    >
                      Return to Directory
                    </Link>
                  </div>
                ) : (
                  /* SIMPLE OPEN ENTRY FORM */
                  <>
                    {/* Progress Bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center font-mono-dm text-[11px] text-gray-500">
                        <span>{completedCount}/{totalTasks} Tasks Completed</span>
                        <span className="font-semibold text-[#293681]">{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#293681] rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Error Notification */}
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg font-dm text-xs flex items-center gap-2">
                        <ShieldAlert size={16} className="shrink-0" />
                        <div className="flex-1 text-xs">
                          {error}
                        </div>
                      </div>
                    )}

                    {/* CHECKLIST ITEMS */}
                    <div className="space-y-2 pt-1">
                      
                      {/* 1. YOUR X HANDLE */}
                      <div className={`p-3 rounded-lg border transition-colors ${tasks.handleLinked ? 'bg-emerald-50/40 border-emerald-300' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-1.5 mb-2 font-dm text-xs font-semibold text-gray-900">
                          <AtSign size={14} className="text-gray-500" />
                          <span>Your X (Twitter) Handle</span>
                        </div>

                        <form onSubmit={handleSaveHandle} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="@yourhandle"
                            value={twitterHandle}
                            onChange={(e) => {
                              setTwitterHandle(e.target.value);
                              setTasks(prev => ({ ...prev, handleLinked: false }));
                            }}
                            className="flex-1 bg-white border border-gray-300 rounded-md px-2.5 py-1.5 text-xs font-mono-dm text-gray-900 placeholder-gray-400 outline-none focus:border-[#293681]"
                          />
                          <button
                            type="submit"
                            className={`px-3 py-1.5 rounded-md font-dm text-xs font-semibold shrink-0 transition-colors ${
                              tasks.handleLinked 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                                : 'bg-[#293681] text-white hover:bg-[#4274d9]'
                            }`}
                          >
                            {tasks.handleLinked ? 'Linked' : 'Set'}
                          </button>
                        </form>
                      </div>

                      {/* 2. RECEIVING WALLET ADDRESS */}
                      <div className={`p-3 rounded-lg border transition-colors ${tasks.walletProvided ? 'bg-emerald-50/40 border-emerald-300' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <div className="flex items-center gap-1.5 font-dm text-xs font-semibold text-gray-900">
                            <Wallet size={14} className="text-gray-500" />
                            <span>
                              {raffle.walletAddressLabel || (raffle.network === 'SOLANA' ? 'Receiving Solana Wallet Address' : 'Receiving EVM Wallet Address')}
                            </span>
                          </div>
                          {address && (
                            <button
                              type="button"
                              onClick={() => {
                                setWalletInput(address);
                                setTasks(prev => ({ ...prev, walletProvided: true }));
                              }}
                              className="font-mono-dm text-[10px] text-[#293681] font-semibold hover:underline"
                            >
                              [Use Connected]
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleSaveWallet} className="flex gap-2">
                          <input
                            type="text"
                            placeholder={raffle.walletAddressPlaceholder || (raffle.network === 'SOLANA' ? 'Enter Solana Wallet Address...' : '0x... (Whitelist receiver)')}
                            value={walletInput}
                            onChange={(e) => {
                              setWalletInput(e.target.value);
                              setTasks(prev => ({ ...prev, walletProvided: false }));
                            }}
                            className="flex-1 bg-white border border-gray-300 rounded-md px-2.5 py-1.5 text-xs font-mono-dm text-gray-900 placeholder-gray-400 outline-none focus:border-[#293681]"
                          />
                          <button
                            type="submit"
                            className={`px-3 py-1.5 rounded-md font-dm text-xs font-semibold shrink-0 transition-colors ${
                              tasks.walletProvided 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' 
                                : 'bg-[#293681] text-white hover:bg-[#4274d9]'
                            }`}
                          >
                            {tasks.walletProvided ? 'Set' : 'Confirm'}
                          </button>
                        </form>
                      </div>

                      {/* 3. FOLLOW PARTNER */}
                      <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${tasks.followPartner ? 'bg-emerald-50/40 border-emerald-300' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2 min-w-0 font-dm text-xs font-semibold text-gray-900">
                          <Twitter size={14} className="text-[#38bdf8] shrink-0" />
                          <span className="truncate">Follow @{projectName}</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleFollowPartner}
                          className={`px-3 py-1.5 rounded-md font-dm text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                            tasks.followPartner
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          {tasks.followPartner ? (
                            <>
                              <Check size={12} />
                              <span>Done</span>
                            </>
                          ) : (
                            <>
                              <span>Follow</span>
                              <ExternalLink size={11} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* 4. FOLLOW DOTSET */}
                      <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${tasks.followDotset ? 'bg-emerald-50/40 border-emerald-300' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2 min-w-0 font-dm text-xs font-semibold text-gray-900">
                          <Twitter size={14} className="text-[#38bdf8] shrink-0" />
                          <span className="truncate">Follow @DOTSET</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleFollowDotset}
                          className={`px-3 py-1.5 rounded-md font-dm text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                            tasks.followDotset
                              ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                              : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-100'
                          }`}
                        >
                          {tasks.followDotset ? (
                            <>
                              <Check size={12} />
                              <span>Done</span>
                            </>
                          ) : (
                            <>
                              <span>Follow</span>
                              <ExternalLink size={11} />
                            </>
                          )}
                        </button>
                      </div>

                      {/* 5. ENGAGE WITH POST */}
                      {raffle.engageUrl && (
                        <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${tasks.engage ? 'bg-emerald-50/40 border-emerald-300' : 'bg-gray-50 border-gray-200'}`}>
                          <div className="flex items-center gap-2 min-w-0 font-dm text-xs font-semibold text-gray-900">
                            <MessageSquare size={14} className="text-[#ea580c] shrink-0" />
                            <span className="truncate">Like & Repost Post</span>
                          </div>

                          <button
                            type="button"
                            onClick={handleEngageTask}
                            className={`px-3 py-1.5 rounded-md font-dm text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                              tasks.engage
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-100'
                            }`}
                          >
                            {tasks.engage ? (
                              <>
                                <Check size={12} />
                                <span>Done</span>
                              </>
                            ) : (
                              <>
                                <span>Engage</span>
                                <ExternalLink size={11} />
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
                            className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${isDone ? 'bg-emerald-50/40 border-emerald-300' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 font-dm text-xs font-semibold text-gray-900">
                              {ct.type === 'discord' ? (
                                <MessageSquare size={14} className="text-[#293681] shrink-0" />
                              ) : ct.type === 'telegram' ? (
                                <Send size={14} className="text-[#38bdf8] shrink-0" />
                              ) : ct.type === 'twitter' ? (
                                <Twitter size={14} className="text-[#38bdf8] shrink-0" />
                              ) : ct.type === 'youtube' ? (
                                <Youtube size={14} className="text-[#ef4444] shrink-0" />
                              ) : (
                                <Globe size={14} className="text-[#16a34a] shrink-0" />
                              )}
                              <span className="truncate">{ct.title}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (ct.url) window.open(ct.url, '_blank');
                                setCustomTasksDone(prev => ({ ...prev, [ct.id]: true }));
                              }}
                              className={`px-3 py-1.5 rounded-md font-dm text-xs font-semibold flex items-center gap-1 shrink-0 transition-colors ${
                                isDone
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                  : 'bg-white border border-gray-200 text-gray-800 hover:bg-gray-100'
                              }`}
                            >
                              {isDone ? (
                                <>
                                  <Check size={12} />
                                  <span>Done</span>
                                </>
                              ) : (
                                <>
                                  <span>{ct.actionLabel || 'Visit'}</span>
                                  <ExternalLink size={11} />
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}

                    </div>

                    {/* Submit Whitelist Entry CTA */}
                    <div className="pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleSubmitEntry}
                        disabled={!allTasksCompleted || submitting || !isLive || (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)}
                        className={`w-full py-3 rounded-lg font-dm text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                          allTasksCompleted && !submitting && isLive && !(raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                            ? 'bg-[#293681] text-white hover:bg-[#4274d9] cursor-pointer shadow-md' 
                            : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
                        }`}
                      >
                        {submitting 
                          ? 'Confirming Entry...' 
                          : !isLive
                          ? 'Campaign Concluded'
                          : (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                          ? 'All FCFS Spots Claimed'
                          : allTasksCompleted 
                          ? (mintStage === 'FCFS' ? 'Claim FCFS Spot' : 'Submit Whitelist Entry')
                          : (`Complete All Tasks (${completedCount}/${totalTasks})`)}
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
