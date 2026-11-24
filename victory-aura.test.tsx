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
async function mount(aura:string,roll=.1){
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','Date','performance']});vi.spyOn(Math,'random').mockReturnValue(roll);
 Object.defineProperty(window,'innerWidth',{configurable:true,value:1280});Object.defineProperty(window,'innerHeight',{configurable:true,value:800});
 const dispatch=vi.fn(),profile=applyLogin(parseProfile({}),Date.now());profile.seenNotice=profile.last.n;profile.owned.push(aura);profile.equip.aura=aura;
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<GameHud dispatch={dispatch} profileData={JSON.stringify(profile)} boardData="[]" boardId="local"/>));
 return {dispatch,profile};
}

it.each([['aura-new-0','inferno'],['aura-new-1','mist'],['aura-new-6','petals']])('equipped %s appears on match-winning hit and winning screen',async(aura,motif)=>{
 const {dispatch}=await mount(aura);await click('ENDLESS TOWER');await act(()=>vi.advanceTimersByTime(1700));
 for(let round=0;round<3;round++){
  await click('ROCK [1]');await act(()=>vi.advanceTimersByTime(6640));await act(()=>vi.advanceTimersByTime(300));
  expect(document.querySelector(`.victory-aura-fighter [data-aura-motif="${motif}"]`)!==null).toBe(round===2);
  await act(()=>vi.advanceTimersByTime(1900));
 }
 await act(async()=>{await Promise.resolve();});await click('FINISH STORY');
 const celebration=document.querySelector('[aria-label="Your victorious fighter and equipped aura"]');expect(celebration).not.toBeNull();
 expect(celebration!.querySelector(`[data-aura-motif="${motif}"]`)).not.toBeNull();expect(dispatch).toHaveBeenCalledOnce();
 await click('NEXT FLOOR');expect(document.querySelector('[aria-label="Your victorious fighter and equipped aura"]')).toBeNull();
});
it('No Aura stays clear on a win',async()=>{
 await mount('aura-none');await click('ENDLESS TOWER');await act(()=>vi.advanceTimersByTime(1700));
 for(let i=0;i<3;i++){await click('ROCK [1]');await act(()=>vi.advanceTimersByTime(6640));await act(()=>vi.advanceTimersByTime(300));await act(()=>vi.advanceTimersByTime(1900));}
 await act(async()=>{await Promise.resolve();});await click('FINISH STORY');expect(document.querySelector('.victory-aura-fighter .named-aura')).toBeNull();
});
it('an equipped aura does not show a themed victory effect on defeat',async()=>{
 await mount('aura-new-0',.9);await click('ENDLESS TOWER');await act(()=>vi.advanceTimersByTime(1700));
 for(let i=0;i<3;i++){await click('ROCK [1]');await act(()=>vi.advanceTimersByTime(6640));await act(()=>vi.advanceTimersByTime(300));expect(document.querySelector('.victory-aura-fighter .named-aura')).toBeNull();await act(()=>vi.advanceTimersByTime(1900));}
 await act(async()=>{await Promise.resolve();});await click('FINISH STORY');expect(document.querySelector('[aria-label="Your victorious fighter and equipped aura"]')).toBeNull();
});
