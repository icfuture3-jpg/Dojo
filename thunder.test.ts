import {afterEach,expect,it,vi} from 'vitest';
import {prepareThunder} from './thunder';
import {setEffectsVolume} from './music';
afterEach(()=>{setEffectsVolume(1);vi.unstubAllGlobals();});
function audio(){
 const gains:number[]=[],start=vi.fn(),close=vi.fn(()=>Promise.resolve());
 const param={setValueAtTime:vi.fn(),exponentialRampToValueAtTime:vi.fn()};
 const connect=function(this:unknown){return this;};
 const ctx={currentTime:0,sampleRate:100,destination:{},resume:()=>Promise.resolve(),close,
  createBuffer:()=>({getChannelData:()=>new Float32Array(90)}),
  createBufferSource:()=>({buffer:null,connect,start,stop:vi.fn()}),
  createBiquadFilter:()=>({type:'',frequency:param,connect}),
  createGain:()=>({gain:{setValueAtTime:(v:number)=>gains.push(v),exponentialRampToValueAtTime:vi.fn()},connect}),
  createOscillator:()=>({type:'',frequency:param,connect,start,stop:vi.fn()})};
 const construct=vi.fn();class Audio{constructor(){construct();return ctx;}}
 vi.stubGlobal('window',{AudioContext:Audio});return {gains,start,close,construct};
}
it('synthesizes the crack and bass at the effects volume and releases audio on dispose',()=>{
 const a=audio();setEffectsVolume(.5);const sound=prepareThunder();expect(a.start).not.toHaveBeenCalled();
 sound.strike();expect(a.gains).toEqual([.15,.11]);expect(a.start).toHaveBeenCalledTimes(2);
 sound.dispose();sound.dispose();sound.strike();expect(a.close).toHaveBeenCalledOnce();expect(a.start).toHaveBeenCalledTimes(2);
});
it('does not initialize at zero volume and rechecks mute before striking',()=>{
 const a=audio();setEffectsVolume(0);const muted=prepareThunder();muted.strike();expect(a.construct).not.toHaveBeenCalled();
 setEffectsVolume(1);const active=prepareThunder();setEffectsVolume(0);active.strike();expect(a.start).not.toHaveBeenCalled();active.dispose();
});
it('contains unavailable or blocked audio rather than breaking the finisher',async()=>{
 class Audio{constructor(){throw new Error('Unavailable');}}vi.stubGlobal('window',{AudioContext:Audio});expect(()=>prepareThunder().strike()).not.toThrow();
 const a=audio(); // Replace resume to exercise rejected autoplay in a separate context.
 class Blocked{resume(){return Promise.reject(new Error('Blocked'));}close(){return a.close();}}
 vi.stubGlobal('window',{AudioContext:Blocked});const sound=prepareThunder();await Promise.resolve();expect(a.close).toHaveBeenCalledOnce();expect(()=>sound.strike()).not.toThrow();
});
