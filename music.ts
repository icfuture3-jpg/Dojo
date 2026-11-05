// Tiny synthesized dojo soundtrack: taiko-style drums and a pentatonic flute line.
// Tempo rises with intensity (0..1).

const M = { ctx: null as AudioContext | null, timer: 0, step: 0, intensity: 0, muted: false, started: false, volume: 1 };

const FLUTE = [293.66, 329.63, 392, 440, 523.25, 587.33];

function play(freq: number, dur: number, type: OscillatorType, vol: number, slide = 0): void {
  if (!M.ctx || M.muted || M.volume === 0) return;
  const o = M.ctx.createOscillator();
  const g = M.ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, M.ctx.currentTime);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), M.ctx.currentTime + dur);
  g.gain.setValueAtTime(vol * M.volume, M.ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, M.ctx.currentTime + dur);
  o.connect(g).connect(M.ctx.destination);
  o.start();
  o.stop(M.ctx.currentTime + dur);
}

function tick(): void {
  window.clearTimeout(M.timer);
  const s = M.step % 16;
  if (s % 8 === 0) play(90, 0.35, "sine", 0.18, -50);
  if (s === 4 || s === 12) play(140, 0.2, "triangle", 0.1, -60);
  if (M.intensity > 0.4 && s % 2 === 0) play(220, 0.08, "square", 0.025);
  if (M.intensity > 0.75 && s % 4 === 2) play(70, 0.2, "sine", 0.14, -30);
  if (s % 4 === 0 && ((M.step >> 2) + (M.step >> 4)) % 3 !== 2) {
    const n = FLUTE[(M.step * 7 + (M.step >> 3) * 3) % FLUTE.length] as number;
    play(n, 0.55, "sine", 0.045);
  }
  M.step += 1;
  M.timer = window.setTimeout(tick, 190 - M.intensity * 80);
}

export function startMusic(): void {
  if (M.started) return;
  try {
    M.ctx = new window.AudioContext();
    void M.ctx.resume();
    M.started = true;
    tick();
  } catch {
    /* audio unavailable */
  }
}

export function setMusicIntensity(v: number): void {
  M.intensity = Math.max(0, Math.min(1, v));
}

export function setMusicMuted(m: boolean): void {
  M.muted = m;
}
export function setMusicVolume(volume: number) { M.volume = Math.max(0, Math.min(1, volume)); }
export function stopMusic() {
  window.clearTimeout(M.timer);
  if (M.ctx) void M.ctx.close().catch(() => {});
  M.ctx = null; M.started = false;
}
let effectsVolume = 1;
export function setEffectsVolume(volume: number) { effectsVolume = Math.max(0, Math.min(1, volume)); }
export function getEffectsVolume() { return effectsVolume; }
