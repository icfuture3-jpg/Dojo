import { useId } from 'react';
import { GiDesign } from './gi-design';
import type { Item } from './economy';
import './catalog-art.css';
export function Coin({size=22}:{size?:number}) {
 const id=useId().replace(/:/g,'');
 return <svg className="drawn-coin" role="img" aria-label="coins" width={size} height={size} viewBox="0 0 40 40"><defs><linearGradient id={`${id}-coin`} x2=".8" y2="1"><stop stopColor="#fff4ad"/><stop offset=".45" stopColor="#e3b744"/><stop offset="1" stopColor="#a66a1e"/></linearGradient></defs><ellipse cx="21" cy="22" rx="16" ry="17" fill="#8e5919"/><circle cx="19" cy="19" r="16" fill={`url(#${id}-coin)`} stroke="#f8d878" strokeWidth="2"/><circle cx="19" cy="19" r="12" fill="none" stroke="#a67a28" strokeWidth="1.5"/><path d="M15 15h8v8h-8Z" fill="#6c4a20" stroke="#ffe59a"/><path d="M10 9l4-2m12 4l2 3M9 27l4 3" stroke="#fff0a7" strokeWidth="2" strokeLinecap="round"/></svg>;
}
export function OutfitArt({item}:{item:Item}) {
 const id=useId().replace(/:/g,'');
 return <svg className="outfit-illustration" role="img" aria-label={`${item.name} outfit illustration`} data-outfit-pattern={item.pattern??0} viewBox="0 0 200 220">
  <defs><radialGradient id={`${id}-back`}><stop stopColor="#5b4430"/><stop offset="1" stopColor="#211c1a"/></radialGradient><clipPath id={`${id}-gi`}><path d="M50 100H150V220H50Z"/></clipPath></defs>
  <rect x="3" y="3" width="194" height="214" rx="12" fill={`url(#${id}-back)`} stroke="#c9a45c" strokeWidth="3"/>
  <path d="M15 29V15H29M171 15H185V29M15 191V205H29M171 205H185V191" stroke="#edce83" strokeWidth="2" fill="none"/>
  <ellipse cx="100" cy="199" rx="67" ry="9" fill="#0005"/>
  <g transform="translate(0 -13)">
   <path d="M64 45L24 74L39 105L59 91V192H141V91L161 105L176 74L136 45L100 59Z" fill={item.color} stroke="#191c23" strokeWidth="5" strokeLinejoin="round"/>
   <g transform="translate(18 -11) scale(.82)"><g clipPath={`url(#${id}-gi)`}><rect x="50" y="100" width="100" height="120" fill={item.color}/><GiDesign item={item}/></g></g>
   <path d="M64 45L100 101L136 45M58 144H142" stroke="#f5dfaf" strokeWidth="8" fill="none"/><path d="M66 46L100 99L134 46" stroke="#71614c" strokeWidth="2" fill="none"/>
   <path d="M60 144H141V158H60Z" fill="#e9d8b3" stroke="#544331" strokeWidth="2"/><path d="M96 151L81 183L95 177L104 152L122 178L124 164L105 149Z" fill="#f2e1bc" stroke="#544331" strokeWidth="2"/>
   <path d="M43 76L52 87M157 76L148 87M66 171L69 184M132 171L130 184" stroke="#fff7" strokeWidth="3"/>
  </g>
 </svg>;
}
