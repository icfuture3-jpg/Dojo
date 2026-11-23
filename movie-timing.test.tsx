// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {DojoMovie,type Shot} from './movie';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.useRealTimers();});
async function mount(){
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','performance']});
 const done=vi.fn();const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 const shots:Shot[]=[{caption:'First authored scene',duration:3000,draw:()=>null},{caption:'Second authored scene',duration:4000,draw:()=>null}];
 await act(()=>root!.render(<DojoMovie dojo={0} color="#fff" belt="#000" shots={shots} onDone={done}/>));return done;
}
async function advance(ms:number){await act(()=>vi.advanceTimersByTime(ms));}
async function click(label:string){const b=[...document.querySelectorAll('button')].find(b=>b.textContent===label);expect(b).toBeDefined();await act(()=>b!.click());}
it('plays each authored duration without skipping a scene or adding an extra wait',async()=>{
 const done=await mount();await advance(2999);expect(document.body.textContent).toContain('First authored scene');
 await advance(1);expect(document.body.textContent).toContain('Second authored scene');
 await advance(3999);expect(done).not.toHaveBeenCalled();await advance(1);expect(done).toHaveBeenCalledOnce();
});
it('pause/resume retains remaining shot time rather than restarting its delay',async()=>{
 const done=await mount();await advance(1200);await click('PAUSE CUTSCENE');await advance(60000);
 expect(document.body.textContent).toContain('First authored scene');await click('RESUME CUTSCENE');
 await advance(1799);expect(document.body.textContent).toContain('First authored scene');await advance(1);
 expect(document.body.textContent).toContain('Second authored scene');await advance(4000);expect(done).toHaveBeenCalledOnce();
});
it('skip unmounts the pending timer and cannot trigger a delayed second continuation',async()=>{
 const done=await mount();await advance(500);await click('SKIP ▶▶');expect(done).toHaveBeenCalledOnce();
 await act(()=>root!.unmount());root=undefined;await advance(60000);expect(done).toHaveBeenCalledOnce();
});
