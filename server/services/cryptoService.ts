import crypto from 'crypto';
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from 'bip39';
import { HDNodeWallet, Wallet as EthersWallet } from 'ethers';
import CryptoJS from 'crypto-js';

export class CryptoService {
  // Generate BIP-39 mnemonic
  generateMnemonic(): string {
    return generateMnemonic();
  }

  // Validate BIP-39 mnemonic
  validateMnemonic(mnemonic: string): boolean {
    return validateMnemonic(mnemonic);
  }

  // Derive wallet from mnemonic
  deriveWallet(mnemonic: string, index: number = 0): { address: string; privateKey: string } {
    const seed = mnemonicToSeedSync(mnemonic);
    const hdWallet = HDNodeWallet.fromSeed(seed);
    const wallet = hdWallet.derivePath(`m/44'/60'/0'/0/${index}`);
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
    };
  }

  // Derive AES key using PBKDF2
  deriveKey(passphrase: string, salt: Buffer): Buffer {
    return crypto.pbkdf2Sync(passphrase, salt, 100000, 32, 'sha256');
  }

  // Encrypt private key with AES-256-GCM
  encryptPrivateKey(privateKey: string, passphrase: string): {
    encryptedPrivateKey: string;
    salt: string;
    iv: string;
    authTag: string;
  } {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12); // 12 bytes is recommended for GCM
    const key = this.deriveKey(passphrase, salt);

    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from('privatekey'));

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encryptedPrivateKey: encrypted,
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
    };
  }

  // Decrypt private key with AES-256-GCM
  decryptPrivateKey(
    encryptedPrivateKey: string,
    passphrase: string,
    salt: string,
    iv: string,
    authTag: string
  ): string {
    const saltBuffer = Buffer.from(salt, 'hex');
    const ivBuffer = Buffer.from(iv, 'hex');
    const authTagBuffer = Buffer.from(authTag, 'hex');
    const key = this.deriveKey(passphrase, saltBuffer);

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, ivBuffer);
    decipher.setAAD(Buffer.from('privatekey'));
    decipher.setAuthTag(authTagBuffer);

    let decrypted = decipher.update(encryptedPrivateKey, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  // Sign message with private key
  signMessage(message: string, privateKey: string): string {
    const wallet = new EthersWallet(privateKey);
    return wallet.signMessageSync(message);
  }

  // Verify message signature
  verifyMessage(message: string, signature: string): string {
    return EthersWallet.verifyMessage(message, signature);
  }

  // Classical cipher implementations
  caesarCipher(text: string, shift: number, encrypt: boolean = true): string {
    const direction = encrypt ? 1 : -1;
    return text.replace(/[A-Za-z]/g, (char) => {
      const start = char <= 'Z' ? 65 : 97;
      return String.fromCharCode(((char.charCodeAt(0) - start + shift * direction + 26) % 26) + start);
    });
  }

  vigenereCipher(text: string, key: string, encrypt: boolean = true): string {
    const result = [];
    let keyIndex = 0;

    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char.match(/[A-Za-z]/)) {
        const start = char <= 'Z' ? 65 : 97;
        const keyChar = key[keyIndex % key.length].toUpperCase();
        const shift = keyChar.charCodeAt(0) - 65;
        const direction = encrypt ? 1 : -1;

        const newChar = String.fromCharCode(
          ((char.charCodeAt(0) - start + shift * direction + 26) % 26) + start
        );
        result.push(newChar);
        keyIndex++;
      } else {
        result.push(char);
      }
    }

    return result.join('');
  }

  // DES encryption using crypto-js
  desEncrypt(plaintext: string, key: string): string {
    const keyBytes = CryptoJS.enc.Hex.parse(key);
    const plaintextBytes = CryptoJS.enc.Hex.parse(plaintext);
    const encrypted = CryptoJS.DES.encrypt(plaintextBytes, keyBytes, {
      mode: CryptoJS.mode.ECB,
      padding: CryptoJS.pad.NoPadding
    });
    return encrypted.ciphertext.toString(CryptoJS.enc.Hex);
  }

  // AES encryption (AES-256-CBC)
  aesEncrypt(plaintext: string, keySize: 128 | 256 = 256): {
    ciphertext: string;
    key: string;
    iv: string;
  } {
    const key = crypto.randomBytes(keySize / 8);
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(`aes-${keySize}-cbc`, key, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return {
      ciphertext: encrypted,
      key: key.toString('hex'),
      iv: iv.toString('hex'),
    };
  }

  // RSA key pair generation
  generateRsaKeyPair(keySize: 1024 | 2048 | 4096 = 2048): {
    publicKey: string;
    privateKey: string;
    keySize: number;
  } {
    const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: keySize,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });

    return {
      publicKey,
      privateKey,
      keySize,
    };
  }

  // RSA encryption
  rsaEncrypt(message: string, publicKey: string): string {
    return crypto.publicEncrypt(publicKey, Buffer.from(message)).toString('base64');
  }

  // RSA decryption
  rsaDecrypt(ciphertext: string, privateKey: string): string {
    return crypto.privateDecrypt(privateKey, Buffer.from(ciphertext, 'base64')).toString('utf8');
  }

  // Hash functions
  calculateHashes(message: string): {
    md5: string;
    sha256: string;
    sha3: string;
  } {
    return {
      md5: crypto.createHash('md5').update(message).digest('hex'),
      sha256: crypto.createHash('sha256').update(message).digest('hex'),
      sha3: crypto.createHash('sha3-256').update(message).digest('hex'),
    };
  }

  // HMAC calculation
  calculateHmac(message: string, key: string): string {
    return crypto.createHmac('sha256', key).update(message).digest('hex');
  }

  // HMAC verification
  verifyHmac(message: string, key: string, expectedHmac: string): boolean {
    const calculatedHmac = this.calculateHmac(message, key);
    return crypto.timingSafeEqual(
      Buffer.from(calculatedHmac, 'hex'),
      Buffer.from(expectedHmac, 'hex')
    );
  }
}

export const cryptoService = new CryptoService();
