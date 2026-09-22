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

  // If custom uploaded banner is available
  if (bannerUrl && !imgError) {
    return (
      <div className={`w-full h-full relative overflow-hidden flex items-center justify-center bg-gray-100 select-none ${className}`}>
        <img
          src={bannerUrl}
          alt="Campaign Artwork Banner"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
    );
  }

  if (type === 'genesis') {
    return (
      <div 
        className="w-full h-full bg-[#0e172a] flex flex-col items-center justify-center relative overflow-hidden select-none p-4"
        style={{ minHeight: `${size}px` }}
      >
        <div className="w-24 h-24 flex items-center justify-center group-hover:scale-110 transition-transform">
          <img
            src="/images/dotset-logo.png"
            alt="DOTSET Genesis"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="mt-2 bg-[#293681] text-white font-mono-dm text-[10px] px-2.5 py-0.5 rounded font-bold uppercase tracking-wider">
          DOTSET Drop
        </div>
      </div>
    );
  }

  if (type === 'cyber_beast') {
    return (
      <div 
        className="w-full h-full bg-[#0a0f1d] flex flex-col items-center justify-center relative overflow-hidden select-none p-4"
        style={{ minHeight: `${size}px` }}
      >
        <div className="text-[#38bdf8] text-center font-mono-dm text-xs mb-2 tracking-wider font-bold">
          PARTNER WL PASS
        </div>
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" className="transform group-hover:scale-105 transition-transform">
          <rect x="4" y="3" width="3" height="4" fill="#38bdf8" />
          <rect x="17" y="3" width="3" height="4" fill="#38bdf8" />
          <rect x="5" y="4" width="1" height="2" fill="#0f172a" />
          <rect x="18" y="4" width="1" height="2" fill="#0f172a" />
          <rect x="6" y="6" width="12" height="12" fill="#38bdf8" />
          <rect x="3" y="8" width="18" height="8" fill="#38bdf8" />
          <rect x="5" y="9" width="14" height="4" fill="#0f172a" />
          <rect x="6" y="10" width="12" height="2" fill="#FFFFFF" />
          <rect x="9" y="14" width="6" height="5" fill="#0f172a" />
          <rect x="10" y="15" width="4" height="2" fill="#FFFFFF" />
        </svg>
        <div className="mt-3 bg-[#38bdf8] text-gray-900 font-mono-dm text-[10px] px-2 py-0.5 rounded font-bold">
          VERIFIED DROP
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div 
      className="w-full h-full bg-gradient-to-br from-[#1e293b] to-[#0f172a] flex flex-col items-center justify-center relative overflow-hidden select-none p-4"
      style={{ minHeight: `${size}px` }}
    >
      <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mb-2">
        <img
          src="/images/dotset-logo.png"
          alt="DOTSET"
          className="w-10 h-10 object-contain"
        />
      </div>
      <div className="text-white font-mono-dm text-[10px] uppercase font-semibold">
        DOTSET WHITELIST
      </div>
    </div>
  );
}
