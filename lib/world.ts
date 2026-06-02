// ─── TYPES ───────────────────────────────────────────────────────────────────
export interface OrbDef {
  id: number;
  type: 'common' | 'uncommon' | 'rare';
  x: number;
  y: number;
  claimed: boolean;
  mesh: unknown; // THREE.Mesh | null — typed as unknown to avoid Three.js import here
}

export interface AdDef {
  id: number;
  title: string;
  desc: string;
  url: string;
  color: string;
  x: number;
  y: number;
  mesh: unknown;
  labelDiv: unknown;
  boardEl: unknown;
  lastVisit: number;
  _labelObj?: unknown;
}

// ─── SEEDED RNG ──────────────────────────────────────────────────────────────
export function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ─── ORB GENERATION ──────────────────────────────────────────────────────────
const ORB_TYPES: Array<'common' | 'uncommon' | 'rare'> = ['common', 'uncommon', 'rare'];
const ORB_SUPPLY = { common: 400, uncommon: 80, rare: 20 };
const ORB_SPREAD = 160;

export function genOrbDefs(rng: () => number): OrbDef[] {
  const defs: OrbDef[] = [];
  let id = 0;
  for (const type of ORB_TYPES) {
    for (let i = 0; i < ORB_SUPPLY[type]; i++) {
      defs.push({
        id: id++,
        type,
        x: (rng() * 2 - 1) * ORB_SPREAD,
        y: (rng() * 2 - 1) * ORB_SPREAD,
        claimed: false,
        mesh: null,
      });
    }
  }
  return defs;
}

// ─── AD GENERATION ───────────────────────────────────────────────────────────
export interface AdConfig {
  title: string;
  desc: string;
  url: string;
  color: string;
}

const AD_ORB_OFFSET = 4;

export function genAdDefs(adConfigs: AdConfig[], orbDefs: OrbDef[]): AdDef[] {
  const adRng = mulberry32(0xDEADBEEF);
  const step = Math.floor(orbDefs.length / adConfigs.length);

  return adConfigs.map((cfg, i) => {
    const anchor = orbDefs[AD_ORB_OFFSET + i * step];
    if (!anchor) return null;
    const angle = adRng() * Math.PI * 2;
    const radius = 3 + adRng() * 4;
    return {
      id: i,
      title: cfg.title,
      desc: cfg.desc,
      url: cfg.url,
      color: cfg.color,
      x: anchor.x + Math.cos(angle) * radius,
      y: anchor.y + Math.sin(angle) * radius,
      mesh: null,
      labelDiv: null,
      boardEl: null,
      lastVisit: 0,
    } as AdDef;
  }).filter(Boolean) as AdDef[];
}
