// @vitest-environment happy-dom
import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {act} from 'react';
import {createRoot} from 'react-dom/client';
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
import {FRIENDS} from './friends';
import {FriendsPanel} from './friends-panel';
import {FriendArt,friendImagePath} from './friend-art';
import {FRIEND_MESH,FRIEND_MESH_STYLES,FRIEND_MOTIONS,friendMotionPoint,triangleMatrix} from './friend-motion';
import {parseProfile} from './economy';

it('animates all fourteen gallery friends, including locked ones, without changing equipment',async()=>{
 const profile=parseProfile({diamondWins:3,companion:'carp'}),before=JSON.stringify(profile);
 const mount=document.createElement('main');document.body.append(mount);const root=createRoot(mount);
 await act(()=>root.render(<FriendsPanel p={profile} dispatch={()=>{throw new Error('Animation must not dispatch');}} onClose={()=>{}}/>));
 const el=document.body;
 expect(el.querySelectorAll('.friend-gallery [data-animated="true"]')).toHaveLength(14);
 for(const friend of FRIENDS){
  const art=el.querySelector(`[data-friend="${friend.id}"]`)!;
  expect(art.querySelectorAll('.friend-motion-patch')).toHaveLength(FRIEND_MESH.length);
  expect(art.querySelector('image')!.getAttribute('href')).toBe(friendImagePath(friend));
  expect(art.querySelectorAll('image')).toHaveLength(1); // reuse, not redrawn faces or new assets
 }
 expect(JSON.stringify(profile)).toBe(before);
 await act(()=>root.unmount());mount.remove();
});

it('keeps every mesh reference unique and local when a card and its showcase render together',()=>{
 const el=document.createElement('main');
 el.innerHTML=renderToStaticMarkup(<>{FRIENDS.map(friend=><div key={friend.id}><FriendArt friend={friend} animated/><FriendArt friend={friend} ability/></div>)}</>);
 const ids=[...el.querySelectorAll('[id]')].map(e=>e.id);
 expect(new Set(ids).size).toBe(ids.length);
 for(const art of el.querySelectorAll('svg')){
  expect(art.getAttribute('data-animated')).toBe('true');
  const localIds=new Set([...art.querySelectorAll('[id]')].map(e=>e.id));
  for(const use of art.querySelectorAll('use')){
   expect(localIds.has(use.getAttribute('href')!.slice(1))).toBe(true);
   const clip=use.getAttribute('clip-path');if(clip)expect(localIds.has(clip.slice(5,-1))).toBe(true);
  }
 }
});

it('gives every friend a distinct bending cycle rather than rigid translation or uniform scaling',()=>{
 const signatures:string[]=[];
 for(const friend of FRIENDS){
  const {duration}=FRIEND_MOTIONS[friend.id];expect(duration).toBeGreaterThan(1);
  signatures.push(JSON.stringify(FRIEND_MESH_STYLES[friend.id]));
  const offsets=FRIEND_MESH.flatMap(({points})=>points).map(p=>{
   const q=friendMotionPoint(friend.id,p,Math.PI/2);return [q[0]-p[0],q[1]-p[1]];
  });
  expect(offsets.some(([x,y])=>Math.hypot(x,y)>2)).toBe(true);
  expect(offsets.some(([x,y])=>Math.hypot(x,y)<.01)).toBe(true); // anchors, not floating the sprite
  expect(new Set(offsets.map(p=>p.map(n=>n.toFixed(2)).join(','))).size).toBeGreaterThan(10);
 }
 expect(new Set(signatures).size).toBe(14);
});

it('keeps the original image mesh joined and upright throughout every cycle',()=>{
 for(const friend of FRIENDS)for(let step=0;step<16;step++){
  const phase=step*Math.PI/8;
  for(const {points} of FRIEND_MESH){
   const target=points.map(p=>friendMotionPoint(friend.id,p,phase));
   const [a,b,c,d,e,f]=triangleMatrix(points,target);
   expect(a*d-b*c).toBeGreaterThan(.5); // no flipped, collapsed or severely stretched patches
   expect(a*d-b*c).toBeLessThan(1.5);
   points.forEach(([x,y],i)=>{
    expect(a*x+c*y+e).toBeCloseTo(target[i][0],8);
    expect(b*x+d*y+f).toBeCloseTo(target[i][1],8);
   });
  }
 }
});
