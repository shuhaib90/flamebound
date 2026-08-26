'use client';

import React, { useState, useEffect } from 'react';
import { Raffle, HolderVerificationResult } from '@/lib/types';
import { useWallet } from '@/lib/wallet-context';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatAddress, FLAMEBOUND_PRIMARY_CONTRACT } from '@/lib/blockchain';
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
  const { address, isConnected, holderStatus, isVerifyingHolder, checkHolderEligibility } = useWallet();

  // Unified single Twitter/X handle
  const [twitterHandle, setTwitterHandle] = useState('');
  const [handleConfirmed, setHandleConfirmed] = useState(false);

  // 5 Simple Checklist Tasks
  const [tasks, setTasks] = useState({
    handleLinked: false,
    followPartner: false,
    followFlamebound: false,
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

  // Sync holder status into Task automatically
  useEffect(() => {
    if (holderStatus && holderStatus.isHolder) {
      setTasks(prev => ({ ...prev, holderCheck: true }));
      setError(null);
    } else if (holderStatus && !holderStatus.isHolder && isConnected) {
      setTasks(prev => ({ ...prev, holderCheck: false }));
      setError(holderStatus.message || 'Your wallet does not currently hold a Flamebound NFT.');
    }
  }, [holderStatus, isConnected]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setEntryReceipt(null);
      setError(null);
    }
  }, [isOpen, raffle]);

  if (!isOpen || !raffle) return null;

  const projectName = raffle.project || 'FLAMEBOUND';

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
    const target = raffle.followUrl || raffle.twitterUrl || 'https://x.com/FlameboundNft';
    window.open(target, '_blank');
    setTasks(prev => ({ ...prev, followPartner: true }));
  };

  // Follow Flamebound (Second)
  const handleFollowFlamebound = () => {
    window.open('https://x.com/FlameboundNft', '_blank');
    setTasks(prev => ({ ...prev, followFlamebound: true }));
  };

  // Engage Task
  const handleEngageTask = () => {
    const target = raffle.engageUrl || raffle.twitterUrl || 'https://x.com/FlameboundNft';
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
      setError(res?.message || 'Your wallet does not currently hold a Flamebound NFT.');
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

      setEntryReceipt(data.entry);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#A6FF00', '#000000', '#FFFFFF'],
      });

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 select-none overflow-y-auto">
      <div className="bg-white border-4 border-black shadow-pixel-xl w-full max-w-2xl my-auto relative animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="bg-lime border-b-4 border-black p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3 truncate">
            {raffle.logoUrl ? (
              <img src={raffle.logoUrl} alt={projectName} className="w-8 h-8 object-contain shrink-0 drop-shadow-sm" />
            ) : (
              <img src="/images/flamebound-logo.png" alt="Flamebound" className="w-8 h-8 object-contain shrink-0 drop-shadow-sm" />
            )}
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="font-pixel text-[9px] bg-black text-lime px-2 py-0.5 font-bold uppercase">
                  {projectName}
                </span>
                <span className="font-pixel text-[9px] bg-white text-black px-2 py-0.5 border border-black font-bold">
                  {raffle.type || 'WL RAFFLE'}
                </span>
              </div>
              <h2 className="font-pixel text-base sm:text-lg text-black font-bold uppercase mt-1 truncate">
                {raffle.title}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 border-2 border-black bg-black text-lime hover:bg-white hover:text-black transition-colors shrink-0"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto font-mono text-xs">
          
          {/* SUCCESS RECEIPT STATE */}
          {entryReceipt ? (
            <div className="space-y-6 py-4">
              <div className="bg-lime border-4 border-black p-6 text-center space-y-3 shadow-pixel">
                <div className="inline-block p-3 bg-black text-lime mb-1">
                  <CheckCircle size={36} />
                </div>
                <h3 className="font-pixel text-base sm:text-lg font-bold text-black uppercase">
                  WHITELIST ENTRY CONFIRMED!
                </h3>
                <p className="font-mono text-xs text-black font-bold max-w-md mx-auto">
                  Your on-chain Flamebound holder status was verified. Your wallet is officially enrolled into this whitelist raffle!
                </p>
              </div>

              {/* Receipt Specs Card */}
              <div className="bg-black text-lime border-4 border-black p-5 space-y-3 shadow-pixel-sm">
                <div className="flex items-center justify-between border-b-2 border-lime/30 pb-2">
                  <span className="font-pixel text-[10px] text-white">ENTRY TICKET ID:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-pixel text-sm font-bold text-lime tracking-wider select-all">
                      {entryReceipt.id}
                    </span>
                    <button
                      onClick={copyReceiptId}
                      className="p-1 bg-lime text-black border border-black hover:bg-white transition-colors"
                      title="Copy Entry ID"
                    >
                      {copied ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  <div>
                    <span className="text-gray-300 block text-[10px]">REGISTERED WALLET:</span>
                    <span className="font-mono font-bold text-white select-all break-all">
                      {entryReceipt.walletAddress}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-300 block text-[10px]">VERIFIED HOLDINGS:</span>
                    <span className="font-mono font-bold text-lime">
                      {entryReceipt.tokenBalance} Flamebound NFT(s)
                    </span>
                  </div>
                </div>

                {twitterHandle && (
                  <div className="pt-1 border-t border-lime/20 flex justify-between">
                    <span className="text-gray-300 text-[10px]">X / TWITTER USERNAME:</span>
                    <span className="font-bold text-white">@{twitterHandle.replace('@', '')}</span>
                  </div>
                )}
              </div>

              <button
                onClick={onClose}
                className="w-full pixel-btn text-xs py-3.5 shadow-pixel"
              >
                [DONE / RETURN TO RAFFLES]
              </button>
            </div>
          ) : (
            /* SIMPLE CLEAN ENTRY FORM */
            <>
              {/* NFT Collection Specs Drawer */}
              <div className="bg-lime/15 border-3 border-black p-3.5 space-y-2">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
                  <div>
                    <span className="text-[9px] font-pixel text-gray-700 block font-bold">WL SPOTS:</span>
                    <span className="font-pixel text-xs text-black font-bold">{raffle.supply} SPOTS</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-pixel text-gray-700 block font-bold">TOTAL SUPPLY:</span>
                    <span className="font-bold text-black">{raffle.nftTotalSupply || 'TBA'}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-pixel text-gray-700 block font-bold">MINT PRICE:</span>
                    <span className="font-bold text-black bg-white px-1 border border-black inline-block">
                      {raffle.mintPrice || 'FREE'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-pixel text-gray-700 block font-bold">MINT DATE:</span>
                    <span className="font-bold text-black truncate">{raffle.mintDate || 'TBA'}</span>
                  </div>
                </div>

                <div className="border-t border-black/20 pt-2 flex flex-wrap justify-between gap-2 text-[11px] text-gray-800 font-bold">
                  <span>MAX MINT: {raffle.maxMintPerWallet || '1 PER WL'}</span>
                  <span>NETWORK: [{raffle.customNetwork || raffle.network || 'ROBINHOOD NETWORK'}]</span>
                  <span className="text-black">ELIGIBILITY: FLAMEBOUND HOLDERS ONLY</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between items-center font-pixel text-[10px] uppercase font-bold text-black">
                  <span>{completedCount}/{totalTasks} REQUIREMENTS COMPLETED</span>
                  <span>{progressPercent.toFixed(0)}%</span>
                </div>
                <div className="h-3.5 bg-black border-2 border-black p-0.5">
                  <div
                    className="h-full bg-lime transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Error Notification */}
              {error && (
                <div className="bg-red-500 text-white border-3 border-black p-2.5 font-mono text-xs flex items-center gap-2 shadow-pixel-sm font-bold">
                  <ShieldAlert size={16} className="shrink-0" />
                  <div className="flex-1 text-[11px]">
                    {error}
                  </div>
                </div>
              )}

              {/* CHECKLIST ITEMS */}
              <div className="space-y-2.5 pt-1">
                
                {/* 1. SEPARATE DEDICATED BOX: YOUR X HANDLE */}
                <div className={`border-3 border-black p-3 transition-colors ${
                  tasks.handleLinked ? 'bg-lime/25' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <AtSign size={15} className="text-black" />
                    <span className="font-pixel text-[11px] font-bold text-black uppercase">
                      YOUR X (TWITTER) HANDLE
                    </span>
                  </div>

                  <form onSubmit={handleSaveHandle} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter your X handle (e.g. @yourhandle)"
                      value={twitterHandle}
                      onChange={(e) => {
                        setTwitterHandle(e.target.value);
                        setHandleConfirmed(false);
                        setTasks(prev => ({ ...prev, handleLinked: false }));
                      }}
                      className="flex-1 bg-lime/15 border-2 border-black p-2 text-xs font-mono font-bold outline-none"
                    />
                    <button
                      type="submit"
                      className={`pixel-btn text-[10px] py-2 px-3 shrink-0 ${
                        tasks.handleLinked ? 'bg-black text-lime' : ''
                      }`}
                    >
                      {tasks.handleLinked ? '✓ LINKED' : '[CONFIRM HANDLE]'}
                    </button>
                  </form>
                </div>

                {/* 2. FOLLOW ( {PROJECT_NAME} ) - FIRST */}
                <div className={`border-3 border-black p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.followPartner ? 'bg-lime/25' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-2">
                    <Twitter size={15} className="text-black shrink-0" />
                    <span className="font-pixel text-[11px] font-bold text-black uppercase">
                      FOLLOW ( {projectName} )
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFollowPartner}
                    className={`pixel-btn text-[10px] py-2 px-3.5 flex items-center gap-1.5 shrink-0 ${
                      tasks.followPartner ? 'bg-black text-lime' : ''
                    }`}
                  >
                    {tasks.followPartner ? (
                      <>
                        <Check size={12} />
                        <span>[FOLLOWED]</span>
                      </>
                    ) : (
                      <>
                        <span>[FOLLOW @{projectName.toUpperCase()}]</span>
                        <ExternalLink size={11} />
                      </>
                    )}
                  </button>
                </div>

                {/* 3. FOLLOW ( FLAMEBOUND ) - SECOND */}
                <div className={`border-3 border-black p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.followFlamebound ? 'bg-lime/25' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-2">
                    <Twitter size={15} className="text-black shrink-0" />
                    <span className="font-pixel text-[11px] font-bold text-black uppercase">
                      FOLLOW ( FLAMEBOUND )
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFollowFlamebound}
                    className={`pixel-btn text-[10px] py-2 px-3.5 flex items-center gap-1.5 shrink-0 ${
                      tasks.followFlamebound ? 'bg-black text-lime' : ''
                    }`}
                  >
                    {tasks.followFlamebound ? (
                      <>
                        <Check size={12} />
                        <span>[FOLLOWED]</span>
                      </>
                    ) : (
                      <>
                        <span>[FOLLOW @FLAMEBOUNDNFT]</span>
                        <ExternalLink size={11} />
                      </>
                    )}
                  </button>
                </div>

                {/* 4. ENGAGE WITH {PROJECT_NAME} */}
                <div className={`border-3 border-black p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.engage ? 'bg-lime/25' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-2">
                    <MessageSquare size={15} className="text-black shrink-0" />
                    <span className="font-pixel text-[11px] font-bold text-black uppercase">
                      ENGAGE WITH {projectName}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleEngageTask}
                    className={`pixel-btn text-[10px] py-2 px-3.5 flex items-center gap-1.5 shrink-0 ${
                      tasks.engage ? 'bg-black text-lime' : ''
                    }`}
                  >
                    {tasks.engage ? (
                      <>
                        <Check size={12} />
                        <span>[DONE]</span>
                      </>
                    ) : (
                      <>
                        <span>[VIEW POST]</span>
                        <ExternalLink size={11} />
                      </>
                    )}
                  </button>
                </div>

                {/* 5. CONNECT EVM WALLET */}
                <div className={`border-3 border-black p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.wallet ? 'bg-lime/25' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-2 truncate">
                    <Wallet size={15} className="text-black shrink-0" />
                    <span className="font-pixel text-[11px] font-bold text-black uppercase truncate">
                      {isConnected && address ? `WALLET: ${formatAddress(address)}` : 'CONNECT EVM WALLET'}
                    </span>
                  </div>

                  <div className="shrink-0">
                    <ConnectButton.Custom>
                      {({ account, openConnectModal, openAccountModal, mounted }) => {
                        if (!mounted) return null;
                        if (!account) {
                          return (
                            <button
                              type="button"
                              onClick={openConnectModal}
                              className="pixel-btn text-[10px] py-2 px-3"
                            >
                              [CONNECT]
                            </button>
                          );
                        }
                        return (
                          <span className="font-pixel text-[9px] bg-black text-lime px-2.5 py-1.5 border border-black font-bold inline-block">
                            ✓ LINKED
                          </span>
                        );
                      }}
                    </ConnectButton.Custom>
                  </div>
                </div>

                {/* 6. ON-CHAIN HOLDER STATUS */}
                <div className={`border-3 border-black p-3 flex items-center justify-between gap-2 transition-colors ${
                  tasks.holderCheck ? 'bg-lime/25' : 'bg-white'
                }`}>
                  <div className="flex items-center gap-2 truncate">
                    <Flame size={15} className="text-black shrink-0" />
                    <span className="font-pixel text-[11px] font-bold text-black uppercase truncate">
                      {holderStatus && holderStatus.isHolder 
                        ? `HOLDER VERIFIED (${holderStatus.tokenBalance} NFT)`
                        : 'FLAMEBOUND HOLDER CHECK'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunHolderCheck}
                    disabled={isVerifyingHolder || !isConnected}
                    className={`pixel-btn text-[10px] py-2 px-3 flex items-center gap-1.5 shrink-0 ${
                      !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                    } ${tasks.holderCheck ? 'bg-black text-lime' : ''}`}
                  >
                    <span>
                      {isVerifyingHolder 
                        ? 'CHECKING...' 
                        : tasks.holderCheck 
                        ? '✓ VERIFIED' 
                        : '[VERIFY HOLDER]'}
                    </span>
                  </button>
                </div>

              </div>

              {/* Submit Whitelist Entry CTA */}
              <div className="pt-2 border-t-3 border-black">
                <button
                  type="button"
                  onClick={handleSubmitEntry}
                  disabled={!allTasksCompleted || loading}
                  className={`w-full py-4 font-pixel text-xs tracking-wider uppercase font-bold transition-all shadow-pixel ${
                    allTasksCompleted && !loading
                      ? 'bg-black text-lime hover:bg-black/90 cursor-pointer'
                      : 'bg-gray-300 text-gray-600 border-3 border-black cursor-not-allowed opacity-75'
                  }`}
                >
                  {loading 
                    ? 'CONFIRMING ON-CHAIN ENTRY...' 
                    : allTasksCompleted 
                    ? '[★ SUBMIT WHITELIST ENTRY ★]' 
                    : `[COMPLETE ALL REQUIREMENTS TO ENTER (${completedCount}/${totalTasks})]`}
                </button>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
}
