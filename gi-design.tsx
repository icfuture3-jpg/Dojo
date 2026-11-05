import { Pattern } from './lookart';
import type { Item } from './economy';

export type GiTheme = 'ocean'|'jade'|'gem'|'flower'|'bamboo'|'forest'|'metal'|'sun'|'sky'|'fruit'|'flame'|'fabric';
/** Name themes are independent of the existing Stripe/Wave/Flame/Star/Dragon technique pattern. */
export function giTheme(name: string): GiTheme {
 if(/ocean|lagoon|harbor|seafoam|teal|turquoise/i.test(name))return 'ocean';
 if(/jade/i.test(name))return 'jade';
 if(/ruby|emerald|amethyst|antique gold|bronze|steel|graphite|slate|silver/i.test(name))return /ruby|emerald|amethyst/.test(name.toLowerCase())?'gem':'metal';
 if(/rose|violet|peony|lilac|plum|blush|mulberry/i.test(name))return 'flower';
 if(/bamboo/i.test(name))return 'bamboo';
 if(/fern|juniper|moss|meadow|pine|cedar|forest|sage/i.test(name))return 'forest';
 if(/sunlit|honey|champagne|golden|amber|marigold|ochre|gold/i.test(name))return 'sun';
 if(/storm|sky|frost|midnight/i.test(name))return 'sky';
 if(/berry|coral|mint|apricot|wine|burgundy|aubergine/i.test(name))return 'fruit';
 if(/crimson|sunset/i.test(name))return 'flame';
 return 'fabric';
}
function ThemeArt({theme}:{theme:GiTheme}) {
 switch(theme){
 case 'ocean':return <g data-gi-material="ocean-waves" fill="#7bd4e5" stroke="#c8f4f1" strokeWidth="2">{[128,163,200].map((y,n)=><path key={y} d={`M50 ${y}q14-30 34-20q-17 0-13 15q13 8 23-3q24-29 56-8v22H50Z`} opacity={.55+n*.13}/>)}</g>;
 case 'jade':return <g data-gi-material="jade-stone"><path d="M50 100H150V220H50Z" fill="#357963" opacity=".3"/><path d="M50 121Q77 101 100 137T150 135M50 173Q88 146 105 181T150 180M59 220Q78 185 126 208" stroke="#a8e6bd" strokeWidth="10" opacity=".55" fill="none"/><path d="M55 105l28 31l-9 29l40 31l-6 24M137 100l-18 26l20 37l-21 21" stroke="#e0f5d0" strokeWidth="2" opacity=".8" fill="none"/><path d="M50 155l27 7l10-12m29 47l23-6l11 7" stroke="#163f35" strokeWidth="3" fill="none"/></g>;
 case 'gem':return <g data-gi-material="faceted-gem" fill="#ffffff22" stroke="#e4fff1" strokeWidth="2">{[[75,128],[125,164],[79,204]].map(([x,y])=><g key={y}><path d={`M${x-15} ${y-9}l15-10l15 10v20l-15 10l-15-10Z`}/><path d={`M${x-15} ${y-9}l15 10l15-10m-15 10v20`} fill="none"/></g>)}</g>;
 case 'flower':return <g data-gi-material="petal-flowers" fill="#f9c8d7" stroke="#753a5f" strokeWidth="1.5">{[[74,126],[127,157],[82,204]].map(([x,y])=><g key={y} transform={`translate(${x} ${y})`}>{[0,72,144,216,288].map(a=><ellipse key={a} cy="-8" rx="5" ry="9" transform={`rotate(${a})`}/>)}<circle r="3" fill="#ffe391"/></g>)}</g>;
 case 'bamboo':return <g data-gi-material="bamboo-stalks" stroke="#b3df8c" strokeWidth="6" fill="none"><path d="M68 100v120M113 100v120m-50-95h10m35 20h10m-55 25h10m35 20h10"/><path d="M72 149q22-27 27-7q-11 14-27 7M114 126q20-20 28-7q-9 12-28 7M67 193q-19-20-21-6" fill="#629842" stroke="#244d32" strokeWidth="1.5"/></g>;
 case 'forest':return <g data-gi-material="leaf-canopy" fill="#b8d48c" stroke="#2b4d32" strokeWidth="2">{[[73,129],[123,160],[80,201]].map(([x,y])=><g key={y} transform={`translate(${x} ${y}) rotate(-25)`}><path d="M0-20Q23-10 0 20Q-23-10 0-20Z"/><path d="M0-16V23M0-5l9-7M0 6l-9-8" fill="none"/></g>)}</g>;
 case 'metal':return <g data-gi-material="forged-metal"><path d="M50 100h100v120H50Z" fill="#192d3a" opacity=".15"/>{[111,145,181,215].map(y=><g key={y}><path d={`M52 ${y}h96v18H52Z`} fill="#c7d8dc44" stroke="#e4e9dc" strokeWidth="1"/><circle cx="58" cy={y+8} r="2" fill="#e9ddbd"/><circle cx="142" cy={y+8} r="2" fill="#e9ddbd"/></g>)}</g>;
 case 'sun':return <g data-gi-material="sun-rays" fill="none" stroke="#ffe9a0" strokeWidth="3"><circle cx="100" cy="145" r="22" fill="#efb544"/>{Array.from({length:12},(_,i)=><path key={i} d="M100 111V100" transform={`rotate(${i*30} 100 145)`}/>)}<path d="M50 202q50-20 100 0m-100 12q50-20 100 0"/></g>;
 case 'sky':return <g data-gi-material="cloud-sky" fill="none" stroke="#dce7f5" strokeWidth="4"><path d="M50 130q4-14 15-7q11-22 25-4q15-8 20 7h40M50 184q12-13 24-3q15-24 31-5q17-12 30 5h15"/><path d="M118 133l-17 30h14l-15 33l31-44h-16l14-19" fill="#f6db83" stroke="#8f8da8" strokeWidth="1"/></g>;
 case 'fruit':return <g data-gi-material="orchard-motif" fill="#efb292" stroke="#5b3b41" strokeWidth="2">{[[74,130],[124,171],[80,211]].map(([x,y])=><g key={y}><circle cx={x} cy={y} r="12"/><path d={`M${x} ${y-10}q3-16 13-12q2 10-13 12`} fill="#9bbf73"/><path d={`M${x-5} ${y-6}q-7 9 0 14`} fill="none" stroke="#fff2c5"/></g>)}</g>;
 case 'flame':return <g data-gi-material="rising-flames" fill="#f5b548" stroke="#8b3e30" strokeWidth="2"><path d="M50 220v-31q18 16 19-29q23 34 25-18q25 24 14 58q12-19 20-22q-4 27 22 12v30Z"/><path d="M75 220q-7-22 11-34q-1 18 15 11q-8 14 6 23" fill="#ffe4a7" stroke="none"/></g>;
 default:return <g data-gi-material="woven-fabric" stroke="#fff3" strokeWidth="1">{[110,130,150,170,190,210].map(y=><path key={y} d={`M50 ${y}h100`}/>)}{[60,85,110,135].map(x=><path key={x} d={`M${x} 100v120`}/>)}</g>;
 }
}
/** Same torso coordinates in shop, creator and saved-character artwork. */
export function GiDesign({item}:{item:Pick<Item,'name'|'pattern'>}) {
 const theme=giTheme(item.name);
 return <g data-gi-theme={theme} data-gi-name={item.name}>
  <ThemeArt theme={theme}/>
  {/* The secondary named technique remains visible as embroidery rather than replacing the theme. */}
  <g className="gi-technique-embroidery" transform="translate(52 67) scale(.48)"><Pattern i={item.pattern??0}/></g>
 </g>;
}
