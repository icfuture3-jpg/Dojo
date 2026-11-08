import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parseProfile } from './economy';
import { RewardPopup } from './meta';

it('shows the credited balance alongside reward amounts without promising a successful save', () => {
  const p = parseProfile({ coins: 330, gems: 9, xp: 30, last: { n: 2, title: 'Welcome back!', lines: ['+50 coins +15 XP'] } });
  const html = renderToStaticMarkup(<RewardPopup p={p} onClose={() => {}} />);
  expect(html).toContain('+50 coins +15 XP');
  expect(html).toContain('Already added to your balance');
  expect(html).toContain('330 coins');
  expect(html).toContain('9 gems');
  expect(html).toContain('30 XP');
  expect(html).not.toContain('saved successfully');
});
