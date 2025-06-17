import { v4 as uuidv4 } from 'uuid';
import { 
  Transaction, 
  BuyOrder, 
  SellOrder, 
  Send, 
  Deposit, 
  Withdraw, 
  Balance, 
  Portfolio 
} from "@shared/schema";
import { storage } from '../storage';
import { priceService } from './priceService';

export class ExchangeService {
  private readonly TAKER_FEE = 0.001; // 0.1%
  private readonly TDS_RATE = 0.01; // 1%

  async buyOrder(order: BuyOrder, includeTds: boolean = true): Promise<Transaction> {
    // Get current prices
    const prices = await storage.getCurrentPrices();
    if (!prices) {
      throw new Error('Price data not available');
    }
    
    const price = prices[order.symbol];
    if (!price) {
      throw new Error('Invalid symbol');
    }
    
    // Get current balance
    const balance = await storage.getBalance(order.addr);
    
    // Calculate fees
    const fee = order.inrAmount * this.TAKER_FEE;
    const tds = includeTds ? order.inrAmount * this.TDS_RATE : 0;
    const totalCost = order.inrAmount + fee + tds;
    
    // Check if sufficient INR balance
    if (balance.INR < totalCost) {
      throw new Error('Insufficient INR balance');
    }
    
    // Calculate crypto amount received
    const cryptoAmount = order.inrAmount / price;
    
    // Update balances
    const newBalance = {
      ...balance,
      INR: balance.INR - totalCost,
      [order.symbol]: balance[order.symbol] + cryptoAmount,
    };
    
    await storage.updateBalance(order.addr, newBalance);
    
    // Create transaction record
    const transaction: Transaction = {
      id: uuidv4(),
      type: 'BUY',
      walletAddress: order.addr,
      symbol: order.symbol,
      amount: cryptoAmount,
      inrAmount: order.inrAmount,
      price,
      fee,
      tds,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
    };
    
    return await storage.addTransaction(transaction);
  }

  async sellOrder(order: SellOrder, includeTds: boolean = true): Promise<Transaction> {
    // Get current prices
    const prices = await storage.getCurrentPrices();
    if (!prices) {
      throw new Error('Price data not available');
    }
    
    const price = prices[order.symbol];
    if (!price) {
      throw new Error('Invalid symbol');
    }
    
    // Get current balance
    const balance = await storage.getBalance(order.addr);
    
    // Check if sufficient crypto balance
    if (balance[order.symbol] < order.cryptoAmount) {
      throw new Error(`Insufficient ${order.symbol} balance`);
    }
    
    // Calculate INR received
    const inrAmount = order.cryptoAmount * price;
    const fee = inrAmount * this.TAKER_FEE;
    const tds = includeTds ? inrAmount * this.TDS_RATE : 0;
    const netReceived = inrAmount - fee - tds;
    
    // Update balances
    const newBalance = {
      ...balance,
      INR: balance.INR + netReceived,
      [order.symbol]: balance[order.symbol] - order.cryptoAmount,
    };
    
    await storage.updateBalance(order.addr, newBalance);
    
    // Create transaction record
    const transaction: Transaction = {
      id: uuidv4(),
      type: 'SELL',
      walletAddress: order.addr,
      symbol: order.symbol,
      amount: order.cryptoAmount,
      inrAmount: netReceived,
      price,
      fee,
      tds,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
    };
    
    return await storage.addTransaction(transaction);
  }

  async sendCrypto(sendData: Send): Promise<Transaction> {
    // Get sender balance
    const senderBalance = await storage.getBalance(sendData.fromAddr);
    
    // Check if sufficient balance
    if (senderBalance[sendData.symbol] < sendData.amount) {
      throw new Error(`Insufficient ${sendData.symbol} balance`);
    }
    
    // Check if recipient wallet exists
    const recipientWallet = await storage.getWallet(sendData.toAddr);
    if (!recipientWallet) {
      throw new Error('Recipient wallet not found');
    }
    
    // Get recipient balance
    const recipientBalance = await storage.getBalance(sendData.toAddr);
    
    // Update sender balance
    const newSenderBalance = {
      ...senderBalance,
      [sendData.symbol]: senderBalance[sendData.symbol] - sendData.amount,
    };
    
    // Update recipient balance
    const newRecipientBalance = {
      ...recipientBalance,
      [sendData.symbol]: recipientBalance[sendData.symbol] + sendData.amount,
    };
    
    await storage.updateBalance(sendData.fromAddr, newSenderBalance);
    await storage.updateBalance(sendData.toAddr, newRecipientBalance);
    
    // Create transaction record for sender
    const transaction: Transaction = {
      id: uuidv4(),
      type: 'SEND',
      walletAddress: sendData.fromAddr,
      symbol: sendData.symbol,
      amount: sendData.amount,
      toAddress: sendData.toAddr,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
    };
    
    return await storage.addTransaction(transaction);
  }

  async depositFiat(depositData: Deposit): Promise<Transaction> {
    // Get current balance
    const balance = await storage.getBalance(depositData.addr);
    
    // Update balance
    const newBalance = {
      ...balance,
      INR: balance.INR + depositData.inrAmount,
    };
    
    await storage.updateBalance(depositData.addr, newBalance);
    
    // Create transaction record
    const transaction: Transaction = {
      id: uuidv4(),
      type: 'DEPOSIT',
      walletAddress: depositData.addr,
      amount: depositData.inrAmount,
      inrAmount: depositData.inrAmount,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
    };
    
    return await storage.addTransaction(transaction);
  }

  async withdrawFiat(withdrawData: Withdraw): Promise<Transaction> {
    // Get current balance
    const balance = await storage.getBalance(withdrawData.addr);
    
    // Check if sufficient balance
    if (balance.INR < withdrawData.inrAmount) {
      throw new Error('Insufficient INR balance');
    }
    
    // Update balance
    const newBalance = {
      ...balance,
      INR: balance.INR - withdrawData.inrAmount,
    };
    
    await storage.updateBalance(withdrawData.addr, newBalance);
    
    // Create transaction record
    const transaction: Transaction = {
      id: uuidv4(),
      type: 'WITHDRAW',
      walletAddress: withdrawData.addr,
      amount: withdrawData.inrAmount,
      inrAmount: withdrawData.inrAmount,
      timestamp: new Date().toISOString(),
      status: 'COMPLETED',
    };
    
    return await storage.addTransaction(transaction);
  }

  async getPortfolio(address: string): Promise<Portfolio> {
    // Get balance and transactions
    const balances = await storage.getBalance(address);
    const transactions = await storage.getTransactions(address);
    
    // Get current prices
    const prices = await storage.getCurrentPrices();
    
    let totalValue = balances.INR;
    let totalInvested = 0;
    
    if (prices) {
      totalValue += balances.BTC * prices.BTC;
      totalValue += balances.ETH * prices.ETH;
      totalValue += balances.MATIC * prices.MATIC;
      totalValue += balances.BNB * prices.BNB;
    }
    
    // Calculate total invested (sum of buy orders)
    transactions
      .filter(tx => tx.type === 'BUY')
      .forEach(tx => {
        totalInvested += tx.inrAmount || 0;
        totalInvested += tx.fee || 0;
        totalInvested += tx.tds || 0;
      });
    
    // Calculate P/L
    const pnl = totalValue - totalInvested;
    const pnlPercentage = totalInvested > 0 ? (pnl / totalInvested) * 100 : 0;
    
    return {
      walletAddress: address,
      balances,
      totalValue,
      pnl,
      pnlPercentage,
      transactions: transactions.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    };
  }
}

export const exchangeService = new ExchangeService();
