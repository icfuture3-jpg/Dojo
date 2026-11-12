export type Move = "rock" | "paper" | "scissors";
export const MOVES: readonly Move[] = ["rock", "paper", "scissors"];
export const MOVE_ICON: Record<Move, string> = {
  rock: "✊",
  paper: "✋",
  scissors: "✌️",
};
export const WINS_NEEDED = 3;

export function beats(a: Move, b: Move): boolean {
  return (
    (a === "rock" && b === "scissors") ||
    (a === "paper" && b === "rock") ||
    (a === "scissors" && b === "paper")
  );
}
export function counterTo(m: Move): Move {
  return MOVES.find((x) => beats(x, m)) as Move;
}

export interface Round {
  player: Move;
  rival: Move;
}
export interface Rival {
  name: string;
  title: string;
  color: string;
  belt: string;
  intro: string;
  blurb: string;
  /** Chance the pre-throw tell is honest. */
  tellHonesty: number;
  pick(history: readonly Round[], rnd: () => number): Move;
}

/** Equal thirds, one draw per hand, independent of player input and history. */
export function randomMove(rnd: () => number): Move {
  return MOVES[Math.floor(rnd() * MOVES.length)]!;
}
export const fairPick: Rival["pick"] = (_history, rnd) => randomMove(rnd);

/** Classic Daily uses the same banned hand for both fighters. */
export function dailyRival(rival: Rival, banned: Move): Rival {
  const allowed = MOVES.filter(move => move !== banned);
  return { ...rival, pick: (_history, rnd) => allowed[Math.floor(rnd() * allowed.length)]! };
}

const BASE_RIVALS: readonly Rival[] = [
  {
    name: "Brick Fist Bao",
    title: "The Brawler",
    color: "#c0392b",
    belt: "#f1c40f",
    intro: "Words are for the weak. Fists are for winners!",
    blurb: "Rock, Paper and Scissors are equally likely. No habit-reading.",
    tellHonesty: 0.9,
    pick: fairPick,
  },
  {
    name: "Mirage Mei",
    title: "The Illusionist",
    color: "#8e44ad",
    belt: "#ecf0f1",
    intro: "Do you see my hand... or the hand I want you to see?",
    blurb: "Rock, Paper and Scissors are equally likely. No habit-reading.",
    tellHonesty: 0.8,
    pick: fairPick,
  },
  {
    name: "Master Ren",
    title: "The Counter-Master",
    color: "#16a085",
    belt: "#e67e22",
    intro: "Every hand has its chance. Make yours count.",
    blurb: "Rock, Paper and Scissors are equally likely. No habit-reading.",
    tellHonesty: 0.75,
    pick: fairPick,
  },
  {
    name: "Grandmaster Oku",
    title: "The Grandmaster",
    color: "#2c3e50",
    belt: "#d4af37",
    intro: "Three hands. One path. Show me yours.",
    blurb: "Rock, Paper and Scissors are equally likely. No habit-reading.",
    tellHonesty: 0.8,
    pick: fairPick,
  },
];
export const RIVALS: readonly Rival[] = BASE_RIVALS.map(r => ({...r,tellHonesty:Math.max(.35,r.tellHonesty-.12)}));

/** Extra challengers for the Endless Tower and the daily challenge. */
const BASE_EXTRA: readonly Rival[] = [
  { name: "Fox Jun", title: "The Bluffer", color: "#d35400", belt: "#1abc9c", intro: "Believe my tells. I dare you.", blurb: "Her tells are often lies.", tellHonesty: 0.3, pick: fairPick },
  { name: "Echo Kai", title: "The Copycat", color: "#2980b9", belt: "#ecf0f1", intro: "I am your shadow.", blurb: "Rock, Paper and Scissors are equally likely. No habit-reading.", tellHonesty: 0.7, pick: fairPick },
  { name: "Storm Rin", title: "The Tempest", color: "#6c3483", belt: "#f39c12", intro: "Winners keep the storm!", blurb: "Rock, Paper and Scissors are equally likely. No habit-reading.", tellHonesty: 0.8, pick: fairPick },
  { name: "Void Sage", title: "The Hollow One", color: "#1b2631", belt: "#e74c3c", intro: "There is no pattern. There is only you.", blurb: "Rock, Paper and Scissors are equally likely. No habit-reading.", tellHonesty: 0.6, pick: fairPick },
];
export const EXTRA_RIVALS: readonly Rival[] = BASE_EXTRA.map(r => ({...r,tellHonesty:Math.max(.35,r.tellHonesty-.08)}));
export const TOWER_POOL: readonly Rival[] = [RIVALS[0]!, EXTRA_RIVALS[0]!, RIVALS[1]!, EXTRA_RIVALS[1]!, RIVALS[2]!, EXTRA_RIVALS[2]!, RIVALS[3]!, EXTRA_RIVALS[3]!];

const TELLS: Record<Move, readonly string[]> = {
  rock: ["Hah! Feel the mountain!", "*clenches knuckles*", "Time to hit hard."],
  paper: ["Calm as the open sky...", "*palm stretches wide*", "Let it flow."],
  scissors: ["Quick as a snip!", "*two fingers twitch*", "Sharp thinking wins."],
};
export function makeTell(
  rival: Move,
  honesty: number,
  rnd: () => number,
): { text: string; hint: Move } {
  const hint = rnd() < honesty ? rival : randomMove(rnd);
  const lines = TELLS[hint];
  return { hint, text: lines[Math.floor(rnd() * lines.length)] as string };
}
/** Slower introductory rounds; Tower pressure increases without reading live input. */
export function roundBeatMs(mode: string, level: number): number {
  if (mode === "ladder") return [2400, 2200, 2000, 1800][Math.min(3, Math.max(0, level))]!;
  if (mode === "tower") return Math.max(1600, 2200 - Math.max(0, level) * 20);
  return 2000;
}

export function towerRival(floor: number): Rival {
  const f = Math.max(0, Math.floor(floor));
  const base = TOWER_POOL[f % TOWER_POOL.length]!;
  return base;
}
