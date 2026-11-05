import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { MOVES, MOVE_ICON, TOWER_POOL, WINS_NEEDED, beats, type Move } from "./rps";
import { seededLook, type Look } from "./look";

export interface SpecFighter {
  name: string;
  color: string;
  look: Look;
}

/** Two computer fighters, picked from the day's seed, for the player to call. */
export function pickSpectators(seed: number): [SpecFighter, SpecFighter] {
  const a = TOWER_POOL[seed % TOWER_POOL.length]!;
  const b = TOWER_POOL[(seed + 3) % TOWER_POOL.length]!;
  return [
    { name: a.name, color: a.color, look: seededLook(seed + 1) },
    { name: b.name, color: b.color, look: seededLook(seed + 2) },
  ];
}

const pill: CSSProperties = {
  pointerEvents: "auto", cursor: "pointer", border: "3px solid #f1c40f", background: "linear-gradient(#a02a1c, #6a170e)",
  color: "#fff6dc", fontFamily: "Georgia, serif", fontSize: 22, padding: "10px 24px", borderRadius: 6,
};

export function Spectate({ fighters, render, onDone, onExit }: {
  fighters: [SpecFighter, SpecFighter];
  render(f: SpecFighter, flip: boolean, state: "idle" | "throw" | "win" | "lose", move: Move | null): ReactNode;
  onDone(correct: boolean): void;
  onExit(): void;
}) {
  const [guess, setGuess] = useState<0 | 1 | null>(null);
  const [score, setScore] = useState<[number, number]>([0, 0]);
  const [moves, setMoves] = useState<[Move | null, Move | null]>([null, null]);
  const [over, setOver] = useState(false);
  const [paused, setPaused] = useState(false);
  useEffect(() => { const hide = () => { if(document.hidden) setPaused(true); }; document.addEventListener('visibilitychange',hide); return()=>document.removeEventListener('visibilitychange',hide); },[]);
  const scoreRef = useRef<[number, number]>([0, 0]);
  const reported = useRef(false);

  useEffect(() => {
    if (guess === null || over || paused) return;
    const id = window.setInterval(() => {
      const a = MOVES[Math.floor(Math.random() * 3)] as Move;
      const b = MOVES[Math.floor(Math.random() * 3)] as Move;
      setMoves([a, b]);
      if (a !== b) {
        const next: [number, number] = beats(a, b) ? [scoreRef.current[0] + 1, scoreRef.current[1]] : [scoreRef.current[0], scoreRef.current[1] + 1];
        scoreRef.current = next;
        setScore(next);
        if (next[0] >= WINS_NEEDED || next[1] >= WINS_NEEDED) {
          window.clearInterval(id);
          setOver(true);
        }
      }
    }, 1500);
    return () => window.clearInterval(id);
  }, [guess, over, paused]);

  const winner = score[0] >= WINS_NEEDED ? 0 : 1;
  const correct = over && guess === winner;
  useEffect(() => {
    if (over && !reported.current) {
      reported.current = true;
      onDone(correct);
    }
  }, [over, correct, onDone]);

  const [fa, fb] = fighters;
  const stateOf = (i: 0 | 1) => (over ? (winner === i ? "win" : "lose") : moves[i] ? "throw" : "idle");
  return (
    <div className="spectator-screen" style={{ position: "absolute", inset: 0, zIndex: 40, pointerEvents: "none", fontFamily: "Georgia, serif", color: "#fff6dc", textShadow: "0 2px 4px #000" }}>
      <div style={{position:'absolute',top:8,right:8,zIndex:80,pointerEvents:'auto',display:'flex',gap:8}}><button type="button" style={{...pill,fontSize:14}} onClick={onExit}>EXIT BOUT</button>{guess !== null && !over && <button type="button" style={{...pill,fontSize:14}} onClick={()=>setPaused(v=>!v)}>{paused?'RESUME BOUT':'PAUSE BOUT'}</button>}</div>
      <div className="spectator-heading" style={{ position: "absolute", top: 20, left: 0, right: 0, textAlign: "center", fontSize: 30, color: "#f1c40f" }}>
        SPECTATOR BOUT · {fa.name} vs {fb.name}
      </div>
      <div className="spectator-score" style={{ position: "absolute", top: 125, left: 0, right: 0, textAlign: "center", fontSize: 44 }}>{score[0]} – {score[1]}</div>
      <div className="spectator-fighters" style={{ position: "absolute", left: "50%", bottom: "26%", transform: "translateX(-50%)", display: "flex", gap: 360, alignItems: "flex-end" }}>
        {render(fa, false, stateOf(0), moves[0])}
        {render(fb, true, stateOf(1), moves[1])}
      </div>
      <div style={{ position: "absolute", left: "50%", top: "30%", transform: "translateX(-50%)", fontSize: 60 }}>
        {moves[0] && moves[1] ? `${MOVE_ICON[moves[0]]}  ${MOVE_ICON[moves[1]]}` : ""}
      </div>
      {guess === null && (
        <div style={{ position: "absolute", inset: 0, background: "#000b", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20, pointerEvents: "auto" }}>
          <div style={{ fontSize: 34 }}>Who will win?</div>
          <div style={{ display: "flex", gap: 20 }}>
            <button type="button" style={pill} onClick={() => setGuess(0)}>{fa.name}</button>
            <button type="button" style={pill} onClick={() => setGuess(1)}>{fb.name}</button>
          </div>
          <button type="button" style={{ ...pill, fontSize: 16 }} onClick={onExit}>BACK</button>
        </div>
      )}
      {over && (
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 40, textAlign: "center", pointerEvents: "auto" }}>
          <div style={{ fontSize: 34, marginBottom: 12, color: correct ? "#2ecc71" : "#e74c3c" }}>{(winner === 0 ? fa : fb).name} wins! {correct ? "You called it: +25 coins" : "Not this time."}</div>
          <button type="button" style={pill} onClick={onExit}>BACK TO DOJO</button>
        </div>
      )}
    </div>
  );
}