/* ---------------------------------------------
   DEMO 2 – AES‑256‑GCM encrypt / decrypt
   Run:  node --loader ts-node/esm scripts/encryptPrivateKey.ts
---------------------------------------------- */
import * as crypto from 'node:crypto';
import prompt from 'prompt-sync';
import chalk from 'chalk';

const p = prompt({ sigint: true });
const privateKey = p('Enter PRIVATE KEY to encrypt: ');
const passphrase = p('Choose a PASSPHRASE        : ', { echo: '*' });

/* ----- Derive AES‑256 key via PBKDF2‑HMAC‑SHA‑256 ----- */
const salt = crypto.randomBytes(16);
const key  = crypto.pbkdf2Sync(passphrase, salt, 100_000, 32, 'sha256');

/* ----- Encrypt with AES‑256‑GCM ----- */
const iv     = crypto.randomBytes(16);
const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
let encrypted = cipher.update(privateKey, 'utf8', 'hex');
encrypted += cipher.final('hex');
const authTag = cipher.getAuthTag().toString('hex');

console.log(chalk.green('\n== ENCRYPTED OUTPUT =='));
console.log({ iv: iv.toString('hex'), salt: salt.toString('hex'), authTag, cipherText: encrypted });

/* ----- Decrypt to verify ----- */
const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
decipher.setAuthTag(Buffer.from(authTag, 'hex'));
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');

console.log(chalk.blue('\n== DECRYPTION CHECK =='));
console.log('Decrypted value:', decrypted);
console.log(chalk.yellow('\n✔  Encryption round‑trip successful!\n'));
