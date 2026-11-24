import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { applyAction } from './actions';
import { applyLogin, parseProfile } from './economy';
import { ProfileBar, RanksPanel } from './meta';
import { loadSave, saveProfile } from './saves';

it('shows zero wins/losses for new players and derives losses from existing saved matches', () => {
  expect(renderToStaticMarkup(<ProfileBar p={parseProfile({})} />)).toContain('Wins: 0 · Losses: 0');
  const p = parseProfile({ stats: { played: 12, won: 7 } });
  const html = renderToStaticMarkup(<ProfileBar p={p} />);
  expect(html).toContain('Wins: 7 · Losses: 5');
  expect(html).toContain('Tournament record');
  expect(renderToStaticMarkup(<RanksPanel p={p} boardData={JSON.stringify([{ id: 'local', name: 'You', rp: 0, wins: 7, losses: 5 }])} boardId="local" dispatch={() => {}} onClose={() => {}} />)).toContain('Wins: 7 · Losses: 5');
});

it('updates the displayed record once per match and keeps both totals after saving and reloading', () => {
  const now = Date.UTC(2026, 10, 8);
  let p = applyLogin(parseProfile({}), now);
  const win = { completionId: 'record-win', rival: 0, won: true, roundsWon: 3, roundsLost: 1, comeback: false, perfectRun: false };
  p = applyAction(p, 'matchDone', win, now);
  expect(renderToStaticMarkup(<ProfileBar p={p} />)).toContain('Wins: 1 · Losses: 0');
  p = applyAction(p, 'matchDone', { ...win, completionId: 'record-loss', won: false, roundsWon: 1, roundsLost: 3 }, now);
  p = applyAction(p, 'matchDone', win, now);
  let value: string | null = null;
  const storage = { getItem: () => value, setItem: (_key: string, next: string) => { value = next; } };
  expect(saveProfile(storage, p)).toBeNull();
  const restored = loadSave(storage, now).profile;
  expect(renderToStaticMarkup(<ProfileBar p={restored} />)).toContain('Wins: 1 · Losses: 1');
});
