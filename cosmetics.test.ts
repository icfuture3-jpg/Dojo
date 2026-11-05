import { expect,it } from 'vitest';
import { NEW_COSMETICS, FINISHER_NAMES, buyItem, equipItem, parseProfile } from './economy';
import { FINISHER_MOTIONS } from './finishers';
it('adds the requested new cosmetics with unique ids',()=>{
 for(const [slot,count] of [['gi',50],['band',15],['aura',20],['finisher',12]] as const) expect(NEW_COSMETICS.filter(i=>i.slot===slot)).toHaveLength(count);
 expect(new Set(NEW_COSMETICS.map(i=>i.id)).size).toBe(97);
 expect(new Set(FINISHER_MOTIONS).size).toBe(12);
 expect(FINISHER_NAMES).toHaveLength(12);
});
it('preserves existing skins and saves purchased finishers',()=>{
 const p=parseProfile({coins:5000,owned:['skin-oni'],equip:{skin:'skin-oni'}});
 const next=buyItem(p,'finisher-2')!;
 expect(next.equip.finisher).toBe('finisher-2');
 expect(next.equip.skin).toBe('skin-oni');
 expect(parseProfile(JSON.parse(JSON.stringify(next))).equip.finisher).toBe('finisher-2');
 expect(buyItem(next,'finisher-2')).toBeNull();
 expect(equipItem(p,'finisher-2')).toBeNull();
});
it('equipping a shop gi selects its visible color and pattern',()=>{
 const p=parseProfile({coins:5000,look:{outfit:4}});
 const next=buyItem(p,'gi-new-21')!;
 expect(next.look.outfit).toBe(-1);
 expect(next.equip.gi).toBe('gi-new-21');
});
