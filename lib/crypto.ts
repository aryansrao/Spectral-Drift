import { WORDS } from './wordlist';

// ─── BINARY / HEX HELPERS ────────────────────────────────────────────────────
function buf2b64(buf: ArrayBuffer): string {
  const b = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s);
}

function b642buf(b64: string): ArrayBuffer {
  const bin = atob(b64);
  const b = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i);
  return b.buffer;
}

function buf2hex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

export async function sha256hex(str: string): Promise<string> {
  return buf2hex(
    await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))
  );
}

export function rndHex(n = 8): string {
  return buf2hex(crypto.getRandomValues(new Uint8Array(n)).buffer as ArrayBuffer);
}

// ─── PKCS#8 DER HELPER ──────────────────────────────────────────────────────
// Manually construct PKCS#8 DER for a raw P-256 private key (32 bytes).
// Web Crypto cannot import raw EC private keys directly.
function rawP256ToPKCS8(raw32: Uint8Array): ArrayBuffer {
  const der = new Uint8Array(67);
  let i = 0;
  der[i++] = 0x30; der[i++] = 0x41; // SEQUENCE (65 bytes)
  der[i++] = 0x02; der[i++] = 0x01; der[i++] = 0x00; // INTEGER 0 (version)
  der[i++] = 0x30; der[i++] = 0x13; // AlgorithmIdentifier SEQUENCE (19 bytes)
  der[i++] = 0x06; der[i++] = 0x07; // OID ecPublicKey
  der.set([0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01], i); i += 7;
  der[i++] = 0x06; der[i++] = 0x08; // OID prime256v1
  der.set([0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07], i); i += 8;
  der[i++] = 0x04; der[i++] = 0x27; // OCTET STRING wrapping ECPrivateKey
  der[i++] = 0x30; der[i++] = 0x25; // ECPrivateKey SEQUENCE (37 bytes)
  der[i++] = 0x02; der[i++] = 0x01; der[i++] = 0x01; // INTEGER 1 (version)
  der[i++] = 0x04; der[i++] = 0x20; // OCTET STRING 32 bytes (private scalar)
  der.set(raw32, i);
  return der.buffer;
}

// ─── SEED PHRASE HELPERS ─────────────────────────────────────────────────────
export function genSeedPhrase(): string {
  const entropy = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(entropy).map(b => WORDS[b]).join(' ');
}

export function validatePhrase(phrase: string): string[] {
  const words = phrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length !== 12) throw new Error(`Expected 12 words, got ${words.length}`);
  words.forEach(w => {
    if (!WORDS.includes(w)) throw new Error(`Unknown word: "${w}"`);
  });
  return words;
}

// ─── KEY DERIVATION ──────────────────────────────────────────────────────────
export interface KeyPair {
  privateKey: CryptoKey;
  publicKey: CryptoKey;
  pubB64: string;
}

export async function seedPhraseToKeypair(phrase: string): Promise<{
  privateKey: CryptoKey;
  publicKey: CryptoKey;
}> {
  const words = validatePhrase(phrase);
  const entropy = new Uint8Array(words.map(w => WORDS.indexOf(w)));

  const baseKey = await crypto.subtle.importKey(
    'raw', entropy, { name: 'PBKDF2' }, false, ['deriveBits']
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: new TextEncoder().encode('spectral-drift-v1-seed'),
      iterations: 210000,
      hash: 'SHA-256',
    },
    baseKey,
    256
  );
  const raw32 = new Uint8Array(derived);

  const privKey = await crypto.subtle.importKey(
    'pkcs8', rawP256ToPKCS8(raw32),
    { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']
  );

  const jwk = await crypto.subtle.exportKey('jwk', privKey) as JsonWebKey;
  const pubKey = await crypto.subtle.importKey(
    'jwk', { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y },
    { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']
  );

  return { privateKey: privKey, publicKey: pubKey };
}

export async function exportPubB64(key: CryptoKey): Promise<string> {
  return buf2b64(await crypto.subtle.exportKey('spki', key));
}

export async function exportPubHex(key: CryptoKey): Promise<string> {
  return buf2hex(await crypto.subtle.exportKey('spki', key));
}

// ─── SIGNING / VERIFYING ─────────────────────────────────────────────────────
export async function signObj(obj: object, privateKey: CryptoKey): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, privateKey, bytes);
  return buf2b64(sig);
}

const pkCache = new Map<string, CryptoKey>();

export async function verifyObj(obj: object, sig: string, pkB64: string): Promise<boolean> {
  try {
    let k = pkCache.get(pkB64);
    if (!k) {
      k = await crypto.subtle.importKey(
        'spki', b642buf(pkB64),
        { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']
      );
      pkCache.set(pkB64, k);
    }
    const bytes = new TextEncoder().encode(JSON.stringify(obj));
    return await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' }, k, b642buf(sig), bytes
    );
  } catch {
    return false;
  }
}

// Re-export buf2b64 for use in game engine
export { buf2b64, b642buf };
