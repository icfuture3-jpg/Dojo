import type { ReactNode } from 'react';
const gold = '#f3cd55', silver = '#d6e0eb';
function Belt({color}:{color:string}) { return <g fill={color} stroke="#63513b" strokeWidth="1.5"><path d="M8 28Q36 20 64 28V41Q36 33 8 41Z"/><path d="M31 36L19 65L32 61L40 38M40 36L55 62L42 66L32 39"/><rect x="28" y="27" width="16" height="15" rx="3"/><path d="M12 30L27 28M43 28L60 30" stroke="#fff9"/></g>; }
function Palm({color=silver}:{color?:string}) {return <path d="M24 60L17 42Q14 34 19 33L26 39V18Q26 12 31 15V34V10Q36 5 39 11V33V14Q44 9 47 16V35V23Q53 18 55 25V45Q54 56 46 63Z" fill={color} stroke="#4c7188" strokeWidth="2"/>;}
function Fist({color=gold}:{color?:string}) {return <g fill={color} stroke="#44667a" strokeWidth="2"><path d="M21 64V48L14 37L19 29L27 35V19L35 15L43 18L51 17L58 23V44L49 56V64Z"/><path d="M27 35L44 33L48 40L37 47M35 16V31M43 18V31M51 18V33" fill="none"/></g>;}
function Crown(){return <path d="M14 50L9 24L25 35L36 16L47 35L63 24L58 50ZM14 55H58V62H14Z" fill={gold} stroke="#a77d2f" strokeWidth="2"/>;}
function Dojo(){return <g stroke="#d3a454" strokeWidth="2"><path d="M10 35L36 15L62 35Z" fill="#ae413c"/><path d="M16 35V63H56V35" fill="#70452f"/><path d="M29 63V43H43V63" fill="#211b29"/><path d="M7 35H65M21 42V54M51 42V54"/></g>;}
function Star(){return <path d="M36 14L43 29L60 31L48 43L51 60L36 52L21 60L24 43L12 31L29 29Z" fill={gold} stroke="#fff5" strokeWidth="2"/>;}
function Student(){return <g><circle cx="36" cy="25" r="11" fill="#e5b58c"/><path d="M18 63V47Q20 37 36 37Q52 37 54 47V63" fill="#e7ecf5"/><path d="M27 39L36 52L45 39M20 55H52" fill="none" stroke="#594130" strokeWidth="4"/></g>;}
export const TROPHY_ART_IDS = ['first-win','win-10','win-25','rounds-50','flawless','comeback','boss','perfect','silver','plat','grand','win-50','flawless-5','champ-5','box-10','level-5','level-10','gold','diamond','collector','box','streak-3','streak-7','pot-triad','lightning-perfect','memory-clear','shadow-variety','academy-versatile','upgrade-toolkit','equipped-finish','rescue-lantern'] as const;
export function TrophyArt({name,id}:{name:string;id:string}) {
 let art: ReactNode;
 switch(id){
 case 'silver': art=<Belt color={silver}/>; break;
 case 'gold': art=<Belt color={gold}/>; break;
 case 'plat': art=<Palm/>; break;
 case 'diamond': art=<><Fist color="#8de5f7"/><path d="M28 21L36 16L46 22L36 35ZM28 21H46M36 16V35" fill="none" stroke="white" strokeWidth="1.5"/><path d="M56 8V18M51 13H61" stroke="white" strokeWidth="2"/></>;break;
 case 'first-win': art=<><path d="M36 12Q11 39 20 52Q36 72 52 52Q61 39 36 12Z" fill="#dd5454"/><path d="M36 32V53M28 43H44" stroke="#fff0d3" strokeWidth="5"/></>;break;
 case 'win-10': art=<>{[18,36,54].map((x,i)=><g key={x}><path d={`M${x-7} 17L${x} 34L${x+7} 17`} fill="none" stroke={i===1?gold:silver} strokeWidth="5"/><circle cx={x} cy={46} r="10" fill={i===1?gold:silver}/><path d={`M${x-4} 46L${x} 50L${x+5} 42`} fill="none" stroke="#60502f" strokeWidth="2"/></g>)}</>;break;
 case 'win-25': art=<><Dojo/><path d="M36 39L39 45L46 46L41 51L42 58L36 54L30 58L31 51L26 46L33 45Z" fill={gold}/></>;break;
 case 'rounds-50': art=<><Fist/><path d="M52 6L43 24H54L47 39L66 18H55L62 6Z" fill="#fcf082"/></>;break;
 case 'flawless': art=<><path d="M36 12L59 20V40Q57 56 36 67Q15 56 13 40V20Z" fill="#73c9df" stroke={silver} strokeWidth="3"/><path d="M24 39L33 48L49 29" fill="none" stroke="white" strokeWidth="5"/></>;break;
 case 'comeback': art=<><path d="M56 43A22 22 0 1 1 47 19" fill="none" stroke={gold} strokeWidth="7"/><path d="M42 8L56 22L36 27" fill={gold}/><path d="M30 53V39H24L36 26L48 39H42V53Z" fill="#8bd5a5"/></>;break;
 case 'boss': art=<><path d="M20 38L13 15L29 26Q36 21 43 26L59 15L52 38L49 57H23Z" fill="#bc535a" stroke={gold} strokeWidth="2"/><path d="M26 35L32 38M46 35L40 38" stroke="white" strokeWidth="3"/><path d="M17 63L55 17M14 58L23 66" stroke={silver} strokeWidth="5"/></>;break;
 case 'perfect': art=<><path d="M20 68Q60 55 35 42Q12 29 38 17" fill="none" stroke={gold} strokeWidth="9"/><g transform="translate(23 -1) scale(.45)"><Star/></g></>;break;
 case 'grand': art=<><Student/><g transform="translate(14 -2) scale(.62)"><Crown/></g><path d="M57 33V68" stroke={gold} strokeWidth="4"/></>;break;
 case 'win-50': art=<><Dojo/><path d="M9 40Q0 57 16 66M63 40Q72 57 56 66" fill="none" stroke={gold} strokeWidth="5"/><g transform="translate(20 -4) scale(.45)"><Star/></g></>;break;
 case 'flawless-5': art=<><g opacity=".25" transform="translate(-8 3)"><Palm color="#d9c8ff"/></g><g transform="translate(6 0)"><Palm color="#e5d9ff"/></g><path d="M13 16V25M9 20H17M57 55V64M53 59H61" stroke="white" strokeWidth="2"/></>;break;
 case 'champ-5': art=<><Crown/><path d="M15 68Q4 57 12 46M57 68Q68 57 60 46" fill="none" stroke="#8bd5a5" strokeWidth="4"/><path d="M7 44L16 48L7 52M65 44L56 48L65 52" fill="#8bd5a5"/></>;break;
 case 'box-10': art=<><Palm color="#c9a074"/><path d="M36 24C22 11 18 31 31 33C18 43 35 49 36 35C38 49 54 43 42 33C55 30 49 12 36 24Z" fill="#6acd85" stroke="#2b7950" strokeWidth="1.5"/></>;break;
 case 'level-5': art=<><Student/><path d="M57 33V12M50 20L57 12L64 20" fill="none" stroke={gold} strokeWidth="4"/></>;break;
 case 'level-10': art=<><Student/><path d="M26 29Q36 53 46 29L44 43L36 52L28 43Z" fill={silver}/><path d="M59 22V68" stroke={gold} strokeWidth="4"/></>;break;
 case 'collector': art=<g stroke="#d5a976" strokeWidth="2"><rect x="14" y="12" width="44" height="57" rx="3" fill="#825131"/><path d="M36 12V69M20 25H52"/><path d="M28 29L21 35L28 39V55H44V39L51 35L44 29L36 33Z" fill="#67a7d9"/><circle cx="32" cy="58" r="2" fill={gold}/><circle cx="40" cy="58" r="2" fill={gold}/></g>;break;
 case 'box': art=<><path d="M13 32L36 22L59 32V60L36 70L13 60Z" fill="#8a56aa" stroke={gold} strokeWidth="2"/><path d="M13 32L36 43L59 32M36 43V70" fill="none" stroke={gold} strokeWidth="2"/><path d="M30 19Q30 6 41 10Q51 15 38 23V27" fill="none" stroke={gold} strokeWidth="4"/><circle cx="38" cy="32" r="2" fill={gold}/></>;break;
 case 'streak-3': art=<><rect x="12" y="18" width="48" height="46" rx="5" fill={silver}/><path d="M12 29H60M23 13V23M49 13V23" stroke="#a65c49" strokeWidth="5"/><path d="M23 44L32 53L49 36" fill="none" stroke="#367b57" strokeWidth="5"/></>;break;
 case 'streak-7': art=<><path d="M36 8Q30 28 22 34Q10 45 20 60Q36 76 52 59Q65 42 46 27Q48 44 36 41Q27 37 36 8Z" fill="#f09445"/><path d="M36 40Q20 56 36 64Q52 56 36 40Z" fill={gold}/><path d="M28 51Q28 44 36 49Q44 44 44 51Q44 56 36 61Q28 56 28 51Z" fill="#d95159"/></>;break;

 case 'pot-triad': art=<>{[18,36,54].map((x,i)=><g key={x}><path d={`M${x-7} 40H${x+7}L${x+5} 62H${x-5}Z`} fill={['#c66b42','#68b9c4','#b58ad9'][i]} stroke={gold} strokeWidth="2"/><path d={`M${x} 38V22M${x} 30L${x-6} 25M${x} 26L${x+6} 20`} stroke="#9ac78f" strokeWidth="3"/></g>)}</>;break;
 case 'lightning-perfect': art=<><circle cx="36" cy="40" r="24" fill="none" stroke="#75d4eb" strokeWidth="4"/><circle cx="36" cy="40" r="13" fill="none" stroke={gold} strokeWidth="2"/><path d="M40 9L23 39H36L30 68L51 33H39Z" fill={gold}/></>;break;
 case 'memory-clear': art=<><path d="M12 61V30L36 14L60 30V61Z" fill="#655696" stroke="#c2acf3" strokeWidth="3"/>{[22,36,50].map((x,i)=><g key={x}><rect x={x-4} y={31+i*4} width="8" height={23-i*4} fill={gold}/><circle cx={x} cy="64" r="3" fill="#a9e6f2"/></g>)}</>;break;
 case 'shadow-variety': art=<><circle cx="36" cy="39" r="25" fill="#171b33" stroke="#b5a2eb" strokeWidth="3"/><path d="M18 25Q37 7 54 25Q39 23 43 37Q58 53 44 62Q40 43 29 45Q14 45 18 25Z" fill="#b8a1e6"/>{[22,36,50].map((x,i)=><circle key={x} cx={x} cy={35+i*4} r="4" fill={['#f5d677','#96dfeb','#df9aaa'][i]}/>)}</>;break;
 case 'academy-versatile': art=<><circle cx="36" cy="40" r="17" fill="#426d63" stroke={gold} strokeWidth="3"/>{Array.from({length:8},(_,i)=><path key={i} d="M33 8H39L41 19H31Z" transform={`rotate(${i*45} 36 40)`} fill={i%2?gold:'#8bd6c1'}/>)}<path d="M27 40L34 47L46 32" fill="none" stroke="white" strokeWidth="3"/></>;break;
 case 'upgrade-toolkit': art=<><path d="M14 31H58V65H14Z" fill="#647e94" stroke={gold} strokeWidth="3"/><path d="M25 31V21H47V31" fill="none" stroke={gold} strokeWidth="4"/><path d="M25 43V55M20 49H30M36 41L32 57H40M47 44Q39 49 47 54Q55 49 47 44Z" fill="none" stroke="#eddfba" strokeWidth="2"/></>;break;
 case 'equipped-finish': art=<><path d="M22 20L9 35L21 44V65H51V44L63 35L50 20L36 29Z" fill="#5b9bb6" stroke={gold} strokeWidth="2"/><path d="M25 22L41 47L49 22M21 51H51" fill="none" stroke="#eee1b5" strokeWidth="3"/><path d="M52 9L55 17L64 20L55 23L52 31L49 23L41 20L49 17Z" fill={gold}/></>;break;
 case 'rescue-lantern': art=<><path d="M36 8V21M23 23H49M23 60H49" stroke={gold} strokeWidth="4"/><rect x="19" y="25" width="34" height="33" rx="11" fill="#b84c39" stroke={gold} strokeWidth="3"/><path d="M36 30Q20 48 36 53Q52 48 36 30Z" fill="#ffe39a"/><path d="M36 61V71M31 70H41" stroke="#ecbe6b" strokeWidth="3"/></>;break;
 default: art=<Star/>;
 }
 return <svg role="img" aria-label={`${name} trophy`} data-trophy={id} width="72" height="82" viewBox="0 0 72 82" style={{flexShrink:0}}><rect width="72" height="82" rx="10" fill="#30251b"/><ellipse cx="36" cy="73" rx="26" ry="4" fill="#0005"/>{art}</svg>;
}
