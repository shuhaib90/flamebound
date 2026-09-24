'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Raffle, RaffleEntry, AdminStats, CustomTask, CollabRequest, CustomChain } from '@/lib/types';
import { BUILTIN_CHAINS } from '@/lib/db';
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
  MessageSquare,
  CheckCircle2,
  XCircle,
  Inbox,
  Sparkles
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
  const [collabRequests, setCollabRequests] = useState<CollabRequest[]>([]);
  const [availableChains, setAvailableChains] = useState<CustomChain[]>(BUILTIN_CHAINS);
  const [collabFilter, setCollabFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'raffles' | 'entries' | 'create' | 'collabs' | 'telegram'>('raffles');
  const [selectedRaffleFilter, setSelectedRaffleFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Telegram Bot Settings State
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramBotToken, setTelegramBotToken] = useState('8614389362:AAFGEDPeVJzD8_anq3MM5SO00JM3WjRqegU');
  const [telegramAutoNotify, setTelegramAutoNotify] = useState(true);
  const [testingTelegram, setTestingTelegram] = useState(false);
  const [savingTelegram, setSavingTelegram] = useState(false);
  const [telegramStatusMsg, setTelegramStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [broadcastingRaffleId, setBroadcastingRaffleId] = useState<string | null>(null);

  const getSelectedNetworkValue = (network: string, customNetwork?: string) => {
    if (customNetwork && customNetwork.trim()) {
      const found = availableChains.find(
        c => !c.isBuiltIn && c.name.toLowerCase() === customNetwork.trim().toLowerCase()
      );
      if (found) return `SAVED_CUSTOM:${found.id}`;
      return 'CUSTOM';
    }
    if (network === 'CUSTOM') return 'CUSTOM';
    return network || 'ETHEREUM';
  };

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
  const [editingCollab, setEditingCollab] = useState<CollabRequest | null>(null);
  const [drawingRaffleId, setDrawingRaffleId] = useState<string | null>(null);

  // Manual & Bulk Winners Management State
  const [managingWinnersRaffle, setManagingWinnersRaffle] = useState<Raffle | null>(null);
  const [bulkWinnersRawText, setBulkWinnersRawText] = useState('');
  const [parsedWinnersList, setParsedWinnersList] = useState<Array<{ wallet: string; twitter: string; rank: number }>>([]);
  const [notifyTelegramOnWinners, setNotifyTelegramOnWinners] = useState(true);
  const [singleWinnerWallet, setSingleWinnerWallet] = useState('');
  const [singleWinnerTwitter, setSingleWinnerTwitter] = useState('');
  const [savingWinners, setSavingWinners] = useState(false);

  const editCollabLogoFileRef = useRef<HTMLInputElement>(null);
  const editCollabBannerFileRef = useRef<HTMLInputElement>(null);
  const editCollabChainLogoFileRef = useRef<HTMLInputElement>(null);

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

  // Task builder state for edit raffle modal
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

  // Task builder state for edit collab modal
  const [editCollabTaskInput, setEditCollabTaskInput] = useState<{
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
      const [rRes, eRes, sRes, cRes, chRes] = await Promise.all([
        fetch('/api/raffles'),
        fetch('/api/admin/entries'),
        fetch('/api/admin/entries?stats=true'),
        fetch('/api/collab-requests'),
        fetch('/api/chains'),
      ]);

      const [rData, eData, sData, cData, chData] = await Promise.all([
        rRes.json(),
        eRes.json(),
        sRes.json(),
        cRes.json(),
        chRes.json(),
      ]);

      if (rData.success) setRaffles(rData.raffles || []);
      if (eData.success) setEntries(eData.entries || []);
      if (sData.success) setStats(sData.stats || null);
      if (cData.success) setCollabRequests(cData.collabRequests || []);
      if (chData.success && chData.chains) setAvailableChains(chData.chains);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveAndPublishCollab = async (id: string, projectName: string) => {
    if (!confirm(`Are you sure you want to approve and publish "${projectName}" as a LIVE raffle on DOTSET?`)) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/collab-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve_and_publish' }),
      });
      const data = await res.json();
      if (data.success) {
        alert('🎉 Collab request approved and published directly to live raffles!');
        fetchData();
      } else {
        alert(data.error || 'Failed to approve collab request');
      }
    } catch (err: any) {
      alert(`Error: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCollabStatus = async (id: string, status: 'approved' | 'rejected' | 'pending') => {
    try {
      setLoading(true);
      const res = await fetch(`/api/collab-requests/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || 'Failed to update collab request status');
      }
    } catch (err: any) {
      alert(`Error: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollab = async (id: string) => {
    if (!confirm('Are you sure you want to delete this collab request? This action cannot be undone.')) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/collab-requests/${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        fetchData();
      } else {
        alert(data.error || 'Failed to delete collab request');
      }
    } catch (err: any) {
      alert(`Error: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
      fetch('/api/telegram/settings')
        .then(r => r.json())
        .then(d => {
          if (d.success && d.config) {
            setTelegramChatId(d.config.chatId || '');
            if (d.config.botToken) setTelegramBotToken(d.config.botToken);
            setTelegramAutoNotify(d.config.autoNotify !== false);
          }
        })
        .catch(() => {});
    }
  }, [isAuthenticated]);

  const handleSaveTelegramSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingTelegram(true);
    setTelegramStatusMsg(null);
    try {
      const res = await fetch('/api/telegram/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: telegramChatId,
          botToken: telegramBotToken,
          autoNotify: telegramAutoNotify,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTelegramStatusMsg({ type: 'success', text: '✅ Telegram Bot configuration saved successfully!' });
      } else {
        setTelegramStatusMsg({ type: 'error', text: data.error || 'Failed to save settings' });
      }
    } catch (err: any) {
      setTelegramStatusMsg({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setSavingTelegram(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramChatId.trim()) {
      alert('Please enter your Telegram Channel / Group Chat ID (e.g. @dotset_xyz or -100...) first.');
      return;
    }
    setTestingTelegram(true);
    setTelegramStatusMsg(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: telegramChatId.trim(),
          token: telegramBotToken.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTelegramStatusMsg({ 
          type: 'success', 
          text: `🎉 Test message successfully sent to ${telegramChatId}! Check your Telegram channel/group.` 
        });
      } else {
        setTelegramStatusMsg({ 
          type: 'error', 
          text: `❌ Error: ${data.error}. Make sure @DOTSETRAFFLESbot is added to ${telegramChatId} as an Admin with permission to send messages.` 
        });
      }
    } catch (err: any) {
      setTelegramStatusMsg({ type: 'error', text: err.message || 'Network error sending test' });
    } finally {
      setTestingTelegram(false);
    }
  };

  const handleBroadcastToTelegram = async (raffleId: string, raffleTitle: string) => {
    if (!telegramChatId.trim()) {
      alert('Please set your Telegram Target Chat ID / @channel in the "Telegram Bot" tab first.');
      setActiveTab('telegram');
      return;
    }

    if (!confirm(`📢 Broadcast announcement for "${raffleTitle}" to Telegram channel ${telegramChatId}?`)) return;

    setBroadcastingRaffleId(raffleId);
    try {
      const res = await fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raffleId,
          chatId: telegramChatId.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`🚀 "${raffleTitle}" successfully posted to ${telegramChatId} with direct link & banner artwork!`);
      } else {
        alert(`Failed to broadcast: ${data.error}. Please check that @DOTSETRAFFLESbot is an Admin in ${telegramChatId}.`);
      }
    } catch (err: any) {
      alert(`Error broadcasting to Telegram: ${err.message}`);
    } finally {
      setBroadcastingRaffleId(null);
    }
  };

  const handleImageUpload = async (file: File, type: 'logo' | 'banner' | 'chain_logo', target: 'new' | 'edit_raffle' | 'edit_collab' | boolean = 'new') => {
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
        if (target === 'edit_collab' && editingCollab) {
          if (type === 'logo') setEditingCollab({ ...editingCollab, logoUrl: data.url });
          else if (type === 'banner') setEditingCollab({ ...editingCollab, bannerUrl: data.url });
          else setEditingCollab({ ...editingCollab, customNetworkLogoUrl: data.url });
        } else if ((target === 'edit_raffle' || target === true) && editingRaffle) {
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

  const handleNetworkChange = (network: string, target: 'new' | 'edit_raffle' | 'edit_collab' | boolean = 'new') => {
    // 1. Check if selecting a saved custom chain
    if (network.startsWith('SAVED_CUSTOM:')) {
      const chainId = network.replace('SAVED_CUSTOM:', '');
      const found = availableChains.find(
        c => c.id === chainId || c.name.toLowerCase() === chainId.toLowerCase()
      );
      if (found) {
        const defaultLabel = found.walletAddressLabel || `Receiving ${found.name} Wallet Address`;
        const defaultPlaceholder = found.walletAddressPlaceholder || '0x... (Whitelist receiver)';
        if (target === 'edit_collab' && editingCollab) {
          setEditingCollab({
            ...editingCollab,
            network: 'CUSTOM',
            customNetwork: found.name,
            customNetworkLogoUrl: found.logoUrl || '',
            walletAddressLabel: defaultLabel,
            walletAddressPlaceholder: defaultPlaceholder,
          });
        } else if ((target === 'edit_raffle' || target === true) && editingRaffle) {
          setEditingRaffle({
            ...editingRaffle,
            network: 'CUSTOM',
            customNetwork: found.name,
            customNetworkLogoUrl: found.logoUrl || '',
            walletAddressLabel: defaultLabel,
            walletAddressPlaceholder: defaultPlaceholder,
          });
        } else {
          setNewRaffle({
            ...newRaffle,
            network: 'CUSTOM',
            customNetwork: found.name,
            customNetworkLogoUrl: found.logoUrl || '',
            walletAddressLabel: defaultLabel,
            walletAddressPlaceholder: defaultPlaceholder,
          });
        }
        return;
      }
    }

    // 2. Custom Chain (New)
    if (network === 'CUSTOM') {
      if (target === 'edit_collab' && editingCollab) {
        setEditingCollab({
          ...editingCollab,
          network: 'CUSTOM',
        });
      } else if ((target === 'edit_raffle' || target === true) && editingRaffle) {
        setEditingRaffle({
          ...editingRaffle,
          network: 'CUSTOM',
        });
      } else {
        setNewRaffle({
          ...newRaffle,
          network: 'CUSTOM',
          customNetwork: '',
          customNetworkLogoUrl: '',
          walletAddressLabel: 'Receiving EVM Wallet Address',
          walletAddressPlaceholder: '0x... (Whitelist receiver)',
        });
      }
      return;
    }

    // 3. Standard Built-in Chains
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

    if (target === 'edit_collab' && editingCollab) {
      setEditingCollab({
        ...editingCollab,
        network,
        customNetwork: '',
        customNetworkLogoUrl: '',
        walletAddressLabel: defaultLabel,
        walletAddressPlaceholder: defaultPlaceholder,
      });
    } else if ((target === 'edit_raffle' || target === true) && editingRaffle) {
      setEditingRaffle({
        ...editingRaffle,
        network,
        customNetwork: '',
        customNetworkLogoUrl: '',
        walletAddressLabel: defaultLabel,
        walletAddressPlaceholder: defaultPlaceholder,
      });
    } else {
      setNewRaffle({
        ...newRaffle,
        network,
        customNetwork: '',
        customNetworkLogoUrl: '',
        walletAddressLabel: defaultLabel,
        walletAddressPlaceholder: defaultPlaceholder,
      });
    }
  };

  const handleAddCustomTask = (target: 'new' | 'edit_raffle' | 'edit_collab' | boolean = 'new') => {
    if (target === 'edit_collab') {
      if (!editCollabTaskInput.title.trim() || !editCollabTaskInput.url.trim()) {
        alert('Please enter task title and link URL');
        return;
      }
      if (!editingCollab) return;
      const newTask: CustomTask = {
        id: `task-${Date.now()}`,
        title: editCollabTaskInput.title.trim(),
        url: editCollabTaskInput.url.trim(),
        actionLabel: editCollabTaskInput.actionLabel.trim() || 'Visit',
        type: editCollabTaskInput.type,
        required: true,
      };
      setEditingCollab({
        ...editingCollab,
        customTasks: [...(editingCollab.customTasks || []), newTask],
      });
      setEditCollabTaskInput({ title: '', url: '', actionLabel: 'Join', type: 'telegram' });
    } else if (target === 'edit_raffle' || target === true) {
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

  const handleRemoveCustomTask = (taskId: string, target: 'new' | 'edit_raffle' | 'edit_collab' | boolean = 'new') => {
    if (target === 'edit_collab' && editingCollab) {
      setEditingCollab({
        ...editingCollab,
        customTasks: (editingCollab.customTasks || []).filter(t => t.id !== taskId),
      });
    } else if ((target === 'edit_raffle' || target === true) && editingRaffle) {
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

  const handleUpdateCollab = async (e: React.FormEvent, andPublish = false) => {
    e.preventDefault();
    if (!editingCollab) return;

    try {
      setLoading(true);
      const res = await fetch(`/api/collab-requests/${editingCollab.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingCollab),
      });

      const data = await res.json();
      if (data.success) {
        if (andPublish) {
          const pubRes = await fetch(`/api/collab-requests/${editingCollab.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'approve_and_publish' }),
          });
          const pubData = await pubRes.json();
          if (pubData.success) {
            alert('🎉 Collab request saved and published live to raffles!');
          } else {
            alert(pubData.error || 'Saved changes, but publish live failed');
          }
        } else {
          alert('Collab request details updated successfully!');
        }
        setEditingCollab(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to update collab request');
      }
    } catch (err: any) {
      alert(`Error updating collab request: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRaffle.title.trim()) {
      alert('Please enter a raffle title');
      return;
    }

    let parsedEndDate: string;
    try {
      const parsed = newRaffle.endDate ? new Date(newRaffle.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      parsedEndDate = isNaN(parsed.getTime()) ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : parsed.toISOString();
    } catch {
      parsedEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    }

    try {
      setLoading(true);
      const res = await fetch('/api/raffles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newRaffle,
          startDate: new Date().toISOString(),
          endDate: parsedEndDate,
          status: 'live',
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Raffle created successfully!');
        setActiveTab('raffles');
        fetchData();
        // Reset form for next raffle
        setNewRaffle({
          title: '',
          project: 'DOTSET',
          slug: '',
          type: 'WL RAFFLE',
          mintStage: 'GTD',
          subtitle: '',
          description: '',
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
          discordUrl: 'https://discord.gg/Jq2Jt2HdfY',
          mintUrl: '',
          notes: '',
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16),
          entryMethod: 'raffle',
          customTasks: [],
        });
      } else {
        alert(data.error || data.message || 'Failed to create raffle');
      }
    } catch (err: any) {
      alert(`Error creating raffle: ${err.message || 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRaffle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRaffle) return;

    let parsedEndDate = editingRaffle.endDate;
    try {
      const parsed = editingRaffle.endDate ? new Date(editingRaffle.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      parsedEndDate = isNaN(parsed.getTime()) ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : parsed.toISOString();
    } catch {
      // keep existing
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/raffles/${editingRaffle.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editingRaffle,
          endDate: parsedEndDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        alert('Raffle updated successfully!');
        setEditingRaffle(null);
        fetchData();
      } else {
        alert(data.error || data.message || 'Failed to update raffle');
      }
    } catch (err: any) {
      alert(`Error updating raffle: ${err.message || 'Network error'}`);
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

  // Open Winners Management Modal
  const openWinnersModal = (raffle: Raffle) => {
    setManagingWinnersRaffle(raffle);
    setSavingWinners(false);
    setSingleWinnerWallet('');
    setSingleWinnerTwitter('');
    if (raffle.winners && raffle.winners.length > 0) {
      const existingText = raffle.winners
        .map(w => `${w.wallet}${w.twitterUsername ? `, ${w.twitterUsername}` : ''}`)
        .join('\n');
      setBulkWinnersRawText(existingText);
      setParsedWinnersList(
        raffle.winners.map((w, idx) => ({
          wallet: w.wallet,
          twitter: w.twitterUsername || '',
          rank: w.rank || idx + 1,
        }))
      );
    } else {
      setBulkWinnersRawText('');
      setParsedWinnersList([]);
    }
  };

  // Auto-arrange & parse bulk winner text into structured list
  const autoParseWinnersText = (text: string) => {
    setBulkWinnersRawText(text);
    if (!text.trim()) {
      setParsedWinnersList([]);
      return;
    }

    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed: Array<{ wallet: string; twitter: string; rank: number }> = [];

    lines.forEach((line) => {
      // Clean leading numbering like "1.", "1)", "#1", etc.
      const cleanLine = line.replace(/^#?\d+[\.\)\:\-]\s*/, '').trim();
      
      // Split by comma, tab, pipe, semicolon or whitespace
      let tokens: string[] = [];
      if (cleanLine.includes(',')) {
        tokens = cleanLine.split(',').map(t => t.trim().replace(/^["']|["']$/g, ''));
      } else if (cleanLine.includes('\t')) {
        tokens = cleanLine.split('\t').map(t => t.trim());
      } else if (cleanLine.includes('|')) {
        tokens = cleanLine.split('|').map(t => t.trim());
      } else if (cleanLine.includes(';')) {
        tokens = cleanLine.split(';').map(t => t.trim().replace(/^["']|["']$/g, ''));
      } else {
        tokens = cleanLine.split(/\s+/).map(t => t.trim());
      }

      tokens = tokens.filter(Boolean);
      if (tokens.length === 0) return;

      let wallet = '';
      let twitter = '';

      for (const token of tokens) {
        if (!wallet && (token.startsWith('0x') || token.length >= 26 || (!token.startsWith('@') && tokens.length === 1))) {
          wallet = token;
        } else if (token.startsWith('@') || (!twitter && wallet && token !== wallet)) {
          twitter = token.startsWith('@') ? token : `@${token}`;
        } else if (!wallet) {
          wallet = token;
        }
      }

      if (wallet) {
        parsed.push({
          wallet,
          twitter: twitter || '',
          rank: parsed.length + 1,
        });
      }
    });

    setParsedWinnersList(parsed);
  };

  // Add individual winner manually
  const handleAddSingleWinner = () => {
    if (!singleWinnerWallet.trim()) return;
    const cleanWallet = singleWinnerWallet.trim();
    const cleanTwitter = singleWinnerTwitter.trim() 
      ? (singleWinnerTwitter.trim().startsWith('@') ? singleWinnerTwitter.trim() : `@${singleWinnerTwitter.trim()}`) 
      : '';

    const updated = [
      ...parsedWinnersList,
      {
        wallet: cleanWallet,
        twitter: cleanTwitter,
        rank: parsedWinnersList.length + 1,
      },
    ];

    setParsedWinnersList(updated);
    setBulkWinnersRawText(updated.map(w => `${w.wallet}${w.twitter ? `, ${w.twitter}` : ''}`).join('\n'));
    setSingleWinnerWallet('');
    setSingleWinnerTwitter('');
  };

  // Remove winner row
  const handleRemoveWinner = (index: number) => {
    const updated = parsedWinnersList
      .filter((_, i) => i !== index)
      .map((w, idx) => ({ ...w, rank: idx + 1 }));

    setParsedWinnersList(updated);
    setBulkWinnersRawText(updated.map(w => `${w.wallet}${w.twitter ? `, ${w.twitter}` : ''}`).join('\n'));
  };

  // Random pick from existing entrants
  const handlePickRandomFromEntrants = () => {
    if (!managingWinnersRaffle) return;
    const raffleEntries = entries.filter(e => e.raffleId === managingWinnersRaffle.id && e.status === 'confirmed');
    if (raffleEntries.length === 0) {
      alert('No verified entrants found for this raffle yet to draw from.');
      return;
    }

    const count = managingWinnersRaffle.supply || 10;
    const shuffled = [...raffleEntries].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, Math.min(count, raffleEntries.length));

    const newWinners = selected.map((e, idx) => ({
      wallet: e.walletAddress,
      twitter: e.twitterUsername ? (e.twitterUsername.startsWith('@') ? e.twitterUsername : `@${e.twitterUsername}`) : '',
      rank: idx + 1,
    }));

    setParsedWinnersList(newWinners);
    setBulkWinnersRawText(newWinners.map(w => `${w.wallet}${w.twitter ? `, ${w.twitter}` : ''}`).join('\n'));
  };

  // Save & Publish winners
  const handleSaveAndPublishWinners = async () => {
    if (!managingWinnersRaffle) return;
    if (parsedWinnersList.length === 0) {
      alert('Please paste or add at least one winning wallet address before publishing.');
      return;
    }

    setSavingWinners(true);
    try {
      const res = await fetch(`/api/raffles/${managingWinnersRaffle.id}/winners`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winners: parsedWinnersList.map((item, idx) => ({
            wallet: item.wallet,
            twitter: item.twitter,
            rank: idx + 1,
          })),
          notifyTelegram: notifyTelegramOnWinners,
        }),
      });

      const data = await res.json();
      if (data.success) {
        let msg = `🎉 Successfully published ${parsedWinnersList.length} winner(s) to "${managingWinnersRaffle.title}"!`;
        if (data.telegram?.success) {
          msg += `\n📢 Official winners announcement broadcasted to Telegram!`;
        } else if (data.telegram?.error) {
          msg += `\n⚠️ Telegram note: ${data.telegram.error}`;
        }
        alert(msg);
        setManagingWinnersRaffle(null);
        fetchData();
      } else {
        alert(data.error || 'Failed to save winners');
      }
    } catch (err: any) {
      alert(`Error saving winners: ${err.message || 'Network error'}`);
    } finally {
      setSavingWinners(false);
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

  const pendingCollabsCount = collabRequests.filter(c => c.status === 'pending').length;
  const filteredCollabs = collabRequests.filter(c => {
    if (collabFilter !== 'all' && c.status !== collabFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (c.project || '').toLowerCase().includes(q);
      const matchTitle = (c.title || '').toLowerCase().includes(q);
      const matchX = (c.requesterTwitter || '').toLowerCase().includes(q);
      const matchTg = (c.requesterTelegram || '').toLowerCase().includes(q);
      if (!matchName && !matchTitle && !matchX && !matchTg) return false;
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
              Collab Requests
            </div>
            <div className="font-grotesk text-2xl sm:text-3xl font-bold text-amber-600 mt-1 flex items-baseline gap-2">
              <span>{collabRequests.length}</span>
              {pendingCollabsCount > 0 && (
                <span className="text-xs font-mono-dm text-amber-600 font-semibold">
                  ({pendingCollabsCount} pending)
                </span>
              )}
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
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-gray-200 pb-4">
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
            onClick={() => setActiveTab('collabs')}
            className={`px-4 py-2 rounded-lg text-sm font-dm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'collabs'
                ? 'bg-[#293681] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Inbox size={15} />
            <span>Collab Requests</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-mono-dm ${
              pendingCollabsCount > 0
                ? 'bg-amber-500 text-white font-bold animate-pulse'
                : activeTab === 'collabs' ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
            }`}>
              {collabRequests.length}
            </span>
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
            onClick={() => setActiveTab('telegram')}
            className={`px-4 py-2 rounded-lg text-sm font-dm font-semibold transition-all flex items-center gap-2 ${
              activeTab === 'telegram'
                ? 'bg-[#0088cc] text-white shadow-sm'
                : 'text-gray-600 hover:text-[#0088cc] hover:bg-sky-50'
            }`}
          >
            <Send size={15} />
            <span>Telegram Bot</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
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
                        {/* Add / Import Winners Button */}
                        <button
                          onClick={() => openWinnersModal(r)}
                          className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-dm font-bold text-xs py-2.5 px-3 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                          title="Import, bulk paste, or auto-draw winners"
                        >
                          <Trophy size={14} />
                          <span>{r.winners && r.winners.length > 0 ? `Winners (${r.winners.length})` : '🏆 Add / Draw Winners'}</span>
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
                    value={getSelectedNetworkValue(newRaffle.network, newRaffle.customNetwork)}
                    onChange={e => handleNetworkChange(e.target.value, false)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl p-3 text-sm outline-none font-medium"
                  >
                    <optgroup label="Standard Networks">
                      {availableChains.filter(c => c.isBuiltIn).map(c => (
                        <option key={c.id} value={c.network}>{c.name}</option>
                      ))}
                    </optgroup>
                    {availableChains.filter(c => !c.isBuiltIn).length > 0 && (
                      <optgroup label="Saved Custom Chains">
                        {availableChains.filter(c => !c.isBuiltIn).map(c => (
                          <option key={c.id} value={`SAVED_CUSTOM:${c.id}`}>🌟 {c.name}</option>
                        ))}
                      </optgroup>
                    )}
                    <option value="CUSTOM">+ New Custom Chain...</option>
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

        {/* TAB 4: COLLAB REQUESTS */}
        {activeTab === 'collabs' && (
          <div className="space-y-6">
            {/* Header & Filter Controls */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="font-syne text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Inbox size={20} className="text-[#293681]" />
                    <span>Partner Collaboration Requests</span>
                  </h2>
                  <p className="font-dm text-xs text-gray-500 mt-0.5">
                    Review and approve submitted partner raffle campaigns before publishing them to the live directory.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-mono-dm text-xs text-gray-500">Filter:</span>
                  <div className="flex bg-gray-100 p-1 rounded-lg text-xs font-dm">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setCollabFilter(status)}
                        className={`px-3 py-1 rounded-md capitalize transition-colors ${
                          collabFilter === status
                            ? 'bg-white text-gray-900 font-semibold shadow-xs'
                            : 'text-gray-500 hover:text-gray-900'
                        }`}
                      >
                        {status}
                        {status === 'pending' && (
                          <span className="ml-1 text-[10px] text-amber-600 font-bold">
                            ({collabRequests.filter(c => c.status === 'pending').length})
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* List / Cards */}
            {filteredCollabs.length === 0 ? (
              <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm space-y-2">
                <Inbox size={36} className="mx-auto text-gray-300" />
                <p className="font-dm text-sm text-gray-500">No collaboration requests found matching filter.</p>
                <p className="font-dm text-xs text-gray-400">
                  Projects can submit requests at <Link href="/collab" target="_blank" className="font-mono-dm text-[#293681] underline">/collab</Link>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCollabs.map(req => (
                  <div
                    key={req.id}
                    className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow space-y-5"
                  >
                    {/* Top Row: Info & Status */}
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-gray-100">
                      <div className="flex items-start gap-4">
                        {req.logoUrl ? (
                          <img
                            src={req.logoUrl}
                            alt={req.project}
                            className="w-14 h-14 rounded-xl object-cover border border-gray-200 shrink-0 bg-gray-50"
                            onError={e => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center font-grotesk font-bold text-gray-500 text-lg shrink-0">
                            {req.project?.slice(0, 2).toUpperCase()}
                          </div>
                        )}

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-syne text-base font-bold text-gray-900">
                              {req.project}
                            </h3>
                            <span className="text-xs text-gray-400 font-dm">·</span>
                            <span className="font-dm text-xs text-gray-600 font-medium">
                              {req.title}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono-dm uppercase font-bold ${
                              req.status === 'pending'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : req.status === 'approved'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                              {req.status}
                            </span>
                          </div>

                          <p className="font-dm text-xs text-gray-500 line-clamp-2 max-w-2xl">
                            {req.description || req.subtitle || 'No description provided.'}
                          </p>

                          <div className="text-[11px] font-mono-dm text-gray-400">
                            Submitted: {new Date(req.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>

                      {/* Requester Contacts Direct Chat Box */}
                      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 min-w-[240px] space-y-2 shrink-0">
                        <div className="font-mono-dm text-[10px] uppercase font-bold text-gray-600 tracking-wider">
                          Requester Contact (Direct)
                        </div>
                        <div className="space-y-1.5 font-dm text-xs">
                          {req.requesterTelegram && (
                            <a
                              href={req.requesterTelegram.startsWith('http') ? req.requesterTelegram : `https://t.me/${req.requesterTelegram.replace('@', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-[#229ED9] hover:underline font-medium"
                            >
                              <Send size={12} />
                              <span>Telegram: {req.requesterTelegram}</span>
                              <ExternalLink size={10} className="text-gray-400" />
                            </a>
                          )}
                          {req.requesterTwitter && (
                            <a
                              href={req.requesterTwitter.startsWith('http') ? req.requesterTwitter : `https://x.com/${req.requesterTwitter.replace('@', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1.5 text-gray-800 hover:text-[#293681] hover:underline font-medium"
                            >
                              <Twitter size={12} />
                              <span>𝕏: {req.requesterTwitter}</span>
                              <ExternalLink size={10} className="text-gray-400" />
                            </a>
                          )}
                          {req.requesterDiscord && (
                            <div className="flex items-center gap-1.5 text-[#5865F2]">
                              <MessageSquare size={12} />
                              <span>Discord: {req.requesterDiscord}</span>
                            </div>
                          )}
                          {req.requesterEmail && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <span>✉ {req.requesterEmail}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Middle Grid: Specs & Details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 bg-gray-50/70 p-3 rounded-xl border border-gray-100 font-dm text-xs">
                      <div>
                        <div className="text-[10px] font-mono-dm uppercase text-gray-400">Network</div>
                        <div className="font-semibold text-gray-900 flex items-center gap-1 mt-0.5">
                          <ChainBadge network={req.network} customNetwork={req.customNetwork} customNetworkLogoUrl={req.customNetworkLogoUrl} />
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-dm uppercase text-gray-400">Stage</div>
                        <div className="font-semibold text-gray-900 mt-0.5">{req.mintStage}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-dm uppercase text-gray-400">Supply</div>
                        <div className="font-semibold text-gray-900 mt-0.5">{req.supply} Spots</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-dm uppercase text-gray-400">Mint Price</div>
                        <div className="font-semibold text-gray-900 mt-0.5">{req.mintPrice}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-dm uppercase text-gray-400">Total NFT Supply</div>
                        <div className="font-semibold text-gray-900 mt-0.5">{req.nftTotalSupply}</div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono-dm uppercase text-gray-400">Mint Date</div>
                        <div className="font-semibold text-gray-900 mt-0.5">{req.mintDate}</div>
                      </div>
                    </div>

                    {/* Custom Tasks & Social Links */}
                    <div className="space-y-2">
                      <div className="font-mono-dm text-[11px] uppercase font-bold text-gray-700">
                        Campaign Tasks & Links:
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        {req.followUrl && (
                          <a
                            href={req.followUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:text-[#293681]"
                          >
                            <Twitter size={12} className="text-[#38bdf8]" />
                            <span>Follow Task</span>
                            <ExternalLink size={10} className="text-gray-400" />
                          </a>
                        )}
                        {req.engageUrl && (
                          <a
                            href={req.engageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:text-[#293681]"
                          >
                            <Twitter size={12} className="text-[#38bdf8]" />
                            <span>Engage / RT Task</span>
                            <ExternalLink size={10} className="text-gray-400" />
                          </a>
                        )}
                        {req.customTasks && req.customTasks.map((ct, idx) => (
                          <a
                            key={ct.id || idx}
                            href={ct.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-700 hover:text-[#293681]"
                          >
                            {ct.type === 'telegram' ? <Send size={12} className="text-[#229ED9]" /> :
                             ct.type === 'discord' ? <MessageSquare size={12} className="text-[#5865F2]" /> :
                             ct.type === 'youtube' ? <Youtube size={12} className="text-[#FF0000]" /> :
                             ct.type === 'twitter' ? <Twitter size={12} className="text-[#38bdf8]" /> :
                             <Globe size={12} className="text-[#293681]" />}
                            <span>{ct.title}</span>
                            <ExternalLink size={10} className="text-gray-400" />
                          </a>
                        ))}
                      </div>
                    </div>

                    {/* Banner preview if available */}
                    {req.bannerUrl && (
                      <div className="space-y-1">
                        <div className="font-mono-dm text-[10px] uppercase text-gray-400">Banner Artwork Preview</div>
                        <img
                          src={req.bannerUrl}
                          alt="Banner"
                          className="h-28 sm:h-36 w-full object-cover rounded-xl border border-gray-200 bg-gray-100"
                          onError={e => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        {req.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApproveAndPublishCollab(req.id, req.project)}
                              disabled={loading}
                              className="px-4 py-2 bg-[#16a34a] hover:bg-[#15803d] text-white text-xs font-semibold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
                            >
                              <CheckCircle2 size={14} />
                              <span>Approve & Publish Live</span>
                            </button>

                            <button
                              onClick={() => handleUpdateCollabStatus(req.id, 'rejected')}
                              disabled={loading}
                              className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5"
                            >
                              <XCircle size={14} />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {req.status === 'rejected' && (
                          <button
                            onClick={() => handleUpdateCollabStatus(req.id, 'pending')}
                            disabled={loading}
                            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-xs font-medium rounded-xl transition-colors"
                          >
                            Restore to Pending
                          </button>
                        )}

                        {req.status === 'approved' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium rounded-xl">
                            <CheckCircle2 size={14} />
                            <span>Approved & Published to Live Raffles</span>
                          </div>
                        )}

                        {/* Edit Collab Details Button */}
                        <button
                          onClick={() => setEditingCollab(req)}
                          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 border border-gray-200"
                          title="Edit Collab Request Details"
                        >
                          <Edit3 size={13} />
                          <span>Edit Details</span>
                        </button>
                      </div>

                      <button
                        onClick={() => handleDeleteCollab(req.id)}
                        disabled={loading}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                        title="Delete Collab Request"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: TELEGRAM BOT NOTIFICATIONS */}
        {activeTab === 'telegram' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-[#0088cc]/10 via-[#293681]/5 to-transparent border border-[#0088cc]/20 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#0088cc] text-white flex items-center justify-center shadow-lg shadow-[#0088cc]/20 shrink-0">
                  <Send size={24} className="-ml-0.5 mt-0.5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-syne text-xl font-bold text-gray-900">
                      Telegram Community Bot Controller
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-mono-dm uppercase font-bold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Bot Active
                    </span>
                  </div>
                  <p className="font-dm text-xs text-gray-500 mt-1">
                    Automatically broadcast live whitelists, raffle drops, and collab approvals to your Telegram channel & community group with direct links and image artwork.
                  </p>
                </div>
              </div>

              <a
                href="https://t.me/DOTSETRAFFLESbot"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2 shrink-0 shadow-sm"
              >
                <span>Open @DOTSETRAFFLESbot</span>
                <ExternalLink size={13} />
              </a>
            </div>

            {/* Quick Setup Instructions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-1.5">
                <div className="font-mono-dm text-[11px] font-bold text-[#0088cc] uppercase flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[10px]">1</span>
                  <span>Add Bot as Admin</span>
                </div>
                <p className="text-xs text-gray-600 font-dm">
                  Add <span className="font-mono text-gray-900 font-semibold">@DOTSETRAFFLESbot</span> to your Telegram group or channel with <b>Post Messages</b> administrator rights.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-1.5">
                <div className="font-mono-dm text-[11px] font-bold text-[#0088cc] uppercase flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[10px]">2</span>
                  <span>Set Channel / Chat ID</span>
                </div>
                <p className="text-xs text-gray-600 font-dm">
                  Enter your channel username (e.g. <span className="font-mono text-gray-900 font-semibold">@dotset_xyz</span>) or group numeric chat ID below.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-1.5">
                <div className="font-mono-dm text-[11px] font-bold text-[#0088cc] uppercase flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-[#0088cc]/10 flex items-center justify-center text-[10px]">3</span>
                  <span>Send Test Notification</span>
                </div>
                <p className="text-xs text-gray-600 font-dm">
                  Click the <b>Send Test Notification</b> button below to confirm the bot can post announcements cleanly to your group.
                </p>
              </div>
            </div>

            {/* Settings Form & Live Preview Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Column */}
              <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-5">
                <h3 className="font-syne text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-[#0088cc]" />
                  <span>Bot Configuration & Broadcast Targets</span>
                </h3>

                <form onSubmit={handleSaveTelegramSettings} className="space-y-4 font-dm text-xs">
                  {/* Status Banner */}
                  {telegramStatusMsg && (
                    <div className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                      telegramStatusMsg.type === 'success'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-red-50 border-red-200 text-red-800'
                    }`}>
                      {telegramStatusMsg.type === 'success' ? (
                        <CheckCircle2 size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle size={16} className="text-red-600 shrink-0 mt-0.5" />
                      )}
                      <div className="text-xs leading-relaxed">{telegramStatusMsg.text}</div>
                    </div>
                  )}

                  {/* Channel / Chat ID */}
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-700 font-medium mb-1">
                      Target Telegram Channel / Group Chat ID *
                    </label>
                    <input
                      type="text"
                      required
                      value={telegramChatId}
                      onChange={e => setTelegramChatId(e.target.value)}
                      placeholder="@dotset_xyz or -100xxxxxxxxxx"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#0088cc] text-gray-900 font-mono-dm p-3 rounded-xl outline-none text-xs"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      For public channels, use your username starting with <span className="font-mono">@</span> (e.g. <span className="font-mono font-medium text-gray-600">@dotset_xyz</span>). For private groups, use the chat ID.
                    </p>
                  </div>

                  {/* Bot Token */}
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-700 font-medium mb-1">
                      Bot API Token
                    </label>
                    <input
                      type="text"
                      value={telegramBotToken}
                      onChange={e => setTelegramBotToken(e.target.value)}
                      placeholder="8614389362:AAFGEDPeVJzD8_anq3MM5SO00JM3WjRqegU"
                      className="w-full bg-gray-50 border border-gray-200 focus:border-[#0088cc] text-gray-900 font-mono-dm p-3 rounded-xl outline-none text-xs"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Default active bot: <span className="font-mono font-medium text-gray-700">@DOTSETRAFFLESbot</span>
                    </p>
                  </div>

                  {/* Auto-Notify Toggle */}
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-4">
                    <div>
                      <div className="font-semibold text-gray-900 text-xs">
                        Auto-Notify on New Live Raffles
                      </div>
                      <div className="text-[11px] text-gray-500 mt-0.5">
                        Automatically broadcast announcements to Telegram whenever a new raffle is created or collab request is published.
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={telegramAutoNotify}
                        onChange={e => setTelegramAutoNotify(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0088cc]"></div>
                    </label>
                  </div>

                  {/* Form Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={savingTelegram}
                      className="flex-1 bg-[#293681] hover:bg-[#1f2963] text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <span>{savingTelegram ? 'Saving Settings...' : 'Save Configuration'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleTestTelegram}
                      disabled={testingTelegram}
                      className="flex-1 bg-[#0088cc] hover:bg-[#0077b5] text-white font-semibold py-3 px-4 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                    >
                      <Send size={14} className={testingTelegram ? 'animate-spin' : ''} />
                      <span>{testingTelegram ? 'Sending Test...' : 'Send Test Notification'}</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Telegram Preview Card Column */}
              <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="font-syne text-base font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <Send size={15} className="text-[#0088cc]" />
                    <span>Live Notification Preview</span>
                  </h3>
                  <p className="text-xs text-gray-500 font-dm mb-4">
                    This is the exact rich format and interactive buttons your community will see in Telegram.
                  </p>

                  {/* Telegram Message Mock Card */}
                  <div className="bg-[#f4f7f9] border border-gray-200 rounded-2xl p-4 space-y-3 font-sans text-xs text-gray-900 shadow-inner">
                    {/* Channel Header inside mock */}
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0088cc] text-white flex items-center justify-center text-xs font-bold font-syne">
                        D
                      </div>
                      <div>
                        <div className="font-bold text-xs text-gray-900 leading-tight">DOTSET Community</div>
                        <div className="text-[10px] text-gray-400">@DOTSETRAFFLESbot • just now</div>
                      </div>
                    </div>

                    {/* Preview Image */}
                    <div className="rounded-xl overflow-hidden border border-gray-200 bg-white">
                      <img
                        src="/images/dotset-logo.png"
                        alt="Raffle Preview"
                        className="w-full h-32 object-contain bg-[#0c1024] p-3"
                      />
                    </div>

                    {/* Message Body */}
                    <div className="space-y-1.5 text-xs text-gray-800 leading-relaxed font-sans">
                      <p className="font-bold text-[#0088cc]">
                        🚨 <b>NEW RAFFLE IS NOW LIVE ON DOTSET!</b> 🎟️✨
                      </p>
                      <p>
                        <b>Project:</b> DOTSET Partner WL<br />
                        <b>Title:</b> Exclusive Whitelist Allocation<br />
                        <b>Network:</b> ETHEREUM<br />
                        <b>Supply:</b> 50 Spots<br />
                        <b>Mint Stage:</b> GTD (Guaranteed)<br />
                        <b>Mint Price:</b> FREE MINT<br />
                        <b>Mint Date:</b> TBA
                      </p>
                      <p className="text-gray-500 italic text-[11px] pt-1">
                        🚀 Complete the required quests and secure your spot now!
                      </p>
                    </div>

                    {/* Inline Keyboard Preview */}
                    <div className="space-y-1.5 pt-2 border-t border-gray-200">
                      <div className="w-full py-2 bg-[#0088cc]/15 hover:bg-[#0088cc]/25 text-[#0088cc] border border-[#0088cc]/30 rounded-lg text-center font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                        <span>🎟️ Enter Whitelist Raffle</span>
                      </div>
                      <div className="w-full py-1.5 bg-gray-200/80 text-gray-700 rounded-lg text-center font-medium text-[11px] cursor-pointer">
                        🌐 View All Allocations
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-gray-400 font-mono-dm text-center pt-2">
                  Powered by @DOTSETRAFFLESbot • 100% Automated Instant Broadcast
                </div>
              </div>
            </div>
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Project / Partner Name
                    </label>
                    <input
                      type="text"
                      value={editingRaffle.project || ''}
                      onChange={e => setEditingRaffle({ ...editingRaffle, project: e.target.value })}
                      placeholder="e.g. DOTSET or Partner"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Mint Stage
                    </label>
                    <select
                      value={editingRaffle.mintStage || (editingRaffle.entryMethod === 'fcfs' ? 'FCFS' : 'GTD')}
                      onChange={e => setEditingRaffle({ ...editingRaffle, mintStage: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    >
                      <option value="GTD">Guaranteed (GTD)</option>
                      <option value="FCFS">First-Come First-Served (FCFS)</option>
                      <option value="WL">Standard Whitelist (WL)</option>
                    </select>
                  </div>
                </div>

                {/* Project Logo & Banner Artwork in Edit Modal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {/* Logo */}
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1.5 text-[11px] flex items-center justify-between">
                      <span>Project Logo</span>
                      {editingRaffle.logoUrl && (
                        <img src={editingRaffle.logoUrl} alt="Logo preview" className="w-5 h-5 object-contain rounded border border-gray-200 bg-white" />
                      )}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editingRaffle.logoUrl || ''}
                        onChange={e => setEditingRaffle({ ...editingRaffle, logoUrl: e.target.value })}
                        placeholder="https://.../logo.png"
                        className="flex-1 bg-white border border-gray-200 text-gray-900 p-2 rounded-lg outline-none text-xs"
                      />
                      <input
                        type="file"
                        ref={editLogoFileRef}
                        className="hidden"
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo', true)}
                      />
                      <button
                        type="button"
                        onClick={() => editLogoFileRef.current?.click()}
                        className="px-2.5 bg-white hover:bg-gray-100 text-gray-800 rounded-lg text-xs font-medium border border-gray-200 shrink-0"
                      >
                        {uploadingLogo ? '...' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1.5 text-[11px] flex items-center justify-between">
                      <span>Banner Artwork</span>
                      {editingRaffle.bannerUrl && (
                        <img src={editingRaffle.bannerUrl} alt="Banner preview" className="w-8 h-5 object-cover rounded border border-gray-200 bg-white" />
                      )}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editingRaffle.bannerUrl || ''}
                        onChange={e => setEditingRaffle({ ...editingRaffle, bannerUrl: e.target.value })}
                        placeholder="https://.../banner.png"
                        className="flex-1 bg-white border border-gray-200 text-gray-900 p-2 rounded-lg outline-none text-xs"
                      />
                      <input
                        type="file"
                        ref={editBannerFileRef}
                        className="hidden"
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner', true)}
                      />
                      <button
                        type="button"
                        onClick={() => editBannerFileRef.current?.click()}
                        className="px-2.5 bg-white hover:bg-gray-100 text-gray-800 rounded-lg text-xs font-medium border border-gray-200 shrink-0"
                      >
                        {uploadingBanner ? '...' : 'Upload'}
                      </button>
                    </div>
                  </div>
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
                      value={getSelectedNetworkValue(editingRaffle.network, editingRaffle.customNetwork)}
                      onChange={e => handleNetworkChange(e.target.value, true)}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    >
                      <optgroup label="Standard Networks">
                        {availableChains.filter(c => c.isBuiltIn).map(c => (
                          <option key={c.id} value={c.network}>{c.name}</option>
                        ))}
                      </optgroup>
                      {availableChains.filter(c => !c.isBuiltIn).length > 0 && (
                        <optgroup label="Saved Custom Chains">
                          {availableChains.filter(c => !c.isBuiltIn).map(c => (
                            <option key={c.id} value={`SAVED_CUSTOM:${c.id}`}>🌟 {c.name}</option>
                          ))}
                        </optgroup>
                      )}
                      <option value="CUSTOM">+ New Custom Chain...</option>
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

        {/* MODAL: EDIT COLLAB REQUEST */}
        {editingCollab && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-3xl w-full my-8 shadow-2xl space-y-5 text-gray-900 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-syne text-lg font-bold text-gray-900">
                      Edit Collab Request: {editingCollab.project || editingCollab.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono-dm uppercase font-bold border ${
                      editingCollab.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      editingCollab.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {editingCollab.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 font-dm">
                    Edit partner submission details before approving and publishing to live raffles.
                  </p>
                </div>
                <button
                  onClick={() => setEditingCollab(null)}
                  className="p-1 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={e => handleUpdateCollab(e, false)} className="space-y-4 font-dm text-xs">
                {/* Requester Contact Details */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                  <div className="font-mono-dm text-[11px] font-bold text-[#293681] uppercase flex items-center gap-1.5">
                    <Users size={13} />
                    <span>Requester Contact Information</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1 text-[10px]">
                        Requester 𝕏 / Twitter Handle
                      </label>
                      <input
                        type="text"
                        value={editingCollab.requesterTwitter || ''}
                        onChange={e => setEditingCollab({ ...editingCollab, requesterTwitter: e.target.value })}
                        placeholder="@username"
                        className="w-full bg-white border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs focus:border-[#293681]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1 text-[10px]">
                        Requester Telegram Handle
                      </label>
                      <input
                        type="text"
                        value={editingCollab.requesterTelegram || ''}
                        onChange={e => setEditingCollab({ ...editingCollab, requesterTelegram: e.target.value })}
                        placeholder="@telegram_handle"
                        className="w-full bg-white border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs focus:border-[#293681]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1 text-[10px]">
                        Discord Tag / Server
                      </label>
                      <input
                        type="text"
                        value={editingCollab.requesterDiscord || ''}
                        onChange={e => setEditingCollab({ ...editingCollab, requesterDiscord: e.target.value })}
                        placeholder="discord_user#1234 or server invite"
                        className="w-full bg-white border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs focus:border-[#293681]"
                      />
                    </div>
                    <div>
                      <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1 text-[10px]">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={editingCollab.requesterEmail || ''}
                        onChange={e => setEditingCollab({ ...editingCollab, requesterEmail: e.target.value })}
                        placeholder="contact@project.xyz"
                        className="w-full bg-white border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs focus:border-[#293681]"
                      />
                    </div>
                  </div>
                </div>

                {/* Project Name & Raffle Title */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Project / Partner Name
                    </label>
                    <input
                      type="text"
                      value={editingCollab.project || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, project: e.target.value })}
                      placeholder="e.g. DOTSET or Partner"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Raffle Campaign Title
                    </label>
                    <input
                      type="text"
                      value={editingCollab.title || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, title: e.target.value })}
                      placeholder="e.g. Genesis Whitelist Allocation"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                      required
                    />
                  </div>
                </div>

                {/* Slug & Subtitle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Custom URL Slug
                    </label>
                    <div className="flex items-center">
                      <span className="bg-gray-100 border border-r-0 border-gray-200 text-gray-500 px-3 py-3 rounded-l-lg text-xs font-mono-dm select-none">
                        /raffle/
                      </span>
                      <input
                        type="text"
                        value={editingCollab.slug || ''}
                        onChange={e => setEditingCollab({ ...editingCollab, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                        placeholder="project-slug"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-r-lg outline-none text-sm font-mono-dm focus:border-[#293681]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Subtitle / Catchphrase
                    </label>
                    <input
                      type="text"
                      value={editingCollab.subtitle || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, subtitle: e.target.value })}
                      placeholder="e.g. Official Community Whitelist Raffle"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                    Project & Campaign Description
                  </label>
                  <textarea
                    rows={3}
                    value={editingCollab.description || ''}
                    onChange={e => setEditingCollab({ ...editingCollab, description: e.target.value })}
                    placeholder="Brief description about the project, mint perks, requirements..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-xs focus:border-[#293681] resize-none"
                  />
                </div>

                {/* Visuals: Logo & Banner Uploaders */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  {/* Logo */}
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1.5 text-[11px] flex items-center justify-between">
                      <span>Project Logo</span>
                      {editingCollab.logoUrl && (
                        <img 
                          src={editingCollab.logoUrl} 
                          alt="Logo preview" 
                          className="w-5 h-5 object-contain rounded border border-gray-200 bg-white" 
                          onError={e => { (e.target as HTMLImageElement).src = '/images/dotset-logo.png'; }}
                        />
                      )}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editingCollab.logoUrl || ''}
                        onChange={e => setEditingCollab({ ...editingCollab, logoUrl: e.target.value })}
                        placeholder="https://.../logo.png"
                        className="flex-1 bg-white border border-gray-200 text-gray-900 p-2 rounded-lg outline-none text-xs"
                      />
                      <input
                        type="file"
                        ref={editCollabLogoFileRef}
                        className="hidden"
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'logo', 'edit_collab')}
                      />
                      <button
                        type="button"
                        onClick={() => editCollabLogoFileRef.current?.click()}
                        className="px-2.5 bg-white hover:bg-gray-100 text-gray-800 rounded-lg text-xs font-medium border border-gray-200 shrink-0"
                      >
                        {uploadingLogo ? '...' : 'Upload'}
                      </button>
                    </div>
                  </div>

                  {/* Banner */}
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1.5 text-[11px] flex items-center justify-between">
                      <span>Banner Artwork</span>
                      {editingCollab.bannerUrl && (
                        <img 
                          src={editingCollab.bannerUrl} 
                          alt="Banner preview" 
                          className="w-8 h-5 object-cover rounded border border-gray-200 bg-white" 
                          onError={e => { (e.target as HTMLImageElement).src = '/images/dotset-logo.png'; }}
                        />
                      )}
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editingCollab.bannerUrl || ''}
                        onChange={e => setEditingCollab({ ...editingCollab, bannerUrl: e.target.value })}
                        placeholder="https://.../banner.png"
                        className="flex-1 bg-white border border-gray-200 text-gray-900 p-2 rounded-lg outline-none text-xs"
                      />
                      <input
                        type="file"
                        ref={editCollabBannerFileRef}
                        className="hidden"
                        accept="image/*"
                        onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'banner', 'edit_collab')}
                      />
                      <button
                        type="button"
                        onClick={() => editCollabBannerFileRef.current?.click()}
                        className="px-2.5 bg-white hover:bg-gray-100 text-gray-800 rounded-lg text-xs font-medium border border-gray-200 shrink-0"
                      >
                        {uploadingBanner ? '...' : 'Upload'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Mint Info & Supply */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Mint Stage
                    </label>
                    <select
                      value={editingCollab.mintStage || 'GTD'}
                      onChange={e => setEditingCollab({ ...editingCollab, mintStage: e.target.value as any })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    >
                      <option value="GTD">Guaranteed (GTD)</option>
                      <option value="FCFS">First-Come First-Served (FCFS)</option>
                      <option value="WL">Standard Whitelist (WL)</option>
                      <option value="CUSTOM">Custom</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Raffle Spots
                    </label>
                    <input
                      type="number"
                      value={editingCollab.supply || 50}
                      onChange={e => setEditingCollab({ ...editingCollab, supply: parseInt(e.target.value) || 10 })}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm font-mono-dm focus:border-[#293681]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      NFT Total Supply
                    </label>
                    <input
                      type="text"
                      value={editingCollab.nftTotalSupply || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, nftTotalSupply: e.target.value })}
                      placeholder="e.g. 1,000 NFTs"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Mint Price
                    </label>
                    <input
                      type="text"
                      value={editingCollab.mintPrice || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, mintPrice: e.target.value })}
                      placeholder="FREE or 0.05 ETH"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Mint Date
                    </label>
                    <input
                      type="text"
                      value={editingCollab.mintDate || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, mintDate: e.target.value })}
                      placeholder="e.g. Oct 2026 / TBA"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Max Mint Per Wallet
                    </label>
                    <input
                      type="text"
                      value={editingCollab.maxMintPerWallet || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, maxMintPerWallet: e.target.value })}
                      placeholder="e.g. 1 PER WL"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>
                </div>

                {/* Blockchain Network & Custom Chain */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1 flex items-center justify-between">
                      <span>Blockchain Network</span>
                      <ChainLogo network={editingCollab.network} customNetworkLogoUrl={editingCollab.customNetworkLogoUrl} size={14} />
                    </label>
                    <select
                      value={getSelectedNetworkValue(editingCollab.network, editingCollab.customNetwork)}
                      onChange={e => handleNetworkChange(e.target.value, 'edit_collab')}
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    >
                      <optgroup label="Standard Networks">
                        {availableChains.filter(c => c.isBuiltIn).map(c => (
                          <option key={c.id} value={c.network}>{c.name}</option>
                        ))}
                      </optgroup>
                      {availableChains.filter(c => !c.isBuiltIn).length > 0 && (
                        <optgroup label="Saved Custom Chains">
                          {availableChains.filter(c => !c.isBuiltIn).map(c => (
                            <option key={c.id} value={`SAVED_CUSTOM:${c.id}`}>🌟 {c.name}</option>
                          ))}
                        </optgroup>
                      )}
                      <option value="CUSTOM">+ New Custom Chain...</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      Custom Chain Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={editingCollab.customNetwork || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, customNetwork: e.target.value })}
                      placeholder="e.g. Monad Testnet"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>
                </div>

                {/* Custom Chain Logo in Collab Modal */}
                <div>
                  <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                    Custom Chain Logo (URL or Upload)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingCollab.customNetworkLogoUrl || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, customNetworkLogoUrl: e.target.value })}
                      placeholder="https://.../chain-logo.png"
                      className="flex-1 bg-gray-50 border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs"
                    />
                    <input
                      type="file"
                      ref={editCollabChainLogoFileRef}
                      className="hidden"
                      accept="image/*"
                      onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0], 'chain_logo', 'edit_collab')}
                    />
                    <button
                      type="button"
                      onClick={() => editCollabChainLogoFileRef.current?.click()}
                      className="px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-medium border border-gray-200"
                    >
                      {uploadingChainLogo ? '...' : 'Upload Logo'}
                    </button>
                  </div>
                </div>

                {/* Editable Wallet Input Text */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-500 font-medium mb-1 text-[10px]">
                      Wallet Input Label Text
                    </label>
                    <input
                      type="text"
                      value={editingCollab.walletAddressLabel || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, walletAddressLabel: e.target.value })}
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
                      value={editingCollab.walletAddressPlaceholder || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, walletAddressPlaceholder: e.target.value })}
                      placeholder="0x... (Whitelist receiver)"
                      className="w-full bg-white border border-gray-200 text-gray-900 p-2.5 rounded-lg outline-none text-xs font-mono-dm"
                    />
                  </div>
                </div>

                {/* Social / Task URLs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      𝕏 Follow URL
                    </label>
                    <input
                      type="url"
                      value={editingCollab.followUrl || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, followUrl: e.target.value })}
                      placeholder="https://x.com/project"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>

                  <div>
                    <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                      𝕏 Like & RT URL
                    </label>
                    <input
                      type="url"
                      value={editingCollab.engageUrl || ''}
                      onChange={e => setEditingCollab({ ...editingCollab, engageUrl: e.target.value })}
                      placeholder="https://x.com/project/status/..."
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-sm focus:border-[#293681]"
                    />
                  </div>
                </div>

                {/* Custom Tasks in Collab Modal */}
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono-dm text-xs font-bold text-gray-800 uppercase">
                      Custom Social Tasks ({editingCollab.customTasks?.length || 0})
                    </span>
                  </div>

                  {editingCollab.customTasks && editingCollab.customTasks.length > 0 && (
                    <div className="space-y-1.5">
                      {editingCollab.customTasks.map((t, idx) => (
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
                            onClick={() => handleRemoveCustomTask(t.id, 'edit_collab')}
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
                      value={editCollabTaskInput.type}
                      onChange={e => setEditCollabTaskInput({ ...editCollabTaskInput, type: e.target.value as any })}
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
                      value={editCollabTaskInput.title}
                      onChange={e => setEditCollabTaskInput({ ...editCollabTaskInput, title: e.target.value })}
                      className="bg-white border border-gray-200 p-2 rounded-lg text-xs"
                    />

                    <input
                      type="url"
                      placeholder="Destination URL"
                      value={editCollabTaskInput.url}
                      onChange={e => setEditCollabTaskInput({ ...editCollabTaskInput, url: e.target.value })}
                      className="bg-white border border-gray-200 p-2 rounded-lg text-xs"
                    />

                    <button
                      type="button"
                      onClick={() => handleAddCustomTask('edit_collab')}
                      className="px-3 py-2 bg-[#293681] text-white rounded-lg text-xs font-semibold hover:bg-[#1f2963]"
                    >
                      + Add Task
                    </button>
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-mono-dm uppercase text-gray-600 font-medium mb-1">
                    Internal Admin / Partner Notes
                  </label>
                  <input
                    type="text"
                    value={editingCollab.notes || ''}
                    onChange={e => setEditingCollab({ ...editingCollab, notes: e.target.value })}
                    placeholder="Extra requirements, partnership remarks..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 p-3 rounded-lg outline-none text-xs focus:border-[#293681]"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-3">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={e => handleUpdateCollab(e, true)}
                    className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3 rounded-xl transition-all text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={16} />
                    <span>{loading ? 'Saving...' : 'Save & Publish Live'}</span>
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[#293681] text-white font-bold py-3 rounded-xl hover:bg-[#1f2963] transition-colors text-sm shadow-sm flex items-center justify-center gap-2"
                  >
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditingCollab(null)}
                    className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-sm font-medium border border-gray-200 py-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: MANAGE & BULK IMPORT WINNERS */}
        {managingWinnersRaffle && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 max-w-4xl w-full my-8 shadow-2xl space-y-5 text-gray-900 max-h-[92vh] overflow-y-auto">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                    <Trophy size={20} />
                  </div>
                  <div>
                    <h3 className="font-syne text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span>Manage & Import Winners:</span>
                      <span className="text-[#293681]">{managingWinnersRaffle.title}</span>
                    </h3>
                    <p className="font-dm text-xs text-gray-500 mt-0.5">
                      {managingWinnersRaffle.project} • Target Supply: <b>{managingWinnersRaffle.supply} Spots</b> • {managingWinnersRaffle.customNetwork || managingWinnersRaffle.network}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setManagingWinnersRaffle(null)}
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePickRandomFromEntrants}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-dm font-bold text-xs rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                  >
                    <Trophy size={13} />
                    <span>🎲 Auto-Draw from Entrants ({entries.filter(e => e.raffleId === managingWinnersRaffle.id && e.status === 'confirmed').length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const sample = [
                        '0x71C845170B1fA304381C65158229F8a5Fe44a808, @crypto_whale',
                        '0x83e20eE9f430D0a4F39294e3391740924E7A5A79, @nft_degen',
                        '0x92f8016484e5900be46A9749a04C40a12F874558, @dotset_fan',
                      ].join('\n');
                      autoParseWinnersText(sample);
                    }}
                    className="px-2.5 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 font-dm text-xs rounded-lg transition-colors"
                  >
                    📋 Load Sample Format
                  </button>
                </div>

                {parsedWinnersList.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setBulkWinnersRawText('');
                      setParsedWinnersList([]);
                    }}
                    className="px-2.5 py-1.5 text-red-600 hover:bg-red-50 font-dm text-xs rounded-lg transition-colors"
                  >
                    🗑️ Clear List
                  </button>
                )}
              </div>

              {/* Bulk Paste Drop Box */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-mono-dm uppercase text-xs font-bold text-gray-700 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-[#38bdf8]" />
                    <span>Bulk Paste Drop Box (Auto-Arranges Automatically)</span>
                  </label>
                  <span className="font-mono-dm text-[11px] text-gray-500">
                    {parsedWinnersList.length} / {managingWinnersRaffle.supply} Spots Detected
                  </span>
                </div>
                
                <textarea
                  rows={5}
                  value={bulkWinnersRawText}
                  onChange={e => autoParseWinnersText(e.target.value)}
                  placeholder="Paste winners in bulk (one per line). Supported formats:&#10;0x1234567890abcdef1234567890abcdef12345678, @username1&#10;0xabcdef1234567890abcdef1234567890abcdef12 @username2&#10;0x9876543210fedcba9876543210fedcba98765432&#10;Tab-separated, comma-separated, or just wallet addresses..."
                  className="w-full bg-gray-50 border border-gray-200 focus:border-[#293681] text-gray-900 placeholder:text-gray-400 font-mono-dm p-3 rounded-xl outline-none text-xs leading-relaxed"
                />
              </div>

              {/* Manual Single Entry Builder */}
              <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-xl space-y-2">
                <div className="font-mono-dm uppercase text-[10px] text-gray-500 font-bold">
                  + Add Single Winner Manually
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-7">
                    <input
                      type="text"
                      value={singleWinnerWallet}
                      onChange={e => setSingleWinnerWallet(e.target.value)}
                      placeholder="0x... (Wallet Address)"
                      className="w-full bg-white border border-gray-200 text-gray-900 font-mono-dm p-2 rounded-lg text-xs outline-none focus:border-[#293681]"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={singleWinnerTwitter}
                      onChange={e => setSingleWinnerTwitter(e.target.value)}
                      placeholder="@twitter (Optional)"
                      className="w-full bg-white border border-gray-200 text-gray-900 p-2 rounded-lg text-xs outline-none focus:border-[#293681]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddSingleWinner}
                      disabled={!singleWinnerWallet.trim()}
                      className="w-full h-full py-2 bg-[#293681] hover:bg-[#1f2963] disabled:opacity-50 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>

              {/* Parsed Arranged Winners Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between font-mono-dm text-xs">
                  <span className="font-bold text-gray-800">
                    Live Arranged Winners Table ({parsedWinnersList.length})
                  </span>
                  {parsedWinnersList.length > 0 && (
                    <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold text-[10px]">
                      Ready to Publish
                    </span>
                  )}
                </div>

                {parsedWinnersList.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 border border-gray-200 rounded-xl text-gray-400 text-xs font-dm">
                    No winners added yet. Paste a list above or click "Auto-Draw from Entrants".
                  </div>
                ) : (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-60 overflow-y-auto">
                    <table className="w-full text-left font-dm text-xs">
                      <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-mono-dm text-[10px] sticky top-0 bg-gray-50 z-10">
                        <tr>
                          <th className="py-2.5 px-3 w-14 text-center">Rank</th>
                          <th className="py-2.5 px-3">Wallet Address</th>
                          <th className="py-2.5 px-3">X / Twitter</th>
                          <th className="py-2.5 px-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-gray-700">
                        {parsedWinnersList.map((w, idx) => (
                          <tr key={idx} className="hover:bg-gray-50 transition-colors">
                            <td className="py-2 px-3 text-center font-mono-dm font-bold text-amber-600">
                              #{w.rank}
                            </td>
                            <td className="py-2 px-3 font-mono-dm text-gray-900 font-medium">
                              {w.wallet}
                            </td>
                            <td className="py-2 px-3 text-[#293681] font-semibold">
                              {w.twitter || '—'}
                            </td>
                            <td className="py-2 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleRemoveWinner(idx)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                                title="Remove winner"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Automated Telegram Broadcast Badge */}
              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[#0088cc] text-white flex items-center justify-center shrink-0">
                    <Send size={15} />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-xs flex items-center gap-1.5">
                      <span>Automatic Telegram Notification</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono-dm font-bold uppercase">Active</span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      Announcements will automatically post to your community group upon publishing.
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-200">
                <button
                  type="button"
                  disabled={savingWinners || parsedWinnersList.length === 0}
                  onClick={handleSaveAndPublishWinners}
                  className="flex-1 bg-[#16a34a] hover:bg-[#15803d] disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl transition-all text-sm shadow-sm flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} />
                  <span>{savingWinners ? 'Publishing Winners...' : `Save & Publish ${parsedWinnersList.length} Winners Live`}</span>
                </button>

                <button
                  type="button"
                  onClick={() => exportCsv(managingWinnersRaffle, 'winners')}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors text-xs font-semibold border border-gray-200 flex items-center justify-center gap-1.5"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>

                <button
                  type="button"
                  onClick={() => setManagingWinnersRaffle(null)}
                  className="px-5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl transition-colors text-xs font-medium border border-gray-200 py-3"
                >
                  Cancel
                </button>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
