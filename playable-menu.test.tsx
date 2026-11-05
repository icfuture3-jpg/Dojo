import { afterEach, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ChallengeDojo } from './challenge-dojo';
import { CHALLENGES, applyChallenge, dailyAvailable, entryReason } from './challenges';
import { parseProfile } from './economy';
import { TOURNAMENT_IDS } from './content-catalog';
import type { ChallengeKind } from './challenge-state';
vi.mock('react-dom',async importOriginal=>({...await importOriginal<typeof import('react-dom')>(),createPortal:(node:unknown)=>node}));
afterEach(()=>vi.unstubAllGlobals());
const now=Date.UTC(2026,10,4,12);
function menu(p:ReturnType<typeof parseProfile>){vi.stubGlobal('document',{body:{}});vi.spyOn(Date,'now').mockReturnValue(now);const html=renderToStaticMarkup(<ChallengeDojo p={p} dispatch={()=>{}} onExit={()=>{}} fighter={()=><div/>}/>);vi.restoreAllMocks();return html;}
it('new and advanced profiles see only available real challenges, without empty sections or achievement filler',()=>{
 for(const p of [parseProfile({}),parseProfile({xp:15000,stats:{rescued:6}})]){
  if(p.xp)for(const id of TOURNAMENT_IDS)p.challenges.clears[id]=1;
  const html=menu(p);let count=0;
  for(const kind of Object.keys(CHALLENGES) as ChallengeKind[]){
   const available=!entryReason(p,kind,now)&&(kind!=='daily'||dailyAvailable(p,now));
   if(available){count++;const next=applyChallenge(p,{action:'start',kind,id:`launch-${kind}`},now);expect(next.challenges.run?.kind).toBe(kind);expect(html).toContain(`<h3>${CHALLENGES[kind].name.replaceAll('’','’')}</h3>`);}
   else expect(html).not.toContain(`<h3>${CHALLENGES[kind].name}</h3>`);
  }
  expect((html.match(/>ENTER CHALLENGE</g)||[])).toHaveLength(count);
  expect(html).not.toContain('Records and scheduling');expect(html).not.toContain('using its UTC clock');expect(html).not.toContain('<strong>on this device</strong>');expect(html).not.toContain('disabled');expect(html).not.toContain('<h2>Achievements');expect(html).not.toContain('<h2>Dojo Activities</h2><div class="challenge-grid"></div>');
 }
});
it('an active saved trial reopens its actual round rather than a page full of unavailable cards',()=>{
 const p=applyChallenge(parseProfile({}),{action:'start',kind:'perfect',id:'resume-me'},now);
 const html=menu(p);expect(html).toContain('START ROUND');expect(html).toContain('FORFEIT TRIAL');expect(html).not.toContain('ENTER CHALLENGE');expect(html).not.toContain('FINISH CURRENT RUN FIRST');
});
