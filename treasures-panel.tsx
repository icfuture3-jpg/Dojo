import './treasure-art.css';
import {TREASURES} from './treasures';
import {TreasureArt} from './treasure-art';
export function TreasuresCollection({wins}:{wins:number}){
 return <section aria-label="Treasures collection"><h2>TREASURES · {TREASURES.filter(t=>wins>=t.wins).length}/{TREASURES.length}</h2>
 <p>Collect treasures through qualifying fight wins. {wins} wins recorded. No coins or diamonds required; display-only collectibles, not equipment or combat bonuses.</p>
 <p>Legendary treasures are folklore-inspired; historical entries are stylized illustrations of real artifact types, not claims of owning the originals.</p>
 <div className="treasury-collection">{TREASURES.map(t=>{
 const earned=wins>=t.wins;
 return <article key={t.id} className="treasury-row" style={{borderColor:earned?'#c4aa64':'#756447'}}>
 <div className="upgrade-description"><h3>{t.name}</h3><p style={{color:'#dfc68c',marginBottom:6}}>{t.kind}</p><p>{t.description}</p></div>
 <TreasureArt treasure={t}/>
 <div className="treasury-progress"><strong>{earned?'✓ COLLECTED':`LOCKED · ${t.wins-wins} more wins`}</strong><p>Earn at {t.wins} fight wins</p></div>
 </article>;
 })}</div></section>;
}
