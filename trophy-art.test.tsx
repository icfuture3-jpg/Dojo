import { it, expect } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { TROPHIES } from './economy';
import { TrophyArt, TROPHY_ART_IDS } from './trophy-art';
it('provides distinct name-specific art for every trophy',()=>{
 expect([...TROPHY_ART_IDS].sort()).toEqual(TROPHIES.map(t=>t.id).sort());
 const art=TROPHIES.map(t=>renderToStaticMarkup(<TrophyArt name={t.name} id={t.id}/>));
 for(let i=0;i<art.length;i++) expect(art[i]).toContain(`${TROPHIES[i]!.name} trophy`);
 const shapes=art.map(x=>x.slice(x.indexOf('<ellipse')));
 expect(new Set(shapes).size).toBe(TROPHIES.length);
});
