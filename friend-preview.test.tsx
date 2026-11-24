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
function geometry(friend:typeof FRIENDS[number]){
 const el=document.createElement('div');el.innerHTML=renderToStaticMarkup(<FriendArt friend={friend}/>);
 return [...el.querySelector('[data-silhouette]')!.querySelectorAll('path,ellipse,circle,rect')].map(e=>[e.tagName,...['d','cx','cy','rx','ry','r','x','y','width','height','transform'].map(a=>e.getAttribute(a)??'')].join(':')).join('|');
}
it('all fourteen silhouettes differ even when color, labels and SVG resource IDs are ignored',()=>{
 expect(new Set(FRIENDS.map(geometry)).size).toBe(14);
 const dragons=FRIENDS.filter(f=>f.kind==='dragon');expect(new Set(dragons.map(geometry)).size).toBe(4);
});
it('all friends share identical character geometry between cards and showcases, with distinct effects',()=>{
 const effects:string[]=[];
 for(const f of FRIENDS){
  const el=document.createElement('div');el.innerHTML=renderToStaticMarkup(<FriendArt friend={f} ability/>);
  expect(el.querySelector(`[data-silhouette="${f.id}"]`)).not.toBeNull();
  expect(el.querySelector(`[data-ability="${f.id}"]`)?.children.length).toBeGreaterThan(0);
  effects.push(el.querySelector('[data-ability]')!.innerHTML);
  const card=document.createElement('div');card.innerHTML=renderToStaticMarkup(<FriendArt friend={f}/>);
  const normalize=(html:string)=>html.replace(/url\(#[^)]+\)/g,'PAINT');
  expect(normalize(el.querySelector('[data-silhouette]')!.innerHTML)).toBe(normalize(card.querySelector('[data-silhouette]')!.innerHTML));
  expect(FRIEND_ABILITIES[f.id].name.length).toBeGreaterThan(4);
 }
 expect(new Set(effects).size).toBe(14);
 const css=readFileSync('friend-art.css','utf8');
 expect(css).toContain('prefers-reduced-motion:reduce');expect(css).toContain('animation:none!important');
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
