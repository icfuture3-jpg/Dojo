// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {FinisherScene,STOMP_IMPACT_MS} from './finishers';
import {NEW_COSMETICS} from './economy';
const sound=vi.hoisted(()=>({strike:vi.fn(),dispose:vi.fn()}));
vi.mock('./thunder',()=>({prepareThunder:()=>sound}));
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.clearAllMocks();vi.useRealTimers();});
async function mount(id='finisher-2'){
 vi.useFakeTimers();const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<FinisherScene item={NEW_COSMETICS.find(i=>i.id===id)!} avatar={<div/>} onDone={()=>{}}/>));return el;
}
it('plays one thunder at footfall, not on preview start or windup',async()=>{
 await mount();await act(()=>vi.advanceTimersByTime(STOMP_IMPACT_MS-1));expect(sound.strike).not.toHaveBeenCalled();
 await act(()=>vi.advanceTimersByTime(1));expect(sound.strike).toHaveBeenCalledOnce();
 await act(()=>vi.advanceTimersByTime(2500));expect(sound.strike).toHaveBeenCalledOnce();
});
it('Continue before impact cancels the sound even if the caller keeps the scene mounted',async()=>{
 const el=await mount();await act(()=>el.querySelector('button')!.click());expect(sound.dispose).toHaveBeenCalledOnce();
 await act(()=>vi.advanceTimersByTime(5000));expect(sound.strike).not.toHaveBeenCalled();
});
it('leaving before footfall clears pending thunder and releases its audio context',async()=>{
 await mount();await act(()=>root!.unmount());root=undefined;
 await act(()=>vi.advanceTimersByTime(10000));expect(sound.strike).not.toHaveBeenCalled();expect(sound.dispose).toHaveBeenCalledOnce();
});
it('other finishers do not trigger thunder',async()=>{await mount('finisher-0');await act(()=>vi.advanceTimersByTime(6000));expect(sound.strike).not.toHaveBeenCalled();expect(sound.dispose).not.toHaveBeenCalled();});
