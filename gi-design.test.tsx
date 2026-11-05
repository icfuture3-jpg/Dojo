import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { GiDesign, giTheme } from './gi-design';
import { OutfitArt } from './catalog-art';
import { Fighter } from './hud';
import { ITEMS, parseProfile, buyItem, equipItem } from './economy';
import { DEFAULT_LOOK } from './look';
it('Ocean is visibly waves and Jade is visibly marbled stone, not only a colored base',()=>{
 const ocean=ITEMS.find(i=>i.name==='Ocean Stripe Gi')!,jade=ITEMS.find(i=>i.name==='Jade Stripe Gi')!;
 expect(giTheme(ocean.name)).toBe('ocean');expect(giTheme(jade.name)).toBe('jade');
 const waves=renderToStaticMarkup(<GiDesign item={ocean}/>),stone=renderToStaticMarkup(<GiDesign item={jade}/>);
 expect(waves).toContain('data-gi-material="ocean-waves"');expect(stone).toContain('data-gi-material="jade-stone"');expect(waves).not.toBe(stone);
});
it('each named family maps to a recognizable material or motif',()=>{
 for(const[name,theme]of [['Bamboo Stripe Gi','bamboo'],['Steel Stripe Gi','metal'],['Rose Stripe Gi','flower'],['Sunlit Stripe Gi','sun'],['Pine Dragon Gi','forest'],['Ruby Wave Gi','gem'],['Storm Wave Gi','sky']] as const)expect(giTheme(name)).toBe(theme);
});
it('shop and attached character render exactly the same named design markup',()=>{
 for(const item of ITEMS.filter(i=>i.slot==='gi')){
  const design=renderToStaticMarkup(<GiDesign item={item}/>);
  const shop=renderToStaticMarkup(<OutfitArt item={item}/>);
  const fighter=renderToStaticMarkup(<Fighter gi={item} look={DEFAULT_LOOK} color={item.color} belt="#fff" move={null} state="idle"/>);
  expect(shop).toContain(design);expect(fighter).toContain(design);
 }
});
it('custom-colored creator outfit still shows its own selected pattern when no shop gi is used',()=>{
 const html=renderToStaticMarkup(<Fighter look={{...DEFAULT_LOOK,outfit:17,pattern:32}} color="#2471a3" belt="#fff" move={null} state="idle"/>);
 expect(html).not.toContain('data-gi-theme=');expect(html).toContain('fighter-art');
});
it('design rendering never changes owned gi IDs, balances or equipment choice',()=>{
 const p=parseProfile({saveVersion:4,coins:1000});const jade=ITEMS.find(i=>i.name==='Jade Stripe Gi')!;
 const bought=buyItem(p,jade.id)!;const saved=parseProfile(JSON.parse(JSON.stringify(bought)));
 renderToStaticMarkup(<GiDesign item={jade}/>);expect(saved.equip.gi).toBe(jade.id);expect(saved.coins).toBe(p.coins-jade.coins);expect(equipItem(saved,jade.id)!.equip.gi).toBe(jade.id);expect(saved.look.outfit).toBe(-1);
});
