import { expect, it } from "vitest";
import { RIVALS, beats, counterTo } from "./rps";

it("resolves throws", () => {
  expect(beats("rock", "scissors")).toBe(true);
  expect(beats("rock", "paper")).toBe(false);
  expect(counterTo("paper")).toBe("scissors");
});
it("rivals always pick a move", () => {
  for (const r of RIVALS) {
    expect(["rock", "paper", "scissors"]).toContain(r.pick([], Math.random));
  }
});
import { roundBeatMs, towerRival } from './rps';
it('gives beginners time and tightens Tower timing with a safe floor', () => {
 expect(roundBeatMs('ladder', 0)).toBe(2400);
 expect(roundBeatMs('ladder', 3)).toBe(1800);
 expect(roundBeatMs('tower', 15)).toBeLessThan(roundBeatMs('tower', 0));
 expect(roundBeatMs('tower', 1000)).toBe(1600);
});
it('high Tower floors ignore past habits and retain equal odds', () => {
 const history = Array.from({length:6}, () => ({player:'rock' as const, rival:'scissors' as const}));
 expect(towerRival(20).pick(history, () => 0.8)).toBe('scissors');
 expect(['rock','paper','scissors']).toContain(towerRival(20).pick([], () => 0.8));
});

it('allows at least 4.8 seconds to choose in every classic match',()=>{
 for(const mode of ['ladder','tower','daily','rescue'])for(const level of [0,1,2,3,10,1000])expect(roundBeatMs(mode,level)*3).toBeGreaterThanOrEqual(4800);
 expect(roundBeatMs('daily',0)*3).toBe(6000);
 expect(roundBeatMs('rescue',0)*3).toBe(6000);
});

import { EXTRA_RIVALS, MOVES, type Round } from './rps';
import { NEW_RIVALS } from './content-catalog';
it('every opponent gives each hand exactly one third of the random range regardless of history or Tower floor',()=>{
 const opponents=[...RIVALS,...EXTRA_RIVALS,...NEW_RIVALS,...[0,5,20,1000].map(towerRival)];
 const histories:Round[][]=[[],...MOVES.map(player=>Array.from({length:6},()=>({player,rival:player})))];
 for(const rival of opponents)for(const history of histories){
  const counts={rock:0,paper:0,scissors:0};
  for(let i=0;i<3000;i++)counts[rival.pick(history,()=>(i+.5)/3000)]++;
  expect(counts,`${rival.name} ${history[0]?.player??'empty'}`).toEqual({rock:1000,paper:1000,scissors:1000});
 }
});
it('fair picks consume exactly one random draw and give each fixed player hand equal win/loss/draw ranges',()=>{
 for(const opponent of [...RIVALS,...EXTRA_RIVALS,...NEW_RIVALS,towerRival(1000)])for(const player of MOVES){
  const outcomes={win:0,lose:0,draw:0};
  for(let i=0;i<300;i++){let calls=0;const rival=opponent.pick([{player,rival:player}],()=>{calls++;return(i+.5)/300;});expect(calls).toBe(1);outcomes[player===rival?'draw':beats(player,rival)?'win':'lose']++;}
  expect(outcomes).toEqual({win:100,lose:100,draw:100});
 }
});
