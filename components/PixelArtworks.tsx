'use client';

import React, { useState } from 'react';

interface PixelArtworkProps {
  type?: 'genesis' | 'cyber_beast' | 'founders_pass' | 'relic' | 'custom';
  bannerUrl?: string;
  logoUrl?: string;
  size?: number;
  className?: string;
}

export function PixelArtwork({ type = 'genesis', bannerUrl, logoUrl, size = 180, className = '' }: PixelArtworkProps) {
  const [imgError, setImgError] = useState(false);

  // If custom uploaded image is available
  if (bannerUrl && !imgError) {
    return (
      <div 
        className="w-full bg-black flex flex-col items-center justify-center border-4 border-black relative overflow-hidden group select-none"
        style={{ minHeight: `${size}px` }}
      >
        <img
          src={bannerUrl}
          alt="NFT Artwork"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover max-h-[220px] group-hover:scale-105 transition-transform"
          style={{ imageRendering: 'pixelated' }}
        />
        {logoUrl && (
          <div className="absolute top-2 left-2 w-9 h-9">
            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
          </div>
        )}
      </div>
    );
  }

  if (type === 'genesis') {
    return (
      <div 
        className="w-full bg-black flex flex-col items-center justify-center border-4 border-black relative overflow-hidden group select-none p-3"
        style={{ minHeight: `${size}px` }}
      >
        <div className="w-28 h-28 max-h-[140px] flex items-center justify-center group-hover:scale-110 transition-transform">
          <img
            src="/images/dotset-logo.png"
            alt="DOTSET Genesis"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="mt-2 bg-[#293681] text-white font-pixel text-[9px] px-2 py-0.5 border-2 border-[#293681] font-bold">
          ★ DOTSET GENESIS ★
        </div>
      </div>
    );
  }

  if (type === 'cyber_beast') {
    return (
      <div 
        className="w-full bg-black flex flex-col items-center justify-center border-4 border-black relative overflow-hidden group select-none p-4"
        style={{ minHeight: `${size}px` }}
      >
        <div className="text-lime text-center font-pixel text-xs mb-2 tracking-wider">
          CYBER-BEAST #042
        </div>
        {/* Pixel Cyber Wolf / Beast */}
        <svg width="96" height="96" viewBox="0 0 24 24" fill="none" className="transform group-hover:scale-105 transition-transform">
          {/* Beast Ears */}
          <rect x="4" y="3" width="3" height="4" fill="#A6FF00" />
          <rect x="17" y="3" width="3" height="4" fill="#A6FF00" />
          <rect x="5" y="4" width="1" height="2" fill="#000000" />
          <rect x="18" y="4" width="1" height="2" fill="#000000" />

          {/* Head */}
          <rect x="6" y="6" width="12" height="12" fill="#A6FF00" />
          <rect x="3" y="8" width="18" height="8" fill="#A6FF00" />

          {/* Cyber Visor */}
          <rect x="5" y="9" width="14" height="4" fill="#000000" />
          <rect x="6" y="10" width="12" height="2" fill="#FFFFFF" />

          {/* Fang Snout */}
          <rect x="9" y="14" width="6" height="5" fill="#000000" />
          <rect x="10" y="15" width="4" height="2" fill="#FFFFFF" />
          <rect x="9" y="17" width="1" height="2" fill="#FFFFFF" />
          <rect x="14" y="17" width="1" height="2" fill="#FFFFFF" />
        </svg>
        <div className="mt-3 bg-lime text-black font-silkscreen text-[10px] px-2 py-0.5 border-2 border-black font-bold">
          COMPANION PASS
        </div>
      </div>
    );
  }

  // Founders pass or Relic
  return (
    <div 
      className="w-full bg-black flex flex-col items-center justify-center border-4 border-black relative overflow-hidden group select-none p-4"
      style={{ minHeight: `${size}px` }}
    >
      <div className="text-lime text-center font-pixel text-xs mb-2 tracking-wider">
        VIP FOUNDERS PASS
      </div>
      {/* Pixel Key / Pass Badge */}
      <svg width="96" height="96" viewBox="0 0 24 24" fill="none" className="transform group-hover:scale-105 transition-transform">
        <rect x="7" y="3" width="10" height="10" fill="#FFFFFF" />
        <rect x="9" y="5" width="6" height="6" fill="#000000" />
        <rect x="10" y="6" width="4" height="4" fill="#A6FF00" />
        <rect x="11" y="13" width="2" height="8" fill="#FFFFFF" />
        <rect x="13" y="16" width="3" height="2" fill="#FFFFFF" />
        <rect x="13" y="19" width="4" height="2" fill="#FFFFFF" />
      </svg>
      <div className="mt-3 bg-white text-black font-silkscreen text-[10px] px-2 py-0.5 border-2 border-black font-bold">
        STATUS: CONCLUDED
      </div>
    </div>
  );
}
