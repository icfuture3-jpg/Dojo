import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TROPHIES, collectTrophies, parseProfile, ITEMS, type Profile } from './economy';
import { applyAction } from './actions';
import { playableAcademyIds } from './academy-state';
import { TrophiesPanel } from './meta';
const ids=['pot-triad','lightning-perfect','memory-clear','shadow-variety','academy-versatile','upgrade-toolkit','equipped-finish','rescue-lantern'];
const fresh=()=>parseProfile({saveVersion:4});
function baseline(){const p=fresh();p.trophies=TROPHIES.filter(t=>!ids.includes(t.id)).map(t=>t.id);return p;}
it('adds eight distinct goals and names, without reusing existing trophy IDs, names or win/streak thresholds',()=>{
 const added=TROPHIES.filter(t=>ids.includes(t.id));expect(added).toHaveLength(8);
 for(const key of ['id','name','blurb'] as const)expect(new Set(added.map(t=>t[key])).size).toBe(8);
 expect(new Set(TROPHIES.map(t=>t.id)).size).toBe(TROPHIES.length);expect(new Set(TROPHIES.map(t=>t.name)).size).toBe(TROPHIES.length);
 const p=fresh();p.stats.won=1000;p.stats.champs=100;p.stats.rounds=1000;p.bestMatchStreak=100;p.streak=100;p.rp=10000;
 for(const t of added)expect(t.test(p),t.id).toBe(false);
});
it('each new trophy requires its own goal, rewards once and survives reload',()=>{
 const cases:[string,(p:Profile)=>void][]=[
 ['pot-triad',p=>{p.potBest={throw:5,jump:5,chop:5};}],
 ['lightning-perfect',p=>{p.academy.clears.lightning=1;p.academy.records.lightningAccuracy=100;}],
 ['memory-clear',p=>{p.academy.clears.memory=1;}],
 ['academy-versatile',p=>{for(const id of playableAcademyIds)p.academy.clears[id]=1;}],
 ['upgrade-toolkit',p=>{p.up={coin:1,xp:1,eye:1};}],
 ['equipped-finish',p=>{for(const slot of ['gi','band','aura','finisher'] as const){const item=ITEMS.find(i=>i.slot===slot&&(i.coins>0||i.gems>0))!;p.owned.push(item.id);p.equip[slot]=item.id;}}],
 ['rescue-lantern',p=>{p.stats.rescued=1;}],
 ];
 for(const [id,qualify] of cases){const p=baseline();expect(TROPHIES.find(t=>t.id===id)!.test(p)).toBe(false);qualify(p);const next=collectTrophies(p);expect(next.trophies).toContain(id);expect(p.trophies).not.toContain(id);const loaded=parseProfile(JSON.parse(JSON.stringify(next)));expect(collectTrophies(loaded)).toBe(loaded);expect(loaded.coins).toBe(next.coins);}
});
it('pot trophy unlocks immediately through real score actions, not only on next login',()=>{
 let p=baseline();p=applyAction(p,'potDone',{mode:'throw',hits:5},1);p=applyAction(p,'potDone',{mode:'jump',hits:5},2);expect(p.trophies).not.toContain('pot-triad');const old=p;p=applyAction(p,'potDone',{mode:'chop',hits:5},3);expect(p.trophies).toContain('pot-triad');expect(p.coins-old.coins).toBe(120);expect(p.gems-old.gems).toBe(2);expect(applyAction(p,'potDone',{mode:'chop',hits:5},4).coins).toBe(p.coins);
});
it('academy clears award memory and lightning trophies immediately, without duplicate payouts',()=>{
 for(const game of ['memory','lightning'] as const){let p=baseline(),now=100;
 const send=(action:string,extra:object={})=>{const r=p.academy.run;p=applyAction(p,'academy',{action,id:r?.id,turn:r?.turn,...extra},now,.2);};
 send('start',{id:game,game,difficulty:1,playImmediately:true});
 for(let guard=0;guard<100&&p.academy.run?.phase!=='won';guard++){
 const r=p.academy.run!;
 if(r.phase==='watch'){now=r.deadline;send('tick');}else if(r.phase==='review')send('next');else{now+=10;send('answer',{hand:game==='memory'?r.sequence[r.attempts]:({rock:'paper',paper:'scissors',scissors:'rock'} as const)[r.target]});}
 }
 expect(p.academy.run?.phase).toBe('won');expect(p.trophies).toContain(game==='memory'?'memory-clear':'lightning-perfect');const coins=p.coins;send('tick');expect(p.coins).toBe(coins);
 }
});
it('varied Shadow trophy requires an actual paid win with no repeated hand',()=>{
 let p=baseline(),now=100;const send=(action:string,extra:object={},random=.1)=>{const r=p.academy.run;p=applyAction(p,'academy',{action,id:r?.id,turn:r?.turn,...extra},now,random);};
 send('start',{id:'varied',game:'shadow',difficulty:1,playImmediately:true});
 for(const [hand,random] of [['paper',.5],['scissors',.8],['rock',.1]] as const){now+=20;send('answer',{hand});if(p.academy.run!.phase==='review')send('next',{},random);}
 expect(p.academy.run?.phase).toBe('won');expect(p.trophies).toContain('shadow-variety');const coins=p.coins;send('tick');expect(p.coins).toBe(coins);
 const t=TROPHIES.find(t=>t.id==='shadow-variety')!;expect(t.test({...p,academy:{...p.academy,run:{...p.academy.run!,paid:false}}})).toBe(false);expect(t.test({...p,academy:{...p.academy,run:{...p.academy.run!,noRepeat:false}}})).toBe(false);
});
it('renders all new goals in the actual trophy section and preserves existing earned trophies',()=>{
 const p=baseline(),html=renderToStaticMarkup(<TrophiesPanel p={p} onClose={()=>{}}/>);
 for(const t of TROPHIES.filter(t=>ids.includes(t.id)))expect(html).toContain(t.name);
 expect(parseProfile(JSON.parse(JSON.stringify(p))).trophies).toEqual(p.trophies);
});
it('does not unlock new trophies for partial goals or unowned equipment',()=>{
 const byId=(id:string)=>TROPHIES.find(t=>t.id===id)!;
 let p=fresh();p.potBest={throw:5,jump:5,chop:4};expect(byId('pot-triad').test(p)).toBe(false);
 p=fresh();p.academy.clears.lightning=1;p.academy.records.lightningAccuracy=99;expect(byId('lightning-perfect').test(p)).toBe(false);p.academy.clears.lightning=0;p.academy.records.lightningAccuracy=100;expect(byId('lightning-perfect').test(p)).toBe(false);
 p=fresh();for(const id of playableAcademyIds.slice(0,-1))p.academy.clears[id]=1;p.academy.clears.dummy=10;p.academy.clears.sensei=10;expect(byId('academy-versatile').test(p)).toBe(false);
 p=fresh();p.up={coin:3,xp:0,eye:3};expect(byId('upgrade-toolkit').test(p)).toBe(false);
 p=fresh();for(const slot of ['gi','band','aura','finisher'] as const)p.equip[slot]=ITEMS.find(i=>i.slot===slot&&(i.coins>0||i.gems>0))!.id;expect(byId('equipped-finish').test(p)).toBe(false);
});
it('upgrade and equipment actions award the corresponding trophy immediately and reject fake or duplicate rewards',()=>{
 let p=baseline();p.coins=5000;
 for(const id of ['coin','xp'])p=applyAction(p,'buyUpgrade',{id},1);
 expect(p.trophies).toContain('upgrade-toolkit');expect(p.trophies.filter(id=>id==='upgrade-toolkit')).toHaveLength(1);
 p=baseline();for(const slot of ['gi','band','aura','finisher'] as const){const item=ITEMS.find(i=>i.slot===slot&&(i.coins>0||i.gems>0))!;p.owned.push(item.id);p=applyAction(p,'equip',{id:item.id},1);}
 expect(p.trophies).toContain('equipped-finish');const coins=p.coins;const next=applyAction(p,'equip',{id:p.equip.finisher},2);expect(next.coins).toBe(coins);expect(applyAction(p,'equip',{id:'fake'},3)).toBe(p);
});
