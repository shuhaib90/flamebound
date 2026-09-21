import React from 'react';

interface ChainBadgeProps {
  network?: string;
  customNetwork?: string;
  customNetworkLogoUrl?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function ChainLogo({
  network = 'ETHEREUM',
  customNetworkLogoUrl,
  size = 16,
  className = '',
}: {
  network?: string;
  customNetworkLogoUrl?: string;
  size?: number;
  className?: string;
}) {
  const norm = (network || '').toUpperCase();

  // If custom logo image is provided
  if (customNetworkLogoUrl) {
    return (
      <img
        src={customNetworkLogoUrl}
        alt={network}
        width={size}
        height={size}
        className={`object-contain rounded-full shrink-0 ${className}`}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    );
  }

  // Ethereum
  if (norm.includes('ETH') || norm === 'ETHEREUM' || norm === 'MAINNET') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <path d="M12 1.5L4.5 13.5L12 18L19.5 13.5L12 1.5Z" fill="#627EEA" />
        <path d="M12 1.5V18L19.5 13.5L12 1.5Z" fill="#455FC7" />
        <path d="M12 19.5L4.5 15L12 22.5L19.5 15L12 19.5Z" fill="#627EEA" />
        <path d="M12 19.5V22.5L19.5 15L12 19.5Z" fill="#455FC7" />
      </svg>
    );
  }

  // Base
  if (norm.includes('BASE')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <circle cx="12" cy="12" r="11" fill="#0052FF" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12.012 14.8C10.4656 14.8 9.21201 13.5464 9.21201 12C9.21201 10.4536 10.4656 9.2 12.012 9.2C13.5584 9.2 14.812 10.4536 14.812 12C14.812 13.5464 13.5584 14.8 12.012 14.8Z"
          fill="white"
        />
      </svg>
    );
  }

  // Polygon
  if (norm.includes('POLYGON') || norm.includes('MATIC')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <circle cx="12" cy="12" r="11" fill="#8247E5" />
        <path
          d="M16.5 10.2L13.8 8.6C13.5 8.4 13 8.4 12.7 8.6L10.3 10C10.1 10.1 10 10.3 10 10.5V13.5C10 13.7 10.1 13.9 10.3 14L13 15.6C13.3 15.8 13.8 15.8 14.1 15.6L16.5 14.2C16.7 14.1 16.8 13.9 16.8 13.7V10.7C16.8 10.5 16.7 10.3 16.5 10.2Z"
          fill="white"
        />
        <path
          d="M10.2 14L7.5 12.4C7.2 12.2 6.7 12.2 6.4 12.4L4.3 13.6C4.1 13.7 4 13.9 4 14.1V16.7C4 16.9 4.1 17.1 4.3 17.2L7 18.8C7.3 19 7.8 19 8.1 18.8L10.2 17.6C10.4 17.5 10.5 17.3 10.5 17.1V14.5C10.5 14.3 10.4 14.1 10.2 14Z"
          fill="white"
          fillOpacity="0.85"
        />
      </svg>
    );
  }

  // Robinhood
  if (norm.includes('ROBINHOOD')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <circle cx="12" cy="12" r="11" fill="#00C805" />
        {/* Robinhood stylized feather / leaf */}
        <path
          d="M14.8 5C13.2 6.4 11.8 8.6 11 11.2C10.6 9.8 10 8.7 9.2 7.8C8.5 7 7.7 6.4 7 6C6.5 7.8 6.7 9.8 7.5 11.8C8.1 13.2 9 14.5 10.2 15.6C9.6 17 9.2 18.4 9 19.5C10.5 19 11.8 18 12.8 16.6C14.2 14.6 15.2 12 15.6 9.2C15.8 7.6 15.5 6.2 14.8 5Z"
          fill="black"
        />
      </svg>
    );
  }

  // ApeChain
  if (norm.includes('APE') || norm.includes('APECHAIN')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <circle cx="12" cy="12" r="11" fill="#0054FA" />
        <path
          d="M12 6.5C8.96 6.5 6.5 8.96 6.5 12C6.5 15.04 8.96 17.5 12 17.5C15.04 17.5 17.5 15.04 17.5 12C17.5 8.96 15.04 6.5 12 6.5ZM12 15.5C10.07 15.5 8.5 13.93 8.5 12C8.5 10.07 10.07 8.5 12 8.5C13.93 8.5 15.5 10.07 15.5 12C15.5 13.93 13.93 15.5 12 15.5Z"
          fill="white"
        />
        <circle cx="12" cy="12" r="2" fill="white" />
      </svg>
    );
  }

  // Arbitrum
  if (norm.includes('ARBITRUM') || norm.includes('ARB')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <circle cx="12" cy="12" r="11" fill="#28A0F0" />
        <path
          d="M12.3 6.2L16.4 12.8L12.3 19.4H14.7L19.5 12.8L14.7 6.2H12.3Z"
          fill="white"
        />
        <path
          d="M8.8 6.2L4 12.8L8.8 19.4H11.2L7.1 12.8L11.2 6.2H8.8Z"
          fill="white"
        />
      </svg>
    );
  }

  // Solana
  if (norm.includes('SOL') || norm.includes('SOLANA')) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`shrink-0 ${className}`}
      >
        <circle cx="12" cy="12" r="11" fill="#14151a" />
        <path
          d="M5.5 15.7C5.7 15.5 6 15.4 6.3 15.4H17.2C17.6 15.4 17.9 15.8 17.7 16.1L16.5 17.3C16.3 17.5 16 17.6 15.7 17.6H4.8C4.4 17.6 4.1 17.2 4.3 16.9L5.5 15.7Z"
          fill="url(#sol_grad1)"
        />
        <path
          d="M5.5 6.4C5.7 6.2 6 6.1 6.3 6.1H17.2C17.6 6.1 17.9 6.5 17.7 6.8L16.5 8C16.3 8.2 16 8.3 15.7 8.3H4.8C4.4 8.3 4.1 7.9 4.3 7.6L5.5 6.4Z"
          fill="url(#sol_grad2)"
        />
        <path
          d="M16.5 11C16.3 10.8 16 10.7 15.7 10.7H4.8C4.4 10.7 4.1 11.1 4.3 11.4L5.5 12.6C5.7 12.8 6 12.9 6.3 12.9H17.2C17.6 12.9 17.9 12.5 17.7 12.2L16.5 11Z"
          fill="url(#sol_grad3)"
        />
        <defs>
          <linearGradient id="sol_grad1" x1="4" y1="16.5" x2="18" y2="16.5" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="sol_grad2" x1="4" y1="7.2" x2="18" y2="7.2" gradientUnits="userSpaceOnUse">
            <stop stopColor="#00FFA3" />
            <stop offset="1" stopColor="#DC1FFF" />
          </linearGradient>
          <linearGradient id="sol_grad3" x1="4" y1="11.8" x2="18" y2="11.8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#DC1FFF" />
            <stop offset="1" stopColor="#00FFA3" />
          </linearGradient>
        </defs>
      </svg>
    );
  }

  // Generic / Custom Chain Icon
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 text-[#293681] ${className}`}
    >
      <circle cx="12" cy="12" r="11" fill="#f0f4ff" stroke="#293681" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="#293681" />
      <path d="M12 3V6M12 18V21M3 12H6M18 12H21" stroke="#293681" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ChainBadge({
  network = 'ETHEREUM',
  customNetwork,
  customNetworkLogoUrl,
  className = '',
  size = 'md',
  showText = true,
}: ChainBadgeProps) {
  const displayName = customNetwork || network || 'ETHEREUM';
  const logoSize = size === 'sm' ? 14 : size === 'lg' ? 20 : 16;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : size === 'lg' ? 'px-3 py-1.5 text-xs' : 'px-2.5 py-1 text-[11px]';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-mono-dm uppercase font-semibold bg-white border border-gray-200 shadow-sm text-gray-800 ${padding} ${className}`}
    >
      <ChainLogo
        network={network}
        customNetworkLogoUrl={customNetworkLogoUrl}
        size={logoSize}
      />
      {showText && <span>{displayName}</span>}
    </div>
  );
}
