'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChainBadge, ChainLogo } from '@/components/ChainBadge';
import { CustomTask } from '@/lib/types';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  Send, 
  Twitter, 
  MessageSquare, 
  Globe, 
  Youtube, 
  Upload, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  ExternalLink,
  Layers,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';

export default function CollabRequestPage() {
  const [submitting, setSubmitting] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingChainLogo, setUploadingChainLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const chainLogoFileRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    project: '',
    title: '',
    slug: '',
    supply: 50,
    mintStage: 'GTD' as 'GTD' | 'FCFS' | 'WL',
    network: 'ETHEREUM',
    customNetwork: '',
    customNetworkLogoUrl: '',
    walletAddressLabel: 'Receiving EVM Wallet Address',
    walletAddressPlaceholder: '0x... (Whitelist receiver)',
    subtitle: '',
    description: '',
    nftTotalSupply: '1,000 NFTs',
    mintPrice: 'FREE MINT',
    mintDate: 'TBA',
    maxMintPerWallet: '1 PER WL',
    logoUrl: '',
    bannerUrl: '',
    followUrl: '',
    engageUrl: '',
    twitterUrl: '',
    discordUrl: '',
    mintUrl: '',
    notes: '',
    requesterTwitter: '',
    requesterTelegram: '',
    requesterEmail: '',
    requesterDiscord: '',
  });

  const [customTasks, setCustomTasks] = useState<CustomTask[]>([]);
  const [taskInput, setTaskInput] = useState<{
    title: string;
    url: string;
    actionLabel: string;
    type: 'twitter' | 'telegram' | 'discord' | 'youtube' | 'website' | 'custom';
  }>({
    title: '',
    url: '',
    actionLabel: 'Join',
    type: 'telegram',
  });

  // Submitted Success Receipt State
  const [submittedReceipt, setSubmittedReceipt] = useState<{
    id: string;
    project: string;
    title: string;
    requesterTwitter: string;
    requesterTelegram: string;
    createdAt: string;
  } | null>(null);

  const [copiedTicket, setCopiedTicket] = useState(false);

  // Handle Network Change with smart presets
  const handleNetworkChange = (network: string) => {
    let defaultLabel = 'Receiving EVM Wallet Address';
    let defaultPlaceholder = '0x... (Whitelist receiver)';
    if (network === 'SOLANA') {
      defaultLabel = 'Receiving Solana Wallet Address';
      defaultPlaceholder = 'Enter Solana Address (e.g. 7xKX...)';
    } else if (network === 'POLYGON') {
      defaultLabel = 'Receiving Polygon (EVM) Wallet Address';
      defaultPlaceholder = '0x... (Polygon Address)';
    } else if (network === 'APECHAIN') {
      defaultLabel = 'Receiving ApeChain Wallet Address';
      defaultPlaceholder = '0x... (ApeChain Address)';
    } else if (network === 'BASE') {
      defaultLabel = 'Receiving Base (EVM) Wallet Address';
      defaultPlaceholder = '0x... (Base Address)';
    } else if (network === 'ARBITRUM') {
      defaultLabel = 'Receiving Arbitrum Wallet Address';
      defaultPlaceholder = '0x... (Arbitrum Address)';
    } else if (network === 'ROBINHOOD') {
      defaultLabel = 'Receiving Robinhood Chain Address';
      defaultPlaceholder = '0x... (Robinhood Address)';
    }

    setFormData(prev => ({
      ...prev,
      network,
      walletAddressLabel: defaultLabel,
      walletAddressPlaceholder: defaultPlaceholder,
    }));
  };

  // Image Upload
  const handleImageUpload = async (file: File, type: 'logo' | 'banner' | 'chain_logo') => {
    const data = new FormData();
    data.append('file', file);

    if (type === 'logo') setUploadingLogo(true);
    else if (type === 'banner') setUploadingBanner(true);
    else setUploadingChainLogo(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      const json = await res.json();
      if (json.success && json.url) {
        if (type === 'logo') setFormData(prev => ({ ...prev, logoUrl: json.url }));
        else if (type === 'banner') setFormData(prev => ({ ...prev, bannerUrl: json.url }));
        else setFormData(prev => ({ ...prev, customNetworkLogoUrl: json.url }));
      } else {
        alert(json.error || 'Failed to upload image');
      }
    } catch (err) {
      alert('Error uploading image');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else if (type === 'banner') setUploadingBanner(false);
      else setUploadingChainLogo(false);
    }
  };

  // Add Custom Task
  const handleAddCustomTask = () => {
    if (!taskInput.title.trim() || !taskInput.url.trim()) {
      alert('Please enter task title and link URL');
      return;
    }
    const newTask: CustomTask = {
      id: `task-${Date.now()}`,
      title: taskInput.title.trim(),
      url: taskInput.url.trim(),
      actionLabel: taskInput.actionLabel.trim() || 'Visit',
      type: taskInput.type,
      required: true,
    };
    setCustomTasks([...customTasks, newTask]);
    setTaskInput({ title: '', url: '', actionLabel: 'Join', type: 'telegram' });
  };

  const handleRemoveCustomTask = (taskId: string) => {
    setCustomTasks(customTasks.filter(t => t.id !== taskId));
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.project.trim()) {
      setError('Please provide your Project / Partner Name.');
      return;
    }
    if (!formData.title.trim()) {
      setError('Please provide a Campaign / Raffle Title.');
      return;
    }
    if (!formData.requesterTwitter.trim()) {
      setError('Please provide your X (Twitter) contact handle.');
      return;
    }
    if (!formData.requesterTelegram.trim()) {
      setError('Please provide your Telegram contact handle.');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/collab-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          customTasks,
        }),
      });

      const data = await res.json();

      if (data.success && data.collabRequest) {
        setSubmittedReceipt({
          id: data.collabRequest.id,
          project: data.collabRequest.project,
          title: data.collabRequest.title,
          requesterTwitter: data.collabRequest.requesterTwitter,
          requesterTelegram: data.collabRequest.requesterTelegram,
          createdAt: data.collabRequest.createdAt,
        });

        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#293681', '#4274d9', '#16a34a', '#38bdf8'],
        });
      } else {
        setError(data.error || data.message || 'Failed to submit collaboration request.');
      }
    } catch (err: any) {
      setError(err.message || 'Network error submitting request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 selection:bg-[#293681] selection:text-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-200">
          <Link
            href="/"
            className="btn-outline-cq text-xs py-2 px-3.5 flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>Back to Raffles</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-200 font-mono-dm text-xs text-[#293681] font-semibold">
              ★ Partner Portal
            </span>
          </div>
        </div>

        {/* HERO TITLE HEADER */}
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-mono-dm text-gray-700">
            <Sparkles size={14} className="text-[#293681]" />
            <span>Launch on DOTSET</span>
          </div>

          <h1 className="font-syne text-2xl sm:text-4xl font-bold text-gray-900 tracking-tight">
            Request Collaboration & Whitelist Raffle
          </h1>
          
          <p className="font-dm text-sm text-gray-600 leading-relaxed">
            Partner with DOTSET to distribute verified guaranteed and FCFS whitelist allocations to crypto communities. Submit your campaign details below for admin approval.
          </p>
        </div>

        {/* SUCCESS CONFIRMATION RECEIPT */}
        {submittedReceipt ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-10 shadow-lg space-y-6 text-center animate-in fade-in zoom-in-95 duration-300">
            <div className="inline-flex p-3.5 bg-emerald-50 text-emerald-600 rounded-full border border-emerald-200 mb-2">
              <CheckCircle2 size={36} />
            </div>

            <div className="space-y-2">
              <h2 className="font-syne text-xl sm:text-2xl font-bold text-gray-900">
                Collaboration Request Submitted!
              </h2>
              <p className="font-dm text-sm text-gray-600 max-w-md mx-auto">
                Thank you for submitting <strong>{submittedReceipt.project}</strong>. Our team will review your raffle specifications and reach out to you via Telegram / X before making it live.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 max-w-lg mx-auto text-left space-y-3 font-dm text-xs">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2.5">
                <span className="text-gray-500 font-mono-dm text-[11px] uppercase">Request Ticket:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono-dm text-xs font-bold text-[#293681]">{submittedReceipt.id}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(submittedReceipt.id);
                      setCopiedTicket(true);
                      setTimeout(() => setCopiedTicket(false), 2000);
                    }}
                    className="p-1 rounded bg-white border border-gray-200 text-gray-600 hover:text-gray-900 transition-colors"
                    title="Copy Ticket ID"
                  >
                    {copiedTicket ? <Check size={12} className="text-[#16a34a]" /> : <Copy size={12} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <span className="text-gray-400 block font-mono-dm text-[10px] uppercase">Project Name:</span>
                  <span className="font-bold text-gray-900 mt-0.5 block">{submittedReceipt.project}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-mono-dm text-[10px] uppercase">Raffle Title:</span>
                  <span className="font-medium text-gray-900 mt-0.5 block">{submittedReceipt.title}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-mono-dm text-[10px] uppercase">Requester 𝕏:</span>
                  <span className="font-medium text-[#293681] mt-0.5 block">@{submittedReceipt.requesterTwitter.replace('@', '')}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-mono-dm text-[10px] uppercase">Requester Telegram:</span>
                  <span className="font-medium text-gray-900 mt-0.5 block">{submittedReceipt.requesterTelegram}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-200 text-gray-500 text-[11px]">
                Status: <span className="text-amber-600 font-semibold uppercase">Pending Admin Review</span>
              </div>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <Link
                href="/"
                className="w-full btn-primary-cq py-3 text-xs justify-center"
              >
                <span>Return to Home</span>
                <ArrowRight size={14} />
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedReceipt(null)}
                className="w-full btn-outline-cq py-3 text-xs justify-center"
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          /* COLLAB FORM */
          <form onSubmit={handleSubmit} className="space-y-8 font-dm">
            
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs font-dm flex items-center gap-2">
                <ShieldCheck size={16} className="text-red-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* SECTION 1: REQUESTER CONTACT INFO */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#293681] text-white flex items-center justify-center font-mono-dm text-xs font-bold">1</span>
                <div>
                  <h2 className="font-syne text-base font-bold text-gray-900">Requester & Partner Contact</h2>
                  <p className="text-gray-500 text-xs mt-0.5">So the DOTSET team can verify and coordinate with you.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Your 𝕏 (Twitter) Handle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Twitter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="@lead_user"
                      value={formData.requesterTwitter}
                      onChange={e => setFormData({ ...formData, requesterTwitter: e.target.value })}
                      required
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs font-mono-dm pl-9 pr-3 py-3 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Your Telegram Contact / Handle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Send size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="@tg_username or t.me/..."
                      value={formData.requesterTelegram}
                      onChange={e => setFormData({ ...formData, requesterTelegram: e.target.value })}
                      required
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs font-mono-dm pl-9 pr-3 py-3 rounded-xl outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Official Project 𝕏 (Twitter) URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/yourproject"
                    value={formData.twitterUrl}
                    onChange={e => setFormData({ ...formData, twitterUrl: e.target.value, followUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs pl-3 pr-3 py-3 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Official Discord / Community URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://discord.gg/..."
                    value={formData.discordUrl}
                    onChange={e => setFormData({ ...formData, discordUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs pl-3 pr-3 py-3 rounded-xl outline-none"
                  />
                </div>
              </div>
            </div>

            {/* SECTION 2: CAMPAIGN & MINT SPECS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#293681] text-white flex items-center justify-center font-mono-dm text-xs font-bold">2</span>
                <div>
                  <h2 className="font-syne text-base font-bold text-gray-900">Campaign & Allocation Specifications</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Define your raffle allocation, mint parameters, and blockchain network.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Project / Brand Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MONAD ROYALS"
                    value={formData.project}
                    onChange={e => setFormData({ ...formData, project: e.target.value })}
                    required
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs p-3 rounded-xl outline-none font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Raffle / Campaign Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. MONAD ROYALS OFFICIAL WL"
                    value={formData.title}
                    onChange={e => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs p-3 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Allocation Spots Offered <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="50"
                    value={formData.supply}
                    onChange={e => setFormData({ ...formData, supply: parseInt(e.target.value) || 10 })}
                    required
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 text-xs p-3 rounded-xl outline-none font-mono-dm font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Mint Stage
                  </label>
                  <select
                    value={formData.mintStage}
                    onChange={e => setFormData({ ...formData, mintStage: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 text-xs p-3 rounded-xl outline-none"
                  >
                    <option value="GTD">Guaranteed (GTD)</option>
                    <option value="FCFS">First-Come First-Served (FCFS)</option>
                    <option value="WL">Standard Whitelist (WL)</option>
                  </select>
                </div>

                {/* Blockchain Network */}
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5 flex items-center justify-between">
                    <span>Blockchain Network</span>
                    <ChainLogo network={formData.network} customNetworkLogoUrl={formData.customNetworkLogoUrl} size={15} />
                  </label>
                  <select
                    value={formData.network}
                    onChange={e => handleNetworkChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 text-xs p-3 rounded-xl outline-none"
                  >
                    <option value="ETHEREUM">Ethereum (ETH)</option>
                    <option value="BASE">Base</option>
                    <option value="POLYGON">Polygon</option>
                    <option value="ROBINHOOD">Robinhood Chain</option>
                    <option value="APECHAIN">ApeChain</option>
                    <option value="ARBITRUM">Arbitrum</option>
                    <option value="SOLANA">Solana</option>
                    <option value="CUSTOM">Custom Chain</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Custom Chain Name (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Monad Testnet / ZEC"
                    value={formData.customNetwork}
                    onChange={e => setFormData({ ...formData, customNetwork: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs p-3 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Wallet Address Label Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                <div>
                  <label className="block text-[10px] font-mono-dm uppercase text-gray-500 mb-1">
                    Receiving Wallet Label Text
                  </label>
                  <input
                    type="text"
                    value={formData.walletAddressLabel}
                    onChange={e => setFormData({ ...formData, walletAddressLabel: e.target.value })}
                    placeholder="Receiving EVM Wallet Address"
                    className="w-full bg-white border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono-dm uppercase text-gray-500 mb-1">
                    Receiving Wallet Placeholder
                  </label>
                  <input
                    type="text"
                    value={formData.walletAddressPlaceholder}
                    onChange={e => setFormData({ ...formData, walletAddressPlaceholder: e.target.value })}
                    placeholder="0x... (Whitelist receiver)"
                    className="w-full bg-white border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs font-mono-dm"
                  />
                </div>
              </div>

              {/* Mint Specs Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-mono-dm uppercase text-gray-500 mb-1">Total NFT Supply</label>
                  <input
                    type="text"
                    placeholder="e.g. 1,000 NFTs"
                    value={formData.nftTotalSupply}
                    onChange={e => setFormData({ ...formData, nftTotalSupply: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs font-mono-dm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-dm uppercase text-gray-500 mb-1">Mint Price</label>
                  <input
                    type="text"
                    placeholder="e.g. FREE MINT or 0.005 ETH"
                    value={formData.mintPrice}
                    onChange={e => setFormData({ ...formData, mintPrice: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs font-mono-dm"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono-dm uppercase text-gray-500 mb-1">Mint Date / TBA</label>
                  <input
                    type="text"
                    placeholder="e.g. Late October 2026"
                    value={formData.mintDate}
                    onChange={e => setFormData({ ...formData, mintDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs font-mono-dm"
                  />
                </div>
              </div>

            </div>

            {/* SECTION 3: VISUAL ARTWORK & MEDIA */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#293681] text-white flex items-center justify-center font-mono-dm text-xs font-bold">3</span>
                <div>
                  <h2 className="font-syne text-base font-bold text-gray-900">Visual Artwork & Project Info</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Upload project logo and banner artwork to display on the raffle card.</p>
                </div>
              </div>

              {/* Logo & Banner Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5 flex items-center justify-between">
                    <span>Project Logo</span>
                    {formData.logoUrl && (
                      <img src={formData.logoUrl} alt="Logo preview" className="w-5 h-5 object-contain rounded border border-gray-200 bg-white" />
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://.../logo.png"
                      value={formData.logoUrl}
                      onChange={e => setFormData({ ...formData, logoUrl: e.target.value })}
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl text-xs outline-none"
                    />
                    <input
                      type="file"
                      ref={logoFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo')}
                    />
                    <button
                      type="button"
                      onClick={() => logoFileRef.current?.click()}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-medium border border-gray-200"
                    >
                      {uploadingLogo ? '...' : 'Upload'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5 flex items-center justify-between">
                    <span>Banner Artwork</span>
                    {formData.bannerUrl && (
                      <img src={formData.bannerUrl} alt="Banner preview" className="w-8 h-5 object-cover rounded border border-gray-200 bg-white" />
                    )}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://.../banner.png"
                      value={formData.bannerUrl}
                      onChange={e => setFormData({ ...formData, bannerUrl: e.target.value })}
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-xl text-xs outline-none"
                    />
                    <input
                      type="file"
                      ref={bannerFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner')}
                    />
                    <button
                      type="button"
                      onClick={() => bannerFileRef.current?.click()}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-medium border border-gray-200"
                    >
                      {uploadingBanner ? '...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  placeholder="e.g. Win an exclusive guaranteed spot for our Genesis mint."
                  value={formData.subtitle}
                  onChange={e => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs p-3 rounded-xl outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                  Project Description / About
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe your project, roadmap, utility, and mint details for entrants..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs p-3 rounded-xl outline-none"
                />
              </div>
            </div>

            {/* SECTION 4: SOCIAL REQUIREMENTS & TASKS */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-gray-200">
                <span className="w-6 h-6 rounded-full bg-[#293681] text-white flex items-center justify-center font-mono-dm text-xs font-bold">4</span>
                <div>
                  <h2 className="font-syne text-base font-bold text-gray-900">Entry Tasks & Social Quests</h2>
                  <p className="text-gray-500 text-xs mt-0.5">Specify Twitter/X follow and engagement URLs, plus custom Telegram or Discord actions.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    𝕏 Follow Target URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/yourproject"
                    value={formData.followUrl}
                    onChange={e => setFormData({ ...formData, followUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 text-xs p-3 rounded-xl outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    𝕏 Like & RT Post URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://x.com/yourproject/status/123456"
                    value={formData.engageUrl}
                    onChange={e => setFormData({ ...formData, engageUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 text-xs p-3 rounded-xl outline-none"
                  />
                </div>
              </div>

              {/* Custom Social Task Builder */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono-dm text-xs font-bold text-gray-800 uppercase">
                    Custom Social Tasks ({customTasks.length})
                  </span>
                </div>

                {customTasks.length > 0 && (
                  <div className="space-y-1.5">
                    {customTasks.map((t, idx) => (
                      <div key={t.id || idx} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          {t.type === 'twitter' ? <Twitter size={13} className="text-[#38bdf8]" /> :
                           t.type === 'telegram' ? <Send size={13} className="text-[#229ED9]" /> :
                           t.type === 'discord' ? <MessageSquare size={13} className="text-[#5865F2]" /> :
                           t.type === 'youtube' ? <Youtube size={13} className="text-[#FF0000]" /> :
                           <Globe size={13} className="text-[#293681]" />}
                          <span className="font-semibold text-gray-900 truncate">{t.title}</span>
                          <span className="text-[10px] text-gray-400 font-mono-dm truncate">({t.url})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomTask(t.id)}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200">
                  <select
                    value={taskInput.type}
                    onChange={e => setTaskInput({ ...taskInput, type: e.target.value as any })}
                    className="bg-white border border-gray-200 p-2 rounded-lg text-xs outline-none"
                  >
                    <option value="telegram">Telegram</option>
                    <option value="discord">Discord</option>
                    <option value="twitter">Twitter / X</option>
                    <option value="youtube">YouTube</option>
                    <option value="website">Website / Link</option>
                    <option value="custom">Custom</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Task Title (e.g. Join TG)"
                    value={taskInput.title}
                    onChange={e => setTaskInput({ ...taskInput, title: e.target.value })}
                    className="bg-white border border-gray-200 p-2 rounded-lg text-xs outline-none"
                  />

                  <input
                    type="url"
                    placeholder="URL (https://t.me/...)"
                    value={taskInput.url}
                    onChange={e => setTaskInput({ ...taskInput, url: e.target.value })}
                    className="bg-white border border-gray-200 p-2 rounded-lg text-xs outline-none"
                  />

                  <button
                    type="button"
                    onClick={handleAddCustomTask}
                    className="px-3 py-2 bg-[#293681] text-white rounded-lg text-xs font-semibold hover:bg-[#1f2963] transition-colors"
                  >
                    + Add Task
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                  Additional Notes / Special Request for DOTSET Team
                </label>
                <textarea
                  rows={2}
                  placeholder="Any special timeline, whitelist format, or co-marketing requirements..."
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 text-xs p-3 rounded-xl outline-none"
                />
              </div>

            </div>

            {/* SUBMIT BUTTON */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-4 bg-[#293681] hover:bg-[#4274d9] text-white font-syne text-sm font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    <span>Submitting Request...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Collaboration Request</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
              <p className="text-center font-dm text-[11px] text-gray-500 mt-2.5">
                Requests are reviewed by the DOTSET curation team before going live on the platform.
              </p>
            </div>

          </form>
        )}

      </main>

      <Footer />
    </div>
  );
}
