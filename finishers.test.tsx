// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act} from 'react';
import {createRoot,type Root} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {Fighter} from './hud';
import {FinisherScene,FINISHER_CHOREOGRAPHY} from './finishers';
import {NEW_COSMETICS} from './economy';
const items=NEW_COSMETICS.filter(item=>item.slot==='finisher');
const avatar=<Fighter color="#2471a3" belt="#fff" move={null} state="idle"/>;
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.restoreAllMocks();vi.useRealTimers();});
it('keeps feet outside a shared upper-body joint so bowing can bend at the waist',()=>{
 const el=document.createElement('div');el.innerHTML=renderToStaticMarkup(avatar);
 const upper=el.querySelector('.fighter-upper-body');expect(upper).not.toBeNull();
 expect(upper?.querySelector('.fighter-right-arm')).not.toBeNull();
 expect(upper?.querySelector('.fighter-right-leg')).toBeNull();expect(el.querySelector('.fighter-right-leg')).not.toBeNull();
});
it.each(items)('$name has readable choreography and uses the saved avatar, not a replacement',item=>{
 const html=renderToStaticMarkup(<FinisherScene item={item} avatar={avatar} onDone={()=>{}}/>);
 expect(html).toContain('finisher-choreography');expect(html).toContain(`data-finisher="${item.id}"`);
 expect(html).toContain('fighter-upper-body');expect(html).toContain('CONTINUE');
 expect(html).not.toContain('equippedFinisher 2s');
});
it('a preview restarted with another move gets its full duration and Continue finishes once',async()=>{
 vi.useFakeTimers();const done=vi.fn(),el=document.createElement('main');document.body.append(el);root=createRoot(el);
 const render=async(i:number)=>act(()=>root!.render(<FinisherScene item={items[i]!} avatar={avatar} onDone={done}/>));
 await render(0);await act(()=>vi.advanceTimersByTime(3000));await render(1);
 await act(()=>vi.advanceTimersByTime(2000));expect(done).not.toHaveBeenCalled();
 await act(()=>el.querySelector('button')!.click());await act(()=>vi.advanceTimersByTime(10000));expect(done).toHaveBeenCalledOnce();
});

it('uses action-specific joints rather than tipping every whole character',()=>{
 const [bow,,stomp,leap,,lotus,kick,punch,crane,salute,wave,star]=FINISHER_CHOREOGRAPHY;
 expect(bow!.strike.body).toBeUndefined();expect(bow!.strike.leftLeg).toBeUndefined();expect(bow!.strike.upper).toContain('rotateX(-60deg)');
 expect(stomp!.windup.rightLeg).toContain('translateY(-48px)');expect(stomp!.strike.body).toContain('translateY(8px)');
 expect(leap!.strike.body).toContain('translateY(-100px)');
 expect(lotus!.strike.leftLeg).toBe('rotate(-72deg)');expect(lotus!.strike.rightLeg).toBe('rotate(72deg)');
 expect(kick!.strike.rightLeg).toBe('rotate(-105deg)');expect(punch!.strike.rightArm).toBe('rotate(-100deg)');
 expect(crane!.strike.rightLeg).toContain('translateY(-44px)');expect(crane!.strike.leftLeg).toBeUndefined();
 expect(salute!.strike.leftArm).toBe('rotate(165deg)');expect(salute!.strike.rightArm).toBe('rotate(-165deg)');
 expect(wave!.effect).toBe('wave');expect(wave!.strike.rightArm).toBe('rotate(-90deg)');
 expect(star!.strike.leftLeg).toBe('rotate(32deg)');expect(star!.strike.rightLeg).toBe('rotate(-32deg)');
});
it('automatically completes after the full choreography and cancels on unmount',async()=>{
 vi.useFakeTimers();const done=vi.fn(),el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<FinisherScene item={items[0]!} avatar={avatar} onDone={done}/>));
 await act(()=>vi.advanceTimersByTime(5199));expect(done).not.toHaveBeenCalled();
 await act(()=>vi.advanceTimersByTime(1));expect(done).toHaveBeenCalledOnce();
 await act(()=>root!.unmount());root=undefined;await act(()=>vi.advanceTimersByTime(10000));expect(done).toHaveBeenCalledOnce();
});
it('adds lightning only to Thunder Stomp, timed to the 44% footfall pose',()=>{
 for(const item of items){
  const el=document.createElement('div');el.innerHTML=renderToStaticMarkup(<FinisherScene item={item} avatar={avatar} onDone={()=>{}}/>);
  expect(el.querySelector('.finisher-thunder')!==null).toBe(item.id==='finisher-2');
  if(item.id==='finisher-2'){
   expect(el.querySelector('.finisher-choreography')?.getAttribute('style')).toContain('--stomp-impact-delay:2288ms');
   expect(el.querySelector('.thunder-bolts')).not.toBeNull();expect(el.querySelector('.thunder-ground')).not.toBeNull();
  }
 }
});

it('Jade Wave energy and its currentColor glow use jade green, independent of catalog color',()=>{
 const item=items.find(i=>i.id==='finisher-10')!;
 const el=document.createElement('div');el.innerHTML=renderToStaticMarkup(<FinisherScene item={{...item,color:'#ff0000'}} avatar={avatar} onDone={()=>{}}/>);
 expect(el.querySelector('.finisher-choreography')?.getAttribute('style')).toContain('--finisher-color:#00a86b');
 expect(el.querySelector('.finisher-effect-wave')).not.toBeNull();
 const other=document.createElement('div');other.innerHTML=renderToStaticMarkup(<FinisherScene item={{...items[0]!,color:'#ff0000'}} avatar={avatar} onDone={()=>{}}/>);
 expect(other.querySelector('.finisher-choreography')?.getAttribute('style')).toContain('--finisher-color:#ff0000');
});
