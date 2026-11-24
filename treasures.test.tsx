// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {TREASURES} from './treasures';
import {TreasureArt} from './treasure-art';
import {TreasuresCollection} from './treasures-panel';
import {GameHud} from './hud';
import {TrophiesPanel} from './meta';
import {ShopUpgrades,UpgradeArt} from './shop-upgrades';
import {applyLogin,parseProfile,TROPHIES} from './economy';
import {applyAction} from './actions';
import {loadSave,saveProfile} from './saves';
const now=Date.UTC(2026,10,24);
it('shows treasure descriptions and win requirements directly below the count without introductory notices',()=>{
 const el=document.createElement('div');el.innerHTML=renderToStaticMarkup(<TreasuresCollection wins={0}/>);
 const section=el.querySelector('section')!;
 expect(section.querySelector('h2')?.textContent).toBe('TREASURES · 0/6');
 expect([...section.children].map(e=>e.tagName)).toEqual(['H2','DIV']);
 expect(section.textContent).not.toContain('Collect treasures through');
 expect(section.textContent).not.toContain('Legendary treasures are folklore-inspired');
 for(const treasure of TREASURES){
  const row=[...section.querySelectorAll('article')].find(a=>a.textContent?.includes(treasure.name))!;
  expect(row.textContent).toContain(treasure.description);
  expect(row.textContent).toContain(`Earn at ${treasure.wins} fight wins`);
 }
});
it('six treasures unlock at exact fight-win boundaries without costs or new coin rules',()=>{
 expect(TREASURES.map(t=>t.wins)).toEqual([5,20,45,80,125,180]);
 expect(new Set(TREASURES.map(t=>t.id)).size).toBe(6);
 for(const t of TREASURES){
  const el=document.createElement('div');el.innerHTML=renderToStaticMarkup(<TreasuresCollection wins={t.wins-1}/>);
  const card=[...el.querySelectorAll('article')].find(a=>a.textContent?.includes(t.name))!;
  expect(card.textContent).toContain('LOCKED · 1 more wins');
  const p=applyLogin(parseProfile({coins:777,gems:17,diamondWins:t.wins-1}),now);
  const result={completionId:t.id,rival:0,won:true,roundsWon:3,roundsLost:1,comeback:false,perfectRun:false};
  const next=applyAction(p,'matchDone',result,now);
  expect(next.coins).toBeGreaterThan(p.coins);expect(next.diamondWins).toBe(t.wins);
  const map=new Map<string,string>();const storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};
  expect(saveProfile(storage,next)).toBeNull();const loaded=loadSave(storage,now).profile;
  el.innerHTML=renderToStaticMarkup(<TreasuresCollection wins={loaded.diamondWins}/>);
  expect([...el.querySelectorAll('article')].find(a=>a.textContent?.includes(t.name))!.textContent).toContain('✓ COLLECTED');
  expect(loaded.coins).toBe(next.coins);expect(loaded.gems).toBe(next.gems);
  expect(applyAction(loaded,'matchDone',result,now)).toBe(loaded);
 }
});
it('draws all six specific artifacts with unique, locally resolved SVG paints',()=>{
 const el=document.createElement('div');el.innerHTML=renderToStaticMarkup(<>{TREASURES.map(t=><TreasureArt key={t.id} treasure={t}/>)}</>);
 expect(el.querySelectorAll('[data-treasure]').length).toBe(6);
 const ids=[...el.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 for(const shape of el.querySelectorAll('[fill^="url(#"]'))expect(ids).toContain(shape.getAttribute('fill')!.slice(5,-1));
 for(const t of TREASURES)expect(el.querySelector(`[data-treasure="${t.id}"]`)?.getAttribute('aria-label')).toBe(t.name);
});
it('keeps existing trophies and distinguishes legends from historical artifacts',async()=>{
 const p=parseProfile({trophies:['first-win'],diamondWins:180,coins:777});
 const host=document.createElement("main");document.body.append(host);root=createRoot(host);
 await act(()=>root!.render(<TrophiesPanel p={p} onClose={()=>{}}/>));
 const el=document.body;
 expect(el.querySelector('[aria-label="Treasures collection"]')).toBeNull();
 for(const t of TROPHIES)expect(el.textContent).toContain(t.name);
 for(const t of TREASURES)expect(el.textContent).not.toContain(t.name);
 const treasures=document.createElement('div');treasures.innerHTML=renderToStaticMarkup(<ShopUpgrades p={p} dispatch={()=>{}}/>);
 expect(treasures.querySelector('[aria-label="Treasures collection"]')?.textContent).toContain('6/6');
 expect(treasures.textContent).toContain('Legendary treasure');expect(treasures.textContent).toContain('Historical artifact type');
 expect(treasures.textContent).toContain('not wearable combat armor');expect(treasures.textContent).toContain('meaning remains debated');
 expect(p.coins).toBe(777);expect(p.trophies).toEqual(['first-win']);
});
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();});
it('keeps Trophies separate and opens treasures only from Shop Upgrades, with working exits',async()=>{
 const p=applyLogin(parseProfile({diamondWins:20}),now);p.seenNotice=p.last.n;const dispatch=vi.fn();
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<GameHud profileData={JSON.stringify(p)} boardData="[]" boardId="local" dispatch={dispatch}/>));
 const click=async(text:string)=>act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent===text)!.click());
 expect(document.body.textContent).not.toContain('TROPHIES & TREASURES');
 await click('🏆 TROPHIES');
 expect(document.querySelector('[aria-label="Treasures collection"]')).toBeNull();
 expect(document.querySelectorAll('[data-trophy]')).toHaveLength(TROPHIES.length);
 await click('✕ BACK');await click('🛍 SHOP');
 expect(document.querySelector('[aria-label="Treasures collection"]')).toBeNull();
 await click('Upgrades');
 expect(document.querySelector('[aria-label="Dojo shop upgrades"]')?.textContent).toContain('DOJO TREASURES');
 expect(document.querySelectorAll('[data-treasure]')).toHaveLength(6);
 expect(document.querySelector('[aria-label="Treasures collection"]')?.textContent).toContain('2/6');
 await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('BACK'))!.click());
 expect(document.querySelector('[aria-label="Treasures collection"]')).toBeNull();
 expect(document.querySelector('[aria-label="Dojo main menu"]')).not.toBeNull();expect(dispatch).not.toHaveBeenCalled();
});


it('shares painted gold/jade materials, display scale and grounded presentation with purse and scroll',()=>{
 const el=document.createElement('div');
 el.innerHTML=renderToStaticMarkup(<><UpgradeArt kind="coin"/><UpgradeArt kind="xp"/>{TREASURES.map(t=><TreasureArt key={t.id} treasure={t}/>)}</>);
 const all=[...el.querySelectorAll('svg')];expect(all).toHaveLength(8);
 const stops=(svg:Element,suffix:string)=>[...svg.querySelector(`linearGradient[id$="-${suffix}"]`)!.children].map(e=>[e.getAttribute('stop-color'),e.getAttribute('offset')]);
 for(const svg of all.slice(2)){
  expect(svg.getAttribute('viewBox')).toBe('0 0 180 150');
  expect(stops(svg,'gold')).toEqual(stops(all[0],'gold'));
  expect(stops(svg,'jade')).toEqual(stops(all[1],'jade'));
  expect(svg.querySelector('[data-ground-shadow]')).not.toBeNull();
  expect(svg.querySelector('[data-engraving]')?.children.length).toBeGreaterThan(0);
  expect(svg.querySelector('rect[fill="#29212e"]')).toBeNull();
 }
 const ids=[...el.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 for(const shape of el.querySelectorAll('[fill^="url(#"],[stroke^="url(#"]'))for(const attr of ['fill','stroke']){
  const value=shape.getAttribute(attr);if(value?.startsWith('url(#'))expect(ids).toContain(value.slice(5,-1));
 }
});
