import { z } from 'zod';
export const academyIds = ['dummy','sensei','lightning','balance','frenzy','shadow','says','memory','trial','grandmaster'] as const;
export const playableAcademyIds = academyIds.filter((id):id is Exclude<typeof academyIds[number],'dummy'|'sensei'>=>id!=='dummy'&&id!=='sensei');
export type AcademyId = typeof academyIds[number];
const count = z.number().int().nonnegative();
const hand = z.enum(['rock','paper','scissors']);
export const academyRunSchema = z.object({
 id:z.string(), game:z.enum(academyIds), difficulty:z.number().int().min(1).max(3),
 phase:z.enum(['ready','play','watch','review','paused','won','lost']), pausedPhase:z.enum(['play','watch','review']).default('play'),
 turn:count, score:count, errors:count, attempts:count, wins:count, player:count, rival:count,
 senseiGuesses:z.array(z.object({hand:hand.nullable(),target:hand})).default(()=>[]),
 history:z.array(hand), sequence:z.array(hand), target:hand, valid:z.boolean(),
 deadline:z.number(), totalDeadline:z.number(), remaining:count, totalRemaining:count,
 opened:z.number(), elapsed:count.default(0), reactionTotal:count, reactions:count, feedback:z.string(), day:z.string(), paid:z.boolean(), noRepeat:z.boolean(),
});
export type AcademyRun=z.infer<typeof academyRunSchema>;
export const academyStateSchema=z.object({
 xp:count.default(0), run:academyRunSchema.nullable().catch(null).default(null).transform(run=>run?.game==='dummy'||run?.game==='sensei'?null:run),
 started:z.array(z.string()).default(()=>[]), claimed:z.array(z.string()).default(()=>[]),
 clears:z.record(z.string(),count).default(()=>({})), records:z.record(z.string(),count).default(()=>({})),
 daily:z.array(z.string()).default(()=>[]), unlocks:z.array(z.string()).default(()=>[]),
 decoration:z.enum(['plain','lanterns','bamboo']).default('plain'), animation:z.enum(['plain','gold','cyan']).default('plain'),
 master:z.enum(['self','Bao','Mei']).default('self'),
}).default(()=>({xp:0,run:null,started:[],claimed:[],clears:{},records:{},daily:[],unlocks:[],decoration:'plain' as const,animation:'plain' as const,master:'self' as const}));
export type AcademyState=z.infer<typeof academyStateSchema>;
