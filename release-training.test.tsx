// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {TrainingGame} from './training';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.useRealTimers();});
async function click(text:string){const b=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(text));expect(b,text).toBeDefined();await act(()=>b!.click());}
it('board training uses an unscaled scrollable panel and a non-collapsing meter',async()=>{
 const el=document.createElement('main');el.style.transform='scale(.3)';document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<TrainingGame strength={0} avatar={<div/>} onDone={()=>{}}/>));
 const panel=document.querySelector<HTMLElement>('[aria-label="Strength training"]')!,meter=document.querySelector<HTMLElement>('[aria-label="Timing meter"]')!;
 expect(panel.parentElement).toBe(document.body);expect(panel.style.justifyContent).toBe('flex-start');
 expect(meter.style.minHeight).toBe('32px');expect(meter.style.flexShrink).toBe('0');
});
it('board training accepts five attempts and submits its result only once',async()=>{
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','performance']});
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);const done=vi.fn();
 await act(()=>root!.render(<TrainingGame strength={0} avatar={<div/>} onDone={done}/>));await click('START TRAINING');
 for(let i=0;i<5;i++){await act(()=>vi.advanceTimersByTime(Math.PI*750/(2*(1+i*.2))));await click('STRIKE');await act(()=>vi.advanceTimersByTime(420));}
 await click('CONTINUE — SAVE TRAINING');await click('CONTINUE — SAVE TRAINING');expect(done).toHaveBeenCalledOnce();expect(done).toHaveBeenCalledWith(5);
});
