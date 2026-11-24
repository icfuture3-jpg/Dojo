import {useId} from "react";
import type {EpicSkin} from './epic-skins';

function Sigil({skin}:{skin:EpicSkin}) {
 const c=skin.accent;
 switch(skin.motif){
  case 'flame':return <path d="M100 117Q124 138 111 153Q103 164 91 154Q78 143 94 126L94 142Q105 136 100 117Z" fill={c}/>;
  case 'ice':return <path d="M100 119V160M82 129L118 150M82 150L118 129M94 123L100 129L106 123M94 156L100 150L106 156" fill="none" stroke={c} strokeWidth="4"/>;
  case 'bolt':return <path d="M104 116L83 143H99L94 163L119 134H103Z" fill={c}/>;
  case 'dragon':return <path d="M86 151Q120 166 117 138L106 127L116 121L100 118L85 134L100 132Q111 141 102 148L91 142Z" fill={c}/>;
  case 'phoenix':return <path d="M100 161L79 131L95 139L85 119L100 133L115 119L105 139L121 131Z" fill={c}/>;
  case 'void':return <><circle cx="100" cy="140" r="13" fill="#0d091c" stroke={c} strokeWidth="3"/><ellipse cx="100" cy="140" rx="25" ry="7" fill="none" stroke={c} strokeWidth="2" transform="rotate(-30 100 140)"/></>;
  case 'crown':return <path d="M100 116L105 132L122 132L109 143L114 160L100 150L86 160L91 143L78 132L95 132Z" fill={c}/>;
 }
}
/** Static vector armor follows the fighter's existing upper-body animation group. */
export function EpicSkinArmor({skin}:{skin:EpicSkin}) {
 return <g data-epic-skin={skin.id} aria-label={`${skin.name} armor`}>
  <path d="M65 113L82 105L100 113L118 105L135 113L127 162L100 169L73 162Z" fill={skin.color} stroke={skin.accent} strokeWidth="3"/>
  <Sigil skin={skin}/>
  <path d="M66 67Q100 56 134 67L128 95L100 103L72 95Z" fill={skin.color} stroke={skin.accent} strokeWidth="2"/>
  <path d="M77 75L91 78M109 78L123 75" stroke={skin.accent} strokeWidth="4" strokeLinecap="round"/>
  {skin.motif==='flame'?<path d="M69 57L75 27L87 43L100 18L113 43L125 27L131 57Z" fill={skin.color} stroke={skin.accent} strokeWidth="3"/>:
   skin.motif==='dragon'?<path d="M76 58L51 23L75 34L88 55M124 58L149 23L125 34L112 55" fill={skin.color} stroke={skin.accent} strokeWidth="4"/>:
   skin.motif==='ice'?<path d="M68 57L78 26L91 45L100 17L109 45L122 26L132 57Z" fill={skin.accent} stroke={skin.color} strokeWidth="3"/>:
   skin.motif==='bolt'?<path d="M70 56L82 32L97 43L112 16L108 43L130 56Z" fill={skin.accent} stroke={skin.color} strokeWidth="3"/>:
   skin.motif==='phoenix'?<path d="M70 55L47 26L78 37L100 20L122 37L153 26L130 55L100 45Z" fill={skin.accent} stroke={skin.color} strokeWidth="3"/>:
   skin.motif==='void'?<><circle cx="100" cy="35" r="23" fill="#0d091c" stroke={skin.accent} strokeWidth="4"/><path d="M75 58L70 33L90 49L100 36L110 49L130 33L125 58Z" fill={skin.color} stroke={skin.accent} strokeWidth="2"/></>:
   <path d="M64 57L60 29L77 41L81 19L94 36L100 8L106 36L119 19L123 41L140 29L136 57Z" fill={skin.accent} stroke={skin.color} strokeWidth="3"/>}
 </g>;
}
/** Compact shaded character bust, matching the legacy ninja/panda shop framing. */
export function EpicSkinPortrait({skin}:{skin:EpicSkin}) {
 const id=useId().replace(/:/g,'');
 const crown={
  flame:'M23 35Q19 22 28 13L34 24L41 8L49 23L58 5L65 25L76 14L78 36Z',
  ice:'M22 36L25 15L37 26L49 5L61 26L75 15L78 36Z',
  bolt:'M23 36L28 22L42 24L56 4L54 22L72 18L77 36Z',
  dragon:'M29 37Q11 25 14 10L33 25L40 35M71 37Q89 25 86 10L67 25L60 35',
  phoenix:'M25 38L8 17L30 24L40 12L50 25L60 12L70 24L92 17L75 38Z',
  void:'M25 36L22 16L38 25L50 12L62 25L78 16L75 36Z',
  crown:'M22 36L18 12L34 24L40 6L50 20L60 6L66 24L82 12L78 36Z',
 }[skin.motif];
 return <svg role="img" aria-label={`${skin.name} skin`} data-skin-portrait="character" viewBox="0 0 100 100" width="56" height="56">
  <defs>
   <linearGradient id={`${id}-armor`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={skin.accent}/><stop offset=".3" stopColor={skin.color}/><stop offset="1" stopColor="#101723"/></linearGradient>
   <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1"><stop stopColor="#fffce1"/><stop offset=".4" stopColor={skin.accent}/><stop offset="1" stopColor={skin.color}/></linearGradient>
   <radialGradient id={`${id}-face`} cx=".35" cy=".25" r=".8"><stop stopColor="#ffe2b8"/><stop offset="1" stopColor="#ba7850"/></radialGradient>
  </defs>
  <ellipse cx="50" cy="94" rx="36" ry="4" fill="#0005"/>
  {skin.motif==='void'&&<circle cx="50" cy="24" r="19" fill="#181226" stroke={skin.accent} strokeWidth="4"/>}
  <path data-portrait-part="shoulders" d="M13 92Q14 74 34 71H66Q86 74 87 92Z" fill={`url(#${id}-armor)`} stroke="#151823" strokeWidth="2"/>
  <path d="M32 74L49 89L38 94L24 80M68 74L51 89L62 94L76 80" fill={`url(#${id}-gold)`}/>
  <path data-portrait-part="hood" d="M22 48Q19 20 50 20Q81 20 78 48L75 64Q69 79 50 81Q31 79 25 64Z" fill={`url(#${id}-armor)`} stroke="#151823" strokeWidth="2.5"/>
  <path d="M31 41Q50 33 69 41L70 57Q50 70 30 57Z" fill={`url(#${id}-face)`}/>
  <path d="M29 41Q50 34 71 41" fill="none" stroke={skin.accent} strokeWidth="3"/>
  <g data-portrait-part="eyes">
   <ellipse cx="39" cy="50" rx="5.5" ry="6" fill="#fff9df"/><ellipse cx="61" cy="50" rx="5.5" ry="6" fill="#fff9df"/>
   <ellipse cx="40" cy="51" rx="3" ry="4.5" fill="#1b1925"/><ellipse cx="60" cy="51" rx="3" ry="4.5" fill="#1b1925"/>
   <circle cx="39" cy="49" r="1.3" fill="white"/><circle cx="59" cy="49" r="1.3" fill="white"/>
   <path d="M33 41L44 44M56 44L67 41" stroke="#252032" strokeWidth="3" strokeLinecap="round"/>
  </g>
  <path data-portrait-part="mask" d="M27 57Q50 66 73 57L69 71Q50 85 31 71Z" fill={`url(#${id}-armor)`} stroke="#151823" strokeWidth="2"/>
  <path d="M35 65Q50 72 65 65M39 71Q50 75 61 71" fill="none" stroke={skin.accent} strokeOpacity=".6" strokeWidth="1.5"/>
  <path data-portrait-part="crown" d={crown} fill={`url(#${id}-gold)`} stroke={skin.color} strokeWidth="2" strokeLinejoin="round"/>
  <path d="M27 34Q50 28 73 34L72 40Q50 35 28 40Z" fill={`url(#${id}-armor)`} stroke={skin.accent} strokeWidth="1.5"/>
  <path d="M50 28L55 34L50 40L45 34Z" fill={skin.accent} stroke="#fff6"/>
  <path d="M28 44Q25 54 31 61" fill="none" stroke="#fff" strokeOpacity=".25" strokeWidth="2" strokeLinecap="round"/>
 </svg>;
}
