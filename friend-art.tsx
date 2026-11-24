import {useId} from 'react';
import type {Friend} from './friends';
export function FriendArt({friend,size=90}:{friend:Friend;size?:number}){
 const id=useId().replace(/:/g,'');const {kind,color,accent}=friend;
 const dragon=kind==='dragon'||kind==='torch';
 return <svg role="img" aria-label={friend.name} data-friend={friend.id} viewBox="0 0 120 110" width={size} height={size} style={{maxWidth:'100%',height:'auto'}}>
 <defs><radialGradient id={`${id}-body`} cx=".35" cy=".25" r=".8"><stop stopColor={accent}/><stop offset=".45" stopColor={color}/><stop offset="1" stopColor="#36425a"/></radialGradient></defs>
 <ellipse cx="60" cy="101" rx="42" ry="5" fill="#0004"/>
 {kind==='fox'&&<g data-part="nine-tails">{Array.from({length:9},(_,i)=><path key={i} d="M59 87Q7 88 18 40Q48 50 59 87Z" fill={i%2?accent:color} stroke="#594558" strokeWidth="1.5" transform={`rotate(${(i-4)*20} 60 87)`}/>)}</g>}
 {dragon&&<path d="M78 88Q113 100 108 68Q101 48 88 68Q112 79 88 82L73 72" fill={`url(#${id}-body)`} stroke={accent} strokeWidth="4"/>}
 {kind==='bird'&&<g fill={color} stroke={accent} strokeWidth="3"><path d="M55 90Q1 93 10 35Q34 64 55 66M65 90Q119 93 110 35Q86 64 65 66"/><path d="M50 88L35 106L60 97L85 106L70 88"/></g>}
 <ellipse data-part="body" cx="60" cy="79" rx={kind==='fish'?37:30} ry="22" fill={`url(#${id}-body)`} stroke="#344052" strokeWidth="2"/>
 {kind==='fish'?<><path d="M90 76L113 56L108 92Z" fill={color} stroke={accent} strokeWidth="2"/><path d="M47 58L61 43L75 60M48 92L61 103L72 91" fill={accent}/></>:<><ellipse cx="40" cy="96" rx="12" ry="6" fill={color}/><ellipse cx="80" cy="96" rx="12" ry="6" fill={color}/></>}
 {kind==='turtle'&&<g data-part="shell"><ellipse cx="76" cy="76" rx="30" ry="21" fill="#397e68" stroke={accent} strokeWidth="4"/><path d="M65 62L80 59L91 73L80 87L64 84L57 72Z" fill={color} stroke={accent} strokeWidth="2"/></g>}
 {kind==='lion'&&<g fill={color} stroke={accent} strokeWidth="2">{Array.from({length:10},(_,i)=><circle key={i} cx={60+29*Math.cos(i*Math.PI/5)} cy={51+28*Math.sin(i*Math.PI/5)} r="12"/>)}</g>}
 {(kind==='fox'||kind==='cat')&&<path data-part="ears" d="M31 41L25 12L48 31M72 31L95 12L89 41" fill={color} stroke={accent} strokeWidth="4"/>}
 {(dragon||kind==='deer')&&<path data-part="antlers" d="M39 32L28 12M31 19L19 20M81 32L92 12M89 19L101 20" fill="none" stroke={accent} strokeWidth="5" strokeLinecap="round"/>}
 {(kind==='goat'||kind==='mask')&&<path data-part="horns" d={kind==='goat'?'M51 31L60 6L69 31Z':'M35 36Q4 15 26 9L39 29M85 36Q116 15 94 9L81 29'} fill={accent} stroke="#5b5964" strokeWidth="2"/>}
 <ellipse data-part="face" cx={kind==='turtle'?43:60} cy="51" rx={kind==='fish'?30:29} ry="26" fill={`url(#${id}-body)`} stroke="#344052" strokeWidth="2"/>
 {kind==='bird'&&<path d="M49 30Q35 5 50 10L60 24L70 10Q85 5 71 30" fill={color} stroke={accent} strokeWidth="3"/>}
 {kind==='torch'&&<path d="M44 32L40 14L54 22L62 6L69 24L81 17L76 34" fill={accent}/>}
 <g data-part="eyes" fill="#20283b"><ellipse cx={kind==='turtle'?33:49} cy="49" rx="4" ry="6"/><ellipse cx={kind==='turtle'?53:71} cy="49" rx="4" ry="6"/><circle cx={kind==='turtle'?32:48} cy="47" r="1.5" fill="white"/><circle cx={kind==='turtle'?52:70} cy="47" r="1.5" fill="white"/></g>
 {kind==='bird'?<path d="M53 57L60 68L67 57Z" fill="#efba53"/>:<path d={kind==='turtle'?'M36 63Q43 69 50 63':'M50 63Q60 71 70 63'} fill="none" stroke="#34344b" strokeWidth="2.5" strokeLinecap="round"/>}
 {kind==='deer'&&<path data-part="scales" d="M40 78L46 83L52 78L58 83L64 78L70 83L76 78M46 86L52 91L58 86L64 91L70 86" fill="none" stroke={accent} strokeWidth="2"/>}
 {kind==='cat'&&<path d="M42 33L49 39M60 28V37M78 33L71 39" stroke="#694631" strokeWidth="3"/>}
 {kind==='mask'&&<path d="M37 43Q48 30 55 44M65 44Q72 30 83 43M48 69L53 75L56 69M64 69L67 75L72 69" fill="none" stroke={accent} strokeWidth="3"/>}
 <circle cx={kind==='turtle'?24:39} cy="59" r="4" fill="#f29a9a66"/><circle cx={kind==='turtle'?62:81} cy="59" r="4" fill="#f29a9a66"/>
 </svg>;
}
