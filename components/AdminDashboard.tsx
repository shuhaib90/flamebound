'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Raffle, RaffleEntry, AdminStats, CustomTask } from '@/lib/types';
import { useWallet } from '@/lib/wallet-context';
import { ChainBadge, ChainLogo } from '@/components/ChainBadge';
import { 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Download, 
  Trophy, 
  Users, 
  Layers, 
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
  AlertCircle,
  Youtube,
  MessageSquare
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
  customNetworkLogoUrl: string;
  walletAddressLabel: string;
  walletAddressPlaceholder: string;
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
  const { address, isConnected } = useWallet();
  const [passcode, setPasscode] = useState('');
  const [sessionAuth, setSessionAuth] = useState(false);
  const [authError, setAuthError] = useState('');

  // Check persisted session
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('dotset_admin_authed');
      if (stored === 'true') {
        setSessionAuth(true);
      }
    }
  }, []);

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
  const chainLogoFileRef = useRef<HTMLInputElement>(null);
  const editLogoFileRef = useRef<HTMLInputElement>(null);
  const editBannerFileRef = useRef<HTMLInputElement>(null);
  const editChainLogoFileRef = useRef<HTMLInputElement>(null);

  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingChainLogo, setUploadingChainLogo] = useState(false);

  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);
  const [drawingRaffleId, setDrawingRaffleId] = useState<string | null>(null);

  // New task builder state for create form
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

  // Task builder state for edit modal
  const [editTaskInput, setEditTaskInput] = useState<{
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
    customNetworkLogoUrl: '',
    walletAddressLabel: 'Receiving EVM Wallet Address',
    walletAddressPlaceholder: '0x... (Whitelist receiver)',
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

  const isAuthenticated = sessionAuth;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'monk9090') {
      setSessionAuth(true);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('dotset_admin_authed', 'true');
      }
      setAuthError('');
    } else {
      setAuthError('Incorrect admin password. Please try again.');
    }
  };

  const handleLock = () => {
    setSessionAuth(false);
    setPasscode('');
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('dotset_admin_authed');
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

  const handleImageUpload = async (file: File, type: 'logo' | 'banner' | 'chain_logo', isEdit = false) => {
    const formData = new FormData();
    formData.append('file', file);

    if (type === 'logo') setUploadingLogo(true);
    else if (type === 'banner') setUploadingBanner(true);
    else setUploadingChainLogo(true);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success && data.url) {
        if (isEdit && editingRaffle) {
          if (type === 'logo') setEditingRaffle({ ...editingRaffle, logoUrl: data.url });
          else if (type === 'banner') setEditingRaffle({ ...editingRaffle, bannerUrl: data.url });
          else setEditingRaffle({ ...editingRaffle, customNetworkLogoUrl: data.url });
        } else {
          if (type === 'logo') setNewRaffle({ ...newRaffle, logoUrl: data.url });
          else if (type === 'banner') setNewRaffle({ ...newRaffle, bannerUrl: data.url });
          else setNewRaffle({ ...newRaffle, customNetworkLogoUrl: data.url });
        }
      } else {
        alert(data.error || 'Failed to upload image');
      }
    } catch (err) {
      alert('Error uploading image');
    } finally {
      if (type === 'logo') setUploadingLogo(false);
      else if (type === 'banner') setUploadingBanner(false);
      else setUploadingChainLogo(false);
    }
  };

  const handleNetworkChange = (network: string, isEdit = false) => {
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

    if (isEdit && editingRaffle) {
      setEditingRaffle({
        ...editingRaffle,
        network,
        walletAddressLabel: editingRaffle.walletAddressLabel || defaultLabel,
        walletAddressPlaceholder: editingRaffle.walletAddressPlaceholder || defaultPlaceholder,
      });
    } else {
      setNewRaffle({
        ...newRaffle,
        network,
        walletAddressLabel: defaultLabel,
        walletAddressPlaceholder: defaultPlaceholder,
      });
    }
  };

  const handleAddCustomTask = (isEdit = false) => {
    if (isEdit) {
      if (!editTaskInput.title.trim() || !editTaskInput.url.trim()) {
        alert('Please enter task title and link URL');
        return;
      }
      if (!editingRaffle) return;
      const newTask: CustomTask = {
        id: `task-${Date.now()}`,
        title: editTaskInput.title.trim(),
        url: editTaskInput.url.trim(),
        actionLabel: editTaskInput.actionLabel.trim() || 'Visit',
        type: editTaskInput.type,
        required: true,
      };
      setEditingRaffle({
        ...editingRaffle,
        customTasks: [...(editingRaffle.customTasks || []), newTask],
      });
      setEditTaskInput({ title: '', url: '', actionLabel: 'Join', type: 'telegram' });
    } else {
      if (!taskInput.title.trim() || !taskInput.url.trim()) {
        alert('Please enter task title and link URL');
        return;
      }
      const newTask: CustomTask = {
        id: `task-${Date.now()}`,
        title: taskInput.title.trim(),
        url: taskInput.url.trim(),
        actionLabel: taskInput.actionLabel.trim() || 'Join',
        type: taskInput.type,
        required: true,
      };
      setNewRaffle({
        ...newRaffle,
        customTasks: [...newRaffle.customTasks, newTask],
      });
      setTaskInput({ title: '', url: '', actionLabel: 'Join', type: 'telegram' });
    }
  };

  const handleRemoveCustomTask = (taskId: string, isEdit = false) => {
    if (isEdit && editingRaffle) {
      setEditingRaffle({
        ...editingRaffle,
        customTasks: (editingRaffle.customTasks || []).filter(t => t.id !== taskId),
      });
    } else {
      setNewRaffle({
        ...newRaffle,
        customTasks: newRaffle.customTasks.filter(t => t.id !== taskId),
      });
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
      <div className="min-h-screen bg-[#F9F9FB] flex items-center justify-center p-4 selection:bg-[#4274d9] selection:text-white">
        <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl p-8 shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-[#293681]/10 border border-[#293681]/20 flex items-center justify-center mx-auto text-[#293681]">
              <Lock size={22} />
            </div>
            <h1 className="font-syne text-2xl font-bold text-gray-900 tracking-tight">
              Admin Controller
            </h1>
            <p className="font-dm text-sm text-gray-500">
              Enter password to manage raffles and export entries.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="space-y-4">
            <div>
              <label className="block font-mono-dm text-xs uppercase tracking-wider text-gray-600 mb-1.5 font-medium">
                Admin Password
              </label>
              <input
                type="password"
                value={passcode}
                onChange={e => setPasscode(e.target.value)}
                placeholder="Enter password..."
                className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] focus:ring-1 focus:ring-[#293681] text-gray-900 placeholder:text-gray-400 rounded-xl p-3.5 text-sm font-mono-dm outline-none transition-all"
                autoFocus
              />
            </div>

            {authError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-dm">
                <AlertCircle size={14} className="shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-[#293681] text-white font-dm font-semibold text-sm py-3.5 rounded-xl hover:bg-[#1f2963] transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <span>Unlock Dashboard</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <Link href="/" className="font-dm text-xs text-gray-500 hover:text-[#293681] transition-colors">
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
    <div className="min-h-screen bg-[#F9F9FB] text-gray-900 selection:bg-[#4274d9] selection:text-white pb-20">
      
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-gray-200 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-dm transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Site</span>
          </Link>
          <div className="h-4 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <img
              src="/images/dotset-logo.png"
              alt="dotset"
              className="h-5 sm:h-6 w-auto opacity-95 object-contain"
            />
            <span className="px-2 py-0.5 rounded-full bg-[#293681]/10 text-[#293681] border border-[#293681]/20 text-[10px] font-mono-dm uppercase font-semibold">
              Admin Controller
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Refresh Data"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleLock}
            className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-mono-dm transition-colors flex items-center gap-1.5"
            title="Lock Dashboard Session"
          >
            <Lock size={13} />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Top Stats Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="text-gray-500 text-xs font-mono-dm uppercase font-medium">
              Total Raffles
            </div>
            <div className="font-grotesk text-2xl sm:text-3xl font-bold text-gray-900 mt-1">
              {stats?.totalRaffles ?? raffles.length}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="text-gray-500 text-xs font-mono-dm uppercase font-medium">
              Active Campaigns
            </div>
            <div className="font-grotesk text-2xl sm:text-3xl font-bold text-emerald-600 mt-1">
              {stats?.activeRaffles ?? raffles.filter(r => r.status === 'live').length}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="text-gray-500 text-xs font-mono-dm uppercase font-medium">
              Total Quest Entries
            </div>
            <div className="font-grotesk text-2xl sm:text-3xl font-bold text-[#293681] mt-1">
              {stats?.totalEntries ?? entries.length}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 sm:p-5 shadow-sm">
            <div className="text-gray-500 text-xs font-mono-dm uppercase font-medium">
              Winners Selected
            </div>
            <div className="font-grotesk text-2xl sm:text-3xl font-bold text-amber-600 mt-1">
              {stats?.totalWinnersSelected ?? raffles.reduce((acc, r) => acc + (r.winners?.length || 0), 0)}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
          <button
            onClick={() => setActiveTab('raffles')}
            className={`px-4 py-2 rounded-lg text-sm font-dm font-semibold transition-all ${
              activeTab === 'raffles'
                ? 'bg-[#293681] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            Manage Raffles ({raffles.length})
          </button>

          <button
            onClick={() => setActiveTab('entries')}
            className={`px-4 py-2 rounded-lg text-sm font-dm font-semibold transition-all ${
              activeTab === 'entries'
                ? 'bg-[#293681] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            All Entrants ({entries.length})
          </button>

          <button
            onClick={() => setActiveTab('create')}
            className={`px-4 py-2 rounded-lg text-sm font-dm font-semibold transition-all flex items-center gap-1.5 ml-auto ${
              activeTab === 'create'
                ? 'bg-[#4274d9] text-white shadow-sm'
                : 'bg-[#293681] text-white hover:bg-[#1f2963]'
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
              <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
                <p className="text-gray-500 text-sm font-dm">No raffles found.</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="mt-4 px-4 py-2 bg-[#293681] text-white text-xs font-semibold rounded-lg hover:bg-[#1f2963] transition-colors"
                >
                  Create First Raffle
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {raffles.map(r => (
                  <div
                    key={r.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-dm uppercase font-bold ${
                          r.status === 'live'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : r.status === 'winners_drawn'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}>
                          ● {r.status}
                        </span>

                        <div className="flex items-center gap-1.5">
                          <ChainBadge
                            network={r.network}
                            customNetwork={r.customNetwork}
                            customNetworkLogoUrl={r.customNetworkLogoUrl}
                            size="sm"
                          />
                          <span className="px-2 py-0.5 rounded-md bg-gray-100 border border-gray-200 text-[10px] font-mono-dm text-gray-700 font-medium uppercase">
                            {r.mintStage || (r.entryMethod === 'fcfs' ? 'FCFS' : 'GTD')}
                          </span>
                        </div>
                      </div>

                      {/* Title & Project */}
                      <h3 className="font-syne text-lg font-bold text-gray-900 tracking-tight leading-snug">
                        {r.title}
                      </h3>
                      <p className="font-dm text-xs text-gray-500 mt-1 line-clamp-2">
                        {r.subtitle || r.description}
                      </p>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2 bg-gray-50 border border-gray-100 rounded-xl p-3 my-4 text-center">
                        <div>
                          <div className="text-[10px] font-mono-dm text-gray-400 uppercase">Supply</div>
                          <div className="text-xs font-bold text-gray-900 mt-0.5">{r.supply} Spots</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono-dm text-gray-400 uppercase">Entries</div>
                          <div className="text-xs font-bold text-[#293681] mt-0.5">{r.totalEntries || 0}</div>
                        </div>
                        <div>
                          <div className="text-[10px] font-mono-dm text-gray-400 uppercase">Winners</div>
                          <div className="text-xs font-bold text-amber-600 mt-0.5">{r.winners?.length || 0}</div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="space-y-2 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        {/* Draw Winners Button */}
                        <button
                          onClick={() => handleDrawWinners(r.id)}
                          disabled={drawingRaffleId === r.id}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-dm font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Trophy size={14} />
                          <span>{drawingRaffleId === r.id ? 'Drawing...' : 'Draw Winners'}</span>
                        </button>

                        {/* Export CSV Button */}
                        <button
                          onClick={() => exportCsv(r, r.winners && r.winners.length > 0 ? 'winners' : 'entries')}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-dm text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center gap-1 border border-gray-200"
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
                          className="flex-1 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-800 font-dm text-xs py-2 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5"
                        >
                          <Edit3 size={13} />
                          <span>Edit Details</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => handleDeleteRaffle(r.id, r.title)}
                          className="p-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-lg transition-colors"
                          title="Delete Raffle"
                        >
                          <Trash2 size={14} />
                        </button>

                        {/* View Link */}
                        <Link
                          href={`/raffle/${r.slug || r.id}`}
                          target="_blank"
                          className="p-2 bg-gray-100 hover:bg-gray-200 border border-gray-200 text-gray-700 rounded-lg transition-colors"
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
            <div className="flex flex-col sm:flex-row items-center gap-3 bg-white border border-gray-200 p-3.5 rounded-xl shadow-sm">
              <div className="relative flex-1 w-full">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search by wallet address (0x...) or X handle (@user)..."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 text-xs font-mono-dm pl-9 pr-3 py-2.5 rounded-lg outline-none"
                />
              </div>

              <select
                value={selectedRaffleFilter}
                onChange={e => setSelectedRaffleFilter(e.target.value)}
                className="w-full sm:w-64 bg-gray-50 border border-gray-200 text-gray-900 text-xs font-dm p-2.5 rounded-lg outline-none"
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
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-dm text-xs">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-mono-dm text-[10px]">
                    <tr>
                      <th className="py-3.5 px-4">Entry ID</th>
                      <th className="py-3.5 px-4">Receiving Wallet</th>
                      <th className="py-3.5 px-4">X Handle</th>
                      <th className="py-3.5 px-4">Campaign</th>
                      <th className="py-3.5 px-4">Submitted At</th>
                      <th className="py-3.5 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredEntries.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-gray-400">
                          No entrants found matching your search.
                        </td>
                      </tr>
                    ) : (
                      filteredEntries.map(e => {
                        const raffle = raffles.find(r => r.id === e.raffleId);
                        return (
                          <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                            <td className="py-3 px-4 font-mono-dm text-gray-400">{e.id}</td>
                            <td className="py-3 px-4 font-mono-dm text-gray-900 font-medium">{e.walletAddress}</td>
                            <td className="py-3 px-4 text-[#293681] font-semibold">{e.twitterUsername || '—'}</td>
                            <td className="py-3 px-4 text-gray-800">{raffle?.title || e.raffleId}</td>
                            <td className="py-3 px-4 text-gray-500 font-mono-dm text-[11px]">
                              {new Date(e.verifiedAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-mono-dm uppercase font-bold border border-emerald-200">
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
          <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm max-w-4xl mx-auto">
            <h2 className="font-syne text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Plus size={20} className="text-[#293681]" />
              <span>Create New Web3 Raffle Campaign</span>
            </h2>

            <form onSubmit={handleCreateRaffle} className="space-y-6">
              
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Campaign Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRaffle.title}
                    onChange={e => setNewRaffle({ ...newRaffle, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Project Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newRaffle.project}
                    onChange={e => setNewRaffle({ ...newRaffle, project: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 rounded-xl p-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Slug & Mint Stage */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    URL Slug (e.g. /r/my-project)
                  </label>
                  <input
                    type="text"
                    value={newRaffle.slug}
                    onChange={e => setNewRaffle({ ...newRaffle, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 rounded-xl p-3 text-sm font-mono-dm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Mint Stage
                  </label>
                  <select
                    value={newRaffle.mintStage}
                    onChange={e => setNewRaffle({ ...newRaffle, mintStage: e.target.value as any })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-3 text-sm outline-none"
                  >
                    <option value="GTD">GTD (Guaranteed)</option>
                    <option value="FCFS">FCFS (First-Come)</option>
                    <option value="WL">WL (Whitelist)</option>
                    <option value="CUSTOM">CUSTOM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Allocation Supply (Spots) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newRaffle.supply}
                    onChange={e => setNewRaffle({ ...newRaffle, supply: parseInt(e.target.value) || 10 })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 rounded-xl p-3 text-sm font-mono-dm outline-none"
                  />
                </div>
              </div>

              {/* Mint Details & Chain Configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Mint Price (e.g. FREE MINT)
                  </label>
                  <input
                    type="text"
                    value={newRaffle.mintPrice}
                    onChange={e => setNewRaffle({ ...newRaffle, mintPrice: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5 flex items-center justify-between">
                    <span>Blockchain Network</span>
                    <ChainLogo network={newRaffle.network} customNetworkLogoUrl={newRaffle.customNetworkLogoUrl} size={15} />
                  </label>
                  <select
                    value={newRaffle.network}
                    onChange={e => handleNetworkChange(e.target.value, false)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-3 text-sm outline-none"
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
                    End Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newRaffle.endDate}
                    onChange={e => setNewRaffle({ ...newRaffle, endDate: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* Custom Chain & Logo Options */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="font-mono-dm text-xs uppercase font-semibold text-gray-700 flex items-center gap-1.5">
                  <Layers size={14} className="text-[#293681]" />
                  <span>Chain & Logo Customization</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono-dm uppercase text-gray-500 font-medium mb-1">
                      Custom Chain Display Name (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Monad Testnet, Sui, Berachain"
                      value={newRaffle.customNetwork}
                      onChange={e => setNewRaffle({ ...newRaffle, customNetwork: e.target.value })}
                      className="w-full bg-white border border-gray-200 focus:border-[#293681] text-gray-900 rounded-lg p-2.5 text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-dm uppercase text-gray-500 font-medium mb-1">
                      Custom Chain Logo (URL or Upload)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://.../chain-logo.png"
                        value={newRaffle.customNetworkLogoUrl}
                        onChange={e => setNewRaffle({ ...newRaffle, customNetworkLogoUrl: e.target.value })}
                        className="flex-1 bg-white border border-gray-200 focus:border-[#293681] text-gray-900 rounded-lg p-2.5 text-xs outline-none"
                      />
                      <input
                        type="file"
                        ref={chainLogoFileRef}
                        className="hidden"
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'chain_logo', false)}
                      />
                      <button
                        type="button"
                        onClick={() => chainLogoFileRef.current?.click()}
                        className="px-3 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg text-xs font-medium"
                      >
                        {uploadingChainLogo ? '...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Editable Wallet Address Dropbox / Input Settings */}
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                <div className="font-mono-dm text-xs uppercase font-semibold text-gray-700 flex items-center gap-1.5">
                  <Wallet size={14} className="text-[#293681]" />
                  <span>Wallet Input Text Configuration</span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono-dm uppercase text-gray-500 font-medium mb-1">
                      Wallet Input Title / Label (User-Facing)
                    </label>
                    <input
                      type="text"
                      value={newRaffle.walletAddressLabel}
                      onChange={e => setNewRaffle({ ...newRaffle, walletAddressLabel: e.target.value })}
                      placeholder="Receiving EVM Wallet Address"
                      className="w-full bg-white border border-gray-200 focus:border-[#293681] text-gray-900 rounded-lg p-2.5 text-xs font-dm outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono-dm uppercase text-gray-500 font-medium mb-1">
                      Wallet Input Placeholder Text
                    </label>
                    <input
                      type="text"
                      value={newRaffle.walletAddressPlaceholder}
                      onChange={e => setNewRaffle({ ...newRaffle, walletAddressPlaceholder: e.target.value })}
                      placeholder="0x... (Whitelist receiver)"
                      className="w-full bg-white border border-gray-200 focus:border-[#293681] text-gray-900 rounded-lg p-2.5 text-xs font-mono-dm outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div>
                <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                  Subtitle
                </label>
                <input
                  type="text"
                  value={newRaffle.subtitle}
                  onChange={e => setNewRaffle({ ...newRaffle, subtitle: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-3 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                  Full Description
                </label>
                <textarea
                  rows={3}
                  value={newRaffle.description}
                  onChange={e => setNewRaffle({ ...newRaffle, description: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-3 text-sm outline-none"
                />
              </div>

              {/* Standard Social URLs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    𝕏 Follow URL
                  </label>
                  <input
                    type="url"
                    value={newRaffle.followUrl}
                    onChange={e => setNewRaffle({ ...newRaffle, followUrl: e.target.value })}
                    placeholder="https://x.com/username"
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl p-3 text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    𝕏 Like & RT Tweet URL
                  </label>
                  <input
                    type="url"
                    value={newRaffle.engageUrl}
                    onChange={e => setNewRaffle({ ...newRaffle, engageUrl: e.target.value })}
                    placeholder="https://x.com/username/status/..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder:text-gray-400 rounded-xl p-3 text-sm outline-none"
                  />
                </div>
              </div>

              {/* CUSTOM SOCIAL TASKS BUILDER */}
              <div className="p-5 bg-gray-50 border border-gray-200 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="font-syne text-sm font-bold text-gray-900 flex items-center gap-2">
                    <Globe size={16} className="text-[#293681]" />
                    <span>Custom Social Tasks ({newRaffle.customTasks.length})</span>
                  </div>
                  <span className="text-[11px] font-dm text-gray-500">
                    Add custom Telegram, Discord, Twitter, YouTube or Website tasks
                  </span>
                </div>

                {/* List of active custom tasks */}
                {newRaffle.customTasks.length > 0 && (
                  <div className="space-y-2">
                    {newRaffle.customTasks.map((t, idx) => (
                      <div key={t.id || idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          {t.type === 'twitter' ? <Twitter size={14} className="text-[#38bdf8]" /> :
                           t.type === 'telegram' ? <Send size={14} className="text-[#229ED9]" /> :
                           t.type === 'discord' ? <MessageSquare size={14} className="text-[#5865F2]" /> :
                           t.type === 'youtube' ? <Youtube size={14} className="text-[#FF0000]" /> :
                           <Globe size={14} className="text-[#293681]" />}
                          <span className="font-semibold text-gray-900 truncate">{t.title}</span>
                          <span className="text-gray-400 font-mono-dm text-[10px] truncate max-w-[200px]">({t.url})</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-gray-100 font-mono-dm text-[10px] text-gray-600 font-medium">
                            {t.actionLabel || 'Visit'}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomTask(t.id, false)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Remove Task"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Inline Task Adder */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-gray-200">
                  <div>
                    <label className="block text-[10px] font-mono-dm uppercase text-gray-500 mb-1">Platform</label>
                    <select
                      value={taskInput.type}
                      onChange={e => setTaskInput({ ...taskInput, type: e.target.value as any })}
                      className="w-full bg-white border border-gray-200 text-gray-900 p-2 rounded-lg text-xs outline-none"
                    >
                      <option value="telegram">Telegram</option>
                      <option value="discord">Discord</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="youtube">YouTube</option>
                      <option value="website">Website / Link</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono-dm uppercase text-gray-500 mb-1">Task Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Join Official Telegram"
                      value={taskInput.title}
                      onChange={e => setTaskInput({ ...taskInput, title: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-gray-900 p-2 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono-dm uppercase text-gray-500 mb-1">Destination URL</label>
                    <input
                      type="url"
                      placeholder="https://t.me/..."
                      value={taskInput.url}
                      onChange={e => setTaskInput({ ...taskInput, url: e.target.value })}
                      className="w-full bg-white border border-gray-200 text-gray-900 p-2 rounded-lg text-xs outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono-dm uppercase text-gray-500 mb-1">Action Button</label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Join"
                        value={taskInput.actionLabel}
                        onChange={e => setTaskInput({ ...taskInput, actionLabel: e.target.value })}
                        className="flex-1 bg-white border border-gray-200 text-gray-900 p-2 rounded-lg text-xs outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddCustomTask(false)}
                        className="px-3 bg-[#293681] text-white rounded-lg text-xs font-semibold hover:bg-[#1f2963]"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Media Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Logo Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRaffle.logoUrl}
                      onChange={e => setNewRaffle({ ...newRaffle, logoUrl: e.target.value })}
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-3 text-sm outline-none"
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
                  <label className="block text-xs font-mono-dm uppercase text-gray-600 font-medium mb-1.5">
                    Banner Artwork URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRaffle.bannerUrl}
                      onChange={e => setNewRaffle({ ...newRaffle, bannerUrl: e.target.value })}
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-3 text-sm outline-none"
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

              {/* Submit Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#293681] text-white font-dm font-bold text-sm py-4 rounded-xl hover:bg-[#1f2963] transition-colors shadow-md flex items-center justify-center gap-2"
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
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-3xl w-full my-8 shadow-2xl space-y-5 text-gray-900 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="font-syne text-lg font-bold text-gray-900">
                  Edit Raffle: {editingRaffle.title}
                </h3>
                <button
                  onClick={() => setEditingRaffle(null)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleUpdateRaffle} className="space-y-4 font-dm text-xs">
                <div>
                  <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editingRaffle.title}
                    onChange={e => setEditingRaffle({ ...editingRaffle, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Supply (Spots)
                    </label>
                    <input
                      type="number"
                      value={editingRaffle.supply}
                      onChange={e => setEditingRaffle({ ...editingRaffle, supply: parseInt(e.target.value) || 10 })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm font-mono-dm focus:border-[#293681]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Status
                    </label>
                    <select
                      value={editingRaffle.status}
                      onChange={e => setEditingRaffle({ ...editingRaffle, status: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    >
                      <option value="live">Live (Active)</option>
                      <option value="ending_soon">Ending Soon</option>
                      <option value="closed">Closed</option>
                      <option value="winners_drawn">Winners Drawn</option>
                    </select>
                  </div>
                </div>

                {/* Network & Chain Customization in Edit Modal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1 flex items-center justify-between">
                      <span>Blockchain Network</span>
                      <ChainLogo network={editingRaffle.network} customNetworkLogoUrl={editingRaffle.customNetworkLogoUrl} size={14} />
                    </label>
                    <select
                      value={editingRaffle.network}
                      onChange={e => handleNetworkChange(e.target.value, true)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
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
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Custom Chain Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingRaffle.customNetwork || ''}
                      onChange={e => setEditingRaffle({ ...editingRaffle, customNetwork: e.target.value })}
                      placeholder="e.g. Monad Testnet"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>
                </div>

                {/* Custom Chain Logo in Edit Modal */}
                <div>
                  <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                    Custom Chain Logo (URL or Upload)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingRaffle.customNetworkLogoUrl || ''}
                      onChange={e => setEditingRaffle({ ...editingRaffle, customNetworkLogoUrl: e.target.value })}
                      placeholder="https://.../chain-logo.png"
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs"
                    />
                    <input
                      type="file"
                      ref={editChainLogoFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'chain_logo', true)}
                    />
                    <button
                      type="button"
                      onClick={() => editChainLogoFileRef.current?.click()}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium border border-gray-200"
                    >
                      {uploadingChainLogo ? '...' : 'Upload Logo'}
                    </button>
                  </div>
                </div>

                {/* Editable Wallet Input Text in Edit Modal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-500 font-medium mb-1 text-[10px]">
                      Wallet Input Label Text
                    </label>
                    <input
                      type="text"
                      value={editingRaffle.walletAddressLabel || ''}
                      onChange={e => setEditingRaffle({ ...editingRaffle, walletAddressLabel: e.target.value })}
                      placeholder="Receiving EVM Wallet Address"
                      className="w-full bg-white border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-500 font-medium mb-1 text-[10px]">
                      Wallet Input Placeholder
                    </label>
                    <input
                      type="text"
                      value={editingRaffle.walletAddressPlaceholder || ''}
                      onChange={e => setEditingRaffle({ ...editingRaffle, walletAddressPlaceholder: e.target.value })}
                      placeholder="0x... (Whitelist receiver)"
                      className="w-full bg-white border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs font-mono-dm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                    End Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={new Date(editingRaffle.endDate).toISOString().slice(0, 16)}
                    onChange={e => setEditingRaffle({ ...editingRaffle, endDate: new Date(e.target.value).toISOString() })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm font-mono-dm focus:border-[#293681]"
                  />
                </div>

                <div>
                  <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                    𝕏 Follow URL
                  </label>
                  <input
                    type="url"
                    value={editingRaffle.followUrl || ''}
                    onChange={e => setEditingRaffle({ ...editingRaffle, followUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                  />
                </div>

                <div>
                  <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                    𝕏 Like & RT URL
                  </label>
                  <input
                    type="url"
                    value={editingRaffle.engageUrl || ''}
                    onChange={e => setEditingRaffle({ ...editingRaffle, engageUrl: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                  />
                </div>

                {/* Custom Tasks in Edit Modal */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-dm text-xs font-bold text-gray-800 uppercase">
                      Custom Social Tasks ({editingRaffle.customTasks?.length || 0})
                    </span>
                  </div>

                  {editingRaffle.customTasks && editingRaffle.customTasks.length > 0 && (
                    <div className="space-y-1.5">
                      {editingRaffle.customTasks.map((t, idx) => (
                        <div key={t.id || idx} className="flex items-center justify-between p-2.5 bg-white border border-gray-200 rounded-lg text-xs">
                          <div className="flex items-center gap-2 min-w-0">
                            {t.type === 'twitter' ? <Twitter size={13} className="text-[#38bdf8]" /> :
                             t.type === 'telegram' ? <Send size={13} className="text-[#229ED9]" /> :
                             t.type === 'discord' ? <MessageSquare size={13} className="text-[#5865F2]" /> :
                             t.type === 'youtube' ? <Youtube size={13} className="text-[#FF0000]" /> :
                             <Globe size={13} className="text-[#293681]" />}
                            <span className="font-semibold text-gray-900 truncate">{t.title}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomTask(t.id, true)}
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
                      value={editTaskInput.type}
                      onChange={e => setEditTaskInput({ ...editTaskInput, type: e.target.value as any })}
                      className="bg-white border border-gray-200 p-2 rounded-lg text-xs"
                    >
                      <option value="telegram">Telegram</option>
                      <option value="discord">Discord</option>
                      <option value="twitter">Twitter / X</option>
                      <option value="youtube">YouTube</option>
                      <option value="website">Website</option>
                      <option value="custom">Custom</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Task Title"
                      value={editTaskInput.title}
                      onChange={e => setEditTaskInput({ ...editTaskInput, title: e.target.value })}
                      className="bg-white border border-gray-200 p-2 rounded-lg text-xs"
                    />

                    <input
                      type="url"
                      placeholder="Destination URL"
                      value={editTaskInput.url}
                      onChange={e => setEditTaskInput({ ...editTaskInput, url: e.target.value })}
                      className="bg-white border border-gray-200 p-2 rounded-lg text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => handleAddCustomTask(true)}
                      className="px-3 py-2 bg-[#293681] text-white rounded-lg text-xs font-semibold hover:bg-[#1f2963]"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-3">
                  <button
                    type="submit"
                    className="flex-1 bg-[#293681] text-white font-bold py-3 rounded-xl hover:bg-[#1f2963] transition-colors text-sm shadow-sm"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingRaffle(null)}
                    className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-medium border border-gray-200"
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
