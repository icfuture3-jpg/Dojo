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
it('starting a different pot challenge resets both the displayed marker and sampled hit position',async()=>{
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','performance','requestAnimationFrame','cancelAnimationFrame']});
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);const save=vi.fn();
 await act(()=>root!.render(<TreePots avatar={<div/>} best={{throw:0,jump:0,chop:0}} onSave={save} onExit={()=>{}}/>));
 await click('Jump Strike');await click('START CHALLENGE');await act(()=>vi.advanceTimersByTime(1000));
 expect(Number(document.querySelector('[role="meter"]')?.getAttribute('aria-valuenow'))).toBeGreaterThan(40);
 await click('ALL THREE CHALLENGES');await click('Stone Throw');await click('START CHALLENGE');
 expect(document.querySelector('[role="meter"]')?.getAttribute('aria-valuenow')).toBe('0');
 await click('THROW — SPACE');await act(()=>vi.advanceTimersByTime(6000));
 expect(document.body.textContent).toContain('0 pots broken');expect(save).not.toHaveBeenCalled();
});
it.each(['Jump Strike','Stone Throw','Timed Chop'])('%s completes five attempts, reports once, and starts a clean replay',async(mode)=>{
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','performance','requestAnimationFrame','cancelAnimationFrame']});
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);const save=vi.fn();
 await act(()=>root!.render(<TreePots avatar={<div/>} best={{throw:0,jump:0,chop:0}} onSave={save} onExit={()=>{}}/>));
 await click(mode);await click('START CHALLENGE');const action=mode==='Jump Strike'?'JUMP — SPACE':mode==='Stone Throw'?'THROW — SPACE':'CHOP — SPACE';
 for(let i=0;i<5;i++){await act(()=>vi.advanceTimersByTime(1100/(1+i*.2)));await click(action);await act(()=>vi.advanceTimersByTime(6100));}
 expect(save).toHaveBeenCalledOnce();expect(save.mock.calls[0][1]).toBe(5);expect(document.body.textContent).toContain('Challenge complete');
 await click('PLAY AGAIN');await click('START CHALLENGE');expect(document.body.textContent).toContain('0/5 attempts');expect(save).toHaveBeenCalledOnce();
});
it('Space respects focused buttons and typing instead of starting an unwanted pot action',async()=>{
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','performance','requestAnimationFrame','cancelAnimationFrame']});
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<TreePots avatar={<div/>} best={{throw:0,jump:0,chop:0}} onSave={()=>{}} onExit={()=>{}}/>));await click('Jump Strike');await click('START CHALLENGE');
 const back=[...document.querySelectorAll('button')].find(b=>b.textContent==='ALL THREE CHALLENGES')!;
 const input=document.createElement('input');document.body.append(input);
 for(const target of [back,input])await act(()=>target.dispatchEvent(new KeyboardEvent('keydown',{code:'Space',bubbles:true,cancelable:true})));
 expect(back.disabled).toBe(false);expect(document.body.textContent).toContain('JUMP — SPACE');
});
