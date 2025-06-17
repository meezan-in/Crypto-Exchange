export interface Wallet {
  id: string;
  address: string;
  encryptedPrivateKey: string;
  salt: string;
  iv: string;
  authTag: string;
  mnemonic?: string;
  createdAt: string;
}

export interface Balance {
  BTC: number;
  ETH: number;
  MATIC: number;
  BNB: number;
  INR: number;
}

export interface Transaction {
  id: string;
  type: 'BUY' | 'SELL' | 'SEND' | 'DEPOSIT' | 'WITHDRAW';
  walletAddress: string;
  symbol?: string;
  amount: number;
  inrAmount?: number;
  price?: number;
  fee?: number;
  tds?: number;
  toAddress?: string;
  timestamp: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
}

export interface Portfolio {
  walletAddress: string;
  balances: Balance;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  transactions: Transaction[];
}

export interface Price {
  BTC: number;
  ETH: number;
  MATIC: number;
  BNB: number;
  timestamp: string;
}

export interface Order {
  price: number;
  amount: number;
}

export interface OrderBook {
  symbol: string;
  bids: Order[];
  asks: Order[];
  timestamp: string;
}

export type CryptoSymbol = 'BTC' | 'ETH' | 'MATIC' | 'BNB';

export interface CryptoInfo {
  symbol: CryptoSymbol;
  name: string;
  icon: string;
  color: string;
}

export const cryptoData: Record<CryptoSymbol, CryptoInfo> = {
  BTC: {
    symbol: 'BTC',
    name: 'Bitcoin',
    icon: '₿',
    color: 'crypto-bitcoin',
  },
  ETH: {
    symbol: 'ETH',
    name: 'Ethereum',
    icon: 'Ξ',
    color: 'crypto-ethereum',
  },
  MATIC: {
    symbol: 'MATIC',
    name: 'Polygon',
    icon: 'M',
    color: 'crypto-matic',
  },
  BNB: {
    symbol: 'BNB',
    name: 'BNB',
    icon: 'BNB',
    color: 'crypto-bnb',
  },
};

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  if (currency === 'INR') {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 8,
    maximumFractionDigits: 8,
  }).format(amount);
}

export function formatAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
