// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {GameHud} from './hud';
import {parseProfile} from './economy';
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();vi.unstubAllGlobals();vi.useRealTimers();});
async function mount(dispatch=vi.fn()){
 Object.defineProperty(window,'innerWidth',{configurable:true,value:390});
 Object.defineProperty(window,'innerHeight',{configurable:true,value:844});
 const el=document.createElement('main');document.body.append(el);
 const errors:unknown[]=[];
 root=createRoot(el,{onUncaughtError:error=>errors.push(error)});
 await act(()=>root!.render(<GameHud dispatch={dispatch} profileData={JSON.stringify(parseProfile({}))} boardData="[]" boardId="local"/>));
 return errors;
}
async function click(label:string){
 const button=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(label));
 expect(button,label).toBeDefined();await act(()=>button!.click());
 await act(async()=>{await vi.dynamicImportSettled();});
}
it('starts the ladder when randomUUID is unavailable on an older browser',async()=>{
 const getRandomValues=crypto.getRandomValues.bind(crypto);
 vi.stubGlobal('crypto',{getRandomValues});
 const errors=await mount();await click('ENTER THE DOJO');
 expect(errors).toEqual([]);
 expect(document.querySelector('.cinematic-movie')).not.toBeNull();
});
it('keeps cutscenes and their touch controls outside the scaled game stage',async()=>{
 const error=vi.spyOn(console,'error');
 await mount();await click('ENTER THE DOJO');
 const movie=document.querySelector('.cinematic-movie');expect(movie).not.toBeNull();
 expect(movie!.closest('.cinematic-stage')).toBeNull();
 await click('PAUSE CUTSCENE');expect(document.querySelector('.movie-paused')).not.toBeNull();
 await click('RESUME CUTSCENE');expect(document.querySelector('.movie-paused')).toBeNull();
 await click('SKIP');expect(document.querySelector('.cinematic-movie')).toBeNull();
 expect(document.body.textContent).toContain('MATCH 1');
 expect(error).not.toHaveBeenCalled();
});
it('plays and skips the opening when ResizeObserver is unavailable',async()=>{
 vi.stubGlobal('ResizeObserver',undefined);
 const errors=await mount();await click('ENTER THE DOJO');
 expect(errors).toEqual([]);expect(document.querySelector('.cinematic-movie')).not.toBeNull();
 await act(()=>window.dispatchEvent(new Event('resize')));
 await click('SKIP');expect(document.body.textContent).toContain('MATCH 1');
});

it.each(['ENDLESS TOWER','CLASSIC DAILY'])('starts %s without randomUUID',async label=>{
 const getRandomValues=crypto.getRandomValues.bind(crypto);vi.stubGlobal('crypto',{getRandomValues});
 await mount();await click(label);
 expect(document.querySelector('[aria-label="Dojo main menu"]')).toBeNull();
 expect(document.body.textContent).toContain(label==='ENDLESS TOWER'?'FLOOR 1':'DAILY CHALLENGE');
});
it('starts academy training without randomUUID',async()=>{
 const getRandomValues=crypto.getRandomValues.bind(crypto);vi.stubGlobal('crypto',{getRandomValues});
 const dispatch=vi.fn();await mount(dispatch);await click('TRAINING HALL');
 const play=[...document.querySelectorAll<HTMLButtonElement>('button')].find(b=>b.textContent?.startsWith('PLAY:'));
 expect(play).toBeDefined();await act(()=>play!.click());
 expect(dispatch).toHaveBeenCalledOnce();
 const emit=vi.fn();dispatch.mock.calls[0]![0].message.send(emit);
 expect(emit).toHaveBeenCalledWith('academy',expect.objectContaining({action:'start',id:expect.any(String)}));
});
