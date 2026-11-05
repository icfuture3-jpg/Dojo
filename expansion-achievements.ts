import { awardActivity, type Profile } from './economy';
import { TOURNAMENT_IDS, RIVAL_IDS, DOJO_IDS } from './content-catalog';
export const EXPANSION_ACHIEVEMENTS: {id:string;name:string;goal:string;coins:number;gems:number;test(p:Profile):boolean}[] = [
 ...[10,25,50,100].map(n=>({id:`exp-win-${n}`,name:`${n} Victories`,goal:`Win ${n} matches across classic combat and new trials.`,coins:n*4,gems:Math.max(1,Math.floor(n/10)),test:(p:Profile)=>p.stats.won+p.challenges.victories>=n})),
 {id:'exp-streak',name:'Unbroken Five',goal:'Win five consecutive matches.',coins:50,gems:2,test:p=>p.bestMatchStreak>=5},
 {id:'exp-challenges',name:'Challenge Dojo Graduate',goal:'Clear the daily, perfect, comeback and master trials; survive at least one match.',coins:150,gems:4,test:p=>['daily','perfect','comeback','master'].every(k=>p.challenges.clears[k]>0)&&p.challenges.survivalBest>0},
 {id:'exp-tournaments',name:'World Champion',goal:'Win all six new tournaments.',coins:250,gems:6,test:p=>TOURNAMENT_IDS.every(k=>p.challenges.clears[k]>0)},
 {id:'exp-rivals',name:'Rivals Resolved',goal:'Defeat all three new rival encounters.',coins:100,gems:3,test:p=>RIVAL_IDS.every(k=>p.challenges.clears[k]>0)},
 {id:'exp-dojos',name:'Keeper of Six Dojos',goal:'Complete all six new rescue-dojo activities.',coins:200,gems:5,test:p=>DOJO_IDS.every(k=>p.challenges.clears[k]>0)},
 {id:'exp-grandmaster',name:'Three Hands Grandmaster',goal:'Win every tournament, rival encounter and dojo activity; clear Master trial and win 100 matches.',coins:400,gems:10,test:p=>[...TOURNAMENT_IDS,...RIVAL_IDS,...DOJO_IDS,'master'].every(k=>p.challenges.clears[k]>0)&&p.stats.won+p.challenges.victories>=100},
];
export function checkExpansionAchievements(input:Profile):Profile {
 let p=input;
 for(const a of EXPANSION_ACHIEVEMENTS)if(!p.expansionAchievements.includes(a.id)&&a.test(p)){
  p={...p,expansionAchievements:[...p.expansionAchievements,a.id]};
  p=awardActivity(p,{coins:a.coins,gems:a.gems,xp:0},`Achievement: ${a.name}`);
 }
 return p;
}
