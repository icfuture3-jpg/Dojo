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
export function EpicSkinPortrait({skin}:{skin:EpicSkin}) {
 return <svg role="img" aria-label={`${skin.name} skin`} viewBox="25 0 150 190" width="110" height="140"><path d="M63 105H137L149 185H51Z" fill={skin.color}/><circle cx="100" cy="70" r="33" fill="#d5a67c"/><EpicSkinArmor skin={skin}/></svg>;
}
