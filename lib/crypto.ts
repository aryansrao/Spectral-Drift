import { schnorr } from '@noble/curves/secp256k1.js';
import { WORDS } from './wordlist';

// ─── BINARY HELPERS ──────────────────────────────────────────────────────────
export function hexToBytes(hex: string): Uint8Array {
  const b = new Uint8Array(hex.length / 2);
  for (let i = 0; i < b.length; i++) b[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  return b;
}

export function bytesToHex(b: Uint8Array): string {
  return Array.from(b).map(x => x.toString(16).padStart(2, '0')).join('');
}

export async function sha256hex(str: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return bytesToHex(new Uint8Array(buf));
}

async function sha256bytes(str: string): Promise<Uint8Array> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
  return new Uint8Array(buf);
}

export function rndHex(n = 8): string {
  return bytesToHex(crypto.getRandomValues(new Uint8Array(n)));
}

// ─── SEED PHRASE ─────────────────────────────────────────────────────────────
export function genSeedPhrase(): string {
  const entropy = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(entropy).map(b => WORDS[b]).join(' ');
}

export function validatePhrase(phrase: string): string[] {
  const words = phrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length !== 12) throw new Error(`Expected 12 words, got ${words.length}`);
  words.forEach(w => { if (!WORDS.includes(w)) throw new Error(`Unknown word: "${w}"`) });
  return words;
}

// ─── KEY PAIR ─────────────────────────────────────────────────────────────────
// Uses secp256k1 (Bitcoin/Nostr curve) + Schnorr signatures.
// Web Crypto PBKDF2 still derives the 32-byte key material.

export interface KeyPair {
  privKey: Uint8Array; // 32 bytes
  pubHex: string;      // 64-char hex x-only public key (NIP-01 format)
}

export async function seedPhraseToKeypair(phrase: string): Promise<KeyPair> {
  const words = validatePhrase(phrase);
  const entropy = new Uint8Array(words.map(w => WORDS.indexOf(w)));

  const baseKey = await crypto.subtle.importKey(
    'raw', entropy, { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: new TextEncoder().encode('spectral-drift-v1-seed'), iterations: 210000, hash: 'SHA-256' },
    baseKey,
    256
  );
  const privKey = new Uint8Array(derived);
  const pubKey = schnorr.getPublicKey(privKey);
  return { privKey, pubHex: bytesToHex(pubKey) };
}

// ─── SIGNING / VERIFYING ─────────────────────────────────────────────────────
// sig = 128-char hex Schnorr signature

export async function signObj(obj: object, privKey: Uint8Array): Promise<string> {
  const msgHash = await sha256bytes(JSON.stringify(obj));
  const sig = schnorr.sign(msgHash, privKey);
  return bytesToHex(sig);
}

export async function verifyObj(
  obj: object,
  sigHex: string,
  pubHex: string
): Promise<boolean> {
  try {
    const msgHash = await sha256bytes(JSON.stringify(obj));
    return schnorr.verify(hexToBytes(sigHex), msgHash, hexToBytes(pubHex));
  } catch {
    return false;
  }
}
