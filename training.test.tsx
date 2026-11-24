import { it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TrainingGame, boardZone, boardSpeed, boardPosition, boardHit } from './training';
it('offers interactive board breaking for the defeated player', () => {
 const html = renderToStaticMarkup(<TrainingGame strength={2} avatar={<div>Custom fighter</div>} onDone={()=>{}} />);
 expect(html).toContain('How to break boards');
 expect(html).toContain('START TRAINING — SPACE');
 expect(html).toContain('five attempts');
 expect(html).not.toContain('Every session earns strength and XP');
 expect(html).toContain('Hold-free controls: press once for each strike.');
 expect(html).toContain('0 boards broken');
 expect(html).toContain('Custom fighter');
 expect(html.match(/aria-label="Timing meter"/g)).toHaveLength(1);
 expect(html).toContain('data-speed="1.0"');
 expect(html).not.toContain('STRIKE — SPACE</button>');
});
it('shows the defeated rival training without granting player rewards', () => {
 const html = renderToStaticMarkup(<TrainingGame automatic fighterName="Mirage Mei" strength={2} avatar={<div>Rival</div>} onDone={()=>{}} />);
 expect(html).toContain('Mirage Mei');
 expect(html).not.toContain('STRIKE — SPACE');
 expect(html).not.toContain('START TRAINING — SPACE');
 expect(html).toContain('Watch');
});

it('uses a 30-percent gold zone with matching hit boundaries',()=>{
   expect(boardZone(0)).toEqual({start:35,end:65,width:30});
 for(const n of [35,50,65])expect(boardHit(n)).toBe(true);
 for(const n of [0,20,34.99,65.01,80,100])expect(boardHit(n)).toBe(false);
 const html=renderToStaticMarkup(<TrainingGame strength={0} avatar={<div/>} onDone={()=>{}}/>);
 expect(html).toContain('left:35%;width:30%');expect(html).not.toContain('wide gold zone');expect(html).toContain('After every chop');
});
it('shrinks the target and increases speed after every chop, with matching scoring boundaries',()=>{
 const widths=[30,26,22,18,14,10];
 for(let chops=0;chops<=5;chops++){
  const zone=boardZone(chops);expect(zone.width).toBe(widths[chops]);expect(zone.start+zone.end).toBe(100);
  expect(boardSpeed(chops)).toBeCloseTo(1+chops*.2);
  const centerTime=Math.PI*750/(2*boardSpeed(chops));expect(boardPosition(centerTime,chops)).toBeCloseTo(50);
  expect(boardHit(zone.start,chops)).toBe(true);expect(boardHit(zone.end,chops)).toBe(true);
  expect(boardHit(zone.start-.01,chops)).toBe(false);expect(boardHit(zone.end+.01,chops)).toBe(false);
  expect(boardPosition(0,chops)).toBe(0);
  if(chops<5){expect(boardZone(chops+1).width).toBeLessThan(zone.width);expect(boardSpeed(chops+1)).toBeGreaterThan(boardSpeed(chops));}
 }
expect(boardHit(36,0)).toBe(true);expect(boardHit(36,1)).toBe(false);
 expect(boardZone(99).width).toBe(10);expect(boardSpeed(99)).toBe(2);
});
 
