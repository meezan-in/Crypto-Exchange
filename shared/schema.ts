import { z } from "zod";

// Wallet schemas
export const walletSchema = z.object({
  id: z.string(),
  address: z.string(),
  encryptedPrivateKey: z.string(),
  salt: z.string(),
  iv: z.string(),
  authTag: z.string(),
  mnemonic: z.string().optional(),
  createdAt: z.string(),
});

export const createWalletSchema = z.object({
  passphrase: z.string().min(8, "Passphrase must be at least 8 characters"),
});

export const importWalletSchema = z.object({
  mnemonic: z.string(),
  passphrase: z.string().min(8, "Passphrase must be at least 8 characters"),
});

export const signMessageSchema = z.object({
  message: z.string(),
  passphrase: z.string(),
});

export const verifyMessageSchema = z.object({
  message: z.string(),
  signature: z.string(),
});

// Transaction schemas
export const transactionSchema = z.object({
  id: z.string(),
  type: z.enum(["BUY", "SELL", "SEND", "DEPOSIT", "WITHDRAW"]),
  walletAddress: z.string(),
  symbol: z.string().optional(),
  amount: z.number(),
  inrAmount: z.number().optional(),
  price: z.number().optional(),
  fee: z.number().optional(),
  tds: z.number().optional(),
  toAddress: z.string().optional(),
  timestamp: z.string(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED"]),
});

export const buyOrderSchema = z.object({
  addr: z.string(),
  symbol: z.enum(["BTC", "ETH", "MATIC", "BNB"]),
  inrAmount: z.number().positive(),
});

export const sellOrderSchema = z.object({
  addr: z.string(),
  symbol: z.enum(["BTC", "ETH", "MATIC", "BNB"]),
  cryptoAmount: z.number().positive(),
});

export const sendSchema = z.object({
  fromAddr: z.string(),
  toAddr: z.string(),
  symbol: z.enum(["BTC", "ETH", "MATIC", "BNB"]),
  amount: z.number().positive(),
});

export const depositSchema = z.object({
  addr: z.string(),
  inrAmount: z.number().positive(),
});

export const withdrawSchema = z.object({
  addr: z.string(),
  inrAmount: z.number().positive(),
});

// Portfolio schemas
export const balanceSchema = z.object({
  BTC: z.number().default(0),
  ETH: z.number().default(0),
  MATIC: z.number().default(0),
  BNB: z.number().default(0),
  INR: z.number().default(0),
});

export const portfolioSchema = z.object({
  walletAddress: z.string(),
  balances: balanceSchema,
  totalValue: z.number(),
  pnl: z.number(),
  pnlPercentage: z.number(),
  transactions: z.array(transactionSchema),
});

// Price schemas
export const priceSchema = z.object({
  BTC: z.number(),
  ETH: z.number(),
  MATIC: z.number(),
  BNB: z.number(),
  timestamp: z.string(),
});

// Order book schemas
export const orderSchema = z.object({
  price: z.number(),
  amount: z.number(),
});

export const orderBookSchema = z.object({
  symbol: z.string(),
  bids: z.array(orderSchema),
  asks: z.array(orderSchema),
  timestamp: z.string(),
});

// Crypto lab schemas
export const cipherInputSchema = z.object({
  text: z.string(),
  key: z.string().optional(),
  shift: z.number().optional(),
});

export const hashInputSchema = z.object({
  message: z.string(),
});

export const hmacInputSchema = z.object({
  message: z.string(),
  key: z.string(),
});

export const rsaKeyPairSchema = z.object({
  publicKey: z.string(),
  privateKey: z.string(),
  keySize: z.number(),
});

// Types
export type Wallet = z.infer<typeof walletSchema>;
export type CreateWallet = z.infer<typeof createWalletSchema>;
export type ImportWallet = z.infer<typeof importWalletSchema>;
export type SignMessage = z.infer<typeof signMessageSchema>;
export type VerifyMessage = z.infer<typeof verifyMessageSchema>;
export type Transaction = z.infer<typeof transactionSchema>;
export type BuyOrder = z.infer<typeof buyOrderSchema>;
export type SellOrder = z.infer<typeof sellOrderSchema>;
export type Send = z.infer<typeof sendSchema>;
export type Deposit = z.infer<typeof depositSchema>;
export type Withdraw = z.infer<typeof withdrawSchema>;
export type Balance = z.infer<typeof balanceSchema>;
export type Portfolio = z.infer<typeof portfolioSchema>;
export type Price = z.infer<typeof priceSchema>;
export type OrderBook = z.infer<typeof orderBookSchema>;
export type Order = z.infer<typeof orderSchema>;
export type CipherInput = z.infer<typeof cipherInputSchema>;
export type HashInput = z.infer<typeof hashInputSchema>;
export type HmacInput = z.infer<typeof hmacInputSchema>;
export type RsaKeyPair = z.infer<typeof rsaKeyPairSchema>;
