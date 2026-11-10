import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { DonatePanel, MenuRow } from './meta';
import { parseProfile } from './economy';

it('offers a Donate tab with the other title-menu panels', () => {
  const html = renderToStaticMarkup(<MenuRow onOpen={() => {}} />);
  expect(html).toContain('♥ DONATE</button>');
  expect(html).toContain('◆ RANKS</button>');
});

it('links directly to the supplied public PayPal page without collecting payment details or changing progress', () => {
  const p = parseProfile({ coins: 321, stats: { played: 8, won: 5 } });
  const before = JSON.stringify(p);
  const html = renderToStaticMarkup(<DonatePanel p={p} onClose={() => {}} />);
  expect(html).toContain('Support the Dojo');
  expect(html).toMatch(/<a[^>]*href="https:\/\/paypal.me\/DemonicaFarr"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  expect(html).toContain('Donate via PayPal');
  expect(html).toContain('✕ BACK');
  expect(html).not.toMatch(/<(form|input)\b/);
  expect(JSON.stringify(p)).toBe(before);
});
