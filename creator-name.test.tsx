// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act,useState} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {GameHud} from './hud';
import {applyAction} from './actions';
import {parseProfile,collectTrophies} from './economy';
import {loadSave,saveProfile,SAVE_KEY,type SaveStorage} from './saves';
import type {DojoEvent} from './net';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();});
it('lets players rename through Create with Ranks removed and preserves saved progression',async()=>{
 const initial=collectTrophies(parseProfile({saveVersion:4,name:'Keeper',coins:987,gems:42,xp:500,rp:123,stats:{played:10,won:7},academy:{xp:250,clears:{lightning:2}},owned:['gi-blue','gi-crimson']}));
 const values=new Map<string,string>();const storage:SaveStorage={getItem:k=>values.get(k)??null,setItem:(k,v)=>{values.set(k,v);}};
 let current=initial;const now=Date.UTC(2026,10,23);
 function Game(){const [p,setP]=useState(initial);const dispatch=(event:DojoEvent)=>event.message.send((kind,data)=>{setP(prev=>{current=applyAction(prev,kind,data,now);saveProfile(storage,current);return current;});});return <GameHud dispatch={dispatch} profileData={JSON.stringify(p)} boardData="[]" boardId="local"/>;}
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);await act(()=>root!.render(<Game/>));
 async function click(text:string){const b=[...document.querySelectorAll('button')].find(b=>b.textContent===text||b.textContent?.includes(text));expect(b,text).toBeDefined();await act(()=>b!.click());}
 expect([...document.querySelectorAll('button')].some(b=>b.textContent?.includes('RANKS'))).toBe(false);
 await click('CREATE');
 const input=document.querySelector<HTMLInputElement>('[aria-label="Fighter name"]');expect(input).not.toBeNull();
 const set=Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value')!.set!;
 await act(()=>{set.call(input,'Jade Hero');input!.dispatchEvent(new Event('input',{bubbles:true}));});
 await click('SAVE NAME');
 expect(current.name).toBe('Jade Hero');
 expect(document.querySelector('[role="status"]')?.textContent).toBe('Name saved on this device.');
 expect({...current,name:initial.name}).toEqual(initial);
 const reload=loadSave(storage,now).profile;
 expect(reload.name).toBe('Jade Hero');
 for(const key of ['coins','gems','xp','rp','owned','look','stats','academy'] as const)expect(parseProfile(JSON.parse(values.get(SAVE_KEY)!))[key]).toEqual(current[key]);
 await act(()=>{set.call(input,'!');input!.dispatchEvent(new Event('input',{bubbles:true}));});
 expect([...document.querySelectorAll('button')].find(b=>b.textContent==='SAVE NAME')?.disabled).toBe(true);
 expect(current.name).toBe('Jade Hero');
});
