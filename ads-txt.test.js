import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';

it('publishes the requested AdSense authorized seller record',()=>{
 const text=readFileSync(new URL('./public/ads.txt',import.meta.url),'utf8');
 expect(text).toBe('google.com, pub-7490501106653664, DIRECT, f08c47fec0942fa0\n');
});
