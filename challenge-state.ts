import { TOURNAMENT_IDS, RIVAL_IDS, DOJO_IDS, EVENT_IDS } from "./content-catalog";
import { z } from 'zod';
const count = () => z.number().int().nonnegative();
export const challengeKind = z.enum(['daily', 'survival', 'perfect', 'comeback', 'master', ...TOURNAMENT_IDS, ...RIVAL_IDS, ...DOJO_IDS, ...EVENT_IDS]);
export type ChallengeKind = z.infer<typeof challengeKind>;
export const challengeRunSchema = z.object({
  matchTurn: count().default(0), eventKey: z.string().default(''),
  selected: z.enum(['rock','paper','scissors']).nullable().default(null),
  id: z.string(), kind: challengeKind, day: z.string(), wins: count(), player: count(), rival: count(), turn: count(),
  history: z.array(z.object({ player: z.enum(['rock','paper','scissors']), rival: z.enum(['rock','paper','scissors']) })),
  hands: z.array(z.enum(['rock','paper','scissors'])),
  phase: z.enum(['ready', 'select', 'review', 'between', 'complete', 'failed', 'paused']),
  peekUsed: z.boolean().default(false), peek: z.enum(['rock','paper','scissors']).nullable().default(null),
  guardArmed: z.boolean().default(false), guardUsed: z.boolean().default(false),
  deadline: z.number(), remaining: count(), feedback: z.string(),
});
export type ChallengeRun = z.infer<typeof challengeRunSchema>;
export const challengeStateSchema = z.object({
  run: challengeRunSchema.nullable().catch(null).default(null),
  dailyDay: z.string().default(''), dailyAttempts: count().default(0), dailyLastWin: z.string().default(''), dailyStreak: count().default(0),
  claimed: z.array(z.string()).default(() => []),
  clears: z.record(z.string(), count()).default(() => ({})),
  victories: count().default(0),
  survivalBest: count().default(0), survivalPaid: count().default(0), bestStreak: count().default(0),
}).default(() => ({ run: null, dailyDay: '', dailyAttempts: 0, dailyLastWin: '', dailyStreak: 0, claimed: [], clears: {}, victories: 0, survivalBest: 0, survivalPaid: 0, bestStreak: 0 }));
export type ChallengeState = z.infer<typeof challengeStateSchema>;
