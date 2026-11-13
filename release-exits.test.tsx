// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {GameHud} from './hud';
import {parseProfile,applyLogin} from './economy';
import {applyAction} from './actions';
import {RESCUES} from './rescue';
vi.mock('./movie',()=>({CutScene:({onDone}:{onDone():void})=><button onClick={onDone}>FINISH STORY</button>,DojoMovie:({onDone}:{onDone():void})=><button onClick={onDone}>SKIP INTRO</button>,RescueMovie:({onDone}:{onDone():void})=><button onClick={onDone}>SKIP INTRO</button>}));
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();vi.useRealTimers();});
async function click(text:string){const b=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(text));expect(b,text).toBeDefined();await act(()=>b!.click());}
async function mount(){
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','Date','performance']});vi.spyOn(Math,'random').mockReturnValue(.1);
 Object.defineProperty(window,'innerWidth',{configurable:true,value:1280});Object.defineProperty(window,'innerHeight',{configurable:true,value:800});
 const dispatch=vi.fn(),profile=applyLogin(parseProfile({}),Date.now());profile.seenNotice=profile.last.n;
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<GameHud dispatch={dispatch} profileData={JSON.stringify(profile)} boardData="[]" boardId="local"/>));
 return {dispatch,profile};
}
it('can leave a winning Tower result instead of being forced onto the next floor',async()=>{
 await mount();await click('ENDLESS TOWER');await act(()=>vi.advanceTimersByTime(1700));
 for(let round=0;round<3;round++){
  await click('ROCK [1]');await act(()=>vi.advanceTimersByTime(6640));await act(()=>vi.advanceTimersByTime(300));await act(()=>vi.advanceTimersByTime(1900));
 }
 await act(async()=>{await Promise.resolve();});await click('FINISH STORY');
 expect(document.body.textContent).toContain('NEXT FLOOR');await click('BACK TO DOJO');expect(document.querySelector('[aria-label="Dojo main menu"]')).not.toBeNull();
});
it('paused matches have a working forfeit exit and no stale round restarts',async()=>{
 await mount();await click('ENDLESS TOWER');await act(()=>vi.advanceTimersByTime(1700));await click('PAUSE MATCH');await click('FORFEIT & RETURN');
 expect(document.querySelector('[aria-label="Match paused"]')).toBeNull();await act(()=>vi.advanceTimersByTime(30000));
 expect(document.querySelector('[aria-label="Dojo main menu"]')).not.toBeNull();expect(document.querySelector('[aria-label="Your chosen hand"]')).toBeNull();expect([...document.querySelectorAll('button')].some(b=>b.textContent==='PAUSE MATCH')).toBe(false);
});

it.each(['tower','daily','ladder','rescue'])('forfeiting %s records a loss once without rewards or a free Daily retry',async(mode)=>{
 const {dispatch,profile}=await mount();
 await click(mode==='tower'?'ENDLESS TOWER':mode==='daily'?'CLASSIC DAILY':mode==='ladder'?'ENTER THE DOJO':'RESCUE DOJOS');
 if(mode==='rescue')await click(RESCUES[0]!.dojo);
 if(mode==='ladder'||mode==='rescue'){await act(async()=>{await Promise.resolve();});await click('SKIP INTRO');}
 await act(()=>vi.advanceTimersByTime(1700));await click('PAUSE MATCH');await click('FORFEIT & RETURN');
 expect(dispatch).toHaveBeenCalledOnce();let settled=profile;
 const event=dispatch.mock.calls[0][0];event.message.send((kind:string,raw:unknown)=>{settled=applyAction(profile,kind,raw,Date.now());expect(applyAction(settled,kind,raw,Date.now())).toBe(settled);});
 expect(settled.lossTrainingPending).toBe(1);expect([settled.coins,settled.gems,settled.xp,settled.freeBoxes]).toEqual([profile.coins,profile.gems,profile.xp,profile.freeBoxes]);
 if(mode==='daily')expect(settled.dailyDone).toBe(settled.dayKey);
});
