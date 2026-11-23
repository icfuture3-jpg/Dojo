// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {GameHud} from './hud';
import {parseProfile} from './economy';
import {MOVES,roundBeatMs,type Move} from './rps';
vi.mock('./movie',()=>({DojoMovie:({onDone}:{onDone():void})=><button onClick={onDone}>SKIP INTRO</button>}));
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();vi.useRealTimers();});
async function click(text:string){const b=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(text));expect(b,text).toBeDefined();await act(()=>b!.click());}
const wait=async(ms:number)=>act(()=>vi.advanceTimersByTime(ms));
const status=()=>document.querySelector('.unified-touch-status')?.textContent;
async function choose(hand:Move){await act(()=>document.querySelector<HTMLButtonElement>(`[aria-label="Choose ${hand}"]`)!.click());}
async function mount(mode='ENDLESS TOWER',strength=0){
 vi.useFakeTimers({toFake:['setTimeout','clearTimeout','setInterval','clearInterval','Date','performance']});
 Object.defineProperty(window,'innerWidth',{configurable:true,value:390});Object.defineProperty(window,'innerHeight',{configurable:true,value:844});
 const random=vi.spyOn(Math,'random').mockReturnValue(.6);
 const profile=parseProfile({});profile.training.strength=strength;profile.audio={music:0,sfx:0};
 const dispatch=vi.fn(),el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<GameHud dispatch={dispatch} profileData={JSON.stringify(profile)} boardData="[]" boardId="local"/>));
 await click(mode);if(mode==='ENTER THE DOJO'){await act(async()=>{await Promise.resolve();});await click('SKIP INTRO');}await wait(1700);return {random,dispatch};
}
async function reveal(mode:'tower'|'daily'='tower'){await wait(roundBeatMs(mode,0)*3+40);await wait(300);}
async function startClash(){await choose('rock');await reveal();expect(status()).toContain('TIE → CLASH');await wait(1200);}
it('a tie opens a fresh one-second keyboard clash, commits CPU before input, and awards only one point',async()=>{
 const {random,dispatch}=await mount();await startClash();
 expect(document.querySelector('[aria-label="Choose rock"]')?.getAttribute('aria-pressed')).toBe('false');
 expect([...document.querySelectorAll('.unified-touch-tools button')].every(b=>(b as HTMLButtonElement).disabled)).toBe(true);
 const calls=random.mock.calls.length;
 await choose('rock');await act(()=>window.dispatchEvent(new KeyboardEvent('keydown',{code:'KeyS',bubbles:true})));
 expect(random.mock.calls).toHaveLength(calls); // committed paper; scissors wins, without assistance/reroll
 await wait(990);expect(status()).toContain('CLASH!');await wait(40);expect(status()).toBe('SHOOT!');await wait(300);
 expect(status()).toBe('POINT!');expect(document.querySelector('[data-hit-stop=true]')).not.toBeNull();
 await wait(100);expect(document.querySelector('[data-hit-stop=true]')).toBeNull();expect(dispatch).not.toHaveBeenCalled();
 // Two more points end the match exactly once (a tied throw did not score).
 await wait(1800);random.mockReturnValue(.1);
 for(let i=0;i<2;i++){await choose('rock');await reveal();await wait(1900);}
 expect(dispatch).toHaveBeenCalledOnce();let payload: {won?:boolean} = {};
 dispatch.mock.calls[0][0].message.send((_kind:string,data:unknown)=>{payload=data as {won?:boolean};});expect(payload.won).toBe(true);
});
it('requires a NEW choice on clash timeout instead of carrying the tied hand',async()=>{
 await mount();await startClash();await wait(1040);await wait(300);expect(status()).toBe('STRUCK!');
 expect(document.querySelector('[aria-label="Your chosen hand"]')?.textContent).toContain('NO HAND SELECTED');
});
it('repeated tied clashes repeat without adding a score or completing a match',async()=>{
 const {dispatch}=await mount();await startClash();
 for(let i=0;i<4;i++){await choose('paper');await wait(1040);await wait(300);expect(status()).toContain('TIE → CLASH');await wait(1200);}
 expect(dispatch).not.toHaveBeenCalled();await choose('scissors');await wait(1040);await wait(300);expect(status()).toBe('POINT!');
});
it('pauses warning and clash time, rejects paused input, and clears clash timers on forfeit',async()=>{
 await mount();await choose('rock');await reveal();await click('PAUSE MATCH');await wait(20000);
 await click('RESUME MATCH');expect(status()).toContain('TIE → CLASH');await wait(1200);await wait(420);
 await click('PAUSE MATCH');await choose('scissors');await wait(20000);await click('RESUME MATCH');
 expect(document.querySelector('[aria-label="Choose scissors"]')?.getAttribute('aria-pressed')).toBe('false');
 await wait(400);expect(status()).toContain('CLASH!');await choose('scissors');await wait(240);await wait(300);expect(status()).toBe('POINT!');
 await wait(1900);await choose('rock');await reveal(); // .6 is another normal tie
 await click('PAUSE MATCH');await click('FORFEIT & RETURN');await wait(30000);
 expect(document.querySelector('[aria-label="Dojo main menu"]')).not.toBeNull();expect(document.querySelector('.duel-clash-status')).toBeNull();
});
it('a Guard-blocked loss stays a draw and does not trigger a clash',async()=>{
 const {random}=await mount('ENDLESS TOWER',1);random.mockReturnValue(.9);await choose('rock');await click('GUARD');await reveal();expect(status()).toBe('DRAW');expect(document.querySelector('.duel-clash-status')).toBeNull();expect(document.querySelector('[data-hit-stop=true]')).toBeNull();
});
it('an armed Guard cannot negate a clash loss and remains for the next regular round',async()=>{
 await mount('ENDLESS TOWER',1);await click('GUARD');await startClash();await choose('rock');await wait(1040);await wait(300);expect(status()).toBe('STRUCK!');
 expect(document.querySelector('.unified-touch-tools')?.textContent).toContain('GUARD ARMED');
});
it('keeps the Classic Daily ban on both fighters throughout repeated clashes',async()=>{
 const {random}=await mount('CLASSIC DAILY');
 const legal=MOVES.filter(m=>!document.querySelector<HTMLButtonElement>(`[aria-label="Choose ${m}"]`)!.disabled);
 expect(legal).toHaveLength(2);random.mockReturnValue(0);await click('PEEK FREE');await choose(legal[1]!);await reveal('daily');
 expect(status()).toContain('TIE → CLASH');await wait(1200);
 const banned=MOVES.find(m=>!legal.includes(m))!;expect(document.querySelector<HTMLButtonElement>(`[aria-label="Choose ${banned}"]`)!.disabled).toBe(true);
 await choose(legal[0]!);await wait(1040);await wait(300);expect(status()).toContain('TIE → CLASH');
});
it('uses the desktop hand buttons for the same clash and mutes strike audio at effects volume zero',async()=>{
 await mount();
 const Audio=vi.fn();Object.defineProperty(window,'AudioContext',{configurable:true,value:Audio});
 await act(()=>{Object.defineProperty(window,'innerWidth',{configurable:true,value:1280});Object.defineProperty(window,'innerHeight',{configurable:true,value:800});window.dispatchEvent(new Event('resize'));});
 await click('ROCK [1]');await reveal();await wait(1200);await click('SCISSORS [3]');await wait(1040);await wait(300);
 expect(document.body.textContent).toContain('POINT!');expect(document.querySelector('.duel-impact-ink')).not.toBeNull();expect(Audio).not.toHaveBeenCalled();
 Reflect.deleteProperty(window,'AudioContext');
});

it('Enter the Dojo ties use the full regular countdown, not a one-second clash',async()=>{
 const {random,dispatch}=await mount('ENTER THE DOJO');
 await choose('rock');await wait(roundBeatMs('ladder',0)*3+40);await wait(300);
 expect(status()).toBe('DRAW');expect(document.querySelector('.duel-clash-status')).toBeNull();
 expect(document.body.textContent).toContain('DRAW — NO POINT');expect(dispatch).not.toHaveBeenCalled();
 await wait(1900);expect(status()).toContain('ROCK…');
 expect(document.querySelector('[aria-label="Choose rock"]')?.getAttribute('aria-pressed')).toBe('false');
 await wait(1500);expect(status()).not.toBe('STRUCK!');
 random.mockReturnValue(.1);await choose('rock');await wait(roundBeatMs('ladder',0)*3-1500+40);await wait(300);
 expect(status()).toBe('POINT!');expect(document.querySelector('[data-hit-stop=true]')).not.toBeNull();expect(dispatch).not.toHaveBeenCalled();
});
