import { EnergyRibbons } from "./cinematic-art";
import { useEffect, useRef, useState, createContext, useContext } from "react";
import type { CSSProperties, ReactNode } from "react";
import { RESCUES } from "./rescue";
import { SCENE_FLOOR, ScenicWall } from "./scenery";

// Short animated "little movies" shown before each dojo's match: students
// training or in class. Everything is SVG/CSS so it matches the HUD art.

const SHOT_MS = 3000;
const HTMLFocus=createContext(false);
const MoviePause=createContext({paused:false,reviewMs:null as number|null});

export function Fig({ x, y, s = 1, color, belt, anim, flip, delay = 0, sit, rightArmAngle, avatar, skin = "#e8c39e", hair, fem }: {
  rightArmAngle?:number; avatar?: ReactNode; skin?: string; hair?: string; fem?: boolean;
  x: number; y: number; s?: number; color: string; belt: string; anim?: string; flip?: boolean; delay?: number; sit?: boolean;
}) {
  const htmlFocus=useContext(HTMLFocus);
  if (avatar && htmlFocus) return null;
  if (avatar) {
    // Fit the full fighter between the letterbox bars, including hair and aura.
    const scale = s * 0.48;
    const motion = anim === "bow" ? "mvbow 2s ease-in-out infinite" : anim === "hop" ? "mvhop 1s ease-in-out infinite" : anim === "walk" ? "none" : "mvsway 2.4s ease-in-out infinite";
    return <g data-custom-fighter="true" transform={`translate(${x} ${y}) scale(${flip ? -scale : scale} ${scale})`}>
      <g style={{ animation: motion, transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        <foreignObject x="-130" y="-320" width="260" height="340" overflow="visible">
          <div style={{ padding: "20px 30px", width: 200, height: 300 }}>{avatar}</div>
        </foreignObject>
      </g>
    </g>;
  }
  const a = (name: string) => `${name} 1s ease-in-out ${delay}s infinite`;
  return (
    <g className="cutout-scene-figure" transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}>
      <ellipse cx="0" cy="2" rx="34" ry="6" fill="#0006" />
      <g style={{ animation: anim === "bow" ? `mvbow 2s ease-in-out ${delay}s infinite` : anim === "hop" ? a("mvhop") : anim === "sway" ? `mvsway 2.4s ease-in-out ${delay}s infinite` : "none", transformBox: "fill-box", transformOrigin: "50% 100%" }}>
        {sit ? (
          <path d="M-30 -2 Q0 -22 30 -2 L24 -12 L-24 -12 Z" fill={color} />
        ) : (
          <>
            <rect x="-17" y="-48" width="14" height="48" rx="5" fill={color} />
            <rect x="3" y="-48" width="14" height="48" rx="5" fill={color} style={anim === "kick" ? { animation: a("mvkick"), transformBox: "fill-box", transformOrigin: "50% 0" } : undefined} />
            <rect x="-19" y="-4" width="17" height="6" rx="3" fill="#222" />
            <rect x="2" y="-4" width="17" height="6" rx="3" fill="#222" />
          </>
        )}
        <rect x="-22" y={sit ? -62 : -100} width="44" height="56" rx="12" fill={color} />
        <rect x="-22" y={sit ? -62 : -100} width="44" height="56" rx="12" fill="#000" opacity="0.15" />
        <path d={`M-10 ${sit ? -62 : -100} L0 ${sit ? -40 : -78} L10 ${sit ? -62 : -100}`} stroke="#0006" strokeWidth="2" fill="none" />
        <rect x="-22" y={sit ? -36 : -74} width="44" height="7" fill={belt} />
        <circle cx="0" cy={sit ? -76 : -114} r="16" fill={skin} />
        {hair && <path d={`M-17 ${sit ? -78 : -116} Q-16 ${sit ? -96 : -134} 0 ${sit ? -96 : -134} Q16 ${sit ? -96 : -134} 17 ${sit ? -78 : -116} Q0 ${sit ? -88 : -126} -17 ${sit ? -78 : -116} Z`} fill={hair} />}
        {fem && !sit && <path d="M-22 -72 Q0 -66 22 -72 L32 -8 Q0 4 -32 -8 Z" fill={color} stroke="#0003" strokeWidth="1" />}
        <rect x="-16" y={sit ? -86 : -124} width="32" height="6" fill={belt} />
        <circle cx="-5" cy={sit ? -74 : -112} r="1.8" fill="#222" />
        <circle cx="5" cy={sit ? -74 : -112} r="1.8" fill="#222" />
        <path d={`M-4 ${sit ? -68 : -106} Q0 ${sit ? -65 : -103} 4 ${sit ? -68 : -106}`} stroke="#6a2d1d" strokeWidth="1.5" fill="none" />
        <g data-scene-arm="right" transform={rightArmAngle===undefined?undefined:`rotate(${rightArmAngle} 28 -92)`} style={rightArmAngle!==undefined?{animation:"none"}:{ transformBox: "fill-box", transformOrigin: "50% 10%", animation: anim === "punch" ? a("mvpunch") : anim === "block" ? a("mvblock") : anim === "kick" ? a("mvpunch") : "none" }}>
          <rect x="22" y={sit ? -58 : -96} width="12" height="34" rx="6" fill={color} />
          <circle data-scene-hand="right" cx="28" cy={sit ? -22 : -60} r="6" fill={skin} />
        </g>
        <g data-scene-arm="left"><rect x="-34" y={sit ? -58 : -96} width="12" height="34" rx="6" fill={color} /><circle data-scene-hand="left" cx="-28" cy={sit ? -22 : -60} r="6" fill={skin} stroke="#543a2d" strokeWidth="1"/></g>
      </g>
    </g>
  );
}

const Floor = ({ c = "#a98a4b" }: { c?: string }) => (
  <>
    <rect x="0" y="250" width="640" height="150" fill={c} />
    <path d="M0 250 H640" stroke="#3a2210" strokeWidth="8" />
    <path d="M0 290 H640 M0 330 H640 M120 250 L60 360 M280 250 L250 360 M440 250 L460 360 M580 250 L640 360" stroke="#0002" strokeWidth="2" />
  </>
);

const Wall = ({ c1 = "#4a2e1a", c2 = "#2a1a0e" }: { c1?: string; c2?: string }) => (
  <>
    <defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c2} /><stop offset="1" stopColor={c1} /></linearGradient></defs>
    <rect width="640" height="250" fill="url(#wall)" />
    <path d="M0 40 H640 M0 90 H640 M0 140 H640 M0 190 H640" stroke="#0003" strokeWidth="2" />
  </>
);

export interface Me { name?: string; avatar?: ReactNode; color: string; belt: string; skin: string; hair: string; fem: boolean }
export interface Shot { id?:string; playerAt?:{x:number;y:number;scale:number}; hidePlayerName?: boolean; shoulderLift?: boolean; playerFocus?: boolean; entrance?: boolean; caption: string; duration?: number; draw(c: string, b: string, me: Me): ReactNode }

const DEFAULT_ME: Me = { color: "#2471a3", belt: "#ecf0f1", skin: "#e8c39e", hair: "", fem: false };

const SHOTS: Shot[][] = [
  // 0 — Brick Fist Bao: raw power
  [
    { caption: "Before dawn, Bao's students hammer the heavy bags.", draw: (c, b) => (
      <>
        <Wall /><Floor />
        {[170, 330].map((x, i) => (
          <g key={x} style={{ transformOrigin: `${x}px 20px`, animation: `mvswing 0.9s ease-in-out ${i * 0.3}s infinite` }}>
            <line x1={x} y1="0" x2={x} y2="110" stroke="#222" strokeWidth="3" />
            <rect x={x - 22} y="110" width="44" height="100" rx="14" fill="#8a5a2b" stroke="#3a2210" strokeWidth="3" />
            <path d={`M${x - 22} 140 H${x + 22} M${x - 22} 175 H${x + 22}`} stroke="#3a2210" strokeWidth="3" />
          </g>
        ))}
        <Fig x={100} y={300} s={1.2} color="#ecf0f1" belt="#222" anim="punch" />
        <Fig x={260} y={310} s={1.2} color="#ecf0f1" belt="#c0392b" anim="punch" delay={0.3} />
        <Fig x={440} y={300} s={1.3} color={c} belt={b} anim="punch" delay={0.15} flip />
      </>
    ) },
    { caption: "Bao strikes the stack — the boards split under his hand.", duration:6000, draw: (c,b) => <MasterBoardBreak color={c} belt={b}/> },
    { caption: "Class is simple: hit harder. Then hit again.", draw: (c, b) => (
      <>
        <Wall /><Floor />
        {[90, 190, 290, 390, 490].map((x, i) => <Fig key={x} x={x} y={280 + (i % 2) * 40} s={1.1} color="#ecf0f1" belt={i === 2 ? b : "#222"} anim="punch" delay={i * 0.12} />)}
        <Fig x={580} y={310} s={1.3} color={c} belt={b} anim="block" flip />
      </>
    ) },
  ],
  // 1 — Mirage Mei: illusion
  [
    { caption: "Mei practices before a wall of mirrors.", draw: (c, b) => (
      <>
        <Wall c1="#3a2450" c2="#1a0f26" /><Floor c="#8a7a9a" />
        {[80, 240, 400].map((x) => <rect key={x} x={x} y="40" width="140" height="190" rx="8" fill="#9fd0e8" opacity="0.35" stroke="#e8d28a" strokeWidth="5" />)}
        <Fig x={200} y={320} s={1.5} color={c} belt={b} anim="block" />
        <g opacity="0.4"><Fig x={310} y={230} s={0.9} color={c} belt={b} anim="block" flip /></g>
        <Fig x={520} y={310} s={1.1} color="#ecf0f1" belt="#8e44ad" anim="sway" />
      </>
    ) },
    { caption: "Which Mei is real? Her students can't tell either.", draw: (c, b) => (
      <>
        <Wall c1="#3a2450" c2="#1a0f26" /><Floor c="#8a7a9a" />
        {[120, 240, 360, 480].map((x, i) => (
          <g key={x} opacity={i === 1 ? 1 : 0.5} style={{ animation: `mvghost 1.6s ease-in-out ${i * 0.2}s infinite` }}>
            <Fig x={x} y={310} s={1.4} color={c} belt={b} anim="sway" delay={i * 0.3} />
          </g>
        ))}
        <circle cx="540" cy="70" r="30" fill="#f6eecb" opacity="0.8" />
      </>
    ) },
    { caption: "Evening class: fans, silk, and sleight of hand.", draw: (c, b) => (
      <>
        <Wall c1="#3a2450" c2="#1a0f26" /><Floor c="#8a7a9a" />
        {[90, 190, 290, 390].map((x, i) => <Fig key={x} x={x} y={310} s={1.1} color="#ecf0f1" belt={i % 2 ? "#8e44ad" : "#2980b9"} sit anim="sway" delay={i * 0.2} />)}
        <Fig x={530} y={300} s={1.4} color={c} belt={b} anim="punch" flip />
        {[100, 300, 500].map((x) => <circle key={x} cx={x} cy="60" r="16" fill="#ff9aa2" opacity="0.8" style={{ animation: "mvsway 3s ease-in-out infinite" }} />)}
      </>
    ) },
  ],
  // 2 — Master Ren: counters
  [
    { caption: "Master Ren's students drill in pairs: strike, then counter.", draw: () => (
      <>
        <Wall c1="#1f4a42" c2="#0d201c" /><Floor c="#9a8a5a" />
        <Fig x={130} y={300} s={1.2} color="#ecf0f1" belt="#222" anim="punch" />
        <Fig x={250} y={300} s={1.2} color="#ecf0f1" belt="#c0392b" anim="block" flip delay={0.5} />
        <Fig x={400} y={300} s={1.2} color="#ecf0f1" belt="#222" anim="kick" delay={0.2} />
        <Fig x={520} y={300} s={1.2} color="#ecf0f1" belt="#2980b9" anim="block" flip delay={0.7} />
      </>
    ) },
    { caption: "Ren reads each strike and answers it, every time.", draw: (c, b) => (
      <>
        <Wall c1="#1f4a42" c2="#0d201c" /><Floor c="#9a8a5a" />
        <Fig x={200} y={320} s={1.6} color="#ecf0f1" belt="#222" anim="punch" delay={0} />
        <Fig x={420} y={320} s={1.6} color={c} belt={b} anim="block" flip delay={0.5} />
        <text x="320" y="120" textAnchor="middle" fontSize="54" fill="#f1c40f" style={{ animation: "mvhop 1s ease-in-out infinite" }}>✊ ✋ ✌</text>
      </>
    ) },
    { caption: "Lecture hour: Rock, Paper, Scissors — always a counter.", draw: (c, b) => (
      <>
        <Wall c1="#1f4a42" c2="#0d201c" /><Floor c="#9a8a5a" />
        <rect x="150" y="30" width="340" height="150" rx="6" fill="#f3ead2" stroke="#5a3a1a" strokeWidth="6" />
        <text x="320" y="100" textAnchor="middle" fontSize="52">✊→✌→✋→✊</text>
        <path d="M170 150 H470" stroke="#5a3a1a" strokeWidth="2" strokeDasharray="6 6" />
        {[90, 190, 290, 390, 490].map((x, i) => <Fig key={x} x={x} y={330} s={0.9} color="#ecf0f1" belt="#222" sit anim="bow" delay={i * 0.25} />)}
        <Fig x={560} y={250} s={1.1} color={c} belt={b} anim="sway" flip />
      </>
    ) },
  ],
  // 3 — Grandmaster Oku: stillness
  [
    { caption: "At the mountain temple, rain falls on the old stones.", draw: (c, b) => (
      <>
        <Wall c1="#1a2330" c2="#0a0f16" /><Floor c="#6a6a62" />
        {Array.from({ length: 36 }, (_, i) => <line key={i} x1={(i * 53) % 640} y1="-20" x2={(i * 53) % 640 - 12} y2="20" stroke="#9fc4e8" strokeWidth="2" opacity="0.6" style={{ animation: `mvrain 0.6s linear ${(i % 6) * 0.1}s infinite` }} />)}
        <path d="M60 250 L120 150 L180 250 Z M470 250 L540 130 L610 250 Z" fill="#0c1218" />
        <Fig x={320} y={320} s={1.5} color={c} belt={b} anim="sway" />
      </>
    ) },
    { caption: "Oku walks the kata alone. No one has ever seen him miss.", draw: (c, b) => (
      <>
        <Wall c1="#1a2330" c2="#0a0f16" /><Floor c="#6a6a62" />
        <circle cx="320" cy="90" r="46" fill="#f6eecb" opacity="0.85" />
        <Fig x={200} y={320} s={1.6} color={c} belt={b} anim="block" />
        <g opacity="0.3"><Fig x={340} y={320} s={1.6} color={c} belt={b} anim="punch" delay={0.2} /></g>
        <g opacity="0.15"><Fig x={480} y={320} s={1.6} color={c} belt={b} anim="kick" delay={0.4} /></g>
      </>
    ) },
    { caption: "At dusk his students bow. Tonight, they bow to you.", draw: (c, b) => (
      <>
        <Wall c1="#3a1a10" c2="#150a06" /><Floor c="#6a6a62" />
        <circle cx="320" cy="180" r="80" fill="#e67e22" opacity="0.7" />
        {[80, 170, 260, 380, 470, 560].map((x, i) => <Fig key={x} x={x} y={320} s={1.1} color="#ecf0f1" belt="#222" anim="bow" delay={i * 0.1} flip={x > 320} />)}
        <Fig x={320} y={260} s={1.2} color={c} belt={b} anim="sway" />
      </>
    ) },
  ],
];

/** One shared clock keeps the hand, contact and broken boards synchronized. */
export function masterBoardPose(ms:number){
 const t=Math.max(0,ms)%3000;
 const reach=Math.max(0,Math.min(1,(t-650)/550));
 const retract=Math.max(0,Math.min(1,(t-1750)/550));
 const angle=t<1750?-140+94*reach:-46-94*retract;
 const radians=angle*Math.PI/180;
 return {angle,handX:200+1.6*(28-32*Math.sin(radians)),handY:320+1.6*(-92+32*Math.cos(radians)),broken:t>=1200,scatter:Math.max(0,Math.min(1,(t-1200)/600))};
}
export function MasterBoardBreak({color,belt}:{color:string;belt:string}){
 const {paused}=useContext(MoviePause),elapsed=useRef(0);
 const [ms,setMs]=useState(0);
 useEffect(()=>{if(paused)return;const start=performance.now()-elapsed.current;let frame=0;const tick=(now:number)=>{elapsed.current=now-start;setMs(elapsed.current);frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[paused]);
 const pose=masterBoardPose(ms);
 return <g aria-label="Dojo master strikes and breaks the board stack" data-master-board-break="true">
  <Wall/><Floor/>
  <path transform="translate(-30 0)" d="M274 320V239M350 320V239" stroke="#634832" strokeWidth="10"/>
  <Fig x={200} y={320} s={1.6} color={color} belt={belt} rightArmAngle={pose.angle}/>
  <g transform="translate(-30 0)">{[0,1,2,3].map(i=><g key={i} data-board-state={pose.broken?'split':'intact'}>
   {pose.broken?<>
    <path d={`M272 ${210+i*10}H303L312 ${214+i*10}L304 ${218+i*10}H272Z`} fill="#dba665" stroke="#754919" transform={`translate(${-pose.scatter*18} ${pose.scatter*(18+i*3)}) rotate(${-pose.scatter*25} 272 ${214+i*10})`}/>
    <path d={`M350 ${210+i*10}H319L312 ${214+i*10}L320 ${218+i*10}H350Z`} fill="#dba665" stroke="#754919" transform={`translate(${pose.scatter*25} ${pose.scatter*(20+i*3)}) rotate(${pose.scatter*30} 350 ${214+i*10})`}/>
   </>:<rect x="272" y={210+i*10} width="78" height="8" fill="#dba665" stroke="#754919"/>}
  </g>)}
  {pose.broken&&pose.scatter<1&&<g aria-label="Board impact and splinters" opacity={1-pose.scatter}>
   <path d="M285 210L278 195M296 205L295 188M310 207L318 191" stroke="#ffe4a2" strokeWidth="4"/>
   {Array.from({length:10},(_,i)=><rect key={i} x={310+(i%2?1:-1)*pose.scatter*(20+i*5)} y={214+pose.scatter*(-20+(i%4)*17)} width="5" height="3" fill="#f4c57b" transform={`rotate(${i*29} ${310+(i%2?1:-1)*pose.scatter*(20+i*5)} ${214+pose.scatter*(-20+(i%4)*17)})`}/>)}
  </g>}
  </g><Fig x={500} y={310} s={1.1} color="#ecf0f1" belt="#222" anim="hop" delay={.2}/>
  <Fig x={560} y={310} s={1.1} color="#ecf0f1" belt="#2980b9" anim="hop" delay={.5}/>
 </g>;
}

export function VictoryLift({ me, color }: { me: Me; color: string }) {
  return <g aria-label="Dojo students lift your victorious fighter" data-victory-lift="true">
    <style>{`@keyframes studentLift{0%,100%{transform:translateY(0)}35%,65%{transform:translateY(-32px)}}
      @keyframes victoryConfetti{0%{transform:translateY(-60px);opacity:0}15%{opacity:1}100%{transform:translateY(260px) rotate(160deg);opacity:0}}`}</style>
    <Wall c1="#634422" c2="#20182c" /><Floor c="#a58349" />
    {Array.from({length:24}, (_,i) => <rect key={i} x={30+i*25} y={45+(i%4)*12} width="5" height="9" fill={["#f1c40f",me.color,"#fff6dc",color][i%4]} style={{animation:`victoryConfetti 2.4s linear ${(i%6)*.18}s infinite`,transformBox:"fill-box",transformOrigin:"center"}} />)}
    {[95,165,475,545].map((x,i)=><Fig key={x} x={x} y={310} s={.9} color={color} belt="#fff6dc" anim="hop" delay={i*.12} flip={x>320} />)}
    <g className="victory-carriers" style={{animation:"studentLift 2.4s ease-in-out infinite"}}>
      <ellipse cx="320" cy="263" rx="80" ry="12" fill="#f1c40f22" />
      <Fig x={320} y={232} s={1.14} {...me} anim="sway" />
      {[260,380].map(x=><g key={x}>
        <Fig x={x} y={322} s={.9} color={color} belt="#f1c40f" flip={x>320} />
      </g>)}
    </g>
    <text x="320" y="61" textAnchor="middle" fill="#f1c40f" fontSize="20" letterSpacing="3">THE DOJO CELEBRATES YOU!</text>
  </g>;
}

// Start the entrance clock when this shot mounts, not when the outer SVG was created.
export function entrancePose(elapsedMs: number) {
  const progress = Math.max(0, Math.min(1, elapsedMs / 6000));
  const walking = progress < 1;
  const step = walking ? Math.sin(progress * Math.PI * 12) * 24 : 0;
  return { x: -230 + 230 * progress, step, walking };
}

export function SpotlightEntrance({ me }: { me: Me }) {
  const {paused,reviewMs}=useContext(MoviePause);
  useEffect(()=>{if(reviewMs!==null)elapsedRef.current=reviewMs;},[reviewMs]);
  const elapsedRef=useRef(0);
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if(paused)return;
    const start = performance.now()-elapsedRef.current;
    let frame = 0;
    const tick = (now: number) => {
      const ms = now - start;
      elapsedRef.current=ms;setElapsed(ms);
      if (ms < 6000) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [paused]);
  const pose = entrancePose(reviewMs??elapsed);
  return <g aria-label="Your custom fighter enters the room and walks into the spotlight" data-spotlight-entrance="true">
    <style>{`
      .mat-walking svg{animation:none!important}
      .mat-entrance .fighter-left-leg{transform-origin:77px 210px;transform:rotate(var(--entrance-step))}
      .mat-entrance .fighter-right-leg{transform-origin:123px 210px;transform:rotate(calc(-1 * var(--entrance-step)))}
      .mat-entrance .fighter-left-arm{transform-origin:47px 112px;transform:rotate(calc(-.5 * var(--entrance-step)))}
      .mat-entrance .fighter-right-arm{transform-origin:153px 112px;transform:rotate(calc(.5 * var(--entrance-step)))}
      @keyframes spotlightReveal{0%{opacity:.1}70%,100%{opacity:1}}`}</style>
    <Wall c1="#263342" c2="#080c15" /><Floor c="#857044" />
    <path d="M20 285V67H120V285" fill="#07080e" stroke="#6c5034" strokeWidth="8" />
    <g style={{animation:"spotlightReveal 3s ease-out forwards"}}>
      <path d="M292 35H348L444 310H196Z" fill="#fbe4a1" opacity=".12" />
      <ellipse cx="320" cy="311" rx="125" ry="25" fill="#f8d67f" opacity=".3" />
      <ellipse cx="320" cy="311" rx="82" ry="15" fill="#fff1b6" opacity=".28" />
      <path d="M290 30H350L343 43H297Z" fill="#edca71" />
    </g>
    <path d="M182 270H458L492 326H148Z" fill="#315f78" stroke="#8ad3e5" strokeWidth="3" />
    <path d="M320 271V325M169 299H474" stroke="#ffffff22" strokeWidth="2" />
    <g role="img" aria-label={pose.walking ? "Your saved fighter walking from the doorway onto the mat" : "Your saved fighter standing at the center of the mat"}
      className={`mat-entrance${pose.walking ? " mat-walking" : ""}`}
      transform={`translate(${pose.x} 0)`}
      style={{ "--entrance-step": `${pose.step}deg` } as CSSProperties}>
      <Fig x={320} y={310} s={1.7} {...me} anim="walk" />
    </g>
  </g>;
}

/** Scene lists are authored once; never inject shared opening/ending shots. */
export function withPlayerShots(shots:Shot[],_label:string):Shot[]{return shots;}

/** Keep the full saved React avatar in HTML, not a transformed SVG foreignObject.
 * This avoids browser compositing/clipping failures in the two spotlight shots. */
export function focusPlacement(w:number,h:number,offsetX=0){
 const scale=Math.min(w/640,h/360);
 return {x:w/2+offsetX*scale,y:h/2+104*scale,scale:.74*scale};
}
/** Match the SVG viewBox and its -26 scene translation exactly. */
export function liftPlacement(w:number,h:number){
 const scale=Math.min(w/640,h/360);
 return {x:w/2,y:h/2+(282-26-180)*scale,scale:.65*scale};
}
export function FocusFighter({me,entrance,paused,reviewMs,shoulderLift=false,playerAt}:{playerAt?:Shot['playerAt'];me:Me;entrance:boolean;paused:boolean;reviewMs:number|null;shoulderLift?:boolean}) {
 const box=useRef<HTMLDivElement>(null);
 const [size,setSize]=useState({w:640,h:360});
 const [elapsed,setElapsed]=useState(0);const elapsedRef=useRef(0);
 useEffect(()=>{const node=box.current;if(!node)return;const update=()=>setSize({w:node.clientWidth,h:node.clientHeight});update();const observer=new ResizeObserver(update);observer.observe(node);return()=>observer.disconnect();},[]);
 useEffect(()=>{if(reviewMs!==null){elapsedRef.current=reviewMs;setElapsed(reviewMs);}},[reviewMs]);
 useEffect(()=>{if(paused||!entrance)return;const start=performance.now()-elapsedRef.current;let frame=0;const tick=(t:number)=>{const ms=Math.min(6000,t-start);elapsedRef.current=ms;setElapsed(ms);if(ms<6000)frame=requestAnimationFrame(tick);};frame=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frame);},[paused,entrance]);
 const pose=entrance?entrancePose(reviewMs??elapsed):{x:0,step:0,walking:false};
 const unit=Math.min(size.w/640,size.h/360);
 const placement=playerAt?{x:size.w/2+(playerAt.x-320)*unit,y:size.h/2+(playerAt.y-26-180)*unit,scale:playerAt.scale*unit}:shoulderLift?liftPlacement(size.w,size.h):focusPlacement(size.w,size.h,pose.x);
 const {x,y}=placement;
 return <div ref={box} className={`movie-avatar-layer${shoulderLift?' movie-shoulder-lift':''}`} aria-label={shoulderLift?"Your saved character seated on the students’ shoulders":"Your saved character on the blue spotlight mat"}>
  <div className={`movie-avatar-anchor${pose.walking?' mat-walking':''}`} style={{left:x,top:y,'--lift-distance':`${-32*Math.min(size.w/640,size.h/360)}px`,'--entrance-step':`${pose.step}deg`} as CSSProperties}>
   <div className="movie-avatar-model mat-entrance" style={{transform:`scale(${placement.scale})`}}>{me.avatar}</div>
  </div>
 </div>;
}

export function DojoMovie({ dojo, color, belt, onDone, shots: custom, label, me, pausedInitially=false }: { pausedInitially?:boolean; me?: Me; dojo: number; color: string; belt: string; onDone(): void; shots?: Shot[]; label?: string }) {
  const baseShots = custom ?? introShots(dojo);
  const shots = me ? withPlayerShots(baseShots, label ?? "INTRO") : baseShots;
  const [i, setI] = useState(0);
  const [paused,setPaused]=useState(pausedInitially);
  const [reviewMs,setReviewMs]=useState<number|null>(null);
  const shotTime=useRef(0);
  const started=useRef(0);
  useEffect(()=>{const hide=()=>{if(document.hidden)setPaused(true);};document.addEventListener('visibilitychange',hide);return()=>document.removeEventListener('visibilitychange',hide);},[]);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(()=>{shotTime.current=0;},[i]);
  useEffect(() => {
    if(paused)return;
    started.current=performance.now();
    const id=window.setTimeout(()=>{shotTime.current=0;i+1>=shots.length?done.current():setI(i+1);},Math.max(0,(shots[i]?.duration??SHOT_MS)-shotTime.current));
    return()=>{window.clearTimeout(id);shotTime.current+=performance.now()-started.current;};
  }, [i, shots.length, paused]);
  const shot = shots[i];
  if (!shot) return null;
  const bar: CSSProperties = { position: "absolute", left: 0, right: 0, height: "14%", background: "#000", zIndex: 2 };
  return (
    <MoviePause.Provider value={{paused,reviewMs}}><div className={`cinematic-movie${paused?' movie-paused':''}`} style={{ position: "absolute", inset: 0, zIndex: 70, background: "#000", pointerEvents: "auto", fontFamily: "Georgia, serif", color: "#fff6dc", overflow: "hidden" }}>
      <style>{`
        @keyframes storySash{50%{transform:translateY(-8px)}}
        @keyframes storyMirror{50%{transform:scaleX(.35)}}
        @keyframes storyCurtain{50%{opacity:.65}}
        @keyframes storyBrush{50%{transform:translate(12px,-10px)}}
        @keyframes storyBell{25%{transform:rotate(12deg)}75%{transform:rotate(-12deg)}}
        @keyframes storyRain{to{transform:translateY(35px)}}
        @keyframes storyFerry{50%{transform:translateX(35px)}}
        @keyframes storyWheel{to{transform:rotate(360deg)}}
        @keyframes storyCrane{50%{transform:translate(15px,-25px)}}
        @keyframes storyFlash{50%{opacity:.15}}
        @keyframes storyMoon{50%{transform:translateX(30px)}}
        @keyframes mvpunch{0%,60%,100%{transform:rotate(0)}30%{transform:rotate(-95deg)}}
        @keyframes mvblock{0%,60%,100%{transform:rotate(0)}30%{transform:rotate(-140deg)}}
        @keyframes mvkick{0%,60%,100%{transform:rotate(0)}30%{transform:rotate(-70deg)}}
        @keyframes mvhop{50%{transform:translateY(-14px)}}
        @keyframes mvsway{50%{transform:translateX(6px) rotate(2deg)}}
        @keyframes mvbow{50%{transform:rotate(14deg)}}
        @keyframes mvswing{50%{transform:rotate(-14deg)}}
        @keyframes mvbreak{0%,50%{transform:none}70%{transform:translate(30px,40px) rotate(25deg)}100%{transform:translate(30px,40px) rotate(25deg);opacity:0}}
        @keyframes mvghost{50%{transform:translateX(30px)}}
        @keyframes mvrain{from{transform:translateY(-20px)}to{transform:translateY(380px)}}
        @keyframes mvfade{from{opacity:0;transform:scale(1.06)}to{opacity:1;transform:scale(1)}}
        @keyframes mvcap{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
      `}</style>
      <svg key={i} viewBox="0 0 640 360" preserveAspectRatio="xMidYMid meet" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", animation: paused ? "none" : "mvfade 0.6s ease-out" }}>
        <HTMLFocus.Provider value={!!(shot.playerFocus||shot.shoulderLift||shot.playerAt) && !!me?.avatar}><g transform="translate(0 -26)">{shot.draw(color, belt, me ?? DEFAULT_ME)}</g></HTMLFocus.Provider>
      </svg>
      {(shot.playerFocus||shot.shoulderLift||shot.playerAt) && me?.avatar && <FocusFighter key={i} me={me} entrance={!!shot.entrance} shoulderLift={!!shot.shoulderLift} playerAt={shot.playerAt} paused={paused} reviewMs={reviewMs}/> }
      <EnergyRibbons/>
      <div style={{ position: "absolute", inset: 0, boxShadow: "inset 0 0 160px #000c", zIndex: 1, pointerEvents: "none" }} />
      <div style={{ ...bar, top: 0 }} />
      {!shot.hidePlayerName && me?.name?.trim() && <div className="movie-player-name" aria-label="Player name" style={{position:'absolute',top:'16%',left:'50%',transform:'translateX(-50%)',zIndex:4,maxWidth:'80%',overflowWrap:'anywhere',textAlign:'center',fontSize:'clamp(16px,2.4vw,28px)',fontWeight:700,letterSpacing:2,color:'#ffe2a0',background:'#100d0cdd',border:'1px solid #bd9b61',borderRadius:8,padding:'6px 18px',pointerEvents:'none'}}>{me.name.trim()}</div>}
      <div style={{ ...bar, bottom: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div key={i} style={{ fontSize: "clamp(14px,2vw,22px)", lineHeight:1.35, maxHeight:"100%",overflowY:"auto", fontStyle: "italic", textAlign: "center", padding: "0 clamp(16px,6vw,80px)", animation: paused ? "none" : "mvcap 0.6s ease-out 0.3s both" }}>{shot.caption}</div>
      </div>
      <div style={{ position: "absolute", top: "4%", left: 30, zIndex: 3, letterSpacing: 4, fontSize: 14, color: "#f1c40f" }}>{label ?? `DOJO ${dojo + 1}`} · {shots.length > 0 ? `${i + 1}/${shots.length}` : ""}</div>
      {paused && <div className="movie-scene-navigation" style={{position:'absolute',top:'10%',right:30,zIndex:6,display:'flex',gap:8}}><button type="button" disabled={i===0} onClick={()=>{setReviewMs(null);shotTime.current=0;setI(n=>Math.max(0,n-1));}}>PREVIOUS SCENE</button><button type="button" disabled={i===shots.length-1} onClick={()=>{setReviewMs(null);shotTime.current=0;setI(n=>Math.min(shots.length-1,n+1));}}>NEXT SCENE</button></div>}
      {paused && i===0 && me && !custom && <label style={{position:'absolute',bottom:'17%',left:'10%',right:'10%',zIndex:5,font:'14px system-ui',color:'#ffe4a8'}}>Entrance replay position<input aria-label="Entrance replay position" type="range" min="0" max="6000" step="100" value={reviewMs??Math.min(6000,shotTime.current)} onChange={e=>{const ms=Number(e.target.value);setReviewMs(ms);shotTime.current=ms;}} style={{display:'block',width:'100%',height:36}}/></label>}
      <button type="button" onClick={()=>{setReviewMs(null);setPaused(v=>!v);}} style={{position:'absolute',top:'3%',right:160,zIndex:4,padding:'9px 14px',minHeight:40,background:'#29211b',border:'1px solid #d9b268',color:'#fff1c8'}}>{paused?'RESUME CUTSCENE':'PAUSE CUTSCENE'}</button>
      <button type="button" onClick={onDone} style={{ position: "absolute", top: "3%", right: 30, zIndex: 3, cursor: "pointer", background: "#0008", color: "#fff6dc", border: "2px solid #f1c40f", borderRadius: 6, fontFamily: "Georgia, serif", fontSize: 16, padding: "6px 14px" }}>SKIP ▶▶</button>
    </div></MoviePause.Provider>
  );
}

const FALL = ["#6cc04a", "#ff8fb8", "#ffffff", "#ffffff", "#fff23a", "#fdf5d0"];
function Stage({ k }: { k: number }): ReactNode {
  return (
    <>
      <g transform="scale(0.5 0.575)"><ScenicWall i={k} /></g>
      <Floor c={SCENE_FLOOR[k]} />
      {Array.from({ length: 14 }, (_, n) => (
        <circle key={n} cx={(n * 53) % 640} cy={0} r={3 + (n % 3)} fill={FALL[k]} opacity="0.85" style={{ animation: `mvrain ${3 + (n % 4)}s linear ${-n * 0.5}s infinite` }} />
      ))}
    </>
  );
}

/** Rescue-dojo cutscenes: each dojo has its own setting, falling ambience and story. */
const MASTER_CAPTIONS=[
 {win:'Bao rebuilds the broken practice stand and leaves his red sash on it as a pledge of respect.',lose:'Bao seals the practice hall with a heavy beam. You leave a fresh board outside for your return.'},
 {win:'Mei turns every mirror toward the sunrise. Only your true reflection remains.',lose:'Mei draws a curtain across the mirrors. A single lantern marks your way out.'},
 {win:'Ren rolls up his strategy scroll and offers you the empty brush: write your own path.',lose:'Ren places three unmarked stones beside the scroll. Tomorrow begins with a clean page.'},
 {win:'Oku rings the mountain bell once, and the temple doors open to the valley.',lose:'Oku plants his staff beside the rain basin. You shelter beneath the temple eaves.'},
 {win:'Jun folds her painted fan into a trail marker and uncovers the road beyond the screens.',lose:'Jun scatters decoy fans across the courtyard. You follow the one real footprint home.'},
 {win:'Kai lowers his echo drum and lets your own rhythm fill the courtyard.',lose:'Kai strikes the echo drum twice. You carry a silent practice mallet back to training.'},
 {win:'Rin releases the storm wheel. Its vanes settle as the wind flags fall still.',lose:'Rin locks the storm wheel against the gusts. You brace a wind flag and wait for a lull.'},
 {win:'Void Sage removes the final black tile from the star table, revealing a path of light.',lose:'Void Sage covers the star table. You pocket one bright tile as a promise to return.'},
];
export function MasterResultStory({k,kind,color,belt}:{k:number;kind:'win'|'lose';color:string;belt:string}){
 const win=kind==='win';
 if(k>=4)return <ExtraMasterStory k={k} kind={kind} color={color} belt={belt}/>;
 return <g data-story-action={`master-${k}-${kind}`}><Wall c1={['#57331e','#432c5e','#19473f','#1b2b42'][k]}/><Floor/>
 <Fig x={win?180:475} y={310} s={1.35} color={color} belt={belt} anim={k===0?'punch':k===1?'block':k===2?'bow':'sway'}/>
 {k===0?(win?<g aria-label="Practice stand rebuilt"><path d="M245 310V240H340V310M245 260H340" fill="none" stroke="#a16c38" strokeWidth="9"/><path d="M270 235L290 275L315 235" fill="none" stroke="#c83e35" strokeWidth="12" style={{animation:'storySash 3s ease-in-out infinite'}}/></g>:<g aria-label="Hall sealed with beam"><path d="M265 305V110H380V305" fill="#191515" stroke="#7c5634" strokeWidth="12"/><path d="M250 190H395" stroke="#a97c46" strokeWidth="18"/><rect x="235" y="286" width="40" height="10" fill="#e6bb7a"/></g>):
 k===1?(win?<g aria-label="Mirrors turn to sunrise">{[260,330,400].map((x,i)=><g key={x} style={{transformOrigin:`${x+22}px 180px`,animation:`storyMirror 4s ease-in-out ${i*.2}s infinite`}}><rect x={x} y="110" width="44" height="145" fill="#a3dce4" stroke="#dfbc72" strokeWidth="5"/><path d={`M${x+7} 130l27 80`} stroke="#fff9" strokeWidth="4"/></g>)}<circle cx="560" cy="90" r="35" fill="#ffd995"/></g>:<g aria-label="Curtains close the mirror hall"><path d="M235 100H390V280H235Z" fill="#788d9e"/><path d="M235 100Q330 160 310 280H235ZM390 100Q300 160 320 280H390Z" fill="#66335b" style={{animation:'storyCurtain 4s ease-in-out infinite'}}/><circle cx="320" cy="120" r="17" fill="#f1c269"/></g>):
 k===2?(win?<g aria-label="Scroll rolls closed and brush is offered"><path d="M270 245Q300 205 345 240V275H270Z" fill="#ead6a1"/><circle cx="270" cy="255" r="15" fill="#9c6c43"/><path d="M300 220L350 165" stroke="#b98950" strokeWidth="7" style={{animation:'storyBrush 3s ease-in-out infinite'}}/><path d="M350 165l10-14-3 20Z" fill="#202329"/></g>:<g aria-label="Three stones beside a clean scroll"><rect x="245" y="235" width="135" height="40" fill="#f4e5b9"/>{[265,310,355].map((x,i)=><ellipse key={x} cx={x} cy={225-i*3} rx="13" ry="9" fill={['#afb7bd','#e0bf76','#668f88'][i]}/>)}</g>):
 win?<g aria-label="Mountain bell rings above open doors"><path d="M290 100Q320 75 350 100V145H290Z" fill="#caac5d" style={{transformOrigin:'320px 85px',animation:'storyBell 2s ease-in-out infinite'}}/><path d="M260 300V180H380V300" fill="#87a0b3" stroke="#62523f" strokeWidth="9"/><path d="M260 180l-25 20v100l25-15M380 180l25 20v100l-25-15" fill="#886340"/></g>:<g aria-label="Staff planted at rain basin"><ellipse cx="310" cy="275" rx="50" ry="18" fill="#526778" stroke="#b6c2c8" strokeWidth="5"/><path d="M325 270V120" stroke="#bea075" strokeWidth="8"/>{[280,300,340].map(x=><path key={x} d={`M${x} 160v50`} stroke="#b9e2f0" strokeWidth="2" style={{animation:'storyRain 1s linear infinite'}}/>)}</g>}
 </g>;
}
function ExtraMasterStory({k,kind,color,belt}:{k:number;kind:'win'|'lose';color:string;belt:string}){
 const win=kind==='win';
 return <g data-story-action={`master-${k}-${kind}`}><Wall c1={['#71432e','#20415a','#463158','#17232b'][k-4]}/><Floor/>
 <Fig x={win?180:480} y={310} s={1.35} color={color} belt={belt} anim={win?'bow':'sway'}/>
 {k===4?<g aria-label={win?'Painted fan becomes trail marker':'Decoy fans scattered'}>{(win?[300]:[245,305,365]).map((x,i)=><g key={x} transform={`translate(${x} ${win?210:260}) rotate(${i*25})`}><path d="M0 35L-32-15Q0-45 32-15Z" fill={win?'#f2c780':'#bf94bb'} stroke="#482b29" strokeWidth="3"/><path d="M0 35V-25M0 35L-20-18M0 35L20-18" stroke="#694832" strokeWidth="2"/></g>)}<path d={win?'M300 250V300':'M250 305q8-12 16 0m-4-16q8-12 16 0'} stroke="#d5a465" strokeWidth="5"/></g>:
 k===5?<g aria-label={win?'Echo drum lowered':'Echo drum struck twice'}><ellipse cx="305" cy={win?260:210} rx="48" ry="22" fill="#e7d8b2" stroke="#895e39" strokeWidth="5"/><path d={win?'M257 260V295Q305 320 353 295V260':'M257 210V260Q305 285 353 260V210'} fill="#915843" stroke="#ddb66f" strokeWidth="3"/><path d={win?'M290 235l45-30':'M278 170l12 25m40-25-12 25'} stroke="#d3b990" strokeWidth="7" style={{animation:win?'storyBrush 4s infinite':'storySash 1s infinite'}}/></g>:
 k===6?<g aria-label={win?'Storm wheel vanes settle':'Storm wheel locked'}><path d="M305 300V170" stroke="#8d7058" strokeWidth="9"/><g style={{transformOrigin:'305px 190px',animation:win?undefined:'storyWheel 3s linear infinite'}}>{[0,90,180,270].map(angle=><path key={angle} d="M305 190L305 125L338 140Z" transform={`rotate(${angle} 305 190)`} fill="#b2cbd5" stroke="#586f86" strokeWidth="2"/>)}</g><path d={win?'M365 150v150m0-80 35 10v20l-35-10':'M365 150v150m0-135 35-10v20l-35 10'} fill="#e4b86f" stroke="#ae8b52" strokeWidth="3"/></g>:
 <g aria-label={win?'Bright path revealed on star table':'Star table covered with one bright tile remaining'}><path d="M240 230H375V265H240ZM255 265V310M360 265V310" fill="#35334c" stroke="#8b84aa" strokeWidth="5"/>{Array.from({length:6},(_,i)=><rect key={i} x={250+i*19} y="232" width="16" height="16" fill={win||i===0?'#eada9f':'#141523'} stroke="#746a96"/>)}{win?<path d="M270 200l6-13 6 13 14 2-11 10 3 14-12-7-12 7 3-14-11-10Z" fill="#f6e1a7" style={{animation:'storySash 4s infinite'}}/>:<path d="M270 215H375V260H270Z" fill="#493551"/>}</g>}
 </g>;
}
export function cinematicOpponentIndex(name:string){return ['Brick Fist Bao','Mirage Mei','Master Ren','Grandmaster Oku','Fox Jun','Echo Kai','Storm Rin','Void Sage'].indexOf(name);}
const RESCUE_CAPTIONS=[
 {intro:'At Bamboo Grove, Bao pulls the gate brace loose while Take shields the seedlings.',win:'You reset the bamboo brace. Take ties a green ribbon around the restored gate.',lose:'A cracked bamboo post blocks the trail; Take lights a marker beside the seedlings.'},
 {intro:'Jun sends the Lotus Pond ferry drifting away with Hana’s medicine chest aboard.',win:'The ferry returns to its mooring. Hana opens the medicine chest beside the lilies.',lose:'Jun raises the ferry rope across the pond. Hana waits on the bank with a paper lantern.'},
 {intro:'Mei wedges an iron wheel into the Mountain gate and the counterweight starts to fall.',win:'The iron wheel turns back into its socket; Dorin releases the gate counterweight safely.',lose:'The Mountain gate locks behind a fallen counterweight. Dorin chalks a route on the rock.'},
 {intro:'Kai knots the Crane Temple kite lines together, trapping the ceremonial birds below the roof.',win:'The kite lines untangle. Yuki releases a white crane above the temple roof.',lose:'The temple kites fold in the wind. Yuki gathers the torn lines into a basket.'},
 {intro:'Rin tears the copper conductor from Thunder Peak’s storm tower as lightning gathers.',win:'The conductor locks onto the storm tower and Raiko raises the sun shield beneath it.',lose:'Thunder splits the conductor. Raiko carries a copper fragment into the stone shelter.'},
 {intro:'Void Sage slides a dark disk over Moon Gate’s lunar seal while Tsuki guards the silver key.',win:'Tsuki turns the silver key. The lunar disk opens and moonlight pours through the gate.',lose:'The lunar disk closes. Tsuki hides the silver key in a crescent-shaped stone.'},
];
export function RescueStory({k,kind,color,belt}:{k:number;kind:'intro'|'win'|'lose';color:string;belt:string}){
 const win=kind==='win',intro=kind==='intro';
 return <g data-story-action={`rescue-${k}-${kind}`}><Stage k={k}/>
 <Fig x={intro?440:win?525:470} y={310} s={1.25} color={intro?color:RESCUES[k]!.allyColor} belt={belt} anim={intro?'punch':win?'bow':'block'}/>
 {k===0?<g aria-label={intro?'Bamboo brace pulled loose':win?'Bamboo brace tied with ribbon':'Cracked bamboo trail marker'}><path d={intro?'M250 300V130L320 160':win?'M250 300V130H365V300M250 190H365':'M265 300V160L285 190L270 215'} fill="none" stroke="#6b9b4b" strokeWidth="16"/><path d={win?'M270 180L290 210L315 180':'M290 270L300 225L310 270Z'} fill={win?'#aad66b':'#f6cf76'} style={{animation:'storySash 3s ease-in-out infinite'}}/></g>:
 k===1?<g aria-label={intro?'Ferry drifts with medicine chest':win?'Ferry moored at lilies':'Ferry rope raised'} style={{animation:intro?'storyFerry 4s ease-in-out infinite':undefined}}><path d="M220 260Q300 300 380 260L365 285H235Z" fill="#b47c46"/><rect x="275" y="230" width="55" height="28" fill="#ae4640" stroke="#f2d7a2"/><path d={win?'M230 272L205 220':intro?'M355 268l45-15':'M210 200H400'} stroke="#e2d1ac" strokeWidth="4"/><ellipse cx="235" cy="300" rx="23" ry="6" fill="#8dac70"/></g>:
 k===2?<g aria-label={intro?'Iron wheel wedged in gate':win?'Wheel resets counterweight':'Iron wheel, fallen counterweight and chalk route'}><path d="M235 310V140H365V310" fill="none" stroke="#747d80" strokeWidth="15"/><g style={{transformOrigin:'300px 210px',animation:win?'storyWheel 4s linear infinite':undefined}}><circle cx="300" cy="210" r="38" fill="none" stroke="#a9b0b2" strokeWidth="9"/><path d="M262 210H338M300 172V248" stroke="#a9b0b2" strokeWidth="5"/></g><rect x={intro?350:win?350:260} y={intro?205:win?145:275} width="25" height="35" fill="#56616a"/>{kind==='lose'&&<path d="M245 265l20-25 20 12 35-35" stroke="white" fill="none"/>}</g>:
 k===3?<g aria-label={intro?'Ceremonial kite lines knotted':win?'White crane released':'Torn kite lines gathered'}><path d="M240 145L280 105L320 145L280 175Z" fill={win?'#faf3dd':'#79b6d5'} style={{animation:win?'storyCrane 4s ease-in-out infinite':undefined}}/><path d={intro?'M280 175Q360 220 285 250Q230 200 350 160':win?'M280 175L275 225':'M260 235q50 20 70 0v45h-70Z'} fill="none" stroke="#e4d6b5" strokeWidth="3"/>{win&&<path d="M260 140L235 110L280 130L325 110L300 140" fill="white"/>}</g>:
 k===4?<g aria-label={intro?'Copper conductor torn from tower':win?'Conductor reconnects above sun shield':'Copper fragment in storm shelter'}><path d="M265 300L300 125L335 300M280 220H320M272 265H328" stroke="#8c8881" strokeWidth="8" fill="none"/><path d={win?'M300 125V85L280 65M300 85L320 65':intro?'M330 120l30-40-30 15':'M260 270l20-15-7 30Z'} stroke="#d89551" fill="none" strokeWidth="7"/>{win?<circle cx="300" cy="220" r="30" fill="#e5bd52"/>:<path d="M360 80l-25 45h20l-25 45" fill="none" stroke="#f3eab3" strokeWidth="6" style={{animation:'storyFlash 2s infinite'}}/>}</g>:
 <g aria-label={intro?'Dark disk covers lunar seal':win?'Silver key opens moon disk':'Moon disk above crescent stone concealing key'}><circle cx="300" cy="180" r="65" fill="#d9dfdd" stroke="#a18bc5" strokeWidth="6"/><circle cx={win?365:intro?315:300} cy="180" r="58" fill="#24223e" style={{animation:win?'storyMoon 5s ease-in-out infinite':undefined}}/><path d={kind==='lose'?'M255 285Q300 250 345 285Q310 275 300 300Z':'M270 270h50m-15 0v15m10-15v15'} fill={kind==='lose'?'#a7a5bc':'none'} stroke="#e8e9ed" strokeWidth="5"/></g>}
 </g>;
}
export function introShots(dojo:number):Shot[]{return (SHOTS[dojo]??SHOTS[0]!).map((shot,i)=>({...shot,id:`intro-${dojo}-${i}`,hidePlayerName:true,playerAt:i===0?{x:560,y:310,scale:.43}:undefined}));}

export function rescueShots(kind:"intro"|"win"|"lose",k:number):Shot[]{
 const index=Math.max(0,Math.min(5,k));
 return [{id:`rescue-${index}-${kind}`,caption:RESCUE_CAPTIONS[index]![kind],duration:7000,hidePlayerName:true,
  playerAt:{x:kind==='intro'?125:kind==='win'?140:150,y:310,scale:.55},
  draw:(c,b)=><RescueStory k={index} kind={kind} color={c} belt={b}/> }];
}

export function RescueMovie({ k, kind, color, belt, onDone, me }: { k: number; kind: "intro" | "win" | "lose"; color: string; belt: string; onDone(): void; me: Me }) {
  const r = RESCUES[k] ?? RESCUES[0]!;
  return <DojoMovie me={me} dojo={k} color={color} belt={belt} shots={rescueShots(kind, k)} label={`${r.dojo.toUpperCase()} · ${kind === "intro" ? "TROUBLE" : kind === "win" ? "SAVED" : "DEFEAT"}`} onDone={onDone} />;
}

export function masterResultShots(kind:"win"|"lose"|"champion",dojo:number):Shot[]{
 if(kind==='champion')return [{id:'champion-procession',caption:'The four school banners rise together. The Three Hands title is yours.',duration:7000,hidePlayerName:true,shoulderLift:true,draw:(c,_b,me)=><><VictoryLift me={me} color={c}/><g aria-label="Four schools unite">{[140,245,350,455].map((x,i)=><path key={x} d={`M${x} 70h40v58l-20-12-20 12Z`} fill={['#c0392b','#8e44ad','#16a085','#2c3e50'][i]} stroke="#e7c776"/>)}</g></>}];
 const index=Math.max(0,Math.min(7,dojo));
 return [{id:`master-${index}-${kind}`,caption:MASTER_CAPTIONS[index]![kind],duration:6500,hidePlayerName:true,
  playerAt:{x:kind==='win'?420:135,y:310,scale:.6},draw:(c,b)=><MasterResultStory k={index} kind={kind} color={c} belt={b}/> }];
}
/** Legacy callers share selection, not copies of repeated story arrays. */
export const CUTS={win:masterResultShots('win',0),lose:masterResultShots('lose',0),champion:masterResultShots('champion',3)};
export function CutScene({kind,dojo,color,belt,onDone,me}:{me:Me;kind:'win'|'lose'|'champion';dojo:number;color:string;belt:string;onDone():void}){
 return <DojoMovie me={me} dojo={dojo} color={color} belt={belt} shots={masterResultShots(kind,dojo)} label={kind==='lose'?'DEFEAT':kind==='champion'?'CHAMPION':'VICTORY'} onDone={onDone}/>;
}
