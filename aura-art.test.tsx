import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {AuraArt,AURA_THEMES} from './aura-art';
import {ITEMS} from './economy';
const auras=ITEMS.filter(i=>i.slot==='aura');
it('maps every catalog aura to a distinct named theme without rendering effects for No Aura',()=>{
 expect(Object.keys(AURA_THEMES).sort()).toEqual(auras.map(i=>i.id).sort());
 expect(new Set(Object.values(AURA_THEMES).map(t=>t.motif)).size).toBe(auras.length);
 for(const item of auras){
  const html=renderToStaticMarkup(<AuraArt item={item}/>);
  if(item.id==='aura-none'){expect(html).toBe('');continue;}
  expect(html).toContain(`data-aura-motif="${AURA_THEMES[item.id]!.motif}"`);
  expect(html).toContain('aria-hidden="true"');expect(html).not.toContain('<button');expect(html).not.toContain('<image');
  expect(html).toMatch(/<(path|circle|ellipse)/);expect(AURA_THEMES[item.id]!.detail.length).toBeGreaterThan(25);
 }
});
it.each([
 ['aura-new-0','aura-flames'],['aura-new-1','aura-clouds'],['aura-new-5','aura-water'],
 ['aura-new-6','aura-petals'],['aura-new-7','aura-lightning'],['aura-new-9','aura-foliage'],
 ['aura-new-11','aura-pulses'],['aura-new-15','aura-comet'],['aura-new-17','aura-moon'],
 ['aura-void','aura-orbit'],['aura-new-2','aura-wisps'],['aura-new-19','aura-stars'],
])('%s has its literal effect, not just the generic glow', (id,feature)=>{
 const html=renderToStaticMarkup(<AuraArt item={auras.find(i=>i.id===id)!}/>);expect(html).toContain(feature);
});
it('keeps previews deterministic without random particles or shared SVG IDs',()=>{
 const html=renderToStaticMarkup(<>{auras.map(item=><AuraArt key={item.id} item={item}/>)}</>);
 expect(html).not.toContain('id=');expect(renderToStaticMarkup(<>{auras.map(item=><AuraArt key={item.id} item={item}/>)}</>)).toBe(html);
});
