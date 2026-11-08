import { expect, it } from 'vitest';
import { applyAction } from './actions';
import { applyLogin, applyMatch, applyMode, boxOdds, ITEMS, levelInfo, parseProfile, trainingDue } from './economy';
const now = Date.UTC(2026, 10, 3);
const fresh = () => applyLogin(parseProfile({}), now);
const win = { completionId: 'match-1', rival: 0, won: true, roundsWon: 3, roundsLost: 1, comeback: false, perfectRun: false };
const loss = { ...win, won: false, roundsWon: 1, roundsLost: 3 };

it('credits each completion, box and training counter once, including after reload', () => {
  const p = fresh();
  const next = applyAction(p, 'matchDone', win, now);
  expect(next.stats.played).toBe(p.stats.played + 1);
  expect(next.freeBoxes).toBe(p.freeBoxes + 1);
  expect(next.training.matches).toBe(1);
  const restored = parseProfile(JSON.parse(JSON.stringify(next)));
  expect(applyAction(restored, 'matchDone', win, now)).toBe(restored);
  expect(applyAction(restored, 'modeDone', { ...win, mode: 'tower', floor: 0 }, now)).toBe(restored);
  expect(p.completedResults).toEqual([]);
  expect(p.training.matches).toBe(0);
});
it('three actual completions trigger scheduled training and cannot save it twice', () => {
  let p = fresh();
  for (let i = 0; i < 3; i++) p = applyAction(p, 'matchDone', { ...win, completionId: `win-${i}` }, now);
  expect(trainingDue(p)).toBe(true);
  const next = applyAction(p, 'trainingDone', { hits: 5 }, now);
  expect(next.training.strength).toBe(p.training.strength + 3);
  expect(next.xp).toBe(p.xp + 45);
  expect(trainingDue(next)).toBe(false);
  expect(applyAction(next, 'trainingDone', { hits: 5 }, now)).toBe(next);
});
it('loss training is granted once and keeps its existing strength/XP award', () => {
  const p = applyAction(fresh(), 'matchDone', loss, now);
  expect(p.lossTrainingPending).toBe(1);
  expect(p.freeBoxes).toBe(0);
  expect(applyAction(p, 'matchDone', loss, now)).toBe(p);
  const trained = applyAction(p, 'lossTrainingDone', { hits: 4 }, now);
  expect(trained.lossTrainingPending).toBe(0);
  expect(trained.training.strength).toBe(3);
  expect(applyAction(trained, 'lossTrainingDone', { hits: 4 }, now)).toBe(trained);
});
it('rejects missing IDs, nonfinite numbers, impossible scores and invalid mode events without rewards', () => {
  const p = fresh();
  for (const raw of [null, {}, { ...win, completionId: '' }, { ...win, completionId: undefined }, { ...win, rival: NaN }, { ...win, rival: Infinity }, { ...win, rival: 4 }, { ...win, roundsLost: 3 }, { ...loss, roundsWon: 3 }, { ...win, won: 'true' }]) {
    expect(applyAction(p, 'matchDone', raw, now)).toBe(p);
  }
  for (const raw of [null, { completionId: 'x', mode: 'unknown', floor: 0, won: true }, { completionId: 'x', mode: 'tower', floor: NaN, won: true }, { completionId: 'x', mode: 'rescue', floor: 5, won: true }]) expect(applyAction(p, 'modeDone', raw, now)).toBe(p);
  expect(applyMatch(p, { ...win, rival: NaN }, now)).toBe(p);
  expect(applyMode(p, { mode: 'tower', floor: NaN, won: true }, now)).toBeNull();
});
it('preserves normal match reward amounts and rank/XP curve', () => {
  const p = fresh();
  const expected = applyMatch(p, win, now);
  const actual = applyAction(p, 'matchDone', win, now);
  for (const key of ['coins', 'gems', 'xp', 'rp', 'trophies', 'prog', 'stats', 'beaten'] as const) expect(actual[key]).toEqual(expected[key]);
  expect(levelInfo(2015).level).toBe(9);
  expect(levelInfo(2016).level).toBe(10);
});
it('mode wins/losses count training once but spectators do not', () => {
  for (const mode of ['tower', 'daily', 'rescue'] as const) {
    const p = fresh(); const result = { completionId: mode, mode, floor: 0, won: true };
    const next = applyAction(p, 'modeDone', result, now);
    expect(next.training.matches).toBe(1); expect(next.freeBoxes).toBe(1);
    expect(applyAction(next, 'modeDone', result, now)).toBe(next);
    if (mode === 'daily') expect(applyAction(next, 'modeDone', { ...result, completionId: 'different-id' }, now)).toBe(next);
  }
  const p = fresh();
  const next = applyAction(p, 'modeDone', { completionId: 'spectator', mode: 'spectate', floor: 0, won: false, correct: true }, now);
  expect(next.training.matches).toBe(0); expect(next.freeBoxes).toBe(0); expect(next.lossTrainingPending).toBe(0);
});
it('rejects malformed actions and unknown messages without touching the profile', () => {
  const p = fresh();
  for (const kind of ['potDone', 'trainingDone', 'lossTrainingDone', 'buyPeek', 'buyItem', 'equip', 'buyUpgrade', 'setLook', 'openBox', 'setName', 'refreshBoard']) expect(applyAction(p, kind, null, now)).toBe(p);
  expect(applyAction(p, 'openBox', { currency: 'invalid' }, now)).toBe(p);
  expect(applyAction(p, 'buyPeek', { level: Infinity }, now)).toBe(p);
});
it('a supplied random draw produces repeatable earned-box transitions', () => {
  const p = { ...fresh(), coins: 1000, freeBoxes: 1 };
  const a = applyAction(p, 'openBox', { currency: 'free' }, now, .5);
  expect(applyAction(p, 'openBox', { currency: 'free' }, now, .5)).toEqual(a);
  expect(a.stats.boxes).toBe(p.stats.boxes + 1);
  expect(p.stats.boxes).toBe(0);
  expect(applyAction(p, 'openBox', { currency: 'free' }, now, NaN)).toBe(p);
});
it('displays the exact weighted eligible-pool rarity probabilities without changing selection', () => {
  const weights = { common: 60, rare: 28, epic: 10, legendary: 2 };
  for (const rp of [0, 200, 500, 900, 1500, 2400]) {
    const pool = ITEMS.filter(i => (i.coins || i.gems) && i.minRank <= [0, 200, 500, 900, 1500, 2400].filter(n => n <= rp).length - 1);
    const total = pool.reduce((sum, i) => sum + weights[i.rarity], 0);
    const odds = boxOdds(rp);
    expect(Object.values(odds).reduce((a, b) => a + b, 0)).toBeCloseTo(100);
    for (const rarity of Object.keys(weights) as (keyof typeof weights)[]) expect(odds[rarity]).toBeCloseTo(pool.filter(i => i.rarity === rarity).reduce((sum, i) => sum + weights[i.rarity], 0) / total * 100);
  }
  expect(boxOdds(0).legendary).toBe(0);
});

it('rejects paid mystery-box requests at the action boundary',()=>{
 const p={...fresh(),coins:10000,gems:1000,freeBoxes:1};
 for(const currency of ['coins','gems'])expect(applyAction(p,'openBox',{currency},now,.5)).toBe(p);
});
