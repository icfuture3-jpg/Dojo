// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {TreePots} from './tree-pots';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.useRealTimers();});
async function click(text:string){const button=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(text));expect(button).toBeDefined();await act(()=>button!.click());}
it.each(['Jump Strike','Stone Throw','Timed Chop'])('%s keeps a non-shrinking gold track and moving indicator during play',async(mode)=>{
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','performance','requestAnimationFrame','cancelAnimationFrame']});
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<TreePots avatar={<div>Saved fighter</div>} best={{throw:0,jump:0,chop:0}} onSave={()=>{}} onExit={()=>{}}/>));
 await click(mode);await click('START CHALLENGE');
 const panel=document.querySelector<HTMLElement>('[aria-label="Tree Pot Challenge"]')!;
 const track=document.querySelector<HTMLElement>('[aria-label="Gold timing zone"]')!;
 expect(panel.style.justifyContent).toBe('flex-start');
 expect(track.style.minHeight).toBe('26px');expect(track.style.flexShrink).toBe('0');
 expect(track.querySelector('[data-gold-zone]')).not.toBeNull();
 const marker=track.querySelector<HTMLElement>('[role="meter"]')!;
 expect(marker.getAttribute('aria-valuenow')).toBe('0');
 await act(()=>vi.advanceTimersByTime(1000));
 expect(Number(marker.getAttribute('aria-valuenow'))).toBeGreaterThan(40);
 const frozen=marker.getAttribute('aria-valuenow');await click(mode==='Jump Strike'?'JUMP — SPACE':mode==='Stone Throw'?'THROW — SPACE':'CHOP — SPACE');
 await act(()=>vi.advanceTimersByTime(1000));expect(marker.getAttribute('aria-valuenow')).toBe(frozen);
 await act(()=>vi.advanceTimersByTime(5000));
 expect(document.querySelector('[aria-label="Gold timing zone"]')).not.toBeNull();
 expect(document.querySelector('[role="meter"]')?.getAttribute('aria-valuenow')).toBe('0');
});
