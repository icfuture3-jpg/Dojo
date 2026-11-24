// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {FRIENDS} from './friends';
import {FriendArt,FRIEND_ABILITIES} from './friend-art';
import {FriendsPanel} from './friends-panel';
import {parseProfile} from './economy';
import {readFileSync} from 'node:fs';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';});
it('uses a different supplied PNG for every friend, identical across cards and previews',()=>{
 const paths:string[]=[];
 for(const f of FRIENDS){
  const el=document.createElement('div'),card=document.createElement('div');
  el.innerHTML=renderToStaticMarkup(<FriendArt friend={f} ability/>);
  card.innerHTML=renderToStaticMarkup(<FriendArt friend={f}/>);
  const image=el.querySelector('image')!;expect(image).not.toBeNull();
  expect(image.getAttribute('href')).toBe(card.querySelector('image')!.getAttribute('href'));
  expect(image.getAttribute('href')).toContain(`images/friends/${f.id}.png`);
  expect(el.querySelector('[data-reference-art]')!.children).toHaveLength(1);
  expect(el.querySelector('[data-reference-art] path')).toBeNull(); // no second drawn face
  paths.push(image.getAttribute('href')!);
  expect(el.querySelector(`[data-ability="${f.id}"]`)).not.toBeNull();
 }
 expect(new Set(paths).size).toBe(14);
 const css=readFileSync('friend-art.css','utf8');
 expect(css).toContain('prefers-reduced-motion:reduce');expect(css).toContain('animation:none!important');
 expect(css).toContain('.friend-art image{opacity:1;filter:none');
});
it('previews every friend including locked ones without equipping, charging or emitting actions',async()=>{
 const p=parseProfile({diamondWins:3,companion:'carp',coins:777,gems:12}),before=JSON.stringify(p),dispatch=vi.fn();
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<FriendsPanel p={p} dispatch={dispatch} onClose={()=>{}}/>));
 for(const f of FRIENDS){
  await act(()=>document.querySelector<HTMLButtonElement>(`[aria-label="Preview ${f.name}"]`)!.click());
  const dialog=document.querySelector(`[aria-label="${f.name} ability preview"]`)!;
  expect(dialog).not.toBeNull();expect(dialog.textContent).toContain(FRIEND_ABILITIES[f.id].name);
  expect(dialog.querySelector('[data-ability]')?.getAttribute('data-ability')).toBe(f.id);
  expect(dialog.textContent).toContain('no damage, buffs, purchases');
  expect(document.querySelector('[inert]')).not.toBeNull();
  await act(()=>[...dialog.querySelectorAll('button')].find(b=>b.textContent==='BACK TO FRIENDS')!.click());
  expect(document.querySelector('[role="dialog"]')).toBeNull();
 }
 expect(dispatch).not.toHaveBeenCalled();expect(JSON.stringify(p)).toBe(before);
});
it('switches the showcase to another friend without leaving an old ability behind',async()=>{
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<FriendsPanel p={parseProfile({})} dispatch={()=>{}} onClose={()=>{}}/>));
 await act(()=>document.querySelector<HTMLButtonElement>('[aria-label="Preview Dragon-Gate Carp"]')!.click());
 const dialog=document.querySelector('[role="dialog"]')!;
 await act(()=>[...dialog.querySelectorAll('button')].find(b=>b.textContent==='Azure River Dragon')!.click());
 expect(document.querySelectorAll('[data-ability]')).toHaveLength(1);
 expect(document.querySelector('[data-ability]')?.getAttribute('data-ability')).toBe('azure-dragon');
});
