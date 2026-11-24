import {inflateSync} from 'node:zlib';
import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {FRIENDS} from './friends';
function rgba(bytes:Buffer){
 const chunks:Buffer[]=[];
 for(let offset=8;offset<bytes.length;){const length=bytes.readUInt32BE(offset);if(bytes.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+length));offset+=length+12;}
 const raw=inflateSync(Buffer.concat(chunks)),stride=96*4,out=Buffer.alloc(stride*94);
 const paeth=(a:number,b:number,c:number)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<94;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){
  const n=y*stride+x,a=x>=4?out[n-4]:0,b=y?out[n-stride]:0,c=y&&x>=4?out[n-stride-4]:0;
  out[n]=(raw[y*(stride+1)+1+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
 }}return out;
}
it('ships all fourteen actual screenshot crops with transparent backgrounds and tighter bounds excluding screenshot borders/captions',()=>{
 const manifest=JSON.parse(readFileSync('friend-image-manifest.json','utf8'));
 expect(manifest.images.map((i:{id:string})=>i.id)).toEqual(FRIENDS.map(f=>f.id));
 const hashes:string[]=[];
 for(const crop of manifest.images){
  const bytes=readFileSync(`public/images/friends/${crop.id}.png`);
  expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
  expect(bytes.readUInt32BE(16)).toBe(96);expect(bytes.readUInt32BE(20)).toBe(94);
  expect(bytes[25]).toBe(6); // PNG truecolor with alpha, not the old opaque screenshot block
  expect(crop.transparent).toBe(true);
  const pixels=rgba(bytes);let transparent=0;
  for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)transparent++;
  expect(transparent).toBe(crop.transparentPixels);
  expect(crop.transparentPixels).toBeGreaterThan(2000);
  expect(crop.opaquePixels).toBeGreaterThan(1000);
  expect(crop.transparentPixels+crop.opaquePixels).toBe(96*94);
  expect([104,404]).toContain(crop.top);
  expect(crop.left).toBeGreaterThanOrEqual(53);
  const hash=createHash('sha256').update(bytes).digest('hex');
  expect(hash).toBe(crop.sha256);hashes.push(hash);
 }
 expect(new Set(hashes).size).toBe(14);
});
