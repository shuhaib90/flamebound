'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Raffle, RaffleEntry, AdminStats } from '@/lib/types';
import { PixelFlame, PixelCheck, PixelCross } from '@/components/PixelFlame';
import { formatAddress, FLAMEBOUND_PRIMARY_CONTRACT } from '@/lib/blockchain';
import { useWallet } from '@/lib/wallet-context';
import { ADMIN_WALLET, isAdminWallet } from '@/lib/wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
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
  MessageSquare
} from 'lucide-react';

interface NewRaffleForm {
  title: string;
  project: string;
  type: string;
  subtitle: string;
  description: string;
  supply: number;
  nftTotalSupply: string;
  mintPrice: string;
  mintDate: string;
  maxMintPerWallet: string;
  network: string;
  customNetwork: string;
  contractAddress: string;
  requiredTokenCount: number;
  artworkType: 'genesis' | 'cyber_beast' | 'founders_pass' | 'relic' | 'custom';
  logoUrl: string;
  bannerUrl: string;
  followUrl: string;
  engageUrl: string;
  twitterUrl: string;
  discordUrl: string;
  mintUrl: string;
  notes: string;
  endDate: string;
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
  const [holderOnlyFilter, setHolderOnlyFilter] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const logoFileRef = useRef<HTMLInputElement>(null);
  const bannerFileRef = useRef<HTMLInputElement>(null);
  const editLogoFileRef = useRef<HTMLInputElement>(null);
  const editBannerFileRef = useRef<HTMLInputElement>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const [editingRaffle, setEditingRaffle] = useState<Raffle | null>(null);

  const [newRaffle, setNewRaffle] = useState<NewRaffleForm>({
    title: 'FLAMEBOUND PARTNER WL',
    project: 'FLAMEBOUND',
    type: 'WL RAFFLE',
    subtitle: 'Exclusive whitelist raffle for verified Flamebound holders.',
    description: 'Whitelist allocation for verified Flamebound holders with priority access.',
    supply: 50,
    nftTotalSupply: '1,000 NFTs',
    mintPrice: '0.0001 ETH',
    mintDate: '15 SEP 2026 — 18:00 UTC',
    maxMintPerWallet: '1 PER WL',
    network: 'ROBINHOOD NETWORK',
    customNetwork: '',
    contractAddress: FLAMEBOUND_PRIMARY_CONTRACT,
    requiredTokenCount: 1,
    artworkType: 'genesis',
    logoUrl: '/images/flamebound-logo.png',
    bannerUrl: '/images/flamebound-logo.png',
    followUrl: 'https://x.com/FlameboundNft',
    engageUrl: 'https://x.com/FlameboundNft',
    twitterUrl: 'https://x.com/FlameboundNft',
    discordUrl: '',
    mintUrl: 'https://opensea.io/collection/flamebound-259045050',
    notes: 'Phase 1 Guaranteed Whitelist Mint',
    endDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
  });

  const [actionMessage, setActionMessage] = useState('');

  const isAuthenticated = Boolean(isAdmin || sessionAuth);

  useEffect(() => {
    const auth = sessionStorage.getItem('flamebound_admin_auth');
    if (auth === 'true') {
      setSessionAuth(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.toLowerCase() === 'flamebound' || passcode.toLowerCase() === 'admin2026') {
      setSessionAuth(true);
      sessionStorage.setItem('flamebound_admin_auth', 'true');
      setAuthError('');
      fetchData();
    } else {
      setAuthError('Invalid Admin Passphrase.');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [rafflesRes, entriesRes] = await Promise.all([
        fetch('/api/raffles'),
        fetch('/api/admin/entries'),
      ]);
      const rafflesData = await rafflesRes.json();
      const entriesData = await entriesRes.json();
      if (rafflesData.success) setRaffles(rafflesData.raffles);
      if (entriesData.success) {
        setEntries(entriesData.entries);
        setStats(entriesData.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'logo' | 'banner', isEdit = false) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (field === 'logo') setUploadingLogo(true);
    if (field === 'banner') setUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        if (isEdit && editingRaffle) {
          setEditingRaffle({
            ...editingRaffle,
            [field === 'logo' ? 'logoUrl' : 'bannerUrl']: data.url,
            artworkType: 'custom',
          });
        } else {
          setNewRaffle(prev => ({
            ...prev,
            [field === 'logo' ? 'logoUrl' : 'bannerUrl']: data.url,
            artworkType: field === 'banner' ? 'custom' : prev.artworkType,
          }));
        }
        setActionMessage(`✓ ${field.toUpperCase()} uploaded successfully!`);
      }
    } catch (err: any) {
      setActionMessage(`✕ Failed to upload ${field}: ` + err.message);
    } finally {
      if (field === 'logo') setUploadingLogo(false);
      if (field === 'banner') setUploadingBanner(false);
    }
  };

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRaffle,
          endDate: new Date(newRaffle.endDate).toISOString(),
          status: 'live',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('✓ Raffle created successfully with full NFT specs & task URLs!');
        fetchData();
        setActiveTab('raffles');
      }
    } catch (err: any) {
      setActionMessage('✕ Failed to create raffle: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRaffle) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/raffles/${editingRaffle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingRaffle),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage('✓ Raffle details updated!');
        setEditingRaffle(null);
        fetchData();
      }
    } catch (err: any) {
      setActionMessage('✕ Failed to update raffle: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRaffle = async (id: string) => {
    if (!confirm('Are you sure you want to delete this raffle and its entries?')) return;
    try {
      const res = await fetch(`/api/raffles/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionMessage('✓ Raffle deleted.');
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm(`Delete entry ${id}?`)) return;
    try {
      const res = await fetch(`/api/admin/entries?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Entry ${id} removed.`);
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDrawWinners = async (raffleId: string, count: number) => {
    if (!confirm(`Run fair winner draw for ${count} spots?`)) return;
    try {
      const res = await fetch(`/api/raffles/${raffleId}/draw`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ winnerCount: count }),
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(`✓ Successfully drawn ${data.winners.length} winners!`);
        fetchData();
      }
    } catch (err: any) {
      setActionMessage('✕ Failed to draw winners: ' + err.message);
    }
  };

  const handleExportCSV = () => {
    const filtered = entries.filter(e => {
      if (selectedRaffleFilter !== 'all' && e.raffleId !== selectedRaffleFilter) return false;
      if (holderOnlyFilter && !e.isHolder) return false;
      return true;
    });

    const csvContent = [
      ['Entry ID', 'Wallet Address', 'Twitter / X', 'Raffle ID', 'Is Holder', 'Token Balance', 'Verified At', 'Network'].join(','),
      ...filtered.map(e => [
        e.id,
        e.walletAddress,
        `"${e.twitterUsername || ''}"`,
        e.raffleId,
        e.isHolder,
        e.tokenBalance,
        `"${e.verifiedAt}"`,
        e.network
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `flamebound_whitelist_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyWallets = () => {
    const filtered = entries
      .filter(e => {
        if (selectedRaffleFilter !== 'all' && e.raffleId !== selectedRaffleFilter) return false;
        if (holderOnlyFilter && !e.isHolder) return false;
        return true;
      })
      .map(e => e.walletAddress);

    navigator.clipboard.writeText(filtered.join('\n'));
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const displayedEntries = entries.filter(e => {
    if (selectedRaffleFilter !== 'all' && e.raffleId !== selectedRaffleFilter) return false;
    if (holderOnlyFilter && !e.isHolder) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.walletAddress.toLowerCase().includes(q) || e.id.toLowerCase().includes(q) || (e.twitterUsername && e.twitterUsername.toLowerCase().includes(q));
    }
    return true;
  });
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-lime flex items-center justify-center p-4 select-none">
        <div className="bg-white border-4 border-black shadow-pixel-xl p-8 max-w-md w-full">
          <div className="flex items-center gap-3 border-b-4 border-black pb-4 mb-6">
            <div className="p-2 bg-black">
              <PixelFlame size={28} />
            </div>
            <div>
              <h1 className="font-pixel text-base text-black font-bold">FLAMEBOUND ADMIN</h1>
              <span className="font-mono text-xs text-gray-700">AUTHORIZED ACCESS ONLY</span>
            </div>
          </div>

          {/* Connect Admin Wallet Option */}
          <div className="bg-lime/20 border-3 border-black p-4 mb-6 space-y-3">
            <span className="font-pixel text-[9px] uppercase text-black block font-bold">
              ★ 1-CLICK ADMIN WALLET LOGIN:
            </span>
            <p className="font-mono text-xs text-gray-800">
              Connect authorized Admin wallet: <code className="bg-white px-1 border border-black font-bold">{formatAddress(ADMIN_WALLET)}</code>
            </p>
            <div className="pt-1">
              <ConnectButton.Custom>
                {({ openConnectModal, account, mounted }) => {
                  if (!mounted) return null;
                  return (
                    <button
                      type="button"
                      onClick={openConnectModal}
                      className="w-full pixel-btn text-xs py-2.5 shadow-pixel flex items-center justify-center gap-2"
                    >
                      <Wallet size={14} />
                      <span>{account ? `CONNECTED: ${account.displayName}` : '[CONNECT ADMIN WALLET]'}</span>
                    </button>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t-2 border-black"></div>
            <span className="flex-shrink mx-4 font-pixel text-[9px] text-gray-600 uppercase">OR PASSPHRASE</span>
            <div className="flex-grow border-t-2 border-black"></div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 mt-3">
            <div>
              <input
                type="password"
                placeholder="Admin Passphrase"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full bg-white border-3 border-black p-3 font-mono text-sm text-black outline-none font-bold"
              />
            </div>

            {authError && (
              <p className="font-mono text-xs text-red-700 font-bold bg-red-100 p-2 border-2 border-red-700">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full pixel-btn text-xs py-3.5 shadow-pixel"
            >
              [UNLOCK DASHBOARD]
            </button>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-black flex justify-between items-center font-mono text-xs text-gray-700">
            <Link href="/" className="flex items-center gap-1 hover:underline font-bold text-black">
              <ArrowLeft size={14} /> Back to Raffles
            </Link>
            <span className="text-[10px]">FLAMEBOUND CONTROLLER</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lime select-none flex flex-col">
      <header className="bg-black text-lime border-b-4 border-black px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <PixelFlame size={24} />
            <div>
              <span className="font-pixel text-base text-white tracking-wider font-bold">
                FLAMEBOUND ADMIN DASHBOARD
              </span>
              <span className="font-mono text-xs text-lime block">
                Official WL Raffle & On-Chain Verification Controller
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="pixel-btn-lime text-[10px] py-2 px-3 flex items-center gap-1.5"
            >
              <ArrowLeft size={14} />
              <span>LIVE WEBSITE</span>
            </Link>
            <button
              onClick={() => {
                sessionStorage.removeItem('flamebound_admin_auth');
                setSessionAuth(false);
              }}
              className="pixel-btn text-[10px] py-2 px-3 bg-red-600 hover:bg-red-700 text-white"
            >
              LOGOUT
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {actionMessage && (
          <div className="bg-black text-lime border-3 border-black p-3 font-pixel text-xs flex items-center justify-between shadow-pixel-sm">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="text-white hover:underline text-xs">✕</button>
          </div>
        )}

        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border-4 border-black p-4 shadow-pixel-sm">
              <span className="font-pixel text-[9px] uppercase text-gray-700 block font-bold">TOTAL RAFFLES</span>
              <span className="font-pixel text-2xl font-bold text-black mt-1 block">{stats.totalRaffles}</span>
              <span className="font-mono text-[11px] text-gray-600">{stats.activeRaffles} Active</span>
            </div>
            <div className="bg-white border-4 border-black p-4 shadow-pixel-sm">
              <span className="font-pixel text-[9px] uppercase text-gray-700 block font-bold">TOTAL ENTRIES</span>
              <span className="font-pixel text-2xl font-bold text-black mt-1 block">{stats.totalEntries}</span>
              <span className="font-mono text-[11px] text-gray-600">Across all collections</span>
            </div>
            <div className="bg-black text-lime border-4 border-black p-4 shadow-pixel-sm">
              <span className="font-pixel text-[9px] uppercase text-gray-300 block font-bold">VERIFIED HOLDERS</span>
              <span className="font-pixel text-2xl font-bold text-lime mt-1 block">{stats.totalVerifiedHolders}</span>
              <span className="font-mono text-[11px] text-gray-300">100% On-chain Verified</span>
            </div>
            <div className="bg-white border-4 border-black p-4 shadow-pixel-sm">
              <span className="font-pixel text-[9px] uppercase text-gray-700 block font-bold">WINNERS SELECTED</span>
              <span className="font-pixel text-2xl font-bold text-black mt-1 block">{stats.totalWinnersSelected}</span>
              <span className="font-mono text-[11px] text-gray-600">WL Spots Allocated</span>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-b-4 border-black pb-3">
          <button
            onClick={() => { setActiveTab('raffles'); setEditingRaffle(null); }}
            className={`px-4 py-2.5 font-pixel text-xs border-3 border-black uppercase font-bold flex items-center gap-2 ${
              activeTab === 'raffles' && !editingRaffle ? 'bg-black text-lime shadow-pixel-sm' : 'bg-white text-black hover:bg-black/10'
            }`}
          >
            <Layers size={16} />
            <span>MANAGE RAFFLES ({raffles.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('entries'); setEditingRaffle(null); }}
            className={`px-4 py-2.5 font-pixel text-xs border-3 border-black uppercase font-bold flex items-center gap-2 ${
              activeTab === 'entries' ? 'bg-black text-lime shadow-pixel-sm' : 'bg-white text-black hover:bg-black/10'
            }`}
          >
            <Users size={16} />
            <span>VIEW ENTRIES ({entries.length})</span>
          </button>

          <button
            onClick={() => { setActiveTab('create'); setEditingRaffle(null); }}
            className={`px-4 py-2.5 font-pixel text-xs border-3 border-black uppercase font-bold flex items-center gap-2 ${
              activeTab === 'create' ? 'bg-black text-lime shadow-pixel-sm' : 'bg-white text-black hover:bg-black/10'
            }`}
          >
            <Plus size={16} />
            <span>+ CREATE NEW RAFFLE</span>
          </button>

          <button
            onClick={fetchData}
            className="ml-auto px-3 py-2.5 font-pixel text-[10px] bg-white text-black border-3 border-black hover:bg-black/10 flex items-center gap-1.5"
            title="Refresh"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>REFRESH</span>
          </button>
        </div>
        {/* TAB 1: MANAGE RAFFLES */}
        {activeTab === 'raffles' && !editingRaffle && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {raffles.map((raffle) => (
                <div key={raffle.id} className="bg-white border-4 border-black p-5 shadow-pixel-lg flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b-2 border-black pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        {raffle.logoUrl && (
                          <img src={raffle.logoUrl} alt="Logo" className="w-5 h-5 border border-black object-cover bg-white" />
                        )}
                        <span className="font-pixel text-[10px] bg-black text-lime px-2 py-0.5 font-bold">
                          {raffle.status.toUpperCase()}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-black bg-lime px-1.5 py-0.5 border border-black">
                        {raffle.supply} WL SPOTS
                      </span>
                    </div>

                    <h3 className="font-pixel text-sm font-bold text-black uppercase mb-1">
                      {raffle.title}
                    </h3>
                    <p className="font-mono text-xs text-gray-700 mb-3 line-clamp-2">
                      {raffle.subtitle}
                    </p>

                    <div className="bg-lime/20 border-2 border-black p-3 space-y-1.5 font-mono text-[11px] mb-4">
                      <div className="flex justify-between">
                        <strong>Project:</strong> 
                        <span className="font-bold">{raffle.project || 'FLAMEBOUND'}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong>NFT Total Supply:</strong> 
                        <span className="font-bold">{raffle.nftTotalSupply || 'TBA'}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong>Mint Price:</strong> 
                        <span className="font-bold bg-white px-1 border border-black">{raffle.mintPrice || 'FREE'}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong>Mint Date:</strong> 
                        <span className="font-bold">{raffle.mintDate || 'TBA'}</span>
                      </div>
                      <div className="flex justify-between">
                        <strong>Network:</strong> 
                        <span className="font-bold">[{raffle.customNetwork || raffle.network || 'ETHEREUM'}]</span>
                      </div>
                      <div className="truncate">
                        <strong>Contract:</strong> {formatAddress(raffle.contractAddress)}
                      </div>
                      <div className="flex justify-between">
                        <strong>Total Entries:</strong> 
                        <span className="font-bold">{raffle.totalEntries}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t-2 border-black">
                    {raffle.status === 'live' && (
                      <button
                        onClick={() => handleDrawWinners(raffle.id, raffle.supply)}
                        className="w-full pixel-btn text-[10px] py-2.5 bg-black text-lime flex items-center justify-center gap-1.5"
                      >
                        <Trophy size={14} />
                        <span>RUN WINNER DRAW ({raffle.supply} SPOTS)</span>
                      </button>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingRaffle(raffle)}
                        className="flex-1 pixel-btn-white text-[10px] py-2 flex items-center justify-center gap-1"
                      >
                        <Edit3 size={12} />
                        <span>EDIT</span>
                      </button>

                      <button
                        onClick={() => {
                          setSelectedRaffleFilter(raffle.id);
                          setActiveTab('entries');
                        }}
                        className="flex-1 pixel-btn text-[10px] py-2"
                      >
                        ENTRIES ({entries.filter(e => e.raffleId === raffle.id).length})
                      </button>

                      <button
                        onClick={() => handleDeleteRaffle(raffle.id)}
                        className="p-2 border-2 border-black bg-red-100 hover:bg-red-200 text-red-800"
                        title="Delete Raffle"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* EDIT RAFFLE VIEW */}
        {editingRaffle && (
          <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-pixel-lg max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b-3 border-black pb-3 mb-6">
              <div className="flex items-center gap-2">
                <Edit3 size={18} />
                <h2 className="font-pixel text-base sm:text-lg text-black font-bold uppercase">
                  EDIT RAFFLE: {editingRaffle.title}
                </h2>
              </div>
              <button
                onClick={() => setEditingRaffle(null)}
                className="p-1 border border-black bg-black text-lime hover:bg-white hover:text-black"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUpdateRaffle} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    RAFFLE TITLE:
                  </label>
                  <input
                    type="text"
                    required
                    value={editingRaffle.title}
                    onChange={(e) => setEditingRaffle({ ...editingRaffle, title: e.target.value })}
                    className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    PROJECT NAME:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CULT or FLAMEBOUND"
                    value={editingRaffle.project || ''}
                    onChange={(e) => setEditingRaffle({ ...editingRaffle, project: e.target.value })}
                    className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                  SUBTITLE:
                </label>
                <input
                  type="text"
                  value={editingRaffle.subtitle || ''}
                  onChange={(e) => setEditingRaffle({ ...editingRaffle, subtitle: e.target.value })}
                  className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                />
              </div>

              {/* Task Custom URLs */}
              <div className="bg-lime/10 border-2 border-black p-3 space-y-3">
                <div className="font-pixel text-[9px] uppercase font-bold text-black border-b border-black/30 pb-1">
                  ⚡ CUSTOM TASK URLS:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      FOLLOW TASK URL:
                    </label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/FlameboundNFT"
                      value={editingRaffle.followUrl || ''}
                      onChange={(e) => setEditingRaffle({ ...editingRaffle, followUrl: e.target.value })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      COMMENT / ENGAGE TASK URL:
                    </label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/FlameboundNFT/status/..."
                      value={editingRaffle.engageUrl || ''}
                      onChange={(e) => setEditingRaffle({ ...editingRaffle, engageUrl: e.target.value })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-lime/10 border-2 border-black p-3">
                <div>
                  <label className="block font-pixel text-[9px] uppercase text-black mb-1 font-bold">
                    WL SPOTS:
                  </label>
                  <input
                    type="number"
                    required
                    value={editingRaffle.supply}
                    onChange={(e) => setEditingRaffle({ ...editingRaffle, supply: Number(e.target.value) })}
                    className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                  />
                </div>
                <div>
                  <label className="block font-pixel text-[9px] uppercase text-black mb-1 font-bold">
                    TOTAL NFT SUPPLY:
                  </label>
                  <input
                    type="text"
                    value={editingRaffle.nftTotalSupply || ''}
                    onChange={(e) => setEditingRaffle({ ...editingRaffle, nftTotalSupply: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                  />
                </div>
                <div>
                  <label className="block font-pixel text-[9px] uppercase text-black mb-1 font-bold">
                    MINT PRICE:
                  </label>
                  <input
                    type="text"
                    value={editingRaffle.mintPrice || ''}
                    onChange={(e) => setEditingRaffle({ ...editingRaffle, mintPrice: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                  />
                </div>
                <div>
                  <label className="block font-pixel text-[9px] uppercase text-black mb-1 font-bold">
                    MINT DATE:
                  </label>
                  <input
                    type="text"
                    value={editingRaffle.mintDate || ''}
                    onChange={(e) => setEditingRaffle({ ...editingRaffle, mintDate: e.target.value })}
                    className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                  />
                </div>
              </div>

              {/* Logo & Banner Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    PROJECT LOGO / AVATAR:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Logo URL or click Upload"
                      value={editingRaffle.logoUrl || ''}
                      onChange={(e) => setEditingRaffle({ ...editingRaffle, logoUrl: e.target.value })}
                      className="flex-1 bg-lime/20 border-2 border-black p-2 text-xs font-mono"
                    />
                    <input
                      type="file"
                      ref={editLogoFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo', true)}
                    />
                    <button
                      type="button"
                      onClick={() => editLogoFileRef.current?.click()}
                      disabled={uploadingLogo}
                      className="pixel-btn text-[10px] py-2 px-3 flex items-center gap-1"
                    >
                      <Upload size={12} />
                      <span>{uploadingLogo ? '...' : 'UPLOAD'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    BANNER / NFT ARTWORK IMAGE:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Banner URL or click Upload"
                      value={editingRaffle.bannerUrl || ''}
                      onChange={(e) => setEditingRaffle({ ...editingRaffle, bannerUrl: e.target.value, artworkType: 'custom' })}
                      className="flex-1 bg-lime/20 border-2 border-black p-2 text-xs font-mono"
                    />
                    <input
                      type="file"
                      ref={editBannerFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'banner', true)}
                    />
                    <button
                      type="button"
                      onClick={() => editBannerFileRef.current?.click()}
                      disabled={uploadingBanner}
                      className="pixel-btn text-[10px] py-2 px-3 flex items-center gap-1"
                    >
                      <Upload size={12} />
                      <span>{uploadingBanner ? '...' : 'UPLOAD'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Network and Custom Network */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    NETWORK:
                  </label>
                  <select
                    value={editingRaffle.network}
                    onChange={(e) => setEditingRaffle({ ...editingRaffle, network: e.target.value })}
                    className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black font-bold"
                  >
                    <option value="ROBINHOOD NETWORK">ROBINHOOD NETWORK</option>
                    <option value="ETHEREUM">ETHEREUM</option>
                    <option value="BASE">BASE</option>
                    <option value="SEPOLIA">SEPOLIA</option>
                    <option value="POLYGON">POLYGON</option>
                    <option value="ARBITRUM">ARBITRUM</option>
                    <option value="CUSTOM">CUSTOM NETWORK</option>
                  </select>
                </div>

                {editingRaffle.network === 'CUSTOM' ? (
                  <div>
                    <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                      CUSTOM NETWORK NAME:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MONAD or BERACHAIN"
                      value={editingRaffle.customNetwork || ''}
                      onChange={(e) => setEditingRaffle({ ...editingRaffle, customNetwork: e.target.value })}
                      className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                      CONTRACT ADDRESS (HOLDER CHECK):
                    </label>
                    <input
                      type="text"
                      required
                      value={editingRaffle.contractAddress}
                      onChange={(e) => setEditingRaffle({ ...editingRaffle, contractAddress: e.target.value })}
                      className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black font-bold"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                  EXTRA NOTES / ANNOUNCEMENT DETAILS:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Guaranteed Phase 1 mint for whitelist winners"
                  value={editingRaffle.notes || ''}
                  onChange={(e) => setEditingRaffle({ ...editingRaffle, notes: e.target.value })}
                  className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black font-bold"
                />
              </div>

              <div className="pt-4 border-t-3 border-black flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="pixel-btn text-xs py-3.5 px-6 shadow-pixel"
                >
                  {loading ? 'SAVING...' : '[SAVE RAFFLE CHANGES]'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingRaffle(null)}
                  className="pixel-btn-white text-xs py-3.5 px-6"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}
        {/* TAB 2: VIEW ENTRIES & EXPORT WHITELIST */}
        {activeTab === 'entries' && !editingRaffle && (
          <div className="space-y-6">
            <div className="bg-white border-4 border-black p-4 shadow-pixel-sm flex flex-col md:flex-row gap-3 items-center justify-between">
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <select
                  value={selectedRaffleFilter}
                  onChange={(e) => setSelectedRaffleFilter(e.target.value)}
                  className="bg-lime/20 border-2 border-black px-3 py-2 font-pixel text-[10px] uppercase font-bold outline-none"
                >
                  <option value="all">ALL RAFFLES</option>
                  {raffles.map(r => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>

                <label className="flex items-center gap-2 font-mono text-xs cursor-pointer font-bold">
                  <input
                    type="checkbox"
                    checked={holderOnlyFilter}
                    onChange={(e) => setHolderOnlyFilter(e.target.checked)}
                    className="w-4 h-4 accent-black"
                  />
                  <span>HOLDERS ONLY</span>
                </label>

                <input
                  type="text"
                  placeholder="Search 0x..., @handle, FB-ID"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-lime/10 border-2 border-black px-3 py-2 text-xs font-mono outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleCopyWallets}
                  className="pixel-btn text-[10px] py-2 px-3 flex items-center gap-1.5"
                >
                  <Copy size={14} />
                  <span>{copySuccess ? 'COPIED!' : 'COPY WALLETS'}</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="pixel-btn-lime text-[10px] py-2 px-3 flex items-center gap-1.5"
                >
                  <Download size={14} />
                  <span>EXPORT CSV</span>
                </button>
              </div>
            </div>

            <div className="bg-white border-4 border-black shadow-pixel-lg overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-black text-lime font-pixel text-[10px] uppercase border-b-3 border-black">
                  <tr>
                    <th className="p-3">ENTRY ID</th>
                    <th className="p-3">WALLET ADDRESS</th>
                    <th className="p-3">TWITTER / X</th>
                    <th className="p-3">RAFFLE</th>
                    <th className="p-3">HOLDER STATUS</th>
                    <th className="p-3">BALANCE</th>
                    <th className="p-3">VERIFIED AT</th>
                    <th className="p-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-black">
                  {displayedEntries.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center font-pixel text-xs text-gray-700">
                        NO ENTRIES FOUND MATCHING CRITERIA.
                      </td>
                    </tr>
                  ) : (
                    displayedEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-lime/20 transition-colors">
                        <td className="p-3 font-pixel text-[10px] font-bold text-black">
                          {entry.id}
                        </td>
                        <td className="p-3 font-mono font-bold select-all">
                          {entry.walletAddress}
                        </td>
                        <td className="p-3 font-mono font-bold text-black">
                          {entry.twitterUsername ? `@${entry.twitterUsername.replace('@', '')}` : '—'}
                        </td>
                        <td className="p-3 font-mono text-xs">
                          {raffles.find(r => r.id === entry.raffleId)?.title || entry.raffleId}
                        </td>
                        <td className="p-3">
                          {entry.isHolder ? (
                            <span className="font-pixel text-[9px] bg-black text-lime px-2 py-0.5 border border-black font-bold">
                              ✓ VERIFIED HOLDER
                            </span>
                          ) : (
                            <span className="font-pixel text-[9px] bg-red-600 text-white px-2 py-0.5 border border-black font-bold">
                              ✕ NON-HOLDER
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold font-mono">
                          {entry.tokenBalance} NFT
                        </td>
                        <td className="p-3 text-gray-700 text-[11px]">
                          {new Date(entry.verifiedAt).toLocaleString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-1.5 border border-black bg-red-100 hover:bg-red-300 text-red-900"
                            title="Remove Entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: CREATE NEW RAFFLE WITH LOGO & NFT SPECS */}
        {activeTab === 'create' && !editingRaffle && (
          <div className="bg-white border-4 border-black p-6 sm:p-8 shadow-pixel-lg max-w-4xl mx-auto">
            <h2 className="font-pixel text-lg sm:text-xl text-black font-bold uppercase border-b-3 border-black pb-3 mb-6">
              + CREATE NEW WHITELIST RAFFLE
            </h2>

            <form onSubmit={handleCreateRaffle} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    RAFFLE TITLE:
                  </label>
                  <input
                    type="text"
                    required
                    value={newRaffle.title}
                    onChange={(e) => setNewRaffle({ ...newRaffle, title: e.target.value })}
                    className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                  />
                </div>
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    PROJECT NAME:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CULT or FLAMEBOUND"
                    value={newRaffle.project}
                    onChange={(e) => setNewRaffle({ ...newRaffle, project: e.target.value })}
                    className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                  SUBTITLE / SLOGAN:
                </label>
                <input
                  type="text"
                  required
                  value={newRaffle.subtitle}
                  onChange={(e) => setNewRaffle({ ...newRaffle, subtitle: e.target.value })}
                  className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                />
              </div>

              {/* Task Custom URLs */}
              <div className="bg-lime/10 border-3 border-black p-4 space-y-3">
                <div className="font-pixel text-[10px] uppercase font-bold text-black border-b border-black/30 pb-1">
                  ⚡ CUSTOM TASK URLS & SOCIAL LINKS:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      FOLLOW TASK URL:
                    </label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/FlameboundNFT"
                      value={newRaffle.followUrl}
                      onChange={(e) => setNewRaffle({ ...newRaffle, followUrl: e.target.value })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black"
                    />
                  </div>
                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      COMMENT / ENGAGE TASK URL:
                    </label>
                    <input
                      type="text"
                      placeholder="https://twitter.com/FlameboundNFT/status/..."
                      value={newRaffle.engageUrl}
                      onChange={(e) => setNewRaffle({ ...newRaffle, engageUrl: e.target.value })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black"
                    />
                  </div>
                </div>
              </div>

              {/* NFT Collection Specifications */}
              <div className="bg-lime/10 border-3 border-black p-4 space-y-3">
                <div className="font-pixel text-[10px] uppercase font-bold text-black border-b border-black/30 pb-1">
                  ⚡ NFT COLLECTION SPECIFICATIONS:
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      WL SPOTS SUPPLY:
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newRaffle.supply}
                      onChange={(e) => setNewRaffle({ ...newRaffle, supply: Number(e.target.value) })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      TOTAL NFT SUPPLY:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1,000 NFTs"
                      value={newRaffle.nftTotalSupply}
                      onChange={(e) => setNewRaffle({ ...newRaffle, nftTotalSupply: e.target.value })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      MINT PRICE:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 0.0001 ETH"
                      value={newRaffle.mintPrice}
                      onChange={(e) => setNewRaffle({ ...newRaffle, mintPrice: e.target.value })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      MINT DATE:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 15 SEP 2026"
                      value={newRaffle.mintDate}
                      onChange={(e) => setNewRaffle({ ...newRaffle, mintDate: e.target.value })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      MAX MINT PER WL WALLET:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 1 PER WL"
                      value={newRaffle.maxMintPerWallet}
                      onChange={(e) => setNewRaffle({ ...newRaffle, maxMintPerWallet: e.target.value })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-pixel text-[8px] uppercase text-black mb-1 font-bold">
                      EXTRA NOTES / GUARANTEE:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Guaranteed Phase 1 Allocation"
                      value={newRaffle.notes}
                      onChange={(e) => setNewRaffle({ ...newRaffle, notes: e.target.value })}
                      className="w-full bg-white border-2 border-black p-2 font-mono text-xs text-black font-bold"
                    />
                  </div>
                </div>
              </div>

              {/* Logo and Artwork Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    UPLOAD PROJECT LOGO / AVATAR:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste Logo URL or Upload File"
                      value={newRaffle.logoUrl}
                      onChange={(e) => setNewRaffle({ ...newRaffle, logoUrl: e.target.value })}
                      className="flex-1 bg-lime/20 border-2 border-black p-2 text-xs font-mono"
                    />
                    <input
                      type="file"
                      ref={logoFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'logo')}
                    />
                    <button
                      type="button"
                      onClick={() => logoFileRef.current?.click()}
                      disabled={uploadingLogo}
                      className="pixel-btn text-[10px] py-2 px-3 flex items-center gap-1"
                    >
                      <Upload size={12} />
                      <span>{uploadingLogo ? '...' : 'UPLOAD'}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    UPLOAD BANNER / NFT ARTWORK:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Paste Banner URL or Upload File"
                      value={newRaffle.bannerUrl}
                      onChange={(e) => setNewRaffle({ ...newRaffle, bannerUrl: e.target.value, artworkType: 'custom' })}
                      className="flex-1 bg-lime/20 border-2 border-black p-2 text-xs font-mono"
                    />
                    <input
                      type="file"
                      ref={bannerFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'banner')}
                    />
                    <button
                      type="button"
                      onClick={() => bannerFileRef.current?.click()}
                      disabled={uploadingBanner}
                      className="pixel-btn text-[10px] py-2 px-3 flex items-center gap-1"
                    >
                      <Upload size={12} />
                      <span>{uploadingBanner ? '...' : 'UPLOAD'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Network and Custom Network */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    NETWORK:
                  </label>
                  <select
                    value={newRaffle.network}
                    onChange={(e) => setNewRaffle({ ...newRaffle, network: e.target.value })}
                    className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                  >
                    <option value="ROBINHOOD NETWORK">ROBINHOOD NETWORK</option>
                    <option value="ETHEREUM">ETHEREUM</option>
                    <option value="BASE">BASE</option>
                    <option value="SEPOLIA">SEPOLIA</option>
                    <option value="POLYGON">POLYGON</option>
                    <option value="ARBITRUM">ARBITRUM</option>
                    <option value="CUSTOM">CUSTOM NETWORK</option>
                  </select>
                </div>

                {newRaffle.network === 'CUSTOM' ? (
                  <div>
                    <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                      CUSTOM NETWORK NAME:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MONAD or BERACHAIN"
                      value={newRaffle.customNetwork}
                      onChange={(e) => setNewRaffle({ ...newRaffle, customNetwork: e.target.value })}
                      className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                      NFT CONTRACT ADDRESS (FOR HOLDER CHECK):
                    </label>
                    <input
                      type="text"
                      required
                      value={newRaffle.contractAddress}
                      onChange={(e) => setNewRaffle({ ...newRaffle, contractAddress: e.target.value })}
                      className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    ARTWORK FALLBACK:
                  </label>
                  <select
                    value={newRaffle.artworkType}
                    onChange={(e) => setNewRaffle({ ...newRaffle, artworkType: e.target.value as any })}
                    className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                  >
                    <option value="genesis">GENESIS SKULL</option>
                    <option value="cyber_beast">CYBER BEAST</option>
                    <option value="founders_pass">FOUNDERS PASS</option>
                    <option value="custom">CUSTOM UPLOAD</option>
                  </select>
                </div>

                <div>
                  <label className="block font-pixel text-[10px] uppercase text-black mb-1 font-bold">
                    RAFFLE END TIME:
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={newRaffle.endDate}
                    onChange={(e) => setNewRaffle({ ...newRaffle, endDate: e.target.value })}
                    className="w-full bg-lime/20 border-2 border-black p-2.5 font-mono text-xs text-black outline-none font-bold"
                  />
                </div>
              </div>

              <div className="pt-4 border-t-3 border-black flex gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="pixel-btn text-xs py-3.5 px-6 shadow-pixel"
                >
                  {loading ? 'CREATING...' : '[PUBLISH LIVE RAFFLE]'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('raffles')}
                  className="pixel-btn-white text-xs py-3.5 px-6"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
