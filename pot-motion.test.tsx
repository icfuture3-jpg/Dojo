import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {potMotion,CONTACT} from './pot-motion';
import {Fighter} from './hud';
import {DEFAULT_LOOK} from './look';
function rotate(x:number,y:number,cx:number,cy:number,angle:number){const a=angle*Math.PI/180;return [cx+(x-cx)*Math.cos(a)-(y-cy)*Math.sin(a),cy+(x-cx)*Math.sin(a)+(y-cy)*Math.cos(a)];}
it('whole-body flying kick leaves the starting position and the attached foot reaches the clay pot',()=>{
 const p=potMotion('jump',CONTACT.jump);expect(p.x).toBe(228);expect(p.y).toBeCloseTo(-100);expect(p.rightLeg).toBe(-90);expect(p.leftLeg).toBe(65);expect(p.torso).toBe(-20);
 const leg=rotate(123,286,123,210,p.rightLeg);const body=rotate(leg[0]!,leg[1]!,100,180,p.torso);
 const x=90+.55*body[0]!+p.x,y=155+.55*body[1]!+p.y;
 expect(x).toBeGreaterThan(402);expect(x).toBeLessThan(458);expect(y).toBeGreaterThan(125);expect(y).toBeLessThan(185);
 expect(potMotion('jump',.25).x).toBeGreaterThan(0);expect(potMotion('jump',1).x).toBe(0);expect(potMotion('jump',1).torso).toBeCloseTo(0);
});
it('walk-up chop uses the original hand and reaches the lower pot at impact',()=>{
 const p=potMotion('chop',CONTACT.chop),hand=rotate(153,182,153,112,p.rightArm);
 expect(p.x).toBe(218);expect(p.torso).toBeCloseTo(0);expect(90+.55*hand[0]!+p.x).toBeGreaterThan(409);expect(90+.55*hand[0]!+p.x).toBeLessThan(458);expect(155+.55*hand[1]!).toBeGreaterThan(185);expect(155+.55*hand[1]!).toBeLessThan(245);
 expect(potMotion('chop',.1).leftLeg).not.toBe(potMotion('chop',.2).leftLeg);
});
it('stone releases next to the actual attached hand and visibly travels to the pot',()=>{
 const release=potMotion('throw',.44),hand=rotate(153,182,153,112,release.rightArm);
 expect(release.rockVisible).toBe(true);expect(Math.abs(release.rockX-(90+release.x+.55*hand[0]!))).toBeLessThan(5);expect(Math.abs(release.rockY-(155+.55*hand[1]!))).toBeLessThan(5);
 const impact=potMotion('throw',CONTACT.throw);expect(impact.rockX).toBe(430);expect(impact.rockY).toBeCloseTo(150);expect(potMotion('throw',.2).rockVisible).toBe(false);
});
it('fighter keeps saved appearance and unique paint resources for multiple copies; no extra limb is inserted',()=>{
 const fighter=<Fighter color="#245a99" belt="#fff" look={{...DEFAULT_LOOK,hairColor:19,skin:5}} move={null} state="idle"/>;
 const html=renderToStaticMarkup(<>{fighter}{fighter}</>);const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);expect(ids.length).toBeGreaterThan(0);expect(new Set(ids).size).toBe(ids.length);expect(html).toContain('#f59ac0');expect(html).toContain('#a86b3c');expect(html.match(/class="fighter-right-leg"/g)).toHaveLength(2);
});

it('steps toward the tree for the throw, walks for the chop, and returns home after every action',()=>{
 for(const mode of ['throw','jump','chop'] as const){
  expect(potMotion(mode,0).x).toBe(0);
  expect(potMotion(mode,.2).x).toBeGreaterThan(0);
  expect(potMotion(mode,1).x).toBe(0);
  expect(potMotion(mode,1).y).toBeCloseTo(0);
 }
 expect(potMotion('throw',.1).leftLeg).not.toBe(potMotion('throw',.2).leftLeg);
 expect(potMotion('throw',.44).x).toBe(80);
});
