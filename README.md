# Spectral Drift

An open-world multiplayer ghost realm running entirely in the browser. No servers, no accounts, no downloads. Players generate a 12-word seed phrase, derive a P-256 cryptographic identity from it, and enter a shared 3D world to collect scarce orbs, transfer them to other spirits, and communicate via proximity-based spatial voice chat. Every transaction is signed, hashed, and validated independently by every peer. The network is the players.

Live at [spectraldrift.vercel.app](https://spectraldrift.vercel.app)

---

## Project Structure

```
app/
├── layout.tsx                Root layout — Geist + Geist Mono via next/font, global metadata
├── globals.css               CSS variables, Tailwind v4 base, animations
├── page.tsx                  Landing page (Server Component)
├── ads/
│   └── page.tsx              Advertising page (Server Component)
└── realm/
    └── page.tsx              Game page ('use client' — Three.js/WebRTC/Web Crypto)
components/
├── nav/
│   └── Nav.tsx               Shared nav — ghost SVG logo, Lucide icons, CTA
├── landing/                  Hero, Features, HowItWorks, Security, Economy,
│                             Advertising, TechStack, CtaBand, Footer, ScrollReveal
├── ads/                      AdsNav, AdsHero, HowBillboardWorks, Specs, Contact, AdsFooter
└── realm/
    ├── GameEngine.tsx         'use client' — Three.js + P2P engine inside a single useEffect
    ├── Loader.tsx             Loading overlay + seed phrase setup form
    ├── HudPill.tsx            Top HUD pill (ghost count, coords, mic, wallet)
    ├── Panels.tsx             Wallet, Teleport, Customize modal panels
    ├── Minimap.tsx            Minimap canvas
    └── Chat.tsx               Chat input bar
lib/
├── crypto.ts                  ECDSA P-256, PBKDF2, SHA-256, signing — typed
├── ledger.ts                  Append-only distributed ledger, validateTx, getBalance
├── world.ts                   Seeded RNG, genOrbDefs, genAdDefs
└── wordlist.ts                256-word BIP39-style wordlist
```

---

## Stack

| Concern | Choice | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.7 |
| UI | React | 19.2.7 |
| Styling | Tailwind CSS | 4.3.0 |
| Icons | Lucide React | 1.17.0 |
| Language | TypeScript | 6.0.3 |
| Fonts | next/font/google (Geist, Geist Mono, Boldonse) | — |
| 3D Engine | Three.js | ^0.175.0 |
| P2P | Trystero (via esm.sh, torrent strategy) | 0.21.4 |
| Deploy | Vercel | — |

---

## Architecture Overview

Spectral Drift is structured around three interlocking systems that all run client-side:

1. A cryptographic identity and ledger system built on the Web Crypto API
2. A real-time peer-to-peer mesh network built on WebRTC via Trystero
3. A 3D game world rendered with Three.js and post-processed with UnrealBloom

These three systems are deliberately decoupled. The crypto layer does not know about WebRTC. The P2P layer broadcasts signed messages it cannot forge. The rendering layer reads from the same ledger state as the crypto layer. The only coordination point is the in-memory ledger and the localStorage persistence layer.

The game engine (`GameEngine.tsx`) is a single `'use client'` component. React renders the DOM structure — loader, HUD, panels, minimap, chat. A single `useEffect` fires once on mount and initializes the full Three.js scene, Trystero P2P connection, Web Crypto keypair derivation, Web Audio voice pipeline, and the game loop. All DOM nodes are accessed via `document.getElementById` inside the effect, which is safe since React has fully mounted the DOM before effects run.

---

## Rendering Engine

### Three.js

Three.js is installed as an npm package and imported directly:

```ts
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
```

The scene is configured with:

- `THREE.Scene` with `FogExp2` exponential fog (`density: 0.009`) for distance falloff
- `THREE.PerspectiveCamera` with a 62-degree field of view, near plane at 0.1, far plane at 600
- `THREE.WebGLRenderer` with antialiasing enabled, pixel ratio capped at 1.5, `ACESFilmicToneMapping`
- Camera follows the local player with a lerp factor of 0.065

### Post-Processing Pipeline

1. `RenderPass` — standard scene render to a buffer
2. `UnrealBloomPass` — bloom with strength `0.35`, radius `1.0`, threshold `0`
3. `OutputPass` — linear to sRGB conversion

### CSS2D Renderer

`CSS2DRenderer` projects HTML DOM elements into 3D space using the same camera matrices as the WebGL renderer. Used for ghost name labels, speech bubbles, and in-world ad billboard cards.

### Ghost Geometry

Each ghost body is a modified `THREE.SphereGeometry(2, 20, 20)`. Bottom-hemisphere vertices are deformed:

```js
p[i + 1] = -2 + Math.sin(x * 5) * .35 + Math.cos(z * 4) * .25 + Math.sin((x + z) * 3) * .15
```

This geometry is shared across all ghosts via the `GGEO` constant.

---

## Cryptographic Identity System

### Wordlist

A custom 256-word wordlist. 256 words encode exactly 8 bits of entropy per word. Twelve words = 96 bits of entropy — computationally infeasible to brute-force.

### Seed Phrase Generation

```ts
function genSeedPhrase(): string {
  const entropy = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(entropy).map(b => WORDS[b]).join(' ');
}
```

### Key Derivation: PBKDF2

```ts
const derived = await crypto.subtle.deriveBits({
  name: 'PBKDF2',
  salt: new TextEncoder().encode('spectral-drift-v1-seed'),
  iterations: 210000,
  hash: 'SHA-256'
}, baseKey, 256);
```

210,000 iterations is the OWASP-recommended minimum for PBKDF2-SHA256. The salt is a domain separator. Output is 32 bytes — the raw P-256 private key scalar.

The 32-byte scalar is wrapped in a manually-constructed PKCS#8 DER structure before import via `crypto.subtle.importKey('pkcs8', ...)`.

### Transaction Signing

Every orb claim and transfer is signed with ECDSA P-256:

```ts
const sig = await crypto.subtle.sign(
  { name: 'ECDSA', hash: 'SHA-256' },
  privateKey,
  new TextEncoder().encode(JSON.stringify(payload))
);
```

The transaction ID is `SHA-256(JSON.stringify({...payload, sig}))` — deterministic and recomputable by any peer.

---

## Distributed Ledger

The ledger is an append-only array of signed transaction objects. Two types exist: `claim` and `transfer`.

`validateTx` enforces: malformed → duplicate → blacklisted → bad_sig → bad_hash → already_claimed → invalid_orb → self_transfer → negative → insufficient → empty → ok.

Only cryptographically fraudulent transactions (`bad_sig`, `bad_hash`, `negative`, `malformed`) trigger strikes. At 3 strikes, all transactions from that public key are purged and their orbs restored.

`getBalance(pk)` replays the full ledger on each call — no cached balance. This ensures correctness after any purge or sync event.

Ledger persisted to `localStorage` under `sd-ledger-v2`. On storage full, trims to last 800 transactions.

---

## Orb World Generation

500 orbs total — 400 common, 80 uncommon, 20 rare. Positions are generated with a seeded deterministic RNG (`mulberry32`, seeded `0xCAFEBABE`) so all players compute the same layout without network coordination. Orb positions are never transmitted over P2P.

Claim threshold: 2.5 world units. Claim detection is rate-limited to 300ms intervals. A sync lock prevents claims for 10 seconds after recovery (3 seconds for returning users) to avoid racing the ledger sync.

---

## P2P Networking

### Trystero

```ts
const { joinRoom } = await import('https://esm.sh/trystero@0.21.4/torrent');
```

Dynamically imported inside the game `useEffect` to avoid SSR issues. Uses BitTorrent trackers as signaling infrastructure — no dedicated server required.

Six message actions: `s` (position), `c` (chat), `h` (hello/identity), `tx` (transaction), `ld` (ledger chunk), `rl` (ledger request).

New peers receive the full local ledger in 200-transaction chunks. All received transactions are validated before being applied — ledger sync cannot inject fraudulent entries.

---

## Voice Chat

Microphone via `getUserMedia` with echo cancellation, noise suppression, and auto gain control. Volume attenuates with distance using a quadratic falloff: `(1 - t)^2` between 2 and 12 world units. Speaking detection uses `AnalyserNode` RMS energy threshold (`> 0.003`).

---

## Ad System

Ads are 3D glowing billboards defined in `AD_CONFIG`. Positions are seeded-deterministic (RNG `0xDEADBEEF`, different from orb RNG). Orbs spawn near ad positions to create natural player traffic.

Proximity triggers: glow intensifies within 9 units, URL auto-opens within 4.5 units with 45-second cooldown. Ads appear as `★` markers on the minimap in the ad's custom hex color.

---

## Security Headers

Applied via `next.config.ts` to all routes:

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(self), geolocation=()`
- `Content-Security-Policy` — restricts scripts to self + esm.sh (for Trystero dynamic import); `unsafe-eval` required by Three.js shader compilation

---

## Fonts

| Font | Source | Usage |
|---|---|---|
| Geist | `next/font/google` | All landing + ads page text |
| Geist Mono | `next/font/google` | Labels, code, tech pills, HUD text |
| Boldonse | Google Fonts (inline import in realm) | Loader screen title |

All fonts are served through Next.js's font optimization — no render-blocking CDN requests.

---

## Deployment

Spectral Drift is deployed on Vercel. `npm run build` produces an optimized static export. All three routes (`/`, `/ads`, `/realm`) are statically prerendered at build time.

```bash
npm install
npm run dev      # Turbopack dev server
npm run build    # Production build
npm run start    # Production server
```

---

## Technology Reference

| Technology | Version | Role |
|---|---|---|
| Next.js | 16.2.7 | Framework, routing, SSG, font optimization |
| React | 19.2.7 | UI components |
| TypeScript | 6.0.3 | Type safety across game engine and lib modules |
| Tailwind CSS | 4.3.0 | Styling — marketing pages |
| Lucide React | 1.17.0 | Icons (replaces all emoji icons) |
| Three.js | ^0.175.0 | 3D scene, geometry, lighting, materials |
| Trystero | 0.21.4 (esm.sh) | WebRTC P2P mesh via BitTorrent trackers |
| EffectComposer | three/examples/jsm | Post-processing pipeline |
| UnrealBloomPass | three/examples/jsm | Bloom glow effect |
| CSS2DRenderer | three/examples/jsm | HTML label overlay in 3D space |
| Web Crypto API | Browser native | ECDSA P-256, PBKDF2, SHA-256 |
| WebRTC | Browser native (via Trystero) | P2P data channels and media streams |
| Web Audio API | Browser native | Proximity voice analysis and volume |
| Canvas 2D API | Browser native | Minimap, landing page particle background |
| localStorage | Browser native | Ledger, seed phrase, player profile |
| Vercel | Edge CDN | Hosting and global distribution |
| WebTorrent Trackers | openwebtorrent.com, webtorrent.dev | Trystero peer signaling |
