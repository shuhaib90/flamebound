'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Download, Share2, Check, Sparkles, X, ExternalLink, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface EntryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  raffle: {
    id: string;
    title: string;
    project: string;
    imageUrl?: string;
    bannerUrl?: string;
    network?: string;
    entryMethod?: string;
    supply?: string | number;
    mintDate?: string;
  };
  entryReceipt: {
    id: string;
    walletAddress: string;
    twitterUsername?: string;
    verifiedAt: string;
  };
  autoDownload?: boolean;
}

export function EntryCardModal({
  isOpen,
  onClose,
  raffle,
  entryReceipt,
  autoDownload = false,
}: EntryCardModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setGenerating(true);

    const generateCard = async () => {
      try {
        const canvas = document.createElement('canvas');
        const W = 1024;
        const H = 576;
        canvas.width = W;
        canvas.height = H;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // 1. Load Background Template
        const bgImg = new Image();
        bgImg.crossOrigin = 'anonymous';
        await new Promise((resolve) => {
          bgImg.onload = resolve;
          bgImg.onerror = resolve;
          bgImg.src = '/partnership-template.png';
        });

        if (bgImg.complete && bgImg.naturalWidth > 0) {
          ctx.drawImage(bgImg, 0, 0, W, H);
        } else {
          // Fallback background
          const grad = ctx.createLinearGradient(0, 0, W, H);
          grad.addColorStop(0, '#0a0d18');
          grad.addColorStop(1, '#020408');
          ctx.fillStyle = grad;
          ctx.fillRect(0, 0, W, H);
        }

        // 2. Project Box Coordinates on Template (Right Box)
        const boxX = 595;
        const boxY = 169;
        const boxW = 251;
        const boxH = 251;
        const boxR = 38;

        // Helper for rounded rectangle path
        const drawRoundedRect = (x: number, y: number, w: number, h: number, r: number) => {
          ctx.beginPath();
          ctx.moveTo(x + r, y);
          ctx.lineTo(x + w - r, y);
          ctx.quadraticCurveTo(x + w, y, x + w, y + r);
          ctx.lineTo(x + w, y + h - r);
          ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
          ctx.lineTo(x + r, y + h);
          ctx.quadraticCurveTo(x, y + h, x, y + h - r);
          ctx.lineTo(x, y + r);
          ctx.quadraticCurveTo(x, y, x + r, y);
          ctx.closePath();
        };

        // Clip & Draw Project Image
        ctx.save();
        drawRoundedRect(boxX, boxY, boxW, boxH, boxR);
        ctx.clip();

        // Background fill for project box
        ctx.fillStyle = '#0b0f19';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        let imageLoaded = false;
        if (raffle.imageUrl) {
          const projImg = new Image();
          projImg.crossOrigin = 'anonymous';
          await new Promise((resolve) => {
            projImg.onload = () => { imageLoaded = true; resolve(true); };
            projImg.onerror = () => { imageLoaded = false; resolve(false); };
            projImg.src = raffle.imageUrl!;
          });

          if (imageLoaded && projImg.naturalWidth > 0) {
            // Draw image cover
            const imgAspect = projImg.naturalWidth / projImg.naturalHeight;
            const boxAspect = boxW / boxH;
            let drawW = boxW, drawH = boxH, drawX = boxX, drawY = boxY;

            if (imgAspect > boxAspect) {
              drawW = boxH * imgAspect;
              drawX = boxX - (drawW - boxW) / 2;
            } else {
              drawH = boxW / imgAspect;
              drawY = boxY - (drawH - boxH) / 2;
            }

            ctx.drawImage(projImg, drawX, drawY, drawW, drawH);
          }
        }

        // If no image or image failed, render custom futuristic project badge
        if (!imageLoaded) {
          const grad = ctx.createLinearGradient(boxX, boxY, boxX + boxW, boxY + boxH);
          grad.addColorStop(0, '#1e293b');
          grad.addColorStop(1, '#0f172a');
          ctx.fillStyle = grad;
          ctx.fillRect(boxX, boxY, boxW, boxH);

          // Project initial or monogram
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 72px "Space Grotesk", "Syne", sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText((raffle.project || 'P').slice(0, 2).toUpperCase(), boxX + boxW / 2, boxY + boxH / 2);
        }

        // Inner border highlight
        ctx.restore();
        ctx.save();
        drawRoundedRect(boxX, boxY, boxW, boxH, boxR);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.restore();

        // 3. OVERLAY TEXT & HUD ELEMENTS (Futuristic Space / Cyber Theme)
        const projectName = (raffle.project || raffle.title || 'PROJECT').toUpperCase();
        const rawHandle = entryReceipt.twitterUsername ? `@${entryReceipt.twitterUsername.replace(/^@/, '')}` : '';
        const shortWallet = entryReceipt.walletAddress 
          ? `${entryReceipt.walletAddress.slice(0, 6)}...${entryReceipt.walletAddress.slice(-4)}`
          : '';

        // HUD Banner pill in bottom area
        const bannerX = 180;
        const bannerY = 445;
        const bannerW = 664;
        const bannerH = 76;

        ctx.save();
        // Glassy Cyber HUD Box
        ctx.beginPath();
        drawRoundedRect(bannerX, bannerY, bannerW, bannerH, 14);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(41, 54, 129, 0.25)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Left Glow Indicator
        ctx.beginPath();
        ctx.arc(bannerX + 24, bannerY + bannerH / 2, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#16a34a';
        ctx.fill();
        ctx.shadowColor = '#16a34a';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.restore();

        // Text Line 1: APPLIED FOR ENTRY: PROJECT NAME
        ctx.save();
        ctx.font = '800 18px "Space Grotesk", "Syne", sans-serif';
        ctx.fillStyle = '#0f172a';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(`APPLIED FOR ENTRY: ${projectName}`, bannerX + 42, bannerY + 26);

        // Text Line 2: USER X HANDLE & TICKET ID
        ctx.font = '600 13px "Space Grotesk", "DM Sans", monospace';
        ctx.fillStyle = '#293681';
        let subText = `TICKET #${entryReceipt.id}`;
        if (rawHandle) subText = `${rawHandle}  •  ${subText}`;
        if (shortWallet) subText += `  •  ${shortWallet}`;
        ctx.fillText(subText, bannerX + 42, bannerY + 50);

        // Right side badge on banner
        ctx.textAlign = 'right';
        ctx.font = '700 11px "Space Grotesk", sans-serif';
        ctx.fillStyle = '#16a34a';
        ctx.fillText('VERIFIED ENTRY ✦', bannerX + bannerW - 20, bannerY + 26);

        ctx.font = '500 11px monospace';
        ctx.fillStyle = '#64748b';
        ctx.fillText(raffle.network || 'EVM', bannerX + bannerW - 20, bannerY + 50);
        ctx.restore();

        const url = canvas.toDataURL('image/png');
        if (isMounted) {
          setDataUrl(url);
          setGenerating(false);

          if (autoDownload) {
            triggerDownload(url, projectName, entryReceipt.id);
          }
        }
      } catch (err) {
        console.error('Error generating card:', err);
        if (isMounted) setGenerating(false);
      }
    };

    generateCard();

    return () => {
      isMounted = false;
    };
  }, [isOpen, raffle, entryReceipt, autoDownload]);

  const triggerDownload = (urlToDownload?: string, proj?: string, ticket?: string) => {
    const targetUrl = urlToDownload || dataUrl;
    if (!targetUrl) return;
    const pName = (proj || raffle.project || 'PROJECT').replace(/[^a-zA-Z0-9]/g, '_');
    const tId = ticket || entryReceipt.id;
    const a = document.createElement('a');
    a.href = targetUrl;
    a.download = `DOTSET_${pName}_Entry_${tId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleShareOnX = () => {
    const pName = raffle.project || raffle.title || 'Whitelist';
    const text = encodeURIComponent(
      `Just submitted my verified entry for the @${pName} whitelist raffle on @dotsetarena! 🚀⚡\n\nTicket: #${entryReceipt.id}\nJoin here: https://dotset.xyz/raffle/${raffle.id}\n\n#DOTSET #Web3 #Whitelist`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#0f172a] rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#293681]/10 dark:bg-blue-500/20 text-[#293681] dark:text-blue-400">
              <Sparkles size={16} />
            </div>
            <div>
              <h3 className="font-syne text-sm font-bold text-gray-900 dark:text-white">
                Official Entry Pass
              </h3>
              <p className="font-dm text-[11px] text-gray-500 dark:text-slate-400">
                {raffle.project} × DOTSET ARENA
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body / Card Preview */}
        <div className="p-5 flex-1 overflow-y-auto flex flex-col items-center justify-center gap-4">
          <div className="relative w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 bg-black aspect-[16/9] flex items-center justify-center">
            {generating ? (
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <RefreshCw size={24} className="animate-spin text-[#38bdf8]" />
                <span className="font-mono-dm text-xs">Generating cyber entry pass...</span>
              </div>
            ) : dataUrl ? (
              <img
                src={dataUrl}
                alt="DOTSET Partnership Entry Pass"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="text-xs text-red-400 font-mono-dm">Failed to generate preview</div>
            )}
          </div>

          {/* Quick info specs */}
          <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60">
              <span className="text-[10px] text-gray-400 uppercase font-mono-dm block">Project</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                {raffle.project}
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60">
              <span className="text-[10px] text-gray-400 uppercase font-mono-dm block">Your X Handle</span>
              <span className="text-xs font-bold text-gray-900 dark:text-white truncate block">
                {entryReceipt.twitterUsername ? `@${entryReceipt.twitterUsername.replace('@', '')}` : 'Anonymous'}
              </span>
            </div>
            <div className="col-span-2 sm:col-span-1 p-2.5 rounded-lg bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700/60">
              <span className="text-[10px] text-gray-400 uppercase font-mono-dm block">Ticket Number</span>
              <span className="text-xs font-bold text-[#293681] dark:text-blue-400 truncate block select-all">
                {entryReceipt.id}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-gray-500 dark:text-slate-400 font-dm text-center sm:text-left">
            Share your verified entry card on X to boost community engagement!
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleShareOnX}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white font-dm text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
            >
              <Share2 size={13} />
              <span>Share on 𝕏</span>
            </button>

            <button
              onClick={() => triggerDownload()}
              disabled={generating || !dataUrl}
              className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#293681] hover:bg-[#4274d9] text-white font-dm text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download size={13} />
              <span>Download Card</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
