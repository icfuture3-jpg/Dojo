import { expect, it } from 'vitest';
import { applyLogin, applyMatch, applyMode, buyItem, parseProfile } from './economy';
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

it('backfills tournament gis from recorded clears without charging or duplicating them',()=>{
 const p=parseProfile({saveVersion:4,coins:500,gems:20,challenges:{clears:{beginner:1,advanced:1,world:1}}});
 for(const id of ['gi-champion-jade','gi-champion-storm','gi-champion-golden'])expect(p.owned).toContain(id);
 expect(p.coins).toBe(500);expect(p.gems).toBe(20);
 expect(parseProfile(p).owned).toEqual(p.owned);
 const freshProfile=parseProfile({});
 for(const id of ['gi-champion-jade','gi-champion-storm','gi-champion-golden']){
  expect(freshProfile.owned).not.toContain(id);
  expect(buyItem({...freshProfile,coins:100000,gems:100000,xp:100000,rp:100000},id)).toBeNull();
 }
});
it('never drops tournament-exclusive gis in mystery boxes',()=>{
 const p=parseProfile({coins:100000,freeBoxes:1,rp:100000});
 for(let n=0;n<1000;n++){
  const next=openBox(p,'free',()=>n/1000)!;
  expect(next.last.box).not.toMatch(/^gi-champion-/);
 }
});
