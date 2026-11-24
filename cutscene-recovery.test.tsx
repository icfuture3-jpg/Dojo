// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act,lazy,useState} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {GameHud} from './hud';
import {CutsceneFrame} from './cutscene-frame';
import {parseProfile} from './economy';
import {roundBeatMs} from './rps';
vi.mock('./movie',async()=>{throw new Error('Failed to fetch dynamically imported movie module');});
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();vi.useRealTimers();});
async function click(label:string){const button=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(label));expect(button,label).toBeDefined();await act(()=>button!.click());}
async function mountGame(){
 Object.defineProperty(window,'innerWidth',{configurable:true,value:390});Object.defineProperty(window,'innerHeight',{configurable:true,value:844});
 const el=document.createElement('main');document.body.append(el);
 const caught=vi.fn(),uncaught=vi.fn(),dispatch=vi.fn();root=createRoot(el,{onCaughtError:caught,onUncaughtError:uncaught});
 await act(()=>root!.render(<GameHud dispatch={dispatch} profileData={JSON.stringify(parseProfile({}))} boardData="[]" boardId="local"/>));
 return {dispatch,caught,uncaught};
}
it.each(['ladder','rescue'])('contains a rejected cutscene import and still starts a %s match',async mode=>{
 const {dispatch,caught,uncaught}=await mountGame();
 if(mode==='ladder')await click('ENTER THE DOJO');else{await click('RESCUE DOJOS');await click('Bamboo Grove');}
 await act(async()=>{await vi.dynamicImportSettled();});
 expect(caught).toHaveBeenCalled();expect(uncaught).not.toHaveBeenCalled();
 expect(document.body.textContent).toContain('The cutscene could not start');
 expect(document.querySelector('.cutscene-viewport')?.closest('.cinematic-stage')).toBeNull();
 vi.useFakeTimers();await click('CONTINUE WITHOUT CUTSCENE');
 expect(document.querySelector('.cutscene-viewport')).toBeNull();
 await act(()=>vi.advanceTimersByTime(1700));
 expect(document.querySelector('[aria-label="Choose rock"]')).not.toBeNull();
 expect(dispatch).not.toHaveBeenCalled(); // Skipping never settles a match or pays a reward.
});
it('lets a player escape a pending download without reloading or losing the parent session',async()=>{
 const Pending=lazy(()=>new Promise<{default:()=>null}>(()=>{}));
 function Session(){const [movie,setMovie]=useState(true);return <><p>Session retained</p>{movie?<CutsceneFrame onContinue={()=>setMovie(false)}><Pending/></CutsceneFrame>:<p>Match started</p>}</>;}
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<Session/>));
 expect(document.body.textContent).toContain('Loading cutscene');
 await click('CONTINUE WITHOUT CUTSCENE');
 expect(document.body.textContent).toContain('Match started');expect(document.body.textContent).toContain('Session retained');
 expect(document.querySelector('.cutscene-viewport')).toBeNull();
});

it.each([true,false])('preserves match settlement and the next activity when the result cutscene fails (won=%s)',async won=>{
 vi.spyOn(Math,'random').mockReturnValue(.1);
 const {dispatch}=await mountGame();await click('ENTER THE DOJO');
 await act(async()=>{await vi.dynamicImportSettled();});
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','Date','performance']});
 await click('CONTINUE WITHOUT CUTSCENE');await act(()=>vi.advanceTimersByTime(1700));
 for(let round=0;round<3;round++){
  if(won)await act(()=>document.querySelector<HTMLButtonElement>('[aria-label="Choose rock"]')!.click());
  await act(()=>vi.advanceTimersByTime(roundBeatMs('ladder',0)*3+40));
  await act(()=>vi.advanceTimersByTime(300));await act(()=>vi.advanceTimersByTime(1900));
 }
 await act(async()=>{await vi.dynamicImportSettled();});
 expect(document.body.textContent).toContain('The cutscene could not start');
 expect(dispatch).toHaveBeenCalledOnce();
 const emit=vi.fn();dispatch.mock.calls[0]![0].message.send(emit);
 expect(emit).toHaveBeenCalledWith('matchDone',expect.objectContaining({won,roundsWon:won?3:0,roundsLost:won?0:3}));
 await click('CONTINUE WITHOUT CUTSCENE');
 await act(async()=>{await vi.dynamicImportSettled();});
 expect(document.body.textContent).toContain(won?'NEXT CHALLENGER':'How to break boards');
 expect(dispatch).toHaveBeenCalledOnce();
});
