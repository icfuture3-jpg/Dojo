import {expect,it} from 'vitest';
import {applyAction} from './actions';
import {applyLogin,awardActivity,buyItem,equipItem,findItem,ITEMS,openBox,parseProfile,TROPHIES} from './economy';
import {EPIC_SKINS} from './epic-skins';
import {loadSave,saveProfile,SAVE_KEY} from './saves';
const now=Date.UTC(2026,10,24);
const result=(completionId:string,won=true)=>({completionId,rival:0,won,roundsWon:won?3:0,roundsLost:won?0:3,comeback:false,perfectRun:false});
it('earns exactly one diamond for ten new fight wins, across losses, reloads and duplicate events',()=>{
 let p=applyLogin(parseProfile({gems:23,stats:{won:500}}),now);
 expect(p.diamondWins).toBe(0);expect(p.gems).toBe(23); // no retroactive payment
 for(let i=0;i<9;i++)p=applyAction(p,'matchDone',result(`win-${i}`),now);
 expect(p.gems).toBe(23);expect(p.diamondWins).toBe(9);
 p=applyAction(p,'matchDone',result('loss',false),now);
 expect(p.diamondWins).toBe(9);expect(p.matchStreak).toBe(0);
 const map=new Map<string,string>();const storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};
 expect(saveProfile(storage,p)).toBeNull();p=loadSave(storage,now).profile;
 p=applyAction(p,'matchDone',result('tenth'),now);
 expect([p.gems,p.diamondWins]).toEqual([24,10]);
 expect(applyAction(p,'matchDone',result('tenth'),now)).toBe(p);
 expect(p.last.lines.join(' ')).toContain('+1 diamond');
 for(let i=0;i<10;i++)p=applyAction(p,'matchDone',result(`more-${i}`),now);
 expect([p.gems,p.diamondWins]).toEqual([25,20]);
 expect(JSON.parse(map.get(SAVE_KEY)!).diamondWins).toBe(9);
});
it('does not give new diamonds for logins, level-ups, trophies or activity rewards',()=>{
 let p=parseProfile({gems:12,xp:1900,rp:2400,stats:{won:100,champs:3},streak:6,lastLogin:'2026-11-23',season:'2026-10'});
 p=applyLogin(p,now);expect(p.gems).toBe(12);
 p=awardActivity(p,{coins:100,xp:5000,gems:99},'Training');expect(p.gems).toBe(12);
 expect(TROPHIES.every(t=>t.reward.gems===0)).toBe(true);
 expect(parseProfile({}).gems).toBe(0);
 const old=parseProfile({gems:57,owned:['gi-blue','skin-oni'],equip:{skin:'skin-oni'},stats:{won:200}});
 expect(old.gems).toBe(57);expect(old.equip.skin).toBe('skin-oni');expect(old.diamondWins).toBe(0);
});
it.each(['tower','daily','rescue'] as const)('%s fights count only validated wins; spectators never count',mode=>{
 let p=applyLogin(parseProfile({diamondWins:9}),now);
 p=applyAction(p,'modeDone',{completionId:mode,mode,floor:0,won:true,correct:false},now);
 expect([p.gems,p.diamondWins]).toEqual([1,10]);
 expect(applyAction(p,'modeDone',{completionId:mode,mode,floor:0,won:true},now)).toBe(p);
});
it('rejects invalid wins and excludes spectating and training from diamond progress',()=>{
 const p=applyLogin(parseProfile({diamondWins:9}),now);
 expect(applyAction(p,'matchDone',{...result('bad'),roundsWon:1},now)).toBe(p);
 const watched=applyAction(p,'modeDone',{completionId:'watch',mode:'spectate',floor:0,won:true,correct:true},now);
 expect([watched.gems,watched.diamondWins]).toEqual([0,9]);
 expect(applyAction(p,'potDone',{mode:'throw',hits:5},now).diamondWins).toBe(9);
});
it('seven diamond tiers buy and equip at the exact price, without coin substitutes or repeat charges',()=>{
 expect(EPIC_SKINS.map(s=>s.gems)).toEqual([20,50,100,200,350,500,650]);
 for(const skin of EPIC_SKINS){
  const it=findItem(skin.id)!;expect(it.diamondOnly).toBe(true);expect(it.coins).toBe(0);
  const p=parseProfile({coins:999999,gems:skin.gems-1});expect(buyItem(p,skin.id)).toBeNull();
  const next=buyItem({...p,gems:skin.gems},skin.id)!;
  expect(next.gems).toBe(0);expect(next.coins).toBe(p.coins);expect(next.equip.skin).toBe(skin.id);
  expect(buyItem(next,skin.id)).toBeNull();expect(equipItem(p,skin.id)).toBeNull();
  expect(parseProfile(JSON.parse(JSON.stringify(next))).equip.skin).toBe(skin.id);
 }
});
it('diamond-exclusive skins never enter the mystery-box pool at any rank',()=>{
 const p=parseProfile({rp:999999,freeBoxes:1,trophies:TROPHIES.map(t=>t.id)});
 for(let i=0;i<2000;i++)expect(ITEMS.find(it=>it.id===openBox(p,'free',()=>(i+.5)/2000)!.last.box)?.diamondOnly).not.toBe(true);
});
