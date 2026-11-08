import {expect,it} from 'vitest';import {renderToStaticMarkup} from 'react-dom/server';
import {ITEMS,TROPHIES,NEW_COSMETICS,parseProfile,buyItem} from './economy';import {HAIR_NAMES,HAIR_COLORS,HAIR_COLOR_NAMES,OUTFIT_COLORS,OUTFIT_COLOR_NAMES,PATTERN_NAMES} from './look';import {HairBack,HairFront,Pattern} from './lookart';import {OutfitArt,Coin} from './catalog-art';import {MenuRow,ShopPanel} from './meta';
it('catalog names, colors and full hairstyle silhouettes have no duplicates',()=>{
 for(const a of [HAIR_NAMES,HAIR_COLOR_NAMES,HAIR_COLORS,OUTFIT_COLORS,OUTFIT_COLOR_NAMES,PATTERN_NAMES])expect(new Set(a.map(x=>x.toLowerCase())).size).toBe(a.length);
 expect(HAIR_COLOR_NAMES.length).toBe(HAIR_COLORS.length);
 const hair=HAIR_NAMES.map((_,i)=>renderToStaticMarkup(<svg><HairBack i={i} c="#123456"/><HairFront i={i} c="#123456"/></svg>));expect(new Set(hair).size).toBe(hair.length);
 const outfits=ITEMS.filter(i=>i.slot==='gi');expect(new Set(outfits.map(i=>i.name.toLowerCase())).size).toBe(outfits.length);expect(new Set(outfits.map(i=>i.color.toLowerCase())).size).toBe(outfits.length);
 const patterns=PATTERN_NAMES.map((_,i)=>renderToStaticMarkup(<svg><Pattern i={i}/></svg>));expect(new Set(patterns).size).toBe(patterns.length);
});
it('shop outfit artwork uses exactly the equipped pattern rather than a generic icon',()=>{
 for(const item of ITEMS.filter(i=>i.slot==='gi')){
  const html=renderToStaticMarkup(<OutfitArt item={item}/>);expect(html).toContain(`data-outfit-pattern="${item.pattern??0}"`);expect(html).toContain(item.color);expect(html).toContain('outfit illustration');
  const expected=renderToStaticMarkup(<Pattern i={item.pattern??0}/>);if(expected)expect(html).toContain(expected);
 }
 for(const [suffix,pattern]of [['Stripe',1],['Wave',7],['Flame',6],['Star',8],['Dragon',32]]as const)for(const item of NEW_COSMETICS.filter(i=>i.slot==='gi'&&i.name.includes(` ${suffix} Gi`)))expect(item.pattern).toBe(pattern);
});
it('Missions is removed from navigation, leaving actual working menus intact',()=>{
 const html=renderToStaticMarkup(<MenuRow onOpen={()=>{}}/>);expect(html).not.toContain('MISSIONS');for(const title of ['CREATE','SHOP','TROPHIES','RANKS'])expect(html).toContain(title);
});
it('coins are drawn SVG disks not platform emoji and repeated resources are unique',()=>{
 const html=renderToStaticMarkup(<><Coin/><Coin/></>);expect(html).toContain('aria-label="coins"');expect(html).toContain('<circle');expect(html).not.toContain('🪙');const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);expect(new Set(ids).size).toBe(ids.length);
});
it('keeps basic prices and applies premium Dragon prices without losing ownership',()=>{
 expect(NEW_COSMETICS.filter(i=>i.slot==='gi')).toHaveLength(50);for(let i=0;i<50;i++){const item=ITEMS.find(it=>it.id===`gi-new-${i}`)!;expect(item.coins).toBe(i>=40?900+(i-40)*100:100+i*12);const p=parseProfile({saveVersion:4,coins:10000,rp:900,trophies:TROPHIES.map(t=>t.id)});const next=buyItem(p,item.id)!;expect(next.owned).toContain(item.id);expect(next.coins).toBe(p.coins-item.coins);expect(next.equip.gi).toBe(item.id);}
});
