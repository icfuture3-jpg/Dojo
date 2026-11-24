// @vitest-environment happy-dom
import {afterEach,expect,it,vi} from 'vitest';
import {act,useState} from 'react';
import {GameHud} from './hud';
import {createRoot,type Root} from 'react-dom/client';
import {renderToStaticMarkup} from 'react-dom/server';
import {FRIENDS,friendsAtWins} from './friends';
import {FriendArt} from './friend-art';
import {FriendsPanel,EquippedFriend} from './friends-panel';
import {applyAction} from './actions';
import {applyLogin,parseProfile} from './economy';
import {loadSave,saveProfile} from './saves';
const now=Date.UTC(2026,10,24);
const win={rival:0,won:true,roundsWon:3,roundsLost:0,comeback:false,perfectRun:false};
it('unlocks each friend at its exact saved fight-win threshold, without spending currency',()=>{
 expect(FRIENDS).toHaveLength(14);expect(new Set(FRIENDS.map(f=>f.id)).size).toBe(14);
 for(const f of FRIENDS){
  expect(friendsAtWins(f.wins-1)).not.toContain(f.id);expect(friendsAtWins(f.wins)).toContain(f.id);
  const p=applyLogin(parseProfile({coins:777,gems:23,diamondWins:f.wins-1}),now);
  const next=applyAction(p,'matchDone',{...win,completionId:f.id},now);
  expect(friendsAtWins(next.diamondWins)).toContain(f.id);expect(next.coins).toBeGreaterThan(p.coins);
  expect(applyAction(next,'matchDone',{...win,completionId:f.id},now)).toBe(next);
  const equipped=applyAction(next,'equipFriend',{id:f.id},now);
  expect(equipped.companion).toBe(f.id);expect(equipped.gems).toBe(next.gems);expect(equipped.coins).toBe(next.coins);
 }
});
it('rejects locked/unknown friends, supports unequip, and retains equipment through a save round trip',()=>{
 const p=applyLogin(parseProfile({diamondWins:8,coins:555,gems:17}),now);
 for(const id of ['zhulong','forged'])expect(applyAction(p,'equipFriend',{id},now)).toBe(p);
 const next=applyAction(p,'equipFriend',{id:'bixi'},now);
 const map=new Map<string,string>();const storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);}};
 expect(saveProfile(storage,next)).toBeNull();const loaded=loadSave(storage,now).profile;
 expect(loaded.companion).toBe('bixi');expect(loaded.coins).toBe(p.coins);expect(loaded.gems).toBe(17);
 expect(applyAction(loaded,'equipFriend',{id:''},now).companion).toBe('');
 expect(parseProfile({coins:456,owned:['gi-blue'],gems:34}).companion).toBe('');
});
it('losses, individual throws, spectating and board practice do not unlock friends',()=>{
 const p=applyLogin(parseProfile({diamondWins:2,lossTrainingPending:1}),now);
 const loss=applyAction(p,'matchDone',{...win,completionId:'loss',won:false,roundsWon:0,roundsLost:3},now);
 const board=applyAction(p,'lossTrainingDone',{hits:5},now);
 const spectate=applyAction(p,'modeDone',{completionId:'s',mode:'spectate',floor:0,won:true,correct:true},now);
 for(const next of [loss,board,spectate])expect(friendsAtWins(next.diamondWins)).toEqual([]);
});
it.each(['tower','daily','rescue'] as const)('%s wins unlock friends and retain coin rewards',mode=>{
 const p=applyLogin(parseProfile({coins:777,diamondWins:2}),now);
 const next=applyAction(p,'modeDone',{completionId:mode,mode,floor:0,won:true},now);
 expect(friendsAtWins(next.diamondWins)).toContain('carp');expect(next.coins).toBeGreaterThan(p.coins);
});
it('fight coins are preserved but board-training trophies cannot add coins',()=>{
 const p=applyLogin(parseProfile({coins:777,xp:95,diamondWins:9,stats:{played:9,won:2}}),now);
 const next=applyAction(p,'matchDone',{...win,completionId:'big'},now);
 expect(next.coins).toBeGreaterThan(p.coins);expect(next.xp).toBeGreaterThan(p.xp);
 for(const kind of ['trainingDone','lossTrainingDone']){
  const board=applyAction(parseProfile({coins:777,xp:95,lossTrainingPending:1,training:{matches:3},stats:{won:3}}),kind,{hits:5},now);
  expect(board.coins).toBe(777);expect(board.xp).toBe(140);expect(board.training.strength).toBe(3);
  expect(board.trophies).toContain('win-10'); // earned trophy, no training coin windfall
  expect(board.last.lines.join(' ')).not.toMatch(/\+\d+ coins/);
  expect(applyAction(board,kind,{hits:5},now)).toBe(board);
 }
});
it('all friends have separate reference PNGs and visible equipped companions',()=>{
 const html=FRIENDS.map(friend=>renderToStaticMarkup(<FriendArt friend={friend}/>));expect(new Set(html).size).toBe(14);
 const el=document.createElement('div');el.innerHTML=renderToStaticMarkup(<>{FRIENDS.map(friend=><FriendArt key={friend.id} friend={friend}/>)}</>);
 expect(el.querySelectorAll('image')).toHaveLength(14);
 expect(new Set([...el.querySelectorAll('image')].map(i=>i.getAttribute('href'))).size).toBe(14);
 const ids=[...el.querySelectorAll('[id]')].map(e=>e.id);expect(new Set(ids).size).toBe(ids.length);
 expect(renderToStaticMarkup(<EquippedFriend p={parseProfile({companion:'carp',diamondWins:3})}/>)).toContain('Dragon-Gate Carp');
 expect(renderToStaticMarkup(<EquippedFriend p={parseProfile({companion:'zhulong',diamondWins:3})}/>)).toBe('');
});
let root:Root|undefined;
(globalThis as {IS_REACT_ACT_ENVIRONMENT?:boolean}).IS_REACT_ACT_ENVIRONMENT=true;
afterEach(async()=>{if(root)await act(()=>root!.unmount());root=undefined;document.body.innerHTML='';vi.useRealTimers();vi.restoreAllMocks();});
it('Friends menu shows progress, allows only unlocked equipment and has an exit',async()=>{
 const p=parseProfile({diamondWins:8,companion:'carp'}),dispatch=vi.fn(),exit=vi.fn();
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);
 await act(()=>root!.render(<FriendsPanel p={p} dispatch={dispatch} onClose={exit}/>));
 expect(document.body.textContent).toContain('2/14 friends unlocked');expect(document.body.textContent).toContain('7 to go');
 expect(document.querySelector<HTMLButtonElement>('[aria-label="Locked Little Zhulong"]')!.disabled).toBe(true);
 await act(()=>document.querySelector<HTMLButtonElement>('[aria-label="Equip Little Bixi"]')!.click());
 const emit=vi.fn();dispatch.mock.calls[0][0].message.send(emit);expect(emit).toHaveBeenCalledWith('equipFriend',{id:'bixi'});
 await act(()=>[...document.querySelectorAll('button')].find(b=>b.textContent==='BACK TO DOJO')!.click());expect(exit).toHaveBeenCalledOnce();
});


it('main menu equips a buddy without attaching it to the player or regular fights',async()=>{
 vi.useFakeTimers();
 const initial=applyLogin(parseProfile({diamondWins:8}),now);initial.seenNotice=initial.last.n;
 function Session(){const [p,setP]=useState(initial);return <GameHud profileData={JSON.stringify(p)} boardData="[]" boardId="local" dispatch={e=>e.message.send((kind,raw)=>setP(old=>applyAction(old,kind,raw,now)))}/>;}
 const el=document.createElement('main');document.body.append(el);root=createRoot(el);await act(()=>root!.render(<Session/>));
 const click=async(text:string)=>{const b=[...document.querySelectorAll('button')].find(b=>b.textContent?.includes(text));expect(b,text).toBeDefined();await act(()=>b!.click());};
 await click('FRIENDS');expect(document.querySelector('[aria-label="Mythic Friends"]')).not.toBeNull();
 await act(()=>document.querySelector<HTMLButtonElement>('[aria-label="Equip Little Bixi"]')!.click());
 await click('BACK TO DOJO');expect(document.querySelector('[data-friend]')).toBeNull();
 await click('ENDLESS TOWER');expect(document.querySelector('[data-friend]')).toBeNull();
});
