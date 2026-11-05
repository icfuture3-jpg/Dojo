import type { Rival } from './rps';
import { fairPick } from './rps';
export const TOURNAMENT_IDS = ['beginner','intermediate','advanced','grandmaster','elite','world'] as const;
export const RIVAL_IDS = ['crane','tiger','lotus'] as const;
export const DOJO_IDS = ['bamboo-defense','lotus-competition','mountain-trial','crane-streak','thunder-championship','moon-timed'] as const;
export const EVENT_IDS = ['weekend','double-reward','revenge','festival','grandmaster-event','championship-weekend'] as const;
export type ContentId = typeof TOURNAMENT_IDS[number] | typeof RIVAL_IDS[number] | typeof DOJO_IDS[number] | typeof EVENT_IDS[number];
export type Activity = {
  name:string; group:'Tournaments'|'Rival Challenges'|'Dojo Activities'|'Special Events'; goal:string;
  opponents: readonly number[]; minLevel:number; previous?:ContentId; reward:{coins:number;xp:number;gems:number};
  needHands?:boolean; startBehind?:boolean; flawless?:boolean; roundLimit?:number; window?:number; dojo?:number;
};
// Opponent indices 0–7 are the existing Tower pool; 8–10 are additive rivals.
export const CONTENT: Record<ContentId,Activity> = {
 beginner:{name:'Beginner Championship',group:'Tournaments',goal:'Win a two-match opening bracket.',opponents:[0,1],minLevel:1,reward:{coins:80,xp:50,gems:2}},
 intermediate:{name:'Intermediate Championship',group:'Tournaments',goal:'Win three rounds of the championship bracket.',opponents:[1,2,3],minLevel:2,previous:'beginner',reward:{coins:120,xp:75,gems:3}},
 advanced:{name:'Advanced Championship',group:'Tournaments',goal:'Defeat four opponents in equal-odds matches.',opponents:[2,3,4,5],minLevel:3,previous:'intermediate',reward:{coins:160,xp:100,gems:4}},
 grandmaster:{name:'Grandmaster Championship',group:'Tournaments',goal:'Defeat Ren, Rin, Oku and the Void Sage.',opponents:[4,5,6,7],minLevel:4,previous:'advanced',reward:{coins:200,xp:130,gems:5}},
 elite:{name:'Elite Invitational',group:'Tournaments',goal:'Win five matches against the original masters and new challengers.',opponents:[8,3,9,4,6],minLevel:5,previous:'grandmaster',reward:{coins:240,xp:150,gems:6}},
 world:{name:'Three Hands World Championship',group:'Tournaments',goal:'Clear an eight-match world bracket without losing a match.',opponents:[0,8,2,9,4,10,6,7],minLevel:6,previous:'elite',reward:{coins:320,xp:200,gems:8}},
 crane:{name:'Crane Sora — The Patient Wing',group:'Rival Challenges',goal:'Defeat Sora in an equal-odds match.',opponents:[8],minLevel:1,reward:{coins:65,xp:40,gems:1}},
 tiger:{name:'Tiger Toma — The Bold Challenger',group:'Rival Challenges',goal:'Defeat Toma in an equal-odds match.',opponents:[9],minLevel:2,reward:{coins:80,xp:50,gems:2}},
 lotus:{name:'Lotus Nami — The Shifting Current',group:'Rival Challenges',goal:'Defeat Nami in an equal-odds match.',opponents:[10],minLevel:3,reward:{coins:95,xp:60,gems:2}},
 'bamboo-defense':{name:'Bamboo Grove Defense',group:'Dojo Activities',goal:'Defend the grove against Bao and Fox Jun in two matches.',opponents:[0,1],dojo:0,minLevel:1,reward:{coins:80,xp:50,gems:2}},
 'lotus-competition':{name:'Lotus Pond Rival Competition',group:'Dojo Activities',goal:'Win a three-hand scoring match against Nami.',opponents:[10],dojo:1,minLevel:1,needHands:true,reward:{coins:95,xp:55,gems:2}},
 'mountain-trial':{name:'Iron Mountain Perfect Trial',group:'Dojo Activities',goal:'Win without conceding a point to Mirage Mei.',opponents:[2],dojo:2,minLevel:1,flawless:true,reward:{coins:110,xp:60,gems:2}},
 'crane-streak':{name:'Crane Temple Consecutive Victories',group:'Dojo Activities',goal:'Win three straight matches in the temple.',opponents:[3,8,3],dojo:3,minLevel:1,reward:{coins:125,xp:70,gems:3}},
 'thunder-championship':{name:'Thunder Peak Dojo Championship',group:'Dojo Activities',goal:'Beat Rin, Toma and Oku to defend the championship.',opponents:[5,9,6],dojo:4,minLevel:1,reward:{coins:145,xp:80,gems:3}},
 'moon-timed':{name:'Moon Gate Timed Trial',group:'Dojo Activities',goal:'Win against Void Sage within eight throws (ties count). Six seconds to choose.',opponents:[7],dojo:5,minLevel:1,roundLimit:8,window:6000,reward:{coins:160,xp:90,gems:4}},
 weekend:{name:'Weekend Tournament',group:'Special Events',goal:'Clear a four-match weekend bracket.',opponents:[0,2,4,6],minLevel:1,reward:{coins:160,xp:100,gems:3}},
 'double-reward':{name:'Double Reward Challenge',group:'Special Events',goal:'Win against Bao for twice this event’s standard 40-coin/25-XP reward.',opponents:[0],minLevel:1,reward:{coins:80,xp:50,gems:0}},
 revenge:{name:'Rival Revenge Event',group:'Special Events',goal:'Start 0–2 against Ren and take back the match.',opponents:[4],minLevel:1,startBehind:true,reward:{coins:100,xp:65,gems:2}},
 festival:{name:'Three Hands Festival',group:'Special Events',goal:'Win with scoring Rock, Paper and Scissors against Sora.',opponents:[8],minLevel:1,needHands:true,reward:{coins:100,xp:65,gems:2}},
 'grandmaster-event':{name:'Grandmaster Challenge',group:'Special Events',goal:'Defeat Oku and Void Sage in successive matches.',opponents:[6,7],minLevel:1,reward:{coins:150,xp:90,gems:3}},
 'championship-weekend':{name:'Championship Weekend',group:'Special Events',goal:'Win six matches to become the weekend champion.',opponents:[8,2,9,4,10,6],minLevel:1,reward:{coins:220,xp:140,gems:5}},
};
export const NEW_RIVALS: readonly (Rival & {victory:string;defeat:string})[] = [
 {name:'Crane Sora',title:'The Patient Wing',color:'#b7d4d4',belt:'#1e5461',intro:'Wait. Listen. Even a fist has a rhythm.',blurb:'Rock, Paper and Scissors are equally likely. No habit-reading.',tellHonesty:.8,pick:fairPick,victory:'Sora bows: “A still pond shows every ripple.”',defeat:'Sora smiles: “You changed the rhythm. Well done.”'},
 {name:'Tiger Toma',title:'The Bold Challenger',color:'#b9692b',belt:'#2c2220',intro:'One strong hand! How many do you need?',blurb:'Rock, Paper and Scissors are equally likely. No habit-reading.',tellHonesty:.85,pick:fairPick,victory:'Toma stomps: “The mountain does not blink!”',defeat:'Toma laughs: “All right! Two hands next time!”'},
 {name:'Lotus Nami',title:'The Shifting Current',color:'#d283a5',belt:'#684973',intro:'The river never offers the same reflection twice.',blurb:'Rock, Paper and Scissors are equally likely. No habit-reading.',tellHonesty:.65,pick:fairPick,victory:'Nami waves: “You followed the reflection.”',defeat:'Nami bows: “You found the current underneath.”'},
];
/** One event every UTC day; weekends always host one of the weekend championships. */
export function scheduledEvent(now:number):{id:typeof EVENT_IDS[number];key:string;start:number;end:number}{
 const start=Math.floor(now/86400000)*86400000, day=new Date(start).getUTCDay(), n=Math.floor(start/86400000);
 const id=day===6?'weekend':day===0?'championship-weekend':(['double-reward','revenge','festival','grandmaster-event'] as const)[((n%4)+4)%4]!;
 return {id,key:`${id}:${new Date(start).toISOString().slice(0,10)}`,start,end:start+86400000};
}
