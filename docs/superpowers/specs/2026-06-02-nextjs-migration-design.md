# Spectral Drift — Next.js 16 Migration Design

**Date:** 2026-06-02  
**Status:** Approved

---

## Goal

Migrate Spectral Drift from three standalone HTML files to a full Next.js 16 App Router application. Replace emoji icons with Lucide React. Replace all CDN font dependencies. Add security headers. Keep game fully operational.

---

## Current State

```
index.html         landing page — inline CSS (~1000 lines), inline JS (~100 lines)
ads/index.html     ads page — inline CSS, inline JS
realm/index.html   game — inline CSS (~1858 lines), inline JS (~1500 lines, Three.js + WebRTC + Web Crypto)
```

Problems:
- No build system, no types, no components
- Emojis as icons (render inconsistently across OS/browser)
- Google Fonts loaded via CDN link (render-blocking)
- PPSupplyMono loaded from `assets.codepen.io` (3rd-party unowned asset, unreliable)
- No security headers
- No CSP

---

## Target Architecture

```
app/
├── layout.tsx                root layout — Geist + JetBrains Mono via next/font, global metadata
├── globals.css               CSS variables, Tailwind base
├── page.tsx                  landing (Server Component)
├── ads/
│   └── page.tsx              ads page (Server Component)
└── realm/
    └── page.tsx              game page ('use client')
components/
├── nav/
│   └── Nav.tsx               shared nav with ghost SVG logo, Lucide icons
├── landing/
│   ├── Hero.tsx
│   ├── Features.tsx
│   ├── HowItWorks.tsx
│   ├── Security.tsx
│   ├── Economy.tsx
│   ├── Advertising.tsx
│   ├── TechStack.tsx
│   ├── CtaBand.tsx
│   └── Footer.tsx
├── ads/
│   ├── AdsHero.tsx
│   ├── HowItWorks.tsx
│   ├── Packages.tsx
│   ├── Specs.tsx
│   └── Contact.tsx
└── realm/
    ├── GameEngine.tsx         'use client' — mounts Three.js via useEffect
    ├── Loader.tsx             loading overlay + seed phrase setup form
    ├── HudPill.tsx            top HUD pill
    ├── Panels.tsx             wallet / teleport / customize modal panels
    ├── Minimap.tsx            canvas minimap element
    └── Chat.tsx               chat input bar
lib/
├── crypto.ts                  ECDSA P-256, PBKDF2, SHA-256, signing — typed
├── ledger.ts                  append-only distributed ledger, validateTx, getBalance
├── world.ts                   seeded RNG, genOrbDefs, genAdDefs
└── game/
    ├── renderer.ts            Three.js scene, composer, CSS2DRenderer
    ├── ghosts.ts              ghost geometry, animation, remote ghost lerp
    ├── p2p.ts                 Trystero room, message actions, peer lifecycle
    ├── audio.ts               Web Audio API, spatial audio, speaking detection
    └── loop.ts                requestAnimationFrame main loop
public/
└── fonts/
    └── JetBrainsMono.woff2    self-hosted, replaces CodePen CDN PPSupplyMono
next.config.ts                 security headers, image config
tailwind.config.ts             theme tokens matching existing design language
```

---

## Stack

| Concern | Choice | Version |
|---|---|---|
| Framework | Next.js App Router | 16.2.7 |
| UI Library | React | 19.2.7 |
| Styling | Tailwind CSS | 4.3.0 |
| Icons | Lucide React | 1.17.0 |
| Language | TypeScript | 6.0.3 |
| Fonts | next/font/google (Geist, Geist Mono) + next/font/local (JetBrains Mono) | — |
| Deploy | Vercel | — |

---

## Realm Page Strategy

The game engine is ~1500 lines of imperative JS (Three.js, Trystero WebRTC, Web Crypto, Web Audio). Full React-ification is high-risk and low-reward.

**Strategy:** React renders the DOM structure (all panels, HUD, loader, minimap, chat) as JSX components. A single `GameEngine.tsx` (`'use client'`) contains a `useEffect` that fires once on mount and runs the full game initialization. The engine code accesses DOM nodes via `document.getElementById` as before — this is safe inside `useEffect` since the DOM is fully mounted.

Game logic is extracted into typed modules in `lib/` for maintainability, but the runtime behavior is unchanged.

---

## Icon Replacements

| Emoji | Lucide Component | Context |
|---|---|---|
| 🔑 | `<Key />` | Seed phrase identity feature, setup form |
| ⛓ | `<Link2 />` | Cryptographic ledger feature |
| 🌐 | `<Globe />` | True P2P feature |
| 🌟 | `<Sparkles />` | Fixed supply / rare orbs |
| 🎙 | `<Mic />` | Proximity voice chat |
| 🗺 | `<Map />` | Open world feature |
| 🔐 | `<Lock />` | ECDSA security item |
| 🧮 | `<Hash />` | SHA-256 security item |
| 🛡 | `<Shield />` | PBKDF2 security item |
| ⚡ | `<Zap />` | Strike/blacklist security item |
| 📍 | `<MapPin />` | Proximity ad trigger |
| 👻 | Inline SVG (existing ghost shape) | Nav logo, HUD ghost count |
| 🟢🔵🌟 | `<Circle />` with color | Orb type indicators |

---

## Security Headers (`next.config.ts`)

Applied to all routes:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(self), geolocation=()`
- `X-DNS-Prefetch-Control: on`

CSP (Content Security Policy):
- `default-src 'self'`
- `script-src 'self' 'unsafe-eval' https://esm.sh` (esm.sh needed for Three.js/Trystero ES modules in realm)
- `connect-src 'self' wss://tracker.openwebtorrent.com wss://tracker.webtorrent.dev https://esm.sh`
- `font-src 'self' https://fonts.gstatic.com`
- `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`

Note: `unsafe-eval` required by Three.js shader compilation. `unsafe-inline` for styles needed by CSS2DRenderer labels.

---

## Font Changes

| Was | Becomes | Reason |
|---|---|---|
| Google Fonts CDN `<link>` (Geist, Geist Mono) | `next/font/google` | No render-blocking CDN request |
| CodePen CDN `PPSupplyMono-Variable.woff2` | `next/font/local` with self-hosted JetBrains Mono | Owned asset, same variable monospace aesthetic |
| Google Fonts CDN `<link>` (Boldonse) | `next/font/google` | Same font, no CDN link |

---

## README Updates Needed

Current README on GitHub has accurate technical content but needs:
- Update deployment section: Netlify → Vercel
- Update structure section: 3 HTML files → Next.js App Router structure
- Remove "no build steps" claim
- Update tech stack table: add Next.js, React, Tailwind, Lucide React, TypeScript
- Fix any inaccurate claims about PPSupplyMono source

---

## Out of Scope

- Game logic changes (cryptographic rules, orb economy, P2P protocol)
- New features
- Database or server-side state
- Authentication changes (seed phrase system stays as-is)
