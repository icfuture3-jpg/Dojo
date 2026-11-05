import { expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ShopUpgrades, UpgradeArt } from './shop-upgrades';
import { buyUpgrade, parseProfile } from './economy';
it('renders original upgrade catalog values and custom art, with unaffordable purchases disabled',()=>{
 const html=renderToStaticMarkup(<ShopUpgrades p={parseProfile({coins:100})} dispatch={()=>{}}/>);
 expect(html).toContain('Coin Purse');expect(html).toContain("Scholar&#x27;s Scroll");expect(html).toContain('+10% coins per level');expect(html).toContain('+10% XP per level');
 expect(html.match(/disabled=""/g)).toHaveLength(2);expect(html).toContain('50 more coins needed');expect(html).toContain('150 coins');
 expect(html).toContain('Embroidered gold coin purse');expect(html).toContain('Jade scholar scroll');
});
it('uses purchased levels, next costs and max states without charging or changing rewards during rendering',()=>{
 const p=parseProfile({coins:1000,up:{coin:1,xp:3}});const before=JSON.stringify(p);
 const html=renderToStaticMarkup(<ShopUpgrades p={p} dispatch={()=>{}}/>);
 expect(html).toContain('Lv 1/3');expect(html).toContain('300 coins');expect(html).toContain('MAX UPGRADE');expect(html).not.toContain('disabled=""');expect(JSON.stringify(p)).toBe(before);
 const next=buyUpgrade(p,'coin')!;expect(next.coins).toBe(700);expect(next.up.coin).toBe(2);expect(next.xp).toBe(p.xp);
});
it('keeps vector gradient references unique between repeated illustrations',()=>{
 const html=renderToStaticMarkup(<><UpgradeArt kind="coin"/><UpgradeArt kind="coin"/><UpgradeArt kind="xp"/></>);
 const ids=[...html.matchAll(/id="([^"]+)"/g)].map(m=>m[1]);expect(new Set(ids).size).toBe(ids.length);
});
