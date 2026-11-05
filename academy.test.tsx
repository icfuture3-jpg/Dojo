import { it,expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { applyAction } from './actions';
import { ACADEMY, applyAcademy, academyWindow, beltInfo, chooseAcademyRival, dailyAcademy } from './academy';
import { playableAcademyIds as academyIds,type AcademyId } from './academy-state';
import { parseProfile,TROPHIES,type Profile } from './economy';
import { beats,counterTo,MOVES,type Move } from './rps';
import { AcademyHall } from './academy-hall';
import { TreePots } from './tree-pots';
let serial=0;const time=Date.UTC(2026,10,4,12);
function harness(game:AcademyId,base:Profile=parseProfile({saveVersion:4}),difficulty=1){
 let p=base,now=time;
 const command=(action:string,extra:Record<string,unknown>={},random=.31)=>{const r=p.academy.run;p=applyAction(p,'academy',{action,id:r?.id,turn:r?.turn,...extra},now,random);return p;};
 command('start',{id:`run-${serial++}`,game,difficulty});
 return {get p(){return p;},get r(){return p.academy.run!;},command,advance(ms:number){now+=ms;},reload(){p=parseProfile(JSON.parse(JSON.stringify(p)));},winAnswer(){const r=p.academy.run!;const hand=r.game==='memory'?r.sequence[r.attempts]:r.game==='says'?(r.valid?r.target:'hold'):counterTo(r.target);return command('answer',{hand});},get now(){return now;}};
}
function complete(h:ReturnType<typeof harness>,stopSurvival=true){
 h.command('begin');for(let guard=0;guard<400;guard++){
 const r=h.r;if(r.phase==='won'||r.phase==='lost'||stopSurvival&&r.game==='grandmaster'&&r.paid)return;
 if(r.phase==='review'){h.advance(1000);h.command('next');}else if(r.phase==='watch'){h.advance(r.deadline-h.now);h.command('tick');}else {h.advance(50);h.winAnswer();}
 }throw new Error('Run did not terminate');
}
for(const game of academyIds){
 it(`${game}: completes through real rule transitions, pays once, saves, and rejects stale completions`,()=>{
 const base=parseProfile({saveVersion:4,coins:173,xp:345,rp:22});const h=harness(game,base);complete(h);
 expect(h.r.phase).toBe(game==='grandmaster'?'review':'won');expect(h.r.paid).toBe(true);
 const delta=ACADEMY[game].coins+(dailyAcademy(time).includes(game)?25:0);
 const trophyCoins=TROPHIES.filter(t=>h.p.trophies.includes(t.id)&&!base.trophies.includes(t.id)).reduce((sum,t)=>sum+t.reward.coins,0);
 expect(h.p.coins).toBe(base.coins+delta+trophyCoins);expect(h.p.xp).toBe(base.xp);expect(h.p.rp).toBe(base.rp);
 const saved=h.p;h.command('answer',{hand:'rock'});h.command('tick');expect(h.p.coins).toBe(saved.coins);
 h.reload();expect(h.r.paid).toBe(true);expect(h.p.academy.claimed).toContain(h.r.id);
 const repeated=applyAcademy(h.p,{action:'start',id:h.r.id,game,difficulty:1},h.now,.1);expect(repeated).toBe(h.p);
 });
 it(`${game}: exit/restart abandons old attempt without rewards`,()=>{
 const h=harness(game);const coins=h.p.coins,id=h.r.id;h.command('begin');h.command('exit');expect(h.p.academy.run).toBeNull();expect(h.p.coins).toBe(coins);
 h.command('start',{id:`restart-${serial++}`,game,difficulty:1});expect(h.r.score).toBe(0);expect(h.r.id).not.toBe(id);
 });
 it(`${game}: loss or timeouts do not pay completion coins`,()=>{
 const h=harness(game),coins=h.p.coins;h.command('begin');for(let n=0;n<160&&h.r.phase!=='lost';n++){
 if(h.r.phase==='watch'){h.advance(h.r.deadline-h.now);h.command('tick');}
 else if(h.r.phase==='review')h.command('next');
 else{h.advance(30001);h.command('tick');}
 }expect(h.r.phase).toBe('lost');expect(h.p.coins).toBe(coins);expect(h.r.paid).toBe(false);
 });
}
it('draws in every duel preserve both scores and payout eligibility',()=>{
 for(const game of ['frenzy','shadow','trial','grandmaster'] as const){const h=harness(game);h.command('begin');const target=h.r.target;h.command('answer',{hand:target});expect(h.r.player).toBe(0);expect(h.r.rival).toBe(0);expect(h.r.feedback).toContain('Draw');expect(h.r.paid).toBe(false);}
});
it('pauses timers across save/reload',()=>{
 for(const game of academyIds){const h=harness(game);h.command('begin');h.advance(100);const left=h.r.deadline-h.now;h.command('pause');expect(h.r.remaining).toBe(left);h.reload();h.advance(900000);h.command('tick');expect(h.r.phase).toBe('paused');h.command('resume');expect(h.r.deadline-h.now).toBe(left);}
});
it('lightning measures accuracy/reaction, speeds up and automatically presents next symbol',()=>{
 const h=harness('lightning');h.command('begin');const initial=academyWindow(h.r);h.advance(230);h.winAnswer();expect(h.r.reactionTotal).toBe(230);h.advance(1000);h.command('tick');expect(h.r.phase).toBe('play');expect(academyWindow(h.r)).toBeLessThan(initial);
});
it('balance advances on correct answers and loses a life on mistakes',()=>{const h=harness('balance');h.command('begin');h.command('answer',{hand:h.r.target});expect(h.r.score).toBe(0);expect(h.r.errors).toBe(1);h.command('next');h.winAnswer();expect(h.r.score).toBe(1);});
it('memory hides sequence before accepting input, increases lengths and rejects wrong sequences',()=>{
 const h=harness('memory');h.command('begin');expect(h.r.sequence).toHaveLength(3);const before=h.p;h.winAnswer();expect(h.p).toBe(before);h.advance(4000);h.command('tick');for(let i=0;i<3;i++)h.winAnswer();h.command('next');expect(h.r.sequence).toHaveLength(4);h.advance(5000);h.command('tick');h.command('answer',{hand:counterTo(h.r.sequence[0]!)});expect(h.r.phase).toBe('lost');
});
it('Master Says requires holding deceptive commands, not obeying them',()=>{const h=harness('says');h.command('begin',{},.8);expect(h.r.valid).toBe(false);h.command('answer',{hand:'hold'});expect(h.r.score).toBe(1);h.command('next',{},.8);h.command('answer',{hand:h.r.target});expect(h.r.errors).toBe(1);});
it('Shadow ignores repeated hands; survival only increases timing difficulty every three victories',()=>{
 const h=harness('shadow');h.command('begin');const r={...h.r,history:['scissors','rock','rock','rock','rock','rock'] as Move[]};expect(chooseAcademyRival(r,.1)).toBe('rock');
 const g=harness('grandmaster');g.command('begin');expect(academyWindow({...g.r,wins:2})).toBe(academyWindow(g.r));expect(academyWindow({...g.r,wins:3})).toBeLessThan(academyWindow(g.r));
});
it('survival continues beyond milestone, records best, and never repays on continuation or loss',()=>{
 const h=harness('grandmaster');complete(h);const coins=h.p.coins;expect(h.r.wins).toBe(9);
 for(let i=0;i<3;i++){h.command('next');h.winAnswer();}expect(h.r.wins).toBe(10);expect(h.p.coins).toBe(coins);
 for(let i=0;i<3;i++){h.command('next');h.command('answer',{hand:MOVES.find(m=>beats(h.r.target,m))});}expect(h.r.phase).toBe('lost');expect(h.p.academy.records.grandmaster).toBe(10);expect(h.p.coins).toBe(coins);
});
it('daily objectives rotate as three distinct activities and pay only once per day per objective',()=>{
 for(let day=0;day<3;day++)expect(new Set(dailyAcademy(time+day*86400000)).size).toBe(3);
 const game=dailyAcademy(time).find(g=>g!=='shadow')!;const h=harness(game);complete(h);const after=h.p;const second=harness(game,after);complete(second);expect(second.p.coins-after.coins).toBe(ACADEMY[game].coins);expect(second.p.academy.daily).toHaveLength(1);
});
it('belt costs increase, existing profile migrates without resetting and defaults remain additive',()=>{
 const p=parseProfile({saveVersion:4,coins:123,gems:12,xp:200,equip:{gi:'gi-new-1'},name:'Keeper'});expect(p.coins).toBe(123);expect(p.academy.xp).toBe(0);expect(p.name).toBe('Keeper');expect(p.equip.gi).toBe('gi-new-1');expect(beltInfo(1550).current[0]).toBe('Black');expect(beltInfo(79).current[0]).toBe('White');expect(beltInfo(80).current[0]).toBe('Yellow');
});
it('distinct clears unlock functional hall cosmetics, master avatars and existing shop gis without changing equipped look',()=>{
 let p=parseProfile({saveVersion:4});const look=p.look;
 for(const game of academyIds.slice(0,8)){const h=harness(game,p);complete(h);p=h.p;const run=p.academy.run!;p=applyAcademy(p,{action:'exit',id:run.id,turn:run.turn},time,.1);}
 expect(p.academy.unlocks).toEqual(expect.arrayContaining(['Bao','Mei','bamboo','gold','cyan']));expect(p.owned).toEqual(expect.arrayContaining(['gi-new-1','gi-new-2']));expect(p.look).toEqual(look);
 p=applyAcademy(p,{action:'equip',slot:'master',value:'Bao'},time,.1);expect(p.academy.master).toBe('Bao');
 const fresh=parseProfile({});expect(applyAcademy(fresh,{action:'equip',slot:'master',value:'Bao'},time,.1)).toBe(fresh);
});
it('rejects stale turns, forged wins, bad hands, repeated start IDs and nonfinite action times',()=>{
 const h=harness('balance');h.command('begin');const p=h.p;const r=h.r;for(const data of [{action:'answer',hand:'laser',id:r.id,turn:r.turn},{action:'answer',hand:'rock',id:r.id,turn:r.turn-1},{action:'win',id:r.id,turn:r.turn}])expect(applyAction(p,'academy',data,time,.1)).toBe(p);
 expect(applyAction(p,'academy',{action:'tick',id:r.id,turn:r.turn},NaN,.1)).toBe(p);
});
it('renders all eight real activity entries and no Tree Pot review control',()=>{
 const html=renderToStaticMarkup(<AcademyHall p={parseProfile({})} dispatch={()=>{}} onExit={()=>{}} onShop={()=>{}} onSound={()=>{}} fighter={()=><div>Saved avatar</div>}/>);for(const id of academyIds)expect(html).toContain(ACADEMY[id].name);expect(html).not.toContain('Dummy Destroyer');expect(html).not.toContain('Sensei');expect(html).not.toContain('academy-difficulty');expect(html).toContain('PLAY A MINI-GAME');expect(html).not.toContain('MINI-GAME CHALLENGES</button>');
 const pot=renderToStaticMarkup(<TreePots avatar={<div/>} best={{throw:0,jump:0,chop:0}} onSave={()=>{}} onExit={()=>{}}/>);expect(pot).not.toContain('Review attached-limb');
});
it('pausing the memory reveal preserves its active sequence position and excludes paused time from reaction scoring',()=>{
 const h=harness('memory');h.command('begin');h.advance(1250);h.command('pause');expect(h.r.elapsed).toBe(1250);h.advance(90000);h.command('resume');expect(h.now-h.r.opened).toBe(1250);
 const l=harness('lightning');l.command('begin');l.advance(100);l.command('pause');l.advance(10000);l.command('resume');l.advance(150);l.winAnswer();expect(l.r.reactionTotal).toBe(250);
});
it('daily Shadow objective with a repeated hand cannot claim its bonus',()=>{
 const h=harness('shadow');complete(h);const state=h.p;expect(state.academy.claimed).toHaveLength(1);
 // The completion reducer derives noRepeat from submitted hands; there is no caller-supplied success field.
 const loss=harness('shadow');loss.command('begin');const target=loss.r.target;loss.command('answer',{hand:target});loss.command('next');loss.command('answer',{hand:target});expect(loss.r.noRepeat).toBe(false);
});

it('shows one playable card per training game, with no no-op tabs, duplicated daily launches or locked rewards',()=>{
 const html=renderToStaticMarkup(<AcademyHall p={parseProfile({})} dispatch={()=>{}} onExit={()=>{}} onShop={()=>{}} onSound={()=>{}} fighter={()=><div/>}/>);
 expect((html.match(/data-academy-game=/g)||[])).toHaveLength(8);
 expect((html.match(/>PLAY: /g)||[])).toHaveLength(8);
 for(const id of academyIds)expect(html.split(`data-academy-game="${id}"`)).toHaveLength(2);
 for(const text of ['MINI-GAME CHALLENGES</button>','START DAILY OBJECTIVE','BELT PROGRESSION</button>','>GRANDMASTER SURVIVAL</button>','LOCKED','TRAINING EQUIPMENT'])expect(html).not.toContain(text);
});
for(const game of academyIds)it(`${game}: menu launch enters live play immediately and accepts a real answer`,()=>{
 let p=parseProfile({});p=applyAcademy(p,{action:'start',id:`direct-${game}`,game,difficulty:1,playImmediately:true},time,.31);
 let r=p.academy.run!;expect(r.phase).toBe(game==='memory'?'watch':'play');expect(r.deadline).toBeGreaterThan(time);
 const render=()=>renderToStaticMarkup(<AcademyHall p={p} dispatch={()=>{}} onExit={()=>{}} onShop={()=>{}} onSound={()=>{}} fighter={()=><div/>}/>);
 expect(render()).not.toContain('BEGIN TRAINING');
 let at=time+10;
 if(game==='memory'){at=r.deadline;p=applyAcademy(p,{action:'tick',id:r.id,turn:r.turn},at,.31);r=p.academy.run!;}
 expect(render()).toContain('ROCK (1)');
 const hand=game==='memory'?r.sequence[0]:game==='says'?(r.valid?r.target:'hold'):counterTo(r.target);
 p=applyAcademy(p,{action:'answer',id:r.id,turn:r.turn,hand},at,.31);expect(p.academy.run!.attempts).toBe(1);expect(p.academy.run!.score).toBe(game==='memory'?0:1);
});
it('all academy duels use equal thirds regardless of repeated history, opponent stage or difficulty',()=>{
 for(const game of ['frenzy','shadow','trial','grandmaster'] as const){
  const h=harness(game);h.command('begin');
  for(const wins of [0,1,3,9,30])for(const hand of MOVES){
   const r={...h.r,wins,history:Array(5).fill(hand)};
   const counts={rock:0,paper:0,scissors:0};
   for(let i=0;i<300;i++)counts[chooseAcademyRival(r,(i+.5)/300)]++;
   expect(counts).toEqual({rock:100,paper:100,scissors:100});
  }
 }
});

it('rejects new Dummy Destroyer attempts and removes it from every daily rotation',()=>{
 const p=parseProfile({});expect(applyAcademy(p,{action:'start',id:'removed',game:'dummy',difficulty:1,playImmediately:true},time,.3)).toBe(p);
 for(let day=0;day<9;day++){const games=dailyAcademy(time+day*86400000);expect(games).not.toContain('dummy');expect(new Set(games).size).toBe(3);}
});
it('retires saved Dummy runs without deleting earned progress or other saved games',()=>{
 const h=harness('lightning');h.command('begin');const raw=JSON.parse(JSON.stringify(h.p));raw.academy.run.game='dummy';raw.academy.clears.dummy=4;raw.academy.records.dummy=10;raw.academy.xp=250;
 const p=parseProfile(raw);expect(p.academy.run).toBeNull();expect(p.academy.clears.dummy).toBe(4);expect(p.academy.records.dummy).toBe(10);expect(p.academy.xp).toBe(250);expect(p.coins).toBe(h.p.coins);expect(parseProfile(JSON.parse(JSON.stringify(h.p))).academy.run?.game).toBe('lightning');
});

it('rejects Sensei starts, removes its daily objective, and preserves earned Sensei records on migration',()=>{
 const p=parseProfile({});expect(applyAcademy(p,{action:'start',id:'removed-sensei',game:'sensei',difficulty:1},time,.3)).toBe(p);
 for(let day=0;day<9;day++)expect(dailyAcademy(time+day*86400000)).not.toContain('sensei');
 const h=harness('lightning');h.command('begin');const raw=JSON.parse(JSON.stringify(h.p));raw.academy.run.game='sensei';raw.academy.clears.sensei=2;raw.academy.records.sensei=5;raw.academy.xp=200;
 const migrated=parseProfile(raw);expect(migrated.academy.run).toBeNull();expect(migrated.academy.clears.sensei).toBe(2);expect(migrated.academy.records.sensei).toBe(5);expect(migrated.academy.xp).toBe(200);expect(migrated.coins).toBe(h.p.coins);
});
