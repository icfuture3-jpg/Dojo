import { it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TrainingGame, BOARD_ZONE, boardSpeed, boardPosition, boardHit } from './training';
it('offers interactive board breaking for the defeated player', () => {
 const html = renderToStaticMarkup(<TrainingGame strength={2} avatar={<div>Custom fighter</div>} onDone={()=>{}} />);
 expect(html).toContain('How to break boards');
 expect(html).toContain('START TRAINING — SPACE');
 expect(html).toContain('five attempts');
 expect(html).toContain('0 boards broken');
 expect(html).toContain('Custom fighter');
});
it('shows the defeated rival training without granting player rewards', () => {
 const html = renderToStaticMarkup(<TrainingGame automatic fighterName="Mirage Mei" strength={2} avatar={<div>Rival</div>} onDone={()=>{}} />);
 expect(html).toContain('Mirage Mei');
 expect(html).not.toContain('>STRIKE<');
 expect(html).toContain('Watch');
});

it('uses a 30-percent gold zone with matching hit boundaries',()=>{
 expect(BOARD_ZONE).toEqual({start:35,end:65});
 for(const n of [35,50,65])expect(boardHit(n)).toBe(true);
 for(const n of [0,20,34.99,65.01,80,100])expect(boardHit(n)).toBe(false);
 const html=renderToStaticMarkup(<TrainingGame strength={0} avatar={<div/>} onDone={()=>{}}/>);
 expect(html).toContain('left:35%;width:30%');expect(html).not.toContain('wide gold zone');expect(html).toContain('speeds up after each board');
});
it('each successful break speeds up the marker by 20 percent; attempts and misses do not affect speed',()=>{
 for(let hits=0;hits<=5;hits++){
  expect(boardSpeed(hits)).toBeCloseTo(1+hits*.2);
  const centerTime=Math.PI*750/(2*boardSpeed(hits));
  expect(boardPosition(centerTime,hits)).toBeCloseTo(50);expect(boardHit(boardPosition(centerTime,hits))).toBe(true);
  expect(boardPosition(0,hits)).toBe(0);
  if(hits<5)expect(boardSpeed(hits+1)).toBeGreaterThan(boardSpeed(hits));
 }
 expect(boardSpeed(0)).toBe(1);expect(boardSpeed(4)).toBe(1.8);
});
