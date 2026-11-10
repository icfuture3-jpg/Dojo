import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { MenuRow } from './meta';

it('keeps the game menu without donation controls or payment links', () => {
  const html = renderToStaticMarkup(<MenuRow onOpen={() => {}} />);
  expect(html).toContain('◆ RANKS</button>');
  expect(html).not.toMatch(/donat|paypal/i);
  expect(html).not.toContain('<a');
});
