import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { introShots, rescueShots, masterResultShots, withPlayerShots, DojoMovie, RescueMovie, CutScene, Fig, FocusFighter, focusPlacement, liftPlacement, masterBoardPose, MasterBoardBreak, entrancePose, VictoryLift } from './movie';
const me={name:'Jade <Hero>',avatar:<div data-saved-avatar="pink-hair">Saved custom fighter</div>,color:'#ff00aa',belt:'#fff',skin:'#a86b3c',hair:'#ff00aa',fem:true};
const lists=()=>[
 ...[0,1,2,3].map(introShots),
 ...[0,1,2,3,4,5,6,7].flatMap(k=>(['win','lose'] as const).map(kind=>masterResultShots(kind,k))),
 masterResultShots('champion',3),
 ...[0,1,2,3,4,5].flatMap(k=>(['intro','win','lose'] as const).map(kind=>rescueShots(kind,k))),
];
it('authors unique scene IDs, captions and visual compositions across every finite cutscene',()=>{
 const all=lists().flat();expect(all).toHaveLength(47);
 expect(new Set(all.map(s=>s.id)).size).toBe(all.length);expect(new Set(all.map(s=>s.caption)).size).toBe(all.length);
 const renders=all.map(s=>renderToStaticMarkup(s.draw('#c00','#fff',me)).replace(/data-story-action="[^"]*"/g,'').replace(/aria-label="[^"]*"/g,''));
 expect(new Set(renders).size).toBe(all.length);
 for(const s of all){expect(s.caption.trim().length).toBeGreaterThan(15);expect(s.duration??3000).toBeGreaterThanOrEqual(3000);}
});
it('never injects duplicated spotlight openings, celebration or closing scenes',()=>{
 for(const shots of lists())for(const label of ['INTRO','VICTORY','DEFEAT','CHAMPION','SAVED'])expect(withPlayerShots(shots,label)).toBe(shots);
 const all=lists().flat();expect(all.filter(s=>s.shoulderLift)).toHaveLength(1);
 for(const s of all){expect(s.caption).not.toContain('Your training has brought you here');expect(s.caption).not.toContain('A setback is not');expect(s.caption).not.toContain('Stand tall.');expect(s.caption).not.toContain('You kneel');}
});
it('gives each master a separate win and loss action, not renamed copies',()=>{
 const expected=['Practice stand rebuilt','Mirrors turn to sunrise','Scroll rolls closed','Mountain bell rings'];
 for(let k=0;k<4;k++){
  const win=masterResultShots('win',k)[0]!,lose=masterResultShots('lose',k)[0]!;
  const a=renderToStaticMarkup(win.draw('#c00','#fff',me)),b=renderToStaticMarkup(lose.draw('#c00','#fff',me));
  expect(a).toContain(expected[k]);expect(a).not.toBe(b);expect(win.playerAt).toBeTruthy();expect(lose.playerAt).toBeTruthy();
 }
});
it('each rescue location has its own prop, action and outcome',()=>{
 const words=[['Bamboo','Bamboo','Bamboo'],['Ferry','Ferry','Ferry'],['wheel','Wheel','counterweight'],['kite','crane','kite'],['conductor','Conductor','Copper fragment'],['disk','disk','disk']];
 for(let k=0;k<6;k++){
  const shots=(['intro','win','lose'] as const).map(kind=>rescueShots(kind,k)[0]!);
  expect(new Set(shots.map(s=>renderToStaticMarkup(s.draw('#c00','#fff',me)))).size).toBe(3);
  shots.forEach((shot,i)=>expect(renderToStaticMarkup(shot.draw('#c00','#fff',me)).toLowerCase()).toContain(words[k]![i]!.toLowerCase()));
 }
});
it('renders the saved avatar once in reliable HTML for intros and every new outcome sequence',()=>{
 const scenes=[...[0,1,2,3].map(dojo=><DojoMovie me={me} dojo={dojo} color="#c00" belt="#fff" onDone={()=>{}}/>),
 ...[0,1,2,3,4,5,6,7].flatMap(dojo=>(['win','lose'] as const).map(kind=><CutScene me={me} kind={kind} dojo={dojo} color="#c00" belt="#fff" onDone={()=>{}}/>)),
 <CutScene me={me} kind="champion" dojo={3} color="#c00" belt="#fff" onDone={()=>{}}/>,
 ...[0,1,2,3,4,5].flatMap(k=>(['intro','win','lose'] as const).map(kind=><RescueMovie me={me} kind={kind} k={k} color="#c00" belt="#fff" onDone={()=>{}}/>))];
 for(const scene of scenes){const html=renderToStaticMarkup(scene);expect(html.match(/data-saved-avatar="pink-hair"/g)).toHaveLength(1);expect(html).not.toContain('foreignObject');expect(html).not.toContain('aria-label="Player name"');expect(html).toContain('xMidYMid meet');}
});
it('keeps student hands and the single championship shoulder celebration free of extra arms',()=>{
 for(const anim of ['punch','block','kick','bow','sway'])for(const flip of [false,true]){const html=renderToStaticMarkup(<svg><Fig x={100} y={300} color="#fff" belt="#222" anim={anim} flip={flip}/></svg>);expect(html.match(/data-scene-hand="left"/g)).toHaveLength(1);expect(html.match(/data-scene-hand="right"/g)).toHaveLength(1);}
 const html=renderToStaticMarkup(<VictoryLift me={me} color="#c00"/>);expect(html).not.toContain('M275 238');expect(html).not.toContain('M365 238');
 const layer=renderToStaticMarkup(<FocusFighter me={me} entrance={false} shoulderLift paused reviewMs={null}/>);expect(layer).toContain('movie-shoulder-lift');expect(layer).not.toContain('foreignObject');
});
it('preserves saved avatar framing and entrance math',()=>{
 for(const [w,h] of [[1280,800],[844,390],[390,844]]){const p=focusPlacement(w!,h!);expect(p.y-300*p.scale).toBeGreaterThan(h!*.14);expect(p.y).toBeLessThan(h!*.86);const lift=liftPlacement(w!,h!);expect(lift.scale).toBe(.65*Math.min(w!/640,h!/360));}
 expect(entrancePose(0)).toEqual({x:-230,step:0,walking:true});expect(entrancePose(6000)).toEqual({x:0,step:0,walking:false});
});
it('keeps Bao board contact synchronized and unique within authored intro scenes',()=>{
 expect(masterBoardPose(1199).broken).toBe(false);const hit=masterBoardPose(1200);expect(hit.broken).toBe(true);expect(hit.handX).toBeCloseTo(282,0);expect(hit.handY).toBeCloseTo(208.37,0);expect(masterBoardPose(3000)).toEqual(masterBoardPose(0));
 const html=renderToStaticMarkup(<MasterBoardBreak color="#c00" belt="#ff0"/>);expect(html.match(/data-board-state="intact"/g)).toHaveLength(4);
 expect(lists().flat().filter(s=>renderToStaticMarkup(s.draw('#c00','#fff',me)).includes('data-master-board-break'))).toHaveLength(1);
});

import { cinematicOpponentIndex } from './movie';
it('routes Tower and Daily results by opponent identity instead of reusing Oku for every high floor',()=>{
 const names=['Brick Fist Bao','Mirage Mei','Master Ren','Grandmaster Oku','Fox Jun','Echo Kai','Storm Rin','Void Sage'];
 for(let i=0;i<names.length;i++){expect(cinematicOpponentIndex(names[i]!)).toBe(i);expect(masterResultShots('win',i)[0]!.id).toBe(`master-${i}-win`);expect(masterResultShots('lose',i)[0]!.id).toBe(`master-${i}-lose`);}
});
