import { GiDesign } from "./gi-design";
import { Coin } from "./catalog-art";
import { PauseTimers } from "./pause-timers";
import { NEW_RIVALS } from "./content-catalog";
import { CinematicDojo, EnergyRibbons, ThreeHandsCrest } from "./cinematic-art";
import "./cinematic-theme.css";
import { createPortal } from "react-dom";
const AcademyHall=lazy(()=>import("./academy-hall").then(m=>({default:m.AcademyHall})));
const ChallengeDojo=lazy(()=>import("./challenge-dojo").then(m=>({default:m.ChallengeDojo})));
import "./expansion.css";
const TreePots=lazy(()=>import("./tree-pots").then(m=>({default:m.TreePots})));
import { FinisherScene } from "./finishers";
const TrainingGame=lazy(()=>import("./training").then(m=>({default:m.TrainingGame})));
import { trainingDue } from "./economy";
import { useCallback, useEffect, useMemo, useRef, useState, useId, lazy, Suspense } from "react";
import type { CSSProperties } from "react";
import {
  MOVES,
  roundBeatMs,
  createRoundPlan,
  dailyRival,
  towerRival,
  MOVE_ICON,
  RIVALS,
  TOWER_POOL,
  WINS_NEEDED,
  beats,
  type Move,
  type Rival,
  type Round,
} from "./rps";
import { dayKey, findItem, levelInfo, parseProfile, peekCost, RANKS, rankIndex } from "./economy";
import {
  MenuRow,
  ProfileBar,
  RanksPanel,
  RewardPopup,
  CreatorPanel,
  ShopPanel,
  TrophiesPanel,
  type Screen,
} from "./meta";
import { matchDone, modeDoneMsg, buyPeekMsg, openBoxMsg, dismissNoticeMsg, type DojoEvent } from "./net";
import { setMusicIntensity, setMusicMuted, startMusic, setMusicVolume, setEffectsVolume, getEffectsVolume, stopMusic } from "./music";
import { RESCUES } from "./rescue";
import { RescueScenery } from "./scenery";
import { EYE_COLORS, HAIR_COLORS, MASTER_LOOKS, OUTFIT_COLORS, SKINS, seededLook, type Look } from "./look";
import { Eyes, HairBack, HairFront, HEAD_SHAPES, Pattern } from "./lookart";
import { cinematicOpponentIndex } from "./movie-opponents";
const CutScene=lazy(()=>import("./movie").then(m=>({default:m.CutScene})));
const DojoMovie=lazy(()=>import("./movie").then(m=>({default:m.DojoMovie})));
const RescueMovie=lazy(()=>import("./movie").then(m=>({default:m.RescueMovie})));

type Phase = "title" | "movie" | "cutscene" | "pots" | "finisher" | "loserTraining" | "intro" | "choose" | "reveal" | "result" | "matchEnd" | "champion";
type Mode = "ladder" | "tower" | "daily" | "rescue";
const EMOTES = [["🙇", "Bow"], ["💪", "Flex"], ["🤷", "Shrug"]] as const;
const todayKey = () => dayKey(Date.now());
const dailySeed = () => Number(todayKey().replace(/\D/g, "")) % 100000;
const dailyBan = (): Move => MOVES[dailySeed() % 3] as Move;
function rivalFor(mode: Mode, lvl: number): Rival {
  if (mode === "rescue") return TOWER_POOL[(RESCUES[lvl] ?? RESCUES[0]!).invader] as Rival;
  if (mode === "tower") return towerRival(lvl);
  if (mode === "daily") return dailyRival(TOWER_POOL[dailySeed() % TOWER_POOL.length]!, dailyBan());
  return RIVALS[lvl] as Rival;
}
function rivalLookFor(mode: Mode, lvl: number): Look {
  if (mode === "rescue") return (RESCUES[lvl] ?? RESCUES[0]!).invaderLook;
  if (mode === "tower") return seededLook(lvl * 7 + 3);
  if (mode === "daily") return seededLook(dailySeed());
  return (MASTER_LOOKS[lvl] ?? MASTER_LOOKS[0]!).look;
}
const BEATS = ["ROCK…", "PAPER…", "SCISSORS…", "SHOOT!"];
const KEYS: Record<string, Move> = {
  Digit1: "rock",
  KeyR: "rock",
  Digit2: "paper",
  KeyP: "paper",
  Digit3: "scissors",
  KeyS: "scissors",
};

function tone(freq: number, dur = 0.25, type: OscillatorType = "sine", vol = 0.15, slide = 0) {
  try {
    if (getEffectsVolume() === 0) return;
    const AC = window.AudioContext;
    const ctx = ((tone as unknown as { ctx?: AudioContext }).ctx ??= new AC());
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), ctx.currentTime + dur);
    g.gain.setValueAtTime(vol * getEffectsVolume(), ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + dur);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + dur);
  } catch {
    /* audio unavailable */
  }
}
const sfx = {
  gong() { tone(110, 1.4, "sine", 0.25); tone(165, 1.2, "triangle", 0.1); },
  whoosh() { tone(900, 0.4, "sawtooth", 0.05, -700); },
  hit() { tone(140, 0.2, "square", 0.15, -90); },
  win() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.35, "triangle", 0.14), i * 140)); },
  lose() { [330, 262, 196].forEach((f, i) => setTimeout(() => tone(f, 0.4, "sawtooth", 0.08), i * 200)); },
  tick() { tone(660, 0.08, "square", 0.05); },
};

const TORSO_F = "M58 106 Q58 100 70 100 L130 100 Q142 100 142 106 Q140 140 134 160 Q130 172 134 190 Q142 206 148 220 L52 220 Q58 206 66 190 Q70 172 66 160 Q60 140 58 106 Z";

export function Fighter({ color, belt, move, flip, state, hint, pump, fx, band, aura, skin, look, gi }: {
  look?: Look; gi?: Pick<import("./economy").Item,"name"|"pattern">;
  fx?: Move | null;
  band?: string; aura?: string; skin?: string;
  pump?: boolean;
  color: string; belt: string; move: Move | null; flip?: boolean;
  state: "idle" | "throw" | "win" | "lose"; hint?: Move | null;
}) {
  const artId=useId().replace(/:/g,'');
  const fem = look?.body === 1;
  const bx = fem ? 62 : 50;
  const bw = fem ? 76 : 100;
  const head = HEAD_SHAPES[look?.head ?? 0] ?? HEAD_SHAPES[0]!;
  const hairCol = HAIR_COLORS[look?.hairColor ?? 0] ?? "#222";
  const eyeCol = EYE_COLORS[look?.eyeColor ?? 0] ?? "#222";
  const skinTone = look ? SKINS[look.skin] ?? "#f1c9a0" : "#f1c9a0";
  const style: CSSProperties = {
    animation:
      state === "idle"
        ? "breathe 2.2s ease-in-out infinite, weightShift 3.8s ease-in-out infinite"
        : state === "win"
        ? "hop 0.5s ease-in-out infinite"
        : state === "lose"
        ? fx === "rock"
          ? "squash 0.25s ease-in 0.45s forwards"
          : fx === "scissors"
          ? "cutshake 0.5s linear 0.5s"
          : "none"
        : "snapLunge 0.4s cubic-bezier(.1,.9,.2,1)",
    transformOrigin: "50% 100%",
    filter:
      state === "lose"
        ? "grayscale(0.6) brightness(0.8) drop-shadow(0 6px 6px #0008)"
        : "drop-shadow(0 6px 6px #0008) drop-shadow(0 0 3px #ffd89a55)",
  };
  return (
    <div className="cutout-fighter" data-fighter-state={state} style={{ position: "relative", width: 200, height: 300, transformOrigin: "50% 100%" }}>
      {aura && aura !== "#0000" && (
        <div style={{ position: "absolute", left: -30, top: 20, width: 260, height: 290, borderRadius: "50%", background: `radial-gradient(ellipse, ${aura}aa, ${aura}33 55%, #0000 72%)`, animation: "auraPulse 1.4s ease-in-out infinite" }} />
      )}
      <div style={{ transform: `scaleX(${flip ? -1 : 1})`, position: "relative" }}>
      <svg className="fighter-art" viewBox="0 0 200 300" width="200" height="300" style={style}>
        <defs>
          <clipPath id={`${artId}-torso`}>{fem ? <path d={TORSO_F} /> : <rect x="50" y="100" width="100" height="120" rx="22" />}</clipPath>
          <linearGradient id={`${artId}-shade`} x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.18" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></linearGradient>
          <radialGradient id={`${artId}-face`} cx="0.4" cy="0.35"><stop offset="0" stopColor="#fff" stopOpacity="0.25" /><stop offset="1" stopColor="#000" stopOpacity="0.22" /></radialGradient>
        </defs>
        <ellipse className="fighter-shadow" cx="100" cy="292" rx="70" ry="9" fill="#0006" />
        <g className="fighter-left-leg">
          <rect x="62" y="205" width="30" height="80" rx="8" fill={color} />
          <rect x="62" y="205" width="30" height="80" rx="8" fill={`url(#${artId}-shade)`} />
          <path d="M70 225L74 262M84 215L82 250" stroke="#0004" strokeWidth="2" fill="none" />
          <rect x="56" y="280" width="40" height="12" rx="5" fill="#222" />
          <path d="M60 283H90" stroke="#fff3" strokeWidth="2" />
        </g>
        <g className="fighter-right-leg">
          <rect x="108" y="205" width="30" height="80" rx="8" fill={color} />
          <rect x="108" y="205" width="30" height="80" rx="8" fill={`url(#${artId}-shade)`} />
          <path d="M130 225L126 262M116 215L118 250" stroke="#0004" strokeWidth="2" fill="none" />
          <rect x="104" y="280" width="40" height="12" rx="5" fill="#222" />
          <path d="M108 283H138" stroke="#fff3" strokeWidth="2" />
        </g>
        {fem ? <path d={TORSO_F} fill={color} /> : <rect x="50" y="100" width="100" height="120" rx="22" fill={color} />}
        {fem ? <path d={TORSO_F} fill={`url(#${artId}-shade)`} /> : <rect x="50" y="100" width="100" height="120" rx="22" fill={`url(#${artId}-shade)`} />}
        {look && <g clipPath={`url(#${artId}-torso)`}>{gi ? <GiDesign item={gi}/> : <Pattern i={look.pattern}/>}</g>}
        <path d="M57 110Q60 102 72 104L99 148L125 104Q137 104 143 112" fill="none" stroke="#ffe6a455" strokeWidth="3"/>
        <path d="M60 160L75 170M137 155L123 169M72 187L79 196M128 187L120 196" stroke="#11192366" strokeWidth="2" fill="none"/>
        <path d="M54 118L59 157M142 119L138 150" stroke="#8be2e744" strokeWidth="3" fill="none"/>
        <path d="M100 100 L128 100 L90 170 Z" fill="#fff3" />
        {fem && <><ellipse cx="86" cy="130" rx="11" ry="9" fill="#fff2" /><ellipse cx="114" cy="130" rx="11" ry="9" fill="#fff2" /></>}
        <path d="M72 100 L100 150 L128 100" stroke="#0005" strokeWidth="3" fill="none" />
        <path d="M60 195 Q70 210 66 218 M140 195 Q130 210 134 218 M92 190 Q96 205 90 216 M108 190 Q104 205 110 216" stroke="#0004" strokeWidth="2" fill="none" />
        <rect x={bx} y="170" width={bw} height="16" fill={belt} />
        <rect x={bx} y="170" width={bw} height="5" fill="#fff3" />
        <rect x={bx} y="181" width={bw} height="5" fill="#0003" />
        <path d="M96 178 L82 204 L94 200 Z M104 178 L120 204 L108 200 Z" fill={belt} stroke="#0004" strokeWidth="1.5" />
        {fem && <><path d="M62 184 Q100 192 138 184 L158 258 Q100 272 42 258 Z" fill={color} /><path d="M62 184 Q100 192 138 184 L158 258 Q100 272 42 258 Z" fill={`url(#${artId}-shade)`} /><path d="M80 190 L72 262 M100 192 L100 266 M120 190 L128 262" stroke="#0004" strokeWidth="2" fill="none" /></>}
        <rect x="92" y="171" width="16" height="14" rx="4" fill={belt} stroke="#0004" strokeWidth="1.5" />
        <rect className="fighter-left-arm" x="35" y="108" width="24" height="70" rx="12" fill={color} transform={state === "throw" || state === "win" ? "rotate(30 47 112)" : ""} />
        <rect className="fighter-right-arm" x="141" y="108" width="24" height="70" rx="12" fill={color} transform={state === "throw" ? "rotate(-75 153 112)" : state === "win" ? "rotate(-30 153 112)" : ""} />
        <rect className="fighter-left-arm" x="35" y="108" width="24" height="70" rx="12" fill={`url(#${artId}-shade)`} transform={state === "throw" || state === "win" ? "rotate(30 47 112)" : ""} />
        <rect className="fighter-right-arm" x="141" y="108" width="24" height="70" rx="12" fill={`url(#${artId}-shade)`} transform={state === "throw" ? "rotate(-75 153 112)" : state === "win" ? "rotate(-30 153 112)" : ""} />
        <g className="fighter-left-arm" transform={state === "throw" || state === "win" ? "rotate(30 47 112)" : ""}><rect x="35" y="150" width="24" height="7" rx="3" fill="#fff4" /><circle cx="47" cy="182" r="9" fill={skinTone} stroke="#0003" strokeWidth="1.5" /></g>
        <g className="fighter-right-arm" transform={state === "throw" ? "rotate(-75 153 112)" : state === "win" ? "rotate(-30 153 112)" : ""}><rect x="141" y="150" width="24" height="7" rx="3" fill="#fff4" /><circle cx="153" cy="182" r="9" fill={skinTone} stroke="#0003" strokeWidth="1.5" /></g>
        {skin === "skin-oni" && <path d="M68 40 L62 6 L88 32 M132 40 L138 6 L112 32" fill="#f4ecd8" />}
        {skin === "skin-panda" && <><circle cx="68" cy="36" r="13" fill="#111" /><circle cx="132" cy="36" r="13" fill="#111" /></>}
        <HairBack i={look?.hair ?? 0} c={hairCol} />
        <rect x={100 - head.rx} y={68 - head.ry} width={head.rx * 2} height={head.ry * 2} rx={head.r} fill={skin === "skin-ninja" ? "#17202a" : skin === "skin-oni" ? "#c0392b" : skin === "skin-panda" ? "#ffffff" : skinTone} />
        {skin === "skin-ninja" && <rect x="64" y="62" width="72" height="24" rx="8" fill="#f1c9a0" />}
        {skin === "skin-panda" && <><ellipse cx="85" cy="76" rx="11" ry="9" fill="#111" /><ellipse cx="115" cy="76" rx="11" ry="9" fill="#111" /></>}
        <rect x={100 - head.rx} y={68 - head.ry} width={head.rx * 2} height={head.ry * 2} rx={head.r} fill={`url(#${artId}-face)`} />
        {look && <HairFront i={look.hair} c={hairCol} />}
        <ellipse cx={100 - head.rx} cy="72" rx="6" ry="9" fill="#e3b88c" stroke="#0003" strokeWidth="1.5" />
        <ellipse cx={100 + head.rx} cy="72" rx="6" ry="9" fill="#e3b88c" stroke="#0003" strokeWidth="1.5" />
        {look?.body === 1 && <><ellipse cx="82" cy="84" rx="6" ry="3" fill="#ff7a9a55" /><ellipse cx="118" cy="84" rx="6" ry="3" fill="#ff7a9a55" /><path d={`M${100 - 14 - 8} 74 L${100 - 14 - 12} 70 M${100 + 14 + 8} 74 L${100 + 14 + 12} 70`} stroke="#222" strokeWidth="2.5" strokeLinecap="round" /><path d="M92 90 Q100 96 108 90 Q100 100 92 90 Z" fill="#d6455f" /></>}
        <path d={`M${103-head.rx} 67Q${105-head.rx} 80 ${113-head.rx} 84`} stroke="#ffdc9b66" strokeWidth="3" fill="none"/>
        <path d="M100 74 Q96 84 102 85" stroke="#0004" strokeWidth="2" fill="none" />
        <rect x="62" y="48" width="76" height="14" fill={band ?? belt} />
        <rect x="62" y="48" width="76" height="4" fill="#fff4" />
        <rect x="62" y="58" width="76" height="4" fill="#0003" />
        <path d="M138 52 L170 40 L160 62 Z" fill="#0002" />
        <path d="M138 52 L170 40 L160 62 Z" fill={band ?? belt} />
        <path d={state === "lose" ? "M88 96 Q100 88 112 96" : "M88 92 Q100 102 112 92"} stroke="#6a2d1d" strokeWidth="3" fill="none" />
        {look ? <Eyes i={look.eye} color={eyeCol} panda={skin === "skin-panda"} /> : (
          <>
            <circle cx="86" cy="76" r="4" fill={skin === "skin-panda" ? "#fff" : "#222"} />
            <circle cx="114" cy="76" r="4" fill={skin === "skin-panda" ? "#fff" : "#222"} />
            <path d="M80 66 L94 70 M120 66 L106 70" stroke="#222" strokeWidth="3" />
            <circle cx="87.5" cy="74.5" r="1.5" fill="#fff" />
            <circle cx="115.5" cy="74.5" r="1.5" fill="#fff" />
          </>
        )}
        <path d="M76 82 Q86 86 94 82 M106 82 Q114 86 124 82" stroke="#0002" strokeWidth="2" fill="none" />
      </svg>
      </div>
      {fx === "rock" && (
        <svg key="rockfx" viewBox="0 0 120 120" width="150" height="150" style={{ position: "absolute", left: 25, top: 150, animation: "rockdrop 0.5s cubic-bezier(.6,0,1,.6) forwards", filter: "drop-shadow(0 8px 8px #000a)" }}>
          <path d="M10 95 L5 55 L30 18 L70 8 L108 35 L115 80 L92 112 L40 114 Z" fill="#7f8c8d" stroke="#3d4648" strokeWidth="4" />
          <path d="M30 18 L48 50 L70 8 M48 50 L40 114 M48 50 L92 60 L108 35 M92 60 L92 112" stroke="#4d5a5c" strokeWidth="3" fill="none" />
          <path d="M30 18 L48 50 L40 114 L10 95 L5 55 Z" fill="#b2bec3" opacity="0.45" />
          <path d="M92 60 L108 35 L115 80 L92 112 Z" fill="#000" opacity="0.28" />
          <circle cx="62" cy="80" r="3" fill="#4d5a5c" /><circle cx="76" cy="36" r="2.5" fill="#4d5a5c" /><circle cx="22" cy="60" r="2" fill="#4d5a5c" /><circle cx="100" cy="85" r="2.5" fill="#3d4648" />
        </svg>
      )}
      {fx === "rock" && <div key="dust" style={{ position: "absolute", left: 0, right: 0, top: 255, height: 40, background: "radial-gradient(ellipse, #e8d9b8cc, #0000 70%)", animation: "dust 0.8s ease-out 0.45s both" }} />}
      {fx === "paper" && (
        <div key="paperfx" style={{ position: "absolute", left: 30, top: 25, width: 140, height: 270, animation: "wrap 0.9s ease-in-out 0.2s both" }}>
          <svg viewBox="0 0 140 270" width="140" height="270">
            <rect x="2" y="2" width="136" height="266" rx="30" fill="#f7f1e1" stroke="#b9ad8e" strokeWidth="3" />
            <path d="M2 60 Q70 80 138 55 M2 120 Q70 140 138 115 M2 180 Q70 200 138 175 M2 235 Q70 250 138 230" stroke="#cfc4a6" strokeWidth="3" fill="none" />
            <path d="M40 4 L60 266 M100 4 L82 266" stroke="#e1d8bf" strokeWidth="2" />
          </svg>
        </div>
      )}
      {fx === "scissors" && (
        <>
          <svg key="scfx" viewBox="0 0 120 120" width="150" height="150" style={{ position: "absolute", left: 25, top: 100, animation: "snip 0.7s ease-in-out forwards" }}>
            <g stroke="#2c3e50" strokeWidth="3">
              <path d="M10 10 L95 80 L88 90 L5 22 Z" fill="#bdc3c7" />
              <path d="M10 90 L95 20 L88 10 L5 78 Z" fill="#ecf0f1" style={{ transformOrigin: "50px 50px", animation: "blade 0.7s ease-in-out forwards" }} />
              <circle cx="102" cy="22" r="14" fill="none" stroke="#c0392b" strokeWidth="7" />
              <circle cx="102" cy="78" r="14" fill="none" stroke="#c0392b" strokeWidth="7" />
            </g>
          </svg>
          <div key="cutline" style={{ position: "absolute", left: 20, top: 150, width: 160, height: 5, background: "#fff", boxShadow: "0 0 12px #fff", transform: "rotate(-35deg)", animation: "cutline 0.5s ease-out 0.5s both" }} />
        </>
      )}
      {move && state !== "idle" && (
        <div style={{
          position: "absolute", top: 70, [flip ? "left" : "right"]: -70, fontSize: 84,
          animation: "pop 0.5s ease-out", transform: flip ? "scaleX(-1)" : undefined,
          filter: "drop-shadow(0 4px 6px #000a)",
        }}>{MOVE_ICON[move]}</div>
      )}
      {hint && state === "idle" && (
        <div style={{ position: "absolute", top: 90, [flip ? "left" : "right"]: -14, fontSize: 22, opacity: 0.55, animation: "twitch 0.4s infinite" }}>
          {MOVE_ICON[hint]}
        </div>
      )}
    </div>
  );
}

const STUDENTS: { x: number; row: 0 | 1; color: string; belt: string; delay: number; move: number }[] = [
  { x: 6, row: 0, color: "#ecf0f1", belt: "#222", delay: 0, move: 0 },
  { x: 19, row: 0, color: "#ecf0f1", belt: "#2471a3", delay: 0.3, move: 1 },
  { x: 32, row: 0, color: "#ecf0f1", belt: "#222", delay: 0.6, move: 0 },
  { x: 45, row: 0, color: "#ecf0f1", belt: "#c0392b", delay: 0.15, move: 1 },
  { x: 58, row: 0, color: "#ecf0f1", belt: "#222", delay: 0.45, move: 0 },
  { x: 71, row: 0, color: "#ecf0f1", belt: "#27ae60", delay: 0.75, move: 1 },
  { x: 84, row: 0, color: "#ecf0f1", belt: "#222", delay: 0.2, move: 0 },
  { x: 95, row: 0, color: "#ecf0f1", belt: "#e67e22", delay: 0.5, move: 1 },
  { x: 2, row: 1, color: "#d5dbdb", belt: "#8e44ad", delay: 0.1, move: 1 },
  { x: 13, row: 1, color: "#d5dbdb", belt: "#222", delay: 0.4, move: 0 },
  { x: 87, row: 1, color: "#d5dbdb", belt: "#f1c40f", delay: 0.25, move: 0 },
  { x: 98, row: 1, color: "#d5dbdb", belt: "#222", delay: 0.55, move: 1 },
];

function Student({ color, belt, delay, move }: { color: string; belt: string; delay: number; move: number }) {
  const d = `${delay}s`;
  return (
    <svg viewBox="0 0 100 150" width="100" height="150" style={{ animation: `sway 1.2s ease-in-out ${d} infinite` }}>
      <ellipse cx="50" cy="144" rx="34" ry="5" fill="#0005" />
      <defs>
        <linearGradient id="sshade" x1="0" x2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.2" /><stop offset="0.5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#000" stopOpacity="0.35" /></linearGradient>
      </defs>
      <rect x="28" y="100" width="18" height="42" rx="5" fill={color} />
      <rect x="54" y="100" width="18" height="42" rx="5" fill={color} style={move ? { transformBox: "fill-box", transformOrigin: "50% 0%", animation: `kick 1.2s ease-in-out ${d} infinite` } : undefined} />
      <rect x="28" y="100" width="18" height="42" rx="5" fill="url(#sshade)" />
      <rect x="54" y="100" width="18" height="42" rx="5" fill="url(#sshade)" />
      <rect x="26" y="138" width="22" height="7" rx="3" fill="#222" />
      <rect x="52" y="138" width="22" height="7" rx="3" fill="#222" />
      <rect x="24" y="50" width="52" height="60" rx="12" fill={color} />
      <rect x="24" y="50" width="52" height="60" rx="12" fill="url(#sshade)" />
      <path d="M38 50 L50 78 L62 50" stroke="#0005" strokeWidth="2" fill="none" />
      <path d="M32 100 Q36 106 33 110 M68 100 Q64 106 67 110 M46 94 Q48 104 44 108" stroke="#0004" strokeWidth="1.2" fill="none" />
      <rect x="24" y="84" width="52" height="8" fill={belt} />
      <rect x="24" y="84" width="52" height="2.5" fill="#fff4" />
      <path d="M48 90 L40 106 L48 103 Z M52 90 L60 106 L52 103 Z" fill={belt} stroke="#0004" strokeWidth="1" />
      <circle cx="50" cy="34" r="19" fill="#e8c39e" />
      <circle cx="50" cy="34" r="19" fill="#000" opacity="0.1" />
      <ellipse cx="31" cy="36" rx="3" ry="5" fill="#d3ab84" />
      <ellipse cx="69" cy="36" rx="3" ry="5" fill="#d3ab84" />
      <circle cx="43" cy="37" r="2" fill="#222" /><circle cx="57" cy="37" r="2" fill="#222" />
      <circle cx="43.8" cy="36.3" r="0.7" fill="#fff" /><circle cx="57.8" cy="36.3" r="0.7" fill="#fff" />
      <path d="M38 32 L47 34 M62 32 L53 34" stroke="#222" strokeWidth="1.5" />
      <path d="M44 46 Q50 50 56 46" stroke="#6a2d1d" strokeWidth="1.5" fill="none" />
      <rect x="31" y="22" width="38" height="7" fill={belt} />
      <rect x="31" y="22" width="38" height="2" fill="#fff4" />
      <path d="M69 24 L84 18 L78 30 Z" fill={belt} />
      <rect x="10" y="56" width="14" height="34" rx="7" fill={color} />
      <rect x="76" y="56" width="14" height="34" rx="7" fill={color} style={{ transformBox: "fill-box", transformOrigin: "50% 10%", animation: `${move ? "block" : "punch"} 1.2s ease-in-out ${d} infinite` }} />
    </svg>
  );
}

const btn: CSSProperties = {
  pointerEvents: "auto", cursor: "pointer", border: "3px solid #f1c40f", background: "linear-gradient(#a02a1c, #6a170e)",
  boxShadow: "0 4px 0 #3a0b06, 0 6px 14px #000a, inset 0 2px 0 #fff3, inset 0 0 12px #0005", textShadow: "0 2px 2px #000a",
  color: "#fff6dc", fontFamily: "Georgia, serif", fontSize: 22, padding: "10px 28px",
  borderRadius: 6, letterSpacing: 1,
};

export function GameHud({ dispatch, profileData, boardData, boardId }: { dispatch(e: DojoEvent): void; profileData: string; boardData: string; boardId: string }) {
  const prof = useMemo(() => parseProfile(profileData ? JSON.parse(profileData) : {}), [profileData]);
  const [trainingNext, setTrainingNext] = useState<Phase>("matchEnd");
  const finishCutscene = () => { setTrainingNext(cut.next); setPhase(prof.equip.finisher ? "finisher" : cut.kind === "lose" ? "loserTraining" : cut.next); };
  const [cut, setCut] = useState<{ kind: "win" | "lose" | "champion"; next: Phase }>({ kind: "win", next: "matchEnd" });
  const [rescuePick, setRescuePick] = useState(false);
  const [challengeOpen, setChallengeOpen] = useState(false);
  const [academyOpen, setAcademyOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => { setMusicVolume(prof.audio.music); setEffectsVolume(prof.audio.sfx); }, [prof.audio.music, prof.audio.sfx]);
  useEffect(() => () => stopMusic(), []);
  const [mode, setMode] = useState<Mode>("ladder");
  const modeRef = useRef<Mode>("ladder");
  const [muted, setMuted] = useState(false);
  const [emote, setEmote] = useState<string | null>(null);
  const [peek, setPeek] = useState<Move | null>(null);
  const [peekUsed, setPeekUsed] = useState(false);
  const [guardArmed, setGuardArmed] = useState(false);
  const [guardUsed, setGuardUsed] = useState(false);
  const guardRef = useRef(false);
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [screen, setScreen] = useState<Screen | null>(null);
  const ladderLost = useRef(false);
  const trailed = useRef(false);
  const equipGi = findItem(prof.equip.gi);
  const playerLook = prof.look.outfit === -1 && equipGi?.pattern !== undefined ? { ...prof.look, pattern: equipGi.pattern } : prof.look;
  const equipBand = findItem(prof.equip.band);
  const equipAura = findItem(prof.equip.aura);
  const showNotice = prof.last.n > prof.seenNotice && (prof.last.lines.length > 1 || !/^(Purchase|Upgrade)$/.test(prof.last.title));
  const [phase, setPhase] = useState<Phase>("title");
  const [level, setLevel] = useState(0);
  const [score, setScore] = useState({ p: 0, r: 0 });
  const [history, setHistory] = useState<Round[]>([]);
  const [pick, setPick] = useState<Move | null>(null);
  const [rivalMove, setRivalMove] = useState<Move | null>(null);
  const [outcome, setOutcome] = useState<"win" | "lose" | "tie" | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const chosen = useRef<Move | null>(null);
  const [stats, setStats] = useState({ rounds: 0, wins: 0 });
  const [flash, setFlash] = useState(0);
  const rival = rivalFor(mode, level);
  const beatMs = roundBeatMs(mode, level);
  const shootMs = beatMs * 3;
  const rivalLook = rivalLookFor(mode, level);
  const myLevel = levelInfo(prof.xp).level;
  const planned = useRef(createRoundPlan());
  const completionId = useRef("");
  const combatTimers=useRef(new PauseTimers());
  const [combatPaused,setCombatPaused]=useState(false);
  const pausedRef=useRef(false);
  const pauseCombat=()=>{pausedRef.current=true;combatTimers.current.pause();setCombatPaused(true);};
  const resumeCombat=()=>{pausedRef.current=false;combatTimers.current.resume();setCombatPaused(false);};
  useEffect(()=>{if(!['intro','choose','reveal','result'].includes(phase))return;const hide=()=>{if(document.hidden)pauseCombat();};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[phase]);
  const later = (fn: () => void, ms: number) => { combatTimers.current.add(fn,ms); };
  useEffect(() => () => combatTimers.current.clear(), []);

  const startRound = useCallback((hist: Round[], lvl: number) => {
    const r = rivalFor(modeRef.current, lvl);
    planned.current.reset(r.pick(hist, Math.random));
    setPick(null); setRivalMove(null); setOutcome(null); setPeek(null);
    chosen.current = null;
    setElapsed(0);
    setPhase("choose");
    sfx.gong();
  }, []);

  const beginIntro = useCallback((lvl: number) => {
    setPhase("intro");
    later(() => startRound([], lvl), 1700);
  }, [startRound]);

  const startMatch = (lvl: number, replay = false) => {
    completionId.current = crypto.randomUUID();
    setLevel(lvl); setScore({ p: 0, r: 0 }); setHistory([]); trailed.current = false;
    setPeekUsed(false); setGuardUsed(false); setGuardArmed(false); guardRef.current = false;
    if (replay || (modeRef.current !== "ladder" && modeRef.current !== "rescue")) beginIntro(lvl); else setPhase("movie");
  };

  const begin = (m: Mode, lvl: number) => {
    modeRef.current = m;
    setMode(m);
    ladderLost.current = false;
    setStats({ rounds: 0, wins: 0 });
    startMatch(lvl);
  };
  const selectMove = useCallback((m: Move) => {
    if (phase !== "choose" || pausedRef.current) return;
    if (modeRef.current === "daily" && m === dailyBan()) return;
    planned.current.select(m, Math.random, modeRef.current === "daily" ? dailyBan() : undefined);
    chosen.current = m;
    setPick(m);
  }, [phase]);const throwMove = useCallback((m: Move | null) => {
    if (phase !== "choose" || pausedRef.current) return;
    setPick(m);
    setPhase("reveal");
    sfx.whoosh();
    const rm = planned.current.move;
    let res: "win" | "lose" | "tie" = m === null ? "lose" : m === rm ? "tie" : beats(m, rm) ? "win" : "lose";
    if (res === "lose" && guardRef.current) { res = "tie"; guardRef.current = false; setGuardArmed(false); setGuardUsed(true); }
    later(() => {
      setRivalMove(rm); setOutcome(res); setFlash((f) => f + 1);
      sfx.hit();
      if (res === "win") sfx.win(); else if (res === "lose") sfx.lose();
      const hist = m === null ? history : [...history, { player: m, rival: rm }];
      setHistory(hist);
      setStats((s) => ({ rounds: s.rounds + 1, wins: s.wins + (res === "win" ? 1 : 0) }));
      const ns = { p: score.p + (res === "win" ? 1 : 0), r: score.r + (res === "lose" ? 1 : 0) };
      setScore(ns);
      if (ns.r >= 2 && ns.p === 0) trailed.current = true;
      setPhase("result");
      later(() => {
        if (ns.p >= WINS_NEEDED || ns.r >= WINS_NEEDED) {
          const won = ns.p >= WINS_NEEDED;
          if (!won) ladderLost.current = true;
          if (modeRef.current !== "ladder") dispatch({ type: "dojo.send", message: modeDoneMsg({ completionId: completionId.current, mode: modeRef.current as "tower" | "daily" | "rescue", floor: modeRef.current === "tower" || modeRef.current === "rescue" ? level : 0, won, correct: false }) });
          else dispatch({ type: "dojo.send", message: matchDone({ completionId: completionId.current, rival: level, won, roundsWon: ns.p, roundsLost: ns.r, comeback: won && trailed.current, perfectRun: won && level === RIVALS.length - 1 && !ladderLost.current }) });
        }
        if (ns.p >= WINS_NEEDED) { setCut({ kind: modeRef.current === "ladder" && level === RIVALS.length - 1 ? "champion" : "win", next: modeRef.current === "ladder" && level === RIVALS.length - 1 ? "champion" : "matchEnd" }); setPhase("cutscene"); }
        else if (ns.r >= WINS_NEEDED) { setCut({ kind: "lose", next: "matchEnd" }); setPhase("cutscene"); }
        else startRound(hist, level);
      }, 1900);
    }, 300);
  }, [phase, history, score, level, startRound, dispatch]);

  useEffect(() => {
    if (phase !== "choose" || pausedRef.current) return;
    let t0 = performance.now();
    let previousTick=t0;
    let lastBeat = -1;
    const id = window.setInterval(() => {
      const tick=performance.now();
      if(pausedRef.current){t0+=tick-previousTick;previousTick=tick;return;}
      previousTick=tick;
      const el = tick - t0;
      setElapsed(Math.min(el, shootMs));
      const b = Math.min(3, Math.floor(el / beatMs));
      if (b !== lastBeat) { lastBeat = b; sfx.tick(); }
      // The rival throws on SHOOT! no matter what. The game never picks for
      // you: if you have not chosen by then, you were too slow and lose the round.
      if (el >= shootMs) {
        clearInterval(id);
        throwMove(chosen.current);
      }
    }, 30);
    return () => clearInterval(id);
  }, [phase, throwMove, beatMs, shootMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLElement && (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName))) return;
      const m = KEYS[e.code];
      if (m) selectMove(m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectMove]);

  useEffect(() => {
    const first = () => startMusic();
    window.addEventListener("pointerdown", first, { once: true });
    window.addEventListener("keydown", first, { once: true });
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => { window.removeEventListener("resize", onResize); window.removeEventListener("pointerdown", first); window.removeEventListener("keydown", first); };
  }, []);
  useEffect(() => {
    const close = score.p === WINS_NEEDED - 1 || score.r === WINS_NEEDED - 1;
    setMusicIntensity(phase === "title" ? 0.1 : phase === "choose" || phase === "reveal" || phase === "result" ? (close ? 0.85 : 0.4) + (phase === "choose" ? (elapsed / shootMs) * 0.15 : 0) : 0.25);
    setMusicMuted(muted);
  }, [phase, score, muted, elapsed]);
  const doEmote = (e: string) => { setEmote(e); later(() => setEmote(null), 1600); };
  const peekLock = useRef(false);
  const peekPrice = peekCost(level);
  const canPeek = phase === "choose" && peek === null && (!peekUsed || prof.coins >= peekPrice);
  const doPeek = () => {
    if (!canPeek || peekLock.current || pausedRef.current) return;
    peekLock.current = true;
    if (peekUsed) dispatch({ type: "dojo.send", message: buyPeekMsg({ level }) });
    setPeekUsed(true);
    setPeek(planned.current.peek());
  };
  useEffect(() => { if (phase === "choose" && peek === null) peekLock.current = false; }, [phase, peek]);
  const doGuard = () => { if (guardUsed || (myLevel < 3 && prof.training.strength === 0)) return; guardRef.current = !guardRef.current; setGuardArmed(guardRef.current); };
  const myFig = { name: prof.name, avatar: <Fighter gi={prof.look.outfit === -1 ? equipGi : undefined} look={playerLook} color={(prof.look.outfit >= 0 ? OUTFIT_COLORS[prof.look.outfit] : equipGi?.color) ?? "#2471a3"} belt="#ecf0f1" band={equipBand?.color} aura={equipAura?.color} skin={prof.equip.skin} move={null} state="idle" />, color: (prof.look.outfit >= 0 ? OUTFIT_COLORS[prof.look.outfit] : equipGi?.color) ?? "#2471a3", belt: "#ecf0f1", skin: SKINS[prof.look.skin] ?? "#e8c39e", hair: prof.look.hair === 0 ? "" : HAIR_COLORS[prof.look.hairColor] ?? "#222", fem: prof.look.body === 1 };
  // Scale controls uniformly, but expand the stage to the viewport instead of letterboxing.
  const scale = Math.min(1, size.w / 1280, size.h / 800);
  const compact = size.w < 900 || size.h < 600;
  const activeRound = ["choose", "reveal", "result"].includes(phase);
  const lost = score.r >= WINS_NEEDED;
  const revealing = phase === "reveal";
  const slowmo = revealing || phase === "result";
  const pState = outcome === "win" ? "win" : outcome === "lose" || outcome === "tie" ? "lose" : phase === "reveal" || outcome ? "throw" : "idle";
  const rState = outcome === "lose" ? "win" : outcome === "win" || outcome === "tie" ? "lose" : phase === "reveal" || outcome ? "throw" : "idle";

  const pips = (n: number, color: string) => (
    <div style={{ display: "flex", gap: 8 }}>
      {Array.from({ length: WINS_NEEDED }, (_, i) => (
        <div key={i} style={{ width: 22, height: 22, borderRadius: 11, border: "2px solid #f1c40f", background: i < n ? `radial-gradient(circle at 35% 30%, #fff8, ${color} 50%)` : "radial-gradient(#0008, #0004)", boxShadow: i < n ? `0 0 10px ${color}` : "inset 0 2px 4px #000a" }} />
      ))}
    </div>
  );
  const overlay: CSSProperties = {
    position: "absolute", inset: 0, zIndex: 50, display: "flex", flexDirection: "column",
    alignItems: "center", justifyContent: "center", gap: 18, background: "radial-gradient(ellipse at center, #000a 20%, #000e 100%)", backdropFilter: "blur(3px)", textShadow: "0 3px 6px #000", color: "#fff6dc",
    fontFamily: "Georgia, serif", textAlign: "center", pointerEvents: "auto", animation: "phaseIn .45s ease-out",
  };

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", background: "#000" }}>
    <div className="cinematic-stage" style={{ position: "absolute", left: 0, top: 0, width: size.w / scale, height: size.h / scale, transform: `scale(${scale})`, transformOrigin: "top left", overflow: "hidden", fontFamily: "Georgia, serif", color: "#fff6dc", userSelect: "none" }}>
      <style>{`
        @keyframes auraPulse{50%{opacity:0.55;transform:scale(1.06)}}
        .dojo-save{pointer-events:auto;cursor:pointer;border:2px solid #f1c40f;background:#7a1f14;color:#fff6dc;font-family:Georgia,serif;font-size:15px;padding:6px 14px;border-radius:6px}
        @keyframes rockdrop{from{transform:translateY(-520px) rotate(-25deg)}to{transform:none}}
        @keyframes squash{to{transform:scale(1.25,0.35)}}
        @keyframes dust{from{opacity:0;transform:scaleX(0.3)}30%{opacity:1}to{opacity:0;transform:scaleX(1.6)}}
        @keyframes wrap{from{transform:translateX(-120px) scaleX(0.1) rotate(-30deg);opacity:0}to{transform:none;opacity:1}}
        @keyframes snip{from{transform:translateX(-160px)}to{transform:translateX(60px)}}
        @keyframes blade{0%{transform:rotate(-25deg)}50%{transform:rotate(12deg)}to{transform:rotate(0)}}
        @keyframes cutline{from{opacity:1;width:0}to{opacity:0;width:200px}}
        @keyframes cutshake{25%{transform:translateX(-8px) skewX(-6deg)}75%{transform:translateX(8px) skewX(6deg)}}
        @keyframes auraPulse{50%{opacity:0.55;transform:scale(1.06)}}
        .dojo-save{pointer-events:auto;cursor:pointer;border:2px solid #f1c40f;background:#7a1f14;color:#fff6dc;font-family:Georgia,serif;font-size:15px;padding:6px 14px;border-radius:6px}
        @keyframes sway{50%{transform:translateY(-4px)}}
        @keyframes punch{0%,60%,100%{transform:rotate(0)}30%{transform:rotate(-95deg) scaleY(1.1)}}
        @keyframes block{0%,60%,100%{transform:rotate(0)}30%{transform:rotate(-140deg)}}
        @keyframes kick{0%,60%,100%{transform:rotate(0)}30%{transform:rotate(-70deg)}}
        @keyframes bob{50%{transform:translateY(-6px)}}
        @keyframes hop{50%{transform:translateY(-22px)}}
        @keyframes snapLunge{0%,100%{transform:translateX(0) scale(1)}15%{transform:translateX(-15px) scale(.95)}45%{transform:translateX(30px) scale(1.1)}}
        @keyframes guardStance{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(2px) rotate(-.5deg)}}
        @keyframes shake{10%{transform:translate(-14px,6px)}30%{transform:translate(12px,-8px)}50%{transform:translate(-9px,5px)}70%{transform:translate(6px,-3px)}90%{transform:translate(-3px,2px)}}
        @keyframes burst{0%{transform:translate(-50%,-50%) scale(0.1) rotate(-20deg);opacity:0}25%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(4deg)}to{transform:translate(-50%,-50%) scale(1.5) rotate(0);opacity:0}}
        @keyframes spark{from{transform:translate(0,0) scale(1);opacity:1}to{transform:translate(var(--dx),var(--dy)) scale(0.2);opacity:0}}
        @keyframes mote{0%,100%{transform:translate(0,0);opacity:0.15}50%{transform:translate(24px,-40px);opacity:0.7}}
        @keyframes crowd{50%{transform:translateY(-10px)}}
        @keyframes slam{from{transform:translateX(-50%) scale(3);opacity:0}30%{opacity:1}to{transform:translateX(-50%) scale(1)}}
        @keyframes pop{from{transform:scale(0.2);opacity:0}to{transform:scale(1);opacity:1}}
        @keyframes twitch{50%{transform:translateX(3px) rotate(8deg)}}
        @keyframes flash{from{opacity:0.9}to{opacity:0}}
        @keyframes lines{from{background-position:0 0}to{background-position:200px 0}}
        .dojo-save,button{transition:transform .12s ease,filter .15s ease,box-shadow .2s ease,background .2s ease}
        .dojo-save:hover:not(:disabled),button:hover:not(:disabled){transform:translateY(-2px) scale(1.04);filter:brightness(1.18) saturate(1.1);box-shadow:0 6px 18px #f1c40f55,0 0 0 1px #fff3}
        .dojo-save:active:not(:disabled),button:active:not(:disabled){transform:translateY(1px) scale(0.97);filter:brightness(0.95)}
        @keyframes phaseIn{from{opacity:0;transform:translateY(14px) scale(0.98)}to{opacity:1;transform:none}}
        @keyframes breathe{0%,100%{transform:scale(1,1) translateY(0)}50%{transform:scale(1.02,.98) translateY(-3px)}}
        /* Individual translate/rotate let weight shifting coexist with breathing's transform. */
        @keyframes weightShift{0%,100%{translate:0 0;rotate:0deg}30%{translate:-4px 0;rotate:-1deg}70%{translate:4px 0;rotate:1deg}}
        @keyframes glowpulse{50%{text-shadow:0 0 28px #f1c40f,0 0 8px #fff8}}
        @keyframes title{from{letter-spacing:0}to{letter-spacing:6px}}
      `}</style>
      {/* dojo backdrop */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(#3b2414 0%, #5a3820 55%, #2a1a0e 55%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "55%", backgroundImage: "repeating-linear-gradient(90deg, #0000 0 118px, #1c100a 118px 124px)", opacity: 0.6 }} />
      <div style={{ position: "absolute", left: "50%", top: "8%", transform: "translateX(-50%)", width: 160, height: 160, borderRadius: 80, background: "#c0392b", boxShadow: "0 0 60px #c0392b66", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 90, color: "#fff6dc" }}>拳</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "repeating-linear-gradient(90deg, #b99a5b 0 160px, #a98a4b 160px 164px)", opacity: 0.85, clipPath: "polygon(0 12%,100% 12%,100% 100%,0 100%)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", borderTop: "10px solid #3a2210" }} />
      {/* wood grain on wall */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "55%", backgroundImage: "repeating-linear-gradient(0deg, #0000 0 9px, #0002 9px 10px, #0000 10px 23px, #fff1 23px 24px)", opacity: 0.5 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "55%", background: "radial-gradient(ellipse at 50% 20%, #ffd89a33, #0000 60%), linear-gradient(90deg, #0008, #0000 20%, #0000 80%, #0008)" }} />
      {/* ceiling beam */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 26, background: "linear-gradient(#1a0e07, #3a2210 70%, #1a0e07)", borderBottom: "3px solid #0008" }} />
      {/* shoji windows */}
      {[20, 80].map((x) => (
        <div key={x} style={{ position: "absolute", left: `${x}%`, top: "16%", width: 110, height: 120, transform: "translateX(-50%)", background: "linear-gradient(#fff3c8, #f1dfa0)", border: "6px solid #2a160a", boxShadow: "0 0 40px #ffe9a066, inset 0 0 18px #c9a85c", backgroundImage: "linear-gradient(90deg, #0000 48%, #2a160a 48% 52%, #0000 52%), linear-gradient(#0000 31%, #2a160a 31% 35%, #0000 35% 65%, #2a160a 65% 69%, #0000 69%)", opacity: 0.9 }} />
      ))}
      {/* paper lanterns */}
      {[40, 60].map((x) => (
        <div key={x} style={{ position: "absolute", left: `${x}%`, top: 0, width: 0, transform: "translateX(-50%)", animation: "sway 3s ease-in-out infinite" }}>
          <div style={{ width: 2, height: 46, background: "#1a0e07", margin: "0 auto" }} />
          <div style={{ width: 44, height: 56, marginLeft: -22, borderRadius: "40%", background: "radial-gradient(ellipse at 50% 40%, #ffd37a, #e67e22 70%, #a04a10)", boxShadow: "0 0 36px #ffb84ccc", backgroundImage: "repeating-linear-gradient(0deg, #0000 0 10px, #7a3a0c55 10px 12px)", border: "2px solid #5a2c0a" }} />
          <div style={{ width: 22, height: 6, marginLeft: -11, background: "#1a0e07" }} />
        </div>
      ))}
      {/* weapon rack with bo staffs */}
      <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", top: "37%", width: 190, height: 40, opacity: 0.85 }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 6, height: 5, background: "#2a160a" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 30, height: 5, background: "#2a160a" }} />
        {[8, 38, 68, 98, 128, 158].map((l, i) => (
          <div key={l} style={{ position: "absolute", left: l, top: -6, width: 8, height: 54, borderRadius: 4, background: i % 2 ? "#8a5a2b" : "#a87038", border: "1px solid #3a2210" }} />
        ))}
      </div>
      {/* floor gloss and board lines */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: "45%", background: "linear-gradient(#fff3 0%, #0000 35%, #0004 100%), repeating-linear-gradient(0deg, #0000 0 38px, #0002 38px 40px)", clipPath: "polygon(0 12%,100% 12%,100% 100%,0 100%)" }} />
      <div style={{ position: "absolute", left: "50%", bottom: "7%", transform: "translateX(-50%)", width: 640, height: 70, borderRadius: "50%", border: "5px solid #7a1f1444", background: "radial-gradient(ellipse, #7a1f1422, #0000 70%)" }} />
      {/* students practicing */}
      {STUDENTS.map((st, i) => (
        <div key={i} style={{ position: "absolute", left: `${st.x}%`, bottom: st.row === 0 ? "38%" : "32%", transform: `translateX(-50%) scale(${st.row === 0 ? 0.42 : 0.55})`, transformOrigin: "50% 100%", opacity: st.row === 0 ? 0.85 : 1 }}>
          <div style={{ animation: phase === "result" && outcome !== "tie" ? `crowd 0.3s ease-in-out ${(i % 5) * 0.06}s 6` : "none" }}><Student color={st.color} belt={st.belt} delay={st.delay} move={st.move} /></div>
        </div>
      ))}
      {/* hanging banners */}
      {[12, 30, 70, 88].map((x) => (
        <div key={x} style={{ position: "absolute", left: `${x}%`, top: 0, width: 46, height: 150, background: "#7a1f14", borderBottom: "6px solid #f1c40f", clipPath: "polygon(0 0,100% 0,100% 100%,50% 88%,0 100%)", opacity: 0.9, backgroundImage: "linear-gradient(90deg, #fff2, #0000 30%, #0003), linear-gradient(#0000 20%, #f1c40f 20% 22%, #0000 22%)", color: "#f1c40f", textAlign: "center", fontSize: 26, paddingTop: 36 }}>{x < 50 ? "力" : x < 80 ? "道" : ""}</div>
      ))}
      {mode === "rescue" && phase !== "title" && phase !== "movie" && <RescueScenery i={level} />}
      {/* light shafts, dust motes, vignette */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "linear-gradient(105deg, #0000 10%, #ffe9a022 18%, #0000 26%), linear-gradient(255deg, #0000 10%, #ffe9a022 18%, #0000 26%), linear-gradient(100deg, #0000 40%, #ffd89a14 46%, #0000 54%)", mixBlendMode: "screen" }} />
      {Array.from({ length: 22 }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: `${(i * 37) % 100}%`, top: `${10 + ((i * 53) % 60)}%`, width: 3 + (i % 3), height: 3 + (i % 3), borderRadius: "50%", background: "#ffe9b0", opacity: 0.45, boxShadow: "0 0 6px #ffe9b0", pointerEvents: "none", animation: `mote ${6 + (i % 5)}s ease-in-out ${i * -0.7}s infinite` }} />
      ))}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", boxShadow: "inset 0 0 180px #000c, inset 0 0 40px #0008" }} />
      {slowmo && <div style={{ position: "absolute", inset: 0, backgroundImage: "repeating-linear-gradient(90deg, #fff1 0 3px, #0000 3px 40px)", backgroundSize: "200px 100%", animation: "lines 0.6s linear infinite" }} />}
      {slowmo && <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 200px #000" }} />}
      {mode !== "rescue" && <div aria-hidden="true" className="finished-dojo-backdrop"><CinematicDojo/></div>}
      <div className="cinematic-light" aria-hidden="true" />
      <div className="cinematic-floor" aria-hidden="true" />
      {phase !== "title" && <EnergyRibbons key={`energy-${flash}`} move={pick} active={phase === "reveal" || phase === "result"}/> }
      {flash > 0 && <div key={flash} style={{ position: "absolute", inset: 0, background: "#fff", animation: "flash 0.5s ease-out forwards" }} />}

      {phase !== "title" && (
        <>
          <div style={{ position: "absolute", top: 14, left: 24, right: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div><div style={{ fontSize: 22 }}>{prof.name || "YOU"}</div>{pips(score.p, "#27ae60")}</div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 14, opacity: 0.8, letterSpacing: 3 }}>{mode === "rescue" ? `RESCUE · ${(RESCUES[level] ?? RESCUES[0]!).dojo.toUpperCase()}` : mode === "tower" ? `TOWER · FLOOR ${level + 1}` : mode === "daily" ? `DAILY CHALLENGE · NO ${dailyBan().toUpperCase()}` : `MATCH ${level + 1} OF ${RIVALS.length}`}</div>
              <div style={{ fontSize: 26, color: "#f1c40f" }}>{rival.title}</div>
              {mode === "daily" && <div style={{ fontSize: 14 }}>Banned hand applies to both fighters.</div>}
            </div>
            <div style={{ textAlign: "right" }}><div style={{ fontSize: 22 }}>{rival.name.toUpperCase()}</div><div style={{ display: "flex", justifyContent: "flex-end" }}>{pips(score.r, "#e74c3c")}</div></div>
          </div>
          <div key={phase === "result" ? `r${flash}` : "calm"} style={{ position: "absolute", inset: 0, animation: phase === "result" && outcome ? "shake 0.45s linear 0.4s" : "none" }}>
          {phase === "result" && outcome && (
            <div key={`fx${flash}`} style={{ position: "absolute", left: "50%", bottom: "46%", width: 0, height: 0, zIndex: 20, pointerEvents: "none" }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: 360, height: 360, background: "conic-gradient(from 0deg, #f1c40f 0 6deg, #0000 6deg 18deg, #f1c40f 18deg 24deg, #0000 24deg 36deg, #fff 36deg 42deg, #0000 42deg 54deg, #f1c40f 54deg 60deg, #0000 60deg 72deg, #e74c3c 72deg 78deg, #0000 78deg 90deg)", backgroundSize: "100% 100%", WebkitMaskImage: "radial-gradient(circle, #000 25%, #0000 70%)", maskImage: "radial-gradient(circle, #000 25%, #0000 70%)", animation: "burst 0.6s ease-out 0.4s both" }} />
              {Array.from({ length: 16 }, (_, i) => {
                const a = (i / 16) * Math.PI * 2;
                const d = 120 + (i % 3) * 50;
                return <div key={i} style={{ position: "absolute", left: 0, top: 0, width: 10, height: 10, borderRadius: i % 2 ? 5 : 1, background: i % 3 === 0 ? "#fff" : i % 3 === 1 ? "#f1c40f" : "#e67e22", ["--dx" as string]: `${Math.cos(a) * d}px`, ["--dy" as string]: `${Math.sin(a) * d}px`, animation: `spark 0.7s ease-out ${0.4 + (i % 4) * 0.03}s both` }} />;
              })}
              <div style={{ position: "absolute", left: 0, top: 10, transform: "translateX(-50%)", whiteSpace: "nowrap", fontSize: 64, fontWeight: 900, fontStyle: "italic", color: outcome === "win" ? "#f1c40f" : outcome === "tie" ? "#ecf0f1" : "#e74c3c", WebkitTextStroke: "3px #000", textShadow: "4px 4px 0 #000", animation: "slam 0.35s ease-out 0.4s both" }}>
                {outcome === "tie" ? ["DOUBLE HIT!", "CLASH!", "BOTH DOWN!"][flash % 3] : outcome === "win" ? ["BAM!", "WHAM!", "POW!"][flash % 3] : ["OUCH!", "CRASH!", "THUD!"][flash % 3]}
              </div>
            </div>
          )}
          <div style={{ position: "absolute", left: "50%", bottom: "26%", transform: "translateX(-50%)", display: "flex", gap: 360, alignItems: "flex-end" }}>
            {mode === "rescue" && <div style={{ position: "absolute", left: "2%", bottom: "26%", transform: "scale(0.6)", transformOrigin: "bottom left", opacity: 0.95 }}><Fighter look={(RESCUES[level] ?? RESCUES[0]!).allyLook} color={(RESCUES[level] ?? RESCUES[0]!).allyColor} belt="#ecf0f1" move={null} state="idle" /></div>}
            <Fighter gi={prof.look.outfit === -1 ? equipGi : undefined} look={playerLook} color={(prof.look.outfit >= 0 ? OUTFIT_COLORS[prof.look.outfit] : equipGi?.color) ?? "#2471a3"} belt="#ecf0f1" band={equipBand?.color} aura={equipAura?.color} skin={prof.equip.skin} move={pick} fx={outcome === "lose" || outcome === "tie" ? rivalMove : null} state={pState} pump={phase === "choose"} />
            <Fighter look={rivalLook} color={rival.color} belt={rival.belt} move={rivalMove} flip fx={outcome === "win" || outcome === "tie" ? pick : null} pump={phase === "choose"} state={rState} />
          </div>
          </div>
          {peek && phase === "choose" && <div style={{ position: "absolute", left: "50%", top: "20%", transform: "translateX(-50%)", fontSize: 24, color: "#9be7ff", textShadow: "0 2px 0 #000" }}>👁 You peek: they will throw {MOVE_ICON[peek]}</div>}
          {emote && <div key={emote + String(flash)} style={{ position: "absolute", left: "calc(50% - 300px)", bottom: "calc(26% + 300px)", fontSize: 64, animation: "pop 0.3s ease-out", zIndex: 30 }}>{emote}</div>}
          <div className={compact ? "compact-hidden" : "desktop-tools"} style={{ position: "absolute", left: 14, bottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
            <button type="button" disabled={!canPeek} className="dojo-save" style={{ opacity: canPeek ? 1 : 0.4 }} onClick={doPeek}>👁 {peek !== null ? "PEEK REVEALED" : peekUsed ? `PEEK — ${peekPrice} COINS` : "PEEK — FREE (1)"}</button>
            <button type="button" disabled={guardUsed || (myLevel < 3 && prof.training.strength === 0)} className="dojo-save" style={{ opacity: guardUsed || (myLevel < 3 && prof.training.strength === 0) ? 0.4 : 1, background: guardArmed ? "#1e8449" : undefined }} onClick={doGuard}>{(myLevel < 3 && prof.training.strength === 0) ? "🛡 GUARD (Lv 3)" : guardArmed ? "🛡 GUARD ARMED" : `🛡 GUARD (${guardUsed ? 0 : 1})`}</button>
            <div style={{ display: "flex", gap: 6 }}>
              {EMOTES.map(([e, n]) => <button key={n} type="button" title={n} aria-label={n} className="dojo-save" onClick={() => doEmote(e)}>{e}</button>)}
            </div>
          </div>
          {(phase === "choose") && (
            <div style={{ position: "absolute", left: "50%", top: "28%", transform: "translateX(-50%)", fontSize: 56, letterSpacing: 6, color: "#f1c40f", textShadow: "0 3px 0 #000", opacity: 0.9 }}>
              {BEATS[Math.min(3, Math.floor(elapsed / beatMs))]}
              
            </div>
          )}
          {revealing && <div style={{ position: "absolute", left: "50%", top: "30%", transform: "translateX(-50%)", fontSize: 44, letterSpacing: 8, color: "#fff", textShadow: "0 3px 0 #000" }}>SHOOT!</div>}
          {phase === "result" && outcome && (
            <div style={{ position: "absolute", left: "50%", top: "26%", transform: "translateX(-50%)", fontSize: 72, fontWeight: 700, color: outcome === "win" ? "#2ecc71" : outcome === "lose" ? "#e74c3c" : "#f1c40f", textShadow: "0 4px 0 #000", animation: "pop 0.4s ease-out" }}>
              {outcome === "win" ? "POINT!" : outcome === "lose" ? "STRUCK!" : "DRAW — YOU BOTH TAKE IT!"}
            </div>
          )}
          {['choose','reveal','result'].includes(phase) && <div role="status" aria-label="Your chosen hand" style={{position:'absolute',left:'50%',bottom:142,transform:'translateX(-50%)',padding:'8px 16px',border:'2px solid #d6b260',borderRadius:8,background:'#100c09ee',color:pick?'#90efb6':'#ffdf90',fontSize:20,textAlign:'center',zIndex:35}}>{pick ? `${phase==='choose'?'SELECTED':'YOU THREW'}: ${pick.toUpperCase()} ${MOVE_ICON[pick]}` : phase==='choose'?'CHOOSE ROCK, PAPER OR SCISSORS':'NO HAND SELECTED'}</div>}
          <div className={compact ? "compact-hidden" : "desktop-moves"} style={{ position: "absolute", left: 0, right: 0, bottom: 24, display: "flex", justifyContent: "center", gap: 20 }}>
            {MOVES.map((m, i) => (
              <button key={m} type="button" aria-pressed={pick === m} disabled={phase !== "choose" || (mode === "daily" && m === dailyBan())} onClick={() => selectMove(m)}
                style={{ ...btn, opacity: phase === "choose" && !(mode === "daily" && m === dailyBan()) ? 1 : 0.35, background: pick === m ? "linear-gradient(#34d27b, #1e8449)" : btn.background, transform: pick === m ? "translateY(-8px) scale(1.06)" : "none", boxShadow: pick === m ? "0 0 22px #2ecc71aa, 0 4px 0 #0e4a28" : btn.boxShadow, transition: "transform 0.15s", width: 150 }}>
                <div style={{ fontSize: 44 }}>{MOVE_ICON[m]}</div>
                {m.toUpperCase()} <span style={{ opacity: 0.6, fontSize: 14 }}>[{i + 1}]</span>
              </button>
            ))}
          </div>
        </>
      )}

      {compact && activeRound && createPortal(<section className="unified-touch-controls" aria-label="Match controls">
        <div className="unified-touch-status" role="status">{phase === "choose" ? `${BEATS[Math.min(3,Math.floor(elapsed/beatMs))]} · ${pick ? `Selected ${pick}` : "Choose a hand"}` : phase === "result" ? outcome === "win" ? "POINT!" : outcome === "tie" ? "DRAW" : "STRUCK!" : "SHOOT!"}</div>
        <div className="unified-touch-tools"><button disabled={!canPeek || combatPaused} onClick={doPeek}>{peek ? `CPU: ${peek.toUpperCase()}` : peekUsed ? `PEEK ${peekPrice} coins` : "PEEK FREE"}</button><button disabled={combatPaused || guardUsed || (myLevel < 3 && prof.training.strength === 0)} onClick={doGuard}>{guardArmed ? "GUARD ARMED" : "GUARD"}</button></div>
        <div className="unified-touch-moves">{MOVES.map(m=><button key={m} aria-label={`Choose ${m}`} aria-pressed={pick===m} disabled={combatPaused || phase!=="choose" || (mode==="daily" && m===dailyBan())} onClick={()=>selectMove(m)}>{MOVE_ICON[m]} {m.toUpperCase()}</button>)}</div>
      </section>,document.body)}
      {phase === "title" && !academyOpen && !challengeOpen && !settingsOpen && !screen && !rescuePick && prof.lossTrainingPending === 0 && !trainingDue(prof) && prof.freeBoxes === 0 && createPortal(
        <section className="expansion-screen cinematic-main-menu" style={{zIndex:200}} aria-label="Dojo main menu"><div className="title-illustration"><CinematicDojo/></div><div className="native-title">
          <ThreeHandsCrest/>
          <p className="eyebrow">THE ORIGINAL THREE HANDS</p><h1>DOJO OF THE THREE HANDS</h1>
          <p className="intro-copy">Defeat four masters, first to three points each. Rock beats Scissors, Scissors beats Paper, Paper beats Rock. Choose during the countdown with the buttons or 1 / 2 / 3 (R / P / S). The CPU hand locks on your first choice or Peek. You can change your own hand without rerolling theirs. Both throw on SHOOT! No selection means you lose that round.</p>
          <div className="saved-fighter-identity"><div className="saved-fighter-standing" aria-label="Your saved custom character standing in the dojo">{myFig.avatar}</div><div className="profile-summary">{prof.name || 'Your character'} · Level {myLevel} · {prof.xp} XP · <Coin/> {prof.coins} coins · {prof.gems} diamonds · {RANKS[rankIndex(prof.rp)]!.name} ({prof.rp} RP) · Strength {prof.training.strength}</div></div>
          <div className="title-profile"><ProfileBar p={prof}/></div>
          <MenuRow onOpen={setScreen} />
          <div className="title-actions"><button onClick={() => setAcademyOpen(true)}>TRAINING HALL</button><button onClick={() => { sfx.gong(); begin("ladder", 0); }}>ENTER THE DOJO</button></div>
          <div className="title-actions">
            <button onClick={() => begin("tower",0)}>ENDLESS TOWER (best {prof.stats.tower})</button>
            <button onClick={() => setRescuePick(true)}>RESCUE DOJOS ({prof.stats.rescued}/{RESCUES.length})</button>
            <button disabled={prof.dailyDone === todayKey()} onClick={() => begin("daily",0)}>CLASSIC DAILY: NO {dailyBan().toUpperCase()}</button>
            <button onClick={() => setPhase("pots")}>TREE POT CHALLENGE — 3 MODES</button>
            <button onClick={() => setSettingsOpen(true)}>AUDIO SETTINGS</button>
          </div><p className="expansion-note">Progress and records are on this device. One free Peek per match; extra Peeks cost coins. Original Guard, loss training, mystery boxes and all game modes remain available.</p>
        </div></section>, document.body)}
      {academyOpen && <Suspense fallback={createPortal(<section className="expansion-screen" role="status">Loading Training Hall…</section>,document.body)}><AcademyHall p={prof} dispatch={dispatch} onExit={()=>setAcademyOpen(false)} onShop={()=>{setAcademyOpen(false);setScreen("shop");}} onSound={()=>sfx.gong()} fighter={master=>master==='self'?myFig.avatar:<Fighter look={MASTER_LOOKS.find(m=>m.name.endsWith(master))?.look} color={master==='Bao'?'#a52b27':'#317e96'} belt="#202020" move={null} state="idle"/>}/></Suspense>}
      {challengeOpen && <Suspense fallback={createPortal(<section className="expansion-screen" role="status">Loading Challenge Dojo…</section>,document.body)}><ChallengeDojo p={prof} dispatch={dispatch} onExit={() => setChallengeOpen(false)} fighter={(r, state) => r ? <Fighter look={(MASTER_LOOKS.find(m=>m.name===r.name)?.look ?? seededLook([...TOWER_POOL,...NEW_RIVALS].findIndex(t=>t.name===r.name)+20))} color={r.color} belt={r.belt} move={null} state={state} flip /> : <Fighter gi={prof.look.outfit === -1 ? equipGi : undefined} look={playerLook} color={myFig.color} belt="#ecf0f1" band={equipBand?.color} aura={equipAura?.color} skin={prof.equip.skin} move={null} state={state}/>} /></Suspense>}
      {settingsOpen && createPortal(<section className="expansion-screen" aria-label="Audio settings"><header className="expansion-header"><h1>AUDIO SETTINGS</h1><button onClick={()=>setSettingsOpen(false)}>BACK TO DOJO</button></header><div className="audio-settings"><p>Saved on this device. Music and sound effects have separate controls.</p>{([['music','Music'],['sfx','Sound effects']] as const).map(([key,label])=><label key={key}>{label}: {Math.round(prof.audio[key]*100)}%<input aria-label={`${label} volume`} type="range" min="0" max="1" step="0.05" value={prof.audio[key]} onChange={e=>dispatch({type:'dojo.send',message:{send:emit=>emit('audio',{...prof.audio,[key]:Number(e.target.value)})}})}/></label>)}</div></section>,document.body)}
      {phase === "pots" && <Suspense fallback={<section className="expansion-screen" role="status">Loading pot challenges…</section>}><TreePots avatar={myFig.avatar} best={prof.potBest} onSave={(mode,hits)=>dispatch({type:"dojo.send",message:{send:send=>send("potDone",{mode,hits})}})} onExit={()=>setPhase("title")} /></Suspense>}
      {phase === "finisher" && <FinisherScene item={findItem(prof.equip.finisher)!} avatar={myFig.avatar} onDone={() => setPhase(cut.kind === "lose" ? "loserTraining" : cut.next)} />}
      <Suspense fallback={<section className="expansion-screen" role="status">Loading strength training…</section>}>
      {phase === "loserTraining" && <TrainingGame skinColor={myFig.skin} sleeveColor={myFig.color} strength={prof.training.strength} fighterName={prof.name || "Your fighter"} avatar={myFig.avatar} onDone={hits => {
        dispatch({ type: "dojo.send", message: { send: send => send("lossTrainingDone", { hits }) } });
        setPhase(trainingNext);
      }} />}
      {prof.lossTrainingPending > 0 && phase === "title" && <TrainingGame skinColor={myFig.skin} sleeveColor={myFig.color} key={`pending-${prof.lossTrainingPending}`} strength={prof.training.strength} avatar={myFig.avatar} fighterName={prof.name || "Your fighter"} onDone={hits => dispatch({ type: "dojo.send", message: { send: send => send("lossTrainingDone", { hits }) } })} />}
      {trainingDue(prof) && prof.lossTrainingPending === 0 && phase === "title" && <TrainingGame skinColor={myFig.skin} sleeveColor={myFig.color} strength={prof.training.strength} avatar={myFig.avatar} onDone={hits => dispatch({ type: "dojo.send", message: { send: send => send("trainingDone", { hits }) } })} />}
      </Suspense>
      <Suspense fallback={<section className="expansion-screen" role="status">Loading cutscene…</section>}>
      {phase === "cutscene" && mode === "rescue" && cut.kind !== "champion" && <RescueMovie k={level} kind={cut.kind} me={myFig} color={rival.color} belt={rival.belt} onDone={finishCutscene} />}
      {phase === "cutscene" && !(mode === "rescue" && cut.kind !== "champion") && <CutScene me={myFig} kind={cut.kind} dojo={mode==='ladder'?level:Math.max(0,cinematicOpponentIndex(rival.name))} color={rival.color} belt={rival.belt} onDone={finishCutscene} />}
      {phase === "movie" && mode === "rescue" && <RescueMovie k={level} kind="intro" me={myFig} color={rival.color} belt={rival.belt} onDone={() => beginIntro(level)} />}
      {phase === "movie" && mode !== "rescue" && <DojoMovie me={myFig} dojo={level} color={rival.color} belt={rival.belt} onDone={() => beginIntro(level)} />}
      </Suspense>
      {phase === "intro" && (
        <div style={{ ...overlay, background: "#000a", pointerEvents: "none" }}>
          <div style={{ fontSize: 18, letterSpacing: 4, color: "#f1c40f" }}>{mode === "rescue" ? `SAVE THE ${(RESCUES[level] ?? RESCUES[0]!).dojo.toUpperCase()}` : mode === "tower" ? `FLOOR ${level + 1}` : mode === "daily" ? "DAILY CHALLENGE" : `MATCH ${level + 1}`}: {rival.title.toUpperCase()}</div>
          <div style={{ fontSize: 48 }}>{rival.name}</div>
          <div style={{ fontSize: 22, fontStyle: "italic" }}>“{rival.intro}”</div>
          <div style={{ fontSize: 16, opacity: 0.8 }}>{rival.blurb}</div>
        </div>
      )}
      {phase === "matchEnd" && (
        <div style={overlay}>
          <div style={{ fontSize: 56, color: lost ? "#e74c3c" : "#2ecc71" }}>{lost ? "DEFEATED" : "VICTORY"}</div>
          <div style={{ fontSize: 22 }}>{lost ? `${rival.name} wins ${score.r}–${score.p}.` : `You defeated ${rival.name} ${score.p}–${score.r}!`}</div>
          <div style={{ display: "flex", gap: 16 }}>
            {mode !== "ladder" ? (
              !lost && mode === "tower" ? (
                <button type="button" style={btn} onClick={() => startMatch(level + 1)}>NEXT FLOOR ({level + 2})</button>
              ) : mode === "rescue" && lost ? (
                <button type="button" style={btn} onClick={() => startMatch(level, true)}>DEFEND AGAIN</button>
              ) : (
                <button type="button" style={btn} onClick={() => setPhase("title")}>BACK TO TITLE</button>
              )
            ) : lost ? (
              <>
                <button type="button" style={btn} onClick={() => startMatch(level, true)}>RETRY MATCH</button>
                <button type="button" style={btn} onClick={() => begin("ladder", 0)}>RESTART LADDER</button>
              </>
            ) : (
              <button type="button" style={btn} onClick={() => startMatch(level + 1)}>NEXT CHALLENGER</button>
            )}
          </div>
        </div>
      )}
      {phase === "champion" && (
        <div style={overlay}>
          <div style={{ fontSize: 70 }}>🏆</div>
          <div style={{ fontSize: 52, color: "#f1c40f" }}>DOJO CHAMPION</div>
          <div style={{ fontSize: 22 }}>You mastered the Three Hands.</div>
          <div style={{ fontSize: 18 }}>Rounds played: {stats.rounds} · Rounds won: {stats.wins} · Win rate: {stats.rounds ? Math.round((100 * stats.wins) / stats.rounds) : 0}%</div>
          <button type="button" style={btn} onClick={() => begin("ladder", 0)}>PLAY AGAIN</button>
        </div>
      )}
      {rescuePick && phase === "title" && createPortal(
        <div className="expansion-screen" style={{ position: "fixed", inset: 0, zIndex: 450, overflowY: "auto", background: "#10201cf5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <div style={{ fontSize: 30, color: "#f1c40f" }}>Dojos in danger</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%,280px), 1fr))", width: "100%", maxWidth: 1000, gap: 10 }}>
            {RESCUES.map((m, i) => {
              const open = i <= prof.stats.rescued;
              return (
                <button key={m.dojo} type="button" disabled={!open} className="dojo-save" style={{ opacity: open ? 1 : 0.4, textAlign: "left", padding: 10, fontSize: 14 }} onClick={() => { setRescuePick(false); sfx.gong(); begin("rescue", i); }}>
                  <b>{open ? m.dojo : "🔒 " + m.dojo}</b> {i < prof.stats.rescued ? "✓ saved" : ""}<br />
                  {m.ally} vs {(TOWER_POOL[m.invader] as Rival).name}<br />
                  <span style={{ opacity: 0.8 }}>{open ? m.story : "Save the previous dojo first."}</span>
                </button>
              );
            })}
          </div>
          <button type="button" className="dojo-save" onClick={() => setRescuePick(false)}>BACK</button>
        </div>, document.body
      )}
      {['intro','choose','reveal','result'].includes(phase)&&<button type="button" className="dojo-save" style={{position:'absolute',right:14,top:86,zIndex:80}} onClick={pauseCombat}>PAUSE MATCH</button>}
      {combatPaused&&createPortal(<section className="expansion-screen" style={{zIndex:850}} aria-label="Match paused"><h1>MATCH PAUSED</h1><p>Your remaining choice time and pending round transitions are paused.</p><button onClick={resumeCombat}>RESUME MATCH</button></section>,document.body)}
      <button type="button" aria-label="Toggle music" className="dojo-save" style={{ position: "absolute", right: 14, bottom: 14, zIndex: 70 }} onClick={() => setMuted(m => !m)}>{muted ? "🔇" : "🔊"}</button>
      {screen === "create" && (
        <CreatorPanel p={prof} dispatch={dispatch} onClose={() => setScreen(null)} preview={(look) => (
          <Fighter gi={look.outfit === -1 ? equipGi : undefined} look={look.outfit === -1 && equipGi?.pattern !== undefined ? {...look,pattern:equipGi.pattern} : look} color={(look.outfit >= 0 ? OUTFIT_COLORS[look.outfit] : equipGi?.color) ?? "#2471a3"} belt="#ecf0f1" band={equipBand?.color} aura={equipAura?.color} skin={prof.equip.skin} move={null} state="idle" />
        )} />
      )}
      {screen === "shop" && <ShopPanel avatar={myFig.avatar} p={prof} dispatch={dispatch} onClose={() => setScreen(null)} />}
      {screen === "trophies" && <TrophiesPanel p={prof} onClose={() => setScreen(null)} />}
      {screen === "ranks" && <RanksPanel avatar={myFig.avatar} p={prof} boardData={boardData} boardId={boardId} dispatch={dispatch} onClose={() => setScreen(null)} />}
      {prof.freeBoxes > 0 && !showNotice && !screen && (phase === "matchEnd" || phase === "champion" || phase === "title") && (
        <div role="dialog" aria-modal="true" aria-label="Free victory mystery box" style={{ position: "absolute", inset: 0, zIndex: 180, background: "#130c20ee", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, color: "#fff6dc", pointerEvents: "auto", fontFamily: "Georgia, serif" }}>
          <div style={{ fontSize: 80 }}>🎁</div><h2>Victory Mystery Box!</h2>
          <div>You have {prof.freeBoxes} free box{prof.freeBoxes === 1 ? "" : "es"}. No coins or gems needed.</div>
          <button type="button" style={btn} onClick={() => dispatch({ type: "dojo.send", message: openBoxMsg({ currency: "free" }) })}>OPEN FREE BOX</button>
        </div>
      )}
      {showNotice && (!screen || (screen === "shop" && prof.last.box !== "")) && (phase === "title" || phase === "matchEnd" || phase === "champion") && (
        <RewardPopup p={prof} onClose={() => dispatch({ type: "dojo.send", message: dismissNoticeMsg({ n: prof.last.n }) })} />
      )}
    </div>
    </div>
  );
}