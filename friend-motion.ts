import type {CSSProperties} from 'react';
import type {Friend} from './friends';

type Handle={x:number;y:number;radius:number;dx:number;dy:number;phase:number};
type Motion={duration:number;handles:readonly Handle[]};
// Soft joints deform the original PNG instead of translating a rigid picture.
// Coordinates use the artwork's 120×120 SVG space. Grounded feet stay near y=100.
const joint=(x:number,y:number,radius:number,dx:number,dy:number,phase=0):Handle=>({x,y,radius,dx,dy,phase});
export const FRIEND_MOTIONS:Record<Friend['id'],Motion>={
 carp:{duration:1.8,handles:[joint(23,70,48,4,5),joint(60,60,45,0,-2,1),joint(97,73,38,-3,5,Math.PI)]},
 bixi:{duration:3.6,handles:[joint(45,48,37,2,-3),joint(60,77,38,0,1.5,1),joint(30,97,24,-2,-2),joint(87,97,24,2,-2,Math.PI)]},
 suanni:{duration:2.8,handles:[joint(55,39,42,3,-2),joint(25,55,25,-2,2,1),joint(91,57,30,3,-2,2),joint(35,96,23,1,-3),joint(82,96,23,-1,-3,Math.PI)]},
 xiezhi:{duration:3.2,handles:[joint(55,31,40,-3,2),joint(93,68,28,3,-2,1),joint(35,96,26,2,-3),joint(81,96,26,-2,-3,Math.PI)]},
 qilin:{duration:2.4,handles:[joint(51,35,39,2,-3,1),joint(96,64,28,3,3),joint(35,96,26,-3,-4),joint(80,96,26,3,-4,Math.PI)]},
 fox:{duration:2.7,handles:[joint(24,51,30,-4,-3),joint(94,48,33,4,-4,1.5),joint(62,35,26,2,-1,2),joint(60,91,26,0,1)]},
 fenghuang:{duration:2.1,handles:[joint(24,53,37,-3,-7),joint(96,53,37,3,-7),joint(60,91,35,5,2,1.5),joint(60,29,26,1,-2,Math.PI)]},
 yazi:{duration:2.6,handles:[joint(52,42,39,-3,2),joint(99,70,26,3,-4,1.5),joint(34,96,24,2,-3),joint(82,96,24,-2,-3,Math.PI)]},
 taotie:{duration:3.1,handles:[joint(25,48,29,-3,-4),joint(95,48,29,3,4),joint(60,42,29,2,-2,1),joint(60,82,33,0,2,2)]},
 'black-dragon':{duration:3.4,handles:[joint(45,30,34,3,-2),joint(82,52,35,-4,1,1.5),joint(41,77,34,4,-2,3),joint(83,95,28,-4,1,4.5)]},
 'yellow-dragon':{duration:3,handles:[joint(27,40,32,-4,2),joint(88,40,32,4,-2),joint(60,65,36,2,-2,1.5),joint(75,96,30,-4,1,3)]},
 'pearl-dragon':{duration:3.7,handles:[joint(46,28,32,3,1),joint(80,49,34,-4,-2,1.5),joint(39,74,33,4,2,3),joint(77,96,30,-4,-1,4.5)]},
 'azure-dragon':{duration:2.5,handles:[joint(42,29,34,-3,-2),joint(79,51,34,4,2,1.5),joint(41,76,34,-4,-2,3),joint(84,97,28,4,1,4.5)]},
 zhulong:{duration:4,handles:[joint(53,28,30,2,-1),joint(79,51,32,-4,2,1.5),joint(39,75,32,4,-2,3),joint(79,97,29,-4,1,4.5)]},
};
export type Point=readonly [number,number];
export function friendMotionPoint(id:Friend['id'],[x,y]:Point,phase:number):Point{
 let px=x,py=y;
 for(const h of FRIEND_MOTIONS[id].handles){
  const distance=Math.hypot(x-h.x,y-h.y)/h.radius;
  if(distance>=1)continue;
  const weight=(1-distance*distance)**2*Math.sin(phase+h.phase);
  px+=h.dx*weight;py+=h.dy*weight;
 }
 return [px,py];
}
// Derive each patch transform from shared vertices. The subpixel overlap below
// covers raster seams as neighboring patches bend, without adding body parts.
export function triangleMatrix(source:readonly Point[],target:readonly Point[]):number[]{
 const [[x0,y0],[x1,y1],[x2,y2]]=source,[[u0,v0],[u1,v1],[u2,v2]]=target;
 const det=(x1-x0)*(y2-y0)-(x2-x0)*(y1-y0);
 const a=((u1-u0)*(y2-y0)-(u2-u0)*(y1-y0))/det;
 const c=((x1-x0)*(u2-u0)-(x2-x0)*(u1-u0))/det;
 const b=((v1-v0)*(y2-y0)-(v2-v0)*(y1-y0))/det;
 const d=((x1-x0)*(v2-v0)-(x2-x0)*(v1-v0))/det;
 return [a,b,c,d,u0-a*x0-c*y0,v0-b*x0-d*y0];
}
const triangles:Point[][]=[];
for(let y=0;y<120;y+=20)for(let x=0;x<120;x+=20){
 triangles.push([[x,y],[x+20,y],[x,y+20]],[[x+20,y],[x+20,y+20],[x,y+20]]);
}
export const FRIEND_MESH=triangles.map(points=>{
 const cx=points.reduce((s,p)=>s+p[0],0)/3,cy=points.reduce((s,p)=>s+p[1],0)/3;
 // A subpixel overlap covers SVG antialiasing seams without changing the asset.
 return {points,clip:points.map(([x,y])=>`${cx+(x-cx)*1.012},${cy+(y-cy)*1.012}`).join(' ')};
});
// Cache the four poses once; no per-frame JS, timers, state updates or new assets.
export const FRIEND_MESH_STYLES=Object.fromEntries(Object.keys(FRIEND_MOTIONS).map(key=>{
 const id=key as Friend['id'];
 return [id,FRIEND_MESH.map(({points})=>Object.fromEntries([0,1,2,3].map(pose=>[
  `--friend-pose-${pose}`,`matrix(${triangleMatrix(points,points.map(p=>friendMotionPoint(id,p,pose*Math.PI/2))).join(',')})`,
 ])) as CSSProperties)];
})) as Record<Friend['id'],CSSProperties[]>;
