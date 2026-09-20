import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'DOTSET — Web3 Whitelist & Raffle Hub',
  description: 'Official Whitelist Raffle portal for DOTSET. Clean monochrome pixel UX, provable on-chain holder verification, and guaranteed partner allocations.',
  keywords: ['DOTSET', 'dotset', 'NFT', 'Whitelist', 'Raffle', 'Web3', 'Ethereum', 'Robinhood', 'Base', 'ZEC'],
  icons: {
    icon: [
      { url: '/images/dotset-logo.png', type: 'image/png' },
    ],
    shortcut: '/images/dotset-logo.png',
    apple: '/images/dotset-logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased selection:bg-black selection:text-white min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
