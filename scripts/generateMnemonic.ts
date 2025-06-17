/* ---------------------------------------------
   DEMO 1 – Generate BIP‑39 mnemonic + wallet
   Run:  node --loader ts-node/esm scripts/generateMnemonic.ts
---------------------------------------------- */
import { generateMnemonic } from 'bip39';
import { Wallet } from 'ethers';             // v6
import chalk from 'chalk';

const mnemonic = generateMnemonic(128);      // 12‑word
const wallet   = Wallet.fromPhrase(mnemonic); // HD derivation m/44'/60'/0'/0/0

console.log(chalk.green.bold('\n== BIP‑39 MNEMONIC =='));
console.log(mnemonic);

console.log(chalk.blue('\n== WALLET DETAILS =='));
console.log('Address     :', wallet.address);
console.log('Public Key  :', wallet.publicKey);
console.log('Private Key :', wallet.privateKey);
console.log('\n⚠️  Keep the mnemonic & private key secret!\n');
