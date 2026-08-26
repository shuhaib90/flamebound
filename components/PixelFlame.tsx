'use client';

import React from 'react';

export function PixelFlame({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block ${className}`}
      style={{ imageRendering: 'pixelated' }}
    >
      {/* Outer black outline */}
      <rect x="7" y="1" width="2" height="2" fill="#000000" />
      <rect x="6" y="3" width="4" height="2" fill="#000000" />
      <rect x="5" y="5" width="6" height="2" fill="#000000" />
      <rect x="4" y="7" width="8" height="2" fill="#000000" />
      <rect x="3" y="9" width="10" height="4" fill="#000000" />
      <rect x="4" y="13" width="8" height="2" fill="#000000" />

      {/* Inner Lime Core */}
      <rect x="7" y="3" width="2" height="2" fill="#A6FF00" />
      <rect x="6" y="5" width="4" height="2" fill="#A6FF00" />
      <rect x="5" y="7" width="6" height="3" fill="#A6FF00" />
      <rect x="6" y="10" width="4" height="3" fill="#FFFFFF" />
      <rect x="7" y="11" width="2" height="2" fill="#000000" />
    </svg>
  );
}

export function PixelCheck({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="9" y="2" width="2" height="2" fill="currentColor" />
      <rect x="8" y="4" width="2" height="2" fill="currentColor" />
      <rect x="7" y="6" width="2" height="2" fill="currentColor" />
      <rect x="2" y="5" width="2" height="2" fill="currentColor" />
      <rect x="3" y="6" width="2" height="2" fill="currentColor" />
      <rect x="4" y="7" width="2" height="2" fill="currentColor" />
      <rect x="5" y="8" width="3" height="2" fill="currentColor" />
    </svg>
  );
}

export function PixelCross({ size = 16, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ imageRendering: 'pixelated' }}
    >
      <rect x="2" y="2" width="2" height="2" fill="currentColor" />
      <rect x="8" y="2" width="2" height="2" fill="currentColor" />
      <rect x="4" y="4" width="4" height="4" fill="currentColor" />
      <rect x="2" y="8" width="2" height="2" fill="currentColor" />
      <rect x="8" y="8" width="2" height="2" fill="currentColor" />
    </svg>
  );
}
