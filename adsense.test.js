import { expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

it('loads AdSense once in the head with the requested publisher', () => {
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const scripts = html.match(/<script\b[^>]*\bsrc="[^"]*adsbygoogle\.js[^" >]*"[^>]*><\/script>/g);
  expect(scripts).toHaveLength(1);
  const script = scripts[0];
  expect(script).toContain('src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7490501106653664"');
  expect(script).toMatch(/\sasync(?:\s|>)/);
  expect(script).toContain('crossorigin="anonymous"');
  expect(html.slice(html.indexOf('<head>'), html.indexOf('</head>'))).toContain(script);
});

it('includes the AdSense account meta tag exactly once in the head', () => {
  const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');
  const tags = html.match(/<meta\b[^>]*name="google-adsense-account"[^>]*>/g);
  const expected = '<meta name="google-adsense-account" content="ca-pub-7490501106653664">';
  expect(tags).toEqual([expected]);
  expect(html.slice(html.indexOf('<head>'), html.indexOf('</head>'))).toContain(expected);
});
