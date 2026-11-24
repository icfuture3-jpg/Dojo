// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act,useState} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {GameHud} from './hud';
import {applyAction} from './actions';
import {applyLogin,completeLossTraining,completeTraining,parseProfile,trainingDue,type Profile} from './economy';
vi.mock('./movie',()=>({CutScene:({onDone}:{onDone():void})=><button onClick={onDone}>FINISH STORY</button>}));
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();vi.useRealTimers();});
async function click(text:string){const b=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(text));expect(b,text).toBeDefined();await act(()=>b!.click());}
async function train(){await act(async()=>{await vi.dynamicImportSettled();});await click('START TRAINING');for(let n=0;n<5;n++){await click('STRIKE');await act(()=>vi.advanceTimersByTime(420));}await click('CONTINUE — SAVE TRAINING');}
it('a loss session also satisfies scheduled training and clears old queued losses, with one reward',()=>{
 const p=parseProfile({lossTrainingPending:4,training:{matches:12,completed:0,strength:2}});
 const next=completeLossTraining(p,4)!;
 expect(next.lossTrainingPending).toBe(0);expect(trainingDue(next)).toBe(false);
 expect(next.training.strength).toBe(5);expect(next.xp-p.xp).toBe(40);
 expect(completeLossTraining(next,4)).toBeNull();expect(completeTraining(next,4)).toBeNull();
 expect(p.lossTrainingPending).toBe(4);expect(p.training.completed).toBe(0);
 expect(trainingDue(parseProfile(JSON.parse(JSON.stringify(next))))).toBe(false);
});
it('one scheduled session clears accumulated scheduled training, without multiplying rewards',()=>{
 const p=parseProfile({training:{matches:15,completed:0,strength:0}}),next=completeTraining(p,5)!;
 expect(trainingDue(next)).toBe(false);expect(next.training.strength).toBe(3);expect(next.xp).toBe(45);
 expect(completeTraining(next,5)).toBeNull();
 expect(trainingDue({...next,training:{...next.training,matches:18}})).toBe(true);
});
async function mount(profile:Profile){
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','Date','performance']});
 let current=profile;
 function Session(){const [p,setP]=useState(profile);current=p;return <GameHud profileData={JSON.stringify(p)} boardData="[]" boardId="local" dispatch={e=>e.message.send((kind,raw)=>setP(previous=>applyAction(previous,kind,raw,Date.now())))}/>;}
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);await act(()=>root!.render(<Session/>));return ()=>current;
}
it.each([1,4])('returning to the dojo with %s queued loss session(s) only requires one board section',async pending=>{
 const p=applyLogin(parseProfile({lossTrainingPending:pending,training:{matches:12,completed:0,strength:0}}),Date.now());p.seenNotice=p.last.n;
 const current=await mount(p);await train();
 expect(document.querySelector('[aria-label="Strength training"]')).toBeNull();
 expect(document.querySelector('[aria-label="Dojo main menu"]')).not.toBeNull();
 expect(current().training.strength).toBe(1);expect(current().lossTrainingPending).toBe(0);
});
it('a third-match loss does not require a second board section after Back to Dojo',async()=>{
 const p=applyLogin(parseProfile({training:{matches:2,completed:0,strength:0}}),Date.now());p.seenNotice=p.last.n;
 const current=await mount(p);await click('ENDLESS TOWER');await act(()=>vi.advanceTimersByTime(1700));
 for(let n=0;n<3;n++){await act(()=>vi.advanceTimersByTime(6640));await act(()=>vi.advanceTimersByTime(300));await act(()=>vi.advanceTimersByTime(1900));}
 await act(async()=>{await vi.dynamicImportSettled();});await click('FINISH STORY');await train();
 await click('BACK TO DOJO');
 expect(document.querySelector('[aria-label="Strength training"]')).toBeNull();
 expect(document.querySelector('[aria-label="Dojo main menu"]')).not.toBeNull();
 expect(current().training.strength).toBe(1);expect(current().training.matches).toBe(3);
});
