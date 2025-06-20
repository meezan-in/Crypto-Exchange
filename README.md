🇮🇳 CryptoNest India – Educational Crypto Wallet Simulator
🌐 Overview
CryptoNest India is a simulation-based cryptocurrency wallet and trading app designed for educational purposes. It helps users understand blockchain concepts, cryptographic techniques, and basic trading logic — all using INR as the base currency in a secure, simulated environment. No real transactions or databases are involved.

⚙️ Tech Stack
🔧 Frontend
React 18 + TypeScript

Vite (bundler)

Tailwind CSS + Shadcn/UI

Wouter (routing)

TanStack Query (state management)

Recharts (data visualization)

🔧 Backend
Node.js + Express.js (TypeScript)

WebSocket for real-time updates

CoinGecko API (for live prices)

Local file/in-memory data (no SQL database)

🔐 Cryptographic Features
BIP-39 mnemonic phrase generation

AES-256-GCM encryption for private keys

PBKDF2 password-based key derivation

Educational modules for:

Hashing (MD5, SHA-256, SHA-3)

Classic ciphers (Caesar, Vigenère)

RSA, AES, and DES demos

📦 Key Modules
👜 Wallet
Create/import wallets using mnemonic phrases

Encrypt/decrypt private keys securely

Multiple wallet types (e.g., HODL, Trading)

💹 Trading Simulator
Buy/sell BTC, ETH, MATIC, BNB (simulated)

INR-based trades with real-time pricing

Order book simulation and TDS tax handling

Portfolio tracking with P&L updates

🧪 Cryptography Lab
Visual run-through of classic and modern algorithms

Good for learning key crypto fundamentals

🔄 Real-Time Updates
Live price and portfolio updates via WebSocket

Auto-fallback to HTTP polling if needed

