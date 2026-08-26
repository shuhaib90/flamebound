import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'FLAMEBOUND — Whitelist Raffles & Holder Portal',
  description: 'Official Whitelist Raffle portal for FLAMEBOUND NFT Collection. Solid lime-green aesthetic, arcade pixel UX, and on-chain holder verification.',
  keywords: ['Flamebound', 'NFT', 'Whitelist', 'Raffle', 'Web3', 'Ethereum', 'Robinhood', 'Base'],
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/images/flamebound-logo.png', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-lime text-black antialiased selection:bg-black selection:text-lime min-h-screen flex flex-col">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
