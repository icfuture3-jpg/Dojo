import { academyStateSchema, playableAcademyIds } from "./academy-state";
import { challengeStateSchema } from "./challenge-state";
import { RESCUES } from "./rescue";
import { z } from "zod";
import { DEFAULT_LOOK, sanitizeLook, type Look } from "./look";

// ---------- catalog ----------
export type Slot = "gi" | "band" | "aura" | "skin" | "finisher";
export type Rarity = "common" | "rare" | "epic" | "legendary";
export interface Item {
  id: string;
  name: string;
  slot: Slot;
  pattern?: number;
  /** Colour used to draw the item. */
  color: string;
  coins: number;
  gems: number;
  minLevel: number;
  /** Rank index needed to buy or win it. */
  minRank: number;
  rarity: Rarity;
}

const RANK_GATE: Record<string, number> = {
  "gi-midnight": 1, "gi-sunset": 1, "gi-royal": 3, "gi-dragon": 4,
  "band-black": 1, "band-gold": 3,
  "aura-storm": 1, "aura-sakura": 2, "aura-void": 4,
  "skin-ninja": 2, "skin-panda": 1, "skin-oni": 4,
};

function item(
  slot: Slot,
  id: string,
  name: string,
  color: string,
  coins: number,
  minLevel = 1,
  gems = 0,
): Item {
  const worth = coins + gems * 30;
  const rarity: Rarity =
    worth >= 700 ? "legendary" : worth >= 400 ? "epic" : worth >= 200 ? "rare" : "common";
  const minRank = RANK_GATE[id] ?? 0;
  return { id, name, slot, color, coins, gems, minLevel, minRank, rarity };
}

export const FINISHER_NAMES = ["Respectful Bow", "Dragon Spin", "Thunder Stomp", "Phoenix Leap", "Shadow Dash", "Lotus Pose", "Cyclone Kick", "Meteor Punch", "Crane Balance", "Victory Salute", "Jade Wave", "Starburst"] as const;
const GI_COLOR_NAMES = [
 'Crimson','Ocean','Jade','Violet','Amber','Teal','Rose','Steel','Sunlit','Bamboo',
 'Ruby','Lagoon','Emerald','Amethyst','Marigold','Turquoise','Peony','Storm','Honey','Sage',
 'Wine','Harbor','Fern','Plum','Ochre','Juniper','Berry','Graphite','Olive gold','Moss',
 'Coral','Sky','Mint','Lilac','Apricot','Seafoam','Blush','Frost','Champagne','Meadow',
 'Burgundy','Midnight ocean','Pine','Aubergine','Bronze','Deep lagoon','Mulberry','Slate','Antique gold','Cedar',
];
const GI_COLORS = [
 '#c62838','#187ba0','#338b63','#7743a6','#c88619','#168c91','#c85b83','#607884','#c3a039','#4e7849',
 '#d33b48','#2690b1','#409c70','#8b55b4','#dd9b2c','#289fa0','#df7199','#758c99','#d6b24b','#638c55',
 '#ac283a','#17627f','#267854','#65348b','#ad6e14','#127778','#b04972','#4e6372','#a58b2c','#3e663e',
 '#e55764','#41a1c5','#5cb285','#9e71c5','#ecac48','#43b5af','#ed92b4','#93a4b1','#e4c66c','#7ca16d',
 '#8e2234','#12516b','#1e6547','#542970','#8f5c10','#0d6466','#95395e','#3f5360','#907322','#315b34',
];
const PALETTE = ["#e74c3c","#2980b9","#27ae60","#8e44ad","#f39c12","#16a085","#d2527f","#566573","#c4a64d","#356156"];
export const NEW_COSMETICS: Item[] = [
  ...Array.from({length:50}, (_, i) => ({...item("gi", `gi-new-${i}`, `${GI_COLOR_NAMES[i]} ${["Stripe","Wave","Flame","Star","Dragon"][Math.floor(i/10)]} Gi`, GI_COLORS[i]!, 100 + i*12), pattern: [1,7,6,8,32][Math.floor(i/10)]!})),
  ...Array.from({length:15}, (_, i) => item("band", `band-new-${i}`, `${["Ruby","Sapphire","Emerald","Amethyst","Amber","Turquoise","Rose","Steel","Sunrise","Forest","Pearl","Copper","Indigo","Coral","Moonlight"][i]} Headband`, [...PALETTE,"#f2eddf","#b87333","#3538a0","#ff7f6e","#b9cfea"][i]!, 50+i*15)),
  ...Array.from({length:20}, (_, i) => item("aura", `aura-new-${i}`, `${["Inferno","Ocean Mist","Jade Spirit","Violet Nebula","Solar Flare","Tidal Flow","Rose Petals","Steel Storm","Golden Dawn","Bamboo Wind","Ruby Nova","Sapphire Pulse","Emerald Ring","Amethyst Cloud","Amber Spark","Teal Comet","Cherry Bloom","Silver Moon","Sun Halo","Forest Spirit"][i]} Aura`, ["#f05432","#4cbbdb","#6bdd93","#b285ed","#ffd24d","#36d0bb","#f599c3","#9daec5","#f5b85a","#83bd63","#d63062","#387bf2","#1dba7a","#8648be","#dd8b32","#29a2ac","#f4b0b4","#d3d9ef","#fce789","#468c62"][i]!, 150+i*20)),
  ...FINISHER_NAMES.map((name,i) => item("finisher", `finisher-${i}`, name, PALETTE[i%10]!, 100+i*50)),
];

export const ITEMS: readonly Item[] = [
  ...NEW_COSMETICS,
  item("gi", "gi-blue", "Classic Blue Gi", "#2471a3", 0),
  item("gi", "gi-crimson", "Crimson Gi", "#c0392b", 120),
  item("gi", "gi-forest", "Forest Gi", "#27ae60", 120),
  item("gi", "gi-midnight", "Midnight Gi", "#1b2631", 300, 3),
  item("gi", "gi-sunset", "Sunset Gi", "#e67e22", 300, 4),
  item("gi", "gi-royal", "Royal Gi", "#6c3483", 600, 6),
  {...item("gi", "gi-dragon", "Golden Dragon Gi", "#d4af37", 0, 8, 25),pattern:32},
  item("band", "band-white", "White Headband", "#ecf0f1", 0),
  item("band", "band-red", "Red Headband", "#e74c3c", 60),
  item("band", "band-yellow", "Yellow Headband", "#f1c40f", 60),
  item("band", "band-green", "Green Headband", "#2ecc71", 90),
  item("band", "band-black", "Black Headband", "#111111", 200, 3),
  item("band", "band-sky", "Sky Headband", "#5dade2", 150, 2),
  item("band", "band-gold", "Champion Headband", "#ffd54a", 0, 5, 10),
  item("aura", "aura-none", "No Aura", "#0000", 0),
  item("aura", "aura-ember", "Ember Aura", "#e67e22", 250, 2),
  item("aura", "aura-jade", "Jade Aura", "#2ecc71", 250, 3),
  item("aura", "aura-storm", "Storm Aura", "#5dade2", 400, 4),
  item("aura", "aura-sakura", "Sakura Aura", "#f5b7b1", 400, 5),
  item("aura", "aura-void", "Void Aura", "#a569bd", 0, 7, 15),
  item("skin", "skin-classic", "Classic Fighter", "#f1c9a0", 0),
  item("skin", "skin-ninja", "Shadow Ninja", "#17202a", 500, 5),
  item("skin", "skin-oni", "Oni Warrior", "#c0392b", 0, 7, 20),
  item("skin", "skin-panda", "Panda Master", "#ffffff", 450, 4),
];
export const DEFAULT_EQUIP: Record<Slot, string> = {
  gi: "gi-blue",
  band: "band-white",
  aura: "aura-none",
  skin: "skin-classic",
  finisher: "",
};
export function findItem(id: string): Item | undefined {
  return ITEMS.find((i) => i.id === id);
}
const FREE_IDS = ITEMS.filter((i) => i.coins === 0 && i.gems === 0).map((i) => i.id);

export interface Upgrade {
  id: "coin" | "xp" | "eye";
  name: string;
  blurb: string;
  costs: readonly number[];
}
export const UPGRADES: readonly Upgrade[] = [
  { id: "coin", name: "Coin Purse", blurb: "+10% coins per level", costs: [150, 300, 500] },
  { id: "xp", name: "Scholar's Scroll", blurb: "+10% XP per level", costs: [150, 300, 500] },
];

export const BOX_COST = 120;
export const BOX_GEM_COST = 8;
const BOX_WEIGHTS: Record<Rarity, number> = { common: 60, rare: 28, epic: 10, legendary: 2 };

// ---------- ranks and levels ----------
export const RANKS = [
  { name: "Bronze", at: 0, color: "#cd7f32" },
  { name: "Silver", at: 200, color: "#c0c7cc" },
  { name: "Gold", at: 500, color: "#f1c40f" },
  { name: "Platinum", at: 900, color: "#7fe3d6" },
  { name: "Diamond", at: 1500, color: "#7fc8ff" },
  { name: "Grand Master", at: 2400, color: "#ff7ad9" },
] as const;
export function rankIndex(rp: number): number {
  let idx = 0;
  RANKS.forEach((r, i) => {
    if (rp >= r.at) idx = i;
  });
  return idx;
}
export function xpToNext(level: number): number {
  return Math.round((80 + 40 * level) * (level < 10 ? .8 : 1));
}
export function levelInfo(xp: number): { level: number; into: number; need: number } {
  let level = 1;
  let left = xp;
  while (left >= xpToNext(level)) {
    left -= xpToNext(level);
    level += 1;
  }
  return { level, into: left, need: xpToNext(level) };
}

// ---------- missions and trophies ----------
type Metric = "played" | "won" | "rounds" | "flawless" | "champs" | "comeback";
export interface Reward {
  coins: number;
  gems: number;
  xp: number;
}
export interface Mission {
  id: string;
  kind: "daily" | "weekly" | "special";
  name: string;
  metric: Metric;
  target: number;
  reward: Reward;
}
const m = (
  id: string,
  kind: Mission["kind"],
  name: string,
  metric: Metric,
  target: number,
  coins: number,
  xp: number,
  gems = 0,
): Mission => ({ id, kind, name, metric, target, reward: { coins, gems, xp } });

export const DAILY_POOL: readonly Mission[] = [
  m("d-win2", "daily", "Win 2 matches", "won", 2, 60, 40),
  m("d-play3", "daily", "Play 3 matches", "played", 3, 40, 30),
  m("d-rounds6", "daily", "Win 6 rounds", "rounds", 6, 50, 30),
  m("d-flaw1", "daily", "Win a match without losing a round", "flawless", 1, 80, 50),
  m("d-win1", "daily", "Win a match", "won", 1, 30, 20),
  m("d-rounds10", "daily", "Win 10 rounds", "rounds", 10, 70, 45),
];
export const WEEKLY_POOL: readonly Mission[] = [
  m("w-win10", "weekly", "Win 10 matches", "won", 10, 250, 150, 3),
  m("w-rounds30", "weekly", "Win 30 rounds", "rounds", 30, 220, 120, 2),
  m("w-champ", "weekly", "Clear the whole ladder", "champs", 1, 300, 200, 5),
];
export const SPECIAL: readonly Mission[] = [
  m("s-flawless3", "special", "Win 3 flawless matches", "flawless", 3, 200, 120, 3),
  m("s-comeback", "special", "Win a match after trailing 0–2", "comeback", 1, 150, 100, 2),
  m("s-win8", "special", "Win 8 matches in total", "won", 8, 250, 150, 4),
  m("s-rounds40", "special", "Win 40 rounds in total", "rounds", 40, 300, 180, 5),
  m("s-flawless6", "special", "Win 6 flawless matches", "flawless", 6, 400, 250, 8),
  m("s-comeback3", "special", "Win 3 matches after trailing 0–2", "comeback", 3, 350, 220, 8),
  m("s-champs3", "special", "Become champion 3 times", "champs", 3, 400, 300, 8),
];

export interface Trophy {
  id: string;
  name: string;
  blurb: string;
  reward: Reward;
  test(p: Profile): boolean;
}
const t = (
  id: string,
  name: string,
  blurb: string,
  coins: number,
  gems: number,
  test: (p: Profile) => boolean,
): Trophy => ({ id, name, blurb, reward: { coins, gems, xp: 0 }, test });

export const TROPHIES: readonly Trophy[] = [
  t("first-win", "First Blood", "Win your first match", 30, 0, (p) => p.stats.won >= 1),
  t("win-10", "Triple Victory", "Win 3 matches", 120, 2, (p) => p.stats.won >= 3),
  t("win-25", "Dojo Veteran", "Win 8 matches", 300, 5, (p) => p.stats.won >= 8),
  t("rounds-50", "Hand Like Thunder", "Win 15 rounds", 150, 2, (p) => p.stats.rounds >= 15),
  t("flawless", "Untouchable", "Win a flawless match or win 3 matches", 100, 1, (p) => p.stats.flawless >= 1 || p.stats.won >= 3),
  t("comeback", "Never Give Up", "Win a comeback or complete 5 matches", 100, 1, (p) => p.stats.comeback >= 1 || p.stats.played >= 5),
  t("boss", "Boss Slayer", "Defeat Grandmaster Oku", 250, 4, (p) => p.stats.champs >= 1),
  t("perfect", "Perfect Path", "Become tournament champion", 400, 8, (p) => p.stats.champs >= 1),
  t("silver", "Silver Belt", "Reach Silver rank", 80, 1, (p) => rankIndex(p.rp) >= 1),
  t("plat", "Platinum Palm", "Reach Gold rank", 250, 5, (p) => rankIndex(p.rp) >= 2),
  t("grand", "Grand Master", "Reach Platinum rank", 1000, 25, (p) => rankIndex(p.rp) >= 3),
  t("win-50", "Dojo Legend", "Win 15 matches", 600, 12, (p) => p.stats.won >= 15),
  t("flawless-5", "Ghost Hands", "Win 2 flawless matches or 8 matches", 300, 6, (p) => p.stats.flawless >= 2 || p.stats.won >= 8),
  t("champ-5", "Returning Champion", "Become champion 2 times", 700, 15, (p) => p.stats.champs >= 2),
  t("box-10", "Lucky Hands", "Open 3 mystery boxes", 200, 4, (p) => p.stats.boxes >= 3),
  t("level-5", "Rising Student", "Reach level 2", 100, 1, (p) => levelInfo(p.xp).level >= 2),
  t("level-10", "Sensei", "Reach level 5", 300, 5, (p) => levelInfo(p.xp).level >= 5),
  t("gold", "Gold Belt", "Reach Gold rank", 150, 3, (p) => rankIndex(p.rp) >= 2),
  t("diamond", "Diamond Fist", "Reach Platinum rank", 500, 10, (p) => rankIndex(p.rp) >= 3),
  t("collector", "Wardrobe", "Own 6 items", 150, 2, (p) => p.owned.length >= 6),
  t("box", "Mystery Seeker", "Open a mystery box", 50, 1, (p) => p.stats.boxes >= 1),
  t("streak-3", "Regular", "Log in 2 days in a row", 80, 1, (p) => p.streak >= 2),
  t("streak-7", "Devoted", "Log in 4 days in a row", 250, 5, (p) => p.streak >= 4),
  t("pot-triad", "Three Arts of the Tree", "Score 5 hits in each Tree Pot mode: throw, kick and chop", 120, 2, p => Object.values(p.potBest).every(score => score === 5)),
  t("lightning-perfect", "Precision Spark", "Complete Lightning Hands with 100% accuracy", 100, 2, p => (p.academy.clears.lightning ?? 0) > 0 && p.academy.records.lightningAccuracy === 100),
  t("memory-clear", "Mind Palace", "Complete Three-Hand Memory through its six-hand sequence", 90, 2, p => (p.academy.clears.memory ?? 0) > 0),
  t("shadow-variety", "Uncopied Shadow", "Defeat Shadow Master without repeating a hand in that run", 110, 2, p => p.academy.run?.game === 'shadow' && p.academy.run.paid && p.academy.run.noRepeat),
  t("academy-versatile", "Eight Disciplines", "Complete each of the eight playable Training Hall mini-games", 200, 4, p => playableAcademyIds.every(id => (p.academy.clears[id] ?? 0) > 0)),
  t("upgrade-toolkit", "Balanced Toolkit", "Buy at least one Coin Purse and one Scholar’s Scroll upgrade", 80, 1, p => p.up.coin > 0 && p.up.xp > 0),
  t("equipped-finish", "Finishing Touch", "Equip a finisher together with a non-starter gi, headband and aura", 80, 1, p => ['gi','band','aura','finisher'].every(slot => {const id=p.equip[slot as Slot];return p.owned.includes(id) && ITEMS.some(item => item.id === id && item.slot === slot && !FREE_IDS.includes(id));})),
  t("rescue-lantern", "A Light Restored", "Rescue your first dojo in Rescue Dojos", 100, 2, p => p.stats.rescued >= 1),
];

// ---------- profile ----------
const statsSchema = z.object({
  played: z.number().default(0),
  won: z.number().default(0),
  rounds: z.number().default(0),
  flawless: z.number().default(0),
  champs: z.number().default(0),
  perfect: z.number().default(0),
  comeback: z.number().default(0),
  boxes: z.number().default(0),
  tower: z.number().default(0),
  rescued: z.number().default(0),
});
export const profileSchema = z.object({
  saveVersion: z.literal(4).default(4),
  challenges: challengeStateSchema,
  academy: academyStateSchema,
  matchStreak: z.number().int().nonnegative().default(0),
  bestMatchStreak: z.number().int().nonnegative().default(0),
  expansionAchievements: z.array(z.string()).default(() => []),
  audio: z.object({ music: z.number().min(0).max(1).default(1), sfx: z.number().min(0).max(1).default(1) }).default(() => ({ music: 1, sfx: 1 })),
  /** Completion identities remain saved so replays cannot repay old matches. */
  completedResults: z.array(z.string()).default(() => []),
  potBest: z.object({throw:z.number().int().min(0).max(5).default(0),jump:z.number().int().min(0).max(5).default(0),chop:z.number().int().min(0).max(5).default(0)}).default(()=>({throw:0,jump:0,chop:0})),
  freeBoxes: z.number().int().nonnegative().default(0),
  lossTrainingPending: z.number().int().nonnegative().default(0),
  name: z.string().default(""),
  coins: z.number().int().nonnegative().default(100),
  gems: z.number().int().nonnegative().default(5),
  xp: z.number().int().nonnegative().default(0),
  rp: z.number().int().nonnegative().default(0),
  owned: z.array(z.string()).default(() => [...FREE_IDS]),
  equip: z
    .object({
      gi: z.string().default(DEFAULT_EQUIP.gi),
      band: z.string().default(DEFAULT_EQUIP.band),
      aura: z.string().default(DEFAULT_EQUIP.aura),
      skin: z.string().default(DEFAULT_EQUIP.skin),
      finisher: z.string().default(""),
    })
    .default(() => ({ ...DEFAULT_EQUIP })),
  look: z
    .object({
      body: z.number().default(DEFAULT_LOOK.body),
      head: z.number().default(DEFAULT_LOOK.head),
      hair: z.number().default(DEFAULT_LOOK.hair),
      hairColor: z.number().default(DEFAULT_LOOK.hairColor),
      eye: z.number().default(DEFAULT_LOOK.eye),
      eyeColor: z.number().default(DEFAULT_LOOK.eyeColor),
      skin: z.number().default(DEFAULT_LOOK.skin),
      pattern: z.number().default(DEFAULT_LOOK.pattern),
      outfit: z.number().default(DEFAULT_LOOK.outfit),
    })
    .default(() => ({ ...DEFAULT_LOOK })),
  up: z
    .object({
      coin: z.number().default(0),
      xp: z.number().int().nonnegative().default(0),
      eye: z.number().default(0),
    })
    .default(() => ({ coin: 0, xp: 0, eye: 0 })),
  training: z.object({
    matches: z.number().int().nonnegative().default(0),
    completed: z.number().int().nonnegative().default(0),
    strength: z.number().int().nonnegative().default(0),
  }).default(() => ({ matches: 0, completed: 0, strength: 0 })),
  beaten: z.array(z.number()).default(() => []),
  dailyDone: z.string().default(""),
  dailyStreak: z.number().default(0),
  trophies: z.array(z.string()).default(() => []),
  stats: statsSchema.default(() => statsSchema.parse({})),
  streak: z.number().default(0),
  lastLogin: z.string().default(""),
  season: z.string().default(""),
  dayKey: z.string().default(""),
  weekKey: z.string().default(""),
  /** Progress per mission id. */
  prog: z.record(z.string(), z.number()).default(() => ({})),
  /** Mission ids already paid out. */
  done: z.array(z.string()).default(() => []),
  /** The latest reward notice for the HUD: bump n, list what happened. */
  last: z
    .object({
      n: z.number().default(0),
      title: z.string().default(""),
      lines: z.array(z.string()).default(() => []),
      box: z.string().default(""),
    })
    .default(() => ({ n: 0, title: "", lines: [], box: "" })),
});
export type Profile = z.infer<typeof profileSchema>;

export function parseProfile(raw: unknown): Profile {
  // Repair the invalid leaf, not its valid siblings. Work on a copy of the save.
  let data: Record<string, unknown>;
  try { data = raw && typeof raw === "object" && !Array.isArray(raw) ? JSON.parse(JSON.stringify(raw)) : {}; }
  catch { data = {}; }
  if (data.saveVersion !== 4 && typeof data.xp === 'number' && Number.isFinite(data.xp) && data.xp >= 2520) data.xp -= 504;
  // Preserve attained level/progress beyond level 10 while the first nine costs are 20% lower.
  for (let i = 0; i < 200; i++) {
    const result = profileSchema.safeParse(data);
    if (result.success) return result.data;
    for (const issue of [...result.error.issues].reverse()) {
      if (!issue.path.length) return profileSchema.parse({});
      let parent: unknown = data;
      for (const key of issue.path.slice(0, -1)) parent = parent && typeof parent === "object" ? Reflect.get(parent, key) : undefined;
      const key = issue.path[issue.path.length - 1]!;
      if (Array.isArray(parent) && typeof key === "number") parent.splice(key, 1);
      else if (parent && typeof parent === "object") Reflect.deleteProperty(parent, key);
    }
  }
  return profileSchema.parse({});
}

function clone(p: Profile): Profile {
  return JSON.parse(JSON.stringify(p)) as Profile;
}

// ---------- time keys ----------
const DAY_MS = 86_400_000;
export function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}
export function weekKey(now: number): string {
  return `w${Math.floor((Math.floor(now / DAY_MS) + 3) / 7)}`;
}
export function seasonKey(now: number): string {
  return new Date(now).toISOString().slice(0, 7);
}
function hash(s: string): number {
  let h = 7;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 100003;
  return h;
}
function pick<T>(pool: readonly T[], key: string, count: number): T[] {
  const start = hash(key);
  const out: T[] = [];
  for (let i = 0; out.length < count && i < pool.length * 2; i++) {
    const c = pool[(start + i * 2 + Math.floor(i / pool.length)) % pool.length] as T;
    if (!out.includes(c)) out.push(c);
  }
  return out;
}
export function dailyMissions(key: string): Mission[] {
  return pick(DAILY_POOL, key, 3);
}
export function weeklyMissions(key: string): Mission[] {
  return pick(WEEKLY_POOL, key, 2);
}
export function activeMissions(p: Profile): Mission[] {
  return [...dailyMissions(p.dayKey), ...weeklyMissions(p.weekKey), ...SPECIAL];
}

// ---------- reward plumbing ----------
function notice(p: Profile, title: string, lines: string[], box = ""): void {
  p.last = { n: p.last.n + 1, title, lines, box };
}

/** Adds a reward, handling level-ups. Appends readable lines. */
function grant(p: Profile, r: Reward, lines: string[], scale = true): void {
  const coins = scale ? Math.round(r.coins * (1 + 0.1 * p.up.coin)) : r.coins;
  const xp = scale ? Math.round(r.xp * (1 + 0.1 * p.up.xp)) : r.xp;
  const before = levelInfo(p.xp).level;
  p.coins += coins;
  p.gems += r.gems;
  p.xp += xp;
  const parts = [
    coins > 0 ? `+${coins} coins` : "",
    r.gems > 0 ? `+${r.gems} gems` : "",
    xp > 0 ? `+${xp} XP` : "",
  ].filter(Boolean);
  if (parts.length > 0) lines.push(parts.join("  "));
  const after = levelInfo(p.xp).level;
  for (let l = before + 1; l <= after; l++) {
    const bonus: Reward = { coins: 25 * l, gems: l % 5 === 0 ? 3 : 0, xp: 0 };
    p.coins += bonus.coins;
    p.gems += bonus.gems;
    lines.push(
      `LEVEL UP! Level ${l}  +${bonus.coins} coins${bonus.gems ? `  +${bonus.gems} gems` : ""}`,
    );
    const unlocked = ITEMS.filter((i) => i.minLevel === l).map((i) => i.name);
    if (unlocked.length > 0) lines.push(`Unlocked in shop: ${unlocked.join(", ")}`);
  }
}

function checkTrophies(p: Profile, lines: string[]): void {
  let again = true;
  while (again) {
    again = false;
    for (const tr of TROPHIES) {
      if (!p.trophies.includes(tr.id) && tr.test(p)) {
        p.trophies.push(tr.id);
        lines.push(`TROPHY: ${tr.name}`);
        grant(p, tr.reward, lines, false);
        again = true;
      }
    }
  }
}

/** Check after a successful state change; never pay the same trophy twice. */
export function collectTrophies(input: Profile): Profile {
  if (!TROPHIES.some(tr => !input.trophies.includes(tr.id) && tr.test(input))) return input;
  const p = clone(input), lines: string[] = [];
  checkTrophies(p, lines);
  notice(p, 'Trophy earned', lines);
  return p;
}

function checkMissions(p: Profile, lines: string[]): void {
  for (const ms of activeMissions(p)) {
    const key = ms.kind === "daily" ? `${p.dayKey}:${ms.id}` : ms.kind === "weekly" ? `${p.weekKey}:${ms.id}` : ms.id;
    if (!p.done.includes(key) && (p.prog[key] ?? 0) >= ms.target) {
      p.done.push(key);
      lines.push(`MISSION COMPLETE: ${ms.name}`);
      grant(p, ms.reward, lines);
    }
  }
}
export function missionKey(p: Profile, ms: Mission): string {
  return ms.kind === "daily" ? `${p.dayKey}:${ms.id}` : ms.kind === "weekly" ? `${p.weekKey}:${ms.id}` : ms.id;
}

// ---------- actions ----------
/** Roll over the day, week and season, and pay the daily login bonus. */
export function applyLogin(input: Profile, now: number): Profile {
  const p = clone(input);
  const lines: string[] = [];
  const today = dayKey(now);
  const season = seasonKey(now);
  if (p.season !== "" && p.season !== season) {
    const idx = rankIndex(p.rp);
    lines.push(`SEASON ENDED. You finished ${RANKS[idx]?.name}.`);
    grant(p, { coins: 100 * idx, gems: 4 * idx, xp: 0 }, lines, false);
    p.rp = Math.floor(p.rp / 2);
  }
  p.season = season;
  p.weekKey = weekKey(now);
  p.dayKey = today;
  p.done = p.done.filter((k) => k.startsWith(p.dayKey) || k.startsWith(p.weekKey) || !/^(\d{4}-|w\d)/.test(k));
  for (const k of Object.keys(p.prog)) {
    if (/^(\d{4}-|w\d)/.test(k) && !k.startsWith(p.dayKey) && !k.startsWith(p.weekKey)) delete p.prog[k];
  }
  if (p.lastLogin !== today) {
    const yesterday = dayKey(now - DAY_MS);
    p.streak = p.lastLogin === yesterday ? p.streak + 1 : 1;
    p.lastLogin = today;
    const day = Math.min(p.streak, 7);
    lines.unshift(`Daily login — day ${p.streak} streak`);
    grant(p, { coins: 20 + 15 * day, gems: p.streak % 7 === 0 ? 3 : 0, xp: 15 }, lines, false);
    checkTrophies(p, lines);
    notice(p, "Welcome back!", lines);
  } else {
    checkTrophies(p, lines);
    if (lines.length > 0) notice(p, "Progress rewards", lines);
  }
  return p;
}

export interface MatchResult {
  /** Index of the rival fought (0-3). */
  rival: number;
  won: boolean;
  roundsWon: number;
  roundsLost: number;
  comeback: boolean;
  /** Won the final match having never lost a match this run. */
  perfectRun: boolean;
}

export const matchResultSchema = z.object({
  rival: z.number().int().min(0).max(3), won: z.boolean(),
  roundsWon: z.number().int().min(0).max(3), roundsLost: z.number().int().min(0).max(3),
  comeback: z.boolean(), perfectRun: z.boolean(),
}).refine(r => r.won ? r.roundsWon === 3 && r.roundsLost < 3 : r.roundsLost === 3 && r.roundsWon < 3);

export function applyMatch(input: Profile, r: MatchResult, now: number): Profile {
  if (!matchResultSchema.safeParse(r).success || !Number.isFinite(now)) return input;
  let p = clone(input);
  if (p.dayKey !== dayKey(now)) p = applyLogin(p, now);
  const lines: string[] = [];
  const rounds = Math.max(0, Math.min(3, Math.floor(r.roundsWon)));
  const lost = r.roundsLost;
  const rival = Math.max(0, Math.min(3, Math.floor(r.rival)));
  const won = r.won && rounds === 3;
  const flawless = won && lost === 0;
  const champ = won && rival === 3;
  const comeback = won && r.comeback && lost >= 2;
  const perfect = champ && r.perfectRun;

  if (won && !p.beaten.includes(rival)) p.beaten.push(rival);
  p.stats.played += 1;
  p.stats.rounds += rounds;
  if (won) p.stats.won += 1;
  if (flawless) p.stats.flawless += 1;
  if (champ) p.stats.champs += 1;
  if (comeback) p.stats.comeback += 1;
  if (perfect) p.stats.perfect += 1;

  const bump = (metric: Metric, by: number) => {
    if (by <= 0) return;
    for (const ms of activeMissions(p)) {
      if (ms.metric === metric && !p.done.includes(missionKey(p, ms))) {
        const key = missionKey(p, ms);
        p.prog[key] = (p.prog[key] ?? 0) + by;
      }
    }
  };
  bump("played", 1);
  bump("won", won ? 1 : 0);
  bump("rounds", rounds);
  bump("flawless", flawless ? 1 : 0);
  bump("champs", champ ? 1 : 0);
  bump("comeback", comeback ? 1 : 0);

  const base: Reward = won
    ? { coins: 35 + 20 * rival + (flawless ? 25 : 0) + (champ ? 100 : 0), gems: champ ? 5 : 0, xp: 40 + 15 * rival + 10 * rounds }
    : { coins: 4 * rounds, gems: 0, xp: 10 * rounds + 5 };
  grant(p, base, lines);
  const before = rankIndex(p.rp);
  p.rp = Math.max(0, p.rp + (won ? 12 + 4 * rival : -10));
  const after = rankIndex(p.rp);
  lines.push(`${won ? "+" : ""}${won ? 12 + 4 * rival : -10} rank points (${RANKS[after]?.name})`);
  if (after > before) lines.push(`RANK UP: ${RANKS[after]?.name}!`);
  checkMissions(p, lines);
  checkTrophies(p, lines);
  notice(p, won ? "Victory rewards" : "Match rewards", lines);
  return p;
}

export interface ModeResult {
  mode: "tower" | "daily" | "spectate" | "rescue";
  floor: number;
  won: boolean;
  correct?: boolean;
}

export const modeResultSchema = z.object({
  mode: z.enum(["tower", "daily", "spectate", "rescue"]),
  floor: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER), won: z.boolean(), correct: z.boolean().optional(),
});

export function applyMode(input: Profile, r: ModeResult, now: number): Profile | null {
  if (!modeResultSchema.safeParse(r).success || !Number.isFinite(now)) return null;
  const p = clone(input);
  if (p.dayKey !== dayKey(now)) return applyMode(applyLogin(p, now), r, now);
  const lines: string[] = [];
  if (r.mode === "tower") {
    const f = Math.floor(r.floor);
    if (!(f >= 0) || f > p.stats.tower) return null;
    if (r.won) {
      const boss = (f + 1) % 10 === 0;
      grant(p, { coins: 20 + 6 * f + (boss ? 100 : 0), gems: boss ? 3 : 0, xp: 25 + 4 * f }, lines);
      if (f + 1 > p.stats.tower) p.stats.tower = f + 1;
      lines.push(boss ? `Floor ${f + 1} cleared: BOSS BONUS!` : `Floor ${f + 1} cleared`);
      notice(p, "Tower reward", lines);
    } else {
      grant(p, { coins: 2 * f, gems: 0, xp: 5 + f }, lines);
      lines.push(`The climb ends on floor ${f + 1}. Best: floor ${p.stats.tower}`);
      notice(p, "Tower run over", lines);
    }
    return p;
  }
  if (r.mode === "rescue") {
    const i = Math.floor(r.floor);
    const m = RESCUES[i];
    if (!m || i > p.stats.rescued) return null;
    if (r.won) {
      const first = i === p.stats.rescued;
      if (first) p.stats.rescued = i + 1;
      grant(p, { coins: first ? m.coins : Math.round(m.coins / 4), gems: first ? m.gems : 0, xp: first ? 50 + 10 * i : 15 }, lines);
      lines.push(`${m.dojo} is saved!`);
      notice(p, "Dojo rescued", lines);
    } else {
      grant(p, { coins: 5, gems: 0, xp: 5 }, lines);
      lines.push(`${m.dojo} still needs you.`);
      notice(p, "Dojo in danger", lines);
    }
    return p;
  }
  if (r.mode === "daily") {
    if (p.dailyDone === p.dayKey) return null;
    const prevDaily = p.dailyDone;
    p.dailyDone = p.dayKey;
    if (!r.won) {
      p.dailyStreak = 0;
      lines.push("Not today. The challenge comes back tomorrow.");
      notice(p, "Daily challenge", lines);
      return p;
    }
    p.dailyStreak = prevDaily === dayKey(now - DAY_MS) ? p.dailyStreak + 1 : 1;
    const streak = Math.min(7, p.dailyStreak);
    grant(p, { coins: 80 + 15 * streak, gems: 2, xp: 60 }, lines);
    lines.push(`Daily streak: ${p.dailyStreak}`);
    notice(p, "Daily challenge cleared", lines);
    return p;
  }
  if (r.correct) {
    grant(p, { coins: 25, gems: 0, xp: 10 }, lines);
    lines.push("You called it!");
    notice(p, "Sharp eye", lines);
  } else {
    grant(p, { coins: 3, gems: 0, xp: 3 }, lines);
    notice(p, "Good watching", lines);
  }
  return p;
}

export function canAfford(p: Profile, coins: number, gems: number): boolean {
  return p.coins >= coins && p.gems >= gems;
}

export function buyItem(input: Profile, id: string): Profile | null {
  const it = findItem(id);
  if (!it || input.owned.includes(id)) return null;
  if (levelInfo(input.xp).level < it.minLevel || rankIndex(input.rp) < it.minRank || !canAfford(input, it.coins, it.gems)) return null;
  const p = clone(input);
  p.coins -= it.coins;
  p.gems -= it.gems;
  p.owned.push(id);
  p.equip[it.slot] = id;
  if (it.slot === "gi") p.look.outfit = -1;
  const lines = [`Bought ${it.name}`];
  checkTrophies(p, lines);
  notice(p, "Purchase", lines);
  return p;
}

export function equipItem(input: Profile, id: string): Profile | null {
  const it = findItem(id);
  if (!it || !input.owned.includes(id)) return null;
  const p = clone(input);
  p.equip[it.slot] = id;
  if (it.slot === "gi") p.look.outfit = -1;
  return p;
}

export function setLook(input: Profile, raw: Partial<Look>): Profile | null {
  const p = clone(input);
  p.look = sanitizeLook(raw, levelInfo(p.xp).level, p.look);
  return p;
}

export function cleanName(raw: unknown): string {
  return String(raw ?? "").replace(/[^\p{L}\p{N} _.-]/gu, "").replace(/\s+/g, " ").trim().slice(0, 14);
}

export function setName(input: Profile, raw: string): Profile | null {
  const name = cleanName(raw);
  if (name.length < 2) return null;
  const p = clone(input);
  p.name = name;
  return p;
}

export function buyUpgrade(input: Profile, id: string): Profile | null {
  const up = UPGRADES.find((u) => u.id === id);
  if (!up) return null;
  const level = input.up[up.id];
  const cost = up.costs[level];
  if (cost === undefined || input.coins < cost) return null;
  const p = clone(input);
  p.coins -= cost;
  p.up[up.id] = level + 1;
  notice(p, "Upgrade", [`${up.name} is now level ${level + 1}`]);
  return p;
}

/** Actual rank-eligible per-item weighted odds; selection and rewards are unchanged. */
export function boxOdds(rp: number): Record<Rarity, number> {
  const totals: Record<Rarity, number> = { common: 0, rare: 0, epic: 0, legendary: 0 };
  for (const item of ITEMS.filter(i => !FREE_IDS.includes(i.id) && rankIndex(rp) >= i.minRank)) totals[item.rarity] += BOX_WEIGHTS[item.rarity];
  const total = Object.values(totals).reduce((a, b) => a + b, 0);
  return Object.fromEntries(Object.entries(totals).map(([rarity, weight]) => [rarity, total ? weight / total * 100 : 0])) as Record<Rarity, number>;
}

export function openBox(input: Profile, currency: "coins" | "gems" | "free", rnd: () => number): Profile | null {
  const cost = currency === "coins" ? BOX_COST : BOX_GEM_COST;
  if (!["coins", "gems", "free"].includes(currency)) return null;
  const random = rnd();
  if (!Number.isFinite(random) || random < 0 || random >= 1) return null;
  if (currency === "free" ? input.freeBoxes < 1 : (currency === "coins" ? input.coins : input.gems) < cost) return null;
  const p = clone(input);
  if (currency === "free") p.freeBoxes--;
  else p[currency] -= cost;
  p.stats.boxes += 1;
  const pool = ITEMS.filter((i) => !FREE_IDS.includes(i.id) && rankIndex(p.rp) >= i.minRank);
  const total = pool.reduce((s, i) => s + BOX_WEIGHTS[i.rarity], 0);
  let roll = random * total;
  let won = pool[0] as Item;
  for (const i of pool) {
    roll -= BOX_WEIGHTS[i.rarity];
    if (roll <= 0) {
      won = i;
      break;
    }
  }
  const lines: string[] = [];
  if (p.owned.includes(won.id)) {
    const refund = Math.round(BOX_COST / 2);
    p.coins += refund;
    lines.push(`Duplicate ${won.name}: +${refund} coins back`);
  } else {
    p.owned.push(won.id);
    lines.push(`You found ${won.name} (${won.rarity})!`);
  }
  checkTrophies(p, lines);
  notice(p, "Mystery box", lines, won.id);
  return p;
}
/** Paid Peeks scale with the current one-based opponent level/floor. */
export function peekCost(level: number): number {
  return 10 * (Math.max(0, Math.floor(Number.isFinite(level) ? level : 0)) + 1);
}
export function buyPeek(input: Profile, level: number): Profile | null {
  const cost = peekCost(level);
  if (input.coins < cost) return null;
  return { ...input, coins: input.coins - cost };
}

/** A session is owed for each three completed, non-spectator matches. */
export function trainingDue(p: Profile): boolean {
  return Math.floor(p.training.matches / 3) > p.training.completed;
}
export function completeTraining(input: Profile, hits: number): Profile | null {
  if (!trainingDue(input) || !Number.isInteger(hits) || hits < 0 || hits > 5) return null;
  const p = clone(input);
  const gain = 1 + Math.floor(hits / 2);
  p.training.completed++;
  p.training.strength += gain;
  p.xp += 20 + hits * 5;
  return p;
}

export function completeLossTraining(input: Profile, hits: number): Profile | null {
  if (input.lossTrainingPending < 1 || !Number.isInteger(hits) || hits < 0 || hits > 5) return null;
  const p = clone(input);
  p.lossTrainingPending--;
  p.training.strength += 1 + Math.floor(hits / 2);
  p.xp += 20 + hits * 5;
  return p;
}

export function savePotScore(input: Profile, mode: "throw" | "jump" | "chop", hits: number): Profile | null {
  if (!["throw","jump","chop"].includes(mode) || !Number.isInteger(hits) || hits<0 || hits>5) return null;
  return {...input, potBest:{...input.potBest, [mode]:Math.max(input.potBest[mode],hits)}};
}

/** Challenge-only awards use the existing XP/coin upgrade and level-up machinery. */
export function awardActivity(input: Profile, reward: Reward, title: string): Profile {
  const p = clone(input); const lines: string[] = [];
  grant(p, reward, lines); checkTrophies(p, lines); notice(p, title, lines);
  return p;
}

/** Mutates only an already cloned result. Bonus every five consecutive match wins. */
export function recordMatchStreak(p: Profile, won: boolean): void {
  p.matchStreak = won ? p.matchStreak + 1 : 0;
  p.bestMatchStreak = Math.max(p.bestMatchStreak, p.matchStreak);
  if (won && p.matchStreak % 5 === 0) {
    const gems = Math.min(5, 1 + p.matchStreak / 5);
    p.gems += gems;
    p.last = { ...p.last, n: p.last.n + 1, title: 'Five-win diamond milestone', lines: [...p.last.lines, `${p.matchStreak} consecutive wins: +${gems} diamonds`] };
  }
}
