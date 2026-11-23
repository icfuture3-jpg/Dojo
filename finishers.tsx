import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import type { Item } from './economy';
import './finishers.css';
import { prepareThunder } from './thunder';

// Each channel drives an actual joint on the saved Fighter, in its 200×300 viewBox.
// 0–22% anticipate, 22–44% execute, 44–72% hold, 72–100% recover.
type Pose = { body?: string; upper?: string; leftArm?: string; rightArm?: string; leftLeg?: string; rightLeg?: string };
type Choreography = { action: string; cue: string; effect: string; windup: Pose; strike: Pose };
export const FINISHER_CHOREOGRAPHY: readonly Choreography[] = [
 {action:'Plant both feet, bend deeply at the waist, hold the bow, then rise with respect.',cue:'BOW WITH RESPECT',effect:'halo',
  windup:{leftArm:'rotate(-8deg)',rightArm:'rotate(8deg)'},strike:{upper:'perspective(450px) rotateX(-60deg)',leftArm:'rotate(-8deg)',rightArm:'rotate(8deg)'}},
 {action:'Wind up, spin twice with arms sweeping outward, then land in a dragon stance.',cue:'DRAGON SPIN',effect:'dragon',
  windup:{body:'rotate(-18deg)',leftArm:'rotate(-35deg)',rightArm:'rotate(35deg)'},strike:{body:'rotateY(720deg)',leftArm:'rotate(100deg)',rightArm:'rotate(-100deg)',rightLeg:'rotate(-22deg)'}},
 {action:'Lift the right foot high, drive it into the mat, and summon lightning and thunder as the foot lands.',cue:'THUNDER STOMP',effect:'shockwave',
  windup:{rightLeg:'translateY(-48px) rotate(-30deg)',leftArm:'rotate(45deg)',rightArm:'rotate(-100deg)'},strike:{body:'translateY(8px)',rightLeg:'rotate(-18deg)',leftLeg:'rotate(12deg)',leftArm:'rotate(-25deg)',rightArm:'rotate(25deg)'}},
 {action:'Crouch, leap upward with arms spread like phoenix wings, then land softly.',cue:'PHOENIX RISE',effect:'wings',
  windup:{body:'translateY(20px) scaleY(.88)',leftArm:'rotate(-25deg)',rightArm:'rotate(25deg)'},strike:{body:'translateY(-100px)',leftArm:'rotate(125deg)',rightArm:'rotate(-125deg)',leftLeg:'rotate(20deg)',rightLeg:'rotate(-35deg)'}},
 {action:'Coil low, dash across the stage in a shadow trail, then brake into a low stance.',cue:'SHADOW DASH',effect:'trail',
  windup:{body:'translateX(-65px) translateY(12px)',upper:'skewX(-12deg)',leftArm:'rotate(-50deg)'},strike:{body:'translateX(85px) translateY(8px)',upper:'skewX(15deg)',leftArm:'rotate(65deg)',rightArm:'rotate(60deg)',leftLeg:'rotate(35deg)',rightLeg:'rotate(-40deg)'}},
 {action:'Lower into a seated lotus, cross both legs, and rest your hands over your knees.',cue:'STILL AS THE LOTUS',effect:'lotus',
  windup:{body:'translateY(20px)',leftLeg:'rotate(-25deg)',rightLeg:'rotate(25deg)'},strike:{body:'translateY(58px)',leftLeg:'rotate(-72deg)',rightLeg:'rotate(72deg)',leftArm:'rotate(25deg)',rightArm:'rotate(-25deg)'}},
 {action:'Wind up, spin through a full turn with the right leg extended in a high kick, then set it down.',cue:'CYCLONE KICK',effect:'arc',
  windup:{upper:'rotate(-12deg)',rightLeg:'translateY(-20px) rotate(-35deg)',leftArm:'rotate(50deg)'},strike:{body:'translateY(-25px) rotateY(360deg)',rightLeg:'rotate(-105deg)',leftArm:'rotate(65deg)',rightArm:'rotate(35deg)'}},
 {action:'Draw your right fist back, lunge forward, and drive a straight punch into a meteor impact.',cue:'METEOR PUNCH',effect:'meteor',
  windup:{body:'translateX(-35px)',upper:'rotate(-8deg)',rightArm:'rotate(40deg)',leftArm:'rotate(-50deg)'},strike:{body:'translateX(55px)',upper:'rotate(12deg)',rightArm:'rotate(-100deg)',leftArm:'rotate(-35deg)',leftLeg:'rotate(18deg)',rightLeg:'rotate(-25deg)'}},
 {action:'Shift onto one leg, lift the opposite leg, and hold your arms wide in a crane balance.',cue:'CRANE BALANCE',effect:'halo',
  windup:{body:'translateX(-12px)',rightLeg:'translateY(-20px)'},strike:{body:'translateX(-12px)',rightLeg:'translateY(-44px) rotate(-65deg)',leftArm:'rotate(110deg)',rightArm:'rotate(-110deg)'}},
 {action:'Stand tall and raise both fists overhead in a triumphant victory salute.',cue:'VICTORY!',effect:'rays',
  windup:{leftArm:'rotate(-35deg)',rightArm:'rotate(35deg)'},strike:{body:'translateY(-8px)',leftArm:'rotate(165deg)',rightArm:'rotate(-165deg)'}},
 {action:'Gather energy at your chest, then sweep your open right hand outward to send a jade wave.',cue:'JADE WAVE',effect:'wave',
  windup:{leftArm:'rotate(-48deg)',rightArm:'rotate(48deg)',upper:'rotate(-5deg)'},strike:{rightArm:'rotate(-90deg)',leftArm:'rotate(-45deg)',upper:'rotate(8deg)',rightLeg:'rotate(-15deg)'}},
 {action:'Crouch inward, then spring open with arms and legs spread into a five-point star.',cue:'STARBURST',effect:'star',
  windup:{body:'translateY(20px) scale(.9)',leftArm:'rotate(-40deg)',rightArm:'rotate(40deg)'},strike:{body:'translateY(-65px)',leftArm:'rotate(135deg)',rightArm:'rotate(-135deg)',leftLeg:'rotate(32deg)',rightLeg:'rotate(-32deg)'}},
];
const CHANNELS = ['body','upper','leftArm','rightArm','leftLeg','rightLeg'] as const;
function motion(from: string, to: string) {
 return `0%,100%{transform:none}18%,22%{transform:${from}}44%,72%{transform:${to}}`;
}
// Retained for existing catalog consistency checks; now these are articulated timelines.
export const FINISHER_MOTIONS = FINISHER_CHOREOGRAPHY.map(move => CHANNELS.map(channel => motion(move.windup[channel] ?? 'none', move.strike[channel] ?? 'none')).join('\n'));
const DURATION = 5200;
export const STOMP_IMPACT_MS = DURATION * .44;

export function FinisherScene({item,avatar,onDone}:{item:Item;avatar:ReactNode;onDone():void}) {
 const index = Number(item.id.split('-')[1]);
 const move = FINISHER_CHOREOGRAPHY[index] ?? FINISHER_CHOREOGRAPHY[0]!;
 const done = useRef(onDone); done.current = onDone;
 const completed = useRef(false);
 const thunder = useRef<ReturnType<typeof prepareThunder> | null>(null);
 const finish = () => { thunder.current?.dispose(); if (!completed.current) { completed.current = true; done.current(); } };
 useEffect(() => {
  completed.current = false;
  const sound = item.id === 'finisher-2' ? prepareThunder() : null;
  thunder.current = sound;
  const impact = sound ? setTimeout(() => { if (!completed.current) sound.strike(); }, STOMP_IMPACT_MS) : null;
  const id = setTimeout(() => { if (!completed.current) { completed.current = true; done.current(); } }, DURATION);
  return () => { clearTimeout(id); if (impact !== null) clearTimeout(impact); sound?.dispose(); thunder.current = null; };
 }, [item.id]);
 const styles = Object.fromEntries(CHANNELS.flatMap(channel => [[`--${channel}-windup`,move.windup[channel] ?? 'none'],[`--${channel}-strike`,move.strike[channel] ?? 'none']])) as CSSProperties;
 return <section className="activity-panel cinematic-finisher finisher-scene" role="dialog" aria-label={`${item.name} finisher`}>
  <div className="finisher-spotlight" aria-hidden="true"/>
  <header><p className="finisher-eyebrow">THE THREE HANDS · FINISHING ART</p><h2>{item.name}</h2></header>
  <div key={item.id} className="finisher-choreography" data-finisher={item.id} style={{...styles,'--finisher-color':move.effect === 'wave' ? '#00a86b' : item.color,'--stomp-impact-delay':`${STOMP_IMPACT_MS}ms`} as CSSProperties}>
   <div className="finisher-mat" aria-hidden="true"/>
   <div className={`finisher-effect finisher-effect-${move.effect}`} aria-hidden="true">
    <svg viewBox="0 0 520 380" preserveAspectRatio="xMidYMid meet">
     {move.effect === 'dragon' && <path d="M70 270Q0 80 230 60Q470 20 470 200Q480 310 275 300L320 265L270 235L350 225"/>}
     {move.effect === 'shockwave' && <><ellipse cx="260" cy="325" rx="210" ry="30"/><path d="M60 340L180 320L140 302M460 340L340 320L380 302M260 330L245 355L270 365"/></>}
     {move.effect === 'wings' && <><path d="M255 240Q80 220 35 70L140 130L100 55L230 165M265 240Q440 220 485 70L380 130L420 55L290 165"/></>}
     {move.effect === 'trail' && <path d="M20 160H210M45 205H240M10 250H190M75 290H265"/>}
     {move.effect === 'lotus' && <path d="M260 320Q150 260 180 220Q240 225 260 300Q280 225 340 220Q370 260 260 320ZM260 320Q100 330 95 270Q190 250 260 320Q330 250 425 270Q420 330 260 320Z"/>}
     {move.effect === 'arc' && <path d="M100 270Q40 20 310 40Q490 60 445 245M110 260Q60 40 310 60"/>}
     {move.effect === 'meteor' && <><path d="M280 180L400 150M300 220L420 200M420 150L430 115L440 150L490 140L455 175L495 205L445 200L435 245L415 200L375 215L400 180Z"/></>}
     {move.effect === 'wave' && <path d="M300 240Q360 80 425 130Q490 190 420 275M335 250Q390 125 435 180M360 280Q480 230 485 150"/>}
     {(move.effect === 'rays' || move.effect === 'star') && Array.from({length:8},(_,i)=><path key={i} d="M260 20L268 65L260 85L252 65Z" transform={`rotate(${i*45} 260 180)`}/>)}
     {move.effect === 'halo' && <><circle cx="260" cy="185" r="145"/><circle cx="260" cy="185" r="165" strokeDasharray="12 22"/></>}
    </svg>
   </div>
   {item.id === 'finisher-2' && <svg className="finisher-thunder" aria-hidden="true" viewBox="0 0 520 380">
    <g className="thunder-clouds"><path d="M75 65Q55 30 95 25Q115 0 150 25Q190 10 205 45Q220 70 185 75H95ZM315 50Q300 15 340 15Q365 -5 390 20Q435 5 440 40Q475 65 430 75H340Z"/></g>
    <g className="thunder-bolts"><path d="M155 72L118 146L153 138L110 244L186 133L151 143L193 72ZM365 72L332 148L365 138L325 244L402 133L367 143L407 72Z"/></g>
    <g className="thunder-ground"><path d="M310 325L285 295L312 305L300 265L340 310L325 305L350 330M300 330L245 345L275 350M335 330L380 345L365 355"/><ellipse cx="320" cy="332" rx="95" ry="15"/></g>
   </svg>}
   <div className="finisher-performer">{avatar}</div>
   <strong className="finisher-cue" aria-hidden="true">{move.cue}</strong>
  </div>
  <p className="finisher-action">{move.action}</p>
  <button type="button" autoFocus onClick={finish}>CONTINUE</button>
 </section>;
}
