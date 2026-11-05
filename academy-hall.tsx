import { useEffect, useState, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import type { Profile } from './economy';
import type { DojoEvent } from './net';
import { ACADEMY, academyDay, academyOpponent, beltInfo, dailyAcademy } from './academy';
import { playableAcademyIds, type AcademyId } from './academy-state';
import { MOVES, MOVE_ICON } from './rps';
import { Coin } from './catalog-art';
import './academy.css';
import { PredictionSymbol, SenseiPrediction } from './sensei-prediction';
const duelIds=['frenzy','shadow','trial','grandmaster'];
export function AcademyHall({p,dispatch,onExit,onSound,fighter}:{p:Profile;dispatch(e:DojoEvent):void;onExit():void;onShop():void;onSound():void;fighter(master:'self'|'Bao'|'Mei'):ReactNode}){
 const [clock,setClock]=useState(Date.now());
 const a=p.academy,r=a.run;
 const hall=useRef<HTMLElement>(null),begun=!!r&&r.phase!=='ready';
 useEffect(()=>{if(hall.current)hall.current.scrollTop=0;},[r?.id,begun]);
 const send=(data:unknown)=>dispatch({type:'dojo.send',message:{send:emit=>emit('academy',data)}});
 const act=(action:string,extra:Record<string,unknown>={})=>{if(r)send({action,id:r.id,turn:r.turn,...extra});};
 const start=(game:AcademyId)=>send({action:'start',id:crypto.randomUUID(),game,difficulty:1,playImmediately:true});
 useEffect(()=>{if(!r)return;const id=setInterval(()=>{setClock(Date.now());act('tick');},100);return()=>clearInterval(id);},[r?.id,r?.turn,r?.phase]);
 useEffect(()=>{const hide=()=>{if(document.hidden&&r&&['play','watch','review'].includes(r.phase))act('pause');};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[r?.id,r?.turn,r?.phase]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.repeat||e.ctrlKey||e.metaKey||e.altKey||(e.target as HTMLElement)?.matches?.('input,select,textarea'))return;
 const index=['1','2','3'].indexOf(e.key);const hand=index>=0?MOVES[index]:({r:'rock',p:'paper',s:'scissors'} as const)[e.key.toLowerCase() as 'r'|'p'|'s'];
 if(r?.phase==='play'&&(hand||e.code==='Space')){e.preventDefault();act('answer',{hand:hand??'hold'});if(p.audio.sfx>0)onSound();}
 if(e.key==='Escape'&&r){e.preventDefault();act(r.phase==='paused'?'resume':'pause');}
 };window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[r,p.audio.sfx]);
 const belt=beltInfo(a.xp),day=academyDay(clock);
 const leave=()=>{if(r)act('exit');onExit();};
 const choose=(hand:string)=>{act('answer',{hand});if(p.audio.sfx>0)onSound();};
 const content=<section ref={hall} className={`expansion-screen academy-hall academy-decor-${a.decoration}${begun?' academy-running':''}${r?.game==='sensei'?' academy-sensei':''}`} aria-label="Training Hall">
 <header className="expansion-header"><div><p className="eyebrow">THREE HANDS MARTIAL ARTS ACADEMY</p><h1>TRAINING HALL</h1></div><button onClick={leave}>BACK TO DOJO</button></header>
 <div className="academy-status"><span style={{borderColor:belt.current[3]}}>{belt.current[0]} Belt · {belt.current[1]}</span><span>{a.xp} Academy XP</span><span><Coin/> {p.coins}</span><button aria-label="Toggle academy sound effects" onClick={()=>dispatch({type:'dojo.send',message:{send:emit=>emit('audio',{...p.audio,sfx:p.audio.sfx>0?0:1})}})}>{p.audio.sfx>0?'MUTE EFFECTS':'UNMUTE EFFECTS'}</button></div>
 {!r&&<p className="academy-belt-progress">{belt.next?`${belt.next[2]-a.xp} XP to ${belt.next[0]} Belt`:'Black Belt achieved'}</p>}
 <p className="expansion-note">Academy belts and records are separate from your original level and ranked combat. Progress saves on this device. No global rankings.</p>
 {!r?<><h2>PLAY A MINI-GAME</h2><div className="academy-grid">{playableAcademyIds.map((id,i)=><article key={id} data-academy-game={id}><div className="academy-card-mark" aria-hidden="true">{MOVE_ICON[MOVES[i%3]!]}</div><h2>{i+1}. {ACADEMY[id].name}</h2><p>{ACADEMY[id].instructions}</p>{dailyAcademy(clock).includes(id)&&<p className="academy-daily-badge">{a.daily.includes(`${day}:${id}`)?'DAILY BONUS SAVED':'DAILY BONUS: +25 coins · +20 XP'}{id==='shadow'?' · No repeated hands':''}</p>}<p><Coin/> {ACADEMY[id].coins} coins · {ACADEMY[id].xp} academy XP{id==='grandmaster'?' at 9 victories':''}</p><p>Completions: {a.clears[id]??0} · Best: {a.records[id]??0}</p>{id==='lightning'&&<p>Best completed accuracy: {a.records.lightningAccuracy??0}% · Best mean reaction: {a.records.lightningReactionMs??0} ms</p>}<button onClick={()=>start(id)}>PLAY: {ACADEMY[id].name.toUpperCase()}</button></article>)}</div>{a.unlocks.length>0&&<details className="academy-equipment"><summary>TRAINING EQUIPMENT</summary><p>Earned hall styles, hand trails and training characters. Your saved appearance is unchanged.</p><div className="academy-grid">{[
 ['decoration','lanterns','1 game · Lantern-lit hall'],['animation','gold','2 games · Golden hand trail'],['decoration','bamboo','3 games · Bamboo courtyard'],['master','Bao','4 games · Train as Bao'],['animation','cyan','6 games · Cyan hand trail'],['master','Mei','8 games · Train as Mei'],
 ].filter(([,value])=>a.unlocks.includes(value!)).map(([slot,value,label])=><article key={value}><h3>{label}</h3><button onClick={()=>send({action:'equip',slot,value})}>{a[slot as 'decoration'|'animation'|'master']===value?'EQUIPPED':'EQUIP'}</button></article>)}</div><button onClick={()=>{send({action:'equip',slot:'decoration',value:'plain'});send({action:'equip',slot:'animation',value:'plain'});send({action:'equip',slot:'master',value:'self'});}}>USE ORIGINAL LOOK AND HALL</button></details>}
 </>:<><h2>{ACADEMY[r.game].name}</h2><p>{ACADEMY[r.game].instructions}</p>
 <div className="academy-play-grid">{r.game!=='sensei'&&<div className="academy-avatar" aria-label="Academy training character">{fighter(a.master)}</div>}<div className="academy-play-area">
 {duelIds.includes(r.game)&&<h3>{academyOpponent(r)} · Match {r.wins+1}</h3>}
 <div className="academy-metrics"><span>Correct: {r.score}</span><span>Errors: {r.errors}</span>{duelIds.includes(r.game)&&<span>Score: {r.player}–{r.rival} · Victories: {r.wins}</span>}{r.game==='balance'&&<span>Lives: {Math.max(0,3-r.errors)}</span>}{r.game==='lightning'&&<span>Accuracy: {r.attempts?Math.round(r.score/r.attempts*100):0}% · Mean reaction: {r.reactions?Math.round(r.reactionTotal/r.reactions):0} ms</span>}</div>
 {r.game==='sensei'&&r.phase!=='paused'&&<SenseiPrediction run={r} clock={clock} fighter={fighter} master={a.master}/>}
 {r.phase==='ready'?<><p>Controls: 1 / 2 / 3 or R / P / S select Rock / Paper / Scissors. Space = HOLD for deceptive commands. Escape pauses. Leaving abandons an unfinished attempt without a reward.</p><button onClick={()=>act('begin')}>BEGIN TRAINING</button></>:null}
 {['play','watch','review'].includes(r.phase)&&<>
 {r.phase!=='review'&&<p className="academy-clock">{r.game==='dummy'?'Total time':'Time'}: {Math.max(0,((r.game==='dummy'?r.totalDeadline:r.deadline)-clock)/1000).toFixed(1)}s</p>}
 {r.game!=='sensei'&&<div className={`academy-target academy-trail-${a.animation}`} key={`${r.id}-${r.turn}`}>
 {r.game==='dummy'&&<svg viewBox="0 0 180 190" aria-label="Wooden training dummy"><path d="M90 35V160M35 80H145M55 178L90 130L125 178" stroke="#9b6036" strokeWidth="24" strokeLinecap="round"/><circle cx="90" cy="38" r="30" fill="#b98750" stroke="#59391e" strokeWidth="5"/><path d="M70 30H110M70 45H110" stroke="#e9b574"/></svg>}
 {r.game==='balance'&&<div className="academy-bridge" aria-label={`Bridge progress ${r.score} of 8`}>{Array.from({length:8},(_,i)=><span key={i} className={r.score>i?'crossed':''}>{r.score>i?'✓':''}</span>)}</div>}
 {r.game==='memory'?<div><p>{r.phase==='watch'?'WATCH':'REPEAT'} · length {r.sequence.length} · {r.attempts} entered</p>{r.phase==='watch'?<div className="academy-sequence">{r.sequence.map((hand,i)=><span key={i} className={clock-r.opened>=i*1000&&clock-r.opened<(i+1)*1000?'lit':''}>{MOVE_ICON[hand]}</span>)}</div>:<strong>{r.phase==='review'?'Sequence complete':'?  ?  ?'}</strong>}</div>:duelIds.includes(r.game)?<strong>{r.phase==='review'?`Rival threw ${MOVE_ICON[r.target]}`:'Opponent’s hand is hidden'}</strong>:r.game==='says'?<strong>{r.valid?'Master says:':'A voice calls:'} show {MOVE_ICON[r.target]}</strong>:<strong className="academy-hand">{MOVE_ICON[r.target]}</strong>}
 </div>}
 {r.phase==='play'&&<div className="academy-hands" aria-label={r.game==='sensei'?'Predict Sensei’s hand':'Choose a hand'}>{MOVES.map((hand,i)=><button key={hand} onClick={()=>choose(hand)}>{r.game==='sensei'?<PredictionSymbol hand={hand}/>:MOVE_ICON[hand]} {hand.toUpperCase()} ({i+1})</button>)}{r.game==='says'&&<button onClick={()=>choose('hold')}>HOLD (SPACE)</button>}</div>}
 {r.phase==='review'&&<button onClick={()=>act('next')}>{r.game==='sensei'?'NEXT SEAL →':'CONTINUE TRAINING'}</button>}
 <button onClick={()=>act('pause')}>PAUSE</button>
 </>}
 {r.phase==='paused'&&<><h3>TRAINING PAUSED</h3><p>Timers are stopped. Your attempt is saved.</p><button onClick={()=>act('resume')}>RESUME</button></>}
 {['won','lost'].includes(r.phase)&&<><h3>{r.phase==='won'?'TRAINING COMPLETE':'TRY AGAIN'}</h3><p>{r.paid?`${ACADEMY[r.game].coins} coins and ${ACADEMY[r.game].xp} academy XP saved; any daily bonus is already included in your balance.`:'No completion reward.'}</p>{r.game==='lightning'&&<p>Accuracy {Math.round(r.score/12*100)}% · Average reaction {r.reactions?Math.round(r.reactionTotal/r.reactions):0} ms</p>}<button onClick={()=>{act('exit');start(r.game);}}>PLAY AGAIN</button></>}
 {r.game!=='sensei'&&<p role="status">{r.feedback}</p>}{r.game==='grandmaster'&&r.paid&&<p>250-coin milestone saved. Keep going for your record!</p>}
 </div></div><div className="academy-nav"><button onClick={()=>{act('exit');start(r.game);}}>RESTART ATTEMPT</button><button onClick={()=>act('exit')}>EXIT TO TRAINING HALL</button></div></>}
 </section>;
 return typeof document==='undefined'?content:createPortal(content,document.body);
}
