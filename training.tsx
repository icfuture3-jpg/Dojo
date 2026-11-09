import { useEffect, useRef, useState, type ReactNode } from 'react';

/** Difficulty follows completed chops, not successes; stage five is the result screen. */
export function boardZone(chops:number){
const width=Math.max(10,30-Math.max(0,Math.min(5,chops))*4);
return {start:50-width/2,end:50+width/2,width};
}
export const boardSpeed = (chops:number) => 1 + Math.max(0,Math.min(5,chops)) * .2;
export const boardPosition = (elapsed:number,chops:number) => (1-Math.cos(elapsed*boardSpeed(chops)/750))*50;
export const boardHit = (position:number,chops=0) => {const zone=boardZone(chops);return position>=zone.start && position<=zone.end;};

/** Five timing attempts. No failure can block the campaign; effort always builds strength. */
export function TrainingGame({ strength, avatar, onDone, fighterName = "Your fighter", automatic = false, skinColor = "#e1ac80", sleeveColor = "#318fc5" }: { strength: number; avatar: ReactNode; onDone(hits: number): void; fighterName?: string; automatic?: boolean; skinColor?: string; sleeveColor?: string }) {
  const [chop, setChop] = useState(0);
  const [combo, setCombo] = useState(0);
  const [impact, setImpact] = useState(false);
  const busy = useRef(false);
  const impactTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (impactTimer.current) clearTimeout(impactTimer.current); }, []);
  const [ready, setReady] = useState(automatic);
  const attemptsRef = useRef(0);
  const [attempt, setAttempt] = useState(0);
  const [hits, setHits] = useState(0);
  const [position, setPosition] = useState(0);
  const [feedback, setFeedback] = useState('Stop the marker inside the gold zone.');
  const started = useRef(performance.now());
  const positionRef = useRef(0);
  const submitted = useRef(false);
  useEffect(() => {
    if (!ready || attempt === 5 || busy.current) return;
    const id = window.setInterval(() => {
      positionRef.current = boardPosition(performance.now() - started.current,attempt);
      setPosition(positionRef.current);
    }, 16);
    return () => clearInterval(id);
  }, [attempt, ready, chop]);
  const strike = () => {
    if (!ready || attemptsRef.current >= 5 || busy.current) return;
    busy.current = true;
    setChop(c => c + 1);
    attemptsRef.current++;
    const hit = boardHit(positionRef.current, attempt);
    setImpact(false);
    impactTimer.current = setTimeout(() => {
    setImpact(hit);
    setCombo(c => hit ? c + 1 : 0);
    setHits(h => h + Number(hit));
    setAttempt(a => a + 1);
    setFeedback(hit ? 'BOARD BROKEN! Clean chop — strength is growing!' : 'THUD! Shake it off. Watch the gold zone and strike again!');
    started.current = performance.now();
    positionRef.current = 0;
    setPosition(0);
    busy.current = false;
    }, 420);
  };
  useEffect(() => {
    if (!automatic || attempt >= 5) return;
    const id = window.setTimeout(() => {
      setHits(h => h + 1);
      setAttempt(a => a + 1);
      setFeedback(`${fighterName} breaks a board!`);
    }, 1000);
    return () => clearTimeout(id);
  }, [automatic, attempt, fighterName]);
  const startTraining = () => {
    started.current = performance.now();
    positionRef.current = 0;
    setPosition(0);
    setReady(true);
  };
  const strikeRef = useRef(strike);
  strikeRef.current = strike;
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || automatic || event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      if (event.repeat) return;
      if (!ready) startTraining();
      else if (attemptsRef.current < 5) strikeRef.current();
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [ready, automatic]);
  const zone = boardZone(attempt);
  const gain = 1 + Math.floor(hits / 2);
  return <div className="activity-panel" role="dialog" aria-modal="true" aria-label="Strength training" style={{position:'absolute',inset:0,zIndex:200,background:'#171125',color:'#fff4d5',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12,padding:20,boxSizing:'border-box',overflowY:'auto',textAlign:'center',fontFamily:'Georgia, serif'}}>
    <style>{`@keyframes dojoShake{0%,100%{transform:translate(0)}20%{transform:translate(-7px,3px)}40%{transform:translate(7px,-3px)}60%{transform:translate(-4px,2px)}80%{transform:translate(4px,-2px)}}
      @keyframes splinterFly{0%{opacity:1;transform:translate(0,0) rotate(0)}100%{opacity:0;transform:translate(var(--dx),var(--dy)) rotate(var(--spin))}}
      @keyframes chopFlash{0%{opacity:.65}100%{opacity:0}}
      @keyframes boardShout{0%{transform:scale(.5);opacity:0}35%{transform:scale(1.16);opacity:1}100%{transform:scale(1);opacity:1}}`}</style>
    {impact && <div key={`flash-${chop}`} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none',background:'radial-gradient(circle at 50% 65%, #ffe39a, transparent 65%)',animation:'chopFlash .45s ease-out forwards'}} />}
    <h2 style={{margin:0}}>🥋 DOJO — BOARD-BREAKING TRAINING</h2>
    <div>{fighterName} returns to the dojo to test their strength.</div>
    <div aria-label="Your custom fighter in a blue circle" style={{height:210,width:210,borderRadius:'50%',background:'radial-gradient(circle, #4898d9, #153c80)',border:'4px solid #75c9ff',boxShadow:'0 0 30px #3685df66',overflow:'hidden',flexShrink:0,position:'relative'}}><div style={{position:'absolute',left:42,top:8,transform:'scale(.64)',transformOrigin:'top left'}}>{avatar}</div></div>
    {!ready && <div style={{maxWidth:540,lineHeight:1.6}}>
      <strong>How to break boards</strong>
      <div>After a loss, practice with your fighter to build strength. Watch the white marker move across the bar. Press <strong>SPACE</strong> or click <strong>STRIKE</strong> while it is inside the gold zone to break a board.</div>
      <div>After every chop, the gold zone shrinks and the marker speeds up—even if you miss. You get five attempts, with no time limit between strikes. Hold-free controls: press once for each strike.</div>
      <button type="button" onClick={startTraining} style={{padding:'12px 28px',fontSize:20,marginTop:12}}>START TRAINING — SPACE</button>
    </div>}
    <svg key={`boards-${chop}-${impact}`} style={{overflow:"visible",animation:impact ? "dojoShake .35s ease-out" : undefined}} width="300" height="155" viewBox="0 -68 220 140" role="img" aria-label={`${hits} boards broken`}>
      <style>{`@keyframes boardChop{0%{transform:translateY(-55px) rotate(-24deg)}58%{transform:translateY(0) rotate(0)}72%{transform:translateY(5px)}100%{transform:translateY(-55px) rotate(-24deg)}} @keyframes woodImpact{from{opacity:1;transform:scale(.5)}to{opacity:0;transform:scale(1.4)}}`}</style>
      {chop > 0 && <g key={chop} aria-label="Your hand chops down onto the wood" style={{animation:'boardChop .72s ease-in-out forwards',transformOrigin:'110px 0'}}>
        <path d="M93-65H124L123-28H96Z" fill={sleeveColor} stroke="#fff7" strokeWidth="2"/>
        <path d="M96-29H123V-9L139-1Q145 5 138 8L111 8Q98 6 96-5Z" fill={skinColor} stroke="#553a3088" strokeWidth="2"/>
        <path d="M104-20V-6M111-20V-6M118-20V-6" stroke="#553a3066" fill="none"/>
      </g>}
      {impact && <g key={`impact-${chop}`} style={{animation:'woodImpact .6s ease-out forwards',transformOrigin:'110px 12px'}}><path d="M110-4V-17M88 1L77-7M132 1L143-7M85 17L70 20M135 17L150 20" stroke="#ffe5a0" strokeWidth="4"/></g>}
      {impact && <g aria-label="Flying wood splinters">{Array.from({length:14}, (_,i) => <rect key={i} x={103+(i%4)*3} y={8+(i%3)*7} width={4+i%4} height={3+i%3} fill={i%2 ? '#e3b16d' : '#a96730'} style={{'--dx':`${(i%2 ? 1 : -1)*(35+i*6)}px`,'--dy':`${-35+(i%5)*22}px`,'--spin':`${i%2 ? 240 : -200}deg`,animation:`splinterFly .8s ease-out ${i*.009}s forwards`,transformBox:'fill-box',transformOrigin:'center'} as import('react').CSSProperties}/>)}</g>}
      <path d="M25 65V20 M195 65V20" stroke="#706050" strokeWidth="10" />
      {Array.from({length:5}, (_, i) => <g key={i} transform={`translate(0 ${i * 10})`}>
        {i < hits ? <><path d="M30 12L92 8L100 18L30 20Z" fill="#c78b44" transform="rotate(-8 30 16)"/><path d="M120 18L130 8L190 12L190 20Z" fill="#c78b44" transform="rotate(8 190 16)"/></> : <rect x="30" y="8" width="160" height="8" fill="#c78b44" stroke="#754919" />}
      </g>)}
    </svg>
    <div>Strength {strength} · {attempt}/5 attempts · {hits} solid hits{!automatic&&` · Speed ${boardSpeed(attempt).toFixed(1)}×`}</div>
    <div style={{visibility:ready ? 'visible' : 'hidden',position:'relative',width:'min(400px, 85%)',height:32,background:'#493858',borderRadius:10}} aria-label="Timing meter" data-speed={boardSpeed(attempt).toFixed(1)}>
      <div aria-label="Gold success zone" style={{position:'absolute',left:`${zone.start}%`,width:`${zone.width}%`,height:'100%',background:'#d5a62a'}} />
      <div style={{position:'absolute',left:`${position}%`,width:6,height:'100%',background:'white',transform:'translateX(-50%)'}} />
    </div>
    {ready && <div key={`feedback-${attempt}`} aria-live="polite" style={{fontSize:impact ? 24 : 17,fontWeight:impact ? 700 : 400,color:impact ? '#ffe28a' : '#fff4d5',animation:impact ? 'boardShout .4s ease-out' : undefined,textShadow:impact ? '0 0 18px #f2b42b77' : undefined}}>{feedback}{combo > 1 && <div style={{fontSize:18,color:'#83e8bf'}}>{combo} HIT STREAK!</div>}</div>}
    {!ready ? null : attempt < 5 ? automatic ? <div aria-live="polite">Watch {fighterName} train…</div> : <button type="button" onClick={strike} disabled={busy.current} style={{padding:'15px 40px',fontSize:22}}>STRIKE — SPACE</button> : <><strong style={{fontSize:24,color:"#ffe28a"}}>{!automatic && hits === 5 ? "PERFECT SESSION! " : ""}{automatic ? `${fighterName}: ${hits}/5 boards broken · Strength test complete` : `Strength +${gain} · XP +${20 + hits * 5}`}</strong>{!automatic && <div>Guard unlocked: block one losing round each match.</div>}<button type="button" style={{padding:14,fontSize:20}} onClick={() => { if (!submitted.current) { submitted.current = true; onDone(hits); } }}>{automatic ? "CONTINUE" : "CONTINUE — SAVE TRAINING"}</button></>}
  </div>;
}
