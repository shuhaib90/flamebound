'use client';

import React, { useState, useEffect } from 'react';
import { Raffle, HolderVerificationResult } from '@/lib/types';
import { useWallet } from '@/lib/wallet-context';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatAddress, DOTSET_PRIMARY_CONTRACT } from '@/lib/blockchain';
import { PixelFlame } from './PixelFlame';
import confetti from 'canvas-confetti';
import { 
  X, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle, 
  Copy, 
  Check, 
  Flame, 
  MessageSquare, 
  Twitter, 
  Wallet,
  AtSign
} from 'lucide-react';

interface RaffleModalProps {
  raffle: Raffle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function RaffleModal({ raffle, isOpen, onClose, onSuccess }: RaffleModalProps) {
  const { address, shortAddress, isConnected, holderStatus, isVerifyingHolder, checkHolderEligibility } = useWallet();

  // Unified single Twitter/X handle
  const [twitterHandle, setTwitterHandle] = useState('');
  const [handleConfirmed, setHandleConfirmed] = useState(false);

  // 6 Simple Checklist Tasks
  const [tasks, setTasks] = useState({
    handleLinked: false,
    followPartner: false,
    followDOTSET: false,
    engage: false,
    wallet: false,
    holderCheck: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [entryReceipt, setEntryReceipt] = useState<{
    id: string;
    walletAddress: string;
    tokenBalance: number;
    verifiedAt: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync wallet connection into Task automatically
  useEffect(() => {
    if (isConnected && address) {
      setTasks(prev => ({ ...prev, wallet: true }));
      if (raffle) {
        checkHolderEligibility(raffle.contractAddress, raffle.network);
      }
    } else {
      setTasks(prev => ({ ...prev, wallet: false, holderCheck: false }));
    }
  }, [isConnected, address, raffle]);

  // Sync minter status into Task automatically
  useEffect(() => {
    if (holderStatus && holderStatus.isHolder) {
      setTasks(prev => ({ ...prev, holderCheck: true }));
      setError(null);
    } else if (holderStatus && !holderStatus.isHolder && isConnected) {
      setTasks(prev => ({ ...prev, holderCheck: false }));
      setError(holderStatus.message || 'Your wallet is not a verified minter for DOTSET.');
    }
  }, [holderStatus, isConnected]);

  // Check and restore existing entry from database & local cache
  useEffect(() => {
    if (!isOpen || !raffle) return;

    const checkExistingEntry = async () => {
      if (address) {
        // 1. Instant local cache restore
        const cached = localStorage.getItem(`flamebound_entry_${raffle.id}_${address.toLowerCase()}`);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed && parsed.id) {
              setEntryReceipt(parsed);
              if (parsed.twitterUsername) setTwitterHandle(parsed.twitterUsername);
              setTasks({ handleLinked: true, followPartner: true, followDOTSET: true, engage: true, wallet: true, holderCheck: true });
            }
          } catch (e) {}
        }

        // 2. Fetch from DB
        try {
          const res = await fetch(`/api/raffles/${raffle.id}?wallet=${encodeURIComponent(address)}`);
          const data = await res.json();
          if (data.success && data.userEntry) {
            setEntryReceipt(data.userEntry);
            if (data.userEntry.twitterUsername) setTwitterHandle(data.userEntry.twitterUsername);
            setTasks({ handleLinked: true, followPartner: true, followDOTSET: true, engage: true, wallet: true, holderCheck: true });
            localStorage.setItem(`flamebound_entry_${raffle.id}_${address.toLowerCase()}`, JSON.stringify(data.userEntry));
          }
        } catch (e) {}
      }
    };

    checkExistingEntry();
  }, [isOpen, raffle, address]);

  if (!isOpen || !raffle) return null;

  const projectName = raffle.project || 'DOTSET';

  // Handle Box submission
  const handleSaveHandle = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanHandle = twitterHandle.trim().replace(/^@/, '');
    if (!cleanHandle) {
      setError('Please enter your X / Twitter handle');
      return;
    }
    setError(null);
    setHandleConfirmed(true);
    setTasks(prev => ({ ...prev, handleLinked: true }));
  };

  // Follow Partner Project (First)
  const handleFollowPartner = () => {
    const target = raffle.followUrl || raffle.twitterUrl || 'https://x.com/DOTSETNft';
    window.open(target, '_blank');
    setTasks(prev => ({ ...prev, followPartner: true }));
  };

  // Follow DOTSET (Second)
  const handleFollowDOTSET = () => {
    window.open('https://x.com/DOTSETNft', '_blank');
    setTasks(prev => ({ ...prev, followDOTSET: true }));
  };

  // Engage Task
  const handleEngageTask = () => {
    const target = raffle.engageUrl || raffle.twitterUrl || 'https://x.com/DOTSETNft';
    window.open(target, '_blank');
    setTasks(prev => ({ ...prev, engage: true }));
  };

  // Run On-Chain Holder Check
  const handleRunHolderCheck = async () => {
    if (!isConnected || !address) {
      setError('Please connect your Web3 wallet first using RainbowKit.');
      return;
    }

    const res = await checkHolderEligibility(raffle.contractAddress, raffle.network);
    if (res && res.isHolder) {
      setTasks(prev => ({ ...prev, holderCheck: true }));
      setError(null);
    } else {
      setTasks(prev => ({ ...prev, holderCheck: false }));
      setError(res?.message || 'Your wallet does not currently hold a DOTSET NFT.');
    }
  };

  const completedCount = Object.values(tasks).filter(Boolean).length;
  const totalTasks = 6;
  const progressPercent = (completedCount / totalTasks) * 100;
  const allTasksCompleted = completedCount === totalTasks;

  const handleSubmitEntry = async () => {
    if (!allTasksCompleted || !address) {
      setError('Please complete all checklist requirements before submitting.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/raffles/${raffle.id}/enter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          twitterUsername: twitterHandle.trim().replace(/^@/, ''),
          taskStatus: tasks,
          contractAddress: raffle.contractAddress,
          network: raffle.customNetwork || raffle.network,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to submit raffle entry.');
      }

      if (data.entry) {
        setEntryReceipt(data.entry);
        if (address) {
          localStorage.setItem(`flamebound_entry_${raffle.id}_${address.toLowerCase()}`, JSON.stringify(data.entry));
        }
      }

      if (!data.isExisting) {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#A6FF00', '#000000', '#FFFFFF'],
        });
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Submission error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const copyReceiptId = () => {
    if (!entryReceipt) return;
    navigator.clipboard.writeText(entryReceipt.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 select-none overflow-y-auto w-full">
      <div className="bg-white border-3 sm:border-4 border-black w-full max-w-[96vw] sm:max-w-xl md:max-w-2xl my-auto relative animate-in fade-in zoom-in-95 duration-150 overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-black border-b-3 sm:border-b-4 border-black p-3 sm:p-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {raffle.logoUrl ? (
              <img src={raffle.logoUrl} alt={projectName} className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow-sm" />
            ) : (
              <img src="/images/flamebound-logo.png" alt="DOTSET" className="w-7 h-7 sm:w-8 sm:h-8 object-contain shrink-0 drop-shadow-sm" />
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-pixel text-[8px] sm:text-[9px] bg-black text-white px-1.5 py-0.5 font-bold uppercase truncate">
                  {projectName}
                </span>
                <span className="font-pixel text-[8px] sm:text-[9px] bg-white text-black px-1.5 py-0.5 border border-black font-bold">
                  {raffle.type || 'WL RAFFLE'}
                </span>
              </div>
              <h2 className="font-pixel text-xs sm:text-base text-black font-bold uppercase mt-1 truncate">
                {raffle.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 border-2 border-black bg-black text-white hover:bg-white hover:text-black transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-3 sm:p-5 space-y-3 max-h-[82vh] overflow-y-auto font-mono text-xs overflow-x-hidden">
          
          {/* SUCCESS RECEIPT STATE */}
          {entryReceipt ? (
            <div className="space-y-4 sm:space-y-6 py-2">
              <div className="bg-black border-3 sm:border-4 border-black p-4 sm:p-6 text-center space-y-2.5">
                <div className="inline-block p-2.5 bg-black text-white mb-1">
                  <CheckCircle size={32} />
                </div>
                <h3 className="font-pixel text-sm sm:text-lg font-bold text-black uppercase">
                  WHITELIST ENTRY CONFIRMED!
                </h3>
                <p className="font-mono text-[11px] sm:text-xs text-black font-bold max-w-md mx-auto">
                  Your on-chain DOTSET minter status was verified. Your wallet is officially enrolled into this whitelist raffle!
                </p>
              </div>

              {/* Receipt Specs Card */}
              <div className="bg-black text-white border-3 sm:border-4 border-black p-3.5 sm:p-5 space-y-2.5">
                <div className="flex items-center justify-between border-b-2 border-white/30 pb-2">
                  <span className="font-pixel text-[9px] sm:text-[10px] text-white">ENTRY TICKET ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-xs sm:text-sm font-bold text-white tracking-wider select-all">
                      {entryReceipt.id}
                    </span>
                    <button
                      onClick={copyReceiptId}
                      className="p-1 bg-black text-black border border-black hover:bg-white transition-colors"
                      title="Copy Entry ID"
                    >
                      {copied ? <Check size={13} /> : <Copy size={13} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-gray-300 block text-[9px] sm:text-[10px]">REGISTERED WALLET:</span>
                    <span className="font-mono font-bold text-white select-all break-all text-[11px] sm:text-xs">
                      {entryReceipt.walletAddress}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300 block text-[9px] sm:text-[10px]">VERIFIED MINTS:</span>
                    <span className="font-mono font-bold text-white text-[11px] sm:text-xs">
                      {entryReceipt.tokenBalance} DOTSET NFT(s)
                    </span>
                  </div>
                </div>

                {twitterHandle && (
                  <div className="pt-1 border-t border-white/20 flex justify-between text-[11px] sm:text-xs">
                    <span className="text-gray-300 text-[9px] sm:text-[10px]">X / TWITTER USERNAME:</span>
                    <span className="font-bold text-white">@{twitterHandle.replace('@', '')}</span>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full pixel-btn text-xs py-3"
              >
                [DONE / RETURN TO RAFFLES]
              </button>
            </div>
          ) : (
            /* SIMPLE CLEAN ENTRY FORM */
            <>
              {/* NFT Collection Specs Drawer */}
              <div className="bg-gray-100 border-2 sm:border-3 border-black p-2.5 sm:p-3.5 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px] sm:text-xs">
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-pixel text-gray-700 block font-bold">WL SPOTS:</span>
                    <span className="font-pixel text-[11px] sm:text-xs text-black font-bold">{raffle.supply} SPOTS</span>
                  </div>
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-pixel text-gray-700 block font-bold">TOTAL SUPPLY:</span>
                    <span className="font-bold text-black">{raffle.nftTotalSupply || 'TBA'}</span>
                  </div>
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-pixel text-gray-700 block font-bold">MINT PRICE:</span>
                    <span className="font-bold text-black bg-white px-1 border border-black inline-block">
                      {raffle.mintPrice || 'FREE'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[8px] sm:text-[9px] font-pixel text-gray-700 block font-bold">MINT DATE:</span>
                    <span className="font-bold text-black truncate block">{raffle.mintDate || 'TBA'}</span>
                  </div>
                </div>

                <div className="border-t border-black/20 pt-1.5 flex flex-wrap justify-between gap-1.5 text-[10px] sm:text-[11px] text-gray-800 font-bold">
                  <span>MAX: {raffle.maxMintPerWallet || '1 PER WL'}</span>
                  <span>[{raffle.customNetwork || raffle.network || 'ROBINHOOD NETWORK'}]</span>
                  <span className="text-black">MINTERS ONLY</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center font-pixel text-[9px] sm:text-[10px] uppercase font-bold text-black">
                  <span>{completedCount}/{totalTasks} REQUIREMENTS COMPLETED</span>
                  <span>{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="h-3 sm:h-3.5 bg-black border-2 border-black p-0.5">
                  <div
                    className="h-full bg-black transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="bg-red-500 text-white border-2 sm:border-3 border-black p-2 font-mono text-xs flex items-center gap-2 font-bold">
                  <ShieldAlert size={15} className="shrink-0" />
                  <div className="flex-1 text-[10px] sm:text-[11px]">
                    {error}
                  </div>
                </div>
              )}

              {/* CHECKLIST ITEMS (RESPONSIVE) */}
              <div className="space-y-2 pt-0.5">
                
                {/* 1. SEPARATE DEDICATED BOX: YOUR X HANDLE */}
                <div className={`border-2 sm:border-3 border-black p-2.5 sm:p-3 transition-colors ${
                  tasks.handleLinked ? 'bg-gray-100' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <AtSign size={14} className="text-black shrink-0" />
                    <span className="font-pixel text-[10px] sm:text-[11px] font-bold text-black uppercase truncate">
                      YOUR X (TWITTER) HANDLE
                    </span>
                  </div>

                  <form onSubmit={handleSaveHandle} className="flex flex-col sm:flex-row gap-1.5 sm:gap-2">
                    <input
                      type="text"
                      placeholder="Enter handle (e.g. @yourhandle)"
                      value={twitterHandle}
                      onChange={(e) => {
                        setTwitterHandle(e.target.value);
                        setHandleConfirmed(false);
                        setTasks(prev => ({ ...prev, handleLinked: false }));
                      }}
                      className="w-full sm:flex-1 bg-gray-100 border-2 border-black p-2 text-xs font-mono font-bold outline-none min-w-0"
                    />
                    <button
                      type="submit"
                      className={`pixel-btn text-[9px] sm:text-[10px] py-2 px-3 shrink-0 text-center ${
                        tasks.handleLinked ? 'bg-black text-white' : ''
                      }`}
                    >
                      {tasks.handleLinked ? '✓ LINKED' : '[CONFIRM HANDLE]'}
                    </button>
                  </form>
                </div>

                {/* 2. FOLLOW ( {PROJECT_NAME} ) - FIRST */}
                <div className={`border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.followPartner ? 'bg-gray-100' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <Twitter size={14} className="text-black shrink-0" />
                    <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                      FOLLOW ({projectName})
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFollowPartner}
                    className={`pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3.5 flex items-center gap-1 shrink-0 ${
                      tasks.followPartner ? 'bg-black text-white' : ''
                    }`}
                  >
                    {tasks.followPartner ? (
                      <>
                        <Check size={11} />
                        <span>[FOLLOWED]</span>
                      </>
                    ) : (
                      <>
                        <span className="sm:hidden">[FOLLOW]</span>
                        <span className="hidden sm:inline">[FOLLOW @{projectName.toUpperCase()}]</span>
                        <ExternalLink size={10} />
                      </>
                    )}
                  </button>
                </div>

                {/* 3. FOLLOW ( DOTSET ) - SECOND */}
                <div className={`border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.followDOTSET ? 'bg-gray-100' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <Twitter size={14} className="text-black shrink-0" />
                    <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                      FOLLOW (DOTSET)
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFollowDOTSET}
                    className={`pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3.5 flex items-center gap-1 shrink-0 ${
                      tasks.followDOTSET ? 'bg-black text-white' : ''
                    }`}
                  >
                    {tasks.followDOTSET ? (
                      <>
                        <Check size={11} />
                        <span>[FOLLOWED]</span>
                      </>
                    ) : (
                      <>
                        <span className="sm:hidden">[FOLLOW]</span>
                        <span className="hidden sm:inline">[FOLLOW @DOTSETNFT]</span>
                        <ExternalLink size={10} />
                      </>
                    )}
                  </button>
                </div>

                {/* 4. ENGAGE WITH {PROJECT_NAME} */}
                <div className={`border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.engage ? 'bg-gray-100' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <MessageSquare size={14} className="text-black shrink-0" />
                    <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                      ENGAGE WITH POST
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleEngageTask}
                    className={`pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3.5 flex items-center gap-1 shrink-0 ${
                      tasks.engage ? 'bg-black text-white' : ''
                    }`}
                  >
                    {tasks.engage ? (
                      <>
                        <Check size={11} />
                        <span>[DONE]</span>
                      </>
                    ) : (
                      <>
                        <span>[VIEW POST]</span>
                        <ExternalLink size={10} />
                      </>
                    )}
                  </button>
                </div>

                {/* 5. CONNECT EVM WALLET */}
                <div className={`border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.wallet ? 'bg-gray-100' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <Wallet size={14} className="text-black shrink-0" />
                    <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                      {isConnected && address ? `WALLET: ${shortAddress}` : 'CONNECT WALLET'}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <ConnectButton.Custom>
                      {({ account, openConnectModal, mounted }) => {
                        if (!mounted) return null;
                        if (!account) {
                          return (
                            <button
                              type="button"
                              onClick={openConnectModal}
                              className="pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3"
                            >
                              [CONNECT]
                            </button>
                          );
                        }
                        return (
                          <span className="font-pixel text-[8px] sm:text-[9px] bg-black text-white px-2 py-1 border border-black font-bold inline-block">
                            ✓ LINKED
                          </span>
                        );
                      }}
                    </ConnectButton.Custom>
                  </div>
                </div>

                {/* 6. ON-CHAIN MINTER STATUS */}
                <div className={`border-2 sm:border-3 border-black p-2.5 sm:p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.holderCheck ? 'bg-gray-100' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <Flame size={14} className="text-black shrink-0" />
                    <span className="font-pixel text-[9px] sm:text-[11px] font-bold text-black uppercase truncate">
                      {holderStatus && holderStatus.isHolder 
                        ? `VERIFIED MINTER (${holderStatus.tokenBalance} NFT)`
                        : 'MINTER CHECK'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunHolderCheck}
                    disabled={isVerifyingHolder || !isConnected}
                    className={`pixel-btn text-[9px] sm:text-[10px] py-1.5 sm:py-2 px-2.5 sm:px-3 flex items-center gap-1 shrink-0 ${
                      !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                    } ${tasks.holderCheck ? 'bg-black text-white' : ''}`}
                  >
                    <span>
                      {isVerifyingHolder 
                        ? 'CHECKING...' 
                        : tasks.holderCheck 
                        ? '✓ VERIFIED' 
                        : '[VERIFY MINTER]'}
                    </span>
                  </button>
                </div>

              </div>

              {/* Submit Whitelist Entry CTA */}
              <div className="pt-2 border-t-2 sm:border-t-3 border-black">
                <button
                  type="button"
                  onClick={handleSubmitEntry}
                  disabled={!allTasksCompleted || loading}
                  className={`w-full py-3 sm:py-4 px-2 font-pixel text-[10px] sm:text-xs tracking-wider uppercase font-bold transition-all text-center ${
                    allTasksCompleted && !loading
                      ? 'bg-black text-white hover:bg-black/90 cursor-pointer shadow-none sm:shadow-pixel'
                      : 'bg-gray-300 text-gray-600 border-2 sm:border-3 border-black cursor-not-allowed opacity-75'
                  }`}
                >
                  {loading 
                    ? 'CONFIRMING ENTRY...' 
                    : allTasksCompleted 
                    ? '[★ SUBMIT WHITELIST ENTRY ★]' 
                    : `[COMPLETE REQUIREMENTS (${completedCount}/${totalTasks})]`}
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}

