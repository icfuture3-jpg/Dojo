import { Coin, OutfitArt } from "./catalog-art";
import { Pattern } from "./lookart";
import { ShopUpgrades } from "./shop-upgrades";
import { createPortal } from "react-dom";
import "./expansion.css";
import { FinisherScene } from "./finishers";
import { TrophyArt } from "./trophy-art";
import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import {
  boxOdds,
  BOX_COST,
  BOX_GEM_COST,
  ITEMS,
  RANKS,
  TROPHIES,
  findItem,
  levelInfo,
  rankIndex,
  type Item,
  type Profile,
  type Slot,
} from "./economy";
import { MASTER_LOOKS, BODY_NAMES, EYE_COLORS, EYE_NAMES, HAIR_COLORS, HAIR_COLOR_NAMES, HAIR_NAMES, HEAD_NAMES, LOOK_COUNTS, OUTFIT_COLORS, OUTFIT_COLOR_NAMES, OUTFIT_COUNT, PATTERN_NAMES, SKINS, patternMinLevel, type Look } from "./look";
import { type DojoEvent, setLookMsg, buyItemMsg, equipItemMsg, openBoxMsg, refreshBoardMsg, setNameMsg } from "./net";

export type Screen = "create" | "shop" | "trophies" | "ranks";

const GOLD = "#f1c40f";
const RARITY_COLOR = { common: "#bdc3c7", rare: "#5dade2", epic: "#a569bd", legendary: "#f39c12" };
const serif = "Georgia, serif";

export const menuButton: CSSProperties = {
  pointerEvents: "auto",
  cursor: "pointer",
  border: `3px solid ${GOLD}`,
  background: "#7a1f14",
  color: "#fff6dc",
  fontFamily: serif,
  fontSize: 20,
  padding: "8px 20px",
  borderRadius: 6,
  letterSpacing: 1,
};
const small: CSSProperties = { ...menuButton, fontSize: 15, padding: "5px 12px", borderWidth: 2 };
const disabledBtn: CSSProperties = { ...small, opacity: 0.45, cursor: "default" };

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div style={{ height: 10, borderRadius: 5, background: "#0007", border: "1px solid #fff4", overflow: "hidden", minWidth: 80 }}>
      <div style={{ width: `${Math.min(100, (100 * value) / Math.max(1, max))}%`, height: "100%", background: color }} />
    </div>
  );
}

export function ProfileBar({ p }: { p: Profile }) {
  const lv = levelInfo(p.xp);
  const rank = RANKS[rankIndex(p.rp)] ?? RANKS[0];
  return (
    <div style={{ display: "flex", gap: 18, alignItems: "center", background: "#000a", border: `2px solid ${GOLD}`, borderRadius: 10, padding: "8px 16px", fontFamily: serif, color: "#fff6dc" }}>
      <div style={{ width: 150 }}>
        <div style={{ fontSize: 15 }}>LEVEL {lv.level}</div>
        <Bar value={lv.into} max={lv.need} color="#2ecc71" />
        <div style={{ fontSize: 11, opacity: 0.7 }}>{lv.into}/{lv.need} XP</div>
      </div>
      <div style={{ fontSize: 20 }}><Coin/> {p.coins}</div>
      <div style={{ fontSize: 20 }}>💎 {p.gems}</div>
      <div style={{ fontSize: 16, color: rank?.color }}>◆ {rank?.name} <span style={{ opacity: 0.7, fontSize: 13 }}>({p.rp} RP)</span></div>
    </div>
  );
}

export function MenuRow({ onOpen }: { onOpen(screen: Screen): void }) {
  const entries: [Screen, string][] = [
    ["create", "🎨 CREATE"],
    ["shop", "🛍 SHOP"],
    ["trophies", "🏆 TROPHIES"],
    ["ranks", "◆ RANKS"],
  ];
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
      {entries.map(([id, label]) => (
        <button key={id} type="button" style={menuButton} onClick={() => onOpen(id)}>
          {label}
        </button>
      ))}
    </div>
  );
}

function Frame({ title, onClose, p, children }: { title: string; onClose(): void; p: Profile; children: React.ReactNode }) {
  const content = (
    <div className={`expansion-screen legacy-panel${title === "Dojo Shop" ? " shop-frame" : ""}`} style={{ position: "fixed", inset: 0, zIndex: 500, background: "#140c06f2", color: "#fff6dc", fontFamily: serif, pointerEvents: "auto", display: "flex", flexDirection: "column", padding: "18px 40px", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
        <div style={{ fontSize: 34, color: GOLD }}>{title}</div>
        <ProfileBar p={p} />
        <button type="button" style={menuButton} onClick={onClose}>✕ BACK</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", paddingRight: 8 }}>{children}</div>
    </div>
  );
  return typeof document === 'undefined' ? content : createPortal(content, document.body);
}

const SLOT_TABS: { id: Slot | "upgrades" | "boxes"; label: string }[] = [
  { id: "gi", label: "Outfits" },
  { id: "band", label: "Headbands" },
  { id: "aura", label: "Auras" },
  { id: "finisher", label: "Finishers" },
  { id: "skin", label: "Skins" },
  { id: "upgrades", label: "Upgrades" },
  { id: "boxes", label: "Mystery boxes" },
];

export function OniWarriorArt() {
  return <svg role="img" aria-label="Red Oni warrior" width="60" height="60" viewBox="0 0 80 80">
    <path d="M12 78V64Q15 53 40 53Q65 53 68 64V78Z" fill="#292536" stroke="#f3c65b" strokeWidth="2" />
    <path d="M28 55L40 68L52 55M18 72H62" fill="none" stroke="#d2a144" strokeWidth="4" />
    <path d="M22 24L17 5L32 20M48 20L63 5L58 26" fill="#fff0cc" stroke="#aa884f" strokeWidth="2" />
    <path d="M21 24Q40 13 59 24V43Q58 59 40 62Q22 59 21 43Z" fill="#c93636" stroke="#6b161c" strokeWidth="2" />
    <path d="M22 24Q40 10 58 24L53 17L45 15L39 18L32 14Z" fill="#211c24" />
    <path d="M24 27H56V33H24Z" fill="#e1b64f" />
    <path d="M27 36L35 39M53 36L45 39" stroke="#fff2ca" strokeWidth="4" strokeLinecap="round" />
    <path d="M29 33L36 36M51 33L44 36" stroke="#391f29" strokeWidth="3" />
    <path d="M40 38L36 46H43" fill="none" stroke="#8c2027" strokeWidth="2" />
    <path d="M29 49Q40 55 51 49L48 57H32Z" fill="#481c25" />
    <path d="M31 50L34 56L37 52M43 52L46 56L49 50" fill="#fff3d5" />
  </svg>;
}

function ItemCard({ it, p, dispatch, onPreview }: { it: Item; p: Profile; dispatch(e: DojoEvent): void; onPreview?(it: Item): void }) {
  const owned = p.owned.includes(it.id);
  const equipped = p.equip[it.slot] === it.id;
  const level = levelInfo(p.xp).level;
  const rIdx = rankIndex(p.rp);
  const rankLocked = rIdx < it.minRank;
  const locked = level < it.minLevel || rankLocked;
  const affordable = p.coins >= it.coins && p.gems >= it.gems;
  const price = it.gems > 0 ? <span>💎 {it.gems}</span> : it.coins > 0 ? <span className="catalog-price"><Coin size={20}/> {it.coins}</span> : "Free";
  return (
    <div className={it.slot === "gi" ? "outfit-shop-card" : undefined} style={{ width: 190, padding: 10, borderRadius: 8, background: "#2a1a0e", border: `2px solid ${equipped ? "#2ecc71" : RARITY_COLOR[it.rarity]}`, display: "flex", flexDirection: "column", gap: 6, alignItems: "center" }}>
      <div className={it.slot === "gi" ? "outfit-frame" : undefined} style={{ width: 64, height: 64, borderRadius: it.slot === "aura" ? 32 : 10, background: it.slot === "aura" ? `radial-gradient(${it.color}, #0000 70%)` : it.color, border: "2px solid #fff6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30 }}>
        {it.slot === "finisher" ? <span style={{fontSize:22,fontWeight:700}}>{Number(it.id.split("-")[1])+1}</span> : it.slot === "gi" ? <OutfitArt item={it}/> : it.slot === "skin" ? (it.id === "skin-ninja" ? "🥷" : it.id === "skin-oni" ? <OniWarriorArt /> : it.id === "skin-panda" ? "🐼" : "🥋") : ""}
      </div>
      <div style={{ fontSize: 15, textAlign: "center" }}>{it.name}</div>
      <div style={{ fontSize: 11, letterSpacing: 2, color: RARITY_COLOR[it.rarity] }}>{it.rarity.toUpperCase()}</div>
      {it.slot === "finisher" && <button type="button" style={small} onClick={() => onPreview?.(it)}>PREVIEW MOVE</button>}
      {owned ? (
        <button type="button" disabled={equipped} style={equipped ? { ...small, background: "#1e8449" } : small} onClick={() => dispatch({ type: "dojo.send", message: equipItemMsg({ id: it.id }) })}>
          {equipped ? "EQUIPPED" : "EQUIP"}
        </button>
      ) : locked ? (
        <div style={{ ...disabledBtn, background: "#333", border: "2px solid #666" }}>{rankLocked ? `🔒 ${RANKS[it.minRank]?.name} rank` : `🔒 Level ${it.minLevel}`}</div>
      ) : (
        <button type="button" disabled={!affordable} style={affordable ? small : disabledBtn} onClick={() => dispatch({ type: "dojo.send", message: buyItemMsg({ id: it.id }) })}>
          BUY {price}
        </button>
      )}
    </div>
  );
}

export function ShopPanel({ p, dispatch, onClose, avatar }: { p: Profile; dispatch(e: DojoEvent): void; onClose(): void; avatar?: React.ReactNode }) {
  const [preview, setPreview] = useState<Item | null>(null);
  const [tab, setTab] = useState<(typeof SLOT_TABS)[number]["id"]>("gi");
  return (
    <Frame title="Dojo Shop" onClose={onClose} p={p}>
      {avatar && <div className="saved-fighter-shop" aria-label="Your saved character wearing the equipped outfit"><div className="saved-fighter-mini">{avatar}</div><p>Your saved character · Equipped appearance</p></div>}
      {preview && <FinisherScene item={preview} avatar={avatar} onDone={() => setPreview(null)} />}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {SLOT_TABS.map((t) => (
          <button key={t.id} type="button" style={{ ...small, background: tab === t.id ? "#c0392b" : "#3a2210" }} onClick={() => setTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {tab === "upgrades" ? (
        <ShopUpgrades p={p} dispatch={dispatch} />
      ) : tab === "boxes" ? (
        <div style={{ display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: 240, textAlign: "center", background: "#2a1a0e", padding: 18, borderRadius: 10, border: "2px solid #a569bd" }}>
            <div style={{ fontSize: 72 }}>🎁</div>
            <div style={{ fontSize: 20 }}>Mystery Box</div>
            <div style={{ fontSize: 13, opacity: 0.75, margin: "6px 0 10px" }}>A random outfit, headband, aura or finisher. Duplicates refund coins.</div>
            {p.freeBoxes > 0 && <button type="button" style={small} onClick={() => dispatch({ type: "dojo.send", message: openBoxMsg({ currency: "free" }) })}>OPEN FREE BOX ({p.freeBoxes})</button>}
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button type="button" disabled={p.coins < BOX_COST} style={p.coins >= BOX_COST ? small : disabledBtn} onClick={() => dispatch({ type: "dojo.send", message: openBoxMsg({ currency: "coins" }) })}><Coin/> {BOX_COST}</button>
              <button type="button" disabled={p.gems < BOX_GEM_COST} style={p.gems >= BOX_GEM_COST ? small : disabledBtn} onClick={() => dispatch({ type: "dojo.send", message: openBoxMsg({ currency: "gems" }) })}>💎 {BOX_GEM_COST}</button>
            </div>
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.8 }}>
            Current rank odds: {Object.entries(boxOdds(p.rp)).map(([rarity, chance]) => `${rarity}: ${chance.toFixed(1)}%`).join(" · ")}. Items above your rank cannot drop.
            <br />
            You have opened {p.stats.boxes} boxes. Free victory boxes: {p.freeBoxes}.
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {ITEMS.filter((i) => i.slot === tab).map((it) => (
            <ItemCard key={it.id} it={it} p={p} dispatch={dispatch} onPreview={setPreview} />
          ))}
        </div>
      )}
    </Frame>
  );
}

export function TrophiesPanel({ p, onClose }: { p: Profile; onClose(): void }) {
  return (
    <Frame title={`Trophies ${p.trophies.length}/${TROPHIES.length}`} onClose={onClose} p={p}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        {TROPHIES.map((tr) => {
          const got = p.trophies.includes(tr.id);
          return (
            <div key={tr.id} style={{ width: 250, padding: 12, borderRadius: 8, background: got ? "#3a2a08" : "#1d140c", border: `2px solid ${got ? GOLD : "#4a3a2a"}`, opacity: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <TrophyArt name={tr.name} id={tr.id} />
                <div><div style={{ fontSize: 18, color: got ? GOLD : "#fff6dc" }}>{tr.name}</div>
                <div style={{ fontSize: 12, color: got ? "#82e0aa" : "#c4b69d", marginTop: 4 }}>{got ? "✓ EARNED" : "NOT EARNED YET"}</div></div>
              </div>
              <div style={{ fontSize: 13, opacity: 0.8 }}>{tr.blurb}</div>
              <div style={{ fontSize: 13, marginTop: 4 }}><Coin size={18}/> {tr.reward.coins}{tr.reward.gems ? ` 💎 ${tr.reward.gems}` : ""}</div>
            </div>
          );
        })}
      </div>
    </Frame>
  );
}

interface BoardRow { id: string; name: string; rp: number; wins: number }
export function RanksPanel({ p, boardData, boardId, dispatch, onClose, avatar }: { avatar?: React.ReactNode; p: Profile; boardData: string; boardId: string; dispatch(e: DojoEvent): void; onClose(): void }) {
  const [draft, setDraft] = useState(p.name);
  useEffect(() => { dispatch({ type: "dojo.send", message: refreshBoardMsg({ at: Date.now() }) }); }, [dispatch]);
  let standings: BoardRow[] = [];
  try { standings = JSON.parse(boardData || "[]") as BoardRow[]; } catch { standings = []; }
  const idx = rankIndex(p.rp);
  const next = RANKS[idx + 1];
  return (
    <Frame title="Ranks and local record" onClose={onClose} p={p}>
      {avatar && <div className="saved-fighter-shop"><div className="saved-fighter-mini">{avatar}</div><p>{p.name || "Your saved character"} · On this device</p></div>}
      <div style={{ display: "flex", gap: 30, flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ fontSize: 14, opacity: 0.75, marginBottom: 10 }}>Win matches to earn rank points; a loss costs a few. Seasons last a month: rank rewards are paid when a season ends and points are halved.</div>
          {RANKS.map((r, i) => (
            <div key={r.name} style={{ display: "flex", justifyContent: "space-between", padding: "8px 14px", marginBottom: 6, borderRadius: 8, background: i === idx ? "#3a2a08" : "#2a1a0e", border: `2px solid ${i === idx ? r.color : "#4a3a2a"}`, color: r.color, opacity: i <= idx ? 1 : 0.55 }}>
              <span style={{ fontSize: 20 }}>◆ {r.name}</span>
              <span style={{ fontSize: 14 }}>{r.at} RP{i > 0 ? <> · season reward <Coin size={16}/> {100*i} 💎{4*i}</> : ""}</span>
            </div>
          ))}
          {next && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 13 }}>{next.at - p.rp} RP to {next.name}</div>
              <Bar value={p.rp - (RANKS[idx]?.at ?? 0)} max={next.at - (RANKS[idx]?.at ?? 0)} color={next.color} />
            </div>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 320 }}>
          <div style={{ fontSize: 22, color: GOLD, marginBottom: 8 }}>Top fighters</div>
          {standings.length === 0 && <div style={{ opacity: 0.7 }}>No one on the board yet. Win a match to claim the first spot.</div>}
          {standings.map((s, i) => (
            <div key={s.id} style={{ display: "flex", gap: 12, padding: "6px 12px", marginBottom: 4, borderRadius: 6, background: s.id === boardId ? "#3a2a08" : "#2a1a0e", border: `2px solid ${s.id === boardId ? GOLD : "#4a3a2a"}` }}>
              <span style={{ width: 28 }}>#{i + 1}</span>
              <span style={{ flex: 1 }}>{s.name}{s.id === boardId ? " (you)" : ""}</span>
              <span style={{ color: RANKS[rankIndex(s.rp)]?.color }}>{s.rp} RP</span>
              <span style={{ opacity: 0.7 }}>{s.wins} wins</span>
            </div>
          ))}
          <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 14, opacity: 0.8, marginBottom: 6 }}>Your name on this device (progress saves in this browser):</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={draft} maxLength={14} placeholder="Fighter name" onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.stopPropagation()} style={{ pointerEvents: "auto", flex: 1, fontFamily: serif, fontSize: 18, padding: "6px 10px", borderRadius: 6, border: `2px solid ${GOLD}`, background: "#1a0e07", color: "#fff6dc" }} />
              <button type="button" className="dojo-save" onClick={() => dispatch({ type: "dojo.send", message: setNameMsg({ name: draft }) })}>SAVE NAME</button>
            </div>
            <div style={{ fontSize: 12, opacity: 0.6, marginTop: 6 }}>You appear once you have rank points. Guests are listed for this visit; signed-in players keep their place.</div>
          </div>
        </div>
      </div>
    </Frame>
  );
}

export function RewardPopup({ p, onClose }: { p: Profile; onClose(): void }) {
  const box = p.last.box ? findItem(p.last.box) : undefined;
  const content = (
    <div style={{ position: "fixed", inset: 0, zIndex: 600, overflowY: "auto", padding: 12, background: "#000b", display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "auto", fontFamily: serif, color: "#fff6dc" }}>
      <div style={{ minWidth: 0, width: "min(100%,560px)", maxHeight: "90dvh", overflowY: "auto", background: "#2a1a0e", border: `4px solid ${GOLD}`, borderRadius: 12, padding: "22px 30px", textAlign: "center", display: "flex", flexDirection: "column", gap: 8, animation: "pop 0.35s ease-out" }}>
        <div style={{ fontSize: 32, color: GOLD }}>{p.last.title}</div>
        {box && <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          {box.slot === "gi" ? <OutfitArt item={box}/> : <svg role="img" aria-label={`${box.name} prize`} width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="46" fill="#151323" stroke={RARITY_COLOR[box.rarity]} strokeWidth="3" />
            {box.slot === "band" ? <><path d="M14 35Q50 25 86 35V53Q50 43 14 53Z" fill={box.color}/><path d="M62 45L88 75L68 72L49 47" fill={box.color}/></> : box.slot === "aura" ? <>{[35,25,15].map(r=><circle key={r} cx="50" cy="50" r={r} fill="none" stroke={box.color} strokeWidth="6" opacity={1-r/50}/>)}</> : box.slot === "skin" && box.id === "skin-oni" ? <g transform="translate(10 10)"><OniWarriorArt/></g> : <path d="M50 18L59 39L82 42L65 58L69 81L50 69L31 81L35 58L18 42L41 39Z" fill={box.color} stroke="#fff8" strokeWidth="2"/>}
          </svg>}
          <strong style={{fontSize:24}}>{box.name}</strong>
          <span style={{color:RARITY_COLOR[box.rarity],fontSize:14}}>{box.rarity.toUpperCase()} · {p.last.lines.some(l=>l.startsWith('Duplicate')) ? "DUPLICATE — COINS REFUNDED" : "ADDED TO YOUR COLLECTION"}</span>
        </div>}
        {p.last.lines.map((l, i) => (
          <div key={i} style={{ fontSize: /LEVEL UP|TROPHY|RANK UP|MISSION|SEASON/.test(l) ? 19 : 16, color: /LEVEL UP|RANK UP/.test(l) ? "#2ecc71" : /TROPHY/.test(l) ? GOLD : /MISSION/.test(l) ? "#5dade2" : "#fff6dc" }}>
            {/TROPHY/.test(l) ? "🏆 " : ""}{l}
          </div>
        ))}
        <div aria-label="Current balance" style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${GOLD}`, fontSize: 16 }}>
          <div>Already added to your balance</div>
          <strong>{`${p.coins} coins · ${p.gems} gems · ${p.xp} XP`}</strong>
          <div style={{ fontSize: 13, marginTop: 6 }}>NICE! closes this notice; it does not claim another reward.</div>
        </div>
        <button type="button" style={{ ...menuButton, marginTop: 10 }} onClick={onClose}>NICE!</button>
      </div>
    </div>
  );
  return typeof document === 'undefined' ? content : createPortal(content, document.body);
}

const LOOK_TABS: { id: keyof Look; label: string }[] = [
  { id: "body", label: "Character" },
  { id: "head", label: "Head" },
  { id: "hair", label: "Hair style" },
  { id: "hairColor", label: "Hair colour" },
  { id: "eye", label: "Eye shape" },
  { id: "eyeColor", label: "Eye colour" },
  { id: "skin", label: "Skin" },
  { id: "pattern", label: "Outfit style" },
  { id: "outfit", label: "Outfit colour" },
];

const NAMES: Partial<Record<keyof Look, string[]>> = { body: BODY_NAMES, head: HEAD_NAMES, hair: HAIR_NAMES, eye: EYE_NAMES, pattern: PATTERN_NAMES };
const SWATCHES: Partial<Record<keyof Look, string[]>> = { hairColor: HAIR_COLORS, eyeColor: EYE_COLORS, skin: SKINS, outfit: OUTFIT_COLORS };

export function CreatorPanel({ p, dispatch, onClose, preview }: { p: Profile; dispatch(e: DojoEvent): void; onClose(): void; preview(look: Look): React.ReactNode }) {
  const [tab, setTab] = useState<keyof Look>("body");
  const [look, setLook] = useState<Look>(p.look);
  const level = levelInfo(p.xp).level;
  const choose = (k: keyof Look, v: number) => {
    const next = { ...look, [k]: v };
    // A creator pattern must not be hidden by the equipped shop gi design.
    if(k === 'pattern' && look.outfit === -1) next.outfit = Math.max(0,OUTFIT_COLORS.indexOf(findItem(p.equip.gi)?.color ?? ''));
    setLook(next);

  };
  const randomize = () => {
    const pick = (n: number) => Math.floor(Math.random() * n);
    const unlocked = PATTERN_NAMES.map((_, i) => i).filter((i) => patternMinLevel(i) <= level);
    const next: Look = {
      body: pick(LOOK_COUNTS.body), head: pick(LOOK_COUNTS.head), hair: pick(LOOK_COUNTS.hair), hairColor: pick(LOOK_COUNTS.hairColor), eye: pick(LOOK_COUNTS.eye),
      eyeColor: pick(LOOK_COUNTS.eyeColor), skin: pick(LOOK_COUNTS.skin), pattern: unlocked[pick(unlocked.length)] ?? 0, outfit: pick(LOOK_COUNTS.outfit),
    };
    setLook(next);

  };
  const names = NAMES[tab];
  const sw = SWATCHES[tab];
  const total = LOOK_COUNTS.head * LOOK_COUNTS.hair * LOOK_COUNTS.eye;
  return (
    <Frame title="Create your fighter" onClose={onClose} p={p}>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div className="creator-try-on" style={{ width: 230, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
          <div style={{ transform: "scale(0.85)", transformOrigin: "top center", height: 270 }}>{preview(look)}</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button type="button" style={small} onClick={()=>dispatch({type:'dojo.send',message:setLookMsg(look)})}>APPLY LOOK</button><button type="button" style={small} onClick={()=>setLook(p.look)}>CANCEL CHANGES</button></div>
          <button type="button" style={small} onClick={randomize}>🎲 SURPRISE ME</button>
          <div style={{ fontSize: 12, opacity: 0.7, textAlign: "center" }}>
            {OUTFIT_COUNT} outfits · {LOOK_COUNTS.hair} hairstyles · {LOOK_COUNTS.hairColor} hair colours · {LOOK_COUNTS.eye} eye shapes · {LOOK_COUNTS.eyeColor} eye colours · {LOOK_COUNTS.head} head shapes · {total.toLocaleString()}+ faces
          </div>
        </div>
        <div style={{ flex: 1, minWidth: 300 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
            {LOOK_TABS.map((t) => (
              <button key={t.id} type="button" style={{ ...small, background: tab === t.id ? "#c0392b" : "#3a2210" }} onClick={() => setTab(t.id)}>{t.label}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 14, opacity: 0.8 }}>Master looks (beat them to unlock):</span>
            {MASTER_LOOKS.map((m, i) => {
              const open = p.beaten.includes(i);
              return (
                <button key={m.name} type="button" disabled={!open} style={open ? small : disabledBtn} onClick={() => { const next = { ...m.look, pattern: patternMinLevel(m.look.pattern) <= level ? m.look.pattern : 0 }; setLook(next); }}>
                  {open ? m.name : `🔒 ${m.name}`}
                </button>
              );
            })}
          </div>
          <div className={tab === "pattern" ? "creator-pattern-grid" : undefined} style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {tab === "outfit" && (
              <button type="button" style={{ ...small, background: look.outfit === -1 ? "#1e8449" : "#3a2210" }} onClick={() => choose("outfit", -1)}>Shop gi</button>
            )}
            {names?.map((n, i) => {
              const locked = tab === "pattern" && level < patternMinLevel(i);
              return (
                <button key={n} type="button" disabled={locked} style={locked ? disabledBtn : { ...small, background: look[tab] === i ? "#1e8449" : "#3a2210" }} aria-pressed={look[tab] === i} onClick={() => choose(tab, i)}>
                  {tab === 'pattern' && <svg className="pattern-button-art" viewBox="50 100 100 120" aria-label={`${n} pattern preview`}><Pattern i={i}/></svg>}
                  {locked ? `${n} · 🔒 Lv ${patternMinLevel(i)}` : n}
                </button>
              );
            })}
            {sw?.map((c, i) => (
              <button key={c} type="button" aria-label={tab === "hairColor" ? `Hair color: ${HAIR_COLOR_NAMES[i]}` : tab === "outfit" ? `Outfit color: ${OUTFIT_COLOR_NAMES[i]}` : `${tab} colour ${i + 1}`} title={tab === "hairColor" ? HAIR_COLOR_NAMES[i] : tab === "outfit" ? OUTFIT_COLOR_NAMES[i] : `${tab} ${c}`} aria-pressed={look[tab] === i} onClick={() => choose(tab, i)} style={{ width: 40, height: 40, borderRadius: 8, background: c, cursor: "pointer", pointerEvents: "auto", border: look[tab] === i ? "4px solid #2ecc71" : "2px solid #fff6" }} />
            ))}
          </div>
        </div>
      </div>
    </Frame>
  );
}
