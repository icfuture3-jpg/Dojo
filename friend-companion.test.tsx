// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {FRIENDS} from './friends';
import {Fighter,GameHud} from './hud';
import {parseProfile} from './economy';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();});

it('layers each animated equipped friend before the fighter body, without showing a friend on opponents',()=>{
 for(const companion of FRIENDS){
  const el=document.createElement('main');el.innerHTML=renderToStaticMarkup(<Fighter companion={companion} color="#2471a3" belt="#fff" move={null} state="idle"/>);
  const fighter=el.querySelector('.cutout-fighter')!;
  expect(fighter.firstElementChild?.className).toBe('fighter-companion');
  expect(fighter.querySelector(`[data-friend="${companion.id}"]`)?.getAttribute('data-animated')).toBe('true');
  expect(fighter.querySelector('[data-ability]')).toBeNull(); // subtle companion motion, not a constant ability blast
 }
 expect(renderToStaticMarkup(<Fighter color="#aaa" belt="#fff" move={null} state="idle" flip/>)).not.toContain('fighter-companion');
});

it('shows the selected live ability beside the saved player without equipping or spending, then retains their equipped friend in a fight',async()=>{
 const p=parseProfile({diamondWins:60,companion:'fox',coins:777}),dispatch=vi.fn();
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<GameHud dispatch={dispatch} profileData={JSON.stringify(p)} boardData="[]" boardId="local"/>));
 const click=async(label:string)=>{const button=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(label));expect(button,label).toBeDefined();await act(()=>button!.click());};
 await click('FRIENDS');
 for(const friend of [FRIENDS[0],FRIENDS[FRIENDS.length-1]]){
  await act(()=>document.querySelector<HTMLButtonElement>(`[aria-label="Preview ${friend.name}"]`)!.click());
  const dialog=document.querySelector('[role="dialog"]')!;
  expect(dialog.querySelector('.friend-preview-avatar .fighter-art')).not.toBeNull();
  expect(dialog.querySelector(`[data-ability="${friend.id}"]`)).not.toBeNull();
  await click('BACK TO FRIENDS');
 }
 expect(dispatch).not.toHaveBeenCalled();
 await click('BACK TO DOJO');await click('ENDLESS TOWER');
 expect(document.querySelector('.duel-fighters [aria-label="Your equipped friend"] [data-friend="fox"]')).not.toBeNull();
 expect(document.querySelectorAll('.duel-fighters .fighter-companion')).toHaveLength(1);
});
