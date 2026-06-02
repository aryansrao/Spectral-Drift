'use client';

import { useEffect } from 'react';
import type * as THREETypes from 'three';
import type { CSS2DObject as CSS2DObjectType } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

export default function GameEngine() {
  useEffect(() => {
    // ─── GUARD: only run once ────────────────────────────────────────────────
    let destroyed = false;

    (async () => {
      // ─── IMPORTS ────────────────────────────────────────────────────────────
      const THREE = await import('three');
      const { EffectComposer } = await import('three/examples/jsm/postprocessing/EffectComposer.js');
      const { RenderPass } = await import('three/examples/jsm/postprocessing/RenderPass.js');
      const { UnrealBloomPass } = await import('three/examples/jsm/postprocessing/UnrealBloomPass.js');
      const { OutputPass } = await import('three/examples/jsm/postprocessing/OutputPass.js');
      const { CSS2DRenderer, CSS2DObject } = await import('three/examples/jsm/renderers/CSS2DRenderer.js');

      if (destroyed) return;

      // ─── WORDLIST ────────────────────────────────────────────────────────────
      const { WORDS } = await import('../../lib/wordlist');

      // ─── CRYPTO HELPERS ──────────────────────────────────────────────────────
      function buf2b64(buf: ArrayBuffer): string { const b = new Uint8Array(buf); let s = ''; for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]); return btoa(s) }
      function b642buf(b64: string): ArrayBuffer { const bin = atob(b64); const b = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) b[i] = bin.charCodeAt(i); return b.buffer }
      function buf2hex(buf: ArrayBuffer): string { return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('') }
      async function sha256hex(str: string): Promise<string> { return buf2hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str))) }
      function rndHex(n = 8): string { const arr = new Uint8Array(n); crypto.getRandomValues(arr); return buf2hex(arr.buffer as ArrayBuffer) }

      function rawP256ToPKCS8(raw32: Uint8Array): ArrayBuffer {
        const der = new Uint8Array(67); let i = 0;
        der[i++] = 0x30; der[i++] = 0x41;
        der[i++] = 0x02; der[i++] = 0x01; der[i++] = 0x00;
        der[i++] = 0x30; der[i++] = 0x13;
        der[i++] = 0x06; der[i++] = 0x07;
        der.set([0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01], i); i += 7;
        der[i++] = 0x06; der[i++] = 0x08;
        der.set([0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07], i); i += 8;
        der[i++] = 0x04; der[i++] = 0x27;
        der[i++] = 0x30; der[i++] = 0x25;
        der[i++] = 0x02; der[i++] = 0x01; der[i++] = 0x01;
        der[i++] = 0x04; der[i++] = 0x20;
        der.set(raw32, i);
        return der.buffer;
      }

      function genSeedPhrase(): string {
        const entropy = new Uint8Array(12); crypto.getRandomValues(entropy);
        return Array.from(entropy).map(b => WORDS[b]).join(' ');
      }
      function validatePhrase(phrase: string): string[] {
        const words = phrase.trim().toLowerCase().split(/\s+/).filter(Boolean);
        if (words.length !== 12) throw new Error(`Expected 12 words, got ${words.length}`);
        words.forEach(w => { if (!WORDS.includes(w)) throw new Error(`Unknown word: "${w}"`) });
        return words;
      }
      async function seedPhraseToKeypair(phrase: string) {
        const words = validatePhrase(phrase);
        const entropy = new Uint8Array(words.map(w => WORDS.indexOf(w)));
        const baseKey = await crypto.subtle.importKey('raw', entropy, { name: 'PBKDF2' }, false, ['deriveBits']);
        const derived = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: new TextEncoder().encode('spectral-drift-v1-seed'), iterations: 210000, hash: 'SHA-256' }, baseKey, 256);
        const raw32 = new Uint8Array(derived);
        const privKey = await crypto.subtle.importKey('pkcs8', rawP256ToPKCS8(raw32), { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']);
        const jwk = await crypto.subtle.exportKey('jwk', privKey) as JsonWebKey;
        const pubKey = await crypto.subtle.importKey('jwk', { kty: 'EC', crv: 'P-256', x: jwk.x, y: jwk.y }, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
        return { privateKey: privKey, publicKey: pubKey };
      }

      // ─── CONSTANTS ────────────────────────────────────────────────────────────
      const ADJ = ['Wandering','Hollow','Pale','Ashen','Dim','Veiled','Fading','Silent','Drifting','Cursed','Eerie','Mist','Void','Lost','Stray','Quiet','Bitter'];
      const NOUN = ['Specter','Wisp','Shade','Wraith','Revenant','Phantom','Echo','Shadow','Vapor','Ember','Flux','Shard','Mote','Hollow','Drift'];
      const rndName = () => ADJ[Math.random() * ADJ.length | 0] + ' ' + NOUN[Math.random() * NOUN.length | 0];
      const WORLD_SIZE = 120, SPEED = 0.14, SYNC_MS = 120, MSG_LIFE = 7000;
      const ROOM_ID = 'ghost-realm-main-v3', MM_RANGE = 38;
      const PAL: Record<string, number> = { orange: 0xff4500, cyan: 0x00ffff, lime: 0x00ff00, magenta: 0xff00ff, yellow: 0xffff00, pink: 0xff1493, purple: 0x9400d3, blue: 0x0080ff, green: 0x00ff80, red: 0xff0040, teal: 0x00ffaa, violet: 0x8a2be2 };
      const CSS_C: Record<string, string> = { orange: '#ff4500', cyan: '#00ffff', lime: '#00ff00', magenta: '#ff00ff', yellow: '#ffff00', pink: '#ff1493', purple: '#9400d3', blue: '#0080ff', green: '#00ff80', red: '#ff0040', teal: '#00ffaa', violet: '#8a2be2' };
      const CK = Object.keys(PAL);
      void WORLD_SIZE;

      // ─── ORB WORLD ────────────────────────────────────────────────────────────
      function mkRng(seed: number) { let a = seed; return () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296 } }
      const WORLD_RNG = mkRng(0xCAFEBABE);
      const ORB_TYPES = ['common', 'uncommon', 'rare'] as const;
      type OrbType = typeof ORB_TYPES[number];
      const ORB_SUPPLY: Record<OrbType, number> = { common: 400, uncommon: 80, rare: 20 };
      const ORB_SPREAD = 160, CLAIM_DIST = 2.5, ORB_VIS = 45;
      const ORB_3D: Record<OrbType, { hex: number; emit: number; r: number; ei: number }> = {
        common:   { hex: 0x00bb44, emit: 0x00ff77, r: .28, ei: 4.5 },
        uncommon: { hex: 0x2244cc, emit: 0x55aaff, r: .38, ei: 4.5 },
        rare:     { hex: 0xcc8800, emit: 0xffcc00, r: .54, ei: 6.5 },
      };
      const ORB_CSS_COL: Record<OrbType, string> = { common: '#00ff88', uncommon: '#66aaff', rare: '#ffcc00' };
      const ORB_EMOJI: Record<OrbType, string> = { common: '●', uncommon: '●', rare: '◆' };
      const ORB_EMOJI_COL: Record<OrbType, string> = { common: '#00ff88', uncommon: '#66aaff', rare: '#ffcc00' };

      interface OrbDef {
        id: number; type: OrbType; x: number; y: number;
        claimed: boolean; mesh: THREETypes.Mesh | null;
      }
      let orbDefs: OrbDef[] = [];

      function genOrbDefs() {
        orbDefs = []; let id = 0;
        for (const type of ORB_TYPES) for (let i = 0; i < ORB_SUPPLY[type]; i++)
          orbDefs.push({ id: id++, type, x: (WORLD_RNG() * 2 - 1) * ORB_SPREAD, y: (WORLD_RNG() * 2 - 1) * ORB_SPREAD, claimed: false, mesh: null });
      }

      function buildOrbMeshes() {
        for (const orb of orbDefs) {
          if (orb.claimed) continue;
          const cfg = ORB_3D[orb.type];
          const mat = new THREE.MeshStandardMaterial({ color: cfg.hex, emissive: new THREE.Color(cfg.emit), emissiveIntensity: cfg.ei, transparent: true, opacity: .95 });
          const mesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.r, 8, 8), mat);
          mesh.position.set(orb.x, orb.y, .6); mesh.visible = false; scene.add(mesh); orb.mesh = mesh;
        }
      }
      function removeOrbMesh(orb: OrbDef) { if (!orb.mesh) return; scene.remove(orb.mesh); orb.mesh.geometry.dispose(); (orb.mesh.material as THREETypes.Material).dispose(); orb.mesh = null; orb.claimed = true }
      function restoreOrbMesh(orb: OrbDef) {
        orb.claimed = false; if (orb.mesh) return;
        const cfg = ORB_3D[orb.type];
        const mat = new THREE.MeshStandardMaterial({ color: cfg.hex, emissive: new THREE.Color(cfg.emit), emissiveIntensity: cfg.ei, transparent: true, opacity: .95 });
        const mesh = new THREE.Mesh(new THREE.SphereGeometry(cfg.r, 8, 8), mat);
        mesh.position.set(orb.x, orb.y, .6); mesh.visible = false; scene.add(mesh); orb.mesh = mesh;
      }

      // ─── AD SYSTEM ────────────────────────────────────────────────────────────
      const AD_CONFIG = [
        { title: 'Get your ads here', desc: 'spectraldrift.vercel.app/ads', url: '/ads', color: '#ff9900' },
      ];
      const AD_TRIGGER_DIST = 4.5, AD_NEARBY_DIST = 9, AD_VIS_DIST = 50, AD_COOLDOWN_MS = 45000, AD_ORB_OFFSET = 4;

      interface AdMesh {
        post: THREETypes.Mesh; cap: THREETypes.Mesh; capMat: THREETypes.MeshBasicMaterial;
        postMat: THREETypes.MeshStandardMaterial; light: THREETypes.PointLight;
      }
      interface AdDef {
        id: number; title: string; desc: string; url: string; color: string;
        x: number; y: number; mesh: AdMesh | null; labelDiv: HTMLElement | null;
        boardEl: HTMLElement | null; lastVisit: number; _labelObj?: CSS2DObjectType;
      }
      let adDefs: AdDef[] = [];

      function genAdDefs() {
        const adRng = mkRng(0xDEADBEEF); adDefs = [];
        const step = Math.floor(orbDefs.length / AD_CONFIG.length);
        AD_CONFIG.forEach((cfg, i) => {
          const anchor = orbDefs[AD_ORB_OFFSET + i * step]; if (!anchor) return;
          const angle = adRng() * Math.PI * 2; const radius = 3 + adRng() * 4;
          adDefs.push({ id: i, title: cfg.title, desc: cfg.desc, url: cfg.url, color: cfg.color, x: anchor.x + Math.cos(angle) * radius, y: anchor.y + Math.sin(angle) * radius, mesh: null, labelDiv: null, boardEl: null, lastVisit: 0 });
        });
      }

      function buildAdMeshes() {
        for (const ad of adDefs) {
          const postMat = new THREE.MeshStandardMaterial({ color: 0x111122, emissive: new THREE.Color(ad.color), emissiveIntensity: 2.5 });
          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.5, 8), postMat);
          post.position.set(ad.x, ad.y, 1.5); post.rotation.x = Math.PI / 2;
          const capMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(ad.color), transparent: true, opacity: 0.85 });
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), capMat);
          cap.position.set(ad.x, ad.y, 3.6);
          const light = new THREE.PointLight(new THREE.Color(ad.color).getHex(), 0.6, 12, 2);
          light.position.set(ad.x, ad.y, 2.5);
          scene.add(post); scene.add(cap); scene.add(light);
          ad.mesh = { post, cap, capMat, postMat, light };
          const div = document.createElement('div'); div.className = 'ad-label';
          const board = document.createElement('div'); board.className = 'ad-board';
          board.style.borderColor = hexToRgba(ad.color, 0.35);
          board.innerHTML = `<div class="ad-tag" style="--ac:${ad.color}">Sponsored</div><div class="ad-title">${escHtml(ad.title)}</div><div class="ad-desc">${escHtml(ad.desc)}</div><div class="ad-cta">▶ Walk closer to visit</div>`;
          board.addEventListener('click', () => visitAd(ad));
          div.appendChild(board); ad.labelDiv = div; ad.boardEl = board;
          const obj = new CSS2DObject(div); obj.position.set(ad.x, ad.y, 4.2);
          scene.add(obj); ad._labelObj = obj;
        }
      }

      function hexToRgba(hex: string, a: number): string {
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
      }
      function escHtml(s: string): string { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }
      function visitAd(ad: AdDef) { const now = Date.now(); if (now - ad.lastVisit < AD_COOLDOWN_MS) return; ad.lastVisit = now; window.open(ad.url, '_blank', 'noopener,noreferrer'); showAdToast(`Opening: ${ad.title}`) }
      function showAdToast(msg: string) { const t = document.getElementById('ad-toast')!; t.textContent = '✦ ' + msg; t.classList.add('show'); clearTimeout((t as HTMLElement & { _timer?: ReturnType<typeof setTimeout> })._timer); (t as HTMLElement & { _timer?: ReturnType<typeof setTimeout> })._timer = setTimeout(() => t.classList.remove('show'), 2800) }

      function tickAds(t: number) {
        const now = Date.now();
        for (const ad of adDefs) {
          if (!ad.mesh) continue;
          const dx = ad.x - pos.x, dy = ad.y - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const visible = dist < AD_VIS_DIST;
          ad.mesh.post.visible = visible; ad.mesh.cap.visible = visible;
          if (!visible) { if (ad.labelDiv) ad.labelDiv.style.display = 'none'; continue; }
          if (ad.labelDiv) ad.labelDiv.style.display = '';
          const nearby = dist < AD_NEARBY_DIST;
          const pulse = 1 + Math.sin(t * 2.2 + ad.id) * 0.4;
          ad.mesh.postMat.emissiveIntensity = nearby ? 4.5 * pulse : 2.0;
          ad.mesh.capMat.opacity = nearby ? 1 : 0.65;
          ad.mesh.light.intensity = nearby ? 1.2 * pulse : 0.5;
          ad.mesh.cap.position.z = 3.6 + Math.sin(t * 1.8 + ad.id * 1.3) * 0.12;
          if (ad.boardEl) {
            if (nearby) { ad.boardEl.classList.add('nearby'); ad.boardEl.style.borderColor = hexToRgba(ad.color, 0.8); ad.boardEl.style.boxShadow = `0 0 28px ${hexToRgba(ad.color, .55)}, 0 0 60px ${hexToRgba(ad.color, .2)}` }
            else { ad.boardEl.classList.remove('nearby'); ad.boardEl.style.borderColor = hexToRgba(ad.color, 0.35); ad.boardEl.style.boxShadow = '' }
          }
          if (dist < AD_TRIGGER_DIST && now - ad.lastVisit >= AD_COOLDOWN_MS) visitAd(ad);
        }
      }

      function drawAdsMm() {
        for (const ad of adDefs) {
          const dx = ad.x - pos.x, dy = ad.y - pos.y;
          if (Math.abs(dx) > MM_RANGE || Math.abs(dy) > MM_RANGE) continue;
          const mx = R + dx * mmScale, my = R - dy * mmScale;
          if (Math.hypot(mx - R, my - R) > R - 2) continue;
          mmx.fillStyle = ad.color; mmx.globalAlpha = 0.9;
          mmx.font = 'bold 8px monospace'; mmx.textAlign = 'center';
          mmx.fillText('★', mx, my + 3); mmx.globalAlpha = 1;
        }
      }

      // ─── LEDGER ───────────────────────────────────────────────────────────────
      interface Tx { id: string; sig: string; type: string; from: string; to?: string; orbId?: number; orbType?: OrbType; amount?: Record<OrbType, number>; nonce: string; ts: number }
      let ledger: Tx[] = [];
      const txSet = new Set<string>();
      const offenders = new Map<string, number>();
      const BLACKLIST_AT = 3;
      const lastSeen = new Map<string, number>();

      function saveLedger() {
        try {
          localStorage.setItem('sd-ledger-v2', JSON.stringify(ledger));
          const lsObj: Record<string, number> = {}; lastSeen.forEach((v, k) => lsObj[k] = v);
          localStorage.setItem('sd-lastseen', JSON.stringify(lsObj));
        } catch {
          try { localStorage.setItem('sd-ledger-v2', JSON.stringify(ledger.slice(-800))) } catch (_) { }
        }
      }
      function loadPersistedLedger(): Tx[] { try { const raw = localStorage.getItem('sd-ledger-v2'); if (!raw) return []; return JSON.parse(raw) } catch { return [] } }
      function loadPersistedLastSeen() { try { const raw = localStorage.getItem('sd-lastseen'); if (!raw) return; const obj = JSON.parse(raw); Object.entries(obj).forEach(([k, v]) => lastSeen.set(k, v as number)) } catch { } }

      function getBalance(pk: string) {
        const b = { common: 0, uncommon: 0, rare: 0 };
        for (const tx of ledger) {
          if (tx.type === 'claim' && tx.from === pk) b[tx.orbType!]++;
          else if (tx.type === 'transfer') {
            if (tx.from === pk) ORB_TYPES.forEach(k => b[k] -= (tx.amount?.[k] || 0));
            if (tx.to === pk) ORB_TYPES.forEach(k => b[k] += (tx.amount?.[k] || 0));
          }
        }
        return b;
      }
      function orbClaimed(orbId: number) { return ledger.some(tx => tx.type === 'claim' && tx.orbId === orbId) }
      function claimedCounts() { const c = { common: 0, uncommon: 0, rare: 0 }; for (const tx of ledger) if (tx.type === 'claim') c[tx.orbType!]++; return c }
      function allHistoricPKs() { const s = new Set<string>(); for (const tx of ledger) { s.add(tx.from); if (tx.to) s.add(tx.to) } return s }

      function getSupplyStats() {
        const total = 500;
        const cc = claimedCounts();
        const totalClaimed = cc.common + cc.uncommon + cc.rare;
        const inWorld = total - totalClaimed;
        const activePKs = new Set([myPK]);
        for (const [, e] of remotes) if (e.pk) activePKs.add(e.pk);
        let lostC = 0, lostU = 0, lostR = 0, heldC = 0, heldU = 0, heldR = 0;
        for (const pk of allHistoricPKs()) {
          const b = getBalance(pk);
          if (activePKs.has(pk)) { heldC += b.common; heldU += b.uncommon; heldR += b.rare }
          else { lostC += b.common; lostU += b.uncommon; lostR += b.rare }
        }
        return { total, totalClaimed, inWorld, held: { c: heldC, u: heldU, r: heldR, t: heldC + heldU + heldR }, lost: { c: lostC, u: lostU, r: lostR, t: lostC + lostU + lostR }, inWorldBreak: { c: ORB_SUPPLY.common - cc.common, u: ORB_SUPPLY.uncommon - cc.uncommon, r: ORB_SUPPLY.rare - cc.rare } };
      }

      async function validateTx(tx: Tx): Promise<string> {
        if (!tx || !tx.id || !tx.sig || !tx.type || !tx.from) return 'malformed';
        if (txSet.has(tx.id)) return 'duplicate';
        if ((offenders.get(tx.from) || 0) >= BLACKLIST_AT) return 'blacklisted';
        const { id: _id, sig, ...data } = tx; void _id;
        if (!(await verifyObj(data, sig, tx.from))) return 'bad_sig';
        const expected = await sha256hex(JSON.stringify({ ...data, sig }));
        if (expected !== tx.id) return 'bad_hash';
        if (tx.type === 'claim') {
          if (orbClaimed(tx.orbId!)) return 'already_claimed';
          const orb = orbDefs[tx.orbId!]; if (!orb || orb.type !== tx.orbType) return 'invalid_orb';
        } else if (tx.type === 'transfer') {
          if (tx.from === tx.to) return 'self_transfer';
          if (!tx.amount || typeof tx.amount !== 'object') return 'malformed';
          const bal = getBalance(tx.from); let total = 0;
          for (const k of ORB_TYPES) { const amt = tx.amount[k] || 0; if (amt < 0) return 'negative'; if (bal[k] < amt) return 'insufficient'; total += amt }
          if (total === 0) return 'empty';
        } else return 'unknown_type';
        return 'ok';
      }

      async function verifyObj(obj: object, sig: string, pkStr: string): Promise<boolean> {
        try {
          const k = await (async () => {
            if ((verifyObj as unknown as { _cache: Map<string, CryptoKey> })._cache?.has(pkStr)) return (verifyObj as unknown as { _cache: Map<string, CryptoKey> })._cache.get(pkStr)!;
            const key = await crypto.subtle.importKey('spki', b642buf(pkStr), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['verify']);
            if (!(verifyObj as unknown as { _cache?: Map<string, CryptoKey> })._cache) (verifyObj as unknown as { _cache: Map<string, CryptoKey> })._cache = new Map();
            (verifyObj as unknown as { _cache: Map<string, CryptoKey> })._cache.set(pkStr, key); return key;
          })();
          const bytes = new TextEncoder().encode(JSON.stringify(obj));
          return await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k, b642buf(sig), bytes);
        } catch { return false }
      }

      async function signObj(obj: object): Promise<string> {
        const bytes = new TextEncoder().encode(JSON.stringify(obj));
        const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, myKP!.privateKey, bytes);
        return buf2b64(sig);
      }

      async function applyTx(tx: Tx, broadcast = false): Promise<boolean> {
        const verdict = await validateTx(tx);
        if (verdict === 'ok') {
          ledger.push(tx); txSet.add(tx.id); lastSeen.set(tx.from, Date.now());
          if (tx.type === 'claim') { const orb = orbDefs[tx.orbId!]; if (orb) removeOrbMesh(orb) }
          saveLedger(); updateWalletHUD(); if (broadcast) sendTx(tx); return true;
        }
        const CHEAT_VERDICTS = new Set(['bad_sig', 'bad_hash', 'negative', 'malformed', 'unknown_type']);
        if (CHEAT_VERDICTS.has(verdict)) {
          const strikes = (offenders.get(tx.from) || 0) + 1; offenders.set(tx.from, strikes);
          console.warn(`[Ledger] Cheat TX (${verdict}) — strikes for ${tx.from.slice(-8)}: ${strikes}`);
          if (strikes >= BLACKLIST_AT) purgeAccount(tx.from);
        } else if (verdict !== 'duplicate') {
          console.debug(`[Ledger] TX skipped (${verdict}) — normal race, no strike`);
        }
        return false;
      }

      function purgeAccount(pk: string) {
        console.warn('[Ledger] Purging cheater account:', pk.slice(-8));
        const orbsToRestore = ledger.filter(tx => tx.from === pk && tx.type === 'claim').map(tx => tx.orbId!);
        ledger = ledger.filter(tx => tx.from !== pk && tx.to !== pk);
        txSet.clear(); ledger.forEach(tx => txSet.add(tx.id));
        for (const id of orbsToRestore) restoreOrbMesh(orbDefs[id]);
        saveLedger(); updateWalletHUD();
      }

      async function buildClaimTx(orb: OrbDef): Promise<Tx> {
        const data = { type: 'claim', from: myPK, to: myPK, orbId: orb.id, orbType: orb.type, nonce: rndHex(), ts: Date.now() };
        const sig = await signObj(data); const id = await sha256hex(JSON.stringify({ ...data, sig }));
        return { ...data, sig, id };
      }
      async function buildTransferTx(toPK: string, amount: Record<OrbType, number>): Promise<Tx> {
        const data = { type: 'transfer', from: myPK, to: toPK, amount, nonce: rndHex(), ts: Date.now() };
        const sig = await signObj(data); const id = await sha256hex(JSON.stringify({ ...data, sig }));
        return { ...data, sig, id };
      }

      let lastClaimCheck = 0;
      const claimsInFlight = new Set<number>();
      async function checkClaims() {
        const now = Date.now(); if (now - lastClaimCheck < 300) return; lastClaimCheck = now;
        if (now < claimLockUntil) return;
        for (const orb of orbDefs) {
          if (orb.claimed || claimsInFlight.has(orb.id)) continue;
          if (Math.hypot(orb.x - pos.x, orb.y - pos.y) > CLAIM_DIST) continue;
          claimsInFlight.add(orb.id);
          const tx = await buildClaimTx(orb);
          const ok = await applyTx(tx, true);
          claimsInFlight.delete(orb.id);
          if (ok) showOrbToast(orb.type);
        }
      }

      // ─── WALLET UI ────────────────────────────────────────────────────────────
      function updateWalletHUD() {
        const b = getBalance(myPK);
        const wc = document.getElementById('w-c'); const wu = document.getElementById('w-u'); const wr = document.getElementById('w-r');
        if (wc) wc.textContent = String(b.common); if (wu) wu.textContent = String(b.uncommon); if (wr) wr.textContent = String(b.rare);
      }

      function updateWalletPanel() {
        const b = getBalance(myPK); const cc = claimedCounts();
        const set = (id: string, v: string) => { const el = document.getElementById(id); if (el) el.textContent = v };
        set('wp-c', String(b.common)); set('wp-u', String(b.uncommon)); set('wp-r', String(b.rare));
        set('wp-cs', `${cc.common} / 400`); set('wp-us', `${cc.uncommon} / 80`); set('wp-rs', `${cc.rare} / 20`);
        updateSupplyStats(); rebuildLeaderboard(); rebuildPeerSelect();
      }

      function updateSupplyStats() {
        const s = getSupplyStats(); const pct = (n: number) => Math.round(n / s.total * 100);
        const $iw = document.getElementById('wp-inworld-row'), $h = document.getElementById('wp-held-row'), $l = document.getElementById('wp-lost-row');
        function chipRow(el: HTMLElement | null, c: number, u: number, r: number) {
          if (!el) return; const tot = c + u + r;
          el.innerHTML = `<span class="wp-stat-chip c"><span style="color:#00ff88">●</span> ${c}</span><span class="wp-stat-chip u"><span style="color:#66aaff">●</span> ${u}</span><span class="wp-stat-chip r"><span style="color:#ffcc00">◆</span> ${r}</span><span class="wp-stat-chip total">(${tot})</span>`;
        }
        chipRow($iw, s.inWorldBreak.c, s.inWorldBreak.u, s.inWorldBreak.r);
        chipRow($h, s.held.c, s.held.u, s.held.r);
        chipRow($l, s.lost.c, s.lost.u, s.lost.r);
        const iwBar = document.getElementById('wp-inworld-bar'); if (iwBar) iwBar.style.width = pct(s.inWorld) + '%';
        const hBar = document.getElementById('wp-held-bar'); if (hBar) hBar.style.width = pct(s.held.t) + '%';
        const lBar = document.getElementById('wp-lost-bar'); if (lBar) lBar.style.width = pct(s.lost.t) + '%';
      }

      function allKnownPKs() {
        const out: { pk: string; name: string; me: boolean }[] = [{ pk: myPK, name: myName, me: true }];
        for (const [, e] of remotes) if (e.pk) out.push({ pk: e.pk, name: e.ghost.nmEl.textContent || 'Unknown', me: false });
        return out;
      }

      function rebuildLeaderboard() {
        const lb = document.getElementById('wp-lb'); if (!lb) return;
        const all = allKnownPKs();
        all.sort((a, b) => { const ba = getBalance(a.pk), bb = getBalance(b.pk); return (bb.common + bb.uncommon * 5 + bb.rare * 25) - (ba.common + ba.uncommon * 5 + ba.rare * 25) });
        lb.innerHTML = '';
        for (const { pk, name, me } of all) {
          const b = getBalance(pk); if (!me && b.common + b.uncommon + b.rare === 0) continue;
          const row = document.createElement('div'); row.className = 'wp-lrow' + (me ? ' me' : '');
          row.innerHTML = `<span class="wp-lname${me ? ' me' : ''}">${me ? '✦ ' : ''}${name}</span><span class="wp-lbals"><span class="lbc"><span style="color:#00ff88">●</span>${b.common}</span><span class="lbu"><span style="color:#66aaff">●</span>${b.uncommon}</span><span class="lbr"><span style="color:#ffcc00">◆</span>${b.rare}</span></span>`;
          lb.appendChild(row);
        }
        if (!lb.children.length) lb.innerHTML = '<div class="wp-lrow" style="color:rgba(255,255,255,.18)">No orbs collected yet — explore!</div>';
      }

      function rebuildPeerSelect() {
        const sel = document.getElementById('xfer-to') as HTMLSelectElement | null; if (!sel) return;
        const prev = sel.value; sel.innerHTML = '<option value="">— select recipient —</option>';
        for (const [, e] of remotes) {
          if (!e.pk) continue;
          const opt = document.createElement('option'); opt.value = e.pk;
          opt.textContent = `${e.ghost.nmEl.textContent || 'Unknown'} (${e.shortId || e.pk.slice(-6)})`;
          sel.appendChild(opt);
        }
        if (prev) sel.value = prev;
      }

      function showOrbToast(type: OrbType) {
        const t = document.getElementById('orb-toast'); if (!t) return;
        t.innerHTML = `<span style="color:${ORB_EMOJI_COL[type]}">${ORB_EMOJI[type]}</span> +1 ${type} orb`;
        t.style.borderColor = ORB_CSS_COL[type] + '55'; t.style.background = ORB_CSS_COL[type] + '16';
        t.classList.add('show'); clearTimeout((t as HTMLElement & { _timer?: ReturnType<typeof setTimeout> })._timer);
        (t as HTMLElement & { _timer?: ReturnType<typeof setTimeout> })._timer = setTimeout(() => t.classList.remove('show'), 2400);
      }

      function showSyncBadge() {
        const el = document.getElementById('sync-badge'); if (!el) return;
        el.classList.add('show'); clearTimeout((el as HTMLElement & { _t?: ReturnType<typeof setTimeout> })._t);
        (el as HTMLElement & { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => el.classList.remove('show'), 2500);
      }

      function setWpStatus(msg: string, cls = '') { const el = document.getElementById('wp-status'); if (el) { el.textContent = msg; el.className = 'wp-status' + (cls ? ' ' + cls : '') } }

      // Wallet phrase reveal
      let phraseRevealed = false;
      const wpPhraseToggle = document.getElementById('wp-phrase-toggle');
      if (wpPhraseToggle) wpPhraseToggle.onclick = () => {
        phraseRevealed = !phraseRevealed;
        const words = document.getElementById('wp-phrase-words');
        const copy = document.getElementById('wp-phrase-copy');
        const warn = document.getElementById('wp-phrase-warn');
        const icon = document.getElementById('wp-phrase-icon');
        if (phraseRevealed) {
          if (words) { words.innerHTML = ''; myPhrase.split(' ').forEach((w, i) => { const d = document.createElement('div'); d.className = 'wp-pw'; d.innerHTML = `<span class="wp-pw-n">${i + 1}</span><span class="wp-pw-w">${w}</span>`; words.appendChild(d) }); words.classList.add('show') }
          if (copy) copy.classList.add('show'); if (warn) warn.classList.add('show'); if (icon) icon.textContent = '▼ Hide';
        } else {
          if (words) words.classList.remove('show'); if (copy) copy.classList.remove('show'); if (warn) warn.classList.remove('show'); if (icon) icon.textContent = '▶ Reveal';
        }
      };
      const wpPhraseCopy = document.getElementById('wp-phrase-copy');
      if (wpPhraseCopy) wpPhraseCopy.onclick = () => copyText(myPhrase);

      const hpWalletEl = document.getElementById('hp-wallet');
      if (hpWalletEl) hpWalletEl.onclick = () => { updateWalletPanel(); openPanel(walletPanel) };
      const wpCloseEl = document.getElementById('wp-close');
      if (wpCloseEl) wpCloseEl.onclick = closePanel;

      const wpSendEl = document.getElementById('wp-send');
      if (wpSendEl) wpSendEl.onclick = async () => {
        const toPK = (document.getElementById('xfer-to') as HTMLSelectElement | null)?.value || '';
        if (!toPK) { setWpStatus('Select a recipient first.', 'warn'); return }
        const amount = { common: parseInt((document.getElementById('xfer-c') as HTMLInputElement)?.value) || 0, uncommon: parseInt((document.getElementById('xfer-u') as HTMLInputElement)?.value) || 0, rare: parseInt((document.getElementById('xfer-r') as HTMLInputElement)?.value) || 0 };
        const total = ORB_TYPES.reduce((s, k) => s + amount[k], 0);
        if (total === 0) { setWpStatus('Enter orbs to send.', 'warn'); return }
        const bal = getBalance(myPK);
        for (const k of ORB_TYPES) if (amount[k] > bal[k]) { setWpStatus(`Insufficient ${k} orbs.`, 'err'); return }
        setWpStatus('Signing transaction…');
        try {
          const tx = await buildTransferTx(toPK, amount);
          const ok = await applyTx(tx, true);
          if (ok) { setWpStatus('✓ Transfer sent & verified!', 'ok');['xfer-c', 'xfer-u', 'xfer-r'].forEach(id => { const el = document.getElementById(id) as HTMLInputElement | null; if (el) el.value = '0' }); updateWalletPanel() }
          else setWpStatus('Transfer rejected — check balance.', 'err');
        } catch (err: unknown) { setWpStatus('Signing failed: ' + (err as Error).message, 'err') }
      };
      ['xfer-c', 'xfer-u', 'xfer-r', 'xfer-to'].forEach(id => { const el = document.getElementById(id); if (el) el.addEventListener('keydown', e => e.stopPropagation()) });

      // ─── KEY MANAGEMENT ───────────────────────────────────────────────────────
      let myKP: { privateKey: CryptoKey; publicKey: CryptoKey } | null = null;
      let myPK = '', myShortId = '', myPhrase = '';
      const pkCache = new Map<string, CryptoKey>();
      // Override verifyObj to use pkCache
      (verifyObj as unknown as { _cache: Map<string, CryptoKey> })._cache = pkCache;

      async function initCrypto() {
        const stored = localStorage.getItem('sd-phrase');
        if (stored) {
          try {
            myPhrase = stored; myKP = await seedPhraseToKeypair(stored);
            myPK = buf2b64(await crypto.subtle.exportKey('spki', myKP.publicKey));
          } catch (e) {
            console.warn('Stored phrase invalid, regenerating:', e);
            localStorage.removeItem('sd-phrase');
            myPhrase = genSeedPhrase(); myKP = await seedPhraseToKeypair(myPhrase);
            myPK = buf2b64(await crypto.subtle.exportKey('spki', myKP.publicKey));
          }
        } else {
          myPhrase = genSeedPhrase(); myKP = await seedPhraseToKeypair(myPhrase);
          myPK = buf2b64(await crypto.subtle.exportKey('spki', myKP.publicKey));
        }
        myShortId = (await sha256hex(myPK)).slice(0, 8).toUpperCase();
        const wpId = document.getElementById('wp-idval'); if (wpId) wpId.textContent = myShortId;
      }

      // ─── PERSISTENCE ──────────────────────────────────────────────────────────
      let myName = localStorage.getItem('sd-name') || '';
      let myGlow = localStorage.getItem('sd-glow') || 'orange';
      let myEye = localStorage.getItem('sd-eye') || 'green';
      const isReturning = !!localStorage.getItem('sd-phrase');
      if (!myName) myName = rndName();

      const save = () => {
        localStorage.setItem('sd-name', myName); localStorage.setItem('sd-glow', myGlow); localStorage.setItem('sd-eye', myEye);
        if (myShortId) localStorage.setItem(`sd-profile-${myShortId}`, JSON.stringify({ name: myName, glow: myGlow, eye: myEye }));
      };
      function loadProfileForId(shortId: string) { try { const raw = localStorage.getItem(`sd-profile-${shortId}`); if (raw) return JSON.parse(raw) } catch { } return null }

      // ─── CLAIM SYNC LOCK ──────────────────────────────────────────────────────
      let claimLockUntil = 0;
      const SYNC_WINDOW_MS = 10000;

      function showSyncLockBanner() {
        const el = document.getElementById('sync-lock-banner'); if (!el) return;
        el.classList.add('show');
        const tick = () => {
          const rem = Math.ceil((claimLockUntil - Date.now()) / 1000);
          if (rem <= 0) { el.classList.remove('show'); return }
          el.textContent = `⟳ Syncing your orbs from the network… (${rem}s)`;
          setTimeout(tick, 500);
        };
        tick();
      }

      // ─── LOADER / SETUP UI ────────────────────────────────────────────────────
      const loader = document.getElementById('loader');
      const ldstatus = document.getElementById('ldstatus');
      const setup = document.getElementById('setup');
      let sfGlow = myGlow, sfEye = myEye;

      function buildSwInto(containerId: string, cur: string, onPick: (k: string) => void) {
        const el = document.getElementById(containerId); if (!el) return; el.innerHTML = '';
        CK.forEach(k => { const s = document.createElement('div'); s.className = 'sw' + (k === cur ? ' on' : ''); s.style.cssText = `background:${CSS_C[k]};box-shadow:0 0 5px ${CSS_C[k]}55`; s.title = k; s.onclick = () => { el.querySelectorAll('.sw').forEach(x => x.classList.remove('on')); s.classList.add('on'); onPick(k) }; el.appendChild(s) });
      }

      function fadeLoader() { if (!loader) return; loader.classList.add('fade'); setTimeout(() => { if (loader) loader.style.display = 'none' }, 750) }

      function copyText(txt: string) {
        navigator.clipboard.writeText(txt).catch(() => { const ta = document.createElement('textarea'); ta.value = txt; ta.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove() });
      }

      function renderSetupPhrase(phrase: string) {
        const grid = document.getElementById('sf-words-grid'); if (!grid) return; grid.innerHTML = '';
        phrase.split(' ').forEach((w, i) => { const d = document.createElement('div'); d.className = 'sf-word'; d.innerHTML = `<span class="sf-word-num">${i + 1}</span><span class="sf-word-val">${w}</span>`; grid.appendChild(d) });
      }

      const sfRecoverToggle = document.getElementById('sf-recover-toggle');
      if (sfRecoverToggle) sfRecoverToggle.onclick = () => { const box = document.getElementById('sf-recover-box'); if (box) box.classList.toggle('show') };

      const sfRecoverBtn = document.getElementById('sf-recover-btn');
      if (sfRecoverBtn) sfRecoverBtn.onclick = async () => {
        const phrase = (document.getElementById('sf-recover-input') as HTMLTextAreaElement | null)?.value.trim().toLowerCase() || '';
        const errEl = document.getElementById('sf-recover-err'); if (errEl) errEl.textContent = '';
        try {
          validatePhrase(phrase);
          if (ldstatus) { ldstatus.textContent = 'Deriving identity…'; ldstatus.style.display = '' }
          myKP = await seedPhraseToKeypair(phrase);
          myPK = buf2b64(await crypto.subtle.exportKey('spki', myKP.publicKey));
          myPhrase = phrase; myShortId = (await sha256hex(myPK)).slice(0, 8).toUpperCase();
          const wpId = document.getElementById('wp-idval'); if (wpId) wpId.textContent = myShortId;
          localStorage.setItem('sd-phrase', phrase);
          const savedProfile = loadProfileForId(myShortId);
          if (savedProfile) {
            myName = savedProfile.name || myName; myGlow = savedProfile.glow || myGlow; myEye = savedProfile.eye || myEye;
            sfGlow = myGlow; sfEye = myEye;
            const pfFound = document.getElementById('sf-profile-found'); if (pfFound) pfFound.classList.add('show');
            const pfRow = document.getElementById('sf-profile-found-row'); if (pfRow) pfRow.textContent = `Name: ${myName}  ·  ID: ${myShortId}`;
            const sfNameEl = document.getElementById('sf-name') as HTMLInputElement | null; if (sfNameEl) sfNameEl.value = myName;
            buildSwInto('sf-glowsw', myGlow, k => sfGlow = k); buildSwInto('sf-eyesw', myEye, k => sfEye = k);
          } else {
            const sfNameEl = document.getElementById('sf-name') as HTMLInputElement | null;
            if (sfNameEl) { sfNameEl.value = ''; sfNameEl.placeholder = `Spirit #${myShortId} — enter a name…` }
          }
          claimLockUntil = Date.now() + SYNC_WINDOW_MS;
          const sfPhraseSection = document.getElementById('sf-phrase-section'); if (sfPhraseSection) sfPhraseSection.style.display = 'none';
          const sfEnterEl = document.getElementById('sf-enter') as HTMLButtonElement | null; if (sfEnterEl) sfEnterEl.disabled = false;
          const sfRecoverBox = document.getElementById('sf-recover-box'); if (sfRecoverBox) sfRecoverBox.classList.remove('show');
          if (ldstatus) { ldstatus.textContent = savedProfile ? `Welcome back, ${myName}! ✓` : `Identity ${myShortId} restored ✓`; setTimeout(() => { if (ldstatus) ldstatus.style.display = 'none' }, 1800) }
          const localTxs = loadPersistedLedger();
          localTxs.sort((a, b) => (a.ts || 0) - (b.ts || 0));
          for (const tx of localTxs) {
            if (txSet.has(tx.id)) continue;
            const verdict = await validateTx(tx);
            if (verdict === 'ok') { ledger.push(tx); txSet.add(tx.id); if (tx.type === 'claim') { const orb = orbDefs[tx.orbId!]; if (orb) orb.claimed = true } }
          }
          updateWalletHUD();
        } catch (e: unknown) { if (errEl) errEl.textContent = '⚠ ' + (e as Error).message; if (ldstatus) ldstatus.style.display = 'none' }
      };

      const sfRecoverInput = document.getElementById('sf-recover-input');
      if (sfRecoverInput) sfRecoverInput.addEventListener('keydown', e => { e.stopPropagation(); if ((e as KeyboardEvent).key === 'Enter') document.getElementById('sf-recover-btn')?.click() });

      const sfCopyPhrase = document.getElementById('sf-copy-phrase');
      if (sfCopyPhrase) sfCopyPhrase.onclick = () => copyText(myPhrase);

      // ─── THREE.JS SCENE ───────────────────────────────────────────────────────
      const scene = new THREE.Scene(); scene.background = new THREE.Color(0x000000); scene.fog = new THREE.FogExp2(0x000000, .009);
      const camera = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, .1, 600); camera.position.set(0, 0, 22);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(innerWidth, innerHeight); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 1); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = .88;
      renderer.domElement.style.position = 'fixed'; renderer.domElement.style.top = '0'; renderer.domElement.style.left = '0'; renderer.domElement.style.zIndex = '1';
      document.body.appendChild(renderer.domElement);

      const labelRen = new CSS2DRenderer(); labelRen.setSize(innerWidth, innerHeight);
      labelRen.domElement.style.cssText = 'position:fixed;top:0;left:0;z-index:10;pointer-events:none';
      document.body.appendChild(labelRen.domElement);

      const composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), .35, 1.0, 0);
      composer.addPass(bloom); composer.addPass(new OutputPass());

      scene.add(new THREE.AmbientLight(0x0a0a2e, .1));
      const rl1 = new THREE.DirectionalLight(0x4a90e2, .65); rl1.position.set(-8, 6, 4); scene.add(rl1);
      const rl2 = new THREE.DirectionalLight(0x50e3c2, .4); rl2.position.set(8, -4, 2); scene.add(rl2);

      const FFLY: { orb: THREETypes.Mesh; mat: THREETypes.MeshBasicMaterial; bx: number; by: number; bz: number; phase: number; spd: number; vel: THREETypes.Vector3 }[] = [];
      for (let i = 0; i < 18; i++) {
        const ckeys = ['cyan', 'teal', 'violet', 'purple', 'lime', 'pink']; const c = PAL[ckeys[i % ckeys.length]];
        const mat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .7 });
        const orb = new THREE.Mesh(new THREE.SphereGeometry(.05, 4, 4), mat);
        const bx = (Math.random() - .5) * 120 * 1.8, by = (Math.random() - .5) * 16, bz = (Math.random() - .5) * 14;
        orb.position.set(bx, by, bz); scene.add(orb);
        FFLY.push({ orb, mat, bx, by, bz, phase: Math.random() * Math.PI * 2, spd: .5 + Math.random() * 1.2, vel: new THREE.Vector3((Math.random() - .5) * .018, (Math.random() - .5) * .018, (Math.random() - .5) * .009) });
      }
      const fill = new THREE.PointLight(0x4488ff, .35, 90, 1.5); fill.position.set(0, 0, 10); scene.add(fill);

      // ─── GHOST FACTORY ────────────────────────────────────────────────────────
      const GGEO = (() => {
        const g = new THREE.SphereGeometry(2, 20, 20);
        const p = g.getAttribute('position').array as Float32Array;
        for (let i = 0; i < p.length; i += 3) if (p[i + 1] < -.2) { const x = p[i], z = p[i + 2]; p[i + 1] = -2 + Math.sin(x * 5) * .35 + Math.cos(z * 4) * .25 + Math.sin((x + z) * 3) * .15 }
        g.computeVertexNormals(); return g;
      })();

      interface Ghost {
        grp: THREETypes.Group; body: THREETypes.Mesh; bMat: THREETypes.MeshStandardMaterial;
        eMats: THREETypes.MeshBasicMaterial[]; oMats: THREETypes.MeshBasicMaterial[];
        nmEl: HTMLElement; msgEl: HTMLElement; _mt: ReturnType<typeof setTimeout> | null;
        audioEl?: HTMLAudioElement; audioSrc?: MediaStreamAudioSourceNode; analyser?: AnalyserNode;
        _speakBuf?: Uint8Array<ArrayBuffer>; _speakDot?: HTMLElement;
      }

      function mkGhost(gk: string, ek: string): Ghost {
        const gc = PAL[gk] ?? PAL.orange, ec = PAL[ek] ?? PAL.green; const grp = new THREE.Group();
        const bMat = new THREE.MeshStandardMaterial({ color: 0x0f2027, emissive: new THREE.Color(gc), emissiveIntensity: 5.5, transparent: true, opacity: .88, roughness: .02, side: THREE.DoubleSide });
        const body = new THREE.Mesh(GGEO, bMat); grp.add(body);
        const skG = new THREE.SphereGeometry(.42, 10, 10), skM = new THREE.MeshBasicMaterial({ color: 0 });
        for (const [x, y, z] of [[-0.7, .6, 1.88], [0.7, .6, 1.88]]) { const s = new THREE.Mesh(skG, skM); s.position.set(x, y, z); s.scale.set(1.1, 1, .6); grp.add(s) }
        const eGeo = new THREE.SphereGeometry(.28, 8, 8); const eMats: THREETypes.MeshBasicMaterial[] = [];
        for (const [x, y, z] of [[-0.7, .6, 2.05], [0.7, .6, 2.05]]) { const m = new THREE.MeshBasicMaterial({ color: ec, transparent: true, opacity: .1 }); eMats.push(m); const msh = new THREE.Mesh(eGeo, m); msh.position.set(x, y, z); grp.add(msh) }
        const oGeo = new THREE.SphereGeometry(.48, 8, 8); const oMats: THREETypes.MeshBasicMaterial[] = [];
        for (const [x, y, z] of [[-0.7, .6, 2.0], [0.7, .6, 2.0]]) { const m = new THREE.MeshBasicMaterial({ color: ec, transparent: true, opacity: .03, side: THREE.BackSide }); oMats.push(m); const msh = new THREE.Mesh(oGeo, m); msh.position.set(x, y, z); grp.add(msh) }
        const lDiv = document.createElement('div'); lDiv.className = 'glabel';
        const msgEl = document.createElement('div'); msgEl.className = 'gmsg';
        const nmEl = document.createElement('div'); nmEl.className = 'gname';
        lDiv.appendChild(msgEl); lDiv.appendChild(nmEl);
        const lObj = new CSS2DObject(lDiv); lObj.position.set(0, 3.5, 0); grp.add(lObj);
        return { grp, body, bMat, eMats, oMats, nmEl, msgEl, _mt: null };
      }

      function setColors(g: Ghost, gk: string, ek: string) {
        g.bMat.emissive.set(PAL[gk] ?? PAL.orange);
        const c = new THREE.Color(PAL[ek] ?? PAL.green);
        [...g.eMats, ...g.oMats].forEach(m => m.color.copy(c));
      }
      function showMsg(g: Ghost, txt: string) {
        g.msgEl.textContent = txt; g.msgEl.style.display = 'block';
        g.msgEl.style.animation = 'none'; void g.msgEl.offsetWidth; g.msgEl.style.animation = '';
        if (g._mt) clearTimeout(g._mt); g._mt = setTimeout(() => { g.msgEl.style.display = 'none' }, MSG_LIFE);
      }

      // ─── LOCAL PLAYER ─────────────────────────────────────────────────────────
      let local: Ghost;
      const pos = new THREE.Vector2(+localStorage.getItem('sd-x')! || 0, +localStorage.getItem('sd-y')! || 0);
      const camPos = new THREE.Vector2(pos.x, pos.y);
      let moveDir = new THREE.Vector2(), eyeLit = 0;

      const micBtn = document.getElementById('hp-mic'), micLabelEl = document.getElementById('hp-miclabel');
      function setMicState(state: string) {
        if (!micBtn || !micLabelEl) return;
        micBtn.className = 'hp-seg clickable' + (state !== 'off' ? ' ' + state : '');
        micLabelEl.textContent = state === 'waiting' ? 'Asking…' : state === 'live' ? 'Live' : state === 'muted' ? 'Muted' : 'Voice';
      }

      let audioCtx: AudioContext | null = null, localStream: MediaStream | null = null, micMuted = false;
      const pendingStreams = new Map<string, MediaStream>();
      const VOICE_RANGE = 12, VOICE_FULL = 2;
      function ensureAudioCtx() { if (audioCtx) return; audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)() }
      function distToGain(d: number) { if (d <= VOICE_FULL) return 1; if (d >= VOICE_RANGE) return 0; const t = (d - VOICE_FULL) / (VOICE_RANGE - VOICE_FULL); return Math.max(0, Math.min(1, (1 - t) * (1 - t))) }

      function attachStream(e: Remote, stream: MediaStream) {
        if (e.audioEl) { e.audioEl.srcObject = null; e.audioEl.remove() }
        try { if (e.analyser) e.analyser.disconnect() } catch (_) { }
        try { if (e.audioSrc) e.audioSrc.disconnect() } catch (_) { }
        const audio = new Audio(); audio.srcObject = stream; audio.autoplay = true; audio.volume = 0;
        audio.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none';
        document.body.appendChild(audio); audio.play().catch(() => { }); e.audioEl = audio;
        ensureAudioCtx();
        try { const src = audioCtx!.createMediaStreamSource(stream); const analyser = audioCtx!.createAnalyser(); analyser.fftSize = 512; src.connect(analyser); e.audioSrc = src; e.analyser = analyser; e._speakBuf = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer> } catch (_) { }
      }
      function isSpeaking(e: Remote): boolean {
        if (!e.analyser || !e._speakBuf) return false;
        e.analyser.getByteTimeDomainData(e._speakBuf); let sum = 0;
        for (let i = 0; i < e._speakBuf.length; i++) { const v = e._speakBuf[i] / 128 - 1; sum += v * v }
        return (sum / e._speakBuf.length) > 0.003;
      }

      async function toggleMic() {
        ensureAudioCtx(); if (audioCtx!.state === 'suspended') await audioCtx!.resume();
        if (!localStream) {
          setMicState('waiting');
          try { localStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }, video: false }); micMuted = false; setMicState('live'); if (roomRef) roomRef.addStream(localStream) }
          catch { localStream = null; setMicState('off') }
          return;
        }
        micMuted = !micMuted; localStream.getAudioTracks().forEach(t => t.enabled = !micMuted); setMicState(micMuted ? 'muted' : 'live');
      }
      if (micBtn) micBtn.onclick = toggleMic;

      // ─── TELEPORT ─────────────────────────────────────────────────────────────
      const tpFlash = document.getElementById('tpflash'); let tpActive = false;
      function doTeleport(tx: number, ty: number) {
        if (tpActive) return; tpActive = true; if (tpFlash) tpFlash.classList.add('pop');
        setTimeout(() => {
          pos.x = tx; pos.y = ty; camPos.x = tx; camPos.y = ty;
          camera.position.x = tx; camera.position.y = ty;
          if (local) local.grp.position.set(tx, ty, 0);
          sendState(myState()); localStorage.setItem('sd-x', String(pos.x)); localStorage.setItem('sd-y', String(pos.y));
          setTimeout(() => { if (tpFlash) tpFlash.classList.remove('pop'); tpActive = false }, 300);
        }, 90);
      }

      // ─── PANEL HELPERS ────────────────────────────────────────────────────────
      const scrim = document.getElementById('scrim');
      const tpPanel = document.getElementById('tppanel');
      const custPanel = document.getElementById('custpanel');
      const walletPanel = document.getElementById('walletpanel');
      const allPanels = [tpPanel, custPanel, walletPanel];
      function openPanel(panel: HTMLElement | null) { allPanels.forEach(p => p?.classList.remove('open')); panel?.classList.add('open'); scrim?.classList.add('show') }
      function closePanel() { allPanels.forEach(p => p?.classList.remove('open')); scrim?.classList.remove('show') }
      if (scrim) scrim.onclick = closePanel;

      const tpxEl = document.getElementById('tpx') as HTMLInputElement | null;
      const tpyEl = document.getElementById('tpy') as HTMLInputElement | null;
      const tpdistEl = document.getElementById('tpdist');

      function openTpPanel() { if (tpxEl) tpxEl.value = String(Math.round(pos.x)); if (tpyEl) tpyEl.value = String(Math.round(pos.y)); updDist(); openPanel(tpPanel) }
      function updDist() { const tx = parseFloat(tpxEl?.value || '0') || 0, ty = parseFloat(tpyEl?.value || '0') || 0; const d = Math.hypot(tx - pos.x, ty - pos.y); if (tpdistEl) tpdistEl.textContent = `${Math.round(pos.x)}, ${Math.round(pos.y)}  →  ${Math.round(tx)}, ${Math.round(ty)}  ·  Δ ${Math.round(d)}` }
      if (tpxEl) tpxEl.addEventListener('input', updDist); if (tpyEl) tpyEl.addEventListener('input', updDist);
      [tpxEl, tpyEl].forEach(inp => inp?.addEventListener('keydown', e => { e.stopPropagation(); if ((e as KeyboardEvent).key === 'Enter') document.getElementById('tpgo')?.click(); if ((e as KeyboardEvent).key === 'Escape') closePanel() }));
      const tpGoEl = document.getElementById('tpgo'); if (tpGoEl) tpGoEl.onclick = () => { const tx = parseFloat(tpxEl?.value || '0') || 0, ty = parseFloat(tpyEl?.value || '0') || 0; closePanel(); doTeleport(tx, ty) };
      const tpCancelEl = document.getElementById('tpcancel'); if (tpCancelEl) tpCancelEl.onclick = closePanel;

      const hpCoordEl = document.getElementById('hp-coord'); if (hpCoordEl) hpCoordEl.onclick = openTpPanel;
      const hpCustEl = document.getElementById('hp-cust'); if (hpCustEl) hpCustEl.onclick = openCustPanel;

      let cpGlow = myGlow, cpEye = myEye;
      function buildSwPanel(cid: string, cur: string, onPick: (k: string) => void) {
        const el = document.getElementById(cid); if (!el) return; el.innerHTML = '';
        CK.forEach(k => { const s = document.createElement('div'); s.className = 'sw' + (k === cur ? ' on' : ''); s.style.cssText = `background:${CSS_C[k]};box-shadow:0 0 5px ${CSS_C[k]}55`; s.title = k; s.onclick = () => { el.querySelectorAll('.sw').forEach(x => x.classList.remove('on')); s.classList.add('on'); onPick(k) }; el.appendChild(s) });
      }
      function openCustPanel() {
        cpGlow = myGlow; cpEye = myEye;
        const cpNameEl = document.getElementById('cp-name') as HTMLInputElement | null; if (cpNameEl) cpNameEl.value = myName;
        buildSwPanel('cp-glowsw', myGlow, k => cpGlow = k); buildSwPanel('cp-eyesw', myEye, k => cpEye = k);
        openPanel(custPanel);
      }
      const cpRndEl = document.getElementById('cp-rnd'); if (cpRndEl) cpRndEl.onclick = () => { const cpNameEl = document.getElementById('cp-name') as HTMLInputElement | null; if (cpNameEl) cpNameEl.value = rndName() };
      const cpSaveEl = document.getElementById('cp-save');
      if (cpSaveEl) cpSaveEl.onclick = () => {
        const n = (document.getElementById('cp-name') as HTMLInputElement | null)?.value.trim();
        myName = n || rndName(); myGlow = cpGlow; myEye = cpEye; save();
        if (local) { setColors(local, myGlow, myEye); local.nmEl.textContent = myName }
        sendHello({ ...myState(), pk: myPK, sid: myShortId }); closePanel();
      };

      // ─── REMOTES ──────────────────────────────────────────────────────────────
      interface Remote {
        ghost: Ghost; tx: number; ty: number; glow: string; eye: string;
        lx: number; ly: number; pk: string | null; shortId: string | null;
        audioEl?: HTMLAudioElement; audioSrc?: MediaStreamAudioSourceNode;
        analyser?: AnalyserNode; _speakBuf?: Uint8Array<ArrayBuffer>; _speakDot?: HTMLElement;
      }
      const remotes = new Map<string, Remote>();

      function getOrCreate(id: string, d: { glow?: string; eye?: string; name?: string; x?: number; y?: number; pk?: string; sid?: string }): Remote | null {
        if (remotes.has(id)) return remotes.get(id)!;
        if (remotes.size >= 60) return null;
        const g = mkGhost(d.glow || 'cyan', d.eye || 'teal');
        g.nmEl.textContent = d.name || 'Unknown Spirit';
        g.grp.position.set(d.x || 0, d.y || 0, 0); scene.add(g.grp);
        const e: Remote = { ghost: g, tx: d.x || 0, ty: d.y || 0, glow: d.glow || 'cyan', eye: d.eye || 'teal', lx: d.x || 0, ly: d.y || 0, pk: d.pk || null, shortId: d.sid || null };
        remotes.set(id, e); refreshCount(); return e;
      }
      function applyState(id: string, d: { x?: number; y?: number; name?: string; pk?: string; sid?: string; glow?: string; eye?: string }) {
        const e = getOrCreate(id, d); if (!e) return;
        if (d.x != null) e.tx = d.x; if (d.y != null) e.ty = d.y;
        if (d.name) e.ghost.nmEl.textContent = d.name; if (d.pk) e.pk = d.pk; if (d.sid) e.shortId = d.sid;
        if (d.pk) lastSeen.set(d.pk, Date.now());
        if ((d.glow && d.glow !== e.glow) || (d.eye && d.eye !== e.eye)) { setColors(e.ghost, d.glow || e.glow, d.eye || e.eye); e.glow = d.glow || e.glow; e.eye = d.eye || e.eye }
      }
      function dropPeer(id: string) {
        const e = remotes.get(id); if (!e) return;
        if (e.audioEl) { e.audioEl.srcObject = null; e.audioEl.remove() }
        try { if (e.audioSrc) e.audioSrc.disconnect() } catch (_) { }
        try { if (e.analyser) e.analyser.disconnect() } catch (_) { }
        scene.remove(e.ghost.grp); remotes.delete(id); refreshCount();
      }
      function refreshCount() {
        const hpN = document.getElementById('hp-n'); if (hpN) hpN.textContent = String(remotes.size + 1);
      }
      const myState = (ex: Record<string, unknown> = {}) => ({ x: +pos.x.toFixed(1), y: +pos.y.toFixed(1), name: myName, glow: myGlow, eye: myEye, ...ex });
      setInterval(() => { localStorage.setItem('sd-x', String(pos.x)); localStorage.setItem('sd-y', String(pos.y)) }, 3000);

      // ─── P2P ──────────────────────────────────────────────────────────────────
      // New trystero API: action.send(data, { target: peerId | null })
      let sendState: (data: unknown, target?: string | null) => void = () => {};
      let sendChat: (data: unknown, target?: string | null) => void = () => {};
      let sendHello: (data: unknown, target?: string | null) => void = () => {};
      let sendTx: (data: unknown, target?: string | null) => void = () => {};
      let roomRef: { addStream: (stream: MediaStream) => void } | null = null;

      const hpDot = document.getElementById('hp-dot');
      const hpConnLabel = document.getElementById('hp-connlabel');
      const hpConnWrap = document.getElementById('hp-conn-wrap');
      const copyTip = document.getElementById('copytip');
      let connCopyable = false;

      if (hpConnWrap) hpConnWrap.onclick = () => {
        if (!connCopyable) return;
        copyText(location.href);
        if (copyTip) { copyTip.classList.add('show'); clearTimeout((hpConnWrap as HTMLElement & { _ct?: ReturnType<typeof setTimeout> })._ct); (hpConnWrap as HTMLElement & { _ct?: ReturnType<typeof setTimeout> })._ct = setTimeout(() => copyTip.classList.remove('show'), 2000) }
      };
      function setConn(label: string, state: string) {
        if (hpConnLabel) hpConnLabel.textContent = label;
        if (hpDot) hpDot.className = 'hp-dot ' + (state === 'ok' || state === 'copy' ? 'ok' : 'bad pulse');
        connCopyable = state === 'copy';
        if (hpConnWrap) { hpConnWrap.title = state === 'copy' ? 'Copy invite link' : ''; (hpConnWrap as HTMLElement).style.color = state === 'copy' ? 'rgba(0,200,100,.75)' : '' }
      }

      function initP2P() {
        import('@trystero-p2p/torrent').then(({ joinRoom }) => {
          const room = joinRoom({ appId: 'spectral-drift-ghost-world-v3', relayConfig: { urls: ['wss://tracker.openwebtorrent.com', 'wss://tracker.webtorrent.dev'], redundancy: 2 } }, ROOM_ID);
          roomRef = room;

          const stateAction = room.makeAction('s');
          const chatAction  = room.makeAction('c');
          const helloAction = room.makeAction('h');
          const txAction    = room.makeAction('tx');
          const ledgerAction = room.makeAction('ld');

          // Wire up senders — new API: action.send(data, { target })
          sendState = (data, target?) => void stateAction.send(data as never, target ? { target } : undefined);
          sendChat  = (data, target?) => void chatAction.send(data as never, target ? { target } : undefined);
          sendHello = (data, target?) => void helloAction.send(data as never, target ? { target } : undefined);
          sendTx    = (data, target?) => void txAction.send(data as never, target ? { target } : undefined);

          room.onPeerJoin = (id: string) => {
            setConn('Connected', 'ok');
            sendHello({ ...myState(), pk: myPK, sid: myShortId }, id);
            if (ledger.length) {
              const CHUNK = 200;
              for (let i = 0; i < ledger.length; i += CHUNK)
                void ledgerAction.send({ txs: ledger.slice(i, i + CHUNK), total: ledger.length, chunk: Math.floor(i / CHUNK) } as never, { target: id });
            }
            if (localStream) room.addStream(localStream);
          };

          room.onPeerLeave = (id: string) => { dropPeer(id); pendingStreams.delete(id); if (remotes.size === 0) setConn('Alone — share link', 'copy') };

          helloAction.onMessage = (d: unknown, ctx: { peerId: string }) => {
            const id = ctx.peerId;
            applyState(id, d as Parameters<typeof applyState>[1]);
            if (pendingStreams.has(id)) { const e = remotes.get(id); if (e) { attachStream(e, pendingStreams.get(id)!); pendingStreams.delete(id) } }
          };
          stateAction.onMessage = (d: unknown, ctx: { peerId: string }) => applyState(ctx.peerId, d as Parameters<typeof applyState>[1]);
          chatAction.onMessage  = (d: unknown, ctx: { peerId: string }) => { const e = remotes.get(ctx.peerId); if (e) showMsg(e.ghost, (d as { m: string }).m) };
          txAction.onMessage    = async (tx: unknown) => { await applyTx(tx as Tx, false) };
          ledgerAction.onMessage = async (data: unknown) => {
            const d = data as { txs?: Tx[] };
            if (!d || !Array.isArray(d.txs)) return;
            let added = 0;
            for (const tx of d.txs) { const ok = await applyTx(tx, false); if (ok) added++ }
            if (added > 0) { showSyncBadge(); updateWalletHUD(); if (local) { local.nmEl.textContent = myName; setColors(local, myGlow, myEye) } }
            if (added > 5 && claimLockUntil > Date.now()) claimLockUntil = Date.now() + 1500;
          };

          room.onPeerStream = (stream: MediaStream, id: string) => { const e = remotes.get(id); if (e) attachStream(e, stream); else pendingStreams.set(id, stream) };

          const myHello = () => ({ ...myState(), pk: myPK, sid: myShortId });
          setTimeout(() => sendHello(myHello()), 200);
          setTimeout(() => sendHello(myHello()), 2500);
          setInterval(() => { sendHello(myHello()); lastSeen.set(myPK, Date.now()); saveLedger() }, 20000);
          setTimeout(() => { if (remotes.size === 0) setConn('Share link to invite', 'copy') }, 8000);
        }).catch(err => { console.warn('P2P init failed:', err); setConn('Solo mode', 'bad') });
      }

      // ─── INPUT ────────────────────────────────────────────────────────────────
      const keys: Record<string, boolean> = {};
      const onKeyDown = (e: KeyboardEvent) => { keys[e.code] = true };
      const onKeyUp = (e: KeyboardEvent) => { keys[e.code] = false };
      const onBlur = () => { Object.keys(keys).forEach(k => keys[k] = false); tO = null; tC = null };
      window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp); window.addEventListener('blur', onBlur);

      const ci = document.getElementById('chatinput') as HTMLInputElement | null;
      const isPanelOpen = () => allPanels.some(p => p?.classList.contains('open'));
      const isTyping = () => { const a = document.activeElement; const inputs = [ci, tpxEl, tpyEl, document.getElementById('cp-name'), document.getElementById('sf-name'), document.getElementById('xfer-c'), document.getElementById('xfer-u'), document.getElementById('xfer-r'), document.getElementById('xfer-to'), document.getElementById('sf-recover-input')]; return inputs.some(el => el === a) };

      const onGlobalKeyDown = (e: KeyboardEvent) => { if (e.key === 'Escape') closePanel(); if (e.key === 'Enter' && !isTyping() && !isPanelOpen()) { e.preventDefault(); ci?.focus() } };
      window.addEventListener('keydown', onGlobalKeyDown);

      if (ci) {
        ci.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter') { doChat(); ci.blur() } if (e.key === 'Escape') { ci.value = ''; ci.blur() } });
      }
      const chatSendEl = document.getElementById('chatsend'); if (chatSendEl) chatSendEl.onclick = () => { doChat(); ci?.blur() };

      function parseTp(txt: string): { x: number; y: number } | null { const m = txt.match(/^\/(tp|goto|teleport)\s+(-?[\d.]+)\s+(-?[\d.]+)/i); return m ? { x: parseFloat(m[2]), y: parseFloat(m[3]) } : null }
      function doChat() { if (!ci) return; const msg = ci.value.trim(); if (!msg) return; const tp = parseTp(msg); if (tp) { ci.value = ''; doTeleport(tp.x, tp.y); return } ci.value = ''; showMsg(local, msg); sendChat({ m: msg }) }

      let tO: { x: number; y: number } | null = null, tC: { x: number; y: number } | null = null;
      const onTouchStart = (e: TouchEvent) => { if ((e.target as HTMLElement).closest('#chatbar,#loader,#mmwrap,#tppanel,#custpanel,#walletpanel,#scrim')) return; tO = { x: e.touches[0].clientX, y: e.touches[0].clientY }; tC = { ...tO } };
      const onTouchMove = (e: TouchEvent) => { if (tO) tC = { x: e.touches[0].clientX, y: e.touches[0].clientY } };
      const onTouchEnd = () => { tO = null; tC = null };
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);

      const onResize = () => { const w = innerWidth, h = innerHeight; camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h); composer.setSize(w, h); labelRen.setSize(w, h); bloom.setSize(w, h) };
      window.addEventListener('resize', onResize);

      // ─── MINIMAP ──────────────────────────────────────────────────────────────
      const mmc = document.getElementById('mm') as HTMLCanvasElement | null;
      const mmx = mmc?.getContext('2d')!;
      const MM = 120, R = 60, mmScale = R / MM_RANGE;
      let mmTick = 0, mmPreview: { x: number; y: number } | null = null;
      if (mmc) {
        mmc.addEventListener('mousemove', e => { const rect = mmc.getBoundingClientRect(); const cx = e.clientX - rect.left - R, cy = e.clientY - rect.top - R; mmPreview = Math.hypot(cx, cy) < R - 2 ? { x: cx, y: cy } : null });
        mmc.addEventListener('mouseleave', () => mmPreview = null);
      }

      function drawMm() {
        if (!mmx) return;
        if (++mmTick % 2 !== 0) return;
        mmx.clearRect(0, 0, MM, MM); mmx.save();
        mmx.beginPath(); mmx.arc(R, R, R - 1, 0, Math.PI * 2); mmx.clip();
        mmx.fillStyle = '#07060f'; mmx.fillRect(0, 0, MM, MM);
        mmx.strokeStyle = 'rgba(255,255,255,0.04)'; mmx.lineWidth = 0.7;
        const gs = 10 * mmScale, ox = ((pos.x % 10) + 10) % 10 * mmScale, oy = ((pos.y % 10) + 10) % 10 * mmScale;
        for (let x = R - ox; x >= 0; x -= gs) { mmx.beginPath(); mmx.moveTo(x, 0); mmx.lineTo(x, MM); mmx.stroke() }
        for (let x = R - ox + gs; x <= MM; x += gs) { mmx.beginPath(); mmx.moveTo(x, 0); mmx.lineTo(x, MM); mmx.stroke() }
        for (let y = R + oy; y <= MM; y += gs) { mmx.beginPath(); mmx.moveTo(0, y); mmx.lineTo(MM, y); mmx.stroke() }
        for (let y = R + oy - gs; y >= 0; y -= gs) { mmx.beginPath(); mmx.moveTo(0, y); mmx.lineTo(MM, y); mmx.stroke() }
        for (const orb of orbDefs) {
          if (orb.claimed) continue; const dx = orb.x - pos.x, dy = orb.y - pos.y;
          if (Math.abs(dx) > MM_RANGE || Math.abs(dy) > MM_RANGE) continue;
          const mx = R + dx * mmScale, my = R - dy * mmScale; if (Math.hypot(mx - R, my - R) > R - 2) continue;
          mmx.fillStyle = ORB_CSS_COL[orb.type]; mmx.globalAlpha = 0.7; const r = orb.type === 'rare' ? 3 : orb.type === 'uncommon' ? 2.2 : 1.5;
          mmx.beginPath(); mmx.arc(mx, my, r, 0, Math.PI * 2); mmx.fill(); mmx.globalAlpha = 1;
        }
        if (mmPreview) {
          const sc = MM_RANGE / R, wx = Math.round(pos.x + mmPreview.x * sc), wy = Math.round(pos.y - mmPreview.y * sc);
          const mx = R + mmPreview.x, my = R + mmPreview.y;
          mmx.strokeStyle = 'rgba(160,100,255,0.4)'; mmx.lineWidth = 0.8; mmx.setLineDash([2, 3]);
          mmx.beginPath(); mmx.moveTo(mx, 0); mmx.lineTo(mx, MM); mmx.stroke();
          mmx.beginPath(); mmx.moveTo(0, my); mmx.lineTo(MM, my); mmx.stroke(); mmx.setLineDash([]);
          mmx.fillStyle = 'rgba(160,100,255,0.65)'; mmx.beginPath(); mmx.arc(mx, my, 2.5, 0, Math.PI * 2); mmx.fill();
          mmx.fillStyle = 'rgba(200,160,255,0.75)'; mmx.font = 'bold 6px monospace'; mmx.textAlign = 'left';
          mmx.fillText(`${wx},${wy}`, mx + 5 < MM - 26 ? mx + 5 : mx - 28, my - 5 > 8 ? my - 4 : my + 11);
        }
        for (const [, e] of remotes) {
          const mx = R + (e.ghost.grp.position.x - pos.x) * mmScale, my = R - (e.ghost.grp.position.y - pos.y) * mmScale;
          if (Math.hypot(mx - R, my - R) > R - 2) continue;
          const c = CSS_C[e.glow] || '#fff';
          const g = mmx.createRadialGradient(mx, my, 0, mx, my, 8); g.addColorStop(0, c + '66'); g.addColorStop(1, 'transparent');
          mmx.fillStyle = g; mmx.beginPath(); mmx.arc(mx, my, 8, 0, Math.PI * 2); mmx.fill();
          mmx.fillStyle = c; mmx.beginPath(); mmx.arc(mx, my, 3, 0, Math.PI * 2); mmx.fill();
          mmx.fillStyle = 'rgba(255,255,255,0.5)'; mmx.font = 'bold 6px monospace'; mmx.textAlign = 'center';
          mmx.fillText((e.ghost.nmEl.textContent || '?')[0].toUpperCase(), mx, my - 6);
        }
        drawAdsMm();
        const lc = CSS_C[myGlow] || '#ff4500'; const pulse = .55 + .45 * Math.sin(Date.now() * .005), pr = 6 + pulse * 4;
        const lg = mmx.createRadialGradient(R, R, 0, R, R, pr); lg.addColorStop(0, lc + '88'); lg.addColorStop(1, 'transparent');
        mmx.fillStyle = lg; mmx.beginPath(); mmx.arc(R, R, pr, 0, Math.PI * 2); mmx.fill();
        mmx.fillStyle = lc; mmx.beginPath(); mmx.arc(R, R, 4, 0, Math.PI * 2); mmx.fill();
        mmx.fillStyle = '#fff'; mmx.beginPath(); mmx.arc(R, R, 1.6, 0, Math.PI * 2); mmx.fill(); mmx.restore();
        mmx.beginPath(); mmx.arc(R, R, R - .75, 0, Math.PI * 2); mmx.strokeStyle = 'rgba(255,255,255,0.14)'; mmx.lineWidth = 1.5; mmx.stroke();
        mmx.fillStyle = 'rgba(255,255,255,0.22)'; mmx.font = 'bold 7px monospace'; mmx.textAlign = 'center';
        mmx.fillText('N', R, 9); mmx.fillText('S', R, MM - 1); mmx.textAlign = 'left'; mmx.fillText('E', MM - 8, R + 3); mmx.textAlign = 'right'; mmx.fillText('W', 8, R + 3);
      }

      // ─── GHOST ANIMATION ──────────────────────────────────────────────────────
      function animGhost(g: Ghost, t: number, eyeT: number, lean: { x: number; y: number } | null, cheap: boolean) {
        g.body.position.y = Math.sin(t * 1.6) * .038 + Math.cos(t * .8) * .02;
        if (!cheap) {
          g.bMat.emissiveIntensity = 5.5 + Math.sin(t * 2) * .7 + Math.sin(t * .65) * .3;
          g.body.rotation.z += (-(lean?.x || 0) * .16 - g.body.rotation.z) * .07;
          g.body.rotation.x += ((lean?.y || 0) * .11 - g.body.rotation.x) * .07;
          g.body.rotation.y = Math.sin(t * 1.1) * .038;
          const sc = 1 + Math.sin(t * 2.1) * .016; g.body.scale.set(sc, sc, sc);
        }
        const eo = Math.max(0, Math.min(1, eyeT)); g.eMats.forEach(m => m.opacity = eo);
        if (!cheap) g.oMats.forEach(m => m.opacity = eo * .22);
      }

      // ─── MAIN LOOP ────────────────────────────────────────────────────────────
      let loopT = 0, lastTS = 0, lastSync = 0;
      let rafId: number;

      function loop(ts: number) {
        if (destroyed) return;
        rafId = requestAnimationFrame(loop);
        const dt = Math.min((ts - lastTS) / 1000, .05); lastTS = ts; loopT += dt;
        let dx = 0, dy = 0;
        if (!isTyping() && !tpActive && !isPanelOpen()) {
          if (keys['KeyA'] || keys['ArrowLeft']) dx -= 1; if (keys['KeyD'] || keys['ArrowRight']) dx += 1;
          if (keys['KeyW'] || keys['ArrowUp']) dy += 1; if (keys['KeyS'] || keys['ArrowDown']) dy -= 1;
          if (tO && tC) { const tdx = tC.x - tO.x, tdy = tC.y - tO.y, tl = Math.hypot(tdx, tdy); if (tl > 10) { dx += tdx / tl; dy -= tdy / tl } }
        }
        const len = Math.hypot(dx, dy);
        if (len > 0 && !tpActive) {
          const nx = dx / len, ny = dy / len; moveDir.set(nx, ny);
          pos.x += nx * SPEED; pos.y += ny * SPEED; eyeLit = Math.min(1, eyeLit + .1);
          if (ts - lastSync > SYNC_MS) { sendState(myState()); lastSync = ts }
        } else { eyeLit = Math.max(.05, eyeLit - .025); moveDir.multiplyScalar(.88) }

        if (mmTick % 10 === 0) {
          const hpXyz = document.getElementById('hp-xyz'); if (hpXyz) hpXyz.textContent = `X ${Math.round(pos.x)}  Y ${Math.round(pos.y)}`;
          if (tpPanel?.classList.contains('open')) updDist();
        }
        if (local) {
          local.grp.position.set(pos.x, pos.y, 0);
          animGhost(local, loopT, eyeLit, { x: moveDir.x, y: moveDir.y }, false);
        }
        camPos.x += (pos.x - camPos.x) * .065; camPos.y += (pos.y - camPos.y) * .065;
        camera.position.x = camPos.x; camera.position.y = camPos.y;

        for (const orb of orbDefs) {
          if (orb.claimed || !orb.mesh) continue;
          const odx = orb.x - pos.x, ody = orb.y - pos.y; const dist2 = odx * odx + ody * ody;
          orb.mesh.visible = dist2 < ORB_VIS * ORB_VIS; if (!orb.mesh.visible) continue;
          orb.mesh.position.z = .6 + Math.sin(loopT * 2 + orb.id * .693) * .3;
          if (dist2 < 900) { orb.mesh.rotation.y = loopT * .8 + orb.id * .4; (orb.mesh.material as THREETypes.MeshStandardMaterial).emissiveIntensity = ORB_3D[orb.type].ei + Math.sin(loopT * 3 + orb.id) * 1.5 }
        }
        checkClaims(); tickAds(loopT);

        for (const [, e] of remotes) {
          e.ghost.grp.position.x += (e.tx - e.ghost.grp.position.x) * .12;
          e.ghost.grp.position.y += (e.ty - e.ghost.grp.position.y) * .12;
          const dist = Math.hypot(e.tx - pos.x, e.ty - pos.y); const cheap = dist * dist > 900;
          const mv = Math.hypot(e.tx - (e.lx || 0), e.ty - (e.ly || 0)) > .04;
          const off = parseFloat('0.' + (e.ghost.nmEl.textContent?.charCodeAt(0) || 48));
          animGhost(e.ghost, loopT + off, mv ? .65 : .12, { x: 0, y: 0 }, cheap);
          e.lx = e.ghost.grp.position.x; e.ly = e.ghost.grp.position.y;
          if (e.audioEl) e.audioEl.volume = distToGain(dist);
          const speaking = !!e.audioEl && e.audioEl.volume > 0.01 && isSpeaking(e);
          if (speaking && !e._speakDot) { const dot = document.createElement('span'); dot.className = 'gspeaking'; e.ghost.nmEl.prepend(dot); e._speakDot = dot }
          else if (!speaking && e._speakDot) { e._speakDot.remove(); e._speakDot = undefined }
        }

        for (const f of FFLY) {
          const p = Math.sin(loopT * f.spd + f.phase); f.mat.opacity = .25 + p * .55;
          f.vel.x += (Math.random() - .5) * .0006; f.vel.y += (Math.random() - .5) * .0006; f.vel.z += (Math.random() - .5) * .0003;
          f.vel.clampLength(0, .028); f.orb.position.add(f.vel);
          const fdx = f.orb.position.x - pos.x, fdy = f.orb.position.y - pos.y;
          if (Math.abs(fdx) > 22) f.orb.position.x = pos.x - Math.sign(fdx) * 18 + (Math.random() - .5) * 4;
          if (Math.abs(fdy) > 14) f.orb.position.y = pos.y - Math.sign(fdy) * 10 + (Math.random() - .5) * 4;
        }

        composer.render(); labelRen.render(scene, camera); drawMm();
      }

      // ─── BOOTSTRAP ────────────────────────────────────────────────────────────
      async function bootstrap() {
        await initCrypto();
        if (isReturning) save();
        if (!isReturning) renderSetupPhrase(myPhrase);
        genOrbDefs(); genAdDefs();
        loadPersistedLastSeen(); lastSeen.set(myPK, Date.now());
        const savedTxs = loadPersistedLedger();
        savedTxs.sort((a, b) => (a.ts || 0) - (b.ts || 0));
        let restoredCount = 0;
        for (const tx of savedTxs) {
          if (txSet.has(tx.id)) continue;
          const verdict = await validateTx(tx);
          if (verdict === 'ok') { ledger.push(tx); txSet.add(tx.id); if (tx.type === 'claim') { const orb = orbDefs[tx.orbId!]; if (orb) orb.claimed = true } restoredCount++ }
        }
        if (restoredCount > 0) console.log(`[Ledger] Restored ${restoredCount} transactions from storage`);
        updateWalletHUD();
        buildOrbMeshes(); buildAdMeshes();
        if (isReturning) claimLockUntil = Date.now() + 3000;
      }

      function enterGame(name: string, glow: string, eye: string) {
        myName = name; myGlow = glow; myEye = eye; save();
        local = mkGhost(myGlow, myEye); local.nmEl.textContent = myName;
        local.grp.position.set(pos.x, pos.y, 0); scene.add(local.grp);
        camPos.set(pos.x, pos.y); camera.position.x = pos.x; camera.position.y = pos.y;
        if (claimLockUntil > Date.now()) showSyncLockBanner();
        initP2P(); rafId = requestAnimationFrame(loop);
      }

      // ─── SETUP UI INIT ────────────────────────────────────────────────────────
      await bootstrap();

      if (destroyed) return;

      if (!isReturning) {
        const sfNameEl = document.getElementById('sf-name') as HTMLInputElement | null;
        if (sfNameEl) sfNameEl.value = myName;
        buildSwInto('sf-glowsw', myGlow, k => sfGlow = k);
        buildSwInto('sf-eyesw', myEye, k => sfEye = k);
        if (ldstatus) ldstatus.style.display = 'none';
        const sfPhraseSection = document.getElementById('sf-phrase-section'); if (sfPhraseSection) sfPhraseSection.style.display = 'block';
        const sfEnterEl = document.getElementById('sf-enter') as HTMLButtonElement | null; if (sfEnterEl) sfEnterEl.disabled = true;
        setup?.classList.add('show');
        const sfRndEl = document.getElementById('sf-rnd'); if (sfRndEl) sfRndEl.onclick = () => { if (sfNameEl) sfNameEl.value = rndName() };
        if (sfEnterEl) sfEnterEl.onclick = () => { const n = sfNameEl?.value.trim() || rndName(); localStorage.setItem('sd-phrase', myPhrase); fadeLoader(); enterGame(n, sfGlow, sfEye) };
        if (sfNameEl) sfNameEl.addEventListener('keydown', e => { e.stopPropagation(); if (e.key === 'Enter' && !(document.getElementById('sf-enter') as HTMLButtonElement | null)?.disabled) document.getElementById('sf-enter')?.click() });
      } else {
        if (ldstatus) ldstatus.textContent = `Welcome back, ${myName}`;
        setTimeout(() => { fadeLoader(); enterGame(myName, myGlow, myEye) }, 800);
      }

      // Store cleanup ref
      (window as Window & { __spectralRafId?: number }).__spectralRafId = 0;
      return () => {
        destroyed = true;
        cancelAnimationFrame(rafId);
        window.removeEventListener('keydown', onKeyDown);
        window.removeEventListener('keyup', onKeyUp);
        window.removeEventListener('blur', onBlur);
        window.removeEventListener('keydown', onGlobalKeyDown);
        window.removeEventListener('touchstart', onTouchStart);
        window.removeEventListener('touchmove', onTouchMove);
        window.removeEventListener('touchend', onTouchEnd);
        window.removeEventListener('resize', onResize);
        renderer.dispose();
        try { document.body.removeChild(renderer.domElement) } catch (_) { }
        try { document.body.removeChild(labelRen.domElement) } catch (_) { }
      };
    })();

    return () => { destroyed = true };
  }, []);

  return null;
}
