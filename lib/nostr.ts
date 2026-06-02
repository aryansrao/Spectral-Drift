import { schnorr } from '@noble/curves/secp256k1.js';
import { hexToBytes, bytesToHex } from './crypto';

// ─── NOSTR EVENT ─────────────────────────────────────────────────────────────
// NIP-01 compliant events. Kind 30078 = NIP-78 arbitrary app data.
// Tag ["d", GAME_TAG] makes events addressable per pubkey.

export const GAME_TAG = 'spectral-drift-nostr-v1';
export const EVENT_KIND = 30078;

const RELAYS = [
  'wss://relay.nostr.band',
  'wss://nos.lol',
  'wss://relay.damus.io',
  'wss://nostr.wine',
];

export interface NostrEvent {
  id: string;
  pubkey: string;
  created_at: number;
  kind: number;
  tags: string[][];
  content: string;
  sig: string;
}

async function buildEvent(
  content: string,
  privKey: Uint8Array,
  pubHex: string
): Promise<NostrEvent> {
  const created_at = Math.floor(Date.now() / 1000);
  const kind = EVENT_KIND;
  const tags: string[][] = [['d', GAME_TAG]];

  // NIP-01 event ID = SHA-256 of serialized event (before sig)
  const serialized = JSON.stringify([0, pubHex, created_at, kind, tags, content]);
  const idBuf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(serialized));
  const id = bytesToHex(new Uint8Array(idBuf));

  const sig = bytesToHex(schnorr.sign(hexToBytes(id), privKey));

  return { id, pubkey: pubHex, created_at, kind, tags, content, sig };
}

// ─── RELAY CLIENT ────────────────────────────────────────────────────────────
type RelaySocket = { ws: WebSocket; url: string; ready: boolean };

let sockets: RelaySocket[] = [];
let eventHandlers: ((ev: NostrEvent) => void)[] = [];

function connectRelay(url: string): RelaySocket {
  const relay: RelaySocket = { ws: new WebSocket(url), url, ready: false };
  relay.ws.onopen = () => {
    relay.ready = true;
    // Subscribe to all game events from any pubkey
    relay.ws.send(JSON.stringify([
      'REQ',
      'game-ledger',
      { kinds: [EVENT_KIND], '#d': [GAME_TAG], limit: 5000 }
    ]));
  };
  relay.ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data as string) as unknown[];
      if (msg[0] === 'EVENT' && typeof msg[2] === 'object' && msg[2] !== null) {
        eventHandlers.forEach(h => h(msg[2] as NostrEvent));
      }
    } catch { /* ignore malformed */ }
  };
  relay.ws.onclose = () => {
    relay.ready = false;
    setTimeout(() => {
      const idx = sockets.indexOf(relay);
      if (idx !== -1) sockets[idx] = connectRelay(url);
    }, 5000);
  };
  relay.ws.onerror = () => relay.ws.close();
  return relay;
}

export function initNostrRelays(): void {
  sockets = RELAYS.map(connectRelay);
}

export function onNostrEvent(handler: (ev: NostrEvent) => void): () => void {
  eventHandlers.push(handler);
  return () => { eventHandlers = eventHandlers.filter(h => h !== handler) };
}

export async function publishTx(
  tx: object,
  privKey: Uint8Array,
  pubHex: string
): Promise<void> {
  const event = await buildEvent(JSON.stringify(tx), privKey, pubHex);
  const msg = JSON.stringify(['EVENT', event]);
  for (const relay of sockets) {
    if (relay.ready) {
      try { relay.ws.send(msg) } catch { /* relay down */ }
    }
  }
}

export function closeNostrRelays(): void {
  sockets.forEach(r => r.ws.close());
  sockets = [];
  eventHandlers = [];
}
