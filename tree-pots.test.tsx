import {it,expect} from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TreePots,POT_MODES,potHit,potSpeed,potPosition } from './tree-pots';
import {parseProfile,savePotScore} from './economy';
it('offers three standalone challenges',()=>{expect(Object.keys(POT_MODES)).toHaveLength(3);const html=renderToStaticMarkup(<TreePots avatar={<div>Custom fighter</div>} best={{throw:0,jump:0,chop:0}} onSave={()=>{}} onExit={()=>{}}/>);for(const m of Object.values(POT_MODES))expect(html).toContain(m.name);});
it('uses a narrower timing window',()=>{expect(potHit(40)).toBe(true);expect(potHit(60)).toBe(true);expect(potHit(39)).toBe(false);expect(potHit(61)).toBe(false);expect(potHit(10)).toBe(false);});
it('saves separate personal bests without lowering them',()=>{const p=parseProfile({coins:234});const next=savePotScore(p,'jump',4)!;expect(next.potBest.jump).toBe(4);expect(next.potBest.throw).toBe(0);expect(savePotScore(next,'jump',1)!.potBest.jump).toBe(4);expect(savePotScore(p,'chop',8)).toBeNull();expect(p.coins).toBe(234);expect(parseProfile(JSON.parse(JSON.stringify(next))).potBest.jump).toBe(4);});

it('speeds up the shared indicator after every attempt and resets on a new run',()=>{
 expect([0,1,2,3,4].map(potSpeed)).toEqual([1,1.2,1.4,1.6,1.8]);
 const firstCenterTime=700*Math.PI/2;
 for(let attempt=0;attempt<5;attempt++){
  expect(potPosition(firstCenterTime/potSpeed(attempt),attempt)).toBeCloseTo(50);
  expect(potPosition(0,attempt)).toBe(0);
  if(attempt>0)expect(potPosition(300,attempt)).toBeGreaterThan(potPosition(300,attempt-1));
 }
 expect(potPosition(firstCenterTime,0)).toBeCloseTo(50);
});
it('keeps the accelerating indicator inside the timing track',()=>{
 for(let attempt=0;attempt<5;attempt++)for(let ms=0;ms<=10000;ms+=50){
  expect(potPosition(ms,attempt)).toBeGreaterThanOrEqual(0);
  expect(potPosition(ms,attempt)).toBeLessThanOrEqual(100);
 }
});
