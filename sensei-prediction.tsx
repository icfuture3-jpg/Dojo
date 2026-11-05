import type { ReactNode } from 'react';
import type { AcademyRun } from './academy-state';
import { academyWindow, clues } from './academy';
import type { Move } from './rps';
import './sensei-prediction.css';

/** Drawn symbols stay readable even on devices without emoji fonts. */
export function PredictionSymbol({hand}:{hand:Move|null}) {
 return <svg viewBox="0 0 100 100" aria-hidden="true">
  {hand==='rock'?<><path d="M15 66L23 32L49 18L78 29L89 62L66 84L32 82Z" fill="#a2b9c5" stroke="#263b4b" strokeWidth="5"/><path d="M23 32L48 53L78 29M48 53L66 84M48 53L15 66" fill="none" stroke="#536c80" strokeWidth="4"/></>:hand==='paper'?<><path d="M25 16Q50 28 78 17L72 80Q47 70 21 85Z" fill="#fff0bd" stroke="#b99247" strokeWidth="4"/><path d="M35 37L64 39M33 49L62 51M31 61L54 63" stroke="#ba8e43" strokeWidth="4"/></>:hand==='scissors'?<><path d="M34 64L74 17L55 66M61 67L28 16L42 68" fill="#dae9ed" stroke="#658a9b" strokeWidth="4"/><circle cx="32" cy="76" r="13" fill="none" stroke="#ef7854" strokeWidth="8"/><circle cx="64" cy="77" r="13" fill="none" stroke="#ef7854" strokeWidth="8"/><circle cx="48" cy="59" r="5" fill="#ffda86"/></>:<><circle cx="50" cy="50" r="37" fill="#172e3f" stroke="#f2d083" strokeWidth="3"/><text x="50" y="68" textAnchor="middle" fill="#ffe4a2" fontSize="54" fontFamily="Georgia">?</text></>}
 </svg>;
}

export function SenseiPrediction({run:r,clock,fighter,master}:{run:AcademyRun;clock:number;fighter(master:'self'|'Bao'|'Mei'):ReactNode;master:'self'|'Bao'|'Mei'}) {
 const revealed=['review','won','lost'].includes(r.phase), last=r.senseiGuesses.at(-1);
 const hit=!!last&&last.hand===last.target;
 const legacyTurns=r.attempts-r.senseiGuesses.length;
 const seconds=Math.max(0,(r.deadline-clock)/1000);
 const progress=Math.max(0,Math.min(1,seconds*1000/academyWindow(r)));
 return <div className={`sensei-challenge ${revealed?hit?'sensei-hit':'sensei-miss':'sensei-reading'}`}>
  <div className="sensei-round"><strong>SEAL {Math.min(5,r.attempts+(revealed?0:1))} / 5</strong><span>Light 3 lanterns to win</span></div>
  <div className="sensei-lanterns" aria-label={`${r.score} of 3 lanterns needed; ${r.attempts} of 5 predictions made`}>
   {Array.from({length:5},(_,i)=>{const guess=r.senseiGuesses[i-legacyTurns],legacy=i<legacyTurns;return <span key={i} className={`sensei-lantern ${guess?guess.hand===guess.target?'is-lit':'is-missed':legacy?'is-past':''}`} aria-label={`Prediction ${i+1}: ${guess?guess.hand===guess.target?'correct':'missed':legacy?'completed before update':'unplayed'}`}>{guess?guess.hand===guess.target?<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12L10 17L20 6" fill="none" stroke="currentColor" strokeWidth="3"/></svg>:'×':legacy?'·':i+1}</span>;})}
  </div>
  <div className="sensei-arena" key={`${r.id}-${r.attempts}-${revealed}`}>
   <div className="sensei-figure sensei-student"><div className="sensei-model">{fighter(master)}</div><span>YOU</span></div>
   <div className="sensei-energy" aria-hidden="true"/>
   <div className="sensei-seal"><PredictionSymbol hand={revealed?r.target:null}/></div>
   {revealed&&<div className="sensei-sparks" aria-hidden="true">{Array.from({length:8},(_,i)=><i key={i} style={{rotate:`${i*45}deg`}}/>)}</div>}
   <div className="sensei-figure sensei-master"><div className="sensei-model">{fighter('Bao')}</div><span>SENSEI</span></div>
  </div>
  {revealed?<div className="sensei-reveal" role="status">
   <strong>{!last?'HAND REVEALED':hit?'SEAL SHATTERED!':last.hand?'SENSEI FOOLED YOU!':'TOO SLOW!'}</strong>
   <div className="sensei-comparison">{last&&<span>Your prediction <PredictionSymbol hand={last.hand}/><b>{last.hand?.toUpperCase()??'NO GUESS'}</b></span>}<span>Sensei revealed <PredictionSymbol hand={r.target}/><b>{r.target.toUpperCase()}</b></span></div>
  </div>:r.phase==='play'?<>
   <div className={`sensei-fuse${seconds<=4?' is-urgent':''}`} role="progressbar" aria-label="Prediction time remaining" aria-valuemin={0} aria-valuemax={academyWindow(r)/1000} aria-valuenow={Math.round(seconds)}><span style={{width:`${progress*100}%`}}/></div>
   <p className="sensei-prompt">READ HIS MIND · MATCH, DON’T COUNTER</p>
   <ol className="sensei-clue-cards">{clues(r).map((clue,i)=><li key={clue}><b>{i+1}</b>{clue}</li>)}</ol>
  </>:<p className="sensei-prompt">Sensei is guarding five secret seals. Can you read his next move?</p>}
 </div>;
}
