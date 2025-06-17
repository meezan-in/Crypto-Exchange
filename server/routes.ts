import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { walletService } from "./services/walletService";
import { exchangeService } from "./services/exchangeService";
import { cryptoService } from "./services/cryptoService";
import { priceService } from "./services/priceService";
import {
  createWalletSchema,
  importWalletSchema,
  signMessageSchema,
  verifyMessageSchema,
  buyOrderSchema,
  sellOrderSchema,
  sendSchema,
  depositSchema,
  withdrawSchema,
  cipherInputSchema,
  hashInputSchema,
  hmacInputSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time price updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store connected clients
  const clients = new Set<WebSocket>();
  
  wss.on('connection', (ws) => {
    clients.add(ws);
    console.log('Client connected to WebSocket');
    
    // Send current prices on connection
    const currentPrices = storage.getCurrentPrices();
    if (currentPrices) {
      ws.send(JSON.stringify({ type: 'prices', data: currentPrices }));
    }
    
    ws.on('close', () => {
      clients.delete(ws);
      console.log('Client disconnected from WebSocket');
    });
  });

  // Function to broadcast prices to all connected clients
  const broadcastPrices = (prices: any) => {
    const message = JSON.stringify({ type: 'prices', data: prices });
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  };

  // Fetch prices every 30 seconds
  const updatePrices = async () => {
    try {
      const prices = await priceService.fetchPrices();
      await storage.updatePrices(prices);
      
      // Update order books
      const symbols: Array<keyof typeof prices> = ['BTC', 'ETH', 'MATIC', 'BNB'];
      for (const symbol of symbols) {
        if (symbol !== 'timestamp') {
          const price = prices[symbol] as number;
          const orderBook = priceService.generateOrderBook(symbol, price);
          await storage.updateOrderBook(symbol, orderBook);
        }
      }
      
      broadcastPrices(prices);
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  };

  // Initial price fetch and setup interval
  updatePrices();
  setInterval(updatePrices, 30000);

  // Wallet routes
  app.post('/api/wallets/create', async (req, res) => {
    try {
      const data = createWalletSchema.parse(req.body);
      const wallet = await walletService.createWallet(data);
      res.json(wallet);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  app.post('/api/wallets/import', async (req, res) => {
    try {
      const data = importWalletSchema.parse(req.body);
      const wallet = await walletService.importWallet(data);
      res.json(wallet);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Invalid request' });
    }
  });

  app.get('/api/wallets', async (req, res) => {
    try {
      const wallets = await walletService.getAllWallets();
      res.json(wallets);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch wallets' });
    }
  });

  app.post('/api/wallets/:addr/sign', async (req, res) => {
    try {
      const { addr } = req.params;
      const data = signMessageSchema.parse(req.body);
      const result = await walletService.signMessage(addr, data);
      res.json(result);
    } catch (error) {
      const status = error instanceof Error && error.message.includes('Invalid passphrase') ? 401 : 400;
      res.status(status).json({ message: error instanceof Error ? error.message : 'Sign failed' });
    }
  });

  app.post('/api/wallets/:addr/verify', async (req, res) => {
    try {
      const { addr } = req.params;
      const data = verifyMessageSchema.parse(req.body);
      const result = await walletService.verifyMessage(addr, data);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Verify failed' });
    }
  });

  // Trading routes
  app.post('/api/tx/buy', async (req, res) => {
    try {
      const data = buyOrderSchema.parse(req.body);
      const includeTds = req.query.includeTds !== 'false';
      const transaction = await exchangeService.buyOrder(data, includeTds);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Buy order failed' });
    }
  });

  app.post('/api/tx/sell', async (req, res) => {
    try {
      const data = sellOrderSchema.parse(req.body);
      const includeTds = req.query.includeTds !== 'false';
      const transaction = await exchangeService.sellOrder(data, includeTds);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Sell order failed' });
    }
  });

  app.post('/api/tx/send', async (req, res) => {
    try {
      const data = sendSchema.parse(req.body);
      const transaction = await exchangeService.sendCrypto(data);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Send failed' });
    }
  });

  app.post('/api/tx/deposit', async (req, res) => {
    try {
      const data = depositSchema.parse(req.body);
      const transaction = await exchangeService.depositFiat(data);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Deposit failed' });
    }
  });

  app.post('/api/tx/withdraw', async (req, res) => {
    try {
      const data = withdrawSchema.parse(req.body);
      const transaction = await exchangeService.withdrawFiat(data);
      res.json(transaction);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Withdraw failed' });
    }
  });

  // Portfolio routes
  app.get('/api/portfolio/:addr', async (req, res) => {
    try {
      const { addr } = req.params;
      const portfolio = await exchangeService.getPortfolio(addr);
      res.json(portfolio);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : 'Failed to fetch portfolio' });
    }
  });

  // Market data routes
  app.get('/api/prices/live', async (req, res) => {
    try {
      const prices = await storage.getCurrentPrices();
      if (!prices) {
        return res.status(404).json({ message: 'Price data not available' });
      }
      res.json(prices);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch prices' });
    }
  });

  app.get('/api/orderbook/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      const orderBook = await storage.getOrderBook(symbol.toUpperCase());
      if (!orderBook) {
        return res.status(404).json({ message: 'Order book not found' });
      }
      res.json(orderBook);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch order book' });
    }
  });

  // Crypto Lab routes
  app.post('/api/crypto-lab/caesar', async (req, res) => {
    try {
      const { text, shift } = cipherInputSchema.parse(req.body);
      const encrypted = cryptoService.caesarCipher(text, shift || 3, true);
      const decrypted = cryptoService.caesarCipher(encrypted, shift || 3, false);
      res.json({ encrypted, decrypted });
    } catch (error) {
      res.status(400).json({ message: 'Caesar cipher failed' });
    }
  });

  app.post('/api/crypto-lab/vigenere', async (req, res) => {
    try {
      const { text, key } = cipherInputSchema.parse(req.body);
      if (!key) {
        return res.status(400).json({ message: 'Key is required for Vigenère cipher' });
      }
      const encrypted = cryptoService.vigenereCipher(text, key, true);
      const decrypted = cryptoService.vigenereCipher(encrypted, key, false);
      res.json({ encrypted, decrypted });
    } catch (error) {
      res.status(400).json({ message: 'Vigenère cipher failed' });
    }
  });

  app.post('/api/crypto-lab/des', async (req, res) => {
    try {
      const { text, key } = cipherInputSchema.parse(req.body);
      if (!key) {
        return res.status(400).json({ message: 'Key is required for DES' });
      }
      const encrypted = cryptoService.desEncrypt(text, key);
      res.json({ encrypted });
    } catch (error) {
      res.status(400).json({ message: 'DES encryption failed' });
    }
  });

  app.post('/api/crypto-lab/aes', async (req, res) => {
    try {
      const { text } = cipherInputSchema.parse(req.body);
      const keySize = req.body.keySize === 128 ? 128 : 256;
      const result = cryptoService.aesEncrypt(text, keySize);
      res.json(result);
    } catch (error) {
      res.status(400).json({ message: 'AES encryption failed' });
    }
  });

  app.post('/api/crypto-lab/rsa/generate', async (req, res) => {
    try {
      const keySize = req.body.keySize || 2048;
      const keyPair = cryptoService.generateRsaKeyPair(keySize);
      
      // Store key pair for later use
      const id = Date.now().toString();
      await storage.storeRsaKeyPair(id, keyPair);
      
      res.json({ ...keyPair, id });
    } catch (error) {
      res.status(400).json({ message: 'RSA key generation failed' });
    }
  });

  app.post('/api/crypto-lab/rsa/encrypt', async (req, res) => {
    try {
      const { message, publicKey } = req.body;
      const encrypted = cryptoService.rsaEncrypt(message, publicKey);
      res.json({ encrypted });
    } catch (error) {
      res.status(400).json({ message: 'RSA encryption failed' });
    }
  });

  app.post('/api/crypto-lab/rsa/decrypt', async (req, res) => {
    try {
      const { ciphertext, privateKey } = req.body;
      const decrypted = cryptoService.rsaDecrypt(ciphertext, privateKey);
      res.json({ decrypted });
    } catch (error) {
      res.status(400).json({ message: 'RSA decryption failed' });
    }
  });

  app.post('/api/crypto-lab/hash', async (req, res) => {
    try {
      const { message } = hashInputSchema.parse(req.body);
      const hashes = cryptoService.calculateHashes(message);
      res.json(hashes);
    } catch (error) {
      res.status(400).json({ message: 'Hash calculation failed' });
    }
  });

  app.post('/api/crypto-lab/hmac', async (req, res) => {
    try {
      const { message, key } = hmacInputSchema.parse(req.body);
      const hmac = cryptoService.calculateHmac(message, key);
      res.json({ hmac });
    } catch (error) {
      res.status(400).json({ message: 'HMAC calculation failed' });
    }
  });

  app.post('/api/crypto-lab/hmac/verify', async (req, res) => {
    try {
      const { message, key } = hmacInputSchema.parse(req.body);
      const { hmac } = req.body;
      const valid = cryptoService.verifyHmac(message, key, hmac);
      res.json({ valid });
    } catch (error) {
      res.status(400).json({ message: 'HMAC verification failed' });
    }
  });

  return httpServer;
}
