import { useCallback, useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { GameHud } from './hud';
import { applyAction } from './actions';
import { loadSave, saveProfile, SAVE_KEY, BACKUP_KEY, type SaveStorage } from './saves';
import { parseProfile, profileSchema, type Profile } from './economy';
import type { DojoEvent } from './net';

function browserStorage(): SaveStorage | null {
  try { return window.localStorage; } catch { return null; }
}
export function App() {
  const [loaded] = useState(() => loadSave(browserStorage(), Date.now()));
  const [profile, setProfile] = useState(loaded.profile);
  const [saveError, setSaveError] = useState('');
  const [canSave,setCanSave]=useState(loaded.canSave);
  const [retry, setRetry] = useState(0);
  const [saveTools,setSaveTools]=useState(false);
  const [candidate,setCandidate]=useState<Profile|null>(null);
  const [toolMessage,setToolMessage]=useState('');
  const [conflict,setConflict]=useState(false);
  const conflictRef=useRef(false);
  useEffect(()=>{const changed=(event:StorageEvent)=>{if(event.key===SAVE_KEY){conflictRef.current=true;setConflict(true);setSaveError('Another tab changed this save. Automatic writes stopped. Export this session, then reload to use the other tab’s save.');}};window.addEventListener('storage',changed);return()=>window.removeEventListener('storage',changed);},[]);
  useEffect(() => {
    if (!canSave || conflictRef.current) return;
    setSaveError(saveProfile(browserStorage(), profile) ?? '');
  }, [profile, retry, canSave]);
  const dispatch = useCallback((event: DojoEvent) => event.message.send((kind, raw) => {
    // Read time/randomness outside React's updater so a replay stays deterministic.
    const now = Date.now();
    const random = (kind === 'openBox' || kind === 'academy') ? Math.random() : 0;
    setProfile(previous => applyAction(previous, kind, raw, now, random));
  }), []);
  const exportSave = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url; link.download = 'dojo-progress.json'; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const board = [{ id: 'local', name: profile.name || 'You (this device)', rp: profile.rp, wins: profile.stats.won }];
  const warning = saveError || loaded.warning;
  return <>
    <GameHud onSaveTools={()=>setSaveTools(true)} dispatch={dispatch} profileData={JSON.stringify(profile)} boardData={JSON.stringify(board)} boardId="local" />
    {saveTools && <section className="expansion-screen" style={{zIndex:900}} aria-label="Save tools"><header className="expansion-header"><h1>SAVE TOOLS</h1><button onClick={()=>setSaveTools(false)}>BACK TO DOJO</button></header><p>Progress is stored on this device. Export a backup before importing another save. Import replaces this session only after you confirm.</p><button onClick={exportSave}>EXPORT PROGRESS</button><label style={{display:'block',margin:'24px 0'}}>Choose a saved JSON file<input aria-label="Import save file" type="file" accept="application/json,.json" onChange={async e=>{const file=e.target.files?.[0];setCandidate(null);if(!file)return;if(file.size>2000000){setToolMessage('Save exceeds 2 MB.');return;}try{const raw=JSON.parse(await file.text());if(!raw||typeof raw!=='object'||Array.isArray(raw)||!['coins','xp','owned'].every(k=>k in raw)||raw.saveVersion>4||!profileSchema.safeParse({...raw,saveVersion:4}).success){setToolMessage('This file is not a compatible complete save. Your progress has not changed.');return;}const next=parseProfile(raw);setCandidate(next);setToolMessage(`Ready to import ${next.name||'fighter'}: ${next.coins} coins, ${next.xp} XP. Existing progress will be replaced.`);}catch{setToolMessage('Invalid JSON. Your progress has not changed.');}}}/></label><button onClick={()=>{try{const text=browserStorage()?.getItem(BACKUP_KEY);if(!text)throw new Error();const raw=JSON.parse(text);if(raw.saveVersion>4||!profileSchema.safeParse({...raw,saveVersion:4}).success)throw new Error();setCandidate(parseProfile(raw));setToolMessage('Previous backup loaded for review. Confirm to replace this session.');}catch{setToolMessage('No valid previous backup is available.');}}}>REVIEW PREVIOUS BACKUP</button><p role="status">{toolMessage}</p>{candidate&&<button disabled={conflict} onClick={()=>{const error=saveProfile(browserStorage(),candidate);if(error){setToolMessage(error);return;}setCanSave(true);setProfile(candidate);setCandidate(null);setToolMessage('Imported and saved. Previous valid data remains in the backup.');}}>CONFIRM REPLACE WITH THIS SAVE</button>}{conflict&&<button onClick={()=>window.location.reload()}>RELOAD SAVED PROGRESS</button>}</section>}
    {warning && <aside role="status" aria-label="Save status" style={{ position: 'fixed', top: 8, left: 8, right: 8, zIndex: 1000, padding: 12, borderRadius: 8, background: '#392014', color: '#fff5d5', border: '2px solid #e9b34c', font: '14px/1.4 system-ui', maxHeight: '35dvh', overflow: 'auto' }}>
      <div>{warning}</div>
      {canSave && saveError && !conflict && <button type="button" onClick={() => setRetry(n => n + 1)} style={{ margin: '8px 8px 0 0', minHeight: 44 }}>RETRY SAVE</button>}
      <button type="button" onClick={exportSave} style={{ marginTop: 8, minHeight: 44 }}>EXPORT THIS SESSION</button>
    </aside>}
  </>;
}
createRoot(document.getElementById('root')!).render(<App />);
