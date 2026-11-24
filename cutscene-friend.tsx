import {FriendArt} from './friend-art';
import type {Friend} from './friends';
import './cutscene-friend.css';

/** A scenery companion, never part of the fighter's transformed body. */
export function CutsceneFriend({friend}:{friend?:Friend}){
 if(!friend)return null;
 return <div className="cutscene-friend-background" aria-label={`${friend.name}, your equipped cutscene friend`}>
  <div className="cutscene-friend-perch"><FriendArt friend={friend} size={120} animated/></div>
 </div>;
}
