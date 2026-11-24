import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {FRIENDS} from './friends';
it('ships all fourteen actual screenshot crops at native resolution, with no substituted files',()=>{
 const manifest=JSON.parse(readFileSync('friend-image-manifest.json','utf8'));
 expect(manifest.images.map((i:{id:string})=>i.id)).toEqual(FRIENDS.map(f=>f.id));
 const hashes:string[]=[];
 for(const crop of manifest.images){
  const bytes=readFileSync(`public/images/friends/${crop.id}.png`);
  expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.readUInt32BE(16)).toBe(104);expect(bytes.readUInt32BE(20)).toBe(106);
  const hash=createHash('sha256').update(bytes).digest('hex');
  expect(hash).toBe(crop.sha256);hashes.push(hash);
 }
 expect(new Set(hashes).size).toBe(14);
});
