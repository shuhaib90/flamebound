'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  CheckCircle2, 
  Copy, 
  Check, 
  MessageSquare, 
  Wallet, 
  AtSign, 
  Send, 
  Globe, 
  Sparkles,
  ShieldAlert,
  ArrowRight
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
    return `https://flamebound.site/raffle/${raffleId}`;
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
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#f0f0f0] selection:bg-[#4f52c8] selection:text-white">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-white/[0.08]">
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
              {copiedLink ? <Check size={14} className="text-[#4ade80]" /> : <Share2 size={14} />}
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
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-12 rounded-xl text-center space-y-3">
            <span className="w-5 h-5 border-2 border-[#a5b4fc] border-t-transparent animate-spin inline-block rounded-full" />
            <p className="font-dm text-sm text-[#8a8a9a]">
              Loading campaign details...
            </p>
          </div>
        )}

        {/* Not Found State */}
        {!loading && !raffle && (
          <div className="bg-[#0f0f0f] border border-white/[0.08] p-12 rounded-xl text-center space-y-4">
            <h2 className="font-syne text-lg text-white font-bold">Campaign Not Found</h2>
            <p className="font-dm text-sm text-[#8a8a9a]">{error || 'This raffle does not exist or has ended.'}</p>
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
                <div className="bg-[#141414] px-4 py-3 flex items-center justify-between border-b border-white/[0.08]">
                  <div className="flex items-center gap-2.5 truncate">
                    {raffle.logoUrl ? (
                      <img src={raffle.logoUrl} alt={projectName} className="w-5 h-5 object-contain rounded" />
                    ) : (
                      <img src="/images/dotset-logo.png" alt="DOTSET" className="w-5 h-5 object-contain rounded" />
                    )}
                    <span className="font-syne text-sm font-bold text-white tracking-wide truncate">
                      {projectName}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded font-mono-dm text-[10px] uppercase font-semibold bg-[#4f52c8]/30 border border-[#a5b4fc]/30 text-[#a5b4fc]">
                      {mintStage}
                    </span>
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-mono-dm text-[10px] ${
                      isLive 
                        ? 'bg-[#4ade80]/10 border border-[#4ade80]/30 text-[#4ade80]' 
                        : 'bg-white/5 border border-white/10 text-[#8a8a9a]'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#4ade80] animate-pulse' : 'bg-gray-500'}`} />
                      <span>{isLive ? 'Live' : 'Closed'}</span>
                    </span>
                  </div>
                </div>

                {/* Big Artwork Banner */}
                <div className="relative overflow-hidden h-64 sm:h-80 bg-[#111111]">
                  <PixelArtwork
                    type={raffle.artworkType}
                    bannerUrl={raffle.bannerUrl}
                    logoUrl={raffle.logoUrl}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f0f0f] via-transparent to-transparent" />
                  
                  <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded text-[#f0f0f0] font-mono-dm text-[10px] font-medium">
                    {raffle.customNetwork || raffle.network || 'ROBINHOOD NETWORK'}
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded font-mono-dm text-[10px] font-medium bg-black/70 backdrop-blur-md border border-white/10 text-[#a5b4fc]">
                    Stage: {mintStage}
                  </div>
                </div>

                {/* Body Specs */}
                <div className="p-6 space-y-5">
                  <div>
                    <h1 className="font-syne text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                      <span>{raffle.title}</span>
                      <CheckCircle2 size={18} className="text-[#38bdf8] shrink-0" />
                    </h1>
                    <p className="font-dm text-xs sm:text-sm text-[#8a8a9a] mt-2 leading-relaxed">
                      {raffle.subtitle || raffle.description}
                    </p>
                  </div>

                  {raffle.notes && (
                    <div className="bg-[#4f52c8]/10 border border-[#a5b4fc]/20 p-3 rounded-lg font-dm text-xs text-[#a5b4fc] flex items-center gap-2">
                      <Sparkles size={16} className="shrink-0" />
                      <span>{raffle.notes}</span>
                    </div>
                  )}

                  {/* Specifications Grid */}
                  <div className="border border-white/[0.08] rounded-xl overflow-hidden bg-[#111111]">
                    <div className="bg-white/[0.03] px-4 py-2 font-mono-dm text-[11px] text-[#8a8a9a] uppercase font-semibold border-b border-white/[0.08]">
                      Campaign Details
                    </div>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 font-dm text-xs border-b border-white/[0.06]">
                      <div>
                        <span className="text-[10px] text-[#555566] font-mono-dm block uppercase">Allocation</span>
                        <span className="font-mono-dm text-sm text-[#a5b4fc] font-bold mt-0.5 block">{raffle.supply} Spots</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#555566] font-mono-dm block uppercase">Total Supply</span>
                        <span className="font-mono-dm text-sm text-white font-medium mt-0.5 block">{raffle.nftTotalSupply || 'TBA'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#555566] font-mono-dm block uppercase">Mint Price</span>
                        <span className="font-mono-dm text-xs text-[#4ade80] font-semibold mt-0.5 block">{raffle.mintPrice || 'FREE'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#555566] font-mono-dm block uppercase">Mint Date</span>
                        <span className="font-mono-dm text-xs text-white mt-0.5 block truncate">{raffle.mintDate || 'TBA'}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-2 font-dm text-xs">
                      <div className="flex justify-between items-center text-[#8a8a9a]">
                        <span>Stage:</span>
                        <span className="font-mono-dm text-xs text-white font-semibold">
                          {mintStage === 'GTD' ? 'Guaranteed (GTD)' : mintStage === 'FCFS' ? 'First-Come First-Served' : 'Whitelist'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-[#8a8a9a]">
                        <span>Max per Winner:</span>
                        <span className="font-mono-dm text-xs text-white">{raffle.maxMintPerWallet || '1 Spot'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[#8a8a9a]">
                        <span>Eligibility:</span>
                        <span className="font-mono-dm text-xs text-[#4ade80]">Open to All Participants</span>
                      </div>
                      <div className="flex justify-between items-center text-[#8a8a9a] pt-2 border-t border-white/[0.06]">
                        <span>Total Registered:</span>
                        <span className="font-mono-dm text-xs text-white font-bold">
                          {raffle.totalEntries || 0} Entrants
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Countdown Clock */}
                  <div className="bg-[#111111] p-4 rounded-xl border border-white/[0.08] space-y-3">
                    <div className="flex items-center justify-between font-mono-dm text-xs text-[#8a8a9a]">
                      <span>Deadline:</span>
                      <span className="text-white">
                        {new Date(raffle.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>

                    {isLive ? (
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div className="bg-[#161616] p-2 rounded-lg border border-white/[0.06]">
                          <span className="font-grotesk text-lg sm:text-xl font-bold block text-white">{String(timeLeft.days).padStart(2, '0')}</span>
                          <span className="font-mono-dm text-[9px] text-[#555566] uppercase">Days</span>
                        </div>
                        <div className="bg-[#161616] p-2 rounded-lg border border-white/[0.06]">
                          <span className="font-grotesk text-lg sm:text-xl font-bold block text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
                          <span className="font-mono-dm text-[9px] text-[#555566] uppercase">Hours</span>
                        </div>
                        <div className="bg-[#161616] p-2 rounded-lg border border-white/[0.06]">
                          <span className="font-grotesk text-lg sm:text-xl font-bold block text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
                          <span className="font-mono-dm text-[9px] text-[#555566] uppercase">Mins</span>
                        </div>
                        <div className="bg-[#161616] p-2 rounded-lg border border-white/[0.06]">
                          <span className="font-grotesk text-lg sm:text-xl font-bold block text-white">{String(timeLeft.seconds).padStart(2, '0')}</span>
                          <span className="font-mono-dm text-[9px] text-[#555566] uppercase">Secs</span>
                        </div>
                      </div>
                    ) : (
                      <div className="font-mono-dm text-xs text-center text-[#f87171] py-2 bg-[#f87171]/10 rounded-lg border border-[#f87171]/20">
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
                
                <div className="border-b border-white/[0.08] pb-3">
                  <h2 className="font-syne text-base font-bold text-white">
                    {raffle.entryMethod === 'fcfs' ? 'Claim FCFS Spot' : 'Enter Whitelist'}
                  </h2>
                  <p className="font-dm text-xs text-[#8a8a9a] mt-1">
                    Complete requirements to submit your verified entry.
                  </p>
                </div>

                {/* SUCCESS RECEIPT STATE */}
                {entryReceipt ? (
                  <div className="space-y-4 py-2">
                    <div className="bg-[#4ade80]/10 border border-[#4ade80]/30 p-5 rounded-xl text-center space-y-2">
                      <div className="inline-block p-2 bg-[#4ade80]/20 rounded-full text-[#4ade80] mb-1">
                        <CheckCircle2 size={28} />
                      </div>
                      <h3 className="font-syne text-sm font-bold text-white">
                        {raffle.entryMethod === 'fcfs' ? 'FCFS Spot Confirmed!' : 'Whitelist Entry Confirmed!'}
                      </h3>
                      <p className="font-dm text-xs text-[#8a8a9a]">
                        Your registration has been successfully recorded on-chain.
                      </p>
                    </div>

                    {/* Receipt Specs Card */}
                    <div className="bg-[#141414] border border-white/[0.08] p-4 rounded-xl space-y-2.5 font-dm text-xs">
                      <div className="flex items-center justify-between border-b border-white/[0.08] pb-2">
                        <span className="text-[#8a8a9a] font-mono-dm text-[11px]">Ticket ID:</span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono-dm text-xs font-bold text-[#a5b4fc] select-all">
                            {entryReceipt.id}
                          </span>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(entryReceipt.id);
                              setCopiedReceipt(true);
                              setTimeout(() => setCopiedReceipt(false), 2000);
                            }}
                            className="p-1 rounded bg-white/10 hover:bg-white/20 text-white transition-colors"
                            title="Copy Ticket ID"
                          >
                            {copiedReceipt ? <Check size={12} className="text-[#4ade80]" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <div>
                          <span className="text-[#555566] block font-mono-dm text-[10px] uppercase">Receiving Wallet:</span>
                          <span className="font-mono-dm text-xs text-white select-all break-all">
                            {entryReceipt.walletAddress}
                          </span>
                        </div>
                        {entryReceipt.twitterUsername && (
                          <div>
                            <span className="text-[#555566] block font-mono-dm text-[10px] uppercase">X Handle:</span>
                            <span className="font-mono-dm text-xs text-white">
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
                      <div className="flex justify-between items-center font-mono-dm text-[11px] text-[#8a8a9a]">
                        <span>{completedCount}/{totalTasks} Tasks Completed</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#a5b4fc] rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Error Notification */}
                    {error && (
                      <div className="bg-[#f87171]/10 border border-[#f87171]/30 text-[#f87171] p-3 rounded-lg font-dm text-xs flex items-center gap-2">
                        <ShieldAlert size={16} className="shrink-0" />
                        <div className="flex-1 text-xs">
                          {error}
                        </div>
                      </div>
                    )}

                    {/* CHECKLIST ITEMS */}
                    <div className="space-y-2 pt-1">
                      
                      {/* 1. YOUR X HANDLE */}
                      <div className={`p-3 rounded-lg border transition-colors ${tasks.handleLinked ? 'bg-white/[0.04] border-[#4ade80]/30' : 'bg-[#141414] border-white/[0.08]'}`}>
                        <div className="flex items-center gap-1.5 mb-2 font-dm text-xs font-medium text-white">
                          <AtSign size={14} className="text-[#8a8a9a]" />
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
                            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-md px-2.5 py-1.5 text-xs font-mono-dm text-white placeholder-[#555566] outline-none"
                          />
                          <button
                            type="submit"
                            className={`px-3 py-1.5 rounded-md font-dm text-xs font-medium shrink-0 transition-colors ${
                              tasks.handleLinked 
                                ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30' 
                                : 'bg-white text-black hover:bg-gray-200'
                            }`}
                          >
                            {tasks.handleLinked ? 'Linked' : 'Set'}
                          </button>
                        </form>
                      </div>

                      {/* 2. RECEIVING WALLET ADDRESS */}
                      <div className={`p-3 rounded-lg border transition-colors ${tasks.walletProvided ? 'bg-white/[0.04] border-[#4ade80]/30' : 'bg-[#141414] border-white/[0.08]'}`}>
                        <div className="flex items-center justify-between gap-1.5 mb-2">
                          <div className="flex items-center gap-1.5 font-dm text-xs font-medium text-white">
                            <Wallet size={14} className="text-[#8a8a9a]" />
                            <span>Receiving EVM Wallet Address</span>
                          </div>
                          {address && (
                            <button
                              type="button"
                              onClick={() => {
                                setWalletInput(address);
                                setTasks(prev => ({ ...prev, walletProvided: true }));
                              }}
                              className="font-mono-dm text-[10px] text-[#a5b4fc] hover:underline"
                            >
                              [Use Connected]
                            </button>
                          )}
                        </div>

                        <form onSubmit={handleSaveWallet} className="flex gap-2">
                          <input
                            type="text"
                            placeholder="0x... (Whitelist receiver)"
                            value={walletInput}
                            onChange={(e) => {
                              setWalletInput(e.target.value);
                              setTasks(prev => ({ ...prev, walletProvided: false }));
                            }}
                            className="flex-1 bg-[#0a0a0a] border border-white/10 rounded-md px-2.5 py-1.5 text-xs font-mono-dm text-white placeholder-[#555566] outline-none"
                          />
                          <button
                            type="submit"
                            className={`px-3 py-1.5 rounded-md font-dm text-xs font-medium shrink-0 transition-colors ${
                              tasks.walletProvided 
                                ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30' 
                                : 'bg-white text-black hover:bg-gray-200'
                            }`}
                          >
                            {tasks.walletProvided ? 'Set' : 'Confirm'}
                          </button>
                        </form>
                      </div>

                      {/* 3. FOLLOW PARTNER */}
                      <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${tasks.followPartner ? 'bg-white/[0.04] border-[#4ade80]/30' : 'bg-[#141414] border-white/[0.08]'}`}>
                        <div className="flex items-center gap-2 min-w-0 font-dm text-xs font-medium text-white">
                          <Twitter size={14} className="text-[#38bdf8] shrink-0" />
                          <span className="truncate">Follow @{projectName}</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleFollowPartner}
                          className={`px-3 py-1.5 rounded-md font-dm text-xs font-medium flex items-center gap-1 shrink-0 transition-colors ${
                            tasks.followPartner
                              ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30'
                              : 'bg-white/10 text-white hover:bg-white/20'
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
                      <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${tasks.followDotset ? 'bg-white/[0.04] border-[#4ade80]/30' : 'bg-[#141414] border-white/[0.08]'}`}>
                        <div className="flex items-center gap-2 min-w-0 font-dm text-xs font-medium text-white">
                          <Twitter size={14} className="text-[#38bdf8] shrink-0" />
                          <span className="truncate">Follow @DOTSET</span>
                        </div>

                        <button
                          type="button"
                          onClick={handleFollowDotset}
                          className={`px-3 py-1.5 rounded-md font-dm text-xs font-medium flex items-center gap-1 shrink-0 transition-colors ${
                            tasks.followDotset
                              ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30'
                              : 'bg-white/10 text-white hover:bg-white/20'
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
                        <div className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${tasks.engage ? 'bg-white/[0.04] border-[#4ade80]/30' : 'bg-[#141414] border-white/[0.08]'}`}>
                          <div className="flex items-center gap-2 min-w-0 font-dm text-xs font-medium text-white">
                            <MessageSquare size={14} className="text-[#fb923c] shrink-0" />
                            <span className="truncate">Like & Repost Post</span>
                          </div>

                          <button
                            type="button"
                            onClick={handleEngageTask}
                            className={`px-3 py-1.5 rounded-md font-dm text-xs font-medium flex items-center gap-1 shrink-0 transition-colors ${
                              tasks.engage
                                ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30'
                                : 'bg-white/10 text-white hover:bg-white/20'
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
                            className={`p-3 rounded-lg border flex items-center justify-between gap-2 transition-colors ${isDone ? 'bg-white/[0.04] border-[#4ade80]/30' : 'bg-[#141414] border-white/[0.08]'}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 font-dm text-xs font-medium text-white">
                              {ct.type === 'discord' ? (
                                <MessageSquare size={14} className="text-[#a5b4fc] shrink-0" />
                              ) : ct.type === 'telegram' ? (
                                <Send size={14} className="text-[#38bdf8] shrink-0" />
                              ) : ct.type === 'twitter' ? (
                                <Twitter size={14} className="text-[#38bdf8] shrink-0" />
                              ) : (
                                <Globe size={14} className="text-[#4ade80] shrink-0" />
                              )}
                              <span className="truncate">{ct.title}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                if (ct.url) window.open(ct.url, '_blank');
                                setCustomTasksDone(prev => ({ ...prev, [ct.id]: true }));
                              }}
                              className={`px-3 py-1.5 rounded-md font-dm text-xs font-medium flex items-center gap-1 shrink-0 transition-colors ${
                                isDone
                                  ? 'bg-[#4ade80]/20 text-[#4ade80] border border-[#4ade80]/30'
                                  : 'bg-white/10 text-white hover:bg-white/20'
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
                    <div className="pt-3 border-t border-white/[0.08]">
                      <button
                        type="button"
                        onClick={handleSubmitEntry}
                        disabled={!allTasksCompleted || submitting || !isLive || (raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)}
                        className={`w-full py-3 rounded-lg font-dm text-sm font-semibold flex items-center justify-center gap-2 transition-all ${
                          allTasksCompleted && !submitting && isLive && !(raffle.entryMethod === 'fcfs' && (raffle.totalEntries || 0) >= raffle.supply)
                            ? 'bg-white text-black hover:bg-gray-200 cursor-pointer shadow-lg' 
                            : 'bg-white/10 text-[#8a8a9a] border border-white/10 cursor-not-allowed'
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
