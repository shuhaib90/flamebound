'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle2, 
  Sparkles, 
  ExternalLink,
  MessageSquare
} from 'lucide-react';

export default function RequestCollabPage() {
  const [formData, setFormData] = useState({
    projectName: '',
    twitterUrl: '',
    contactHandle: '',
    spots: '10',
    mintPrice: 'FREE',
    mintDate: '',
    mintStage: 'GTD',
    network: 'ROBINHOOD NETWORK',
    notes: '',
  });

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4f52c8', '#a5b4fc', '#4ade80', '#ffffff'],
      });
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#080808] text-[#f0f0f0] selection:bg-[#4f52c8] selection:text-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between pb-6 border-b border-white/[0.08]">
          <Link
            href="/#active-raffles"
            className="btn-outline-cq text-xs py-2 px-3.5 flex items-center gap-2"
          >
            <ArrowLeft size={14} />
            <span>All Raffles</span>
          </Link>

          <a
            href="https://x.com/FlameboundNft"
            target="_blank"
            rel="noopener noreferrer"
            className="font-dm text-xs text-[#a5b4fc] hover:underline flex items-center gap-1.5"
          >
            <span>Direct DM on X</span>
            <ExternalLink size={12} />
          </a>
        </div>

        {/* Hero Header */}
        <div className="cq-card p-6 sm:p-8 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4f52c8]/20 border border-[#a5b4fc]/30 text-[#a5b4fc] font-mono-dm text-xs">
            <Sparkles size={12} />
            <span>Partnership & Allocations</span>
          </div>
          <h1 className="font-syne text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Request Collaboration
          </h1>
          <p className="font-dm text-xs sm:text-sm text-[#8a8a9a] leading-relaxed">
            Host your project whitelist spots and community raffles on DOTSET. Fill out the form below to get verified and listed on our live directory.
          </p>
        </div>

        {/* Form Container */}
        <div className="cq-card p-6 sm:p-8">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="inline-block p-3 bg-[#4ade80]/10 rounded-full text-[#4ade80] mb-2 border border-[#4ade80]/20">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="font-syne text-xl text-white font-bold">
                Collaboration Request Submitted!
              </h2>
              <p className="font-dm text-sm text-[#8a8a9a] max-w-md mx-auto">
                Thank you! Our curation team will review your project details and reach out via your contact handle within 24 hours.
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="btn-primary-cq text-xs py-2.5 px-6 inline-block"
                >
                  Return to Directory
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-dm text-xs text-[#8a8a9a] font-medium mb-1.5">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Cyber Beasts"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 font-dm text-xs text-white placeholder-[#555566] outline-none focus:border-[#a5b4fc]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-dm text-xs text-[#8a8a9a] font-medium mb-1.5">
                    Project X (Twitter) URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://x.com/yourproject"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 font-dm text-xs text-white placeholder-[#555566] outline-none focus:border-[#a5b4fc]/50 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-dm text-xs text-[#8a8a9a] font-medium mb-1.5">
                    Contact Handle (X / Discord / Telegram) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@founder or Telegram username"
                    value={formData.contactHandle}
                    onChange={(e) => setFormData({ ...formData, contactHandle: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 font-dm text-xs text-white placeholder-[#555566] outline-none focus:border-[#a5b4fc]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-dm text-xs text-[#8a8a9a] font-medium mb-1.5">
                    Network *
                  </label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 font-dm text-xs text-white outline-none focus:border-[#a5b4fc]/50 transition-colors"
                  >
                    <option value="ROBINHOOD NETWORK">ROBINHOOD NETWORK</option>
                    <option value="ETHEREUM">ETHEREUM</option>
                    <option value="BASE">BASE</option>
                    <option value="POLYGON">POLYGON</option>
                    <option value="ARBITRUM">ARBITRUM</option>
                    <option value="ZEC">ZEC</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-dm text-xs text-[#8a8a9a] font-medium mb-1.5">
                    Allocation Spots *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={formData.spots}
                    onChange={(e) => setFormData({ ...formData, spots: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 font-dm text-xs text-white placeholder-[#555566] outline-none focus:border-[#a5b4fc]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-dm text-xs text-[#8a8a9a] font-medium mb-1.5">
                    Mint Price
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Free or 0.01 ETH"
                    value={formData.mintPrice}
                    onChange={(e) => setFormData({ ...formData, mintPrice: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 font-dm text-xs text-white placeholder-[#555566] outline-none focus:border-[#a5b4fc]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block font-dm text-xs text-[#8a8a9a] font-medium mb-1.5">
                    Stage Type
                  </label>
                  <select
                    value={formData.mintStage}
                    onChange={(e) => setFormData({ ...formData, mintStage: e.target.value })}
                    className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 font-dm text-xs text-white outline-none focus:border-[#a5b4fc]/50 transition-colors"
                  >
                    <option value="GTD">Guaranteed (GTD)</option>
                    <option value="FCFS">First-Come First-Served (FCFS)</option>
                    <option value="WL">Whitelist Lottery (WL)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-dm text-xs text-[#8a8a9a] font-medium mb-1.5">
                  Extra Notes & Social Task Links
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste specific tweet URLs, Discord invites, or custom requirements..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-[#111111] border border-white/10 rounded-lg p-2.5 font-dm text-xs text-white placeholder-[#555566] outline-none focus:border-[#a5b4fc]/50 transition-colors"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-primary-cq py-3 flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>{submitting ? 'Sending Request...' : 'Submit Collaboration Request'}</span>
                </button>
              </div>

            </form>
          )}
        </div>

      </main>

      <Footer />
    </div>
  );
}
