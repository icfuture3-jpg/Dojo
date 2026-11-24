import {TREASURES} from './treasures';
import {TreasureArt} from './treasure-art';
export function TreasuresCollection({wins}:{wins:number}){
 return <section aria-label="Treasures collection"><h2>TREASURES · {TREASURES.filter(t=>wins>=t.wins).length}/{TREASURES.length}</h2>
 <p>Collect treasures through qualifying fight wins. {wins} wins recorded. No coins or diamonds required; display-only collectibles, not equipment or combat bonuses.</p>
 <p>Legendary treasures are folklore-inspired; historical entries are stylized illustrations of real artifact types, not claims of owning the originals.</p>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(230px,1fr))',gap:14,marginBottom:24}}>{TREASURES.map(t=>{
 const earned=wins>=t.wins;
 return <article key={t.id} style={{background:'#251e2c',border:`2px solid ${earned?'#dfc279':'#5b5160'}`,borderRadius:12,padding:16}}><TreasureArt treasure={t}/><h3>{t.name}</h3><p style={{fontSize:13,color:'#e3c88d'}}>{t.kind}</p><p>{t.description}</p><strong>{earned?'✓ COLLECTED':`LOCKED · ${t.wins-wins} more wins`}</strong><p>Earn at {t.wins} fight wins</p></article>;
 })}</div></section>;
}
