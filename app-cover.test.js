import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

it('ships the approved cover and correctly sized icons referenced by the page', () => {
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  for (const [file, size] of [['dojo-cover.png', 2048], ['apple-touch-icon.png', 180], ['favicon.png', 64]]) {
    const png = readFileSync(new URL(`./public/${file}`, import.meta.url));
    expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
    expect(png.readUInt32BE(16)).toBe(size);
    expect(png.readUInt32BE(20)).toBe(size);
    expect(html).toContain(`/${file}`);
  }
  for (const tag of ['og:image', 'twitter:image']) {
    expect(html).toMatch(new RegExp(`(?:property|name)="${tag}" content="https://dojo-jade-seven\\.vercel\\.app/dojo-cover\\.png"`));
  }
});
