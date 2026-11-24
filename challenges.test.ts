import { describe, expect, it } from 'vitest';
import { applyChallenge, CHALLENGES, challengeRival, choiceWindow, dailyAvailable, dailyHand, plannedThrow } from './challenges';
import { applyAction } from './actions';
import { applyLogin, parseProfile, type Profile } from './economy';
import { beats, counterTo, MOVES, type Move } from './rps';
import type { ChallengeKind } from './challenge-state';
const now = Date.UTC(2026,10,3,12);
const fresh = () => applyLogin(parseProfile({}), now);
function send(p:Profile, action:string, extra:object = {}, at=now):Profile { return applyChallenge(p,{action,id:p.challenges.run!.id,...extra},at); }
function start(kind:ChallengeKind,id:string=kind,p=fresh(),at=now){return applyChallenge(p,{action:'start',kind,id},at);}
function round(p:Profile, mode:'win'|'lose'|'tie'|'timeout'='win', at=now):Profile {
 if(p.challenges.run!.phase==='review'||p.challenges.run!.phase==='between')p=send(p,'next',{},at);
 p=send(p,'begin',{},at); const r=p.challenges.run!, rival=plannedThrow(r);
 const move=mode==='win'?counterTo(rival):mode==='tie'?rival:mode==='lose'?counterTo(counterTo(rival)):null;
 return send(p,'throw',{turn:r.turn,move},r.deadline);
}
function playToEnd(p:Profile){let safety=0;while(!['complete','failed'].includes(p.challenges.run!.phase)&&safety++<30)p=round(p);return p;}

it('migrates existing profiles without altering balances, owned looks, classic stats or abilities',()=>{
 const old={coins:700,gems:22,xp:1024,rp:500,owned:['gi-blue','gi-crimson'],training:{matches:5,completed:1,strength:4},look:{hairColor:19}};
 const p=parseProfile(old);expect(p.coins).toBe(700);expect(p.owned).toEqual(old.owned);expect(p.training).toEqual(old.training);expect(p.look.hairColor).toBe(19);expect(p.challenges.run).toBeNull();expect(p.audio).toEqual({music:1,sfx:1});
});
it('all five trial entries have real goals, opponents and valid windows',()=>{
 expect(Object.keys(CHALLENGES).filter(k=>['daily','survival','perfect','comeback','master'].includes(k))).toHaveLength(5);
 for(const kind of ['daily','survival','perfect','comeback','master'] as ChallengeKind[]){const p=start(kind);expect(p.challenges.run!.phase).toBe('ready');expect(CHALLENGES[kind].goal.length).toBeGreaterThan(25);expect(challengeRival(p.challenges.run!).name).toBeTruthy();expect(choiceWindow(p.challenges.run!)).toBeGreaterThan(0);}
});
it('does not allow simultaneous runs or reuse of the just-finished run identity',()=>{
 const p=start('perfect');expect(start('survival','x',p)).toBe(p);const done=send(p,'finish');expect(start('perfect','perfect',done)).toBe(done);
});
it('resolves all nine hand combinations using the unchanged Three Hands relationship',()=>{
 for(let i=0;i<40;i++){
  for(const move of MOVES){let p=start('perfect',`r-${i}-${move}`);p=send(p,'begin');const r=p.challenges.run!, planned=plannedThrow(r);const next=send(p,'throw',{turn:0,move},r.deadline).challenges.run!;
   expect(next.player).toBe(Number(beats(move,planned)));expect(next.rival).toBe(Number(move!==planned&&!beats(move,planned)));expect(next.history).toEqual([{player:move,rival:planned}]);}
 }
});
it('does not choose rival based on the selected hand or reward ties',()=>{
 let p=start('master');p=send(p,'begin');const before=plannedThrow(p.challenges.run!);expect(plannedThrow(p.challenges.run!)).toBe(before);
 const next=round(start('master'),'tie');expect(next.challenges.run!.player).toBe(0);expect(next.challenges.run!.rival).toBe(0);expect(next.challenges.run!.hands).toEqual([]);expect(next.challenges.run!.phase).toBe('review');
});
it('ignores early submissions, repeated throws, stale turns and forged run IDs',()=>{
 let p=start('perfect');p=send(p,'begin');const r=p.challenges.run!;
 expect(send(p,'throw',{turn:0,move:'rock'},r.deadline-1)).toBe(p);
 const next=send(p,'throw',{turn:0,move:'rock'},r.deadline);
 expect(send(next,'throw',{turn:0,move:'rock'},r.deadline)).toBe(next);
 expect(applyChallenge(p,{action:'finish',id:'wrong'},now)).toBe(p);
 expect(send(p,'throw',{turn:42,move:'rock'},r.deadline)).toBe(p);
});
it('a missing or long-expired choice loses the round, including after a saved reload',()=>{
 let p=start('perfect');p=send(p,'begin');p=parseProfile(JSON.parse(JSON.stringify(p)));const r=p.challenges.run!;
 const next=send(p,'throw',{turn:r.turn,move:counterTo(plannedThrow(r))},r.deadline+3000);
 expect(next.challenges.run!.rival).toBe(1);expect(next.challenges.run!.player).toBe(0);
 expect(round(start('perfect'),'timeout').challenges.run!.rival).toBe(1);
});
it('pauses and resumes with remaining choice time and survives reload',()=>{
 let p=send(start('perfect'),'begin');p=send(p,'pause',{},now+1000);expect(p.challenges.run!.remaining).toBe(6200);expect(p.challenges.run!.phase).toBe('paused');
 p=parseProfile(JSON.parse(JSON.stringify(p)));p=send(p,'resume',{},now+90000);expect(p.challenges.run!.deadline).toBe(now+96200);expect(p.challenges.run!.phase).toBe('select');
});
it('cannot pause an already expired choice to rescue a lost round',()=>{
 const p=send(start('perfect'),'begin');expect(send(p,'pause',{},p.challenges.run!.deadline)).toBe(p);
});
it('Perfect Victory requires three match wins and ends at the first lost match',()=>{
 let p=start('perfect');for(let i=0;i<9;i++)p=round(p);
 expect(p.challenges.run!.phase).toBe('complete');expect(p.challenges.run!.wins).toBe(3);expect(p.challenges.claimed).toContain('perfect');expect(p.challenges.clears.perfect).toBe(1);
 let lost=start('perfect','lose');for(let i=0;i<3;i++)lost=round(lost,'lose');expect(lost.challenges.run!.phase).toBe('failed');expect(lost.challenges.claimed).toEqual([]);
});
it('trial first-clear reward is credited once and later practice has no extra reward',()=>{
 const first=playToEnd(start('perfect'));const original=first.coins;
 expect(first.gems).toBe(fresh().gems+3);
 const again=playToEnd(start('perfect','practice',first));expect(again.coins).toBe(original);expect(again.challenges.clears.perfect).toBe(2);
 expect(send(again,'finish')).toBe(again);
});
it('Comeback starts 0–2 against Oku and requires three unanswered points',()=>{
 const p=start('comeback');expect(p.challenges.run!.rival).toBe(2);expect(challengeRival(p.challenges.run!).name).toBe('Grandmaster Oku');
 expect(round(p,'lose').challenges.run!.phase).toBe('failed');expect(playToEnd(p).challenges.run!.phase).toBe('complete');
});
it('Master requires a point with every hand, not just any three points',()=>{
 let successful:Profile|undefined,failed:Profile|undefined;
 for(let i=0;i<80;i++){const p=playToEnd(start('master',`master-${i}`));if(p.challenges.run!.phase==='complete')successful=p;else failed=p;}
 expect(successful).toBeDefined();expect(new Set(successful!.challenges.run!.hands).size).toBe(3);expect(failed).toBeDefined();expect(failed!.challenges.claimed).not.toContain('master');
});
it('daily objectives and opponents rotate deterministically on UTC date boundaries',()=>{
 expect(dailyHand(now)).toBe(dailyHand(now+1000));expect(dailyHand(now)).not.toBe(dailyHand(now+86400000));expect(challengeRival(start('daily','x').challenges.run!).name).toBe(challengeRival(start('daily','y').challenges.run!).name);
});
it('daily consumes an entry at start, including forfeits and reload, and enforces three entries',()=>{
 let p=fresh();for(let i=0;i<3;i++){p=start('daily',`attempt-${i}`,p);expect(p.challenges.dailyAttempts).toBe(i+1);p=parseProfile(JSON.parse(JSON.stringify(p)));p=send(p,'finish');}
 expect(dailyAvailable(p,now)).toBe(false);expect(start('daily','fourth',p)).toBe(p);expect(dailyAvailable(p,now+86400000)).toBe(true);
});
function dailyWin(p:Profile,at=now){for(let i=0;i<3;i++){p=start('daily',`daily-${at}-${i}`,p,at);if(p.challenges.run!.day!==new Date(at).toISOString().slice(0,10))break;let loops=0;while(!['complete','failed'].includes(p.challenges.run!.phase)&&loops++<10)p=round(p,'win',at);if(p.challenges.run!.phase==='complete')return p;}return p;}
it('daily completion pays once, records streak bonus, and locks same-day reentry',()=>{
 // Search deterministic IDs/days for a scoring-hand-complete objective.
 let p=dailyWin(fresh());
 if(p.challenges.run!.phase!=='complete'){p=dailyWin(fresh(),now+86400000);}
 expect(p.challenges.run!.phase).toBe('complete');expect(p.challenges.dailyStreak).toBe(1);expect(p.challenges.dailyLastWin).toBe(p.challenges.run!.day);expect(p.gems).toBe(fresh().gems+2);expect(dailyAvailable(p,Date.parse(p.challenges.run!.day)+3600000)).toBe(false);
});
it('daily UTC rollover expires yesterday’s unfinished run without rewards',()=>{
 const p=start('daily');const next=send(p,'begin',{},now+86400000);expect(next.challenges.run!.phase).toBe('failed');expect(next.gems).toBe(p.gems);expect(dailyAvailable(next,now+86400000)).toBe(true);
});
it('survival continues with tighter timing and rewards only newly reached personal-best wins',()=>{
 let p=start('survival');for(let i=0;i<6;i++)p=round(p);expect(p.challenges.run!.wins).toBe(2);expect(choiceWindow(p.challenges.run!)).toBeLessThan(7200);const coins=p.coins;
 p=send(p,'finish');expect(p.challenges.survivalBest).toBe(2);expect(p.challenges.survivalPaid).toBe(2);expect(p.coins).toBe(coins);
 let repeat=start('survival','repeat',p);for(let i=0;i<3;i++)repeat=round(repeat);repeat=send(repeat,'finish');expect(repeat.coins).toBe(p.coins);
 let best=start('survival','new-best',repeat);for(let i=0;i<9;i++)best=round(best);best=send(best,'finish');expect(best.coins).toBe(p.coins+15);expect(best.challenges.survivalBest).toBe(3);
});
it('survival pays new records on wins, never on a loss, and ignores repeat settlement',()=>{
 let p=start('survival'); const coins=p.coins;
 for(let i=0;i<3;i++)p=round(p);
 expect(p.coins).toBe(coins+15); expect(p.challenges.survivalPaid).toBe(1);
 const beforeLoss=p;
 for(let i=0;i<3;i++)p=round(p,'lose');
 expect([p.coins,p.gems,p.xp]).toEqual([beforeLoss.coins,beforeLoss.gems,beforeLoss.xp]);
 expect(p.challenges.survivalBest).toBe(1);expect(p.challenges.run!.phase).toBe('failed');expect(send(p,'finish')).toBe(p);
});
it('survival difficulty has a safe timing floor and legal rivals even on high records',()=>{
 const p=start('survival');p.challenges.run!.wins=10000;expect(choiceWindow(p.challenges.run!)).toBe(4800);expect(MOVES).toContain(plannedThrow(p.challenges.run!));
});
it('rejects malformed challenge commands and does not mutate the previous save',()=>{
 const p=start('perfect'),before=JSON.stringify(p);
 for(const raw of [null,{}, {action:'start',kind:'fake',id:'a'},{action:'throw',id:p.challenges.run!.id,turn:NaN,move:'rock'}])expect(applyChallenge(p,raw,now)).toBe(p);
 send(p,'begin');expect(JSON.stringify(p)).toBe(before);expect(applyAction(p,'challenge',{action:'begin',id:p.challenges.run!.id},now).challenges.run!.phase).toBe('select');
});
it('new trial rewards never rewrite classic match stats, RP, ownership or abilities',()=>{
 const p=fresh();const next=playToEnd(start('perfect','preserve',p));expect(next.stats).toEqual(p.stats);expect(next.rp).toBe(p.rp);expect(next.owned).toEqual(p.owned);expect(next.look).toEqual(p.look);expect(next.training).toEqual(p.training);
});
it('audio preferences validate, persist and do not award rewards',()=>{
 const p=fresh(),next=applyAction(p,'audio',{music:.25,sfx:0},now);expect(parseProfile(JSON.parse(JSON.stringify(next))).audio).toEqual({music:.25,sfx:0});expect(next.coins).toBe(p.coins);expect(applyAction(p,'audio',{music:2,sfx:0},now)).toBe(p);
});
it('retains the free Peek, paid Peek and one-Guard-per-match behavior in new trials',()=>{
 let p=start('perfect','abilities',{...fresh(),coins:1000,training:{matches:0,completed:0,strength:1}});
 p=send(p,'begin');const first=send(p,'peek');expect(first.coins).toBe(p.coins);expect(first.challenges.run!.peek).toBe(plannedThrow(p.challenges.run!));expect(send(first,'peek')).toBe(first);
 p=send(first,'guard');const rival=plannedThrow(p.challenges.run!);p=send(p,'throw',{turn:0,move:counterTo(counterTo(rival))},p.challenges.run!.deadline);
 expect(p.challenges.run!.rival).toBe(0);expect(p.challenges.run!.guardUsed).toBe(true);expect(p.challenges.run!.feedback).toContain('GUARD');
 p=send(p,'next');p=send(p,'begin');const before=p.coins;p=send(p,'peek');expect(p.coins).toBe(before-10);expect(send(p,'guard')).toBe(p);
});
it('blocks locked Guard and unaffordable paid Peeks without changing progression',()=>{
 let p=send(start('perfect'),'begin');expect(send(p,'guard')).toBe(p);p=send(p,'peek');p=round(p,'tie');p=send(p,'next');p=send(p,'begin');p.coins=0;expect(send(p,'peek')).toBe(p);
});
function successfulDaily(input:Profile,at:number){
 for(let i=0;i<100;i++){
  let candidate=start('daily',`find-${at}-${i}`,input,at);
  for(let r=0;r<3;r++)candidate=round(candidate,'win',at);
  if(candidate.challenges.run!.phase==='complete')return candidate;
 }
 throw new Error('No successful daily seed found');
}
it('consecutive UTC daily wins increase streak bonus and a missed day resets it',()=>{
 const one=successfulDaily(fresh(),now);
 const two=successfulDaily(one,now+86400000);expect(two.challenges.dailyStreak).toBe(2);expect(two.coins-one.coins).toBeGreaterThanOrEqual(90);expect(two.challenges.claimed).toHaveLength(2);
 const gap=successfulDaily(two,now+3*86400000);expect(gap.challenges.dailyStreak).toBe(1);
});
it('daily streak bonus caps at 50 coins without resetting its stored streak',()=>{
 const p=fresh();p.challenges.dailyLastWin=new Date(now-86400000).toISOString().slice(0,10);p.challenges.dailyStreak=8;
 const next=successfulDaily(p,now);expect(next.challenges.dailyStreak).toBe(9);expect(next.coins-p.coins).toBe(120);
});
it('a corrupted new run does not erase legacy currency or inventory',()=>{
 const p=start('perfect');const raw=JSON.parse(JSON.stringify(p));raw.challenges.run.turn='broken';raw.coins=777;
 const restored=parseProfile(raw);expect(restored.coins).toBe(777);expect(restored.owned).toEqual(p.owned);expect(restored.challenges.run).toBeNull();
});
it('saved run counters, spent entries and claim ledger survive the actual save layer',async()=>{
 const {loadSave,saveProfile}=await import('./saves');const store=new Map<string,string>();const storage={getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>{store.set(k,v);}};
 const p=successfulDaily(fresh(),now);expect(saveProfile(storage,p)).toBeNull();const loaded=loadSave(storage,now).profile;
 expect(loaded.challenges).toEqual(p.challenges);expect(dailyAvailable(loaded,now)).toBe(false);expect(send(loaded,'finish')).toBe(loaded);
});
it('returns to a normal ready match after a survival match without carrying Peek or Guard use',()=>{
 let p=start('survival');p=send(p,'begin');p=send(p,'peek');for(let i=0;i<3;i++)p=round(p);p=send(p,'next');expect(p.challenges.run!.phase).toBe('ready');expect(p.challenges.run!.peekUsed).toBe(false);expect(p.challenges.run!.peek).toBeNull();expect(p.challenges.run!.guardUsed).toBe(false);expect(p.challenges.run!.history).toEqual([]);
});

it('migrates Stage 1 version-2 saves into version 4 without dropping balances or completion IDs',()=>{
 const p=parseProfile({saveVersion:2,coins:345,completedResults:['old-match'],owned:['gi-blue','gi-crimson']});
 expect(p.saveVersion).toBe(4);expect(p.coins).toBe(345);expect(p.completedResults).toEqual(['old-match']);expect(p.owned).toContain('gi-crimson');
});

it('gives every optional trial at least 4.8 seconds for selecting a hand',()=>{
 for(const kind of ['daily','survival','perfect','comeback','master'] as ChallengeKind[])expect(choiceWindow(start(kind).challenges.run!)).toBeGreaterThanOrEqual(4800);
 expect(choiceWindow(start('perfect').challenges.run!)).toBe(7200);
 expect(choiceWindow(start('comeback').challenges.run!)).toBe(6000);
});

it('retains a preselected hand through delayed SHOOT, pause/reload and rejects after-deadline changes',()=>{
 let p=send(start('perfect','saved-hand'),'begin');const r=p.challenges.run!,move=counterTo(plannedThrow(r));
 p=send(p,'select',{turn:r.turn,move},r.deadline-4000);
 expect(p.challenges.run!.selected).toBe(move);
 const original=p;
 expect(send(p,'select',{turn:r.turn,move:'rock'},r.deadline+1)).toBe(original);
 p=send(p,'pause',{},r.deadline-3000);p=parseProfile(JSON.parse(JSON.stringify(p)));p=send(p,'resume',{},r.deadline+90000);
 const end=p.challenges.run!.deadline;
 p=send(p,'throw',{turn:r.turn,move:null},end+5000);
 expect(p.challenges.run!.player).toBe(1);expect(p.challenges.run!.feedback).not.toContain('No hand selected');
 p=send(p,'next');expect(p.challenges.run!.selected).toBeNull();
});
it('planned challenge hands stay independent of selection/history and balanced across seeded rounds',()=>{
 const base=start('perfect').challenges.run!;
 const counts={rock:0,paper:0,scissors:0};
 for(let i=0;i<12000;i++){
  const run={...base,id:`fair-round-${i}`,turn:i%11};
  const expected=plannedThrow(run);counts[expected]++;
  for(const selected of MOVES)expect(plannedThrow({...run,selected,history:Array(6).fill({player:selected,rival:selected})})).toBe(expected);
 }
 for(const count of Object.values(counts))expect(Math.abs(count-4000)).toBeLessThan(240);
});

it('awards the Beginner Champion gi only after winning the complete tournament',()=>{
 let p=start('beginner','champion-gi');
 expect(p.owned).not.toContain('gi-champion-jade');
 const failed=round(round(round(p,'lose'),'lose'),'lose');
 expect(failed.owned).not.toContain('gi-champion-jade');
 p=playToEnd(p);
 expect(p.challenges.run!.phase).toBe('complete');
 expect(p.owned).toContain('gi-champion-jade');
 expect(p.challenges.run!.feedback).toContain('Earned Jade Champion Gi');
 const replay=playToEnd(start('beginner','champion-gi-again',p));
 expect(replay.owned.filter(id=>id==='gi-champion-jade')).toHaveLength(1);
});
