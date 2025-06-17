import { v4 as uuidv4 } from 'uuid';
import { Wallet, CreateWallet, ImportWallet, SignMessage, VerifyMessage } from "@shared/schema";
import { cryptoService } from './cryptoService';
import { storage } from '../storage';

export class WalletService {
  async createWallet(data: CreateWallet): Promise<Wallet> {
    // Generate mnemonic
    const mnemonic = cryptoService.generateMnemonic();
    
    // Derive wallet from mnemonic
    const { address, privateKey } = cryptoService.deriveWallet(mnemonic);
    
    // Encrypt private key
    const encryptionData = cryptoService.encryptPrivateKey(privateKey, data.passphrase);
    
    // Create wallet object
    const wallet: Wallet = {
      id: uuidv4(),
      address,
      encryptedPrivateKey: encryptionData.encryptedPrivateKey,
      salt: encryptionData.salt,
      iv: encryptionData.iv,
      authTag: encryptionData.authTag,
      mnemonic, // Store mnemonic for demo purposes (in production, user should save this)
      createdAt: new Date().toISOString(),
    };
    
    // Store wallet
    return await storage.createWallet(wallet);
  }

  async importWallet(data: ImportWallet): Promise<Wallet> {
    // Validate mnemonic
    if (!cryptoService.validateMnemonic(data.mnemonic)) {
      throw new Error('Invalid mnemonic phrase');
    }
    
    // Derive wallet from mnemonic
    const { address, privateKey } = cryptoService.deriveWallet(data.mnemonic);
    
    // Check if wallet already exists
    const existingWallet = await storage.getWallet(address);
    if (existingWallet) {
      throw new Error('Wallet already exists');
    }
    
    // Encrypt private key
    const encryptionData = cryptoService.encryptPrivateKey(privateKey, data.passphrase);
    
    // Create wallet object
    const wallet: Wallet = {
      id: uuidv4(),
      address,
      encryptedPrivateKey: encryptionData.encryptedPrivateKey,
      salt: encryptionData.salt,
      iv: encryptionData.iv,
      authTag: encryptionData.authTag,
      mnemonic: data.mnemonic,
      createdAt: new Date().toISOString(),
    };
    
    // Store wallet
    return await storage.createWallet(wallet);
  }

  async signMessage(address: string, data: SignMessage): Promise<{ signature: string }> {
    // Get wallet
    const wallet = await storage.getWallet(address);
    if (!wallet) {
      throw new Error('Wallet not found');
    }
    
    try {
      // Decrypt private key
      const privateKey = cryptoService.decryptPrivateKey(
        wallet.encryptedPrivateKey,
        data.passphrase,
        wallet.salt,
        wallet.iv,
        wallet.authTag
      );
      
      // Sign message
      const signature = cryptoService.signMessage(data.message, privateKey);
      
      return { signature };
    } catch (error) {
      throw new Error('Invalid passphrase or failed to decrypt wallet');
    }
  }

  async verifyMessage(address: string, data: VerifyMessage): Promise<{ valid: boolean; recoveredAddress: string }> {
    try {
      const recoveredAddress = cryptoService.verifyMessage(data.message, data.signature);
      const valid = recoveredAddress.toLowerCase() === address.toLowerCase();
      
      return { valid, recoveredAddress };
    } catch (error) {
      return { valid: false, recoveredAddress: '' };
    }
  }

  async getAllWallets(): Promise<Wallet[]> {
    return await storage.getAllWallets();
  }

  async getWallet(address: string): Promise<Wallet | undefined> {
    return await storage.getWallet(address);
  }
}

export const walletService = new WalletService();
