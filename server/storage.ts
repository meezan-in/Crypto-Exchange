import { Wallet, Transaction, Balance, Price, OrderBook, RsaKeyPair } from "@shared/schema";

export interface IStorage {
  // Wallet operations
  createWallet(wallet: Wallet): Promise<Wallet>;
  getWallet(address: string): Promise<Wallet | undefined>;
  getAllWallets(): Promise<Wallet[]>;
  
  // Balance operations
  getBalance(address: string): Promise<Balance>;
  updateBalance(address: string, balances: Balance): Promise<void>;
  
  // Transaction operations
  addTransaction(transaction: Transaction): Promise<Transaction>;
  getTransactions(address: string): Promise<Transaction[]>;
  
  // Price operations
  updatePrices(prices: Price): Promise<void>;
  getCurrentPrices(): Promise<Price | undefined>;
  
  // Order book operations
  updateOrderBook(symbol: string, orderBook: OrderBook): Promise<void>;
  getOrderBook(symbol: string): Promise<OrderBook | undefined>;
  
  // RSA key pair storage (for crypto lab)
  storeRsaKeyPair(id: string, keyPair: RsaKeyPair): Promise<void>;
  getRsaKeyPair(id: string): Promise<RsaKeyPair | undefined>;
}

export class MemStorage implements IStorage {
  private wallets: Map<string, Wallet> = new Map();
  private balances: Map<string, Balance> = new Map();
  private transactions: Map<string, Transaction[]> = new Map();
  private prices: Price | undefined;
  private orderBooks: Map<string, OrderBook> = new Map();
  private rsaKeyPairs: Map<string, RsaKeyPair> = new Map();

  async createWallet(wallet: Wallet): Promise<Wallet> {
    this.wallets.set(wallet.address, wallet);
    // Initialize empty balance
    const emptyBalance: Balance = {
      BTC: 0,
      ETH: 0,
      MATIC: 0,
      BNB: 0,
      INR: 0,
    };
    this.balances.set(wallet.address, emptyBalance);
    this.transactions.set(wallet.address, []);
    return wallet;
  }

  async getWallet(address: string): Promise<Wallet | undefined> {
    return this.wallets.get(address);
  }

  async getAllWallets(): Promise<Wallet[]> {
    return Array.from(this.wallets.values());
  }

  async getBalance(address: string): Promise<Balance> {
    return this.balances.get(address) || {
      BTC: 0,
      ETH: 0,
      MATIC: 0,
      BNB: 0,
      INR: 0,
    };
  }

  async updateBalance(address: string, balances: Balance): Promise<void> {
    this.balances.set(address, balances);
  }

  async addTransaction(transaction: Transaction): Promise<Transaction> {
    const transactions = this.transactions.get(transaction.walletAddress) || [];
    transactions.push(transaction);
    this.transactions.set(transaction.walletAddress, transactions);
    return transaction;
  }

  async getTransactions(address: string): Promise<Transaction[]> {
    return this.transactions.get(address) || [];
  }

  async updatePrices(prices: Price): Promise<void> {
    this.prices = prices;
  }

  async getCurrentPrices(): Promise<Price | undefined> {
    return this.prices;
  }

  async updateOrderBook(symbol: string, orderBook: OrderBook): Promise<void> {
    this.orderBooks.set(symbol, orderBook);
  }

  async getOrderBook(symbol: string): Promise<OrderBook | undefined> {
    return this.orderBooks.get(symbol);
  }

  async storeRsaKeyPair(id: string, keyPair: RsaKeyPair): Promise<void> {
    this.rsaKeyPairs.set(id, keyPair);
  }

  async getRsaKeyPair(id: string): Promise<RsaKeyPair | undefined> {
    return this.rsaKeyPairs.get(id);
  }
}

export const storage = new MemStorage();
