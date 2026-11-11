import { afterEach, expect, it, vi } from 'vitest';
import type { ReactNode } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SAVE_KEY } from './saves';
import { parseProfile } from './economy';

// Render the real title-menu portal inline without mounting the browser entry.
vi.mock('react-dom', async importOriginal => ({
  ...await importOriginal<typeof import('react-dom')>(),
  createPortal: (children: ReactNode) => children,
}));
vi.mock('react-dom/client', () => ({ createRoot: () => ({ render: () => {} }) }));
afterEach(() => vi.unstubAllGlobals());

async function renderApp(saved: string | null) {
  vi.stubGlobal('document', { body: {}, getElementById: () => ({}) });
  vi.stubGlobal('window', {
    innerWidth: 1280, innerHeight: 800,
    localStorage: { getItem: (key: string) => key === SAVE_KEY ? saved : null },
  });
  const { App } = await import('./main');
  return renderToStaticMarkup(<App />);
}

it('keeps the game and audio menu without Save Tools or import controls', async () => {
  const html = await renderApp(JSON.stringify(parseProfile({ name: 'Saved Fighter', coins: 321 })));
  expect(html).toContain('ENTER THE DOJO');
  expect(html).toContain('AUDIO SETTINGS');
  expect(html).toContain('Saved Fighter');
  expect(html).not.toMatch(/SAVE TOOLS|EXPORT PROGRESS|REVIEW PREVIOUS BACKUP|Import save file|type="file"/);
  expect(html).not.toContain('EXPORT THIS SESSION');
});

it('keeps emergency save-warning export without restoring the removed panel', async () => {
  const html = await renderApp('{broken');
  expect(html).toContain('aria-label="Save status"');
  expect(html).toContain('EXPORT THIS SESSION');
  expect(html).not.toMatch(/SAVE TOOLS|REVIEW PREVIOUS BACKUP|Import save file/);
});
