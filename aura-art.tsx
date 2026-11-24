import type { CSSProperties } from 'react';
import type { Item } from './economy';
import './aura-art.css';

type Theme = { motif: string; detail: string };
export const AURA_THEMES: Record<string, Theme> = {
 'aura-none':{motif:'none',detail:'No aura — your fighter without any energy effect.'},
 'aura-ember':{motif:'embers',detail:'Glowing orange embers drift upward from a bed of coals.'},
 'aura-jade':{motif:'jade',detail:'Faceted jade crystals orbit a green spirit ring.'},
 'aura-storm':{motif:'storm',detail:'Dark storm clouds surround branching blue lightning.'},
 'aura-sakura':{motif:'sakura',detail:'Pale pink cherry blossoms and petals drift around you.'},
 'aura-void':{motif:'void',detail:'A dark central void bends violet orbital rings and stars.'},
 'aura-new-0':{motif:'inferno',detail:'Tall orange flames rise from a blazing fire with yellow-hot cores.'},
 'aura-new-1':{motif:'mist',detail:'Soft ocean fog curls in layered blue banks around your feet.'},
 'aura-new-2':{motif:'spirit',detail:'Jade-green spirit wisps spiral around a luminous crystal.'},
 'aura-new-3':{motif:'nebula',detail:'Violet nebula clouds cradle a field of distant stars.'},
 'aura-new-4':{motif:'flare',detail:'A golden solar disc erupts in long curling flare ribbons.'},
 'aura-new-5':{motif:'tide',detail:'Turquoise tidal waves roll around you with white foam crests.'},
 'aura-new-6':{motif:'petals',detail:'Deep rose petals tumble gently around your fighter.'},
 'aura-new-7':{motif:'steel',detail:'Metallic shards spiral through silver storm streaks.'},
 'aura-new-8':{motif:'dawn',detail:'A golden sun rises above a glowing horizon of dawn rays.'},
 'aura-new-9':{motif:'bamboo',detail:'Bamboo stalks sway as green leaves ride curling wind trails.'},
 'aura-new-10':{motif:'nova',detail:'A ruby-red stellar core radiates a jagged nova crown.'},
 'aura-new-11':{motif:'pulse',detail:'Sapphire-blue concentric energy pulses ripple outward.'},
 'aura-new-12':{motif:'ring',detail:'Emerald orbital rings circle bright green gemstones.'},
 'aura-new-13':{motif:'cloud',detail:'Soft amethyst-purple cloud banks billow around you.'},
 'aura-new-14':{motif:'sparks',detail:'Sharp amber sparks shoot out from a warm glowing core.'},
 'aura-new-15':{motif:'comet',detail:'A bright teal comet sweeps across a long luminous tail.'},
 'aura-new-16':{motif:'bloom',detail:'Cherry-pink five-petal flowers open among drifting petals.'},
 'aura-new-17':{motif:'moon',detail:'A silver crescent moon hangs in a quiet field of stars.'},
 'aura-new-18':{motif:'halo',detail:'A warm golden sun halo surrounds you with a radiant corona.'},
 'aura-new-19':{motif:'forest',detail:'Leafy forest branches frame floating woodland spirit lights.'},
};
const is = (motif: string, ...values: string[]) => values.includes(motif);
export function AuraArt({item}:{item:Item}) {
 const theme = AURA_THEMES[item.id];
 if (!theme || theme.motif === 'none') return null;
 const m = theme.motif;
 return <svg className={`named-aura named-aura-${m}`} data-aura-motif={m} aria-hidden="true" viewBox="0 0 320 360" style={{'--aura-color':item.color} as CSSProperties}>
  {m === 'inferno' && <g className="aura-flames">{[35,80,120,165,205,250,285].map((x,i)=><g key={x} style={{animationDelay:`${-i*.31}s`}}><path d={`M${x-25} 330Q${x-48} 285 ${x-12} ${185-i%3*40}Q${x-22} 245 ${x+12} ${120+i%3*25}Q${x+48} 230 ${x+22} 270Q${x+55} 305 ${x+25} 330Z`} fill={i%2?'#ff582b':'#ee321a'}/><path d={`M${x-12} 325Q${x-20} 290 ${x+10} 235Q${x+3} 285 ${x+20} 325Z`} fill="#ffd35a"/></g>)}</g>}
  {is(m,'mist','cloud','nebula') && <g className="aura-clouds" fill="currentColor" opacity={m==='nebula'?.4:.6}>{[0,1,2,3].map(i=><path key={i} transform={`translate(${i%2*20-10} ${i*62})`} d="M15 95Q-10 60 35 52Q45 25 80 45Q110 14 145 45Q180 15 207 45Q250 22 266 53Q325 54 305 95Z"/>)}</g>}
  {is(m,'petals','sakura','bloom') && <g className="aura-petals" fill="currentColor">{Array.from({length:14},(_,i)=><g key={i} className="aura-drifter" style={{animationDelay:`${-i*.5}s`}} transform={`translate(${20+i*73%285} ${30+i*47%295}) rotate(${i*47})`}>{m==='petals'?<path d="M0 0Q-17 -18 -9 -24Q8 -28 9 -9Z"/>:<g>{[0,1,2,3,4].map(j=><ellipse key={j} cx="0" cy="-9" rx="5" ry="9" transform={`rotate(${j*72})`}/>)}<circle r="3" fill="#ffe2a1"/></g>}</g>)}</g>}
  {is(m,'storm','steel') && <g><g fill={m==='storm'?'#344759':'#687d91'} stroke="currentColor" strokeWidth="2"><path d="M20 75Q0 35 45 32Q65 5 95 34Q145 20 140 75ZM195 60Q180 25 220 24Q250 0 275 30Q325 25 310 70Z"/></g><g className="aura-lightning" fill={m==='storm'?'#c1efff':'#e4edf5'}>{[20,245].map(x=><path key={x} transform={`translate(${x} 70)`} d="M30 0L0 80L25 70L5 145L65 50L35 60L65 0Z"/>)}</g>{m==='steel'&&Array.from({length:8},(_,i)=><path key={i} className="aura-orbit" fill="#dce7ec" stroke="#667887" d="M0 -15L7 0L0 18L-5 0Z" transform={`translate(${18+i*43%290} ${140+i*37%190}) rotate(${i*45})`}/>)}</g>}
  {is(m,'bamboo','forest') && <g stroke="currentColor" strokeWidth="5" fill="currentColor" className="aura-foliage">{[25,285].map(x=><g key={x}><path d={`M${x} 335Q${x-12} 190 ${x+5} 80`} fill="none"/>{[120,180,240,290].map((y,i)=><g key={y}><path d={`M${x-8} ${y}H${x+8}`} stroke="#d9ebad" strokeWidth="2"/><path d={`M${x} ${y}Q${x-55} ${y-50} ${x-40} ${y-5}Q${x-20} ${y+8} ${x} ${y}Q${x+60} ${y-60} ${x+45} ${y-10}Q${x+20} ${y+5} ${x} ${y}`} strokeWidth="1"/></g>)}</g>)}</g>}
  {m==='tide'&&<g className="aura-water" fill="currentColor" stroke="#cef9ff" strokeWidth="3">{[220,265,310].map(y=><path key={y} d={`M5 ${y}Q45 ${y-60} 85 ${y-20}T165 ${y-20}T245 ${y-20}Q290 ${y-60} 315 ${y}L315 ${y+25}Q260 ${y+5} 200 ${y+20}T5 ${y+25}Z`}/>)}</g>}
  {is(m,'jade','spirit','ring')&&<g fill="none" stroke="currentColor"><g className="aura-orbit" strokeWidth="4"><ellipse cx="160" cy="185" rx="140" ry={m==='ring'?60:145}/><ellipse cx="160" cy="185" rx="135" ry="58" transform="rotate(-55 160 185)"/></g>{[35,270].map((x,i)=><path key={x} fill="currentColor" stroke="#c7ffdd" d={`M${x} ${70+i*145}l14 24l-14 28l-14 -28Z`}/>)}</g>}
  {m==='spirit'&&<g className="aura-wisps" fill="currentColor">{[30,265].map(x=><path key={x} d={`M${x} 260Q${x-40} 205 ${x} 165Q${x+35} 120 ${x+10} 70Q${x+70} 135 ${x+20} 200Q${x} 225 ${x} 260Z`}/>)}</g>}
  {is(m,'flare','dawn','halo','nova')&&<g stroke="currentColor" fill="none"><circle className="aura-radiance" cx="160" cy={m==='dawn'?290:170} r={m==='nova'?115:125} strokeWidth={m==='halo'?12:7}/><g className="aura-rays" strokeWidth="4">{Array.from({length:16},(_,i)=><path key={i} d="M160 28L160 6M152 40Q125 7 146 -5" transform={`rotate(${i*22.5} 160 ${m==='dawn'?290:170})`}/>)}</g>{m==='dawn'&&<path d="M5 300H315M20 320H300M50 340H270" stroke="#ffe1a2" strokeWidth="3"/>}{m==='nova'&&<path d="M160 15L180 75L225 35L220 100L290 85L245 145L310 170L250 195L285 255L220 240L225 310L180 270L160 335L140 270L95 310L100 240L35 255L70 195L10 170L70 145L30 85L100 100L95 35L140 75Z" strokeWidth="3"/>}</g>}
  {m==='pulse'&&<g className="aura-pulses" stroke="currentColor" fill="none" strokeWidth="5">{[75,110,145].map((r,i)=><circle key={r} cx="160" cy="180" r={r} style={{animationDelay:`${-i}s`}}/>)}</g>}
  {is(m,'embers','sparks')&&<g fill="currentColor" className="aura-sparks">{Array.from({length:22},(_,i)=><path key={i} className="aura-drifter" style={{animationDelay:`${-i*.23}s`}} transform={`translate(${10+i*47%300} ${60+i*61%275}) rotate(${i*37})`} d={m==='sparks'?'M0 -13L3 -3L10 0L3 3L0 13L-3 3L-10 0L-3 -3Z':'M0 -7Q9 0 0 9Q-7 0 0 -7Z'}/>)}</g>}
  {m==='comet'&&<g className="aura-comet" fill="currentColor" stroke="#c2fcff" strokeWidth="2"><path d="M25 20L285 185L85 35L275 195L30 95L285 215Z" opacity=".55"/><circle cx="282" cy="200" r="20"/><circle cx="282" cy="200" r="8" fill="#eeffff"/></g>}
  {m==='moon'&&<path className="aura-moon" d="M255 30A72 72 0 1 0 295 150A65 65 0 0 1 255 30Z" fill="currentColor" stroke="#fff9e3" strokeWidth="2"/>}
  {m==='void'&&<g><ellipse cx="160" cy="175" rx="130" ry="150" fill="#070512"/><g className="aura-orbit" fill="none" stroke="currentColor" strokeWidth="6"><ellipse cx="160" cy="175" rx="150" ry="60" transform="rotate(-30 160 175)"/><ellipse cx="160" cy="175" rx="140" ry="70" transform="rotate(45 160 175)"/></g></g>}
  {is(m,'nebula','moon','forest','void')&&<g className="aura-stars" fill={m==='forest'?'#d5ff9b':'#f1e5ff'}>{Array.from({length:18},(_,i)=><circle key={i} cx={10+i*71%300} cy={20+i*53%310} r={i%3+1.5}/>)}</g>}
 </svg>;
}
