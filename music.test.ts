import { expect, it, vi } from 'vitest';
import { getEffectsVolume, setEffectsVolume, setMusicMuted, setMusicVolume, startMusic, stopMusic } from './music';
it('applies saved music gain, respects zero volume, and tears down the soundtrack timer/context', () => {
  vi.useFakeTimers();
  const gains: number[] = [];
  const close = vi.fn(() => Promise.resolve());
  const context = {
    currentTime: 0, destination: {}, resume: () => Promise.resolve(), close,
    createOscillator: () => ({ type: 'sine', frequency: { setValueAtTime() {}, exponentialRampToValueAtTime() {} }, connect() { return this; }, start() {}, stop() {} }),
    createGain: () => ({ gain: { setValueAtTime: (v: number) => gains.push(v), exponentialRampToValueAtTime() {} }, connect() { return this; } }),
  };
  class Audio { constructor() { return context; } }
  vi.stubGlobal('window', { AudioContext: Audio, setTimeout, clearTimeout });
  try {
    setMusicMuted(false); setMusicVolume(.25); startMusic();
    expect(gains.some(v => Math.abs(v - .18 * .25) < .00001)).toBe(true);
    const count = gains.length; setMusicVolume(0); vi.advanceTimersByTime(1000); expect(gains.length).toBe(count);
    stopMusic(); expect(close).toHaveBeenCalledOnce(); expect(vi.getTimerCount()).toBe(0);
    setEffectsVolume(.3); expect(getEffectsVolume()).toBe(.3); setEffectsVolume(-1); expect(getEffectsVolume()).toBe(0); setEffectsVolume(2); expect(getEffectsVolume()).toBe(1);
  } finally { setMusicVolume(1); setEffectsVolume(1); vi.useRealTimers(); vi.unstubAllGlobals(); }
});

it('releases failed audio startup so a subsequent start can retry',()=>{
 vi.useFakeTimers();
 const close=vi.fn(()=>Promise.resolve());
 const createOscillator=vi.fn(()=>{throw new Error('Audio device unavailable');});
 const context={resume:()=>Promise.resolve(),close,createOscillator};
 const construct=vi.fn();class Audio{constructor(){construct();return context;}}
 vi.stubGlobal('window',{AudioContext:Audio,setTimeout,clearTimeout});
 try{
  setMusicMuted(false);setMusicVolume(1);startMusic();
  expect(close).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
  startMusic();expect(construct).toHaveBeenCalledTimes(2);
 }finally{stopMusic();vi.useRealTimers();vi.unstubAllGlobals();}
});

it('contains a later audio-device failure instead of throwing from the soundtrack timer',()=>{
 vi.useFakeTimers();
 const close=vi.fn(()=>Promise.resolve());let failed=false;
 const context={currentTime:0,destination:{},resume:()=>Promise.resolve(),close,
  createOscillator:()=>{if(failed)throw new Error('Audio device disconnected');return {type:'sine',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;},start(){},stop(){}};},
  createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;}})};
 class Audio{constructor(){return context;}}
 vi.stubGlobal('window',{AudioContext:Audio,setTimeout,clearTimeout});
 try{
  setMusicMuted(false);setMusicVolume(1);startMusic();failed=true;
  expect(()=>vi.advanceTimersByTime(2000)).not.toThrow();
  expect(close).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
 }finally{stopMusic();vi.useRealTimers();vi.unstubAllGlobals();}
});

it('handles rejected resume promises and ignores failures from replaced contexts',async()=>{
 vi.useFakeTimers();
 let rejectOld:(reason?:unknown)=>void=()=>{};
 const oldResume=new Promise<void>((_,reject)=>{rejectOld=reject;});
 const make=(resume:Promise<void>)=>({currentTime:0,destination:{},resume:()=>resume,close:vi.fn(()=>Promise.resolve()),
  createOscillator:()=>({type:'sine',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;},start(){},stop(){}}),
  createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){return this;}})});
 const old=make(oldResume),active=make(Promise.resolve());let calls=0;
 class Audio{constructor(){return calls++===0?old:active;}}
 vi.stubGlobal('window',{AudioContext:Audio,setTimeout,clearTimeout});
 try{
  setMusicMuted(false);setMusicVolume(1);startMusic();stopMusic();startMusic();
  rejectOld(new Error('Old resume rejected'));await Promise.resolve();
  expect(active.close).not.toHaveBeenCalled();expect(vi.getTimerCount()).toBe(1);
  stopMusic();
  const rejected=make(Promise.reject(new Error('Resume blocked')));
  class Blocked{constructor(){return rejected;}}
  vi.stubGlobal('window',{AudioContext:Blocked,setTimeout,clearTimeout});
  startMusic();await Promise.resolve();
  expect(rejected.close).toHaveBeenCalledOnce();expect(vi.getTimerCount()).toBe(0);
 }finally{stopMusic();vi.useRealTimers();vi.unstubAllGlobals();}
});
