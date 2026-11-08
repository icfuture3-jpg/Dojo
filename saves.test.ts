import { expect, it } from 'vitest';
import { parseProfile } from './economy';
import { BACKUP_KEY, loadSave, RECOVERY_KEY, SAVE_KEY, saveProfile, type SaveStorage } from './saves';
const now = Date.UTC(2026, 10, 3);
function storage() {
  const values = new Map<string, string>();
  const api: SaveStorage = { getItem: k => values.get(k) ?? null, setItem: (k, v) => { values.set(k, v); } };
  return { values, api };
}
it('persists startup login rewards and does not repay on same-day reload', () => {
  const { api, values } = storage();
  const first = loadSave(api, now);
  expect(first.profile.coins).toBe(135);
  expect(saveProfile(api, first.profile)).toBeNull();
  expect(values.has(SAVE_KEY)).toBe(true);
  const again = loadSave(api, now);
  expect(again.profile.coins).toBe(first.profile.coins);
  expect(again.profile.xp).toBe(first.profile.xp);
});
it('migrates legacy saves and preserves progress, ownership and valid nested siblings', () => {
  const { api, values } = storage();
  const old = JSON.stringify({ coins: 999, gems: 22, xp: 530, rp: 60, owned: ['gi-blue', 'gi-crimson'], training: { matches: 9, completed: 2, strength: -1 }, look: { hairColor: 18, skin: 5 }, stats: { won: 8 } });
  values.set(SAVE_KEY, old);
  const loaded = loadSave(api, now);
  expect(loaded.profile.training).toEqual({ matches: 9, completed: 2, strength: 0 });
  expect(loaded.profile.owned).toContain('gi-crimson');
  expect(loaded.profile.look.hairColor).toBe(18);
  expect(loaded.profile.stats.won).toBe(8);
  expect(loaded.profile.completedResults).toEqual([]);
  expect(loaded.profile.saveVersion).toBe(4);
  expect(saveProfile(api, loaded.profile)).toBeNull();
  expect(values.get(RECOVERY_KEY)).toBe(old);
  expect(parseProfile({ owned: ['gi-blue', 42, 'gi-crimson'] }).owned).toEqual(['gi-blue', 'gi-crimson']);
});
it('does not mutate the object being repaired', () => {
  const old = { training: { matches: 9, completed: 2, strength: -1 } };
  parseProfile(old);
  expect(old.training.strength).toBe(-1);
});
it('backs up a valid save before replacing it and recovers corrupt JSON', () => {
  const { api, values } = storage();
  const first = loadSave(api, now).profile;
  saveProfile(api, first);
  const next = { ...first, coins: first.coins + 10 };
  saveProfile(api, next);
  expect(JSON.parse(values.get(BACKUP_KEY)!).coins).toBe(first.coins);
  values.set(SAVE_KEY, '{broken');
  const recovered = loadSave(api, now);
  expect(recovered.canSave).toBe(true);
  expect(recovered.warning).toContain('Recovered');
  expect(recovered.profile.coins).toBe(first.coins);
  expect(saveProfile(api, recovered.profile)).toBeNull();
  expect(values.get(RECOVERY_KEY)).toBe('{broken');
});
it('retains unrecoverable and newer-version saves rather than silently resetting them', () => {
  const { api, values } = storage();
  values.set(SAVE_KEY, '{broken');
  expect(loadSave(api, now).canSave).toBe(false);
  expect(values.get(SAVE_KEY)).toBe('{broken');
  const future = JSON.stringify({ saveVersion: 5, coins: 500 });
  values.set(SAVE_KEY, future);
  const loaded = loadSave(api, now);
  expect(loaded.canSave).toBe(false);
  expect(saveProfile(api, loaded.profile)).toContain('newer-version');
  expect(values.get(SAVE_KEY)).toBe(future);
});
it('reports blocked reads and quota failures and leaves the previous save intact', () => {
  const unavailable: SaveStorage = { getItem: () => { throw new Error('blocked'); }, setItem: () => { throw new Error('blocked'); } };
  expect(loadSave(unavailable, now).canSave).toBe(false);
  expect(saveProfile(unavailable, parseProfile({}))).toContain('Saving failed');
  expect(loadSave(null, now).warning).toContain('not being saved');
  const { api, values } = storage();
  const original = JSON.stringify(parseProfile({ coins: 800 })); values.set(SAVE_KEY, original);
  const quota: SaveStorage = { getItem: api.getItem, setItem: () => { throw new Error('quota'); } };
  expect(saveProfile(quota, parseProfile({ coins: 900 }))).toContain('Saving failed');
  expect(values.get(SAVE_KEY)).toBe(original);
  expect(saveProfile(api, parseProfile({ coins: 900 }))).toBeNull();
});
it('skips redundant writes and does not persist invalid numeric progress', () => {
  const { api, values } = storage();
  const p = parseProfile({}); saveProfile(api, p);
  const noWrites: SaveStorage = { getItem: api.getItem, setItem: () => { throw new Error('must not write'); } };
  expect(saveProfile(noWrites, p)).toBeNull();
  expect(saveProfile(api, { ...p, xp: NaN })).toContain('validated');
  expect(JSON.parse(values.get(SAVE_KEY)!).xp).toBe(0);
});

it('recovers a valid Stage 1 backup when the new primary is damaged', () => {
 const {api, values}=storage();values.set(SAVE_KEY,'{broken');values.set(BACKUP_KEY,JSON.stringify({...parseProfile({coins:500}),saveVersion:2}));
 const loaded=loadSave(api,now);expect(loaded.canSave).toBe(true);expect(loaded.profile.saveVersion).toBe(4);expect(loaded.profile.coins).toBeGreaterThanOrEqual(500);expect(loaded.warning).toContain('Recovered');
});

it('persists dismissal without repaying the day-two login or Regular trophy on refresh', async () => {
  const { applyAction } = await import('./actions');
  const { api, values } = storage();
  values.set(SAVE_KEY, JSON.stringify(parseProfile({
    coins: 200, gems: 8, xp: 15, streak: 1, lastLogin: '2026-11-02', season: '2026-11',
  })));
  const paid = loadSave(api, now).profile;
  expect([paid.coins, paid.gems, paid.xp]).toEqual([330, 9, 30]);
  expect(paid.last.lines).toContain('TROPHY: Regular');
  const dismissed = applyAction(paid, 'dismissNotice', { n: paid.last.n }, now);
  expect(dismissed).toMatchObject({ seenNotice: paid.last.n });
  expect(paid).not.toHaveProperty('seenNotice', paid.last.n);
  expect(saveProfile(api, dismissed)).toBeNull();
  const reloaded = loadSave(api, now).profile;
  expect(reloaded).toMatchObject({ seenNotice: reloaded.last.n, coins: 330, gems: 9, xp: 30 });
  const tomorrow = loadSave(api, now + 86400000).profile;
  expect(tomorrow.last.n).toBeGreaterThan(reloaded.last.n);
  expect(tomorrow).toMatchObject({ coins: 395, gems: 9, xp: 45 });
  expect(tomorrow.last.lines).not.toContain('TROPHY: Regular');
});
