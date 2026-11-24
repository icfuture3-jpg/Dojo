import type {ReactNode} from 'react';
import type {Friend} from './friends';
import './friend-art.css';
export const FRIEND_ABILITIES:Record<Friend['id'],{name:string;detail:string}>={
 carp:{name:'Dragon Gate Leap',detail:'Leaps through a golden water ring with a splash.'},
 bixi:{name:'Jade Shell Ward',detail:'Projects a hexagonal jade shield around its stone shell.'},
 suanni:{name:'Incense Cloud',detail:'Breathes soft curls of golden smoke from its lion mane.'},
 xiezhi:{name:'Truth Beacon',detail:'Lights its single horn with a clear silver beam.'},
 qilin:{name:'Gentle Bloom',detail:'Leaves jade leaves and tiny blossoms beneath its hooves.'},
 fox:{name:'Spirit Lanterns',detail:'Sends nine pink spirit lights around its nine tails.'},
 fenghuang:{name:'Harmony Wings',detail:'Fans long rainbow feathers into a radiant sunrise.'},
 yazi:{name:'Guardian Roar',detail:'Releases three amber sound rings from its striped muzzle.'},
 taotie:{name:'Bronze Awakening',detail:'Illuminates bronze spirals above its horned body and watchful underarm eyes.'},
 'black-dragon':{name:'River Vortex',detail:'Coils around a dark swirling whirlpool.'},
 'yellow-dragon':{name:'Golden Rain',detail:'Calls a warm rain shower from its broad cloud mane.'},
 'pearl-dragon':{name:'Pearl Bubbles',detail:'Blows a trail of shimmering pearl bubbles.'},
 'azure-dragon':{name:'Tidal Flight',detail:'Rides a curling wave with a long scaled body and whiskered dragon face.'},
 zhulong:{name:'Daybreak Gaze',detail:'Carries a sun and crescent moon above its torch-red coils.'},
};

export function friendImagePath(friend:Friend){
 return `${import.meta.env.BASE_URL}images/friends/${friend.id}.png`;
}
/** Direct lossless crops of the user-supplied reference. Never redraw or recolor faces. */
export function FriendArt({friend,size=104,ability=false}:{friend:Friend;size?:number;ability?:boolean}){
 let effect:ReactNode;
 switch(friend.id){
 case 'carp':effect=<><ellipse cx="57" cy="56" rx="28" ry="39" fill="none" stroke="#ffe28b" strokeWidth="5"/><path d="M17 94Q43 74 61 94T107 94" fill="none" stroke="#94eaff" strokeWidth="5"/></>;break;
 case 'bixi':effect=<path d="M60 7L108 33V85L60 113L12 85V33Z" fill="none" stroke="#a7ffd7" strokeWidth="4"/>;break;
 case 'suanni':effect=<path d="M20 42Q2 22 22 16T21 1M100 48Q117 30 100 23T103 2M38 17Q46 4 59 15" fill="none" stroke="#f9d69b" strokeWidth="4" strokeLinecap="round"/>;break;
 case 'xiezhi':effect=<path d="M48 13L30 0H67Z" fill="#f1f3ff" opacity=".7"/>;break;
 case 'qilin':effect=<g fill="#e7afd9">{[19,58,99].map(x=><g key={x} transform={`translate(${x} 100)`}><circle r="6"/><path d="M0 1V12L-6 6M0 8L7 4" stroke="#99efbb" strokeWidth="2"/></g>)}</g>;break;
 case 'fox':effect=<g fill="#ffe2fb">{Array.from({length:9},(_,i)=><circle key={i} cx={60+48*Math.cos(i*Math.PI*2/9)} cy={56+46*Math.sin(i*Math.PI*2/9)} r="3"/>)}</g>;break;
 case 'fenghuang':effect=<g fill="none" stroke="#ffe0a0" strokeWidth="3"><path d="M11 57A49 49 0 0 1 109 57M22 57A38 38 0 0 1 98 57"/></g>;break;
 case 'yazi':effect=<g fill="none" stroke="#ffc975" strokeWidth="3"><path d="M9 51Q-2 59 9 68M15 45Q-3 59 15 75M23 39Q-7 59 23 81"/></g>;break;
 case 'taotie':effect=<g fill="none" stroke="#bdffe8" strokeWidth="3"><path d="M21 26L5 10M99 26L115 10M25 91L12 105M95 91L108 105"/><circle cx="60" cy="15" r="8"/></g>;break;
 case 'black-dragon':effect=<g fill="none" stroke="#a4c2f0" strokeWidth="3"><ellipse cx="60" cy="94" rx="49" ry="12"/><path d="M20 94Q60 75 98 94Q60 109 37 96Q64 85 82 95"/></g>;break;
 case 'yellow-dragon':effect=<g stroke="#ffe18c" strokeWidth="3" strokeLinecap="round">{[15,38,62,85,107].map((x,i)=><path key={x} d={`M${x} ${86+i%2*8}l-4 13`}/>)}</g>;break;
 case 'pearl-dragon':effect=<g fill="#f9eeff88" stroke="#eedbff" strokeWidth="2">{[[21,64,9],[18,38,6],[12,15,4],[100,25,10]].map(([x,y,r])=><circle key={x} cx={x} cy={y} r={r}/>)}</g>;break;
 case 'azure-dragon':effect=<path d="M5 99Q22 75 41 92Q28 94 31 104Q55 92 77 102T116 99" fill="none" stroke="#8ef4f3" strokeWidth="5"/>;break;
 case 'zhulong':effect=<><circle cx="22" cy="22" r="13" fill="#ffcf69"/><path d="M108 9A15 15 0 1 0 109 35A12 12 0 0 1 108 9" fill="#cddaff"/></>;break;
 }
 return <svg role="img" aria-label={friend.name} data-friend={friend.id} className={ability?'friend-art friend-showcase':'friend-art'} viewBox="-12 -10 144 140" width={size} height={size} style={{maxWidth:'100%',height:'auto'}}>
 <g className="friend-character" data-reference-art={friend.id}>
 <image href={friendImagePath(friend)} x="0" y="0" width="120" height="120" preserveAspectRatio="xMidYMid meet"/>
 </g>
 {ability&&<g className="friend-ability-effect" data-ability={friend.id}>{effect}</g>}
 </svg>;
}
