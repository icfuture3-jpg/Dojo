import { z } from 'zod';
import { academyIds, type AcademyId, type AcademyRun } from './academy-state';
import type { Profile } from './economy';
import { MOVES, beats, counterTo, randomMove, type Move } from './rps';
export const ACADEMY:Record<AcademyId,{name:string;coins:number;instructions:string;xp:number}>={
 dummy:{name:'Dummy Destroyer',coins:25,xp:20,instructions:'Break 10 wooden dummies in 30 seconds. Choose the winning counter to each displayed hand. Wrong answers cost time, not lives.'},
 sensei:{name:"Sensei’s Prediction",coins:30,xp:25,instructions:'Read Sensei’s clues, then match his hidden hand to shatter a seal. Light 3 of 5 lanterns to win. Match the hand — don’t counter it.'},
 lightning:{name:'Lightning Hands',coins:50,xp:35,instructions:'Counter 12 rapid symbols. Finish with at least 75% accuracy (9 correct). Each symbol gets faster; accuracy and average reaction time are recorded.'},
 balance:{name:'Balance of Three',coins:45,xp:30,instructions:'Counter 8 bridge obstacles. Three lives; an incorrect answer or timeout costs one life. Correct answers move you across.'},
 frenzy:{name:'Five-Hand Frenzy',coins:75,xp:50,instructions:'Win five consecutive matches, first to 2 points each. Each rival uses equal hand probabilities. A match loss ends the run; draws award no points.'},
 shadow:{name:'Shadow Master',coins:100,xp:65,instructions:'First to 3 points. Each opponent hand has an equal one-in-three chance. Draws award no points.'},
 says:{name:'Master Says',coins:60,xp:40,instructions:'Only obey commands beginning “Master says”. For other commands, select HOLD. Pass at least 10 of 12 commands. Commands speed up each turn.'},
 memory:{name:'Three-Hand Memory',coins:65,xp:45,instructions:'Watch the complete sequence, then repeat it (do not counter it). Clear lengths 3, 4, 5 and 6. One incorrect answer ends the attempt.'},
 trial:{name:'The Master’s Trial',coins:150,xp:90,instructions:'Defeat Bao, Mei and Oku. Each match is best of five decisive rounds (first to 3). Draws do not count. Losing any match ends the trial.'},
 grandmaster:{name:'Grandmaster Survival',coins:250,xp:120,instructions:'Endless first-to-3 matches. Opponents speed up every 3 victories; all hands stay equally likely. Reach 9 victories for the 250-coin milestone, once per run. Continue for a personal record; loss ends the run.'},
};
export const BELTS=[['White','Beginner',0,'#eee'],['Yellow','Apprentice',80,'#f4d64f'],['Orange','Fighter',210,'#ea923d'],['Green','Warrior',400,'#54a86a'],['Blue','Expert',680,'#4b9ed6'],['Brown','Master-in-Training',1050,'#ad7955'],['Black','Grandmaster',1550,'#333']] as const;
export function beltInfo(xp:number){let index=0;for(let i=1;i<BELTS.length;i++)if(xp>=BELTS[i]![2])index=i;return {current:BELTS[index]!,next:BELTS[index+1],index};}
export function academyDay(now:number){return new Date(now).toISOString().slice(0,10);}
export function dailyAcademy(now:number):AcademyId[]{const n=Math.floor(now/86400000)%3;return n===0?['grandmaster','memory','shadow']:n===1?['frenzy','balance','lightning']:['lightning','says','trial'];}
export function clues(r:AcademyRun){
 const names:Record<Move,string[]>={rock:['A closed fist.','Paper defeats my choice.','My choice defeats Scissors.'],paper:['An open palm.','Scissors defeats my choice.','My choice defeats Rock.'],scissors:['Two fingers.','Rock defeats my choice.','My choice defeats Paper.']};
 const c=names[r.target];return r.difficulty===1?c:r.difficulty===2?[c[1]!,c[2]!,`It is not ${counterTo(r.target)}.`]:[`It counters ${MOVES.find(m=>beats(r.target,m))}.`,`It loses to ${counterTo(r.target)}.`,`Neither of the two named hands is my choice.`];
}
export function academyOpponent(r:AcademyRun){return r.game==='trial'?['Bao','Mei','Oku'][r.wins]!:r.game==='frenzy'?['First rival','Second rival','Third rival','Fourth rival','Final rival'][r.wins]!:r.game==='shadow'?'Shadow Master':`Grandmaster rival ${r.wins+1} · tier ${1+Math.floor(r.wins/3)}`;}
function randomHand(random:number){return randomMove(()=>Math.min(1-Number.EPSILON,Math.max(0,random)));}
export function chooseAcademyRival(_r:AcademyRun, random:number):Move{
 return randomHand(random);
}
const duels=(g:AcademyId)=>['frenzy','shadow','trial','grandmaster'].includes(g);
export function academyWindow(r:AcademyRun){return r.game==='lightning'?Math.max(1400,3600-r.attempts*170):r.game==='says'?Math.max(1800,6000-r.attempts*330):r.game==='grandmaster'?Math.max(3000,8500-Math.floor(r.wins/3)*850):r.game==='frenzy'?8500-r.wins*650:r.game==='sensei'?18000-r.difficulty*2000:10000;}
function question(r:AcademyRun,now:number,random:number):AcademyRun{
 const target=duels(r.game)?chooseAcademyRival(r,random):randomHand(random);
 return {...r,target,valid:random<.6,opened:now,deadline:now+academyWindow(r),phase:'play',turn:r.turn+1};
}
function memory(r:AcademyRun,now:number,random:number):AcademyRun{
 const length=3+r.score,sequence=Array.from({length},(_,i)=>randomHand(((random*997+i*13.371)%1+1)%1));
 return {...r,sequence,attempts:0,opened:now,deadline:now+length*1000+700,phase:'watch',turn:r.turn+1,feedback:'Watch the sequence. Your turn begins when it disappears.'};
}
const command=z.discriminatedUnion('action',[
 z.object({action:z.literal('start'),id:z.string().min(1).max(160),game:z.enum(academyIds),difficulty:z.number().int().min(1).max(3),playImmediately:z.boolean().default(false)}),
 z.object({action:z.enum(['begin','next','tick','pause','resume','exit']),id:z.string(),turn:z.number().int().nonnegative()}),
 z.object({action:z.literal('answer'),id:z.string(),turn:z.number().int().nonnegative(),hand:z.enum(['rock','paper','scissors','hold'])}),
 z.object({action:z.literal('equip'),slot:z.enum(['decoration','animation','master']),value:z.string()}),
]);
function pay(p:Profile,r:AcademyRun,now:number):Profile{
 const a=p.academy;if(a.claimed.includes(r.id))return p;
 const catalog=ACADEMY[r.game],key=`${r.day}:${r.game}`;
 const daily=r.day===academyDay(now)&&dailyAcademy(now).includes(r.game)&&!a.daily.includes(key)&&(r.game!=='shadow'||r.noRepeat);
 const clears={...a.clears,[r.game]:(a.clears[r.game]??0)+1};
 const unlocks=[...a.unlocks];const add=(id:string)=>{if(!unlocks.includes(id))unlocks.push(id);};
 const kinds=Object.keys(clears).length;
 if(kinds>=1)add('lanterns');if(kinds>=2)add('gold');if(kinds>=3)add('bamboo');if(kinds>=4)add('Bao');if(kinds>=6)add('cyan');if(kinds>=8)add('Mei');
 const owned=[...p.owned];if(kinds>=2&&!owned.includes('gi-new-1'))owned.push('gi-new-1');if(kinds>=5&&!owned.includes('gi-new-2'))owned.push('gi-new-2');
 return {...p,owned,coins:p.coins+catalog.coins+(daily?25:0),academy:{...a,run:{...r,paid:true},xp:a.xp+catalog.xp+(daily?20:0),clears,unlocks,claimed:[...a.claimed,r.id],daily:daily?[...a.daily,key]:a.daily}};
}
export function applyAcademy(p:Profile,raw:unknown,now:number,random:number):Profile{
 const c=command.safeParse(raw);if(!c.success||!Number.isFinite(random))return p;const cmd=c.data;const a=p.academy;
 if(cmd.action==='equip'){
  const allowed={decoration:['plain','lanterns','bamboo'],animation:['plain','gold','cyan'],master:['self','Bao','Mei']};
  if(!allowed[cmd.slot].includes(cmd.value)||(!['plain','self'].includes(cmd.value)&&!a.unlocks.includes(cmd.value)))return p;
  return {...p,academy:{...a,[cmd.slot]:cmd.value}};
 }
 if(cmd.action==='start'){
  if(cmd.game==='dummy'||cmd.game==='sensei')return p;
  if(a.started.includes(cmd.id)||a.run&&!['won','lost'].includes(a.run.phase))return p;
  const run:AcademyRun={id:cmd.id,game:cmd.game,difficulty:cmd.difficulty,phase:'ready',pausedPhase:'play',turn:0,score:0,errors:0,attempts:0,wins:0,player:0,rival:0,senseiGuesses:[],history:[],sequence:[],target:'rock',valid:true,deadline:0,totalDeadline:0,remaining:0,totalRemaining:0,opened:now,elapsed:0,reactionTotal:0,reactions:0,feedback:'Read the instructions, then begin.',day:academyDay(now),paid:false,noRepeat:true};
  const started=cmd.playImmediately?(run.game==='memory'?memory(run,now,random):question({...run,feedback:'Choose a hand — training is live.'},now,random)):run;
  return {...p,academy:{...a,run:started,started:[...a.started,run.id]}};
 }
 let r=a.run;if(!r||r.id!==cmd.id||r.turn!==cmd.turn)return p;
 const store=(run:AcademyRun):Profile=>{
  const records={...a.records,[run.game]:Math.max(a.records[run.game]??0,run.game==='grandmaster'?run.wins:run.score)};
  if(run.game==='lightning'&&run.phase==='won'){
   records.lightningAccuracy=Math.max(records.lightningAccuracy??0,Math.round(run.score/12*100));
   const mean=Math.round(run.reactionTotal/Math.max(1,run.reactions));
   records.lightningReactionMs=records.lightningReactionMs?Math.min(records.lightningReactionMs,mean):mean;
  }
  return {...p,academy:{...a,run,records}};
 };
 const finish=(win:boolean,run:AcademyRun):Profile=>{const next={...run,phase:win?'won' as const:'lost' as const,turn:run.turn+1,feedback:win?'Challenge completed! Reward saved.':run.paid?'Run ended. Your milestone reward remains saved.':'Attempt ended. No completion reward. Try again.'};return win?pay(store(next),next,now):store(next);};
 if(cmd.action==='exit')return {...p,academy:{...a,run:null}};
 if(cmd.action==='pause'&&['play','watch','review'].includes(r.phase))return store({...r,phase:'paused',pausedPhase:r.phase as 'play'|'watch'|'review',elapsed:Math.max(0,now-r.opened),remaining:Math.max(0,r.deadline-now),totalRemaining:Math.max(0,r.totalDeadline-now),turn:r.turn+1});
 if(cmd.action==='resume'&&r.phase==='paused')return store({...r,phase:r.pausedPhase,deadline:now+r.remaining,totalDeadline:r.game==='dummy'?now+r.totalRemaining:0,opened:now-r.elapsed,turn:r.turn+1});
 if(cmd.action==='begin'&&r.phase==='ready')return store(r.game==='memory'?memory(r,now,random):question({...r,totalDeadline:r.game==='dummy'?now+30000:0},now,random));
 if(r.phase==='won'||r.phase==='lost'||r.phase==='paused'||r.phase==='ready')return p;
 if(r.game==='dummy'&&now>=r.totalDeadline)return finish(false,r);
 if(r.phase==='watch'){
  if(cmd.action==='tick'&&now>=r.deadline)return store({...r,phase:'play',opened:now,deadline:now+20000,turn:r.turn+1,feedback:'Repeat the sequence now.'});
  return p;
 }
 if((cmd.action==='next'||cmd.action==='tick'&&['lightning','says'].includes(r.game)&&now>=r.deadline)&&r.phase==='review')return store(r.game==='memory'?memory(r,now,random):question(r,now,random));
 if(r.phase!=='play')return p;
 const timeout=now>=r.deadline;
 if(cmd.action==='tick'&&!timeout)return p;
 if(cmd.action!=='answer'&&cmd.action!=='tick')return p;
 const hand=cmd.action==='answer'&&!timeout?cmd.hand:null;
 const correct=r.game==='says'?hand===(r.valid?r.target:'hold'):r.game==='sensei'?hand===r.target:r.game==='memory'?hand===r.sequence[r.attempts]:hand!==null&&hand!=='hold'&&beats(hand,r.target);
 const draw=duels(r.game)&&hand===r.target;
 r={...r,senseiGuesses:r.game==='sensei'?[...r.senseiGuesses,{hand:hand==='hold'?null:hand,target:r.target}]:r.senseiGuesses,turn:r.turn+1,attempts:r.attempts+1,score:r.score+Number(correct&&r.game!=='memory'),errors:r.errors+Number(!correct&&!draw),reactionTotal:r.reactionTotal+Math.max(0,now-r.opened),reactions:r.reactions+1,deadline:now+900,phase:'review',feedback:`${timeout?'Time expired. ':''}${draw?'Draw — no points.':correct?'Correct!':'Incorrect.'} ${r.game==='memory'?'':`Target: ${r.target}.`}`};
 if(r.game==='memory'){
  if(!correct)return finish(false,r);
  if(r.attempts<r.sequence.length)return store({...r,phase:'play',opened:now,deadline:now+20000});
  r={...r,score:r.score+1};if(r.score===4)return finish(true,r);return store({...r,feedback:'Sequence complete. Continue for a longer sequence.'});
 }
 if(duels(r.game)){
  const history=hand&&hand!=='hold'?[...r.history,hand].slice(-5):r.history;
  const noRepeat=r.noRepeat&&(!hand||hand==='hold'||!r.history.includes(hand));
  r={...r,history,noRepeat,player:r.player+Number(correct),rival:r.rival+Number(!correct&&!draw)};
  const needed=r.game==='frenzy'?2:3;
  if(r.rival>=needed)return finish(false,r);
  if(r.player>=needed){r={...r,wins:r.wins+1,player:0,rival:0,feedback:'Match won. Continue to the next opponent.'};
   if(r.game==='shadow'||r.game==='frenzy'&&r.wins===5||r.game==='trial'&&r.wins===3)return finish(true,r);
   if(r.game==='grandmaster'&&r.wins===9)return pay(store(r),r,now);
  }return store(r);
 }
 if(r.game==='dummy'){if(r.score>=10)return finish(true,r);return store(question(r,now,random));}
 if(r.game==='balance'){if(r.errors>=3)return finish(false,r);if(r.score>=8)return finish(true,r);}
 if(r.game==='sensei'&&r.attempts===5)return finish(r.score>=3,r);
 if(r.game==='lightning'&&r.attempts===12)return finish(r.score>=9,r);
 if(r.game==='says'&&r.attempts===12)return finish(r.score>=10,r);
 return store(r);
}
