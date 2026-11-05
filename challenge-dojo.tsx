import { Coin } from "./catalog-art";
import { CONTENT, NEW_RIVALS, EVENT_IDS, scheduledEvent, type ContentId } from "./content-catalog";
import { RescueScenery } from "./scenery";
import { EnergyRibbons } from "./cinematic-art";
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { CHALLENGES, challengeRival, dailyAvailable, dailyHand, choiceWindow, entryReason } from './challenges';
import { levelInfo, peekCost, type Profile } from './economy';
import type { DojoEvent } from './net';
import { MOVES, type Move, type Rival } from './rps';
import type { ChallengeKind } from './challenge-state';
import './expansion.css';

export function ChallengeDojo({ p, dispatch, onExit, fighter }: {
  p: Profile; dispatch(event: DojoEvent): void; onExit(): void;
  fighter(rival: Rival | null, state: 'idle' | 'win' | 'lose'): ReactNode;
}) {
  const [page, setPage] = useState<'menu' | 'run'>(p.challenges.run && !['complete', 'failed'].includes(p.challenges.run.phase) ? 'run' : 'menu');
  const screenRef = useRef<HTMLElement | null>(null);
  const [now, setNow] = useState(Date.now());
  const selected = p.challenges.run?.selected ?? null;
  const send = (data: object) => dispatch({ type: 'dojo.send', message: { send: emit => emit('challenge', data) } });
  const sender = useRef(send); sender.current = send;
  const run = p.challenges.run;
  useEffect(() => { if(screenRef.current) screenRef.current.scrollTop = 0; }, [page, run?.id]);
  const live = !!run && !['complete', 'failed'].includes(run.phase);
  useEffect(() => { const id = setInterval(() => setNow(Date.now()), 100); return () => clearInterval(id); }, []);
  useEffect(() => {
    if (!run || run.phase !== 'select') return;
    const id = run.id, turn = run.turn;
    const timeout = setTimeout(() => sender.current({ action: 'throw', id, turn, move: null }), Math.max(0, run.deadline - Date.now()));
    const visibility = () => { if (document.hidden) sender.current({ action: 'pause', id }); };
    document.addEventListener('visibilitychange', visibility);
    return () => { clearTimeout(timeout); document.removeEventListener('visibilitychange', visibility); };
  }, [run?.id, run?.turn, run?.phase, run?.deadline]);
  useEffect(() => {
    if (!run || page !== 'run' || run.phase !== 'select') return;
    const key = (e: KeyboardEvent) => {
      const move = ({ Digit1: 'rock', KeyR: 'rock', Digit2: 'paper', KeyP: 'paper', Digit3: 'scissors', KeyS: 'scissors' } as Record<string, Move>)[e.code];
      if (move) { e.preventDefault(); sender.current({action:'select',id:run.id,turn:run.turn,move}); }
    };
    window.addEventListener('keydown', key); return () => window.removeEventListener('keydown', key);
  }, [run?.phase, run?.turn, page]);
  const leave = () => { if (run?.phase === 'select') send({ action: 'pause', id: run.id }); onExit(); };
  const resultState = run?.phase === 'complete' ? 'win' : run?.phase === 'failed' ? 'lose' : 'idle';
  return createPortal(<section ref={screenRef} className="expansion-screen" aria-label="Challenge Dojo">
    <header className="expansion-header"><div><p className="eyebrow">CHALLENGES & EVENTS</p><h1>CHALLENGE DOJO</h1></div><button onClick={leave}>BACK TO DOJO</button></header>
    {page === 'menu' ? <>
      <p>Original Three Hands rules. Three points wins a match. Choose during the countdown; both hands reveal together. One free Peek and one unlocked Guard per match; extra Peeks cost coins. These optional trials do not replace your classic daily or tournament.</p>
      {live && <div className="expansion-callout">Saved run: {CHALLENGES[run!.kind].name}. <button onClick={() => setPage('run')}>RESUME SAVED RUN</button><button onClick={() => send({ action: 'finish', id: run!.id })}>END SAVED RUN</button></div>}
      {(['Daily Challenges', 'Survival Challenges', 'Special Trials', 'Tournaments', 'Rival Challenges', 'Dojo Activities', 'Special Events'] as const).map(group => {
        const available=(Object.keys(CHALLENGES) as ChallengeKind[]).filter(kind=>CHALLENGES[kind].group===group && !entryReason(p,kind,now) && (kind!=='daily'||dailyAvailable(p,now)));
        if(live||!available.length)return null;
        return <section key={group}><h2>{group}</h2><div className="challenge-grid">
        {available.map(kind => {
          const c = CHALLENGES[kind], daily = kind === 'daily';
          const claimed = p.challenges.claimed.includes(EVENT_IDS.includes(kind as typeof EVENT_IDS[number])?scheduledEvent(now).key:kind);
          return <article className="challenge-card" key={kind}><h3>{c.name}</h3><p>{c.goal}</p>
            {CONTENT[kind as ContentId] && <p>Bracket: {CONTENT[kind as ContentId].opponents.map(i=>i<8?['Bao','Jun','Mei','Kai','Ren','Rin','Oku','Void Sage'][i]:NEW_RIVALS[i-8]!.name).join(' → ')}</p>}
            {group === 'Special Events' && <p>UTC event ends {new Date(scheduledEvent(now).end).toISOString().replace('T',' ')}. A run must finish before then. Reward once per occurrence.</p>}
            {daily && <p>Entries: {p.challenges.dailyDay === new Date(now).toISOString().slice(0, 10) ? p.challenges.dailyAttempts : 0}/3 · Daily streak: {p.challenges.dailyStreak}</p>}
            <p className="reward">{kind === 'survival' ? 'Each new personal-best win: 15 coins + 8 XP (paid when run ends).' : `${c.reward.coins} coins · ${c.reward.xp} XP · ${c.reward.gems} diamonds. ${daily ? 'Once per day, plus 10–50 streak bonus coins.' : group === 'Special Events' ? 'Once per scheduled UTC occurrence.' : 'First clear only; later runs are practice.'}`}</p>
            <p>On-device {kind === 'survival' ? `best: ${p.challenges.survivalBest} wins` : `clears: ${p.challenges.clears[kind] ?? 0}`}{claimed ? ' · reward collected' : ''}</p>
            <button onClick={() => { send({ action: 'start', kind, id: crypto.randomUUID() }); setPage('run'); }}>{claimed ? 'PRACTICE TRIAL' : 'ENTER CHALLENGE'}</button>
          </article>;
        })}
      </div></section>;})}

      <p className="expansion-note">Best challenge win streak: {p.challenges.bestStreak}. Overall recorded wins: {p.stats.won+p.challenges.victories}. Consecutive match record: {p.bestMatchStreak}. Classic RP: {p.rp}. These are personal records, not a global leaderboard.</p>
    </> : run ? <>
      <div className="trial-top"><div><h2>{CHALLENGES[run.kind].name}</h2><p>{CHALLENGES[run.kind].goal}</p></div><strong>Match victories: {run.wins}</strong></div>
      {run.kind === 'daily' && <p>Today’s required scoring hand: {dailyHand(Date.parse(run.day)).toUpperCase()} · Entry day: {run.day} UTC</p>}
      <div className="trial-arena">{CONTENT[run.kind as ContentId]?.dojo !== undefined && <div className="trial-scenery" aria-hidden="true"><RescueScenery i={CONTENT[run.kind as ContentId].dojo!}/></div>}<EnergyRibbons active={run.phase === "review" || run.phase === "complete"}/>
        <div className="trial-fighter"><h3>{p.name || 'Your fighter'} · {run.player}/3</h3><div className="trial-art"><div className="trial-model">{fighter(null, resultState)}</div></div></div>
        <div className="trial-vs"><b>THREE HANDS</b><p>Rock beats Scissors<br/>Scissors beats Paper<br/>Paper beats Rock</p></div>
        <div className="trial-fighter"><h3>{challengeRival(run).name} · {run.rival}/3</h3><div className="trial-art"><div className="trial-model">{fighter(challengeRival(run), resultState === 'win' ? 'lose' : resultState === 'lose' ? 'win' : 'idle')}</div></div></div>
      </div>
      <p className="trial-feedback" aria-live="polite">{run.feedback}</p>
      <p>Scoring hands this match: {run.hands.length ? run.hands.join(', ') : 'none yet'}</p>
      {['ready','select'].includes(run.phase) && <div className="trial-hands"><button disabled={run.phase !== 'select' || run.peek !== null || (run.peekUsed && p.coins < peekCost(run.wins))} onClick={()=>send({action:'peek',id:run.id})}>{run.peek ? `PEEK: ${run.peek.toUpperCase()}` : run.peekUsed ? `PEEK — ${peekCost(run.wins)} COINS` : 'PEEK — FREE (1)'}</button><button disabled={run.guardUsed || (levelInfo(p.xp).level < 3 && p.training.strength === 0)} onClick={()=>send({action:'guard',id:run.id})}>{run.guardUsed ? 'GUARD USED' : run.guardArmed ? 'GUARD ARMED' : 'GUARD (level 3 or training)'}</button></div>}
      {run.phase === 'ready' && <><p>{challengeRival(run).blurb}</p><button onClick={() => send({ action: 'begin', id: run.id })}>START ROUND — {(choiceWindow(run) / 1000).toFixed(1)}s TO CHOOSE</button></>}
      {run.phase === 'select' && <div className="trial-controls">
        <label className="trial-timer">Both throw in {Math.max(0, (run.deadline - now) / 1000).toFixed(1)}s<progress max={choiceWindow(run)} value={Math.max(0, run.deadline - now)} /></label>
        <div className="trial-hands">{MOVES.map((move, i) => <button key={move} aria-pressed={selected === move} onClick={() => send({action:'select',id:run.id,turn:run.turn,move})}>{move.toUpperCase()} [{i + 1}]</button>)}</div>
        <p>{selected ? `Selected ${selected.toUpperCase()} — saved. You may change it until SHOOT!` : 'Choose a hand before the countdown expires.'}</p>
        <button onClick={() => send({ action: 'pause', id: run.id })}>PAUSE TRIAL</button>
      </div>}
      {run.phase === 'paused' && <><p>Trial paused. Your remaining choice time is saved.</p><button onClick={() => send({ action: 'resume', id: run.id })}>RESUME COUNTDOWN</button></>}
      {(run.phase === 'review' || run.phase === 'between') && <button onClick={() => send({ action: 'next', id: run.id })}>{run.phase === 'between' ? 'NEXT OPPONENT' : 'NEXT ROUND'}</button>}
      {!live && <><h2>{run.phase === 'complete' ? (CHALLENGES[run.kind].group === 'Tournaments'?'TOURNAMENT CHAMPION':'CHALLENGE COMPLETE') : run.kind === 'survival' ? 'SURVIVAL RUN ENDED' : 'TRIAL ENDED'}</h2><p>Rewards, records and completion are saved automatically. <Coin/> {p.coins} coins · {p.gems} diamonds · {p.xp} XP</p><button onClick={() => setPage('menu')}>CHALLENGE MENU / TRY AGAIN</button></>}
      {live && <div className="trial-exit"><button onClick={() => { if (run.phase === 'select') send({ action: 'pause', id: run.id }); setPage('menu'); }}>SAVE RUN & RETURN TO CHALLENGE MENU</button><button onClick={() => send({ action: 'finish', id: run.id })}>{run.kind === 'survival' ? 'END RUN & COLLECT NEW BEST' : 'FORFEIT TRIAL'}</button></div>}
    </> : <button onClick={() => setPage('menu')}>RETURN TO CHALLENGE MENU</button>}
  </section>, document.body);
}
