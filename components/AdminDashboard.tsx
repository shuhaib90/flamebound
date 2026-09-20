'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Raffle, RaffleEntry, AdminStats, CustomTask } from '@/lib/types';
import { useWallet } from '@/lib/wallet-context';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Download, 
  Trophy, 
  Users, 
  Layers, 
  Flame, 
  ArrowLeft, 
  Copy, 
  RefreshCw, 
  Edit3, 
  Upload, 
  X,
  Wallet,
  Globe,
  Twitter,
  Send,
  ExternalLink,
  Check,
  Clock,
  Search,
  Lock,
  Calendar,
  AlertCircle
} from 'lucide-react';

interface NewRaffleForm {
  title: string;
  project: string;
  slug: string;
  type: string;
  mintStage: 'GTD' | 'FCFS' | 'WL' | 'CUSTOM';
  subtitle: string;
  description: string;
  supply: number;
  nftTotalSupply: string;
  mintPrice: string;
  mintDate: string;
  maxMintPerWallet: string;
  network: string;
  customNetwork: string;
  logoUrl: string;
  bannerUrl: string;
  followUrl: string;
  engageUrl: string;
  twitterUrl: string;
  discordUrl: string;
  mintUrl: string;
  notes: string;
  endDate: string;
  entryMethod: 'raffle' | 'fcfs';
  customTasks: CustomTask[];
}

export function AdminDashboard() {
  const { address, isConnected, isAdmin } = useWallet();
  const [passcode, setPasscode] = useState('');
  const [sessionAuth, setSessionAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [entries, setEntries] = useState<RaffleEntry[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'raffles' | 'entries' | 'create'>('raffles');
  const [selectedRaffleFilter, setSelectedRaffleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const editLogoFileRef = useRef<HTMLInputElement>(null);
  const editBannerFileRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [drawingRaffleId, setDrawingRaffleId] = useState<string | null>(null);

  const [newRaffle, setNewRaffle] = useState<NewRaffleForm>({
    title: 'DOTSET PARTNER WL',
    project: 'DOTSET',
    slug: 'partner-wl',
    type: 'WL RAFFLE',
    mintStage: 'GTD',
    subtitle: 'Exclusive guaranteed whitelist spot allocation for partner community.',
    description: 'Whitelist allocation for verified entrants with direct mint allocation.',
    supply: 50,
    nftTotalSupply: '1,000 NFTs',
    mintPrice: 'FREE MINT',
    mintDate: 'TBA',
    maxMintPerWallet: '1 PER WL',
    network: 'ETHEREUM',
    customNetwork: '',
    logoUrl: '/images/dotset-logo.png',
    bannerUrl: '/images/dotset-logo.png',
    followUrl: 'https://x.com/dotsetxyz',
    engageUrl: 'https://x.com/dotsetxyz',
    twitterUrl: 'https://x.com/dotsetxyz',
    discordUrl: 'https://discord.com',
    mintUrl: '',
    notes: 'Official Partner Whitelist',
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
    entryMethod: 'raffle',
    customTasks: [],
  });

  const isAuthenticated = isAdmin || sessionAuth;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === '1234' || passcode.toLowerCase() === 'admin' || passcode === 'dotset2026') {
      setSessionAuth(true);
      setAuthError('');
    } else {
      setAuthError('Incorrect passcode. Please try again.');
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rRes, eRes, sRes] = await Promise.all([
        fetch('/api/raffles'),
        fetch('/api/admin/entries'),
        fetch('/api/admin/entries?stats=true'),
      ]);

      const [rData, eData, sData] = await Promise.all([
        rRes.json(),
        eRes.json(),
        sRes.json(),
      ]);

      if (rData.success) setRaffles(rData.raffles || []);
      if (eData.success) setEntries(eData.entries || []);
      if (sData.success) setStats(sData.stats || null);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleImageUpload = async (file: File, type: 'logo' | 'banner', isEdit = false) => {
    const formData = new FormData();
    formData.append('file', file);

    if (type === 'logo') setUploadingLogo(true);
    else setUploadingBanner(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        if (isEdit && editingRaffle) {
          if (type === 'logo') setEditingRaffle({ ...editingRaffle, logoUrl: data.url });
          else setEditingRaffle({ ...editingRaffle, bannerUrl: data.url });
        } else {
          if (type === 'logo') setNewRaffle({ ...newRaffle, logoUrl: data.url });
          else setNewRaffle({ ...newRaffle, bannerUrl: data.url });
        }
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      alert('Error uploading image');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else setUploadingBanner(false);
    }
  };

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRaffle.title.trim()) {
      alert('Please enter a raffle title');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRaffle,
          startDate: new Date().toISOString(),
          endDate: new Date(newRaffle.endDate).toISOString(),
          status: 'live',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Raffle created successfully!');
        setActiveTab('raffles');
        fetchData();
      } else {
        alert(data.error || 'Failed to create raffle');
      }
    } catch (err) {
      alert('Error creating raffle');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRaffle) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/raffles/${editingRaffle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRaffle),
      });

      const data = await res.json();
      if (data.success) {
        alert('Raffle updated successfully!');
        setEditingRaffle(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to update raffle');
      }
    } catch (err) {
      alert('Error updating raffle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRaffle = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete raffle "${title}"? This cannot be undone.`)) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/raffles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        alert('Raffle deleted');
        fetchData();
      } else {
        alert(data.error || 'Failed to delete raffle');
      }
    } catch (err) {
      alert('Error deleting raffle');
    } finally {
      setLoading(false);
    }
  };

  const handleDrawWinners = async (raffleId: string) => {
    if (!confirm('Are you ready to draw winners for this raffle?')) return;

    try {
      setDrawingRaffleId(raffleId);
      const res = await fetch(`/api/raffles/${raffleId}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();
      if (data.success) {
        alert(`Successfully drawn ${data.winners?.length || 0} winners!`);
        fetchData();
      } else {
        alert(data.error || 'Failed to draw winners');
      }
    } catch (err) {
      alert('Error drawing winners');
    } finally {
      setDrawingRaffleId(null);
    }
  };

  // CSV Export (ONLY Wallet Address, X Username) named <projectName>_winners.csv
  const exportCsv = (raffle: Raffle, entriesOrWinners: 'winners' | 'entries') => {
    let rows: { wallet: string; twitter: string }[] = [];
    const projectName = (raffle.project || raffle.title || 'dotset').toLowerCase().replace(/[^a-z0-9_-]/g, '_');

    if (entriesOrWinners === 'winners' && raffle.winners && raffle.winners.length > 0) {
      rows = raffle.winners.map(w => ({
        wallet: w.wallet,
        twitter: w.twitterUsername || '',
      }));
    } else {
      const raffleEntries = entries.filter(e => e.raffleId === raffle.id);
      rows = raffleEntries.map(e => ({
        wallet: e.walletAddress,
        twitter: e.twitterUsername || '',
      }));
    }

    if (rows.length === 0) {
      alert('No data available to export.');
      return;
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      'Wallet Address,X Username',
      ...rows.map(r => `"${r.wallet}","${r.twitter}"`),
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${projectName}_${entriesOrWinners}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Passcode Gate screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center p-4 selection:bg-[#4f52c8] selection:text-white">
        <div className="max-w-md w-full bg-[#0f0f0f] border border-white/15 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mx-auto text-white">
              <Lock size={22} />
            </div>
            <h1 className="font-syne text-2xl font-bold text-white tracking-tight">
              Admin Controller
            </h1>
            <p className="font-dm text-sm text-gray-400">
              Enter your admin PIN or connect authorized admin wallet.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block font-mono-dm text-xs uppercase tracking-wider text-gray-300 mb-1.5 font-medium">
                Admin Passcode
              </label>
              <input
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter passcode..."
                className="w-full bg-[#161616] border border-white/20 focus:border-white/50 focus:ring-1 focus:ring-white/50 text-white placeholder:text-gray-600 rounded-xl p-3.5 text-sm font-mono-dm outline-none transition-all"
                autoFocus
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-dm">
                <AlertCircle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-white text-black font-dm font-semibold text-sm py-3.5 rounded-xl hover:bg-gray-200 transition-colors shadow-lg flex items-center justify-center gap-2"
            >
              <span>Unlock Dashboard</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="font-dm text-xs text-gray-400 hover:text-white transition-colors">
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filtered entries
  const filteredEntries = entries.filter(e => {
    if (selectedRaffleFilter !== 'all' && e.raffleId !== selectedRaffleFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchWallet = e.walletAddress.toLowerCase().includes(q);
      const matchX = (e.twitterUsername || '').toLowerCase().includes(q);
      if (!matchWallet && !matchX) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#080808] text-[#f0f0f0] selection:bg-[#4f52c8] selection:text-white pb-20">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#0c0c0c]/90 backdrop-blur-xl border-b border-white/10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-dm transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Site</span>
          </Link>
          <div className="h-4 w-px bg-white/15" />
          <div className="flex items-center gap-2">
            <span className="font-syne text-lg font-bold text-white tracking-tight">
              DOTSET
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-mono-dm uppercase font-semibold">
              Admin Controller
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Top Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#121212] border border-white/10 rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="text-gray-400 text-xs font-mono-dm uppercase font-medium">
              Total Raffles
            </div>
            <div className="font-grotesk text-2xl sm:text-3xl font-bold text-white mt-1">
              {stats?.totalRaffles ?? raffles.length}
            </div>
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="text-gray-400 text-xs font-mono-dm uppercase font-medium">
              Active Campaigns
            </div>
            <div className="font-grotesk text-2xl sm:text-3xl font-bold text-[#4ade80] mt-1">
              {stats?.activeRaffles ?? raffles.filter(r => r.status === 'live').length}
            </div>
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="text-gray-400 text-xs font-mono-dm uppercase font-medium">
              Total Quest Entries
            </div>
            <div className="font-grotesk text-2xl sm:text-3xl font-bold text-[#38bdf8] mt-1">
              {stats?.totalEntries ?? entries.length}
            </div>
          </div>

          <div className="bg-[#121212] border border-white/10 rounded-xl p-4 sm:p-5 shadow-lg">
            <div className="text-gray-400 text-xs font-mono-dm uppercase font-medium">
              Winners Selected
            </div>
            <div className="font-grotesk text-2xl sm:text-3xl font-bold text-[#fb923c] mt-1">
              {stats?.totalWinnersSelected ?? raffles.reduce((acc, r) => acc + (r.winners?.length || 0), 0)}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setActiveTab('raffles')}
            className={`px-4 py-2 rounded-lg text-sm font-dm font-semibold transition-all ${
              activeTab === 'raffles'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Manage Raffles ({raffles.length})
          </button>

          <button
            onClick={() => setActiveTab('entries')}
            className={`px-4 py-2 rounded-lg text-sm font-dm font-semibold transition-all ${
              activeTab === 'entries'
                ? 'bg-white text-black shadow-md'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            All Entrants ({entries.length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-sm font-dm font-semibold transition-all flex items-center gap-1.5 ml-auto ${
              activeTab === 'create'
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
          >
            <Plus size={16} />
            <span>Create New Raffle</span>
          </button>
        </div>

        {/* TAB 1: RAFFLES LIST */}
        {activeTab === 'raffles' && (
          <div className="space-y-4">
            {raffles.length === 0 ? (
              <div className="text-center py-16 bg-[#121212] border border-white/10 rounded-2xl">
                <p className="text-gray-400 text-sm font-dm">No raffles found.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-white text-black text-xs font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Create First Raffle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {raffles.map(r => (
                  <div
                    key={r.id}
                    className="bg-[#121212] border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-dm uppercase font-bold ${
                          r.status === 'live'
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : r.status === 'winners_drawn'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}>
                          ● {r.status}
                        </span>

                        <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono-dm text-gray-300 font-medium uppercase">
                          {r.mintStage || (r.entryMethod === 'fcfs' ? 'FCFS' : 'GTD')}
                        </span>
                      </div>

                      {/* Title & Project */}
                      <h3 className="font-syne text-lg font-bold text-white tracking-tight leading-snug">
                        {r.title}
                      </h3>
                      <p className="font-dm text-xs text-gray-400 mt-1 line-clamp-2">
                        {r.subtitle || r.description}
                      </p>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 bg-[#181818] border border-white/5 rounded-xl p-3 my-4 text-center">
                        <div>
                          <div className="text-[10px] font-mono-dm text-gray-500 uppercase">Supply</div>
                          <div className="text-xs font-bold text-white mt-0.5">{r.supply} Spots</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono-dm text-gray-500 uppercase">Entries</div>
                          <div className="text-xs font-bold text-[#38bdf8] mt-0.5">{r.totalEntries || 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono-dm text-gray-500 uppercase">Winners</div>
                          <div className="text-xs font-bold text-[#fb923c] mt-0.5">{r.winners?.length || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="space-y-2 pt-2 border-t border-white/10">
                      <div className="flex items-center gap-2">
                        {/* Draw Winners Button */}
                        <button
                          onClick={() => handleDrawWinners(r.id)}
                          disabled={drawingRaffleId === r.id}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-dm font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Trophy size={14} />
                          <span>{drawingRaffleId === r.id ? 'Drawing...' : 'Draw Winners'}</span>
                        </button>

                        {/* Export CSV Button */}
                        <button
                          onClick={() => exportCsv(r, r.winners && r.winners.length > 0 ? 'winners' : 'entries')}
                          className="bg-white/10 hover:bg-white/20 text-white font-dm text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center gap-1 border border-white/10"
                          title="Export CSV (Wallets & X handles)"
                        >
                          <Download size={14} />
                          <span>CSV</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Edit Button */}
                        <button
                          onClick={() => setEditingRaffle(r)}
                          className="flex-1 bg-[#1a1a1a] hover:bg-[#252525] border border-white/15 text-white font-dm text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit3 size={13} />
                          <span>Edit Details</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteRaffle(r.id, r.title)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors"
                          title="Delete Raffle"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* View Link */}
                        <Link
                          href={`/raffle/${r.slug || r.id}`}
                          target="_blank"
                          className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 rounded-lg transition-colors"
                          title="View Live Page"
                        >
                          <ExternalLink size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ENTRANTS LIST */}
        {activeTab === 'entries' && (
          <div className="space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-[#121212] border border-white/10 p-3.5 rounded-xl">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by wallet address (0x...) or X handle (@user)..."
                  className="w-full bg-[#181818] border border-white/10 focus:border-white/30 text-white placeholder:text-gray-500 text-xs font-mono-dm pl-9 pr-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              <select
                value={selectedRaffleFilter}
                onChange={e => setSelectedRaffleFilter(e.target.value)}
                className="w-full sm:w-64 bg-[#181818] border border-white/10 text-white text-xs font-dm p-2.5 rounded-lg outline-none"
              >
                <option value="all">All Raffles ({entries.length})</option>
                {raffles.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Table */}
            <div className="bg-[#121212] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-dm text-xs">
                  <thead className="bg-[#181818] border-b border-white/10 text-gray-400 uppercase font-mono-dm text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Entry ID</th>
                      <th className="py-3.5 px-4">Receiving Wallet</th>
                      <th className="py-3.5 px-4">X Handle</th>
                      <th className="py-3.5 px-4">Campaign</th>
                      <th className="py-3.5 px-4">Submitted At</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-gray-300">
                    {filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-500">
                          No entrants found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map(e => {
                        const raffle = raffles.find(r => r.id === e.raffleId);
                        return (
                          <tr key={e.id} className="hover:bg-white/[0.02] transition-colors">
                            <td className="py-3 px-4 font-mono-dm text-gray-400">{e.id}</td>
                            <td className="py-3 px-4 font-mono-dm text-white font-medium">{e.walletAddress}</td>
                            <td className="py-3 px-4 text-[#38bdf8] font-medium">{e.twitterUsername || '—'}</td>
                            <td className="py-3 px-4 text-gray-200">{raffle?.title || e.raffleId}</td>
                            <td className="py-3 px-4 text-gray-400 font-mono-dm text-[11px]">
                              {new Date(e.verifiedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-mono-dm uppercase font-bold border border-green-500/30">
                                Confirmed
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CREATE NEW RAFFLE */}
        {activeTab === 'create' && (
          <div className="bg-[#121212] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto">
            <h2 className="font-syne text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Plus size={20} className="text-indigo-400" />
              <span>Create New Web3 Raffle Campaign</span>
            </h2>

            <form onSubmit={handleCreateRaffle} className="space-y-6">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRaffle.title}
                    onChange={e => setNewRaffle({ ...newRaffle, title: e.target.value })}
                    className="w-full bg-[#181818] border border-white/15 focus:border-indigo-500 text-white placeholder:text-gray-600 rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRaffle.project}
                    onChange={e => setNewRaffle({ ...newRaffle, project: e.target.value })}
                    className="w-full bg-[#181818] border border-white/15 focus:border-indigo-500 text-white placeholder:text-gray-600 rounded-xl p-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Slug & Mint Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    URL Slug (e.g. /r/my-project)
                  </label>
                  <input
                    type="text"
                    value={newRaffle.slug}
                    onChange={e => setNewRaffle({ ...newRaffle, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full bg-[#181818] border border-white/15 focus:border-indigo-500 text-white placeholder:text-gray-600 rounded-xl p-3 text-sm font-mono-dm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    Mint Stage
                  </label>
                  <select
                    value={newRaffle.mintStage}
                    onChange={e => setNewRaffle({ ...newRaffle, mintStage: e.target.value as any })}
                    className="w-full bg-[#181818] border border-white/15 text-white rounded-xl p-3 text-sm outline-none"
                  >
                    <option value="GTD">GTD (Guaranteed)</option>
                    <option value="FCFS">FCFS (First-Come)</option>
                    <option value="WL">WL (Whitelist)</option>
                    <option value="CUSTOM">CUSTOM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    Allocation Supply (Spots) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newRaffle.supply}
                    onChange={e => setNewRaffle({ ...newRaffle, supply: parseInt(e.target.value) || 10 })}
                    className="w-full bg-[#181818] border border-white/15 focus:border-indigo-500 text-white rounded-xl p-3 text-sm font-mono-dm outline-none"
                  />
                </div>
              </div>

              {/* Mint Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    Mint Price (e.g. FREE MINT)
                  </label>
                  <input
                    type="text"
                    value={newRaffle.mintPrice}
                    onChange={e => setNewRaffle({ ...newRaffle, mintPrice: e.target.value })}
                    className="w-full bg-[#181818] border border-white/15 focus:border-indigo-500 text-white rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    Network
                  </label>
                  <select
                    value={newRaffle.network}
                    onChange={e => setNewRaffle({ ...newRaffle, network: e.target.value })}
                    className="w-full bg-[#181818] border border-white/15 text-white rounded-xl p-3 text-sm outline-none"
                  >
                    <option value="ETHEREUM">Ethereum</option>
                    <option value="APECHAIN">ApeChain</option>
                    <option value="BASE">Base</option>
                    <option value="ARBITRUM">Arbitrum</option>
                    <option value="SOLANA">Solana</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newRaffle.endDate}
                    onChange={e => setNewRaffle({ ...newRaffle, endDate: e.target.value })}
                    className="w-full bg-[#181818] border border-white/15 text-white rounded-xl p-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={newRaffle.subtitle}
                  onChange={e => setNewRaffle({ ...newRaffle, subtitle: e.target.value })}
                  className="w-full bg-[#181818] border border-white/15 text-white rounded-xl p-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={newRaffle.description}
                  onChange={e => setNewRaffle({ ...newRaffle, description: e.target.value })}
                  className="w-full bg-[#181818] border border-white/15 text-white rounded-xl p-3 text-sm outline-none"
                />
              </div>

              {/* Social URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    𝕏 Follow URL
                  </label>
                  <input
                    type="url"
                    value={newRaffle.followUrl}
                    onChange={e => setNewRaffle({ ...newRaffle, followUrl: e.target.value })}
                    placeholder="https://x.com/username"
                    className="w-full bg-[#181818] border border-white/15 text-white placeholder:text-gray-600 rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    𝕏 Like & RT Tweet URL
                  </label>
                  <input
                    type="url"
                    value={newRaffle.engageUrl}
                    onChange={e => setNewRaffle({ ...newRaffle, engageUrl: e.target.value })}
                    placeholder="https://x.com/username/status/..."
                    className="w-full bg-[#181818] border border-white/15 text-white placeholder:text-gray-600 rounded-xl p-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Media Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    Logo Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRaffle.logoUrl}
                      onChange={e => setNewRaffle({ ...newRaffle, logoUrl: e.target.value })}
                      className="flex-1 bg-[#181818] border border-white/15 text-white rounded-xl p-3 text-sm outline-none"
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
                      className="px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/10"
                    >
                      {uploadingLogo ? '...' : 'Upload'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-300 font-medium mb-1.5">
                    Banner Artwork URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRaffle.bannerUrl}
                      onChange={e => setNewRaffle({ ...newRaffle, bannerUrl: e.target.value })}
                      className="flex-1 bg-[#181818] border border-white/15 text-white rounded-xl p-3 text-sm outline-none"
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
                      className="px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-medium border border-white/10"
                    >
                      {uploadingBanner ? '...' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-black font-dm font-bold text-sm py-4 rounded-xl hover:bg-gray-200 transition-colors shadow-xl flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  <span>Publish Raffle Campaign</span>
                </button>
              </div>

            </form>
          </div>
        )}

        {/* MODAL: EDIT RAFFLE */}
        {editingRaffle && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#121212] border border-white/15 rounded-2xl p-6 sm:p-8 max-w-2xl w-full my-8 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-syne text-lg font-bold text-white">
                  Edit Raffle: {editingRaffle.title}
                </h3>
                <button
                  onClick={() => setEditingRaffle(null)}
                  className="p-1 text-gray-400 hover:text-white rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateRaffle} className="space-y-4 font-dm text-xs">
                <div>
                  <label className="block font-mono-dm uppercase text-gray-300 font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingRaffle.title}
                    onChange={e => setEditingRaffle({ ...editingRaffle, title: e.target.value })}
                    className="w-full bg-[#181818] border border-white/15 text-white p-3 rounded-lg outline-none text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-300 font-medium mb-1">
                      Supply (Spots)
                    </label>
                    <input
                      type="number"
                      value={editingRaffle.supply}
                      onChange={e => setEditingRaffle({ ...editingRaffle, supply: parseInt(e.target.value) || 10 })}
                      className="w-full bg-[#181818] border border-white/15 text-white p-3 rounded-lg outline-none text-sm font-mono-dm"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-300 font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={editingRaffle.status}
                      onChange={e => setEditingRaffle({ ...editingRaffle, status: e.target.value as any })}
                      className="w-full bg-[#181818] border border-white/15 text-white p-3 rounded-lg outline-none text-sm"
                    >
                      <option value="live">Live (Active)</option>
                      <option value="ending_soon">Ending Soon</option>
                      <option value="closed">Closed</option>
                      <option value="winners_drawn">Winners Drawn</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-mono-dm uppercase text-gray-300 font-medium mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={new Date(editingRaffle.endDate).toISOString().slice(0, 16)}
                    onChange={e => setEditingRaffle({ ...editingRaffle, endDate: new Date(e.target.value).toISOString() })}
                    className="w-full bg-[#181818] border border-white/15 text-white p-3 rounded-lg outline-none text-sm font-mono-dm"
                  />
                </div>

                <div>
                  <label className="block font-mono-dm uppercase text-gray-300 font-medium mb-1">
                    𝕏 Follow URL
                  </label>
                  <input
                    type="url"
                    value={editingRaffle.followUrl || ''}
                    onChange={e => setEditingRaffle({ ...editingRaffle, followUrl: e.target.value })}
                    className="w-full bg-[#181818] border border-white/15 text-white p-3 rounded-lg outline-none text-sm"
                  />
                </div>

                <div>
                  <label className="block font-mono-dm uppercase text-gray-300 font-medium mb-1">
                    𝕏 Like & RT URL
                  </label>
                  <input
                    type="url"
                    value={editingRaffle.engageUrl || ''}
                    onChange={e => setEditingRaffle({ ...editingRaffle, engageUrl: e.target.value })}
                    className="w-full bg-[#181818] border border-white/15 text-white p-3 rounded-lg outline-none text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-white text-black font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRaffle(null)}
                    className="px-5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors text-sm font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
