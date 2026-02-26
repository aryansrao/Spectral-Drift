# Spectral Drift

An open-world multiplayer ghost realm running entirely in the browser. No servers, no accounts, no downloads. Players generate a 12-word seed phrase, derive a P-256 cryptographic identity from it, and enter a shared 3D world to collect scarce orbs, transfer them to other spirits, and communicate via proximity-based spatial voice chat. Every transaction is signed, hashed, and validated independently by every peer. The network is the players.

Live at [spectraldrift.netlify.app](https://spectraldrift.netlify.app)

---

## Project Structure

```
/
├── index.html        Landing and marketing page (served at /)
├── ads/
│   └── index.html    Advertising page for in-world billboard slots (served at /ads)
└── realm/
    └── index.html    The game itself — all engine, crypto, and P2P logic (served at /realm)
```

Each route is a self-contained HTML file with no build steps, no bundlers, and no server-side code. Netlify serves `ads/index.html` at `/ads` and `realm/index.html` at `/realm` by its default directory index resolution. Everything runs in the browser.

---

## Architecture Overview

Spectral Drift is structured around three interlocking systems that all run client-side:

1. A cryptographic identity and ledger system built on the Web Crypto API
2. A real-time peer-to-peer mesh network built on WebRTC via Trystero
3. A 3D game world rendered with Three.js and post-processed with UnrealBloom

These three systems are deliberately decoupled. The crypto layer does not know about WebRTC. The P2P layer broadcasts signed messages it cannot forge. The rendering layer reads from the same ledger state as the crypto layer. The only coordination point is the in-memory ledger and the localStorage persistence layer.

---

## Rendering Engine

### Three.js r160

Three.js is loaded directly from [esm.sh](https://esm.sh), a CDN that serves npm packages as native ES modules. The specific version pinned is `three@0.160`.

```js
import * as THREE from 'https://esm.sh/three@0.160';
```

The scene is configured with:

- `THREE.Scene` with `FogExp2` exponential fog (`density: 0.009`) to create distance falloff without a hard clip
- `THREE.PerspectiveCamera` with a 62-degree field of view, near plane at 0.1, far plane at 600
- `THREE.WebGLRenderer` with antialiasing enabled, pixel ratio capped at 1.5 to prevent mobile GPU overload, `ACESFilmicToneMapping` for high-dynamic-range color grading, and tone mapping exposure set to 0.88
- Camera follows the local player with a lerp factor of 0.065, creating smooth camera lag

The renderer output element has `z-index: 1` so the HUD, panels, and CSS2D labels layer above it without any additional compositing tricks.

### Post-Processing Pipeline

Post-processing is done via Three.js's `EffectComposer` pipeline:

```js
import { EffectComposer } from '...EffectComposer.js';
import { RenderPass }     from '...RenderPass.js';
import { UnrealBloomPass } from '...UnrealBloomPass.js';
import { OutputPass }     from '...OutputPass.js';
```

The pipeline is ordered as:

1. `RenderPass` — standard scene render to a buffer
2. `UnrealBloomPass` — bloom applied with strength `0.35`, radius `1.0`, threshold `0`. A threshold of zero means every pixel contributes to the bloom, including the dark ghost bodies. This gives the emissive materials (ghost glow, orbs, ad pillars) a soft halo without relying on HDR texture data.
3. `OutputPass` — converts from internal linear color space to sRGB for display

All three passes are resized on window resize along with the renderer and label renderer.

### CSS2D Renderer

```js
import { CSS2DRenderer, CSS2DObject } from '...CSS2DRenderer.js';
```

`CSS2DRenderer` is a supplementary Three.js renderer that projects HTML DOM elements into 3D space. It uses the same camera matrices as the WebGL renderer but outputs positioned `div` elements rather than pixels.

It is used for:
- Ghost name labels and chat speech bubbles (`class="glabel"`)
- In-world ad billboard cards (`class="ad-label"`)

The CSS2DRenderer's DOM element is positioned `fixed` over the canvas with `pointer-events: none` globally, with `pointer-events: auto` explicitly re-enabled on clickable elements (the ad billboard boards).

### Ghost Geometry

Each ghost body is a modified `THREE.SphereGeometry(2, 20, 20)`. After generation, the code iterates over all vertices with a Y position below -0.2 (the bottom hemisphere) and deforms them to create a wavy skirt:

```js
p[i + 1] = -2 + Math.sin(x * 5) * .35 + Math.cos(z * 4) * .25 + Math.sin((x + z) * 3) * .15
```

`computeVertexNormals()` is called after deformation so lighting is correct. This geometry is shared across all ghosts via the `GGEO` constant — it is created once and referenced by every ghost instance's `THREE.Mesh`.

Each ghost uses `MeshStandardMaterial` for the body (PBR-shaded, with roughness 0.02 for a near-mirror surface and high emissive intensity), and `MeshBasicMaterial` (unlit) for the eye sockets, eye glows, and outer eye rings.

Ghost animation runs per-frame in `animGhost()`:
- Body bobs vertically with two overlaid sine waves
- Emissive intensity pulses with a sine wave
- Body leans in movement direction via `rotation.z` and `rotation.x` with lerp smoothing
- Body breathes (uniform scale oscillation)
- Eye opacity tracks movement speed and lerps to a target value

### Orb Meshes

Orbs are `SphereGeometry` instances with `MeshStandardMaterial`. Each tier has defined physical parameters:

| Type     | Radius | Emissive Color | Emissive Intensity |
|----------|--------|----------------|--------------------|
| Common   | 0.28   | `#00ff77`      | 4.5                |
| Uncommon | 0.38   | `#55aaff`      | 4.5                |
| Rare     | 0.54   | `#ffcc00`      | 6.5                |

Orbs are visibility-culled at 45 world units from the player. Within 30 units (squared distance 900), they animate: `rotation.y` increments each frame, and `emissiveIntensity` pulses with a sine wave keyed to the orb's ID so no two orbs pulse in sync. The vertical float uses `Math.sin(t * 2 + orb.id * 0.693)`.

Claimed orbs have their mesh removed from the scene and their geometry and material disposed to free GPU memory.

### Ad Billboard Meshes

Each ad consists of three Three.js objects:

1. A `CylinderGeometry(0.07, 0.07, 3.5, 8)` post with `MeshStandardMaterial` — the emissive color is set to the advertiser's custom hex color. The post is rotated 90 degrees on the X axis to stand upright in the XY world plane (since the camera faces down the Z axis).
2. A `SphereGeometry(0.18, 8, 8)` cap at the top of the post using `MeshBasicMaterial` — unlit, so it always shows at full brightness.
3. A `PointLight` centered on the post with the ad's color, intensity 0.6, range 12 units, and decay 2.

The emissive intensity and light intensity both pulse with a sine function in `tickAds()`. When the player is within `AD_NEARBY_DIST` (9 units), intensity increases and a pulse multiplier is applied. The cap floats up and down on its own sine wave offset from the main pulse.

### Firefly Particles

18 ambient firefly particles are placed in the scene. Each is a tiny `SphereGeometry(0.05)` with `MeshBasicMaterial`. They move with a random velocity vector that accumulates small random impulses each frame. When they drift more than 22 units (X) or 14 units (Y) from the player, they are repositioned near the player again to create the illusion of infinite ambient particles.

---

## Lighting

The scene uses three light sources:

- `AmbientLight(0x0a0a2e, 0.1)` — deep blue-black ambient, barely visible, just enough to prevent absolute black shadows
- `DirectionalLight(0x4a90e2, 0.65)` — blue key light from upper-left
- `DirectionalLight(0x50e3c2, 0.4)` — teal fill light from lower-right
- `PointLight(0x4488ff, 0.35, 90, 1.5)` — a persistent blue point light following the camera, centered in the scene, adding depth to nearby objects

Each ad also adds its own `PointLight`, so ads function as light sources that affect orbs and other geometry nearby.

---

## Cryptographic Identity System

### Wordlist

The identity system begins with a custom 256-word wordlist. 256 words is deliberate: each word encodes exactly 8 bits of entropy. Twelve words provide 96 bits of entropy (`8 × 12 = 96`), which is computationally infeasible to brute-force.

The wordlist is validated at runtime:
```js
console.assert(WORDLIST.length === 256, 'Wordlist must be 256 words');
```

### Seed Phrase Generation

```js
function genSeedPhrase() {
  const entropy = crypto.getRandomValues(new Uint8Array(12));
  return Array.from(entropy).map(b => WORDLIST[b]).join(' ');
}
```

`crypto.getRandomValues` is the browser's CSPRNG (Cryptographically Secure Pseudo-Random Number Generator), backed by the operating system's entropy source. Each byte maps directly to a word index in the 256-word list. The phrase is space-separated and stored as a plain string.

### Key Derivation: PBKDF2

The seed phrase is converted to a keypair via PBKDF2 (Password-Based Key Derivation Function 2). The implementation uses the Web Crypto API's `SubtleCrypto.deriveBits`:

```js
const derived = await crypto.subtle.deriveBits({
  name: 'PBKDF2',
  salt: new TextEncoder().encode('spectral-drift-v1-seed'),
  iterations: 210000,
  hash: 'SHA-256'
}, baseKey, 256);
```

210,000 iterations is the OWASP-recommended minimum for PBKDF2-SHA256 as of 2023. The salt `spectral-drift-v1-seed` is a domain separator that prevents cross-application rainbow table attacks. The output is 256 bits (32 bytes), which becomes the raw P-256 private key scalar.

The input to PBKDF2 is the word indices, not the word strings. Each word maps to its index in the wordlist (0-255), and those byte values are the raw entropy input.

### PKCS#8 Manual DER Construction

The Web Crypto API cannot import raw EC private key scalars directly — it requires PKCS#8 DER-encoded keys for EC keys. The 32-byte derived scalar is wrapped manually in a PKCS#8 DER structure:

```js
function rawP256ToPKCS8(raw32) {
  const der = new Uint8Array(67);
  // ... manual DER byte construction
  return der.buffer; // 67 bytes total
}
```

The DER structure encodes:
- `SEQUENCE` wrapping the whole key info (PrivateKeyInfo)
- `INTEGER 0` for the version field
- `AlgorithmIdentifier SEQUENCE` containing:
  - OID `1.2.840.10045.2.1` for `ecPublicKey`
  - OID `1.2.840.10045.3.1.7` for `prime256v1` (the P-256 curve)
- `OCTET STRING` wrapping an `ECPrivateKey` which contains the 32-byte scalar

This is then imported via `crypto.subtle.importKey('pkcs8', ...)`.

### P-256 Keypair and Public Key Export

After importing the private key, the public key is extracted by:

1. Exporting the private key as JWK (JSON Web Key) — which includes the `x` and `y` coordinates of the corresponding public point on the curve
2. Re-importing just `{ kty, crv, x, y }` as a `verify`-only key

The public key is then exported in SPKI (SubjectPublicKeyInfo) DER format and base64-encoded for use as a unique player identity string:

```js
myPK = buf2b64(await crypto.subtle.exportKey('spki', myKP.publicKey));
```

The short display ID is the first 8 hex characters of the SHA-256 hash of the public key:
```js
myShortId = (await sha256hex(myPK)).slice(0, 8).toUpperCase();
```

### Transaction Signing

Every orb claim and orb transfer is signed with ECDSA P-256:

```js
async function signObj(obj) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, myKP.privateKey, bytes);
  return buf2b64(sig);
}
```

The transaction ID is derived independently of the signature by hashing the entire serialized `{...data, sig}` object:

```js
const id = await sha256hex(JSON.stringify({ ...data, sig }));
```

This means the ID is deterministic — any peer can recompute it from the transaction payload and verify it matches.

### Transaction Verification

Verification re-derives the expected hash and checks the signature:

```js
async function verifyObj(obj, sig, pkStr) {
  const bytes = new TextEncoder().encode(JSON.stringify(obj));
  const k = await getPK(pkStr);
  return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, b642buf(sig), bytes);
}
```

Public keys are cached in `pkCache` (a `Map`) to avoid re-importing the same key on every verification.

---

## Distributed Ledger

### Data Model

The ledger is an append-only array of transaction objects. Two transaction types exist:

**Claim transaction:**
```js
{
  type: 'claim',
  from: myPK,       // claimer's public key (SPKI base64)
  to: myPK,         // same as from for claims
  orbId: orb.id,    // integer index into orbDefs[]
  orbType: orb.type,
  nonce: rndHex(),  // 8-byte random hex to prevent replay
  ts: Date.now(),   // millisecond timestamp
  sig: '...',       // ECDSA P-256 signature of the above fields (base64)
  id: '...'         // SHA-256(JSON.stringify({...data, sig}))
}
```

**Transfer transaction:**
```js
{
  type: 'transfer',
  from: senderPK,
  to: recipientPK,
  amount: { common: N, uncommon: N, rare: N },
  nonce: rndHex(),
  ts: Date.now(),
  sig: '...',
  id: '...'
}
```

### Validation Rules

`validateTx(tx)` enforces the following rules in order, returning a verdict string:

- `malformed` — missing required fields
- `duplicate` — `txSet` already contains this ID (replay protection)
- `blacklisted` — sender has accumulated 3 or more cheat strikes
- `bad_sig` — ECDSA signature does not verify against sender's public key
- `bad_hash` — recomputed SHA-256 ID does not match the claimed ID
- `already_claimed` — for claims: another valid transaction already claimed this orb ID
- `invalid_orb` — orb ID out of range or type mismatch
- `self_transfer` — sender and recipient are the same key
- `negative` — any transfer amount is below zero
- `insufficient` — sender's balance is too low
- `empty` — all transfer amounts are zero
- `unknown_type` — transaction type is not `claim` or `transfer`
- `ok` — all checks passed

### Strike and Blacklist System

Only cryptographically fraudulent transactions trigger strikes: `bad_sig`, `bad_hash`, `negative`, `malformed`, `unknown_type`. Race conditions (`already_claimed`, `duplicate`, `insufficient`) never trigger strikes because they are legitimate outcomes of the decentralized system where two players might claim the same orb simultaneously.

At 3 strikes, `purgeAccount(pk)` runs:
1. Finds all claim transactions from the cheater
2. Removes all transactions involving that public key from the ledger
3. Clears and rebuilds `txSet`
4. Restores all orb meshes that were claimed by the cheater (via `restoreOrbMesh`)
5. Re-saves the ledger to localStorage

### Balance Calculation

`getBalance(pk)` is computed by replaying the entire ledger every time it is called — there is no cached balance. This is intentional: it ensures correctness after any ledger modification (purge, sync, new transactions):

```js
function getBalance(pk) {
  const b = { common: 0, uncommon: 0, rare: 0 };
  for (const tx of ledger) {
    if (tx.type === 'claim' && tx.from === pk) b[tx.orbType]++;
    else if (tx.type === 'transfer') {
      if (tx.from === pk) ORB_TYPES.forEach(k => b[k] -= (tx.amount[k] || 0));
      if (tx.to === pk) ORB_TYPES.forEach(k => b[k] += (tx.amount[k] || 0));
    }
  }
  return b;
}
```

### Persistence

The ledger is stored in `localStorage` under the key `sd-ledger-v2`. On save, if `localStorage` is full, the code silently trims to the last 800 transactions before retrying.

Player profiles are stored under two keys:
- `sd-name`, `sd-glow`, `sd-eye` — generic keys for fast same-device load
- `sd-profile-{shortId}` — identity-keyed JSON for cross-device recovery via seed phrase

The seed phrase itself is stored under `sd-phrase`.

Last-seen timestamps per public key are stored under `sd-lastseen` as a JSON object mapping public key strings to millisecond timestamps. This enables the "lost orbs" calculation.

### Supply Analytics

`getSupplyStats()` computes a real-time breakdown of all 500 orbs:

- **In World (Unclaimed):** total minus all claim transactions
- **Held by Spirits:** sum of balances for active public keys (me + currently connected peers)
- **Lost:** sum of balances for all historical public keys not currently active (analogous to Bitcoin's lost coins)

This data is rendered in the wallet panel's supply statistics grid with bar fill indicators.

---

## Orb World Generation

### Deterministic Seeded RNG

```js
function mkRng(seed) {
  let a = seed;
  return () => {
    a |= 0;
    a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
```

This is a variant of the MurmurHash3 finalizer — a non-cryptographic hash function repurposed as a stateful PRNG. It produces the same sequence for the same seed on every device in every browser. `WORLD_RNG` is seeded with `0xCAFEBABE`.

### Orb Placement

`genOrbDefs()` generates all 500 orb definitions by iterating through the type list (common 400 times, uncommon 80 times, rare 20 times) and calling `WORLD_RNG()` twice per orb to generate X and Y coordinates within `±ORB_SPREAD` (160 units). The result is an array of 500 objects:

```js
{ id: 0..499, type: 'common'|'uncommon'|'rare', x, y, claimed: false, mesh: null }
```

Because the RNG is seeded and stateless across runs, every player generates the exact same `orbDefs` array. Orb positions are never communicated over the network — they are always derived locally.

### Claim Proximity and Sync Lock

Orb claims are checked in `checkClaims()`, which runs every frame but rate-limits itself to at most once every 300ms. The claim distance threshold is 2.5 world units.

On first load (new user) or after seed phrase recovery, a `claimLockUntil` timestamp is set to `Date.now() + SYNC_WINDOW_MS` (10 seconds for recovery, 3 seconds for returning users). During this window, `checkClaims()` returns early, preventing the player from racing to claim orbs before the network ledger has been received from peers. When a peer sends a ledger chunk containing more than 5 transactions, the lock is shortened to 1.5 seconds from now.

---

## P2P Networking

### Trystero

```js
import { joinRoom } from 'https://esm.sh/trystero@0.21.4/torrent';
```

Trystero is a WebRTC signaling and room management library that uses BitTorrent tracker servers as its signaling infrastructure — no dedicated STUN/TURN or WebSocket server is required. The `torrent` strategy specifically means Trystero announces peers to and discovers peers from BitTorrent trackers using the room ID as the info-hash-like identifier.

Two trackers are configured for redundancy:
```js
trackerUrls: [
  'wss://tracker.openwebtorrent.com',
  'wss://tracker.webtorrent.dev'
]
```

`relayRedundancy: 2` means Trystero will attempt to connect through both trackers simultaneously.

Room configuration:
- `appId`: `spectral-drift-ghost-world-v3` — namespaces the app within the tracker
- `ROOM_ID`: `ghost-realm-main-v3` — the specific room everyone joins

### Message Actions

Trystero's `room.makeAction(name)` creates a send/receive pair for a named real-time data channel. Six actions are defined:

| Action Key | Purpose |
|------------|---------|
| `s` | Position/state updates sent on every move (120ms throttle) |
| `c` | Chat messages |
| `h` | Hello/identity broadcast (on join, and every 20 seconds) |
| `tx` | Single signed transaction broadcast |
| `ld` | Full ledger chunk (sent to new peer on join, 200 tx per chunk) |
| `rl` | Ledger request (defined but used structurally) |

### Peer Lifecycle

When a peer joins:
1. `sendHello` sends the local player's state plus public key and short ID
2. The local ledger is sent in chunks of 200 transactions to the new peer
3. If a local microphone stream exists, it is added to the new peer

When a `hello` is received from a peer:
- If a stream was received before the hello (race condition), it is attached now
- The peer's entry in `remotes` is created or updated

When a peer leaves:
- Audio elements are cleaned up and disconnected from the Web Audio graph
- The ghost mesh group is removed from the Three.js scene
- The peer is removed from `remotes`
- If `remotes` is now empty, the HUD connection status changes to "Share link to invite" mode

State updates (`s` action) are rate-limited to 120ms intervals and only sent when the player is moving. Hello updates (`h` action) are sent every 20 seconds as a heartbeat.

### Ledger Sync

When a new peer connects, the full local ledger is sent in 200-transaction chunks. The receiving end calls `applyTx(tx, false)` on each — the `false` flag means "do not re-broadcast." Because `applyTx` validates signatures and hashes, a malicious peer cannot inject fraudulent transactions via the ledger sync path.

Received ledger chunks trigger `showSyncBadge()` if any new valid transactions were applied, and update the wallet HUD.

---

## Voice Chat

### Web Audio API

Voice chat is implemented using WebRTC media streams (via Trystero's `room.addStream` / `room.onPeerStream`) and the Web Audio API for analysis.

The `AudioContext` is created lazily on first user interaction (`ensureAudioCtx()`) to satisfy browser autoplay policies.

Microphone capture uses `getUserMedia` with echo cancellation, noise suppression, and auto gain control enabled:

```js
navigator.mediaDevices.getUserMedia({
  audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
  video: false
})
```

### Spatial Audio

Audio volume is calculated per-peer based on distance using a quadratic falloff:

```js
function distToGain(d) {
  if (d <= VOICE_FULL) return 1;          // VOICE_FULL = 2 units
  if (d >= VOICE_RANGE) return 0;         // VOICE_RANGE = 12 units
  const t = (d - VOICE_FULL) / (VOICE_RANGE - VOICE_FULL);
  return Math.max(0, Math.min(1, (1 - t) * (1 - t)));
}
```

This is `(1 - t)^2` — a quadratic ease-out curve that sounds perceptually more natural than linear falloff. Beyond 12 units, voices are fully silent.

### Speaking Detection

An `AnalyserNode` is connected to each peer's incoming audio stream:

```js
const src = audioCtx.createMediaStreamSource(stream);
const analyser = audioCtx.createAnalyser();
analyser.fftSize = 512;
src.connect(analyser);
```

Speaking detection reads time-domain waveform data each frame and computes RMS energy:
```js
e.analyser.getByteTimeDomainData(e._speakBuf);
let sum = 0;
for (let i = 0; i < e._speakBuf.length; i++) {
  const v = e._speakBuf[i] / 128 - 1;
  sum += v * v;
}
return (sum / e._speakBuf.length) > 0.003;
```

When speaking is detected, a green pulsing dot is prepended to the ghost's name label in the CSS2D layer.

---

## Ad System

### Configuration

Ads are defined in `AD_CONFIG` at the top of the game script as a plain array of objects:

```js
const AD_CONFIG = [
  { title: '...', desc: '...', url: 'https://...', color: '#ff9900' },
];
```

Up to 5 slots are supported in the current build. The entire ad system — placement, triggering, cooldown, minimap rendering — is driven by this array.

### Placement

Ad positions are calculated in `genAdDefs()` using a separate seeded RNG (`0xDEADBEEF`, different from the orb RNG so ads do not disturb orb layout). Each ad is anchored to an orb in `orbDefs` at a step-spaced index (`step = floor(orbDefs.length / AD_CONFIG.length)`), then offset 3-7 units away in a random direction. This means:

- Ad positions are deterministic across all devices
- Ads are always near orb clusters, creating natural player traffic
- Ad positions and orb positions never overlap

### Proximity Triggers

`tickAds(t)` runs every frame and evaluates each ad:

- Beyond `AD_VIS_DIST` (50 units): post, cap, and label are hidden
- Within `AD_NEARBY_DIST` (9 units): billboard glow intensifies, the "Walk closer to visit" CTA becomes visible, the board gets a colored box-shadow matching the ad's hex color
- Within `AD_TRIGGER_DIST` (4.5 units): `visitAd(ad)` is called automatically

`visitAd` checks `AD_COOLDOWN_MS` (45 seconds) before opening the URL and records the visit timestamp. Users can also click the billboard at any time to visit regardless of distance.

### Minimap Rendering

Ads appear as `★` markers on the minimap canvas, rendered after all orb dots in `drawAdsMm()`. The marker is drawn in the ad's custom hex color. The minimap checks that the world-space position maps to within the circular clip region before rendering.

---

## Minimap

The minimap is a 120×120 pixel `<canvas>` element clipped to a circle using `ctx.arc` + `ctx.clip()`. It renders at half the frame rate (every other frame via `mmTick % 2`).

`MM_RANGE` is 38 world units — the minimap shows a 76×76 unit square of the world. `mmScale = R / MM_RANGE` (where `R = 60`, the canvas radius) converts world-space distances to canvas pixels.

Contents rendered in order:
1. Dark background fill
2. Scrolling grid lines that move with the player position
3. Unclaimed orb dots (color-coded, size varies by rarity)
4. Mouse hover crosshairs and coordinate preview
5. Remote ghost markers with radial gradient halos and initial-letter labels
6. Ad `★` markers
7. Local player dot with a pulsing radial gradient glow
8. Compass labels (N, S, E, W)
9. Circular border stroke

---

## Game Loop

The main loop is a standard `requestAnimationFrame` loop. Delta time is capped at 50ms to prevent physics tunneling on tab background/restore.

Per-frame operations:
1. Input reading (keyboard WASD/arrows, touch drag vector)
2. Player position update and state broadcast (throttled to 120ms)
3. Local player ghost animation
4. Camera lerp to player position
5. Orb visibility culling and animation
6. Claim detection (rate-limited to 300ms)
7. Ad tick (glow, proximity triggers)
8. Remote ghost interpolation (lerp factor 0.12), audio volume update, speaking detection
9. Firefly particle simulation
10. `composer.render()` (WebGL)
11. `labelRen.render()` (CSS2D)
12. Minimap draw (every 2 frames)

"Cheap" animation mode activates for remote ghosts beyond 30 units squared. In cheap mode, emissive intensity pulsing, body rotation, and scale animation are skipped, reducing per-ghost CPU cost.

---

## Input System

### Keyboard

`keydown` and `keyup` events populate a `keys` object keyed by `e.code`. Movement checks `KeyA`, `KeyD`, `KeyW`, `KeyS`, and `ArrowLeft`, `ArrowRight`, `ArrowUp`, `ArrowDown`. Movement direction is normalized before applying speed so diagonal movement is not faster.

The `isTyping()` function checks whether any input field is focused. When typing, all movement keys are suppressed. A blur event on `window` (tab switch) clears all key states.

### Touch

Touch input uses a drag gesture. `touchstart` records `tO` (origin), `touchmove` updates `tC` (current). Each frame, if both are set and the drag distance exceeds 10px, a normalized direction vector is computed and applied identically to keyboard movement. Touch events on HUD elements are excluded by a closest-ancestor check.

### Chat and Teleport Command

The chat input accepts `/tp x y`, `/goto x y`, and `/teleport x y` commands. These are parsed via a regex in `parseTp()` and call `doTeleport()` instead of broadcasting a chat message.

Teleport flashes a full-screen radial gradient (`#tpflash`) for 90ms, then snaps the player position, broadcasts the new state, and removes the flash after 300ms.

---

## HUD

The HUD pill is a fixed, horizontally scrollable bar at the top center. It is a single `div` with `border-radius: 99px` containing multiple segments separated by 1px dividers. On screens narrower than 420px, the connection status segment is hidden.

Segments (left to right):
- Ghost count (total players including self)
- P2P connection status with colored dot indicator
- Current coordinates (clickable, opens teleport panel)
- Microphone status (clickable, toggles voice)
- Orb wallet summary (clickable, opens wallet panel)
- Customize button (opens ghost customization panel)

The connection dot has three states: `bad pulse` (searching/disconnected), `ok` (connected), and `ok copy` (alone — shows share link prompt on click).

---

## Panels

Three modal panels share the same open/close system. Only one panel is open at a time. A `#scrim` backdrop sits behind panels; clicking it calls `closePanel()`. Pressing Escape also closes any open panel.

### Wallet Panel

Displays:
- Short identity ID
- Per-type orb balances (my holdings)
- Per-type claimed/total supply counters
- Supply analytics grid (in world, held, lost, total)
- Seed phrase reveal (hidden by default, toggles on click)
- Leaderboard (all known public keys sorted by weighted score: common × 1, uncommon × 5, rare × 25)
- Orb transfer form (recipient dropdown populated from connected peers, amount inputs per type)

Transfer validation runs client-side before signing: recipient must be selected, total must be positive, sender must have sufficient balance of each type.

### Teleport Panel

Two number inputs (X and Y). A live distance readout updates on every input change. Pressing Enter or clicking Teleport calls `doTeleport`. Has its own keydown listener that stops propagation so typing coordinates does not move the ghost.

### Customize Panel

Name input with a random name button, two color swatch grids (ghost glow and eye glow). Saving calls `sendHello` with the updated identity so all connected peers see the change immediately.

---

## Landing Page (index.html)

The landing page is a pure CSS/HTML marketing page with no JavaScript frameworks.

### Ghost Particle Background

A `<canvas>` element behind the page content runs its own `requestAnimationFrame` loop drawing 22 ghost-shaped particles. Each ghost is drawn using Canvas 2D path operations: a semicircle for the head, straight lines down the sides, and three alternating `quadraticCurveTo` calls for the wavy bottom skirt. Particles drift upward with a sinusoidal wobble, cycling through orange, blue, and green color channels at low opacity (0.018 to 0.058).

### Scroll Reveal

`IntersectionObserver` with threshold 0.1 and a -40px bottom root margin watches all elements with `class="reveal"`. When an element enters the viewport, `class="visible"` is added, triggering a CSS transition from `opacity: 0; transform: translateY(20px)` to `opacity: 1; transform: translateY(0)`. Delay modifier classes (`reveal-delay-1/2/3`) stagger sibling elements.

### Noise Texture Overlay

A full-viewport `body::before` pseudo-element applies an SVG noise texture via an inline `data:` URI:

```html
url("data:image/svg+xml,%3Csvg...%3E
  %3Cfilter id='n'%3E
    %3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E
  %3C/filter%3E
  %3Crect ... filter='url(%23n)' opacity='0.03'/%3E
%3C/svg%3E")
```

`feTurbulence` with `fractalNoise` type and `baseFrequency='0.9'` produces a fine-grained static-like pattern. It is applied at 35% opacity via `body::before { opacity: 0.35 }`, giving the background a subtle film-grain texture. `pointer-events: none` and `z-index: 9999` ensure it overlays everything without blocking interaction.

### Fonts

Two font families are loaded from Google Fonts:

- **Geist** — Vercel's geometric sans-serif, weights 100-900. Used for all body text, headings, and UI on the landing and ads pages.
- **Geist Mono** — the monospaced companion to Geist. Used for labels, tech pills, stat numbers, and code-style UI elements.

The realm page uses:

- **Boldonse** — a display typeface from Google Fonts used exclusively for the loading screen title
- **PPSupplyMono** — a variable monospace font from Production Type, loaded from a CodePen asset CDN (`assets.codepen.io/7558/PPSupplyMono-Variable.woff2`) with weight range 100-900. Used for all HUD text, panel labels, input fields, and ghost name labels in the game.

### SEO

The landing page includes:
- Standard meta description, keywords, author, and robots directives
- `rel="canonical"` to prevent duplicate content issues
- Open Graph (`og:`) tags for social sharing previews with `og:image` pointing to `/og.png` (1200×630)
- Twitter Card tags with `summary_large_image` type
- JSON-LD structured data marking the site as a `WebApplication` in the Schema.org vocabulary, including `applicationCategory`, `browserRequirements`, `isAccessibleForFree`, `author`, and an `offers` object with price 0

---

## Deployment

Spectral Drift is deployed on Netlify via its Edge CDN. The deploy consists of three static HTML files with no build process, no CI pipeline, and no environment variables. Any code change that is pushed deploys instantly.

---

## Technology Reference

| Technology | Version / Source | Role |
|---|---|---|
| Three.js | r160, esm.sh | 3D scene, geometry, lighting, materials |
| Trystero | 0.21.4, esm.sh | WebRTC P2P mesh via BitTorrent trackers |
| EffectComposer | three@0.160/examples | Post-processing pipeline |
| UnrealBloomPass | three@0.160/examples | Bloom glow effect |
| OutputPass | three@0.160/examples | Linear-to-sRGB output conversion |
| CSS2DRenderer | three@0.160/examples | HTML label overlay in 3D space |
| Web Crypto API | Browser native | ECDSA P-256, PBKDF2, SHA-256 |
| WebRTC | Browser native (via Trystero) | P2P data channels and media streams |
| Web Audio API | Browser native | Proximity voice analysis and volume |
| Canvas 2D API | Browser native | Minimap, landing page particle canvas |
| IntersectionObserver | Browser native | Scroll reveal animations |
| localStorage | Browser native | Ledger, seed phrase, player profile |
| Geist / Geist Mono | Google Fonts | Landing and ads page typography |
| Boldonse | Google Fonts | Loader screen title in realm |
| PPSupplyMono | CodePen CDN | All in-game HUD and UI typography |
| Netlify | Edge CDN | Hosting and global distribution |
| esm.sh | ES module CDN | Runtime module delivery |
| WebTorrent Trackers | openwebtorrent.com, webtorrent.dev | Trystero peer signaling |
