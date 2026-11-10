import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuRow } from './meta';

it('offers optional support through the supplied Stripe checkout without PayPal or payment inputs', () => {
  const html = renderToStaticMarkup(<MenuRow onOpen={() => {}} />);
  expect(html).toContain('◆ RANKS</button>');
  expect(html).toMatch(/<a[^>]*href="https:\/\/buy\.stripe\.com\/3cI7sL3oP74rbtf1vG2wU00"[^>]*target="_blank"[^>]*rel="noopener noreferrer"/);
  expect(html).toContain('SUPPORT THE DOJO</a>');
  expect(html).toContain('opens Stripe checkout in a new tab');
  expect(html).not.toMatch(/paypal|<(form|input)\b/i);
});
