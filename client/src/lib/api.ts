import { apiRequest } from "./queryClient";

export interface CreateWalletRequest {
  passphrase: string;
}

export interface ImportWalletRequest {
  mnemonic: string;
  passphrase: string;
}

export interface SignMessageRequest {
  message: string;
  passphrase: string;
}

export interface VerifyMessageRequest {
  message: string;
  signature: string;
}

export interface BuyOrderRequest {
  addr: string;
  symbol: string;
  inrAmount: number;
}

export interface SellOrderRequest {
  addr: string;
  symbol: string;
  cryptoAmount: number;
}

export interface SendRequest {
  fromAddr: string;
  toAddr: string;
  symbol: string;
  amount: number;
}

export interface DepositRequest {
  addr: string;
  inrAmount: number;
}

export interface WithdrawRequest {
  addr: string;
  inrAmount: number;
}

// Wallet API
export const walletApi = {
  create: async (data: CreateWalletRequest) => {
    const response = await apiRequest('POST', '/api/wallets/create', data);
    return response.json();
  },

  import: async (data: ImportWalletRequest) => {
    const response = await apiRequest('POST', '/api/wallets/import', data);
    return response.json();
  },

  getAll: async () => {
    const response = await apiRequest('GET', '/api/wallets');
    return response.json();
  },

  signMessage: async (address: string, data: SignMessageRequest) => {
    const response = await apiRequest('POST', `/api/wallets/${address}/sign`, data);
    return response.json();
  },

  verifyMessage: async (address: string, data: VerifyMessageRequest) => {
    const response = await apiRequest('POST', `/api/wallets/${address}/verify`, data);
    return response.json();
  },
};

// Trading API
export const tradingApi = {
  buy: async (data: BuyOrderRequest, includeTds: boolean = true) => {
    const url = `/api/tx/buy?includeTds=${includeTds}`;
    const response = await apiRequest('POST', url, data);
    return response.json();
  },

  sell: async (data: SellOrderRequest, includeTds: boolean = true) => {
    const url = `/api/tx/sell?includeTds=${includeTds}`;
    const response = await apiRequest('POST', url, data);
    return response.json();
  },

  send: async (data: SendRequest) => {
    const response = await apiRequest('POST', '/api/tx/send', data);
    return response.json();
  },

  deposit: async (data: DepositRequest) => {
    const response = await apiRequest('POST', '/api/tx/deposit', data);
    return response.json();
  },

  withdraw: async (data: WithdrawRequest) => {
    const response = await apiRequest('POST', '/api/tx/withdraw', data);
    return response.json();
  },
};

// Portfolio API
export const portfolioApi = {
  get: async (address: string) => {
    const response = await apiRequest('GET', `/api/portfolio/${address}`);
    return response.json();
  },
};

// Market Data API
export const marketApi = {
  getPrices: async () => {
    const response = await apiRequest('GET', '/api/prices/live');
    return response.json();
  },

  getOrderBook: async (symbol: string) => {
    const response = await apiRequest('GET', `/api/orderbook/${symbol}`);
    return response.json();
  },
};

// Crypto Lab API
export const cryptoLabApi = {
  caesar: async (text: string, shift: number) => {
    const response = await apiRequest('POST', '/api/crypto-lab/caesar', { text, shift });
    return response.json();
  },

  vigenere: async (text: string, key: string) => {
    const response = await apiRequest('POST', '/api/crypto-lab/vigenere', { text, key });
    return response.json();
  },

  des: async (text: string, key: string) => {
    const response = await apiRequest('POST', '/api/crypto-lab/des', { text, key });
    return response.json();
  },

  aes: async (text: string, keySize: number = 256) => {
    const response = await apiRequest('POST', '/api/crypto-lab/aes', { text, keySize });
    return response.json();
  },

  generateRsa: async (keySize: number = 2048) => {
    const response = await apiRequest('POST', '/api/crypto-lab/rsa/generate', { keySize });
    return response.json();
  },

  rsaEncrypt: async (message: string, publicKey: string) => {
    const response = await apiRequest('POST', '/api/crypto-lab/rsa/encrypt', { message, publicKey });
    return response.json();
  },

  rsaDecrypt: async (ciphertext: string, privateKey: string) => {
    const response = await apiRequest('POST', '/api/crypto-lab/rsa/decrypt', { ciphertext, privateKey });
    return response.json();
  },

  hash: async (message: string) => {
    const response = await apiRequest('POST', '/api/crypto-lab/hash', { message });
    return response.json();
  },

  hmac: async (message: string, key: string) => {
    const response = await apiRequest('POST', '/api/crypto-lab/hmac', { message, key });
    return response.json();
  },

  verifyHmac: async (message: string, key: string, hmac: string) => {
    const response = await apiRequest('POST', '/api/crypto-lab/hmac/verify', { message, key, hmac });
    return response.json();
  },
};
