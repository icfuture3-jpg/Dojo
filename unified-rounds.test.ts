import {expect,it} from 'vitest';
import {MOVES,beats,playerFavoredPick,createRoundPlan} from './rps';
it('matches 50/20/30 assistance for every first-picked hand with one draw',()=>{
 for(const player of MOVES){const counts={win:0,draw:0,lose:0};for(let i=0;i<1000;i++){let calls=0;const cpu=playerFavoredPick(player,()=>{calls++;return(i+.5)/1000;});expect(calls).toBe(1);counts[cpu===player?'draw':beats(player,cpu)?'win':'lose']++;}expect(counts).toEqual({win:500,draw:200,lose:300});}
});
it('never rerolls after a first choice or Peek; reset starts a new round',()=>{
 const p=createRoundPlan();p.reset('paper');let calls=0;
 expect(p.select('rock',()=>{calls++;return .1;})).toBe('scissors');
 p.select('paper',()=>{calls++;return .9;});expect(p.peek()).toBe('scissors');expect(calls).toBe(1);
 p.reset('rock');expect(p.peek()).toBe('rock');p.select('paper',()=>{calls++;return .9;});expect(p.move).toBe('rock');expect(calls).toBe(1);
 p.reset('scissors');p.select('paper',()=>{calls++;return .6;});expect(p.move).toBe('paper');expect(calls).toBe(2);
});
it('Daily never permits the banned hand and rejected player input cannot lock the plan',()=>{
 for(const banned of MOVES)for(const player of MOVES.filter(v=>v!==banned)){
  const p=createRoundPlan();p.reset(player);p.select(banned,()=>{throw Error('banned input must not roll');},banned);
  for(let i=0;i<1000;i++)expect(playerFavoredPick(player,()=>(i+.5)/1000,banned)).not.toBe(banned);
  expect(p.select(player,()=>.1,banned)).not.toBe(banned);
 }
});
