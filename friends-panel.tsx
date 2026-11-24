import {useState,useEffect,useRef} from "react";
import {createPortal} from 'react-dom';
import {FRIENDS} from './friends';
import {FriendArt,FRIEND_ABILITIES} from './friend-art';
import type {Profile} from './economy';
import type {DojoEvent} from './net';
export function EquippedFriend({p,compact=false}:{p:Profile;compact?:boolean}){
 const friend=FRIENDS.find(f=>f.id===p.companion&&p.diamondWins>=f.wins);
 return friend?<div aria-label="Your equipped friend" style={{display:'flex',alignItems:'center',justifyContent:'center',gap:8}}><FriendArt friend={friend} size={compact?80:100}/>{!compact&&<span>{friend.name} · Cosmetic companion</span>}</div>:null;
}
export function FriendsPanel({p,dispatch,onClose}:{p:Profile;dispatch(e:DojoEvent):void;onClose():void}){
 const [preview,setPreview]=useState<typeof FRIENDS[number]|null>(null);
 const previewButton=useRef<HTMLButtonElement|null>(null);
 const closePreview=()=>{setPreview(null);previewButton.current?.focus();};
 useEffect(()=>{if(!preview)return;const escape=(e:KeyboardEvent)=>{if(e.key==='Escape'){e.stopPropagation();closePreview();}};window.addEventListener('keydown',escape);return()=>window.removeEventListener('keydown',escape);},[preview]);
 const equip=(id:string)=>dispatch({type:'dojo.send',message:{send:emit=>emit('equipFriend',{id})}});
 const content=<section className="expansion-screen" aria-label="Mythic Friends" style={{position:'fixed',inset:0,zIndex:500,overflowY:'auto',padding:24,boxSizing:'border-box',background:'#171324',color:'#fff0d2',fontFamily:'Georgia,serif'}}>
 <header inert={preview?true:undefined} style={{display:'flex',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}><h1>MYTHIC FRIENDS</h1><button onClick={onClose}>BACK TO DOJO</button></header>
 <p>Win fights to befriend these little guardians. No coins, diamonds or random boxes needed. Cosmetic only: no combat bonuses.</p>
 <p role="status">{p.diamondWins} qualifying fight wins · {FRIENDS.filter(f=>p.diamondWins>=f.wins).length}/{FRIENDS.length} friends unlocked. Ladder, Tower, Daily, rescue and Challenge Dojo wins count, using your saved diamond-win counter. Losses do not erase progress. Older wins from before that counter existed are not added.</p>
 <p>Playful adaptations inspired by Chinese folklore, including the Dragon Gate, river dragons and legendary guardians; not a literal reconstruction of any one ancient text.</p>
 {preview&&<section role="dialog" aria-modal="true" aria-label={`${preview.name} ability preview`} style={{position:'fixed',inset:0,zIndex:550,overflowY:'auto',padding:16,boxSizing:'border-box',background:'#100c1def'}}>
 <div className="friend-preview-panel" key={preview.id}><button autoFocus onClick={closePreview}>BACK TO FRIENDS</button><h2>{preview.name}</h2>
 <div className="friend-preview-stage"><FriendArt friend={preview} size={300} ability/></div>
 <h3>{FRIEND_ABILITIES[preview.id].name}</h3><p>{FRIEND_ABILITIES[preview.id].detail}</p><p>Cosmetic ability showcase only — no damage, buffs, purchases or changes to your equipped friend. Reduced motion displays a still pose and effect.</p>
 <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>{FRIENDS.map(f=><button key={f.id} aria-pressed={preview.id===f.id} onClick={()=>setPreview(f)}>{f.name}</button>)}</div>
 </div></section>}
 <div inert={preview?true:undefined}>
 <button disabled={!p.companion} onClick={()=>equip('')}>UNEQUIP FRIEND</button>
 <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:14,marginTop:16}}>{FRIENDS.map(friend=>{
 const owned=p.diamondWins>=friend.wins,selected=p.companion===friend.id;
 return <article key={friend.id} style={{padding:16,border:`2px solid ${selected?'#7de1b1':owned?friend.color:'#555'}`,borderRadius:14,background:'#292238',textAlign:'center'}}>
 <div className="friend-card-art"><FriendArt friend={friend} size={170}/></div><h2 style={{fontSize:19}}>{friend.name}</h2><p style={{fontSize:14,lineHeight:1.5}}>{friend.lore}</p>
 <p><strong>{FRIEND_ABILITIES[friend.id].name}</strong> · Cosmetic ability</p>
 <button aria-label={`Preview ${friend.name}`} onClick={e=>{previewButton.current=e.currentTarget;setPreview(friend);}}>PREVIEW ABILITY</button>
 <p>{friend.wins} fight wins{!owned&&` · ${friend.wins-p.diamondWins} to go`}</p>
 <button disabled={!owned||selected} aria-label={`${selected?'Equipped':owned?'Equip':'Locked'} ${friend.name}`} onClick={()=>equip(friend.id)}>{selected?'EQUIPPED':owned?'EQUIP FRIEND':'KEEP WINNING TO UNLOCK'}</button>
 </article>;
 })}</div></div></section>;
 return typeof document==='undefined'?content:createPortal(content,document.body);
}
