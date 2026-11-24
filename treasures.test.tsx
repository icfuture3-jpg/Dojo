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
import {applyLogin,parseProfile,TROPHIES} from './economy';
import {applyAction} from './actions';
import {loadSave,saveProfile} from './saves';
const now=Date.UTC(2026,10,24);
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
 expect(el.querySelector('[aria-label="Treasures collection"]')?.textContent).toContain('6/6');
 for(const t of TROPHIES)expect(el.textContent).toContain(t.name);
 expect(el.textContent).toContain('Legendary treasure');expect(el.textContent).toContain('Historical artifact type');
 expect(el.textContent).toContain('not wearable combat armor');expect(el.textContent).toContain('meaning remains debated');
 expect(p.coins).toBe(777);expect(p.trophies).toEqual(['first-win']);
});
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();});
it('opens Treasures from the actual main menu and returns to the dojo without changing progress',async()=>{
 const p=applyLogin(parseProfile({diamondWins:20}),now);p.seenNotice=p.last.n;const dispatch=vi.fn();
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<GameHud profileData={JSON.stringify(p)} boardData="[]" boardId="local" dispatch={dispatch}/>));
 await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('TROPHIES & TREASURES'))!.click());
 expect(document.querySelector('[aria-label="Treasures collection"]')?.textContent).toContain('2/6');
 await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('BACK'))!.click());
 expect(document.querySelector('[aria-label="Treasures collection"]')).toBeNull();
 expect(document.querySelector('[aria-label="Dojo main menu"]')).not.toBeNull();expect(dispatch).not.toHaveBeenCalled();
});
