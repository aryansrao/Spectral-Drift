// BIP39-style wordlist — exactly 256 words (8 bits/word × 12 = 96 bits entropy)
export const WORDS: string[] = [
  "able", "acid", "aged", "also", "apex", "arch", "aria", "arid", "army", "ashy", "atom", "aunt", "axle", "baby", "back", "bail",
  "bane", "bark", "barn", "base", "bash", "beam", "bean", "bear", "beat", "belt", "bend", "bird", "bite", "blow", "blue", "bone",
  "book", "bore", "born", "burn", "cage", "calm", "cape", "card", "care", "cart", "cave", "cell", "chip", "cite", "city", "clam",
  "clay", "clip", "club", "coal", "coat", "coil", "cold", "cord", "core", "corn", "cove", "crew", "crop", "cube", "curl", "cyan",
  "damp", "dark", "dash", "data", "dawn", "dead", "deal", "deep", "deny", "dice", "dime", "dire", "disk", "dome", "door", "dose",
  "dove", "draw", "drip", "drop", "drum", "dusk", "dust", "each", "earn", "edge", "emit", "epic", "even", "evil", "exit", "face",
  "fact", "fall", "fame", "fang", "farm", "fast", "fate", "feed", "fell", "fern", "file", "fill", "find", "fire", "fish", "fist",
  "flag", "flat", "flaw", "flex", "flip", "flow", "foam", "fold", "font", "form", "fort", "four", "free", "fuel", "full", "fund",
  "fury", "fuse", "gale", "gaze", "gear", "gild", "glow", "glue", "gold", "gone", "good", "grit", "grow", "gulf", "gust", "hail",
  "half", "hall", "halt", "hand", "hard", "harm", "hash", "haul", "heal", "heap", "heat", "helm", "help", "herb", "hill", "hive",
  "hold", "hole", "home", "hook", "hope", "horn", "howl", "hull", "hunt", "iris", "iron", "isle", "jade", "jail", "jest", "jolt",
  "keen", "keep", "kern", "kill", "kind", "king", "know", "lack", "lake", "lamb", "lamp", "land", "lark", "lash", "last", "lava",
  "leaf", "lean", "leap", "lens", "lift", "lime", "list", "lock", "loft", "loop", "lore", "lost", "loud", "lure", "lurk", "mace",
  "main", "make", "malt", "mare", "mark", "mask", "mast", "maze", "meal", "meet", "melt", "menu", "mesh", "mild", "mill", "mind",
  "mine", "mint", "mist", "moat", "monk", "moon", "moor", "more", "moth", "move", "much", "nail", "near", "neck", "need", "nest",
  "next", "node", "noon", "norm", "numb", "oath", "obey", "once", "open", "pack", "pain", "pale", "palm", "path", "peak", "peel",
];

// Sanity check (runs at module load time in dev)
if (WORDS.length !== 256) {
  console.error(`Wordlist length is ${WORDS.length}, expected 256`);
}
