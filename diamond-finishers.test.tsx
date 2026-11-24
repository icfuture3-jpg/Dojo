// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {ITEMS,parseProfile,buyItem,equipItem,openBox,TROPHIES} from './economy';
import {ShopPanel} from './meta';
const epic=ITEMS.filter(i=>i.slot==='finisher'&&i.rarity==='epic');
it('charges only diamonds for the six Epic finishers and retains lower-tier coin prices',()=>{
 expect(epic.map(i=>i.gems)).toEqual([20,30,40,50,60,70]);
 for(const item of epic){
  expect(item.coins).toBe(0);expect(item.diamondOnly).toBe(true);
  const p=parseProfile({coins:99999,gems:item.gems-1,trophies:TROPHIES.map(t=>t.id)});
  expect(buyItem(p,item.id)).toBeNull();
  const next=buyItem({...p,gems:item.gems},item.id)!;
  expect(next.coins).toBe(p.coins);expect(next.gems).toBe(0);expect(next.equip.finisher).toBe(item.id);
  expect(buyItem(next,item.id)).toBeNull();
  const old=parseProfile({owned:[item.id],equip:{finisher:item.id},gems:0});
  expect(equipItem(old,item.id)?.equip.finisher).toBe(item.id);
  expect(parseProfile(JSON.parse(JSON.stringify(old))).owned).toContain(item.id);
 }
 for(let n=0;n<6;n++){const item=ITEMS.find(i=>i.id===`finisher-${n}`)!;expect(item.gems).toBe(0);expect(item.coins).toBe(100+n*50);}
});
it('excludes Epic finishers from box drops without removing non-Epic finishers',()=>{
 const p=parseProfile({rp:9999,freeBoxes:1,trophies:TROPHIES.map(t=>t.id)});const found=new Set<string>();
 for(let n=0;n<3000;n++){const id=openBox(p,'free',()=>(n+.5)/3000)!.last.box;found.add(id);expect(epic.some(i=>i.id===id)).toBe(false);}
 expect([...found].some(id=>id.startsWith('finisher-'))).toBe(true);
});
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';});
it('keeps diamond finishers and previews in the same Finishers shop tab',async()=>{
 const dispatch=vi.fn();const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<ShopPanel p={parseProfile({gems:20,coins:9999})} dispatch={dispatch} onClose={()=>{}}/>));
 await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Finishers')!.click());
 expect([...document.querySelectorAll('button')].filter(b=>b.textContent==='PREVIEW MOVE')).toHaveLength(12);
 for(const item of epic)expect(document.body.textContent).toContain(item.name);
 expect(document.body.textContent).not.toContain('DIAMOND TIER');
 const buys=[...document.querySelectorAll('button')].filter(b=>b.textContent?.startsWith('BUY 💎'));
 expect(buys).toHaveLength(6);expect(buys.filter(b=>!b.disabled)).toHaveLength(1);
 await act(()=>buys.find(b=>!b.disabled)!.click());const emit=vi.fn();dispatch.mock.calls[0][0].message.send(emit);
 expect(emit).toHaveBeenCalledWith('buyItem',{id:'finisher-6'});
});
