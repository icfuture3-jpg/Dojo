import { expect, it } from 'vitest';
import { activeMissions, missionKey, applyLogin, applyMatch, applyMode, buyItem, parseProfile } from './economy';
import { DEFAULT_LOOK, LOOK_COUNTS, seededLook } from './look';
const now = Date.UTC(2026, 10, 2);
const fresh = () => applyLogin(parseProfile({}), now);
it('repairs invalid saved profiles', () => {
 expect(parseProfile({coins:-10}).coins).toBeGreaterThanOrEqual(0);
});
it('rewards a win without mutating the saved profile', () => {
 const p = fresh();
 const next = applyMatch(p, {rival:0, won:true, roundsWon:3, roundsLost:1, comeback:false, perfectRun:false}, now);
 expect(next.stats.won).toBe(p.stats.won + 1);
 expect(next.beaten).toContain(0);
 expect(p.stats.won).toBe(0);
 expect(next.coins).toBeGreaterThan(p.coins);
});
it('rejects unaffordable purchases and locked rescues', () => {
 expect(buyItem({...fresh(), coins:0}, 'gi-crimson')).toBeNull();
 expect(applyMode(fresh(), {mode:'rescue',floor:5,won:true}, now)).toBeNull();
});
it('does not pay a daily reward twice', () => {
 const result = {mode:'daily' as const,floor:0,won:true};
 const next = applyMode(fresh(), result, now)!;
 expect(applyMode(next, result, now)).toBeNull();
});
it('generates deterministic valid character looks', () => {
 expect(seededLook(42)).toEqual(seededLook(42));
 for(let i=0;i<100;i++) for(const key of Object.keys(DEFAULT_LOOK) as (keyof typeof DEFAULT_LOOK)[]) {
  expect(seededLook(i)[key]).toBeLessThan(LOOK_COUNTS[key]);
  expect(seededLook(i)[key]).toBeGreaterThanOrEqual(key === 'outfit' ? -1 : 0);
 }
});

import { buyPeek, peekCost } from './economy';
it('prices extra peeks by opponent level and Tower floor', () => {
 expect(peekCost(0)).toBe(10);
 expect(peekCost(3)).toBe(40);
 expect(peekCost(19)).toBe(200);
});
it('charges coins for paid peeks without mutating the profile', () => {
 const p = {...fresh(), coins:30};
 expect(buyPeek(p, 1)?.coins).toBe(10);
 expect(p.coins).toBe(30);
 expect(buyPeek(p, 3)).toBeNull();
 expect(buyPeek({...p, coins:10}, 0)?.coins).toBe(0);
});

import { completeTraining, trainingDue } from './economy';
it('migrates existing saves without losing progress', () => {
 const p = parseProfile({coins:123, xp:42});
 expect(p.coins).toBe(123);
 expect(p.training).toEqual({matches:0, completed:0, strength:0});
});
it('requires training after each three matches and saves strength once', () => {
 const p = fresh();
 p.training.matches = 2;
 expect(trainingDue(p)).toBe(false);
 expect(completeTraining(p, 5)).toBeNull();
 p.training.matches = 3;
 expect(trainingDue(p)).toBe(true);
 const next = completeTraining(p, 5)!;
 expect(next.training.strength).toBe(3);
 expect(next.xp).toBe(p.xp + 45);
 expect(trainingDue(next)).toBe(false);
 expect(completeTraining(next, 5)).toBeNull();
 expect(p.training.completed).toBe(0);
 next.training.matches = 6;
 expect(trainingDue(next)).toBe(true);
 expect(completeTraining(next, 0)!.training.strength).toBe(4);
 expect(completeTraining(next, 6)).toBeNull();
});

import { completeLossTraining } from './economy';
it('rewards training after a loss only once, without mutating the save', () => {
 const p = {...fresh(), lossTrainingPending:1};
 const next = completeLossTraining(p, 4)!;
 expect(next.training.strength).toBe(3);
 expect(next.xp).toBe(p.xp + 40);
 expect(next.lossTrainingPending).toBe(0);
 expect(completeLossTraining(next, 4)).toBeNull();
 expect(completeLossTraining(p, 6)).toBeNull();
 expect(p.lossTrainingPending).toBe(1);
});

import { TROPHIES } from './economy';
it('makes early win trophies obtainable after three wins', () => {
 const p = fresh(); p.stats.won = 3;
 expect(TROPHIES.find(t=>t.id==='win-10')!.test(p)).toBe(true);
 expect(TROPHIES.find(t=>t.id==='flawless')!.test(p)).toBe(true);
});
it('awards newly eligible trophies on same-day reload without duplicates', () => {
 const p = fresh(); p.stats.won = 3;
 const next = applyLogin(p, now);
 expect(next.trophies).toContain('win-10');
 const again = applyLogin(next, now);
 expect(again.coins).toBe(next.coins);
 expect(again.trophies).toEqual(next.trophies);
});

import { openBox } from './economy';
it('opens a free victory box without charging currency or allowing reuse', () => {
 const p = {...fresh(), freeBoxes:1};
 const next = openBox(p, 'free', ()=>0)!;
 expect(next.freeBoxes).toBe(0);
 expect(next.coins).toBeGreaterThanOrEqual(p.coins);
 expect(next.gems).toBeGreaterThanOrEqual(p.gems);
 expect(next.stats.boxes).toBe(p.stats.boxes + 1);
 expect(next.last.box).not.toBe('');
 expect(openBox(next, 'free', ()=>0)).toBeNull();
 expect(p.freeBoxes).toBe(1);
});
it('paid coin boxes debit once and return a visible prize notice',()=>{
 const p={...fresh(),coins:1000};
 const next=openBox(p,'coins',()=>.5)!;
 expect(next.stats.boxes).toBe(p.stats.boxes+1);
 expect(next.last.title).toBe('Mystery box');
 expect(next.last.box).not.toBe('');
 expect(next.last.lines.length).toBeGreaterThan(0);
 expect(next.coins).toBeLessThan(p.coins);
 expect(p.coins).toBe(1000);
});

it.each([0, 1, 2])('does not reward a tournament loss with %i rounds won', roundsWon => {
 const p = fresh();
 p.rp = 100;
 p.stats.played = 4;
 p.stats.rounds = 14;
 const next = applyMatch(p, {rival:3, won:false, roundsWon, roundsLost:3, comeback:false, perfectRun:false}, now);
 expect([next.coins, next.gems, next.xp, next.trophies, next.done]).toEqual([p.coins, p.gems, p.xp, p.trophies, p.done]);
 expect(next.stats.played).toBe(5);
 expect(next.stats.rounds).toBe(14 + roundsWon);
 expect(next.rp).toBe(90);
 expect(next.last.title).toBe('Match lost');
 expect(next.last.lines.some(line => /\+.*(coins|gems|XP)/.test(line))).toBe(false);
});
it.each(['tower', 'rescue', 'daily'] as const)('does not reward a %s loss', mode => {
 const p = fresh();
 p.stats.tower = 5;
 const next = applyMode(p, {mode, floor:mode === 'tower' ? 5 : 0, won:false}, now)!;
 expect([next.coins, next.gems, next.xp]).toEqual([p.coins, p.gems, p.xp]);
 expect(next.stats.tower).toBe(p.stats.tower);
 expect(next.stats.rescued).toBe(p.stats.rescued);
});

it('tracks mission progress on a loss but only pays it on a subsequent win', () => {
 const p = fresh();
 const mission = activeMissions(p).find(m => m.metric === 'rounds')!;
 const key = missionKey(p, mission);
 p.prog[key] = mission.target - 1;
 const lost = applyMatch(p, {rival:0, won:false, roundsWon:1, roundsLost:3, comeback:false, perfectRun:false}, now);
 expect(lost.prog[key]).toBe(mission.target);
 expect(lost.done).not.toContain(key);
 expect([lost.coins, lost.gems, lost.xp]).toEqual([p.coins, p.gems, p.xp]);
 const won = applyMatch(lost, {rival:0, won:true, roundsWon:3, roundsLost:1, comeback:false, perfectRun:false}, now);
 expect(won.done).toContain(key);
 expect(won.coins).toBeGreaterThan(lost.coins);
});
