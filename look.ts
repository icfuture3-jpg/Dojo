// Character creator catalog: pure data shared by the server (validation) and HUD (drawing).

export const SKINS = ["#f8dcc0", "#f1c9a0", "#e8b98a", "#d9a066", "#c68642", "#a86b3c", "#8d5524", "#6b4226", "#4a2c17", "#f4d6c9", "#e6c8a8", "#b98a6a"];

export const HAIR_COLORS = [
  "#0b0b0d", "#1c1410", "#2e1c10", "#40281a", "#5a3a22", "#7a4f2c", "#9a6a3a", "#b98a4e", "#d6b46a", "#ecd592",
  "#f4efe0", "#c9c9d0", "#8d8f99", "#55575f", "#a5301f", "#d4561e", "#e8762a", "#f2a65a", "#e84a6f", "#f59ac0",
  "#8a2a9c", "#5b3ba8", "#2f4fc4", "#3a8ee0", "#4cc7e8", "#1f9e7a", "#3bc46a", "#9ad14a", "#d8e84a", "#ff3b3b",
  "#432a21", "#ad633f", "#e6b87c", "#fff3c4", "#e0d9ff", "#b1e6dc", "#67a7a4", "#19476b", "#92506e", "#b4c3cb", "#a8cf65", "#d686b6",
];

/** Stable, unique labels in the same order as saved color indices. */
export const HAIR_COLOR_NAMES = [
 'Ink black','Espresso','Dark chocolate','Walnut','Chestnut','Cinnamon','Caramel','Hazel','Wheat blond','Champagne blond',
 'Ivory','Pearl gray','Slate gray','Charcoal','Auburn','Burnt copper','Tangerine','Apricot','Raspberry','Candy pink',
 'Orchid','Royal purple','Cobalt','Azure','Ice cyan','Deep jade','Spring green','Chartreuse','Lemon lime','Scarlet',
 'Cocoa','Warm copper','Honey blond','Vanilla cream','Pale lavender','Seafoam','Dusty teal','Midnight blue','Mulberry','Frost silver','Pistachio','Mauve rose',
];

export const EYE_COLORS = [
  "#1a1a1a", "#3b2314", "#5a3a1c", "#7a5a2a", "#9a7a3a", "#2d6b3a", "#4aa35a", "#7fbf5a", "#2f5fb8", "#4a90d9",
  "#7ac0f0", "#6a7a8a", "#9aa5b0", "#7a3aa8", "#b03a8a", "#c0392b", "#e8a020", "#d8d030", "#20c0c0", "#e8e8f0",
];

export const OUTFIT_COLORS = [
  "#ecf0f1", "#bdc3c7", "#7f8c8d", "#34495e", "#1b2631", "#111111", "#c0392b", "#e74c3c", "#e67e22", "#f39c12",
  "#f1c40f", "#d4af37", "#a9c43a", "#27ae60", "#1e8449", "#16a085", "#48c9b0", "#2471a3", "#2e86c1", "#5dade2",
  "#1a3a8a", "#5b3ba8", "#6c3483", "#8e44ad", "#c0399a", "#e84a8a", "#f5a0c0", "#7b4a2a", "#a0673a", "#d8b98a",
  "#5a6b3a", "#8a1f3a",
];

export const OUTFIT_COLOR_NAMES = ['Pearl white','Silver','Ash gray','Storm blue','Ink navy','Midnight black','Crimson','Scarlet','Tangerine','Amber','Sunflower','Antique gold','Citron','Jade','Forest green','Deep teal','Sea glass','Classic blue','Ocean blue','Sky blue','Indigo','Royal purple','Plum','Orchid','Magenta','Rose','Blush','Walnut','Copper','Sand','Olive','Burgundy'];

export const HEAD_NAMES = ["Round", "Oval", "Wide", "Square", "Long", "Egg", "Chubby", "Small", "Boxy", "Soft diamond"];
export const HAIR_NAMES = [
  "Bald", "Buzz cut", "Short crop", "Spiky", "Mohawk", "Topknot", "Ponytail", "Long straight", "Bob", "Afro", "Twin buns", "Side swept",
  "Braids", "Pompadour", "Wild spikes", "Curly", "Samurai", "Pigtails", "Half shave", "Wild mane", "Widow's peak", "Dreadlocks", "Bangs", "Flame",
  "High fade", "Curtain fringe", "High puff", "Bubble ponytail", "Side braid", "Space knots", "Wavy bob", "Swept undercut",
];
export const EYE_NAMES = ["Round", "Fierce", "Wide", "Almond", "Sleepy", "Happy", "Sharp", "Big", "Tiny", "Cat", "Tired", "Soft"];
export const PATTERN_NAMES = [
  "Plain", "Stripes", "Checks", "Chevrons", "Dots", "Sash", "Flames", "Waves", "Stars", "Diamonds", "Kanji", "Two-tone", "Hoops", "Camo", "Dragon scales", "Lightning",
  "Sunburst", "Lotus petals", "Bamboo weave", "Cloud swirls", "Crane wings", "Mountain peaks", "Festival ribbons", "Jade lattice",
  "Cherry blossoms", "Koi fish", "Tiger stripes", "Phoenix feathers", "Ocean tide", "Crescent moons", "Hexagon armor", "Maple leaves", "Dragon crest",
];

export const BODY_NAMES = ["Male", "Female"];

export interface Look {
  body: number;
  head: number;
  hair: number;
  hairColor: number;
  eye: number;
  eyeColor: number;
  skin: number;
  pattern: number;
  /** Index into OUTFIT_COLORS, or -1 to use the equipped shop gi colour. */
  outfit: number;
}

export const DEFAULT_LOOK: Look = { body: 0, head: 0, hair: 1, hairColor: 1, eye: 0, eyeColor: 1, skin: 1, pattern: 0, outfit: -1 };

export const LOOK_COUNTS = {
  body: BODY_NAMES.length,
  head: HEAD_NAMES.length,
  hair: HAIR_NAMES.length,
  hairColor: HAIR_COLORS.length,
  eye: EYE_NAMES.length,
  eyeColor: EYE_COLORS.length,
  skin: SKINS.length,
  pattern: PATTERN_NAMES.length,
  outfit: OUTFIT_COLORS.length,
} as const;

/** Level needed for each outfit pattern; rarer patterns come later. */
export function patternMinLevel(i: number): number {
  return i >= 16 ? 1 : 1 + Math.floor(i / 2);
}

/** Total number of distinct outfits (pattern × colour). */
export const OUTFIT_COUNT = PATTERN_NAMES.length * OUTFIT_COLORS.length;

export function sanitizeLook(raw: Partial<Record<keyof Look, unknown>> | undefined, level: number, prev: Look): Look {
  const out: Look = { ...prev };
  if (!raw) return out;
  (Object.keys(LOOK_COUNTS) as (keyof Look)[]).forEach((k) => {
    const v = raw[k];
    if (typeof v !== "number" || !Number.isInteger(v)) return;
    const min = k === "outfit" ? -1 : 0;
    if (v < min || v >= LOOK_COUNTS[k]) return;
    if (k === "pattern" && level < patternMinLevel(v)) return;
    out[k] = v;
  });
  return out;
}

/** Each master's look. Beat a master to unlock their look in Create. */
export const MASTER_LOOKS: { name: string; look: Look }[] = [
  { name: "Brick Fist Bao", look: { body: 0, head: 3, hair: 1, hairColor: 0, eye: 1, eyeColor: 2, skin: 3, pattern: 1, outfit: 6 } },
  { name: "Mirage Mei", look: { body: 1, head: 1, hair: 7, hairColor: 20, eye: 9, eyeColor: 13, skin: 0, pattern: 7, outfit: 22 } },
  { name: "Master Ren", look: { body: 0, head: 4, hair: 5, hairColor: 12, eye: 6, eyeColor: 5, skin: 4, pattern: 3, outfit: 15 } },
  { name: "Grandmaster Oku", look: { body: 0, head: 9, hair: 20, hairColor: 10, eye: 4, eyeColor: 11, skin: 10, pattern: 9, outfit: 3 } },
];

/** A deterministic look for tower and daily rivals. */
export function seededLook(seed: number): Look {
  let s = (seed * 2654435761) >>> 0;
  const next = (n: number) => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return (s >>> 8) % n; };
  return {
    body: next(2), head: next(LOOK_COUNTS.head), hair: next(LOOK_COUNTS.hair), hairColor: next(LOOK_COUNTS.hairColor),
    eye: next(LOOK_COUNTS.eye), eyeColor: next(LOOK_COUNTS.eyeColor), skin: next(LOOK_COUNTS.skin), pattern: next(6), outfit: -1,
  };
}
