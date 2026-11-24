import {inflateSync} from 'node:zlib';
import {expect,it} from 'vitest';
import {readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {FRIENDS} from './friends';
function rgba(bytes:Buffer){
 const width=bytes.readUInt32BE(16),height=bytes.readUInt32BE(20);
 const chunks:Buffer[]=[];
 for(let offset=8;offset<bytes.length;){const length=bytes.readUInt32BE(offset);if(bytes.toString('ascii',offset+4,offset+8)==='IDAT')chunks.push(bytes.subarray(offset+8,offset+8+length));offset+=length+12;}
 const raw=inflateSync(Buffer.concat(chunks)),stride=width*4,out=Buffer.alloc(stride*height);
 const paeth=(a:number,b:number,c:number)=>{const p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c;};
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){
  const n=y*stride+x,a=x>=4?out[n-4]:0,b=y?out[n-stride]:0,c=y&&x>=4?out[n-stride-4]:0;
  out[n]=(raw[y*(stride+1)+1+x]+[0,a,b,Math.floor((a+b)/2),paeth(a,b,c)][filter])&255;
 }}return out;
}
it('ships all fourteen actual screenshot crops with transparent backgrounds and tighter bounds excluding screenshot borders/captions',()=>{
 const manifest=JSON.parse(readFileSync('friend-image-manifest.json','utf8'));
 expect(manifest.images.map((i:{id:string})=>i.id)).toEqual(FRIENDS.map(f=>f.id));
 const hashes:string[]=[];
 for(const crop of manifest.images){
  const bytes=readFileSync(`assets/friends/${crop.id}.png`);
  expect(bytes.subarray(0,8).toString('hex')).toBe('89504e470d0a1a0a');
  const width=crop.outputWidth??crop.width,height=crop.outputHeight??crop.height;
  expect(bytes.readUInt32BE(16)).toBe(width);expect(bytes.readUInt32BE(20)).toBe(height);
  expect(bytes[25]).toBe(6); // PNG truecolor with alpha, not the old opaque screenshot block
  expect(crop.transparent).toBe(true);
  const pixels=rgba(bytes);let transparent=0;
  for(let i=3;i<pixels.length;i+=4)if(pixels[i]===0)transparent++;
  expect(transparent).toBe(crop.transparentPixels);
  expect(crop.transparentPixels).toBeGreaterThan(2000);
  expect(crop.opaquePixels).toBeGreaterThan(1000);
  expect(crop.transparentPixels+crop.opaquePixels).toBe(width*height);
  expect([102,104,120,404]).toContain(crop.top);
  expect(crop.left).toBeGreaterThanOrEqual(53);
  const hash=createHash('sha256').update(bytes).digest('hex');
  expect(hash).toBe(crop.sha256);hashes.push(hash);
 }
 expect(new Set(hashes).size).toBe(14);
});


it('excludes captured HUD words above Suanni, Xiezhi and Qilin and gives the fox wider uncropped tails',()=>{
 const manifest=JSON.parse(readFileSync('friend-image-manifest.json','utf8'));
 for(const id of ['suanni','xiezhi','qilin','fox']){
  const crop=manifest.images.find((row:{id:string})=>row.id===id);
  expect(crop.padding).toBe(12);
  if(id==='fox'){expect(crop.left).toBe(674);expect(crop.width).toBe(108);}
  else expect(crop.top).toBeGreaterThanOrEqual(120); // below the screenshot status overlay
  const bytes=readFileSync(`assets/friends/${id}.png`),w=bytes.readUInt32BE(16),h=bytes.readUInt32BE(20),pixels=rgba(bytes);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(x<12||y<12||x>=w-12||y>=h-12)expect(pixels[(y*w+x)*4+3]).toBe(0);
 }
});
