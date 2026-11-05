import { EnergyRibbons } from "./cinematic-art";
import { useEffect, useRef, type ReactNode } from 'react';
import type { Item } from './economy';
export const FINISHER_MOTIONS = [
 '0%,100%{transform:rotate(0)}50%{transform:rotate(25deg)}',
 '0%{transform:rotateY(0)}100%{transform:rotateY(720deg)}',
 '0%,45%,100%{transform:translateY(0)}30%{transform:translateY(-35px)}50%{transform:translateY(12px) scaleY(.9)}',
 '0%,100%{transform:translateY(0)}50%{transform:translateY(-95px) rotate(-15deg)}',
 '0%,100%{transform:translateX(0)}30%{transform:translateX(-110px)}65%{transform:translateX(110px)}',
 '0%,100%{transform:scale(1)}50%{transform:scale(.85) translateY(25px)}',
 '0%{transform:rotate(0)}50%{transform:rotate(360deg) translateY(-40px)}100%{transform:rotate(720deg)}',
 '0%,100%{transform:translateX(0)}40%{transform:translateX(-30px) rotate(-15deg)}60%{transform:translateX(65px) rotate(20deg)}',
 '0%,100%{transform:rotate(0)}35%{transform:rotate(-12deg) translateY(-20px)}65%{transform:rotate(12deg) translateY(-20px)}',
 '0%,100%{transform:scale(1)}40%{transform:scale(1.12) translateY(-15px)}70%{transform:scale(1.12) rotate(-8deg)}',
 '0%,100%{transform:translateX(0)}25%{transform:translateX(-35px) rotate(-10deg)}75%{transform:translateX(35px) rotate(10deg)}',
 '0%,100%{transform:scale(1)}45%{transform:scale(.65)}65%{transform:scale(1.3) translateY(-30px)}',
];
export function FinisherScene({item,avatar,onDone}:{item:Item;avatar:ReactNode;onDone():void}){
 const index=Number(item.id.split('-')[1]);
 const done=useRef(onDone);done.current=onDone;
 useEffect(()=>{const id=setTimeout(()=>done.current(),4200);return()=>clearTimeout(id);},[]);
 return <div className="activity-panel cinematic-finisher" role="dialog" aria-label={`${item.name} finisher`} style={{position:'absolute',inset:0,zIndex:160,background:'radial-gradient(ellipse, #243b57, #100c19)',color:'#fff6dc',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:20,overflow:'hidden',pointerEvents:'auto'}}>
 <style>{`@keyframes equippedFinisher{${FINISHER_MOTIONS[index]}} @keyframes finisherBurst{0%{transform:scale(.3);opacity:0}40%{opacity:.8}100%{transform:scale(1.5);opacity:0}}`}</style>
 <EnergyRibbons active/>
 <h2 style={{zIndex:1}}>{item.name}</h2><div style={{position:'relative',width:300,height:330,display:'flex',justifyContent:'center',alignItems:'flex-end'}}>
 <svg width="340" height="340" viewBox="0 0 340 340" style={{position:'absolute',left:-20,top:0,animation:'finisherBurst 2s ease-out infinite'}}>{Array.from({length:6+index},(_,i)=><path key={i} d="M170 35L180 100L170 85L160 100Z" fill={item.color} transform={`rotate(${i*360/(6+index)} 170 170)`}/>)}</svg>
 <div style={{animation:'equippedFinisher 2s ease-in-out 2',transformOrigin:'50% 90%'}}>{avatar}</div></div>
 <div>Your equipped finishing move</div><button type="button" style={{padding:'10px 24px',fontSize:18}} onClick={onDone}>CONTINUE</button></div>;
}
