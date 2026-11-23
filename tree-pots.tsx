import { createPortal } from "react-dom";
import { potMotion, MOTION_MS, CONTACT } from "./pot-motion";
import { useEffect, useRef, useState, type ReactNode } from 'react';
export type PotMode = 'throw' | 'jump' | 'chop';
export const POT_MODES: Record<PotMode,{name:string;instructions:string;action:string}> = {
 throw:{name:'Stone Throw',instructions:'Step toward the tree, wind up, and throw a stone at the hanging pot. Press Space or THROW when the white marker in the timing bar is inside the gold zone.',action:'THROW'},
 jump:{name:'Jump Strike',instructions:'Watch the white timing marker move across the bar below. Press Space or JUMP when it enters the gold zone to fly toward the pot with an extended dragon kick.',action:'JUMP'},
 chop:{name:'Timed Chop',instructions:'Walk up to the swinging pot, raise your hand, and chop down. Press Space or CHOP inside the gold zone to bring your hand down.',action:'CHOP'},
};
export function potHit(position:number){return position>=40 && position<=60;}
export function potSpeed(attempt:number){return 1+attempt*.2;}
export function potPosition(elapsedMs:number,attempt:number){return (1-Math.cos(elapsedMs*potSpeed(attempt)/700))*50;}
/** Keep the saved HTML/SVG fighter in an HTML layer, not an SVG foreignObject. */
export function PotFighter({avatar,mode,progress,moving}:{avatar:ReactNode;mode:PotMode;progress:number;moving:boolean}){
 const pose=potMotion(mode,moving?progress:0);
 return <div className={`pot-fighter-anchor pot-pose${pose.airborne&&moving?' pot-airborne':''}`} data-motion={moving?mode:'idle'} aria-label={moving?`${POT_MODES[mode].name} in motion`:'Challenge fighter'} style={{position:'absolute',left:`${(90+pose.x)/640*100}%`,top:`${(155+pose.y)/340*100}%`,width:'31.25%',aspectRatio:'2/3',transform:'scale(.55)',transformOrigin:'top left',pointerEvents:'none','--pot-torso':`${pose.torso}deg`,'--pot-right-leg':`${pose.rightLeg}deg`,'--pot-left-leg':`${pose.leftLeg}deg`,'--pot-right-arm':`${pose.rightArm}deg`,'--pot-left-arm':`${pose.leftArm}deg`} as import('react').CSSProperties}>{avatar}</div>;
}
export function TreePots({avatar,best,onSave,onExit}:{avatar:ReactNode;best:Record<PotMode,number>;onSave(mode:PotMode,hits:number):void;onExit():void}){
 const [mode,setMode]=useState<PotMode|null>(null);
 const [started,setStarted]=useState(false);
 const [attempt,setAttempt]=useState(0),[hits,setHits]=useState(0),[position,setPosition]=useState(0);
 const [action,setAction]=useState(0),[broken,setBroken]=useState(false),[busy,setBusy]=useState(false);
 const [feedback,setFeedback]=useState('');
 const [flight,setFlight]=useState(0);
 const motion=potMotion(mode??'throw',flight);
 const moving=busy;
 useEffect(()=>{
  if(!busy){setFlight(0);return;}
  let frame=0;const start=performance.now();
  const tick=(now:number)=>{const t=Math.min(1,(now-start)/MOTION_MS);setFlight(t);if(t<1)frame=requestAnimationFrame(tick);};
  frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);
 },[busy,mode,action]);

 const pos=useRef(0),epoch=useRef(performance.now()),lock=useRef(false),timer=useRef<ReturnType<typeof setTimeout>|null>(null),reported=useRef(false);
 useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
 useEffect(()=>{
  if(!started||attempt>=5||busy)return;
  epoch.current=performance.now();
  const id=setInterval(()=>{pos.current=potPosition(performance.now()-epoch.current,attempt);setPosition(pos.current);},16);
  return()=>clearInterval(id);
 },[started,attempt,busy]);
 useEffect(()=>{if(attempt===5&&mode&&!reported.current){reported.current=true;onSave(mode,hits);}},[attempt,mode,hits,onSave]);
 const strike=()=>{
  if(!mode||!started||attempt>=5||lock.current)return;
  lock.current=true;setBusy(true);setAction(a=>a+1);setBroken(false);
  const hit=potHit(pos.current);
  timer.current=setTimeout(()=>{setBroken(hit);setHits(h=>h+Number(hit));setFeedback(hit?'SPLASH! Clay shattered — water everywhere!':'Almost! Try the gold zone on the next pot.');
   timer.current=setTimeout(()=>{setAttempt(a=>a+1);lock.current=false;setBusy(false);setBroken(false);pos.current=0;setPosition(0);},MOTION_MS*(1-CONTACT[mode]));
  },MOTION_MS*CONTACT[mode]);
 };
 const strikeRef=useRef(strike);strikeRef.current=strike;
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if(e.code==='Space'&&mode&&started&&!e.altKey&&!e.ctrlKey&&!e.metaKey&&!(e.target instanceof HTMLElement&&(e.target.isContentEditable||e.target.closest('button,input,textarea,select')))){e.preventDefault();e.stopPropagation();if(!e.repeat)strikeRef.current();}};window.addEventListener('keydown',key,true);return()=>window.removeEventListener('keydown',key,true);},[mode,started]);
 const reset=(m:PotMode)=>{pos.current=0;epoch.current=performance.now();lock.current=false;setPosition(0);setFlight(0);setBusy(false);setMode(m);setStarted(false);setAttempt(0);setHits(0);setAction(0);setBroken(false);setFeedback('');reported.current=false;};
 const content=<div className="activity-panel pot-panel" role="dialog" aria-label="Tree Pot Challenge" style={{position:'fixed',inset:0,zIndex:450,overflowY:'auto',background:'#102b2c',color:'#fff5d5',fontFamily:'Georgia, serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',gap:12,padding:16,boxSizing:'border-box',pointerEvents:'auto'}}>
 <style>{`
 .pot-panel > *{flex-shrink:0}
 .pot-fighter-anchor>.cutout-fighter{width:100%!important;height:100%!important}
 .pot-fighter-anchor .fighter-art{width:100%;height:auto;max-width:none}
 .pot-pose .fighter-art{animation:none!important;transform-origin:50% 60%;transform:rotate(var(--pot-torso))}
 .pot-pose .fighter-right-leg{transform-origin:123px 210px;transform:rotate(var(--pot-right-leg))}
 .pot-pose .fighter-left-leg{transform-origin:77px 210px;transform:rotate(var(--pot-left-leg))}
 .pot-pose .fighter-right-arm{transform-origin:153px 112px;transform:rotate(var(--pot-right-arm))}
 .pot-pose .fighter-left-arm{transform-origin:47px 112px;transform:rotate(var(--pot-left-arm))}
 .pot-airborne .fighter-shadow{visibility:hidden}
 @keyframes waterBurst{from{opacity:1;transform:translate(0,0)}to{opacity:0;transform:translate(var(--x),var(--y))}}
 `}</style>
 <h2 style={{margin:0}}>TREE POT CHALLENGE{mode?` — ${POT_MODES[mode].name}`:''}</h2>
 {!mode?<><div>Three standalone challenges. Break water-filled clay pots hanging from the trees!</div>{(Object.keys(POT_MODES) as PotMode[]).map(m=><button key={m} style={{padding:14,minWidth:290,fontSize:20}} onClick={()=>reset(m)}>{POT_MODES[m].name} · Best {best[m]}/5</button>)}<button onClick={onExit}>BACK TO DOJO</button></>:<>
 <div style={{maxWidth:650,textAlign:'center'}}>{POT_MODES[mode].instructions}</div>
 <div style={{position:'relative',width:'min(640px, 95vw)',aspectRatio:'640/340',flexShrink:0,overflow:'hidden',border:'2px solid #8bba87',borderRadius:14,background:'linear-gradient(#84bdcb,#dce8b5)'}}>
 <svg viewBox="0 0 640 340" style={{position:'absolute',inset:0,width:'100%',height:'100%'}}>
 <path d="M0 290Q300 260 640 285V340H0Z" fill="#527e3c"/><path d="M535 310L518 80L548 50L568 310Z" fill="#79502e"/><path d="M540 85L330 65" stroke="#79502e" strokeWidth="20"/>
 {[350,420,500,570].map((x,i)=><ellipse key={x} cx={x} cy={45+i%2*12} rx="80" ry="42" fill={i%2?'#4c8b42':'#32713c'}/>)}
 <path d={mode==='chop'?"M430 70V185":"M430 70V125"} stroke="#785c38" strokeWidth="3"/>
 <g transform={mode==='chop'?`translate(${!moving?(position-50)*.6:0} 60)`:undefined}>
 {!broken?<><path d="M409 125H451L458 151Q464 177 445 185H415Q396 177 402 151Z" fill="#ba7140" stroke="#734326" strokeWidth="3"/><ellipse cx="430" cy="126" rx="21" ry="6" fill="#64c8ed"/><path d="M408 151H452M411 169H449" stroke="#e3b075" strokeWidth="3"/></>:<g aria-label="Clay pot bursts with water" transform="translate(430 150)">{Array.from({length:20},(_,i)=><path key={i} d={i%3===0?'M0 0L8 3L4 11Z':'M0 0Q-5 8 0 11Q5 8 0 0Z'} fill={i%3===0?'#b67344':'#53c5f4'} style={{'--x':`${(i%2?1:-1)*(20+i*4)}px`,'--y':`${-50+i*8}px`,animation:'waterBurst .85s ease-out forwards'} as import('react').CSSProperties}/>)}</g>}
 </g>
 {motion.rockVisible&&moving&&<g transform={`translate(${motion.rockX} ${motion.rockY})`} aria-label="Thrown stone"><circle r="10" fill="#657080" stroke="#39404b" strokeWidth="2"/></g>}
 {mode==='throw'&&!moving&&started&&<g transform={`translate(${300+position*2.6} 150)`} stroke="#9c342c" strokeWidth="2"><circle r="16" fill="none"/><path d="M-22 0H22M0-22V22"/></g>}
 </svg>
 <PotFighter avatar={avatar} mode={mode} progress={flight} moving={moving}/>
 </div>
 {!started?<button style={{padding:'14px 30px',fontSize:20}} onClick={()=>{setStarted(true);}}>START CHALLENGE</button>:<>
 <div>{attempt}/5 attempts · {hits} pots broken · Best {best[mode]}/5 · Speed {potSpeed(Math.min(attempt,4)).toFixed(1)}×</div>
 {attempt<5?<><div aria-label="Gold timing zone" style={{position:'relative',height:26,minHeight:26,flexShrink:0,width:'min(400px,80%)',background:'#324751',borderRadius:8,overflow:'hidden',border:'1px solid #9eb9c4'}}><div data-gold-zone style={{position:'absolute',left:'40%',width:'20%',height:'100%',background:'#e6bb42'}}/><div role="meter" aria-label="Timing indicator" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(position)} aria-valuetext={`${Math.round(position)} percent; gold target 40 to 60 percent`} style={{position:'absolute',left:`clamp(0px, ${position}%, calc(100% - 5px))`,height:'100%',width:5,background:'white',boxShadow:'0 0 0 1px #102b2c'}}/></div><button disabled={busy} style={{padding:'12px 35px',fontSize:22}} onClick={strike}>{busy?'…':`${POT_MODES[mode].action} — SPACE`}</button></>:<><strong>Challenge complete! Best score saved on this device.</strong><button onClick={()=>reset(mode)}>PLAY AGAIN</button></>}
 <div aria-live="polite">{feedback}</div></>}
 <button disabled={busy} onClick={()=>setMode(null)}>ALL THREE CHALLENGES</button><button disabled={busy} onClick={onExit}>BACK TO DOJO</button>
 </>}
 </div>;
 return typeof document==='undefined'?content:createPortal(content,document.body);
}
