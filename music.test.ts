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
