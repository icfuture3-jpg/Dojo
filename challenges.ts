import { CONTENT, NEW_RIVALS, EVENT_IDS, scheduledEvent, type ContentId } from "./content-catalog";
import { z } from 'zod';
import { awardActivity, dayKey, levelInfo, peekCost, recordMatchStreak, type Profile, type Reward } from './economy';
import { beats, MOVES, RIVALS, TOWER_POOL, towerRival, type Move } from './rps';
import { challengeKind, type ChallengeKind, type ChallengeRun } from './challenge-state';

export const CHALLENGES: Record<ChallengeKind, { name: string; group: string; goal: string; reward: Reward }> = {
  daily: { name: 'Daily Discipline', group: 'Daily Challenges', goal: 'Win a match and score at least one point with today’s focus hand. Three entries per UTC day.', reward: { coins: 70, xp: 45, gems: 2 } },
  survival: { name: 'Survival Challenge', group: 'Survival Challenges', goal: 'Win consecutive matches. One loss ends your run. Collect rewards for each new personal-best win.', reward: { coins: 15, xp: 8, gems: 0 } },
  perfect: { name: 'Perfect Victory', group: 'Special Trials', goal: 'Win three consecutive matches. Losing a match ends the run; losing a round does not.', reward: { coins: 100, xp: 70, gems: 3 } },
  comeback: { name: 'Comeback Challenge', group: 'Special Trials', goal: 'Start 0–2 against Grandmaster Oku. Win the match before conceding one more point.', reward: { coins: 90, xp: 60, gems: 2 } },
  ...CONTENT,
  master: { name: 'Three Hands Master', group: 'Special Trials', goal: 'Win a match with a scoring Rock, Paper AND Scissors. Ties do not count as scoring hands.', reward: { coins: 85, xp: 55, gems: 2 } },
};
export function dayNumber(now: number) { return Math.floor(now / 86400000); }
export function dailyHand(now: number): Move { return MOVES[((dayNumber(now) % 3) + 3) % 3]!; }
export function challengeRival(run: ChallengeRun) {
  const spec=CONTENT[run.kind as ContentId];
  if(spec){const index=spec.opponents[Math.min(run.wins,spec.opponents.length-1)]!;return index<8?TOWER_POOL[index]!:NEW_RIVALS[index-8]!;}
  if (run.kind === 'survival') return towerRival(run.wins);
  if (run.kind === 'comeback') return RIVALS[3]!;
  if (run.kind === 'daily') return TOWER_POOL[((Math.floor(Date.parse(run.day) / 86400000) % 8) + 8) % 8]!;
  return RIVALS[Math.min(run.wins, 3)]!;
}
export function choiceWindow(run: ChallengeRun) {
  const spec=CONTENT[run.kind as ContentId];
  if(spec) return spec.window ?? Math.max(5400, 7800-run.wins*300);
  return run.kind === 'survival' ? Math.max(4800, 7200 - run.wins * 200) : run.kind === 'comeback' ? 6000 : 7200;
}
/** Local deterministic random stream: independent of the player's current selection. */
export function plannedThrow(run: ChallengeRun): Move {
  let seed = 2166136261;
  for (const c of `${run.id}:${run.turn}:${run.wins}`) seed = Math.imul(seed ^ c.charCodeAt(0), 16777619);
  const random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  return challengeRival(run).pick(run.history, random);
}
const active = (run: ChallengeRun | null) => run && !['complete', 'failed'].includes(run.phase);
export function dailyAvailable(p: Profile, now: number) {
  const c = p.challenges; const day = dayKey(now);
  return !c.claimed.includes(`daily:${day}`) && (c.dailyDay !== day || c.dailyAttempts < 3);
}
export function entryReason(p:Profile,kind:ChallengeKind,now:number):string {
 const spec=CONTENT[kind as ContentId]; if(!spec)return '';
 if(EVENT_IDS.includes(kind as typeof EVENT_IDS[number]) && scheduledEvent(now).id!==kind)return 'Not scheduled today (UTC)';
 if(levelInfo(p.xp).level<spec.minLevel)return `Requires level ${spec.minLevel}`;
 if(spec.previous && !p.challenges.clears[spec.previous])return `Clear ${CONTENT[spec.previous].name} first`;
 if(spec.dojo!==undefined && p.stats.rescued<=spec.dojo)return 'Rescue this dojo in the original Rescue Dojos mode first';
 if(EVENT_IDS.includes(kind as typeof EVENT_IDS[number]) && p.challenges.claimed.includes(scheduledEvent(now).key))return 'Event reward collected today';
 return '';
}

function settle(p: Profile, success: boolean, now: number): Profile {
  const c = p.challenges, run = c.run!;
  if(!success && run.rival>=3)recordMatchStreak(p,false);
  run.phase = success ? 'complete' : 'failed'; run.deadline = 0;
  c.bestStreak = Math.max(c.bestStreak, run.wins);
  if (run.kind === 'survival') {
    c.survivalBest = Math.max(c.survivalBest, run.wins);
    const gain = Math.max(0, run.wins - c.survivalPaid);
    c.survivalPaid = Math.max(c.survivalPaid, run.wins);
    run.feedback += gain ? ` New record: ${gain} newly rewarded win(s).` : ' No new record reward this run.';
    return gain ? awardActivity(p, { coins: gain * 15, xp: gain * 8, gems: 0 }, 'Survival personal best') : p;
  }
  if (!success) return p;
  c.clears[run.kind] = (c.clears[run.kind] ?? 0) + 1;
  const key = run.eventKey || (run.kind === 'daily' ? `daily:${run.day}` : run.kind);
  if (c.claimed.includes(key)) { run.feedback += ' Practice clear — first-clear reward already collected.'; return p; }
  c.claimed.push(key);
  let bonus = 0;
  if (run.kind === 'daily') {
    c.dailyStreak = c.dailyLastWin === dayKey(now - 86400000) ? c.dailyStreak + 1 : 1;
    c.dailyLastWin = run.day; bonus = Math.min(5, c.dailyStreak) * 10;
    run.feedback += ` Daily streak: ${c.dailyStreak}; +${bonus} bonus coins.`;
  }
  return awardActivity(p, { ...CHALLENGES[run.kind].reward, coins: CHALLENGES[run.kind].reward.coins + bonus }, `${CHALLENGES[run.kind].name} cleared`);
}
const command = z.discriminatedUnion('action', [
  z.object({ action: z.literal('start'), kind: challengeKind, id: z.string().min(1).max(160) }),
  z.object({ action: z.literal('peek'), id: z.string() }),
  z.object({ action: z.literal('guard'), id: z.string() }),
  z.object({ action: z.literal('begin'), id: z.string() }),
  z.object({ action: z.literal('select'), id: z.string(), turn: z.number().int().nonnegative(), move: z.enum(['rock','paper','scissors']) }),
  z.object({ action: z.literal('throw'), id: z.string(), turn: z.number().int().nonnegative(), move: z.enum(['rock','paper','scissors']).nullable() }),
  z.object({ action: z.literal('next'), id: z.string() }),
  z.object({ action: z.literal('pause'), id: z.string() }),
  z.object({ action: z.literal('resume'), id: z.string() }),
  z.object({ action: z.literal('finish'), id: z.string() }),
]);
export function applyChallenge(input: Profile, raw: unknown, now: number): Profile {
  const parsed = command.safeParse(raw);
  if (!parsed.success || !Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) return input;
  const cmd = parsed.data, day = dayKey(now);
  if (cmd.action === 'start') {
    if (entryReason(input,cmd.kind,now) || active(input.challenges.run) || (cmd.kind === 'daily' && !dailyAvailable(input, now))) return input;
    // A fresh UUID is supplied by the menu; a completed run cannot be restarted with its old identity.
    if (input.challenges.run?.id === cmd.id) return input;
    const p: Profile = structuredClone(input), c = p.challenges;
    if (cmd.kind === 'daily') { if (c.dailyDay !== day) { c.dailyDay = day; c.dailyAttempts = 0; } c.dailyAttempts++; }
    c.run = { selected: null, id: cmd.id, kind: cmd.kind, day, wins: 0, player: 0, rival: cmd.kind === 'comeback' || CONTENT[cmd.kind as ContentId]?.startBehind ? 2 : 0, turn: 0, matchTurn: 0, eventKey: EVENT_IDS.includes(cmd.kind as typeof EVENT_IDS[number]) ? scheduledEvent(now).key : '', history: [], hands: [], peekUsed: false, peek: null, guardArmed: false, guardUsed: false, phase: 'ready', deadline: 0, remaining: 0, feedback: challengeRival({ kind: cmd.kind, day, wins: 0 } as ChallengeRun).intro };
    return p;
  }
  const original = input.challenges.run;
  if (!original || original.id !== cmd.id || !active(original)) return input;
  const p: Profile = structuredClone(input), run = p.challenges.run!;
  if ((run.eventKey && run.eventKey !== scheduledEvent(now).key) || (run.kind === 'daily' && run.day !== day)) { run.feedback = run.eventKey ? 'This scheduled event has ended at its UTC boundary.' : 'This UTC daily trial has ended. Start today’s trial from the menu.'; return settle(p, false, now); }
  if (cmd.action === 'select') {
    if(run.phase !== 'select' || run.turn !== cmd.turn || now >= run.deadline) return input;
    run.selected = cmd.move; return p;
  }
  if (cmd.action === 'peek' && run.phase === 'select' && run.peek === null && now < run.deadline) {
    const price = run.peekUsed ? peekCost(run.wins) : 0;
    if (p.coins < price) return input;
    p.coins -= price; run.peekUsed = true; run.peek = plannedThrow(run); return p;
  }
  if (cmd.action === 'guard' && ['ready', 'select'].includes(run.phase)) {
    if ((run.phase === 'select' && now >= run.deadline) || run.guardUsed || (levelInfo(p.xp).level < 3 && p.training.strength === 0)) return input;
    run.guardArmed = !run.guardArmed; return p;
  }
  if (cmd.action === 'finish') { run.feedback = 'Run ended. Unfinished daily entries stay spent.'; return settle(p, false, now); }
  if (cmd.action === 'begin' && run.phase === 'ready') { run.phase = 'select'; run.deadline = now + choiceWindow(run); return p; }
  if (cmd.action === 'pause' && run.phase === 'select' && now < run.deadline) { run.remaining = Math.ceil(run.deadline - now); run.deadline = 0; run.phase = 'paused'; return p; }
  if (cmd.action === 'resume' && run.phase === 'paused') { run.phase = 'select'; run.deadline = now + run.remaining; return p; }
  if (cmd.action === 'next' && (run.phase === 'review' || run.phase === 'between')) {
    if (run.phase === 'between') { run.player = 0; run.rival = 0; run.hands = []; run.history = []; run.matchTurn = 0; run.peekUsed = false; run.guardArmed = false; run.guardUsed = false; }
    run.peek = null; run.selected = null; run.phase = 'ready'; return p;
  }
  if (cmd.action !== 'throw' || run.phase !== 'select' || run.turn !== cmd.turn) return input;
  // The UI locks the selection until the simultaneous deadline. Early submissions are ignored.
  if (now < run.deadline) return input;
  // A choice accepted before the deadline remains valid even if the browser timer fires late.
  const choice = run.selected ?? (now - run.deadline > 2000 ? null : cmd.move);
  const rival = plannedThrow(run);
  run.turn++; run.matchTurn++;
  const won = choice !== null && beats(choice, rival);
  let tied = choice === rival;
  const guarded = !won && !tied && run.guardArmed;
  if (guarded) { tied = true; run.guardArmed = false; run.guardUsed = true; }
  if (choice !== null) run.history.push({ player: choice, rival });
  if (won) { run.player++; if (!run.hands.includes(choice!)) run.hands.push(choice!); }
  else if (!tied) run.rival++;
  run.deadline = 0;
  run.feedback = `${choice ?? 'No hand selected'} vs ${rival}: ${guarded ? 'GUARD — losing round blocked into a draw!' : won ? 'POINT!' : tied ? 'DRAW — replay the round.' : 'STRUCK!'}`;
  const spec=CONTENT[run.kind as ContentId];
  if (run.rival >= 3 || (spec?.flawless && run.rival>0)) {
    const opponent=challengeRival(run); if('victory' in opponent)run.feedback+=` ${opponent.victory}`;
    return settle(p, false, now);
  }
  if (run.player >= 3) {
    const valid = (run.kind !== 'master' && !spec?.needHands) || MOVES.every(m => run.hands.includes(m));
    const focus = run.kind !== 'daily' || run.hands.includes(dailyHand(Date.parse(run.day)));
    run.wins++; p.challenges.victories++; recordMatchStreak(p,true);
    if (!valid || !focus) { run.feedback += ' Match won, but the hand objective was not met.'; return settle(p, false, now); }
    const defeated=challengeRival({...run,wins:run.wins-1});if('defeat' in defeated)run.feedback+=` ${defeated.defeat}`;
    p.challenges.bestStreak = Math.max(p.challenges.bestStreak, run.wins);
    if (run.kind === 'survival' || (run.kind === 'perfect' && run.wins < 3) || (spec && run.wins < spec.opponents.length)) { run.phase = 'between'; run.feedback += ` Match victory ${run.wins}! Next: ${challengeRival(run).name}.`; return p; }
    return settle(p, true, now);
  }
  if(spec?.roundLimit && run.matchTurn >= spec.roundLimit){run.feedback+=' Throw limit reached.';return settle(p,false,now);}
  run.phase = 'review'; return p;
}
