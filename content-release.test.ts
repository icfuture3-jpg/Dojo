import { expect, it } from 'vitest';
import { CONTENT, NEW_RIVALS, TOURNAMENT_IDS, RIVAL_IDS, DOJO_IDS, EVENT_IDS, scheduledEvent, type ContentId } from './content-catalog';
import { applyChallenge, plannedThrow, challengeRival, choiceWindow, entryReason } from './challenges';
import { applyAction } from './actions';
import { applyLogin, parseProfile, levelInfo, xpToNext, recordMatchStreak, type Profile } from './economy';
import { counterTo, MOVES } from './rps';
import { checkExpansionAchievements, EXPANSION_ACHIEVEMENTS } from './expansion-achievements';
const now=Date.UTC(2026,10,3,12);
function unlocked(){const p=applyLogin(parseProfile({saveVersion:4,xp:15000,stats:{rescued:6},coins:1000}),now);for(const k of TOURNAMENT_IDS)p.challenges.clears[k]=1;return p;}
function command(p:Profile,action:string,extra:object={},at=now){return applyAction(p,'challenge',{action,id:p.challenges.run!.id,...extra},at);}
function atFor(k:ContentId){if(!EVENT_IDS.includes(k as typeof EVENT_IDS[number]))return now;for(let i=0;i<30;i++)if(scheduledEvent(now+i*86400000).id===k)return now+i*86400000;throw new Error('event missing');}
function play(k:ContentId, input=unlocked(), mode:'win'|'lose'='win'){
 const at=atFor(k);
 for(let seed=0;seed<100;seed++){
  let p=applyAction(input,'challenge',{action:'start',kind:k,id:`${k}-${input.challenges.clears[k]??0}-${seed}`},at);expect(p.challenges.run).not.toBeNull();let count=0;
  while(!['complete','failed'].includes(p.challenges.run!.phase)&&count++<150){
   if(['review','between'].includes(p.challenges.run!.phase))p=command(p,'next',{},at);
   p=command(p,'begin',{},at);const r=p.challenges.run!, rival=plannedThrow(r),move=mode==='win'?counterTo(rival):counterTo(counterTo(rival));
   p=command(p,'throw',{turn:r.turn,move},r.deadline);
  }
  if(mode==='lose'||p.challenges.run!.phase==='complete')return p;
 }
 throw new Error(`no completion for ${k}`);
}
it('every tournament, rival, dojo activity and event can actually complete with correct matches and saved rewards',()=>{
 for(const k of Object.keys(CONTENT) as ContentId[]){
  const input=unlocked();if(TOURNAMENT_IDS.includes(k as typeof TOURNAMENT_IDS[number]))delete input.challenges.clears[k];
  const next=play(k,input);expect(next.challenges.run!.phase,k).toBe('complete');expect(next.challenges.run!.wins,k).toBe(CONTENT[k].opponents.length);expect(next.challenges.clears[k],k).toBe(1);expect(next.coins,k).toBeGreaterThan(input.coins);
  const saved=parseProfile(JSON.parse(JSON.stringify(next)));expect(command(saved,'finish',{},atFor(k))).toBe(saved);
 }
});
it('each new activity can lose/exit without a completion award',()=>{
 for(const k of Object.keys(CONTENT) as ContentId[]){const p=checkExpansionAchievements(unlocked());const next=play(k,p,'lose');expect(next.challenges.run!.phase,k).toBe('failed');expect(next.challenges.run!.wins,k).toBe(0);expect(next.coins,k).toBe(p.coins);}
});
it('bracket entry gates, order and next-opponent progression are enforced',()=>{
 const p=applyLogin(parseProfile({}),now);expect(entryReason(p,'world',now)).toContain('level');expect(entryReason(p,'moon-timed',now)).toContain('Rescue');
 const high=unlocked();delete high.challenges.clears.elite;expect(entryReason(high,'world',now)).toContain('Elite');
 for(const k of TOURNAMENT_IDS){const n=play(k);expect(n.challenges.run!.wins).toBe(CONTENT[k].opponents.length);}
});
it('original rivals are not replaced; new rivals have legal unbiased hands and distinct reactions',()=>{
 expect(NEW_RIVALS).toHaveLength(3);for(const r of NEW_RIVALS){expect(r.intro.length).toBeGreaterThan(10);expect(r.victory).not.toBe(r.defeat);for(const random of [()=>0,()=>.4,()=>.99])expect(MOVES).toContain(r.pick([{player:'paper',rival:'rock'}],random));}
 expect(NEW_RIVALS[0]!.pick([{player:'rock',rival:'scissors'}],()=>.1)).toBe('rock');expect(NEW_RIVALS[1]!.pick([],()=>.1)).toBe('rock');expect(NEW_RIVALS[2]!.pick([{player:'paper',rival:'paper'}],()=>.1)).toBe('rock');
});
it('event schedule covers all six events, expires by UTC and pays once per occurrence',()=>{
 const seen=new Set<string>();for(let i=0;i<28;i++){const e=scheduledEvent(now+i*86400000);seen.add(e.id);expect(e.end-e.start).toBe(86400000);expect(scheduledEvent(e.start).key).toBe(e.key);expect(scheduledEvent(e.end).key).not.toBe(e.key);}
 expect([...seen].sort()).toEqual([...EVENT_IDS].sort());
 const k='double-reward',at=atFor(k),first=play(k);expect(entryReason(first,k,at)).toContain('collected');
 const active=applyChallenge(unlocked(),{action:'start',kind:k,id:'expired'},at);expect(command(active,'begin',{},scheduledEvent(at).end).challenges.run!.phase).toBe('failed');
});
it('timed trial counts ties and prevents infinite replay past eight throws',()=>{
 let p=applyChallenge(unlocked(),{action:'start',kind:'moon-timed',id:'timed'},now);for(let i=0;i<8;i++){if(i)p=command(p,'next');p=command(p,'begin');const r=p.challenges.run!;p=command(p,'throw',{turn:r.turn,move:plannedThrow(r)},r.deadline);}expect(p.challenges.run!.phase).toBe('failed');expect(p.challenges.run!.feedback).toContain('limit');
});
it('new first-clear rewards cannot be farmed through practice or repeated event messages',()=>{
 const first=play('crane');const second=play('crane',first);expect(second.coins).toBe(first.coins);expect(second.challenges.clears.crane).toBe(2);
});
it('20-percent cheaper early levels leave later incremental costs unchanged and migration preserves advanced level progress',()=>{
 for(let l=1;l<10;l++)expect(xpToNext(l)).toBe((80+40*l)*.8);for(const l of [10,11,25,100])expect(xpToNext(l)).toBe(80+40*l);
 const migrated=parseProfile({saveVersion:3,xp:3000,coins:1000,owned:['gi-blue','gi-crimson']});expect(levelInfo(migrated.xp)).toEqual({level:11,into:0,need:520});expect(migrated.coins).toBe(1000);expect(migrated.owned).toContain('gi-crimson');expect(parseProfile(JSON.parse(JSON.stringify(migrated))).xp).toBe(migrated.xp);
});
it('five-match win milestones vary, cap and reset on a loss without duplicate event payouts',()=>{
 const p=unlocked();const start=p.gems;for(let i=0;i<25;i++)recordMatchStreak(p,true);expect(p.gems-start).toBe(2+3+4+5+5);expect(p.bestMatchStreak).toBe(25);recordMatchStreak(p,false);expect(p.matchStreak).toBe(0);for(let i=0;i<5;i++)recordMatchStreak(p,true);expect(p.gems-start).toBe(21);
 let next=applyAction(unlocked(),'matchDone',{completionId:'one',rival:0,won:true,roundsWon:3,roundsLost:1,comeback:false,perfectRun:false},now);const streak=next.matchStreak;next=applyAction(next,'matchDone',{completionId:'one',rival:0,won:true,roundsWon:3,roundsLost:1,comeback:false,perfectRun:false},now);expect(next.matchStreak).toBe(streak);
});
it('all additive achievements award once and preserve original trophies and ownership',()=>{
 const p=unlocked();p.stats.won=100;p.bestMatchStreak=5;p.challenges.survivalBest=1;for(const k of ['daily','perfect','comeback','master',...TOURNAMENT_IDS,...RIVAL_IDS,...DOJO_IDS])p.challenges.clears[k]=1;
 const next=checkExpansionAchievements(p);expect(next.expansionAchievements).toHaveLength(EXPANSION_ACHIEVEMENTS.length);expect(checkExpansionAchievements(next)).toBe(next);expect(next.owned).toEqual(p.owned);for(const t of p.trophies)expect(next.trophies).toContain(t);
});
