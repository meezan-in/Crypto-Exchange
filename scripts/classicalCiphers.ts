/* ---------------------------------------------
   DEMO 4 – Classical Ciphers
   Run:  node --loader ts-node/esm scripts/classicalCiphers.ts
---------------------------------------------- */
import prompt from 'prompt-sync';
import chalk from 'chalk';

const p = prompt({ sigint: true });
const text = p('Plaintext : ').toLowerCase();

/* ---------- Caesar (+3) ---------- */
const caesar = text.replace(/[a-z]/g, ch =>
  String.fromCharCode(((ch.charCodeAt(0) - 97 + 3) % 26) + 97)
);

/* ---------- Vigenère ("crypto") ---------- */
const key = 'crypto';
let vig = '';
for (let i = 0, j = 0; i < text.length; i++) {
  const c = text[i];
  if (/[a-z]/.test(c)) {
    const shift = key.charCodeAt(j % key.length) - 97;
    vig += String.fromCharCode(((c.charCodeAt(0) - 97 + shift) % 26) + 97);
    j++;
  } else vig += c;
}

console.log(chalk.green('\n== RESULTS =='));
console.log('Caesar (+3):', caesar);
console.log(`Vigenère ("${key}") :`, vig, '\n');
