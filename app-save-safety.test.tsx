// @vitest-environment happy-dom
import {afterEach,beforeAll,expect,it,vi} from 'vitest';
import {act} from 'react';
import type {Root} from 'react-dom/client';
import {SAVE_KEY,loadSave,saveProfile} from './saves';
import type {DojoEvent} from './net';
// Import App without its entry-point auto-mount; tests mount the real component below.
vi.mock('react-dom/client',async importOriginal=>({...await importOriginal<typeof import('react-dom/client')>(),createRoot:()=>({render(){}})}));
vi.mock('./hud',()=>({GameHud:({dispatch,profileData}:{dispatch(e:DojoEvent):void;profileData:string})=><section><p>{JSON.parse(profileData).name}</p><button onClick={()=>dispatch({type:'dojo.send',message:{send:emit=>emit('setName',{name:'Jade Hero'})}})}>UPDATE PROFILE</button></section>}));
let App:typeof import('./main')['App'];let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
beforeAll(async()=>{App=(await import('./main')).App;});
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';localStorage.clear();sessionStorage.clear();vi.restoreAllMocks();});
async function mount(){
 const profile=loadSave(localStorage,Date.now()).profile;profile.name='Keeper';saveProfile(localStorage,profile);
 const {createRoot}=await vi.importActual<typeof import('react-dom/client')>('react-dom/client');
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);await act(()=>root!.render(<App/>));
}
async function update(){await act(()=>document.querySelector<HTMLButtonElement>('button')!.click());}
async function storage(key:string|null,storageArea:Storage){await act(()=>window.dispatchEvent(new StorageEvent('storage',{key,storageArea})));}
it('does not stop saving for an unrelated sessionStorage change with the same key',async()=>{
 await mount();await storage(SAVE_KEY,sessionStorage);await update();
 expect(document.querySelector('[aria-label="Save status"]')).toBeNull();
 expect(JSON.parse(localStorage.getItem(SAVE_KEY)!).name).toBe('Jade Hero');
});
it('stops writes after another tab clears localStorage, instead of silently restoring stale progress',async()=>{
 await mount();localStorage.clear();await storage(null,localStorage);
 expect(document.querySelector('[aria-label="Save status"]')?.textContent).toContain('Automatic writes stopped');
 await update();expect(localStorage.getItem(SAVE_KEY)).toBeNull();
 expect(document.querySelector('[aria-label="Save status"]')?.textContent).toContain('EXPORT THIS SESSION');
});
it('preserves another tab’s updated save while allowing this session to continue unsaved',async()=>{
 await mount();const other={...JSON.parse(localStorage.getItem(SAVE_KEY)!),name:'Other Fighter',coins:900};localStorage.setItem(SAVE_KEY,JSON.stringify(other));
 await storage(SAVE_KEY,localStorage);await update();
 expect(JSON.parse(localStorage.getItem(SAVE_KEY)!)).toEqual(other);
 expect(document.body.textContent).toContain('Jade Hero');
 expect(document.querySelector('[aria-label="Save status"]')?.textContent).toContain('Automatic writes stopped');
});
it('ignores unrelated localStorage keys',async()=>{
 await mount();await storage('other-game',localStorage);await update();
 expect(document.querySelector('[aria-label="Save status"]')).toBeNull();
 expect(JSON.parse(localStorage.getItem(SAVE_KEY)!).name).toBe('Jade Hero');
});
it('retries a failed save without resetting in-session progress',async()=>{
 await mount();const previous=localStorage.getItem(SAVE_KEY);
 const set=vi.spyOn(localStorage,'setItem').mockImplementation(()=>{throw new Error('QuotaExceededError');});
 await update();expect(localStorage.getItem(SAVE_KEY)).toBe(previous);
 const status=document.querySelector('[aria-label="Save status"]');expect(status?.textContent).toContain('Saving failed');
 expect(document.body.textContent).toContain('Jade Hero');set.mockRestore();
 const retry=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes('RETRY SAVE'));expect(retry).toBeDefined();
 await act(()=>retry!.click());
 expect(JSON.parse(localStorage.getItem(SAVE_KEY)!).name).toBe('Jade Hero');
 expect(document.querySelector('[aria-label="Save status"]')).toBeNull();
});
it('does not register a conflict for sessionStorage.clear()',async()=>{
 await mount();await storage(null,sessionStorage);await update();
 expect(document.querySelector('[aria-label="Save status"]')).toBeNull();
 expect(JSON.parse(localStorage.getItem(SAVE_KEY)!).name).toBe('Jade Hero');
});
