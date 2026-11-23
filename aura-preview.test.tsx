// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {ShopPanel} from './meta';
import {Fighter} from './hud';
import {ITEMS,parseProfile} from './economy';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';});
it('previews every aura, including locked/unaffordable ones, without changing ownership or equipped appearance',async()=>{
 const p=parseProfile({coins:0}),before=JSON.stringify(p),dispatch=vi.fn(),close=vi.fn();
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 const avatar=(aura:string)=><Fighter color="#2471a3" belt="#fff" skin="skin-panda" aura={aura} move={null} state="idle"/>;
 await act(()=>root!.render(<ShopPanel p={p} dispatch={dispatch} onClose={close} avatar={avatar('#ff0000')} auraPreview={avatar}/>));
 await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='Auras')!.click());
 const auras=ITEMS.filter(i=>i.slot==='aura');expect(document.querySelectorAll('[aria-label^="Preview "]')).toHaveLength(auras.length);
 for(const aura of auras){
  const b=document.querySelector<HTMLButtonElement>(`[aria-label="Preview ${aura.name}"]`)!;expect(b.disabled).toBe(false);await act(()=>b.click());
  const dialog=document.querySelector(`[aria-label="${aura.name} preview"]`)!;expect(dialog).not.toBeNull();expect(dialog.textContent).toContain('preview only');
  expect(dialog.querySelector('.cutout-fighter')).not.toBeNull();
  if(aura.color!=='#0000')expect(dialog.innerHTML).toContain(aura.color);
  await act(()=>dialog.querySelector<HTMLButtonElement>('button')!.click());expect(document.querySelector('.aura-preview')).toBeNull();
 }
 expect(dispatch).not.toHaveBeenCalled();expect(close).not.toHaveBeenCalled();expect(JSON.stringify(p)).toBe(before);
 expect(document.querySelector('[aria-label="Your saved character wearing the equipped outfit"]')?.innerHTML).toContain('#ff0000');
});
