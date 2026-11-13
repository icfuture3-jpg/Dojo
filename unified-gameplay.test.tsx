// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {GameHud} from './hud';
import {parseProfile} from './economy';
import {roundBeatMs} from './rps';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();vi.useRealTimers();});
async function click(text:string){const b=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(text));expect(b,text).toBeDefined();await act(()=>b!.click());}
async function mount(){
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','Date','performance']});
 Object.defineProperty(window,'innerWidth',{configurable:true,value:390});Object.defineProperty(window,'innerHeight',{configurable:true,value:844});
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<GameHud dispatch={()=>{}} profileData={JSON.stringify(parseProfile({}))} boardData="[]" boardId="local"/>));
 await click('ENDLESS TOWER');await act(()=>vi.advanceTimersByTime(1700));
}
const choose=async(m:string)=>act(()=>document.querySelector<HTMLButtonElement>(`[aria-label="Choose ${m}"]`)!.click());
async function resolve(){await act(()=>vi.advanceTimersByTime(roundBeatMs('tower',0)*3+40));await act(()=>vi.advanceTimersByTime(350));}
it.each([{roll:.1,result:'POINT!'},{roll:.6,result:'DRAW'},{roll:.9,result:'STRUCK!'}])('assists the first choice with real controls ($roll)',async({roll,result})=>{
 vi.spyOn(Math,'random').mockReturnValue(roll);await mount();await choose('rock');await resolve();expect(document.querySelector('.unified-touch-status')?.textContent).toBe(result);
});
it('changing your own hand never rerolls the CPU and rotation retains selection',async()=>{
 vi.spyOn(Math,'random').mockReturnValue(.1);await mount();await choose('rock');await choose('paper');
 await act(()=>window.dispatchEvent(new Event('resize')));expect(document.querySelector('[aria-label="Choose paper"]')?.getAttribute('aria-pressed')).toBe('true');
 await resolve();expect(document.querySelector('.unified-touch-status')?.textContent).toBe('STRUCK!');
});
it('Peek before selection commits its revealed hand',async()=>{
 vi.spyOn(Math,'random').mockReturnValue(0);await mount();await click('PEEK FREE');await choose('paper');await resolve();expect(document.querySelector('.unified-touch-status')?.textContent).toBe('POINT!');
});
it('typing does not select a hand and no selection loses at SHOOT',async()=>{
 await mount();const input=document.createElement('input');document.body.append(input);await act(()=>input.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyR',bubbles:true})));
 expect(document.querySelector('[aria-label="Choose rock"]')?.getAttribute('aria-pressed')).toBe('false');await resolve();expect(document.querySelector('.unified-touch-status')?.textContent).toBe('STRUCK!');
});
it('pause freezes time and preserves the locked hand through resume',async()=>{
 vi.spyOn(Math,'random').mockReturnValue(.1);await mount();await choose('rock');await click('PAUSE MATCH');
 await act(()=>vi.advanceTimersByTime(20000));expect(document.querySelector('[aria-label="Match paused"]')).not.toBeNull();
 await click('RESUME MATCH');await choose('paper');await resolve();expect(document.querySelector('.unified-touch-status')?.textContent).toBe('STRUCK!');
});
