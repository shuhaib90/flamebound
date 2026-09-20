'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import confetti from 'canvas-confetti';
import { 
  ArrowLeft, 
  Send, 
  CheckCircle, 
  Sparkles, 
  ExternalLink,
  MessageSquare,
  Globe,
  Twitter,
  Flame
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
        colors: ['#000000', '#ffffff', '#888888'],
      });
    }, 600);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white selection:bg-black selection:text-white">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6">
        
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b-3 border-black pb-4">
          <Link
            href="/#active-raffles"
            className="pixel-btn text-[10px] sm:text-xs py-2 px-3 sm:px-4 flex items-center gap-1.5 shadow-pixel"
          >
            <ArrowLeft size={14} />
            <span>[← ALL RAFFLES]</span>
          </Link>

          <a
            href="https://x.com/FlameboundNft"
            target="_blank"
            rel="noopener noreferrer"
            className="font-pixel text-[10px] text-black hover:underline flex items-center gap-1 font-bold"
          >
            <span>DM ON X</span>
            <ExternalLink size={11} />
          </a>
        </div>

        {/* Hero Header */}
        <div className="bg-white border-2 sm:border-3 border-black p-6 sm:p-8 shadow-pixel space-y-3">
          <div className="inline-flex items-center gap-2 bg-black text-white px-3 py-1 font-pixel text-[9px] uppercase font-bold">
            <Sparkles size={12} />
            <span>PARTNERSHIP & ALLOCATIONS</span>
          </div>
          <h1 className="font-pixel text-xl sm:text-3xl text-black font-extrabold uppercase tracking-tight">
            REQUEST COLLABORATION
          </h1>
          <p className="font-mono text-xs sm:text-sm text-gray-700 font-bold leading-relaxed">
            Host your project whitelist spots and community raffles on DOTSET. Fill out the form below to get verified and listed on the live directory.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-white border-2 sm:border-3 border-black p-6 sm:p-8 shadow-pixel">
          {submitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="inline-block p-3 bg-black text-white mb-2 shadow-pixel-xs">
                <CheckCircle size={32} />
              </div>
              <h2 className="font-pixel text-lg text-black font-bold uppercase">
                COLLABORATION REQUEST SUBMITTED!
              </h2>
              <p className="font-mono text-xs sm:text-sm text-gray-700 font-bold max-w-md mx-auto">
                Thank you! Our curation team will review your project details and reach out via your contact handle within 24 hours.
              </p>
              <div className="pt-4">
                <Link
                  href="/"
                  className="pixel-btn text-xs py-3 px-6 shadow-pixel"
                >
                  [RETURN TO DIRECTORY]
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] text-black font-bold uppercase mb-1">
                    PROJECT NAME *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CYBER BEASTS"
                    value={formData.projectName}
                    onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs text-black font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black font-bold uppercase mb-1">
                    PROJECT X (TWITTER) URL *
                  </label>
                  <input
                    type="url"
                    required
                    placeholder="https://x.com/yourproject"
                    value={formData.twitterUrl}
                    onChange={(e) => setFormData({ ...formData, twitterUrl: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs text-black font-bold outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] text-black font-bold uppercase mb-1">
                    CONTACT HANDLE (X / DISCORD / TELEGRAM) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="@founder or Discord Tag"
                    value={formData.contactHandle}
                    onChange={(e) => setFormData({ ...formData, contactHandle: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs text-black font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black font-bold uppercase mb-1">
                    NETWORK *
                  </label>
                  <select
                    value={formData.network}
                    onChange={(e) => setFormData({ ...formData, network: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs text-black font-bold outline-none"
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
                  <label className="block font-pixel text-[10px] text-black font-bold uppercase mb-1">
                    ALLOCATION SPOTS *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="e.g. 10"
                    value={formData.spots}
                    onChange={(e) => setFormData({ ...formData, spots: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs text-black font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black font-bold uppercase mb-1">
                    MINT PRICE
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. FREE or 0.01 ETH"
                    value={formData.mintPrice}
                    onChange={(e) => setFormData({ ...formData, mintPrice: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs text-black font-bold outline-none"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[10px] text-black font-bold uppercase mb-1">
                    STAGE TYPE
                  </label>
                  <select
                    value={formData.mintStage}
                    onChange={(e) => setFormData({ ...formData, mintStage: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs text-black font-bold outline-none"
                  >
                    <option value="GTD">GUARANTEED (GTD)</option>
                    <option value="FCFS">FIRST-COME FIRST-SERVED (FCFS)</option>
                    <option value="WL">WHITELIST LOTTERY (WL)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-pixel text-[10px] text-black font-bold uppercase mb-1">
                  EXTRA NOTES & SOCIAL TASKS
                </label>
                <textarea
                  rows={3}
                  placeholder="Paste specific tweet URLs, Discord invites, or special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white border-2 border-black p-2.5 font-mono text-xs text-black font-bold outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full pixel-btn text-xs py-3.5 shadow-pixel flex items-center justify-center gap-2"
                >
                  <Send size={14} />
                  <span>{submitting ? 'SENDING REQUEST...' : '[SUBMIT COLLABORATION REQUEST]'}</span>
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
