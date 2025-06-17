import { Price } from "@shared/schema";

export class PriceService {
  private apiUrl: string;
  private currentPrices: Price | null = null;

  constructor() {
    this.apiUrl = process.env.COINGECKO_API_URL || 'https://api.coingecko.com/api/v3';
  }

  async fetchPrices(): Promise<Price> {
    try {
      const response = await fetch(
        `${this.apiUrl}/simple/price?ids=bitcoin,ethereum,polygon,binancecoin&vs_currencies=inr`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      const prices: Price = {
        BTC: data.bitcoin?.inr || 0,
        ETH: data.ethereum?.inr || 0,
        MATIC: data.polygon?.inr || 0,
        BNB: data.binancecoin?.inr || 0,
        timestamp: new Date().toISOString(),
      };
      
      this.currentPrices = prices;
      return prices;
    } catch (error) {
      console.error('Error fetching prices:', error);
      // Return fallback prices if API fails
      return {
        BTC: 3245678,
        ETH: 178432,
        MATIC: 68.45,
        BNB: 24567,
        timestamp: new Date().toISOString(),
      };
    }
  }

  getCurrentPrices(): Price | null {
    return this.currentPrices;
  }

  // Generate mock order book data around current price
  generateOrderBook(symbol: string, basePrice: number) {
    const bids = [];
    const asks = [];
    
    // Generate 10 bid levels (buy orders) below current price
    for (let i = 1; i <= 10; i++) {
      const price = basePrice * (1 - (i * 0.001)); // 0.1% steps down
      const amount = Math.random() * 0.5 + 0.1; // Random amount between 0.1 and 0.6
      bids.push({ price: Math.round(price * 100) / 100, amount });
    }
    
    // Generate 10 ask levels (sell orders) above current price
    for (let i = 1; i <= 10; i++) {
      const price = basePrice * (1 + (i * 0.001)); // 0.1% steps up
      const amount = Math.random() * 0.5 + 0.1; // Random amount between 0.1 and 0.6
      asks.push({ price: Math.round(price * 100) / 100, amount });
    }
    
    return {
      symbol,
      bids: bids.sort((a, b) => b.price - a.price), // Highest bid first
      asks: asks.sort((a, b) => a.price - b.price), // Lowest ask first
      timestamp: new Date().toISOString(),
    };
  }
}

export const priceService = new PriceService();
