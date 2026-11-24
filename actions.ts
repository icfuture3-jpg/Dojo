import { applyAcademy } from "./academy";
import { checkExpansionAchievements } from "./expansion-achievements";
import { applyChallenge } from "./challenges";
import { z } from 'zod';
import * as economy from './economy';
import type { Profile } from './economy';

const identity = z.object({ completionId: z.string().trim().min(1).max(160) });
const item = z.object({ id: z.string().min(1).max(100) });
const hits = z.object({ hits: z.number().int().min(0).max(5) });
const pot = hits.extend({ mode: z.enum(['throw', 'jump', 'chop']) });
const peek = z.object({ level: z.number().int().min(0).max(1000000) });
const box = z.object({ currency: z.enum(['coins', 'gems', 'free']) });
const name = z.object({ name: z.string().max(100) });
const look = z.object({
  body: z.number().int(), head: z.number().int(), hair: z.number().int(), hairColor: z.number().int(),
  eye: z.number().int(), eyeColor: z.number().int(), skin: z.number().int(), pattern: z.number().int(), outfit: z.number().int(),
});

/** Pure event boundary. Randomness and time are supplied once by the caller. */
function applyActionResult(previous: Profile, kind: string, raw: unknown, now: number, random = 0): Profile {
  if (!Number.isFinite(now)) return previous;
  if (kind === 'matchDone' || kind === 'modeDone') {
    const id = identity.safeParse(raw);
    if (!id.success || previous.completedResults.includes(id.data.completionId)) return previous;
    const result = kind === 'matchDone' ? economy.matchResultSchema.safeParse(raw) : economy.modeResultSchema.safeParse(raw);
    if (!result.success) return previous;
    const next = kind === 'matchDone'
      ? economy.applyMatch(previous, result.data as economy.MatchResult, now)
      : economy.applyMode(previous, result.data as economy.ModeResult, now);
    if (!next || next === previous) return previous;
    const eligible = kind === 'matchDone' || (result.data as economy.ModeResult).mode !== 'spectate';
    // Commit the completion, box/loss entitlement, and training counter together.
    if(eligible) economy.recordMatchStreak(next,result.data.won);
    const completed = {
      ...next,
      completedResults: [...previous.completedResults, id.data.completionId],
      training: { ...next.training, matches: next.training.matches + Number(eligible) },
      freeBoxes: next.freeBoxes + Number(eligible && result.data.won),
      lossTrainingPending: next.lossTrainingPending + Number(eligible && !result.data.won),
    };
    return eligible && !result.data.won ? completed : checkExpansionAchievements(completed);
  }
  switch (kind) {
    case 'dismissNotice': {
      const r = z.object({ n: z.number().int().positive() }).safeParse(raw);
      return r.success && r.data.n === previous.last.n && r.data.n > previous.seenNotice
        ? { ...previous, seenNotice: r.data.n } : previous;
    }
    case 'academy': return applyAcademy(previous,raw,now,random);
    case 'challenge': { const next=applyChallenge(previous,raw,now); return next===previous || next.challenges.run?.phase === 'failed' ? next : checkExpansionAchievements(next); }
    case 'audio': { const r = z.object({ music: z.number().min(0).max(1), sfx: z.number().min(0).max(1) }).safeParse(raw); return r.success ? { ...previous, audio: r.data } : previous; }
    case 'potDone': { const r = pot.safeParse(raw); return r.success ? economy.savePotScore(previous, r.data.mode, r.data.hits) ?? previous : previous; }
    case 'trainingDone':
    case 'lossTrainingDone': {
      const r = hits.safeParse(raw);
      if (!r.success) return previous;
      return (kind === 'trainingDone' ? economy.completeTraining(previous, r.data.hits) : economy.completeLossTraining(previous, r.data.hits)) ?? previous;
    }
    case 'buyPeek': { const r = peek.safeParse(raw); return r.success ? economy.buyPeek(previous, r.data.level) ?? previous : previous; }
    case 'buyItem':
    case 'equip':
    case 'buyUpgrade': {
      const r = item.safeParse(raw);
      if (!r.success) return previous;
      const action = kind === 'buyItem' ? economy.buyItem : kind === 'equip' ? economy.equipItem : economy.buyUpgrade;
      return action(previous, r.data.id) ?? previous;
    }
    case 'setLook': { const r = look.safeParse(raw); return r.success ? economy.setLook(previous, r.data) ?? previous : previous; }
    case 'openBox': { const r = box.safeParse(raw); return r.success ? economy.openBox(previous, r.data.currency, () => random) ?? previous : previous; }
    case 'setName': { const r = name.safeParse(raw); return r.success ? economy.setName(previous, r.data.name) ?? previous : previous; }
    default: return previous;
  }
}

/** Successful gameplay updates can unlock trophies; losing a match never pays them. */
export function applyAction(previous: Profile, kind: string, raw: unknown, now: number, random = 0): Profile {
  const next = applyActionResult(previous, kind, raw, now, random);
  if (next === previous) return previous;
  const result = kind === 'matchDone' ? economy.matchResultSchema.safeParse(raw)
    : kind === 'modeDone' ? economy.modeResultSchema.safeParse(raw) : null;
  if (result?.success && !result.data.won && !('mode' in result.data && result.data.mode === 'spectate')) return next;
  if (kind === 'challenge' && next.challenges.run?.phase === 'failed') return next;
  return economy.collectTrophies(next);
}
