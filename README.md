# ⚡ DOTSET — Web3 Quest & Whitelist Raffle Platform

**DOTSET** is an open Web3 Quest & Raffle platform designed with a clean white and navy aesthetic. It enables live whitelist raffles, partner allocations, automated social quest verification, and winner draws.

---

## ✨ Features

- **🌐 Modern Clean Aesthetic**: Crisp white background with deep navy (`#293681`) and electric blue (`#4274d9`) design system.
- **👛 EVM & Solana Support**: Supports EVM chains (Ethereum, ApeChain, Base, Arbitrum) and Solana wallet addresses.
- **🗄️ Supabase PostgreSQL Backend**: Live cloud database synchronization with Row-Level Security (RLS).
- **🛠️ Admin Dashboard**: Password-protected (`monk9090`) raffle lifecycle controller (create, edit, delete, cryptographically draw winners, export entrant data directly to CSV).
- **🔗 Deep Linking & Instant Share**: One-click URL copying and pre-filled Twitter / X share intents.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
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

## 📜 Network Info
- **Official Twitter / X**: [@dotsetxyz](https://x.com/dotsetxyz)
