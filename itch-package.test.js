import { afterEach, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, writeFileSync, copyFileSync, readFileSync, rmSync, symlinkSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { inflateRawSync, crc32 } from 'node:zlib';

const fixtures=[];
afterEach(()=>{for(const dir of fixtures.splice(0))rmSync(dir,{recursive:true,force:true});});
function fixture(files) {
  const root=mkdtempSync(join(tmpdir(),'dojo-itch-'));fixtures.push(root);
  mkdirSync(join(root,'scripts'));
  copyFileSync(new URL('./scripts/package-itch.mjs',import.meta.url),join(root,'scripts/package-itch.mjs'));
  for(const [name,data] of Object.entries(files)) {const path=join(root,'dist',name);mkdirSync(join(path,'..'),{recursive:true});writeFileSync(path,data);}
  return {root,run:()=>execFileSync(process.execPath,[join(root,'scripts/package-itch.mjs')],{encoding:'utf8',stdio:'pipe'})};
}
it('writes one valid compressed entry per built file, root index, CRC and deterministic checksum',()=>{
  const f=fixture({'index.html':'<script type="module" src="./assets/game.js"></script>','assets/game.js':'console.log("dojo only")'});
  expect(f.run()).toContain('2 unique files');
  const zip=readFileSync(join(f.root,'artifacts/dojo-itch.zip'));
  let offset=0;const entries=[];
  while(zip.readUInt32LE(offset)===0x04034b50){
    const nameLength=zip.readUInt16LE(offset+26),size=zip.readUInt32LE(offset+18),start=offset+30+nameLength;
    const name=zip.subarray(offset+30,start).toString();const data=inflateRawSync(zip.subarray(start,start+size));
    expect(crc32(data)).toBe(zip.readUInt32LE(offset+14));
    expect(data).toEqual(readFileSync(join(f.root,'dist',name)));entries.push(name);offset=start+size;
  }
  expect(entries).toEqual(['assets/game.js','index.html']);
  const end=zip.subarray(-22);expect(end.readUInt32LE()).toBe(0x06054b50);expect(end.readUInt16LE(10)).toBe(2);expect(end.readUInt32LE(16)).toBe(offset);
  const checksum=readFileSync(join(f.root,'artifacts/dojo-itch.zip.sha256'),'utf8');
  f.run();expect(readFileSync(join(f.root,'artifacts/dojo-itch.zip'))).toEqual(zip);expect(readFileSync(join(f.root,'artifacts/dojo-itch.zip.sha256'),'utf8')).toBe(checksum);
});
it.each([
  [{'other.html':'x'},'index.html must be at the ZIP root'],
  [{'index.html':'<script src="/assets/game.js"></script>'},'relative src'],
  [{'index.html':'<script src="./missing.js"></script>'},'Missing referenced asset'],
  [{'index.html':'game','copy.html':'game'},'Duplicate file content'],
  [{'index.html':'game','A.png':'a','a.png':'b'},'Duplicate/case-colliding'],
  [{'index.html':'game','old.ts':'source'},'Source/private file'],
])('rejects invalid distribution contents: %s',(files,error)=>{
  const f=fixture(files);try{f.run();throw new Error('Unexpected successful export');}catch(e){expect(String(e.stderr??e)).toContain(error);}
});
it('rejects symbolic links rather than packaging files outside the built game',()=>{
  const f=fixture({'index.html':'game'});writeFileSync(join(f.root,'private.txt'),'not part of game');symlinkSync(join(f.root,'private.txt'),join(f.root,'dist','link.txt'));
  try{f.run();throw new Error('Unexpected successful export');}catch(e){expect(String(e.stderr??e)).toContain('Do not package symbolic links');}
});
