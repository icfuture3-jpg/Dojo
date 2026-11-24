// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {ShopPanel} from './meta';
import {Fighter} from './hud';
import {parseProfile} from './economy';
import {EPIC_SKINS} from './epic-skins';
import {EpicSkinPortrait} from './epic-skin-art';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';});
it('draws distinct skin silhouettes in shop portraits and equipped fighters',()=>{
 const portraits=EPIC_SKINS.map(s=>renderToStaticMarkup(<EpicSkinPortrait skin={s}/>));
 expect(new Set(portraits).size).toBe(7);
 for(const skin of EPIC_SKINS){
  const markup=renderToStaticMarkup(<Fighter skin={skin.id} color="#123456" belt="#ffffff" move={null} state="idle"/>);
  const el=document.createElement('div');el.innerHTML=markup;
  expect(el.querySelector(`[data-epic-skin="${skin.id}"]`)?.closest('.fighter-upper-body')).not.toBeNull();
  expect(markup).toContain(skin.accent);
 }
});
it('shows all seven prices, rarity tiers, affordability and next-diamond progress in the skin shop',async()=>{
 const p=parseProfile({gems:20,diamondWins:7});const dispatch=vi.fn();
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<ShopPanel p={p} dispatch={dispatch} onClose={()=>{}}/>));
 await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Skins')!.click());
 expect(document.body.textContent).toContain('Progress: 7/10 wins');
 expect(document.body.textContent).toContain('3 wins to your next diamond');
 for(const [i,skin] of EPIC_SKINS.entries()){
  expect(document.body.textContent).toContain(`DIAMOND TIER ${i+1} · 💎 ${skin.gems}`);
  expect(document.querySelector(`[aria-label="${skin.name} skin"]`)).not.toBeNull();
 }
 const buys=[...document.querySelectorAll('button')].filter(b=>b.textContent?.startsWith('BUY 💎'));
 expect(buys.filter(b=>!b.disabled)).toHaveLength(1);
 await act(()=>buys.find(b=>!b.disabled)!.click());
 const emit=vi.fn();dispatch.mock.calls[0][0].message.send(emit);
 expect(emit).toHaveBeenCalledWith('buyItem',{id:EPIC_SKINS[0].id});
});
