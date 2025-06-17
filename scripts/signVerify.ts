/* ---------------------------------------------
   DEMO 3 – Sign & verify a message (ECDSA)
   Run:  node --loader ts-node/esm scripts/signVerify.ts
---------------------------------------------- */
import { Wallet, verifyMessage } from 'ethers';
import prompt from 'prompt-sync';
import chalk from 'chalk';

const p = prompt({ sigint: true });
const mnemonic = p('Paste 12‑word MNEMONIC: ');
const wallet   = Wallet.fromPhrase(mnemonic);

const message  = p('Message to sign      : ');

const signature = await wallet.signMessage(message);

console.log(chalk.green('\n== SIGNATURE =='));
console.log(signature);

const recovered = verifyMessage(message, signature);

console.log(chalk.blue('\n== VERIFICATION =='));
console.log('Recovered address:', recovered);
console.log(recovered === wallet.address ? chalk.yellow('\n✔ Valid Signature\n')
                                         : chalk.red('\n❌ Invalid Signature\n'));
