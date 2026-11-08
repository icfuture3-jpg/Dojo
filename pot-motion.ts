export type PotMotionMode = 'throw' | 'jump' | 'chop';
export const MOTION_MS = 3600;
export const CONTACT = { throw: .64, jump: .56, chop: .72 } as const;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
function stage(t:number,a:number,b:number){return clamp((t-a)/(b-a));}
export function potMotion(mode:PotMotionMode,progress:number){
 const t=clamp(progress), airborne=mode==='jump';
 const extension=airborne?Math.min(stage(t,.08,.36),1-stage(t,.78,1)):0;
 const travel=airborne?(t<.56?stage(t,0,.56):t<.74?1:1-stage(t,.74,1)):mode==='chop'?Math.min(stage(t,0,.48),1-stage(t,.9,1)):0;
 const arm=mode==='throw'?(t<.28?65*stage(t,0,.28):t<.44?65-165*stage(t,.28,.44):t<.72?-100:-100*(1-stage(t,.72,1))):mode==='chop'?(t<.5?0:t<.6?-155*stage(t,.5,.6):t<.72?-155+60*stage(t,.6,.72):t<.84?-95:-95*(1-stage(t,.84,1))):-65*extension;
 const walkEnd=mode==='throw'?.28:.48;
 const walk=!airborne&&t<walkEnd?Math.sin(t/walkEnd*Math.PI*6)*22:0;
 const throwTravel=Math.min(stage(t,0,.28),1-stage(t,.8,1));
 const rockT=stage(t,.44,.64);
 return {x:mode==='throw'?80*throwTravel:mode==='jump'?228*travel:218*travel,y:airborne?-100*travel-65*Math.sin(Math.PI*travel):0,
  torso:-20*extension,rightLeg:-90*extension+(airborne?0:-walk),leftLeg:65*extension+walk,leftArm:airborne?70*extension:-walk*.5,rightArm:arm,
  rockX:292+138*rockT,rockY:210-60*rockT-65*Math.sin(Math.PI*rockT),rockVisible:mode==='throw'&&t>=.44&&t<.67,airborne:airborne&&t>.06&&t<.96};
}
