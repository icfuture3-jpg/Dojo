import {createPortal} from 'react-dom';
import {FRIENDS} from './friends';
import {FriendArt} from './friend-art';
import type {Profile} from './economy';
import type {DojoEvent} from './net';
export function EquippedFriend({p,compact=false}:{p:Profile;compact?:boolean}){
 const friend=FRIENDS.find(f=>f.id===p.companion&&p.diamondWins>=f.wins);
 return friend?<div aria-label="Your equipped friend" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><FriendArt friend={friend} size={compact?64:80}/>{!compact&&<span>{friend.name} · Cosmetic companion</span>}</div>:null;
}
export function FriendsPanel({p,dispatch,onClose}:{p:Profile;dispatch(e:DojoEvent):void;onClose():void}){
 const equip=(id:string)=>dispatch({type:'dojo.send',message:{send:emit=>emit('equipFriend',{id})}});
 const content=<section className="expansion-screen" aria-label="Mythic Friends" style={{position:'fixed',inset:0,zIndex:500,overflowY:'auto',padding:24,boxSizing:'border-box',background:'#171324',color:'#fff0d2',fontFamily:'Georgia,serif'}}>
 <header style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><h1>MYTHIC FRIENDS</h1><button onClick={onClose}>BACK TO DOJO</button></header>
 <p>Win fights to befriend these little guardians. No coins, diamonds or random boxes needed. Cosmetic only: no combat bonuses.</p>
 <p role="status">{p.diamondWins} qualifying fight wins · {FRIENDS.filter(f=>p.diamondWins>=f.wins).length}/{FRIENDS.length} friends unlocked. Ladder, Tower, Daily, rescue and Challenge Dojo wins count, using your saved diamond-win counter. Losses do not erase progress. Older wins from before that counter existed are not added.</p>
 <p>Playful adaptations inspired by Chinese folklore, including the Dragon Gate, river dragons and legendary guardians; not a literal reconstruction of any one ancient text.</p>
 <button disabled={!p.companion} onClick={()=>equip('')}>UNEQUIP FRIEND</button>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginTop:16}}>{FRIENDS.map(friend=>{
 const owned=p.diamondWins>=friend.wins,selected=p.companion===friend.id;
 return <article key={friend.id} style={{padding:16,border:`2px solid ${selected?'#7de1b1':owned?friend.color:'#555'}`,borderRadius:14,background:'#292238',textAlign:'center'}}>
 <FriendArt friend={friend}/><h2 style={{fontSize:19}}>{friend.name}</h2><p style={{fontSize:14,lineHeight:1.5}}>{friend.lore}</p>
 <p>{friend.wins} fight wins{!owned&&` · ${friend.wins-p.diamondWins} to go`}</p>
 <button disabled={!owned||selected} aria-label={`${selected?'Equipped':owned?'Equip':'Locked'} ${friend.name}`} onClick={()=>equip(friend.id)}>{selected?'EQUIPPED':owned?'EQUIP FRIEND':'KEEP WINNING TO UNLOCK'}</button>
 </article>;
 })}</div></section>;
 return typeof document==='undefined'?content:createPortal(content,document.body);
}
