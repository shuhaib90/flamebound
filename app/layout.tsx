import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'DOTSET — Web3 Quest & Raffle Platform',
  description: 'Complete quests, engage with early crypto projects, and earn verified whitelist spots on DOTSET.',
  keywords: ['DOTSET', 'web3 quest', 'crypto raffle', 'whitelist', 'airdrop', 'testnet', 'robinhood', 'ethereum', 'base'],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('dotset_theme');
                  if (saved === 'dark') {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-white dark:bg-[#090b14] text-gray-900 dark:text-slate-100 antialiased selection:bg-[#4274d9] selection:text-white min-h-screen flex flex-col font-dm relative transition-colors duration-200">
        {/* Ambient Grid and Glow */}
        <div className="amb-grid" />
        <div className="amb-glow" />
        
        <Providers>
          <div className="relative z-10 flex flex-col min-h-screen">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
