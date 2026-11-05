import {expect,it} from 'vitest';
import {renderToStaticMarkup} from 'react-dom/server';
import {CinematicDojo,EnergyRibbons,ThreeHandsCrest} from './cinematic-art';
it('renders original vector scenery with unique lighting IDs',()=>{
 const html=renderToStaticMarkup(<><CinematicDojo/><CinematicDojo/></>);
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);expect(new Set(ids).size).toBe(ids.length);expect(html).toContain('aria-hidden="true"');expect(html).not.toContain('<image');
});
it('decorative energy reflects the selected hand without adding input controls',()=>{
 for(const move of ['rock','paper','scissors'] as const){const html=renderToStaticMarkup(<EnergyRibbons move={move} active/>);expect(html).toContain(`data-hand="${move}"`);expect(html).toContain('energized');expect(html).toContain('aria-hidden="true"');expect(html).not.toContain('button');}
});
it('retains the Three Hands identity in a readable crest label',()=>{expect(renderToStaticMarkup(<ThreeHandsCrest/>)).toContain('Three Hands: stone, flowing paper and crossed blades');});
