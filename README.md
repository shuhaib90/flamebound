# 🔥 FLAMEBOUND — Web3 Whitelist Raffle Platform

**FLAMEBOUND** is an NFT Whitelist Raffle portal built with a bold retro arcade cyberpunk aesthetic. It enables live whitelist raffles, partner allocations, and real-time on-chain holder eligibility checks.

---

## ✨ Features

- **⚡ Solid Neon Aesthetic**: Cyberpunk high-contrast lime green and solid black pixel/arcade styling.
- **👛 RainbowKit 2 + Wagmi + Viem**: Seamless EVM wallet connection.
- **🔥 On-Chain Holder Verification**: Directly queries the official Flamebound NFT contract (`0xad11f08a3a1e15756abcf565269d3c32b6d464b9`) across multiple EVM chains (Ethereum, Robinhood, Base, Polygon, Arbitrum).
- **🗄️ Supabase PostgreSQL Backend**: Live cloud database synchronization with Row-Level Security (RLS).
- **🎟️ User Profile Passport**: Displays verified NFT holdings, holder tier badges (`Elder Flame Whale`, `Titan`, `Inferno Lord`, `Keeper`), entered raffles, and won whitelists.
- **🛠️ Admin Dashboard**: Full raffle lifecycle control (create, edit, delete, cryptographically draw winners, export entries to CSV).
- **🔗 Deep Linking & Instant Share**: One-click deep link copying (`?raffle=id`) and pre-filled Twitter / X sharing.

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/shuhaib90/flamebound.git
cd flamebound
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Supabase project credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 Smart Contract & Network Info
- **Primary NFT Contract**: `0xad11f08a3a1e15756abcf565269d3c32b6d464b9`
- **Admin Wallet**: `0x8B7a0A0CA2B05319d27E70Df91D106bfe8fF05fb`
- **Official Collection**: [OpenSea](https://opensea.io/collection/flamebound-259045050)
- **Official Twitter / X**: [@FlameboundNft](https://x.com/FlameboundNft)
