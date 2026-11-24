import { getEffectsVolume } from './music';

/** Prepare on opening the finisher (a user gesture); strike at its footfall. */
export function prepareThunder() {
 let ctx: AudioContext | null = null;
 let disposed = false;
 const dispose = () => {
  disposed = true;
  const old = ctx; ctx = null;
  try { if (old) void old.close().catch(() => {}); } catch { /* unavailable device */ }
 };
 try {
  if (getEffectsVolume() > 0) {
   ctx = new window.AudioContext();
   void ctx.resume().catch(dispose);
  }
 } catch { dispose(); }
 return {
  strike() {
   const volume = getEffectsVolume();
   if (!ctx || disposed || volume === 0) return;
   try {
    const t = ctx.currentTime;
    // Low-passed noise supplies the crack/rolling thunder; a falling bass adds weight.
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * .9), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource(); noise.buffer = buffer;
    const filter = ctx.createBiquadFilter(); filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1600, t); filter.frequency.exponentialRampToValueAtTime(100, t + .9);
    const gain = ctx.createGain(); gain.gain.setValueAtTime(.3 * volume, t); gain.gain.exponentialRampToValueAtTime(.0001, t + .9);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start(t); noise.stop(t + .9);
    const bass = ctx.createOscillator(); bass.type = 'sine';
    bass.frequency.setValueAtTime(90, t); bass.frequency.exponentialRampToValueAtTime(28, t + .65);
    const bassGain = ctx.createGain(); bassGain.gain.setValueAtTime(.22 * volume, t); bassGain.gain.exponentialRampToValueAtTime(.0001, t + .7);
    bass.connect(bassGain).connect(ctx.destination); bass.start(t); bass.stop(t + .7);
   } catch { dispose(); }
  },
  dispose,
 };
}
